#!/usr/bin/env node
// chroma-envelope-gate.mjs - #725 U1: the muted DIRECTION of the chroma envelope, gated. Reads the same
// measurement `scripts/report-preset-fidelity.mjs --envelope` prints as READING (a) (emitted CAM16
// chroma at stops 100/300/700/900 as % of stop 500's, rendered anchored path, curated palettes at
// source chroma >= 10 plus the 8 default-kit semantic families), imported from
// scripts/lib/envelope-measure.mjs rather than re-derived, and holds it two ways:
//
// - a RATCHET against test/engine/fixtures/chroma-envelope.json: per mode (perceptual, peak, even) the
//   median and p90 at each of the four stops may fall but not rise past the frozen value plus SLACK
//   (0.05 percentage points), and the three clause counts (perceptual cusp-run rule violations, peak
//   and even instances above 100% of stop 500) may not rise at all. The report's ruled bars (25/35,
//   75/90) are NOT read here: today's cells miss them (#725), so the ratchet holds the measured
//   figures while U2 and U3 bring them down, and each of those units re-captures.
// - an absolute DIRECTION leg, fixture-independent: in every mode the stop-100 median sits below the
//   stop-300 median and the stop-900 median below the stop-700 median (the ramp gets more muted
//   toward its ends, never less).
//
// A full-corpus sweep, so per #713 it is a gate script (`npm run gate:chroma-envelope`, a `gate:sweeps`
// member and a `sweeps` CI matrix leg), not a `test/run.mjs` TESTS entry. `--full` is accepted for the
// shared convention and not read: there is no sampled reading.
//
//   node test/engine/chroma-envelope-gate.mjs [--full] [--fixture <path>] [--damp-amp N]
//   node test/engine/chroma-envelope-gate.mjs --capture [--fixture <path>]
//   node test/engine/chroma-envelope-gate.mjs --compare <base fixture> [--fixture <head fixture>]
//
// `--fixture <path>` reads (or, with `--capture`, writes) that fixture instead of the committed one.
// `--damp-amp N` is the report's own negative control: forces every palette's `dampAmp` to N, which
// lifts the envelope's shoulder, so at least one ratchet cell must red. It is refused with `--capture`.
// `--capture` measures the current tree and writes the fixture. If every value equals the fixture's
// already, the file is left byte-identical (re-capture on an unchanged tree is a no-op); otherwise
// `capturedAt` names HEAD, the commit the uncommitted change sits on (a commit cannot name its own sha,
// the mode-isolation fixture's rule). Used by hand, by the change that moves a cell, which also shows
// with `--compare` that nothing rose.
// `--compare <base>` measures nothing: it compares the head fixture (the committed one, or `--fixture`)
// against a base fixture cell by cell, prints every cell whose head value exceeds its base value plus
// SLACK (counts: any rise), and exits 1 if any did. `0 cells rose` is the passing line.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve as pathResolve } from "node:path";
import { pathToFileURL } from "node:url";
import { MODES, REPORT_STOPS, measureEnvelope } from "../../scripts/lib/envelope-measure.mjs";

const SLACK = 0.05; // percentage points a median or p90 cell may sit above its frozen value
const STATS = ["median", "p90"];
const COUNT_KEY = { perceptual: "cuspRuns", peak: "above100", even: "above100" };

const argv = process.argv.slice(2);
const argOf = (flag) => {
  const i = argv.indexOf(flag);
  if (i < 0) return null;
  const v = argv[i + 1];
  if (v === undefined || v.startsWith("--")) { console.log(`FAIL: ${flag} needs a value`); process.exit(2); }
  return v;
};
const CAPTURE = argv.includes("--capture");
const comparePath = argOf("--compare");
const fixtureArg = argOf("--fixture");
const dampAmpArg = argOf("--damp-amp");
const dampAmpOverride = dampAmpArg === null ? null : Number(dampAmpArg);
if (dampAmpOverride !== null && !Number.isFinite(dampAmpOverride)) { console.log(`FAIL: --damp-amp needs a number, got ${dampAmpArg}`); process.exit(2); }
if (CAPTURE && dampAmpOverride !== null) { console.log("FAIL: --capture with --damp-amp would freeze a negative control as the fixture; refused"); process.exit(2); }
if (CAPTURE && comparePath !== null) { console.log("FAIL: --capture and --compare are separate modes"); process.exit(2); }

