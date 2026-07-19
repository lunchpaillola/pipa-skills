# Pipa Grow Relationships

Use this lane when the user wants to maintain client/stakeholder relationships, manage follow-through, identify check-ins, spot retention risk, or choose the next relationship move.

## Starter Jobs

- Identify who needs a check-in and why now.
- Draft or structure a relationship follow-up without sending it by default.
- Surface stakeholder risk, client-health signals, renewal/retention opportunities, or trust gaps.
- Reframe generic `follow up with the client` requests into relationship follow-through, not reminder scheduling.

## Required Inputs

- Source material: client notes, stakeholder map, recent thread, delivery state, support signal, or `TBD`.
- Relationship objective: repair, nurture, unblock, renew, ask, thank, or `TBD`.
- Timing, owner, and channel if known.

## Source Methods

- Use `references/initiate-stakeholder-map.md` for role, influence, and decision authority.
- Use `references/monitor-status.md` to anchor relationship updates in current delivery reality.
- Use `references/monitor-risk-escalation.md` when trust, owner drift, or unresolved blockers need escalation.
- Use `references/close-handover-transition.md` when relationship care depends on transition ownership.

## Connected Capabilities

- Use `pipa-follow-up-reminders` only when the user wants a future email reminder to themself.
- Use `composio` only when live email/CRM/calendar access or an external send is explicitly required.
- Use `pipa-triggers` only when the user asks to automate future relationship checks.

## Workflow

1. State relationship objective and source.
2. Identify the relationship signal and why it matters now.
3. Choose the smallest useful touch: check-in, clarification, escalation, appreciation, renewal prompt, or no action.
4. Draft next action when useful, but do not send.
5. Capture owner, timing, source, and watchlist items.

## Output Shape

- `Relationship needing attention`: person/account or `TBD`.
- `Why now`: signal and evidence.
- `Suggested touch`: action or draft.
- `Owner`: person or `TBD`.
- `Timing`: now/date/review cadence or `TBD`.
- `Source`: cited material or `TBD`.
- `Watchlist`: risks or opportunities to revisit.

## Rules

- Do not schedule reminders unless the self-email reminder wording is explicit.
- Do not send messages, update CRM, or access inboxes without connected-tool approval.
- Do not fake relationship history; mark unknown context as `TBD`.
