---
name: pipa
description: "Use when the user wants Pipa to help with operating-lane work around service delivery: find work, define work, deliver work, get paid, grow relationships, learn from the work, route natural-language operational requests, or show Pipa help. Also use for compatibility commands like Pipa initiate, Pipa plan, Pipa execute, Pipa monitor, Pipa status, Pipa triage, Pipa close, and for exact connected-capability requests like audio brief, voice session, trigger, email follow-up reminder, time tracking, or Composio external app work."
metadata:
  version: 0.1.1
---

# Pipa

Pipa is an operating-lane router for the work around the work.

Use Pipa to choose one primary lane, load the matching reference, and return a decision-ready output with sources, owners, next actions, and `TBD` for unknowns. Do not expose the old PM lifecycle routes as the public model.

## How Pipa Works

1. Select one primary lane from the command matrix.
2. Load the mapped reference or connected capability.
3. Execute that workflow without weakening required inputs, safety gates, or output contracts.
4. List secondary lane follow-ups only when useful, unless the user explicitly asks for a command chain.

If no command is present, route by natural-language operating intent. If the request is not about service-business operations, delivery, stakeholders, money, relationships, learning, or connected Pipa capabilities, do not force it into Pipa.

## Command Matrix

| Lane | Commands and aliases | Primary route |
|---|---|---|
| Find work | `find work`, `source work`, `lead`, `opportunity`, `pipeline`, `prospect`, `outreach`, `market signal`, `content idea` | `references/find-work.md` |
| Define work | `define work`, `scope`, `requirements`, `brief`, `plan`, `charter`, `proposal`, `acceptance`, `decision` | `references/define-work.md` |
| Deliver work | `deliver work`, `execute`, `coordinate`, `status`, `monitor`, `blocker`, `risk`, `handoff`, `dependency`, `triage` | `references/deliver-work.md` |
| Get paid | `get paid`, `getting paid`, `invoice`, `payment`, `budget`, `billable`, `time review`, `margin` | `references/getting-paid.md` |
| Grow relationships | `grow relationships`, `relationship`, `follow up`, `check-in`, `client health`, `stakeholder`, `retention`, `renewal` | `references/growing-relationships.md` |
| Learn from the work | `learn from the work`, `lessons`, `retrospective`, `close`, `archive`, `handover`, `benefits`, `reuse` | `references/learning-from-the-work.md` |
| Connected capabilities | `audio brief`, `voice session`, `talk by voice`, `trigger`, `automate`, `follow-up reminder`, `email reminder`, `time tracking`, `time entry`, `composio` | Authoritative standalone skills through `references/standalone-invocation.md` |
| Help | `help`, `menu`, no argument | `references/command-menu.md` |

## Routing Rules

1. If the first words after Pipa are a known lane command or alias, use that route.
2. If no command is present but the request clearly matches a lane, route by intent.
3. Lane intent wins by default. Route into a connected capability only when the user asks for that exact job.
4. Route to `pipa-follow-up-reminders` through `references/standalone-invocation.md` only when the user wants a specific one-shot follow-up reminder scheduled to their own email, such as `email me tomorrow at 9` or `remind me by email next Friday`. Generic follow-up work stays in `grow relationships` or `deliver work`.
5. Route to `pipa-triggers` only when the user asks for event-driven behavior, watcher/listener/webhook setup, or trigger management. Recurring delivery also needs the trigger proposal confirmation from that skill.
6. Route to `composio` when live external app access or an external write is required. Start with Composio discovery/schema rules and never guess tool slugs.
7. Route to `pipa-audio-brief` only when the user explicitly asks for an audio, listenable, spoken, phone-friendly, or listening-page brief. Generic `brief this`, requirements briefs, and project briefs stay in Pipa lanes.
8. Route to `pipa-huddle-beta` only when the user explicitly asks for a live voice session or voice talk-through.
9. Route to `pipa-time-tracking` when the user asks to start, stop, switch, backfill, update, archive, summarize, or review time records. Generic budget/margin/invoice reasoning stays in `get paid` unless time records are the explicit source or target.
10. If multiple lanes match, choose one primary lane and list secondary follow-ups unless the user explicitly asks for a command chain.
11. If unknown, show the help/menu response and ask one clarifying question only when needed.

