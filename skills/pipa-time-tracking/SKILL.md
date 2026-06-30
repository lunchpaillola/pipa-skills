---
name: pipa-time-tracking
description: Track work time through Pipa generic agent utility records. Use when user asks to start, stop, switch, inspect, backfill, update, archive, or summarize time entries.
metadata:
  version: 0.1.0
---

# Pipa Time Tracking

User time-tracking req -> Pipa creds -> generic `time_tracking/time_entry` utility records.

CRITICAL: Use only Toggl-style time entries via generic Pipa agent utility records API. Do not use Clockify, Toggl, screenshots, payroll, invoicing, productivity scoring, passive activity reconstruction, or `/v1/time-tracking/*` wrapper endpoints.

Keep short todo list: mode, creds, missing question, payload validation, API call, final response.

## Workflow

1. **Pick mode.** Choose exactly one.

   - Start timer: "start tracking this", "start timer for Acme", "track time on frontend fixes" -> **start**.
   - Switch work: "switch to Acme QA" -> **switch**.
   - Stop current timer -> **stop**.
   - Ask what is running -> **current**.
   - Log past time: "log 45 minutes from 9 to 9:45" -> **backfill**.
   - Show entries / summarize time -> **review**.
   - Update/delete/cancel/archive entry -> **update/archive**.
   - Buy credits/top up, check credit balance, or mutating req fails with `insufficient_credits` -> **top-up**.
   - Payroll, invoicing, screenshots, passive reconstruction, external tracker sync, recurring timers, auto idle detection -> explain V1 unsupported, stop.

   If conversation already has successful API response and user asks about that result, answer from known response. Do not call unsupported reporting endpoints.

2. **Load creds.** Required before API calls:

   - `PIPA_API_BASE_URL`
   - `PIPA_API_KEY`
   - `PIPA_EMAIL`
   - `PIPA_USER_TIMEZONE`

   Aliases:

   - `PIPA_FOLLOW_UP_API_KEY` -> `PIPA_API_KEY`
   - `PIPA_FOLLOW_UP_EMAIL` -> `PIPA_EMAIL`
   - If canonical and alias values both exist in the same source, canonical wins.

   Lookup order:

   1. Gateway-injected values.
   2. Env vars.
   3. Repo-local `.pipa/credentials`.
   4. User-global `~/.pipa/credentials`.

   Hidden-path rule:

   - Do not trust glob/file-search for `.pipa/credentials`; hidden dirs can be skipped/mishandled.
   - Check explicit paths directly: `<workspace-root>/.pipa/credentials`, then `~/.pipa/credentials`.
   - Shell helper: resolve root from cwd or `git rev-parse --show-toplevel`; read `Path(root) / ".pipa" / "credentials"`.
   - `No files found` from glob for `.pipa/credentials` is inconclusive. Direct-read before asking user for creds.

   Creds file = dotenv, not JSON:

   ```text
   PIPA_API_BASE_URL=https://pailflow-chat-gateway.fly.dev
   PIPA_API_KEY=<API_KEY>
   PIPA_EMAIL=<EMAIL>
   PIPA_USER_TIMEZONE=<IANA_TIMEZONE>
   ```

   Legacy shape:

   ```text
   PIPA_API_BASE_URL=https://pailflow-chat-gateway.fly.dev
   PIPA_FOLLOW_UP_API_KEY=<API_KEY>
   PIPA_FOLLOW_UP_EMAIL=<EMAIL>
   PIPA_USER_TIMEZONE=<IANA_TIMEZONE>
   ```

   Keep API keys out of chat/logs/markdown/shell history/process args when possible. Shell helper reads creds inside script; prints only non-secret results.

   If `PIPA_API_BASE_URL` and API key exist, continue to selected mode. If mode needs local-day interpretation and timezone missing, step 3.

