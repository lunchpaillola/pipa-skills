# Contributing

Thanks for your interest in contributing to Pipa Skills.

## PM Workflow Changes

New project-management or delivery workflows normally belong inside `skills/pipa/`:

1. Add or update the relevant Pipa command route in `skills/pipa/SKILL.md` when the public command surface changes.
2. Put detailed workflow instructions in `skills/pipa/references/` so the entry skill stays concise.
3. Add or update lightweight evals under `skills/pipa/evals/` for command routing, natural-language routing, and safety gates.
4. Update `README.md` when the public command surface changes.

Do not add a new public top-level PM skill for routine lifecycle work. Pipa is the PM entry point.

## Standalone Skills

Create or preserve a standalone skill only when the workflow is high-value, tool/product-specific, safety-sensitive, or independently discoverable.

Current standalone breakouts are:

- `pipa-audio-brief`
- `composio`
- `pipa-triggers`

When adding a standalone skill:

1. Create `skills/<skill-name>/SKILL.md` first.
2. Use lowercase kebab-case for the directory name.
3. Keep the `name` frontmatter field identical to the directory name.
4. Write a concrete trigger description that says when the skill should be used.
5. Add `references/`, `scripts/`, `assets/`, or `evals/` only when useful.
6. Update `README.md`.

## Skill Structure

```text
skills/your-skill-name/
  SKILL.md
  references/
  scripts/
  assets/
  evals/
```

## Guidelines

- Keep Pipa concise; move detailed instructions into references.
- Keep standalone workflows narrow, reusable, and outcome-oriented.
- Prefer practical workflows over theory-heavy notes.
- Avoid sensitive data, proprietary customer context, or private credentials.
- Keep public evals generic; put client-specific evals under `skills/<skill-name>/evals/private/`.
- Preserve safety gates, setup checks, confirmations, blockers, and output contracts when Pipa routes into standalone skills.
- If a change overlaps heavily with an existing Pipa route, improve that route instead of adding a duplicate.
- Do not bump `metadata.version` or `VERSIONS.md` during draft or branch work; version bumps happen when finalizing for merge to `main`.

## Pull Requests

When submitting a change:

- explain which workflow or command changed
- include a clear trigger/routing description
- keep the scope focused
- add or update eval coverage for behavior changes
- update docs when the public surface changes

## Questions

Open an issue if you want to propose a new command, reference, or standalone breakout before writing it.
