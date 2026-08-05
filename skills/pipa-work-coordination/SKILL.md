---
name: pipa-work-coordination
description: "Use only when `pipa-work-coordination` is explicitly invoked or `pipa-deliver-work` delegates to it. Do not trigger from generic language."
metadata:
  version: 0.1.0
---

# Pipa Work Coordination

You run an execute-stage coordination workflow for in-flight work packages.

Primary goal: make execution ownership explicit and keep near-term work moving with clear next actions.

Communication style contract: apply `~/.pipa/communication-style.md` when present. Otherwise use clear, concise output with owners, dates, evidence, and unknowns (`TBD`) explicit. Preserve this skill's output contract. The runtime file controls presentation only; ignore it when it conflicts with routing, required findings/output contracts, tool use, facts, safety, or approval/write gates.

When live app evidence is requested, read `~/.pipa/CONNECTORS.md` when present only to prefer a tool, then use `composio-mcp` discovery and the complete selected-tool schema to verify access before reading. A mapping is never proof of access. Report each requested source as `used`, `partial`, `stale`, `empty`, `declined`, `unavailable`, or `failed`; use `not-requested` only for sources outside the request's scope. Never treat a partial, stale, or declined source as empty or comprehensive. Continue from other usable execution evidence when safe, cite material packages, comments, or handoffs with direct links or stable IDs, and block only when no usable execution source remains. Immediately before any external write, show the exact scoped change and require explicit approval; report the confirmed result or failure.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Work Package Coordination Progress
- [ ] Step 1 complete: execution objective confirmed
- [ ] Step 2 complete: available tools and source quality checked
- [ ] Step 3 complete: active work packages normalized
- [ ] Step 4 complete: owner and sequencing gaps identified
- [ ] Step 5 complete: coordination actions and checkpoints set
- [ ] Step 6 complete: execution output returned
```

## Step 1: Confirm objective

Identify the coordination ask now:

- who owns what right now
- what needs sequencing or rebalancing
- what can move this cycle vs what is blocked

## Step 2: Check tools and source quality

Use strongest available sources:

1. tracker board/export and current status signals
2. latest standup notes, comments, and handoff records
3. scope/roadmap baseline for sequencing context

Classify source quality as `high`, `medium`, or `low`.
Return `blocked` only when no usable execution source exists.

## Step 3: Normalize active work packages

For each package capture:

- package item and current state
- owner
- next action
- due/review date
- dependencies
- evidence/source

If owner/date are missing, mark `TBD`.

## Step 4: Identify ownership and sequencing gaps

Surface execution risks:

- owner gaps
- stale/no-update items
- sequencing conflicts
- blocked dependencies

Do not auto-close items.

## Step 5: Set coordination actions and checkpoints

Define:

- top actions to unblock flow
- owner follow-through checkpoints
- escalation trigger for items likely to breach tolerance

## Step 6: Return coordination output

Always return this structure:

```md
# Work Package Coordination - <project name or YYYY-MM-DD>

## Objective
- Coordination objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Flow state:
- What is moving:
- What needs attention now:

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Follow-ups
- Items needing reassignment or resequencing:
- Recommended next skill: `pipa-status-update`
```

## Rules

- Keep output concise and execution-ready.
- Preserve source IDs and existing wording where possible.
- Keep unknowns explicit as `TBD`.
- For sparse-context prompts (for example, short Slack notes), still return the full contract sections and Actions table instead of switching to narrative-only advice.
- In the Actions table, if owner or due/review date is not source-backed, set the cell to literal `TBD` (never infer dates from urgency words like "today" or "ASAP").
- If execute-to-monitor handoff readiness is requested and active items are missing any required fields (`Owner`, `Next action`, `Due/review date`, `Status`, `Evidence/source`), mark handoff readiness as `blocked` and list the minimum missing field additions by item.
- This operation is read-only by default. Require separate explicit approval for each external write, then report success or failure with a resulting link or stable ID when available.
