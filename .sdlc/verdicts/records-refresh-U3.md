---
kind: verdict
plan: records-refresh
unit: U3
ticket: "#691"
graded: 2026-09-19
branch: unit/rr-U3 @ 1604f777916121ea17a19d2af8d3d05c4bbbe4ea
merge-base: 20298cca9a152e8ff6041c78573293f48628c10f (origin/main)
plan-text: .sdlc/plans/records-refresh.md @ 6d92773e6e8de28546f07d0c3acc820cf71103af (plan/records-refresh)
handoff: .sdlc/handoffs/records-refresh-U3.md
worktree: detached scratch worktree at 1604f777, plus a throwaway shared clone for every plant; both removed after grading
verdict: 🟢
---

# Verdict U3 · 🟢

The re-measurement at `20298cc` holds. Every one of the ten U3 rows and the three plan-level
controls I was asked to grade reproduces on my own runs, and the three gates are green in my own
tree with wall times inside the band the baseline records. The nine transcribed timings are
corroborated, not taken on trust: my single run of each command lands inside half the smallest to
double the largest of the three recorded figures, and inside the raw recorded range for all three.

The builder's two recorded criterion-text interactions are already resolved in the plan text I
graded against. U1-4 at `6d92773e` carries the `head -1` that confines the CI-run grep to the live
line, and U3-2's fifth sub-check carries the `grep -v '^supersedes:'` that excludes the frontmatter
line. Both print the stated Expected values on my runs, so neither is an open question any more.

| Field | Value |
|---|---|
| Branch found on | `unit/rr-U3`, not `plan/records-refresh` |
| Merge base | `20298cc` = the `ref` sha in `.sdlc/baseline.md` and the sha of all five head mentions |
| Files U3 changed | `.sdlc/baseline.md`, `.sdlc/adapter.md`, `.sdlc/architecture.md`, `.sdlc/handoffs/records-refresh-U3.md` |
| Host at grading | load 2.97 to 3.81 on 10 cores across the run window, well under the core count |
| Toolchain resolved | node v24.18.0, typescript@7.0.2, vite@8.3.0 |

## My own gate runs, once each, `/usr/bin/time -p`

`npm ci` ran first and is not part of the timing: exit 0, 18 packages from a warm cache.

| command | my wall (s) | baseline records | band (half min to double max) | in band | my last line |
|---|---|---|---|---|---|
| `npm test` | 59.09 | 56.27 · 56.43 · 59.83 | 28.1 to 119.7 | yes | `✓ all 48 test files passed` |
| `npm run build` | 2.75 | 3.06 · 1.34 · 1.36 | 0.67 to 6.12 | yes | `wrote figma/plugin/ui.html 3780.5 KB` |
| `npm run smoke` | 18.23 | 18.20 · 18.28 · 18.25 | 9.10 to 36.56 | yes | `SMOKE PASS` for gallery, category, editor and export dialog |

