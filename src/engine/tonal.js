// tonal.js — tonal-scale generation module (vanilla ESM, no deps).
//
// Builds a palette's per-stop ramp from global controls + a palette's
// {hue, chroma, skew, lift}. Tone (L*) comes from a shaped, skewable curve;
// chroma is a % of the hue's sRGB peak, edge-damped, and clamped to the gamut
// ceiling. Every emitted color is produced by the validated HCT engine so it is
// in-gamut, hits its target tone, and holds a constant CAM16 hue along the ramp.
//
// Engine contract (validated, imported — never reimplemented here):
//   hctToRgb(hue, chroma, tone) -> { rgb:[r,g,b] (0-255 ints), inGamut, lstar }
//   maxChromaInGamut(hue, tone) -> number   peakC(hue) -> { c, tone }
//   oklchToCam16Hue(h)          -> CAM16 hue (degrees)
import { hctToRgb, hctToOklch, maxChromaInGamut, peakC, oklchToCam16Hue, lstarFromRgb, cam16FromRgb } from "./hct.js";
import { okhslToRgb, rgbToOkhsl, rgbToOklchHue } from "./okhsl.js";

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
  // hue — resolved to a CAM16 hue once per palette via effHue→oklchToCam16Hue. "cam16": the hue is a
  // CAM16 hue, passed straight through. (Legacy docs that predate the OKLCH-native flip carry "cam16"
  // explicitly and keep rendering in cam16 — see persist.js / app.js openSet.)
  hueSpace: "oklch",
  // Chroma basis. false (default): the chroma control is % of the BASE-hue PEAK — per-hue, but the
  // ABSOLUTE chroma still varies with each hue's gamut, so hues come out unequally saturated. true:
  // it's % of EACH STOP's own gamut ceiling, so every hue fills the same fraction of its gamut →
  // palettes harmonize across hue regardless of the hue picked (see paletteStops). A cheap stand-in
  // for OKHSL-style perceptual-saturation normalization.
  relChroma: false,
  // Light/dark-end chroma floor (% of each stop's gamut ceiling) for the "even" path — lifts the
  // damping-starved ends back toward the palette's intended chroma so LOW-chroma ramps don't collapse
  // to a near-white "dead zone", WITHOUT muting saturated palettes (see paletteStops). Default on.
  chromaFloor: 40,
  // Ramp distribution mode (how stops map to lightness):
  //   "perceptual" (default) — even steps in OKHSL lightness (perceptually uniform) + gamut-proportional
  //                  chroma; harmonizes saturation across hue (no near-white dead zone). The `vibrancy`
  //                  control (below) pulls each hue's center toward its chroma cusp for a vibrant mid.
  //   "even"       — the classic CIELAB-L* curve below (toneAt): per-stop tone is the SAME L* for every
  //                  hue (tone-aligned). curve/relChroma/chromaFloor apply to "even" only; the per-palette
  //                  skew/lift apply to EVERY mode (#647 — see effStop on the OKHSL path).
  //   "peak"       — like perceptual with vibrancy pinned at 100: the hue's CUSP (peak chroma) anchored
  //                  at stop 500 (Tailwind-style "the color is 500").
  // perceptual/peak go through the OKHSL path (okhslStops); lmin/lmax/damp/vibrancy shape it there.
  toneMode: "perceptual",
  // Vibrancy (perceptual path) — pulls the ramp's lightness from the even-perceptual distribution (0)
  // toward the hue's CUSP-anchored distribution (100), so the CENTER sits where the hue is most
  // chromatic. The fix for hues whose vivid expression lives off-center (e.g. yellow, cusp at high L*):
  // crank it and the mid stops read vibrant for ANY hue. ("peak" mode = vibrancy 100.)
  vibrancy: 0,
  // On-color policy (resolution layer, not the ramp). "contrast" (DEFAULT since #662, ADR-003
  // amendment): on{N}/on{N}Variant take the end with the better WCAG contrast vs the accent fill
  // (550/450) per mode, falling through to the white/black constants when neither ramp end clears
  // AA 4.5:1 — which is what puts every family over the floor in both schemes without moving a stop.
  // "fixed" (the opt-out, the pre-#662 default): on{N} pinned to the light tint (050/200) in both
  // modes — uniform, but fails contrast on light accents. Applied in projectView + derivePalette
  // via applyOnColorContrast.
  onColorMode: "contrast",
  // Prime-accent ref (resolution layer, not the ramp). "mode" (default): the prime accent role resolves
  // to 550 (light) / 450 (dark) — mode-specific, better contrast per scheme. "single": both modes map to
  // 500 — one mode-agnostic accent token. Applied via applyAccentRef alongside applyOnColorContrast.
  accentRef: "mode",
  // (SPEC spec-muted-base-key-spikes 0.3.0, REQ-002/004, AC-004): the ramp's chroma multiplier that
  // used to live here as a control field is fully retired, engine-side — a palette group's "Base
  // chroma" is now an ABSOLUTE chroma target resolved entirely in src/ui/model.mjs and src/ui/persist.js
  // (never in this engine module) and handed to paletteStops AS the palette's own `chroma`. No trace
  // of that resolution survives on DEFAULT_CONTROLS: tonal.js stays fully group- and intensity-unaware.
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const lerp = (a, b, t) => a + (b - a) * t;

// effHue — resolve a palette's input hue to a CAM16 hue ONCE per palette.
// 'oklch' inputs are mapped through the engine; 'cam16' (default) pass straight.
// Compute this a single time and feed the SAME value to every stop so the
// emitted CAM16 hue is constant across the ramp (hue-stability).
// chromaFrac (0..1, default 1) anchors the OKLCH→CAM16 inverse at a chroma fraction of the hue's peak,
// so a color at that saturation lands on the requested OKLCH hue. Because OKLCH↔CAM16 hue shifts with
// chroma (Abney), the anchor should sit where the ramp's SATURATED stops actually are — see
// hueAnchorFrac. (Anchoring at the raw nominal chroma left the vivid stops ~2–3° off the set hue,
// because dampAmp drives the center stops past nominal toward the gamut peak.)
export function effHue(hue, hueSpace, chromaFrac = 1) {
  return hueSpace === "oklch" ? oklchToCam16Hue(hue, chromaFrac) : hue;
}

// hueAnchorFrac  -  the chroma fraction the ramp's VIVID CENTER stop (500) actually reaches: the palette's
// own nominal chroma, capped at the gamut peak. Anchoring effHue here  -  not at the raw un-anchored hue  - 
// puts the OKLCH-hue calibration on the saturated swatches the user reads, so they land on the SET hue.
// REQ-005 (0.3.0): `palette.chroma` is the resolved value paletteStops was called with — the absolute
// group target on the group-resolution callers, the palette's own chroma on a direct engine call — so
// the anchor always follows the SAME chroma the ramp itself is built from; no separate factor needed.
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

// solveOkhslHue — the OKHSL hue whose color at (s, l) reads back at `targetOklchHue`. The perceptual ramp
// is AUTHORED in OKHSL but EXPORTED in OKLCH, and the two disagree on "constant hue" by a chroma- and
// lightness-dependent amount (Abney) — worst in the blues (~6°). Anchoring the KEY stop directly in the
// RENDER space, at its ACTUAL saturation/lightness, lands it on the set OKLCH hue exactly, for any damping
// — no CAM16 round-trip. f(h)≈h (slope ≈1), so h ← h − (got − target) is Newton; converges in a few steps.
// #657: f is an 8-BIT STAIRCASE — okhslToRgb quantises to integer RGB, so `got` is piecewise CONSTANT in h
// and the 1e-3 criterion is unreachable on most cells. Where the step is flat the update h ← h − err is a
// fixed drift, so the LAST iterate can be 100°+ off target (pale, low-chroma cells near white are the worst:
// every h renders the same pixel). Track the BEST (h, |err|) seen and return that on exhaustion. Converged
// cells are unaffected: nothing before an iterate with |err| < 1e-3 can be smaller, so the min IS that
// iterate and the return is bit-identical. Strict `<` keeps the EARLIEST minimum, so the result is stable.
// The loop runs to i=16 so the hue the OLD code returned — the 17th, produced by the last update and
// never read back — is a scored candidate too, not a blind return. Without that pass the old value could
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

