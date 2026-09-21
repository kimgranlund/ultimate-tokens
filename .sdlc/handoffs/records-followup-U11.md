---
kind: handoff
plan: records-followup
unit: U11
ticket: "#709"
plan-revision: 17
branch: plan/records-followup-roadmap
unit-branch: unit/rf-U11
base: 1f9918776f0e54e5dfd88c1b23f494f6d6cff6ce
roadmap-commits: 1fe53f5a, 354c2d7f, 1405ee77, 66d40f70
review: .sdlc/verdicts/records-followup-U11-review.md on main @ 5c6a0c13, the committed copy of the reviewer's report (findings 1a and 7 fixed; 1b, 2, 3 and 6 carried by the Orchestrator)
verdict: .sdlc/verdicts/records-followup-U11.md pass 1 (both 🔴 rows, R3 second pass and U5-4, fixed at 66d40f70)
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
| R3, this plan's unit tallies | 🟢 | pass 1 fixed the arithmetic and left the predicate false; pass 2 reads the tally from the verdict files, nine of eleven 🟢 with U5 🟡 |
| R4, the refresh's stated method | 🟢 | the line now states what that commit did; the wording is not softened and the claim is not kept |
| review 1a, the `cited:` span shape | 🟢 | marker moved beside the quote span, and leg B's strip widened to that form in the same commit |
| review 7, two loose cells in the R1 fix | 🟢 | dispatch target re-derived as `plan/gate-split` @ `ebddc55d`; six started, not six under way |
| review 1b, 2, 3, 6 | carried | the Orchestrator's, per its ruling; recorded below and in the review |
| The assertions criterion | retired | proposed as U5-8, not adopted; owner ruling R14 sends the class to #723. Its runs stay as the evidence the ruling rests on |
| U5-1, U5-2, U5-3, U5-5, U5-6, U5-7 | 🟢 | reran at the fix head |
| U5-4 | 🟢 | #722 ranked at row 14; the exemption was anchored on the wrong commit in pass 1 and does not apply |
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

The status cell now says the gate is waived, six of seven units are started with two merged and four
in flight, `U1` merged `34ebbae6` and `U6a` merged `50898d58`, `U2` to `U5` were dispatched at
`21:35:09Z` into worktrees cut off `plan/gate-split` @ `ebddc55d`, and `U6b` is not dispatched.
`Blocked by` reads `U6b` only. The `Ours to take next` row says the same in one sentence instead of
the retired claim that nothing else was ready to start.

Two corrections to U11's own first pass of that cell, both from review finding 7, both re-derived
here. The dispatch target is the branch the worktrees were cut off, not the tree the waiver
conditions on: `git show 7d811172 --format=` prints four board rows each reading
`unit/gs-U2 off plan/gate-split @ ebddc55d` and its siblings, and `ebddc55d` is itself
`sdlc(gate-split): merge plan/preset-intent-fidelity @ a2bb3c84, the #681 tree U2 to U5 build on (#713)`.
Approval question 8's Effect line names `a2bb3c84` as the condition, which is what the first pass
echoed. And six started is not six under way, since two of the six are merged; the cell now says so,
as its `Blocked by` cell already did.

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

Pass 1 of this unit made both rows read `ten of eleven units 🟢`, which fixed the arithmetic and left
the predicate false. The verdict caught it. `ten` counts `[x]` ticks in the plan checklist, and a
tick records that the Orchestrator merged the unit, not that anyone graded it. Reading the verdicts
instead: `git show origin/main:.sdlc/verdicts/records-followup-U5.md | head -8` prints
`verdict: 🟡`, and `.sdlc/verdicts/records-followup-U8.md` prints `verdict: green-with-one-note`,
with the other seven of the ten merged units carrying a 🟢 headline. Nine of eleven are green, U5 is
🟡, and U11 has no green verdict. Both rows now say `nine of eleven units 🟢, U5 🟡`, with the `#709`
row also naming U11 as in progress.

`.sdlc/board.md`'s U5 row shows 🟢 while its own notes cell reads `11 🟢 1 🟡 0 🔴`, so the board
contradicts itself; the adapter makes the verdict authoritative. Reconciling the board is the
Orchestrator's, not this unit's, and nothing here touched it.

