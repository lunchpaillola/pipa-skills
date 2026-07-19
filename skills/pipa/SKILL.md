---
name: pipa
description: "Use when the user invokes Pipa and needs routing across service-business operations, Pipa setup/management, or Pipa tools. Routes to business lanes: get work, define work, deliver work, get paid, keep clients, improve operations; to Manage Pipa for setup, tools, automations, memory, and preferences; or to Pipa Tools for audio briefs, huddles, reminders, time tracking, and Composio-backed utilities."
metadata:
  version: 2.0.0
---

# Pipa

Pipa routes the work around the work.

Choose one primary destination, hand off to that skill or reference, return sources, owners, next actions, and `TBD` for unknowns.

## Workflow

1. **Classify the request.** Decide whether this is business work, managing Pipa, using a Pipa tool, explicit help/menu, or not a Pipa task.
2. **Pick one primary destination.** Use the command matrix, routing rules, and tie-breakers. If no command is present, route by conversation context when safe.
3. **Load the destination.** Prefer the standalone skill named in the matrix. Use router references only for help/menu details.
4. **Check route-specific gotchas.** Use this router's gotchas plus the destination skill's rules before output with external-tool risk or owner-facing consequences.
5. **Use connectors only when needed.** For live app reads/writes, consult `.pipa/CONNECTORS.md` and route through the standalone capability that owns the tool gate.
6. **Run the workflow.** Preserve required inputs, approval gates, provenance, and output contract. Use `TBD` for missing facts.
7. **Return the smallest useful next step.** Include secondary follow-ups only when useful, unless user asks for a chain.

No command? Use conversation context to choose the best destination. Show the menu only for explicit `help`/`menu`, sparse context, or unsafe routing. Not service ops, Pipa setup/config, or a Pipa utility? Do not force Pipa.

## Command Matrix

| Group | Commands and aliases | Primary route |
|---|---|---|
| Run your business: Get work | `get work`, `source work`, `lead`, `opportunity`, `pipeline`, `prospect`, `outreach`, `market signal`, `content idea`, `YouTube`, `content` | `pipa-get-work` |
| Run your business: Define work | `define work`, `scope`, `requirements`, `brief`, `plan`, `charter`, `proposal`, `acceptance`, `decision`, `client portal setup`, `onboard client` | `pipa-define-work` |
| Run your business: Deliver work | `deliver work`, `execute`, `coordinate`, `status`, `monitor`, `blocker`, `risk`, `handoff`, `dependency`, `triage`, `weekly client update` | `pipa-deliver-work` |
| Run your business: Get paid | `get paid`, `getting paid`, `invoice`, `payment`, `budget`, `billable`, `time review`, `margin` | `pipa-get-paid` |
| Run your business: Keep clients | `keep clients`, `relationship`, `follow up`, `check-in`, `client health`, `stakeholder`, `retention`, `renewal`, `testimonial`, `referral` | `pipa-keep-clients` |
| Run your business: Improve operations | `improve operations`, `lessons`, `retrospective`, `close`, `archive`, `handover`, `benefits`, `reuse`, `SOP`, `template` | `pipa-improve-operations` |
| Manage Pipa | `manage pipa`, `setup`, `onboard pipa`, `business profile`, `preferences`, `company brain`, `memory`, `connect tools`, `connector`, `automation`, `trigger`, `loop`, `recurring workflow` | `pipa-manage` |
| Pipa Tools | `pipa tools`, `audio brief`, `voice session`, `talk by voice`, `follow-up reminder`, `email reminder`, `time tracking`, `time entry`, `composio`, `hosted utility` | `pipa-tools` |
| Help | `help`, `menu`, sparse context, unsafe/unknown route | `references/help-menu.md` |

## Routing Rules

1. Known command/alias after Pipa -> matching route.
2. Exact `help` or `menu` -> show command menu.
3. No command, missing command, or unknown command with clear context -> route by intent instead of showing menu.
4. Business lane intent wins for business work. Tool/setup intent wins only when the user asks to operate Pipa or use a standalone utility.
5. `pipa-manage` owns Pipa onboarding, business profile, preferences, company brain, connected tools, automations, triggers, and recurring loops.
6. `pipa-tools` owns standalone hosted utilities and exact utility jobs: audio briefs, voice huddles, follow-up reminders, time tracking, and Composio-backed tool access.
7. Generic client follow-up stays `keep clients` or `deliver work`. One-shot self-email reminders go through `pipa-tools` to `pipa-follow-up-reminders`.
8. One-time status/update work stays `deliver work`. Event-driven or recurring setup goes through `pipa-manage` to `pipa-triggers`.
9. Live external app access or writes go through `pipa-tools`/Composio discovery/schema rules. Never guess slugs.
10. Multiple matches -> one primary destination plus secondary follow-ups, unless user asks for chain.
11. Sparse or unsafe route -> help/menu plus one clarifying question only if needed.

## Tie-Breakers

- `status` -> `deliver work`, unless automation/tool connection setup/status.
- `triage` -> `deliver work` for tickets/intake, unless triaging route choice.
- `budget` -> `get paid` for burn, forecast, variance, margin, invoice, change-control health. `define work` for new baseline. Ambiguous? Ask one short question.
- `brief` alone -> `define work` for working brief or `deliver work` for status brief, not audio.
- `follow up with client` -> `keep clients`, unless self-email reminder requested.
- `plan` -> `define work`, not another PM skill.
- `monitor` -> `deliver work`, unless money/relationship wording dominates.
- `stakeholder map/setup/decision authority` -> `define work`; relationship health/check-ins/retention -> `keep clients`.
- `company brain` -> `pipa-manage` for setup/config/access; `improve operations` for ongoing process learning.
- `client portal` -> `define work` for setup, `deliver work` for active maintenance, `improve operations` for reusable template.
- `weekly client update` -> `deliver work`; recurring update automation -> `pipa-manage`.
- `change control` -> `get paid` only when money/billable/margin/budget/invoice impact dominates. Scope/delivery changes stay `define work` or `deliver work`.

## References

- Help/menu: load `references/help-menu.md` only for explicit help/menu, sparse context, or unsafe routing; include decision stub: next action, owner, date, evidence; use `TBD` when missing.
- Utility workflows: route through `pipa-tools` or `pipa-manage`, then named standalone skill.
- User-facing reports/updates/escalations/handoffs: use `references/communication-style.md`.
- Lane workflows: load the standalone lane skill. The lane skill owns its references and examples.
- Connectors: consult `.pipa/CONNECTORS.md` before any live app read/write or when explaining what tool category a workflow needs.

## Gotchas

- Do not route generic coding, writing, or research into Pipa.
- Do not present Pipa as an acronym.
- Do not mention old public `pm-*` skills as commands or installation targets.
- Do not edit/copy internals of `pipa-audio-brief`, `pipa-huddle-beta`, `pipa-follow-up-reminders`, `pipa-time-tracking`, `pipa-triggers`, or `composio`; standalone skills own them.
- Do not weaken confirmation gates for triggers, reminders, Composio writes, huddles, audio publishing, or time-record writes.
- Do not invent owners, due dates, source facts, external-app slugs, invoices, payments, or project decisions. Use `TBD` for unknowns.
