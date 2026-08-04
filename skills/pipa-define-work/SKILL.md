---
name: pipa-define-work
description: "Use when the user wants Pipa to turn fuzzy demand into defined work by selecting one focused operation for framing, chartering, stakeholders, requirements, scope, roadmap, decisions, or a specific workday plan."
metadata:
  version: 0.1.2
---

# Pipa Define Work

Route fuzzy demand to one focused Define Work operation.

When present, read `~/.pipa/profile.md` once for durable business context. If missing, continue without blocking and do not start setup unless the user asks or a soft setup offer is useful.

## Select One Operation

Explicit operation invocation wins. Otherwise select exactly one primary operation and preserve the user's business objective:

- `pipa-problem-framing`: clarify the problem, affected people, desired outcomes, success criteria, constraints, or non-goals.
- `pipa-stakeholder-map`: map stakeholders, RACI roles, decision authority, approvals, communication, or escalation paths.
- `pipa-project-charter`: assess charter readiness and make a `go`, `go-with-conditions`, or `no-go` viability decision.
- `pipa-requirements-brief`: turn notes or a broad project-planning ask into requirements, acceptance boundaries, and unresolved decisions.
- `pipa-scope-baseline`: baseline deliverables, exclusions, milestones, schedule assumptions, tolerances, and change triggers.
- `pipa-roadmap`: sequence candidate work into now/next/later or another requested prioritization method.
- `pipa-decision-log`: set up RAID, RACI, decision records, ownership, and review cadence.
- `pipa-daily-plan`: plan one specific workday against priorities, estimates, calendar-adjusted capacity, and explicit deferrals.

## Tie-Breakers

- “Plan this project” or similarly broad project planning selects `pipa-requirements-brief`, not `pipa-daily-plan`.
- Select `pipa-daily-plan` only when one specific workday's priorities or capacity are central. Incidental `today` wording does not override project requirements, scope, milestone, or roadmap intent.
- Recurring or scheduled Daily Plan setup goes to `pipa-manage`.
- Start-readiness or go/no-go intent selects `pipa-project-charter`; problem clarity selects `pipa-problem-framing`.
- Ownership of the engagement selects `pipa-stakeholder-map`; governance controls across workstreams select `pipa-decision-log`.
- If multiple operations apply, run the one needed first and name the others only as follow-ups. Do not run an inline fallback if an operation is missing.

Load `references/examples/define-work.md` only when an example shape helps.

## Boundaries

- Pipa onboarding, business profile, preferences, connectors, and company brain setup go to `pipa-manage`.
- Active delivery updates go to `pipa-deliver-work`.

## Gotchas

- Use `TBD` for missing owners, dates, source facts, acceptance checks, or decisions.
- Do not turn fuzzy context into committed scope without identifying assumptions.
- External docs, project records, client-facing artifacts, tasks, calendar events, messages, or automations require explicit approval before writes.
- The selected operation owns the workflow and output contract; this lane does not reproduce it.