A note on provenance, since pass 1 got that wrong too. U11's assertions criterion surfaced the
original contradiction on its own, before the pre-land record reached the unit, and pass 1 recorded
it as a finding of the criterion rather than of the review. It was in the record: the `reviewer-l4`
raised it and the Verifier upgraded it to 🔴 on `:31`'s form as the control. The criterion found it
independently, which is a different and weaker claim.

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

The retired instant is quoted in U11's own revision row as the record held it, with a `cited:` marker
in a separate span beside it, which is the form `.sdlc/adapter.md` §3 states and the form all four
existing instances in `.sdlc/verdicts/` use. U11's first pass put the marker inside the quote span;
review finding 1a moved it, on the Orchestrator's ruling. Leg B's strip moved with it in the same
commit, because the two are one change: under the old strip the precedent form is not stripped and
leg B flags U11's own row at `line 116 commit 1fe53f5a ... reach 4% instant 2026-09-20T22:00Z`. The
measured behaviour of the two strips is in the probe table below.

## The assertions criterion, proposed and retired

Retired, not adopted. Owner ruling R14 lands U11 on R1 to R4 alone; U5-8 is not folded into the plan,
and the defect class it was written for is ticket #723, `records under .sdlc/ can assert facts about
other work that nothing re-derives`. The re-diagnosis is
`.sdlc/plans/records-followup-U11-rediagnosis.md`. Nothing in this section is a live proposal, and a
reader should take no row here as pending adoption.

Why it was retired, short. It machine-checks prose against no machine-readable source. Leg A's tally
has to infer a unit's state from whatever a record happens to say: a `[x]` tick records that the
Orchestrator merged a unit, not that anyone graded it, and re-derived at `origin/main` 38 of the 55
files under `.sdlc/verdicts/` carry no `verdict:` field at all, so the state has to be scraped from a
headline or a table row in three different shapes. Leg B has the matching problem from the other
side: a fixed needle list, recorded below as a known limit. A check built on that footing is a
reporter that can be reworded past, which is why the class needs a data shape rather than a
criterion, and why it is a ticket.

What stays. Every measurement below is left exactly as it was taken, because it is the evidence the
ruling rests on: the run at the graded head where both legs red all four findings, NC1 to NC8, the
strip probe table, and the stated limits. NC7 in particular is why the tick-versus-verdict problem is
stated as measured fact rather than as an opinion about record hygiene.

Root cause it was written for. U5's rows 1 to 7 grade the roadmap's shape: one head sha, the worktree set and
its count, the open-issue set, no leftover prompt, the debt ids, the alone rule. Not one of them
reads a number the roadmap states against the table that number counts, opens another plan's branch
to check a claim the roadmap makes about it, compares the file to itself, or grades a stated method
against the diff of the commit that states it. R1 to R4 each live in exactly that gap.

The row as it was proposed, kept as a record of what was measured and not as a row to adopt. Table
cells are escaped as the plan escapes them:

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| U5-8 | every count the roadmap states is re-derived from the table it counts; every readiness or gating claim it makes about another plan is re-derived from that plan's own branch state; the file agrees with the verdict record about any plan's unit tally, a tally written with a 🟢 being compared against the plans's green tally and not against its merge ticks; and every claim the file makes about how it was read is re-derived from the diff of the commit that made the claim (bash; leg A reads the body above `## Revisions` only, because the revision log legitimately narrates retired claims and would match every needle forever; leg B reads the whole file with `cited:` spans stripped) | leg A and leg B below, saved under `$F` and run with `bash` from the branch checkout | leg A: `rows`, `total`, `partsum` and `inputs` all print the same number; `wt` prints its two numbers equal; `gateclaims` prints `0` unless every plan branch it names prints `started=0`; every `stated N of M units 🟢` line equals some plan's `green-tally`, and every unmarked `stated N of M units` line equals some plan's `merged-tally` or `started-tally`. leg B: every line it prints carries a `reach` consistent with a whole-file rewrite, and any `instant` it names is at or before its commit's time | six measured controls below, four of them a defect that actually shipped, plus the whole criterion run unchanged at the graded head `3ee3c72b`, where it reds all four |

Leg A, the counts, the claims about other plans, and the unit tallies:

