#!/usr/bin/env node
// verify.mjs — the tonal-generation validation adapter (CRITIC side; deny-on-write to the advancer).
// Runs rubric.system.tonal-generation's [gate] predicates against ./tonal.js (which imports the
// validated engine). Exit 0=pass / 1=fail; validate.py mints the signal from this status. Deterministic.
//
// Tonal module ESM contract (./tonal.js must export exactly these):
//   effHue(hue, hueSpace?)                          -> CAM16 hue (degrees)
//   toneAt(stop, skew, lift, {curve,lmin,lmax,tension}) -> L* (0-100)
//   paletteStops(palette, controls, stops)          -> [{ stop, tone, chroma, maxc, rgb:[r,g,b], hex, inGamut }]
//   EXPORT_STOPS  (number[])   DEFAULT_CONTROLS ({curve,tension,lmin,lmax,damp,hueSpace})
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { DOMAINS, hydrate } from "../../src/ui/persist.js";
import { defaultDocument, rampChromaOf } from "../../src/ui/model.mjs";
import * as T from "../../src/engine/tonal.js";
import * as E from "../../src/engine/hct.js";
import { rgbToOklchHue, rgbToOkhsl, okhslToRgb } from "../../src/engine/okhsl.js";
import { sampleCorpus, SAMPLE_SEED } from "./lib/corpus-sample.mjs";

const RT = JSON.parse(readFileSync(new URL("../../docs/reference/data/role-table.json", import.meta.url), "utf8"));
const DEFAULTS = RT.defaults;                       // 8 palettes {name,hue,chroma,skew,lift,on}
const STOPS = T.EXPORT_STOPS;
// The gates below validate the CIELAB "even" path (curve/skew/lift/damp/relChroma + L*-fidelity). Pin
// toneMode:"even" and chromaFloor:0 — the perceptual/peak paths and the chroma floor have their own
// gates. Pin hueSpace:"cam16" too: these gates feed the role-table CAM16 hues straight through effHue
// (the OKLCH-native default would re-interpret 267° as an OKLCH hue and move the whole ramp geometry).
// baseIntensity pinned at 100 (AC-006, spec-muted-base-key-spikes): these gates describe the LEGACY ramp, so a
// future default flip must not move them; the intensity groups below run their own values.
const CTL = { ...(T.DEFAULT_CONTROLS || { curve: "logistic", tension: 0, lmin: 5, lmax: 100, damp: 80 }), hueSpace: "cam16", toneMode: "even", chromaFloor: 0, baseIntensity: 100 };
const CURVES = ["linear", "sine", "cubic", "logistic", "exp"];
const SKEWS = [-100, -50, 0, 50, 100];

const fails = [];
const FAIL = (g, m) => { if (!fails.some((f) => f.startsWith(g + ":"))) fails.push(`${g}: ${m}`); };
const angDiff = (a, b) => { let d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const rampOf = (p) => T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift }, CTL, STOPS);

// FULL sweeps every curated document; the default (SAMPLED) canaries one seeded volume per gallery
// category plus brands in full, via the shared picker (#713 U1, test/engine/lib/corpus-sample.mjs).
// `npm test` runs SAMPLED; `npm run gate:corpus-tonal` runs FULL and is the gate of record.
const FULL = process.argv.includes("--full");
// set once, inside the chroma-envelope block below, and read by this file's own mode line at the end.
let CORPUS_DOC_COUNT = 0, CORPUS_PALETTE_COUNT = 0;

// ── hpg-tonal-ingamut: every default palette × stop in gamut, applied chroma <= ceiling ──
for (const p of DEFAULTS) for (const r of rampOf(p)) {
  if (!r.inGamut) FAIL("ingamut", `${p.name} stop ${r.stop} not inGamut`);
  if (r.chroma > r.maxc + 0.5) FAIL("ingamut", `${p.name} stop ${r.stop} chroma ${r.chroma.toFixed(1)} > ceiling ${r.maxc.toFixed(1)}`);
}

// ── hpg-tonal-monotonic: this group is the LIFT-0 SLICE of the id's full claim (SKILL.md:94):
//    weakly non-increasing tone 050->950, 5 curves × skew grid, lift pinned to 0. The full claim
//    (strict descent, no duplicate stops, over the whole curve × skew × lift × tension × band grid,
//    `even` path only) is what the `lift-monotonic` group below (#648, line ~448) actually asserts;
//    that group's `lift 0` slice repeats this same check strictly (`>=` there vs `>` here), so
//    nothing here is load-bearing on its own once that group runs. Kept as a cheap early smoke.
for (const curve of CURVES) for (const skew of SKEWS) {
  const ctl = { ...CTL, curve };
  const tones = STOPS.map((s) => T.toneAt(s, skew, 0, ctl));
  for (let i = 1; i < tones.length; i++)
    if (tones[i] > tones[i - 1] + 1e-6) { FAIL("monotonic", `${curve} skew ${skew}: tone rose ${tones[i - 1].toFixed(2)}->${tones[i].toFixed(2)} at stop ${STOPS[i]}`); break; }
}

// ── hpg-tonal-white-endpoint: lmax=100 => every palette's 050 stop is #FFFFFF ──────────────
for (const p of DEFAULTS) {
  const r0 = rampOf(p).find((r) => r.stop === 50);
  if (!r0 || r0.rgb[0] !== 255 || r0.rgb[1] !== 255 || r0.rgb[2] !== 255) FAIL("white-endpoint", `${p.name} 050 = ${r0 && r0.rgb} (not white)`);
}

// ── hpg-tonal-chroma-target: edge damping + positive floor (no gray ramp passes) ───────────
for (const p of DEFAULTS) {
  if (p.chroma < 50) continue;                       // floor binds on saturated palettes
  const rows = rampOf(p), h = T.effHue(p.hue, CTL.hueSpace);
  const at = (s) => rows.find((r) => r.stop === s);
  const c500 = at(500).chroma, c050 = at(50).chroma, c950 = at(950).chroma;
  if (!(c500 >= c050 - 0.5 && c500 >= c950 - 0.5)) FAIL("chroma-target", `${p.name} edge damping: c500 ${c500.toFixed(1)} not >= ends (${c050.toFixed(1)},${c950.toFixed(1)})`);
  const target = (p.chroma / 100) * E.peakC(h).c, want = Math.min(target, at(500).maxc);
  if (Math.abs(c500 - want) > 1.0) FAIL("chroma-target", `${p.name} c500 ${c500.toFixed(2)} != min(target,cm) ${want.toFixed(2)} (>1)`);
  if (c500 < 0.5 * want) FAIL("chroma-target", `${p.name} c500 ${c500.toFixed(2)} below hard floor ${(0.5 * want).toFixed(2)}`);
}

// ── hpg-tonal-curve-fidelity: emitted-PIXEL L* == toneAt within |dL*|<=1.0 (anti-tautology) ─
for (const p of DEFAULTS) for (const r of rampOf(p)) {
  const want = T.toneAt(r.stop, p.skew, p.lift, CTL);
  if (want >= 100 || want <= 0) continue;            // clamp ends exempt
  const lPix = E.lstarFromRgb(r.rgb);                // measured from the EMITTED color, not r.tone
  if (Math.abs(lPix - want) > 1.0) FAIL("curve-fidelity", `${p.name} stop ${r.stop}: pixel L* ${lPix.toFixed(2)} vs toneAt ${want.toFixed(2)} (>1)`);
}
// ...and across all 5 curves × skew grid on one representative saturated palette
{
  const p = DEFAULTS.find((d) => d.chroma >= 50) || DEFAULTS[0];
  for (const curve of CURVES) for (const skew of SKEWS) {
    const ctl = { ...CTL, curve };
    for (const r of T.paletteStops({ hue: p.hue, chroma: p.chroma, skew, lift: 0 }, ctl, STOPS)) {
      const want = T.toneAt(r.stop, skew, 0, ctl);
      if (want >= 100 || want <= 0) continue;
      if (Math.abs(E.lstarFromRgb(r.rgb) - want) > 1.0) { FAIL("curve-fidelity", `${curve} skew ${skew} stop ${r.stop}: pixel L* off > 1`); break; }
    }
  }
}

// ── hpg-tonal-hue-stability: the FLAT case (hueShift=0, the default palettes) — emitted
//    CAM16 hue == effHue within ±2° for chromatic stops (rotation tested by edge-hue below) ─
for (const p of DEFAULTS) {
  const h = T.effHue(p.hue, CTL.hueSpace);
  for (const r of rampOf(p)) {
    const m = E.cam16FromRgb(r.rgb);                  // measure chroma+hue from the SAME emitted pixel
    if (m.chroma <= 20) continue;                     // hue is only well-defined + roundtrip-robust where the emitted color carries real chroma; near-neutral ramps have no load-bearing hue
    if (angDiff(m.hue, h) > 2.0) { FAIL("hue-stability", `${p.name} stop ${r.stop}: hue ${m.hue.toFixed(2)} vs effHue ${h.toFixed(2)} (>2°, emitted chroma ${m.chroma.toFixed(1)})`); break; }  // 2° = the engine's Δ<=2 roundtrip budget in hue
  }
}

// ── hpg-tonal-edge-hue: per-palette edge hue rotation — opposite torsion toward the two ends,
//    pivoting on stop 500. hueShift=0 reduces to the flat hue-stability case (backward-compat). ─
{
  const p = DEFAULTS.find((d) => d.chroma >= 50) || DEFAULTS[0];
  const base = T.effHue(p.hue, CTL.hueSpace);
  const ramp = (shift) => T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift, hueShift: shift }, CTL, STOPS);
  const atS = (rows, s) => rows.find((r) => r.stop === s);
  const hueAt = (rows, s) => E.cam16FromRgb(atS(rows, s).rgb).hue;
  const signed = (a, b) => (((a - b + 540) % 360) - 180);                 // signed rotation b→a in (−180,180]
  const target = (stop, shift) => (((base + shift * ((stop - 500) / 450)) % 360) + 360) % 360;
  const r50 = ramp(50), r0 = ramp(0), rN = ramp(-50);
  // hue is load-bearing only where the emitted color carries real chroma; check the
  // target where chroma > 30 (above the 8-bit hue-noise floor — the marginal-chroma
  // near-extreme stops have no reliable hue, exactly as hue-stability exempts them).
  const chromatic = (rows) => rows.filter((r) => E.cam16FromRgb(r.rgb).chroma > 30).map((r) => r.stop);

  // (a) DEFAULT FLAT — hueShift=0 emits the base hue at every chromatic stop (backward-compat).
  for (const s of chromatic(r0)) if (angDiff(E.cam16FromRgb(atS(r0, s).rgb).hue, base) > 2.0) FAIL("edge-hue", `default (hueShift 0) not flat at stop ${s}`);
  // (b) TRACKS the per-stop target base+shift·s within the 2° roundtrip budget, both signs.
  for (const [shift, rows] of [[50, r50], [-50, rN]]) for (const s of chromatic(rows)) {
    const d = angDiff(E.cam16FromRgb(atS(rows, s).rgb).hue, target(s, shift));
    if (d > 2.0) FAIL("edge-hue", `shift ${shift} stop ${s}: emitted hue off base+shift·s target by ${d.toFixed(1)}° (>2)`);
  }
  // (c) PIVOT — the centre stop (500, s=0) hue is invariant to hueShift.
  if (angDiff(hueAt(r50, 500), hueAt(r0, 500)) > 2.0) FAIL("edge-hue", "stop 500 hue moved with hueShift (must pivot on the centre)");
  // (d) OPPOSITE TORSION — at +hueShift a light stop rotates one way, the dark stop the other.
  const dL = signed(hueAt(r50, 250), base), dD = signed(hueAt(r50, 750), base);
  if (!(dL < -2 && dD > 2)) FAIL("edge-hue", `+hueShift didn't torsion light(−)/dark(+): light ${dL.toFixed(1)}° dark ${dD.toFixed(1)}°`);
  // (e) MIRROR — ramp(+H)[dark stop] hue == ramp(−H)[light mirror stop] hue (symmetric per-side).
  if (angDiff(hueAt(r50, 750), hueAt(rN, 250)) > 2.0) FAIL("edge-hue", "hueShift not mirror-symmetric (+H dark vs −H light)");
  // (f) SAME-DIRECTION mode (hueSameDir) — both ends bend the SAME way, matching the LIGHT
  //     end: hueShift·(−|s|), target base−shift·|s|. At +shift both ends rotate the SAME sign
  //     (the light end's), e.g. a light+20/dark−20 opposite becomes light+20/dark+20.
  const rampSame = (shift) => T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift, hueShift: shift, hueSameDir: true }, CTL, STOPS);
  const targetSame = (stop, shift) => (((base - shift * Math.abs((stop - 500) / 450)) % 360) + 360) % 360;
  const rs = rampSame(50);
  const sL = signed(E.cam16FromRgb(atS(rs, 250).rgb).hue, base), sD = signed(E.cam16FromRgb(atS(rs, 750).rgb).hue, base);
  if (!(Math.sign(sL) === Math.sign(sD) && Math.abs(sL) > 2 && Math.abs(sD) > 2)) FAIL("edge-hue", `same-direction didn't bend both ends the SAME way: light ${sL.toFixed(1)}° dark ${sD.toFixed(1)}° (must match sign)`);
  for (const s of chromatic(rs)) {
    const d = angDiff(E.cam16FromRgb(atS(rs, s).rgb).hue, targetSame(s, 50));
    if (d > 2.0) FAIL("edge-hue", `same-direction stop ${s}: emitted hue off base−shift·|s| target by ${d.toFixed(1)}° (>2)`);
  }
}

// ── hpg-tonal-damping-curve: the differential damping multiplier m(stop). Property-based
//    (not a re-derivation of the new formula), so it gates the BEHAVIOUR, not the code. ─────
{
  const SAT = DEFAULTS.filter((d) => d.chroma >= 50);        // every saturated hue — coverage
  const pSat = SAT[0] || DEFAULTS[0];
  const ramp = (pal, extra) => T.paletteStops({ hue: pal.hue, chroma: pal.chroma, skew: pal.skew, lift: pal.lift }, { ...CTL, ...extra }, STOPS);
  const at = (rows, s) => rows.find((r) => r.stop === s);
  const tgtOf = (p) => (p.chroma / 100) * E.peakC(T.effHue(p.hue, CTL.hueSpace)).c;

  // (a) DEFAULTS REPRODUCE LEGACY EXACTLY — vs the INDEPENDENT legacy formula
  //     min(target·(1−damp·u^1.5), ceiling), over EVERY saturated hue, every stop, |dC|<=1e-6. `u` is
  //     read at the LIFTED stop, relative to the anchor's OWN lifted reading (#668/#681 U3 R2,
  //     chromaEnvelope)  -  every SAT default, lifted or not, reduces to this same form: liftStop(500, 0)
  //     === 500 at lift 0, so the 9 lift-0 defaults collapse to the pre-#668 raw-stop legacy formula
  //     exactly, and the 3 lifted ones (Success, Warning, Danger) read both sides of the subtraction
  //     through the SAME liftStop, which is what makes env(anchor)=1 exact at every lift, not only 0.
  //     #681 U3 pass 3: for a GENERATED palette (dampAmp 0, true of every default here), the shipped
  //     engine additionally caps every stop at the anchor's OWN legacy value (the lift x hue-cusp fix  - 
  //     Q7 measured stops whose local gamut ceiling exceeds the anchor's rendering MORE absolute chroma
  //     than the anchor despite an equal-or-smaller envelope multiplier). `anchorWant` re-derives that
  //     cap independently (evenChroma's own 3-line formula, at uLeg=0 by construction) rather than
  //     calling the engine's private `evenChroma`, keeping this an independent check of the BEHAVIOUR.
  //     #681 U3 pass 7: CTL's toneMode is "even", and the even path now reads a MAPPED damp/dampCurve
  //     (T.EVEN_DAMP_FACTOR compresses damp's headroom and scales dampCurve by the same factor  -  see
  //     chromaEnvelope's own comment)  -  dampCurve alone could not close the even median/p90 targets
  //     (u3fix/retune-even-only.mjs swept dampCurve x0.001..x1 at fixed damp and stop 100/900 never
  //     moved; T.EVEN_DAMP_FACTOR is the ratified, exported constant this independent re-derivation
  //     reads, not a re-derivation of chromaEnvelope's own code path).
  const evenDamp = 100 - (100 - CTL.damp) * T.EVEN_DAMP_FACTOR;
  const evenDampCurve = (CTL.dampCurve ?? 1.5) * T.EVEN_DAMP_FACTOR;
  for (const p of SAT) {
    const tgt = tgtOf(p);
    const maxc500 = at(ramp(p, {}), 500).maxc;
    const floor500 = Math.min((CTL.chromaFloor / 100) * maxc500, tgt);
    const anchorWant = Math.min(maxc500, Math.max(tgt, floor500));
    for (const r of ramp(p, {})) {
      // Capped at 1, as chromaEnvelope caps `sd` (#681 U10, pre-land F3): under a lift the raw lifted
      // distance can pass 450, and the legacy form never read a position past the ramp end.
      const uLeg = Math.min(1, Math.abs(T.liftStop(r.stop, p.lift) - T.liftStop(500, p.lift)) / 450);
      const legacyWant = Math.min(tgt * Math.max(0, 1 - (evenDamp / 100) * uLeg ** evenDampCurve), r.maxc);
      const want = Math.min(legacyWant, anchorWant);
      if (Math.abs(r.chroma - want) > 1e-6) FAIL("damping-curve", `${p.name} default != legacy at stop ${r.stop}: ${r.chroma.toFixed(4)} vs ${want.toFixed(4)}`);
    }
  }
  // (b)+(g) GAMUT-SAFE AND FLOORED across EVERY saturated hue × extreme corners (amp=100, and
  //     damp=100 with bias=±100 → sideW {0,2} drives the bracket negative; max(0,·) must hold).
  const CORNERS = [{ dampAmp: 100 }, { dampAmp: 100, dampCurve: 0.5 }, { dampAmp: 100, dampBias: 100 }, { dampAmp: 100, dampBias: -100, dampCurve: 4 }, { damp: 100, dampBias: 100, dampCurve: 0.5 }, { damp: 100, dampBias: -100, dampCurve: 0.5 }];
  for (const p of SAT) for (const ex of CORNERS) for (const r of ramp(p, ex)) {
    if (!r.inGamut) FAIL("damping-curve", `${p.name} ${JSON.stringify(ex)} stop ${r.stop} out of gamut`);
    if (r.chroma > r.maxc + 0.5) FAIL("damping-curve", `${p.name} ${JSON.stringify(ex)} stop ${r.stop} chroma ${r.chroma.toFixed(1)} > ceiling ${r.maxc.toFixed(1)}`);
    if (r.chroma < -1e-9) FAIL("damping-curve", `${p.name} ${JSON.stringify(ex)} stop ${r.stop} NEGATIVE chroma — max(0,·) floor missing`);
  }
  // (c) AMPLIFY PUSHES THE MID TO THE CEILING — at dampAmp=100 the mid equals min(target·2,
  //     ceiling) within 0.5, AND the ceiling is genuinely the binding term (not target·2).
  const tgtS = tgtOf(pSat), maxc500 = at(ramp(pSat, {}), 500).maxc, want100 = Math.min(tgtS * 2, maxc500);
  if (want100 !== maxc500) FAIL("damping-curve", `(c) needs a hue where target·2 (${(tgtS * 2).toFixed(1)}) exceeds the ceiling (${maxc500.toFixed(1)}); ${pSat.name} does not bind`);
  if (Math.abs(at(ramp(pSat, { dampAmp: 100 }), 500).chroma - want100) > 0.5) FAIL("damping-curve", `amplify=100 mid != min(target·2, ceiling) ${want100.toFixed(2)}`);
  if (!(at(ramp(pSat, { dampAmp: 80 }), 500).chroma >= at(ramp(pSat, {}), 500).chroma - 1e-9)) FAIL("damping-curve", `amplify did not raise mid chroma`);

  // (d)/(e) use a LOW-chroma probe so target·m stays below the ceiling and the multiplier's
  // symmetry/shape is OBSERVABLE in the applied chroma (the gamut clamp would mask it). r.chroma
  // is the REQUESTED chroma (= target·m when unclamped), so the comparisons are exact.
  const probe = { hue: pSat.hue, chroma: 16, skew: 0, lift: 0 }, tgtP = tgtOf(probe);
  const free = (rows, s) => at(rows, s).chroma < at(rows, s).maxc - 1.0;   // not ceiling-bound here

  // (d) BIAS = a MIRROR-SYMMETRIC PER-SIDE WEIGHT THAT VANISHES AT THE MID (defeats a directional
  //     sign-branch): chroma(500) is bias-invariant, and ramp(+b)[S] == ramp(−b)[1000−S].
  const b0 = ramp(probe, {}), bP = ramp(probe, { dampBias: 80 }), bN = ramp(probe, { dampBias: -80 });
  for (const rows of [bP, bN]) if (Math.abs(at(rows, 500).chroma - at(b0, 500).chroma) > 0.05) FAIL("damping-curve", `bias changed the MID (stop 500) chroma — it must vanish at the centre`);
  let mirrorTested = 0;
  for (const [S, M] of [[650, 350], [750, 250], [600, 400]]) {
    if (!free(bP, S) || !free(bN, M)) continue;
    mirrorTested++;
    if (Math.abs(at(bP, S).chroma - at(bN, M).chroma) > 0.05) FAIL("damping-curve", `bias not mirror-symmetric: +80@${S} ${at(bP, S).chroma.toFixed(2)} vs −80@${M} ${at(bN, M).chroma.toFixed(2)} (a sign-branch, not a per-side weight)`);
  }
  if (mirrorTested === 0) FAIL("damping-curve", `(d) probe was ceiling-bound at every mirror pair — lower the probe chroma`);
  // (e) FALLOFF REDISTRIBUTES (defeats a global γ-scalar): γ leaves the MID fixed, and a SHARP
  //     curve keeps MORE chroma at a quarter stop than a BROAD one (damping confined to the ends).
  const eB = ramp(probe, { dampCurve: 0.7 }), eS = ramp(probe, { dampCurve: 3.5 });
  if (Math.abs(at(eS, 500).chroma - at(eB, 500).chroma) > 0.05) FAIL("damping-curve", `falloff changed the MID (stop 500) chroma — γ must leave the centre fixed`);
  let redistTested = 0;
  for (const q of [700, 750, 300, 250]) {
    if (!free(eS, q) || !free(eB, q)) continue;
    redistTested++;
    if (!(at(eS, q).chroma > at(eB, q).chroma + 0.5)) FAIL("damping-curve", `sharp falloff didn't keep more chroma than broad at stop ${q} (no redistribution — a global scalar)`);
  }
  if (redistTested === 0) FAIL("damping-curve", `(e) probe was ceiling-bound at every quarter stop — lower the probe chroma`);
  void tgtP;

  // (f) TONE IS DAMPING-INVARIANT — damping touches chroma only, never tone (monotonicity safety).
  const tone0 = ramp(pSat, {}).map((r) => r.tone);
  for (const r of ramp(pSat, { dampCurve: 3, dampAmp: 90, dampBias: -70 }))
    if (Math.abs(r.tone - tone0[STOPS.indexOf(r.stop)]) > 1e-9) FAIL("damping-curve", `damping perturbed tone at stop ${r.stop}`);
}

