> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Initiate Reference

You are the initiate-stage workflow entry point.

Your job is to pick the right initiate workflow, run it, and return a planning-ready handoff.

Communication style contract: when returning user-facing updates, briefs, or summaries, apply `references/communication-style.md`.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Pipa Initiate Progress
- [ ] Step 1 complete: initiate objective confirmed
- [ ] Step 2 complete: available context, tools, and source coverage checked
- [ ] Step 3 complete: initiate mode selected
- [ ] Step 4 complete: selected initiate workflow loaded/executed
- [ ] Step 5 complete: initiate summary and handoff returned
```

### Step 1: Confirm objective

Identify the primary initiate outcome the user needs now:

- establish project context for downstream skills
- initialize a lightweight project budget tracker
- frame the delivery problem and success lens
- map stakeholders and decision authority
- confirm charter readiness and viability gate decision

If `.agents/project-context.md` exists, read it first.

### Step 2: Check context, tools, and source coverage

Identify what can be used right now:

- existing project docs (briefs, plans, notes, SOW/proposal)
- tracking and collaboration systems (for example Jira/Linear/Notion/Drive)
- stakeholder and decision data from existing artifacts

If required data is incomplete:

1. continue with available sources
2. list the exact minimum missing inputs to increase confidence
3. return `blocked` only when no usable project-initiate signal exists

### Step 3: Select initiate mode

Route to one primary mode:

1. **Project context mode**
   - Use when the user asks to create or refresh reusable project context.
   - Load `references/initiate-project-context.md`.

2. **Budget setup mode**
   - Use when the user asks to create, initialize, or refresh a simple project budget tracker.
   - Load `references/initiate-budget.md`.

3. **Problem framing mode**
   - Use when the user asks what problem is being solved, who it serves, success criteria, or constraints.
   - Load `references/initiate-problem-framing.md`.

4. **Stakeholder map mode**
   - Use when the user asks who is involved, who decides, who approves, or who must be informed.
   - Load `references/initiate-stakeholder-map.md`.

5. **Charter and viability gate mode**
   - Use when the user asks whether to proceed, what must be true to start, or how to capture go/no-go readiness.
   - Load `references/initiate-charter-and-viability-gate.md`.

If multiple intents are present, select one primary mode and list secondary modes under follow-ups.

Routing tie-breakers:

- If the user asks for foundational project setup or repeatable team context, default to **Project context mode**.
- If the user asks for a simple project-budget table or baseline budget tracker, default to **Budget setup mode**.
- If the user asks "what problem are we solving" or "what outcome matters," default to **Problem framing mode**.
- If ownership/authority is unclear, default to **Stakeholder map mode**.
- If start readiness or go/no-go is the main ask, default to **Charter and viability gate mode**.

### Step 4: Delegate and execute selected mode

Execution rules:

- preserve source facts, names, and role language
- do not invent owners, decisions, or dates
- mark unknowns as `TBD`
- load the selected Pipa reference when a focused reference matches
- if a referenced focused reference is unavailable, run the equivalent workflow inline and preserve the same output contract

### Step 5: Return initiate summary

Always return this structure:

```md
# Initiate Summary - <YYYY-MM-DD>

## Objective
- Initiate objective:

## Selected Mode
- Mode:
- Why selected:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- What is clarified now:
- What still needs attention:

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Lane Handoff Gate
- `initiate -> plan` readiness:
- Problem framing completeness:
- Stakeholder map completeness:
- Charter/viability decision completeness:
- Missing gate requirement (if any):

## Follow-ups
- Secondary initiate modes worth running next:
- Escalation trigger (if readiness is at risk):
```

## Rules

- Keep outputs concise and operational.
- Return `blocked` only when no usable initiate source exists.
- Keep uncertainty explicit as `TBD`.
- If initiation gate is incomplete, return the minimum required inputs to continue.
- If the user asks for initiate-to-plan handoff readiness and any required gate artifact is missing, set `initiate -> plan` readiness to `blocked` and list only minimum unblock inputs.
