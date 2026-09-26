---
kind: handoff
plan: gate-gaps
unit: U2b
branch: unit/gg-U2b
written: 2026-09-25
pass: 1
---

# Handoff U2b (U2 step 7, the baseline `npm test` row, U2-7's P2 half) . builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/gg-U2b, five commits: `2603690c` (step 0 merge), `75d13c88` (color.js correction), `c9751d21` (baseline row), `f2ace6a7` (question doc), `cfd1edf8` (date fix) |
| Head | `e6011b01e81872b2f1d37a00256ce83761aa78df` |
| Merge parent | `8bb8d875b78c20f44aff2bcb225403b510563fe6` (origin/main at the moment of step 0; origin/main has since moved further as other plans landed, so the diff-stat proof below is read against this pinned sha, not the live `origin/main`) |
| Files this unit's own commits touch | `.sdlc/adapter.md`, `.sdlc/baseline.md`, `.sdlc/board.md`, `.sdlc/handoffs/gate-gaps-U1.md`, `.sdlc/handoffs/gate-gaps-U2.md`, `.sdlc/plans/gate-gaps.md`, `.sdlc/questions/gate-gaps-approval.md`, `.sdlc/questions/gg-U2b-p2-time-stale.md`, `.sdlc/verdicts/gate-gaps-U1.md`, `.sdlc/verdicts/gate-gaps-U2.md`, `scripts/report-preset-fidelity.mjs`, `test/engine/anchor.mjs`, `test/engine/ramp-identity.mjs`, `test/run.mjs` |
| Ran | `npm test` clean at HEAD (below); `npm test`'s three baseline reruns (below); `sh .sdlc/checks/baseline-agrees-check.sh` clean and its negative control, both in fresh `git clone --shared` copies; the P1 negative control in its own clone |

## Scope for this pass

