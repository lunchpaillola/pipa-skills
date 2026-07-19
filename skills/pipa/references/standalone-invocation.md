# Pipa Standalone Invocation

Pipa can route to standalone skills; standalone skills remain authoritative.

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

1. Load standalone skill after selecting it as primary route.
2. Follow its `SKILL.md`, setup checks, inputs, blockers, confirmations, output contract.
3. Do not copy workflow into Pipa. Pipa only routes + frames handoff.
4. Missing input? Ask standalone skill's minimum question. Do not guess.
5. Skill blocks? Return blocker. Do not replace with generic lane answer.

## Negative Routing Rules

- `brief this PR`, `summarize this PR`, `write a brief`, `project brief`, `requirements brief` do not route to `pipa-audio-brief` unless audio/listenable/spoken/phone-friendly is explicit.
- `plan this project`, `talk through this plan` without voice wording, generic planning do not route to `pipa-huddle-beta`.
- `create an audio brief`, `make a listening page`, `generate TTS` do not route to `pipa-huddle-beta` unless live back-and-forth voice is requested.
- `join my Zoom`, `join my Meet`, and human video-call bot requests do not route to `pipa-huddle-beta`.
- `give me a weekly status update now` -> one-time `deliver work` status update.
- `follow up with client`, `draft follow-up`, `watch for reply`, generic owner follow-through -> `grow relationships` unless future self-email reminder is explicit.
- `review invoices`, `check margin`, `what needs payment action` -> `get paid`, not `pipa-time-tracking` unless time-entry ops are explicit.
- Composio MCP work starts with MCP discovery or verified tool/app info. Never invent slug.
