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

---

# Pass 2, re-check at `66ea6b74`

> **Model-independence label, owner ruling R17, unchanged.** Opus at high effort standing in for a
> fable reviewer seat; the Verifier who grades next shares the model family. Opus checking opus.

Head `66ea6b74a31a8211d020b990d2b2af855cb4129a`. Eight commits from `ee854932`, each touching one
file. Two new since pass 1: `0a37f756` (U11 handoff) and `66ea6b74` (U13 handoff).
`0d65d80d` is an ancestor of the head.

## Verdict

🔴 **FIX-FIRST.** F1 and F2 are properly repaired. The F4 repair is incomplete: the retired 17 and 16
still stand in the summary table directly above the paragraph that retires them. One cell. The F3
repair has also been overtaken by the commits that made it.

## Pass 1 findings, re-graded

| finding | state | evidence |
|---|---|---|
| F1 anchor | 🟢 repaired | `d9667a67` no longer anchors the gate table. U13 `:82-87` ties the figures to the committed tree, with `git status --short` `0` as the tie, and names `0d65d80d` as the last ancestor the gates also ran at. `git merge-base --is-ancestor 0d65d80d 66ea6b74` exits 0, and `git diff --name-only 0d65d80d 66ea6b74` returns exactly the two paths the record names. The `d9667a67` paragraph at `:89-92` cites the sha only to say it resolves nowhere, which is honest. That the tree tie was measured cannot be checked after the fact; it is the same class as C12 and the record states its method, which is what that class allows. My own runs at this head are green (table below), so the tree does pass |
| F2 file count | 🟢 repaired | scope wall cell: `6` from `1f991877`, `4` from `ee854932`, named as the four handoffs, three called records and not files. Measured: 6, 4, the four paths as named, and `0` outside `.sdlc/` from both bases. The closing paragraph now says every path is under `.sdlc/`, `0` from either base, which holds |
| F3 commit count | 🟡 re-opened | see P2-2 |
| F4 reconciliation | 🔴 incomplete | see P2-1. The rule itself is sound and the arithmetic now reconstructs: 13 rows (C1 to C12 plus the A16 sharpening), C1 carrying four figures and the rest one each, is 16, with C1's `P0, P1, P2, P3` held and the other 15 repaired |
| F5 census 123 vs 122 | 🟡 left in the census | as ruled; not this unit's record |
| F6 backup ref | 🟢 repaired | `backup-rf-U13-preR18` tip is `107d2778`, `eccef435` is its ancestor, and the diff against it is 76 lines. All three as the cell now states |
| Low, C4 and C9 commands | 🟢 repaired enough | the needles are now written `'\x60 \x60cited:'` and `'\x60cited: '`, with `\x60` read as a backtick. As printed that is still not pasteable, because single quotes pass `\x60` literally, but the notation is declared and unambiguous. I re-ran the reconstructed needles in pass 1: six files and `2` |

## New findings

### 🔴 P2-1. The retired figure survives in the table the new paragraph annotates

`.sdlc/handoffs/records-followup-U13.md:44`, the per-record table row for the U11 record, still reads
`A14, A16 and C1 to C12: 17 claims graded, 16 repaired, 1 re-derived and left standing`. Two lines
below, `:46-49` says `Sixteen claims graded ... fifteen repaired and one re-derived and held` and that
`An earlier draft of both records said seventeen and sixteen under no stated rule`.

```
git show 66ea6b74:.sdlc/handoffs/records-followup-U13.md | grep -n '17 claims\|Sixteen claims\|seventeen and sixteen'
44:| `records-followup-U11.md` | 22 of 123 | A14, A16 and C1 to C12: 17 claims graded, 16 repaired, ...
46:Sixteen claims graded in the leg 5 pass, fifteen repaired and one re-derived and held, under the rule
49:earlier draft of both records said seventeen and sixteen under no stated rule. ...
```

The acceptance criterion's negative control is that the retired value, read the same way, does not
hold. Here it is still printed, in the table a reader meets first, and contradicted by the paragraph
under it. Repair the cell to the figures the paragraph states, and scope it the way the paragraph does:
under the stated rule the cell's `A14, A16 and` prefix would add two claims the sixteen does not count.

### 🟡 P2-2. `Six commits` is false at the commit that wrote it

`:15` now reads `Six commits, each touching exactly one file: the five repair commits tabled below and
the commit that adds this record`. `git rev-list --count ee854932..66ea6b74` returns `8`. The sentence
was written at `66ea6b74`, so under the unit's own rule it is graded there, and there it is eight.
The two it misses are the pass-2 repair commits, `0a37f756` and `66ea6b74`, the second of which is
the commit that made this edit. Each of the eight does touch exactly one file.

