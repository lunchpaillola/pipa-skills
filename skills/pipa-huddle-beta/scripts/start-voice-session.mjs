#!/usr/bin/env node

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdirSync, openSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import WebSocket from "ws";

import { parseRelayFrame, validateRelayMessage } from "./relay-protocol.mjs";

const port = Number(process.env.PIPA_VOICE_SESSION_PORT || 8787);
const host = process.env.PIPA_VOICE_SESSION_HOST || "127.0.0.1";
const projectDir = process.env.PIPA_VOICE_SESSION_DIR || process.cwd();
const opencodeBin = process.env.OPENCODE_BIN || "opencode";
const opencodeModel = readFlag("--model") || process.env.PIPA_VOICE_SESSION_MODEL || process.env.OPENCODE_MODEL || "";
const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);
let sessionId = readFlag("--huddle-session") || readFlag("--opencode-session") || process.env.PIPA_VOICE_SESSION_HUDDLE_SESSION || process.env.PIPA_VOICE_SESSION_OPENCODE_SESSION || "";
const huddleContextFile = readFlag("--context-file") || process.env.PIPA_VOICE_SESSION_CONTEXT_FILE || "";
const inlineHuddleContext = process.env.PIPA_VOICE_SESSION_CONTEXT || "";
const allowLatestSessionFallback = process.argv.includes("--allow-latest-session") || /^(1|true|yes)$/i.test(process.env.PIPA_VOICE_SESSION_ALLOW_LATEST_SESSION || "");
const publicMode = process.env.PIPA_VOICE_SESSION_PUBLIC || readFlag("--public") || (process.argv.includes("--ngrok") ? "ngrok" : "");
let relayUrl = process.env.PIPA_VOICE_RELAY_URL || readFlag("--relay-url");
let relaySessionId = process.env.PIPA_VOICE_RELAY_SESSION_ID || readFlag("--relay-session-id");
let relayBridgeToken = process.env.PIPA_VOICE_RELAY_BRIDGE_TOKEN || readFlag("--relay-bridge-token");
const hostedRequested = process.argv.includes("--hosted") || /^(1|true|yes)$/i.test(process.env.PIPA_VOICE_SESSION_HOSTED || "");
const daemonRequested = process.argv.includes("--daemon") || /^(1|true|yes)$/i.test(process.env.PIPA_VOICE_SESSION_DAEMON || "");
const printUrlJson = process.argv.includes("--print-url-json") || /^(1|true|yes)$/i.test(process.env.PIPA_VOICE_SESSION_PRINT_URL_JSON || "");
const relayBaseUrl = (process.env.PIPA_VOICE_RELAY_PUBLIC_BASE_URL || readFlag("--relay") || "https://voice.usepipa.com").replace(/\/$/, "");
const relayOperatorToken = process.env.PIPA_VOICE_RELAY_OPERATOR_TOKEN || readFlag("--operator-token");
const restrictedArgsRaw = process.env.PIPA_VOICE_SESSION_OPENCODE_RESTRICTED_ARGS || "";
const hostedRelayMode = hostedRequested || Boolean(relayUrl || relaySessionId || relayBridgeToken);
const runtimeDir = process.env.PIPA_VOICE_SESSION_RUNTIME_DIR || path.join(projectDir, ".pipa", "voice-session");
const templatePath = process.env.PIPA_VOICE_SESSION_TEMPLATE || path.join(scriptDir, "..", "templates", "huddle.html");
const assetDir = path.join(scriptDir, "..", "assets");
const openCodeTurnTimeoutMs = Number(process.env.PIPA_VOICE_SESSION_TURN_TIMEOUT_SECONDS || 300) * 1000;
let ngrokProcess = null;
let localSessionEnded = false;

function readFlag(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return "";
  return process.argv[index + 1] || "";
}

function voiceSessionHtml() {
  return readFileSync(templatePath, "utf8");
}

