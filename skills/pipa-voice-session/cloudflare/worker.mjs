const encoder = new TextEncoder();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const baseUrl = (env.PUBLIC_BASE_URL || `${url.protocol}//${url.host}`).replace(/\/$/, "");

    if (request.method === "GET" && url.pathname === "/healthz") {
      return json({ ok: true, runtime: "cloudflare-workers", sessions: "durable-objects" });
    }

    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      return html(indexHtml());
    }

    if (request.method === "POST" && url.pathname === "/api/sessions") {
      return createSession(env, baseUrl);
    }

    const sessionPage = url.pathname.match(/^\/s\/([^/]+)$/);
    if (request.method === "GET" && sessionPage) {
      const id = env.VOICE_SESSION.idFromName(sessionPage[1]);
      const status = await env.VOICE_SESSION.get(id).fetch("https://voice-session/internal/status");
      const body = await status.json().catch(() => ({}));
      if (!status.ok || body.gone) return html(goneSessionHtml(), status.status === 404 ? 404 : 410);
      return html(hostedSessionHtml(sessionPage[1]));
    }

    const websocket = url.pathname.match(/^\/ws\/([^/]+)$/);
    if (websocket) {
      const id = env.VOICE_SESSION.idFromName(websocket[1]);
      return env.VOICE_SESSION.get(id).fetch(request);
    }

    return json({ ok: false, error: "Not found" }, 404);
  }
};

export class VoiceSession {
  constructor(ctx, env) {
    this.ctx = ctx;
    this.env = env;
    this.sockets = new Map();
    this.invalidFrames = new Map();
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "POST" && url.pathname === "/internal/init") {
      const session = await request.json();
      await this.ctx.storage.put("session", session);
      await this.ctx.storage.setAlarm(Math.min(session.pairingExpiresAt, session.lastActivityAt + session.idleTimeoutMs));
      return json({ ok: true });
    }

    if (request.method === "GET" && url.pathname === "/internal/status") {
      const session = await this.ctx.storage.get("session");
      if (!session) return json({ ok: false, gone: true, state: "missing" }, 404);
      if (sessionRevoked(session, this.env)) return json({ ok: false, gone: true, state: "revoked" }, 410);
      if (session.endedAt) return json({ ok: false, gone: true, state: session.state || "ended" }, 410);
      if (!this.isPaired() && Date.now() > session.pairingExpiresAt) {
        await this.expire(session, "Expired. Start a new session.");
        return json({ ok: false, gone: true, state: "expired" }, 410);
      }
      return json({ ok: true, gone: false, state: this.state(session) });
    }

    const match = url.pathname.match(/^\/ws\/([^/]+)$/);
    if (!match || request.headers.get("Upgrade") !== "websocket") {
      return json({ ok: false, error: "Expected WebSocket upgrade" }, 426);
    }

    const session = await this.ctx.storage.get("session");
    if (!session || session.id !== match[1]) return json({ ok: false, error: "Unknown session" }, 404);
    if (sessionRevoked(session, this.env)) return json({ ok: false, error: "Session no longer exists" }, 410);
    if (session.endedAt) return json({ ok: false, error: "Session ended" }, 410);

    const auth = authFromProtocols(request.headers.get("Sec-WebSocket-Protocol"));
    if (auth.sessionId !== session.id || !["browser", "bridge"].includes(auth.role)) return json({ ok: false, error: "Invalid credentials" }, 401);
    if (await sha256(auth.token || "") !== session[auth.role].tokenHash) return json({ ok: false, error: "Invalid credentials" }, 401);
    if (!this.isPaired() && Date.now() > session.pairingExpiresAt) return this.expire(session, "Pairing expired");
    if (!originAllowed(request.headers.get("Origin"), this.env)) return json({ ok: false, error: "Origin not allowed" }, 403);
    if (this.sockets.has(auth.role)) return json({ ok: false, error: `${auth.role} already connected` }, 409);

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    server.accept();
    this.sockets.set(auth.role, server);
    this.invalidFrames.set(auth.role, 0);

    server.addEventListener("message", (event) => this.handleMessage(auth.role, event.data));
    server.addEventListener("close", () => this.detach(auth.role));
    server.addEventListener("error", () => this.detach(auth.role));

