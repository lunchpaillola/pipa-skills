---
name: pipa-scope-creep-tracker
description: Track scope creep and unbilled extras in real time during client calls and messages. Use this when the user wants to log a small client change, check their running scope creep tally, generate a scope change summary for invoicing, or review unbilled extras across projects. Do not use for full project management, time tracking, invoicing, or contract generation.
metadata:
  version: 0.1.0
---

# Pipa Scope Creep Tracker

Client says "quick tweak" -> log it -> running tally stays accurate -> invoice with evidence.

CRITICAL: Log only scope changes the client requests after the original agreement. Do not track original scope work, internal tasks, or routine communication. Keep logging friction near zero: one line, one log, no timers.

## Workflow

1. **Determine mode.**

   Choose exactly one mode.

   - User says something like "log this", "add to scope", "client wants X", or "they asked for a change" -> **log mode**. Continue step 2.
   - User asks for their running total, scope creep summary, or unbilled extras -> **summary mode**. Continue step 4.
   - User wants to mark a logged item as billed or remove it -> **manage mode**. Continue step 5.
   - User wants to export scope changes for an invoice or proposal -> **export mode**. Continue step 6.

2. **Log mode: capture the change.**

   Collect exactly three fields:

   - `project`: client or project name (ask if ambiguous).
   - `change`: one-line description of what the client requested.
   - `effort`: estimated time or complexity (e.g., "15 min", "1 hour", "half day").

   Build the log entry:

   ```json
   {
     "project": "Acme Website",
     "change": "Added footer CTA button not in original scope",
     "effort": "30 min",
     "logged_at": "2026-07-02T14:30:00Z"
   }
   ```

   Append to the project's scope change log. Confirm with a short receipt:

   ```
   Logged: "Added footer CTA button not in original scope" (30 min)
   Project: Acme Website
   Running unbilled total: 2.5 hours across 8 changes
   ```

   Skip ahead: If the user provides all three fields in one message, log immediately. Do not ask for confirmation.

3. **Log mode: batch logging.**

   If the user pastes multiple changes at once (e.g., from call notes), parse each into a separate entry and log them all. Confirm with a count:

   ```
   Logged 5 changes for Acme Website.
   Running unbilled total: 3.25 hours across 13 changes
   ```

4. **Summary mode: show running tally.**

   Read the scope change log for the specified project (or all projects if none specified).

   Return:

   ```
   Scope Creep Summary - Acme Website

   8 unbilled changes | 2.5 hours estimated

   1. "Added footer CTA button" - 30 min (Jul 2)
   2. "Extra revision round on homepage" - 1 hour (Jun 30)
   3. "Logo resize for mobile" - 15 min (Jun 28)
   ...

   Estimated unbilled value: $250 (at $100/hr)
   ```

   Skip ahead: If the user has not set an hourly rate, omit the dollar estimate. Ask if they want to set one.

5. **Manage mode: update entries.**

   - To mark as billed: find the entry by description or date, move it to a billed list, confirm.
   - To remove an entry: find and delete it, confirm with the reason.
   - To edit an entry: update the field(s) the user specifies, confirm the change.

6. **Export mode: generate scope change report.**

   Format the project's unbilled scope changes into a clean summary suitable for:

   - Appending to an invoice
   - Including in a change order
   - Sharing with the client as evidence

   Output format:

   ```
   Scope Changes - Acme Website
   Period: Jun 15 - Jul 2, 2026

   | Date  | Change                              | Effort  |
   |-------|-------------------------------------|---------|
   | Jul 2 | Added footer CTA button             | 30 min  |
   | Jun 30| Extra revision round on homepage    | 1 hour  |
   | Jun 28| Logo resize for mobile              | 15 min  |

   Total: 2.5 hours | Not included in original agreement
   ```

   Skip ahead: If the user wants a different format, adapt. Keep the core fields: date, change description, effort.

## Storage

- Store scope change logs in `.pipa/scope-creep/<project-slug>.json` within the project directory.
- If no project directory exists, use `~/.pipa/scope-creep/<project-slug>.json`.
- Each file is an array of log entries.
- Create the directory on first use if it does not exist.

## Rules

- Never log original scope work. Only client-requested changes after the initial agreement.
- Keep descriptions to one line. No paragraphs.
- Never use timers or categories. Effort is the user's estimate, not tracked time.
- Do not generate invoices. This skill tracks scope changes for invoicing evidence only.
- Do not send anything to the client. The user decides when and how to share.
- If the user asks for invoicing, invoicing, or payment collection, stop and say that is a different skill.
