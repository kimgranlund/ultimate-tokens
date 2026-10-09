// persist.js: the persistence layer for the HctApp document. Clamp a State's domains, translate
// renamed ids, and own the storage keys. A PURE serialize/hydrate transform pair over the tool's
// `State` (spec-draft §7, knowledge-02 §2): no storage I/O lives here, that's the running tool's
// own `window.storage -> localStorage -> in-memory` chain under STORAGE_KEY (ADR-010,
// spec-draft §11). This module only owns the two pure, testable halves of that chain:
//
//   serialize(state)   -> a plain JSON-able snapshot (the bytes the chain stores)
//   hydrate(snapshot)  -> a valid State, every field clamped to its DOMAIN
//
// The two invariants this file is built to (the harness checks them over a sealed,
// withheld-seed fuzzed State set, so this must be a real identity-preserving clamp, not an
// identity table and not a clamp-to-default): (1) ROUNDTRIP IDENTITY, for any State whose
// every field is already in its domain, hydrate(serialize(S)) deep-equals S EXACTLY, with
// in-domain fields never mutated, rounded, defaulted, or reset; fractional and on-the-bound
// values survive byte-for-byte, and palette array contents and order are preserved; (2)
// PER-FIELD CLAMP, when a field is out of its domain, ONLY that field moves to its nearest
// valid bound, every other (in-domain) field, including sibling fields inside the same
// palette object, is preserved byte-for-byte. serialize() also stamps a schemaVersion
// (CURRENT_SCHEMA_VERSION); hydrate() runs any still-relevant RENAME_MAPS entry before the
// domain clamp, so a doc saved before a canon rename (a voice, a treatment id, ...) survives
// as its current name, never dropped by a current-names allowlist (TKT-0016, RENAME_MAPS below).
// Its imports are engine constants (icon systems, the default type, the collections) and the
// zero-dep layer-pin rule (layer-pins.mjs, never the layer registry); nothing from the DOM.
import { ICON_SYSTEMS, DEFAULT_ICON_SYSTEM } from "../engine/icon-systems.mjs";
import { DEFAULT_TYPE } from "../engine/type.mjs";
import { DEFAULT_GEOMETRY } from "../engine/geometry.mjs";
import { COLLECTIONS } from "../engine/collections.js";
import { LATEST, pinsOf } from "../engine/layer-pins.mjs";

// PALETTE_GROUPS (ticket #556), the four canvas group ids. Declared HERE, not in model.mjs: this
// codebase's normal dependency direction is model.mjs importing FROM persist.js (never the
// reverse), so this is the single canonical definition, model.mjs imports this same array back
// (it re-exports it too) rather than carrying its own independently-drifting copy. model.mjs's
// paletteGroup(p) still owns the RUNTIME default-by-name rule; this export is only the shape
// persist.js validates a stored `group` value against.
export const PALETTE_GROUPS = ["material", "brand", "system", "data"];

// DEFAULT_GROUP_BY_SLUG, the default-by-name group rule's table (ratified 2026-09-11): Neutral ->
// material; Primary/Secondary/Tertiary -> brand; Info/Success/Warning/Danger -> system; every other
// slug -> data. Declared HERE, same reasoning and same import-back shape as PALETTE_GROUPS above:
// the v8 group fold below (RENAME_MAPS `foldGroups`) needs it and persist.js must never import
// model.mjs, whose paletteGroup(p) imports this table back and still owns the RUNTIME rule.
// exports.js keeps its own engine-side twin (src/engine stays UI-import-free).
export const DEFAULT_GROUP_BY_SLUG = {
  neutral: "material",
  primary: "brand",
  secondary: "brand",
  tertiary: "brand",
  info: "system",
  success: "system",
  warning: "system",
  danger: "system",
};

