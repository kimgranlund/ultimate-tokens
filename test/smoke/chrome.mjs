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
  ], { stdio: "ignore" });

  // proc and dir are captured in this closure at spawn time, before the poll below, so close()
  // reaches a browser that was spawned and not yet discovered if a signal lands during the wait,
  // and close is returned to the caller in the SAME synchronous call, not after `ready` settles.
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    try { proc.kill("SIGKILL"); } catch { /* already gone */ }
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* already gone */ }
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
