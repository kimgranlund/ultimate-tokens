#!/usr/bin/env node
// chroma-envelope-gate.mjs - #778: the chroma envelope's closed-form curve is the spec, and this gate
// asserts the continuous curve, not rounded pixels. It renders the C6 corpus (curated palettes at source
// chroma >= 10 plus the 8 default-kit semantic families) in all three modes on EXPORT_STOPS, anchored
// and on the gate path (anchor omitted), through scripts/lib/envelope-measure.mjs's `measureResidues`,
// and holds three legs:
//
// - Gate A (curve): SPEC below is the curve, written out here (sliders, then the mode map, then the
//   curve) and never read from the engine; the only tonal-engine import is `liftStop`, from this file's
//   own tree (the band clause below also reads colour-science primitives: OKLab chroma, CAM16 and the
//   gamut ceiling, from okhsl.js and hct.js, never a tonal constant). A planted engine constant
//   therefore reds this leg; a gate derived from the exported constants
//   would pass it. Per stop: the record's `env` equals the spec curve to 1e-12; on perceptual and peak
//   (rule 2', T-0030) the record's `basis` (the OKHSL s the envelope multiplies: the anchor's own s, or
//   the unanchored key colour's) is constant across the ramp, and at every stop that is not `capped`
//   `model / (damper ?? 1)` equals min(1, max(0, basis * env)) to 1e-9, the s clamp at 1 holdTone
//   applies before the group damper scales it; the anchored path's stop 500 is the anchor itself, so
//   there `model / (damper ?? 1)` equals `basis` (the verbatim anchor) or min(1, basis) (a clamped
//   pivot); on even `model` equals
//   min(maxc, max(min(basis*env, maxc), floor), anchorCap) to 1e-9 relative (at stops not `refined`,
//   not damped by the group, and not the anchored path's stop 500, which is the anchor itself).
//   The band clause (ramp@2, T-0040, ADR-037): every stop's own value above blends toward the band
//   tint by the band weight w, written here from the rule (SPEC's bandLight/bandDark edges): w is 1 at
//   and past each edge and a smoothstep of the liftStop distance from 500 to the edge between, so the
//   own-value forms above hold as written only where w is 0 (stop 500). Elsewhere the model is
//   own + (tint - own) * w: on even the tint is the stop's gamut ceiling `maxc` times the tint
//   fraction; on perceptual and peak it is the record's `tint` (the OKHSL s of that fraction at the
//   stop, which the gate cannot solve without the engine), and the record's `tintFrac` must equal the
//   fraction the rule sets: chromaFloor / 100, capped on the anchored perceptual and peak paths by the
//   anchor's own CAM16 C over its gamut ceiling, and 0 for an achromatic anchor (OKLab C under SPEC's
//   achromaticC). A band stop (w 1) renders the tint itself.
// - Gate B (residue): every emitted pixel reads back within TOL of its stop's `model` (`residueOf`;
//   TOL and the path units are named once, in envelope-measure.mjs). The full table is
//   `node scripts/report-preset-fidelity.mjs --envelope-residue`.
// - Direction, fixture-free: READING (a)'s anchored medians (`measureEnvelope`, emitted CAM16 chroma
//   as % of stop 500's) put stop 100 below stop 300 and stop 900 below stop 700 in every mode.
//
// A full-corpus sweep, so per #713 it is a gate script (`npm run gate:chroma-envelope`, a `gate:sweeps`
// member and a `sweeps` CI matrix leg), not a `test/run.mjs` TESTS entry.
//
//   node test/engine/chroma-envelope-gate.mjs [--full] [--spec <key>=<value> ...] [--engine-dir <tree>]
//
// `--full` is accepted for the shared convention and not read: there is no sampled reading.
// `--spec <key>=<value>` overrides one SPEC entry (okhslD, okhslCurveGain, evenFactor, evenR, bandLight,
// bandDark, achromaticC), the
// negative control for Gate A: a spec the engine does not render reds the curve leg of the modes it maps.
// `--engine-dir <tree>` renders on `<tree>/src/engine/tonal.js` instead of this tree's engine, so a
// planted copy of the engine can be shown to red the gate.
import { liftStop } from "../../src/engine/tonal.js";
import { rgbToOklabChroma } from "../../src/engine/okhsl.js";
import { cam16FromRgb, maxChromaInGamut } from "../../src/engine/hct.js";
import { hexToRgb, lstarFromRgb } from "../../src/ui/model.mjs";
import { MODES, REPORT_STOPS, measureEnvelope, measureResidues, residueOf } from "../../scripts/lib/envelope-measure.mjs";

