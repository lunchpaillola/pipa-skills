---
name: pipa
description: "Use when the user wants project-management or delivery help through Pipa: initiate a project, plan scope or requirements, execute delivery work, monitor status/tickets/budget/risk, close a project, triage PM signals, or route natural-language PM requests. Also use for explicit commands like Pipa help, Pipa status, Pipa triage, Pipa budget, Pipa plan, Pipa execute, Pipa close, Pipa audio brief, Pipa automate, Pipa trigger, or Pipa composio."
metadata:
  version: 0.1.0
---

# Pipa

Pipa is one PM brain with commands underneath.

Use Pipa to route project and delivery work into one primary command, run the matching workflow, and return a decision-ready output. Do not expose the old PM lifecycle skill names to the user.

## How Pipa Works

1. Select one primary route from the command matrix.
2. Load the mapped reference or standalone skill.
3. Execute that workflow without weakening its required inputs, safety gates, or output contract.
4. List secondary follow-ups only when useful, unless the user explicitly asks for a command chain.

If no command is present, route by natural-language PM intent. If the request is not a PM/delivery job, do not force it into Pipa.

## Command Matrix

| Group | Commands and aliases | Primary route |
|---|---|---|
| Start | `initiate`, `kickoff`, `context`, `charter`, `stakeholders` | `references/initiate.md` or a focused initiate reference |
| Plan | `plan`, `requirements`, `scope`, `schedule`, `roadmap`, `raid`, `raci` | `references/plan.md` or a focused plan reference |
| Execute | `execute`, `coordinate`, `delivery`, `iteration`, `change`, `handoff`, `dependency` | `references/execute.md` or a focused execute reference |
| Monitor | `monitor`, `status`, `triage`, `budget`, `risk`, `escalate`, `blockers` | `references/monitor.md` or a focused monitor reference |
| Close | `close`, `signoff`, `handover`, `lessons`, `archive`, `benefits` | `references/close.md` or a focused close reference |
| Connected workflows | `audio`, `audio brief`, `automate`, `trigger`, `composio` | Read-only standalone skills through `references/standalone-invocation.md` |
| Help | `help`, `menu`, no argument | `references/command-menu.md` |

## Routing Rules

1. If the first word after Pipa is a known command or alias, use that route.
2. If no command is present but the request clearly matches a project, delivery, PM, stakeholder, or operational follow-through job, route by intent.
3. If the request implies recurrence, scheduled future delivery, reminders, or existing automation management, route to `pipa-workflow-automation` through `references/standalone-invocation.md`.
4. If the request implies event reaction, webhook, watcher, listener, or trigger management, route to `pipa-triggers` through `references/standalone-invocation.md`.
5. If the request requires an external app action through Composio, route to `composio` through `references/standalone-invocation.md` and never guess tool slugs.
6. Route to `pipa-audio-brief` only when the user explicitly asks for an audio, listenable, spoken, phone-friendly, or listening-page brief. Generic “brief this,” “write a brief,” “requirements brief,” or “project brief” stays inside Pipa planning or summarization.
7. If multiple commands match, choose one primary route and list secondary follow-ups unless the user explicitly asks for a chain.
8. If unknown, show the help/menu response and ask one clarifying question only when needed.

## Tie-Breakers

- `status` means monitor status unless the user asks for setup/status of an automation or tool connection.
- `triage` means monitor ticket/intake triage unless the user is triaging a Pipa command choice.
- `budget` means monitor budget health when wording asks “how are we doing,” burn, forecast, variance, margin, or change control. It means initiate budget setup when wording asks to create, initialize, or refresh a tracker. If ambiguous, ask one short question.
- `plan` means Pipa planning references, not delegation to another top-level PM skill.
- `brief` alone is not audio. `audio brief`, `listenable brief`, `spoken walkthrough`, and `phone-friendly review` are audio.
- Recurring words such as `daily`, `weekly`, `every Monday`, `remind me every`, and `send this every` route to Pipa automation only when the user asks for future scheduled delivery.
- Event words such as `when`, `webhook`, `trigger`, `listener`, `watch`, and `on Linear issue created` route to Pipa triggers only when the user asks for event-driven behavior.

## Focused Command Routes

Use these direct mappings when the command or user wording is specific enough. Otherwise load the lifecycle router reference and let it select one primary focused workflow.

| Command or intent | Direct reference |
|---|---|
| `context`, foundational setup | `references/initiate-project-context.md` |
| `budget` setup, create budget tracker | `references/initiate-budget.md` |
| problem framing, success criteria | `references/initiate-problem-framing.md` |
| `stakeholders`, approvals, decision authority | `references/initiate-stakeholder-map.md` |
| `charter`, viability, go/no-go | `references/initiate-charter-and-viability-gate.md` |
| `requirements`, acceptance boundaries | `references/plan-requirements-brief.md` |
| `scope`, `schedule`, baseline | `references/plan-scope-schedule-baseline.md` |
| `roadmap`, sequencing, prioritization | `references/plan-roadmap-and-prioritization.md` |
| `raid`, `raci`, decision log | `references/plan-raid-raci-decision-setup.md` |
| `coordinate`, work packages | `references/execute-work-package-coordination.md` |
| `iteration`, sprint, cycle | `references/execute-iteration-cycle.md` |
| `change`, change control | `references/execute-change-control.md` |
| `dependency`, `handoff` during delivery | `references/execute-dependency-and-handoff.md` |
| `triage`, intake, ticket response | `references/monitor-ticket-triage.md` |
| `status`, steering update, progress snapshot | `references/monitor-status.md` |
| `budget` health, burn, forecast, variance | `references/monitor-budget.md` |
| `risk`, `escalate`, blockers, owner drift | `references/monitor-risk-escalation.md` |
| `signoff`, acceptance | `references/close-acceptance-signoff.md` |
| `handover`, transition, support ownership | `references/close-handover-transition.md` |
| `lessons`, retrospective learning | `references/close-lessons-learned.md` |
| `archive`, `benefits`, closure record | `references/close-benefits-review-and-archive.md` |

## References

- For command help, load `references/command-menu.md`.
- For standalone workflows, load `references/standalone-invocation.md` and then the named standalone skill.
- For PM communication style, use `references/communication-style.md` when returning user-facing reports, updates, escalations, or handoffs.
- For lifecycle routes, load the lifecycle router reference first unless the command maps cleanly to a focused reference.

## Gotchas

- Do not route generic non-PM coding, writing, or research work into Pipa.
- Do not present Pipa as an acronym.
- Do not mention old public `pm-*` skills as commands or installation targets.
- Do not edit or copy the internals of `pipa-audio-brief`, `composio`, `pipa-triggers`, or `pipa-workflow-automation`; they remain authoritative standalone workflows.
- Do not weaken confirmation gates for recurring automations or triggers.
- Do not invent owners, due dates, source facts, external-app slugs, or project decisions. Use `TBD` for unknowns.
