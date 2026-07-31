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

### Step 1: Ask the core questions

After the user accepts setup, treat clear answers or explicit skips in the current request as confirmed and save them before asking anything. Then ask only the remaining questions, conversationally and one at a time:

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

### Step 2: Optionally read a company website

If the user provides a company URL and wants drafting help, read the public website and propose only supported facts about the business, offer, audience, or positioning. Confirm proposed facts before saving them under `Website Context`; never overwrite user-provided content. Keep this read-only and best-effort. Skip it when no URL or web-reading capability is available. Do not add an enrichment service or reverse-lookup people by email.

### Step 3: Review relevant connections

Load `references/connectors.md` and review only connections relevant to what the user wants Pipa to help with. A declined, unavailable, or failed connection does not block setup completion or erase profile facts.

### Step 4: Complete setup

After connector review, update the profile metadata to `setup_status: complete` and refresh `updated_at`.

Return:

- the captured profile, including skipped or unknown fields
- connection state: connected, declined, unavailable, failed, or not reviewed
- one optional next step

## Completed Profile Updates

For `setup_status: complete`, do not run the first-time workflow again. Show the current profile and apply clearly specified updates directly; ask only when the field or replacement value is missing or ambiguous. Update only confirmed fields, preserve `setup_status: complete`, and refresh `updated_at`. Review connectors only when the user requests it.
