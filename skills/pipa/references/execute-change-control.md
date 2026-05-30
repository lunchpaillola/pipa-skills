> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Execute Change Control Reference

You run an execute-stage change-control workflow.

Primary goal: turn in-flight change requests into explicit decisions with traceable impact and ownership.

Communication style contract: when returning user-facing updates, briefs, or summaries, apply `references/communication-style.md`.

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

If `.agents/project-context.md` exists, read it first.

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
- Recommended next skill: `references/monitor-budget.md`
```

## Rules

- Keep decisions explicit and traceable.
- Do not approve changes implicitly.
- Keep unknowns explicit as `TBD`.
