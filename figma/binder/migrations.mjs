// migrations.mjs, the ACTIVE rename/retire migration maps (TKT-0012 capability). TKT-0013 carries
// the ADR-016 kebab wave below. One module, imported by the app (float plans, color apply message,
// style plans); the flagship code.js keeps its own hand-mirrored LIBRARY_TYPE_VOICE_MAP.
//
// MIGRATION MAPS ARE FROZEN HISTORY: the old-name derivations below encode the PRE-wave grammar
// exactly as it shipped (Title-case voices, UPPER steps, camel props, "500-{step}" scrim leaves,
// camel role keys), never "modernize" them to track live canon; they exist to find yesterday's
// variables in a user's file and rename them in place.
//
// CONVENTION (TKT-0012, recorded in shipping-changes): every ticket that renames an emitted
// variable, collection, or style name adds its map HERE in the same change.

import { semanticRoles } from "../../src/engine/semantic.js";
import { LEGACY_SIZE_CELLS } from "../../src/engine/geometry.mjs";

// ── the ADR-016 kebab wave (TKT-0013, 2026-07-17) ────────────────────────────────────────────────

// frozen pre-wave reverse tables
const OLD_VOICE = { "display": "Display", "headline": "Headline", "sub-heading": "Sub-heading", "title": "Title", "sub-title": "Sub-title", "lead": "Lead", "body": "Body", "body-mono": "Body-mono", "label": "Label", "label-mono": "Label-mono", "kicker": "Kicker", "tiny": "Tiny", "tiny-mono": "Tiny-mono", "ui-control": "UI-control", "ui-widget": "UI-widget" };
const OLD_PROP = { "size": "size", "line-height": "lineHeight", "letter-spacing": "letterSpacing", "weight": "weight", "paragraph-spacing": "paragraphSpacing", "single-line-height": "singleLineHeight" };
const OLD_FIELD = { "height": "height", "icon": "icon", "caret": "caret", "icon-gap": "gap", "padding-narrow": "paddingNarrow", "padding-wide": "paddingWide", "padding-narrow-compact": "paddingNarrowCompact", "padding-wide-compact": "paddingWideCompact", "pill-radius": "radius", "min-width": "minWidth" };

// kebabWaveOldName(newName) → the pre-wave name for a CURRENT Geometry-collection variable, or
// null when unchanged (space/radius/inset/gap/border/focus were already kebab).
export function kebabWaveOldName(newName) {
  const seg = String(newName).split("/");
  if (seg[0] === "type" && seg.length === 4) {
    const v = OLD_VOICE[seg[1]], p = OLD_PROP[seg[3]];
    if (v && p) {
      const old = `type/${v}/${seg[2].toUpperCase()}/${p}`;
      return old === newName ? null : old;
    }
  }
  if (seg[0] === "size" && seg.length === 3) {
    // a ladder cell post-dates the wave, so it has no pre-wave name (its predecessors are the legacy steps)
    if (/^(content|product|micro)-(sm|md|lg)-(sm|md|lg)$/.test(seg[1])) return null;
    const f = OLD_FIELD[seg[2]];
    if (f) {
      const old = `size/${seg[1].toUpperCase()}/${f}`;
      return old === newName ? null : old;
    }
  }
  return null;
}

// kebabWaveVarRenames(currentNames) → { oldName: newName } for a plan's variable list.
export function kebabWaveVarRenames(currentNames) {
  const out = {};
  for (const name of currentNames || []) {
    const old = kebabWaveOldName(name);
    if (old) out[old] = name;
  }
  return out;
}

