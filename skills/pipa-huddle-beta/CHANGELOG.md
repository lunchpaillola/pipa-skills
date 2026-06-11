# Changelog

## v0.1.1

- Changed hosted and local huddle launches to use the managed daemon JSON path by default, so the bridge is not tied to the launching shell or tool-call lifetime.
- Added project-local daemon metadata cleanup and safe replacement of only the previously recorded Pipa Huddle bridge.
- Clarified hosted relay lifecycle behavior: unused pairing links still expire after about 15 minutes, paired idle sessions end after about 10 minutes, and manual end revokes immediately.
- Switched launch context guidance from `.pipa/voice-session/launch-context.md` files to inline `PIPA_VOICE_SESSION_CONTEXT` only when there is substantive prior conversation context.
- Added script-level test coverage for daemon lifecycle, metadata cleanup, stale PID safety, browser end handling, and first-turn prompt context handling.

## v0.1.0

- Initial Pipa Huddle Beta skill release.
