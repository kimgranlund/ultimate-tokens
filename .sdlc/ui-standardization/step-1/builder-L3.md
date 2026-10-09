<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization/src/ui/shell-roles.mjs (new): `UI_ROLES`, `WEIGHTS`, `MOTION`, `edge`, `roleText`, `CONTROL_ANATOMY`, `CONTAINER_COMPOSITION` and `shellRolesCSS`. Pure ESM whose only imports are `LADDER_ROWS` and `uiText`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization/test/ui/shell-roles.mjs (new): a self-reporting test over all 27 cells of `geomScale({})`. It derives the row steps independently from the `UI_TEXT` keys sorted descending, and includes a negative control (a stand-in `roleText` that ignores the step) for both the bare table and the factor-1.25 map.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization/test/run.mjs: `"ui/shell-roles.mjs"` registered in `TESTS` right after `"ui/shell.mjs"`.

## Checks
- `redck.py record .sdlc/ui-standardization/step-1/handoff.md`, run before the first edit: recorded 3 controls, all red at base, exit 0.
- (red) `node test/ui/shell-roles.mjs`: the first run failed because of my own test's wrong assumption (it expected every micro cell to clamp at step -3, but micro-lg-lg is 20px tall and does not reach row 12). I narrowed that check to the cells whose steps run past the last row. Rerun: `shell-roles: pass, 1399 checks over 27 cells`, exit 0.
- (red) `grep -qF '"ui/shell-roles.mjs"' test/run.mjs`: exit 0.
- (red) the `node --input-type=module -e ...` criterion one-liner: exit 0.
- (guard) `test -z "$(git diff --name-only $SDLC_BASE_SHA -- src/ui/styles.css ... docs)$(git ls-files --others ...)"`: exit 0.
- `node test/repo/em-dash.mjs`: exit 0.
- `npm test`: all 62 test files passed. Afterwards the tree held only this step's files plus the sdlc run records.

## Notes
- The composition law test compares `radius` with `partRadius + padding` using a 1e-9 tolerance, not `===`. For segmented, `radiusInset + partInset` is `(rC - inset/2) + inset/2`, which can be off by one ulp on non-integer radii. The plain `===` failed nowhere on the 27 default cells; the tolerance is only there to keep floating-point noise from tripping the check.
- The clamp check covers only the cells whose -3 step runs past row 12: micro-sm-sm (12), micro-sm-md and micro-md-sm (14), micro-sm-lg, micro-md-md and micro-lg-sm (16). The check also asserts that only micro cells are in that set.
- Nothing imports `src/ui/shell-roles.mjs` yet. Wiring it into `scripts/bundle.mjs` is step 2.
