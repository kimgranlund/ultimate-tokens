// describe-eval.mjs, the PURE golden-description eval set + scorer (#375). Interpretation quality (the
// words→brief step) can't be parity-gated mechanically, it varies by calling model, so this gates what
// CAN be measured: does a model-produced brief land its per-family hue/chroma in the right neighborhood
// for a known theme, judged by PERCEPTUAL DISTANCE (#811), not by two independent per-axis bands.
// "Golden" here means the SAME 15 exemplars #370's rubric already bundles (mcp/describe-rubric.mjs's EXEMPLARS), not a second, drift-prone dataset. Each exemplar's own `families`
// object (already computed via hexToOklch+seedFromKeyColor from a REAL corpus hex, #370) is treated as
// the answer key: the exact seed a perfect interpretation of that theme would produce. This module is
// pure and network-free, the network call (a real provider interpreting a description) lives in the
// separate describe-eval-runner.mjs, which imports this file's data + scorer.

import { EXEMPLARS } from "./describe-rubric.mjs";
import { oklchToRgb } from "../src/engine/okhsl.js";
import { rgbToOklchArr } from "../src/ui/model.mjs";

// Perceptual-distance scoring (#811, replaces the per-axis HUE_TOLERANCE 30 / CHROMA_TOLERANCE 20 bands,
// which passed 0 of 15 for every model: a hue miss and a chroma miss were judged separately, and ±30° is a
// huge step on a vivid family and an invisible one on a near-grey). A family is now judged the way an eye
// would: both the brief's {hue, chroma} and the golden seed's {hue, chroma} are turned into a color at one
// fixed lightness and the OKLab distance between the two colors must be within DISTANCE_THRESHOLD.
//
// SEED_LIGHTNESS, the one lightness both colors are drawn at (OKLCH L). A seed carries no lightness (its
// `tone` is a ramp key, not part of the hue/chroma judgement), so one fixed value keeps the comparison to
// hue + chroma alone. 0.65 sits mid-ramp where the sRGB gamut is widest across hues: at the scale below only
// 3 of the 59 exemplar families clip at 0.65 (5 at 0.7, 7 at 0.55), so the drawn color is almost always the
// color the seed names, not a gamut-clamped stand-in.
export const SEED_LIGHTNESS = 0.65;

// CHROMA_TO_OKLCH, OKLCH chroma per unit of seed chroma. A seed's `chroma` is CAM16 chroma on a 0..100
// scale (seedFromKeyColor, mcp/describe-rubric.mjs seedOf), not OKLCH chroma, so it is converted. Measured
// 2026-10-07 over a 15-step sRGB lattice (4348 colors, OKLCH L 0.4..0.85, CAM16 chroma > 20): OKLCH C per CAM16
// chroma unit has median 0.00268 and inter-decile range 0.00241..0.00306, i.e. the two scales are near-linear
// in each other over the range an eval cares about. 0.0027 puts chroma 100 at OKLCH C 0.27 and a pastel (25) at 0.07.
export const CHROMA_TO_OKLCH = 0.0027;

// DISTANCE_THRESHOLD, the largest OKLab distance (inclusive) at which a family still passes. Chosen from the
// golden set itself (59 exemplar families, drawn at SEED_LIGHTNESS), measured 2026-10-07:
//   - a chromatic family (chroma >= 15, 50 of the 59) flipped 180° in hue sits 0.081 to 0.452 from its seed
//     (median 0.226), so the threshold must stay BELOW 0.081 or a hue-flipped brief could pass;
//   - the retired bands, as distances: hue +30° is 0.051 at the median family (0.005 at a near-grey, 0.139 at the
//     most vivid) and chroma +-20 is 0.054 to 0.056 for any family that can move 20, so the threshold must sit
//     ABOVE 0.056 or the retired chroma edge would read as a miss;
//   - the two live runs of 2026-10-07 (#811): Haiku 4.5 returned every family but missed hue by 30° to 177° and
//     chroma by 20 to 76. The raw per-case briefs were not kept, so those runs are NOT re-scored here. Replaying
//     the reported miss sizes against the 59 seeds at this threshold: hue +30° clears 46 of 59 families (37 of
//     the 50 chromatic), +60° clears 22 (13), +90° clears 15 (6), +177° clears 9 (0 of the 50 chromatic; the 9 are
//     near-greys, which is the point); chroma -20 clears all 59, -30 clears 25, -76 clears 22 (low-chroma seeds
//     sit within 0.07 of grey whatever the brief says). Haiku 5.5 after the families-string parse fix has no
//     measurement yet; its rerun is the user's.
// 0.07 is the middle of that 0.056 to 0.081 window (0.0685), with margin to both ends: "right hue family,
// roughly right strength", the interpretation DIRECTION this eval measures, not exact-hex recall.
export const DISTANCE_THRESHOLD = 0.07;

