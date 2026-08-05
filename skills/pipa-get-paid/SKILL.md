---
name: pipa-get-paid
description: "Use when the user wants Pipa to help a service business get paid: invoices, payments, billable time, budgets, margin, change-control money impact, and payment follow-through."
metadata:
  version: 0.2.0
---

# Pipa Get Paid

Keep money follow-through visible and actionable.

When present, read `~/.pipa/profile.md` once for durable business context. If missing, continue without blocking and do not start setup unless the user asks or a soft setup offer is useful.

## Use For

- Invoices, payments, billable time, budget health, margin, and money-risk review.
- Change-control impact when scope changes affect money.
- Payment follow-up planning.

## References

- Load `references/examples/getting-paid.md` when an example shape helps.

## Route One Operation

Explicit operation invocation wins. Otherwise select exactly one operation when it matches:

- `pipa-budget-setup`: create a new baseline/tracker or explicitly add/edit its project rows.
- `pipa-budget-review`: assess an existing baseline against actuals, commitments, burn, forecast, capacity, variance, or margin.
- `pipa-change-control`: evaluate an in-flight scope/timeline change only when fee, cost, budget, or margin impact is explicit.

Routing gates:

- New baseline or tracker intent always selects Budget Setup, even if the prompt mentions future monitoring.
- Burn, variance, forecast, capacity use, or margin always selects Budget Review; missing baseline blocks the review and recommends Budget Setup without creating one.
- Scope change without explicit money impact stays in `pipa-deliver-work`; do not select Change Control merely because scope changed.
- Invoice, payment, or payment-follow-up work remains lane-native. Time-record actions go to `pipa-time-tracking`.

For lane-native work: state source confidence and live-record access, identify one money item, separate analysis/drafting from external action, and recommend one owner/date follow-up.

If the selected operation or specialized capability is unavailable, name that missing skill and stop. Do not imply a fallback or recreate its workflow inline.

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
- Nonpayment or owner drift that needs escalation goes to `pipa-risk-escalation` after the money item is established.
- Relationship-sensitive payment communication may recommend `pipa-keep-clients`, but payment action stays in Get Paid.

## Gotchas

- Financial claims need source evidence or `TBD`.
- Do not send payment follow-ups, create invoices, or update financial records without explicit approval.
- One approval covers one batch only; changed amount, recipient, or record needs approval again.
