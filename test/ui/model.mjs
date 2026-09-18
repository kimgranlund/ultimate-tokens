#!/usr/bin/env node
// model.mjs — direct unit coverage for src/ui/model.mjs's data-palette functions: mintDataPalettes
// and rederiveDataHues (added by U6/#515). An independent review of #525 flagged that these two
// functions — plus the private brandHuesOf/isDataSlug helpers they lean on — shipped with ZERO
// direct test coverage: nothing called them until U8 (#517) wired UI buttons to them, and even
// then test/ui/headless-boot.mjs's (dpa) group only exercises them THROUGH button clicks. This
// file imports and calls them directly, pure, no DOM — covering SPEC
// docs/spec/spec-muted-base-key-spikes.md REQ-020..024 at the model layer.
import { PALETTE_GROUPS, brandKit, defaultDocument, exportDesignSystemBundle, geomScaleFor, mintDataPalettes, paletteGroup, paletteGroupLabel, projectView, radixCollisionBadge, radixExportKey, radixKeyCollision, RADIX_COLLISION_BADGE, rederiveDataHues, resolvedPalettes, slug, typeScaleFor } from "../../src/ui/model.mjs";
import { deriveDataHues } from "../../src/engine/data-hues.mjs";
import { RESERVED_ALIAS_KEYS, isDataPalette, exportRadixModule } from "../../src/engine/exports.js";
import { PRESETS as BRAND_PRESETS } from "../../src/ui/categories/brands.js";
import { hydrate } from "../../src/ui/persist.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
const norm = (d) => ((d % 360) + 360) % 360;
const angClose = (a, b, tol = 1e-6) => Math.min(norm(a - b), norm(b - a)) <= tol;

// an INDEPENDENT re-implementation of REQ-021's brandHues filter (chroma >= 20, non-data
// palettes only), so the cross-checks below don't just call back into the module's own
// private brandHuesOf/isDataSlug — the same "second derivation" discipline data-hues.mjs uses.
const isDataName = (name) => /^data-\d+$/.test(slug(name));
const expectedBrandHues = (palettes) => palettes.filter((p) => !isDataName(p.name) && (p.chroma ?? 0) >= 20).map((p) => p.hue);

