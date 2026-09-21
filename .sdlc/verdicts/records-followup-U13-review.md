---
kind: review
plan: records-followup
unit: U13
ticket: "#709"
branch: unit/rf-U13
head: 0d65d80df0144ef5ec2a1d9ddbd7339476e354d1
base: ee854932e2b03da92c17f666a63c60a5d3fc89b5
merge-base: 1f9918776f0e54e5dfd88c1b23f494f6d6cff6ce
seat: reviewer
date: 2026-09-20
verdict: FIX-FIRST
---

# U13 review, the handoff repairs at `0d65d80d`

> **Model-independence label, owner ruling R17.** This review ran opus at high effort, standing in for
> a fable reviewer seat. The Verifier who grades this unit next shares that model family. The
> cross-model independence a reviewer grade normally buys is not present here. Read every judgment
> below as opus checking opus. The command outputs are reproducible and independent of that; the
> grading of what they mean is not.

Reviewed at the branch head `0d65d80d`, not at the sha the handoff's gate table names. That is itself
one of the findings.

## Verdict

🔴 **FIX-FIRST.** Two one-cell repairs, both in `.sdlc/handoffs/records-followup-U13.md`, both of the
class this unit exists to stop. The repair work itself is sound: I followed twenty claims to their
sources and every one holds at the anchor its record declares. The defects are in U13's own handoff
describing itself, which is the category the census named highest-risk.

## Findings, hardest first

### 🔴 F1. The gate table's declared anchor is unreachable from the branch head

`.sdlc/handoffs/records-followup-U13.md:77` reads `Head graded: d9667a67`. The `npm test` negative
control at `:81` repeats it: `in a throwaway --shared clone at d9667a67`.

`d9667a67` is not this branch's head and is not reachable from it:

```
git rev-parse 0d65d80d        -> 0d65d80df0144ef5ec2a1d9ddbd7339476e354d1
git merge-base --is-ancestor d9667a67 0d65d80d   -> exit 1
git branch -a --contains d9667a67                -> (empty)
git rev-parse d9667a67^  == git rev-parse 0d65d80d^  == 92d31d83
git rev-parse d9667a67^{tree} = c93db87b...  vs  0d65d80d^{tree} = 25877b31...
```

It is an abandoned sibling of HEAD, same parent and a different tree, left over from the commit being
remade rather than amended. It sits on no ref and will not survive gc. Anyone who clones this branch
can resolve neither citation.

The gate results transfer. `git diff --stat d9667a67 0d65d80d` is one file, `.sdlc/handoffs/records-followup-U13.md`,
8 insertions and 5 deletions, so nothing under test differs, and I re-ran all five gates at
`0d65d80d` myself with the results in the table below. The conclusion the cells state is true. The
sha they anchor it to is not resolvable.

This is the A16 class the same unit just repaired in the U11 record, and the unit's own rule at
`:34-35`, that reachability rather than wall clock decides whether a commit is visible from a ref,
convicts it. Repair: name `0d65d80d`.

### 🔴 F2. `three files` is false under the command the same cell names

`:83`, the scope wall row: `🟢 0 paths outside .sdlc/, three changed in all`, with the command
`git diff --name-only $BASE | grep -vc '^\.sdlc/'` and `$BASE` declared at `:77` as `1f991877`.
`:88` repeats the figure in prose: `this branch changes three files, all under .sdlc/`.

Measured:

```
git diff --name-only 1f991877 0d65d80d | grep -vc '^\.sdlc/'   -> 0
git diff --name-only 1f991877 0d65d80d | wc -l                 -> 6
git diff --name-only ee854932 0d65d80d | wc -l                 -> 4
```

The `0` half holds. The count half does not: six paths from the declared `$BASE`, four from the unit
base, and three under neither reading. The four are the U5, U11, U12 and U13 handoffs.

This is item 3's failure mode caught in the act. Every clause in the cell is checkable, the first one
is true, and a per-clause reading passes the row because the `0` is what the reader tests. It is also
the A17 mechanism the same unit repaired in the U12 record one commit earlier: a figure sitting in a
cell that the cell's own command does not produce. The plausible source is the three repaired records,
which is a true statement about scope and a false one about changed files, because the handoff
recording the repairs is a fourth file.

Repair: state the count the command returns, or say `three records repaired` and drop the file count.

### 🟡 F3. `Five commits` against six

`:15` reads `Five commits, each touching exactly one file`, and the table at `:21-27` lists five shas.
`git rev-list --count ee854932..0d65d80d` returns 6. The sixth is the handoff's own commit, and all
six do touch exactly one file each. Same self-description shape as F2, and it is one word.

### 🟡 F4. The 17 against the census's 20 is not reconstructible

`.sdlc/handoffs/records-followup-U11.md:523-527` and U13 `:45-48` state seventeen claims graded,
sixteen repaired and one left standing, against the census's twenty, and defend the difference as
grouping.

