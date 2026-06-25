---
name: pipa-follow-up-reminders
description: Create and cancel simple one-shot email follow-up reminders through Pipa. Use this when the user wants Pipa to email them a specific reminder at a future time, such as “email me tomorrow at 9 to follow up,” “remind me by email next Friday,” or “send me a reminder in two hours.” Also use it to cancel a previously scheduled Pipa Follow-Up reminder. Do not use for generic follow-up work, recurring reminders, Gmail scheduled send, drafting emails, reply detection, inbox monitoring, Slack/SMS reminders, or reminders to other people.
metadata:
  version: 0.1.0
---

# Pipa Follow-Up Reminders

Create and cancel simple deterministic one-shot email reminders through Pipa.

This skill owns the conversation when the user wants a specific reminder emailed to themselves later. The gateway stays simple: the agent resolves the user's reminder intent into a concrete future timestamp, gathers missing details only when needed, and calls the Follow-Up reminder API.

## Product Rules

- Use the Pipa Follow-Up reminder API. Do not call Inngest directly.
- V1 supports `create` and `cancel` only.
- V1 creates self-reminders only. The reminder recipient must be the verified email attached to the API key.
- V1 does not support recurring reminders, Gmail/Outlook scheduled send, email drafting, reply detection, inbox watching, Slack/SMS delivery, or arbitrary third-party recipients.
- Reminder execution is deterministic. Pipa stores the reminder and sends the email at the due time; no AI runs at reminder time.
- The API accepts resolved timestamps. The agent must resolve natural-language time before calling the API.
- Always collect or infer the user's timezone and include it in the API payload.
- Default a missing subject to `Reminder from Pipa`.
- Generate an idempotency key for create calls so retries do not duplicate reminders.
- Keep API keys out of chat, logs, markdown output, and shell history when possible.

## When To Use This Skill

Use this skill when the user asks for any of the following:

- a simple one-time future email reminder to themselves
- a follow-up reminder sent to their email at a specific date and time
- a simple "email me tomorrow" or "remind me by email" style request
- cancellation of a previously scheduled Pipa Follow-Up reminder

Typical examples:

- "Email me tomorrow at 9 AM to send the invoice."
- "Follow up with me by email next Friday about the proposal."
- "Email me in two hours to check on the deploy."
- "Cancel that reminder about the invoice."

Do not use this skill for generic follow-up work like "follow up with the client," drafting messages, inbox monitoring, or recurring requests like "every Monday" or "daily." Explain that this skill only supports one-shot email reminders to the user and ask whether they want a single email reminder instead.

## Required Inputs Before Create

Do not create a reminder until you have all of the following:

1. Recipient email
2. Due time resolved to a future UTC ISO timestamp
3. Timezone used to interpret/display the reminder time
4. Subject
5. Body text

## Defaulting Rules

### Recipient Email

- If `PIPA_FOLLOW_UP_EMAIL` is available, use it as the default recipient email.
- If no recipient email is available, ask the user for their email.
- Do not create reminders for a different recipient in v1. Explain that v1 only supports reminders to the verified key owner email.

### Timezone

- First look for an explicit timezone in the user's request.
- Then use any available runtime/user timezone context.
- If neither is available, ask for the timezone.
- Include an IANA timezone such as `America/New_York`, not a vague label like `EST`.

### Subject

- If the user provides a clear subject, use it.
- If they only provide reminder body text, default subject to `Reminder from Pipa`.

### Body Text

- Keep the body plain and direct.
- Preserve the user's requested reminder intent.
- Do not add generated analysis, summaries, or unrelated task instructions unless the user asks for that exact body.

## Create Workflow

Follow this sequence:

1. Detect one-shot email reminder intent.
2. Reject or reroute recurring automation intent.
3. Extract recipient email, due time, timezone, subject, and body text from the user request and runtime context.
4. Ask follow-up questions only for missing or ambiguous required inputs.
5. Resolve the due time into a future UTC ISO timestamp.
6. Call `POST /v1/follow-up-reminders` without a separate confirmation step.
7. Return a concise confirmation with the reminder id, due time, timezone, subject, and credits remaining when present.

