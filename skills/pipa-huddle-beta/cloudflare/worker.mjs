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
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pipa Huddle Ended</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:680px;margin:64px auto;padding:0 24px;line-height:1.6;color:#2d2a25;background:#fbfaf7}.muted{color:#706b61}</style></head><body><p class="muted">Hosted relay</p><h1>The session is disconnected.</h1><p>To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill</p></body></html>`;
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
