# Knowledge 02: Tonal-Scale Generation

> Topic: how a palette's per-stop tone (L\*) and chroma are computed from the global
> controls plus a palette's `{hue, chroma, skew, lift}`. All formulas are literal.

## Table of Contents
1. Stops
2. Global controls and defaults
3. Tone curves (the five `shape` functions)
4. `toneAt`: tone per stop
5. Chroma targeting and edge damping
6. `paletteStops`: the per-stop pipeline
7. Worked example
8. Palette groups, base chroma, and the prime system (per-palette whole-ramp damper times a global k, seven prime swatches)
9. Anchored palettes (a stored source colour, exact at `prime.DEFAULT` at Prime chroma 100, and at stop 500 at Base chroma 100)

---

## 1. Stops

- **Display stops** (`STOPS`): 50, 100, 150, … 950 (step 50) → 19 stops. Shown in the grid.
- **Extra export stops** (`EXTRA_STOPS`): 75, 125, 175, 825, 875, 925. Export-only; not in
  the grid.
- **Export stops** (`EXPORT_STOPS`): union of the above, sorted → 25 stops. All exports use
  this set.
- **Landmarks** (conceptual, not exported constants): stop 500 is the prime / chroma-peak tone, 450 the light prime, 550 the dark prime. The resolution layer maps the prime accent to 550 (light) / 450 (dark) per `accentRef:"mode"`, or 500 for `"single"`.

> 💡 The grid intentionally shows fewer stops than exports carry. The extra half-steps
> (075/125/175/825/875/925) exist so the semantic layer can reference fine surface
> elevations (e.g. `surface = 125`) without cluttering the editing grid.

## 2. Global controls and defaults

> ⚠️ **`toneMode` selects the whole ramp algorithm and defaults to `perceptual`, not the curve-driven path below.** `toneMode ∈ {perceptual (default), even, peak}`. The `curve`/`relChroma`/`chromaFloor` controls in this table and the `toneAt` math in §3–§4 apply to **`even` mode only** (on `ramp@2`, `chromaFloor` also sets the band tint in every mode, §9); `perceptual`/`peak` go through the OKHSL path (`okhslStops`), shaped by `lmin`/`lmax`/`damp`/`vibrancy`. `skew` and `lift` are the exception: both apply in every tone mode, since #647 wired them into `okhslStops` via the shared `liftStop` helper. The additional defaults not yet tabled here, `relChroma` (false), `chromaFloor` (40), `toneMode` (perceptual), `vibrancy` (50, since T-0014), `onColorMode` (contrast, since #662), `accentRef` (mode), `matchPeerLightness` (false, schema v11, read by `ramp@2` only, §9), live in `DEFAULT_CONTROLS` in `tonal.js`. `baseIntensity` and `primeChroma` (100 each, §8) are NOT engine controls: SPEC 0.3.0 retired both from `tonal.js`'s `DEFAULT_CONTROLS` entirely, they live only on the document/UI side (`src/ui/persist.js` `DOMAINS`), as the two global fallbacks the palette-group resolvers in §8 read.

> ⚠️ **`peak` was the tone mode least suited to accent-on-text use, and #662 is why it no longer is.** Peak pins vibrancy at 100 and anchors the hue's cusp at stop 500, which pushes the accent fills toward the chroma peak and away from either ramp end. Under the pre-#662 fixed on-color policy that made it the worst of the three by a wide margin: measured on the default document, dark-scheme Secondary 1.24:1, Success 1.58:1, Info 2.44:1 and Warning 2.52:1 against their pinned light on-color, all far under WCAG AA 4.5:1 and under the MCP lint's advisory 3.0 floor as well. Those numbers were a property of the ON-COLOR, not of peak's ramp: with the contrast policy and its achromatic fall-through now the default (ADR-025), peak clears 4.5:1 in all 32 cells and is the highest-contrast of the three modes. Peak's ramp is unchanged, pick it for vivid mid-stops, and read this as the record of why it once carried an accessibility caveat.

| Control | Range | Default | Purpose |
|---------|-------|---------|---------|
| `curve` | linear / sine / cubic / logistic / exp | `logistic` | tone-distribution shape |
| `tension` | 0–100 | 0 | steepness of logistic/exp only |
| `lmin` | 0–40 | 5 | darkest L\* (stop 950 end) |
| `lmax` | 60–100 | 100 | lightest L\* (stop 050 end) |
| `damp` | 0–100 | 80 | edge chroma damping strength (amount) |
| `dampCurve` | 0.5–4 | 1.5 | falloff exponent γ, where damping bites (low = broad into mids, high = confined to the ends) |
| `dampAmp` | 0–100 | 0 | mid-tone chroma amplify, boosts the mids toward the gamut ceiling (multiplier > 1) |
| `dampBias` | -100..100 | 0 | light(−)↔dark(+) asymmetry of the damping |
| `hueSpace` | cam16 / oklch | oklch | how input hues are read (default flipped to OKLCH; cam16 stays selectable, and legacy cam16 docs carry `hueSpace:"cam16"` explicitly); on an anchored palette it holds the measured hue of the anchor constant in the chosen hue space (anchor verbatim at stop 500, rung 3 and the k-100 key; §9, ADR-031) |
| `theme` | auto / light / dark | auto | UI appearance only (not exported) |

