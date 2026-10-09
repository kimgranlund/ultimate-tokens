#!/usr/bin/env node
// peer-lightness.mjs (T-0040, ADR-036): ramp@2's band rule across peers. Every enabled palette of a
// kit lands at the same CIELAB L* at the two end bands (stops 075, 100, 900, 925, 950, and so the
// Radix light and dark steps 1 and 12) and carries one shared tint there, in every tone mode,
// anchored or not, damped or not. Measured on the rendered pixel (`projectView`, the surface the
// canvas and every export read), never on a stop's `tone` field.
//
//   peer-lightness extremes <mode>, for perceptual, peak and even, over
//     - the default kit (`defaultDocument()`),
//     - the damped kit (the same document with each palette's `baseChroma` cycled 100, 60, 30 by
//       index, so 10 of 16 palettes render through `dampStops`' post-damp re-snap),
//     - the curated presets opened through `presetDoc` (SAMPLED: the shared seeded sample,
//       test/engine/lib/corpus-sample.mjs; `--full`: every preset):
//     the L* spread across a document's enabled palettes is at most 1.0 at every band stop and at
//     Radix step 1 (stop 100 light, 900 dark) and step 12 (the onSurface role: 950 light, 050 dark),
//     damped palettes included; over the palettes at the full shared tint (ramp chroma 100: a damped
//     palette's tint is r times the target by design; and, in perceptual and peak, unanchored or an
//     anchor whose own gamut fraction is at least chromaFloor / 100: a lower one caps the tint at its
//     own, ADR-036) the gamut-fraction spread (CAM16 chroma over the ceiling at the pixel's own hue and
//     L*) is at most 0.10 at 100 and 900 and 0.15 at 075, 925 and 950, and every fraction is at least
//     0.25. The pass line counts the palettes set aside as capped.
//   peer-lightness extremes control: the same predicate on the default kit pinned `ramp: 1` must fail
//     the L* bound (ramp@1 reads 7.46 L* at stop 100, perceptual), so the bound is shown to bite.
//   peer-lightness grey-anchor: an achromatic anchor keeps its ramp achromatic on perceptual and peak
//     (R69 kept under the band tint): anchors #808080, #808081, #FFFFFF, #000000 and #010101 at palette
//     hue 250, skew 0, lift 0, Base chroma 50 and 100, all 25 export stops, every cell under CAM16 C 5;
//     its control runs the same predicate on the default kit's Primary and must find a cell at C 5 or over.
import { defaultDocument, projectView, rampChromaOf } from "../../src/ui/model.mjs";
import { presetDoc } from "../../src/ui/persist.js";
import { LATEST } from "../../src/engine/layer-pins.mjs";
import { lstarFromRgb, cam16FromRgb, maxChromaInGamut } from "../../src/engine/hct.js";
import { rgbToOklabChroma } from "../../src/engine/okhsl.js";
import { paletteStops, DEFAULT_CONTROLS, EXPORT_STOPS } from "../../src/engine/tonal.js";
import { sampleCorpus } from "./lib/corpus-sample.mjs";

const FULL = process.argv.includes("--full");
const CATS = ["architecture", "cuisine", "film", "literature", "music", "nature", "travel", "brands"];
const MODES = ["perceptual", "peak", "even"];
const BAND_STOPS = [75, 100, 900, 925, 950];
const L_TOL = 1.0;
const FRAC_TOL = { 75: 0.15, 100: 0.1, 900: 0.1, 925: 0.15, 950: 0.15 };
const FRAC_MIN = 0.25;

const fails = [];
const FAIL = (name, msg) => { fails.push(name); console.error(`  FAIL  ${name}: ${msg}`); };
const ok = (name, msg) => console.log(`  pass  ${name}: ${msg}`);
const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const lstarOf = (hex) => lstarFromRgb(hexToRgb(hex));
const fractionOf = (hex) => {
  const rgb = hexToRgb(hex);
  if (rgb[0] === rgb[1] && rgb[1] === rgb[2]) return 0; // an exact grey: CAM16 reads a neutral above 0
  const L = lstarFromRgb(rgb), cam = cam16FromRgb(rgb), m = maxChromaInGamut(cam.hue, L);
  return m > 0 ? Math.min(1, cam.chroma / m) : 0;
};
const spread = (xs) => (xs.length ? Math.max(...xs) - Math.min(...xs) : 0);
// fullTint(pal, d, toneMode): the palette renders the full shared tint at its band stops. Read from the
// palette's own inputs, not the engine's record: ramp chroma 100 and, in perceptual and peak, no anchor
// or an anchor whose OKLab C is at least 0.002 (#739's achromatic bound) and whose CAM16 chroma over the
// gamut ceiling at its own hue and L* is at least chromaFloor / 100.
const fullTint = (pal, d, toneMode) => {
  if (rampChromaOf(pal, d) !== 100) return false;
  if (toneMode === "even" || typeof pal.anchor !== "string") return true;
  const rgb = hexToRgb(pal.anchor);
  if (rgbToOklabChroma(rgb) < 0.002) return false;
  const cam = cam16FromRgb(rgb), m = maxChromaInGamut(cam.hue, lstarFromRgb(rgb));
  return (m > 0 ? Math.min(1, cam.chroma / m) : 0) >= (d.chromaFloor ?? 0) / 100;
};

