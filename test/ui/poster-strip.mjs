#!/usr/bin/env node
// poster-strip.mjs, direct unit coverage for src/ui/app-helpers.mjs's posterStripBands(), the pure
// (no-DOM) function extracted from presetTile()'s inline width/order computation for #646: the
// preset gallery's poster strip read neutral-heavy because a preset's DOMINANT hue is often itself
// low-chroma (candle gold, not a vivid color), the old computation gave it an uncapped share, and a
// fixed `enabled.slice(0, 6)` cap could silently drop the 2nd accent swatch. This file drives the
// function directly with hand-built inputs (deterministic, no category-preset fixtures needed) to
// pin each of the four fixes independently, then cross-checks two REAL curated presets (one
// low-chroma dominant, one already-vivid) so the fixes are proven against real data too, the
// integration-level DOM assertions (presetTile() actually wiring through this function) live in
// test/ui/headless-boot.mjs's (jj) group.
import { POSTER_STRIP_ACCENT_FLOOR_PCT, POSTER_STRIP_MAX_BAND_PCT, POSTER_STRIP_MAX_BAND_PCT_HIGH, POSTER_STRIP_MAX_BAND_PCT_LOW, posterStripBands, posterStripDominantCap, POSTER_STRIP_CAP_CHROMA_LOW, POSTER_STRIP_CAP_CHROMA_HIGH } from "../../src/ui/app-helpers.mjs";
// ownChroma / predictCap (#681 pre-land S1) - an INDEPENDENT sRGB(0..255) -> OKLCH chroma on Bjorn
// Ottosson's matrices, plus the documented dominant-cap scaling re-expressed from the module's own
// exported endpoints. Used to DERIVE the expected cap from a sampled hex rather than pin a number
// read off a run. Deliberately not `hexToOklch`, which is what `posterStripChroma` itself calls.
const ownChroma = (hex) => {
  const inv = (a) => (a <= 0.04045 ? a / 12.92 : Math.pow((a + 0.055) / 1.055, 2.4));
  const [r, g, b] = [1, 3, 5].map((i) => inv(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return Math.hypot(1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s);
};
const predictCap = (hex) => POSTER_STRIP_MAX_BAND_PCT_LOW + Math.min(1, Math.max(0, (ownChroma(hex) - POSTER_STRIP_CAP_CHROMA_LOW) / (POSTER_STRIP_CAP_CHROMA_HIGH - POSTER_STRIP_CAP_CHROMA_LOW))) * (POSTER_STRIP_MAX_BAND_PCT_HIGH - POSTER_STRIP_MAX_BAND_PCT_LOW);
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
// share is width / sum, not width, the review of #646 found the vector summed to 87.73 (66.88 for
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
// (the two most saturated swatches), authored d:50/s:40/a:10, the same shape as most curated
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
  // exactly one SUPPORTING sliver is what gets dropped on overflow, never an accent, and it drops
  // in AUTHORED order (the 3rd/last-listed supporting), the same truncation rule the old code used.
  const droppedSupporting = ["supporting-1", "supporting-2", "supporting-3"].filter((n) => !names.includes(n));
  ok(droppedSupporting.length === 1 && droppedSupporting[0] === "supporting-3", `exactly the LAST-authored supporting swatch is dropped on overflow (got dropped=${JSON.stringify(droppedSupporting)})`);
}

// ── fix 1: clamp the max band + floor accent bands, redistributing proportionally ──────────────
{
  const bands = posterStripBands(ENABLED, GROUPS);
  const byName = Object.fromEntries(bands.map((b) => [b.name, b]));
  // dominant's authored share (50% * 92% = 46%) uncapped would swamp the strip, clamped to ITS
  // chroma-scaled cap (~0.092 chroma sits between the 0.02 and 0.15 endpoints, so strictly 35..45).
  const domCap = posterStripDominantCap(byName["dominant-swatch"].key);
  ok(domCap > POSTER_STRIP_MAX_BAND_PCT_LOW + 1 && domCap < POSTER_STRIP_MAX_BAND_PCT_HIGH - 1, `test setup: the cohort's moderate-chroma dominant gets a cap strictly between the endpoints (got ${domCap.toFixed(2)})`);
  ok(near(byName["dominant-swatch"].width, domCap), `the dominant band is clamped to its chroma-scaled cap (want ${domCap.toFixed(2)}, got ${byName["dominant-swatch"].width.toFixed(2)})`);
  // accent's authored share (10% * 92% / 2 = 4.6% each) uncapped would be a sliver, floored up.
  ok(byName["accent-1"].width >= POSTER_STRIP_ACCENT_FLOOR_PCT - 0.01 && byName["accent-2"].width >= POSTER_STRIP_ACCENT_FLOOR_PCT - 0.01,
    `both accent bands are floored to at least the accent floor (want >= ${POSTER_STRIP_ACCENT_FLOOR_PCT}, got ${byName["accent-1"].width.toFixed(2)}/${byName["accent-2"].width.toFixed(2)})`);
  ok(near(byName.neutral.width, 8), `neutral keeps its fixed 8% backdrop share untouched by the clamp/floor pass (got ${byName.neutral.width.toFixed(2)})`);
  // the clamp's surplus + the floor's deficit must net out somewhere on the two surviving
  // supporting bands (the only flexible, non-locked, non-floored bands left), neither goes negative.
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
  // different chroma, the more saturated one must end up wider once chroma weighting applies.
  const vividSupportingKey = "#2B4B37";   // chroma ~0.051
  const mutedSupportingKey = "#8C9094";   // chroma ~0.008
  ok(chroma(vividSupportingKey) > chroma(mutedSupportingKey), "test setup: the two probe supporting swatches really do differ in chroma");
  const bands = posterStripBands(ENABLED, GROUPS);
  const vivid = bands.find((b) => b.key === vividSupportingKey);
  const muted = bands.find((b) => b.key === mutedSupportingKey);
  ok(vivid.width > muted.width, `a more saturated band renders WIDER than a less saturated one authored under the same hierarchy group (vivid=${vivid.width.toFixed(2)}, muted=${muted.width.toFixed(2)})`);

  // a UNIFORMLY muted cohort (every non-neutral swatch desaturated to the same low chroma) must
  // render IDENTICALLY to a uniformly vivid cohort at the same authored pcts, fix 3 only shifts
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
  // RE-DERIVED at #681 pre-land S1. This read `wpCap < 39` against `#D5BE98`, the CUSP
  // RECONSTRUCTION of candle gold off the preset's fitted hue/chroma, whose chroma is 0.057194. S1
  // makes `paletteKeyColors` return the palette's stored `anchor`, the real sampled `#C49F60`, whose
  // chroma is 0.092275, so the cap moves 37.8611 to 40.5596 and "near the low end" described the
  // reconstruction rather than candle gold. The expectation below is DERIVED from the sampled hex
  // and the module's own exported endpoints before it is read off a run, not fitted to one:
  // t = (0.092275 - 0.02) / (0.15 - 0.02) = 0.555958, cap = 35 + 0.555958 * (45 - 35) = 40.5596.
  // `ownChroma` is this file's own Ottosson conversion rather than the `hexToOklch` the engine's
  // `posterStripChroma` uses, so a shared bug in that conversion cannot make the two agree.
  ok(wpDominant.key === "#C49F60", `test setup: the strip reads War and Peace's SAMPLED dominant, not its cusp reconstruction (got ${wpDominant.key})`);
  ok(Math.abs(predictCap(wpDominant.key) - 40.5596) < 0.001, `test setup: the documented chroma scaling PREDICTS candle gold's cap at 40.5596 from #C49F60 alone (chroma ${ownChroma(wpDominant.key).toFixed(6)}, predicted ${predictCap(wpDominant.key).toFixed(4)})`);
  ok(Math.abs(wpCap - predictCap(wpDominant.key)) < 1e-9 && wpCap > POSTER_STRIP_MAX_BAND_PCT_LOW && wpCap < POSTER_STRIP_MAX_BAND_PCT_HIGH, `posterStripDominantCap agrees with the derivation and is a genuine interpolation, strictly inside (${POSTER_STRIP_MAX_BAND_PCT_LOW}, ${POSTER_STRIP_MAX_BAND_PCT_HIGH}) (engine ${wpCap.toFixed(4)}, derived ${predictCap(wpDominant.key).toFixed(4)})`);
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
  // remaining 55% (neutral 8 + two floored accents leave ~27% for the two supporting bands that make the strip), so the
  // widest neighbor can legitimately reach ~15%: 1.5x is a comfortable margin.
  ok(heroRest.every((b) => heroDominant.width >= b.width * 1.5), `Hero: the vivid dominant remains clearly the strip's leading band, at least 1.5x its widest neighbor (dominant=${heroDominant.width.toFixed(2)}, rest=${heroRest.map((b) => b.width.toFixed(2)).join(",")})`);
  assertRendered("Hero · 2002", heroBands);
}

// ── #650: the clamp/floor pass is a converging fit under RENDERED-SHARE caps ───────────────────
// The bands render as flex grow factors, so a cap is only meaningful as width / sum. Two defects in
// the old 4-pass loop (issue #650): a positive net with nothing floored was dropped (sum < 100, the
// one band rendered at 100%), and the loop was not a fixed-point solver (one supporting sibling at
// d45/s45/a10 landed ~1 point over its cap). Owner ruling: when locked + sum(caps) < the pool the
// caps are scaled up by one common factor until the set is feasible (likewise floors are scaled
// DOWN if they alone exceed the pool), then the fit iterates to a fixed point where no bound is
// violated and the sum is exactly what came in. The expected bounds below are derived HERE, from
// the rule, not read back from the helper, so this block is an independent check of the fit.
{
  const NEUTRAL_W = 8;
  // the effective (feasibility-scaled) bounds for a returned band vector, from the ruling alone
  const effectiveBounds = (bands) => {
    const sum = sumOf(bands);
    const flex = bands.filter((b) => b.name.toLowerCase() !== "neutral");
    const pool = sum - (bands.length - flex.length) * NEUTRAL_W;
    let caps = flex.map((b) => (b.colorRole === "dominant" ? posterStripDominantCap(b.key) : POSTER_STRIP_MAX_BAND_PCT));
    let floors = flex.map((b) => (b.colorRole === "accent" ? POSTER_STRIP_ACCENT_FLOOR_PCT : 0));
    const capSum = caps.reduce((a, c) => a + c, 0), floorSum = floors.reduce((a, c) => a + c, 0);
    const capScale = capSum < pool ? pool / capSum : 1;
    const floorScale = floorSum > pool ? pool / floorSum : 1;
    if (capScale !== 1) caps = caps.map((c) => c * capScale);
    if (floorScale !== 1) floors = floors.map((f) => f * floorScale);
    return { sum, capScale, floorScale, bounds: new Map(flex.map((b, i) => [b, { cap: caps[i], floor: floors[i] }])) };
  };
  // one cohort -> zero or more failure messages (sum, every rendered share within its bounds)
  const checkFit = (label, bands) => {
    const msgs = [];
    const { sum, capScale, floorScale, bounds } = effectiveBounds(bands);
    if (!(Math.abs(sum - 100) < 1e-6)) msgs.push(`${label}: widths sum to 100 (got ${sum.toFixed(6)})`);
    for (const [b, { cap, floor }] of bounds) {
      if (!(b.width / sum <= cap / 100 + 1e-9)) msgs.push(`${label}: band ${b.name} (${b.colorRole}) rendered share <= its effective cap (cap ${cap.toFixed(4)}${capScale !== 1 ? ` scaled x${capScale.toFixed(4)}` : ""}, got ${(100 * b.width / sum).toFixed(4)})`);
      if (!(b.width / sum >= floor / 100 - 1e-9)) msgs.push(`${label}: ${b.colorRole || "untagged"} ${b.name} rendered share >= its effective floor (floor ${floor.toFixed(4)}${floorScale !== 1 ? ` scaled x${floorScale.toFixed(4)}` : ""}, got ${(100 * b.width / sum).toFixed(4)})`);
    }
    return msgs;
  };
  // the fit throws when its iteration cap is hit (a fixed point it could not reach): that is a
  // test failure, never a silent return.
  const runFit = (label, enabled, groups) => {
    try { return { bands: posterStripBands(enabled, groups) }; }
    catch (e) { return { error: `${label}: the fit terminated without hitting its iteration cap (threw: ${e.message})` }; }
  };
  const N = { name: "neutral", on: true, key: "#AAAAAA" };
  const D = { name: "dominant", on: true, key: "#C49F60", colorRole: "dominant" };   // cap ~40.56
  const S = { name: "supporting", on: true, key: "#2B4B37", colorRole: "supporting" };
  const A = { name: "accent", on: true, key: "#913029", colorRole: "accent" };
  const domCap = posterStripDominantCap(D.key);
  ok(near(domCap, 40.56), `test setup: the probe dominant's cap is ~40.56 (got ${domCap.toFixed(2)})`);

  // case A: one dominant + one accent, no neutral, d50/s40/a10. Caps 40.56 + 35 < 100, so both
  // scale by 100/75.56 and the dominant lands EXACTLY at its scaled cap; sum 100. (Old loop:
  // sum 100 but dominant 65, cap violated.)
  {
    const r = runFit("case A", [D, A], GROUPS);
    if (r.error) fails.push(r.error);
    else {
      for (const m of checkFit("case A", r.bands)) fails.push(m);
      const dom = r.bands.find((b) => b.colorRole === "dominant");
      const scaled = domCap * (100 / (domCap + POSTER_STRIP_MAX_BAND_PCT));
      ok(Math.abs(dom.width - scaled) < 1e-9, `case A: the dominant sits exactly at its feasibility-scaled cap (want ${scaled.toFixed(6)}, got ${dom.width.toFixed(6)})`);
    }
  }
  // case A': neutral + a lone dominant, d50/s40/a10. Locked 8 + cap 40.56 < 100, so the one cap
  // scales to 92 and the dominant takes it; sum 100. (Old loop: surplus dropped, sum 48.56.)
  {
    const r = runFit("case A'", [N, D], GROUPS);
    if (r.error) fails.push(r.error);
    else {
      for (const m of checkFit("case A'", r.bands)) fails.push(m);
      const dom = r.bands.find((b) => b.colorRole === "dominant");
      ok(Math.abs(dom.width - 92) < 1e-9, `case A': the lone dominant fills what neutral leaves, its cap scaled to 92 (got ${dom.width.toFixed(6)})`);
    }
  }
  // case B: neutral + dominant + ONE supporting + one accent, d45/s45/a10: feasible (8 + 40.56 +
  // 35 + 35 > 100), so no scaling; the fit must land dominant <= 40.56 and supporting <= 35 to
  // 1e-9, sum 100. (Old loop: supporting ~1 point over, or the dominant over after pass 4.)
  {
    const r = runFit("case B", [N, D, S, A], [{ hier: "d", pct: 45 }, { hier: "s", pct: 45 }, { hier: "a", pct: 10 }]);
    if (r.error) fails.push(r.error);
    else {
      for (const m of checkFit("case B", r.bands)) fails.push(m);
      const dom = r.bands.find((b) => b.colorRole === "dominant"), sup = r.bands.find((b) => b.colorRole === "supporting");
      ok(dom.width <= domCap + 1e-9, `case B: the dominant respects its unscaled cap to 1e-9 (cap ${domCap.toFixed(6)}, got ${dom.width.toFixed(6)})`);
      ok(sup.width <= POSTER_STRIP_MAX_BAND_PCT + 1e-9, `case B: the single supporting sibling respects the flat cap to 1e-9 (cap ${POSTER_STRIP_MAX_BAND_PCT}, got ${sup.width.toFixed(6)})`);
    }
  }
  // case C: one dominant, nothing else. Its cap scales to 100 and it takes it. (Old loop: sum
  // 40.56, the band renders at 100% with the sum silently short.)
  {
    const r = runFit("case C", [D], GROUPS);
    if (r.error) fails.push(r.error);
    else {
      for (const m of checkFit("case C", r.bands)) fails.push(m);
      ok(r.bands.length === 1 && Math.abs(r.bands[0].width - 100) < 1e-9, `case C: a lone dominant's cap scales to 100 and it fills the strip (got ${r.bands.map((b) => b.width.toFixed(6)).join(",")})`);
    }
  }

  // case D (review round 1 of #650): neutral + dominant + one supporting + two accents + "Info", a
  // colorRole-less TOP-UP band (posterStripSelect fills free slots from untagged palettes; Maison/
  // Adia/BZZR ship them), at d50/s49/a1. Info's base width is the 5 fallback, the accents start at
  // 0.46 each: the two accent floors take ~19 from the pool, more than Info + the pinned bands can
  // give, so the redistribution pushes Info NEGATIVE. The pre-review fit truncated it at 0 with
  // Math.max, silently dropping the shortfall: sum 103.559582, both accents rendered 9.6563 (under
  // the 10 floor). A top-up band is a flexible band with lower bound 0: it may go to 0, but the
  // deficit it cannot absorb is carried to the remaining flexible bands, never truncated.
  {
    const A2 = { name: "accent-1", on: true, key: "#1F4E8C", colorRole: "accent" };
    const INFO = { name: "Info", on: true, key: "#3A7BD5" }; // no colorRole: a top-up band
    const r = runFit("case D", [N, D, S, A, A2, INFO], [{ hier: "d", pct: 50 }, { hier: "s", pct: 49 }, { hier: "a", pct: 1 }]);
    if (r.error) fails.push(r.error);
    else {
      for (const m of checkFit("case D", r.bands)) fails.push(m);
      const sum = sumOf(r.bands);
      const info = r.bands.find((b) => b.name === "Info");
      ok(Math.abs(sum - 100) < 1e-6, `case D: an untagged top-up band never truncates the net, widths sum to 100 (got ${sum.toFixed(6)})`);
      ok(info && info.width >= 0, `case D: the top-up band stays >= 0 (got ${info && info.width})`);
      const { bounds } = effectiveBounds(r.bands);
      for (const b of r.bands.filter((x) => x.colorRole === "accent")) {
        const { floor } = bounds.get(b);
        ok(100 * b.width / sum >= floor - 1e-9, `case D: accent ${b.name} rendered share >= its effective floor ${floor.toFixed(4)} (got ${(100 * b.width / sum).toFixed(4)})`);
      }
    }
  }

  // fuzz: random cohorts over role mix (0-1 neutral, 1 dominant, 0-4 supporting, 0-4 accents,
  // 0-2 UNTAGGED top-up bands such as Info/Success/Data-N, which carry no colorRole and take the
  // 5 fallback width), random pct splits, random hex keys (so chroma weighting and the dominant
  // cap vary). Fixed seed, so a failure reproduces; the first 8 failures are reported with their
  // cohort. The untagged bands were added at review round 1 of #650: without them the fuzz never
  // exercised the negative-net truncation that case D pins.
  const FUZZ_CASES = 4000, FUZZ_SEED = 0x650;
  const rng = (() => { let a = FUZZ_SEED >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
  const randInt = (lo, hi) => lo + Math.floor(rng() * (hi - lo + 1));
  const randHex = () => "#" + Array.from({ length: 6 }, () => "0123456789ABCDEF"[randInt(0, 15)]).join("");
  const fuzzFails = [];
  let fuzzRun = 0;
  for (let c = 0; c < FUZZ_CASES; c++) {
    const enabled = [];
    if (randInt(0, 1)) enabled.push({ name: "neutral", on: true, key: randHex() });
    enabled.push({ name: "dominant", on: true, key: randHex(), colorRole: "dominant" });
    for (let i = 0, k = randInt(0, 4); i < k; i++) enabled.push({ name: `supporting-${i}`, on: true, key: randHex(), colorRole: "supporting" });
    for (let i = 0, k = randInt(0, 4); i < k; i++) enabled.push({ name: `accent-${i}`, on: true, key: randHex(), colorRole: "accent" });
    for (let i = 0, k = randInt(0, 2); i < k; i++) enabled.push({ name: `untagged-${i}`, on: true, key: randHex() });
    // a random split; a group may be 0 (an authored preset can drop a tier), the three sum to 100.
    // A cohort whose SHOWN tiers all have pct 0 has no pool at all: posterStripNormalize (kept as
    // is, out of this fit's remit) returns that vector unchanged, so such cohorts are re-rolled.
    let pcts;
    do {
      const raw = [rng(), rng(), rng()].map((x) => (rng() < 0.1 ? 0 : x));
      const rawSum = raw.reduce((a, b) => a + b, 0) || 1;
      pcts = raw.map((x) => Math.round((100 * x) / rawSum));
    } while (!enabled.some((p) => p.colorRole && pcts[{ dominant: 0, supporting: 1, accent: 2 }[p.colorRole]] > 0));
    const groups = [{ hier: "d", pct: pcts[0] }, { hier: "s", pct: pcts[1] }, { hier: "a", pct: pcts[2] }];
    const label = `fuzz #${c} [${enabled.map((p) => `${p.name}:${p.key}`).join(" ")}] d${pcts[0]}/s${pcts[1]}/a${pcts[2]}`;
    const r = runFit(label, enabled, groups);
    fuzzRun++;
    if (r.error) { fuzzFails.push(r.error); continue; }
    for (const m of checkFit(label, r.bands)) fuzzFails.push(m);
  }
  // every curated preset with a story is a FEASIBLE cohort: the pre-step must never fire on shipped
  // data (the ruling's claim that feasible cohorts are untouched), and every one holds the fit's
  // invariants. Widths were also checked bit-identical to main@5035189 for all 343 when #650 landed.
  {
    const cats = await Promise.all(["architecture", "brands", "cuisine", "film", "literature", "music", "nature", "travel"].map((s) => import(`../../src/ui/categories/${s}.js`)));
    let presets = 0; const presetFails = [];
    for (const { PRESETS } of cats) for (const p of PRESETS) {
      if (!p.story?.groups) continue;
      presets++;
      const r = runFit(p.name, enabledOf(p), p.story.groups);
      if (r.error) { presetFails.push(r.error); continue; }
      for (const m of checkFit(p.name, r.bands)) presetFails.push(m);
      const { capScale, floorScale } = effectiveBounds(r.bands);
      if (capScale !== 1 || floorScale !== 1) presetFails.push(`${p.name}: the feasibility pre-step fired on a curated preset (capScale ${capScale}, floorScale ${floorScale})`);
    }
    ok(presets === 343, `curated sweep: 343 presets carry a story.groups (got ${presets})`);
    ok(presetFails.length === 0, `curated sweep: every preset is feasible and holds the fit's invariants, ${presetFails.length} failure(s):\n    ` + presetFails.slice(0, 8).join("\n    "));
  }
  ok(fuzzRun === FUZZ_CASES, `fuzz: all ${FUZZ_CASES} cohorts ran (got ${fuzzRun})`);
  ok(fuzzFails.length === 0, `fuzz (seed ${FUZZ_SEED.toString(16)}, ${FUZZ_CASES} cohorts): ${fuzzFails.length} violation(s), first ${Math.min(8, fuzzFails.length)}:\n    ` + fuzzFails.slice(0, 8).join("\n    "));
}

if (fails.length) { console.error(`poster-strip FAIL (${fails.length}):\n  ` + fails.join("\n  ")); process.exit(1); }
console.log("poster-strip PASS: posterStripBands() holds all four #646 fixes directly, never drops the 2nd accent (fix 2), clamps the dominant to a chroma-scaled 35..45 cap + floors accent bands via proportional redistribution (fix 1), weights width by relative chroma without shifting a uniformly-saturated cohort (fix 3), and pins neutral first and the highest-chroma band last (fix 4), plus the review fold-ins: a capitalized Neutral + colorRole-less top-up still fill 6 bands (Maison), and every story-path vector sums to 100 with the widest band's rendered share under the cap (Corsa's worst case, War and Peace, Hero)");
process.exit(0);