// ── mintDataPalettes: REQ-020..022 ──────────────────────────────────────────────────────
{
  // no Primary palette at all -> nothing to anchor on, [] (never throws).
  ok(mintDataPalettes({ palettes: [{ name: "Neutral", hue: 0, chroma: 10 }] }).length === 0,
    "mintDataPalettes with no Primary palette must return []");
  ok(mintDataPalettes({ palettes: [] }).length === 0, "mintDataPalettes on an empty palette list must return []");
  ok(mintDataPalettes({}).length === 0, "mintDataPalettes on a doc with no palettes field must return []");
}
{
  // a hand-built document — cross-check the REAL mintDataPalettes hues against the real
  // deriveDataHues fed an INDEPENDENTLY filtered brand-hue list (REQ-020/REQ-021 wired together).
  const palettes = [
    { name: "Primary", hue: 267, chroma: 95 },
    { name: "Secondary", hue: 165, chroma: 100 },
    { name: "Tertiary", hue: 315, chroma: 33 },
    { name: "Tinted Neutral", hue: 200, chroma: 29 }, // REQ-021: chroma>=20, IN
    { name: "Near-achromatic Neutral", hue: 60, chroma: 10 }, // REQ-021: chroma<20, OUT
  ];
  const minted = mintDataPalettes({ palettes });
  ok(minted.length === 8, `mintDataPalettes must mint exactly 8 palettes (got ${minted.length})`);
  const expectedHues = deriveDataHues(267, expectedBrandHues(palettes), 8).hues;
  ok(minted.every((p, i) => angClose(p.hue, expectedHues[i])),
    `REQ-020/021: minted hues ${JSON.stringify(minted.map((p) => p.hue))} must match deriveDataHues over the correctly chroma-filtered brand set ${JSON.stringify(expectedHues)}`);

  // REQ-022: shape — name, chroma follows Primary's own (H4), every shaping field reset to
  // neutral, and no intensity override.
  minted.forEach((p, i) => {
    ok(p.name === `Data ${i + 1}`, `REQ-022: palette ${i} named "${p.name}", want "Data ${i + 1}"`);
    ok(p.chroma === 95, `REQ-022: palette ${i} chroma ${p.chroma}, want Primary's 95 (H4)`);
    ok(p.skew === 0 && p.lift === 0 && p.hueShift === 0 && p.hueSameDir === false && p.on === true,
      `REQ-022: palette ${i} isn't reset to neutral shaping (got ${JSON.stringify(p)})`);
    ok(!("intensity" in p), `REQ-022: palette ${i} must carry no intensity override`);
  });
}
{
  // EX-5 (SPEC's own normative example) — the shipped 8 brand palettes' RAW CAM16 hue/chroma
  // values, fed straight to mintDataPalettes, must reproduce the exact literal hues recorded in
  // model.mjs's own DEFAULT_PALETTES comment ("phi 20, hues [287,332,...]") — proving those
  // numbers really came from calling this function, not a hand guess. Deliberately NOT
  // defaultDocument()'s OKLCH-converted copies: camHueToOklch is a nonlinear per-hue conversion
  // that does not commute with deriveDataHues's own circular-distance arithmetic, so "convert
  // brand hues to OKLCH, then derive" and "derive in CAM16, then convert the results" are only
  // approximately similar, not identical — defaultDocument() does the latter (REQ-024 sourced the
  // Data N literals from a CAM16-space derivation, then applied the SAME per-literal OKLCH
  // conversion uniformly to all 16, brand and data alike).
  const brandCam16 = [
    { name: "Neutral", hue: 267, chroma: 29 },
    { name: "Primary", hue: 267, chroma: 95 },
    { name: "Secondary", hue: 165, chroma: 100 },
    { name: "Tertiary", hue: 315, chroma: 33 },
    { name: "Info", hue: 235, chroma: 40 },
    { name: "Success", hue: 145, chroma: 55 },
    { name: "Warning", hue: 70, chroma: 100 },
    { name: "Danger", hue: 27, chroma: 55 },
  ];
  const minted = mintDataPalettes({ palettes: brandCam16 });
  const wantHues = [287, 332, 17, 62, 107, 152, 197, 242]; // model.mjs's own DEFAULT_PALETTES comment
  ok(minted.length === 8 && minted.every((p, i) => angClose(p.hue, wantHues[i])),
    `EX-5: mintDataPalettes on the shipped brand CAM16 values must reproduce DEFAULT_PALETTES's own recorded Data N hues (got ${JSON.stringify(minted.map((p) => p.hue))}, want ${JSON.stringify(wantHues)})`);
}
{
  // REQ-021 boundary, exercised through the REAL code path: chroma exactly 20 is IN, 19 is OUT.
  // Primary itself is a non-data palette with chroma>=20, so it's ALWAYS its own member of
  // brandHues too (REQ-021 names no Primary exclusion; EX-5's 7-hue brand set, one short of the
  // 8 qualifying palettes, is exactly Neutral(267) and Primary(267) sharing a value) — both
  // expected sets below include Primary's own hue for that reason.
  const primary = { name: "Primary", hue: 267, chroma: 95 };
  const gotIncluded = mintDataPalettes({ palettes: [primary, { name: "Edge20", hue: 10, chroma: 20 }] }).map((p) => p.hue);
  const wantIncluded = deriveDataHues(267, [267, 10], 8).hues;
  ok(gotIncluded.every((h, i) => angClose(h, wantIncluded[i])),
    `REQ-021: chroma exactly 20 must be included in brandHues (got ${JSON.stringify(gotIncluded)}, want ${JSON.stringify(wantIncluded)})`);

  const gotExcluded = mintDataPalettes({ palettes: [primary, { name: "Edge19", hue: 10, chroma: 19 }] }).map((p) => p.hue);
  const wantExcluded = deriveDataHues(267, [267], 8).hues; // Edge19 filtered OUT -> only Primary's own hue qualifies
  ok(gotExcluded.every((h, i) => angClose(h, wantExcluded[i])),
    `REQ-021: chroma 19 must be excluded from brandHues (got ${JSON.stringify(gotExcluded)}, want ${JSON.stringify(wantExcluded)})`);
}

