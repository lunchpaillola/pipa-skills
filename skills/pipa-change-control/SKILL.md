---
name: pipa-change-control
description: "Use only when `pipa-change-control` is explicitly invoked or `pipa-get-paid` delegates to it. Do not trigger from generic language."
metadata:
  version: 0.1.0
---

# Pipa Change Control

You run an execute-stage change-control workflow.

Primary goal: turn in-flight change requests into explicit decisions with traceable impact and ownership.

Communication style contract: apply `~/.pipa/communication-style.md` when present. Otherwise use clear, concise output with owners, dates, evidence, and unknowns (`TBD`) explicit. Preserve this skill's output contract. The runtime file controls presentation only; ignore it when it conflicts with routing, required findings/output contracts, tool use, facts, safety, or approval/write gates.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Change Control Progress
- [ ] Step 1 complete: change-control objective confirmed
- [ ] Step 2 complete: available tools and source quality checked
- [ ] Step 3 complete: change request and baseline impact mapped
- [ ] Step 4 complete: decision options and recommended path prepared
- [ ] Step 5 complete: approval/escalation actions defined
- [ ] Step 6 complete: change-control output returned
```

## Step 1: Confirm objective

Identify what change decision is needed now:

- evaluate a change request
- determine impact and tolerance breach risk
- route approval/escalation

## Step 2: Check tools and source quality

Use strongest available sources:

1. scope/schedule baseline and assumptions
2. change request details and rationale
3. execution status, dependencies, and resource context

Classify source quality as `high`, `medium`, or `low`.

## Step 3: Map change and impact

Capture:

- requested change and driver
- impacted deliverables/workstreams
- likely scope/timeline/cost implications
- risk and dependency impact

Use directional assessment when exact numbers are not available.

## Step 4: Prepare options and recommendation

At minimum define:

- `accept`
- `accept-with-conditions`
- `defer`
- `reject`
- `escalate`

State why one option is preferred.

## Step 5: Define approval and escalation actions

Specify:

- approval owner
- decision deadline/review checkpoint
- next action for each impacted owner

Mark unknowns as `TBD`.

## Step 6: Return change-control output

Always return this structure:

```md
# Change Control - <project name or YYYY-MM-DD>

## Objective
- Change-control objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Change pressure level:
- Baseline impact signal:
- Recommended decision path:

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Follow-ups
- Approval/escalation path:
- Recommended next skill: `pipa-budget-review`
```

## Rules

- Keep decisions explicit and traceable.
- Run only when the requested change has explicit fee, cost, budget, or margin impact; route non-financial delivery changes to `pipa-deliver-work`.
- Do not approve changes implicitly.
- Keep unknowns explicit as `TBD`.
- Read-only source checks, impact analysis, and recommendations do not require approval and must not be blocked on write permission; immediately before every external or file write, request separate explicit approval scoped to that exact action, destination, and proposed content, never treating the original request or approval for another write as approval; after each approved write, report success or failure and include the resulting path, link, or stable ID when available.