// solveCam16Hue — the even/CAM16 analog of solveOkhslHue: the CAM16 hue whose color at (chroma, tone) reads
// back at `targetOklchHue`. The "even" ramp RENDERS through the HCT engine (a CAM16 hue) but EXPORTS in
// OKLCH, and the two disagree on "constant hue" by a chroma- AND lightness-dependent amount (Abney) — up to
// ~2° at the blue pole, ~9° under mid-tone amplification. The effHue proxy anchored at the hue's PEAK tone,
// not the 500 stop's actual tone, so the residual survived. Solving the KEY stop (500) directly in the
// RENDER space at its ACTUAL chroma + tone lands it on the set OKLCH hue for any damping. f(h)≈h (slope ≈1)
// → Newton converges in a few steps. (This is the same "anchor in the space the ramp renders" fix #202 gave
// the OKHSL path — now applied to the even/CAM16 path for parity.)
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
function solveCam16Hue(targetOklchHue, chroma, tone, gamutClamp = false, { chromaAt = null } = {}) {
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

// evenChroma — the even path's per-stop chroma from the gamut ceiling + a pre-computed intended target and
// the chromaEnvelope value `env` at this stop: damp toward intended·env, floor toward chromaFloor% of the
// gamut but NEVER past intended (an envelope floor: intended is exactly the anchor's own chroma, env=1
// there, so the floor can never lift a stop past the anchor  -  #681 U3), clamp in-gamut. A high-chroma
// palette's `intended` is itself large relative to any stop's shrinking gamut ceiling, so
// chromaFloor%·maxc stays well under `damped` there and the floor never binds  -  it only rescues the
// LOW-chroma ramps chromaFloor exists for. Factored so the per-stop map AND the stop-500 hue anchor share
// ONE formula and can't drift (the oklch-hue-anchor gate reads the exported hue, so any drift here trips
// it).
function evenChroma(maxc, intended, env, chromaFloor) {
  const damped = Math.min(intended * env, maxc);
  const floorC = Math.min(((chromaFloor ?? 0) / 100) * maxc, intended);
  return Math.min(maxc, Math.max(damped, floorC));
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
export function chromaEnvelope(stop, anchorStop, lift, controls) {
  const sd = (liftStop(stop, lift) - liftStop(anchorStop, lift)) / 450; // position vs the anchor's OWN lifted reading (R2)
  const isEven = controls.toneMode === "even";
  const damp = isEven ? 100 - (100 - controls.damp) * EVEN_DAMP_FACTOR : controls.damp;
  const dampCurve = (isEven ? EVEN_DAMP_FACTOR : 1) * (controls.dampCurve ?? 1.5);
  const uG = Math.abs(sd) ** dampCurve;
  const sideW = Math.max(0, 1 + ((controls.dampBias ?? 0) / 100) * Math.sign(sd));
  const shoulder = ((controls.dampAmp ?? 0) / 100) * 4 * uG * (1 - uG); // 0 at sd=0 AND |sd|=1  -  shoulders only
  return Math.max(0, 1 + shoulder - (damp / 100) * sideW * uG);
}

// shape — remap normalized position p∈[0,1] (0=light end, 1=dark end) to q∈[0,1].
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
// local slope, so wherever the curve is flat — the light end under logistic at
// tension 0, flattened further by a positive skew — the bump's own slope won.
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
// skew, tension, lmin and lmax — no per-curve tuning and nothing to re-verify
// when a curve is added. LIFT_SHIFT_MAX caps |A| at a safety factor of that
// bound, so the guarantee survives even a lift outside its schema domain.
const BUMP_SLOPE_MAX = Math.PI / 900;     // peak |dw/dstop| of the cosine bump
const LIFT_SAFETY = 0.85;                 // keep d/dstop[A·w] <= this, always < 1
export const LIFT_SHIFT_MAX = LIFT_SAFETY / BUMP_SLOPE_MAX; // ≈ 243.5 stops
// Stops of displacement per unit of lift. No gain can reproduce the old additive
// bump's AMPLITUDE — that amplitude is exactly what broke monotonicity, so some
// attenuation is forced — and `lift` is load-bearing well beyond the Warning
// default: ~90% of the curated category presets carry a non-zero lift, which is
// how a preset anchors its ramp on a sampled key color. 6 is therefore chosen as
// the largest gain that still keeps the guarantee comfortably inside its bound:
// at the extreme of lift's own domain (persist.js clamps lift to ±40) it asks for
// 6·40 = 240 stops, under LIFT_SHIFT_MAX, so the cap NEVER binds in-domain and
// lift stays linear across its whole range, while d/dstop[A·w] peaks at 0.838 —
// short enough of 1 that the ramp never stalls (the whole 3,780-palette preset
// corpus renders with no duplicate swatch and a >=0.55 L* gap at every step).
// The cap is a pure out-of-domain safety net, not something in-domain relies on.
export const LIFT_GAIN = 6;

// liftStop — the stop `lift` displaces `stop` to. Pure in the single `stop`
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

// chromaEnvelope — shared with U3 (copied verbatim from U3's own tonal.js at fa8f072, same export name
// and signature, per the U2 re-diagnosis's Finding 1/9 seam fix: U3's version wins at U4 integration,
// this copy exists only so U2 can route its own anchored branches through the SAME formula rather than
// keep a second, independently-typed damping copy). The single per-stop chroma multiplier shared by the
// "even" path (evenChroma) and the OKHSL path: one function replaces what used to be two separately-typed
// copies of the same damping formula ("m" in each, #647/#668). Position is read at the LIFTED stop
// (liftStop, #668) — never the nominal stop, and never a separately re-derived "effective" stop (effStop,
// which additionally composes skew's gamma): keying on effStop additionally moves every skew-only
// palette — including the shipped Primary and Neutral, both skew -20 lift 0 — for a defect they do not
// have, moves the normative Panda/shadcn spec literals derived from them, and is measurably worse at its
// own job (4 of 10,080 synthetic grid cells still rise under it, worst +0.006 L* — 668-report.md §4).
//
// sd is measured against `liftStop(anchorStop, lift)` — the anchor's OWN lifted reading, not the raw
// numeric anchorStop (e.g. 500) — so env(anchorStop) === 1 EXACTLY for EVERY damp/dampCurve/dampAmp/
// dampBias/lift combination, unconditionally, not only at lift 0. sd is 0 at the anchor by construction,
// so uG is 0, the shoulder term vanishes (its own factor is uG), and the edge-damp term vanishes too
// (its factor is uG) — no branch needed, and nothing here can accidentally lift the anchor off 1.
export function chromaEnvelope(stop, anchorStop, lift, controls) {
  const sd = (liftStop(stop, lift) - liftStop(anchorStop, lift)) / 450; // position vs the anchor's OWN lifted reading (R2)
  const uG = Math.abs(sd) ** (controls.dampCurve ?? 1.5);
  const sideW = Math.max(0, 1 + ((controls.dampBias ?? 0) / 100) * Math.sign(sd));
  const shoulder = ((controls.dampAmp ?? 0) / 100) * 4 * uG * (1 - uG); // 0 at sd=0 AND |sd|=1 — shoulders only
  return Math.max(0, 1 + shoulder - (controls.damp / 100) * sideW * uG);
}

// anchorChromaBasis(stop, anchorStop, lift, anchorValue, groupValue) -> the BASIS chromaEnvelope's
// shoulder/damp multiplier gets applied to (Q-U2-5 ruling, addendum 2, u2-p2-brief.md, 2026-09-18):
// the anchor's own measured chroma/saturation exactly AT the pivot (w=0), blending to the group's
// resolved ramp target (`groupValue`, `rampChroma`-derived) at each side's true endpoint (w=1), BY
// THE LIFTSTOP POSITION — the SAME `sd` chromaEnvelope itself keys on, not `anchorWarp`'s skew-warped
// `w` (a local construction this ruling retired: tying the chroma BLEND to skew was never asked for,
// and it re-threaded `anchorLiftPos` back into the chroma path chromaEnvelope's own liftStop routing
// was built to replace).
//
// R2 (review pass 2, fix-first-2, 2026-09-18): the raw linear blend (`w = min(1, sd)`) has a NONZERO
// slope at the pivot — for a near-grey anchor (s/chroma close to 0) inside a chroma-100 group, one
// stop away from 500 already reads a noticeable fraction of the way toward `groupValue`, so the pivot
// sits in a visible "notch" relative to its own immediate neighbours even though chromaEnvelope's own
// continuity proof (env(500)=1 exactly) holds. Easing the WEIGHT to zero slope at sd=0 (smoothstep,
// `3t^2-2t^3` on `t=min(1,sd)`) fixes that: the blend still reaches 0 exactly at the pivot and 1
// exactly at each side's endpoint (smoothstep(0)=0, smoothstep(1)=1, same fixed ends as the raw linear
// form), but its derivative is 0 at t=0 too, so the chroma trajectory leaves the pivot flat instead of
// with a kink. `chromaEnvelope` itself stays verbatim (untouched) — only the BASIS this weight blends
// is different; the envelope's own shoulder/damp shaping is unaffected.
export function anchorChromaBasis(stop, anchorStop, lift, anchorValue, groupValue) {
  const sd = Math.abs(liftStop(stop, lift) - liftStop(anchorStop, lift)) / 450;
  const t = Math.min(1, sd);
  const w = t * t * (3 - 2 * t); // smoothstep: w(0)=0, w(1)=1, w'(0)=w'(1)=0
  return anchorValue + (groupValue - anchorValue) * w;
}

// toneAt — L* for a stop given per-palette skew/lift and the tone controls.
// Strictly monotonic non-increasing 050->950 for ANY lift, not just lift 0:
// liftStop is strictly increasing in stop (see LIFT_SHIFT_MAX above), p rises,
// p^g preserves order for any g>0, every shape() is non-decreasing, and
// t = lmax-(lmax-lmin)*q inverts q. q stays in [0,1], so t stays in [lmin,lmax]
// by construction and the trailing clamp never fires — it is a safety net only,
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
// A palette carrying a valid, stored `anchor` (see persist.js DOMAINS.palette.anchor — a source hex,
// never fitted) renders stop 500 as that anchor's OWN color VERBATIM, in every tone mode, and builds
// the OTHER eighteen (plus six EXTRA_STOPS) stops as a two-sided ladder pivoting on (500, the
// anchor's own lightness) — the ramp's analog of prime.mjs's anchor branch (U1), continuous in
// `stop` where prime.mjs is seven discrete rungs. A palette with no (or malformed) `anchor` takes
// the ORIGINAL, byte-identical path below (C4's non-anchored identity control): `resolveAnchor`
// returns null and every other line executes exactly as it did before this ticket.
const ANCHOR_HEX = /^#[0-9A-Fa-f]{6}$/;
function hexToRgbLocal(hex) {
  const s = hex.slice(1);
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
// resolveAnchor(palette) -> { hex, rgb, okhsl:{h,s,l}, lstar, cam:{hue,chroma,J} } | null — every
// measured quantity the two anchored branches below need, computed ONCE per call from the SAME
// stored hex (never re-derived through a lossy round trip): OKHSL identity for the perceptual/peak
// path, CIE L*/CAM16 for the even path. Reused by both so they can never read the anchor as two
// different colors.
function resolveAnchor(palette) {
  const hex = typeof palette.anchor === "string" && ANCHOR_HEX.test(palette.anchor) ? palette.anchor.toUpperCase() : null;
  if (!hex) return null;
  const rgb = hexToRgbLocal(hex);
  return { hex, rgb, okhsl: rgbToOkhsl(rgb), lstar: lstarFromRgb(rgb), cam: cam16FromRgb(rgb) };
}
// Q3 (b), ruled (Q-U2-1, see .sdlc/questions/pif-u2.md): the TOKEN stays exact — prime.mjs's own
// DEFAULT rung (U1) always renders the source hex verbatim, whatever its L* — but the RAMP clamps:
// a source whose CIE L* falls outside this window renders stop 500 at the window edge nearest it,
// not the raw anchor hex. Rendering the raw anchor there would put a rising/falling kink right next
// to a pivot the OTHER stops are built to approach monotonically (measured: an out-of-window anchor
// verbatim at 500 broke monotonicity at its immediate neighbor). Clamping the pivot itself — both
// stop 500's own value AND the value the ladder's other stops shape toward — keeps the whole ramp a
// single monotone curve while a near-white or near-black source still gets a real eighteen-stop
// ladder instead of a pivot past both ends inverting it. C5 asserts the exact, by-name allow-list of
// sources this fires for (measured 9.95..95.05, the window a 9-stop-per-side ladder with a 0.55 L*
// minimum gap needs against the corpus's actual source L* distribution).
export const RAMP_L_MIN = 9.95, RAMP_L_MAX = 95.05;

// anchorLerp(pivot, edgeLight, edgeDark, stop, skew, lift, curve, tension) — the piecewise ladder VALUE
// at `stop` (never called at stop===500 — callers special-case the exact pivot/anchor separately),
// shared by okhslStopsAnchored (OKHSL l) and paletteStopsAnchored (CIE L*) so the two paths' tone math
// can never drift apart (the codebase's own "computed identically in both paths" invariant).
//
// R6 (review pass 2, fix-first-2, owner-ruled construction question, 2026-09-18): NOT a per-side
// double-S (warp the position with `anchorWarp`, THEN reshape THAT with `shape(w,curve,tension)` — a
// SECOND composition stacked on top of toneAt's own p^g -> shape order, which put the anchor at 500 on
// the FLATTEST part of each side's S instead of toneAt's own steepest point there, and read as toneAt's
// shape remapped through the pivot when it measurably was not: reverting to a straight lerp dropped the
// 19-stop gap-allow list from 69 to 41 and the 25-stop distinct-allow list from 10 to 1). This is a
// piecewise-AFFINE remap of `toneAt` itself instead: `t = toneAt(stop, skew, lift, {curve, lmin:0,
// lmax:1, tension})` reuses toneAt's OWN composition (skew's gamma, then curve/tension's shape) in a
// UNIT range, so both true endpoints read EXACTLY 1 (light, stop 050) and 0 (dark, stop 950) for any
// skew/lift/curve/tension — liftStop fixes 050/950 exactly (see liftStop's own header) so p is exactly
// 0/1 there, and shape(0)=0, shape(1)=1 for every curve (toneAt's own invariant). `t500` is that same
// unit-range read at stop 500 — strictly between 0 and 1, since 500 is strictly interior. Each side then
// maps t's own already-monotone range AFFINELY onto [edgeValue, pivot]: light side maps [t(050)=1,
// t500] onto [edgeLight, pivot], dark side maps [t500, t(950)=0] onto [pivot, edgeDark]. An affine
// remap of a monotone function is monotone, so the whole pivot-to-edge blend is monotone BY
// CONSTRUCTION — no separate warp/shape proof needed — both true ends stay exactly edgeLight/edgeDark
// (t at either true endpoint maps to the interval's own end), and F4 stays satisfied: skew, lift, curve
// and tension all act through the SAME `toneAt` the non-anchored path calls, not a second construction.
// `curve` "linear" still reduces `shape(...)` to skew's own p^g (no reshaping) — used below by the
// OKHSL path's own vibrancy blend (see okhslStopsAnchored) as the "even" side of that mix.
function anchorLerp(pivot, edgeLight, edgeDark, stop, skew, lift, curve, tension) {
  const ctl = { curve, lmin: 0, lmax: 1, tension: tension ?? 0 };
  const t500 = toneAt(500, skew, lift, ctl); // strictly in (0,1): 500 is strictly interior
  const t = toneAt(stop, skew, lift, ctl);
  if (stop <= 500) {
    const span = Math.max(1e-9, 1 - t500); // t(050)=1 exactly; span>0 since t500<1
    return edgeLight + (pivot - edgeLight) * ((1 - t) / span);
  }
  const span = Math.max(1e-9, t500); // t(950)=0 exactly; span>0 since t500>0
  return edgeDark + (pivot - edgeDark) * (t / span);
}

// paletteStopsAnchored — the even (CIE L*) path's anchored branch: `toneAt`'s piecewise analog,
// pivoting on (500, the anchor's own measured L*), now composing toneAt's own curve/tension shape
// through anchorLerp (F4, see its comment) instead of a straight lerp. Hue: "cam16" hueSpace (F4) holds
// the anchor's OWN measured CAM16 hue constant across the ramp — no Abney solve needed, we already have
// the real value; "oklch" hueSpace solves, AT EVERY STOP (R3, review pass 2, 2026-09-18 — a solve done
// only once, at the anchor's own chroma/tone, is degenerate: that point IS the anchor's own point, so it
// always resolves back to the anchor's own CAM16 hue and never moves the ramp), the CAM16 hue that
// reproduces the anchor's OWN OKLCH hue at THAT STOP's actual chroma/tone, so a stop's PERCEIVED
// (OKLCH) hue stays close to the anchor's real OKLCH hue throughout the ramp, not only at the pivot —
// see the per-stop solve inside the stops.map below. Chroma is routed through the shared `chromaEnvelope` (see its
// own comment above `liftStop`) — verbatim, not forked. Q-U2-5 ruling (revision 17, team-lead, applying
// the owner's F4 principle: keep REQ-002 as ratified, fix the construction to satisfy it), addendum 2
// (basis keyed on liftStop, not anchorWarp — see `anchorChromaBasis`'s own header comment): the BASIS
// chromaEnvelope's shoulder/damp multiplier is applied to is a BLEND, not the anchor's own chroma read
// unconditionally at every stop — exactly the anchor's own measured CAM16 chroma AT the pivot (liftStop
// position 0, stop 500, byte-exact, matching the explicit stop-500 special case below), shading to the
// group's resolved ramp target (`palette.chroma`, i.e. `rampChromaOf`'s output — REQ-002's own "Base
// chroma moves every ramp in the group" contract) at each side's true endpoint (liftStop position 1).
// This is a SEPARATE position measure from the tone construction above (`anchorLerp`'s own toneAt-based
// remap, R6) — the two are no longer tied to a single shared `w`, which is intentional: R4 retired the
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
// 500, the anchor pivot, which stays byte-exact by contract; a dark-side neighbour may still use its
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
function enforceMonotonePixelL(stopsOut) {
  const EPS = 1e-9;
  const RADIUS = 3;
  for (let i = 1; i < stopsOut.length; i++) {
    const cur = stopsOut[i];
    if (cur.stop === 500) continue;
    const bound = lstarFromRgb(stopsOut[i - 1].rgb);
    if (lstarFromRgb(cur.rgb) <= bound + EPS) continue;
    const [r0, g0, b0] = cur.rgb;
    let best = null;
    let bestDist = Infinity;
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
          if (lstarFromRgb([r, g, b]) > bound + EPS) continue;
          const dist = dr * dr + dg * dg + db * db;
          if (dist < bestDist) { bestDist = dist; best = [r, g, b]; }
        }
      }
    }
    if (!best) continue;
    cur.rgb = best;
    cur.hex = "#" + best.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    cur.tone = lstarFromRgb(best);
    const cam = cam16FromRgb(best);
    cur.chroma = cam.chroma;
    cur.maxc = maxChromaInGamut(cam.hue, cur.tone);
    // cur.inGamut stays true - the search above only ever considers in-gamut [0,255]^3 candidates.
  }
}

