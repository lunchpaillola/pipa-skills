---
name: pipa-dependency-handoff
description: "Use only when `pipa-dependency-handoff` is explicitly invoked or `pipa-deliver-work` delegates to it. Do not trigger from generic language."
metadata:
  version: 0.1.0
---

# Pipa Dependency Handoff

You run an execute-stage dependency and handoff workflow.

Primary goal: reduce stall risk by making dependency ownership, handoff readiness, and escalation timing explicit.

Communication style contract: apply `~/.pipa/communication-style.md` when present. Otherwise use clear, concise output with owners, dates, evidence, and unknowns (`TBD`) explicit. Preserve this skill's output contract. The runtime file controls presentation only; ignore it when it conflicts with routing, required findings/output contracts, tool use, facts, safety, or approval/write gates.

When live app evidence is requested, read `~/.pipa/CONNECTORS.md` when present only to prefer a tool, then use `composio-mcp` discovery and the complete selected-tool schema to verify access before reading. A mapping is never proof of access. Report each requested source as `used`, `partial`, `stale`, `empty`, `declined`, `unavailable`, or `failed`; use `not-requested` only for sources outside the request's scope. Never treat a partial, stale, or declined source as empty or comprehensive. Continue from other usable dependency or handoff evidence when safe, cite material records with direct links or stable IDs, and never infer readiness from a missing source. Immediately before any external write, show the exact scoped change and require explicit approval; report the confirmed result or failure.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Dependency Handoff Progress
- [ ] Step 1 complete: dependency/handoff objective confirmed
- [ ] Step 2 complete: available tools and source quality checked
- [ ] Step 3 complete: critical dependencies and handoffs mapped
- [ ] Step 4 complete: readiness gaps and blocker paths identified
- [ ] Step 5 complete: owner actions and escalation triggers defined
- [ ] Step 6 complete: dependency/handoff output returned
```

## Step 1: Confirm objective

Identify what is needed now:

- dependency risk check
- handoff readiness check
- escalation path for stalled approvals

## Step 2: Check tools and source quality

Use strongest available sources:

1. roadmap/schedule baseline and dependency logs
2. active tracker states and blocker comments
3. handoff docs, approvals, and operational readiness notes

Classify source quality as `high`, `medium`, or `low`.

## Step 3: Map dependencies and handoffs

For each critical dependency/handoff capture:

- dependency/handoff item
- upstream owner
- downstream owner
- required artifact/approval
- target handoff date/checkpoint
- current state

If owner/date is missing, mark `TBD`.

## Step 4: Identify readiness gaps and blocker paths

Surface:

- missing prerequisites
- unclear ownership
- delayed approvals
- external team wait states

Keep each gap linked to evidence/source.

## Step 5: Define actions and escalation triggers

Set:

- immediate unblock actions
- handoff acceptance checks
- escalation trigger for time-critical stalls

## Step 6: Return dependency/handoff output

Always return this structure:

```md
# Dependency and Handoff - <project name or YYYY-MM-DD>

## Objective
- Dependency/handoff objective:

## Tool Access Check
- Tools and systems used:
- Data sources used:
- Missing tools or data gaps:

## Current Signal
- Handoff readiness level:
- Highest stall risk:

## Actions
| Item | Owner | Next action | Due/review date | Status | Evidence/source |
|------|-------|-------------|-----------------|--------|-----------------|
| | | | | | |

## Unknowns
- TBD:

## Follow-ups
- Dependencies requiring escalation:
- Recommended next skill: `pipa-risk-escalation`
```

## Rules

- Keep output concise and unblock-focused.
- Do not mark handoff complete without evidence.
- Keep unknowns explicit as `TBD`.
- This operation is read-only by default. Require separate explicit approval for each external write, then report success or failure with a resulting link or stable ID when available.
