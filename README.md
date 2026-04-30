# Project Management Skills for AI Agents

A collection of reusable AI agent skills for project delivery work: project context setup, scoping, status communication, delivery execution, and project hygiene.

This repository is designed for AI coding agents and assistant workflows that support project delivery, implementation, and operational execution. It is intended to work with tools that support the [Agent Skills spec](https://agentskills.io), including OpenCode, Claude Code, and compatible agent environments.

Built by [Lola](https://www.linkedin.com/in/lolaojabowale) at [Lunch Pail Labs](https://lunchpaillabs.com).

Want a managed setup for these workflows in real client delivery environments? See [PailFlow](https://pailflow.com).

Contributions are welcome. 

## What are skills?

Skills are directory-based instruction packs that help AI agents recognize and execute specialized workflows. Each skill lives in its own folder and includes a `SKILL.md` file with instructions, usage triggers, and optional references, scripts, or assets.

## State of the repository

- Current maturity: baseline complete, with full 30-skill workflow coverage
- Core pattern: use lane routers to choose focused sub-workflows and return decision-ready handoffs
- Published skills today: `composio`, `pailflow-triggers`, `pailflow-workflow-automation`, `pm-communication-style`, `pm-initiate`, `pm-initiate-project-context`, `pm-initiate-budget`, `pm-initiate-problem-framing`, `pm-initiate-stakeholder-map`, `pm-initiate-charter-and-viability-gate`, `pm-plan`, `pm-plan-requirements-brief`, `pm-plan-scope-schedule-baseline`, `pm-plan-roadmap-and-prioritization`, `pm-plan-raid-raci-decision-setup`, `pm-execute`, `pm-execute-work-package-coordination`, `pm-execute-iteration-cycle`, `pm-execute-change-control`, `pm-execute-dependency-and-handoff`, `pm-monitor`, `pm-monitor-ticket-triage`, `pm-monitor-status`, `pm-monitor-budget`, `pm-monitor-risk-escalation`, `pm-close`, `pm-close-acceptance-signoff`, `pm-close-handover-transition`, `pm-close-lessons-learned`, `pm-close-benefits-review-and-archive`
- Strongest current lane: balanced baseline coverage across all lanes
- Planned growth path: quality refinement, eval coverage, and iterative hardening

## Repository focus

This repo is meant to cover project-management-adjacent work such as:

- ticket triage
- scoping and estimation
- project status updates
- retrospectives
- stakeholder communication
- delivery planning
- handoffs and launch readiness
- project hygiene and follow-through

Over time, these skills should map to the kinds of real operational work project managers, delivery managers, implementation teams, and professional services teams do every week.

## Project lifecycle lanes

To keep the collection easy to navigate, skills are organized by standard project lifecycle lanes:

- `initiate` - define intent, clarify problem statements, and establish delivery readiness
- `plan` - shape requirements, scope work, and prepare implementation artifacts
- `execute` - run work through agreed stages and handoffs
- `monitor` - track status, risks, blockers, and control points
- `close` - complete handoff, capture learnings, and formalize closure

### Naming convention for new skills

For new skills, prefer:

`pm-<phase>-<noun-or-object>`

Examples:

- `pm-initiate-project-context`
- `pm-plan-scope-outline`
- `pm-execute-stage-gate-workflow`
- `pm-monitor-status-risks`
- `pm-close-lessons-learned`

Published skill names should remain stable once released. Existing skills can be mapped to lanes in docs without renaming.

## Planned structure

```text
skills/
  skill-name/
    SKILL.md
    references/
    scripts/
    assets/
docs/
examples/
```

## How skills work together

This repository follows a context-first model similar to the best multi-skill collections.

- `pm-initiate-project-context` is the foundation skill
- Other PM skills should read `.agents/project-context.md` first
- This keeps delivery context consistent across handoffs, updates, and execution tasks

As new skills are added, they should reference project context before generating plans, updates, or action items.

## Available skills

| Skill | Description |
|-------|-------------|
| [composio](skills/composio/) | Handles connected-tool workflows through Composio by choosing the right external system, checking connection state, using the smallest reliable tool path, and returning concise provenance with the specific records that support the answer. |
| [pailflow-triggers](skills/pailflow-triggers/) | Handles event-triggered automation creation, inspection, and deletion for PailFlow by gathering source app/resource/event details, confirming the final execution prompt, and using the gateway trigger subscription API safely. |
| [pailflow-workflow-automation](skills/pailflow-workflow-automation/) | Handles Slack-driven recurring automation creation, inspection, and deletion for PailFlow by gathering missing schedule/timezone/destination details, confirming the final execution prompt, and using the gateway automation API safely. |
| [pm-communication-style](skills/pm-communication-style/) | Shared communication-style contract for PM-facing updates and reports: BLUF first, outcome-oriented movement, bold dated asks near the top, decision-ready risks, and concise sources for drill-down. |
| [pm-initiate-project-context](skills/pm-initiate-project-context/) | Creates or updates `.agents/project-context.md` so agents can reuse stakeholder context, delivery expectations, tools/access, risks, and source-of-truth links across project work. |
| [pm-initiate-budget](skills/pm-initiate-budget/) | Creates or updates a lightweight `.agents/project-budget.md` tracker with one row per project and simple budget-monitoring columns (baseline, spend, forecast, variance, status, owner, and notes). |
| [pm-initiate](skills/pm-initiate/) | Initiate-stage router that selects the right setup mode (context, lightweight budget setup, problem framing, stakeholder mapping, or charter/viability gate) and returns a plan-ready handoff. |
| [pm-initiate-problem-framing](skills/pm-initiate-problem-framing/) | Initiate-stage subskill for defining the core problem, affected stakeholders, success criteria, boundaries, and assumptions before planning. |
| [pm-initiate-stakeholder-map](skills/pm-initiate-stakeholder-map/) | Initiate-stage subskill for mapping stakeholders, decision authority, RACI signals, and escalation paths. |
| [pm-initiate-charter-and-viability-gate](skills/pm-initiate-charter-and-viability-gate/) | Initiate-stage subskill for charter readiness and go/go-with-conditions/no-go viability decisions with explicit gaps. |
| [pm-plan](skills/pm-plan/) | Plan-stage router that selects planning mode (requirements, baseline, roadmap, or RAID/RACI/decision controls) and returns an execution-ready summary. |
| [pm-plan-requirements-brief](skills/pm-plan-requirements-brief/) | Plan-stage subskill for producing a concise requirements brief with acceptance boundaries, priorities, and open decisions. |
| [pm-plan-scope-schedule-baseline](skills/pm-plan-scope-schedule-baseline/) | Plan-stage subskill for defining scope boundaries, milestones, assumptions, and tolerance/change triggers. |
| [pm-plan-roadmap-and-prioritization](skills/pm-plan-roadmap-and-prioritization/) | Plan-stage subskill for now/next/later sequencing and transparent prioritization tradeoffs. |
| [pm-plan-raid-raci-decision-setup](skills/pm-plan-raid-raci-decision-setup/) | Plan-stage subskill for setting up RAID, RACI, and decision-log controls before execution. |
| [pm-execute](skills/pm-execute/) | Execute-stage router that selects delivery operations mode (work coordination, iteration cycle, change control, or dependency/handoff) and returns monitor-ready follow-through. |
| [pm-execute-work-package-coordination](skills/pm-execute-work-package-coordination/) | Execute-stage subskill for coordinating active work packages, owner follow-through, and sequencing clarity. |
| [pm-execute-iteration-cycle](skills/pm-execute-iteration-cycle/) | Execute-stage subskill for sprint/cycle operations, in-cycle risk control, and carryover readiness. |
| [pm-execute-change-control](skills/pm-execute-change-control/) | Execute-stage subskill for assessing mid-delivery change requests and routing approval/escalation decisions. |
| [pm-execute-dependency-and-handoff](skills/pm-execute-dependency-and-handoff/) | Execute-stage subskill for dependency tracking, handoff readiness, and escalation of cross-team blockers. |
| [pm-monitor](skills/pm-monitor/) | Monitor-stage workflow entry point that routes requests into intake triage, status update, budget review, or risk/follow-through mode and returns an execution-ready summary with follow-ups. |
| [pm-monitor-budget](skills/pm-monitor-budget/) | Outcome-first budget health check: answers "Are we on budget?" with yes/no, EAC/variance, confidence level, and one decision + accountable next step (owner + due date). Supports CEO brief (2-3 lines), PM brief (4-6 lines), and Finance brief (margin-focused) modes. Includes scenario mode for "what-if" analysis. |
| [pm-monitor-status](skills/pm-monitor-status/) | Runs a monitor-stage status-rollup workflow for active delivery work by synthesizing current state, recent changes, blockers, decisions needed, owner follow-through, and near-term milestones into a concise standup-ready or leadership-ready update with explicit RAG/RAID structure. |
| [pm-monitor-ticket-triage](skills/pm-monitor-ticket-triage/) | Runs intake triage + response operations for tickets/comments/feedback with classification, priority/severity, response drafts, task routing, owner gaps, and closure signals. |
| [pm-monitor-risk-escalation](skills/pm-monitor-risk-escalation/) | Monitor-stage subskill for tolerance-aware risk and blocker escalation with explicit decision paths, owners, and review checkpoints. |
| [pm-close](skills/pm-close/) | Close-stage router that selects closure mode (acceptance/signoff, handover transition, lessons learned, or benefits/archive review) and returns closure-ready next actions. |
| [pm-close-acceptance-signoff](skills/pm-close-acceptance-signoff/) | Close-stage subskill for acceptance criteria review and formal signoff decisions with clear conditional-close actions when needed. |
| [pm-close-handover-transition](skills/pm-close-handover-transition/) | Close-stage subskill for ownership transfer readiness, handover artifacts, and continuity safeguards. |
| [pm-close-lessons-learned](skills/pm-close-lessons-learned/) | Close-stage subskill for evidence-backed lessons and implementation actions for future delivery cycles. |
| [pm-close-benefits-review-and-archive](skills/pm-close-benefits-review-and-archive/) | Close-stage subskill for expected-vs-observed benefit review and complete closure archive packaging. |

## Installation

### Option 1: CLI Install (Recommended)

Use `npx skills`:

```bash
# Install all skills
npx skills add lunchpaillola/project-management-skills

# Install a specific skill
npx skills add lunchpaillola/project-management-skills --skill pm-initiate-project-context

# List available skills
npx skills add lunchpaillola/project-management-skills --list

# Update all installed skills to the latest version
npx skills update

# Update all skills from this repository
npx skills update lunchpaillola/project-management-skills

# Update a specific skill
npx skills update lunchpaillola/project-management-skills --skill pm-initiate-project-context
```

### Option 2: Clone and Copy

```bash
git clone https://github.com/lunchpaillola/project-management-skills.git
cp -r project-management-skills/skills/* .agents/skills/
```

### Option 3: Fork and Customize

1. Fork this repository
2. Customize skills for your delivery context
3. Keep names stable once published

## Current skills

- `composio`
- `pailflow-triggers`
- `pailflow-workflow-automation`
- `pm-communication-style`
- `pm-initiate-project-context`
- `pm-initiate-budget`
- `pm-initiate`
- `pm-initiate-problem-framing`
- `pm-initiate-stakeholder-map`
- `pm-initiate-charter-and-viability-gate`
- `pm-plan`
- `pm-plan-requirements-brief`
- `pm-plan-scope-schedule-baseline`
- `pm-plan-roadmap-and-prioritization`
- `pm-plan-raid-raci-decision-setup`
- `pm-execute`
- `pm-execute-work-package-coordination`
- `pm-execute-iteration-cycle`
- `pm-execute-change-control`
- `pm-execute-dependency-and-handoff`
- `pm-monitor`
- `pm-monitor-budget`
- `pm-monitor-status`
- `pm-monitor-ticket-triage`
- `pm-monitor-risk-escalation`
- `pm-close`
- `pm-close-acceptance-signoff`
- `pm-close-handover-transition`
- `pm-close-lessons-learned`
- `pm-close-benefits-review-and-archive`

### Current skills by lane

- `tooling`: `composio`
- `pailflow`: `pailflow-triggers`, `pailflow-workflow-automation`
- `shared`: `pm-communication-style`
- `initiate`: `pm-initiate`, `pm-initiate-project-context`, `pm-initiate-budget`, `pm-initiate-problem-framing`, `pm-initiate-stakeholder-map`, `pm-initiate-charter-and-viability-gate`
- `plan`: `pm-plan`, `pm-plan-requirements-brief`, `pm-plan-scope-schedule-baseline`, `pm-plan-roadmap-and-prioritization`, `pm-plan-raid-raci-decision-setup`
- `execute`: `pm-execute`, `pm-execute-work-package-coordination`, `pm-execute-iteration-cycle`, `pm-execute-change-control`, `pm-execute-dependency-and-handoff`
- `monitor`: `pm-monitor`, `pm-monitor-ticket-triage`, `pm-monitor-status`, `pm-monitor-budget`, `pm-monitor-risk-escalation`
- `close`: `pm-close`, `pm-close-acceptance-signoff`, `pm-close-handover-transition`, `pm-close-lessons-learned`, `pm-close-benefits-review-and-archive`

## Contributing

Found a way to improve a skill or have a new one to propose? Open a PR.

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on adding or updating skills.

## License

[MIT](LICENSE)