// readings(doc, toneMode): per band stop and per Radix step, the enabled palettes' pixel L* and, for
// the ramp-chroma-100 palettes, their gamut fractions.
function readings(doc, toneMode) {
  const d = { ...doc, toneMode };
  const view = projectView(d);
  const byName = new Map(d.palettes.map((p) => [p.name, p]));
  const out = { L: {}, F: {}, radixL: {}, capped: 0 };
  for (const s of BAND_STOPS) { out.L[s] = []; out.F[s] = []; }
  for (const key of ["1 light", "1 dark", "12 light", "12 dark"]) out.radixL[key] = [];
  for (const vp of view.palettes) {
    if (!vp.on) continue;
    const pal = byName.get(vp.name);
    const full = fullTint(pal, d, toneMode);
    if (!full && rampChromaOf(pal, d) === 100) out.capped++;
    for (const s of BAND_STOPS) {
      const hex = vp.fullRamp.find((x) => x.stop === s).hex;
      out.L[s].push(lstarOf(hex));
      if (full) out.F[s].push(fractionOf(hex));
    }
    out.radixL["1 light"].push(lstarOf(vp.fullRamp.find((x) => x.stop === 100).hex));
    out.radixL["1 dark"].push(lstarOf(vp.fullRamp.find((x) => x.stop === 900).hex));
    const onSurface = vp.roles.find((r) => r.key === "onSurface");
    out.radixL["12 light"].push(lstarOf(onSurface.lightHex));
    out.radixL["12 dark"].push(lstarOf(onSurface.darkHex));
  }
  return out;
}

// check(label, r, name, strict): FAILs `name` on any bound the readings break; returns the worst L*
// spread and its stop, and the worst fraction spread. `strict` false (the control) only measures.
function check(label, r, name, strict = true) {
  let worstL = 0, worstAt = "", worstF = 0;
  for (const s of BAND_STOPS) {
    const sl = spread(r.L[s]);
    if (sl > worstL) { worstL = sl; worstAt = `stop ${s}`; }
    if (strict && sl > L_TOL) FAIL(name, `${label} stop ${s}: L* spread ${sl.toFixed(3)} over ${L_TOL} (min ${Math.min(...r.L[s]).toFixed(2)}, max ${Math.max(...r.L[s]).toFixed(2)})`);
    if (r.F[s].length >= 2) {
      const sf = spread(r.F[s]);
      worstF = Math.max(worstF, sf);
      if (strict && sf > FRAC_TOL[s]) FAIL(name, `${label} stop ${s}: fraction spread ${sf.toFixed(3)} over ${FRAC_TOL[s]}`);
    }
    if (strict && r.F[s].length && Math.min(...r.F[s]) < FRAC_MIN) FAIL(name, `${label} stop ${s}: a fraction reads ${Math.min(...r.F[s]).toFixed(3)}, under ${FRAC_MIN}`);
  }
  for (const [key, xs] of Object.entries(r.radixL)) {
    const sl = spread(xs);
    if (sl > worstL) { worstL = sl; worstAt = `radix ${key}`; }
    if (strict && sl > L_TOL) FAIL(name, `${label} Radix step ${key}: L* spread ${sl.toFixed(3)} over ${L_TOL}`);
  }
  return { worstL, worstAt, worstF, capped: r.capped };
}

// the curated corpus: SAMPLED draws the shared seeded sample, FULL every preset
const byCategory = {};
for (const slug of CATS) {
  const { PRESETS } = await import(`../../src/ui/categories/${slug}.js`);
  byCategory[slug] = PRESETS;
}
const corpus = FULL
  ? CATS.flatMap((slug) => byCategory[slug].map((p) => ({ ...p, category: slug })))
  : sampleCorpus(byCategory);
if (FULL ? corpus.length !== 343 : corpus.length < 30) FAIL("peer-lightness extremes", `vacuity: ${corpus.length} curated documents loaded (${FULL ? "want 343" : "want at least 30"})`);

