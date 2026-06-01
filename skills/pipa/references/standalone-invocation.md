# Pipa Standalone Invocation

Pipa can route to selected standalone skills, but those skills remain authoritative. Some standalone workflows are read-only; others may perform approved external writes only when their own approval gates allow it.

## Authoritative Standalone Skills

| Pipa route | Standalone skill | Use when | Must preserve |
|---|---|---|---|
| `audio`, `audio brief` | `agent-audio-brief` | User explicitly asks for audio, listenable, spoken, phone-friendly, or listening-page review of a source artifact | Source extraction safety, no degraded brief when source is unreadable, Kokoro generation rules, publishing and cleanup contract |
| `reach`, `find-threads` | `pipa-reach` | User wants finished work to find relevant public conversations, questions, threads, communities, or places to contribute helpfully | Experimental scope, source privacy, verified thread URLs, manual-only community participation, no invented search results |
| `composio` | `composio` | User wants external app access or action through Composio | Setup/auth checks, search -> link -> execute discipline, no guessed tool slugs, concise provenance |
| `trigger` | `pipa-triggers` | User wants event-driven automation, watchers, webhooks, listeners, or trigger management | Required trigger details, stale-event rules, final trigger proposal confirmation before create |
| `automate` | `pipa-workflow-automation` | User wants recurring scheduled PM delivery, reminders, reports, summaries, or automation list/read/delete | Schedule, timezone, destination, execution prompt, scoped account behavior, final confirmation before create |

## Invocation Rules

1. Load the standalone skill by name after selecting it as the primary route.
2. Follow the standalone skill's `SKILL.md`, setup checks, required inputs, blockers, confirmations, and output contract exactly.
3. Do not copy the standalone workflow into Pipa. Pipa only routes and frames the handoff.
4. If a required input is missing, ask the standalone skill's minimum required question rather than guessing.
5. If the standalone skill blocks, return that blocker clearly instead of replacing it with a generic PM answer.

## Negative Routing Rules

- `brief this PR`, `summarize this PR`, `write a brief`, `project brief`, and `requirements brief` do not route to `agent-audio-brief` unless the user explicitly asks for audio/listenable/spoken/phone-friendly output.
- `write a blog post`, `create a marketing plan`, `run paid ads`, and `build a social calendar` do not route to `pipa-reach` unless the user specifically asks for thread/community discovery around existing work.
- `post this everywhere now` may route to `pipa-reach` only for discovery guidance; Reach must not post, submit, comment, vote, schedule, or create drafts by default.
- `give me a weekly status update now` means produce a one-time status update unless the user asks to schedule future delivery.
- `when we meet Monday, remind me to discuss budget` is not enough to create an automation unless the user asks Pipa to set up recurring/scheduled delivery and confirms the final plan.
- External app work through Composio must start with search or verified tool/app information. Never invent a slug because a prompt names an app.
