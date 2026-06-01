# Article Syndication

Article syndication covers full-post or near-full-post reposting with canonical attribution.

## General Rules

- Require canonical URL or attribution target before external draft or publish.
- Preserve the source title/body unless the platform requires formatting, frontmatter, canonical metadata, or visible attribution.
- Prefer canonical metadata when the platform supports it; include visible attribution when it does not.
- Do not promise direct posting unless tool/app capability, connected account, account identity, schema, and draft/publish behavior are verified at execution time.

## V1 Candidate Adapters

| Adapter | Capability posture | Attribution behavior | Fallback |
|---|---|---|---|
| Dev.to / Forem-style | Candidate `direct-post` or `draft-only` when verified | Use canonical URL field when available and include visible attribution when useful | Markdown/frontmatter package |
| Medium import-style | `manual-import` by default unless verified | Use import/canonical behavior when available; otherwise visible attribution | Import/paste instructions |
| Substack manual-style | `manual-import` by default | Visible attribution and canonical source link | Copy/paste package |
| LinkedIn article-style | `draft-only`, `direct-post`, or `manual-import` only after current tool verification | Visible attribution unless canonical metadata is supported and verified | Article draft package |
| X article-style | `manual-import` or verified adapter only | Visible attribution and canonical source link | Manual package |

Future platforms should use the adapter contract in `destination-types-and-adapters.md` before receiving platform-specific playbooks.

## Syndication Package

For each article destination, prepare:

- title
- body or exact diff from canonical source
- canonical URL
- attribution line
- tags/categories when source-backed or user-provided
- destination-specific formatting notes
- manual import instructions when direct action is unavailable

## Attribution Default

When a local/private profile provides a default attribution line and no override exists, use that configured line exactly.

When no attribution default exists, ask for the preferred line before external syndication.
