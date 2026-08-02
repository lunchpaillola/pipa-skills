# Pipa Daily Planning

Use for a one-time request to plan a specific workday. Recurring or scheduled planning rituals route to `pipa-manage`.

Daily Planning is read-only by default. Do not create or change tasks, calendar events, messages, documents, or automations without a separate explicit approval.

## Progress

Copy this checklist into working notes and update it as the ritual runs:

```text
Daily Planning Progress
- [ ] Step 1 complete: look back
- [ ] Step 2 complete: gather
- [ ] Step 3 complete: choose
- [ ] Step 4 complete: estimate
- [ ] Step 5 complete: confront capacity
- [ ] Step 6 complete: defer
- [ ] Step 7 complete: commit
```

## Before Starting

Resolve the target date and timezone before interpreting `today`, due dates, or calendar availability. Use verified user context when available; otherwise ask one focused question.

Read `~/.pipa/CONNECTORS.md` when present to identify preferred tools, then use Composio discovery to verify live access before claiming any source was read. A connector mapping is not proof of access.

Core source categories are `~~project tracker`, `~~code hosting`, and `~~calendar`. Review `~~chat`, `~~email`, or `~~knowledge base` only when relevant to a known planning gap. For each requested source, report one state: `used`, `stale`, `declined`, `unavailable`, `failed`, or `not reviewed`. Never treat a failed or unavailable source as empty.

Evidence priority is:

1. the user's explicit current-day statements
2. verified work systems
3. a prior shutdown or tomorrow seed in the current conversation
4. optional communications context

Keep conflicts visible instead of silently merging them. Preserve material record links or stable IDs.

## Workflow

### Step 1: Look back

Read the latest shutdown or tomorrow seed from the current conversation when available. If none exists, say so and continue from verified sources.

### Step 2: Gather

Gather active commitments, due work, code-review obligations, and calendar load from available verified sources. Record source state and freshness as each source is checked.

### Step 3: Choose

Propose the smallest credible priority set for the target day. Keep risks, dependencies, and unsupported assumptions explicit as `TBD`.

### Step 4: Estimate

Attach a practical estimate to each proposed priority. Label uncertain estimates rather than inventing precision.

### Step 5: Confront capacity

Compare total estimated work with calendar-adjusted capacity. Show the specific overload or remaining buffer. Do not present an impossible list as a plan.

### Step 6: Defer

Name the items that will not fit and recommend an explicit deferral, drop, or follow-up decision for each. Do not change external records.

### Step 7: Commit

Ask the user to accept or revise the capacity-aware priority set. The accepted response becomes the Daily Plan baseline for a later Daily Shutdown in the same conversation.

## Output

```md
# Daily Plan - <target date> (<timezone>)

## Ritual Progress
- Look back: complete
- Gather: complete
- Choose: complete
- Estimate: complete
- Confront capacity: complete
- Defer: complete
- Commit: awaiting acceptance or complete

## Priorities
| Priority | Estimate | Owner | Done check | Evidence/source |
|---|---:|---|---|---|
| | | | | |

## Capacity
- Available capacity:
- Planned work:
- Tradeoff or buffer:

## Deferred
| Item | Disposition | Reason | Review date |
|---|---|---|---|
| | | | |

## Risks And Unknowns
- TBD:

## Source Coverage
| Source category | Tool/app | State | Freshness/gap | Material records |
|---|---|---|---|---|
| | | | | |

## Commitment
- Baseline status: `proposed` until the user explicitly accepts it, then `accepted`
- Accepted priorities:
- External writes requested: none, or pending separate approval
```

Keep the artifact concise. If the user also asks for tracker, calendar, message, document, or automation changes, finish the read-only plan first and present those writes as separate proposed actions requiring explicit approval.
