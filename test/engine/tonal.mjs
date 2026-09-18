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
import { DOMAINS } from "../../src/ui/persist.js";
import { defaultDocument, rampChromaOf } from "../../src/ui/model.mjs";
import * as T from "../../src/engine/tonal.js";
import * as E from "../../src/engine/hct.js";
import { rgbToOklchHue, rgbToOkhsl, okhslToRgb } from "../../src/engine/okhsl.js";

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

// ── hpg-tonal-ingamut: every default palette × stop in gamut, applied chroma <= ceiling ──
for (const p of DEFAULTS) for (const r of rampOf(p)) {
  if (!r.inGamut) FAIL("ingamut", `${p.name} stop ${r.stop} not inGamut`);
  if (r.chroma > r.maxc + 0.5) FAIL("ingamut", `${p.name} stop ${r.stop} chroma ${r.chroma.toFixed(1)} > ceiling ${r.maxc.toFixed(1)}`);
}

// ── hpg-tonal-monotonic: weakly non-increasing tone 050->950, 5 curves × skew grid (lift 0) ─
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
  //     min(target·(1−damp·u^1.5), ceiling), over EVERY saturated hue, every stop, |dC|<=1e-6.
  for (const p of SAT) {
    const tgt = tgtOf(p);
    for (const r of ramp(p, {})) {
      const uLeg = Math.abs(r.stop - 500) / 450;
      const want = Math.min(tgt * (1 - (CTL.damp / 100) * uLeg ** 1.5), r.maxc);
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
  const A = T.paletteStops({ hue: 264, chroma: 70, skew: 0, lift: 0 }, { ...CTL, relChroma: true }, STOPS);
  const B = T.paletteStops({ hue: 90, chroma: 70, skew: 0, lift: 0 }, { ...CTL, relChroma: true }, STOPS);
  for (let i = 0; i < STOPS.length; i++) {
    if (A[i].maxc < 1 || B[i].maxc < 1) continue;                  // skip near-neutral tone extremes
    const fa = A[i].chroma / A[i].maxc, fb = B[i].chroma / B[i].maxc;
    if (Math.abs(fa - fb) > 0.02) FAIL("rel-chroma", `gamut fraction differs by hue at stop ${STOPS[i]}: 264°=${fa.toFixed(3)} vs 90°=${fb.toFixed(3)} (not harmonized)`);
  }
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
  // (b) NEVER over-saturates: no floored stop exceeds the intended mid (stop 500, where m≈1 ≈ target).
  const muted = ramp(165, 18, 40);
  const cMid = muted.find((r) => r.stop === 500).chroma;
  for (const r of muted) if (r.chroma > cMid + 1) FAIL("chroma-floor", `muted stop ${r.stop} chroma ${r.chroma.toFixed(1)} exceeds intended mid ${cMid.toFixed(1)}`);
  // (c) TRUE NEUTRAL (chroma 0) is untouched — the floor caps at intended(=0), so it cannot tint.
  const n0 = ramp(267, 0, 0), nF = ramp(267, 0, 40);
  for (let i = 0; i < n0.length; i++) if (n0[i].hex !== nF[i].hex) FAIL("chroma-floor", `neutral stop ${n0[i].stop}: floor tinted a chroma-0 palette (${n0[i].hex}->${nF[i].hex})`);
  // (d) SATURATED is untouched — a high-chroma ramp already clamps to the gamut, so the floor never binds.
  const s0 = ramp(145, 99, 0), sF = ramp(145, 99, 40);
  for (let i = 0; i < s0.length; i++) if (s0[i].hex !== sF[i].hex) FAIL("chroma-floor", `saturated stop ${s0[i].stop}: floor changed a vibrant ramp (${s0[i].hex}->${sF[i].hex})`);
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
  // (a) hueAnchorFrac: nominal × (1 + dampAmp/100), capped at 1 — a deterministic lock (still seeds the
  // even/CAM16 ramp's gamut basis + the cusp seed).
  const near = (a, b) => Math.abs(a - b) < 1e-3;
  if (!near(T.hueAnchorFrac({ chroma: 76 }, { dampAmp: 66 }), 1.0)) FAIL("oklch-hue-anchor", `hueAnchorFrac(76%,amp66)=${T.hueAnchorFrac({ chroma: 76 }, { dampAmp: 66 })}, want 1.0`);
  if (!near(T.hueAnchorFrac({ chroma: 25 }, { dampAmp: 66 }), 0.415)) FAIL("oklch-hue-anchor", `hueAnchorFrac(25%,amp66)=${T.hueAnchorFrac({ chroma: 25 }, { dampAmp: 66 })}, want 0.415`);
  if (!near(T.hueAnchorFrac({ chroma: 40 }, { dampAmp: 0 }), 0.40)) FAIL("oklch-hue-anchor", `hueAnchorFrac(40%,amp0)=${T.hueAnchorFrac({ chroma: 40 }, { dampAmp: 0 })}, want 0.40`);
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
    [268, 0.3, 0.4556174494320429, ["Neutral", "peak"]],            // the worst real default, low chroma
    [195, 1, 0.5399970062712544, ["Data 7", "perceptual"]],         // saturated, the default tone mode
    [326, 1, 0.5782463229408346, ["Data 2", "peak"]],
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
//   Carved total after #657: 18 of 32 (3 even + 15 perceptual). The remaining 14 — the 13 even ramps
//   whose lift is 0, and perceptual/Secondary — are byte-for-byte what 83756bb emitted, and that is
//   what each regeneration of this file was verified against. Do NOT regenerate it to make an
//   unexplained red go green. ──────────────────────────────────────────────────────────────────────
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
            FAIL("skew-lift-okhsl", `(i) ${mode}/${hueSpace} ${p.name} stop ${r.stop}: skew 0 + lift 0 is not the unwarped distribution — emitted OKHSL l ${okl(r.rgb).toFixed(5)} vs independent ${want.toFixed(5)}`);
            break;
          }
        }
      }
    }
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
  //       read-back budget of (i). The reported `tone` is the MEASURED CIELAB L* of an 8-bit triple, and
  //       L* also moves with CHROMA — which is keyed on the real stop by design — so at a domain extreme
  //       (|skew| 100 or |lift| 40) a stop whose lightness step has been compressed to near nothing can
  //       measure up to 0.152 L* higher than its neighbour. That is a chroma artefact, not a lightness
  //       reversal, which is exactly why (b) gates the LIGHTNESS ladder and (iv) gates the defaults.
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
  let gridCells = 0;
  for (const mode of ["perceptual", "peak"]) for (const hueSpace of ["oklch", "cam16"]) for (const vibrancy of [0, 50, 100])
    for (const skew of SKEW_G) for (const lift of LIFT_G) for (const hue of HUES_G) {
      gridCells++;
      const rows = T.paletteStops({ hue, chroma: 95, skew, lift }, OK(mode, { hueSpace, vibrancy }), STOPS);
      const ls = rows.map((r) => okl(r.rgb));
      for (let i = 1; i < ls.length; i++) if (ls[i] > ls[i - 1] + LQ) {
        FAIL("skew-lift-okhsl", `(iii b) ${mode}/${hueSpace} hue ${hue} skew ${skew} lift ${lift} vibrancy ${vibrancy}: OKHSL lightness ROSE at stop ${STOPS[i - 1]}->${STOPS[i]} (${ls[i - 1].toFixed(5)} -> ${ls[i].toFixed(5)})`);
        break;
      }
    }
  if (gridCells < 2 * 2 * 3 * SKEW_G.length * LIFT_G.length * HUES_G.length)
    FAIL("skew-lift-okhsl", `(iii b) grid only covered ${gridCells} cells`);

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
  {
    let anchored = 0;
    for (const [skew, lift] of [[40, 15], [-20, -5], [100, 0], [0, 40], [-100, -40], [50, 20]]) {
      for (const hue of [235, 267, 300, 27, 70, 145, 190]) {
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

// ── REPORT ───────────────────────────────────────────────────────────────────────────────
for (const g of ["ingamut", "monotonic", "white-endpoint", "chroma-target", "curve-fidelity", "hue-stability", "damping-curve", "edge-hue", "rel-chroma", "okhsl-modes", "chroma-floor", "lift-monotonic", "skew-lift-okhsl", "vibrancy", "oklch-hue-anchor", "hue-solver-best", "intensity-legacy", "ac004-greps"]) {
  const f = fails.find((x) => x.startsWith(g + ":"));
  console.log(`  ${f ? "FAIL" : "pass"}  ${g}${f ? "  — " + f.slice(g.length + 2) : ""}`);
}
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: tonal-generation clears all [gate] predicates");
process.exit(0);
