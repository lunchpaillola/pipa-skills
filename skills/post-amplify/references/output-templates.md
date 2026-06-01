# Output Templates

Use these section names to keep runs predictable and concise.

## Missing Source

```md
I need the source before I can amplify it.

Send one of these:
- Public URL
- Launch page
- Markdown file/path
- Pasted Markdown
- Title, URL, and source text
```

## Source Blocker

```md
Amplification blocked.

- Source: <source label>
- Blocker: <unsafe URL | unreadable extraction | private source permission needed | missing source>
- What I can do now: <local-only plan | wait for source | ask permission for external search>
- Needed next: <minimum user action>
```

## Amplification Plan

```md
Amplification plan for `<title>`

Piece summary:
- Topic: <topic>
- Audience: <audience>
- Format: <tutorial | launch | case study | comparison | announcement | other>
- Technologies or themes: <list>
- Questions this piece answers: <list>

Discover:
- <rank>. <channel or destination>: <why it fits>
- Suggested action: <share | repost | submit | republish later | monitor | skip>
- Timing notes: <notes or none>
- Cautions: <etiquette, duplicate-content, or community notes>

Answer:
- Search queries used: <queries>
- <thread/community/source>: <why relevant>
- Suggested action: <answer now | save | monitor | skip>
- Notes: <etiquette or context>

Distribute:
- Now: <actions>
- 2 weeks: <actions>
- 1 month: <actions>
- 2 months: <actions>
- 3 months: <actions>
- Scheduler-ready items: <structured entries or none>

Notes:
- Risks or etiquette: <notes>
- Excluded channels: <channels and reasons>
- Execution status: Planning only. No external writes were performed.
```

## Mode-Specific Discover Output

```md
Discover results for `<title>`

Piece fit:
- Topic: <topic>
- Audience: <audience>
- Format: <format>

Recommended destinations:
- <rank>. <destination>: <why it fits>, <share | repost | submit | republish later | monitor | skip>, <timing note>

Excluded or downranked:
- <destination>: <reason>
```

## Mode-Specific Answer Output

```md
Answer opportunities for `<title>`

Search queries used:
- <query>

Opportunities:
- <link or source>: <why the piece is useful there>, <answer now | save | monitor | skip>

Manual answer guidance:
- <specific contribution angle>
- Reference the post only when it genuinely helps.
```

## Mode-Specific Distribute Output

```md
Distribution plan for `<title>`

Cadence:
- Now: <actions>
- 2 weeks: <actions>
- 1 month: <actions>
- 2 months: <actions>
- 3 months: <actions>

Channel timing:
- <channel>: <cadence, rationale, and caveats>

Scheduler-ready items:
- Channel: <channel>
  Publish window: <window>
  URL: <url>
  Campaign label: <label>
  Angle: <short angle or hook, not full copy unless requested>
  Status: <planned | ready for approval | queued | manual>

Execution status: Planning only unless the user explicitly approved scheduler execution.
```

## Execution Approval

```md
Approval needed before external execution.

I can prepare or execute these items only after you approve the named destinations/actions:
- <destination/action>: <account/profile if verified>, <publish window>, <payload or scheduler item>, <visibility/status>

Reply with approval for `all` or name the destinations/actions to approve. I will not publish, schedule, create drafts, submit links, or post comments without explicit approval.
```

## Run Report

```md
Amplification run report

Completed:
- <destination/action>: <url/id/evidence>

Queued or scheduled:
- <destination/action>: <publish window>, <url/id/evidence>

Manual outputs:
- <destination/action>: <instructions or structured item>

Discovery results:
- <link>: <why relevant>, <suggested manual action>

Skipped or not approved:
- <destination/action>: <reason>

Failed or blocked:
- <destination/action>: <status>, <next action>
```
