# Pipa Standalone Invocation

Pipa can route to selected standalone skills, but those skills remain authoritative connected capabilities.

## Authoritative Standalone Skills

| Pipa route | Standalone skill | Use when | Must preserve |
|---|---|---|---|
| `audio brief` | `pipa-audio-brief` | User explicitly asks for audio, listenable, spoken, phone-friendly, or listening-page review of a source artifact | Source extraction safety, no degraded brief when source is unreadable, Kokoro generation rules, publishing and cleanup contract |
| `voice session`, `talk by voice`, `walking work session` | `pipa-huddle-beta` | User explicitly asks for live voice conversation with Pipa or the active agent, including plan-by-voice or talk-through requests | Voice-session scope, transport/privacy blockers, no realtime voice coding or spoken permission approval, optional synthesized handoff instead of raw transcript |
| `composio` | `composio-mcp` | User wants external app access or action through Composio MCP | MCP tool discovery, authorization links, schema-safe execution, no guessed tool slugs, concise provenance |
| `trigger`, `automate` | `pipa-triggers` | User wants event-driven automation, watchers, webhooks, listeners, recurring delivery, or trigger management | Required trigger details, stale-event rules, final trigger proposal confirmation before create |
| `follow-up reminder`, `email reminder`, `email me later` | `pipa-follow-up-reminders` | User wants a specific one-shot follow-up reminder scheduled to their own email at a future time | One-shot-only scope, verified self-recipient guardrail, timezone resolution, confirmation before create, no recurring automation or inbox monitoring |
| `time tracking`, `time entry`, `billable time record` | `pipa-time-tracking` | User wants to start, stop, switch, backfill, update, archive, summarize, or review time entries | Generic agent utility record contract, no unsupported invoicing/payroll claims, explicit write/update intent for record changes |

## Invocation Rules

1. Load the standalone skill by name after selecting it as the primary route.
2. Follow the standalone skill's `SKILL.md`, setup checks, required inputs, blockers, confirmations, and output contract exactly.
3. Do not copy the standalone workflow into Pipa. Pipa only routes and frames the handoff.
4. If a required input is missing, ask the standalone skill's minimum required question rather than guessing.
5. If the standalone skill blocks, return that blocker clearly instead of replacing it with a generic lane answer.

## Negative Routing Rules

- `brief this PR`, `summarize this PR`, `write a brief`, `project brief`, and `requirements brief` do not route to `pipa-audio-brief` unless the user explicitly asks for audio/listenable/spoken/phone-friendly output.
- `plan this project`, `talk through this plan` without voice wording, and generic planning requests do not route to `pipa-huddle-beta`.
- `create an audio brief`, `make a listening page`, and `generate TTS` do not route to `pipa-huddle-beta` unless the user asks for live back-and-forth voice conversation.
- `join my Zoom`, `join my Meet`, and human video-call bot requests do not route to `pipa-huddle-beta`.
- `give me a weekly status update now` means produce a one-time `deliver work` status update.
- `follow up with the client`, `draft a follow-up`, `watch for a reply`, and generic owner-follow-through requests route to `grow relationships` unless the user specifically wants a future reminder sent to their email.
- `review invoices`, `check margin`, and `what needs payment action` route to `get paid`; they do not route to `pipa-time-tracking` unless time-entry operations are explicit.
- External app work through Composio MCP must start with MCP tool discovery or verified tool/app information. Never invent a slug because a prompt names an app.
