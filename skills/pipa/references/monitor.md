> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Monitor Reference

You are the monitor-stage workflow entry point.

Your job is to choose the right monitor workflow, run it, and return the clearest monitor findings and next actions.

Communication style contract: this skill owns routing, research steps, required facts, and follow-up logic. `references/communication-style.md` owns the final presentation of any user-facing answer.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Pipa Monitor Progress
- [ ] Step 1 complete: monitoring objective confirmed
- [ ] Step 2 complete: available context, tools, and source coverage checked
- [ ] Step 3 complete: monitor mode selected
- [ ] Step 4 complete: selected monitor workflow loaded/executed
- [ ] Step 5 complete: monitoring summary and next actions returned
```

### Step 1: Confirm objective

Identify what the user is trying to monitor right now:

- intake quality and response flow
- current project status snapshot
- budget/burn/forecast health for an active project
- risks/blockers and follow-through
- ownership drift (items with no owner or stale updates)

If `.agents/project-context.md` exists, read it first.

### Step 2: Check context, tools, and source coverage

Before running a mode, identify what the workflow can use now:

- tracker and issue tools (for example Jira/Linear/ClickUp)
- communication tools (for example Slack/Email)
- docs/context sources (for example Notion/Confluence/files)

If project context already lists tools, use that. If not, infer from artifacts and state assumptions.

If required data is unavailable:

1. continue with available sources
2. list exact minimum missing inputs needed to proceed (for example ticket export, comment thread)
3. return `blocked` only when no usable source data exists

### Step 3: Select monitor mode

Route to one primary mode:

1. **Intake triage mode**
   - Use when user asks about incoming tickets/comments/feedback, what needs response, or backlog cleanup.
   - Load `references/monitor-ticket-triage.md`.

2. **Budget review mode**
   - Use when user asks about burn rate, budget drift, forecast to complete, project financial health, margin risk, or whether change control / escalation is needed.
   - Load `references/monitor-budget.md`.

3. **Status mode**
    - Use when user asks for status rollup, stakeholder update, or progress snapshot.
    - Load `references/monitor-status.md`.
    - Return: current status, at-risk items, decisions needed, and next milestones.

4. **Risk and follow-through mode**
   - Use when user asks what is stuck, what went quiet, or what needs escalation.
   - Load `references/monitor-risk-escalation.md`.
   - Return: blocker list, owner gaps, overdue reviews, and escalation actions.

If multiple intents are present, pick one primary mode and list secondary modes under follow-ups.

Once a primary mode is selected, preserve that mode's strongest status, decision, or blocked signal. Do not soften `blocked`, `red`, or `watch` into a more generic wrapper judgment.

Routing tie-breakers:

- If the user asks what is new, what needs attention first, what needs response, or how to sort incoming work, default to **Intake triage mode** even if tool access is broken or stale-work language is present.
- If the user asks for a project or portfolio snapshot, current status, milestones, or an exec update, default to **Status mode** and list budget or risk checks as secondary follow-ups if mentioned.
- If the user explicitly asks about budget, burn, forecast, margin, or change control, default to **Budget review mode**.
- Use **Risk and follow-through mode** only when blockers, owner gaps, silence/staleness, or escalation are the primary ask rather than a secondary concern.

### Step 4: Delegate and execute selected mode

Execution rules:

- preserve source facts and direct evidence links
- do not invent owners or deadlines
- mark unknowns as `TBD`
- produce decision-ready outputs, not narrative-only summaries
- stay inside the source boundary the user implied; do not mine unrelated local repo state or git activity as a substitute for PM/tool data unless the user explicitly asked you to inspect the repo as the monitor source
- focus first on what must be researched, reconciled, and verified before thinking about wording

If running intake triage mode, run the full `references/monitor-ticket-triage.md` workflow.

If running budget review mode, run the full `references/monitor-budget.md` workflow.

If running status mode, run the full `references/monitor-status.md` workflow.

When status mode is selected, preserve the `references/monitor-status.md` content requirements and let `references/communication-style.md` decide the final presentation shape.

If running risk and follow-through mode, run the full `references/monitor-risk-escalation.md` workflow.

If a referenced focused reference is unavailable, run the equivalent workflow inline and preserve the same content contract.

### Step 5: Return monitor findings

After running the selected workflow, hand the findings to `references/communication-style.md` for presentation.

What this skill must determine before presentation:

- monitoring objective
- selected mode
- why that mode was selected
- tools or sources actually used
- human-readable source labels paired with direct links when available
- missing tools or data gaps when relevant
- current signal: what needs attention now
- top risks, priorities, or actions
- unknowns as `TBD` when needed
- follow-ups or secondary monitor modes when useful
- closure or escalation recommendation when the user asked for monitor-to-close readiness

Do not force a wrapper report shape here. The communication layer should decide how much structure the user sees.

If the routed result already answers the question directly, do not add a second summary layer on top of it.

## Rules

- Keep outputs concise and operational.
- Never close items implicitly; always state next state.
- If blocked by missing input, return the minimum required inputs to continue.
- If tool context is incomplete, surface the gap explicitly before recommendations.
- If tool access is broken but the user still wants a monitor pass, keep the originally selected mode when the request makes it clear, continue with request-text context only, and ask for the minimum substitute source needed.
- Keep unknowns explicit as `TBD`.
- If monitor-to-close readiness is requested and gate evidence is incomplete, set closure recommendation to `blocked` and list only minimum must-fix items.
- Prefer returning the strongest routed result over adding a second, heavier summary layer on top of it.
- If a downstream skill yields a direct next action, keep it near the top instead of replacing it with router commentary.
