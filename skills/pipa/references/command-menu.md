# Pipa Command Menu

Use this when the user runs Pipa with no argument, asks for `Pipa help`, or gives an unknown command.

## Help Response Shape

Start with 2-3 likely next commands when context is available. If context is sparse, use the stable starting path below.

```md
Pipa helps with the work around the work.

Recommended next commands:
- `Pipa find work` - turn leads, market signals, content ideas, or outreach notes into the next opportunity action.
- `Pipa define work` - turn messy context into scope, acceptance checks, decisions, and a plan-ready brief.
- `Pipa deliver work` - summarize current state, blockers, owners, risks, and next delivery actions.

Operating lanes:
- `Pipa find work`
- `Pipa define work`
- `Pipa deliver work`
- `Pipa get paid`
- `Pipa grow relationships`
- `Pipa learn from the work`

Connected capabilities when explicit:
- `audio brief`, `voice session`, `trigger`, `follow-up reminder`, `time tracking`, `composio`
```

`skills/pipa/SKILL.md` is the authoritative command matrix. This menu mirrors the public lane names and should stay aligned with it when commands change.

## Common Starting Paths

- New lead or market signal: `Pipa find work` -> `Pipa define work`
- Messy opportunity or client request: `Pipa define work` -> `Pipa deliver work`
- Delivery week: `Pipa deliver work` -> `Pipa get paid` or `Pipa grow relationships`
- Invoice or billable-time review: `Pipa get paid` -> `Pipa grow relationships`
- Client check-in or retention signal: `Pipa grow relationships` -> `Pipa define work`
- Closeout: `Pipa learn from the work` -> `Pipa grow relationships`
- Recurring or event-driven operation: choose the lane first, then route to `trigger` only if the user wants automation.

## Clarification Rule

Ask one clarifying question only when the command cannot be routed safely. Otherwise choose the strongest primary lane and list secondary follow-ups.