Per-palette: `{ name, hue 0–360, chroma 0–100, skew -100..100, lift -40..40, hueShift -60..60, hueSameDir:bool, on:bool, anchor?, sourceAnchor? }`.
`anchor` and `sourceAnchor` are the two fields #681 added (`src/ui/persist.js`, `DOMAINS.palette`): each is a
6-digit hex string or absent, never a fitted value. `anchor` is the palette's **stored source colour**, and a
palette that carries one renders through the anchored construction in §9 instead of the plain `toneAt`/envelope
path in §4–§5. `sourceAnchor` is the generator's own copy of the same hex, written by `scripts/gen-categories.mjs`
and by `defaultDocument()` and never edited by the UI, so the inspector's Reset action has something to restore
after a hue or chroma edit moves `anchor` off its source (§9; T-0045: the edit re-seeds `anchor` at the new hue and the same tone instead of deleting it).
`hueShift` is the **edge hue rotation** about stop 500: per-stop hue = baseHue + hueShift·s (s=(stop−500)/450), `hueSameDir=false` (default) torsions the two ends in OPPOSITE directions; `hueSameDir=true` makes BOTH ends bend the SAME way, matching the light end (per-stop hue = baseHue − hueShift·|s|, so light+20/dark−20 becomes light+20/dark+20). 0 = flat (the hue-stability default).

## 3. Tone curves (the five `shape` functions)

`shape(p)` remaps a normalized position `p ∈ [0,1]` (0 = lightest end / stop 050,
1 = darkest end / stop 950) to `q ∈ [0,1]`. `ten = tension/100`.

```
linear:    q = p
sine:      q = 0.5 - 0.5*cos(π*p)                       // eased both ends
cubic:     q = p<0.5 ? 4p^3 : 1 - (-2p+2)^3 / 2         // cubic in/out
logistic:  k = lerp(4,16,ten); f(x)=1/(1+e^(-k(x-0.5)));
           q = (f(p)-f(0)) / (f(1)-f(0))                // normalized sigmoid
exp:       k = lerp(0.4,5,ten); q = (e^(k p) - 1)/(e^k - 1)
```

`tension` only affects logistic and exp (the UI disables the control otherwise).

| Curve | Character |
|-------|-----------|
| linear | evenly spaced lightness steps |
| sine | eased ends, steepest at mid |
| cubic | gentle ends, fast middle |
| logistic | flat near 050/950, distinct mid tones (default) |
| exp | compressed lights, expanded darks |

## 4. `toneAt`: tone per stop

```
liftStop(stop, lift):                    // #648: lift DISPLACES the stop, it does not add L*
  if lift == 0: return stop
  A = clamp(lift * 6, -243.51, +243.51)  // stops of displacement; 6 per unit of lift
  w = 0.5 * (1 + cos(π * (stop - 500) / 450))   // 1 at 500, 0 at 050/950
  return stop - A * w                    // lift>0 -> read a LIGHTER stop -> lighter mids

toneAt(stop, skew, lift):
  s = liftStop(stop, lift)
  p = (s - 50) / 900                     // 0 at 050 (light) .. 1 at 950 (dark)
  g = 3 ^ (skew/100)                     // skew>0 -> gamma>1 -> lighter mids (peak drifts light)
  p = p ^ g
  q = shape(p)
  t = lmax - (lmax - lmin) * q
  return clamp(t, lmin, lmax)            // a no-op safety net: q∈[0,1] keeps t in range already
```

- **skew** warps the tone distribution via a gamma on `p`. Positive skew lightens the
  mid-tones (the visual chroma peak drifts toward lighter stops).
