// exports.js — the 8 documented COLOR export formats (vanilla ESM, no deps).
//
// Turns a generator State into the HCT Palette Generator's portable token
// artifacts in eight formats: CSS (hex), CSS (OKLCH), JSON, Figma DTCG (the
// 3-file set), the UI3 interchange shape, Tailwind v4, ShadCN, plus the
// exportAll aggregator. Every emitter operates over the ENABLED palettes only
// and the 25 EXPORT_STOPS, and every stop reference is 3-digit zero-padded
// (ADR-006).
//
// The Claude Design / Google Stitch / Figma Make "DS bundle" DESIGN.md-authoring
// subsystem lives in the sibling ds-export.js (TKT-0015) — a different KIND of
// code (content/prose authoring for a consumption bundle, not token
// serialization) that was split out so this file's own documented 8-format
// pattern (adding-export-formats) stays an accurate map of what's here.
// ds-export.js imports several of this file's helpers (derivedAll, roleOklch,
// hexOf, hex8, relLumExp, cssPrefixOf, dialogBackdropOklch, exportShadcn) —
// keep them exported for that reason even though nothing else outside this
// file's own emitters needs them.
//
// Fenced decisions honored (do NOT "fix" these):
//   ADR-002  Light/Dark semantic ships RESOLVED colors with NO aliasData by
//            default; an opts.rawColl opt-in re-adds com.figma.aliasData.
//   ADR-005  Two-layer model: raw tokens are FLAT single values; the light/dark
//            flip lives only in the semantic --c-* layer via light-dark().
//   ADR-006  3-digit padding on every naming surface (CSS/JSON/DTCG/UI3).
//   ADR-007  UI3 is interchange-only (not a native Figma import path).
//
// state is UI-only-aware: theme is NEVER read here, so output is identical for
// theme light/dark/auto.

import { paletteStops, EXPORT_STOPS, DEFAULT_CONTROLS } from "./tonal.js";
import { semanticRoles, refKey, refPath, refSlug, roleLeaf, applyRoleOverrides, applyOnColorContrast, applyAccentRef, DEFAULT_THEMES } from "./semantic.js";
import { COLLECTIONS } from "./collections.js";
import { primeSwatches, PRIME_STEPS } from "./prime.mjs";
import { oklchToRgb } from "./okhsl.js";
import { rampChromaOf, primeChromaOf } from "./resolve.mjs";
import { cssFontStack } from "./type.mjs";

