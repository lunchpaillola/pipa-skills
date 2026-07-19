---
name: pipa-deliver-work
description: "Use when the user wants Pipa to coordinate active service delivery: status, blockers, risks, owners, handoffs, dependencies, triage, weekly client updates, QA, and next actions."
metadata:
  version: 0.1.0
---

# Pipa Deliver Work

Keep active client work moving.

## Use For

- Status updates, weekly client updates, blockers, risks, escalations, and owner gaps.
- Delivery handoffs, dependencies, active client portal maintenance, QA, and triage.
- One-time updates and delivery coordination.

## References

- Load `references/deliver-work.md` first.
- Use `references/execute*.md` for coordination, iteration, and handoffs.
- Use `references/monitor*.md` for status, triage, and risk.
- Load `references/examples/deliver-work.md` when an example shape helps.

## Output Contract

- Current state.
- Blockers, risks, or escalations.
- Owners, next actions, and due/review dates.
- Client/stakeholder update when useful.
- Evidence/source or `TBD`.

## Boundaries

- Recurring/event-driven delivery setup goes to `pipa-manage`.
- Money-impacting follow-up goes to `pipa-get-paid`.
- Relationship retention follow-up goes to `pipa-keep-clients`.

## Gotchas

- Do not imply work is done without acceptance evidence.
- `weekly` can mean reporting horizon, not automation.
- Escalations and risk claims need evidence or `TBD`.
