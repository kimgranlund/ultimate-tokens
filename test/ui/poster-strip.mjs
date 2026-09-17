#!/usr/bin/env node
// poster-strip.mjs — direct unit coverage for src/ui/app-helpers.mjs's posterStripBands(), the pure
// (no-DOM) function extracted from presetTile()'s inline width/order computation for #646: the
// preset gallery's poster strip read neutral-heavy because a preset's DOMINANT hue is often itself
// low-chroma (candle gold, not a vivid color), the old computation gave it an uncapped share, and a
// fixed `enabled.slice(0, 6)` cap could silently drop the 2nd accent swatch. This file drives the
// function directly with hand-built inputs (deterministic, no category-preset fixtures needed) to
// pin each of the four fixes independently, then cross-checks two REAL curated presets (one
// low-chroma dominant, one already-vivid) so the fixes are proven against real data too — the
// integration-level DOM assertions (presetTile() actually wiring through this function) live in
// test/ui/headless-boot.mjs's (jj) group.
import { POSTER_STRIP_ACCENT_FLOOR_PCT, POSTER_STRIP_MAX_BAND_PCT, POSTER_STRIP_MAX_BAND_PCT_HIGH, POSTER_STRIP_MAX_BAND_PCT_LOW, posterStripBands, posterStripDominantCap } from "../../src/ui/app-helpers.mjs";
import { hexToOklch } from "../../src/ui/model.mjs";
import { paletteKeyColors } from "../../src/ui/model.mjs";
import { hydrate } from "../../src/ui/persist.js";
import { PRESETS as LITERATURE_PRESETS } from "../../src/ui/categories/literature.js";
import { PRESETS as FILM_PRESETS } from "../../src/ui/categories/film.js";
import { PRESETS as BRANDS_PRESETS } from "../../src/ui/categories/brands.js";

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
const chroma = (hex) => hexToOklch(hex)[1];
const near = (a, b, tol = 0.01) => Math.abs(a - b) < tol;
const sumOf = (bands) => bands.reduce((s, b) => s + b.width, 0);
// the bands render as `flex:${width}` grow factors (src/ui/app.js presetTile), so a band's RENDERED
// share is width / sum, not width — the review of #646 found the vector summed to 87.73 (66.88 for
// Corsa) so the "35" cap actually rendered at 40-52%. Every story-path result must now sum to 100
// and its widest band's rendered share must respect the cap.
const assertRendered = (label, bands) => {
  const sum = sumOf(bands);
  ok(Math.abs(sum - 100) < 1e-6, `${label}: the returned widths sum to 100 so flex shares equal widths (got ${sum.toFixed(6)})`);
  // the dominant's cap is chroma-scaled (owner ruling: 35% near-neutral .. 45% vivid); every
  // other band keeps the flat cap.
  const capOf = (b) => (b.colorRole === "dominant" ? posterStripDominantCap(b.key) : POSTER_STRIP_MAX_BAND_PCT);
  for (const b of bands) ok(b.width / sum <= capOf(b) / 100 + 1e-9, `${label}: band ${b.name}'s RENDERED share (width/sum) respects its own cap (want <= ${capOf(b).toFixed(2)}%, got ${(100 * b.width / sum).toFixed(2)}%)`);
};
const enabledOf = (preset) => paletteKeyColors(hydrate(preset)).filter((p) => p.on);

