---
kind: criteria-review
plan: compute-layers
seat: verifier
pass: 7
ticket: 788
written: 2026-10-03
---

# compute-layers criteria review · pass 7 · 🟢 at `8353f1e6`

Current state: pass 7 🟢 at `8353f1e6` (revision 5 as amended, ticket #788). C3.3's control now names `rampChromaOf` in `src/engine/resolve.mjs`, the shared `group-chroma` run that IDENT's head side reaches, so it is live. Every row C1.1 to C5.6 is checkable; U3 can be cut on criteria. Passes 6 to 1 follow as history.

verdict: 🟢
sha: 8353f1e6951f0636ac1218a518b7d1fd70a08292

Pass 6 lines: `verdict: 🔴` at `bc174a15`.
Pass 5 lines: `verdict: 🟢` at `9378c1bb`.
Pass 4 lines: `verdict: 🟢` at `14a9e3ce`.
Pass 3 lines: `verdict: 🔴` at `2d86b64e`.
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

## Pass 4 · 🟢 at `14a9e3ce`: C5.4 counts the kept migration step

verdict: 🟢
sha: 14a9e3ce

Revision 3 at `14a9e3ce`, graded by the seat directly on `git diff 2d86b64e 14a9e3ce -- .sdlc/plans/compute-layers.md` (C5.4 and the revision row only). Facts read with `git show 14a9e3ce:<path>`.

| # | State | Check I would run | Why / what to change, and the control |
|---|---|---|---|
| C5.4 | 🟢 | (a) and (b) as written; (c) the hydrate test and the constant | Today `persist.js` has `7` `baseIntensity` lines (two `DOMAINS` comments, the `DOMAINS` field, the `stampIntensity` comment, its test, its stamp, the `hydrate` clamp), matching the row's control; outside it, `src/ui/model.mjs`, `src/ui/sections/color.js` and the excluded generated asset. The `stampIntensity` step (`version: 2`) carries exactly one comment line plus the two code lines, so keeping it and adding one `RENAME_MAPS` line gives `4`. Ordering holds: migrations run by version, so the v2 stamp precedes the v7 rename. The count assumes the new entry and its comment name the old field on one line only; a builder who writes it on two lines prints `5`, which the row's wording ("exactly 4") makes a fair red |

## Pass 5 · 🟢 at `9378c1bb`: C4.5 schema made relative

`git diff 14a9e3ce 9378c1bb` on the plan and ADR draft changes only C4.5, the schema wording in section 1, the phase table, the U4 progress line, ADR draft item 4 and the R101 line, plus the frontmatter (`status: approved`, `ticket: 788`). Rows 🟢 at pass 4 other than C4.5 stand unchanged.

### Rows

| # | State | Evidence | Negative control |
|---|---|---|---|
| C4.5 | 🟢 | The base read runs today: `git show $(git merge-base origin/main HEAD):src/engine/exports.js` with the grep prints `export const EXPORT_SCHEMA_VERSION = 3;`, so Expected is a fixed number at grade time (4, or 5 after #789 lands with 4). The 10/10 pins check is unchanged from pass 4. The CSS stamp line now reads the constant, so it cannot pin a stale number. No `schema 4` survives outside the revision 1 history row. | Leave the constant at the base value: the base-versus-HEAD comparison reds. Remove the pins from `exportRadixModule`: the engine test exits non-zero naming it. Both runnable. |

### Findings

- 🟢 C4.5 agrees with prime-name C1.6 (merge-base plus 1), so the two plans cannot both claim 4.
- 🟡 C4.5's first control says "exit non-zero", but an engine test inside `npm test` cannot read the merge-base; the red comes from the verifier's base-versus-HEAD comparison, not from the test's exit. The check still fails as it should; the wording should not lead a builder to put git calls in the test.

## Pass 6 · 🔴 at `bc174a15`: C3.3 control aims at compute's output, which IDENT never reads

Plan at `bc174a15` (revision 5, owner option A in `.sdlc/questions/compute-layers-ident-control.md`). The diff from `9378c1bb` changes only the C3.3 and C5.6 control columns, the U1 tick and the revision row; every other row stands as graded at pass 5. Graded by the Verifier seat directly. The seat read `identityRender` in `scripts/report-preset-fidelity.mjs:302` at `bc174a15`: its head side calls `engine.rampChromaOf(pal, doc)` from `src/ui/model.mjs` and `engine.paletteStops` from `src/engine/tonal.js`, never `compute(doc)`, `projectView` or `derivedAll`.

| # | State | Check I would run | Why / what to change, and the control |
|---|---|---|---|
| C3.3 | 🔴 | `IDENT`, `npm test`, `npm run build`; control as written: scale "the chroma `compute(doc)` returns" by `1.05` | IDENT reads `model.rampChromaOf`, not `compute(doc)`. Whether scaling compute's returned chroma moves IDENT depends on wiring U3 is not required to build: if `compute` calls the `group-chroma` run itself and `model.rampChromaOf` stays a direct wrapper, the scaled output never reaches IDENT and it prints `0`, a dead control again. Fix: name the shared run, `rampChromaOf` in `src/engine/resolve.mjs` (the `group-chroma` layer's `run` per C2.1, which `model.rampChromaOf` calls as `rampChromaOfPure`), and expect a nonzero count. Seat's own run at the U1 head `48b7b5ff`: `src/engine/resolve.mjs:18` changed to `return 1.05 * (g.baseChroma ?? controls.baseChroma);`, `IDENT --only default-kit` printed `117 differing cells`; restored, porcelain 0. A note for the plan: IDENT cannot see a regression inside `compute` itself; that is C3.2's job, and C3.3 should not claim more |
| C5.6 | 🟢 | `npm test`, `npm run build`, `IDENT`; control: scale `ramp@2`'s output chroma by `1.05`, nonzero count | By C5.1, `ramp@2` is `paletteStops` in `src/engine/tonal.js`, which IDENT's head side calls directly (`engine.paletteStops`, `report-preset-fidelity.mjs:310`), so the perturbation reaches it whatever U5 wires. The `117` is cited as the U1-head equivalent and the Expected is "a nonzero count", which is right |

C1.4 itself keeps its written control (the owner chose not to rewrite it; C1.2 pins the default), as the U1 verdict `.sdlc/verdicts/compute-layers-U1.md` records.

## Pass 7 · 🟢 at `8353f1e6`: C3.3 control aimed at the shared run

`git diff bc174a15 8353f1e6 -- .sdlc/plans/compute-layers.md` changes only C3.3's control column and the revision 5 row's wording. Graded by the seat directly.

| # | State | Check I would run | What changed, and the control |
|---|---|---|---|
| C3.3 | 🟢 | `IDENT`, `npm test`, `npm run build`; control: `rampChromaOf` in `src/engine/resolve.mjs` returns `1.05 *` its value | This is the perturbation the seat ran at pass 6 on the U1 head `48b7b5ff` (`resolve.mjs:18`, `IDENT --only default-kit` printed `117 differing cells`, restored `0`). `model.rampChromaOf` calls it as `rampChromaOfPure`, and C2.1 pins the `group-chroma` run strict-equal to it, so `compute(doc)` reaches the same function whatever U3 wires. Live control |

The pass 6 note stands: IDENT cannot see a regression inside `compute` itself; C3.2 owns that.
