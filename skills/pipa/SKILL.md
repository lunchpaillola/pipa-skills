---
name: pipa
description: "Use when the user wants Pipa to route service work: find work, define work, deliver work, get paid, grow relationships, learn from the work, or show help. Also use for old Pipa initiate/plan/execute/monitor/status/triage/close wording, and exact connected-capability asks: audio brief, voice session, trigger, email reminder, time tracking, or Composio."
metadata:
  version: 2.0.0
---

# Pipa

Pipa routes the work around the work.

Choose one primary lane, load its reference, return sources, owners, next actions, and `TBD` for unknowns. Do not expose old PM lifecycle routes as public model.

## Workflow

1. **Classify the request.** Decide whether this is Pipa operating work, a connected capability, explicit help/menu, or not a Pipa task.
2. **Pick one primary lane.** Use the command matrix, routing rules, and tie-breakers. If no command is present, route by conversation context when safe.
3. **Load the lane reference.** Start with the mapped lane reference. Add lifecycle references only when the lane needs that structure.
4. **Check gotchas and examples.** Use `references/gotchas.md` plus the matching file in `references/examples/` before producing output.
5. **Use connectors only when needed.** For live app reads/writes, consult `.pipa/CONNECTORS.md` and route through the standalone capability that owns the tool gate.
6. **Run the workflow.** Preserve required inputs, approval gates, provenance, and output contract. Use `TBD` for missing facts.
7. **Return the smallest useful next step.** Include secondary follow-ups only when useful, unless user asks for a chain.

No command? Use conversation context to choose the best lane. Show the menu only for explicit `help`/`menu`, sparse context, or unsafe routing. Not service ops, delivery, stakeholders, money, relationships, learning, or connected Pipa capability? Do not force Pipa.

## Command Matrix

| Lane | Commands and aliases | Primary route |
|---|---|---|
| Find work | `find work`, `source work`, `lead`, `opportunity`, `pipeline`, `prospect`, `outreach`, `market signal`, `content idea` | `references/find-work.md` |
| Define work | `define work`, `scope`, `requirements`, `brief`, `plan`, `charter`, `proposal`, `acceptance`, `decision` | `references/define-work.md` |
| Deliver work | `deliver work`, `execute`, `coordinate`, `status`, `monitor`, `blocker`, `risk`, `handoff`, `dependency`, `triage` | `references/deliver-work.md` |
| Get paid | `get paid`, `getting paid`, `invoice`, `payment`, `budget`, `billable`, `time review`, `margin` | `references/getting-paid.md` |
| Grow relationships | `grow relationships`, `relationship`, `follow up`, `check-in`, `client health`, `stakeholder`, `retention`, `renewal` | `references/growing-relationships.md` |
| Learn from the work | `learn from the work`, `lessons`, `retrospective`, `close`, `archive`, `handover`, `benefits`, `reuse` | `references/learning-from-the-work.md` |
| Connected capabilities | `audio brief`, `voice session`, `talk by voice`, `trigger`, `automate`, `follow-up reminder`, `email reminder`, `time tracking`, `time entry`, `composio` | Standalone skills via `references/standalone-invocation.md` |
| Help | `help`, `menu`, sparse context, unsafe/unknown route | `references/command-menu.md` |

## Routing Rules

1. Known command/alias after Pipa -> matching route.
2. Exact `help` or `menu` -> show command menu.
3. No command, missing command, or unknown command with clear context -> route by intent instead of showing menu.
4. Lane intent wins. Connected capability only for exact job.
5. `pipa-follow-up-reminders` only for one-shot self-email reminders, like `email me tomorrow at 9`. Generic follow-up stays `grow relationships` or `deliver work`.
6. `pipa-triggers` only for event-driven behavior, watcher/listener/webhook setup, trigger mgmt, or recurring delivery with proposal confirmation.
7. `composio` only for live external app access or writes. Start with Composio discovery/schema rules. Never guess slugs.
8. `pipa-audio-brief` only for audio/listenable/spoken/phone-friendly/listening-page briefs. Generic briefs stay lanes.
9. `pipa-huddle-beta` only for live voice session/talk-through.
10. `pipa-time-tracking` only for start/stop/switch/backfill/update/archive/summarize/review time records. Money reasoning stays `get paid` unless time records are source/target.
11. Multiple matches -> one primary lane plus secondary follow-ups, unless user asks for chain.
12. Sparse or unsafe route -> help/menu plus one clarifying question only if needed.

