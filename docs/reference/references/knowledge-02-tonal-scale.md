# Knowledge 02 — Tonal-Scale Generation

> Topic: how a palette's per-stop tone (L\*) and chroma are computed from the global
> controls plus a palette's `{hue, chroma, skew, lift}`. All formulas are literal.

## Table of Contents
1. Stops
2. Global controls and defaults
3. Tone curves (the five `shape` functions)
4. `toneAt` — tone per stop
5. Chroma targeting and edge damping
6. `paletteStops` — the per-stop pipeline
7. Worked example
8. Intensity (muted base ramps with key-stop spikes)

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

> ⚠️ **`toneMode` selects the whole ramp algorithm and defaults to `perceptual`, not the curve-driven path below.** `toneMode ∈ {perceptual (default), even, peak}`. The `curve`/`skew`/`lift`/`relChroma`/`chromaFloor` controls in this table and the `toneAt` math in §3–§4 apply to **`even` mode only**; `perceptual`/`peak` go through the OKHSL path (`okhslStops`), shaped by `lmin`/`lmax`/`damp`/`vibrancy`. The additional defaults not yet tabled here — `relChroma` (false), `chromaFloor` (40), `toneMode` (perceptual), `vibrancy` (0), `onColorMode` (fixed), `accentRef` (mode), `baseIntensity` (100), `keyIntensity` (100, §8) — live in `DEFAULT_CONTROLS` in `tonal.js`.

| Control | Range | Default | Purpose |
|---------|-------|---------|---------|
| `curve` | linear / sine / cubic / logistic / exp | `logistic` | tone-distribution shape |
| `tension` | 0–100 | 0 | steepness of logistic/exp only |
| `lmin` | 0–40 | 5 | darkest L\* (stop 950 end) |
| `lmax` | 60–100 | 100 | lightest L\* (stop 050 end) |
| `damp` | 0–100 | 80 | edge chroma damping strength (amount) |
| `dampCurve` | 0.5–4 | 1.5 | falloff exponent γ — where damping bites (low = broad into mids, high = confined to the ends) |
| `dampAmp` | 0–100 | 0 | mid-tone chroma amplify — boosts the mids toward the gamut ceiling (multiplier > 1) |
| `dampBias` | -100..100 | 0 | light(−)↔dark(+) asymmetry of the damping |
| `hueSpace` | cam16 / oklch | oklch | how input hues are read (default flipped to OKLCH; cam16 stays selectable, and legacy cam16 docs carry `hueSpace:"cam16"` explicitly) |
| `theme` | auto / light / dark | auto | UI appearance only (not exported) |

Per-palette: `{ name, hue 0–360, chroma 0–100, skew -100..100, lift -40..40, hueShift -60..60, hueSameDir:bool, on:bool }`.
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

## 4. `toneAt` — tone per stop

```
toneAt(stop, skew, lift):
  p = (stop - 50) / 900                  // 0 at 050 (light) .. 1 at 950 (dark)
  g = 3 ^ (skew/100)                     // skew>0 -> gamma>1 -> lighter mids (peak drifts light)
  p = p ^ g
  q = shape(p)
  t = lmax - (lmax - lmin) * q
  if lift:                               // additive bump centered on 500, 0 at 050/950
    w = 0.5 * (1 + cos(π * (stop - 500) / 450))
    t += lift * w
  return clamp(t, lmin, lmax)
```

- **skew** warps the tone distribution via a gamma on `p`. Positive skew lightens the
  mid-tones (the visual chroma peak drifts toward lighter stops).
- **lift** adds a cosine-weighted L\* bump centered on stop 500, tapering to 0 at the ends.
  Used to nudge a palette's mid lightness (e.g. Warning gets `lift +15`).

## 5. Chroma targeting and edge damping

```
hue    = hueSpace=="oklch" ? solveCam16Hue(palette.hue, chroma@500, tone@500)  // solve the CAM16 hue directly in the RENDER space at stop 500's ACTUAL chroma+tone so the key stop EXPORTS at the set OKLCH hue (kills the Abney residual a peak-tone proxy left — worst in the blues); effHue seeds only the gamut basis
                        : palette.hue                        // cam16 hue passes straight through
pk     = peakC(hue).c                     // hue's own max chroma in sRGB
target = (palette.chroma / 100) * pk      // chroma control is % of the hue's peak

for each stop:
  tone  = toneAt(stop, skew, lift)
  cm    = maxChromaInGamut(hue, tone)     // gamut ceiling at this tone
  s     = (stop - 500) / 450              // signed pos: <0 light · 0 mid · >0 dark
  uG    = |s| ^ dampCurve                 // falloff (γ); legacy was a fixed 1.5
  sideW = max(0, 1 + (dampBias/100)*sign(s))           // light↔dark asymmetry
  m     = max(0, 1 + (dampAmp/100)*(1-uG) - (damp/100)*sideW*uG)   // the multiplier
  C     = min(target * m, cm)             // never exceed the gamut ceiling
  rgb   = hctToRgb(hue, C, tone).rgb
```

