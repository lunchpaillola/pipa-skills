# 03-27 Lessons from Building Skills (Claude Code)

## Source Context

Notes captured from Anthropic's public write-up on lessons learned from running skills at scale in Claude Code.

## Core Takeaways

- Skills are folders, not just markdown. Treat `references/`, `scripts/`, and `assets/` as part of context engineering.
- The strongest skills usually fit one job type clearly; mixed-purpose skills tend to underperform and confuse triggering.
- The `description` field is for model triggering. Write it as "when to use this" with concrete phrases.
- "Gotchas" are the highest-signal section. Keep updating them from real failure cases.
- Do not waste space on obvious defaults. Focus on non-obvious constraints, edge cases, and org-specific rules.
- Avoid over-railroading. Give enough structure for reliability while preserving flexibility.
- Include setup patterns when environment context matters (tool IDs, channels, workspace paths, config files).
- Use progressive disclosure to keep core skill concise and move details into referenced files.
- Store durable memory in stable storage if needed; do not assume skill directory data survives upgrades.
- Provide scripts/helpers for repetitive deterministic steps so the model can focus on decisions and orchestration.
- On-demand hooks are useful for safety-critical contexts without forcing strict behavior globally.
- Curate before sharing. Redundant or overlapping skills reduce quality and trigger reliability.
- Skill composition works: entrypoint workflow skills can route into focused sub-skills.
- Measure usage and undertriggering with lightweight instrumentation where possible.

## Skill Type Taxonomy (Observed)

1. Library/API reference
2. Product verification
3. Data fetching and analysis
4. Business process and team automation
5. Code scaffolding and templates
6. Code quality and review
7. CI/CD and deployment
8. Runbooks
9. Infrastructure operations

## Practical Implications for This Repo

- Keep stage entry points clean (`pm-initiate`, `pm-plan`, `pm-execute`, `pm-monitor`, `pm-close`).
- Use focused PM sub-skills under stage entry points (for example intake triage under monitor).
- Add/maintain gotchas after each live run to improve reliability over time.
- Keep workflow outputs explicit and operational (owners, next actions, closure states).
- Keep tool/MCP setup explicit in connector configuration so downstream skills can run predictably.
