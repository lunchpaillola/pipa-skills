# Changelog

## v0.1.0

- Initial Pipa Follow-Up Reminders skill draft.
- Documents create and cancel workflows for one-shot self-reminders.
- Documents gateway-injected credentials, repo-local `.pipa/credentials`, and email-code setup.
- Clarifies that successful local email-code verification should automatically persist credentials to `.pipa/credentials` for future runs.
- Reinforces that `.pipa/` must be ignored before writing credentials and that the API key must not be printed.
- Notes that email-code setup rotates the user's account key and revokes prior keys.
- Captures dogfooded API failures: `recipient_not_verified`, `due_at_not_future`, and `invalid_api_key`.
- Documents `credits_remaining`, `insufficient_credits`, and the current `active_reminder_limit_reached` API error.
- Clarifies that Follow-Up uses the existing Pipa credit balance and billing URL rather than a separate Follow-Up credit ledger.