// ── hpg-tonal-rel-chroma: the relChroma "gamut" basis — % of EACH stop's gamut ceiling, so every
//    hue fills the same fraction of its gamut (harmonized regardless of hue). In-gamut; off == default. ─
{
  const withRel = (p, on) => T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift }, { ...CTL, relChroma: on }, STOPS);
  // (a) IN-GAMUT — relative mode never exceeds the per-stop ceiling, for every default palette.
  for (const p of DEFAULTS) for (const r of withRel(p, true)) {
    if (!r.inGamut || r.chroma > r.maxc + 0.5) FAIL("rel-chroma", `${p.name} (relChroma) stop ${r.stop} out of gamut / over ceiling`);
  }
  // (b) HARMONIZED ACROSS HUE — at the same chroma%, every hue uses the SAME fraction of its own
  //     per-stop ceiling (chroma/maxc = min(frac·m, 1), hue-independent). Blue 264° vs yellow 90°.
  //     #681 U3 pass 3: EXCEPT where the anchor cap fires (dampAmp 0: no stop may emit more chroma than
  //     the anchor's OWN chroma)  -  that bound is keyed on EACH hue's own maxc500, a different absolute
  //     ceiling per hue even at the identical chroma%, so it can bind at different stops for the two
  //     probe hues and locally break the cross-hue match on purpose (C6's per-palette anchor bound is
  //     the plan-ruled priority here, not this harmonization property). Skip those stops rather than
  //     mask the divergence; chromaFloor is 0 in CTL so the un-capped fraction is exactly 0.70 either way.
  const A = T.paletteStops({ hue: 264, chroma: 70, skew: 0, lift: 0 }, { ...CTL, relChroma: true }, STOPS);
  const B = T.paletteStops({ hue: 90, chroma: 70, skew: 0, lift: 0 }, { ...CTL, relChroma: true }, STOPS);
  const maxc500A = A.find((r) => r.stop === 500).maxc, maxc500B = B.find((r) => r.stop === 500).maxc;
  let compared = 0;
  for (let i = 0; i < STOPS.length; i++) {
    if (A[i].maxc < 1 || B[i].maxc < 1) continue;                  // skip near-neutral tone extremes
    const env = T.chromaEnvelope(STOPS[i], 500, 0, CTL);
    const cappedA = 0.70 * env * A[i].maxc > 0.70 * maxc500A + 1e-9;
    const cappedB = 0.70 * env * B[i].maxc > 0.70 * maxc500B + 1e-9;
    if (cappedA || cappedB) continue;                              // anchor cap fired for >=1 hue here
    compared++;
    const fa = A[i].chroma / A[i].maxc, fb = B[i].chroma / B[i].maxc;
    if (Math.abs(fa - fb) > 0.02) FAIL("rel-chroma", `gamut fraction differs by hue at stop ${STOPS[i]}: 264°=${fa.toFixed(3)} vs 90°=${fb.toFixed(3)} (not harmonized)`);
  }
  if (compared === 0) FAIL("rel-chroma", `(b) every stop was anchor-capped for at least one hue  -  pick different probe hues`);
  // (c) OFF == DEFAULT (no regression) and (d) ON actually changes the output (not a no-op).
  const p = DEFAULTS.find((d) => d.chroma >= 50) || DEFAULTS[0];
  const def = rampOf(p), off = withRel(p, false), on = withRel(p, true);
  let changed = false;
  for (let i = 0; i < def.length; i++) {
    if (Math.abs(off[i].chroma - def[i].chroma) > 1e-9) FAIL("rel-chroma", `relChroma:false != the default basis at stop ${def[i].stop}`);
    if (Math.abs(on[i].chroma - def[i].chroma) > 0.5) changed = true;
  }
  if (!changed) FAIL("rel-chroma", `relChroma:true did not change ${p.name}'s output (no-op toggle)`);
}

// ── hpg-tonal-okhsl-modes: the perceptual & peak distributions (OKHSL path) — in-gamut, every stop
//    DISTINCT (no near-white dead zone), tone monotone, white/black ends, and stop-consistency between
//    the 19-stop display ramp and the 25-stop export ramp (the stop-vs-index trap). ─────────────────
for (const mode of ["perceptual", "peak"]) {
  const c = { ...CTL, toneMode: mode };
  const probes = [...DEFAULTS, { name: "muted", hue: 75, chroma: 18, skew: 0, lift: 0 }]; // muted = the dead-zone case
  for (const p of probes) {
    const args = { hue: p.hue, chroma: p.chroma, skew: p.skew || 0, lift: p.lift || 0 };
    const rows = T.paletteStops(args, c, STOPS);
    if (!rows.every((r) => r.inGamut && r.rgb.every((v) => Number.isInteger(v) && v >= 0 && v <= 255)))
      FAIL("okhsl-modes", `${mode} ${p.name}: out-of-gamut / non-byte rgb`);
    const distinct = new Set(rows.map((r) => r.hex)).size;
    if (distinct < STOPS.length) FAIL("okhsl-modes", `${mode} ${p.name}: ${distinct}/${STOPS.length} distinct stops (dead zone)`);
    for (let k = 1; k < rows.length; k++) if (rows[k].tone > rows[k - 1].tone + 0.5) FAIL("okhsl-modes", `${mode} ${p.name}: tone rose at stop ${rows[k].stop}`);
    if (rows.find((r) => r.stop === 50).hex !== "#FFFFFF") FAIL("okhsl-modes", `${mode} ${p.name}: 050 not white at lmax=100`);
    const r25 = T.paletteStops(args, c, T.EXPORT_STOPS);
    if (rows.find((r) => r.stop === 500).hex !== r25.find((r) => r.stop === 500).hex)
      FAIL("okhsl-modes", `${mode} ${p.name}: stop 500 differs between display(19) and export(25) ramps`);
  }
}
// peak mode centers the cusp at 500: stop-500 chroma exceeds the light (100) and dark (900) ends.
{
  const p = DEFAULTS.find((d) => d.chroma >= 80) || DEFAULTS[0];
  const rows = T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: 0, lift: 0 }, { ...CTL, toneMode: "peak" }, STOPS);
  const at = (s) => rows.find((r) => r.stop === s).chroma;
  if (!(at(500) > at(100) + 2 && at(500) > at(900) + 2)) FAIL("okhsl-modes", `peak: chroma not centered at 500 (100:${at(100).toFixed(0)} 500:${at(500).toFixed(0)} 900:${at(900).toFixed(0)})`);
}

// ── hpg-tonal-cusp-pull: a PER-PALETTE cuspPull nudges that palette's richest (max-chroma) stop toward
//    500 in perceptual mode, overriding the global vibrancy. Yellow's chroma cusp is at high L*, so with
//    no pull the richest stop sits light; full pull lands it on 500; partial pull moves it between. ──
{
  const Y = { hue: 75, chroma: 100, skew: 0, lift: 0 };       // yellow — cusp at high lightness
  const pc = { ...CTL, toneMode: "perceptual", vibrancy: 0 }; // global vibrancy OFF, to isolate cuspPull
  const richest = (cuspPull) =>
    T.paletteStops({ ...Y, cuspPull }, pc, STOPS).reduce((a, r) => (r.chroma > a.chroma ? r : a)).stop;
  const at0 = richest(undefined); // absent → inherits global vibrancy 0 → richest sits light
  const at50 = richest(50);       // partial pull
  const at100 = richest(100);     // full pull → richest at 500
  if (!(at0 < 500)) FAIL("cusp-pull", `cuspPull 0: yellow richest stop ${at0}, expected light (<500)`);
  if (at100 !== 500) FAIL("cusp-pull", `cuspPull 100: yellow richest stop ${at100}, expected 500`);
  if (!(at50 > at0 && at50 <= 500)) FAIL("cusp-pull", `cuspPull 50: richest stop ${at50}, expected between ${at0} and 500`);
}

// ── hpg-tonal-chroma-floor: the even-mode chroma floor lifts the damping-starved ends of LOW-chroma
//    ramps (kills the near-white dead zone) WITHOUT muting saturated ramps or tinting true neutrals. ──
{
  const ramp = (hue, chroma, floor) => T.paletteStops({ hue, chroma, skew: 0, lift: 0 }, { ...CTL, chromaFloor: floor }, STOPS);
  // (a) MUTED: a light stop carries MORE chroma with the floor than without (the dead zone is lifted).
  const c0 = ramp(165, 18, 0).find((r) => r.stop === 150).chroma;
  const cF = ramp(165, 18, 40).find((r) => r.stop === 150).chroma;
  if (!(cF > c0 + 2)) FAIL("chroma-floor", `muted light stop 150: floor didn't lift chroma (0%:${c0.toFixed(1)} 40%:${cF.toFixed(1)})`);
  // (b) NEVER over-saturates: no floored stop exceeds the intended mid (stop 500, where env≈1 ≈ target).
  const muted = ramp(165, 18, 40);
  const cMid = muted.find((r) => r.stop === 500).chroma;
  for (const r of muted) if (r.chroma > cMid + 1) FAIL("chroma-floor", `muted stop ${r.stop} chroma ${r.chroma.toFixed(1)} exceeds intended mid ${cMid.toFixed(1)}`);
  // (c) TRUE NEUTRAL (chroma 0) is untouched — the floor caps at intended(=0), so it cannot tint.
  const n0 = ramp(267, 0, 0), nF = ramp(267, 0, 40);
  for (let i = 0; i < n0.length; i++) if (n0[i].hex !== nF[i].hex) FAIL("chroma-floor", `neutral stop ${n0[i].stop}: floor tinted a chroma-0 palette (${n0[i].hex}->${nF[i].hex})`);
  // (d) SATURATED is untouched — a high-chroma ramp already clamps to the gamut, so the floor never binds.
  //     #681 U3 pass 7 CARVE-OUT: this holds everywhere except the 11 EXPORT_STOPS nearest the extreme
  //     ends (100/125/150/175/200/250/300 and 875/900/925/950), named and bounded, verified both
  //     directions below  -  even a chroma-100 probe at this hue still lands there (checked by hand,
  //     u3fix scratch), so it is not a probe artifact. The even path's retuned damping (chromaEnvelope,
  //     EVEN_DAMP_FACTOR) now starves those stops enough that NO input chroma keeps them gamut-clamped,
  //     so the floor legitimately starts to matter there too  -  an expansion of what the floor rescues,
  //     not a mistuned probe.
  const SAT_FLOOR_EXCEPT = new Set([100, 125, 150, 175, 200, 250, 300, 875, 900, 925, 950]);
  const s0 = ramp(145, 99, 0), sF = ramp(145, 99, 40);
  let satExceptSeen = new Set();
  for (let i = 0; i < s0.length; i++) {
    if (s0[i].hex !== sF[i].hex) {
      if (SAT_FLOOR_EXCEPT.has(s0[i].stop)) { satExceptSeen.add(s0[i].stop); continue; }
      FAIL("chroma-floor", `saturated stop ${s0[i].stop}: floor changed a vibrant ramp (${s0[i].hex}->${sF[i].hex})`);
    }
  }
  if (satExceptSeen.size !== SAT_FLOOR_EXCEPT.size) FAIL("chroma-floor", `saturated exception list stale: named ${[...SAT_FLOOR_EXCEPT].join(",")}, actually diverging ${[...satExceptSeen].join(",")}`);
}

// ── hpg-tonal-vibrancy (perceptual `vibrancy` pulls the center toward the hue's cusp) ───────
{
  // perceptual is now the default distribution mode.
  if ((T.DEFAULT_CONTROLS || {}).toneMode !== "perceptual") FAIL("vibrancy", `default toneMode is ${(T.DEFAULT_CONTROLS || {}).toneMode}, want perceptual`);
  const ps = (vib) => T.paletteStops({ hue: 95, chroma: 90, skew: 0, lift: 0 }, { ...T.DEFAULT_CONTROLS, toneMode: "perceptual", vibrancy: vib }, STOPS).find((s) => s.stop === 500);
  const lo = ps(0), hi = ps(100);
  // a YELLOW hue's cusp is at high L*; vibrancy 100 must lift the center toward it (lighter + more chromatic)
  if (!(hi.tone > lo.tone + 10)) FAIL("vibrancy", `vibrancy did not lift the yellow center L* (${lo.tone.toFixed(0)} -> ${hi.tone.toFixed(0)})`);
  if (!(hi.chroma > lo.chroma)) FAIL("vibrancy", `vibrancy did not raise the yellow center chroma (${lo.chroma.toFixed(1)} -> ${hi.chroma.toFixed(1)})`);
  // vibrancy 100 ≈ the "peak" mode endpoint
  const pk = T.paletteStops({ hue: 95, chroma: 90, skew: 0, lift: 0 }, { ...T.DEFAULT_CONTROLS, toneMode: "peak" }, STOPS).find((s) => s.stop === 500);
  if (Math.abs(pk.tone - hi.tone) > 2) FAIL("vibrancy", `vibrancy 100 (${hi.tone.toFixed(0)}) != peak mode center (${pk.tone.toFixed(0)})`);
}

// ── oklch-hue-anchor — with hueSpace:"oklch", the KEY stop (500) lands on the SET OKLCH hue ──────────
// Both ramps are EXPORTED in OKLCH but AUTHORED in another space (perceptual → OKHSL, even → HCT/CAM16),
// and each disagrees with OKLCH on "constant hue" by a chroma/lightness-dependent amount (Abney), worst in
// the blues (~6° perceptual, ~9° even). Each path now SOLVES its own render space directly at stop 500's
// OWN chroma+lightness — perceptual via solveOkhslHue, even via solveCam16Hue — so the key stop reads back
// at the set OKLCH hue for ANY damping. (hueAnchorFrac still seeds the even path's gamut basis + the cusp
// geometry, so its deterministic math is locked below too.)
{
  // (a) hueAnchorFrac: nominal chroma, capped at 1, dampAmp-INDEPENDENT (#681 U3, Q7: chromaEnvelope is
  // exactly 1 at the anchor for any dampAmp at lift 0, so the anchor's own rendered chroma no longer
  // scales with dampAmp  -  a deterministic lock (still seeds the even/CAM16 ramp's gamut basis + cusp seed).
  const near = (a, b) => Math.abs(a - b) < 1e-3;
  if (!near(T.hueAnchorFrac({ chroma: 76 }, { dampAmp: 66 }), 0.76)) FAIL("oklch-hue-anchor", `hueAnchorFrac(76%,amp66)=${T.hueAnchorFrac({ chroma: 76 }, { dampAmp: 66 })}, want 0.76`);
  if (!near(T.hueAnchorFrac({ chroma: 25 }, { dampAmp: 66 }), 0.25)) FAIL("oklch-hue-anchor", `hueAnchorFrac(25%,amp66)=${T.hueAnchorFrac({ chroma: 25 }, { dampAmp: 66 })}, want 0.25`);
  if (!near(T.hueAnchorFrac({ chroma: 40 }, { dampAmp: 0 }), 0.40)) FAIL("oklch-hue-anchor", `hueAnchorFrac(40%,amp0)=${T.hueAnchorFrac({ chroma: 40 }, { dampAmp: 0 })}, want 0.40`);
  if (!near(T.hueAnchorFrac({ chroma: 150 }, { dampAmp: 0 }), 1.0)) FAIL("oklch-hue-anchor", `hueAnchorFrac(150%,amp0)=${T.hueAnchorFrac({ chroma: 150 }, { dampAmp: 0 })}, want 1.0 (capped)`);
  // (b) end-to-end: stop 500 exports within 1° of the SET OKLCH hue across the wheel — including the BLUES
  // (the old proxy's worst case: ~6° perceptual, ~9° even) — for BOTH render paths (OKHSL-authored
  // "perceptual" AND HCT-authored "even", each solving its OWN render space via solveOkhslHue /
  // solveCam16Hue), at BOTH the un-amplified default (dampAmp:0) and an amplified center (dampAmp:66). A
  // revert to a peak-anchored proxy on either path would push the blues past 1° and trip this.
  for (const toneMode of ["perceptual", "even"]) {
    for (const dampAmp of [0, 66]) {
      const oc = { ...(T.DEFAULT_CONTROLS || {}), hueSpace: "oklch", toneMode, dampAmp, damp: 96, dampCurve: 1.2 };
      for (const [hue, chroma] of [[300, 76], [235, 80], [270, 70], [290, 70], [250, 70], [70, 100], [27, 55], [145, 55], [190, 60], [30, 60]]) {
        const s500 = T.paletteStops({ hue, chroma, skew: 0, lift: 0 }, oc, T.EXPORT_STOPS).find((s) => s.stop === 500);
        const err = angDiff(rgbToOklchHue(s500.rgb), hue);
        if (err > 1.0) FAIL("oklch-hue-anchor", `${toneMode} hue ${hue}/chroma ${chroma} (dampAmp ${dampAmp}): stop 500 exports OKLCH hue off by ${err.toFixed(2)}° (>1° — anchor drift)`);
      }
    }
  }
  // (c) AC-005 (0.3.0): the anchor holds specifically at chroma in {20, 45, 100} — the values a group's
  // resolved rampChroma (Material 30-ish, Brand/System/Data 100) actually feeds `paletteStops` as
  // `palette.chroma` now that there is no separate baseIntensity multiplier (REQ-002/004/005).
  for (const toneMode of ["perceptual", "even"]) {
    const oc = { ...(T.DEFAULT_CONTROLS || {}), hueSpace: "oklch", toneMode, damp: 96, dampCurve: 1.2 };
    for (const chroma of [20, 45, 100]) {
      const s500 = T.paletteStops({ hue: 267, chroma, skew: 0, lift: 0 }, oc, T.EXPORT_STOPS).find((s) => s.stop === 500);
      const err = angDiff(rgbToOklchHue(s500.rgb), 267);
      if (err > 1.0) FAIL("oklch-hue-anchor", `${toneMode} chroma ${chroma} (AC-005): stop 500 exports OKLCH hue off by ${err.toFixed(2)}° (>1° — anchor drift)`);
    }
  }
}

