// prime.mjs — the prime system: seven per-palette identity swatches on their own OKHSL lightness
// ladder, independent of the ramp (SPEC spec-muted-base-key-spikes 0.2.0, REQ-050..053a/056). Pure,
// no DOM; imports only hct.js/okhsl.js/tonal.js helpers, never model.mjs or semantic.js (REQ-050).
//
// `prime` (index 3) sits at deriveKeyColor's (src/ui/model.mjs) OWN chromatic identity colour: its
// hue+chroma+cusp-tone construction (`baseHue`/`keyChroma`/`pk.tone`, matching deriveKeyColor exactly),
// measured back through OKHSL so `l_prime`, the hue, AND the ladder's flat saturation all read off the
// REAL key colour (`key = rgbToOkhsl(keyRgb)`) rather than a neutral-grey `l` proxy, a raw chroma-fraction
// `s` proxy, or a re-solved hue — three different quantities (CAM16 chroma fraction, OKHSL saturation,
// an Abney-corrected hue) that don't coincide with the key colour's own (conductor ruling 2026-09-11,
// ticket #537 Findings: a hue re-solve here can oscillate at very low saturation without ever converging
// — provably unreachable there, not a solver defect — and any fix belongs nowhere near tonal.js's shared
// `solveOkhslHue`, since REQ-003's frozen legacy-ramp fixture depends on its exact current behaviour).
// So at `primeChroma 100`, `prime` reproduces deriveKeyColor's hex EXACTLY (REQ-056) by construction —
// `s = key.s`, `l = key.l`, `hue = key.h`, not approximately. The other six steps share this SAME `s`
// and hue, only `l` varies, even in OKHSL `l`, edge-compressed into [PRIME_L_MIN, PRIME_L_MAX], bent by
// `skew` as a gamma on ladder position (REQ-053a) with `prime` and both ends fixed.
import { hctToRgb, peakC } from "./hct.js";
import { okhslToRgb, rgbToOkhsl } from "./okhsl.js";
import { effHue } from "./tonal.js";

export const PRIME_STEPS = ["brightest", "brighter", "bright", "prime", "dim", "dimmer", "dimmest"];
export const PRIME_STEP = 0.09;
export const PRIME_L_MIN = 0.14;
export const PRIME_L_MAX = 0.94;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

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
// inGamut } entries, brightest..dimmest, lightest first. Deterministic; no DOM.
export function primeSwatches(palette, controls) {
  const baseHue = effHue(palette.hue, controls.hueSpace, (palette.chroma ?? 0) / 100);
  const pk = peakC(baseHue);

  // REQ-051/052/REQ-056 (conductor ruling 2026-09-11): the SAME construction deriveKeyColor uses
  // (baseHue/keyChroma/pk.tone) — measured back through OKHSL so l_prime, the hue anchor, AND the
  // ladder's flat saturation all read off the REAL key colour, not a neutral-grey `l` proxy or a raw
  // chroma-fraction `s` proxy (two different quantities that don't coincide).
  const keyChroma = ((palette.chroma ?? 0) / 100) * pk.c;
  const keyRgb = hctToRgb(baseHue, keyChroma, pk.tone).rgb;
  const key = rgbToOkhsl(keyRgb); // { h, s, l } of the REAL key colour
  const lPrime = key.l;

  const up = Math.min(PRIME_STEP, (PRIME_L_MAX - lPrime) / 3);
  const down = Math.min(PRIME_STEP, (lPrime - PRIME_L_MIN) / 3);
  const g = 3 ** ((palette.skew ?? 0) / 100); // REQ-053a: the ramp's own toneAt gamma, reused as the ladder bend

  // REQ-052 (superseded 2026-09-11): flat OKHSL saturation is the key colour's OWN saturation scaled
  // by prime chroma, no damping. Rename window (P2..P3, LLD Risk 2): controls.primeChroma does not
  // exist yet post-P1 — fall through to the still-live controls.keyIntensity, and let a per-palette
  // override win over either global.
  const pc = (palette.primeChroma ?? controls.primeChroma ?? controls.keyIntensity ?? 100) / 100;
  const s = clamp01(key.s * pc);

  // REQ-053 (superseded 2026-09-11): the hue anchor is the key colour's own measured OKHSL hue,
  // directly — no re-solve. `s`/`l` above already equal `key.s`/`key.l` at primeChroma 100, so this
  // anchor reproduces the key colour exactly there, not merely close.
  const hOk = key.h;

  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;

  return PRIME_STEPS.map((step, i) => {
    const t = (i - 3) / 3; // brightest -1 .. prime 0 .. dimmest +1
    const absT = Math.abs(t);
    const w = i < 3 ? absT ** (1 / g) : absT ** g; // light side 1/g, dark side g; w(prime)=0, w(ends)=1
    const l = i < 3 ? lPrime + 3 * up * w : lPrime - 3 * down * w;
    const dir = sameDir ? -absT : t;
    const hue = (((hOk + shift * dir) % 360) + 360) % 360;
    const rgb = okhslToRgb(hue, s, l);
    const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    return { step, l, s, hue, rgb, hex, oklch: rgbToOklch(rgb), inGamut: true };
  });
}
