// gen-adia-derived-exports.mjs — GENERATE the two pinned, sha256-able DERIVED EXPORT ARTIFACTS for
// the committed Adia brand document (#618, tag `adia-brand-document@1.0.0`), per #631 and
// docs/plan/plan-2026-09-adia-derived-export-artifacts.md.
//
// READS   src/ui/categories/brands.js — `PRESETS`, the generated mirror of
//         docs/reference/colors/categories/brands.json. The Adia preset is looked up by EXACT name.
// WRITES  docs/reference/data/adia-oklch-export.css   (the OKLCH color-token stylesheet)
//         docs/reference/data/adia-radix-export.mjs   (the Radix/Park-UI preset module, ESM)
//
// ORDER IS LOAD-BEARING: this runs AFTER `npm run gen:categories` in both the `test` and the `build`
// chain, because it reads brands.js — which gen:categories writes.
//
// WHY `projectView(doc).exports` AND NOT bare `exportOKLCH(state)` / `exportRadix(state)`:
//   src/ui/model.mjs is the one place the app assembles every export, and it calls
//   `exportRadix(state, { geometry: geomScaleFor(state, "base") })`. Adia's document carries
//   `geometry: { ramp: "linear4" }`, so the drawer's Radix module includes a `tokens.radii` block;
//   a bare `exportRadix(state)` silently omits it and produces DIFFERENT bytes. These artifacts are
//   meant to be exactly what a user downloads from the export drawer, so they come from the drawer's
//   own assembly path, never a hand-rolled shortcut. (For OKLCH the two paths are byte-identical —
//   `exportOKLCH` takes no opts — so nothing is lost by being consistent.)
//
// WHY `hydrate` AND NOT `hydrateStoredDoc` (the app's own openConfigAsSet path):
//   `hydrateStoredDoc` differs from `hydrate` only by stamping `hueSpace: "cam16"` on a doc that
//   lacks the field. The Adia preset carries `hueSpace: "oklch"`, so the two are identical here, and
//   `hydrate` avoids dragging in app-helpers.mjs's type-fonts/app-theme imports.
//
// PROVENANCE HEADER: the exporter's own `/* ultimate-tokens export schema N */` stays line 1,
//   UNTOUCHED (a consumer sniffing the schema version reads the same first line as a drawer
//   download). The generator splices its own block in as line 2 onward, carrying four facts:
//   artifact version, source document tag + commit, generator path + call, regenerate command.
//
// BUMP POLICY (per artifact, independent cadence — #616's per-artifact tag ruling):
//   patch  provenance/comment-only change, exporter bytes identical.
//   minor  the same document re-exported under a bumped EXPORT_SCHEMA_VERSION, a new
//          `adia-brand-document` tag, OR with token values moved by an engine change under an
//          unchanged document, schema and tag (#681 at 1.2.0): a consumer re-pins, its contract holds.
//   major  a shape change a consumer's byte-compare cannot absorb (format keys renamed/removed).
//   The distinguishing question is whether a consumer's CONTRACT changed, never whether a version
//   string did: bytes moved under the same keys is minor, a key gone or renamed is major.
//   Any change to one file bumps THAT file's `version` below and cuts THAT file's tag; the other
//   file is untouched. The tag family is the file basename without extension: e.g.
//   docs/reference/data/adia-oklch-export.css -> `adia-oklch-export@1.0.0`.
//
// DO NOT EDIT the generated files — run `npm run gen:adia-exports`.
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { PRESETS } from "../src/ui/categories/brands.js";
import { hydrate } from "../src/ui/persist.js";
import { projectView } from "../src/ui/model.mjs";
import { RESERVED_ALIAS_KEYS } from "../src/engine/exports.js";

const here = dirname(fileURLToPath(import.meta.url));
const OUTDIR = resolve(here, "../docs/reference/data");

// ── pinned inputs (bumped BY HAND per the policy above) ───────────────────────────────────────
export const PRESET_NAME = "Adia · The product's own design system";
export const SOURCE_FILE = "docs/reference/colors/categories/brands.json";
export const SOURCE_TAG = "adia-brand-document@1.0.0";
export const SOURCE_COMMIT = "770297b";

// The artifact table. Adding a format later (e.g. Panda) is one row here plus one tag — the emit
// loop, the validation and the provenance block are all format-agnostic.
export const ARTIFACTS = [
  // 1.1.0 (#638): both artifacts re-exported from the SAME tagged document under
  // EXPORT_SCHEMA_VERSION 3 — the bump policy's `minor` case. Only the schema stamp and this
  // provenance block moved; no token value, name or ordering changed.
  { name: "adia-oklch-export", file: "adia-oklch-export.css", key: "oklch", version: "1.1.0" },
  { name: "adia-radix-export", file: "adia-radix-export.mjs", key: "radix", version: "1.1.0" },
];

