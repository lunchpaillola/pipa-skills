import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { chmodSync, existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";

const scriptPath = path.join(import.meta.dirname, "start-voice-session.mjs");

function processAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (_error) {
    return false;
  }
}

async function waitUntil(predicate, timeoutMs = 2_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.fail("condition was not met before timeout");
}

async function waitForExit(child, timeoutMs = 2_000) {
  if (child.exitCode !== null) return child.exitCode;
  return await Promise.race([
    new Promise((resolve) => child.once("exit", (code) => resolve(code))),
    new Promise((_, reject) => setTimeout(() => reject(new Error("process did not exit before timeout")), timeoutMs))
  ]);
}

function runCli(args, env) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: path.join(import.meta.dirname, "..", "..", ".."),
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk.toString(); });
    child.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    child.on("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("managed daemon launch stops the previously recorded huddle bridge", async () => {
  const runtimeDir = mkdtempSync(path.join(tmpdir(), "pipa-voice-session-"));
  const previousBridge = spawn(process.execPath, [scriptPath, "--local"], {
    env: {
      ...process.env,
      PIPA_VOICE_SESSION_RUNTIME_DIR: runtimeDir,
      PIPA_VOICE_SESSION_PORT: String(17_000 + Math.floor(Math.random() * 1_000))
    },
    stdio: ["ignore", "ignore", "ignore"]
  });

  const env = {
    PIPA_VOICE_SESSION_RUNTIME_DIR: runtimeDir,
    PIPA_VOICE_SESSION_PORT: String(18_000 + Math.floor(Math.random() * 1_000))
  };

  try {
    mkdirSync(runtimeDir, { recursive: true });
    writeFileSync(path.join(runtimeDir, "bridge.pid"), `${previousBridge.pid}\n`);
    writeFileSync(path.join(runtimeDir, "session.json"), `${JSON.stringify({
      pid: previousBridge.pid,
      script_path: scriptPath,
      managed_by: "pipa-huddle-beta"
    })}\n`);

    assert.equal(processAlive(previousBridge.pid), true);

    const result = await runCli(["--daemon", "--print-url-json", "--local"], env);

    assert.equal(result.code, 0, result.stderr);
    await waitUntil(() => previousBridge.exitCode !== null);

    const event = result.stdout
      .trim()
      .split(/\r?\n/)
      .map((line) => JSON.parse(line))
      .find((item) => item.event === "voice_session_daemon_started");

    assert.ok(event, result.stdout);
    assert.equal(event.event, "voice_session_daemon_started");
    assert.equal(event.ok, true);
    assert.equal(event.mode, "local");
    assert.equal(typeof event.pid, "number");
    assert.match(event.stop_command, new RegExp(`kill ${event.pid}`));
    assert.equal(event.browser_url.startsWith("http://127.0.0.1:"), true);
    assert.equal(event.log_path, path.join(runtimeDir, "bridge.log"));

    const metadata = JSON.parse(readFileSync(path.join(runtimeDir, "session.json"), "utf8"));
    assert.equal(metadata.pid, event.pid);
    assert.equal(metadata.script_path, scriptPath);

    if (processAlive(event.pid)) process.kill(event.pid, "SIGTERM");
  } finally {
    if (processAlive(previousBridge.pid)) process.kill(previousBridge.pid, "SIGTERM");
    rmSync(runtimeDir, { recursive: true, force: true });
  }
});

test("managed daemon launch does not stop an unrelated process from stale metadata", async () => {
  const runtimeDir = mkdtempSync(path.join(tmpdir(), "pipa-voice-session-"));
  const unrelatedProcess = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], {
    detached: true,
    stdio: "ignore"
  });
  unrelatedProcess.unref();

  const env = {
    PIPA_VOICE_SESSION_RUNTIME_DIR: runtimeDir,
    PIPA_VOICE_SESSION_PORT: String(20_000 + Math.floor(Math.random() * 1_000))
  };

  try {
    mkdirSync(runtimeDir, { recursive: true });
    writeFileSync(path.join(runtimeDir, "bridge.pid"), `${unrelatedProcess.pid}\n`);
    writeFileSync(path.join(runtimeDir, "session.json"), `${JSON.stringify({
      pid: unrelatedProcess.pid,
      script_path: scriptPath,
      managed_by: "pipa-huddle-beta"
    })}\n`);

    const result = await runCli(["--daemon", "--print-url-json", "--local"], env);

    assert.equal(result.code, 0, result.stderr);
    assert.equal(processAlive(unrelatedProcess.pid), true);

    const event = result.stdout
      .trim()
      .split(/\r?\n/)
      .map((line) => JSON.parse(line))
      .find((item) => item.event === "voice_session_daemon_started");
    if (event && processAlive(event.pid)) process.kill(event.pid, "SIGTERM");
  } finally {
    if (processAlive(unrelatedProcess.pid)) process.kill(unrelatedProcess.pid, "SIGTERM");
    rmSync(runtimeDir, { recursive: true, force: true });
  }
});