// ── rederiveDataHues: REQ-023 ───────────────────────────────────────────────────────────
{
  const doc = { palettes: [{ name: "Data 1", hue: 10, chroma: 50, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true }] };
  ok(rederiveDataHues(doc) === doc, "rederiveDataHues with no Primary palette must return the SAME doc reference, unchanged");
}
{
  const doc = { palettes: [{ name: "Primary", hue: 267, chroma: 95 }] };
  ok(rederiveDataHues(doc) === doc, "rederiveDataHues with zero Data N palettes must return the SAME doc reference, unchanged");
}
{
  // a partial-migration state: only 3 Data N palettes (not the full 8), interspersed with a
  // decoy palette whose SLUG CONTAINS the "data-<digits>" shape ("old-data-5" embeds "data-5")
  // but isn't an EXACT match — this is the real regression net for isDataSlug's `^`/`$` anchors:
  // an unanchored /data-\d+/ would wrongly match it too, so only the anchored regex tells them
  // apart (a plain "Database" decoy wouldn't contain "data-<digits>" at all and so wouldn't
  // exercise the anchors either way — a vacuous guard).
  const palettes = [
    { name: "Primary", hue: 100, chroma: 80 },
    { name: "Secondary", hue: 40, chroma: 60 },
    { name: "Old Data 5", hue: 300, chroma: 80, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true }, // slug "old-data-5" — NOT an exact "data-<digits>" slug, an ordinary brand palette
    { name: "Data 1", hue: 1, chroma: 80, skew: 5, lift: 3, hueShift: 2, hueSameDir: true, on: false },
    { name: "Data 2", hue: 2, chroma: 80, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true },
    { name: "Data 3", hue: 3, chroma: 80, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true },
  ];
  const doc = { palettes };
  const out = rederiveDataHues(doc);
  ok(out !== doc, "rederiveDataHues with Primary + Data N present must return a NEW doc object, not mutate the input");
  ok(out.palettes.length === palettes.length, "rederiveDataHues must not add or remove palettes");
  ok(out.palettes[0] === palettes[0] && out.palettes[1] === palettes[1],
    "rederiveDataHues must leave non-Data-N palette OBJECTS untouched (same reference), not clone them needlessly");
  ok(out.palettes[2].name === "Old Data 5" && out.palettes[2].hue === 300,
    `isDataSlug's anchors must reject "old-data-5" (embeds "data-5" but isn't an exact match) — it must be left completely untouched (got ${JSON.stringify(out.palettes[2])})`);
  ok(out.palettes.map((p) => p.name).join(",") === palettes.map((p) => p.name).join(","), "rederiveDataHues must preserve palette order");

  const dataOut = out.palettes.filter((p) => /^Data \d+$/.test(p.name));
  ok(dataOut.length === 3, `rederiveDataHues must recompute exactly the 3 real Data N palettes present, no more (got ${dataOut.length})`);
  // brandHues here: Primary(100, its own hue also counts, REQ-021 names no Primary exclusion) +
  // Secondary(40) + "Old Data 5"(300) — all three chroma>=20, none an exact "Data N" slug.
  const expectedHues = deriveDataHues(100, [100, 40, 300], 3).hues;
  ok(dataOut.every((p, i) => angClose(p.hue, expectedHues[i])),
    `REQ-023: recomputed hues ${JSON.stringify(dataOut.map((p) => p.hue))} must match deriveDataHues(100, [40,300], 3) = ${JSON.stringify(expectedHues)}`);
  // REQ-023: every OTHER field on a recomputed Data N palette is untouched — only hue moves.
  ok(dataOut[0].skew === 5 && dataOut[0].lift === 3 && dataOut[0].hueShift === 2 && dataOut[0].hueSameDir === true && dataOut[0].on === false,
    `REQ-023: Re-derive must only touch hue, never skew/lift/hueShift/hueSameDir/on (got ${JSON.stringify(dataOut[0])})`);
}

