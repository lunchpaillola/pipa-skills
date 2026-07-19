# Connectors

## How Tool References Work

Pipa skill files describe tool needs by category, not by one vendor. For example, `~~project tracker` can be Linear, Jira, GitHub Issues, Asana, or another connected task system.

Use this file before any live read/write. If the needed category is unavailable, ask for pasted source material or route to a non-connected version of the workflow.

## Connector Categories

| Category | Placeholder | Common tools | Used for | Communication/write gate |
|---|---|---|---|---|
| Chat | `~~chat` | Slack, Microsoft Teams, Discord | threads, updates, status delivery, relationship signals | Read freely when connected; post only with explicit approval or trigger proposal confirmation. |
| Email | `~~email` | Gmail, Outlook, Apple Mail | client follow-ups, invoice nudges, source threads, reminder delivery | Draft/send only with explicit approval; self-reminders use `pipa-follow-up-reminders`. |
| Calendar | `~~calendar` | Google Calendar, Outlook Calendar | dates, meetings, follow-up timing, huddle scheduling context | Create/update events only after explicit approval. |
| Cloud storage | `~~cloud storage` | Google Drive, OneDrive, Dropbox | docs, source files, exports, archives | Never overwrite originals; create new files or drafts unless told otherwise. |
| Docs | `~~docs` | Google Docs, Microsoft Word, Markdown files | briefs, plans, exports, decision records | Update externally only when asked; cite doc name/link. |
| Docs/knowledge base | `~~knowledge base` | Google Docs, Notion, Confluence, Guru, Help Scout Docs | briefs, plans, decisions, lessons, reusable knowledge | Update externally only when asked; cite doc name/link. |
| Project tracker | `~~project tracker` | Linear, Jira, GitHub Issues, Asana, Trello | scope, delivery state, blockers, owners, closeout | Create/update issues only with explicit approval or clear user instruction. |
| Code hosting | `~~code hosting` | GitHub, GitLab, Bitbucket | PRs, issues, release/implementation evidence | Mutating repo/PR actions require explicit instruction. |
| CRM | `~~CRM` | HubSpot, Salesforce, Pipedrive, Airtable | leads, accounts, pipeline, client health | Update records only with approval; never invent contact history. |
| Finance | `~~finance` | Stripe, QuickBooks, PayPal, Xero | invoices, payments, budget, AR, margin | Treat as high-risk. Never send payment follow-ups or change records without approval. |
| Time tracking | `~~time tracking` | Pipa records, Toggl, Harvest | billable time, utilization, invoice prep | Writes go through `pipa-time-tracking` gates. |
| Automation/trigger runtime | `~~automation` | Pipa triggers, Composio triggers, cron/scheduler | recurring status, watchers, event-driven delivery | Require trigger proposal confirmation before create/update/delete. |
| Voice/audio | `~~voice` | Pipa Huddle, audio brief runtime, TTS/transcription | live talk-throughs, listenable briefs | Use only on explicit voice/audio/listenable wording. |
| Web/search | `~~web search` | Browser, search APIs, Reddit, Google Search Console, YouTube | market signals, public research, prospect context | Cite searched sources; do not imply private data access. |
| Memory | `~~memory` | Supermemory, local memory, project docs | durable preferences, lessons, relationship context | Save/forget only when asked or when runtime memory rules require it. |

## Pipa Routing Map

| Pipa lane | Typical connector categories |
|---|---|
| Find work | `~~CRM`, `~~chat`, `~~email`, `~~web search`, `~~project tracker`, `~~knowledge base` |
| Define work | `~~chat`, `~~email`, `~~docs`, `~~cloud storage`, `~~project tracker`, `~~calendar`, `~~knowledge base` |
| Deliver work | `~~project tracker`, `~~chat`, `~~code hosting`, `~~calendar`, `~~docs`, `~~knowledge base` |
| Get paid | `~~finance`, `~~time tracking`, `~~email`, `~~CRM`, `~~calendar`, `~~docs` |
| Grow relationships | `~~CRM`, `~~email`, `~~chat`, `~~calendar`, `~~project tracker`, `~~knowledge base` |
| Learn from the work | `~~docs`, `~~cloud storage`, `~~code hosting`, `~~project tracker`, `~~knowledge base`, `~~memory` |

## Gotchas

- A connector category is not proof of access. Run the relevant discovery/connection flow before claiming live records.
- Reads still need provenance. Cite the record, document, link, or stable ID that supports the answer.
- Writes are approval-gated unless the user gave a direct write instruction in the current turn.
- Do not expose private workspace-specific tool names in public skill output unless the connected tool actually ran.