## Compatibility Aliases

| Old wording | New public lane |
|---|---|
| `initiate`, `kickoff`, `context`, `charter`, `stakeholders` | `define work` |
| `plan`, `requirements`, `scope`, `schedule`, `roadmap`, `raid`, `raci` | `define work` |
| `execute`, `coordinate`, `delivery`, `iteration`, `dependency`, `handoff` | `deliver work` |
| `monitor`, `status`, `triage`, `risk`, `escalate`, `blockers` | `deliver work` |
| `budget`, `change control`, `billable time`, `margin` | `get paid` when money/billable intent dominates; otherwise `define work` for setup or `deliver work` for delivery risk |
| `close`, `signoff`, `handover`, `lessons`, `archive`, `benefits` | `learn from the work` |

## Tie-Breakers

- `status` means `deliver work` unless the user asks for setup/status of an automation or tool connection.
- `triage` means `deliver work` for tickets/intake unless the user is triaging a Pipa route choice.
- `budget` means `get paid` for burn, forecast, variance, margin, invoice, or change-control health. It means `define work` when wording asks to create or initialize a project budget baseline. If ambiguous, ask one short question.
- `brief` alone means `define work` for a working brief or `deliver work` for a status brief, not audio.
- `follow up with the client` means `grow relationships` unless the user asks to schedule an email reminder to themself.
- `plan` remains supported but reframes as `define work`, not delegation to another top-level PM skill.
- `monitor` remains supported but reframes as `deliver work`, unless money or relationship wording dominates.
- `stakeholder map`, stakeholder setup, and stakeholder decision authority mean `define work`; relationship health, check-ins, and retention mean `grow relationships`.
- `change control` means `get paid` only when money, billable, margin, budget, or invoice impact dominates. Scope or delivery changes stay in `define work` or `deliver work`.

## Source Method Map

Use these existing lifecycle references as internal methods when a lane needs more structure:

| Intent | Source references |
|---|---|
| Foundational context, stakeholders, problem framing | `references/initiate.md`, `references/initiate-project-context.md`, `references/initiate-problem-framing.md`, `references/initiate-stakeholder-map.md`, `references/initiate-charter-and-viability-gate.md` |
| Requirements, scope, baseline, roadmap, decisions | `references/plan.md`, `references/plan-requirements-brief.md`, `references/plan-scope-schedule-baseline.md`, `references/plan-roadmap-and-prioritization.md`, `references/plan-raid-raci-decision-setup.md` |
| Delivery coordination, changes, dependencies | `references/execute.md`, `references/execute-work-package-coordination.md`, `references/execute-iteration-cycle.md`, `references/execute-change-control.md`, `references/execute-dependency-and-handoff.md` |
| Status, intake, budget, risk | `references/monitor.md`, `references/monitor-status.md`, `references/monitor-ticket-triage.md`, `references/monitor-budget.md`, `references/monitor-risk-escalation.md` |
| Closeout, handover, lessons, archive | `references/close.md`, `references/close-acceptance-signoff.md`, `references/close-handover-transition.md`, `references/close-lessons-learned.md`, `references/close-benefits-review-and-archive.md` |

## References

- For command help, load `references/command-menu.md`.
- For standalone workflows, load `references/standalone-invocation.md` and then the named standalone skill.
- For PM communication style, use `references/communication-style.md` when returning user-facing reports, updates, escalations, or handoffs.
- For lane workflows, load the lane reference first, then source lifecycle references only as needed.

## Gotchas

- Do not route generic non-operational coding, writing, or research work into Pipa.
- Do not present Pipa as an acronym.
- Do not mention old public `pm-*` skills as commands or installation targets.
- Do not edit or copy the internals of `pipa-audio-brief`, `pipa-huddle-beta`, `pipa-follow-up-reminders`, `pipa-time-tracking`, `pipa-triggers`, or `composio`; they remain authoritative standalone workflows.
- Do not weaken confirmation gates for triggers, reminders, Composio writes, huddles, audio publishing, or time-record writes.
- Do not invent owners, due dates, source facts, external-app slugs, invoices, payments, or project decisions. Use `TBD` for unknowns.
