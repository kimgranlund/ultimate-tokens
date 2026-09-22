#!/usr/bin/env node
// launcher.mjs is the unit test for chrome.mjs's process lifecycle. Runs without Chrome and without
// a build: test/smoke/fixtures/fake-chrome.mjs stands in for the browser, so this proves discovery,
// close(), and every signal/deadline exit path on any host. Five legs, each one pass/FAIL line;
// the file exits 1 on any FAIL. Not registered in test/run.mjs (see the plan); it runs from the
// `smoke` script and from `node test/smoke/launcher.mjs` directly.
//
// `--child` is a second entry point used by legs (c) and (d): a child process that launches the
// fixture, installs onExit, prints "<fake pid> <dir>" on its own stdout, then waits to be signalled.
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

// --- child entry point (legs c, d) -----------------------------------------------------------
async function childMain() {
  const { proc, dir, close } = await launchChrome(process.execPath, [FIXTURE]);
  onExit(close);
  console.log(`${proc.pid} ${dir}`);
  await new Promise(() => {}); // wait for the parent's signal
}

if (process.argv.includes("--child")) {
  await childMain();
} else {
  await main();
}

// --- legs --------------------------------------------------------------------------------------
async function legA() {
  const { port, dir, close } = await launchChrome(process.execPath, [FIXTURE]);
  try {
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
  const { proc, dir, close } = await launchChrome(process.execPath, [FIXTURE]);
  close();
  const gone = await waitUntil(() => !isAlive(proc.pid), 2000);
  if (!gone) throw new Error(`fake pid ${proc.pid} still alive 2s after close()`);
  if (existsSync(dir)) throw new Error(`profile dir ${dir} still present after close()`);
  close(); // idempotent: a second call must not throw
}

// legs (c) and (d): spawn a --child, read its "<pid> <dir>" line, signal the child, check the
// fake's pid and profile dir are gone. The child's own exit code is printed, not asserted (an
// unhandled signal reports the same code as a handled one, so it proves nothing on its own).
function runSignalLeg(signal) {
  return new Promise((settle, reject) => {
    const child = spawn(process.execPath, [SELF, "--child"], { stdio: ["ignore", "pipe", "pipe"] });
    let buf = "";
    let fakePid = null, dir = null, signalled = false;
    const timer = setTimeout(() => { reject(new Error(`--child did not print "<pid> <dir>" within 5s`)); }, 5000);
    child.stdout.on("data", (d) => {
      buf += d.toString();
      const m = buf.match(/^(\d+) (.+)$/m);
      if (m && !signalled) {
        signalled = true;
        fakePid = Number(m[1]); dir = m[2];
        setTimeout(() => child.kill(signal), 200);
      }
    });
    child.on("exit", (code) => {
      clearTimeout(timer);
      settle({ fakePid, dir, childExitCode: code });
    });
  });
}

async function legSignal(signal) {
  const { fakePid, dir, childExitCode } = await runSignalLeg(signal);
  if (fakePid == null) throw new Error("child never printed a pid/dir line");
  const gone = await waitUntil(() => !isAlive(fakePid), 2000);
  if (!gone) throw new Error(`fake pid ${fakePid} still alive 2s after ${signal} (child exit ${childExitCode})`);
  if (existsSync(dir)) throw new Error(`profile dir ${dir} still present after ${signal} (child exit ${childExitCode})`);
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
    await launchChrome(process.execPath, [FIXTURE], { deadlineMs: 1500 });
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
