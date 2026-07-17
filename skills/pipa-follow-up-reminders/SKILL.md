---
name: pipa-follow-up-reminders
description: Create and cancel simple one-shot email follow-up reminders through Pipa. Use this when the user wants Pipa to email them a specific reminder at a future time, such as “email me tomorrow at 9 to follow up,” “remind me by email next Friday,” or “send me a reminder in two hours.” Also use it to cancel a previously scheduled Pipa Follow-Up reminder. Do not use for generic follow-up work, recurring reminders, Gmail scheduled send, drafting emails, reply detection, inbox monitoring, Slack/SMS reminders, or reminders to other people.
metadata:
  version: 0.1.1
---

# Pipa Follow-Up Reminders

User reminder request -> verified email + resolved time -> Pipa one-shot email reminder.

CRITICAL: Create or cancel only deterministic one-shot email reminders through `https://pailflow-chat-gateway.fly.dev`. Reminders can only go to the verified email attached to the API key. Do not invent list, read, update, pause, resume, recurring reminder, inbox-watch, reply-detect, SMS, Slack, Gmail scheduled-send, or arbitrary-recipient flows.

Keep a short todo list while executing this skill so context stays clean: mode, credentials, missing question if any, payload validation, API call, final response.

## Workflow

1. **Pick mode.**

   Choose exactly one mode.

   - User asks for a future email reminder, such as “email me tomorrow,” “remind me by email,” or “follow up with me in two hours” -> **create mode**. Continue step 2.
   - User asks to cancel a scheduled Pipa Follow-Up reminder -> **cancel mode**. Continue step 2.
   - User asks to buy credits, top up, or a create request fails with `insufficient_credits` -> **top-up mode**. Continue step 2.
   - User asks for reminder listing, updates, recurring reminders, inbox monitoring, reply detection, Gmail scheduled send, SMS, Slack, or reminders to another person -> explain V1 does not support that flow, then stop.

   Skip ahead: If the conversation already contains a successful API response and the user asks about that result, answer from the known response. Do not call unsupported read/list APIs.

2. **Load credentials.**

   Load these values before API calls. Distinguish durable user credentials from hosted-run credentials:

   - `PIPA_FOLLOW_UP_API_KEY`
   - `PIPA_FOLLOW_UP_EMAIL`
   - `PIPA_USER_TIMEZONE`

   Lookup order:

   1. Gateway-injected values.
   2. Environment variables.
   3. Repo-local `.pipa/credentials`.
   4. User-global `~/.pipa/credentials`.

   Credential rules:

   - `pipa_agent_v1.*` keys are hosted-run credentials, not durable user keys.
   - They can expire. If one fails, say the hosted-run credential expired, not the user's reminder credential.
   - Do not write `pipa_agent_v1.*` keys into user-managed credential files yourself.
   - If a user-managed credentials file contains an expired `pipa_agent_v1.*` key, ignore/remove that key and continue lookup before starting email-code setup.
   - Email-code verification returns durable user keys. Those are the keys to store for local/persistent skill use.

   Credentials file shape:

   ```text
   PIPA_FOLLOW_UP_API_KEY=<API_KEY>
   PIPA_FOLLOW_UP_EMAIL=<EMAIL>
   PIPA_USER_TIMEZONE=<IANA_TIMEZONE>
   ```

   Keep API keys out of chat, logs, markdown output, shell history, and process args when possible.

   Skip ahead: If all three values are present, go directly to the selected mode step: create step 4, cancel step 7, or top-up step 8.

