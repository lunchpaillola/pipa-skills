---
name: pipa-stakeholder-map
description: "Use when the user explicitly wants to identify stakeholders, map RACI roles or decision authority, clarify approvals, or define communication and escalation paths."
metadata:
  version: 0.1.0
---

# Pipa Stakeholder Map

Make decision rights, ownership, and communication flow explicit.

Apply `skills/pipa/references/communication-style.md` to user-facing output. Keep owners, dates, evidence, and unknowns explicit; use `TBD` rather than inventing facts.

## Workflow

Track mapping objective, source check, stakeholder normalization, authority map, communication/escalation path, and final handoff in working notes as each step completes.

1. Confirm whether the need is accountability, approvals, consulted/informed roles, or delay-prone dependencies.
2. Check briefs, kickoff notes, org/role notes, meeting records, plans, tracker ownership, and escalation history. Classify source quality as `high`, `medium`, or `low`.
3. Normalize each stakeholder's exact supplied name/title, role/team, interest or impact, influence (`high`, `medium`, `low`), and engagement (`active`, `inconsistent`, `unclear`).
4. Map `R`, `A`, `C`, and `I` roles plus decision authority and approval gates.
5. Define routine communication, approval checkpoints, and escalation paths; mark missing owners or dates `TBD`.

## Output Contract

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
|---|---|---|---|---|---|

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|---|---|---|---|---|---|

## Unknowns
- TBD:

## Follow-ups
- Approvals or stakeholders to confirm:
- Recommended next skill: `pipa-project-charter`
```

## Safety

- Never invent decision authority, approval rights, names, or titles.
- Keep the map operational rather than theoretical.
- Do not write external records or contact stakeholders without explicit approval.