// slug, palette name -> token namespace, identical to model.mjs's own slug (kept local for the same
// no-import-of-model.mjs reason as the table above).
function slug(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The persistence key, the exact slot the storage chain reads/writes (spec-draft §11).
// Renamed hct-palette-state-v1 -> nonoun-color-tokens -> ultimate-tokens (product renames);
// app.js#migrateStorageKeys walks the WHOLE chain forward so a returning user never loses work.
export const STORAGE_KEY = "ultimate-tokens";

// ── DOMAINS ────────────────────────────────────────────────────────────────────
// One descriptor per State field. Two kinds:
//   number : { kind:"number", min, max }    -> clamp into [min, max]; nearest bound.
//   enum   : { kind:"enum", values, default} -> keep if in `values`, else `default`.
// `on` is a boolean (coerced), `selected` is a relational integer bound (against
// palettes.length), and `palettes[i]` fields each get their own descriptor, all
// handled explicitly below since they aren't plain top-level scalars.
export const DOMAINS = {
  // top-level State
  curve: { kind: "enum", values: ["linear", "sine", "cubic", "logistic", "exp"], default: "logistic" },
  tension: { kind: "number", min: 0, max: 100 },
  // defaults so an ABSENT field hydrates to the sensible value, NOT the domain floor: a config that
  // omits these (e.g. a hand-authored or partial import) otherwise gets lmax 60 / lmin 0 / damp 0,
  // which caps the whole ramp dark. (Present in-domain values still round-trip exactly; ?? only fills null.)
  lmin: { kind: "number", min: 0, max: 40, default: 5 },
  lmax: { kind: "number", min: 60, max: 100, default: 100 },
  damp: { kind: "number", min: 0, max: 100, default: 80 },
  // differential damping curve, defaults reproduce the legacy edge damp, and a
  // doc that predates these fields hydrates to the default (not the floor).
  dampCurve: { kind: "number", min: 0.5, max: 4, default: 1.5 },
  dampAmp: { kind: "number", min: 0, max: 100, default: 0 },
  dampBias: { kind: "number", min: -100, max: 100, default: 0 },
  // baseIntensity: the GLOBAL Base chroma k factor (SPEC spec-muted-base-key-spikes 0.3.0, #785
  // REQ-002/007, #804), multiplied onto every palette's own `baseChroma` (the ramp damper, the at-100
  // ramp times baseChroma / 100 times this / 100). primeChroma: the GLOBAL Prime chroma k factor
  // (REQ-008/050..057, #804), scaling every palette's prime strip. Both default 100, so a fresh or
  // absent-field doc renders every ramp and strip as sampled. primeChroma was named keyIntensity
  // through schema v2; REQ-011/R4 renamed it at v3 (RENAME_MAPS below), DOMAINS no longer lists
  // keyIntensity at all, so a v3+ doc that still somehow carries it gets it loudly dropped. The FIELD
  // NAME `baseIntensity` is a deliberate legacy holdover (never renamed), REQ-010 keeps the document's
  // own field name stable; only its MEANING (now a k factor on every palette) and the engine's own
  // copy of the concept (fully retired, AC-004) changed. Before v8 neither value ever reached a palette
  // (every group carried its own), so the v8 fold below resets both to 100.
  baseIntensity: { kind: "number", min: 0, max: 100, default: 100 },
  primeChroma: { kind: "number", min: 0, max: 100, default: 100 },
  // Hue space (see tonal.js DEFAULT_CONTROLS.hueSpace). Default "oklch" (the slider value IS the OKLCH
  // hue). A doc PERSISTED with hueSpace:"cam16" round-trips as cam16 (legacy preserved); an absent field
  // hydrates to "oklch" (the new default). The legacy-storage stamp (app.js openSet) keeps a pre-hueSpace
  // STORED set rendering in cam16, only a brand-new/imported config without hueSpace adopts oklch here.
  hueSpace: { kind: "enum", values: ["cam16", "oklch"], default: "oklch" },
  // ramp distribution mode (see tonal.js DEFAULT_CONTROLS.toneMode). Default "perceptual".
  toneMode: { kind: "enum", values: ["even", "perceptual", "peak"], default: "perceptual" },
  // perceptual-path vibrancy: 0 = even lightness, 100 = cusp-anchored center (see tonal.js). Default 50
  // (T-0014, was 0); the v8 entry below moves a pre-v8 doc's 0 (the old default) to 50.
  vibrancy: { kind: "number", min: 0, max: 100, default: 50 },
  // on-color policy: "contrast" (WCAG-aware flip + achromatic fall-through, OD-001) | "fixed" (050
  // both modes, the pre-#662 default). Default contrast, this governs a STORED document that
  // carries no onColorMode key, so it must track tonal.js's DEFAULT_CONTROLS or a saved kit would
  // hydrate onto the other policy.
  onColorMode: { kind: "enum", values: ["fixed", "contrast"], default: "contrast" },
  // prime-accent ref: "mode" (550/450 per scheme) | "single" (500/500, mode-agnostic). Default mode.
  accentRef: { kind: "enum", values: ["mode", "single"], default: "mode" },
  // even-mode light/dark chroma floor, % of gamut (see tonal.js). Default on, so absent → 40 not 0.
  chromaFloor: { kind: "number", min: 0, max: 100, default: 40 },
  theme: { kind: "enum", values: ["auto", "light", "dark"], default: "auto" },
  // `selected` is an integer in [0, palettes.length-1], a relational bound, so its
  // upper limit depends on the hydrated palette count (see hydrate()).
  selected: { kind: "index" },
  // per-palette numeric fields; `name` is a free string (no domain), `on` is boolean.
  palette: {
    hue: { kind: "number", min: 0, max: 360 },
    chroma: { kind: "number", min: 0, max: 100 },
    skew: { kind: "number", min: -100, max: 100 },
    lift: { kind: "number", min: -40, max: 40 },
    hueShift: { kind: "number", min: -60, max: 60, default: 0 }, // edge hue rotation
    // Base chroma (#804), the palette's own ramp damper, 0..100: the at-100 ramp times baseChroma / 100
    // (times the global k, `baseIntensity`). OPTIONAL, absent means 100, same absent-stays-absent shape
    // as cuspPull; the v8 fold writes it from a pre-v8 doc's group value only when that is not 100.
    baseChroma: { kind: "number", min: 0, max: 100 },
    // canvas group (ticket #556), OPTIONAL, same absent-means-derive-on-read shape as
    // colorRole below: an explicit member of PALETTE_GROUPS round-trips as-is; absent/invalid
    // is left absent (NOT stamped with a computed default here), model.mjs's paletteGroup()
    // is the single place the default-by-name rule is computed, at every read site.
    group: { kind: "enum", values: PALETTE_GROUPS },
    // anchor / sourceAnchor (ticket #681, U1), a palette's stored SOURCE color, byte-for-byte, as
    // "#" + 6 hex digits in either case, normalized to the SAME canonical uppercase shape
    // scripts/gen-categories.mjs, defaultDocument() and src/engine/prime.mjs's own ANCHOR_HEX all
    // emit/accept (case-folding fixed per the U1 review's F3, 2026-09-18), never a number to clamp
    // toward a bound, so "kind: hex" is its own domain: a well-formed value normalizes, anything else
    // is DROPPED (like an unknown enum member). Both OPTIONAL, same absent-stays-absent shape as
    // `group` above. `anchor` is the LIVE anchor prime.mjs's `prime` step (and, from U2, the ramp's stop 500
    // at group 100, R94 damps it below) renders verbatim;
    // `sourceAnchor` is the GENERATOR's own copy, written only by scripts/gen-categories.mjs and by
    // defaultDocument(), never by the UI, so a Reset action (Q6, U2's C12) has something to
    // re-derive `anchor` from after a hue/chroma edit detaches it (U2 wires that detach/reset; this
    // file only carries the two fields through serialize/hydrate).
    anchor: { kind: "hex" },
    sourceAnchor: { kind: "hex" },
    // preDetachHue/Chroma/Lift (ticket #681, U2 re-diagnosis Finding 3 / review F7), a snapshot of
    // `hue`/`chroma`/`lift` taken at the MOMENT a Hue or Chroma edit detaches an anchored palette
    // (color.js's slider handlers, alongside the `delete anchor` that already happens there), so
    // Reset (resetAnchor, color.js) can restore the EXACT pre-detach state instead of RE-DERIVING a
    // new one via `seedFromKeyColor`, re-deriving is lossy (seedFromKeyColor reads the anchor's own
    // hue, not whatever `hue` the palette held before the edit) and does not round-trip the default
    // kit's hand-tuned `lift` (e.g. Warning's -36) at all, since it always resets lift to 0. Same
    // absent-stays-absent shape as `anchor`/`sourceAnchor`: only present on a palette that has been
    // detached at least once; a Reset clears all three back off (nothing left to restore once
    // restored) the same way it restores `anchor` and clears nothing else.
    preDetachHue: { kind: "number", min: 0, max: 360 },
    preDetachChroma: { kind: "number", min: 0, max: 100 },
    preDetachLift: { kind: "number", min: -40, max: 40 },
  },
};

// ── clamp helpers ────────────────────────────────────────────────────────────────

// Number clamp to the nearest valid bound. Returns the input UNCHANGED when it is
// already inside [min, max] (inclusive), that identity is invariant (1). NaN/non-finite
// or a non-number falls back to `min` (the field can't be left invalid).
function clampNumber(v, min, max) {
  if (typeof v !== "number" || !Number.isFinite(v)) return min;
  if (v < min) return min;       // below floor -> floor (e.g. lmax 45 -> 60)
  if (v > max) return max;       // above ceil  -> ceil  (e.g. tension 140 -> 100)
  return v;                      // in-domain (incl. fractional / on-the-bound) -> as-is
}

// Enum clamp: keep the value iff it's a member of the allowed set, else the documented
// default. An in-set value is returned by reference, so it is preserved exactly.
function clampEnum(v, values, dflt) {
  return values.includes(v) ? v : dflt;
}

// Hex clamp (ticket #681, U1; case-folding fixed per the U1 review's F3, 2026-09-18): keep the value
// iff it is "#" + 6 hex digits in EITHER case, normalized to the canonical uppercase form the
// generator, defaultDocument() and src/engine/prime.mjs's own ANCHOR_HEX all emit/accept, else
// undefined. The caller only attaches the field when this returns non-undefined, same absent-stays-
// absent shape every other optional palette field (cuspPull, baseChroma, group) uses. Lowercase was
// DROPPED before the fix: an authored Q5 spec JSON or a hand-edited import spelling a valid hex in
// lowercase rendered correctly for the live session (prime.mjs accepts+normalizes it) but silently
// lost the anchor on the next save/reload, with no DROPPED_KEYS report, persist.js and prime.mjs now
// agree on the same domain, a case-insensitive "#RRGGBB". Still not a "nearest bound" clamp, a
// malformed hex (wrong length, non-hex characters) has no well-defined nearest valid hex, so it is
// simply dropped rather than coerced, same as an unrecognized enum member.
const HEX6 = /^#[0-9A-Fa-f]{6}$/;
function clampHex(v) {
  return typeof v === "string" && HEX6.test(v) ? v.toUpperCase() : undefined;
}

// Per-palette clamp. Builds a fresh object so the result is a clean State, but copies
// each field through its own rule so an out-of-domain field is clamped ALONE and every
// in-domain sibling is preserved byte-for-byte (defeats the reset-whole-palette exploit).
// keyColors, RETAINED brand colors per palette, as EXPRESSIONS: `dominant` (the main
// brand color) and optional `supportive`. Stored as OKLCH [L 0..1, C ≥0, H 0..360],
// less lossy than an 8-bit hex source. One entry per role, dominant first; round-tripped
// so they survive serialize/hydrate.
function clampKeyColors(arr) {
  if (!Array.isArray(arr)) return [];
  const seen = new Set();
  const out = [];
  for (const k of arr) {
    if (!k || typeof k !== "object") continue;
    const role = k.role === "dominant" || k.role === "supportive" ? k.role : null;
    const o = k.oklch;
    if (!role || seen.has(role)) continue; // exactly one per role
    if (!Array.isArray(o) || o.length !== 3 || o.some((x) => typeof x !== "number" || !Number.isFinite(x))) continue;
    seen.add(role);
    out.push({
      role,
      oklch: [Math.min(1, Math.max(0, o[0])), Math.max(0, o[1]), ((o[2] % 360) + 360) % 360],
      ...(typeof k.name === "string" && k.name.trim() ? { name: k.name.trim() } : {}),
    });
  }
  out.sort((a, b) => (a.role === "dominant" ? 0 : 1) - (b.role === "dominant" ? 0 : 1)); // dominant first
  return out;
}

export function clampPalette(p) {
  const src = (p && typeof p === "object") ? p : {};
  const D = DOMAINS.palette;
  const out = {
    name: typeof src.name === "string" ? src.name : "",         // free string, kept as-is
    hue: clampNumber(src.hue, D.hue.min, D.hue.max),            // 0..360  (410 -> 360)
    chroma: clampNumber(src.chroma, D.chroma.min, D.chroma.max), // 0..100
    skew: clampNumber(src.skew, D.skew.min, D.skew.max),        // -100..100
    lift: clampNumber(src.lift, D.lift.min, D.lift.max),        // -40..40
    hueShift: clampNumber(src.hueShift ?? D.hueShift.default, D.hueShift.min, D.hueShift.max), // -60..60, absent -> 0
    hueSameDir: src.hueSameDir === true,                        // both-ends-same-direction flag (boolean)
    on: src.on === true,                                        // coerce to boolean
  };
  // keyColors is OPTIONAL, only attach when present so hydrate stays identity-preserving
  // (a palette without key colors must round-trip unchanged, not gain an empty array).
  const kc = clampKeyColors(src.keyColors);
  if (kc.length) out.keyColors = kc;
  // cuspPull (perceptual path) is OPTIONAL, a per-palette override of the global `vibrancy` (0..100):
  // how far this palette's richest stop is nudged toward stop 500. Absent → inherit the global vibrancy.
  if (Number.isFinite(src.cuspPull)) out.cuspPull = clampNumber(src.cuspPull, 0, 100);
  // intensity: REMOVED from the palette domain entirely (SPEC 0.3.0 REQ-002/010/011). A stray
  // `src.intensity` is simply never copied to `out` here; hydrate() reports it loudly via
  // DROPPED_KEYS (REQ-011) as part of the v4 migration.
  // baseChroma (#804) is OPTIONAL, the palette's own ramp damper (0..100), same absent-stays-absent
  // shape as cuspPull. Absent means 100. primeChroma is no longer a palette field (the v8 fold drops
  // and reports it); a stray one on a v8 snapshot is simply never copied to `out`.
  if (Number.isFinite(src.baseChroma)) out.baseChroma = clampNumber(src.baseChroma, D.baseChroma.min, D.baseChroma.max);
  // STORY (optional, from a curated preset): the source color's evocative name, a one-line
  // description, and its role in the set. Kept as-is iff present (free strings / known role).
  if (typeof src.colorName === "string" && src.colorName) out.colorName = src.colorName;
  if (typeof src.description === "string" && src.description) out.description = src.description;
  if (src.colorRole === "dominant" || src.colorRole === "supporting" || src.colorRole === "accent") out.colorRole = src.colorRole;
  // group (ticket #556) is OPTIONAL, a per-palette override of the canvas group it renders
  // under. Absent/invalid stays absent (round-trip preserved); the effective group for a
  // palette with none is computed on demand by model.mjs's paletteGroup(), never here.
  if (DOMAINS.palette.group.values.includes(src.group)) out.group = src.group;
  // anchor / sourceAnchor (ticket #681, U1), see DOMAINS.palette.anchor above. OPTIONAL, same
  // absent-stays-absent shape as `group`: a present, well-formed hex round-trips as-is; a malformed
  // one is dropped rather than clamped (clampHex has no "nearest valid hex" to fall back to).
  const anchor = clampHex(src.anchor);
  if (anchor) out.anchor = anchor;
  const sourceAnchor = clampHex(src.sourceAnchor);
  if (sourceAnchor) out.sourceAnchor = sourceAnchor;
  // preDetachHue/Chroma/Lift (ticket #681, U2 re-diagnosis Finding 3), see DOMAINS.palette above.
  // OPTIONAL, same absent-stays-absent shape: present only on a palette Reset can restore exactly.
  if (Number.isFinite(src.preDetachHue)) out.preDetachHue = clampNumber(src.preDetachHue, 0, 360);
  if (Number.isFinite(src.preDetachChroma)) out.preDetachChroma = clampNumber(src.preDetachChroma, 0, 100);
  if (Number.isFinite(src.preDetachLift)) out.preDetachLift = clampNumber(src.preDetachLift, -40, 40);
  return out;
}

// clampStory, the set-level concept narrative from a curated preset (optional). Free strings +
// a groups array of {hier,pct,note}; shape-clamped only. Returns null when nothing valid is present.
export function clampStory(s) {
  if (!s || typeof s !== "object") return null;
  const str = (x) => (typeof x === "string" && x.trim() ? x : undefined);
  const out = {};
  for (const k of ["title", "kicker", "narrative", "refuses"]) { const v = str(s[k]); if (v) out[k] = v; }
  if (Array.isArray(s.groups)) {
    const g = s.groups
      .filter((x) => x && (x.hier === "d" || x.hier === "s" || x.hier === "a"))
      .map((x) => ({ hier: x.hier, pct: typeof x.pct === "number" ? x.pct : 0, ...(str(x.note) ? { note: x.note } : {}) }));
    if (g.length) out.groups = g;
  }
  return Object.keys(out).length ? out : null;
}

// Per-doc semantic-mapping overrides: { [roleKey]: { light?, dark? } }, a role re-pointed to a
// different raw ref per mode (the canonical role table is the default; overrides layer on top).
// Shape-clamped ONLY (light/dark kept iff strings); ref VALIDITY is the consumer's concern
// (resolveRoleHex degrades an unknown ref gracefully), so persist stays dependency-free. An
// in-domain override map round-trips identically; absent -> {} (the backward-compatible default).
function clampOverrides(o) {
  if (!o || typeof o !== "object") return {};
  const out = {};
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (!v || typeof v !== "object") continue;
    const e = {};
    if (typeof v.light === "string") e.light = v.light;
    if (typeof v.dark === "string") e.dark = v.dark;
    if (Object.keys(e).length) out[k] = e;
  }
  return out;
}

