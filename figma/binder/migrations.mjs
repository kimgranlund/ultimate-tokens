// migrations.mjs — the ACTIVE rename/retire migration maps (TKT-0012 capability). TKT-0013 carries
// the ADR-016 kebab wave below. One module, imported by the app (float plans, color apply message,
// style plans) so every executor path receives the same maps.
//
// MIGRATION MAPS ARE FROZEN HISTORY: the old-name derivations below encode the PRE-wave grammar
// exactly as it shipped (Title-case voices, UPPER steps, camel props, "500-{step}" scrim leaves,
// camel role keys) — never "modernize" them to track live canon; they exist to find yesterday's
// variables in a user's file and rename them in place.
//
// CONVENTION (TKT-0012, recorded in shipping-changes): every ticket that renames an emitted
// variable, collection, or style name adds its map HERE in the same change.

import { semanticRoles } from "../../src/engine/semantic.js";

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
  // kebabWaveVarRenames — see _figmaFloatPlans); the collection renames are static.
  // "Geometry" (#491, 2026-09-02): a REVERT — the merged type/+box-geometry collection was briefly
  // "Breakpoints" (TKT-0009/ADR-016); a file still carrying either name (incl. one that never got the
  // Geometry->Breakpoints rename applied, e.g. an older ADIA Colors export) adopts in place.
  // "Type Primitives" (#491): was "Font Primitives" — matches the product's own "Type" vocabulary.
  // retire (TKT-0009, extracted to retirementsFor at TKT-0018): the merged "Geometry" collection
  // supersedes the old two-collection era's "Typography" once it actually lands type/ variables.
  floats: {
    collections: {
      "Geometry": { renameFrom: ["Breakpoints"] },
      "Type Primitives": { renameFrom: ["Font Primitives"] },
    },
    retire: [{ collection: "Geometry", ifVariablePrefix: "type/", retire: ["Typography"] }],
  },
  // "Color Roles" (#491): was "Color Semantic", was "Color Modes" — both old names adopt in place.
  color: { collections: { "Color Roles": ["Color Semantic", "Color Modes"] } },
  styles: { paints: {}, texts: {} },
};

// LIBRARY_TYPE_VOICE_MAP (#495) — the STATIC old->new Type-voice KEBAB-SEGMENT map "published library"
// mode uses to ALIAS an old-voice-named Font/Type Primitives (or Geometry type/ half) variable to its
// current counterpart, instead of pruning it, when the file is a published library other files depend
// on. Voices NOT listed here (body/display/lead/kicker/sub-heading) need no entry: their OLD kebab
// segment is ALREADY byte-identical to a CURRENT voice's, so ordinary create-or-reuse-by-name already
// covers them — no alias/deprecate involvement at all. "quote" has no entry either — no current
// counterpart — so it falls straight to DEPRECATE (renamed under "_deprecated/", id preserved).
// figma/plugin/code.js carries the SAME map as a literal (LIBRARY_TYPE_VOICE_MAP) — the VM can't import
// this file; kept in lockstep by hand, same discipline as SEMANTIC_RENAME_FROM in the standalone binder.
export const LIBRARY_TYPE_VOICE_MAP = { heading: "headline", ui: "ui-control", caption: "label", legal: "tiny", code: "label-mono" };
