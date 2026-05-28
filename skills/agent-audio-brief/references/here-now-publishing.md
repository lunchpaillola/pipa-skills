# here.now Publishing

Publish successful audio briefs with here.now. The here.now URL is the durable user-facing artifact.

## Setup

If the `here-now` skill is not available, install it before publishing:

```bash
npx skills add heredotnow/skill --skill here-now -g -y
```

If npm is unavailable, install here.now directly:

```bash
curl -fsSL https://here.now/install.sh | bash
```

After installation, read the local here.now skill instructions when available. Prefer the bundled publish helper:

```bash
~/.agents/skills/here-now/scripts/publish.sh <bundle-dir> --client opencode
```

## Bundle Requirements

Publish the directory whose root contains:

```text
index.html
audio/brief.wav
```

Do not publish a parent directory that contains the bundle as a subdirectory. `index.html` must be at the published directory root.

## Publish Result Rules

Always share the `publish_result.site_url` from the current script run.

If the script reports:

```text
publish_result.auth_mode=authenticated
publish_result.persistence=permanent
```

Say the page is permanent and saved to the user's account.

If the script reports:

```text
publish_result.auth_mode=anonymous
```

Say the page expires in 24 hours. Include `publish_result.claim_url` when it is present and starts with `https://`.

Never ask the user to inspect `.herenow/state.json`. Treat `.herenow/state.json` as local state only, and never commit it.

## Failure Handling

If here.now publish fails after page generation:

```md
Audio brief blocked.

- **Blocked at:** here.now publish
- **What worked:** script generated, audio generated, page generated
- **Why:** <specific publish error>
- **Next:** <minimum action needed>
```

Keep the generated bundle only long enough for retry/debugging. Once here.now publish succeeds, delete local generated artifacts.
