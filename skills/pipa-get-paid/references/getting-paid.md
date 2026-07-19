# Pipa Get Paid

Use for invoices, payments, billable time, budget health, margin, payment risk, or money-related change control.

## Starter Jobs

- Find invoices/payment follow-ups needing action.
- Review billable time or budget before invoicing.
- Surface margin, scope creep, change-control, payment-risk signals.
- Reframe old `budget` money-health as public `get paid`.

## Required Inputs

- Source: invoices, payment notes, contract terms, time records, budget baseline, or `TBD`.
- Amount, account/project, due date, owner, status if available.
- Desired mode: analysis, draft follow-up, or external action.

## Source Methods

- `references/initiate-budget.md`: new baseline/tracker.
- `references/monitor-budget.md`: burn, forecast, variance, margin, budget health.
- `references/execute-change-control.md`: money risk from scope/delivery change.
- `skills/pipa-deliver-work/references/monitor-risk-escalation.md`: nonpayment or owner drift escalation.

## Connected Capabilities

- `pipa-time-tracking`: only start/stop/edit/backfill/summarize/review time records.
- `pipa-follow-up-reminders`: only future self-email reminder.
- `composio`: only live invoice/payment/app records or approved external write.

Common connector categories: finance, time tracking, email, CRM, calendar, docs.

## Workflow

1. State source, confidence, whether live financial records were used.
2. Identify money items by urgency and risk.
3. Split analysis from external action/reminder scheduling.
4. Recommend one next action/item.
5. Route relationship-sensitive tone to `keep clients` when needed.

## Output Shape

- `Money item`: invoice, payment, billable-time issue, budget risk, or `TBD`.
- `Amount / account / project`: known value or `TBD`.
- `Status`: current known state and source.
- `Risk`: low/medium/high + evidence.
- `Recommended follow-up`: draft/action/checkpoint.
- `Owner`: person or `TBD`.
- `Due/review date`: date or `TBD`.
- `Source`: cited record/note or `TBD`.

## Rules

- Do not claim banking/payment processor/invoice/payroll access unless connected tool ran.
- Do not send follow-ups or create records without explicit approval + correct connected workflow.
- Do not treat every budget question as invoicing; setup/baseline can route to `define work`.

## Reference

- `examples/getting-paid.md`: output examples for invoice, billable-time, and budget-risk work.
