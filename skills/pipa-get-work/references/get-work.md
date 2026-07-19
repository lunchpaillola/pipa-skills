# Pipa Get Work

Use when leads, signals, content ideas, referrals, inbound messages, or prospect notes need next opportunity action.

## Starter Jobs

- Sort leads/signals by fit, urgency, next action.
- Turn idea, pain quote, or trend into outreach/positioning move.
- Pick opportunity needing attention now.
- Prep prospecting brief. Send nothing by default.

## Required Inputs

- Source: notes, links, CRM rows, messages, search results, or `TBD`.
- Customer/offer context, if known.
- Constraints: geo, budget, service line, capacity, deadline, or `TBD`.

## Source Methods

- `skills/pipa-define-work/references/initiate-problem-framing.md`: buyer pain + why now.
- `skills/pipa-define-work/references/initiate-stakeholder-map.md`: buyer/influencer/decision-maker.
- `skills/pipa-define-work/references/plan-roadmap-and-prioritization.md`: rank multiple next moves.
- `skills/pipa-deliver-work/references/monitor-ticket-triage.md`: inbound response priority.

## Connected Capabilities

- `composio`: only for live app access, after discovery + schema-safe execution.
- `pipa-manage`/`pipa-triggers`: only for future lead/signal monitoring.
- Content/outreach planning stays here. Send/create nothing without explicit approval + right connected workflow.

See connector categories in Pipa setup/connector docs for connector categories: CRM, chat, email, project tracker, web/search, and knowledge base are common sources here.

## Workflow

1. State objective + source.
2. Extract opportunities, signals, disqualifiers.
3. Rank by fit, urgency, confidence, and effort.
4. Pick one next action unless user asks for list.
5. Name owner, next step, evidence/source, unknowns.

## Output Shape

- `Opportunity`: name or `TBD`.
- `Why now`: trigger, pain, timing, or `TBD`.
- `Fit / urgency / confidence`: short rating with evidence.
- `Next action`: concrete move.
- `Owner`: person or `TBD`.
- `Source`: cited note, link, record, or `TBD`.
- `Follow-ups`: smallest useful asks only.

## Rules

- Do not invent lead facts, company context, contacts, or intent.
- Do not imply live CRM/Gmail/Slack/Reddit/web access unless connected tool ran.
- Keep speculative opportunities clearly labeled as speculative.

## Reference

- `examples/get-work.md`: output examples for leads, signals, and outreach prep.
