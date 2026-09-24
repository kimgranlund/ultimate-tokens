#!/usr/bin/env node
// Checks that .sdlc/baseline.md's Interim gate-time ceiling section agrees with its own rows,
// and that .sdlc/adapter.md's pointer at it is not stale.
//
// Why this exists (#681 U5). Three separate defects in that section reached a verdict:
//   1. a count sentence that described a different table from the one it followed,
//   2. an adapter note citing a reading count and maximum that the series had outgrown,
//   3. a partition, "N graded + M explicit + K unsupportable", whose parts summed to one
//      less than the whole while every TOTAL still agreed.
// (3) is the reason this is a script and not a habit: checking totals does not check a
// partition, and the drifting part was the one no total could see.
//
// Run from the repo root: node .sdlc/checks/ceiling-counts-check.mjs
// Exit 0 when every assertion holds, 1 otherwise, one line per assertion either way.

import { readFileSync } from "node:fs";

const BAND_TOP = 550;
const WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
};

const baselineFile = readFileSync(".sdlc/baseline.md", "utf8");
const adapter = readFileSync(".sdlc/adapter.md", "utf8");

// Scope every parse to the ceiling section. Reading the whole file would let any future table
// elsewhere in baseline.md break this check for a reason that has nothing to do with the ceiling,
// which is its own kind of false red.
const SECTION = "## Interim gate-time ceiling";
const start = baselineFile.indexOf(SECTION);
if (start === -1) {
  console.log(`FAIL  ceiling section not found  (looked for "${SECTION}")`);
  process.exit(1);
}
const after = baselineFile.indexOf("\n## ", start + SECTION.length);
const baseline = baselineFile.slice(start, after === -1 ? undefined : after);

// Every reading row: "| <wall> s | <load column> | <note> |", bold markers tolerated.
const rows = [];
for (const line of baseline.split("\n")) {
  const m = line.match(/^\|\s*\*{0,2}([0-9]+(?:\.[0-9]+)?) s\*{0,2}\s*\|\s*\*{0,2}([^|]*?)\s*\|/);
  if (m) rows.push({ wall: Number(m[1]), load: m[2] });
}

// R13 grades a run STARTED under load 5; a row qualifies only if it states such a start figure.
const startLoad = (load) => {
  const m = load.trim().match(/^\*{0,2}([0-9]+\.[0-9]+)/);
  return m ? Number(m[1]) : null;
};
const statesNoStart = (load) => /not recorded/.test(load) || /band/.test(load);

const graded = rows.filter((r) => !statesNoStart(r.load) && startLoad(r.load) !== null && startLoad(r.load) < 5);
const unsupportable = rows.filter((r) => statesNoStart(r.load));
const explicit = rows.filter((r) => !graded.includes(r) && !unsupportable.includes(r));
const above = rows.filter((r) => r.wall > BAND_TOP);
const inside = rows.filter((r) => r.wall <= BAND_TOP);

const claim = baseline.match(/\*\*(\d+) readings\*\*:\s*\*\*(\d+)\*\* above[\s\S]*?\*\*(\d+)\*\* inside/);
const part = baseline.match(/Of the other (\d+):\s*\*\*(\w+)\*\*\s*\n?\s*record an explicit/);
const note = adapter.match(/a (\d+)-reading series from 284 s to ([0-9.]+) s/);

