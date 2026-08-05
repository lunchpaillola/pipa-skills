---
name: pipa-iteration-cycle
description: "Use only when `pipa-iteration-cycle` is explicitly invoked or `pipa-deliver-work` delegates to it. Do not trigger from generic language."
metadata:
  version: 0.1.0
---

# Pipa Iteration Cycle

You run an execute-stage iteration-cycle workflow.

Primary goal: keep cycle commitments realistic, visible, and decision-ready from start through close.

Communication style contract: apply `~/.pipa/communication-style.md` when present. Otherwise use clear, concise output with owners, dates, evidence, and unknowns (`TBD`) explicit. Preserve this skill's output contract. The runtime file controls presentation only; ignore it when it conflicts with routing, required findings/output contracts, tool use, facts, safety, or approval/write gates.

When live app evidence is requested, read `~/.pipa/CONNECTORS.md` when present only to prefer a tool, then use `composio-mcp` discovery and the complete selected-tool schema to verify access before reading. A mapping is never proof of access. Report each requested source as `used`, `partial`, `stale`, `empty`, `declined`, `unavailable`, or `failed`; use `not-requested` only for sources outside the request's scope. Never treat a partial, stale, or declined source as empty or comprehensive. Continue from other usable cycle evidence when safe, cite material board items, status notes, or blocker updates with direct links or stable IDs, and do not infer completion from missing data. Immediately before any external write, show the exact scoped change and require explicit approval; report the confirmed result or failure.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Iteration Cycle Progress
- [ ] Step 1 complete: cycle objective confirmed
- [ ] Step 2 complete: available tools and source quality checked
- [ ] Step 3 complete: cycle commitments and WIP state normalized
- [ ] Step 4 complete: in-cycle risks and carryover signals assessed
- [ ] Step 5 complete: cycle actions and review checkpoints set
- [ ] Step 6 complete: iteration output returned
```

## Step 1: Confirm cycle objective

Confirm whether user needs:

- cycle planning and commitment check
- in-cycle execution control
- cycle close and carryover decision prep

## Step 2: Check tools and source quality

Use strongest available sources:

1. sprint/cycle board and backlog state
2. recent standup/status notes
3. dependency and blocker updates

Classify source quality as `high`, `medium`, or `low`.

## Step 3: Normalize commitments and WIP state

Capture:

- committed items
- in-progress items
- completed items
- items at risk of carryover

Preserve IDs and states from source systems.

## Step 4: Assess risks and carryover pressure

Evaluate:

- blocker concentration
- dependency stalls
- capacity/throughput mismatch
- change-intake pressure inside the cycle

Mark unknown owner/date as `TBD`.

## Step 5: Set actions and review checkpoints

Define:

- immediate recovery actions
- owner-by-owner follow-through
- checkpoint cadence for the remainder of the cycle

## Step 6: Return iteration output

Always return this structure:

```md
# Iteration Cycle - <project name or YYYY-MM-DD>

## Objective
- Cycle objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Cycle health: `on-track` | `watch` | `at-risk` | `blocked`
- What is on track:
- What is at risk:

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Follow-ups
- Likely carryover decisions:
- Recommended next skill: `pipa-ticket-triage`
```

## Rules

- Keep cycle output practical and concise.
- Do not imply completed work without source evidence.
- Keep unknowns explicit as `TBD`.
- This operation is read-only by default. Require separate explicit approval for each external write, then report success or failure with a resulting link or stable ID when available.
