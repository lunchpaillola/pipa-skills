> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Close Benefits Review And Archive Reference

You run a close-stage benefits review and archive workflow.

Primary goal: complete closure by recording value signals and packaging auditable project artifacts.

Communication style contract: when returning user-facing updates, briefs, or summaries, apply `references/communication-style.md`.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Benefits Archive Progress
- [ ] Step 1 complete: archive objective confirmed
- [ ] Step 2 complete: available tools and source quality checked
- [ ] Step 3 complete: expected vs observed benefit signals synthesized
- [ ] Step 4 complete: closure records and archive set validated
- [ ] Step 5 complete: post-close review actions defined
- [ ] Step 6 complete: benefits/archive output returned
```

## Step 1: Confirm objective

Identify what close-out outcome is needed:

- benefits/value review
- complete archive package
- post-close review checkpoints

If `.agents/project-context.md` exists, read it first.

## Step 2: Check tools and source quality

Use strongest available sources:

1. charter goals/success criteria and close outputs
2. delivery/status metrics and stakeholder outcomes
3. handover/signoff records and final documentation set

Classify source quality as `high`, `medium`, or `low`.

## Step 3: Synthesize benefit signals

Capture:

- intended benefits/outcomes
- observed outcomes so far
- gaps between expected and observed value
- confidence in benefit signal

Do not fabricate quantified benefit claims.

## Step 4: Validate closure records and archive set

Confirm archive coverage:

- acceptance/signoff records
- handover artifacts
- lessons-learned output
- decision and risk disposition records
- location/path for long-term retrieval

Mark missing records as `TBD`.

If the user asks for archive readiness and one or more required archive-gate records are missing, set closure package state to `blocked` and list only the minimum final inputs required to archive.

## Step 5: Define post-close review actions

Set:

- any deferred benefit checkpoints
- owner and review date
- archive completion actions for missing records

## Step 6: Return benefits/archive output

Always return this structure:

```md
# Benefits Review and Archive - <project name or YYYY-MM-DD>

## Objective
- Benefits/archive objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Closure package state: `complete` | `complete-with-conditions` | `incomplete` | `blocked`
- Benefits signal confidence: `high` | `medium` | `low`
- Archive/benefits record completion: `complete` | `incomplete` | `blocked`

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Follow-ups
- Post-close benefit review checkpoints:
- Archive location and retrieval notes:
```

## Rules

- Keep close-out records auditable and practical.
- Avoid over-claiming realized benefits.
- Keep unknowns explicit as `TBD`.
- If archive readiness cannot be confirmed from required records, return `blocked` with the minimum final inputs needed.
