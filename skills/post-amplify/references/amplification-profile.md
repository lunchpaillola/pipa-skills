# Amplification Profile

The amplification profile is optional, lightweight memory for destination and attribution defaults. It is not a taste model, CRM, analytics store, or content archive.

## Allowed Fields

Remember only:

- canonical site or domain
- attribution line
- enabled destinations
- disabled destinations
- adapter availability, such as scheduler-ready, direct-schedule, direct-post, draft-only, manual-import, discovery-only, manual-community, unsupported, or unknown

Do not store OAuth tokens, refresh tokens, API keys, cookies, private messages, raw tool responses, full post content, private community names, or account IDs/handles unless the user explicitly approves storing a specific field.

## Opportunistic Use

On first run, infer temporary defaults from the source and request only missing essentials. Do not force profile setup before producing an amplification plan.

When a run reveals useful defaults, report suggested profile deltas in the run report. Durable persistence requires explicit opt-in confirmation.

## Persistence Locations

Use existing local context only:

1. `.agents/project-context.md` when it already exists and the values are workspace-wide.
2. `.agents/flow-projects/<project-slug>/flow-project-context.md` when a project-specific context pack already exists and is active.
3. Run-scoped memory when neither context location exists or the user has not approved durable persistence.

Never write profile data into `skills/post-amplify/`, public evals, README, docs, plans, or other public repository files. Do not create a new profile schema or storage file unless the user explicitly asks for durable setup.

## Profile Safety Checks

- Show what will be remembered, where it will be stored, and how the user can opt out or delete it.
- If a stored attribution line appears to belong to a different canonical site than the source, ask before reusing it.
- If a destination is disabled, skip it even when the post fits.
- If adapter availability is unknown, mark it as requiring verification or manual fallback rather than executable.
- Keep account identity confirmation in the amplification plan, not hidden profile memory, unless the user explicitly approves storing it.

## Run Report Profile Section

Include a short `Profile deltas` section:

- `remembered`: values saved after explicit approval
- `suggested`: values inferred but not persisted
- `skipped`: values not stored because no safe context location or approval exists
- `opt-out`: how to remove or avoid future memory when applicable