3. **Set up missing credentials only when needed.**

   Fill the smallest missing piece. Do not restart setup if only one value is missing.

   - If `PIPA_USER_TIMEZONE` is missing but key + email exist, ask exactly: `What timezone should I use?` Stop until the user answers.
   - If `PIPA_FOLLOW_UP_API_KEY` or `PIPA_FOLLOW_UP_EMAIL` is missing, ask for the user's email.

   Email-code setup:

   1. Explain email-code verification creates or replaces the key. Mention key replacement revokes prior keys only if the user may already have one.
   2. Call `POST /v1/key/email-code/start` with product `follow-up`.
   3. Ask for the one-time code from email.
   4. Call `POST /v1/key/email-code/verify` with the challenge id, code, and product `follow-up`.
   5. Store the returned durable key unless the environment is ephemeral, the user opted out, or the write fails. Do not write `pipa_agent_v1.*` keys yourself.
   6. Prefer `~/.pipa/credentials` for globally installed skills. Prefer repo-local `.pipa/credentials` for repo-local skills.
   7. Before writing repo-local credentials, ensure `.pipa/` is gitignored. Use file mode `600`.
   8. Tell the user where credentials were stored. Never print the key unless explicitly asked.
   9. Return to step 2, reload credentials, then continue the selected mode.

4. **Create mode: prepare reminder payload.**

   Required payload fields:

   - `recipient_email`: use `PIPA_FOLLOW_UP_EMAIL` or verified credential email.
   - `due_at`: future UTC ISO timestamp.
   - `timezone`: IANA timezone used for interpretation.
   - `subject`: user-provided clear subject or `Reminder from Pipa`.
   - `body_text`: plain reminder body only.

   Build the payload deterministically:

   1. Set `recipient_email` to `PIPA_FOLLOW_UP_EMAIL`.
   2. If the user requested another recipient, stop and say V1 only supports the verified key owner. Ask whether to use the verified email instead.
   3. Normalize the interpretation timezone before resolving the time:
      - If the user says `Eastern`, `ET`, `EST`, or `EDT` and they mean US Eastern time, use `America/New_York`.
      - Do not map casual `EST` to fixed-offset zones such as `America/Panama`; daylight saving must be handled by the IANA zone.
      - If the user explicitly asks for a fixed-offset timezone, use the correct fixed-offset IANA zone and say so in the confirmation.
   4. Resolve the user's requested time into `due_at`, a future UTC ISO timestamp, using the normalized IANA timezone.
      - For `today`, `tomorrow`, weekdays, and explicit dates, first convert the current instant into the interpretation timezone and anchor the calendar date there. Do not use UTC as the local date.
      - For explicit date + clock requests, verify the resulting local date/time matches the user's words before calling the API.
      - If the requested local time has already passed today, ask one clarification instead of silently scheduling tomorrow.
   5. If the time is vague, ask one direct clarification and stop until the user answers.
   6. Set `timezone` to the normalized IANA timezone used for interpretation.
   7. Set `subject` to the user's clear subject when provided; otherwise use `Reminder from Pipa`.
   8. Set `body_text` to the user's reminder text when provided; otherwise use a concise plain-text reminder body.

   Time examples:

   - Current UTC `2026-07-17T00:57:00Z`, user timezone `America/New_York`, request `tomorrow at 7am` -> local anchor is July 16, so `due_at` is `2026-07-17T11:00:00.000Z`.
   - Current UTC `2026-07-17T13:01:00Z`, request `July 17 9:10 AM EST` from a US Eastern user -> use `America/New_York`, so `due_at` is `2026-07-17T13:10:00.000Z`, not `14:10Z`.

   Skip ahead: If the user says “in 5 minutes,” “in two hours,” or another relative duration and timezone is known, calculate immediately. Do not ask for confirmation.

5. **Create mode: validate before API call.**

   Validate the exact JSON payload that will be sent:

   1. Confirm `recipient_email`, `due_at`, `timezone`, `subject`, and `body_text` are present.
   2. Confirm every required field is a non-empty string.
   3. Confirm `due_at` is in the future.
   4. Confirm the local rendering of `due_at` in `timezone` matches the requested date and clock time.
   5. For reminders due within 30 minutes, compare current time to `due_at` after conversion and confirm there is still enough time for API creation + scheduler dispatch. If the time has passed or is within 60 seconds, ask for a new time.
   6. If validation fails, fix payload construction before calling the API.
   7. When building JSON from shell commands, export variables before reading them from child processes, or construct timestamp + JSON inside the same runtime.
   8. Generate a fresh `Idempotency-Key`.

   Payload shape:

   ```json
   {
     "recipient_email": "lola@example.com",
     "due_at": "2026-06-19T13:00:00.000Z",
     "timezone": "America/New_York",
     "subject": "Reminder from Pipa",
     "body_text": "Send the invoice to Acme."
   }
   ```

   Skip ahead: If validation passes, do not ask for extra confirmation. Create the reminder.