3. **Set up missing creds only when needed.** Fill smallest missing piece.

   - Missing `PIPA_USER_TIMEZONE` + local dates/vague times -> ask exactly: `What timezone should I use?` Stop.
   - Missing `PIPA_API_BASE_URL` -> default `https://pailflow-chat-gateway.fly.dev` unless user named another gateway.
   - Missing `PIPA_API_KEY` and `PIPA_FOLLOW_UP_API_KEY` -> ask for user's email.

   Email-code setup:

   1. Explain email-code verification creates/replaces Pipa agent utilities key. Mention key replacement revokes prior keys only if user may already have one.
   2. `POST /v1/key/email-code/start` with product `agent-utilities`.
   3. Ask for one-time email code.
   4. `POST /v1/key/email-code/verify` with challenge id, code, product `agent-utilities`.
   5. Store returned key unless env ephemeral, user opted out, or write fails.
   6. Prefer repo-local `.pipa/credentials` for repo-local skills; `~/.pipa/credentials` for global skills.
   7. Before repo-local write, ensure `.pipa/` gitignored. Use file mode `600`.
   8. Tell user storage path. Never print key unless explicitly asked.
   9. Reload creds, continue selected mode.

4. **API contract.** Use only:

   - `GET /v1/agent-utility-records`
   - `POST /v1/agent-utility-records`
   - `GET /v1/agent-utility-records/:id`
   - `PATCH /v1/agent-utility-records/:id`
   - `DELETE /v1/agent-utility-records/:id`
   - `POST /v1/key/email-code/start`
   - `POST /v1/key/email-code/verify`
    - `POST /v1/topups/checkout-sessions`

    Credit balance:

    - Do not invent a balance endpoint. Current credit balance is only known when an allowed API response includes `credits_remaining`.
    - If the user asks for balance and the latest allowed response lacks `credits_remaining`, say the skill cannot query current balance directly.
    - If `insufficient_credits` includes `topup_limits`, use those limits in the next action.
    - Treat checkout URLs as user-action payment links. Do not persist them or raw-print long checkout URLs unless explicitly asked.

   List query params used by this skill:

   - `utility_type`
   - `record_type`
   - `status`
   - `started_at_gte`
   - `started_at_lt`

   Do not use other list filters unless the API response or docs expose them. If archived filtering is unavailable, exclude archived records after fetch.

   Auth header:

   ```text
   Authorization: Bearer ${PIPA_API_KEY}
   ```

   Time entry record:

   ```json
   {
     "utility_type": "time_tracking",
     "record_type": "time_entry",
     "status": "running",
     "title": "Work description",
     "started_at": "2026-06-30T13:00:00.000Z",
     "project_label": "optional project",
     "client_label": "optional client",
     "flex_label": "optional tag/task/phase",
     "rate_amount": 150,
     "rate_currency": "USD",
     "metadata": { "notes": "optional extras" }
   }
   ```

   Rules:

   - `running` requires `started_at`, omits `ended_at`.
   - `completed` requires `started_at` and `ended_at`.
   - `ended_at` must be >= `started_at`.
   - Only one unarchived running `time_tracking/time_entry` per user.
   - Deletes archive. Do not claim hard-delete.
   - Store exact timestamps. Round duration only in user-facing response.

5. **Start mode.**

   1. Title from req. If only "start timer", use `Untitled work`.
   2. Parse obvious labels only: project, client, task/tag/phase. Do not invent labels.
   3. `GET /v1/agent-utility-records?utility_type=time_tracking&record_type=time_entry&status=running`.
   4. If running timer exists, report id/title/start. Ask exactly: `Do you want me to switch from that timer to [new title]?` Stop.
   5. If none running, create `running` record with current UTC ISO `started_at`.
   6. Fresh `Idempotency-Key` for create.
   7. Success -> step 14 start template.

   Create payload:

   ```json
   {
     "utility_type": "time_tracking",
     "record_type": "time_entry",
     "status": "running",
     "title": "Acme frontend fixes",
     "started_at": "2026-06-30T13:00:00.000Z",
     "project_label": "Acme",
     "client_label": "Acme Co",
     "flex_label": "frontend"
   }
   ```

6. **Switch mode.**

   1. Fetch running timer per step 5.
   2. If none, create new running timer via start mode. Mention no prior timer stopped.
   3. If running, patch to `status=completed`, `ended_at=now`.
   4. After stop succeeds, create new running timer with a fresh `Idempotency-Key`.
   5. If stop succeeds but create fails, say exactly that and report no new timer running.
   6. Return stopped duration + new running record id.

7. **Stop mode.**

   1. Fetch running timer per step 5.
   2. If none, say no timer currently running, stop.
   3. Patch running record: `status=completed`, `ended_at=now`.
   4. Confirm id, title, start, end, duration, labels.

   Patch payload:

   ```json
   { "status": "completed", "ended_at": "2026-06-30T14:15:00.000Z" }
   ```