    await this.touch(session);
    return new Response(null, { status: 101, webSocket: client, headers: { "Sec-WebSocket-Protocol": "pipa-relay" } });
  }

  async handleMessage(role, data) {
    const session = await this.ctx.storage.get("session");
    if (!session || session.endedAt) return;

    const parsed = parseMessage(data, Number(this.env.MAX_MESSAGE_BYTES || 32_000));
    if (!parsed.ok) return this.invalid(role, parsed.error);

    const valid = validate(role, parsed.message, session);
    if (!valid.ok) return this.invalid(role, valid.error);

    const message = valid.message;
    if (message.type === "end") {
      session.endedAt = Date.now();
      session.state = "ended";
      await this.ctx.storage.put("session", session);
      this.send("browser", { type: "end", message: "The hosted voice session ended." });
      this.send("bridge", { type: "end", message: "The hosted voice session ended." });
      return this.closeAll(1000, "ended");
    }

    const other = role === "browser" ? "bridge" : "browser";
    if (!this.sockets.has(other)) {
      await this.touch(session);
      if (message.type === "status") return this.send(role, { type: "status", state: session.state, message: label(session.state) });
      return this.send(role, { type: "error", message: `Waiting for ${other} to join.` });
    }

    if (message.type === "user_turn") session.activeTurnId = message.turn_id;
    if (message.type === "assistant_reply" || (role === "bridge" && message.type === "error")) session.activeTurnId = "";

    await this.touch(session);
    this.send(other, message);
  }

  async detach(role) {
    this.sockets.delete(role);
    this.invalidFrames.delete(role);
    const session = await this.ctx.storage.get("session");
    if (session && !session.endedAt) await this.touch(session);
  }

  async alarm() {
    const session = await this.ctx.storage.get("session");
    if (!session || session.endedAt) return;
    const now = Date.now();
    if ((!this.isPaired() && now >= session.pairingExpiresAt) || now - session.lastActivityAt >= session.idleTimeoutMs) {
      await this.expire(session, "Expired. Start a new session.");
      return;
    }
    await this.ctx.storage.setAlarm(Math.min(session.pairingExpiresAt, session.lastActivityAt + session.idleTimeoutMs));
  }

  isPaired() {
    return this.sockets.has("browser") && this.sockets.has("bridge");
  }

  state(session) {
    if (session.endedAt) return session.state;
    if (session.activeTurnId) return "active_turn";
    if (this.sockets.has("browser") && this.sockets.has("bridge")) return "paired";
    if (this.sockets.has("browser")) return "browser_waiting";
    if (this.sockets.has("bridge")) return "bridge_waiting";
    return "created";
  }

  async touch(session) {
    session.lastActivityAt = Date.now();
    session.state = this.state(session);
    await this.ctx.storage.put("session", session);
    await this.ctx.storage.setAlarm(Math.min(session.pairingExpiresAt, session.lastActivityAt + session.idleTimeoutMs));
    this.broadcast({ type: "status", state: session.state, message: label(session.state) });
  }

  async expire(session, message) {
    session.endedAt = Date.now();
    session.state = "expired";
    await this.ctx.storage.put("session", session);
    this.broadcast({ type: "status", state: "expired", message });
    this.closeAll(1000, "expired");
    return json({ ok: false, error: message }, 410);
  }

  invalid(role, message) {
    const count = (this.invalidFrames.get(role) || 0) + 1;
    this.invalidFrames.set(role, count);
    this.send(role, { type: "error", message });
    if (count >= 3) this.sockets.get(role)?.close(1008, "too many invalid frames");
  }

  send(role, message) {
    const socket = this.sockets.get(role);
    if (socket?.readyState === WebSocket.READY_STATE_OPEN) socket.send(JSON.stringify(message));
  }

  broadcast(message) {
    this.send("browser", message);
    this.send("bridge", message);
  }

  closeAll(code, reason) {
    for (const socket of this.sockets.values()) socket.close(code, reason);
    this.sockets.clear();
  }
}