const SPEC = { okhslD: 0.9275, okhslCurveGain: Math.log2(3) / 1.5, evenFactor: 0.25, evenR: 0.2, bandLight: 100, bandDark: 900, achromaticC: 0.002 };

const argv = process.argv.slice(2);
let engineDir = null;
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--full") continue;
  if (a === "--spec" || a === "--engine-dir") {
    const v = argv[++i];
    if (v === undefined || v.startsWith("--")) { console.log(`FAIL: ${a} needs a value`); process.exit(2); }
    if (a === "--engine-dir") { engineDir = v; continue; }
    const eq = v.indexOf("=");
    const key = eq < 0 ? v : v.slice(0, eq);
    const num = eq < 0 ? NaN : Number(v.slice(eq + 1));
    if (!Object.hasOwn(SPEC, key)) { console.log(`FAIL: --spec has no key ${key} (keys: ${Object.keys(SPEC).join(", ")})`); process.exit(2); }
    if (eq < 0 || v.slice(eq + 1).trim() === "" || !Number.isFinite(num)) { console.log(`FAIL: --spec ${key} needs a number, got ${v}`); process.exit(2); }
    SPEC[key] = num;
    continue;
  }
  console.log(`FAIL: unknown argument ${a}`);
  process.exit(2);
}

// The spec curve: the four sliders through the mode map, then the curve. Read at the lifted stop,
// against stop 500's own lifted reading, |sd| capped at 1.
const residueExp = Math.log(1 - SPEC.okhslD) / Math.log(0.3);
function specEnvelope(stop, lift, c) {
  const sd = Math.max(-1, Math.min(1, (liftStop(stop, lift) - liftStop(500, lift)) / 450));
  const isEven = c.toneMode === "even";
  // the mode map: even compresses damp's headroom and scales dampCurve by evenFactor; perceptual and
  // peak raise damp's headroom r to the residue exponent (r 0.3 maps to 1 - okhslD) and scale dampCurve
  // by okhslCurveGain
  const damp = isEven ? 100 - (100 - c.damp) * SPEC.evenFactor
    : 100 - 100 * Math.max(0, Math.min(1, (100 - c.damp) / 100)) ** residueExp;
  const dampCurve = (isEven ? SPEC.evenFactor : SPEC.okhslCurveGain) * (c.dampCurve ?? 1.5);
  // the curve: 1 + shoulder - damp * side weight * |sd|^dampCurve, with even's smoothstep plateau
  let uG = Math.abs(sd) ** dampCurve;
  if (isEven) {
    const t = Math.min(1, Math.abs(sd) / SPEC.evenR);
    uG *= t * t * (3 - 2 * t);
  }
  const sideW = Math.max(0, 1 + ((c.dampBias ?? 0) / 100) * Math.sign(sd));
  const shoulder = ((c.dampAmp ?? 0) / 100) * 4 * uG * (1 - uG);
  return Math.max(0, 1 + shoulder - (damp / 100) * sideW * uG);
}

