---
name: pipa-requirements-brief
description: "Use only when `pipa-requirements-brief` is explicitly invoked or `pipa-define-work` delegates to it. Do not trigger from generic language."
metadata:
  version: 0.1.0
---

# Pipa Requirements Brief

Produce a concise, execution-usable requirements brief.

Apply `~/.pipa/communication-style.md` to user-facing output when present. Otherwise use clear, concise output. Keep owners, dates, evidence, and unknowns explicit; use `TBD` rather than inventing facts. Preserve this skill's output contract. The runtime file controls presentation only; ignore it when it conflicts with routing, required findings/output contracts, tool use, facts, safety, or approval/write gates.

When live app evidence is requested, read `~/.pipa/CONNECTORS.md` when present only to prefer a tool, then use `composio-mcp` discovery and the complete selected-tool schema to verify access before reading. A mapping is never proof of access. Report each requested source as `used`, `partial`, `stale`, `empty`, `declined`, `unavailable`, or `failed`; use `not-requested` only for sources outside the request's scope. Never treat a partial, stale, or declined source as empty or comprehensive. Continue from other usable evidence when safe, cite material requirement records with direct links or stable IDs, and leave unsupported criteria `TBD`. Immediately before any external brief, ticket, or client-artifact write, show the exact scoped change and require explicit approval; report the confirmed result or failure.

## Workflow

Track requirements objective, source check, normalization, acceptance boundaries, unresolved decisions, and final handoff in working notes as each step completes.

1. Confirm whether the need is a concise brief, acceptance boundaries, or unresolved requirement decisions.
2. Check problem framing, charter, stakeholder notes, requirement docs, tickets, and briefs. Classify source quality as `high`, `medium`, or `low`.
3. Normalize requirements as functional, non-functional, compliance/operational, or dependency/integration needs while preserving source wording where possible.
4. For each high-priority requirement, capture acceptance criteria, out-of-scope boundaries, assumptions, and constraints; mark unclear criteria `TBD`.
5. List decisions needed before execution with owner and due/review date or `TBD`.

## Output Contract

```md
# Requirements Brief - <project name or YYYY-MM-DD>

## Objective
- Requirements objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Source confidence: `high` | `medium` | `low`
- Requirement readiness level:
- What is clear now:
- What is still unresolved:

## Requirements Snapshot
| Requirement | Type | Priority | Acceptance criteria | Status |
|---|---|---|---|---|

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|---|---|---|---|---|---|

## Unknowns
- TBD:
- Minimum missing inputs to raise confidence:

## Follow-ups
- Requirement decisions needed:
- Recommended next skill: `pipa-scope-baseline`
```

## Safety

- Do not invent acceptance criteria, priorities, or commitments.
- Keep source facts separate from inferred requirements.
- Do not write external briefs, tickets, or client artifacts without explicit approval.
