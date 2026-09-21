---
kind: handoff
plan: records-followup
unit: U13
ticket: "#709"
branch: unit/rf-U13
base: ee854932e2b03da92c17f666a63c60a5d3fc89b5
seat: builder
written: 2026-09-20
scope: three handoff records; `.sdlc/roadmap.md` is untouched under owner ruling R18
---

# U13, the citation repairs in the three handoff records

Every commit on this branch past `ee854932` touches exactly one file: the repair commits tabled
below, the commit that adds this record, and the commits that answer this unit's reviews and its verdict. They are
described rather than counted here because each review fix adds one, and a count in this sentence
went stale with every fix; `git log --oneline ee854932..HEAD` gives the current list. Under owner ruling R18 the roadmap is rebuilt rather
than repaired, so the four roadmap-only commits this unit had made were dropped and `.sdlc/roadmap.md`
comes out of this branch byte for byte as it entered: `git diff ee854932 HEAD -- .sdlc/roadmap.md`
prints nothing and `git rev-parse HEAD:.sdlc/roadmap.md` equals `git rev-parse
ee854932:.sdlc/roadmap.md` at `b3825864f7a7c0219d946ac1131892e901f79a1b`, the same blob object.

| sha | file | rows |
|---|---|---|
| `b6cfe922` | `.sdlc/handoffs/records-followup-U5.md` | A3 |
| `75d3917b` | `.sdlc/handoffs/records-followup-U11.md` | A14 first pass, A16 |
| `9fe1e3b0` | `.sdlc/handoffs/records-followup-U12.md` | A17 |
| `f204e587` | `.sdlc/handoffs/records-followup-U11.md` | A14 re-derived at the record's own commit |
| `92d31d83` | `.sdlc/handoffs/records-followup-U11.md` | the census leg 5 rows, C1 to C12 and the A16 sharpening |
| `dc77acb4` | `.sdlc/handoffs/records-followup-U11.md` | pass 2 after verdict V8 and V9: C3 at both of its sites, C13 to C15, and the per-claim table |

## The anchor rule, which this unit exists to demonstrate as much as to apply

Every claim below is graded at the commit the record carrying it was written at, never at a branch
head. That rule cost this unit two wrong repairs before it was adopted, both recorded here rather
than quietly fixed. It has a second half, found in this unit and now carried in the U11 record: a
commit that is earlier in wall-clock time is not thereby reachable from the record's own commit, and
reachability is the test. `git merge-base --is-ancestor` answers it; comparing two timestamps does not.

## What was repaired, by record

| record | 🔴 in the census | repaired here | graded at |
|---|---|---|---|
| `records-followup-U5.md` | 1 of 10 claims followed | A3, the `standing ruling R4` attribution | `HEAD` and `main`, where the cited section resolves at both |
| `records-followup-U12.md` | 1 of its share of 60 | A17, `eight spans` against a measured 11 | `712e63db ee854932^2`, the range the claim itself names |
| `records-followup-U11.md` | 22, of the 123 claims the census's leg 5 prose reports following | A14 first, then C1 to C12 and the A16 sharpening in one pass, graded under the claim rule in the paragraph below; then pass 2, C3 extended and C13 to C15, per claim | `698e8916`, the file's own last commit |

Sixteen claims graded in the leg 5 pass, fifteen repaired and one re-derived and held, under the rule
the U11 record now states: one claim is one figure or one sentence a single command returns, which
expands the thirteen rows of that Correction table to sixteen because C1 carries four figures. An
earlier draft of both records said seventeen and sixteen under no stated rule. Against the census's
twenty-two the honest position is that neither total reconstructs from its own enumeration, the
census's `Stale before its own last commit, 12` bucket naming ten sites. An earlier draft of this
paragraph went on to say that what carries is the map from each line-site the census names to the row
that repairs it, which the U13 reviewer checked independently. The map was complete and the use made
of it was false: C3's row covered both of its claim's sites and its edit reached one, so at `bb896a4e`
the U11 record contradicted itself. The coverage this unit claims is the narrower one in the pass 2
section below.

## The three rows worth reading before the rest

| row | why it matters | Evidence | Negative control |
|---|---|---|---|
| A14 | the first repair of it was graded at the branch head and replaced a correct front matter with seven shas measured on the wrong clock; the second re-derives at `698e8916` and restores the four | `git log --format=%H 3ee3c72b..698e8916` counts 11, with `-- .sdlc/roadmap.md` counts 4, with `-- .sdlc/handoffs/records-followup-U11.md` counts 7, and 4 and 7 partition the 11 | the same commands from `1f991877` count 15 and 6, the four extra being U5's; at the branch head `28426bf7` they count 14 and 7, which is the clock that produced the wrong repair |
| C7 | the retired claim and its correction sit in two different commits, and the record credited the one that repeats the claim | `git log -S'strictly narrower' -- .sdlc/handoffs/records-followup-U11.md` returns `b0003592` as the commit that wrote the phrase and `089e0e44` as the one that removed it | `git log -1 --format=%B b0003592` contains `The new strip is strictly narrower`, so the commit the sentence credited repeats the retired claim rather than correcting it |
| C5 | a description of a diff that is true under one flag and false under the one the record itself names | the R4 table states `--unified=0`, where the hunk carries no context lines and `Count:` appears only as git's `@@` section heading, 14 lines from the insertion point | a `--unified=3` read of the same commit does print `Count:` as a context line, which is how the wrong description was arrived at, so the flag the table names is what tells the two readings apart |

