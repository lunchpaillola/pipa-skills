#!/usr/bin/env node

import { createServer } from "node:http";
import { spawn } from "node:child_process";
import WebSocket from "ws";

import { parseRelayFrame, validateRelayMessage } from "./relay-protocol.mjs";

const port = Number(process.env.PIPA_VOICE_SESSION_PORT || 8787);
const host = process.env.PIPA_VOICE_SESSION_HOST || "127.0.0.1";
const projectDir = process.env.PIPA_VOICE_SESSION_DIR || process.cwd();
const opencodeBin = process.env.OPENCODE_BIN || "opencode";
const sessionId = process.env.PIPA_VOICE_SESSION_OPENCODE_SESSION || "";
const publicMode = process.env.PIPA_VOICE_SESSION_PUBLIC || readFlag("--public") || (process.argv.includes("--ngrok") ? "ngrok" : "");
let relayUrl = process.env.PIPA_VOICE_RELAY_URL || readFlag("--relay-url");
let relaySessionId = process.env.PIPA_VOICE_RELAY_SESSION_ID || readFlag("--relay-session-id");
let relayBridgeToken = process.env.PIPA_VOICE_RELAY_BRIDGE_TOKEN || readFlag("--relay-bridge-token");
const hostedRequested = process.argv.includes("--hosted") || /^(1|true|yes)$/i.test(process.env.PIPA_VOICE_SESSION_HOSTED || "");
const relayBaseUrl = (process.env.PIPA_VOICE_RELAY_PUBLIC_BASE_URL || readFlag("--relay") || "https://voice.usepipa.com").replace(/\/$/, "");
const relayOperatorToken = process.env.PIPA_VOICE_RELAY_OPERATOR_TOKEN || readFlag("--operator-token");
const restrictedArgsRaw = process.env.PIPA_VOICE_SESSION_OPENCODE_RESTRICTED_ARGS || "";
const hostedRelayMode = hostedRequested || Boolean(relayUrl || relaySessionId || relayBridgeToken);
let ngrokProcess = null;

function readFlag(name) {
  const index = process.argv.indexOf(name);
  if (index === -1) return "";
  return process.argv[index + 1] || "";
}

