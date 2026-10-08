<!-- role=verifier level=L3 model=fable effort=xhigh -->
## Verdict
pass

## Criteria
- (red) uiText RangeError + typeScale({}).uiText 25 entries (u[32]=14, u[96]=30, u[14]=7.5, u[12]=7): pass. Evidence: built tree `C1 exit=0`; base worktree at c7bfde0c `C1 exit=1` (bites).
- (red) UI-control and UI-widget categories carry only `MD`, sizes 14 and 12: pass. Evidence: built `C2 exit=0`; base `C2 exit=1`. Conformance probe across all 5 treatments: UI-control MD 15 -> 14, UI-widget MD 11 -> 12, zero character-field diffs (weight/tracking/leading/case/box), zero diffs on any other voice.
- (red) Figma-modes variables include `type/ui-control/md/size` and no `type/ui-(control|widget)/(xs|sm|lg|xl|2xl)/`: pass. Evidence: built `C3 exit=0`; base `C3 exit=1`.
- (red) exportPanda `ui-control` carries md + DEFAULT only, body keeps sm/lg: pass. Evidence: built `C4 exit=0`; base `C4 exit=1`. Probe: textStyles minus ui-control/ui-widget byte-identical base vs built; ui-control keys `md,DEFAULT`, ui-widget keys `md,DEFAULT`, `DEFAULT === md`.
- (red) no `RANKS6` in type.mjs and no `fam6(["UI-...` in model.mjs: pass. Evidence: built `C5 exit=0`; base `C5 exit=1`. src/engine/type.mjs:61-62 (`UI_HEIGHT`, `stepsFor`), src/ui/model.mjs:118-122. Probe: `modeTierNudge` at 5/6, 2/3, 0.89, 0.80 has 0 UI keys and its non-UI entries are identical to base.
- (red) no `xs/sm/md/lg/xl/2xl` in typography-tokens SKILL.md: pass. Evidence: built `C6 exit=0`; base `C6 exit=1`.
- (red) `ui-text-table` in test/engine/type.mjs: pass. Evidence: built `C7 exit=0`; base `C7 exit=1`; group at test/engine/type.mjs:152-178 (25 rows verbatim, identity at factor 1, RangeError on 30/0/100/13/"x", factor 1.125 rounding, modeFactor freeze, override). Bite: the built test file run against the base engine in the throwaway worktree exits 1 (`TypeError: T.uiText is not a function`).
- (red) `TYPE_STEPS = 41;` and no stale 51 count in src/test: pass. Evidence: built `C8 exit=0`; base `C8 exit=1`. Bite: built counts.mjs (41) against the base app fails headless-boot `(ty)` with `got 51 lines`.
- (red) `"UI/3XS/size": "type/ui-control/md/size"` in test/figma/plugin.mjs and `5[13] steps` in headless-boot.mjs: pass. Evidence: built `C9 exit=0`; base `C9 exit=1`.
- `for t in test/engine/type.mjs test/plugin/typography-tokens.mjs test/figma/plugin.mjs test/ui/headless-boot.mjs; do node "$t" || exit 1; done`: pass. Evidence: each exit=0 on the built tree: `type PASS`, `plugin PASS, typography-tokens skill in parity with the type engine`, `PASS: figma-plugin-app`, `HEADLESS BOOT PASS, all Phase-3 interaction assertions hold`.
- (guard) `node test/figma/style-plan.mjs`: pass. Evidence: exit=0, `style-plan PASS, 848 paints ... 135 text styles bind-target-complete`.
- (guard) `node test/engine/categories.mjs`: pass. Evidence: exit=0, `PASS: per-palette typography flows spec → preset → apply → scale`.

Full runner (`node test/run.mjs`, no asset regen): 4/54 red, exactly the planned set. `engine/exports.mjs` design-system-catalog (step 3), `engine/geometry.mjs` composition value-neutral (step 2), `mcp/brand-kit.mjs` get_geometry font 14 vs 15 (step 4), `mcp/core.mjs` served geometry font 15 (assigned to step 4 by the task handoff `## Plan review` line 71: "step 4: own test/mcp/core.mjs get_geometry block"). No fifth red. Tree unchanged after the run (same 17 modified files). `git grep` for readers of the retired UI steps across src, figma/binder, mcp, plugin, scripts (excluding generated bundles): no hits. `scripts/smoke-panda.mjs`: 0 hits for ui-control/ui-widget/textStyles, as the Do states.

## Out of scope changes
`plugin/ultimate-tokens/skills/typography-tokens/references/prose.md:21` is the one file the step did not call for: a one-line stale-count repair ("six steps" to "one step, md") in the same consumer skill the parity test governs. The rest are in-file edits the Do did not name, all consistent with the step: `src/ui/sections/typography.js:526` comment clause; `test/smoke/smoke.mjs:198` message `(13×3 + 2×1)`; `figma/binder/style-plan.mjs:163` comment; `test/engine/type.mjs:123-125` nice-ladder sweep now asserts the UI voices equal `uiText(h, base/16)` instead of sitting on the ladder (not vacuous, a real equality); `test/plugin/typography-tokens.mjs:47` step-outside-voice leg moved from `--type-body-xl-size` to `--type-ui-control-sm-size` (no voice has `xl` any more).

## For the next attempt
None