This is the third time a count this record gives of itself has been falsified by the act of recording
it. A count that includes the commit carrying it cannot be right at that commit unless it counts that
commit. The durable repair is to count what cannot move, for example `the five repair commits tabled
below, and the commits that add and revise this record`, rather than a new number that the next
revision falsifies again.

### 🟢 Note, not a defect

U11 `:524`, `the thirteen rows above`, sits above a table of fifteen rows. The preceding sentence at
`:519` scopes it to C1 to C12 and the A16 sharpening, so it holds. Worth reading twice, nothing to
change.

## Gates, re-run by me at `66ea6b74`

Worktree `/Users/kimba/Projects/nonoun/ultimate-tokens/.worktrees/rf-U13`, head confirmed
`66ea6b74` before the runs, no `node_modules`.

| gate | result | how |
|---|---|---|
| `npm test` | 🟢 `✓ all 48 test files passed`, exit `0` | `echo "NPMTEST_EXIT=$?"` on the line after, output to a log, no pipe. The harness backgrounded it; the exit is the process's own |
| tree clean after | 🟢 `git status --short` `0` lines | appended to the same log after the suite |
| `node test/repo/branding.mjs` | 🟢 `branding: clean (510 files scanned)`, exit `0` | `$?` on the next line |
| scope wall | 🟢 `0` outside `.sdlc/` from `1f991877` and from `ee854932` | `git diff --name-only <base> 66ea6b74 \| grep -vc '^\.sdlc/'` |
| em dashes added | 🟢 `0` stripped and `0` raw | added lines of `git diff ee854932 HEAD -- .sdlc`, with and without the backtick strip |
| `sh .sdlc/checks/baseline-agrees-check.sh` | 🟢 eight `ok` lines, one `note  head:`, `stale total: 0`, exit `0` | exit read from a run with output sent to `/dev/null`, not through a pipe |
| roadmap untouched | 🟢 blob `b3825864f7a7c0219d946ac1131892e901f79a1b` at `ee854932` and `66ea6b74`; `git log ee854932..66ea6b74 -- .sdlc/roadmap.md` empty | blob ids compared |

They agree with the handoff's table. The handoff's own `npm test` timing (131 s, load 20.10) is its
run, not mine, and is not a timing figure either way.

## What must change before this lands

1. `.sdlc/handoffs/records-followup-U13.md:44`: the U11 row's `17 claims graded, 16 repaired` to the
   sixteen and fifteen the paragraph below it states, scoped to match.
2. `:15`: a commit count that does not go stale on its own commit, per P2-2.

Both are in one file and can land as one commit. Neither needs a gate re-run beyond the five, since
nothing outside `.sdlc/` moves.

---

# Pass 3, re-check at `bb896a4e`

> **Model-independence label, owner ruling R17, unchanged.** Opus at high effort standing in for a
> fable reviewer seat; the Verifier who grades next shares the model family. Opus checking opus.

Head `bb896a4e`, parent `66ea6b74`. Scope as dispatched: P2-1, P2-2, the `22 of 123` reword, and that
the commit touched nothing else.

## Verdict

🟢 **PASS.**

| item | state | evidence |
|---|---|---|
| one file only | 🟢 | `git show --stat bb896a4e`: `.sdlc/handoffs/records-followup-U13.md`, 5 insertions, 3 deletions. Roadmap blob still `b3825864f7a7c0219d946ac1131892e901f79a1b` |
| P2-1, `:44` | 🟢 repaired | the U11 row carries no count and points at the rule paragraph below it. The retired 17 and 16 now appear nowhere except the paragraph's own statement that an earlier draft used them |
| P2-2, `:15` | 🟢 repaired | the sentence describes the commits instead of counting them and names `git log --oneline ee854932..HEAD`. Its claim that every commit past `ee854932` touches exactly one file holds at this head: all nine do, measured per commit with `git show --name-only` |
| `22 of 123` reword | 🟢 attribution, not a new claim | the cell now reads `22, of the 123 claims the census's leg 5 prose reports following`. Census `:210` reads `123 claims followed, 94 hold, 22 fail`. Naming the prose is accurate and fits F5, since the census's totals table says 122 |

## Note, not blocking

`:44`'s repaired-here cell now reads `A14 first, then C1 to C12 and the A16 sharpening`. The original A16
repair, made with A14 in `75d3917b`, is no longer named in that cell. The U11 record's own Correction
table carries the A16 row, so nothing is lost, but a reader of this cell alone could conclude A16 was
only sharpened. It is worth a word if the file is touched again.

## Gates

This commit changes one `.sdlc/` handoff and nothing under test. I did not re-run `npm test` or the
baseline check here: pass 2 ran both green at `66ea6b74`, and this commit differs from that tree only in
this record. I did re-run the gates this edit could move, at `bb896a4e` in the unit worktree:
`node test/repo/branding.mjs` gives `branding: clean (510 files scanned)`, exit `0`. `0` em dashes added over
`ee854932..bb896a4e` in `.sdlc`, and `git status --short` returns `0` lines.