// exportRadix's own reserved alias keys (I4, ticket #637): promoted into src/engine/exports.js as
// the ONE named, importable copy — imported above, re-exported here under the same name so
// test/engine/adia-derived-exports.mjs's existing import keeps working unchanged. Re-checked at
// generation time so a future palette rename in brands.json cannot land quietly.
export { RESERVED_ALIAS_KEYS };

// slug — MIRRORS src/engine/exports.js's own (non-exported) `slug`: the palette name -> token
// namespace mapping the Radix/CSS exporters use. Kept here so the collision check below tests the
// real key, not an approximation.
export const slug = (name) =>
  String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// adiaDoc() — the hydrated Adia document. Throws (named) if the preset is gone or renamed.
export function adiaDoc() {
  const preset = PRESETS.find((p) => p.name === PRESET_NAME);
  if (!preset)
    throw new Error(
      `gen-adia-derived-exports: preset ${JSON.stringify(PRESET_NAME)} not found in src/ui/categories/brands.js ` +
        `(found: ${PRESETS.map((p) => p.name).join(" | ")}). Run \`npm run gen:categories\` first, or fix PRESET_NAME.`,
    );
  return hydrate(preset);
}

// paletteSlugs(doc) — the export-namespace slug of every ENABLED palette, in document order.
// (The exporters filter on `enabled !== false`, so this matches what actually reaches the output.)
export const paletteSlugs = (doc) =>
  (doc.palettes || []).filter((p) => p.enabled !== false).map((p) => slug(p.name));

// buildArtifacts() — pure: validates, then returns [{ ...row, path, body, text }] with `body` the
// exporter's own bytes and `text` the bytes to write (body + provenance block spliced after line 1).
// No writes, no console output — the emit block below owns those.
export function buildArtifacts() {
  const doc = adiaDoc();
  const exports = projectView(doc).exports;

  const collisions = paletteSlugs(doc).filter((s) => RESERVED_ALIAS_KEYS.includes(s));
  if (collisions.length)
    throw new Error(
      `gen-adia-derived-exports: palette slug(s) ${collisions.join(", ")} collide with exportRadix's reserved ` +
        `alias keys (${RESERVED_ALIAS_KEYS.join(", ")}) — exportRadix would emit the palette under ` +
        `<slug>-palette (#630), and the derived artifacts are kept collision-free by policy. ` +
        `Rename the palette in ${SOURCE_FILE}.`,
    );

  return ARTIFACTS.map((row) => {
    const body = exports[row.key];
    if (typeof body !== "string" || !body)
      throw new Error(`gen-adia-derived-exports: projectView(...).exports.${row.key} is not a non-empty string.`);
    // exportRadix/exportShadcn return a plain sentinel COMMENT string (no `export default`) when no
    // driver palette can be picked — a silent, useless artifact if written out. Fail loudly instead.
    if (row.key === "radix" && !body.includes("export default "))
      throw new Error(
        `gen-adia-derived-exports: exports.radix is the no-driver sentinel (${JSON.stringify(body.slice(0, 80))}) — ` +
          `the Adia document has no enabled non-data driver palette.`,
      );
    return { ...row, path: resolve(OUTDIR, row.file), body, text: withProvenance(row, body) };
  });
}

// withProvenance — splice the four-fact block in AFTER the exporter's own first line.
function withProvenance(row, body) {
  const lines = body.split("\n");
  const block = [
    `/* ${row.name} ${row.version}`,
    `   source: ${SOURCE_FILE} (${SOURCE_TAG}, ${SOURCE_COMMIT})`,
    `   generator: scripts/gen-adia-derived-exports.mjs (projectView(hydrate(preset)).exports.${row.key})`,
    "   DO NOT EDIT: regenerate with `npm run gen:adia-exports`. */",
  ];
  return [lines[0], ...block, ...lines.slice(1)].join("\n");
}

// ── emit ──────────────────────────────────────────────────────────────────────────────────────
// guarded so this module can be IMPORTED (test/engine/adia-derived-exports.mjs reads the table and
// the helpers above) without the side effect of rewriting the artifacts.
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  mkdirSync(OUTDIR, { recursive: true });
  for (const a of buildArtifacts()) {
    writeFileSync(a.path, a.text);
    console.log(`wrote docs/reference/data/${a.file}  (${a.name} ${a.version} · ${a.text.length} chars)`);
  }
}
