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
const WORDS = { eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16 };

const baseline = readFileSync(".sdlc/baseline.md", "utf8");
const adapter = readFileSync(".sdlc/adapter.md", "utf8");

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

const checks = [];
const ok = (name, pass, detail) => checks.push({ name, pass, detail });

ok("series has rows at all", rows.length > 0, `${rows.length} rows parsed`);
if (claim) {
  ok("prose total == rows", Number(claim[1]) === rows.length, `prose ${claim[1]}, rows ${rows.length}`);
  ok("prose above == measured", Number(claim[2]) === above.length, `prose ${claim[2]}, measured ${above.length}`);
  ok("prose inside == measured", Number(claim[3]) === inside.length, `prose ${claim[3]}, measured ${inside.length}`);
} else ok("prose count sentence found", false, "no '**N readings**: **A** above ... **I** inside'");
ok("above + inside == total", above.length + inside.length === rows.length,
  `${above.length} + ${inside.length} vs ${rows.length}`);

if (part) {
  const others = Number(part[1]);
  const stated = WORDS[part[2].toLowerCase()] ?? Number(part[2]);
  ok("prose 'other N' == total - graded", others === rows.length - graded.length,
    `prose ${others}, measured ${rows.length - graded.length}`);
  ok("prose explicit count == measured", stated === explicit.length, `prose ${stated}, measured ${explicit.length}`);
  // The assertion the earlier defect needed: the parts must exhaust the whole.
  ok("PARTITION graded + explicit + unsupportable == total",
    graded.length + explicit.length + unsupportable.length === rows.length,
    `${graded.length} + ${explicit.length} + ${unsupportable.length} vs ${rows.length}`);
  ok("prose partition parts sum to 'other N'", stated + unsupportable.length === others,
    `${stated} + ${unsupportable.length} vs ${others}`);
} else ok("prose partition sentence found", false, "no 'Of the other N: **word** record an explicit'");

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
