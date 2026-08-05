---
name: pipa-daily-shutdown
description: "Use only when `pipa-daily-shutdown` is explicitly invoked or `pipa-improve-operations` delegates to it."
metadata:
  version: 0.1.0
---

# Pipa Daily Shutdown

Summarize one workday, close open loops, and prepare tomorrow. Route formal closeout work to its focused operation. Route recurring or scheduled setup to `pipa-manage`.

## Workflow

1. Read [references/gotchas.md](references/gotchas.md).
2. Resolve the target date and canonical IANA timezone from verified user or calendar data. Ask one question only if missing data makes the shutdown unreliable.
3. Read `~/.pipa/profile.md` and `~/.pipa/CONNECTORS.md` when present. Use them for goals, workday preferences, and preferred tools. Continue if either file is missing.
4. Use `composio-mcp` discovery to verify live access. Use the project tracker and calendar as core sources. Use code hosting for code delivery. Use chat, email, or a knowledge base only to resolve a specific outcome or open loop.
5. Gather target-day outcomes, completed or advanced issues, shipped work, decisions, and calendar events. Gather next-day due work, active work, and calendar constraints.
6. Separate verified completion from movement, partial work, and unknown outcomes. A calendar event proves the event was scheduled, not attended.
7. Use a matching Daily Plan when available. If none exists, use target-day evidence. Do not show `baseline unavailable`.
8. If the user asks for plan-versus-actual comparison, add it to `What You Got Done`, `What Moved`, and `Still Open`.
9. Relate the day to an explicit current goal. Omit goal progress if no goal is known.
10. Give each important unfinished item one disposition: carry forward, delegate, schedule, defer, drop, or `TBD`. Add a next action when possible.
11. Prepare tomorrow's likely first priority, first action, and known calendar constraint. Do not create tasks or events.
12. End with a clear workday closure. Do not claim that all work or the project is complete.
13. Keep the shutdown read-only. Complete it before you propose a write. Get separate explicit approval for each write.
14. End with a short sources line. Name only the apps and material records used.

## Output Contract

```md
# Daily Shutdown - <weekday, date>

## What You Got Done
- <completed outcome, shipped artifact, or decision with evidence>

## What Moved
- <Linear issue, pull request, document, or other work that advanced but did not finish>

## Your Day
- <material calendar event and known outcome, or `scheduled` when attendance/outcome is unverified>

## Goal Check
<One short explanation of how the day advanced, maintained, or was blocked against the known goal.>

Omit this section when no current goal is known.

## Still Open
| Item | Status | Next action or disposition |
|---|---|---|

## Tomorrow
- Likely first priority:
- Start with:
- Calendar constraint:

## Closed
<A short, human closure.>

I pulled this from: <apps, linked material records, and user-provided context actually used>.
```

Use the sections. Omit empty sections instead of filling them with diagnostics or `TBD`. Do not show ritual progress, baseline status, or tool-access tables unless the user asks for diagnostics.
