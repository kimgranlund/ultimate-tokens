<!-- role=architect level=L1 model=fable effort=high -->
## Approach

The mode is one document-level boolean, `matchPeerLightness` (default `false`), read by the existing `ramp@1` layer. It cannot be a peer-derived pivot: `compute` runs the ramp layer once per palette with only that palette's fields and the resolved controls (`src/engine/layers.mjs:147-155`), so "same lightness across peers" has to be a palette-independent target every ramp hits alone. The target is the tone mode's own palette-free ladder, exposed as one helper `sharedToneAt(stop, controls)` in `src/engine/tonal.js` returning CIELAB L*: for `even`, `toneAt(stop, 0, 0, {curve, lmin, lmax, tension})`; for `perceptual` and `peak`, the neutral-grey L* of `lerp(okhslLAt(lmax), okhslLAt(lmin), (stop-50)/900)`. The T-0039 report already measured this configuration (even, no anchor, skew 0, lift 0) as the one that aligns, L* spread 0.2 to 0.4 over 3,780 corpus palettes.

Stop 500 under the mode: not the anchor pixel. Both anchored builders already carry the construction needed, the `clamped` case (`tonal.js:881` and `:1418`), which drops the `stop === 500 && !clamped` verbatim return and builds 500 from the ladder. Match mode is "clamped with a different pivot": `pivotTone = sharedToneAt(500)` in `paletteStopsAnchored`, and in `okhslStopsAnchored` the per-stop `l` is solved for `sharedToneAt(stop)` at the anchor's hue and enveloped `s` (`solveLForTone`, `tonal.js:1149`). With that pivot and skew/lift 0, `anchorLerp`'s affine remap is exactly `toneAt` again, so the even branch collapses to the shared ladder with no new math. The anchor's hue still holds in the chosen hue space (the per-stop solves at `:946` and `:1457` take the new tone unchanged, ADR-031 survives) and the anchor's chroma basis still seeds 500 (`anchor.cam.chroma` / `anchor.okhsl.s`), subject to the gamut ceiling at the shared lightness: a dark saturated anchor lifted to the shared 500 loses chroma, and the mode says so in its helper text. The prime ladder and `prime.DEFAULT` are untouched, so the token stays exact and `anchor-identity` stays green.

Skew and lift: ignored for lightness (the only choice that passes the done-when, Warning carries skew 40 and lift -36); lift still keys `chromaEnvelope` and `anchorChromaBasis`, which are chroma terms. Vibrancy and cusp pull: `t = 0` for lightness (`cuspL` is hue-dependent, `tonal.js:1500`); `peak` degenerates to `perceptual` for lightness and keeps its joint chroma cap, whose ceiling must then come from the construction (`preCap(500).chroma`, as the clamped case does at `:1471`) and `okhslStops`'s `anchorChroma` (`:1550-1553`) must be read at the shared lightness, not `lightnessAt(500, 1)`. Unanchored palettes take the same ladder (effStop and toneAt read skew 0, lift 0; `holdTone` holds to the shared L*). Radix steps 9 to 12 and the 53 roles read stops 550/650/750/950 of this ramp and need no mechanism; the gate asserts them.

No `ramp@2`. ADR-034 §1 bumps a version when output changes for an existing input; a new control defaulting off is byte-neutral for every stored document and preset, and §4's "shim" rule is about branches for old input, not new. No export surface serializes the resolved controls (`exports.js:441` emits only `baseChroma`/`primeChroma`; `stateOf` and `defaultDocument` enumerate keys by name), so the neutrality tool reads 0 cells with the mode off. Decomposition manifest: `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.sdlc/match-peer-lightness/decompose/manifest-v1.json` (technical-architecture, plan mode, coverage check exit 0, 21 nodes, 18 actions).

## Interfaces