## Create Confirmation Policy

Do not ask for confirmation before creating a reminder when the required inputs can be inferred or defaulted safely. The user's reminder request is sufficient authorization to create the reminder.

Ask exactly one direct follow-up question only when a required input is missing or ambiguous, such as the recipient email, timezone, or a vague time like "tomorrow morning." After the user answers, create the reminder without asking an additional "Should I create it?" question.

After the API call succeeds, confirm what was created.

## Create Payload Requirements

When calling `POST /v1/follow-up-reminders`, include:

- `recipient_email`
- `due_at`
- `timezone`
- `subject`
- `body_text`

Use an idempotency key for create calls.

Example payload:

```json
{
  "recipient_email": "lola@example.com",
  "due_at": "2026-06-19T13:00:00.000Z",
  "timezone": "America/New_York",
  "subject": "Reminder from Pipa",
  "body_text": "Send the invoice to Acme."
}
```

## Question Gates

Only ask the user a question in these cases:

- No recipient email is available from `PIPA_FOLLOW_UP_EMAIL`, credentials, or the request.
- No timezone is available from the request, `PIPA_USER_TIMEZONE`, credentials, or runtime context.
- The requested time cannot be resolved to a specific future timestamp.
- The request asks for unsupported behavior and needs rerouting, such as recurring reminders or reminders to someone else.
- Cancellation is requested without a reminder id.

Do not ask when a safe default or context value exists. Use `Reminder from Pipa` for missing subjects, use the verified recipient email for self-reminders, and use the available timezone context without a confirmation prompt.

## Time Resolution Rules

- Convert relative requests like "tomorrow at 9" using the user's timezone.
- If the request is ambiguous, ask one direct follow-up question.
- Do not send vague text such as "tomorrow morning" to the API.
- Do not create reminders in the past.
- Include the user's timezone in the confirmation and API payload.

Good follow-up questions when a question gate is hit:

- "What timezone should I use?"
- "When you say tomorrow morning, what time should I use?"

## Cancel Workflow

Use cancel when the user asks to cancel a scheduled Pipa Follow-Up reminder.

Follow this sequence:

1. Identify the reminder id if it is present in the conversation or prior API response.
2. If the reminder id is missing, ask the user for it or explain that v1 needs the reminder id to cancel.
3. Confirm the cancellation if there is any ambiguity.
4. Call `DELETE /v1/follow-up-reminders/:id`.
5. Return a short cancellation confirmation.

V1 does not include a list/search endpoint. Do not invent one. If the user cannot provide the reminder id, explain that listing reminders is not available yet.

## Authentication And Key Setup

The skill uses a Pipa Follow-Up API key.

Look for the key in this order:

1. Gateway-injected `PIPA_FOLLOW_UP_API_KEY` / `PIPA_FOLLOW_UP_EMAIL` in hosted Pipa runs
2. `PIPA_FOLLOW_UP_API_KEY`
3. Repo-local `.pipa/credentials`
4. User-global `~/.pipa/credentials` when the environment has persistent local files

If no key is available, use the agent-initiated setup path through the Pipa gateway:

1. Ask the user for their email.
2. Call `POST /v1/key/email-code/start` with product `follow-up`.
3. Ask the user to paste the one-time code from their email.
4. Call `POST /v1/key/email-code/verify` with the challenge id, code, and product `follow-up`.
5. Store the returned credential for future local runs at the selected credentials path.
6. Before writing repo-local credentials, make sure `.pipa/` is ignored by git; add it to `.gitignore` if missing.
7. Before writing global credentials, create `~/.pipa/` with restrictive permissions.
8. Tell the user the credential was stored at the selected credentials path, but never print the key.

