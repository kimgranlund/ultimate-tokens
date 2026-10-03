---
kind: criteria-review
plan: compute-layers
seat: verifier
pass: 1
ticket: none yet
written: 2026-10-03
---

# compute-layers criteria review · pass 1 · 🔴 at `567de3a8`

Current state: pass 1 🔴 at `567de3a8` (plan draft, revision 0, all units). Phase 1 (U1, U2) carries three reds: C1.2 does not say which `hueSpace` default wins, C1.4's command lacks the tool's required `--base`, and C2.1's `geometry` layer has no engine function to point at. U4 and U5 rows wait on Q1 to Q3, and C5.1's main count is stale. Phase 1 is not mobilizable as written.

verdict: 🔴
sha: 567de3a8

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
