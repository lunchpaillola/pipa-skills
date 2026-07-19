---
name: pipa-get-work
description: "Use when the user wants Pipa to help a small service business get work: content, inbound, leads, pipeline, opportunities, referrals, outreach, market signals, and next opportunity actions."
metadata:
  version: 0.1.0
---

# Pipa Get Work

Help service businesses create and qualify opportunities.

## Use For

- Content ideas, YouTube/blog/social topics, and market signal review.
- Inbound lead triage, referral follow-up, outreach prep, and pipeline next actions.
- Opportunity fit, urgency, confidence, source evidence, and missing inputs.

## References

- Load `references/get-work.md` for the lane workflow.
- Load `references/examples/get-work.md` when an example shape helps.

## Output Contract

- Opportunity or signal.
- Why now.
- Fit, urgency, and confidence.
- Owner and next action.
- Source/evidence or `TBD`.
- Unknowns that block action.

## Boundaries

- Do not claim live inbox, CRM, Slack, Reddit, or web access unless a connected tool was actually used.
- Route setup of connected sources, automations, or recurring monitoring to `pipa-manage`.
- Route standalone tool use to `pipa-tools`.

## Gotchas

- Do not invent lead facts, company context, contacts, or intent.
- Keep speculative opportunities clearly labeled as speculative.
- Sending outreach or creating records requires explicit approval and the right connected workflow.
