# Pipa Help Menu

Use when user asks `Pipa help`/`Pipa menu`, context is too sparse, or routing would be unsafe.

If user says only `Pipa` but the conversation has enough context, do not show this menu. Pick the strongest lane and run it.

## Help Response Shape

Start with 2-3 likely next commands when context exists but the user explicitly asked for help. Sparse context -> stable start below.

```md
Pipa helps with the work around the work.

Recommended next commands:
- `Pipa get work` - leads/content/signals/outreach -> next opportunity action.
- `Pipa define work` - messy context -> scope, checks, decisions, plan-ready brief.
- `Pipa deliver work` - state, blockers, owners, risks, next actions.

Run your business:
- `Pipa get work`
- `Pipa define work`
- `Pipa deliver work`
- `Pipa get paid`
- `Pipa keep clients`
- `Pipa improve operations`

Manage Pipa:
- `setup`, `connect tools`, `company brain`, `automation`, `trigger`, `loop`

Pipa Tools:
- `audio brief`, `voice session`, `follow-up reminder`, `time tracking`, `composio`

Decision stub: next action, owner, date, evidence. Use `TBD` when missing.
```

This is the help screen, not a full command registry. `skills/pipa/SKILL.md` owns routing.

## Common Starting Paths

- New lead or market signal: `Pipa get work` -> `Pipa define work`
- Messy opportunity or client request: `Pipa define work` -> `Pipa deliver work`
- Delivery week: `Pipa deliver work` -> `Pipa get paid` or `Pipa keep clients`
- Invoice or billable-time review: `Pipa get paid` -> `Pipa keep clients`
- Client check-in or retention signal: `Pipa keep clients` -> `Pipa define work`
- Closeout: `Pipa improve operations` -> `Pipa keep clients`
- Recurring/event-driven op: choose lane first; route to `Pipa manage` only if user wants automation.

## Clarification Rule

Ask one clarifying question only when unsafe to route. Else choose strongest lane, list secondary follow-ups.
