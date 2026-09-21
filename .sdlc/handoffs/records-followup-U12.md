---
kind: handoff
plan: records-followup
unit: U12
ticket: "#709"
plan-revision: 25
branch: plan/records-followup-roadmap
unit-branch: unit/rf-U12
base: 712e63db277c52c3e1b96dbedb4c4e2b042c615b
merge-base: 1f9918776f0e54e5dfd88c1b23f494f6d6cff6ce
roadmap-commits: 15cd3121
written: 2026-09-20
---

# U12: two false citations in the roadmap

Two citations in `.sdlc/roadmap.md`, both written by the regeneration commit `7dde8cb1`
(`2026-09-20T21:36:16Z`) and both older than U11. Everything below was measured in
`.worktrees/rf-U12`.

## Verdict

| Item | State | Evidence | Control |
|---|---|---|---|
| C1, the ownership move at `:116` | 🟢 | the `Earlier today, same channel` grep printed `1` at `7dde8cb1` and at `712e63db` | the same grep scoped to the `R4` section printed `0` at both shas; `grep -c '^## R11'` printed `0` at both |
| C2, the re-check rule at `:90` | 🟢 | the survey Q2 grep printed `1` at `7dde8cb1` and at `712e63db` | the same needle against `records-followup-approval.md` Q2 printed `0` at both shas |
| Criterion 2, no other cell touched | 🟢 | `git diff --stat` reads `1 file changed, 2 insertions(+), 2 deletions(-)` and the word diff shows eleven spans, six removed and five added, all inside the two sentences: `git diff --word-diff=plain 712e63db ee854932^2 -- .sdlc/roadmap.md` counts 6 `[-` and 5 `{+`, three and three in the `:90` hunk and three and two in the `:116` hunk | `git diff --name-only 712e63db HEAD \| grep -vc '^\.sdlc/'` printed `0`; the same pipeline over `20298cca~1 20298cca` printed `8` |
| Criterion 3, one roadmap-only commit | 🟢 | `git show --name-only --format= 15cd3121` printed `.sdlc/roadmap.md` and nothing else | the same command on `0a30f287`, this handoff's commit, printed a different path, so the command distinguishes the two |
| Gate, test | 🟢 | `npm test` exit `0` twice, `all 48 test files passed`, tree clean after | the adapter's named corruption in a scratch clone: exit `1`, `engine/semantic.mjs      FAIL`, `FAIL  refs-canonical  ` the one failing gate, `grep -c FAIL` printed `3`, `1/48 test file(s) failed` |
| Gate, branding | 🟢 | `node test/repo/branding.mjs` exit `0`, `branding: clean (509 files scanned)` | a planted file under `.sdlc/runtime/` carrying the retired uppercase run: exit `1` and the gate named that file; removed, exit `0` again |
| Gate, path scope | 🟢 | zero paths outside `.sdlc/` in `git diff --name-only 712e63db HEAD` | `20298cca~1 20298cca` through the same pipeline printed `8` |
| Gate, em dashes | 🟢 | added-line dash count against `712e63db`, this handoff excluded, printed `0` | the same count over `e9850935~1 e9850935` under `.sdlc/` printed `17` |
| Gate, baseline | 🟢 | `sh .sdlc/checks/baseline-agrees-check.sh` exit `0`, `stale total: 0` | `48` bumped to `49` in `.sdlc/baseline.md`: exit `1` and `STALE tests: baseline 49, test/run.mjs TESTS 48`; restored, the file's sha unchanged and exit `0` again |

## `R11` is not readable from this branch, and where it is readable it rules something else

The unit row and the dispatch both say the ownership ruling is `R11`, `Who owns what`. Every
claim below names the ref it was read at, because the rulings file's content differs by ref.

Read at the regeneration sha `7dde8cb1` and at this unit's base `712e63db`, where
`.sdlc/questions/standing-rulings-2026-09-20.md` is byte-identical (`shasum` `688f1a9b5631` at
both):

- `git show <ref>:.sdlc/questions/standing-rulings-2026-09-20.md | grep -c '^## R11'` prints `0`
  at both. The file there carries `R1` to `R4` and one unnumbered trailing section.
- `git grep -c 'Who owns what' 712e63db -- .sdlc/` prints nothing and exits `1`.

Read at `origin/main`, which is `0eba2eee` as this handoff is written, `R11` does exist. It was
added by `b8c3be8f` at `2026-09-20T22:50:50Z`, after the regeneration commit `7dde8cb1`
(`21:36:16Z`) that wrote the sentence, and its question is `Who owns #709's roadmap PR #720 from
here?`, answered `The background seats finish #720; I stay off #709 (Recommended)`. That is
which seat drives the PR, not the lane-ownership move the roadmap cell describes.
`git grep -c 'Who owns what' origin/main -- .sdlc/` names four files there; at this branch's HEAD
it names three lines, all of them in this handoff.

So the citation does not move to `R11`: on this branch it is unreadable, and where it is
readable it postdates the sentence and rules a different thing. It narrows to the section that
carries the sentence instead.

## C1: the sentence, its real home, and the control

The roadmap's clause is `the other conductor session no longer touches this repo's plans`. Its
source is the third bullet of the unnumbered section `## Earlier today, same channel`, at
`.sdlc/questions/standing-rulings-2026-09-20.md:30`:

`- The other conductor session no longer touches this repo's plans (owner, in chat).`

One commit touching that file is reachable from this branch's HEAD, `e9850935`
(`2026-09-20T19:31:48Z`); `origin/main` reaches six and all refs together reach fifteen, and
their contents differ. `e9850935` is before the
regeneration `7dde8cb1` (`21:36:16Z`), and
`git diff 7dde8cb1 712e63db -- .sdlc/questions/standing-rulings-2026-09-20.md` is empty, so the
bytes read here are the bytes the roadmap's author could have read.

