#!/usr/bin/env node
// curated-contrast.mjs, a FLAT WCAG AA FLOOR over the curated corpus: every shipped preset's accent
// must read against its own on-color at 4.5:1, in both schemes (#674).
//
// WHY THIS FILE EXISTS. `hpg-role-contrast` (test/engine/semantic.mjs) pins the accent/on-color pair
// on the DEFAULT document only. #647 wired `skew`/`lift` into the perceptual ramp and retuned `lift`
// on src/ui/model.mjs's DEFAULT_PALETTES, the default document, while every curated preset kept its
// stored controls and took the ramp change unretuned. Adia's Warning fell 3.22 -> 2.19 in the dark
// scheme and nothing was watching. This gate watches.
//
// WHAT IS ENUMERATED. Eight category specs live in docs/reference/colors/categories/*.json:
// architecture, brands, cuisine, film, literature, music, nature, travel. ALL EIGHT build to FULL
// documents, none is swatch-only. scripts/gen-categories.mjs (run by `npm test` through
// `gen:categories`) turns each spec into src/ui/categories/<slug>.js `PRESETS`, and every preset
// carries the whole document control surface (curve/damp/toneMode/accentRef/onColorMode/lmin/lmax/…
// plus `palettes`), so `presetDoc(preset)` (hydrate, pinned to the latest layers as the app opens a
// preset) is a real document and `derivedAll(doc)` is the production
// role ladder, the same call exportRadix makes (`const palettes = derived || derivedAll(state)`
// in src/engine/exports.js's exportRadix) and the same one `projectView(...).exports`
// drives. 343 documents, 3780 palettes, 7560 accent/on-color cells per tone mode, 22680 across the
// three modes this gate holds.
//
// Of the 343, ONE is additionally shipped as a committed KIT artifact: the Adia document in
// brands.json, exported by scripts/gen-adia-derived-exports.mjs into docs/reference/data/
// adia-{oklch,radix}-export.*.
//
// THE PAIRS, both scored with src/ui/model.mjs's own `contrastRatio`, per palette and scheme:
//   ROLE  the ACCENT role (suffix "", 550 light / 450 dark under accentRef "mode") against its
//         ON-COLOR role, the `-on-<slug>` suffix, read off `derivedAll`.
//   RADIX the Radix preset's own Park-UI `solid.bg` / `solid.fg` pair, `ref("9")` / `ref("on-accent")`
//         in exports.js's radixColorGroup, which the #636 measurement traced. Since ADR-038 (T-0047)
//         step 9 is the palette's PRIME swatch and `on-accent` is the on-color policy's pick against
//         that prime, no longer the role pair above, so the two leaves are read out of exportRadix's
//         emitted preset (fed the same `derivedAll` result, so no second derivation) and parsed with
//         okhsl.js's oklchToRgb.
// Citations here name symbols, not line numbers: scripts/audit-citations.mjs walks docs/** only, so
// nothing re-checks a line number in a test file.
//
// THE FLOOR IS FLAT, AND THE TABLES ARE EMPTY ON PURPOSE. Before #662 this gate carried 101 named
// brands.json carve-outs and a per-category miss count, because 5228 of the 7560 cells were under
// 4.5. #662 made `onColorMode: "contrast"` the default and added the achromatic fall-through, which
// cleared EVERY cell. So the expectation is now simply "nothing is under AA": `EXPECTED_BELOW` is
// empty and every `EXPECTED_GALLERY` row is `{ under: 0, worst: 4.50 }`.
// The carve-out MECHANISM is kept, not deleted, a future miss has to be written down by name, with
// its measured ratio, by whoever introduces it. On the identity tier that naming is enforced in both
// scopes; on the gallery tier the recorded count is exact under --full and an UPPER BOUND when
// sampled, since a miss recorded for the corpus may sit outside the picked volume.
//
// ALL THREE TONE MODES ARE GATED (owner ruling, 2026-09-18). Every curated document SHIPS
// `toneMode: "perceptual"`, but the mode is a live control: a user opens a preset, flips it, and
// whatever they export has to stay AA. So each document is measured three times, once under each of
// `perceptual`, `peak` and `even`, by overriding `toneMode` on the hydrated document and re-deriving.
// `peak` is no longer treated as the unsuitable one, before #662 it was the worst of the three, and
// #662's achromatic fall-through closed it; test/engine/semantic.mjs's own role-contrast gate made the
// same widening on the default document. MODES is checked against the engine's own
// DOMAINS.toneMode.values, so a tone mode added to the engine reds this gate before any preset has
// adopted it, that, not the per-document check below, is what keeps a mode from shipping ungated.
//
// TWO SCOPES, because the full sweep is the slow one and `npm test` is around a minute. Durations
// here are HOST-SENSITIVE and should be read as a band, not a budget: on this dev host the full sweep
// measured 17-27 s and the sampled leg 4.4-9.3 s across several rounds at load average 4-25, and a
// same-host A/B against the pre-widening gate ran 18.4 s full / 5.0 s sampled, so tripling the
// derivation is nearly free, because parsing the ~240 KB category mirrors dominates both. Treat CI's
// own `corpus-contrast` job as the measurement of record.
//   SAMPLED (default, what `npm test` runs): brands.json IN FULL, per cell, it is the identity tier
//     and the only tier shipping a committed kit artifact, plus ONE VOLUME per gallery category.
//     35 documents x 3 tone modes = 2352 cells.
//   FULL (`--full`, what `npm run gate:corpus-contrast` runs, and CI's own job): all 343 documents
//     x 3 tone modes = 22680 cells.
// The pick is DETERMINISTIC and lives in one shared place now: lib/corpus-sample.mjs's `pickVolume`,
// sorting each category's volume list before hashing so the pick does not move with load order
// (#686, #713 U1: the un-sorted picker this file used to carry picked a different volume in 7 of 7
// gallery categories once a category's `PRESETS` array was reversed). Bumping SAMPLE_SEED there
// rotates the whole sample deliberately. The sampled tier is a canary, not the gate of record; the
// full sweep in CI is what actually covers the corpus.
import { derivedAll, exportRadix, isDataPalette, radixPaletteKeys } from "../../src/engine/exports.js";
import { oklchToRgb } from "../../src/engine/okhsl.js";
import { contrastRatio } from "../../src/ui/model.mjs";
import { presetDoc, DOMAINS } from "../../src/ui/persist.js";
import { gateReport } from "../gate-report.mjs";
import { pickVolume, SAMPLE_SEED } from "./lib/corpus-sample.mjs";

