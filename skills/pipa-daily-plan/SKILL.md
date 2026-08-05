---
name: pipa-daily-plan
description: "Use only when `pipa-daily-plan` is explicitly invoked or `pipa-define-work` delegates to it."
metadata:
  version: 0.1.0
---

# Pipa Daily Plan

Create a capacity-aware brief for one workday. Route recurring or scheduled setup to `pipa-manage`.

## Workflow

1. Read [references/gotchas.md](references/gotchas.md).
2. Resolve the target date and canonical IANA timezone from verified user or calendar data. Ask one question only if missing data makes the brief unreliable.
3. Read `~/.pipa/profile.md` and `~/.pipa/CONNECTORS.md` when present. Use them for goals, workday preferences, and preferred tools. Continue if either file is missing.
4. Use `composio-mcp` discovery to verify live access. Use the project tracker and calendar as core sources. Use code hosting for code delivery. Use prior briefs, chat, email, or a knowledge base only to answer a specific planning question.
5. Gather active work, due dates, states, priorities, dependencies, calendar commitments, and any explicit current goal.
6. Find work the user can advance today. If due work is blocked, select an unblock step. If none exists, flag the block and continue to executable work.
7. Choose the main focus in this order:
   - overdue or due-today work;
   - work already in the active or `Now` state;
   - otherwise, the best next ticket based on tracker priority, dependencies, relevance to active work, and alignment with a known goal.
   Use goal alignment only to break a tie within one tier.
8. Fit the main focus to available capacity. If the full ticket will not fit, select a useful milestone or next action for today.
9. Add at most two secondary items if the calendar supports them. If capacity is unclear, include only the main focus.
10. Explain why the main focus matters. Add a rough estimate only when the task or user data supports it.
11. Summarize important events, focus windows, and material constraints. Do not infer attendance or working hours from one event.
12. Give one first action. Add a link or stable record ID when available.
13. Treat the latest dated brief in the conversation as the working plan unless the user revises it.
14. Keep the brief read-only. Complete it before you propose a write. Get separate explicit approval for each write.
15. End with a short sources line. Name only the apps and material records used.

## Output Contract

```md
# Daily Brief - <weekday, date> (<canonical IANA timezone>)

## Your Day
<A short, human summary of the calendar shape, useful focus time, and what the day calls for.>

## Main Focus
**<ticket or outcome>** - <why this is the best use of today>
- Done looks like: <clear outcome>
- Time: <rough estimate, only when supported>

## If Time Allows
1. <secondary item and why it follows>
2. <optional second item>

Omit this section when the day only supports the main focus.

## Schedule
- <time or focus window>: <event or recommended work block>

## Start Here
<One direct sentence telling the user what to open or do first.>

I pulled this from: <apps, linked material records, and user-provided context actually used>.
```

Use the sections and natural prose. Do not show ritual progress, connector status tables, backlog totals, or long source-gap lists unless the user asks for diagnostics.
