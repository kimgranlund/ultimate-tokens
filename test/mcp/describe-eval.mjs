#!/usr/bin/env node
// describe-eval.mjs, verifier for the PURE golden-description eval set + scorer (mcp/describe-eval.mjs,
// #375, perceptual-distance scoring #811). No network, the real-model runner is a SEPARATE script
// (describe-eval-runner.mjs), deliberately not part of this test file or the npm test gate (LLM cost/flake,
// per the ticket's own acceptance).
import { execFileSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { GOLDEN_EVALS, DISTANCE_THRESHOLD, SEED_LIGHTNESS, CHROMA_TO_OKLCH, seedDistance, seedLab, scoreBrief, scoreRun } from "../../mcp/describe-eval.mjs";
import { EXEMPLARS } from "../../mcp/describe-rubric.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };

// ── the golden set is genuinely derived from the exemplar corpus, not a second hand-typed dataset ──
ok(GOLDEN_EVALS.length === EXEMPLARS.filter((e) => Object.keys(e.families).length > 0).length, `GOLDEN_EVALS covers every exemplar that tagged at least one family (got ${GOLDEN_EVALS.length})`);
ok(GOLDEN_EVALS.length >= 10, `at least 10 golden entries exist (got ${GOLDEN_EVALS.length}), the corpus is genuinely bundled, not a stub`);
{
  const g = GOLDEN_EVALS.find((x) => x.id === "ocean-drive-miami-deco");
  const e = EXEMPLARS.find((x) => x.id === "ocean-drive-miami-deco");
  ok(g && g.description === e.theme, "a golden entry's description is exactly the exemplar's own theme string (the same text a caller would send to generate_kit)");
  ok(g.bands.Primary.hue === e.families.Primary.hue && g.bands.Primary.chroma === e.families.Primary.chroma, "a golden entry's band is exactly the exemplar's own resolved family seed (not re-derived or approximated)");
  ok(!("colorName" in g.bands.Primary) && !("description" in g.bands.Primary), "a band carries only {hue, chroma}, not the exemplar's narrative fields, which the scorer never needs");
}

// ── scoreBrief: a perfect brief (the golden's own bands, verbatim) always passes ──
{
  const golden = GOLDEN_EVALS[0];
  const perfectBrief = { families: Object.fromEntries(Object.entries(golden.bands).map(([name, b]) => [name, { hue: b.hue, chroma: b.chroma }])) };
  const result = scoreBrief(golden, perfectBrief);
  ok(result.passed === true && result.misses.length === 0, `a brief matching the golden bands exactly passes with zero misses (got ${JSON.stringify(result)})`);
}

// ── perceptual distance (#811): a brief is judged by the OKLab distance between the color its {hue, chroma}
// names and the golden seed's, not by two per-axis bands. Negative controls first: a hue-flipped brief must
// FAIL, the exact seed and a near miss must PASS, so the threshold provably sits between the two. ──
const asBrief = (golden, patch = {}) => ({ families: Object.fromEntries(Object.entries(golden.bands).map(([n, b]) => [n, { hue: b.hue, chroma: b.chroma, ...(patch[n] || {}) }])) });
const allFamilies = GOLDEN_EVALS.flatMap((g) => Object.entries(g.bands).map(([name, b]) => ({ g, name, b })));
const chromatic = allFamilies.filter(({ b }) => b.chroma >= 15); // a near-grey flipped in hue is the same color to an eye: not a control
ok(chromatic.length >= 40, `the flip control has a real population (got ${chromatic.length} chromatic golden families)`);
ok(Number.isFinite(DISTANCE_THRESHOLD) && DISTANCE_THRESHOLD > 0 && DISTANCE_THRESHOLD < 0.2, `DISTANCE_THRESHOLD is a small positive OKLab distance (got ${DISTANCE_THRESHOLD})`);
ok(SEED_LIGHTNESS > 0 && SEED_LIGHTNESS < 1 && CHROMA_TO_OKLCH > 0, "the fixed lightness and the chroma scale are real named constants");
{
  // exact seed: distance 0, passes, for EVERY family of EVERY golden
  const bad = allFamilies.filter(({ b }) => seedDistance(b, b) !== 0);
  ok(bad.length === 0, `an identical seed is at distance exactly 0 for every golden family (${bad.length} are not)`);
  const failing = GOLDEN_EVALS.filter((g) => !scoreBrief(g, asBrief(g)).passed).map((g) => g.id);
  ok(failing.length === 0, `the exact golden seed passes every case (failing: ${failing.join(", ")})`);
}
{
  // hue flipped 180° on a chromatic family: fails, reason "distance", for EVERY chromatic family of the golden set
  const notFailing = chromatic.filter(({ g, name, b }) => {
    const r = scoreBrief(g, asBrief(g, { [name]: { hue: (b.hue + 180) % 360 } }));
    return r.passed || !r.misses.some((m) => m.family === name && m.reason === "distance");
  });
  ok(notFailing.length === 0, `a brief 180° off in hue fails with reason "distance" on every chromatic golden family (passing: ${notFailing.map((x) => x.g.id + "/" + x.name).join(", ")})`);
  const flipMin = Math.min(...chromatic.map(({ b }) => seedDistance(b, { hue: (b.hue + 180) % 360, chroma: b.chroma })));
  ok(flipMin > DISTANCE_THRESHOLD, `DISTANCE_THRESHOLD (${DISTANCE_THRESHOLD}) sits below the nearest chromatic 180° flip (${flipMin.toFixed(3)})`);
}
{
  // near miss: 10° of hue and 5 chroma off passes for every family; the whole case passes
  const failing = GOLDEN_EVALS.filter((g) => !scoreBrief(g, asBrief(g, Object.fromEntries(Object.entries(g.bands).map(([n, b]) => [n, { hue: (b.hue + 10) % 360, chroma: Math.max(0, b.chroma - 5) }])))).passed).map((g) => g.id);
  ok(failing.length === 0, `a near miss (10° hue, 5 chroma) inside the threshold passes every case (failing: ${failing.join(", ")})`);
}
{
  // the boundary is inclusive and sits where the constant says: bisect a hue offset on one chromatic family
  // to the threshold, then a hair inside passes and a hair outside fails.
  const { g, name, b } = chromatic[0];
  let lo = 0, hi = 90;
  for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (seedDistance(b, { hue: b.hue + mid, chroma: b.chroma }) <= DISTANCE_THRESHOLD) lo = mid; else hi = mid; }
  ok(hi - lo < 1e-6 && lo > 0 && lo < 90, `a hue offset exists whose distance crosses DISTANCE_THRESHOLD (bracket ${lo.toFixed(4)}..${hi.toFixed(4)})`);
  ok(scoreBrief(g, asBrief(g, { [name]: { hue: b.hue + lo } })).passed, `${name} at the last hue offset still within the threshold (${lo.toFixed(3)}°) passes`);
  ok(!scoreBrief(g, asBrief(g, { [name]: { hue: b.hue + hi } })).passed, `${name} at the first hue offset beyond the threshold (${hi.toFixed(3)}°) fails`);
}
{
  // the point of perceptual scoring: the SAME 30° hue miss is invisible on a pastel and a miss on a vivid family
  const pastel = { id: "synthetic-pastel", description: "t", bands: { Primary: { hue: 20, chroma: 21 } } };
  const vivid = { id: "synthetic-vivid", description: "t", bands: { Primary: { hue: 20, chroma: 90 } } };
  ok(scoreBrief(pastel, { families: { Primary: { hue: 50, chroma: 21 } } }).passed, "a 30° hue miss on a pastel (chroma 21) passes");
  ok(!scoreBrief(vivid, { families: { Primary: { hue: 50, chroma: 90 } } }).passed, "the same 30° hue miss on a vivid family (chroma 90) fails");
  // and a near-grey flipped 180° is the same color to an eye
  const grey = { id: "synthetic-grey", description: "t", bands: { Neutral: { hue: 83, chroma: 3 } } };
  ok(scoreBrief(grey, { families: { Neutral: { hue: 263, chroma: 3 } } }).passed, "a near-grey (chroma 3) flipped 180° in hue passes, the two colors are indistinguishable");
}
{
  // circular hue distance must wrap around 0/360, a naive |a-b| would read hue 5 vs hue 355 as 350°
  // apart (a false miss) when it's actually only 10° apart, well within the threshold.
  const wraparoundGolden = { id: "synthetic-wraparound", description: "test", bands: { Primary: { hue: 5, chroma: 50 } } };
  const wraparoundBrief = { families: { Primary: { hue: 355, chroma: 50 } } };
  const result = scoreBrief(wraparoundGolden, wraparoundBrief);
  ok(result.passed, `hue 355 vs a golden hue of 5 is only 10° apart across the 0/360 wrap, well within the threshold, must pass, not fail on a naive |355-5|=350 miscalculation (got ${JSON.stringify(result)})`);
}
{
  // a chroma-only miss is caught by the same distance: a vivid family returned at a washed-out strength
  const g = GOLDEN_EVALS.find((x) => Object.values(x.bands).some((b) => b.chroma >= 60));
  const name = Object.keys(g.bands).find((n) => g.bands[n].chroma >= 60);
  const r = scoreBrief(g, asBrief(g, { [name]: { chroma: g.bands[name].chroma - 50 } }));
  const m = r.misses.find((x) => x.family === name);
  ok(!r.passed && m && m.reason === "distance", `a vivid family returned 50 chroma too weak fails with reason "distance" (got ${JSON.stringify(r.misses)})`);
  ok(m && typeof m.distance === "number" && m.distance > DISTANCE_THRESHOLD && m.got && m.want && m.want.hue === g.bands[name].hue, `a distance miss keeps got/want/distance (got ${JSON.stringify(m)})`);
}
{
  // symmetric, and gamut-safe: out-of-range input is clamped, never thrown on, never NaN
  const a = { hue: 30, chroma: 60 }, c = { hue: 200, chroma: 40 };
  ok(Math.abs(seedDistance(a, c) - seedDistance(c, a)) < 1e-12, "seedDistance is symmetric");
  let d; let threw = false;
  try { d = seedDistance({ hue: 1e6, chroma: 5000 }, { hue: -720, chroma: -9 }); } catch { threw = true; }
  ok(!threw && Number.isFinite(d), `out-of-range hue/chroma are clamped, not thrown on (got ${d})`);
  const lab = seedLab({ hue: 30, chroma: 60 });
  ok(lab.length === 3 && lab.every(Number.isFinite) && lab[0] > 0.4 && lab[0] < 0.9, `seedLab returns OKLab near the fixed lightness (got ${JSON.stringify(lab)})`);
}