// ── paletteGroup: ticket #556's default-by-name rule + explicit-wins ────────────────────
{
  ok(PALETTE_GROUPS.join(",") === "material,brand,system,data", `PALETTE_GROUPS must be [material,brand,system,data] in render order (got ${JSON.stringify(PALETTE_GROUPS)})`);
  ok(paletteGroupLabel("material") === "Material" && paletteGroupLabel("brand") === "Brand" && paletteGroupLabel("system") === "System" && paletteGroupLabel("data") === "Data",
    "paletteGroupLabel must title-case each of the four groups");
  ok(paletteGroupLabel("bogus") === "Data", "paletteGroupLabel must fall back to the Data label for an unknown group id");

  // all 16 default palettes land in the RIGHT group per the ratified default-by-name rule.
  const EXPECTED = {
    Neutral: "material", Primary: "brand", Secondary: "brand", Tertiary: "brand",
    Info: "system", Success: "system", Warning: "system", Danger: "system",
    "Data 1": "data", "Data 2": "data", "Data 3": "data", "Data 4": "data",
    "Data 5": "data", "Data 6": "data", "Data 7": "data", "Data 8": "data",
  };
  const doc = defaultDocument();
  ok(doc.palettes.length === 16, `defaultDocument must still ship 16 palettes (got ${doc.palettes.length})`);
  for (const p of doc.palettes) {
    ok(paletteGroup(p) === EXPECTED[p.name], `paletteGroup(${p.name}) must default to "${EXPECTED[p.name]}" (got "${paletteGroup(p)}")`);
  }

  // explicit `group` wins over the default-by-name rule for ANY name, including a
  // special-cased one — fully user-assignable (ticket #556's Scope).
  ok(paletteGroup({ name: "Neutral", group: "data" }) === "data", "an explicit valid group must override Neutral's material default");
  ok(paletteGroup({ name: "Primary", group: "system" }) === "system", "an explicit valid group must override Primary's brand default");

  // an invalid/unknown `group` value is NOT trusted — falls back to the default-by-name rule
  // (persist.js only ever writes a valid enum member, but paletteGroup must be defensive too).
  ok(paletteGroup({ name: "Neutral", group: "bogus" }) === "material", "an invalid group value must fall back to the default-by-name rule");
  ok(paletteGroup({ name: "Palette 5" }) === "data", 'a freshly-minted "Palette N" name (matches no special case) must default to data');
  ok(paletteGroup({ name: "Custom Brand Color" }) === "data", "an arbitrary user-named palette must default to data (every OTHER palette)");

  // mintDataPalettes (the "Add data palettes" action) stamps an explicit group of "data" on
  // every fresh Data-N palette it mints.
  const withPrimary = { palettes: [{ name: "Primary", hue: 267, chroma: 95 }] };
  const minted = mintDataPalettes(withPrimary);
  ok(minted.length === 8 && minted.every((p) => p.group === "data"), "mintDataPalettes must stamp group:\"data\" on every minted Data-N palette");
}

