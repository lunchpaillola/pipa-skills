---
name: pipa-roadmap
description: "Use only when `pipa-roadmap` is explicitly invoked or `pipa-define-work` delegates to it. Do not trigger from generic language."
metadata:
  version: 0.1.0
---

# Pipa Roadmap

Produce an explainable sequence and prioritization rationale.

Apply `~/.pipa/communication-style.md` to user-facing output when present. Otherwise use clear, concise output. Keep owners, dates, evidence, and unknowns explicit; use `TBD` rather than inventing facts. Preserve this skill's output contract. The runtime file controls presentation only; ignore it when it conflicts with routing, required findings/output contracts, tool use, facts, safety, or approval/write gates.

When live app evidence is requested, read `~/.pipa/CONNECTORS.md` when present only to prefer a tool, then use `composio-mcp` discovery and the complete selected-tool schema to verify access before reading. A mapping is never proof of access. Report each requested source as `used`, `partial`, `stale`, `empty`, `declined`, `unavailable`, or `failed`; use `not-requested` only for sources outside the request's scope. Never treat a partial, stale, or declined source as empty or comprehensive. Continue from other usable evidence when safe, cite material requirements, dependency, risk, or priority records with direct links or stable IDs, and keep ranking assumptions explicit. Immediately before any external roadmap or tracker write, show the exact scoped change and require explicit approval; report the confirmed result or failure.

## Workflow

Track prioritization objective, source check, candidate normalization, method application, sequence/tradeoffs, and final handoff in working notes as each step completes.

1. Confirm what must happen now, next, later, pause, or be removed and which tradeoff needs resolution.
2. Check requirements, scope, dependencies, risks, stakeholder priorities, and constraints. Continue with partial evidence and explicit assumptions.
3. Normalize each candidate's outcome/value, effort or complexity, dependency risk, urgency, and timing sensitivity without fabricating estimates.
4. Use the user's method; otherwise use `Now/Next/Later`, or `MoSCoW` under strict scope pressure. Keep scoring auditable.
5. Return the sequence, deprioritized work, tradeoffs, and decisions that could force resequencing.

## Output Contract

```md
# Roadmap and Prioritization - <project name or YYYY-MM-DD>

## Objective
- Prioritization objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Prioritization confidence: `high` | `medium` | `low`
- What should happen first:
- Main tradeoff pressure:

## Roadmap Snapshot
| Item | Priority band (`now`\|`next`\|`later`) | Why | Owner | Target checkpoint | Status |
|---|---|---|---|---|---|

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|---|---|---|---|---|---|

## Unknowns
- TBD:

## Follow-ups
- Decisions likely to force resequencing:
- Recommended next skill: `pipa-decision-log`
```

## Safety

- Keep prioritization transparent and separate source facts from ranking assumptions.
- Do not fabricate point estimates, dates, owners, or authority.
- Do not update an external roadmap or tracker without explicit approval.
