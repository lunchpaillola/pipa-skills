# Listening Page Template

Use this exact HTML structure and styling for every successful audio brief page. Replace the placeholder text values, transcript paragraphs, and audio dock. Do not redesign the page, add cards, add badges, change spacing, change colors, or introduce new regions unless the user explicitly asks for a different page design.

The final generated directory should contain this rendered file as `index.html`. Browser speech mode does not require an audio file. Polished Kokoro mode includes the final audio file at `audio/brief.wav`.

Browser speech is the default mode for sandbox-friendly audio briefs. Kokoro is an optional polished audio mode for users who accept the extra setup time and memory requirements.

## Required Replacements

- `{{PAGE_TITLE}}`: Browser title, usually `Audio Brief: <source title>`.
- `{{SHORT_TITLE}}`: Sticky top label, usually `Audio Brief`.
- `{{SOURCE_LABEL}}`: Quiet source label, such as `Plan document` or `Strategy memo`.
- `{{TITLE}}`: Main page title.
- `{{SUBTITLE}}`: One plain-language sentence describing the source being briefed.
- `{{CONTEXT_AND_OVERVIEW_PARAGRAPHS}}`: Escaped transcript paragraphs for section 1, rendered as one or more `<p>...</p>` blocks.
- `{{THE_STORY_PARAGRAPHS}}`: Escaped transcript paragraphs for section 2, rendered as one or more `<p>...</p>` blocks.
- `{{ATTENTION_AREAS_PARAGRAPHS}}`: Escaped transcript paragraphs for section 3, rendered as one or more `<p>...</p>` blocks.
- `{{TAKEAWAY_PARAGRAPHS}}`: Escaped transcript paragraphs for section 4, rendered as one or more `<p>...</p>` blocks.
- `{{SOURCE_NOTE}}`: Compact source and caveat line. Include publish/privacy caveats only when materially useful.
- `{{DURATION_LABEL}}`: Duration label such as `3:05`.
- `{{AUDIO_DOCK}}`: Native WAV audio dock for Kokoro mode or browser speech controls for default mode.
- `{{BROWSER_SPEECH_SCRIPT}}`: Browser speech JavaScript for default mode or an empty string for Kokoro mode.

## HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{{PAGE_TITLE}}</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --page: oklch(0.99 0.002 250);
    --surface: oklch(0.965 0.003 250);
    --surface-raised: oklch(0.985 0.002 250);
    --ink: oklch(0.18 0.004 250);
    --muted: oklch(0.48 0.006 250);
    --line: oklch(0.84 0.004 250);
    --control: oklch(0.24 0.006 250);
    --control-hover: oklch(0.32 0.006 250);
    --active: oklch(0.96 0.035 82);
  }
  html { background: var(--page); }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: var(--page);
    color: var(--ink);
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
  }
  main {
    max-width: 720px;
    margin: 0 auto;
    padding: 56px 24px 150px;
  }
  nav.top {
    position: sticky;
    top: 0;
    background: var(--page);
    padding: 14px 0;
    border-bottom: 1px solid var(--line);
    z-index: 10;
    margin-bottom: 36px;
  }
  nav.top strong {
    font-size: 13px;
    color: var(--muted);
    letter-spacing: 0.02em;
    font-weight: 500;
  }
  header { margin-bottom: 44px; }
  header .source-label {
    font-size: 12px;
    color: var(--muted);
    letter-spacing: 0.01em;
    margin-bottom: 10px;
    font-weight: 400;
  }
  header h1 {
    font-size: 32px;
    font-weight: 700;
    line-height: 1.2;
    color: var(--ink);
    margin-bottom: 14px;
    letter-spacing: -0.01em;
  }
  header .subtitle {
    font-size: 16px;
    color: var(--muted);
    line-height: 1.6;
  }
  article { padding-bottom: 44px; }
  article section { margin-bottom: 40px; }
  article h2 {
    font-size: 18px;
    font-weight: 600;
    color: var(--ink);
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--line);
    letter-spacing: -0.01em;
  }
  article p {
    font-size: 16px;
    color: var(--ink);
    margin-bottom: 1.25em;
  }
  article p span[data-speech-segment] {
    border-radius: 4px;
    padding: 1px 0;
    transition: background 160ms cubic-bezier(0.22, 1, 0.36, 1);
    cursor: pointer;
  }
  article p span[data-speech-segment]:hover {
    background: oklch(0.97 0.002 250);
  }
  article p span.is-speaking {
    background: var(--active);
  }
  nav.audio-dock {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: color-mix(in oklch, var(--surface) 92%, transparent);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-top: 1px solid var(--line);
    padding: 12px 24px;
    display: grid;
    grid-template-columns: minmax(120px, 1fr) auto minmax(120px, 1fr);
    align-items: center;
    gap: 16px;
    z-index: 20;
  }
  nav.audio-dock audio {
    flex: 1;
    height: 36px;
  }
  nav.audio-dock .duration {
    font-size: 13px;
    color: var(--muted);
    white-space: nowrap;
  }
  nav.audio-dock.speech-dock button,
  nav.audio-dock.speech-dock .voice-menu summary {
    border: 1px solid var(--line);
    background: transparent;
    color: var(--ink);
    border-radius: 10px;
    min-width: 76px;
    min-height: 38px;
    padding: 8px 12px;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    transition: background 160ms cubic-bezier(0.22, 1, 0.36, 1), border-color 160ms cubic-bezier(0.22, 1, 0.36, 1), color 160ms cubic-bezier(0.22, 1, 0.36, 1);
    outline: none;
  }
  nav.audio-dock.speech-dock button:focus-visible,
  nav.audio-dock.speech-dock .voice-menu summary:focus-visible {
    outline: 2px solid var(--control);
    outline-offset: 2px;
  }
  nav.audio-dock.speech-dock button svg,
  nav.audio-dock.speech-dock .voice-menu summary svg {
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    stroke: currentColor;
  }
  nav.audio-dock.speech-dock button:hover,
  nav.audio-dock.speech-dock .voice-menu summary:hover {
    border-color: oklch(0.68 0.006 250);
    background: oklch(0.94 0.003 250);
  }
  nav.audio-dock.speech-dock button.primary {
    background: var(--control);
    border-color: var(--control);
    color: var(--page);
    border-radius: 999px;
    min-width: 104px;
    font-size: 14px;
    font-weight: 600;
  }
  nav.audio-dock.speech-dock button.primary:hover {
    background: var(--control-hover);
    border-color: var(--control-hover);
  }
  nav.audio-dock.speech-dock button:disabled {
    color: var(--muted);
    cursor: not-allowed;
    opacity: 0.6;
  }
  nav.audio-dock.speech-dock .speech-status {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-self: start;
    min-width: 0;
  }
  nav.audio-dock.speech-dock .speech-controls {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    justify-self: center;
    min-width: 0;
  }
  nav.audio-dock.speech-dock .voice-menu {
    position: relative;
    flex: 0 0 auto;
  }
  nav.audio-dock.speech-dock .voice-menu summary {
    list-style: none;
  }
  nav.audio-dock.speech-dock .voice-menu summary::-webkit-details-marker {
    display: none;
  }
  nav.audio-dock.speech-dock .voice-menu[open] summary {
    border-color: oklch(0.68 0.006 250);
    background: var(--surface-raised);
  }
  nav.audio-dock.speech-dock .voice-panel {
    position: fixed;
    left: 50%;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 82px);
    transform: translateX(-50%);
    width: min(420px, calc(100vw - 32px));
    padding: 14px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--surface-raised);
    box-shadow: 0 18px 42px oklch(0.18 0.004 250 / 0.14);
    z-index: 30;
  }
  nav.audio-dock.speech-dock .voice-panel label {
    display: block;
    color: var(--muted);
    font-size: 12px;
    margin-bottom: 8px;
  }
  nav.audio-dock.speech-dock select {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 10px;
    background: var(--surface-raised);
    color: var(--ink);
    font: inherit;
    font-size: 13px;
    min-height: 42px;
    padding: 8px 28px 8px 10px;
    outline: none;
  }
  nav.audio-dock.speech-dock select:focus-visible {
    outline: 2px solid var(--control);
    outline-offset: 2px;
  }
  .source-note {
    font-size: 12px;
    color: var(--muted);
    border-top: 1px solid var(--line);
    padding-top: 16px;
    margin-top: 40px;
    line-height: 1.6;
  }
  @media (max-width: 1024px) {
    main { padding: 48px 24px 150px; }
  }
  @media (max-width: 768px) {
    main { padding: 40px 20px 170px; }
    header h1 { font-size: 28px; }
    article p { font-size: 15px; }
    nav.audio-dock { grid-template-columns: 1fr; gap: 8px; }
    nav.audio-dock.speech-dock .speech-status { justify-self: center; }
    nav.audio-dock.speech-dock .voice-panel { bottom: calc(env(safe-area-inset-bottom, 0px) + 118px); }
  }
  @media (max-width: 640px) {
    main { padding: 32px 18px 170px; }
    header h1 { font-size: 26px; }
    nav.audio-dock { padding: 10px 14px 12px; }
    nav.audio-dock.speech-dock .speech-controls { flex-wrap: nowrap; justify-self: stretch; gap: 6px; }
    nav.audio-dock.speech-dock .speech-controls button { flex: 1 1 0; min-width: 0; min-height: 40px; padding: 8px 6px; font-size: 12px; }
    nav.audio-dock.speech-dock .speech-controls button.primary { min-width: 0; font-size: 13px; }
    nav.audio-dock.speech-dock .voice-menu summary { min-width: 0; min-height: 40px; padding: 8px 10px; }
    nav.audio-dock.speech-dock button svg,
    nav.audio-dock.speech-dock .voice-menu summary svg { width: 14px; height: 14px; }
  }
  @media (max-width: 480px) {
    main { padding: 28px 16px 160px; }
    header h1 { font-size: 24px; }
    article h2 { font-size: 16px; }
    nav.audio-dock.speech-dock .speech-controls button span,
    nav.audio-dock.speech-dock .voice-menu summary span { display: none; }
    nav.audio-dock.speech-dock .speech-controls button,
    nav.audio-dock.speech-dock .voice-menu summary { min-height: 44px; }
    nav.audio-dock.speech-dock button svg,
    nav.audio-dock.speech-dock .voice-menu summary svg { width: 18px; height: 18px; }
    nav.audio-dock.speech-dock .speech-status { font-size: 12px; }
    nav.audio-dock.speech-dock .voice-panel {
      left: 12px;
      right: 12px;
      bottom: calc(env(safe-area-inset-bottom, 0px) + 112px);
      width: calc(100vw - 24px);
      transform: none;
    }
  }