## Pass 4, re-check of pass 2 at `c442826b`

> Model-independence label, owner ruling R17. Opus at high effort standing in for a fable reviewer
> seat. The builder of this pass was opus at xhigh, one effort step above this review, and the
> Verifier who grades next is also opus. The cross-model independence a reviewer grade normally buys
> is not present here.

Head `c442826b`, pass 1 ended at `bb896a4e`. Line numbers are `:N` at `c442826b` in
`.sdlc/handoffs/records-followup-U11.md` unless marked `bb:N`, which is `bb896a4e`.

### Verdict

🔴 FIX-FIRST, on one claim. Pass 2's method is sound and every site it lists is repaired and true
under reachability. But one claim pass 2 restated at `:35` and `:428-442`, whether the live-facts
rule exempts `#722`, is still stated the other way at `:501` and, in general form, at `:169`. That is
V8's shape again: the pass 2 search for C15 was keyed on the row label (`U5-4|#723|alone failed`),
not on the claim's content, so it could not return a site that says `#722` and `note`.

| item | state | one line |
|---|---|---|
| 1. per-claim search, independent terms | 🔴 | two sites of the `#722` exemption claim unreached: `:501`, `:169` |
| 2. newly found sites against sources | 🟢 | C3, C13, C14, C15 each re-derived by reachability; all hold |
| 3. true clauses, false conclusion | 🔴 | the coverage sentence at the end of the U11 pass 2 table is true and implies more than it covers; same root as item 1 |
| 4. roadmap blob, one file per commit | 🟢 | blob `b3825864` at `ee854932` and `c442826b`; `dc77acb4` touches the U11 handoff alone, `c442826b` the U13 handoff alone |
| 5. gates at `c442826b` | 🟢 | all green, below |

### Findings, hardest first

#### 🔴 R4-1. The `#722` exemption claim is stated both ways

Pass 2 wrote at `:35` `The #722 half holds: ranked at row 14, and the exemption was anchored on the
wrong commit in pass 1 and does not apply`, and kept `:435-436` `the exemption does not apply, so
#722 is ranked at row 14`. The same file says:

| site | text | written at | true at `698e8916`? |
|---|---|---|---|
| `:501` (`bb:494`) | `#722`: `The Orchestrator has ruled no refresh: the rule makes it a note` | `b0003592`, 15:41:35-07:00, before `66d40f70` ranked `#722` | no. At `698e8916` the roadmap ranks `#722` (`grep -c '^\| 14 \| #722 '` prints `1`), its row 42 reads `the live-facts rule does not exempt it and U11 ranks it rather than noting it`, and `:435` says the exemption does not apply |
| `:169` (`bb:165`) | `an issue opened after 3ee3c72b is the live-facts rule's case, a note for the verifier` | `7b84d698`, 15:30:38-07:00 | no. `:430` calls `3ee3c72b` the wrong anchor, and `#722`, opened `22:12:36Z`, after `3ee3c72b` at `21:59:23Z`, was not a note. The sentence reports the roadmap's own R4 line (`698e8916:.sdlc/roadmap.md:116`, `An issue opened after this commit is the live-facts rule's case`), which contradicts that roadmap's row 42. The roadmap side is U14's under R18; the handoff states it in its own voice without saying so |

Neither site is census-listed and neither has a hunk in `git diff -U0 bb896a4e c442826b`. Both
predate U13: U11's `66d40f70` fixed `:35` and `:424-436` and left these two, which is how the claim
came to be split. They are in pass 2's reach because pass 2 re-asserted the claim at `:35` and C15's
`Is` cell says it keeps the `#722` half. Under re-diagnosis §8.1 step 3, a site may stay only if
the file stays self-consistent without it, and it does not.

Repair, per claim: search the content (`#722|note for the verifier|makes it a note|live-facts rule's
case|opened after`), edit `:501` to say the rule does not exempt `#722` and it is ranked (the
no-refresh ruling can stay), date `:169` as the roadmap's pass-1 anchor that `:430` retires, and add
both to C15's hits cell, or a C16 row.

#### 🔴 R4-2. The coverage sentence is true in every clause and implies a completeness it lacks

The U11 pass 2 section closes, and the U13 handoff's Pass 2 section repeats, that coverage is
`every claim in this table, repaired at every hit its search returns`. That is true: every hits cell
reproduces (I re-ran all sixteen patterns at `bb896a4e` by script and each matched its cell), and every
edited hit has a hunk. But the search patterns are the builder's, and C15's does not match the claim
it names. So the sentence certifies the pattern, not the claim. It is the §1 fault §8 named, one
level in: the record checked against its own search terms. Fixing R4-1 fixes the instance; the
sentence would hold better if each pattern were stated as the claim's content, not its row label.

