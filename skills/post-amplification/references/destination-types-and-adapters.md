# Destination Types And Adapters

Use destination types as the stable planning layer. Use adapters as capability records for specific platforms or workflows.

## Destination Types

| Type | Purpose | Typical output |
|---|---|---|
| Article syndication | Full or near-full repost with canonical attribution | Platform article/draft or manual import package |
| Social broadcast | Short link/share post that points to the canonical source | Feed post draft or approved publish payload |
| Demand discovery | Read-only search for recent demand or questions | Opportunity links and local answer-shaped drafts |
| Manual community | Human-reviewed community participation | Notes, links, and local drafts only |

## Adapter Capabilities

- `direct-post`: can publish externally after approval, verified account, verified tool/schema, and payload confirmation.
- `draft-only`: can create a remote draft after approval; remote drafts are external writes.
- `manual-import`: cannot safely create external content; returns copy/paste or import-ready output.
- `discovery-only`: can perform read-only public discovery under source/privacy rules; no remote write.
- `manual-community`: returns guidance and local drafts only; no posting/commenting/submitting.
- `unsupported`: no V1 workflow beyond noting the blocker.
- `unknown`: requires capability verification before plan approval can treat it as executable.

## Adapter Contract

Every adapter entry or inferred adapter must state:

- destination type
- capability
- action kind: public publish, remote draft, read-only discovery, manual import, or local draft
- required inputs
- canonical metadata or visible attribution behavior
- auth, account, app, tool, and permission requirements
- connected-tool verification steps when applicable
- fallback output
- execution evidence to include in the run report

## Execution Evidence

For write-capable adapters, record a per-run ledger before execution:

- destination
- verified account/profile when available
- action kind
- canonical URL
- payload hash or equivalent fingerprint
- status before execution

After execution, report completed URLs/IDs when available, created draft IDs/URLs when available, manual output generated, blocker reason, or unknown result. Never blindly retry a remote write after timeout or unknown result; verify the matching draft/post when supported or ask before retrying.

## Capability Verification

Do not assume a platform has a posting API or that a connected tool can perform the needed action. At execution time:

1. Search for the app/tool or use previously verified app/tool information.
2. Confirm connected account status and target account identity.
3. Inspect the action schema or documented required fields.
4. Confirm draft vs public publish behavior.
5. Downgrade to manual fallback when any required part cannot be verified.

When using Composio, follow search -> link -> execute discipline and never guess tool slugs.
