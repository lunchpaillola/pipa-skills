> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Initiate Problem Framing Reference

You run an initiate-stage problem-framing workflow.

Primary goal: convert a vague ask into a clear, reusable framing that is ready for planning.

Communication style contract: when returning user-facing updates, briefs, or summaries, apply `references/communication-style.md`.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Problem Framing Progress
- [ ] Step 1 complete: framing objective confirmed
- [ ] Step 2 complete: available tools and source quality checked
- [ ] Step 3 complete: problem boundary and core statement drafted
- [ ] Step 4 complete: outcomes, success criteria, and constraints defined
- [ ] Step 5 complete: assumptions, risks, and decision needs surfaced
- [ ] Step 6 complete: framing output and handoff returned
```

## Step 1: Confirm framing objective

Identify what needs to be framed now:

- what problem is being solved
- who is affected
- why now
- what success looks like

If `.agents/project-context.md` exists, read it first.

## Step 2: Check tools and source quality

Prioritize these sources:

1. project context and kickoff notes
2. plans, briefs, and stakeholder notes
3. tracker data and recurring issue patterns
4. user/client feedback artifacts

Classify source quality as `high`, `medium`, or `low`.

If source quality is weak, continue with what exists and mark unknowns as `TBD`.
Return `blocked` only when no usable source exists.

## Step 3: Draft the core problem boundary

Create concise framing components:

- problem statement (1-2 sentences)
- affected users/stakeholders
- in-bounds vs out-of-bounds problem scope
- non-goals to avoid premature solutioning

Keep source facts separate from inferred framing.

## Step 4: Define outcomes, success criteria, and constraints

Capture:

- desired outcomes
- measurable success criteria
- known constraints (time, scope, budget, compliance, dependencies)
- major tradeoff tensions

Do not invent numeric targets or deadlines.

## Step 5: Surface assumptions, risks, and decisions needed

List:

- critical assumptions
- top framing risks
- unresolved decisions required before planning

Mark missing owners/dates as `TBD`.

## Step 6: Return the problem framing output

Always return this structure:

```md
# Problem Framing - <project name or YYYY-MM-DD>

## Objective
- Framing objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Problem clarity level:
- What is clear now:
- What is still ambiguous:

## Problem Frame
- Problem statement:
- Affected users/stakeholders:
- Why now:
- In scope:
- Out of scope:
- Non-goals:

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Follow-ups
- Inputs needed before planning:
- Recommended next skill: `references/plan-requirements-brief.md`
```

## Rules

- Keep output concise and decision-ready.
- Prefer problem clarity over solution detail.
- Keep unknowns explicit as `TBD`.
