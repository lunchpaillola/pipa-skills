# Listening Page Template

Use this exact HTML structure and styling for every successful audio brief page. Replace the placeholder text values and transcript paragraphs. Do not redesign the page, add cards, add badges, change spacing, change colors, or introduce new regions unless the user explicitly asks for a different page design.

The final generated directory should contain this rendered file as `index.html` and the final audio file at `audio/brief.wav`.

If Kokoro generation is blocked and the user accepts a browser SpeechSynthesis preview, use the same page structure and styling. Replace only the audio dock with the browser speech preview dock below, add the fallback CSS below to the existing `<style>` block, and add the fallback script before `</body>`. Do not create a separate visual design.

## Required Replacements

- `{{PAGE_TITLE}}`: Browser title, usually `Audio Brief: <source title>`.
- `{{SHORT_TITLE}}`: Sticky top label, usually `Audio Brief`.
- `{{SOURCE_LABEL}}`: Quiet source label, such as `Plan document` or `Strategy memo`.
- `{{TITLE}}`: Main page title.
- `{{SUBTITLE}}`: One plain-language sentence describing the source being briefed.
- `{{CONTEXT_AND_OVERVIEW}}`: Transcript paragraph for section 1.
- `{{THE_STORY}}`: Transcript paragraph for section 2.
- `{{ATTENTION_AREAS}}`: Transcript paragraph for section 3.
- `{{TAKEAWAY}}`: Transcript paragraph for section 4.
- `{{SOURCE_NOTE}}`: Compact source and caveat line. Include publish/privacy caveats only when materially useful.
- `{{DURATION_LABEL}}`: Duration label such as `3:05`.

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
  html { background: #ffffff; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #ffffff;
    color: #1a1a1a;
    line-height: 1.65;
    -webkit-font-smoothing: antialiased;
  }
  main {
    max-width: 760px;
    margin: 0 auto;
    padding: 48px 24px 160px;
  }
  nav.top {
    position: sticky;
    top: 0;
    background: #ffffff;
    padding: 12px 0;
    border-bottom: 1px solid #e5e5e5;
    z-index: 10;
    margin-bottom: 32px;
  }
  nav.top strong {
    font-size: 13px;
    color: #666666;
    letter-spacing: 0.02em;
  }
  header { margin-bottom: 40px; }
  header .source-label {
    font-size: 12px;
    color: #888888;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
  }
  header h1 {
    font-size: 28px;
    font-weight: 600;
    line-height: 1.25;
    color: #111111;
    margin-bottom: 12px;
  }
  header .subtitle {
    font-size: 15px;
    color: #555555;
    line-height: 1.5;
  }
  article { padding-bottom: 40px; }
  article section { margin-bottom: 36px; }
  article h2 {
    font-size: 16px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 12px;
    padding-bottom: 6px;
    border-bottom: 1px solid #eeeeee;
  }
  article p {
    font-size: 15px;
    color: #333333;
    margin-bottom: 14px;
  }
  nav.audio-dock {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #fafafa;
    border-top: 1px solid #e0e0e0;
    padding: 12px 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 20;
  }
  nav.audio-dock audio {
    flex: 1;
    height: 36px;
  }
  nav.audio-dock .duration {
    font-size: 12px;
    color: #888888;
    white-space: nowrap;
  }
  .source-note {
    font-size: 12px;
    color: #999999;
    border-top: 1px solid #eeeeee;
    padding-top: 16px;
    margin-top: 40px;
  }
  @media (max-width: 640px) {
    main { padding: 32px 18px 150px; }
    header h1 { font-size: 24px; }
    nav.audio-dock { padding: 10px 12px; gap: 10px; }
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
        <p>{{CONTEXT_AND_OVERVIEW}}</p>
      </section>

      <section>
        <h2>The Story</h2>
        <p>{{THE_STORY}}</p>
      </section>

      <section>
        <h2>Attention Areas</h2>
        <p>{{ATTENTION_AREAS}}</p>
      </section>

      <section>
        <h2>Takeaway</h2>
        <p>{{TAKEAWAY}}</p>
      </section>

      <p class="source-note">{{SOURCE_NOTE}}</p>
    </article>
  </main>

  <nav class="audio-dock" aria-label="Audio controls">
    <audio controls preload="metadata">
      <source src="audio/brief.wav" type="audio/wav">
    </audio>
    <span class="duration">{{DURATION_LABEL}}</span>
  </nav>
</body>
</html>
```

## Browser Speech Preview Fallback

Use this only when Kokoro setup or generation is blocked by the local machine and the user accepts a degraded browser speech preview. The page is still a transcript-first listening page, but it does not include `audio/brief.wav`.

Replace the normal audio dock with:

```html
  <nav class="audio-dock speech-preview" aria-label="Browser speech preview controls">
    <button id="speech-toggle" type="button">Play preview</button>
    <span id="speech-status" class="duration">Browser speech preview</span>
  </nav>
```

Add this CSS inside the existing `<style>` block:

```css
  nav.audio-dock.speech-preview button {
    border: 1px solid #d0d0d0;
    background: #ffffff;
    color: #222222;
    border-radius: 999px;
    padding: 8px 14px;
    font: inherit;
    font-size: 13px;
    cursor: pointer;
  }
  nav.audio-dock.speech-preview button:disabled {
    color: #999999;
    cursor: not-allowed;
  }
```

Add this script before `</body>`:

```html
<script>
  const speechText = [
    {{CONTEXT_AND_OVERVIEW_JSON}},
    {{THE_STORY_JSON}},
    {{ATTENTION_AREAS_JSON}},
    {{TAKEAWAY_JSON}}
  ].join("\n\n");

  const toggle = document.getElementById("speech-toggle");
  const status = document.getElementById("speech-status");
  let speaking = false;

  if (!("speechSynthesis" in window)) {
    toggle.disabled = true;
    status.textContent = "Browser speech unavailable";
  }

  toggle.addEventListener("click", () => {
    if (speaking) {
      window.speechSynthesis.cancel();
      speaking = false;
      toggle.textContent = "Play preview";
      status.textContent = "Browser speech preview";
      return;
    }

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onend = () => {
      speaking = false;
      toggle.textContent = "Play preview";
      status.textContent = "Browser speech preview";
    };
    utterance.onerror = utterance.onend;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    speaking = true;
    toggle.textContent = "Stop preview";
    status.textContent = "Playing in browser";
  });
</script>
```

Required fallback replacements:

- `{{CONTEXT_AND_OVERVIEW_JSON}}`: JSON-stringified version of the same plain speakable transcript text rendered in section 1.
- `{{THE_STORY_JSON}}`: JSON-stringified version of section 2.
- `{{ATTENTION_AREAS_JSON}}`: JSON-stringified version of section 3.
- `{{TAKEAWAY_JSON}}`: JSON-stringified version of section 4.

Keep the script text plain and speakable. Do not include Markdown heading markers, bullets, table pipes, code fences, decorative separators, raw URLs, or punctuation-heavy labels in the browser speech text.
