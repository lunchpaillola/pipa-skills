# Context Handoff

Use this only when the voice session ends with execution intent, planning intent, or an explicit request to continue in the active agent.

Do not save or return raw transcript by default. Synthesize what matters.

For launch context before a huddle starts, use the same selectivity but keep it even shorter. Include only the current goal, relevant repo/files, confirmed decisions or preferences, open questions, and what the huddle should not assume. Write it to `.pipa/voice-session/launch-context.md` and pass it to the bridge with `--context-file .pipa/voice-session/launch-context.md`.

## Handoff Shape

```md
## Voice Session Handoff

**Topic:** <what the conversation was about>

**Useful Context:**
- <fact, constraint, source, or goal that should inform later work>

**Decisions And Preferences:**
- <confirmed decision or preference>

**Open Questions:**
- <question that still blocks or changes execution>

**Recommended Next Agent Step:**
<one short next action>

**Continuation Prompt:**
<copyable prompt for the active agent, only if useful>
```

## Quality Bar

A good handoff is:

- selective, not transcript-shaped
- honest about unknowns
- clear about what was decided versus merely discussed
- suitable to paste into an active agent session
- short enough to be reviewed quickly after a walk or call

## Contradictions

If the user gives conflicting preferences, do not silently choose one. Include the contradiction in **Open Questions** or ask a clarification before producing the handoff.

## Early Exit

If the user ends early, produce a partial handoff only when it helps. Mark readiness honestly:

```md
**Recommended Next Agent Step:** Ask the remaining open questions before implementation.
```

## Continuation Prompt Pattern

Use a direct prompt when useful:

```md
Continue from this voice-session handoff. First resolve the open questions that affect scope, then propose the smallest useful next step. Do not treat exploratory comments as confirmed requirements unless listed under Decisions And Preferences.
```