const FULL = process.argv.includes("--full");
const fails = [];
const FAIL = (g, m) => { fails.push(`${g}: ${m}`); };
const AA = 4.5;
const CATS = ["architecture", "brands", "cuisine", "film", "literature", "music", "nature", "travel"];
// every tone mode the engine offers. The floor holds in all three. This list is checked AGAINST
// DOMAINS.toneMode.values below, not just against its own length, the engine gaining a mode is the
// change that matters, and a preset adopting it comes later, if ever.
const MODES = ["perceptual", "peak", "even"];
const IDENTITY = "brands";             // always measured in full, in both SCOPES (sampled and full)
const docKey = (name) => String(name).split(" · ")[0];

// ── brands.json cells BELOW the floor, named one per line with the measured ratio. Empty since #662.
//    Key is `<document>|<palette>|<scheme>|<toneMode>`, so a miss is pinned to the one tone mode it
//    happens in. A new miss goes here with its number, or the gate stays red, never widened silently.
const EXPECTED_BELOW = {};

// ── per gallery category: cells under the floor, and the worst ratio seen. Both numbers describe the
//    FULL corpus, and the two scopes read them differently, because a sample sees a subset:
//      FULL     `under` is EXACT, a miss written down here must still be there, and no other.
//      SAMPLED  `under` is an UPPER BOUND, more misses than the corpus is allowed is a regression,
//               fewer only means the recorded miss sits outside the picked volume. Anything else
//               would false-red `npm test` the moment a future miss puts a non-zero `under` here.
//    `worst` is a floor in BOTH scopes: a subset's worst can only be >= the full corpus's worst.
const EXPECTED_GALLERY = {
  architecture: { under: 0, worst: 4.50 },
  cuisine:      { under: 0, worst: 4.50 },
  film:         { under: 0, worst: 4.50 },
  literature:   { under: 0, worst: 4.50 },
  music:        { under: 0, worst: 4.50 },
  nature:       { under: 0, worst: 4.50 },
  travel:       { under: 0, worst: 4.50 },
};

// ── measure ───────────────────────────────────────────────────────────────────────────────────
const seen = new Set();
const identityDocs = new Set();
const sampled = {};                    // category -> the volume this run picked
let docsMeasured = 0, cellsMeasured = 0, identityCells = 0, liftSkew = 0, palettes = 0;
let worst = Infinity, worstAt = "";
// the RADIX pair (ADR-038): its own flat floor, no carve-out table, every miss is named (capped) and counted.
const radix = { cells: 0, under: 0, named: 0, worst: Infinity, worstAt: "" };
const leafRgb = (s) => { const m = /^oklch\(([-\d.]+) ([-\d.]+) ([-\d.]+)\)$/.exec(s); return m ? oklchToRgb(Number(m[1]), Number(m[2]), Number(m[3])) : null; };
const perMode = Object.fromEntries(MODES.map((m) => [m, { cells: 0, under: 0, worst: Infinity, worstAt: "" }]));
const gallery = {};

