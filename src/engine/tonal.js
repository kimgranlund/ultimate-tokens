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

// hueAnchorFrac — the chroma fraction the ramp's VIVID CENTER stop (500) actually reaches: the palette's
// own nominal chroma, capped at the gamut peak. Anchoring effHue here — not at the raw un-anchored hue —
// puts the OKLCH-hue calibration on the saturated swatches the user reads, so they land on the SET hue.
// REQ-005 (0.3.0): `palette.chroma` is the resolved value paletteStops was called with — the absolute
// group target on the group-resolution callers, the palette's own chroma on a direct engine call — so
// the anchor always follows the SAME chroma the ramp itself is built from; no separate factor needed.
//
// No longer amplified by dampAmp (#681 U3, Q7): chromaEnvelope is exactly 1 at the anchor stop for EVERY
// dampAmp value when lift is 0 (the anchor's own rendered chroma no longer moves with dampAmp — that
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
function solveCam16Hue(targetOklchHue, chroma, tone) {
  let h = targetOklchHue; // seed: CAM16 hue ≈ OKLCH hue to first order
  for (let i = 0; i < 16; i++) {
    const got = hctToOklch(h, chroma, tone)[2];
    const err = (((got - targetOklchHue) % 360) + 540) % 360 - 180;
    if (Math.abs(err) < 1e-3) break;
    h = (((h - err) % 360) + 360) % 360;
  }
  return h;
}

// evenChroma — the even path's per-stop chroma from the gamut ceiling + a pre-computed intended target and
// the chromaEnvelope value `env` at this stop: damp toward intended·env, floor toward chromaFloor% of the
// gamut but NEVER past intended (an envelope floor: intended is exactly the anchor's own chroma, env=1
// there, so the floor can never lift a stop past the anchor — #681 U3), clamp in-gamut. A high-chroma
// palette's `intended` is itself large relative to any stop's shrinking gamut ceiling, so
// chromaFloor%·maxc stays well under `damped` there and the floor never binds — it only rescues the
// LOW-chroma ramps chromaFloor exists for. Factored so the per-stop map AND the stop-500 hue anchor share
// ONE formula and can't drift (the oklch-hue-anchor gate reads the exported hue, so any drift here trips
// it).
function evenChroma(maxc, intended, env, chromaFloor) {
  const damped = Math.min(intended * env, maxc);
  const floorC = Math.min(((chromaFloor ?? 0) / 100) * maxc, intended);
  return Math.min(maxc, Math.max(damped, floorC));
}

// The ramp's centre stop, prime.DEFAULT's home. 500 for every palette today; U2 threads a palette's own
// `anchor` stop through paletteStops/okhslStops's callers into chromaEnvelope's `anchorStop` parameter —
// this module stays unaware of where that value comes from (U3 is built behind the parameter).
const ANCHOR_STOP = 500;

