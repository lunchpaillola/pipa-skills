# Pipa Get Paid

Use this lane when the user wants visibility or action around invoices, payments, billable time, budget health, margin, payment risk, or money-related change control.

## Starter Jobs

- Identify invoices or payment follow-ups needing action.
- Review billable time or budget health before invoicing.
- Surface margin, scope creep, change-control, or payment-risk signals.
- Reframe old `budget` money-health requests into the public `get paid` lane.

## Required Inputs

- Money source: invoice list, payment notes, contract terms, time records, budget baseline, or `TBD`.
- Amount, account/project, due date, owner, and status where available.
- Whether the user wants analysis, a draft follow-up, or an external action.

## Source Methods

- Use `references/initiate-budget.md` when the user needs a new baseline or tracker.
- Use `references/monitor-budget.md` for burn, forecast, variance, margin, and budget health.
- Use `references/execute-change-control.md` when money risk comes from scope or delivery changes.
- Use `references/monitor-risk-escalation.md` when nonpayment or owner drift needs escalation.

## Connected Capabilities

- Use `pipa-time-tracking` only when the user asks to start, stop, edit, backfill, summarize, or review time-entry records.
- Use `pipa-follow-up-reminders` only when the user asks for a future email reminder to themself.
- Use `composio` only when live invoice/payment/app records are required or when the user approves an external write.

## Workflow

1. State source, confidence, and whether live financial records were used.
2. Identify money items by urgency and risk.
3. Separate analysis from external action or reminder scheduling.
4. Recommend one next action per item.
5. Route relationship-sensitive follow-up tone to `grow relationships` when needed.

## Output Shape

- `Money item`: invoice, payment, billable-time issue, budget risk, or `TBD`.
- `Amount / account / project`: known value or `TBD`.
- `Status`: current known state and source.
- `Risk`: low/medium/high with evidence.
- `Recommended follow-up`: draft/action/checkpoint.
- `Owner`: person or `TBD`.
- `Due/review date`: date or `TBD`.
- `Source`: cited record/note or `TBD`.

## Rules

- Do not claim banking, payment processor, invoice, or payroll access unless a connected tool was actually used.
- Do not send payment follow-ups or create records without explicit approval and the correct connected-tool workflow.
- Do not treat every budget question as invoicing; setup/baseline questions can route back to `define work`.
