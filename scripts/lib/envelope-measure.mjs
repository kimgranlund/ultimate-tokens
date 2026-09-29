// envelope-measure.mjs - the `--envelope` corpus measurement, factored out of
// scripts/report-preset-fidelity.mjs (#725 U1) so the report and test/engine/chroma-envelope-gate.mjs
// read ONE measurement: the instances (curated palettes at source chroma >= 10, plus the 8 default-kit
// semantic families, not Data 1-8), each palette's controls, `rampChromaOf`, the anchored
// `paletteStops` call (RENDERED path unless `gatePath`), the per-stop ratio to stop 500 and the clause
// counters. The loop is the report's own, moved verbatim; the report's printed numbers do not move.
//
// `dampAmpOverride` forces every palette's `dampAmp` control (the report's `--damp-amp N` negative
// control); `gatePath` omits each palette's `anchor` (the report's `--gate-path`).
import { readFileSync } from "node:fs";
import { hydrate } from "../../src/ui/persist.js";
import { defaultDocument, rampChromaOf } from "../../src/ui/model.mjs";
import * as T from "../../src/engine/tonal.js";

export const CATS = ["architecture", "brands", "cuisine", "film", "literature", "music", "nature", "travel"];
export const REPORT_STOPS = [100, 300, 700, 900];
export const MODES = ["perceptual", "peak", "even"];
// ADIA_CARVEOUT  -  the one named, owner-ruled AUTHORED (dampAmp>0) exception (test/engine/tonal.mjs
// carries the gating copy of this set; this copy is for REPORTING only, so a FAIL/OK line reads
// true rather than perpetually flagging the allowed Adia population).
export const ADIA_CARVEOUT = new Set(["Adia · The product's own design system"]);
// CUSP_RUN_BOUND  -  perceptual's owner-ruled bound (#681 U3 pass 6, ruling (f), plan revision 20):
// 189.3005% of stop 500's own chroma, EXACT  -  the corpus's fresh-measured worst cusp-stop excess
// (89.3005pp, cuisine "Sushi & sashimi · the cypress counter"/primary-muted, cusp stop 650), frozen at
// this precise value, not rounded. Even and peak keep the literal "0 above 100%" reading; perceptual is
// reported under its own ruled clause instead (one contiguous above-anchor run, every stop in it at or
// under this bound)  -  see test/engine/tonal.mjs's gating copy (C6 iii-b) for the enforced version; this
// copy is for REPORTING only.
export const CUSP_RUN_BOUND = 1.893005;