function soundDesignAsset(url) {
  if (url === "/sound-design-entering-chat.mp3") return path.join(assetDir, "sound-design-entering-chat.mp3");
  if (url === "/sound-design-thinking.mp3") return path.join(assetDir, "sound-design-thinking.mp3");
  return "";
}

function imageAsset(url) {
  if (url === "/pipa-mark.png") return path.join(assetDir, "pipa-mark.png");
  return "";
}

function huddleContext() {
  if (inlineHuddleContext.trim()) return inlineHuddleContext.trim().slice(0, 20_000);
  if (!huddleContextFile) return "";
  return readFileSync(path.resolve(projectDir, huddleContextFile), "utf8").trim().slice(0, 20_000);
}

function normalizeContextFileFlag(args) {
  const index = args.indexOf("--context-file");
  if (index === -1 || !args[index + 1]) return args;
  const normalized = [...args];
  normalized[index + 1] = path.resolve(projectDir, normalized[index + 1]);
  return normalized;
}

function emitJson(event, fields = {}) {
  if (!printUrlJson) return;
  console.log(JSON.stringify({ event, ...fields }));
}

function sendJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 200_000) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, "").trim();
}

function captureCommand(command, args, timeoutMs = 15_000) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: projectDir, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`${command} timed out`));
    }, timeoutMs);
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => { clearTimeout(timeout); reject(error); });
    child.on("close", (code) => {
      clearTimeout(timeout);
      if (code === 0) resolve(stripAnsi(stdout));
      else reject(new Error(stripAnsi(stderr) || `Command exited with code ${code}`));
    });
  });
}

async function resolveDebugOpenCodeSessionId() {
  if (sessionId) return sessionId;
  if (!allowLatestSessionFallback) {
    return "";
  }
  const output = await captureCommand(opencodeBin, ["session", "list", "--format", "json", "--max-count", "1"]);
  const sessions = JSON.parse(output || "[]");
  const latest = Array.isArray(sessions) ? sessions[0] : null;
  if (!latest?.id) return "";
  sessionId = latest.id;
  process.env.PIPA_VOICE_SESSION_OPENCODE_SESSION = sessionId;
  return sessionId;
}

function parseOpenCodeJsonOutput(stdout) {
  const text = [];
  let parsedSessionId = "";
  let parsedError = "";
  for (const line of stdout.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    try {
      const event = JSON.parse(trimmed);
      if (typeof event.sessionID === "string" && event.sessionID) parsedSessionId ||= event.sessionID;
      if (typeof event.part?.sessionID === "string" && event.part.sessionID) parsedSessionId ||= event.part.sessionID;
      if (event.type === "error") parsedError ||= event.error?.data?.message || event.error?.message || event.error?.name || "OpenCode emitted an error";
      if (event.type === "text" && typeof event.part?.text === "string") text.push(event.part.text);
      else if (typeof event.text === "string") text.push(event.text);
    } catch (_error) {
      // Non-JSON lines are ignored because `opencode run --format json` emits newline-delimited events.
    }
  }
  return { sessionId: parsedSessionId, text: text.join("").trim(), error: parsedError };
}

function voiceTurnPrompt(message) {
  return `Voice huddle response rules: answer conversationally in 1-2 short sentences. Avoid bullets, numbered lists, headings, markdown, and long explanations unless the user explicitly asks for detail.\n\nUser said: ${message}`;
}

function firstHuddleTurnPrompt(message) {
  const context = huddleContext();
  if (!context) return voiceTurnPrompt(message);
  return `You are starting a new Pipa Huddle voice session. Use the context below as background from the thread that launched the huddle. Treat it as a handoff, not as new user speech. Keep spoken replies conversational: 1-2 short sentences, no bullets, numbered lists, headings, markdown, or long explanations unless the user explicitly asks for detail.\n\nLaunching thread context:\n${context}\n\nUser said: ${message}`;
}