for (const cat of CATS) {
  const { PRESETS } = await import(`../../src/ui/categories/${cat}.js`);
  if (!Array.isArray(PRESETS) || !PRESETS.length) { FAIL("corpus", `category "${cat}" exposed no PRESETS, gen:categories did not run, or the mirror moved`); continue; }
  let docs = PRESETS;
  if (!FULL && cat !== IDENTITY) {
    const vol = pickVolume(cat, PRESETS);
    if (vol === undefined) { FAIL("sample", `category "${cat}": a preset carries no \`vol\`, so the volume sample cannot be taken, run --full or fix the mirror`); continue; }
    sampled[cat] = vol;
    docs = PRESETS.filter((p) => p.vol === vol);
    if (!docs.length) FAIL("sample", `category "${cat}": volume ${vol} selected but matched no preset`);
  }
  const g = cat === IDENTITY ? null : (gallery[cat] = { cells: 0, under: 0, worst: Infinity, worstAt: "", named: 0 });
  for (const preset of docs) {
    const doc = presetDoc(preset);
    docsMeasured++;
    const key = docKey(preset.name);
    if (cat === IDENTITY) {
      if (identityDocs.has(key)) FAIL("corpus", `two brands.json presets share the document key "${key}", the EXPECTED_BELOW keys would collide`);
      identityDocs.add(key);
    }
    for (const p of doc.palettes || []) { palettes++; if (p.lift || p.skew) liftSkew++; }
    // A document's own stored mode. `hydrate` already clamps this through DOMAINS.toneMode.values
    // (src/ui/persist.js), so this can only fire for a mode the ENGINE offers and MODES omits, the
    // same condition the MODES-vs-DOMAINS guard catches, arriving by the slower route. Kept because
    // it names the document, which that guard cannot.
    if (doc.toneMode && !MODES.includes(doc.toneMode))
      FAIL("modes", `${cat} "${preset.name}" ships toneMode ${JSON.stringify(doc.toneMode)}, which this gate does not measure, add it to MODES`);
    for (const mode of MODES) {
    const modeDoc = { ...doc, toneMode: mode };
    const derived = derivedAll(modeDoc);
    // the RADIX pair: step 9 (the prime) against on-accent, out of the emitted preset, both schemes.
    const rx = exportRadix(modeDoc, {}, derived);
    const rxKeys = radixPaletteKeys(derived.map((p) => p.n));
    derived.forEach((p, i) => {
      const g = typeof rx === "object" ? rx.theme.extend.semanticTokens.colors[rxKeys[i]] : null;
      if (!g || !g["9"] || !g["on-accent"]) { FAIL("radix", `${cat} "${preset.name}" ${p.n} (${mode}): no step 9 / on-accent leaf in the Radix preset`); return; }
      for (const [scheme, leaf] of [["light", "base"], ["dark", "_dark"]]) {
        const bg = leafRgb(g["9"].value[leaf]), fg = leafRgb(g["on-accent"].value[leaf]);
        const ratio = bg && fg ? contrastRatio(fg, bg) : 0;
        radix.cells++;
        if (ratio < radix.worst) { radix.worst = ratio; radix.worstAt = `${cat} "${preset.name}" ${p.n}/${scheme} (${mode})`; }
        if (ratio < AA) {
          radix.under++;
          if (radix.named < 5) { radix.named++; FAIL("radix", `${cat} / ${p.n} / ${scheme} / ${mode}: Radix solid.fg ${g["on-accent"].value[leaf]} on solid.bg (step 9) ${g["9"].value[leaf]} is ${ratio.toFixed(3)}:1, under the ${AA} floor (ADR-038)`); }
        }
      }
    });
    for (const p of derived) {
      const accent = p.roles.find((x) => x.suffix === "");
      const on = p.roles.find((x) => x.suffix === `-on-${p.n}`);
      // a missing end is a SKIPPED cell, which is how a gate goes quietly vacuous, name it instead.
      if (!accent || !on) { FAIL("pair", `${cat} "${preset.name}" ${p.n} (${mode}): no ${accent ? "on-color" : "accent"} role on the derived palette, the role ladder moved`); continue; }
      for (const scheme of ["light", "dark"]) {
        const ratio = contrastRatio(on[scheme].rgb, accent[scheme].rgb);
        cellsMeasured++;
        if (ratio < worst) { worst = ratio; worstAt = `${cat} "${preset.name}" ${p.n}/${scheme} (${mode})`; }
        const pm = perMode[mode];
        pm.cells++;
        if (ratio < AA) pm.under++;
        if (ratio < pm.worst) { pm.worst = ratio; pm.worstAt = `${cat} "${preset.name}" ${p.n}/${scheme}`; }
        if (cat === IDENTITY) {
          identityCells++;
          const k = `${key}|${p.n}|${scheme}|${mode}`;
          const floor = EXPECTED_BELOW[k];
          if (floor !== undefined) seen.add(k);
          if (ratio >= AA) {
            if (floor !== undefined)
              FAIL("identity", `${k} now measures ${ratio.toFixed(3)}, clear of ${AA}, delete its EXPECTED_BELOW row in the same change that fixed it`);
          } else if (floor === undefined) {
            FAIL("identity", `brands.json / ${key} / ${p.n} / ${scheme} / ${mode}: accent ${accent[scheme].hex} on on-color ${on[scheme].hex} is ${ratio.toFixed(3)}:1, under the ${AA} floor, and carries no EXPECTED_BELOW row${isDataPalette(p) ? " (data palette)" : ""}`);
          } else if (ratio < floor) {
            FAIL("identity", `brands.json / ${key} / ${p.n} / ${scheme} / ${mode}: ${ratio.toFixed(3)}:1 slid below its recorded floor ${floor.toFixed(1)}, a curated preset moved`);
          }
        } else {
          g.cells++;
          if (ratio < g.worst) { g.worst = ratio; g.worstAt = `"${preset.name}" ${p.n}/${scheme}`; }
          if (ratio < AA) {
            g.under++;
            // name the offending cells, but cap per category: a mechanism regression can put
            // thousands under the floor and a 5000-line dump helps nobody. The count below is exact.
            if (g.named < 5) { g.named++; FAIL("gallery", `${cat} / ${preset.name} / ${p.n} / ${scheme} / ${mode}: accent ${accent[scheme].hex} on on-color ${on[scheme].hex} is ${ratio.toFixed(3)}:1, under the ${AA} floor`); }
          }
        }
      }
    }
    }
  }
}