## One claim deliberately left unrepaired

C12. The U11 record reported `git status --short` printing `1` for the stray verifier file while its
own P1 gate row reports `0` for the same command in the same worktree. The two cannot describe one
instant. `.worktrees/rf-U11` was removed, neither read carries a timestamp, and nothing in git
preserves a working tree's state after the fact, so no measurement orders them. The row is put in the
past tense and says exactly that, with the one recoverable fact beside it: the verifier's file reached
main at `428f81ad`, `2026-09-20T16:08:42-07:00`. A stronger claim in either direction would be
unsupportable, which is the same structural limit the census recorded for uncommitted-path counts.

## Two findings this unit produced, both already routed

| finding | where it is |
|---|---|
| a repair whose every clause is true can still make a record worse, when the true clauses imply a false conclusion, and per-clause checking passes it | the owner question `.sdlc/questions/records-followup-repair-or-rebuild.md`. It came from A11, where naming the file a ruling is written in, and observing that the standing-rulings file has no `R5` heading, were both true and together implied a withdrawn finding |
| earlier in wall-clock time is not reachable from here | the A16 sentence and Correction row in the U11 record, stated where a later reader meets it |

## Pass 2, after verdict V8 and V9

V8 was a unit-of-repair fault, not a slip. The census counted one claim stated at two sites, C3's
edit counted sites, and the review counted rows, so each count was complete and none saw the others.
Pass 2 repairs per claim: every claim this unit repaired in the U11 handoff was searched over the
whole file at `bb896a4e`, every hit was edited or stated to be a different claim, and coverage is
read from the diff. The per-claim table, with each search pattern and every hit, is `### Pass 2, per
claim rather than per site` at the end of that record's Correction section, where a reader of the
repaired lines meets it.

| claim | sites at `bb896a4e` | what pass 2 found | Evidence | Negative control |
|---|---|---|---|---|
| C3, the board | `:129-134` and `:488` | V8's second site, and more: pass 1's C3 said the board was reconciled at `428f81ad` and that at `698e8916` the U5 row reads ⚪. Both clauses are true and the conclusion they imply is false. `428f81ad` is not reachable from `698e8916` and kept the row 🟢 on main; the ⚪ is this branch's own board, last touched at `850f7fb1`, before U5 was built. Both sites now place the claim on main | `git log main -S'11 🟢 1 🟡 0 🔴' -- .sdlc/board.md` returns `428f81ad` and `34173dd6`; `git merge-base --is-ancestor` exits `1` for each against `698e8916`; `git log -1 --format=%h 698e8916 -- .sdlc/board.md` prints `850f7fb1` | `git show 428f81ad^:.sdlc/board.md` prints the 🟢 row with the `11 🟢` notes, and `428f81ad`'s own U5 row still reads 🟢 |
| C13, V9's `:30` | `:30` and `:172-173` | the one-commit claim was also made at `:172-173`, in the R4 section, which neither the census nor the verdict listed. Both sites now name `1405ee77` for the marker and `b0003592` for the strip | `git show --stat --format=` lists `.sdlc/roadmap.md` alone for `1405ee77` and the U11 handoff alone for `b0003592` | `1405ee77`'s message says the strip is widened `in the same change`, which is the wording the record repeated; the file lists separate the two |
| C14, V9's `:6` | `:6` | the value is kept and its sources named, with no revision number chosen: main's revision 17 is `7b59a29b`, the plan reachable from `698e8916` stops at revision 13, and R14 is main's revision 19 at `13f46583` | `git merge-base --is-ancestor` exits `1` for `7b59a29b` and for `13f46583` against `698e8916` | the same test on `850f7fb1`, which wrote revision 13, exits `0` |
| C15, C10's U5-4 grade | `:35`, `:424`, `:435` | C10 put U5-4 at 🟡 at `698e8916` and three other sentences still graded it 🟢 or said `#722 alone failed it`. All three were written at `5cac5623`, 19 minutes 39 seconds before `#723` was created, so they were true when written and false at the commit the file is graded at | `gh issue view 723 --json createdAt` prints `2026-09-20T23:24:11Z`, and `git show 698e8916:.sdlc/roadmap.md \| grep -c '#723'` prints `0` | the same grep for `^\| 14 \| #722 ` prints `1` |

