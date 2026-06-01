# Pipa Command Menu

Use this when the user runs Pipa with no argument, asks for `Pipa help`, or gives an unknown command.

## Help Response Shape

Start with 2-3 likely next commands when context is available. If context is sparse, use the stable starting path below.

```md
Pipa can take the next PM step from here.

Recommended next commands:
- `Pipa status` - summarize current state, blockers, decisions, and next milestones.
- `Pipa plan` - turn scattered requirements into a usable delivery baseline.
- `Pipa reach find-threads <source>` - find public conversations where finished work can help.

Command groups:
- Start: `initiate`, `kickoff`, `context`, `budget setup`, `problem`, `charter`, `stakeholders`
- Plan: `plan`, `requirements`, `scope`, `schedule`, `roadmap`, `raid`, `raci`
- Execute: `execute`, `coordinate`, `delivery`, `iteration`, `change`, `dependency`, `handoff`
- Monitor: `monitor`, `status`, `triage`, `budget`, `risk`, `escalate`, `blockers`
- Close: `close`, `signoff`, `handover`, `lessons`, `archive`, `benefits`
- Connected: `reach`, `find-threads`, `audio brief`, `automate`, `trigger`, `composio`
```

`skills/pipa/SKILL.md` is the authoritative command matrix. This menu mirrors the public command groups and should stay aligned with it when commands change.

## Common Starting Paths

- New or unclear project: `Pipa initiate` -> `Pipa plan` -> `Pipa execute`
- Delivery week: `Pipa status` -> `Pipa risk` -> `Pipa execute`
- Intake cleanup: `Pipa triage` -> `Pipa status`
- Steering prep: `Pipa status` -> `Pipa budget` -> `Pipa risk`
- Closeout: `Pipa close` -> `Pipa handover` -> `Pipa lessons` -> `Pipa archive`
- Recurring PM update: `Pipa status` -> `Pipa automate`
- Event-driven PM follow-up: `Pipa trigger` -> `Pipa status`
- Finished work needs an audience: `Pipa reach find-threads <source>` -> review manual answer angles

## Clarification Rule

Ask one clarifying question only when the command cannot be routed safely. Otherwise choose the strongest primary command and list secondary follow-ups.
