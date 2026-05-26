# Audio Brief Script

The audio brief is a compressed narrated walkthrough, not a verbatim readout. It should sound like a colleague helping the listener understand the source quickly.

## Default Lengths

- **Quick listen:** 1-3 minutes.
- **Standard brief:** 3-7 minutes. Use this by default.
- **Deep listen:** 7-12 minutes when the user asks for depth and the source warrants it.

Very short sources should produce short audio notes. Do not pad to meet a duration target.

## Voice And Tone

- Lead with bottom line up front.
- Use plain human language.
- Keep sentences short enough to understand while walking or listening on a phone.
- Avoid dense metadata, tables, and exact wording unless the exact wording is the point.
- Say uncertainty plainly when source coverage is partial.
- Point back to source sections for precision instead of overloading audio with quotes.

## Required Script Shape

Use this structure unless the user requests another format:

```md
# Audio Brief Script

## Opening
One sentence naming the source and coverage confidence.

## Bottom Line
The main takeaway in 2-4 sentences.

## Main Points
3-7 listener-friendly points, each with why it matters.

## Decisions, Actions, Or Implications
What someone should decide, do, watch, or align on next.

## Risks And Unknowns
Source gaps, unresolved questions, caveats, and direct-viewing needs for diagrams or visuals.

## Follow-Up Prompts
3-5 prompts the listener can copy back into an agent.
```

## Source Coverage Rules

- If source coverage is `high`, the script can summarize confidently while still avoiding invented detail.
- If source coverage is `medium`, include one short caveat about what may be missing.
- If source coverage is `low`, do not present the brief as complete. Ask for a better source when needed.

## Visual Or Diagram-Heavy Sources

When important information is visual, say what requires direct viewing. Do not pretend audio captures every diagram, chart, or screenshot detail.

## Follow-Up Prompt Examples

- "Turn the risks from this brief into an owner/action table."
- "Compare the decisions in this brief against the project scope boundaries."
- "Create a short Slack update from the bottom line and risks."
- "List the open questions I should resolve before execution."