// ── schemaVersion + rename maps (TKT-0016) ──────────────────────────────────────────────
// A canon RENAME (a voice, a treatment id, any field this file allowlists) that isn't also
// translated at hydrate time gets SILENTLY DROPPED by the allowlist clamp below, the 2026-07-13
// voice-taxonomy rename (Heading->Headline, UI->Label, Quote/Caption/Legal folded into Lead/Tiny/Body)
// is a live example: a doc saved before that rename still carries the OLD voice names in
// `type.voices`, and clampType's VOICES allowlist (only ever the NEW names) drops them on every
// hydrate since. This is the SAME "translate a legacy doc forward" principle as the hueSpace legacy
// stamp (app-helpers.mjs#hydrateStoredDoc: a doc predating hueSpace is stamped "cam16" BEFORE
// hydrate runs, so it keeps rendering as it always did), generalized here into a versioned,
// in-file mechanism instead of a one-field, one-off wrapper living outside persist.js.
//
// CURRENT_SCHEMA_VERSION is stamped onto every doc serialize() writes. hydrate() reads the incoming
// snapshot's schemaVersion (an ABSENT field means "before schemaVersion existed", i.e. 0, every doc
// saved before this ticket) and runs every RENAME_MAPS entry the doc predates, BEFORE the allowlist
// clamp, so a renamed field survives translated onto its current name instead of being dropped.
//
// STANDING CONVENTION, every future canon rename (see type-scale's SKILL.md "new voice group" note)
// MUST add its own RENAME_MAPS entry here and bump CURRENT_SCHEMA_VERSION, in the SAME change that
// renames it. This is not a one-off fix for the 2026-07-13 voices; it's how every rename ships from
// now on, the same way a Figma variable rename ships its FIGMA_MIGRATIONS entry (TKT-0012).
//
// v4 (SPEC spec-muted-base-key-spikes 0.3.0 REQ-011): palette.intensity retired, no RENAME_MAPS
// entry needed, since its drop+report (hydrate(), by the keyIntensity check above) already runs
// UNCONDITIONALLY, on every snapshot regardless of schemaVersion, the bump exists to stamp v4 forward
// on `serialize()`, not to gate a value translation the way v1/v2/v3 each needed to.
//
// v5 (ticket #681, U1): palette.anchor/sourceAnchor ADDED, same "no RENAME_MAPS entry needed" shape
// as v4, for the same reason: this is a brand-new optional field, not a rename, so there is no old
// name to translate FROM. A pre-v5 doc simply has neither field, which is already clampPalette's
// correct absent-stays-absent behavior with no version gate required. The bump exists only so
// `serialize()` stamps v5 forward (TKT-0016's standing convention: every schema-affecting change
// bumps CURRENT_SCHEMA_VERSION in the same change, whether or not it needs a translation entry).
//
// v6 (ticket #681, U2 re-diagnosis Finding 3): palette.preDetachHue/Chroma/Lift ADDED, same shape
// as v5, brand-new optional fields, no RENAME_MAPS entry needed. A pre-v6 doc simply has none of the
// three, which is already clampPalette's correct absent-stays-absent behavior.
//
// v7 (ticket #791): the Material naming preset's CSS root was renamed, so a kit saved on the old
// preset carries the old export prefix triple. A RENAME_MAPS entry (renameExportRoot) rewrites that
// exact triple once, for a doc stamped below v7; a v7 doc is never touched, so a kit that deliberately
// carries those names after the bump stays as typed.
//
// v8 (#804): the group chroma layer is removed. Each palette carries its own optional `baseChroma`
// and the two globals become k factors on every palette. A RENAME_MAPS entry (foldGroups) folds a
// pre-v8 doc's resolved group base chroma onto each palette, drops `paletteGroups` and every
// per-palette `primeChroma` (the one-time prime move is accepted), and resets both globals to 100
// (before v8 they never reached a palette), reporting each drop through DROPPED_KEYS. The same entry
// (vibrancyDefault, T-0014) moves a pre-v8 doc's global vibrancy 0, the old default, to the new 50.
//
// v9 (T-0017, #803): geometry adopts the Maison ui-kit ladder, `{ tier, scale, radius, spaceBase }`
// over 27 fixed cells. A RENAME_MAPS entry (migrateGeometry) maps a pre-v9 doc's treatment and base
// height to the nearest (tier, scale) by md-cell height, each mode's base height to a scale, and drops
// the retired keys (treatment, baseHeight, rampContrast, ramp, both per-cell height tokenOverrides
// maps and the UI-control/UI-widget type overrides on steps other than MD), reporting each through
// DROPPED_KEYS.
//
// v10 (#788, compute-layers, ADR-034): a document carries `layers: { [id]: version }`, the version of
// each compute layer it renders with. A RENAME_MAPS entry (stampLayers) stamps every registered layer
// id at version 1 on a doc stamped below v10 that has no `layers` map, BEFORE the clamp: such a doc
// was made with every layer at version 1, and the stamp is the explicit boundary, so every hydrated
// doc then serializes with `layers`. layer-pins.mjs's pinsOf then clamps each pin to [1, latest] and
// hydrate drops an id the registry does not name, reported through DROPPED_KEYS.
//
// v11 (T-0040, ADR-037): a document carries the boolean `matchPeerLightness` (Match peer lightness,
// read by the `ramp@2` layer only). An absent or non-true value reads false, the rendering every doc
// had before, so the RENAME_MAPS entry translates nothing; it marks the version that added the key.
export const CURRENT_SCHEMA_VERSION = 11;

