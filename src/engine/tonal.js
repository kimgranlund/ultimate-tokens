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

// hueAnchorFrac — the chroma fraction the ramp's VIVID CENTER stop (500) actually reaches: the nominal
// chroma amplified by the peak damping multiplier (m at stop 500 = 1 + dampAmp/100, since the edge-damp
// term vanishes there), capped at the gamut peak. Anchoring effHue here — not at the raw nominal chroma —
// puts the OKLCH-hue calibration on the saturated swatches the user reads, so they land on the SET hue.
// REQ-005 (0.3.0): `palette.chroma` is the resolved value paletteStops was called with — the absolute
// group target on the group-resolution callers, the palette's own chroma on a direct engine call — so
// the anchor always follows the SAME chroma the ramp itself is built from; no separate factor needed.
export function hueAnchorFrac(palette, controls) {
  const nominal = (palette.chroma ?? 0) / 100;
  return Math.min(1, nominal * (1 + (controls.dampAmp ?? 0) / 100));
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
// damping multiplier m: damp toward intended·m, floor toward chromaFloor% of the gamut but never past
// intended, clamp in-gamut. Factored so the per-stop map AND the stop-500 hue anchor share ONE formula and
// can't drift (the oklch-hue-anchor gate reads the exported hue, so any drift here trips it).
function evenChroma(maxc, intended, m, chromaFloor) {
  const damped = Math.min(intended * m, maxc);
  const floorC = Math.min(((chromaFloor ?? 0) / 100) * maxc, intended);
  return Math.min(maxc, Math.max(damped, floorC));
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
// `w` (a local construction this ruling retires: tying the chroma BLEND to skew was never asked for,
// and it re-threaded `anchorLiftPos` back into the chroma path chromaEnvelope's own liftStop routing
// was built to replace). One small helper, called from both anchored branches, no other construction.
export function anchorChromaBasis(stop, anchorStop, lift, anchorValue, groupValue) {
  const sd = Math.abs(liftStop(stop, lift) - liftStop(anchorStop, lift)) / 450;
  const w = Math.min(1, sd);
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

// anchorWarp(stop, skew, lift) -> { light, w } — w ∈ [0,1], the warped normalized position along
// stop's OWN side of the pivot: w=0 AT the pivot (stop 500, exact — never displaced by lift or
// skew), w=1 AT that side's true endpoint (050 or 950, also never displaced). A caller turns w into
// a value by lerping FROM the pivot's own value TOWARD that side's endpoint value — see anchorLerp.
//
// skew — prime.mjs's own per-side gamma (REQ-053a), made continuous: r^(1/g) on the light side,
// r^g on the dark side (g = 3^(skew/100)), monotone non-decreasing on [0,1] for any g>0 and fixing
// both 0 and 1 exactly (0^k=0, 1^k=1) — same "lighter mids" sign convention skew already has on
// toneAt/prime.mjs (g>1 pulls w up toward 1 faster near the pivot on the light side, and down toward
// 0 slower on the dark side, so BOTH sides read lighter for a given position).
//
// lift — the anchored analog of #648's liftStop, restated per side because the pivot can no longer
// move: a bump `0.5*(1-cos(2*PI*r))` that is 0 at r=0 (the pivot) AND r=1 (the endpoint), peaking at
// r=0.5 — the ladder's own "mid stops" once neither end of a side can move. Displaces r, never adds
// to the output value directly (#648's own displacement-not-addition principle, generalized per
// side), so d(displaced r)/dr must stay positive everywhere for monotonicity to survive under any
// in-domain lift: dr'/dr = 1 + dir*a*bump'(r), |bump'(r)| = |2*PI*sin(2*PI*r)*0.5| = |PI*sin(2*PI*r)|
// <= PI, so |a| < 1/PI keeps dr'/dr > 0 for every r and every sign of dir. ANCHOR_LIFT_SHIFT_MAX caps
// |a| at a safety factor of that bound (mirroring #648's own LIFT_SAFETY), and ANCHOR_LIFT_GAIN is
// picked so lift's persisted domain edge (±40, persist.js) reaches a comfortable 40/45 of the cap —
// same "linear across the whole in-domain range, the cap is a pure out-of-domain safety net" shape
// LIFT_GAIN gives the non-anchored ramp. Sign: lift>0 reads LIGHTER on both sides (matching liftStop's
// own contract) — light side: r increases (moves toward the light endpoint); dark side: r decreases
// (moves away from the dark endpoint, back toward the pivot).
const ANCHOR_BUMP_SLOPE_MAX = Math.PI; // max |d/dr[0.5*(1-cos(2*PI*r))]| over r in [0,1]
const ANCHOR_LIFT_SAFETY = 0.85; // same safety factor as #648's LIFT_SAFETY
export const ANCHOR_LIFT_SHIFT_MAX = ANCHOR_LIFT_SAFETY / ANCHOR_BUMP_SLOPE_MAX; // ~= 0.2706, r-space
export const ANCHOR_LIFT_GAIN = ANCHOR_LIFT_SHIFT_MAX / 45; // lift +-40 domain reaches ~0.89x the cap

// anchorLiftPos(stop, lift) -> signed r' in [-1,1] — the LIFT-ONLY warped position (skew excluded),
// negative on the light side, positive on the dark side: the anchored ladder's analog of #648's
// liftStop, restated per side. Chroma damping keys on THIS (never the raw stop, never the
// skew-warped `w`) — ticket #668's own fix (c4b8962, "the perceptual damping is positioned on the
// lifted stop, not the raw stop, so measured L* stays monotone at the dark end"): a strongly lifted
// side compresses its LIGHTNESS steps toward the pivot/edge, and if the damping still covered the
// stop's full nominal distance, chroma would fall off the OKHSL s=1 clipping cliff across a single
// (near-invisible-in-l) step — CIELAB L* RISES when chroma falls at fixed OKHSL l, so the LADDER
// stays monotone while the MEASUREMENT does not. Positioning damping here makes chroma and
// lightness compress together, same remedy, same reason skew is excluded (a gamma reshapes the
// normalized position, it does not displace it, and #668's own negative control showed skew alone
// never produces an uptick).
export function anchorLiftPos(stop, lift) {
  const light = stop <= 500;
  let r = Math.min(1, Math.abs(stop - 500) / 450);
  if (lift) {
    const a = Math.min(Math.max(lift * ANCHOR_LIFT_GAIN, -ANCHOR_LIFT_SHIFT_MAX), ANCHOR_LIFT_SHIFT_MAX);
    const bump = 0.5 * (1 - Math.cos(2 * Math.PI * r)); // 0 at r=0 (pivot) and r=1 (endpoint), peak at r=0.5
    const dir = light ? 1 : -1;
    r = Math.min(1, Math.max(0, r + dir * a * bump));
  }
  return light ? -r : r;
}
export function anchorWarp(stop, skew, lift) {
  const light = stop <= 500;
  const r = Math.abs(anchorLiftPos(stop, lift));
  const g = 3 ** (skew / 100);
  const w = light ? r ** (1 / g) : r ** g;
  return { light, w };
}
// anchorLerp(pivot, edgeLight, edgeDark, stop, skew, lift) — the piecewise ladder VALUE at `stop`
// (never called at stop===500 — callers special-case the exact pivot/anchor separately), shared by
// okhslStopsAnchored (OKHSL l) and paletteStopsAnchored (CIE L*) so the two paths' warp math can
// never drift apart (the codebase's own "computed identically in both paths" invariant).
// anchorLerp(pivot, edgeLight, edgeDark, stop, skew, lift, curve, tension) — F4 (re-diagnosis Finding
// 2, owner-ruled 2026-09-18: "keep the controls live... compose toneAt's curve, tension... with the
// anchor pivot"): `shape(w, curve, tension)` reuses toneAt's OWN reshaping function on top of
// `anchorWarp`'s pivot-preserving warp fraction `w` (0 at 500, already proven monotone in `stop` under
// any skew/lift — see anchorWarp/anchorLiftPos), the SAME order toneAt itself composes (skew's gamma,
// then curve/tension's shape). shape(0)=0 and shape(1)=1 for every curve (toneAt's own invariant, all
// five cases), so this still fixes the pivot value at stop 500 exactly and the ramp's two true
// endpoints exactly; shape() is non-decreasing on [0,1] (toneAt's own monotonicity proof), so composing
// it with the already-monotone `w` keeps the whole pivot-to-edge blend monotone — no straight/affine
// lerp any more, `curve`/`tension` are no longer dead controls for an anchored palette. `curve` "linear"
// reduces `shape(w,...)` to `w` exactly, giving the ORIGINAL straight-lerp construction back — used
// below by the OKHSL path's own vibrancy blend (see okhslStopsAnchored) as the "even" side of that mix.
function anchorLerp(pivot, edgeLight, edgeDark, stop, skew, lift, curve, tension) {
  const { light, w } = anchorWarp(stop, skew, lift);
  const q = shape(w, curve, (tension ?? 0) / 100);
  return light ? pivot + (edgeLight - pivot) * q : pivot - (pivot - edgeDark) * q;
}

// paletteStopsAnchored — the even (CIE L*) path's anchored branch: `toneAt`'s piecewise analog,
// pivoting on (500, the anchor's own measured L*), now composing toneAt's own curve/tension shape
// through anchorLerp (F4, see its comment) instead of a straight lerp. Hue: "cam16" hueSpace (F4) holds
// the anchor's OWN measured CAM16 hue constant across the ramp — no Abney solve needed, we already have
// the real value; "oklch" hueSpace solves the CAM16 hue that reproduces the anchor's own OKLCH hue
// reading at the anchor's actual chroma/tone (mirroring the non-anchored path's own stop-500
// calibration in `paletteStops`), so a stop's PERCEIVED (OKLCH) hue stays closer to constant as
// chroma/tone move away from the pivot. Chroma is routed through the shared `chromaEnvelope` (see its
// own comment above `liftStop`) — verbatim, not forked. Q-U2-5 ruling (revision 17, team-lead, applying
// the owner's F4 principle: keep REQ-002 as ratified, fix the construction to satisfy it): the BASIS
// chromaEnvelope's shoulder/damp multiplier is applied to is a BLEND, not the anchor's own chroma read
// unconditionally at every stop — exactly the anchor's own measured CAM16 chroma AT the pivot (w=0,
// stop 500, byte-exact, matching the explicit stop-500 special case below), shading to the group's
// resolved ramp target (`palette.chroma`, i.e. `rampChromaOf`'s output — REQ-002's own "Base chroma
// moves every ramp in the group" contract) at each side's true endpoint (w=1). `w` is `anchorWarp`'s
// own per-side warp fraction (already governing how TONE bends pivot->edge above), not a second,
// independently-defined position — this file's own "computed identically" invariant.
function paletteStopsAnchored(palette, controls, stops, anchor) {
  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;
  // hueSpace (F4): "cam16" holds the anchor's own measured CAM16 hue constant (no solve, we already
  // have the real value); "oklch" solves the CAM16 hue reproducing the anchor's own OKLCH hue reading
  // at its actual chroma/tone — see this function's own header comment.
  const targetOklchHue = rgbToOklchHue(anchor.rgb);
  const baseHue = controls.hueSpace === "oklch"
    ? solveCam16Hue(targetOklchHue, anchor.cam.chroma, anchor.lstar)
    : anchor.cam.hue;
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
  const maxc500 = maxChromaInGamut(baseHue, anchor.lstar);
  const anchorRelFrac = maxc500 > 0 ? Math.min(1, anchor.cam.chroma / maxc500) : 0;
  const pk = peakC(baseHue).c; // the BASE hue's max chroma in sRGB — same basis paletteStops's own `target` uses
  const groupTarget = (palette.chroma / 100) * pk;
  const lift = palette.lift ?? 0;
  return stops.map((stop) => {
    if (stop === 500 && !clamped) {
      return {
        stop, tone: anchor.lstar, chroma: anchor.cam.chroma,
        maxc: maxc500, rgb: anchor.rgb, hex: anchor.hex, inGamut: true,
      };
    }
    const tone = anchorLerp(pivotTone, controls.lmax ?? 100, controls.lmin ?? 5, stop, palette.skew ?? 0, palette.lift ?? 0, controls.curve, controls.tension);
    const s = (stop - 500) / 450;
    const dir = sameDir ? -Math.abs(s) : s;
    const hue = (((baseHue + shift * dir) % 360) + 360) % 360;
    const maxc = maxChromaInGamut(hue, tone);
    const env = chromaEnvelope(stop, 500, lift, controls);
    const anchorIntended = controls.relChroma ? anchorRelFrac * maxc : anchor.cam.chroma;
    const groupIntended = controls.relChroma ? (palette.chroma / 100) * maxc : groupTarget;
    const intended = anchorChromaBasis(stop, 500, lift, anchorIntended, groupIntended);
    const chroma = evenChroma(maxc, intended, env, controls.chromaFloor);
    const out = hctToRgb(hue, chroma, tone);
    const hex =
      "#" +
      out.rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    return { stop, tone, chroma, maxc, rgb: out.rgb, hex, inGamut: out.inGamut };
  });
}

// paletteStops — full per-stop pipeline for one palette.
// palette: { hue, chroma, skew, lift }; controls: DEFAULT_CONTROLS-shaped.
// Returns [{ stop, tone, chroma, maxc, rgb, hex, inGamut }] for each stop.
export function paletteStops(palette, controls, stops) {
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
    const c500 = evenChroma(maxc500, intended500, 1 + (controls.dampAmp ?? 0) / 100, controls.chromaFloor); // s=0 ⇒ m = 1 + dampAmp/100
    baseHue = solveCam16Hue(palette.hue, Math.max(c500, 8), tone500); // floor the solve chroma so the hue stays well-defined for near-greys
  } else {
    baseHue = palette.hue;
  }
  const pk = peakC(baseHue).c; // the BASE hue's max chroma in sRGB
  const target = (palette.chroma / 100) * pk; // control is % of the BASE-hue peak
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
    // Differential damping curve — a per-stop chroma multiplier m(stop):
    //   • falloff (dampCurve, γ) shapes WHERE damping bites: low = broad (into the
    //     mids), high = confined to the extreme ends.
    //   • amplify (dampAmp) boosts the mids toward the ceiling (m can exceed 1);
    //     it peaks at stop 500 and tapers to 0 at the ends, so it never fights the
    //     edge damp. The min(·, maxc) clamp keeps every result in-gamut.
    //   • bias (dampBias) tilts damping toward the dark (>0) or light (<0) end.
    // Defaults γ=1.5, amp=0, bias=0 reproduce the legacy 1 − damp·u^1.5 curve.
    const uG = Math.abs(s) ** (controls.dampCurve ?? 1.5);
    const sideW = Math.max(0, 1 + ((controls.dampBias ?? 0) / 100) * Math.sign(s));
    const m = Math.max(
      0,
      1 + ((controls.dampAmp ?? 0) / 100) * (1 - uG) - (controls.damp / 100) * sideW * uG,
    );
    // Chroma basis (controls.relChroma): default scales the base-hue PEAK target by the damping m and
    // caps at the per-stop ceiling — the chroma is a constant target shaped by damping, then clamped.
    // Relative mode scales EACH stop by its OWN gamut ceiling, so every hue fills the same fraction of
    // its gamut envelope and palettes read as equally saturated regardless of hue. min(·, maxc) keeps
    // it in-gamut either way (m can exceed 1 via dampAmp).
    const intended = controls.relChroma ? (palette.chroma / 100) * maxc : target; // un-damped chroma for this stop
    // evenChroma: damp toward intended·m, then apply the chroma FLOOR — the edge damping starves the
    // light/dark ends, so for a LOW-chroma palette the light stops collapse to near-white (the "dead
    // zone"); the floor lifts each stop back toward INTENDED, up to chromaFloor% of the stop's gamut but
    // NEVER above intended (a muted palette stays muted, a neutral stays neutral, saturated stops already
    // clamp at/near maxc so the floor never binds). Shared with the stop-500 hue anchor so they can't drift.
    const chroma = evenChroma(maxc, intended, m, controls.chromaFloor);
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
// and the 25-stop export ramp still agree at every shared stop.
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
// needed, we already have the real value); "oklch" hueSpace solves the OKHSL hue reproducing the
// anchor's own OKLCH hue reading at its actual saturation/lightness (mirroring the non-anchored
// `okhslStops`'s own stop-500 calibration).
function okhslStopsAnchored(palette, controls, stops, anchor, mode) {
  const shift = palette.hueShift ?? 0;
  const sameDir = palette.hueSameDir === true;
  const targetOklchHue = rgbToOklchHue(anchor.rgb);
  const hOk = controls.hueSpace === "oklch"
    ? solveOkhslHue(targetOklchHue, anchor.okhsl.s, anchor.okhsl.l)
    : anchor.okhsl.h;
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
  const pivotL = anchor.lstar < RAMP_L_MIN ? okhslLAtChromatic(RAMP_L_MIN, hOk, anchor.okhsl.s)
    : anchor.lstar > RAMP_L_MAX ? okhslLAtChromatic(RAMP_L_MAX, hOk, anchor.okhsl.s)
    : anchor.okhsl.l;
  return stops.map((stop) => {
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
    const hue = (((hOk + shift * dir) % 360) + 360) % 360;
    // Saturation basis (re-diagnosis Finding 1, Q-U2-5 ruled): routed through the shared
    // `chromaEnvelope`, keyed on `liftStop` (dropping `anchorLiftPos`'s own separate lift-position/
    // damping math entirely — the envelope's own `sd = (liftStop(stop,lift) - liftStop(anchorStop,
    // lift))/450` already IS that computation, parametrized so env(500)=1 exactly for any lift). The
    // BASIS multiplied by that envelope is `anchorChromaBasis` (see its own header comment, shared
    // verbatim with `paletteStopsAnchored`): the anchor's own OKHSL `s` at the pivot (liftStop position
    // 0), shading to `palette.chroma/100` — the group's resolved ramp target, mirroring `okhslStops`'s
    // own `s = (palette.chroma/100)*m` formula exactly — at each side's endpoint (liftStop position 1),
    // by the SAME liftStop position the envelope itself keys on, never `anchorWarp`'s skew-warped `w`.
    // No notch by construction: env(500)=1 and the basis's own liftStop position is 0 at the pivot, so
    // `s` reduces to `anchor.okhsl.s` exactly as a stop approaches 500.
    const env = chromaEnvelope(stop, 500, palette.lift ?? 0, controls);
    const anchorIntendedS = anchor.okhsl.s;
    const groupIntendedS = Math.min(1, Math.max(0, palette.chroma / 100));
    const intendedS = anchorChromaBasis(stop, 500, palette.lift ?? 0, anchorIntendedS, groupIntendedS);
    const s = Math.min(1, Math.max(0, intendedS * env));
    const rgb = okhslToRgb(hue, s, l);
    const tone = lstarFromRgb(rgb);
    const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    return { stop, tone, chroma: cam16FromRgb(rgb).chroma, maxc: maxChromaInGamut(anchor.cam.hue, tone), rgb, hex, inGamut: true };
  });
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
  // The palette's hue in OKHSL space — constant across the ramp when hueShift=0. For an OKLCH-hue palette,
  // SOLVE it directly so the KEY stop (500) reads back at the SET OKLCH hue, anchored at that stop's OWN
  // saturation + lightness in the render space (kills the Abney drift the CAM16 proxy left — worst in the
  // blues, ~6°). For a CAM16-hue palette the hue IS a CAM16 hue, so carry baseHue through OKHSL as before.
  let hOk;
  if (controls.hueSpace === "oklch") {
    const s500 = Math.min(1, Math.max(0, (palette.chroma / 100) * (1 + (controls.dampAmp ?? 0) / 100))); // sp=0 ⇒ m = 1 + dampAmp/100
    const v = palette.cuspPull ?? controls.vibrancy ?? 0;
    const t500 = mode === "peak" ? 1 : Math.max(0, Math.min(1, v / 100));
    const l500 = lightnessAt(500, t500);                           // stop-500 lightness (even↔cusp blend, warped)
    hOk = solveOkhslHue(palette.hue, s500, l500);
  } else {
    hOk = rgbToOkhsl(hctToRgb(baseHue, pk.c, pk.tone).rgb).h;
  }
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
    // saturation = chroma% of the gamut, shaped by the SAME damping multiplier m as the even path (so
    // damp/dampCurve/dampAmp/dampBias stay meaningful here), clamped to OKHSL's [0,1].
    const sp = (stop - 500) / 450;
    const dir = sameDir ? -Math.abs(sp) : sp;
    const hue = (((hOk + shift * dir) % 360) + 360) % 360;
    const uG = Math.abs(sp) ** (controls.dampCurve ?? 1.5);
    const sideW = Math.max(0, 1 + ((controls.dampBias ?? 0) / 100) * Math.sign(sp));
    const m = Math.max(0, 1 + ((controls.dampAmp ?? 0) / 100) * (1 - uG) - (controls.damp / 100) * sideW * uG);
    const s = Math.min(1, Math.max(0, (palette.chroma / 100) * m));
    const rgb = okhslToRgb(hue, s, l);
    const tone = lstarFromRgb(rgb);                                 // report ACTUAL L* (for graphs / roles)
    const hex = "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
    // chroma/maxc reported (measured) for the analysis graphs; OKHSL is in-gamut by construction.
    return { stop, tone, chroma: cam16FromRgb(rgb).chroma, maxc: maxChromaInGamut(baseHue, tone), rgb, hex, inGamut: true };
  });
}
