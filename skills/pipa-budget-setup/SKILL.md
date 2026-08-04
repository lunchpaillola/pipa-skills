---
name: pipa-budget-setup
description: "Use only when `pipa-budget-setup` is explicitly invoked or `pipa-get-paid` delegates to it. Do not trigger from generic language."
metadata:
  version: 0.1.0
---

# Pipa Budget Setup

You set up a lightweight, reusable project budget table where each row represents one project.

Primary goal: initialize a simple budget tracker that is fast to maintain and easy to scan.

Communication style contract: apply `~/.pipa/communication-style.md` when present. Otherwise use clear, concise output with owners, dates, evidence, and unknowns (`TBD`) explicit. Preserve this skill's output contract. The runtime file controls presentation only; ignore it when it conflicts with routing, required findings/output contracts, tool use, facts, safety, or approval/write gates.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Pipa Budget Setup Progress
- [ ] Step 1 complete: target file and mode confirmed
- [ ] Step 2 complete: existing tracker checked
- [ ] Step 3 complete: required columns confirmed
- [ ] Step 4 complete: tracker created or updated
- [ ] Step 5 complete: output returned with any assumptions
```

Do not skip steps.

## Step 1: Confirm target and mode

Default target file: `.agents/project-budget.md`

Modes:

1. `create` - create a new tracker with starter rows or placeholders
2. `update` - update an existing tracker while preserving untouched rows

If the user names a different path, use that path. Prepare the proposed tracker content first. Immediately before creating or updating it, request explicit approval scoped to the exact action, path, and proposed content; the request to set up a budget is not write approval.

## Step 2: Check for an existing tracker

- If the target file exists, read it first and preserve existing rows unless the user asks to replace them.
- If it does not exist, prepare it using the template in Step 4 and wait for the scoped write approval.

Update safety rules:

- In `update` mode, do not reorder existing columns unless the user requests a schema change.
- In `update` mode, do not modify existing row values unless the user requested that exact edit.
- If both an add-row request and an edit-row request appear, process only explicit edits and keep all other values unchanged.

## Step 3: Use simple column set

Use this default column set unless the user specifies otherwise:

- `Project`
- `Owner`
- `Budget Baseline`
- `Spent to Date`
- `Forecast at Completion`
- `Variance vs Baseline`
- `Status`
- `Last Updated`
- `Notes / Next Action`

Status values:

- `on-track`
- `watch`
- `at-risk`

Column contract:

- If the user does not ask for custom columns, keep the default names exactly as listed.
- If the user asks for custom columns, keep defaults unless replacement is explicitly requested.

## Step 4: Prepare, then create or update the tracker

Use this structure:

```md
# Project Budget Tracker

Lightweight budget tracker. One row = one project.

| Project | Owner | Budget Baseline | Spent to Date | Forecast at Completion | Variance vs Baseline | Status | Last Updated | Notes / Next Action |
|---------|-------|-----------------|---------------|------------------------|----------------------|--------|--------------|---------------------|
| TBD | TBD | TBD | TBD | TBD | TBD | watch | YYYY-MM-DD | Add first project values |
```

If user-provided project data is available, populate rows immediately. Otherwise keep `TBD` placeholders.

Row rules:

- one project per row
- no multi-project rows
- keep placeholders as `TBD` when data is unknown

## Step 5: Return concise output

Return:

- proposed path before approval, then created/updated path or failure after an approved write
- columns used
- number of project rows currently in the table
- any assumptions or `TBD` fields still needed

Row count rule:

- count only project data rows
- do not count the header row or separator row

Recommended response shape:

```md
- Path: <path>
- Columns: <comma-separated list>
- Project rows: <count>
- Missing fields: <brief list by project or `none`>
```

## Rules

- Keep the tracker lightweight; avoid adding advanced finance fields unless asked.
- Do not invent budget numbers; use `TBD` when unknown.
- Preserve existing project names and values exactly unless the user requests edits.
- Keep date format as `YYYY-MM-DD`.
- Read-only file checks and tracker preparation do not require approval and must not be blocked on write permission; immediately before every file or external write, request separate explicit approval scoped to that exact action, destination, and proposed content, without inferring it from a request to prepare or set up a budget or reusing approval for another write; after each approved write, report success or failure and include the resulting path, link, or stable ID when available.

## Quick examples

- If asked to initialize only: create table with placeholders and no invented values.
- If asked to add a project: append one row; keep existing rows exactly as they are.
- If asked to use another path: apply same tracker structure at that path.