// ── hue-solver-best (#657): solveOkhslHue returns its BEST iterate, not its last ─────────────
// `okhslToRgb` quantises to integer RGB, so the read-back f(h) the solver inverts is an 8-BIT
// STAIRCASE — piecewise constant in h. The 1e-3 criterion is therefore unreachable on nearly every
// cell (0 of the 560 grid cells below converge), the loop exhausts, and the pre-#657 code returned
// the hue the LAST update produced — an iterate it never read back. On a flat step that update is a
// fixed drift, so that hue can be 100°+ off. These gates pin the best-iterate contract. The old
// update rule is RE-DERIVED here, never imported, so the gate cannot pass by agreeing with the
// engine's own arithmetic.
{
  const wrap = (d) => (((d % 360) + 540) % 360) - 180;
  const readErr = (h, s, l, target) => Math.abs(wrap(rgbToOklchHue(okhslToRgb(h, s, l)) - target));
  // the pre-#657 loop, independently re-derived: `last` is what it RETURNED, `seen` is every hue it
  // ever produced (the 17th included — the one it returned blind on exhaustion).
  const oldRule = (target, s, l) => {
    let h = target; const seen = [];
    for (let i = 0; i < 16; i++) {
      seen.push(h);
      const err = wrap(rgbToOklchHue(okhslToRgb(h, s, l)) - target);
      if (Math.abs(err) < 1e-3) return { last: h, seen, converged: true };
      h = (((h - err) % 360) + 360) % 360;
    }
    seen.push(h);
    return { last: h, seen, converged: false };
  };

  // (i) the staircase cases: cells where the old loop exhausts. The solved hue's read-back error must
  // be <= the minimum over every candidate the loop produced (min computed HERE, from the re-derived
  // rule) — and the old last-iterate must be strictly worse, or the case would not discriminate.
  // Three of the four carry a PALETTE claim, and a claim in a comment is worth nothing here, so each
  // one is PROVEN below rather than asserted in prose: `owner` names the default palette and tone
  // mode the cell is supposed to be the stop-500 cell OF, and the loop checks two things against the
  // engine — that the target hue IS that palette's hue in defaultDocument(), and that rendering the
  // solved hue at this (s, l) reproduces, byte for byte, the pixel paletteStops actually emits at
  // stop 500 for that palette. A change that moves the stop-500 cell (as #647 did when it wired skew
  // and lift into this path) therefore reds this gate by name instead of silently leaving a comment
  // describing a cell that no longer exists. The hues are the DOCUMENT's OKLCH hues, which is what
  // the solver takes — not role-table.json's CAM16 numbers, which differ (Neutral 268 vs 267,
  // Data 7 195 vs 197): `defaultDocument()` maps one to the other through camHueToOklch.
  const STAIRCASE = [
    // target, s, l, owner (null = synthetic). The (s, l) are FULL PRECISION on purpose: rounding
    // 0.4556174494320429 to 0.456 lands on a different tread of the staircase and quietly changes
    // which cell is under test (0.6262 vs 0.4684 for Neutral), which is exactly the failure mode
    // this group exists to catch.
    [275, 0.05, 0.98, null],                                        // pale near-white: every h renders
                                                                    // the SAME pixel, so the update
                                                                    // runs away instead of oscillating
    // Repinned for #681 U3 (chromaEnvelope + keyS saturation basis moved every default's own s500,
    // except Data 7's l500  -  l500 never depended on saturation, so it lands on its pre-U3 value exactly).
    // Re-pinned again, Q5 (2026-09-19, addendum 1, standing rule at
    // .sdlc/questions/standing-rulings-2026-09-20.md): Neutral/perceptual's stop-500 (s, l) moved AGAIN
    // on this integration head (0.2362053680324055 -> 0.22920645126228487, l500 unchanged - keyS moved,
    // l500 never depends on saturation, same shape as the U3 note above) and the new (s, l) no longer
    // discriminates: the old buggy rule's last iterate and solveOkhslHue's best iterate now COINCIDE at
    // this exact cell (both read hue 268 back, error 0.4287 deg), so Neutral/perceptual stopped being a
    // useful "old rule is worse" witness, not because the solver regressed but because this particular
    // staircase tread happens to land on the same value both ways now. Verified directly (derivation
    // reproducible: instrument `okhslStops`'s own `hOk = solveOkhslHue(...)` call to read back s500/
    // l500, then run both rules against it - scratchpad probe, U4 pass 2). A full scan of the default
    // kit's own 16 palettes x {perceptual, peak} for a REAL, currently-discriminating stop-500 staircase
    // case (same method) found Data 2/peak: oldErr 0.2603 deg vs solved 0.0269 deg, a wide, robust
    // margin (Info/perceptual and Data 8/perceptual also still discriminate post-fix but by under 0.011
    // deg, too thin to trust against future float drift). Data 2/peak replaces Neutral/perceptual below;
    // Data 7/perceptual and Primary/peak are UNCHANGED (re-verified, still discriminate, still their
    // original pinned (s, l) exactly - only Neutral moved).
    [326, 1, 0.5782463229408346, ["Data 2", "peak"]],                           // wide margin, chroma-100 default
    [195, 0.9999999007688885, 0.5399970062712544, ["Data 7", "perceptual"]],    // saturated, the default tone mode
    [259, 0.9999999532281996, 0.4556174494320429, ["Primary", "peak"]],
  ];
  {
    const doc = defaultDocument();
    for (const [target, s, l, owner] of STAIRCASE) {
      if (!owner) continue;
      const [name, toneMode] = owner;
      const p = doc.palettes.find((x) => x.name === name);
      if (!p) { FAIL("hue-solver-best", `(i) cell ${target}/${s}/${l} claims default palette "${name}", which defaultDocument() does not have`); continue; }
      if (p.hue !== target) FAIL("hue-solver-best", `(i) cell claims "${name}" but its hue is ${p.hue}, not ${target} — relabel the cell or repin it`);
      const pal = { hue: p.hue, chroma: rampChromaOf(p, doc), skew: p.skew, lift: p.lift, cuspPull: p.cuspPull };
      const emitted = T.paletteStops(pal, { ...(T.DEFAULT_CONTROLS || {}), toneMode }, T.EXPORT_STOPS).find((r) => r.stop === 500);
      const here = okhslToRgb(T.solveOkhslHue(target, s, l), s, l);
      if (here.join() !== emitted.rgb.join())
        FAIL("hue-solver-best", `(i) cell ${target}/${s}/${l} claims "${name}" @ ${toneMode} stop 500, but renders ${here.join()} where the ramp emits ${emitted.rgb.join()} — the stop-500 cell moved, repin (s, l)`);
    }
  }
  for (const [target, s, l] of STAIRCASE) {
    const old = oldRule(target, s, l);
    if (old.converged) FAIL("hue-solver-best", `(i) cell ${target}/${s}/${l} CONVERGES — no longer a staircase case, the gate is vacuous`);
    const floor = Math.min(...old.seen.map((h) => readErr(h, s, l, target)));
    const got = T.solveOkhslHue(target, s, l);
    const gotErr = readErr(got, s, l, target);
    if (gotErr > floor + 1e-12) FAIL("hue-solver-best", `(i) cell ${target}/${s}/${l}: solved hue reads back ${gotErr.toFixed(4)}° off, worse than the best iterate's ${floor.toFixed(4)}°`);
    const oldErr = readErr(old.last, s, l, target);
    if (!(oldErr > gotErr + 1e-9)) FAIL("hue-solver-best", `(i) cell ${target}/${s}/${l}: the old last-iterate error (${oldErr.toFixed(4)}°) is not worse than the new one (${gotErr.toFixed(4)}°) — the case proves nothing`);
  }

  // (ii) monotone improvement over a grid of (target, s, l), pale low-chroma cells included: the new
  // solver's read-back error is never worse than the old last-iterate's, and on a real share of the
  // grid it is much better (the >1° counter is the vacuity guard — a no-op fix would score 0).
  const G_HUES = [20, 62, 106, 150, 195, 239, 272, 275, 312, 326];
  const G_S = [0.03, 0.05, 0.12, 0.3, 0.55, 0.8, 1.0];
  const G_L = [0.08, 0.25, 0.5, 0.54, 0.72, 0.9, 0.96, 0.98];
  let cells = 0, improvedALot = 0;
  for (const target of G_HUES) for (const s of G_S) for (const l of G_L) {
    cells++;
    const old = oldRule(target, s, l);
    const oldErr = readErr(old.last, s, l, target);
    const gotErr = readErr(T.solveOkhslHue(target, s, l), s, l, target);
    if (gotErr > oldErr + 1e-12) FAIL("hue-solver-best", `(ii) cell ${target}/${s}/${l}: new error ${gotErr.toFixed(4)}° > old ${oldErr.toFixed(4)}° — the solver got WORSE`);
    if (oldErr - gotErr > 1) improvedALot++;
  }
  if (cells !== 560) FAIL("hue-solver-best", `(ii) grid is ${cells} cells, expected 560`);
  if (improvedALot < 50) FAIL("hue-solver-best", `(ii) only ${improvedALot} of ${cells} cells improve by >1° — the grid no longer exercises the runaway (measured: 109)`);

  // (iii) converged cells are BIT-IDENTICAL: where the old loop broke early on |err| < 1e-3, nothing
  // before that iterate can be smaller, so the argmin IS that iterate and the return is unchanged.
  // Two of these converge at iteration 1 and 3, not at the seed, so the check is not trivial.
  const CONVERGED = [
    [199, 0.2, 0.5], [248, 0.05, 0.5], [261, 1.0, 0.5], [270, 1.0, 0.5],
    [322, 1.0, 0.05], [339, 0.4, 0.5], [340, 1.0, 0.5], [340, 1.0, 0.95],
  ];
  let checked = 0;
  for (const [target, s, l] of CONVERGED) {
    const old = oldRule(target, s, l);
    if (!old.converged) FAIL("hue-solver-best", `(iii) cell ${target}/${s}/${l} no longer converges early — pick another, this one proves nothing`);
    else checked++;
    const got = T.solveOkhslHue(target, s, l);
    if (got !== old.last) FAIL("hue-solver-best", `(iii) cell ${target}/${s}/${l}: converged case moved, ${old.last} -> ${got} (must be bit-identical)`);
  }
  if (checked < 6) FAIL("hue-solver-best", `(iii) only ${checked} of ${CONVERGED.length} cells still converge early`);
}

// ── hpg-tonal-intensity-legacy: paletteStops is byte-identical to the pre-0.2.0 engine (AC-003a/006,
// EX-1) — 0.3.0 (#556/#559 re-ruling) removes the baseIntensity multiplier entirely, so this fixture
// (generated from the pre-0.2.0 engine, commit 83756bb, by scripts/gen-tonal-fixture.mjs; regenerated
// only by hand, never by npm test) is the direct, unconditional engine contract again — no controls
// field varies the result at all now, so a single pass over DEFAULTS proves it.
//   #648 + #647 + #657 CARVE-OUTS: 18 of these 32 ramps are deliberately NO LONGER pre-0.2.0-identical,
//   and the list is EXACT — a diff outside it is a regression, never a refresh.
//     #648 (3, even path): even/Warning, even/Success, even/Danger — the only three defaults carrying a
//       non-zero `lift`. The legacy engine applied lift as an additive TONE bump, which drove Warning's
//       stops 050-300 past lmax into six identical #FFFFFF swatches; lift is now a displacement of the
//       STOP (liftStop in tonal.js), so those three moved by design.
//     #647 (7, perceptual path): perceptual/Neutral, /Primary, /Tertiary, /Info, /Success, /Warning and
//       /Danger — EXACTLY the defaults carrying a non-zero `skew` or `lift` (skew -20 on Neutral,
//       Primary, Tertiary, Info, Success and Danger; skew 40 on Warning; lift -5 on Success and Danger).
//       okhslStops used to ignore both controls, so the shipped DEFAULT tone mode rendered them as if
//       they were zero; it now reads its lightness at an effective stop that carries them.
//     #647 retune (2 re-captured, both Warning): honouring those controls put Warning's accent at
//       2.18:1 (perceptual) and 1.90:1 (even) against its on-color, so the owner ruled its `lift` down
//       from 15 to -36 to clear WCAG AA in both ruled modes. even/Warning was already carved out above
//       for #648 and moved again; perceptual/Warning moved a second time. No other ramp moved with it,
//       which is asserted by hpg-role-contrast's default-parity check and was verified entry by entry.
//   #657 CARVE-OUT (supersedes the #647 line above): the perceptual list is now 15, not 7 — every
//     default but Secondary. `solveOkhslHue` used to return the hue its LAST Newton update produced
//     without ever reading it back; on the 8-bit staircase that read-back is piecewise constant, so
//     the 1e-3 criterion is unreachable and ALL 32 default cells exhaust. It now returns its best
//     scored candidate, which moves each palette's stop-500 anchor hue by 0.03° to 0.69° and re-lands
//     1 to 11 of that ramp's 25 stops by one 8-bit LSB. Biggest movers, with their stop-500 read-back
//     error before -> after: Neutral 0.69° (1.671° -> 0.573°), Info 0.54°, Warning 0.49°
//     (0.970° -> 0.064°), Tertiary 0.44° (1.142° -> 0.559°). Secondary's anchor moved 0.03°, too
//     little to cross a quantisation boundary at any stop, so it is the one perceptual ramp still
//     pre-0.2.0-identical. The 16 EVEN ramps are untouched by #657 — that path solves through
//     solveCam16Hue, which #657 did not change — so the #648 even carve-out above stands as written.
//   #681 U3 pass 3 CARVE-OUT (7 MORE even ramps, none newly carved on the perceptual side  -  this pass
//     only touched the even path): even/Secondary, /Data 1, /Data 4, /Data 5, /Data 6, /Data 7, /Data 8
//      -  all skew 0, lift 0 (so this is the hue-cusp half of "lift sign x hue-cusp tone" standing alone,
//     not lift: toneAt(500,...) is a fixed midpoint independent of the hue picked, but a hue's OWN
//     peak-chroma tone (peakC(hue).tone) is hue-specific and need not sit there  -  a non-anchor stop
//     can then have MORE local gamut headroom than the anchor even at skew=lift=0). Generated palettes
//     (dampAmp 0) now cap every stop's chroma at the anchor's own (Q7's "0 above 100%" fix), so these
//     7 ramps' stops nearest the hue's true cusp  -  indices vary by hue, 2 to 4 of 25 stops each  -  moved
//     down to the anchor's ceiling instead of the legacy formula's uncapped value. even/Warning was
//     ALREADY carved (#648, lift != 0) and picks up more moved cells here too, not a new entry.
//   Carved total after #681 U3 pass 3: 25 of 32 (10 even + 15 perceptual). The remaining 7  -  Neutral,
//   Primary, Tertiary, Info, Data 2, Data 3 (even) and Secondary (perceptual)  -  are byte-for-byte what
//   83756bb emitted, and that is what each regeneration of this file was verified against.
//   #681 U3 pass 7 CARVE-OUT (all 16 even, none newly carved on the perceptual side): step 1 closes the
//   even path's own C6 median/p90 misses (100/300/900) by reading a MAPPED damp/dampCurve for toneMode
//   "even" inside chromaEnvelope (EVEN_DAMP_FACTOR, exported)  -  dampCurve alone cannot close them (a
//   synthetic sweep down to dampCurve x0.001 at fixed damp left stop 100/900 unmoved; see the
//   chromaEnvelope comment and .sdlc/handoffs/pif-u3-retune.md). This is a formula-wide change to the
//   even path's damping, not a localized cusp fix, so it moves nearly every non-anchor, non-50/950 stop
//   of EVERY even ramp  -  the remaining 6 un-carved even defaults (Neutral, Primary, Tertiary, Info,
//   Data 2, Data 3) join the other 10 already carved, so even mode is now 16 of 16 carved. Perceptual is
//   untouched (0 hex diffs over the full corpus + default kit, u3fix/hexdiff-perceptual-peak.mjs), so
//   Secondary stays the one perceptual ramp still pre-0.2.0-identical.
//   Carved total after #681 U3 pass 7: 31 of 32 (16 even + 15 perceptual). Only perceptual/Secondary
//   remains byte-for-byte what 83756bb emitted. Do NOT regenerate this file to make an unexplained red
//   go green  -  every regeneration must be preceded by a citation like this one.
//   Q5 single-cell re-pin (2026-09-19, addendum 1, standing rule at
//   .sdlc/questions/standing-rulings-2026-09-20.md): perceptual/Data 1 (already carved by #657 above,
//   so its fixture cells hold POST-#657 values, not 83756bb's) drifted by exactly one 8-bit LSB at a
//   SINGLE cell, stop 400: #9789FB -> #9789FA. Verified isolated - re-ran the full 25-stop perceptual
//   Data 1 ramp directly (hue 287, chroma 95, skew 0, lift 0, role-table.json's raw CAM16 hue, matching
//   this block's own construction below) and every other of the 25 cells, including stop 500 the hue
//   solve pivots on, is still byte-identical to the fixture; only stop 400 moved. Cause: `okhslStops`
//   resolves ONE hue (`hOk`, at stop 500) for the whole non-anchored ramp and reuses it at every other
//   stop (hueShift=0 for Data 1, so `hue === hOk` constant throughout) - a later solveOkhslHue
//   refinement in this same integration head's own review-pass chain (the #657 carve-out above already
//   documents several such refinements) moved `hOk` by under one float ULP at the solved precision,
//   too small to move stop 500's OWN rounded pixel but just large enough to tip stop 400's blue channel
//   across its 8-bit rounding boundary at that stop's different chroma/tone - the same "adjacent tread"
//   sensitivity this file's own STAIRCASE comment (hue-solver-best, above) names for the identical
//   reason. Fixture cell patched by hand (single line, `test/engine/fixtures/tonal-legacy.json`), not
//   regenerated wholesale, to keep this diff reviewable and to avoid disturbing any other cell. ──────
//   #681 U10 re-pin (pre-land F3, owner ruling R26): chromaEnvelope now caps `sd` at +/-1. Under
//   Warning's lift -36 the raw distance from the lifted anchor to its lightest stops passed 450, so
//   the envelope clipped to 0 and those stops rendered neutral grey. Eight cells moved, all Warning,
//   all already carved above: perceptual stops 100/125/150/175/200 (#FBFBFB #F8F8F8 #F3F3F3 #EDECEB
//   #EAE4DE -> #FCFBFA #F9F7F5 #F5F2EF #F0ECE6 #EBE4DC) and even stops 125/150/175 (#FBFBFB #FCF6F3
//   #FAF2ED -> #FFFAF8 #FFF6F0 #FAF2EC). Every other cell of the 32 ramps is byte-identical before and
//   after the cap. Patched by hand, cell by cell, not regenerated.
{
  const FX = JSON.parse(readFileSync(new URL("./fixtures/tonal-legacy.json", import.meta.url), "utf8")).paths;
  const dc = T.DEFAULT_CONTROLS || {};
  if ("baseIntensity" in dc) FAIL("intensity-legacy", "DEFAULT_CONTROLS must carry no baseIntensity field at all (AC-004) — that fallback default lives in src/ui/ now, never in the engine");
  if (T.DEFAULT_IDENTITY_STOPS !== undefined) FAIL("intensity-legacy", "DEFAULT_IDENTITY_STOPS must not exist — the ramp no longer special-cases any stop (#536)");
  let cells = 0;
  for (const toneMode of ["perceptual", "even"]) for (const p of DEFAULTS) {
    const ctl = { ...dc, toneMode };
    const got = T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift }, ctl, STOPS).map((r) => r.hex);
    const want = FX[toneMode][p.name];
    if (!want || want.length !== STOPS.length) { FAIL("intensity-legacy", `fixture has no ${toneMode}/${p.name} ramp of ${STOPS.length} stops`); continue; }
    for (let i = 0; i < STOPS.length; i++) { cells++; if (got[i] !== want[i]) { FAIL("intensity-legacy", `${toneMode} ${p.name} stop ${STOPS[i]}: ${got[i]} != fixture ${want[i]}`); break; } }
  }
  if (cells < 2 * DEFAULTS.length * STOPS.length) FAIL("intensity-legacy", `only ${cells} fixture cells compared`);
  // controls.baseIntensity has NO effect at all any more (0.3.0 REQ-002/004): a document at baseIntensity
  // 40 renders every default palette's ramp exactly as at 100 — the multiplier is gone, not just at 100.
  for (const toneMode of ["perceptual", "even"]) for (const p of DEFAULTS) {
    const pal = { hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift };
    const at100 = T.paletteStops(pal, { ...dc, toneMode, baseIntensity: 100 }, STOPS).map((r) => r.hex).join();
    const at40 = T.paletteStops(pal, { ...dc, toneMode, baseIntensity: 40 }, STOPS).map((r) => r.hex).join();
    if (at100 !== at40) { FAIL("intensity-legacy", `${toneMode} ${p.name}: controls.baseIntensity still moves the ramp (40 != 100) — the multiplier must be fully removed (Risk 0)`); break; }
  }
}

// ── hpg-tonal-ac004-greps: AC-004 (0.3.0) — intensityAt/baseIntensity/palette.intensity are fully gone
// from the engine; identityStops/keyIntensity are fully gone outside RENAME_MAPS + its own test.
// Scoped to real source (never the generated `*-assets.js`/`categories/*.js` bundles, which embed other
// files' text verbatim or ship literal preset JSON carrying pre-migration field names as plain DATA —
// neither is code the AC-004 grep is asking about, and categories/*.js alone is megabytes of preset
// text that overflows a child-process pipe). ─────────────────────────────────────────────────────────
{
  const { execFileSync } = await import("node:child_process");
  const repoRoot = new URL("../../", import.meta.url).pathname;
  const EXCLUDE = [":(exclude)src/ui/categories", ":(exclude)src/ui/*-assets.js", ":(exclude)figma/plugin/ui.html"];
  const gitGrep = (pattern, paths) => {
    try {
      return execFileSync("git", ["grep", "-n", pattern, "--", ...paths, ...EXCLUDE], { cwd: repoRoot, encoding: "utf8" }).trim();
    } catch (e) {
      if (e.status === 1) return ""; // git grep exits 1 on "no matches" — not an error here
      throw e;
    }
  };
  const grep1 = gitGrep("intensityAt\\|baseIntensity\\|\\.intensity\\b", ["src/engine"]);
  // baseIntensity is still a legitimate DOMAINS/DEFAULT_CONTROLS field name OUTSIDE src/engine (persist.js,
  // model.mjs) — AC-004 scopes this grep to src/engine only, where it must be entirely absent now.
  if (grep1) FAIL("ac004-greps", `intensityAt/baseIntensity/.intensity must not appear in src/engine:\n${grep1}`);
  // semantic.js's own identityStops(roles) is a DIFFERENT, still-live concept (which solid stops the
  // five identity ROLES resolve to) that predates and is unrelated to the retired RAMP-chroma spike
  // this grep is hunting — excluded by name, not by file, so a real regression in tonal.js/model.mjs
  // still trips it.
  //
  // keyIntensity itself is scoped to src/engine + model.mjs only (not persist.js or the wider test
  // tree): the pre-existing v3 keyIntensity->primeChroma RENAME_MAPS machinery in persist.js, and its
  // own dedicated test coverage, legitimately keeps that string for exactly the reason REQ-011 states
  // (a snapshot older than schema v3 still carries the old name and must translate) — 0.3.0 does not
  // touch that mechanism, only proves the ENGINE/model layer has no live (non-migration) dependency
  // on it left.
  const grep2 = gitGrep("keyIntensity", ["src/engine", "src/ui/model.mjs"]);
  if (grep2) FAIL("ac004-greps", `keyIntensity must not appear in src/engine or model.mjs (outside the v3 migration machinery, which lives in persist.js):\n${grep2}`);
  // DEFAULT_IDENTITY_STOPS itself is asserted undefined directly above (intensity-legacy) — a
  // whole-tree text grep for it here would also match this very check's own source, so it isn't repeated.
}

