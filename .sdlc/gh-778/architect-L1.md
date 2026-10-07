<!-- role=architect level=L1 model=fable effort=high -->
## Approach

The chroma envelope already has one implementation (`chromaEnvelope`, `src/engine/tonal.js:477`), but three other copies of "the curve" exist and all three are stale since #725 added the perceptual/peak mode map (`OKHSL_DAMP_D`, `OKHSL_DAMP_RESIDUE_EXP`, `OKHSL_DAMP_CURVE_GAIN`, tonal.js:461-476): the pseudocode in `docs/references/knowledge-02-tonal-scale.md:146`, the copy in `.claude/skills/color-math/references/foundations.md:96`, and the UI graph `graphDamping` (`src/ui/sections/color.js:188-199`, legacy formula on the nominal stop, no mode map, no even plateau). "The curve as the spec" means: one ADR states the closed form including the mode map, the stale copies are repaired to it, and the gates compare against that form rather than against frozen pixel statistics.

The load-bearing design decision is what the gate compares and in which unit. The envelope multiplies different quantities per path: OKHSL `s` on perceptual/peak (`holdTone(hue, keyS, l, env)`, tonal.js:1360 and 1477), CAM16 `intended` on even (`evenChroma`, tonal.js:347). The current gate measures CAM16 C/C500 in every mode (`scripts/lib/envelope-measure.mjs`), which on the OKHSL paths is env composed with the L* ladder's gamut geometry, which is why the ruled bars missed and needed rulings (ADR-026 Consequences, "mechanism 3"). The new gate therefore measures in the unit the curve acts in, and splits in two: Gate A asserts curve exactness before quantization, Gate B bounds the quantization residue once. To make that possible the stop record (already carrying `maxc`, `inGamut`, `capped`, `toneTarget`) gains `env`, `model` (the continuous post-clamp chroma in the path's unit), on even also `basis` and `floor`, and `refined` (set by `enforceMonotonePixelL`). `src/ui/model.mjs:976` copies record fields by name and both ramp fixtures map `.hex`, so the fields cannot move any export; the identity run proves it.

Gate A: `record.env` equals the gate's own closed form (sliders, mode map, curve, re-derived from the exported constants, never by calling `chromaEnvelope`, the discipline `test/engine/tonal.mjs:195` already uses) to 1e-12 at every stop; on perceptual/peak `model/model500 === env` wherever no clamp binds; on even `model === min(maxc, max(basis*env, floor))` (plus the dampAmp-0 `min(., anchorChroma)` cap on the unanchored path, tonal.js:1040). Clamps are named in the model (gamut ceiling, even floor, peak joint cap via `capped`), not in a number. Gate B: `|readback(emitted) - record.model| <= TOL`, TOL stated once in 8-bit code steps measured at the pixel (one step for plain stops; `enforceMonotonePixelL`'s RADIUS 3 for `refined` stops; `capped` stops one-sided). The residue sources are now complete and named: 8-bit rounding (every stop), the monotone post-pass (anchored paths only, tonal.js:921 and 1393, flagged `refined`), and `refineNearestRgb`, which runs only inside `capChromaAtHeldTone` (tonal.js:1276), so `capped` names it. The TOL constant is ruled from a probe (residue distribution over the corpus, both stop sets, anchored and gate path), not guessed. The direction leg stays, fixture-free; the ratchet fixture, `--capture/--compare`, `SLACK`, and the gate's reads of `NAMED_EXCEPTIONS`/`OVER_90_AT_300` go (the report keeps printing them). Negative controls of both kinds: a wrong model fed to the gate (`--spec dampCurveGain=1`) and a planted engine regression loaded from a scratch tree (the `--base-dir` loader precedent, `scripts/report-preset-fidelity.mjs:67`, passed as `measureEnvelope({ engineDir })`, since ESM bindings are read-only and the C7 control only text-patches).

