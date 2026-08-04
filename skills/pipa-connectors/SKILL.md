---
name: pipa-connectors
description: "Use only when `pipa-connectors` is explicitly invoked or `pipa-manage` delegates to it. Do not trigger from generic language."
metadata:
  version: 0.1.0
---

# Pipa Connectors

Set up, inspect, explain, or troubleshoot Pipa connected tools.

## Mental Model

- This is an operation, not a business lane.
- `pipa-manage` routes Pipa configuration; this skill owns connector setup and status.
- Business lanes own the job; `composio-mcp` performs live app discovery, authorization, and actions.
- `~/.pipa/CONNECTORS.md` records selected capability-to-tool mappings. Composio remains the source of truth for live connection status.
- The `~~` prefix marks a capability placeholder resolved through the global map; it is not a toolkit slug.

## Capability Categories

- `~~chat`, `~~email`, `~~calendar`, `~~project tracker`
- `~~code hosting`, `~~knowledge base`, `~~cloud storage`, `~~CRM`
- `~~support platform`, `~~content platform`, `~~payments`, `~~time tracking`

## Lane Map

| Pipa lane | Common connector categories |
|---|---|
| Get work | `~~CRM`, `~~email`, `~~chat`, `~~project tracker`, `~~content platform`, `~~knowledge base` |
| Define work | `~~email`, `~~chat`, `~~knowledge base`, `~~cloud storage`, `~~project tracker`, `~~code hosting`, `~~calendar` |
| Deliver work | `~~project tracker`, `~~chat`, `~~code hosting`, `~~calendar`, `~~knowledge base` |
| Get paid | `~~payments`, `~~time tracking`, `~~email`, `~~CRM`, `~~calendar` |
| Keep clients | `~~CRM`, `~~email`, `~~chat`, `~~calendar`, `~~project tracker`, `~~support platform` |
| Improve operations | `~~knowledge base`, `~~cloud storage`, `~~code hosting`, `~~project tracker`, `~~calendar`, `~~chat`, `~~email` |

## Review The Global Connector Map

1. Read `~/.pipa/CONNECTORS.md` when present.
2. Use `composio-mcp` discovery to inspect supported toolkits and active connection status.
3. Map active connections to relevant capability categories. Ask only when multiple tools could fill the same category or the mapping is unclear.
4. Create or update the map from verified active connections or explicit user choices. Preserve unrelated mappings.
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

The map is a durable tool-selection index, not proof of live access. Business-lane source checks must use Composio discovery to verify live access and report unavailable, stale, or failed sources explicitly. Optional communication checks must be narrow and tied to a known gap, not broad inbox or channel scans.

## Add A Connector

1. Name the Pipa job the connector should support.
2. Map the job to a connector category and target app.
3. Pick the minimum permission: read, write, publish, notify, schedule, or manage.
4. Use `composio-mcp` discovery to find the toolkit and connection status.
5. If disconnected, give the MCP-provided authorization link and wait.
6. After authorization, run the smallest safe read-only check.
7. Update `~/.pipa/CONNECTORS.md`, then summarize what connected, what Pipa can do, and remaining gaps.

## Output Contract

- Connector objective.
- Target app or toolkit.
- Needed permission category.
- Current connection status: `connected`, `needs-auth`, `declined`, `unavailable`, `failed`, `not-reviewed`, or `TBD`.
- Connector-map update or `TBD`.
- Setup action or authorization step.
- Safety note for writes, publishing, or notifications.
- Provenance for any live check.

## Safety Rules

- Never claim active status without tool-returned status or verified runtime evidence.
- Do not ask users for raw secrets in chat.
- Do not test connections with writes, sends, publishes, reminders, triggers, or finance changes.
- Keep the lane objective visible when a connector supports business work; route only setup here.
- If the user wants to use an already-connected app now, preserve the business objective and use `composio-mcp` for execution.
- Update the global map only from verified discovery results or explicit user choices; do not guess mappings.
- Never store credentials, authorization links, secrets, or live status in the connector map.
