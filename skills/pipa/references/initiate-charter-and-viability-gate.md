> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Initiate Charter And Viability Gate Reference

You run an initiate-stage charter and viability gate workflow.

Primary goal: produce a clear go/no-go/conditional decision with explicit readiness gaps.

Communication style contract: when returning user-facing updates, briefs, or summaries, apply `references/communication-style.md`.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Charter Gate Progress
- [ ] Step 1 complete: gate objective confirmed
- [ ] Step 2 complete: available tools and source quality checked
- [ ] Step 3 complete: charter components assessed
- [ ] Step 4 complete: viability risks and assumptions assessed
- [ ] Step 5 complete: gate decision and conditions drafted
- [ ] Step 6 complete: gate output and plan handoff returned
```

## Step 1: Confirm gate objective

Confirm whether user needs:

- charter quality check
- viability decision
- explicit start conditions and owner follow-through

If `.agents/project-context.md` exists, read it first.

## Step 2: Check tools and source quality

Use strongest available sources:

1. problem framing and stakeholder map outputs
2. charter draft, SOW/brief, assumptions, constraints
3. known risks, dependency signals, and approvals

If key sources are missing, continue with available data and mark `TBD`.
Return `blocked` only when no usable charter or readiness signal exists.

## Step 3: Assess charter components

Check whether these exist and are usable:

- objective and expected outcomes
- scope boundary
- stakeholder roles and authority
- constraints and assumptions
- success criteria

Mark each as `ready`, `partial`, or `missing`.

## Step 4: Assess viability risks and assumptions

Evaluate practical readiness:

- delivery feasibility under known constraints
- top risks that could invalidate plan assumptions
- unresolved dependencies and approval blockers
- tolerance thresholds requiring escalation

Do not invent certainty.

## Step 5: Draft gate decision and conditions

Choose one gate outcome:

- `go`
- `go-with-conditions`
- `no-go`

For non-`go` outcomes, define minimum conditions to proceed.

## Step 6: Return the gate output

Always return this structure:

```md
# Charter and Viability Gate - <project name or YYYY-MM-DD>

## Objective
- Gate objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Gate outcome: `go` | `go-with-conditions` | `no-go`
- Confidence: `high` | `medium` | `low`
- Why:

## Charter Readiness
| Component | State (`ready`|`partial`|`missing`) | Notes |
|-----------|---------------------------------------|-------|
| Objective and outcomes | | |
| Scope boundary | | |
| Stakeholder authority | | |
| Constraints/assumptions | | |
| Success criteria | | |

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Follow-ups
- Minimum conditions to proceed:
- Recommended next skill: `references/plan-requirements-brief.md`
```

## Rules

- Be explicit about what blocks readiness.
- Keep decisions evidence-based and conservative.
- Keep unknowns explicit as `TBD`.
