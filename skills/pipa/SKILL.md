---
name: pipa
description: "Use when the user invokes Pipa or asks to plan a service-business workday, shut down work for the day, or prepare tomorrow. Routes business operations to get work, define work, deliver work, get paid, keep clients, improve operations, Manage Pipa, or Pipa Tools."
metadata:
  version: 2.0.2
---

# Pipa

Pipa routes the work around the work.

Choose one primary destination, hand off to that skill, return sources, owners, next actions, and `TBD` for unknowns.

## Workflow

1. **Classify the request.** Decide whether this is business work, managing Pipa, using a Pipa tool, explicit help/menu, or not a Pipa task.
2. **Pick one primary destination.** Use the command matrix, routing rules, and tie-breakers. If no command is present, route by conversation context when safe.
3. **Load the destination.** Prefer the standalone skill named in the matrix. Use router references only for help/menu details.
4. **Check route-specific gotchas.** Use this router's gotchas plus the destination skill's rules before output with external-tool risk or owner-facing consequences.
5. **Use connectors only when needed.** For setup/status, route to `pipa-manage`. For live app reads/writes, keep the business lane objective, use `~/.pipa/CONNECTORS.md` when present to resolve the preferred toolkit, then use `composio-mcp` to verify access and execute with discovery and schema checks.
6. **Run the workflow.** Preserve required inputs, approval gates, provenance, and output contract. Use `TBD` for missing facts.
7. **Return the smallest useful next step.** Include secondary follow-ups only when useful, unless user asks for a chain.

No command? Use conversation context to choose the best destination. Show the menu only for explicit `help`/`menu`, sparse context, or unsafe routing. Not service ops, Pipa setup/config, or a Pipa utility? Do not force Pipa.

## Exact Operation Routes

Explicit invocation of one of these names wins over lane aliases and adjacent operation wording:

| Entry surface | Exact operation names |
|---|---|
| Manage Pipa | `pipa-setup`, `pipa-connectors` |
| Define Work | `pipa-project-charter`, `pipa-problem-framing`, `pipa-stakeholder-map`, `pipa-daily-plan`, `pipa-decision-log`, `pipa-requirements-brief`, `pipa-roadmap`, `pipa-scope-baseline` |
| Deliver Work | `pipa-work-coordination`, `pipa-iteration-cycle`, `pipa-dependency-handoff`, `pipa-risk-escalation`, `pipa-status-update`, `pipa-ticket-triage` |
| Get Paid | `pipa-change-control`, `pipa-budget-setup`, `pipa-budget-review` |
| Improve Operations | `pipa-acceptance-signoff`, `pipa-closeout-review`, `pipa-daily-shutdown`, `pipa-handover`, `pipa-retrospective` |

Get Work and Keep Clients remain lane-native. Do not invent child operations for them.

## Command Matrix

| Group | Commands and aliases | Primary route |
|---|---|---|
| Run your business: Get work | `get work`, `source work`, `lead`, `opportunity`, `pipeline`, `prospect`, `outreach`, `market signal`, `content idea`, `YouTube`, `content` | `pipa-get-work` |
| Run your business: Define work | `define work`, `scope`, `requirements`, `brief`, `plan`, `daily planning`, `plan my day`, `charter`, `proposal`, `acceptance`, `decision`, `client portal setup`, `onboard client` | `pipa-define-work` |
| Run your business: Deliver work | `deliver work`, `execute`, `coordinate`, `status`, `monitor`, `blocker`, `risk`, `handoff`, `dependency`, `triage`, `weekly client update` | `pipa-deliver-work` |
| Run your business: Get paid | `get paid`, `getting paid`, `invoice`, `payment`, `budget`, `billable`, `time review`, `margin` | `pipa-get-paid` |
| Run your business: Keep clients | `keep clients`, `relationship`, `follow up`, `check-in`, `client health`, `stakeholder`, `retention`, `renewal`, `testimonial`, `referral` | `pipa-keep-clients` |
| Run your business: Improve operations | `improve operations`, `lessons`, `retrospective`, `close`, `daily shutdown`, `close my day`, `archive`, `handover`, `benefits`, `reuse`, `SOP`, `template` | `pipa-improve-operations` |
| Manage Pipa | `manage pipa`, `setup`, `onboard pipa`, `business profile`, `preferences`, `company brain`, `memory`, `connect tools`, `connector`, `automation`, `trigger`, `loop`, `recurring workflow` | `pipa-manage` |
| Pipa Tools | `pipa tools`, `audio brief`, `voice session`, `talk by voice`, `follow-up reminder`, `email reminder`, `time tracking`, `time entry`, `hosted utility` | `pipa-tools` |
| Handoff checks | `get-to-define`, `define-to-deliver`, `deliver-to-get-paid`, `deliver-to-relationships`, `improve-to-keep-clients` | source lane first, then named next lane follow-up |
| Help | `help`, `menu`, sparse context, unsafe/unknown route | `references/help-menu.md` |

