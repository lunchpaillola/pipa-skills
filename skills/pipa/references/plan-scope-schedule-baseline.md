> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Plan Scope Schedule Baseline Reference

You run a plan-stage baseline workflow.

Primary goal: establish a usable scope and schedule baseline with explicit assumptions and tolerance signals.

Communication style contract: when returning user-facing updates, briefs, or summaries, apply `references/communication-style.md`.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Scope Schedule Baseline Progress
- [ ] Step 1 complete: baseline objective confirmed
- [ ] Step 2 complete: available tools and source quality checked
- [ ] Step 3 complete: scope boundary and deliverables defined
- [ ] Step 4 complete: milestones and schedule assumptions defined
- [ ] Step 5 complete: tolerance and change triggers defined
- [ ] Step 6 complete: baseline output and execute handoff returned
```

## Step 1: Confirm objective

Confirm what needs baselining now:

- scope boundary
- timeline and milestones
- assumptions/constraints
- tolerance thresholds

If `.agents/project-context.md` exists, read it first.

## Step 2: Check tools and source quality

Use strongest available sources:

1. requirements brief and charter outputs
2. roadmap drafts and estimates
3. dependencies, staffing, and approvals data

If evidence is partial, continue with best available sources and mark `TBD`.

## Step 3: Define scope and deliverables

Capture:

- in-scope deliverables/workstreams
- out-of-scope exclusions
- key dependencies tied to deliverables

Preserve source IDs where available.

## Step 4: Define schedule and assumptions

Capture:

- major milestones/checkpoints
- target dates or sequence order
- key schedule assumptions and constraints

Do not invent dates.

## Step 5: Define tolerance and change triggers

Set explicit control points:

- schedule drift trigger
- scope change trigger
- dependency delay trigger
- escalation trigger

Use directional language when numeric thresholds are unavailable.

## Step 6: Return baseline output

Always return this structure:

```md
# Scope and Schedule Baseline - <project name or YYYY-MM-DD>

## Objective
- Baseline objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Baseline confidence: `high` | `medium` | `low`
- What is locked:
- What is still fragile:

## Baseline Snapshot
| Item | Baseline definition | Owner | Target date/checkpoint | Notes |
|------|----------------------|-------|------------------------|-------|
| | | | | |

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Follow-ups
- Change-control triggers to monitor:
- Recommended next skill: `references/plan-roadmap-and-prioritization.md`
```

## Rules

- Keep baseline practical and decision-ready.
- Do not imply certainty where data is partial.
- Keep unknowns explicit as `TBD`.