// ── byte-identity export check (ticket #556 non-goal guard, SUPERSEDED for intensity/primeChroma
// by ticket #559, and again for the GROUP METADATA ITSELF by ticket #572/RP-1) ────────────────────
// #556 shipped `group` as purely editor/organizational metadata with zero export effect. #559 makes
// a palette's GROUP drive its resolved baseIntensity/primeChroma (Material 30/60 vs Brand/System/Data
// all 100/100 by default) — so reassigning a palette's group no longer guarantees byte-identical
// exports in general; that is the whole point of the ticket. #572/RP-1 then makes the group ITSELF
// exported metadata (JSON `group`, DTCG raw `$extensions`, a CSS/OKLCH/Tailwind comment line,
// brandKit `group`) — so even a brand<->system swap (same 100/100 chroma defaults) now legitimately
// changes those metadata bytes; that is RP-1's whole point too. What still holds, narrowed twice
// now: a brand<->system swap changes ONLY the group metadata itself (the new comment line's word,
// the `group`/`$extensions` field) — every VALUE (ramp colors, role hex, prime swatches) and every
// TOKEN NAME is unaffected, on every surface, regardless of group.
{
  // stripGroupComments (RP-1, ticket #572): drop the ADDED `/* name · group */` comment lines so a
  // brand<->system swap (identical underlying values) still compares byte-identical net of the
  // metadata line itself, which legitimately differs by design.
  const stripGroupComments = (text) => text.split("\n").filter((l) => !/^\s*\/\* .* · (material|brand|system|data) \*\/$/.test(l)).join("\n");
  // stripJsonGroup (RP-1): exportJSON's per-palette `group` field, deleted before comparing (every
  // OTHER key — stops/scrims/prime/semantic/keyColors — must still match exactly).
  const stripJsonGroup = (jsonText) => {
    const obj = JSON.parse(jsonText);
    for (const k of Object.keys(obj)) { if (k !== "constants" && obj[k] && typeof obj[k].group !== "undefined") delete obj[k].group; }
    return JSON.stringify(obj);
  };
  // stripRawGroupExt (RP-1): a RAW DTCG tree object (palette-slug-keyed) with each palette node's
  // `$extensions["com.ultimate-tokens"]` removed, mutated in place — the shared step both
  // stripDtcgGroupExt (the combined 3-file bundle) and the figma.raw comparison below reuse.
  const stripRawGroupExt = (rawTree) => {
    for (const k of Object.keys(rawTree)) {
      if (k === "$extensions" || k === "constants") continue;
      if (rawTree[k] && typeof rawTree[k] === "object" && rawTree[k].$extensions && rawTree[k].$extensions["com.ultimate-tokens"]) delete rawTree[k].$extensions;
    }
    return rawTree;
  };
  // stripDtcgGroupExt (RP-1): exportDTCG's raw-file-only `$extensions["com.ultimate-tokens"]` per
  // palette group node, deleted before comparing (theme files never carry it in the first place —
  // "palette.tokens.json" is the only one of the 3 files this ticket's DTCG contract touches).
  const stripDtcgGroupExt = (jsonText) => {
    const obj = JSON.parse(jsonText);
    if (obj["palette.tokens.json"]) stripRawGroupExt(obj["palette.tokens.json"]);
    return JSON.stringify(obj);
  };
  // stripRawFileGroupExt (RP-1): same stripping for a STANDALONE raw-file string (figma.raw, which
  // IS the raw tree, not wrapped in the 3-file bundle shape).
  const stripRawFileGroupExt = (jsonText) => JSON.stringify(stripRawGroupExt(JSON.parse(jsonText)));
  const stripBrandKitGroup = (kit) => {
    const clone = JSON.parse(JSON.stringify(kit));
    for (const p of clone.palettes || []) delete p.group;
    return JSON.stringify(clone);
  };
  // dsDocOf mirrors drawer.js's own dsDoc: exportDesignSystemBundle reads doc.palettes[i].intensity/
  // primeChroma directly (it's called with a doc-shaped object, never through stateOf/projectView),
  // so it needs the group layer folded in explicitly or it silently ignores it (ticket #559).
  const dsDocOf = (doc) => ({ ...doc, palettes: resolvedPalettes(doc) });
  const base = defaultDocument();
  const baseExports = projectView(base).exports;

  // brand <-> system swap: same 100/100 defaults on both sides — must still be byte-identical.
  // Reassign every brand/system palette to the OTHER of the two (not a flat index cycle, which
  // could coincidentally land a palette back on its own default and understate the check, per
  // #556's own review fix).
  const sameDefaults = defaultDocument();
  sameDefaults.palettes = sameDefaults.palettes.map((p) => {
    const g = paletteGroup(p);
    if (g === "brand") return { ...p, group: "system" };
    if (g === "system") return { ...p, group: "brand" };
    return p;
  });
  ok(sameDefaults.palettes.some((p, i) => paletteGroup(p) !== paletteGroup(base.palettes[i])), "test setup: at least one palette must actually change group in the brand<->system swap");
  const sameDefaultsExports = projectView(sameDefaults).exports;
  // ui3/shadcn carry NO group metadata (RP-1: ruled out — no Figma metadata slot short of
  // `description`, #556; ShadCN's fixed contract) — still strictly byte-identical.
  for (const fmt of ["ui3", "shadcn"]) {
    ok(baseExports[fmt] === sameDefaultsExports[fmt], `export format "${fmt}" must stay byte-identical when a palette moves between two groups sharing the same baseIntensity/primeChroma default (brand <-> system)`);
  }
  // css/oklch/tailwind carry a group comment line (RP-1) — byte-identical once that line is
  // stripped; json/dtcg carry a group field/extension — byte-identical once THAT is stripped.
  for (const fmt of ["css", "oklch", "tailwind"]) {
    ok(stripGroupComments(baseExports[fmt]) === stripGroupComments(sameDefaultsExports[fmt]), `export format "${fmt}" must stay byte-identical (net of the RP-1 group comment line) when a palette moves between two groups sharing the same baseIntensity/primeChroma default (brand <-> system)`);
    ok(baseExports[fmt] !== sameDefaultsExports[fmt], `export format "${fmt}" IS expected to differ (only by its RP-1 group comment line) across the brand <-> system swap — if this fails, the swap stopped changing anything`);
  }
  ok(stripJsonGroup(baseExports.json) === stripJsonGroup(sameDefaultsExports.json), `export format "json" must stay byte-identical (net of the RP-1 \`group\` field) when a palette moves between two groups sharing the same baseIntensity/primeChroma default (brand <-> system)`);
  ok(stripDtcgGroupExt(baseExports.dtcg) === stripDtcgGroupExt(sameDefaultsExports.dtcg), `export format "dtcg" must stay byte-identical (net of the RP-1 raw-file $extensions) when a palette moves between two groups sharing the same baseIntensity/primeChroma default (brand <-> system)`);
  ok(stripRawFileGroupExt(baseExports.figma.raw) === stripRawFileGroupExt(sameDefaultsExports.figma.raw), "the Figma DTCG raw file must stay byte-identical (net of the RP-1 $extensions) for a brand <-> system group swap");
  ok(baseExports.figma.light === sameDefaultsExports.figma.light && baseExports.figma.dark === sameDefaultsExports.figma.dark, "the Figma DTCG semantic (Light/Dark) files must stay strictly byte-identical for a brand <-> system group swap — RP-1 never touches the theme files");

  // the DS bundle (ds-export.js — Claude Design/Stitch/Figma Make, split out at TKT-0015, NOT one
  // of the 10 documented formats above) and the MCP brandKit() payload get the same coverage, with
  // the same fixed opts.date so the comparison is deterministic.
  const dsOpts = { date: "2026-01-01" };
  // exportDesignSystemBundle is the Claude Design profile (DESIGN.md/tokens.json/components/
  // README) — RP-1's familiesByGroup/Group-column additions live ONLY in the Figma Make profile's
  // foundations/color.md (not part of this bundle), so this stays strictly byte-identical.
  const baseDs = exportDesignSystemBundle(dsDocOf(base), typeScaleFor(base, "base"), geomScaleFor(base, "base"), dsOpts);
  const sameDefaultsDs = exportDesignSystemBundle(dsDocOf(sameDefaults), typeScaleFor(sameDefaults, "base"), geomScaleFor(sameDefaults, "base"), dsOpts);
  ok(JSON.stringify(baseDs) === JSON.stringify(sameDefaultsDs), "the DS bundle (ds-export.js) must stay byte-identical for a brand <-> system group swap");
  ok(stripBrandKitGroup(brandKit(base)) === stripBrandKitGroup(brandKit(sameDefaults)), "the MCP brandKit() payload must stay byte-identical (net of the RP-1 `group` field) for a brand <-> system group swap");

  // moving Neutral out of Material (default 30/60) into Brand (default 100/100) MUST move the
  // export bytes on EVERY surface — proves ticket #559's group layer actually reaches every
  // export/DS-bundle/MCP output, not just the UI.
  const neutralToBrand = defaultDocument();
  neutralToBrand.palettes = neutralToBrand.palettes.map((p) => (p.name === "Neutral" ? { ...p, group: "brand" } : p));
  const neutralToBrandExports = projectView(neutralToBrand).exports;
  ok(baseExports.css !== neutralToBrandExports.css, "moving Neutral out of Material (30/60) into Brand (100/100) must change the CSS export bytes (ticket #559)");
  const neutralToBrandDs = exportDesignSystemBundle(dsDocOf(neutralToBrand), typeScaleFor(neutralToBrand, "base"), geomScaleFor(neutralToBrand, "base"), dsOpts);
  ok(JSON.stringify(baseDs) !== JSON.stringify(neutralToBrandDs), "moving Neutral out of Material into Brand must also change the DS bundle bytes");
  ok(JSON.stringify(brandKit(base)) !== JSON.stringify(brandKit(neutralToBrand)), "moving Neutral out of Material into Brand must also change the MCP brandKit() payload");
}