const kit = defaultDocument();
const GROUP = [100, 60, 30];
const dampedKit = { ...kit, palettes: kit.palettes.map((p, k) => ({ ...p, baseChroma: GROUP[k % 3] })) };
const dampedCount = dampedKit.palettes.filter((p) => rampChromaOf(p, dampedKit) < 100).length;
if (dampedCount !== 10) FAIL("peer-lightness extremes", `the damped kit renders ${dampedCount} palettes through dampStops, want 10`);

for (const mode of MODES) {
  const name = `peer-lightness extremes ${mode}`;
  const before = fails.length;
  const kitR = check("default kit", readings(kit, mode), name);
  const dampedR = check("damped kit", readings(dampedKit, mode), name);
  let worst = { worstL: 0, worstAt: "", doc: "" };
  let docs = 0, capped = kitR.capped;
  for (const preset of corpus) {
    const doc = presetDoc(preset);
    const label = `${preset.category}/${preset.name}`;
    const r = check(label, readings(doc, mode), name);
    docs++;
    capped += r.capped;
    if (r.worstL > worst.worstL) worst = { worstL: r.worstL, worstAt: r.worstAt, doc: label };
  }
  if (fails.length === before) {
    ok(name, `default kit L* spread ${kitR.worstL.toFixed(3)} (want <= ${L_TOL.toFixed(1)}), fraction spread ${kitR.worstF.toFixed(3)}; ${capped} capped palettes set aside from the fraction leg; damped kit L* spread ${dampedR.worstL.toFixed(3)}; corpus ${docs} docs, worst L* spread ${worst.worstL.toFixed(3)} at ${worst.doc} ${worst.worstAt}`);
  }
}

// control: the default kit pinned to ramp@1 must fail the L* bound
{
  const name = "peer-lightness extremes control";
  const pinned = { ...kit, layers: { ...LATEST, ramp: 1 } };
  const r = check("default kit ramp@1", readings(pinned, "perceptual"), name, false);
  if (!(r.worstL > L_TOL)) FAIL(name, `the default kit pinned ramp 1 reads an L* spread of ${r.worstL.toFixed(3)} at ${r.worstAt}, not over ${L_TOL}: the bound does not discriminate ramp@2 from ramp@1`);
  else ok(name, `the default kit pinned ramp 1 reads an L* spread of ${r.worstL.toFixed(2)} at ${r.worstAt} (perceptual), over ${L_TOL}`);
}

// grey-anchor: an achromatic anchor's ramp stays achromatic on perceptual and peak, with a control
{
  const name = "peer-lightness grey-anchor";
  const greyCells = (palette) => {
    let n = 0, grey = 0, worst = 0;
    for (const toneMode of ["perceptual", "peak"]) for (const chroma of [50, 100]) {
      for (const st of paletteStops({ ...palette, chroma }, { ...DEFAULT_CONTROLS, toneMode }, EXPORT_STOPS)) {
        const c = cam16FromRgb(hexToRgb(st.hex)).chroma;
        n++;
        if (c < 5) grey++;
        worst = Math.max(worst, c);
      }
    }
    return { n, grey, worst };
  };
  let n = 0, grey = 0, worst = 0;
  for (const anchor of ["#808080", "#808081", "#FFFFFF", "#000000", "#010101"]) {
    const r = greyCells({ hue: 250, skew: 0, lift: 0, anchor });
    n += r.n; grey += r.grey; worst = Math.max(worst, r.worst);
  }
  const primary = kit.palettes.find((p) => p.name === "Primary");
  const ctl = greyCells({ ...primary, chroma: 100 });
  if (n !== 500) FAIL(name, `vacuity: ${n} cells, want 500`);
  else if (grey !== n) FAIL(name, `${n - grey} of ${n} cells read CAM16 C 5 or over (worst ${worst.toFixed(2)})`);
  if (ctl.grey === ctl.n) FAIL(name, `control: the default kit's Primary reads every one of ${ctl.n} cells under CAM16 C 5, so the predicate cannot catch a tinted grey ramp`);
  if (!fails.some((f) => f === name)) ok(name, `${grey} of ${n} cells CAM16 C below 5 (worst ${worst.toFixed(2)}), perceptual and peak, Base chroma 50 and 100; control: Primary reads ${ctl.n - ctl.grey} of ${ctl.n} cells at C 5 or over`);
}

if (fails.length) {
  console.log(`\nFAIL: ${fails.length} peer-lightness check(s) failed`);
  process.exit(1);
}
console.log(`\nPASS (${FULL ? "FULL" : "SAMPLED"}): peer-lightness extremes in ${MODES.length} modes, control bites, grey anchors stay grey`);
