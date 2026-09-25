# Glossary

> Project vocabulary. Where a term has a project-specific meaning that differs from common
> usage, that is flagged. Spec-author: align all spec terms to these definitions; flag any
> new term introduced.

| Term | Definition |
|------|------------|
| **HCT** | Hue–Chroma–Tone color model. Here: hue+chroma from CAM16, tone from CIELAB L\*. |
| **CAM16** | A color appearance model; source of perceptual hue and chroma. Parameterized by viewing conditions (VC). |
| **CIELAB L\*** | Perceptual lightness, 0–100. The tonal axis of every palette. Called **tone**. |
| **Tone** | Synonym for the target L\* of a stop. The controllable axis. |
| **Stop** | A position on a tonal ramp, named 050–950. Display stops step by 50; export stops add half-steps. |
| **PEAK / prime** | Stop 500, the chroma peak / canonical accent tone. |
| **LITE / DARK prime** | Stops 450 / 550, the light and dark prime tones (prime role = 550 light / 450 dark). |
| **Chroma (%)** | The per-palette chroma control, expressed as a percentage of the hue's own sRGB chroma peak (`peakC`), not a raw chroma number. |
| **Gamut ceiling** | `maxChromaInGamut(hue, tone)`, the largest chroma that stays inside sRGB at a given tone. |
| **Edge damping** | Reduction of chroma toward the lightest/darkest stops so ends don't look over-saturated. Amount = `damp` (0–100). |
| **Differential damping** | The full per-stop chroma multiplier (CHANGELOG 0.6) of which edge damping is the default case. Since #681 U3 it is ONE exported function, `chromaEnvelope(stop, anchorStop, lift, controls)` in `src/engine/tonal.js`, shared by the even path, the OKHSL path and both anchored branches; it is keyed on `liftStop(stop, lift)`, not the nominal stop, and returns exactly 1 at the anchor stop for any lift. Shaped by the three controls below. |
| **`dampCurve`** (falloff γ) | Exponent on the centre-distance in the damping term (0.5–4, default 1.5). Low = damping spreads into the mids; high = confined to the extreme ends. Distinct from `damp` (the amount). |
| **`dampAmp`** (amplify) | SHOULDER chroma boost (0–100, default 0): the additive `(dampAmp/100)·4·uG·(1−uG)` term inside `chromaEnvelope`, which is 0 both at the pivot and at each end, so it raises the shoulders and can never raise stop 500 itself. Opposite sign of effect to `damp`, and NOT the same control. Because the envelope is normalised at the pivot, a non-zero `dampAmp` can only push a shoulder ABOVE the pivot's own chroma, which is why `VIVID_MIDS.dampAmp` ships at 0 rather than 55 (#681 Q7). |
| **`dampBias`** | Light(−)↔dark(+) asymmetry of the damping (−100..100, default 0); `+dampBias` damps the dark half more, via a mirror-symmetric per-side weight. |
| **Skew** | Gamma warp of the tone distribution; positive lightens mid-tones (peak drifts light). |
| **Lift** | Cosine-weighted DISPLACEMENT of the stop (−40..40), `A · w(stop)` stops with `A = clamp(lift × 6, ±243.51)` and `w` = 1 at stop 500, 0 at the ends: the tone at a stop is the unchanged curve's tone at a nearby one. Monotone for any lift by `|A| · π/900 < 1`. Was an additive L\* bump until #648, which could flatten the light stops into one swatch. Applied in the `even` path only until #647, which wired it (and skew's gamma) into the `perceptual`/`peak` OKHSL path too, via the shared `liftStop` helper. On an **anchored** palette (below) lift warps the ramp AROUND the pivot, never through it: stop 500 stays byte-exact to the anchor at any lift, while the same edit on a non-anchored copy moves it. |
| **Anchor** | The palette's STORED source colour: a 6-digit hex on `palette.anchor`, sampled, never fitted (ADR-026). A palette carrying one emits it verbatim at `prime.DEFAULT`, and at ramp stop 500 in all three tone modes when the source sits inside the ramp window `[9.95, 95.05]` L\*; the 10 out-of-window sources keep the exact TOKEN and clamp only the ramp's pivot to the nearest window edge. Editing `hue` or `chroma` REMOVES it and the palette becomes ordinary; `skew` and `lift` keep it. `palette.sourceAnchor` is the generator's own copy of the same hex, never touched by the UI, and is what the inspector's Reset restores. Distinct from **PEAK / prime**, which names a stop; the anchor names a colour. |
| **Scrim primitive** | A *raw* semi-transparent overlay token: the palette's 500 color at alpha% = step/10, named `{base}-{step}` (e.g. `500-200` = 500 @ 20%). A valid **ref target**, like a solid stop. |
| **Scrim role** | A *semantic role* (`scrimWeakest…scrimStrongest`, 7 per palette) whose ref points at a **scrim primitive** on the 500 ramp. NOT itself a ref target, only scrim *primitives* are. Do not conflate with *scrim primitive*. |
| **On-color** | Foreground (text/icon) color meant to sit on a fill. ADR-003 pinned `on{N}` → the 50 stop and `on{N}Variant` → the 200 stop, fixed in both modes; ADR-025 (#662) made `onColorMode: "contrast"` the DEFAULT, so a ramp end is kept while it clears AA 4.5:1 and otherwise the on-color falls through to the pure `white`/`black` constant. `"fixed"` is the opt-out back to the ADR-003 behaviour. |
| **Role** | A named semantic token (e.g. `surfaceDim`, `outline`). 53 roles per palette. |
| **Raw / primitive** | A mode-independent base token a ref resolves *to*: a solid export stop or a **scrim primitive** (`{base}-{step}`). Never a role. |
| **Semantic / `--c-*`** | A role token that carries the light/dark flip via `light-dark()`, aliasing two primitives. |
| **Mode** | Light or Dark. The flip lives only in the semantic layer. |
| **Mirror** | A light/dark mapping whose stops sum toward 1000 (e.g. `50/950`). Low/High surfaces mirror; Dim/Bright do not. |
| **Ref** | A role's light/dark target: a solid stop `"550"` or a **scrim primitive** `"500-200"`, always a *primitive*, never another role. |
| **`refKey`** | Normalizes a ref to padded form for names/vars (`"50"→"050"`, `"500-200"→"500-200"`). |
| **DTCG** | Design Tokens Community Group format (`$type`/`$value`); Figma's native import shape. |
| **VC (viewing conditions)** | Fixed CAM16 parameters derived once at load (`makeVC`); not user-controllable. |
| **Prime fill** | The `{n}` (prime) role's color: stop 550 in light, 450 in dark. On-colors are evaluated against it. Not to be confused with the `prime` SWATCH (`prime.DEFAULT`, `primeSwatches(...)[3]`), which is the middle rung of the seven-swatch prime ladder and, for an anchored palette, is the stored source hex byte for byte. |
| **Cascade** | Raw edit propagating to semantic. Provided by the plugin (alias-by-reference), not by JSON import. |
| **Parity** | A property of multi-impl *distribution*, not of the domain. The reference build is single-source, one `src/engine/` module set (`hct.js`, `semantic.js`, …) imported everywhere, so drift is structurally impossible and parity is automatic. The 3-implementation framing (artifact / `gen.js` / plugin) is legacy packaging; `gen.js` is not part of the current build. Parity becomes a real gate only IF ≥2 independent implementations are shipped (`hpg-engine-parity` / `hpg-parity-roletable`, conditional). |
