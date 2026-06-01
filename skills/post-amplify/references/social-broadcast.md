# Social Broadcast

Social broadcast covers short feed posts that point back to the canonical source. In the default workflow, recommend channels and angles without generating full social copy unless the user asks for it or approves execution planning that requires an exact payload.

## General Rules

- Keep posts short and source-faithful.
- Link to the canonical URL.
- Do not invent claims, metrics, quotes, testimonials, or urgency.
- Distinguish public publish, scheduled item, remote draft, and manual output in the amplification plan.
- Verify current tool capability, account identity, and schema before any write.

## V1 Candidate Adapters

| Adapter | Capability posture | Notes |
|---|---|---|
| X | Verified `direct-post` or manual fallback | Respect OAuth scopes, access tier, rate limits, and quote/repost constraints at execution time. |
| LinkedIn feed | Verified `direct-post`, `draft-only`, or manual fallback | Use current Posts API/tool patterns; do not assume deprecated `ugcPosts` behavior. Confirm person/org/page target. |
| Bluesky | Verified `direct-post` or manual fallback | Confirm account and payload schema before write. |
| Mastodon | Verified `direct-post` or manual fallback | Confirm instance/account and visibility. |

Do not author generic future-feed playbooks in V1. Use the adapter contract for unlisted destinations.

## Broadcast Package

For each social destination, show:

- short angle by default, or exact post text when requested/needed for approval
- canonical URL
- account/profile/page when verified
- visibility
- action kind: remote draft, scheduled item, public publish, or manual
- payload changes that would require renewed approval

## Fit Rules

Skip or downgrade when:

- the post requires unsupported thread/carousel/newsletter transformation
- the destination is disabled in profile
- account identity or write capability cannot be verified
- the generated post would overstate the source or become engagement bait
