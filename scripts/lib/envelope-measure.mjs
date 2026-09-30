// envelope-measure.mjs - the `--envelope` corpus measurement, factored out of
// scripts/report-preset-fidelity.mjs (#725 U1) so the report and test/engine/chroma-envelope-gate.mjs
// read ONE measurement: the instances (curated palettes at source chroma >= 10, plus the 8 default-kit
// semantic families, not Data 1-8), each palette's controls, `rampChromaOf`, the anchored
// `paletteStops` call (RENDERED path unless `gatePath`), the per-stop ratio to stop 500 and the clause
// counters. The loop is the report's own, moved verbatim; the report's printed numbers do not move.
//
// `dampAmpOverride` forces every palette's `dampAmp` control (the report's `--damp-amp N` negative
// control); `gatePath` omits each palette's `anchor` (the report's `--gate-path`, and the barred
// `gate path` block of its default run, #725 R74). `instances` replaces the loaded corpus with a caller's
// own list of the same shape (`{ label, presetName, pal, doc }`), for a control that needs one planted
// instance (the cusp-run window's L* 5 anchor) without editing a category file. `dampOverride` and
// `dampCurveOverride` (#725 U3) force the damp and dampCurve SLIDERS (the report's `--damp N` and
// `--damp-curve N`); the engine's own mode-scoped mapping still applies to what they set.
import { readFileSync } from "node:fs";
import { hydrate } from "../../src/ui/persist.js";
import { defaultDocument, rampChromaOf, hexToRgb, lstarFromRgb } from "../../src/ui/model.mjs";
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
// OVER_90_AT_300  -  the anchored block's report-only count (#725 R74, C2.2): instances whose stop-300
// ratio exceeds 90% of stop 500's chroma, the ruled p90 bar at that stop. On the anchored path that
// excess is mechanism 3 (a dark anchor's stop 500 sits below its hue's cusp lightness and stop 300 on
// it, so the ratio reads the L* ladder, not the envelope); R74 reports it and bars nothing on it.
export const OVER_90_AT_300 = 90;
// NAMED_EXCEPTIONS  -  owner-ruled perceptual cusp-run violations on the ANCHORED path, keyed
// "<preset name> / <palette name>" (#725 R76 Q2, plan revision 8, C3.2). A named row is still counted
// in `aboveTotal` (the report prints it on the rule-violations line and the gate's cuspRuns ratchet
// holds it) and is listed by name in `namedExceptions`; only the report's exit code reads the unnamed
// count, `aboveTotal - namedAbove`. Kea primary-muted #E1F5DA (L* 94.5) sits above stop 500's chroma
// by construction (mechanism 3 at the L* extreme), 226.02 percent at U2, carried, not caused by U3.
export const NAMED_EXCEPTIONS = new Map([
  ["37° N · November · 05:40 · MV passing Kea, en route Piraeus / primary-muted", "R76 Q2"],
]);

// The cusp-run count's window (#725 R74, C2.2): on the anchored path only anchors whose CIE L* sits
// inside the ramp window [RAMP_L_MIN, RAMP_L_MAX] (src/engine/tonal.js, 9.95 to 95.05) count toward
// the perceptual rule. An anchor outside it renders a clamped pivot, not its own hex, at stop 500, so
// a run measured against that stop is the clamp's, not the envelope's. Every violation the window
// removes from the count is still returned (`perceptualWindowExcluded`) and printed by name.
const anchorLstar = (pal) => (typeof pal.anchor === "string" && /^#[0-9a-f]{6}$/i.test(pal.anchor)
  ? lstarFromRgb(hexToRgb(pal.anchor)) : null);
export const inRampWindow = (lstar) => lstar >= T.RAMP_L_MIN && lstar <= T.RAMP_L_MAX;

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
export async function measureEnvelope({ dampAmpOverride = null, dampOverride = null, dampCurveOverride = null, gatePath = false, instances: injected = null } = {}) {
  const { instances, totalCurated } = injected !== null
    ? { instances: injected, totalCurated: injected.length }
    : await loadEnvelopeInstances();
  const results = {};
  const aboveWitnesses = { perceptual: [], peak: [], even: [] };
  const aboveTotal = { perceptual: 0, peak: 0, even: 0 };
  const adiaAboveTotal = { perceptual: 0, peak: 0, even: 0 };
  const namedAbove = { perceptual: 0, peak: 0, even: 0 };
  const namedExceptions = { perceptual: [], peak: [], even: [] }; // "<label> <worst>% (<ruling>)"
  const perceptualRunFails = { runs: [], bound: [] }; // witnesses, non-Adia only
  const perceptualWindowExcluded = []; // { label, anchor, lstar, why }: violations outside the L* window
  let outsideWindow = 0; // anchored instances whose anchor L* is outside the window (perceptual pass)
  const over90At300 = { perceptual: 0, peak: 0, even: 0 };
  for (const mode of MODES) {
    const ratios = { 100: [], 300: [], 700: [], 900: [] };
    for (const { label, presetName, pal, doc } of instances) {
      const controls = {
        curve: doc.curve, tension: doc.tension, lmin: doc.lmin, lmax: doc.lmax,
        damp: dampOverride !== null ? dampOverride : doc.damp,
        dampCurve: dampCurveOverride !== null ? dampCurveOverride : doc.dampCurve,
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
      if ((at(300).chroma / c500) * 100 > OVER_90_AT_300) over90At300[mode]++;
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
        const lstar = gatePath ? null : anchorLstar(pal);
        const outside = lstar !== null && !inRampWindow(lstar);
        if (outside) outsideWindow++;
        if (!isAdia) {
          const why = [];
          if (runs > 1) why.push(`${runs} runs`);
          if (worstRatio > CUSP_RUN_BOUND + 1e-6) why.push(`${(worstRatio * 100).toFixed(2)}%`);
          if (why.length && outside) {
            perceptualWindowExcluded.push({ label, anchor: pal.anchor.toUpperCase(), lstar, why: why.join(", ") });
          } else if (why.length && !gatePath && NAMED_EXCEPTIONS.has(`${presetName} / ${pal.name}`)) {
            namedAbove[mode]++;
            namedExceptions[mode].push(`${label} ${why.join(", ")} (${NAMED_EXCEPTIONS.get(`${presetName} / ${pal.name}`)})`);
            aboveTotal[mode]++;
          } else if (why.length) {
            if (runs > 1 && perceptualRunFails.runs.length < 3) perceptualRunFails.runs.push(`${label} (${runs} runs)`);
            if (worstRatio > CUSP_RUN_BOUND + 1e-6 && perceptualRunFails.bound.length < 3) perceptualRunFails.bound.push(`${label} (${(worstRatio * 100).toFixed(2)}%)`);
            aboveTotal[mode]++;
          }
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
  return {
    instances, totalCurated, results, aboveTotal, adiaAboveTotal, namedAbove, namedExceptions, aboveWitnesses, perceptualRunFails,
    perceptualWindowExcluded, outsideWindow, over90At300, gatePath,
  };
}
