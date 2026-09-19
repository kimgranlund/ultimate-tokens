#!/usr/bin/env node
// gate-report.mjs -- the meta-test for test/gate-report.mjs itself (#699 fold F1). The 13 gate
// files that call gateReport() each get their own real-suite coverage of THEIR gates, but nothing
// exercised gateReport()'s own two behaviours directly: the union print (an undeclared name that
// fires still gets a row and the "!!!" flag) and the report-static self-check (a declared name
// with no call site, or a call site with no declared name, reds on its own). A revert of the
// union print back to declared-only printing (`for (const g of declared)`) would leave all 47
// other suites green -- that's the exact hole this ticket exists to close, so it needs a test of
// its own, not just a hand-verified claim in a review.
//
// Every scenario below drives gateReport() directly with a synthetic fails/declared/FAIL, using
// the two small fixtures under fixtures/ as gateReport()'s `selfUrl` -- gateReport()'s static
// check reads that file's TEXT via a regex (see test/gate-report.mjs's own header), so a fixture
// stands in for "a gate file" without needing to be a runnable one.
import { gateReport } from "../gate-report.mjs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
// gateReport() does `new URL(selfUrl)` internally, so this must be a file:// URL string, not a
// plain filesystem path (the same shape every real caller passes via its own `import.meta.url`).
const CLEAN = pathToFileURL(join(HERE, "fixtures", "gate-report-clean.mjs")).href;
const MISMATCH = pathToFileURL(join(HERE, "fixtures", "gate-report-mismatch.mjs")).href;
const SINGLEQUOTE = pathToFileURL(join(HERE, "fixtures", "gate-report-singlequote.mjs")).href;

let failed = 0;
const FAIL = (name, msg) => { failed++; console.log(`  ✗ ${name}: ${msg}`); };

// Captures every console.log call made during `run()`, then restores console.log unconditionally
// (even if `run` throws), so one scenario's capture never leaks into the next.
function captureLog(run) {
  const lines = [];
  const real = console.log;
  console.log = (...args) => lines.push(args.join(" "));
  try { run(); } finally { console.log = real; }
  return lines;
}

// mkFail() mirrors the FAIL(name, msg) => fails.push(`${name}: ${msg}`) helper every real gate
// file defines locally -- gateReport() is always called with the caller's own array + helper.
function mkFail(fails) {
  return (name, msg) => fails.push(`${name}: ${msg}`);
}

// (a) an undeclared failing gate still prints its own row AND the loud "!!!" flag line. "ghost"
// fires here directly (never appears in CLEAN's text), so this exercises only the runtime
// union-print path -- CLEAN's declared/site-name agreement stays report-static-clean, isolating
// this assertion from the static check exercised by (b)/(c) below.
{
  const fails = [];
  const F = mkFail(fails);
  F("ghost", "an undeclared gate actually fired");
  const lines = captureLog(() => gateReport({ fails, declared: ["known-gate", "report-static"], selfUrl: CLEAN, FAIL: F }));
  const row = lines.find((l) => /FAIL\s+ghost\b/.test(l));
  const flag = lines.find((l) => l.includes("!!!") && l.includes('"ghost"'));
  if (!row) FAIL("union-print-row", `no printed row for the undeclared firing gate "ghost"; captured:\n${lines.join("\n")}`);
  if (!flag) FAIL("union-print-flag", `no "!!!" flag line naming "ghost"; captured:\n${lines.join("\n")}`);
}

// (b) a declared name with no matching FAIL(...) call site reds report-static. MISMATCH's only
// real call site is "real-site"; declaring "phantom-declared" (never called anywhere in that
// file) must red on its own.
{
  const fails = [];
  const F = mkFail(fails);
  gateReport({ fails, declared: ["real-site", "phantom-declared", "report-static"], selfUrl: MISMATCH, FAIL: F });
  if (!fails.some((f) => f.startsWith("report-static:") && f.includes('"phantom-declared"')))
    FAIL("report-static-dead-entry", `expected a report-static failure naming "phantom-declared" (declared, no call site); got:\n${fails.join("\n")}`);
}

// (c) a call site not in the declared list reds report-static. MISMATCH calls FAIL("real-site", ...)
// but this scenario's declared list omits it.
{
  const fails = [];
  const F = mkFail(fails);
  gateReport({ fails, declared: ["report-static"], selfUrl: MISMATCH, FAIL: F });
  if (!fails.some((f) => f.startsWith("report-static:") && f.includes('"real-site"')))
    FAIL("report-static-undeclared-site", `expected a report-static failure naming "real-site" (call site, not declared); got:\n${fails.join("\n")}`);
}

// (F2) LITERAL_CALL also matches a single-quoted FAIL(...) first argument, not only a
// double-quoted one. SINGLEQUOTE's only call site is written with single quotes.
{
  // declared correctly -> report-static stays clean (proves the single-quoted site was actually
  // *seen*, not just silently ignored in a way that happens not to red).
  const fails = [];
  const F = mkFail(fails);
  gateReport({ fails, declared: ["single-quoted-site", "report-static"], selfUrl: SINGLEQUOTE, FAIL: F });
  if (fails.some((f) => f.startsWith("report-static:")))
    FAIL("singlequote-declared-clean", `single-quoted site declared correctly still reported report-static failure(s):\n${fails.join("\n")}`);
}
{
  // declared list omits the single-quoted site -> report-static must still red for it, exactly
  // as assertion (c) does for a double-quoted site.
  const fails = [];
  const F = mkFail(fails);
  gateReport({ fails, declared: ["report-static"], selfUrl: SINGLEQUOTE, FAIL: F });
  if (!fails.some((f) => f.startsWith("report-static:") && f.includes('"single-quoted-site"')))
    FAIL("singlequote-undeclared-site", `expected a report-static failure naming "single-quoted-site"; got:\n${fails.join("\n")}`);
}

console.log(failed ? `\nFAIL: ${failed} gate-report meta-test failure(s)` : "PASS: gate-report -- union print + report-static self-check both bite");
process.exit(failed ? 1 : 0);