// ── scoreBrief: defensive reading, malformed/missing input degrades to misses, never throws ──
{
  const golden = GOLDEN_EVALS[0];
  let threw = false;
  let result;
  try { result = scoreBrief(golden, null); } catch { threw = true; }
  ok(!threw, "scoreBrief(golden, null) does not throw");
  ok(!result.passed && result.misses.length === Object.keys(golden.bands).length && result.misses.every((m) => m.reason === "missing"), `a null brief misses EVERY family with reason "missing" (got ${JSON.stringify(result.misses)})`);
}
{
  const golden = GOLDEN_EVALS[0];
  const partial = { families: { Primary: { hue: golden.bands.Primary.hue, chroma: golden.bands.Primary.chroma } } }; // only Primary given, others absent
  const result = scoreBrief(golden, partial);
  ok(!result.passed && result.misses.filter((m) => m.reason === "missing").length === Object.keys(golden.bands).length - 1, `a partial brief misses only the ABSENT families, not the one correctly given (got ${JSON.stringify(result.misses)})`);
}
{
  const golden = GOLDEN_EVALS[0];
  const noHue = { families: { ...Object.fromEntries(Object.entries(golden.bands).map(([n, b]) => [n, { hue: b.hue, chroma: b.chroma }])), Primary: { chroma: golden.bands.Primary.chroma } } }; // hue field absent, not just wrong
  const result = scoreBrief(golden, noHue);
  ok(result.misses.some((m) => m.family === "Primary" && m.reason === "hue-missing"), `a family entry present but missing its hue field reports reason "hue-missing", distinct from a wrong-value "distance" miss (got ${JSON.stringify(result.misses)})`);
  ok(!result.misses.some((m) => m.family === "Primary" && m.reason === "distance"), "a family with no hue takes no distance (a half seed cannot be drawn)");
}
{
  const golden = GOLDEN_EVALS[0];
  const noChroma = { families: { ...Object.fromEntries(Object.entries(golden.bands).map(([n, b]) => [n, { hue: b.hue, chroma: b.chroma }])), Primary: { hue: golden.bands.Primary.hue } } }; // chroma field absent
  const result = scoreBrief(golden, noChroma);
  ok(result.misses.some((m) => m.family === "Primary" && m.reason === "chroma-missing"), `a family entry present but missing its chroma field reports reason "chroma-missing" (got ${JSON.stringify(result.misses)})`);
  ok(!result.misses.some((m) => m.family === "Primary" && m.reason === "distance"), "a family with no chroma takes no distance");
}

