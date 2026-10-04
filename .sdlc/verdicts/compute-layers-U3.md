---
kind: verdict
plan: compute-layers
unit: U3
seat: verifier
pass: 1
ticket: "#788"
written: 2026-10-04
---

# compute-layers U3 · pass 1 · 🟢 at `9d4e10f2`

verdict: 🟢
sha: 9d4e10f2e8fa898c3077469640b9c39d9fa98433

Unit `unit/cl-U3` (one evaluator) at `9d4e10f2` (builder code `470a0877`, with the review commit on top), base `plan/compute-layers` at `6e47c6c8`. It is graded against C3.1 to C3.3 of plan revision 6, per the request `.sdlc/handoffs/compute-layers-U3-verify.md` (`verdict.py check` rc 0).

Families: the builder is opus (l5) and this checker is opus (verifier-l2 grade, run by the seat itself), so the family is shared. That is the R86/R92 standing exception while fable is capped. The reviewer was a sonnet-family stand-in.

Policy: owner rules R1 and R6 (`.sdlc/questions/ceremony-policy.md`, `508ccbda`). Only a code or behavior defect, or an unmet criterion, blocks; wording goes under Findings.

Every run used fresh clones under `$CLAUDE_JOB_DIR/tmp/clu3`: `base` at `6e47c6c8`, plus `head`, `neg` and `gate` at `9d4e10f2`, each checked with `git rev-parse`. `NODE_OPTIONS` was unset. Each plant was reverted with `git checkout -- .` (porcelain `0` after). Load is high, so no row is a timing row.

## Rows

| Criterion | State | Evidence | Negative control |
|---|---|---|---|
| C3.1 one caller of `applyRoleOverrides(` | 🟢 | `grep -c "applyRoleOverrides(" src/ui/model.mjs src/engine/exports.js src/engine/layers.mjs` prints `0`, `0`, `1` (the call is in `resolveRoles`, the `roles` layer's `run`, which `compute` reaches). `node test/engine/layers.mjs`: `pass  c3.1-one-caller: model.mjs 0, exports.js 0, layers.mjs 1` | `git show main:` and `git show 6e47c6c8:` give `1` and `1` for model.mjs and exports.js. Planted in `neg`: projectView re-wraps `roleRefs` in `applyRoleOverrides(...)`. grep then gives `1`, and the test gives `FAIL  c3.1-one-caller: ui/model.mjs 1, engine/exports.js 0, layers.mjs 1`, rc 1 |
| C3.2 views agree over every preset | 🟢 | `node test/engine/layers.mjs` rc 0 prints `presets 344` and `pass  c3.2-views: 344 documents: projectView and derivedAll agree on every stop hex, role ref and role hex`. This seat's own loader (`pv.mjs`, over every `src/ui/categories/*.js` except `index.js`, through `hydrate`) also reads 343 presets, plus 1 for the default kit | `derivePalette` in `exports.js` with `lightRef` re-pointed for `neutralBright`: `FAIL  c3.2-views: default kit: Neutral neutralBright: refs 350/400 vs 50/400` (and every preset), rc 1 |
| C3.3 IDENT | 🟢 | `node scripts/report-preset-fidelity.mjs --identity-control --base 668d1fae --authored` (`668d1fae` is `git merge-base origin/main 9d4e10f2`): `0/3780 palettes, 0/94500 cells differ` in perceptual, peak and even, and `0 differing cells`, rc 0. `--only default-kit`: `0 differing cells`, rc 0 | `rampChromaOf` in `src/engine/resolve.mjs:19` changed to `return 0.95 * (...)`: `277/400`, `260/400`, `343/400` cells differ, `880 differing cells`, rc 1. After restoring, the plain run reads `0` |
| C3.3 `npm test` | 🟢 | `gate` clone: rc 0, `✓ all 56 test files passed`, porcelain `0` after | in `neg`, `TESTS` cut to `["engine/layers.mjs"]` with the C3.2 plant: `node test/run.mjs` gives `▶ engine/layers.mjs FAIL`, `✗ 1/1 test file(s) failed`. The real `TESTS` lists `"engine/layers.mjs"` (count `1`) |
| C3.3 `npm ci && npm run build` | 🟢 | `npm ci` rc 0. `npm run build` rc 0: `wrote figma/plugin/ui.html 4170.4 KB`, porcelain `0` | `const __neg: number = "x";` appended to `src/main.ts`: `TS2322`, rc 1 |
| Adapter smoke (unit touches `src/ui/model.mjs`, `scripts/bundle.mjs`) | 🟢 | `npm run smoke` rc 0: `SMOKE PASS, gallery · category · editor · export dialog all render in a real browser`, porcelain `0` | `export const = ;` appended to `src/engine/layers.mjs`: `SyntaxError: Unexpected token '='`, smoke rc 1 (the error is raised in its build stage) |
| Behavior neutral (the handoff's real neutrality row; IDENT does not reach `compute`) | 🟢 | Own script `pv.mjs`, run on `base` and `head`: it hashes `projectView(doc)`, and `exportAll` plus `derivedAll` over `stateOf(doc)`. On every 15th document it also hashes the three DS bundles and `dsFullLayersCss`. Cases (354 in all): the default kit, 343 presets, 8 default-kit variants and 2 raw MCP-shaped states with no `stateOf`. Six variants are live (hash differs from the default): `cuspPull`, a per-palette and doc `primeChroma`, a middle palette off with `accentRef` single and `onColorMode` contrast, `keyColors`, an `anchor`, `roleOverrides` with contrast. One raw state uses the 6 extra controls the old 13-key `ctl` slice dropped. `diff base.txt head.txt` is empty, with no `ERR` | the same script on `neg` with `applyAccentRef` dropped from `resolveRoles`: 1 case differs (`mid-off`), so the comparison sees a role-chain change |
| Lane | 🟢 | `git diff --stat 6e47c6c8 9d4e10f2`: the five lane files, plus `test/engine/anchor.mjs`, one docs citation line, one `bundle.mjs` comment, the CHANGELOG and the two regenerated assets. The anchor edit keeps its lone-spike control live under the new import path (the reviewer shows rc 1 without it). `node test/engine/anchor.mjs` runs green inside `npm test` | a name comparison; every extra path is accounted for above |

## Findings

All are follow-ups (one batched issue per plan, R1). None blocks.

- 🟡 IDENT does not reach `compute`: `--identity-control` renders through `model.rampChromaOf` and `paletteStops` directly. C3.3's `0 differing cells` is a floor on the ramp inputs. The `projectView` base-vs-head row above is what proves `compute` neutral. U4 should not lean on IDENT for pin neutrality.
- 🟡 Carried from the review: `prime` under-declares its inputs (the `primeChromaOf` call sits in `compute`, outside the registry). `type` and `geometry` are registered but not walked. C2.1's text still names `semanticRoles` as the `roles` run.
- 🟡 Low: `c3.1-control` prints `an added applyRoleOverrides( call was not counted` whenever the real check fails (seen in this seat's C3.1 plant), which is false. No false pass.
- Report only: two of this seat's variants (`hueSpace: "okhsl"` and `chroma: 40` on odd palettes) hashed the same as the default, so they test nothing. They are left out of the live count above.
