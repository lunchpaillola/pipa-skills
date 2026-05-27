# Audio Brief Script

The audio brief is a concise executive narrated explainer, not a verbatim readout. It exists because AI agents and teams can now produce more plans, specs, and review documents than people can read line-by-line. The brief should orient the listener quickly, tell them where to spend attention, and help them decide whether and how to dive deeper.

## Default Lengths

- **Quick listen:** 1-2 minutes.
- **Standard brief:** about 3 minutes. Use this by default.
- **Deep listen:** 7-12 minutes when the user asks for depth and the source warrants it.

Very short sources should produce short audio notes. Do not pad to meet a duration target.

## Voice And Tone

- Lead with concise document context, then the attention areas that need review.
- Use plain human language.
- Keep sentences short enough to understand while walking or listening on a phone.
- Avoid dense metadata, tables, and exact wording unless the exact wording is the point.
- Be opinionated about where attention should go; do not flatten every section into equal-weight summary.
- Distinguish routine/template content from novel or consequential content.
- Name key decisions, open questions, dependencies, and implications directly.
- Point back to source sections for precision instead of overloading audio with quotes.

## Required Script Shape

Use this structure unless the user requests another format:

```md
# Audio Brief Script

## Document Context And Flow
Name the document type and purpose. Say what it builds on or sets up when that is clear. Give a 1-2 sentence lay of the land for how the document flows across sections.

## Attention Areas
Then give 2-4 concrete review targets. Use this shape: "Three things need your review: <area one>, <area two>, and <area three>." Be specific about sections, pages, assumptions, or decisions when the source supports it.

## Decisions And Open Questions
Surface the main decision points, options, tradeoffs, unresolved questions, and whether the document makes a recommendation.

## Routine Versus Novel
Identify what appears standard, expected, or template-like versus what is new, risky, unusual, or worth reading carefully.

## Dependencies And Implications
Call out dependencies, assumptions, sequencing constraints, and what changes if those assumptions fail.

## Plain-English Summary
Close with the core summary in easy-to-understand language and the most useful next read or action.
```

## Example Moves

- Attention: "Three things need your review: the pricing model on page 4, the technical feasibility assumption in section 2, and the timeline dependencies in the roadmap."
- Context: "This is a scope document for Atlas. It builds on last week's research brief and sets up the implementation plan."
- Decision: "The main decision point is build versus buy for the data pipeline. Two options are outlined with tradeoffs. No recommendation yet."
- Routine versus novel: "Sections 1-3 follow the standard template. Section 4 introduces a new approach to user permissions worth reading carefully."
- Dependency: "This scope assumes the API integration discussed in the technical brief is feasible. If that changes, revisit the timeline."

## Source Access Rule

- Generate a brief only after reading the requested source well enough to summarize it.
- If the source cannot be accessed or read, do not produce a partial/caveated audio brief. Block clearly and ask for a local file, exported markdown, or pasted text.
- Do not include source-access scoring in the spoken script.

## Visual Or Diagram-Heavy Sources

When important information is visual, say what requires direct viewing. Do not pretend audio captures every diagram, chart, or screenshot detail.