// The band rule's blend weight: 1 at and past each band edge, else the smoothstep of the liftStop
// distance from 500 over the edge's own distance (0 at stop 500).
function specBandWeight(stop, lift) {
  if (stop <= SPEC.bandLight || stop >= SPEC.bandDark) return 1;
  const edge = stop < 500 ? SPEC.bandLight : SPEC.bandDark;
  const span = Math.max(1e-9, Math.abs(liftStop(edge, lift) - liftStop(500, lift)));
  const t = Math.min(1, Math.abs(liftStop(stop, lift) - liftStop(500, lift)) / span);
  return t * t * (3 - 2 * t);
}
// The band tint fraction: chromaFloor / 100; on the anchored perceptual and peak paths capped by the
// anchor's own gamut fraction, and 0 for an achromatic anchor.
function specTintFraction(controls, pal, pathName) {
  const floor = (controls.chromaFloor ?? 0) / 100;
  if (controls.toneMode === "even" || pathName !== "anchored" || typeof pal.anchor !== "string" || !/^#[0-9a-f]{6}$/i.test(pal.anchor)) return floor;
  const rgb = hexToRgb(pal.anchor);
  if (rgbToOklabChroma(rgb) < SPEC.achromaticC) return 0;
  const cam = cam16FromRgb(rgb);
  const mc = maxChromaInGamut(cam.hue, lstarFromRgb(rgb));
  return Math.min(floor, mc > 0 ? Math.min(1, cam.chroma / mc) : 0);
}

const paths = [["anchored", false], ["gate path", true]];
const rowsByPath = [];
for (const [name, gatePath] of paths) rowsByPath.push([name, await measureResidues({ engineDir, gatePath })]);
const m = await measureEnvelope({ engineDir });

console.log(`chroma-envelope-gate${engineDir !== null ? ` --engine-dir ${engineDir}` : ""}: ${m.totalCurated} curated palettes, ${m.instances.length} instances (source chroma >= 10 or a default-kit semantic family), anchored and gate path, EXPORT_STOPS`);
console.log(`  spec: ${Object.entries(SPEC).map(([k, v]) => `${k} ${v}`).join(", ")}`);

const fmt = (x) => (Number.isFinite(x) ? x.toFixed(9) : String(x));
let curveBad = 0, curveTotal = 0, residueBad = 0, residueTotal = 0, rule2Clamped = 0, rule2Pivot = 0, bandStops = 0, blendStops = 0, tintCapped = 0;
const curveModes = [], residueModes = [];
for (const mode of MODES) {
  let bad = 0, total = 0;
  const witnesses = [];
  for (const [pathName, rows] of rowsByPath) {
    for (const r of rows) {
      if (r.mode !== mode) continue;
      total++;
      const rec = r.record;
      const why = [];
      const env = specEnvelope(rec.stop, r.pal.lift ?? 0, r.controls);
      if (!(Math.abs(rec.env - env) <= 1e-12)) why.push(`env ${fmt(rec.env)} vs spec ${fmt(env)}`);
      if (mode !== "even") {
        // rule 2': the OKHSL records carry the `basis` they multiply by `env`, so the model is asserted
        // exactly, with no ratio to stop 500 and no stop dropped for a clamp. holdTone reads
        // min(1, max(0, basis * env)) (OKHSL's s = 1 is an approximate gamut boundary, so a boundary
        // key colour reads 1 plus or minus round-off and the clamp is part of the model), and the
        // group damper scales that by `damper` after (dampStops), hence the division. `basis` is
        // constant across the ramp (R69: no climb toward the group), the property the old ratio rule
        // checked implicitly. A capped stop's model is the pre-cap request, so it is not compared.
        // The band clause: the own value blends toward the record's `tint` by w, so the clamped
        // basis * env form is the model only at w 0; a band stop (w 1) is the tint itself.
        const r100 = rec.damper ?? 1;
        const basis500 = r.ramp.find((x) => x.stop === 500)?.basis;
        const w = specBandWeight(rec.stop, r.pal.lift ?? 0);
        const frac = specTintFraction(r.controls, r.pal, pathName);
        if (!Number.isFinite(rec.basis)) why.push(`basis ${rec.basis} is not a number`);
        else if (!(Math.abs(rec.basis - basis500) <= 1e-12)) why.push(`basis ${fmt(rec.basis)} vs stop 500 basis ${fmt(basis500)}`);
        else if (pathName === "anchored" && rec.stop === 500) {
          // the anchor itself: a verbatim stop 500 stores the raw anchor s, a clamped pivot renders
          // through the clamp
          const got = rec.model / r100;
          if (!(Math.abs(got - rec.basis) <= 1e-9 || Math.abs(got - Math.min(1, rec.basis)) <= 1e-9)) {
            why.push(`model ${fmt(got)} vs basis ${fmt(rec.basis)} or its clamp ${fmt(Math.min(1, rec.basis))}`);
          }
          rule2Pivot++;
        } else if (!rec.capped) {
          const got = rec.model / r100;
          const own = Math.min(1, Math.max(0, rec.basis * rec.env));
          const want = own + (rec.tint - own) * w;
          if (!(Math.abs(got - want) <= 1e-9)) why.push(`model ${fmt(got)} vs clamped basis * env ${fmt(own)} blended to tint ${fmt(rec.tint)} by w ${fmt(w)}: ${fmt(want)}`);
          if (!(Math.abs(rec.tintFrac - frac) <= 1e-12)) why.push(`tintFrac ${fmt(rec.tintFrac)} vs spec ${fmt(frac)}`);
          if (w === 1) bandStops++;
          else if (w > 0) blendStops++;
          else rule2Clamped++;
          if (frac < (r.controls.chromaFloor ?? 0) / 100) tintCapped++;
        }
      } else if (!rec.refined && !((rec.damper ?? 1) < 1) && !(pathName === "anchored" && rec.stop === 500)) {
        const own = Math.min(rec.maxc, Math.max(Math.min(rec.basis * rec.env, rec.maxc), rec.floor), rec.anchorCap ?? Infinity);
        const w = specBandWeight(rec.stop, r.pal.lift ?? 0);
        const tint = specTintFraction(r.controls, r.pal, pathName) * rec.maxc;
        const want = own + (tint - own) * w;
        if (!(Math.abs(rec.model - want) <= 1e-9 * Math.max(1, rec.model))) why.push(`model ${fmt(rec.model)} vs curve ${fmt(own)} blended to tint ${fmt(tint)} by w ${fmt(w)}: ${fmt(want)}`);
        if (w === 1) bandStops++;
        else if (w > 0) blendStops++;
      }
      if (why.length) {
        bad++;
        if (witnesses.length < 3) witnesses.push(`${r.label} ${pathName} stop ${rec.stop}: ${why.join("; ")}`);
      }
    }
  }
  console.log(`  curve ${mode}: ${bad}/${total} stop(s) off the spec`);
  for (const w of witnesses) console.log(`    ${w}`);
  curveBad += bad; curveTotal += total;
  if (bad) curveModes.push(mode);
}
for (const mode of MODES) {
  let bad = 0, total = 0;
  const witnesses = [];
  for (const [pathName, rows] of rowsByPath) {
    for (const r of rows) {
      if (r.mode !== mode) continue;
      total++;
      if (r.within) continue;
      bad++;
      if (witnesses.length < 3) {
        const x = residueOf(r.record, mode);
        witnesses.push(`${r.label} ${pathName} stop ${r.stop} ${r.cls}: model ${fmt(x.model)} readback ${fmt(x.readback)} range [${fmt(x.lo)}, ${fmt(x.hi)}] at +/-${x.k} codes, rgb ${r.record.rgb.join(",")}`);
      }
    }
  }
  console.log(`  residue ${mode}: ${bad}/${total} stop(s) outside TOL`);
  for (const w of witnesses) console.log(`    ${w}`);
  residueBad += bad; residueTotal += total;
  if (bad) residueModes.push(mode);
}

const dirFails = [];
for (const mode of MODES) {
  const med = m.results[mode];
  for (const [end, inner] of [[100, 300], [900, 700]]) {
    if (!(med[end].median < med[inner].median)) {
      dirFails.push(`${mode} ${end}<${inner}`);
      console.log(`    direction: ${mode} stop ${end} median ${med[end].median.toFixed(4)} is not below stop ${inner} median ${med[inner].median.toFixed(4)}`);
    }
  }
}

// vacuity: an empty population passes every leg above without reading anything
const vacuity = [];
for (const mode of MODES) for (const s of REPORT_STOPS) if (!(m.results[mode][s].n > 0)) vacuity.push(`direction ${mode} ${s} n ${m.results[mode][s].n}`);
if (!(curveTotal > 0)) vacuity.push("curve read 0 stops");
if (!(residueTotal > 0)) vacuity.push("residue read 0 stops");
if (!(rule2Clamped > 0)) vacuity.push("rule 2' read 0 stops under the clamped basis form");
if (!(rule2Pivot > 0)) vacuity.push("rule 2' read 0 anchored stop 500 pivots");
if (!(bandStops > 0)) vacuity.push("the band clause read 0 band stops");
if (!(blendStops > 0)) vacuity.push("the band clause read 0 blended interior stops");
for (const v of vacuity) console.log(`    vacuity: ${v}`);

if (curveBad || residueBad || dirFails.length || vacuity.length) {
  const parts = [];
  if (vacuity.length) parts.push(`${vacuity.length} vacuity failure(s)`);
  if (curveBad) parts.push(`curve: ${curveBad}/${curveTotal} stop(s) off the spec (${curveModes.join(", ")})`);
  if (residueBad) parts.push(`residue: ${residueBad}/${residueTotal} stop(s) outside TOL (${residueModes.join(", ")})`);
  if (dirFails.length) parts.push(`direction fails: ${dirFails.join(", ")}`);
  console.log(`  FAIL  chroma-envelope: ${parts.join("; ")}`);
  process.exit(1);
}
console.log(`  rule 2' (perceptual, peak): ${rule2Clamped + rule2Pivot} stops covered (${rule2Clamped} on the clamped basis form, ${rule2Pivot} anchored stop 500s on the anchor itself), capped stops excluded, basis constant across every ramp`);
console.log(`  band clause (ramp@2): ${bandStops} band stops on the tint, ${blendStops} interior stops blended toward it (all modes), ${tintCapped} OKHSL stops on an anchor-capped tint fraction`);
console.log(`  pass  chroma-envelope: curve exact at ${curveTotal} stops; residue within TOL at ${residueTotal} stops; direction holds in ${MODES.length} modes`);
