---
name: composio-mcp
description: Use the Composio MCP with Pipa to discover and operate external app tools safely.
tags: [composio, mcp, pipa, tools, external-apps, automation, connected-accounts]
metadata:
  version: 0.2.0
---

## When to Apply

- User asks Pipa to interact with an external app such as Gmail, Slack, GitHub, Notion, Linear, Google Calendar, or similar.
- User wants Pipa to send, create, update, fetch, summarize, or monitor records in a connected service.
- User asks for a connected-app action and Composio MCP tools are available in the current agent runtime.
- User explicitly mentions Composio, Composio MCP, connected accounts, external app tools, or Pipa connected workflows.

## Core Rule

Use the Composio MCP tools exposed in the current runtime. Do not switch to any non-MCP Composio workflow, install Composio locally, or initialize projects.

If Composio MCP tools are not available, stop and ask the user to connect or enable the Composio MCP for this agent environment.

## Workflow

1. Clarify the target app, action, and user-visible outcome if the request is ambiguous.
2. Inspect the available Composio MCP tools before choosing an action.
3. Prefer the smallest specific MCP tool that can complete the request.
4. Check whether the required connected account or authorization is available.
5. If authorization is missing, ask the user to complete the MCP-provided connection flow and wait for confirmation.
6. Execute the action through the MCP tool with explicit parameters.
7. Report concise provenance: app, action, tool used, and the relevant record ID, URL, title, or timestamp returned by the tool.

## MCP Tool Pattern

The Composio MCP is self-describing. Use its metadata tools instead of relying on local reference files.

1. Search first with the MCP tool-discovery operation for the user's use case.
2. Review the returned tool schemas, connection status, recommended plan, and pitfalls.
3. If a toolkit has no active connection, use the MCP connection-management operation and give the user the returned authorization link.
4. If a tool result points to a schema reference, fetch the complete schema before execution.
5. Execute only returned tool slugs with schema-compliant arguments.
6. For independent actions, use the MCP batch-execution operation when available.

Required capabilities for this skill:

- Search for relevant external-app tools from a natural-language task.
- Detect whether the target app account is already connected.
- Produce an authorization link when the account is not connected.
- Execute selected tools after authorization is active.
- Return concrete provenance from tool results.

## Safety Rules

- Never guess tool names, toolkit names, account IDs, issue IDs, email addresses, channel names, or project IDs.
- Never claim an action completed unless the MCP tool returns a success result.
- Ask for confirmation before destructive, irreversible, public, or user-notifying actions.
- For write actions, restate the exact target and payload before executing when the action could notify people, alter project state, or publish content.
- Keep secrets out of prompts, files, logs, and responses.
- Prefer read-only inspection before mutation when the current state matters.

## Pipa Usage

When invoked from Pipa, treat Composio MCP as the connected-app execution layer. Pipa should keep ownership of the project-management intent, and Composio MCP should perform the external-app operation.

Good Pipa handoff pattern:

1. Identify the PM intent: status update, ticket creation, stakeholder message, calendar coordination, document lookup, or automation support.
2. Select the relevant external app MCP tool.
3. Execute only the connected-app portion through Composio MCP.
4. Return the result to Pipa with enough provenance for follow-up.

## Response Pattern

After a successful MCP action, respond with:

- What changed or what was retrieved.
- The external app and MCP tool used.
- The concrete record reference returned by the tool.
- Any user action still required.

If blocked, respond with:

- The missing app, account, permission, or MCP tool.
- The exact user decision or connection step needed.
- No fallback outside the Composio MCP.
