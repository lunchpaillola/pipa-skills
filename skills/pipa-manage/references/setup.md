# Pipa First-Time Setup

Use for first-time setup or review/update of the global Pipa business profile at `~/.pipa/profile.md`.

## State Routing

1. Check whether `~/.pipa/profile.md` exists.
2. If it is missing, offer setup as a soft, non-blocking next step. Do not interrupt concrete work.
3. If `setup_status: incomplete`, resume at the first unanswered question. If all three are answered or skipped, resume at connector review.
4. If `setup_status: complete`, show the existing profile and ask what should change. Preserve complete status and unchanged fields; review connectors only when requested.
5. Never use missing `.agents/project-context.md` as a setup signal.

Do not run connected-tool or memory checks until the user accepts setup.

## Workflow

Before executing, copy this checklist and keep it updated in working notes:

```text
Pipa Setup Progress
- [ ] Step 1 complete: global profile state checked
- [ ] Step 2 complete: setup accepted and read-only preflight completed
- [ ] Step 3 complete: three biographical questions answered or skipped
- [ ] Step 4 complete: optional website context gathered when requested
- [ ] Step 5 complete: relevant tool connections reviewed and offered
- [ ] Step 6 complete: profile marked complete and setup summary returned
```

### Step 1: Check profile state

Read `~/.pipa/profile.md` when present. Route using the state rules above. A missing profile may produce one concise setup offer, but ordinary Pipa work continues without it.

### Step 2: Run accepted preflight

Only after the user accepts setup:

- read any existing profile context
- read available Supermemory context when that capability exists
- discover connected-tool support and current connection status

Preflight is read-only. Do not write memory, start authorization, or mutate connected tools.

### Step 3: Ask the core questions

Treat clear answers or explicit skips in the current request as confirmed and save them before asking anything. Then ask only the remaining questions, conversationally and one at a time:

1. `What do you do?`
2. `Who do you help or work with?`
3. `How do you like to work?`

Allow every question to be skipped. Ask a follow-up only when an answer is unclear. Do not add team structure, approval, process, or current-focus intake.

After each answer or skip, save the confirmed state to `~/.pipa/profile.md` with `setup_status: incomplete`. Preserve existing confirmed facts and never invent missing context.

Use this human-readable shape:

```md
---
setup_status: incomplete
setup_version: 1
updated_at: <ISO-8601 timestamp>
---

# Pipa Profile

## What I Do
<confirmed answer, `Skipped`, or `TBD`>

## Who I Help Or Work With
<confirmed answer, `Skipped`, or `TBD`>

## How I Like To Work
<confirmed answer, `Skipped`, or `TBD`>

## Website Context
<confirmed website-supported business, offer, audience, or positioning facts; omit when unused>
```

### Step 4: Optionally read a company website

If the user provides a company URL and wants drafting help, read the public website and propose only supported facts about the business, offer, audience, or positioning. Confirm proposed facts before saving them under `Website Context`; never overwrite user-provided content. Keep this read-only and best-effort. Skip it when no URL or web-reading capability is available. Do not add an enrichment service or reverse-lookup people by email.

### Step 5: Review relevant connections

Use `references/connectors.md` rather than duplicating connector mechanics. Reuse preflight discovery/status results; discover again only when results are missing, stale, or the profile reveals a different relevant tool.

- Recommend only tools relevant to what the user wants Pipa to help with.
- Discover support and current status before claiming availability.
- Ask before starting OAuth or any external authorization.
- Verify a completed connection with the smallest safe read-only check.
- A declined, unavailable, or failed connection does not block setup completion or erase profile facts.

### Step 6: Complete setup

After connector review, update the profile metadata to `setup_status: complete` and refresh `updated_at`.

Return:

- the captured profile, including skipped or unknown fields
- connection state: connected, declined, unavailable, failed, or not reviewed
- one optional next step

## Rules

- The profile is the source of truth for setup completion; do not add another marker file or infer completion from memory.
- Project context is separate and optional. Do not create `.agents/project-context.md` or project packs during setup.
- Profile writes do not require a separate Supermemory write.
- Never request raw credentials or test a connection with a write action.
- Do not create tasks, reminders, automations, triggers, or recurring workflows during setup.

## Completed Profile Updates

For `setup_status: complete`, do not run the first-time workflow again. Show the current profile and apply clearly specified updates directly; ask only when the field or replacement value is missing or ambiguous. Update only confirmed fields, preserve `setup_status: complete`, and refresh `updated_at`. Review connectors only when the user requests it.