- `src/engine/tonal.js`: `DEFAULT_CONTROLS.matchPeerLightness = false` (the resolver picks it up by key loop, `src/engine/controls.mjs:17`); new export `sharedToneAt(stop, controls) -> L*`; `holdTone(hue, sBasis, l, env, target?)` gains an optional fifth parameter (the existing four-argument form stays byte-identical for `dampStops` at `:1612` and the mode-off paths); match branches in `paletteStopsAnchored` (`:854`), `okhslStopsAnchored` (`:1390`), `okhslStops` (`:1491`) and the unanchored even path (`:996`), each gated on `controls.matchPeerLightness === true`.
- `src/engine/layers.mjs:76`: `controls.inputs` adds `"matchPeerLightness"` (`test/engine/layers.mjs:122` compares it to `DEFAULT_CONTROLS` keys). `layer-pins.mjs` `LATEST` unchanged.
- `src/ui/persist.js`: hydrate line `matchPeerLightness: s.matchPeerLightness === true` beside `relChroma` (`:746`, no DOMAINS entry); `CURRENT_SCHEMA_VERSION` 10 to 11 and a stamp-only `RENAME_MAPS` entry `{ version: 11 }` (the `:338` rule).
- `src/ui/model.mjs`: `defaultDocument` (`:448-462`), `docControls`, `stateOf` (`:582-600`) carry the key.
- `src/ui/sections/color.js`: a third segmented field "Match peer lightness" Off/On in the global row beside Hue space (`:2085-2130`), committing `doc.matchPeerLightness`; the Skew/Cusp pull/Vibrancy gates (`:1777`, `:1781`, `:2036`) add `&& !match`; Lift stays visible in `even` with title text "shades chroma only while Match peer lightness is on".
- `test/engine/peer-lightness.mjs` (new, registered in `test/run.mjs:13`): default kit, mode on, three tone modes, 25 stops plus Radix 12 steps in both schemes, L* measured from the emitted hex with `lstarFromRgb`; mode-off spread printed and asserted above a floor; a negative control. `test/engine/anchor.mjs` C3 and `test/engine/tonal.mjs` `vibrancy`/`cusp-pull` gain a mode-on control line (new names go into `DECLARED`, `tonal.mjs:2303`).
- `docs/references/decision-records.md`: ADR-035 before the Quick map plus a Quick-map row, scoping ADR-026's stop-500-verbatim and ADR-031's anchor-verbatim clauses to mode off. `docs/references/knowledge-02-tonal-scale.md` §9 exactness table, `.claude/skills/color-math/SKILL.md:42`, `docs/references/changelog.md`.

## Constraints and assumptions

- The ramp layer sees one palette at a time, no peers: verified at `src/engine/layers.mjs:147-155`.
- With pivot = the ladder's own 500 and skew/lift 0, `anchorLerp` reduces to `toneAt` exactly: verified algebraically from `tonal.js:746-756` and `:658-668` (affine remap of the unit read onto `[lmin, lmax]`) | numeric confirmation is the builder's.
- No shipped surface emits the resolved controls object, so a defaulted new key is neutral: verified by `grep` over `src/engine/exports.js` (`:441` emits two keys), `src/engine/ds-export.js`, `model.mjs` `stateOf`/`projectView` (no `controls` leaf returned).
- Hydrate enumerates output keys by name, so an unlisted key is dropped silently: verified at `persist.js:736-760`.
- `ramp@1` is live code, not a frozen module; only `test-layer@1/2` are frozen: verified by `ls src/engine/layers/` and `FROZEN.json`.
- The eight sweeps are `gate:sweeps` in `package.json:38`: verified.
- OKHSL `l` solved per palette for a shared L* lands within 8-bit rounding of it: unverified (the gate threshold must be set from a measurement run, expected about 1.0 L*, the even-mode floor 0.2 to 0.4 plus rounding and `enforceMonotonePixelL`).
- `src/ui/describe-mcp-assets.js` (generated) may move when `defaultDocument` gains a key: unverified; expected tree churn under `npm test`, not a neutrality fail.

## Rejected alternatives

