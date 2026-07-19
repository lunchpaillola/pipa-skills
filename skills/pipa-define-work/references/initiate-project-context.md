> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Initiate Project Context Reference

You create and maintain a layered context system for Pipa work:

- workspace router: `.agents/project-context.md`
- project pack: `.agents/flow-projects/<project-slug>/flow-project-context.md`

The workspace router is the front door. It tells Pipa skills which project is active, which project packs exist, and where to look next.

The project pack is the reusable per-project context. Keep it compact and operational. It should help downstream skills quickly find tools, sources, and the most important working memory for that project.

Communication style contract: when returning user-facing updates, briefs, or summaries, apply `skills/pipa/references/communication-style.md`.

## Workflow

Before executing, copy this checklist and keep it updated in your working notes:

```text
Project Context Progress
- [ ] Step 1 complete: context mode and target resolved
- [ ] Step 2 complete: existing workspace/project context checked
- [ ] Step 3 complete: required sections gathered (or marked TBD)
- [ ] Step 4 complete: workspace router and/or project pack created or updated
- [ ] Step 5 complete: adjustments confirmed and final save done
```

Do not skip steps. Do not save a partial final document.

## Step 1: Resolve mode and target

Always determine whether the user wants:

1. workspace-level context
2. project-specific context
3. both

Default resolution rules:

- If the user clearly asks for portfolio-wide, workspace-wide, shared, or overall context, use `workspace` mode.
- If the user clearly names one project, use `project` mode.
- If the user asks for project context but does not name the project, inspect the workspace router and project-pack directory first.
- If multiple existing projects are available and the request is ambiguous, list the projects and ask which one to use with the `question` tool.
- If there are no project packs yet and the request is ambiguous, ask whether to create:
  - the workspace router
  - a new project pack
  - both

Use these paths:

- workspace router: `.agents/project-context.md`
- project packs root: `.agents/flow-projects/`
- project file: `.agents/flow-projects/<project-slug>/flow-project-context.md`

Slug rules:

- use lowercase kebab-case for `<project-slug>`
- preserve the display name exactly as the user provides it inside the document
- never rename an existing slug unless the user explicitly asks

## Step 2: Check existing context

Always check for these before drafting:

- `.agents/project-context.md`
- `.agents/flow-projects/`
- the target project pack if a project is already known

If the workspace router exists:

- read it first
- summarize the active project, project catalog, and any existing routing rules
- preserve untouched sections exactly when updating

If the target project pack exists:

- read it before asking questions
- summarize what is already captured
- gather only missing or changed sections
- preserve untouched sections exactly as-is, including headings, order, and wording

If the user names a project that does not exist yet:

- create a new project pack for that project
- if the workspace router exists, add or update the catalog entry for the project
- if the workspace router does not exist and project-specific work is requested, create a minimal router as part of the same run

## Step 3: Gather information

If usable repo artifacts exist, default to auto-draft.

If no usable artifacts exist, or if the user prefers, gather context conversationally.

Use the `question` tool for targeted follow-ups.

### Auto-draft path

1. Read available repo artifacts, docs, plans, notes, trackers, and existing context files.
2. Draft only from facts you can see.
3. Mark unknowns as `TBD`.
4. Ask targeted follow-up questions only for missing essentials.
5. Ask what needs correction before final save.

### Conversational path

- Ask one section at a time.
- Do not ask for every section in one turn.
- If the user answers multiple sections at once, acknowledge them, but confirm section-by-section before moving on.
- Continue until the section is complete or clearly marked `TBD`.

### Required questions for workspace mode

When drafting or refining the workspace router, confirm:

- what this workspace context is for
- who uses it most
- which project should be treated as the active/default project
- what projects should appear in the catalog
- which shared tools or MCP/Composio toolkits are used across projects
- what shared routing rules or cross-project norms matter

### Required questions for project mode

When drafting or refining a project pack, confirm:

- project display name
- project objective / one-line summary
- current phase
- primary stakeholders and decision owner
- tools used in this project
- key sources to check for this project
- important things future runs should remember

For the `Tools` section in project mode, always ask explicitly:

- which Composio toolkit or MCP path should be used first
- what each tool is used for
- priority (`primary` | `secondary` | `fallback`)
- access status (`connected` | `partial` | `not-connected` | `unknown`)
- fallback/manual path if the tool is unavailable

For the `Sources` section in project mode, always ask explicitly:

- where the agent should look first for project truth
- what each source is best for
- trust level (`high` | `medium` | `low`)
- whether the source is in-repo, connected via tool, or manual only

No-signal fallback (required): if there are no usable repository artifacts and the user cannot provide enough details to establish the requested context, return `blocked` and do not save a fabricated finished document.

For a blocked `workspace` response, ask only for the minimum needed:

- workspace purpose
- who uses the context most
- active project or whether none exists yet
- at least one project name or confirmation this is router-only for now