// a hand-built 7-swatch cohort in the SAME shape paletteKeyColors() emits: 1 neutral (achromatic),
// 1 dominant (moderate chroma, candle-gold-like), 3 supporting (low-to-moderate chroma), 2 accent
// (the two most saturated swatches) — authored d:50/s:40/a:10, the same shape as most curated
// presets (docs/reference/colors/categories/*.json). One MORE hierarchy swatch than the OLD 6-band
// cap (1 neutral + 1 dominant + 3 supporting + 2 accent = 7), so selection must drop exactly one.
const ENABLED = [
  { name: "neutral", on: true, key: "#AAAAAA" },                                  // chroma 0
  { name: "dominant-swatch", on: true, key: "#C49F60", colorRole: "dominant" },   // chroma ~0.092
  { name: "supporting-1", on: true, key: "#2B4B37", colorRole: "supporting" },    // chroma ~0.051
  { name: "supporting-2", on: true, key: "#8C9094", colorRole: "supporting" },    // chroma ~0.008
  { name: "supporting-3", on: true, key: "#CDD6DB", colorRole: "supporting" },    // chroma ~0.012
  { name: "accent-1", on: true, key: "#913029", colorRole: "accent" },            // chroma ~0.132 (most vivid)
  { name: "accent-2", on: true, key: "#AB8F56", colorRole: "accent" },            // chroma ~0.083
];
const GROUPS = [{ hier: "d", pct: 50 }, { hier: "s", pct: 40 }, { hier: "a", pct: 10 }];

// ── fix 2: never drop the 2nd accent ────────────────────────────────────────────────────────────
{
  const bands = posterStripBands(ENABLED, GROUPS);
  ok(bands.length === 6, `the 6-band cap still holds (got ${bands.length})`);
  const names = bands.map((b) => b.name);
  ok(names.includes("accent-1") && names.includes("accent-2"), `BOTH accent swatches must survive the 6-band cap even though the cohort has 7 hierarchy+neutral entries (got ${names.join(",")})`);
  ok(names.includes("neutral") && names.includes("dominant-swatch"), `neutral + the dominant swatch must always survive too (got ${names.join(",")})`);
  // exactly one SUPPORTING sliver is what gets dropped on overflow, never an accent — and it drops
  // in AUTHORED order (the 3rd/last-listed supporting), the same truncation rule the old code used.
  const droppedSupporting = ["supporting-1", "supporting-2", "supporting-3"].filter((n) => !names.includes(n));
  ok(droppedSupporting.length === 1 && droppedSupporting[0] === "supporting-3", `exactly the LAST-authored supporting swatch is dropped on overflow (got dropped=${JSON.stringify(droppedSupporting)})`);
}

// ── fix 1: clamp the max band + floor accent bands, redistributing proportionally ──────────────
{
  const bands = posterStripBands(ENABLED, GROUPS);
  const byName = Object.fromEntries(bands.map((b) => [b.name, b]));
  // dominant's authored share (50% * 92% = 46%) uncapped would swamp the strip — clamped to ITS
  // chroma-scaled cap (~0.092 chroma sits between the 0.02 and 0.15 endpoints, so strictly 35..45).
  const domCap = posterStripDominantCap(byName["dominant-swatch"].key);
  ok(domCap > POSTER_STRIP_MAX_BAND_PCT_LOW + 1 && domCap < POSTER_STRIP_MAX_BAND_PCT_HIGH - 1, `test setup: the cohort's moderate-chroma dominant gets a cap strictly between the endpoints (got ${domCap.toFixed(2)})`);
  ok(near(byName["dominant-swatch"].width, domCap), `the dominant band is clamped to its chroma-scaled cap (want ${domCap.toFixed(2)}, got ${byName["dominant-swatch"].width.toFixed(2)})`);
  // accent's authored share (10% * 92% / 2 = 4.6% each) uncapped would be a sliver — floored up.
  ok(byName["accent-1"].width >= POSTER_STRIP_ACCENT_FLOOR_PCT - 0.01 && byName["accent-2"].width >= POSTER_STRIP_ACCENT_FLOOR_PCT - 0.01,
    `both accent bands are floored to at least the accent floor (want >= ${POSTER_STRIP_ACCENT_FLOOR_PCT}, got ${byName["accent-1"].width.toFixed(2)}/${byName["accent-2"].width.toFixed(2)})`);
  ok(near(byName.neutral.width, 8), `neutral keeps its fixed 8% backdrop share untouched by the clamp/floor pass (got ${byName.neutral.width.toFixed(2)})`);
  // the clamp's surplus + the floor's deficit must net out somewhere on the two surviving
  // supporting bands (the only flexible, non-locked, non-floored bands left) — neither goes negative.
  ok(byName["supporting-1"].width > 0 && byName["supporting-2"].width > 0, `redistribution never pushes a flexible band negative (got ${byName["supporting-1"].width.toFixed(2)}/${byName["supporting-2"].width.toFixed(2)})`);
  assertRendered("hand-built cohort", bands);
}

