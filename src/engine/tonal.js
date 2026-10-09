// tonal.js, tonal-scale generation module (vanilla ESM, no deps). This file is the live `ramp@2`
// compute layer (T-0040, ADR-037); `ramp@1`, the ramp before the band rule, is frozen verbatim in
// src/engine/layers/ramp@1.mjs and never edited (ADR-034).
//
// Builds a palette's per-stop ramp from global controls + a palette's
// {hue, chroma, skew, lift}. Tone (L*) comes from a shaped, skewable curve;
// chroma is a % of the hue's sRGB peak, edge-damped, and clamped to the gamut
// ceiling. Every emitted color is produced by the validated HCT engine so it is
// in-gamut, hits its target tone, and holds a constant CAM16 hue along the ramp.
//
// The band rule (ramp@2, T-0040): the two end bands, stops at or below BAND_EDGE.light (100) and at
// or above BAND_EDGE.dark (900), sit on a palette-free L* ladder shared by every palette of a kit
// (`sharedToneAt`) and carry one shared tint, `chromaFloor`% of each stop's own gamut ceiling (on the
// anchored even path under hueShift, the ceiling at the hue before edge rotation, capped at the rotated
// one's, as that path's floor reads it since #784), in every tone mode, anchored or not, so peer
// palettes meet at the same lightness at both ends with only a faint hue left. Between stop 500 and each band edge the palette's own construction is kept,
// affinely remapped so stop 100 and 900 land on the shared ladder, and chroma blends from the
// palette's own value at 500 to the tint at the edge (`bandWeight`). Every band stop's 8-bit pixel is
// chosen last, by `snapBandPixel`, at every ramp chroma (the group damper re-snaps, `dampStops`).
//
// Engine contract (validated, imported, never reimplemented here):
//   hctToRgb(hue, chroma, tone) -> { rgb:[r,g,b] (0-255 ints), inGamut, lstar }
//   maxChromaInGamut(hue, tone) -> number   peakC(hue) -> { c, tone }
//   oklchToCam16Hue(h)          -> CAM16 hue (degrees)
import { hctToRgb, hctToOklch, maxChromaInGamut, peakC, oklchToCam16Hue, lstarFromRgb, cam16FromRgb, boundedCache } from "./hct.js";
import { okhslToRgb, okhslToRgbFloat, rgbToOkhsl, rgbToOklchHue, rgbToOklabChroma } from "./okhsl.js";

// ── Stop sets ────────────────────────────────────────────────────────────────
// Display ramp: 050..950 step 50 (19 stops). Light at 050, dark at 950.
export const STOPS = [
  50, 100, 150, 200, 250, 300, 350, 400, 450, 500,
  550, 600, 650, 700, 750, 800, 850, 900, 950,
];
// Export-only half-steps (fine surface elevations); not shown in the grid.
export const EXTRA_STOPS = [75, 125, 175, 825, 875, 925];
// All exports use the union, sorted ascending (25 stops).
export const EXPORT_STOPS = [...STOPS, ...EXTRA_STOPS].sort((a, b) => a - b);

