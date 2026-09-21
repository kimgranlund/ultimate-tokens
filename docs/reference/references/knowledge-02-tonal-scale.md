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
8. Palette groups, base chroma, and the prime system (absolute per-group ramp chroma, seven prime swatches)
9. Anchored palettes (a stored source colour, exact at `prime.DEFAULT` and at stop 500)

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

> ⚠️ **`toneMode` selects the whole ramp algorithm and defaults to `perceptual`, not the curve-driven path below.** `toneMode ∈ {perceptual (default), even, peak}`. The `curve`/`relChroma`/`chromaFloor` controls in this table and the `toneAt` math in §3–§4 apply to **`even` mode only**; `perceptual`/`peak` go through the OKHSL path (`okhslStops`), shaped by `lmin`/`lmax`/`damp`/`vibrancy`. `skew` and `lift` are the exception: both apply in every tone mode, since #647 wired them into `okhslStops` via the shared `liftStop` helper. The additional defaults not yet tabled here — `relChroma` (false), `chromaFloor` (40), `toneMode` (perceptual), `vibrancy` (0), `onColorMode` (contrast, since #662), `accentRef` (mode) — live in `DEFAULT_CONTROLS` in `tonal.js`. `baseIntensity` and `primeChroma` (100 each, §8) are NOT engine controls: SPEC 0.3.0 retired both from `tonal.js`'s `DEFAULT_CONTROLS` entirely — they live only on the document/UI side (`src/ui/persist.js` `DOMAINS`), as the two global fallbacks the palette-group resolvers in §8 read.

> ⚠️ **`peak` was the tone mode least suited to accent-on-text use, and #662 is why it no longer is.** Peak pins vibrancy at 100 and anchors the hue's cusp at stop 500, which pushes the accent fills toward the chroma peak and away from either ramp end. Under the pre-#662 fixed on-color policy that made it the worst of the three by a wide margin: measured on the default document, dark-scheme Secondary 1.24:1, Success 1.58:1, Info 2.44:1 and Warning 2.52:1 against their pinned light on-color, all far under WCAG AA 4.5:1 and under the MCP lint's advisory 3.0 floor as well. Those numbers were a property of the ON-COLOR, not of peak's ramp: with the contrast policy and its achromatic fall-through now the default (ADR-025), peak clears 4.5:1 in all 32 cells and is the highest-contrast of the three modes. Peak's ramp is unchanged — pick it for vivid mid-stops, and read this as the record of why it once carried an accessibility caveat.

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

Per-palette: `{ name, hue 0–360, chroma 0–100, skew -100..100, lift -40..40, hueShift -60..60, hueSameDir:bool, on:bool, anchor?, sourceAnchor? }`.
`anchor` and `sourceAnchor` are the two fields #681 added (`src/ui/persist.js`, `DOMAINS.palette`): each is a
6-digit hex string or absent, never a fitted value. `anchor` is the palette's **stored source colour**, and a
palette that carries one renders through the anchored construction in §9 instead of the plain `toneAt`/envelope
path in §4–§5. `sourceAnchor` is the generator's own copy of the same hex, written by `scripts/gen-categories.mjs`
and by `defaultDocument()` and never edited by the UI, so the inspector's Reset action has something to restore
after a hue or chroma edit detaches `anchor` (§9).
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
  the tone furthest where the ramp is STEEPEST — its effect in L\* is not a fixed amount, and
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
hue    = hueSpace=="oklch" ? solveCam16Hue(palette.hue, chroma@500, tone@500)  // solve the CAM16 hue directly in the RENDER space at stop 500's ACTUAL chroma+tone so the key stop EXPORTS at the set OKLCH hue (kills the Abney residual a peak-tone proxy left — worst in the blues); effHue seeds only the gamut basis
                        : palette.hue                        // cam16 hue passes straight through
pk     = peakC(hue).c                     // hue's own max chroma in sRGB
target = (palette.chroma / 100) * pk      // chroma control is % of the hue's peak

for each stop:
  tone  = toneAt(stop, skew, lift)
  cm    = maxChromaInGamut(hue, tone)     // gamut ceiling at this tone
  env   = chromaEnvelope(stop, 500, lift, controls)    // the shared multiplier, below
  C     = evenChroma(cm, target, env, chromaFloor)     // min(cm, max(min(target*env, cm), floorC))
  rgb   = hctToRgb(hue, C, tone).rgb

