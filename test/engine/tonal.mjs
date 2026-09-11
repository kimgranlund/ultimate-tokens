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
import * as T from "../../src/engine/tonal.js";
import * as E from "../../src/engine/hct.js";
import { rgbToOklchHue, rgbToOkhsl } from "../../src/engine/okhsl.js";

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
}

// ── hpg-tonal-intensity-legacy: baseIntensity 100 is byte-identical to the pre-feature engine (AC-003/007, EX-1)
// The fixture was generated from the pre-change engine (commit 83756bb) by scripts/gen-tonal-fixture.mjs and is
// regenerated only by hand, never by npm test. keyIntensity is inert everywhere now (#536 retired the ramp-level
// spike it used to drive), so 0 and 100 both match at base 100 — and at every other base too (see intensity-spike).
{
  const FX = JSON.parse(readFileSync(new URL("./fixtures/tonal-legacy.json", import.meta.url), "utf8")).paths;
  const dc = T.DEFAULT_CONTROLS || {};
  if (dc.baseIntensity !== 100 || dc.keyIntensity !== 100) FAIL("intensity-legacy", `DEFAULT_CONTROLS intensity ${dc.baseIntensity}/${dc.keyIntensity}, want 100/100 (H1)`);
  if (T.DEFAULT_IDENTITY_STOPS !== undefined) FAIL("intensity-legacy", "DEFAULT_IDENTITY_STOPS must not exist — the ramp no longer special-cases any stop (#536)");
  let cells = 0;
  for (const toneMode of ["perceptual", "even"]) for (const p of DEFAULTS) for (const keyIntensity of [0, 100]) {
    const ctl = { ...dc, toneMode, baseIntensity: 100, keyIntensity };
    const got = T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift }, ctl, STOPS).map((r) => r.hex);
    const want = FX[toneMode][p.name];
    if (!want || want.length !== STOPS.length) { FAIL("intensity-legacy", `fixture has no ${toneMode}/${p.name} ramp of ${STOPS.length} stops`); continue; }
    for (let i = 0; i < STOPS.length; i++) { cells++; if (got[i] !== want[i]) { FAIL("intensity-legacy", `${toneMode} ${p.name} stop ${STOPS[i]} (k=${keyIntensity}): ${got[i]} != fixture ${want[i]}`); break; } }
  }
  if (cells < 2 * DEFAULTS.length * STOPS.length) FAIL("intensity-legacy", `only ${cells} fixture cells compared`);
  // a palette `intensity: 100` override inside a document at 100 is also inert
  const p = DEFAULTS.find((d) => d.chroma >= 50) || DEFAULTS[0];
  const a = T.paletteStops({ hue: p.hue, chroma: p.chroma, skew: 0, lift: 0, intensity: 100 }, { ...dc, baseIntensity: 100 }, STOPS).map((r) => r.hex).join();
  if (a !== FX.perceptual[p.name].join()) FAIL("intensity-legacy", `${p.name} intensity:100 override at base 100 moved the ramp`);
}

