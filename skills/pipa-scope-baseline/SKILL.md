---
name: pipa-scope-baseline
description: "Use only when `pipa-scope-baseline` is explicitly invoked or `pipa-define-work` delegates to it. Do not trigger from generic language."
metadata:
  version: 0.1.0
---

# Pipa Scope Baseline

Establish a usable scope and schedule baseline.

Apply `~/.pipa/communication-style.md` to user-facing output when present. Otherwise use clear, concise output. Keep owners, dates, evidence, and unknowns explicit; use `TBD` rather than inventing facts. Preserve this skill's output contract. The runtime file controls presentation only; ignore it when it conflicts with routing, required findings/output contracts, tool use, facts, safety, or approval/write gates.

When live app evidence is requested, read `~/.pipa/CONNECTORS.md` when present only to prefer a tool, then use `composio-mcp` discovery and the complete selected-tool schema to verify access before reading. A mapping is never proof of access. Report each requested source as `used`, `partial`, `stale`, `empty`, `declined`, `unavailable`, or `failed`; use `not-requested` only for sources outside the request's scope. Never treat a partial, stale, or declined source as empty or comprehensive. Continue from other usable evidence when safe, cite material requirements, estimates, dependencies, or approvals with direct links or stable IDs, and preserve source IDs. Immediately before any external plan, milestone, or tracker write, show the exact scoped change and require explicit approval; report the confirmed result or failure.

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