const FIXTURE_URL = fixtureArg !== null ? pathToFileURL(pathResolve(process.cwd(), fixtureArg)) : new URL("./fixtures/chroma-envelope.json", import.meta.url);
const fixtureLabel = fixtureArg ?? "test/engine/fixtures/chroma-envelope.json";

// every ratchet cell of a fixture-shaped object, in a fixed order: [label, value, isCount]
function cells(fx) {
  const out = [];
  for (const mode of MODES) {
    for (const s of REPORT_STOPS) for (const stat of STATS) out.push([`${mode} ${s} ${stat}`, fx.modes?.[mode]?.[stat]?.[s], false]);
    out.push([`${mode} ${COUNT_KEY[mode]}`, fx.modes?.[mode]?.[COUNT_KEY[mode]], true]);
  }
  return out;
}

function readFixture(url, label) {
  let fx;
  try { fx = JSON.parse(readFileSync(url, "utf8")); } catch (e) { console.log(`FAIL: cannot read fixture ${label}: ${e.message}`); process.exit(1); }
  const bad = cells(fx).filter(([, v]) => !Number.isFinite(v)).map(([k]) => k);
  if (bad.length) { console.log(`FAIL: fixture ${label} is missing ${bad.length} cell(s): ${bad.join(", ")}`); process.exit(1); }
  return fx;
}

const fmt = (v, isCount) => (isCount ? String(v) : v.toFixed(4));

if (comparePath !== null) {
  const base = readFixture(pathToFileURL(pathResolve(process.cwd(), comparePath)), comparePath);
  const head = readFixture(FIXTURE_URL, fixtureLabel);
  const baseCells = new Map(cells(base).map(([k, v]) => [k, v]));
  const rose = [];
  for (const [k, v, isCount] of cells(head)) {
    const b = baseCells.get(k);
    if (v > b + (isCount ? 0 : SLACK)) { rose.push(k); console.log(`    rose: ${k} ${fmt(v, isCount)} > base ${fmt(b, isCount)}${isCount ? "" : ` + ${SLACK}`}`); }
  }
  for (const mode of MODES) {
    const same = cells(head).filter(([k]) => k.startsWith(`${mode} `)).every(([k, v]) => v === baseCells.get(k));
    console.log(`  ${mode}: ${same ? "byte-identical to base" : "moved against base"}`);
  }
  console.log(`${rose.length} cells rose (head ${fixtureLabel} against base ${comparePath}${rose.length ? `: ${rose.join(", ")}` : ""})`);
  process.exit(rose.length ? 1 : 0);
}

const m = await measureEnvelope({ dampAmpOverride });
const measured = { n: m.results.perceptual[100].n, modes: {} };
for (const mode of MODES) {
  const row = { median: {}, p90: {} };
  for (const s of REPORT_STOPS) for (const stat of STATS) row[stat][s] = m.results[mode][s][stat];
  row[COUNT_KEY[mode]] = m.aboveTotal[mode];
  measured.modes[mode] = row;
}
const corpusLabel = `${m.totalCurated} curated palettes, ${m.instances.length} instances (source chroma >= 10 or a default-kit semantic family), rendered anchored path`;

const summary = (fx) => MODES.map((mode) => {
  const r = fx.modes[mode];
  const row = (stat) => REPORT_STOPS.map((s) => r[stat][s].toFixed(1)).join(" / ");
  return `  ${mode}: median ${row("median")}; p90 ${row("p90")}; ${COUNT_KEY[mode]} ${r[COUNT_KEY[mode]]}`;
}).join("\n");

