# Output Templates

Use these section names to keep runs predictable and concise.

## Missing Source

```md
I need the source before I can amplify it.

Send one of these:
- Public canonical URL
- Markdown file/path
- Pasted Markdown
- Title, canonical URL, and source text
```

## Source Blocker

```md
Amplification blocked.

- Source: <source label>
- Blocker: <unsafe URL | unreadable extraction | missing canonical URL | private source permission needed>
- What I can do now: <local-only plan | manual draft | wait for source>
- Needed next: <minimum user action>
```

## Blast Plan

```md
Blast plan for `<title>`

Source:
- Canonical URL: <url>
- Classification: <classification>
- Attribution: <line>

Planned destinations:
- <destination>: <action kind>, <account/profile if verified>, <exact write payload or exact diff from canonical source for write-capable actions>, <visibility>

Manual or fallback destinations:
- <destination>: <reason>, <manual output>

Skipped:
- <destination>: <reason>

Discovery:
- <source>: <read-only query scope>, <privacy status>, <expected output>

Approval needed:
Reply with approval for `all` or name the destinations to approve. I will not create external drafts, publish, or write remotely until you approve the shown plan or an explicit subset.

Write-capable destinations cannot be approved from payload summaries. Remote drafts and public publishes require the exact write payload or exact canonical diff in the shown plan.
```

## Partial Approval Acknowledgement

```md
Approved destinations:
- <destination>

Not approved:
- <destination>

I will execute only the approved destinations exactly as shown. Any material change requires renewed approval.
```

## Run Report

```md
Amplification run report

Completed:
- <destination>: <url/id/evidence>

Drafts created:
- <destination>: <draft url/id>

Manual outputs:
- <destination>: <copy/import instructions>

Discovery results:
- <link>: <why relevant>, <local answer-shaped draft status>

Skipped or not approved:
- <destination>: <reason>

Failed or blocked:
- <destination>: <status>, <next action>

Profile deltas:
- Remembered: <values and location, or none>
- Suggested: <values not persisted>
- Skipped: <why not stored>
```

## Manual Community Draft

```md
Manual-only community opportunity

- Link: <url>
- Why it may fit: <reason>
- Rules/norms to check: <summary or unknown>
- Local answer-shaped draft: <bespoke outline or draft>
- Safety note: Adapt this yourself before posting. This skill will not post, comment, submit, vote, or create community drafts in V1.
```
