// prime.mjs — the prime system: seven per-palette identity swatches on their own CIE L* ladder,
// independent of the ramp (SPEC spec-muted-base-key-spikes 0.2.0, REQ-050..053a/056; ladder rebuilt
// 2026-09-18, ticket #681 U6, owner ruling Q8/Q9). Pure, no DOM; imports only hct.js/okhsl.js/tonal.js
// helpers, never model.mjs or semantic.js (REQ-050).
//
// `prime` (index 3) sits at deriveKeyColor's (src/ui/model.mjs) OWN chromatic identity colour: its
// hue+chroma+cusp-tone construction (`baseHue`/`keyChroma`/`pk.tone`, matching deriveKeyColor exactly —
// gate (h) asserts byte identity, not a tolerance). The cusp TONE `pk.tone`, returned by hct.js's
// SHARED `peakC` (see the import-block note below for why this is the shared function, not a private
// copy), IS the key colour's own CIE L* already — hctToRgb's `tone` argument converges to that exact
// L* by construction (its internal binary search targets `lFromY(...) === tone`) — so the ladder's
// anchor lightness needs no OKHSL round trip at all; it reads `pk.tone` directly (conductor ruling
// 2026-09-11 fixed the hue/chroma anchor this way already; U6 extends the same "read the REAL key
// colour, never a proxy" discipline to the ladder's lightness axis).
//
// REQ-050..053a/056 pre-#681: the other six rungs shared the anchor's flat OKHSL saturation, only OKHSL
// `l` varied. Owner ruling 2026-09-18 (screenshot finding: brightest/dimmest did not read 1:1 around
// prime) replaces that with Q9's ruled ladder: CIE L* is the metric (the ramp's own tone axis, the
// contrast maths, and every pixel-measured gate already read L*), a rung is built by rendering
// `hctToRgb(anchorHue, chroma, L)` directly in HCT space — so chroma is HELD at the anchor's own CAM16
// chroma on every rung and only the GAMUT desaturates a rung that cannot carry it — and at a bound
// ("equal-compress", Q9) BOTH sides take the smaller side's room, so the two sides are equal BY
// CONSTRUCTION, not merely close (replacing #641's redistribute rule, which handed a clipped side's
// shortfall to the other side and produced the very asymmetry the owner flagged). Q8 keeps the 54 L*
// total span (6 x STEP_L, STEP_L = 9).
//
// PRIME_L_MIN/PRIME_L_MAX are expressed in CIE L*, DERIVED (not retyped) from the two OKHSL-domain grey
// bounds the ladder used pre-#681 (0.14 dark / 0.97 light — 0.97 raised from 0.94 at #655/#641, the
// smallest round OKHSL `l` that clears the cusp construction's OKHSL-domain reach and keeps the three
// light swatches distinct in 8-bit hex). A grey has no hue/chroma, so converting `okhslToRgb(0,0,l)`
// through `lstarFromRgb` is exact and keeps ONE source of truth for the window instead of a second,
// independently-typed L* literal that could drift from the OKHSL one. The window's REAL job under the
// new construction is generous headroom, not a tight ceiling: `peakC`'s own cusp-tone search only ever
// samples tone 4..96, so every possible `pk.tone` anchor already sits inside [12.25, 96.88] with room
// to spare — unlike the old OKHSL-domain window, which the cusp construction could reach almost
// exactly (0.961183 at cam16 hue 109.75, see the retired PRIME_L_MAX history below).
//
// This file calls hct.js's SHARED `maxChromaInGamut`/`peakC` directly — no private re-implementation
// (#686, #681 U6 review passes 1/2/3/4). Earlier passes shipped a private, exact-keyed
// `localMaxChroma`/`localPeakC` INSIDE this file specifically to dodge hct.js's own `hue.toFixed(2)`
// cache-key truncation (a real, reproduced order-dependence: two calls for the identical logical
// palette could return different hex values depending on what else had rendered earlier in the same
// process). That workaround fixed THIS file in isolation but could never close the whole defect,
// because `src/ui/model.mjs`'s `deriveKeyColor` — this file's own REQ-056 comparison target, out of
// this unit's lane — reads the SAME shared `peakC`/`maxChromaInGamut` `primeSwatches` used to call, so
// a private recompute here just meant the two disagreed under a collision instead of agreeing (review
// pass 4, finding N8: measured `#671CF1` here vs. `deriveKeyColor`'s `#671CF2` for the same input,
// after `effHue`'s own oklch path had warmed the shared `peakC` cache for a neighbouring hue). The
// root cause was hct.js's cache KEY, not which caller owned a copy of the search: `hct.js` now keys
// `maxChromaInGamut`/`peakC`/`oklchToCam16Hue` on the EXACT float (issue #686), so a cache hit only
// ever fires for a bit-identical repeat and returns exactly what a fresh computation would — a
// genuinely pure function of its own arguments, shared or not. With that fixed at the source, this
// file reads the shared functions directly: REQ-056 holds by construction (the anchor call is now
// LITERALLY the same call `deriveKeyColor` makes, not a parallel one that could disagree), and the
// duplicate private caches the reviewer objected to are gone.
import { hctToRgb, lstarFromRgb, maxChromaInGamut, peakC, cam16FromRgb } from "./hct.js";
import { okhslToRgb } from "./okhsl.js";
import { effHue } from "./tonal.js";