// ── the per-category ratchet ──────────────────────────────────────────────────────────────────
for (const cat of Object.keys(gallery)) {
  const exp = EXPECTED_GALLERY[cat];
  if (!exp) { FAIL("gallery", `category "${cat}" has no EXPECTED_GALLERY entry, a new gallery category must declare its accent/on-color standing`); continue; }
  const g = gallery[cat];
  const more = g.named < g.under ? ` (${g.under - g.named} more not named above)` : "";
  if (FULL ? g.under !== exp.under : g.under > exp.under)
    FAIL("gallery", `${cat}: ${g.under} of ${g.cells} accent/on-color cells are under ${AA}, expected ${FULL ? `${exp.under}` : `at most ${exp.under} (SAMPLED reads the recorded count as an upper bound; run --full for the exact check)`}${more}`);
  if (g.worst < exp.worst)
    FAIL("gallery", `${cat}: worst accent/on-color contrast is ${g.worst.toFixed(3)}:1 at ${g.worstAt}, below the ${exp.worst} floor this category is held to`);
}
for (const cat of Object.keys(EXPECTED_GALLERY)) if (!gallery[cat]) FAIL("gallery", `EXPECTED_GALLERY names "${cat}", which the corpus no longer has`);

// ── the RADIX pair's flat floor: the policy picks on-accent against the prime itself, and its
//    white/black fall-through clears AA against any opaque fill, so nothing may sit under it.
if (radix.under) FAIL("radix", `${radix.under} of ${radix.cells} Radix solid.fg/solid.bg cells are under ${AA}, worst ${radix.worst.toFixed(3)}:1 at ${radix.worstAt}`);

// ── stale carve-out rows: a key nothing visited is a lie about the corpus ──────────────────────
for (const k of Object.keys(EXPECTED_BELOW))
  if (!seen.has(k)) FAIL("identity", `EXPECTED_BELOW row "${k}" matched no cell, the palette was renamed or removed; delete or repoint the row`);

