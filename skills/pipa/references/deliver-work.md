# Pipa Deliver Work

Use this lane when the user wants to coordinate active delivery, understand status, clear blockers, manage risk, triage intake, or keep work moving.

## Starter Jobs

- Produce a current-state delivery update.
- Identify blockers, owner gaps, stale work, dependencies, and escalation needs.
- Triage tickets, client requests, or delivery signals into action now vs later.
- Reframe old `execute`, `monitor`, `status`, or `triage` requests into the public `deliver work` lane.

## Required Inputs

- Work source: tasks, issue list, notes, status thread, plan, or `TBD`.
- Target horizon: today, this week, milestone, launch, or `TBD`.
- Owners, dates, status, and evidence where available.

## Source Methods

- Use `references/execute-work-package-coordination.md` for owner/action/date/status coordination.
- Use `references/execute-iteration-cycle.md` for cycle-level delivery rhythm.
- Use `references/execute-dependency-and-handoff.md` for handoffs and dependencies.
- Use `references/monitor-status.md` for leadership-ready status.
- Use `references/monitor-ticket-triage.md` for intake/ticket sorting.
- Use `references/monitor-risk-escalation.md` for blockers and escalation.

## Connected Capabilities

- Use `pipa-triggers` only when the user asks to automate future delivery updates or event reactions.
- Use `pipa-huddle-beta` only for live voice delivery talk-throughs.
- Use `composio` only for explicit live app reads/writes.

## Workflow

1. State the objective, time horizon, and sources.
2. Summarize current state and what changed.
3. Identify blockers, risks, owner gaps, and stale handoffs.
4. Recommend the smallest next action per item.
5. Flag whether the next lane is `get paid`, `grow relationships`, or `learn from the work`.

## Output Shape

- `Current state`: short summary.
- `What needs attention`: blockers, risks, stale items, or `none found`.
- `Actions`: item, owner, next action, due/review date, status, evidence/source.
- `Escalation trigger`: condition and owner, or `TBD`.
- `Unknowns`: unresolved details as `TBD`.
- `Follow-ups`: minimal next requests.

## Rules

- Do not imply work is done without acceptance evidence.
- Do not create automations from recurring wording until the trigger workflow confirms the proposal.
- Do not route money health or client relationship risk away from this lane unless those intents dominate the request.