// chromaEnvelope — the single per-stop chroma multiplier shared by the "even" path (evenChroma) and the
// OKHSL path (okhslStops): one function replaces what used to be two separately-typed copies of the same
// damping formula ("m" in each, #647/#668). Position is read at the LIFTED stop (liftStop, #668) — never
// the nominal stop, and never a separately re-derived "effective" stop (effStop, which additionally
// composes skew's gamma): keying on effStop additionally moves every skew-only palette — including the
// shipped Primary and Neutral, both skew -20 lift 0 — for a defect they do not have, moves the normative
// Panda/shadcn spec literals derived from them, and is measurably worse at its own job (4 of 10,080
// synthetic grid cells still rise under it, worst +0.006 L* — 668-report.md §4).
//
// sd is measured against `liftStop(anchorStop, lift)` — the anchor's OWN lifted reading, not the raw
// numeric anchorStop (e.g. 500) — so env(anchorStop) === 1 EXACTLY for EVERY damp/dampCurve/dampAmp/
// dampBias/lift combination, unconditionally, not only at lift 0 (R2, revised from the first draft below).
// sd is 0 at the anchor by construction, so uG is 0, the shoulder term vanishes (its own factor is uG),
// and the edge-damp term vanishes too (its factor is uG) — no branch needed, and nothing here can
// accidentally lift the anchor off 1 the way the old dampAmp term did (Q7: the old form's mid-tone
// "boost" landed ON the centre itself, the 144%-of-source defect C6 exists to close).
//
// R1 (reverted) measured sd against the RAW numeric anchorStop instead: exact only at lift 0, and NOT
// at lift != 0 (liftStop(anchorStop, lift) != anchorStop whenever the lift bump's weight there isn't
// zero, and it peaks — not vanishes — at the ramp's own centre). That form avoided all 10,080 cells of
// a synthetic curve x skew x hue x vibrancy x mode grid probe (test/engine/tonal.mjs "skew-lift-okhsl"
// (iii c), chroma pinned at 95) rising, at the cost of the inexact anchor under lift AND, measured
// against the corpus the product actually renders (`rampChromaOf`'s resolved chroma through
// `src/ui/model.mjs`'s `projectView`, not a palette's raw stored `chroma` — the two differ for 3,777 of
// 3,780 curated palettes), TWO duplicate-hex ramps on the 25-stop export ramp, peak mode, near white:
// nature "Varanger / Finnmark tundra" tertiary and nature "English oak woodland" primary, both stops
// 150&175, both #FDFDFB. Neither ramp was named or gated under R1 — its own gate scanned raw `chroma`,
// which is a different ramp than either one renders.
//
// R2 (shipped) re-centres sd on the anchor's own lifted reading. On the corpus the product renders, this
// closes BOTH duplicate-hex ramps to zero (0/0/0 across perceptual/peak/even, both stop sets) alongside
// the #668 uptick class already at zero, and gives the exact-anchor property Q1 originally wanted. The
// cost is real and disclosed, not free: 21 of the SAME 10,080 synthetic grid cells rise under R2, worst
// +0.1314 L* (20 near-white, measured tone 90.9-99.5, plus one near-black at tone 7.55, hue 287
// skew -100 lift -40) — about 1/6 the +0.83 L* #668 defect this unit repairs, at a skew/lift/vibrancy/
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
// (the F4 principle — no dead controls, no new control), the even path compresses damp's headroom
// (100-damp) and scales dampCurve by the SAME factor, both DERIVED from the shared sliders rather than
// a hardcoded absolute: a user who raises damp or lowers dampCurve still visibly changes the even ramp.
// perceptual/peak are untouched — this only fires when controls.toneMode === "even" (paletteStops's own
// dispatch guarantees that string exactly, never a default fallthrough — see paletteStops above).
export const EVEN_DAMP_FACTOR = 0.25;
export function chromaEnvelope(stop, anchorStop, lift, controls) {
  const sd = (liftStop(stop, lift) - liftStop(anchorStop, lift)) / 450; // position vs the anchor's OWN lifted reading (R2)
  const isEven = controls.toneMode === "even";
  const damp = isEven ? 100 - (100 - controls.damp) * EVEN_DAMP_FACTOR : controls.damp;
  const dampCurve = (isEven ? EVEN_DAMP_FACTOR : 1) * (controls.dampCurve ?? 1.5);
  const uG = Math.abs(sd) ** dampCurve;
  const sideW = Math.max(0, 1 + ((controls.dampBias ?? 0) / 100) * Math.sign(sd));
  const shoulder = ((controls.dampAmp ?? 0) / 100) * 4 * uG * (1 - uG); // 0 at sd=0 AND |sd|=1 — shoulders only
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
// Factored out rather than inlined so that #647, which wires skew/lift into the
// OKHSL path (okhslStops is also keyed off the stop NUMBER), reuses THIS helper
// instead of growing a second copy of the bump.
export function liftStop(stop, lift) {
  if (!lift) return stop;
  const a = Math.min(Math.max(lift * LIFT_GAIN, -LIFT_SHIFT_MAX), LIFT_SHIFT_MAX);
  const w = 0.5 * (1 + Math.cos((Math.PI * (stop - 500)) / 450)); // 1 at 500, 0 at 050/950
  return stop - a * w; // lift>0 -> read a LIGHTER stop -> lighter mids
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

// paletteStops — full per-stop pipeline for one palette.
// palette: { hue, chroma, skew, lift }; controls: DEFAULT_CONTROLS-shaped.
// Returns [{ stop, tone, chroma, maxc, rgb, hex, inGamut }] for each stop.
export function paletteStops(palette, controls, stops) {
  const mode = controls.toneMode || "perceptual";
  if (mode === "perceptual" || mode === "peak") return okhslStops(palette, controls, stops, mode);
  const shift = palette.hueShift ?? 0; // edge hue rotation: ±deg at the ends
  const sameDir = palette.hueSameDir === true; // true = both ends bend the SAME way (|s|), else opposite (s)
  const ctl = {
    curve: controls.curve,
    lmin: controls.lmin,
    lmax: controls.lmax,
    tension: controls.tension,
  };
  const lift = palette.lift ?? 0;
  // chromaEnvelope per stop, computed ONCE (C7: exactly one call site) — the anchor stop is guaranteed
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
  // anchorChroma — the anchor stop's OWN emitted chroma, by the SAME formula the per-stop map below
  // uses at stop 500 (relChroma-aware, and tone/hue-aware via toneAt/baseHue — lift- and skew-displaced,
  // never the hue's independent cusp). #681 U3 pass 3: this is the root-cause fix for the lift-sign x
  // hue-cusp-tone mechanism Q7 measured — `target`/`pk` are calibrated against the hue's OWN theoretical
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
    // multiplier and caps at the per-stop ceiling — the chroma is a constant target shaped by the
    // envelope, then clamped. Relative mode scales EACH stop by its OWN gamut ceiling, so every hue
    // fills the same fraction of its gamut envelope and palettes read as equally saturated regardless
    // of hue. min(·, maxc) keeps it in-gamut either way.
    const intended = controls.relChroma ? (palette.chroma / 100) * maxc : target; // un-damped chroma for this stop
    // evenChroma: scale intended by chromaEnvelope's multiplier (exactly 1 at ANCHOR_STOP, by
    // construction — the edge damping starves the light/dark ends, never the anchor), then apply the
    // chroma FLOOR on the envelope itself — for a LOW-chroma palette the light stops collapse to near-
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
// and the 25-stop export ramp still agree at every shared stop.
function effStop(stop, palette) {
  const sLift = liftStop(stop, palette.lift ?? 0);
  const p = Math.min(1, Math.max(0, (sLift - 50) / 900)) ** (3 ** ((palette.skew ?? 0) / 100)); // skew>0 -> gamma>1 -> lighter mids
  return 50 + 900 * p;
}

function okhslStops(palette, controls, stops, mode) {
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
  // keyS — REQ-052, the same "key colour" prime.mjs reads (src/engine/prime.mjs): the palette's own
  // chroma/hue rendered at the hue's CUSP tone (baseHue, keyChroma, pk.tone), measured back through
  // OKHSL. This is the ramp's saturation BASIS at the anchor stop now, in place of the old "chroma% of
  // the sRGB gamut" fraction (palette.chroma/100 read as if it were already an OKHSL saturation — two
  // quantities that don't coincide, e.g. Info: chroma% 0.400 vs key.s 0.289). Every other stop scales
  // this by chromaEnvelope below, which is exactly 1 at the anchor, so the anchor stop always renders at
  // 100% of the key colour's own saturation — never "chroma% of gamut" damped toward a multiplier.
  const keyChroma = ((palette.chroma ?? 0) / 100) * pk.c;
  const keyS = rgbToOkhsl(hctToRgb(baseHue, keyChroma, pk.tone).rgb).s;
  // chromaEnvelope per stop, computed ONCE (C7: exactly one call site) — shared by the stop-500 hue seed
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
  // anchorChroma — the anchor's own emitted CAM16 chroma, rendered the SAME way every other stop is
  // below (#681 U3 pass 5, restoring pass 4's OKHSL-path anchor cap but SCOPED TO PEAK ONLY per the
  // owner's ruling on Q7: perceptual keeps #55's cusp-pull richness untouched, with its own bounded,
  // named exemption applied separately below; peak is already SUPPOSED to center richness at 500
  // (hpg-tonal-okhsl-modes), so capping there is consistent with peak's own definition, not in tension
  // with it the way it was for perceptual. At stop === ANCHOR_STOP the cap below is a proven no-op
  // (same formula, same inputs).
  const anchorT = 1; // peak mode always pins t=1 (see `t` below) — anchorChroma must match that basis
  const anchorL = lightnessAt(ANCHOR_STOP, anchorT);
  const anchorS = Math.min(1, Math.max(0, keyS * envelopeAt.get(ANCHOR_STOP)));
  const anchorChroma = cam16FromRgb(okhslToRgb(hOk, anchorS, anchorL)).chroma;
  const dampAmp = controls.dampAmp ?? 0;
  // solveLForTone — the OKHSL lightness l in [0,1] that renders CIE L* == targetTone at a FIXED hue/s
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
  // refineNearestRgb — a final 8-bit-quantization-aware polish (#681 U3 pass 4/5). Measuring chroma/tone
  // back from ROUNDED 8-bit RGB introduces noise the continuous joint solve above can't predict (up to
  // ~0.15 L*, ~0.1-0.2 chroma). Sweeps a few nearby continuous tone offsets through the validated HCT
  // engine (exploring different rounding cells) plus a +-2-per-channel integer RGB neighbor search, both
  // bounded by the TRUE chromaCeiling (never the margin-reduced target), picking whichever candidate
  // minimizes |measuredTone - targetTone|.
  const refineNearestRgb = (rgb, hueCam16, targetTone, chromaCeiling) => {
    let best = rgb, bestErr = Math.abs(lstarFromRgb(rgb) - targetTone);
    const consider = (cand) => {
      if (cand.some((v) => v < 0 || v > 255)) return;
      if (cam16FromRgb(cand).chroma > chromaCeiling + 1e-6) return;
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
    // saturation = the key colour's own OKHSL s (keyS), shaped by chromaEnvelope — the SAME envelope the
    // even path uses (so damp/dampCurve/dampAmp/dampBias stay meaningful here too), clamped to [0,1].
    const s0 = Math.min(1, Math.max(0, keyS * envelopeAt.get(stop)));
    let s = s0, l1 = l;
    let rgb = okhslToRgb(hue, s, l1);
    let chroma = cam16FromRgb(rgb).chroma;
    // Generated PEAK palettes (dampAmp 0) never emit more chroma than the anchor (#681 U3 pass 5, C6's
    // "0 above 100%" clause, peak only — perceptual keeps #55's cusp-pull richness, see below). Holds
    // tone FIXED at its pre-cap value by solving JOINTLY for (s, l): shrink s toward the target chroma,
    // then re-solve l for the held tone, iterating until both hold. Hue stays hOk-derived throughout (no
    // engine switch, no new Abney residual). At stop === ANCHOR_STOP this never fires: same formula as
    // anchorChroma above.
    if (mode === "peak" && dampAmp === 0 && chroma > anchorChroma + 1e-6) {
      const targetTone = lstarFromRgb(rgb); // the pre-cap (natural) tone — held fixed below
      const hueCam16 = (((baseHue + shift * dir) % 360) + 360) % 360; // for the fallback and the polish
      // chroma here is measured back from 8-bit-quantized OKHSL-rendered rgb, same as anchorChroma —
      // independently-quantized measurements can differ by a few hundredths after the loop below lands
      // exactly at the target, so this margin keeps the final measured value strictly under the ceiling.
      const CAP_MARGIN = 0.5;
      const target = anchorChroma - CAP_MARGIN;
      for (let i = 0; i < 12 && chroma > anchorChroma + 1e-6 && chroma > 1e-9; i++) {
        s = Math.max(0, s * (target / chroma));
        l1 = solveLForTone(hue, s, targetTone);
        rgb = okhslToRgb(hue, s, l1);
        chroma = cam16FromRgb(rgb).chroma;
      }
      if (chroma > anchorChroma + 1e-6 || Math.abs(lstarFromRgb(rgb) - targetTone) > 0.01) {
        // Fallback: the joint OKHSL solve didn't converge within tolerance on this cell — cap via the
        // validated HCT engine directly at the anchor's chroma and the held tone, using the SAME rotated
        // CAM16 hue the even path renders with. Guarantees the bound exactly but can reintroduce a small
        // Abney hue residual at THIS stop only (measured in Q7).
        const capped = hctToRgb(hueCam16, Math.min(chroma, target), targetTone);
        rgb = capped.rgb;
        chroma = cam16FromRgb(rgb).chroma;
      }
      // Polish against the 8-bit quantization floor: never past the TRUE anchorChroma (not the
      // margin-reduced target), minimizing the residual tone error the rounding introduces.
      rgb = refineNearestRgb(rgb, hueCam16, targetTone, anchorChroma);
      chroma = cam16FromRgb(rgb).chroma;
    }
    const tone = lstarFromRgb(rgb);                                 // report ACTUAL L* (for graphs / roles)
    const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    // chroma/maxc reported (measured) for the analysis graphs; OKHSL is in-gamut by construction (the
    // HCT fallback above is validated in-gamut too, per its own engine contract).
    return { stop, tone, chroma, maxc: maxChromaInGamut(baseHue, tone), rgb, hex, inGamut: true };
  });
}