// ── fix A (review): fewer than 6 hierarchy-tagged palettes + a capitalized "Neutral" ─────────────
{
  // Maison authors 8 enabled palettes but only 3 carry a colorRole (Primary/dominant, Secondary +
  // Tertiary/supporting); Info/Success/Warning/Danger carry none, and its neutral is "Neutral".
  // The first cut of #646 selected by exact name/colorRole only, so it rendered 3 bands with no
  // neutral ground at all where the old `enabled.slice(0, 6)` rendered 6.
  const maison = BRANDS_PRESETS.find((p) => p.name.startsWith("Maison ·"));
  const enabled = enabledOf(maison);
  ok(enabled.length === 8 && enabled.filter((p) => p.colorRole).length === 3 && enabled[0].name === "Neutral", `test setup: Maison really has 8 enabled palettes, 3 hierarchy-tagged, and a capitalized "Neutral" (got ${enabled.map((p) => `${p.name}${p.colorRole ? ":" + p.colorRole : ""}`).join(",")})`);
  const bands = posterStripBands(enabled, maison.story.groups);
  const names = bands.map((b) => b.name);
  ok(bands.length === 6, `Maison: a preset with fewer than 6 hierarchy-tagged palettes still fills 6 bands from its colorRole-less palettes (got ${bands.length}: ${names.join(",")})`);
  ok(names.includes("Neutral"), `Maison: the capitalized "Neutral" ground is among the bands (got ${names.join(",")})`);
  ok(near(bands.find((b) => b.name === "Neutral").width, 8), `Maison: "Neutral" is treated as THE neutral, keeping the fixed 8% backdrop share (got ${bands.find((b) => b.name === "Neutral").width.toFixed(2)})`);
  ok(["Primary", "Secondary", "Tertiary"].every((n) => names.includes(n)), `Maison: every hierarchy-tagged palette is still shown (got ${names.join(",")})`);
  ok(names.includes("Info") && names.includes("Success"), `Maison: the free slots are topped up from the leftover palettes in authored order, Info then Success (got ${names.join(",")})`);
  assertRendered("Maison", bands);
}

// ── fix B (review): the worst-case vector, Corsa's 8 accent-role + 5 supporting-role palettes ───
{
  // the base widths divide a role's share across every ENABLED sibling, so the 6 accents and 3
  // supporting palettes that do NOT make the strip took their share out of the total (66.88 before
  // normalization), and the "35" cap rendered at 52.3%, wider than the ~46% the ticket was filed about.
  const corsa = BRANDS_PRESETS.find((p) => p.name.startsWith("Corsa ·"));
  const enabled = enabledOf(corsa);
  ok(enabled.filter((p) => p.colorRole === "accent").length === 8 && enabled.filter((p) => p.colorRole === "supporting").length === 5, `test setup: Corsa really authors 8 accent-role + 5 supporting-role palettes (got a=${enabled.filter((p) => p.colorRole === "accent").length}, s=${enabled.filter((p) => p.colorRole === "supporting").length})`);
  const bands = posterStripBands(enabled, corsa.story.groups);
  ok(bands.length === 6, `Corsa: 6 bands (got ${bands.length})`);
  ok(bands.filter((b) => b.colorRole === "accent").length === 2, `Corsa: exactly 2 accents shown (got ${bands.filter((b) => b.colorRole === "accent").length})`);
  assertRendered("Corsa", bands);
  const corsaDom = bands.find((b) => b.colorRole === "dominant");
  ok(near(corsaDom.width, posterStripDominantCap(corsaDom.key)), `Corsa: the dominant is clamped to its chroma-scaled cap in RENDERED terms, not 52% (want ${posterStripDominantCap(corsaDom.key).toFixed(2)}, got ${corsaDom.width.toFixed(2)})`);
}

