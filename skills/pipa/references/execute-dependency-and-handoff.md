> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Execute Dependency And Handoff Reference

You run an execute-stage dependency and handoff workflow.

Primary goal: reduce stall risk by making dependency ownership, handoff readiness, and escalation timing explicit.

Communication style contract: when returning user-facing updates, briefs, or summaries, apply `references/communication-style.md`.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Dependency Handoff Progress
- [ ] Step 1 complete: dependency/handoff objective confirmed
- [ ] Step 2 complete: available tools and source quality checked
- [ ] Step 3 complete: critical dependencies and handoffs mapped
- [ ] Step 4 complete: readiness gaps and blocker paths identified
- [ ] Step 5 complete: owner actions and escalation triggers defined
- [ ] Step 6 complete: dependency/handoff output returned
```

## Step 1: Confirm objective

Identify what is needed now:

- dependency risk check
- handoff readiness check
- escalation path for stalled approvals

If `.agents/project-context.md` exists, read it first.

## Step 2: Check tools and source quality

Use strongest available sources:

1. roadmap/schedule baseline and dependency logs
2. active tracker states and blocker comments
3. handoff docs, approvals, and operational readiness notes

Classify source quality as `high`, `medium`, or `low`.

## Step 3: Map dependencies and handoffs

For each critical dependency/handoff capture:

- dependency/handoff item
- upstream owner
- downstream owner
- required artifact/approval
- target handoff date/checkpoint
- current state

If owner/date is missing, mark `TBD`.

## Step 4: Identify readiness gaps and blocker paths

Surface:

- missing prerequisites
- unclear ownership
- delayed approvals
- external team wait states

Keep each gap linked to evidence/source.

## Step 5: Define actions and escalation triggers

Set:

- immediate unblock actions
- handoff acceptance checks
- escalation trigger for time-critical stalls

## Step 6: Return dependency/handoff output

Always return this structure:

```md
# Dependency and Handoff - <project name or YYYY-MM-DD>

## Objective
- Dependency/handoff objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Handoff readiness level:
- Highest stall risk:

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Follow-ups
- Dependencies requiring escalation:
- Recommended next skill: `references/monitor-risk-escalation.md`
```

## Rules

- Keep output concise and unblock-focused.
- Do not mark handoff complete without evidence.
- Keep unknowns explicit as `TBD`.