// DROPPED_KEYS (TKT-0455), the loud-fail accounting channel. hydrate() attaches the report of every
// unknown voice/treatment/tokenOverrides key it dropped as a NON-ENUMERABLE property on its return
// value, keyed by this symbol, non-enumerable so it never leaks into JSON.stringify/serialize and
// never disturbs the roundtrip-identity gate, but reachable by a caller (or a test) that wants to
// assert something was actually dropped instead of silently vanishing. See hydrate() below.
export const DROPPED_KEYS = Symbol("persist.droppedKeys");

// Each entry applies to a doc whose schemaVersion is strictly LESS than `version` (an absent
// schemaVersion is 0, so every pre-schemaVersion doc qualifies for every entry). `renameVoices` is an
// old-name -> new-name map applied to BOTH voice-keyed facets: `type.voices` keys directly, AND the
// leading "<voice>|…" segment of `type.tokenOverrides` per-cell keys (clampTokenOverrides now ALSO
// validates the voice segment's membership in VOICES, TKT-0455, a stale-name tokenOverrides key that
// survives to that check is dropped loudly rather than surviving hydrate unchanged as an inert orphan;
// this rewrite, when it fires, is what keeps a doc within a covered rename OFF that path). Either side: the OLD key moves onto
// the NEW key, UNLESS the doc already ALSO has the new key (a doc could plausibly have picked up a
// fresh override under the new name after upgrading, that later, already-current value is presumed
// intentional and is never clobbered by the stale old-name entry).
const RENAME_MAPS = [
  {
    version: 1, // the 2026-07-13 voice-taxonomy rename, every doc saved before it has schemaVersion 0/absent
    renameVoices: { Heading: "Headline", UI: "Label", Quote: "Lead", Caption: "Tiny", Legal: "Body" },
  },
  {
    // the intensity-controls schema bump (SPEC spec-muted-base-key-spikes REQ-011, EX-6): a doc saved
    // before baseIntensity/keyIntensity existed stamps baseIntensity: 100 (its pre-feature look) BEFORE
    // the domain clamp, so a later default flip (the 45 muted-default follow-up) can never change how an
    // already-saved kit renders. A v2+ doc with the field absent hydrates to the domain default instead
    // (also 100 today), this stamp only fires for a doc that PREDATES the field existing at all.
    version: 2,
    stampIntensity: true,
  },
  {
    // the keyIntensity -> primeChroma rename (SPEC spec-muted-base-key-spikes REQ-011, R4, EX-9): the
    // retired ramp-spike control's persisted field now carries the prime system's own chroma control
    // under its real name. Value carried onto primeChroma; the old key dropped; a doc that ALREADY
    // carries primeChroma (e.g. one that picked up a fresh value mid-upgrade) is never clobbered by the
    // stale keyIntensity, the same never-clobber shape renameKeyedMap already applies to renameVoices.
    version: 3,
    renameControls: { keyIntensity: "primeChroma" },
  },
  {
    // the Material preset's export root rename (#791): the OLD preset triple (all three prefixes, exact)
    // becomes the new one. A lone old colour prefix beside any other type or geometry prefix is not the
    // preset, so it stays as typed. Only a doc stamped below v7 is rewritten, so this runs once.
    version: 7,
    renameExportRoot: {
      from: { colorPrefix: "md-sys-color", typePrefix: "md-sys-typescale", geomPrefix: "md-sys" },
      to: { colorPrefix: "md-color", typePrefix: "md-typescale", geomPrefix: "md" },
    },
  },
  {
    // the group chroma layer's removal (#804): see foldGroups in applyRenameMaps below. The literal
    // `paletteGroups` lives on only here, as the pre-v8 key this entry reads and drops.
    // vibrancyDefault (T-0014): a saved vibrancy 0 cannot be told apart from the old default, so it
    // becomes the new default 50; any other value is kept, an absent one takes the domain default (50),
    // and a palette's own `cuspPull` is never touched.
    version: 8,
    foldGroups: true,
    vibrancyDefault: { from: 0, to: 50 },
  },
  {
    // the Maison ladder (T-0017, #803): see migrateGeometry in applyRenameMaps below. The literals
    // `treatment`, `baseHeight`, `rampContrast` and `ramp` live on only there, as the pre-v9 keys this
    // entry reads and drops.
    version: 9,
    migrateGeometry: true,
  },
  {
    // the compute-layer pins (#788, ADR-034): a doc that predates `layers` is stamped with every
    // registered layer id at version 1, the version it was made with. Shaped like v2's
    // stampIntensity: it fires only when the doc carries no `layers` map at all.
    version: 10,
    stampLayers: true,
  },
  {
    // Match peer lightness (T-0040, ADR-037): the `matchPeerLightness` flag. An absent key reads false
    // (hydrate below), which is how every earlier doc renders, so nothing is translated.
    version: 11,
  },
];

// foldGroups(s, drop), the v8 entry: (a) every palette without a numeric `baseChroma` takes its
// group's stored base chroma (its valid `group`, else the default-by-name rule, else data), clamped
// 0..100, written only when it is not 100, so the same number reaches tonal.js `dampStops` as
// before; the global `baseIntensity` is never folded in (it never reached a palette before v8).
// (b) `paletteGroups` and every per-palette `primeChroma` are deleted. (c) both globals are reset to
// 100. Each drop and each reset of a value other than 100 is reported through `drop`.
function foldGroups(s, drop) {
  const groups = s.paletteGroups && typeof s.paletteGroups === "object" ? s.paletteGroups : {};
  const groupBase = (g) => {
    const v = groups[g] && typeof groups[g] === "object" ? groups[g].baseChroma : undefined;
    return typeof v === "number" && Number.isFinite(v) ? clampNumber(v, 0, 100) : 100;
  };
  const out = { ...s };
  if (Array.isArray(s.palettes)) {
    out.palettes = s.palettes.map((p) => {
      if (!p || typeof p !== "object") return p;
      const { primeChroma, ...rest } = p;
      if (primeChroma !== undefined) drop("palette", `${p.name || "?"}.primeChroma`, "removed at schema v8, Prime chroma is one global k factor on every palette (#804)");
      if (typeof p.baseChroma !== "number") {
        const g = PALETTE_GROUPS.includes(p.group) ? p.group : DEFAULT_GROUP_BY_SLUG[slug(p.name)] || "data";
        const base = groupBase(g);
        if (base !== 100) rest.baseChroma = base;
      }
      return rest;
    });
  }
  if (s.paletteGroups !== undefined) {
    delete out.paletteGroups;
    drop("controls", "paletteGroups", "removed at schema v8, each group's base chroma folded onto its palettes' own baseChroma (#804)");
  }
  for (const key of ["baseIntensity", "primeChroma"]) {
    if (s[key] !== undefined && s[key] !== 100) drop("controls", key, `reset to 100 at schema v8, it is now a k factor on every palette and its pre-v8 value never reached one (#804)`);
    out[key] = 100;
  }
  return out;
}

// LEGACY_TREATMENT_GEOMETRY, the migration-only copy of the five pre-v9 geometry treatments: each one's
// own MD control height, its radiusStyle on the Maison radius modes (sharp to sharp, soft to default,
// round to round, pill to pill) and its spacing base. Read only by migrateGeometry.
const LEGACY_TREATMENT_GEOMETRY = {
  comfortable: { height: 28, radius: "default", spaceBase: 4 },
  compact: { height: 24, radius: "sharp", spaceBase: 4 },
  spacious: { height: 32, radius: "round", spaceBase: 8 },
  touch: { height: 36, radius: "default", spaceBase: 8 },
  pill: { height: 28, radius: "pill", spaceBase: 4 },
};
// LEGACY_MD_CELLS, every (tier, scale) with its md-cell height at v9, in tie-break order (product >
// content > micro, then md > sm > lg), so a strict nearest-height scan keeps the first of a tie.
const LEGACY_MD_CELLS = [
  ["product", "md", 32], ["product", "sm", 28], ["product", "lg", 36],
  ["content", "md", 48], ["content", "sm", 36], ["content", "lg", 64],
  ["micro", "md", 16], ["micro", "sm", 14], ["micro", "lg", 18],
];
const nearestMdCell = (h, tier) => {
  let best = null;
  for (const c of LEGACY_MD_CELLS) if ((!tier || c[0] === tier) && (!best || Math.abs(c[2] - h) < Math.abs(best[2] - h))) best = c;
  return best;
};