</style>
</head>
<body>
  <main>
    <nav class="top" aria-label="Page controls">
      <strong>{{SHORT_TITLE}}</strong>
    </nav>

    <header>
      <p class="source-label">{{SOURCE_LABEL}}</p>
      <h1>{{TITLE}}</h1>
      <p class="subtitle">{{SUBTITLE}}</p>
    </header>

    <article aria-label="Transcript">
      <section>
        <h2>Context And Overview</h2>
        {{CONTEXT_AND_OVERVIEW_PARAGRAPHS}}
      </section>

      <section>
        <h2>The Story</h2>
        {{THE_STORY_PARAGRAPHS}}
      </section>

      <section>
        <h2>Attention Areas</h2>
        {{ATTENTION_AREAS_PARAGRAPHS}}
      </section>

      <section>
        <h2>Takeaway</h2>
        {{TAKEAWAY_PARAGRAPHS}}
      </section>

      <p class="source-note">{{SOURCE_NOTE}}</p>
    </article>
  </main>

  {{AUDIO_DOCK}}
  {{BROWSER_SPEECH_SCRIPT}}
</body>
</html>
```

## Default Browser Speech Dock

Use this for normal sandbox-friendly runs. The page is a transcript-first listening page and does not include `audio/brief.wav`.

The renderer fills `{{AUDIO_DOCK}}` with:

```html
  <nav class="audio-dock speech-dock" aria-label="Browser speech controls">
    <div class="speech-status" aria-live="polite">
      <span id="speech-status" class="duration">Browser speech</span>
    </div>
    <div class="speech-controls">
      <button id="speech-back" type="button" aria-label="Back one sentence"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 6 5 12l6 6"/><path d="M19 6 13 12l6 6"/></svg><span>Back</span></button>
      <button id="speech-toggle" class="primary" type="button"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path data-play-icon d="M8 5v14l11-7Z"/><path data-pause-icon d="M8 5v14" style="display:none"/><path data-pause-icon d="M16 5v14" style="display:none"/></svg><span>Play</span></button>
      <button id="speech-restart" type="button"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7v6h6"/><path d="M20 17a8 8 0 0 0-14-5.3L4 13"/></svg><span>Restart</span></button>
      <button id="speech-forward" type="button" aria-label="Forward one sentence"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m13 6 6 6-6 6"/><path d="m5 6 6 6-6 6"/></svg><span>Forward</span></button>
      <details id="voice-menu" class="voice-menu">
        <summary aria-label="Choose voice"><svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h10"/><path d="M18 7h2"/><path d="M16 5v4"/><path d="M4 17h2"/><path d="M10 17h10"/><path d="M8 15v4"/></svg><span>Voice</span></summary>
        <div class="voice-panel">
          <label for="speech-voice">Voice</label>
          <select id="speech-voice"></select>
        </div>
      </details>
    </div>
  </nav>
