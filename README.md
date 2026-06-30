# Pipa Skills

Pipa skills are the agent workflows that power studio operations and client delivery for [Pipa](https://www.usepipa.com/), the operations agent for craft-led studios.

Built and maintained by [Lola](https://www.linkedin.com/in/lolaojabowale) at [Lunch Pail Labs](https://lunchpaillabs.com/). If you want a hosted version of these workflows with Slack, connected tools, and managed setup, see [Pipa](https://www.usepipa.com/).

## What These Skills Handle

Pipa skills give agents practical operator workflows for the work around the work: client delivery, project operations, updates, handoffs, blockers, briefs, and automations.

- Client delivery planning, coordination, and follow-through
- Project operations for status, blockers, risks, budgets, and escalations
- Handoffs, signoffs, closeout, and lessons learned
- Client-ready updates and internal operating briefs
- Audio briefs from sessions, plans, PRs, docs, and links
- Connected-tool work through Composio-backed workflows
- Recurring Slack updates and event-triggered automations

## Core Skill

| Skill | Description |
|---|---|
| [`pipa`](skills/pipa/) | Studio operations and client delivery agent. Routes messy asks into the right operating workflow and returns clear next actions, owners, dates, evidence, and unknowns. |

## Breakout Skills

These workflows remain separately installable because they are tool-specific, product-specific, or useful outside the main Pipa route.

| Skill | Description |
|---|---|
| [`pipa-audio-brief`](skills/pipa-audio-brief/) | Turns agent sessions, PRs, plans, specs, docs, URLs, and pasted markdown into a listenable brief with a shareable listening page. |
| [`pipa-huddle-beta`](skills/pipa-huddle-beta/) | Starts a Pipa Huddle voice session with Pipa or the active agent for live talk-throughs, optional planning conversation, and concise context handoff. |
| [`composio-mcp`](skills/composio/) | Routes external app work through the Composio MCP with tool discovery, authorization links, schema-safe execution, and concise provenance. |
| [`pipa-follow-up-reminders`](skills/pipa-follow-up-reminders/) | Creates and cancels deterministic one-shot email follow-up reminders through Pipa only when the user wants a specific future reminder sent to their email. Includes email-code/API-key setup, timezone resolution, and self-reminder guardrails. |
| [`pipa-time-tracking`](skills/pipa-time-tracking/) | Starts, stops, switches, backfills, updates, archives, and summarizes Toggl-style time entries through Pipa generic agent utility records. |
| [`pipa-triggers`](skills/pipa-triggers/) | Creates, inspects, and deletes event-triggered Pipa automations with explicit trigger proposal confirmation. |
| [`pipa-workflow-automation`](skills/pipa-workflow-automation/) | Creates, inspects, and deletes recurring Slack-driven Pipa automations with schedule, timezone, destination, prompt, and final confirmation gates. |

## Example Asks

- "Watch this launch and tell me what needs attention before Friday."
- "Turn these notes into a client-ready update."
- "Find the blockers, owners, and next actions from this thread."
- "Make this a weekly operating brief."
- "Email me tomorrow at 9 AM to follow up on the proposal."
- "Prepare the handoff and list what is still unknown."
- "Create an audio brief from this plan."

## Installation

### CLI Install

```bash
# Install the full skill pack
npx skills add lunchpaillola/pipa-skills

# Install Pipa first
npx skills add lunchpaillola/pipa-skills --skill pipa

# Install a breakout skill
npx skills add lunchpaillola/pipa-skills --skill pipa-audio-brief

# List available skills
npx skills add lunchpaillola/pipa-skills --list

# Update installed skills
npx skills update lunchpaillola/pipa-skills
```

### Clone and Copy

```bash
git clone https://github.com/lunchpaillola/pipa-skills.git
cp -r pipa-skills/skills/* .agents/skills/
```

## Contributing

Found a way to improve Pipa or a breakout workflow? Open a PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidance on skill structure, eval coverage, and versioning.

## License

[MIT](LICENSE)