// ── hpg-tonal-intensity-spike: I(stop) = b uniformly, no stop special-cased; keyIntensity is fully inert
// (#536 retired the identity-stop chroma lift this group used to test — AC-002/004/006, EX-2) ────────────
{
  const dc = T.DEFAULT_CONTROLS || {};
  // (a) intensityAt itself — the formula, the clamp, and proof no stop (nor keyIntensity) is special-cased.
  // FORMER_IDENTITY_STOPS is the retired spike's stop set, reused here ONLY as a negative control: every one
  // of them must now behave exactly like an ordinary stop (500/750/250).
  const near = (a, b, tol = 1e-12) => Math.abs(a - b) <= tol;
  const FORMER_IDENTITY_STOPS = [350, 400, 450, 550, 650, 700];
  for (const stop of [...FORMER_IDENTITY_STOPS, 500, 750, 250]) {
    if (!near(T.intensityAt(stop, {}, { baseIntensity: 40 }), 0.4)) FAIL("intensity-spike", `I(${stop}) must be b (0.4) — no stop is special-cased`);
    // keyIntensity, at any value, must not move the result — the spike it used to drive is retired
    if (!near(T.intensityAt(stop, {}, { baseIntensity: 40, keyIntensity: 100 }), 0.4)) FAIL("intensity-spike", `I(${stop}) at keyIntensity 100 must still be b — keyIntensity is inert`);
    if (!near(T.intensityAt(stop, {}, { baseIntensity: 40, keyIntensity: 0 }), 0.4)) FAIL("intensity-spike", `I(${stop}) at keyIntensity 0 must still be b — keyIntensity is inert`);
  }
  if (!near(T.intensityAt(550, {}, { baseIntensity: 140 }), 1.0)) FAIL("intensity-spike", "baseIntensity must clamp to 1 above 100");
  if (!near(T.intensityAt(550, {}, { baseIntensity: -5 }), 0)) FAIL("intensity-spike", "baseIntensity must clamp to 0 below 0");
  if (!near(T.intensityAt(550, {}, {}), 1.0)) FAIL("intensity-spike", "no controls → 1");
  if (!near(T.intensityAt(500, { intensity: 40 }, { baseIntensity: 100 }), 0.4)) FAIL("intensity-spike", "palette.intensity still overrides controls.baseIntensity");
  // (b) measured ramps on BOTH paths: a probe palette below the gamut ceiling (chroma 40) so no clamp binds.
  // Even path: r.chroma is the APPLIED chroma → ratio is exact. Perceptual path: read the OKHSL saturation
  // back from the emitted pixel (8-bit quantised) → ratio within 2% of the peak (s=1).
  // hueSpace pinned to "cam16" so the stop-500 hue anchor doesn't re-solve the base hue under intensity,
  // isolating the multiplier; (d) below covers the oklch anchor at every intensity.
  const probe = { hue: 267, chroma: 40, skew: 0, lift: 0 };
  const b = 0.4;
  for (const toneMode of ["perceptual", "even"]) {
    const base = { ...dc, toneMode, hueSpace: "cam16", chromaFloor: 0 };
    const legacy = T.paletteStops(probe, { ...base, baseIntensity: 100 }, STOPS);
    // keyIntensity: 37 — an arbitrary, asymmetric value; the ramp must come out identical to keyIntensity absent
    const muted = T.paletteStops(probe, { ...base, baseIntensity: b * 100, keyIntensity: 37 }, STOPS);
    for (let i = 0; i < STOPS.length; i++) {
      const stop = STOPS[i], want = b; // every stop, uniformly — the identity-stop lift is gone
      let ratio, tol;
      if (toneMode === "even") { if (legacy[i].chroma < 0.5 || legacy[i].chroma >= legacy[i].maxc - 1e-6) continue; /* ceiling-bound (050 white) */ ratio = muted[i].chroma / legacy[i].chroma; tol = 1e-9; }
      else {
        const sl = rgbToOkhsl(legacy[i].rgb).s, sm = rgbToOkhsl(muted[i].rgb).s;
        // The light/dark ends (measured chroma < 10) sit where one 8-bit step moves OKHSL s by >2%, so the
        // ratio is quantisation noise there; assert only that muting never ADDS saturation, and measure the
        // ratio on the mid stops.
        if (legacy[i].chroma < 10) { if (sm > sl + 0.02 && legacy[i].chroma > 3) { FAIL("intensity-spike", `${toneMode} stop ${stop}: muted s ${sm.toFixed(3)} > legacy ${sl.toFixed(3)}`); break; } continue; }
        ratio = sm / sl; tol = 0.02 / sl;
      }
      if (Math.abs(ratio - want) > tol + 1e-9) { FAIL("intensity-spike", `${toneMode} stop ${stop}: chroma ratio ${ratio.toFixed(4)} vs I=${want} (tol ${tol.toFixed(3)})`); break; }
      // tones are the SAME across intensities (REQ-002 touches chroma only) — even path: toneAt; perceptual: OKHSL l
      if (toneMode === "even" && Math.abs(muted[i].tone - legacy[i].tone) > 1e-9) { FAIL("intensity-spike", `${toneMode} stop ${stop}: tone moved under intensity`); break; }
      if (toneMode === "perceptual" && Math.abs(rgbToOkhsl(muted[i].rgb).l - rgbToOkhsl(legacy[i].rgb).l) > 0.02) { FAIL("intensity-spike", `${toneMode} stop ${stop}: OKHSL lightness moved under intensity`); break; }
    }
  }
  // (d) AC-005: the OKLCH hue anchor holds at every intensity — stop 500 exports on the SET hue at baseIntensity
  // 20/45/100 on both paths. At low baseIntensity, stop 500 sits at low CAM16 chroma (near grey), where ONE
  // 8-bit step moves the pixel's OKLCH hue by several degrees: the 1° figure is below the pixel's own
  // resolution there. Tolerance = max(1°, 2 × the one-step hue quantum of the emitted pixel): one step for
  // the solver (it iterates on rounded pixels) plus one for emission. Negative control (measured while building
  // this gate, pre-#536): with I(500) dropped from the anchors the even path sits at 6.5-9.4° at 20 and
  // 2.7-4.8° at 45 — several quanta out — so the bound still bites on the defect REQ-005 exists to prevent.
  const quantum = (rgb) => { const h0 = rgbToOklchHue(rgb); let m = 0; for (let c = 0; c < 3; c++) for (const d of [-1, 1]) { const r = [...rgb]; r[c] = Math.min(255, Math.max(0, r[c] + d)); m = Math.max(m, angDiff(rgbToOklchHue(r), h0)); } return m; };
  for (const toneMode of ["perceptual", "even"]) for (const baseIntensity of [20, 45, 100]) {
    const oc = { ...dc, hueSpace: "oklch", toneMode, baseIntensity, damp: 96, dampCurve: 1.2 };
    for (const [hue, chroma] of [[300, 76], [235, 80], [270, 70], [70, 100], [27, 55], [145, 55], [190, 60]]) {
      const s500 = T.paletteStops({ hue, chroma, skew: 0, lift: 0 }, oc, STOPS).find((s) => s.stop === 500);
      const err = angDiff(rgbToOklchHue(s500.rgb), hue), tol = Math.max(1.0, 2 * quantum(s500.rgb));
      if (err > tol) { FAIL("intensity-spike", `${toneMode} hue ${hue} at baseIntensity ${baseIntensity}: stop 500 off by ${err.toFixed(2)}° (> ${tol.toFixed(2)}° = max(1°, 2 quanta))`); break; }
    }
  }
  // (e) AC-006: gamut + monotonic + white endpoint hold at baseIntensity 45 on the defaults; even-path tones equal within 1e-9
  for (const toneMode of ["perceptual", "even"]) for (const p of DEFAULTS) {
    const c45 = { ...dc, toneMode, baseIntensity: 45 }, c100 = { ...dc, toneMode, baseIntensity: 100 };
    const pal = { hue: p.hue, chroma: p.chroma, skew: p.skew, lift: 0 }; // lift 0: the monotonic contract is lift-0 (hpg-tonal-monotonic)
    const rows = T.paletteStops(pal, c45, STOPS), ref = T.paletteStops(pal, c100, STOPS);
    if (rows[0].rgb.some((v) => v !== 255)) FAIL("intensity-spike", `${toneMode} ${p.name} 050 not white at baseIntensity 45`);
    for (let i = 0; i < rows.length; i++) {
      // ceiling check on the even path only (as hpg-tonal-ingamut): the perceptual path reports MEASURED chroma
      if (!rows[i].inGamut || (toneMode === "even" && rows[i].chroma > rows[i].maxc + 0.5)) { FAIL("intensity-spike", `${toneMode} ${p.name} stop ${STOPS[i]} out of gamut at baseIntensity 45`); break; }
      if (i && rows[i].tone > rows[i - 1].tone + 1e-6) { FAIL("intensity-spike", `${toneMode} ${p.name}: tone rose at stop ${STOPS[i]} under baseIntensity 45`); break; }
      if (toneMode === "even" && Math.abs(rows[i].tone - ref[i].tone) > 1e-9) { FAIL("intensity-spike", `${toneMode} ${p.name} stop ${STOPS[i]}: tone differs across intensities`); break; }
    }
  }
}

