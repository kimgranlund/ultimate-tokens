#!/usr/bin/env node
// curated-contrast.mjs — a FLAT WCAG AA FLOOR over the curated corpus: every shipped preset's accent
// must read against its own on-color at 4.5:1, in both schemes (#674).
//
// WHY THIS FILE EXISTS. `hpg-role-contrast` (test/engine/semantic.mjs) pins the accent/on-color pair
// on the DEFAULT document only. #647 wired `skew`/`lift` into the perceptual ramp and retuned `lift`
// on src/ui/model.mjs's DEFAULT_PALETTES — the default document — while every curated preset kept its
// stored controls and took the ramp change unretuned. Adia's Warning fell 3.22 -> 2.19 in the dark
// scheme and nothing was watching. This gate watches.
//
// WHAT IS ENUMERATED. Eight category specs live in docs/reference/colors/categories/*.json:
// architecture, brands, cuisine, film, literature, music, nature, travel. ALL EIGHT build to FULL
// documents — none is swatch-only. scripts/gen-categories.mjs (run by `npm test` through
// `gen:categories`) turns each spec into src/ui/categories/<slug>.js `PRESETS`, and every preset
// carries the whole document control surface (curve/damp/toneMode/accentRef/onColorMode/lmin/lmax/…
// plus `palettes`), so `hydrate(preset)` is a real document and `derivedAll(doc)` is the production
// role ladder — the same call exportRadix makes (`const palettes = derivedAll(state)`,
// src/engine/exports.js:1236; derivedAll itself at :371) and the same one `projectView(...).exports`
// drives. 343 documents, 3780 palettes, 7560 accent/on-color cells.
//
// Of the 343, ONE is additionally shipped as a committed KIT artifact: the Adia document in
// brands.json, exported by scripts/gen-adia-derived-exports.mjs into docs/reference/data/
// adia-{oklch,radix}-export.*.
//
// THE PAIR. Per palette: the ACCENT role — `{ step: 9, suffix: "" }`, exports.js:1075, resolving 550
// light / 450 dark under accentRef "mode" — against its ON-COLOR role, the `-on-<slug>` suffix that
// exports.js:1225 looks up. Read off `derivedAll` and scored with src/ui/model.mjs's own
// `contrastRatio`. Identical to the Park-UI `solid.bg` / `solid.fg` pair, `ref("9")` / `ref("on-accent")`
// at exports.js:1201-1202, that the #636 measurement traced.
//
// Those four line numbers are pinned against #662's ae7f75d, which shifted exports.js by nine lines
// from bda9584. scripts/audit-citations.mjs walks docs/** only, so nothing re-checks a citation in a
// test file — anyone moving exports.js re-checks these by hand, against the quoted source text.
//
// THE FLOOR IS FLAT, AND THE TABLES ARE EMPTY ON PURPOSE. Before #662 this gate carried 101 named
// brands.json carve-outs and a per-category miss count, because 5228 of the 7560 cells were under
// 4.5. #662 made `onColorMode: "contrast"` the default and added the achromatic fall-through, which
// cleared EVERY cell: 0 under 4.5, worst 4.502. So the expectation is now simply "nothing is under
// AA": `EXPECTED_BELOW` is empty and every `EXPECTED_GALLERY` row is `{ under: 0, worst: 4.50 }`.
// The carve-out MECHANISM is kept, not deleted — a future miss has to be written down by name, with
// its measured ratio, by whoever introduces it. On the identity tier that naming is enforced in both
// modes; on the gallery tier the recorded count is exact under --full and an UPPER BOUND when
// sampled, since a miss recorded for the corpus may sit outside the picked volume.
//
// TWO MODES, because the full sweep costs 12 s and `npm test` is around a minute. Both figures below
// are the MEASURED median of five runs on the dev host this was built on; the sampled leg is stable
// to ~50 ms, the full leg is load-sensitive (10.6 to 17.2 s observed across those five). Every other
// place that quotes these durations — .github/workflows/ci.yml's corpus-contrast job and
// .sdlc/adapter.md section 1 — quotes these same two numbers.
//   SAMPLED (default, what `npm test` runs): brands.json IN FULL, per cell — it is the identity tier
//     and the only tier shipping a committed kit artifact — plus ONE VOLUME per gallery category.
//     35 documents, 784 cells, 2.5 s.
//   FULL (`--full`, what `npm run gate:corpus-contrast` runs, and CI's own job): all 343 documents,
//     7560 cells, 12 s.
// The pick is DETERMINISTIC: volume index = FNV-1a("<category>#<SAMPLE_SEED>") % volumeCount, so the
// same volume is chosen on every run and on every machine, and the sample is NOT "volume I
// everywhere" — each category canaries a different part of its gallery. Bumping SAMPLE_SEED rotates
// the whole sample deliberately. The sampled tier is a canary, not the gate of record; the full sweep
// in CI is what actually covers the corpus.
import { derivedAll, isDataPalette } from "../../src/engine/exports.js";
import { contrastRatio } from "../../src/ui/model.mjs";
import { hydrate } from "../../src/ui/persist.js";