## Compatibility Aliases

| Old wording | New public lane |
|---|---|
| `initiate`, `kickoff`, `context`, `charter`, `stakeholders` | `define work` |
| `plan`, `requirements`, `scope`, `schedule`, `roadmap`, `raid`, `raci` | `define work` |
| `execute`, `coordinate`, `delivery`, `iteration`, `dependency`, `handoff` | `deliver work` |
| `monitor`, `status`, `triage`, `risk`, `escalate`, `blockers` | `deliver work` |
| `budget`, `change control`, `billable time`, `margin` | `get paid` for money/billable intent; else `define work` for setup or `deliver work` for delivery risk |
| `close`, `signoff`, `handover`, `lessons`, `archive`, `benefits` | `learn from the work` |

## Tie-Breakers

- `status` -> `deliver work`, unless automation/tool connection setup/status.
- `triage` -> `deliver work` for tickets/intake, unless triaging route choice.
- `budget` -> `get paid` for burn, forecast, variance, margin, invoice, change-control health. `define work` for new baseline. Ambiguous? Ask one short question.
- `brief` alone -> `define work` for working brief or `deliver work` for status brief, not audio.
- `follow up with client` -> `grow relationships`, unless self-email reminder requested.
- `plan` -> `define work`, not another PM skill.
- `monitor` -> `deliver work`, unless money/relationship wording dominates.
- `stakeholder map/setup/decision authority` -> `define work`; relationship health/check-ins/retention -> `grow relationships`.
- `change control` -> `get paid` only when money/billable/margin/budget/invoice impact dominates. Scope/delivery changes stay `define work` or `deliver work`.

## Source Method Map

Use lifecycle refs internally when lane needs structure:

| Intent | Source references |
|---|---|
| Foundational context, stakeholders, problem framing | `references/initiate.md`, `references/initiate-project-context.md`, `references/initiate-problem-framing.md`, `references/initiate-stakeholder-map.md`, `references/initiate-charter-and-viability-gate.md` |
| Requirements, scope, baseline, roadmap, decisions | `references/plan.md`, `references/plan-requirements-brief.md`, `references/plan-scope-schedule-baseline.md`, `references/plan-roadmap-and-prioritization.md`, `references/plan-raid-raci-decision-setup.md` |
| Delivery coordination, changes, dependencies | `references/execute.md`, `references/execute-work-package-coordination.md`, `references/execute-iteration-cycle.md`, `references/execute-change-control.md`, `references/execute-dependency-and-handoff.md` |
| Status, intake, budget, risk | `references/monitor.md`, `references/monitor-status.md`, `references/monitor-ticket-triage.md`, `references/monitor-budget.md`, `references/monitor-risk-escalation.md` |
| Closeout, handover, lessons, archive | `references/close.md`, `references/close-acceptance-signoff.md`, `references/close-handover-transition.md`, `references/close-lessons-learned.md`, `references/close-benefits-review-and-archive.md` |

## References

- Help/menu: load `references/command-menu.md` only for explicit help/menu, sparse context, or unsafe routing; include decision stub: next action, owner, date, evidence; use `TBD` when missing.
- Standalone workflows: load `references/standalone-invocation.md`, then named standalone skill.
- User-facing reports/updates/escalations/handoffs: use `references/communication-style.md`.
- Lane workflows: load lane reference first; add lifecycle refs only as needed.
- Gotchas/examples: load `references/gotchas.md` and the matching `references/examples/<lane>.md` when the lane has ambiguity, external-tool risk, or owner-facing output.
- Connectors: consult `.pipa/CONNECTORS.md` before any live app read/write or when explaining what tool category a workflow needs.

## Gotchas

- Do not route generic coding, writing, or research into Pipa.
- Do not present Pipa as an acronym.
- Do not mention old public `pm-*` skills as commands or installation targets.
- Do not edit/copy internals of `pipa-audio-brief`, `pipa-huddle-beta`, `pipa-follow-up-reminders`, `pipa-time-tracking`, `pipa-triggers`, or `composio`; standalone skills own them.
- Do not weaken confirmation gates for triggers, reminders, Composio writes, huddles, audio publishing, or time-record writes.
- Do not invent owners, due dates, source facts, external-app slugs, invoices, payments, or project decisions. Use `TBD` for unknowns.
