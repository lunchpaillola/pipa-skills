---
name: pipa-deliver-work
description: "Use when the user wants Pipa to coordinate active service delivery: status, blockers, risks, owners, handoffs, dependencies, triage, weekly client updates, QA, and next actions."
metadata:
  version: 0.1.1
---

# Pipa Deliver Work

Keep active client work moving.

When present, read `~/.pipa/profile.md` once for durable business context. If missing, continue without blocking and do not start setup unless the user asks or a soft setup offer is useful.

## Use For

- Status updates, weekly client updates, blockers, risks, escalations, and owner gaps.
- Delivery handoffs, dependencies, active client portal maintenance, QA, and triage.
- One-time updates and delivery coordination.

## References

- Load `references/examples/deliver-work.md` when an example shape helps.

## Route One Operation

Explicit operation invocation wins. Otherwise preserve the user's delivery objective and select exactly one:

- `pipa-work-coordination`: active ownership, sequencing, rebalancing, or execution checkpoints.
- `pipa-iteration-cycle`: sprint/cycle commitments, WIP control, or carryover.
- `pipa-dependency-handoff`: cross-team dependencies, approvals, prerequisites, or handoff readiness.
- `pipa-status-update`: current project health, RAG/RAID rollup, standup, or stakeholder update.
- `pipa-ticket-triage`: incoming tickets, comments, feedback, response priority, or backlog cleanup.
- `pipa-risk-escalation`: blockers, owner silence, tolerance pressure, or a decision requiring escalation.

Tie-breakers:

- Choose status when the primary ask is where the project stands; list triage or escalation as a follow-up only.
- Choose triage when the primary ask is what incoming item needs response or priority, even when an item is stale or risky.
- Choose risk escalation only when the primary ask is what is stuck, nearing breach, or needs a higher-authority decision.
- Route a scope change to `pipa-change-control` only when fee, cost, budget, or margin impact is explicit; otherwise keep it in Deliver Work.

## Output Contract

- Current state.
- Blockers, risks, or escalations.
- Owners, next actions, and due/review dates.
- Client/stakeholder update when useful.
- Evidence/source or `TBD`.

## Boundaries

- Recurring/event-driven delivery setup goes to `pipa-manage`.
- Budget health goes to `pipa-budget-review`; money-impacting scope changes go to `pipa-change-control`.
- Relationship retention follow-up goes to `pipa-keep-clients`.
- Accepted delivery that is ready for closure goes to `pipa-improve-operations`.
- Preserve the selected operation's read-only default, separate write approval, and result-confirmation contract.

## Gotchas

- Do not imply work is done without acceptance evidence.
- `weekly` can mean reporting horizon, not automation.
- Escalations and risk claims need evidence or `TBD`.
