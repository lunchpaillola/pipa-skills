# Design

## Visual Direction

Pipa skill interfaces should share the `pipa-audio-brief` visual language: quiet document-first pages, narrow reading measures, low chrome, native controls when possible, and a single dominant workflow action. Voice surfaces may add a focused listening orb or level meter only when it clarifies the current state.

## Color

Use a restrained strategy by default: warm tinted neutrals plus one rust-orange accent. Avoid pure black or pure white.

```css
:root {
  --page: oklch(0.985 0.006 75);
  --surface: oklch(0.965 0.008 75);
  --ink: oklch(0.235 0.012 65);
  --muted: oklch(0.52 0.012 65);
  --line: oklch(0.88 0.008 75);
  --accent: oklch(0.58 0.13 42);
  --accent-soft: oklch(0.82 0.08 42);
  --good: oklch(0.52 0.10 150);
  --warn: oklch(0.62 0.12 65);
  --bad: oklch(0.52 0.13 28);
}
```

## Typography

Use system sans-serif for product surfaces. Keep body copy at 15 to 17px with generous line height. Cap prose width at 65 to 75 characters. Use weight and spacing before decoration.

## Layout

Use one primary column for the main workflow. Keep secondary material below or quiet, never competing beside the main control unless the screen is wide and the secondary material is genuinely useful. Avoid tabs for simple state machines.

## Components

- **Primary action:** one obvious button, large enough for touch.
- **Listening orb:** state indicator for ready, listening, sending, speaking, and blocked.
- **Transcript:** quiet running log, not a chat product.
- **Handoff:** collapsed or secondary until requested.
- **Status text:** always pair audio-only cues with visible text.

## Motion

Use subtle opacity and transform transitions only. The listening orb may pulse or animate bars while listening or speaking. Respect reduced motion by disabling non-essential animation.

## Copy

Keep labels direct: "Start listening", "Listening", "Sending to OpenCode", "Speaking", "Blocked". Avoid magic claims and avoid em dashes.
