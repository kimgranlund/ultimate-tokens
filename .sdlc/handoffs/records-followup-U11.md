---
kind: handoff
plan: records-followup
unit: U11
ticket: "#709"
branch: plan/records-followup-roadmap
unit-branch: unit/rf-U11
base: 1f9918776f0e54e5dfd88c1b23f494f6d6cff6ce
head: 1fe53f5a2e52ced8bd23c6c841cf27d7ca7b3557 (the roadmap commit; this handoff is the second commit)
written: 2026-09-20
---

# U11: the roadmap's assertions, re-derived

Two pre-land reds of PR 2, plus a third the unit's own new criterion found. Everything below was
measured in `.worktrees/rf-U11` at the fix head. `BASE` is `git merge-base origin/main HEAD`.

## Verdict

| Item | State | Note |
|---|---|---|
| R1, the gating claim about #713 | 🟢 | both cells re-derived from `plan/gate-split`'s own checklist, board rows and approval file |
| R2, the header counts | 🟢 | front matter and Count line recomputed from the table; the breakdown now sums to the total |
| R3, this plan's unit tally | 🟢 | found by the new criterion, not by the review; two rows said nine of ten and ten of ten over eleven units |
| The assertions criterion | 🟢 | written, run at the fix head, five negative controls each bite |
| U5-1, U5-2, U5-3, U5-5, U5-6, U5-7 | 🟢 | reran at the fix head |
| U5-4 | 🟡 | one live-facts difference, #722, opened after the roadmap's read instant; no row added |
| P1, P4, P5, P6, P7 | 🟢 | `npm test` green in the foreground, 163.8 s wall |

## R1: the #713 gating claim was false when it was written

The regeneration commit is `7dde8cb1` at `2026-09-20T21:36:16Z`. Every fact below precedes it, so
this is not live drift that arrived later; the cells were wrong on the day they were authored.

Command: `git log --format='%H %cI %s' plan/gate-split`. What it printed, converted from the host's
`-07:00` offset (the commits are local to this machine):

| Commit | Committed | Subject as printed, UTC |
|---|---|---|
| `34ebbae6` | `2026-09-20T18:07:33Z` | `merge U1 into plan/gate-split: the shared sorted corpus sampler and the gate scripts (#713)` |
| `0b02711b` | `2026-09-20T19:28:58Z` | `sdlc(gate-split): owner waives the start gate for U6a too (#713)` |
| `50898d58` | `2026-09-20T19:54:46Z` | `sdlc(gate-split): merge U6a, the sweeps matrix job in CI (#713)` |
| `7852ff12` | `2026-09-20T20:52:48Z` | `sdlc(gate-split): owner waives G0 for U2 to U5 off #681's plan tree (#713)` |
| `7d811172` | `2026-09-20T21:35:09Z` | `sdlc(gate-split): U2 to U5 dispatched off the #681 tree at ebddc55d (#713)` |

Command: `git show plan/gate-split:.sdlc/plans/gate-split.md | grep -nE '^- \['`. It printed seven
checklist rows: `U1` and `U6a` marked `[x]` with their merge shas, `U2`, `U3`, `U4` and `U5` marked
`[~]`, `U6b` marked `[ ]`. So six of seven units are started and two are merged.

Command: `git show plan/gate-split:.sdlc/questions/gate-split-approval.md | tail -25`. Three waiver
effects, quoted from that file one line per span: `Effect: the start gate G0 is waived for U1 only.
U2 onward still wait on #681 landing.`; `Effect: G0 is waived for U1 and U6a. U2 to U5 and U6b still
wait on #681 landing.`; `` Effect: G0 is waived for U2 to U5 as well, when built off `plan/preset-intent-fidelity` @ a2bb3c84 or later; U6b still waits for #681 on main. ``

Command: `git show plan/gate-split:.sdlc/board.md | grep -iE 'gs-U|gate-split'`. Seven rows, two 🟢,
four 🔵 with a builder seat and a live `.worktrees/gs-U*` path each, one ⚪ reading
`waits on #681 landing (start gate G0)` for `U6b` alone.

What the roadmap now says, in place of the old status cell and its `Blocked by` cell: the gate is
waived, six of seven units are under way, `U1` merged `34ebbae6` and `U6a` merged `50898d58`, `U2` to
`U5` were dispatched at `21:35:09Z` off `plan/preset-intent-fidelity` @ `a2bb3c84`, `U6b` is not
dispatched, and `U6b` alone is blocked on #681 landing. The `Ours to take next` row says the same in
one sentence instead of the retired claim that nothing else was ready to start.

