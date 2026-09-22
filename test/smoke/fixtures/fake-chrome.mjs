// fake-chrome.mjs is a stand-in for a real Chrome binary, for test/smoke/launcher.mjs. Started as
// `process.execPath <this file> --remote-debugging-port=0 --user-data-dir=<dir> ...`, exactly the
// argv shape launchChrome() passes a real browser. Reads the same two flags a real Chrome reads,
// listens on an OS-chosen port, answers /json/version like a real DevTools endpoint, and writes
// DevToolsActivePort into the profile directory the way real Chrome does. FAKE_CHROME_MUTE=1 skips
// that write, simulating a browser that never comes up (the launcher's deadline path).
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
  if (!process.env.FAKE_CHROME_MUTE) {
    writeFileSync(join(dir, "DevToolsActivePort"), `${realPort}\n/devtools/browser/fake\n`);
  }
  // stay alive until killed, the way a real headless Chrome does
});