// migrateGeometry(s, drop), the v9 entry: (a) a geometry carrying `treatment` or `baseHeight` takes the
// (tier, scale) whose md cell is nearest its legacy MD height (`baseHeight` as the pre-v9 clamp read it,
// 20..48, else the treatment's own; an absent or unknown treatment reads comfortable, the old default),
// with the treatment's radius mode and spaceBase. (b) Each mode's `baseHeight` becomes the nearest
// `scale` within that tier (a legacy mode without one read 28 before v9). (c) `treatment`, `baseHeight`,
// `rampContrast`, `ramp`, every geometry `tokenOverrides` key, and every type `tokenOverrides` key on a
// UI-control/UI-widget step other than MD are deleted. Each removal is reported through `drop`.
function migrateGeometry(s, drop) {
  const retired = "removed at schema v9, geometry is the Maison ladder: tier, scale, radius, spaceBase (T-0017)";
  const out = { ...s };
  if (s.geometry && typeof s.geometry === "object") {
    const g = { ...s.geometry };
    const legacy = g.treatment !== undefined || g.baseHeight !== undefined;
    const legacyHeight = (v) => { const n = Number(v); return v != null && Number.isFinite(n) ? Math.max(20, Math.min(48, Math.round(n))) : null; };
    const known = Object.prototype.hasOwnProperty.call(LEGACY_TREATMENT_GEOMETRY, g.treatment);
    if (legacy) {
      const t = LEGACY_TREATMENT_GEOMETRY[known ? g.treatment : "comfortable"];
      const [tier, scale] = nearestMdCell(legacyHeight(g.baseHeight) ?? t.height);
      Object.assign(g, { tier, scale, radius: t.radius, spaceBase: t.spaceBase });
    }
    const tier = LEGACY_MD_CELLS.some((c) => c[0] === g.tier) ? g.tier : "product";
    if (Array.isArray(g.modes)) {
      g.modes = g.modes.map((m) => {
        if (!m || typeof m !== "object") return m;
        const { baseHeight, rampContrast, ...rest } = m;
        if (baseHeight !== undefined || (legacy && rest.scale === undefined)) rest.scale = nearestMdCell(legacyHeight(baseHeight) ?? 28, tier)[1];
        if (baseHeight !== undefined) drop("geometry.modes", `${m.id}.baseHeight`, `migrated to scale ${rest.scale} at schema v9 (T-0017)`);
        if (rampContrast !== undefined) drop("geometry.modes", `${m.id}.rampContrast`, retired);
        return rest;
      });
    }
    for (const k of ["treatment", "baseHeight", "rampContrast", "ramp"]) {
      if (g[k] === undefined) continue;
      const why = k === "treatment" && !known ? `unknown treatment id, read as comfortable and migrated to ${g.tier}/${g.scale} at schema v9 (T-0017)`
        : k === "treatment" || k === "baseHeight" ? `migrated to ${g.tier}/${g.scale} at schema v9 (T-0017)` : retired;
      drop("geometry", k, why);
      delete g[k];
    }
    if (g.tokenOverrides !== undefined) {
      if (g.tokenOverrides && typeof g.tokenOverrides === "object") for (const k of Object.keys(g.tokenOverrides)) drop("geometry.tokenOverrides", k, `${retired}, a per-cell height override lands off the ladder`);
      delete g.tokenOverrides;
    }
    out.geometry = g;
  }
  const tov = s.type && typeof s.type === "object" ? s.type.tokenOverrides : null;
  if (tov && typeof tov === "object") {
    const kept = {};
    let changed = false;
    for (const k of Object.keys(tov)) {
      const [voice, step] = k.split("|");
      if ((voice === "UI-control" || voice === "UI-widget") && step !== "MD") {
        drop("type.tokenOverrides", k, "removed at schema v9, UI-control and UI-widget carry one step (MD), sized from the ladder's UI text (T-0017)");
        changed = true;
      } else kept[k] = tov[k];
    }
    if (changed) out.type = { ...s.type, tokenOverrides: kept };
  }
  return out;
}

// renameKeyedMap(obj, renameMap, rewriteKey), generic old->new key migration for a plain map: for every
// key whose (renameKeyed-computed) old identity is in `renameMap`, move its value onto `rewriteKey`'s
// new-identity key, UNLESS that new key already exists (never clobber an already-current value). Returns
// the SAME object reference when nothing changes (so a current doc isn't defensively cloned for nothing).
function renameKeyedMap(obj, renameMap, rewriteKey) {
  if (!obj || typeof obj !== "object") return obj;
  const out = { ...obj };
  let changed = false;
  for (const key of Object.keys(obj)) {
    const newKey = rewriteKey(key, renameMap);
    if (newKey && newKey !== key) {
      if (!(newKey in out)) out[newKey] = out[key];
      delete out[key];
      changed = true;
    }
  }
  return changed ? out : obj;
}

// applyRenameMaps, walk every RENAME_MAPS entry the incoming snapshot predates and translate its
// voice-keyed facets forward (`type.voices` keys + `type.tokenOverrides`' leading voice segment). Runs
// BEFORE any allowlist clamp (see hydrate() below). Pure: returns a new snapshot when a rename actually
// fires, the SAME snapshot reference otherwise (so a current doc pays no cost). `drop` is hydrate()'s
// DROPPED_KEYS reporter, for an entry (foldGroups) that removes a value rather than renaming it.
// `latest` is hydrate's { [id]: latest version } table, the ids the v10 stamp writes.
function applyRenameMaps(snapshot, drop, latest) {
  const fromVersion = Number.isFinite(snapshot && snapshot.schemaVersion) ? snapshot.schemaVersion : 0;
  if (fromVersion >= CURRENT_SCHEMA_VERSION) return snapshot; // already current, nothing to translate
  let s = snapshot;
  for (const entry of RENAME_MAPS) {
    if (fromVersion >= entry.version) continue; // this doc is already past this particular rename
    if (entry.renameVoices && s && s.type && typeof s.type === "object") {
      let type = s.type;
      const voices = renameKeyedMap(type.voices, entry.renameVoices, (k, m) => m[k]);
      if (voices !== type.voices) type = { ...type, voices };
      // type keys are "<voice>|<step>|<modeKey>" (3 segments), rename only the leading segment.
      const tov = renameKeyedMap(type.tokenOverrides, entry.renameVoices, (k, m) => {
        const seg = k.split("|");
        if (seg.length !== 3 || !m[seg[0]]) return null;
        return [m[seg[0]], seg[1], seg[2]].join("|");
      });
      if (tov !== type.tokenOverrides) type = { ...type, tokenOverrides: tov };
      if (type !== s.type) s = { ...s, type };
    }
    if (entry.stampIntensity && s && typeof s.baseIntensity !== "number") {
      s = { ...s, baseIntensity: 100 };
    }
    if (entry.stampLayers && s && typeof s === "object" && !(s.layers && typeof s.layers === "object")) {
      s = { ...s, layers: Object.fromEntries(Object.keys(latest).map((id) => [id, 1])) };
    }
    // renameControls: an old top-level control name -> new name, carrying the value across (never
    // clobbering an already-present new-name value), the REQ-011/R4 keyIntensity->primeChroma rename.
    if (entry.renameControls && s && typeof s === "object") {
      for (const oldKey of Object.keys(entry.renameControls)) {
        if (!(oldKey in s)) continue;
        const newKey = entry.renameControls[oldKey];
        const { [oldKey]: oldVal, ...rest } = s;
        s = newKey in rest ? rest : { ...rest, [newKey]: oldVal };
      }
    }
    // renameExportRoot: the exact old export prefix triple -> the new one (all three must match).
    if (entry.renameExportRoot && s && s.export && typeof s.export === "object") {
      const { from, to } = entry.renameExportRoot;
      if (Object.keys(from).every((k) => s.export[k] === from[k])) s = { ...s, export: { ...s.export, ...to } };
    }
    if (entry.foldGroups && s && typeof s === "object") s = foldGroups(s, drop);
    if (entry.migrateGeometry && s && typeof s === "object") s = migrateGeometry(s, drop);
    if (entry.vibrancyDefault && s && s.vibrancy === entry.vibrancyDefault.from) s = { ...s, vibrancy: entry.vibrancyDefault.to };
  }
  return s;
}

// ── serialize ─────────────────────────────────────────────────────────────────────
// Produce a plain JSON-able snapshot of `state`. This is a faithful copy (no lossy
// transform, no rounding, no reordering of palette contents), so that for an in-domain
// State the snapshot carries every value unchanged and hydrate can reproduce it exactly.
// JSON.parse(JSON.stringify(...)) gives a deep, plain, structurally-identical clone. schemaVersion is
// stamped on top (TKT-0016), it's a bookkeeping field for hydrate()'s rename maps, not part of the
// runtime State, so hydrate() reads and then drops it (never appears in hydrate's return value).
export function serialize(state) {
  return { ...JSON.parse(JSON.stringify(state)), schemaVersion: CURRENT_SCHEMA_VERSION };
}

