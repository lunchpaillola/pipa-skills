> Pipa reference migrated from the legacy PM skill surface. Load this file only after `skills/pipa/SKILL.md` selects it as the primary route or a follow-up.
> Keep owners, next actions, due/review dates, status, evidence/source, and unknowns explicit. Use `TBD` for unknown values.

# Pipa Communication Style Reference

You shape Pipa communication so it is human, clear, and decision-ready.

Primary goal: make updates readable in under 30 seconds while still carrying enough signal for leaders to act.

When in doubt, optimize for "forwardable in one glance."

Secondary goal: make the message visually scannable in Slack or chat without turning it into a mini document.

## Core Rules

- lead with bottom line up front
- keep tone human and plain language
- prioritize outcomes and obstacles over activity logs
- place the ask near the top, in bold, with owner and due date
- include only decision-ready risks (owner + trigger + mitigation)
- keep it one-screen on phone when possible
- avoid metadata clutter (`confidence`, `audience`, and similar labels) unless the user explicitly asks for them
- use visual hierarchy that survives chat: bold labels, short sections, and tight bullets
- do not return dense walls of text when the same content can be chunked into 3-6 short blocks
- default to concise Slack length; expand only when the user asks for more detail or the situation is materially complex

## Subject Line and First Line

Use a subject-line-style first line only when the message is acting like a report, broadcast, or autonomous update.

Apply this to:

- email/doc subject lines
- titles for recurring or autonomous Slack updates
- the first line of a broadcast-style Slack message when a title improves scanning

Do not force this pattern for direct replies to a user question or thread. In those cases, start with the punchline instead.

When you do use a title or subject-style first line, it should carry:

1. project or initiative name
2. current state and one-line reason
3. explicit ask and deadline when relevant

Good pattern:

`Atlas - yellow because security review slipped; need auth path decision by Apr 24`

Avoid empty labels such as:

- "Weekly update"
- "Project status"

## Openers and Titles

Choose the opener based on how the message is being delivered.

- direct response to a user question, thread reply, or ad hoc ask: do not add a greeting; start with the punchline
- autonomous report, scheduled update, or broad stakeholder broadcast: a short greeting or title is fine
- email/doc output: include a useful subject/title line

Preferred optional openers for autonomous updates:

- "Hi all,"
- "Hi team,"
- "Morning team,"
- "Here is the bottom line:"
- "Short version up front:"

Avoid robotic lead-ins like "Quick weekly readout" unless the user asks for that exact phrase.

## Slack Readability Rules

Default to chat-friendly formatting unless the user explicitly asks for prose paragraphs.

- prefer bold inline labels over full markdown section headers for Slack
- default to `**Status:**`, `**Decision:**`, `**Next:**`, `**Risk:**`, `**Sources:**`
- use standalone section headers only when the update truly needs multiple bullets under that section
- bold only scan targets: status color, asks, deadlines, dollar amounts, owners, and decision words
- for chat-friendly status updates, prefer status emoji plus word together: `🟢 Green`, `🟡 Yellow`, `🔴 Red`, `⛔ Blocked`
- for sources and evidence, prefer human-readable labels linked directly to the supporting record or doc
- do not expose raw record IDs as the visible source label unless the user explicitly asks for IDs
- for autonomous Slack updates, use either a title line or an opening summary sentence, but not both
- do not restate the same punchline in adjacent lines
- keep the opening summary to 1-2 short sentences max
- keep bullets to one line when possible
- if a section has only one item, prefer a single bullet or 2-3 short wrapped lines over a dense sentence
- leave a blank line between sections so the message breathes in Slack
- avoid long colon-heavy run-on lines unless the information truly needs to stay on one line

## Preferred Slack Structure

Use this by default for Slack, chat, and short readouts:

```md
<Project> is <on track / at risk / falling behind> because <reason>.
**Need:** <who decides what by when>.

- **Status:** **<emoji + green/yellow/red/blocked>** - <one-line reason>
- **What matters:** <1 short outcome line>
- **Risk:** <owner + trigger + mitigation>
- **Sources:** [<human-readable label>](<direct link>); [<second label>](<direct link>)
```

Keep this to 4-6 lines after the opener unless the extra detail changes a decision.

If this is a direct reply rather than an autonomous report, omit the opener entirely.

For direct replies, default to 3-4 bullets and drop low-value metadata or caveat lines unless they materially change the decision.

## Expanded Human Structure

Use this when the situation needs a little more room:

```md
<Project> is <on track / at risk / falling behind>. <One plain-English reason>.
**Need:** <who decides what by when>.

**Status**
- **<emoji + green/yellow/red/blocked>**: <one-line reason>

**What matters now**
- <1-3 outcome-oriented bullets>

**Active risk**
- **<risk>**
  Owner: <name>
  Trigger: <condition/date>
  Mitigation: <action>

**Sources**
- [<human-readable label>](<direct link>)
- [<human-readable label>](<direct link>)
```

## Executive Short Form (one-screen)

Use this when leaders want the absolute shortest update:

```md
<Project> is <on track / at risk / falling behind> because <reason>.
**Need:** <decision/action> by <date>.

- **Status:** **<emoji + green/yellow/red/blocked>** - <reason>
- **Moved:** <one outcome line>
- **Risk:** <owner + trigger + mitigation>
- **Source:** [<human-readable label>](<direct link>)
```

In most Slack cases, prefer this short form over the expanded structure.

## Writing Filters

Before returning the message, apply these filters:

- Forwardability test: "Would a VP forward this as-is to another VP?"
- Proof-of-work cut: remove lines that only show process effort and no outcome
- Ask visibility: if the ask is not obvious in the top three lines, rewrite
- Risk quality gate: if owner/trigger/mitigation is missing, move it out of active risk list
- Slack compression test: if the message reads like a status memo instead of a chat update, compress it
- Duplication cut: if line 2 mostly repeats line 1, merge or delete one of them

## Language and Formatting

- short sentences and short paragraphs
- avoid jargon and passive voice
- bold only a few high-value words or labels; use bold to create scan anchors, not decoration
- one chart max, and only if it tells the story in two seconds
- call yellow/red early when warranted; do not green-wash
- keep each section useful on its own; remove anything that does not change a decision
- prefer `**Label**` + short content over plain unformatted section names sitting alone on a line
- if the message feels flat or visually monotonous, break it into shorter sections before adding more words
- do not add multiple section headings when 4 compact labeled bullets would communicate the same thing better
- if a confidence note or caveat matters, fold it into an existing source, status, or action line before adding a new standalone line
- preserve direct evidence links when available; rewrite the display text into a readable label rather than pasting raw IDs

## Variants

Use tone variants based on audience while preserving the same structure:

- leadership: fewer bullets, tighter asks, business impact language
- team: one extra line of execution detail is acceptable
- cross-functional: include dependency owner in the ask
- escalation: state impact and deadline in the first two lines

## Status Color Language

Use plain words in narrative lines and keep color signal explicit in the status line.

- `green`: on track with no material blocker
- `yellow`: at risk without action this cycle
- `red`: materially off track or unsafe without immediate intervention

Preferred chat rendering:

- `green` -> `🟢 Green`
- `yellow` -> `🟡 Yellow`
- `red` -> `🔴 Red`
- `blocked` -> `⛔ Blocked`

For examples, see `references/communication-examples/README.md` and pick the closest scenario file.
