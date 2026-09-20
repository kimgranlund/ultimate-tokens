---
kind: handoff
plan: records-followup
unit: U11
ticket: "#709"
plan-revision: 17
branch: plan/records-followup-roadmap
unit-branch: unit/rf-U11
base: 1f9918776f0e54e5dfd88c1b23f494f6d6cff6ce
roadmap-commits: 1fe53f5a2e52ced8bd23c6c841cf27d7ca7b3557, 354c2d7f6dde5ce37656bc58831f14ada43766ca
written: 2026-09-20
---

# U11: the roadmap's assertions, re-derived

Four pre-land reds, R1 to R4 of `.sdlc/verdicts/records-followup-roadmap-prepr.md`, and one criterion
that catches all four. Everything below was measured in `.worktrees/rf-U11`. `BASE` is
`git merge-base origin/main HEAD`.

## Verdict

| Item | State | Note |
|---|---|---|
| R1, the gating claims about #713 | 🟢 | both cells re-derived from `plan/gate-split`'s own checklist, board rows and approval file |
| R2, the header counts | 🟢 | front matter and Count line recomputed from the table; the breakdown now sums to the total |
| R3, this plan's unit tallies | 🟢 | the two rows agreed on nothing and one counted U5 green before U5 was graded; both re-derived |
| R4, the refresh's stated method | 🟢 | the line now states what that commit did; the wording is not softened and the claim is not kept |
| The assertions criterion | 🟢 | two legs, run at the fix head; run unchanged at the graded head it reds all four |
| U5-1, U5-2, U5-3, U5-5, U5-6, U5-7 | 🟢 | reran at the fix head |
| U5-4 | 🟡 | one live-facts difference, #722, opened after the refresh commit; no row added |
| P1, P4, P5, P6, P7 | 🟢 | `npm test` green in the foreground, 163.8 s wall |

## R1: the #713 gating claims were false when they were written

The regeneration commit is `7dde8cb1` at `2026-09-20T21:36:16Z`. Every fact below precedes it, so
this is not live drift that arrived later.

Command: `git log --format='%H %cI %s' plan/gate-split`. What it printed, converted from the host's
`-07:00` offset (these commits are local to this machine):

| Commit | Committed | Subject as printed, UTC |
|---|---|---|
| `34ebbae6` | `2026-09-20T18:07:33Z` | `merge U1 into plan/gate-split: the shared sorted corpus sampler and the gate scripts (#713)` |
| `0b02711b` | `2026-09-20T19:28:58Z` | `sdlc(gate-split): owner waives the start gate for U6a too (#713)` |
| `50898d58` | `2026-09-20T19:54:46Z` | `sdlc(gate-split): merge U6a, the sweeps matrix job in CI (#713)` |
| `bf82ab11` | `2026-09-20T19:55:04Z` | `sdlc(gate-split): U6a merged at 50898d58, checklist ticked, board row green (#713)` |
| `7852ff12` | `2026-09-20T20:52:48Z` | `sdlc(gate-split): owner waives G0 for U2 to U5 off #681's plan tree (#713)` |
| `7d811172` | `2026-09-20T21:35:09Z` | `sdlc(gate-split): U2 to U5 dispatched off the #681 tree at ebddc55d (#713)` |

Two corrections to the times the unit was dispatched with, neither changing the finding. The waiver
for `U6a` is `19:28:58Z`, not 19:52Z. The `19:55Z` for the `U6a` merge is `bf82ab11`, the
checklist-tick commit; the merge itself is `50898d58` at `19:54:46Z`.

Command: `git show plan/gate-split:.sdlc/plans/gate-split.md | grep -nE '^- \['`. Seven checklist
rows: `U1` and `U6a` marked `[x]` with their merge shas, `U2`, `U3`, `U4` and `U5` marked `[~]`,
`U6b` marked `[ ]`. Six of seven started, two merged.

Command: `git show plan/gate-split:.sdlc/questions/gate-split-approval.md | tail -25`. Three waiver
effects, one span per line as the file holds them: `Effect: the start gate G0 is waived for U1 only.
U2 onward still wait on #681 landing.`; `Effect: G0 is waived for U1 and U6a. U2 to U5 and U6b still
wait on #681 landing.`; `` Effect: G0 is waived for U2 to U5 as well, when built off `plan/preset-intent-fidelity` @ a2bb3c84 or later; U6b still waits for #681 on main. ``

