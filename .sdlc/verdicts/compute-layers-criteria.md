---
kind: criteria-review
plan: compute-layers
seat: verifier
pass: 3
ticket: none yet
written: 2026-10-03
---

# compute-layers criteria review · pass 3 · 🔴 at `2d86b64e`

Current state: pass 3 🔴 at `2d86b64e` (revision 2). The five pass 2 reds (C3.2, C4.2 to C4.5) are fixed and checkable, and C5.1's count is now relative. One new red: C5.4 now says earlier migration steps stay untouched, yet still expects `baseIntensity` on exactly one line in `src/` outside the generated asset; the untouched `stampIntensity` step in `persist.js` keeps the name on at least two more lines, so a build that follows the row reds it. Pass 2 and pass 1 follow as history.

verdict: 🔴
sha: 2d86b64e

Pass 2 lines: `verdict: 🔴` at `bc7d7597`.
Pass 1 lines: `verdict: 🔴` at `567de3a8`.

## Pass 1 · 🔴 at `567de3a8`: draft, three Phase 1 reds

Plan `.sdlc/plans/compute-layers.md` and `.sdlc/plans/compute-layers-adr-draft.md` at `567de3a8`, rows C1.1 to C5.2, graded by the Verifier seat directly. Every needle and "on `main`" value was read with `git show 567de3a8:<path>`. 🟢 means I can name now the command that fails if the unit is missing or wrong. 🔴 means the row as written cannot be graded: its Expected or control is false on today's tree, the command does not run, or it depends on an unruled choice.

## Rows

| # | State | Check I would run | Why / what to change, and the control |
|---|---|---|---|
| C1.1 | 🟢 | `grep -n "function controlsOf" src/ui/model.mjs src/engine/exports.js`; `grep -n "export function resolveControls" src/engine/controls.mjs`; import lines in both drivers | on `main` prints 2 lines (`model.mjs` and `exports.js`), so the control holds |
| C1.2 | 🔴 | `node test/engine/controls.mjs`, copied onto `main` first | The divergence is real: `model.mjs` `controlsOf` defaults `hueSpace` to `ENGINE_DEFAULT_CONTROLS.hueSpace` (`"oklch"`, `tonal.js` `DEFAULT_CONTROLS`), `exports.js` to `"cam16"` (its comment: a raw legacy state "was authored in cam16"). Deep-equal passes with either winner, so the row cannot tell a build that keeps the canvas's `"oklch"` from one that moves every hueSpace-less export (MCP or raw state) or the reverse. Name the unified default (or route it to the owner per the Risks row before mobilizing) and add the side it moves to a byte check: an export of a hueSpace-less state on `main` against HEAD, expected identical or the owner-accepted diff |
| C1.3 | 🟢 | `npm test`, `npm ci && npm run build`, `git status --porcelain` | control is crude (reverting the import breaks `exports.js` outright) but it does red the gate; adapter §1's `"scrim` rename would be the cleaner control |
| C1.4 | 🔴 | the adapter §1 `ramp-identity` row | As written the command exits on usage: `--identity-control` requires `--base <rev>` or `--base-dir <dir>` (`scripts/report-preset-fidelity.mjs` usage line), and `--authored` is what keeps anchors. "0 hexes moved" is not a line the tool prints; it prints `identity <mode>: P/T palettes, C/T cells differ` and `N differing cells`. Write the adapter row (`--base $(git merge-base origin/main HEAD) --authored`, and `--only default-kit`) and expect `0 differing cells`. Note the tool hydrates through persist, which stamps `hueSpace`, so it cannot see C1.2's raw-state default either way |
| C2.1 | 🔴 | `node test/engine/layers.mjs`; for each entry, `run` strict-equals a named export of a module under `src/engine/` | `geometry` has no engine function: `geometryScale` and `typeScaleFor` are in `src/ui/model.mjs`; `src/engine/geometry.mjs` exports constants and helpers (`sizeAnchor`, `mdAnchor`, `orderedSizeNames`), not a scale builder. An engine module importing `src/ui/model.mjs` inverts the layering the plan states. Name each layer's `run` (`controls` `resolveControls`, `group-chroma` `resolve.mjs` `rampChromaOf`, `ramp` `tonal.js` `paletteStops`, `prime` `prime.mjs` `primeSwatches`, `roles` `semantic.js` `semanticRoles` or `applyRoleOverrides`, `type` `type.mjs` `typeScale`, `geometry` to be stated: move `geometryScale` into the engine in U2, or allow `model.mjs` for that entry) so the strict-equal check has an answer key |
| C2.2 | 🟢 | the test; inputs checked against other layers' `outputs` and `Object.keys(defaultDocument())` | control as written reds; state that "a doc key" means a key of `defaultDocument()` so the check has one source |
| C2.3 | 🟢 | the grep as written | a correct build reds if a comment says "the document"; prefer `grep -nE '\b(document|window|localStorage)\.'`. Control holds |
| C2.4 | 🟢 | as C1.3 | ok |
| C3.1 | 🟢 | `grep -c "applyRoleOverrides(" src/ui/model.mjs src/engine/exports.js` | `1` and `1` on `main` (sum 2), as stated |
| C3.2 | 🟢 | `node test/engine/layers.mjs` | name the category loader (the one `report-preset-fidelity.mjs --only <category>` already uses) so "every curated category doc" has one count the verifier can match |
| C3.3 | 🟢 | adapter §1 `ramp-identity`, `npm test`, `npm run build` | `ramp-identity` is fully specified in the adapter; carry C1.4's fix if the bare `--identity-control` text stays |
| C4.1 | 🟢 | `serialize(defaultDocument()).layers` against `LAYERS` versions | ADR draft item 3 fixes the shape (`doc.layers = { ramp: 3, ... }`); control reds |
| C4.2 | 🔴 | n/a until Q1 | depends on Q1 (pins upgrade on load, or old versions stay runnable); the Expected is the recommended answer only |
| C4.3 | 🔴 | n/a until Q2 | depends on Q2 (whether exports stamp pins, and whether that is `EXPORT_SCHEMA_VERSION` 4); state the version expectation once ruled |
| C5.1 | 🔴 | `git show main:src/engine/tonal.js \| grep -c 'hueSpace === "oklch"'` | depends on Q3; and the control is stale: `main` prints `6`, not `5` |
| C5.2 | 🔴 | `grep -rn "baseIntensity" src/` | depends on Q3. The control undercounts: hits also in `src/ui/sections/color.js` and the generated `src/ui/describe-mcp-assets.js`, besides `model.mjs` and `persist.js`. `baseIntensity` is a persisted field (`persist.js` `DOMAINS`), so renaming it needs a stated load rule under R98 (no migration), named in the row |