function paletteStopsAnchored(palette, controls, stops, anchor) {
  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;
  // hueSpace (F4/R3, review pass 2, 2026-09-18): "cam16" holds the anchor's own measured CAM16 hue
  // constant across every stop (no solve, we already have the real value — `seedHue` below). "oklch"
  // used to solve the CAM16 hue reproducing the anchor's own OKLCH hue reading AT THE ANCHOR'S OWN
  // chroma/tone — a degenerate solve, since that point IS the anchor's own point: it always returned
  // anchor.cam.hue back unchanged (to solve precision), so hueSpace measured as dead for every anchored
  // ramp (0 of 3,396 moved). The fix solves PER STOP instead, inside the stops.map below: at each
  // stop's OWN tone (and an estimated chroma at that tone), so the ramp's OKLCH hue stays close to the
  // anchor's real OKLCH hue THROUGHOUT the ramp, not only at the pivot — the correction the non-anchored
  // path's own stop-500-only calibration also only partially gives (see its own comment in paletteStops).
  const targetOklchHue = rgbToOklchHue(anchor.rgb);
  const seedHue = anchor.cam.hue; // "cam16" mode's fixed hue; also the gamut/chroma-estimate seed for "oklch"
  // Q3 (b): a source outside the window still stores/reports its byte-exact anchor everywhere else
  // (prime.DEFAULT, C2) — "the token stays exact" — but the RAMP itself "clamps": stop 500 is built
  // from the SAME continuous piecewise construction as every other stop, evaluated exactly at the
  // pivot (anchorLerp's w=0 point gives the pivot value at stop 500 with no special case needed),
  // rather than forcing the verbatim anchor pixel there. That keeps stop 500 CONTINUOUS with its
  // neighbours (built by the identical formula), where forcing the verbatim anchor at a clamped
  // pivot would jump AWAY from the window edge its neighbours are shaped around — the exact
  // discontinuity that broke monotonicity before this branch existed. Only sources strictly inside
  // the window get the verbatim, byte-exact stop-500 special case below.
  const clamped = anchor.lstar < RAMP_L_MIN || anchor.lstar > RAMP_L_MAX;
  const pivotTone = Math.min(RAMP_L_MAX, Math.max(RAMP_L_MIN, anchor.lstar));
  // Chroma basis (re-diagnosis Finding 1, Q-U2-5 ruled — see `anchorChromaBasis`'s own header
  // comment): routed through the shared envelope function (copied from U3, see its own comment above
  // `liftStop`), keyed on `liftStop` like the non-anchored path. The envelope, called below with an
  // anchor stop of 500, is exactly 1 at stop 500 for any lift, so at the pivot `evenChroma` reduces to
  // the BASIS's own pivot value exactly — no notch, by construction. The basis itself is
  // `anchorChromaBasis`'s blend: the anchor's own measured CAM16 chroma at the pivot (`anchorIntended`,
  // liftStop position 0), shading to the group's resolved ramp target (`groupIntended`,
  // `palette.chroma`-derived, mirroring `paletteStops`'s own `target`/relChroma formulas exactly) at
  // each side's endpoint (liftStop position 1) — never the anchor's value read unconditionally at
  // every stop, and never `palette.chroma` alone either.
  const maxc500 = maxChromaInGamut(seedHue, anchor.lstar);
  const anchorRelFrac = maxc500 > 0 ? Math.min(1, anchor.cam.chroma / maxc500) : 0;
  const pk = peakC(seedHue).c; // the SEED hue's max chroma in sRGB — same basis paletteStops's own `target` uses
  const groupTarget = (palette.chroma / 100) * pk;
  const lift = palette.lift ?? 0;
  const oklchSpace = controls.hueSpace === "oklch";
  const built = stops.map((stop) => {
    if (stop === 500 && !clamped) {
      return {
        stop, tone: anchor.lstar, chroma: anchor.cam.chroma,
        maxc: maxc500, rgb: anchor.rgb, hex: anchor.hex, inGamut: true,
      };
    }
    const tone = anchorLerp(pivotTone, controls.lmax ?? 100, controls.lmin ?? 5, stop, palette.skew ?? 0, palette.lift ?? 0, controls.curve, controls.tension);
    const s = (stop - 500) / 450;
    const dir = sameDir ? -Math.abs(s) : s;
    const env = chromaEnvelope(stop, 500, lift, controls);
    // chromaAt(h) - the chroma THIS stop will actually render at candidate hue h: the exact formula
    // the final chroma line below evaluates, factored out so the hue solve (review pass 4, Finding 2)
    // can converge against the real render, not a stand-in seed chroma that the render then discards -
    // see solveCam16Hue's own header comment for why that mismatch mattered.
    const chromaAt = (h) => {
      const mc = maxChromaInGamut(h, tone);
      const anchorIntendedH = controls.relChroma ? anchorRelFrac * mc : anchor.cam.chroma;
      const groupIntendedH = controls.relChroma ? (palette.chroma / 100) * mc : groupTarget;
      const intendedH = anchorChromaBasis(stop, 500, lift, anchorIntendedH, groupIntendedH);
      return evenChroma(mc, intendedH, env, controls.chromaFloor);
    };
    let resolvedHue = seedHue;
    if (oklchSpace) {
      // R3 (review pass 2) solves per stop, at THIS STOP'S OWN tone, not once at the anchor's own
      // point (the degenerate solve that made hueSpace measure as dead). Review pass 4 Finding 2
      // solves hue and the REAL render chroma jointly via chromaAt above; review pass 5 Finding 1
      // replaced the fixed-point step inside solveCam16Hue with a bracketed root-find (see its own
      // header comment) - seedHue is no longer passed or used as a fallback there.
      resolvedHue = solveCam16Hue(targetOklchHue, 0, tone, false, { chromaAt });
    }
    const hue = (((resolvedHue + shift * dir) % 360) + 360) % 360;
    const maxc = maxChromaInGamut(hue, tone);
    const chroma = chromaAt(hue);
    const out = hctToRgb(hue, chroma, tone);
    const hex =
      "#" +
      out.rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    return { stop, tone, chroma, maxc, rgb: out.rgb, hex, inGamut: out.inGamut };
  });
  enforceMonotonePixelL(built);
  return built;
}

