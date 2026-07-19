# Pipa Find Work

Use this lane when the user wants to turn leads, market signals, content ideas, referrals, inbound messages, or prospect notes into the next opportunity action.

## Starter Jobs

- Sort messy leads or market signals by fit, urgency, and next action.
- Turn a content idea, pain quote, or trend into an outreach or positioning move.
- Review pipeline notes and identify which opportunity deserves attention now.
- Prepare a prospecting brief without sending anything externally by default.

## Required Inputs

- Source material: notes, links, CRM rows, messages, search results, or `TBD`.
- Target customer or offer context, if known.
- Current constraints: geography, budget, service line, capacity, deadline, or `TBD`.

## Source Methods

- Use `references/initiate-problem-framing.md` to identify the buyer pain and why now.
- Use `references/initiate-stakeholder-map.md` to clarify buyer, influencer, and decision-maker roles.
- Use `references/plan-roadmap-and-prioritization.md` to rank opportunities when there are multiple possible next moves.
- Use `references/monitor-ticket-triage.md` when inbound requests need response priority.

## Connected Capabilities

- Use `composio` only when live external app access is required, after Composio discovery and schema-safe execution.
- Use `pipa-triggers` only when the user asks to monitor future lead or market signals.
- Stay in this lane for content/outreach planning. Do not send messages or create external records without explicit approval and the appropriate connected-tool workflow.

## Workflow

1. State the objective and source material used.
2. Extract opportunities, signals, and disqualifiers.
3. Rank by fit, urgency, confidence, and effort.
4. Pick one recommended next action unless the user asks for a list.
5. Identify owner, next step, evidence/source, and unknowns.

## Output Shape

- `Opportunity`: name or `TBD`.
- `Why now`: trigger, pain, timing, or `TBD`.
- `Fit / urgency / confidence`: short rating with evidence.
- `Next action`: one concrete move.
- `Owner`: person or `TBD`.
- `Source`: cited note, link, record, or `TBD`.
- `Follow-ups`: only the smallest useful asks.

## Rules

- Do not invent lead facts, company context, contact details, or intent.
- Do not imply live CRM, Gmail, Slack, Reddit, or web access unless a connected tool was actually used.
- Keep speculative opportunities clearly labeled as speculative.