// ── Global control defaults ──────────────────────────────────────────────────
export const DEFAULT_CONTROLS = {
  curve: "logistic",
  tension: 0,
  lmin: 5,
  lmax: 100,
  damp: 80,
  // Differential damping curve (defaults reproduce the legacy 1 - damp·u^1.5 edge
  // damp exactly): dampCurve = falloff exponent γ, dampAmp = mid-tone boost (0 = off),
  // dampBias = light(−)↔dark(+) asymmetry. See paletteStops for the multiplier m.
  dampCurve: 1.5,
  dampAmp: 0,
  dampBias: 0,
  // Hue space the per-palette `hue` is expressed in. "oklch" (default): the slider value IS the OKLCH
  // hue, resolved to a CAM16 hue once per palette via effHue→oklchToCam16Hue. "cam16": the hue is a
  // CAM16 hue, passed straight through. (Legacy docs that predate the OKLCH-native flip carry "cam16"
  // explicitly and keep rendering in cam16, see persist.js / app.js openSet.) An ANCHORED palette has no
  // slider hue to read: it holds its anchor's own measured hue constant in the chosen space (the OKLCH
  // or the CAM16 reading), with the anchor verbatim at stop 500, prime rung 3 and the k-100 key (T-0015).
  hueSpace: "oklch",
  // Chroma basis. false (default): the chroma control is % of the BASE-hue PEAK, per-hue, but the
  // ABSOLUTE chroma still varies with each hue's gamut, so hues come out unequally saturated. true:
  // it's % of EACH STOP's own gamut ceiling, so every hue fills the same fraction of its gamut →
  // palettes harmonize across hue regardless of the hue picked (see paletteStops). A cheap stand-in
  // for OKHSL-style perceptual-saturation normalization.
  relChroma: false,
  // Light/dark-end chroma floor (% of each stop's gamut ceiling) for the "even" path, lifts the
  // damping-starved ends back toward the palette's intended chroma so LOW-chroma ramps don't collapse
  // to a near-white "dead zone", WITHOUT muting saturated palettes (see paletteStops). Default on.
  // ramp@2 (T-0040, ADR-037) also reads it in EVERY tone mode as the band rule's shared end tint, the
  // fraction of each band stop's gamut ceiling (capped by a low-chroma anchor's own on perceptual and peak).
  chromaFloor: 40,
  // Ramp distribution mode (how stops map to lightness):
  //   "perceptual" (default), even steps in OKHSL lightness (perceptually uniform) + gamut-proportional
  //                  chroma; harmonizes saturation across hue (no near-white dead zone). The `vibrancy`
  //                  control (below) pulls each hue's center toward its chroma cusp for a vibrant mid.
  //   "even", the classic CIELAB-L* curve below (toneAt): per-stop tone is the SAME L* for every
  //                  hue (tone-aligned). curve/relChroma apply to "even" only (chromaFloor too, apart from
  //                  ramp@2's band tint); the per-palette skew/lift apply to EVERY mode (#647, see effStop).
  //   "peak", like perceptual with vibrancy pinned at 100: the hue's CUSP (peak chroma) anchored
  //                  at stop 500 (Tailwind-style "the color is 500").
  // perceptual/peak go through the OKHSL path (okhslStops); lmin/lmax/damp/vibrancy shape it there.
  toneMode: "perceptual",
  // Vibrancy (perceptual path), pulls the ramp's lightness from the even-perceptual distribution (0)
  // toward the hue's CUSP-anchored distribution (100), so the CENTER sits where the hue is most
  // chromatic. The fix for hues whose vivid expression lives off-center (e.g. yellow, cusp at high L*):
  // crank it and the mid stops read vibrant for ANY hue. ("peak" mode = vibrancy 100.)
  // Default vibrancy 50 since T-0014 (ADR-030, was 0); persist.js's v8 entry moves a pre-v8 doc's vibrancy 0 to 50.
  vibrancy: 50,
  // On-color policy (resolution layer, not the ramp). "contrast" (DEFAULT since #662, ADR-003
  // amendment): on{N}/on{N}Variant take the end with the better WCAG contrast vs the accent fill
  // (550/450) per mode, falling through to the white/black constants when neither ramp end clears
  // AA 4.5:1, which is what puts every family over the floor in both schemes without moving a stop.
  // "fixed" (the opt-out, the pre-#662 default): on{N} pinned to the light tint (050/200) in both
  // modes, uniform, but fails contrast on light accents. Applied in projectView + derivePalette
  // via applyOnColorContrast.
  onColorMode: "contrast",
  // Prime-accent ref (resolution layer, not the ramp). "mode" (default): the prime accent role resolves
  // to 550 (light) / 450 (dark), mode-specific, better contrast per scheme. "single": both modes map to
  // 500, one mode-agnostic accent token. Applied via applyAccentRef alongside applyOnColorContrast.
  accentRef: "mode",
  // Match peer lightness (T-0040, ADR-037; read by ramp@2 only, `ramp@1` never reads it). false
  // (default): the band rule matches the lightest and darkest stops across a kit's palettes (stops 050
  // to 100 and 900 to 950) and each palette keeps its own curve between, its anchor at stop 500. true:
  // the tone edge moves to 500 on both sides, every stop's tone is `sharedToneAt(stop)`, so a stop number
  // means one lightness across the kit. The chroma rule keeps its shape (the end tint in the bands, the
  // blend between, the palette's own chroma basis at 500); stop 500 is no longer the anchor pixel (it is
  // built like a clamped pivot, at the anchor's hue and chroma basis, at the shared tone); skew and lift
  // stop moving lightness (lift keeps its chroma-envelope role); vibrancy and cusp pull move nothing.
  matchPeerLightness: false,
  // (SPEC spec-muted-base-key-spikes 0.3.0, REQ-002/004, AC-004): the ramp's chroma multiplier that
  // used to live here as a control field is fully retired. A palette's "Base chroma" times the global k is resolved
  // in src/ui/model.mjs and src/ui/persist.js and handed to paletteStops AS the palette's own `chroma`;
  // since #785 (R94 to R98) paletteStops reads it as a ratio, the whole-ramp damper `groupDamper` /
  // `dampStops` below (T-0014: the per-group layer is gone). No trace of it survives on DEFAULT_CONTROLS.
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;

// effHue, resolve a palette's input hue to a CAM16 hue ONCE per palette.
// 'oklch' inputs are mapped through the engine; 'cam16' (default) pass straight.
// Compute this a single time and feed the SAME value to every stop so the
// emitted CAM16 hue is constant across the ramp (hue-stability).
// chromaFrac (0..1, default 1) anchors the OKLCH→CAM16 inverse at a chroma fraction of the hue's peak,
// so a color at that saturation lands on the requested OKLCH hue. Because OKLCH↔CAM16 hue shifts with
// chroma (Abney), the anchor should sit where the ramp's SATURATED stops actually are, see
// hueAnchorFrac. (Anchoring at the raw nominal chroma left the vivid stops ~2–3° off the set hue,
// because dampAmp drives the center stops past nominal toward the gamut peak.)
export function effHue(hue, hueSpace, chromaFrac = 1) {
  return hueSpace === "oklch" ? oklchToCam16Hue(hue, chromaFrac) : hue;
}

// hueAnchorFrac  -  the chroma fraction the ramp's VIVID CENTER stop (500) actually reaches: the palette's
// own nominal chroma, capped at the gamut peak. Anchoring effHue here  -  not at the raw un-anchored hue  - 
// puts the OKLCH-hue calibration on the saturated swatches the user reads, so they land on the SET hue.
// REQ-005 (0.3.0): `palette.chroma` is the chroma the ramp is rendered at, so the anchor follows the SAME
// chroma the ramp is built from. Since #785 that is always 100 here: `paletteStops` re-enters at 100 and
// `dampStops` applies the palette's Base chroma times the global k after, so the re-entry hides it; a direct call uses its own chroma.
//
// No longer amplified by dampAmp (#681 U3, Q7): chromaEnvelope is exactly 1 at the anchor stop for EVERY
// dampAmp value when lift is 0 (the anchor's own rendered chroma no longer moves with dampAmp  -  that
// "mid-tone boost landing on the centre itself" was the 144%-of-source defect C6 exists to close), so the
// chroma fraction the anchor ACTUALLY reaches is simply the nominal chroma, full stop. `controls` stays
// in the signature for call-site compatibility.
export function hueAnchorFrac(palette, controls) {
  void controls;
  return Math.min(1, (palette.chroma ?? 0) / 100);
}

// solveOkhslHue, the OKHSL hue whose color at (s, l) reads back at `targetOklchHue`. The perceptual ramp
// is AUTHORED in OKHSL but EXPORTED in OKLCH. In the continuous domain OKHSL hue IS OKLab hue (OKHSL
// remaps only s and l; measured max 1.1e-13° on okhslToRgbFloat, #725 revision 8), so the solve's only
// work is the 8-bit staircase below; the Abney disagreement (worst in the blues, ~6°) is the even path's
// CAM16 solve (solveCam16Hue), not this one. Anchoring the KEY stop directly in the
// RENDER space, at its ACTUAL saturation/lightness, lands it on the set OKLCH hue exactly, for any damping,
// no CAM16 round-trip. f(h)≈h (slope ≈1), so h ← h − (got − target) is Newton; converges in a few steps.
// #657: f is an 8-BIT STAIRCASE, okhslToRgb quantises to integer RGB, so `got` is piecewise CONSTANT in h
// and the 1e-3 criterion is unreachable on most cells. Where the step is flat the update h ← h − err is a
// fixed drift, so the LAST iterate can be 100°+ off target (pale, low-chroma cells near white are the worst:
// every h renders the same pixel). Track the BEST (h, |err|) seen and return that on exhaustion. Converged
// cells are unaffected: nothing before an iterate with |err| < 1e-3 can be smaller, so the min IS that
// iterate and the return is bit-identical. Strict `<` keeps the EARLIEST minimum, so the result is stable.
// The loop runs to i=16 so the hue the OLD code returned, the 17th, produced by the last update and
// never read back, is a scored candidate too, not a blind return. Without that pass the old value could
// still win by luck on a cycling cell (measured: 2 of 3,780 curated peak palettes, by <=0.0003°); with it,
// the returned hue is the argmin over every candidate the old loop ever produced, so it is never worse.
export function solveOkhslHue(targetOklchHue, s, l) {
  let h = targetOklchHue; // seed: OKHSL hue ≈ OKLCH hue to first order
  let bestH = h, bestErr = Infinity;
  for (let i = 0; i <= 16; i++) {                                        // 16 Newton steps => 17 candidates
    const got = rgbToOklchHue(okhslToRgb(h, s, l));
    const err = (((got - targetOklchHue) % 360) + 540) % 360 - 180;
    if (Math.abs(err) < bestErr) { bestErr = Math.abs(err); bestH = h; } // strict: the EARLIEST minimum wins
    if (bestErr < 1e-3) break;                                          // converged => this iterate IS the min
    h = (((h - err) % 360) + 360) % 360;                                 // i=16's update is evaluated by nobody
  }
  return bestH;
}

// solveCam16Hue, the even/CAM16 analog of solveOkhslHue: the CAM16 hue whose color at (chroma, tone) reads
// back at `targetOklchHue`. The "even" ramp RENDERS through the HCT engine (a CAM16 hue) but EXPORTS in
// OKLCH, and the two disagree on "constant hue" by a chroma- AND lightness-dependent amount (Abney), up to
// ~2° at the blue pole, ~9° under mid-tone amplification. The effHue proxy anchored at the hue's PEAK tone,
// not the 500 stop's actual tone, so the residual survived. Solving the KEY stop (500) directly in the
// RENDER space at its ACTUAL chroma + tone lands it on the set OKLCH hue for any damping. f(h)≈h (slope ≈1)
// → Newton converges in a few steps. (This is the same "anchor in the space the ramp renders" fix #202 gave
// the OKHSL path, now applied to the even/CAM16 path for parity.)
// `gamutClamp` (review pass 3, Finding 3, 2026-09-18, ADDITIVE - an optional 4th param, default false,
// so the non-anchored path's own call (paletteStops, untouched per C4's byte-identity contract) keeps
// evaluating the exact same expression it always has): when true, re-clamps `chroma` to the CURRENT
// candidate hue's own gamut ceiling on EVERY iteration, not just once at the seed hue. This fixed the
// original 363-stop/166-ramp regression (a fixed seed chroma could be wildly out of gamut at a hue the
// solve wandered to), but left a NARROWER mismatch: the re-clamped chroma inside the loop still was not
// the chroma the caller would actually RENDER afterward (the caller's `evenChroma` also damps toward an
// `intended` target and applies a chroma floor, both themselves functions of the gamut ceiling) - so a
// converged solve could still read back tens of degrees off once the real chroma was substituted in.
// `chromaAt` (review pass 4, Finding 2, 2026-09-19, ADDITIVE - an optional 5th param object, default
// `{}`, so both prior calls, including review 3's own `gamutClamp=true` anchored call, are unaffected
// unless a caller opts in): when provided, `chromaAt(h)` returns the chroma that will ACTUALLY render
// at candidate hue `h` - the caller's own `evenChroma(maxChromaInGamut(h, tone), ...)` formula,
// evaluated fresh on every candidate, so hue and rendered chroma converge TOGETHER instead of the solve
// chasing a chroma the render then discards (measured before this fix: Nike tertiary stop 150 and 48°
// N secondary-muted stop 100 both landed on a hue found by a converged-looking solve whose real chroma
// then read back 12-33 degrees off - see this function's own anchored caller in `paletteStopsAnchored`
// and the handoff's review-pass-4 section for the residual).
// Review pass 5, Finding 1 (2026-09-19): the FIRST `chromaAt` fix kept the old fixed-point step
// `h <- h - err`, which assumes d(OKLCH hue)/dh ~= 1 - a Newton-style linear-slope guess. That fails
// near a gamut cusp, where `chromaAt(h)` (and so the OKLCH hue it renders) can swing sharply with h;
// measured: 865 stops where a real root existed and the fixed-point step walked past it without ever
// evaluating it. Its "did not converge -> return seedHue" fallback then made things worse: seedHue is
// the CAM16 hue, which is exactly the Abney-drifted value `hueSpace: "oklch"` exists to correct away
// from - for a near-grey anchor, CAM16 and OKLCH hue can disagree by 20-50 degrees, so seedHue is the
// WORST available hue there, not a safe one (measured: 152 stops in 79 ramps regressed by more than 5
// degrees versus the pre-`chromaAt` render, one a lone OKLCH-C-0.13 spike, 48 N secondary-muted merely
// swapped its drift for cam16's own). Replaced with a bracketed root-find when `chromaAt` is passed:
// scan h on a `SCAN_STEP` grid over `targetOklchHue +/- SCAN_RANGE`, evaluated at `chromaAt(h)`, find
// every sign change in the wrapped error, bisect the one whose bracket sits nearest the target down to
// `BISECT_TOL`, and return that (evaluated) root.
// ACHROMATIC candidates (own fix, found while building the above): `hctToOklch`'s underlying
// `_hctToLinRGB` forces flat GRAY whenever chroma < 0.4 (its own "near-neutral, CAM16 inversion is
// noisy" branch) - a render that dim has no real dependence on h, so its returned "hue" is an
// artifact, not a function of h. Scanning across a wide near-white stop's hue range, `chromaAt(h)`
// is BELOW 0.4 for most of it (correctly - the stop IS meant to render near-gray there) and only
// exceeds 0.4 once h swings into a hue whose gamut is wide even at that lightness (yellow, near
// white). Treating the achromatic zone's constant, meaningless "err" as informative invents a FAKE
// sign change exactly at that boundary - bisecting it lands the solve just past the 0.4 line, on a
// newly-VISIBLE, unintended tint, instead of anywhere in the large, harmless achromatic zone the true
// construction renders gray throughout (measured: a coarse scan step alone, without this fix, reliably
// found this exact false bracket on a near-white ramp; the review's own worst case, a C-0.13 lemon
// spike, is a different instance of the same shape - a candidate whose OWN chroma differs sharply from
// its neighbours', not a real hue root). Fix: candidates at or under the 0.4 floor are excluded from
// both bracket detection and the argmin-|err| fallback; if NO real bracket is found AND any scanned
// candidate was achromatic, return `targetOklchHue` unchanged in preference to the least-bad chromatic
// candidate (an achromatic render is EXACT - any hue there is bit-identical gray - while the least-bad
// chromatic candidate never actually reached the target and would introduce an avoidable new tint).
// Only when NO candidate anywhere in the window was achromatic does the least-|err| chromatic
// candidate apply.
// SCAN_STEP is 12, not 1: profiled cost (each `chromaAt` call is a full gamut-boundary binary search,
// ~46us cache-cold, and `projectView` re-derives each anchored ramp roughly 10x per document across
// its export formats) makes a literal 1-degree grid over the full 3,396-ramp corpus take 15+ minutes
// in `npm test` (measured; a single even-mode corpus sweep did not finish in that time). A 12-degree
// grid plus the achromatic fix above and this same bisection resolves the review's own named cases
// (Great Salt Lake secondary-muted stop 125, 48 N secondary-muted stops 75-125) identically to a
// literal 1-degree grid, and the full corpus sweep in `test/engine/anchor.mjs` completes in well under
// a minute; see the handoff's review-pass-5 section for the re-measured timing and residual counts.
// The earlier false-positive root this coarser grid appeared to reintroduce (Great Salt Lake stop 75)
// was actually the achromatic-boundary bug above, not a genuinely missed narrow root - fixing that bug
// made the coarse grid safe again; see the handoff for how this was verified.
// PERFORMANCE (team-lead instruction, 2026-09-19): running the bracketed scan below for EVERY stop
// made a single `npm test` take 10+ minutes against a ~60s baseline / 90-175s gate budget - `chromaAt`
// is a full gamut-boundary binary search (~46us cache-cold), and `projectView` re-derives each
// anchored ramp roughly 10x per document across its export formats, so a per-stop grid scan is paid
// far more often than the stop count alone suggests. Fix: try the cheap fixed-point step FIRST (same
// shape as the non-`chromaAt` branch below, but with `chromaAt(h)` evaluated fresh each iteration, so
// a "converged" result is verified against the REAL render, not a stand-in chroma). It converges
// correctly for the vast majority of stops - only the 865 (of ~72,000 measured) stops near a gamut
// cusp actually need the expensive scan. Falling to the scan ONLY when the fixed-point step does not
// converge (or wanders into an achromatic candidate, where its linear-slope assumption is meaningless
// anyway) keeps the expensive path rare instead of universal.
// The non-`chromaAt` branch below (the non-anchored path's own call, and any future `gamutClamp=true`
// caller) is UNTOUCHED - still the original fixed-point loop, byte-identical (C4).
// Exported (T-0015) for prime.mjs's anchored ladder and model.mjs's deriveKeyColor, which call its `chromaAt` form under hueSpace "oklch".
export function solveCam16Hue(targetOklchHue, chroma, tone, gamutClamp = false, { chromaAt = null } = {}) {
  if (!chromaAt) {
    let h = targetOklchHue; // seed: CAM16 hue ≈ OKLCH hue to first order
    for (let i = 0; i < 16; i++) {
      const c = gamutClamp ? Math.min(chroma, maxChromaInGamut(h, tone)) : chroma;
      const got = hctToOklch(h, c, tone)[2];
      const err = (((got - targetOklchHue) % 360) + 540) % 360 - 180;
      if (Math.abs(err) < 1e-3) return h;
      h = (((h - err) % 360) + 360) % 360;
    }
    return h;
  }
  // Fast path: the cheap fixed-point step, tried first. Bails to the scan below (not a spurious
  // "converged" answer) the moment it meets an achromatic candidate, since err there is meaningless.
  {
    let h = targetOklchHue;
    let converged = false;
    for (let i = 0; i < 16; i++) {
      const c = chromaAt(h);
      if (c < 0.4) break; // achromatic - let the scan below apply the achromatic-safe fallback
      const got = hctToOklch(h, c, tone)[2];
      const err = (((got - targetOklchHue) % 360) + 540) % 360 - 180;
      if (Math.abs(err) < 1e-3) { converged = true; h = (((h) % 360) + 360) % 360; break; }
      h = (((h - err) % 360) + 360) % 360;
    }
    if (converged) return h; // a REAL root, verified against the true render at this exact h
  }
  const SCAN_RANGE = 60, SCAN_STEP = 5, BISECT_TOL = 1e-4, BISECT_STEPS = 40, CHROMA_ACHROMATIC = 0.4;
  // errAt returns null for an achromatic candidate (chroma below the render's own gray floor) - not a
  // real function value, so callers must skip it rather than treat it as a normal (possibly zero) err.
  const errAt = (offset) => {
    const h = (((targetOklchHue + offset) % 360) + 360) % 360;
    const c = chromaAt(h);
    if (c < CHROMA_ACHROMATIC) return null;
    const got = hctToOklch(h, c, tone)[2];
    return (((got - targetOklchHue) % 360) + 540) % 360 - 180;
  };
  let bestOffset = null, bestErr = 0, bestAbs = Infinity;
  let bracket = null; // the sign-change bracket whose midpoint is nearest offset 0 (the target)
  let prevOffset = null, prevErr = null; // last NON-achromatic sample seen
  let sawAchromatic = false;
  for (let offset = -SCAN_RANGE; offset <= SCAN_RANGE; offset += SCAN_STEP) {
    const err = errAt(offset);
    if (err === null) { sawAchromatic = true; continue; } // no signal, and no bracket can start/end here
    const absErr = Math.abs(err);
    if (absErr < bestAbs) { bestAbs = absErr; bestOffset = offset; bestErr = err; }
    if (prevErr !== null && ((prevErr > 0 && err < 0) || (prevErr < 0 && err > 0))) {
      const mid = Math.abs((prevOffset + offset) / 2);
      if (!bracket || mid < bracket.mid) bracket = { loOffset: prevOffset, loErr: prevErr, hiOffset: offset, hiErr: err, mid };
    }
    prevOffset = offset; prevErr = err;
  }
  if (bracket) {
    let { loOffset, loErr, hiOffset, hiErr } = bracket;
    for (let i = 0; i < BISECT_STEPS && hiOffset - loOffset > BISECT_TOL; i++) {
      const midOffset = (loOffset + hiOffset) / 2;
      const midErr = errAt(midOffset);
      // An achromatic midpoint mid-bisection is rare (the bracket's own endpoints are both
      // non-achromatic) but not impossible if the achromatic/chromatic boundary sits inside it;
      // treat it as "same side as lo" so bisection still narrows (and still terminates on the
      // BISECT_STEPS/BISECT_TOL bounds either way) rather than reading a null err as a sign.
      if (midErr === null || (loErr > 0) === (midErr > 0)) { loOffset = midOffset; loErr = midErr ?? loErr; }
      else { hiOffset = midOffset; hiErr = midErr; }
    }
    return (((targetOklchHue + (loOffset + hiOffset) / 2) % 360) + 360) % 360;
  }
  // No real root (no sign change) among the non-achromatic candidates. If the window ALSO contains
  // achromatic hues, prefer staying there over the "least-bad" chromatic candidate: an achromatic
  // render is EXACT (any hue there is bit-identical gray, so it can't be a visible artifact), while
  // the least-bad chromatic candidate is only an approximation that never actually reached the target
  // - choosing it over an available gray would introduce a new, avoidable tint (this is what the
  // achromatic-boundary bug above did before this fallback existed). Only when NO candidate anywhere
  // in the window was achromatic does the least-|err| chromatic candidate apply (never seedHue - see
  // this function's header comment).
  if (sawAchromatic) return targetOklchHue;
  return bestOffset === null ? targetOklchHue : (((targetOklchHue + bestOffset) % 360) + 360) % 360;
}

// evenChroma, the even path's per-stop chroma from the gamut ceiling + a pre-computed intended target and
// the chromaEnvelope value `env` at this stop: damp toward intended·env, floor toward chromaFloor% of the
// gamut but NEVER past intended (an envelope floor: intended is exactly the anchor's own chroma, env=1
// there, so the floor can never lift a stop past the anchor  -  #681 U3), clamp in-gamut. A high-chroma
// palette's `intended` is itself large relative to any stop's shrinking gamut ceiling, so
// chromaFloor%·maxc stays well under `damped` there and the floor never binds  -  it only rescues the
// LOW-chroma ramps chromaFloor exists for. Factored so the per-stop map AND the stop-500 hue anchor share
// ONE formula and can't drift (the oklch-hue-anchor gate reads the exported hue, so any drift here trips it).
// floorRef (#701 U2, revision 14): the floor's gamut reference is min(maxc, floorRef), where floorRef
// is the largest gamut ceiling among the anchor stop and its first display step on either side (450,
// 550), at the tones the ramp renders them. Near white and black maxc falls under floorRef, so the floor
// stays chromaFloor% of the local gamut there (the shape the even 100/900 cells depend on); on the side
// where the gamut widens away from the anchor (the hue's cusp side) it holds flat at chromaFloor% of
// floorRef instead of following maxc up. The old floor, chromaFloor%*maxc at every stop, followed maxc
// up that side while the damped value fell, and the two met in a valley one or two stops out: the
// 400/450/550 dips #701 retires. Why the first step and not the anchor stop alone: at 450/550 the cap
// equals that stop's own ceiling, read at its hue before edge rotation (floorRefAt); where every stop reads
// one hue and nothing rotates, the floor cannot rise past 450/550, and one stop in no dip can bottom. On
// the anchored OKLCH path each stop reads its own solved hue, so the floor can rise outward of 450/550
// (#766: 36.18 / 35.83 / 35.43 C at 350 / 400 / 450 on a random anchored ramp at hueShift 0, over a flat
// 34.45 per-ramp floor); there, and under edge rotation, no-dip is a measurement of npm run gate:even-dips,
// not a structural property. The pivot's ceiling alone (U2 pass 1) set the floor from the pivot's gamut, a
// few C near white or black, and drained the far half grey. A damped value non-increasing outward (constant
// `intended`) forms no off-anchor dip; relChroma and the anchored basis blend vary `intended`, so that too is
// a measurement, gated at 0 over the corpus (test/engine/tonal.mjs `dip-gate-even`, npm run gate:even-dips).
// Continuous in the anchor's L* (no tone-window branch). Defaults to maxc (the stop-500 seeds pass none).
// floorMaxc (#784): the floor's own ceiling reading, min(floorMaxc, floorRef), where the floor used to read
// the stop's maxc. It defaults to maxc, so every caller that passes none (the non-anchored path, the
// stop-500 seeds) renders exactly as before. paletteStopsAnchored passes the stop's gamut ceiling at the
// hue BEFORE edge rotation, capped at maxc: under hueShift the stop's own maxc is read at the rotated hue,
// and where that ceiling runs above the unrotated one the floor rose with it past the neighbours' floors,
// then fell back (the stop-200 notch on the default kit's #774902 palette at hueShift -30, 17.73 / 11.80 /
// 15.51 at 100 / 200 / 300 on the old engine). With the cap the floor never exceeds its unrotated
// reading, and at hueShift 0 (rotated hue = unrotated hue) floorMaxc is maxc: byte-identical there.
function evenChroma(maxc, intended, env, chromaFloor, floorRef = maxc, floorMaxc = maxc) {
  const damped = Math.min(intended * env, maxc);
  return Math.min(maxc, Math.max(damped, evenFloor(maxc, intended, chromaFloor, floorRef, floorMaxc)));
}

// evenFloor: evenChroma's floor term, factored so a stop record can carry the floor it rendered against.
// It takes maxc, unread by the shipped line, because the dip-gate-even negative controls patch the
// floorC line below verbatim into gamut-relative forms that read it (test/engine/tonal.mjs).
function evenFloor(maxc, intended, chromaFloor, floorRef, floorMaxc) {
  const floorC = Math.min(((chromaFloor ?? 0) / 100) * Math.min(floorMaxc, floorRef), intended);
  return floorC;
}

// floorRefAt (#766): evenChroma's floorRef for one stop, the largest gamut ceiling among the ramp's three
// reference tones (the pivot's, 450's and 550's, at the tones the ramp renders them), read at the stop's
// own hue before edge rotation: the CAM16 hue the anchored path's per-stop OKLCH solve finds for that
// stop's tone, otherwise the ramp's own hue. Edge rotation (hueShift) is not followed: the ceilings are
// not monotone in hue, so a reference that follows the rotation rises or falls along the ramp against
// stops that do not move with it, and both directions measured off-anchor dips (#766, ADR-026 amendment).
// Where every stop reads one hue (the non-anchored path at any hueShift; cam16 with an unclamped anchor)
// the floor equals the old per-ramp floor and the render is byte-identical. Elsewhere the movement is a
// measurement, not a bound: at most 9.11 CAM16 C over the curated corpus (#766). evenChroma only ever
// reads min(maxc, floorRef), so the reading stops at the first ceiling that reaches the stop's own maxc
// and returns maxc: the same floor (not the same value) for fewer gamut bisections.
function floorRefAt(hue, maxc, tone500, tone450, tone550) {
  let ref = 0;
  for (const t of [tone500, tone450, tone550]) {
    ref = Math.max(ref, maxChromaInGamut(hue, t));
    if (ref >= maxc) return maxc;
  }
  return ref;
}

// The ramp's centre stop, prime.DEFAULT's home. 500 for every palette today; U2 threads a palette's own
// `anchor` stop through paletteStops/okhslStops's callers into chromaEnvelope's `anchorStop` parameter  - 
// this module stays unaware of where that value comes from (U3 is built behind the parameter).
const ANCHOR_STOP = 500;

// chromaEnvelope  -  the single per-stop chroma multiplier shared by the "even" path (evenChroma) and the
// OKHSL path (okhslStops): one function replaces what used to be two separately-typed copies of the same
// damping formula ("m" in each, #647/#668). Position is read at the LIFTED stop (liftStop, #668)  -  never
// the nominal stop, and never a separately re-derived "effective" stop (effStop, which additionally
// composes skew's gamma): keying on effStop additionally moves every skew-only palette  -  including the
// shipped Primary and Neutral, both skew -20 lift 0  -  for a defect they do not have, moves the normative
// Panda/shadcn spec literals derived from them, and is measurably worse at its own job (4 of 10,080
// synthetic grid cells still rise under it, worst +0.006 L*  -  668-report.md §4).
//
// sd is measured against `liftStop(anchorStop, lift)`  -  the anchor's OWN lifted reading, not the raw
// numeric anchorStop (e.g. 500)  -  so env(anchorStop) === 1 EXACTLY for EVERY damp/dampCurve/dampAmp/
// dampBias/lift combination, unconditionally, not only at lift 0 (R2, revised from the first draft below).
// sd is 0 at the anchor by construction, so uG is 0, the shoulder term vanishes (its own factor is uG),
// and the edge-damp term vanishes too (its factor is uG)  -  no branch needed, and nothing here can
// accidentally lift the anchor off 1 the way the old dampAmp term did (Q7: the old form's mid-tone
// "boost" landed ON the centre itself, the 144%-of-source defect C6 exists to close).
//
// R1 (reverted) measured sd against the RAW numeric anchorStop instead: exact only at lift 0, and NOT
// at lift != 0 (liftStop(anchorStop, lift) != anchorStop whenever the lift bump's weight there isn't
// zero, and it peaks  -  not vanishes  -  at the ramp's own centre). That form avoided all 10,080 cells of
// a synthetic curve x skew x hue x vibrancy x mode grid probe (test/engine/tonal.mjs "skew-lift-okhsl"
// (iii c), chroma pinned at 95) rising, at the cost of the inexact anchor under lift AND, measured
// against the corpus the product actually renders (`rampChromaOf`'s resolved chroma through
// `src/ui/model.mjs`'s `projectView`, not a palette's raw stored `chroma`  -  the two differ for 3,777 of
// 3,780 curated palettes), TWO duplicate-hex ramps on the 25-stop export ramp, peak mode, near white:
// nature "Varanger / Finnmark tundra" tertiary and nature "English oak woodland" primary, both stops
// 150&175, both #FDFDFB. Neither ramp was named or gated under R1  -  its own gate scanned raw `chroma`,
// which is a different ramp than either one renders.
//
// R2 (shipped) re-centres sd on the anchor's own lifted reading. On the corpus the product renders, this
// closes BOTH duplicate-hex ramps to zero (0/0/0 across perceptual/peak/even, both stop sets) alongside
// the #668 uptick class already at zero, and gives the exact-anchor property Q1 originally wanted. The
// cost is real and disclosed, not free: 21 of the SAME 10,080 synthetic grid cells rise under R2, worst
// +0.1314 L* (20 near-white, measured tone 90.9-99.5, plus one near-black at tone 7.55, hue 287
// skew -100 lift -40)  -  about 1/6 the +0.83 L* #668 defect this unit repairs, at a skew/lift/vibrancy/
// hue combination within the user-settable ranges (chroma pinned at the grid's own probe value, 95;
// skew as extreme as ±100) but unused by any shipped preset or role default. test/engine/tonal.mjs
// "skew-lift-okhsl" (iii c) names and cites all 21 as a bounded, verified-both-directions exception
// (the same shape C6(ii)'s duplicate-hex list already uses), rather
// than silently loosening the gate to a count. Full trade-off and the rejected alternatives (R1 as
// above; a third draft, post-hoc-normalized sd, which was worse at 33 rises and could return exactly 0
// instead of 1 at the anchor when the raw formula's own floor clips there) are in
// .sdlc/questions/pif-u3.md Q1 (superseded first read kept for the record) and the U3 review this
// revision answers.
// EVEN_DAMP_FACTOR (#681 U3 pass 7 step 1): the even path's own C6 median/p90 misses (100/300/900)
// cannot be closed by remapping dampCurve alone. uG = |sd|^dampCurve rises toward 1 as dampCurve falls
// toward 0 for ANY off-anchor stop (x^e -> 1 as e -> 0+, for x in (0,1)), so at dampCurve -> 0 the
// envelope's floor is 1-damp/100 everywhere off the anchor, set by damp alone; a synthetic K sweep down
// to dampCurve x 0.001 (u3fix/retune-even-only.mjs) confirms stop 100/900 sit exactly at that
// damp-only floor and do not move for ANY dampCurve, no matter how extreme. Reaching the target median/
// p90 therefore needs `damp` to move too, not only `dampCurve`. To keep BOTH sliders live in every mode
// (the F4 principle  -  no dead controls, no new control), the even path compresses damp's headroom
// (100-damp) and scales dampCurve by the SAME factor, both DERIVED from the shared sliders rather than
// a hardcoded absolute: a user who raises damp or lowers dampCurve still visibly changes the even ramp.
// perceptual/peak are untouched  -  this only fires when controls.toneMode === "even" (paletteStops's own
// dispatch guarantees that string exactly, never a default fallthrough  -  see paletteStops above).
export const EVEN_DAMP_FACTOR = 0.25;
// EVEN_NEIGHBOURHOOD_R (#701 U1): the even envelope's own uG term is |sd|^dampCurve, an exponent under
// 1 (dampCurve is EVEN_DAMP_FACTOR * controls.dampCurve, 0.375 at the shipped 1.5), so uG has INFINITE
// slope at the anchor - one stop away (|sd| = 50/450 = 0.111) uG is already 0.406 at the shipped damp
// 70, which is what produces both the 64 corpus + 1 default-kit lone spikes (anchor.mjs's
// `loneSpikeStop`: 450/550 read near-achromatic while 500 sits far above them, C2) and 57 of the
// retired EVEN_DIP_BASELINE's 90 named dips (a different predicate, tonal.mjs's own `findDips`, which
// U2 retired). A neighbourhood (plateau) term multiplies uG by a smoothstep of |sd|/R that is 0 at the
// anchor and 1 by R, replacing the exponent's infinite initial slope with a flat start: near the
// anchor uG is smaller than the shipped formula gives, so the envelope (1 - damp/100*uG) is CLOSER to
// 1 there, closing the spike without changing anything beyond R (chromaEnvelope's C5-gated cells sit
// at |sd| >= 0.444 for the innermost measured stop, 300/700 (lift 0; 0.222 is 400/600, not a C5 stop),
// well outside R).
//
// R is a named constant, not a new control (F4): the plan's own feasibility probe (revision 1,
// scratch patched copies of this file) swept r = 0.2/0.3/0.4 against the real corpus + default kit and
// found 0.2 the smallest that fully closes BOTH lone-spike populations (64 corpus + 1 kit -> 0 at every
// r tried) while moving the fewest even 25-stop cells (4,498 of 94,500, all within two lifted-stop
// steps of the anchor) and leaving the four `--envelope` READING (a) cells (C5) unchanged to one
// decimal at every r tried, since those stops sit far outside the plateau. 0.2 in `sd` units is
// 90 stop units at lift 0, just under two of the ramp's own 50-unit steps either side of the anchor
// (450/550 sit at 0.111, comfortably inside; 400/600 at 0.222, just outside), which is why the shoulder
// stays clear of stops 400/600 at lift 0; under lift `liftStop` sets the reach, and above
// `|lift|` about 14 the near-side 400 or 600 enters it ("even palettes whose 450 or 550 CAM16 C is under
// 50% of stop 500" was already 0 at ship - the spike is a 60% shoulder, not a collapse, so R only needs
// to reach the two innermost stops).
export const EVEN_NEIGHBOURHOOD_R = 0.2;
// OKHSL_DAMP_D, OKHSL_DAMP_CURVE_GAIN (#725 U3, R69): the perceptual/peak retune, derived from the
// ruled bars (READING (b): env <= 0.75 at stop 300 and <= 0.25 at stop 100 at the corpus's damp 70 /
// dampCurve 1.5). With env = 1 - d*u^c at u = 4/9 and 8/9 the two residues divide to 2^c = 3, so
// c = log2(3) = 1.585; d then has a window: d >= 0.904 meets the 0.25 bar, and d <= 0.928 keeps
// env(100) within 0.02 of it. d is 0.9275 (env 0.744 / 0.231), not the 0.919 first derived: below
// 0.9267 the emitted gate-path perceptual stop-300 p90 sits at 90.0013, a cluster of 14 hue-86,
// chroma-100 yellows held on one 8-bit code, over its strict 90 bar (.sdlc/questions/chroma-envelope-U3.md).
// Both are mode-scoped maps of the shared sliders, the same shape as EVEN_DAMP_FACTOR, so both stay
// live and no even byte moves: dampCurve is scaled by log2(3)/1.5, and damp's headroom
// r = (100 - damp)/100 becomes r^OKHSL_DAMP_RESIDUE_EXP, the exponent fixed so the corpus's r = 0.3
// maps to 1 - OKHSL_DAMP_D exactly. A linear residue (100 - (100 - damp)*k) meets the same point but
// reads 100*(1 - k) at damp 0, damping a ramp the user set to no damping; the power keeps damp 0 -> 0
// (env 1 everywhere) and damp 100 -> 100, and is monotone in between.
export const OKHSL_DAMP_D = 0.9275;
export const OKHSL_DAMP_RESIDUE_EXP = Math.log(1 - OKHSL_DAMP_D) / Math.log(0.3);
export const OKHSL_DAMP_CURVE_GAIN = Math.log2(3) / 1.5;
export function chromaEnvelope(stop, anchorStop, lift, controls) {
  // Capped at +/-1 (#681 U10, F3): under lift the raw distance can pass 450, and |sd| > 1 clipped the
  // envelope to 0 over whole bands (neutral greys). At the cap a stop takes the 50/950 edge floor.
  const sd = Math.max(-1, Math.min(1, (liftStop(stop, lift) - liftStop(anchorStop, lift)) / 450)); // position vs the anchor's OWN lifted reading (R2)
  const isEven = controls.toneMode === "even";
  // perceptual/peak (and the falsy mode paletteStops reads as perceptual) take the retune; any other
  // string keeps the raw sliders, as before.
  const isOkhsl = !controls.toneMode || controls.toneMode === "perceptual" || controls.toneMode === "peak";
  const damp = isEven ? 100 - (100 - controls.damp) * EVEN_DAMP_FACTOR
    : isOkhsl ? 100 - 100 * Math.max(0, Math.min(1, (100 - controls.damp) / 100)) ** OKHSL_DAMP_RESIDUE_EXP
    : controls.damp;
  const dampCurve = (isEven ? EVEN_DAMP_FACTOR : isOkhsl ? OKHSL_DAMP_CURVE_GAIN : 1) * (controls.dampCurve ?? 1.5);
  let uG = Math.abs(sd) ** dampCurve;
  if (isEven) {
    // smoothstep plateau: 0 at sd=0 (the shoulder term below still vanishes there, uG's own factor),
    // 1 by |sd| = EVEN_NEIGHBOURHOOD_R; perceptual/peak never take this branch (C6).
    const t = Math.min(1, Math.abs(sd) / EVEN_NEIGHBOURHOOD_R);
    uG *= t * t * (3 - 2 * t);
  }
  const sideW = Math.max(0, 1 + ((controls.dampBias ?? 0) / 100) * Math.sign(sd));
  const shoulder = ((controls.dampAmp ?? 0) / 100) * 4 * uG * (1 - uG); // 0 at sd=0 AND |sd|=1  -  shoulders only
  return Math.max(0, 1 + shoulder - (damp / 100) * sideW * uG);
}

// ENVELOPE_PRESETS (#778): the named envelope curves, each a damp / dampCurve / dampAmp / dampBias
// setting of the four sliders, which stay exposed. The curve the envelope computes from a preset is the
// spec; gates assert it, not rounded pixels. Default is the kit's DEFAULT_CONTROLS; Curated is the
// curated corpus setting (342 of 343 presets); the other five are the editor's former chip set.
export const ENVELOPE_PRESETS = [
  { name: "Default", damp: 80, dampCurve: 1.5, dampAmp: 0, dampBias: 0 },
  { name: "Curated", damp: 70, dampCurve: 1.5, dampAmp: 0, dampBias: 0 },
  { name: "Calm ends", damp: 92, dampCurve: 2.6, dampAmp: 0, dampBias: 0 },
  { name: "Vivid mids", damp: 70, dampCurve: 1.5, dampAmp: 55, dampBias: 0 },
  { name: "Shade-heavy", damp: 84, dampCurve: 1.5, dampAmp: 12, dampBias: 55 },
  { name: "Tint-heavy", damp: 84, dampCurve: 1.5, dampAmp: 12, dampBias: -55 },
  { name: "Flat", damp: 35, dampCurve: 1, dampAmp: 0, dampBias: 0 },
];

// envelopePresetOf: the name of the first preset whose four knobs all equal the controls' own, else null.
export function envelopePresetOf(controls) {
  const p = ENVELOPE_PRESETS.find((x) => x.damp === controls.damp && x.dampCurve === controls.dampCurve && x.dampAmp === controls.dampAmp && x.dampBias === controls.dampBias);
  return p ? p.name : null;
}

// shape, remap normalized position p∈[0,1] (0=light end, 1=dark end) to q∈[0,1].
// ten = tension/100; tension only affects logistic and exp (others ignore it).
function shape(p, curve, ten) {
  switch (curve) {
    case "linear":
      return p;
    case "sine":
      return 0.5 - 0.5 * Math.cos(Math.PI * p); // eased both ends
    case "cubic":
      return p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2; // cubic in/out
    case "logistic": {
      const k = lerp(4, 16, ten);
      const f = (x) => 1 / (1 + Math.exp(-k * (x - 0.5)));
      return (f(p) - f(0)) / (f(1) - f(0)); // normalized sigmoid
    }
    case "exp": {
      const k = lerp(0.4, 5, ten);
      return (Math.exp(k * p) - 1) / (Math.exp(k) - 1); // compressed lights
    }
    default:
      return p;
  }
}

// ── Lift: a cosine bump applied in STOP space ────────────────────────────────
// `lift` lightens (>0) or darkens (<0) a palette's mid stops. It used to be an
// ADDITIVE bump in TONE space (t += lift·w). That form ignores the base curve's
// local slope, so wherever the curve is flat, the light end under logistic at
// tension 0, flattened further by a positive skew, the bump's own slope won.
// The default Warning palette (skew 40, lift 15) drove t ABOVE lmax at stops
// 200-300 AND reversed the ramp at 100-150; the trailing clamp then flattened
// 050-300 into six identical #FFFFFF stops (#648).
//
// The fix applies the bump as a DISPLACEMENT OF THE STOP, then evaluates the
// unchanged, already-monotone tone curve there: t = base(stop − A·w(stop)).
// Because base(·) is non-increasing, the composition is monotone as soon as the
// displaced stop is strictly INCREASING in `stop`, i.e. d/dstop[A·w] < 1. With
//   w(stop) = ½(1 + cos(π(stop−500)/450))   ⇒   |w'| ≤ π/900
// that is one closed-form inequality, |A|·π/900 < 1, holding for EVERY curve,
// skew, tension, lmin and lmax, no per-curve tuning and nothing to re-verify
// when a curve is added. LIFT_SHIFT_MAX caps |A| at a safety factor of that
// bound, so the guarantee survives even a lift outside its schema domain.
const BUMP_SLOPE_MAX = Math.PI / 900;     // peak |dw/dstop| of the cosine bump
const LIFT_SAFETY = 0.85;                 // keep d/dstop[A·w] <= this, always < 1
export const LIFT_SHIFT_MAX = LIFT_SAFETY / BUMP_SLOPE_MAX; // ≈ 243.5 stops
// Stops of displacement per unit of lift. No gain can reproduce the old additive
// bump's AMPLITUDE, that amplitude is exactly what broke monotonicity, so some
// attenuation is forced, and `lift` is load-bearing well beyond the Warning
// default: ~90% of the curated category presets carry a non-zero lift, which is
// how a preset anchors its ramp on a sampled key color. 6 is therefore chosen as
// the largest gain that still keeps the guarantee comfortably inside its bound:
// at the extreme of lift's own domain (persist.js clamps lift to ±40) it asks for
// 6·40 = 240 stops, under LIFT_SHIFT_MAX, so the cap NEVER binds in-domain and
// lift stays linear across its whole range, while d/dstop[A·w] peaks at 0.838,
// short enough of 1 that the ramp never stalls (the whole 3,780-palette preset
// corpus renders with no duplicate swatch and a >=0.55 L* gap at every step).
// The cap is a pure out-of-domain safety net, not something in-domain relies on.
export const LIFT_GAIN = 6;

// liftStop, the stop `lift` displaces `stop` to. Pure in the single `stop`
// value (no neighbour lookup, no whole-ramp state), so the 19-stop display ramp
// and the 25-stop EXPORT_STOPS ramp agree at every shared stop. w is 0 at 050
// and 950, so both endpoints are fixed exactly and the ends keep their lmax/lmin.
// NOTE (review pass 3, Finding 5): this purity is necessary but no longer SUFFICIENT for stop-set
// agreement at the final rendered output - `enforceMonotonePixelL`'s post-pass (its own header
// comment) compares each stop to its immediate PREDECESSOR IN WHATEVER ARRAY IT IS GIVEN, which is
// not stop-set-pure, and can refine a shared stop differently between a 19-stop and a 25-stop call.
// Factored out rather than inlined so that #647, which wires skew/lift into the
// OKHSL path (okhslStops is also keyed off the stop NUMBER), reuses THIS helper
// instead of growing a second copy of the bump.
export function liftStop(stop, lift) {
  if (!lift) return stop;
  const a = Math.min(Math.max(lift * LIFT_GAIN, -LIFT_SHIFT_MAX), LIFT_SHIFT_MAX);
  const w = 0.5 * (1 + Math.cos((Math.PI * (stop - 500)) / 450)); // 1 at 500, 0 at 050/950
  return stop - a * w; // lift>0 -> read a LIGHTER stop -> lighter mids
}

// chromaEnvelope - U2 used to carry its own verbatim copy of this function here (copied from U3's own
// tonal.js at fa8f072, per the U2 re-diagnosis's Finding 1/9 seam fix) so U2's anchored branches could
// route through the same formula while U2 and U3 were still built in parallel on separate branches.
// At U4 integration the two definitions collided (both exported the same name from the same module -
// C7's "one envelope" gate exists precisely so this can't ship silently forked) and U3's own version,
// which additionally composes EVEN_DAMP_FACTOR for the even path (pass 7 step 1, defined above), is the
// one that wins: it is a strict superset of what this copy did (isEven=false reduces to the same
// formula this copy computed). U2's anchored branches (okhslStopsAnchored/paletteStopsAnchored, below
// and in the anchored branch of okhslStops) call the single export above; this second copy is deleted.
//
// anchorChromaBasis(stop, anchorStop, lift, anchorValue, groupValue) -> the EVEN path's BASIS
// chromaEnvelope's shoulder/damp multiplier gets applied to (Q-U2-5 ruling, addendum 2, u2-p2-brief.md,
// 2026-09-18): the anchor's own measured chroma exactly AT the pivot (w=0), blending to `groupValue` (the
// palette's `chroma`, always 100 since #785: the group mutes the ramp afterwards, in `dampStops`) at each side's true endpoint (w=1), BY
// THE LIFTSTOP POSITION - the SAME `sd` chromaEnvelope itself keys on, not `anchorWarp`'s skew-warped
// `w` (a local construction this ruling retired: tying the chroma BLEND to skew was never asked for,
// and it re-threaded `anchorLiftPos` back into the chroma path chromaEnvelope's own liftStop routing
// was built to replace).
//
// R2 (review pass 2, fix-first-2, 2026-09-18): the raw linear blend (`w = min(1, sd)`) has a NONZERO
// slope at the pivot - for a near-grey anchor (s/chroma close to 0) inside a chroma-100 group, one
// stop away from 500 already reads a noticeable fraction of the way toward `groupValue`, so the pivot
// sits in a visible "notch" relative to its own immediate neighbours even though chromaEnvelope's own
// continuity proof (env(500)=1 exactly) holds. Easing the WEIGHT to zero slope at sd=0 (smoothstep,
// `3t^2-2t^3` on `t=min(1,sd)`) fixes that: the blend still reaches 0 exactly at the pivot and 1
// exactly at each side's endpoint (smoothstep(0)=0, smoothstep(1)=1, same fixed ends as the raw linear
// form), but its derivative is 0 at t=0 too, so the chroma trajectory leaves the pivot flat instead of
// with a kink. `chromaEnvelope` itself stays verbatim (untouched) - only the BASIS this weight blends
// is different; the envelope's own shoulder/damp shaping is unaffected.
//
// Even only (#725 U2, owner ruling R69, reverses Q-U2-5 for perceptual and peak): the OKHSL anchored
// path (`okhslStopsAnchored`) holds the anchor's own `s` as its basis at every stop and does not call
// this, so a muted sample no longer climbs toward the group on either side of the pivot (the climb is
// what put perceptual stop 300 at a 94% median of stop 500 and every anchored peak ramp above its own
// anchor). The EVEN path (`paletteStopsAnchored`), which #701 owns and R69 does not move, keeps the climb.
export function anchorChromaBasis(stop, anchorStop, lift, anchorValue, groupValue) {
  const sd = Math.abs(liftStop(stop, lift) - liftStop(anchorStop, lift)) / 450;
  const t = Math.min(1, sd);
  const w = t * t * (3 - 2 * t); // smoothstep: w(0)=0, w(1)=1, w'(0)=w'(1)=0
  return anchorValue + (groupValue - anchorValue) * w;
}

// toneAt, L* for a stop given per-palette skew/lift and the tone controls.
// Strictly monotonic non-increasing 050->950 for ANY lift, not just lift 0:
// liftStop is strictly increasing in stop (see LIFT_SHIFT_MAX above), p rises,
// p^g preserves order for any g>0, every shape() is non-decreasing, and
// t = lmax-(lmax-lmin)*q inverts q. q stays in [0,1], so t stays in [lmin,lmax]
// by construction and the trailing clamp never fires, it is a safety net only,
// never the thing that produces a value (that is exactly the #648 defect).
export function toneAt(stop, skew, lift, { curve, lmin, lmax, tension }) {
  const s = liftStop(stop, lift);
  // 0 at 050 (light) .. 1 at 950 (dark). liftStop fixes both endpoints, so the
  // clamp only absorbs float dust at 050/950 and is identity for lift 0.
  let p = Math.min(1, Math.max(0, (s - 50) / 900));
  const g = 3 ** (skew / 100); // skew>0 -> gamma>1 -> lighter mids
  p = p ** g;
  const q = shape(p, curve, tension / 100);
  const t = lmax - (lmax - lmin) * q;
  return Math.min(Math.max(t, lmin), lmax);
}

// ── Anchored ramp (ticket #681, U2) ────────────────────────────────────────────────────────────
// A palette carrying a valid, stored `anchor` (see persist.js DOMAINS.palette.anchor - a source hex, never
// fitted) renders stop 500 as that anchor's OWN color VERBATIM, in every tone mode (this function;
// `paletteStops` damps it below group 100, R94), and builds the OTHER eighteen (plus six EXTRA_STOPS) stops
// as a two-sided ladder pivoting on (500, the anchor's own lightness) - the ramp's analog of prime.mjs's
// anchor branch (U1), continuous in `stop` where prime.mjs is seven discrete rungs. A palette with no (or
// malformed) `anchor` takes the ORIGINAL, byte-identical path below (C4's non-anchored identity control):
// `resolveAnchor` returns null and every other line executes exactly as it did before this ticket.
const ANCHOR_HEX = /^#[0-9A-Fa-f]{6}$/;
function hexToRgbLocal(hex) {
  const s = hex.slice(1);
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
// ACHROMATIC_ANCHOR_C (Ticket #739, Q2 ruled 0.002) - an anchor's OKLab chroma below this is
// achromatic: a grey, white, or black source whose stored hue is rounding residue, not a color
// anyone chose. An achromatic anchor still contributes its own lightness and (near-zero) chroma
// at the pivot (on perceptual and peak, the anchor's own okhsl s read directly in
// okhslStopsAnchored, not routed through anchorChromaBasis) but no hue: the ramp takes the
// palette's own stored hue instead (Q1 (a)), on both anchored branches below. OKLab chroma is the test, not CAM16 chroma:
// CAM16 chroma of a neutral is not 0 in this implementation (see rgbToOklabChroma's own comment).
// One 8-bit code off exact grey reads ~0.0012-0.0018; the constant sits just above that noise
// floor, below the two-codes-off reading (~0.003), so only rounding residue crosses it.
export const ACHROMATIC_ANCHOR_C = 0.002;

// resolveAnchor(palette) -> { hex, rgb, okhsl:{h,s,l}, lstar, cam:{hue,chroma,J}, achromatic } | null -
// every measured quantity the two anchored branches below need, computed ONCE per call from the SAME
// stored hex (never re-derived through a lossy round trip): OKHSL identity for the perceptual/peak
// path, CIE L*/CAM16 for the even path, plus whether the anchor itself is achromatic (#739). Reused
// by both so they can never read the anchor as two different colors.
function resolveAnchor(palette) {
  const hex = typeof palette.anchor === "string" && ANCHOR_HEX.test(palette.anchor) ? palette.anchor.toUpperCase() : null;
  if (!hex) return null;
  const rgb = hexToRgbLocal(hex);
  return {
    hex, rgb, okhsl: rgbToOkhsl(rgb), lstar: lstarFromRgb(rgb), cam: cam16FromRgb(rgb),
    achromatic: rgbToOklabChroma(rgb) < ACHROMATIC_ANCHOR_C,
  };
}
// Q3 (b), ruled (Q-U2-1, see .sdlc/questions/pif-u2.md): the TOKEN stays exact - prime.mjs's own
// DEFAULT rung (U1) always renders the source hex verbatim, whatever its L* - but the RAMP clamps:
// a source whose CIE L* falls outside this window renders stop 500 at the window edge nearest it,
// not the raw anchor hex. Rendering the raw anchor there would put a rising/falling kink right next
// to a pivot the OTHER stops are built to approach monotonically (measured: an out-of-window anchor
// verbatim at 500 broke monotonicity at its immediate neighbor). Clamping the pivot itself - both
// stop 500's own value AND the value the ladder's other stops shape toward - keeps the whole ramp a
// single monotone curve while a near-white or near-black source still gets a real eighteen-stop
// ladder instead of a pivot past both ends inverting it. C5 asserts the exact, by-name allow-list of
// sources this fires for (measured 9.95..95.05, the window a 9-stop-per-side ladder with a 0.55 L*
// minimum gap needs against the corpus's actual source L* distribution).
export const RAMP_L_MIN = 9.95, RAMP_L_MAX = 95.05;

// ── The band rule (ramp@2, T-0040, ADR-037) ─────────────────────────────────────────────────────
// BAND_EDGE: the two band edges, one module-level pair every path reads. Radix step 1 reads stop 100
// light and 900 dark, step 12 reads the onSurface role (950 light, 050 dark): all band stops in both
// schemes. The opt-in match-peer-lightness mode (step 4) moves the tone edge to 500.
export const BAND_EDGE = Object.freeze({ light: 100, dark: 900 });
export const inBand = (stop) => stop <= BAND_EDGE.light || stop >= BAND_EDGE.dark;
// BAND_PIVOT_GAP: the ramp's pivot (stop 500) must sit strictly inside the band interior, else the
// affine remap below inverts (an anchor at L* 10.8 under a shared stop 900 at L* 11.18 has no monotone
// ladder to it). An ANCHORED pivot keeps the verbatim anchor wherever it can (ADR-026, anchor.mjs C3):
// its window is RAMP_L_MIN..RAMP_L_MAX narrowed to the band interior by one 0.55 L* step, the C5
// minimum gap, so only sources within a step of the shared edge clamp (perceptual and peak: 94.9 / 11.2
// at the defaults; even's 96.8 / 8.2 contains the window). An UNANCHORED pivot is a construction (the
// cusp blend), not a promise, so it keeps the room the seven interior display stops need on the
// compressed side, eight such steps (BAND_PIVOT_ROOM): a peak-mode yellow whose cusp sits at L* 94
// would otherwise put stops 125 to 450 inside half an L* under the shared stop 100. Both clamps are
// continuous in the pivot's L*, as the window clamp always was.
export const BAND_PIVOT_GAP = 0.55;
export const BAND_PIVOT_ROOM = 8 * BAND_PIVOT_GAP;
// sharedToneAt(stop, controls): the palette-free L* ladder. Even: toneAt at skew 0, lift 0. Perceptual
// and peak: the L* of the neutral grey at OKHSL l = lerp(okhslLAt(lmax), okhslLAt(lmin), (stop-50)/900),
// the even-perceptual distribution the OKHSL paths step in; the two differ (even 96.8 vs 94.9 at stop
// 100) because each mode keeps its own ladder shape.
export function sharedToneAt(stop, controls) {
  const c = controls ?? DEFAULT_CONTROLS;
  const mode = c.toneMode || "perceptual";
  if (mode === "perceptual" || mode === "peak") {
    const l = lerp(okhslLAt(c.lmax ?? 100), okhslLAt(c.lmin ?? 5), (stop - 50) / 900);
    return lstarFromRgb(okhslToRgbFloat(0, 0, l));
  }
  return toneAt(stop, 0, 0, { curve: c.curve, lmin: c.lmin ?? 5, lmax: c.lmax ?? 100, tension: c.tension ?? 0 });
}
// pivotWindow(controls, gap): [lo, hi], the L* window a ramp's pivot is clamped into (see
// BAND_PIVOT_GAP; the anchored paths pass the gap, the unanchored ones BAND_PIVOT_ROOM). Exported for
// the gates that read the window (anchor.mjs C3/C5, envelope-measure's inRampWindow).
export function pivotWindow(controls, gap = BAND_PIVOT_GAP) {
  return [
    Math.max(RAMP_L_MIN, sharedToneAt(BAND_EDGE.dark, controls) + gap),
    Math.min(RAMP_L_MAX, sharedToneAt(BAND_EDGE.light, controls) - gap),
  ];
}
// bandWeight(stop, lift): the chroma blend weight, 0 at stop 500 and 1 at each band edge (and inside
// the band), anchorChromaBasis's smoothstep re-keyed on the liftStop distance from 500 to the edge,
// so the blend leaves the pivot flat (no notch) and reaches the tint exactly at 100 and 900.
function bandWeight(stop, lift) {
  if (inBand(stop)) return 1;
  const edge = stop < 500 ? BAND_EDGE.light : BAND_EDGE.dark;
  const span = Math.max(1e-9, Math.abs(liftStop(edge, lift) - liftStop(500, lift)));
  const t = Math.min(1, Math.abs(liftStop(stop, lift) - liftStop(500, lift)) / span);
  return t * t * (3 - 2 * t);
}
// tintFraction(controls, r): the band tint as a fraction of the stop's gamut ceiling, chromaFloor% times
// the group damper r (dampStops scales it, so a low-Base-chroma palette's ends stay near grey).
const tintFraction = (controls, r = 1) => (r * ((controls && controls.chromaFloor) ?? 0)) / 100;
// anchorTintFraction(controls, anchor): the perceptual and peak anchored paths' band tint fraction, the
// tint capped by the anchor's own gamut fraction, min(chromaFloor / 100, anchor C / ceiling): an
// achromatic anchor (#739) reads 0, so a grey, white or black anchor keeps grey ends and a grey
// interior (R69: those paths render an achromatic anchor's ramp achromatic); a muted anchor keeps ends
// no more saturated than itself. A cap, not a scale: an anchor at or above the floor's fraction (15 of
// the default kit's 16; Neutral #576485 reads 0.380) keeps the shared tint. The even paths and every
// unanchored palette read tintFraction (the even floor tints an achromatic anchor's ramp, R69).
function anchorTintFraction(controls, anchor) {
  if (anchor.achromatic) return 0;
  const mc = maxChromaInGamut(anchor.cam.hue, anchor.lstar);
  const own = mc > 0 ? Math.min(1, anchor.cam.chroma / mc) : 0;
  return Math.min(tintFraction(controls), own);
}
// solveSForChroma(hue, l, chroma): the OKHSL s in [0, 1] whose colour at (hue, l) measures CAM16 chroma
// `chroma` (bisection; CAM16 C is monotone non-decreasing in s at fixed hue/l). Saturates at 1 when
// the target is past the gamut, 0 for a target at or under 0.
export function solveSForChroma(hue, l, chroma) {
  if (!(chroma > 0)) return 0;
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (cam16FromRgb(okhslToRgbFloat(hue, mid, l)).chroma < chroma) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}
// solveSForFraction(hue, l, tone, frac): the OKHSL s at which (hue, s, l) renders `frac` of the gamut
// ceiling at the RENDER'S OWN CAM16 hue and `tone`. The ceiling near white moves steeply with hue and
// the CAM16 hue of a tint moves with its chroma (Abney), so a plain two-step fixed point oscillates
// (measured on a near-grey yellow anchor: C 5.7, 13.8, 6.7 at successive steps); the hue is averaged
// between steps and the loop stops once the hue settles under a degree. Achromatic renders (C at or
// under 1) read the OKLCH hue's CAM16 image at `frac` of its peak.
// ── The band memos (ramp@2, T-0040, ADR-037) ─────────────────────────────────────────────────────
// Exact-key `boundedCache` memos on the band rule's three searches (solveSForFraction, bandStopOkhsl,
// snapBandPixel), each capped at BAND_MEMO_CAP. #686: the key is the exact floats, never a rounded
// bucket, so no first caller decides a later caller's value (docs/references/knowledge-01-color-engine.md).
// An unedited palette re-renders its band stops and blend targets from the memo, so an edit pays the
// searches once, for the edited palette (measured: the default kit's edit render 7.2x ramp@1 without,
// see the T-0040 board for the ratio with). A hit returns a fresh copy of any cached array, so no caller
// can mutate the cache. Not a paletteStops memo: its records are mutable objects that dampStops, derive
// and the role chain read and write (#686's original defect). One kit is 16 palettes x 6 band stops x 3
// tone modes x 2 hue spaces, 576 band stops; the cap holds several kits' worth.
const BAND_MEMO_CAP = 4096;
const _sffMemo = boundedCache(BAND_MEMO_CAP), _bandMemo = boundedCache(BAND_MEMO_CAP), _snapMemo = boundedCache(BAND_MEMO_CAP);
function solveSForFraction(hue, l, tone, frac) {
  const key = hue + "|" + l + "|" + tone + "|" + frac;
  const hit = _sffMemo.get(key);
  if (hit !== undefined) return hit;
  const s = solveSForFractionUncached(hue, l, tone, frac);
  _sffMemo.set(key, s);
  return s;
}
function solveSForFractionUncached(hue, l, tone, frac) {
  let camHue = oklchToCam16Hue(hue, Math.min(1, Math.max(0, frac)));
  let s = 0;
  for (let i = 0; i < 6; i++) {
    s = solveSForChroma(hue, l, frac * maxChromaInGamut(camHue, tone));
    const cam = cam16FromRgb(okhslToRgbFloat(hue, s, l));
    if (!(cam.chroma > 1)) break;
    const d = ((cam.hue - camHue + 540) % 360) - 180;
    if (Math.abs(d) < 1) break;
    camHue = (((camHue + d / 2) % 360) + 360) % 360;
  }
  // Verified on the measure the snap and the gate read, the render's own gamut fraction (CAM16 chroma
  // over the ceiling at its own CAM16 hue and L*, an exact grey reading 0). Near white a hue whose
  // ceiling turns steeply with chroma can leave the fixed point cycling between two ceilings (measured:
  // OKLCH hue 78 at L* 94.9, a 0.069 target rendered at 0.41, C 6.06 against its anchor's 3.20). A miss
  // over 0.02 scans s over [0, 1] in 64 steps and keeps the s whose fraction is nearest (a target under
  // CAM16's neutral reading, about C 2.8 near white, lands on the grey).
  const fracOf = (x) => {
    if (!(x > 0)) return 0;
    const c = cam16FromRgb(okhslToRgbFloat(hue, x, l));
    const m = maxChromaInGamut(c.hue, tone);
    return m > 0 ? Math.min(1, c.chroma / m) : 0;
  };
  let err = Math.abs(fracOf(s) - frac);
  if (err <= 0.02) return s;
  for (let k = 0; k <= 64; k++) {
    const x = k / 64, e = Math.abs(fracOf(x) - frac);
    if (e < err) { err = e; s = x; }
  }
  return s;
}
// bandStopOkhsl(hue, tone, frac): a band stop's continuous OKHSL colour on the perceptual/peak paths:
// l solved for the shared L* (solveLForTone) and s for the tint (solveSForFraction), each twice since
// each solve moves the other a little. `camHue` is the CAM16 hue the render reads (null while achromatic).
// A tint the solve cannot reach lands on the grey: near white, under an anchor-capped fraction (a muted
// anchor's 0.17 of a ceiling of a few C), the target sits under CAM16's own reading of the neutral (white
// reads C 2.87), so the solve bottoms out at s 2^-25. That s is the grey, exactly 0, with no hue: read
// at the white point's CAM16 hue (209) instead, the snap took a warm off-white (#FBF6F5 at stop 075 of a
// violet palette, CAM16 C 0.40 scoring nearer the fraction than the grey's 0) and Gate B read the
// model under the cube's least s.
function bandStopOkhsl(hue, tone, frac) {
  const key = hue + "|" + tone + "|" + frac;
  let v = _bandMemo.get(key);
  if (v === undefined) { v = bandStopOkhslUncached(hue, tone, frac); _bandMemo.set(key, v); }
  return { ...v, rgb: v.rgb.slice() };
}
function bandStopOkhslUncached(hue, tone, frac) {
  if (tone >= 100) return { s: 0, l: 1, rgb: [255, 255, 255], camHue: null };
  if (tone <= 0) return { s: 0, l: 0, rgb: [0, 0, 0], camHue: null };
  let l = okhslLAt(tone), s = 0;
  for (let i = 0; i < 2; i++) {
    s = solveSForFraction(hue, l, tone, frac);
    l = solveLForTone(hue, s, tone);
  }
  if (s <= BAND_GREY_S) { s = 0; l = solveLForTone(hue, 0, tone); }
  const rgb = okhslToRgbFloat(hue, s, l);
  const cam = cam16FromRgb(rgb);
  return { s, l, rgb, camHue: s > 0 && cam.chroma > 1 ? cam.hue : null };
}
const BAND_GREY_S = 1e-6;
// snapBandPixel(rgb, hue, tone, fraction, maxTone, maxChroma): the last operation on a band stop, at every ramp
// chroma. The 8-bit pixel is chosen from the plus or minus 3 per channel neighbourhood of the rounded
// render, among candidates with |L* - tone| <= 0.45 (and, when the candidate's CAM16 chroma is above 1,
// a CAM16 hue within 12 degrees of `hue`): the one nearest the target in the chroma plane, its gamut
// fraction's distance from `fraction` (CAM16 chroma over the ceiling at its own hue and L*) plus
// SNAP_HUE_WEIGHT times its hue error as a chroma distance over the same ceiling (C x |hue - `hue`| in
// radians / ceiling), ties to the smaller |L* difference|. The hue term keeps a faint tint on its line:
// with the fraction alone, a candidate 12 degrees off scored as well as one on the hue (measured: the
// default kit's Primary stop 100 read 47 degrees off the anchor's CAM16 hue at C 6.6 in "cam16", past
// anchor.mjs hue-constancy's bound). Half weight, measured: at full weight the even path's stop 075
// fraction spread across peers read 0.155 on 4 SAMPLED presets (over peer-lightness's 0.15: near white
// the ceiling is a few C and one code moves the hue by tens of degrees). An exact grey reads
// fraction 0 (CAM16 reads a neutral above 0, white at 2.87). `maxTone` excludes candidates at or above
// the preceding stop's pixel L*, so a band pixel never rises over its neighbour and the monotone pass
// never has to move one; `maxChroma` excludes candidates over a CAM16 chroma (a peak-capped band stop's
// ramp-own stop 500). Why a search: rounding alone spreads the fraction by up to 0.42 at stop 075
// across the default kit's hues (one hue rounds to pure white) and the L* by more than the rounding of
// one channel; the search measured at most 0.035 and 0.88 L* across peers. No candidate inside the L*
// window (a near-black anchor whose interior rounded under the band's window: Nike secondary #101820,
// perceptual, stop 875 at 10.43 against the band's 11.18 - 0.45): the neighbour inside (`minTone`,
// `maxTone`) whose L* is nearest `tone`, at or under `maxChroma` when one is, so the band never rises over
// its neighbour; none inside either: the render. `minTone` (the light band only, finishRamp) keeps a
// light band pixel over stop 500's.
const SNAP_HUE_WEIGHT = 0.5;
function snapBandPixel(rgb, hue, tone, fraction, maxTone = Infinity, maxChroma = Infinity, minTone = -Infinity) {
  const key = rgb.join(",") + "|" + hue + "|" + tone + "|" + fraction + "|" + maxTone + "|" + maxChroma + "|" + minTone;
  let v = _snapMemo.get(key);
  if (v === undefined) { v = snapBandPixelUncached(rgb, hue, tone, fraction, maxTone, maxChroma, minTone); _snapMemo.set(key, v); }
  return v.slice();
}
function snapBandPixelUncached(rgb, hue, tone, fraction, maxTone, maxChroma, minTone) {
  const TOL = 0.45, RADIUS = 3, HUE_TOL = 12;
  const [r0, g0, b0] = rgb;
  let best = null, bestScore = Infinity, bestDl = Infinity;
  // the no-candidate fallbacks: the nearest `tone` inside (minTone, maxTone) at or under maxChroma, then
  // ignoring the chroma bound
  let under = null, underDl = Infinity, underAny = null, underAnyDl = Infinity;
  for (let dr = -RADIUS; dr <= RADIUS; dr++) {
    const r = r0 + dr;
    if (r < 0 || r > 255) continue;
    for (let dg = -RADIUS; dg <= RADIUS; dg++) {
      const g = g0 + dg;
      if (g < 0 || g > 255) continue;
      for (let db = -RADIUS; db <= RADIUS; db++) {
        const b = b0 + db;
        if (b < 0 || b > 255) continue;
        const cand = [r, g, b];
        const L = lstarFromRgb(cand);
        const dl = Math.abs(L - tone);
        if (L >= maxTone || L <= minTone) continue;
        if (dl < underAnyDl) { underAny = cand; underAnyDl = dl; }
        if (dl < underDl && (maxChroma === Infinity || cam16FromRgb(cand).chroma <= maxChroma)) { under = cand; underDl = dl; }
        if (dl > TOL) continue;
        const grey = r === g && g === b;
        const cam = grey ? null : cam16FromRgb(cand);
        const chroma = grey ? 0 : cam.chroma;
        if (chroma > maxChroma) continue;
        if (chroma > 1 && hue !== null) {
          const d = Math.abs(cam.hue - hue) % 360;
          if (Math.min(d, 360 - d) > HUE_TOL) continue;
        }
        const mc = chroma > 0 ? maxChromaInGamut(cam.hue, L) : 0;
        const f = mc > 0 ? Math.min(1, chroma / mc) : 0;
        let score = Math.abs(f - fraction);
        if (chroma > 1 && hue !== null && mc > 0) {
          const d = Math.abs(cam.hue - hue) % 360;
          score += (SNAP_HUE_WEIGHT * chroma * Math.min(d, 360 - d) * (Math.PI / 180)) / mc;
        }
        if (score < bestScore - 1e-12 || (Math.abs(score - bestScore) <= 1e-12 && dl < bestDl)) { best = cand; bestScore = score; bestDl = dl; }
      }
    }
  }
  return best ?? under ?? underAny ?? rgb;
}
// snapBandStops(stopsOut, controls, r, mode, side): snaps every band stop of a built ramp in ascending
// stop order at tone sharedToneAt(stop) and fraction r x the stop's own `tintFrac` (the path's per-palette
// tint fraction, anchorTintFraction or tintFraction), each bounded above by the preceding stop's final
// pixel L*, so a band pixel never rises over its neighbour. Re-reads hex, chroma and maxc from the pixel;
// `tone` is re-read on the OKHSL paths (they report the measured L*) and kept at the target on even (that
// path reports the target, see anchor.mjs gapOk19). A stop at tone 100 or 0 is pure white or black and
// is not searched. `side` limits the pass to the light band (stops at or below BAND_EDGE.light) or the
// dark one, so `finishRamp` can snap the light band, hold the interior under it, then snap the dark
// band under the interior's final pixels. "all" (Match peer lightness, where every stop is on the shared
// ladder) snaps every stop in one pass, top down: an interior stop keeps its own pixel's gamut fraction
// and hue as the target (its chroma is the blend's, not the tint) under `interiorMaxC`, so only its L*
// is pulled onto the ladder; the 8-bit rounding and the damper's re-hold left the default kit's damped
// stop 875 1.15 L* apart across palettes without it.
const isOkhslMode = (mode) => !mode || mode === "perceptual" || mode === "peak";
const byStop = (stopsOut) => stopsOut.map((st, i) => i).sort((a, b) => stopsOut[a].stop - stopsOut[b].stop);
function snapBandStops(stopsOut, controls, r, mode, side = "both", interiorMaxC = Infinity) {
  const order = byStop(stopsOut);
  const okhsl = isOkhslMode(mode);
  const all = side === "all";
  for (let k = 0; k < order.length; k++) {
    const st = stopsOut[order[k]];
    const band = inBand(st.stop);
    if (!band && !all) continue;
    if (side === "light" && st.stop > BAND_EDGE.light) continue;
    if (side === "dark" && st.stop < BAND_EDGE.dark) continue;
    const tone = sharedToneAt(st.stop, controls);
    if (tone >= 100 || tone <= 0) { st.snapped = false; continue; }
    const maxTone = k > 0 ? lstarFromRgb(stopsOut[order[k - 1]].rgb) - 1e-9 : Infinity;
    // a light band pixel stays over stop 500's, so the interior between always has room (finishRamp);
    // the one-pass "all" order already puts every stop under its predecessor
    const p500 = !all && st.stop <= BAND_EDGE.light ? stopsOut.find((x) => x.stop === 500) : undefined;
    const minTone = p500 ? lstarFromRgb(p500.rgb) + 1e-9 : -Infinity;
    // the snap's reference hue: the even path's own CAM16 hue (`hue`), else the OKHSL band render's
    // (`bandHue`: the float render's CAM16 hue, or the anchor's in "cam16"; null while it reads
    // achromatic), never the rounded pixel's, whose hue is quantisation noise at a faint tint (the
    // default kit's Data 1 stop 950 rounded 10 degrees off).
    const cam0 = cam16FromRgb(st.rgb);
    const grey0 = st.rgb[0] === st.rgb[1] && st.rgb[1] === st.rgb[2];
    const hue = st.hue !== undefined ? (cam0.chroma > 1 ? st.hue : null) : st.bandHue !== undefined ? st.bandHue : cam0.chroma > 1 ? cam0.hue : null;
    // an OKHSL band stop on the grey (bandStopOkhsl: an unreachable tint) snaps to the grey; an
    // interior stop ("all") keeps its own pixel's fraction
    const mc0 = grey0 ? 0 : maxChromaInGamut(cam0.hue, lstarFromRgb(st.rgb));
    const fraction = !band ? (mc0 > 0 ? Math.min(1, cam0.chroma / mc0) : 0)
      : okhsl && st.model === 0 ? 0 : r * (st.tintFrac ?? tintFraction(controls));
    // a peak-capped band stop (okhslStopsAnchored) is bounded by the ramp's own stop-500 chroma
    const c500 = st.peakCap ? (stopsOut.find((x) => x.stop === 500) ?? {}).chroma : undefined;
    const pixel = snapBandPixel(st.rgb, hue, tone, fraction, maxTone, !band ? interiorMaxC : c500 > 0 ? c500 : Infinity, minTone);
    st.snapped = true;
    st.rgb = pixel;
    st.hex = "#" + pixel.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    const cam = cam16FromRgb(pixel);
    st.chroma = pixel[0] === pixel[1] && pixel[1] === pixel[2] ? 0 : cam.chroma; // an exact grey reads 0 (CAM16 reads a neutral above 0)
    const L = lstarFromRgb(pixel);
    if (okhsl) st.tone = L;
    st.maxc = maxChromaInGamut(st.hue ?? cam.hue, okhsl ? L : st.tone);
  }
}
// finishRamp(stopsOut, controls, mode, maxChroma): the ramp@2 tail on every path, top down. Stop 500 is
// fixed throughout: the verbatim anchor, a clamped pivot or an unanchored one, each built at its own
// target (moving a clamped 500 lowered its chroma under the peak cap's ceiling: Kea primary-muted
// #E1F5DA, peak, 16.84 against interior stops at 17.37). (1) Snap the light band (050 to 100), each pixel
// over stop 500's. (2) Hold every interior stop under its preceding stop's final pixel L* and, on the
// light side, over stop 500's (enforceMonotonePixelL): the light-side interior of an anchor next to the
// clamped window has under one 8-bit code of L* per stop (Nike tertiary-muted #FFFFFF: stops 125 to 500
// share 0.55 L*), and a stop that rounds under the pivot is lifted, where the one-sided pass could only
// lower. (3) Snap the dark band (900 to 950) under the interior's final pixels. Every rendered ramp
// descends in pixel L*.
function finishRamp(stopsOut, controls, mode, maxChroma = Infinity) {
  // Match peer lightness: every stop is on the shared ladder, so one top-down snap of every stop
  if (controls.matchPeerLightness === true) {
    snapBandStops(stopsOut, controls, 1, mode, "all", maxChroma);
    return stopsOut;
  }
  snapBandStops(stopsOut, controls, 1, mode, "light");
  enforceMonotonePixelL(stopsOut, maxChroma);
  snapBandStops(stopsOut, controls, 1, mode, "dark");
  return stopsOut;
}

// anchorLerp(pivot, edgeLight, edgeDark, stop, skew, lift, curve, tension, edgeLightStop, edgeDarkStop)
// (ramp@2: the two edge-stop knots default to the ramp's true ends, 050 and 950, where they read exactly
// 1 and 0; the band rule passes BAND_EDGE.light and BAND_EDGE.dark so the light side maps the unit
// read over [t(100), t500] onto [edgeLight, pivot] and the dark side [t500, t(900)] onto [pivot,
// edgeDark]: still an affine remap of a monotone function, so still monotone, and the pieces meet the
// band ladder exactly at the edges) - the piecewise ladder VALUE
// at `stop` (never called at stop===500 - callers special-case the exact pivot/anchor separately),
// shared by okhslStopsAnchored (OKHSL l) and paletteStopsAnchored (CIE L*) so the two paths' tone math
// can never drift apart (the codebase's own "computed identically in both paths" invariant).
//
// R6 (review pass 2, fix-first-2, owner-ruled construction question, 2026-09-18): NOT a per-side
// double-S (warp the position with `anchorWarp`, THEN reshape THAT with `shape(w,curve,tension)` - a
// SECOND composition stacked on top of toneAt's own p^g -> shape order, which put the anchor at 500 on
// the FLATTEST part of each side's S instead of toneAt's own steepest point there, and read as toneAt's
// shape remapped through the pivot when it measurably was not: reverting to a straight lerp dropped the
// 19-stop gap-allow list from 69 to 41 and the 25-stop distinct-allow list from 10 to 1). This is a
// piecewise-AFFINE remap of `toneAt` itself instead: `t = toneAt(stop, skew, lift, {curve, lmin:0,
// lmax:1, tension})` reuses toneAt's OWN composition (skew's gamma, then curve/tension's shape) in a
// UNIT range, so both true endpoints read EXACTLY 1 (light, stop 050) and 0 (dark, stop 950) for any
// skew/lift/curve/tension - liftStop fixes 050/950 exactly (see liftStop's own header) so p is exactly
// 0/1 there, and shape(0)=0, shape(1)=1 for every curve (toneAt's own invariant). `t500` is that same
// unit-range read at stop 500 - strictly between 0 and 1, since 500 is strictly interior. Each side then
// maps t's own already-monotone range AFFINELY onto [edgeValue, pivot]: light side maps [t(050)=1,
// t500] onto [edgeLight, pivot], dark side maps [t500, t(950)=0] onto [pivot, edgeDark]. An affine
// remap of a monotone function is monotone, so the whole pivot-to-edge blend is monotone BY
// CONSTRUCTION - no separate warp/shape proof needed - both true ends stay exactly edgeLight/edgeDark
// (t at either true endpoint maps to the interval's own end), and F4 stays satisfied: skew, lift, curve
// and tension all act through the SAME `toneAt` the non-anchored path calls, not a second construction.
// `curve` "linear" still reduces `shape(...)` to skew's own p^g (no reshaping) - used below by the
// OKHSL path's own vibrancy blend (see okhslStopsAnchored) as the "even" side of that mix.
function anchorLerp(pivot, edgeLight, edgeDark, stop, skew, lift, curve, tension, edgeLightStop = 50, edgeDarkStop = 950) {
  const ctl = { curve, lmin: 0, lmax: 1, tension: tension ?? 0 };
  const t500 = toneAt(500, skew, lift, ctl); // strictly in (0,1): 500 is strictly interior
  const t = toneAt(stop, skew, lift, ctl);
  if (stop <= 500) {
    const tEdge = toneAt(edgeLightStop, skew, lift, ctl); // 1 exactly at 050
    const span = Math.max(1e-9, tEdge - t500); // span>0 since the edge is lighter than 500
    return edgeLight + (pivot - edgeLight) * ((tEdge - t) / span);
  }
  const tEdge = toneAt(edgeDarkStop, skew, lift, ctl); // 0 exactly at 950
  const span = Math.max(1e-9, t500 - tEdge); // span>0 since the edge is darker than 500
  return edgeDark + (pivot - edgeDark) * ((t - tEdge) / span);
}

// paletteStopsAnchored - the even (CIE L*) path's anchored branch: `toneAt`'s piecewise analog,
// pivoting on (500, the anchor's own measured L*), now composing toneAt's own curve/tension shape
// through anchorLerp (F4, see its comment) instead of a straight lerp. Hue: "cam16" hueSpace (F4) holds
// the anchor's OWN measured CAM16 hue constant across the ramp - no Abney solve needed, we already have
// the real value; "oklch" hueSpace solves, AT EVERY STOP (R3, review pass 2, 2026-09-18 - a solve done
// only once, at the anchor's own chroma/tone, is degenerate: that point IS the anchor's own point, so it
// always resolves back to the anchor's own CAM16 hue and never moves the ramp), the CAM16 hue that
// reproduces the anchor's OWN OKLCH hue at THAT STOP's actual chroma/tone, so a stop's PERCEIVED
// (OKLCH) hue stays close to the anchor's real OKLCH hue throughout the ramp, not only at the pivot -
// see the per-stop solve inside the stops.map below. Chroma is routed through the shared `chromaEnvelope` (see its
// own comment above `liftStop`) - verbatim, not forked. Q-U2-5 ruling (revision 17, team-lead, applying
// the owner's F4 principle: keep REQ-002 as ratified, fix the construction to satisfy it), addendum 2
// (basis keyed on liftStop, not anchorWarp - see `anchorChromaBasis`'s own header comment): the BASIS
// chromaEnvelope's shoulder/damp multiplier is applied to is a BLEND, not the anchor's own chroma read
// unconditionally at every stop - exactly the anchor's own measured CAM16 chroma AT the pivot (liftStop
// position 0, stop 500, byte-exact, matching the explicit stop-500 special case below), shading to the
// palette's `chroma` (always 100 here since #785; REQ-002's "Base chroma moves every ramp in the group"
// now holds through `dampStops`, after this render) at each side's true endpoint (liftStop position 1).
// This is a SEPARATE position measure from the tone construction above (`anchorLerp`'s own toneAt-based
// remap, R6) - the two are no longer tied to a single shared `w`, which is intentional: R4 retired the
// skew-warped `w` from the chroma path specifically because tying the chroma blend to skew was never
// asked for.
// enforceMonotonePixelL (R1, review pass 2, 2026-09-18, team-lead correction on top of the fix-first-2
// pass): the residual pixel-L* rises measured by `monotoneOk` are NOT a Helmholtz-Kohlrausch effect (H-K
// is a perceived-brightness effect of CHROMA that CIE L* cannot model at all, so it structurally cannot
// cause a measured CIE L* rise; that attribution, carried in an earlier pass, was wrong). The review's
// own instrumented probe proved continuous (pre-rounding) CIE L* is monotone in all 6,760 measured
// perceptual+peak anchored corpus ramps; every rise appears only at the 8-bit RGB rounding step, where a
// continuous L* step that shrinks below one 8-bit code gets its sign flipped by which channel's byte
// value happens to round up or down (example: stops 925->950, #100E23 to #10101B, blue drops 8 codes,
// green rises 2; green carries more luminance weight, so pixel L* reads lighter despite continuous L*
// falling). Fix at construction, not the gate: walk the emitted stops in ascending-stop (light-to-dark,
// 050 light / 950 dark per the STOPS comment above) order and, wherever a stop's rounded pixel L* rises
// above the immediately preceding (already-finalized) stop's pixel L*, replace it with the nearest
// in-gamut integer-RGB neighbour that keeps pixel L* non-increasing, a small integer search around the
// ROUNDED rgb (not the continuous one), adapted from U3's `refineNearestRgb` pattern. Never touches stop
// 500, the anchor pivot: byte-exact by contract at group 100 (R94 damps after); a dark-side neighbour may use its
// exact L* as its bound. If no in-gamut neighbour within the search radius satisfies the bound, the stop
// is left unchanged so a genuinely larger defect surfaces as a real gate failure instead of being forced.
// STOP-SET DEPENDENT (review pass 3, Finding 5, 2026-09-18, documented not fixed): unlike `liftStop`/
// `effStop` above (pure in the single stop value, so the 19-stop display ramp and the 25-stop export
// ramp "agree at every shared stop" by construction), this function compares each stop to its
// IMMEDIATE PREDECESSOR IN WHATEVER ARRAY IT IS GIVEN - a stop's neighbour differs between the 19-stop
// and 25-stop calls (the 25-stop set has extra half-steps between some pairs), so a stop identical in
// both calls can be refined by one and not the other. Measured: 27 of 11,340 ramps differ at a shared
// stop between a direct `paletteStops(p, c, STOPS)` call and the 19-stop display ramp of a
// `paletteStops(p, c, EXPORT_STOPS)` call. Every SHIPPED caller renders via `EXPORT_STOPS` once and
// projects the 19-stop subset from that SAME array (`model.mjs`'s `projectView`, `exports.js`,
// `scripts/gen-tonal-fixture.mjs`) - see this file's own top to bottom flow - so nothing visible moves
// today; a caller that renders `STOPS` and `EXPORT_STOPS` separately for the SAME palette would see the
// difference. Also updates `chroma`/`maxc` on a refined stop (they used to stay at their pre-refinement
// values - a real staleness, since `.chroma` is read by the UI's swatch inspector): `chroma` is the
// swapped RGB's own CAM16 chroma, `maxc` is the gamut ceiling at that RGB's own hue and pixel tone.
// `inGamut` needs no update - the search only ever considers `[0,255]^3` candidates, so it was, and
// stays, `true`.
// ramp@2 (T-0040): `enforceMonotonePixelL(stopsOut, maxChroma)` skips the band stops (snapBandStops owns
// their pixels) and stop 500 (fixed: finishRamp's comment). Every other stop, in ascending stop order,
// must sit at or under its preceding stop's final pixel L* (`hi`, as before) and, on the light side, at
// or over stop 500's (`lo`, new: a light-side stop that rounds under the pivot is lifted, where the
// one-sided pass could only lower). A stop inside [lo, hi] is kept; otherwise the nearest RGB neighbour
// within the radius inside [lo, hi] is taken (and, on the anchored peak path, at or under `maxChroma`,
// the ramp's stop-500 chroma, so the pass never undoes the peak cap: The Matrix tertiary-muted #1F1F24
// stop 700 moved to C 5.73 over its 500's 5.48); with none, the preceding stop's pixel is repeated (a
// duplicate, never a rise; measured to fire on no stop of the default kit or the corpus, a safety net).
function enforceMonotonePixelL(stopsOut, maxChroma = Infinity) {
  const EPS = 1e-9;
  const RADIUS = 3;
  const order = byStop(stopsOut);
  const L = (st) => lstarFromRgb(st.rgb);
  const pivot = stopsOut.find((st) => st.stop === 500);
  for (let k = 1; k < order.length; k++) {
    const cur = stopsOut[order[k]];
    if (inBand(cur.stop) || (pivot && cur === pivot)) continue;
    const prev = stopsOut[order[k - 1]];
    const hi = L(prev);
    const lo = pivot && cur.stop < 500 ? L(pivot) : -Infinity;
    const own = L(cur);
    if (own <= hi + EPS && own >= lo - EPS) continue;
    const [r0, g0, b0] = cur.rgb;
    let best = null, bestDist = Infinity;
    for (let dr = -RADIUS; dr <= RADIUS; dr++) {
      const r = r0 + dr;
      if (r < 0 || r > 255) continue;
      for (let dg = -RADIUS; dg <= RADIUS; dg++) {
        const g = g0 + dg;
        if (g < 0 || g > 255) continue;
        for (let db = -RADIUS; db <= RADIUS; db++) {
          const b = b0 + db;
          if (b < 0 || b > 255) continue;
          if (dr === 0 && dg === 0 && db === 0) continue;
          const l = lstarFromRgb([r, g, b]);
          if (l > hi + EPS || l < lo - EPS) continue;
          if (maxChroma < Infinity && cam16FromRgb([r, g, b]).chroma > maxChroma) continue;
          const dist = dr * dr + dg * dg + db * db;
          if (dist < bestDist) { bestDist = dist; best = [r, g, b]; }
        }
      }
    }
    if (!best) best = prev.rgb.slice();
    cur.rgb = best;
    cur.hex = "#" + best.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    cur.tone = lstarFromRgb(best);
    const cam = cam16FromRgb(best);
    cur.chroma = cam.chroma;
    if (cur.hue !== undefined) cur.hue = cam.hue;
    cur.maxc = maxChromaInGamut(cam.hue, cur.tone);
    // A swapped stop is flagged; its model, env, basis and floor stay as built (the curve it was asked for).
    cur.refined = true;
    // cur.inGamut stays true - the search above only ever considers in-gamut [0,255]^3 candidates.
  }
}

function paletteStopsAnchored(palette, controls, stops, anchor) {
  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;
  // hueSpace (F4/R3, review pass 2, 2026-09-18): "cam16" holds the anchor's own measured CAM16 hue
  // constant across every stop (no solve, we already have the real value - `seedHue` below). "oklch"
  // used to solve the CAM16 hue reproducing the anchor's own OKLCH hue reading AT THE ANCHOR'S OWN
  // chroma/tone - a degenerate solve, since that point IS the anchor's own point: it always returned
  // anchor.cam.hue back unchanged (to solve precision), so hueSpace measured as dead for every anchored
  // ramp (0 of 3,396 moved). The fix solves PER STOP instead, inside the stops.map below: at each
  // stop's OWN tone (and an estimated chroma at that tone), so the ramp's OKLCH hue stays close to the
  // anchor's real OKLCH hue THROUGHOUT the ramp, not only at the pivot - the correction the non-anchored
  // path's own stop-500-only calibration also only partially gives (see its own comment in paletteStops).
  // An achromatic anchor's own hue reading is rounding residue (#739): both the OKLCH target the
  // per-stop solve chases and the CAM16 seed take the palette's own stored hue instead, through the
  // same effHue/hueAnchorFrac the non-anchored path seeds itself with - so hueSpace keeps the meaning
  // it has there. A chromatic anchor is untouched: both lines read exactly as before this ticket.
  const targetOklchHue = anchor.achromatic ? palette.hue : rgbToOklchHue(anchor.rgb);
  const seedHue = anchor.achromatic ? effHue(palette.hue, controls.hueSpace, hueAnchorFrac(palette, controls)) : anchor.cam.hue; // "cam16" mode's fixed hue; also the gamut/chroma-estimate seed for "oklch"
  // Q3 (b): a source outside the window still stores/reports its byte-exact anchor everywhere else
  // (prime.DEFAULT, C2) - "the token stays exact" - but the RAMP itself "clamps": stop 500 is built
  // from the SAME continuous piecewise construction as every other stop, evaluated exactly at the
  // pivot (anchorLerp's w=0 point gives the pivot value at stop 500 with no special case needed),
  // rather than forcing the verbatim anchor pixel there. That keeps stop 500 CONTINUOUS with its
  // neighbours (built by the identical formula), where forcing the verbatim anchor at a clamped
  // pivot would jump AWAY from the window edge its neighbours are shaped around - the exact
  // discontinuity that broke monotonicity before this branch existed. Only sources strictly inside
  // the window get the verbatim, byte-exact stop-500 special case below.
  // ramp@2: the window is the band interior (pivotWindow), RAMP_L_MIN/MAX narrowed by BAND_PIVOT_GAP.
  // Match peer lightness (ADR-037): stop 500 sits on the shared ladder like every other stop, so it is a
  // construction at the anchor's hue and chroma basis, as a clamped pivot is.
  const match = controls.matchPeerLightness === true;
  const [winLo, winHi] = pivotWindow(controls);
  const clamped = match || anchor.lstar < winLo || anchor.lstar > winHi;
  const pivotTone = match ? sharedToneAt(500, controls) : Math.min(winHi, Math.max(winLo, anchor.lstar));
  // The band rule (ramp@2): a band stop's tone is the shared ladder's; an interior stop's is the
  // palette's own construction remapped onto [shared(100), pivot] and [pivot, shared(900)].
  const edgeLightTone = sharedToneAt(BAND_EDGE.light, controls), edgeDarkTone = sharedToneAt(BAND_EDGE.dark, controls);
  const frac = tintFraction(controls);
  const skew = palette.skew ?? 0;
  const toneOf = (s) => (inBand(s) || match ? sharedToneAt(s, controls)
    : anchorLerp(pivotTone, edgeLightTone, edgeDarkTone, s, skew, palette.lift ?? 0, controls.curve, controls.tension, BAND_EDGE.light, BAND_EDGE.dark));
  // Chroma basis (re-diagnosis Finding 1, Q-U2-5 ruled - see `anchorChromaBasis`'s own header
  // comment): routed through the shared envelope function (copied from U3, see its own comment above
  // `liftStop`), keyed on `liftStop` like the non-anchored path. The envelope, called below with an
  // anchor stop of 500, is exactly 1 at stop 500 for any lift, so at the pivot `evenChroma` reduces to
  // the BASIS's own pivot value exactly - no notch, by construction. The basis itself is
  // `anchorChromaBasis`'s blend: the anchor's own measured CAM16 chroma at the pivot (`anchorIntended`,
  // liftStop position 0), shading to `groupIntended` (`palette.chroma`-derived, always 100 here since
  // #785, the group damps afterwards in `dampStops`; mirrors `paletteStops`'s `target`/relChroma) at
  // each side's endpoint (liftStop position 1) - never the anchor's value read unconditionally at
  // every stop, and never `palette.chroma` alone either.
  const maxc500 = maxChromaInGamut(seedHue, anchor.lstar);
  const anchorRelFrac = maxc500 > 0 ? Math.min(1, anchor.cam.chroma / maxc500) : 0;
  const pk = peakC(seedHue).c; // the SEED hue's max chroma in sRGB - same basis paletteStops's own `target` uses
  // evenChroma's floorRef (#701 U2, revision 14; per stop since #766): the largest gamut ceiling among
  // the pivot and its first display step on either side (450, 550), at the tones this ramp renders
  // them. See evenChroma's own comment for why the first step, not the pivot alone, sets the level.
  // floorRefAt reads the three ceilings inside chromaAt below, at the candidate hue h, so the per-stop
  // OKLCH hue solve and the final chroma line evaluate the same floor; the pivot's ceiling is read at
  // pivotTone, where stop 500 renders, not at anchor.lstar (they differ only for a clamped anchor).
  // chromaAt's second parameter is the hue the reference is read at: the candidate hue inside the solve,
  // the solved hue (before edge rotation) on the final line. Exact against the old per-ramp reading under
  // cam16 with an unclamped anchor at any hueShift; the per-stop OKLCH solve moves stops by a measured
  // amount (floorRefAt's comment).
  const tone450 = toneOf(450);
  const tone550 = toneOf(550);
  const lift = palette.lift ?? 0;
  const oklchSpace = controls.hueSpace === "oklch";
  const built = stops.map((stop) => {
    if (stop === 500 && !clamped) {
      return {
        stop, tone: anchor.lstar, chroma: anchor.cam.chroma, hue: anchor.cam.hue,
        maxc: maxc500, rgb: anchor.rgb, hex: anchor.hex, inGamut: true,
        env: 1, model: anchor.cam.chroma, basis: anchor.cam.chroma, floor: 0, tintFrac: frac,
      };
    }
    const tone = toneOf(stop);
    const w = bandWeight(stop, lift); // the band rule's chroma blend weight: 0 at 500, 1 at the edge and in the band
    const s = (stop - 500) / 450;
    const dir = sameDir ? -Math.abs(s) : s;
    const env = chromaEnvelope(stop, 500, lift, controls);
    // chromaAt(h).chroma - the chroma THIS stop will actually render at candidate hue h: the exact formula
    // the final chroma line below evaluates, factored out so the hue solve (review pass 4, Finding 2)
    // can converge against the real render, not a stand-in seed chroma that the render then discards -
    // see solveCam16Hue's own header comment for why that mismatch mattered. The floor's own ceiling is the
    // stop's gamut ceiling at hRef (the hue before edge rotation), capped at mc: evenChroma's floorMaxc
    // (#784 explains why the floor must not read the rotated ceiling). chromaAt returns the chroma with its
    // basis (the un-damped intended chroma) and floor; the solve's wrapper hands it the number alone.
    // The band rule (ramp@2): `tint` is chromaFloor% of the floor's own ceiling `fm`, the stop's gamut
    // ceiling at its tone and at the hue before edge rotation, capped at the rotated hue's; a band stop
    // renders it, an interior stop blends its own value toward it by `w`. Not the rotated hue's ceiling
    // (#784's reason, the floor's): near white that ceiling swings by tens of C over a few degrees, so
    // under hueShift a band stop whose rotated hue left the yellow cusp dipped under both neighbours
    // (oklch Success hueShift +60, stop 100: 10.43 / 6.86 / 12.30 at 075 / 100 / 125). At hueShift 0 fm is
    // mc and the tint is as before. `tintFrac` is the tint over mc, so the snap and the damper target it.
    const chromaAt = (h, hRef = h) => {
      const mc = maxChromaInGamut(h, tone);
      const anchorIntendedH = controls.relChroma ? anchorRelFrac * mc : anchor.cam.chroma;
      const groupIntendedH = controls.relChroma ? mc : pk;
      const intendedH = anchorChromaBasis(stop, 500, lift, anchorIntendedH, groupIntendedH);
      const fm = Math.min(mc, maxChromaInGamut(hRef, tone));
      const fr = floorRefAt(hRef, fm, pivotTone, tone450, tone550);
      const tint = frac * fm;
      const tintFrac = fm < mc ? (frac * fm) / mc : frac;
      const own = evenChroma(mc, intendedH, env, controls.chromaFloor, fr, fm);
      return { chroma: own + (tint - own) * w, basis: intendedH, floor: evenFloor(mc, intendedH, controls.chromaFloor, fr, fm), tint, tintFrac };
    };
    let resolvedHue = seedHue;
    if (oklchSpace) {
      // R3 (review pass 2) solves per stop, at THIS STOP'S OWN tone, not once at the anchor's own
      // point (the degenerate solve that made hueSpace measure as dead). Review pass 4 Finding 2
      // solves hue and the REAL render chroma jointly via chromaAt above; review pass 5 Finding 1
      // replaced the fixed-point step inside solveCam16Hue with a bracketed root-find (see its own
      // header comment) - seedHue is no longer passed or used as a fallback there.
      resolvedHue = solveCam16Hue(targetOklchHue, 0, tone, false, { chromaAt: (h) => chromaAt(h).chroma });
    }
    const hue = (((resolvedHue + shift * dir) % 360) + 360) % 360;
    const maxc = maxChromaInGamut(hue, tone);
    const { chroma, basis, floor, tint, tintFrac } = chromaAt(hue, resolvedHue);
    const out = hctToRgb(hue, chroma, tone);
    const hex =
      "#" +
      out.rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    return { stop, tone, chroma, hue, maxc, rgb: out.rgb, hex, inGamut: out.inGamut, env, model: chroma, basis, floor, tint, tintFrac };
  });
  return finishRamp(built, controls, controls.toneMode);
}

// paletteStops, full per-stop pipeline for one palette.
// palette: { hue, chroma, skew, lift }; controls: DEFAULT_CONTROLS-shaped.
// Returns [{ stop, tone, chroma, maxc, rgb, hex, inGamut }] for each stop (even adds its CAM16 `hue`, for `dampStops`).
// Performance note (review pass 5, then a review-6 perf/memo-safety pass, both 2026-09-19):
// `projectView` (model.mjs) used to re-derive every anchored palette's full ramp roughly 10x per
// document - once for the live canvas, then again once per export format via `derivePalette`
// (exports.js), each an INDEPENDENT, otherwise identical call into `paletteStopsAnchored` with the
// SAME palette/controls/stops. A module-level memo cache (`_pmemo`, keyed on `stops.length` instead
// of the actual stop values, returning the shared cached array by reference) was tried here first and
// reverted: it was the #686 class of defect (a global cache in a pure engine, unsafe against a caller
// that mutates its result, collision-prone on a partial key). The redundancy is now removed AT ITS
// SOURCE instead: `exports.js`'s `derivedAll(state)` is computed ONCE per `projectView` call and
// threaded down as an optional `derived` argument to every exporter, so the 9 export formats share
// one derivation instead of each re-deriving their own (see model.mjs's `projectView` and
// `exports.js`'s per-exporter `derived` parameter). This function itself is unchanged - no cache, pure
// as before.
export function paletteStops(palette, controls, stops) {
  // Note (#681 U3 review 3, minor item: the unknown-toneMode note; corrected U3 review 4 R6, the first
  // version of this comment had the unset case backwards). UNSET `controls.toneMode` (undefined, "", 0,
  // etc.) goes to "perceptual" via the `|| "perceptual"` default below, not to the even path. An UNKNOWN
  // non-empty string that is not exactly "perceptual" or "peak" (a typo such as "evn", or a stale caller)
  // DOES fall through to the branch below and render on the "even" family path structurally, but it
  // renders DIFFERENTLY from a real "even": `chromaEnvelope` (this file) checks `controls.toneMode ===
  // "even"` literally to decide whether to apply `EVEN_DAMP_FACTOR` (pass 7 step 1's even-only mapping),
  // so an unrecognized string takes the even STRUCTURE without that mapping, a third rendering that is
  // neither perceptual/peak nor true even. This is the same silent-default shape N6 fixed one level up
  // (report-preset-fidelity.mjs's --envelope reading (b) and the env(500) sweep omitted toneMode
  // entirely, so `chromaEnvelope`'s own `=== "even"` check read undefined and silently took the
  // non-even branch): a caller cannot assume "missing or wrong toneMode" degrades the same way at every
  // call site in this file.
  const mode = controls.toneMode || "perceptual";
  if (palette.chroma !== 100) return dampStops(paletteStops({ ...palette, chroma: 100 }, controls, stops), groupDamper(palette.chroma), mode, controls.hueSpace, controls);
  if (mode === "perceptual" || mode === "peak") return okhslStops(palette, controls, stops, mode);
  const anchor = resolveAnchor(palette);
  if (anchor) return paletteStopsAnchored(palette, controls, stops, anchor);
  const shift = palette.hueShift ?? 0; // edge hue rotation: ±deg at the ends
  const sameDir = palette.hueSameDir === true; // true = both ends bend the SAME way (|s|), else opposite (s)
  const ctl = {
    curve: controls.curve,
    lmin: controls.lmin,
    lmax: controls.lmax,
    tension: controls.tension,
  };
  const lift = palette.lift ?? 0;
  // The band rule (ramp@2): the pivot is the palette's own toneAt(500), clamped into the band interior
  // (pivotWindow; an extreme skew or lift can put toneAt(500) past the shared edge); a band stop takes
  // the shared ladder, an interior stop toneAt remapped onto [shared(100), pivot] / [pivot, shared(900)].
  // Match peer lightness (ADR-037): every stop, 500 included, on the shared ladder.
  const match = controls.matchPeerLightness === true;
  const [winLo, winHi] = pivotWindow(controls, BAND_PIVOT_ROOM);
  const pivotTone = match ? sharedToneAt(500, controls) : Math.min(winHi, Math.max(winLo, toneAt(500, palette.skew, lift, ctl)));
  const edgeLightTone = sharedToneAt(BAND_EDGE.light, controls), edgeDarkTone = sharedToneAt(BAND_EDGE.dark, controls);
  const frac = tintFraction(controls);
  const toneOf = (s) => (inBand(s) || match ? sharedToneAt(s, controls)
    : anchorLerp(pivotTone, edgeLightTone, edgeDarkTone, s, palette.skew ?? 0, lift, controls.curve, controls.tension, BAND_EDGE.light, BAND_EDGE.dark));
  // chromaEnvelope per stop, computed ONCE (C7: exactly one call site)  -  the anchor stop is guaranteed
  // present so the stop-500 hue/chroma SEED below and the per-stop map read the SAME value, never a
  // second, independently-typed derivation (the "can't drift" property the old evenChroma comment named).
  const envStops = stops.includes(ANCHOR_STOP) ? stops : [...stops, ANCHOR_STOP];
  const envelopeAt = new Map(envStops.map((stop) => [stop, chromaEnvelope(stop, ANCHOR_STOP, lift, controls)]));
  // Resolve the BASE CAM16 hue once (flat across the ramp when hueShift=0, the hue-stability default).
  // For an OKLCH-hue palette, SOLVE it in the RENDER space at the KEY stop (500)'s ACTUAL chroma + tone so
  // it exports back at the SET OKLCH hue, killing the Abney residual the peak-tone-anchored effHue proxy
  // left (up to ~2° at dampAmp 0, ~9° under amplification, worst in the blues). For a CAM16-hue palette the
  // slider IS a CAM16 hue → pass straight through (effHue's cam16 branch is the identity, preserved here).
  let baseHue;
  if (controls.hueSpace === "oklch") {
    const tone500 = toneOf(500);
    const seedHue = effHue(palette.hue, "oklch", hueAnchorFrac(palette, controls)); // ~baseHue, only for the gamut basis
    const maxc500 = maxChromaInGamut(seedHue, tone500);
    const intended500 = controls.relChroma ? maxc500 : peakC(seedHue).c;
    const c500 = evenChroma(maxc500, intended500, envelopeAt.get(ANCHOR_STOP), controls.chromaFloor);
    baseHue = solveCam16Hue(palette.hue, Math.max(c500, 8), tone500); // floor the solve chroma so the hue stays well-defined for near-greys
  } else {
    baseHue = palette.hue;
  }
  const pk = peakC(baseHue).c; // the BASE hue's max chroma in sRGB
  const target = pk; // control is % of the BASE-hue peak
  // anchorChroma  -  the anchor stop's OWN emitted chroma, by the SAME formula the per-stop map below
  // uses at stop 500 (relChroma-aware, and tone/hue-aware via toneAt/baseHue  -  lift- and skew-displaced,
  // never the hue's independent cusp). #681 U3 pass 3: this is the root-cause fix for the lift-sign x
  // hue-cusp-tone mechanism Q7 measured  -  `target`/`pk` are calibrated against the hue's OWN theoretical
  // peak (peakC), which lift can displace the anchor away from while leaving some OTHER real stop
  // closer to it; that other stop's bigger local gamut ceiling (maxc) let it clamp to MORE absolute
  // chroma than the (now off-cusp) anchor even though chromaEnvelope's own multiplier never exceeds 1
  // for a zero dampAmp. The anchor's emitted value, not the hue's independent peak, is what "0 above
  // 100%" is measured against, so it is what every other stop gets held to below.
  const tone500 = toneOf(500);
  const maxc500 = maxChromaInGamut(baseHue, tone500);
  const intended500 = controls.relChroma ? maxc500 : target;
  const anchorChroma = evenChroma(maxc500, intended500, envelopeAt.get(ANCHOR_STOP), controls.chromaFloor);
  // evenChroma's floorRef (#701 U2, revision 14; per stop since #766): as in paletteStopsAnchored, the
  // pivot's ceiling or its first display step's (450, 550), whichever is larger, read by floorRefAt at
  // baseHue, the hue every stop has before its edge rotation (floorRefAt's comment says why rotation is
  // not followed), so this path renders byte-identically to the old per-ramp reading at every hueShift.
  // The 450/550 tones do not depend on the stop, so they are read once here.
  const tone450 = toneOf(450);
  const tone550 = toneOf(550);
  const dampAmp = controls.dampAmp ?? 0;
  const built = stops.map((stop) => {
    const tone = toneOf(stop);
    const w = bandWeight(stop, lift); // the band rule's chroma blend weight (ramp@2)
    const s = (stop - 500) / 450; // signed position: <0 light · 0 mid · >0 dark
    // Edge hue rotation, pivoting on stop 500 (s=0). OPPOSITE mode (default) torsions the
    // ends apart, hueShift·s → light end −shift, dark end +shift. SAME-direction mode
    // (hueSameDir) bends BOTH ends the same way, matching the LIGHT end: hueShift·(−|s|),
    // so e.g. a light+20/dark−20 opposite becomes light+20/dark+20. hueShift=0 → flat.
    const dir = sameDir ? -Math.abs(s) : s;
    const hue = (((baseHue + shift * dir) % 360) + 360) % 360;
    const maxc = maxChromaInGamut(hue, tone); // gamut ceiling at the (rotated) hue
    // Chroma basis (controls.relChroma): default scales the base-hue PEAK target by chromaEnvelope's
    // multiplier and caps at the per-stop ceiling  -  the chroma is a constant target shaped by the
    // envelope, then clamped. Relative mode scales EACH stop by its OWN gamut ceiling, so every hue
    // fills the same fraction of its gamut envelope and palettes read as equally saturated regardless
    // of hue. min(·, maxc) keeps it in-gamut either way.
    const intended = controls.relChroma ? maxc : target; // un-damped chroma for this stop
    // evenChroma: scale intended by chromaEnvelope's multiplier (exactly 1 at ANCHOR_STOP, by
    // construction  -  the edge damping starves the light/dark ends, never the anchor), then apply the
    // chroma FLOOR on the envelope itself  -  for a LOW-chroma palette the light stops collapse to near-
    // white (the "dead zone"); the floor lifts each stop's envelope back toward 1, up to chromaFloor%,
    // NEVER past the anchor's own envelope of 1 (a muted palette stays muted, a neutral stays neutral,
    // saturated stops already clamp at/near maxc so the floor never binds). Shared with the stop-500 hue
    // anchor so they can't drift.
    const fr = floorRefAt(baseHue, maxc, tone500, tone450, tone550);
    let chroma = evenChroma(maxc, intended, envelopeAt.get(stop), controls.chromaFloor, fr);
    // Generated palettes (dampAmp 0) never emit more chroma than the anchor itself (#681 U3 pass 3, the
    // C6 "0 above 100%" clause). At stop === ANCHOR_STOP this is an exact no-op (same formula, same
    // inputs, chroma === anchorChroma already). Authored dampAmp>0 overrides (Adia, C6's named carve-out)
    // skip this cap; chromaEnvelope's own liftStop-keyed position math above is untouched.
    if (dampAmp === 0) chroma = Math.min(chroma, anchorChroma);
    // The band rule (ramp@2): blend the palette's own value toward the tint, chromaFloor% of this
    // stop's ceiling, by `w` (0 at 500, 1 at the band edge and inside the band).
    const tint = frac * maxc;
    chroma = chroma + (tint - chroma) * w;
    // Emit via the engine at the per-stop (hue, chroma, tone): in-gamut, hits the
    // tone, holds the SPECIFIED hue (constant when hueShift=0, else edge-rotated).
    const out = hctToRgb(hue, chroma, tone);
    const hex =
      "#" +
      out.rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    const rec = { stop, tone, chroma, hue, maxc, rgb: out.rgb, hex, inGamut: out.inGamut, env: envelopeAt.get(stop), model: chroma, basis: intended, floor: evenFloor(maxc, intended, controls.chromaFloor, fr, maxc), tint, tintFrac: frac };
    if (dampAmp === 0) rec.anchorCap = anchorChroma;
    return rec;
  });
  return finishRamp(built, controls, mode);
}

// ── OKHSL distribution path (toneMode "perceptual" | "peak") ──────────────────────────────────────
// Steps lightness evenly in OKHSL's perceptually-uniform l, or, for "peak", with the hue's CUSP
// anchored at stop 500 and each half spread from there, with chroma as a gamut-proportional OKHSL
// saturation. Every emitted color is in gamut by OKHSL's construction. l is keyed off the STOP NUMBER
// (not the array index) so a stop has the same color in the 19-stop display ramp and the 25-stop export ramp.
// okhslLAt is pure, with no cache (#738): a neutral-grey lookup measured at 0.40-0.90 us per call
// on a quiet host (median 1.54, 1.46-1.88, at load 67), two or three calls per palette render, too
// cheap to be worth one.
export function okhslLAt(lstar) {
  return rgbToOkhsl(hctToRgb(0, 0, lstar).rgb).l;
}

// okhslLAtChromatic(targetLstar, hue, s) -> the OKHSL l whose (hue, s, l) renders at measured CIE L*
// `targetLstar`, for a GIVEN (possibly non-zero) saturation - re-diagnosis Finding 7 (review F9): the
// anchored OKHSL branch's window-clamp pivot used `okhslLAt`'s own achromatic (s=0) lookup even though
// the clamped stop renders at the anchor's REAL saturation (chromaEnvelope's own env=1 there), and
// OKHSL l is only a proxy for CIE L* at s=0 - the SAME lightness-vs-saturation coupling #668 names
// elsewhere, which put 9 of the 10 named window-clamp sources 0.18-2.26 L* short of the window bound
// instead of landing exactly on it. Bisection (not a Newton step guessing a slope): for a fixed
// hue/s, measured CIE L* is monotone non-decreasing in OKHSL l (a brighter HSL-style lightness
// parameter never measures darker at fixed hue/saturation), so 24 steps converge to within 2^-24 of
// the true root - negligible cost, called only for the handful of window-clamped sources.
function okhslLAtChromatic(targetLstar, hue, s) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const got = lstarFromRgb(okhslToRgb(hue, s, mid));
    if (got < targetLstar) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// effStop, the OKHSL path's EFFECTIVE stop (#647): the stop whose position the LIGHTNESS is read at
// once the palette's own `skew` and `lift` have warped it. Both controls were persisted, threaded and
// sliders-exposed, but only the "even" path (toneAt) ever read them, so in the shipped DEFAULT tone mode
// dragging Skew moved the 7-swatch prime ladder (prime.mjs DOES read skew) while the 19-stop gradient
// under it sat still. Warping the stop rather than the lightness reuses toneAt's exact two transfer
// functions in the same order, liftStop's cosine displacement first (#648's shared helper, never a
// second bump), then skew's gamma on the normalized position, so the two paths agree on what the
// controls MEAN, and the OKHSL curve itself is untouched.
//
// Monotone by composition: liftStop is strictly increasing (|A|·π/900 < 1 by #648's bound), p^g preserves
// order for any g>0, and both lightness formulas below are non-increasing in the effective stop. The
// endpoints are fixed exactly, liftStop is the identity at 050/950 and the gamma fixes p=0 and p=1.
// Pure in the single stop value (no neighbour lookup, no whole-ramp state), so the 19-stop display ramp
// and the 25-stop export ramp still agree at every shared stop. Same caveat as `liftStop`'s own header
// comment: this is about the TONE/CHROMA CONSTRUCTION, not the final rendered output -
// `enforceMonotonePixelL`'s post-pass is neighbour-dependent on whatever array it is given, so it can
// still refine a shared stop differently between a 19-stop and a 25-stop call (its own header comment).
function effStop(stop, palette) {
  const sLift = liftStop(stop, palette.lift ?? 0);
  const p = Math.min(1, Math.max(0, (sLift - 50) / 900)) ** (3 ** ((palette.skew ?? 0) / 100)); // skew>0 -> gamma>1 -> lighter mids
  return 50 + 900 * p;
}

// solveLForTone  -  the OKHSL lightness l in [0,1] that renders CIE L* == targetTone at a FIXED hue/s
// (#681 U3 pass 4/5). L* is monotone non-decreasing in l at fixed hue/s (OKHSL's own construction),
// so bisection converges reliably; 30 halvings of [0,1] resolve to ~1e-9, well inside the 0.01 L* bar.
function solveLForTone(hue, s, targetTone) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2;
    if (lstarFromRgb(okhslToRgb(hue, s, mid)) < targetTone) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// holdTone(hue, sBasis, l, env) - the per-stop tone hold on both OKHSL paths (#725 U3, R69). The
// envelope lowers OKHSL `s` at a FIXED `l`, but OKHSL `l` is a proxy for CIE L* only at s = 0: the
// OKHSL l to CIE L* chroma coupling (#668; not Helmholtz-Kohlrausch, which is perceived brightness
// and cannot move a computed CIE L*) moves the emitted L* with `s`, by an amount that varies stop to
// stop with the damping slope, so neighbouring stops damped differently can measure an L* rise (the
// coupling that sank #681 U3's two plain retunes). The hold re-solves `l` so the damped colour
// measures the L* the undamped one (sBasis at the same hue/l) measures: the envelope moves chroma
// only. Read on the CONTINUOUS colour (`okhslToRgbFloat`), before any cap, rounding or monotone pass,
// by 30 halvings of [0, 1] (L* is monotone non-decreasing in `l` at fixed hue/s, solveLForTone above).
// At env >= 1 there is nothing to hold and `l` is returned as is.
// `target` (ramp@2, T-0040, optional fifth argument): an explicit CIE L* to hold instead of the
// undamped colour's own; given, `l` is always re-solved for it (the band rule's blend re-holds the
// blended `s` at the stop's own target). The four-argument form is unchanged.
export function holdTone(hue, sBasis, l, env, target) {
  const s = Math.min(1, Math.max(0, sBasis * env));
  const explicit = target !== undefined && target !== null;
  const tgt = explicit ? target : lstarFromRgb(okhslToRgbFloat(hue, Math.min(1, Math.max(0, sBasis)), l));
  if (!explicit && !(env < 1)) return { s, l, target: tgt, held: lstarFromRgb(okhslToRgbFloat(hue, s, l)) };
  const lHeld = solveLForTone(hue, s, tgt);
  return { s, l: lHeld, target: tgt, held: lstarFromRgb(okhslToRgbFloat(hue, s, lHeld)) };
}
// tintS(hue, hold, frac): the band tint in the OKHSL path's unit at an interior stop: the s at which
// (hue, s, l) renders `frac` of the gamut ceiling at the render's own CAM16 hue and the stop's target
// L*, read at the held l (the blend's re-hold moves l a little; the snap is the band's own arbiter).
function tintS(hue, hold, frac) {
  return frac > 0 ? solveSForFraction(hue, hold.l, hold.target, frac) : 0;
}
// blendTint(hue, s, hold, frac, w, tintHue): the OKHSL interior stop's blend toward the tint: s moves from
// the stop's own value (`s`, the held and, on peak, capped value) toward tintS by `w`, then l is re-solved
// for the stop's own target L* (holdTone's fifth argument), so the blend moves chroma only. `tintHue`
// (default `hue`) is the hue the tint's s is solved at (the anchored path passes its OKLCH seed hue in
// both hue spaces). Returns { s, l, held, tint }.
function blendTint(hue, s, hold, frac, w, tintHue = hue) {
  const tint = tintS(tintHue, hold, frac);
  if (!(w > 0)) return { s, l: hold.l, held: hold.held, tint };
  const s2 = s + (tint - s) * w;
  const re = holdTone(hue, s2, hold.l, 1, hold.target);
  return { s: re.s, l: re.l, held: re.held, tint };
}
// refineNearestRgb  -  a final 8-bit-quantization-aware polish (#681 U3 pass 4/5). Measuring chroma/tone
// back from ROUNDED 8-bit RGB introduces noise the continuous joint solve above can't predict (up to
// ~0.15 L*, ~0.1-0.2 chroma). Sweeps a few nearby continuous tone offsets through the validated HCT
// engine (exploring different rounding cells) plus a +-2-per-channel integer RGB neighbor search, both
// bounded by the TRUE chromaCeiling (never the margin-reduced target), picking whichever candidate
// minimizes |measuredTone - targetTone|.
// chromaFloor (#681 U3 review 2, F1): the OLD version optimized ONLY for tone error, with no lower
// bound on chroma at all  -  a dTone candidate that happened to round to a slightly better tone match
// could win even if it collapsed chroma several points below what the joint solve had already
// converged to, silently undoing the solve's own accuracy and creating the chroma dips F1 found (14
// remained after fixing the solve's own overshoot bug, ALL of them traced to this: the solve landed
// within ~0.1 of the target, then this polish walked it away in the name of a sub-0.05-L* tone gain).
// Rejecting any candidate below `chromaFloor` keeps the polish to what it was named for  -  quantization
// noise (~0.1-0.2 C)  -  not a second, uncontrolled chroma search.
//
// A hue-aware variant was tried and reverted (#681 U3 review 2, F1): rejecting +-2-neighbour candidates
// more than a few degrees off the stop's pre-cap OKLCH hue improved the worst-case hue residual (max
// 24.6 degrees down to 4.0 at a 4-degree tolerance) but did so by blocking tone-favourable candidates,
// and that tone-accuracy loss pushed 3 cells of the skew-lift-okhsl synthetic grid (C6 iii c) into a
// genuine CIELAB-L* uptick beyond its named exceptions  -  confirmed at BOTH a 2-degree and a 4-degree
// tolerance, and confirmed to clear with the hue constraint removed entirely, isolating it as the
// cause (chromaFloor alone is not: it passes on its own). The reviewer rated the hue-blindness here
// 🟡, "acceptable... once the hue residual is reported", not a blocker  -  so per "if a second
// workaround is needed, stop", this stays hue-blind and the residual is reported honestly instead
// (.sdlc/handoffs/pif-u3-retune.md): still bounded (median ~1 degree, worst case, per the measured
// table, larger than before this pass at the tail  -  see the addendum for the full numbers).
//
// An input already ABOVE chromaCeiling is never the incumbent (#725 U2): the `hctToRgb` fallback
// renders at the margin-reduced target, but 8-bit rounding at a dark tone can add more than the 0.5 C
// margin (measured: Vaporwave secondary, anchored peak, stop 650, 28.63 requested, 29.17 rendered
// against a 29.13 ceiling). Seeded as best, that pixel won on tone error against every in-ceiling
// candidate and shipped above stop 500. With `strictSeed` it keeps its place only if no in-ceiling
// candidate exists. Only the anchored path passes it: `okhslStops` keeps its shipped pixels byte-identical.
function refineNearestRgb(rgb, hueCam16, targetTone, chromaCeiling, chromaFloor = 0, strictSeed = false) {
  let best = rgb;
  let bestErr = strictSeed && cam16FromRgb(rgb).chroma > chromaCeiling + 1e-6 ? Infinity : Math.abs(lstarFromRgb(rgb) - targetTone);
  const consider = (cand) => {
    if (cand.some((v) => v < 0 || v > 255)) return;
    const c = cam16FromRgb(cand).chroma;
    if (c > chromaCeiling + 1e-6) return;
    if (c < chromaFloor - 1e-6) return;
    const err = Math.abs(lstarFromRgb(cand) - targetTone);
    if (err < bestErr) { bestErr = err; best = cand; }
  };
  for (const dTone of [-0.4, -0.3, -0.2, -0.1, -0.05, 0.05, 0.1, 0.2, 0.3, 0.4]) {
    const reqChroma = Math.min(cam16FromRgb(rgb).chroma, chromaCeiling);
    if (reqChroma <= 1e-9) continue;
    consider(hctToRgb(hueCam16, reqChroma, targetTone + dTone).rgb);
  }
  for (let dr = -2; dr <= 2; dr++) for (let dg = -2; dg <= 2; dg++) for (let db = -2; db <= 2; db++) {
    if (dr === 0 && dg === 0 && db === 0) continue;
    consider([best[0] + dr, best[1] + dg, best[2] + db]);
  }
  return best;
}

// capChromaAtHeldTone - the peak joint (s, l) cap, one construction for BOTH OKHSL paths (#725 U2: the
// anchored path had none, so anchored peak ramps climbed past their own stop 500; `okhslStops` carried it
// inline). Given a stop's pre-cap OKHSL (hue, s, l), its rendered rgb and measured CAM16 chroma, and the
// ramp's chroma `ceiling` (stop 500's own emitted chroma), returns { s, l, rgb, chroma } with chroma at
// or under the ceiling and CIE L* held at the pre-cap value. `hueCam16` is the CAM16 hue the fallback and
// polish render at; null solves it from the stop's own pre-cap OKLCH hue (the OKLCH-hue palette and the
// anchored path, whose OKHSL hue is not a CAM16 hue). The caller decides WHEN it fires (peak, dampAmp 0,
// chroma above the ceiling); this helper only caps. It reads no envelope: the envelope is already in `s`.
// `strictSeed` is passed through to `refineNearestRgb` (true on the anchored path only).
// `capped` (#725 U3) is true when the returned pixel differs from the one passed in: the cap's own
// record of the stops it moved, carried onto the row so a reader (anchor.mjs f4) needs no second,
// uncapped render to find them.
//
// Generated PEAK palettes (dampAmp 0) never emit more chroma than the anchor (#681 U3 pass 5, C6's
// "0 above 100%" clause, peak only  -  perceptual keeps #55's cusp-pull richness, see below). Holds
// tone FIXED at its pre-cap value by solving JOINTLY for (s, l): shrink s toward the target chroma,
// then re-solve l for the held tone, iterating until both hold. Hue stays the caller's OKHSL hue
// throughout (no engine switch, no new Abney residual).
function capChromaAtHeldTone(hue, s, l, rgb, chroma, ceiling, hueCam16, strictSeed = false) {
  const rgbIn = rgb; // the pre-cap pixel: `capped` below reports whether this call changed it
  const targetTone = lstarFromRgb(rgb); // the pre-cap (natural) tone  -  held fixed below
  // preCapOklchHue: THIS stop's own OKLCH hue before capping  -  the invariant the fallback/polish
  // below must reproduce (#681 U3 review 2, F1). `hue` is the caller's resolved OKHSL hue (Abney-
  // corrected for an OKLCH-hue palette via solveOkhslHue), so reading it
  // back here  -  rather than re-deriving from `palette.hue`  -  is correct even under a non-zero
  // hueShift, where a non-center stop's hue differs from the nominal set hue by the rotation.
  const preCapOklchHue = rgbToOklchHue(rgb);
  // chroma here is measured back from 8-bit-quantized OKHSL-rendered rgb, same as the ceiling  - 
  // independently-quantized measurements can differ by a few hundredths after the solve below lands
  // exactly at the target, so this margin keeps the final measured value strictly under the ceiling.
  const CAP_MARGIN = 0.5;
  const target = ceiling - CAP_MARGIN;
  // Bisect s toward the EXACT target chroma, re-solving l for the held tone at every step (#681 U3
  // review 2, F1). The old single multiplicative step (`s *= target/chroma`) assumed chroma scales
  // linearly with s at fixed l  -  but l is ALSO re-solved each time to hold tone, so that assumption
  // is false, and one overshooting step could satisfy the loop's own naive "chroma <= ceiling" exit
  // test while landing far below the target (measured witness: nature "Monument Valley" secondary-
  // muted, peak, stop 550  -  one iteration took chroma from 81.89 to 29.75 against a 57.04 target,
  // and the loop stopped there because 29.75 already cleared the ceiling). Bisection always halves
  // its bracket regardless of overshoot direction, and this loop tracks the BEST candidate seen
  // across every step, so a later worse step can never lose a better earlier one.
  let sLo = 0, sHi = s;
  let bestS = s, bestL = l, bestRgb = rgb, bestChroma = chroma, bestErr = Math.abs(chroma - target);
  for (let i = 0; i < 24; i++) {
    const sMid = (sLo + sHi) / 2;
    const lMid = solveLForTone(hue, sMid, targetTone);
    const rgbMid = okhslToRgb(hue, sMid, lMid);
    const chromaMid = cam16FromRgb(rgbMid).chroma;
    const err = Math.abs(chromaMid - target);
    if (err < bestErr) { bestErr = err; bestS = sMid; bestL = lMid; bestRgb = rgbMid; bestChroma = chromaMid; }
    if (chromaMid > target) sHi = sMid; else sLo = sMid; // chroma rises with s at a tone-held l
  }
  s = bestS; l = bestL; rgb = bestRgb; chroma = bestChroma;
  // polishHue: the CAM16 hue that reproduces THIS stop's preCapOklchHue at whatever chroma/tone is
  // about to be rendered through hctToRgb below (fallback and/or the 8-bit polish)  -  solved fresh
  // rather than reusing the plain CAM16 proxy (`hueCam16`), which is what brought back the Abney
  // drift `solveOkhslHue` exists to remove on an OKLCH-hue palette (F1). A CAM16-hue palette has no
  // OKLCH-hue promise to keep, so `hueCam16` is already correct there  -  no solve needed.
  const polishHue = hueCam16 === null ? solveCam16Hue(preCapOklchHue, Math.max(chroma, 1), targetTone) : hueCam16;
  if (chroma > ceiling + 1e-6 || Math.abs(lstarFromRgb(rgb) - targetTone) > 0.01) {
    // Fallback (#681 U3 review 3, N3: corrected from an earlier "rare" claim): this fires on 93.5%
    // of capped stops measured, not rarely. The bisection's own 24 steps DO converge on chroma
    // reliably (review 4 R5: this is a property measured directly on the bisection's own output, NOT
    // what the ramp-shape dip gate below checks, which is unrelated), but 0.01 L* is tighter than an
    // 8-bit RGB round-trip can usually reach at a fixed hue/chroma, so the tone-tolerance half of
    // this condition is the one that almost always trips, sending nearly every capped stop through
    // `hctToRgb` here rather than keeping the bisection's own continuous render. Caps via the
    // validated HCT engine directly AT the target chroma (never the solve's own possibly-off value:
    // the old `Math.min(chroma, target)`
    // here is what let an overshot loop result lock in below target instead of correcting to it, F1)
    // and the held tone, at polishHue.
    const capped = hctToRgb(polishHue, target, targetTone);
    rgb = capped.rgb;
    chroma = cam16FromRgb(rgb).chroma;
  }
  // Polish against the 8-bit quantization floor, at polishHue: never past the TRUE ceiling (not
  // the margin-reduced target), minimizing the residual tone error the rounding introduces. Floored
  // 1 C below whatever the solve/fallback already achieved, so the polish can only fix quantization
  // noise, not walk chroma away from a value the solve already spent 24 bisection steps converging.
  rgb = refineNearestRgb(rgb, polishHue, targetTone, ceiling, Math.max(0, chroma - 1), strictSeed);
  chroma = cam16FromRgb(rgb).chroma;
  return { s, l, rgb, chroma, capped: rgb.some((v, i) => v !== rgbIn[i]) };
}

// solveOkhslHueForCam16(targetCam16Hue, seedOkhslHue, renderAt) - the OKHSL hue whose render carries
// `targetCam16Hue` (T-0015, hueSpace "cam16" on the anchored perceptual/peak path). `renderAt(h)` returns
// the FLOAT render at candidate hue h (the caller closes over its tone hold, so the solve is joint with
// it), never the 8-bit `okhslToRgb`, whose staircase returns arbitrary hues at pale stops (#725 revision
// 8). A candidate under CAM16 C 5 is achromatic: its CAM16 hue is noise and carries no signal. Fast path
// first (the fixed-point step `solveCam16Hue` also tries), then a bracketed scan over seed +/- 60 at 5
// degrees, bisecting the sign change nearest the seed. No bracket, or an achromatic midpoint, returns the
// seed (the anchor's OKLCH hue): on an ill-conditioned pale stop a least-error candidate invents a tint.
function solveOkhslHueForCam16(targetCam16Hue, seedOkhslHue, renderAt) {
  const C_ACHROMATIC = 5, SCAN_RANGE = 60, SCAN_STEP = 5, BISECT_TOL = 1e-4, BISECT_STEPS = 40;
  const wrap = (h) => ((h % 360) + 360) % 360;
  // err in (-180, 180], or null for an achromatic candidate.
  const errAt = (h) => {
    const cam = cam16FromRgb(renderAt(h));
    if (cam.chroma < C_ACHROMATIC) return null;
    return 180 - wrap(180 - (cam.hue - targetCam16Hue));
  };
  {
    let h = seedOkhslHue;
    for (let i = 0; i < 16; i++) {
      const err = errAt(h);
      if (err === null) break; // achromatic: the scan's guard applies
      if (Math.abs(err) < 1e-3) return h;
      h = wrap(h - err);
    }
  }
  let bracket = null; // the sign change whose midpoint is nearest the seed
  let prevOffset = null, prevErr = null;
  for (let offset = -SCAN_RANGE; offset <= SCAN_RANGE; offset += SCAN_STEP) {
    const err = errAt(wrap(seedOkhslHue + offset));
    // Adjacent non-achromatic samples only; |err difference| < 90 excludes the +/-180 wrap.
    if (err !== null && prevErr !== null && ((prevErr > 0 && err < 0) || (prevErr < 0 && err > 0)) && Math.abs(err - prevErr) < 90) {
      const mid = Math.abs((prevOffset + offset) / 2);
      if (!bracket || mid < bracket.mid) bracket = { loOffset: prevOffset, loErr: prevErr, hiOffset: offset, mid };
    }
    prevOffset = offset; prevErr = err;
  }
  if (!bracket) return seedOkhslHue;
  let { loOffset, loErr, hiOffset } = bracket;
  for (let i = 0; i < BISECT_STEPS && hiOffset - loOffset > BISECT_TOL; i++) {
    const midOffset = (loOffset + hiOffset) / 2;
    const midErr = errAt(wrap(seedOkhslHue + midOffset));
    if (midErr === null) return seedOkhslHue;
    if ((loErr > 0) === (midErr > 0)) { loOffset = midOffset; loErr = midErr; } else hiOffset = midOffset;
  }
  return wrap(seedOkhslHue + (loOffset + hiOffset) / 2);
}

// okhslStopsAnchored - the perceptual/peak path's anchored branch: a piecewise OKHSL-`l` ladder
// pivoting on (500, the anchor's own OKHSL lightness), replacing `lightnessAt`'s even/cusp blend with
// a pivot-preserving analog (F4, re-diagnosis Finding 2, owner-ruled 2026-09-18: the controls stay
// live - both perceptual and peak still hit stop 500 exactly, C3's own claim, but `mode`/vibrancy now
// DO move the rest of the ramp, and Curve/Tension/hueSpace are no longer dead for an anchored palette).
// `l` blends TWO curve/tension-composed anchorLerp constructions (see anchorLerp's own comment) the
// SAME way the non-anchored `okhslStops` blends its own evenL/peakL by `vibrancy`: `evenL` is the
// STRAIGHT pivot-to-edge lerp (curve "linear" reduces anchorLerp's shape(w,...) to w exactly - the
// ORIGINAL, pre-F4 construction), `peakL` is the curve/tension-shaped one, and `t = mode==="peak" ? 1
// : vibrancy/100` blends them - "peak" pins full curve/tension shaping, "perceptual" moves continuously
// with Vibrancy, and at vibrancy 0 (DEFAULT_CONTROLS until T-0014's 50) perceptual mode reduces to `evenL` exactly, so
// existing perceptual-mode renders at default vibrancy are UNCHANGED by this fix. Hue (T-0015, ADR-031):
// hueSpace names the space the anchor's own measured hue is held constant in, the anchor pixel verbatim
// at stop 500 in both. "oklch" holds the anchor's OKLCH hue, `targetOklchHue` (equal to
// `anchor.okhsl.h`): OKHSL hue IS OKLab hue by construction, so no per-stop solve is needed, and #725 U3
// revision 8 removed the one that was there, which was the identity in the continuous domain and read
// only the 8-bit staircase (106° against the anchor's 68.7° at default Warning perceptual 150). "cam16"
// holds the anchor's CAM16 hue: each stop solves the OKHSL hue whose float render, jointly with the tone
// hold, carries it (`solveOkhslHueForCam16`), keeping the anchor's OKLCH hue where no root exists or the
// candidate is achromatic. The two lines meet at the anchor and part by at most about 0.02 OKLab dE
// elsewhere: the toggle moves an anchored perceptual or peak ramp within rounding, the even ramp and
// the prime ladder visibly (anchor.mjs anchor-f4 hueSpace-<mode>).
function okhslStopsAnchored(palette, controls, stops, anchor, mode) {
  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;
  // An achromatic anchor's own OKHSL hue reading is rounding residue (#739): OKHSL hue IS OKLab hue,
  // so the palette's own stored hue (already OKLCH-native) is used directly, with no solve and no
  // effHue conversion needed - both the OKLCH hue the "oklch" branch emits and the pivot-clamp/
  // cam16-mode hue basis below. A chromatic anchor is untouched: both lines read exactly as before.
  const targetOklchHue = anchor.achromatic ? palette.hue : rgbToOklchHue(anchor.rgb);
  const oklchSpace = controls.hueSpace === "oklch";
  const hOkSeed = anchor.achromatic ? palette.hue : anchor.okhsl.h; // "cam16" mode's fixed hue; also the pivot-clamp hue basis below
  // Q3 (b): clamp the ladder's OWN pivot into the ramp's window (RAMP_L_MIN/MAX, in CIE L*),
  // expressed in OKHSL l via the same neutral-grey lookup okhslLAt uses elsewhere. A source outside
  // the window still reports its byte-exact anchor everywhere else (prime.DEFAULT, C2) - "the token
  // stays exact" - but the ramp itself "clamps": stop 500 is built from the SAME continuous
  // piecewise construction as every other stop (anchorLerp's w=0 point gives the pivot value at
  // stop 500 with no special case needed), rather than forcing the verbatim anchor pixel there,
  // which would jump away from the window edge its neighbours are shaped around - the exact
  // discontinuity that broke monotonicity before this branch existed. Only sources strictly inside
  // the window get the verbatim, byte-exact stop-500 special case below.
  //
  // The ladder is built directly in OKHSL l (not converted through CIE L* and back): l feeds
  // okhslToRgb ALONGSIDE a non-zero saturation, and OKHSL l is only a proxy for CIE L* at s=0 - a
  // ladder that targets L* directly and converts to l via a s=0 lookup drifts by the SAME chroma-vs-
  // lightness coupling #668 already names (measured worse: more, not fewer, sub-0.55-L*-gap misses),
  // so interpolating in l - where the saturation the ramp actually renders at is a constant multiplier
  // and does not re-enter the lightness computation - is the more faithful ladder.
  // ramp@2: the window is the band interior (pivotWindow), RAMP_L_MIN/MAX narrowed by BAND_PIVOT_GAP.
  // Match peer lightness (ADR-037): stop 500 sits on the shared ladder like every other stop, so it is a
  // construction at the anchor's hue and chroma basis, as a clamped pivot is.
  const match = controls.matchPeerLightness === true;
  const [winLo, winHi] = pivotWindow(controls);
  const clamped = match || anchor.lstar < winLo || anchor.lstar > winHi;
  const pivotTone = match ? sharedToneAt(500, controls) : Math.min(winHi, Math.max(winLo, anchor.lstar));
  // Clamp pivot (Finding 7 fix): solved at the anchor's OWN saturation via `okhslLAtChromatic`, never
  // the achromatic `okhslLAt` - the clamped stop renders at `anchor.okhsl.s` (chromaEnvelope's env=1
  // at the pivot, unconditionally, clamped or not), so the achromatic lookup was solving for the
  // WRONG color and landing short of the window bound. See okhslLAtChromatic's own comment.
  const pivotL = clamped ? okhslLAtChromatic(pivotTone, hOkSeed, anchor.okhsl.s) : anchor.okhsl.l;
  // The band rule (ramp@2): the ladder's knots are the pivot and the two band edges. An edge knot is
  // the l at which the anchor's own saturation renders the shared edge L* (solveLForTone at the basis
  // s), so the interior's held L* (holdTone: the undamped colour's own) meets the band ladder exactly
  // at stops 100 and 900; okhslLAt(lmax) / okhslLAt(lmin) (050/950) are now the band's, not the ladder's.
  const edgeTone = { light: sharedToneAt(BAND_EDGE.light, controls), dark: sharedToneAt(BAND_EDGE.dark, controls) };
  const frac = anchorTintFraction(controls, anchor);
  const sBasis = Math.min(1, Math.max(0, anchor.okhsl.s));
  const knotsAt = (h) => [solveLForTone(h, sBasis, edgeTone.light), solveLForTone(h, sBasis, edgeTone.dark)];
  const knotCache = new Map();
  const knotsFor = (h) => { let k = knotCache.get(h); if (!k) { k = knotsAt(h); knotCache.set(h, k); } return k; };
  // preCap(stop) - the stop's OKHSL (hue, s, l) and render before the peak joint cap. Factored so the
  // cap's ceiling below (stop 500's own emitted chroma) reads the SAME construction a clamped pivot
  // renders at stop 500; an unclamped pivot's stop 500 is the verbatim anchor, so its ceiling is the
  // anchor's own CAM16 chroma. A band stop (ramp@2) is built by bandStopOkhsl at the shared tone and
  // the tint, in its own hue solve; an interior stop blends toward the tint (blendTint).
  const preCap = (stop) => {
    const v = palette.cuspPull ?? controls.vibrancy ?? DEFAULT_CONTROLS.vibrancy;
    const t = mode === "peak" ? 1 : Math.max(0, Math.min(1, v / 100));
    const sp = (stop - 500) / 450;
    const dir = sameDir ? -Math.abs(sp) : sp;
    const band = inBand(stop);
    const w = bandWeight(stop, palette.lift ?? 0);
    // Saturation basis (re-diagnosis Finding 1, Q-U2-5 ruled, then #725 R69): routed through the shared
    // `chromaEnvelope`, keyed on `liftStop` (dropping `anchorLiftPos`'s own separate lift-position/
    // damping math entirely - the envelope's own `sd = (liftStop(stop,lift) - liftStop(anchorStop,
    // lift))/450` already IS that computation, parametrized so env(500)=1 exactly for any lift). The
    // BASIS multiplied by that envelope is the anchor's own OKHSL `s` at every stop (R69: no climb
    // toward the group, see `anchorChromaBasis`'s header comment; the group damps after, in `dampStops`).
    // No notch by construction: env(500)=1, so `s` reads `anchor.okhsl.s` exactly at the pivot. Unlike
    // the CIE-L* path, `s` never reads the resolved hue; the damped `s` itself is holdTone's (below).
    const env = chromaEnvelope(stop, 500, palette.lift ?? 0, controls);
    const intendedS = anchor.okhsl.s;
    // Hue (T-0015): `seedH` is the anchor's own OKLCH hue plus the edge rotation (OKHSL hue IS OKLab
    // hue, so no per-stop solve: #725 revision 8, see this function's header comment; hOkSeed is the
    // same number). "oklch" emits it. "cam16" solves, per stop and jointly with the tone hold on the
    // float render, the OKHSL hue whose render carries the anchor's CAM16 hue plus the rotation (the
    // rotation applied in CAM16, as the even and ladder cam16 branches do), seeded at and falling back
    // to `seedH`. An achromatic anchor (#739) has no CAM16 hue to hold and emits `seedH` in both.
    const hOkStop = oklchSpace ? targetOklchHue : hOkSeed;
    const seedH = (((hOkStop + shift * dir) % 360) + 360) % 360;
    const camTarget = (((anchor.cam.hue + shift * dir) % 360) + 360) % 360;
    if (band) {
      // The band's faint tint carries the anchor's OKLCH hue (plus the rotation) in BOTH hue spaces, so
      // the hue-space toggle moves no band pixel (anchor.mjs anchor-f4 bounds the two spaces at 0.02 OKLab
      // dE). Measured against the alternative, a band held on the CAM16 line in "cam16": the tint's gamut
      // fraction is read at the render's own hue, and near white a yellow's ceiling turns steeply with hue,
      // so the two spaces parted by 0.043 at the default kit's Data 5 stop 075. The snap's hue term keeps
      // the seed's tint within anchor.mjs hue-constancy's bound in "cam16" (0 misses on the default kit).
      const tone = sharedToneAt(stop, controls);
      const hue = seedH;
      const b = bandStopOkhsl(hue, tone, frac);
      const rgb = b.rgb.map(Math.round);
      // the snap's reference hue: the hue the document's space holds, the anchor's CAM16 hue (plus the
      // rotation) in "cam16", the seed render's own CAM16 hue in "oklch"; null while the render is grey
      const bandHue = b.camHue === null ? null : !oklchSpace && !anchor.achromatic ? camTarget : b.camHue;
      return { hue, s: b.s, l: b.l, rgb, chroma: cam16FromRgb(rgb).chroma, toneTarget: tone, toneHeld: lstarFromRgb(b.rgb), env, tint: b.s, band, bandHue };
    }
    // Match peer lightness (ADR-037): l renders the shared L* at the anchor's saturation (no ladder, no
    // vibrancy blend); otherwise the two curve shapes about the pivot, blended by `t`.
    let l;
    if (match) l = stop === 500 ? pivotL : solveLForTone(seedH, sBasis, sharedToneAt(stop, controls));
    else {
      const [kLight, kDark] = knotsFor(seedH);
      const evenL = anchorLerp(pivotL, kLight, kDark, stop, palette.skew ?? 0, palette.lift ?? 0, "linear", 0, BAND_EDGE.light, BAND_EDGE.dark);
      const peakL = anchorLerp(pivotL, kLight, kDark, stop, palette.skew ?? 0, palette.lift ?? 0, controls.curve, controls.tension, BAND_EDGE.light, BAND_EDGE.dark);
      l = lerp(evenL, peakL, t);
    }
    // "cam16" (ramp@2) solves the hue at the chroma the stop renders: the held, blended (s, l) read at
    // `seedH` (the blend toward the tint by the band weight `w`, the tint's s solved at `seedH` as the
    // band's is), so a stop near the band, mostly tint, holds the anchor's CAM16 hue at its own low
    // chroma. Solved at the pre-blend (anchor's) chroma instead, the hue drifted once the blend cut the
    // chroma (Abney) and the two hue spaces parted by 0.033 OKLab dE at the default kit's Data 5 stop 125
    // (0.0163 at worst this way, SAMPLED corpus and default kit). The tint target is the same `seedH`
    // tint in both spaces (`tintHue`), as the band's is: near white the gamut ceiling turns steeply with
    // hue, so a tint solved at the resolved hue parted the spaces by 0.061.
    // with Match peer lightness, both holds read the shared L* as an explicit target, so the solved hue
    // ("cam16") cannot carry the stop off the ladder (an implicit target, read at the moved hue, left the
    // default kit's Primary stop 800 1.6 L* off it)
    const tgt = match ? sharedToneAt(stop, controls) : undefined;
    let hue = seedH;
    if (!oklchSpace && !anchor.achromatic) {
      const hs = holdTone(seedH, intendedS, l, env, tgt);
      let sB = hs.s, lB = hs.l;
      if (w > 0) { const ts = tintS(seedH, hs, frac); sB = hs.s + (ts - hs.s) * w; lB = solveLForTone(seedH, sB, hs.target); }
      hue = solveOkhslHueForCam16(camTarget, seedH, (h) => okhslToRgbFloat(h, sB, lB));
    }
    const tintHue = seedH;
    // Tone hold (#725 U3): the one hue above feeds both the hold's target and the emission.
    const hold = holdTone(hue, intendedS, l, env, tgt);
    const rgb = okhslToRgb(hue, hold.s, hold.l);
    return { hue, s: hold.s, l: hold.l, rgb, chroma: cam16FromRgb(rgb).chroma, toneTarget: hold.target, toneHeld: hold.held, env, hold, w, band, tintHue };
  };
  // Peak joint cap (#725 U2, R69): the anchored peak ramp emits no stop above stop 500's own chroma, the
  // same `capChromaAtHeldTone` construction `okhslStops` runs, scoped the same way (peak, dampAmp 0).
  // The polish hue is solved from each stop's own pre-cap OKLCH hue (null) in BOTH hue spaces: under
  // "cam16" that pre-cap hue already sits on the anchor's CAM16 line (preCap's solve), and a chroma cut
  // made after the hue is set keeps the stop's own OKLCH hue, as dampStops does (T-0015; passing the
  // anchor's CAM16 hue instead measured a 0.0202 OKLab dE flip on capped corpus stops, over the 0.02 bound).
  const capPeak = mode === "peak" && (controls.dampAmp ?? 0) === 0;
  const ceiling = !capPeak ? Infinity : clamped ? preCap(500).chroma : anchor.cam.chroma;
  const built = stops.map((stop) => {
    if (stop === 500 && !clamped) {
      return {
        stop, tone: anchor.lstar, chroma: anchor.cam.chroma,
        maxc: maxChromaInGamut(anchor.cam.hue, anchor.lstar), rgb: anchor.rgb, hex: anchor.hex, inGamut: true,
        toneTarget: anchor.lstar, toneHeld: anchor.lstar, env: 1, model: anchor.okhsl.s, basis: anchor.okhsl.s, tintFrac: frac,
      };
    }
    let { hue, s, l, rgb, chroma, toneTarget, toneHeld, env, tint, band, hold, w, tintHue, bandHue } = preCap(stop);
    let capped = false, tintFracStop = frac, peakCap = false;
    // the stop's own value is capped first (ramp@1's order, which keeps the two hue spaces within 0.02
    // OKLab dE on capped stops); the blend below can carry it back over the ceiling, capped again there
    if (capPeak && !band && chroma > ceiling + 1e-6) ({ s, l, rgb, chroma, capped } = capChromaAtHeldTone(hue, s, l, rgb, chroma, ceiling, null, true));
    if (!band) {
      // on peak the blend's tint is capped at the ceiling too (at the anchor's CAM16 hue and the stop's
      // held L*), so a muted anchor's blend lands under its stop 500 without a second cap in most stops
      const mcB = capPeak ? maxChromaInGamut(anchor.cam.hue, hold.target) : 0;
      const fracB = capPeak && mcB > 0 ? Math.min(frac, Math.max(0, (ceiling - 0.5) / mcB)) : frac;
      const bl = blendTint(hue, s, hold, fracB, w, tintHue);
      tint = bl.tint;
      if (w > 0) { s = bl.s; l = bl.l; rgb = okhslToRgb(hue, s, l); chroma = cam16FromRgb(rgb).chroma; toneHeld = bl.held; }
    }
    // The peak cap reads the stop's final value, after the band rule's blend (ramp@2): no stop above
    // stop 500's own chroma, the blended interior and the band tint included, so a muted anchor's ends
    // stay no richer than its 500 (capped before the blend, a 40% tint read 2.19x stop 500 at stop 150 on
    // a SAMPLED muted anchor, tonal.mjs C6 v). A band stop's tint fraction is capped where its chroma,
    // the fraction times the stop's gamut ceiling, would pass half a CAM16 C under the ceiling
    // (capChromaAtHeldTone's margin), and its snap is bounded by the ramp's own stop-500 chroma
    // (`peakCap`; the rounded render alone under-reads: a near-grey anchor's 0.06 fraction of a pale
    // stop's wide ceiling snapped to C 6.06 against its stop 500's 3.20).
    if (capPeak && band) {
      const mcStop = maxChromaInGamut(cam16FromRgb(okhslToRgbFloat(hue, s, l)).hue, toneTarget);
      const fracMax = mcStop > 0 ? Math.max(0, (ceiling - 0.5) / mcStop) : 0;
      if (frac > fracMax) {
        tintFracStop = fracMax;
        const b = bandStopOkhsl(hue, toneTarget, tintFracStop);
        s = b.s; l = b.l; rgb = b.rgb.map(Math.round); chroma = cam16FromRgb(rgb).chroma; tint = b.s;
        capped = true;
      }
      peakCap = true;
    } else if (capPeak && chroma > ceiling + 1e-6) ({ s, l, rgb, chroma, capped } = capChromaAtHeldTone(hue, s, l, rgb, chroma, ceiling, null, true));
    // (a stop capped before the blend whose blended value stays under the ceiling keeps capped true)
    const tone = lstarFromRgb(rgb);
    const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    const rec = { stop, tone, chroma, maxc: maxChromaInGamut(anchor.cam.hue, tone), rgb, hex, inGamut: true, capped, toneTarget, toneHeld, env, model: s, basis: anchor.okhsl.s, tint, tintFrac: tintFracStop };
    if (band) rec.bandHue = bandHue;
    if (peakCap) rec.peakCap = true;
    return rec;
  });
  return finishRamp(built, controls, mode, capPeak ? ceiling : Infinity);
}

function okhslStops(palette, controls, stops, mode) {
  const anchor = resolveAnchor(palette);
  if (anchor) return okhslStopsAnchored(palette, controls, stops, anchor, mode);
  const baseHue = effHue(palette.hue, controls.hueSpace, hueAnchorFrac(palette, controls));
  const pk = peakC(baseHue);                                       // { c, tone }, the cusp (peak geometry)
  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;
  const lLight = okhslLAt(controls.lmax ?? 100);                   // light end (l≈1 at lmax=100 → 050 white)
  const lDark = okhslLAt(controls.lmin ?? 5);                      // dark end
  const cuspL = okhslLAt(pk.tone);                                 // OKHSL lightness of the cusp (peak pivot)
  // lightnessAt, the ramp's OKHSL lightness at a stop, blended even↔cusp by `t`. Evaluated at the
  // EFFECTIVE stop (effStop), so skew/lift warp WHICH position of the distribution a stop reads while
  // hue and saturation below stay keyed on the REAL stop (they are damping/rotation terms about the
  // centre, not lightness). The cusp pivot therefore follows the warp: with skew > 0 the cusp lands at
  // a DARKER real stop, so more stops sit on its light side, the same "lighter mids" direction
  // toneAt's gamma gives the even path. Shared by the per-stop map AND the stop-500 hue anchor below so
  // the solved hue can never drift from the lightness the ramp actually emits there (#647).
  const lightnessAt = (stop, t) => {
    const se = effStop(stop, palette);
    const evenL = lerp(lLight, lDark, (se - 50) / 900);
    const peakL = se <= 500 ? lerp(lLight, cuspL, (se - 50) / 450) : lerp(cuspL, lDark, (se - 500) / 450);
    return lerp(evenL, peakL, t);
  };
  // keyS  -  REQ-052, the same "key colour" prime.mjs reads (src/engine/prime.mjs): the palette's own
  // chroma/hue rendered at the hue's CUSP tone (baseHue, keyChroma, pk.tone), measured back through
  // OKHSL. This is the ramp's saturation BASIS at the anchor stop now, in place of the old "chroma% of
  // the sRGB gamut" fraction (palette.chroma/100 read as if it were already an OKHSL saturation  -  two
  // quantities that don't coincide, e.g. Info: chroma% 0.400 vs key.s 0.289). Every other stop scales
  // this by chromaEnvelope below, which is exactly 1 at the anchor, so the anchor stop always renders at
  // 100% of the key colour's own saturation  -  never "chroma% of gamut" damped toward a multiplier.
  const keyChroma = ((palette.chroma ?? 0) / 100) * pk.c;
  const keyS = rgbToOkhsl(hctToRgb(baseHue, keyChroma, pk.tone).rgb).s;
  const sBasis = Math.min(1, Math.max(0, keyS));
  // chromaEnvelope per stop, computed ONCE (C7: exactly one call site)  -  shared by the stop-500 hue seed
  // below and the per-stop map, so the two can never drift apart (#647's original reason for factoring
  // the stop-500 read out of the per-stop formula in the first place).
  const lift = palette.lift ?? 0;
  const envStops = stops.includes(ANCHOR_STOP) ? stops : [...stops, ANCHOR_STOP];
  const envelopeAt = new Map(envStops.map((stop) => [stop, chromaEnvelope(stop, ANCHOR_STOP, lift, controls)]));
  // The palette's hue in OKHSL space, constant across the ramp when hueShift=0. For an OKLCH-hue palette,
  // SOLVE it directly so the KEY stop (500) reads back at the SET OKLCH hue, anchored at that stop's OWN
  // saturation + lightness in the render space (kills the Abney drift the CAM16 proxy left, worst in the
  // blues, ~6°). For a CAM16-hue palette the hue IS a CAM16 hue, so carry baseHue through OKHSL as before.
  let hOk;
  if (controls.hueSpace === "oklch") {
    const v = palette.cuspPull ?? controls.vibrancy ?? DEFAULT_CONTROLS.vibrancy;
    const t500 = mode === "peak" ? 1 : Math.max(0, Math.min(1, v / 100));
    // stop-500 lightness (even↔cusp blend, warped); with Match peer lightness, the shared stop-500 L*'s
    const l500 = controls.matchPeerLightness === true ? okhslLAt(sharedToneAt(500, controls)) : lightnessAt(500, t500);
    const s500 = Math.min(1, Math.max(0, keyS * envelopeAt.get(ANCHOR_STOP)));
    hOk = solveOkhslHue(palette.hue, s500, l500);
  } else {
    hOk = rgbToOkhsl(hctToRgb(baseHue, pk.c, pk.tone).rgb).h;
  }
  // anchorChroma  -  the anchor's own emitted CAM16 chroma, rendered the SAME way every other stop is
  // below (#681 U3 pass 5, restoring pass 4's OKHSL-path anchor cap but SCOPED TO PEAK ONLY per the
  // owner's ruling on Q7: perceptual keeps #55's cusp-pull richness untouched, with its own bounded,
  // named exemption applied separately below; peak is already SUPPOSED to center richness at 500
  // (hpg-tonal-okhsl-modes), so capping there is consistent with peak's own definition, not in tension
  // with it the way it was for perceptual. At stop === ANCHOR_STOP the cap below is a proven no-op
  // (same formula, same inputs).
  // The band rule (ramp@2): the pivot is the palette's own lightnessAt(500, t), read as the L* of the key
  // saturation there and clamped into the band interior (pivotWindow); the two edge knots are the l at
  // which the key saturation renders the shared edge L* (solveLForTone), so the held interior L* meets
  // the band ladder exactly at 100 and 900. Between, lightnessAt is remapped affinely per side onto
  // [knot, pivot] (its own range over [edge, 500] is strictly monotone, effStop's property), so the
  // interior stays monotone and keeps skew, lift and the vibrancy blend. Band stops are bandStopOkhsl.
  const vPal = palette.cuspPull ?? controls.vibrancy ?? DEFAULT_CONTROLS.vibrancy;
  const tPal = mode === "peak" ? 1 : Math.max(0, Math.min(1, vPal / 100));
  const [winLo, winHi] = pivotWindow(controls, BAND_PIVOT_ROOM);
  const l500own = lightnessAt(ANCHOR_STOP, tPal);
  const pivotToneOwn = lstarFromRgb(okhslToRgbFloat(hOk, sBasis, l500own));
  const pivotTone = Math.min(winHi, Math.max(winLo, pivotToneOwn));
  // Match peer lightness (ADR-037): every stop, 500 included, renders the shared L* at the key saturation.
  const match = controls.matchPeerLightness === true;
  const pivotL = match ? solveLForTone(hOk, sBasis, sharedToneAt(ANCHOR_STOP, controls))
    : pivotTone === pivotToneOwn ? l500own : solveLForTone(hOk, sBasis, pivotTone);
  const edgeTone = { light: sharedToneAt(BAND_EDGE.light, controls), dark: sharedToneAt(BAND_EDGE.dark, controls) };
  const knot = { light: solveLForTone(hOk, sBasis, edgeTone.light), dark: solveLForTone(hOk, sBasis, edgeTone.dark) };
  const frac = tintFraction(controls);
  const ladderL = (stop) => {
    if (stop === ANCHOR_STOP) return pivotL;
    const edge = stop < ANCHOR_STOP ? BAND_EDGE.light : BAND_EDGE.dark;
    const k = stop < ANCHOR_STOP ? knot.light : knot.dark;
    const ownEdge = lightnessAt(edge, tPal);
    const span = ownEdge - l500own;
    if (!(Math.abs(span) > 1e-12)) return pivotL;
    return pivotL + (k - pivotL) * ((lightnessAt(stop, tPal) - l500own) / span);
  };
  const anchorT = 1; // peak mode always pins t=1 (see `t` below)  -  anchorChroma must match that basis
  const anchorL = mode === "peak" ? pivotL : lightnessAt(ANCHOR_STOP, anchorT);
  const anchorS = Math.min(1, Math.max(0, keyS * envelopeAt.get(ANCHOR_STOP)));
  const anchorChroma = cam16FromRgb(okhslToRgb(hOk, anchorS, anchorL)).chroma;
  const dampAmp = controls.dampAmp ?? 0;
  const built = stops.map((stop) => {
    // lightness per stop, STOP-based so the display(19) and export(25) ramps agree at a given stop.
    // Blend the EVEN-perceptual distribution toward the CUSP-anchored ("peak") one by `vibrancy`:
    // t=0 → even lightness (uniform), t=1 → the hue's cusp sits at stop 500 (vibrant center). "peak"
    // mode pins t=1. Pulling the center to the cusp is what lets off-center hues (yellow) read vibrant.
    // blend amount = the PER-PALETTE "cusp pull" when set, else the global `vibrancy`. Lets one palette
    // (e.g. yellow Warning, cusp at high L*) nudge its richest stop toward 500 without touching the rest.
    // ramp@2: the read is remapped onto the band ladder's knots (ladderL above).
    const sp = (stop - 500) / 450;
    const dir = sameDir ? -Math.abs(sp) : sp;
    const hue = (((hOk + shift * dir) % 360) + 360) % 360;
    const env = envelopeAt.get(stop);
    const band = inBand(stop);
    if (band) {
      const toneTarget = sharedToneAt(stop, controls);
      const b = bandStopOkhsl(hue, toneTarget, frac);
      const rgb = b.rgb.map(Math.round);
      const tone = lstarFromRgb(rgb);
      const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
      return { stop, tone, chroma: cam16FromRgb(rgb).chroma, maxc: maxChromaInGamut(baseHue, tone), rgb, hex, inGamut: true, capped: false, toneTarget, toneHeld: lstarFromRgb(b.rgb), env, model: b.s, basis: keyS, tint: b.s, tintFrac: frac, bandHue: b.camHue };
    }
    const l = match ? (stop === ANCHOR_STOP ? pivotL : solveLForTone(hue, sBasis, sharedToneAt(stop, controls)))
      : ladderL(stop); // skew/lift warp the position read (effStop); see lightnessAt above
    // saturation = the key colour's own OKHSL s (keyS), shaped by chromaEnvelope  -  the SAME envelope the
    // even path uses (so damp/dampCurve/dampAmp/dampBias stay meaningful here too), clamped to [0,1].
    // Tone hold (#725 U3): `l` re-solved so the damped colour keeps the undamped one's CIE L*, see holdTone.
    const hold = holdTone(hue, keyS, l, env);
    let s = hold.s, l1 = hold.l, toneHeld = hold.held;
    let rgb = okhslToRgb(hue, s, l1);
    let chroma = cam16FromRgb(rgb).chroma;
    let capped = false;
    // Generated PEAK palettes (dampAmp 0) never emit more chroma than the anchor: the shared joint cap,
    // see `capChromaAtHeldTone`. At stop === ANCHOR_STOP this never fires: same formula as anchorChroma above.
    if (mode === "peak" && dampAmp === 0 && chroma > anchorChroma + 1e-6) {
      const hueCam16 = controls.hueSpace === "oklch" ? null : (((baseHue + shift * dir) % 360) + 360) % 360; // CAM16-space hue (hueSpace "cam16" only)
      ({ s, l: l1, rgb, chroma, capped } = capChromaAtHeldTone(hue, s, l1, rgb, chroma, anchorChroma, hueCam16));
    }
    // The band rule (ramp@2): blend the stop's own (held, capped) s toward the tint by bandWeight.
    const w = bandWeight(stop, lift);
    const bl = blendTint(hue, s, hold, frac, w);
    if (w > 0) { s = bl.s; l1 = bl.l; rgb = okhslToRgb(hue, s, l1); chroma = cam16FromRgb(rgb).chroma; toneHeld = bl.held; }
    const tone = lstarFromRgb(rgb);                                 // report ACTUAL L* (for graphs / roles)
    const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    // chroma/maxc reported (measured) for the analysis graphs; OKHSL is in-gamut by construction (the
    // HCT fallback above is validated in-gamut too, per its own engine contract).
    return { stop, tone, chroma, maxc: maxChromaInGamut(baseHue, tone), rgb, hex, inGamut: true, capped, toneTarget: hold.target, toneHeld, env, model: s, basis: keyS, tint: bl.tint, tintFrac: frac };
  });
  return finishRamp(built, controls, mode);
}

// ── Group chroma damper (#785 U2, owner rulings R94 to R98) ───────────────────────────────────────
// The `<group> base chroma` value g (`rampChromaOf`, handed to `paletteStops` as `palette.chroma`) is
// a magnitude damper on the whole ramp, stop 500 included. It enters `paletteStops` at one line, its
// first branch, and nowhere else in the engine. `paletteStops` renders every stop exactly
// as its path does with the group at 100 (every floor, cap, hold and gamut step included), then
// `dampStops` scales each emitted stop's chroma coordinate by r = g / 100, holding the stop's tone and
// its hue in the palette's own hue space. Perceptual and peak: OKHSL `s` read back from the emitted
// pixel (the unit the stop is measured in), with `l` re-solved through `holdTone`, the same CIE L* hold
// those paths run on their own envelope, so the damped stop keeps the emitted pixel's L*; the pixel's
// OKHSL `h` (its OKLab, so OKLCH, hue) is held through the damped pixel's 8-bit staircase by
// `solveOkhslHue`, the solve those paths run for their key stop. Even: the CAM16 C the
// path reports, at the tone and CAM16 hue it rendered (`hue` on each even stop); under hueSpace "oklch"
// the CAM16 hue is re-solved at the damped chroma so the stop keeps its at-100 OKLCH hue (the solve the
// even paths run for their own chroma; held CAM16 hue drifts blues 7 to 10 degrees of OKLCH hue at g 30
// to 50), and the chroma takes the path's own gamut ceiling at that hue. One law on every path,
// anchored and unanchored alike, with no per-mode, per-palette or floor exception. Damp only (R95): r is
// clamped to [0, 1], and r = 1 returns the at-100 ramp itself, so g = 100 is byte-identical to the
// render before the damper.
export function groupDamper(chroma) {
  return Math.min(1, Math.max(0, (chroma ?? 0) / 100));
}

// `controls` (ramp@2, T-0040): the band stops are re-snapped after the damper (snapBandStops at tone
// sharedToneAt(stop, controls) and fraction r x chromaFloor/100, each bounded by the preceding damped
// pixel), and tone, chroma and hex re-read from the snapped pixel. The damper alone moves a band stop's
// L* up to 0.24 (perceptual, peak) and 0.40 (even) off its at-100 pixel, which on top of the snap's 0.45
// could spread peers past 1.0; the re-snap keeps every palette within 0.45 of the shared tone, damped or
// not. `tint` stays the at-100 value: Gate A reads `model / damper` against it. r = 1 still returns the
// at-100 stops untouched, so the at-100 snap stands there.
function dampStops(at100, r, mode, hueSpace, controls) {
  if (r >= 1) return at100.map((st) => ({ ...st, damper: r }));
  const okhslPath = mode === "perceptual" || mode === "peak";
  const out = at100.map((st) => {
    const out = { ...st, damper: r };
    if (okhslPath) {
      const { h, s, l } = rgbToOkhsl(st.rgb);
      const hold = holdTone(h, s, l, r);
      out.rgb = okhslToRgb(solveOkhslHue(h, hold.s, hold.l), hold.s, hold.l);
      out.tone = lstarFromRgb(out.rgb);
      out.chroma = cam16FromRgb(out.rgb).chroma;
      out.model = st.model * r;
    } else {
      const chromaAt = (h) => Math.min(st.chroma * r, maxChromaInGamut(h, st.tone));
      if (hueSpace === "oklch") out.hue = solveCam16Hue(hctToOklch(st.hue, st.chroma, st.tone)[2], 0, st.tone, false, { chromaAt });
      out.maxc = maxChromaInGamut(out.hue, st.tone);
      out.model = Math.min(st.model * r, out.maxc);
      out.chroma = chromaAt(out.hue);
      ({ rgb: out.rgb, inGamut: out.inGamut } = hctToRgb(out.hue, out.chroma, st.tone));
    }
    out.hex = "#" + out.rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    return out;
  });
  if (controls) {
    // ramp@2: the damped ramp ends like the at-100 one (finishRamp): the light band re-snapped, the
    // interior held under its predecessor (and over stop 500 on the light side; the damped 500 is
    // fixed), the dark band re-snapped under it. The damper's re-hold and rounding can flip two interior
    // stops the band rule leaves under an 8-bit code apart (role-table Data 7, peak, Base chroma 95:
    // 125 -> 150 read 94.38 -> 94.48). On the anchored peak path the pass is bounded by the damped
    // stop 500's chroma, as the at-100 pass is by its own.
    const c500 = (out.find((st) => st.stop === 500) ?? {}).chroma;
    if (controls.matchPeerLightness === true) {
      snapBandStops(out, controls, r, mode, "all", out.some((st) => st.peakCap) && c500 > 0 ? c500 : Infinity);
      return out;
    }
    snapBandStops(out, controls, r, mode, "light");
    enforceMonotonePixelL(out, out.some((st) => st.peakCap) && c500 > 0 ? c500 : Infinity);
    snapBandStops(out, controls, r, mode, "dark");
  }
  return out;
}
