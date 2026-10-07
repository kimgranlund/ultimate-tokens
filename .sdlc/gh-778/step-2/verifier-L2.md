<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- (red) residue report, every mode x 19/25 x anchored/gate path has `plain: n >= 1`, ends `residue: 0 stop(s) outside TOL over N`: pass. Evidence: `node scripts/report-preset-fidelity.mjs --envelope-residue` exit 0, no MISSING row over the 18 combinations, 29 class rows, `residue: 0 stop(s) outside TOL over 770880 stops`.
- (red) saved file holds the 0-outside line: pass. Evidence: `.sdlc/gh-778/envelope-residue.txt` contains `residue: 0 stop(s) outside TOL over 770880 stops`.
- (guard) READING `stop N: median` lines unchanged vs `$SDLC_BASE_SHA`: pass. Evidence: base and head extracts each 24 lines, `cmp -s` identical, exit 0 (base ran from a `git archive` copy).
- (red) `npm run gate:chroma-envelope` prints the pass line: pass. Evidence: exit 0, `pass  chroma-envelope: curve exact at 438000 stops; residue within TOL at 438000 stops; direction holds in 3 modes`; every curve and residue leg reads `0/146000`.
- (red) `--spec okhslCurveGain=1`: pass. Evidence: exit 1, perceptual and peak curve > 0 off, `curve even: 0/`.
- (red) `--spec evenFactor=1`: pass. Evidence: exit 1, `curve even: [1-9]`, `curve perceptual: 0/`.
- Planted `OKHSL_DAMP_CURVE_GAIN = 1` in a copy of `src`, run with `--engine-dir`: pass. Evidence: replace succeeded (no exit 3), gate exit 1, `curve perceptual: [1-9]`. This shows the check goes red on a planted engine constant.
- Planted `s * 0.9` in the pixel call: pass. Evidence: replace succeeded, exit 1, `residue perceptual: 48229/146000 stop(s) outside TOL`, `curve perceptual: 0/146000`. This shows the residue leg goes red independently of the curve leg.
- (red) fixture deleted, none of `SLACK|--capture|--compare|NAMED_EXCEPTIONS|OVER_90_AT_300` in the gate: pass. Evidence: exit 0, run in the gate worktree.
- (red) no `chroma-envelope.json` reference under the listed paths: pass. Evidence: `git grep` finds nothing, exit 0.
- (guard) citations and em-dash: pass. Evidence: `node test/repo/citations.mjs` and `node test/repo/em-dash.mjs` exit 0.
- (guard) scope against `$SDLC_BASE_SHA`: pass. Evidence: the guard command exits 0. `git diff --name-only` outside `.sdlc` and `.claude/settings.json` lists only step-1 paths, the two scripts, the gate and the deleted fixture.

## Out of scope changes
None. Remaining diff is `scripts/lib/envelope-measure.mjs`, `scripts/report-preset-fidelity.mjs`, `test/engine/chroma-envelope-gate.mjs`, the deleted fixture, plus step-1 paths.

Note for the planner, not a failure: Gate A rule 2 deviates from the Do text. At `test/engine/chroma-envelope-gate.mjs:109` the s-clamp exclusion is applied to both stop 500's model and the stop's own model, read before the group damper. The builder reports that the literal rule fails 60,757 gate-path stops on the current engine (keyS can read just above 1). Coverage is 122,733 of 146,000 anchored and 80,228 of 146,000 gate-path OKHSL stops. The excluded stops are still covered by rule 1 (env exact to 1e-12) and by Gate B. All stated criteria pass. Whether this exclusion stands is the planner's call. I did not re-run the literal rule.

## For the next attempt
None