Coverage from the diff. `git diff -U0 bb896a4e HEAD -- .sdlc/handoffs/records-followup-U11.md` has a
hunk whose old-side range contains each of the eleven edited hits, `6`, `30`, `35`, `129`, `130`,
`133`, `173`, `424`, `435`, `488` and `507`, checked by a script that reads every `@@` header and
printed `True` for all eleven. Its control is V8 itself: the same script over `git diff -U0 ee854932
bb896a4e`, reading new-side ranges, prints `True` for `129` and `False` for `488`, so it finds a site
the diff never reached. Every hits cell of the U11 table was re-derived by rerunning its pattern at
`bb896a4e` and matched. Its control: the removed R2 line's pattern, `added or dropped|unranked part`,
returns nothing at `bb896a4e` and `100` and `101` at `ee854932`, so the search finds the claim where
the file still states it, and in the clone a hits cell edited from `463, 465, 503` to `463, 503` makes
the same check print a mismatch for that row and exit `1`. Over the whole unit, `git diff -U0 ee854932 HEAD` on that file has
twenty-four hunks, and outside the Correction section each carries a repair a Correction row records,
or removes the one R2 prose line the pass 2 table names.

What this unit now claims about coverage is that and no more: every claim the U11 record's pass 2
table lists, repaired at every hit its search returns or marked as a different claim. The census is
complete over the claims it cites and not over every claim in the file, so it was the floor of this
repair and not its scope, and nothing here says the U11 record is now correct.

## Gates at the final head

`BASE` = `git merge-base origin/main HEAD` = `1f991877`. Every figure below was measured on the tree
this commit records, with `git status --short` printing `0` immediately after the commit, which is
what ties the runs to it: a record cannot name its own sha, so it names the tree it was measured on
and leaves the sha to the reader's `git log`. This table is pass 2's. The last ancestor the same gates
ran at is `bb896a4e`, where the U13 verdict ran them, and `git diff --name-only bb896a4e HEAD` returns
two paths, this record and `.sdlc/handoffs/records-followup-U11.md`, both under `.sdlc/`. Timing and
load figures are left out: the run that produced them was on the tree before this table's text was
written, and only the tree-independent results below were re-read after the commit.

An earlier draft of this table named `d9667a67`. That commit was left behind when this record was
remade rather than amended forward: it sits on no ref, `git merge-base --is-ancestor d9667a67
0d65d80d` exits non-zero, and no reader could resolve it. The results transferred, the citation did
not, and that is this unit's own reachability rule turned on its own record.

| Gate | Result | How the exit code was read | Negative control |
|---|---|---|---|
| `npm test` | 🟢 `✓ all 48 test files passed`, exit `0`, `git status --short` `0` after | foreground, exit code from `$?` on the next line, never through a pipe or `tail`; output went to a log file read afterwards. No `node_modules` in the worktree | in a throwaway `--shared` clone of this branch: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json` changes `7` occurrences, then `npm test` gives exit `1`, `grep -c FAIL` `3`, `✗ 1/48 test file(s) failed` |
| `node test/repo/branding.mjs` | 🟢 `branding: clean (510 files scanned)`, exit `0` | run once for its tail and once discarding output so `$?` is the node process's own | in the same clone with the decision-records file copied to `.sdlc/verdicts/x.md`: `FAIL: 3 branding violation(s) across 511 files`, exit `1`, a plant inside `.sdlc/` |
| scope wall | 🟢 `0` paths outside `.sdlc/`. Without `grep -v` the path count is `6` from the declared `BASE` `1f991877` and `4` from the unit base `ee854932`, the U5, U11, U12 and U13 handoff records | `git diff --name-only $BASE \| grep -vc '^\.sdlc/'` | a `src/probe.txt` committed in the clone takes the same count from `ee854932` to `1` |
| em dashes added | 🟢 `0` stripped and `0` raw | the plan's P6 pipeline against `ee854932` over `.sdlc`, and the same without the backtick strip | one em dash appended to this handoff in the clone gives `1` |
| `sh .sdlc/checks/baseline-agrees-check.sh` | 🟢 seven `ok` figure and time lines, one `note  head:` line, one `ok    head:` line, `stale total: 0`, exit `0` | exit code read directly from `$?` | with the baseline's test figure bent to 47: `STALE tests: baseline 47, test/run.mjs TESTS 48`, `stale total: 1`, exit `1` |
| the roadmap is untouched | 🟢 `git diff ee854932 HEAD -- .sdlc/roadmap.md` prints nothing, and both sides resolve to blob `b3825864f7a7c0219d946ac1131892e901f79a1b` | the blob ids are compared, not the text | against `backup-rf-U13-preR18`, whose roadmap blob is `15c70ab7`, the same diff prints 76 lines, so the check sees a difference when one is there |
| pass 2 coverage | 🟢 every edited hit has a hunk, and every hits cell of the U11 pass 2 table reproduces | the two scripts in the pass 2 section, each printing per item | the pass 1 diff leaves `488` without a hunk, and a hits cell with one line number dropped exits `1`, as that section records |

`npm run build` and `npm run smoke` are not run: every path this branch changes is under `.sdlc/`,
which `grep -vc '^\.sdlc/'` puts at `0` from either base, and adapter §1 asks for them only when the
build chain or `src/ui/` moves.
