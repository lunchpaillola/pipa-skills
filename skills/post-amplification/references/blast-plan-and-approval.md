# Blast Plan And Approval

The blast plan is the user's approval surface. It must be specific enough that approval authorizes exact actions, not a vague campaign idea.

## Blast Plan Contents

Include:

- source title, canonical URL, and source status
- classification and why it affects destination fit
- profile used, including run-scoped assumptions and disabled destinations
- destinations to execute, grouped by destination type
- skipped destinations with reasons
- manual fallbacks
- discovery actions and privacy status
- action kind for each destination: read-only discovery, remote draft, public publish, manual import, local draft, or blocked
- verified destination account/profile when available
- exact write payload, or exact diff from canonical source for minimal-rewrite adapters
- attribution and expected visibility
- material risks, blockers, and required setup

Do not return a generic blog-promotion checklist as the main output.

## Approval Semantics

After the plan is shown, the user can approve:

- the whole plan
- a named subset of destinations
- local/manual outputs only

Approval must be explicit. “Post this everywhere now” is not enough until the destination/action/account/payload plan has been shown and approved.

Any material change requires renewed approval:

- destination
- account/profile/page/org
- action kind
- remote draft vs public publish state
- payload, source diff, headline, attribution, or canonical URL
- expected visibility

Remote draft creation is an external write and uses the same approval gate as publishing.

## External Action Categories

| Category | Before blast-plan approval? | Rules |
|---|---:|---|
| Public read-only discovery from already-public source | Allowed | Do not disclose private source/profile data. Keep queries narrow and relevant. |
| Authenticated/private reads | Setup confirmation required | Confirm app/account and the reason for the read. |
| Derived search from private/unpublished material | Permission required | Ask before sending title, excerpt, keywords, or summaries externally. |
| Remote draft creation | No | Requires approved plan and connected-account confirmation. |
| Public publish | No | Requires approved plan and connected-account confirmation. |
| Community interaction | No in V1 | Reddit/HN/forums/Slack/Discord remain discovery/manual-only. |

Scheduling is out of scope for V1. If requested, report it as a manual or future automation follow-up, not part of the approved blast run.

## Connected Account Confirmation

Before any write adapter executes, confirm:

- verified app/tool
- target account identity, handle, org, or page when available
- action kind
- required permission/scope information when available
- draft vs public publish behavior

If account identity cannot be verified, mark the destination `blocked-auth` or `manual`.

## Destination Statuses

- `planned`
- `skipped`
- `awaiting approval`
- `approved`
- `executing`
- `completed`
- `manual`
- `failed`
- `blocked-auth`
- `blocked-source`
- `not-approved`

## Failure Handling

Source validation failure blocks all external writes. Destination-level auth/tool/platform failures block only that destination when the source remains usable.

After timeout or unknown result from a remote write, do not blindly retry. Verify the matching draft/post where supported or ask the user before retrying.

## Run Report Contents

Return:

- completed posts/drafts with URLs or IDs when available
- manual outputs generated
- skipped destinations and reasons
- failed destinations and next actions
- unapproved destinations
- discovery results
- profile deltas: remembered, suggested, skipped, and opt-out/delete guidance
- provenance for successful connected-tool actions, such as app/tool/action and material record IDs or links