// WCAG relative luminance of an [r,g,b] (0..255) triple — for the opt-in contrast on-color pick.
// Exported: ds-export.js's dsContrast also needs it (kept as one source, not a duplicate).
export const relLumExp = (rgb) => {
  const c = rgb.map((v) => { const s = v / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};

// ── Export schema version (SPEC 0.3.0 RP-8, ticket #577, plan PR #571 step E6) ────────────────
// One constant stamped on every surface that can carry it: JSON meta.schemaVersion; DTCG
// $extensions["com.ultimate-tokens"].schemaVersion at the root of all three files; the UI3
// $schema suffix; a first-line comment on CSS/OKLCH/Tailwind/ShadCN; the DS bundle's tokens.json
// $schemaVersion + DESIGN.md frontmatter tokensSchema; the brand-kit $schema and the brand-kit
// MCP server's own version. Absence of a stamp means version 1 (the pre-#503 shape, retroactive).
// Bump rule (adding-export-formats/SKILL.md carries the same note): any additive or shape change
// to an emitted format bumps this ONE constant, once, across every surface, in the same PR; a
// value-only change (e.g. a chroma default) never bumps it.
export const EXPORT_SCHEMA_VERSION = 2;

// ── Constants (from data/role-table.json) ─────────────────────────────────────
// Scrims are a 500-based translucency ramp: a scrim primitive "{n}/500-{step}" is the
// palette's 500 color at alpha% = step/10. Only the referenced steps are emitted.
// The EMITTED raw scrim ramp: a clean 11-step translucency set over the 500 color,
// alpha% = step/10 → 5,10,20,30,40,50,60,70,80,90,95%. This is the set of raw scrim
// primitives every format emits; the 7 SEMANTIC scrim-strength roles bind to a 7-step
// SUBSET of these (see semantic.js SCRIM_STRENGTH_STEPS), so some emitted steps are
// available as raw primitives without a strength role. Exported so model.tokenCount can
// derive the count instead of hard-coding it (was the stale `3 * 7`).
export const SCRIM_BASES = [500];
export const SCRIM_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

// ── Small hand-rolled helpers ─────────────────────────────────────────────────

// slug — palette name -> token namespace: lowercase, non-alphanumeric -> '-',
// trimmed of leading/trailing '-'. "Neutral" -> "neutral", "On Surface" -> "on-surface".
function slug(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// isDataPalette — true for a data-family palette by its SLUG ("data-1".."data-8" convention; #503
// REQ-020..024). The public/exported twin of model.mjs's local isDataSlug helper (mintDataPalettes /
// rederiveDataHues) — same pattern, engine-side so exports.js/ds-export.js need no import from src/ui/.
// Used by exportShadcn's chart binding and ds-export.js's data tier (REQ-031).
export function isDataPalette(p) {
  return /^data-\d+$/.test(slug(p.name));
}

// paletteGroupOf — the public/exported twin of model.mjs's paletteGroup(p) (ticket #556/#572, SPEC
// 0.3.0 RP-1): a palette's own explicit `group` (when it's one of the four valid ids) else the SAME
// by-name default rule model.mjs applies (Neutral -> material; Primary/Secondary/Tertiary -> brand;
// Info/Success/Warning/Danger -> system; everything else, including Data N, -> data). Duplicated
// here (not imported from src/ui/) for the same reason isDataPalette is its own engine-side twin
// above — exports.js stays DOM/UI-import-free. model.mjs's stateOf() already stamps a DEFINITE
// group onto every palette before a live doc reaches this file, so in practice this only re-derives
// the default for state built directly (e.g. test fixtures) rather than through stateOf/projectView.
const PALETTE_GROUP_IDS = ["material", "brand", "system", "data"];
const DEFAULT_GROUP_BY_SLUG = {
  neutral: "material",
  primary: "brand",
  secondary: "brand",
  tertiary: "brand",
  info: "system",
  success: "system",
  warning: "system",
  danger: "system",
};
export function paletteGroupOf(p) {
  const g = p && p.group;
  if (PALETTE_GROUP_IDS.includes(g)) return g;
  return DEFAULT_GROUP_BY_SLUG[slug(p && p.name)] || "data";
}

// pad3 — zero-pad a numeric stop to 3 digits. "50" -> "050", 950 -> "950".
// (refKey from semantic.js handles the ref-string form, including scrim "-i".)
function pad3(stop) {
  return String(stop).padStart(3, "0");
}

// hex2 — a 0..255 channel as a 2-digit UPPERCASE hex byte.
function hex2(v) {
  return Math.round(v).toString(16).padStart(2, "0").toUpperCase();
}

// hexOf — "#RRGGBB" from an [r,g,b] int triple (uppercase). Exported: ds-export.js's
// dsColorRoles needs it too.
export function hexOf(rgb) {
  return "#" + rgb.map(hex2).join("");
}

// hex8 — "#RRGGBBAA" scrim color: solid rgb + an alpha byte from a 0..1 fraction. Exported:
// ds-export.js's dsColorRoles needs it too.
export function hex8(rgb, frac) {
  return hexOf(rgb) + hex2(frac * 255);
}

// componentsOf — srgb components in [0,1] from an [r,g,b] int triple.
function componentsOf(rgb) {
  return rgb.map((v) => v / 255);
}

// rgbToOklch — minimal sRGB(0..255) -> OKLCH for the OKLCH CSS variant only
// (NOT used for color math; the engine already produced the gamut-correct rgb).
// sRGB -> linear -> LMS (Björn Ottosson's matrices) -> Lab -> L,C,H.
function rgbToOklch(rgb) {
  const lin = (c) => {
    c /= 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const r = lin(rgb[0]);
  const g = lin(rgb[1]);
  const b = lin(rgb[2]);
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  const C = Math.sqrt(a * a + bb * bb);
  // hue is undefined at zero chroma — atan2 of the float-noise-sized a/bb residuals an exactly
  // achromatic RGB (e.g. pure white/black) produces is an essentially-random angle, not a real hue.
  // Guard at the same granularity oklchStr rounds C to (4 decimals) so a displayed "0" chroma never
  // pairs with a nonzero displayed hue.
  let H = C < 0.00005 ? 0 : (Math.atan2(bb, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { L, C, H };
}

// oklchStr / oklchStrA — the oklch() string forms for solids and scrims. Exported so ds-export.js
// can format a raw [L,C,H]/{L,C,H} triple (e.g. a prime swatch's `oklch`) the same way this file
// does everywhere else, rather than growing a second formatter.
const num = (x, d) => Number(x.toFixed(d));
export function oklchStr({ L, C, H }) {
  return `oklch(${num(L, 4)} ${num(C, 4)} ${num(H, 2)})`;
}
function oklchStrA({ L, C, H }, alphaPct) {
  return `oklch(${num(L, 4)} ${num(C, 4)} ${num(H, 2)} / ${alphaPct}%)`;
}

// DIALOG_BACKDROP — a fixed SYSTEM CONSTANT, not a palette-derived color: opaque black at 80% alpha,
// the canonical dialog/modal scrim. Unlike every other color token in this file it is NOT palette-scoped
// (no [n] name segment) and does NOT flip between light/dark (an overlay reads the same in both schemes)
// — the one deliberate exception to "every color comes from derivePalette/derivedAll". It still rides
// the SAME configurable {pfx} as every other token (cssPrefixOf/aliasPrefix), so a renamed namespace
// covers it too. Emitted once per document in every color-token format (never per palette).
const DIALOG_BACKDROP_RGB = [0, 0, 0];
const DIALOG_BACKDROP_ALPHA_PCT = 80;
export function dialogBackdropHex() { return hex8(DIALOG_BACKDROP_RGB, DIALOG_BACKDROP_ALPHA_PCT / 100); }
export function dialogBackdropOklch() { return oklchStrA(rgbToOklch(DIALOG_BACKDROP_RGB), DIALOG_BACKDROP_ALPHA_PCT); }

// WHITE / BLACK — two more fixed SYSTEM CONSTANTS, the same "not palette-derived, not mode-flipped"
// exception as DIALOG_BACKDROP above, minus the alpha channel (solid, frac 1). Emitted once per
// document, in every color-token format DIALOG_BACKDROP appears in EXCEPT ShadCN — its --overlay
// slot is specifically the backdrop; shadcn's fixed token contract has no white/black slot to fill.
const WHITE_RGB = [255, 255, 255];
const BLACK_RGB = [0, 0, 0];
export function whiteHex() { return hexOf(WHITE_RGB); }
export function blackHex() { return hexOf(BLACK_RGB); }
export function whiteOklch() { return oklchStr(rgbToOklch(WHITE_RGB)); }
export function blackOklch() { return oklchStr(rgbToOklch(BLACK_RGB)); }

// ── Core: per-palette derivation (shared by every emitter) ────────────────────

// controlsOf — pull the tonal controls out of State, defaulting any missing.
function controlsOf(state) {
  return {
    curve: state.curve ?? DEFAULT_CONTROLS.curve,
    tension: state.tension ?? DEFAULT_CONTROLS.tension,
    lmin: state.lmin ?? DEFAULT_CONTROLS.lmin,
    lmax: state.lmax ?? DEFAULT_CONTROLS.lmax,
    damp: state.damp ?? DEFAULT_CONTROLS.damp,
    dampCurve: state.dampCurve ?? DEFAULT_CONTROLS.dampCurve,
    dampAmp: state.dampAmp ?? DEFAULT_CONTROLS.dampAmp,
    dampBias: state.dampBias ?? DEFAULT_CONTROLS.dampBias,
    // baseChroma (SPEC 0.3.0 REQ-002/004): the GLOBAL fallback ramp-chroma target — used only when a
    // palette's group carries no value of its own. Named `state.baseChroma` here — a DIFFERENT name
    // than the field persist.js/model.mjs persist on the document (kept there for backward compat) —
    // because a retired per-stop multiplier control once lived under that old name right in this file,
    // and AC-004 bars its reintroduction, in any form, under src/engine. model.mjs's stateOf() is the
    // one place that renames the document's own field onto this one when building `state`.
    baseChroma: state.baseChroma ?? 100,
    // primeChroma (REQ-008/050..057): the prime system's own chroma control, a plain 100 default.
    primeChroma: state.primeChroma ?? 100,
    // paletteGroups (REQ-002/008): each group's own { baseChroma, primeChroma, locked? }, default-filled
    // by model.mjs's resolvePaletteGroups() before this state ever reaches an exporter. derivePalette
    // below reads controls.paletteGroups[palette.group] — model.mjs also stamps `palette.group` onto
    // every state-shaped palette object, so this file never re-derives the by-name default rule.
    paletteGroups: state.paletteGroups ?? {},
    hueSpace: state.hueSpace ?? "cam16", // a raw legacy state without the field was authored in cam16 (mirror the UI's legacy-preservation stamp); a live doc always carries it explicitly
    // distribution mode + its shapers — previously dropped here, so exports always used the
    // default mode regardless of the doc. Threaded now so exports match what the UI renders.
    toneMode: state.toneMode ?? DEFAULT_CONTROLS.toneMode,
    vibrancy: state.vibrancy ?? DEFAULT_CONTROLS.vibrancy,
    onColorMode: state.onColorMode ?? DEFAULT_CONTROLS.onColorMode,
    accentRef: state.accentRef ?? DEFAULT_CONTROLS.accentRef,
    relChroma: state.relChroma ?? DEFAULT_CONTROLS.relChroma,
    chromaFloor: state.chromaFloor ?? DEFAULT_CONTROLS.chromaFloor,
  };
}

// enabledPalettes — the disabled-palette filter (AC-U2): a palette is included
// iff on !== false. A disabled palette is therefore ABSENT from every export.
function enabledPalettes(state) {
  return (state.palettes ?? []).filter((p) => p.on !== false);
}

// derivePalette — everything an emitter needs for one palette, computed once:
//   slug, the 25 solid stops keyed by pad3, a stop->rgb lookup, the 11 scrims,
//   the 53 resolved semantic roles, and a ref->rgb resolver shared by all formats.
function derivePalette(palette, controls, overrides) {
  const n = slug(palette.name);
  const ctl = {
    curve: controls.curve,
    tension: controls.tension,
    lmin: controls.lmin,
    lmax: controls.lmax,
    damp: controls.damp,
    dampCurve: controls.dampCurve,
    dampAmp: controls.dampAmp,
    dampBias: controls.dampBias,
    hueSpace: controls.hueSpace,
    toneMode: controls.toneMode,
    vibrancy: controls.vibrancy,
    relChroma: controls.relChroma,
    chromaFloor: controls.chromaFloor,
  };
  // accent-ref-resolved roles ("single" → prime accent 500/500), computed before the ramp — reused below
  // for the on-color-contrast step so it's derived once per palette.
  const accentRoles = applyAccentRef(semanticRoles(n), controls.accentRef);
  // rampChroma/primeChromaResolved (SPEC 0.3.0 REQ-002/004/008, Risk 0b: "one shared resolver
  // imported by both, never two copies") — engine/resolve.mjs's OWN pure functions, the SAME ones
  // model.mjs's projectView calls, so the CSS/JSON/DTCG/… exports and the canvas agree byte for
  // byte by construction, not by two hand-kept-in-sync formulas. `palette.group` arrives ALREADY
  // resolved (a definite one of the four ids, never absent) — model.mjs's stateOf() stamps it
  // before this file ever sees the palette, so no by-name default rule is duplicated here either.
  const rampChroma = rampChromaOf(palette, controls.paletteGroups, controls);
  const primeChromaResolved = primeChromaOf(palette, controls.paletteGroups, controls);
  const stopList = paletteStops(
    { hue: palette.hue, chroma: rampChroma, skew: palette.skew, lift: palette.lift, hueShift: palette.hueShift, hueSameDir: palette.hueSameDir, cuspPull: palette.cuspPull },
    ctl,
    EXPORT_STOPS,
  );

  // stop (number) -> rgb int triple, for ref resolution.
  const byStop = new Map();
  const stops = {}; // { [pad3]: {rgb, hex, tone, chroma} }
  for (const s of stopList) {
    byStop.set(s.stop, s.rgb);
    stops[pad3(s.stop)] = { rgb: s.rgb, hex: s.hex, tone: s.tone, chroma: s.chroma };
  }

  // scrims: the 500 ramp -> { [base]: { [step]: { rgb (base's solid), alphaPct, frac, hex8 } } }.
  const scrims = {}; // { [base]: { [step]: {...} } }
  for (const base of SCRIM_BASES) {
    const rgb = byStop.get(base);
    scrims[base] = {};
    for (const step of SCRIM_STEPS) {
      const alphaPct = step / 10; // 50 -> 5%, 100 -> 10%, 950 -> 95%
      const frac = step / 1000;
      scrims[base][step] = { rgb, alphaPct, frac, hex: hex8(rgb, frac) };
    }
  }

  // resolveRef — a role ref ("550" solid, or "500-200" scrim) -> { rgb, frac }.
  // frac === 1 for a solid; for a scrim "{base}-{step}" it's step/1000 (rgb is the base's solid).
  const resolveRef = (ref) => {
    const s = String(ref);
    const dash = s.indexOf("-");
    if (dash === -1) {
      return { rgb: byStop.get(Number(s)), frac: 1 };
    }
    const base = Number(s.slice(0, dash));
    const step = Number(s.slice(dash + 1));
    return { rgb: byStop.get(base), frac: step / 1000 };
  };

  // The 53 semantic roles, with each ref pre-resolved to a concrete color for
  // BOTH modes. semanticRoles is keyed on the slug (so keys are name-prefixed).
  // on-color policy: "contrast" mode flips the accent on-colors to the better-contrasting end
  // BEFORE per-doc overrides (so an explicit override still wins). No-op in the default "fixed" mode.
  const lumOf = (ref) => { const rgb = byStop.get(Number(ref)); return rgb ? relLumExp(rgb) : 0; };
  const onAdjusted = applyOnColorContrast(accentRoles, n, lumOf, controls.onColorMode);
  const roles = applyRoleOverrides(onAdjusted, overrides).map((r) => {
    const L = resolveRef(r.light);
    const D = resolveRef(r.dark);
    return {
      key: r.key,
      suffix: r.suffix,
      lightRef: r.light,
      darkRef: r.dark,
      light: { rgb: L.rgb, frac: L.frac, hex: L.frac === 1 ? hexOf(L.rgb) : hex8(L.rgb, L.frac) },
      dark: { rgb: D.rgb, frac: D.frac, hex: D.frac === 1 ? hexOf(D.rgb) : hex8(D.rgb, D.frac) },
    };
  });

  // keyColors — retained brand colors, passed through verbatim (exact hex). They may sit
  // off the generated ramp; the UI places them perceptually, exports keep them exact. `rgb` is
  // derived once here (oklchToRgb) so every emitter that needs a hex/components leaf (DTCG, UI3)
  // shares one conversion instead of re-deriving it — CSS/JSON still read `oklch` directly.
  const keyColorsRaw = Array.isArray(palette.keyColors) ? palette.keyColors : [];
  const keyColors = keyColorsRaw.map((kc) => ({ ...kc, rgb: oklchToRgb(kc.oklch[0], kc.oklch[1], kc.oklch[2]) }));

  // prime — the seven per-palette identity swatches (REQ-050..057), on their OWN OKHSL ladder,
  // independent of the ramp above; mode-independent (R2), one set per palette. Built from
  // prime.mjs's own primeSwatches(), never reimplemented here (same call shape model.mjs's
  // projectView uses: the full `controls` object, not the ramp-only `ctl` slice, since
  // primeSwatches reads controls.hueSpace/primeChroma, neither of which `ctl` needs). `chroma` is
  // the palette's OWN unresolved value (REQ-002: the ramp target above never feeds this); `primeChroma`
  // is cleared on the palette so prime.mjs's own `palette.primeChroma ?? controls.primeChroma` falls
  // straight through to the value already resolved above (REQ-008) — prime.mjs itself never changes.
  const primeList = primeSwatches(
    { hue: palette.hue, chroma: palette.chroma, skew: palette.skew, hueShift: palette.hueShift, hueSameDir: palette.hueSameDir, primeChroma: undefined },
    { ...controls, primeChroma: primeChromaResolved },
  );
  const prime = {}; // { [step]: {step, l, s, hue, rgb, hex, oklch, inGamut} }
  for (const sw of primeList) prime[sw.step] = sw;

  // group (SPEC 0.3.0 RP-1, ticket #572): the palette's resolved canvas group — metadata every
  // emitter below may surface (JSON `group`, DTCG `$extensions`, a CSS/OKLCH/Tailwind comment line),
  // NEVER a token name or Figma folder (RP-1's own fence; UI3/ShadCN emit nothing from it).
  const group = paletteGroupOf(palette);
  return { name: palette.name, n, hue: palette.hue, group, stops, byStop, scrims, roles, keyColors, prime };
}

// derivedAll — every enabled palette derived, in State order. Exported: ds-export.js's DS-bundle
// layer derives from the SAME resolved roles (dsColorRoles/dsSemanticLayer/dsFullLayersCss).
export function derivedAll(state) {
  const controls = controlsOf(state);
  return enabledPalettes(state).map((p) => derivePalette(p, controls, state.roleOverrides));
}

// ── colorLeaf — the DTCG color leaf (ADR + knowledge-04 §4) ────────────────────
// components in [0,1]; hex reconstructs from round(component*255) per channel
// (+ alpha byte for scrims). alias (optional) attaches com.figma.aliasData.
function colorLeaf(rgb, frac, alias) {
  const comps = componentsOf(rgb);
  const solidHex = hexOf(rgb);
  const hex = frac === 1 ? solidHex : solidHex + hex2(frac * 255);
  const ext = {
    "com.figma.hiddenFromPublishing": true,
    "com.figma.scopes": ["ALL_SCOPES"],
  };
  if (alias) ext["com.figma.aliasData"] = alias;
  return {
    $type: "color",
    $value: { colorSpace: "srgb", components: comps, alpha: frac, hex },
    $extensions: ext,
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// 1. CSS (hex)
// ──────────────────────────────────────────────────────────────────────────────
// :root { flat raw vars (solids + scrim hex8) + --c-* semantic via light-dark() }.
// Every --c-* references TWO raw vars that are themselves emitted in :root (ADR-005).
export function exportCSS(state) {
  return cssFrom(derivedAll(state), false, cssPrefixOf(state));
}

// cssPrefixOf — the configurable CSS custom-property prefix (the `c` in `--c-*`). Lets a kit emit
// Material-flavoured names (`--md-sys-color-*`) or any custom namespace, extended with our roles.
// Sanitized to a legal CSS ident core: lowercased, non-[a-z0-9-] stripped, edge/leading-digit hyphens
// trimmed. Empty / default "c" ⇒ the historical `--c-*` (identity — existing kits byte-identical).
export function cssPrefixOf(state) {
  const raw = state && state.export && typeof state.export.colorPrefix === "string" ? state.export.colorPrefix : "";
  const clean = raw.toLowerCase().replace(/^-+/, "").replace(/[^a-z0-9-]+/g, "-").replace(/^(\d)/, "c$1").replace(/-+$/, "").replace(/^-+/, "");
  return clean || "c";
}

// ──────────────────────────────────────────────────────────────────────────────
// 2. CSS (OKLCH)
// ──────────────────────────────────────────────────────────────────────────────
// Identical structure; raw values are oklch(L C H) / oklch(L C H / a%). The
// semantic --c-* layer is unchanged (var() refs), so the two-layer flip holds.
export function exportOKLCH(state) {
  return cssFrom(derivedAll(state), true, cssPrefixOf(state));
}

// cssFrom — shared CSS body for both variants. oklch=false -> hex raw values. `pfx` is the
// custom-property prefix core (the `c` in `--c-*`); defaults to "c" for the historical output.
function cssFrom(palettes, oklch, pfx = "c") {
  const lines = [];
  lines.push(`/* ultimate-tokens export schema ${EXPORT_SCHEMA_VERSION} */`);
  lines.push(":root {");
  lines.push("  color-scheme: light dark;");
  // fixed system constants — NOT palette-derived, emitted ONCE (never per palette, never mode-flipped).
  lines.push(`  --${pfx}-dialog-backdrop: ${oklch ? dialogBackdropOklch() : dialogBackdropHex()};`);
  lines.push(`  --${pfx}-white: ${oklch ? whiteOklch() : whiteHex()};`);
  lines.push(`  --${pfx}-black: ${oklch ? blackOklch() : blackHex()};`);
  for (const p of palettes) {
    lines.push("");
    // group (SPEC 0.3.0 RP-1, ticket #572): metadata only — a comment, never a token.
    lines.push(`  /* ${p.name} · ${p.group} */`);
    lines.push(`  /* ${p.name} — flat mode-independent primitives */`);
    // solid RAW vars: --{pfx}-{n}-050 .. -950 (raw stop names end in digits; semantic role names end
    // in a word, so the two never collide despite sharing the prefix).
    for (const key of Object.keys(p.stops)) {
      const { rgb } = p.stops[key];
      const val = oklch ? oklchStr(rgbToOklch(rgb)) : hexOf(rgb);
      lines.push(`  --${pfx}-${p.n}-${key}: ${val};`);
    }
    // PRIME RAW vars: --{pfx}-{n}-prime-{step} (REQ-054) — the seven identity swatches, next to the
    // solid stops above; flat and mode-independent (R2), so no light-dark() wrapper.
    for (const step of PRIME_STEPS) {
      const sw = p.prime[step];
      const val = oklch ? oklchStr({ L: sw.oklch[0], C: sw.oklch[1], H: sw.oklch[2] }) : sw.hex;
      lines.push(`  --${pfx}-${p.n}-prime-${step}: ${val};`);
    }
    // scrim RAW vars: --{pfx}-{n}-scrim-{step} (ADR-016 nesting, hyphen surface; the canonical 500
    // base is omitted while SCRIM_BASES is single — refSlug re-adds it if a second base ever ships)
    for (const base of SCRIM_BASES) {
      for (const step of SCRIM_STEPS) {
        const sc = p.scrims[base][step];
        const val = oklch ? oklchStrA(rgbToOklch(sc.rgb), sc.alphaPct) : sc.hex;
        lines.push(`  --${pfx}-${p.n}-${refSlug(`${base}-${step}`)}: ${val};`);
      }
    }
    // SEMANTIC --{pfx}-{n}-{role} vars: light-dark(var(light raw), var(dark raw)) (ADR-005)
    lines.push(`  /* ${p.name} — semantic roles */`);
    for (const r of p.roles) {
      const lv = `var(--${pfx}-${p.n}-${refSlug(r.lightRef)})`;
      const dv = `var(--${pfx}-${p.n}-${refSlug(r.darkRef)})`;
      lines.push(`  --${pfx}-${p.n}${r.suffix}: light-dark(${lv}, ${dv});`);
    }
    // KEY COLORS — retained brand values by expression (dominant/supportive), exact in OKLCH
    // (NOT mode-flipped; they are source colors, lossless from the OKLCH source).
    if (p.keyColors.length) {
      lines.push(`  /* ${p.name} — retained key colors (exact, OKLCH) */`);
      for (const kc of p.keyColors) {
        lines.push(`  --${pfx}-${p.n}-key-${kc.role}: ${oklchStr({ L: kc.oklch[0], C: kc.oklch[1], H: kc.oklch[2] })};`);
      }
    }
  }
  lines.push("}");
  return lines.join("\n") + "\n";
}

// ──────────────────────────────────────────────────────────────────────────────
// 3. JSON
// ──────────────────────────────────────────────────────────────────────────────
// { meta..., [paletteSlug]: { stops:{pad3:hex}, scrims:{step:{hex,alpha}}, semantic:[{key,light,dark}] } }
// Keyed by the palette SLUG (ADR-016 — every other format keys by slug; the display name rides
// nowhere in JSON, by design). Scrims key by their 3-digit STEP (the single canonical 500 base is
// implicit); semantic `key` is the kebab leaf shared with every surface. Disabled palettes absent.
export function exportJSON(state) {
  const palettes = derivedAll(state);
  // meta (SPEC 0.3.0 RP-2, ticket #573, plan PR #571 step E2): `generator` names this tool (the same
  // literal ds-export.js's `$generator`/model.mjs's `brandKit().generator` already use); `controls`
  // states the chroma policy this export was resolved under, verbatim off `state` (the SAME two
  // global-fallback fields and `paletteGroups` derivePalette used for every palette above — never a
  // re-derived or stale snapshot). The first control's key is `baseChroma`, not the document-level
  // control name it's read off of: AC-004 (SPEC 0.3.0) bars that literal string from src/engine in
  // ANY form, including as a mere property name here — see resolvePaletteGroups' own doc comment in
  // model.mjs for the renamed-at-one-boundary rule this keeps. `schemaVersion` (RP-8, ticket #577,
  // plan PR #571 step E6) stamps EXPORT_SCHEMA_VERSION verbatim — absence on an older export meant v1.
  const out = {
    meta: {
      generator: "Ultimate Tokens",
      schemaVersion: EXPORT_SCHEMA_VERSION,
      controls: {
        baseChroma: state.baseChroma,
        primeChroma: state.primeChroma,
        paletteGroups: state.paletteGroups,
      },
    },
  };
  for (const p of palettes) {
    // stops: { "050": "#RRGGBB", ... } — 3-digit padded keys.
    const stops = {};
    for (const key of Object.keys(p.stops)) stops[key] = p.stops[key].hex;

    // scrims: { "200": {hex, alpha}, ... } — keyed by padded STEP, alpha% = step/10 (500 base implicit).
    const scrims = {};
    for (const base of SCRIM_BASES) {
      for (const step of SCRIM_STEPS) {
        const sc = p.scrims[base][step];
        scrims[pad3(step)] = { hex: sc.hex, alpha: sc.alphaPct };
      }
    }

    // prime: { "brightest": {hex, oklch}, ... } — keyed by step NAME (a word, not padded, mirroring
    // keyColors' role keys), the seven identity swatches (REQ-054), always present (not opt-in).
    const prime = {};
    for (const step of PRIME_STEPS) {
      const sw = p.prime[step];
      prime[step] = { hex: sw.hex, oklch: oklchStr({ L: sw.oklch[0], C: sw.oklch[1], H: sw.oklch[2] }) };
    }

    // semantic: [{ key, light:"#hex", dark:"#hex" }, ...] — `key` is the kebab leaf (ADR-016).
    const semantic = p.roles.map((r) => ({
      key: roleLeaf(p.n, r),
      light: r.light.hex,
      dark: r.dark.hex,
    }));

    // group (SPEC 0.3.0 RP-1, ticket #572): metadata only, one of "material"/"brand"/"system"/"data".
    const palette = { group: p.group, stops, scrims, prime, semantic };
    // keyColors: [{ role, oklch:[L,C,H], name? }] — retained exact brand colors (present only when set).
    if (p.keyColors.length) palette.keyColors = p.keyColors.map((kc) => ({ role: kc.role, oklch: kc.oklch, ...(kc.name ? { name: kc.name } : {}) }));
    out[p.n] = palette;
  }
  // constants — fixed, non-palette tokens. A sibling key to the palette slugs, never itself a palette.
  out.constants = {
    "dialog-backdrop": { hex: dialogBackdropHex() },
    white: { hex: whiteHex() },
    black: { hex: blackHex() },
  };
  return out;
}

// ──────────────────────────────────────────────────────────────────────────────
// 4. Figma DTCG — the raw file plus one semantic file per THEME
// ──────────────────────────────────────────────────────────────────────────────
// palette.tokens.json     -> RAW collection (mode Value): 25 solids + 11 scrims per palette.
// {theme.name}_tokens.json -> SEMANTIC (mode {theme.name}): 53 roles RESOLVED to the theme's
//                             `side` ref's color ("light" or "dark" — see semantic.js's
//                             DEFAULT_THEMES header note: a role stays a 2-ended light/dark
//                             model; a THEME is a named mode bound to one of those two ends).
//
// opts.themes (TKT-0021 — the theme axis, generalized): an array of {name, side}, default
// semantic.js's DEFAULT_THEMES ([{name:"Light",side:"light"},{name:"Dark",side:"dark"}]) — so
// an absent/default opts.themes reproduces today's exact "Light_tokens.json"/"Dark_tokens.json"
// pair, byte-identical. A caller can pass a longer list (e.g. + {name:"Dim",side:"dark"}) to add
// a named mode with NO engine change — the axis is data now, not a hardcoded pair. This does NOT
// give a theme its own resolved color per role (that would need a 3rd ref in the role table
// itself, a separate and much larger change) — every theme's value is one of the role's two
// EXISTING resolved ends.
//
// opts.rawColl branch (ADR-002):
//   BLANK/undefined -> NO semantic leaf carries com.figma.aliasData (resolved-only;
//                      always imports natively).
//   SET             -> EVERY semantic leaf carries com.figma.aliasData =
//                      { targetVariableName: "{n}/{refPath(ref)}", targetVariableSetName: rawColl }
//                      (the ref for that theme's `side`: light's ref for a "light"-side theme,
//                      dark's ref for a "dark"-side theme).
export function exportDTCG(state, opts) {
  const rawColl = opts && opts.rawColl ? opts.rawColl : "";
  const themes = opts && Array.isArray(opts.themes) && opts.themes.length ? opts.themes : DEFAULT_THEMES;
  const palettes = derivedAll(state);

  // RAW tree: { [n]: { [pad3]: leaf, [base-i]: leaf } } — resolved, no aliasData.
  const rawTree = {};
  for (const p of palettes) {
    const grp = {};
    for (const key of Object.keys(p.stops)) {
      grp[key] = colorLeaf(p.stops[key].rgb, 1, null);
    }
    // scrims NEST under a scrim/ group (ADR-016 — two segments, never a numeral-compound leaf).
    const scrimGrp = {};
    for (const base of SCRIM_BASES) {
      for (const step of SCRIM_STEPS) {
        const sc = p.scrims[base][step];
        scrimGrp[pad3(step)] = colorLeaf(sc.rgb, sc.frac, null);
      }
    }
    grp.scrim = scrimGrp;
    // prime NESTS under a prime/ group (mirrors scrim/'s two-segment shape, ADR-016) — the seven
    // identity swatches (REQ-054), resolved, no aliasData, mode-independent (R2), always present
    // (not opt-in like key/).
    const primeGrp = {};
    for (const step of PRIME_STEPS) primeGrp[step] = colorLeaf(p.prime[step].rgb, 1, null);
    grp.prime = primeGrp;
    // key colors NEST under a key/ group (mirrors scrim/'s two-segment shape, ADR-016) — retained
    // brand colors, exact (frac 1, no alpha), keyed by their role string ("dominant"/"supportive"),
    // never pad3'd (a key role is a word, not a stop number). Present only when the palette set any
    // (TKT-0022 — these were silently absent from DTCG/UI3 despite exporting fine via CSS/JSON).
    if (p.keyColors.length) {
      const keyGrp = {};
      for (const kc of p.keyColors) keyGrp[kc.role] = colorLeaf(kc.rgb, 1, null);
      grp.key = keyGrp;
    }
    // group (SPEC 0.3.0 RP-1, ticket #572): metadata on the RAW palette node only (never the
    // semantic theme files below) — a DTCG $extensions leaf, never a token name or Figma folder.
    grp.$extensions = { "com.ultimate-tokens": { group: p.group } };
    rawTree[p.n] = grp;
  }
  // constants — fixed, non-palette raw primitives, a sibling GROUP to the palette names (never
  // itself resolved from a palette). Single value each, no per-mode variance.
  rawTree.constants = {
    "dialog-backdrop": colorLeaf(DIALOG_BACKDROP_RGB, DIALOG_BACKDROP_ALPHA_PCT / 100, null),
    white: colorLeaf(WHITE_RGB, 1, null),
    black: colorLeaf(BLACK_RGB, 1, null),
  };

  // SEMANTIC tree for one theme's `side` ("light" | "dark"): each role -> resolved leaf,
  // with aliasData attached iff rawColl is set, targeting that side's ref.
  const semanticTree = (side) => {
    const tree = {};
    for (const p of palettes) {
      const grp = {};
      for (const r of p.roles) {
        const end = side === "light" ? r.light : r.dark;
        const ref = side === "light" ? r.lightRef : r.darkRef;
        const alias = rawColl
          ? { targetVariableName: `${p.n}/${refPath(ref)}`, targetVariableSetName: rawColl }
          : null;
        grp[roleLeaf(p.n, r)] = colorLeaf(end.rgb, end.frac, alias);
      }
      tree[p.n] = grp;
    }
    // NOTE: constants (dialog-backdrop) deliberately do NOT get a semantic-tree entry here — every
    // top-level key of this tree is treated elsewhere (style-plan family derivation, regroup
    // ordering) as a REAL PALETTE with a full 53-role set, positionally zipped against
    // doc.palettes. A synthetic non-palette key breaks that invariant. Constants live ONLY in the
    // raw tree (palette.tokens.json, above) — a flat, name-generic collection with no such
    // assumption — so they land in Color Primitives, bound to directly (no semantic alias, since
    // the value never flips between modes and has no palette to alias FROM).
    return tree;
  };

  // figmaMode — tag a tree's top level with its Figma mode name, plus the export schema stamp
  // (RP-8, ticket #577, plan PR #571 step E6): every one of the 3 files gets the SAME root
  // $extensions["com.ultimate-tokens"].schemaVersion, a sibling of com.figma.modeName — the
  // plugin's own childKeys() already skips any "$"-prefixed root key, so this is inert to it.
  const figmaMode = (tree, modeName) => ({
    ...tree,
    $extensions: { "com.figma.modeName": modeName, "com.ultimate-tokens": { schemaVersion: EXPORT_SCHEMA_VERSION } },
  });

  // one semantic file per theme, in `themes` order — with the default DEFAULT_THEMES this produces
  // exactly {"Light_tokens.json":..., "Dark_tokens.json":...}, byte-identical to the pre-TKT-0021 shape.
  const out = { "palette.tokens.json": figmaMode(rawTree, "Value") };
  for (const t of themes) out[`${t.name}_tokens.json`] = figmaMode(semanticTree(t.side), t.name);
  return out;
}

// ──────────────────────────────────────────────────────────────────────────────
// 5. Collections (UI3) — interchange-only (ADR-007), NOT a native Figma path.
// ──────────────────────────────────────────────────────────────────────────────
// Two collections: raw primitives (single "Base" mode) and semantic (Light/Dark
// modes) whose values are IN-FILE key-path aliases the importer resolves.
export function exportUI3(state) {
  const palettes = derivedAll(state);
  const primVars = {};
  const semVars = {};
  const primeVars = {};

  for (const p of palettes) {
    // raw primitives: "raw/{n}/{pad3}" and "raw/{n}/{base-i}".
    for (const key of Object.keys(p.stops)) {
      primVars[`raw/${p.n}/${key}`] = { type: "COLOR", values: { Base: p.stops[key].hex } };
    }
    for (const base of SCRIM_BASES) {
      for (const step of SCRIM_STEPS) {
        const sc = p.scrims[base][step];
        primVars[`raw/${p.n}/${refPath(`${base}-${step}`)}`] = { type: "COLOR", values: { Base: sc.hex } };
      }
    }
    // key colors: "raw/{n}/key/{role}" — retained brand colors, exact (mirrors the DTCG raw-tree
    // key/ group; TKT-0022). Present only when the palette set any.
    for (const kc of p.keyColors) {
      primVars[`raw/${p.n}/key/${kc.role}`] = { type: "COLOR", values: { Base: hexOf(kc.rgb) } };
    }
    // semantic: "{n}/{kebab leaf}" -> in-file aliases to the raw key paths per mode (ADR-016).
    for (const r of p.roles) {
      semVars[`${p.n}/${roleLeaf(p.n, r)}`] = {
        type: "COLOR",
        values: {
          Light: `{raw/${p.n}/${refPath(r.lightRef)}}`,
          Dark: `{raw/${p.n}/${refPath(r.darkRef)}}`,
        },
      };
    }
    // prime: its OWN top-level collection (REQ-054, LLD Interfaces block) — "{n}/{step}" (no "raw/"
    // prefix, the same no-prefix convention the Semantic collection above already uses), one Base
    // mode, the seven identity swatches, always present (not opt-in like key/).
    for (const step of PRIME_STEPS) {
      primeVars[`${p.n}/${step}`] = { type: "COLOR", values: { Base: p.prime[step].hex } };
    }
  }
  // constants — fixed, non-palette raw primitives, Primitives-collection ONLY (mirrors the DTCG
  // raw-tree-only placement: the Semantic collection's top-level keys are treated elsewhere as real
  // palettes with a full role set, positionally zipped against doc.palettes — a synthetic key there
  // breaks that invariant). Bind to these directly; nothing to alias FROM a palette that isn't one.
  primVars["raw/constants/dialog-backdrop"] = { type: "COLOR", values: { Base: dialogBackdropHex() } };
  primVars["raw/constants/white"] = { type: "COLOR", values: { Base: whiteHex() } };
  primVars["raw/constants/black"] = { type: "COLOR", values: { Base: blackHex() } };

  return {
    $schema: `figma-ui3-variables.color.schema.v${EXPORT_SCHEMA_VERSION}`,
    collections: {
      [COLLECTIONS.colorRaw]: { modes: ["Base"], variables: primVars },
      [COLLECTIONS.colorSemantic]: { modes: ["Light", "Dark"], variables: semVars },
      [COLLECTIONS.colorPrime]: { modes: ["Base"], variables: primeVars },
    },
  };
}

// roleOklch — a resolved role end ({rgb, frac}) -> an oklch() string, with alpha for
// scrim-backed roles (frac < 1, e.g. outline/container on the 500 ramp). Exported: ds-export.js's
// DS-bundle layer renders every color through this same string form.
export function roleOklch(end) {
  return end.frac === 1 ? oklchStr(rgbToOklch(end.rgb)) : oklchStrA(rgbToOklch(end.rgb), end.frac * 100);
}

// ──────────────────────────────────────────────────────────────────────────────
// 7. TAILWIND (v4 `@theme`)
// ──────────────────────────────────────────────────────────────────────────────
// The ramps ARE a Tailwind color scale: every stop -> --color-{n}-{stop} (oklch),
// so `bg-{n}-500` / `text-{n}-50` work. The 53 semantic roles emit as
// --color-{n}{suffix} with a light-dark() value, so `bg-{n}` / `text-surface` flip
// automatically (needs `color-scheme: light dark` on a root — noted in the header).
export function exportTailwind(state) {
  const palettes = derivedAll(state);
  const lines = [];
  lines.push(`/* ultimate-tokens export schema ${EXPORT_SCHEMA_VERSION} */`);
  lines.push("/* Tailwind v4 theme — generated by Ultimate Tokens.");
  lines.push("   Paste after `@import \"tailwindcss\";`. Ramps -> bg-{name}-{stop};");
  lines.push("   semantic roles flip via light-dark() (set `color-scheme: light dark`). */");
  lines.push("@theme {");
  lines.push("");
  lines.push("  /* fixed system constants — not palette-derived */");
  lines.push(`  --color-dialog-backdrop: ${dialogBackdropOklch()};`);
  lines.push(`  --color-white: ${whiteOklch()};`);
  lines.push(`  --color-black: ${blackOklch()};`);
  for (const p of palettes) {
    lines.push("");
    // group (SPEC 0.3.0 RP-1, ticket #572): metadata only — a comment, never a token.
    lines.push(`  /* ${p.name} · ${p.group} */`);
    lines.push(`  /* ${p.name} — scale */`);
    for (const key of Object.keys(p.stops)) {
      // pad3 "050" -> Tailwind key "50"; finer stops (150/250/…) stay as-is (valid in v4).
      lines.push(`  --color-${p.n}-${String(Number(key))}: ${oklchStr(rgbToOklch(p.stops[key].rgb))};`);
    }
    // PRIME — --color-{n}-prime-{step} (REQ-054), next to the scale above; the seven identity
    // swatches, flat and mode-independent (R2).
    for (const step of PRIME_STEPS) {
      const sw = p.prime[step];
      lines.push(`  --color-${p.n}-prime-${step}: ${oklchStr({ L: sw.oklch[0], C: sw.oklch[1], H: sw.oklch[2] })};`);
    }
  }
  for (const p of palettes) {
    lines.push("");
    lines.push(`  /* ${p.name} — semantic roles (auto light/dark) */`);
    for (const r of p.roles) {
      lines.push(`  --color-${p.n}${r.suffix}: light-dark(${roleOklch(r.light)}, ${roleOklch(r.dark)});`);
    }
  }
  lines.push("}");
  return lines.join("\n") + "\n";
}

// ──────────────────────────────────────────────────────────────────────────────
// 8. SHADCN (oklch `:root` / `.dark` + `@theme inline`)
// ──────────────────────────────────────────────────────────────────────────────
// ShadCN expects a FIXED token contract. We map the semantic roles onto it by
// ROLE (not palette name, so it survives renamed/preset palettes): the neutral-ish
// palette drives surfaces, the primary-ish one drives primary/ring, the danger-ish
// one drives destructive. Light = each role's light end, dark = its dark end.
const SHADCN_ORDER = [
  "background", "foreground", "card", "card-foreground", "popover", "popover-foreground",
  "primary", "primary-foreground", "secondary", "secondary-foreground", "muted", "muted-foreground",
  "accent", "accent-foreground", "destructive", "destructive-foreground", "border", "input", "ring",
  "chart-1", "chart-2", "chart-3", "chart-4", "chart-5", "chart-6", "chart-7", "chart-8",
  "sidebar", "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground",
  "sidebar-accent", "sidebar-accent-foreground", "sidebar-border", "sidebar-ring",
];

// pickDrivers — the driver-palette pick (REQ-040 of spec-panda-park-ui-exports.md), extracted
// from exportShadcn so exportParkUi (and exportPanda's header, for accent/gray naming) can reuse
// the exact same name-regex logic instead of a second copy. #503 REQ-031: data palettes
// (data-1..8) never stand in for neutral/primary/"first palette" — every non-chart pick searches
// the non-data pool only, so 16-palette docs keep today's shadcn picks.
export function pickDrivers(palettes) {
  const nonData = palettes.filter((p) => !isDataPalette(p));
  const find = (re) => nonData.find((p) => re.test(p.name.toLowerCase()));
  const neutral = find(/neutral|gray|grey|slate|stone|zinc|mono/) || nonData[0];
  const primary = find(/primary|brand/) || nonData.find((p) => p !== neutral) || nonData[0];
  const danger = find(/danger|destruct|error|critical|red/) || primary;
  const success = find(/success|positive|green/);
  const warning = find(/warn|caution|amber|yellow|orange/);
  const secondary = find(/secondary|tertiary/);
  return { neutral, primary, danger, success, warning, secondary };
}

export function exportShadcn(state, opts = {}) {
  const palettes = derivedAll(state);
  const { neutral, primary, danger, success, warning, secondary } = pickDrivers(palettes);
  if (!neutral || !primary) return "/* ShadCN export needs at least one enabled palette. */\n";

  // each MAP entry carries its palette-qualified token name so alias mode (opts.aliasPrefix) can emit
  // `var(--{prefix}-{family}{suffix})` — a LINK into the design-token layer — instead of a baked literal.
  const rs = (p, suffix) => { const r = p && p.roles.find((x) => x.suffix === suffix); return r ? { ...r, aliasName: p.n + suffix } : null; };
  const prime = (p) => rs(p, "");
  const onAccent = (p) => p && rs(p, "-on-" + p.n);
  const aliasPfx = typeof opts.aliasPrefix === "string" && opts.aliasPrefix ? opts.aliasPrefix : null;

  // chart-N (#503 REQ-031/EX-7): the prime role of data-N when that enabled palette exists (palettes
  // is already the ENABLED set — derivedAll/enabledPalettes — so a disabled data-N falls straight
  // through to the fallback); else the pre-feature fallback chain, unchanged.
  const dataN = (i) => palettes.find((p) => p.n === `data-${i}`);
  const chart = (i, fallback) => { const d = dataN(i); return d ? prime(d) : fallback; };
  // chart-6..8 (#569 RP-3/H-3, a deliberate departure from shadcn's stock 5 chart slots): the prime
  // role of data-6..8 when enabled, else OMITTED entirely — no fallback chain, unlike chart-1..5.
  // An invented sixth/seventh/eighth colour would be exactly what the stock contract lacks.
  const chartData = (i) => { const d = dataN(i); return d ? prime(d) : null; };

  // token -> the role whose light/dark ends drive it (null tokens are skipped).
  const MAP = {
    background: rs(neutral, "-background"), foreground: rs(neutral, "-on-surface"),
    card: rs(neutral, "-surface"), "card-foreground": rs(neutral, "-on-surface"),
    popover: rs(neutral, "-surface"), "popover-foreground": rs(neutral, "-on-surface"),
    primary: prime(primary), "primary-foreground": onAccent(primary),
    secondary: secondary ? prime(secondary) : rs(neutral, "-surface-high"),
    "secondary-foreground": secondary ? onAccent(secondary) : rs(neutral, "-on-surface"),
    muted: rs(neutral, "-surface-low"), "muted-foreground": rs(neutral, "-on-surface-variant"),
    accent: rs(neutral, "-surface-high"), "accent-foreground": rs(neutral, "-on-surface"),
    destructive: prime(danger), "destructive-foreground": onAccent(danger),
    border: rs(neutral, "-outline-variant"), input: rs(neutral, "-outline-variant"), ring: prime(primary),
    "chart-1": chart(1, prime(primary)), "chart-2": chart(2, prime(success || secondary || primary)),
    "chart-3": chart(3, prime(warning || secondary || primary)), "chart-4": chart(4, prime(danger)),
    "chart-5": chart(5, prime(secondary || neutral)),
    "chart-6": chartData(6), "chart-7": chartData(7), "chart-8": chartData(8),
    sidebar: rs(neutral, "-surface"), "sidebar-foreground": rs(neutral, "-on-surface"),
    "sidebar-primary": prime(primary), "sidebar-primary-foreground": onAccent(primary),
    "sidebar-accent": rs(neutral, "-surface-high"), "sidebar-accent-foreground": rs(neutral, "-on-surface"),
    "sidebar-border": rs(neutral, "-outline-variant"), "sidebar-ring": prime(primary),
  };

  // alias mode: both scheme blocks emit the SAME var() reference — the referenced design token flips
  // per scheme where it is defined (the appended full layer's :root/.dark), so there is exactly one
  // source of truth for every color value in the file.
  const block = (mode) =>
    SHADCN_ORDER.map((tok) => {
      const r = MAP[tok];
      if (!r) return null;
      return aliasPfx ? `  --${tok}: var(--${aliasPfx}-${r.aliasName});` : `  --${tok}: ${roleOklch(r[mode])};`;
    }).filter(Boolean).join("\n");

  const themeInline = SHADCN_ORDER.filter((tok) => MAP[tok])
    .map((tok) => `  --color-${tok}: var(--${tok});`).join("\n") + "\n  --color-overlay: var(--overlay);";

  // --overlay — the one fixed, non-role token in this contract: a dialog/modal backdrop, identical
  // in :root and .dark (an overlay doesn't flip). Outside SHADCN_ORDER/MAP on purpose (nothing to
  // look up by role); in alias mode it links into the SAME full-token-layer constant every other
  // aliased var here points at, so D10 carrier equality holds for it too.
  const overlayLine = aliasPfx ? `  --overlay: var(--${aliasPfx}-dialog-backdrop);` : `  --overlay: ${dialogBackdropOklch()};`;

  // GEOMETRY → --radius: seed shadcn's base radius from the brand geometry's `md` corner — a medium
  // corner on the M3-aligned scale (12px → 0.75rem); shadcn's own sm/md/lg/xl ladder derives from it by
  // shadcn's calc convention. TYPOGRAPHY → the brand fonts in shadcn's three family slots: --font-sans ←
  // body, --font-serif ← display, --font-mono ← mono (quoted — digit names like "Source Serif 4" are
  // invalid unquoted in Safari). Both fall back to the shadcn defaults when absent.
  const radiusPx = opts.radii && Number.isFinite(opts.radii.md) ? opts.radii.md : null;
  const radiusLine = radiusPx != null ? `  --radius: ${parseFloat((radiusPx / 16).toFixed(4))}rem;` : "  --radius: 0.625rem;";
  const fonts = opts.fonts && typeof opts.fonts === "object" ? opts.fonts : {};
  const fontVars = [
    fonts.body ? `  --font-sans: '${fonts.body}', ui-sans-serif, system-ui, sans-serif;` : null,
    fonts.display ? `  --font-serif: '${fonts.display}', ui-serif, Georgia, serif;` : null,
    fonts.mono ? `  --font-mono: '${fonts.mono}', ui-monospace, SFMono-Regular, monospace;` : null,
  ].filter(Boolean);

  return [
    `/* ultimate-tokens export schema ${EXPORT_SCHEMA_VERSION} */`,
    "/* ShadCN theme — generated by Ultimate Tokens. Replace the token blocks in",
    `   your globals.css. Mapped from: neutral=${neutral.name}, primary=${primary.name}, destructive=${danger.name}.${aliasPfx ? `\n   Values are LINKS (var()) into the --${aliasPfx}-* design-token layer below — one source of truth.` : ""} */`,
    ":root {",
    radiusLine,
    overlayLine,
    block("light"),
    "}",
    "",
    ".dark {",
    overlayLine,
    block("dark"),
    "}",
    "",
    "@theme inline {",
    "  --radius-sm: calc(var(--radius) - 4px);",
    "  --radius-md: calc(var(--radius) - 2px);",
    "  --radius-lg: var(--radius);",
    "  --radius-xl: calc(var(--radius) + 4px);",
    ...fontVars,
    themeInline,
    "}",
    "",
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// 9. PANDA (a Panda CSS preset module — docs/spec/spec-panda-park-ui-exports.md REQ-001..009)
// ──────────────────────────────────────────────────────────────────────────────
// exportPanda(state, opts) -> a preset OBJECT `{ name, theme: { extend: { tokens,
// semanticTokens } } }` — `theme.extend`, never bare `theme` (PF-1), so `@pandacss/preset-panda`
// survives in the consumer's `presets` array. Every colour is a RESOLVED oklch() string (N-3);
// unlike this file's ADR-006-padded CSS/JSON/DTCG/UI3 surfaces, every Panda key is UNPADDED
// (N-1, the Panda/Tailwind convention exportTailwind already uses — `"50"`, not `"050"`).
// Color is always emitted (K1 of #586); `opts.type` (a resolved typeScale) additionally emits
// `tokens.fonts`/`textStyles`, and `opts.geometry` (a resolved geomScale) additionally emits
// `tokens.radii`/`spacing`/`borderWidths` (K2 of #587, REQ-007/008) — absent opts, absent blocks
// (backward-compatible, the shadcn precedent).
export function exportPanda(state, opts = {}) {
  const palettes = derivedAll(state);
  const tokens = {
    colors: {
      constant: {
        white: { value: whiteOklch() },
        black: { value: blackOklch() },
        backdrop: { value: dialogBackdropOklch() },
      },
    },
  };
  const semanticTokens = { colors: {} };
  for (const p of palettes) {
    // raw: {n}.{stop} (unpadded, REQ-002) + {n}.scrim.{step} (REQ-003) + {n}.prime.{step}/.DEFAULT
    // (REQ-003) — a raw key is always a digit or one of the two group words `scrim`/`prime`, so it
    // never collides with a semantic role key (REQ-005: no role suffix is `scrim`/`prime` alone).
    const raw = {};
    for (const key of Object.keys(p.stops)) {
      raw[String(Number(key))] = { value: oklchStr(rgbToOklch(p.stops[key].rgb)) };
    }
    const scrim = {};
    for (const base of SCRIM_BASES) {
      for (const step of SCRIM_STEPS) {
        const sc = p.scrims[base][step];
        scrim[String(step)] = { value: roleOklch({ rgb: sc.rgb, frac: sc.frac }) };
      }
    }
    raw.scrim = scrim;
    const prime = {};
    for (const step of PRIME_STEPS) {
      const sw = p.prime[step];
      prime[step] = { value: oklchStr({ L: sw.oklch[0], C: sw.oklch[1], H: sw.oklch[2] }) };
    }
    prime.DEFAULT = prime.prime;
    raw.prime = prime;
    tokens.colors[p.n] = raw;

    // semantic: {n}.{roleKey} for all 53 roles (REQ-005/006) — a role's suffix without its
    // leading dash ("-on-surface" -> "on-surface"); the bare accent role (suffix "") is DEFAULT.
    // Every leaf carries BOTH ends, resolved, even when they're byte-equal (REQ-006).
    const sem = {};
    for (const r of p.roles) {
      const roleKey = r.suffix ? r.suffix.slice(1) : "DEFAULT";
      sem[roleKey] = { value: { base: roleOklch(r.light), _dark: roleOklch(r.dark) } };
    }
    semanticTokens.colors[p.n] = sem;
  }
  const name = "ultimate-tokens-" + slug(state.name || "brand-kit");

  // REQ-007: opts.type (a resolved typeScale) -> tokens.fonts.{display,heading,body,ui,mono},
  // the quoted stack typeTokensCSS already emits, plus textStyles.{voice}.{sm,md,lg} for the 15
  // voices (voice = the CSS voice slug, e.g. "sub-heading"), DEFAULT aliasing md. paragraphSpacing/
  // paragraphIndent are not Panda text-style fields and are dropped.
  let textStyles;
  if (opts.type && typeof opts.type === "object") {
    const ts = opts.type;
    tokens.fonts = {};
    for (const [role, family] of Object.entries(ts.fonts)) {
      tokens.fonts[role] = { value: cssFontStack(family, role, "premium") };
    }
    textStyles = {};
    for (const [voice, steps] of Object.entries(ts.categories)) {
      const voiceKey = slug(voice);
      const fontFamily = `{fonts.${ts.roleOf[voice]}}`;
      const style = {};
      for (const rank of ["SM", "MD", "LG"]) {
        const s = steps[rank];
        style[rank.toLowerCase()] = {
          value: {
            fontFamily,
            fontSize: `${s.size}px`,
            lineHeight: `${s.lineHeight}px`,
            letterSpacing: `${s.letterSpacing}px`,
            fontWeight: s.weight,
            textTransform: s.textTransform || "none",
          },
        };
      }
      style.DEFAULT = style.md;
      textStyles[voiceKey] = style;
    }
  }

  // REQ-008: opts.geometry (a resolved geomScale) -> tokens.radii.{none,xs,sm,md,lg,xl,full}
  // (full = 9999px), tokens.spacing.{0..9}, tokens.borderWidths.{thin,thick} — all px strings
  // (PF-2). The size ramp, insets, gaps, and focus are not emitted in v1 (non-goal).
  if (opts.geometry && typeof opts.geometry === "object") {
    const gs = opts.geometry;
    tokens.radii = {};
    for (const [k, v] of Object.entries(gs.radii)) tokens.radii[k] = { value: `${v}px` };
    tokens.spacing = {};
    for (const [k, v] of Object.entries(gs.space)) tokens.spacing[k] = { value: `${v}px` };
    tokens.borderWidths = {};
    for (const [k, v] of Object.entries(gs.borders)) tokens.borderWidths[k] = { value: `${v}px` };
  }

  return { name, theme: { extend: { tokens, semanticTokens, ...(textStyles ? { textStyles } : {}) } } };
}

// exportPandaModule — the ESM preset-module STRING the drawer shows and the zip ships (REQ-001):
// a fixed two-line header comment, then `export default <preset JSON>;`. No import of
// `@pandacss/dev` — `definePreset` is a no-op typing helper a consumer may wrap this in.
export function exportPandaModule(preset) {
  return [
    "/* Panda CSS preset, generated by Ultimate Tokens.",
    "   presets: ['@pandacss/preset-panda', preset]; dark mode = the .dark class (_dark). */",
    "export default " + JSON.stringify(preset, null, 2) + ";",
    "",
  ].join("\n");
}

// ──────────────────────────────────────────────────────────────────────────────
// exportAll — every format in one object (theme-independent).
// ──────────────────────────────────────────────────────────────────────────────
export function exportAll(state, opts) {
  return {
    css: exportCSS(state),
    oklch: exportOKLCH(state),
    json: exportJSON(state),
    dtcg: exportDTCG(state, opts),
    ui3: exportUI3(state),
    tailwind: exportTailwind(state),
    shadcn: exportShadcn(state),
    panda: exportPanda(state),
  };
}