// ── U2 (#637): radixKeyCollision(name) + RADIX_COLLISION_BADGE (I4/I5/OQ-3) ────────────────
{
  for (const k of RESERVED_ALIAS_KEYS) {
    ok(radixKeyCollision(k) === true, `radixKeyCollision(${JSON.stringify(k)}) must be true (reserved alias key)`);
  }
  ok(radixKeyCollision("Accent") === true, `radixKeyCollision("Accent") must be true (case-insensitive via slug)`);
  ok(radixKeyCollision("Gray") === true, `radixKeyCollision("Gray") must be true (case-insensitive via slug)`);
  ok(radixKeyCollision("accent-muted") === false, `radixKeyCollision("accent-muted") must be false (real, non-colliding palette name)`);
  ok(radixKeyCollision("primary") === false, `radixKeyCollision("primary") must be false (real, non-colliding palette name)`);

  const modelSrc = readFileSync(fileURLToPath(new URL("../../src/ui/model.mjs", import.meta.url)), "utf8");
  const slugDeclCount = (modelSrc.match(/^export function slug/gm) || []).length;
  ok(slugDeclCount === 1, `src/ui/model.mjs must declare "export function slug" exactly once (got ${slugDeclCount}) — radixKeyCollision must reuse it, never redeclare`);

  ok(RADIX_COLLISION_BADGE === "Exported as", `RADIX_COLLISION_BADGE must be the pinned #630 prefix verbatim, got ${JSON.stringify(RADIX_COLLISION_BADGE)}`);
  ok(radixCollisionBadge("accent-palette") === "Exported as accent-palette", `radixCollisionBadge("accent-palette") must read "Exported as accent-palette", got ${JSON.stringify(radixCollisionBadge("accent-palette"))}`);

  // radixExportKey (#630): the UI's key for a palette is the ENGINE's radixPaletteKey, so the canvas
  // note and the exported key cannot drift.
  const pals = [{ name: "Neutral", on: true }, { name: "Accent", on: true }, { name: "Primary", on: true }];
  ok(radixExportKey("Accent", pals) === "accent-palette", `radixExportKey("Accent") must be "accent-palette", got ${JSON.stringify(radixExportKey("Accent", pals))}`);
  ok(radixExportKey("Primary", pals) === "primary", `radixExportKey("Primary") must pass through as "primary"`);
  const withSuffix = [...pals, { name: "accent-palette", on: true }];
  ok(radixExportKey("Accent", withSuffix) === "accent-palette-palette", `radixExportKey("Accent") next to an "accent-palette" palette must be "accent-palette-palette"`);
  ok(radixExportKey("accent-palette", withSuffix) === "accent-palette", `radixExportKey("accent-palette") must keep its own slug`);
  const mjDoc = defaultDocument();
  mjDoc.palettes = [...mjDoc.palettes, { ...mjDoc.palettes[0], name: "Accent" }];
  const mjColors = projectView(mjDoc).radixPreset.theme.extend.semanticTokens.colors;
  ok(!!mjColors[radixExportKey("Accent", mjDoc.palettes)] && !!mjColors[radixExportKey("Accent", mjDoc.palettes)]["12"], `projectView(...).radixPreset must carry the colliding palette's ladder under radixExportKey(...)`);
}

