# Agent Notes

This repository stores Pipa skills for AI agents. Pipa is the primary PM brain and command router for project delivery work.

## Expectations

- Keep skill names stable once published.
- Version skills in `SKILL.md` frontmatter under `metadata.version` and bump on every published behavior change.
- Versioning policy: do not bump `VERSIONS.md` or `metadata.version` during draft/branch work. Only bump versions when changes are being finalized for merge to `main` (published state).
- Prefer broadly reusable workflows over company-specific process details.
- Keep proprietary orchestration, customer context, and private integrations out of this repo.
- When adding a skill, create `skills/<skill-name>/SKILL.md` first and add supporting material only as needed.
- Update public inventory docs when a migration reaches its public-cutover slice; do not expose partial operation inventories early.
- Keep public eval artifacts generic; store client-specific eval prompts/data in `skills/<skill-name>/evals/private/` (gitignored).
- For connected-tool workflows, especially Composio-backed ones, prefer concise provenance in the skill contract: name the tools used and cite the specific record IDs, doc names, links, or references that materially support the answer.
- Pipa's core router lives in `skills/pipa/`. The six business lanes are broad entry surfaces; meta surfaces route Pipa configuration and utilities.
- A substantial, independently invokable workflow belongs in a narrowly described operation skill. Its skill owns the workflow, output contract, safety rules, and local positive/negative evals.
- Generic business language enters a lane. Explicit operation invocation wins; otherwise the lane selects one operation and preserves the user's business objective.
- References are non-routing assets such as templates, schemas, examples, source-handling rules, and shared presentation guidance. Do not keep promoted workflow bodies or fallback copies in lanes or references.
- Preserve `pipa-audio-brief`, `composio-mcp`, and `pipa-triggers` as standalone breakouts unless a future plan explicitly changes that architecture.
- Keep routers and lanes concise. Route to an operation by skill name and fail clearly when it is unavailable instead of embedding a compatibility copy.
- `docs/solutions/` stores documented solutions to past problems (bugs, best practices, workflow patterns), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`); relevant when implementing or debugging in documented areas.
