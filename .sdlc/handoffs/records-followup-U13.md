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
below, the commit that adds this record, and the commits that answer this unit's reviews. They are
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
| `records-followup-U11.md` | 22, of the 123 claims the census's leg 5 prose reports following | A14 first, then C1 to C12 and the A16 sharpening in one pass, graded under the claim rule in the paragraph below | `698e8916`, the file's own last commit |

Sixteen claims graded in the leg 5 pass, fifteen repaired and one re-derived and held, under the rule
the U11 record now states: one claim is one figure or one sentence a single command returns, which
expands the thirteen rows of that Correction table to sixteen because C1 carries four figures. An
earlier draft of both records said seventeen and sixteen under no stated rule. Against the census's
twenty-two the honest position is that neither total reconstructs from its own enumeration, the
census's `Stale before its own last commit, 12` bucket naming ten sites, so what carries is the map
from each line-site the census names to the row that repairs it, which the U13 reviewer checked
independently.

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

## Gates at the final head

`BASE` = `git merge-base origin/main HEAD` = `1f991877`. Every figure below was measured on the tree
this commit records, with `git status --short` printing `0` immediately after the commit, which is
what ties the runs to it: a record cannot name its own sha, so it names the tree it was measured on
and leaves the sha to the reader's `git log`. The last ancestor these gates also ran at is
`0d65d80d`, and `git diff --name-only 0d65d80d HEAD` returns two paths, this record and
`.sdlc/handoffs/records-followup-U11.md`, both under `.sdlc/`.

An earlier draft of this table named `d9667a67`. That commit was left behind when this record was
remade rather than amended forward: it sits on no ref, `git merge-base --is-ancestor d9667a67
0d65d80d` exits non-zero, and no reader could resolve it. The results transferred, the citation did
not, and that is this unit's own reachability rule turned on its own record.

| Gate | Result | How the exit code was read | Negative control |
|---|---|---|---|
| `npm test` | 🟢 `✓ all 48 test files passed`, exit `0`, `git status --short` `0` after. 131 s, `06:04:20Z` to `06:06:31Z`, load 20.10 on 10 cores at start, which is not a timing figure | foreground, exit code from `$?` on the next line, never through a pipe or `tail`. No `node_modules` in the worktree | in a throwaway `--shared` clone at this branch's head: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test` gives exit `1`, `grep -c FAIL` `3`, `✗ 1/48 test file(s) failed` |
| `node test/repo/branding.mjs` | 🟢 `branding: clean (510 files scanned)`, exit `0` | run once for its tail and once discarding output so `$?` is the node process's own | in the same clone with the decision-records file copied to `.sdlc/verdicts/x.md`: `FAIL: 3 branding violation(s) across 511 files`, exit `1`, a plant inside `.sdlc/` so the gate is proven to reach this branch's own directory |
| scope wall | 🟢 `0` paths outside `.sdlc/`. The path count the same command returns without `grep -v` is `6` from the declared `BASE` `1f991877` and `4` from the unit base `ee854932`, the four being the U5, U11, U12 and U13 handoff records; three is the number of records repaired, which is not a file count because this record is the fourth file | `git diff --name-only $BASE \| grep -vc '^\.sdlc/'` | an untracked `src/probe.txt` in the clone takes the same count to `1` |
| em dashes added | 🟢 `0` stripped and `0` raw | the plan's P6 pipeline against `ee854932` over `.sdlc`, and the same without the backtick strip | one em dash appended to this handoff in the clone gives `1` |
| `sh .sdlc/checks/baseline-agrees-check.sh` | 🟢 seven `ok` figure and time lines, one `note  head:` line, one `ok    head:` line, `stale total: 0`, exit `0` | exit code read directly from `$?` | with the baseline's test figure bent to 47: `STALE tests: baseline 47, test/run.mjs TESTS 48`, exit `1` |
| the roadmap is untouched | 🟢 `git diff ee854932 HEAD -- .sdlc/roadmap.md` prints nothing, and both sides resolve to blob `b3825864f7a7c0219d946ac1131892e901f79a1b` | the blob ids are compared, not the text | against `backup-rf-U13-preR18`, whose tip is `107d2778` and which carries `eccef435` as an ancestor, the same diff prints 76 lines across the four dropped roadmap commits, so the check can see a difference when one is there |

`npm run build` and `npm run smoke` are not run: every path this branch changes is under `.sdlc/`,
which `grep -vc '^\.sdlc/'` puts at `0` from either base, and adapter §1 asks for them only when the
build chain or `src/ui/` moves.