function splitArgs(value) {
  return String(value || "").match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)?.map((item) => item.replace(/^['"]|['"]$/g, "")) || [];
}

function restrictedOpenCodeArgs() {
  return splitArgs(restrictedArgsRaw);
}

function argsContainUnsupportedHostedFlags(args) {
  const joined = args.join(" ").toLowerCase();
  return [
    "--no-tools",
    "--disable-tools",
    "--read-only",
    "--readonly",
    "--planning-only",
    "--mode=plan",
    "--mode planning",
    "--permission=read-only",
    "--permission read-only"
  ].some((marker) => joined.includes(marker));
}

function ensureHostedSafetyBoundary() {
  if (!hostedRelayMode) return [];
  const args = restrictedOpenCodeArgs();
  if (argsContainUnsupportedHostedFlags(args)) {
    throw new Error("Hosted relay mode is configured with OpenCode flags this installed version does not support. Remove PIPA_VOICE_SESSION_OPENCODE_RESTRICTED_ARGS or set it only to flags supported by `opencode run --help`.");
  }
  return args;
}

function runOpenCodeTurn(message, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const startingNewHuddleSession = !sessionId;
    const args = ["run", message, "--dir", projectDir, "--format", "json"];
    if (opencodeModel) args.push("--model", opencodeModel);
    args.push(...extraArgs);
    if (sessionId) args.push("--session", sessionId);
    else args.push("--title", `Pipa Huddle ${new Date().toISOString().slice(0, 16).replace("T", " ")}`);

    const child = spawn(opencodeBin, args, { cwd: projectDir, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error(`OpenCode turn timed out after ${Math.round(openCodeTurnTimeoutMs / 1000)} seconds`));
    }, openCodeTurnTimeoutMs);

    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => { clearTimeout(timeout); reject(error); });
    child.on("close", (code) => {
      clearTimeout(timeout);
      const parsed = parseOpenCodeJsonOutput(stdout);
      if (code === 0 && parsed.sessionId && !sessionId) {
        sessionId = parsed.sessionId;
        process.env.PIPA_VOICE_SESSION_HUDDLE_SESSION = sessionId;
        process.env.PIPA_VOICE_SESSION_OPENCODE_SESSION = sessionId;
        emitJson("opencode_huddle_session_created", { ok: true, opencode_session_id: sessionId });
      }
      if (parsed.error) {
        reject(new Error(parsed.error));
        return;
      }
      const text = parsed.text || stripAnsi(stdout);
      if (code === 0 && text) resolve(text);
      else reject(new Error(stripAnsi(stderr) || text || `OpenCode exited with code ${code}${startingNewHuddleSession ? " while creating the huddle session" : ""}`));
    });
  });
}