// ── fix 3: width additionally weighted by each swatch's OWN OKLCH chroma ───────────────────────
{
  // two supporting swatches authored the SAME group (so an identical pre-chroma base width), but
  // different chroma — the more saturated one must end up wider once chroma weighting applies.
  const vividSupportingKey = "#2B4B37";   // chroma ~0.051
  const mutedSupportingKey = "#8C9094";   // chroma ~0.008
  ok(chroma(vividSupportingKey) > chroma(mutedSupportingKey), "test setup: the two probe supporting swatches really do differ in chroma");
  const bands = posterStripBands(ENABLED, GROUPS);
  const vivid = bands.find((b) => b.key === vividSupportingKey);
  const muted = bands.find((b) => b.key === mutedSupportingKey);
  ok(vivid.width > muted.width, `a more saturated band renders WIDER than a less saturated one authored under the same hierarchy group (vivid=${vivid.width.toFixed(2)}, muted=${muted.width.toFixed(2)})`);

  // a UNIFORMLY muted cohort (every non-neutral swatch desaturated to the same low chroma) must
  // render IDENTICALLY to a uniformly vivid cohort at the same authored pcts — fix 3 only shifts
  // width by RELATIVE chroma differences within a preset, never by a preset's absolute saturation.
  const uniformLow = ENABLED.map((p) => (p.name === "neutral" ? p : { ...p, key: "#8C9094" }));   // all non-neutral chroma ~0.008
  const uniformHigh = ENABLED.map((p) => (p.name === "neutral" ? p : { ...p, key: "#913029" }));  // all non-neutral chroma ~0.132
  const lowBands = posterStripBands(uniformLow, GROUPS);
  const highBands = posterStripBands(uniformHigh, GROUPS);
  // the chroma WEIGHTING cancels out for a uniformly-saturated cohort; the one thing that differs
  // by design is the dominant's chroma-scaled CAP (owner ruling), so: neutral and the two floored
  // accents are identical, the dominant lands at each cohort's own cap (low near 35, high above
  // it), and the two supporting bands stay equal to each other in both.
  const byRole = (bands) => Object.fromEntries(bands.map((b) => [b.name, b.width]));
  const lo = byRole(lowBands), hi = byRole(highBands);
  ok(near(lo.neutral, hi.neutral) && near(lo["accent-1"], hi["accent-1"]) && near(lo["accent-2"], hi["accent-2"]), `uniform cohorts: neutral + floored accents identical (low=${JSON.stringify(lo)}, high=${JSON.stringify(hi)})`);
  ok(near(lo["dominant-swatch"], POSTER_STRIP_MAX_BAND_PCT_LOW) && hi["dominant-swatch"] > lo["dominant-swatch"] + 5 && near(hi["dominant-swatch"], posterStripDominantCap("#913029")), `uniform cohorts: the dominant sits at each cohort's own chroma-scaled cap, muted at ${POSTER_STRIP_MAX_BAND_PCT_LOW}, vivid well above it (low=${lo["dominant-swatch"].toFixed(2)}, high=${hi["dominant-swatch"].toFixed(2)})`);
  ok(near(lo["supporting-1"], lo["supporting-2"]) && near(hi["supporting-1"], hi["supporting-2"]), `uniform cohorts: the weighting itself cancels, same-pct supporting bands stay equal to each other in both (low=${lo["supporting-1"].toFixed(2)}/${lo["supporting-2"].toFixed(2)}, high=${hi["supporting-1"].toFixed(2)}/${hi["supporting-2"].toFixed(2)})`);
}

