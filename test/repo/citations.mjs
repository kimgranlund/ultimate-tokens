#!/usr/bin/env node
// citations.mjs — the doc citations are a GATE, not a one-time repair (#640, PR #658 review).
//
// Docs under docs/ cite `file:line` into src/ (and test/, scripts/, mcp/). Every edit that moves
// a cited line silently falsifies the record; #646 moved src/ui/app.js and 26 repaired citations
// went stale again in the same week. So the audit (scripts/audit-citations.mjs) runs here: first
// its parser self-test, then the audit itself, and any STALE or NOFILE line in any audited doc
// fails the build (#672: NOFILE joins STALE). NEAR / UNDECIDABLE stay reports.
//
// The audited set is DISCOVERED (#664): every tracked docs/**/*.md with at least one recognized
// citation, minus the reason-carrying DOCS_EXEMPT allow-list. A hand-listed 2-doc set left every
// engine citation outside the gate. Discovery can go vacuously green if the glob or parser
// breaks, so (3) below pins the discovered count against the two docs the gate has always
// covered and against the count the audit itself reports.
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

const { runAudit, staleLines, selftest, discoverDocs, DOCS_EXEMPT } = await import("../../scripts/audit-citations.mjs");

// (1) the parser: a slash list `app.js:836/837` must yield every member, not just the first
const selfFailed = selftest();
if (selfFailed) FAIL("scripts/audit-citations.mjs", `${selfFailed} parseCitations self-test case(s) failed`);

// (2) the audit: STALE 0 and NOFILE 0 for every audited doc (staleLines()'s FAILS predicate is
// STALE ∪ NOFILE; a cite to an untracked path is exactly the drift the STALE verdicts exist to
// catch, so it fails the gate the same way, #672)
let report;
try { report = runAudit(); }
catch (e) { FAIL("scripts/audit-citations.mjs", `audit threw: ${e.message}`); }
if (report) {
  for (const [doc, lines] of Object.entries(staleLines(report))) {
    if (!lines.length) continue;
    FAIL(doc, `${lines.length} STALE/NOFILE citation line(s): ${lines.join(",")} (run \`node scripts/audit-citations.mjs\` for the mechanically-derived homes)`);
    for (const c of report.docs[doc].citations) if (c.verdict.startsWith("STALE") || c.verdict === "NOFILE") console.log(`      ${doc}:${c.line} cites ${c.form} -> ${c.detail}`);
  }
}

// (3) discovery is not vacuous: the two docs the gate has covered since #640 must still be
// discovered, the audit must have walked exactly the discovered set, and every exemption must
// carry a reason (an exemption is a ruling, not a shortcut to green)
const discovered = discoverDocs().map((d) => d.path);
for (const must of ["docs/lld/app-shell.md", "docs/reference/references/component-inventory.md"])
  if (!discovered.includes(must)) FAIL(must, "no longer discovered by the citations audit (discovery rule or parser broke)");
if (report && report.audited !== discovered.length)
  FAIL("scripts/audit-citations.mjs", `audit walked ${report.audited} docs but discovery lists ${discovered.length}`);
if (report && Object.keys(report.docs).length !== discovered.length)
  FAIL("scripts/audit-citations.mjs", `report carries ${Object.keys(report.docs).length} docs but discovery lists ${discovered.length}`);
for (const e of DOCS_EXEMPT) if (!e.path || !e.reason) FAIL("scripts/audit-citations.mjs", `DOCS_EXEMPT entry without a path + reason: ${JSON.stringify(e)}`);

console.log(failed ? `✗ ${failed} citation gate failure(s)` : `✓ citations: parser self-test + STALE 0 across ${Object.keys(report.docs).length} discovered docs (HEAD ${report.head})`);
process.exit(failed ? 1 : 0);
