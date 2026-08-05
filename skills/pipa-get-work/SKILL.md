---
name: pipa-get-work
description: "Use when the user wants Pipa to help a small service business get work: content, inbound, leads, pipeline, opportunities, referrals, outreach, market signals, and next opportunity actions."
metadata:
  version: 0.2.0
---

# Pipa Get Work

Help service businesses create and qualify opportunities.

When present, read `~/.pipa/profile.md` once for durable business context. If missing, continue without blocking and do not start setup unless the user asks or a soft setup offer is useful.

## Use For

- Content ideas, YouTube/blog/social topics, and market signal review tied to demand, positioning, outreach, or a named opportunity.
- New-opportunity acquisition, inbound lead triage, prospect referral follow-up, outreach prep, and pipeline next actions.
- Opportunity fit, urgency, confidence, source evidence, and missing inputs.

## Starter Jobs

- Sort leads and signals by fit, urgency, and next action.
- Turn an idea, pain quote, or trend into an outreach or positioning move.
- Pick the opportunity needing attention now.
- Prepare a prospecting brief. Send nothing by default.

## Required Inputs

- Source: notes, links, CRM rows, messages, search results, or `TBD`.
- Customer and offer context, if known.
- Constraints: geography, budget, service line, capacity, deadline, or `TBD`.

## Workflow

1. State the acquisition objective and source.
2. Extract opportunities, signals, and disqualifiers.
3. Rank by fit, urgency, confidence, and effort.
4. Pick one next action unless the user asks for a list.
5. Name the owner, next step, evidence or source, and unknowns.

## Output Contract

- Opportunity or signal.
- Why now.
- Fit, urgency, and confidence.
- Owner and next action.
- Source/evidence or `TBD`.
- Unknowns that block action.
- Smallest useful follow-up asks.

## Boundaries

- New prospects and opportunities belong here. Trust, renewal, testimonial, or referral asks to existing clients belong to `pipa-keep-clients`.
- Prospect follow-up belongs here; relationship follow-up with an existing client belongs to `pipa-keep-clients`.
- Invoice and payment follow-up belongs to `pipa-get-paid`, even when the payer is a client.
- Generic content creation without an acquisition, demand, positioning, or opportunity objective is not automatically Get Work; route by the user's actual objective.
- Do not claim live inbox, CRM, Slack, Reddit, or web access unless a connected tool was actually used.
- Route setup of connected sources, automations, or recurring monitoring to `pipa-manage`.
- Route standalone utility requests to `pipa-tools`.
- Use `composio-mcp` only for live app access after discovery and schema-safe execution.
- Send or create nothing without explicit approval and the right connected workflow.
- Relevant connector categories include CRM, chat, email, project tracker, web/search, and knowledge base.

## Supporting Methods

- `pipa-problem-framing`: buyer pain and why now.
- `pipa-stakeholder-map`: buyer, influencer, and decision-maker.
- `pipa-roadmap`: rank multiple next moves.
- `pipa-ticket-triage`: inbound response priority.
- Load `references/examples/get-work.md` when an example shape helps.

## Gotchas

- Do not invent lead facts, company context, contacts, or intent.
- Keep speculative opportunities clearly labeled as speculative.
- Sending outreach or creating records requires explicit approval and the right connected workflow.
