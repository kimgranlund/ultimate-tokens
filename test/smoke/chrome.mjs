// chrome.mjs owns one headless-Chrome run: its own profile directory, its own OS-chosen CDP port
// (read back from Chrome's own DevToolsActivePort file, never a fixed port another run or another
// stranger could be squatting), and one idempotent cleanup reachable from every exit path.
//
// Two exports, nothing else: launchChrome() spawns the browser and returns close() reachable
// SYNCHRONOUSLY, before discovery finishes, plus a `ready` promise that resolves once the port is
// announced; onExit() wires a cleanup function to every path a process can leave by (a normal
// finally, process "exit", and SIGINT/SIGTERM/SIGHUP), each reporting the exit code a shell would
// have printed for an unhandled signal, so a CI `timeout` or a plain `kill` reads the same number.
//
// The synchronous return matters: a signal can land while `ready` is still pending (Chrome start-up
// can take several seconds), and a caller that only gets `close` after awaiting `ready` would run a
// no-op close() for that whole window, leaking the browser and its profile directory (see leg (f)).
import { spawn } from "node:child_process";
import { mkdtempSync, existsSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// A blocking pause: close() must stay synchronous, since the signal path calls process.exit() right
// after it and an awaited timer would never fire.
const pauseSync = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

// removeDir(dir) deletes the profile directory and keeps deleting it until it has stayed gone for
// three checks 50 ms apart, for up to 2 s. One rmSync is not enough: a Chrome helper still dying
// can write an atomic-save temp file into Default/ mid-deletion (ENOTEMPTY) or just after it.
// A directory that survives the whole window is reported on stderr, never swallowed.
function removeDir(dir) {
  let lastErr = null, goneChecks = 0;
  for (let waited = 0; waited <= 2000; waited += 50) {
    if (existsSync(dir)) {
      goneChecks = 0;
      try { rmSync(dir, { recursive: true, force: true }); } catch (e) { lastErr = e; }
    } else if (++goneChecks >= 3) {
      return;
    }
    pauseSync(50);
  }
  if (existsSync(dir)) console.error(`chrome.mjs: profile dir ${dir} still present 2s after close()${lastErr ? `: ${lastErr.message}` : ""}`);
}

// launchChrome(bin, extraArgs, { deadlineMs }) -> { proc, dir, close, ready }
// `ready` resolves to { port } once DevToolsActivePort is discovered, or rejects (after calling
// close() itself) if deadlineMs passes first, if the browser exits first, or if close() ran first.
export function launchChrome(bin, extraArgs = [], { deadlineMs = 45000 } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "ultimate-tokens-smoke-"));
  const activePortFile = join(dir, "DevToolsActivePort");

  const proc = spawn(bin, [
    ...extraArgs,
    "--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage",
    "--remote-debugging-port=0", "--hide-scrollbars", "--window-size=1440,900",
    `--user-data-dir=${dir}`, "about:blank",
  ], { stdio: "ignore", detached: true });

  // proc and dir are captured in this closure at spawn time, before the poll below, so close()
  // reaches a browser that was spawned and not yet discovered if a signal lands during the wait,
  // and close is returned to the caller in the SAME synchronous call, not after `ready` settles.
  // `detached: true` makes the browser lead its own process group, so one SIGKILL to -pid reaches
  // its helpers too (the network service that writes into the profile is not the process `proc`
  // names); removeDir() then covers a helper that is not in the group or not yet dead.
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    try { process.kill(-proc.pid, "SIGKILL"); } catch {
      try { proc.kill("SIGKILL"); } catch { /* already gone */ }
    }
    removeDir(dir);
  };

  // A browser that exits before announcing its port (a crash, a missing library on a CI runner, a
  // binary that will not spawn) ends the wait at once with its exit status, instead of polling out
  // the whole deadline and reporting "no response". The "error" listener also keeps a failed spawn
  // from crashing the caller as an unhandled ChildProcess error.
  let exited = null;
  proc.once("exit", (code, signal) => { exited = signal ? `signal ${signal}` : `code ${code}`; });
  proc.once("error", (e) => { exited = e.message; });

  const ready = (async () => {
    const POLL_MS = 400;
    let lastReason = "no response";
    for (let waited = 0; waited < deadlineMs; waited += POLL_MS) {
      if (closed) throw new Error("Chrome was closed before CDP came up");
      if (exited) { close(); throw new Error(`Chrome exited before CDP came up (${exited})`); }
      if (existsSync(activePortFile)) {
        try {
          const lines = readFileSync(activePortFile, "utf8").split("\n");
          const port = Number(lines[0]);
          if (Number.isInteger(port) && port > 0) return { port };
          lastReason = `unparsed DevToolsActivePort line: ${lines[0]}`;
        } catch (e) { lastReason = e.message; }
      }
      await sleep(POLL_MS);
    }
    close();
    throw new Error(`Chrome CDP did not come up within ${deadlineMs / 1000}s (last: ${lastReason})`);
  })();

  return { proc, dir, close, ready };
}

// onExit(fn) runs fn() on a normal "exit" and on SIGINT/SIGTERM/SIGHUP; a signal handler runs
// fn() then re-raises the shell exit code for that signal (128 + signal number: 130, 143, 129) so
// a caller reading the process's own exit code sees what an unhandled signal would have reported.
const SIGNAL_CODES = { "SIGHUP": 129, "SIGINT": 130, "SIGTERM": 143 };
export function onExit(fn) {
  process.on("exit", fn);
  for (const sig of Object.keys(SIGNAL_CODES)) {
    process.on(sig, () => { fn(); process.exit(SIGNAL_CODES[sig]); });
  }
}
