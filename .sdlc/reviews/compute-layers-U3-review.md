PASS
# Review compute-layers U3 pass 1 (#788)

Branch unit/cl-U3 @ 470a0877, base plan/compute-layers @ 6e47c6c8, `B` = `git merge-base origin/main HEAD` = `668d1fae`. Reviewer: fresh context; every command below re-run in this worktree, every control planted in a scratch copy under `/Users/kimba/.claude/jobs/8c58a81c/tmp/cl-U3-rev/` (`head/` an rsync of the worktree, `base/` = `git archive $B src`, `base2/` = `git archive 6e47c6c8 src`), each restored and `diff -r` clean against the worktree.

## Findings, ranked

No code or behavior defect, no unmet criterion.

| Sev | Finding |
|---|---|
| 🟢 info | R98 holds. `compute(doc)` in `src/engine/layers.mjs` is the one walk of controls, group-chroma, ramp, prime and roles; `projectView` reads `compute(stateOf(doc))` and passes the same result to `derivedAll(state, computed)`; a standalone `derivedAll(state)` runs `compute` over the enabled palettes. Neither view resolves a chroma, a ramp, a prime ladder or a role itself. The `computed` argument is a reuse of one result, not a per-caller rule: `compute` is per palette with no cross-palette input, so computing all palettes and filtering equals computing the enabled ones. |
| 🟢 info | Equivalence by reading, then by measurement. Old `projectView` fed `paletteStops`/`primeSwatches` `docControls(doc)`; new feeds `resolveControls(stateOf(doc))`. `stateOf` copies every `DEFAULT_CONTROLS` key plus `baseChroma`/`primeChroma`; the one difference is `paletteGroups` (raw vs default-filled), which no ramp or prime code reads (`grep` of `.paletteGroups/.baseChroma/.primeChroma/.onColorMode/.accentRef` over `src/engine` hits only controls, resolve, prime (primeChroma), layers, exports, ds-export). Old `derivePalette` passed a 13-key `ctl` slice to `paletteStops`, new passes the full controls; a scratch check adding each of the 5 extra keys one at a time leaves the 25 hexes unchanged. `roleOverrides` undefined vs `{}` is a no-op in `applyRoleOverrides`. |
| 🟢 info | Out-of-lane edits, all three needed. `test/engine/anchor.mjs`: with the 6e47c6c8 version restored on the scratch copy, the test exits 1 with `ERR_UNSUPPORTED_RESOLVE_REQUEST ... "../engine/layers.mjs"` (the data: URL model.mjs cannot resolve the new import); with `layers.mjs` mapped to the real file instead of the patched one, it exits 1 with `lone-spike negative control DID NOT bite ... produced 0 spikes`. Only the builder's rewrite (patched `layers.mjs` with the plateau-neutralised `tonal.js`) keeps the control live: `produced 4 spike(s)`, exit 0. The docs line: `src/ui/model.mjs:1047` is the shadcn `radii` line the review cites, and `repo/citations.mjs` gates it. `scripts/bundle.mjs`: comment only, but its old text ("nothing imports it yet") became false with this change, so leaving it would be a stale record. |
| 🟢 info | No behavior change, independently measured (`pvdiff.mjs` in the scratch dir, written for this review, not the builder's script). `JSON.stringify(projectView(hydrate(doc)))` on base vs HEAD over 353 documents (default kit, 343 presets, 9 default-kit variants: `accentRef` single, `onColorMode` fixed and mode, two `roleOverrides` sets, a palette off, even + cam16, all group base chroma 40, `baseIntensity` 60): 0 differ against `6e47c6c8` and 0 against `B`. `exportDesignSystemBundle` on the default kit: equal. Seven exporters on two raw MCP-shaped states (no `stateOf`, one with a hidden palette, overrides, `accentRef`, `onColorMode`, `baseChroma`): 0 of 14 differ against `6e47c6c8`; 14 of 14 differ against `B`, all from U1's ratified raw `hueSpace` default (`"cam16"` to `"oklch"`): stamping `hueSpace: "oklch"` on the raw state gives 0 of 208 CSS lines differing. Control for the diff itself: `resolveRoles` with `applyOnColorContrast` removed gives `projectView differing 352` of 353. |
| 🟢 info | C3.3 control, builder's claim confirmed. `1.05 *` at `rampChromaOf` in `src/engine/resolve.mjs` (`return 1.05 * (g.baseChroma ?? controls.baseChroma);`): `IDENT --only default-kit` prints `0 differing cells`, exit 0, because every default-kit palette resolves 100 and `groupDamper` clamps `min(1, chroma / 100)` (`tonal.js`), and `dampStops` returns the at-100 ramp when `r >= 1`. `0.95 *` at the same site: `277/400`, `260/400`, `343/400` per mode, `880 differing cells`, exit 1. Restored: `0 differing cells`. |

## Follow-ups (wording, docs, later units; not failures)

| Sev | Owner | Follow-up |
|---|---|---|
| 🟡 medium | Orchestrator, plan text | C3.3's control column names `1.05 *` and `117 differing cells`; at this site it prints 0. Revise to `0.95 *` and `880 differing cells` (or name the clamp). The same reasoning applies to C5.6's `1.05` on `ramp@2`'s output if that output passes through the same clamp; check before U5. |
| 🟡 medium | Orchestrator, plan text | IDENT cannot see U3's change at all: `--identity-control` renders through `model.rampChromaOf` and `tonal.paletteStops` directly (`scripts/report-preset-fidelity.mjs` `identityRender`, `headEngine`), never `projectView` or `compute`. C3.3's `0 differing cells` is a regression floor for the ramp inputs, not evidence that `compute` is byte-neutral. The `projectView` byte-diff above (and the builder's own) is that evidence; the plan could name it as the U3 neutrality row, and U4 should not lean on IDENT for pin neutrality either. |
| 🟡 low | U4 | The registry still under-declares, as the U2 review flagged for U3: `prime.inputs` lacks `paletteGroups`/`group-chroma` although `compute` feeds `primeSwatches` the group-resolved `primeChromaOf`, and that `primeChromaOf` call sits in `compute` outside any registry entry, so a later `group-chroma` or `prime` version cannot swap it by pin. `type` and `geometry` are registered but not walked by `compute` (stated in the `layers.mjs` header; `typeScaleFor`/`geomScaleFor` in `model.mjs` stay their evaluator), so a U4 pin on either would not change output through `compute`. |
| 🟡 low | Orchestrator, plan text | C2.1 still names `semanticRoles` as `roles`' `run`; it is `resolveRoles` now (anticipated in U2's handoff and the old `layers.mjs` header). |
| 🟢 low | builder, next touch | `c3.1-control` in `test/engine/layers.mjs` asserts the count is exactly `1` after appending a call, so when the real check fails (a call already in `model.mjs`) it also prints `an added applyRoleOverrides( call was not counted`, which is false. Comparing to `calls(src) + 1` would keep the message true. No false pass. |
| 🟢 low | handoff wording | The handoff says the unmodified anchor control "ran the real engine"; the unmodified file crashes on the import instead. The real-engine case is what a naive absolute mapping would do. The edit is needed either way. |

## Criteria

| Id | Command | Result |
|---|---|---|
| C3.1 | `grep -c "applyRoleOverrides(" src/ui/model.mjs src/engine/exports.js src/engine/layers.mjs` | `0`, `0`, `1` (the call in `resolveRoles`, the `roles` layer's `run`, reached through `compute`). On `B`: `1` and `1`. Control: `projectView` re-wrapping `roleRefs` in `applyRoleOverrides(roleRefs, doc.roleOverrides)` (behavior-neutral double apply) gives grep `1` and `FAIL c3.1-one-caller: ui/model.mjs 1, engine/exports.js 0, layers.mjs 1`, exit 1. 🟢 |
| C3.2 | `node test/engine/layers.mjs` | exit 0, `presets 344`, `c3.2-views: 344 documents ... agree`. Sum of `PRESETS.length` over the 8 category files (index.js excluded) is `343` (7 of 48, brands 7), plus 1 = 344. Loader matches `report-preset-fidelity.mjs` (`hydrate({ ...preset })`). Control: `darkRef` of `onPrimary` re-pointed to `500` in `derivePalette` gives `FAIL c3.2-views: 344 of 344 documents disagree`, exit 1. 🟢 |
| C3.3 | `IDENT` plain: `node scripts/report-preset-fidelity.mjs --identity-control --base 668d1fae --authored` | exit 0, `0/3780 palettes, 0/94500 cells` per mode, kit `0/16, 0/400`, `0 differing cells` (133 s). 🟢 |
| C3.3 | `IDENT --only default-kit` | exit 0, `0 differing cells`. Control above (`0.95 *`: 880). 🟢 |
| C3.3 | `npm test` | heavy count 0 before the run: exit 0, `all 56 test files passed`, 208 s; `git status --porcelain` 0 lines after. 🟢 |
| C3.3 | `npm run build` | heavy count 2: exit 0, `wrote figma/plugin/ui.html 4170.4 KB`; tree clean after. 🟢 |
| extra | `node test/engine/anchor.mjs` | exit 0, `lone-spike negative control: plateau-neutralised engine produced 4 spike(s)`. 🟢 |

## Lane and history

- `git diff --stat 6e47c6c8..470a0877`: `src/engine/layers.mjs`, `src/engine/exports.js`, `src/ui/model.mjs`, `test/engine/layers.mjs`, `test/engine/anchor.mjs`, one docs line, one `scripts/bundle.mjs` comment, `CHANGELOG.md`, the handoff, and the two regenerated assets. Nothing in `.claude/docs/other/` or `node_modules`.
- No `src/ui` markup or CSS changed, so the Safari font-quoting and SVG `fill: none` traps do not apply. No `html:` chart sites touched.
- `npm run smoke` not run (no UI rendering change; `projectView` output byte-identical above).