#### 🟢 Low, not blocking

| site | note |
|---|---|
| `:12` | front matter says pass 1's U5-4 🔴 was `fixed at 66d40f70`; true of the `#722` half, but a front-matter reader concludes U5-4 is clear while `:35` has it 🟡. A clause naming `#723` would close it |
| `:30`, `:527` | `leg B's strip widened` sits beside `:367` `re-aimed, not narrowed` and `neither contains the other`. `Widened` is `1405ee77`'s word and a reader can take it as a superset. `re-aimed` would match the file |
| `:426` | `revision 15's case` names a plan revision not reachable from `698e8916` (`0a0f0034` is on main only; the reachable plan stops at 13). The content is true. C14 now names refs for exactly this shape at `:6`; this site does not |
| `:34`, `:403` | `the fix head`, unnamed, the C6 shape. Pass 2 marks it a different measurement, which is its stated reason under step 3; naming the sha would be cheaper than the reason |

### Newly found sites, re-derived by reachability

| claim | check | result |
|---|---|---|
| C3 | `git log main -S'11 🟢 1 🟡 0 🔴' -- .sdlc/board.md` | `428f81ad`, `34173dd6`; `--is-ancestor` exits `1` for both against `698e8916`, and also against `plan/records-followup-roadmap`, `bb896a4e`, `c442826b`, so `:495`'s `this branch's own board never carried it` holds at every one |
| C3 | `git log -1 --format=%h 698e8916 -- .sdlc/board.md`; its U5 row | `850f7fb1`; `⚪`, `not dispatched`; `grep -c '11 🟢'` `0`. `428f81ad`'s U5 row still `🟢` with `verdict 🟡 overall`, as `:135-136` says |
| C13 | `git show --stat --format=` on `1405ee77`, `b0003592`; parent of `b0003592` | roadmap alone; U11 handoff alone; `1405ee77`. The strip regex change is in `git diff 7b84d698 b0003592`, and `1405ee77`'s message reads `widened in the same change` |
| C14 | `-S'plan-revision: 17'` on the handoff at `698e8916`; `-S'revision 17,'`, `19,`, `13,` on main's plan | `7b84d698`; `7b59a29b` (exit `1`), `13f46583` (exit `1`), `850f7fb1` (exit `0`). Highest revision in the plan at `698e8916` is 13. `7b59a29b` at 15:24:31 precedes `7b84d698` at 15:30:38, so `naming main's plan` was possible when written |
| C15 | `gh issue view 723 --json createdAt`; `git blame` at `bb896a4e` on `bb:35`, `bb:424`, `bb:435` | `2026-09-20T23:24:11Z`; all three `5cac5623` at 16:04:32-07:00, 19 min 39 s before `#723`; `ddfedb70` 16:05:13 is the unit's latest commit before `698e8916`, so `:441` holds |
| C6, `:291-293` | main commits touching the plan or `.sdlc/verdicts/` between 15:55 and 16:10 -07:00 | `428f81ad` alone, which added the U11 verdict, so `went stale at 428f81ad` holds. The wall-clock gap there is about `origin/main` moving, where wall clock is the right measure |
| diff coverage | old-side hunk ranges of `git diff -U0 bb896a4e c442826b` | hunks at 6, 30, 35, 129-134, 172-173, 424, 435, 488, 498-499, 507 reach all eleven listed hits. V8 control reproduces: `ee854932..bb896a4e` new-side ranges contain 129 and not 488. `git diff -U0 ee854932 c442826b` has `24` hunks |

### Gates at `c442826b`, run by me in `.worktrees/rf-U13`

| gate | result |
|---|---|
| `npm test` | foreground, output to a log, exit read from `$?`: `0`; `✓ all 48 test files passed`; `git status --short` `0` after; no `node_modules`. Load average about 19 |
| `node test/repo/branding.mjs` | `branding: clean (510 files scanned)`, exit `0`, read directly |
| paths outside `.sdlc/` | `0` from `BASE` `1f991877` and `0` from `ee854932` |
| em dashes added, `ee854932..c442826b` in `.sdlc` | `0` stripped, `0` raw |
| `sh .sdlc/checks/baseline-agrees-check.sh` | seven `ok`, one `note  head:`, one `ok    head:`, `stale total: 0`, exit `0` |
| roadmap | blob `b3825864f7a7c0219d946ac1131892e901f79a1b` at both `ee854932` and `c442826b` |
| commits since `bb896a4e` | `dc77acb4` `.sdlc/handoffs/records-followup-U11.md`; `c442826b` `.sdlc/handoffs/records-followup-U13.md`. One file each |

### What must change before this lands

