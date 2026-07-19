# Pipa Connectors

Use for Pipa connected-tool setup, status, explanation, or troubleshooting.

## Mental Model

- Not a business lane.
- `pipa-manage` owns setup/status/config.
- `pipa-tools` owns one-off live app actions.
- Business lanes own intent and request tool access when needed.
- `composio-mcp` owns discovery, auth, schemas, and execution.

## Connector Categories

- Communication: Slack, Gmail, Outlook, Teams.
- Work tracking: Linear, GitHub, Jira, ClickUp, Asana, Trello.
- Docs and knowledge: Notion, Google Drive, Google Docs, Sheets.
- Calendar and meetings: Google Calendar, Outlook Calendar.
- Money and records: Stripe, time tracking, finance tools.
- Publishing and growth: YouTube, Reddit, social/search tools when available.

## Lane Map

| Pipa lane | Common connector categories |
|---|---|
| Get work | CRM, email, chat, work tracking, web/search, docs and knowledge |
| Define work | email, chat, docs and knowledge, cloud storage, work tracking, calendar |
| Deliver work | work tracking, chat, code hosting, calendar, docs and knowledge |
| Get paid | money and records, time tracking, email, CRM, calendar, docs |
| Keep clients | CRM, email, chat, calendar, work tracking, docs and knowledge |
| Improve operations | docs and knowledge, cloud storage, code hosting, work tracking, memory |

## Add A Connector

Use when Pipa needs a new app or missing account connection.

1. Name the Pipa job it should support.
2. Map the job to a connector category and target app.
3. Pick minimum permission: read, write, publish, notify, schedule, or manage.
4. Use `composio-mcp` discovery to find the toolkit and connection status.
5. If disconnected, give the MCP-provided authorization link.
6. After authorization, run the smallest safe read-only check.
7. Summarize what connected, what Pipa can do, and remaining gaps.

## Setup Workflow

1. Confirm job/capability.
2. Identify app + permission category.
3. Route through `composio-mcp` discovery.
4. Check active connection.
5. If disconnected, provide auth link and wait.
6. After auth, run smallest safe read-only check.
7. Return connected app, new capability, remaining gaps.

## Output Contract

- Connector objective.
- Target app/toolkit.
- Needed permission category.
- Current connection status: `connected`, `needs-auth`, `blocked`, or `TBD`.
- Setup action or authorization step.
- Safety note for writes/publishing/notifications.
- Provenance for any live check.

## Rules

- Never claim active status without tool-returned status or verified runtime evidence.
- Do not ask users for raw secrets in chat.
- Do not test connections with writes, sends, publishes, reminders, triggers, or finance changes.
- If user connects a tool for a lane, keep lane objective visible and route only setup here.
- If user uses an already-connected app now, route to `pipa-tools`/Composio or lane + Composio execution.
- Lane refs name common categories; this file owns setup/status.