Command: `git show plan/gate-split:.sdlc/board.md | grep -iE 'gs-U|gate-split'`. Seven rows: two 🟢,
four 🔵 each with a builder seat and a live `.worktrees/gs-U*` path, one ⚪ reading
`waits on #681 landing (start gate G0)` for `U6b` alone.

The status cell now says the gate is waived, six of seven units are under way, `U1` merged
`34ebbae6` and `U6a` merged `50898d58`, `U2` to `U5` were dispatched at `21:35:09Z` off
`plan/preset-intent-fidelity` @ `a2bb3c84`, and `U6b` is not dispatched. `Blocked by` reads `U6b`
only. The `Ours to take next` row says the same in one sentence instead of the retired claim that
nothing else was ready to start.

## R2: the header counts, recomputed from the table

| What | Was | Is | Derivation |
|---|---|---|---|
| front matter input count | 10 issues | 13 issues | `grep -cE '^\| [0-9]+ \| #[0-9]+ ' .sdlc/roadmap.md` prints `13` |
| Count line total | 10 | 13 | the same row count |
| Count line unranked | 2 | 5 | the Pri column, below |
| Count line P0, P1, P2, P3 | 0, 4, 2, 2 | unchanged | the Pri column, below |

Command: `awk -F'|' '/^\| [0-9]+ \| #[0-9]+ /{gsub(/ /,"",$7); print $7}' .sdlc/roadmap.md | sort |
uniq -c`. It printed `   5 (p)`, `   4 P1`, `   2 P2`, `   2 P3`. There is no `P0` row, so `P0 0`
stands. The parts now sum to `13`, which equals the stated total and the row count.

The three rows the landing refresh added all carry `(p)`, which is why only the unranked part moved.
No ranked row was added or dropped by U11.

## R3: this plan's unit tallies

The `#709` row read `nine of ten units 🟢, U5 (this unit) in progress` and the first
`Ours to take next` row read `ten of ten units 🟢`. Two statements about one plan at the file's one
claimed instant, which cannot both hold, and the second counted `U5` green before `U5` was ever
graded 🟢.

Command: `git show origin/main:.sdlc/plans/records-followup.md | grep -cE '^- \['` prints `11`; the
same pipe through `grep -cE '^- \[x\]'` prints `10`. Both rows now read `ten of eleven units 🟢` and
name U11 as the unit in progress, which is the plan as main carries it at revision 17.

A note on provenance, since the unit's first pass got it wrong. U11's assertions criterion surfaced
this contradiction on its own, before the pre-land record reached the unit, and that first pass
recorded it as a finding of the criterion rather than of the review. It was in the record: the
`reviewer-l4` raised it and the Verifier upgraded it to 🔴 on `:31`'s form as the control. The
criterion found it independently, which is a different and weaker claim. Corrected here and in the
roadmap's own revision row.

## R4: the refresh's stated method, against the diff it describes

The line claimed `cited: Read at one instant, 2026-09-20T22:00Z`. Measured on `3ee3c72b`, the commit
that line describes and sits in:

| Measure | Command | What it printed |
|---|---|---|
| numstat on the file | `git show --numstat --format= 3ee3c72b -- .sdlc/roadmap.md` | `4	0	.sdlc/roadmap.md` |
| hunks | the same with `--unified=0`, piped to `grep -c '^@@'` | `2` |
| commit time | `git show -s --format='%cI  %s' 3ee3c72b` | `2026-09-20T14:59:23-07:00  chore(sdlc): landing refresh, ranked rows for #718, #719 and #721 (#709)` |
| the hunk headers | the same with `--unified=0`, piped to `grep -E '^@@'` | `@@ -38,0 +39,3 @@ Count: P0 0 · P1 4 · P2 2 · P3 2 · unranked 2 (no priority label yet) · tot` and `@@ -111,0 +115 @@ Ruled by the owner on 2026-09-20. The second question asked in the first pass wa` |

Four added lines, none deleted, in two hunks, committed at `21:59:23Z`, which is 37 s before the
instant the line claims to have read at. The first hunk header carries the then stale `Count:` line
as untouched context directly above the three rows that invalidated it, so the file itself records
that the count was in front of the refresh and was not re-read.

The fix re-states what the commit did. It is not a re-read of the file; it was a three-row patch,
what it re-read was the open-issue list alone, every other cell is the regeneration's carried forward
unread, and the line now names itself as the mechanism that let R1, R2 and R3 survive into the PR.
The live-facts consequence is kept and anchored to the commit rather than to an instant that never
happened: an issue opened after `3ee3c72b` is the live-facts rule's case, a note for the verifier,
not a second refresh. The wording was not softened and the claim was not kept.