```sh
B="$F/body.md"; awk '/^## Revisions/{exit} {print}' .sdlc/roadmap.md > "$B"
G='🟢'; Y='🟡'; R='🔴'
echo "rows $(grep -cE '^\| [0-9]+ \| #[0-9]+ ' "$B")"
perl -ne 'next unless /^Count:/; my @p=/\bP[0-9] ([0-9]+)/g; my ($u)=/unranked ([0-9]+)/; my ($t)=/total ([0-9]+)/; my $s=$u; $s+=$_ for @p; print "partsum $s total $t\n"' "$B"
perl -e 'my %g; while(<>){ next unless /^\| [0-9]+ \| #[0-9]+ /; my @c=split /\|/; my $p=$c[6]; $p=~s/\s//g; $g{$p}++ } print "pri $_ $g{$_}\n" for sort keys %g' "$B"
echo "inputs $(grep -oE 'open \([0-9]+ issues\)' "$B" | grep -oE '[0-9]+')"
echo "wt $(grep -oE '^[0-9]+ worktrees under' "$B" | grep -oE '^[0-9]+') $(grep -cE '^\| `\.git-worktrees/' "$B")"
for n in $({ grep -oE '`plan/[a-z0-9-]+`' "$B" | tr -d '`' | sed 's|^plan/||'; grep -oE '\.sdlc/plans/[a-z0-9-]+\.md' "$B" | sed 's|.*/||; s|\.md$||'; } | LC_ALL=C sort -u); do
  f=""; r=""; for t in origin/main HEAD "plan/$n"; do f=$(git show "$t:.sdlc/plans/$n.md" 2>/dev/null) && [ -n "$f" ] && { r=$t; break; }; done
  [ -z "$f" ] && { echo "plan $n noplan"; continue; }
  g=0; y=0; rd=0; ug=0; tot=0; m=0; st=0
  for u in $(printf '%s\n' "$f" | grep -oE '^- \[[x~ ]\] [A-Za-z0-9]+' | awk '{print $3}'); do
    tot=$((tot+1))
    t2=$(printf '%s\n' "$f" | grep -m1 -E "^- \[[x~ ]\] $u ")
    case "$t2" in "- [x]"*) m=$((m+1)); st=$((st+1));; "- [~]"*) st=$((st+1));; esac
    v=$(git show "$r:.sdlc/verdicts/$n-$u.md" 2>/dev/null | head -20 \
        | grep -iE '^verdict:|^#.*verdict|^\| *verdict *\|' | grep -m1 -E "$G|$Y|$R|[Gg]reen|[Yy]ellow|[Rr]ed")
    case "$v" in *"$G"*|*reen*) g=$((g+1));; *"$Y"*|*ellow*) y=$((y+1));; *"$R"*|*ed*) rd=$((rd+1));; *) ug=$((ug+1));; esac
  done
  w=(zero one two three four five six seven eight nine ten eleven twelve)
  echo "plan $n at $r units=$tot merged=$m started=$st green=$g yellow=$y red=$rd ungraded=$ug green-tally=${w[$g]} of ${w[$tot]} units merged-tally=${w[$m]} of ${w[$tot]} units started-tally=${w[$st]} of ${w[$tot]} units"
done
echo "gateclaims $(grep -icE 'refuses to start any unit|nothing( else)? is ready to start|no unit (has )?start' "$B")"
grep -oE "[a-z]+ of [a-z]+ units $G|[a-z]+ of [a-z]+ units" "$B" | LC_ALL=C sort -u | sed 's/^/stated /'
```

Leg B, the claims the file makes about how it was read:

```sh
B="$F/body2.md"
perl -pe 's/\x60[^\x60]*\x60\s*\x60cited:[^\x60]*\x60//g' .sdlc/roadmap.md > "$B"
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

