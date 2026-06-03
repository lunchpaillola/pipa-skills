# Pipa Voice Session Prototype Testing

Run the operational skill script from the repository root:

```bash
node skills/pipa-voice-session/scripts/start-voice-session.mjs
```

Open `http://127.0.0.1:8787`.

## Manual Scenarios

1. **Page loads**
   Verify the page shows mic controls, transcript area, session-state panel, privacy note, end/clear action, and handoff preview.

2. **OpenCode bridge responds**
   Type a debug text turn. Verify the transcript updates, the page says it is sending to OpenCode, and the reply is a real OpenCode response.

3. **Handoff preview works**
   Click `Generate Handoff Preview`. Verify the handoff includes topic, useful context, decisions/preferences, open questions, recommended next step, and continuation prompt.

4. **Raw transcript cleanup works**
   Click `End / Clear Raw Transcript`. Verify transcript turns disappear and handoff resets.

5. **Browser voice available path**
   In a browser with speech recognition support, click `Start Browser Voice`, grant mic access, speak one turn, and verify the recognized turn is sent to OpenCode.

6. **Mic denied path**
   Deny microphone access. Verify the page adds a clear blocker and still supports debug text turns through OpenCode.

7. **Speech API unavailable path**
   Open in a browser without `SpeechRecognition`. Verify the status says STT is unavailable and debug text turns remain usable.

8. **Insecure context path**
   Serve in a non-local insecure context. Verify the secure-context status warns appropriately and mic behavior does not get misrepresented.

9. **LAN warning path**
   Serve on a non-local hostname or `0.0.0.0` and open via LAN address. Verify the LAN warning appears.

## Expected Limits

- No automatic OpenCode tool approval or live shell/file control by voice.
- No durable transcript persistence.
- No Daily/WebRTC hosted room.
- No spoken approval for tools, files, or shell commands.