The retired instant is quoted in U11's own revision row inside a span marked `cited:`, under the
cited-quote clause of the verbatim-quote rule in `.sdlc/adapter.md` §3, so no sweep reads U11's
citation of it as a carrier. The criterion's second leg strips `cited:` spans for exactly that
reason; without the strip it flagged U11's own row, which is a false positive the ratified clause
already knows how to answer.

## The assertions criterion, proposed for the plan

Root cause it closes. U5's rows 1 to 7 grade the roadmap's shape: one head sha, the worktree set and
its count, the open-issue set, no leftover prompt, the debt ids, the alone rule. Not one of them
reads a number the roadmap states against the table that number counts, opens another plan's branch
to check a claim the roadmap makes about it, compares the file to itself, or grades a stated method
against the diff of the commit that states it. R1 to R4 each live in exactly that gap.

Proposed row, plan-ready, table cells escaped as the plan escapes them:

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| U5-8 | every count the roadmap states is re-derived from the table it counts; every readiness or gating claim it makes about another plan is re-derived from that plan's own branch state; the file agrees with itself about any plan's unit tally; and every claim the file makes about how it was read is re-derived from the diff of the commit that made the claim (bash; leg A reads the body above `## Revisions` only, because the revision log legitimately narrates retired claims and would match every needle forever; leg B reads the whole file with `cited:` spans stripped) | leg A and leg B below, saved under `$F` and run with `bash` from the branch checkout | leg A: `rows`, `total`, `partsum` and `inputs` all print the same number; `wt` prints its two numbers equal; `gateclaims` prints `0` unless every plan branch it names prints `started=0`; every `stated N of M units` line equals some plan's `merged-tally` or `started-tally`. leg B: every line it prints carries a `reach` consistent with a whole-file rewrite, and any `instant` it names is at or before its commit's time | six measured controls below, four of them a defect that actually shipped, plus the whole criterion run unchanged at the graded head `3ee3c72b`, where it reds all four |

Leg A, the counts and the claims about other plans:

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

Leg B, the claims the file makes about how it was read:

```sh
B="$F/body2.md"
perl -pe 's/\x60cited:[^\x60]*\x60//g' .sdlc/roadmap.md > "$B"
grep -nE 'Read at one instant|regenerated from live facts|full regeneration from live|read fresh' "$B" | while IFS=: read -r ln rest; do
  key=$(printf '%s' "$rest" | sed 's/^[^|]*| *//' | cut -c1-40)
  c=$(git log -1 --format=%H -S"$key" -- .sdlc/roadmap.md)
  if [ -z "$c" ]; then echo "line $ln commit none claim \"$key\""; continue; fi
  d=$(git show -s --format=%cI "$c")
  set -- $(git show --numstat --format= "$c" -- .sdlc/roadmap.md | head -1); a=$1; del=$2
  h=$(git show --format= --unified=0 "$c" -- .sdlc/roadmap.md | grep -c '^@@')
  fl=$(git show "$c:.sdlc/roadmap.md" | grep -c '')
  inst=$(printf '%s' "$rest" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}(:[0-9]{2})?Z' | head -1)
  echo "line $ln commit $(printf %.8s "$c") at $d added $a deleted $del hunks $h filelines $fl reach $(( del * 100 / fl ))% instant ${inst:-none}"
done
```

Four notes on how it is built. The plan-file lookup tries `origin/main` first, then `HEAD`, then
`plan/<name>`, because a plan that has landed is authoritative on main while a local-only plan such
as `gate-split` exists on its branch alone; reading `plan/records-followup` first would have returned
the ten-unit copy and hidden R3. The number words are spelled out because the roadmap writes tallies
in words, so the derivation is compared in the roadmap's own spelling rather than by parsing prose
into digits. Leg B's `reach` is deleted lines as a percentage of the file, which is what separates a
whole-file read from a patch: the two measured points are `41%` for the regeneration and `0%` for
the refresh, so any threshold in that gap works and none had to be invented to fit. Leg B strips
`cited:` spans first, under the cited-quote clause, so a record that quotes a retired claim as the
subject of a finding is not read as making it.

### What it printed at the fix head