## Findings

1. 🔴 C1.2: name the unified `hueSpace` default and pin the path it moves with a byte check, or rule it with the owner first.
2. 🔴 C1.4: the command needs `--base` (use the adapter `ramp-identity` row) and an Expected the tool prints (`0 differing cells`).
3. 🔴 C2.1: `geometry` has no engine function; name every layer's `run` and resolve where geometry's lives.
4. 🔴 C4.2, C4.3, C5.1, C5.2 wait on Q1 to Q3 (U4, U5 only); C5.1's `main` count is `6`; C5.2's control misses two files and a persisted-field load rule.
5. 🟡 C2.3's grep reds on prose; C1.3's control is crude. Neither blocks.

## Pass 2 · 🔴 at `bc7d7597`: Phase 1 clean; five U3 and U4 rows uncheckable

verdict: 🔴
sha: bc7d7597

Plan and ADR draft at `bc7d7597` (revision 1), all rows, graded by the seat directly. Facts read with `git show bc7d7597:<path>`; the preset census ran `node` over `src/ui/categories/*.js` (`PRESETS` lengths and each entry's `hueSpace`).

| # | State | Check I would run | Why / what to change, and the control |
|---|---|---|---|
| C1.1 | 🟢 | the three greps | control holds (`2` lines on `main`) |
| C1.2 | 🟢 | `node test/engine/controls.mjs`; part (b) runs `exportJSON` from a base-tree clone | pass 1 red fixed: the winner is named (`"oklch"`, `tonal.js` `DEFAULT_CONTROLS`) and the moved export path has a byte check |
| C1.3 | 🟢 | gates, `git status --porcelain` | adapter §1 control |
| C1.4 | 🟢 | `IDENT` twice | pass 1 red fixed: `--base` present, Expected is the tool's own `0 differing cells`; the hard-coded `cam16` control moves every OKLCH-native doc |
| C2.1 | 🟢 | `node test/engine/layers.mjs`, strict-equal per id | pass 1 red fixed: every `run` named, and `geomScale` exists in the engine (`export function geomScale(config = {}, opts = {})`, `src/engine/geometry.mjs`) |
| C2.2 | 🟢 | the test | "a doc key" is now `defaultDocument()`'s keys |
| C2.3 | 🟢 | the tightened grep | prose no longer reds it |
| C2.4 | 🟢 | gates and `IDENT` | ok |
| C3.1 | 🟢 | the grep | `1` and `1` on `main` |
| C3.2 | 🔴 | the test's printed count | "count equal to the report's subject count": `report-preset-fidelity.mjs` prints no preset or subject count (its identity line counts palettes, `P/T palettes`, a different unit). The census at `bc7d7597` is `343` presets over 8 category files (architecture, cuisine, film, literature, music, nature, travel `48` each, brands `7`), plus the default kit. Name that figure, or the formula (sum of `PRESETS.length` over `src/ui/categories/*.js` except `index.js`) |
| C3.3 | 🟢 | `IDENT`, gates | ok |
| C4.1 | 🟢 | the test | control bites |
| C4.2 | 🔴 | none runnable as written | "the doc the preset-apply path produces" names no function. In the app, a preset opens through `openConfigAsSet` in `src/ui/app.js` (DOM side), and the preset is read through `hydrate(preset)` (`app.js`, the preset tile). A preset carries no `layers` field, so the same `hydrate` that C4.3 pins to version 1 for a pre-pin doc would pin a preset to version 1 too, against R100. Name the function that stamps latest, where it sits relative to `hydrate`, and whether the check is an engine test or a shim assertion. The count inherits C3.2's fix |
| C4.3 | 🔴 | the test and `IDENT` | At U4 every layer is version 1 (U5 adds `ramp@2`), so "hydrate to version 1" and "hydrate to latest" render the same bytes, and the stated control only runs "after U5 lands". At U4 grading time the row has no control that can fail. Use C4.4's synthetic `test-layer@1` and `@2`: a stored doc with no `layers` hydrates to `test-layer: 1`, and the control (hydrate to latest) reds on that pin. Note also that `IDENT` hydrates through the BASE tree's `persist.js` (adapter §1), so it never exercises HEAD's no-`layers` rule |
| C4.4 | 🔴 | the test; the hash check | The run-by-pin half is checkable. The hash half's control ("append a comment to a frozen file") needs a frozen file at U4, and none exists until U5 freezes `ramp@1`. Say that the synthetic `test-layer@1` and `@2` modules live under `src/engine/layers/` and are hashed in `FROZEN.json` (or wherever they live, are hashed), or move the hash criterion to U5 |
| C4.5 | 🔴 | the test over each exporter | The row lists 10 names (CSS, OKLCH, JSON, DTCG, UI3, Tailwind, shadcn, Panda, Radix, design-system) and then expects "10 formats plus the bundle", 11. And "next to the schema stamp": `exportCSS` has no schema stamp today (`grep -c schema` over its body is `0`), and Panda and Radix stamp in `exportPandaModule` and `exportRadixModule`, not `exportPanda` or `exportRadix`. Name the exact exporter functions the test calls, their count, and what CSS gets (a new stamp line, or excluded) |
| C4.6 | 🟢 | gates | ok |
| C5.1 | 🟢 | the two greps | Holds today (`6`). The frozen copy is taken at U5 after #785 U2 and #766 U2 edit `tonal.js`, so `6` is a prediction; stating it as "equal to `grep -c 'hueSpace === \"oklch\"'` on `src/engine/tonal.js` at U5's merge base" keeps it true. `tonal.js` also carries `hueSpace` in `DEFAULT_CONTROLS` and `effHue`, which U1's resolver default reads; U5 has to rehome that default for `0` |
| C5.2 | 🟢 | the test | control bites |
| C5.3 | 🟢 | the fixture test | control bites |
| C5.4 | 🟢 | the grep, the schema constant, the hydrate test | checkable. "Only the `RENAME_MAPS` entry, 1 line" also requires rewriting the older `stampIntensity` migration step in `persist.js` (today `typeof s.baseIntensity` and `{ ...s, baseIntensity: 100 }`) and its comments, not just the live field; the builder should know |
| C5.5 | 🟢 | regenerate, grep | ok |
| C5.6 | 🟢 | gates, `IDENT` | the premise holds: all `343` presets carry `hueSpace: "oklch"` (census), and `defaultDocument()` uses the engine default |

### Findings

1. 🟢 Phase 1 (U1, U2) rows are all checkable; every pass 1 red is fixed.
2. 🔴 C3.2 (and C4.2 by reference): name the preset count, `343` at `bc7d7597`.
3. 🔴 C4.2: name the latest-stamping function and its order against `hydrate`, which today reads presets too.
4. 🔴 C4.3 and C4.4: give each a control that runs at U4, using the synthetic two-version layer, and hash it.
5. 🔴 C4.5: name the exporter functions and count, and rule CSS's missing stamp.
6. 🟡 C5.1's `6` is a prediction across two in-flight `tonal.js` units; C5.4 reaches into an older migration step.

## Pass 3 · 🔴 at `2d86b64e`: pass 2 reds fixed; C5.4 now contradicts itself

verdict: 🔴
sha: 2d86b64e

Revision 2 at `2d86b64e`, graded by the seat directly on `git diff bc7d7597 2d86b64e -- .sdlc/plans/compute-layers.md` (C3.2, C4.2 to C4.5, C5.1, C5.4, the head line and the revision row). Facts read with `git show 2d86b64e:<path>`. Rows not listed carry over 🟢 from pass 2.

| # | State | Check I would run | Why / what to change, and the control |
|---|---|---|---|
| C3.2 | 🟢 | the test's `presets N` line | `N` is now stated: the sum of `PRESETS.length` (`343` at `bc7d7597`, my census) plus 1, so `344`. Control bites |
| C4.2 | 🟢 | the engine test with `test-layer` registered; `grep -n "presetDoc(" src/ui/app.js` | `presetDoc` = `pinLatest(hydrate(preset))` resolves the pass 2 clash with C4.3, and the control (`hydrate` alone) reds on the synthetic `test-layer` reading `1`. `openConfigAsSet` serves four callers today (the preset tile, the saved file, the Figma read, the project load); the row correctly scopes `presetDoc` to the preset tile. Note: `presetDoc` in `src/engine/layers.mjs` imports `hydrate` from `src/ui/persist.js`. That file is DOM-free (its only `window.` and `localStorage` hits are in a comment, and it imports only `src/engine/` modules), so purity holds, but the engine gains its first import from `src/ui/`; worth one line in the ADR |
| C4.3 | 🟢 | the engine test; control `hydrate` pins latest | the control now runs at U4 through `test-layer` |
| C4.4 | 🟢 | the test; append a comment to `test-layer@1.mjs` | the hash half has a file to bite on at U4 |
| C4.5 | 🟢 | the test, `10/10` | ten functions are named. `exportPandaModule(preset)` and `exportRadixModule(preset, opts)` take the preset objects `exportPanda` and `exportRadix` return, not a document, and `exportDesignSystemBundle` takes `(state, typeSc, geomSc, opts)`; "on `defaultDocument()`" means through those producers, which the test can do. The CSS stamp is now ruled |
| C5.1 | 🟢 | the two greps | relative to the merge base, as pass 2 suggested |
| C5.4 | 🔴 | `grep -rn "baseIntensity" src/ --exclude=describe-mcp-assets.js` | The new scope note says "earlier migration steps are untouched", but `persist.js` at `2d86b64e` carries `baseIntensity` in the `stampIntensity` step (the `typeof s.baseIntensity !== "number"` test and the `{ ...s, baseIntensity: 100 }` stamp) and its comment above, besides the live `DOMAINS` field, its comments and the `hydrate` clamp. Left untouched, that step alone keeps 2 code lines plus 1 comment, so the grep prints at least 4 lines, not 1. Either let the earlier steps change (the pass 2 note), or keep them and expect the `RENAME_MAPS` entry plus the named `stampIntensity` lines (for example, grep outside the migration table, or an exact line list) |

### Findings

1. 🔴 C5.4: "earlier steps untouched" and "1 line" cannot both hold; pick one and restate the Expected.
2. 🟡 C4.2: the engine's first import from `src/ui/` (`hydrate`), DOM-free today; state it in the ADR so a later `persist.js` edit knows the engine depends on it staying pure.
