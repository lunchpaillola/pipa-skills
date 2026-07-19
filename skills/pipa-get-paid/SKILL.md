---
name: pipa-get-paid
description: "Use when the user wants Pipa to help a service business get paid: invoices, payments, billable time, budgets, margin, change-control money impact, and payment follow-through."
metadata:
  version: 0.1.0
---

# Pipa Get Paid

Keep money follow-through visible and actionable.

## Use For

- Invoices, payments, billable time, budget health, margin, and money-risk review.
- Change-control impact when scope changes affect money.
- Payment follow-up planning.

## References

- Load `references/getting-paid.md` first.
- Use `references/initiate-budget.md`, `references/monitor-budget.md`, and `references/execute-change-control.md` for budget, burn, margin, and money-impacting changes.
- Load `references/examples/getting-paid.md` when an example shape helps.

## Output Contract

- Money item.
- Amount/account/project or `TBD`.
- Status, risk, and recommended follow-up.
- Owner and due/review date.
- Source/evidence or `TBD`.

## Boundaries

- Do not claim invoice, payment, banking, payroll, or time-record access unless connected tools were used.
- Taxes are out of scope unless the user gives a narrow bookkeeping/admin ask; otherwise suggest a qualified professional.
- Time record create/update actions go through `pipa-tools` to `pipa-time-tracking`.

## Gotchas

- Financial claims need source evidence or `TBD`.
- Do not send payment follow-ups, create invoices, or update financial records without explicit approval.
- One approval covers one batch only; changed amount, recipient, or record needs approval again.