async function createSession(env, baseUrl) {
  const id = randomToken(12);
  const browserToken = randomToken(32);
  const bridgeToken = randomToken(32);
  const now = Date.now();
  const pairingTtlMs = Number(env.PAIRING_TTL_SECONDS || 900) * 1000;
  const idleTimeoutMs = Number(env.IDLE_TIMEOUT_SECONDS || 600) * 1000;
  const pairingExpiresAt = now + pairingTtlMs;
  const session = {
    id,
    state: "created",
    createdAt: now,
    lastActivityAt: now,
    pairingExpiresAt,
    idleTimeoutMs,
    activeTurnId: "",
    browser: { tokenHash: await sha256(browserToken), pairingExpiresAt },
    bridge: { tokenHash: await sha256(bridgeToken), pairingExpiresAt }
  };

  const object = env.VOICE_SESSION.get(env.VOICE_SESSION.idFromName(id));
  await object.fetch("https://voice-session/internal/init", { method: "POST", body: JSON.stringify(session) });

  return json({
    session_id: id,
    browser_url: `${baseUrl}/s/${encodeURIComponent(id)}#token=${encodeURIComponent(browserToken)}`,
    relay_ws_url: `${baseUrl.replace(/^http/, "ws")}/ws/${encodeURIComponent(id)}`,
    idle_timeout_seconds: Math.floor(idleTimeoutMs / 1000),
    browser: { role: "browser", token: browserToken, pairing_expires_at: new Date(pairingExpiresAt).toISOString() },
    bridge: { role: "bridge", token: bridgeToken, pairing_expires_at: new Date(pairingExpiresAt).toISOString() }
  }, 201);
}

function parseMessage(data, maxBytes) {
  if (typeof data !== "string") return { ok: false, error: "Binary relay frames are not accepted" };
  if (encoder.encode(data).byteLength > maxBytes) return { ok: false, error: "Relay message is too large" };
  try {
    const message = JSON.parse(data);
    if (!message || typeof message !== "object" || Array.isArray(message)) return { ok: false, error: "Relay message must be a JSON object" };
    return { ok: true, message };
  } catch (_error) {
    return { ok: false, error: "Relay message must be valid JSON" };
  }
}

function validate(role, message, session) {
  const allowed = role === "browser" ? ["user_turn", "interrupt", "end"] : ["assistant_reply", "status", "error", "end"];
  if (!allowed.includes(message.type)) return { ok: false, error: "Relay message type is not allowed for this role" };
  if (["exec", "command", "shell", "rpc", "tool"].some((key) => key in message)) return { ok: false, error: "Command-like relay messages are not allowed" };
  if (message.type === "user_turn") {
    if (session.activeTurnId) return { ok: false, error: "A hosted voice turn is already in flight" };
    if (!message.turn_id || typeof message.turn_id !== "string") return { ok: false, error: "user_turn requires turn_id" };
    if (!message.text || typeof message.text !== "string") return { ok: false, error: "user_turn requires text" };
    return { ok: true, message: { type: "user_turn", turn_id: message.turn_id.slice(0, 200), text: message.text.slice(0, 16_000) } };
  }
  if (message.type === "assistant_reply") {
    if (!session.activeTurnId || message.turn_id !== session.activeTurnId) return { ok: false, error: "assistant_reply does not match an active hosted turn" };
    return { ok: true, message: { type: "assistant_reply", turn_id: message.turn_id, text: String(message.text || "").slice(0, 16_000) } };
  }
  if (message.type === "status" || message.type === "error") return { ok: true, message: { type: message.type, message: String(message.message || "").slice(0, 1_000) } };
  return { ok: true, message: { type: message.type } };
}

function authFromProtocols(header) {
  const protocols = String(header || "").split(",").map((item) => item.trim());
  const value = (prefix) => protocols.find((item) => item.startsWith(prefix))?.slice(prefix.length) || "";
  return { role: value("pipa-role."), sessionId: value("pipa-session."), token: value("pipa-token.") };
}

function originAllowed(origin, env) {
  if (!origin) return true;
  const allowed = String(env.ALLOWED_ORIGINS || env.PUBLIC_BASE_URL || "").split(",").map((item) => item.trim()).filter(Boolean);
  return !allowed.length || allowed.includes(origin);
}

function randomToken(bytes) {
  const values = new Uint8Array(bytes);
  crypto.getRandomValues(values);
  return base64Url(values);
}

async function sha256(value) {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return base64Url(new Uint8Array(digest));
}

function base64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function label(state) {
  return {
    created: "Waiting for browser and local bridge",
    browser_waiting: "Waiting for local bridge",
    bridge_waiting: "Waiting for browser to join",
    paired: "Paired",
    active_turn: "Sending to OpenCode",
    expired: "Expired. Start a new session.",
    ended: "Ended"
  }[state] || state;
}

function sessionRevoked(session, env) {
  const cutoff = Number(env.REVOKE_SESSIONS_BEFORE_UNIX_MS || 0);
  return Boolean(cutoff && Number(session.createdAt || 0) <= cutoff);
}

