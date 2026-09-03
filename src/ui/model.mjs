// model.mjs — the PURE, importable core of the HCT Palette Generator UI.
//
// No DOM, no storage, no globals. It composes the six validated capability
// modules into:
//
//   defaultDocument()      -> a State (8 default palettes + DEFAULT_CONTROLS)
//   projectView(document)  -> the document->view projection the whole right
//                             side of the app renders from (no stored derived
//                             state; recompute on every edit).
//
// The document is the single source of truth. Every value on the right of the
// app is projectView(document) — recomputed, never persisted.

import { COLLECTIONS } from "../engine/collections.js";
import {
  hctToRgb,
  hctToOklch,
  lstarFromRgb,
  cam16FromRgb,
  peakC,
} from "../engine/hct.js";
import { oklchToRgb } from "../engine/okhsl.js";
import { iconSystem } from "../engine/icon-systems.mjs";
import { motionTokens } from "../engine/motion.mjs";
import {
  paletteStops,
  effHue,
  STOPS,
  EXPORT_STOPS,
  DEFAULT_CONTROLS,
} from "../engine/tonal.js";
import { semanticRoles, refKey, applyRoleOverrides, applyOnColorContrast, applyAccentRef } from "../engine/semantic.js";
import { typeScale, DEFAULT_TYPE } from "../engine/type.mjs";
import { geomScale, DEFAULT_GEOMETRY, RAMP_LADDER } from "../engine/geometry.mjs";

// geometryScale — the resolved geometry for a doc, COMPOSED with its type scale so a control's text
// size (the per-step `font` at SM/MD/LG) comes from the brand's UI-CONTROL voice (TKT-0008 — rerouted
// off Label 2026-07-16; XS/XL/2XL fall back to the engine's fixed CONTROL_FONT ramp). The single place
// the two systems are joined; brandKit + the app's Geometry section/exports all go through it (via
// `geomScaleFor`, below — this wrapper stays for external/back-compat callers that pass ad-hoc override
// slices rather than a modeKey; the no-opts case IS `geomScaleFor(doc, "base")`).
// `opts.overrides` (optional) — the flat `<size>→height` BASE override slice; threaded into geomScale.
// `opts.typeOverrides` (optional) — the flat `<voice>|<step>→size` BASE slice for the COMPOSED type
// scale, so a UI-control override carries into the shared per-step `font` too.
export function geometryScale(doc, opts = {}) {
  if (!opts.overrides && !opts.typeOverrides) return geomScaleFor(doc, "base");
  const tcfg = { ...(doc.type || DEFAULT_TYPE) };
  if (opts.typeOverrides) tcfg.overrides = opts.typeOverrides;
  return geomScale(doc.geometry || DEFAULT_GEOMETRY, { typeScale: typeScale(tcfg), overrides: opts.overrides });
}

// ── The mode-aware resolution layer (A1, #456) ──────────────────────────────────────────────────
// Lifted out of app.js/sections/{typography,geometry}.js: every one of these is a PURE function of
// `doc` (+ a modeKey), so it belongs beside `projectView`/`geometryScale`, not scattered across two
// hand-mirrored instance-method files. `brandKit()` and the section resolvers (drawer/apply-gate/the
// tokens matrix/the specimen) all call these same exports now — a single implementation instead of
// four independently-written joins that happened to agree.
//
// doc.type.tokenOverrides     = { "<voice>|<step>|<modeKey>": <sizePx> }
// doc.geometry.tokenOverrides = { "<size>|<modeKey>": <heightPx> }
// modeKey = "base" or a breakpoint mode's id; "|" never appears in a voice/step/size name.

// STANDARD_TYPE_RUNGS / STANDARD_GEOM_RUNGS — the ratified desktop-anchored Standard sets (Kim,
// 2026-07-10): Tablet/Mobile derive DOWN via a fixed factor/height-drop from the doc's own base.
// STABLE ids (not seeded/random) so a token override written against a not-yet-materialized rung
// keeps resolving once it IS materialized (see `setTypeTokenOverride`/`setGeomTokenOverride` in the
// section mixins, which still own the materialize-on-first-edit + Standard-set UI).
export const STANDARD_TYPE_RUNGS = [
  { id: "std-tablet", name: "Tablet", factor: 5 / 6, w: 992 },
  { id: "std-mobile", name: "Mobile", factor: 2 / 3, w: 476 },
];
export const STANDARD_GEOM_RUNGS = [
  { id: "std-tablet", name: "Tablet", w: 992, drop: 2 },
  { id: "std-mobile", name: "Mobile", w: 476, drop: 4 },
];

// typeEffectiveModes(doc) — doc.type.modes if any have been materialized, else the Standard set
// rendered LIVE so Tablet/Mobile are visible/selectable/previewable without an explicit materialize
// step. Shaped identically to a real mode entry so every consumer (the mode tabs, the tokens matrix,
// `typeScaleFor`) treats them the same way.
export function typeEffectiveModes(doc) {
  const t = doc.type || DEFAULT_TYPE;
  if ((t.modes || []).length) return t.modes;
  return STANDARD_TYPE_RUNGS.map((r) => ({ id: r.id, name: r.name, factor: r.factor, minWidth: r.w }));
}

// geomEffectiveModes(doc) — the geometry analog: heights derived from the doc's CURRENT baseHeight.
export function geomEffectiveModes(doc) {
  const g = doc.geometry || DEFAULT_GEOMETRY;
  if ((g.modes || []).length) return g.modes;
  const bh = Number(g.baseHeight) || DEFAULT_GEOMETRY.baseHeight || 28;
  return STANDARD_GEOM_RUNGS.map((r) => ({ id: r.id, name: r.name, baseHeight: Math.max(20, bh - r.drop), minWidth: r.w }));
}