Presets live in slider space, not in effective (d, c): the retune is a mode-scoped map of the sliders, so one slider quadruple yields a different effective curve per mode, and that map is part of the spec. Two shipped settings exist, not one: the kit default 80/1.5/0/0 (`DEFAULT_CONTROLS`) and the curated corpus 70/1.5/0/0 (342 of 343 presets; Adia 89/1.3/70/0). The presets table already exists in the UI as `DAMP_PRESETS` (`src/ui/app-helpers.mjs:348`) with a chip row (`color.js:160`), so the UI question is moot; the table moves to the engine as `ENVELOPE_PRESETS` with an `envelopePresetOf(controls)` matcher (no persisted field, no migration), gains the curated 70/1.5/0/0 entry (which has no chip today; "Vivid mids" is 70/1.5/55, kept as an opt-in per `test/ui/headless-boot.mjs:1482`), and a pure unit test asserts the curated preset's perceptual form meets the ruled bars (env(300) <= 0.75, env(100) <= 0.25). The ADR states how an anchored ramp deviates: the basis changes (the anchor's own OKHSL `s`, constant, on perceptual/peak, tonal.js:1361; the `anchorChromaBasis` smoothstep blend from the anchor's CAM16 C toward the hue's peak on even, tonal.js:613 and 897) and a source outside the L* window renders its pivot at the window edge; the curve itself is unchanged and passes through the anchor (env(500) = 1 exactly, stop 500 emits the anchor verbatim when unclamped).

Manifest: `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.sdlc/gh-778/decompose/manifest-v1.json` (technical-architecture, plan mode), coverage_check clean, 20 nodes, 17 actions, 14 edges, quadrant load-bearing.

## Interfaces

- `src/engine/tonal.js`: `export const ENVELOPE_PRESETS = [{ name, damp, dampCurve, dampAmp, dampBias }]` and `export function envelopePresetOf(controls)` (name or null). `chromaEnvelope` verbatim; the `chromaEnvelope(` count stays 5 (C7, `test/engine/tonal.mjs:1308-1313`).
- Stop record (all four call sites: tonal.js:888, 973, 1360, 1434): `env: number`, `model: number` (OKHSL s on perceptual/peak, CAM16 C on even), even only `basis: number`, `floor: number`; `enforceMonotonePixelL` (tonal.js:782) sets `refined: true` on a swapped stop.
- `scripts/lib/envelope-measure.mjs`: `measureEnvelope({ ..., engineDir })` loads the engine from a tree (the `--base-dir` precedent); returns `residues` (per instance x mode x stop: readback minus model, in path unit and in local code steps) beside the unchanged READING (a) results.
- `scripts/report-preset-fidelity.mjs`: `--envelope-residue` prints max/p99/p50 residue per mode x stop set x anchored/gate path and top witnesses (the probe TOL is ruled from).
- `test/engine/chroma-envelope-gate.mjs`: rewritten; flags `--spec <param>=<value>` (wrong model), `--engine-dir <tree>` (planted regression); `--capture/--compare/--damp-amp/--fixture` removed. `package.json` `gate:chroma-envelope` unchanged.
- `test/engine/fixtures/chroma-envelope.json`: deleted.
- `test/engine/tonal.mjs`: new `envelope-presets` check (bars + env(500)===1 per preset per mode) with an in-test negative control.
- `src/ui/app-helpers.mjs:348`: `DAMP_PRESETS` becomes a re-export of `ENVELOPE_PRESETS`; `src/ui/sections/color.js:160` `dampPresets()` highlights via `envelopePresetOf`; `color.js:188` `graphDamping` calls `chromaEnvelope(stop, 500, 0, {...doc})`.
- `docs/references/decision-records.md`: ADR-029 before the Quick map (line 920) plus a Quick map row; `docs/references/knowledge-02-tonal-scale.md` section 5 pseudocode + presets table + anchored statement; `.claude/skills/color-math/references/foundations.md:96` and `SKILL.md:115-122` repaired.

