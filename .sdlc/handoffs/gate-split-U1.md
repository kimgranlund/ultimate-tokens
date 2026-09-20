# Handoff U1 . builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/gs-U1 @ a11e8aff251f44709770241f3f2e2b3ac0ef8be6 |
| Files | test/engine/lib/corpus-sample.mjs (new), test/engine/corpus-sample.mjs (new), test/engine/curated-contrast.mjs, test/run.mjs, package.json |
| Ran | npm test 49/49 pass, exit 0, tree 0 after commit ; node test/repo/branding.mjs clean (480 files) |
| Left out | none |

## G0 (waived for U1 only per gate-split-approval.md follow-up 5)

`git cat-file -e origin/main:test/engine/anchor.mjs` -> `128` (fatal, path does not exist). `git show origin/main:test/run.mjs | grep -c '"engine/anchor.mjs"'` -> `0`. `gh issue view 681 --json state --jq .state` -> `OPEN`. `git cat-file -e plan/gate-split:test/engine/anchor.mjs` -> `128`. Matches the plan's "Today" row exactly (`128`, `0`, `OPEN`, `128`). Proceeded per the waiver; touched only U1's files.

## U1-1 to U1-5, measured against the committed tree (a11e8aff)

| # | Command | Printed | Verdict |
|---|---|---|---|
| U1-1 (=P6) | `node test/engine/corpus-sample.mjs; echo "exit $?"` | `(forward = reversed = shuffled: 35 documents, 392 palettes)` / `(seed 0 != seed 1: 35 documents)` / `PASS: corpus sample is a pure function of the document set and the seed` / `exit 0` | 🟢 |
| U1-2 | the `sampleCorpus` one-liner over the 8 category mirrors | `35 392` | 🟢 matches plan exactly, no re-measure needed |
| U1-3 | `grep -rlE 'fnv1a\|% vols\.length' test/engine test/ui \| sort` | `test/engine/lib/corpus-sample.mjs` (one line) | 🟢 |
| U1-4 | `node test/engine/curated-contrast.mjs`, mode line, sorted-pick grep, then `npm run -s gate:corpus-contrast \| tail -1` | `exit 0` ; `(SAMPLED seed 0, volumes architecture V, cuisine III, film IX, literature V, music IV, nature X, travel XI)` ; grep count `1` ; `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 🟢. Sorted pick matches the plan's cited needle exactly (`architecture V, cuisine III, film IX, literature V, music IV, nature X, travel XI`) -- no amendment needed |
| U1-5 | the `require("./package.json").scripts` check | four `ok` (commands) then five `ok` (sweeps membership, Q1=yes so `gate:corpus-reset` included) | 🟢 |

## Negative controls, each in a throwaway `git clone -q --shared`

| # | Control | Printed |
|---|---|---|
| P1 | corrupt `role-table.json`, run `npm test` | `exit 1` |
| U1-1/P6 | delete `.sort()` on `vols` in the lib | `FAIL` naming the categories whose pick moved, `exit 1` |
| U1-2 | `sampleCorpus` returns its input unsampled | `343 3780` |
| U1-3 | restore the old two-line picker in `curated-contrast.mjs` | two lines (`test/engine/curated-contrast.mjs`, `test/engine/lib/corpus-sample.mjs`) |
| U1-4 | restore the unsorted pick in the lib | mode line reads `architecture VI, cuisine III, film V, literature VI, music IV, nature X, travel XI`; the sorted-pick grep count is `0` |
| U1-5 | change one command to `echo gate:`, drop `gate:sweeps` | one `WRONG`, five `MISSING` |

## P7 (baseline-agrees-check.sh), as directed by the coordinator's ruling

`sh .sdlc/checks/baseline-agrees-check.sh` -> `STALE tests: baseline 48, test/run.mjs TESTS 49`, every other line `ok`, `stale total: 1`, `exit 1`. Expected mid-plan (TESTS moved 48 -> 49 registering `engine/corpus-sample.mjs`); `.sdlc/baseline.md` is U6b's file and was left untouched.

## Branding and prose

`node test/repo/branding.mjs` -> `branding: clean (480 files scanned)`. Em-dash sweep on the added lines (`git diff \| grep '^+' \| perl ... \x{2014}`) -> `0` after two fixes (a comment in `curated-contrast.mjs` and two in the new `lib/corpus-sample.mjs` / `corpus-sample.mjs` file headers, none of which are visible to `git diff` for new files so checked directly).

## Host

`uptime` 1-minute load `10.94` on a 10-core host at time of the `npm test` timing run (142.65 s real) -- over the quiet-host threshold, so that timing is not recorded as evidence, only as confirmation the suite passes. No `gate:*` script for tonal/anchor/prime/reset was executed for real (the target files do not exist pre-#681); U1-5 checks only exist/wiring.