const clampChroma = (c) => Math.min(100, Math.max(0, c));
const clampHue = (h) => ((h % 360) + 360) % 360;

// seedLab({hue, chroma}) → [L, a, b], the OKLab coordinates of the color a seed names at SEED_LIGHTNESS,
// through the engine's own OKLCH→sRGB path (oklchToRgb, gamut-clamped to 8-bit) and back, so the distance is
// between two colors a kit could actually render. Pure and DOM-free.
export function seedLab({ hue, chroma }) {
  const rgb = oklchToRgb(SEED_LIGHTNESS, clampChroma(chroma) * CHROMA_TO_OKLCH, clampHue(hue));
  const [L, C, H] = rgbToOklchArr(rgb);
  const r = (H * Math.PI) / 180;
  return [L, C * Math.cos(r), C * Math.sin(r)];
}

// seedDistance(a, b) → the OKLab (Euclidean) distance between two {hue, chroma} seeds.
export function seedDistance(a, b) {
  const x = seedLab(a), y = seedLab(b);
  return Math.hypot(x[0] - y[0], x[1] - y[1], x[2] - y[2]);
}

// GOLDEN_EVALS, one entry per exemplar that tagged at least one family. `description` is the exact
// theme string a caller would send to generate_kit({description}); `bands[family]` is the golden {hue, chroma}
// seed (the field name predates #811's perceptual scoring and is kept for the result shape) a model-produced
// brief's SAME family is measured against: it passes within DISTANCE_THRESHOLD of that seed.
export const GOLDEN_EVALS = EXEMPLARS.filter((e) => Object.keys(e.families).length > 0).map((e) => ({
  id: e.id,
  description: e.theme,
  bands: Object.fromEntries(Object.entries(e.families).map(([name, f]) => [name, { hue: f.hue, chroma: f.chroma }])),
}));

// scoreBrief(golden, brief) → { misses: [...], passed: boolean }. `brief` is whatever a model (or a test)
// produced for `golden.description`, a plain object shaped like a PaletteBrief (§3), read defensively:
// a missing/malformed families object or family entry is a MISS, never a thrown error, so one bad model
// response degrades a report entry instead of crashing the whole eval run. A family with both hue and
// chroma passes when seedDistance(brief, golden) <= DISTANCE_THRESHOLD; otherwise it misses with reason
// "distance" ({got, want} are the brief's and the golden's {hue, chroma}, `distance` the OKLab distance to
// 3 places). An absent family is "missing", an absent hue or chroma is "hue-missing" / "chroma-missing"
// (no distance is taken when either is absent, a half seed cannot be drawn).
export function scoreBrief(golden, brief) {
  const misses = [];
  const families = (brief && typeof brief === "object" && brief.families && typeof brief.families === "object") ? brief.families : {};
  for (const [family, band] of Object.entries(golden.bands)) {
    const seed = families[family];
    if (!seed || typeof seed !== "object") { misses.push({ family, reason: "missing", want: band }); continue; }
    const hueOk = typeof seed.hue === "number" && Number.isFinite(seed.hue);
    const chromaOk = typeof seed.chroma === "number" && Number.isFinite(seed.chroma);
    if (!hueOk) misses.push({ family, reason: "hue-missing", want: band.hue });
    if (!chromaOk) misses.push({ family, reason: "chroma-missing", want: band.chroma });
    if (!hueOk || !chromaOk) continue;
    const distance = seedDistance(seed, band);
    if (distance > DISTANCE_THRESHOLD) {
      misses.push({ family, reason: "distance", got: { hue: seed.hue, chroma: seed.chroma }, want: { hue: band.hue, chroma: band.chroma }, distance: Math.round(distance * 1000) / 1000 });
    }
  }
  return { misses, passed: misses.length === 0 };
}

// scoreRun(results) → a summary over a whole eval run: results = [{id, brief}] (one per GOLDEN_EVALS
// entry, in the same order or matched by id). Convenience for the runner + tests, not required for a
// caller who only wants scoreBrief on one entry.
export function scoreRun(results) {
  const byId = new Map(GOLDEN_EVALS.map((g) => [g.id, g]));
  const scored = results.map(({ id, brief }) => {
    const golden = byId.get(id);
    if (!golden) return { id, passed: false, misses: [{ family: null, reason: "unknown-golden-id" }] };
    return { id, ...scoreBrief(golden, brief) };
  });
  return { scored, passCount: scored.filter((s) => s.passed).length, total: scored.length };
}