// modeTierNudge(modeFactor) — per-cell overrides for the canonical breakpoint tiers, from the ratified
// magnitude table (2026-07-16, at request — supersedes 2026-07-13's Body Mobile nudge: Body is now
// FROZEN across Desktop/Tablet/Mobile like the rest of the body class). The general hierarchy-aware
// law freezes everything at-or-below bodyBase, so it can't step the LABEL family down on the small
// tiers (or land the Label/Tiny cells on the table's off-ladder values on the large ones) on its own;
// targeted per-cell overrides (the EXISTING size-override mechanism) carry the table's cells. Keyed on
// the FACTOR itself (not a mode's name/id), so it applies consistently whether a tier is the
// synthesized (no-modes) shape or the materialized Standard set. The SINGLE source for every call
// site (`typeScaleFor` / `typeModeScales` / `geomModeScales`), so they can never independently drift.
export function modeTierNudge(modeFactor) {
  const near = (x) => Math.abs((modeFactor || 1) - x) < 1e-9;
  const fam = (voices, sizes) => Object.fromEntries(voices.flatMap((v) => ["SM", "MD", "LG"].map((s, i) => [`${v}|${s}`, sizes[i]])));
  const fam6 = (voices, sizes) => Object.fromEntries(voices.flatMap((v) => ["XS", "SM", "MD", "LG", "XL", "2XL"].map((s, i) => [`${v}|${s}`, sizes[i]])));
  const LABELS = ["Label", "Label-mono", "Kicker"]; // Label-mono + Kicker peg to Label's sizes by design
  // UI-control/UI-widget (TKT-0008, extended to the full XS..2XL ramp 2026-07-16): every non-Desktop
  // tier carries the ratified tables' full hand columns — the freeze law can't hold XL/2XL (they sit
  // above bodyBase, so Tablet/Mobile would compress them) and the nice-ladder re-rounds the Lg/Xl
  // scaled odd values, so hand cells are the deterministic path for all four tiers.
  if (near(5 / 6)) return { ...fam(LABELS, [11, 12, 13]), ...fam6(["UI-control"], [12, 13, 15, 16, 18, 20]), ...fam6(["UI-widget"], [9, 10, 11, 12, 13, 14]) }; // Tablet (UI voices frozen at Desktop)
  if (near(2 / 3)) return { ...fam(LABELS, [10, 11, 12]), ...fam6(["UI-control"], [12, 13, 15, 16, 18, 20]), ...fam6(["UI-widget"], [9, 10, 11, 12, 13, 14]) }; // Mobile (UI voices frozen at Desktop)
  if (near(0.89)) return { ...fam(LABELS, [13, 14, 15]), ...fam6(["UI-control"], [14, 15, 17, 18, 20, 22]), ...fam6(["UI-widget"], [11, 12, 13, 14, 15, 16]) }; // Desktop Lg
  if (near(0.80)) return { ...fam(LABELS, [16, 17, 18]), ...fam(["Tiny", "Tiny-mono"], [12, 13, 14]), ...fam6(["UI-control"], [16, 17, 18, 20, 22, 24]), ...fam6(["UI-widget"], [13, 14, 15, 16, 17, 18]) }; // Desktop Xl
  return null;
}

// overridesFor(store, modeKey) — the flat { "<...>": value } slice for one mode, stripped of its
// "|<modeKey>" suffix. The ONE slicer for all three former copies (baseOverrideSlice + the section
// mixins' _typeOverridesFor/_geomOverridesFor): drops non-finite/non-positive values (dormant filter —
// the live setters + persist's clampTokenOverrides already guarantee valid values reach here, so this
// never changes behavior for a real doc) and returns undefined when nothing applies, so the resolved
// scale stays byte-identical (the identity gate).
function overridesFor(store, modeKey) {
  if (!store || typeof store !== "object") return undefined;
  const out = {};
  const suffix = "|" + modeKey;
  for (const k of Object.keys(store)) {
    if (!k.endsWith(suffix)) continue;
    const v = store[k];
    if (typeof v !== "number" || !Number.isFinite(v) || v <= 0) continue;
    out[k.slice(0, k.length - suffix.length)] = v;
  }
  return Object.keys(out).length ? out : undefined;
}
export function typeOverridesFor(doc, modeKey) {
  return overridesFor(doc.type && doc.type.tokenOverrides, modeKey);
}
export function geomOverridesFor(doc, modeKey) {
  return overridesFor(doc.geometry && doc.geometry.tokenOverrides, modeKey);
}

// typeScaleFor(doc, modeKey) — the resolved typeScale for a mode WITH that mode's per-cell overrides
// applied. "base" → doc.type; a mode id → the mode's own levers layered on doc.type: EITHER a
// bodyBase override (legacy custom modes) or a hierarchy-aware compression `factor` (the Standard set:
// Tablet 5/6 · Mobile 2/3 — body frozen, display compressed). The single place a type scale is built
// so overrides reach the matrix, the specimen, and every export consistently.
export function typeScaleFor(doc, modeKey) {
  const t = doc.type || DEFAULT_TYPE;
  const base = modeKey === "base" ? t : (() => { const m = typeEffectiveModes(doc).find((x) => x.id === modeKey); return m ? { ...t, bodyBase: m.bodyBase ?? t.bodyBase, modeFactor: m.factor ?? 1 } : t; })();
  const overrides = { ...modeTierNudge(base.modeFactor), ...typeOverridesFor(doc, modeKey) };
  return typeScale({ ...base, overrides });
}

// geomScaleFor(doc, modeKey) — the resolved geometry scale for a mode WITH that mode's per-cell
// HEIGHT overrides applied, COMPOSED with the type scale at the SAME mode — a control's text size
// (SM/MD/LG `font`) is the UI-CONTROL voice at that mode (TKT-0008; XS/XL/2XL fall back to the
// engine's fixed control-text ramp / the tier columns in `geomModeScales`).
export function geomScaleFor(doc, modeKey) {
  const g = doc.geometry || DEFAULT_GEOMETRY;
  // a mode's rampContrast: mode-explicit wins; otherwise it INHERITS the doc's (the desktop-anchored
  // shape — base isn't compressed, so inheritance is natural). Legacy #251 committed sets always carry
  // explicit per-mode values, so they resolve identically; a legacy compressed base (contrast 0) with a
  // silent mode keeps the old full-ramp default via the ?? 1 tail.
  const cfg = modeKey === "base" ? g : (() => { const m = geomEffectiveModes(doc).find((x) => x.id === modeKey); return m ? { ...g, baseHeight: m.baseHeight, rampContrast: m.rampContrast ?? ((g.baseName || "Base") === "Desktop" ? g.rampContrast : undefined) ?? 1 } : g; })();
  return geomScale(cfg, { typeScale: typeScaleFor(doc, modeKey), overrides: geomOverridesFor(doc, modeKey) });
}

