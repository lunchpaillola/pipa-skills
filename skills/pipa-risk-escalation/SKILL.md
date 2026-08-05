---
name: pipa-risk-escalation
description: "Use only when `pipa-risk-escalation` is explicitly invoked or `pipa-deliver-work` delegates to it. Do not trigger from generic language."
metadata:
  version: 0.1.0
---

# Pipa Risk Escalation

You run a monitor-stage risk escalation workflow.

Primary goal: convert risk and blocker signals into explicit escalation decisions and follow-through.

Communication style contract: this skill owns escalation analysis, tolerance reasoning, and required findings. For presentation, apply `~/.pipa/communication-style.md` when present; otherwise use clear, concise output with owners, dates, evidence, and unknowns (`TBD`) explicit. Preserve this skill's output contract. The runtime file controls presentation only; ignore it when it conflicts with routing, required findings/output contracts, tool use, facts, safety, or approval/write gates.

When live app evidence is requested, read `~/.pipa/CONNECTORS.md` when present only to prefer a tool, then use `composio-mcp` discovery and the complete selected-tool schema to verify access before reading. A mapping is never proof of access. Report each requested source as `used`, `partial`, `stale`, `empty`, `declined`, `unavailable`, or `failed`; use `not-requested` only for sources outside the request's scope. Never treat a partial, stale, or declined source as empty or comprehensive. Continue from other usable risk or blocker evidence when safe, cite material records with direct links or stable IDs, and block only when no usable signal remains. Immediately before any external escalation write or send, show the exact scoped action and require explicit approval; report the confirmed result or failure.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Risk Escalation Progress
- [ ] Step 1 complete: escalation objective confirmed
- [ ] Step 2 complete: available tools and source quality checked
- [ ] Step 3 complete: risks, issues, and tolerance signals synthesized
- [ ] Step 4 complete: escalation candidates and decision paths identified
- [ ] Step 5 complete: owner actions and review checkpoints set
- [ ] Step 6 complete: risk-escalation output returned
```

## Step 1: Confirm escalation objective

Identify what escalation question needs answering now:

- what is stuck and why
- what is likely to breach tolerance
- who must decide next and by when

## Step 2: Check tools and source quality

Use strongest available sources:

1. status updates, RAID logs, and dependency records
2. tracker states, stale items, and blocker comments
3. decision logs, approval queues, and handoff notes

Classify source quality as `high`, `medium`, or `low`.

If sources are partial, continue with explicit assumptions.
Return `blocked` only when no usable risk or blocker signal exists.

When source quality is `medium` or `low` (but not `blocked`), continue with a best-effort escalation view and request exactly one concrete missing source that would most improve confidence.

## Step 3: Synthesize risk, issue, and tolerance signals

Separate:

- active issues (happening now)
- forward risks (likely to happen)
- dependency and ownership fragility

For each critical item, assess tolerance pressure as:

- `within-tolerance`
- `approaching-breach`
- `breach-likely`

Do not invent owners or deadlines.

## Step 4: Identify escalation candidates and decision paths

Escalate items when one or more apply:

- no owner follow-through
- unresolved blocker beyond expected review point
- dependency delay threatens milestone integrity
- decision needed is outside current team's authority

For each candidate, define escalation target and decision needed.

## Step 5: Set owner actions and checkpoints

Define:

- immediate mitigation action
- escalation action and owner
- decision deadline/review checkpoint
- fallback if decision is delayed

For each escalated item, make the fallback explicit in the returned actions (not only in working notes).

Mark unknowns as `TBD`.

## Step 6: Return risk escalation findings

After analysis, present the findings using the optional runtime style and fallback above.

What this skill must determine before presentation:

- escalation objective
- tools or data sources actually used
- human-readable source labels paired with direct links when available
- missing tools or data gaps when relevant
- overall escalation signal: `stable` | `watch` | `escalate-now` | `blocked`
- top tolerance pressure
- what needs attention now
- source quality and one best missing source when confidence is below `high`
- escalation actions with owners, due dates, and fallback paths when known
- unknowns as `TBD` when needed
- follow-ups or next escalation steps when useful

Do not force a wrapper report shape here. The communication layer should decide how much structure the user sees.

## Rules

- Keep output concise, operational, and decision-ready.
- Never collapse active issues into generic risk language.
- Keep unknowns explicit as `TBD`.
- If confidence is below `high`, ask for one concrete missing source only.
- This operation is read-only by default. Require separate explicit approval for each external write, then report success or failure with a resulting link or stable ID when available.