The verification response returns the plaintext API key once and may include `credits_remaining`. Do not print the API key back to the user unless they explicitly ask to see it.

Email-code verification rotates the account's key. It creates a new key for the verified email and revokes prior keys for that account, so older stored keys may stop working. Before starting setup for a user who may already have a key, state that this creates a replacement key and they will need to update any agents or environments using the old key. Do not ask for permission to create the replacement key unless the user has expressed uncertainty or the current request is not clearly asking to set up reminders.

Hosted Pipa gateway runs may inject a short-lived runtime credential automatically. If `PIPA_FOLLOW_UP_API_KEY` and `PIPA_FOLLOW_UP_EMAIL` are already present, use them and do not start email-code setup.

For local persistent agents, store newly verified credentials according to the skill installation scope:

1. If this skill is installed globally, store credentials at `~/.pipa/credentials`.
2. If this skill is installed repo-locally, store credentials at repo-local `.pipa/credentials`.
3. If the installation scope cannot be detected, prefer repo-local `.pipa/credentials` when inside a git repo; otherwise use `~/.pipa/credentials`.

Before writing repo-local credentials, ensure `.pipa/` is ignored by git. Before writing global credentials, create `~/.pipa/` with restrictive permissions. Always write the credentials file with mode `600`. Avoid putting the plaintext key directly in chat, markdown, command history, or process arguments. Prefer the host agent's secure file-write primitive when available.

Do not ask whether to store credentials after a successful email-code verification in a local persistent environment. The expected behavior is to save them automatically for the next run, while clearly stating the path used and keeping the key value out of chat and logs. Only skip local storage if the environment is explicitly ephemeral, the user has opted out, or writing the credentials file fails.

Use this file shape:

```text
PIPA_FOLLOW_UP_API_KEY=<API_KEY>
PIPA_FOLLOW_UP_EMAIL=<EMAIL>
PIPA_USER_TIMEZONE=<IANA_TIMEZONE>
PIPA_API_BASE_URL=https://pailflow-chat-gateway.fly.dev/
```

Set the credentials file mode to owner-read/write only, for example `chmod 600 <selected-credentials-path>`.

For sandbox agents, do not assume local storage survives. The reminder itself is durable after creation, but credentials may need to be reissued or re-entered through the email-code flow in a future session. When hosted key management exists, tell the user that Pipa can email a management link such as "We created your key. Visit the Pipa key page to manage, revoke, or save it later." Do not claim that hosted management exists until the gateway/homepage exposes that surface.

## Runtime Configuration

This skill expects these environment variables when available:

- `PIPA_API_BASE_URL` - Base URL for the Pipa gateway, for example `https://api.usepipa.com` or `http://localhost:4110`
- `PIPA_FOLLOW_UP_API_KEY` - Scoped Follow-Up API key
- `PIPA_FOLLOW_UP_EMAIL` - Optional default recipient email for self-reminders
- `PIPA_USER_TIMEZONE` - Optional default timezone

If `PIPA_API_BASE_URL` is not set, use `https://pailflow-chat-gateway.fly.dev/` as the default gateway URL. Normalize the trailing slash when constructing endpoint URLs so calls use paths like `https://pailflow-chat-gateway.fly.dev/v1/follow-up-reminders`.

Do not store secrets in this skill file.

## Execution Contract

Use `PIPA_API_BASE_URL` when it is available; otherwise use `https://pailflow-chat-gateway.fly.dev/` as the default. If a Follow-Up API key is available, do not tell the user you lack API access. Use shell/HTTP tooling to call the gateway.

If no Follow-Up API key is available from env vars, repo-local `.pipa/credentials`, or user-global `~/.pipa/credentials`, provision one through the email-code setup flow in this skill. Do not stop at "missing API key" unless the user declines setup or the provisioning flow fails.

Use this authorization header:

```text
Authorization: Bearer ${PIPA_FOLLOW_UP_API_KEY}
```