// typeTierScale(doc, mult, mf) — the byte-identical tier closure that used to be reimplemented
// independently in typography.js's `_typeModeScales` AND geometry.js's `_geomModeScales` (B1, #456):
// scale bodyBase by `mult`, compress by breakpoint factor `mf`, and layer `modeTierNudge(mf)` over any
// doc-level overrides. Now the ONE place that formula lives; both mode-scale exports below call it.
function typeTierScale(doc, mult, mf) {
  const t = doc.type || DEFAULT_TYPE;
  const bb = Number(t.bodyBase) || DEFAULT_TYPE.bodyBase;
  return typeScale({ ...t, bodyBase: bb * mult, modeFactor: mf, overrides: { ...(t.overrides || {}), ...modeTierNudge(mf) } });
}

// typeModeScales(doc) — the breakpoint-mode scales for the Figma exports — [{ name, minWidth, scale }].
// Size modes are INTRINSIC, the same technique as Color's Light/Dark — and DESKTOP-ANCHORED (Kim's
// ratified law, 2026-07-10): the scale you design IS Desktop; Tablet/Mobile derive DOWN via the
// hierarchy-aware modeFactor curve (body frozen, Display fully compressed — 5/6 at Tablet, 2/3 at
// Mobile). When the doc carries configured modes they resolve override-aware (via `typeScaleFor`,
// incl. factor modes); when it carries NONE the pair is synthesized — so every export/apply carries
// the full intrinsic set with zero setup. Desktop Lg/Xl (2026-07-15/16, the TV tier) ride the INVERSE
// curve: `bodyBase` scales UP while `modeFactor` pulls the ceiling back down toward its ORIGINAL
// Desktop value instead of letting it scale proportionally — body grows, Display barely moves.
export function typeModeScales(doc) {
  const t = doc.type || DEFAULT_TYPE;
  if ((t.modes || []).length) return t.modes.map((m) => ({ name: m.name, minWidth: m.minWidth, scale: typeScaleFor(doc, m.id) }));
  return [
    { name: "Desktop Lg", minWidth: 1728, scale: typeTierScale(doc, 1.125, 0.89) },
    { name: "Desktop Xl", minWidth: 2560, scale: typeTierScale(doc, 1.375, 0.80) },
    { name: "Tablet", minWidth: 992, scale: typeTierScale(doc, 1, 5 / 6) },
    { name: "Mobile", minWidth: 476, scale: typeTierScale(doc, 1, 2 / 3) },
  ];
}

// geomModeScales(doc) — the geometry analog: when the doc carries no modes, Tablet/Mobile/Desktop
// Lg/Xl are synthesized, Desktop-anchored: the doc ramp IS Desktop; the other tiers carry the ratified
// magnitude table's height + gap ramps (scaled by bh/28, so they hold shape at any baseHeight), and
// control text composes from the tier's own UI-control voice at every step via `typeTierScale` (the
// SAME closure `typeModeScales` uses — the former second, independently-written copy, B1/B2 #456).
export function geomModeScales(doc) {
  const g = doc.geometry || DEFAULT_GEOMETRY;
  if ((g.modes || []).length) return g.modes.map((m) => ({ name: m.name, minWidth: m.minWidth, scale: geomScaleFor(doc, m.id) }));
  const bh = g.baseHeight ?? 28;
  // the hand-tuned per-cell tables below (heights + gaps) are keyed to the DEFAULT ramp's six names AT
  // THEIR DEFAULT-RAMP POSITIONS — they don't have a ladder-shaped equivalent (issue #483's 7-name
  // mapping shifts every letter tier + adds 2XS, so applying these verbatim would silently misapply the
  // wrong tuned value onto the wrong step). While the linear ladder is active, skip them entirely: the
  // synthesized tiers still carry `ramp` (via the `{...g}` spread below) and still scale by baseHeight
  // delta, just without the fine hand nudge — correct numbers over a false-precision wrong one.
  const ladderActive = g.ramp === RAMP_LADDER;
  const ramp = (arr) => { if (ladderActive) return undefined; const f = bh / 28; const out = {}; ["XS", "SM", "MD", "LG", "XL", "2XL"].forEach((k, i) => { if (arr[i] != null) out[k] = arr[i] * f; }); return out; };
  const synth = (delta, mult, mf, overrides, gaps) => geomScale({ ...g, baseHeight: Math.max(20, bh + delta) }, { typeScale: typeTierScale(doc, mult, mf), overrides, gapOverrides: gaps });
  return [
    { name: "Desktop Lg", minWidth: 1728, scale: synth(4, 1.125, 0.89, ramp([24, 28, 32, 40, 56, 72]), ramp([4, 4, 5, 7, 7, 9])) },
    { name: "Desktop Xl", minWidth: 2560, scale: synth(28, 1.375, 0.80, ramp([40, 48, 56, 64, 72, 80]), ramp([4, 5, 6, 8, 8, 10])) },
    { name: "Tablet", minWidth: 992, scale: synth(-2, 1, 5 / 6, undefined, ramp([3, 3, 4, 6, 6, 8])) },
    { name: "Mobile", minWidth: 476, scale: synth(-4, 1, 2 / 3, ramp([16, 20, 24, 32, 40, 56]), ramp([3, 3, 4, 5, 5, 6])) },
  ];
}
import {
  exportCSS,
  exportOKLCH,
  exportJSON,
  exportDTCG,
  exportUI3,
  exportTailwind,
  exportShadcn,
  SCRIM_BASES,
  SCRIM_STEPS,
  dialogBackdropHex,
  dialogBackdropOklch,
  whiteHex,
  whiteOklch,
  blackHex,
  blackOklch,
} from "../engine/exports.js";
// The Claude Design / Google Stitch / Figma Make "DS bundle" authoring subsystem — split into its
// own module (TKT-0015); see src/engine/ds-export.js's header for why it's a different file.
import {
  exportDesignSystemTokens,
  exportDesignSystemSpine,
  exportDesignSystemBundle,
  exportDesignSystemStitchBundle,
  exportDesignSystemMakeBundle,
} from "../engine/ds-export.js";