The pass's rows in that Correction table are C1 to C12 plus the A16 sharpening: thirteen rows. C1 is
the only one that carries more than one figure, and it carries four, three repaired and the
`P0, P1, P2, P3` figure re-derived and held at `4, 2, 2`. Expanding it gives sixteen claims, fifteen
repaired and one held. No expansion rule is written down, so the seventeen and the sixteen cannot be
checked. The grouping defence names three regroupings (the R2 header at four sites, the board at two,
the tally at two) and does not arrive at a number either.

**Against the brief's question: no census red is silently unaddressed.** I mapped every line-site the
census leg 5 names to a row in the repair table, and all of them are covered:

| census site | row |
|---|---|
| `:91` to `:98` R2 header figures | C1 |
| `:111-112` tally, and the tally self-contradiction | C2 |
| `:123-125` and `:443` board | C3 |
| `:135` marker inside the quote span | C4 |
| `:146-148` `Count:` as context | C5 |
| `:276`, `:284-286` leg A `green=9` and tally agreement | C6 |
| `:347-349` `strictly narrower` credit | C7 |
| `:351-352` two lines against net one | C8 |
| `:356-357` `not written anywhere in this repo` | C9 |
| `:376` U5-4 open-issue diff | C10 |
| `:382-385` roadmap-commit enumeration | C11 |
| `:409` and `:444` `git status --short` | C12 |
| `:431-433` `Nine commits` prose | A14 |
| `:434-435` review path | A16 |

The arithmetic is unverifiable in both directions, because the census's own 22 does not reconstruct
from its own enumeration either: its `Stale before its own last commit, 12` bucket names ten sites.
Neither document's count can be re-derived from the list it sits above. That is a 🟡 on a unit whose
acceptance criterion is that every count is derived from the thing it names.

### 🟡 F5. An unreconciled census figure carried into a repair record

U11 `:524` says the census `followed 123 claims in this file`, and U13 `:43` carries `22 of 123`. The
census says 123 in prose at `:210` and 122 in its own closed-totals table at `:341`. Not U13's error.
Repeating a figure that its own source contradicts, inside a record whose job is repairing figures, is
the pattern the plan exists for, and it should be resolved where the census lives rather than here.

### 🟡 F6. The roadmap negative control names a ref whose tip is a different commit

`:86`: `at eccef435, the head this branch carried before the R18 rebuild and kept as
backup-rf-U13-preR18`. `git rev-parse backup-rf-U13-preR18` returns `107d2778`, not `eccef435`;
`eccef435` is an ancestor of it. The measurement is right either way, 76 diff lines across four
roadmap commits from both, so this is naming and not arithmetic.

### 🟢 Low. Two evidence cells print a command no reader can run

C4 at U11 `:508` and C9 at `:513` render their grep needle as a literal concatenation,
`` `git grep -c '` + "'` `cited:'" + ` 698e8916 -- .sdlc` ``. I reconstructed both needles and both
figures hold exactly: the adjacent form returns six files at `698e8916`, and the inline form returns
`records-followup-U11.md` alone at `2`. The acceptance criterion asks for the command and its output,
and the output is right while the command as printed is not copy-pastable.

## What holds, verified against the sources

### The roadmap really is untouched

```
git rev-parse ee854932:.sdlc/roadmap.md   -> b3825864f7a7c0219d946ac1131892e901f79a1b
git rev-parse 0d65d80d:.sdlc/roadmap.md   -> b3825864f7a7c0219d946ac1131892e901f79a1b
git log --oneline ee854932..0d65d80d -- .sdlc/roadmap.md   -> (empty)
git diff --name-only ee854932 0d65d80d    -> the four handoff files, nothing else
```

Same blob object, and no commit on the branch touches the path.

### The anchors are the right ones and were used

The U11 repairs grade at `698e8916`, that file's own last commit; the U12 repair at the range its own
stat pins, `712e63db..ee854932^2`; the U5 repair resolves at both `main` and the branch. I confirmed
`698e8916` is the U11 handoff's last commit on this branch and that the branch head `28426bf7` carries
three roadmap commits it does not, which is the wrong clock the first A14 repair used.