- `ramp@2` with a pin: the first real frozen module would be most of `tonal.js` (1,635 lines) hash-gated; every preset re-pins to latest (`persist.js:778`) and three exports stamp pins (`exports.js:440`, `:598`, `:665`), so the stamp line of all 343 presets would move with the mode off, failing the done-when.
- A peer-derived shared pivot (mean anchor L*): needs a document-level stage and makes every ramp depend on which palettes are enabled; breaks the per-palette layer shape.
- Re-basing skew/lift about the shared pivot: per-palette skews still diverge the lightness, Warning alone fails the gate.
- Borrowing the even logistic L* ladder for the perceptual path: would reshape perceptual ramps, not only align them.
- Options D and E of the report: non-goals in the handoff.

## Risks

- Anchor chroma clipping at the shared tone can make a dark saturated anchor (Warning `#774902`) read visibly muted at 500 with the mode on; a product surprise, not a gate failure.
- `peak` semantics: lightness no longer puts the cusp at 500, so "peak" differs from "perceptual" only by the chroma cap; if the user wants peak to mean more, the design is wrong.
- The `renderAt` closure inside `solveOkhslHueForCam16` (`:1457`) calls `holdTone`; if the cam16 hue solve does not receive the same shared target, cam16 ramps misalign by the hold difference.
- A threshold too tight under rounding and `enforceMonotonePixelL` makes the gate flaky; set it from measurement.
- Skipped per brief: the decompose skill's "add `Decomposition: decompose/report.md` under the handoff's Context" step (the planner or conductor adds it).

## Carry forward

- Ramp layer is per-palette with no peer access: `src/engine/layers.mjs:147-155`.
- Anchored pivots: `pivotTone` at `src/engine/tonal.js:882`, `pivotL` at `:1423`; verbatim stop-500 returns at `:912` and `:1473`; `clamped` at `:881` and `:1418`.
- `anchorLerp` at `tonal.js:746`; `toneAt` at `:658`; `effStop` at `:1140`; `lightnessAt` at `:1508`; `solveLForTone` at `:1149`; `holdTone` at `:1168` (target computed at `:1170`).
- Peak cap ceilings: anchored `:1471`, unanchored `anchorChroma` `:1550-1553`.
- `DEFAULT_CONTROLS` at `tonal.js:28-91`; resolver key loop at `src/engine/controls.mjs:17`; `controls.inputs` at `layers.mjs:76`, checked by `test/engine/layers.mjs:122`.
- Hydrate output enumeration at `src/ui/persist.js:736-760`, `relChroma` pattern at `:746`; `CURRENT_SCHEMA_VERSION = 10` at `:383`; v10 entry at `:453-458`; bump rule at `:338-352`.
- `defaultDocument` controls at `src/ui/model.mjs:448-462`; `stateOf` keys at `:582-600`.
- Inspector: global row `src/ui/sections/color.js:2085-2130`; Skew/Lift gates `:1777-1778`; Cusp pull `:1781`; Vibrancy `:2036`.
- JSON export emits only `baseChroma`/`primeChroma` (`src/engine/exports.js:441`); grep `toneMode|hueSpace|relChroma` over `src/engine/exports.js`, `src/engine/ds-export.js` finds no serialized controls.
- Frozen layers: only `src/engine/layers/test-layer@{1,2}.mjs` in `FROZEN.json`.
- Gates: `anchor-ramp` C3 at `test/engine/anchor.mjs:477`; `vibrancy`/`cusp-pull` at `test/engine/tonal.mjs:345-404`; `DECLARED` at `:2303`; run list `test/run.mjs:13`; sweeps `package.json:38`.
- Neutrality: `scripts/report-compute-neutral.mjs --base <merge-base>` (a one-side-only key counts as a differing cell, `:250`); `ramp-identity` with `--authored` per `.sdlc/adapter.md:39`.
- Report measurements: `.claude/worktrees/agent-adc629a9791e0c876/docs/reports/2026-10-08-peer-luminosity.md` Table 3 row 6 (aligned config) and row 1 (default, 15.4 L* at 500).
- Manifest: `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.sdlc/match-peer-lightness/decompose/manifest-v1.json`, report beside it; coverage check exit 0 in plan mode.