if (CAPTURE) {
  let prior = null;
  try { prior = JSON.parse(readFileSync(FIXTURE_URL, "utf8")); } catch { /* no fixture yet */ }
  const unchanged = prior !== null && prior.n === measured.n &&
    cells(prior).every(([k, v], i) => v === cells(measured)[i][1]);
  if (unchanged) {
    console.log(`capture: every value equals ${fixtureLabel} (captured at ${prior.capturedAt}); file left unchanged\n${summary(measured)}`);
    process.exit(0);
  }
  let sha = "unknown";
  try { sha = execFileSync("git", ["rev-parse", "HEAD"], { cwd: new URL("../..", import.meta.url) }).toString().trim(); } catch { /* no-git scratch context: leave "unknown" */ }
  const fx = {
    owner: "the change that moves a perceptual, peak or even ramp at stops 100/300/700/900 (or edits the curated corpus or the default kit) re-captures this fixture with --capture in that same change and shows with --compare against the prior fixture that no cell rose: the ratchet only falls (#725 plan constraints). #725 U2 and U3 move perceptual and peak and re-capture",
    capturedAt: sha,
    corpus: corpusLabel,
    slack: `${SLACK} percentage points on each median and p90 cell; 0 on the three counts (the gate's SLACK constant)`,
    n: measured.n,
    modes: measured.modes,
  };
  writeFileSync(FIXTURE_URL, JSON.stringify(fx, null, 1) + "\n");
  console.log(`captured at ${sha} (${corpusLabel}) into ${fixtureLabel}\n${summary(measured)}`);
  process.exit(0);
}

const FX = readFixture(FIXTURE_URL, fixtureLabel);
console.log(`chroma-envelope-gate${dampAmpOverride !== null ? ` --damp-amp ${dampAmpOverride}` : ""}: ${corpusLabel}`);
console.log(summary(measured));

const failures = [];
// vacuity: a measurement over a different (or empty) population is not comparable to the fixture
for (const mode of MODES) for (const s of REPORT_STOPS) {
  if (m.results[mode][s].n !== FX.n) failures.push(`${mode} ${s} n ${m.results[mode][s].n} (fixture ${FX.n}; the corpus changed, re-capture if that was intended)`);
}
const fxCells = new Map(cells(FX).map(([k, v]) => [k, v]));
const rose = [];
for (const [k, v, isCount] of cells(measured)) {
  const f = fxCells.get(k);
  if (!Number.isFinite(v)) { failures.push(`${k} not finite (${v})`); continue; }
  if (v > f + (isCount ? 0 : SLACK)) {
    rose.push(k);
    console.log(`    rose: ${k} ${fmt(v, isCount)} > fixture ${fmt(f, isCount)}${isCount ? "" : ` + ${SLACK}`}`);
  }
}
const dirFails = [];
for (const mode of MODES) {
  const med = m.results[mode];
  const pairs = [[100, 300], [900, 700]];
  for (const [end, inner] of pairs) {
    if (!(med[end].median < med[inner].median)) {
      dirFails.push(`${mode} ${end}<${inner}`);
      console.log(`    direction: ${mode} stop ${end} median ${med[end].median.toFixed(4)} is not below stop ${inner} median ${med[inner].median.toFixed(4)}`);
    }
  }
}
for (const f of failures) console.log(`    ${f}`);

const total = cells(FX).length;
if (rose.length || dirFails.length || failures.length) {
  const parts = [];
  if (failures.length) parts.push(`${failures.length} vacuity failure(s)`);
  if (rose.length) parts.push(`${rose.length} of ${total} cells rose past fixture (${rose.join(", ")})`);
  if (dirFails.length) parts.push(`direction fails: ${dirFails.join(", ")}`);
  console.log(`  FAIL  chroma-envelope: ${parts.join("; ")} (fixture ${fixtureLabel}, captured at ${FX.capturedAt})`);
  process.exit(1);
}
console.log(`  pass  chroma-envelope: ${MODES.length} modes x ${REPORT_STOPS.length} stops x ${STATS.length} stats + ${MODES.length} clause counts within fixture; direction holds in ${MODES.length} modes`);