6. **Create mode: create reminder.**

   Call `POST /v1/follow-up-reminders` once with the validated payload.

   Headers:

   ```text
   Authorization: Bearer ${PIPA_FOLLOW_UP_API_KEY}
   Content-Type: application/json
   Idempotency-Key: <required for create only>
   ```

   On success, return:

   ```markdown
   Scheduled the follow-up reminder.

   - Reminder ID: `[id]`
   - Recipient: `[recipient_email]`
   - Due: `[due_at]`
   - Timezone: `[timezone]`
   - Subject: `[subject]`
   - Credits remaining: `[credits_remaining]`
   ```

   If the API fails, go to step 9 and follow only the matching failure branch.

7. **Cancel mode: cancel reminder.**

   Cancel only when the user asks to cancel a scheduled Pipa Follow-Up reminder.

   1. Require a reminder id from the request, conversation, or prior API response.
   2. If the reminder id is missing, ask for it. Explain V1 cannot list reminders.
   3. Confirm only when the target reminder is ambiguous.
   4. Call `DELETE /v1/follow-up-reminders/:id`.
   5. Return a short cancellation confirmation.

   Skip ahead: If the reminder id is present and unambiguous, do not ask for confirmation before deleting.

8. **Top-up mode: create checkout session.**

   Use this mode when create fails with `insufficient_credits` or the user asks to buy credits.

   1. Choose the integer credit amount requested by the user.
   2. If the user did not request an amount, ask exactly: `How many Pipa credits do you want to buy?` Stop until the user answers.
   3. Call `POST /v1/topups/checkout-sessions` with the credit amount.
   4. Share the returned `checkout_url` as a Markdown hyperlink with concise link text, such as `[Open checkout](...)`, plus the purchase amount. Do not raw-print long checkout URLs unless the user explicitly asks for the full URL.
   5. Treat checkout URLs as user-action payment links. Do not persist them.
   6. If checkout creation is unavailable and the response includes only `billing_url`, share the billing fallback.
   7. After the user confirms payment, retry the original reminder by returning to step 4.

   Request shape:

   ```json
   { "credits": 100 }
   ```

   Skip ahead: If this mode was entered from `insufficient_credits`, preserve the original reminder request so it can be retried after payment confirmation.

9. **Handle API failures.**

   Match the returned error and do only the smallest next action.

   - `recipient_not_verified`: Ask whether to use `PIPA_FOLLOW_UP_EMAIL` instead.
   - `due_at_not_future`: Re-resolve time in the user timezone. Ask only if still ambiguous.
   - `invalid_api_key`: If the key is a stored `pipa_agent_v1.*`, ignore/remove that stored key and continue lookup. If it is a durable email-code key, explain replacement key rotates the account key, then go to step 3.
   - `pipa_agent_credential_expired`: Say the hosted-run credential expired. Continue lookup for a durable key. Start email-code verification only if no durable key exists.
   - `insufficient_credits`: Go to step 8.
   - `invalid_topup_credits`: Give the smallest valid next action. Example: `10 credits is below the minimum. Smallest top-up is 100 credits for $10. Want me to create that checkout session?` Do not share `billing_url` unless checkout creation is unavailable.
   - `active_reminder_limit_reached`: Say V1 cannot list reminders; the user needs known reminder ids to cancel or must wait for reminders to send.
   - Missing API key: Go to step 3.

   Skip ahead: Do not restart the full workflow unless the error requires it.

10. **Report result.**

    Be crisp, operational, and next-action focused.

    - Ask only for missing or ambiguous required info.
    - Ask exactly one direct follow-up question at a time.
    - Do not dump API metadata into user response.
    - Do not store secrets in this skill file.
    - Mention credits remaining when the API returns it.
