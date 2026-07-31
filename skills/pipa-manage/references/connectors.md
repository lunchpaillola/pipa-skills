# Pipa Connectors

Use for Pipa connected-tool setup, status, explanation, or troubleshooting.

## Mental Model

- Not a business lane.
- `pipa-manage` owns setup/status/config.
- `pipa-tools` owns one-off live app actions.
- Business lanes own intent and request tool access when needed.
- `composio-mcp` owns discovery, auth, schemas, and execution.
- `~/.pipa/CONNECTORS.md` records the user's selected capability-to-tool mappings; Composio remains the source of truth for live connection status.

## Capability Categories

The `~~` prefix marks a capability placeholder resolved through the global map; it is not a toolkit slug.

- `~~chat`, `~~email`, `~~calendar`, `~~project tracker`
- `~~code hosting`, `~~knowledge base`, `~~cloud storage`, `~~CRM`
- `~~support platform`, `~~content platform`, `~~payments`, `~~time tracking`

## Lane Map

| Pipa lane | Common connector categories |
|---|---|
| Get work | `~~CRM`, `~~email`, `~~chat`, `~~project tracker`, `~~content platform`, `~~knowledge base` |
| Define work | `~~email`, `~~chat`, `~~knowledge base`, `~~cloud storage`, `~~project tracker`, `~~calendar` |
| Deliver work | `~~project tracker`, `~~chat`, `~~code hosting`, `~~calendar`, `~~knowledge base` |
| Get paid | `~~payments`, `~~time tracking`, `~~email`, `~~CRM`, `~~calendar` |
| Keep clients | `~~CRM`, `~~email`, `~~chat`, `~~calendar`, `~~project tracker`, `~~support platform` |
| Improve operations | `~~knowledge base`, `~~cloud storage`, `~~code hosting`, `~~project tracker` |

## Global Connector Map

During first-time setup and connector reviews:

1. Read `~/.pipa/CONNECTORS.md` when present.
2. Use `composio-mcp` discovery to inspect supported toolkits and active connection status.
3. Map existing active connections to relevant capability categories. Ask only when multiple tools could fill the same category or the mapping is unclear.
4. Create or update the map from verified active connections or explicit user tool choices. Preserve unrelated mappings.
5. Never store credentials, authorization links, secrets, or connection status. Check Composio before claiming a mapped tool is active.

Use this shape and include only relevant categories:

```md
---
updated_at: <ISO-8601 timestamp>
---

# Pipa Connectors

| Capability | Tool | Toolkit |
|---|---|---|
| `~~project tracker` | Linear | linear |
```

The map is a durable tool-selection index, not proof of live access.

## Add A Connector

Use when Pipa needs a new app or missing account connection.

1. Name the Pipa job it should support.
2. Map the job to a connector category and target app.
3. Pick minimum permission: read, write, publish, notify, schedule, or manage.
4. Use `composio-mcp` discovery to find the toolkit and connection status.
5. If disconnected, give the MCP-provided authorization link.
6. After authorization, run the smallest safe read-only check.
7. Update `~/.pipa/CONNECTORS.md`, then summarize what connected, what Pipa can do, and remaining gaps.

## Setup Workflow

1. Confirm job/capability.
2. Identify app + permission category.
3. Route through `composio-mcp` discovery.
4. Check active connection.
5. If disconnected, provide auth link and wait.
6. After auth, run smallest safe read-only check.
7. Update `~/.pipa/CONNECTORS.md` and return connected app, new capability, remaining gaps.

## Output Contract

- Connector objective.
- Target app/toolkit.
- Needed permission category.
- Current connection status: `connected`, `needs-auth`, `declined`, `unavailable`, `failed`, `not-reviewed`, or `TBD`.
- Connector-map update or `TBD`.
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
- Update the global map only from verified discovery results or explicit user choices; do not guess mappings.