1. Repair `:501` and `:169` of the U11 handoff per R4-1, and add them to C15's row or a new row with
   a pattern that searches the claim's content.
2. Re-run the hunk check with those two lines added to the edited-hit list.

### Addendum: claims in the U11 handoff that rest on `428f81ad` or `34173dd6`

Asked for after the Verifier's C6 finding. The list is derived independently of the builder, at
`c442826b`, line numbers `:N` there. Neither commit is reachable from `698e8916` (both
`--is-ancestor` exit `1`). `428f81ad` is the first commit to add `.sdlc/verdicts/records-followup-U11.md`
(`--diff-filter=A` returns it alone, and `git cat-file -e 698e8916:` on that path fails), so every
claim that cites the U11 verdict's content rests on it too, even where the sha is not written.
No main commit touches `.sdlc/verdicts/` between `428f81ad` and `698e8916`, so an `origin/main`
read of that directory made while this record was written reads `428f81ad`'s tree.

| site | claim | rests on | how |
|---|---|---|---|
| `:129-137` | main's board carried the U5 contradiction from `34173dd6` until `428f81ad` rewrote the cell | both, by name | C3 pass 2. States unreachability explicitly; I re-derived it true |
| `:495` | the same, in the `For the Orchestrator` row | both, by name | C3 pass 2; true, points at `:129` |
| `:516` | C3's Correction row | both, by name | true as a record of the repair |
| `:290-293` | the leg's `origin/main` line `went stale six minutes after the run, at 428f81ad ... 19 minutes 30 seconds before this handoff's last commit and was never re-measured here` | `428f81ad`, by name, with wall-clock ordering against `698e8916` | the Verifier's C6 finding. Earlier in time than `698e8916` does not make it visible from `698e8916`; the sentence places a main-only event on this record's timeline by clock, the pass 1 C3 fault |
| `:519` | C6's Correction row, same `6 minutes after ... 19 minutes 30 seconds before this handoff's last commit` | `428f81ad`, by name | as above, second site of the same claim |
| `:496` | the stray verifier file `reached main at 428f81ad` | `428f81ad`, by name | true on main, stated as main's. It is used to bound an unordered pair of worktree reads, so check it does not imply the file was visible to `698e8916` |
| `:525` | C12's Correction row repeats `:496` | `428f81ad`, by name | as `:496` |
| `:191` | `re-derived at origin/main 38 of the 55 files under .sdlc/verdicts/ carry no verdict: field` | `428f81ad`, unnamed | written at `698e8916` (blame). `.sdlc/verdicts/` has 55 `.md` files at `428f81ad`, 54 at `428f81ad^`, 52 at `698e8916`. The 55 is `428f81ad`'s tree read through a moving ref and not named |
| `:12` | front matter `verdict: .sdlc/verdicts/records-followup-U11.md pass 1 (... fixed at 66d40f70)` | `428f81ad`, unnamed | the cited file does not exist at `698e8916`; it names no ref, unlike `:11`, which names `main @ 5c6a0c13` |
| `:120-121` | `The verdict caught it.` | the U11 verdict file, so `428f81ad` | uncited; the verdict it names is not reachable |
| `:271-273` | `That is the defect the U11 verdict found in pass 1` | the U11 verdict file, so `428f81ad` | uncited, same |
| `:343` | NC7's state cell, `the verdict's R3` | the U11 verdict file, so `428f81ad` | uncited, same |
| `:472` | Scope: `66d40f70` (`the verdict's R3 pass 2 and U5-4`) | the U11 verdict file, so `428f81ad` | uncited, same |
| `:494` | `certified the verdict's R3 rather than catching it` | the U11 verdict file, so `428f81ad` | uncited, same |

The first seven name a sha. The last seven name none: that is the #723 blind spot the §8.2
re-diagnosis described. They are claims about the record's own history whose source reached main
at `428f81ad` and is not reachable from `698e8916`. The first two groups need a repair or a stated
reason. For the verdict-citing group, one front-matter or Correction line naming `428f81ad` as where
the U11 verdict lives, and saying it is not reachable from `698e8916`, would cover all six if the
builder states it once and references it. Checked against `c442826b` only; the head is moving.

## Pass 5, re-check at `294f7937`

> Model-independence label, owner ruling R17. Opus at high effort standing in for a fable reviewer
> seat. The builder was opus at xhigh, and the Verifier who grades next is also opus. No cross-model
> independence.

Head `294f7937`: `1249ec77` touches the U11 handoff alone, `294f7937` the U13 handoff alone.
Checked against my own Pass 4 lists, not the builder's. Line numbers are `:N` at `294f7937` in
`.sdlc/handoffs/records-followup-U11.md`, with the `c442826b` number beside where it moved.

### Verdict

