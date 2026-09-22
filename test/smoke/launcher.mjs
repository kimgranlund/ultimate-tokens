#!/usr/bin/env node
// launcher.mjs is the unit test for chrome.mjs's process lifecycle. Runs without Chrome and without
// a build: test/smoke/fixtures/fake-chrome.mjs stands in for the browser, so this proves discovery,
// close(), and every signal/deadline exit path on any host. Six legs, each one pass/FAIL line;
// the file exits 1 on any FAIL. Not registered in test/run.mjs (see the plan); it runs from the
// `smoke` script and from `node test/smoke/launcher.mjs` directly.
//
// `--child` is a second entry point used by legs (c) and (d): a child process that awaits the
// fixture's discovery, installs onExit, prints "<fake pid> <dir>" on its own stdout, then waits to
// be signalled. `--child-before-discovery` is a third entry point used by leg (f): it installs
// onExit and prints "<fake pid> <dir>" the moment the fixture is spawned, without waiting for
// discovery, so the parent can signal it while the launch is still pending.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { launchChrome, onExit } from "./chrome.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const SELF = fileURLToPath(import.meta.url);
const FIXTURE = resolve(HERE, "fixtures/fake-chrome.mjs");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isAlive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
const waitUntil = async (pred, deadlineMs) => {
  const step = 100;
  for (let waited = 0; waited < deadlineMs; waited += step) {
    if (pred()) return true;
    await sleep(step);
  }
  return pred();
};

// --- child entry points --------------------------------------------------------------------
// legs (c) and (d): onExit is installed only after the launch has fully resolved (the path legs
// c/d have always exercised; leg (f) below is what covers the still-pending window).
async function childMain() {
  const { proc, dir, close, ready } = launchChrome(process.execPath, [FIXTURE]);
  await ready;
  onExit(close);
  console.log(`${proc.pid} ${dir}`);
  await new Promise(() => {}); // wait for the parent's signal
}

// leg (f): onExit is installed in the SAME tick as the launch, using the close() launchChrome
// returns synchronously, proving a signal that lands before `ready` settles still reaches the
// browser it spawned, not a still-no-op cleanup.
async function childBeforeDiscoveryMain() {
  const { proc, dir, close } = launchChrome(process.execPath, [FIXTURE]);
  onExit(close);
  console.log(`${proc.pid} ${dir}`);
  await new Promise(() => {}); // wait for the parent's signal, discovery never awaited here
}

if (process.argv.includes("--child-before-discovery")) {
  await childBeforeDiscoveryMain();
} else if (process.argv.includes("--child")) {
  await childMain();
} else {
  await main();
}

// --- legs --------------------------------------------------------------------------------------
async function legA() {
  const { dir, close, ready } = launchChrome(process.execPath, [FIXTURE]);
  try {
    const { port } = await ready;
    const fileLine1 = readFileSync(join(dir, "DevToolsActivePort"), "utf8").split("\n")[0];
    if (String(port) !== fileLine1) throw new Error(`port ${port} !== DevToolsActivePort line 1 (${fileLine1})`);
    const res = await fetch(`http://127.0.0.1:${port}/json/version`);
    const json = await res.json();
    if (json.Browser !== "fake-chrome/1") throw new Error(`json/version returned ${JSON.stringify(json)}`);
  } finally {
    close();
  }
}

async function legB() {
  const { proc, dir, close, ready } = launchChrome(process.execPath, [FIXTURE]);
  await ready;
  close();
  const gone = await waitUntil(() => !isAlive(proc.pid), 2000);
  if (!gone) throw new Error(`fake pid ${proc.pid} still alive 2s after close()`);
  if (existsSync(dir)) throw new Error(`profile dir ${dir} still present after close()`);
  close(); // idempotent: a second call must not throw
}

// legs (c), (d) and (f): spawn a `--child*`, read its "<pid> <dir>" line, wait `delayMs` then
// signal the child, check the fake's pid and profile dir are gone. The child's own exit code is
// printed, not asserted (an unhandled signal reports the same code as a handled one, so it proves
// nothing on its own).
function runSignalLeg(signal, { childFlag = "--child", env = process.env, delayMs = 200 } = {}) {
  return new Promise((settle, reject) => {
    const child = spawn(process.execPath, [SELF, childFlag], { stdio: ["ignore", "pipe", "pipe"], env });
    let buf = "";
    let fakePid = null, dir = null, signalled = false;
    const timer = setTimeout(() => { reject(new Error(`${childFlag} did not print "<pid> <dir>" within 5s`)); }, 5000);
    child.stdout.on("data", (d) => {
      buf += d.toString();
      const m = buf.match(/^(\d+) (.+)$/m);
      if (m && !signalled) {
        signalled = true;
        fakePid = Number(m[1]); dir = m[2];
        setTimeout(() => child.kill(signal), delayMs);
      }
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      settle({ fakePid, dir, childExitCode: code });
    });
  });
}