| claim | what I ran | result |
|---|---|---|
| A3 | `git show main:.sdlc/questions/standing-rulings-2026-09-20.md` and the same at `0d65d80d` | the sentence is at `:30` under `## Earlier today, same channel` (`:27`); `## R4` at `:22` is `Conductor session mode`. Repair correct on both refs |
| A14 | `git log --format=%H 3ee3c72b..698e8916` with and without each pathspec | 11, 4, 7. Every one of the 11 touches exactly one of the two files, so 4 and 7 partition it. The four roadmap shas are `66d40f70, 1405ee77, 354c2d7f, 1fe53f5a`, exactly the front matter's four |
| A14 controls | the same from `1f991877`, and from `3ee3c72b..28426bf7` | 15 and 6; the four extra are `7dde8cb1, ee28fff6, 6ee0fd8a, 3ee3c72b`, exactly as named. At the branch head, 14 and 7, the figures the wrong repair used |
| A16 | `git merge-base --is-ancestor 3f6f1ebf 698e8916`, `git cat-file -e` at both shas | non-zero and missing at `698e8916`; both succeed at `5c6a0c13`. `3f6f1ebf` is `15:48:31-07:00`, earlier in wall clock and not reachable. The sharpening is correct |
| A17 | `git diff --word-diff=plain 712e63db ee854932^2 -- .sdlc/roadmap.md` | 6 `[-` and 5 `{+`, eleven. Stat is `1 file changed, 2 insertions(+), 2 deletions(-)`. The control still prints `8` for paths outside `.sdlc/` in `20298cca` |
| C1 | row count and Pri column at `698e8916` | 14 rows, `6 (p) · 4 P1 · 2 P2 · 2 P3`; `Count:` reads `unranked 6 · total 14` and `inputs:` reads `14 issues`. Control at `3ee3c72b`: 13 rows, `total 10` |
| C2 | tally match at `698e8916` | `nine of eleven units 🟢` twice; the single `ten of eleven` is at `:117` inside the revision log. Control at `1fe53f5a` returns the retired text |
| C3 | `grep -c '11 🟢'` over `698e8916:.sdlc/board.md`, and the U5 row | `0`, and the row reads ⚪. `428f81ad` is `16:08:42-07:00` |
| C4, C9 | the reconstructed needles at `698e8916` | six files adjacent, `records-followup-U11.md` alone at `2` inline |
| C5 | `git show --unified=0 --format= 3ee3c72b -- .sdlc/roadmap.md` | `@@ -38,0 +39,3 @@ Count: ...` and `@@ -111,0 +115 @@ ...`, no context lines. `Count:` is line 25 at `3ee3c72b~1`, insertion at 39, 14 apart |
| C6 | `git log -1 --format=%ci 66d40f70` | `2026-09-20 16:02:56 -0700`, the instant the row now names |
| C7 | `git log -S'strictly narrower' 698e8916 -- .sdlc/handoffs/records-followup-U11.md` | `089e0e44` removed the phrase, `b0003592` wrote it, and `b0003592`'s body does contain `The new strip is strictly narrower`. The re-credit is right |
| C8 | `git show --numstat --format= 66d40f70 -- .sdlc/roadmap.md` | `6 5`, net one. Control `7dde8cb1` prints `54 52` |
| C10 | `#723` creation against `698e8916`'s commit time, and the row at that sha | `16:24:11` against `16:28:12`, 4m1s; no `#723` row at that sha |
| C11 | `git log --format=%h 1f991877..698e8916 -- .sdlc/roadmap.md` | the six shas exactly as listed. Control at `1fe53f5a` returns three |

### C12 is left unrepaired and says so

The U11 body line was moved to past tense and now states that the P1 gate row reports the same command
printing `0` in the same worktree and that the two cannot describe one instant. The Correction row at
U11 `:516` says nothing recoverable orders them and carries the one fact that is recoverable, the
verifier's file reaching main at `428f81ad`, `2026-09-20T16:08:42-07:00`. No winner is picked in
either place. Correct handling, and consistent with the census's own ruling that uncommitted-path
counts are structurally uncheckable after the fact.

## Gates, re-run by me at `0d65d80d`

Run in `/Users/kimba/Projects/nonoun/ultimate-tokens/.worktrees/rf-U13`, head confirmed `0d65d80d`
before each. No `node_modules` in the worktree.

| gate | result | how |
|---|---|---|
| `npm test` | 🟢 `✓ all 48 test files passed`, exit `0` | foreground, exit written to the log by `echo "NPMTEST_EXIT=$?"` on the line after, never through a pipe or `tail`. The harness backgrounded the run under host load; the exit code is the process's own |
| tree clean after | 🟢 `git status --short` returns 0 lines | run in the worktree after the suite |
| `node test/repo/branding.mjs` | 🟢 `branding: clean (510 files scanned)`, exit `0` | `echo "BRANDING_EXIT=$?"` on the next line |
| scope wall | 🟢 `0` paths outside `.sdlc/` | `git diff --name-only $(git merge-base origin/main HEAD) HEAD \| grep -vc '^\.sdlc/'`. The path count is 6, which is F2 |
| em dashes added | 🟢 `0` stripped and `0` raw | the P6 pipeline over `git diff ee854932 HEAD -- .sdlc`, added lines only, with and without the backtick strip |
| `sh .sdlc/checks/baseline-agrees-check.sh` | 🟢 seven `ok` figure and time lines, one `note  head:`, one `ok    head:`, `stale total: 0`, exit `0` | `echo "BASELINE_EXIT=$?"` |
| roadmap untouched | 🟢 same blob `b3825864...` at base and head | blob ids compared |

They do not differ from the table's substance at `d9667a67`, which is expected: the only tree
difference between the two commits is the handoff file itself. The defect is the citation, not the
result.

## What must change before this lands

1. `.sdlc/handoffs/records-followup-U13.md:77` and `:81`: replace `d9667a67` with `0d65d80d`, and
   re-anchor after any further amend rather than before it.
2. `:83` and `:88`: the file count. Either state the count the named command returns, or say three
   records repaired and drop the file figure.

F3 to F6 are worth taking in the same pass and none of them blocks. F5 belongs in the census file.