const html = String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pipa Voice Session</title>
    <style>
      :root { color-scheme: light; --page:oklch(0.985 0.006 75); --surface:oklch(0.965 0.008 75); --ink:oklch(0.235 0.012 65); --muted:oklch(0.52 0.012 65); --line:oklch(0.88 0.008 75); --accent:oklch(0.58 0.13 42); --accent-soft:oklch(0.82 0.08 42); --good:oklch(0.52 0.10 150); --bad:oklch(0.52 0.13 28); }
      * { box-sizing:border-box; }
      body { margin:0; min-height:100vh; background:var(--page); color:var(--ink); font-family:-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height:1.65; -webkit-font-smoothing:antialiased; }
      button, textarea { font:inherit; }
      button { cursor:pointer; }
      main { max-width:760px; margin:0 auto; padding:48px 24px 150px; }
      nav.top { position:sticky; top:0; background:var(--page); padding:12px 0; border-bottom:1px solid var(--line); z-index:10; margin-bottom:34px; }
      nav.top strong { font-size:13px; color:var(--muted); letter-spacing:.02em; }
      header { margin-bottom:34px; }
      .source-label { font-size:12px; color:var(--muted); text-transform:uppercase; letter-spacing:.06em; margin:0 0 8px; }
      h1 { margin:0 0 12px; color:var(--ink); font-size:30px; font-weight:650; line-height:1.22; letter-spacing:-.025em; }
      .subtitle { max-width:65ch; margin:0; color:var(--muted); font-size:15px; line-height:1.5; }
      .voice-stage { display:grid; justify-items:center; gap:18px; padding:30px 0 36px; border-bottom:1px solid var(--line); }
      .orb-button { width:190px; height:190px; border:1px solid var(--line); border-radius:999px; background:var(--surface); color:var(--ink); display:grid; place-items:center; position:relative; box-shadow:0 18px 60px oklch(0.35 0.03 65 / .12); }
      .orb-button::before { content:""; position:absolute; inset:18px; border-radius:inherit; background:oklch(0.92 0.035 42); opacity:.65; transform:scale(.92); transition:transform 220ms ease-out, opacity 220ms ease-out; }
      .orb-button:focus-visible { outline:3px solid var(--accent-soft); outline-offset:5px; }
      .bars { position:relative; z-index:1; display:flex; align-items:center; gap:9px; height:70px; }
      .bars span { width:15px; height:30px; border-radius:999px; background:var(--accent); opacity:.9; transform-origin:center; transition:height 180ms ease-out, opacity 180ms ease-out; }
      .bars span:nth-child(2) { height:58px; }
      .bars span:nth-child(3) { height:24px; }
      .bars span:nth-child(4) { height:44px; }
      .bars span:nth-child(5) { height:62px; }
      .state-listening .orb-button::before, .state-speaking .orb-button::before { opacity:1; transform:scale(1.08); }
      .state-listening .bars span, .state-speaking .bars span { animation:voiceBars 820ms ease-in-out infinite; }
      .state-listening .bars span:nth-child(2), .state-speaking .bars span:nth-child(2) { animation-delay:90ms; }
      .state-listening .bars span:nth-child(3), .state-speaking .bars span:nth-child(3) { animation-delay:180ms; }
      .state-listening .bars span:nth-child(4), .state-speaking .bars span:nth-child(4) { animation-delay:270ms; }
      .state-listening .bars span:nth-child(5), .state-speaking .bars span:nth-child(5) { animation-delay:360ms; }
      .state-sending .orb-button::before { background:oklch(0.9 0.025 75); opacity:.95; }
      .state-blocked .orb-button::before { background:oklch(0.88 0.045 28); opacity:.85; }
      .state-blocked .bars span { background:var(--bad); }
      @keyframes voiceBars { 0%, 100% { transform:scaleY(.55); opacity:.7; } 50% { transform:scaleY(1.15); opacity:1; } }
      .status { text-align:center; max-width:520px; }
      .status strong { display:block; margin-bottom:4px; font-size:20px; letter-spacing:-.02em; }
      .status p { margin:0; color:var(--muted); font-size:15px; line-height:1.5; }
      .blocker-note { display:none; max-width:560px; margin:0 auto; border:1px solid oklch(0.82 0.05 28); border-radius:14px; background:oklch(0.965 0.018 28); color:var(--ink); padding:12px 14px; font-size:14px; line-height:1.45; }
      .blocker-note.is-visible { display:block; }
      .under-actions { display:flex; justify-content:center; gap:12px; flex-wrap:wrap; }
      .secondary, .quiet { border:1px solid var(--line); border-radius:999px; background:var(--page); color:var(--ink); padding:8px 13px; font-size:13px; }
      .quiet { color:var(--muted); }
      details { border-bottom:1px solid var(--line); padding:22px 0; }
      summary { cursor:pointer; color:var(--ink); font-weight:650; }
      .panel { padding-top:16px; }
      textarea { width:100%; min-height:96px; resize:vertical; border:1px solid var(--line); border-radius:14px; background:var(--surface); color:var(--ink); padding:12px; line-height:1.5; }
      .transcript { display:grid; gap:12px; margin-top:14px; max-height:360px; overflow:auto; }
      .turn { border-top:1px solid var(--line); padding-top:12px; }
      .turn strong { display:block; margin-bottom:3px; font-size:12px; color:var(--muted); }
      .turn p { margin:0; color:var(--ink); white-space:pre-wrap; }
      .handoff { white-space:pre-wrap; border:1px solid var(--line); border-radius:14px; background:var(--surface); color:var(--ink); padding:14px; min-height:160px; overflow:auto; }
      .small { color:var(--muted); font-size:12px; line-height:1.45; }
      @media (prefers-reduced-motion: reduce) { .bars span { animation:none !important; } .orb-button::before { transition:none; } }
      @media (max-width:640px) { main { padding:32px 18px 140px; } .orb-button { width:170px; height:170px; } }
    </style>
  </head>
  <body>
    <main>
      <nav class="top" aria-label="Session"><strong>Pipa Voice Session</strong></nav>
      <header>
        <p class="source-label">Local OpenCode bridge</p>
        <h1>Talk to your agent.</h1>
        <p class="subtitle">Press once, speak one turn, then pause. Pipa sends it to OpenCode and reads the reply aloud.</p>
      </header>

      <section class="voice-stage state-ready" id="voiceStage" aria-live="polite">
        <button class="orb-button" id="startBtn" type="button" aria-label="Start listening">
          <span class="bars" aria-hidden="true"><span></span><span></span><span></span><span></span><span></span></span>
        </button>
        <div class="status">
          <strong id="sessionStatus">Checking bridge...</strong>
          <p id="sessionDetail">When ready, press the orb and speak one complete turn.</p>
        </div>
        <p class="blocker-note" id="secureBlocker">Voice input needs localhost or HTTPS. This page was opened over a plain HTTP network address, so the browser blocks microphone capture. Use <code>http://127.0.0.1:8878</code> on this machine, or keep using text input.</p>
        <div class="under-actions">
          <button class="secondary" id="testSpeakerBtn" type="button">Test speaker</button>
          <button class="quiet" id="clearBtn" type="button">Clear transcript</button>
        </div>
      </section>

      <details>
        <summary>Text input if speech is unavailable</summary>
        <div class="panel">
          <textarea id="textInput" placeholder="Type a turn. This still sends it to OpenCode."></textarea>
          <p><button class="secondary" id="sendBtn" type="button">Send to OpenCode</button></p>
        </div>
      </details>

      <details open>
        <summary>Transcript</summary>
        <div class="transcript" id="turns"></div>
      </details>

      <details>
        <summary>Handoff</summary>
        <div class="panel">
          <button class="secondary" id="handoffBtn" type="button">Generate handoff</button>
          <div class="handoff" id="handoff">No handoff generated yet.</div>
        </div>
      </details>

        <p class="small">Browser speech may use browser or OS speech services. Local mode keeps browser transcript state in memory and binds to localhost by default. Ngrok testing exposes a public HTTPS tunnel. Hosted relay mode forwards final text turns without relay body retention by default. OpenCode session history follows local OpenCode behavior.</p>
    </main>

    <script>
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const state = { turns: [], lastReply: "", busy: false, bridgeReady: false, listening: false, recognition: null, finalTranscript: "", interimTranscript: "", silenceTimer: null, maxListenTimer: null, stopRequested: false };
      const $ = (id) => document.getElementById(id);
      const els = { voiceStage:$("voiceStage"), sessionStatus:$("sessionStatus"), sessionDetail:$("sessionDetail"), secureBlocker:$("secureBlocker"), startBtn:$("startBtn"), testSpeakerBtn:$("testSpeakerBtn"), clearBtn:$("clearBtn"), sendBtn:$("sendBtn"), handoffBtn:$("handoffBtn"), textInput:$("textInput"), turns:$("turns"), handoff:$("handoff") };
      const isLocalAddress = ["localhost", "127.0.0.1", "::1", ""].includes(window.location.hostname);

      function escapeHtml(value) { return value.replace(/[&<>"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;" })[char]); }
      function render() { els.turns.innerHTML = state.turns.map((turn) => "<div class=\"turn " + (turn.role === "OpenCode" ? "agent" : "") + "\"><strong>" + escapeHtml(turn.role) + "</strong><p>" + escapeHtml(turn.text) + "</p></div>").join(""); els.turns.scrollTop = els.turns.scrollHeight; }
      function addTurn(role, text) { state.turns.push({ role, text }); render(); }
      function setBusy(busy) { state.busy = busy; els.sendBtn.disabled = busy; els.startBtn.disabled = busy; }
      function setState(name) { els.voiceStage.className = "voice-stage state-" + name; }
      function setStatus(status, detail, name) { els.sessionStatus.textContent = status; els.sessionDetail.textContent = detail; if (name) setState(name); }

      function clearSpeechTimers() {
        if (state.silenceTimer) clearTimeout(state.silenceTimer);
        if (state.maxListenTimer) clearTimeout(state.maxListenTimer);
        state.silenceTimer = null;
        state.maxListenTimer = null;
      }

      function currentTranscript() {
        return (state.finalTranscript + " " + state.interimTranscript).trim();
      }

      function scheduleSpeechSubmit() {
        if (state.silenceTimer) clearTimeout(state.silenceTimer);
        state.silenceTimer = setTimeout(() => stopListening(true), 2500);
      }

      function stopListening(shouldSubmit) {
        const text = currentTranscript();
        state.stopRequested = true;
        clearSpeechTimers();
        if (state.recognition) {
          try { state.recognition.stop(); } catch (_error) {}
        }
        state.listening = false;
        state.recognition = null;
        state.finalTranscript = "";
        state.interimTranscript = "";
        if (shouldSubmit && text) submitTurn(text);
        else if (!state.busy) setStatus("Ready", "Press the orb for another voice turn.", "ready");
      }

      async function sendToOpenCode(message) {
        const response = await fetch("/api/turn", { method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify({ message }) });
        const body = await response.json();
        if (!response.ok || !body.ok) throw new Error(body.error || "OpenCode bridge failed");
        return body.reply;
      }

      async function submitTurn(text) {
        const clean = text.trim();
        if (!clean || state.busy) return;
        addTurn("You", clean);
        setBusy(true);
        setStatus("Sending to OpenCode", "This can take a little while because the turn is running through the normal OpenCode CLI.", "sending");
        addTurn("System", "Sending turn to OpenCode...");
        try {
          const reply = await sendToOpenCode(clean);
          state.lastReply = reply;
          addTurn("OpenCode", reply);
          setStatus("Speaking", "Reading the reply aloud now. If you hear nothing, press Test speaker.", "speaking");
          speak(reply);
        } catch (error) {
          addTurn("System", "Blocked: " + error.message);
          setStatus("Blocked", error.message, "blocked");
        } finally {
          setBusy(false);
        }
      }

      async function startVoiceTurn() {
        if (state.listening) {
          stopListening(true);
          return;
        }
        if (!window.isSecureContext && !isLocalAddress) {
          els.secureBlocker.classList.add("is-visible");
          setStatus("Voice input unavailable", "Open the page from localhost, or use the text input below.", "blocked");
          addTurn("System", "Voice input is blocked because this page is not localhost or HTTPS. Use text input, or open the local URL on this machine.");
          return;
        }
        setStatus("Starting microphone", "Approve microphone access if your browser asks.", "sending");
        if (!SpeechRecognition) { setStatus("Speech recognition unavailable", "This browser cannot turn speech into text. Use the text input.", "blocked"); addTurn("System", "SpeechRecognition is unavailable. Use text input."); return; }
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        state.recognition = recognition;
        state.finalTranscript = "";
        state.interimTranscript = "";
        state.stopRequested = false;
        recognition.onstart = () => {
          state.listening = true;
          setStatus("Listening", "Keep talking. I will send after a short pause, or click the orb again to send now.", "listening");
          state.maxListenTimer = setTimeout(() => stopListening(true), 30000);
        };
        recognition.onaudiostart = () => setStatus("Listening", "Microphone audio started. Keep speaking, then pause.", "listening");
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
          if (heard) {
            setStatus("Listening", "Heard: " + heard, "listening");
            scheduleSpeechSubmit();
          }
        };
        recognition.onerror = (event) => {
          const reason = event.error ? "Speech recognition error: " + event.error + "." : "Speech recognition failed.";
          clearSpeechTimers();
          state.listening = false;
          state.recognition = null;
          setStatus("Listening failed", reason + " Use text input below.", "blocked");
          addTurn("System", reason + " Chrome speech recognition can fail if the browser speech service is unavailable. Use text input to keep testing the OpenCode bridge.");
        };
        recognition.onend = () => {
          const text = currentTranscript();
          clearSpeechTimers();
          state.listening = false;
          state.recognition = null;
          state.finalTranscript = "";
          state.interimTranscript = "";
          if (state.stopRequested) return;
          if (text) submitTurn(text);
          else if (!state.busy) setStatus("No speech heard", "Press the orb and keep speaking until the transcript appears.", "blocked");
        };
        recognition.start();
        setStatus("Listening", "Keep talking. I will send after a short pause, or click the orb again to send now.", "listening");
        addTurn("System", "Listening. Click the orb again to stop and send immediately.");
      }

      function speak(text) {
        if (!text) { addTurn("System", "There is no OpenCode reply to speak yet. Send a voice or text turn first."); return; }
        if (!window.speechSynthesis) { addTurn("System", "SpeechSynthesis is unavailable in this browser."); return; }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.onend = () => { if (!state.busy) setStatus("Ready", "Press the orb for another voice turn.", "ready"); };
        utterance.onerror = utterance.onend;
        window.speechSynthesis.speak(utterance);
      }

      async function checkBridge() {
        try {
          const response = await fetch("/api/status");
          const body = await response.json();
          if (!response.ok || !body.ok) throw new Error(body.error || "Bridge unavailable");
          state.bridgeReady = true;
          if (!window.isSecureContext && !isLocalAddress) {
            els.secureBlocker.classList.add("is-visible");
            setStatus("Text mode ready", "The OpenCode bridge is ready, but voice input is blocked on this HTTP network URL.", "blocked");
          } else {
            setStatus("Ready", "Press the orb, speak one turn, then pause. Use Test speaker if you want to confirm audio output.", "ready");
          }
          addTurn("System", "Bridge ready. Project: " + body.projectDir);
        } catch (_error) {
          setStatus("Bridge unavailable", "Start the skill script from the repository root, then refresh this page.", "blocked");
          addTurn("System", "Bridge unavailable. Start with node skills/pipa-voice-session/scripts/start-voice-session.mjs.");
        }
      }

      function generateHandoff() {
        const userTurns = state.turns.filter((turn) => turn.role === "You").map((turn) => "- " + turn.text).join("\n") || "- None captured.";
        els.handoff.textContent = "## Voice Session Handoff\n\n**Topic:** OpenCode voice session\n\n**Useful Context:**\n" + userTurns + "\n\n**Decisions And Preferences:**\n- Review the OpenCode replies in the active session for confirmed decisions.\n\n**Open Questions:**\n- TBD from the conversation if not already resolved.\n\n**Recommended Next Agent Step:**\nContinue in OpenCode from the latest voice-session turn. Resolve open questions before implementation.";
      }

      els.startBtn.addEventListener("click", startVoiceTurn);
      els.testSpeakerBtn.addEventListener("click", () => speak("Speaker test. If you can hear this, Pipa voice output is working."));
      els.clearBtn.addEventListener("click", () => { window.speechSynthesis?.cancel(); clearSpeechTimers(); try { state.recognition?.stop(); } catch (_error) {} state.recognition = null; state.listening = false; state.turns = []; state.lastReply = ""; els.handoff.textContent = "No handoff generated yet."; render(); setStatus("Ready", "Press the orb, speak naturally, then pause.", "ready"); });
      els.sendBtn.addEventListener("click", () => { submitTurn(els.textInput.value); els.textInput.value = ""; });
      els.handoffBtn.addEventListener("click", generateHandoff);
      checkBridge();
    </script>
  </body>