export function percentile(sorted, p) {
  if (sorted.length === 0) return NaN;
  const idx = (p / 100) * (sorted.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

// The C6 corpus: curated palettes at source chroma >= 10, plus the 8 default-kit semantic families.
export async function loadEnvelopeInstances() {
  const RT = JSON.parse(readFileSync(new URL("../../docs/reference/data/role-table.json", import.meta.url), "utf8"));
  const DEFAULT_KIT_NAMES = new Set(RT.defaults.filter((d) => !/^Data \d+$/.test(d.name)).map((d) => d.name)); // the 8 semantic families, not Data 1-8
  const instances = []; // { label, presetName, pal, doc }
  let totalCurated = 0;
  for (const slug of CATS) {
    const { PRESETS } = await import(`../../src/ui/categories/${slug}.js`);
    for (const preset of PRESETS) {
      const doc = hydrate({ ...preset });
      for (const pal of doc.palettes) {
        totalCurated++;
        if (pal.chroma >= 10) instances.push({ label: `${slug}/${preset.name}/${pal.name}`, presetName: preset.name, pal, doc });
      }
    }
  }
  const roleDoc = defaultDocument();
  for (const p of roleDoc.palettes) {
    if (DEFAULT_KIT_NAMES.has(p.name)) instances.push({ label: `default/${p.name}`, presetName: null, pal: p, doc: roleDoc });
  }
  return { instances, totalCurated };
}

// READING (a): emitted CAM16 chroma at stops 100/300/700/900 as % of stop 500's, per mode, with the
// clause counters (perceptual: cusp-run rule violations; peak and even: instances above 100%).
// Returns the unrounded median/p90 per mode and stop; callers round for display.
export async function measureEnvelope({ dampAmpOverride = null, gatePath = false } = {}) {
  const { instances, totalCurated } = await loadEnvelopeInstances();
  const results = {};
  const aboveWitnesses = { perceptual: [], peak: [], even: [] };
  const aboveTotal = { perceptual: 0, peak: 0, even: 0 };
  const adiaAboveTotal = { perceptual: 0, peak: 0, even: 0 };
  const perceptualRunFails = { runs: [], bound: [] }; // witnesses, non-Adia only

  for (const mode of MODES) {
    const ratios = { 100: [], 300: [], 700: [], 900: [] };
    for (const { label, presetName, pal, doc } of instances) {
      const controls = {
        curve: doc.curve, tension: doc.tension, lmin: doc.lmin, lmax: doc.lmax,
        damp: doc.damp, dampCurve: doc.dampCurve,
        dampAmp: dampAmpOverride !== null ? dampAmpOverride : doc.dampAmp,
        dampBias: doc.dampBias, hueSpace: doc.hueSpace, relChroma: doc.relChroma,
        chromaFloor: doc.chromaFloor, vibrancy: doc.vibrancy, toneMode: mode,
      };
      const chroma = rampChromaOf(pal, doc);
      // anchor: pal.anchor (U4 pass 2, addendum 2): this call omitted the anchor field, so every ramp it
      // reported rendered on the NON-anchored construction regardless of whether the source preset is
      // anchored - the same fault the dip gate had. Passing anchor through matches projectView's own call
      // shape (src/ui/model.mjs, "the SAME resolved-chroma call" the report's own header already claimed).
      const ramp = T.paletteStops(
        { hue: pal.hue, chroma, skew: pal.skew, lift: pal.lift, hueShift: pal.hueShift ?? 0, hueSameDir: pal.hueSameDir === true, cuspPull: pal.cuspPull, anchor: gatePath ? undefined : pal.anchor },
        controls,
        T.STOPS,
      );
      const at = (s) => ramp.find((r) => r.stop === s);
      const c500 = at(500).chroma;
      if (c500 <= 1e-9) continue; // undefined ratio at a near-zero anchor; excluded rather than divide-by-zero
      for (const s of REPORT_STOPS) {
        const pct = (at(s).chroma / c500) * 100;
        ratios[s].push(pct);
      }
      const isAdia = ADIA_CARVEOUT.has(presetName);
      if (mode === "perceptual") {
        // Ruling (f): report by RUN, not by raw stop count  -  a palette's natural cusp shoulder can span
        // several adjacent stops; only a SECOND separate run, or any stop past CUSP_RUN_BOUND, is a fail.
        let runs = 0, inRun = false, worstRatio = 0;
        for (const s of T.STOPS) {
          const pct = at(s).chroma / c500;
          if (pct > 1 + 1e-6) { if (!inRun) runs++; inRun = true; worstRatio = Math.max(worstRatio, pct); }
          else inRun = false;
        }
        if (runs > 0 && isAdia) adiaAboveTotal[mode]++;
        if (!isAdia) {
          let bad = false;
          if (runs > 1) { bad = true; if (perceptualRunFails.runs.length < 3) perceptualRunFails.runs.push(`${label} (${runs} runs)`); }
          if (worstRatio > CUSP_RUN_BOUND + 1e-6) { bad = true; if (perceptualRunFails.bound.length < 3) perceptualRunFails.bound.push(`${label} (${(worstRatio * 100).toFixed(2)}%)`); }
          if (bad) aboveTotal[mode]++;
        }
      } else {
        let roseAboveHere = false;
        for (const s of T.STOPS) {
          const pct = (at(s).chroma / c500) * 100;
          if (pct > 100 + 1e-6) roseAboveHere = true;
        }
        if (roseAboveHere) {
          if (isAdia) adiaAboveTotal[mode]++;
          else {
            aboveTotal[mode]++;
            if (aboveWitnesses[mode].length < 3) aboveWitnesses[mode].push(label);
          }
        }
      }
    }
    results[mode] = {};
    for (const s of REPORT_STOPS) {
      const sorted = [...ratios[s]].sort((a, b) => a - b);
      results[mode][s] = { median: percentile(sorted, 50), p90: percentile(sorted, 90), n: sorted.length };
    }
  }
  return { instances, totalCurated, results, aboveTotal, adiaAboveTotal, aboveWitnesses, perceptualRunFails };
}