test("local bridge exits when the browser session ends", async () => {
  const runtimeDir = mkdtempSync(path.join(tmpdir(), "pipa-voice-session-"));
  const port = 19_000 + Math.floor(Math.random() * 1_000);
  const child = spawn(process.execPath, [scriptPath, "--local"], {
    cwd: path.join(import.meta.dirname, "..", "..", ".."),
    env: {
      ...process.env,
      PIPA_VOICE_SESSION_RUNTIME_DIR: runtimeDir,
      PIPA_VOICE_SESSION_PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitUntil(async () => {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/api/status`);
        return response.ok;
      } catch (_error) {
        return false;
      }
    });

    const response = await fetch(`http://127.0.0.1:${port}/api/end`, { method: "POST" });
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.equal(body.state, "ended");
    assert.equal(await waitForExit(child), 0);
  } finally {
    if (processAlive(child.pid)) process.kill(child.pid, "SIGTERM");
    rmSync(runtimeDir, { recursive: true, force: true });
  }
});

test("managed daemon exits and clears metadata when the browser session ends", async () => {
  const runtimeDir = mkdtempSync(path.join(tmpdir(), "pipa-voice-session-"));
  const env = {
    PIPA_VOICE_SESSION_RUNTIME_DIR: runtimeDir,
    PIPA_VOICE_SESSION_PORT: String(21_000 + Math.floor(Math.random() * 1_000))
  };
  let daemonPid = 0;

  try {
    const result = await runCli(["--daemon", "--print-url-json", "--local"], env);
    assert.equal(result.code, 0, result.stderr);

    const event = result.stdout
      .trim()
      .split(/\r?\n/)
      .map((line) => JSON.parse(line))
      .find((item) => item.event === "voice_session_daemon_started");

    assert.ok(event, result.stdout);
    daemonPid = event.pid;

    await waitUntil(async () => {
      try {
        const response = await fetch(`${event.browser_url}/api/status`);
        return response.ok;
      } catch (_error) {
        return false;
      }
    });

    const response = await fetch(`${event.browser_url}/api/end`, { method: "POST" });
    assert.equal(response.status, 200);

    await waitUntil(() => !processAlive(daemonPid));
    assert.equal(processAlive(daemonPid), false);
    assert.equal(existsSync(path.join(runtimeDir, "bridge.pid")), false);
    assert.equal(existsSync(path.join(runtimeDir, "session.json")), false);
  } finally {
    if (daemonPid && processAlive(daemonPid)) process.kill(daemonPid, "SIGTERM");
    rmSync(runtimeDir, { recursive: true, force: true });
  }
});

test("managed daemon launch fails instead of reporting ready when local bridge cannot listen", async () => {
  const runtimeDir = mkdtempSync(path.join(tmpdir(), "pipa-voice-session-"));
  const port = 23_000 + Math.floor(Math.random() * 1_000);
  const blocker = createServer((_req, res) => {
    res.writeHead(200);
    res.end("occupied");
  });

  await new Promise((resolve) => blocker.listen(port, "127.0.0.1", resolve));

  try {
    const result = await runCli(["--daemon", "--print-url-json", "--local"], {
      PIPA_VOICE_SESSION_RUNTIME_DIR: runtimeDir,
      PIPA_VOICE_SESSION_PORT: String(port)
    });

    assert.equal(result.code, 1);
    assert.doesNotMatch(result.stdout, /voice_session_daemon_started/);
    assert.match(result.stdout, /voice_session_failed/);
    assert.equal(existsSync(path.join(runtimeDir, "session.json")), false);
  } finally {
    await new Promise((resolve) => blocker.close(resolve));
    rmSync(runtimeDir, { recursive: true, force: true });
  }
});

test("first huddle prompt treats launch context as prior conversation, not a launch task", async () => {
  const runtimeDir = mkdtempSync(path.join(tmpdir(), "pipa-voice-session-"));
  const port = 22_000 + Math.floor(Math.random() * 1_000);
  const promptPath = path.join(runtimeDir, "prompt.txt");
  const fakeOpenCodePath = path.join(runtimeDir, "opencode-fake.mjs");
  const launchContext = "The user was comparing launch-context options and wants the huddle to continue that conversation.";

  writeFileSync(fakeOpenCodePath, `#!/usr/bin/env node
import { writeFileSync } from "node:fs";
writeFileSync(process.env.CAPTURE_PROMPT_PATH, process.argv[3] || "");
console.log(JSON.stringify({ sessionID: "huddle-test-session" }));
console.log(JSON.stringify({ type: "text", part: { text: "Ready to continue." } }));
`);
  chmodSync(fakeOpenCodePath, 0o755);

  const child = spawn(process.execPath, [scriptPath, "--local"], {
    cwd: path.join(import.meta.dirname, "..", "..", ".."),
    env: {
      ...process.env,
      CAPTURE_PROMPT_PATH: promptPath,
      OPENCODE_BIN: fakeOpenCodePath,
      PIPA_VOICE_SESSION_CONTEXT: launchContext,
      PIPA_VOICE_SESSION_RUNTIME_DIR: runtimeDir,
      PIPA_VOICE_SESSION_PORT: String(port)
    },
    stdio: ["ignore", "pipe", "pipe"]
  });

  try {
    await waitUntil(async () => {
      try {
        const response = await fetch(`http://127.0.0.1:${port}/api/status`);
        return response.ok;
      } catch (_error) {
        return false;
      }
    });

    const response = await fetch(`http://127.0.0.1:${port}/api/turn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Oh I just wanted to try this out and see how it would work" })
    });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.reply, "Ready to continue.");

    const prompt = readFileSync(promptPath, "utf8");
    assert.match(prompt, /You are currently in a Pipa Huddle with the user/);
    assert.match(prompt, /prior conversation context from before the huddle/);
    assert.doesNotMatch(prompt, /You are starting a new Pipa Huddle voice session/);
    assert.doesNotMatch(prompt, /Opening User Intent/);
  } finally {
    if (processAlive(child.pid)) process.kill(child.pid, "SIGTERM");
    rmSync(runtimeDir, { recursive: true, force: true });
  }
});