</html>`;

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

function splitArgs(value) {
  return String(value || "").match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)?.map((item) => item.replace(/^['"]|['"]$/g, "")) || [];
}

function restrictedOpenCodeArgs() {
  return splitArgs(restrictedArgsRaw);
}

function argsContainKnownSafetyMode(args) {
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
  if (!args.length || !argsContainKnownSafetyMode(args)) {
    throw new Error("Hosted relay mode requires PIPA_VOICE_SESSION_OPENCODE_RESTRICTED_ARGS with recognizable mechanical no-tool/read-only/planning OpenCode restrictions such as --no-tools, --read-only, or --planning-only. Refusing to run normal opencode from a hosted browser turn.");
  }
  return args;
}

function isSpokenApprovalOrExecutionRequest(message) {
  const text = String(message || "").toLowerCase();
  return /\b(approve|approval|yes|go ahead|run|execute|edit|write|modify|delete|shell|terminal|command|tool)\b/.test(text) && /\b(file|files|shell|terminal|command|tool|edit|change|permission|approval|approve)\b/.test(text);
}

function runOpenCodeTurn(message, extraArgs = []) {
  return new Promise((resolve, reject) => {
    const args = ["run", message, "--dir", projectDir];
    args.push(...extraArgs);
    if (sessionId) args.push("--session", sessionId);
    else args.push("--continue");

    const child = spawn(opencodeBin, args, { cwd: projectDir, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("OpenCode turn timed out after 120 seconds"));
    }, 120_000);

    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("error", (error) => { clearTimeout(timeout); reject(error); });
    child.on("close", (code) => {
      clearTimeout(timeout);
      const text = stripAnsi(stdout);
      if (code === 0 && text) resolve(text);
      else reject(new Error(stripAnsi(stderr) || text || `OpenCode exited with code ${code}`));
    });
  });
}

async function startNgrokTunnel() {
  ngrokProcess = spawn("ngrok", ["http", String(port), "--log", "stdout"], {
    cwd: projectDir,
    env: process.env,
    stdio: ["ignore", "pipe", "pipe"]
  });

  ngrokProcess.stdout.on("data", (chunk) => {
    const line = chunk.toString().trim();
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

  const publicUrl = await waitForNgrokUrl();
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
      ? "The hosted relay requires operator authorization. Use the Pipa managed relay when available, or set PIPA_VOICE_RELAY_OPERATOR_TOKEN only for operator testing."
      : body.error || "Hosted relay session creation failed";
    throw new Error(setup);
  }

  relaySessionId = body.session_id;
  relayBridgeToken = body.bridge?.token;
  relayUrl = `${relayBaseUrl.replace(/^http/, "ws")}/ws`;
  return body;
}

async function startHostedRelayBridge() {
  let sessionPackage = null;
  if (hostedRequested && (!relayUrl || !relaySessionId || !relayBridgeToken)) {
    try {
      sessionPackage = await createHostedRelaySession();
    } catch (error) {
      console.error(`Hosted voice session blocked: ${error.message}`);
      console.error(`Relay: ${relayBaseUrl}`);
      console.error("Local mode still works with: node skills/pipa-voice-session/scripts/start-voice-session.mjs");
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
  console.log(sessionId ? `OpenCode session: ${sessionId}` : "OpenCode session: --continue");
  console.log(`Hosted relay: ${relayUrl}`);
  console.log(`Hosted safe-mode args: ${extraArgs.join(" ")}`);
  if (sessionPackage?.browser_url) console.log(`Browser voice session: ${sessionPackage.browser_url}`);
  if (sessionPackage?.browser?.pairing_expires_at) console.log(`Pairing link expires if unused: ${sessionPackage.browser.pairing_expires_at}`);
  console.log("Hosted mode is for planning and discussion, not spoken tool approval or live shell/file execution.");

  const seenTurns = new Set();
  const ws = new WebSocket(url, ["pipa-relay", "pipa-role.bridge", `pipa-session.${relaySessionId}`, `pipa-token.${relayBridgeToken}`], { perMessageDeflate: false });

  ws.on("open", () => {
    ws.send(JSON.stringify({ type: "status", message: "Local bridge connected. Hosted turns will use restricted OpenCode mode." }));
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

    if (isSpokenApprovalOrExecutionRequest(message.text)) {
      ws.send(JSON.stringify({ type: "error", message: "Hosted voice sessions cannot approve OpenCode tools, file edits, or shell commands by speech. Use voice for planning, then return to the normal permission flow for execution." }));
      return;
    }

    seenTurns.add(message.turn_id);
    ws.send(JSON.stringify({ type: "status", message: "Running restricted OpenCode planning turn." }));
    try {
      const reply = await runOpenCodeTurn(message.text, extraArgs);
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

async function waitForNgrokUrl() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < 15_000) {
    try {
      const response = await fetch("http://127.0.0.1:4040/api/tunnels");
      if (response.ok) {
        const body = await response.json();
        const tunnel = body.tunnels?.find((item) => item.public_url?.startsWith("https://"));
        if (tunnel) return tunnel.public_url;
      }
    } catch (_error) {
      // ngrok's local API is not ready yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("ngrok started, but no HTTPS tunnel URL appeared within 15 seconds");
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
      res.end(html);
      return;
    }

    if (req.method === "GET" && req.url === "/favicon.ico") {
      res.writeHead(204, { "Cache-Control": "max-age=86400" });
      res.end();
      return;
    }

    if (req.method === "GET" && req.url === "/api/status") {
      sendJson(res, 200, { ok: true, mode: "local-opencode-bridge", projectDir, opencodeBin, sessionId: sessionId || null });
      return;
    }

    if (req.method === "POST" && req.url === "/api/turn") {
      const body = JSON.parse((await readBody(req)) || "{}");
      const message = String(body.message || "").trim();
      if (!message) {
        sendJson(res, 400, { ok: false, error: "Missing message" });
        return;
      }
      const reply = await runOpenCodeTurn(message);
      sendJson(res, 200, { ok: true, reply });
      return;
    }

    sendJson(res, 404, { ok: false, error: "Not found" });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
});

if (hostedRelayMode) {
  startHostedRelayBridge();
} else {
  server.listen(port, host, async () => {
    console.log(`Pipa voice session: http://${host}:${port}`);
    console.log(`Project directory: ${projectDir}`);
    console.log(sessionId ? `OpenCode session: ${sessionId}` : "OpenCode session: --continue");
    if (publicMode === "ngrok") {
      try {
        await startNgrokTunnel();
      } catch (error) {
        console.error(`ngrok public mode failed: ${error.message}`);
      }
    }
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