// ── fix 4 (owner ruling): neutral pinned to the leading edge, highest chroma at the far edge ────
{
  const bands = posterStripBands(ENABLED, GROUPS);
  const nonNeutralDesc = bands.filter((b) => b.name !== "neutral").sort((a, b) => chroma(b.key) - chroma(a.key));
  ok(bands[0].name === "neutral", `the neutral ground is the FIRST band (got ${bands.map((b) => b.name).join(",")})`);
  ok(bands[bands.length - 1].key === nonNeutralDesc[0].key, `the LAST band is the highest-chroma non-neutral swatch (last=${bands[bands.length - 1].name}, want ${nonNeutralDesc[0].name})`);
  ok(bands[1].key === nonNeutralDesc[1].key, `the rest alternate high-chroma-outward from the far edge: band[1] is the 2nd-highest chroma (got ${bands[1].name}, want ${nonNeutralDesc[1].name})`);
  // no neutral shown at all: the original alternation stands, two highest chroma at the two edges.
  const noNeutral = ENABLED.filter((p) => p.name !== "neutral");
  const nn = posterStripBands(noNeutral, GROUPS);
  const nnDesc = [...nn].sort((a, b) => chroma(b.key) - chroma(a.key));
  const nnEdges = [nn[0].key, nn[nn.length - 1].key];
  ok(!nn.some((b) => b.name === "neutral") && nnEdges.includes(nnDesc[0].key) && nnEdges.includes(nnDesc[1].key), `with no neutral, the two edge bands are the two highest-chroma swatches (edges=${nnEdges.join(",")}, top2=${nnDesc[0].key},${nnDesc[1].key})`);
}

// ── no story.groups: falls back EXACTLY to the original fixed SAMPLED_W template, unordered ────
{
  const bands = posterStripBands(ENABLED.slice(0, 6), undefined);
  ok(JSON.stringify(bands.map((b) => b.width)) === JSON.stringify([36, 19, 19, 16, 6, 4]), `no story.groups falls back to the fixed SAMPLED_W template exactly (got ${JSON.stringify(bands.map((b) => b.width))})`);
  ok(JSON.stringify(bands.map((b) => b.name)) === JSON.stringify(ENABLED.slice(0, 6).map((p) => p.name)), "no story.groups keeps the ORIGINAL (unreordered) band order");
}

