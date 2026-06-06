#!/usr/bin/env node

import { createServer } from "node:http";
import { WebSocketServer } from "ws";

import {
  parseRelayFrame,
  publicSessionPackage,
  redactForLog,
  validateRelayMessage,
  createRelayStore
} from "./relay-protocol.mjs";
import { hostedSessionHtml } from "../cloudflare/hosted-session-template.mjs";

const port = Number(process.env.PIPA_VOICE_RELAY_PORT || 8788);
const host = process.env.PIPA_VOICE_RELAY_HOST || "127.0.0.1";
const publicBaseUrl = (process.env.PIPA_VOICE_RELAY_PUBLIC_BASE_URL || `http://${host}:${port}`).replace(/\/$/, "");
const allowedOrigins = new Set((process.env.PIPA_VOICE_RELAY_ALLOWED_ORIGINS || publicBaseUrl).split(",").map((item) => item.trim()).filter(Boolean));
const disabled = /^(1|true|yes)$/i.test(process.env.PIPA_VOICE_RELAY_DISABLED || "");
const printSession = /^(1|true|yes)$/i.test(process.env.PIPA_VOICE_RELAY_PRINT_SESSION || "") || /^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(publicBaseUrl);
const allowQueryToken = /^(1|true|yes)$/i.test(process.env.PIPA_VOICE_RELAY_ALLOW_QUERY_TOKEN || "");
const operatorToken = process.env.PIPA_VOICE_RELAY_OPERATOR_TOKEN || "";
const maxMessageBytes = Number(process.env.PIPA_VOICE_RELAY_MAX_MESSAGE_BYTES || 32_000);
const pairingTtlMs = Number(process.env.PIPA_VOICE_RELAY_PAIRING_TTL_SECONDS || 900) * 1000;
const idleTimeoutMs = Number(process.env.PIPA_VOICE_RELAY_IDLE_TIMEOUT_SECONDS || 600) * 1000;
const maxSessions = Number(process.env.PIPA_VOICE_RELAY_MAX_SESSIONS || 100);
const maxInvalidFrames = Number(process.env.PIPA_VOICE_RELAY_MAX_INVALID_FRAMES || 3);
const maxMessagesPerWindow = Number(process.env.PIPA_VOICE_RELAY_MAX_MESSAGES_PER_WINDOW || 30);
const rateWindowMs = Number(process.env.PIPA_VOICE_RELAY_RATE_WINDOW_SECONDS || 10) * 1000;
const store = createRelayStore({ maxSessions });
const sockets = new Map();
const messageWindows = new Map();

function log(event, fields = {}) {
  console.log(JSON.stringify({ event, at: new Date().toISOString(), ...redactForLog(fields) }));
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer"
  });
  res.end(JSON.stringify(body));
}

function sendHtml(res, html) {
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer"
  });
  res.end(html);
}

function createSession() {
  if (disabled) return { ok: false, code: "relay_disabled", error: "Hosted relay is disabled" };
  const session = store.createSession({ pairingTtlMs, idleTimeoutMs });
  if (session.ok === false) return session;
  log("session_created", { session_id: session.id, pairing_expires_at: new Date(session.pairingExpiresAt).toISOString(), idle_timeout_seconds: Math.floor(idleTimeoutMs / 1000) });
  return { ok: true, session, package: publicSessionPackage(session, publicBaseUrl) };
}

function sessionStateMessage(state) {
  const labels = {
    created: "Waiting for browser and local bridge",
    browser_waiting: "Waiting for local bridge",
    bridge_waiting: "Waiting for browser",
    paired: "Paired",
    active_turn: "Sending to OpenCode",
    degraded: "Reconnecting",
    expired: "Expired. Start a new session.",
    ended: "Ended"
  };
  return labels[state] || state;
}

function sendSocket(ws, message) {
  if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(message));
}

function sendState(session) {
  for (const role of ["browser", "bridge"]) {
    const connectionId = session.connections[role];
    const ws = sockets.get(connectionId);
    if (ws) sendSocket(ws, { type: "status", state: session.state, message: sessionStateMessage(session.state) });
  }
}

function counterpart(role) {
  return role === "browser" ? "bridge" : "browser";
}

function rateAllowed(connectionId) {
  const now = Date.now();
  const window = messageWindows.get(connectionId) || { start: now, count: 0 };
  if (now - window.start > rateWindowMs) {
    window.start = now;
    window.count = 0;
  }
  window.count += 1;
  messageWindows.set(connectionId, window);
  return window.count <= maxMessagesPerWindow;
}

