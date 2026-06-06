#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const skillDir = path.resolve(scriptDir, "..");
const templatePath = path.join(skillDir, "templates", "huddle.html");
const outputPath = path.join(skillDir, "cloudflare", "hosted-session-template.mjs");
const assetDir = path.join(skillDir, "assets");

function dataUri(fileName, mimeType) {
  const data = readFileSync(path.join(assetDir, fileName)).toString("base64");
  return `data:${mimeType};base64,${data}`;
}

function hostedAdapterScript() {
  return String.raw`<script>
      const sessionId = __PIPA_HOSTED_SESSION_ID__;
      const token = new URLSearchParams(location.hash.slice(1)).get("token");
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const wsUrl = (location.protocol === "https:" ? "wss://" : "ws://") + location.host + "/ws/" + encodeURIComponent(sessionId);
      const labels = { ready: "Ready", listening: "Listening", processing: "Thinking", speaking: "Speaking", paused: "Paused", muted: "Muted", disconnected: "Disconnected", blocked: "Ready" };
      const screens = Array.from(document.querySelectorAll("[data-screen]"));
      const transcriptModal = document.querySelector("[data-transcript-modal]");
      const voicePanel = document.querySelector("[data-voice-panel]");
      const voiceOptions = document.querySelector("[data-voice-options]");
      const liveTranscript = document.querySelector("[data-live-transcript]");
      const liveLabel = document.querySelector("[data-transcript-label]");
      const liveText = document.querySelector("[data-transcript-text]");
      const transcriptTurns = document.querySelector("[data-transcript-turns]");
      let availableVoices = [];
      let selectedVoiceName = "";
      let currentUserName = "You";
      const state = { ws:null, paired:false, busy:false, listening:false, muted:false, paused:false, ended:false, recognition:null, finalTranscript:"", interimTranscript:"", silenceTimer:null, maxListenTimer:null, stopRequested:false, thinkingAudio:null, turns:[], turnSeq:0 };
      const sounds = { entering: "__PIPA_ENTRY_SOUND__", thinking: "__PIPA_THINKING_SOUND__" };

      function escapeHtml(value) { return String(value).replace(/[&<>\"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "\"":"&quot;" })[char]); }
      function setVariant(name) { screens.forEach((screen) => screen.classList.toggle("is-active", screen.dataset.screen === name)); }
      function setState(name) { const label = labels[name] || labels.ready; document.querySelectorAll(".screen.is-active [data-state]").forEach((container) => container.dataset.state = ["blocked", "disconnected"].includes(name) ? "ready" : name); document.querySelectorAll(".screen.is-active [data-orb-state]").forEach((el) => el.textContent = label); }
      function setLiveTranscript(text, options = {}) { if (!liveTranscript || !liveLabel || !liveText) return; if (!text) { liveTranscript.classList.remove("is-visible"); liveLabel.textContent = ""; liveText.textContent = ""; return; } liveTranscript.classList.add("is-visible"); liveLabel.textContent = options.label || ""; liveText.textContent = text; liveText.className = "live-transcript-text" + (options.kind ? " " + options.kind : ""); }
      function renderTranscript() { if (!transcriptTurns) return; if (!state.turns.length) { transcriptTurns.innerHTML = '<div class="transcript-section"><h3>Session</h3><div class="transcript-bubble interim">No turns yet.</div></div>'; return; } transcriptTurns.innerHTML = state.turns.map((turn) => { const isAgent = turn.role === "agent"; const label = isAgent ? "Agent" : currentUserName; return '<div class="transcript-section" data-turn="' + (isAgent ? "agent" : "user") + '"><h3>' + escapeHtml(label) + '</h3><div class="transcript-bubble' + (isAgent ? " agent" : "") + '">' + escapeHtml(turn.text) + '</div></div>'; }).join(""); }
      function addTurn(role, text) { state.turns.push({ role, text }); renderTranscript(); }
      function clearSpeechTimers() { if (state.silenceTimer) clearTimeout(state.silenceTimer); if (state.maxListenTimer) clearTimeout(state.maxListenTimer); state.silenceTimer = null; state.maxListenTimer = null; }
      function currentTranscript() { return (state.finalTranscript + " " + state.interimTranscript).trim(); }
      function playSound(src, options = {}) { const audio = new Audio(src); audio.loop = Boolean(options.loop); audio.volume = options.volume ?? 0.55; const started = audio.play(); if (started?.catch) started.catch(() => {}); return audio; }
      function startThinkingSound() { stopThinkingSound(); state.thinkingAudio = playSound(sounds.thinking, { loop: true, volume: 0.35 }); }
      function stopThinkingSound() { if (!state.thinkingAudio) return; state.thinkingAudio.pause(); state.thinkingAudio.currentTime = 0; state.thinkingAudio = null; }
      function selectedVoice() { return availableVoices.find((voice) => voice.name === selectedVoiceName) || null; }
      function speak(text, onDone) { if (!window.speechSynthesis) { if (onDone) window.setTimeout(onDone, 250); return; } window.speechSynthesis.cancel(); const utterance = new SpeechSynthesisUtterance(text); const voice = selectedVoice(); if (voice) utterance.voice = voice; utterance.rate = 1; if (onDone) { utterance.onend = onDone; utterance.onerror = onDone; } window.speechSynthesis.speak(utterance); }
      function enterHuddle(name) { currentUserName = name === "there" ? "You" : name; state.ended = false; setVariant("orb"); setState(state.paired ? "ready" : "paused"); setLiveTranscript(state.paired ? "" : "Waiting for the local OpenCode bridge to connect...", { kind: "interim" }); renderTranscript(); }
      function send(message) { if (state.ws?.readyState === WebSocket.OPEN) state.ws.send(JSON.stringify(message)); }
      function submitTurn(text) { const clean = text.trim(); if (!clean || state.busy || state.ended) return; if (!state.paired) { setState("paused"); setLiveTranscript("Waiting for the local OpenCode bridge to connect...", { kind: "interim" }); return; } state.busy = true; addTurn("user", clean); setState("processing"); setLiveTranscript("Thinking", { kind: "thinking" }); startThinkingSound(); send({ type:"user_turn", turn_id:"browser-" + Date.now() + "-" + (++state.turnSeq), text:clean }); }
      function stopListening(shouldSubmit) { const text = currentTranscript(); state.stopRequested = true; clearSpeechTimers(); try { state.recognition?.stop(); } catch (_error) {} state.recognition = null; state.listening = false; state.finalTranscript = ""; state.interimTranscript = ""; if (shouldSubmit && text) submitTurn(text); else if (!state.busy) { setState("ready"); setLiveTranscript(""); } }
      function scheduleSpeechSubmit() { if (state.silenceTimer) clearTimeout(state.silenceTimer); state.silenceTimer = setTimeout(() => stopListening(true), 1800); }
      function startVoiceTurn(options = {}) { if (state.ended) { setState("disconnected"); setLiveTranscript("The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill", { kind:"interim" }); return; } if (!state.paired) { setState("paused"); setLiveTranscript("Waiting for the local OpenCode bridge to connect...", { kind:"interim" }); return; } if (state.muted) { setState("muted"); setLiveTranscript("Microphone muted. Unmute when you want the huddle to listen again.", { kind:"interim" }); return; } if (state.paused) { setState("paused"); setLiveTranscript("Paused. Press resume when you want the huddle to listen again.", { kind:"interim" }); return; } if (state.busy) return; if (state.listening) return stopListening(true); if (!SpeechRecognition) { setState("ready"); setLiveTranscript("Speech recognition is unavailable in this browser. Use text input by opening the transcript controls in OpenCode.", { kind:"interim" }); return; } const recognition = new SpeechRecognition(); recognition.lang = "en-US"; recognition.continuous = true; recognition.interimResults = true; recognition.maxAlternatives = 1; state.recognition = recognition; state.finalTranscript = ""; state.interimTranscript = ""; state.stopRequested = false; recognition.onstart = () => { state.listening = true; setState("listening"); setLiveTranscript("Listening...", { kind:"interim" }); state.maxListenTimer = setTimeout(() => stopListening(true), 30000); }; recognition.onresult = (event) => { if (state.muted) return; let interim = ""; for (let index = event.resultIndex; index < event.results.length; index += 1) { const transcript = event.results[index][0].transcript.trim(); if (!transcript) continue; if (event.results[index].isFinal) state.finalTranscript = (state.finalTranscript + " " + transcript).trim(); else interim = (interim + " " + transcript).trim(); } state.interimTranscript = interim; const heard = currentTranscript(); if (heard) { setLiveTranscript(heard, { kind:"interim" }); scheduleSpeechSubmit(); } }; recognition.onerror = (event) => { clearSpeechTimers(); state.listening = false; state.recognition = null; setState("ready"); setLiveTranscript((options.automatic ? "Ready, but automatic listening failed: " : "Listening failed: ") + (event.error || "speech recognition unavailable"), { kind:"interim" }); }; recognition.onend = () => { const text = currentTranscript(); clearSpeechTimers(); state.listening = false; state.recognition = null; state.finalTranscript = ""; state.interimTranscript = ""; if (state.stopRequested) return; if (text) submitTurn(text); else if (!state.busy) { setState("ready"); setLiveTranscript(""); } }; recognition.start(); }
      function renderVoiceOptions() { if (!voiceOptions) return; availableVoices = window.speechSynthesis ? window.speechSynthesis.getVoices() : []; const voices = availableVoices.filter((voice) => voice.lang.toLowerCase().startsWith("en")); const renderedVoices = voices.length ? voices : availableVoices; voiceOptions.innerHTML = ""; const defaultButton = document.createElement("button"); defaultButton.className = "voice-option" + (selectedVoiceName ? "" : " is-selected"); defaultButton.type = "button"; defaultButton.textContent = "System default"; defaultButton.addEventListener("click", () => selectVoice("")); voiceOptions.append(defaultButton); renderedVoices.forEach((voice) => { const button = document.createElement("button"); button.className = "voice-option" + (voice.name === selectedVoiceName ? " is-selected" : ""); button.type = "button"; button.textContent = voice.name + " (" + voice.lang + ")"; button.addEventListener("click", () => selectVoice(voice.name)); voiceOptions.append(button); }); }
      function selectVoice(name) { selectedVoiceName = name; renderVoiceOptions(); }
      function connect() { if (!token) { state.ended = true; setVariant("orb"); setState("disconnected"); setLiveTranscript("This link is missing session credentials. Ask your agent to follow the pipa-huddle-beta skill for a new URL.", { kind:"interim" }); return; } state.ws = new WebSocket(wsUrl, ["pipa-relay", "pipa-role.browser", "pipa-session." + sessionId, "pipa-token." + token]); state.ws.onopen = () => { if (!state.paired) setLiveTranscript("Waiting for the local OpenCode bridge to connect...", { kind:"interim" }); }; state.ws.onmessage = (event) => { const message = JSON.parse(event.data); if (message.type === "status") { state.paired = message.state === "paired" || message.state === "active_turn"; if (state.paired && !state.busy && !state.paused && !state.muted) { setState("ready"); setLiveTranscript(""); } else if (message.state === "expired" || message.state === "ended") { state.ended = true; setState("disconnected"); setLiveTranscript("The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill", { kind:"interim" }); } } if (message.type === "assistant_reply") { stopThinkingSound(); state.busy = false; addTurn("agent", message.text); setState("speaking"); setLiveTranscript(message.text, { kind:"agent" }); speak(message.text, () => { if (state.paired && !state.busy && !state.ended && !state.paused && !state.muted) startVoiceTurn({ automatic:true }); }); } if (message.type === "error") { stopThinkingSound(); state.busy = false; setState("ready"); setLiveTranscript("Bridge blocked: " + message.message, { kind:"interim" }); addTurn("System", "Blocked: " + message.message); } if (message.type === "end") { state.ended = true; setState("disconnected"); setLiveTranscript("The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill", { kind:"interim" }); } }; state.ws.onclose = () => { state.paired = false; if (!state.ended) { setState("disconnected"); setLiveTranscript("The relay or local bridge is no longer available. Tell your agent to follow the pipa-huddle-beta skill for a new URL.", { kind:"interim" }); } }; }
      document.querySelectorAll("[data-orb]").forEach((btn) => btn.addEventListener("click", startVoiceTurn));
      document.querySelectorAll("[data-test-speaker]").forEach((btn) => btn.addEventListener("click", () => speak("Ready to get started.")));
      document.querySelectorAll("[data-join]").forEach((btn) => btn.addEventListener("click", () => { const nameInput = document.querySelector("[data-name-input]"); const name = nameInput.value.trim() || "there"; const greetingName = name === "there" ? "there" : name; let entrySoundStarted = false; let greetingStarted = false; const finishJoin = () => { btn.disabled = false; btn.textContent = "Join"; if (state.paired && !state.ended && !state.paused && !state.muted) startVoiceTurn({ automatic:true }); }; const speakGreeting = () => { if (greetingStarted) return; greetingStarted = true; speak("Hi " + greetingName + ", excited to speak to you! What's on your mind?", finishJoin); }; const playEntrySound = () => { if (entrySoundStarted) return; entrySoundStarted = true; enterHuddle(name); const introAudio = new Audio(sounds.entering); introAudio.volume = 0.5; introAudio.addEventListener("ended", speakGreeting, { once:true }); introAudio.addEventListener("error", speakGreeting, { once:true }); const playback = introAudio.play(); if (playback?.catch) playback.catch(speakGreeting); setTimeout(speakGreeting, 1800); }; btn.disabled = true; btn.textContent = "Joining..."; speak("Entering the huddle.", playEntrySound); setTimeout(playEntrySound, 2200); }));
      document.querySelectorAll("[data-transcript]").forEach((btn) => btn.addEventListener("click", () => transcriptModal.classList.add("is-open")));
      document.querySelectorAll("[data-close-transcript]").forEach((btn) => btn.addEventListener("click", () => transcriptModal.classList.remove("is-open")));
      transcriptModal.addEventListener("click", (event) => { if (event.target === transcriptModal) transcriptModal.classList.remove("is-open"); });
      document.querySelectorAll("[data-mute]").forEach((btn) => btn.addEventListener("click", () => { state.muted = !state.muted; if (state.muted) { stopListening(false); setState("muted"); setLiveTranscript("Microphone muted. Unmute when you want the huddle to listen again.", { kind:"interim" }); } else if (!state.ended && !state.paused && !state.busy) startVoiceTurn({ automatic:true }); btn.classList.toggle("is-active", state.muted); }));
      document.querySelectorAll("[data-pause]").forEach((btn) => btn.addEventListener("click", () => { state.paused = !state.paused; if (state.paused) { stopListening(false); setState("paused"); setLiveTranscript("Paused. Press resume when you want the huddle to listen again.", { kind:"interim" }); } else { setLiveTranscript("Resuming listening...", { kind:"interim" }); if (!state.ended && !state.muted && !state.busy) startVoiceTurn({ automatic:true }); } btn.classList.toggle("is-active", state.paused); }));
      document.querySelectorAll("[data-voice]").forEach((btn) => btn.addEventListener("click", () => voicePanel.classList.toggle("is-open")));
      document.querySelectorAll("[data-end-session]").forEach((btn) => btn.addEventListener("click", () => { state.ended = true; try { state.ws?.send(JSON.stringify({ type:"end" })); } catch (_error) {} try { state.ws?.close(1000, "ended"); } catch (_error) {} window.speechSynthesis?.cancel(); stopListening(false); setState("disconnected"); setLiveTranscript("The session is disconnected. To connect a new session, ask your agent to reconnect using the pipa-huddle-beta skill", { kind:"interim" }); }));
      if (window.speechSynthesis) { renderVoiceOptions(); window.speechSynthesis.onvoiceschanged = renderVoiceOptions; }
      connect();
    </script>`;
}