chromaEnvelope(stop, anchorStop, lift, controls):      // src/engine/tonal.js, ONE definition
  sd    = (liftStop(stop, lift) - liftStop(anchorStop, lift)) / 450   // keyed on the LIFTED reading
  isEven = toneMode == "even"
  damp   = isEven ? 100 - (100 - damp) * 0.25 : damp   // EVEN_DAMP_FACTOR = 0.25
  γ      = (isEven ? 0.25 : 1) * dampCurve
  uG     = |sd| ^ γ
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
- **Differential damping curve.** The defaults
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

## 8. Palette groups, base chroma, and the prime system

> Spec: `docs/spec/spec-muted-base-key-spikes.md` 0.3.0 (REQ-001..011 palette groups + absolute
> per-group base chroma, REQ-050..057 the prime system); design:
> `docs/lld/lld-muted-base-key-spikes.md` 0.3.0. Shipped in the engine (`tonal.js`, `prime.mjs`,
> the new `src/engine/resolve.mjs`) and the UI (`src/ui/model.mjs`, `src/ui/persist.js`). Unlike
> 0.2.0's shipped defaults, the 0.3.0 `GROUP_DEFAULTS` (§8.1) make a REAL visual change to the
> default document: Neutral (material) renders visibly muted and the eight data palettes render
> at equal ramp chroma regardless of their own `chroma` field — see the CHANGELOG. The 0.1.0
> "key-stop spike" on the ramp (identity stops, `keyIntensity`) was retired under #533; the ramp
> is continuous and the vivid identity colours live in the prime system (§8.3) below.

### 8.1 Palette groups and base chroma (the ramp)

Every palette resolves to an effective **group**, one of `material`, `brand`, `system`, `data`
(`paletteGroup(p)`, `src/ui/model.mjs`): an explicit `palette.group` if set, else the by-name
default — `neutral` is material; `primary`/`secondary`/`tertiary` are brand; `info`/`success`/
`warning`/`danger` are system; every other palette (the eight data palettes, user-added,
preset-opened) is data. Groups are an editor concept only: they never enter token names, CSS
variables, Figma paths, the role table, or MCP output.

The document carries a `paletteGroups` facet, one `{ baseChroma, primeChroma, locked? }` per
group, default-filled from `GROUP_DEFAULTS` (declared in `src/ui/persist.js`, re-exported by
`src/ui/model.mjs`):

| Group | `baseChroma` | `primeChroma` | `locked` |
|---|---|---|---|
| `material` | 30 | 60 | — |
| `brand` | 100 | 100 | — |
| `system` | 100 | 100 | — |
| `data` | 100 | 100 | yes |

**Base chroma is now an ABSOLUTE ramp-chroma target, not a multiplier.** For a palette `p` in
group `g`, the pure resolver `rampChromaOf(palette, paletteGroups, controls)`
(`src/engine/resolve.mjs`, imported identically by `src/ui/model.mjs`'s `projectView` and
`src/engine/exports.js`'s `derivePalette` so the canvas and every export format can never
disagree — the doc-shaped convenience wrapper `rampChromaOf(p, doc)` in `model.mjs` resolves the
palette's group and the document's `paletteGroups`/global fallbacks first) computes:

```
rampChromaOf(p, doc) = paletteGroups[paletteGroup(p)].baseChroma ?? controls.baseIntensity
```

and the model hands the resolved number to `paletteStops`/`okhslStops` AS the palette's own
`chroma` (`paletteStops({ ...p, chroma: rampChromaOf(p, doc) }, controls, stops)`) — it REPLACES
`palette.chroma` for ramp purposes; it never multiplies it. `palette.chroma` itself now feeds
only `deriveKeyColor` (the gallery tile and the prime system, §8.3); the ramp ignores it
entirely. There is no per-palette ramp override in any group any more: `palette.intensity` was
retired at schema v4 (§8.4) and a stray stored value is ignored on read.

