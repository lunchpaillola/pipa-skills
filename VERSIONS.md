# Versions

## v2.0.0

- Updated `pipa` to v2.0.0 with six operating lanes: find work, define work, deliver work, get paid, grow relationships, and learn from the work.
- Added lane references, refreshed command menu/help routing, and preserved standalone breakout skills as guarded connected capabilities.
- Expanded public eval fixtures and validator coverage for lane routing, compatibility aliases, breakout-negative cases, and cross-lane handoffs.

## v0.4.4

- Updated `pipa-follow-up-reminders` to v0.1.2 with stricter local time resolution, Eastern timezone handling, near-term validation, and clearer hosted-run credential recovery.
- Removed skill-specific changelog files so version history lives in this central file.

## v0.4.3

- Removed `pipa-workflow-automation` from the public skill pack; recurring workflow automation is available only in the hosted Pipa product.

## v0.4.2

- Updated `composio-mcp` to v0.2.0 with an MCP-only contract for tool discovery, authorization links, schema-safe execution, and provenance
- Removed the stale Composio generated rule bundle and `AGENTS.md` to prevent agents from falling back to local setup or non-MCP workflows
- Updated `pipa` to v0.1.1 so Pipa routes Composio requests to the MCP-focused standalone skill

## v0.4.1

- Updated `pipa-huddle-beta` to v0.1.1 with managed daemon launches for hosted and local voice sessions
- Added daemon lifecycle cleanup and safety checks so new launches replace only the previously recorded Pipa Huddle bridge
- Clarified huddle relay expiry behavior and launch-context guidance for teams using the skill outside this repo

## v0.4.0

- Added `pipa-huddle-beta` for starting live voice huddles with Pipa or the active agent
- Added hosted relay, local bridge, browser huddle UI, Cloudflare Worker, and relay protocol safety checks for voice sessions
- Added huddle references for session contract, transport, hosted relay behavior, privacy and retention, template contract, and context handoff
- Added Pipa routing updates so voice huddle requests can be handled as a standalone breakout workflow

## v0.3.0

- Added `pipa-audio-brief` for turning agent sessions, PRs, plans, specs, research reports, docs, URLs, and pasted markdown into Kokoro-generated here.now listening pages
- Added managed local Kokoro setup and generation scripts for reusable audio brief creation
- Added audio brief references for source extraction, script shaping, page generation, privacy, publishing, and local artifact cleanup

## v0.2.0

- Added `pm-monitor` as the monitor-stage entry point for routing across intake triage, status update, budget review, and risk / follow-through workflows
- Added `pm-monitor-ticket-triage` for intake triage, response drafting, task routing, and noisy backlog cleanup
- Added `pm-monitor-budget` for baseline-vs-actual budget health checks, directional forecast calls, and change-control / escalation recommendations
- Updated `pm-monitor` routing behavior so attention-first, status-snapshot, budget, and blocker-driven requests route more reliably
- Updated `pm-monitor-budget` guidance for source-aware answers, hours-plus-rate burn math, retainer capacity baselines, and provisional rescue estimates

## v0.1.0

- Initial public repository setup
- Added `pm-initiate-project-context` as the first published skill