Five notes on how it is built. The plan-file lookup tries `origin/main` first, then `HEAD`, then
`plan/<name>`, because a plan that has landed is authoritative on main while a local-only plan such
as `gate-split` exists on its branch alone; reading `plan/records-followup` first would have returned
the ten-unit copy and hidden R3. The number words are spelled out because the roadmap writes tallies
in words, so the derivation is compared in the roadmap's own spelling rather than by parsing prose
into digits. Leg B's `reach` is deleted lines as a percentage of the file, which is what separates a
whole-file read from a patch: the two measured points are `41%` for the regeneration and `0%` for
the refresh, so any threshold in that gap works and none had to be invented to fit. The unit tally is read from `.sdlc/verdicts/<plan>-<unit>.md` at the same ref the plan was read
from, and never from the plan checklist's `[x]` ticks. That is the defect the U11 verdict found in
pass 1: a tick records a merge, a verdict records a grade, and a criterion that derives the number
from ticks certified a claim about grades. The verdict state is taken from the first line in the
file's first twenty that both looks like a verdict statement (`verdict:` front matter, a `# ...
Verdict ...` headline, or a `| Verdict | ... |` table row) and carries a state, because all three
shapes exist in `.sdlc/verdicts/` today and `records-followup-U8.md` writes its state as the word
`green-with-one-note` rather than as a marker. A stated tally carrying 🟢 is compared against
`green-tally`; an unmarked one against `merged-tally` or `started-tally`. Leg B strips a quote span that is
immediately followed by a `cited:` marker span, which is how `.sdlc/adapter.md` §3 and all four
existing instances in `.sdlc/verdicts/` write a cited quote, so a record that quotes a retired claim
as the subject of a finding is not read as making it. The strip is keyed on the adjacent marker and
not on marker text inside the span. That is a different exempt set from the one U11's first pass
used, not a subset of it: the two exempt disjoint forms.

### What it printed at the fix head

Leg A, one span per line of output: `rows 14` · `partsum 14 total 14` · `pri (p) 6` · `pri P1 4` ·
`pri P2 2` · `pri P3 2` · `inputs 14` · `wt 7 7` ·
`plan gate-split at plan/gate-split units=7 merged=2 started=6 green=2 yellow=0 red=0 ungraded=5 green-tally=two of seven units merged-tally=two of seven units started-tally=six of seven units` ·
`plan lane-b-tickets at plan/lane-b-tickets units=4 merged=3 started=3 green=0 yellow=0 red=0 ungraded=4 green-tally=zero of four units merged-tally=three of four units started-tally=three of four units` ·
`plan preset-intent-fidelity at plan/preset-intent-fidelity units=6 merged=5 started=5 green=0 yellow=0 red=0 ungraded=6 green-tally=zero of six units merged-tally=five of six units started-tally=five of six units` ·
`plan records-followup at origin/main units=11 merged=10 started=11 green=9 yellow=1 red=0 ungraded=1 green-tally=nine of eleven units merged-tally=ten of eleven units started-tally=eleven of eleven units` ·
`gateclaims 0` · `stated nine of eleven units 🟢` · `stated six of seven units`

Leg B, one span per line of output:
`line 12 commit 7dde8cb1 at 2026-09-20T14:36:16-07:00 added 54 deleted 52 hunks 18 filelines 125 reach 41% instant none` ·
`line 115 commit 7dde8cb1 at 2026-09-20T14:36:16-07:00 added 54 deleted 52 hunks 18 filelines 125 reach 41% instant none`

Read: the three counts agree at `14`; the worktree pair agrees at `7`; no gating claim survives while
`gate-split` shows `started=6`; each of the two stated tallies equals the right derived one, the
🟢-marked `nine of eleven units` against this plan's `green-tally` and the unmarked
`six of seven units` against `gate-split`'s `started-tally`; and the only two surviving read claims
are both carried by the regeneration commit, whose `reach 41%` is a whole-file rewrite and which
names no instant to contradict.

### The criterion at the graded head

The strongest control is not a mutation. Both legs were run unchanged in a throwaway clone checked
out at `3ee3c72b`, the exact commit the Verifier graded 🔴, and they red all four findings:

| Finding | What the unmodified criterion printed there | Catches it |
|---|---|---|
| R2 | `rows 13` against `partsum 10 total 10` and `inputs 10` | 🟢 |
| R1 | `gateclaims 2` beside `plan gate-split at plan/gate-split units=7 merged=2 started=6 green=2 ...` | 🟢 |
| R3 | `stated nine of ten units 🟢` and `stated ten of ten units 🟢`, neither equal to `green-tally=nine of eleven units` nor to each other | 🟢 |
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
| NC7 | `nine of eleven units 🟢` back to `ten of eleven units 🟢`, the text U11 shipped at `089e0e44` | `stated ten of eleven units 🟢` against `green-tally=nine of eleven units` | 🟢 the verdict's R3, on U11's own retired text |
| NC8 | leg A at the graded head with the tallies as they stood | `stated nine of ten units 🟢` and `stated ten of ten units 🟢`, neither matching `green-tally=nine of eleven units` | 🟢 |

NC7 is the one that matters, because it is the control pass 1 did not have. The same line prints
both `merged-tally=ten of eleven units` and `stated ten of eleven units 🟢`. Marker-blind, against
merge ticks, those two strings are equal and the criterion reports agreement, which is exactly how
pass 1's leg certified the false claim instead of catching it. Marker-aware, against the verdict
record, `stated ten of eleven units 🟢` is compared with `green-tally=nine of eleven units` and
reds. Nothing about the roadmap changed between the two readings; only the source of the number
did.

### The `cited:` strip, measured both ways

Review finding 1a moved the marker to the precedent form and finding 1b coupled leg B's strip to
that move. Both strips were run against the fixed file in a throwaway clone. The old strip is
`s/\x60cited:[^\x60]*\x60//g`; the new one is `s/\x60[^\x60]*\x60\s*\x60cited:[^\x60]*\x60//g`.