// kebabWaveColorRenames(paletteSlugs) → the color-collection maps: semantic roles moved from camel
// keys ("{n}/onSurface") to kebab leaves ("{n}/on-surface"); raw scrims nested ("{n}/500-200" →
// "{n}/scrim/200"). semanticRoles still carries BOTH forms (key = the frozen camel, suffix = kebab).
const SCRIM_STEPS_FROZEN = ["050", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
export function kebabWaveColorRenames(paletteSlugs) {
  const semantic = {}, raw = {};
  for (const n of paletteSlugs || []) {
    for (const r of semanticRoles(n)) {
      const leaf = r.suffix ? r.suffix.slice(1) : n;
      if (r.key !== leaf) semantic[`${n}/${r.key}`] = `${n}/${leaf}`;
    }
    for (const step of SCRIM_STEPS_FROZEN) raw[`${n}/500-${step}`] = `${n}/scrim/${step}`;
  }
  return { semantic, raw };
}

export const FIGMA_MIGRATIONS = {
  // floats: stamped by the app AFTER planning (the var map derives from the live plan's names via
  // kebabWaveVarRenames, see _figmaFloatPlans); the collection renames are static.
  // "Geometry" (#491, 2026-09-02): a REVERT, the merged type/+box-geometry collection was briefly
  // "Breakpoints" (TKT-0009/ADR-016); a file still carrying either name (incl. one that never got the
  // Geometry->Breakpoints rename applied, e.g. an older ADIA Colors export) adopts in place.
  // "Type Primitives" (#491): was "Font Primitives", matches the product's own "Type" vocabulary.
  // retire (TKT-0009, extracted to retirementsFor at TKT-0018): the merged "Geometry" collection
  // supersedes the old two-collection era's "Typography" once it actually lands type/ variables.
  floats: {
    collections: {
      "Geometry": { renameFrom: ["Breakpoints"] },
      "Type Primitives": { renameFrom: ["Font Primitives"] },
    },
    retire: [{ collection: "Geometry", ifVariablePrefix: "type/", retire: ["Typography"] }],
  },
  // "Color Roles" (#491): was "Color Semantic", was "Color Modes", both old names adopt in place.
  color: { collections: { "Color Roles": ["Color Semantic", "Color Modes"] } },
  styles: { paints: {}, texts: {} },
};

// LIBRARY_TYPE_VOICE_MAP (#495), the STATIC old->new Type-voice KEBAB-SEGMENT map "published library"
// mode uses to ALIAS an old-voice-named Font/Type Primitives (or Geometry type/ half) variable to its
// current counterpart, instead of pruning it, when the file is a published library other files depend
// on. Voices NOT listed here (body/display/lead/kicker/sub-heading) need no entry: their OLD kebab
// segment is ALREADY byte-identical to a CURRENT voice's, so ordinary create-or-reuse-by-name already
// covers them, no alias/deprecate involvement at all. "quote" has no entry either, no current
// counterpart, so it falls straight to DEPRECATE (renamed under "_deprecated/", id preserved).
// figma/plugin/code.js carries the SAME map as a literal (LIBRARY_TYPE_VOICE_MAP), the VM can't import
// this file; kept in lockstep by hand (and gated by `renameparity` in test/figma/binder.mjs), same discipline as SEMANTIC_RENAME_FROM in the standalone binder.
export const LIBRARY_TYPE_VOICE_MAP = { heading: "headline", ui: "ui-control", caption: "label", legal: "tiny", code: "label-mono" };

// GEOMETRY_FIELD_RENAME_MAP (#498, retargeted at T-0017), the STATIC old->new Geometry size/* FIELD-
// SPELLING map "published library" mode uses to ALIAS an old-spelled size/* field to its current
// counterpart (same nearest-by-height step match #495 established, which now lands on a ladder cell,
// see geometrySizeAliasMap; this bridges the FIELD segment only). The targets are the cell fields:
// both pad spellings ("padding-narrow", the ADIA file's "padding") map to "inset", both radius
// spellings ("pill-radius", "radius") to "radius-control", "minWidth" to "min-width", and "font" now
// maps to the cell's own "text" (a size/ field of the same collection since T-0017, so no
// cross-collection target is needed). The fields with no cell counterpart, "edgePadding", "gap",
// "caret", "icon-gap", "padding-wide", "padding-narrow-compact" and "padding-wide-compact", have no
// target and are left OUT: an old size/{step}/{field} of that spelling deprecates, id-preserving, the
// scope decision "font" carried until T-0017 (#498). NOT the same grammar as this file's own ADR-016
// kebab-wave OLD_FIELD table above (that one documents THIS repo's own "paddingWide"/"paddingNarrow"
// intermediate spelling, TKT-0013, frozen history), kept as an independent, purpose-specific const
// rather than derived from it. figma/plugin/code.js and the standalone binder carry the SAME map as a
// literal, the VM can't import this file; kept in lockstep by hand (and gated by `renameparity`), same
// discipline as LIBRARY_TYPE_VOICE_MAP above.
// The SAME scope decision covers the retired UI voice steps (T-0017): UI-control and UI-widget keep one
// step, md, so a live file's type/ui-control/{xs,sm,lg,xl,2xl}/* and type/ui-widget/{xs,sm,lg,xl,2xl}/*
// variables and their text styles have no rename target here and deprecate, id-preserving.
export const GEOMETRY_FIELD_RENAME_MAP = { "padding-narrow": "inset", padding: "inset", font: "text", "pill-radius": "radius-control", radius: "radius-control", minWidth: "min-width" };

// ── classic-mode legacy size renames (T-0026, PR #813 review) ────────────────────────────────────

// frozen pre-T-0017 tables: the ten kebab size/{step}/* fields the engine emitted over the steps
// xs, sm, md, lg, xl, 2xl, and the UI voice steps T-0017 retired (UI-control and UI-widget keep md).
export const LEGACY_SIZE_FIELDS = ["height", "icon", "caret", "icon-gap", "padding-narrow", "padding-wide", "padding-narrow-compact", "padding-wide-compact", "pill-radius", "min-width"];
const RETIRED_UI_VOICES = ["ui-control", "ui-widget"];
const RETIRED_UI_STEPS = ["xs", "sm", "lg", "xl", "2xl"];
const RETIRED_UI_PROPS = ["size", "line-height", "letter-spacing", "weight", "paragraph-spacing", "single-line-height"];

// legacySizeRenames(currentNames, mdCell) → { oldName: newName }, the id-preserving rename map CLASSIC
// apply stamps onto a Geometry plan so the prune never reaches a live file's legacy variables (the
// renames run before the reconcile and the prune, and both prunes skip _deprecated/ names). Library
// mode keeps ADR-032's nearest-by-height alias path and never gets this map. Each legacy step renames
// onto its LEGACY_SIZE_CELLS cell, MD onto mdCell (the kit default cell, sizeAnchor(scale, "MD").name),
// claimed in that order so MD wins a shared cell; a step whose cell is taken, empty, or not in the
// plan deprecates. A field keeps its spelling when the cell carries it, else bridges through
// GEOMETRY_FIELD_RENAME_MAP, else deprecates. Both the kebab name and its pre-ADR-016 spelling
// (kebabWaveOldName) are covered. The retired UI-control and UI-widget steps deprecate rather than
// map to md: the SAME scope decision as size/{step}/font (see GEOMETRY_FIELD_RENAME_MAP's header).
export function legacySizeRenames(currentNames, mdCell) {
  const wanted = new Set(currentNames || []);
  const out = {};
  const put = (oldName, target) => {
    if (wanted.has(oldName)) return;
    out[oldName] = target && wanted.has(target) ? target : "_deprecated/" + oldName;
  };
  const claimed = new Set();
  for (const [step, cell] of [["MD", mdCell], ...Object.entries(LEGACY_SIZE_CELLS)]) {
    const owns = !!cell && !claimed.has(cell) && wanted.has(`size/${cell}/height`);
    if (owns) claimed.add(cell);
    for (const field of LEGACY_SIZE_FIELDS) {
      let target = null;
      if (owns) {
        const f = wanted.has(`size/${cell}/${field}`) ? field : GEOMETRY_FIELD_RENAME_MAP[field];
        if (f) target = `size/${cell}/${f}`;
      }
      const kebab = `size/${step.toLowerCase()}/${field}`;
      put(kebab, target);
      const pre = kebabWaveOldName(kebab);
      if (pre) put(pre, target);
    }
  }
  for (const voice of RETIRED_UI_VOICES) for (const step of RETIRED_UI_STEPS) for (const prop of RETIRED_UI_PROPS) {
    const kebab = `type/${voice}/${step}/${prop}`;
    put(kebab, null);
    const pre = kebabWaveOldName(kebab);
    if (pre) put(pre, null);
  }
  return out;
}
