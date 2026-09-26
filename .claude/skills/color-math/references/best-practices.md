## Best practices: changing the color engine

The non-obvious do/don'ts (each a real trap in this engine), then a worked walkthrough from the repo's
distribution-mode / chroma-floor history.

### Constants and spaces

- **The CAM16 constants (`hct.js`) and the OKLab/Ottosson constants (`okhsl.js`) are copied VERBATIM from
  their references, never re-derive, re-round, or "tidy" them.** The okhsl.js header says so explicitly
  ("Ported VERBATIM … the magic constants are load-bearing and copied exactly"). A single wrong digit shifts
  an anchor (`red` = `27.41° / 113.36 / 53.23`) past tolerance and the engine is broken, and it will still
  produce *plausible-looking* swatches, so only the anchor gate catches it.
- **`tonal.js` imports the validated engine, never reimplement it there.** No re-pasting `hctToRgb`, the
  matrices, or the OKLab cube into `tonal.js`. The header is emphatic: "Engine contract (validated, imported,
  never reimplemented here)". Same for `derive.mjs`: pure OKLCH, no imports, no DOM.
- **Work in the right space for the job.** Ramp tone is **CIELAB L\***, not CAM16 J (J is only the internal
  search variable inside `hctToRgb`). Derivation + key colors are **OKLCH**. The default ramp distribution is
  **OKHSL**. Mixing them up is a classic confusion, in `okhslStops`, `tone = lstarFromRgb(rgb)` is the
  *measured* L\* of the EMITTED color, reported for graphs/roles, NOT an input; treating it as a set value is
  wrong.

### In-gamut is sacred

- **Every chroma path ends in a `min(·, maxc)` (even) or `clamp(·, 0, 1)` (OKHSL).** Don't add a chroma
  computation that bypasses it. `dampAmp` can push `m > 1` and the floor can lift the ends, both are
  deliberately re-clamped afterward. The `damping-curve` gate runs extreme corners (`dampAmp:100`; `damp:100`
  with `dampBias:±100` driving the bracket negative) and asserts `max(0,·)` holds (no negative chroma) and
  nothing exceeds `maxc+0.5`, across EVERY saturated hue.
- **`oklchToRgb` (okhsl.js) is gamut-CLAMPED, not gamut-mapped**: an out-of-gamut OKLCH snaps each
  channel to `[0,255]` via `clamp255`, which can distort hue. It is only for
  seeding RETAINED key colors (stored as OKLCH, less lossy than 8-bit hex), NOT for emitting ramp stops. Use
  the HCT/OKHSL paths for ramp output, where in-gamut is guaranteed by the search/bijection.

### Both ramp paths, in lockstep

- **The damping multiplier `m` exists in BOTH paths**: the even loop in `paletteStops` and `okhslStops`,
  with the IDENTICAL formula. If you change the damping math, change both, or
  `damp`/`dampCurve`/`dampAmp`/`dampBias` will mean different things in `even` vs `perceptual`/`peak`.
- **Damping must NEVER touch tone.** The `damping-curve (f)` gate asserts tone is identical (`|Δ| ≤ 1e-9`)
  with damping on vs off. Tone monotonicity depends on it.
- **The OKHSL path keys lightness on the STOP NUMBER, not the array index** (`(stop−50)/900`, `(stop−500)/450`).
  This is why stop 500 is the same hex in the 19-stop display ramp and the 25-stop export ramp. Reintroducing
  `index`-based math silently desyncs the two ramps (the `okhsl-modes` stop-consistency check catches it).
- **Remember the default is `perceptual` (OKHSL), not `even`.** A fix to `toneAt`/`curve`/`relChroma`/
  `chromaFloor` changes only what `even` users see. If the bug report is about the *default* output, you are
  in `okhslStops`, not `toneAt`.

### Anchors are truth; the floors are guardrails

- **The 6 anchors in `verification-anchors.json` are the absolute-correctness backstop.** The `anchor-roundtrip`
  gate (`test/engine/hct.mjs`) asserts the FOUR per-anchor tolerances owned by `references/rubric.md` C1
  (forward L\* · CAM16 hue · CAM16 chroma · RGB roundtrip; current engine: 0 on all). If a change moves any
  anchor past ANY of them, revert, do NOT "adjust the tolerance."
- **`chromaFloor` is capped at `intended`** so it lifts the dead zone without over-saturating muted palettes
  or tinting true neutrals (`intended≈0` → floorC 0). The `chroma-floor` gate proves all four: muted lifts,
  never exceeds the mid, true neutral untouched, saturated untouched.
- **`weightedMeanHue` is circular**: sum chroma-weighted unit vectors, `atan2`. Never average raw degrees
  (350° + 10° must give 0°, not 180°). The `derive` test pins exactly this wrap case.
- **Derivation priority order beats chroma.** Single-reference relationships pivot on `samples[0]` (the
  caller's first non-neutral palette), so a low-chroma primary still anchors. Don't "fix" this to weight by
  chroma, the `derive` test asserts a muted blue primary (200°) anchors over a vivid orange secondary (30°).

### Determinism

- No RNG, no `Date`, no locale. The memo caches (`_mc`, `_pk`, `_oh` in `hct.js`) key on the exact float
  (#686) - if you add a cache, match that discipline. `tonal.js`'s `okhslLAt` carries no cache at all
  (#738: a memo there was never load-bearing; see `test/engine/tonal.mjs`'s `okl-order` gate). The
  `oklch-deterministic` gate runs each hue thrice and demands identical results.

## Worked walkthrough: the "even → perceptual default + chromaFloor" change (condensed)

The dead-zone fix (PR #41 lineage: distribution modes #38, perceptual-default + chromaFloor #41):

1. **Diagnosed the path.** Low-chroma palettes collapsed to near-white at the light/dark ends, the "dead
   zone." In the **even** path, edge damping starves the ends; the fix was `chromaFloor` (lift the ends back
   toward `intended`). But the deeper fix was making **`perceptual` (OKHSL) the default** so gamut-proportional
   saturation harmonizes across hue with no dead zone in the first place.
2. **Added the floor to the even path only**: `floorC = min((chromaFloor/100)·maxc, intended)`, then
   `chroma = min(maxc, max(damped, floorC))`. The cap at `intended` is the load-bearing guardrail: muted
   stays muted, neutral (`intended≈0`) stays neutral, saturated already clamps at `maxc` so the floor never
   binds.
3. **Flipped `DEFAULT_CONTROLS.toneMode` to `"perceptual"`** and routed `perceptual`/`peak` through
   `okhslStops`, keeping the **same** damping `m` so `damp`/`dampCurve`/`dampAmp`/`dampBias` stayed meaningful
   across both paths.
4. **Added gates for the new behavior** without re-deriving the formula: `chroma-floor` (4 properties,
   muted-lifts / never-exceeds-mid / neutral-untouched / saturated-untouched), `okhsl-modes` (in-gamut, every
   stop distinct = no dead zone, tone monotone, white/black ends, 19-vs-25 stop consistency), `vibrancy`,
   `cusp-pull`. The CIELAB gates were pinned to `toneMode:"even", chromaFloor:0` (the `CTL` pin in
   `test/engine/tonal.mjs`) so the two regimes test independently.
5. **Validated**: `node test/engine/tonal.mjs` (all 12 groups green), then `hct.mjs`/`okhsl.mjs`/`derive.mjs`,
   then `npm test`. Confirmed the 6 anchors still roundtrip at Δ=0 and held all four anchor tolerances (the
   perceptual default did not touch the engine core).