// ── real curated presets: the low-chroma "War and Peace" case + an already-vivid dominant ──────
{
  const wp = LITERATURE_PRESETS.find((p) => p.name.includes("War and Peace"));
  const wpEnabled = paletteKeyColors(hydrate(wp)).filter((p) => p.on);
  const wpBands = posterStripBands(wpEnabled, wp.story.groups);
  const wpDominant = wpBands.find((b) => b.colorRole === "dominant");
  const wpAccents = wpBands.filter((b) => b.colorRole === "accent");
  ok(wpAccents.length === 2, `War and Peace: both accent swatches (icon crimson + gilt gold) survive (got ${wpAccents.length})`);
  const wpCap = posterStripDominantCap(wpDominant.key);
  ok(wpCap < 39, `test setup: candle gold (chroma ~0.057) earns a cap near the low end (got ${wpCap.toFixed(2)})`);
  ok(near(wpDominant.width, wpCap), `War and Peace: the candle-gold dominant (authored 50%, ~46% uncapped) is clamped to its chroma-scaled cap (want ${wpCap.toFixed(2)}, got ${wpDominant.width.toFixed(2)})`);
  ok(wpBands[0].colorRole == null && wpBands[0].name === "neutral", `War and Peace: neutral is the leading band (got ${wpBands.map((b) => b.name).join(",")})`);
  const wpTop = wpBands.filter((b) => b.name !== "neutral").sort((a, b) => chroma(b.key) - chroma(a.key))[0];
  ok(wpBands[wpBands.length - 1].key === wpTop.key, `War and Peace: the far edge is the highest-chroma band, icon crimson (got ${wpBands[wpBands.length - 1].name}, want ${wpTop.name})`);
  ok(wpAccents.every((b) => b.width >= POSTER_STRIP_ACCENT_FLOOR_PCT - 0.01), `War and Peace: both accent bands are floored, no longer slivers (got ${wpAccents.map((b) => b.width.toFixed(2))})`);
  assertRendered("War and Peace", wpBands);

  const hero = FILM_PRESETS.find((p) => p.name.includes("Hero · 2002"));
  const heroEnabled = paletteKeyColors(hydrate(hero)).filter((p) => p.on);
  const heroBands = posterStripBands(heroEnabled, hero.story.groups);
  const heroDominant = heroBands.find((b) => b.colorRole === "dominant");
  const heroRest = heroBands.filter((b) => b.name !== heroDominant.name);
  ok(chroma(heroDominant.key) > 0.15, `test setup: Hero's dominant (courtyard red) really is already high-chroma (got ${chroma(heroDominant.key).toFixed(3)})`);
  ok(near(heroDominant.width, POSTER_STRIP_MAX_BAND_PCT_HIGH), `Hero: an already-vivid dominant (chroma > 0.15) gets the full high cap (want ${POSTER_STRIP_MAX_BAND_PCT_HIGH}, got ${heroDominant.width.toFixed(2)})`);
  // TKT-0003 differentiation, restored: presets whose dominants differ in chroma render visibly
  // different dominant widths, both within the [35, 45] band the ruling defines.
  ok(heroDominant.width - wpDominant.width > 3, `Hero vs War and Peace: the vivid dominant renders > 3 points wider than the candle-gold one (hero=${heroDominant.width.toFixed(2)}, wp=${wpDominant.width.toFixed(2)})`);
  ok([heroDominant.width, wpDominant.width].every((w) => w >= POSTER_STRIP_MAX_BAND_PCT_LOW - 0.01 && w <= POSTER_STRIP_MAX_BAND_PCT_HIGH + 0.01), `both dominants sit within [${POSTER_STRIP_MAX_BAND_PCT_LOW}, ${POSTER_STRIP_MAX_BAND_PCT_HIGH}] (hero=${heroDominant.width.toFixed(2)}, wp=${wpDominant.width.toFixed(2)})`);
  // with the vector normalized, the cap binds at a true 45% here and 5 other bands share the
  // remaining 55% (neutral 8 + two floored accents leave ~27% for three supporting bands), so the
  // widest neighbor can legitimately reach ~15%: 1.5x is a comfortable margin.
  ok(heroRest.every((b) => heroDominant.width >= b.width * 1.5), `Hero: the vivid dominant remains clearly the strip's leading band, at least 1.5x its widest neighbor (dominant=${heroDominant.width.toFixed(2)}, rest=${heroRest.map((b) => b.width.toFixed(2)).join(",")})`);
  assertRendered("Hero · 2002", heroBands);
}

if (fails.length) { console.error(`poster-strip FAIL (${fails.length}):\n  ` + fails.join("\n  ")); process.exit(1); }
console.log("poster-strip PASS: posterStripBands() holds all four #646 fixes directly — never drops the 2nd accent (fix 2), clamps the dominant to a chroma-scaled 35..45 cap + floors accent bands via proportional redistribution (fix 1), weights width by relative chroma without shifting a uniformly-saturated cohort (fix 3), and pins neutral first and the highest-chroma band last (fix 4) — plus the review fold-ins: a capitalized Neutral + colorRole-less top-up still fill 6 bands (Maison), and every story-path vector sums to 100 with the widest band's rendered share under the cap (Corsa's worst case, War and Peace, Hero)");
process.exit(0);