// Re-export the scrim model so the UI (app.js) can build the Mapping tab's re-point targets from the
// SAME source of truth as the exporters — no second, drift-prone hardcoded scrim-step list.
export { SCRIM_BASES, SCRIM_STEPS, exportDesignSystemTokens, exportDesignSystemSpine, exportDesignSystemBundle, exportDesignSystemStitchBundle, exportDesignSystemMakeBundle };

// The eight seed palettes (data/role-table.json `defaults`). Inlined so the
// pure core has no file I/O and runs identically in node and the browser.
const DEFAULT_PALETTES = [
  { name: "Neutral", hue: 267, chroma: 29, skew: -20, lift: 0, hueShift: 0, hueSameDir: false, on: true },
  { name: "Primary", hue: 267, chroma: 95, skew: -20, lift: 0, hueShift: 0, hueSameDir: false, on: true },
  { name: "Secondary", hue: 165, chroma: 100, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true },
  { name: "Tertiary", hue: 315, chroma: 33, skew: -20, lift: 0, hueShift: 0, hueSameDir: false, on: true },
  { name: "Info", hue: 235, chroma: 40, skew: -20, lift: 0, hueShift: 0, hueSameDir: false, on: true },
  { name: "Success", hue: 145, chroma: 55, skew: -20, lift: -5, hueShift: 0, hueSameDir: false, on: true },
  { name: "Warning", hue: 70, chroma: 100, skew: 40, lift: 15, hueShift: 0, hueSameDir: false, on: true },
  { name: "Danger", hue: 27, chroma: 55, skew: -20, lift: -5, hueShift: 0, hueSameDir: false, on: true },
];

