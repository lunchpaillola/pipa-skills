# Pipa Skills

## Operational skills for the agent you already use

Your craft comes with work around the work, like finding opportunities, defining scope, coordinating delivery, collecting money, maintaining relationships, and learning from what shipped. Teams hire operators for it. Pipa installs that know-how and tools into your agent.

Pipa skills give agents practical operator workflows for service-business work: lead signals, briefs, delivery updates, blockers, money follow-through, client relationships, closeout, lessons, and automations.

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

- Six operating lanes: find work, define work, deliver work, get paid, grow relationships, and learn from the work
- Client delivery planning, coordination, and follow-through
- Money, relationship, handoff, closeout, and learning loops around delivery
- Client-ready updates and internal operating briefs
- Audio briefs from sessions, plans, PRs, docs, and links
- Connected-tool work through Composio-backed workflows
- Recurring Slack updates and event-triggered automations
- Progressive Pipa references with gotchas, examples, and connector categories in `.pipa/CONNECTORS.md`

### Core Skill

| Skill | Description |
|---|---|
| [`pipa`](skills/pipa/) | Routes operating work into the right lane: find work, define work, deliver work, get paid, grow relationships, or learn from the work, with clear next actions, owners, dates, evidence, and unknowns. |

### Breakout Skills

These workflows remain separately installable connected capabilities because they are tool-specific, product-specific, or useful outside the main Pipa route.

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
