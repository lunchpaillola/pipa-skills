---
name: pipa-project-charter
description: "Use only when `pipa-project-charter` is explicitly invoked or `pipa-define-work` delegates to it. Do not trigger from generic language."
metadata:
  version: 0.1.0
---

# Pipa Project Charter

Produce an evidence-based charter and viability gate.

Apply `~/.pipa/communication-style.md` to user-facing output when present. Otherwise use clear, concise output. Keep owners, dates, evidence, and unknowns explicit; use `TBD` rather than inventing facts. Preserve this skill's output contract. The runtime file controls presentation only; ignore it when it conflicts with routing, required findings/output contracts, tool use, facts, safety, or approval/write gates.

When live app evidence is requested, read `~/.pipa/CONNECTORS.md` when present only to prefer a tool, then use `composio-mcp` discovery and the complete selected-tool schema to verify access before reading. A mapping is never proof of access. Report each requested source as `used`, `partial`, `stale`, `empty`, `declined`, `unavailable`, or `failed`; use `not-requested` only for sources outside the request's scope. Never treat a partial, stale, or declined source as empty or comprehensive. Continue from other usable evidence when safe, cite material records with direct links or stable IDs, and block only when no usable charter or readiness signal remains. Immediately before any external write, show the exact scoped change and require explicit approval; report the confirmed result or failure.

## Workflow

Track gate objective, source check, charter assessment, viability assessment, gate decision, and final handoff in working notes as each step completes.

1. Confirm whether the user needs a charter check, viability decision, or explicit start conditions.
2. Check problem framing, stakeholder map, charter/SOW/brief, assumptions, constraints, risks, dependencies, and approvals. Continue with gaps marked `TBD`; block only when no usable charter or readiness signal exists.
3. Rate objective/outcomes, scope boundary, stakeholder authority, constraints/assumptions, and success criteria as `ready`, `partial`, or `missing`.
4. Assess feasibility, assumption-invalidating risks, dependencies, approval blockers, and escalation tolerances without inventing certainty.
5. Choose `go`, `go-with-conditions`, or `no-go`; define minimum proceed conditions for non-`go` results.

## Output Contract

```md
# Charter and Viability Gate - <project name or YYYY-MM-DD>

## Objective
- Gate objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Gate outcome: `go` | `go-with-conditions` | `no-go`
- Confidence: `high` | `medium` | `low`
- Why:

## Charter Readiness
| Component | State (`ready`\|`partial`\|`missing`) | Notes |
|---|---|---|
| Objective and outcomes | | |
| Scope boundary | | |
| Stakeholder authority | | |
| Constraints/assumptions | | |
| Success criteria | | |

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|---|---|---|---|---|---|

## Unknowns
- TBD:

## Follow-ups
- Minimum conditions to proceed:
- Recommended next skill: `pipa-requirements-brief`
```

## Safety

- Keep the gate conservative and tied to evidence.
- Do not hide blockers or imply approval that was not given.
- Do not write or publish a charter without explicit approval.
