# Destination Types And Adapters

Use destination types as the stable planning layer. Use adapters only when a specific platform, scheduler, or connected tool is verified.

## Destination Types

| Type | Purpose | Typical output |
|---|---|---|
| Repost destination | Share, submit, or republish the source where the audience overlaps | Ranked channel recommendation with timing notes |
| Article syndication | Full or near-full repost with canonical attribution | Platform-specific manual import package or draft plan |
| Social share | Short link/share post that points to the canonical source | Suggested channel and angle, not full copy unless requested |
| Answer opportunity | Public question or discussion the piece can help answer | Opportunity link, rationale, and manual answer angle |
| Community venue | Forum, subreddit, Slack, Discord, or niche group | Etiquette notes and manual-only participation guidance |
| Scheduler queue | Reminder or scheduled distribution item | Structured queue item for a scheduler adapter |

## Adapter Capabilities

- `planning-only`: can recommend actions but cannot execute.
- `scheduler-ready`: can produce structured entries for another scheduler or queue.
- `direct-schedule`: can schedule after approval, verified account, verified tool/schema, and payload confirmation.
- `direct-post`: can publish externally after approval, verified account, verified tool/schema, and payload confirmation.
- `draft-only`: can create a remote draft after approval; remote drafts are external writes.
- `manual-import`: cannot safely create external content; returns copy/paste or import-ready output.
- `discovery-only`: can perform read-only public discovery under source/privacy rules; no remote write.
- `manual-community`: returns guidance and local drafts only; no posting/commenting/submitting.
- `unsupported`: no workflow beyond noting the blocker.
- `unknown`: requires capability verification before a plan can treat it as executable.

## Scheduler Adapter Contract

Scheduler-ready entries should include:

- channel
- publish window
- URL
- campaign label
- short angle or hook
- recurrence timing
- status: planned, ready for approval, queued, scheduled, manual, skipped, or blocked

Do not depend on a specific scheduler. A Buffer-compatible adapter, calendar adapter, task-manager adapter, or local reminder system can translate the same queue item into its own command or payload.

Buffer-compatible tooling may be third-party or direct API based. Do not assume an official Buffer CLI exists. Verify tool provenance, connected account, supported action, and schema before execution.

## Adapter Contract

Every adapter entry or inferred adapter must state:

- destination type
- capability
- action kind: planning, public publish, remote draft, schedule, read-only discovery, manual import, or local guidance
- required inputs
- canonical metadata or visible attribution behavior
- auth, account, app, tool, and permission requirements
- connected-tool verification steps when applicable
- fallback output
- execution evidence to include in the run report

## Capability Verification

Do not assume a platform has a posting API or that a connected tool can perform the needed action. At execution time:

1. Search for the app/tool or use previously verified app/tool information.
2. Confirm connected account status and target account identity.
3. Inspect the action schema or documented required fields.
4. Confirm draft, schedule, and public publish behavior.
5. Downgrade to manual fallback when any required part cannot be verified.

When using Composio or another connected-tool layer, follow search -> link -> execute discipline and never guess tool slugs.

## Execution Evidence

For write-capable or schedule-capable adapters, record a per-run ledger before execution:

- destination
- verified account/profile when available
- action kind
- canonical URL
- publish window if scheduling
- payload hash or equivalent fingerprint when a payload exists
- status before execution

After execution, report completed URLs/IDs, queued/scheduled IDs, created draft IDs/URLs, manual output generated, blocker reason, or unknown result. Never blindly retry a remote write after timeout or unknown result; verify the matching draft/post/scheduled item when supported or ask before retrying.
