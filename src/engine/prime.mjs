// prime.mjs — the prime system: seven per-palette identity swatches on their own CIE L* ladder,
// independent of the ramp (SPEC spec-muted-base-key-spikes 0.2.0, REQ-050..053a/056; ladder rebuilt
// 2026-09-18, ticket #681 U6, owner ruling Q8/Q9). Pure, no DOM; imports only hct.js/okhsl.js/tonal.js
// helpers, never model.mjs or semantic.js (REQ-050).
//
// `prime` (index 3) sits at deriveKeyColor's (src/ui/model.mjs) OWN chromatic identity colour: its
// hue+chroma+cusp-tone construction (`baseHue`/`keyChroma`/`pk.tone`, matching deriveKeyColor exactly).
// The cusp TONE `pk.tone` returned by hct.js's peakC IS the key colour's own CIE L* already — hctToRgb's
// `tone` argument converges to that exact L* by construction (its internal binary search targets
// `lFromY(...) === tone`) — so the ladder's anchor lightness needs no OKHSL round trip at all; it reads
// `pk.tone` directly (conductor ruling 2026-09-11 fixed the hue/chroma anchor this way already; U6
// extends the same "read the REAL key colour, never a proxy" discipline to the ladder's lightness axis).
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
// samples tone 4..96 (hct.js), so every possible `pk.tone` anchor already sits inside [12.25, 96.88]
// with room to spare — unlike the old OKHSL-domain window, which the cusp construction could reach
// almost exactly (0.961183 at cam16 hue 109.75, see the retired PRIME_L_MAX history below).
import { hctToRgb, maxChromaInGamut, peakC, lstarFromRgb } from "./hct.js";
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
export function primeSwatches(palette, controls) {
  const baseHue = effHue(palette.hue, controls.hueSpace, (palette.chroma ?? 0) / 100);
  const pk = peakC(baseHue);

  // REQ-051/056 (conductor ruling 2026-09-11): the SAME construction deriveKeyColor uses
  // (baseHue/keyChroma/pk.tone). `pk.tone` IS the key colour's own CIE L* by construction (see header
  // note) — no OKHSL round trip needed to read it.
  const lPrime = pk.tone;
  const keyChroma = ((palette.chroma ?? 0) / 100) * pk.c; // the key colour's own CAM16 chroma, 100% intent

  const { up, down } = primeSteps(lPrime); // Q9 equal-compress: up === down by construction
  const g = 3 ** ((palette.skew ?? 0) / 100); // REQ-053a: the ramp's own toneAt gamma, reused as the ladder bend

  // REQ-052 (superseded 2026-09-11, re-based #681 U6 on CAM16 chroma instead of OKHSL saturation): a
  // per-palette override wins over the global control; primeChroma scales the key colour's OWN chroma.
  const pc = (palette.primeChroma ?? controls.primeChroma ?? 100) / 100;
  const cPrime = Math.max(0, keyChroma * pc);

  // REQ-053 (superseded 2026-09-11): the hue anchor is the key colour's own CAM16 hue, directly — no
  // re-solve. At primeChroma 100 the prime rung reproduces deriveKeyColor's hex EXACTLY (REQ-056):
  // `chroma` below cannot exceed `maxChromaInGamut(baseHue, lPrime)`, which IS `pk.c` (the same call
  // peakC's own sweep already made), so at t=0 `min(cPrime, cap) === cPrime === keyChroma`.
  const hOk = baseHue;

  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;

  return PRIME_STEPS.map((step, i) => {
    const t = (i - 3) / 3; // brightest -1 .. prime 0 .. dimmest +1
    const absT = Math.abs(t);
    // The bend is normalised PER SIDE — `w` runs 0..1 on each side independently — so it applies to
    // that side's OWN extent (3*up or 3*down); under equal-compress up === down, so the two sides now
    // bend identically too, not merely by the same amount of room (REQ-053a, C11 symmetry).
    const w = i < 3 ? absT ** (1 / g) : absT ** g; // light side 1/g, dark side g; w(prime)=0, w(ends)=1
    const l = i < 3 ? lPrime + 3 * up * w : lPrime - 3 * down * w;
    const dir = sameDir ? -absT : t;
    const hue = (((hOk + shift * dir) % 360) + 360) % 360;
    // Chroma is HELD at cPrime on every rung (Q9 "hold CAM16 chroma") and desaturated ONLY where the
    // gamut at this rung's own (hue, L) cannot carry it — never damped by lightness distance the way
    // the retired flat-OKHSL-saturation construction implicitly was.
    const cap = maxChromaInGamut(hue, l);
    const chroma = Math.min(cPrime, cap);
    const { rgb, inGamut } = hctToRgb(hue, chroma, l);
    const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    return { step, l, s: chroma, hue, rgb, hex, oklch: rgbToOklch(rgb), inGamut };
  });
}
