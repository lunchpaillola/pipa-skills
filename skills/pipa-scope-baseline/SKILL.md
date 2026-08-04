---
name: pipa-scope-baseline
description: "Use when the user explicitly wants to baseline project scope and schedule: deliverables, exclusions, milestones, assumptions, tolerances, or change triggers."
metadata:
  version: 0.1.0
---

# Pipa Scope Baseline

Establish a usable scope and schedule baseline.

Apply `skills/pipa/references/communication-style.md` to user-facing output. Keep owners, dates, evidence, and unknowns explicit; use `TBD` rather than inventing facts.

## Workflow

Track baseline objective, source check, scope definition, schedule assumptions, tolerance/change triggers, and final handoff in working notes as each step completes.

1. Confirm which scope boundary, timeline, milestones, assumptions, constraints, and tolerances need baselining.
2. Check requirements, charter, roadmap drafts, estimates, dependencies, staffing, and approvals. Continue with partial evidence and mark gaps `TBD`.
3. Define in-scope deliverables/workstreams, out-of-scope exclusions, and dependencies; preserve source IDs.
4. Define milestones, target dates or sequence, and schedule assumptions without inventing dates.
5. Define schedule drift, scope change, dependency delay, and escalation triggers. Use directional thresholds when numeric ones are unavailable.

## Output Contract

```md
# Scope and Schedule Baseline - <project name or YYYY-MM-DD>

## Objective
- Baseline objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Baseline confidence: `high` | `medium` | `low`
- What is locked:
- What is still fragile:

## Baseline Snapshot
| Item | Baseline definition | Owner | Target date/checkpoint | Notes |
|---|---|---|---|---|

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|---|---|---|---|---|---|

## Unknowns
- TBD:

## Follow-ups
- Change-control triggers to monitor:
- Recommended next skill: `pipa-roadmap`
```

## Safety

- Do not imply certainty where evidence is partial or turn assumptions into commitments.
- Preserve source IDs and expose owner/date gaps.
- Do not update external plans, milestones, or trackers without explicit approval.
