# Pre-PR · records-followup · 3c755098
verdict: 🟢
sha: 3c755098dd9ff00b45b89d245b378c4e76a0faf5
plan: .sdlc/plans/records-followup.md (ticket #709, revision 13), PR 1 of 2, base and merge base origin/main @ 3ce50daa346820d48593885cdc57120d844b5403
written: 2026-09-20 by records-followup-prepr-verifier (fresh context, read-only on the repo; built none of the units). Third pass: the first graded 887e3eb2, the second graded U10 at 23a206b4, this one grades the merged head
counts: 20 rows, 18 🟢, 1 🟡, 0 🔴, 1 ⚪ (P3, not applicable on U3's short path)

Every row is this seat's own run at this head, 2026-09-20 11:40 to 11:46, in throwaway `git clone --shared` clones under `/tmp/rf-prepr-verify` detached at the head sha, none with `node_modules`. Every plant ran in a second clone, hard reset and cleaned between plants, tree `0` after. The branch was re-read after the runs: `3c755098dd9ff00b45b89d245b378c4e76a0faf5`. Host: 10 cores.

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, tree byte-stable | 🟢 | `exit 0`, `✓ all 48 test files passed`, `TESTS` length `48`, `git status --short \| wc -l` = `0`. Load `7.74 6.60 7.48` before, `10.55 7.80 7.86` after, no other `test/run.mjs` process at start | `"scrim` to `"scrimX` in `role-table.json`: `exit 1`, `grep -c FAIL` = `3`, `✗ 1/48 test file(s) failed`, `engine/semantic.mjs *FAIL` count `1` |
| P1 timing | the run sits in the baseline band of 56 to 60 s | 🟡 | `79` s wall, load near the core count and rising to `10.55` during the run. Exit, summary and byte-stability hold; records-only diff, so not a regression signal and not a timing | same control as P1 |
| P2 | `npm run build` green, prints the live baseline size | 🟢 | not rerun at this head: `git diff --quiet 887e3eb2 HEAD -- . ':(exclude).sdlc'` exits `0`, so the tree the build reads is the one I built at `887e3eb2` (`npm ci` exit `0`, build `exit 0`, `ui.html 3780.5 KB` twice, tree `0`). At this head the check script reads the committed bundle: `ok    ui.html: baseline 3780.5 KB, tree 3780.5 KB`, and the P1 log prints `wrote figma/plugin/ui.html 3780.5 KB` | at `887e3eb2` before `npm ci`: `exit 127`, `sh: tsc: command not found` |
| P3 | `npm run smoke` green, only on U3's full path | ⚪ | not run: U3 took the short path (`extended:` line in `.sdlc/baseline.md` under the same `ref`) and no `src/ui/` file differs | not applicable |
| P4 | branding gate clean | 🟢 | `branding: clean (503 files scanned)`, `exit 0` | `decision-records.md` copied to `.sdlc/verdicts/x.md`: `FAIL: 3 branding violation(s) across 504 files`, `exit 1` |
| P5 | scope wall | 🟢 | `0`, `0`, `1	1`. 43 paths in `git diff --name-only $BASE`, all under `.sdlc/` except `.claude/CLAUDE.md`; the roadmap is not among them | `// probe` on `src/engine/motion.mjs`: `1`. `echo >> .sdlc/roadmap.md`: `1`. A second `CLAUDE.md` line: `2	2` |
| P6 | no em dash added in prose | 🟢 | stripped count `0`. Raw `17`, all inside spans: 12 on the enumerated restored quote lines (baseline 1, records-refresh U1 handoff 1, U3 handoff 4, U1 verdict 1, U3 verdict 1, checkability 1, prepr 1, survey 2) and 5 in this plan's own records quoting program output (plan file 1, followup U1, U3, U4 and U10 verdicts 1 each). The one new since `887e3eb2` is the U10 verdict's quoted gate line | one prose dash, one spanned dash, two prose dashes appended to `.sdlc/debt.md`: stripped `3`, raw `21` |
| P7 | `baseline-agrees-check.sh` at the pre-land head | 🟢 | eight `ok` lines, `stale total: 0`, `exit 0`, and the quoted note: `note  head: baseline ref 20298cc, the tree moved outside .sdlc/ and .gitignore since the baseline ran, so the numbers are unproven at this head` (the move is the one approved `CLAUDE.md` line) | live row retyped to 47: `STALE tests: baseline 47, test/run.mjs TESTS 48`, exit `1`. `ref` retyped to the plan-branch sha `24c99e58`: `STALE head: baseline ref 24c99e58 is in origin/main's history`, `stale total: 1`, exit `1` |
| U1-3 | adapter states what the control reproduces | 🟢 | `printed 3 for this corruption`, my own count `3` | the uncorrupted P1 log has no `FAIL` line |
| U1-4 (revision 13 needle) | the baseline credits the test file to the commit that added it | 🟢 | `(#699) (#702)`, `0`, `1` with the plan's new third leg `grep -c '#699 (PR #702, 9a44f685) touched only files under'` | `origin/main:.sdlc/baseline.md`: third leg `0`. The word `only` removed in the plant clone: `0` |
| U2-1 / U7-1 | no X or P id defined in two live records | 🟢 | `C1,C2,C3,C4,C5,C6,C7,K9,K11,K14,K17,K18` | the seven files at `d34b4fb1`: the same list plus `P1,P2,P3,P4,X1,X2,X3,X4,X5,X6` |
| U7-4 | every debt P cite moved | 🟢 | `.sdlc/adapter.md:2`, `.sdlc/debt.md:5`; `0`; `22,52,95,`, which the plan's Expected now states (revision 11) | at `d34b4fb1`: `5` bare debt `P` lines |
| U3-1 | the script reads five gates and everything agrees | 🟢 | as P7, among the lines `ok    time corpus-contrast: baseline 20 to 23 s, adapter 20 to 23 s` and `ok    time fonts: baseline 1 to 1 s, adapter 1 to 1 s`; numstat `3	3` | as P7 |
| U3-8 | the approved `CLAUDE.md` line names the PR jobs | 🟢 | `build-test,corpus-contrast,panda-smoke`, `1`, `1	1`, `rows 56 drifted 11 holds 45 undetermined 0 bad 0` | `origin/main:.claude/CLAUDE.md`: phrase count `0` |
| U4-2 | the U1 verdict quotes the gate line as my control prints it | 🟢 | `line.txt` has `1` line, `FAIL  refs-canonical  — ordered key set != canonical`; match count `1`; old form `0` | `origin/main` copy of that verdict: match `0` |
| U9-1 | main is merged in, no conflict marker left | 🟢 | `git merge-base --is-ancestor origin/main HEAD` exits `0`; marker grep prints nothing; `git diff --name-status origin/main HEAD` has `0` rows other than `A` or `M` | pre-merge head `8cf8eb57` exits `1` (run at the first pass) |
| Pinned copies | both copied reviews still hash to their stated values | 🟢 | followup review body `e30720eb197f324c...`, equal to its `body-sha256:`; records-refresh review `6a3a285e91555f7b...`, equal to the plan's front matter | one appended space changes either hash (run at passes 1 and 2: `e955d2988108`, `772046263b97`) |
| Records | board, checklist and verdict files agree for U1 to U10 | 🟢 | the plugin's `board.py check`: ten rows, all `Agree` 🟢, exit `0`; `board.py ids .sdlc` exit `0`; nine `[x]` and one `[ ]` (U5); every 8-hex sha on the plan's board rows and every `sha:` in the unit verdicts is an ancestor of the head, `0` lines of `NOT` | a plan-branch sha tested against `origin/main` reads `1`, so the ancestor test tells the two apart |
| Board grades | U6, U8, U9 rows say `verifier-l2`; U9's row carries its merge sha | 🟢 | board rows read `U6 verifier-l2`, `U8 verifier-l2`, `U9 verifier-l2`, `U10 verifier-l2`; U9's branch cell reads `unit/rf-U9 @ 24c99e58 merged 887e3eb2`; `887e3eb2` is an ancestor of the head | at `887e3eb2` all three rows read `verifier-l1` and U9's cell read `merged in this commit` |
| Plan true against itself | the findings of pass 1 are closed | 🟢 | Revisions table carries rows 6 to 13; `size:` counts `10 points` and names U10; `head:` states that `BASE` reads `3ce50daa` since U9; U7-4 Expected reads `22,52,95,` | at `887e3eb2`: rows 6 and 9 only, `8 points`, `22,52,91,` |

## Squash safety

The baseline `ref` `20298cc` and every sha the baseline cites are in `origin/main`'s history; the adapter amendment's cite `.sdlc/verdicts/k17-rerun-prepr.md` exists on the branch. Plan-branch shas in this plan's verdicts, board rows and the `debt.md` K17 note die at the squash, and each is now annotated as such or accepted by the plan's risk table. Nothing found that breaks main after a squash-merge.

## Findings, ranked

1. 🟡 `amended:` in the plan front matter says revision 10 while the table reaches 13. Close-out fix.
2. 🟡 U4-5's second leg is frozen between two shas since revision 12 and prints `9` whatever happens; the live dash control is the raw count against `BASE`, `17` at this head. Carried from the U10 verdict.
3. 🟡 Board row U10 says `merged in the commit that carries this row`; that commit is `3c755098` and dies at the squash with the rest. Close-out may name it.
4. 🟡 The script's STALE wording reads backwards when it fires (`STALE head: ... is in origin/main's history`). Inherited from main, ruled debt.
5. 🟡 P1 wall time 79 s against the 56 to 60 s band at load 7.7 to 10.6 on 10 cores.

Must fix before landing: none. Any new commit on the branch voids this record's `sha`.

## Reviewer and how this record was written (conductor)

Written by the conductor seat, which dispatched the verifier and built no unit; the Orchestrator lane that wants to land did not write it. The pre-land reviewer (reviewer-l4, fresh context, dispatched by the lane) graded `887e3eb2` against `origin/main` and returned FIX-FIRST with every gate green: one small blocking finding (records this PR adds broke the verbatim-quote rule it writes) and eight notes. Its record is copied byte for byte into `.sdlc/verdicts/` by U10 under the byte-pinned copy clause. Findings 1, 2 and 4 were repaired by U10 (verdict `.sdlc/verdicts/records-followup-U10.md`, graded at `23a206b4`); findings 3 and 5 by plan revisions 10 to 13, which also removed a session resume note from the branch. Findings 6 to 9 are notes and stay open: finding 9 is U5's, the roadmap PR.

Gate note: the commit that adds this record is the only commit after `3c755098` and its whole delta is this file, as the records-refresh record did at `e60a4286`.

Close-out nits the verifier named, left for the plan-closing commit on main because any commit here voids the `sha`: the plan's `amended:` line says revision 10 while the table reaches 13, and the U10 board row names no merge sha.