Use an idempotency header on create:

```text
Idempotency-Key: <agent-generated-stable-key>
```

Example create call shape:

```bash
PIPA_BASE_URL="${PIPA_API_BASE_URL:-https://pailflow-chat-gateway.fly.dev/}"
curl -sS -X POST "${PIPA_BASE_URL%/}/v1/follow-up-reminders" \
  -H "Authorization: Bearer $PIPA_FOLLOW_UP_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: <agent-generated-stable-key>" \
  -d '{...json payload...}'
```

Example cancel call shape:

```bash
PIPA_BASE_URL="${PIPA_API_BASE_URL:-https://pailflow-chat-gateway.fly.dev/}"
curl -sS -X DELETE "${PIPA_BASE_URL%/}/v1/follow-up-reminders/<id>" \
  -H "Authorization: Bearer $PIPA_FOLLOW_UP_API_KEY"
```

Failure rules:

- If `PIPA_API_BASE_URL` is missing, use `https://pailflow-chat-gateway.fly.dev/` and do not ask the user for a base URL.
- Do not ask for an API key if `PIPA_FOLLOW_UP_API_KEY`, `.pipa/credentials`, or `~/.pipa/credentials` is available.
- If no API key is available, start the email-code provisioning flow instead of asking the user to provide a key manually.
- Do not print the API key back to the user.
- After successful email-code verification in a local persistent environment, write credentials to the path selected by the installation-scope rules for future runs.
- Do not write credentials to disk without telling the user what path is being used.

Common API failures:

- `recipient_not_verified` means the requested recipient email does not match the verified key owner. Ask whether to use the verified `PIPA_FOLLOW_UP_EMAIL` instead.
- `due_at_not_future` means the resolved timestamp is in the past or too close to now. Re-resolve the time in the user's timezone and ask for clarification if needed.
- `invalid_api_key` means the stored key may have been revoked or rotated. State that provisioning a replacement rotates the account key, then start the email-code setup flow. Ask for approval only if the user has not clearly asked to create a reminder or set up reminder access.
- `insufficient_credits` means the user is out of Pipa credits. Send them to the returned `billing_url`, usually `https://usepipa.com/dashboard?tab=billing`, to get more credits.
- `active_reminder_limit_reached` means the key already has too many scheduled/sending reminders. Explain that v1 cannot list reminders yet, so the user needs to cancel known reminder ids or wait for existing reminders to send.

## API Surface

Use these endpoints:

- `POST /v1/key/email-code/start`
- `POST /v1/key/email-code/verify`
- `POST /v1/follow-up-reminders`
- `DELETE /v1/follow-up-reminders/:id`

Do not invent unsupported endpoints for list, read, update, pause, resume, recurring reminders, or arbitrary recipient verification.

## Output Style

- Be crisp and operational.
- Ask only for missing or ambiguous required information.
- Do not ask for pre-create confirmation when the required inputs are known.
- Confirm cancellation when ambiguous.
- After create, include the reminder id, due time, and `credits_remaining` when the API returns it.
- Avoid lengthy explanations of scheduling infrastructure unless the user asks.

## Example Create Outcome

User:

```text
Email me tomorrow at 9 AM to send the invoice.
```

Skill behavior:

1. Resolve timezone from context or ask for it if missing.
2. Resolve tomorrow at 9 AM to UTC.
3. Default subject to `Reminder from Pipa`.
4. Create the reminder.

Example success:

```text
Reminder scheduled.
- ID: reminder_123
- To: lola@example.com
- When: 2026-06-19T13:00:00.000Z (America/New_York)
- Subject: Reminder from Pipa
- Credits remaining: 16.93
```

## Example Cancel Outcome

User:

```text
Cancel reminder reminder_123.
```

Skill behavior:

1. Use the reminder id from the request.
2. Call the cancel endpoint.
3. Confirm cancellation.

Example success:

```text
Cancelled reminder `reminder_123`.
```