Step 0 (merge `origin/main` into `unit/gg-U2b`, cut from `plan/gate-gaps` @ `9b14c15b`, so the tree equals main plus U1 and U2's own work), then U2 step 7 (the baseline `npm test` row and the `ui.html` KB figure) and U2-7's P2 half (the records agree). Owner ruling R50 (`.sdlc/questions/rule-gates-U5-load.md`, extended to gg-U2b by the team lead 2026-09-25) replaces the plan's quiet-host requirement for these three runs: they count under load, run 1 counting if green, each recording its own load and elapsed time rather than gating on load under 5.

## Step 0: the merge

`plan/gate-gaps` carried its own older copies of #681's and #713's work. `git merge --no-ff origin/main` conflicted in 29 files. Resolution, file by file: for every file this plan never touched, `origin/main`'s version; for the five files U1 and U2 touched that conflicted (`test/engine/anchor.mjs`, `scripts/report-preset-fidelity.mjs`, `test/run.mjs`, `.sdlc/adapter.md`; `.sdlc/baseline.md` auto-merged clean, untouched by the plan so far), `origin/main`'s version plus this plan's own isolated hunk, extracted per file from the exact commit range that introduced it and applied onto `origin/main`'s copy; `.sdlc/board.md` keeping main's landed rows plus this plan's three `gate-gaps` rows. Five stale un-archived plan files this plan never touched (`gate-split.md` and four `preset-intent-fidelity` rediagnosis/main files, left behind by the old copy while main had already archived them) were removed in favour of main's archived versions; the repo's own pre-commit board-agreement check caught the mismatch.

The auto-merge (no conflict marker) of `src/ui/sections/color.js` combined this branch's carried old #681 draft of `detachSnapshot`/`resetAnchor` with main's own already-landed copies of the same functions, since the two additions did not textually overlap. This duplicated both function bodies and broke two citation docs' line numbers on the first `npm test`. Fixed in `75d13c88` by taking `origin/main`'s file outright, since it is not in U1 or U2's Touches row.

`git diff 8bb8d875 HEAD --stat` (the merge's actual origin/main parent):

```
.sdlc/adapter.md                        |   1 +
.sdlc/baseline.md                       |  22 +-
.sdlc/board.md                          |   3 +
.sdlc/handoffs/gate-gaps-U1.md          | 171 +++++++++++++++
.sdlc/handoffs/gate-gaps-U2.md          | 332 +++++++++++++++++++++++++++++
.sdlc/plans/gate-gaps.md                | 357 ++++++++++++++++++++++++++++++++
.sdlc/questions/gate-gaps-approval.md   |  19 ++
.sdlc/questions/gg-U2b-p2-time-stale.md |  45 ++++
.sdlc/verdicts/gate-gaps-U1.md          |  34 +++
.sdlc/verdicts/gate-gaps-U2.md          |  43 ++++
scripts/report-preset-fidelity.mjs      | 273 +++++++++++++++++++++++-
test/engine/anchor.mjs                  |  75 +++++++
test/engine/ramp-identity.mjs           |  41 ++++
test/run.mjs                            |   2 +-
14 files changed, 1408 insertions(+), 10 deletions(-)
```

Fourteen files, all this plan's own; no `src/` file outside `color.js` (corrected) moved, and no other plan's file is touched.

`npm test` once at the merge (`75d13c88`, foreground, load not gated for this step): `✓ all 51 test files passed`, `git status --short` empty after.

## U2 step 7: the baseline `npm test` row

Three runs at `75d13c88` (the head right after step 0's merge and the color.js correction, before any of this pass's own baseline/question/handoff commits; 51 test files, `engine/ramp-identity.mjs` now registered in `test/run.mjs`'s `TESTS`, K17):

| run | clock (PDT) | load before | load after | hot before/after | seconds | exit |
|---|---|---|---|---|---|---|
| 1 (quiet) | 2026-09-24 06:47:35 to 06:50:07 | 4.98 | 6.83 | 0/0 | 151.04 | 0 |
| 2 (under load, R50) | 2026-09-25 21:41:48 to 21:59:27 | 69.22/70.00/70.52 | 111.92/103.77/93.01 | 1/3 | 1057.97 | 0 |
| 3 (under load, R50) | 2026-09-25 21:59:53 to 22:07:26 | 109.79/104.02/93.47 | 48.36/64.83/79.33 | 4/6 | 452.98 | 0 |

Run 1 was taken the day before runs 2 and 3, right after step 0's merge and before the team lead's hold for rule-gates U5's own quiet window; the two are not concurrent despite the close clock reading, they are on different days (caught by the team lead reading this table against the actual command logs; the first draft mis-dated run 1 to match runs 2 and 3, fixed in `cfd1edf8`). All three green, `git status --short` empty after each. Runs 2 and 3 each overlapped rule-gates U5's own concurrent `npm test` (`pgrep` matched another session's `test/run.mjs`; run 3 also matched `test/engine/anchor.mjs --full`, U5's own FULL leg), plus an unrelated project's `vite build` both times.

`.sdlc/baseline.md`'s `npm test` row now reads `151.04 · 1057.97 · 452.98`, `` `✓ all 51 test files passed` ``. The `#713 U6c-8` figures (`89.10 · 79.93 · 80.07`, 50 files) move to their own superseded note.

`figma/plugin/ui.html`'s KB figure is unchanged (still `4119.1` by the check script's own byte-length-as-utf8-string method): a no-op, per the plan's own wording for this cell.

## U2-7's P2 half

Command, run at `cfd1edf8` in a fresh `git clone --shared` copy (`git rev-parse HEAD` confirms the clone's head): `sh .sdlc/checks/baseline-agrees-check.sh`.

```
ok    tests: baseline 51, test/run.mjs TESTS 51
ok    ui.html: baseline 4119.1 KB, tree 4119.1 KB
STALE time test: baseline 151 to 1058 s, adapter 80 to 89 s
ok    time build: baseline 1 to 3 s, adapter 1 to 3 s
[... six more ok time rows, unaffected by this unit ...]
note  head: baseline ref a62ec020, the tree moved outside .sdlc/ and .gitignore since the baseline ran, so the numbers are unproven at this head
ok    head: baseline ref a62ec020 is in origin/main's history
stale total: 1
```

`exit 1`. `grep -c -E '^STALE (tests|ui\.html|time )'` -> `1`. `grep '^STALE ' | grep -v -c '^STALE head'` -> `1`. `grep -E '^(STALE|note|ok) +head'` -> the two lines quoted above.

This does not read `0`, `0` as the plan's P2 criterion states. `tests` and `ui.html` agree (51 = 51, 4119.1 = 4119.1). `time test` is genuinely `STALE`: two of the three counted runs are R50 under-load readings (1057.97 s, 452.98 s), which R50 rules must be marked as under-load and not folded into the quiet-machine ceiling figure `adapter.md`'s `test` row states (80 to 89 s, `#713` U6c-8's last quiet reading). Rewriting that cell to the new 151-to-1058 s range would do exactly what R50 says not to: treat contention-dominated readings as the ceiling's figure of record. `adapter.md`'s `test` row is left untouched; the STALE line is recorded here and in `.sdlc/questions/gg-U2b-p2-time-stale.md`. Owner ruling R53 (2026-09-25, "Keep quiet figure, carry STALE (Recommended)") answers it: `adapter.md`'s row stays at 80 to 89 s, and the one `STALE time test` line is carried as a documented exception under R50 through pre-land, not resolved by rewriting the ceiling cell.

### P2's negative control

In a second fresh clone at the same head, the baseline's test-file figure lowered by one (`` `✓ all 51 test files passed` `` -> `` `✓ all 50 test files passed` `` on the `npm test` row):

```
STALE tests: baseline 50, test/run.mjs TESTS 51
```

`exit 1`. `grep -c -E '^STALE (tests|ui\.html|time )'` -> `2` (the injected `tests` line plus the pre-existing `time test` line). `grep '^STALE ' | grep -v -c '^STALE head'` -> `2`. Head lines unchanged from the clean run.

The plan's stated expectation for this control is `1` and `1`; today it reads `2` and `2` because the clean run already carries the one `time test` STALE line explained above, so the control's own reading is one line higher than the plan's original prototype. Recording the measured figures rather than the plan's literal constant, in the same spirit as the existing P1 control note ("a different corruption or a different grep gives a different count, so grade on the exit, the file and the gate, and record the count you measured"). The control still proves detection: introducing the defect moves the first figure from `1` (clean) to `2` (control), and the new line it adds is the `tests` line, exactly as expected.

## P1 (`npm test` green, count agrees, tree byte-stable)

Clean, at HEAD, in the unit worktree: `exit 0`, `` `✓ all 51 test files passed` ``, `git status --short` empty after.

Negative control, in a fresh `git clone --shared` copy at the same head (`git rev-parse HEAD` matches): `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json`, then `npm test`. Three lines quoted from the run: `▶ engine/semantic.mjs      FAIL`, `  FAIL  refs-canonical  — ordered key set != canonical`, `✗ 1/51 test file(s) failed`.

`exit 1`, `grep -c FAIL` -> `3` (measured, matching the shape the adapter's own P1 control note describes, count stated rather than assumed).

## Closed

`.sdlc/questions/gg-U2b-p2-time-stale.md`: answered by owner ruling R53, quoted above. Nothing in U2-7's P2 half or step 7 is left open; the one `STALE time test` line is the expected, documented reading under R50, carried through pre-land.
