# Agent Notes

This repository stores Pipa skills for AI agents. Pipa is the primary PM brain and command router for project delivery work.

## Expectations

- Keep skill names stable once published.
- Version skills in `SKILL.md` frontmatter under `metadata.version` and bump on every published behavior change.
- Versioning policy: do not bump `VERSIONS.md` or `metadata.version` during draft/branch work. Only bump versions when changes are being finalized for merge to `main` (published state).
- Prefer broadly reusable workflows over company-specific process details.
- Keep proprietary orchestration, customer context, and private integrations out of this repo.
- When adding a skill, create `skills/<skill-name>/SKILL.md` first and add supporting material only as needed.
- When adding or removing skills, update `README.md` to reflect the current repository state.
- Keep public eval artifacts generic; store client-specific eval prompts/data in `skills/<skill-name>/evals/private/` (gitignored).
- For connected-tool workflows, especially Composio-backed ones, prefer concise provenance in the skill contract: name the tools used and cite the specific record IDs, doc names, links, or references that materially support the answer.
- Pipa's core router lives in `skills/pipa/`; business lanes and meta surfaces live as standalone `pipa-*` skills when they are independently discoverable operating jobs.
- Reserve additional standalone skills for high-value, tool/product-specific, safety-sensitive, or independently discoverable workflows.
- Preserve `pipa-audio-brief`, `composio`, and `pipa-triggers` as standalone breakouts unless a future plan explicitly changes that architecture.
- Keep `skills/pipa/SKILL.md` concise. Put lane-specific behavior in the standalone lane skill first; use `skills/pipa/references/` for router help, compatibility, and shared legacy method references.
- `docs/solutions/` stores documented solutions to past problems (bugs, best practices, workflow patterns), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`); relevant when implementing or debugging in documented areas.
