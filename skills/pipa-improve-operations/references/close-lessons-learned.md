> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Close Lessons Learned Reference

You run a close-stage lessons-learned workflow.

Primary goal: produce reusable, action-oriented learnings with owners and follow-through.

Communication style contract: when returning user-facing updates, briefs, or summaries, apply `skills/pipa/references/communication-style.md`.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Lessons Learned Progress
- [ ] Step 1 complete: learning objective confirmed
- [ ] Step 2 complete: available tools and source quality checked
- [ ] Step 3 complete: outcomes and variance drivers synthesized
- [ ] Step 4 complete: repeatable learnings and anti-patterns identified
- [ ] Step 5 complete: implementation actions and ownership defined
- [ ] Step 6 complete: lessons output returned
```

## Step 1: Confirm objective

Identify what learning outcome is needed:

- project/team retrospective for future execution
- evidence-backed lessons for playbook updates
- operating changes with owners

If `.agents/project-context.md` exists, read it first.

## Step 2: Check tools and source quality

Use strongest available sources:

1. status history and closure artifacts
2. incidents/risks/decision logs
3. retro notes and stakeholder feedback

Classify source quality as `high`, `medium`, or `low`.

## Step 3: Synthesize outcomes and variance drivers

Capture:

- expected vs actual outcomes
- top drivers of positive and negative variance
- decision patterns that helped or hurt

Separate source facts from interpretation.

## Step 4: Identify reusable learnings and anti-patterns

Create concise lessons:

- keep doing
- start doing
- stop doing

Each lesson should map to observable evidence.

## Step 5: Define implementation actions

For each key lesson, set:

- concrete next action
- owner
- due/review date
- status

Unknowns must be `TBD`.

## Step 6: Return lessons output

Always return this structure:

```md
# Lessons Learned - <project name or YYYY-MM-DD>

## Objective
- Learning objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Learning confidence: `high` | `medium` | `low`
- Most important takeaway:

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Follow-ups
- Process updates to implement:
- Recommended next skill: `references/close-benefits-review-and-archive.md`
```

## Rules

- Keep learnings evidence-backed and operational.
- Avoid blame language.
- Keep unknowns explicit as `TBD`.