🔴 FIX-FIRST. The dependency sweep is correct in everything it touches, and R3's `eight` is right.
But neither Pass 4 blocker has a hunk in `git diff -U0 c442826b 294f7937`, and neither do the four low
notes or the six verdict-citing sites.

| item | state | evidence |
|---|---|---|
| `:518` (was `:501`), `#722`: `the rule makes it a note` | 🔴 open | text unchanged at `294f7937`; still contradicts `:35` and the ranked row 14 |
| `:180` (was `:169`), `an issue opened after 3ee3c72b is the live-facts rule's case, a note` | 🔴 open | unchanged; still the anchor the reruns section calls wrong |
| C6, `:302-310` and `:537` | 🟢 repaired | reflog holds `origin/main` at `b8c3be8f` from `15:50:52` to `16:08:45`, which covers `66d40f70` (16:02:56) and `5cac5623` (16:04:32). At `b8c3be8f` the plan has 11 rows, 10 `[x]`, U11 `[~]`, no U11 verdict: the leg line's figures reproduce. The `went stale ... before this handoff's last commit` claim is retired |
| C12, `:513` and `:543` | 🟢 repaired | now says `428f81ad` is unreachable from `698e8916` and orders nothing |
| C3, `:129-137`, `:495`, `:516` | 🟢 unchanged, still true | as Pass 4 |
| `:191` → `:202-204`, `38 of the 55` | 🟢 anchored | reflog puts `origin/main` at `13f46583` (16:23:55) when `698e8916` (16:28:12) committed it; 55 `.md` files there, which include `428f81ad`'s |
| R3 `other seven` → `other eight`, `:135` | 🟢 verified | at `b8c3be8f` the ten merged units are U1 to U10: U5 `verdict: 🟡`, U8 `green-with-one-note`, and U1, U2, U3, U4, U6, U7, U9, U10 🟢, which is eight. Seven did not sum to nine; eight plus U8 does |
| R1, `:40-48`, reflog for `plan/gate-split` | 🟢 holds | `plan/gate-split@{2026-09-20 14:36:16 -0700}` resolves to `7d811172`, held from `14:35:09` to `14:40:03`. `9276d4f0` changes U6b's checklist text and adds a U6-10 row and a revision log row. The sentence omits the revision row; no fact below it changes |
| R3 `origin/main` reads `:123-126` | 🟢 holds | `7b59a29b` at `24620ec9`'s time (15:25:08) and `b8c3be8f` at `5cac5623`'s. At `7b59a29b`, 11 rows and 10 `[x]` |
| verdict-citing sites `:12`, `:131`, `:283`, `:360`, `:489`, `:511` | 🟡 open | none names where the U11 verdict lives. The pass 3 table says it does not cover claims with no sha or ref, so this is stated, not hidden, but it is my list and it is unreached |
| low `:12` U5-4 `fixed` | 🟡 open | unchanged |
| low `:30`, `:545` `widened` | 🟡 open | unchanged |
| low `:443` (was `:426`) `revision 15` | 🟡 open | unchanged; pass 3's table lists `0a0f0034` as `already` handled by C14, but `:443` itself names no ref |
| low `:34`, `:420` `fix head` | 🟡 open | unchanged |

### A note on the worktree

`.worktrees/rf-U13` was not clean while I checked it. After my `npm test` run `git status --short`
printed ` M .sdlc/handoffs/records-followup-U11.md`: 75 insertions and 18 deletions, uncommitted, file
mtime `23:53:45`. That is the builder editing the next pass in place, and the draft touches `:12`,
`:30`, `:34` and `:131`. I graded the commit, not the draft. Two consequences:

| gate at `294f7937` | result | caveat |
|---|---|---|
| `npm test` | exit `0` from `$?`, `✓ all 48 test files passed` | ran on a tree whose only difference from the commit is that `.sdlc/` draft; no test reads that file |
| `node test/repo/branding.mjs` | `branding: clean (510 files scanned)`, exit `0` | it scans `.sdlc/`, so it read the draft, not the committed file. A clean-tree rerun from an archive was denied by the permission layer, so it was not repeated |
| paths outside `.sdlc/` | `0` from `1f991877` and from `ee854932` | committed diff |
| em dashes added | `0` over `git diff -U0 ee854932 294f7937 -- .sdlc` | committed diff |
| baseline check | `stale total: 0`, exit `0` read unpiped | |
| roadmap | blob `b3825864f7a7c0219d946ac1131892e901f79a1b` | |

A gate run in a tree another seat is editing breaks `.sdlc/adapter.md` §1. The Verifier should
rerun the branding gate on the committed head once the builder's edit lands.

### What must change before this lands

1. `:518` and `:180`, per Pass 4 R4-1. These are the only 🔴s.
2. The 🟡s above, or a line saying why each stays.

## Pass 6, re-check at `acba1bdf`

> Model-independence label, owner ruling R17. Opus at high effort standing in for a fable reviewer
> seat. The builder was opus at xhigh, and the Verifier who grades next is also opus. No cross-model
> independence.

Head `acba1bdf`: `29ddb174` touches the U11 handoff alone, `acba1bdf` the U13 handoff alone. Line
numbers are `:N` at `acba1bdf` in `.sdlc/handoffs/records-followup-U11.md`. Checked against my own
Pass 4 and Pass 5 lists.

### Verdict

🟢 PASS at `acba1bdf`. Both blockers are repaired and true, all four low notes are taken, and all six
verdict-citing sites now point to one front-matter statement of where the U11 verdict lives.

The branch has moved past this grade. While my gates ran, `3bd3982c` (23:58:13) and `55672d46`
(23:58:28) landed on `unit/rf-U13`. `git diff --stat acba1bdf 55672d46` shows 19 lines added to the
U11 handoff and 30 changed in the U13 handoff. I have not reviewed them, and this PASS does not
cover them.

| item | state | evidence |
|---|---|---|
| `:526` (was `:518`), `#722` row | 🟢 | now `the live-facts rule does not exempt it ... 66d40f70 ranked it at row 14`, and the no-refresh ruling is kept. It agrees with `:35`, `:460` and the roadmap's row 14 at `698e8916` |
| `:179-184` (was `:180`), the `3ee3c72b` anchor | 🟢 | attributed to `698e8916:.sdlc/roadmap.md`, where `grep -c "live-facts rule's case"` prints `1`, and named as contradicting that roadmap's row 14, with the roadmap side left to U14 under R18 |
| my content search, `a note\|noted\|exempt\|live-facts\|opened after\|created after` over the body | 🟢 | the rest of the hits are the `cited:` strip's exempt sets (`:298-415`) or the U5-4 section, which is consistent. No statement of the `#722` exemption is left pointing the other way |
| verdict-citing sites `:12`, `:131`, `:287`, `:364`, `:497`, `:519` | 🟢 | `:12` states the file is on main from `428f81ad`, first added there, and not reachable from `698e8916`. The other five name the U11 verdict and point to the front matter |
| low `:12`, U5-4 `fixed` | 🟢 | now `fixed at 66d40f70 for #722; U5-4 is 🟡 at 698e8916 for #723` |
| low `:30`, `:553`, `widened` | 🟢 | `re-aimed` at both sites |
| low `:450-451` (was `:443`), revision 15 | 🟢 | names main's `0a0f0034` and says it is unreachable |
| low `:34`, `:424-427`, `fix head` | 🟢 | blame at `698e8916` confirms it: rows U5-1, 2, 3, 5 and 7 at `24620ec9` (15:25:08), when the last roadmap commit was `1fe53f5a` (15:16:57); U5-6 at `7b84d698`; U5-4 at `5cac5623`; U5-8 at `698e8916` |
| `:207-208`, `38 of the 55` tree | 🟢 | 38 of 55 without a `verdict:` line at `428f81ad`, and 37 of 52 at `698e8916`, by my own count |
| C3, C6, C12 | 🟢 | unchanged since Pass 5 |