export const PRIME_STEPS = ["brightest", "brighter", "bright", "prime", "dim", "dimmer", "dimmest"];

// The two OKHSL-domain grey bounds the ladder's window was ratified against pre-#681 (see the header
// note); kept as the single typed source, converted below rather than retyped as L* literals.
const GREY_L_LO = 0.14;
const GREY_L_HI = 0.97;
export const PRIME_L_MIN = lstarFromRgb(okhslToRgb(0, 0, GREY_L_LO)); // ≈ 12.25
export const PRIME_L_MAX = lstarFromRgb(okhslToRgb(0, 0, GREY_L_HI)); // ≈ 96.88

// STEP_L — CIE L* per rung (Q8/Q9 ruled: keep the pre-#681 total span, 6 x STEP_L = 54 L*).
export const STEP_L = 9;
// PRIME_STEP retired 2026-09-18 (#681 U6): the ladder no longer has an OKHSL-domain step; STEP_L is
// its L*-domain replacement. Nothing outside this file and its own test imported PRIME_STEP.

// primeSteps(lPrimeStar) — REQ-051, re-ruled 2026-09-18 (Q9, "equal-compress"). The per-side CIE L*
// step of the seven-swatch ladder around a FIXED anchor at `lPrimeStar`. Each side naturally wants
// STEP_L and has room `(PRIME_L_MAX - lPrimeStar) / 3` up / `(lPrimeStar - PRIME_L_MIN) / 3` down. At a
// bound, BOTH sides take the SMALLER side's room — never one side alone — so `up` and `down` are the
// same number by construction: the owner's "equal on both sides" ruling holds even where the ladder is
// short, not only where it fits. Each room is floored at 0 so an anchor outside the window (none exist
// today, see the header note) can never credit negative travel (#655/F1 precedent, carried over).
export function primeSteps(lPrimeStar) {
  const roomUp = Math.max(0, (PRIME_L_MAX - lPrimeStar) / 3);
  const roomDown = Math.max(0, (lPrimeStar - PRIME_L_MIN) / 3);
  const step = Math.min(STEP_L, roomUp, roomDown);
  return { up: step, down: step };
}