Positive, run at `7dde8cb1` and again at `712e63db`, both printing `1`:

`git show $SHA:.sdlc/questions/standing-rulings-2026-09-20.md | awk '/^## Earlier today, same channel/,0' | grep -c "The other conductor session no longer touches this repo's plans"`

Negative control, the retired id read at the same two shas, both printing `0`:

`git show $SHA:.sdlc/questions/standing-rulings-2026-09-20.md | awk '/^## R4 /,/^## Earlier/' | grep -c "no longer touches this repo's plans"`

What `R4` does contain, at `:22` to `:25`, is `Conductor session mode`: whether this session runs
in bypass so that peer messages are not held for approval. Nothing in it is about who owns a lane.

The cell now reads `per the owner ruling of 2026-09-20 recorded under 'Earlier today, same
channel' in .sdlc/questions/standing-rulings-2026-09-20.md`, with the backticks the file uses.
The following sentence, `#496` moved to parked `per the same day's ruling`, is untouched; the
same bullet list carries `#496: Park it, the owner does the Figma steps later.` at `:29`, so it
stays true under the new antecedent.

## C2: the wording is the survey approval's, verbatim

The roadmap's claim is that architecture and debt get re-checked per plan, where a plan touches
them. The source is the Recommended option of `## Q2` in
`.sdlc/questions/survey-2026-09-18-approval.md`, which ends:

`architecture and debt get re-checked per plan, where a plan touches them`

Positive, at `7dde8cb1` and at `712e63db`, both printing `1`:

`git show $SHA:.sdlc/questions/survey-2026-09-18-approval.md | awk '/^## Q2/,/^## Q3/' | grep -c "architecture and debt get re-checked per plan, where a plan touches them"`

Negative control, the retired id at the same two shas, both printing `0`:

`git show $SHA:.sdlc/questions/records-followup-approval.md | awk '/^## Q2/,/^## Q3/' | grep -c "re-checked per plan"`

That Q2 is `How does the roadmap repair (U5) land?`, dated `2026-09-19`, answered
`Two PRs, roadmap is its own commit on main (Recommended)`. It says nothing about either record.

The sentence also drops the `.md` suffixes it had added to the two record names, so the clause it
credits to Q2 is now Q2's own wording rather than a paraphrase of it. Neither source file changed
between `7dde8cb1` and `712e63db`.

## No revision row

None added. Criterion 2 says no other cell is re-read or re-worded and its control is that the
diff is confined to the two sentences; a revision row is another cell. The two repaired sentences
are the whole change.

## Gates

| Gate | Command | Result | Control |
|---|---|---|---|
| test | `npm test` | exit `0`, last line `all 48 test files passed`, `git status --short` shows only the roadmap edit | scratch clone of this branch, `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json` (7 matches), then `npm test`: exit `1`, `engine/semantic.mjs` the one failing file, `refs-canonical` the one failing gate, `grep -c FAIL` printed `3` |
| branding | `node test/repo/branding.mjs` | exit `0`, `branding: clean (509 files scanned)` | planted file under `.sdlc/runtime/` with the retired uppercase run: exit `1`, that path named; removed, exit `0` |
| path scope | `git diff --name-only 712e63db HEAD \| grep -vc '^\.sdlc/'` | `0` | `20298cca~1 20298cca` through the same pipeline: `8` |
| em dashes | added-line dash count against `712e63db`, this handoff excluded | `0` | `e9850935~1 e9850935` under `.sdlc/`: `17` |
| baseline | `sh .sdlc/checks/baseline-agrees-check.sh` | exit `0`, `stale total: 0` | `48` bumped to `49` in `.sdlc/baseline.md`: exit `1`, `STALE tests: baseline 49, test/run.mjs TESTS 48`; restored byte for byte, exit `0` |

`npm test` was run twice, both times with the exit code read from `$?` and never through a pipe
or `tail`, and both times exit `0`. Neither run completed inside the tool's foreground window:
the host load average was above `300` for the whole unit (14 users, concurrent agents), against
the `56.27 · 56.43 · 59.83` test row of `.sdlc/baseline.md`, whose host line reads
`load 3.97 3.87 4.58 on 10 cores at run start`. The harness moves any command past its
timeout ceiling to a background job on its own, which is what happened to both runs; nothing was
dispatched with `&` or `run_in_background`. The second run took longer than the `600` s ceiling.

## Correction, 2026-09-20, by records-followup U13

One repair made in this file by U13 under pre-land record pass 3 addendum row A17. Nothing else in
the file was read or re-worded.

| id | Was | Is | Derived from | Negative control |
|---|---|---|---|---|
| A17 | criterion 2's evidence cell said `the word diff shows eight spans` | `eleven spans, six removed and five added`, with the command and the per-hunk split | `git diff --word-diff=plain 712e63db ee854932^2 -- .sdlc/roadmap.md` piped to `grep -o` counts 6 `[-` and 5 `{+`. `git diff --word-diff=porcelain` over the same range counts 7 lines starting `-` and 6 starting `+`, one more of each because the `--- a/` and `+++ b/` header lines match; subtracting them gives the same 6 and 5 | the `8` the cell carried is the figure the row's own control cell prints, and that figure is not a span count at all: it is `git diff --name-only 20298cca~1 20298cca` piped to `grep -vc '^\.sdlc/'`, the number of paths outside `.sdlc/` in an unrelated commit, which still prints `8` when run today. A number measured over a different range by a different command is how the copy is told from the measurement |