## R2: the header counts, recomputed from the table

| What | Was | Is | Derivation |
|---|---|---|---|
| front matter input count | 10 issues | 13 issues | `grep -cE '^\| [0-9]+ \| #[0-9]+ ' .sdlc/roadmap.md` prints `13` |
| Count line total | 10 | 13 | the same row count |
| Count line unranked | 2 | 5 | the Pri column, below |
| Count line P0, P1, P2, P3 | 0, 4, 2, 2 | unchanged | the Pri column, below |

Command: `awk -F'|' '/^\| [0-9]+ \| #[0-9]+ /{gsub(/ /,"",$7); print $7}' .sdlc/roadmap.md | sort |
uniq -c`. It printed four lines: `   5 (p)`, `   4 P1`, `   2 P2`, `   2 P3`. There is no `P0` row,
so `P0 0` stands. The parts now sum to `13`, which equals the stated total and the row count.

The three rows the landing refresh added (#718, #719, #721) all carry `(p)` in the Pri column, which
is why only the unranked part moved. No row was added or dropped by U11.

## R3: this plan's unit tally, found by the new criterion

Not in the review. The new criterion's tally leg printed a stated phrase with no matching derived
phrase, which is how it surfaced.

Command: `git show origin/main:.sdlc/plans/records-followup.md | grep -cE '^- \['` prints `11`, and
the same pipe through `grep -cE '^- \[x\]'` prints `10`. The roadmap's #709 row read `nine of ten
units 🟢, U5 (this unit) in progress` and the first `Ours to take next` row read `ten of ten units
🟢`. Both now read `ten of eleven units 🟢` and name U11 as the unit in progress.

The criterion also caught an error in U11's own first draft of the R1 cell, which said five of seven
units where the checklist gives six. That is the bite on real data, before any synthetic control.

## The assertions criterion, proposed for the plan

Root cause it closes. U5's rows 1 to 7 grade the roadmap's shape: one head sha, the worktree set and
its count, the open-issue set, no leftover prompt, the debt ids, the alone rule. Not one of them
reads a number the roadmap states against the table that number counts, and not one of them opens
another plan's branch to check a claim the roadmap makes about it. R1, R2 and R3 were each invisible
to all seven.

Proposed row, plan-ready, table cells escaped as the plan escapes them:

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| U5-8 | every count the roadmap states is re-derived from the table it counts, and every readiness or gating claim it makes about another plan is re-derived from that plan's own branch state (bash; the body above `## Revisions` only, because the revision log legitimately narrates retired claims and would match every needle forever) | the block below, saved as `$F/assertions.sh` and run with `bash` from the branch checkout | `rows`, `total`, `partsum` and `inputs` all print the same number; `wt` prints its two numbers equal; `gateclaims` prints `0` unless every plan branch it names prints `started=0`; every `stated N of M units` line equals some plan's `merged-tally` or `started-tally` | five controls below, each measured |

The command, run from the branch checkout with `F` set to the seat's scratchpad:

```sh
B="$F/body.md"; awk '/^## Revisions/{exit} {print}' .sdlc/roadmap.md > "$B"
echo "rows $(grep -cE '^\| [0-9]+ \| #[0-9]+ ' "$B")"
perl -ne 'next unless /^Count:/; my @p=/\bP[0-9] ([0-9]+)/g; my ($u)=/unranked ([0-9]+)/; my ($t)=/total ([0-9]+)/; my $s=$u; $s+=$_ for @p; print "partsum $s total $t\n"' "$B"
perl -e 'my %g; while(<>){ next unless /^\| [0-9]+ \| #[0-9]+ /; my @c=split /\|/; my $p=$c[6]; $p=~s/\s//g; $g{$p}++ } print "pri $_ $g{$_}\n" for sort keys %g' "$B"
echo "inputs $(grep -oE 'open \([0-9]+ issues\)' "$B" | grep -oE '[0-9]+')"
echo "wt $(grep -oE '^[0-9]+ worktrees under' "$B" | grep -oE '^[0-9]+') $(grep -cE '^\| `\.git-worktrees/' "$B")"
for n in $({ grep -oE '`plan/[a-z0-9-]+`' "$B" | tr -d '`' | sed 's|^plan/||'; grep -oE '\.sdlc/plans/[a-z0-9-]+\.md' "$B" | sed 's|.*/||; s|\.md$||'; } | LC_ALL=C sort -u); do
  f=""; for r in origin/main HEAD "plan/$n"; do f=$(git show "$r:.sdlc/plans/$n.md" 2>/dev/null) && [ -n "$f" ] && break; done
  if [ -z "$f" ]; then echo "plan $n noplan"; continue; fi
  printf '%s\n' "$f" | perl -e 'my($n,$r)=@ARGV; my($u,$m,$s)=(0,0,0); while(<STDIN>){ next unless /^- \[([x~ ])\] /; $u++; $m++ if $1 eq "x"; $s++ if $1=~/[x~]/ } my @w=qw(zero one two three four five six seven eight nine ten eleven twelve); printf "plan %s at %s units=%d merged=%d started=%d merged-tally=%s of %s units started-tally=%s of %s units\n",$n,$r,$u,$m,$s,$w[$m],$w[$u],$w[$s],$w[$u]' "$n" "$r"
done
echo "gateclaims $(grep -icE 'refuses to start any unit|nothing( else)? is ready to start|no unit (has )?start' "$B")"
grep -oE '[a-z]+ of [a-z]+ units' "$B" | LC_ALL=C sort -u | sed 's/^/stated /'
```

Two notes on how it is built. The plan-file lookup tries `origin/main` first, then `HEAD`, then
`plan/<name>`, because a plan that has landed is authoritative on main while a local-only plan such
as `gate-split` exists on its branch alone; reading `plan/records-followup` first would have returned
the ten-unit copy and hidden R3. The number words are spelled out because the roadmap writes tallies
in words, so the derivation is compared in the roadmap's own spelling rather than by parsing prose
into digits.

### What it printed at the fix head

One span per line of output:

`rows 13` · `partsum 13 total 13` · `pri (p) 5` · `pri P1 4` · `pri P2 2` · `pri P3 2` ·
`inputs 13` · `wt 7 7` ·
`plan gate-split at plan/gate-split units=7 merged=2 started=6 merged-tally=two of seven units started-tally=six of seven units` ·
`plan lane-b-tickets at plan/lane-b-tickets units=4 merged=3 started=3 merged-tally=three of four units started-tally=three of four units` ·
`plan preset-intent-fidelity at plan/preset-intent-fidelity units=6 merged=5 started=5 merged-tally=five of six units started-tally=five of six units` ·
`plan records-followup at origin/main units=11 merged=10 started=11 merged-tally=ten of eleven units started-tally=eleven of eleven units` ·
`gateclaims 0` · `stated six of seven units` · `stated ten of eleven units`

Read: the three counts agree at `13`, the worktree pair agrees at `7`, no gating claim survives while
`gate-split` shows `started=6`, and each of the two stated tallies equals a derived one
(`six of seven units` is `gate-split`'s started tally, `ten of eleven units` is this plan's merged
tally).

### Negative controls

Run in a throwaway clone under the seat's scratchpad, `git clone -q --shared .` with the plan
branches fetched, the fixed roadmap copied in, and the clone restored from a clean copy between
controls. Never in the unit worktree.

| # | Mutation | What the run printed | Bites |
|---|---|---|---|
| NC1 | `total 13.` to `total 12.` | `partsum 13 total 12` | 🟢 the stated total no longer equals its parts or the row count |
| NC2 | `unranked 5` to `unranked 2`, the pre-fix value | `partsum 10 total 13` | 🟢 this is R2's breakdown half, reproduced |
| NC3 | the old #713 status cell restored verbatim | `gateclaims 1` next to `plan gate-split ... started=6`, and `stated six of seven units` gone | 🟢 this is R1, reproduced |
| NC4 | `ten of eleven units` back to `ten of ten units` | `stated ten of ten units` against derived `ten of eleven units` and `eleven of eleven units` | 🟢 this is R3, reproduced |
| NC5 | `open (13 issues)` back to `open (10 issues)` | `rows 13` against `inputs 10` | 🟢 this is R2's front-matter half, reproduced |

Four of the five reproduce a defect that actually shipped, which is the point: the criterion is not a
synthetic predicate, it is the one that would have caught the review's findings before the PR opened.

## Reruns at the fix head

| Row | Command as the plan writes it | What it printed | State |
|---|---|---|---|
| U5-1 | the `head:` sha extraction plus `git merge-base --is-ancestor` | `1`, then `anc 0` | 🟢 |
| U5-2 | the `git worktree list` diff, under bash from the root checkout | no lines, then `diff 0` | 🟢 |
| U5-3 | the stated worktree count against the row count | `7`, then `7` | 🟢 |
| U5-4 | the open-issue diff | one line, `14d13` with `< 722`, then `diff 1` | 🟡 see below |
| U5-5 | leftover prompt and unanswered question sweep | `0`, then `0` | 🟢 |
| U5-6 | the alone rule, under bash | `nonempty 0`; `.sdlc/roadmap.md`; `.sdlc/handoffs/records-followup-U5.md,.sdlc/questions/roadmap-2026-09-20.md,.sdlc/roadmap.md`; `branding: clean (507 files scanned)`; `exit 0`; `0` | 🟢 |
| U5-7 | debt ids as `debt.md` defines them | `0`, then `1` | 🟢 |
| U5-8 | the new assertions criterion | above | 🟢 |

U5-6 reads exactly right. The row was rerun twice: once at the roadmap commit, and once at the final
head after this handoff was committed. At the final head it printed `nonempty 0`, then
`.sdlc/roadmap.md` alone as the whole file list of every roadmap-touching commit in `BASE..HEAD`
(three of them, U5's regeneration, the Orchestrator's landing refresh and U11's `1fe53f5a`), then
`.sdlc/handoffs/records-followup-U11.md,.sdlc/handoffs/records-followup-U5.md,.sdlc/questions/roadmap-2026-09-20.md,.sdlc/roadmap.md`
as the branch's file list, which is the roadmap plus the two unit handoffs and the questions file.
That is the set the row's Expected allows, with this handoff added the same way U5's was. Run it
under bash: in zsh `for c in $C` does not word-split, `git show` is handed one argument holding three
newline-separated shas, and the leg dies with an ambiguous-argument error instead of printing a file
list. That happened here on the first attempt, which is revision 15's case reproduced.

U5-4 is the live-facts case the plan's own preamble and revision 15 describe. Issue #722 was opened
at `2026-09-20T22:12:36Z` (`gh issue view 722 --json createdAt`), after the roadmap's stated read
instant of `2026-09-20T22:00Z` and after every commit on this branch. U11 adds no row for it: its
scope is the three assertion repairs, and a fourth landing refresh is the Orchestrator's call, not the
builder's. Recorded here for the verifier.

## Plan gates

| Gate | Command | What it printed | State |
|---|---|---|---|
| P1 | `npm test` in the foreground, no `node_modules`, plus the `TESTS` length and `git status --short` piped to `wc -l` | `✓ all 48 test files passed`, exit 0; then `48`; then `0` | 🟢 |
| P4 | `node test/repo/branding.mjs` with `set -o pipefail` | `branding: clean (507 files scanned)`, then `exit 0` | 🟢 |
| P5 | the scope wall | `0`, then `1`, then nothing | 🟢 |
| P6 | added em dashes in `.sdlc` prose, backtick spans stripped | `0` | 🟢 |
| P7 | `sh .sdlc/checks/baseline-agrees-check.sh` | nine lines, seven `ok` counted lines plus the uncounted `note  head:` line and the `ok    head:` line, then `stale total: 0`, then `exit 0` | 🟢 |

P1 conditions, for the record: started `2026-09-20T22:19:46Z`, one-minute load average `13.33` with
`7` processes at 50 percent CPU or more, `163.8 s` wall, `142.79 s` user. Not a timing figure, and it
is not offered as one; U6b of `gate-split` owns the figures of record. It ran once, in the foreground,
never backgrounded. Green under that load, so no `flaky-gates` triage was needed.

P4's exit code was read from the command itself and from an unpiped rerun (`branding exit 0`), never
from a pipeline whose status a `tail` would have swallowed.

P5's second line prints `1` because the roadmap is exactly what this branch is for, which is what the
row's Expected says for the U5 branch. `node_modules` is absent from this worktree and
`git ls-files` piped to `grep -c node_modules` prints `0`.

## Scope

Two commits. `1fe53f5a` touches `.sdlc/roadmap.md` and nothing else, 7 insertions and 6 deletions on
7 changed lines. This handoff is the second commit and touches only
`.sdlc/handoffs/records-followup-U11.md`. Nothing outside `.sdlc/` moved. The board, the plan file,
`.sdlc/verdicts/`, the U5 handoff and the U5 question file were not touched.

## For the Orchestrator

| Item | Ask |
|---|---|
| U5-8 | fold the criterion above into the plan as written, or renumber it; the command, its expected output and its five controls are all here |
| #722 | the live-facts call is yours: a fourth landing refresh, or a 🟡 the verifier records and the next roadmap revision absorbs |
| R3 | it was not in the review; the plan's U11 row names two reds, and the roadmap's new revision row names three |
