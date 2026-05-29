# Single-Page UI Contract

The primary user-facing artifact is one generated `index.html` listening page published to here.now. The page should feel like a simple shared working document with audio attached, not a branded media player, directory listing, dashboard, or document portal.

Use `references/listening-page-template.md` as the source of truth. Start from that exact template and replace the content placeholders. Do not create a new visual design each run.

## Required Page Contract

```json
{
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
    "src": "audio/brief.wav",
    "durationLabel": "3:05",
    "durationSeconds": 185,
    "voice": "selected voice (internal metadata only; do not render on the page)",
    "status": "generated | blocked",
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

1. **Header:** one quiet source label, title, and one-sentence subtitle specific to the source content.
2. **Transcript:** four sections matching the script shape: Context And Overview, The Story, Attention Areas, Takeaway.
3. **Audio dock:** fixed native audio player near the bottom of the viewport with duration. If Kokoro is blocked and the user accepts browser speech preview, use the browser speech preview dock from `references/listening-page-template.md` instead.
4. **Source note:** one compact line for source context and concrete caveats when they matter.

## Determinism Rules

- Use the template in `references/listening-page-template.md` exactly.
- Replace placeholders with escaped HTML content.
- Keep the audio path as `audio/brief.wav` unless there is a concrete browser-cache reason to change it during debugging.
- For browser speech preview fallback, keep the same template, spacing, typography, sections, and source note. Replace only the audio dock with the documented preview dock and script. Do not invent a new design.
- Do not add timestamps unless the template is intentionally revised to include timestamp placeholders.
- Do not add key-point cards, provenance panels, copyable follow-up prompts, dashboards, stats, metadata pills, decorative gradients, branded cover art, callouts, TTS voice labels, model names, or secondary UI.
- Do not show source-access scoring.
- Do not mention the Kokoro backend, model, or voice in the page UI.

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
