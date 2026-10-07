<!-- role=scout level=L1 model=claude-haiku-4-5 effort=low -->
## Map
- src/engine/tonal.js:477: `chromaEnvelope(stop, anchorStop, lift, controls)` - the closed-form envelope function with damp/dampCurve/dampAmp/dampBias
- src/engine/tonal.js:28–88: `DEFAULT_CONTROLS` - default damp (80), dampCurve (1.5), dampAmp (0), dampBias (0)
- src/engine/tonal.js:347: `evenChroma(maxc, intended, env, chromaFloor, floorRef, floorMaxc)` - applies envelope to chroma damping
- src/engine/tonal.js:413–476: envelope model constants and comments (EVEN_DAMP_FACTOR, OKHSL_DAMP_CURVE_GAIN, EVEN_NEIGHBOURHOOD_R, BUMP_SLOPE_MAX, CUSP_RUN_BOUND logic)
- test/engine/chroma-envelope-gate.mjs: tests envelope ratcheted against fixture and direction rule (stop 100 < 300, 900 < 700)
- test/engine/fixtures/chroma-envelope.json: measured medians/p90 at stops 100/300/700/900, per mode (perceptual/peak/even)
- scripts/lib/envelope-measure.mjs: shared measurement code (READING a, 2920-instance corpus at source chroma ≥10 + 8 default-kit families)
- src/ui/categories/*.js: PRESETS array, each with palette definitions and damp/dampCurve values
- docs/references/decision-records.md:730: ADR-026 (anchor storage, not fitted; amended 2026-09-29 for damping pair retuning)
- npm package.json: `gate:chroma-envelope` runs test/engine/chroma-envelope-gate.mjs --full; included in `gate:sweeps`

## Entry points
- `chromaEnvelope(stop, anchorStop, lift, controls)` called from `paletteStops()` and `paletteStopsAnchored()` in tonal.js
- `paletteStops`/`paletteStopsAnchored` called from `projectView()` in src/ui/model.mjs
- Test entry: `npm run gate:chroma-envelope` or `npm test`
- Presets loaded from src/ui/categories in `loadEnvelopeInstances()` (envelope-measure.mjs:68)

## Not found
- Preset UI selector (handoff says "decide: whether presets surface in the UI")
- Existing preset definitions beyond default controls (named curves like "75/25 retune" not yet codified as selectable presets)
- Specification of which presets and their names (listed as unresolved design decision)
- Tolerance value for gate assertions (to be set)

## Carry forward
- chromaEnvelope's model is `1 + shoulder - (damp/100) * sideW * |sd|^dampCurve` where sd is normalized stop distance from anchor (src/engine/tonal.js:498)
- Current shipped default 75/25 retune has dampCurve = log2(3), damp ≈ 0.905 (from comments, not yet extracted as preset)
- Envelope fixture (2920 instances) measures at stops 100/300/700/900; gate ratchets medians/p90 against test/engine/fixtures/chroma-envelope.json and enforces direction: 100 < 300, 900 < 700
- Gate suite: `npm run gate:chroma-envelope`, `npm run gate:even-dips`, `npm run gate:corpus-tonal` (via gate:sweeps)
- Presets currently live in per-category PRESETS arrays; architecture/brands/cuisine/film/literature/music/nature/travel each carry full preset + palette defs with inherited controls
