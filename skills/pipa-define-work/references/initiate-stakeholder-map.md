> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Initiate Stakeholder Map Reference

You run an initiate-stage stakeholder-mapping workflow.

Primary goal: make decision rights, ownership, and communication flow explicit before planning starts.

Communication style contract: when returning user-facing updates, briefs, or summaries, apply `skills/pipa/references/communication-style.md`.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Stakeholder Map Progress
- [ ] Step 1 complete: mapping objective confirmed
- [ ] Step 2 complete: available tools and source quality checked
- [ ] Step 3 complete: stakeholder list normalized
- [ ] Step 4 complete: decision and approval roles mapped
- [ ] Step 5 complete: communication/escalation path defined
- [ ] Step 6 complete: stakeholder output and handoff returned
```

## Step 1: Confirm mapping objective

Identify what is needed now:

- who is accountable and who approves
- who must be consulted/informed
- which approvals or dependencies may delay progress

If `.agents/project-context.md` exists, read it first.

## Step 2: Check tools and source quality

Use the strongest available sources:

1. project context and kickoff notes
2. existing org/role notes, meeting records, and plans
3. tracker ownership signals and escalation history

Classify source quality as `high`, `medium`, or `low`.
If uncertain, continue and mark unknowns as `TBD`.

## Step 3: Normalize stakeholder list

For each stakeholder, capture:

- role and team
- interest/impact
- influence level (`high`|`medium`|`low`)
- current engagement level (`active`|`inconsistent`|`unclear`)

Preserve names/titles exactly as provided.

## Step 4: Map decision and approval roles

Create a practical RACI-style view:

- `A` accountable
- `R` responsible
- `C` consulted
- `I` informed

Also capture decision authority and approval gates.

## Step 5: Define communication and escalation paths

Identify:

- routine communication cadence
- required approval checkpoints
- escalation path when decisions stall

Mark missing owners and dates as `TBD`.

## Step 6: Return the stakeholder-map output

Always return this structure:

```md
# Stakeholder Map - <project name or YYYY-MM-DD>

## Objective
- Mapping objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Ownership clarity level:
- Decision-risk hotspots:

## Stakeholder Map
| Stakeholder | Role/Team | RACI | Decision authority | Engagement level | Notes |
|-------------|-----------|------|--------------------|------------------|-------|
| | | | | | |

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Follow-ups
- Approvals or stakeholders to confirm:
- Recommended next skill: `references/initiate-charter-and-viability-gate.md`
```

## Rules

- Keep it operational, not theoretical.
- Never invent decision authority.
- Keep unknowns explicit as `TBD`.
