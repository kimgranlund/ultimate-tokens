---
kind: handoff
plan: records-followup
unit: U11
ticket: "#709"
plan-revision: 17 as written at 7b84d698, naming main's plan (revision 17 is main's 7b59a29b); the plan reachable from 698e8916 stops at revision 13, and the body applies owner ruling R14, which main's plan records as revision 19 at 13f46583
branch: plan/records-followup-roadmap
unit-branch: unit/rf-U11
base: 1f9918776f0e54e5dfd88c1b23f494f6d6cff6ce
roadmap-commits: 1fe53f5a, 354c2d7f, 1405ee77, 66d40f70
review: .sdlc/verdicts/records-followup-U11-review.md on main @ 5c6a0c13, the committed copy of the reviewer's report (findings 1a and 7 fixed; 1b, 2, 3 and 6 carried by the Orchestrator)
verdict: .sdlc/verdicts/records-followup-U11.md pass 1 (both 🔴 rows, R3 second pass and U5-4, fixed at 66d40f70 for #722; U5-4 is 🟡 at 698e8916 for #723). That file is on main from 428f81ad, which first adds it and is not reachable from 698e8916; every mention of the U11 verdict below means that file there
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
| review 1a, the `cited:` span shape | 🟢 | marker moved beside the quote span in the roadmap at `1405ee77`, and leg B's strip re-aimed to that form in this handoff at `b0003592`, its child commit |
| review 7, two loose cells in the R1 fix | 🟢 | dispatch target re-derived as `plan/gate-split` @ `ebddc55d`; six started, not six under way |
| review 1b, 2, 3, 6 | carried | the Orchestrator's, per its ruling; recorded below and in the review |
| The assertions criterion | retired | proposed as U5-8, not adopted; owner ruling R14 sends the class to #723. Its runs stay as the evidence the ruling rests on |
| U5-1, U5-2, U5-3, U5-5, U5-6, U5-7 | 🟢 | reran before `24620ec9` recorded them, when the unit's last roadmap commit was `1fe53f5a`; U5-6 again before `7b84d698` |
| U5-4 | 🟡 | 🟡 at `698e8916`, this handoff's last commit, for `#723`, as the reruns table below records. The `#722` half holds: ranked at row 14, and the exemption was anchored on the wrong commit in pass 1 and does not apply |
| P1, P4, P5, P6, P7 | 🟢 | `npm test` green in the foreground, 163.8 s wall |

## R1: the #713 gating claims were false when they were written

The regeneration commit is `7dde8cb1` at `2026-09-20T21:36:16Z`. Every fact below was on
`plan/gate-split` when it was made. Commit times cannot show that, because none of the branch's commits
below is reachable from `7dde8cb1` or from `698e8916`; the branch's reflog can. `git rev-parse
'plan/gate-split@{2026-09-20 14:36:16 -0700}'` prints `7d811172`, the last commit in the table below,
which the reflog shows the branch holding from `14:35:09` to `14:40:03` local time. The one commit
after it before these reads, `9276d4f0`, changes only `U6b`'s row text and adds a `U6-10` row, so
every checklist, board and approval fact below reads the same at `7d811172`. This is not live drift
that arrived later. The reflog is this clone's own and expires, so a reader elsewhere has only the
commit times, which order the same way.

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
| front matter input count | 10 issues | 14 issues | `grep -cE '^\| [0-9]+ \| #[0-9]+ ' .sdlc/roadmap.md` prints `14` at `698e8916` |
| Count line total | 10 | 14 | the same row count |
| Count line unranked | 2 | 6 | the Pri column, below |
| Count line P0, P1, P2, P3 | 0, 4, 2, 2 | unchanged | the Pri column, below |

Command: `awk -F'|' '/^\| [0-9]+ \| #[0-9]+ /{gsub(/ /,"",$7); print $7}' .sdlc/roadmap.md | sort |
uniq -c`. Run against `698e8916:.sdlc/roadmap.md` it prints `   6 (p)`, `   4 P1`, `   2 P2`, `   2 P3`. There
is no `P0` row, so `P0 0` stands. The parts sum to `14`, which equals the stated total and the row
count at that sha: `git show 698e8916:.sdlc/roadmap.md` gives `Count: P0 0 · P1 4 · P2 2 · P3 2 ·
unranked 6 (no priority label yet) · total 14.` and an `inputs:` line reading `14 issues`.

The figures moved twice inside this unit. U11's first pass took them from 10 to 13, the three rows
the landing refresh had added all carrying `(p)`. `66d40f70`, this unit's own later commit, added
`#722`'s row and took them to 14 with `(p)` at 6. This table states the second set, which is what the
handoff's own last commit carries; the first set is what the earlier draft of this table said and is
retired.

## R3: this plan's unit tallies

The `#709` row read `nine of ten units 🟢, U5 (this unit) in progress` and the first
`Ours to take next` row read `ten of ten units 🟢`. Two statements about one plan at the file's one
claimed instant, which cannot both hold, and the second counted `U5` green before `U5` was ever
graded 🟢.

Command: `git show origin/main:.sdlc/plans/records-followup.md | grep -cE '^- \['` prints `11`; the
same pipe through `grep -cE '^- \[x\]'` prints `10`. `origin/main` is a moving ref and none of its
commits here is reachable from `698e8916`, so these reads are anchored by this repo's reflog:
`origin/main` is `7b59a29b` at the commit time of `24620ec9`, which first recorded these two reads,
and `b8c3be8f` at that of `5cac5623`, which added the verdict reads below. Both figures hold at both. Pass 1 made both rows read `ten of eleven
units 🟢` naming U11 as the unit in progress, which is the tick-derived figure the paragraph below
retires. At `698e8916` neither row reads that: both read `nine of eleven units 🟢`.

Pass 1 of this unit made both rows read `ten of eleven units 🟢`, which fixed the arithmetic and left
the predicate false. The U11 verdict caught it (front matter: on main, not reachable from `698e8916`). `ten` counts `[x]` ticks in the plan checklist, and a
tick records that the Orchestrator merged the unit, not that anyone graded it. Reading the verdicts
instead: `git show origin/main:.sdlc/verdicts/records-followup-U5.md | head -8` prints
`verdict: 🟡`, and `.sdlc/verdicts/records-followup-U8.md` prints `verdict: green-with-one-note`,
with the other eight of the ten merged units reading 🟢 at `b8c3be8f` (an earlier draft
said seven, which does not sum to nine). Nine of eleven are green, U5 is
🟡, and U11 has no green verdict. Both rows now say `nine of eleven units 🟢, U5 🟡`, with the `#709`
row also naming U11 as in progress.

`.sdlc/board.md` on `main` read its U5 row 🟢 against a notes cell of `11 🟢 1 🟡 0 🔴` from
`34173dd6`, `2026-09-20T14:54:50-07:00`, which is the self-contradiction the adapter settles by
making the verdict authoritative. That board is main's and not this branch's. Neither `34173dd6` nor
`428f81ad`, the main commit that later rewrote that notes cell, is reachable from `698e8916`, whose
`board.md` was last touched at `850f7fb1` and lists U5 ⚪, not dispatched; `grep -c '11 🟢'` over it
prints `0` because the row predates U5's build, not because anything reconciled it. On main,
`428f81ad`, `2026-09-20T16:08:42-07:00`, rewrote the notes cell to read `verdict 🟡 overall` and to
call the row's 🟢 the checklist state; the row still reads 🟢 there. Reconciling it was the
Orchestrator's, not this unit's, and nothing here touched it.

A note on provenance, since pass 1 got that wrong too. U11's assertions criterion surfaced the
original contradiction on its own, before the pre-land record reached the unit, and pass 1 recorded
it as a finding of the criterion rather than of the review. It was in the record: the `reviewer-l4`
raised it and the Verifier upgraded it to 🔴 on `:31`'s form as the control. The criterion found it
independently, which is a different and weaker claim.

## R4: the refresh's stated method, against the diff it describes

The line claimed `Read at one instant, 2026-09-20T22:00Z` `cited:`. Measured on `3ee3c72b`, the commit
that line describes and sits in:

| Measure | Command | What it printed |
|---|---|---|
| numstat on the file | `git show --numstat --format= 3ee3c72b -- .sdlc/roadmap.md` | `4	0	.sdlc/roadmap.md` |
| hunks | the same with `--unified=0`, piped to `grep -c '^@@'` | `2` |
| commit time | `git show -s --format='%cI  %s' 3ee3c72b` | `2026-09-20T14:59:23-07:00  chore(sdlc): landing refresh, ranked rows for #718, #719 and #721 (#709)` |
| the hunk headers | the same with `--unified=0`, piped to `grep -E '^@@'` | `@@ -38,0 +39,3 @@ Count: P0 0 · P1 4 · P2 2 · P3 2 · unranked 2 (no priority label yet) · tot` and `@@ -111,0 +115 @@ Ruled by the owner on 2026-09-20. The second question asked in the first pass wa` |

Four added lines, none deleted, in two hunks, committed at `21:59:23Z`, which is 37 s before the
instant the line claims to have read at. The then stale `Count:` line appears in that diff only as
git's section-heading text in the first hunk's `@@` header, never as content: at `--unified=0` the
hunk carries no context lines at all, and `Count:` sits at line 25 of the file with a blank line, the
table header, its separator and every then ranked row between it and the insertion point at line 39.
Calling it untouched context directly above the three rows, as an earlier draft of this paragraph
did, describes a `--unified=3` reading of a diff that was measured at `--unified=0`.

The fix re-states what the commit did. It is not a re-read of the file; it was a three-row patch,
what it re-read was the open-issue list alone, every other cell is the regeneration's carried forward
unread, and the line now names itself as the mechanism that let R1, R2 and R3 survive into the PR.
The roadmap line keeps a live-facts consequence anchored to the commit rather than to an instant
that never happened: at `698e8916:.sdlc/roadmap.md` it reads that an issue opened after this commit
is the live-facts rule's case. That is the roadmap's text, not this handoff's ruling, and it
contradicts the same roadmap's row 14: `#722`, opened after `3ee3c72b`, is ranked there and not
noted, because the U5-4 section below retires `3ee3c72b` as the rule's anchor. The roadmap side is
U14's under R18. The wording was not softened and the claim was not kept.

The retired instant is quoted in U11's own revision row as the record held it, with a `cited:` marker
in a separate span beside it, which is the form `.sdlc/adapter.md` §3 states and the form all four
existing instances in `.sdlc/verdicts/` use. U11's first pass put the marker inside the quote span;
review finding 1a moved it, on the Orchestrator's ruling. Leg B's strip moved with it as one change
in two commits, the marker in the roadmap at `1405ee77` and the strip in this handoff at `b0003592`,
each touching one file. They are one change because under the old strip the precedent form is not stripped and
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
Orchestrator merged a unit, not that anyone graded it, and re-derived at `origin/main`, which this
repo's reflog puts at `13f46583` when this sentence was committed, 38 of the 55 files under
`.sdlc/verdicts/` carry no `verdict:` field at all. That tree is `428f81ad`'s, since no main commit
between the two touches the directory; at `698e8916` the same count is 37 of 52. Either way the state has to be scraped from a
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
from, and never from the plan checklist's `[x]` ticks. That is the defect the U11 verdict (front matter) found in
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

### What it printed, and the head it printed at

Run at `66d40f70`, `2026-09-20T16:02:56-07:00`, this unit's last roadmap commit. Everything below is
that run's output, not a claim about any later state. Its roadmap figures are re-derivable at that
sha, `rows 14` and `inputs 14` both holding at `698e8916` as well. Its `plan records-followup` line
reads `origin/main`, a moving ref, so it is anchored by this repo's reflog rather than by the ref's
name: the output was first committed at `5cac5623`, and the reflog holds `origin/main` at `b8c3be8f`
from `15:50:52` to `16:08:45` local time, a window covering `66d40f70` through `5cac5623`. At
`b8c3be8f` the plan has 11 units, 10 ticked and 1 in progress, U5's verdict reads 🟡, U8's reads
`green-with-one-note`, eight more read 🟢 and U11 has no verdict file: 11 units, 10 merged, 11
started, nine green counting U8, one yellow and one ungraded, which are the line's figures. An earlier draft of this paragraph said the
line went stale at `428f81ad` before this handoff's last commit. `428f81ad` is not reachable from
`698e8916`, so it does not falsify a record graded at that commit; it moved `origin/main` later, which
is why the ref's current state no longer reproduces the line and `b8c3be8f` does.

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
| NC7 | `nine of eleven units 🟢` back to `ten of eleven units 🟢`, the text U11 shipped at `089e0e44` | `stated ten of eleven units 🟢` against `green-tally=nine of eleven units` | 🟢 the U11 verdict's R3 (front matter), on U11's own retired text |
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
rewriting a sha the review already graded, so the correction lives here and in `089e0e44`'s
message, `docs(sdlc): the leg B strip was re-aimed, not narrowed (#709)`, instead; a reader of
`1405ee77`'s message should read this section beside it. `b0003592`, named by an earlier draft of
this sentence, is not the correction: `git log -1 --format=%B b0003592` repeats the retired claim in
the words `The new strip is strictly narrower`, and `git log -S'strictly narrower'` over this file
returns `b0003592` as the commit that wrote it and `089e0e44` as the one that corrected it. Re-measured on the fixed file, the needle survey prints three matching lines under the old
strip (`12`, `115`, `117`) and two under the new (`12`, `115`), and with the probe-3 plant added the
old still prints three while the new prints three of which one is the plant at `132`. Re-measured after
`66d40f70` added `#722`'s row, which moved the revision log down by one line, not two:
`git show --numstat --format= 66d40f70 -- .sdlc/roadmap.md` prints `6	5`, six added against five
deleted.

The trade is the right one even though it is not a reduction. The precedent form is what
`.sdlc/adapter.md` §3 ratifies and what all four existing instances in `.sdlc/verdicts/` use, so it is
the form a real citation will take; the inline form is written in exactly two places in this repo,
both of them this handoff's own: `git grep -c '`cited: ' 698e8916` returns one file, this one, with a
count of `2`, against the precedent form's six files at that sha. One of the two is the R4 narration
above, which this file's Correction has since moved to the precedent form; the other is the probe
fixture below, which has to stay inline because the inline case is what it tests. No other record
uses it. Aiming the exemption at the ratified shape keeps genuine citations exempt and stops
exempting a shape no other record uses. It does not close finding 1b itself: a false claim written in the full precedent form is still
exempt, and that is the Orchestrator's to carry, since it is a question about whether a cited-quote
exemption should exist at all and not about this unit's line.

Two of the four rows print `commit none`, which review finding 6 records as having no stated verdict
in the Expected column. That clause is the Orchestrator's to add; U11 did not invent one.

Leg B's pass case is measured in the same run and not assumed: at the same head, the regeneration
commit's own read claim prints `reach 41%` and is accepted. Diff reach separates a whole-file read
from a three-row patch, so the check discriminates rather than always firing.

## Reruns at the fix head

The fix head is not one sha. The rows below were committed at `24620ec9`, when the unit's last
roadmap commit was `1fe53f5a`; U5-6 was rewritten at `7b84d698`, U5-4 at `5cac5623` and U5-8 at `698e8916`.

| Row | Command as the plan writes it | What it printed | State |
|---|---|---|---|
| U5-1 | the `head:` sha extraction plus `git merge-base --is-ancestor` | `1`, then `anc 0` | 🟢 |
| U5-2 | the `git worktree list` diff, under bash from the root checkout | no lines, then `diff 0` | 🟢 |
| U5-3 | the stated worktree count against the row count | `7`, then `7` | 🟢 |
| U5-4 | the open-issue diff | no lines, then `diff 0` | 🟡 at this handoff's own commit: `#723` was minted `2026-09-20T16:24:11-07:00`, 4 minutes 1 second before `698e8916`, and the roadmap at that sha carries no row for it, so the diff the row reports clean was clean when run and not at the commit that records it |
| U5-5 | leftover prompt and unanswered question sweep | `0`, then `0` | 🟢 |
| U5-6 | the alone rule, under bash | `nonempty 0`; `.sdlc/roadmap.md`; the four-file branch list; `branding: clean (508 files scanned)`; `exit 0`; `0` | 🟢 |
| U5-7 | debt ids as `debt.md` defines them | `0`, then `1` | 🟢 |
| U5-8 | the assertions criterion, both legs, run although the row is retired | above | 🟢 as a run, retired as a row |

U5-6 was rerun at the final head. It printed `nonempty 0`, then `.sdlc/roadmap.md` alone as the whole
file list of every roadmap-touching commit in `BASE..HEAD`. At `698e8916` there are six of them, not
the four an earlier draft of this sentence named: `git log --format=%h 1f991877..698e8916 --
.sdlc/roadmap.md` returns `66d40f70`, `1405ee77`, `354c2d7f`, `1fe53f5a`, `3ee3c72b` and `7dde8cb1`,
which is U5's regeneration, the Orchestrator's landing refresh and four of U11's own. Then
`.sdlc/handoffs/records-followup-U11.md,.sdlc/handoffs/records-followup-U5.md,.sdlc/questions/roadmap-2026-09-20.md,.sdlc/roadmap.md`
as the branch's file list, which is the roadmap plus the two unit handoffs and the questions file.
That is the set the row's Expected allows, with this handoff added the same way U5's was. Run it
under bash: in zsh `for c in $C` does not word-split, `git show` is handed one argument holding four
newline-separated shas, and the leg dies with an ambiguous-argument error instead of printing a file
list. That happened here on a first attempt, which is the case revision 15 of the plan on main
records (`0a0f0034`, not reachable from `698e8916`), reproduced.

U5-4 was graded wrong in pass 1, on `#722`, and this paragraph and the next concern `#722` alone; at
`698e8916` the row is 🟡 for `#723`, as the table above records. The plan's rule exempts an issue created
after the unit's commit time. Pass 1 anchored it on `3ee3c72b` at `21:59:23Z`, which is the previous
unit's landing refresh, and wrote that #722 was opened after every commit on this branch. That
sentence was false. `gh issue view 722 --json createdAt` prints `2026-09-20T22:12:36Z`, and every
commit of this unit is later: `1fe53f5a` `22:16:57Z`, `24620ec9` `22:25:08Z`, `354c2d7f` `22:28:25Z`,
`7b84d698` `22:30:38Z`, `1405ee77` `22:40:32Z`, `b0003592` `22:41:35Z`, `089e0e44` `22:49:03Z`. With
the anchor the rule actually names, the exemption does not apply, so #722 is ranked at row 14 and the
counts follow the table to 14.

The rule is not being read as exempting nothing. The three rows the refresh added are still exempt
on the same reading: #718 `21:45:38Z`, #719 `21:53:29Z` and #721 `21:57:04Z` all precede this unit's
commits and all carry rows. Of those four issues #722 alone failed it, and only because the anchor
was the wrong commit. `#723`, created `2026-09-20T23:24:11Z`, is later than every commit of this unit
but `698e8916` and has no row at that sha, which is the table's 🟡 and outside this reading.

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
`66d40f70` (the U11 verdict's R3 pass 2 and U5-4, front matter). The other seven are this handoff. Both figures are
measured at the commit this handoff was written at, `698e8916`, over `3ee3c72b..698e8916`, the range
this unit's commits occupy at that sha: `git log --format=%H 3ee3c72b..698e8916` counts 11, the same
command with `-- .sdlc/roadmap.md` counts 4, and with `-- .sdlc/handoffs/records-followup-U11.md`
counts 7, so 4 and 7 partition the 11 with nothing left over. The figures nine and five were the
ones this paragraph carried; the four roadmap shas beside them were right. Taking `1f991877` as the
range start instead counts 15 and 6, because that range also holds U5's four commits, which are not
this unit's. Nothing outside `.sdlc/` moved. The board, the plan file, `.sdlc/verdicts/`, the U5
handoff and the U5 question file were not touched. The reviewer wrote its report under `.sdlc/runtime/`,
which `.gitignore:15` ignores, so nothing it wrote enters a commit or a diff leg on this branch; the
committed copy of that report is `.sdlc/verdicts/records-followup-U11-review.md`, put there by
`3f6f1ebf`, `2026-09-20T15:48:31-07:00`, and carried on `main` @ `5c6a0c13`. That commit is 39
minutes 41 seconds earlier in wall-clock time than this handoff's last commit `698e8916` and is still
not reachable from it: `git merge-base --is-ancestor 3f6f1ebf 698e8916` exits non-zero and
`git cat-file -e 698e8916:.sdlc/verdicts/records-followup-U11-review.md` fails. Earlier in time is
not the same as reachable from here, and reachability is the test.

## For the Orchestrator

| Item | Ask |
|---|---|
| U5-8 | nothing to fold. Ruling R14 retires the row and opens #723 for the class; the section above is marked retired at its head, and its runs stay as evidence. The fetch precondition and the needle-list and reach limits recorded here are inputs to #723, not open asks against this unit |
| the tally source | pass 1's leg derived unit tallies from `[x]` ticks and certified the U11 verdict's R3 (front matter) rather than catching it. Leg A now reads `.sdlc/verdicts/` and compares a 🟢-marked tally against the green tally. NC7 is the control; it reds U11's own retired text |
| `.sdlc/board.md` | main's board read its U5 row 🟢 against a notes cell of `11 🟢 1 🟡 0 🔴` from `34173dd6` until `428f81ad` rewrote that cell; the R3 section above dates both and shows this branch's own board never carried it. The adapter makes the verdict authoritative. Out of this unit's scope; nothing here touched it |
| a stray untracked record | `.sdlc/verdicts/records-followup-U11.md`, the verifier's own file, sat untracked in `.worktrees/rf-U11` and is not gitignored, so `git status --short` printed `1` once the verifier had written it. The P1 gate row above reports the same command printing `0` in the same worktree; the two cannot describe one instant, and nothing recoverable orders them, because that worktree was removed and no timestamp was recorded for either read. A file at that path is committed on main at `428f81ad`, `2026-09-20T16:08:42-07:00`; that commit is not reachable from `698e8916` and records nothing about the `rf-U11` worktree, so it does not order the two reads either. Every commit here stages explicit paths, so it never entered one, but a landing that stages with `git add -A` would put it on this branch and break U5-6's file count |
| review 1b | leg B's strip was re-aimed, not narrowed: it closes the inline-marker hole and opens a precedent-form one the old strip lacked, which is the right trade because the precedent form is the ratified one, but a false claim written in that form is still exempt. Whether a cited-quote exemption should exist in a machine check at all is yours |
| review 2 | leg A's arithmetic has no reason to stop at `## Revisions`; only leg B's needles do. U11's own two rows live in the unread region, which is the sharpest argument for closing it |
| review 3 and 6 | the needle list and the `commit none` verdict both need widening before U5-8 is folded in; the needle-list limit is stated in this handoff already |
| review 4 and 5 | recorded as known limits: neither leg asserts, and `reach` measures edit volume rather than reading, so a whole-file write done as a create or a pure append scores `0%` |
| #722 | the live-facts rule does not exempt it, as the U5-4 section records, and `66d40f70` ranked it at row 14. The Orchestrator ruled no refresh, since a refresh would itself be the patch-claiming-a-read shape leg B exists to catch; the live-facts call on any issue opened later is yours |

## Correction, 2026-09-20, by records-followup U13

Repairs made in this file by U13: A14 and A16 under pre-land record pass 3's addendum, C1 to C12 from
the citation census, the pass 2 rows C13 to C15 under the per-claim rule stated after this table, C16
from pass 4, and pass 3's sweep of claims resting on commits `698e8916` cannot reach. Outside this section, every hunk
U13 made in this file carries a repair one of these rows or the pass 3 table records, or removes the
one prose line pass 2 names below.

| id | Was | Is | Derived from | Negative control |
|---|---|---|---|---|
| A14 | `Nine commits, four of them roadmap-only`, `The other five are this handoff`, and a `roadmap-commits:` front-matter line naming 4 shas | `Eleven commits, four of them roadmap-only`, `The other seven are this handoff`, and the same four shas in the front matter, unchanged | measured at `698e8916`, the commit this handoff was written at: `git log --format=%H 3ee3c72b..698e8916` counts 11, with `-- .sdlc/roadmap.md` counts 4, with `-- .sdlc/handoffs/records-followup-U11.md` counts 7. Listing each of the 11 commits' paths shows 4 touching the roadmap alone and 7 touching this handoff alone, so the split is measured and not inferred, and the front matter's four shas are exactly those 4 | the same commands from `1f991877` count 15 and 6; the four extra commits are U5's (`7dde8cb1`, `ee28fff6`, `6ee0fd8a`, `3ee3c72b`), which is why that range is not the one the sentence names. Run at the branch head `28426bf7` instead they count 14 and 7, which is the wrong clock: see the note below |
| A16 | `review:` at the front matter and one sentence in Scope cited `.sdlc/runtime/rf-U11-review.md` | both name `.sdlc/verdicts/records-followup-U11-review.md` on `main` @ `5c6a0c13`, and the Scope sentence keeps the true fact that the reviewer wrote under a gitignored path | `git cat-file -e 5c6a0c13:.sdlc/verdicts/records-followup-U11-review.md` succeeds, and that file's own header reads `head: 7b84d698`, `seat: reviewer`, and says it sat under `.sdlc/runtime/`, which `.gitignore:15` ignores | the same `git cat-file -e` for `.sdlc/runtime/rf-U11-review.md` fails at `main` @ `5c6a0c13` and at this branch's head, `.sdlc/runtime/` does not exist on disk in this worktree, and `.gitignore:15` is `.sdlc/runtime/`, so the retired path resolves at no ref |
| C1 | the R2 table's `Is` column read `13 issues`, total `13`, unranked `5`, and the derivation printed `5 (p)` summing to `13` | `14`, `14`, `6`, printed `6 (p)` summing to `14`, each named as read at `698e8916` | `git show 698e8916:.sdlc/roadmap.md` counts 14 ranked rows, and its own `Count:` and `inputs:` lines read `total 14` and `14 issues`. The Pri column at that sha is `6 (p)`, `4 P1`, `2 P2`, `2 P3` | the same commands at `3ee3c72b` give 13 rows and `total 10`, the defect R2 was opened for, so the measure moves with the sha. The row's fourth figure, `P0, P1, P2, P3 unchanged`, was re-derived and still holds at `4, 2, 2`, so it is graded and not repaired |
| C2 | R3 said `Both rows now read ten of eleven units 🟢 and name U11 as the unit in progress` three paragraphs above a passage saying both now read `nine of eleven` | the first passage is marked as pass 1's tick-derived figure and states that at `698e8916` both rows read `nine of eleven units 🟢` | `git show 698e8916:.sdlc/roadmap.md` matched for tally sentences returns `nine of eleven units 🟢` twice and `ten of eleven` only inside the revision log's narration of the retired claim | at `1fe53f5a` the same match returns `ten of eleven units 🟢`, which is the text verdict pass 1 graded 🔴, so the two states are distinguishable by command |
| C3 | the board paragraph and the `For the Orchestrator` row said `board.md`'s U5 row shows 🟢 against a notes cell of `11 🟢 1 🟡 0 🔴`, present tense | both sites place the claim on `main`, from `34173dd6` until `428f81ad` rewrote the notes cell, and state that neither commit is reachable from `698e8916`, whose board lists U5 ⚪ because the row predates U5's build | `git log main -S'11 🟢 1 🟡 0 🔴' -- .sdlc/board.md` returns `428f81ad` and `34173dd6`; `git merge-base --is-ancestor` exits `1` for each against `698e8916`; `git log -1 --format=%h 698e8916 -- .sdlc/board.md` prints `850f7fb1`, where the U5 row reads ⚪ and `not dispatched` | `git show 428f81ad^:.sdlc/board.md` prints the 🟢 row with the `11 🟢` notes, so the grep finds the claim where it lives. `428f81ad`'s own U5 row still reads 🟢, which is why pass 1's wording, reading the ⚪ at `698e8916` as that commit's reconciliation, joined two true clauses into a false conclusion |
| C4 | the R4 narration wrote `cited:` inside the quote span, the form this unit's own review finding 1a retired | the quote span followed by a separate `cited:` span, the precedent form | `.sdlc/adapter.md` §3 ratifies the adjacent-marker form, and `git grep -c -- '\x60 \x60cited:' 698e8916 -- .sdlc`, with `\x60` read as a backtick, returns six files using it | at `698e8916` the inline form appears in one file only, this one, with a count of `2`: the narration repaired here and the probe fixture below, which stays inline because the inline case is what it tests |
| C5 | R4 said the stale `Count:` line sat in the refresh diff as untouched context directly above the three rows | it appears only as git's section-heading text in the first hunk's `@@` header, with no context lines at `--unified=0` and 14 lines between `Count:` at line 25 and the insertion point at line 39 | the hunk headers already quoted in the R4 table are `@@ -38,0 +39,3 @@ Count: ...` and `@@ -111,0 +115 @@ Ruled by the owner ...`, which is git's section heading, not content | a `--unified=3` read of the same commit does print `Count:` as a context line, which is how the wrong description was arrived at; the R4 table states `--unified=0`, so the two readings are told apart by the flag the table itself names |
| C6 | the leg output block was headed `What it printed at the fix head`, naming no sha, and its `green=9` and tally-agreement lines read as current | headed with the run's sha and instant, `66d40f70` at `2026-09-20T16:02:56-07:00`, and stated as that run's output | its roadmap figures `rows 14` and `inputs 14` are re-derivable at `66d40f70` and still hold at `698e8916` | its `plan records-followup` line reads `origin/main`, which the reflog puts at `b8c3be8f` across the run's window, and that commit's plan and verdict files give the line's figures. Pass 3 retired this cell's earlier `went stale at 428f81ad` wording: `git merge-base --is-ancestor 428f81ad 698e8916` exits `1`, so that commit cannot make the record stale at its own commit |
| C7 | the correction to `strictly narrower` was credited to `b0003592`'s commit message | credited to `089e0e44`, whose subject is `docs(sdlc): the leg B strip was re-aimed, not narrowed (#709)` | `git log -S'strictly narrower' -- .sdlc/handoffs/records-followup-U11.md` returns `b0003592` as the commit that wrote the phrase and `089e0e44` as the one that removed it | `git log -1 --format=%B b0003592` contains `The new strip is strictly narrower`, so the commit the sentence credited repeats the retired claim rather than correcting it |
| C8 | `#722`'s row `shifted the revision log down by two lines` | moved it down by one line | `git show --numstat --format= 66d40f70 -- .sdlc/roadmap.md` prints `6	5`, six added against five deleted, net one | the regeneration `7dde8cb1` on the same file prints `54	52`, so the measure distinguishes a patch from a rewrite and is not returning a constant |
| C9 | `the inline form is not written anywhere in this repo` | written in exactly two places, both in this file, one of them repaired by C4 and one a fixture that must stay inline | `git grep -c -- '\x60cited: ' 698e8916`, with `\x60` read as a backtick, returns this file alone at `2` | the precedent form at the same sha returns six files, so the grep finds a form when one is there, and the claim's own file was the counter-example to it |
| C10 | U5-4's row reported the open-issue diff clean, unqualified | 🟡 at this handoff's own commit, with the margin stated | `#723` was created `2026-09-20T16:24:11-07:00` and `698e8916` was committed `2026-09-20T16:28:12-07:00`, 4 minutes 1 second later, and `git show 698e8916:.sdlc/roadmap.md` has no `#723` row | the diff was genuinely clean when the row was run, so the repair is a qualification and not a reversal. A rule that convicts at four minutes has to acquit at wider margins the same way, which is why the margin is recorded rather than the verdict alone |
| C11 | U5-6's rerun narration named `four` roadmap-touching commits in `BASE..HEAD` | six, each named | `git log --format=%h 1f991877..698e8916 -- .sdlc/roadmap.md` returns `66d40f70`, `1405ee77`, `354c2d7f`, `1fe53f5a`, `3ee3c72b`, `7dde8cb1` | the same command at `1fe53f5a` returns three, so the count tracks the sha. The four the sentence named are a subset missing `1405ee77` and `66d40f70`, both of them this unit's own later commits |
| C12 | the stray-record note said `git status --short` prints `1` while the P1 gate row reports `0` for the same command in the same worktree | the note is put in the past tense, says the two cannot describe one instant, and says nothing recoverable orders them | `.worktrees/rf-U11` was removed, neither read carries a timestamp, and no artifact records either tree state. A file at that path is committed on main at `428f81ad`, `2026-09-20T16:08:42-07:00`; that commit is not reachable from `698e8916` and records nothing about the `rf-U11` worktree, so it does not order the two reads either | the uncommitted-path class is structurally uncheckable after the fact, the same limit the census recorded for `roadmap.md`'s worktree row, so a stronger claim here would be unsupportable in either direction |
| A16 sharpened | the repair named only `main` @ `5c6a0c13` | it names `3f6f1ebf` at `2026-09-20T15:48:31-07:00` as the commit that tracked the report, 39 minutes 41 seconds before `698e8916`, and states that it is still not reachable from it | `git merge-base --is-ancestor 3f6f1ebf 698e8916` exits non-zero and `git cat-file -e 698e8916:.sdlc/verdicts/records-followup-U11-review.md` fails | the same two commands against `5c6a0c13` both succeed. Earlier in wall-clock time is not the same as reachable from here; reachability is the test, and the wall-clock reading is what graded this row `both halves false` |
| C13 | the Verdict row for review 1a and the R4 section said the `cited:` marker move and leg B's strip widening shared one commit | each names its own commit: `1405ee77` moved the marker in the roadmap and `b0003592` re-aimed the strip in this handoff | `git show --stat --format= 1405ee77` lists `.sdlc/roadmap.md` alone and `git show --stat --format= b0003592` lists this handoff alone; `b0003592`'s parent is `1405ee77` and both are ancestors of `698e8916` | `1405ee77`'s own message says the strip is widened `in the same change` and that the handoff carries the new command, which is how one commit came to be credited with both. The two file lists separate them at every anchor |
| C14 | the front matter read `plan-revision: 17` while the body applies owner ruling R14 | the value is kept and named as main's revision 17 at `7b59a29b`, beside the revision the plan reachable from `698e8916` stops at, 13, and main's revision 19 at `13f46583`, which records R14. No revision number is chosen for the record | `git log main --reverse --format=%h -S'revision 17,' -- .sdlc/plans/records-followup.md \| head -1` prints `7b59a29b`, and `git merge-base --is-ancestor 7b59a29b 698e8916` exits `1`; the same pair for `revision 19,` gives `13f46583` and exit `1`; `git show 698e8916:.sdlc/plans/records-followup.md` names no revision past 13 | the same `-S` for `revision 13,` prints `850f7fb1`, and `--is-ancestor 850f7fb1 698e8916` exits `0`, so the reachability test tells a revision this record can see from one it cannot |
| C15 | the Verdict row graded U5-4 🟢, the reruns narration opened `U5-4 is 🟢 at this head`, and the rule paragraph said `#722 alone failed it`, all while C10's row put U5-4 at 🟡 at `698e8916` | the Verdict row reads 🟡 for `#723` and keeps the `#722` half; the narration is scoped to `#722` and names `#723` as outside it | `gh issue view 723 --json createdAt` prints `2026-09-20T23:24:11Z`; `698e8916` is `23:28:12Z` and `ddfedb70`, the unit's latest earlier commit, is `23:05:13Z`; `git show 698e8916:.sdlc/roadmap.md \| grep -c '#723'` prints `0` | the same grep for `^\| 14 \| #722 ` prints `1`, so it finds a ranked issue when one is there; and both 🟢 sites were written at `5cac5623`, `23:04:32Z`, 19 minutes 39 seconds before `#723` was created, so they were true when written and false at the commit this file is graded at |
| C16 | the R4 section said an issue opened after `3ee3c72b` is the live-facts rule's case, a note for the verifier, and the `For the Orchestrator` row said the rule makes `#722` a note, while the Verdict row and the U5-4 section say the exemption does not apply and `#722` is ranked | the R4 sentence is attributed to the roadmap line it reports and named as contradicting that roadmap's row 14; the `#722` row says the rule does not exempt it and it is ranked, keeping the no-refresh ruling | `git show 698e8916:.sdlc/roadmap.md \| grep -c "live-facts rule's case"` prints `1`, and row 14 reads `the live-facts rule does not exempt it and U11 ranks it rather than noting it`; `grep -c '^\| 14 \| #722 '` prints `1` | both sites were written before `66d40f70` ranked `#722`, at `7b84d698` and `b0003592`; the pass 2 pattern `U5-4\|#723\|alone failed` returns neither, and the content pattern below returns both |

Rows C1 to C12 above and the A16 sharpening come from the citation census at
`.sdlc/verdicts/records-followup-roadmap-census.md`, leg 5, which followed 123 claims in this file
and returned 22 failures. Every one of them was re-derived here at `698e8916`, this file's own last
commit, and not at any branch head. Two of the 22 were repaired earlier in this unit as A14 and A16.
One claim is one figure or one sentence a single command returns, which is the rule this count uses
and which an earlier draft of this paragraph left unwritten. Under it, the thirteen rows above expand
to sixteen claims, because C1 carries four figures and every other row carries one: fifteen repaired,
and one, the R2 row's `P0, P1, P2, P3` figure, re-derived and still holding at `4, 2, 2`, so left
alone. The earlier draft said seventeen and sixteen, which no stated rule produces.

The census's own twenty-two does not reconstruct from its enumeration either: its bucket headed
`Stale before its own last commit, 12` names ten sites, as the U13 reviewer measured. Both counts are
unverifiable in both directions. An earlier draft of this paragraph closed by saying every line-site
leg 5 names has a row above. A row is not an edit: C3's row listed one site and its edit reached one
of the claim's two, so the map was complete and the file still contradicted itself. What this
section claims instead is narrower and is stated with the pass 2 rows below.

The first A14 repair, made earlier in this unit, was measured at the branch head `28426bf7` rather
than at `698e8916`, the commit this handoff was written at. It read 14 and 7 and it rewrote the
`roadmap-commits:` front matter to seven shas. The front matter was already right: at `698e8916` the
four shas it named were exactly that sha's roadmap commits. This correction re-derives both figures
at `698e8916` and restores the front matter. A record is graded at the commit it was written at,
never at the head, and the three extra roadmap commits the head carried (`f615f573`, `89d2057e`,
`28426bf7`) are not reachable from `698e8916`, the commit the Scope paragraph was written at, which is
what keeps them out of its count.

### Pass 2, per claim rather than per site

The U13 verdict found C3's claim stated at two sites and the edit at one. The rule this pass applies:
each repaired claim is searched for over the whole file before editing, every hit is either edited
or stated to be a different claim, and coverage is read from the diff, not from the rows above.
Line numbers are at `bb896a4e`, the head before this pass, and each search is `git show
bb896a4e:.sdlc/handoffs/records-followup-U11.md | grep -nE` with the pattern in the second column.

| claim | `grep -nE` over the file | hits | not edited, and why |
|---|---|---|---|
| A14, U11's commit counts | `Nine commits\|[Oo]ther five\|Eleven commits\|[Oo]ther seven are\|roadmap-only` | 463, 465, 503 | none; 503 is the row |
| A16, the review's path | `runtime/\|rf-U11-review\|gitignored` | 473, 489, 504 | 489, the verifier's file, is a different file |
| C1, the R2 figures | ``13 issues\|total `?13\|unranked `?5\|5 \(p\)\|sum to `1[34]` `` | 98, 333, 334, 337, 505 | 333, 334 and 337 are negative-control rows that mutate a 13-row roadmap |
| C2, the tallies | `ten of eleven\|nine of eleven` | 28, 116, 118, 120, 126, 296, 297, 305, 319, 336, 339, 340, 343, 346, 506 | 28 and 126 already read nine of eleven; 120 is pass 1 in the past tense; 296 to 346 are leg output and negative-control rows, each under a heading that dates it |
| C3, the board | `contradict\|11 🟢` | 129, 130, 133, 137, 308, 488, 507 | 137 is the R3 tally contradiction and 308 names no board |
| C4 and C9, the inline marker | `` `cited: \|inline form\|not written anywhere `` | 360, 382, 383, 508, 513 | 360 is the probe fixture C9 keeps inline; 383 is the grep C9 cites |
| C5, the `Count:` context | `untouched context` | 159, 509 | none; 159 is the repair's own retrospective clause |
| C6, the unnamed head | `fix head\|green=9` | 34, 296, 399, 510 | 34 and 399 head the reruns, a different measurement; its U5-4 row is C10 and C15, and its other rows were not re-graded here |
| C7, the credited commit | `strictly narrower\|b0003592` | 366, 370 to 373, 429, 511 | 429 is `b0003592`'s commit time |
| C8, the shift | `two lines\|shifted\|down by` | 376, 512 | none |
| C10 and C15, U5-4 | `U5-4\|#723\|alone failed` | 12, 33, 35, 180, 406, 424, 435, 465, 486, 514 | 12 and 465 are the pass 1 🔴 on `#722`, fixed at `66d40f70`; 33, 180 and 486 name `#723` as ticket |
| C11, the roadmap commits since `BASE` | `roadmap-touching` | 413, 515 | none |
| C12, `git status --short` | `git status --short` | 441, 489, 516 | 441 is the P1 reading that 489 now names as unordered against its own |
| the R2 prose line `No ranked row was added or dropped by U11` | `added or dropped\|unranked part` | none; the line was the one hunk at 100, removed | the census's correction 9 records it as false at `698e8916` |
| C13, the one-commit claim | `same commit\|one change` | 30, 173, 509 | 509 is C5's `--unified=3` read of the same commit |
| C14, the plan revision | `plan-revision\|revision 1[0-9]` | 6, 422 | 422 cites revision 15's content, which resolves on main at `0a0f0034`; it names no revision this record applies |

The coverage this section claims is that set and no wider: every claim in this table, repaired at
every hit its search returns or marked as a different claim. That covers a claim only where its
pattern matches the claim's content and not its row label. C15's matched the label and missed two
sites; pass 4 below searches by content and repairs them. The census is complete over the claims
it cites and not over every claim in the file, so it was the floor of this repair and not its scope, and nothing here
says the rest of the file holds.

### Pass 3, by dependency rather than by text

Pass 2 searched for each claim's wording. Pass 3 searches for what each claim rests on: every commit
this file cites that `698e8916` cannot reach, and every read of `origin/main`, a moving ref whose
commits it cannot reach either. The sweep is `grep -oE '\b[0-9a-f]{8}\b'` over the file, each hit that
is a commit tested with `git merge-base --is-ancestor <sha> 698e8916`, plus `grep -n 'origin/main'`. Line numbers are at `c442826b`,
the head before this pass. Where a claim is about another ref at an instant, reachability cannot
decide it and commit time is only a proxy, so the anchor used is this repo's reflog for that ref,
which is local and expires.

| rests on | lines | what it needed | done |
|---|---|---|---|
| `plan/gate-split`: `34ebbae6`, `0b02711b`, `50898d58`, `bf82ab11`, `7852ff12`, `7d811172`, `ebddc55d`, `a2bb3c84` | 31, 40, 48 to 53, 56, 57, 66, 73, 74, 80 to 83 | R1's `Every fact below precedes it` ordered another branch's commits against `7dde8cb1` by commit time | re-based on the reflog, `plan/gate-split@{2026-09-20 14:36:16 -0700}` = `7d811172`; the rest are what commands against the named branch printed, or quoted text, and name the ref they read |
| `34173dd6`, `428f81ad` on main | 130, 131, 132, 135, 292, 495, 496, 516, 519, 525 | C6 said the leg output went stale at `428f81ad` before this handoff's last commit; C12 offered `428f81ad` as the recoverable fact beside two unordered reads | C6 anchored to `b8c3be8f` by reflog, its figures re-derived there, the staleness claim retired; C12 states the commit is unreachable and orders nothing. C3's lines already state both commits unreachable |
| `3f6f1ebf`, `5c6a0c13` on main | 11, 483, 485, 513, 526 | nothing | A16 already states `3f6f1ebf` unreachable and names wall clock only as the contrast |
| `7b59a29b`, `13f46583`, `0a0f0034` on main | 6, 528, 581 | nothing | C14 already states them unreachable; `0a0f0034` is cited for revision 15's content |
| `f615f573`, `89d2057e`, `28426bf7` | 512, 548, 553, 554 | `did not exist when this paragraph was written` at 553 and 554, a wall-clock claim | restated as not reachable from `698e8916`; 512 and 548 already name `28426bf7` as the wrong clock |
| `bb896a4e` | 561, 562 | nothing | pass 2's line-number anchor, a descendant, makes no claim about `698e8916` |
| `origin/main`, no sha | 115, 123, 191, 290, 300, 519; 20, 227 and 263 define `BASE` and the leg's lookup order and claim no content | unanchored reads of a moving ref | anchored by reflog: `7b59a29b` and `b8c3be8f` for R3, `13f46583` for the `38 of the 55` figure, `b8c3be8f` for the leg line. Re-deriving R3 there found `the other seven` false, eight, and it is corrected |

What the sweep does not cover: claims resting on an issue's creation time, such as C10 and C15 on
`#723`, which no git ref records, and claims with neither a sha nor a ref named.

### Pass 4, by content rather than by label

Review pass 4 found C15's pattern keyed on its row label, so two statements of the `#722` exemption
claim, worded `a note for the verifier` and `makes it a note`, were never returned; that is C16. Pass 4
re-runs every claim's search on what the claim asserts, in any wording, over the body of the file
(lines before the Correction section) at `294f7937`, the head before this pass: `git show
294f7937:.sdlc/handoffs/records-followup-U11.md | awk 'NR<520' | grep -nE` with the pattern below.

| claim | content pattern | hits | new sites |
|---|---|---|---|
| A14 | `\b(four\|seven\|eleven\|nine\|five\|six\|fourteen\|fifteen)\b[^\|]{0,30}commits\|commits[^\|]{0,20}\b(four\|seven\|eleven\|nine\|five\|six)\b` | 487, 495 | none; both are the Scope paragraph A14 repaired |
| A16 | `reviewer'?s? (report\|file\|wrote)\|U11-review\|runtime/` | 11, 497, 499, 503 | none |
| C1 | ``\b1[34] (issues\|rows)\|total `?1[034]\|unranked\|\(p\)`` | 98, 100, 104, 107, 110, 111, 166, 234, 312, 338, 354, 355, 358 | none; 166 is a quoted hunk header, 234 leg code, 312 to 358 leg output and controls |
| C2 | `of (ten\|eleven) units\|tally` | 26 hits from 28 to 511 | none; beyond pass 2's, they are leg code, leg prose, the anchored R3 reads and past-tense quotes |
| C3 | `board` | 26, 46, 58, 75, 87, 140, 142, 144, 496, 512 | none; 26 to 87 are `plan/gate-split`'s board and 496 says the board was not touched |
| C4, C9 | `cited:\|inline` | 13 hits from 30 to 514 | none |
| C5 | `Count:` | 106, 166, 169, 171, 234 | none |
| C6 | `green=\|What it printed\|origin/main` | 22 hits from 20 to 463 | none; the leg line and the R3 reads are pass 3's anchors |
| C7 | `narrow\|re-aimed\|089e0e44\|b0003592` | 30, 187, 360, 384, 387, 389 to 394, 451, 514 | 30, which called the strip `widened` beside the file's `re-aimed, not narrowed`, now `re-aimed`; the C13 row likewise |
| C8 | `revision log\|shift\|down by` | 226, 397 | none |
| C10, C15, C16 | `#72[23]\|U5-4\|exempt\|live-facts\|note for\|makes it a note\|opened after\|minted` | 31 hits from 12 to 518 | 179 to 181 and 518, C16; 12, whose `fixed at 66d40f70` now says for `#722` and names `#723`. The rest are the `cited:` strip's exempt sets, ticket `#723`, and sites C10 and C15 already carry |
| C11 | `roadmap-touching\|roadmap commits\|BASE\.\.HEAD` | 434 | none |
| C12 | `git status\|untracked\|stray` | 465, 513 | none |
| C13 | `widen\|marker (moved\|move)\|same (commit\|change)` | 30, 516 | 30, as under C7; 516 is `needs widening` about a needle list |
| C14 | `revision [0-9]+\|plan-revision` | 6, 443 | 443, revision 15 cited with no ref; it now names main's `0a0f0034` and states it unreachable |
| R2 line | `ranked row\|added or dropped\|unranked part` | 165, 172 | none; a commit subject and a quoted diff description |

Two further sites came from the review's low notes, not from a pattern: `:34` and the reruns heading
said `the fix head` without naming it, and now name `24620ec9` and `1fe53f5a` with the rows rewritten
later.

The review's addendum lists fourteen sites resting on `428f81ad` or `34173dd6`, numbered at
`c442826b`. Reconciled against pass 3's table:

| review site at `c442826b` | pass 3 | pass 4 |
|---|---|---|
| `:129-137`, `:495`, `:516`, C3 | listed; they state both commits unreachable | nothing |
| `:290-293`, `:519`, C6 | listed and repaired: anchored to `b8c3be8f`, the wall-clock staleness retired. The review holds the wall-clock reading right for a moving ref; the Verifier's ruling, that `428f81ad` cannot make the record stale at a commit that cannot reach it, is the one applied | nothing |
| `:496`, `:525`, C12 | listed and repaired: the commit is stated unreachable and to order nothing, so it does not imply `698e8916` saw the file | nothing |
| `:191`, `38 of the 55` | listed and anchored by reflog to `13f46583` | adds that the tree is `428f81ad`'s and that the count is 37 of 52 at `698e8916` |
| `:12`, `:120-121`, `:271-273`, `:343`, `:472`, `:494`, the U11 verdict unnamed | missed: no sha and no ref is written, so neither of pass 3's searches could return them | the front matter now states once that the U11 verdict is on main from `428f81ad` and is not reachable from `698e8916`; each of the other five sites names the U11 verdict and points to it |

Pass 3 listed sites the review does not: the `plan/gate-split` reflog for R1, the R3 `origin/main`
reads, the A14 note, and the groups that already stated reachability. Neither list is complete by
construction: both searched for a written sha or ref, and the six verdict sites carry neither.

### Pass 5, the reflog as witness

Passes 3 and 4 anchor four claims about a moving ref to its reflog, because reachability from
`698e8916` cannot decide them. A reflog is local and expires, so each anchor is stated here in full:
the entries quoted verbatim, the commits that fall inside the window, and a reading outside the window
that differs. Every entry was read from this repo, whose common directory `git rev-parse
--git-common-dir` prints as the root checkout's `.git`, which the `rf-U13` worktree shares; none was
read from a clone.

| anchor | reflog entries, verbatim | commits inside the window | outside the window |
|---|---|---|---|
| the leg line, `origin/main` = `b8c3be8f` | `b8c3be8f refs/remotes/origin/main@{2026-09-20 15:50:52 -0700}: update by push` and the next, `428f81ad refs/remotes/origin/main@{2026-09-20 16:08:45 -0700}: update by push` | `66d40f70` at `16:02:56`, the roadmap the run read, and `5cac5623` at `16:04:32`, which first recorded the output | leg A's plan loop, run unchanged with its ref set to `b8c3be8f`, prints `units=11 merged=10 started=11 green=9 yellow=1 red=0 ungraded=1`, the recorded line; set to `428f81ad` it prints `green=10` and `ungraded=0`, because U11's verdict first exists there |
| R3's reads | `7b59a29b refs/remotes/origin/main@{2026-09-20 15:24:33 -0700}: update by push`, then `db718c18 refs/remotes/origin/main@{2026-09-20 15:47:45 -0700}: update by push`; and the `b8c3be8f` pair above | `24620ec9` at `15:25:08` inside the first; `5cac5623` inside the second | `62a21128 refs/remotes/origin/main@{2026-09-20 14:44:04 -0700}: update by push`, an earlier position: its plan has 10 units and 9 ticked, against 11 and 10 |
| `38 of the 55` | `13f46583 refs/remotes/origin/main@{2026-09-20 16:23:55 -0700}: update by push`, then `49077c67 refs/remotes/origin/main@{2026-09-20 17:41:00 -0700}: update by push` | `698e8916` at `16:28:12`, which committed the sentence | at `7b59a29b`, the count is 37 of 53 |
| R1, `plan/gate-split` = `7d811172` | `7d811172 plan/gate-split@{2026-09-20 14:35:09 -0700}: commit: sdlc(gate-split): U2 to U5 dispatched off the #681 tree at ebddc55d (#713)`, then `9276d4f0 plan/gate-split@{2026-09-20 14:40:03 -0700}: commit: sdlc(gate-split): U6-10, sets of record run at load under 5 (owner ruling) (#713)` | `7dde8cb1` at `14:36:16`, the regeneration R1 grades | `ebddc55d plan/gate-split@{2026-09-20 14:33:56 -0700}: commit (merge): sdlc(gate-split): merge plan/preset-intent-fidelity @ a2bb3c84, the #681 tree U2 to U5 build on (#713)`, the entry before: `plan/gate-split@{2026-09-20 14:35:00 -0700}` resolves to `ebddc55d`, where the four U2 to U5 board rows read ⚪ `not dispatched` against 🔵 with builder seats at `7d811172` |

The witness is allowed to acquit here for the reason it was allowed to convict in A4 of pre-land record pass 3: a
record of where a ref pointed is evidence in both directions or in neither.
