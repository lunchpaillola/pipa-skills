# Pipa Daily Shutdown

Use for a one-time request to close a specific workday and prepare tomorrow. Formal project signoff, handover, benefits review, and archive readiness remain in the other close modes. Recurring or scheduled shutdown rituals route to `pipa-manage`.

Daily Shutdown is read-only by default. Do not create or change tasks, calendar events, messages, documents, or automations without a separate explicit approval.

## Progress

Copy this checklist into working notes and update it as the ritual runs:

```text
Daily Shutdown Progress
- [ ] Step 1 complete: close today
- [ ] Step 2 complete: compare plan to actual
- [ ] Step 3 complete: resolve open loops
- [ ] Step 4 complete: prepare tomorrow
- [ ] Step 5 complete: reflect or skip
- [ ] Step 6 complete: explicitly close
```

## Before Starting

Resolve the target date and timezone before interpreting `today`, due dates, or calendar evidence. Use verified user context when available; otherwise ask one focused question.

Use an accepted Daily Plan from the current conversation only when its target date and timezone match the shutdown target. Otherwise reconstruct likely commitments from verified sources and prominently report `baseline unavailable`; do not claim an accurate plan-versus-actual comparison.

Read `~/.pipa/CONNECTORS.md` when present to identify preferred tools, then use Composio discovery to verify live access. Core source categories are `~~project tracker`, `~~code hosting`, and `~~calendar`. Review `~~chat`, `~~email`, or `~~knowledge base` only to resolve a known open loop. For each requested source, report one state: `used`, `stale`, `declined`, `unavailable`, `failed`, or `not reviewed`. Never treat a failed or unavailable source as empty.

Preserve material record links or stable IDs. User corrections outrank source inference, and conflicting evidence remains visible.

## Workflow

### Step 1: Close today

Gather the accepted baseline, user-reported outcomes, and verified evidence for the target day. Identify source gaps before classifying work.

### Step 2: Compare plan to actual

Classify each known commitment as `completed`, `partial`, `blocked`, `deferred`, `dropped`, or `unknown`. Missing evidence is `unknown`, not completed.

### Step 3: Resolve open loops

Give every unresolved item one explicit disposition: `carry forward`, `delegate recommendation`, `schedule recommendation`, `defer`, `drop`, or `TBD`. Recommendations are not external writes.

### Step 4: Prepare tomorrow

Create a small tomorrow seed with the likely first priority, unresolved constraints, and source gaps. Do not create tasks or events.

### Step 5: Reflect or skip

Offer one short optional reflection: what helped, what got in the way, or what to change tomorrow. Skip it without blocking shutdown when the user declines.

### Step 6: Explicitly close

State that the shutdown ritual is complete. Distinguish `ritual complete` from `all work complete` when work remains open.

## Output

```md
# Daily Shutdown - <target date> (<timezone>)

## Objective
- Close the target workday against the best available baseline and prepare tomorrow.

## Ritual Progress
- Close today: complete
- Compare plan to actual: complete
- Resolve open loops: complete
- Prepare tomorrow: complete
- Reflect: complete or skipped
- Explicitly close: complete

## Baseline
- Baseline status: `accepted plan available` or `baseline unavailable`
- Comparison confidence:

## Plan Versus Actual
| Commitment | Outcome | Evidence/source | Note |
|---|---|---|---|
| | | | |

## Current Signal
- What needs attention now:

## Open Loops
| Item | Owner | Next action/disposition | Due/review date | Status | Evidence/source |
|---|---|---|---|---|---|
| | | | | | |

## Tomorrow Seed
- First likely priority:
- Constraints or dependencies:
- Source gaps:

## Tool Access Check
| Source category | Tool/app | State | Freshness/gap | Material records |
|---|---|---|---|---|
| | | | | |

## Unknowns
- TBD:

## Reflection
- Optional reflection or `skipped`:

## Closure
- Ritual status: `complete`
- Work status: `all complete`, `open loops carried`, or `TBD`
- External writes requested: none, or pending separate approval
```

If the user also asks to send the summary or schedule tomorrow's work, finish the read-only shutdown first and present those writes as separate proposed actions requiring explicit approval.