// paletteStops — full per-stop pipeline for one palette.
// palette: { hue, chroma, skew, lift }; controls: DEFAULT_CONTROLS-shaped.
// Returns [{ stop, tone, chroma, maxc, rgb, hex, inGamut }] for each stop.
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
  // chromaEnvelope per stop, computed ONCE (C7: exactly one call site)  -  the anchor stop is guaranteed
  // present so the stop-500 hue/chroma SEED below and the per-stop map read the SAME value, never a
  // second, independently-typed derivation (the "can't drift" property the old evenChroma comment named).
  const envStops = stops.includes(ANCHOR_STOP) ? stops : [...stops, ANCHOR_STOP];
  const envelopeAt = new Map(envStops.map((stop) => [stop, chromaEnvelope(stop, ANCHOR_STOP, lift, controls)]));
  // Resolve the BASE CAM16 hue once (flat across the ramp when hueShift=0 — the hue-stability default).
  // For an OKLCH-hue palette, SOLVE it in the RENDER space at the KEY stop (500)'s ACTUAL chroma + tone so
  // it exports back at the SET OKLCH hue — killing the Abney residual the peak-tone-anchored effHue proxy
  // left (up to ~2° at dampAmp 0, ~9° under amplification, worst in the blues). For a CAM16-hue palette the
  // slider IS a CAM16 hue → pass straight through (effHue's cam16 branch is the identity, preserved here).
  let baseHue;
  if (controls.hueSpace === "oklch") {
    const tone500 = toneAt(500, palette.skew, palette.lift, ctl);
    const seedHue = effHue(palette.hue, "oklch", hueAnchorFrac(palette, controls)); // ~baseHue, only for the gamut basis
    const maxc500 = maxChromaInGamut(seedHue, tone500);
    const intended500 = (palette.chroma / 100) * (controls.relChroma ? maxc500 : peakC(seedHue).c);
    const c500 = evenChroma(maxc500, intended500, envelopeAt.get(ANCHOR_STOP), controls.chromaFloor);
    baseHue = solveCam16Hue(palette.hue, Math.max(c500, 8), tone500); // floor the solve chroma so the hue stays well-defined for near-greys
  } else {
    baseHue = palette.hue;
  }
  const pk = peakC(baseHue).c; // the BASE hue's max chroma in sRGB
  const target = (palette.chroma / 100) * pk; // control is % of the BASE-hue peak
  // anchorChroma  -  the anchor stop's OWN emitted chroma, by the SAME formula the per-stop map below
  // uses at stop 500 (relChroma-aware, and tone/hue-aware via toneAt/baseHue  -  lift- and skew-displaced,
  // never the hue's independent cusp). #681 U3 pass 3: this is the root-cause fix for the lift-sign x
  // hue-cusp-tone mechanism Q7 measured  -  `target`/`pk` are calibrated against the hue's OWN theoretical
  // peak (peakC), which lift can displace the anchor away from while leaving some OTHER real stop
  // closer to it; that other stop's bigger local gamut ceiling (maxc) let it clamp to MORE absolute
  // chroma than the (now off-cusp) anchor even though chromaEnvelope's own multiplier never exceeds 1
  // for a zero dampAmp. The anchor's emitted value, not the hue's independent peak, is what "0 above
  // 100%" is measured against, so it is what every other stop gets held to below.
  const tone500 = toneAt(500, palette.skew, palette.lift, ctl);
  const maxc500 = maxChromaInGamut(baseHue, tone500);
  const intended500 = controls.relChroma ? (palette.chroma / 100) * maxc500 : target;
  const anchorChroma = evenChroma(maxc500, intended500, envelopeAt.get(ANCHOR_STOP), controls.chromaFloor);
  const dampAmp = controls.dampAmp ?? 0;
  return stops.map((stop) => {
    const tone = toneAt(stop, palette.skew, palette.lift, ctl);
    const s = (stop - 500) / 450; // signed position: <0 light · 0 mid · >0 dark
    // Edge hue rotation, pivoting on stop 500 (s=0). OPPOSITE mode (default) torsions the
    // ends apart — hueShift·s → light end −shift, dark end +shift. SAME-direction mode
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
    const intended = controls.relChroma ? (palette.chroma / 100) * maxc : target; // un-damped chroma for this stop
    // evenChroma: scale intended by chromaEnvelope's multiplier (exactly 1 at ANCHOR_STOP, by
    // construction  -  the edge damping starves the light/dark ends, never the anchor), then apply the
    // chroma FLOOR on the envelope itself  -  for a LOW-chroma palette the light stops collapse to near-
    // white (the "dead zone"); the floor lifts each stop's envelope back toward 1, up to chromaFloor%,
    // NEVER past the anchor's own envelope of 1 (a muted palette stays muted, a neutral stays neutral,
    // saturated stops already clamp at/near maxc so the floor never binds). Shared with the stop-500 hue
    // anchor so they can't drift.
    let chroma = evenChroma(maxc, intended, envelopeAt.get(stop), controls.chromaFloor);
    // Generated palettes (dampAmp 0) never emit more chroma than the anchor itself (#681 U3 pass 3, the
    // C6 "0 above 100%" clause). At stop === ANCHOR_STOP this is an exact no-op (same formula, same
    // inputs, chroma === anchorChroma already). Authored dampAmp>0 overrides (Adia, C6's named carve-out)
    // skip this cap; chromaEnvelope's own liftStop-keyed position math above is untouched.
    if (dampAmp === 0) chroma = Math.min(chroma, anchorChroma);
    // Emit via the engine at the per-stop (hue, chroma, tone): in-gamut, hits the
    // tone, holds the SPECIFIED hue (constant when hueShift=0, else edge-rotated).
    const out = hctToRgb(hue, chroma, tone);
    const hex =
      "#" +
      out.rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    return { stop, tone, chroma, maxc, rgb: out.rgb, hex, inGamut: out.inGamut };
  });
}