Leg A, one span per line of output: `rows 13` · `partsum 13 total 13` · `pri (p) 5` · `pri P1 4` ·
`pri P2 2` · `pri P3 2` · `inputs 13` · `wt 7 7` ·
`plan gate-split at plan/gate-split units=7 merged=2 started=6 merged-tally=two of seven units started-tally=six of seven units` ·
`plan lane-b-tickets at plan/lane-b-tickets units=4 merged=3 started=3 merged-tally=three of four units started-tally=three of four units` ·
`plan preset-intent-fidelity at plan/preset-intent-fidelity units=6 merged=5 started=5 merged-tally=five of six units started-tally=five of six units` ·
`plan records-followup at origin/main units=11 merged=10 started=11 merged-tally=ten of eleven units started-tally=eleven of eleven units` ·
`gateclaims 0` · `stated six of seven units` · `stated ten of eleven units`

Leg B, one span per line of output:
`line 12 commit 7dde8cb1 at 2026-09-20T14:36:16-07:00 added 54 deleted 52 hunks 18 filelines 125 reach 41% instant none` ·
`line 114 commit 7dde8cb1 at 2026-09-20T14:36:16-07:00 added 54 deleted 52 hunks 18 filelines 125 reach 41% instant none`

Read: the three counts agree at `13`; the worktree pair agrees at `7`; no gating claim survives while
`gate-split` shows `started=6`; each of the two stated tallies equals a derived one
(`six of seven units` is `gate-split`'s started tally, `ten of eleven units` is this plan's merged
tally); and the only two surviving read claims are both carried by the regeneration commit, whose
`reach 41%` is a whole-file rewrite and which names no instant to contradict.

### The criterion at the graded head

The strongest control is not a mutation. Both legs were run unchanged in a throwaway clone checked
out at `3ee3c72b`, the exact commit the Verifier graded 🔴, and they red all four findings:

| Finding | What the unmodified criterion printed there | Catches it |
|---|---|---|
| R2 | `rows 13` against `partsum 10 total 10` and `inputs 10` | 🟢 |
| R1 | `gateclaims 2` beside `plan gate-split ... started=6` | 🟢 |
| R3 | `stated nine of ten units` and `stated ten of ten units`, neither equal to any derived tally, and not equal to each other | 🟢 |
| R4 | `line 115 commit 3ee3c72b at 2026-09-20T14:59:23-07:00 added 4 deleted 0 hunks 2 filelines 129 reach 0% instant 2026-09-20T22:00Z` | 🟢 |

The R4 line is the whole finding in one line of output: `reach 0%` against a claim of a whole-file
read, and an `instant` 37 s after the commit that claims it.

### Negative controls

Run in a throwaway clone under the seat's scratchpad, `git clone -q --shared .` with the plan
branches fetched, the fixed roadmap copied in, and the clone restored from a clean copy between
controls. Never in the unit worktree.

| # | Mutation | What the run printed | Bites |
|---|---|---|---|
| NC1 | `total 13.` to `total 12.` | `partsum 13 total 12` | 🟢 the stated total no longer equals its parts or the row count |
| NC2 | `unranked 5` to `unranked 2`, the pre-fix value | `partsum 10 total 13` | 🟢 R2's breakdown half, reproduced |
| NC3 | the old #713 status cell restored verbatim | `gateclaims 1` beside `plan gate-split ... started=6`, and `stated six of seven units` gone | 🟢 R1, reproduced |
| NC4 | `ten of eleven units` back to `ten of ten units` | `stated ten of ten units` against derived `ten of eleven units` and `eleven of eleven units` | 🟢 R3, reproduced |
| NC5 | `open (13 issues)` back to `open (10 issues)` | `rows 13` against `inputs 10` | 🟢 R2's front-matter half, reproduced |
| NC6 | leg B at the graded head, nothing mutated | the R4 line in the table above | 🟢 R4, on the real commit |

Leg B's pass case is measured in the same run and not assumed: at the same head, the regeneration
commit's own read claim prints `reach 41%` and is accepted. Diff reach separates a whole-file read
from a three-row patch, so the check discriminates rather than always firing.

## Reruns at the fix head

| Row | Command as the plan writes it | What it printed | State |
|---|---|---|---|
| U5-1 | the `head:` sha extraction plus `git merge-base --is-ancestor` | `1`, then `anc 0` | 🟢 |
| U5-2 | the `git worktree list` diff, under bash from the root checkout | no lines, then `diff 0` | 🟢 |
| U5-3 | the stated worktree count against the row count | `7`, then `7` | 🟢 |
| U5-4 | the open-issue diff | one line, `14d13` with `< 722`, then `diff 1` | 🟡 see below |
| U5-5 | leftover prompt and unanswered question sweep | `0`, then `0` | 🟢 |
| U5-6 | the alone rule, under bash | `nonempty 0`; `.sdlc/roadmap.md`; the four-file branch list; `branding: clean (508 files scanned)`; `exit 0`; `0` | 🟢 |
| U5-7 | debt ids as `debt.md` defines them | `0`, then `1` | 🟢 |
| U5-8 | the new assertions criterion, both legs | above | 🟢 |

