// fake-chrome.mjs is a stand-in for a real Chrome binary, for test/smoke/launcher.mjs. Started as
// `process.execPath <this file> --remote-debugging-port=0 --user-data-dir=<dir> ...`, exactly the
// argv shape launchChrome() passes a real browser. Reads the same two flags a real Chrome reads,
// listens on an OS-chosen port, answers /json/version like a real DevTools endpoint, and writes
// DevToolsActivePort into the profile directory the way real Chrome does. FAKE_CHROME_MUTE=1 skips
// that write, simulating a browser that never comes up (the launcher's deadline path).
// FAKE_CHROME_DELAY_MS=<ms> delays the write instead of skipping it, simulating a browser that is
// still starting up (the launcher's signal-before-discovery path, leg (f)).
//
// Under every mode it first spawns one long-lived grandchild, not detached, so it shares this
// process's group the way a real Chrome's renderer and GPU helpers share the browser's, and writes
// the grandchild's pid to fake-chrome-grandchild.pid in the profile directory. A close() that kills
// only this pid leaves the grandchild behind, and launcher.mjs legs (b) to (f) read that file to
// catch it. The grandchild carries the marker `fake-chrome-grandchild` in its argv (for pgrep) and
// exits on its own after 60 s, so a red run cannot leave it behind for good.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const args = process.argv.slice(2);
const portArg = args.find((a) => a.startsWith("--remote-debugging-port="));
const dirArg = args.find((a) => a.startsWith("--user-data-dir="));
const port = portArg ? portArg.slice("--remote-debugging-port=".length) : null;
const dir = dirArg ? dirArg.slice("--user-data-dir=".length) : null;

// A launcher that regressed to a fixed, non-zero port would still "work" against a fixture that
// tolerated it; refusing anything but "0" here makes that regression fail leg (a) outright.
if (port !== "0") { console.error(`fake-chrome: expected --remote-debugging-port=0, got ${portArg}`); process.exit(2); }
if (!dir) { console.error("fake-chrome: missing --user-data-dir"); process.exit(2); }

// One statement on purpose: deleting it removes the grandchild and its pid file together, and the
// legs must then red on the missing file rather than pass with no grandchild to check.
writeFileSync(join(dir, "fake-chrome-grandchild.pid"), `${spawn(process.execPath, ["-e", "setTimeout(() => {}, 60000)", "fake-chrome-grandchild"], { stdio: "ignore" }).pid}\n`);

const server = createServer((req, res) => {
  if (req.url === "/json/version") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ Browser: "fake-chrome/1" }));
    return;
  }
  res.writeHead(404); res.end();
});

server.listen(0, "127.0.0.1", () => {
  const realPort = server.address().port;
  const writeActivePort = () => writeFileSync(join(dir, "DevToolsActivePort"), `${realPort}\n/devtools/browser/fake\n`);
  if (process.env.FAKE_CHROME_MUTE) {
    // never come up
  } else if (process.env.FAKE_CHROME_DELAY_MS) {
    setTimeout(writeActivePort, Number(process.env.FAKE_CHROME_DELAY_MS));
  } else {
    writeActivePort();
  }
  // stay alive until killed, the way a real headless Chrome does
});
