---
name: pipa-daily-shutdown
description: "Use only when `pipa-daily-shutdown` is explicitly invoked or `pipa-improve-operations` delegates to it."
metadata:
  version: 0.1.1
---

# Pipa Daily Shutdown

Summarize one workday, close open loops, and prepare tomorrow. Route formal closeout work to its focused operation. Route recurring or scheduled setup to `pipa-manage`.

## Progress

Track this checklist in working notes:

```text
Daily Shutdown Progress
- [ ] Step 1 complete: close today
- [ ] Step 2 complete: compare plan to actual
- [ ] Step 3 complete: resolve open loops
- [ ] Step 4 complete: prepare tomorrow
```

## Workflow

Before step 1, read [references/gotchas.md](references/gotchas.md) and [references/output-contract.md](references/output-contract.md). Use the system date for today. For another date, use the user's request or calendar. Ask one question only if the target day is unclear.

Read `~/.pipa/profile.md` and `~/.pipa/CONNECTORS.md` when present. Use the profile for goals and preferences. Use mapped tools when present. For unmapped capabilities, use `composio-mcp` discovery to find tools for `~~project tracker`, `~~calendar`, and `~~code hosting`. Verify live access before reading a source. Use the tracker and calendar as core sources, code hosting for code delivery, and other sources only to resolve a specific outcome or open loop.

1. **Close today.** Gather completed or advanced work, shipped artifacts, decisions, and calendar events. Separate verified completion from movement and unknown outcomes. Relate the day to a known goal; omit the goal check when none is known. A calendar event proves it was scheduled, not attended.
2. **Compare plan to actual.** Use a matching Daily Plan when available. Otherwise, use target-day evidence without showing `baseline unavailable`. If the user asks for a comparison, include it in completed, moved, and open work.
3. **Resolve open loops.** Give each important unfinished item one disposition: carry forward, delegate, schedule, defer, drop, or `TBD`. Add a next action when possible.
4. **Prepare tomorrow.** Find the likely first priority, first action, and known calendar constraint. Do not create tasks or events.

Write the read-only shutdown with [references/output-contract.md](references/output-contract.md). Show each exact external write and require separate approval before execution; report its result. End with a short sources line that names only the apps and material records used.
