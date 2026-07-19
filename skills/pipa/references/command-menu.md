# Pipa Command Menu

Use when user runs Pipa with no arg, asks `Pipa help`, or gives unknown command.

## Help Response Shape

Start with 2-3 likely next commands when context exists. Sparse context -> stable start below.

```md
Pipa helps with the work around the work.

Recommended next commands:
- `Pipa find work` - leads/signals/ideas/outreach -> next opportunity action.
- `Pipa define work` - messy context -> scope, checks, decisions, plan-ready brief.
- `Pipa deliver work` - state, blockers, owners, risks, next actions.

Operating lanes:
- `Pipa find work`
- `Pipa define work`
- `Pipa deliver work`
- `Pipa get paid`
- `Pipa grow relationships`
- `Pipa learn from the work`

Connected capabilities when explicit:
- `audio brief`, `voice session`, `trigger`, `follow-up reminder`, `time tracking`, `composio`

Decision stub: next action, owner, date, evidence. Use `TBD` when missing.
```

`skills/pipa/SKILL.md` owns command matrix. Keep menu aligned.

## Common Starting Paths

- New lead or market signal: `Pipa find work` -> `Pipa define work`
- Messy opportunity or client request: `Pipa define work` -> `Pipa deliver work`
- Delivery week: `Pipa deliver work` -> `Pipa get paid` or `Pipa grow relationships`
- Invoice or billable-time review: `Pipa get paid` -> `Pipa grow relationships`
- Client check-in or retention signal: `Pipa grow relationships` -> `Pipa define work`
- Closeout: `Pipa learn from the work` -> `Pipa grow relationships`
- Recurring/event-driven op: choose lane first; route to `trigger` only if user wants automation.

## Clarification Rule

Ask one clarifying question only when unsafe to route. Else choose strongest lane, list secondary follow-ups.
