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

| Item | State | Note |
|---|---|---|
| C1, the ownership move at `:116` | 🟢 | `standing ruling R4` replaced by the section that carries the sentence; not replaced by `R11`, see below |
| C2, the re-check rule at `:90` | 🟢 | credited to `survey-2026-09-18` approval Q2, whose option text carries the wording verbatim |
| Criterion 2, no other cell touched | 🟢 | one file, two changed lines, and the word diff is confined to the two sentences |
| Criterion 3, one roadmap-only commit | 🟢 | one commit whose `--name-only` lists `.sdlc/roadmap.md` alone |
| The five gates | 🟢 | table below |

## The unit's stated repair for C1 is itself unsupported, so the repair narrows instead

The unit row and the dispatch both say the ownership ruling is `R11`, `Who owns what`. There is
no `R11` in `.sdlc/questions/standing-rulings-2026-09-20.md`, and no string `Who owns what`
anywhere under `.sdlc/`. The file has four numbered rulings, `R1` to `R4`, at the regeneration
sha and at this unit's base, and one unnumbered trailing section.

Measured, at both shas:

- `git show <sha>:.sdlc/questions/standing-rulings-2026-09-20.md | grep -c '^## R11'` prints `0`
  at `7dde8cb1` and at `712e63db`.
- `grep -rn 'Who owns what' .sdlc/` prints nothing.

Citing `R11` would have swapped one unverifiable id for another, which the dispatch forbids, so
the citation narrows to the section that actually carries the sentence rather than gaining a
number that does not exist.

## C1: the sentence, its real home, and the control

The roadmap's clause is `the other conductor session no longer touches this repo's plans`. Its
source is the third bullet of the unnumbered section `## Earlier today, same channel`, at
`.sdlc/questions/standing-rulings-2026-09-20.md:30`:

`- The other conductor session no longer touches this repo's plans (owner, in chat).`

The file has exactly one commit, `e9850935` (`2026-09-20T19:31:48Z`), which is before the
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

| Gate | Command | Result |
|---|---|---|
| test | `npm test` | exit `0`, last line `all 48 test files passed`, `git status --short` shows only the roadmap edit |
| branding | `node test/repo/branding.mjs` | exit `0`, `branding: clean (508 files scanned)` |
| path scope | `git diff --name-only $BASE HEAD` | `.sdlc/` only |
| em dashes | added-line dash count against `$BASE`, this handoff excluded | `0` |
| baseline | `sh .sdlc/checks/baseline-agrees-check.sh` | exit `0`, `stale total: 0` |

`npm test` was run twice, both times with the exit code read from `$?` and never through a pipe
or `tail`, and both times exit `0`. Neither run completed inside the tool's foreground window:
the host load average was above `300` for the whole unit (14 users, concurrent agents), against a
baseline run measured at load `3.13` and `56` to `60` s. The harness moves any command past its
timeout ceiling to a background job on its own, which is what happened to both runs; nothing was
dispatched with `&` or `run_in_background`. The second run took longer than the `600` s ceiling.