// ── hpg-tonal-lift-monotonic (#648): `lift` must not flatten or reverse the ramp. The bump used to be
//    ADDITIVE in TONE space (t += lift·w), which ignores the base curve's local slope: under
//    logistic/tension 0 the light end is nearly flat, skew 40 flattens it further, and the default
//    Warning palette (skew 40, lift 15) pushed t past lmax at stops 200-300 while REVERSING it at
//    100-150 — the trailing clamp then saturated 050-300 into six identical #FFFFFF stops. The
//    hpg-tonal-monotonic group above ran its curve × skew grid at lift 0 ONLY, so nothing caught it.
//    Lift is now a displacement of the STOP, evaluated on the unchanged monotone curve, which makes
//    the clamp a no-op safety net. These checks are black-box: they never restate the implementation's
//    own bump formula, so a refit of that formula cannot slip past them.
{
  const LIFTS = [-40, -20, -5, 0, 5, 15, 20, 40];
  const TENSIONS = [0, 50, 100];
  // (i) every default palette, in BOTH ramp distributions, is a STRICTLY descending ladder.
  //     `DEFAULTS` is role-table.json's `defaults` — already this file's palette source, and it
  //     carries all 16 (8 brand + 8 Data), including the three that ship a non-zero lift
  //     (Warning +15, Success/Danger -5), so it needs no second source from model.mjs.
  for (const mode of ["even", "perceptual", "peak"]) {
    for (const p of DEFAULTS) {
      const rows = T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift }, { ...CTL, toneMode: mode }, STOPS);
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].tone >= rows[i - 1].tone) {
          FAIL("lift-monotonic", `${mode} ${p.name} (skew ${p.skew} lift ${p.lift}): stop ${rows[i - 1].stop}->${rows[i].stop} did not descend (${rows[i - 1].tone.toFixed(6)} -> ${rows[i].tone.toFixed(6)})`);
          break;
        }
      }
      // Range tolerance is mode-aware: "even" REPORTS the tone it targeted, so the bound is exact;
      // the OKHSL paths report the MEASURED L* of an 8-bit RGB triple, which lands a few hundredths
      // off lmin/lmax by quantisation alone (e.g. Primary 950 measures 4.953). Part (ii) below does
      // the exact-bound work on toneAt itself, so nothing is lost by the slack here.
      const tol = mode === "even" ? 1e-9 : 0.5;
      for (const r of rows) if (!(r.tone >= CTL.lmin - tol && r.tone <= CTL.lmax + tol))
        FAIL("lift-monotonic", `${mode} ${p.name}: stop ${r.stop} tone ${r.tone} outside [${CTL.lmin}, ${CTL.lmax}]`);
      // the visible symptom the defect produced: a run of identical swatches.
      const distinct = new Set(rows.map((r) => r.hex)).size;
      if (distinct < STOPS.length)
        FAIL("lift-monotonic", `${mode} ${p.name}: only ${distinct}/${STOPS.length} distinct swatches (flat plateau)`);
    }
  }
  // (ii) the full control grid, on `STOPS` — which in this file is T.EXPORT_STOPS, the 25-stop export
  //      ramp: a superset of the display 19, so a half-step cannot hide a reversal the 19 step over.
  //      The lmin/lmax pairs matter as much as the curve: the guarantee is claimed to be independent of
  //      the ramp's endpoints, and a document can set them (the presets ship lmax 100/lmin 5, but the
  //      DARK domain default is lmax 60). If the bound were secretly endpoint-dependent, a narrow band
  //      is where it would show, because the same displacement covers more of a shorter ramp.
  const BANDS = [[CTL.lmin, CTL.lmax], [0, 100], [0, 60], [20, 80], [40, 60], [5, 60]];
  for (const curve of CURVES) for (const skew of SKEWS) for (const lift of LIFTS) for (const tension of TENSIONS) for (const [lmin, lmax] of BANDS) {
    const c = { curve, lmin, lmax, tension };
    const cell = `${curve} skew ${skew} lift ${lift} tension ${tension} band ${lmin}..${lmax}`;
    const tones = STOPS.map((s) => T.toneAt(s, skew, lift, c));
    for (let i = 1; i < tones.length; i++) if (tones[i] >= tones[i - 1]) {
      FAIL("lift-monotonic", `${cell}: stop ${STOPS[i - 1]}->${STOPS[i]} did not descend (${tones[i - 1].toFixed(9)} -> ${tones[i].toFixed(9)})`);
      break;
    }
    // Endpoints are EXACT — the bump's weight is 0 at 050/950 — so lift can never move the ends.
    if (tones[0] !== lmax) FAIL("lift-monotonic", `${cell}: stop 050 = ${tones[0]}, expected lmax ${lmax}`);
    if (tones[tones.length - 1] !== lmin) FAIL("lift-monotonic", `${cell}: stop 950 = ${tones[tones.length - 1]}, expected lmin ${lmin}`);
    // The trailing clamp must never be what PRODUCES a value. Proven black-box, without re-deriving
    // the pre-clamp expression: a fired clamp pins its stop EXACTLY to a bound, so asserting every
    // INTERIOR stop sits strictly inside (lmin, lmax) is exactly the statement "the clamp never fired".
    for (let i = 1; i < tones.length - 1; i++) if (tones[i] >= lmax || tones[i] <= lmin) {
      FAIL("lift-monotonic", `${cell}: interior stop ${STOPS[i]} pinned to a bound (${tones[i]}) — the clamp fired`);
      break;
    }
  }
  // (iii) lift 0 is BYTE-IDENTICAL to the documented curve, checked against an INDEPENDENT derivation
  //       written out here from the spec's own formulas — not by calling the module's shape()/toneAt
  //       internals. A test that re-uses the implementation's expression cannot catch a refit of it
  //       (how the sibling defect in test/engine/prime.mjs group (d) shipped green).
  const refShape = (x, curve, ten) => {
    if (curve === "linear") return x;
    if (curve === "sine") return 0.5 - 0.5 * Math.cos(Math.PI * x);
    if (curve === "cubic") return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(2 - 2 * x, 3) / 2;
    if (curve === "logistic") {                       // normalized sigmoid, k from 4 (ten 0) to 16 (ten 1)
      const k = 4 + 12 * ten;
      const f = (u) => 1 / (1 + Math.exp(-k * (u - 0.5)));
      return (f(x) - f(0)) / (f(1) - f(0));
    }
    const k = 0.4 + 4.6 * ten;                        // "exp": compressed lights, k from 0.4 to 5
    return (Math.exp(k * x) - 1) / (Math.exp(k) - 1);
  };
  const refTone = (stop, skew, { curve, lmin, lmax, tension }) =>
    lmax - (lmax - lmin) * refShape(Math.pow((stop - 50) / 900, Math.pow(3, skew / 100)), curve, tension / 100);
  for (const curve of CURVES) for (const skew of SKEWS) for (const tension of TENSIONS) for (const s of STOPS) {
    const c = { curve, lmin: CTL.lmin, lmax: CTL.lmax, tension };
    const got = T.toneAt(s, skew, 0, c), want = refTone(s, skew, c);
    if (Math.abs(got - want) > 1e-9)
      FAIL("lift-monotonic", `lift 0 drifted from the documented curve: ${curve} skew ${skew} tension ${tension} stop ${s} -> ${got}, expected ${want}`);
  }
  // (iv) the bump keeps its CHARACTER. Stated against what the bump IS — a cosine displacement of the
  //      STOP, centered on 500 — and what it must DO to the tone, which are different claims. The
  //      DISPLACEMENT peaks at 500 and tapers monotonically to exactly 0 at both ends. The TONE
  //      response does NOT have to peak at 500, and asserting that it did would be wrong: the tone
  //      moves most where the curve is steepest, which a strong skew deliberately drags off-center
  //      (linear, skew 100 puts it near 800). Forcing the RESPONSE to be centered is precisely the
  //      tone-space-additive mistake that caused #648, so the test must not demand it back.
  for (const lift of [-40, -20, -5, 5, 15, 20, 40]) {
    const disp = STOPS.map((s) => T.liftStop(s, lift) - s);
    const mid = STOPS.indexOf(500);
    if (disp[0] !== 0 || disp[disp.length - 1] !== 0)
      FAIL("lift-monotonic", `lift ${lift}: liftStop moved an endpoint (050 ${disp[0]}, 950 ${disp[disp.length - 1]}) — the ends must be pinned`);
    const peak = Math.max(...disp.map(Math.abs));
    if (Math.abs(disp[mid]) < peak - 1e-12)
      FAIL("lift-monotonic", `lift ${lift}: displacement peaks at stop ${STOPS[disp.findIndex((v) => Math.abs(v) === peak)]}, not 500 — the bump is off-center`);
    for (let i = 1; i <= mid; i++) if (Math.abs(disp[i]) < Math.abs(disp[i - 1]) - 1e-12)
      FAIL("lift-monotonic", `lift ${lift}: displacement dips on the way up to 500 at stop ${STOPS[i]}`);
    for (let i = mid + 1; i < disp.length; i++) if (Math.abs(disp[i]) > Math.abs(disp[i - 1]) + 1e-12)
      FAIL("lift-monotonic", `lift ${lift}: displacement grows again past 500 at stop ${STOPS[i]}`);
    // lift>0 must read a LIGHTER (lower) stop, lift<0 a darker one.
    if (disp.some((v) => v * lift > 1e-12))
      FAIL("lift-monotonic", `lift ${lift}: displacement runs the wrong way`);
  }
  for (const curve of CURVES) for (const skew of SKEWS) for (const tension of TENSIONS) for (const lift of [-40, -20, -5, 5, 15, 20, 40]) {
    const c = { curve, lmin: CTL.lmin, lmax: CTL.lmax, tension };
    const cell = `${curve} skew ${skew} tension ${tension} lift ${lift}`;
    const d = STOPS.map((s) => T.toneAt(s, skew, lift, c) - T.toneAt(s, skew, 0, c));
    if (d[0] !== 0 || d[d.length - 1] !== 0)
      FAIL("lift-monotonic", `${cell}: an endpoint's tone moved (050 ${d[0]}, 950 ${d[d.length - 1]})`);
    // lift>0 lightens, lift<0 darkens — at EVERY stop, never a flip in between.
    for (let i = 1; i < d.length - 1; i++) if (d[i] * lift < -1e-12) {
      FAIL("lift-monotonic", `${cell}: stop ${STOPS[i]} moved the wrong way (${d[i].toFixed(6)})`);
      break;
    }
    if (Math.abs(d[STOPS.indexOf(500)]) < 1e-6)
      FAIL("lift-monotonic", `${cell}: stop 500 did not move — lift is inert`);
  }

  // (v) LIFT_GAIN and the `lift` DOMAIN are coupled across two files: tonal.js sizes the displacement,
  //     persist.js decides how far lift can be pushed. The in-domain guarantee ("the cap never binds,
  //     so lift stays linear across its whole range") is exactly LIFT_GAIN * domainMax < LIFT_SHIFT_MAX,
  //     and widening the domain in persist.js alone would silently break it with nothing else noticing.
  //     DOMAINS is read by IMPORT, not by parsing the file text — persist.js loads in plain node with
  //     no DOM — so this cannot drift from what the app actually clamps to.
  {
    const dom = DOMAINS.palette.lift;
    const reach = Math.max(Math.abs(dom.min), Math.abs(dom.max));
    if (!(T.LIFT_GAIN * reach < T.LIFT_SHIFT_MAX))
      FAIL("lift-monotonic", `LIFT_GAIN ${T.LIFT_GAIN} x lift domain ${reach} = ${T.LIFT_GAIN * reach} exceeds LIFT_SHIFT_MAX ${T.LIFT_SHIFT_MAX.toFixed(2)} — the cap would bind inside the domain, so lift stops being linear over its own range`);
  }

  // (vi) the display(19) and export(25) ramps must agree at every SHARED stop — toneAt stays a pure
  //     function of the one stop value, so no whole-ramp renormalisation can creep into the fix.
  for (const p of DEFAULTS) {
    const d19 = T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift }, CTL, T.STOPS);
    const d25 = T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift }, CTL, STOPS);
    for (const r of d19) {
      const m = d25.find((x) => x.stop === r.stop);
      if (m.hex !== r.hex) FAIL("lift-monotonic", `${p.name}: stop ${r.stop} is ${r.hex} on the 19-stop ramp but ${m.hex} on the 25-stop ramp`);
    }
  }
}

// ── hpg-tonal-skew-lift-okhsl (#647): the per-palette `skew` and `lift` must shape the ramp in EVERY
//    tone mode, not just "even". They were persisted (persist.js, domain -40..40 / -100..100), threaded
//    through both ramp call sites, shipped with non-zero defaults on 7 of the 8 semantic palettes and
//    exposed as sliders — but okhslStops never read them, so in the SHIPPED DEFAULT mode ("perceptual")
//    dragging Skew moved the 7-swatch prime ladder (prime.mjs DOES read skew) while the 19-stop gradient
//    beneath it sat still. okhslStops now reads its LIGHTNESS at an EFFECTIVE stop that carries both
//    controls, in toneAt's own order (liftStop's displacement, then skew's gamma on position); hue and
//    saturation stay keyed on the REAL stop, since they are damping/rotation terms about the centre.
{
  const OK = (mode, extra = {}) => ({ ...(T.DEFAULT_CONTROLS || {}), toneMode: mode, ...extra });
  const zeroDefaults = DEFAULTS.filter((p) => (p.skew ?? 0) === 0 && (p.lift ?? 0) === 0);
  if (zeroDefaults.length < 9) FAIL("skew-lift-okhsl", `(i) expected the 9 skew-0/lift-0 defaults (Secondary + Data 1-8), found ${zeroDefaults.length}`);

  // (i) skew 0 + lift 0 is the UNWARPED distribution — checked against an INDEPENDENT derivation written
  //     out here from the documented one (even steps in OKHSL lightness between the lmax/lmin endpoints;
  //     "peak" pivots each half on the hue's cusp), read back off the EMITTED pixel via rgbToOkhsl. It
  //     never calls the ramp's own lightness path with the controls zeroed, so a refit of that path
  //     cannot be compared against itself. okhslLAt/effHue/peakC are separate, independently gated engine
  //     functions, not the expression under test. Budget 3e-3: the 8-bit RGB round-trip alone costs up to
  //     2.0e-3 of OKHSL l, an order of magnitude under the ~0.02 gap between neighbouring stops.
  const okl = (rgb) => rgbToOkhsl(rgb).l;
  const LQ = 3e-3;
  // CAP_L_EXCEPTIONS (#681 U3 pass 5): the peak-mode anchor cap (below, mode "peak" only) holds CIE L*
  // fixed at these stops, not OKHSL l  -  a deliberate, disclosed divergence from this check's own
  // independent-OKHSL-l derivation, only where the cap actually binds (dampAmp 0, chroma > anchorChroma).
  // Bidirectionally verified: every cited key must be observed AND every observed mismatch must be cited.
  const CAP_L_EXCEPTIONS = new Set([
    "peak|oklch|Data 6|550",
    "peak|cam16|Secondary|550",
    "peak|cam16|Data 6|550",
  ]);
  const seenCapLExceptions = new Set();
  for (const mode of ["perceptual", "peak"]) {
    for (const hueSpace of ["oklch", "cam16"]) {
      for (const p of zeroDefaults) {
        const ctl = OK(mode, { hueSpace, vibrancy: 0 });
        const lLight = T.okhslLAt(ctl.lmax), lDark = T.okhslLAt(ctl.lmin);
        const cuspL = T.okhslLAt(E.peakC(T.effHue(p.hue, hueSpace, T.hueAnchorFrac(p, ctl))).tone);
        const rows = T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift }, ctl, STOPS);
        for (const r of rows) {
          const want = mode === "peak"
            ? (r.stop <= 500 ? lLight + (cuspL - lLight) * ((r.stop - 50) / 450) : cuspL + (lDark - cuspL) * ((r.stop - 500) / 450))
            : lLight + (lDark - lLight) * ((r.stop - 50) / 900);
          if (Math.abs(okl(r.rgb) - want) > LQ) {
            const key = `${mode}|${hueSpace}|${p.name}|${r.stop}`;
            if (CAP_L_EXCEPTIONS.has(key)) { seenCapLExceptions.add(key); continue; }
            FAIL("skew-lift-okhsl", `(i) ${mode}/${hueSpace} ${p.name} stop ${r.stop}: skew 0 + lift 0 is not the unwarped distribution — emitted OKHSL l ${okl(r.rgb).toFixed(5)} vs independent ${want.toFixed(5)}`);
            break;
          }
        }
      }
    }
  }
  if (seenCapLExceptions.size !== CAP_L_EXCEPTIONS.size) {
    const missing = [...CAP_L_EXCEPTIONS].filter((k) => !seenCapLExceptions.has(k));
    FAIL("skew-lift-okhsl", `(i) ${missing.length} of the ${CAP_L_EXCEPTIONS.size} cited CAP_L_EXCEPTIONS were not observed this run (${missing.join(", ")})  -  either fixed (remove from the list) or the corpus changed under it`);
  }

  // (ii) a NON-ZERO skew or lift must MOVE the perceptual/peak ramp, and move it the documented way:
  //      skew>0 and lift>0 both LIGHTEN the mids (toneAt's direction), their negatives darken them.
  //      This is the ticket's own gate: before #647 every one of these was a no-op.
  for (const mode of ["perceptual", "peak"]) {
    const base = { hue: 267, chroma: 80 };
    const at500 = (skew, lift) => T.paletteStops({ ...base, skew, lift }, OK(mode), STOPS).find((r) => r.stop === 500).tone;
    const flat = at500(0, 0);
    for (const [label, skew, lift, dir] of [["skew +40", 40, 0, 1], ["skew -40", -40, 0, -1], ["lift +20", 0, 20, 1], ["lift -20", 0, -20, -1]]) {
      const got = at500(skew, lift);
      if (Math.abs(got - flat) < 0.5)
        FAIL("skew-lift-okhsl", `(ii) ${mode}: ${label} left stop 500 at L* ${got.toFixed(3)} — the control is inert on this path (#647)`);
      else if ((got - flat) * dir < 0)
        FAIL("skew-lift-okhsl", `(ii) ${mode}: ${label} moved stop 500 the WRONG way (${flat.toFixed(2)} -> ${got.toFixed(2)})`);
    }
    // whole-ramp, on the shipped defaults that carry a non-zero control: at least one stop must differ.
    for (const p of DEFAULTS.filter((d) => (d.skew ?? 0) !== 0 || (d.lift ?? 0) !== 0)) {
      const warped = T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift }, OK(mode), STOPS).map((r) => r.hex).join();
      const flatR = T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: 0, lift: 0 }, OK(mode), STOPS).map((r) => r.hex).join();
      if (warped === flatR)
        FAIL("skew-lift-okhsl", `(ii) ${mode} ${p.name} (skew ${p.skew} lift ${p.lift}): the shipped controls do not change the ramp at all`);
    }
  }

  // (iii) ORDER. Two claims, kept apart.
  //   (a) EXACT, no tolerance: the effective stop the lightness is read at is STRICTLY increasing, which
  //       is the whole monotonicity argument (both lightness formulas are non-increasing in it). Derived
  //       here from the EXPORTED liftStop plus the documented gamma 3^(skew/100) — never from okhslStops.
  //   (b) RENDERED: the emitted pixels' OKHSL lightness never RISES across the grid, to within the 3e-3
  //       read-back budget of (i).
  //   (c) MEASURED: the reported `tone`  -  the CIELAB L* of the 8-bit triple the ramp actually emits  - 
  //       never rises, over the same grid, beyond a NAMED, CITED exception list (GRID_R2_EXCEPTIONS
  //       below). This used to carry a 0.152 L* allowance: L* moves with CHROMA as well as lightness,
  //       the damping was positioned on the RAW stop while the lightness was read at the LIFTED one, and
  //       at a domain extreme a step whose lightness lift had compressed to near nothing still took a
  //       full damping step, fell off the OKHSL s=1 clipping cliff, and measured UP (#668: worst 0.154
  //       here, +0.51 L* on the curated corpus, 11 presets). #668 positions the damping on liftStop,
  //       which closes that class to exactly 0. #681 U3's R2 (chromaEnvelope re-centred on the anchor's
  //       OWN lifted reading, closing the exact-env(anchor)=1-at-every-lift gap and the two rendered-path
  //       duplicate-hex ramps R1 left  -  see chromaEnvelope's own comment) reopens 21 of these 10,080
  //       SYNTHETIC cells (chroma pinned at 95, skew as extreme as ±100  -  within the user-settable
  //       ranges, but unused by any shipped preset or role default), 20 near-white (tone 90.9-99.5) and
  //       one near-black (tone 7.55, hue 287 skew -100 lift -40), worst +0.1314 L*  -  about a sixth of
  //       the defect this unit repairs, and, measured on the corpus the product actually
  //       renders, a strictly better trade: 0 duplicate-hex ramps instead of 2. The list is verified
  //       load-bearing both directions, same shape as C6(ii)'s KNOWN_BASELINE_DUP: deleting an entry
  //       reproduces a FAIL naming that exact cell; an unlisted 22nd cell fails too. The lift-0 slice is
  //       the negative control that says the skew gamma was never part of it: it is asserted separately
  //       below, so a future change that made skew produce upticks could not hide inside the list.
  const SKEW_G = [-100, -50, -20, 0, 40, 50, 100];
  const LIFT_G = [-40, -20, -5, 0, 5, 15, 20, 40];
  const HUES_G = [...new Set(DEFAULTS.map((d) => d.hue))];
  const effRef = (stop, skew, lift) => {
    const sL = T.liftStop(stop, lift);
    return 50 + 900 * Math.pow(Math.min(1, Math.max(0, (sL - 50) / 900)), Math.pow(3, skew / 100));
  };
  for (const skew of SKEW_G) for (const lift of LIFT_G) {
    const se = STOPS.map((s) => effRef(s, skew, lift));
    for (let i = 1; i < se.length; i++) if (!(se[i] > se[i - 1])) {
      FAIL("skew-lift-okhsl", `(iii a) skew ${skew} lift ${lift}: effective stop did not strictly increase at ${STOPS[i - 1]}->${STOPS[i]} (${se[i - 1]} -> ${se[i]})`);
      break;
    }
    if (se[0] !== 50 || Math.abs(se[se.length - 1] - 950) > 1e-9)
      FAIL("skew-lift-okhsl", `(iii a) skew ${skew} lift ${lift}: the endpoints moved (050 -> ${se[0]}, 950 -> ${se[se.length - 1]})`);
  }
  // GRID_R2_EXCEPTIONS  -  the 21 synthetic grid cells #681 U3's R2 chromaEnvelope (anchor re-centred on
  // its own lifted reading, tonal.js's chromaEnvelope comment) measurably reopens, out of the 10,080
  // cells probed. 20 near-white (tone 90.9-99.5), one near-black (tone 7.55, hue 287 skew -100
  // lift -40, perceptual/cam16, stop 700->750); all lift 40 or -40; all a skew/hue/vibrancy/hueSpace
  // combination within the user-settable ranges but unused by any shipped preset or role default.
  // Cited exactly, verified both directions: remove one and this gate FAILs naming that cell; an
  // unlisted 22nd cell also FAILs.
  const GRID_R2_EXCEPTIONS = new Set([
    "perceptual|oklch|165|0|40|100|300&350",
    "perceptual|oklch|152|0|40|100|300&350",
    "perceptual|oklch|107|40|40|100|350&400",
    "perceptual|cam16|287|-100|-40|50|700&750",
    "perceptual|cam16|165|-100|40|100|175&200",
    "perceptual|cam16|165|0|40|100|250&300",
    "peak|oklch|165|0|40|0|300&350",
    "peak|oklch|152|0|40|0|300&350",
    "peak|oklch|107|40|40|0|350&400",
    "peak|oklch|165|0|40|50|300&350",
    "peak|oklch|152|0|40|50|300&350",
    "peak|oklch|107|40|40|50|350&400",
    "peak|oklch|165|0|40|100|300&350",
    "peak|oklch|152|0|40|100|300&350",
    "peak|oklch|107|40|40|100|350&400",
    "peak|cam16|165|-100|40|0|175&200",
    "peak|cam16|165|0|40|0|250&300",
    "peak|cam16|165|-100|40|50|175&200",
    "peak|cam16|165|0|40|50|250&300",
    "peak|cam16|165|-100|40|100|175&200",
    "peak|cam16|165|0|40|100|250&300",
  ]);
  // this grid is synthetic, not a corpus sweep, but at an estimated 16s quiet it decides whether the
  // 120s ceiling holds (#713 design section); SAMPLED thins it to every fifth hue, offset by
  // SAMPLE_SEED % 5, the same thinning prime.mjs's own grids use.
  const GRID_HUES = FULL ? HUES_G : HUES_G.filter((_, i) => i % 5 === SAMPLE_SEED % 5);
  const seenGridException = new Set();
  let gridCells = 0, measuredUpticks = 0, zeroLiftUpticks = 0, worstRise = 0, worstCell = "";
  for (const mode of ["perceptual", "peak"]) for (const hueSpace of ["oklch", "cam16"]) for (const vibrancy of [0, 50, 100])
    for (const skew of SKEW_G) for (const lift of LIFT_G) for (const hue of GRID_HUES) {
      gridCells++;
      const rows = T.paletteStops({ hue, chroma: 95, skew, lift }, OK(mode, { hueSpace, vibrancy }), STOPS);
      const ls = rows.map((r) => okl(r.rgb));
      for (let i = 1; i < ls.length; i++) if (ls[i] > ls[i - 1] + LQ) {
        FAIL("skew-lift-okhsl", `(iii b) ${mode}/${hueSpace} hue ${hue} skew ${skew} lift ${lift} vibrancy ${vibrancy}: OKHSL lightness ROSE at stop ${STOPS[i - 1]}->${STOPS[i]} (${ls[i - 1].toFixed(5)} -> ${ls[i].toFixed(5)})`);
        break;
      }
      for (let i = 1; i < rows.length; i++) if (rows[i].tone > rows[i - 1].tone) {
        const key = `${mode}|${hueSpace}|${hue}|${skew}|${lift}|${vibrancy}|${STOPS[i - 1]}&${STOPS[i]}`;
        if (GRID_R2_EXCEPTIONS.has(key)) { seenGridException.add(key); break; }
        measuredUpticks++;
        if (rows[i].tone - rows[i - 1].tone > worstRise) { worstRise = rows[i].tone - rows[i - 1].tone; worstCell = `${mode}/${hueSpace} hue ${hue} skew ${skew} lift ${lift} vibrancy ${vibrancy} stop ${STOPS[i - 1]}->${STOPS[i]} (${rows[i - 1].tone.toFixed(4)} -> ${rows[i].tone.toFixed(4)}) key ${key}`; }
        if (lift === 0) zeroLiftUpticks++;
        break;
      }
    }
  if (gridCells < 2 * 2 * 3 * SKEW_G.length * LIFT_G.length * GRID_HUES.length)
    FAIL("skew-lift-okhsl", `(iii b) grid only covered ${gridCells} cells`);
  if (measuredUpticks)
    FAIL("skew-lift-okhsl", `(iii c) measured CIELAB L* ROSE on ${measuredUpticks} of ${gridCells} grid cells beyond the ${GRID_R2_EXCEPTIONS.size} cited exceptions, worst +${worstRise.toFixed(4)} L* at ${worstCell}  -  the damping is travelling where the lightness is not (#668)`);
  // exact under FULL; SAMPLED's thinned hue grid cannot reach every cited cell (#713 design section).
  if (FULL && seenGridException.size !== GRID_R2_EXCEPTIONS.size) {
    const missing = [...GRID_R2_EXCEPTIONS].filter((k) => !seenGridException.has(k));
    FAIL("skew-lift-okhsl", `(iii c) ${missing.length} of the ${GRID_R2_EXCEPTIONS.size} cited R2 grid exceptions were not observed this run (${missing.join(", ")})  -  either fixed (remove from the list) or the grid changed under it (re-diagnose before loosening further)`);
  }
  if (zeroLiftUpticks)
    FAIL("skew-lift-okhsl", `(iii c) ${zeroLiftUpticks} of the upticks are at lift 0  -  the skew gamma now produces them too, so positioning the damping on liftStop alone no longer covers the mechanism (#668)`);

  // (iv) the 16 SHIPPED defaults keep a clean ladder in both OKHSL modes now that their controls bite:
  //      strictly descending measured L*, every swatch distinct, endpoints untouched.
  for (const mode of ["perceptual", "peak"]) for (const p of DEFAULTS) {
    const rows = T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift }, OK(mode), STOPS);
    for (let i = 1; i < rows.length; i++) if (rows[i].tone >= rows[i - 1].tone) {
      FAIL("skew-lift-okhsl", `(iv) ${mode} ${p.name} (skew ${p.skew} lift ${p.lift}): stop ${rows[i - 1].stop}->${rows[i].stop} did not descend (${rows[i - 1].tone.toFixed(6)} -> ${rows[i].tone.toFixed(6)})`);
      break;
    }
    const distinct = new Set(rows.map((r) => r.hex)).size;
    if (distinct < STOPS.length) FAIL("skew-lift-okhsl", `(iv) ${mode} ${p.name}: only ${distinct}/${STOPS.length} distinct swatches`);
    if (rows[0].hex !== "#FFFFFF") FAIL("skew-lift-okhsl", `(iv) ${mode} ${p.name}: stop 050 is ${rows[0].hex}, not white at lmax 100 — the warp must fix the endpoints`);
  }

  // (v) the stop-500 HUE ANCHOR survives the warp. The OKHSL hue is solved ONCE, at stop 500, against
  //     that stop's own saturation and lightness; the solve is now handed the lightness the WARPED ramp
  //     actually emits there, not the unwarped midpoint, so the solve and the emission can never describe
  //     different colors. The oklch-hue-anchor gate above locks the same property at skew 0 / lift 0 and
  //     says nothing about a warped ramp, which is the hole this fills.
  //
  //     Scoped to a SATURATED emission (measured CAM16 chroma >= 50) on purpose. okhslToRgb builds the
  //     color straight from the OKHSL hue ANGLE in OKLab, so the OKHSL->OKLCH hue map is exact before
  //     gamut clipping; the whole residual is clipping plus the 8-bit round, and a fixed ~0.0015-OKLab
  //     rounding error subtends an angle inversely proportional to the chroma it is measured at. Skew and
  //     lift deliberately drag stop 500 toward an end, where the ramp is PALE, so below that chroma the
  //     read-back is quantisation-bound (up to ~3° at an extreme grid corner, on both this construction
  //     and the unwarped one) and an angular budget would be measuring the 8-bit grid, not the anchor.
  //     Above it the shipped 1° budget holds: worst measured 0.41° across this grid (it was 0.79°
  //     when #647 wrote this note; #657 gave the OKHSL solver its best iterate instead of an unread
  //     last one, which halved the residual here without moving a single cell past the budget).
  //
  //     #668 WIDENED the hue probe rather than lowering the floor. Positioning the damping on the LIFTED
  //     stop makes a lifted stop 500 as muted as the lightness it now carries, so fewer warped cells clear
  //     chroma 50 than before  -  27 on the original 7 hues, under the 30 this check needs to mean anything.
  //     Lowering the floor would have bought the count by measuring the 8-bit grid instead of the anchor,
  //     which is the one thing the floor exists to prevent; five more hues buy it with saturated cells.
  {
    let anchored = 0;
    for (const [skew, lift] of [[40, 15], [-20, -5], [100, 0], [0, 40], [-100, -40], [50, 20]]) {
      for (const hue of [235, 267, 300, 27, 70, 145, 190, 0, 115, 210, 330, 55]) {
        for (const chroma of [60, 80, 100]) {
          for (const mode of ["perceptual", "peak"]) {
            const oc = OK(mode, { hueSpace: "oklch" });
            const s500 = T.paletteStops({ hue, chroma, skew, lift }, oc, STOPS).find((s) => s.stop === 500);
            if (s500.chroma < 50) continue;                    // quantisation-bound — see the note above
            anchored++;
            const err = angDiff(rgbToOklchHue(s500.rgb), hue);
            if (err > 1.0) FAIL("skew-lift-okhsl", `(v) ${mode} hue ${hue} chroma ${chroma} skew ${skew} lift ${lift}: stop 500 exports OKLCH hue off by ${err.toFixed(2)}° (>1°, at measured chroma ${s500.chroma.toFixed(0)} — the anchor did not survive the warp)`);
          }
        }
      }
    }
    if (anchored < 30) FAIL("skew-lift-okhsl", `(v) only ${anchored} warped cells cleared the chroma floor — the check has gone vacuous, lower the floor or raise the probe chroma`);
  }

  // (vi) the warp stays PURE in the single stop value: the 19-stop display ramp and the 25-stop export
  //      ramp must still agree at every shared stop (no whole-ramp renormalisation crept in).
  for (const p of DEFAULTS) for (const mode of ["perceptual", "peak"]) {
    const pal = { hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift };
    const d19 = T.paletteStops(pal, OK(mode), T.STOPS);
    const d25 = T.paletteStops(pal, OK(mode), T.EXPORT_STOPS);
    for (const r of d19) {
      const m = d25.find((x) => x.stop === r.stop);
      if (m.hex !== r.hex) { FAIL("skew-lift-okhsl", `(vi) ${mode} ${p.name}: stop ${r.stop} is ${r.hex} on the 19-stop ramp but ${m.hex} on the 25-stop ramp`); break; }
    }
  }
}