// configFromVariables — a best-effort PARAMETRIC seed from a Figma file's raw-colors variables,
// for the case where a project has variables but NO saved config (read-variables -> {family/key: hex}).
// The variables are concrete colors, not params — you cannot reverse-derive a full ramp — so we read
// each family's 500 base, recover its CAM16 hue + chroma, and seed a palette at default skew/lift.
// The user then refines the controls and re-applies. Returns a config {name, palettes[]} or null.
export function configFromVariables(liveVars) {
  if (!liveVars || typeof liveVars !== "object") return null;
  const fam = new Map(); // family -> { "500": "#hex", "050": ..., ... }  (raw stop keys are pad3)
  for (const name of Object.keys(liveVars)) {
    const slash = name.indexOf("/");
    if (slash < 0) continue;
    const family = name.slice(0, slash);
    if (!fam.has(family)) fam.set(family, {});
    fam.get(family)[name.slice(slash + 1)] = liveVars[name];
  }
  const palettes = [];
  for (const [family, stops] of fam) {
    // prefer the 500 base; fall back to a near-mid solid if 500 is somehow absent.
    const baseHex = stops["500"] || stops["450"] || stops["550"] || stops["400"];
    if (!baseHex || !/^#?[0-9a-f]{6}/i.test(baseHex)) continue; // need a well-formed solid hex
    const { hue, chroma } = cam16FromRgb(hexToRgb(baseHex));
    palettes.push({
      name: family, hue: Math.round(hue), chroma: Math.round(Math.min(100, chroma)),
      skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true,
    });
  }
  if (!palettes.length) return null;
  // the recovered hues are CAM16 (cam16FromRgb above) — tag the config cam16 so they're interpreted in
  // their own space (an absent hueSpace would now hydrate to oklch and double-map the recovered hue).
  return { name: "From Figma", hueSpace: "cam16", palettes };
}

// slug — palette name -> token namespace (mirrors exports.js / semantic keying).
export function slug(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// camHueToOklch — convert a CAM16 hue to its OKLCH-hue EQUIVALENT by sampling the hue's vivid
// identity (its cusp: peakC's chroma at its tone) and reading the OKLCH hue back off it. The OKLCH
// hue that, fed to effHue→oklchToCam16Hue under hueSpace:"oklch", recovers the same color family —
// so a starter authored as a CAM16 hue renders ≈ identically once the doc is OKLCH-native. The
// accurate oklchToCam16Hue inverse closes the round-trip to within ~2° (the hct.js hct-oklch-inverse gate).
export function camHueToOklch(camHue, chromaFrac = 1) {
  const pk = peakC(camHue);
  const c = Math.max(Math.min(1, Math.max(0, chromaFrac)) * pk.c, 8); // anchor at the starter's OWN chroma
  return Math.round(((hctToOklch(camHue, c, pk.tone)[2] % 360) + 360) % 360);
}

// defaultDocument — a fresh State: deep-cloned default palettes + the tonal
// control defaults + a UI selection cursor. Theme is UI-only; carried so a
// hydrated doc round-trips, but never read by the exporters (AC-U3).
//
// OKLCH-native: the starter palettes carry CAM16 hues (from role-table.json, parity-gated — NOT
// editable here), so we CONVERT each starter's hue to its OKLCH equivalent on the fly and set
// hueSpace:"oklch". The new doc renders the SAME intended starter colors, but is OKLCH-native (the
// slider value IS the OKLCH hue). role-table.json stays the cam16 answer key untouched.
export function defaultDocument() {
  return {
    name: "Default",
    palettes: DEFAULT_PALETTES.map((p) => ({ ...p, hue: camHueToOklch(p.hue, (p.chroma ?? 0) / 100) })),
    curve: DEFAULT_CONTROLS.curve,
    tension: DEFAULT_CONTROLS.tension,
    lmin: DEFAULT_CONTROLS.lmin,
    lmax: DEFAULT_CONTROLS.lmax,
    damp: DEFAULT_CONTROLS.damp,
    dampCurve: DEFAULT_CONTROLS.dampCurve,
    dampAmp: DEFAULT_CONTROLS.dampAmp,
    dampBias: DEFAULT_CONTROLS.dampBias,
    hueSpace: DEFAULT_CONTROLS.hueSpace,
    relChroma: DEFAULT_CONTROLS.relChroma,
    chromaFloor: DEFAULT_CONTROLS.chromaFloor,
    toneMode: DEFAULT_CONTROLS.toneMode,
    vibrancy: DEFAULT_CONTROLS.vibrancy,
    onColorMode: DEFAULT_CONTROLS.onColorMode,
    accentRef: DEFAULT_CONTROLS.accentRef,
    theme: "auto",
    selected: 0,
    roleOverrides: {}, // per-doc semantic-mapping re-points (empty = canonical role table)
    type: { ...DEFAULT_TYPE }, // typography config (treatment + body base) — see engine/type.mjs
    geometry: { ...DEFAULT_GEOMETRY }, // dimensional config (treatment + base height) — see engine/geometry.mjs
  };
}

// controlsOf — the tonal-controls slice of a document, defaulting any missing.
function controlsOf(doc) {
  return {
    curve: doc.curve ?? DEFAULT_CONTROLS.curve,
    tension: doc.tension ?? DEFAULT_CONTROLS.tension,
    lmin: doc.lmin ?? DEFAULT_CONTROLS.lmin,
    lmax: doc.lmax ?? DEFAULT_CONTROLS.lmax,
    damp: doc.damp ?? DEFAULT_CONTROLS.damp,
    dampCurve: doc.dampCurve ?? DEFAULT_CONTROLS.dampCurve,
    dampAmp: doc.dampAmp ?? DEFAULT_CONTROLS.dampAmp,
    dampBias: doc.dampBias ?? DEFAULT_CONTROLS.dampBias,
    hueSpace: doc.hueSpace ?? DEFAULT_CONTROLS.hueSpace,
    relChroma: doc.relChroma ?? DEFAULT_CONTROLS.relChroma,
    chromaFloor: doc.chromaFloor ?? DEFAULT_CONTROLS.chromaFloor,
    toneMode: doc.toneMode ?? DEFAULT_CONTROLS.toneMode,
    vibrancy: doc.vibrancy ?? DEFAULT_CONTROLS.vibrancy,
    onColorMode: doc.onColorMode ?? DEFAULT_CONTROLS.onColorMode,
    accentRef: doc.accentRef ?? DEFAULT_CONTROLS.accentRef,
  };
}

// stateOf — the exporter-shaped State slice of a document (palettes + resolved
// controls). The one place the State shape is assembled; projectView, the exporters,
// and figmaBundle all go through it so a new control is added in exactly one place.
function stateOf(doc) {
  const c = controlsOf(doc);
  return {
    palettes: doc.palettes ?? [],
    roleOverrides: doc.roleOverrides ?? {}, // threaded to the exporters so re-points reach the output
    curve: c.curve,
    tension: c.tension,
    lmin: c.lmin,
    lmax: c.lmax,
    damp: c.damp,
    dampCurve: c.dampCurve,
    dampAmp: c.dampAmp,
    dampBias: c.dampBias,
    hueSpace: c.hueSpace,
    relChroma: c.relChroma,
    chromaFloor: c.chromaFloor,
    toneMode: c.toneMode,
    vibrancy: c.vibrancy,
    onColorMode: c.onColorMode,
    accentRef: c.accentRef,
    // export prefs (the CSS prefix is read by exportCSS/exportOKLCH via cssPrefixOf); pass through
    // when present so the configurable --{prefix}-* naming reaches the emitter. Absent ⇒ default "c".
    ...(doc.export && typeof doc.export === "object" ? { export: doc.export } : {}),
  };
}

// figmaBundle — the DTCG export with raw-collection aliasing ON: the exact shape the Figma plugin's
// code.js turns into a raw-primitives collection + a semantic Light/Dark collection aliased to it.
// Each semantic leaf carries com.figma.aliasData.targetVariableName/targetVariableSetName so the
// plugin can build the cascade. Collection names default to "Color Primitives"/"Color Roles" (#491) and are
// overridable per-doc (Settings › Token mapping → doc.figmaCollections; figmaCollectionNames resolves).
export function figmaCollectionNames(doc) {
  const fc = (doc && doc.figmaCollections) || {};
  const pick = (v, dflt) => (typeof v === "string" && v.trim() ? v.trim() : dflt);
  return { raw: pick(fc.raw, COLLECTIONS.colorRaw), semantic: pick(fc.semantic, COLLECTIONS.colorSemantic) };
}
export function figmaBundle(doc) {
  return exportDTCG(stateOf(doc), { rawColl: figmaCollectionNames(doc).raw });
}

// brandKit — the resolved brand-kit data the downloadable MCP server (`mcp/brand-kit-server.mjs`) reads:
// every enabled palette's identity colour + tonal ramp, its 53 semantic roles resolved for BOTH light &
// dark, the typography scale, and the geometry scale. A pure projection (projectView) — the server itself
// is engine-free and just serves this. `systems` opts each token SYSTEM in/out (Color · Typography ·
// Geometry); omitted/undefined → all three (the back-compatible default). An omitted system's section is
// absent from the kit entirely, so the MCP serves only what the user chose to include.
export function brandKit(doc, systems) {
  const sys = systems || { color: true, type: true, geometry: true };
  const kit = { $schema: "ultimate-tokens-brand-kit/1", name: doc.name || (doc.story && doc.story.title) || "Brand Kit", generator: "Ultimate Tokens" };
  // the ICON facet — always served: an agent must never have to pick a library. Sizes ride the geometry
  // system (below) when it is included; this names the library + its stroke/fill character.
  {
    const ic = iconSystem(doc.icons || {});
    kit.icons = { family: ic.name, ...(ic.variant ? { variant: ic.variant } : {}), ...(ic.license ? { license: ic.license } : {}), ...(ic.url ? { url: ic.url } : {}) };
  }
  // the MOTION facet — system constants (no user parameters), always served: an agent binds these
  // curves + the ms ladder instead of typing a raw `300ms ease`.
  kit.motion = motionTokens();
  // fixed, non-palette CONSTANTS — always served like motion (no user parameters, no sys.color
  // gate: none of these are a brand color, they're neutral chrome every consumer needs).
  kit.constants = {
    dialogBackdrop: { hex: dialogBackdropHex(), oklch: dialogBackdropOklch() },
    white: { hex: whiteHex(), oklch: whiteOklch() },
    black: { hex: blackHex(), oklch: blackOklch() },
  };
  if (sys.color) {
    const view = projectView(doc);
    const on = view.palettes.filter((p) => p.on);
    kit.stops = on[0] ? on[0].ramp.map((s) => s.stop) : [];
    kit.palettes = on.map((p) => ({
      name: p.name, slug: slug(p.name), key: p.key,
      ramp: p.ramp.map((s) => ({ stop: s.stop, hex: s.hex })),
    }));
    kit.roles = {};
    for (const p of on) {
      const r = {};
      for (const role of p.roles) r[role.key] = { light: role.lightHex, dark: role.darkHex };
      kit.roles[slug(p.name)] = r;
    }
  }
  // BASE-mode per-cell overrides reach the kit too (every other export carries them — the matrix Base
  // column, CSS, DTCG) — via the SAME `typeScaleFor`/`geomScaleFor` the section resolvers use, so this
  // path can't drift from them (the former separate `geometryScale`+`baseOverrideSlice` join, #456).
  if (sys.type) kit.type = typeScaleFor(doc, "base");
  if (sys.geometry) kit.geometry = geomScaleFor(doc, "base"); // composed with the (override-aware) type scale — shared `font` tracks too
  return kit;
}

// WCAG relative-luminance contrast ratio between two [r,g,b] int triples.
function relLum(rgb) {
  const ch = rgb.map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}
export function contrastRatio(a, b) {
  const la = relLum(a);
  const lb = relLum(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

// hexToRgb — "#RRGGBB" -> [r,g,b] (ignores any alpha bytes).
function hexToRgb(hex) {
  const s = hex.replace("#", "");
  return [
    parseInt(s.slice(0, 2), 16),
    parseInt(s.slice(2, 4), 16),
    parseInt(s.slice(4, 6), 16),
  ];
}

// rampByStop — index a palette's stop list by stop number for ref resolution.
function rampByStop(ramp) {
  const m = new Map();
  for (const s of ramp) m.set(s.stop, s);
  return m;
}

// keyCss — an OKLCH key color [L,C,H] → a CSS oklch() string (lossless; used for swatches + export).
export function keyCss(oklch) {
  const r = (x, d) => Number(x.toFixed(d));
  return `oklch(${r(oklch[0], 4)} ${r(oklch[1], 4)} ${r(oklch[2], 2)})`;
}

// placeKeyColors — locate each retained key color (stored as OKLCH) on the generated ramp
// through the PERCEPTUAL LENS: its L* picks the nearest stop, and `drift` is the CAM16
// distance to that stop (≈0 = lands on it; larger = genuinely off-ramp, kept as an exact
// reference). Pure: oklchToRgb → lstarFromRgb (tone) + cam16FromRgb (hue/chroma).
function placeKeyColors(keyColors, fullStops) {
  if (!Array.isArray(keyColors) || !keyColors.length) return [];
  const RAD = Math.PI / 180;
  const ab = (rgb) => { const c = cam16FromRgb(rgb); return [c.chroma * Math.cos(c.hue * RAD), c.chroma * Math.sin(c.hue * RAD)]; };
  return keyColors.map((kc) => {
    const rgb = oklchToRgb(kc.oklch[0], kc.oklch[1], kc.oklch[2]);
    const tone = lstarFromRgb(rgb);
    let near = fullStops[0], best = Infinity;
    for (const s of fullStops) { const d = Math.abs(s.tone - tone); if (d < best) { best = d; near = s; } }
    const [ka, kb] = ab(rgb), [sa, sb] = ab(near.rgb);
    const dL = tone - near.tone;
    const drift = Math.sqrt(dL * dL + (ka - sa) ** 2 + (kb - sb) ** 2);
    return { role: kc.role, oklch: kc.oklch, css: keyCss(kc.oklch), name: kc.name || null, nearStop: near.stop, drift: Math.round(drift * 10) / 10 };
  });
}

// seedFromKeyColor — recover a parametric palette seed from a key color (OKLCH). The OKLCH-native model:
// `hue` is the input's OWN OKLCH hue (oklch[2]) — so a seed pairs with the default hueSpace:"oklch" and
// the slider reads the source hue directly; `chroma` is still the %-of-peak recovered from CAM16, and
// `tone` is the input's L*. So the inspector's "Seed from key color" aligns the family to the brand.
export function seedFromKeyColor(oklch, hueSpace = "oklch") {
  if (!Array.isArray(oklch) || oklch.length !== 3) return null;
  const rgb = oklchToRgb(oklch[0], oklch[1], oklch[2]);
  const cam = cam16FromRgb(rgb);
  // hue in the CONSUMING doc's space: an OKLCH-native doc stores the input's own OKLCH hue; a legacy
  // cam16 doc stores the CAM16 hue, so the seeded family lands true in either. (round THEN wrap: 359.7→0.)
  const hue = Math.round(hueSpace === "cam16" ? cam.hue : oklch[2]);
  return { hue: ((hue % 360) + 360) % 360, chroma: Math.round(Math.min(100, cam.chroma)), tone: Math.round(lstarFromRgb(rgb)) };
}

// rgbToOklchArr — [r,g,b] → [L,C,H] (for capturing a manual hex/identity color as OKLCH).
export function rgbToOklchArr(rgb) {
  const lin = (c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; };
  const r = lin(rgb[0]), g = lin(rgb[1]), b = lin(rgb[2]);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
  const C = Math.hypot(A, B);
  const H = ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360;
  return [L, C, H];
}

// hexToOklch — "#RRGGBB" → [L,C,H] (capture a palette's identity / a pasted brand hex as OKLCH).
export function hexToOklch(hex) {
  return rgbToOklchArr(hexToRgb(String(hex)));
}

// resolveRoleHex — a role ref ("550" solid | "500-200" scrim) -> a display hex
// for the given mode side, resolved against this palette's own ramp.
function resolveRoleHex(ref, byStop) {
  const str = String(ref);
  const dash = str.indexOf("-");
  if (dash === -1) {
    const hit = byStop.get(Number(str));
    return hit ? hit.hex : "#000000";
  }
  // scrim "{base}-{step}": the base stop's solid color at alpha% = step/10
  // (e.g. "500-200" = the 500 color at 20%). base is 500 for the current ramp.
  const base = Number(str.slice(0, dash));
  const step = Number(str.slice(dash + 1));
  const hit = byStop.get(base);
  if (!hit) return "#00000000";
  const a = Math.round((step / 1000) * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
  return hit.hex + a;
}

// deriveKeyColor(p, hueSpace) — a palette's VIVID identity color: the cusp (peak-chroma) hue at the
// palette's own hue+chroma, independent of toneMode/the ramp (a ramp stop reads muted; this is what a
// gallery tile should show). The ONE place this derivation lives — projectView's per-palette roles
// and paletteKeyColors' cheap tile-only path (below) both call it, so they can never drift apart.
function deriveKeyColor(p, hueSpace) {
  const baseHue = effHue(p.hue, hueSpace, (p.chroma ?? 0) / 100);
  const pk = peakC(baseHue);
  const keyChroma = ((p.chroma ?? 0) / 100) * pk.c;
  return {
    // keyOklch = the HIGH-RES OKLCH (float, no 8-bit round-trip) — the model's source of truth for
    // perceptual readouts/analysis; keyHex is DERIVED from the same HCT for consumption.
    keyOklch: hctToOklch(baseHue, keyChroma, pk.tone),
    keyHex: "#" + hctToRgb(baseHue, keyChroma, pk.tone).rgb
      .map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase(),
  };
}

// paletteKeyColors(doc) — the CHEAP alternative to projectView() for a gallery/list TILE that only
// needs each palette's vivid identity color (+ name/on/colorRole, which need no derivation at all —
// they're read straight off the palette object). Skips the 25-stop ramp, the 53-role resolution, and
// every export format entirely — projectView computes ALL of that unconditionally, and a tile grid
// (48 Color Categories presets, or every saved "Your Palettes" set) never reads any of it. Measured:
// ~200-300ms/preset via projectView vs. ~0.01ms/preset here — the difference IS the rendering latency.
// Deliberately NOT memoized: the computation is cheap enough (sub-millisecond per palette) that a cache
// would only add invalidation risk (a stale key color after an edit) and something to leak, for no
// measurable benefit — recompute fresh on every call.
export function paletteKeyColors(doc) {
  const hueSpace = controlsOf(doc).hueSpace;
  return (doc.palettes ?? []).map((p) => ({
    name: p.name,
    on: p.on !== false,
    key: deriveKeyColor(p, hueSpace).keyHex,
    ...(p.colorRole ? { colorRole: p.colorRole } : {}),
  }));
}

// projectView — the document -> view projection. Pure: same doc, same view.
// Composes paletteStops + semanticRoles + the five exporters. The app renders
// EVERYTHING on the right from this; nothing here is stored back on the doc.
export function projectView(doc) {
  const controls = controlsOf(doc);
  const allPalettes = doc.palettes ?? [];

  // Per-palette: the display ramp (19 STOPS), its 53 resolved roles, and the
  // L*xC plot points (applied chroma vs gamut ceiling along the tone line).
  const palettes = [];
  const plot = [];
  const contrast = [];

  for (const p of allPalettes) {
    // Resolve roles against the FULL EXPORT_STOPS ramp (25) so refs to the export-only
    // half-steps (75/125/175/825/875/925) resolve — they are absent from the 19 display STOPS,
    // and a miss used to fall back to #000000 (the black swatches in the Roles panel).
    const fullStops = paletteStops(
      { hue: p.hue, chroma: p.chroma, skew: p.skew, lift: p.lift, hueShift: p.hueShift, hueSameDir: p.hueSameDir, cuspPull: p.cuspPull },
      controls,
      EXPORT_STOPS,
    ).map((s) => ({
      stop: s.stop,
      hex: s.hex,
      rgb: s.rgb,
      chroma: s.chroma,
      maxc: s.maxc,
      inGamut: s.inGamut,
      tone: s.tone,
    }));

    const byStop = rampByStop(fullStops);                          // 25 stops — every role ref resolves
    const ramp = fullStops.filter((s) => STOPS.includes(s.stop));  // 19 display stops for the canvas
    const n = slug(p.name);
    // on-color policy: in "contrast" mode flip the accent on-colors to the better-contrasting end
    // (vs the resolved accent fill) BEFORE per-doc overrides, so an explicit override still wins.
    const lumOf = (ref) => { const hit = byStop.get(Number(ref)); return hit ? relLum(hit.rgb) : 0; };
    // accent ref ("single" → prime accent 500/500) then on-color policy — both resolution-layer, BEFORE
    // per-doc overrides so an explicit override still wins.
    const baseRoles = applyOnColorContrast(applyAccentRef(semanticRoles(n), controls.accentRef), n, lumOf, controls.onColorMode);
    const roles = applyRoleOverrides(baseRoles, doc.roleOverrides).map((r) => ({
      key: r.key,
      suffix: r.suffix,
      name: n + r.suffix, // the semantic token name (e.g. "neutral", "neutral-dim")
      lightRef: r.light, // the raw stop/scrim ref this role points at, per mode
      darkRef: r.dark,
      lightRaw: n + "-" + refKey(r.light), // the raw token name (e.g. "neutral-550")
      darkRaw: n + "-" + refKey(r.dark),
      lightHex: resolveRoleHex(r.light, byStop),
      darkHex: resolveRoleHex(r.dark, byStop),
    }));

    // key = the palette's VIVID identity color: the cusp (peak-chroma) hue at the palette's intended
    // chroma, computed straight from hue+chroma so it stays vivid regardless of toneMode (the perceptual
    // ramp damps mid-stop chroma, so a ramp stop reads muted; this is what the gallery tile should show).
    // deriveKeyColor (below) is the single source of truth — paletteKeyColors (the cheap tile-only path)
    // calls the SAME helper, so the two can never drift apart.
    const { keyHex, keyOklch } = deriveKeyColor(p, controls.hueSpace);

    // keyColors = retained brand colors placed on the ramp through the perceptual lens.
    const keyColors = placeKeyColors(p.keyColors, fullStops);

    // ramp = 19 core display stops; fullRamp = all 25 EXPORT_STOPS (the extended view).
    palettes.push({
      name: p.name, on: p.on !== false, key: keyHex, keyOklch, ramp, fullRamp: fullStops, roles, keyColors,
      // curated story (present for preset palettes): the color's evocative name, role, description.
      ...(p.colorName ? { colorName: p.colorName } : {}),
      ...(p.colorRole ? { colorRole: p.colorRole } : {}),
      ...(p.description ? { description: p.description } : {}),
    });

    plot.push({
      palette: p.name,
      points: ramp.map((s) => ({
        tone: s.tone,
        applied: s.chroma,
        ceiling: s.maxc,
      })),
    });

    // Contrast readout: the prime on-color (light end stop 50) over the prime
    // fill, plus the prime fill vs white and black — the D3 decision inputs.
    const prime = byStop.get(550) || ramp[Math.floor(ramp.length / 2)];
    const onPrime = byStop.get(50) || ramp[0];
    if (prime && onPrime) {
      const fill = prime.rgb;
      contrast.push({
        palette: p.name,
        onFill: round2(contrastRatio(onPrime.rgb, fill)),
        onWhite: round2(contrastRatio([255, 255, 255], fill)),
        onBlack: round2(contrastRatio([0, 0, 0], fill)),
      });
    }
  }

  // The five export formats, all over the SAME doc (enabled palettes only —
  // the exporters filter on !== false). theme is never read here (AC-U3).
  const state = stateOf(doc);
  // exportDTCG already splits the tokens into the three Figma mode files; compute it
  // once and surface those files INDIVIDUALLY so the UI can download Light_tokens.json
  // and Dark_tokens.json as separate files (one per Figma variable-collection mode).
  const dtcgObj = exportDTCG(state);
  // the resolved type + geometry scales — so the shadcn theme carries the brand fonts (--font-*) + a
  // geometry-derived --radius, not just colours. Fonts/radii come from the treatment (size overrides don't
  // affect them), so the base scales are correct here.
  const shadType = typeScaleFor(state, "base");
  const shadGeom = geomScaleFor(state, "base");
  const exports = {
    css: exportCSS(state),
    oklch: exportOKLCH(state),
    json: JSON.stringify(exportJSON(state), null, 2),
    dtcg: JSON.stringify(dtcgObj, null, 2),
    ui3: JSON.stringify(exportUI3(state), null, 2),
    tailwind: exportTailwind(state),
    shadcn: exportShadcn(state, { fonts: shadType.fonts, radii: shadGeom.radii }),
    figma: {
      light: JSON.stringify(dtcgObj["Light_tokens.json"], null, 2),
      dark: JSON.stringify(dtcgObj["Dark_tokens.json"], null, 2),
      raw: JSON.stringify(dtcgObj["palette.tokens.json"], null, 2),
    },
  };

  return { palettes, plot, exports, contrast, story: doc.story || null };
}

function round2(x) {
  return Math.round(x * 100) / 100;
}

// appThemeCSS — the FIXED app-theme stylesheet: exportCSS over the 8 default
// palettes (NOT the user's edited document, so the chrome stays stable while
// editing). This is the dogfooding hook — the same `exportCSS` the tool ships to
// users generates the `--{n}-{stop}` raw vars + 53 `--c-{n}{suffix}` semantic
// roles per palette that the app's own styles.css then consumes as design tokens.
// Injected once on boot as <style id="ultimate-tokens-theme"> (see app.js).
export function appThemeCSS() {
  const d = defaultDocument();
  const state = {
    palettes: d.palettes,
    curve: d.curve,
    tension: d.tension,
    lmin: d.lmin,
    lmax: d.lmax,
    damp: d.damp,
    dampCurve: d.dampCurve,
    dampAmp: d.dampAmp,
    dampBias: d.dampBias,
    hueSpace: d.hueSpace,
  };
  return exportCSS(state);
}

// tokenCount — how many CSS custom properties the document emits (for the
// app-footer "{tokens} tokens" readout). Counts only enabled palettes.
export function tokenCount(doc) {
  const enabled = (doc.palettes ?? []).filter((p) => p.on !== false).length;
  // per palette: 25 solids (EXPORT_STOPS) + scrims (SCRIM_BASES × SCRIM_STEPS) + the semantic --c-* roles.
  // Derived from the engine (semanticRoles) so it can't drift — a hard-coded literal here had gone stale
  // at 37 while the role set grew to 59. The count is palette-name-independent, so any name resolves it.
  return enabled * (EXPORT_STOPS.length + SCRIM_BASES.length * SCRIM_STEPS.length + semanticRoles("primary").length);
}

// Re-exports the app needs from the core (so app.js imports one module).
export { hctToRgb, lstarFromRgb, hexToRgb, STOPS, EXPORT_STOPS, DEFAULT_CONTROLS };