// ── hydrate ─────────────────────────────────────────────────────────────────────
// Turn an (untrusted) snapshot into a valid State with every field clamped to its
// DOMAIN. Identity-preserving: an already-in-domain field is copied through untouched;
// only a violated field is moved to its nearest valid bound. NOT a clamp-to-default and
// NOT a reset, those discard user state and fail the sealed roundtrip/per-field gates.
// `latest` (optional, #788): the registry's { [id]: latest version }, the domain of the `layers`
// pins; a test passes its own registry's (test/engine/layer-pins.mjs), every product caller takes
// the shipped LATEST.
export function hydrate(snapshot, { latest = LATEST } = {}) {
  const raw = (snapshot && typeof snapshot === "object") ? snapshot : {};

  // The loud-fail accounting list (TKT-0455), every unknown voice/treatment/tokenOverrides key this
  // hydrate() call drops, past whatever applyRenameMaps already translated, plus every value the v8
  // group fold removes. `drop()` both records the entry and warns immediately, so a future rename
  // shipped without its RENAME_MAPS entry is loud on the very first hydrate that hits it, not a
  // silent, permanent data-loss.
  const dropped = [];
  const drop = (facet, key, reason) => {
    dropped.push({ facet, key, reason });
    if (typeof console !== "undefined") console.warn(`[persist] dropped unknown ${facet} key ${JSON.stringify(key)} (${reason}), stored state for it is gone`);
  };

  // TKT-0016, translate an older doc forward through any still-relevant rename maps BEFORE the
  // allowlist clamp below runs, so a renamed voice survives onto its current name instead of being
  // silently dropped by clampType's VOICES allowlist.
  const s = applyRenameMaps(raw, drop, latest);

  // Palettes first: `selected`'s upper bound is relational to the hydrated count.
  const rawPalettes = Array.isArray(s.palettes) ? s.palettes : [];
  const palettes = rawPalettes.map(clampPalette);

  // `selected` is an integer in [0, palettes.length-1]. With no palettes the only
  // valid index is 0 (max(0, length-1) keeps the lower bound from inverting). An
  // in-range index (incl. exactly length-1) is preserved; 9 with 2 palettes -> 1.
  const maxIndex = Math.max(0, palettes.length - 1);
  let selected = s.selected;
  if (typeof selected !== "number" || !Number.isFinite(selected)) selected = 0;
  else if (selected < 0) selected = 0;
  else if (selected > maxIndex) selected = maxIndex;
  // (no rounding of an in-range integer: an in-domain integer stays byte-for-byte)

  // optional curated metadata, the set's concept story + its travel volume (both opt-in, so a
  // hand-built doc round-trips unchanged).
  const story = clampStory(s.story);

  // keyIntensity (REQ-011, TKT-0455): DOMAINS no longer lists it, applyRenameMaps already carries it
  // onto primeChroma for any doc that predates the v3 rename, so a bare keyIntensity surviving to here
  // can only belong to a doc whose schemaVersion already claims v3+ (the rename was skipped). That's a
  // stray leftover, not a legacy doc, report it loudly instead of letting the allowlist silently drop it.
  if (typeof s.keyIntensity === "number") drop("controls", "keyIntensity", "renamed to primeChroma at schema v3; a v3+ snapshot should never carry it");

  // palette.intensity (SPEC spec-muted-base-key-spikes 0.3.0 REQ-002/010/011, TKT-0455): removed
  // from the palette domain at schema v4, there is no per-palette ramp override in any group any
  // more (the group's OWN baseChroma is the only ramp-chroma resolution left). clampPalette already
  // never copies it to `out`; report each one loudly here, unconditionally (same shape as the
  // keyIntensity check above, a stray leftover on ANY snapshot, not just one that predates v4, is
  // worth surfacing), instead of letting the allowlist silently drop it.
  for (const rp of rawPalettes) {
    if (rp && typeof rp === "object" && Number.isFinite(rp.intensity)) {
      drop("palette", `${rp.name || "?"}.intensity`, "removed at schema v4, there is no per-palette ramp override in any group (REQ-002)");
    }
  }

  // layers (#788, ADR-034): one pin per registered layer, layer-pins.mjs's rule (rounded and clamped
  // to [1, latest]; a pre-v10 doc arrives here already stamped by the v10 entry). An id the registry
  // does not name is dropped, loudly.
  if (s.layers && typeof s.layers === "object") {
    for (const id of Object.keys(s.layers)) if (!(id in latest)) drop("layers", id, "not a registered compute layer");
  }

  const result = {
    curve: clampEnum(s.curve, DOMAINS.curve.values, DOMAINS.curve.default),
    tension: clampNumber(s.tension, DOMAINS.tension.min, DOMAINS.tension.max),
    lmin: clampNumber(s.lmin ?? DOMAINS.lmin.default, DOMAINS.lmin.min, DOMAINS.lmin.max),
    lmax: clampNumber(s.lmax ?? DOMAINS.lmax.default, DOMAINS.lmax.min, DOMAINS.lmax.max),
    damp: clampNumber(s.damp ?? DOMAINS.damp.default, DOMAINS.damp.min, DOMAINS.damp.max),
    dampCurve: clampNumber(s.dampCurve ?? DOMAINS.dampCurve.default, DOMAINS.dampCurve.min, DOMAINS.dampCurve.max),
    dampAmp: clampNumber(s.dampAmp ?? DOMAINS.dampAmp.default, DOMAINS.dampAmp.min, DOMAINS.dampAmp.max),
    dampBias: clampNumber(s.dampBias ?? DOMAINS.dampBias.default, DOMAINS.dampBias.min, DOMAINS.dampBias.max),
    baseIntensity: clampNumber(s.baseIntensity ?? DOMAINS.baseIntensity.default, DOMAINS.baseIntensity.min, DOMAINS.baseIntensity.max),
    primeChroma: clampNumber(s.primeChroma ?? DOMAINS.primeChroma.default, DOMAINS.primeChroma.min, DOMAINS.primeChroma.max),
    hueSpace: clampEnum(s.hueSpace, DOMAINS.hueSpace.values, DOMAINS.hueSpace.default),
    relChroma: s.relChroma === true, // boolean chroma-basis flag; absent/non-true -> false (legacy default)
    matchPeerLightness: s.matchPeerLightness === true, // Match peer lightness (v11, ramp@2 only); absent/non-true -> false
    chromaFloor: clampNumber(s.chromaFloor ?? DOMAINS.chromaFloor.default, DOMAINS.chromaFloor.min, DOMAINS.chromaFloor.max),
    toneMode: clampEnum(s.toneMode, DOMAINS.toneMode.values, DOMAINS.toneMode.default),
    vibrancy: clampNumber(s.vibrancy ?? DOMAINS.vibrancy.default, DOMAINS.vibrancy.min, DOMAINS.vibrancy.max),
    onColorMode: clampEnum(s.onColorMode, DOMAINS.onColorMode.values, DOMAINS.onColorMode.default),
    accentRef: clampEnum(s.accentRef, DOMAINS.accentRef.values, DOMAINS.accentRef.default),
    theme: clampEnum(s.theme, DOMAINS.theme.values, DOMAINS.theme.default),
    selected,
    roleOverrides: clampOverrides(s.roleOverrides),
    layers: pinsOf(s.layers, latest),
    type: clampType(s.type, drop),
    geometry: clampGeometry(s.geometry, drop),
    palettes,
    ...clampExport(s.export),
    ...clampIcons(s.icons),
    ...clampFigmaCollections(s.figmaCollections),
    ...(typeof s.vol === "string" && s.vol ? { vol: s.vol } : {}),
    ...(story ? { story } : {}),
  };
  // Non-enumerable: never serialized, never disturbs deepEq/roundtrip, see DROPPED_KEYS above.
  Object.defineProperty(result, DROPPED_KEYS, { value: dropped, enumerable: false });
  return result;
}

// presetDoc(preset, { latest }), a curated preset opened as a new document (#788, ADR-034): hydrated
// like any stored document (a preset carries no schemaVersion, so the v10 stamp pins it to version 1),
// then `layers` overwritten by every layer's latest version, because opening a preset makes a document
// now, with the layers that ship now (R100). It lives here, not in src/engine/layers.mjs, because
// src/engine never imports from src/ui. `layers` is assigned onto the hydrate result so its
// non-enumerable DROPPED_KEYS report survives.
export function presetDoc(preset, { latest = LATEST } = {}) {
  const doc = hydrate(preset, { latest });
  doc.layers = { ...latest };
  return doc;
}