// ── scoreRun: aggregates a whole run, matches by id, tolerates an unknown id ──
{
  const results = GOLDEN_EVALS.slice(0, 3).map((g) => ({ id: g.id, brief: { families: Object.fromEntries(Object.entries(g.bands).map(([n, b]) => [n, { hue: b.hue, chroma: b.chroma }])) } } ));
  const summary = scoreRun(results);
  ok(summary.total === 3 && summary.passCount === 3, `scoreRun aggregates correctly over 3 perfect briefs (got ${JSON.stringify({ total: summary.total, passCount: summary.passCount })})`);
}
{
  // a mixed run keeps its result shape ({scored: [{id, passed, misses}], passCount, total}) and counts a near miss as a pass
  const [g0, g1] = GOLDEN_EVALS;
  const summary = scoreRun([{ id: g0.id, brief: asBrief(g0, Object.fromEntries(Object.entries(g0.bands).map(([n, b]) => [n, { hue: (b.hue + 10) % 360 }]))) }, { id: g1.id, brief: { families: {} } }]);
  ok(summary.total === 2 && summary.passCount === 1 && summary.scored[0].passed === true && summary.scored[1].passed === false && Array.isArray(summary.scored[1].misses), `scoreRun keeps its result shape over a mixed run (got ${JSON.stringify({ total: summary.total, passCount: summary.passCount })})`);
}
{
  const summary = scoreRun([{ id: "not-a-real-golden-id", brief: {} }]);
  ok(summary.total === 1 && summary.passCount === 0 && summary.scored[0].misses[0].reason === "unknown-golden-id", "scoreRun degrades gracefully for an id with no matching golden entry, instead of throwing");
}

// ── the runner (a REAL process, describe-eval-runner.mjs) gracefully skips, exit 0, no network call,
// when no provider key is present. Genuinely testable without a real key or network access: the skip
// path returns before ever calling fetch. This is the regression guard for "CI secret custody is still
// open" (#375's own Scope/Open) never turning into a red build the moment the workflow that invokes this
// script runs before a key has been added.
{
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY;
  const out = execFileSync("node", [resolve(ROOT, "mcp/describe-eval-runner.mjs")], { env, encoding: "utf8" });
  ok(/skipped.*no ANTHROPIC_API_KEY/i.test(out), `the runner, with no API key in its environment, prints a clear skip message (got: ${out.trim()})`);
}

if (fails.length) { console.error(`describe-eval FAIL (${fails.length}):\n  ` + fails.join("\n  ")); process.exit(1); }
console.log("describe-eval PASS, GOLDEN_EVALS (derived from the real exemplar corpus, not a second dataset) + scoreBrief/scoreRun (perceptual-distance scoring with hue-flip/exact/near-miss controls, defensive reads, no throws) + the runner's graceful no-key skip");
process.exit(0);