function buildHostedHtml() {
  const template = readFileSync(templatePath, "utf8");
  const scriptStart = template.lastIndexOf("<script>");
  const scriptEnd = template.lastIndexOf("</script>");
  if (scriptStart === -1 || scriptEnd === -1 || scriptEnd <= scriptStart) throw new Error("Could not find huddle template script block");
  return template
    .slice(0, scriptStart)
    .replaceAll('/pipa-mark.png', pipaMark)
    + hostedAdapterScript()
      .replaceAll("__PIPA_ENTRY_SOUND__", entrySound)
      .replaceAll("__PIPA_THINKING_SOUND__", thinkingSound)
    + template.slice(scriptEnd + "</script>".length);
}

const pipaMark = dataUri("pipa-mark.png", "image/png");
const entrySound = dataUri("sound-design-entering-chat.mp3", "audio/mpeg");
const thinkingSound = dataUri("sound-design-thinking.mp3", "audio/mpeg");
const hostedHtml = buildHostedHtml();
const output = `// Generated by scripts/sync-hosted-template.mjs. Do not edit by hand.\n\nexport function hostedSessionHtml(sessionId) {\n  const safeSessionId = JSON.stringify(String(sessionId || "").replace(/[<>&"']/g, ""));\n  return ${JSON.stringify(hostedHtml)}.replace("__PIPA_HOSTED_SESSION_ID__", safeSessionId);\n}\n`;

if (process.argv.includes("--check")) {
  const current = readFileSync(outputPath, "utf8");
  if (current !== output) {
    console.error(`${path.relative(process.cwd(), outputPath)} is stale. Run npm run sync:voice-relay-template.`);
    process.exit(1);
  }
  console.log(`${path.relative(process.cwd(), outputPath)} is up to date`);
  process.exit(0);
}

writeFileSync(outputPath, output);

console.log(`Synced hosted session template to ${path.relative(process.cwd(), outputPath)}`);
