# Pipa Skills

## Operational skills for the agent you already use

Your craft comes with work around the work, like getting opportunities, defining scope, coordinating delivery, collecting money, keeping clients, and improving operations. Teams hire operators for it. Pipa installs that know-how and tools into your agent.

Pipa skills give agents practical operator workflows for service-business work: lead signals, briefs, delivery updates, blockers, money follow-through, client relationships, closeout, lessons, tools, and automations.

Built and maintained by [Lola](https://www.linkedin.com/in/lolaojabowale) at [Lunch Pail Labs](https://lunchpaillabs.com/).

## Install

```bash
# Install the full skill pack
npx skills add lunchpaillola/pipa-skills

# Or install one skill
npx skills add lunchpaillola/pipa-skills --skill pipa

# See every available skill
npx skills add lunchpaillola/pipa-skills --list
```

To update later:

```bash
npx skills update lunchpaillola/pipa-skills
```

### Clone Instead

```bash
git clone https://github.com/lunchpaillola/pipa-skills.git
cp -r pipa-skills/skills/* .agents/skills/
```

## What Pipa Adds

- Six business lanes: get work, define work, deliver work, get paid, keep clients, and improve operations
- Two meta surfaces: Manage Pipa for setup/config/memory/automation, and Pipa Tools for hosted utilities
- Client delivery planning, coordination, and follow-through
- Money, relationship, handoff, closeout, and learning loops around delivery
- Client-ready updates and internal operating briefs
- Audio briefs from sessions, plans, PRs, docs, and links
- Connected-tool work through Composio-backed workflows
- Recurring Slack updates and event-triggered automations
- Lane-owned references with gotchas, examples, and connector setup through `pipa-manage`

### Core Router

| Skill | Description |
|---|---|
| [`pipa`](skills/pipa/) | Routes business work, Pipa setup, and Pipa utilities into the right skill with clear next actions, owners, dates, evidence, and unknowns. |

### Business Lane Skills

| Skill | Description |
|---|---|
| [`pipa-get-work`](skills/pipa-get-work/) | Helps service businesses create and qualify opportunities through content, inbound, referrals, outreach, market signals, and pipeline next actions. |
| [`pipa-define-work`](skills/pipa-define-work/) | Turns messy demand into defined work: discovery, scope, proposals, acceptance checks, decisions, and client/project onboarding. |
| [`pipa-deliver-work`](skills/pipa-deliver-work/) | Coordinates active delivery: status, blockers, risks, handoffs, dependencies, QA, weekly updates, and next actions. |
| [`pipa-get-paid`](skills/pipa-get-paid/) | Tracks money follow-through: invoices, payments, billable time, budgets, margin, and change-control money impact. |
| [`pipa-keep-clients`](skills/pipa-keep-clients/) | Maintains client trust through follow-ups, check-ins, client health, retention, renewals, referrals, testimonials, and stakeholder care. |
| [`pipa-improve-operations`](skills/pipa-improve-operations/) | Turns work into better operations through retrospectives, lessons, SOPs, templates, reusable processes, and archive readiness. |

### Meta Skills

| Skill | Description |
|---|---|
| [`pipa-manage`](skills/pipa-manage/) | Onboards and manages Pipa itself: business profile, preferences, company brain, memory, connectors, automations, triggers, and loops. |
| [`pipa-tools`](skills/pipa-tools/) | Routes standalone utilities: audio briefs, voice huddles, follow-up reminders, time tracking, Composio/tool access, and future hosted utilities. |

### Breakout Skills

These workflows remain separately installable connected capabilities because they are tool-specific, product-specific, or useful outside the main Pipa route. Public UX groups them under Pipa Tools or Manage Pipa.

| Skill | Description |
|---|---|
| [`pipa-audio-brief`](skills/pipa-audio-brief/) | Turns agent sessions, PRs, plans, specs, docs, URLs, and pasted markdown into a listenable brief with a shareable listening page. |
| [`pipa-huddle-beta`](skills/pipa-huddle-beta/) | Starts a Pipa Huddle voice session with Pipa or the active agent for live talk-throughs, optional planning conversation, and concise context handoff. |
| [`composio-mcp`](skills/composio/) | Routes external app work through the Composio MCP with tool discovery, authorization links, schema-safe execution, and concise provenance. |
| [`pipa-follow-up-reminders`](skills/pipa-follow-up-reminders/) | Creates and cancels deterministic one-shot email follow-up reminders through Pipa only when the user wants a specific future reminder sent to their email. Includes email-code/API-key setup, timezone resolution, and self-reminder guardrails. |
| [`pipa-time-tracking`](skills/pipa-time-tracking/) | Starts, stops, switches, backfills, updates, archives, and summarizes Toggl-style time entries through Pipa generic agent utility records. |
| [`pipa-triggers`](skills/pipa-triggers/) | Creates, inspects, and deletes event-triggered Pipa automations with explicit trigger proposal confirmation. |

## Contributing

Found a way to improve Pipa or a breakout workflow? Open a PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidance on skill structure, eval coverage, and versioning.

## License

[MIT](LICENSE)
