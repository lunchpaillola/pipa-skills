---
name: pipa-scope-tracker
description: Track project scope changes and generate change orders when clients push beyond the original agreement. Use when a user mentions scope creep, out-of-scope requests, "that's not what we agreed on," change orders, or wants to log and notify clients about scope expansion. Do not use for invoicing, time tracking, project management, or contract drafting.
metadata:
  version: 0.1.0
---

# Pipa Scope Tracker

Scope creep detected -> log change -> generate change order -> notify client.

CRITICAL: Track scope changes through simple structured records. Do not attempt contract negotiation, legal advice, automatic client billing, or project management beyond scope logging.

Keep a short todo list: mode, project context, scope change details, change order generation, notification.

## Workflow

1. **Pick mode.** Choose exactly one.

   - Log a scope change: "this is beyond what we agreed," "they want extra features," "scope creep alert" -> **log**. Continue step 2.
   - Review scope history: "what have they added beyond the original scope?" -> **review**. Continue step 2.
   - Generate change order: "draft a change order for the extra work" -> **change-order**. Continue step 2.
   - Send scope notification: "let the client know this is out of scope" -> **notify**. Continue step 2.
   - Invoicing, time tracking, contract drafting, project management, task tracking -> explain V1 does not support that flow, then stop.

   If conversation already has a logged scope change and user asks about it, answer from known context. Do not call unsupported APIs.

2. **Collect project context.**

   Before logging any scope change, ensure you have:
   - **Project name or identifier** (ask if not provided)
   - **Original scope summary** (what was agreed)
   - **Who requested the change** (client name or "team")

   If project context is missing, ask: `What project is this for, and what was originally agreed?`

3. **Log scope change.**

   Capture these fields:
   - `project`: project name/identifier
   - `requested_by`: who asked for the change
   - `description`: what was requested
   - `original_scope`: what was originally agreed
   - `impact`: time/effort/cost estimate
   - `timestamp`: when detected
   - `status`: `pending` | `accepted` | `rejected`

   Format as a clean markdown log entry. Store in the conversation context for this session.

4. **Review scope history.**

   When reviewing, list all logged changes for the project with:
   - Date detected
   - What was requested
   - Current status (pending/accepted/rejected)
   - Running total of scope changes

   If no changes are logged, say so clearly.

5. **Generate change order.**

   Draft a change order with:
   - Project name
   - Original scope summary
   - Each out-of-scope item with description and estimate
   - Total additional cost/time
   - Clear approval request

   Use this template:

   ```
   CHANGE ORDER

   Project: [name]
   Date: [date]

   ORIGINAL SCOPE:
   [summary]

   REQUESTED CHANGES:
   1. [description] - [estimate]
   2. [description] - [estimate]

   TOTAL ADDITIONAL: [cost/time]

   Please reply APPROVE or REJECT to confirm.
   ```

6. **Send scope notification.**

   If the user wants to notify the client, draft a message that:
   - References the original scope
   - Clearly states what is out of scope
   - Offers to proceed with a change order
   - Remains professional and non-confrontational

   Do not send without user approval. Show the draft first.

## Gotchas

- Do not invent project history. If no scope was previously defined, ask for the original agreement.
- Do not make legal claims about contracts. Log facts, not opinions.
- Do not auto-notify clients. Always show the draft first.
- Scope tracking is per-session unless explicitly stored. Do not assume cross-session persistence.