### Low, not blocking

| site | note |
|---|---|
| `:426` | `U5-4 at 5cac5623` is true as history at `698e8916`. The row's text today is U13's C10 wording, which the sentence does not mention |
| R1, `:40-48` | my Pass 5 note stands: `9276d4f0` also adds a revision log row, which the sentence omits. No fact changes. `3bd3982c` touches this handoff and may address it; not checked |

### Gates

| gate | at | result |
|---|---|---|
| `node test/repo/branding.mjs` | `acba1bdf`, tree clean before and after (`git status --short` `0`) | `branding: clean (510 files scanned)`, exit `0` |
| `npm test` | started at `acba1bdf`. Head moved to `55672d46` mid-run by `.sdlc/`-only commits, which no test reads | exit `0` from `$?`, `✓ all 48 test files passed`, `git status --short` `0` after |
| paths outside `.sdlc/` | `ee854932..acba1bdf`, and `1f991877` or `ee854932` to `55672d46` | `0` in each |
| em dashes added | `ee854932..acba1bdf` in `.sdlc` | `0` |
| baseline check | worktree HEAD `55672d46` | exit `0`, read unpiped |
| roadmap | `acba1bdf` and `55672d46` | blob `b3825864f7a7c0219d946ac1131892e901f79a1b` |
| one file per commit | `29ddb174`, `acba1bdf` | U11 handoff alone; U13 handoff alone |

## Pass 7, the two commits after `acba1bdf`, head `55672d46`

> Model-independence label, owner ruling R17. Opus at high effort standing in for a fable reviewer
> seat. The builder was opus at xhigh, and the Verifier who grades next is also opus. No cross-model
> independence.

