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

> ⚠️ **`toneMode` selects the whole ramp algorithm and defaults to `perceptual`, not the curve-driven path below.** `toneMode ∈ {perceptual (default), even, peak}`. The `curve`/`skew`/`lift`/`relChroma`/`chromaFloor` controls in this table and the `toneAt` math in §3–§4 apply to **`even` mode only**; `perceptual`/`peak` go through the OKHSL path (`okhslStops`), shaped by `lmin`/`lmax`/`damp`/`vibrancy`. The additional defaults not yet tabled here — `relChroma` (false), `chromaFloor` (40), `toneMode` (perceptual), `vibrancy` (0), `onColorMode` (fixed), `accentRef` (mode) — live in `DEFAULT_CONTROLS` in `tonal.js`. `baseIntensity` and `primeChroma` (100 each, §8) are NOT engine controls: SPEC 0.3.0 retired both from `tonal.js`'s `DEFAULT_CONTROLS` entirely — they live only on the document/UI side (`src/ui/persist.js` `DOMAINS`), as the two global fallbacks the palette-group resolvers in §8 read.

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
dim · dimmer · dimmest`, lightest first, computed from the palette's key colour on their OWN OKHSL
lightness ladder. They are primitives-tier tokens, mode-independent (one set, the same in Light and
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
key    = rgbToOkhsl(deriveKeyColor(palette).rgb)      // the REAL key colour: effHue, peakC chroma × chroma/100, cusp tone
lPrime = key.l                                        // REQ-051: never a neutral grey at the cusp tone
up     = min(PRIME_STEP, (PRIME_L_MAX - lPrime) / 3)  // PRIME_STEP 0.09, [PRIME_L_MIN, PRIME_L_MAX] = [0.14, 0.94]
down   = min(PRIME_STEP, (lPrime - PRIME_L_MIN) / 3)
g      = 3 ** (skew / 100)                            // REQ-053a: the ramp's toneAt gamma, reused as the ladder bend
t_i    = (i - 3) / 3;  w_i = i < 3 ? |t_i| ** (1 / g) : |t_i| ** g     // w(prime) = 0, w(ends) = 1
l_i    = i < 3 ? lPrime + 3 · up · w_i : lPrime - 3 · down · w_i
s      = clamp01(key.s · primeChroma / 100)           // REQ-052: the key colour's OWN OKHSL saturation, no damping
hue_i  = key.h + hueShift · (hueSameDir ? -|t_i| : t_i)  // REQ-053: read, never re-solved
rgb_i  = okhslToRgb(hue_i, s, l_i)                    // in gamut by OKHSL construction
```

Why the key colour's own coordinates: a chromatic colour and a grey at the same CIELAB L* differ in
OKHSL `l` by a Helmholtz-Kohlrausch gap that grows toward the gamut edge; a CAM16 chroma fraction is
not an OKHSL saturation; and anchoring the hue at peak chroma carried an Abney drift into the muted
swatches. Reading `(l, s, h)` off `deriveKeyColor`'s colour makes `prime` equal the gallery tile
EXACTLY at `primeChroma 100` (REQ-056), not approximately. Steps are even in `l` at `skew 0`;
`skew > 0` pushes the light inner swatches away from `prime` and pulls the dark ones toward it (every
inner swatch reads lighter, like the ramp), `skew < 0` the reverse, with `prime` and both ends fixed.
`lift`, `damp*`, `vibrancy`, `cuspPull`, `toneMode` do not apply: they shape the ramp, not the prime
system. The editor's Color canvas draws the seven as the `.prime-strip` ahead of each ramp row.

Worked example (engine-regenerated, #537; `hueSpace "cam16"`, `role-table.json`'s raw `hue 267,
chroma 95`, `skew 0`, `primeChroma 100`): `lPrime = 0.528528`, `s = 0.965345`, `up = down = 0.09`;
`l`/hex brightest→dimmest `0.798528 #A5C8FE · 0.708528 #7CAEFE · 0.618528 #5194FC · 0.528528 #2177F6
· 0.438528 #0F60D2 · 0.348528 #084BA8 · 0.258528 #04377F`; `#2177F6` is `deriveKeyColor(Primary)`
byte for byte. With the default `skew -20` the inner four become `0.691458 #74AAFD · 0.597234
#468DFB · 0.416749 #0D5BC8 · 0.333539 #0748A2`, ends and prime unchanged. Warning (`hue 70, chroma
100`) has `lPrime = 0.749941`, `s = 1`, `up` compressed to `0.063353`, `brightest = 0.94 #FFEAD4`,
`dimmest = 0.479941 #9E6300`. The SPEC's EX-4/EX-4b/EX-5 carry the full tables.

### 8.4 Migration (schema v4)

`CURRENT_SCHEMA_VERSION` is 4 (`src/ui/persist.js`). Hydrating below v4 deletes `palette.intensity`
from every palette — there is no per-palette ramp override in any group any more — and reports it
through `DROPPED_KEYS` (TKT-0455, loud not silent); the document's `paletteGroups` facet is
default-filled from `GROUP_DEFAULTS` unconditionally on every hydrate, not gated by schema version.
`palette.group` is never written by the migration itself: an old document stays byte-stable on
reload apart from the dropped key, deriving its group by name on every read via `paletteGroup(p)`.