// clampIcons, the OPTIONAL icon-system facet { id, variant?, name?, variantName? } (Settings › Icons).
// A BRAND decision like a font family: the kit names the library + its stroke/fill variant so a consuming
// agent binds to it. Identity-gated like every other optional block: the DEFAULT system at its DEFAULT
// variant round-trips as ABSENT (so an untouched kit's config is byte-identical), and an unknown id drops
// the whole block. `custom` keeps the user's typed name/variantName verbatim (trimmed + capped).
// clampFigmaCollections, per-doc overrides for the two Figma color-collection names (Settings ›
// Token mapping). OPTIONAL, like icons: only non-empty, non-default names attach, so a config with
// the standard names round-trips identically (the hydrate identity gate).
function clampFigmaCollections(fc) {
  if (!fc || typeof fc !== "object") return {};
  const pick = (v, dflt) => {
    const s = typeof v === "string" ? v.trim().slice(0, 60) : "";
    return s && s !== dflt ? s : "";
  };
  const raw = pick(fc.raw, COLLECTIONS.colorRaw);
  const semantic = pick(fc.semantic, COLLECTIONS.colorSemantic); // #491 (was "Color Semantic", "Color Modes")
  if (!raw && !semantic) return {};
  return { figmaCollections: { ...(raw ? { raw } : {}), ...(semantic ? { semantic } : {}) } };
}
function clampIcons(ic) {
  if (!ic || typeof ic !== "object") return {};
  const sys = ICON_SYSTEMS.find((x) => x.id === ic.id);
  if (!sys) return {};
  if (sys.id === "custom") {
    const name = typeof ic.name === "string" ? ic.name.trim().slice(0, 60) : "";
    const variantName = typeof ic.variantName === "string" ? ic.variantName.trim().slice(0, 40) : "";
    if (!name) return {}; // a custom system with no name carries nothing, drop it
    return { icons: { id: "custom", name, ...(variantName ? { variantName } : {}) } };
  }
  const variant = sys.variants.includes(ic.variant) ? ic.variant : sys.defaultVariant;
  // the default system at its default variant is the ABSENT state (identity gate)
  if (sys.id === DEFAULT_ICON_SYSTEM && variant === sys.defaultVariant) return {};
  return { icons: { id: sys.id, ...(variant ? { variant } : {}) } };
}

// clampExport, the OPTIONAL export-format prefs { unit?, colorPrefix?, typePrefix?, geomPrefix? }
// (Settings › Export: CSS unit + the naming-scheme prefixes). Each key attaches only when valid, and the
// whole `export` only when ≥1 valid key, so the hydrate identity gate holds (absent stays absent; invalid
// keys drop; an all-invalid object drops). (The old `colorFormat` pref was removed, Download-All now
// always emits BOTH css-hex/ and css-oklch/, so there is nothing to choose.)
function clampExport(e) {
  if (!e || typeof e !== "object") return {};
  const unit = clampEnum(e.unit, ["px", "rem", "em"], null);
  // colorPrefix, the CSS custom-property prefix core (the `c` in `--c-*`). OPTIONAL: attach only a
  // sanitized non-empty value that ISN'T the default "c" (so the default round-trips as absent, the
  // identity gate). Sanitized to a legal ident core; capped; a bare/edge-hyphen/all-junk value drops.
  // The naming-scheme prefixes (colour · type · geometry). Each: sanitized to a legal ident core,
  // attached only when non-empty AND not the system's DEFAULT (so a default round-trips as absent,
  // the identity gate). Defaults: colour "c", type "type", geometry "" (native).
  const clean = (s, repair) => typeof s === "string" ? s.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").replace(/^(\d)/, repair + "$1").slice(0, 40) : "";
  const cp = clean(e.colorPrefix, "c"), tp = clean(e.typePrefix, "t"), gp = clean(e.geomPrefix, "g");
  const colorPrefix = cp && cp !== "c" ? cp : null;
  const typePrefix = tp && tp !== "type" ? tp : null;
  const geomPrefix = gp || null;
  const out = { ...(unit ? { unit } : {}), ...(colorPrefix ? { colorPrefix } : {}), ...(typePrefix ? { typePrefix } : {}), ...(geomPrefix ? { geomPrefix } : {}) };
  return Object.keys(out).length ? { export: out } : {};
}

// a breakpoint mode's @media min-width (px), OPTIONAL: {} when absent/invalid (no media query), or
// { minWidth } when a positive width is set. Keeps the hydrate identity gate (absent stays absent).
const clampMinWidth = (v) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? { minWidth: Math.max(1, Math.min(3840, Math.round(n))) } : {}; };

// clampTokenOverrides, the per-cell SIZE/HEIGHT override map (Phase 3 of the Tokens matrix), flat
// `{ "<voice>|<step>|<modeKey>": <number> }` for type (geometry's `<size>|<modeKey>` map retired at v9). Each
// value is a positive number clamped into [min, max]; non-numeric / non-finite / ≤0 entries are DROPPED
// (an invalid cell is simply not overridden). MALFORMED keys are dropped too: the key must split into
// exactly `parts` "|"-segments (3 for type "<voice>|<step>|<modeKey>", 2 for geom "<size>|<modeKey>") with a
// non-empty modeKey (the last segment), defensive, so a corrupt persisted map can't smuggle junk forward.
// Returns {} when nothing valid is present so the consumer only attaches when non-empty, keeping the
// hydrate identity gate (absent stays absent, like roleOverrides).
//
// `validLead` (TKT-0455), the leading segment (the voice for type, the size for geom) is now checked
// against the engine's own domain, not just its arity: a key whose voice/size is retired, typo'd, or
// simply never existed used to survive every hydrate forever as an inert orphan (persist.js's own
// comment above documented this as a KNOWN gap, see the RENAME_MAPS block). It's dropped here instead,
// loudly, via `drop(key, reason)`, the same accounting hydrate() surfaces for unknown voices/treatments.
function clampTokenOverrides(o, min, max, parts, validLead, drop) {
  if (!o || typeof o !== "object") return {};
  const out = {};
  for (const k of Object.keys(o)) {
    const seg = k.split("|");
    if (parts && (seg.length !== parts || !seg[seg.length - 1])) continue; // drop malformed (wrong arity / empty modeKey), silent, pre-existing
    if (validLead && !validLead.includes(seg[0])) { drop(k, `unknown leading segment "${seg[0]}"`); continue; }
    const n = Number(o[k]);
    if (!Number.isFinite(n) || n <= 0) continue;          // drop invalid (NaN / non-number / non-positive)
    out[k] = Math.round(Math.min(max, Math.max(min, n))); // clamp into range; integer px
  }
  return out;
}