// ── U3 (#637): projectView(...).radixPreset — the hoisted OBJECT (OQ-1) ────────────────────
{
  const doc = defaultDocument();
  const view = projectView(doc);
  ok(typeof view.radixPreset === "object" && view.radixPreset !== null, `projectView(defaultDocument()).radixPreset must be an object, got ${typeof view.radixPreset}`);
  if (view.radixPreset && typeof view.radixPreset === "object") {
    const colors = view.radixPreset.theme.extend.semanticTokens.colors;
    // review round 1, F5: expressed through radixExportKey so the assertion cannot drift from the
    // engine's key rule (for the default document every key is the raw slug).
    for (const p of doc.palettes.filter((p) => p.on !== false)) {
      const k = radixExportKey(p.name, doc.palettes);
      ok(Object.prototype.hasOwnProperty.call(colors, k), `radixPreset.theme.extend.semanticTokens.colors is missing enabled palette "${p.name}" under radixExportKey(...) = "${k}"`);
    }
  }

  // Self-consistency: projectView(doc).exports.radix === exportRadixModule(projectView(doc).radixPreset)
  for (const [label, d] of [["defaultDocument()", defaultDocument()], ["a brand-preset document", hydrate(BRAND_PRESETS[0])]]) {
    const v = projectView(d);
    ok(v.exports.radix === exportRadixModule(v.radixPreset), `self-consistency failed for ${label}: projectView(doc).exports.radix !== exportRadixModule(projectView(doc).radixPreset)`);
  }

  // Data-palette-only document -> the I9 sentinel reaches the UI intact (radixPreset is a string).
  const dataOnly = defaultDocument();
  dataOnly.palettes = dataOnly.palettes.map((p) => (isDataPalette(p) ? p : { ...p, on: false }));
  ok(typeof projectView(dataOnly).radixPreset === "string", `a data-palette-only document must yield a STRING radixPreset (I9 sentinel), got ${typeof projectView(dataOnly).radixPreset}`);

  // The direct gate for the { geometry: shadGeom } opt: theme.extend.tokens.radii carries exactly
  // none/xs/sm/md/lg/xl/full — a bare exportRadix(doc) (no opts) omits `tokens` entirely.
  const radii = view.radixPreset && view.radixPreset.theme.extend.tokens && view.radixPreset.theme.extend.tokens.radii;
  ok(!!radii, `projectView(defaultDocument()).radixPreset.theme.extend.tokens.radii must be present (the geometry opt must travel with the hoist)`);
  if (radii) {
    const wantKeys = ["none", "xs", "sm", "md", "lg", "xl", "full"];
    ok(JSON.stringify(Object.keys(radii)) === JSON.stringify(wantKeys), `radixPreset.theme.extend.tokens.radii keys = ${JSON.stringify(Object.keys(radii))}, want ${JSON.stringify(wantKeys)}`);
  }
}

if (fails.length) { console.error(`model FAIL (${fails.length}):\n  ` + fails.join("\n  ")); process.exit(1); }
console.log("model PASS: mintDataPalettes + rederiveDataHues hold their REQ-020..024 contracts directly (mint shape, chroma threshold, EX-5 reproduction, re-derive scope/no-op/order); paletteGroup's default-by-name rule + explicit override + export byte-identity (ticket #556) hold too");
process.exit(0);