// ── hpg-tonal-intensity-override: palette.intensity wins over controls.baseIntensity (AC-001, EX-4) ─────
{
  const dc = T.DEFAULT_CONTROLS || {};
  for (const toneMode of ["perceptual", "even"]) {
    const doc40 = { ...dc, toneMode, baseIntensity: 40, keyIntensity: 100 };
    const doc100 = { ...dc, toneMode, baseIntensity: 100 };
    const warn = DEFAULTS.find((d) => /warn/i.test(d.name)) || DEFAULTS[1], prim = DEFAULTS[0];
    const pal = (p, extra) => ({ hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift, ...extra });
    const hexes = (p, c) => T.paletteStops(p, c, STOPS).map((r) => r.hex).join();
    // a palette at 100 inside a document at 40 reproduces its legacy ramp exactly
    if (hexes(pal(warn, { intensity: 100 }), doc40) !== hexes(pal(warn), doc100)) FAIL("intensity-override", `${toneMode}: ${warn.name} intensity:100 in a 40 document != its legacy ramp`);
    // ...while an un-overridden palette in the same document is muted (differs from legacy)
    if (hexes(pal(prim), doc40) === hexes(pal(prim), doc100)) FAIL("intensity-override", `${toneMode}: ${prim.name} at base 40 equals legacy — intensity not applied`);
    // a palette override BELOW the document base also wins (override is a replacement, not a min/max)
    if (hexes(pal(prim, { intensity: 40 }), doc100) !== hexes(pal(prim), doc40)) FAIL("intensity-override", `${toneMode}: intensity:40 in a 100 document != base-40 ramp`);
    // null/undefined intensity falls through to the document base
    if (hexes(pal(prim, { intensity: undefined }), doc40) !== hexes(pal(prim), doc40)) FAIL("intensity-override", `${toneMode}: undefined intensity must fall through to baseIntensity`);
  }
}

// ── REPORT ───────────────────────────────────────────────────────────────────────────────
for (const g of ["ingamut", "monotonic", "white-endpoint", "chroma-target", "curve-fidelity", "hue-stability", "damping-curve", "edge-hue", "rel-chroma", "okhsl-modes", "chroma-floor", "vibrancy", "oklch-hue-anchor", "intensity-legacy", "intensity-spike", "intensity-override"]) {
  const f = fails.find((x) => x.startsWith(g + ":"));
  console.log(`  ${f ? "FAIL" : "pass"}  ${g}${f ? "  — " + f.slice(g.length + 2) : ""}`);
}
if (fails.length) { console.error(`\nFAIL: ${fails.length} gate failure(s)`); process.exit(1); }
console.log("\nPASS: tonal-generation clears all [gate] predicates");
process.exit(0);
