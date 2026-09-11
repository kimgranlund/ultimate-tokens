#!/usr/bin/env node
// model.mjs — direct unit coverage for src/ui/model.mjs's data-palette functions: mintDataPalettes
// and rederiveDataHues (added by U6/#515). An independent review of #525 flagged that these two
// functions — plus the private brandHuesOf/isDataSlug helpers they lean on — shipped with ZERO
// direct test coverage: nothing called them until U8 (#517) wired UI buttons to them, and even
// then test/ui/headless-boot.mjs's (dpa) group only exercises them THROUGH button clicks. This
// file imports and calls them directly, pure, no DOM — covering SPEC
// docs/spec/spec-muted-base-key-spikes.md REQ-020..024 at the model layer.
import { mintDataPalettes, rederiveDataHues, slug } from "../../src/ui/model.mjs";
import { deriveDataHues } from "../../src/engine/data-hues.mjs";

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

if (fails.length) { console.error(`model FAIL (${fails.length}):\n  ` + fails.join("\n  ")); process.exit(1); }
console.log("model PASS: mintDataPalettes + rederiveDataHues hold their REQ-020..024 contracts directly (mint shape, chroma threshold, EX-5 reproduction, re-derive scope/no-op/order)");
process.exit(0);
