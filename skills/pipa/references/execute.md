> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Execute Reference

You are the execute-stage workflow entry point.

Your job is to route active delivery work to the right execution workflow, run it, and return monitor-ready follow-through.

Communication style contract: when returning user-facing updates, briefs, or summaries, apply `references/communication-style.md`.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Pipa Execute Progress
- [ ] Step 1 complete: execution objective confirmed
- [ ] Step 2 complete: available context, tools, and source coverage checked
- [ ] Step 3 complete: execute mode selected
- [ ] Step 4 complete: selected execution workflow loaded/executed
- [ ] Step 5 complete: execute summary and handoff returned
```

### Step 1: Confirm objective

Identify what execution outcome is needed now:

- coordinate current work packages and owner follow-through
- run iteration or sprint cycle operations
- assess and route change-control decisions
- manage dependency and cross-team handoff risk

If `.agents/project-context.md` exists, read it first.

### Step 2: Check context, tools, and source coverage

Identify available execution sources now:

- planning baseline artifacts and acceptance boundaries
- active tracker records, sprint boards, milestones, and dependency logs
- implementation notes, standup outputs, and decision history

If required data is incomplete:

1. continue with available sources
2. list exact minimum missing inputs required for reliable execution control
3. return `blocked` only when no usable execution source exists

### Step 3: Select execute mode

Route to one primary mode:

1. **Work package coordination mode**
   - Use when user asks about who is doing what now, ownership drift, sequencing, or operational coordination.
   - Load `references/execute-work-package-coordination.md`.

2. **Iteration cycle mode**
   - Use when user asks for sprint/cycle planning, in-cycle control, or cycle review actions.
   - Load `references/execute-iteration-cycle.md`.

3. **Change control mode**
   - Use when user asks about scope change, approval flow, impact analysis, or formal change decisions.
   - Load `references/execute-change-control.md`.

4. **Dependency and handoff mode**
   - Use when cross-team dependencies, approvals, or handoff sequencing are primary.
   - Load `references/execute-dependency-and-handoff.md`.

If multiple intents are present, choose one primary mode and list secondary modes under follow-ups.

Routing tie-breakers:

- If owner execution drift is the main pain, default to **Work package coordination mode**.
- If cadence language (sprint/cycle) dominates, default to **Iteration cycle mode**.
- If change approval impact is explicit, default to **Change control mode**.
- If external teams/approvals are gating work, default to **Dependency and handoff mode**.

### Step 4: Delegate and execute selected mode

Execution rules:

- preserve source facts and item IDs
- do not invent owners, due dates, or completed state
- mark unknowns as `TBD`
- load the selected Pipa reference when a focused reference matches
- if a referenced focused reference is unavailable, run the equivalent workflow inline and preserve the same output contract

### Step 5: Return execute summary

Always return this structure:

```md
# Execute Summary - <YYYY-MM-DD>

## Objective
- Execution objective:

## Selected Mode
- Mode:
- Why selected:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- What is moving now:
- What is blocked or drifting:

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Lane Handoff Gate
- `execute -> monitor` readiness:
- Required active-item fields present (`Owner`, `Next action`, `Due/review date`, `Status`, `Evidence/source`):
- Missing gate requirement (if any):

## Follow-ups
- Secondary execute modes worth running next:
- Escalation trigger (if tolerance breach is likely):
```

## Rules

- Keep outputs concise and operational.
- Return `blocked` only when no usable execution source exists.
- Keep unknowns visible as `TBD`.
- If execution gate is incomplete, return the minimum required inputs to continue.
- If execute-to-monitor readiness is requested and required active-item fields are missing, set `execute -> monitor` readiness to `blocked` and list the minimum missing field additions by item.