function protocolValue(header, prefix) {
  return String(header || "").split(",").map((item) => item.trim()).find((item) => item.startsWith(prefix))?.slice(prefix.length) || "";
}

function authFromUpgrade(req, url) {
  const protocols = req.headers["sec-websocket-protocol"] || "";
  return {
    role: protocolValue(protocols, "pipa-role.") || (allowQueryToken ? url.searchParams.get("role") : ""),
    sessionId: protocolValue(protocols, "pipa-session.") || (allowQueryToken ? url.searchParams.get("session_id") : ""),
    token: protocolValue(protocols, "pipa-token.") || (allowQueryToken ? url.searchParams.get("token") : "")
  };
}

function devIndexHtml() {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pipa Huddle Dev Relay</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;max-width:680px;margin:64px auto;padding:0 24px;line-height:1.6;color:#2d2a25;background:#fbfaf7}.muted{color:#706b61}code{background:#efede7;border-radius:6px;padding:2px 5px}</style></head><body><p class="muted">Development relay</p><h1>Pipa Huddle relay is running.</h1><p>Create a session with <code>POST /api/sessions</code>, then open the returned <code>/s/&lt;session-id&gt;#token=...</code> browser URL.</p></body></html>`;
}

function hasOperatorAccess(req) {
  if (!operatorToken) return false;
  const authorization = String(req.headers.authorization || "");
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const headerToken = String(req.headers["x-pipa-relay-operator-token"] || "");
  return bearer === operatorToken || headerToken === operatorToken;
}

const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/healthz") {
    sendJson(res, 200, { ok: true, disabled, active_sessions: store.sessions.size });
    return;
  }
  if (req.method === "GET" && (req.url === "/" || req.url === "/session" || req.url === "/index.html")) {
    sendHtml(res, devIndexHtml());
    return;
  }
  const sessionPage = String(req.url || "").match(/^\/s\/([^/#?]+)/);
  if (req.method === "GET" && sessionPage) {
    sendHtml(res, hostedSessionHtml(decodeURIComponent(sessionPage[1])));
    return;
  }
  if (req.method === "POST" && req.url === "/api/sessions") {
    if (!hasOperatorAccess(req)) {
      sendJson(res, 401, { ok: false, error: "Session creation requires operator authorization" });
      log("session_create_rejected", { reason: "missing_operator_auth" });
      return;
    }
    const created = createSession();
    sendJson(res, created.ok ? 201 : 503, created.ok ? created.package : created);
    return;
  }
  sendJson(res, 404, { ok: false, error: "Not found" });
});

const wss = new WebSocketServer({ noServer: true, perMessageDeflate: false, maxPayload: maxMessageBytes, handleProtocols: () => "pipa-relay" });

server.on("upgrade", (req, socket, head) => {
  const url = new URL(req.url || "", publicBaseUrl);
  if (url.pathname !== "/ws") {
    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    socket.destroy();
    log("upgrade_rejected", { reason: "unknown_path" });
    return;
  }

  const origin = req.headers.origin;
  if (origin && allowedOrigins.size && !allowedOrigins.has(origin)) {
    socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
    socket.destroy();
    log("upgrade_rejected", { reason: "invalid_origin", origin });
    return;
  }

  const { role, sessionId, token } = authFromUpgrade(req, url);
  const auth = store.authenticate({ sessionId, role, token });
  if (!auth.ok) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    log("upgrade_rejected", { reason: auth.code, session_id: sessionId, role });
    return;
  }

  wss.handleUpgrade(req, socket, head, (ws) => wss.emit("connection", ws, req, { role, sessionId, token }));
});

