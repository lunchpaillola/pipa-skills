# Single-Page UI Contract

The primary user-facing artifact is one generated `index.html` listening page. The page should feel like a small generated product surface, not a directory listing.

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
    "bottomLine": "2-4 sentence bottom line",
    "keyPoints": ["point one"],
    "decisionsOrActions": ["action one"],
    "risksAndUnknowns": ["risk one"],
    "transcript": "full spoken script"
  },
  "followUpPrompts": [
    "Prompt the user can copy back into an agent"
  ]
}
```

## Required Regions

1. **Hero:** title, subtitle, source label, coverage confidence, and privacy posture.
2. **Audio player card:** prominent player, duration, voice/status, and short instruction.
3. **Key points:** 3-7 scannable cards or bullets.
4. **Transcript:** readable transcript with enough spacing for skim-after-listen.
5. **Source/provenance panel:** extraction method, skipped sections, assumptions, and safety/privacy notes.
6. **Follow-up prompt cards:** copyable prompts for continuing in an agent.

## Interaction Rules

- Provide native audio controls at minimum.
- Show the Kokoro voice and duration near the player.
- If audio duration is suspiciously short, show a visible blocker instead of presenting the brief as ready.
- Copy buttons for follow-up prompts are allowed with small inline JavaScript.
- Transcript navigation or chapter links are allowed when sections exist.
- Do not require a backend.
- Do not include in-page chat, comments, accounts, or persistent state in V1.

## Visual Rules

- Design for mobile listening first and desktop second.
- Keep controls large enough for phone use.
- Use strong contrast and readable type sizes.
- Keep provenance compact but visible.
- Avoid generic unstyled markdown dumps.

## Final Response Rule

When the page exists, the agent's final response should return one page URL/path first. Do not list every generated file unless the user asks for raw artifacts.

```md
Audio brief ready: `<path-or-url-to-index.html>`
```
