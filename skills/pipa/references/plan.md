> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Plan Reference

You are the plan-stage workflow entry point.

Your job is to choose the right planning workflow, run it, and return an execution-ready baseline with clear handoff to execute.

Communication style contract: when returning user-facing updates, briefs, or summaries, apply `references/communication-style.md`.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Pipa Plan Progress
- [ ] Step 1 complete: planning objective confirmed
- [ ] Step 2 complete: available context, tools, and source coverage checked
- [ ] Step 3 complete: plan mode selected
- [ ] Step 4 complete: selected planning workflow loaded/executed
- [ ] Step 5 complete: plan summary and handoff returned
```

### Step 1: Confirm objective

Identify what planning outcome the user needs now:

- requirements brief and acceptance framing
- scope/schedule baseline with explicit assumptions
- roadmap and prioritization decisions
- RAID/RACI/decision-log controls for governance

If `.agents/project-context.md` exists, read it first.

### Step 2: Check context, tools, and source coverage

Identify available planning sources now:

- initiate outputs and project charter artifacts
- requirements notes, scope docs, estimates, roadmap drafts
- tracker, docs, and comms systems (for example Jira/Linear/Notion/Drive)

If required data is incomplete:

1. continue with available sources
2. list exact minimum missing inputs required for a reliable baseline
3. return `blocked` only when no usable planning source exists

### Step 3: Select plan mode

Route to one primary mode:

1. **Requirements brief mode**
   - Use when the user asks for requirements clarity, acceptance boundaries, or delivery intent.
   - Load `references/plan-requirements-brief.md`.

2. **Scope and schedule baseline mode**
   - Use when the user asks to baseline what will be delivered, by when, and with what constraints.
   - Load `references/plan-scope-schedule-baseline.md`.

3. **Roadmap and prioritization mode**
   - Use when sequencing, phasing, or tradeoff decisions are the main ask.
   - Load `references/plan-roadmap-and-prioritization.md`.

4. **RAID/RACI/decision setup mode**
   - Use when governance, ownership clarity, risk logging, and decision traceability are the main ask.
   - Load `references/plan-raid-raci-decision-setup.md`.

If multiple intents are present, pick one primary mode and list secondary modes under follow-ups.

Routing tie-breakers:

- If the ask is broad planning with unclear artifacts, default to **Requirements brief mode** first.
- If timing/commitments are central, default to **Scope and schedule baseline mode**.
- If teams ask "what first/what later," default to **Roadmap and prioritization mode**.
- If ownership or control mechanics are unclear, default to **RAID/RACI/decision setup mode**.

### Step 4: Delegate and execute selected mode

Execution rules:

- preserve source facts and IDs
- do not invent commitments, owners, or deadlines
- mark unknowns as `TBD`
- load the selected Pipa reference when a focused reference matches
- if a referenced focused reference is unavailable, run the equivalent workflow inline and preserve the same output contract

### Step 5: Return plan summary

Always return this structure:

```md
# Plan Summary - <YYYY-MM-DD>

## Objective
- Planning objective:

## Selected Mode
- Mode:
- Why selected:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- What is baseline-ready now:
- What remains fragile or unclear:

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Lane Handoff Gate
- `plan -> execute` readiness:
- Requirements brief available:
- Scope/schedule baseline available:
- Roadmap/prioritization available:
- RAID/RACI/decision setup available:
- Missing gate requirement (if any):

## Follow-ups
- Secondary planning modes worth running next:
- Escalation trigger (if baseline/tolerance is at risk):
```

## Rules

- Keep outputs concise and decision-ready.
- Return `blocked` only when no usable planning source exists.
- Keep unknowns explicit as `TBD`.
- If planning gate is incomplete, return the minimum required inputs to continue.
- If the user asks for plan-to-execute handoff readiness and any required gate artifact is missing, set `plan -> execute` readiness to `blocked` and list only the minimum inputs to unblock.