Scope as dispatched: `3bd3982c`, which touches the U11 handoff alone and adds `### Pass 5, the reflog
as witness`, and `55672d46`, which touches the U13 handoff alone and adds `## Review items by name`.
Everything else in Pass 6 stands.

### Verdict

🟢 PASS at `55672d46`, with two 🟡 notes on the witness that change no figure.

### The reflog witness against the Verifier's four conditions

| condition | state | evidence |
|---|---|---|
| entries verbatim | 🟢 | I pulled the ten quoted entries from the section and matched each as a whole line (`grep -xF`) against `git reflog show --date=iso` for `origin/main` and `plan/gate-split`, read myself: `10` match, `0` miss. Each `then` or `the next` pair is adjacent in the reflog |
| read from this repo | 🟢 | `git rev-parse --git-common-dir` prints `.git` in the root checkout and `/Users/kimba/Projects/nonoun/ultimate-tokens/.git` in `.worktrees/rf-U13`, so both use one reflog. My own reads came from the root checkout |
| window bounded by commits | 🟢 leg line, `38 of the 55`, R1; 🟡 R3 | leg line: the run read `66d40f70` (16:02:56) and was recorded at `5cac5623` (16:04:32), both inside `b8c3be8f` 15:50:52 to 16:08:45, so the read itself is bounded. `38 of the 55`: every `origin/main` position from `428f81ad` to `49077c67` gives 38 of 55 by my count, so read time does not matter. R1: `7dde8cb1` at 14:36:16 is inside `7d811172` 14:35:09 to 14:40:03. R3: see 🟡 1 |
| shown to discriminate | 🟢 | R3 outside: `62a21128` has 10 checklist rows and 9 `[x]`, against 11 and 10 at `7b59a29b` and `b8c3be8f`. `38 of the 55` outside: `7b59a29b` gives 37 of 53. R1 outside: at `ebddc55d` the U2 to U5 board rows read ⚪ `not dispatched`, and at `7d811172` 🔵 with builder seats. Leg line: at `428f81ad` the loop's U11 verdict file exists, so `ungraded` falls to `0`; see 🟡 2 |

### 🟡 Notes, not blocking

1. R3's first window is bounded by the recording commit, not the read. `:125` says `origin/main`
   is `7b59a29b` at the commit time of `24620ec9` (15:25:08). That is true. But `24620ec9`'s author
   time is 15:24:32, one second before `7b59a29b` reached `origin/main` (15:24:33). So the reads it
   records were almost certainly made at `0e777d44` (15:12:27), the entry before. The figures do not
   change: `0e777d44` also has 11 rows and 10 `[x]`, and it is the first position with 11 rows
   (`e710fe17` and earlier have 10). So the witness should cite `0e777d44` to `db718c18` as the
   window, or say the read preceded the commit. This is the true-clause, wrong-implication shape
   again, with a harmless conclusion.
2. The discriminating run at `428f81ad` quotes a green that is not a grade. `green=10` there
   counts U11 as green because the loop's `case` tests 🟢 before 🔴, and U11's pass-1 headline is
   `# Verdict records-followup U11 · 🔴 9 🟢, 1 🟡, 2 🔴`. The run does discriminate, since the output
   differs. But a reader of `green=10 ... because U11's verdict first exists there` can conclude U11
   was graded green. One clause saying the leg reads that 🔴 headline as green, a limit of the
   retired leg, would close it.

### The by-name answers in the U13 handoff

| row | state |
|---|---|
| blocking `:501`, `:169` | 🟢 matches Pass 6 |
| four low notes | 🟢 matches Pass 6 |
| the six verdict sites | 🟢 matches Pass 6. The added sentence, that the file is a git object so reachability decides, is a framing, not a new fact |
| the 14-site addendum | 🟢 matches the U11 record's `### Pass 4`, which Pass 6 read |
| the reflog conditions | 🟢 new in this commit. Verified above, with the two 🟡 notes. The negative control it cites (one second changed in a copy reports `1 not verbatim`) is theirs, not reproduced; my own whole-line match covers the same ground |
| `Refused: none` | 🟢 |

No row claims anything Pass 6 did not verify, apart from the reflog row, which this pass verifies.

### Gates at `55672d46`

| gate | result |
|---|---|
| `node test/repo/branding.mjs` | `branding: clean (510 files scanned)`, exit `0`, tree clean before and after, HEAD `55672d46` |
| em dashes added | `0` over `ee854932..55672d46` in `.sdlc`, `0` over `acba1bdf..55672d46` |
| paths outside `.sdlc/` | `0` from `ee854932` |
| one file per commit | `3bd3982c` U11 handoff alone, `55672d46` U13 handoff alone |
| roadmap | blob `b3825864f7a7c0219d946ac1131892e901f79a1b` |