const FULL = process.argv.includes("--full");
const SAMPLE_SEED = 0;                 // bump to rotate every category's sampled volume
const fails = [];
const FAIL = (g, m) => { fails.push(`${g}: ${m}`); };
const AA = 4.5;
const CATS = ["architecture", "brands", "cuisine", "film", "literature", "music", "nature", "travel"];
const IDENTITY = "brands";             // always measured in full, in both modes
const docKey = (name) => String(name).split(" · ")[0];
const fnv1a = (s) => { let h = 0x811c9dc5; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h; };
const pickVolume = (cat, vols) => vols[fnv1a(`${cat}#${SAMPLE_SEED}`) % vols.length];

// ── brands.json cells BELOW the floor, named one per line with the measured ratio. Empty since #662.
//    A new miss goes here with its number, or the gate stays red — it is never widened silently.
const EXPECTED_BELOW = {};

// ── per gallery category: cells under the floor, and the worst ratio seen. Both numbers describe the
//    FULL corpus, and the two modes read them differently, because a sample sees a subset:
//      FULL     `under` is EXACT — a miss written down here must still be there, and no other.
//      SAMPLED  `under` is an UPPER BOUND — more misses than the corpus is allowed is a regression,
//               fewer only means the recorded miss sits outside the picked volume. Anything else
//               would false-red `npm test` the moment a future miss puts a non-zero `under` here.
//    `worst` is a floor in BOTH modes: a subset's worst can only be >= the full corpus's worst.
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
const gallery = {};

for (const cat of CATS) {
  const { PRESETS } = await import(`../../src/ui/categories/${cat}.js`);
  if (!Array.isArray(PRESETS) || !PRESETS.length) { FAIL("corpus", `category "${cat}" exposed no PRESETS — gen:categories did not run, or the mirror moved`); continue; }
  let docs = PRESETS;
  if (!FULL && cat !== IDENTITY) {
    const vols = [...new Set(PRESETS.map((p) => p.vol))];
    if (!vols.length || vols.some((v) => v === undefined)) { FAIL("sample", `category "${cat}": a preset carries no \`vol\`, so the volume sample cannot be taken — run --full or fix the mirror`); continue; }
    const vol = pickVolume(cat, vols);
    sampled[cat] = vol;
    docs = PRESETS.filter((p) => p.vol === vol);
    if (!docs.length) FAIL("sample", `category "${cat}": volume ${vol} selected but matched no preset`);
  }
  const g = cat === IDENTITY ? null : (gallery[cat] = { cells: 0, under: 0, worst: Infinity, worstAt: "", named: 0 });
  for (const preset of docs) {
    const doc = hydrate(preset);
    docsMeasured++;
    const key = docKey(preset.name);
    if (cat === IDENTITY) {
      if (identityDocs.has(key)) FAIL("corpus", `two brands.json presets share the document key "${key}" — the EXPECTED_BELOW keys would collide`);
      identityDocs.add(key);
    }
    for (const p of doc.palettes || []) { palettes++; if (p.lift || p.skew) liftSkew++; }
    for (const p of derivedAll(doc)) {
      const accent = p.roles.find((x) => x.suffix === "");
      const on = p.roles.find((x) => x.suffix === `-on-${p.n}`);
      // a missing end is a SKIPPED cell, which is how a gate goes quietly vacuous — name it instead.
      if (!accent || !on) { FAIL("pair", `${cat} "${preset.name}" ${p.n}: no ${accent ? "on-color" : "accent"} role on the derived palette — the role ladder moved`); continue; }
      for (const scheme of ["light", "dark"]) {
        const ratio = contrastRatio(on[scheme].rgb, accent[scheme].rgb);
        cellsMeasured++;
        if (ratio < worst) { worst = ratio; worstAt = `${cat} "${preset.name}" ${p.n}/${scheme}`; }
        if (cat === IDENTITY) {
          identityCells++;
          const k = `${key}|${p.n}|${scheme}`;
          const floor = EXPECTED_BELOW[k];
          if (floor !== undefined) seen.add(k);
          if (ratio >= AA) {
            if (floor !== undefined)
              FAIL("identity", `${k} now measures ${ratio.toFixed(3)}, clear of ${AA} — delete its EXPECTED_BELOW row in the same change that fixed it`);
          } else if (floor === undefined) {
            FAIL("identity", `brands.json / ${key} / ${p.n} / ${scheme}: accent ${accent[scheme].hex} on on-color ${on[scheme].hex} is ${ratio.toFixed(3)}:1, under the ${AA} floor, and carries no EXPECTED_BELOW row${isDataPalette(p) ? " (data palette)" : ""}`);
          } else if (ratio < floor) {
            FAIL("identity", `brands.json / ${key} / ${p.n} / ${scheme}: ${ratio.toFixed(3)}:1 slid below its recorded floor ${floor.toFixed(1)} — a curated preset moved`);
          }
        } else {
          g.cells++;
          if (ratio < g.worst) { g.worst = ratio; g.worstAt = `"${preset.name}" ${p.n}/${scheme}`; }
          if (ratio < AA) {
            g.under++;
            // name the offending cells, but cap per category: a mechanism regression can put
            // thousands under the floor and a 5000-line dump helps nobody. The count below is exact.
            if (g.named < 5) { g.named++; FAIL("gallery", `${cat} / ${preset.name} / ${p.n} / ${scheme}: accent ${accent[scheme].hex} on on-color ${on[scheme].hex} is ${ratio.toFixed(3)}:1, under the ${AA} floor`); }
          }
        }
      }
    }
  }
}

