#!/usr/bin/env node
// citations.mjs, the doc citations are a GATE, not a one-time repair (#640, PR #658 review).
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
for (const must of ["docs/specs/app-shell.md", "docs/references/component-inventory.md"])
  if (!discovered.includes(must)) FAIL(must, "no longer discovered by the citations audit (discovery rule or parser broke)");
if (report && report.audited !== discovered.length)
  FAIL("scripts/audit-citations.mjs", `audit walked ${report.audited} docs but discovery lists ${discovered.length}`);
if (report && Object.keys(report.docs).length !== discovered.length)
  FAIL("scripts/audit-citations.mjs", `report carries ${Object.keys(report.docs).length} docs but discovery lists ${discovered.length}`);
for (const e of DOCS_EXEMPT) if (!e.path || !e.reason) FAIL("scripts/audit-citations.mjs", `DOCS_EXEMPT entry without a path + reason: ${JSON.stringify(e)}`);

// (4) fact pins: the audit checks that a cited line still carries its anchor, not that a claim is
// true, which is how `11 voices` and a three-state canvas toggle survived with STALE 0. Each pin is a
// claim the docs make about the code. `needle` is the exact text the doc must carry (inside a line
// matching `line`, when given); `source()` reads the code and returns what it holds (a count, a
// boolean); a needle carrying a number must equal it, otherwise `source()` must be true. There is
// no typed number beside the needle, so a pin cannot compare code with code. It reds on either side.
import { readFileSync } from "node:fs";
const txt = (p) => readFileSync(join(ROOT, p), "utf8");
const lineOf = (p, re) => txt(p).split("\n").find((l) => re.test(l)) ?? "";
// a doc may spell a count as a word (`fifteen voices`); the word reads as its number, the code side
// still supplies the value, so no number is typed beside a source.
const NUM_WORDS = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20 };
const drawerColorFormats = () => {
  const t = txt("src/ui/overlays/drawer.js"), a = t.indexOf("const FORMAT_GROUPS");
  const colors = t.slice(a, t.indexOf('"Typography"', a));
  return (colors.match(/\["[^"]+", "[^"]+"\]/g) || []).length;
};
// the job keys of .github/workflows/ci.yml, read as the lines two spaces in under `jobs:`
const ciJobs = () => {
  const lines = txt(".github/workflows/ci.yml").split("\n"), a = lines.findIndex((l) => /^jobs:/.test(l));
  const out = [];
  for (const l of lines.slice(a + 1)) { if (/^\S/.test(l)) break; const m = l.match(/^  ([\w-]+):\s*$/); if (m) out.push(m[1]); }
  return out;
};
const FACT_PINS = [
  { id: "type voices", doc: "docs/specs/app-shell.md", needle: "15 voices", noun: "voices", src: "src/engine/type.mjs",
    source: async () => Object.keys((await import("../../src/engine/type.mjs")).makeVoices()).length },
  { id: "colour formats", doc: "docs/specs/ui-plan.md", line: /T8 export:/, needle: "10 formats", noun: "formats", src: "src/ui/overlays/drawer.js",
    source: drawerColorFormats },
  { id: "roles per palette", doc: "docs/specs/ui-plan.md", needle: "a 53-role", noun: "roles?", src: "docs/reference/data/role-table.json",
    source: () => Object.keys(JSON.parse(txt("docs/reference/data/role-table.json")).roleTable).length },
  { id: "btn home", doc: "docs/references/component-inventory.md", line: /^\| `btn\(\)` \|/, needle: "app-helpers.mjs", src: "src/ui/app-helpers.mjs",
    source: () => /^export const btn\b/m.test(txt("src/ui/app-helpers.mjs")) },
  { id: "delete mode methods", doc: ".claude/skills/building-editor-sections/SKILL.md", needle: "`deleteTypeMode`/`deleteGeomMode`", src: "src/ui/sections/{typography,geometry}.js",
    source: () => /^  deleteTypeMode\(id\) \{/m.test(txt("src/ui/sections/typography.js")) && /^  deleteGeomMode\(id\) \{/m.test(txt("src/ui/sections/geometry.js")) },
  { id: "skill type voices", doc: ".claude/skills/type-scale/SKILL.md", needle: "fifteen voices", noun: "voices", allow: [
      { phrase: "thirteen voices", reason: "the SM/MD/LG subset: 13 of the 15 voices carry three steps" },
      { phrase: "13 voices", reason: "the SM/MD/LG subset: 13 of the 15 voices carry three steps" },
      { phrase: "five voices", reason: "the mono role's share: five voices ride the mono font" },
    ], src: "src/engine/type.mjs",
    source: async () => Object.keys((await import("../../src/engine/type.mjs")).makeVoices()).length },
  { id: "skill colour formats", doc: ".claude/skills/adding-export-formats/SKILL.md", needle: "ten colour formats", noun: "formats", src: "src/ui/overlays/drawer.js",
    source: drawerColorFormats },
  { id: "skill hueSpace default", doc: ".claude/skills/color-math/SKILL.md", line: /`DEFAULT_CONTROLS\.hueSpace`/, needle: '"oklch"', src: "src/engine/tonal.js",
    source: async (needle) => { const held = `"${(await import("../../src/engine/tonal.js")).DEFAULT_CONTROLS.hueSpace}"`; return held === needle || held; } },
  { id: "skill list_palettes", doc: ".claude/skills/maintaining-brand-kit-mcp/SKILL.md", needle: "list_palettes (16)", src: "docs/reference/data/role-table.json",
    source: () => JSON.parse(txt("docs/reference/data/role-table.json")).defaults.length },
  { id: "skill H5 jobs", doc: ".claude/skills/shipping-changes/references/rubric.md", line: /^\| H5 \|/, needle: "panda-smoke", src: ".github/workflows/ci.yml",
    source: () => {
      const cell = lineOf(".claude/skills/shipping-changes/references/rubric.md", /^\| H5 \|/).split("|")[4] ?? "";
      const named = (cell.split(";")[0].match(/`([\w-]+)`/g) || []).map((n) => n.slice(1, -1)), jobs = ciJobs();
      return named.length > 0 && named.every((n) => jobs.includes(n)) && jobs.every((j) => j === "deploy" || named.includes(j)) || { named, jobs };
    } },
];
for (const pin of FACT_PINS) {
  let held;
  try { held = await pin.source(pin.needle); } catch (e) { FAIL(pin.src, `fact pin "${pin.id}": source threw: ${e.message}`); continue; }
  const frag = pin.line ? lineOf(pin.doc, pin.line) : txt(pin.doc);
  if (!frag.includes(pin.needle)) { FAIL(pin.doc, `fact pin "${pin.id}": doc no longer carries \`${pin.needle}\`${pin.line ? ` on a line matching ${pin.line}` : ""}`); continue; }
  const num = pin.needle.match(/\d+/)?.[0] ?? (Object.hasOwn(NUM_WORDS, pin.needle.split(" ")[0]) ? NUM_WORDS[pin.needle.split(" ")[0]] : undefined);
  if (num !== undefined ? Number(num) !== held : held !== true) FAIL(pin.src, `fact pin "${pin.id}": ${pin.doc} says \`${pin.needle}\` but the code holds ${JSON.stringify(held)}`);
}

// (4b) a fact pin's `source` must read the code, never restate the number (#769): a literal
// `source: () => 15` compares the doc with a typed copy of itself and can never drift; a boolean
// pin (`source: () => true`) restates `true` the same way (#783). The predicate matches a number or
// boolean literal in any bare shape (plain, async, arrow with no parens, empty parens or a parameter
// list, a `function` expression, a parenthesised value, block body) and not a body that reads. It
// runs over this file's own FACT_PINS slice; its fixture sits below the closing `];` so the slice
// never reads it.
const bareLiteralSource = (text) => [...text.matchAll(/source:\s*(?:async\s*)?(?:(?:function\b[^(]*\(\s*[^)]*\)\s*|(?:\(\s*[^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*))?(?:\{\s*return\s+)?\(?\s*(?:[-+]?\d+(?:\.\d+)?|true|false)\s*\)?\s*;?\s*\}?\s*(?=[,}\n])/g)].map((m) => m.index);
{
  const self = txt("test/repo/citations.mjs"), a = self.indexOf("const FACT_PINS = ["), slice = self.slice(a, self.indexOf("\n];", a));
  for (const at of bareLiteralSource(slice)) {
    const ids = [...slice.slice(0, at).matchAll(/id: "([^"]+)"/g)];
    FAIL("test/repo/citations.mjs", `fact pin "${ids.at(-1)?.[1] ?? "?"}": bare literal source (a source must read the code, not restate a number)`);
  }
  const positives = ["source: 53,", "source: () => 15,", "source: async () => 15,", "source: () => { return 15; },", "source: async () => { return 59 },", "source: () => -1.5,",
    "source: true,", "source: false },", "source: () => true,", "source: async () => false,", "source: () => { return true; },",
    "source: (needle) => 15,", "source: async (needle) => true },", "source: n => 15,", "source: async n => false,", "source: () => (15),", "source: (n) => { return false; },", "source: function () { return 15; },"];
  const negatives = ["source: () => Object.keys(x).length },", "source: () => /a/.test(y) },", "source: async () => Object.keys((await import(\"a.mjs\")).b()).length },", "source: drawerColorFormats },", "source: () => {\n      const cell = 4;",
    "source: (needle) => needle === \"x\" },", "source: () => trueish() },", "source: () => true && check() },", "source: async (needle) => { const held = 1;", "source: (n) => Object.keys(n).length },"];
  for (const f of positives) if (!bareLiteralSource(f).length) FAIL("test/repo/citations.mjs", `bareLiteralSource missed a bare literal: ${f}`);
  for (const f of negatives) if (bareLiteralSource(f).length) FAIL("test/repo/citations.mjs", `bareLiteralSource flagged a reading source: ${f}`);
}

// (5) symbol homes: a repo skill that says `sym` lives in `path` must be right about it. The three
// shapes are `sym` in `path`, `sym` (`path`) and `sym` (in `path`); `sym` may carry a call suffix,
// `path` an optional :NNN. The path is a full repo path resolved against git ls-files, or a bare
// source file name (`model.mjs`) resolved by unique basename under src/ (two homes is an `ambiguous
// basename` FAIL, never a skip; BARE_EXEMPT carries the prose false-positives, each with a reason)
// and the file must DEFINE the symbol: a declaration, a method line or a
// property line. An import or a call is not a home (app.js imports and calls ensureTypeFonts, so a
// text match would pass a stale citation). With :NNN the definition must sit on line NNN. A backticked
// path with a source extension that resolves to nothing is stale too; other parentheticals
// (`dimension` (`px`)) are prose, not citations, and are skipped.
import { execFileSync } from "node:child_process";
const SYMBOL_HOME_FLOOR = 30;
const BARE_EXEMPT = [
  { sym: "typeTokensX", reason: "prose for the typeTokens* family, not one defined symbol" },
  { sym: "geomTokensX", reason: "prose for the geomTokens* family, not one defined symbol" },
  { sym: "steps", reason: "a plain English word beside type.mjs, not a defined symbol" },
];
for (const e of BARE_EXEMPT) if (!e.sym || !e.reason) FAIL("test/repo/citations.mjs", `BARE_EXEMPT entry without a sym + reason: ${JSON.stringify(e)}`);
const tracked = execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8", maxBuffer: 1 << 26 }).split("\n").filter(Boolean);
const trackedSet = new Set(tracked);
const defines = (line, sym) => {
  const s = sym.replace(/[$]/g, "\\$&"), end = "(?![\\w$])";
  return new RegExp(`^\\s*(export\\s+)?(async\\s+)?(function\\*?|const|let|var|class)\\s+${s}${end}`).test(line)
    || new RegExp(`^\\s*(async\\s+)?${s}\\s*\\([^)]*\\)\\s*\\{`).test(line)
    || new RegExp(`^\\s*${s}\\s*[:=]`).test(line);
};
const SHAPE = /`([A-Za-z_$][\w$]*)(?:\([^`]*\))?` (?:in `|\(`|\(in `)([^`\s:]+)(?::(\d+))?`/g;
let homesChecked = 0;
const homesStale = [];
for (const doc of tracked.filter((f) => /^\.claude\/skills\/.*\.md$/.test(f))) {
  txt(doc).split("\n").forEach((line, i) => {
    for (const m of line.matchAll(SHAPE)) {
      const [, sym, path, nnn] = m;
      let homes;
      if (!path.includes("/")) {
        if (!/\.(m?js|json|html|css)$/.test(path) || BARE_EXEMPT.some((e) => e.sym === sym)) continue;
        homes = tracked.filter((f) => f.startsWith("src/") && f.endsWith("/" + path));
        if (homes.length > 1) { homesChecked++; homesStale.push([doc, `${doc}:${i + 1} \`${sym}\` cites bare \`${path}\`: ambiguous basename, ${homes.join(" or ")}`]); continue; }
      } else homes = trackedSet.has(path) ? [path] : [];
      if (!homes.length) { if (/\.(m?js|json|html|css)$/.test(path)) { homesChecked++; homesStale.push([doc, `${doc}:${i + 1} \`${sym}\` cites \`${path}\`, which no tracked file matches`]); } continue; }
      homesChecked++;
      const ok = homes.some((f) => { const ls = txt(f).split("\n"); return nnn ? defines(ls[Number(nnn) - 1] ?? "", sym) : ls.some((l) => defines(l, sym)); });
      if (!ok) homesStale.push([doc, `${doc}:${i + 1} \`${sym}\` is not defined${nnn ? ` on line ${nnn} of` : " in"} ${homes.join(" or ")}`]);
    }
  });
}
for (const [doc, msg] of homesStale) FAIL(doc, `symbol home: ${msg}`);
if (homesChecked < SYMBOL_HOME_FLOOR) FAIL("test/repo/citations.mjs", `symbol homes: only ${homesChecked} citations read, below SYMBOL_HOME_FLOOR ${SYMBOL_HOME_FLOOR} (the scanner went vacuous)`);
console.log(`symbol homes: ${homesChecked} checked, ${homesStale.length} stale`);

// (4c) the count-phrase scan (#776): the needle leg above proves the doc still carries one true count,
// not that no false one sits beside it (`fifteen voices` in one sentence, `eight voices` in the next),
// and a skill pin read only its one file. A pin with a `noun` scans its whole reach, every line, for
// `<number>[-\s]<qualifier>?<noun>`: a docs pin reaches its one doc, a skill pin every tracked .md
// under its skill directory. A number that differs from what the code holds fails, naming file, line
// and phrase, unless `allow` carries the phrase with a reason. Number words read one to ninety-nine
// (hyphenated tens); a magnitude word (`hundred`) fails loudly instead of being skipped. An adjective
// between number and noun (`two interactive voices`) or a singular noun (`one voice`) is outside the
// grammar by design (the plan's `roles?` noun is the one pin that also reads a singular, `a 53-role`; a qualifier outside the fixed list, `14 type voices`, is likewise not read).
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const MAGNITUDE = ["dozen", "hundred", "thousand", "million", "billion"];
const numTok = `\\d+|(?:${Object.keys(TENS).join("|")})(?:-(?:one|two|three|four|five|six|seven|eight|nine))?|${Object.keys(NUM_WORDS).join("|")}|${MAGNITUDE.join("|")}`;
const readNum = (w) => {
  w = w.toLowerCase();
  if (/^\d+$/.test(w)) return Number(w);
  if (MAGNITUDE.includes(w)) return null;
  const [a, b] = w.split("-");
  return Object.hasOwn(TENS, a) ? TENS[a] + (b ? NUM_WORDS[b] : 0) : NUM_WORDS[a];
};
const COUNT_PHRASE_FLOOR = 25;
let phrasesRead = 0;
for (const pin of FACT_PINS) {
  for (const a of pin.allow ?? []) if (!a.phrase || !a.reason) FAIL("test/repo/citations.mjs", `fact pin "${pin.id}": allow entry without a phrase + reason: ${JSON.stringify(a)}`);
  if (!pin.noun) continue;
  let held;
  try { held = await pin.source(pin.needle); } catch { continue; }
  if (typeof held !== "number") continue;
  const before = phrasesRead;
  const reach = pin.doc.startsWith(".claude/skills/") ? tracked.filter((f) => f.startsWith(pin.doc.split("/").slice(0, 3).join("/") + "/") && f.endsWith(".md")) : [pin.doc];
  const re = new RegExp(`(?<![\\w-])(${numTok})[- ](?:(?:named|colou?r|semantic|export) )?(?:${pin.noun})(?![\\w])`, "gi");
  // the zero-read floor below passes on one read, so a NARROWED noun (`roles?` to `role`) still clears it
  // while a planted `52 roles` goes unread (#783). Probe the scan itself, with no code read: it must read
  // the pin's own needle (a noun narrowed to the plural drops `a 53-role`) and the needle's noun in the
  // plural (a noun narrowed to the singular drops `99 roles`).
  const probe = new RegExp(re.source, "i"), plural = pin.needle.split(/[\s-]/).pop().replace(/s?$/, "s");
  if (!probe.test(pin.needle)) FAIL("test/repo/citations.mjs", `count phrases: fact pin "${pin.id}": noun \`${pin.noun}\` does not read the pin's own needle \`${pin.needle}\` (the noun was narrowed)`);
  if (!probe.test(`99 ${plural}`)) FAIL("test/repo/citations.mjs", `count phrases: fact pin "${pin.id}": noun \`${pin.noun}\` does not read the plural \`99 ${plural}\` (the noun was narrowed)`);
  for (const doc of reach) txt(doc).split("\n").forEach((line, i) => {
    for (const m of line.matchAll(re)) {
      const phrase = m[0].toLowerCase().replace(/\s+/g, " "), n = readNum(m[1]);
      phrasesRead++;
      if (n === null) { FAIL(doc, `line ${i + 1}: \`${m[0]}\` (fact pin "${pin.id}"): \`${m[1]}\` is outside the parser's range (one to ninety-nine)`); continue; }
      if (n === held || (pin.allow ?? []).some((a) => a.phrase.toLowerCase() === phrase)) continue;
      FAIL(doc, `line ${i + 1}: \`${m[0]}\` but the code holds ${held} (fact pin "${pin.id}", ${pin.src})`);
    }
  });
  // each pin's needle carries its own noun, so its reach must yield at least one phrase; a misspelled noun
  // would otherwise ride on the other pins' reads under the total floor
  if (phrasesRead === before) FAIL("test/repo/citations.mjs", `count phrases: fact pin "${pin.id}" read 0 phrases for noun \`${pin.noun}\` (the pin's scan went vacuous)`);
}
if (phrasesRead < COUNT_PHRASE_FLOOR) FAIL("test/repo/citations.mjs", `count phrases: only ${phrasesRead} read, below COUNT_PHRASE_FLOOR ${COUNT_PHRASE_FLOOR} (the scan went vacuous)`);

console.log(failed ? `✗ ${failed} citation gate failure(s)` : `✓ citations: parser self-test + STALE 0 across ${Object.keys(report.docs).length} discovered docs + ${FACT_PINS.length} fact pins + ${phrasesRead} count phrases (HEAD ${report.head})`);
process.exit(failed ? 1 : 0);
