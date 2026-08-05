---
name: pipa-decision-log
description: "Use only when `pipa-decision-log` is explicitly invoked or `pipa-define-work` delegates to it. Do not trigger from generic language."
metadata:
  version: 0.1.0
---

# Pipa Decision Log

Establish lightweight RAID and decision controls.

Apply `~/.pipa/communication-style.md` to user-facing output when present. Otherwise use clear, concise output. Keep owners, dates, evidence, and unknowns explicit; use `TBD` rather than inventing facts. Preserve this skill's output contract. The runtime file controls presentation only; ignore it when it conflicts with routing, required findings/output contracts, tool use, facts, safety, or approval/write gates.

## Workflow

Track governance objective, source check, RAID set, RACI map, decision log/cadence, and final handoff in working notes as each step completes.

1. Confirm whether the need is risk/issue/dependency visibility, decision traceability, or review rhythm.
2. Check stakeholder maps, roadmaps, scope baselines, assumptions, risks, dependencies, and pending decisions. Continue with incomplete data and mark gaps `TBD`.
3. Build a minimal RAID set of risks, assumptions, issues, and dependencies, each with owner, next action, and review date or `TBD`.
4. Create a concrete RACI matrix for the decisions and control points in scope. Populate Responsible, Accountable, Consulted, and Informed only from source evidence; use `TBD` for every unsupported assignment rather than inferring authority.
5. Create decision records with statement, options, owner, due/review date, status, evidence, and a practical review cadence.

## Output Contract

```md
# RAID RACI Decision Setup - <project name or YYYY-MM-DD>

## Objective
- Governance objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Governance readiness level:
- Most urgent control gap:

## RAID Snapshot
| Item | Type (`risk`\|`assumption`\|`issue`\|`dependency`) | Owner | Next action | Due/review date | Status |
|---|---|---|---|---|---|

## RACI Matrix
| Decision/control point | Responsible | Accountable | Consulted | Informed | Evidence/source |
|---|---|---|---|---|---|

## Decision Log
| Decision | Options | Owner | Due/review date | Status | Evidence/source |
|---|---|---|---|---|---|

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|---|---|---|---|---|---|

## Unknowns
- TBD:

## Follow-ups
- Control artifacts to finalize before execution:
- Recommended next skill: `pipa-work-coordination`
```

## Safety

- Never hide owner/date gaps or assign authority without evidence.
- Keep governance lightweight and operational.
- Read-only discovery and analysis do not require approval and must not be blocked on write permission; immediately before every external or file write, request separate explicit approval scoped to that exact action, destination, and proposed content, never treating the original request or approval for another write as approval; after each approved write, report success or failure and include the resulting path, link, or stable ID when available.