- **Differential damping curve.** `m(stop)` is a per-stop chroma multiplier. The defaults
  `dampCurve 1.5, dampAmp 0, dampBias 0` reduce it to the legacy `1 - (damp/100)·u^1.5`
  edge damp **exactly** (backward-compatible — existing palettes/exports are unchanged).
  - **`damp`** sets the edge depth (amount); **`dampCurve` (γ)** shapes *where* damping
    bites — low spreads it into the mids, high confines it to the extreme ends.
  - **`dampAmp`** boosts mid-tone chroma toward the ceiling (`m > 1`, peaking at stop 500,
    tapering to 0 at the ends so it never fights the edge damp).
  - **`dampBias`** tilts damping toward the dark (`>0`) or light (`<0`) end — the two ends
    were previously locked together.
- Final chroma is always clamped to the gamut ceiling `cm` (the `min(·, cm)`), so amplify
  can only push *toward* the ceiling and every emitted color stays in sRGB by construction.

## 6. `paletteStops` — the per-stop pipeline

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

## 8. Intensity (muted base ramps with key-stop spikes)

> Spec: `docs/spec/spec-muted-base-key-spikes.md` (REQ-001..006); design: `docs/lld/lld-muted-base-key-spikes.md`.
> Shipped in the engine (`tonal.js`, `semantic.js`); the shipped defaults (`baseIntensity: 100,
> keyIntensity: 100`) make this section describe a capability, not yet a visual change: see the
> CHANGELOG.

**Intensity** is a fraction of a palette's own `chroma` control, applied as a per-stop multiplier
*before* the damping in §5. `chroma` keeps its existing meaning (the brand's full chroma, % of the
hue's peak); intensity scales what the ramp actually emits on top of it.

Two global controls, plus one per-palette override:

| Control | Range | Default | Purpose |
|---------|-------|---------|---------|
| `baseIntensity` | 0–100 | 100 | the chroma fraction every non-identity stop emits at |
| `keyIntensity` | 0–100 | 100 | how far the identity stops (below) are lifted back toward full chroma |
| `palette.intensity` | 0–100, optional | absent (inherits) | per-palette override of `baseIntensity`; resolved as `palette.intensity ?? controls.baseIntensity` |

**Identity stops** are the solid ramp stops the five identity roles (the prime accent and its
`-Dim`/`-Bright`/`-Low`/`-High` variants) resolve to, across both Light and Dark. Computed from the
already-resolved role list (`identityStops(roles)` in `semantic.js`, called *after* `applyAccentRef`,
never unioned with a static set): under `accentRef: "mode"` (the default) the set is
`{350, 400, 450, 550, 650, 700}` (`DEFAULT_IDENTITY_STOPS` in `tonal.js`); under `accentRef: "single"`
the prime role resolves to 500/500 instead, so the set becomes `{350, 400, 500, 650, 700}` and 450/550
fall out to ordinary (non-identity) stops. `test/engine/semantic.mjs` gates the two literals against
each other so they cannot drift apart.

`intensityAt` is the per-stop factor:

```
intensityAt(stop, palette, controls, identityStops):
  b = clamp01((palette.intensity ?? controls.baseIntensity ?? 100) / 100)
  k = clamp01((controls.keyIntensity ?? 100) / 100)
  return identityStops.has(stop) ? b + (1 - b) * k : b
```

The factor `I(stop)` multiplies the palette's chroma fraction on **both** ramp paths, before the
damping multiplier `m` in §5: the OKHSL saturation on `perceptual`/`peak` (`s = chroma/100 · I(stop) ·
(1 + dampAmp/100)`), and the intended chroma on `even` (`intended = chroma/100 · I(stop) · peakC(hue)`
or `maxc500`, matching the `relChroma` branch already in §5). Gamut safety stays with the existing
`min(target * m, cm)` clamp: intensity is a chroma-fraction input to that pipeline, not a second
clamp. The stop-500 OKLCH/CAM16 hue anchor (`hueAnchorFrac`, §5) also multiplies by `I(500)`, so the
`oklch-hue-anchor` guarantee holds at every intensity, not only at 100.

At the shipped default (`baseIntensity 100`, any `keyIntensity`), `I(stop) = 1` everywhere: every
emitted stop is byte-identical to the pre-intensity engine, for every palette, control set, and both
ramp paths (the tonal verifier's own legacy-invariance proof). Away from 100, the effect is a **muted
base with key-stop spikes**: every stop *except* the identity stops emits at the reduced fraction `b`,
while the identity stops are lifted back toward full chroma by `k`, a discrete step, not a smooth
falloff around 500 (a neighbour-falloff envelope would re-spike the identity stops themselves, so it
is explicitly out of scope). The active-state stops (750/250) are never identity stops under either
accent mode, so they always emit at the muted `b` fraction alongside the rest of the ramp.

Worked example: default Primary (`hue 267, chroma 95`), `baseIntensity 40`, `keyIntensity 100`,
`accentRef "mode"`: stops `{350, 400, 450, 550, 650, 700}` emit at `0.95 * m(stop)` (the §5 damping
curve, unchanged); every other stop (500, 750, 250 included) emits at `0.95 * 0.40 * m(stop)` before
the gamut clamp. Tones (from §4) are identical at every intensity; only chroma moves.