8. **Current mode.**

   1. Fetch running timer per step 5.
   2. If none, say no timer currently running.
   3. If one, report id, title, start, elapsed duration, labels.
   4. Do not create/stop/mutate.

9. **Backfill mode.**

   1. Resolve date/time range with `PIPA_USER_TIMEZONE`.
   2. Ambiguous date/time/duration/timezone -> ask one direct clarification, stop.
   3. Convert `started_at`/`ended_at` to UTC ISO.
   4. Create `completed` record.
   5. Return created entry confirmation.

   If user says "log 45 minutes from 9:00" and timezone/date known, compute end immediately. No extra confirmation.

10. **Review mode.**

    1. Resolve range to concrete `started_at_gte` and `started_at_lt` UTC ISO. For "today", use `PIPA_USER_TIMEZONE`.
    2. `GET /v1/agent-utility-records` with `utility_type=time_tracking`, `record_type=time_entry`, range filters.
    3. Exclude archived unless user asks archived/cancelled.
    4. Group/total records in response. Do not call/invent reporting endpoint.
    5. Include running entries separately; duration changes.

11. **Update/archive mode.**

    1. Resolve record id from req, context, or short candidate list.
    2. Ambiguous ref -> ask one direct question, stop.
    3. `PATCH /v1/agent-utility-records/:id` for title, timestamps, labels, rate, metadata.
    4. `DELETE /v1/agent-utility-records/:id` only for explicit delete/cancel/remove/archive.
    5. Archiving running timer -> say cancelled/archived, not completed.

12. **Top-up mode.**

    Time Tracking costs 10 Pipa credits for 30 days. No auto-renewal; next mutating use after expiry charges another access pass.

    Balance visibility:

    - The skill cannot query current credit balance unless an allowed response includes `credits_remaining`.
    - If the user asks how many credits they have and no current response includes `credits_remaining`, say so and include the gateway URL being used.

    1. Use on `insufficient_credits` or buy/top-up ask.
    2. Choose requested integer credit amount.
    3. No amount -> ask exactly: `How many Pipa credits do you want to buy?` Stop.
    4. `POST /v1/topups/checkout-sessions` with `{ "credits": amount }`.
    5. Share `checkout_url` as Markdown link, e.g. `[Open checkout](...)`, plus amount.
    6. If checkout unavailable and API only includes `billing_url`, share billing fallback.
    7. After payment confirmation, retry original mutating req.

    If `insufficient_credits` or `invalid_topup_credits` returns limits, use them. Example: `10 credits is below the minimum. Smallest top-up is 100 credits for $10. Want me to create that checkout session?`

13. **API failures.** Do smallest next action.

    - `running_timer_exists`: Fetch running timer, explain, ask whether to switch.
    - `insufficient_credits`: Step 12.
    - `invalid_api_key`: Explain replacement key rotates account key, step 3.
    - `started_at_required`, `completed_entry_requires_ended_at`, `running_entry_cannot_have_ended_at`, `ended_at_before_started_at`: Fix payload; ask only if requested time ambiguous.
    - `agent_utility_record_not_found`: Ask for record id, or list recent candidates if user asked about "that entry".
    - `invalid_topup_credits`: Give smallest valid next action from API response. Example: `10 credits is below the minimum. Smallest top-up is 100 credits for $10. Want me to create that checkout session?` Do not share `billing_url` unless checkout unavailable.
    - `failed_to_create_agent_utility_record`, `failed_to_patch_agent_utility_record`, `failed_to_archive_agent_utility_record`: State whether anything changed before failure. Do not pretend timer changed.
    - Missing API key: Step 3.

    Do not restart full workflow unless error requires it.

14. **Report.** Crisp, operational, auditable.

    Start template:

    ```markdown
    Started the timer.

    - Record ID: `[id]`
    - Title: `[title]`
    - Started: `[started_at]`
    - Labels: `[project/client/flex or none]`
    ```

    Stop template:

    ```markdown
    Stopped the timer.

    - Record ID: `[id]`
    - Title: `[title]`
    - Time: `[started_at]` to `[ended_at]`
    - Duration: `[rounded duration]`
    - Labels: `[project/client/flex or none]`
    ```

    Rules:

    - Ask only missing/ambiguous required info.
    - Ask exactly one direct follow-up question at a time.
    - Do not dump API metadata.
    - Do not store secrets in skill file.
    - Mention credits remaining when API returns it.
    - Failures: state whether any record changed before failure.
