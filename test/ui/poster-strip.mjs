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
import { POSTER_STRIP_ACCENT_FLOOR_PCT, POSTER_STRIP_MAX_BAND_PCT, posterStripBands } from "../../src/ui/app-helpers.mjs";
import { hexToOklch } from "../../src/ui/model.mjs";
import { paletteKeyColors } from "../../src/ui/model.mjs";
import { hydrate } from "../../src/ui/persist.js";
import { PRESETS as LITERATURE_PRESETS } from "../../src/ui/categories/literature.js";
import { PRESETS as FILM_PRESETS } from "../../src/ui/categories/film.js";

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
const chroma = (hex) => hexToOklch(hex)[1];
const near = (a, b, tol = 0.01) => Math.abs(a - b) < tol;

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
  // dominant's authored share (50% * 92% = 46%) uncapped would swamp the strip — clamped to the max.
  ok(near(byName["dominant-swatch"].width, POSTER_STRIP_MAX_BAND_PCT), `the dominant band is clamped to the max band share (want ${POSTER_STRIP_MAX_BAND_PCT}, got ${byName["dominant-swatch"].width.toFixed(2)})`);
  // accent's authored share (10% * 92% / 2 = 4.6% each) uncapped would be a sliver — floored up.
  ok(byName["accent-1"].width >= POSTER_STRIP_ACCENT_FLOOR_PCT - 0.01 && byName["accent-2"].width >= POSTER_STRIP_ACCENT_FLOOR_PCT - 0.01,
    `both accent bands are floored to at least the accent floor (want >= ${POSTER_STRIP_ACCENT_FLOOR_PCT}, got ${byName["accent-1"].width.toFixed(2)}/${byName["accent-2"].width.toFixed(2)})`);
  ok(near(byName.neutral.width, 8), `neutral keeps its fixed 8% backdrop share untouched by the clamp/floor pass (got ${byName.neutral.width.toFixed(2)})`);
  // the clamp's surplus + the floor's deficit must net out somewhere on the two surviving
  // supporting bands (the only flexible, non-locked, non-floored bands left) — neither goes negative.
  ok(byName["supporting-1"].width > 0 && byName["supporting-2"].width > 0, `redistribution never pushes a flexible band negative (got ${byName["supporting-1"].width.toFixed(2)}/${byName["supporting-2"].width.toFixed(2)})`);
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
  const widthsByRole = (bands) => bands.map((b) => +b.width.toFixed(6)).sort((a, b) => a - b);
  ok(JSON.stringify(widthsByRole(lowBands)) === JSON.stringify(widthsByRole(highBands)),
    `a uniformly muted cohort renders the SAME width distribution as a uniformly vivid one at the same authored pcts (low=${JSON.stringify(widthsByRole(lowBands))}, high=${JSON.stringify(widthsByRole(highBands))})`);
}

// ── fix 4: reorder so the two highest-chroma bands sit at the strip's two edges ─────────────────
{
  const bands = posterStripBands(ENABLED, GROUPS);
  const byChromaDesc = [...bands].sort((a, b) => chroma(b.key) - chroma(a.key));
  const edgeKeys = [bands[0].key, bands[bands.length - 1].key];
  const top2Keys = [byChromaDesc[0].key, byChromaDesc[1].key];
  ok(edgeKeys.includes(top2Keys[0]) && edgeKeys.includes(top2Keys[1]), `the strip's two edge bands are its two highest-chroma swatches (edges=${edgeKeys.join(",")}, top2=${top2Keys.join(",")})`);
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
  ok(near(wpDominant.width, POSTER_STRIP_MAX_BAND_PCT), `War and Peace: the candle-gold dominant (authored 50%, ~46% uncapped) is clamped (want ${POSTER_STRIP_MAX_BAND_PCT}, got ${wpDominant.width.toFixed(2)})`);
  ok(wpAccents.every((b) => b.width >= POSTER_STRIP_ACCENT_FLOOR_PCT - 0.01), `War and Peace: both accent bands are floored, no longer slivers (got ${wpAccents.map((b) => b.width.toFixed(2))})`);

  const hero = FILM_PRESETS.find((p) => p.name.includes("Hero · 2002"));
  const heroEnabled = paletteKeyColors(hydrate(hero)).filter((p) => p.on);
  const heroBands = posterStripBands(heroEnabled, hero.story.groups);
  const heroDominant = heroBands.find((b) => b.colorRole === "dominant");
  const heroRest = heroBands.filter((b) => b.name !== heroDominant.name);
  ok(chroma(heroDominant.key) > 0.15, `test setup: Hero's dominant (courtyard red) really is already high-chroma (got ${chroma(heroDominant.key).toFixed(3)})`);
  ok(heroDominant.width >= 30, `Hero: an already-vivid dominant is NOT over-compressed by the clamp (got ${heroDominant.width.toFixed(2)})`);
  ok(heroRest.every((b) => heroDominant.width >= b.width * 2), `Hero: the vivid dominant remains clearly the strip's leading band, at least 2x its widest neighbor (dominant=${heroDominant.width.toFixed(2)}, rest=${heroRest.map((b) => b.width.toFixed(2)).join(",")})`);
}

if (fails.length) { console.error(`poster-strip FAIL (${fails.length}):\n  ` + fails.join("\n  ")); process.exit(1); }
console.log("poster-strip PASS: posterStripBands() holds all four #646 fixes directly — never drops the 2nd accent (fix 2), clamps the max band + floors accent bands via proportional redistribution (fix 1), weights width by relative chroma without shifting a uniformly-saturated cohort (fix 3), and reorders the two highest-chroma bands to the strip's edges (fix 4) — against both a hand-built cohort and two real curated presets (War and Peace's low-chroma dominant, Hero's already-vivid one)");
process.exit(0);