Every run left `git status --short` empty. My first `npm test` attempt overlapped another seat's
`test/run.mjs` (`pgrep` showed it before the run) and read 61.80 s; I discarded that reading for
contention and reran clean at 59.09 s with `pgrep` silent before and after. Both readings are inside
the band, so the discard changes no verdict.

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U3-1 | baseline test count, bundle size and cited head agree with the tree at `20298cc`; adapter time ranges agree with the baseline | 🟢 | my run: seven `ok` lines (`tests: 48/48`, `ui.html 3780.5/3780.5`, three time rows, two head rows), `stale total: 0`, `exit 0`, then `20298cc` | in the clone, one timing set to `99.9`: `STALE time test: baseline 56 to 100 s, adapter 56 to 60 s`, `stale total: 1`. In the clone, live test row set to 47: `STALE tests: baseline 47, test/run.mjs TESTS 48` |
| U3-2 | a full rerun at `20298cc`: nine runs, head and loads in the frontmatter, prior figures only in the prior set, `#706` named once, timings corroborated by my own runs | 🟢 | my run of the seven sub-checks: `3`, `1`, `1`, `1`, `0`, `3`, `1`, exactly as Expected. Corroboration is the gate table above: three commands, each inside band, each last line equal to its row summary | in the clone, live test row set to 47: fifth sub-check prints `1`, not `0`. Prior section deleted: sixth sub-check prints `0`, not `3` |
| U3-3 | the cited CI run is green on `20298cc` and that head is the merge base | 🟢 | U1-4 verbatim at `6d92773e`: `20298cc`, `20298cc`, `20298cc panda-smoke=success build-test=success` (run 35455937943) | in the clone, `ref` rewritten to `d814500`: the first two lines read `20298cc` then `d814500`, so the merge-base comparison bites. My own `gh run view 34660177977` prints `464507f build-test=failure panda-smoke=success`, so the jobs query can report red |
| U3-4 | §8 re-checked row by row at `20298cc`: no DD row names `d814500`, five head mentions read `20298cc`, the row check exits 0 unedited, the handoff shows every row re-checked with the `#706` rows marked | 🟢 | my run: `0`; `20298cc` five times; `rows 56 drifted 11 holds 45 undetermined 0 bad 0`; `same`; `56`; `56`; `0`; `M=15`; handoff `y` count `15` (so `M` or more, and `M` is 15 at this head rather than the planner's lead of 14, which the handoff explains as DD33 gaining a `test/gate-report.mjs` citation) | in the clone, DD19 row deleted: `rows 55 drifted 10 holds 45` and `55`, both below the 56 floor. Handoff copy with DD19's third cell set to `n`: last line prints `14`, not `15` |
| U3-5 | the Counts bullet carries §8's real counts at `20298cc` | 🟢 | my run: the check script prints N=56 D=11 H=45 U=0 B=0 and the bullet grep for those five values prints `1` | in the clone, bullet reworded to `12 drifted, 44 hold`: prints `0`, so the count part bites on its own, not only the sha |
| U3-6 | K17's exception list corrected, the cell's own filter prints nothing at `20298cc`, and the same filter still catches an unregistered test file | 🟢 | my run: `1`, `1`, the filter lifted from the cell echoes as `grep -vxE "run.mjs\|smoke/smoke.mjs\|ui/counts.mjs\|gate-report.mjs\|repo/fixtures/gate-report-(clean\|mismatch\|singlequote).mjs"` with plain pipes, then `0`. The pre-filter count is `7`, matching the cell's `7 unlisted files` | in the clone, `ui/counts.mjs` dropped from the cell: the filter prints `ui/counts.mjs` and `1`, so gaining the new names while losing an old one fails here. A tracked `test/engine/zzz.mjs` prints `engine/zzz.mjs` through the widened filter, so it still discriminates |
| U3-7 | adapter time ranges follow the new baseline; in-place edits stay inside the §1 gate table against the new merge base | 🟢 | my run of the U4-amended form: `0`, `3`, `3`. The three cells read test 56 to 60 s, build 1 to 3 s, smoke 18 to 18 s, and the check script's three `ok time` lines agree | in the clone, one word of §4 row C1 reworded: the first count prints `1`, so an edit outside the gate table is caught. The `99.9` timing plant drops the third count to `2` |
| U3-8 | the nine runs recorded with load before and after, none at or above the core count, no other gate visible before any run, the test runs print the new count, both resolved packages on record | 🟢 | my run: `9`, `0`, `0`, `0`, `3`, `1`, `1`, `1`, exactly as Expected. The threshold is read from `sysctl -n hw.ncpu` (10 on this host) | on handoff fixtures: a blank `wall (s)` cell prints `1` on the second line; a load-after cell of `12.3` prints `1` on the third; a `pgrep before` cell reading `812 node test/run.mjs` prints `1` on the fourth; rows reading `all 47 test files passed` drop the fifth count to `0` |
| U3-9 | scope wall: nothing outside `.sdlc/` and `.gitignore` differs from `20298cc` | 🟢 | my run in the scratch worktree: `0`, `0` | in the clone, `echo "// probe" >> src/engine/motion.mjs`: prints `1`. A tracked `test/engine/zzz.mjs` plant left in the worktree prints `1` the same way. Clean pre-state confirmed at `0` between the two |
| U3-10 | the 18 controls rerun at `20298cc`, evidenced by U3's own Controls table: 18 conventions, own result, pass 5 cell, delta, plant, no empty cell, six columns, K17 naming the correction | 🟢 | my run of the five sub-checks: `18`, `0`, `0`, `1`, `1`. My own reruns of the controls this row requires: K7 `node scripts/bundle.mjs` exit 0, `wrote dist/ultimate-tokens.html 3777.5 KB`, matching the handoff cell; K8 `test/engine/semantic.mjs` and `test/figma/binder.mjs` both PASS with `role-table.json` at 53; K9 the six regen steps exit 0 with `git status --short` empty after; K17 as U3-6. Every control citing a `#706`-touched path also rerun: K3 `0`, K5 `0`, K6 `0` filtered with 2 raw header-comment hits (one per file, as the cell records), K18 `CURRENT_SCHEMA_VERSION = 4` at `src/ui/persist.js:320` with the `schema-rename v4` case at `test/ui/persist.mjs:183` | on an 18-row handoff fixture: K7's hits cell blanked prints `1` on the second line; K18's row removed and K9's cut to four columns prints `17` and `1`. K7's plant in the clone (a new `src/engine/planted.mjs` imported by `exports.js`) exits 1 with `preflight found 1 registry problem ... "./planted.mjs" is not registered in KEY`. K9's plant (a hand edit appended to `adia-oklch-export.css`) is overwritten by the regen chain, which is the `CHANGED BY REGEN` signal |
| P1 | `npm test` green with no `node_modules` needed, tree byte-stable | 🟢 | my run in the scratch worktree with no `node_modules` present beforehand: `✓ all 48 test files passed`, then `0` | in the clone, `sed 's/"scrim/"scrimX/' docs/reference/data/role-table.json` then `npm test`: exit 1, `grep -c FAIL` prints `3`, including the `refs-canonical` gate failure on the ordered key set |
| P4 | branding gate clean | 🟢 | my run: `branding: clean (457 files scanned)`, exit 0 | in the clone, `cp docs/reference/references/decision-records.md docs/x.md` then rerun: `FAIL: 3 branding violation(s) across 458 files`, so the records exemption is by path |
| P5 | scope wall against the merge base | 🟢 | same run as U3-9: `0` | same controls as U3-9: the `motion.mjs` probe and the tracked `zzz.mjs` plant each print `1` |

## Notes for whoever next revises the plan text

Neither note changes this verdict. Both are the same class as the two interactions the builder
recorded: the Prior set section the plan itself requires makes a pre-existing command match twice.

1. P2's `grep -o 'ui.html [0-9.]* KB' .sdlc/baseline.md` now matches two lines, the live `3780.5`
   and the prior set's `3777.8`, so P2 as literally written prints the size string three times
   rather than the stated "same string twice". My built size is `3780.5`, equal to the live row, so
   the criterion's substance holds. The fix is the same shape as U1-4's: `head -1` after the grep.
2. `npm run smoke` prints its summary with an em dash, `SMOKE PASS — gallery · category · editor · export dialog all render in a real browser`. The baseline row and the handoff write it with a
   colon instead. That is the plan's own no-em-dash branding rule doing its job, but §Texts asks for
   the line "as printed", so the two instructions conflict on this one character. Recording it so
   nobody later reads the colon as a transcription error.

Correction (2026-09-19, plan records-followup U4, #709): a quotation of program output in this file had spelled a glyph out in words to avoid an em dash. It now reads as the program prints it. Rule: `.sdlc/adapter.md` §3, Verbatim-quote rule. Note 2 above no longer holds on its face: the baseline row and the handoff were restored to the printed line on the same date, and the rule it names is the owner's prose rule, which the amendment separates from the branding gate.
