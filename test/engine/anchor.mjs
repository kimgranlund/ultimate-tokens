#!/usr/bin/env node
// anchor.mjs — U1 (ticket #681, plan `preset-intent-fidelity`): the anchor field's own identity gates.
//
// C2 anchor-identity. For every REGENERATED corpus palette carrying a stored `anchor` (the sampled +
// status palettes scripts/gen-categories.mjs mints — direct/authored "brands" palettes and derived
// neutrals never carry one unless a spec JSON opts in, Q5):
//   (a) primeSwatches(palette, controls)[3].hex === anchor — called DIRECTLY, the same shape
//       test/engine/prime.mjs's own gates use.
//   (b) the ACTUAL export pipeline's prime.DEFAULT (src/engine/exports.js derivePalette ->
//       primeSwatches, wired at #681 U1 so `anchor` reaches that call) renders the SAME oklch as an
//       INDEPENDENT hex->oklch conversion of the anchor — a from-scratch sRGB->OKLab->OKLCH copy in
//       THIS file, never prime.mjs's or exports.js's own private rgbToOklch, so a bug shared between
//       the code under test and its check cannot cancel out (checks-that-bite's independence law).
// Plan's stated count is 3,380 (2,028 sampled + 1,352 status) on the plan's own measured base. This
// repo's actual corpus at U1's branch base (`git merge-base HEAD origin/main`, recorded in the unit
// handoff) counts EXACTLY 3,380 sampled+status palettes too (62 direct + 338 derived-neutral + 3,380
// sampled/status = 3,780 total, verified against the spec JSON's own `direct` structural marker before
// this file was written) — so the count below is asserted, not assumed.
//
// C2's negative control (documented here, per the plan: "patch one spec swatch hex by one byte in a
// scratch copy and rerun the generator into a temp dir, the gate names that preset and palette"): that
// full round trip is exercised by hand when touching scripts/gen-categories.mjs's `palette()` anchor
// lines. This file ALSO runs a cheaper, self-contained simulation of the same fault on every run (never
// skipped, so a change that breaks the CHECK itself — not just the feature — is caught immediately):
// one real anchored palette's `anchor` is corrupted by a single hex digit in memory and the identity
// check is proven to catch it, BY NAME (preset + palette), before the real corpus is graded.
//
// C4 (prime half) — the non-anchored identity control. `primeSwatches` must be BYTE-IDENTICAL to its
// pre-#681 behaviour whenever `anchor` is absent, over EVERY corpus palette (3,780, `anchor` stripped
// whether or not it is present — the point is the CODE PATH, not just the currently-anchored subset)
// plus the 16 default-kit palettes. The expectation is a FRESH, independent reimplementation of the
// pre-#681 algorithm (deriveKeyColor's cusp construction) written directly against hct.js/okhsl.js's
// validated primitives — never a call back into primeSwatches's own internals — mirroring
// test/engine/prime.mjs's own "Agent verification" anti-tautology note for this exact file. A negative
// control (one mutated chroma) proves the comparison loop itself can fail before trusting its "0 off".
import { primeSwatches, primeSteps, PRIME_STEPS } from "../../src/engine/prime.mjs";
import { peakC, hctToRgb } from "../../src/engine/hct.js";
import { effHue } from "../../src/engine/tonal.js";
import { rgbToOkhsl, okhslToRgb } from "../../src/engine/okhsl.js";
import { derivedAll, oklchStr } from "../../src/engine/exports.js";
import { defaultDocument } from "../../src/ui/model.mjs";

const CATS = ["architecture", "cuisine", "film", "literature", "music", "nature", "travel", "brands"];

const fails = [];
const FAIL = (g, m) => { if (!fails.some((f) => f.startsWith(g + ":"))) fails.push(`${g}: ${m}`); };

