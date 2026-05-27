# Single-Page UI Contract

The primary user-facing artifact is one generated `index.html` listening page. The page should feel like a simple shared working document with audio attached, not a branded media player, directory listing, dashboard, or document portal.

Follow a Frontend Slides-style model:

- one HTML page
- inline CSS and JavaScript
- no npm, build tools, or framework dependency
- deterministic layout from a structured contract
- browser-openable local file or local server URL

## Required Page Contract

```json
{
  "title": "Audio brief title",
  "subtitle": "What the listener will understand",
  "source": {
    "label": "Source name",
    "type": "public_url | local_file | pasted_text | exported_markdown | readable_document",
    "location": "safe URL/path/description",
    "extractionMethod": "tool or manual path",
    "coverageConfidence": "high | medium | low",
    "skippedSections": [],
    "assumptions": [],
    "privacyPosture": "local only"
  },
  "audio": {
    "src": "relative path or data URL",
    "durationLabel": "about 5 minutes",
    "durationSeconds": 300,
    "voice": "Kokoro af_heart",
    "status": "generated | blocked",
    "sanityCheck": "passed | suspiciously_short | blocked"
  },
  "brief": {
    "transcript": "full spoken script",
    "caveatNote": "optional one-sentence source confidence or risk note"
  }
}
```

## Required Regions

1. **Header:** one quiet source label, title, and optional one-sentence subtitle.
2. **Transcript:** readable transcript as the dominant content, with section headings and optional timestamps when available.
3. **Audio dock:** fixed or sticky native audio player near the bottom of the viewport, with a simple play/pause affordance and optional time label.
4. **Source note:** one compact line or details disclosure for coverage confidence, skipped sections, assumptions, or privacy notes when they matter.

## Default Page Format

Use the read-along document format by default:

- page width around `720-780px`, centered
- plain sticky top bar with the generated title only when useful
- source label as quiet text, not a badge or pill
- title in large, restrained sans type
- transcript sections in the body, not inside cards
- timestamps in small muted text when the script has obvious sections
- bottom audio dock with native `<audio controls>`
- minimal source note at the end of the transcript

Keep the page visually low-brand. It should feel closer to a shared document than an app screen.

Recommended DOM shape:

```html
<main>
  <nav aria-label="Page controls">
    <strong>{{shortTitle}}</strong>
  </nav>

  <header>
    <p>{{sourceLabel}}</p>
    <h1>{{title}}</h1>
    <p>{{subtitle}}</p>
  </header>

  <article aria-label="Transcript">
    <section>
      <h2><time>{{timestamp}}</time> {{sectionTitle}}</h2>
      <p>{{transcriptParagraph}}</p>
    </section>
  </article>
</main>

<nav aria-label="Audio controls">
  <button aria-label="Pause audio">Pause</button>
  <audio controls preload="metadata">
    <source src="{{audio.src}}" type="audio/wav" />
  </audio>
  <span>{{elapsed}} / {{duration}}</span>
</nav>
```

Recommended style constraints:

- use OKLCH tinted near-white background and near-black text, never pure black or white
- center the document column, around `760px` wide
- use one system font stack
- use thin dividers for structure instead of cards
- use a small rectangular audio dock, not a floating branded media widget
- avoid shadows unless a subtle dock shadow is needed to separate audio controls from text

## Interaction Rules

- Provide native audio controls at minimum.
- Show duration near the player when available. Kokoro voice can stay in the final handoff response; do not make it prominent UI unless useful for debugging.
- If audio duration is suspiciously short, show a visible blocker instead of presenting the brief as ready.
- Transcript navigation or chapter links are allowed when sections exist.
- Do not require a backend.
- Do not include in-page chat, comments, accounts, or persistent state in V1.
- Do not include copyable prompt cards, key-point card grids, provenance dashboards, metrics, metadata pills, decorative callouts, branded cover art, or secondary panels unless the user explicitly asks for them.

## Visual Rules

- Design for mobile listening first and desktop second, but keep the same document-like page structure on both.
- Keep controls large enough for phone use.
- Use strong contrast and readable type sizes.
- Keep source context compact. Prefer one quiet disclosure over a visible panel.
- Use restrained tinted neutrals with no decorative gradients by default.
- Avoid badges, pills, shadows, pop-outs, and heavy brand moments.
- Avoid generic unstyled markdown dumps.

## Final Response Rule

When the page exists, the agent's final response should return one page URL/path first. Do not list every generated file unless the user asks for raw artifacts.

```md
Audio brief ready: `<path-or-url-to-index.html>`
```