// ── OKHSL distribution path (toneMode "perceptual" | "peak") ──────────────────────────────────────
// Steps lightness evenly in OKHSL's perceptually-uniform l — or, for "peak", with the hue's CUSP
// anchored at stop 500 and each half spread from there — with chroma as a gamut-proportional OKHSL
// saturation. Every emitted color is in gamut by OKHSL's construction. l is keyed off the STOP NUMBER
// (not the array index) so a stop has the same color in the 19-stop display ramp and the 25-stop export ramp.
const _okL = new Map(); // L* -> OKHSL lightness (via a neutral gray at that L*); memoized
export function okhslLAt(lstar) {
  const k = lstar.toFixed(2);
  let v = _okL.get(k);
  if (v === undefined) { v = rgbToOkhsl(hctToRgb(0, 0, lstar).rgb).l; _okL.set(k, v); }
  return v;
}

// okhslLAtChromatic(targetLstar, hue, s) -> the OKHSL l whose (hue, s, l) renders at measured CIE L*
// `targetLstar`, for a GIVEN (possibly non-zero) saturation — re-diagnosis Finding 7 (review F9): the
// anchored OKHSL branch's window-clamp pivot used `okhslLAt`'s own achromatic (s=0) lookup even though
// the clamped stop renders at the anchor's REAL saturation (chromaEnvelope's own env=1 there), and
// OKHSL l is only a proxy for CIE L* at s=0 — the SAME lightness-vs-saturation coupling #668 names
// elsewhere, which put 9 of the 10 named window-clamp sources 0.18-2.26 L* short of the window bound
// instead of landing exactly on it. Bisection (not a Newton step guessing a slope): for a fixed
// hue/s, measured CIE L* is monotone non-decreasing in OKHSL l (a brighter HSL-style lightness
// parameter never measures darker at fixed hue/saturation), so 24 steps converge to within 2^-24 of
// the true root — negligible cost, called only for the handful of window-clamped sources.
function okhslLAtChromatic(targetLstar, hue, s) {
  let lo = 0, hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    const got = lstarFromRgb(okhslToRgb(hue, s, mid));
    if (got < targetLstar) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// effStop — the OKHSL path's EFFECTIVE stop (#647): the stop whose position the LIGHTNESS is read at
// once the palette's own `skew` and `lift` have warped it. Both controls were persisted, threaded and
// sliders-exposed, but only the "even" path (toneAt) ever read them, so in the shipped DEFAULT tone mode
// dragging Skew moved the 7-swatch prime ladder (prime.mjs DOES read skew) while the 19-stop gradient
// under it sat still. Warping the stop rather than the lightness reuses toneAt's exact two transfer
// functions in the same order — liftStop's cosine displacement first (#648's shared helper, never a
// second bump), then skew's gamma on the normalized position — so the two paths agree on what the
// controls MEAN, and the OKHSL curve itself is untouched.
//
// Monotone by composition: liftStop is strictly increasing (|A|·π/900 < 1 by #648's bound), p^g preserves
// order for any g>0, and both lightness formulas below are non-increasing in the effective stop. The
// endpoints are fixed exactly — liftStop is the identity at 050/950 and the gamma fixes p=0 and p=1.
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

// okhslStopsAnchored — the perceptual/peak path's anchored branch: a piecewise OKHSL-`l` ladder
// pivoting on (500, the anchor's own OKHSL lightness), replacing `lightnessAt`'s even/cusp blend with
// a pivot-preserving analog (F4, re-diagnosis Finding 2, owner-ruled 2026-09-18: the controls stay
// live — both perceptual and peak still hit stop 500 exactly, C3's own claim, but `mode`/vibrancy now
// DO move the rest of the ramp, and Curve/Tension/hueSpace are no longer dead for an anchored palette).
// `l` blends TWO curve/tension-composed anchorLerp constructions (see anchorLerp's own comment) the
// SAME way the non-anchored `okhslStops` blends its own evenL/peakL by `vibrancy`: `evenL` is the
// STRAIGHT pivot-to-edge lerp (curve "linear" reduces anchorLerp's shape(w,...) to w exactly — the
// ORIGINAL, pre-F4 construction), `peakL` is the curve/tension-shaped one, and `t = mode==="peak" ? 1
// : vibrancy/100` blends them — "peak" pins full curve/tension shaping, "perceptual" moves continuously
// with Vibrancy, and at vibrancy 0 (DEFAULT_CONTROLS) perceptual mode reduces to `evenL` exactly, so
// existing perceptual-mode renders at default vibrancy are UNCHANGED by this fix. Hue: "cam16" hueSpace
// holds the anchor's own measured OKHSL hue constant (matching prime.mjs's `hOk = key.h`, no solve
// needed, we already have the real value). "oklch" hueSpace (R3, review pass 2, 2026-09-18) used to
// solve the OKHSL hue reproducing the anchor's own OKLCH hue reading AT THE ANCHOR'S OWN saturation/
// lightness — a degenerate solve (that point IS the anchor's own point, so it always returned
// anchor.okhsl.h back unchanged) that measured as dead (0 of 3,396 moved). The fix solves PER STOP
// instead, inside the stops.map below, at that stop's OWN `l`/`s` (both already stop-dependent and,
// unlike the CIE-L* path, independent of hue — OKHSL saturation never reads the resolved hue here — so
// no seed/second-pass is needed, unlike paletteStopsAnchored's own per-stop solve).
function okhslStopsAnchored(palette, controls, stops, anchor, mode) {
  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;
  const targetOklchHue = rgbToOklchHue(anchor.rgb);
  const oklchSpace = controls.hueSpace === "oklch";
  const hOkSeed = anchor.okhsl.h; // "cam16" mode's fixed hue; also the pivot-clamp hue basis below
  const lLight = okhslLAt(controls.lmax ?? 100);
  const lDark = okhslLAt(controls.lmin ?? 5);
  // Q3 (b): clamp the ladder's OWN pivot into the ramp's window (RAMP_L_MIN/MAX, in CIE L*),
  // expressed in OKHSL l via the same neutral-grey lookup okhslLAt uses elsewhere. A source outside
  // the window still reports its byte-exact anchor everywhere else (prime.DEFAULT, C2) — "the token
  // stays exact" — but the ramp itself "clamps": stop 500 is built from the SAME continuous
  // piecewise construction as every other stop (anchorLerp's w=0 point gives the pivot value at
  // stop 500 with no special case needed), rather than forcing the verbatim anchor pixel there,
  // which would jump away from the window edge its neighbours are shaped around — the exact
  // discontinuity that broke monotonicity before this branch existed. Only sources strictly inside
  // the window get the verbatim, byte-exact stop-500 special case below.
  //
  // The ladder is built directly in OKHSL l (not converted through CIE L* and back): l feeds
  // okhslToRgb ALONGSIDE a non-zero saturation, and OKHSL l is only a proxy for CIE L* at s=0 — a
  // ladder that targets L* directly and converts to l via a s=0 lookup drifts by the SAME chroma-vs-
  // lightness coupling #668 already names (measured worse: more, not fewer, sub-0.55-L*-gap misses),
  // so interpolating in l — where the saturation the ramp actually renders at is a constant multiplier
  // and does not re-enter the lightness computation — is the more faithful ladder.
  const clamped = anchor.lstar < RAMP_L_MIN || anchor.lstar > RAMP_L_MAX;
  // Clamp pivot (Finding 7 fix): solved at the anchor's OWN saturation via `okhslLAtChromatic`, never
  // the achromatic `okhslLAt` — the clamped stop renders at `anchor.okhsl.s` (chromaEnvelope's env=1
  // at the pivot, unconditionally, clamped or not), so the achromatic lookup was solving for the
  // WRONG color and landing short of the window bound. See okhslLAtChromatic's own comment.
  const pivotL = anchor.lstar < RAMP_L_MIN ? okhslLAtChromatic(RAMP_L_MIN, hOkSeed, anchor.okhsl.s)
    : anchor.lstar > RAMP_L_MAX ? okhslLAtChromatic(RAMP_L_MAX, hOkSeed, anchor.okhsl.s)
    : anchor.okhsl.l;
  const built = stops.map((stop) => {
    if (stop === 500 && !clamped) {
      return {
        stop, tone: anchor.lstar, chroma: anchor.cam.chroma,
        maxc: maxChromaInGamut(anchor.cam.hue, anchor.lstar), rgb: anchor.rgb, hex: anchor.hex, inGamut: true,
      };
    }
    const evenL = anchorLerp(pivotL, lLight, lDark, stop, palette.skew ?? 0, palette.lift ?? 0, "linear", 0);
    const peakL = anchorLerp(pivotL, lLight, lDark, stop, palette.skew ?? 0, palette.lift ?? 0, controls.curve, controls.tension);
    const v = palette.cuspPull ?? controls.vibrancy ?? 0;
    const t = mode === "peak" ? 1 : Math.max(0, Math.min(1, v / 100));
    const l = lerp(evenL, peakL, t);
    const sp = (stop - 500) / 450;
    const dir = sameDir ? -Math.abs(sp) : sp;
    // Saturation basis (re-diagnosis Finding 1, Q-U2-5 ruled): routed through the shared
    // `chromaEnvelope`, keyed on `liftStop` (dropping `anchorLiftPos`'s own separate lift-position/
    // damping math entirely — the envelope's own `sd = (liftStop(stop,lift) - liftStop(anchorStop,
    // lift))/450` already IS that computation, parametrized so env(500)=1 exactly for any lift). The
    // BASIS multiplied by that envelope is `anchorChromaBasis` (see its own header comment, shared
    // verbatim with `paletteStopsAnchored`): the anchor's own OKHSL `s` at the pivot (liftStop position
    // 0), shading to `palette.chroma/100` — the group's resolved ramp target, mirroring `okhslStops`'s
    // own `s = (palette.chroma/100)*m` formula exactly — at each side's endpoint (liftStop position 1),
    // by the SAME liftStop position the envelope itself keys on. No notch by construction: env(500)=1
    // and the basis's own liftStop position is 0 at the pivot, so `s` reduces to `anchor.okhsl.s`
    // exactly as a stop approaches 500. Computed BEFORE hue resolution — unlike the CIE-L* path, `s`
    // never reads the resolved hue, so the R3 per-stop hue solve below needs no seed/second pass.
    const env = chromaEnvelope(stop, 500, palette.lift ?? 0, controls);
    const anchorIntendedS = anchor.okhsl.s;
    const groupIntendedS = Math.min(1, Math.max(0, palette.chroma / 100));
    const intendedS = anchorChromaBasis(stop, 500, palette.lift ?? 0, anchorIntendedS, groupIntendedS);
    const s = Math.min(1, Math.max(0, intendedS * env));
    // hueSpace (R3): "oklch" solves the OKHSL hue that reproduces the anchor's OWN OKLCH hue AT THIS
    // STOP'S own (s, l) — see this function's own header comment for why the ANCHOR's own point was
    // a degenerate, dead solve.
    const hOkStop = oklchSpace ? solveOkhslHue(targetOklchHue, s, l) : hOkSeed;
    const hue = (((hOkStop + shift * dir) % 360) + 360) % 360;
    const rgb = okhslToRgb(hue, s, l);
    const tone = lstarFromRgb(rgb);
    const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    return { stop, tone, chroma: cam16FromRgb(rgb).chroma, maxc: maxChromaInGamut(anchor.cam.hue, tone), rgb, hex, inGamut: true };
  });
  enforceMonotonePixelL(built);
  return built;
}

function okhslStops(palette, controls, stops, mode) {
  const anchor = resolveAnchor(palette);
  if (anchor) return okhslStopsAnchored(palette, controls, stops, anchor, mode);
  const baseHue = effHue(palette.hue, controls.hueSpace, hueAnchorFrac(palette, controls));
  const pk = peakC(baseHue);                                       // { c, tone } — the cusp (peak geometry)
  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;
  const lLight = okhslLAt(controls.lmax ?? 100);                   // light end (l≈1 at lmax=100 → 050 white)
  const lDark = okhslLAt(controls.lmin ?? 5);                      // dark end
  const cuspL = okhslLAt(pk.tone);                                 // OKHSL lightness of the cusp (peak pivot)
  // lightnessAt — the ramp's OKHSL lightness at a stop, blended even↔cusp by `t`. Evaluated at the
  // EFFECTIVE stop (effStop), so skew/lift warp WHICH position of the distribution a stop reads while
  // hue and saturation below stay keyed on the REAL stop (they are damping/rotation terms about the
  // centre, not lightness). The cusp pivot therefore follows the warp: with skew > 0 the cusp lands at
  // a DARKER real stop, so more stops sit on its light side — the same "lighter mids" direction
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
  // chromaEnvelope per stop, computed ONCE (C7: exactly one call site)  -  shared by the stop-500 hue seed
  // below and the per-stop map, so the two can never drift apart (#647's original reason for factoring
  // the stop-500 read out of the per-stop formula in the first place).
  const lift = palette.lift ?? 0;
  const envStops = stops.includes(ANCHOR_STOP) ? stops : [...stops, ANCHOR_STOP];
  const envelopeAt = new Map(envStops.map((stop) => [stop, chromaEnvelope(stop, ANCHOR_STOP, lift, controls)]));
  // The palette's hue in OKHSL space — constant across the ramp when hueShift=0. For an OKLCH-hue palette,
  // SOLVE it directly so the KEY stop (500) reads back at the SET OKLCH hue, anchored at that stop's OWN
  // saturation + lightness in the render space (kills the Abney drift the CAM16 proxy left — worst in the
  // blues, ~6°). For a CAM16-hue palette the hue IS a CAM16 hue, so carry baseHue through OKHSL as before.
  let hOk;
  if (controls.hueSpace === "oklch") {
    const v = palette.cuspPull ?? controls.vibrancy ?? 0;
    const t500 = mode === "peak" ? 1 : Math.max(0, Math.min(1, v / 100));
    const l500 = lightnessAt(500, t500);                           // stop-500 lightness (even↔cusp blend, warped)
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
  const anchorT = 1; // peak mode always pins t=1 (see `t` below)  -  anchorChroma must match that basis
  const anchorL = lightnessAt(ANCHOR_STOP, anchorT);
  const anchorS = Math.min(1, Math.max(0, keyS * envelopeAt.get(ANCHOR_STOP)));
  const anchorChroma = cam16FromRgb(okhslToRgb(hOk, anchorS, anchorL)).chroma;
  const dampAmp = controls.dampAmp ?? 0;
  // solveLForTone  -  the OKHSL lightness l in [0,1] that renders CIE L* == targetTone at a FIXED hue/s
  // (#681 U3 pass 4/5). L* is monotone non-decreasing in l at fixed hue/s (OKHSL's own construction),
  // so bisection converges reliably; 30 halvings of [0,1] resolve to ~1e-9, well inside the 0.01 L* bar.
  const solveLForTone = (hue, s, targetTone) => {
    let lo = 0, hi = 1;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2;
      if (lstarFromRgb(okhslToRgb(hue, s, mid)) < targetTone) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  };
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
  const refineNearestRgb = (rgb, hueCam16, targetTone, chromaCeiling, chromaFloor = 0) => {
    let best = rgb, bestErr = Math.abs(lstarFromRgb(rgb) - targetTone);
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
  };
  return stops.map((stop) => {
    // lightness per stop — STOP-based so the display(19) and export(25) ramps agree at a given stop.
    // Blend the EVEN-perceptual distribution toward the CUSP-anchored ("peak") one by `vibrancy`:
    // t=0 → even lightness (uniform), t=1 → the hue's cusp sits at stop 500 (vibrant center). "peak"
    // mode pins t=1. Pulling the center to the cusp is what lets off-center hues (yellow) read vibrant.
    // blend amount = the PER-PALETTE "cusp pull" when set, else the global `vibrancy`. Lets one palette
    // (e.g. yellow Warning, cusp at high L*) nudge its richest stop toward 500 without touching the rest.
    const v = palette.cuspPull ?? controls.vibrancy ?? 0;
    const t = mode === "peak" ? 1 : Math.max(0, Math.min(1, v / 100));
    const l = lightnessAt(stop, t); // skew/lift warp the position read (effStop); see lightnessAt above
    const sp = (stop - 500) / 450;
    const dir = sameDir ? -Math.abs(sp) : sp;
    const hue = (((hOk + shift * dir) % 360) + 360) % 360;
    // saturation = the key colour's own OKHSL s (keyS), shaped by chromaEnvelope  -  the SAME envelope the
    // even path uses (so damp/dampCurve/dampAmp/dampBias stay meaningful here too), clamped to [0,1].
    const s0 = Math.min(1, Math.max(0, keyS * envelopeAt.get(stop)));
    let s = s0, l1 = l;
    let rgb = okhslToRgb(hue, s, l1);
    let chroma = cam16FromRgb(rgb).chroma;
    // Generated PEAK palettes (dampAmp 0) never emit more chroma than the anchor (#681 U3 pass 5, C6's
    // "0 above 100%" clause, peak only  -  perceptual keeps #55's cusp-pull richness, see below). Holds
    // tone FIXED at its pre-cap value by solving JOINTLY for (s, l): shrink s toward the target chroma,
    // then re-solve l for the held tone, iterating until both hold. Hue stays hOk-derived throughout (no
    // engine switch, no new Abney residual). At stop === ANCHOR_STOP this never fires: same formula as
    // anchorChroma above.
    if (mode === "peak" && dampAmp === 0 && chroma > anchorChroma + 1e-6) {
      const targetTone = lstarFromRgb(rgb); // the pre-cap (natural) tone  -  held fixed below
      // preCapOklchHue: THIS stop's own OKLCH hue before capping  -  the invariant the fallback/polish
      // below must reproduce (#681 U3 review 2, F1). `hue` is already hOk-derived (Abney-corrected for
      // an OKLCH-hue palette via solveOkhslHue at the stop-500 basis, see `hOk` above), so reading it
      // back here  -  rather than re-deriving from `palette.hue`  -  is correct even under a non-zero
      // hueShift, where a non-center stop's hue differs from the nominal set hue by the rotation.
      const preCapOklchHue = rgbToOklchHue(rgb);
      const hueCam16 = (((baseHue + shift * dir) % 360) + 360) % 360; // CAM16-space hue (hueSpace "cam16" only)
      // chroma here is measured back from 8-bit-quantized OKHSL-rendered rgb, same as anchorChroma  - 
      // independently-quantized measurements can differ by a few hundredths after the solve below lands
      // exactly at the target, so this margin keeps the final measured value strictly under the ceiling.
      const CAP_MARGIN = 0.5;
      const target = anchorChroma - CAP_MARGIN;
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
      let bestS = s, bestL = l1, bestRgb = rgb, bestChroma = chroma, bestErr = Math.abs(chroma - target);
      for (let i = 0; i < 24; i++) {
        const sMid = (sLo + sHi) / 2;
        const lMid = solveLForTone(hue, sMid, targetTone);
        const rgbMid = okhslToRgb(hue, sMid, lMid);
        const chromaMid = cam16FromRgb(rgbMid).chroma;
        const err = Math.abs(chromaMid - target);
        if (err < bestErr) { bestErr = err; bestS = sMid; bestL = lMid; bestRgb = rgbMid; bestChroma = chromaMid; }
        if (chromaMid > target) sHi = sMid; else sLo = sMid; // chroma rises with s at a tone-held l
      }
      s = bestS; l1 = bestL; rgb = bestRgb; chroma = bestChroma;
      // polishHue: the CAM16 hue that reproduces THIS stop's preCapOklchHue at whatever chroma/tone is
      // about to be rendered through hctToRgb below (fallback and/or the 8-bit polish)  -  solved fresh
      // rather than reusing the plain CAM16 proxy (`hueCam16`), which is what brought back the Abney
      // drift `solveOkhslHue` exists to remove on an OKLCH-hue palette (F1). A CAM16-hue palette has no
      // OKLCH-hue promise to keep, so `hueCam16` is already correct there  -  no solve needed.
      const polishHue = controls.hueSpace === "oklch" ? solveCam16Hue(preCapOklchHue, Math.max(chroma, 1), targetTone) : hueCam16;
      if (chroma > anchorChroma + 1e-6 || Math.abs(lstarFromRgb(rgb) - targetTone) > 0.01) {
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
      // Polish against the 8-bit quantization floor, at polishHue: never past the TRUE anchorChroma (not
      // the margin-reduced target), minimizing the residual tone error the rounding introduces. Floored
      // 1 C below whatever the solve/fallback already achieved, so the polish can only fix quantization
      // noise, not walk chroma away from a value the solve already spent 24 bisection steps converging.
      rgb = refineNearestRgb(rgb, polishHue, targetTone, anchorChroma, Math.max(0, chroma - 1));
      chroma = cam16FromRgb(rgb).chroma;
    }
    const tone = lstarFromRgb(rgb);                                 // report ACTUAL L* (for graphs / roles)
    const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    // chroma/maxc reported (measured) for the analysis graphs; OKHSL is in-gamut by construction (the
    // HCT fallback above is validated in-gamut too, per its own engine contract).
    return { stop, tone, chroma, maxc: maxChromaInGamut(baseHue, tone), rgb, hex, inGamut: true };
  });
}
