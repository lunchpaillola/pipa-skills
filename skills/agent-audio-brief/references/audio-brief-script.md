# Audio Brief Script

The audio brief is a concise narrated explainer, not a verbatim readout. It exists because AI agents, coding tools, and document workflows can now produce more artifacts than people can read line by line. The brief should answer the casual request: "Give me the brief."

The listener may be away from the screen. Give them fast orientation, useful judgment, and a coherent story about the artifact.

## Default Length

Default target: **400 to 450 words** for a roughly three-minute spoken brief.

Very short sources should produce short audio notes. Do not pad to meet a duration target. Longer deep-listen briefs are allowed only when the user explicitly asks for depth.

## Voice And Tone

- Sound like a sharp teammate explaining what happened and why it matters.
- Prioritize orientation, judgment, and narrative flow over completeness.
- Use plain human language and short listenable sentences.
- Avoid dense metadata, tables, and exact wording unless the exact wording is the point.
- Be opinionated about what deserves attention.
- Do not flatten every source section into equal-weight summary.
- Do not force categories that do not help the listener.
- Point back to the source for precision instead of overloading the audio with quotes.

## Lightweight Source Shaping

Before drafting, identify these internally:

- artifact type
- listener goal
- 3-5 source-specific points that matter
- any real caveats

Do not save this as a separate artifact unless debugging a blocker. Use it only to make the brief more selective, source-specific, and useful.

## Audio Brief Script Shape

Use this structure unless the user requests another format:

```text
Context And Overview.
What is this artifact, where did it come from, and why does it matter? Orient the listener quickly. Explain what kind of work or review the artifact supports.

The Story.
Give the narrative arc. Explain what happened, what changed, what the document argues, what the agent produced, or how the work unfolded. This should be the main body of the brief.

Attention Areas.
Call out whatever deserves closer attention. This is not only for risks or problems. Depending on the source, attention areas may include strong ideas, surprising points, brittle assumptions, unresolved questions, implementation risks, useful patterns, confusing sections, missing evidence, tradeoffs, or details worth reusing.

Do not force every category. Select only the most useful attention areas for the specific artifact.

Takeaway.
End with the plain-English bottom line. Explain what matters most, what the listener should remember, and the next sensible action if there is one.
```

Write the TTS input as plain speakable text, not Markdown. Do not include `#`, `##`, bullets, table pipes, code fences, decorative separators, raw URLs, or punctuation-heavy labels in the script sent to audio generation. If a visible page transcript needs section headings, add those in `index.html`; do not make Kokoro read Markdown syntax aloud.

## Script Quality Check

Before sending the script to TTS, revise once if needed:

- The script is plain speakable text with no Markdown syntax.
- The brief includes concrete source-specific judgment, not just neutral summary.
- The brief does not claim verification, review, testing, or implementation checks unless those actually happened.
- The takeaway gives a useful bottom line or next action.
- The script is roughly 400-450 words unless the source is short or the user requested a different length.

Do not run repeated optimization loops during normal generation.

## Gotchas

- Kokoro may speak Markdown punctuation literally. If the script starts with `# Audio Brief Script` or `## Context And Overview`, the audio can say “hash hash” before the useful content. Keep the generated audio script free of Markdown heading markers, bullets, table syntax, and other notation that is meant for readers rather than listeners.

## Anti-Patterns

- Do not produce a section-by-section recap that gives every source part equal weight.
- Do not open with filler like "This document discusses" when a sharper source-specific opening is possible.
- Do not copy source headings into the narration unless they are genuinely useful spoken labels.
- Do not turn Attention Areas into generic risks; name the actual point that deserves attention.
- Do not bury the listener in caveats. Include only caveats that change how the brief should be interpreted.
- Do not claim the agent verified, reviewed, tested, or validated anything beyond the source unless that work actually happened.

## Artifact Adaptation

- For code changes or PRs, emphasize what changed, why, impact, and review risk.
- For agent sessions, emphasize the work arc, decisions, discoveries, and unresolved threads.
- For plans or specs, emphasize thesis, structure, assumptions, and next steps.
- For research, emphasize the question, findings, evidence quality, and implications.

The goal is not completeness. The goal is fast orientation, useful judgment, and an immersive listen-first review experience.

## Source Access Rule

- Generate a brief only after reading the requested source well enough to summarize it.
- If the source cannot be accessed or read, do not produce a partial/caveated audio brief. Block clearly and ask for a local file, exported markdown, or pasted text.
- Do not include source-access scoring in the spoken script.

## Visual Or Diagram-Heavy Sources

When important information is visual, say what requires direct viewing. Do not pretend audio captures every diagram, chart, or screenshot detail.