// ── VACUITY GUARD: the gate is only worth its runtime if it measured what it claims to ─────────
const WANT = FULL ? { docs: 340, cells: 22500 } : { docs: 34, cells: 2280 };   // documents x palettes x 2 schemes x 3 tone modes
if (docsMeasured < WANT.docs) FAIL("vacuity", `only ${docsMeasured} curated documents measured in ${FULL ? "FULL" : "SAMPLED"} scope, expected at least ${WANT.docs}, the corpus shrank or an import failed silently`);
if (cellsMeasured < WANT.cells) FAIL("vacuity", `only ${cellsMeasured} accent/on-color cells measured in ${FULL ? "FULL" : "SAMPLED"} scope, expected at least ${WANT.cells}`);
if (radix.cells !== cellsMeasured) FAIL("vacuity", `the Radix leg measured ${radix.cells} solid.fg/solid.bg cells, but the role leg measured ${cellsMeasured}, the two legs did not see the same palettes`);
if (identityCells < 480) FAIL("vacuity", `only ${identityCells} brands.json cells measured, expected 504 (168 per tone mode), the identity tier runs in full in BOTH scopes`);
{
  // THE guard that makes "no tone mode ships ungated" true: MODES against the engine's own enum
  // (src/ui/persist.js DOMAINS.toneMode.values), not against a hand-written count. Adding a mode to
  // the engine and nothing else must red HERE, before any preset has adopted it.
  const engineModes = DOMAINS.toneMode.values;
  if (engineModes.length !== MODES.length || engineModes.some((m) => !MODES.includes(m)))
    FAIL("modes", `the engine offers tone modes [${engineModes.join(", ")}] but this gate measures [${MODES.join(", ")}], a mode would ship ungated; add it to MODES`);
}
for (const m of MODES) {
  // every mode must have measured the SAME cells, a mode silently deriving nothing is the other way
  // this gate goes vacuous, and it would look like a pass.
  if (!perMode[m].cells) FAIL("vacuity", `tone mode "${m}" measured no cells at all`);
  else if (perMode[m].cells !== perMode[MODES[0]].cells) FAIL("vacuity", `tone mode "${m}" measured ${perMode[m].cells} cells, but "${MODES[0]}" measured ${perMode[MODES[0]].cells}, the modes did not see the same corpus`);
}
if (identityDocs.size !== 7) FAIL("vacuity", `brands.json exposed ${identityDocs.size} documents, expected 7`);
if (!FULL && Object.keys(sampled).length !== CATS.length - 1)
  FAIL("vacuity", `sampled ${Object.keys(sampled).length} gallery categories, expected ${CATS.length - 1}, a category was skipped, not measured`);

// ── REPORT ────────────────────────────────────────────────────────────────────────────────────
// The printed set is this declared list UNION every gate name that actually reached a FAIL(...)
// call (#699, following #695's pattern in test/engine/tonal.mjs), so a gate missing from the list
// below still shows up, loudly, instead of hiding behind a neighbouring gate's "pass" row.
const DECLARED = ["corpus", "sample", "modes", "pair", "identity", "gallery", "radix", "vacuity", "report-static"];
gateReport({ fails, declared: DECLARED, selfUrl: import.meta.url, FAIL });
console.log(`  (${FULL ? "FULL" : `SAMPLED seed ${SAMPLE_SEED}, volumes ` + CATS.filter((c) => c !== IDENTITY).map((c) => `${c} ${sampled[c]}`).join(", ")})`);
console.log(`  (${docsMeasured} curated documents, ${palettes} palettes (${liftSkew} carrying a non-zero lift or skew), ${cellsMeasured} accent/on-color cells; ${identityCells} named per cell, ${Object.keys(EXPECTED_BELOW).length} carried below ${AA})`);
for (const m of MODES) {
  const pm = perMode[m];
  console.log(`  (${m.padEnd(10)} ${String(pm.cells).padStart(6)} cells, ${pm.under} under ${AA}, worst ${Number.isFinite(pm.worst) ? pm.worst.toFixed(3) : "n/a"}:1 at ${pm.worstAt || "n/a"})`);
}
console.log(`  (radix      ${String(radix.cells).padStart(6)} cells, ${radix.under} under ${AA}, worst ${Number.isFinite(radix.worst) ? radix.worst.toFixed(3) : "n/a"}:1 at ${radix.worstAt || "n/a"}, solid.fg on step 9, ADR-038)`);
console.log(`  (worst overall ${Number.isFinite(worst) ? worst.toFixed(3) : "n/a"}:1 at ${worstAt || "n/a"})`);
if (fails.length) {
  console.error(`\n${fails.length} gate failure(s):`);
  for (const f of fails) console.error(`  - ${f}`);
  console.error(`\nFAIL: ${fails.length} gate failure(s)`);
  process.exit(1);
}
console.log(`\nPASS: every measured curated preset's accent clears ${AA}:1 against its own on-color, and every Radix solid.fg clears it on step 9`);
process.exit(0);
