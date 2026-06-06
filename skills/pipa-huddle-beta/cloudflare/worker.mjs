import { hostedSessionHtml as hostedSessionPageHtml } from "./hosted-session-template.mjs";

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
      return html(hostedSessionPageHtml(sessionPage[1]));
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
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pipa Voice Session Ended</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:680px;margin:64px auto;padding:0 24px;line-height:1.6;color:#2d2a25;background:#fbfaf7}.muted{color:#706b61}</style></head><body><p class="muted">Hosted relay</p><h1>The session is disconnected.</h1><p>To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill</p></body></html>`;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}

function html(body, status = 200) {
  return new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
}

function indexHtml() {
  return String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pipa Huddle</title>
    <style>
      :root { color-scheme: light; --page:#fbfaf7; --ink:#2b2926; --muted:#706b61; --line:#e5dfd2; --soft:#efede7; }
      * { box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; max-width: 760px; margin: 0 auto; padding: clamp(44px, 10vw, 88px) 24px 96px; line-height: 1.6; color: var(--ink); background: var(--page); }
      h1 { margin: 0 0 18px; font-size: clamp(42px, 12vw, 72px); line-height: 1.02; letter-spacing: -.045em; }
      h2 { margin: 0 0 10px; font-size: 22px; letter-spacing: -.02em; }
      p { margin: 0 0 18px; font-size: 18px; color: #514d45; }
      ol { margin: 12px 0 0; padding-left: 22px; }
      li { margin: 10px 0; color: #514d45; font-size: 17px; }
      code { font-family: "SFMono-Regular", Consolas, monospace; }
      .eyebrow { margin: 0 0 14px; color: var(--muted); font-size: 13px; font-weight: 650; letter-spacing: .08em; text-transform: uppercase; }
      .lede { max-width: 35rem; }
      .section { margin-top: 34px; padding-top: 28px; border-top: 1px solid var(--line); }
      .command { display: block; margin: 14px 0 18px; padding: 14px 16px; border-radius: 16px; background: var(--soft); font-size: 15px; line-height: 1.5; white-space: pre-wrap; overflow-wrap: anywhere; }
      .inline-code { display: inline-block; padding: 2px 6px; border-radius: 7px; background: var(--soft); font-size: .9em; }
      .note { font-size: 15px; color: var(--muted); }
    </style>
  </head>
  <body>
    <p class="eyebrow">Hosted voice huddle</p>
    <h1>Pipa Huddle</h1>
    <p class="lede">Pipa Huddle lets you talk through work out loud with an agent. Right now it works with Pipa or OpenCode by pairing this hosted browser page with a local OpenCode bridge.</p>

    <div class="section">
      <h2>If you use Pipa</h2>
      <p>Ask Pipa to start a huddle. Pipa will route to the <code class="inline-code">pipa-huddle-beta</code> skill, create a short-lived session link, and connect the local bridge for you.</p>
    </div>

    <div class="section">
      <h2>If you want to try it with OpenCode</h2>
      <p>Paste this into your OpenCode agent:</p>
      <code class="command">Install the Pipa Huddle Beta skill with:

npx skills add lunchpaillola/pipa-skills --skill pipa-huddle-beta

Then follow the instructions in skills/pipa-huddle-beta/SKILL.md to start a hosted huddle.</code>
      <ol>
        <li>The agent installs the single skill.</li>
        <li>The agent starts the local bridge from your repo.</li>
        <li>This site gives you a private <code class="inline-code">/s/&lt;session-id&gt;</code> link for the browser.</li>
      </ol>
      <p class="note">Session links expire when unused or idle. The relay forwards final text turns and replies; it does not keep raw audio by default.</p>
    </div>
  </body>
</html>`;
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
    <title>Pipa Huddle</title>
    <style>
      :root {
        color-scheme: light;
        --page: oklch(0.99 0.002 250);
        --surface: oklch(0.965 0.003 250);
        --raised: oklch(0.985 0.002 250);
        --ink: oklch(0.18 0.004 250);
        --muted: oklch(0.50 0.006 250);
        --quiet: oklch(0.66 0.005 250);
        --line: oklch(0.86 0.004 250);
        --orb-light: oklch(0.78 0.10 272);
        --orb-mid: oklch(0.64 0.13 282);
        --orb-deep: oklch(0.47 0.14 274);
        --orb-warm: oklch(0.78 0.11 24);
        --orb-peach: oklch(0.86 0.10 58);
        --danger: #bd4035;
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
      button { cursor: pointer; border: 0; background: transparent; color: inherit; }
      main { width: min(720px, calc(100vw - 32px)); margin: 0 auto; padding: 0 0 128px; }
      .top { position: sticky; top: 0; z-index: 10; height: 52px; display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid var(--line); background: var(--page); }
      .brand { font-size: 14px; font-weight: 700; letter-spacing: -.02em; color: var(--ink); }
      .session-kind { font-size: 12px; color: var(--muted); }
      .stage { min-height: calc(100vh - 52px); display: grid; place-items: center; text-align: center; padding: 26px 0 110px; }
      .status-label { margin: 0 0 28px; color: var(--muted); font-size: 12px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; }
      .orb { --orb-size: clamp(210px, 58vw, 320px); width: var(--orb-size); aspect-ratio: 1; border-radius: 50%; position: relative; display: grid; place-items: center; margin: 0 auto 38px; background: radial-gradient(circle at 32% 14%, rgba(249,250,255,.34) 0%, transparent 30%), radial-gradient(circle at 72% 76%, rgba(255,177,143,.46) 0%, transparent 34%), radial-gradient(ellipse 120% 78% at 52% 104%, var(--orb-peach) 0%, var(--orb-warm) 28%, transparent 58%), radial-gradient(ellipse 115% 120% at 48% 0%, var(--orb-light) 0%, var(--orb-mid) 48%, var(--orb-deep) 90%); box-shadow: 0 30px 90px rgba(80,78,170,.16); overflow: hidden; }
      .orb::before { content: ""; position: absolute; inset: 0; border-radius: inherit; background-image: radial-gradient(circle, rgba(255,255,255,.34) 1px, transparent 1.5px); background-size: 10px 10px; opacity: .55; mix-blend-mode: overlay; }
      .orb::after { content: ""; position: absolute; inset: -14%; border-radius: inherit; border: 1px solid rgba(31,45,230,.12); transform: scale(.95); opacity: 0; transition: opacity 180ms ease, transform 180ms ease; }
      .orb.is-live::after { opacity: 1; transform: scale(1); animation: pulseOrb 1.8s ease-in-out infinite; }
      .orb[disabled] { opacity: .72; cursor: not-allowed; }
      .bars { display: none; }
      @keyframes pulseOrb { 0%,100% { transform: scale(.98); opacity:.42; } 50% { transform: scale(1.05); opacity:.16; } }
      .status { max-width: 620px; margin: 0 auto; }
      .status strong { display: none; }
      .status p { margin: 0; color: var(--muted); font-size: clamp(20px, 5vw, 32px); font-style: italic; line-height: 1.45; }
      .reply-preview { display: none; margin: 22px auto 0; max-width: 58ch; }
      .reply-preview.is-visible { display: block; }
      .reply-preview span { display: block; margin-bottom: 5px; color: var(--muted); font-size: 12px; font-weight: 500; letter-spacing: .02em; }
      .reply-preview p { margin: 0; color: var(--ink); font-size: 15px; line-height: 1.55; white-space: pre-wrap; }
      .actions { position: fixed; left: 50%; bottom: 22px; transform: translateX(-50%); z-index: 20; display: flex; gap: 14px; align-items: center; justify-content: center; padding: 10px 12px; border-radius: 28px; background: color-mix(in oklch, var(--page) 82%, white); box-shadow: 0 18px 70px rgba(16,24,40,.08); backdrop-filter: blur(14px); }
      .secondary, .quiet, .send, .voice-select { border: 0; border-radius: 20px; background: var(--raised); color: var(--ink); min-height: 52px; padding: 0 16px; font-size: 13px; font-weight: 600; }
      .quiet { color: var(--muted); }
      .quiet#end { background: var(--danger); color: white; }
      .send { background: var(--ink); color: var(--page); border-radius: 999px; padding-inline: 18px; }
      .send:disabled, .secondary:disabled { opacity: .55; cursor: not-allowed; }
      .voice-control { display: flex; align-items: center; gap: 8px; border-radius: 18px; background: var(--raised); padding: 4px 5px 4px 10px; }
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
        main { width: min(100vw - 28px, 720px); }
        .stage { padding-top: 18px; }
        .actions { width: min(92vw, 520px); gap: 8px; }
        .secondary, .quiet, .send, .voice-select { min-height: 48px; padding-inline: 12px; }
        .voice-control span { display: none; }
        .voice-select { max-width: 110px; }
      }
    </style>
  </head>
  <body>
    <main>
      <nav class="top" aria-label="Session">
        <strong class="brand">Pipa Huddle</strong>
        <span class="session-kind">Hosted relay</span>
      </nav>

      <section class="stage" aria-live="polite">
        <div>
          <p class="status-label">Ready</p>
          <button class="orb" id="start" type="button" aria-label="Start listening" disabled>
            <span class="bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></span>
          </button>
          <div class="status">
            <strong id="status">Connecting to relay...</strong>
            <p id="detail">Waiting for the local bridge to pair.</p>
          </div>
          <div class="reply-preview" id="replyPreview">
            <span>Agent is saying</span>
            <p id="currentReply"></p>
          </div>
        </div>
      </section>

      <div class="actions">
        <label class="voice-control"><span>Voice</span><select class="voice-select" id="voice"><option value="">System default</option></select></label>
        <button class="secondary" id="speaker" type="button">Test</button>
        <button class="quiet" id="clear" type="button">Clear</button>
        <button class="quiet" id="end" type="button">End</button>
      </div>

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
      const state = { ws:null, paired:false, busy:false, listening:false, ended:false, recognition:null, finalTranscript:"", interimTranscript:"", turns:[], turnSeq:0, voices:[] };
      const $ = (id) => document.getElementById(id);
      const els = { status:$("status"), detail:$("detail"), replyPreview:$("replyPreview"), currentReply:$("currentReply"), start:$("start"), speaker:$("speaker"), clear:$("clear"), end:$("end"), voice:$("voice"), text:$("text"), send:$("send"), turns:$("turns") };

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
      function speak(text, onDone) {
        if (!window.speechSynthesis) { if (onDone) window.setTimeout(onDone, 250); return; }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voice = selectedVoice();
        if (voice) utterance.voice = voice;
        utterance.rate = 1;
        if (onDone) { utterance.onend = onDone; utterance.onerror = onDone; }
        window.speechSynthesis.speak(utterance);
      }
      function currentTranscript() { return (state.finalTranscript + " " + state.interimTranscript).trim(); }

      function submit(text) {
        const clean = text.trim();
        if (!clean || !state.paired || state.busy || state.ended) return;
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
        if (state.ended) { setReady(false); setLive(false); setStatus("Disconnected", "The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill"); return; }
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
        if (!token) { state.ended = true; setReady(false); setStatus("Disconnected", "This link is missing session credentials. Ask your agent to follow the pipa-huddle-beta skill for a new URL."); return; }
        state.ws = new WebSocket(wsUrl, ["pipa-relay", "pipa-role.browser", "pipa-session." + sessionId, "pipa-token." + token]);
        state.ws.onopen = () => setStatus("Waiting for local bridge", "Keep the bridge command running on the machine with OpenCode.");
        state.ws.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type === "status") {
            state.paired = message.state === "paired" || message.state === "active_turn";
            if (state.paired && !state.busy) { setReady(true); setStatus(message.message || "Paired", "Press the orb to huddle. Browser speech keeps the session light and reliable."); }
            else if (message.state === "expired" || message.state === "ended") { state.ended = true; setReady(false); setLive(false); setStatus(message.message || "Disconnected", "The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill"); }
            else setStatus(message.message || "Waiting", "Waiting for the other side of the relay.");
          }
          if (message.type === "assistant_reply") {
            state.busy = false;
            setReady(true);
            setCurrentReply(message.text);
            addTurn("OpenCode", message.text);
            setStatus("Speaking", "Reading the reply aloud now.");
            speak(message.text, () => { if (state.paired && !state.busy && !state.ended) listen(); });
          }
          if (message.type === "error") { state.busy = false; setReady(state.paired); addTurn("System", "Blocked: " + message.message); setStatus("Blocked", message.message); }
          if (message.type === "end") { state.ended = true; setReady(false); setLive(false); setStatus("Disconnected", message.message || "This session has ended. Tell your agent to follow the pipa-huddle-beta skill for a new URL."); }
        };
        state.ws.onclose = () => { state.paired = false; setReady(false); setLive(false); if (!state.ended) setStatus("Disconnected", "The relay or local bridge is no longer available. Tell your agent to follow the pipa-huddle-beta skill for a new URL."); };
      }

      function endSession() {
        state.ended = true;
        state.paired = false;
        state.busy = false;
        window.speechSynthesis?.cancel();
        try { state.recognition?.stop(); } catch (_error) {}
        send({ type:"end" });
        try { state.ws?.close(1000, "ended"); } catch (_error) {}
        setReady(false);
        setLive(false);
        setStatus("Disconnected", "The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill");
      }

      els.start.addEventListener("click", listen);
      els.send.addEventListener("click", () => { submit(els.text.value); els.text.value = ""; });
      els.speaker.addEventListener("click", () => speak("Huddle speaker test. Browser speech is working."));
      els.end.addEventListener("click", endSession);
      els.voice.addEventListener("change", () => localStorage.setItem("pipa.voice.name", els.voice.value));
      els.clear.addEventListener("click", () => { window.speechSynthesis?.cancel(); state.turns = []; setCurrentReply(""); render(); });
      loadVoices();
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = loadVoices;
      connect();
    </script>
  </body>
</html>`;
}
