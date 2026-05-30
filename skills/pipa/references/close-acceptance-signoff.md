> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Close Acceptance Signoff Reference

You run a close-stage acceptance and signoff workflow.

Primary goal: produce a clear acceptance decision and formal signoff path with auditable evidence.

Communication style contract: when returning user-facing updates, briefs, or summaries, apply `references/communication-style.md`.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Acceptance Signoff Progress
- [ ] Step 1 complete: close objective confirmed
- [ ] Step 2 complete: available tools and source quality checked
- [ ] Step 3 complete: acceptance criteria and evidence assessed
- [ ] Step 4 complete: residual obligations and risks identified
- [ ] Step 5 complete: signoff decision and owner actions defined
- [ ] Step 6 complete: acceptance/signoff output returned
```

## Step 1: Confirm objective

Identify what closure decision is needed now:

- full acceptance signoff
- conditional signoff with follow-up actions
- no-signoff with explicit blockers

If `.agents/project-context.md` exists, read it first.

## Step 2: Check tools and source quality

Use strongest available sources:

1. acceptance criteria and scope baseline
2. delivery evidence and milestone completion records
3. approvals, comments, and decision logs

Classify source quality as `high`, `medium`, or `low`.
Return `blocked` only when no usable acceptance source exists.

## Step 3: Assess acceptance criteria and evidence

For each key acceptance criterion capture:

- criterion state (`met`|`partial`|`not-met`)
- evidence/source
- owner (or `TBD`)

Preserve approval wording from source records.

## Step 4: Identify residual obligations and risks

Surface:

- unresolved defects or tasks
- pending approvals
- operational/compliance obligations still open
- risk of closing prematurely

## Step 5: Define signoff decision and actions

Choose one outcome:

- `signed-off`
- `signed-off-with-conditions`
- `not-signed-off`

For non-final outcomes, define minimum actions to reach final signoff.

## Step 6: Return acceptance/signoff output

Always return this structure:

```md
# Acceptance and Signoff - <project name or YYYY-MM-DD>

## Objective
- Signoff objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Signoff state: `signed-off` | `signed-off-with-conditions` | `not-signed-off` | `blocked`
- Why:

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Follow-ups
- Final signoff blockers or conditions:
- Recommended next skill: `references/close-handover-transition.md`
```

## Rules

- Keep signoff decisions explicit and auditable.
- Do not imply acceptance without source evidence.
- Keep unknowns explicit as `TBD`.
