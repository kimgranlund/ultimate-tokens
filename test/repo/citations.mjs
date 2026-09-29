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

// (4) fact pins: the audit checks that a cited line still carries its anchor, not that a claim is
// true, which is how `11 voices` and a three-state colorMode survived with STALE 0. Each pin is a
// claim the docs make about the code. `needle` is the exact text the doc must carry (inside a line
// matching `line`, when given); `source()` reads the code and returns what it holds (a count, a
// boolean); a needle carrying a number must equal it, otherwise `source()` must be true. There is
// no typed number beside the needle, so a pin cannot compare code with code. It reds on either side.
import { readFileSync } from "node:fs";
const txt = (p) => readFileSync(join(ROOT, p), "utf8");
const lineOf = (p, re) => txt(p).split("\n").find((l) => re.test(l)) ?? "";
const FACT_PINS = [
  { id: "colorMode states", doc: "docs/lld/app-shell.md", line: /`this\.colorMode`/, needle: "system", src: "src/ui/app.js",
    source: () => /this\.colorMode = "system"/.test(lineOf("src/ui/app.js", /Color section value-mode control/)) },
  { id: "type voices", doc: "docs/lld/app-shell.md", needle: "15 voices", src: "src/engine/type.mjs",
    source: async () => Object.keys((await import("../../src/engine/type.mjs")).makeVoices()).length },
  { id: "colour formats", doc: "docs/reference/references/ui-plan.md", line: /T8 export:/, needle: "10 formats", src: "src/ui/overlays/drawer.js",
    source: () => {
      const t = txt("src/ui/overlays/drawer.js"), a = t.indexOf("const FORMAT_GROUPS");
      const colors = t.slice(a, t.indexOf('"Typography"', a));
      return (colors.match(/\["[^"]+", "[^"]+"\]/g) || []).length;
    } },
  { id: "roles per palette", doc: "docs/reference/references/ui-plan.md", needle: "a 53-role", src: "docs/reference/data/role-table.json",
    source: () => JSON.parse(txt("docs/reference/data/role-table.json")).rolesPerPalette },
  { id: "btn home", doc: "docs/reference/references/component-inventory.md", line: /^\| `btn\(\)` \|/, needle: "app-helpers.mjs", src: "src/ui/app-helpers.mjs",
    source: () => /^export const btn\b/m.test(txt("src/ui/app-helpers.mjs")) },
  { id: "delete mode methods", doc: ".claude/skills/building-editor-sections/SKILL.md", needle: "`deleteTypeMode`/`deleteGeomMode`", src: "src/ui/sections/{typography,geometry}.js",
    source: () => /^  deleteTypeMode\(id\) \{/m.test(txt("src/ui/sections/typography.js")) && /^  deleteGeomMode\(id\) \{/m.test(txt("src/ui/sections/geometry.js")) },
];
for (const pin of FACT_PINS) {
  let held;
  try { held = await pin.source(); } catch (e) { FAIL(pin.src, `fact pin "${pin.id}": source threw: ${e.message}`); continue; }
  const frag = pin.line ? lineOf(pin.doc, pin.line) : txt(pin.doc);
  if (!frag.includes(pin.needle)) { FAIL(pin.doc, `fact pin "${pin.id}": doc no longer carries \`${pin.needle}\`${pin.line ? ` on a line matching ${pin.line}` : ""}`); continue; }
  const num = pin.needle.match(/\d+/);
  if (num ? Number(num[0]) !== held : held !== true) FAIL(pin.src, `fact pin "${pin.id}": ${pin.doc} says \`${pin.needle}\` but the code holds ${JSON.stringify(held)}`);
}

console.log(failed ? `✗ ${failed} citation gate failure(s)` : `✓ citations: parser self-test + STALE 0 across ${Object.keys(report.docs).length} discovered docs + ${FACT_PINS.length} fact pins (HEAD ${report.head})`);
process.exit(failed ? 1 : 0);