async function startNgrokTunnel() {
  let resolveTunnelUrl;
  let rejectTunnelUrl;
  let tunnelUrlSettled = false;
  const tunnelUrl = new Promise((resolve, reject) => {
    resolveTunnelUrl = (url) => {
      if (tunnelUrlSettled) return;
      tunnelUrlSettled = true;
      clearTimeout(timeout);
      resolve(url);
    };
    rejectTunnelUrl = (error) => {
      if (tunnelUrlSettled) return;
      tunnelUrlSettled = true;
      reject(error);
    };
    const timeout = setTimeout(() => rejectTunnelUrl(new Error("ngrok started, but no HTTPS tunnel URL appeared within 15 seconds")), 15_000);
  });

  ngrokProcess = spawn("ngrok", ["http", String(port), "--log", "stdout"], {
    cwd: projectDir,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  ngrokProcess.stdout.on("data", (chunk) => {
    const line = chunk.toString().trim();
    const publicUrl = line.match(/url=(https:\/\/\S+)/)?.[1];
    if (publicUrl) resolveTunnelUrl(publicUrl);
    if (line) console.log(`[ngrok] ${line}`);
  });
  ngrokProcess.stderr.on("data", (chunk) => {
    const line = chunk.toString().trim();
    if (line) console.error(`[ngrok] ${line}`);
  });
  ngrokProcess.on("error", (error) => {
    console.error(`ngrok failed to start: ${error.message}`);
    console.error("Install with: brew install ngrok/ngrok/ngrok");
  });
  ngrokProcess.on("exit", (code) => {
    if (code !== null && code !== 0) console.error(`ngrok exited with code ${code}`);
  });

  const publicUrl = await tunnelUrl;
  console.log(`Public voice session: ${publicUrl}`);
  console.log("Open this HTTPS URL on another device for browser mic support.");
}

async function createHostedRelaySession() {
  const headers = { "Content-Type": "application/json" };
  if (relayOperatorToken) headers.Authorization = `Bearer ${relayOperatorToken}`;

  const response = await fetch(`${relayBaseUrl}/api/sessions`, { method: "POST", headers });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const setup = response.status === 401
      ? "The hosted relay requires operator authorization. Set PIPA_VOICE_RELAY_OPERATOR_TOKEN for that relay, or use a self-serve relay deployment."
      : body.error || "Hosted relay session creation failed";
    throw new Error(setup);
  }

  relaySessionId = body.session_id;
  relayBridgeToken = body.bridge?.token;
  relayUrl = body.relay_ws_url || `${relayBaseUrl.replace(/^http/, "ws")}/ws`;
  return body;
}

function childArgsForDaemon() {
  const args = normalizeContextFileFlag(process.argv.slice(1).filter((arg) => !["--daemon", "--print-url-json"].includes(arg)));
  if (!args.includes(scriptPath)) args.unshift(scriptPath);
  return args;
}

function processAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (_error) {
    return false;
  }
}

function writeDaemonMetadata(info) {
  mkdirSync(runtimeDir, { recursive: true });
  writeFileSync(path.join(runtimeDir, "bridge.pid"), `${info.pid}\n`, { mode: 0o600 });
  writeFileSync(path.join(runtimeDir, "session.json"), `${JSON.stringify(info, null, 2)}\n`, { mode: 0o600 });
}

async function startDaemonBridge() {
  mkdirSync(runtimeDir, { recursive: true });
  const logPath = path.join(runtimeDir, "bridge.log");
  const out = openSync(logPath, "a");
  const err = openSync(logPath, "a");
  const childEnv = { ...process.env, PIPA_VOICE_SESSION_DAEMON: "" };
  if (sessionId) childEnv.PIPA_VOICE_SESSION_HUDDLE_SESSION = sessionId;
  let browserUrl = `http://${host}:${port}`;
  let mode = "local";
  let sessionPackage = null;

  if (hostedRequested && (!relayUrl || !relaySessionId || !relayBridgeToken)) {
    sessionPackage = await createHostedRelaySession();
    relaySessionId = sessionPackage.session_id;
    relayBridgeToken = sessionPackage.bridge?.token;
    relayUrl = sessionPackage.relay_ws_url || `${relayBaseUrl.replace(/^http/, "ws")}/ws/${encodeURIComponent(relaySessionId)}`;
    browserUrl = sessionPackage.browser_url;
    mode = "hosted";
    childEnv.PIPA_VOICE_RELAY_URL = relayUrl;
    childEnv.PIPA_VOICE_RELAY_SESSION_ID = relaySessionId;
    childEnv.PIPA_VOICE_RELAY_BRIDGE_TOKEN = relayBridgeToken;
  } else if (hostedRelayMode) {
    mode = "hosted";
    browserUrl = relaySessionId ? `${relayBaseUrl}/s/${encodeURIComponent(relaySessionId)}` : "";
  }

  const child = spawn(process.execPath, childArgsForDaemon(), {
    cwd: projectDir,
    env: childEnv,
    detached: true,
    stdio: ["ignore", out, err]
  });
  child.unref();

  await new Promise((resolve) => setTimeout(resolve, 250));
  const info = {
    ok: processAlive(child.pid),
    mode,
    pid: child.pid,
    opencode_session_id: sessionId || null,
    opencode_model: opencodeModel || null,
    huddle_session_state: sessionId ? "existing_huddle_session" : "creates_on_first_turn",
    huddle_context: inlineHuddleContext || huddleContextFile ? "provided" : "none",
    pid_path: path.join(runtimeDir, "bridge.pid"),
    log_path: logPath,
    metadata_path: path.join(runtimeDir, "session.json"),
    browser_url: browserUrl,
    relay_state: mode === "hosted" ? "bridge_waiting_until_browser_joins" : "local_server_starting",
    pairing_expires_at: sessionPackage?.browser?.pairing_expires_at || null,
    stop_command: `kill ${child.pid}`
  };
  writeDaemonMetadata(info);

  if (printUrlJson) {
    console.log(JSON.stringify({ event: "voice_session_daemon_started", ...info }));
    return;
  }

  console.log(`Pipa voice bridge daemon started: ${info.pid}`);
  if (browserUrl) console.log(`Browser voice session: ${browserUrl}`);
  console.log(`PID file: ${info.pid_path}`);
  console.log(`Log file: ${info.log_path}`);
  console.log(`Stop with: ${info.stop_command}`);
}

