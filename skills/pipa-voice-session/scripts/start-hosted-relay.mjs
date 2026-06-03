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

function hasOperatorAccess(req) {
  if (!operatorToken) return false;
  const authorization = String(req.headers.authorization || "");
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const headerToken = String(req.headers["x-pipa-relay-operator-token"] || "");
  return bearer === operatorToken || headerToken === operatorToken;
}

function hostedHtml() {
  return String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pipa Hosted Voice Session</title>
    <style>
      :root { color-scheme: light; --page:oklch(0.985 0.006 75); --surface:oklch(0.965 0.008 75); --ink:oklch(0.235 0.012 65); --muted:oklch(0.52 0.012 65); --line:oklch(0.88 0.008 75); --accent:oklch(0.58 0.13 42); --accent-soft:oklch(0.82 0.08 42); --bad:oklch(0.52 0.13 28); }
      * { box-sizing:border-box; }
      body { margin:0; min-height:100vh; background:var(--page); color:var(--ink); font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height:1.65; -webkit-font-smoothing:antialiased; }
      button, textarea { font:inherit; } button { cursor:pointer; }
      main { max-width:760px; margin:0 auto; padding:48px 24px 150px; }
      nav.top { position:sticky; top:0; background:var(--page); padding:12px 0; border-bottom:1px solid var(--line); z-index:10; margin-bottom:34px; }
      nav.top strong { font-size:13px; color:var(--muted); letter-spacing:.02em; }
      .source-label { font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin:0 0 8px; }
      h1 { margin:0 0 12px; color:var(--ink); font-size:30px; font-weight:650; line-height:1.22; letter-spacing:-.025em; }
      .subtitle { max-width:65ch; margin:0; color:var(--muted); font-size:15px; line-height:1.5; }
      .voice-stage { display:grid; justify-items:center; gap:18px; padding:30px 0 36px; border-bottom:1px solid var(--line); }
      .orb-button { width:190px; height:190px; border:1px solid var(--line); border-radius:999px; background:var(--surface); color:var(--ink); display:grid; place-items:center; position:relative; box-shadow:0 18px 60px oklch(0.35 0.03 65 / .12); }
      .orb-button::before { content:""; position:absolute; inset:18px; border-radius:inherit; background:oklch(0.92 0.035 42); opacity:.65; transform:scale(.92); transition:transform 220ms ease-out, opacity 220ms ease-out; }
      .orb-button:focus-visible { outline:3px solid var(--accent-soft); outline-offset:5px; }
      .bars { position:relative; z-index:1; display:flex; align-items:center; gap:9px; height:70px; }
      .bars span { width:15px; height:30px; border-radius:999px; background:var(--accent); opacity:.9; transform-origin:center; transition:height 180ms ease-out, opacity 180ms ease-out; }
      .bars span:nth-child(2) { height:58px; } .bars span:nth-child(3) { height:24px; } .bars span:nth-child(4) { height:44px; } .bars span:nth-child(5) { height:62px; }
      .state-listening .orb-button::before, .state-speaking .orb-button::before, .state-paired .orb-button::before { opacity:1; transform:scale(1.08); }
      .state-listening .bars span, .state-speaking .bars span, .state-reconnecting .bars span { animation:voiceBars 820ms ease-in-out infinite; }
      .state-sending .orb-button::before, .state-waiting .orb-button::before { background:oklch(0.9 0.025 75); opacity:.95; }
      .state-blocked .orb-button::before, .state-expired .orb-button::before, .state-ended .orb-button::before { background:oklch(0.88 0.045 28); opacity:.85; }
      .state-blocked .bars span, .state-expired .bars span, .state-ended .bars span { background:var(--bad); }
      @keyframes voiceBars { 0%, 100% { transform:scaleY(.55); opacity:.7; } 50% { transform:scaleY(1.15); opacity:1; } }
      .status { text-align:center; max-width:560px; } .status strong { display:block; margin-bottom:4px; font-size:20px; letter-spacing:-.02em; } .status p { margin:0; color:var(--muted); font-size:15px; line-height:1.5; }
      .under-actions { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; }
      .secondary, .quiet { border:1px solid var(--line); border-radius:999px; background:var(--page); color:var(--ink); padding:8px 13px; font-size:13px; }
      .quiet { color:var(--muted); } details { border-bottom:1px solid var(--line); padding:22px 0; } summary { cursor:pointer; color:var(--ink); font-weight:650; } .panel { padding-top:16px; }
      textarea { width:100%; min-height:96px; resize:vertical; border:1px solid var(--line); border-radius:14px; background:var(--surface); color:var(--ink); padding:12px; line-height:1.5; }
      .transcript { display:grid; gap:12px; margin-top:14px; max-height:360px; overflow:auto; } .turn { border-top:1px solid var(--line); padding-top:12px; } .turn strong { display:block; margin-bottom:3px; font-size:12px; color:var(--muted); } .turn p { margin:0; color:var(--ink); white-space:pre-wrap; }
      .small { color:var(--muted); font-size:12px; line-height:1.45; }
      @media (prefers-reduced-motion: reduce) { .bars span { animation:none !important; } .orb-button::before { transition:none; } }
      @media (max-width:640px) { main { padding:32px 18px 140px; } .orb-button { width:170px; height:170px; } }
    </style>
  </head>
  <body>
    <main>
      <nav class="top" aria-label="Session"><strong>Pipa Voice Session</strong></nav>
      <header>
        <p class="source-label">Hosted relay</p>
        <h1>Talk to your agent from this browser.</h1>
        <p class="subtitle">This page pairs with your local bridge over WSS. It sends final text turns only, then reads the bridge reply aloud.</p>
      </header>
      <section class="voice-stage state-waiting" id="voiceStage" aria-live="polite">
        <button class="orb-button" id="startBtn" type="button" aria-label="Start listening" disabled><span class="bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></span></button>
        <div class="status"><strong id="sessionStatus">Connecting to relay...</strong><p id="sessionDetail">Waiting for the local bridge to pair.</p></div>
        <div class="under-actions"><button class="secondary" id="testSpeakerBtn" type="button">Test speaker</button><button class="quiet" id="clearBtn" type="button">Clear transcript</button></div>
      </section>
      <details>
        <summary>Text input if speech is unavailable</summary>
        <div class="panel"><textarea id="textInput" placeholder="Type a turn. This still routes through the relay and local bridge."></textarea><p><button class="secondary" id="sendBtn" type="button" disabled>Send to bridge</button></p></div>
      </details>
      <details open><summary>Transcript</summary><div class="transcript" id="turns"></div></details>
      <p class="small">Browser speech may use browser, OS, or vendor speech services. The relay forwards final text turns and replies without retaining message bodies by default. OpenCode local session history may persist final text turns according to local behavior.</p>
    </main>
    <script>
      const params = new URLSearchParams(window.location.hash.slice(1));
      const sessionId = params.get("session");
      const token = params.get("token");
      const wsUrl = window.location.protocol === "https:" ? "wss://" + window.location.host + "/ws" : "ws://" + window.location.host + "/ws";
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const state = { ws:null, paired:false, busy:false, listening:false, recognition:null, finalTranscript:"", interimTranscript:"", turns:[], turnSeq:0 };
      const $ = (id) => document.getElementById(id);
      const els = { voiceStage:$("voiceStage"), sessionStatus:$("sessionStatus"), sessionDetail:$("sessionDetail"), startBtn:$("startBtn"), testSpeakerBtn:$("testSpeakerBtn"), clearBtn:$("clearBtn"), sendBtn:$("sendBtn"), textInput:$("textInput"), turns:$("turns") };
      function escapeHtml(value) { return String(value).replace(/[&<>"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;" })[char]); }
      function render() { els.turns.innerHTML = state.turns.map((turn) => "<div class=\"turn\"><strong>" + escapeHtml(turn.role) + "</strong><p>" + escapeHtml(turn.text) + "</p></div>").join(""); els.turns.scrollTop = els.turns.scrollHeight; }
      function addTurn(role, text) { state.turns.push({ role, text }); render(); }
      function setState(name) { els.voiceStage.className = "voice-stage state-" + name; }
      function setStatus(status, detail, name) { els.sessionStatus.textContent = status; els.sessionDetail.textContent = detail; if (name) setState(name); }
      function setReady(ready) { els.startBtn.disabled = !ready; els.sendBtn.disabled = !ready; }
      function send(message) { if (state.ws?.readyState === WebSocket.OPEN) state.ws.send(JSON.stringify(message)); }
      function submitTurn(text) { const clean = text.trim(); if (!clean || !state.paired || state.busy) return; const turn_id = "browser-" + Date.now() + "-" + (++state.turnSeq); state.busy = true; setReady(false); addTurn("You", clean); addTurn("System", "Sending turn to local bridge..."); setStatus("Sending to OpenCode", "The local bridge is handling this turn.", "sending"); send({ type:"user_turn", turn_id, text:clean }); }
      function speak(text) { if (!window.speechSynthesis) return; window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); utterance.rate = 0.95; utterance.onend = () => { if (state.paired && !state.busy) setStatus("Paired", "Press the orb for another voice turn.", "paired"); }; utterance.onerror = utterance.onend; window.speechSynthesis.speak(utterance); }
      function currentTranscript() { return (state.finalTranscript + " " + state.interimTranscript).trim(); }
      function stopListening(shouldSubmit) { const text = currentTranscript(); state.listening = false; state.finalTranscript = ""; state.interimTranscript = ""; try { state.recognition?.stop(); } catch (_error) {} state.recognition = null; if (shouldSubmit && text) submitTurn(text); else if (state.paired && !state.busy) setStatus("Paired", "Press the orb for another voice turn.", "paired"); }
      function startVoiceTurn() { if (state.listening) return stopListening(true); if (!SpeechRecognition) { setStatus("Speech unavailable", "Use text input. The relay path is still available.", "blocked"); addTurn("System", "SpeechRecognition is unavailable. Use text input."); return; } const recognition = new SpeechRecognition(); recognition.continuous = true; recognition.interimResults = true; recognition.maxAlternatives = 1; state.recognition = recognition; state.finalTranscript = ""; state.interimTranscript = ""; recognition.onstart = () => { state.listening = true; setStatus("Listening", "Speak one complete turn, then pause or press again to send.", "listening"); }; recognition.onresult = (event) => { let interim = ""; for (let index = event.resultIndex; index < event.results.length; index += 1) { const transcript = event.results[index][0].transcript.trim(); if (!transcript) continue; if (event.results[index].isFinal) state.finalTranscript = (state.finalTranscript + " " + transcript).trim(); else interim = (interim + " " + transcript).trim(); } state.interimTranscript = interim; const heard = currentTranscript(); if (heard) setStatus("Listening", "Heard: " + heard, "listening"); }; recognition.onerror = (event) => { setStatus("Listening failed", "Use text input below. " + (event.error || ""), "blocked"); addTurn("System", "Speech recognition failed. Use text input to keep going."); }; recognition.onend = () => { if (state.listening) stopListening(true); }; recognition.start(); }
      function connect() { if (!sessionId || !token) { setStatus("Expired", "This link is missing session credentials. Start a new session.", "expired"); return; } state.ws = new WebSocket(wsUrl, ["pipa-relay", "pipa-role.browser", "pipa-session." + sessionId, "pipa-token." + token]); state.ws.onopen = () => setStatus("Waiting for local bridge", "Keep the bridge command running on the machine with OpenCode.", "waiting"); state.ws.onmessage = (event) => { const message = JSON.parse(event.data); if (message.type === "status") { state.paired = message.state === "paired" || message.state === "active_turn"; if (state.paired && !state.busy) { setReady(true); setStatus(message.message || "Paired", "Press the orb, or use text input if speech is unavailable.", "paired"); } else if (message.state === "expired") { setReady(false); setStatus("Expired", "Start a new session.", "expired"); } else if (message.state === "ended") { setReady(false); setStatus("Ended", "This session has ended.", "ended"); } else setStatus(message.message || "Waiting", "Waiting for the other side of the relay.", "waiting"); } if (message.type === "assistant_reply") { state.busy = false; setReady(true); addTurn("OpenCode", message.text); setStatus("Speaking", "Reading the reply aloud now.", "speaking"); speak(message.text); } if (message.type === "error") { state.busy = false; setReady(state.paired); addTurn("System", "Blocked: " + message.message); setStatus("Blocked", message.message, "blocked"); } if (message.type === "end") { setReady(false); setStatus("Ended", message.message || "This session has ended.", "ended"); } }; state.ws.onclose = () => { state.paired = false; setReady(false); setStatus("Reconnecting", "The relay connection closed. Refresh before sending more turns.", "reconnecting"); }; }
      els.startBtn.addEventListener("click", startVoiceTurn); els.testSpeakerBtn.addEventListener("click", () => speak("Speaker test. If you can hear this, hosted Pipa voice output is working.")); els.clearBtn.addEventListener("click", () => { state.turns = []; render(); }); els.sendBtn.addEventListener("click", () => { submitTurn(els.textInput.value); els.textInput.value = ""; }); connect();
    </script>
  </body>
</html>`;
}

const server = createServer((req, res) => {
  if (req.method === "GET" && req.url === "/healthz") {
    sendJson(res, 200, { ok: true, disabled, active_sessions: store.sessions.size });
    return;
  }
  if (req.method === "GET" && (req.url === "/" || req.url === "/session" || req.url === "/index.html")) {
    sendHtml(res, hostedHtml());
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
    console.log("PIPA_VOICE_SESSION_OPENCODE_RESTRICTED_ARGS=<required no-tool/read-only/planning args>");
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