// The prose does not only COUNT the two halves of the series, it LISTS them, wall by wall, in the
// parentheses after each count, and it states the graded count in its own sentence further down.
// Those lists and that word are independent sources: the numbers in them were typed by a human and
// can disagree with the rows in ways no count comparison sees (a wall that moved sides, a value
// mistyped at an unchanged length). Two assertions used to stand here that read nothing new:
// "above + inside == total" and "PARTITION graded + explicit + unsupportable == total". Both
// re-partitioned the same `rows` array with complementary filters (`explicit` is literally defined
// as the rows in neither of the other two parts), so both were true by construction and no edit to
// .sdlc/baseline.md could red either one. They are replaced by the three below, which read the
// prose's own lists and word and compare them against what the rows measure (#681 U7, S3).
const listOf = (s) => (s ? s.split(",").map((x) => Number(x.trim())).filter((n) => Number.isFinite(n)) : null);
const aboveList = listOf((baseline.match(/\*\*\d+\*\* above the band's \d+ s top\s*\n?\s*\(([^)]*)\)/) || [])[1]);
const insideList = listOf((baseline.match(/\*\*\d+\*\* inside it \(([^)]*)\)/) || [])[1]);
const gradedProse = baseline.match(/\*\*(\w+)\*\* of the readings are graded under R13/i);
const sameSet = (a, b) => a.length === b.length && [...a].sort((x, y) => x - y).every((v, i) => v === [...b].sort((x, y) => x - y)[i]);

const checks = [];
const ok = (name, pass, detail) => checks.push({ name, pass, detail });

ok("series has rows at all", rows.length > 0, `${rows.length} rows parsed`);
if (claim) {
  ok("prose total == rows", Number(claim[1]) === rows.length, `prose ${claim[1]}, rows ${rows.length}`);
  ok("prose above == measured", Number(claim[2]) === above.length, `prose ${claim[2]}, measured ${above.length}`);
  ok("prose inside == measured", Number(claim[3]) === inside.length, `prose ${claim[3]}, measured ${inside.length}`);
} else ok("prose count sentence found", false, "no '**N readings**: **A** above ... **I** inside'");

if (aboveList) {
  ok("prose above LIST == measured above walls", sameSet(aboveList, above.map((r) => r.wall)),
    `prose [${aboveList.join(", ")}] vs measured [${above.map((r) => r.wall).sort((a, b) => a - b).join(", ")}]`);
} else ok("prose above list found", false, "no '**N** above the band's M s top (...)' list");

if (insideList) {
  ok("prose inside LIST == measured inside walls", sameSet(insideList, inside.map((r) => r.wall)),
    `prose [${insideList.join(", ")}] vs measured [${inside.map((r) => r.wall).sort((a, b) => a - b).join(", ")}]`);
} else ok("prose inside list found", false, "no '**N** inside it (...)' list");

if (part) {
  const others = Number(part[1]);
  const stated = WORDS[part[2].toLowerCase()] ?? Number(part[2]);
  ok("prose 'other N' == total - graded", others === rows.length - graded.length,
    `prose ${others}, measured ${rows.length - graded.length}`);
  ok("prose explicit count == measured", stated === explicit.length, `prose ${stated}, measured ${explicit.length}`);
  ok("prose partition parts sum to 'other N'", stated + unsupportable.length === others,
    `${stated} + ${unsupportable.length} vs ${others}`);
} else ok("prose partition sentence found", false, "no 'Of the other N: **word** record an explicit'");

// The graded count the prose states in its own sentence, against the rows R13 actually grades.
// Nothing else in this script reads that word, and it is the part the old PARTITION line pretended
// to cover.
if (gradedProse) {
  const statedGraded = WORDS[gradedProse[1].toLowerCase()] ?? Number(gradedProse[1]);
  ok("prose graded count == measured graded", statedGraded === graded.length,
    `prose ${gradedProse[1]} (${statedGraded}), measured ${graded.length}`);
} else ok("prose graded sentence found", false, "no '**word** of the readings are graded under R13'");

if (note) {
  ok("adapter note count == rows", Number(note[1]) === rows.length, `note ${note[1]}, rows ${rows.length}`);
  const max = Math.max(...rows.map((r) => r.wall));
  ok("adapter note max == series max", Number(note[2]) === max, `note ${note[2]}, series ${max}`);
} else ok("adapter pointer found", false, "no 'a N-reading series from 284 s to M s'");

let failed = 0;
for (const c of checks) {
  if (!c.pass) failed++;
  console.log(`${c.pass ? "ok  " : "FAIL"}  ${c.name}  (${c.detail})`);
}
console.log(
  `partition: ${rows.length} = ${graded.length} graded + ${explicit.length} explicit + ${unsupportable.length} unsupportable`
);
console.log(failed === 0 ? "ceiling-counts: clean" : `ceiling-counts: ${failed} failure(s)`);
process.exit(failed === 0 ? 0 : 1);
