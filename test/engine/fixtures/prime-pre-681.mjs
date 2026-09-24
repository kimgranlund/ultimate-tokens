// prime-pre-681.mjs, FROZEN, committed fixture (test/engine/fixtures). Do NOT hand-edit.
//
// A byte-for-byte copy of `src/engine/prime.mjs` as it stood at `origin/main` commit `9195773`
// ("fix(prime): redistribute clipped ladder travel per side and raise PRIME_L_MAX to 0.97 (#641,
// #655) (#667)"), blob `c744fb8`, the pre-#681 OKHSL-domain redistribute-rule ladder, retired by
// ticket #681 U6's ruled equal-compress CIE L* ladder. ONLY the three relative import specifiers were
// rewritten (`./hct.js`/`./okhsl.js`/`./tonal.js` -> `../../../src/engine/...`, since this file lives
// three directories deeper); every other line, including every comment, is unchanged from the blob.
//
// USED ONLY as `test/engine/prime.mjs`'s `symmetry` gate's negative control: it needs a KNOWN-BAD
// construction (the #641 redistribute rule, which handed a clipped side's shortfall to the other side
// and produced the asymmetry #681 exists to fix) to prove the gate discriminates, per this repo's
// `checks-that-bite` doctrine (a negative control that can go silently vacuous is worse than none).
//
// This file was previously read LIVE via `git show origin/main:src/engine/prime.mjs` at test-run time
// (#681 U6, first pass), a fresh-context reviewer found that this reds `npm test` twice over: in PR
// CI, `actions/checkout@v4` on a `pull_request` event creates no `origin/main` remote-tracking ref, so
// the `git show` throws; and permanently on `main` after U6's own squash-merge, since
// `origin/main:src/engine/prime.mjs` then IS the ruled ladder and the "old" module stops producing any
// asymmetric case. Vendoring this fixture removes the git dependency entirely, the same way `d5`
// freezes hex literals instead of re-deriving them from the live implementation.
//
// If `src/engine/prime.mjs` is ever intentionally reworked again in a way that should update what
// "old" means for this control, replace this file's body with the new PREVIOUS version wholesale (not
// by editing formulas in place) and update the commit/blob citation above.
// prime.mjs, the prime system: seven per-palette identity swatches on their own OKHSL lightness
// ladder, independent of the ramp (SPEC spec-muted-base-key-spikes 0.2.0, REQ-050..053a/056). Pure,
// no DOM; imports only hct.js/okhsl.js/tonal.js helpers, never model.mjs or semantic.js (REQ-050).
//
// `prime` (index 3) sits at deriveKeyColor's (src/ui/model.mjs) OWN chromatic identity colour: its
// hue+chroma+cusp-tone construction (`baseHue`/`keyChroma`/`pk.tone`, matching deriveKeyColor exactly),
// measured back through OKHSL so `l_prime`, the hue, AND the ladder's flat saturation all read off the
// REAL key colour (`key = rgbToOkhsl(keyRgb)`) rather than a neutral-grey `l` proxy, a raw chroma-fraction
// `s` proxy, or a re-solved hue, three different quantities (CAM16 chroma fraction, OKHSL saturation,
// an Abney-corrected hue) that don't coincide with the key colour's own (conductor ruling 2026-09-11,
// ticket #537 Findings: a hue re-solve here can oscillate at very low saturation without ever converging
// — provably unreachable there, not a solver defect — and any fix belongs nowhere near tonal.js's shared
// `solveOkhslHue`, since REQ-003's frozen legacy-ramp fixture depends on its exact current behaviour).
// So at `primeChroma 100`, `prime` reproduces deriveKeyColor's hex EXACTLY (REQ-056) by construction,
// `s = key.s`, `l = key.l`, `hue = key.h`, not approximately. The other six steps share this SAME `s`
// and hue, only `l` varies, even in OKHSL `l`, held inside [PRIME_L_MIN, PRIME_L_MAX] = [0.14, 0.97], bent by
// `skew` as a gamma on ladder position (REQ-053a) with `prime` and both ends fixed.
//
// The ladder's per-side step sizes come from `primeSteps` (REQ-051, ticket #641): the anchor stays
// pinned at `key.l` (REQ-056's mechanism), so a hue whose cusp tone sits near a bound has less room
// on that side than `PRIME_STEP` asks for. That shortfall is handed to the OTHER side rather than
// silently shortening the ladder, so every hue at every chroma spans the full 6 x PRIME_STEP.
//
// PRIME_L_MAX is 0.97, not the 0.94 R1 originally ratified (raised 2026-09-17, ticket #655 folded
// into #641 by owner ruling). 0.94 was BELOW the cusp construction's own reach: `lPrime` peaks at
// 0.961183 (cam16 hue 109.75, chroma 0.75; the oklch peak is the same value at hue ~98), so for
// yellow-green hues the ANCHOR itself fell outside the window and the light side inverted. The
// ceiling must therefore clear 0.961183; 0.97 is the smallest round value that also keeps the three
// light swatches DISTINCT in 8-bit hex at every swept hue/chroma in both hue spaces (0.962 collapses
// all four light entries to one hex at the worst cell; 0.967 is the bare minimum and sits exactly on
// the quantisation cliff). PRIME_L_MIN is unchanged.
import { hctToRgb, peakC } from "../../../src/engine/hct.js";
import { okhslToRgb, rgbToOkhsl } from "../../../src/engine/okhsl.js";
import { effHue } from "../../../src/engine/tonal.js";

