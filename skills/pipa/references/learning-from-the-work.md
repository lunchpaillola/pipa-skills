# Pipa Learn From The Work

Use to close loops, capture lessons, prep handover/archive, update reusable knowledge, or improve future ops.

## Starter Jobs

- Summarize lessons from project/session/PR/launch/delivery cycle.
- Prep closeout, signoff, handover, archive, benefits review.
- Identify next-time changes.
- Reframe old `close`/`lessons`/`archive`/`handover` as public `learn from the work`.

## Required Inputs

- Source: completed notes, acceptance/signoff evidence, session summary, PR, feedback, or `TBD`.
- Reuse destination: docs, tracker, memory, playbook, next plan, or `TBD`.
- Follow-up owner, if known.

## Source Methods

- `references/close-acceptance-signoff.md`: acceptance + signoff.
- `references/close-handover-transition.md`: support ownership + transition.
- `references/close-lessons-learned.md`: retro + learning capture.
- `references/close-benefits-review-and-archive.md`: archive + benefits evidence.
- `references/monitor-status.md`: delivery-state evidence.

## Connected Capabilities

- `pipa-audio-brief`: only listenable/audio review.
- `composio`: only live source retrieval or external doc updates.
- `pipa-triggers`: only recurring/event-driven learning capture.

See `.pipa/CONNECTORS.md` for connector categories: docs, cloud storage, code hosting, project tracker, knowledge base, and memory are common sources here.

## Workflow

1. State source + learning objective.
2. Check acceptance, handover, lessons, archive evidence.
3. Extract lessons with evidence, not vibes.
4. Convert lessons to next-time changes.
5. Name reuse destination, owner, gaps.

## Output Shape

- `Lesson`: concise.
- `Evidence`: source fact, quote, artifact, or `TBD`.
- `Next-time change`: process, artifact, decision, or behavior.
- `Owner`: person or `TBD`.
- `Reuse location`: doc/tracker/memory/playbook or `TBD`.
- `Follow-ups`: unresolved closeout or learning actions.

## Rules

- Do not declare closure without signoff or explicit acceptance evidence.
- Do not store memory/update docs externally unless user asks and tool/workflow exists.
- Do not turn lessons into philosophy when concrete ops change is possible.

## Reference

- `gotchas.md`: closure, archive, and memory-write traps.
- `examples/learning-from-the-work.md`: output examples for lessons, handover, and reuse.