// hexToRgb(hex) — local "#RRGGBB" -> sRGB(0..255) triple. Same REQ-050 reasoning as rgbToOklch below:
// prime.mjs may only import hct.js/okhsl.js/tonal.js, none of which export a hex parser, so this is
// its own minimal copy (mirrors gen-categories.mjs's/exports.js's identically-scoped private ones).
const ANCHOR_HEX = /^#[0-9A-Fa-f]{6}$/;
function hexToRgb(hex) {
  const s = hex.slice(1);
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

// rgbToOklch([r,g,b]) — local sRGB(0..255)->OKLCH(L,C,H) helper (Björn Ottosson's matrices, the same
// ones okhsl.js's private linearSrgbToOklab uses). prime.mjs may only import hct.js/okhsl.js/tonal.js
// (REQ-050), and neither exports the full L,C,H triple (okhsl.js's rgbToOklchHue returns H alone), so
// this is its own minimal copy — mirroring exports.js's identically-scoped private rgbToOklch.
function rgbToOklch([r, g, b]) {
  const inv = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const rl = inv(r), gl = inv(g), bl = inv(b);
  const l = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl;
  const m = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl;
  const s = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl;
  const l_ = Math.cbrt(l), m_ = Math.cbrt(m), s_ = Math.cbrt(s);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b2 = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(a * a + b2 * b2);
  let H = C < 0.00005 ? 0 : (Math.atan2(b2, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return [L, C, H];
}

// primeSwatches(palette, controls) — REQ-050. Returns seven { step, l, s, hue, rgb, hex, oklch,
// inGamut } entries, brightest..dimmest, lightest first. `l` is the rung's CIE L* (its `hctToRgb` tone
// argument, exact); `s` is the rung's rendered CAM16 chroma (renamed in USE, not in shape, from the
// retired OKHSL-domain field — REQ-052's per-palette/global `primeChroma` control still scales it
// linearly, gate (g) re-based #681 U6); `hue` is the anchor's own CAM16 hue (matching deriveKeyColor,
// REQ-053 superseded 2026-09-11). Deterministic; no DOM.
//
// ANCHOR BRANCH (ticket #681, U1 — "every preset's prime.DEFAULT is its sampled source colour
// byte-for-byte"; #681 U4 integration onto U6's ladder): a palette carrying a valid `anchor` (a STORED
// source hex, never fitted — see persist.js DOMAINS.palette.anchor) renders its `prime` step (index 3)
// from that hex VERBATIM, never reconstructed via hctToRgb — the ticket's baseline measured the round
// trip `hctToRgb(cam16FromRgb(anchorRgb))` is not guaranteed byte-exact either, so a re-derived swatch
// cannot be trusted to reproduce the stored hex exactly; the stored bytes always can, by definition.
// The other six rungs ladder off the anchor's OWN measured CIE L*/CAM16 hue/chroma (`lstarFromRgb`/
// `cam16FromRgb(anchorRgb)`) through the SAME U6 equal-compress, hold-chroma construction every
// non-anchored palette uses — the same "read off the real colour, not a proxy" principle already
// applies in the non-anchored (deriveKeyColor) case, just anchored to the palette's stored source
// instead of its cusp identity. A palette with no (or malformed) `anchor` takes the ORIGINAL,
// byte-identical path below (C4's non-anchored identity control): `anchorHex` is null, `lLadder ===
// lPrime`, and every other line executes exactly as it did before this ticket.
export function primeSwatches(palette, controls) {
  const anchorHex = typeof palette.anchor === "string" && ANCHOR_HEX.test(palette.anchor) ? palette.anchor.toUpperCase() : null;

  let lPrime, keyChroma, hOk, anchorRgb, anchorOklch;
  if (anchorHex) {
    anchorRgb = hexToRgb(anchorHex);
    anchorOklch = rgbToOklch(anchorRgb);
    const cam = cam16FromRgb(anchorRgb); // { hue, chroma, J } of the REAL, STORED source colour
    lPrime = lstarFromRgb(anchorRgb); // the anchor's own CIE L*, exact — never an OKHSL round trip
    keyChroma = cam.chroma;
    hOk = cam.hue;
  } else {
    const baseHue = effHue(palette.hue, controls.hueSpace, (palette.chroma ?? 0) / 100);
    const pk = peakC(baseHue); // SHARED (hct.js, exact-keyed per #686) — the SAME call deriveKeyColor makes.

    // REQ-051/056 (conductor ruling 2026-09-11): the SAME construction deriveKeyColor uses
    // (baseHue/keyChroma/pk.tone). `pk.tone` IS the key colour's own CIE L* by construction (see
    // header note) — no OKHSL round trip needed to read it.
    lPrime = pk.tone;
    keyChroma = ((palette.chroma ?? 0) / 100) * pk.c; // the key colour's own CAM16 chroma, 100% intent
    hOk = baseHue;
  }
  const g = 3 ** ((palette.skew ?? 0) / 100); // REQ-053a: the ramp's own toneAt gamma, reused as the ladder bend

  // REQ-052 (superseded 2026-09-11, re-based #681 U6 on CAM16 chroma instead of OKHSL saturation): a
  // per-palette override wins over the global control; primeChroma scales the key colour's OWN chroma.
  // Per the ticket's "never moves it," this does NOT apply to the anchor's own verbatim prime rung
  // below — only to the six ladder rungs, anchored or not.
  const pc = (palette.primeChroma ?? controls.primeChroma ?? 100) / 100;
  const cPrime = Math.max(0, keyChroma * pc);

  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;

  // rungHex(i, lLadderArg, up, down) — the SAME l/hue/chroma/hex a real ladder rung (i !== 3) would
  // render, used both by the widening search below and by the final PRIME_STEPS.map so the two can
  // never disagree (same discipline as U1's own pre-U6 widening search, ported below).
  function rungHex(i, lLadderArg, up, down) {
    const t = (i - 3) / 3;
    const absT = Math.abs(t);
    const w = i < 3 ? absT ** (1 / g) : absT ** g;
    const l = i < 3 ? lLadderArg + 3 * up * w : lLadderArg - 3 * down * w;
    const dir = sameDir ? -absT : t;
    const hue = (((hOk + shift * dir) % 360) + 360) % 360;
    const cap = maxChromaInGamut(hue, l);
    const chroma = Math.min(cPrime, cap);
    const { rgb } = hctToRgb(hue, chroma, l);
    return "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  // Q3 (b), ruled: the `prime` step is exact regardless of the ladder window; the six OTHER steps
  // clamp their ladder anchor into [PRIME_L_MIN, PRIME_L_MAX] so a source outside that window (e.g. a
  // near-white or very dark sampled swatch) still gets a real six-rung ladder rather than `primeSteps`
  // crediting one side out-of-domain room (its own floor-at-0 only guards a side past ITS OWN bound,
  // never an lPrime past BOTH bounds at once — a case the cusp construction can't produce, REQ-051's
  // own comment, but a stored anchor CAN). Non-anchored: identical to `lPrime` (a no-op), so
  // `primeSteps` sees exactly what it always did.
  let lLadder = anchorHex ? Math.min(PRIME_L_MAX, Math.max(PRIME_L_MIN, lPrime)) : lPrime;
  let { up, down } = primeSteps(lLadder); // Q9 equal-compress: up === down by construction

  // F1-style widening (U4 integration review pass 1, Finding A; ports U1's own pre-U6 OKHSL widening
  // search, commit 7bda1d7e, into this L*-domain construction). At the exact window bound, equal-
  // compress's own `min(STEP_L, roomUp, roomDown)` reads 0 on BOTH sides at once (roomDown === 0 pins
  // `step` to 0 for roomUp too, unlike the old per-side redistribute rule) — collapsing all six
  // non-prime rungs onto the single clamped `lLadder` value. Q3 (b) still holds (`prime` never moves:
  // `lPrime`/`anchorHex` are untouched below); this loop only widens the LADDER's own pivot away from
  // the bound, by the same amount on both sides (equal-compress's own invariant is preserved, unlike
  // the old redistribute search), until the six ladder rungs plus the anchor are all distinct hexes —
  // capped at a full STEP_L of reserve on each side (the ladder's own nominal per-side step; beyond
  // that the window is offering less room than the ladder was ever designed to need). RESERVE_UNIT is
  // the old search's 0.001 (of a 0..1 OKHSL domain) scaled by the ~100x L*-domain factor the rest of
  // this file already uses for PRIME_L_MIN/MAX (header note) — same step count (90), same search. A
  // handful of sampled sources sit close enough to a bound that even a full STEP_L of reserve cannot
  // separate `dimmest`/`brightest` from `prime` or from each other — those are named, counted and
  // accepted by test/engine/anchor.mjs's `anchor-ladder` order/dupe allow-lists rather than silently
  // passed here.
  if (anchorHex) {
    const RESERVE_UNIT = 0.1;
    const distinct = (lLadderArg, up, down) => {
      const seen = new Set([anchorHex]);
      for (let i = 0; i < 7; i++) {
        if (i === 3) continue;
        const hx = rungHex(i, lLadderArg, up, down);
        if (seen.has(hx)) return false;
        seen.add(hx);
      }
      return true;
    };
    if (!distinct(lLadder, up, down)) {
      for (let reserve = RESERVE_UNIT; reserve <= STEP_L + 1e-9; reserve += RESERVE_UNIT) {
        const lo = PRIME_L_MIN + 3 * reserve, hi = PRIME_L_MAX - 3 * reserve;
        if (lo > hi) break; // the window has nothing left to reserve from either side
        const candidate = Math.min(hi, Math.max(lo, lPrime));
        const steps = primeSteps(candidate);
        lLadder = candidate;
        up = steps.up;
        down = steps.down;
        if (distinct(lLadder, up, down)) break; // keep the LAST (most-widened) attempt otherwise
      }
    }
  }

  return PRIME_STEPS.map((step, i) => {
    // The anchor branch's `prime` step (i===3) renders the STORED hex verbatim — unconditionally,
    // never scaled by `primeChroma` (unlike the other six rungs' chroma below): the ticket's "never
    // moves it" applies even to that control, not only to the hctToRgb round trip this bypasses.
    if (anchorHex && i === 3) {
      return { step, l: lPrime, s: keyChroma, hue: hOk, rgb: anchorRgb, hex: anchorHex, oklch: anchorOklch, inGamut: true };
    }
    const t = (i - 3) / 3; // brightest -1 .. prime 0 .. dimmest +1
    const absT = Math.abs(t);
    // The bend is normalised PER SIDE — `w` runs 0..1 on each side independently — so it applies to
    // that side's OWN extent (3*up or 3*down); under equal-compress up === down, so the two sides now
    // bend identically too, not merely by the same amount of room (REQ-053a, C11 symmetry).
    const w = i < 3 ? absT ** (1 / g) : absT ** g; // light side 1/g, dark side g; w(prime)=0, w(ends)=1
    const l = i < 3 ? lLadder + 3 * up * w : lLadder - 3 * down * w;
    const dir = sameDir ? -absT : t;
    const hue = (((hOk + shift * dir) % 360) + 360) % 360;
    // Chroma is HELD at cPrime on every rung (Q9 "hold CAM16 chroma") and desaturated ONLY where the
    // gamut at this rung's own (hue, L) cannot carry it — never damped by lightness distance the way
    // the retired flat-OKHSL-saturation construction implicitly was. SHARED `maxChromaInGamut` (#686:
    // exact-keyed, so no different-hue collision can silently clip or over-carry a rung's chroma).
    const cap = maxChromaInGamut(hue, l);
    const chroma = Math.min(cPrime, cap);
    const { rgb, inGamut } = hctToRgb(hue, chroma, l);
    const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    return { step, l, s: chroma, hue, rgb, hex, oklch: rgbToOklch(rgb), inGamut };
  });
}
