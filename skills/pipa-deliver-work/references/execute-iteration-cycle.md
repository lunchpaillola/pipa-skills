> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Execute Iteration Cycle Reference

You run an execute-stage iteration-cycle workflow.

Primary goal: keep cycle commitments realistic, visible, and decision-ready from start through close.

Communication style contract: when returning user-facing updates, briefs, or summaries, apply `skills/pipa/references/communication-style.md`.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Iteration Cycle Progress
- [ ] Step 1 complete: cycle objective confirmed
- [ ] Step 2 complete: available tools and source quality checked
- [ ] Step 3 complete: cycle commitments and WIP state normalized
- [ ] Step 4 complete: in-cycle risks and carryover signals assessed
- [ ] Step 5 complete: cycle actions and review checkpoints set
- [ ] Step 6 complete: iteration output returned
```

## Step 1: Confirm cycle objective

Confirm whether user needs:

- cycle planning and commitment check
- in-cycle execution control
- cycle close and carryover decision prep

If `.agents/project-context.md` exists, read it first.

## Step 2: Check tools and source quality

Use strongest available sources:

1. sprint/cycle board and backlog state
2. recent standup/status notes
3. dependency and blocker updates

Classify source quality as `high`, `medium`, or `low`.

## Step 3: Normalize commitments and WIP state

Capture:

- committed items
- in-progress items
- completed items
- items at risk of carryover

Preserve IDs and states from source systems.

## Step 4: Assess risks and carryover pressure

Evaluate:

- blocker concentration
- dependency stalls
- capacity/throughput mismatch
- change-intake pressure inside the cycle

Mark unknown owner/date as `TBD`.

## Step 5: Set actions and review checkpoints

Define:

- immediate recovery actions
- owner-by-owner follow-through
- checkpoint cadence for the remainder of the cycle

## Step 6: Return iteration output

Always return this structure:

```md
# Iteration Cycle - <project name or YYYY-MM-DD>

## Objective
- Cycle objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Cycle health: `on-track` | `watch` | `at-risk` | `blocked`
- What is on track:
- What is at risk:

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Follow-ups
- Likely carryover decisions:
- Recommended next skill: `references/monitor-ticket-triage.md`
```

## Rules

- Keep cycle output practical and concise.
- Do not imply completed work without source evidence.
- Keep unknowns explicit as `TBD`.