For a blocked `project` response, ask only for the minimum needed:

- project name
- one-line objective
- current phase or target timeline
- main decision owner
- at least one tool or one source-of-truth location

## Step 4: Create or update the documents

### Workspace router template

Create or update `.agents/project-context.md` using this structure:

```md
# Project Context

*Last updated: [date]*

## Workspace Overview
- Workspace purpose:
- Context used for:
- Primary users:

## Active Project
- Default active project:
- Why this project is active now:

## Project Catalog
| Project | Slug | Project context path | Status | Notes |
|---------|------|----------------------|--------|-------|
| | | | | |

## Shared Tools and Access
| Tool/system | Composio toolkit or MCP path | Use for | Default priority | Access notes | Fallback path |
|-------------|-------------------------------|---------|------------------|--------------|---------------|
| | | | | | |

## Shared Sources and Routing Rules
- Read this file first for workspace-level Pipa work.
- If a request names a project, read that project's pack next.
- If a request is ambiguous and multiple projects exist, ask which project the work is about.
- Project-pack root: `.agents/flow-projects/`
- Slug rules:
- Additional routing notes:

## Shared Working Memory
- Cross-project norms:
- Important reminders:
- Portfolio-wide constraints:

## Open Questions and Next Actions
- Open questions:
- Next actions:
```

### Project pack template

Create or update `.agents/flow-projects/<project-slug>/flow-project-context.md` using this structure:

```md
# Flow Project Context - <project display name>

*Last updated: [date]*

## Project Summary
- Project name:
- Project slug:
- One-line objective:
- Current phase:

## Goals and Success Criteria
- Primary outcomes:
- Success signals:

## Stakeholders and Decision Roles
| Role | Name | Responsibility | Decision authority |
|------|------|----------------|--------------------|
| | | | |

## Scope, Assumptions, Constraints
- In scope:
- Out of scope:
- Assumptions:
- Constraints:

## Tools
| Tool/system | Composio toolkit or MCP path | Use for | Priority (`primary`|`secondary`|`fallback`) | Access status (`connected`|`partial`|`not-connected`|`unknown`) | Access owner | Fallback/manual path |
|-------------|-------------------------------|---------|-----------------------------------------------|---------------------------------------------------------------|--------------|----------------------|
| | | | | | | |

## Sources
| Source | Path or system | Purpose | Trust level (`high`|`medium`|`low`) | Access mode (`repo`|`connected-tool`|`manual`) | Notes |
|--------|----------------|---------|--------------------------------------|-----------------------------------------------|-------|
| | | | | | |

## Working Memory
- Important decisions to remember:
- Stakeholder preferences:
- Delivery norms and quality expectations:
- Recurring gotchas / reminders:

## Open Questions and Next Actions
- Open questions:
- Next actions:
```

### Coupling rules

- In `workspace` mode, update only the workspace router unless the user explicitly asks for project-pack work too.
- In `project` mode, update the target project pack first, then ensure the workspace router points to it.
- When updating the workspace router from project mode, keep changes minimal:
  - add/update the project catalog row
  - update the active project only if the user implies it should become active
- Never rewrite unrelated project catalog entries.

## Step 5: Confirm and save

- Show the completed document or a concise diff summary.
- Ask one targeted adjustment question using the `question` tool.
- Before final save, run a required-section presence check for the relevant mode:
  - workspace mode: all 6 workspace sections
  - project mode: all 8 project-pack sections
- Fill missing essentials or mark them `TBD` before save.

Save paths:

- workspace router: `.agents/project-context.md`
- project pack: `.agents/flow-projects/<project-slug>/flow-project-context.md`

Tell the user:

- workspace mode: "Other Pipa skills should still read `.agents/project-context.md` first. That file now routes them to project packs when needed."
- project mode: "Other Pipa skills should read `.agents/project-context.md` first, then this project's pack when the work is project-specific."

## Output contract

When creating or updating workspace context, always include:

- mode used: `workspace`
- save path: `.agents/project-context.md`
- whether this was auto-drafted or section-by-section intake
- remaining `TBD` items
- whether project catalog entries were added or changed

When creating or updating project-specific context, always include:

- mode used: `project`
- project name and slug
- project-pack save path
- whether the workspace router was also created or updated
- remaining `TBD` items

When the request is ambiguous, always include a clarification question with the `question` tool before saving anything project-specific.

## Rules

- Use factual language and avoid invented details.
- Keep unknowns visible as `TBD`.
- Keep the workspace router lightweight and routing-focused.
- Keep project packs compact and reusable.
- Preserve exact stakeholder names, tool names, and project terms when provided.
- For tools, always capture use, priority, access status, and fallback/manual path.
- For sources, always capture purpose and trust level.
- If you are only updating one or two sections, preserve untouched sections exactly.