async function legSignal(signal, opts) {
  const { fakePid, dir, childExitCode } = await runSignalLeg(signal, opts);
  if (fakePid == null) throw new Error("child never printed a pid/dir line");
  const gone = await waitUntil(() => !isAlive(fakePid), 2000);
  if (!gone) throw new Error(`fake pid ${fakePid} still alive 2s after ${signal} (child exit ${childExitCode})`);
  if (existsSync(dir)) throw new Error(`profile dir ${dir} still present after ${signal} (child exit ${childExitCode})`);
}

// leg (f): FAKE_CHROME_DELAY_MS=3000 makes the fixture write DevToolsActivePort only after 3s, so
// the SIGTERM sent at 1s (delayMs below) lands while launchChrome()'s `ready` is still pending,
// the exact window finding 1 of the U1 review identified as leaking. The child installs onExit
// with the SAME-TICK close() (childBeforeDiscoveryMain), never awaiting `ready` itself.
async function legF() {
  await legSignal("SIGTERM", {
    childFlag: "--child-before-discovery",
    env: { ...process.env, FAKE_CHROME_DELAY_MS: "3000" },
    delayMs: 1000,
  });
}

// leg (e): FAKE_CHROME_MUTE=1 means the fixture never writes DevToolsActivePort, so launchChrome
// must hit its deadline, clean up, and reject. TMPDIR is scoped to a scratch dir for this leg (the
// same needle the real-browser criteria use) so the process/directory check cannot see another
// run's Chrome and needs no exact pid.
async function legE() {
  const scratch = mkdtempSync(join(tmpdir(), "launcher-legE-"));
  const prevTmpdir = process.env.TMPDIR;
  process.env.TMPDIR = scratch;
  process.env.FAKE_CHROME_MUTE = "1";
  let threw = null;
  try {
    const { ready } = launchChrome(process.execPath, [FIXTURE], { deadlineMs: 1500 });
    await ready;
  } catch (e) {
    threw = e;
  } finally {
    delete process.env.FAKE_CHROME_MUTE;
    process.env.TMPDIR = prevTmpdir;
  }
  try {
    if (!threw || !/^Chrome CDP did not come up within/.test(threw.message)) {
      throw new Error(`expected a deadline rejection, got ${threw ? threw.message : "no error"}`);
    }
    const needle = `user-data-dir=${scratch}/ultimate-tokens-smoke-`;
    const noProc = await waitUntil(() => {
      try { execFileSync("pgrep", ["-f", needle], { stdio: "pipe" }); return false; }
      catch { return true; } // pgrep exits 1 when nothing matches
    }, 2000);
    if (!noProc) throw new Error(`a fake-chrome process matching ${needle} is still alive 2s after the deadline`);
    const leftover = existsSync(scratch) ? readdirSync(scratch).filter((n) => n.startsWith("ultimate-tokens-smoke-")) : [];
    if (leftover.length) throw new Error(`leftover profile dir(s) under ${scratch}: ${leftover.join(", ")}`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

// --- runner --------------------------------------------------------------------------------------
async function main() {
  const legs = [
    ["discovers its port from DevToolsActivePort and answers /json/version", legA],
    ["leaves no process or directory after close()", legB],
    ["leaves no process or directory after SIGTERM", () => legSignal("SIGTERM")],
    ["leaves no process or directory after SIGINT", () => legSignal("SIGINT")],
    ["leaves no process or directory after a deadline with no DevToolsActivePort", legE],
    ["leaves no process or directory after a signal while discovery is still pending", legF],
  ];
  const fails = [];
  for (const [label, fn] of legs) {
    try {
      await fn();
      console.log(`  pass  ${label}`);
    } catch (e) {
      console.log(`  FAIL  ${label}: ${e.message}`);
      fails.push(label);
    }
  }
  if (fails.length) {
    console.error(`\nFAIL: launcher (${fails.length}/${legs.length} legs failed)`);
    process.exit(1);
  }
  console.log("\nPASS: launcher discovers its port from DevToolsActivePort and leaves no process on close, SIGTERM, SIGINT or deadline");
  process.exit(0);
}
