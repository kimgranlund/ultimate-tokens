# Verdict gate-split U4 · 🟢 at c8823976

Unit: U4, `prime.mjs` thinned determinism cases and hue grids under `--full` vs SAMPLED. Branch `unit/gs-U4`, head `c8823976`. Handoff: `.sdlc/handoffs/gate-split-U4.md` on that branch. This unit's own fork point for the scope-wall diff (P8/P9) is `ebddc55d` (revision 6 of the plan; confirmed an ancestor of `c8823976` below), not `origin/main`, because G0 is waived for U2 to U5.

Every row below was reproduced independently in this pass, not taken on the handoff's word, in throwaway clones under `/tmp/gs-u4-verify-ctl/` left in place. The reused worktree `/tmp/gs-u4-verify` was never edited.

## Known carry-overs (not graded red here)

Per plan revision 7 (`fb5a4b77`), these are known and belong to the plan's pre-land pass, not this unit's verdict:

- (a) `test/engine/prime.mjs:350`'s `114/151,200 every time` comment (and its `742/302,400` sibling two lines down) still states the FULL leg's own measured count as an unconditional fact of "the file", with no clause naming it FULL-only. Confirmed present at `c8823976`. Runtime behavior is right; the comment is stale prose, deferred to the pre-land fix commit.
- (b) The SAMPLED negative control's own witness count under the M-B mutation (`3/400` determinism shifts, `73/30240` gamut-ceiling rungs, reproduced below in U4-3) is recorded, not a strength claim. Detection of M-B is carried by the FULL leg (P5 row 4), which is graded.
- (c) U4-1's pass-line count is `21`, not the plan's original `20` (the plan's figure was read off a head with no `const DECLARED` line). Reproduced independently below.

## Clone provenance

Every negative-control clone was checked for two things before its result was trusted: (1) it resolves to the unit's own final commit, not an earlier one a `--shared` clone could have caught mid-edit, and (2) it actually carries the unit's split logic, not a stale pre-split file that happens to share a commit message.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| CP | Every clone used below (`c1` to `c5`, `c8`, `p1neg`, `p8neg`, `p9neg`) is cut from the unit's real final head and carries its split logic | `for d in c1 c2 c3 c4 c5 c8 p1neg p8neg p9neg; do git -C /tmp/gs-u4-verify-ctl/$d log -1 --format=%h; grep -c 'HUE_OFFSET = SAMPLE_SEED' /tmp/gs-u4-verify-ctl/$d/test/engine/prime.mjs; done` | all nine clones: `c8823976` then `1` | a clone left at the pre-unit base would print `ebddc55d` (no U4 commit) and the symbol grep would print `0` (the line does not exist pre-split); neither was observed on any of the nine |

## P1 (`npm test` green, count agrees, tree byte-stable)

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green, `TESTS.length` agrees, tree clean | 🟢 | clone `c8`: `✓ all 50 test files passed`, then `50` (perl `TESTS` count), then `0` (`git status --short \| wc -l`) | clone `p1neg` (role-table.json corrupted via `sed -i '' 's/"scrim/"scrimX/'`, provenance confirmed at `c8823976` above): `✗ 1/50 test file(s) failed`, `exit 1`; `refs-canonical, ordered key set != canonical` in `engine/semantic.mjs` |

## U4 criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U4-1 | FULL is the old file (same gates, same verdicts, full corpus); N is the file's own re-observed count | 🟢 (N = 21, not the plan's 20; see carry-over (c)) | worktree, `npm run -s gate:sweep-prime`: `exit 0`, then `21` (`^  pass  ` lines), `1` (`0/2000 palettes shifted hex by call order`), `1` (`(FULL: 2000 determinism cases, 1500 poison renders, hue step 1)`) | P5 row 4 below (M-B) reds this same leg |
| U4-2 | SAMPLED is green, says so, no sweep dropped | 🟢 | clone `p9neg` (unmutated at the time this row ran), `node test/engine/prime.mjs`: `exit 0`, `1` (`0/400 palettes shifted`), `1` (`(SAMPLED: 400 determinism cases, 1500 poison renders, hue step 5)`) | clone `c1` (`GAMUT_SWEEP`'s computed floor hardcoded back to `15000`, `git diff --stat` = `1 file changed, 1 insertion(+), 1 deletion(-)`), SAMPLED: `` FAIL  c , only 3600 hueShift-sweep cases checked (expected 15000), the thinned sweep did not run ``, `exit 1` |
| U4-3 | what the local tripwire does with the #686 defect (M-B), SAMPLED | 🟡 recorded, not graded (plan's own rule) | clone `c5` (hct.js cache keys reverted to `.toFixed(2)`), SAMPLED: `exit 1`, `3/400 palettes shifted hex by call order`, `` gamut-ceiling: 73/30240 real out-of-gamut rungs `` (ceiling-line count `1`). Matches the handoff's own figures exactly | FULL carries the graded defect, see P5 row 4 |
| U4-4 | the file's share of `npm test`, at or under 25s quiet | 🟡 recorded, not graded (host never read under 5) | clone `c8`, `/usr/bin/time -p node test/engine/prime.mjs`: `real 56.43`. Before: load `14.22 11.55 14.36`; after: load `18.22 13.28 14.84`; guard (`pgrep -f 'node .*test/(run\|engine\|ui)' \| wc -l`) read 2 before (sibling `tonal.mjs --full` and `headless-boot.mjs --full` mid-run), 1 after. Handoff's own reading: `real 50.04`, load `21.13 57.84 61.01` before, `33.17 50.91 57.90` after, also loud. Two independent loud readings agree the file itself is not the ceiling risk; neither counts as a quiet figure of record | not run: the host never fell under load 5 in this pass, so the row is recorded and not graded, and this cell claims no reading. The control that would make it falsifiable is the same `/usr/bin/time -p` command at the fork point ebddc55d, where `prime.mjs` still carries the FULL corpus; nobody ran it (conductor wording, the verifier left the cell empty) |

## P3 (`sweep-prime` leg only)

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P3 main | `gate:sweep-prime` sweeps everything, FULL line present | 🟢 | worktree, `npm run -s gate:sweep-prime`: `exit 0`, mode-line count `1` (same run as U4-1) | (a), (b), (c) below |
| P3 (a) | dropping ` --full` from the script starves the FULL leg | 🟢 | clone `c2` (`package.json`'s `gate:sweep-prime` -> `node test/engine/prime.mjs`, no flag), `npm run -s gate:sweep-prime`: `exit 0`, FULL-needle count `0` | the unmutated main row above prints `1` |
| P3 (b) | losing the `--full` read inside the file starves the FULL leg even with the flag present | 🟢 | clone `c3` (`const FULL = false;`), `npm run -s gate:sweep-prime` (script still passes `--full`): `exit 0`, FULL-needle count `0` | the unmutated main row above prints `1` |
| P3 (c) | the FULL-side vacuity check bites when the substitution point is forced sampled | 🟢 | clone `c4` (`const DET_CASE_COUNT = 400;`, `git diff --stat` = `1 file changed, 1 insertion(+), 1 deletion(-)`), `npm run -s gate:sweep-prime`: `exit 1`; `` FAIL  c , only 400 determinism cases built in FULL mode, expected 2000, the FULL case list did not run ``; `FAIL` count `2`; `400` count `3` | the unmutated main row exits `0` with no such FAIL line |

## P5 row 4 (M-B, FULL leg)

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P5-4 | the moved sweep still reds on the #686 mutation, FULL leg | 🟢 | clone `c5` (`src/engine/hct.js` cache keys reverted to `.toFixed(2)`, `git diff --stat` = `1 file changed, 2 insertions(+), 2 deletions(-)`), `npm run -s gate:sweep-prime`: `exit 1`; `` gamut-ceiling: 409/151200 out-of-gamut rungs exceeds the pinned ceiling of 0 `` (count `1`); `7/2000 palettes shifted` (count `1` via `grep -cE ' [1-9][0-9]*/2000 palettes shifted'`) | the unmutated main row exits `0` with a needle count of `0` for both |

## P8 (branding clean, no added em dash outside a backtick span)

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P8 | branding clean; no U+2014 on an added line outside backticks, diffed against `ebddc55d` | 🟢 | worktree: `node test/repo/branding.mjs \| tail -1` -> `branding: clean (515 files scanned)`. `git diff ebddc55d \| grep -v '^+++ ' \| grep '^+' \| perl -CSD -ne 's/`[^`]*`//g; print if /\x{2014}/' \| wc -l` -> `0` | clone `p8neg`: `cp docs/reference/references/decision-records.md .sdlc/verdicts/x.md` -> `` FAIL: 3 branding violation(s) across 516 files ``. Same clone, appending a line with a literal em dash to `test/engine/prime.mjs`: the same diff command against `ebddc55d` -> `1` |

## P9 (scope wall, diffed against `ebddc55d`)

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P9 | only `test/engine/prime.mjs` (plus this unit's own handoff) changed since `ebddc55d`; no `src/` change | 🟢 | worktree: `git diff --name-only ebddc55d` -> `.sdlc/handoffs/gate-split-U4.md`, `test/engine/prime.mjs` only. The plan's filter command -> `0`, `0` | clone `p9neg`: appended a line to `src/engine/hct.js` (a scope violation): the same two filter commands against `ebddc55d` both -> `1` |

## Overall

🟢. No graded row is red. The two 🟡 rows (U4-3, U4-4) are not-graded-by-design per the plan itself (U4-3 is explicitly "recorded, not graded"; U4-4's ceiling only grades on a quiet host, and this host never read a 1-minute load under 5 during this pass). All eleven graded rows (P1, U4-1, U4-2, P3 main/a/b/c, P5-4, P8, P9) reproduced independently with a working negative control each, and every negative-control clone's provenance was confirmed against the unit's own final head (`c8823976`) before its result was trusted.
verdict: 🟢