function goneSessionHtml() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pipa Voice Session Ended</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:680px;margin:64px auto;padding:0 24px;line-height:1.6;color:#2d2a25;background:#fbfaf7}.muted{color:#706b61}</style></head><body><p class="muted">Hosted relay</p><h1>This voice session does not exist anymore.</h1><p>Start a new voice session to continue with your agent.</p></body></html>`;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}

function html(body, status = 200) {
  return new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}

function indexHtml() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Pipa Voice Relay</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:720px;margin:64px auto;padding:0 24px;line-height:1.6;color:#2b2926;background:#fbfaf7}code{background:#efede7;padding:2px 5px;border-radius:6px}</style></head><body><h1>Pipa Voice Relay</h1><p>Start a session from your repo:</p><p><code>node skills/pipa-voice-session/scripts/start-voice-session.mjs --hosted</code></p><p>Each session gets its own <code>/s/&lt;session-id&gt;</code> URL.</p></body></html>`;
}

function sessionHtml(sessionId) {
  const safeSessionId = JSON.stringify(sessionId.replace(/[<>&"']/g, ""));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Pipa Voice Session</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:760px;margin:48px auto;padding:0 24px 120px;line-height:1.6;color:#2d2a25;background:#fbfaf7}button,textarea{font:inherit}button{cursor:pointer}textarea{width:100%;min-height:96px}.orb{width:160px;height:160px;border-radius:999px;border:1px solid #ded8cc;background:#f1efe8;margin:24px 0}.muted{color:#706b61}.turn{border-top:1px solid #ded8cc;padding-top:12px;margin-top:12px;white-space:pre-wrap}</style></head><body><p class="muted">Hosted relay</p><h1>Talk to your agent.</h1><p id="detail">Connecting to relay...</p><button class="orb" id="start" disabled>Speak</button><p><button id="speaker">Test speaker</button> <button id="clear">Clear</button></p><details><summary>Text input</summary><textarea id="text"></textarea><p><button id="send" disabled>Send</button></p></details><div id="turns"></div><p class="muted">Browser speech may use browser, OS, or vendor speech services. The relay forwards final text turns and replies without retaining message bodies by default.</p><script>const sessionId=${safeSessionId};const params=new URLSearchParams(location.hash.slice(1));const token=params.get("token");const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;const wsUrl=(location.protocol==="https:"?"wss://":"ws://")+location.host+"/ws/"+encodeURIComponent(sessionId);const state={ws:null,paired:false,busy:false,turnSeq:0,turns:[]};const $=id=>document.getElementById(id);const els={detail:$("detail"),start:$("start"),speaker:$("speaker"),clear:$("clear"),text:$("text"),send:$("send"),turns:$("turns")};function esc(v){return String(v).replace(/[&<>\"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\\\"":"&quot;"})[c])}function add(role,text){state.turns.push({role,text});els.turns.innerHTML=state.turns.map(t=>'<div class="turn"><strong>'+esc(t.role)+'</strong><br>'+esc(t.text)+'</div>').join('')}function ready(v){els.start.disabled=!v;els.send.disabled=!v}function status(v){els.detail.textContent=v}function speak(text){if(!speechSynthesis)return;speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text))}function submit(text){const clean=text.trim();if(!clean||!state.paired||state.busy)return;const turn_id='browser-'+Date.now()+'-'+(++state.turnSeq);state.busy=true;ready(false);add('You',clean);status('Sending to local bridge...');state.ws.send(JSON.stringify({type:'user_turn',turn_id,text:clean}))}function listen(){if(!SpeechRecognition){status('Speech unavailable. Use text input.');return}let final='';let interim='';const r=new SpeechRecognition();r.continuous=true;r.interimResults=true;r.onresult=e=>{interim='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript.trim();if(e.results[i].isFinal)final=(final+' '+t).trim();else interim=(interim+' '+t).trim()}status('Heard: '+(final+' '+interim).trim())};r.onend=()=>submit((final+' '+interim).trim());r.start()}function connect(){if(!token){status('Missing session token. Start a new session.');return}state.ws=new WebSocket(wsUrl,['pipa-relay','pipa-role.browser','pipa-session.'+sessionId,'pipa-token.'+token]);state.ws.onopen=()=>status('Waiting for local bridge...');state.ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.type==='status'){state.paired=m.state==='paired'||m.state==='active_turn';if(state.paired&&!state.busy){ready(true);status('Paired. Speak or type a turn.')}else status(m.message||'Waiting...')}if(m.type==='assistant_reply'){state.busy=false;ready(true);add('OpenCode',m.text);status('Speaking reply.');speak(m.text)}if(m.type==='error'){state.busy=false;ready(state.paired);add('System','Blocked: '+m.message);status(m.message)}if(m.type==='end'){ready(false);status('Session ended.')}};state.ws.onclose=()=>{state.paired=false;ready(false);status('Connection closed. Refresh before sending more.')}}els.start.onclick=listen;els.send.onclick=()=>{submit(els.text.value);els.text.value=''};els.speaker.onclick=()=>speak('Speaker test.');els.clear.onclick=()=>{state.turns=[];els.turns.innerHTML=''};connect()</script></body></html>`;
}

function hostedSessionHtml(sessionId) {
  const safeSessionId = JSON.stringify(sessionId.replace(/[<>&"']/g, ""));
  return String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pipa Voice Session</title>
    <style>
      :root {
        color-scheme: light;
        --page: oklch(0.985 0.006 75);
        --surface: oklch(0.965 0.008 75);
        --surface-raised: oklch(0.992 0.004 75);
        --ink: oklch(0.235 0.012 65);
        --muted: oklch(0.52 0.012 65);
        --line: oklch(0.88 0.008 75);
        --accent: oklch(0.58 0.13 42);
        --accent-soft: oklch(0.82 0.08 42);
        --bad: oklch(0.52 0.13 28);
        --control: oklch(0.28 0.014 65);
        --control-hover: oklch(0.34 0.014 65);
      }

      * { box-sizing: border-box; }
      html { background: var(--page); }
      body {
        margin: 0;
        min-height: 100vh;
        background: var(--page);
        color: var(--ink);
        font-family: ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.65;
        -webkit-font-smoothing: antialiased;
      }

      button, textarea, select { font: inherit; }
      button { cursor: pointer; }
      button:focus-visible, textarea:focus-visible, select:focus-visible { outline: 2px solid var(--control); outline-offset: 2px; }
      main { max-width: 720px; margin: 0 auto; padding: 56px 24px 140px; }
      .top { position: sticky; top: 0; z-index: 10; display: flex; justify-content: space-between; gap: 16px; align-items: center; padding: 14px 0; margin-bottom: 36px; border-bottom: 1px solid var(--line); background: var(--page); }
      .brand, .session-kind { font-size: 13px; color: var(--muted); letter-spacing: .02em; font-weight: 500; }
      header { margin-bottom: 44px; }
      .eyebrow { margin: 0 0 10px; color: var(--muted); font-size: 12px; font-weight: 400; letter-spacing: .01em; }
      h1 { margin: 0 0 14px; max-width: 16ch; font-size: 32px; font-weight: 700; line-height: 1.2; letter-spacing: -.01em; }
      .lede { margin: 0; max-width: 64ch; color: var(--muted); font-size: 16px; }

      .stage { display: grid; grid-template-columns: 128px minmax(0, 1fr); gap: 26px; align-items: center; margin: 0 0 42px; padding: 24px 0 30px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
      .orb { width: 128px; aspect-ratio: 1; border: 1px solid var(--line); border-radius: 999px; background: var(--surface); color: var(--ink); display: grid; place-items: center; position: relative; box-shadow: 0 1px 0 oklch(0.992 0.004 75 / .5) inset; transition: background 180ms cubic-bezier(.22, 1, .36, 1), border-color 180ms cubic-bezier(.22, 1, .36, 1), transform 180ms cubic-bezier(.22, 1, .36, 1); }
      .orb::before { content: ""; position: absolute; inset: 28px; border-radius: inherit; background: var(--accent-soft); opacity: .38; transform: scale(.92); transition: transform 180ms cubic-bezier(.22, 1, .36, 1), opacity 180ms cubic-bezier(.22, 1, .36, 1); }
      .orb:not([disabled]):hover { border-color: oklch(0.78 0.014 75); background: var(--surface-raised); transform: translateY(-1px); }
      .orb[disabled] { opacity: .62; cursor: not-allowed; }
      .orb.is-live::before { opacity: .88; transform: scale(1.08); }
      .bars { position: relative; z-index: 1; display: flex; align-items: center; gap: 6px; height: 52px; }
      .bars span { display: block; width: 10px; height: 24px; border-radius: 999px; background: var(--accent); opacity: .86; transform-origin: center; }
      .bars span:nth-child(2) { height: 42px; }
      .bars span:nth-child(3) { height: 22px; }
      .bars span:nth-child(4) { height: 36px; }
      .bars span:nth-child(5) { height: 48px; }
      .orb.is-live .bars span { animation: voiceBars 820ms ease-in-out infinite; }
      .orb.is-live .bars span:nth-child(2) { animation-delay: 80ms; }
      .orb.is-live .bars span:nth-child(3) { animation-delay: 160ms; }
      .orb.is-live .bars span:nth-child(4) { animation-delay: 240ms; }
      .orb.is-live .bars span:nth-child(5) { animation-delay: 320ms; }
      @keyframes voiceBars { 0%,100% { transform: scaleY(.55); opacity: .65; } 50% { transform: scaleY(1.18); opacity: 1; } }
      @media (prefers-reduced-motion: reduce) { .orb.is-live .bars span { animation: none; } }

      .status { max-width: 54ch; }
      .status strong { display: block; font-size: 22px; line-height: 1.25; letter-spacing: -.01em; }
      .status p { margin: 6px 0 0; color: var(--muted); font-size: 15px; }
      .reply-preview { display: none; margin-top: 16px; max-width: 58ch; border-top: 1px solid var(--line); padding-top: 14px; }
      .reply-preview.is-visible { display: block; }
      .reply-preview span { display: block; margin-bottom: 5px; color: var(--muted); font-size: 12px; font-weight: 500; letter-spacing: .02em; }
      .reply-preview p { margin: 0; color: var(--ink); font-size: 15px; line-height: 1.55; white-space: pre-wrap; }
      .actions { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-top: 18px; }
      .secondary, .quiet, .send, .voice-select { border: 1px solid var(--line); border-radius: 10px; background: transparent; color: var(--ink); min-height: 38px; padding: 8px 12px; font-size: 13px; font-weight: 500; transition: background 160ms cubic-bezier(.22, 1, .36, 1), border-color 160ms cubic-bezier(.22, 1, .36, 1); }
      .secondary:hover, .quiet:hover, .voice-select:hover { border-color: oklch(0.78 0.014 75); background: var(--surface); }
      .quiet { color: var(--muted); }
      .send { background: var(--control); color: var(--page); border-color: var(--control); border-radius: 999px; padding-inline: 16px; }
      .send:hover { background: var(--control-hover); border-color: var(--control-hover); }
      .send:disabled, .secondary:disabled { opacity: .55; cursor: not-allowed; }
      .voice-control { display: flex; align-items: center; gap: 8px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface-raised); padding: 4px 5px 4px 10px; }
      .voice-control span { color: var(--muted); font-size: 12px; letter-spacing: .02em; text-transform: none; }
      .voice-select { max-width: min(48vw, 260px); padding-right: 28px; background: var(--surface-raised); }

      details { border-top: 1px solid var(--line); padding: 22px 0; }
      summary { cursor: pointer; font-size: 18px; font-weight: 650; letter-spacing: -.01em; }
      textarea { width: 100%; min-height: 112px; margin-top: 14px; resize: vertical; border: 1px solid var(--line); border-radius: 12px; background: var(--surface-raised); color: var(--ink); padding: 14px; line-height: 1.5; }
      .transcript { display: grid; gap: 12px; margin-top: 16px; }
      .turn { border-top: 1px solid var(--line); padding: 13px 0 0; }
      .turn strong { display: block; margin-bottom: 4px; color: var(--muted); font-size: 12px; font-weight: 500; letter-spacing: .02em; }
      .turn p { margin: 0; white-space: pre-wrap; }
      .small { margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--line); color: var(--muted); font-size: 12px; line-height: 1.5; }
      @media (max-width: 640px) {
        main { padding: 32px 18px 110px; }
        .top { margin-bottom: 28px; }
        header { margin-bottom: 34px; }
        h1 { font-size: 30px; }
        .stage { grid-template-columns: 1fr; gap: 18px; justify-items: start; padding: 22px 0 28px; }
        .orb { width: 116px; }
        .voice-control { width: 100%; }
        .voice-select { max-width: none; flex: 1; min-width: 0; }
      }
    </style>
  </head>
  <body>
    <main>
      <nav class="top" aria-label="Session">
        <strong class="brand">Pipa Voice Session</strong>
        <span class="session-kind">Hosted relay</span>
      </nav>

      <header>
        <p class="eyebrow">Voice huddle</p>
        <h1>Start a huddle with your agent.</h1>
        <p class="lede">Speak one complete turn, then pause. Pipa routes the final text through your local bridge and reads back a short browser-speech reply with low memory overhead.</p>
      </header>

      <section class="stage" aria-live="polite">
        <button class="orb" id="start" type="button" aria-label="Start listening" disabled>
          <span class="bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></span>
        </button>
        <div>
          <div class="status">
            <strong id="status">Connecting to relay...</strong>
            <p id="detail">Waiting for the local bridge to pair.</p>
          </div>
          <div class="reply-preview" id="replyPreview">
            <span>Agent is saying</span>
            <p id="currentReply"></p>
          </div>
          <div class="actions">
            <label class="voice-control"><span>Voice</span><select class="voice-select" id="voice"><option value="">System default</option></select></label>
            <button class="secondary" id="speaker" type="button">Test speaker</button>
            <button class="quiet" id="clear" type="button">Clear transcript</button>
          </div>
        </div>
      </section>

      <details>
        <summary>Text input if speech is unavailable</summary>
        <textarea id="text" placeholder="Type a turn. This uses the same relay and local bridge."></textarea>
        <p><button class="send" id="send" type="button" disabled>Send to bridge</button></p>
      </details>

      <details open>
        <summary>Transcript</summary>
        <div class="transcript" id="turns"></div>
      </details>

      <p class="small">Browser speech is the default because it is low-memory, quick to start, and less likely to fail in small sandboxes. It may use browser, OS, or vendor speech services. The relay forwards final text turns and replies without retaining message bodies by default. OpenCode local session history may persist final text turns according to local behavior.</p>
    </main>

    <script>
      const sessionId = ${safeSessionId};
      const params = new URLSearchParams(location.hash.slice(1));
      const token = params.get("token");
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const wsUrl = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws/" + encodeURIComponent(sessionId);
      const state = { ws:null, paired:false, busy:false, listening:false, recognition:null, finalTranscript:"", interimTranscript:"", turns:[], turnSeq:0, voices:[] };
      const $ = (id) => document.getElementById(id);
      const els = { status:$("status"), detail:$("detail"), replyPreview:$("replyPreview"), currentReply:$("currentReply"), start:$("start"), speaker:$("speaker"), clear:$("clear"), voice:$("voice"), text:$("text"), send:$("send"), turns:$("turns") };

      function escapeHtml(value) { return String(value).replace(/[&<>"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;" })[char]); }
      function render() { els.turns.innerHTML = state.turns.map((turn) => '<div class="turn"><strong>' + escapeHtml(turn.role) + '</strong><p>' + escapeHtml(turn.text) + '</p></div>').join(""); els.turns.scrollTop = els.turns.scrollHeight; }
      function addTurn(role, text) { state.turns.push({ role, text }); render(); }
      function setStatus(status, detail) { els.status.textContent = status; els.detail.textContent = detail; }
      function setCurrentReply(text) { els.currentReply.textContent = text || ""; els.replyPreview.classList.toggle("is-visible", Boolean(text)); }
      function setReady(ready) { els.start.disabled = !ready; els.send.disabled = !ready; }
      function setLive(live) { els.start.classList.toggle("is-live", live); }
      function send(message) { if (state.ws?.readyState === WebSocket.OPEN) state.ws.send(JSON.stringify(message)); }
      function selectedVoice() { return state.voices.find((voice) => voice.name === els.voice.value) || null; }
      function defaultVoiceName(voices) { return voices.find((voice) => /daniel/i.test(voice.name))?.name || voices.find((voice) => /en[-_]/i.test(voice.lang))?.name || voices[0]?.name || ""; }
      function loadVoices() {
        if (!window.speechSynthesis) return;
        state.voices = window.speechSynthesis.getVoices().slice().sort((a, b) => a.name.localeCompare(b.name));
        if (!state.voices.length) return;
        const saved = localStorage.getItem("pipa.voice.name") || "";
        const selected = state.voices.some((voice) => voice.name === saved) ? saved : defaultVoiceName(state.voices);
        els.voice.innerHTML = state.voices.map((voice) => '<option value="' + escapeHtml(voice.name) + '">' + escapeHtml(voice.name + (voice.lang ? ' · ' + voice.lang : '')) + '</option>').join("");
        els.voice.value = selected;
      }
      function speak(text) {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = selectedVoice();
        if (voice) utterance.voice = voice;
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
      }
      function currentTranscript() { return (state.finalTranscript + " " + state.interimTranscript).trim(); }

      function submit(text) {
        const clean = text.trim();
        if (!clean || !state.paired || state.busy) return;
        const turn_id = "browser-" + Date.now() + "-" + (++state.turnSeq);
        state.busy = true;
        setReady(false);
        setCurrentReply("Waiting for OpenCode to answer...");
        addTurn("You", clean);
        addTurn("System", "Sending turn to local bridge...");
        setStatus("Sending to OpenCode", "The local bridge is handling this turn.");
        send({ type:"user_turn", turn_id, text:clean });
      }

      function stopListening(shouldSubmit) {
        const text = currentTranscript();
        state.listening = false;
        setLive(false);
        state.finalTranscript = "";
        state.interimTranscript = "";
        try { state.recognition?.stop(); } catch (_error) {}
        state.recognition = null;
        if (shouldSubmit && text) submit(text);
        else if (state.paired && !state.busy) setStatus("Paired", "Press the orb for another voice turn.");
      }

      function listen() {
        if (state.listening) return stopListening(true);
        if (!SpeechRecognition) { setStatus("Speech unavailable", "Use text input. The relay path is still available."); addTurn("System", "SpeechRecognition is unavailable. Use text input."); return; }
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        state.recognition = recognition;
        state.finalTranscript = "";
        state.interimTranscript = "";
        recognition.onstart = () => { state.listening = true; setLive(true); setStatus("Listening", "Speak one complete turn, then pause or press again to send."); };
        recognition.onresult = (event) => {
          let interim = "";
          for (let index = event.resultIndex; index < event.results.length; index += 1) {
            const transcript = event.results[index][0].transcript.trim();
            if (!transcript) continue;
            if (event.results[index].isFinal) state.finalTranscript = (state.finalTranscript + " " + transcript).trim();
            else interim = (interim + " " + transcript).trim();
          }
          state.interimTranscript = interim;
          const heard = currentTranscript();
          if (heard) setStatus("Listening", "Heard: " + heard);
        };
        recognition.onerror = (event) => { setLive(false); setStatus("Listening failed", "Use text input below. " + (event.error || "")); addTurn("System", "Speech recognition failed. Use text input to keep going."); };
        recognition.onend = () => { if (state.listening) stopListening(true); };
        recognition.start();
      }

      function connect() {
        if (!token) { setStatus("Expired", "This link is missing session credentials. Start a new session."); return; }
        state.ws = new WebSocket(wsUrl, ["pipa-relay", "pipa-role.browser", "pipa-session." + sessionId, "pipa-token." + token]);
        state.ws.onopen = () => setStatus("Waiting for local bridge", "Keep the bridge command running on the machine with OpenCode.");
        state.ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === "status") {
            state.paired = message.state === "paired" || message.state === "active_turn";
            if (state.paired && !state.busy) { setReady(true); setStatus(message.message || "Paired", "Press the orb to huddle. Browser speech keeps the session light and reliable."); }
            else if (message.state === "expired" || message.state === "ended") { setReady(false); setStatus(message.message, "Start a new session."); }
            else setStatus(message.message || "Waiting", "Waiting for the other side of the relay.");
          }
          if (message.type === "assistant_reply") {
            state.busy = false;
            setReady(true);
            setCurrentReply(message.text);
            addTurn("OpenCode", message.text);
            setStatus("Speaking", "Reading the reply aloud now.");
            speak(message.text);
          }
          if (message.type === "error") { state.busy = false; setReady(state.paired); addTurn("System", "Blocked: " + message.message); setStatus("Blocked", message.message); }
          if (message.type === "end") { setReady(false); setStatus("Ended", message.message || "This session has ended."); }
        };
        state.ws.onclose = () => { state.paired = false; setReady(false); setStatus("Reconnecting", "The relay connection closed. Refresh before sending more turns."); };
      }

      els.start.addEventListener("click", listen);
      els.send.addEventListener("click", () => { submit(els.text.value); els.text.value = ""; });
      els.speaker.addEventListener("click", () => speak("Huddle speaker test. Browser speech is working."));
      els.voice.addEventListener("change", () => localStorage.setItem("pipa.voice.name", els.voice.value));
      els.clear.addEventListener("click", () => { window.speechSynthesis?.cancel(); state.turns = []; setCurrentReply(""); render(); });
      loadVoices();
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = loadVoices;
      connect();
    </script>
  </body>
</html>`;
}
