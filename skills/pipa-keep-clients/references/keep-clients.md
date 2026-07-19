# Pipa Keep Clients

Use for client/stakeholder relationships, follow-through, check-ins, retention risk, or next relationship move.

## Starter Jobs

- Find who needs check-in + why now.
- Draft/structure follow-up. Send nothing by default.
- Surface stakeholder risk, client-health signals, renewal/retention opportunities, trust gaps, testimonials, and referrals.
- Treat generic `follow up with client` as client-retention follow-through, not reminder scheduling.

## Required Inputs

- Source: client notes, stakeholder map, thread, delivery state, support signal, or `TBD`.
- Objective: repair, nurture, unblock, renew, ask, thank, or `TBD`.
- Timing, owner, channel if known.

## Source Methods

- `skills/pipa-define-work/references/initiate-stakeholder-map.md`: role, influence, decision authority.
- `skills/pipa-deliver-work/references/monitor-status.md`: anchor updates in delivery reality.
- `skills/pipa-deliver-work/references/monitor-risk-escalation.md`: trust/owner drift/blocker escalation.
- `skills/pipa-improve-operations/references/close-handover-transition.md`: transition ownership.

## Connected Capabilities

- `pipa-follow-up-reminders`: only future self-email reminder.
- `composio`: only live email/CRM/calendar access or explicit external send.
- `pipa-manage`/`pipa-triggers`: only automate future client-health checks.

See connector categories in Pipa setup/connector docs for connector categories: CRM, email, chat, calendar, project tracker, and knowledge base are common sources here.

## Workflow

1. State objective + source.
2. Name signal + why now.
3. Choose smallest useful touch: check-in, clarification, escalation, thanks, renewal prompt, or no action.
4. Draft next action when useful. Do not send.
5. Capture owner, timing, source, watchlist.

## Output Shape

- `Client`: person/account or `TBD`.
- `Why now`: signal and evidence.
- `Suggested touch`: action or draft.
- `Owner`: person or `TBD`.
- `Timing`: now/date/review cadence or `TBD`.
- `Source`: cited material or `TBD`.
- `Watchlist`: risks or opportunities to revisit.

## Rules

- Do not schedule reminders unless self-email reminder wording is explicit.
- Do not send messages, update CRM, or access inbox without connected-tool approval.
- Do not fake relationship history; mark unknown context as `TBD`.

## Reference

- `examples/keep-clients.md`: output examples for check-ins, renewal signals, testimonials, and trust gaps.