U5-6 was rerun at the final head. It printed `nonempty 0`, then `.sdlc/roadmap.md` alone as the whole
file list of every roadmap-touching commit in `BASE..HEAD` (four of them: U5's regeneration, the
Orchestrator's landing refresh, and U11's `1fe53f5a` and `354c2d7f`), then
`.sdlc/handoffs/records-followup-U11.md,.sdlc/handoffs/records-followup-U5.md,.sdlc/questions/roadmap-2026-09-20.md,.sdlc/roadmap.md`
as the branch's file list, which is the roadmap plus the two unit handoffs and the questions file.
That is the set the row's Expected allows, with this handoff added the same way U5's was. Run it
under bash: in zsh `for c in $C` does not word-split, `git show` is handed one argument holding four
newline-separated shas, and the leg dies with an ambiguous-argument error instead of printing a file
list. That happened here on a first attempt, which is revision 15's case reproduced.

U5-4 is the live-facts case the plan's preamble describes. Issue #722 was opened at
`2026-09-20T22:12:36Z` (`gh issue view 722 --json createdAt`), after the landing refresh commit
`3ee3c72b` at `21:59:23Z` and after every commit on this branch. That anchor is the refresh commit
and not the instant the retired line named, since R4 established that instant never happened. U11
adds no row for it: its scope is the four assertion repairs, and a further landing refresh is the
Orchestrator's call, not the builder's.

## Plan gates

| Gate | Command | What it printed | State |
|---|---|---|---|
| P1 | `npm test` in the foreground, no `node_modules`, plus the `TESTS` length and `git status --short` piped to `wc -l` | `✓ all 48 test files passed`, exit 0; then `48`; then `0` | 🟢 |
| P4 | `node test/repo/branding.mjs` with `set -o pipefail` | `branding: clean (508 files scanned)`, then `exit 0` | 🟢 |
| P5 | the scope wall | `0`, then `1`, then nothing | 🟢 |
| P6 | added em dashes in `.sdlc` prose, backtick spans stripped | `0` | 🟢 |
| P7 | `sh .sdlc/checks/baseline-agrees-check.sh` | nine lines, seven counted `ok` lines plus the uncounted `note  head:` line and the `ok    head:` line, then `stale total: 0`, then `exit 0` | 🟢 |

P1 conditions, for the record: started `2026-09-20T22:19:46Z`, one-minute load average `13.33` with
`7` processes at 50 percent CPU or more, `163.8 s` wall, `142.79 s` user. Not a timing figure and not
offered as one; U6b of `gate-split` owns the figures of record. It ran once, in the foreground, never
backgrounded. Green under that load, so no `flaky-gates` triage was needed. P1 was not rerun after
the R4 commit: that commit changes two prose lines of `.sdlc/roadmap.md`, which no test file reads,
and the branding gate that does scan `.sdlc/` was rerun and is green.

P4's exit code was read from the command itself and from an unpiped rerun (`branding exit 0`), never
from a pipeline whose status a `tail` would have swallowed.

P5's second line prints `1` because the roadmap is exactly what this branch is for, which is what the
row's Expected says for the U5 branch. `node_modules` is absent from this worktree and `git ls-files`
piped to `grep -c node_modules` prints `0`.

## Scope

Four commits, two of them roadmap-only and each touching that file alone: `1fe53f5a` (R1, R2, R3;
7 insertions, 6 deletions) and `354c2d7f` (R4 and U11's own revision row; 2 insertions, 2 deletions).
The other two are this handoff. Nothing outside `.sdlc/` moved. The board, the plan file,
`.sdlc/verdicts/`, the U5 handoff and the U5 question file were not touched.

## For the Orchestrator

| Item | Ask |
|---|---|
| U5-8 | fold the criterion above into the plan as written, or renumber it; both legs, their expected output, six controls and the run at the graded head are all here |
| #722 | the live-facts call is yours: a further landing refresh, or a 🟡 the verifier records and the next roadmap revision absorbs |
| R4's fix shape | the retired instant is preserved in a `cited:` span rather than deleted, so the record of what was claimed survives the repair; if the plan would rather the claim vanish entirely, say so and leg B's strip becomes unnecessary |
