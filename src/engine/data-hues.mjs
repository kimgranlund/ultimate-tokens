// data-hues.mjs: PURE derivation of the `count` (default 8) evenly-spaced DATA-family hues
// (SPEC docs/spec/spec-muted-base-key-spikes.md REQ-020/021, LLD docs/lld/lld-muted-base-key-spikes.md
// U5). No DOM, no imports. Sibling of derive.mjs (the New Palette modal's math) but scoped only to
// this one rule; derive.mjs stays untouched (its own header still owns the modal's relationships).
//
// The rule (REQ-020): `count` hues at `360 / count` degree spacing, anchored at `primaryHue + phi`,
// where `phi` is the integer degree offset in `[0, 360 / count)` that MAXIMISES the MINIMUM circular
// hue distance from every candidate data hue to every brand hue. A brand hue is the hue of a
// chromatic, non-data palette (chroma >= 20, REQ-021); computing that filtered list is the CALLER's
// own job, passed in here as plain `brandHues` numbers, this module has no chroma awareness of its
// own. Ties resolve to the smallest `phi` (ratified 2026-09-11). An empty `brandHues` has nothing to
// optimise against and returns `phi: 0`. All hue math is circular, in degrees, normalised to `[0, 360)`.

const TAU = 360;
const norm = (deg) => ((deg % TAU) + TAU) % TAU;

// shortest circular distance between two hues, in [0, 180].
function circularDistance(a, b) {
  const d = Math.abs(norm(a) - norm(b));
  return Math.min(d, TAU - d);
}

/**
 * @param {number} primaryHue - the document's primary hue, degrees.
 * @param {number[]} [brandHues] - hues of the chromatic brand palettes (REQ-021's own filter already
 *   applied by the caller); plain numbers, any range (normalised here). Empty/absent is valid.
 * @param {number} [count] - how many data hues to derive (default 8, REQ-024's 8 data families).
 * @returns {{ phi: number, hues: number[] }} `phi` the winning integer offset in `[0, 360/count)`;
 *   `hues` the `count` resulting hues, normalised to `[0, 360)`, in emission order (i = 0..count-1).
 */
export function deriveDataHues(primaryHue, brandHues = [], count = 8) {
  const step = TAU / count;
  const hues = (brandHues || []).filter((h) => Number.isFinite(h));

  const huesAt = (phi) => {
    const out = [];
    for (let i = 0; i < count; i++) out.push(norm(primaryHue + phi + i * step));
    return out;
  };

  let bestPhi = 0;
  if (hues.length > 0) {
    let bestScore = -Infinity;
    // phi ranges over the INTEGER degrees in [0, step). step needn't itself be an integer (a
    // non-divisor `count`); the loop bound still holds since phi is compared against the real step.
    for (let phi = 0; phi < step; phi++) {
      const candidates = huesAt(phi);
      let minDist = Infinity;
      for (const c of candidates) {
        for (const b of hues) {
          const d = circularDistance(c, b);
          if (d < minDist) minDist = d;
        }
      }
      // strict `>` only: the FIRST (smallest) phi to reach a score keeps it on a later tie.
      if (minDist > bestScore) { bestScore = minDist; bestPhi = phi; }
    }
  }

  return { phi: bestPhi, hues: huesAt(bestPhi) };
}