- **lift** DISPLACES the stop along the ramp and reads the unchanged curve there, by
  `A · w(stop)` stops where `A = clamp(lift × 6, ±243.51)` and `w` is a cosine weight that
  is 1 at stop 500 and 0 at both ends. It used to ADD a cosine-weighted L\* bump; that form
  ignored the curve's local slope, so on a flat light end it reversed the ramp and the final
  clamp flattened stops 050–300 into six identical swatches (#648). Displacing the stop is
  monotone for any lift by one closed-form bound, `|A| · π/900 < 1`, which holds for every
  curve, skew, tension, `lmin` and `lmax`. Still used to nudge a palette's mid lightness
  (e.g. Warning gets `lift −36`), but because the shift rides the curve, a given lift moves
  the tone furthest where the ramp is STEEPEST, its effect in L\* is not a fixed amount, and
  it is attenuated relative to the old additive bump. `skew` and `lift` apply in every tone
  mode: #647 wired them into the `perceptual`/`peak` OKHSL distributions through this same
  `liftStop` helper.
- **The form above is pinned, and an anchored palette does not use it directly.** `toneAt` as written
  is the exact shipped function (`src/engine/tonal.js`, `export function toneAt(stop, skew, lift,
  { curve, lmin, lmax, tension })`), and its monotonicity is a property of the construction, not of the
  trailing clamp: `liftStop` is strictly increasing in `stop`, `p^g` preserves order for any `g > 0`,
  every `shape()` is non-decreasing, and `t = lmax - (lmax - lmin)·q` inverts `q`. The clamp is a safety
  net that never fires. A palette carrying an `anchor` (§9) replaces this call with `anchorLerp`, which
  evaluates `toneAt` on a normalised 0..1 control and re-maps each side so the curve passes through the
  anchor's own L\* at stop 500. Curve, tension, skew and lift all stay live there: `anchorLerp` is
  `toneAt` with a pivot, not a straight lerp to `lmin`/`lmax`.

## 5. Chroma targeting and edge damping

```
hue    = hueSpace=="oklch" ? solveCam16Hue(palette.hue, chroma@500, tone@500)  // solve the CAM16 hue directly in the RENDER space at stop 500's ACTUAL chroma+tone so the key stop EXPORTS at the set OKLCH hue (kills the Abney residual a peak-tone proxy left, worst in the blues); effHue seeds only the gamut basis
                        : palette.hue                        // cam16 hue passes straight through
pk     = peakC(hue).c                     // hue's own max chroma in sRGB
target = (palette.chroma / 100) * pk      // chroma control is % of the hue's peak

for each stop:
  tone  = toneAt(stop, skew, lift)
  cm    = maxChromaInGamut(hue, tone)     // gamut ceiling at this tone
  env   = chromaEnvelope(stop, 500, lift, controls)    // the shared multiplier, below
  ref   = max(maxChromaInGamut(h0, t) for t in [tone@500, tone@450, tone@550])
                                          // the floor's gamut reference, per stop (#766): the widest of the pivot and its first display steps, read at THIS
                                          // stop's own hue h0 BEFORE edge rotation (the per-stop solved CAM16 hue on the anchored OKLCH path; hue above otherwise)
  C     = evenChroma(cm, target, env, chromaFloor, ref)   // min(cm, max(min(target*env, cm), floorC))
                                          // floorC = min((chromaFloor/100) * min(cm, ref), target)  (#701)
  rgb   = hctToRgb(hue, C, tone).rgb

chromaEnvelope(stop, anchorStop, lift, controls):      // src/engine/tonal.js, ONE definition
  sd    = (liftStop(stop, lift) - liftStop(anchorStop, lift)) / 450   // keyed on the LIFTED reading
  isEven = toneMode == "even"                          // perceptual and peak take the OKHSL map
  damp   = isEven ? 100 - (100 - damp) * EVEN_DAMP_FACTOR                     // 0.25
                  : 100 - 100 * clamp01((100 - damp)/100) ^ OKHSL_DAMP_RESIDUE_EXP
                                          // OKHSL_DAMP_RESIDUE_EXP = ln(1 - OKHSL_DAMP_D)/ln(0.3), OKHSL_DAMP_D = 0.9275 (#725)
  γ      = (isEven ? EVEN_DAMP_FACTOR : OKHSL_DAMP_CURVE_GAIN) * dampCurve    // OKHSL_DAMP_CURVE_GAIN = log2(3)/1.5
  uG     = |sd| ^ γ
  if isEven: uG *= smoothstep(min(1, |sd| / EVEN_NEIGHBOURHOOD_R))   // R = 0.2; flat start at the anchor (#701)
  sideW  = max(0, 1 + (dampBias/100)*sign(sd))
  shoulder = (dampAmp/100) * 4 * uG * (1 - uG)         // 0 at sd=0 AND |sd|=1: shoulders only
  return max(0, 1 + shoulder - (damp/100)*sideW*uG)
```

- **One envelope, four call sites (#681 U3).** `chromaEnvelope` replaced the two separately-typed copies
  of the multiplier this section used to call `m`: one exported definition in `src/engine/tonal.js`,
  called by the even path and the OKHSL path and, since U2's repair, by both anchored branches as well.
  Three properties the callers rely on: it keys on `liftStop(stop, lift)` rather than the nominal stop
  (the #648 displacement helper, the same call `effStop` makes before skew's gamma, so a lift can never
  reopen the measured-L\* upticks of #668); `env(anchorStop) = 1` exactly, for any lift and any control
  combination, so the pivot is continuous with its neighbours by construction; and `dampAmp` now enters
  as a `4·uG·(1-uG)` SHOULDER term that is 0 both at the pivot and at each end, so it can only raise the
  shoulders, never the pivot. That last shape is why `VIVID_MIDS.dampAmp` ships at 0 rather than 55
  (Q7): the envelope is normalised at 500, so a non-zero `dampAmp` can only push a shoulder above the
  pivot's own chroma, which C6 forbids.
- **`even` mode damps differently, and that is deliberate.** `EVEN_DAMP_FACTOR` (0.25) both softens
  `damp` toward 100 and cuts the falloff exponent to a quarter in `even` only. This is U3's even-only
  retune: `even`'s `toneAt` sets CIELAB L\* directly, so chroma damping there cannot move measured L\*,
  which makes it the one mode where the exponent can be retuned without reopening the
  Helmholtz-Kohlrausch coupling that reds #668 in the OKHSL-domain modes.
- **`even` also has a flat-start shoulder at the anchor (#701).** `|sd|^0.375` has infinite slope at the
  anchor, so a muted anchor's 450 and 550 read far below its full-chroma 500 (the 64 lone spikes).
  In `even` only, `uG` is multiplied by a smoothstep of `|sd| / 0.2` (`EVEN_NEIGHBOURHOOD_R`, a named
  constant, not a control; R = 0.2 in `sd` units, 0.2 of the 450-stop half-ramp, 90 stop units at lift 0):
  0 at the anchor, 1 from R out. At lift 0 the smoothstep is 1 by stops 400/600 (`|sd|` 0.222), so nothing
  beyond them moves; under lift `liftStop` sets the reach, and above `|lift|` about 14 the near-side 400 or
  600 enters it. `perceptual` and `peak` never take it.
- **Differential damping curve.** With `dampAmp 0, dampBias 0` the shoulder and the tilt drop out,
  leaving `1 - (damp'/100)·uG` with `damp'` and `γ` the mode-mapped values above. That is not the
  legacy `1 - (damp/100)·u^1.5` edge damp in any shipped mode: `even` remaps both sliders since #681 U3
  and #701, and `perceptual` and `peak` since #725 (R69), so `dampCurve 1.5` renders at `γ` 0.375 on
  even and `log2(3)` = 1.585 on perceptual and peak.
  - **`damp`** sets the edge depth (amount); **`dampCurve` (γ)** shapes *where* damping
    bites, low spreads it into the mids, high confines it to the extreme ends.
  - **`dampAmp`** boosts mid-tone chroma toward the ceiling (`m > 1`, peaking at stop 500,
    tapering to 0 at the ends so it never fights the edge damp).
  - **`dampBias`** tilts damping toward the dark (`>0`) or light (`<0`) end, the two ends
    were previously locked together.
- Final chroma is always clamped to the gamut ceiling `cm` (the `min(·, cm)`), so amplify
  can only push *toward* the ceiling and every emitted color stays in sRGB by construction.

**The curve is the spec (ADR-029, #778).** The closed form above is what the gates assert, not rounded
pixels: `test/engine/chroma-envelope-gate.mjs` writes the curve out as its own SPEC and holds every
stop's `env` to it within 1e-12, and holds every emitted pixel within a few 8-bit codes of its stop's
model (`node scripts/report-preset-fidelity.mjs --envelope-residue` prints the residue table). The
named curves are `ENVELOPE_PRESETS` in `src/engine/tonal.js`; each is a setting of the four sliders,
which stay exposed, and `envelopePresetOf` names the preset a control set matches.

| Preset | damp | dampCurve | dampAmp | dampBias | Note |
|---|---|---|---|---|---|
| Default | 80 | 1.5 | 0 | 0 | the kit's `DEFAULT_CONTROLS` |
| Curated | 70 | 1.5 | 0 | 0 | the curated corpus setting; perceptual env(300) 0.744, env(100) 0.230 |
| Calm ends | 92 | 2.6 | 0 | 0 | |
| Vivid mids | 70 | 1.5 | 55 | 0 | the editor chip; not the corpus's `VIVID_MIDS` (`scripts/gen-categories.mjs`, dampAmp 0, the Curated row) |
| Shade-heavy | 84 | 1.5 | 12 | 55 | |
| Tint-heavy | 84 | 1.5 | 12 | -55 | |
| Flat | 35 | 1 | 0 | 0 | |

**An anchored ramp keeps the curve and changes the basis.** On `perceptual` and `peak` the envelope
multiplies the anchor's own OKHSL `s`, held constant at every stop; on `even` it multiplies
`anchorChromaBasis`'s smoothstep blend from the anchor's chroma toward the hue's peak. An anchor
outside [`RAMP_L_MIN`, `RAMP_L_MAX`] renders a clamped pivot. The curve passes through the anchor:
env(500) = 1, and stop 500 emits the anchor verbatim when the pivot is unclamped.

## 6. `paletteStops`: the per-stop pipeline

```
paletteStops(palette, stops) ->
  [ { stop, tone, chroma, maxc, rgb, hex } ]   // one entry per stop in `stops`
```
The grid uses `STOPS`; all exports use `EXPORT_STOPS`. Result objects carry both the applied
chroma and the gamut ceiling (`maxc`) so the analysis plot can draw the ceiling vs. the
applied curve.

## 7. Worked example

Primary default `{hue:267, chroma:95, skew:-20, lift:0}` in **`toneMode:"even"`** (the CIELAB-L* path this section describes; the live default is `perceptual`/OKHSL), curve logistic, tension 0,
lmin 5, lmax 100, damp 80:

- `peakC(267).c` ≈ the hue's sRGB chroma peak; `target = 0.95 * peak`.
- Stop 500: `p=0.5`, `g=3^(-0.2)≈0.803`, `p^g≈0.574`, logistic `shape`≈0.62,
  `t = 100 - 95*0.62 ≈ 41` (mid-dark). `m=1` at stop 500 (when `dampAmp=0`), so `C=min(target, cm500)`.
- Stop 050: `p=0`, tone→`lmax=100` → `hctToRgb` returns white; chroma irrelevant (tone≥100
  branch). This is why every palette's `050` is `#FFFFFF` at `lmax=100`.
- Stop 950: `p=1`, tone→`lmin=5`; heavy damping → near-neutral very dark color.

## 8. Palette groups, base chroma, and the prime system

> Spec: `docs/specs/spec-muted-base-key-spikes.md` (REQ-001..011 palette groups and base chroma;
> REQ-050..057 the prime system); design: `docs/specs/lld-muted-base-key-spikes.md`; current model:
> ADR-030 (#804), which removed the group chroma layer: each palette carries its own Base chroma and
> the two Global-tab sliders are k factors on every palette. Shipped in the engine (`tonal.js`,
> `prime.mjs`, `src/engine/resolve.mjs`) and the UI (`src/ui/model.mjs`, `src/ui/persist.js`). The
> before and after measurement is `docs/reports/2026-10-07-chroma-controls-redesign.md`. The 0.1.0
> "key-stop spike" on the ramp (identity stops, `keyIntensity`) was retired under #533; the ramp
> is continuous and the vivid identity colours live in the prime system (§8.3) below.

### 8.1 Palette groups and base chroma (the ramp)

Every palette resolves to an effective **group**, one of `material`, `brand`, `system`, `data`
(`paletteGroup(p)`, `src/ui/model.mjs`): an explicit `palette.group` if set, else the by-name
default, `neutral` is material; `primary`/`secondary`/`tertiary` are brand; `info`/`success`/
`warning`/`danger` are system; every other palette (the eight data palettes, user-added,
preset-opened) is data. Groups are an editor concept only: they never enter token names, CSS
variables, Figma paths, the role table, or MCP output.

Since #804 (ADR-030) a group carries no chroma value: it is canvas grouping metadata only.

**Base chroma is each palette's own ramp damper, times one global k (#785 R94, #804).** For a palette
`p`, the pure resolver `rampChromaOf(palette, controls)` (`src/engine/resolve.mjs`, called once per
palette by `src/engine/layers.mjs`'s `compute`, the one evaluation both `src/ui/model.mjs`'s
`projectView` and `src/engine/exports.js`'s `derivedAll` read, so the canvas and every export format
can never disagree, ADR-034; the doc-shaped wrapper `rampChromaOf(p, doc)` in
`model.mjs` renames the document's `baseIntensity` to `baseChroma` at that one boundary) computes:

```
rampChromaOf(p, doc) = (p.baseChroma ?? 100) * (doc.baseIntensity ?? 100) / 100
```

and `compute` hands the resolved number to `paletteStops` AS the palette's own
`chroma` (`paletteStops({ ...p, chroma: rampChromaOf(p, doc) }, controls, stops)`), it REPLACES
`palette.chroma` for ramp purposes. Inside `paletteStops` that value `g` is one damper on the whole
ramp: every path renders its stops exactly as at `g = 100` (every floor, cap, tone hold and gamut
step included), then `dampStops` multiplies each stop's emitted chroma coordinate by `r = g / 100`
at the same lightness and hue, OKHSL `s` on perceptual and peak, CAM16 C on even, anchored and
unanchored alike, stop 500 included. `dampStops` is linear with an `r >= 1` no-op, so the product of
the two layers is order-free. At 100 the multiply is the identity (byte-identical); the range is 0
to 100, damp only, and nothing raises a stop above its at-100 render. `palette.chroma` itself feeds
only `deriveKeyColor` (the gallery tile and the prime system, §8.3); the ramp ignores it entirely.
`palette.baseChroma` (UI "Base chroma", palette inspector) is the one per-palette ramp control; the
retired `palette.intensity` is ignored on read (§8.4).

`baseIntensity` (UI "Base chroma", Global tab, default 100) is the global Base chroma k. The field
name is a legacy holdover from the 0.2.0 per-stop multiplier; it is a document/UI-side control, not an
engine one: `tonal.js`'s `DEFAULT_CONTROLS` never defines or reads `baseIntensity`, and `intensityAt`
is deleted (`git grep -n "intensityAt\|baseIntensity\|\.intensity\b" src/engine` returns nothing).

A palette's rendered ramp is byte-identical to the pre-groups engine only for a chroma-100 subject at
Base chroma 100 under k 100 (since #785 a value below 100 is a damper on the at-100 ramp, not the
pre-groups absolute target). The schema-v8 hydrate (§8.4) folds an old document's group base chroma
onto each palette's own `baseChroma`, so a saved kit renders the same ramps after the fold.

### 8.2 Prime chroma resolution (feeds only the prime system and the key tile, §8.3: never the ramp)

The companion resolver, also pure and living in `src/engine/resolve.mjs`:

```
primeChromaOf(palette, controls) = controls.primeChroma ?? 100     // one global k, every palette
```

There is no per-palette or per-group prime value (ADR-030): the v8 hydrate drops a stored
`palette.primeChroma` and the group values. `primeChroma` (UI "Prime chroma", Global tab, default 100)
is independent of `baseIntensity`. `deriveKeyColor` reads the same k, so the gallery key tile equals
the prime middle at every k.

### 8.3 The prime system (`src/engine/prime.mjs`)

The **prime system** is a per-palette set of seven swatches, `brightest · brighter · bright · prime ·
dim · dimmer · dimmest`, lightest first, computed from the palette's key colour (or, for an anchored
palette, from its stored source colour) on their OWN **CIE L\*** ladder. They are primitives-tier tokens, mode-independent (one set, the same in Light and
Dark, REQ-055), emitted as the `prime` group (`--{n}-prime-{step}` with the centre as the bare `--{n}-prime`, `{n}/prime/{step}`, Figma
collection "Color Prime"; knowledge-04). They are NOT ramp stops and NOT roles: the 53-role table is
unchanged and roles never alias prime tokens (knowledge-03 §3).

| Control | Range | Default | Purpose |
|---------|-------|---------|---------|
| `primeChroma` (UI "Prime chroma", global) | 0–100 | 100 | the one global k `primeChromaOf` (§8.2) returns, on every rung of every palette, the anchored `prime` rung included; was `keyIntensity` through schema v2, renamed at v3 (REQ-011, R4) |

`primeSwatches` stays group-unaware: its caller (`src/engine/layers.mjs`'s `compute`, read by both
`projectView` and `derivedAll`) resolves `primeChromaOf(p, controls)` (§8.2) FIRST and calls
`primeSwatches({ ...p, primeChroma: undefined }, { ...controls, primeChroma })`,
and `primeSwatches(palette, controls)` (REQ-050..053a, REQ-056; #537 ruling) reads the k from
`controls.primeChroma` alone:

```
// (a) where the ladder is pivoted - the anchored branch first (#681 U1, §9)
if palette.anchor is a 6-hex string:
  lPrime  = lstarFromRgb(anchor.rgb)        // the STORED source's own CIE L*, exact, no OKHSL round trip
  cKey    = cam16FromRgb(anchor.rgb).chroma //   its own CAM16 chroma
  hue     = cam16FromRgb(anchor.rgb).hue    //   its own CAM16 hue (hueSpace cam16; under oklch each rung solves its own, §9)
else:
  pk      = peakC(effHue(hue, hueSpace, chroma/100))   // the SAME call deriveKeyColor makes
  lPrime  = pk.tone                         // the key colour's own CIE L* by construction
  cKey    = (chroma / 100) * pk.c
  hue     = effHue(...)

// (b) the ladder: CIE L*, equal-compress (#681 U6, Q8/Q9)
STEP_L = 9                                            // CIE L* per rung; total span 6 · STEP_L = 54
[PRIME_L_MIN, PRIME_L_MAX] = [12.25, 96.88]           // DERIVED from the two OKHSL greys, never retyped
lLadder = anchored ? clamp(lPrime, PRIME_L_MIN, PRIME_L_MAX) : lPrime    // Q3 (b): the PRIME rung never moves
{ up, down } = primeSteps(lLadder):
  roomUp = max(0, (PRIME_L_MAX - lLadder) / 3);  roomDown = max(0, (lLadder - PRIME_L_MIN) / 3)
  up = down = min(STEP_L, roomUp, roomDown)           // BOTH sides take the smaller room: equal-compress
cPrime = max(0, cKey · primeChroma / 100)             // scales every rung, the anchored prime rung included (ADR-030)

// (c) the seven rungs
g      = 3 ** (skew / 100)                            // the ramp's toneAt gamma, reused as the ladder bend
t_i    = (i - 3) / 3;  w_i = i < 3 ? |t_i| ** (1 / g) : |t_i| ** g     // w(prime) = 0, w(ends) = 1
L_i    = i < 3 ? lLadder + 3 · up · w_i : lLadder - 3 · down · w_i
hue_i  = hue + hueShift · (hueSameDir ? -|t_i| : t_i)
C_i    = min(cPrime, maxChromaInGamut(hue_i, L_i))    // chroma HELD; only the gamut desaturates a rung
rgb_i  = hctToRgb(hue_i, C_i, L_i)
rgb_3  = anchored && primeChroma == 100 ? anchor.rgb verbatim   // the source byte for byte at k 100
       : anchored ? hctToRgb(hue, min(cPrime, maxChromaInGamut(hue, lPrime)), lPrime)  // follows k
       : rgb_3
```

**Equal-compress, not redistribution.** Up to #655 a side that hit the window handed its shortfall to
the other side, so the total span stayed fixed and the ladder went lopsided. U6 replaced that: both
sides take `min(STEP_L, roomUp, roomDown)`, so `up === down` always and a clipped ladder is SHORTER
rather than asymmetric. `L*(brightest) - L*(prime)` equals `L*(prime) - L*(dimmest)` to 1e-9 by
construction, and within 3 L\* measured from the emitted pixels. The three clipped defaults land at
their compressed spans: Tertiary 52.7805, Danger 49.9212, Warning 46.2664 L\* (`test/engine/prime.mjs`
asserts each at ±0.05).

**Hold the chroma, let the gamut desaturate.** The rungs no longer share a flat OKHSL saturation.
Each is rendered `hctToRgb(hue_i, min(cPrime, maxChromaInGamut(hue_i, L_i)), L_i)`, so a rung keeps
the anchor's own CAM16 chroma wherever sRGB can hold it and only gives it up at the gamut ceiling.
Every rung therefore keeps at least 70% of prime's CAM16 chroma or sits exactly at
`maxChromaInGamut(hue, L)` within 0.5; the gate prints which of the two it is for each rung.

**The widening search at the window bound** (#681 U4 pass 2). At the exact bound, equal-compress reads
0 on BOTH sides at once, which would collapse all six non-prime rungs onto the clamped pivot. When
that happens the LADDER's pivot widens away from the bound by the same amount on each side, in 0.1 L\*
units, until the six rungs plus the anchor are all distinct hexes, capped at one full `STEP_L` of
reserve per side. `up === down` is preserved throughout, and the prime rung never moves (Q3 (b)). A
handful of sampled sources sit close enough to a bound that even a full `STEP_L` cannot separate every
rung; those are named and counted by `test/engine/anchor.mjs`'s `anchor-ladder` order and dupe
allow-lists (26 and 3 respectively at the integrated tree) rather than silently passed.

`skew > 0` still pushes the light inner swatches away from `prime` and pulls the dark ones toward it,
`skew < 0` the reverse, with `prime` and both ends fixed. `lift`, `damp*`, `vibrancy`, `cuspPull` and
`toneMode` do not apply: they shape the ramp, not the prime system. The editor's Color canvas draws
the seven as the `.prime-strip` ahead of each ramp row.

Worked example (engine-regenerated 2026-09-20 from this tree's own `primeSwatches`; `hueSpace
"cam16"`, `primeChroma 100`). Non-anchored, `role-table.json`'s raw `hue 267, chroma 95`, `skew 0`:
`lPrime = 52`, `up = down = 9`; L\*/hex brightest→dimmest `79 #AAC3FF · 70 #82AAFF · 61 #5590FF ·
52 #2177F6 · 43 #0061D3 · 34 #004CA9 · 25 #003880`; `#2177F6` is `deriveKeyColor(Primary)` byte for
byte. With the default `skew -20` the inner four become `68.2930 #7AA5FF · 58.8707 #498AFF ·
40.8221 #005BC9 · 32.5012 #0049A2`, ends and prime unchanged. Warning raw (`hue 70, chroma 100`,
`skew 0`) clips its light side against `PRIME_L_MAX`, so equal-compress takes BOTH steps down to
`up = down = 7.2983`: `brightest = 96.8849 #FFF4EC`, `dimmest = 51.1151 #AB6C00`, span 45.7698 rather
than 54. Anchored, the shipped default-kit Primary (`anchor #0C5DCC`, `skew -20`): prime is
`41.6366 #0C5DCC`, the stored hex verbatim, and the ladder around it reads `68.6366 #7DA6FF ·
57.9296 #4D88F8 · 48.5072 #2E6FDE · [prime] · 30.4587 #00439B · 22.1378 #003276 · 14.6366 #002256`,
span exactly 54. The SPEC's EX-4/EX-4b/EX-5 carry the full tables.

### 8.4 Migration (schema v10)

`CURRENT_SCHEMA_VERSION` is 10 (`src/ui/persist.js`). v5 added `palette.anchor`/`sourceAnchor` (#681
U1) and v6 added `palette.preDetachHue`/`preDetachChroma`/`preDetachLift` (#681 U2), brand-new
optional fields with no `RENAME_MAPS` entry. v7 rewrites a kit saved on the Material preset's old
export prefix triple to `md-color` / `md-typescale` / `md` once, on a document stamped below v7
(#791). v8 (#804, ADR-030) runs `foldGroups` once on a document stamped below v8: every palette
without a numeric `baseChroma` takes its group's stored base chroma (written only when it is not
100), `paletteGroups` and every `palette.primeChroma` are deleted, and both globals are reset to 100
(before v8 they never reached a palette); the same entry moves a vibrancy of exactly 0 (the old
default) to 50. Each drop and each reset of a value other than 100 is reported through
`DROPPED_KEYS` (TKT-0455, loud not silent). A saved prime value below 100 is not kept: the 343
Neutral strips at the retired Material 60 and Adia Primary at 99 move once, by user decision.
v9 (T-0017, #803, ADR-032) runs `migrateGeometry` on a document stamped below v9: geometry becomes the
Maison ladder `{ tier, scale, radius, spaceBase }`, the legacy md height picks the nearest tier and
scale, and every retired key (`treatment`, `baseHeight`, `rampContrast`, `ramp`, geometry
`tokenOverrides`, type overrides on retired UI steps) is reported through `DROPPED_KEYS`. v10 (#788,
ADR-034) runs `stampLayers` on a document that has no `layers` map: every registered compute layer
is pinned at version 1 before the clamp, and `pinsOf` (`src/engine/layer-pins.mjs`) then clamps each
pin to `[1, latest]`.

Hydrating below v4 deletes `palette.intensity` from every palette and reports it through
`DROPPED_KEYS`. `palette.group` is never written by any migration: an old document derives its
group by name on every read via `paletteGroup(p)`.

## 9. Anchored palettes

A palette that carries an `anchor` (§2) was **sampled from a real colour**, and #681 made the engine
say so exactly rather than approximately. Before it, a curated preset stored `{hue, chroma, skew,
lift}` fitted to its source and the engine re-derived a key colour from those four numbers, so the
emitted `prime.DEFAULT` was close to the sampled colour but rarely equal to it. Now the source hex
itself is stored and both of the places a user reads "the" colour reproduce it byte for byte.

**The two exactness guarantees.**

| Guarantee | Scope | Where |
|---|---|---|
| `prime.DEFAULT` equals `anchor` byte for byte | every palette carrying an `anchor`, 3,380 on the regenerated corpus, at Prime chroma k 100 (below it the rung follows k at the anchor's own hue and L\*, ADR-030) | `primeSwatches(...)[3]` returns the anchor's own rgb verbatim at k 100 (§8.3) |
| ramp stop 500 equals `anchor` byte for byte, in all three tone modes, at the palette's Base chroma 100 times the global k 100 (below it the damper scales stop 500 too, §8.1) | the anchored palettes whose source sits INSIDE the ramp window: `[9.95, 95.05]` L\* on `ramp@1` (3,370), `pivotWindow` on `ramp@2` (`[11.73, 94.36]` on perceptual and peak at the defaults, five more sources clamped), with Match peer lightness off | `paletteStopsAnchored` / `okhslStopsAnchored`, the `stop === 500 && !clamped` case |

The two scopes differ on purpose. At the defaults the TOKEN is exact for all 3,380: a source outside the ramp window
still exports its own hex at `prime.DEFAULT`. The RAMP clamps: for the 10 named out-of-window sources
(9 dark ones between 7.32 and 9.84 L\*, plus one pure white; `ramp@2` adds Istanbul (Eminönü), Saint-Malo, Wadi
Rum, Carlsbad and Kea on perceptual and peak, ADR-036) stop 500 lands at the window edge nearest
the source, because forcing the verbatim pixel at a clamped pivot would jump away from the window edge
its own neighbours are shaped around, which is the discontinuity that broke monotonicity before this
branch existed. Both allow-lists are frozen by name and count in the gates, not by a threshold.

**Skew and lift never move either one.** They warp the ramp around the pivot, not through it:
`anchorLerp` (§4) fixes stop 500 and re-maps each side, so a lift of +40 on an in-window anchored
palette leaves stop 500 unchanged while the same edit on a non-anchored copy moves it.

**Chroma at the pivot is a blend, not a pin.** The anchored branches call the same `chromaEnvelope`
(§5) as everything else; what differs is the BASIS fed to it. On perceptual and peak the basis is
the anchor's own OKHSL `s` at every stop (no climb toward the at-100 target). On even, `anchorChromaBasis`
blends the anchor's own measured chroma exactly at the pivot toward the at-100 target (`groupValue` in `tonal.js`) at each side's
endpoint, weighted by a smoothstep on the `liftStop` position, so the weight and its derivative are
both 0 at the pivot. That is what keeps a near-grey anchor from reading as a notch against its own
neighbours. The basis is always computed at 100; a Base chroma product below 100 (the palette's own
value times the global k) then damps the whole anchored ramp by `g / 100` (§8.1), stop 500 included,
so stop 500 is byte-exact to the anchor at a product of 100 only, and an achromatic anchor's ramp
stays achromatic (`r * 0 = 0`).

**The hue space picks the line of constant hue through the anchor (T-0015, ADR-031).** An anchored
palette holds the measured hue of the anchor constant in the chosen hue space: `oklch` holds the
anchor's OKLCH hue, `cam16` its CAM16 hue, and the anchor pixel is verbatim in both, because every
constancy line passes through it. The even ramp (`paletteStopsAnchored`) holds `anchor.cam.hue` under
`cam16` and solves each stop's CAM16 hue to the anchor's OKLCH hue under `oklch`. The perceptual and
peak ramps (`okhslStopsAnchored`) keep the anchor's OKLCH hue under `oklch` and, under `cam16`, solve
each stop's OKHSL hue whose float render carries the anchor's CAM16 hue (`solveOkhslHueForCam16`,
joint with the tone hold), keeping the OKLCH hue where the solve finds no bracketed root or the
candidate is achromatic; the peak cap and `dampStops` keep each stop's own OKLCH hue. The prime ladder
and the key tile below Prime chroma k 100 hold the anchor's CAM16 hue under `cam16` and solve each
rung's CAM16 hue to the anchor's OKLCH hue under `oklch`. On the OKHSL ramps the two lines differ by
at most 0.02 OKLab dE (measured 0.0164 perceptual, 0.0169 peak), so the toggle moves them within
rounding; the ladder and the even ramp move visibly.

**Reset.** Editing `hue` or `chroma` on an anchored palette REMOVES `anchor`: the palette becomes an
ordinary one and `prime.DEFAULT` reverts to the derived key colour. The generator-written
`sourceAnchor` survives the edit, and the inspector shows a Reset action, visible only when
`sourceAnchor` is present and `anchor` is absent, that restores `anchor = sourceAnchor` and re-derives
hue, chroma and lift from it. After Reset the ramp and the prime ladder are byte-identical to the
untouched preset. Skew and lift edits keep `anchor`.

**What the anchored construction costs, stated plainly.** Pinning stop 500 to a sampled colour changes
what "percentage of stop 500" means. C6's median and p90 chroma bars were set against the non-anchored
construction, where stop 500 IS the ramp's designed peak; on the anchored construction it is the
user's own sample, which has no designed relationship to being the peak. Measured on the rendered path
that ships, those bars are **missed in 14 of the 24 checks** (3 modes x 4 stops x median and p90):
6 of 8 in perceptual, 5 of 8 in peak, 3 of 8 in even, against 2 of 24 on the same corpus with the
anchors stripped. This is the Q7 mechanism, and Q7 and #701 cover the above-100%-of-stop-500 clause
ONLY. They do not cover these median and p90 bars, and nothing in #681 brings them back into target.
It is an open owner item, recorded here rather than softened.

For the same reason C6 (iii)'s "0 stops above 100% of stop 500" bar is scoped to the **384
non-anchored** palettes of the 3,764 generated ones, where stop 500 is the designed peak. On the
anchored peak path the equivalent figure is a **ratchet, not a bar**: `test/engine/tonal.mjs` pins
today's violator count and max overshoot and reds only if a later run RISES past either, so a
regression that widens the hole is caught while a silent improvement still passes.

**An achromatic anchor gives the ramp no hue of its own (Ticket #739, ruled 2026-09-23).** A sampled
anchor whose OKLab chroma sits under `ACHROMATIC_ANCHOR_C` (0.002) is a grey, white, or black source:
its own MEASURED hue (the anchor's OKLCH hue on the CIE branch, its OKHSL hue on the OKHSL branch) is
rounding residue, not a colour anyone chose, so the anchor still contributes its own lightness and
(near-zero) chroma at the pivot (on perceptual and peak, the anchor's own `s` read directly in `okhslStopsAnchored`), but the ramp's
hue comes from the palette's own stored `hue` instead, on both anchored branches, in all three tone
modes. The two branches seed that hue differently, as they always have: the OKHSL branch
(`okhslStopsAnchored`, perceptual and peak) uses `palette.hue` directly, since OKHSL hue IS OKLab hue;
the CIE branch (`paletteStopsAnchored`, even) seeds through `effHue(palette.hue, controls.hueSpace,
hueAnchorFrac(palette, controls))`, the same conversion the non-anchored construction uses to turn an
OKLCH-hue palette into a CAM16 seed. A chromatic anchor (OKLab C at or above the constant) is
untouched: it renders from its own hue exactly as before this ticket. `rgbToOkhsl` reads pure black
(`s = 0`, Ticket #681 U10) and pure white (`s = 0`, this ticket) as achromatic; `#FFFFFF`'s OKLab L
rounds to 0.99999999, not exactly 1, so the white guard checks a tolerance rather than `L >= 1`.

**The band rule (`ramp@2`, T-0040, ADR-036).** `ramp@2` matches the extremes across a kit's palettes,
in every tone mode, anchored or not. The band stops (050 to 100 and 900 to 950, `BAND_EDGE`) take one
palette-free L\* ladder, `sharedToneAt(stop, controls)` (stop 100 at L\* 94.91 and stop 900 at 11.18 on
perceptual and peak at the defaults), and one tint, `chromaFloor / 100` of each stop's gamut ceiling:
on the anchored perceptual and peak paths the fraction is capped at the anchor's own gamut fraction, so
an achromatic anchor keeps grey ends (a tint under CAM16's neutral reading renders the exact grey). The
interior is the palette's own construction remapped affinely onto [shared(100), pivot] and [pivot,
shared(900)], its chroma blended toward the tint by a smoothstep of the `liftStop` distance from 500.
The last operation is the pixel snap: each band stop's 8-bit pixel lies within 0.45 L\* of the ladder,
nearest the tint on the stop's hue line, never over its predecessor. The anchored pivot keeps the
verbatim anchor inside `pivotWindow` (the ramp window narrowed by one 0.55 L\* step from the shared
edge); the cost is a compressed interior next to the shared edge for a very dark or very light anchor,
where adjacent stops can share a pixel (declared in ADR-036 and the gates' cited lists). A kit stored
without pins hydrates at `ramp@1` and renders as before; the editor offers "Upgrade to latest".

**Match peer lightness (`matchPeerLightness`, schema v11).** Off by default and read by `ramp@2` only.
On, the tone edge moves to 500 on both sides: every stop's tone is `sharedToneAt(stop)`, every pixel is
snapped onto it, and a stop number means one L\* across the kit (spread at most 0.89 on the default kit).
The chroma rule keeps its shape (the tint in the bands, the blend between, the palette's own chroma basis
at 500), so stop 500 is no longer the anchor pixel: it is built at the anchor's hue and chroma basis at
the shared tone. Skew, vibrancy and cusp pull move no lightness in the mode (the inspector hides them);
lift keeps its chroma-envelope role. The stop-500 guarantee above holds with the mode off.