// ── hpg-tonal-chroma-envelope (#681 U3, C6/C7, ramp-shape gates per plan rev7/rev8): the single
//    chromaEnvelope shared by the "even" path (evenChroma) and the OKHSL path (okhslStops)  -  the two
//    separately-typed damping copies ("m") the plan set out to unify (#647/#668). C7 is mechanical
//    (grep-shaped, read from source so a refactor that moves the call sites trips it rather than a stale
//    hardcoded count). C6 replaced its original sub-pixel magnitude bar (rev7: "a chroma cliff repair
//    moves more than one 8-bit channel, so a sub-pixel bar is unsatisfiable") with ramp-shape gates:
//    (i) zero measured-L* upticks, (ii) zero duplicate hexes, both over the FULL 3,780-palette corpus
//    (343 presets + the 16 role-table defaults, no chroma floor  -  an earlier draft of this gate filtered
//    to chroma >= 10, inherited from the retired magnitude bar's own corpus definition, which hid the
//    named Varanger witness at chroma 6 and 6 more of the same class), on BOTH the 19-stop display ramp
//    and the 25-stop export ramp, in all three tone modes.
//
//    RENDERED PATH, not a raw-chroma proxy (fixed after review pass 1; the anchor field fixed U4 pass 2
//    addendum 2, below): each ramp is built through `rampChromaOf(pal, doc)`  -  the SAME resolved-chroma
//    call `src/ui/model.mjs`'s `projectView` makes at line ~913, after `resolvePaletteGroups`  -  plus the
//    palette's own `hueShift`/`hueSameDir`/`cuspPull`/`anchor`. The `anchor` field was MISSING from all
//    four of this section's `paletteStops` calls until U4 pass 2 (addendum 2): every one of them built a
//    fresh palette object from `pal.hue`/`chroma`/`skew`/`lift`/... but never copied `pal.anchor`, so
//    every ramp here rendered on the non-anchored construction regardless of whether the source preset is
//    anchored - a silent version of the SAME fault class the duplicate `chromaEnvelope` export and the
//    OKHSL/CIE-L* `referenceNonAnchored` mismatch already caught elsewhere in this ticket: the RENDERED
//    PATH claim above was true of `rampChromaOf` but false of `anchor`, and this file asserted the whole
//    claim on the strength of the one field it actually checked. See the U4 pass 2 handoff for the
//    corrected counts. A palette's raw stored `chroma` is NOT what most ramps render at: 3,777 of the 3,780
//    corpus palettes differ between the two, and the gap is not noise (architecture "The Barbican
//    Estate · 1976 · C" primary: raw chroma 33, resolved ramp chroma 100). Proof this matters: pointed
//    at the pre-U3 base (362cc48) the RAW-chroma method reports 0 upticks in every mode; the RENDERED
//    method on the same base reports 11 perceptual (worst +0.5105 L*) and 46 peak (worst +0.8312 L*)
//    AFFECTED PALETTES on the 25-stop export ramp (43 peak on the 19-stop display ramp), reproducing
//    the plan's own #668 figures exactly, named witnesses included. The gate's own `upticks` counters
//    below sum BOTH stop sets, so they print 22 perceptual and 89 peak (GATECOUNTER), not 11/46  -  the
//    two figures answer different questions (palettes-affected-on-one-ramp vs. total-ramps-flagged
//    across both) and are not a typo of one another. Only the rendered method is a real gate; keep it
//    that way.
{
  // C7  -  mechanical. One definition, five total appearances (#681 U4 integration: U3 alone shipped 2
  // call sites, one per NON-anchored path's precomputed envelopeAt map (paletteStops, okhslStops); U2's
  // anchored branches (paletteStopsAnchored, okhslStopsAnchored) now route through the SAME shared
  // function too (the re-diagnosis's Finding 1/9 seam fix), adding 2 more call sites - one per anchored
  // path, same "computed once" shape, same function - so the true integrated total is 1 def + 4 calls,
  // not U3-alone's 1 + 2. Still exactly one shared function, still zero forked copies: that is what C7's
  // "both paths share one envelope" actually asserts, and it now reads as four paths (anchored/
  // non-anchored x CIE-L*/OKHSL), all four the same function. Zero of the old two-argument dampAmp
  // expression, unchanged.
  const src = readFileSync(new URL("../../src/engine/tonal.js", import.meta.url), "utf8");
  const defCount = (src.match(/export function chromaEnvelope\(/g) || []).length;
  const callCount = (src.match(/chromaEnvelope\(/g) || []).length;
  const staleCount = (src.match(/1 \+ \(\(controls\.dampAmp/g) || []).length;
  if (defCount !== 1) FAIL("chroma-envelope", `(C7) chromaEnvelope must be defined exactly once, found ${defCount}`);
  if (callCount !== 5) FAIL("chroma-envelope", `(C7) chromaEnvelope must appear exactly 5 times total (1 definition + 4 call sites: paletteStopsAnchored, paletteStops, okhslStopsAnchored, okhslStops), found ${callCount}`);
  if (staleCount !== 0) FAIL("chroma-envelope", `(C7) the old two-copy "1 + ((controls.dampAmp" expression must be fully gone, found ${staleCount}`);

  // C7 negative control (U4 review pass 1, F5: the handoff claimed this control existed; it did not
  // - this is the real thing). Deletes ONE call site's text from a SCRATCH COPY of the source string
  // (never written to disk, never re-imported - this is a text-level check of the grep itself, not a
  // behavioural one) and re-runs the SAME two regexes the real gate above uses. Proves the count-5
  // assertion actually reds when a real call site goes missing, not merely that today's source happens
  // to contain 5. This does NOT prove the grep would catch a differently-shaped regression (e.g. a
  // second copy of the envelope formula inlined under another name, which no text-count of the literal
  // identifier `chromaEnvelope(` can ever see) - that limitation is real and is not what this control
  // claims to cover.
  {
    const target = "chromaEnvelope(stop, 500, lift, controls)"; // paletteStops's own non-anchored call site text (tonal.js:749)
    const scratchSrc = src.replace(target, "1 /* call site removed for negative control */");
    if (scratchSrc === src) FAIL("chroma-envelope", "(C7 negative control) the patch target string was not found - paletteStopsAnchored's call site text moved, update this control");
    const scratchCallCount = (scratchSrc.match(/chromaEnvelope\(/g) || []).length;
    if (scratchCallCount >= 5) FAIL("chroma-envelope", `(C7 negative control) DID NOT bite: deleting one call site's text left the count at ${scratchCallCount} (want < 5) - the grep cannot discriminate a missing call site`);
  }

  // C6  -  env(anchor)=1 for EVERY damp/dampCurve/dampAmp/dampBias/lift combination, not only lift 0
  // (R2: sd measured against `liftStop(anchorStop, lift)`, the anchor's own lifted reading, closes the
  // gap the first draft left  -  Q1 in .sdlc/questions/pif-u3.md, superseded first read kept for the
  // record). This is the property the old dampAmp term broke (Q7: a mid-tone "boost" that landed ON the
  // anchor itself, the 144%-of-source defect C6 exists to close).
  for (const damp of [0, 40, 70, 80, 100]) for (const dampCurve of [0.5, 1.5, 3]) for (const dampAmp of [0, 55, 100]) for (const dampBias of [-50, 0, 50]) for (const lift of [-40, -20, 0, 20, 40]) {
    const v = T.chromaEnvelope(500, 500, lift, { damp, dampCurve, dampAmp, dampBias });
    if (Math.abs(v - 1) > 1e-9)
      FAIL("chroma-envelope", `(C6) env(anchor, lift ${lift}) = ${v} != 1 for damp ${damp} dampCurve ${dampCurve} dampAmp ${dampAmp} dampBias ${dampBias}`);
  }

  // C6 (i)/(ii), measured over the curated corpus (343 presets, all 3,780 palettes, no chroma floor)
  // plus the 16 role-table defaults  -  not the synthetic grid above, which proves the MECHANISM; this
  // proves the SHIPPED content, on both the 19-stop display ramp and the 25-stop export ramp per rev8.
  // ONE substitution point (#713 U2, design section): FULL sweeps every category's PRESETS in full;
  // SAMPLED draws the shared seeded canary (test/engine/lib/corpus-sample.mjs) instead. Every sweep and
  // in-file control downstream of `docs` reads this one list  -  a sweep is never skipped when sampled,
  // it runs on fewer documents.
  const CATS = ["architecture", "brands", "cuisine", "film", "literature", "music", "nature", "travel"];
  const byCategory = {};
  for (const slug of CATS) {
    const { PRESETS } = await import(`../../src/ui/categories/${slug}.js`);
    if (!Array.isArray(PRESETS) || !PRESETS.length) FAIL("chroma-envelope", `category "${slug}" exposed no PRESETS, gen:categories did not run, or the mirror moved`);
    byCategory[slug] = PRESETS;
  }
  const all = CATS.flatMap((slug) => (byCategory[slug] || []).map((p) => ({ ...p, category: slug })));
  const presets = FULL ? all : sampleCorpus(byCategory);
  const docs = [];
  for (const preset of presets) {
    const d = hydrate({ ...preset });
    d.__presetName = preset.name; // C6 "0 above 100%" carve-out below needs the preset's own name
    docs.push(d);
  }
  // vacuity guard: this gate (and every sweep below reading `docs`) is only worth its runtime if it
  // measured what it claims to (#713 design section).
  const docPalettes = docs.reduce((a, d) => a + (d.palettes ? d.palettes.length : 0), 0);
  if (FULL) {
    if (docs.length < 343) FAIL("chroma-envelope", `(vacuity) FULL measured only ${docs.length} curated documents, expected at least 343 (the corpus shrank or an import failed silently)`);
    if (docPalettes < 3780) FAIL("chroma-envelope", `(vacuity) FULL measured only ${docPalettes} palettes, expected at least 3780`);
  } else if (docs.length < 30) {
    FAIL("chroma-envelope", `(vacuity) SAMPLED measured only ${docs.length} curated documents, expected at least 30`);
  }
  CORPUS_DOC_COUNT = docs.length;
  CORPUS_PALETTE_COUNT = docPalettes;
  const upticks = { perceptual: 0, peak: 0, even: 0 };
  const upWitness = { perceptual: "", peak: "", even: "" };
  const dupCount = { perceptual: 0, peak: 0, even: 0 };
  const dupWitness = { perceptual: [], peak: [], even: [] };

  // KNOWN_BASELINE_DUP  -  a named, cited exception list for a duplicate-hex ramp the shipped engine
  // cannot yet avoid, keyed by mode|hue|chroma|skew|lift|stop-set|stopA&stopB (chroma and the stop-set
  // label both added after review pass 1: a key without them lets palettes sharing a hue/skew/lift
  // signature but a DIFFERENT chroma silently share one exception). Measured on the RENDERED path
  // (rampChromaOf, not raw palette.chroma  -  see this gate's own header comment).
  //
  // Addendum-2 correction (2026-09-19): the previous "0 across all three tone modes" claim recorded
  // here was measured with `check()` omitting `anchor: pal.anchor` from the constructed palette  -  the
  // same missing-anchor bug addendum 2 found in `findDips`  -  so it never actually rendered an anchored
  // palette's real ramp. With the anchor field restored, the rendered path carries exactly 23 such pairs
  // (3 perceptual, 7 peak, 13 even), all on the 25-stop export set only (0 on the 19-stop display set),
  // all at the near-white (stops 50-200) or near-black (stops 800-925) extreme: an adjacent half-step
  // pair (e.g. 900&925, 50&75) rounds to the identical 8-bit hex once the anchored ramp is already at
  // the sRGB gamut boundary there, the same class of rounding collision `enforceMonotonePixelL`'s own
  // header comment describes for pixel-L* rises, just landing on an exact hex match instead of a sign
  // flip. 21 unique keys named below (23 physical instances: two keys are each hit by two different
  // presets that happen to share the identical mode/hue/chroma/skew/lift/stop-pair signature, so the
  // Set naturally collapses them to one entry each  -  `seenBaselineDup` still marks the key seen either
  // way). The negative control right after this gate still proves an UNLISTED collision is caught.
  // Ticket #739 adds 2 more unique keys (both Nike tertiary-muted, peak mode - see their own comment
  // below), for 23 unique / 25 physical.
  const KNOWN_BASELINE_DUP = new Set([
    "peak|240|100.00|0|0|25-stop|825&850",
    "even|240|100.00|0|0|25-stop|900&925",
    "even|0|100.00|0|0|25-stop|50&75",
    "even|0|100.00|0|0|25-stop|100&125",
    "even|0|100.00|0|0|25-stop|175&200",
    "even|79|100.00|0|0|25-stop|75&100",
    "even|280|100.00|0|0|25-stop|850&875",
    "peak|280|100.00|0|0|25-stop|800&825",
    "peak|150|100.00|0|0|25-stop|825&850",
    "perceptual|270|100.00|0|0|25-stop|800&825",
    "peak|270|100.00|0|0|25-stop|800&825",
    "even|250|100.00|0|0|25-stop|900&925",
    "even|92|100.00|0|0|25-stop|75&100",
    "peak|78|100.00|0|0|25-stop|850&875",
    "even|100|100.00|0|0|25-stop|900&925",
    "even|60|100.00|0|0|25-stop|900&925",
    "perceptual|65|100.00|0|0|25-stop|800&825",
    "even|65|100.00|0|0|25-stop|900&925",
    "peak|80|100.00|0|0|25-stop|875&900",
    "perceptual|80|100.00|0|0|25-stop|800&825",
    "peak|80|100.00|0|0|25-stop|800&825",
    // Ticket #739: Nike tertiary-muted (hue 0, the generator's hueless-sample fallback; anchor
    // #FFFFFF, resolved chroma 100.00 on this group) now renders its ramp at the palette's OWN hue
    // instead of the anchor's rounding-residue one - two adjacent near-white peak-mode stops round to
    // the identical 8-bit hex at that hue where they did not before, the same rounding-collision class
    // every other member of this list already names. A mechanical re-freeze, not a new construction
    // defect (U1-4 proves every OTHER anchored ramp in the corpus byte-identical).
    "peak|0|100.00|0|0|25-stop|75&100",
    "peak|0|100.00|0|0|25-stop|150&175",
  ]);
  const seenBaselineDup = new Set();

  const check = (pal, doc, mode, stops, setLabel) => {
    const controls = { curve: doc.curve, tension: doc.tension, lmin: doc.lmin, lmax: doc.lmax, damp: doc.damp, dampCurve: doc.dampCurve, dampAmp: doc.dampAmp, dampBias: doc.dampBias, hueSpace: doc.hueSpace, relChroma: doc.relChroma, chromaFloor: doc.chromaFloor, vibrancy: doc.vibrancy, toneMode: mode };
    const chroma = rampChromaOf(pal, doc); // the RESOLVED chroma the product renders with, not pal.chroma
    const ramp = T.paletteStops(
      { hue: pal.hue, chroma, skew: pal.skew, lift: pal.lift, hueShift: pal.hueShift ?? 0, hueSameDir: pal.hueSameDir === true, cuspPull: pal.cuspPull, anchor: pal.anchor },
      controls,
      stops,
    );
    for (let i = 1; i < ramp.length; i++) if (ramp[i].tone > ramp[i - 1].tone) {
      upticks[mode]++;
      if (!upWitness[mode]) upWitness[mode] = `${setLabel} hue ${pal.hue} chroma ${chroma.toFixed(2)} skew ${pal.skew} lift ${pal.lift}: stop ${ramp[i - 1].stop}->${ramp[i].stop} (${ramp[i - 1].tone.toFixed(4)} -> ${ramp[i].tone.toFixed(4)})`;
      break;
    }
    const seen = new Map();
    for (const r of ramp) {
      if (seen.has(r.hex)) {
        const key = `${mode}|${pal.hue}|${chroma.toFixed(2)}|${pal.skew}|${pal.lift}|${setLabel}|${seen.get(r.hex)}&${r.stop}`;
        if (KNOWN_BASELINE_DUP.has(key)) { seenBaselineDup.add(key); continue; }
        dupCount[mode]++;
        dupWitness[mode].push(`${setLabel} hue ${pal.hue} chroma ${chroma.toFixed(2)} skew ${pal.skew} lift ${pal.lift}: stop ${seen.get(r.hex)}&${r.stop} duplicates ${r.hex} (key ${key})`);
      }
      seen.set(r.hex, r.stop);
    }
  };

  for (const doc of docs) {
    for (const pal of doc.palettes) {
      for (const mode of ["perceptual", "peak", "even"]) {
        check(pal, doc, mode, T.STOPS, "19-stop");
        check(pal, doc, mode, T.EXPORT_STOPS, "25-stop");
      }
    }
  }
  const roleDoc = defaultDocument();
  for (const p of roleDoc.palettes) {
    for (const mode of ["perceptual", "peak", "even"]) {
      check(p, roleDoc, mode, T.STOPS, "19-stop");
      check(p, roleDoc, mode, T.EXPORT_STOPS, "25-stop");
    }
  }
  // (i) perceptual, peak, even  -  zero measured CIELAB L* upticks, whole corpus, both stop sets, on the
  // RENDERED chroma (see this gate's header comment for why raw palette.chroma is not the shipped ramp).
  if (upticks.perceptual) FAIL("chroma-envelope", `(C6 i) perceptual: ${upticks.perceptual} rise(s), e.g. ${upWitness.perceptual}`);
  if (upticks.peak) FAIL("chroma-envelope", `(C6 i) peak: ${upticks.peak} rise(s), e.g. ${upWitness.peak}`);
  if (upticks.even) FAIL("chroma-envelope", `(C6 i) even: ${upticks.even} rise(s), e.g. ${upWitness.even}`);
  // (ii) no duplicate hex beyond KNOWN_BASELINE_DUP (currently empty  -  see that Set's own comment).
  if (dupCount.perceptual) FAIL("chroma-envelope", `(C6 ii) perceptual: ${dupCount.perceptual} duplicate-hex pair(s) beyond the cited list, e.g. ${dupWitness.perceptual[0]}`);
  if (dupCount.peak) FAIL("chroma-envelope", `(C6 ii) peak: ${dupCount.peak} duplicate-hex pair(s) beyond the cited list, e.g. ${dupWitness.peak[0]}`);
  if (dupCount.even) FAIL("chroma-envelope", `(C6 ii) even: ${dupCount.even} duplicate-hex pair(s) beyond the cited list, e.g. ${dupWitness.even[0]}`);
  // exact both ways under FULL (a name it cannot still reach is stale); a SAMPLED run only sees a
  // subset of the corpus, so a cited name it never visits is not a failure there (#713 design section).
  if (FULL && seenBaselineDup.size !== KNOWN_BASELINE_DUP.size) {
    const missing = [...KNOWN_BASELINE_DUP].filter((k) => !seenBaselineDup.has(k));
    FAIL("chroma-envelope", `(C6 ii) ${missing.length} of the ${KNOWN_BASELINE_DUP.size} cited baseline duplicates were not observed this run (${missing.join(", ")})  -  either fixed (remove from the list, tighten C6 ii toward 0) or the corpus changed under it (re-diagnose before loosening further)`);
  }

  // (iii) C6 "0 above 100%" (Q7 reading a: emitted CAM16 chroma at ANY stop over stop 500's own), for
  // GENERATED palettes (dampAmp 0). #681 U3 pass 3 fixed the even path (paletteStops caps every stop's
  // chroma at the anchor's own); pass 5 restores the OKHSL-path fix for PEAK ONLY, per the owner's
  // ruling on Q7 pass-4: peak is already defined to center richness at 500 (hpg-tonal-okhsl-modes), so
  // capping it there is consistent, not in tension. Perceptual is DELIBERATELY left off this exact-zero
  // check  -  it keeps #55's cusp-pull richness untouched, per the owner's ruling (f) on Q7 pass-5 (below,
  // (iii-b)): NO ramp change for perceptual, a different, bounded clause instead.
  //
  // ADIA_CARVEOUT  -  the ONE named, owner-ruled exception (2026-09-18): an AUTHORED dampAmp>0 override is
  // exempt from "0 above 100%" by NAME, not by "any dampAmp>0" (that would silently exempt a future
  // second override too) and not by count (a NEW violator under this exact name would still fail the
  // gate below unless the count is re-verified)  -  the negative control proves an UNLISTED dampAmp>0
  // preset is still caught.
  const ADIA_CARVEOUT = new Set(["Adia · The product's own design system"]);
  // `engine` (#681 U3 review 3, N4): defaults to the real, imported `T`, but takes any module with the
  // SAME `paletteStops`/`STOPS` shape  -  so a negative control can run this EXACT check function against
  // a patched copy of the engine, instead of reimplementing the check inline (which would drift from
  // this function's own logic and stop testing it at all).
  const above100Violators = (doc, toneMode, engine = T) => {
    const out = [];
    // U3 review 2 (F2): this used to return [] early for EVERY generated (dampAmp 0) doc  -  exactly the
    // population "0 above 100%" is FOR  -  so the gate below only ever saw Adia and the scratch negative
    // control, and could never fail on a real cap regression (the reviewer scoped the peak cap to
    // `lift === 0` in a scratch copy and reproduced 1,487 violators while this gate still exited 0).
    // Removing the early return: measured 0 generated violators on the shipped engine (even and peak,
    // both stop sets), so the gate stays green here; the lift-scoped regression is now this line's own
    // negative control, added below.
    for (const pal of doc.palettes) {
      const controls = { curve: doc.curve, tension: doc.tension, lmin: doc.lmin, lmax: doc.lmax, damp: doc.damp, dampCurve: doc.dampCurve, dampAmp: doc.dampAmp, dampBias: doc.dampBias, hueSpace: doc.hueSpace, relChroma: doc.relChroma, chromaFloor: doc.chromaFloor, vibrancy: doc.vibrancy, toneMode };
      const chroma = rampChromaOf(pal, doc);
      // NOT anchor: pal.anchor here (addendum-2 investigation, 2026-09-19) - adding it measures the
      // real rendered path, but that surfaces that "0 above the anchor's own chroma" essentially never
      // holds for an anchored palette: 1,205/3,380 anchored generated palettes violate it on even,
      // 3,119/3,380 (92%) on peak, versus 0/384 non-anchored violators on either mode. The anchor's raw
      // chroma (stop 500's pinned value in paletteStopsAnchored) has no designed relationship to the
      // rest of the ramp - unlike the non-anchored construction this invariant was built and owner-ruled
      // against (Q7 pass 4/5), where stop 500 IS the ramp's own peak by construction. This is reported as
      // its own finding pending a scope ruling (most likely resolution: carve out anchored palettes here
      // the same way perceptual is already carved out above, for the analogous reason) - see the pass 2
      // handoff and questions docs. Left on the non-anchored measurement until that ruling lands, so this
      // gate keeps testing the invariant it was actually built and reviewed for.
      const ramp = engine.paletteStops({ hue: pal.hue, chroma, skew: pal.skew, lift: pal.lift, hueShift: pal.hueShift ?? 0, hueSameDir: pal.hueSameDir === true, cuspPull: pal.cuspPull }, controls, engine.STOPS);
      const c500 = ramp.find((r) => r.stop === 500).chroma;
      if (c500 <= 1e-9) continue;
      if (ramp.some((r) => r.chroma > c500 + 1e-6)) out.push(pal.name);
    }
    return out;
  };
  for (const toneMode of ["even", "peak"]) {
    const unlisted = [];
    for (const doc of docs) {
      const v = above100Violators(doc, toneMode);
      if (v.length && !ADIA_CARVEOUT.has(doc.__presetName)) unlisted.push(`${doc.__presetName}/${v[0]}`);
    }
    if (unlisted.length) FAIL("chroma-envelope", `(C6 iii) ${toneMode}: ${unlisted.length} above-100% instance(s) from an UNLISTED preset (not the named Adia carve-out), e.g. ${unlisted[0]}`);
    const adiaHit = docs.some((doc) => ADIA_CARVEOUT.has(doc.__presetName) && above100Violators(doc, toneMode).length > 0);
    if (!adiaHit) FAIL("chroma-envelope", `(C6 iii) ${toneMode}: the named Adia carve-out produced ZERO above-100% instances  -  either the carve-out is stale (Adia's own dampAmp no longer needs it, tighten toward 0) or the corpus dropped that preset; re-diagnose before touching ADIA_CARVEOUT`);

    // Negative control: a SCRATCH copy of a NON-Adia doc with dampAmp forced to 70 (an authored-style
    // override, matching Adia's own magnitude) must be caught as UNLISTED by the SAME check above  -
    // proves the carve-out really is keyed on the one named preset, not on "any dampAmp>0". In-memory
    // only, built from the already-loaded corpus; never reads origin/main at runtime.
    // #713 U2: `docs` can be empty (a SAMPLED corpus with every category's `vol` stripped, or the
    // vacuity guard's own probe), guarded so the vacuity FAIL above stays the reported failure
    // instead of an unhandled TypeError on `docs[0]` pre-empting it.
    if (!docs.length) {
      FAIL("chroma-envelope", `(C6 iii negative control) ${toneMode}: docs is empty, no probe document available to patch`);
    } else {
      const scratchDoc = { ...docs[0], dampAmp: 70, __presetName: "Scratch · not a real preset (negative control)" };
      const v = above100Violators(scratchDoc, toneMode);
      if (v.length === 0) FAIL("chroma-envelope", `(C6 iii negative control) ${toneMode}: scratch dampAmp:70 preset (based on ${docs[0].__presetName}) produced no above-100% instance to catch  -  pick a different probe doc`);
      else if (ADIA_CARVEOUT.has(scratchDoc.__presetName)) FAIL("chroma-envelope", `(C6 iii negative control) ${toneMode}: scratch preset name collided with ADIA_CARVEOUT  -  rename the probe`);
    }
    // else: correctly NOT in ADIA_CARVEOUT, so the same logic that built `unlisted` above would catch
    // it  -  this control doesn't re-run that loop, it just confirms the scratch doc IS a live violator
    // (checked above) that ISN'T named in the carve-out (checked here), which is what "reds as unlisted"
    // requires of it.
  }

  // Negative control for F2 itself (U3 review 2, wiring fixed U3 review 3 N4): proves the
  // CHROMA-ENVELOPE CLAUSE ITSELF  -  not a hand-rolled reimplementation of it  -  reds on a real peak-cap
  // regression. Dynamically imports a PATCHED copy of the real engine (relative imports rewritten to
  // absolute file:// so a data: URL module can resolve them; nothing on disk, nothing committed) with
  // the peak cap's condition narrowed to `palette.lift === 0`, the reviewer's own repro shape. Runs the
  // SAME `above100Violators` function this gate itself calls (passed the patched module as `engine`,
  // not a second, independently-written check that could silently drift from the real one and stop
  // proving anything about it)  -  on the shipped engine every generated peak palette is checked (F2's
  // fix); on this patched copy every lift != 0 generated peak palette loses its cap, so this must find
  // real, unlisted violators.
  {
    const realSrc = readFileSync(new URL("../../src/engine/tonal.js", import.meta.url), "utf8");
    const hctUrl = new URL("../../src/engine/hct.js", import.meta.url).href;
    const okhslUrl = new URL("../../src/engine/okhsl.js", import.meta.url).href;
    const patched = realSrc
      .replace('from "./hct.js"', `from "${hctUrl}"`)
      .replace('from "./okhsl.js"', `from "${okhslUrl}"`)
      .replace(
        'if (mode === "peak" && dampAmp === 0 && chroma > anchorChroma + 1e-6) {',
        'if (mode === "peak" && dampAmp === 0 && palette.lift === 0 && chroma > anchorChroma + 1e-6) {'
      );
    if (patched === realSrc) FAIL("chroma-envelope", "(C6 iii negative control, peak cap) the patch target string was not found  -  the peak cap's condition text moved, update this control");
    const PatchedT = await import(`data:text/javascript;base64,${Buffer.from(patched).toString("base64")}`);
    let lifted = 0;
    for (const doc of docs) {
      if ((doc.dampAmp ?? 0) !== 0) continue; // generated palettes only, matching (iii)'s own scope
      if (!doc.palettes.some((p) => p.lift)) continue; // the patch only strips the cap for lift != 0
      if (above100Violators(doc, "peak", PatchedT).length > 0) { lifted++; break; }
    }
    if (lifted === 0) FAIL("chroma-envelope", "(C6 iii negative control, peak cap) the lift-scoped patched engine produced ZERO above-100% instances  -  this control no longer exercises the cap, pick a different probe");
  }

  // (iv) Dip gate (#681 U3 review 2, F1; extended to even U3 review 3, N1): the peak cap's pre-fix bugs
  // (an undershooting bisection exit, a fallback that locked in that undershoot via
  // Math.min(chroma, target), and an Abney-drifted fallback/polish hue) produced 221 "dip" ramps across
  // the generated corpus: an interior stop at least 3 CAM16 C below BOTH neighbours, a visible notch in
  // an otherwise smooth ramp. F1's fix (24-step bisection tracking the best-seen candidate, a
  // target-direct fallback, solveCam16Hue-corrected polish hue) reduced this to 6, at or under the
  // reviewer's own cited cap-OFF baseline of 7.
  //
  // Baselines are keyed `preset|palette|stop` (#681 U3 review 3, N5), not just `preset/palette`, so a
  // NEW dip at a DIFFERENT stop on an already-listed palette still reds as unlisted, rather than being
  // silently absorbed by a name-only match.
  //
  // Addendum-2 correction (2026-09-19): the "6 named peak-mode witnesses left after F1's fix" and the
  // pass-1 "genuinely, fully resolved" reading of this population were both measured with `findDips`
  // omitting `anchor: pal.anchor`  -  never rendering an anchored palette's real ramp, the same bug
  // addendum 2 found here. All 6 named witnesses below carry a real anchor. Re-run through the corrected,
  // anchor-aware `paletteStops` call: NONE of the 6 dip any more (checked directly, both stop sets -
  // e.g. Katsura tertiary stop 600 now reads 20.04/21.30/21.53, rising, not a dip), and a full peak-mode
  // sweep of the generated corpus finds ZERO dip instances anywhere, not just at these 6 names. This is
  // a genuinely different, better-supported result than pass 1's claim (which measured a ramp the
  // product never renders), but the mechanism is not the same as F1's bisection fix alone: these
  // specific presets' REAL anchored ramps (their own picked anchor color driving `paletteStopsAnchored`)
  // do not reproduce the dip the old non-anchored measurement saw. DIP_BASELINE was retired to empty
  // rather than kept with stale names now unreachable by any real corpus ramp; any peak dip that
  // reappears on a future engine change reds immediately (baseline size 0 then, so every instance was
  // unlisted). Perceptual has no cap mechanism and measures 0 dips too, so it also gets no baseline.
  // Ticket #739 adds the ONE named exception below - see its own comment; the "reds on anything
  // unlisted" property is unchanged, only the empty baseline is not.
  const TICKET_739_DIP = "67° N · January · 03:00 · The Helsinki–Rovaniemi night train, somewhere past Oulu|secondary-muted|500";
  // Ticket #739: #ACADAE (this preset's own anchor, one of the two corpus anchors under
  // ACHROMATIC_ANCHOR_C) now renders its ramp at the palette's own hue instead of its rounding-
  // residue one. That shifts `anchorChromaBasis`'s per-stop blend against `maxChromaInGamut` enough
  // for stop 500 to dip below both 450 and 550 - the same pivot-notch mechanism EVEN_DIP_BASELINE's
  // own header describes (32 of its 90 instances), on both the peak and perceptual paths this time
  // (okhslStopsAnchored shares the same blend for both modes; only their curve/damping fitting
  // differs). Root-caused, not reintroducing the retired peak population above; PERCEPTUAL_DIP_BASELINE
  // below is the same single name because perceptual had no baseline (0 dips) before this ticket.
  const DIP_BASELINE = new Set([TICKET_739_DIP]);
  const PERCEPTUAL_DIP_BASELINE = new Set([TICKET_739_DIP]);
  // EVEN_DIP_BASELINE: addendum-2 correction (2026-09-19). The 53 names previously here (#681 U3
  // review 3, N1, all at stop 350, all pending owner - the `chromaFloor`-vs-damped-value crossing
  // described below, kept for its own record) were measured with `findDips` omitting
  // `anchor: pal.anchor`, the same bug addendum 2 found and fixed. On the corrected, anchor-aware
  // path NONE of those 53 still dip (checked directly - e.g. "Katsura Imperial Villa" primary no
  // longer dips at 350: stop 300 30.93 -> 350 28.77 -> 400 15.48, and 28.77 is not <= 30.93-3, so the
  // OLD predicate no longer fires there either), so that population is superseded, not merely renamed.
  // The chromaFloor/maxc crossing mechanism that produced it is still real engineering history (see
  // `.sdlc/questions/pif-u3-yield.md`'s second item) but is not what the rendered corpus shows today.
  //
  // The corrected sweep instead finds 90 dip instances, all clustered at stops 450 (57), 500 (32), and
  // 550 (1) - i.e. at or immediately beside the anchor pivot (`ANCHOR_STOP = 500`). Mechanism: at stop
  // 500, `paletteStopsAnchored` (src/engine/tonal.js) pins chroma to the anchor's own byte-exact
  // measured CAM16 chroma unconditionally (the Q3(b) "ramp clamps" special case, not fit to any smooth
  // curve); every OTHER stop, including its immediate neighbours 450/550, is built from
  // `anchorChromaBasis`'s blend of the anchor's OWN relative chroma fraction against the group's
  // resolved target, evaluated at THAT stop's own gamut ceiling (`maxChromaInGamut`). Because the
  // gamut ceiling's shape does not track the anchor's raw chroma 1:1 between stops, a sufficiently
  // dark or desaturated anchor produces a real local minimum either AT the pivot (32 instances - the
  // anchor's raw chroma reads lower than both neighbours' blended values, a "notch" at the pivot
  // itself - same family as `NOTCH_ALLOW` in anchor.mjs, different gate/predicate) or at the stop
  // immediately below it (57 instances at 450 - the blend is still heavily weighted toward the
  // anchor's own low relative fraction there, undershooting stop 400's higher, less anchor-weighted
  // value), confirmed directly on "Katsura Imperial Villa" primary (anchor #282322, near-black): stops
  // 450/500/550 read 6.30/2.88/6.30, a symmetric pivot notch. All 90 named below; the negative control
  // right after this gate still proves an amplified-floor regression is caught.
  const EVEN_DIP_BASELINE = new Set([
    "10° N · August · 16:00 · Fort Kochi, the hour between two squalls|secondary|450",
    "13° S · June · 09:00 · Plaza de Armas, Cuzco, in dry-season winter|primary|450",
    "16° N · March · 17:00 · Bogyoke Aung San Market, Yangon, last hour before closing|primary|450",
    "16° N · March · 17:00 · Bogyoke Aung San Market, Yangon, last hour before closing|secondary|450",
    "20° S · July · 10:00 · The Skeleton Coast in dense Atlantic fog, near Cape Cross|primary|450",
    "21° N · May · 02:00 · Hanoi Old Quarter, the hour after the pho stalls close|tertiary|450",
    "22° N · January · 11:00 · Sapa Sunday market, Lào Cai Province, cold mountain fog|primary|500",
    "23° S · December · 13:00 · Salar de Atacama edge, Atacama Desert, Chile|secondary|500",
    "23° S · December · 16:20 · Salar de Atacama, 2,305 m|secondary|500",
    "26° N · June · 18:30 · The shrine of Lal Shahbaz Qalandar, Sehwan, at the evening dhamaal|tertiary-muted|500",
    "27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche|primary-muted|450",
    "30° N · March · 16:00 · Wadi Rum, the Jebel Khazali wall in late afternoon|primary-muted|450",
    "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat|secondary-muted|500",
    "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat|tertiary|500",
    "31° N · June · 15:00 · Yixing teapot district during the plum-rain season|primary|450",
    "34° N · May · 04:30 · The corridor of torii at Fushimi Inari before opening hour|tertiary-muted|500",
    "37° N · May · 00:00 · A Patmos Greek Orthodox church, Easter Saturday at midnight|secondary-muted|500",
    "41° N · April · 09:00 · La Boqueria, Barcelona, just past opening on a Tuesday|primary|450",
    "41° N · July · 20:30 · The Great Salt Lake at sunset, near Antelope Island causeway|tertiary-muted|500",
    "41° N · October · 23:00 · Tbilisi viewed from the Mtatsminda funicular at the upper station|secondary|500",
    "44° N · September · 12:00 · Grand Prismatic Spring, Yellowstone, Wyoming|secondary-muted|450",
    "48° N · November · 11:30 · The Schwarzwald between St. Märgen and Hinterzarten, low cloud through the spruce|primary|450",
    "48° N · November · 18:50 · A wet evening in a Viennese kaffeehaus, Mariahilf|secondary-muted|500",
    "4° N · April · 13:00 · Dipterocarp forest, Danum Valley, Borneo|primary|450",
    "51° N · May · 09:00 · English oak woodland, Sussex, bluebell season|primary|500",
    "51° S · November · 07:00 · Torres del Paine, Patagonian Andes, Chile|primary|450",
    "55° N · July · 13:00 · Lowland Kamchatkan taiga in heavy mosquito season, near the Avacha river|tertiary-muted|500",
    "59° N · January · 14:00 · Lake Baikal corridor|primary|500",
    "A Streetcar Named Desire · Tennessee Williams · 1947 · the French Quarter flat|primary|450",
    "Alice's Adventures in Wonderland · Carroll, ill. Tenniel · 1865|tertiary|500",
    "Anna Karenina · Tolstoy · 1877 · the Moscow station in snow|primary|450",
    "Baroque · the candlelit chamber|tertiary|450",
    "Black metal · the forest at night|primary|450",
    "Bleak House · Dickens · 1853 · a November fog over the city|primary|450",
    "Burger King · The Flame Identity · 2021 rebrand|tertiary|450",
    "Charleston single house · antebellum vernacular · South Carolina|primary|500",
    "Chartres Cathedral · c.1220 · the nave at midday|tertiary|450",
    "Cologne Cathedral · 1880 (completed) · the dark nave|tertiary|450",
    "Crime and Punishment · Dostoevsky · 1866 · the Petersburg slums in July heat|primary|450",
    "Doctor Zhivago · Pasternak · 1957 · the ice-bound house at Varykino|primary|450",
    "Don Quixote · Cervantes · 1605 · the plains of La Mancha|primary-muted|450",
    "Donuts & sprinkles · the bakery case|secondary|550",
    "Dracula · Bram Stoker · 1897 · the Carpathian castle at night|primary|450",
    "Drive · 2011 · dir. Refn · the LA night drive|primary|450",
    "Falu-red farmstead · Swedish vernacular · Dalarna|tertiary-muted|500",
    "Frankenstein · Mary Shelley · 1818 · the Arctic & the laboratory|primary-muted|450",
    "Fresh pasta · the marble work-bench|tertiary-muted|500",
    "Gospel · the church choir|primary-muted|500",
    "Habitat 67 · 1967 · Moshe Safdie · Montreal|tertiary-muted|500",
    "Himeji Castle · 1609 · 'White Heron' keep · Japan|secondary|500",
    "Icelandic turf house · vernacular · Skógar / Glaumbær|tertiary-muted|500",
    "In the Mood for Love · 2000 · dir. Wong Kar-wai · the noodle-stall corridor|tertiary|450",
    "Katsura Imperial Villa · 17th c · Kyoto|primary|500",
    "Kyō-machiya townhouse · Edo–Meiji · Kyoto|secondary-muted|450",
    "Like Water for Chocolate · Laura Esquivel · 1989 · the ranch kitchen|secondary|450",
    "Lovers rock · the blue-light basement|tertiary-muted|450",
    "Low-and-slow BBQ · the smokehouse tray|primary|450",
    "Macarons · the display case|tertiary-muted|500",
    "Mod & British Invasion · the op-art club|tertiary-muted|500",
    "Motown · the glamour stage|tertiary|450",
    "Nashville rhinestone · the Opry stage|tertiary|450",
    "New England saltbox · colonial vernacular · coastal Massachusetts|tertiary-muted|500",
    "Pop-punk · the skate-park sleeve|tertiary-muted|500",
    "Red wine · the tasting flight|primary|450",
    "Red wine · the tasting flight|secondary|450",
    "Romantic era · the candlelit recital|tertiary|450",
    "Sainte-Chapelle · 1248 · Paris · the upper chapel|tertiary|450",
    "Sichuan hot pot · the bubbling cauldron|secondary|450",
    "Smørrebrød · the open sandwich|primary|450",
    "Snow Country · Kawabata · 1948 · the hot-spring town in winter|primary|450",
    "Symphonic & gothic metal · the cathedral set|secondary|450",
    "Symphonic & gothic metal · the cathedral set|tertiary-muted|500",
    "The Adventures of Sherlock Holmes · Doyle · 1892 · 221B Baker Street|primary|450",
    "The Godfather · 1972 · dir. Coppola · cin. Gordon Willis · the don's study|primary-muted|450",
    "The Good, the Bad and the Ugly · 1966 · dir. Leone · the desert duel|primary|450",
    "The Grand Budapest Hotel · 1932 era · dir. Wes Anderson · the lobby & funicular|tertiary|450",
    "The Handmaid's Tale · Atwood · 1985 · Gilead|secondary|450",
    "The Leopard · Lampedusa · 1958 · Sicily in the 1860s|primary|450",
    "The Makioka Sisters · Tanizaki · 1948 · the Kyoto cherry-viewing|tertiary|450",
    "The Red Shoes · 1948 · dir. Powell & Pressburger · the ballet|primary-muted|500",
    "The Red Shoes · 1948 · dir. Powell & Pressburger · the ballet|secondary-muted|450",
    "The Shining · 1980 · dir. Kubrick · the Overlook Hotel|tertiary|450",
    "The Witch · 2015 · dir. Eggers · the farm at the wood's edge|primary|450",
    "The opera house · the gilded auditorium|secondary|450",
    "The orchestra · the concert platform|tertiary-muted|500",
    "There Will Be Blood · 2007 · dir. P.T. Anderson · the oil derrick fire|primary-muted|450",
    "Touch of Evil · 1958 · dir. Orson Welles · the border-town night|tertiary-muted|500",
    "Trulli of Alberobello · vernacular · Puglia, Italy|primary|500",
    "War and Peace · Tolstoy · 1869 · the winter ballroom & the retreat|primary|450",
    "Whisky & spirits · the back bar|tertiary|450",
  ]);
  // findDips takes BOTH the stop set and the engine as parameters (#681 U3 review 4, R3/R4): R3 because
  // the 19-stop display ramp and the 25-stop export ramp share every window from 200 to 800 but differ
  // at the ends (19-stop 100/150/200 vs 25-stop 125/150/175, same at 850/900), so a dip only visible in
  // one set's end window would pass a 25-stop-only gate; R4 because a negative control that reimplements
  // this loop inline (rather than calling the real gate's own function against a patched engine) is the
  // same unguarded shape N4 already fixed for `above100Violators`; passing `engine` in as a parameter
  // (default the real `T`) lets both negative controls below reuse this exact function instead.
  const findDips = (doc, toneMode, stops, engine = T) => {
    const out = [];
    for (const pal of doc.palettes) {
      const controls = { curve: doc.curve, tension: doc.tension, lmin: doc.lmin, lmax: doc.lmax, damp: doc.damp, dampCurve: doc.dampCurve, dampAmp: doc.dampAmp, dampBias: doc.dampBias, hueSpace: doc.hueSpace, relChroma: doc.relChroma, chromaFloor: doc.chromaFloor, vibrancy: doc.vibrancy, toneMode };
      const chroma = rampChromaOf(pal, doc);
      const ramp = engine.paletteStops({ hue: pal.hue, chroma, skew: pal.skew, lift: pal.lift, hueShift: pal.hueShift ?? 0, hueSameDir: pal.hueSameDir === true, cuspPull: pal.cuspPull, anchor: pal.anchor }, controls, stops);
      for (let i = 1; i < ramp.length - 1; i++) {
        const a = ramp[i - 1].chroma, b = ramp[i].chroma, c = ramp[i + 1].chroma;
        if (b <= a - 3 && b <= c - 3) out.push(`${doc.__presetName}|${pal.name}|${ramp[i].stop}`);
      }
    }
    return out;
  };
  // F2 (review pass 2, 2026-09-19): addendum 2 said the default kit is IN the sweep. It was added to
  // the lone-spike sweep (test/engine/anchor.mjs) but this dip gate kept iterating `docs` (the 8
  // curated categories only) - not excluded on purpose, just never extended when the ruling landed.
  // Fixed here with a SEPARATE array (`dipDocs`), not by pushing the kit into `docs` itself: `docs` is
  // also read directly by (iii)/(iii-b) above, whose own anchor-aware-vs-not scope is Q7, an open owner
  // question this pass does not touch - widening `docs` itself would silently change (iii)/(iii-b)'s
  // measured population too. `__presetName` is set the same way the corpus loop above sets it, so this
  // finding's names print the same shape ("default kit"|palette|stop) as everywhere else in this file.
  const defaultKitDoc = defaultDocument();
  defaultKitDoc.__presetName = "default kit";
  const dipDocs = [...docs, defaultKitDoc];
  const BASELINE_BY_MODE = { peak: DIP_BASELINE, even: EVEN_DIP_BASELINE, perceptual: PERCEPTUAL_DIP_BASELINE };
  const seenModes = new Set();
  // this mode's OWN observed baseline count, in THIS run's scope  -  the negative controls below compare
  // the patched engine's count against this, never against a full-corpus pin a SAMPLED run cannot reach
  // (#713 design section: "an in-file negative control compares the patched engine against the same
  // mode's own real count").
  const seenBaselineCountByMode = {};
  for (const toneMode of ["peak", "even", "perceptual"]) {
    seenModes.add(toneMode);
    const baseline = BASELINE_BY_MODE[toneMode];
    const seenBaseline = new Set();
    const unlistedSet = new Set();
    for (const doc of dipDocs) {
      if ((doc.dampAmp ?? 0) !== 0) continue; // generated palettes only, matching (iii)'s own scope
      const found = new Set();
      for (const stops of [T.STOPS, T.EXPORT_STOPS]) {
        for (const name of findDips(doc, toneMode, stops)) found.add(name);
      }
      for (const name of found) {
        if (baseline && baseline.has(name)) seenBaseline.add(name);
        else unlistedSet.add(name);
      }
    }
    if (baseline) seenBaselineCountByMode[toneMode] = seenBaseline.size;
    const unlisted = [...unlistedSet];
    if (unlisted.length) FAIL("chroma-envelope", `(iv dip gate) ${toneMode}: ${unlisted.length} dip instance(s) beyond the cited baseline, e.g. ${unlisted[0]}`);
    // exact under FULL; SAMPLED sees a subset of the corpus, so a cited name it never visits is not a
    // failure there (#713 design section).
    if (FULL && baseline && seenBaseline.size !== baseline.size) {
      const missing = [...baseline].filter((n) => !seenBaseline.has(n));
      FAIL("chroma-envelope", `(iv dip gate) ${toneMode}: ${missing.length} of the ${baseline.size} cited baseline dips were not observed this run (${missing.join(", ")})  -  either fixed (remove from the list, tighten toward 0) or the corpus changed under it (re-diagnose before loosening further)`);
    }
  }
  // #681 U3 review 4, R4 (the "assert" alternative, in addition to the wiring fix on both negative
  // controls below): ties each named baseline to the loop that is supposed to check it. Without this, a
  // toneMode simply dropped from the array two lines up above would silently skip its own baseline's
  // seenBaseline check (that check never runs for a mode the loop never visits), not fail it, exactly the
  // probe the reviewer used to demonstrate the gap.
  for (const mode of Object.keys(BASELINE_BY_MODE)) {
    if (!seenModes.has(mode)) FAIL("chroma-envelope", `(iv dip gate) ${mode} has a named baseline (${BASELINE_BY_MODE[mode].size} entries) but was not in the toneMode loop above, so it went silently unchecked`);
  }

  // Negative control (peak). Addendum-2 correction (2026-09-19): this used to patch F1's exact pre-fix
  // bisection bugs (a 1-step bisection, an undershoot-locking `Math.min(chroma, target)` fallback) in
  // `okhslStops`'s NON-anchored branch. On the corrected, anchor-aware measurement that branch is dead
  // for this control's purpose: `okhslStops` dispatches to `okhslStopsAnchored` whenever the palette
  // carries an anchor (nearly all of the generated corpus, see `above100Violators`' own comment above),
  // and `okhslStopsAnchored` has no bisection at all - its saturation is `anchorChromaBasis(...) * env`,
  // a closed-form blend, never solved iteratively - so the old patch text still matches (the FAIL-if-
  // missing check still passes) but produces 0 buggy dips, not "far more": checked directly, confirmed
  // dead. The control now patches `anchorChromaBasis` (src/engine/tonal.js, shared verbatim by both
  // `paletteStopsAnchored` and `okhslStopsAnchored`) instead: forcing its smoothstep weight negative for
  // any stop within the inner 15% of the pivot's own liftStop window drives that stop's blended value
  // BELOW the anchor's own pivot value whenever the group target exceeds it, reproducing the same
  // "interior stop >= 3 CAM16 C below both neighbours" shape the real F1 regression had, on the
  // construction the real corpus actually renders through. Measured: 3,987 buggy peak dips (vs. 0 real).
  {
    const realSrc = readFileSync(new URL("../../src/engine/tonal.js", import.meta.url), "utf8");
    const hctUrl = new URL("../../src/engine/hct.js", import.meta.url).href;
    const okhslUrl = new URL("../../src/engine/okhsl.js", import.meta.url).href;
    const patched = realSrc
      .replace('from "./hct.js"', `from "${hctUrl}"`)
      .replace('from "./okhsl.js"', `from "${okhslUrl}"`)
      .replace(
        "const w = t * t * (3 - 2 * t); // smoothstep: w(0)=0, w(1)=1, w'(0)=w'(1)=0",
        "const w = t < 0.15 ? -0.6 : t * t * (3 - 2 * t); // smoothstep: w(0)=0, w(1)=1, w'(0)=w'(1)=0"
      );
    if (patched === realSrc) FAIL("chroma-envelope", "(iv dip gate negative control, peak) a patch target string was not found  -  the anchorChromaBasis weight text moved, update this control");
    const BuggyT = await import(`data:text/javascript;base64,${Buffer.from(patched).toString("base64")}`);
    // #681 U3 review 4, R3/R4: calls the real findDips against the patched engine, over both stop sets,
    // instead of reimplementing the loop inline.
    const buggyDipSet = new Set();
    for (const doc of docs) {
      if ((doc.dampAmp ?? 0) !== 0) continue;
      for (const stops of [T.STOPS, T.EXPORT_STOPS]) {
        for (const name of findDips(doc, "peak", stops, BuggyT)) buggyDipSet.add(name);
      }
    }
    const buggyDips = buggyDipSet.size;
    // FULL compares against the frozen pin; SAMPLED compares against what THIS run's own real sweep
    // observed of it, never the full-corpus pin a sampled scope cannot reach (#713 design section).
    const peakFloor = FULL ? DIP_BASELINE.size : (seenBaselineCountByMode.peak ?? 0);
    if (buggyDips <= peakFloor) FAIL("chroma-envelope", `(iv dip gate negative control, peak) the patched engine produced only ${buggyDips} dip(s), not clearly more than the ${peakFloor}-witness baseline observed this run  -  this control no longer exercises a real regression, pick a different probe`);
  }

  // Negative control (even, #681 U3 review 3, N1): a patched copy with `chromaFloor` amplified 1.6x
  // inside `evenChroma`'s own floor term (still the SAME formula, a worse INPUT, not a different check)
  // must produce far more than 53 dips, proving this gate is live for even mode too, not just re-counting
  // the same 53 forever.
  {
    const realSrc = readFileSync(new URL("../../src/engine/tonal.js", import.meta.url), "utf8");
    const hctUrl = new URL("../../src/engine/hct.js", import.meta.url).href;
    const okhslUrl = new URL("../../src/engine/okhsl.js", import.meta.url).href;
    const patched = realSrc
      .replace('from "./hct.js"', `from "${hctUrl}"`)
      .replace('from "./okhsl.js"', `from "${okhslUrl}"`)
      .replace(
        "const floorC = Math.min(((chromaFloor ?? 0) / 100) * maxc, intended);",
        "const floorC = Math.min((((chromaFloor ?? 0) * 1.6) / 100) * maxc, intended);"
      );
    if (patched === realSrc) FAIL("chroma-envelope", "(iv dip gate negative control, even) a patch target string was not found  -  evenChroma's floor text moved, update this control");
    const BuggyT = await import(`data:text/javascript;base64,${Buffer.from(patched).toString("base64")}`);
    // #681 U3 review 4, R4: calls the real findDips against the patched engine (the same shape N4 already
    // fixed for above100Violators), instead of reimplementing the loop inline; also over both stop sets
    // per R3.
    const buggyEvenDipSet = new Set();
    for (const doc of docs) {
      if ((doc.dampAmp ?? 0) !== 0) continue;
      for (const stops of [T.STOPS, T.EXPORT_STOPS]) {
        for (const name of findDips(doc, "even", stops, BuggyT)) buggyEvenDipSet.add(name);
      }
    }
    const buggyEvenDips = buggyEvenDipSet.size;
    // as the peak control above: FULL against the frozen pin, SAMPLED against this run's own count.
    const evenFloor = FULL ? EVEN_DIP_BASELINE.size : (seenBaselineCountByMode.even ?? 0);
    if (buggyEvenDips <= evenFloor) FAIL("chroma-envelope", `(iv dip gate negative control, even) the amplified-floor patched engine produced only ${buggyEvenDips} dip(s), not clearly more than the ${evenFloor}-witness baseline observed this run  -  this control no longer exercises the mechanism, pick a different probe`);
  }

  // (iii-b) perceptual's bounded CUSP-RUN exemption (#681 U3 pass 6, owner ruling (f), conductor
  // lane-A-routing-6.md, 2026-09-19): NO ramp change for perceptual  -  #55's cusp-pull ships exactly as
  // today (pass 5's measurement showed a one-STOP exemption spikes for 76% of the corpus, because a
  // cusp is a natural SHOULDER spanning several adjacent stops, not a point  -  see Q7's pass-5 addendum).
  // Instead: a generated (dampAmp 0) perceptual palette may have AT MOST ONE CONTIGUOUS RUN of stops
  // above stop 500's own emitted chroma (the whole shoulder counts as one unit), and every stop in that
  // run must be at or under the frozen bound. A SECOND, separate run, or any stop past the bound, reds.
  //
  // analyzeCuspRuns  -  pure: given a rendered ramp (in T.STOPS order) and its own anchor chroma, counts
  // the number of separate CONTIGUOUS above-anchor runs and the worst (chroma/c500) ratio among them.
  // Pure and synthetic-input-friendly so the negative controls below hand-craft an input rather than
  // depend on the corpus happening to contain the exact shape under test.
  const analyzeCuspRuns = (ramp, c500) => {
    let runs = 0, inRun = false, worstRatio = 0;
    for (const r of ramp) {
      const over = r.chroma > c500 + 1e-6;
      if (over) {
        if (!inRun) runs++;
        inRun = true;
        worstRatio = Math.max(worstRatio, r.chroma / c500);
      } else inRun = false;
    }
    return { runs, worstRatio };
  };
  // CUSP_RUN_BOUND  -  189.3005% of stop 500's own chroma, EXACT: the corpus's fresh-measured worst
  // cusp-stop excess (89.3005pp, cuisine "Sushi & sashimi · the cypress counter"/primary-muted, cusp
  // stop 650  -  measured pass 5, reconfirmed pass 6, frozen at this exact value by the owner's ruling
  // (f), plan revision 20). Not rounded up: the plan's own frozen figure is this precise value.
  const CUSP_RUN_BOUND = 1.893005;
  const cuspRunFor = (doc, pal) => {
    const controls = { curve: doc.curve, tension: doc.tension, lmin: doc.lmin, lmax: doc.lmax, damp: doc.damp, dampCurve: doc.dampCurve, dampAmp: doc.dampAmp, dampBias: doc.dampBias, hueSpace: doc.hueSpace, relChroma: doc.relChroma, chromaFloor: doc.chromaFloor, vibrancy: doc.vibrancy, toneMode: "perceptual" };
    const chroma = rampChromaOf(pal, doc);
    // NOT anchor: pal.anchor here - same addendum-2 finding as above100Violators' own comment: on the
    // rendered anchored path this measured 958 multi-run and 712 bound-excess instances (perceptual,
    // generated palettes), overwhelmingly on anchor-bearing palettes, the same structural mismatch (stop
    // 500 is the anchor's real chroma, not the ramp's designed peak). Left on the non-anchored
    // measurement pending the same scope ruling; see above100Violators' comment and the pass 2 handoff.
    const ramp = T.paletteStops({ hue: pal.hue, chroma, skew: pal.skew, lift: pal.lift, hueShift: pal.hueShift ?? 0, hueSameDir: pal.hueSameDir === true, cuspPull: pal.cuspPull }, controls, T.STOPS);
    const c500 = ramp.find((r) => r.stop === 500).chroma;
    if (c500 <= 1e-9) return null;
    return analyzeCuspRuns(ramp, c500);
  };
  {
    const unlistedRuns = [], unlistedExcess = [];
    for (const doc of docs) {
      if (ADIA_CARVEOUT.has(doc.__presetName)) continue; // exempt by name, both clauses (as even/peak)
      for (const pal of doc.palettes) {
        const res = cuspRunFor(doc, pal);
        if (!res) continue;
        if (res.runs > 1) unlistedRuns.push(`${doc.__presetName}/${pal.name} (${res.runs} runs)`);
        if (res.worstRatio > CUSP_RUN_BOUND + 1e-6) unlistedExcess.push(`${doc.__presetName}/${pal.name} (${(res.worstRatio * 100).toFixed(2)}%)`);
      }
    }
    if (unlistedRuns.length) FAIL("chroma-envelope", `(C6 iii-b) perceptual: ${unlistedRuns.length} palette(s) with a SECOND separate above-anchor run (not the named Adia carve-out), e.g. ${unlistedRuns[0]}`);
    if (unlistedExcess.length) FAIL("chroma-envelope", `(C6 iii-b) perceptual: ${unlistedExcess.length} palette(s) with a stop past the frozen CUSP_RUN_BOUND ${(CUSP_RUN_BOUND * 100).toFixed(4)}% (not the named Adia carve-out), e.g. ${unlistedExcess[0]}`);

    // adiaHit: the named carve-out must actually be doing work here too (Adia's dampAmp:70 boost is
    // what created the original need for a carve-out on even/peak; confirm it also produces a second
    // run or a past-bound stop in perceptual mode, or the carve-out is stale here).
    let adiaHit = false;
    for (const doc of docs) {
      if (!ADIA_CARVEOUT.has(doc.__presetName)) continue;
      for (const pal of doc.palettes) {
        const res = cuspRunFor(doc, pal);
        if (res && (res.runs > 1 || res.worstRatio > CUSP_RUN_BOUND + 1e-6)) adiaHit = true;
      }
    }
    if (!adiaHit) FAIL("chroma-envelope", "(C6 iii-b) perceptual: the named Adia carve-out produced no second-run or bound-excess instance  -  either stale or the corpus dropped it; re-diagnose before touching ADIA_CARVEOUT");

    // Negative control 1: a SCRATCH ramp with two SEPARATE above-anchor runs must read runs > 1.
    {
      const c500 = 50;
      const ramp = T.STOPS.map((stop) => ({ stop, chroma: (stop === 200 || stop === 800) ? c500 * 1.2 : c500 * 0.8 }));
      ramp[ramp.findIndex((r) => r.stop === 500)] = { stop: 500, chroma: c500 };
      const res = analyzeCuspRuns(ramp, c500);
      if (res.runs < 2) FAIL("chroma-envelope", `(C6 iii-b negative control) synthetic two-run ramp read ${res.runs} run(s), expected >=2  -  check analyzeCuspRuns`);
    }
    // Negative control 2: a SCRATCH excess of CUSP_RUN_BOUND + 1% must read worstRatio past the bound.
    {
      const c500 = 50;
      const ramp = T.STOPS.map((stop) => ({ stop, chroma: stop === 650 ? c500 * (CUSP_RUN_BOUND + 0.01) : c500 * 0.8 }));
      ramp[ramp.findIndex((r) => r.stop === 500)] = { stop: 500, chroma: c500 };
      const res = analyzeCuspRuns(ramp, c500);
      if (!(res.worstRatio > CUSP_RUN_BOUND + 1e-6)) FAIL("chroma-envelope", `(C6 iii-b negative control) synthetic bound+1% ramp read worstRatio ${(res.worstRatio * 100).toFixed(2)}%, expected > ${(CUSP_RUN_BOUND * 100).toFixed(4)}%  -  check analyzeCuspRuns`);
    }
  }

  // (v) Q7 ratchet (owner's ruling, 2026-09-20): C6 (iii) above keeps ANSWER (a) unchanged - the 0-of-384
  // bar stays on the NON-anchored construction only, where stop 500 is the ramp's own designed peak by
  // construction. On the ANCHORED construction, stop 500 is instead the user's own pinned sample
  // (paletteStopsAnchored's/okhslStopsAnchored's stop===500 && !clamped special case returns the anchor's
  // own chroma verbatim, not a value the ramp designed toward), so most anchored palettes legitimately
  // carry some stop above it - that is not a defect this gate can zero out, and #701's plan already treats
  // these rendered cells as report-only. The 90%+ hole is not accepted silently either: this is a RATCHET,
  // not a pass/fail bar on the population. It pins TODAY's measured violator count and max overshoot ratio
  // on the anchored PEAK path (re-measured this pass against this file's own paletteStops, not copied from
  // review pass 2's cited figures - this reading reproduces them to the precision cited) and reds ONLY if a
  // future run's measurement RISES past either pinned number. A silent improvement still passes; the pin
  // exists to catch a regression that widens the hole further, not to freeze today's number as a target.
  //
  // Perf note (team-lead, same round): the anchored-EVEN companion figure used to be measured here too
  // (report-only, never gated) at a corpus-wide cost of ~9.4s - the dominant share of this file's own
  // ~11.8s regression from this gate. A figure that is never asserted does not belong in the test suite:
  // it is now produced by `scripts/report-preset-fidelity.mjs --envelope` instead, the diagnostic script
  // Q7's own ruling already routes anchor-aware, report-only measurements through (see that script's own
  // new section for the identical scope/metric). This gate keeps only what it actually gates: the peak
  // count and max overshoot.
  {
    const measureAnchoredOvershoot = (engine, mode, docsList = docs) => {
      let violators = 0, maxRatio = 0, witness = "", measured = 0;
      for (const doc of docsList) {
        if ((doc.dampAmp ?? 0) !== 0) continue; // generated palettes only, matching (iii)'s own scope
        if (ADIA_CARVEOUT.has(doc.__presetName)) continue; // exempt by name, same carve-out as (iii)/(iii-b)
        const controls = { curve: doc.curve, tension: doc.tension, lmin: doc.lmin, lmax: doc.lmax, damp: doc.damp, dampCurve: doc.dampCurve, dampAmp: doc.dampAmp, dampBias: doc.dampBias, hueSpace: doc.hueSpace, relChroma: doc.relChroma, chromaFloor: doc.chromaFloor, vibrancy: doc.vibrancy, toneMode: mode };
        for (const pal of doc.palettes) {
          measured++;
          const chroma = rampChromaOf(pal, doc);
          const ramp = engine.paletteStops({ hue: pal.hue, chroma, skew: pal.skew, lift: pal.lift, hueShift: pal.hueShift ?? 0, hueSameDir: pal.hueSameDir === true, cuspPull: pal.cuspPull, anchor: pal.anchor }, controls, T.STOPS);
          const c500row = ramp.find((r) => r.stop === 500);
          if (!c500row) continue;
          const c500 = c500row.chroma;
          if (c500 <= 1e-9) continue;
          let localMax = 0;
          for (const row of ramp) localMax = Math.max(localMax, row.chroma / c500);
          if (localMax > 1 + 1e-6) {
            violators++;
            if (localMax > maxRatio) { maxRatio = localMax; witness = `${doc.__presetName}/${pal.name}`; }
          }
        }
      }
      return { violators, maxRatio, witness, measured };
    };

    // Pinned this pass (2026-09-20). Anchored PEAK, generated palettes, Adia excluded by name, 19-stop
    // display set, 3,764 total palettes measured.
    const PEAK_VIOLATOR_PIN = 3119;
    const PEAK_MAX_RATIO_PIN = 15.132599;
    const peakResult = measureAnchoredOvershoot(T, "peak");
    if (peakResult.violators > PEAK_VIOLATOR_PIN)
      FAIL("chroma-envelope", `(C6 v ratchet, monitor not bar) anchored peak violator count rose to ${peakResult.violators}, pinned at ${PEAK_VIOLATOR_PIN}, e.g. ${peakResult.witness}`);
    if (peakResult.maxRatio > PEAK_MAX_RATIO_PIN + 1e-6)
      FAIL("chroma-envelope", `(C6 v ratchet, monitor not bar) anchored peak max overshoot rose to ${peakResult.maxRatio.toFixed(6)}x stop 500, pinned at ${PEAK_MAX_RATIO_PIN}x, e.g. ${peakResult.witness}`);
    // the denominator is MEASURED, not the FULL corpus's own fixed 3,764 (#713): SAMPLED measures a
    // canary subset of the same population, whose violator count and max ratio can only ever undershoot
    // the FULL-corpus pins below (a maximum, or a count, over a subset cannot exceed the superset's own).
    console.log(`  [monitor] C6 (v) anchored peak overshoot: ${peakResult.violators}/${peakResult.measured} violator(s) (pinned <= ${PEAK_VIOLATOR_PIN} on FULL), max ${peakResult.maxRatio.toFixed(6)}x stop 500's own chroma (pinned <= ${PEAK_MAX_RATIO_PIN}x on FULL)  -  a RATCHET, NOT a pass/fail bar on the population: stop 500 is the anchor's own pinned sample on this construction, not the ramp's designed peak, so most anchored palettes legitimately carry some stop above it (#701 treats these rendered cells as report-only). The anchored-EVEN companion figure is reported by scripts/report-preset-fidelity.mjs --envelope, not here.`);

    // Negative control: a SCRATCH copy of the real engine, patched at okhslStopsAnchored's own
    // `intendedS * env` saturation line (src/engine/tonal.js - the anchored PEAK/perceptual OKHSL-domain
    // path's saturation build) to amplify every stop's saturation by 1.6x, must raise the measured max
    // overshoot ratio past the pin - proving the ratchet actually reds on a real regression, not merely
    // comparing a number to itself.
    //
    // SAMPLED, not corpus-wide (team-lead, same round: "a control proves discrimination, not coverage").
    // SEEDED, not "corpus order" (review pass 3, R3-2's own companion note in the round-4 brief: a
    // positional slice silently drifts if `CATS` or a category's own `PRESETS` array is reordered). The
    // sample is the known full-corpus witness doc (34S/secondary, the palette carrying today's pinned max
    // ratio) plus the 49 OTHER docs whose `__presetName` sorts lexicographically first - a deterministic
    // seed independent of corpus array order, reproducible by re-running the same sort, not tied to any
    // particular build's iteration order. Big enough to be a real, non-trivial exercise of the mechanism,
    // small enough to be cheap (measured ~0.3-0.8s here vs ~2.2s corpus-wide). Only the MAX RATIO
    // comparison is meaningful at this reduced scale - the violator COUNT is scale-dependent (a ~50-doc
    // sample cannot rationally be compared against a 3,764-palette corpus-wide pin), so this control
    // checks maxRatio alone, which is a single-witness property and stays valid at any sample size.
    {
      const realSrc = readFileSync(new URL("../../src/engine/tonal.js", import.meta.url), "utf8");
      const hctUrl = new URL("../../src/engine/hct.js", import.meta.url).href;
      const okhslUrl = new URL("../../src/engine/okhsl.js", import.meta.url).href;
      const NEEDLE = "const s = Math.min(1, Math.max(0, intendedS * env));";
      if (!realSrc.includes(NEEDLE)) {
        FAIL("chroma-envelope", "(C6 v negative control) okhslStopsAnchored's saturation line text has moved  -  update the negative control's string match");
      } else {
        const patched = realSrc
          .replace('from "./hct.js"', `from "${hctUrl}"`)
          .replace('from "./okhsl.js"', `from "${okhslUrl}"`)
          .replace(NEEDLE, "const s = Math.min(1, Math.max(0, intendedS * env * 1.6));");
        const BuggyT = await import(`data:text/javascript;base64,${Buffer.from(patched).toString("base64")}`);
        // peakResult.witness is `${doc.__presetName}/${pal.name}` (this function's own return shape).
        const witnessDoc = docs.find((d) => peakResult.witness.startsWith(d.__presetName + "/"));
        const others = docs.filter((d) => d !== witnessDoc).sort((a, b) => a.__presetName.localeCompare(b.__presetName)).slice(0, 49);
        const sampleDocs = witnessDoc ? [witnessDoc, ...others] : docs.slice(0, 50);
        const buggySample = measureAnchoredOvershoot(BuggyT, "peak", sampleDocs);
        // FULL compares against the frozen pin; SAMPLED compares against this run's own unmutated max
        // ratio, never the FULL-corpus pin: the sample's own worst witness need not be the full corpus's
        // worst, so amplifying it need not clear a pin measured on a witness this scope may not carry
        // (#713 design section, same principle as the dip-gate negative controls above).
        const ratioFloor = FULL ? PEAK_MAX_RATIO_PIN : peakResult.maxRatio;
        if (!(buggySample.maxRatio > ratioFloor + 1e-6))
          FAIL("chroma-envelope", `(C6 v negative control, sampled, ratio arm) a 1.6x-amplified okhslStopsAnchored saturation, on a ${sampleDocs.length}-doc sample, read maxRatio ${buggySample.maxRatio.toFixed(6)}  -  expected it to exceed ${FULL ? "the pin" : "this run's own unmutated max ratio"} (${ratioFloor.toFixed(6)}x)  -  check measureAnchoredOvershoot, the sample, or the patch target`);
      }
    }

    // Negative control, COUNT arm (review pass 3, round 4: the ratio-arm control above does not exercise
    // the COUNT half of "reds if EITHER... rises" - a gate arm with nothing behind it is a pattern this
    // plan has already caught). A count-only regression is a real, distinct failure mode from a ratio-only
    // one: the worst witness's own OKHSL saturation is already clamped to 1 at its peak stop (`Math.min(1,
    // ...)` in the real source), so a broad amplification that ALSO touches other, previously-unclamped
    // near-1.0 palettes can tip many of THEM over the threshold (raising the count) without moving the
    // already-clamped worst witness at all (leaving the max ratio flat) - the two arms are not coupled by
    // construction, and must each be exercised on their own. A real corpus-wide reproduction of that exact
    // scenario is not needed to prove the COUNT arm's own trigger fires: a STUB engine (not the real one)
    // over a purely SYNTHETIC doc list (not the corpus) isolates it cleanly and cheaply, the same way the
    // (iii-b) cusp-run controls above use synthetic ramps rather than corpus sweeps to test pure logic.
    // Every synthetic palette's stub ramp overshoots by the SAME small, fixed margin (1.005x, far under
    // the ratio pin), so a count past the pin here cannot also carry the ratio past it - the two FAIL
    // conditions are exercised independently, matching what a genuine count-only regression looks like.
    {
      const stubEngine = { paletteStops: () => [{ stop: 500, chroma: 100 }, { stop: 600, chroma: 100.5 }] };
      const syntheticCount = PEAK_VIOLATOR_PIN + 50;
      const syntheticDocs = Array.from({ length: syntheticCount }, (_, i) => ({
        dampAmp: 0,
        __presetName: `synthetic-count-control-${i}`,
        palettes: [{ hue: 0, chroma: 50, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, cuspPull: 0, anchor: undefined, name: "synthetic" }],
        curve: 1, tension: 1, lmin: 0, lmax: 100, damp: 0, dampCurve: 1, dampBias: 0, hueSpace: "oklch", relChroma: 1, chromaFloor: 0, vibrancy: 1,
      }));
      const countProbe = measureAnchoredOvershoot(stubEngine, "peak", syntheticDocs);
      if (!(countProbe.violators > PEAK_VIOLATOR_PIN))
        FAIL("chroma-envelope", `(C6 v negative control, count arm) a synthetic ${syntheticCount}-doc list, each overshooting a fixed 1.005x, read violators ${countProbe.violators}  -  expected > ${PEAK_VIOLATOR_PIN}  -  check measureAnchoredOvershoot or the synthetic list`);
      if (countProbe.maxRatio > PEAK_MAX_RATIO_PIN + 1e-6)
        FAIL("chroma-envelope", `(C6 v negative control, count arm) the synthetic list's own maxRatio (${countProbe.maxRatio.toFixed(6)}x) unexpectedly exceeded the ratio pin  -  this control is meant to isolate the count arm from the ratio arm; check the synthetic overshoot margin`);
    }
  }
}

// ── okl-order (#738): okhslLAt is a pure function of its argument, in two directions ──────
//    #686 fixed this class in hct.js (maxChromaInGamut/peakC/oklchToCam16Hue key on the exact
//    float); tonal.js's own instance (_okL, keyed on lstar.toFixed(2)) was owner ruling R26's
//    half for THIS ticket. U1 deleted the memo rather than re-keying it (measured not
//    load-bearing: well under 1us per uncached call, two or three calls per palette render),
//    so this gate is the tripwire that stops the memo -- or any other order-dependent cache --
//    coming back, checked from both directions: the function itself, in process, and a real
//    palette render, across two cold worker processes.
{
  // (1) function-level, in this process: two L* values in the same toFixed(2) bucket ("5.26"
  //     under the old key), each checked against the test's OWN derivation -- imported from
  //     hct.js and okhsl.js, never from tonal.js, so a broken okhslLAt cannot mark its own
  //     homework -- and checked against each other. On the old code, whichever of the two ran
  //     first decided the second's value too, so the two collapse to one value and the
  //     "differ from each other" assertion reds regardless of call order.
  const L1 = 5.25501, L2 = 5.26499;
  const got1 = T.okhslLAt(L1), got2 = T.okhslLAt(L2);
  const want1 = rgbToOkhsl(E.hctToRgb(0, 0, L1).rgb).l, want2 = rgbToOkhsl(E.hctToRgb(0, 0, L2).rgb).l;
  if (got1 !== want1) FAIL("okl-order", `function-level: okhslLAt(${L1}) = ${got1}, expected ${want1} (this test's own hctToRgb/rgbToOkhsl derivation)`);
  else if (got2 !== want2) FAIL("okl-order", `function-level: okhslLAt(${L2}) = ${got2}, expected ${want2} (this test's own hctToRgb/rgbToOkhsl derivation)`);
  else if (got1 === got2) FAIL("okl-order", `function-level: okhslLAt(${L1}) and okhslLAt(${L2}) both returned ${got1}; a memo keyed on lstar.toFixed(2) collapses this pair into one bucket`);

  // (2) render-level, two cold processes through prime-determinism-worker.mjs (#738's extension:
  //     the optional prelstars/ramps stdin fields). 24 palettes (hue = i*15 + 7.3, chroma 60,
  //     skew 0, lift 0, cam16, 12 perceptual + 12 peak), each rendered at lmin: 5.25501 -- once in
  //     a clean process, once in a process that called okhslLAt(5.26499) first, before anything
  //     else. A cache keyed on the rounded L* serves the wrong lightness to the second bucket's
  //     lookup and every one of the 24 ramps shifts hex; a pure function cannot be perturbed by an
  //     earlier, unrelated call. This half is the actual regression the deleted memo could
  //     reintroduce: the corpus render path only ever passes integer L* today (measured in the
  //     plan), so a random-hue determinism sweep like prime.mjs's own cannot reach this collision
  //     -- only a fractional lmin/lmax does, which is why this gate builds its own fixture instead
  //     of reusing that one.
  const RAMPS_24 = Array.from({ length: 24 }, (_, i) => ({
    hue: i * 15 + 7.3, chroma: 60, skew: 0, lift: 0, hueShift: 0, hueSpace: "cam16",
    toneMode: i < 12 ? "perceptual" : "peak", lmin: L1,
  }));
  const OKL_ORDER_WORKER = fileURLToPath(new URL("./prime-determinism-worker.mjs", import.meta.url));
  const runOklOrderWorker = (prelstars) => JSON.parse(execFileSync(process.execPath, [OKL_ORDER_WORKER], {
    input: JSON.stringify({ prelstars, ramps: RAMPS_24 }),
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024,
  })).ramps;
  const cleanRamps = runOklOrderWorker([]);
  const poisonedRamps = runOklOrderWorker([L2]);
  let rampMismatch = 0;
  for (let i = 0; i < RAMPS_24.length; i++) if (cleanRamps[i] !== poisonedRamps[i]) rampMismatch++;
  if (rampMismatch > 0) FAIL("okl-order", `render-level: ${rampMismatch}/24 ramps shifted hex by call order after a prior okhslLAt(${L2}) in the same process (5.26499 poisons the 5.26 bucket that 5.25501 also falls in)`);

  if (!fails.some((f) => f.startsWith("okl-order:")))
    console.log("okl-order: okhslLAt is a function of its argument; 0/24 ramps shifted hex by call order");
}

// ── REPORT ───────────────────────────────────────────────────────────────────────────────
// The printed set is this declared list UNION every gate name that actually reached a FAIL(...)
// call (#695), so a gate missing from the list below still shows up, loudly, instead of a real
// failure hiding behind a neighbouring gate's "pass" row. gateReport() (#699, test/gate-report.mjs
// -- factored out of the block this file originally introduced) also runs the static self-check:
// a declared name with no call site, or a call site whose name is not declared, fails loudly on
// its own (report-static). The import lives here, immediately above its one call site, rather
// than with the top-of-file imports -- ESM imports hoist regardless of textual position, and this
// keeps every doc citation into the gates above from drifting by a line (same convention as
// test/ui/persist.mjs's mid-file gate-report.mjs import).
import { gateReport } from "../gate-report.mjs";
const DECLARED = ["ingamut", "monotonic", "white-endpoint", "chroma-target", "curve-fidelity", "hue-stability", "damping-curve", "edge-hue", "rel-chroma", "okhsl-modes", "chroma-floor", "cusp-pull", "lift-monotonic", "skew-lift-okhsl", "vibrancy", "oklch-hue-anchor", "hue-solver-best", "intensity-legacy", "ac004-greps", "chroma-envelope", "okl-order", "report-static"];
gateReport({ fails, declared: DECLARED, selfUrl: import.meta.url, FAIL });
console.log(`  (${FULL ? `FULL: ${CORPUS_DOC_COUNT} curated documents, ${CORPUS_PALETTE_COUNT} palettes` : `SAMPLED seed ${SAMPLE_SEED}: ${CORPUS_DOC_COUNT} curated documents, ${CORPUS_PALETTE_COUNT} palettes`})`);
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: tonal-generation clears all [gate] predicates");
process.exit(0);
