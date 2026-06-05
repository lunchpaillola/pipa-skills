# Single-Page UI Contract

The primary user-facing artifact is one generated `index.html` listening page published to here.now. The page should feel like a simple shared working document with audio attached, not a branded media player, directory listing, dashboard, or document portal.

Use `references/listening-page-template.md` as the source of truth. For normal runs, write the page contract below as JSON and render it with `scripts/render-listening-page.py <page-contract.json> <publish-dir>/index.html`. The renderer extracts the exact HTML template and replaces the content placeholders. Do not create a new visual design each run.

## Required Page Contract

```json
{
  "pageTitle": "Browser tab title for the listening page",
  "shortTitle": "Short label shown in the page chrome",
  "title": "Audio brief title",
  "subtitle": "Plain-language sentence describing the source document being briefed",
  "source": {
    "label": "Source name",
    "type": "public_url | local_file | pasted_text | exported_markdown | readable_document",
    "location": "safe URL/path/description",
    "extractionMethod": "tool or manual path",
    "skippedSections": [],
    "assumptions": []
  },
  "audio": {
    "mode": "browser_speech | piper | kokoro",
    "src": "audio/brief.wav",
    "durationLabel": "Browser speech or 3:05",
    "durationSeconds": 185,
    "voice": "selected voice (internal metadata only; do not render on the page)",
    "status": "browser_speech | generated | blocked",
    "sanityCheck": "passed | suspiciously_short | blocked"
  },
  "brief": {
    "contextAndOverview": "section transcript",
    "theStory": "section transcript",
    "attentionAreas": "section transcript",
    "takeaway": "section transcript",
    "sourceNote": "compact source/caveat line"
  }
}
```

## Required Regions

1. **Page chrome:** browser tab title from `pageTitle` and compact page label from `shortTitle`.
2. **Header:** one quiet source label, title, and one-sentence subtitle specific to the source content.
3. **Transcript:** four sections matching the script shape: Context And Overview, The Story, Attention Areas, Takeaway.
4. **Audio dock:** fixed browser speech controls near the bottom of the viewport by default, including a compact Settings popover for browser speech rate and voice selection. If the user requested optional Piper or Kokoro mode and generation succeeded, use the native audio player with duration.
5. **Source note:** one compact line for source context and concrete caveats when they matter.

## Determinism Rules

- Use the template in `references/listening-page-template.md` exactly.
- Prefer `scripts/render-listening-page.py` over hand-editing HTML. Hand-render the template only if the helper is unavailable or a fallback speech preview page is explicitly needed.
- Replace placeholders with escaped HTML content.
- Render transcript text as real paragraph blocks with visible spacing. Split each section on blank lines when present, escape each paragraph, and wrap each paragraph in `<p>...</p>` rather than inserting one dense text block with collapsed newlines.
- Set `audio.mode` to `browser_speech` by default. This mode does not require `audio.src`, `durationSeconds`, `voice`, or `sanityCheck`.
- Set `audio.mode` to `piper` or `kokoro` only when the user requested local generated audio and generation succeeded.
- Keep the generated audio path as `audio/brief.wav` unless there is a concrete browser-cache reason to change it during debugging.
- For browser speech mode, keep the same template, spacing, typography, sections, source note, compact playback dock, and Settings popover. Replace only the audio dock with the documented speech dock and script. Do not invent a new design.
- Do not add timestamps unless the template is intentionally revised to include timestamp placeholders.
- Do not add key-point cards, provenance panels, copyable follow-up prompts, dashboards, stats, metadata pills, decorative gradients, branded cover art, callouts, static TTS voice labels, model names, or secondary UI.
- Do not show source-access scoring.
- Do not mention the Piper/Kokoro backend, model, or voice in the page UI. In browser speech mode, the dock may say `Browser speech` and include a Settings popover so the user can choose speed and browser voice.

## Subtitle Rule

The subtitle should be a plain-language, source-specific one-liner that describes the document being briefed. It must not claim the brief performed verification, review work, or implementation checks beyond summarizing and orienting the listener to the source.

Prefer wording like:

```text
A quick review of the plan for the agent-session marketing skill.
```

Avoid:

- "Use this brief to..."
- dense project jargon
- outcome claims
- generic implementation phrasing about local generation, TTS, models, voices, or the audio backend

## Final Response Rule

When the page is published, return the here.now URL first. Do not list raw generated files unless the user asks for them.

```md
Audio brief ready: `<here.now URL>`
```