// clampType, the typography config (treatment + body base). Treatment to a known id, base size to a
// sane integer range. Identity-preserving for an in-domain value (so the roundtrip gate holds).
// Exported (with VOICES below and the GEOMETRY_* axis lists further down) so test/ui/persist.mjs can assert
// these hand-tracked allowlists stay in lockstep with their engine sources, type.mjs's TYPE_TREATMENTS
// ids / the 15 voice names in a treatment's `categories` / geometry.mjs's TIERS, SCALES, SIZES and
// RADIUS_MODES ids (TKT-0017: the same parity-gate failure class the role-table gate already guards elsewhere, generalized
// here, nothing else in this file consumes these engine modules, so it's a hand-tracked copy, not an import).
export const TYPE_TREATMENTS = ["product", "luxury", "editorial", "technical", "statement"];
// The 15 named type VOICES (docs/reference/typography), MUST track makeVoices in type.mjs. A voice
// renamed/added/removed there and not here has its per-voice overrides SILENTLY DROPPED on hydrate
// (2026-07-13's voice renames were a live example of exactly this, see the rename-map note in hydrate()
// below, TKT-0016, which fixes the hydrate-drop for a RENAME; this allowlist itself still needs its own
// hand update whenever the voice set changes, which is what the allowlist-parity test gate below guards).
export const VOICES = ["Display", "Headline", "Sub-heading", "Title", "Sub-title", "Lead", "Body", "Body-mono", "Label", "Label-mono", "Kicker", "Tiny", "Tiny-mono", "UI-control", "UI-widget"];
function clampType(t, drop) {
  t = (t && typeof t === "object") ? t : {};
  // TKT-0455, a NON-empty, out-of-allowlist treatment (as opposed to an absent field, the normal
  // "doc predates this field" case) is a real unknown value: surface it instead of the silent fallback.
  if (t.treatment != null && !TYPE_TREATMENTS.includes(t.treatment)) drop("type.treatment", t.treatment, "unknown treatment id");
  const treatment = TYPE_TREATMENTS.includes(t.treatment) ? t.treatment : "product";
  // the invalid-value fallback reads DEFAULT_TYPE.bodyBase (never a hardcoded literal here), it must
  // track Body's own fixed MD size (SIZES.Body[1] in type.mjs), or an absent bodyBase silently SCALES
  // the whole fixed table instead of leaving it at its unscaled identity (found live: a stale hardcoded
  // "15" here kept resolving documents to a 6.25%-shrunk scale after Body's own base moved to 16).
  const clampBody = (v) => { const n = Number(v); return Math.max(10, Math.min(32, Number.isFinite(n) ? Math.round(n) : DEFAULT_TYPE.bodyBase)); };
  const bodyBase = clampBody(t.bodyBase);
  const out = { treatment, bodyBase };
  // tokenOverrides (Phase 3), per-cell size overrides. OPTIONAL: only attach when non-empty so a config
  // without overrides round-trips identically. Type sizes clamp into [1, 512] px.
  const tov = clampTokenOverrides(t.tokenOverrides, 1, 512, 3, VOICES, (k, reason) => drop("type.tokenOverrides", k, reason)); // type keys: "<voice>|<step>|<modeKey>" (3 segments)
  if (Object.keys(tov).length) out.tokenOverrides = tov;
  // per-role CUSTOM font overrides, OPTIONAL map { role: family } for known roles; non-empty strings only,
  // attached only when non-empty so a config without custom fonts round-trips identically.
  if (t.fonts && typeof t.fonts === "object") {
    const fonts = {};
    for (const r of ["display", "heading", "body", "ui", "mono"]) if (typeof t.fonts[r] === "string" && t.fonts[r].trim()) fonts[r] = t.fonts[r].trim();
    if (Object.keys(fonts).length) out.fonts = fonts;
  }
  // per-VOICE shaping overrides, OPTIONAL { "<voice>": { weight, tracking, leading } } for the 15 known
  // voices (module-level VOICES above); each field clamped to a sane range, kept only when finite, attached
  // only when non-empty. This allowlist MUST track makeVoices's voices, a voice missing here has its
  // per-voice overrides SILENTLY DROPPED on hydrate. 2026-07-13, voice set + `ratio` retired: Heading→
  // Headline, UI→Label, Quote folded into Lead, Caption folded into Tiny, Legal folded into Body; Title/
  // Sub-title/Tiny added. `ratio` no longer means anything (size is now a fixed table, not base×ratio^n,
  // see type.mjs).
  if (t.voices && typeof t.voices === "object") {
    // TKT-0455, any stored voice name NOT in VOICES at this point already survived applyRenameMaps
    // (which translates every still-relevant RENAME_MAPS entry before clampType ever runs), so it is
    // genuinely unknown: a typo, a retired name, or, the failure class this ticket hardens against,
    // a future voice rename that shipped without its own RENAME_MAPS entry. Surface it instead of the
    // old behavior (the `for (const name of VOICES)` loop below simply never reads it, so it silently
    // vanished with no warning and no record).
    for (const name of Object.keys(t.voices)) if (!VOICES.includes(name)) drop("type.voices", name, "unknown voice name");
    const num = (x, lo, hi, round) => { const n = Number(x); if (!Number.isFinite(n)) return undefined; const c = Math.max(lo, Math.min(hi, n)); return round ? Math.round(c) : c; };
    const voices = {};
    for (const name of VOICES) {
      const v = t.voices[name];
      if (!v || typeof v !== "object") continue;
      const o = {};
      const w = num(v.weight, 100, 1000, true); if (w !== undefined) o.weight = w;
      const tr = num(v.tracking, -0.5, 1, false); if (tr !== undefined) o.tracking = tr;
      const le = num(v.leading, 0.8, 3, false); if (le !== undefined) o.leading = le;
      // styleName, the Figma weight-style string for non-variable families; trimmed, capped, non-empty only.
      if (typeof v.styleName === "string" && v.styleName.trim()) o.styleName = v.styleName.trim().slice(0, 60);
      // font, the per-voice FONT override (TKT-0002): a voice's own family, overriding its shared role
      // default (resolvedFontFor in type.mjs). Same shape as styleName: trimmed, capped, non-empty only.
      if (typeof v.font === "string" && v.font.trim()) o.font = v.font.trim().slice(0, 60);
      // weights, SIBLING weight variants [{name, weight}] around the voice's core (the styles feature).
      // Capped at 8 per voice; each entry needs a finite clamped weight AND a non-empty name (name capped
      // at 40 chars). ALWAYS set when the input WAS an array (even if it filters down to empty), an
      // explicit `weights: []` is a deliberate OPT-OUT (typeScale/buildCategory treats it differently
      // from an ABSENT weights key: absent auto-populates via siblingWeightDefaults, [] stays bare, no
      // siblings at all), dropping the key here on an empty result silently reverted an opt-out back to
      // auto-populate on the very next hydrate (found live: a real-font preset with only one available
      // weight for a voice, correctly opted out with `weights: []`, un-opted-out itself on reload).
      if (Array.isArray(v.weights)) {
        const list = [];
        for (const e of v.weights.slice(0, 8)) {
          if (!e || typeof e !== "object") continue;
          const w = num(e.weight, 100, 1000, true);
          const nm = typeof e.name === "string" ? e.name.trim().slice(0, 40) : "";
          if (w !== undefined && nm) list.push({ name: nm, weight: w });
        }
        o.weights = list;
      }
      if (Object.keys(o).length) voices[name] = o;
    }
    if (Object.keys(voices).length) out.voices = voices;
  }
  // breakpoint MODES (Phase 5), each a named bodyBase override. OPTIONAL: only attach when present, so a
  // config without modes round-trips identically (the hydrate identity gate). Each mode = { id, name, bodyBase }.
  if (Array.isArray(t.modes) && t.modes.length) {
    // a mode carries EITHER a bodyBase override (legacy custom modes) or a hierarchy-aware compression
    // `factor` in (0,1] (the desktop-anchored Standard set), attach each only when present, so both
    // shapes round-trip identically.
    const clampFactor = (v) => { const n = Number(v); return Number.isFinite(n) && n > 0 && n <= 1 ? { factor: Math.round(n * 1000) / 1000 } : {}; };
    const modes = t.modes
      .filter((m) => m && typeof m === "object" && typeof m.id === "string")
      .map((m) => ({ id: m.id, name: typeof m.name === "string" ? m.name : "Mode", ...(Number.isFinite(Number(m.bodyBase)) ? { bodyBase: clampBody(m.bodyBase) } : {}), ...clampFactor(m.factor), ...clampMinWidth(m.minWidth) }));
    if (modes.length) out.modes = modes;
  }
  // baseName, the RENAMED base layer (the standard set writes "Mobile"; desktop-first order derives from
  // it). OPTIONAL: attach only when meaningfully set, so a legacy config round-trips identically.
  if (typeof t.baseName === "string" && t.baseName.trim() && t.baseName.trim().toLowerCase() !== "base") {
    out.baseName = t.baseName.trim().slice(0, 40);
  }
  return out;
}

// clampGeometry, the dimensional config: the Maison ladder's kit axes (tier, scale, radius mode) plus
// the layout-spacing base. Each axis to a known id, spaceBase to an integer 1..16. Identity-preserving
// for an in-domain value (so the roundtrip gate holds). The four lists below are hand-tracked copies of
// geometry.mjs's TIERS, SCALES, SIZES and RADIUS_MODES ids, exported so test/ui/persist.mjs's
// allowlist-parity gate keeps them in lockstep (see the TYPE_TREATMENTS/VOICES note above, TKT-0017).
export const GEOMETRY_TIERS = ["content", "product", "micro"];
export const GEOMETRY_SCALES = ["sm", "md", "lg"];
// the size axis. No doc field carries one (the kit's default cell is always size md); it is listed
// for the parity gate and for callers that address a cell `{tier}-{scale}-{size}`.
export const GEOMETRY_SIZES = ["sm", "md", "lg"];
export const GEOMETRY_RADIUS = ["default", "round", "sharp", "pill"];
function clampGeometry(g, drop) {
  g = (g && typeof g === "object") ? g : {};
  // TKT-0455, an absent axis takes its default silently; a non-null, out-of-allowlist id is reported.
  const axis = (key, ids) => {
    if (g[key] != null && !ids.includes(g[key])) drop(`geometry.${key}`, g[key], `unknown ${key} id`);
    return ids.includes(g[key]) ? g[key] : DEFAULT_GEOMETRY[key];
  };
  const sb = Number(g.spaceBase);
  const out = {
    tier: axis("tier", GEOMETRY_TIERS),
    scale: axis("scale", GEOMETRY_SCALES),
    radius: axis("radius", GEOMETRY_RADIUS),
    spaceBase: g.spaceBase != null && Number.isFinite(sb) ? Math.max(1, Math.min(16, Math.round(sb))) : DEFAULT_GEOMETRY.spaceBase,
  };
  // a pre-v9 key on a snapshot that already claims v9+ (migrateGeometry removes them from every older
  // one) is a stray leftover, not a legacy doc: reported, never copied.
  for (const k of ["treatment", "baseHeight", "rampContrast", "ramp", "tokenOverrides"]) {
    if (g[k] !== undefined) drop("geometry", k, "retired at schema v9 (T-0017); a v9+ snapshot should never carry it");
  }
  // breakpoint MODES (Phase 5), each a named scale (a missing or unknown scale reads md). OPTIONAL, like
  // type.modes (the identity gate holds when absent).
  if (Array.isArray(g.modes) && g.modes.length) {
    const modes = g.modes
      .filter((m) => m && typeof m === "object" && typeof m.id === "string")
      .map((m) => ({ id: m.id, name: typeof m.name === "string" ? m.name : "Mode", scale: GEOMETRY_SCALES.includes(m.scale) ? m.scale : "md", ...clampMinWidth(m.minWidth) }));
    if (modes.length) out.modes = modes;
  }
  // baseName, the RENAMED base layer (mirrors type.baseName; the standard set writes "Mobile").
  // OPTIONAL: attach only when meaningfully set, so a legacy config round-trips identically.
  if (typeof g.baseName === "string" && g.baseName.trim() && g.baseName.trim().toLowerCase() !== "base") {
    out.baseName = g.baseName.trim().slice(0, 40);
  }
  return out;
}
