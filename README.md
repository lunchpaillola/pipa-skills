# Pipa Skills

Pipa is one PM brain for project delivery work. Instead of asking an agent to choose from a catalog of lifecycle skills, you invoke Pipa and let it route the request to the right command: initiate, plan, execute, monitor, close, or a connected workflow.

This repository contains reusable AI agent skills for project managers, delivery managers, implementation teams, and professional services teams that need sharper planning, status, triage, follow-through, and closeout.

Built by [Lola](https://www.linkedin.com/in/lolaojabowale) at [Lunch Pail Labs](https://lunchpaillabs.com). Want a managed setup for these workflows in real client delivery environments? See [PailFlow](https://pailflow.com).

## Why Pipa

Project work does not arrive neatly labeled as “initiate,” “monitor,” or “close.” It arrives as messy asks:

- “What needs attention before steering?”
- “Turn these notes into a delivery plan.”
- “Who owns this blocker?”
- “Make this a weekly update.”
- “Are we ready to close?”

Pipa turns those asks into one primary route, runs the matching PM workflow, and returns a decision-ready answer with owners, next actions, due/review dates, status, evidence, and explicit `TBD` unknowns.

## Command Groups

| Job | Commands | Use when |
|---|---|---|
| Start | `Pipa initiate`, `Pipa context`, `Pipa charter`, `Pipa stakeholders` | Set up project context, frame the problem, map stakeholders, or decide go/no-go readiness. |
| Plan | `Pipa plan`, `Pipa requirements`, `Pipa scope`, `Pipa roadmap`, `Pipa raid`, `Pipa raci` | Turn intent into requirements, baselines, sequencing, and governance controls. |
| Execute | `Pipa execute`, `Pipa coordinate`, `Pipa iteration`, `Pipa change`, `Pipa handoff` | Coordinate active work, cycles, changes, dependencies, and handoffs. |
| Monitor | `Pipa status`, `Pipa triage`, `Pipa budget`, `Pipa risk`, `Pipa escalate` | Produce status, intake triage, budget health, blocker follow-through, and escalation paths. |
| Close | `Pipa close`, `Pipa signoff`, `Pipa handover`, `Pipa lessons`, `Pipa archive` | Confirm acceptance, transition ownership, capture lessons, review benefits, and package closure records. |
| Connected | `Pipa audio brief`, `Pipa automate`, `Pipa trigger`, `Pipa composio` | Route into standalone skills for audio briefs, recurring PailFlow automations, event triggers, and external app actions. |
| Help | `Pipa help`, `Pipa menu`, bare `Pipa` | Show recommended next commands and the full grouped menu. |

Pipa also handles natural-language PM requests. For example, “give me a project status update” routes to `Pipa status`; “plan this work” routes to `Pipa plan`; “send this every Friday” routes to `Pipa automate`.

The table above is the user-facing command map. `skills/pipa/SKILL.md` is the authoritative routing matrix and includes additional aliases such as `kickoff`, `delivery`, `blockers`, and `benefits`.

## Common Command Chains

- New project: `Pipa initiate` -> `Pipa plan` -> `Pipa execute`
- Steering prep: `Pipa status` -> `Pipa budget` -> `Pipa risk`
- Intake cleanup: `Pipa triage` -> `Pipa status`
- Delivery risk: `Pipa execute` -> `Pipa risk` -> `Pipa escalate`
- Closeout: `Pipa close` -> `Pipa handover` -> `Pipa lessons` -> `Pipa archive`
- Recurring update: `Pipa status` -> `Pipa automate`
- Event-driven follow-up: `Pipa trigger` -> `Pipa status`

## Standalone Breakout Skills

These remain separately discoverable because they are tool-specific, safety-sensitive, or independently valuable:

| Skill | Description |
|---|---|
| [`agent-audio-brief`](skills/agent-audio-brief/) | Turns agent sessions, PRs, plans, specs, docs, URLs, and pasted markdown into a Kokoro-generated listenable brief published as a here.now listening page. |
| [`composio`](skills/composio/) | Routes external app work through Composio with setup/auth checks, search/link/execute discipline, and concise provenance. |
| [`pailflow-triggers`](skills/pailflow-triggers/) | Creates, inspects, and deletes event-triggered PailFlow automations with explicit trigger proposal confirmation. |
| [`pailflow-workflow-automation`](skills/pailflow-workflow-automation/) | Creates, inspects, and deletes recurring Slack-driven PailFlow automations with schedule, timezone, destination, prompt, and final confirmation gates. |

Pipa can route into these workflows, but their own `SKILL.md` files remain authoritative.

## Available Skills

| Skill | Description |
|---|---|
| [`pipa`](skills/pipa/) | Primary PM brain and command router for project delivery work. |
| [`agent-audio-brief`](skills/agent-audio-brief/) | Work-artifact audio briefing workflow. |
| [`composio`](skills/composio/) | Connected-tool workflow through Composio. |
| [`pailflow-triggers`](skills/pailflow-triggers/) | Event-triggered PailFlow automation workflow. |
| [`pailflow-workflow-automation`](skills/pailflow-workflow-automation/) | Recurring PailFlow automation workflow. |

## Installation

### CLI Install

```bash
# Install the full skill pack
npx skills add lunchpaillola/project-management-skills

# Install Pipa first
npx skills add lunchpaillola/project-management-skills --skill pipa

# Install a standalone breakout skill
npx skills add lunchpaillola/project-management-skills --skill agent-audio-brief

# List available skills
npx skills add lunchpaillola/project-management-skills --list

# Update installed skills
npx skills update lunchpaillola/project-management-skills
```

### Clone and Copy

```bash
git clone https://github.com/lunchpaillola/project-management-skills.git
cp -r project-management-skills/skills/* .agents/skills/
```

## Repository Shape

```text
skills/
  pipa/
    SKILL.md
    references/
    evals/
  agent-audio-brief/
  composio/
  pailflow-triggers/
  pailflow-workflow-automation/
docs/
evals/
tasks/
```

Pipa owns PM command routing and lifecycle workflow references. New PM workflows normally become Pipa commands or references, not new public top-level PM skills.

## Contributing

Found a way to improve Pipa or a breakout workflow? Open a PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for the rules on Pipa references, standalone breakout justification, eval coverage, and versioning.

## License

[MIT](LICENSE)
