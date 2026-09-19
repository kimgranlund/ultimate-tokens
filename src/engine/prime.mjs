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
import { hctToRgb, peakC } from "./hct.js";
import { okhslToRgb, rgbToOkhsl } from "./okhsl.js";
import { effHue } from "./tonal.js";

export const PRIME_STEPS = ["brightest", "brighter", "bright", "prime", "dim", "dimmer", "dimmest"];
export const PRIME_STEP = 0.09;
export const PRIME_L_MIN = 0.14;
export const PRIME_L_MAX = 0.97;

const clamp01 = (v) => Math.min(1, Math.max(0, v));

// primeSteps(lPrime) — REQ-051 (amended 2026-09-17, ticket #641). The per-side step size of the
// seven-swatch ladder around a FIXED anchor at `lPrime`. Each side naturally wants `PRIME_STEP`, and
// has room for `(PRIME_L_MAX - lPrime) / 3` up / `(lPrime - PRIME_L_MIN) / 3` down. A side that
// cannot take its full step is clipped, and the travel it loses is handed to the other side, capped
// by that side's own room — so the two sides are each internally even but differ from each other by
// exactly the handed-over travel, and the total span stays 3*up + 3*down = 6 * PRIME_STEP.
//
// `roomUp + roomDown` is `(PRIME_L_MAX - PRIME_L_MIN) / 3` for ANY lPrime inside the bounds —
// 0.276667, comfortably above the 0.18 the full span needs — so the receiving side always has the
// room, and at most one side is ever clipped (a side clips only within PRIME_STEP*3 of its bound, and
// the two bounds are further apart than that). An unclipped palette gets `short === 0` and is
// untouched. Each room is floored at 0 so that an anchor somehow outside the window can never credit
// NEGATIVE travel to the other side (#655/F1); with PRIME_L_MAX 0.97 no such anchor exists — the
// AC-050 (d4) gate asserts zero of them across the full sweep in both hue spaces — but a future
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
// inGamut } entries, brightest..dimmest, lightest first. Deterministic; no DOM.
//
// ANCHOR BRANCH (ticket #681, U1 — "every preset's prime.DEFAULT is its sampled source colour
// byte-for-byte"): a palette carrying a valid `anchor` (a STORED source hex, never fitted — see
// persist.js DOMAINS.palette.anchor) renders its `prime` step (index 3) from that hex VERBATIM,
// never reconstructed via okhslToRgb — the ticket's baseline measured the round trip
// `okhslToRgb(rgbToOkhsl(anchorRgb))` byte-exact on only 2,020 of 2,028 real sampled sources, so a
// re-derived swatch cannot be trusted to reproduce the stored hex exactly; the stored bytes always
// can, by definition. The other six steps still ladder off the anchor's OWN measured OKHSL identity
// (`rgbToOkhsl(anchorRgb)`) — the same "read off the real colour, not a proxy" principle REQ-052/053
// below already applies in the non-anchored (deriveKeyColor) case, just anchored to the palette's
// stored source instead of its cusp identity. A palette with no (or malformed) `anchor` takes the
// ORIGINAL, byte-identical path below (C4's non-anchored identity control): `anchorHex` is null,
// `lLadder === lPrime`, and every other line executes exactly as it did before this ticket.
export function primeSwatches(palette, controls) {
  const anchorHex = typeof palette.anchor === "string" && ANCHOR_HEX.test(palette.anchor) ? palette.anchor.toUpperCase() : null;

  let key, anchorRgb, anchorOklch;
  if (anchorHex) {
    anchorRgb = hexToRgb(anchorHex);
    key = rgbToOkhsl(anchorRgb); // { h, s, l } of the REAL, STORED source colour
    anchorOklch = rgbToOklch(anchorRgb);
  } else {
    const baseHue = effHue(palette.hue, controls.hueSpace, (palette.chroma ?? 0) / 100);
    const pk = peakC(baseHue);

    // REQ-051/052/REQ-056 (conductor ruling 2026-09-11): the SAME construction deriveKeyColor uses
    // (baseHue/keyChroma/pk.tone) — measured back through OKHSL so l_prime, the hue anchor, AND the
    // ladder's flat saturation all read off the REAL key colour, not a neutral-grey `l` proxy or a raw
    // chroma-fraction `s` proxy (two different quantities that don't coincide).
    const keyChroma = ((palette.chroma ?? 0) / 100) * pk.c;
    const keyRgb = hctToRgb(baseHue, keyChroma, pk.tone).rgb;
    key = rgbToOkhsl(keyRgb); // { h, s, l } of the REAL key colour
  }
  const lPrime = key.l; // the swatch's OWN reported lightness — the anchor's TRUE l, unclamped
  const g = 3 ** ((palette.skew ?? 0) / 100); // REQ-053a: the ramp's own toneAt gamma, reused as the ladder bend

  // REQ-052 (superseded 2026-09-11): flat OKHSL saturation is the key colour's OWN saturation scaled
  // by prime chroma, no damping; a per-palette override wins over the global control.
  const pc = (palette.primeChroma ?? controls.primeChroma ?? 100) / 100;
  const s = clamp01(key.s * pc);

  // REQ-053 (superseded 2026-09-11): the hue anchor is the key colour's own measured OKHSL hue,
  // directly — no re-solve. `s`/`l` above already equal `key.s`/`key.l` at primeChroma 100, so this
  // anchor reproduces the key colour exactly there, not merely close.
  const hOk = key.h;

  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;

  // rungHex(i, lLadder, up, down) — the SAME l/hue/rgb/hex a real ladder rung (i !== 3) would render,
  // used both by the widening search below and by the final PRIME_STEPS.map so the two can never
  // disagree.
  function rungHex(i, lLadderArg, up, down) {
    const t = (i - 3) / 3;
    const absT = Math.abs(t);
    const w = i < 3 ? absT ** (1 / g) : absT ** g;
    const l = i < 3 ? lLadderArg + 3 * up * w : lLadderArg - 3 * down * w;
    const hue = (((hOk + shift * (sameDir ? -absT : t)) % 360) + 360) % 360;
    const rgb = okhslToRgb(hue, s, l);
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
  let { up, down } = primeSteps(lLadder); // REQ-051: even per side, clipped travel redistributed

  // F1 (U1 review, ticket #681): when the anchor sits at or past a window bound, the clamped side's
  // room hits 0 (or near enough that 8-bit rounding still collapses it), so every rung on that side —
  // and sometimes the anchor's own stored hex — renders the SAME byte-identical swatch (the "three
  // duplicate prime swatches" defect). `prime` itself never moves (Q3 (b), `lPrime`/`anchorHex` stay
  // untouched above); this loop only widens the LADDER's own reserved room on the clamped side, by
  // pushing `lLadder` further from that bound, until the six ladder rungs plus the anchor are all
  // distinct hexes — capped at a full PRIME_STEP of reserve (the ladder's own nominal per-side step;
  // beyond that the window is offering less room than the ladder was ever designed to need). A handful
  // of sampled sources sit close enough to a bound that even a full PRIME_STEP of reserve cannot
  // separate `dimmest`/`brightest` from `prime` — those are named, counted and accepted by
  // test/engine/anchor.mjs's `anchor-ladder` gate rather than silently passed here. This is a
  // provisional OKHSL fix; U6's L*-domain equal-compress rewrite replaces this whole mechanism.
  if (anchorHex) {
    const RESERVE_UNIT = 0.001;
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
      for (let reserve = RESERVE_UNIT; reserve <= PRIME_STEP + 1e-9; reserve += RESERVE_UNIT) {
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
    // never scaled by `primeChroma` (unlike the other six steps' `s` above): the ticket's "never
    // moves it" applies even to that control, not only to the okhslToRgb round trip this bypasses.
    if (anchorHex && i === 3) {
      return { step, l: lPrime, s: key.s, hue: hOk, rgb: anchorRgb, hex: anchorHex, oklch: anchorOklch, inGamut: true };
    }
    const t = (i - 3) / 3; // brightest -1 .. prime 0 .. dimmest +1
    const absT = Math.abs(t);
    // The bend is normalised PER SIDE — `w` runs 0..1 on each side independently — so it applies to
    // that side's OWN extent (3*up or 3*down), whatever redistribution made those extents (REQ-053a).
    const w = i < 3 ? absT ** (1 / g) : absT ** g; // light side 1/g, dark side g; w(prime)=0, w(ends)=1
    const l = i < 3 ? lLadder + 3 * up * w : lLadder - 3 * down * w;
    const dir = sameDir ? -absT : t;
    const hue = (((hOk + shift * dir) % 360) + 360) % 360;
    const rgb = okhslToRgb(hue, s, l);
    const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    return { step, l, s, hue, rgb, hex, oklch: rgbToOklch(rgb), inGamut: true };
  });
}