async function startHostedRelayBridge() {
  let sessionPackage = null;
  if (hostedRequested && (!relayUrl || !relaySessionId || !relayBridgeToken)) {
    try {
      sessionPackage = await createHostedRelaySession();
    } catch (error) {
      console.error(`Hosted voice session blocked: ${error.message}`);
      console.error(`Relay: ${relayBaseUrl}`);
      console.error("Local mode still works with: node skills/pipa-huddle-beta/scripts/start-voice-session.mjs");
      process.exitCode = 1;
      return;
    }
  }

  if (!relayUrl || !relaySessionId || !relayBridgeToken) {
    console.error("Hosted relay mode requires PIPA_VOICE_RELAY_URL, PIPA_VOICE_RELAY_SESSION_ID, and PIPA_VOICE_RELAY_BRIDGE_TOKEN.");
    process.exitCode = 1;
    return;
  }

  let extraArgs;
  try {
    extraArgs = ensureHostedSafetyBoundary();
  } catch (error) {
    console.error(`Hosted relay blocked: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const url = new URL(relayUrl);

  console.log("Pipa hosted relay bridge");
  console.log(`Project directory: ${projectDir}`);
  console.log(sessionId ? `OpenCode huddle session: ${sessionId}` : "OpenCode huddle session: creates on first turn");
  console.log(`Hosted relay: ${relayUrl}`);
  console.log(extraArgs.length ? `Hosted OpenCode args: ${extraArgs.join(" ")}` : "Hosted OpenCode args: none");
  if (sessionPackage?.browser_url) console.log(`Browser voice session: ${sessionPackage.browser_url}`);
  if (sessionPackage?.browser?.pairing_expires_at) console.log(`Pairing link expires if unused: ${sessionPackage.browser.pairing_expires_at}`);
  console.log("Hosted mode is for planning and discussion, not spoken tool approval or live shell/file execution.");
  emitJson("voice_session_created", {
    ok: true,
    mode: "hosted",
    pid: process.pid,
    opencode_session_id: sessionId || null,
    opencode_model: opencodeModel || null,
    huddle_context: inlineHuddleContext || huddleContextFile ? "provided" : "none",
    browser_url: sessionPackage?.browser_url || null,
    relay_ws_url: relayUrl,
    relay_state: "connecting",
    pairing_expires_at: sessionPackage?.browser?.pairing_expires_at || null
  });

  const seenTurns = new Set();
  const ws = new WebSocket(url, ["pipa-relay", "pipa-role.bridge", `pipa-session.${relaySessionId}`, `pipa-token.${relayBridgeToken}`], { perMessageDeflate: false });

  ws.on("open", () => {
    emitJson("voice_session_bridge_connected", {
      ok: true,
    mode: "hosted",
    pid: process.pid,
    opencode_session_id: sessionId || null,
    opencode_model: opencodeModel || null,
    huddle_context: inlineHuddleContext || huddleContextFile ? "provided" : "none",
    browser_url: sessionPackage?.browser_url || null,
      relay_ws_url: relayUrl,
      relay_state: "bridge_waiting_until_browser_joins"
    });
    ws.send(JSON.stringify({ type: "status", message: "Local bridge connected. The first hosted turn will create a dedicated Pipa Huddle session." }));
  });

  ws.on("message", async (data, isBinary) => {
    const parsed = parseRelayFrame(isBinary ? Buffer.from(data) : data.toString());
    if (!parsed.ok) {
      ws.send(JSON.stringify({ type: "error", message: parsed.error }));
      return;
    }

    if (["status", "error"].includes(parsed.message.type)) {
      const relayMessage = String(parsed.message.message || "Relay status update");
      console.log(`Hosted relay ${parsed.message.type}: ${relayMessage}`);
      return;
    }

    if (parsed.message.type === "end") {
      ws.close(1000, "session ended");
      return;
    }

    const validation = validateRelayMessage("browser", parsed.message, { seenTurnIds: seenTurns });
    if (!validation.ok) {
      ws.send(JSON.stringify({ type: "error", message: validation.error }));
      return;
    }

    const message = validation.message;
    if (message.type === "interrupt") {
      ws.send(JSON.stringify({ type: "status", message: "Interrupt received. The bridge will not auto-replay an in-flight hosted turn." }));
      return;
    }
    if (message.type !== "user_turn") return;

    seenTurns.add(message.turn_id);
    ws.send(JSON.stringify({ type: "status", message: "Running OpenCode turn." }));
    try {
      const reply = await runOpenCodeTurn(sessionId ? voiceTurnPrompt(message.text) : firstHuddleTurnPrompt(message.text), extraArgs);
      ws.send(JSON.stringify({ type: "assistant_reply", turn_id: message.turn_id, text: reply }));
    } catch (error) {
      ws.send(JSON.stringify({ type: "error", message: error.message }));
    }
  });

  ws.on("close", () => {
    console.error("Hosted relay bridge disconnected. If this happened mid-turn, delivery is uncertain; do not auto-replay without confirmation.");
  });
  ws.on("error", (error) => {
    console.error(`Hosted relay bridge error: ${error.message}`);
  });
}

function shutdown() {
  if (ngrokProcess && !ngrokProcess.killed) ngrokProcess.kill("SIGTERM");
  if (server.listening) server.close(() => process.exit(0));
  else process.exit(0);
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && (req.url === "/" || req.url === "/index.html")) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      res.end(voiceSessionHtml());
      return;
    }

    if (req.method === "GET" && req.url === "/favicon.ico") {
      res.writeHead(204, { "Cache-Control": "max-age=86400" });
      res.end();
      return;
    }

    const audioPath = req.method === "GET" ? soundDesignAsset(req.url) : "";
    if (audioPath) {
      res.writeHead(200, { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" });
      res.end(readFileSync(audioPath));
      return;
    }

    const imagePath = req.method === "GET" ? imageAsset(req.url) : "";
    if (imagePath) {
      res.writeHead(200, { "Content-Type": "image/png", "Cache-Control": "no-store" });
      res.end(readFileSync(imagePath));
      return;
    }

    if (req.method === "GET" && req.url === "/api/status") {
      if (localSessionEnded) {
        sendJson(res, 410, { ok: false, state: "ended", error: "The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill" });
        return;
      }
      sendJson(res, 200, {
        ok: true,
        mode: "local-opencode-bridge",
        projectDir,
        opencodeBin,
        opencodeModel: opencodeModel || null,
        sessionId: sessionId || null,
        huddleSessionState: sessionId ? "existing_huddle_session" : "creates_on_first_turn",
        huddleContext: inlineHuddleContext || huddleContextFile ? "provided" : "none",
        tts: { mode: "browser", rate: 1 }
      });
      return;
    }

    if (req.method === "POST" && req.url === "/api/turn") {
      if (localSessionEnded) {
        sendJson(res, 410, { ok: false, state: "ended", error: "The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill" });
        return;
      }
      const body = JSON.parse((await readBody(req)) || "{}");
      const message = String(body.message || "").trim();
      if (!message) {
        sendJson(res, 400, { ok: false, error: "Missing message" });
        return;
      }
      const reply = await runOpenCodeTurn(sessionId ? voiceTurnPrompt(message) : firstHuddleTurnPrompt(message));
      sendJson(res, 200, { ok: true, reply });
      return;
    }

    if (req.method === "POST" && req.url === "/api/handoff") {
      if (localSessionEnded) {
        sendJson(res, 410, { ok: false, state: "ended", error: "The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill" });
        return;
      }
      const body = JSON.parse((await readBody(req)) || "{}");
      const turns = Array.isArray(body.turns) ? body.turns : [];
      const transcript = turns
        .map((turn) => `${String(turn.role || "Unknown").slice(0, 40)}: ${String(turn.text || "").slice(0, 4_000)}`)
        .join("\n\n")
        .slice(0, 16_000);
      if (!transcript) {
        sendJson(res, 400, { ok: false, error: "No turns captured" });
        return;
      }
      const prompt = `Synthesize this voice session into a concise continuation handoff. Use exactly these sections: Context discussed, Decisions made, Open questions, Confirmed next actions, What the agent should continue doing, What not to assume. Be honest about uncertainty and do not treat exploratory comments as confirmed decisions.\n\n${transcript}`;
      const handoff = await runOpenCodeTurn(prompt);
      sendJson(res, 200, { ok: true, handoff });
      return;
    }

    if (req.method === "POST" && req.url === "/api/end") {
      localSessionEnded = true;
      sendJson(res, 200, { ok: true, state: "ended", message: "The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill" });
      return;
    }

    sendJson(res, 404, { ok: false, error: "Not found" });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
});

async function main() {
  try {
    const debugSessionId = await resolveDebugOpenCodeSessionId();
    if (debugSessionId) emitJson("opencode_huddle_session_ready", { ok: true, opencode_session_id: debugSessionId, source: allowLatestSessionFallback ? "latest_session_debug_fallback" : "explicit" });
    else emitJson("opencode_huddle_session_pending", { ok: true, opencode_session_id: null, source: "created_on_first_turn" });
  } catch (error) {
    console.error(`OpenCode huddle session setup blocked: ${error.message}`);
    emitJson("opencode_huddle_session_failed", { ok: false, error: error.message });
    process.exitCode = 1;
    return;
  }

  if (daemonRequested) {
    await startDaemonBridge();
    return;
  }

  if (hostedRelayMode) {
    await startHostedRelayBridge();
    return;
  }

  server.listen(port, host, async () => {
    const browserUrl = `http://${host}:${port}`;
    console.log(`Pipa voice session: ${browserUrl}`);
    console.log(`Project directory: ${projectDir}`);
    console.log(sessionId ? `OpenCode huddle session: ${sessionId}` : "OpenCode huddle session: creates on first turn");
    emitJson("voice_session_ready", { ok: true, mode: "local", pid: process.pid, browser_url: browserUrl, relay_state: "local_ready", opencode_session_id: sessionId || null, huddle_session_state: sessionId ? "existing_huddle_session" : "creates_on_first_turn" });
    if (publicMode === "ngrok") {
      try {
        await startNgrokTunnel();
      } catch (error) {
        console.error(`ngrok public mode failed: ${error.message}`);
      }
    }
  });
}

main().catch((error) => {
  if (printUrlJson) console.log(JSON.stringify({ event: "voice_session_failed", ok: false, error: error.message }));
  console.error(`Pipa voice session blocked: ${error.message}`);
  process.exitCode = 1;
});

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