`baseIntensity` (UI "Base chroma", global) is the fallback target used only when a palette's
group carries no `baseChroma` of its own. The field name is a deliberate legacy holdover from
the 0.2.0 per-stop multiplier it used to control — only its MEANING changed. It is a
document/UI-side control now, not an engine one: `tonal.js`'s `DEFAULT_CONTROLS` no longer
defines or reads `baseIntensity` at all, and `intensityAt` is deleted
(`git grep -n "intensityAt\|baseIntensity\|\.intensity\b" src/engine` returns nothing).

A palette's rendered ramp is byte-identical to the pre-groups engine IF AND ONLY IF its own
`chroma` control equals its resolved `rampChroma`. In the default document that holds for
Secondary and Warning (both sit at `chroma 100` inside a group whose `baseChroma` is 100) and for
every data palette minted at the primary's chroma only when that chroma is 100; it does NOT hold
for Neutral, Primary, Tertiary, Info, Success, Danger, or the default data palettes, which now
render at a different chroma than their own `chroma` field states.

### 8.2 Prime chroma resolution (feeds only the prime system, §8.3 — never the ramp)

The companion resolver, also pure and living in `src/engine/resolve.mjs`:

```
primeChromaOf(palette, paletteGroups, controls):
  g = paletteGroups[palette.group] ?? {}
  if g.locked: return g.primeChroma                       // data — the per-palette override is ignored, not deleted
  return palette.primeChroma ?? g.primeChroma ?? controls.primeChroma
```

The `data` group is locked: a data palette's own `primeChroma` override, if it has one stored, is
ignored while grouped as data — it becomes live again the moment the palette moves to another
group. `primeChroma` (UI "Prime chroma", global) is the prime system's own global fallback,
independent of `baseIntensity`.

### 8.3 The prime system (`src/engine/prime.mjs`)

The **prime system** is a per-palette set of seven swatches, `brightest · brighter · bright · prime ·
dim · dimmer · dimmest`, lightest first, computed from the palette's key colour (or, for an anchored
palette, from its stored source colour) on their OWN **CIE L\*** ladder. They are primitives-tier tokens, mode-independent (one set, the same in Light and
Dark, REQ-055), emitted as the `prime` group (`--{n}-prime-{step}`, `{n}/prime/{step}`, Figma
collection "Color Prime"; knowledge-04). They are NOT ramp stops and NOT roles: the 53-role table is
unchanged and roles never alias prime tokens (knowledge-03 §3).

| Control | Range | Default | Purpose |
|---------|-------|---------|---------|
| `primeChroma` (UI "Prime chroma", global) | 0–100 | 100 | the global fallback `primeChromaOf` (§8.2) reads last; was `keyIntensity` through schema v2, renamed at v3 (REQ-011, R4) |
| `palette.primeChroma` (UI "Prime chroma", inspector) | 0–100, optional | absent (inherits) | per-palette override, folded into `primeChromaOf` (§8.2) — ignored while the palette's group is locked (`data`) |