## Routing Rules

1. Exact operation name -> that operation, even when the request also contains lane or adjacent-operation wording.
2. Exact `help` or `menu` -> show command menu.
3. Known lane command/alias after Pipa -> matching lane; the lane selects one operation when applicable.
4. No command, missing command, or unknown command with clear context -> route by intent into one business lane instead of showing menu.
5. Generic business work enters one of the six business lanes. Manage Pipa and Pipa Tools apply only to configuration or an explicit specialized utility.
6. `pipa-manage` owns Pipa onboarding, business profile, preferences, company brain, connected tools, automations, triggers, and recurring loops.
7. A missing `~/.pipa/profile.md` never overrides a concrete business-work route. Setup may be offered softly after the requested work.
8. `pipa-tools` owns standalone hosted utilities and exact utility jobs: audio briefs, voice huddles, follow-up reminders, and time tracking.
9. Generic client follow-up stays `keep clients` or `deliver work`. One-shot self-email reminders go through `pipa-tools` to `pipa-follow-up-reminders`.
10. One-time status/update work stays `deliver work`. Event-driven or recurring setup goes through `pipa-manage` to `pipa-triggers`.
11. Live external app access or writes use the standalone `composio-mcp` skill while the selected business lane keeps ownership of the job. A connector-map entry selects a preferred toolkit but never proves live access. Never guess slugs.
12. Multiple matches -> one primary destination plus secondary follow-ups, unless user asks for chain.
13. Handoff checks -> return `Objective`, `Source Check` or `Tool Access Check`, `Current Signal`, actions with owner/date/evidence, `TBD` gaps, and next lane follow-ups. Do not execute multiple lanes unless asked.
14. Sparse or unsafe route -> help/menu plus one clarifying question only if needed.

## Tie-Breakers

- `status` -> `deliver work`, unless automation/tool connection setup/status.
- `triage` -> `deliver work` for tickets/intake, unless triaging route choice.
- `budget` -> `get paid`: new baseline selects `pipa-budget-setup`; burn, forecast, variance, or margin selects `pipa-budget-review`. Ambiguous? Ask one short question.
- `brief` alone -> `define work` for working brief or `deliver work` for status brief, not audio.
- `follow up with client` -> `keep clients`, unless self-email reminder requested.
- `plan` -> `define work`, not another PM skill.
- `daily planning`, `plan my day`, or choosing today's priorities -> `define work`; recurring or scheduled daily planning -> `pipa-manage`.
- `daily shutdown`, `close my day`, or shutting down today's work -> `improve operations`; recurring or scheduled daily shutdown -> `pipa-manage`.
- Explicit requirements, scope, schedule baseline, signoff, handover, or archive intent overrides incidental `today` wording; Daily Plan requires workday priority/capacity intent and Daily Shutdown requires workday wrap-up/tomorrow intent.
- Daily Shutdown completion closes the ritual, not the project; formal project closure still requires the existing evidence gates.
- `monitor` -> `deliver work`, unless money/relationship wording dominates.
- `stakeholder map/setup/decision authority` -> `define work`; relationship health/check-ins/retention -> `keep clients`.
- `company brain` -> `pipa-manage` for setup/config/access; `improve operations` for ongoing process learning.
- `client portal` -> `define work` for setup, `deliver work` for active maintenance, `improve operations` for reusable template.
- `weekly client update` -> `deliver work`; recurring update automation -> `pipa-manage`.
- `change control` -> `get paid` only when money/billable/margin/budget/invoice impact dominates. Scope/delivery changes stay `define work` or `deliver work`.

## References

- Help/menu: load `references/help-menu.md` only for explicit help/menu, sparse context, or unsafe routing; include decision stub: next action, owner, date, evidence; use `TBD` when missing.
- Utility workflows route through `pipa-tools`; Pipa configuration routes through `pipa-manage`.
- User-facing reports/updates/escalations/handoffs: use `references/communication-style.md`.
- Lane workflows: load the standalone lane skill. The lane skill owns its references and examples.
- Connectors: use `pipa-manage` for connection setup/status and `composio-mcp` for live app reads/writes within the selected business lane.

## Gotchas

- Do not route generic coding, writing, or research into Pipa.
- Do not present Pipa as an acronym.
- Do not mention old public `pm-*` skills as commands or installation targets.
- Do not edit/copy internals of `pipa-audio-brief`, `pipa-huddle-beta`, `pipa-follow-up-reminders`, `pipa-time-tracking`, `pipa-triggers`, or `composio-mcp`; standalone skills own them.
- Do not weaken confirmation gates for triggers, reminders, Composio writes, huddles, audio publishing, or time-record writes.
- Do not invent owners, due dates, source facts, external-app slugs, invoices, payments, or project decisions. Use `TBD` for unknowns.