```

The renderer fills `{{BROWSER_SPEECH_SCRIPT}}` with:

```html
<script>
  const segments = {{SPEECH_SEGMENTS_JSON}};
  const toggle = document.getElementById("speech-toggle");
  const toggleLabel = toggle.querySelector("span");
  const playIcon = toggle.querySelector("[data-play-icon]");
  const pauseIcons = toggle.querySelectorAll("[data-pause-icon]");
  const restart = document.getElementById("speech-restart");
  const back = document.getElementById("speech-back");
  const forward = document.getElementById("speech-forward");
  const status = document.getElementById("speech-status");
  const voiceMenu = document.getElementById("voice-menu");
  const voiceSelect = document.getElementById("speech-voice");
  let currentIndex = 0;
  let speaking = false;
  let paused = false;
  let runId = 0;
  let voices = [];

  function setToggle(label, icon) {
    toggleLabel.textContent = label;
    playIcon.style.display = icon === "play" ? "" : "none";
    pauseIcons.forEach((node) => { node.style.display = icon === "pause" ? "" : "none"; });
  }

  function setActive(index) {
    document.querySelectorAll("[data-speech-segment]").forEach((node) => {
      node.classList.toggle("is-speaking", Number(node.dataset.speechSegment) === index);
    });
    const active = document.querySelector(`[data-speech-segment="${index}"]`);
    if (active) active.scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function voiceScore(voice) {
    const name = voice.name.toLowerCase();
    const lang = (voice.lang || "").toLowerCase();
    let score = lang.startsWith("en") ? 10 : 0;
    if (name.includes("google") || name.includes("chrome")) score += 8;
    if (name.includes("natural") || name.includes("enhanced") || name.includes("premium")) score += 5;
    if (name.includes("samantha") || name.includes("victoria")) score += 2;
    if (voice.default) score += 1;
    return score;
  }

  function loadVoices() {
    voices = window.speechSynthesis.getVoices().sort((a, b) => voiceScore(b) - voiceScore(a));
    voiceSelect.innerHTML = "";
    voices.forEach((voice, index) => {
      const option = document.createElement("option");
      option.value = voice.name;
      option.textContent = `${voice.name} (${voice.lang || "unknown"})`;
      voiceSelect.appendChild(option);
      if (index === 0) voiceSelect.value = voice.name;
    });
    voiceSelect.disabled = voices.length === 0;
  }

  function selectVoice() {
    return voices.find((voice) => voice.name === voiceSelect.value) || voices[0] || null;
  }

  function speakFrom(index) {
    runId += 1;
    const token = runId;
    window.speechSynthesis.cancel();
    if (index >= segments.length) {
      speaking = false;
      paused = false;
      currentIndex = 0;
      setToggle("Play", "play");
      status.textContent = "Browser speech";
      setActive(-1);
      return;
    }

    currentIndex = Math.max(0, index);
    const utterance = new SpeechSynthesisUtterance(segments[currentIndex]);
    const voice = selectVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => {
      if (token === runId) setActive(currentIndex);
    };
    utterance.onend = () => {
      if (token === runId) speakFrom(currentIndex + 1);
    };
    utterance.onerror = () => {
      if (token !== runId) return;
      speaking = false;
      paused = false;
      setToggle("Play", "play");
      status.textContent = "Browser speech stopped";
    };
    speaking = true;
    paused = false;
    setToggle("Pause", "pause");
    status.textContent = `Playing ${currentIndex + 1} of ${segments.length}`;
    window.speechSynthesis.speak(utterance);
  }

  if (!("speechSynthesis" in window)) {
    [toggle, restart, back, forward, voiceSelect].forEach((control) => { control.disabled = true; });
    status.textContent = "Browser speech unavailable";
  } else {
    loadVoices();
    window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
  }

  // Click transcript sentences to jump playback
  document.querySelectorAll("[data-speech-segment]").forEach((node) => {
    node.addEventListener("click", () => {
      const index = Number(node.dataset.speechSegment);
      if (!isNaN(index)) speakFrom(index);
    });
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.target && ["BUTTON", "INPUT", "SELECT", "SUMMARY", "TEXTAREA"].includes(e.target.tagName)) return;
    if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      toggle.click();
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      back.click();
      return;
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      forward.click();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      if (voiceMenu.open) {
        voiceMenu.open = false;
        return;
      }
      runId += 1;
      window.speechSynthesis.cancel();
      speaking = false;
      paused = false;
      currentIndex = 0;
      setToggle("Play", "play");
      status.textContent = "Browser speech";
      setActive(-1);
    }
  });

  document.addEventListener("click", (e) => {
    if (voiceMenu.open && !voiceMenu.contains(e.target)) voiceMenu.open = false;
  });

  toggle.addEventListener("click", () => {
    if (!speaking) {
      speakFrom(currentIndex);
      return;
    }
    if (paused) {
      window.speechSynthesis.resume();
      paused = false;
      setToggle("Pause", "pause");
      status.textContent = `Playing ${currentIndex + 1} of ${segments.length}`;
      return;
    }
    window.speechSynthesis.pause();
    paused = true;
    setToggle("Resume", "play");
    status.textContent = "Paused";
  });

  restart.addEventListener("click", () => speakFrom(0));
  back.addEventListener("click", () => speakFrom(Math.max(0, currentIndex - 1)));
  forward.addEventListener("click", () => speakFrom(Math.min(segments.length - 1, currentIndex + 1)));
  voiceSelect.addEventListener("change", () => {
    if (speaking) speakFrom(currentIndex);
  });

  window.addEventListener("beforeunload", () => {
    runId += 1;
    window.speechSynthesis.cancel();
  });
</script>
```

Required speech replacement:

- `{{SPEECH_SEGMENTS_JSON}}`: JSON array of speakable transcript sentences in reading order. Each rendered transcript sentence must have a matching `data-speech-segment` index so highlighting stays aligned.
- Browser speech should highlight sentences, not whole paragraphs. Word-level highlighting depends on inconsistent browser boundary events and should not be the default.
- The voice selector should prefer English Chrome/Google voices when available, then other natural/enhanced English voices, then the browser default.

Keep the script text plain and speakable. Do not include Markdown heading markers, bullets, table pipes, code fences, decorative separators, raw URLs, or punctuation-heavy labels in the browser speech text.

## Optional Kokoro Audio Dock

Use this only when the user asks for polished generated audio and accepts the memory/time tradeoff.

The renderer fills `{{AUDIO_DOCK}}` with:

```html
  <nav class="audio-dock" aria-label="Audio controls">
    <audio controls preload="metadata">
      <source src="audio/brief.wav" type="audio/wav">
    </audio>
    <span class="duration">{{DURATION_LABEL}}</span>
  </nav>
```

Kokoro mode should still preserve the same transcript sections and source note. Do not mention the model or voice in the page UI.