// ── independent hex<->oklch — a from-scratch conversion, never prime.mjs's/exports.js's own private
//    copy (both are correct, but a shared bug in either must not agree with itself here). ───────────
const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function rgbToOklchIndep([r, g, b]) {
  const inv = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const rl = inv(r), gl = inv(g), bl = inv(b);
  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(a * a + b2 * b2);
  let H = C < 0.00005 ? 0 : (Math.atan2(b2, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

// a minimal single-palette exports.js state — the SAME shape controlsOf()/enabledPalettes() expect
// (exports.js:207-241/245-247); `paletteGroups: {}` makes rampChromaOf fall back to `baseChroma`
// (irrelevant to prime, which never reads the ramp chroma), and `roleOverrides: {}` so
// applyRoleOverrides has a defined object to iterate.
function stateFor(p) {
  return {
    palettes: [{ ...p, on: true }],
    curve: "logistic", tension: 0, lmin: 5, lmax: 100, damp: 80, dampCurve: 1.5, dampAmp: 0, dampBias: 0,
    hueSpace: p.hueSpace ?? "oklch", toneMode: "perceptual", vibrancy: 0, onColorMode: "fixed", accentRef: "mode",
    relChroma: false, chromaFloor: 40, baseChroma: 100, primeChroma: 100, paletteGroups: {},
    roleOverrides: {},
  };
}

// referenceNonAnchored(palette, controls) — a FRESH copy of prime.mjs's pre-#681 (deriveKeyColor cusp)
// construction, built directly against hct.js/okhsl.js/tonal.js's validated primitives, never calling
// primeSwatches. `primeSteps`/`PRIME_STEPS` are reused (test/engine/prime.mjs's own precedent: they are
// pre-existing, unchanged-by-#681 exports, not the branching logic under test here).
function referenceNonAnchored(palette, controls) {
  const baseHue = effHue(palette.hue, controls.hueSpace, (palette.chroma ?? 0) / 100);
  const pk = peakC(baseHue);
  const keyChroma = ((palette.chroma ?? 0) / 100) * pk.c;
  const keyRgb = hctToRgb(baseHue, keyChroma, pk.tone).rgb;
  const key = rgbToOkhsl(keyRgb);
  const lPrime = key.l;
  const { up, down } = primeSteps(lPrime);
  const g = 3 ** ((palette.skew ?? 0) / 100);
  const pc = (palette.primeChroma ?? controls.primeChroma ?? 100) / 100;
  const s = Math.min(1, Math.max(0, key.s * pc));
  const hOk = key.h;
  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;
  return PRIME_STEPS.map((step, i) => {
    const t = (i - 3) / 3;
    const absT = Math.abs(t);
    const w = i < 3 ? absT ** (1 / g) : absT ** g;
    const l = i < 3 ? lPrime + 3 * up * w : lPrime - 3 * down * w;
    const dir = sameDir ? -absT : t;
    const hue = (((hOk + shift * dir) % 360) + 360) % 360;
    const rgb = okhslToRgb(hue, s, l);
    const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    return { step, hex };
  });
}

// ── load the regenerated corpus + the default kit ──────────────────────────────────────────────────
const corpus = []; // { slug, presetName, palette }
for (const slug of CATS) {
  const { PRESETS } = await import(`../../src/ui/categories/${slug}.js`);
  for (const preset of PRESETS) {
    for (const p of preset.palettes) corpus.push({ slug, presetName: preset.name, hueSpace: preset.hueSpace, palette: p });
  }
}
if (corpus.length !== 3780) FAIL("anchor-identity", `corpus loaded ${corpus.length} palettes, want 3780 — a category file moved or a preset count changed`);

const anchored = corpus.filter((c) => typeof c.palette.anchor === "string");

// ── C2's negative control (runs BEFORE the real count, never skipped) ──────────────────────────────
{
  const sample = anchored[0];
  if (!sample) FAIL("anchor-identity", "no anchored palette found to run the negative control against — the corpus lost every anchor");
  else {
    const corruptHex = sample.palette.anchor.slice(0, -1) + (sample.palette.anchor.slice(-1) === "0" ? "1" : "0");
    const corrupted = { ...sample.palette, anchor: corruptHex };
    const ctl = { hueSpace: sample.hueSpace ?? "oklch", primeChroma: 100 };
    const gotHex = primeSwatches(corrupted, ctl)[3].hex;
    if (gotHex === sample.palette.anchor) {
      FAIL("anchor-identity", `negative control DID NOT bite: corrupting ${sample.slug} "${sample.presetName}" ${sample.palette.name}'s anchor by one hex digit still rendered the ORIGINAL anchor — the identity check cannot discriminate`);
    } else if (gotHex !== corruptHex) {
      // it changed, but not to the corrupted hex either — primeSwatches isn't rendering the anchor verbatim at all
      FAIL("anchor-identity", `negative control gave an unexpected reading: ${sample.slug} "${sample.presetName}" ${sample.palette.name} rendered ${gotHex} for corrupted anchor ${corruptHex}`);
    }
    // else: correctly rendered the CORRUPTED hex, proving the gate below would have named this exact
    // preset/palette had the real anchor been wrong — the "prints the preset and palette" procedure.
  }
}

// ── C2 positive count ────────────────────────────────────────────────────────────────────────────
let exact = 0, off = 0;
for (const { slug, presetName, hueSpace, palette: p } of anchored) {
  const ctl = { hueSpace: hueSpace ?? "oklch", primeChroma: 100 };
  const sw = primeSwatches(p, ctl);
  const prime = sw[3];
  if (prime.hex !== p.anchor) {
    off++;
    FAIL("anchor-identity", `${slug} "${presetName}" ${p.name}: primeSwatches(...)[3].hex ${prime.hex} !== anchor ${p.anchor}`);
    continue;
  }
  const derived = derivedAll(stateFor(p))[0];
  const gotOklch = oklchStr({ L: derived.prime.prime.oklch[0], C: derived.prime.prime.oklch[1], H: derived.prime.prime.oklch[2] });
  const wantOklch = oklchStr({ L: rgbToOklchIndep(hexToRgb(p.anchor))[0], C: rgbToOklchIndep(hexToRgb(p.anchor))[1], H: rgbToOklchIndep(hexToRgb(p.anchor))[2] });
  if (gotOklch !== wantOklch) {
    off++;
    FAIL("anchor-identity", `${slug} "${presetName}" ${p.name}: exports.js prime.DEFAULT ${gotOklch} !== independent anchor oklch ${wantOklch}`);
    continue;
  }
  exact++;
}
if (anchored.length !== 3380) FAIL("anchor-identity", `counted ${anchored.length} anchored palettes (want 3380 — 2,028 sampled + 1,352 status per the plan's own measured baseline); report this line, do not force the number`);
console.log(`  ${fails.some((f) => f.startsWith("anchor-identity:")) ? "FAIL" : "pass"}  anchor-identity: ${exact} exact, ${off} off`);

// ── C4 (prime half): non-anchored identity control, negative control first ─────────────────────────
const controlSubjects = [
  ...corpus.map((c) => ({ label: `${c.slug} "${c.presetName}" ${c.palette.name}`, hueSpace: c.hueSpace, palette: c.palette })),
  ...defaultDocument().palettes.map((p) => ({ label: `default kit ${p.name}`, hueSpace: "oklch", palette: p })),
];
if (controlSubjects.length !== 3796) FAIL("prime-identity-control", `${controlSubjects.length} control subjects (want 3796 = 3780 corpus + 16 default kit)`);

{
  // negative control: mutate one subject's chroma between the two derivations and confirm the loop
  // below would have caught it (proves this comparison is not vacuously always-equal).
  const s = controlSubjects[0];
  const ctl = { hueSpace: s.hueSpace, primeChroma: 100 };
  const mutated = { ...s.palette, anchor: undefined, chroma: ((s.palette.chroma ?? 0) + 37) % 100 };
  const real = primeSwatches(mutated, ctl);
  const ref = referenceNonAnchored(s.palette, ctl); // reference uses the UN-mutated chroma on purpose
  if (real[3].hex === ref[3].hex) FAIL("prime-identity-control", "negative control DID NOT bite: mutating chroma by 37 left primeSwatches[3].hex unchanged vs the reference — the comparison cannot discriminate");
}

let ctrlExact = 0, ctrlOff = 0;
for (const { label, hueSpace, palette: p } of controlSubjects) {
  const ctl = { hueSpace, primeChroma: 100 };
  const stripped = { ...p, anchor: undefined };
  const real = primeSwatches(stripped, ctl);
  const ref = referenceNonAnchored(p, ctl);
  let mismatch = null;
  for (let i = 0; i < PRIME_STEPS.length; i++) if (real[i].hex !== ref[i].hex) { mismatch = i; break; }
  if (mismatch != null) {
    ctrlOff++;
    FAIL("prime-identity-control", `${label} step ${PRIME_STEPS[mismatch]}: primeSwatches (anchor stripped) ${real[mismatch].hex} !== the pre-#681 reference ${ref[mismatch].hex}`);
  } else {
    ctrlExact++;
  }
}
console.log(`  ${fails.some((f) => f.startsWith("prime-identity-control:")) ? "FAIL" : "pass"}  prime-identity-control: ${ctrlExact} exact, ${ctrlOff} off (non-anchored primeSwatches unchanged by #681)`);

// ── REPORT ───────────────────────────────────────────────────────────────────────────────
for (const g of ["anchor-identity", "prime-identity-control"]) {
  const f = fails.find((x) => x.startsWith(g + ":"));
  if (!f) continue; // already printed a pass/FAIL summary line above; only surface the FIRST failure detail here
  console.error(`    — ${f.slice(g.length + 2)}`);
}
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: anchor identity clears C2 and C4's prime-half predicates");
process.exit(0);
