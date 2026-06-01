# Pipa Skills

Pipa skills are the agent workflows that power studio operations and client delivery for [Pipa](https://www.usepipa.com/), the operations agent for craft-led studios.

Built and maintained by [Lola](https://www.linkedin.com/in/lolaojabowale) at [Lunch Pail Labs](https://lunchpaillabs.com/). If you want a hosted version of these workflows with Slack, connected tools, and managed setup, see [Pipa](https://www.usepipa.com/).

## What These Skills Handle

Pipa skills give agents practical workflows for making, operating, and reaching: the work itself, the studio behind the work, and the audience-facing motion that helps finished work find the right people.

- Client delivery planning, coordination, and follow-through
- Project operations for status, blockers, risks, budgets, and escalations
- Handoffs, signoffs, closeout, and lessons learned
- Client-ready updates and internal operating briefs
- Audio briefs from sessions, plans, PRs, docs, and links
- Connected-tool work through Composio-backed workflows
- Recurring Slack updates and event-triggered automations
- Experimental reach workflows for finding relevant conversations around finished work

## Core Skill

| Skill | Description |
|---|---|
| [`pipa`](skills/pipa/) | Studio operations and client delivery agent. Routes messy asks into the right operating workflow and returns clear next actions, owners, dates, evidence, and unknowns. |

## Breakout Skills

These workflows remain separately installable because they are tool-specific, product-specific, or useful outside the main Pipa route.

| Skill | Description |
|---|---|
| [`agent-audio-brief`](skills/agent-audio-brief/) | Turns agent sessions, PRs, plans, specs, docs, URLs, and pasted markdown into a Kokoro-generated listenable brief published as a here.now listening page. |
| [`composio`](skills/composio/) | Routes external app work through Composio with setup/auth checks, search/link/execute discipline, and concise provenance. |
| [`pipa-reach`](skills/pipa-reach/) | Experimental Reach workflow for finding threads, questions, and communities where finished work can contribute helpfully. |
| [`pipa-triggers`](skills/pipa-triggers/) | Creates, inspects, and deletes event-triggered Pipa automations with explicit trigger proposal confirmation. |
| [`pipa-workflow-automation`](skills/pipa-workflow-automation/) | Creates, inspects, and deletes recurring Slack-driven Pipa automations with schedule, timezone, destination, prompt, and final confirmation gates. |

## Example Asks

- "Watch this launch and tell me what needs attention before Friday."
- "Turn these notes into a client-ready update."
- "Find the blockers, owners, and next actions from this thread."
- "Make this a weekly operating brief."
- "Prepare the handoff and list what is still unknown."
- "Create an audio brief from this plan."
- "Pipa reach find-threads for this launch."

## Installation

### CLI Install

```bash
# Install the full skill pack
npx skills add lunchpaillola/pipa-skills

# Install Pipa first
npx skills add lunchpaillola/pipa-skills --skill pipa

# Install a breakout skill
npx skills add lunchpaillola/pipa-skills --skill agent-audio-brief

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
