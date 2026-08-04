---
name: pipa-problem-framing
description: "Use only when `pipa-problem-framing` is explicitly invoked or `pipa-define-work` delegates to it. Do not trigger from generic language."
metadata:
  version: 0.1.0
---

# Pipa Problem Framing

Convert a vague ask into a planning-ready problem frame.

Apply `skills/pipa/references/communication-style.md` to user-facing output. Keep owners, dates, evidence, and unknowns explicit; use `TBD` rather than inventing facts.

## Workflow

Track framing objective, source check, boundary, outcomes/constraints, assumptions/decisions, and final handoff in working notes as each step completes.

1. Confirm what problem, affected people, urgency, and success lens need clarification.
2. Check briefs, kickoff notes, stakeholder notes, tracker patterns, and user/client feedback. Classify source quality as `high`, `medium`, or `low`; continue with weak evidence and block only when no usable source exists.
3. Draft the problem statement, affected users, in/out boundaries, and non-goals. Separate source facts from inference.
4. Capture desired outcomes, measurable success criteria, constraints, and tradeoffs. Do not invent numeric targets or deadlines.
5. Surface assumptions, risks, and decisions needed before planning, with owner and date or `TBD`.

## Output Contract

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
|---|---|---|---|---|---|

## Unknowns
- TBD:

## Follow-ups
- Inputs needed before planning:
- Recommended next skill: `pipa-requirements-brief`
```

## Safety

- Preserve source wording and distinguish evidence from inference.
- Do not turn framing into committed scope or a preferred solution.
- Do not write external records without explicit approval.
