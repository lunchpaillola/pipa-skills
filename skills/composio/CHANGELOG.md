# Changelog

## v0.2.0

- Renamed the skill contract to `composio-mcp` and made Composio MCP the only supported execution path.
- Added the required MCP pattern for tool discovery, connection-state checks, authorization links, schema lookup, schema-safe execution, and result provenance.
- Removed generated CLI, SDK, Tool Router, and trigger rule files that were causing agents to choose non-MCP Composio workflows.
