# Amplification Plan And Approval

The amplification plan is the user's planning surface. It should be useful without requiring execution approval. Approval is only needed when the user asks for external writes, remote draft creation, scheduler queueing, public publishing, or connected-tool execution.

## Plan Contents

Include:

- source title, URL, and source status
- classification and why it affects destination fit
- run-scoped assumptions, preferred channels, and disabled destinations
- requested mode or default all-mode behavior
- discover recommendations grouped by destination type
- answer opportunities, search queries, and privacy status
- distribution cadence and scheduler-ready items when applicable
- skipped or downranked destinations with reasons
- manual fallbacks
- material risks, blockers, and required setup

Do not return a generic blog-promotion checklist as the main output.

## Approval Semantics

Planning, public read-only discovery, and local scheduler-ready output do not require publish approval when the source is already public.

Explicit approval is required before:

- external scheduling
- external draft creation
- public publishing
- posting or submitting links
- commenting or answering through connected tools
- authenticated/private reads
- any remote write

After an execution plan is shown, the user can approve:

- the whole execution plan
- a named subset of destinations or scheduled items
- local/manual outputs only

Approval must be explicit. “Post this everywhere now” is not enough until the destination/action/account/payload or scheduler item has been shown and approved.

Any material change requires renewed approval:

- destination
- account/profile/page/org
- action kind
- remote draft vs scheduled item vs public publish state
- payload, source diff, headline, attribution, canonical URL, or publish window
- expected visibility

Remote draft creation and scheduler queueing are external writes and use the same approval gate as publishing.

## External Action Categories

| Category | Before execution approval? | Rules |
|---|---:|---|
| Local planning | Allowed | No external writes. |
| Public read-only discovery from already-public source | Allowed | Do not disclose private source/profile data. Keep queries narrow and relevant. |
| Local scheduler-ready queue items | Allowed | Structured output only; not queued externally. |
| Authenticated/private reads | Setup confirmation required | Confirm app/account and the reason for the read. |
| Derived search from private/unpublished material | Permission required | Ask before sending title, excerpt, keywords, or summaries externally. |
| Remote draft creation | No | Requires approved plan and connected-account confirmation. |
| External scheduling | No | Requires approved plan, verified scheduler/tool, and connected-account confirmation. |
| Public publish | No | Requires approved plan and connected-account confirmation. |
| Community interaction | No by default | Reddit/HN/forums/Slack/Discord remain discovery/manual-only unless explicitly requested and safely supported. |

## Connected Account Confirmation

Before any write or scheduler adapter executes, confirm:

- verified app/tool
- target account identity, handle, org, or page when available
- action kind
- required permission/scope information when available
- draft, schedule, and public publish behavior

If account identity cannot be verified, mark the destination `blocked-auth` or `manual`.

## Destination Statuses

- `planned`
- `skipped`
- `awaiting approval`
- `approved`
- `queued`
- `scheduled`
- `executing`
- `completed`
- `manual`
- `failed`
- `blocked-auth`
- `blocked-source`
- `not-approved`

## Failure Handling

Source validation failure blocks all external writes. Destination-level auth/tool/platform failures block only that destination when the source remains usable.

After timeout or unknown result from a remote write or scheduler action, do not blindly retry. Verify the matching draft/post/scheduled item where supported or ask the user before retrying.

## Run Report Contents

Return:

- completed posts/drafts with URLs or IDs when available
- queued or scheduled items with URLs/IDs when available
- manual outputs generated
- skipped destinations and reasons
- failed destinations and next actions
- unapproved destinations
- discovery results
- provenance for successful connected-tool actions, such as app/tool/action and material record IDs or links