| Case | Old strip | New strip |
|---|---|---|
| U11's revision row in the precedent form (a genuine citation) | flagged: `line 116 commit 1fe53f5a at 2026-09-20T15:16:57-07:00 added 7 deleted 6 hunks 6 filelines 130 reach 4% instant 2026-09-20T22:00Z`, measured when that row was line 116 | exempt, correctly |
| a planted claim in a plain span, no marker | flagged | flagged: `line 131 commit none claim "Every cell below was \`Read at one instan"`, the plant being the file's last line at the time |
| a planted claim with the marker INSIDE the span, the review's probe 3 | exempt, the hole finding 1 measured | flagged: `line 132 commit none claim "This file was \`cited: Read at one instan"` at the current head |
| a planted claim with the marker in an adjacent span | flagged | exempt, correctly |

The strip was re-aimed, not narrowed. Rows 1 and 3 move in opposite directions, so the two exempt
sets are disjoint and neither contains the other: the old strip exempts a marker written inside the
quote span and flags the precedent form, the new strip does the reverse. An earlier draft of this
handoff called the change strictly narrower, which the reviewer re-ran and measured false; corrected
here. The commit message of `1405ee77` carries that retired phrasing and cannot be corrected without
rewriting a sha the review already graded, so the correction lives here and in `b0003592`'s message
instead; a reader of that commit message should read this section beside it. Re-measured on the fixed file, the needle survey prints three matching lines under the old
strip (`12`, `115`, `117`) and two under the new (`12`, `115`), and with the probe-3 plant added the
old still prints three while the new prints three of which one is the plant at `132`. Re-measured at
the current head, after #722's row shifted the revision log down by two lines.

The trade is the right one even though it is not a reduction. The precedent form is what
`.sdlc/adapter.md` §3 ratifies and what all four existing instances in `.sdlc/verdicts/` use, so it is
the form a real citation will take; the inline form is not written anywhere in this repo. Aiming the
exemption at the ratified shape keeps genuine citations exempt and stops exempting a shape no record
uses. It does not close finding 1b itself: a false claim written in the full precedent form is still
exempt, and that is the Orchestrator's to carry, since it is a question about whether a cited-quote
exemption should exist at all and not about this unit's line.

Two of the four rows print `commit none`, which review finding 6 records as having no stated verdict
in the Expected column. That clause is the Orchestrator's to add; U11 did not invent one.

Leg B's pass case is measured in the same run and not assumed: at the same head, the regeneration
commit's own read claim prints `reach 41%` and is accepted. Diff reach separates a whole-file read
from a three-row patch, so the check discriminates rather than always firing.

## Reruns at the fix head

| Row | Command as the plan writes it | What it printed | State |
|---|---|---|---|
| U5-1 | the `head:` sha extraction plus `git merge-base --is-ancestor` | `1`, then `anc 0` | 🟢 |
| U5-2 | the `git worktree list` diff, under bash from the root checkout | no lines, then `diff 0` | 🟢 |
| U5-3 | the stated worktree count against the row count | `7`, then `7` | 🟢 |
| U5-4 | the open-issue diff | no lines, then `diff 0` | 🟢 |
| U5-5 | leftover prompt and unanswered question sweep | `0`, then `0` | 🟢 |
| U5-6 | the alone rule, under bash | `nonempty 0`; `.sdlc/roadmap.md`; the four-file branch list; `branding: clean (508 files scanned)`; `exit 0`; `0` | 🟢 |
| U5-7 | debt ids as `debt.md` defines them | `0`, then `1` | 🟢 |
| U5-8 | the assertions criterion, both legs, run although the row is retired | above | 🟢 as a run, retired as a row |