wss.on("connection", (ws, _req, auth) => {
  const connectionId = `${auth.role}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const attached = store.attachConnection({ ...auth, connectionId });
  if (!attached.ok) {
    sendSocket(ws, { type: "error", message: attached.error });
    ws.close(1008, attached.code);
    log("connection_rejected", { reason: attached.code, session_id: auth.sessionId, role: auth.role });
    return;
  }

  sockets.set(connectionId, ws);
  ws.isAlive = true;
  ws.on("pong", () => { ws.isAlive = true; });
  log("connection_attached", { session_id: auth.sessionId, role: auth.role, state: attached.state });
  sendState(attached.session);

  ws.on("message", (data, isBinary) => {
    if (!rateAllowed(connectionId)) {
      sendSocket(ws, { type: "error", message: "Relay rate limit reached. Pause before sending another turn." });
      log("rate_limited", { session_id: auth.sessionId, role: auth.role });
      return;
    }

    const session = store.getSession(auth.sessionId);
    if (!session || session.endedAt) {
      sendSocket(ws, { type: "error", message: "This hosted voice session expired or ended. Start a new session." });
      ws.close(1008, "session unavailable");
      log("message_rejected", { session_id: auth.sessionId, role: auth.role, reason: "session_unavailable" });
      return;
    }
    const parsed = parseRelayFrame(isBinary ? Buffer.from(data) : data.toString(), { maxMessageBytes });
    if (!parsed.ok) return invalidFrame(ws, session, auth, parsed);

    const validation = validateRelayMessage(auth.role, parsed.message, {
      maxTextBytes: maxMessageBytes,
      activeTurnId: session?.activeTurnId,
      seenTurnIds: session?.seenTurnIds
    });
    if (!validation.ok) return invalidFrame(ws, session, auth, validation);

    const message = validation.message;
    const otherRole = counterpart(auth.role);
    const otherSocket = sockets.get(session.connections[otherRole]);
    if (message.type === "end") {
      store.endSession(auth.sessionId, `${auth.role} ended`);
      sendSocket(otherSocket, { type: "end", message: "The hosted voice session ended." });
      sendSocket(ws, { type: "end", message: "The hosted voice session ended." });
      log("session_ended", { session_id: auth.sessionId, role: auth.role });
      return;
    }
    if (!otherSocket) {
      sendSocket(ws, { type: "error", message: `Waiting for ${otherRole} to reconnect.` });
      return;
    }
    if (message.type === "user_turn") {
      const begin = store.beginTurn(auth.sessionId, message.turn_id);
      if (!begin.ok) return invalidFrame(ws, session, auth, begin);
      sendState(begin.session);
    }
    if (message.type === "assistant_reply") {
      const finished = store.finishTurn(auth.sessionId, message.turn_id);
      if (!finished.ok) return invalidFrame(ws, session, auth, finished);
    }
    if (message.type === "error" && auth.role === "bridge" && session.activeTurnId) {
      store.finishTurn(auth.sessionId, session.activeTurnId);
    }
    sendSocket(otherSocket, message);
    sendState(session);
  });

  ws.on("close", () => {
    sockets.delete(connectionId);
    messageWindows.delete(connectionId);
    const detached = store.detachConnection(auth.sessionId, auth.role, connectionId);
    if (detached.ok) {
      log("connection_detached", { session_id: auth.sessionId, role: auth.role, state: detached.state });
      sendState(detached.session);
    }
  });
});

function invalidFrame(ws, session, auth, result) {
  if (session) session.invalidFrames += 1;
  sendSocket(ws, { type: "error", message: result.error || "Invalid relay message" });
  log("invalid_frame", { session_id: auth.sessionId, role: auth.role, reason: result.code });
  if (session?.invalidFrames >= maxInvalidFrames) ws.close(1008, "too many invalid frames");
}

const heartbeat = setInterval(() => {
  for (const ws of wss.clients) {
    if (ws.isAlive === false) {
      ws.terminate();
      continue;
    }
    ws.isAlive = false;
    ws.ping();
  }
  store.cleanupExpired();
}, 15_000);

const initial = createSession();
server.listen(port, host, () => {
  console.log(`Pipa hosted relay: http://${host}:${port}`);
  console.log(`Public base URL: ${publicBaseUrl}`);
  console.log(`Allowed origins: ${allowedOrigins.size ? [...allowedOrigins].join(", ") : "none configured"}`);
  if (initial.ok && printSession) {
    console.log(`Browser voice session: ${initial.package.browser_url}`);
    console.log("Local bridge environment:");
    console.log(`PIPA_VOICE_RELAY_URL=${publicBaseUrl.replace(/^http/, "ws")}/ws`);
    console.log(`PIPA_VOICE_RELAY_SESSION_ID=${initial.package.session_id}`);
    console.log(`PIPA_VOICE_RELAY_BRIDGE_TOKEN=${initial.package.bridge.token}`);
    console.log("PIPA_VOICE_SESSION_OPENCODE_RESTRICTED_ARGS=<optional supported opencode run args>");
  } else if (initial.ok) {
    console.log("Initial relay session created. Credentials are not printed because this does not look like local development.");
    console.log("Create a new session through POST /api/sessions from a trusted control plane or local operator channel.");
  } else {
    console.log(`Relay disabled: ${initial.error}`);
  }
});

function shutdown() {
  clearInterval(heartbeat);
  for (const ws of wss.clients) ws.close(1001, "server shutting down");
  server.close(() => process.exit(0));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
