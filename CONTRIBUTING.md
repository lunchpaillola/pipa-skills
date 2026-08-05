# Contributing

Thanks for your interest in contributing to Pipa Skills.

## Pipa Architecture

Pipa uses four skill roles:

- The root router selects a business lane, meta surface, operation, or specialized capability.
- The six business lanes are broad automatic entry surfaces for generic business language.
- Meta surfaces route configuration and utility work.
- Narrow operation skills own substantial workflows. Specialized capabilities own tool/product-specific or safety-sensitive jobs.

Explicit operation invocation wins. Otherwise a lane selects one operation while preserving the business objective.

## Operation Skills

Create an operation skill when a workflow is substantial and has a distinct trigger boundary:

1. Create `skills/<operation-name>/SKILL.md` first.
2. Use lowercase kebab-case for the directory name.
3. Keep the `name` frontmatter field identical to the directory name.
4. Keep the description routing-only: `Use only when <operation> is explicitly invoked or <owner> delegates to it. Do not trigger from generic language.`
5. Put the workflow, output contract, and safety rules in the operation skill.
6. Add local positive cases that explicitly name the operation, adjacent generic-language negatives, and behavior evals.
7. Route the owning lane or meta surface to the operation by name.
8. Delete the migrated workflow reference. Do not retain an inline fallback or compatibility copy.

Use references only for non-routing assets such as templates, schemas, examples, source-handling rules, and shared presentation guidance. Update public inventory docs in the planned public-cutover slice rather than exposing a partial migration.

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

- Keep routers and lanes concise; operation skills own detailed workflow behavior.
- Keep operation and specialized-capability workflows narrow, reusable, and outcome-oriented.
- Prefer practical workflows over theory-heavy notes.
- Avoid sensitive data, proprietary customer context, or private credentials.
- Keep public evals generic; put client-specific evals under `skills/<skill-name>/evals/private/`.
- Preserve safety gates, setup checks, confirmations, blockers, and output contracts when promoting a workflow.
- Fail clearly when an operation is unavailable; never execute a copied fallback workflow from a router or lane.
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