U5-6 was rerun at the final head. It printed `nonempty 0`, then `.sdlc/roadmap.md` alone as the whole
file list of every roadmap-touching commit in `BASE..HEAD` (four of them: U5's regeneration, the
Orchestrator's landing refresh, and U11's `1fe53f5a` and `354c2d7f`), then
`.sdlc/handoffs/records-followup-U11.md,.sdlc/handoffs/records-followup-U5.md,.sdlc/questions/roadmap-2026-09-20.md,.sdlc/roadmap.md`
as the branch's file list, which is the roadmap plus the two unit handoffs and the questions file.
That is the set the row's Expected allows, with this handoff added the same way U5's was. Run it
under bash: in zsh `for c in $C` does not word-split, `git show` is handed one argument holding four
newline-separated shas, and the leg dies with an ambiguous-argument error instead of printing a file
list. That happened here on a first attempt, which is revision 15's case reproduced.

U5-4 is 🟢 at this head, and was graded wrong in pass 1. The plan's rule exempts an issue created
after the unit's commit time. Pass 1 anchored it on `3ee3c72b` at `21:59:23Z`, which is the previous
unit's landing refresh, and wrote that #722 was opened after every commit on this branch. That
sentence was false. `gh issue view 722 --json createdAt` prints `2026-09-20T22:12:36Z`, and every
commit of this unit is later: `1fe53f5a` `22:16:57Z`, `24620ec9` `22:25:08Z`, `354c2d7f` `22:28:25Z`,
`7b84d698` `22:30:38Z`, `1405ee77` `22:40:32Z`, `b0003592` `22:41:35Z`, `089e0e44` `22:49:03Z`. With
the anchor the rule actually names, the exemption does not apply, so #722 is ranked at row 14 and the
counts follow the table to 14.

The rule is not being read as exempting nothing. The three rows the refresh added are still exempt
on the same reading: #718 `21:45:38Z`, #719 `21:53:29Z` and #721 `21:57:04Z` all precede this unit's
commits and all carry rows. #722 alone failed it, and only because the anchor was the wrong commit.

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