// ── the per-category ratchet ──────────────────────────────────────────────────────────────────
for (const cat of Object.keys(gallery)) {
  const exp = EXPECTED_GALLERY[cat];
  if (!exp) { FAIL("gallery", `category "${cat}" has no EXPECTED_GALLERY entry — a new gallery category must declare its accent/on-color standing`); continue; }
  const g = gallery[cat];
  const more = g.named < g.under ? ` (${g.under - g.named} more not named above)` : "";
  if (FULL ? g.under !== exp.under : g.under > exp.under)
    FAIL("gallery", `${cat}: ${g.under} of ${g.cells} accent/on-color cells are under ${AA}, expected ${FULL ? `${exp.under}` : `at most ${exp.under} (SAMPLED reads the recorded count as an upper bound; run --full for the exact check)`}${more}`);
  if (g.worst < exp.worst)
    FAIL("gallery", `${cat}: worst accent/on-color contrast is ${g.worst.toFixed(3)}:1 at ${g.worstAt}, below the ${exp.worst} floor this category is held to`);
}
for (const cat of Object.keys(EXPECTED_GALLERY)) if (!gallery[cat]) FAIL("gallery", `EXPECTED_GALLERY names "${cat}", which the corpus no longer has`);

// ── stale carve-out rows: a key nothing visited is a lie about the corpus ──────────────────────
for (const k of Object.keys(EXPECTED_BELOW))
  if (!seen.has(k)) FAIL("identity", `EXPECTED_BELOW row "${k}" matched no cell — the palette was renamed or removed; delete or repoint the row`);

// ── VACUITY GUARD: the gate is only worth its runtime if it measured what it claims to ─────────
const WANT = FULL ? { docs: 340, cells: 7500 } : { docs: 34, cells: 760 };
if (docsMeasured < WANT.docs) FAIL("vacuity", `only ${docsMeasured} curated documents measured in ${FULL ? "FULL" : "SAMPLED"} mode, expected at least ${WANT.docs} — the corpus shrank or an import failed silently`);
if (cellsMeasured < WANT.cells) FAIL("vacuity", `only ${cellsMeasured} accent/on-color cells measured in ${FULL ? "FULL" : "SAMPLED"} mode, expected at least ${WANT.cells}`);
if (identityCells < 160) FAIL("vacuity", `only ${identityCells} brands.json cells measured, expected 168 — the identity tier runs in full in BOTH modes`);
if (identityDocs.size !== 7) FAIL("vacuity", `brands.json exposed ${identityDocs.size} documents, expected 7`);
if (!FULL && Object.keys(sampled).length !== CATS.length - 1)
  FAIL("vacuity", `sampled ${Object.keys(sampled).length} gallery categories, expected ${CATS.length - 1} — a category was skipped, not measured`);

// ── REPORT ────────────────────────────────────────────────────────────────────────────────────
for (const g of ["corpus", "sample", "pair", "identity", "gallery", "vacuity"]) {
  const f = fails.find((x) => x.startsWith(g + ":"));
  console.log(`  ${f ? "FAIL" : "pass"}  ${g}${f ? "  — " + f.slice(g.length + 2) : ""}`);
}
console.log(`  (${FULL ? "FULL" : `SAMPLED seed ${SAMPLE_SEED}, volumes ` + CATS.filter((c) => c !== IDENTITY).map((c) => `${c} ${sampled[c]}`).join(", ")})`);
console.log(`  (${docsMeasured} curated documents, ${palettes} palettes (${liftSkew} carrying a non-zero lift or skew), ${cellsMeasured} accent/on-color cells; ${identityCells} named per cell, ${Object.keys(EXPECTED_BELOW).length} carried below ${AA})`);
console.log(`  (worst cell ${Number.isFinite(worst) ? worst.toFixed(3) : "n/a"}:1 at ${worstAt || "n/a"})`);
if (fails.length) {
  console.error(`\n${fails.length} gate failure(s):`);
  for (const f of fails) console.error(`  - ${f}`);
  console.error(`\nFAIL: ${fails.length} gate failure(s)`);
  process.exit(1);
}
console.log(`\nPASS: every measured curated preset's accent clears ${AA}:1 against its own on-color`);
process.exit(0);