`primeSwatches` itself is unchanged by SPEC 0.3.0 and stays group-unaware: its caller
(`src/ui/model.mjs`'s `projectView`, `src/engine/exports.js`'s `derivePalette`) resolves
`primeChromaOf(p, doc)` (§8.2) FIRST and calls `primeSwatches({ ...p, primeChroma: undefined },
{ ...controls, primeChroma: primeChromaResolved })` — the palette's own `primeChroma` field is
cleared and the already-resolved number rides in on `controls.primeChroma` instead, so
`primeSwatches(palette, controls)` (REQ-050..053a, REQ-056; #537 ruling) below can keep reading
`palette.primeChroma ?? controls.primeChroma` with no group knowledge of its own:

```
// (a) where the ladder is pivoted - the anchored branch first (#681 U1, §9)
if palette.anchor is a 6-hex string:
  lPrime  = lstarFromRgb(anchor.rgb)        // the STORED source's own CIE L*, exact, no OKHSL round trip
  cKey    = cam16FromRgb(anchor.rgb).chroma //   its own CAM16 chroma
  hue     = cam16FromRgb(anchor.rgb).hue    //   its own CAM16 hue
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
cPrime = max(0, cKey · primeChroma / 100)             // scales the six ladder rungs, never the prime rung

// (c) the seven rungs
g      = 3 ** (skew / 100)                            // the ramp's toneAt gamma, reused as the ladder bend
t_i    = (i - 3) / 3;  w_i = i < 3 ? |t_i| ** (1 / g) : |t_i| ** g     // w(prime) = 0, w(ends) = 1
L_i    = i < 3 ? lLadder + 3 · up · w_i : lLadder - 3 · down · w_i
hue_i  = hue + hueShift · (hueSameDir ? -|t_i| : t_i)
C_i    = min(cPrime, maxChromaInGamut(hue_i, L_i))    // chroma HELD; only the gamut desaturates a rung
rgb_i  = hctToRgb(hue_i, C_i, L_i)
rgb_3  = anchored ? anchor.rgb verbatim : rgb_3       // the prime rung is the source byte for byte
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

### 8.4 Migration (schema v6)

`CURRENT_SCHEMA_VERSION` is 6 (`src/ui/persist.js`). Two bumps landed after v4, both adding
brand-new optional palette fields rather than renaming anything, so neither needs a `RENAME_MAPS`
entry: v5 added `palette.anchor`/`sourceAnchor` (#681 U1) and v6 added
`palette.preDetachHue`/`preDetachChroma`/`preDetachLift` (#681 U2). A document predating either
simply carries none of those fields, which is `clampPalette`'s correct absent-stays-absent
behaviour with no version gate. The v4 migration below still runs, unconditionally, on every
hydrate.

Hydrating below v4 deletes `palette.intensity`
from every palette — there is no per-palette ramp override in any group any more — and reports it
through `DROPPED_KEYS` (TKT-0455, loud not silent); the document's `paletteGroups` facet is
default-filled from `GROUP_DEFAULTS` unconditionally on every hydrate, not gated by schema version.
`palette.group` is never written by the migration itself: an old document stays byte-stable on
reload apart from the dropped key, deriving its group by name on every read via `paletteGroup(p)`.

## 9. Anchored palettes

A palette that carries an `anchor` (§2) was **sampled from a real colour**, and #681 made the engine
say so exactly rather than approximately. Before it, a curated preset stored `{hue, chroma, skew,
lift}` fitted to its source and the engine re-derived a key colour from those four numbers, so the
emitted `prime.DEFAULT` was close to the sampled colour but rarely equal to it. Now the source hex
itself is stored and both of the places a user reads "the" colour reproduce it byte for byte.

**The two exactness guarantees.**

| Guarantee | Scope | Where |
|---|---|---|
| `prime.DEFAULT` equals `anchor` byte for byte | every palette carrying an `anchor`, 3,380 on the regenerated corpus, unconditionally | `primeSwatches(...)[3]` returns the anchor's own rgb verbatim (§8.3) |
| ramp stop 500 equals `anchor` byte for byte, in all three tone modes | the 3,370 anchored palettes whose source sits INSIDE the ramp window `[9.95, 95.05]` L\* | `paletteStopsAnchored` / `okhslStopsAnchored`, the `stop === 500 && !clamped` case |

The two scopes differ on purpose. The TOKEN is exact for all 3,380: a source outside the ramp window
still exports its own hex at `prime.DEFAULT`. The RAMP clamps: for the 10 named out-of-window sources
(9 dark ones between 7.32 and 9.84 L\*, plus one pure white) stop 500 lands at the window edge nearest
the source, because forcing the verbatim pixel at a clamped pivot would jump away from the window edge
its own neighbours are shaped around, which is the discontinuity that broke monotonicity before this
branch existed. Both allow-lists are frozen by name and count in the gates, not by a threshold.

**Skew and lift never move either one.** They warp the ramp around the pivot, not through it:
`anchorLerp` (§4) fixes stop 500 and re-maps each side, so a lift of +40 on an in-window anchored
palette leaves stop 500 unchanged while the same edit on a non-anchored copy moves it.

**Chroma at the pivot is a blend, not a pin.** The anchored branches call the same `chromaEnvelope`
(§5) as everything else; what differs is the BASIS fed to it. `anchorChromaBasis` blends the anchor's
own measured chroma exactly at the pivot toward the group's resolved ramp target at each side's
endpoint, weighted by a smoothstep on the `liftStop` position, so the weight and its derivative are
both 0 at the pivot. That is what keeps a near-grey anchor inside a vivid group from reading as a
notch against its own neighbours, and it is why a group's Base chroma still moves an anchored ramp's
ends while stop 500 stays byte-exact.

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