export const PRIME_STEPS = ["brightest", "brighter", "bright", "prime", "dim", "dimmer", "dimmest"];
export const PRIME_STEP = 0.09;
export const PRIME_L_MIN = 0.14;
export const PRIME_L_MAX = 0.97;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

// primeSteps(lPrime), REQ-051 (amended 2026-09-17, ticket #641). The per-side step size of the
// seven-swatch ladder around a FIXED anchor at `lPrime`. Each side naturally wants `PRIME_STEP`, and
// has room for `(PRIME_L_MAX - lPrime) / 3` up / `(lPrime - PRIME_L_MIN) / 3` down. A side that
// cannot take its full step is clipped, and the travel it loses is handed to the other side, capped
// by that side's own room, so the two sides are each internally even but differ from each other by
// exactly the handed-over travel, and the total span stays 3*up + 3*down = 6 * PRIME_STEP.
//
// `roomUp + roomDown` is `(PRIME_L_MAX - PRIME_L_MIN) / 3` for ANY lPrime inside the bounds,
// 0.276667, comfortably above the 0.18 the full span needs, so the receiving side always has the
// room, and at most one side is ever clipped (a side clips only within PRIME_STEP*3 of its bound, and
// the two bounds are further apart than that). An unclipped palette gets `short === 0` and is
// untouched. Each room is floored at 0 so that an anchor somehow outside the window can never credit
// NEGATIVE travel to the other side (#655/F1); with PRIME_L_MAX 0.97 no such anchor exists, the
// AC-050 (d4) gate asserts zero of them across the full sweep in both hue spaces, but a future
// change to the cusp construction must not silently reintroduce an inverted ladder.
export function primeSteps(lPrime) {
  const roomUp = Math.max(0, (PRIME_L_MAX - lPrime) / 3);
  const roomDown = Math.max(0, (lPrime - PRIME_L_MIN) / 3);
  let up = Math.min(PRIME_STEP, roomUp);
  let down = Math.min(PRIME_STEP, roomDown);
  const short = (PRIME_STEP - up) + (PRIME_STEP - down); // travel lost to clipping, 0 when neither clips
  if (up >= PRIME_STEP) up = Math.min(roomUp, up + short); // only an UNCLIPPED side absorbs
  if (down >= PRIME_STEP) down = Math.min(roomDown, down + short);
  return { up, down };
}

// rgbToOklch([r,g,b]), local sRGB(0..255)->OKLCH(L,C,H) helper (Björn Ottosson's matrices, the same
// ones okhsl.js's private linearSrgbToOklab uses). prime.mjs may only import hct.js/okhsl.js/tonal.js
// (REQ-050), and neither exports the full L,C,H triple (okhsl.js's rgbToOklchHue returns H alone), so
// this is its own minimal copy, mirroring exports.js's identically-scoped private rgbToOklch.
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

// primeSwatches(palette, controls), REQ-050. Returns seven { step, l, s, hue, rgb, hex, oklch,
// inGamut } entries, brightest..dimmest, lightest first. Deterministic; no DOM.
export function primeSwatches(palette, controls) {
  const baseHue = effHue(palette.hue, controls.hueSpace, (palette.chroma ?? 0) / 100);
  const pk = peakC(baseHue);

  // REQ-051/052/REQ-056 (conductor ruling 2026-09-11): the SAME construction deriveKeyColor uses
  // (baseHue/keyChroma/pk.tone), measured back through OKHSL so l_prime, the hue anchor, AND the
  // ladder's flat saturation all read off the REAL key colour, not a neutral-grey `l` proxy or a raw
  // chroma-fraction `s` proxy (two different quantities that don't coincide).
  const keyChroma = ((palette.chroma ?? 0) / 100) * pk.c;
  const keyRgb = hctToRgb(baseHue, keyChroma, pk.tone).rgb;
  const key = rgbToOkhsl(keyRgb); // { h, s, l } of the REAL key colour
  const lPrime = key.l;

  const { up, down } = primeSteps(lPrime); // REQ-051: even per side, clipped travel redistributed
  const g = 3 ** ((palette.skew ?? 0) / 100); // REQ-053a: the ramp's own toneAt gamma, reused as the ladder bend

  // REQ-052 (superseded 2026-09-11): flat OKHSL saturation is the key colour's OWN saturation scaled
  // by prime chroma, no damping; a per-palette override wins over the global control.
  const pc = (palette.primeChroma ?? controls.primeChroma ?? 100) / 100;
  const s = clamp01(key.s * pc);

  // REQ-053 (superseded 2026-09-11): the hue anchor is the key colour's own measured OKHSL hue,
  // directly, no re-solve. `s`/`l` above already equal `key.s`/`key.l` at primeChroma 100, so this
  // anchor reproduces the key colour exactly there, not merely close.
  const hOk = key.h;

  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;

  return PRIME_STEPS.map((step, i) => {
    const t = (i - 3) / 3; // brightest -1 .. prime 0 .. dimmest +1
    const absT = Math.abs(t);
    // The bend is normalised PER SIDE, `w` runs 0..1 on each side independently, so it applies to
    // that side's OWN extent (3*up or 3*down), whatever redistribution made those extents (REQ-053a).
    const w = i < 3 ? absT ** (1 / g) : absT ** g; // light side 1/g, dark side g; w(prime)=0, w(ends)=1
    const l = i < 3 ? lPrime + 3 * up * w : lPrime - 3 * down * w;
    const dir = sameDir ? -absT : t;
    const hue = (((hOk + shift * dir) % 360) + 360) % 360;
    const rgb = okhslToRgb(hue, s, l);
    const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    return { step, l, s, hue, rgb, hex, oklch: rgbToOklch(rgb), inGamut: true };
  });
}
