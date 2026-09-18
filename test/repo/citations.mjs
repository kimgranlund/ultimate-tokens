#!/usr/bin/env node
// citations.mjs — the doc citations are a GATE, not a one-time repair (#640, PR #658 review).
//
// docs/lld/app-shell.md and docs/reference/references/component-inventory.md cite `file:line`
// into src/. Every edit that moves a cited line silently falsifies the record; #646 moved
// src/ui/app.js and 26 repaired citations went stale again in the same week. So the audit
// (scripts/audit-citations.mjs) runs here: first its parser self-test, then the audit itself,
// and any STALE line in any audited doc fails the build. NEAR / UNDECIDABLE stay reports.
//
// The audit resolves paths against `git ls-files` from the cwd, so this pins cwd to the repo
// root before importing it (test/run.mjs already runs from the root; this makes a direct
// `node test/repo/citations.mjs` from anywhere behave the same).

import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
process.chdir(ROOT);
let failed = 0;
const FAIL = (file, msg) => { failed++; console.log(`  ✗ ${file}: ${msg}`); };

const { runAudit, staleLines, selftest } = await import("../../scripts/audit-citations.mjs");

// (1) the parser: a slash list `app.js:836/837` must yield every member, not just the first
const selfFailed = selftest();
if (selfFailed) FAIL("scripts/audit-citations.mjs", `${selfFailed} parseCitations self-test case(s) failed`);

// (2) the audit: STALE 0 for every audited doc
let report;
try { report = runAudit(); }
catch (e) { FAIL("scripts/audit-citations.mjs", `audit threw: ${e.message}`); }
if (report) {
  for (const [doc, lines] of Object.entries(staleLines(report))) {
    if (!lines.length) continue;
    FAIL(doc, `${lines.length} STALE citation line(s): ${lines.join(",")} (run \`node scripts/audit-citations.mjs\` for the mechanically-derived homes)`);
    for (const c of report.docs[doc].citations) if (c.verdict.startsWith("STALE")) console.log(`      ${doc}:${c.line} cites ${c.form} -> ${c.detail}`);
  }
}

console.log(failed ? `✗ ${failed} citation gate failure(s)` : `✓ citations: parser self-test + STALE 0 across ${Object.keys(report.docs).length} audited docs (HEAD ${report.head})`);
process.exit(failed ? 1 : 0);