Eleven commits, four of them roadmap-only and each touching that file alone: `1fe53f5a` (R1, R2, R3
pass 1), `354c2d7f` (R4 and U11's own revision row), `1405ee77` (review findings 1a and 7) and
`66d40f70` (the verdict's R3 pass 2 and U5-4). The other seven are this handoff. Both figures are
measured at the commit this handoff was written at, `698e8916`, over `3ee3c72b..698e8916`, the range
this unit's commits occupy at that sha: `git log --format=%H 3ee3c72b..698e8916` counts 11, the same
command with `-- .sdlc/roadmap.md` counts 4, and with `-- .sdlc/handoffs/records-followup-U11.md`
counts 7, so 4 and 7 partition the 11 with nothing left over. The figures nine and five were the
ones this paragraph carried; the four roadmap shas beside them were right. Taking `1f991877` as the
range start instead counts 15 and 6, because that range also holds U5's four commits, which are not
this unit's. Nothing outside `.sdlc/` moved. The board, the plan file, `.sdlc/verdicts/`, the U5
handoff and the U5 question file were not touched. The reviewer wrote its report under `.sdlc/runtime/`,
which `.gitignore:15` ignores, so nothing it wrote enters a commit or a diff leg here; the committed
copy of that report is `.sdlc/verdicts/records-followup-U11-review.md` on `main` @ `5c6a0c13`, which
is on no ref this branch carries.

## For the Orchestrator

| Item | Ask |
|---|---|
| U5-8 | nothing to fold. Ruling R14 retires the row and opens #723 for the class; the section above is marked retired at its head, and its runs stay as evidence. The fetch precondition and the needle-list and reach limits recorded here are inputs to #723, not open asks against this unit |
| the tally source | pass 1's leg derived unit tallies from `[x]` ticks and certified the verdict's R3 rather than catching it. Leg A now reads `.sdlc/verdicts/` and compares a 🟢-marked tally against the green tally. NC7 is the control; it reds U11's own retired text |
| `.sdlc/board.md` | its U5 row shows 🟢 while its own notes cell reads `11 🟢 1 🟡 0 🔴`. The board contradicts itself and the adapter makes the verdict authoritative. Out of this unit's scope; nothing here touched it |
| a stray untracked record | `.sdlc/verdicts/records-followup-U11.md`, the verifier's own file, sits untracked in `.worktrees/rf-U11` and is not gitignored, so `git status --short` prints `1`. Every commit here stages explicit paths, so it never entered one, but a landing that stages with `git add -A` would put it on this branch and break U5-6's file count |
| review 1b | leg B's strip was re-aimed, not narrowed: it closes the inline-marker hole and opens a precedent-form one the old strip lacked, which is the right trade because the precedent form is the ratified one, but a false claim written in that form is still exempt. Whether a cited-quote exemption should exist in a machine check at all is yours |
| review 2 | leg A's arithmetic has no reason to stop at `## Revisions`; only leg B's needles do. U11's own two rows live in the unread region, which is the sharpest argument for closing it |
| review 3 and 6 | the needle list and the `commit none` verdict both need widening before U5-8 is folded in; the needle-list limit is stated in this handoff already |
| review 4 and 5 | recorded as known limits: neither leg asserts, and `reach` measures edit volume rather than reading, so a whole-file write done as a create or a pure append scores `0%` |
| #722 | the live-facts call is yours. The Orchestrator has ruled no refresh: the rule makes it a note, and a refresh would itself be the patch-claiming-a-read shape leg B exists to catch |

## Correction, 2026-09-20, by records-followup U13

Two repairs made in this file by U13 under pre-land record pass 3 addendum rows A14 and A16. Nothing
else in the file was read or re-worded.

| id | Was | Is | Derived from | Negative control |
|---|---|---|---|---|
| A14 | `Nine commits, four of them roadmap-only`, `The other five are this handoff`, and a `roadmap-commits:` front-matter line naming 4 shas | `Eleven commits, four of them roadmap-only`, `The other seven are this handoff`, and the same four shas in the front matter, unchanged | measured at `698e8916`, the commit this handoff was written at: `git log --format=%H 3ee3c72b..698e8916` counts 11, with `-- .sdlc/roadmap.md` counts 4, with `-- .sdlc/handoffs/records-followup-U11.md` counts 7. Listing each of the 11 commits' paths shows 4 touching the roadmap alone and 7 touching this handoff alone, so the split is measured and not inferred, and the front matter's four shas are exactly those 4 | the same commands from `1f991877` count 15 and 6; the four extra commits are U5's (`7dde8cb1`, `ee28fff6`, `6ee0fd8a`, `3ee3c72b`), which is why that range is not the one the sentence names. Run at the branch head `28426bf7` instead they count 14 and 7, which is the wrong clock: see the note below |
| A16 | `review:` at the front matter and one sentence in Scope cited `.sdlc/runtime/rf-U11-review.md` | both name `.sdlc/verdicts/records-followup-U11-review.md` on `main` @ `5c6a0c13`, and the Scope sentence keeps the true fact that the reviewer wrote under a gitignored path | `git cat-file -e 5c6a0c13:.sdlc/verdicts/records-followup-U11-review.md` succeeds, and that file's own header reads `head: 7b84d698`, `seat: reviewer`, and says it sat under `.sdlc/runtime/`, which `.gitignore:15` ignores | the same `git cat-file -e` for `.sdlc/runtime/rf-U11-review.md` fails at `main` @ `5c6a0c13` and at this branch's head, `.sdlc/runtime/` does not exist on disk in this worktree, and `.gitignore:15` is `.sdlc/runtime/`, so the retired path resolves at no ref |

The first A14 repair, made earlier in this unit, was measured at the branch head `28426bf7` rather
than at `698e8916`, the commit this handoff was written at. It read 14 and 7 and it rewrote the
`roadmap-commits:` front matter to seven shas. The front matter was already right: at `698e8916` the
four shas it named were exactly that sha's roadmap commits. This correction re-derives both figures
at `698e8916` and restores the front matter. A record is graded at the commit it was written at,
never at the head, and the three extra roadmap commits the head carries (`f615f573`, `89d2057e`,
`28426bf7`) did not exist when this paragraph was written.