## Constraints and assumptions

- Record fields cannot move exports: `src/ui/model.mjs:976-979` copies `maxc`/`inGamut`/`capped` by name; `scripts/gen-tonal-fixture.mjs:26` and `gen-ramp-fixture.mjs:13` map `.hex`; no `deepStrictEqual`/`JSON.stringify` of whole records in `test/engine/*.mjs` or headless-boot: verified by grep.
- The envelope multiplies OKHSL `s` on perceptual/peak and CAM16 `intended` on even: verified at tonal.js:1360-1368, 1477, 347-350, 888-901.
- Residue sources are exactly rounding, `enforceMonotonePixelL` (anchored paths only, 921 and 1393) and `refineNearestRgb` (only via `capChromaAtHeldTone`, 1276): verified by grep of callers.
- The shipped perceptual/peak constant is `OKHSL_DAMP_D = 0.9275` (tonal.js:474), not "about 0.905" (the window's lower bound, tonal.js:464): verified by reading.
- Corpus slider settings are 70/1.5/0/0 x342 and 89/1.3/70/0 x1; kit is 80/1.5/0/0: verified by a node probe over `src/ui/categories/*.js` and `DEFAULT_CONTROLS`.
- Presets already surface in the UI (`color.js:160` chips, `app-helpers.mjs:348`); the scout's "not found" is wrong: verified by reading.
- Adding `basis`/`floor`/`env`/`model` at the even anchored call site is possible without restructuring `chromaAt`'s hue solve (tonal.js:895-901 computes them inside a closure): unverified.
- TOL in local code steps (1 plain, 3 refined) holds over the whole corpus: unverified, the probe decides; a flat scalar in the path unit is the fallback.
- `graphDamping` SVG is not snapshotted by headless-boot (grep found no `dg-unity`/`graphDamping` in `test/`): verified by grep.
- Even-mode Gate A's `min(., anchorChroma)` cap at dampAmp 0 equals `min(., model500)` on the unanchored path (tonal.js:1040, `anchorChroma` computed by the same formula at stop 500): verified by reading, exactness to be confirmed by the gate itself.

## Rejected alternatives

- Tolerance around the existing CAM16 C/C500 reading: that quantity is env times gamut geometry on the OKHSL paths; a scalar tolerance there has to absorb the ladder's nonlinearity and the saturated-near-white ceiling case (model 0.3, ceiling 0.05), which is the per-key-exception pressure the issue is removing.
- Extracting an `envelopeParams` helper from `chromaEnvelope`: the gate must not read it (independence), the graph can call `chromaEnvelope` directly, and the extraction adds a byte-identity risk for no gate benefit.
- Presets in effective (d, c) units: needs a per-mode inverse of the slider map and would not match the knobs the document stores.
- Keeping the ratchet fixture beside the model gate: two gates on one property; the fixture pins discrete outputs, which is the defect.
- Widening to `even-dips-gate.mjs`, `KNOWN_BASELINE_DUP`, `GRID_R2_EXCEPTIONS`, `CAP_L_EXCEPTIONS`: L*-rise, dup-hex and floor-reference predicates; a chroma-curve tolerance does not justify touching them. `even-dips` copies its own `findDips` and reads no envelope fixture (`even-dips-gate.mjs:9-11`).
- A new preset `<select>` UI: the chip row exists; only its data source moves.

## Risks

- If the probe shows the local-code-step residue bound is exceeded by anchored-path stops after the monotone pass beyond RADIUS (a chain of swaps), TOL's form must change to a flat scalar and the gate weakens in the mids.
- Dropping the `cuspRuns`/`above100` ratchet removes the only enforced bound on CAM16 overshoot statistics the owner ruled on (R74, R76); if the owner wants them kept, they return as a separate, report-shaped gate, not as part of this one.
- Adding fields at the even anchored call site touches `chromaAt`'s solve closure; a clumsy edit there moves bytes. The identity run against `4801994f` is the detector.
- The owner may rename or cut presets; the names are the conductor's question, together with the TOL constant after the probe. Nothing else is unresolved.
- `graphDamping` change is byte-neutral but visible; if Safari rendering of the SVG differs, smoke catches it, headless does not.

## Carry forward

- `chromaEnvelope` at `src/engine/tonal.js:477-499`; mode map constants at tonal.js:434, 460, 474-476; C7 pins `chromaEnvelope(` count at exactly 5 in tonal.js (`test/engine/tonal.mjs:1308-1313`).
- Shipped perceptual/peak retune is `OKHSL_DAMP_D = 0.9275`, `c = log2 3` (tonal.js:461-476); the issue's "about 0.905" is the window's lower bound.
- Envelope multiplies OKHSL `s` on perceptual/peak (tonal.js:1360, 1477 via `holdTone`) and CAM16 `intended` on even (tonal.js:347 `evenChroma`, called at 901 and 1037).
- Residue sources: 8-bit rounding; `enforceMonotonePixelL` only on anchored paths (tonal.js:921, 1393, RADIUS 3); `refineNearestRgb` only inside `capChromaAtHeldTone` (tonal.js:1276), flagged `capped`.
- Even anchored basis is `anchorChromaBasis` smoothstep from anchor C toward `peakC(seedHue).c` (tonal.js:613-618, 862, 897); OKHSL anchored basis is `anchor.okhsl.s` constant (tonal.js:1361).
- `src/ui/model.mjs:976-979` copies stop-record fields by name; ramp fixtures map `.hex` (`scripts/gen-tonal-fixture.mjs:26`, `gen-ramp-fixture.mjs:13`): new record fields cannot move exports.
- Presets UI exists: `DAMP_PRESETS` at `src/ui/app-helpers.mjs:348-355` (6 entries), chips at `src/ui/sections/color.js:160-182`, sliders at color.js:2093-2105; `test/ui/headless-boot.mjs:1482` asserts "Vivid mids" keeps amp 55.
- Corpus slider settings: 70/1.5/0/0 x342, 89/1.3/70/0 x1 (node probe over `src/ui/categories/*.js` PRESETS); kit 80/1.5/0/0 (`DEFAULT_CONTROLS`, tonal.js:33-39); no chip exists for 70/1.5/0/0.
- Stale copies of the curve to repair: `docs/references/knowledge-02-tonal-scale.md:146` block (and the "legacy ... exactly" claim near line 182), `.claude/skills/color-math/references/foundations.md:96`, `SKILL.md:115-122`, `src/ui/sections/color.js:188-199` `graphDamping`.
- Current gate: `test/engine/chroma-envelope-gate.mjs` (ratchet, SLACK 0.05, direction leg); fixture `test/engine/fixtures/chroma-envelope.json` (n 2920, capturedAt 19ce51c4); measurement in `scripts/lib/envelope-measure.mjs` shared with `scripts/report-preset-fidelity.mjs --envelope`.
- Engine-from-a-tree loader precedent: `scripts/report-preset-fidelity.mjs --identity-control (--base <rev> | --base-dir <dir>)` (lines 62-67, 481+); the byte-identity acceptance run is `--identity-control --base 4801994f`.
- ADRs append to `docs/references/decision-records.md` before `## Quick map` (line 920); last is ADR-028 (line 887).
- `gate_lock.py` is at `/Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.0/scripts/gate_lock.py`, not in the repo.
- Out of scope, untouched: `even-dips-gate.mjs`, `mode-isolation-gate.mjs`, `KNOWN_BASELINE_DUP`, `GRID_R2_EXCEPTIONS`, `CAP_L_EXCEPTIONS`, C6 (i)/(ii) in `test/engine/tonal.mjs`.
- Decisions for the conductor: the preset set and names (proposal: keep six, add the curated 70/1.5/0/0), and the TOL constant after the `--envelope-residue` probe.
