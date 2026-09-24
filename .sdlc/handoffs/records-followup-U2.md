kind: handoff
unit: U2
plan: records-followup (#709)
worktree: .worktrees/rf-U2
branch: unit/rf-U2
head_before_commit: 5361bc79c11fc6697fa72e2fb0fa15b909e1c9b3

## What changed

- `.sdlc/architecture.md` §4: rows `X1`..`X6` renamed to `XC1`..`XC6`; header sentence `(A-, T-, P-, X-, L- ids)` -> `(A-, T-, P-, XC-, L- ids)`; one dated note appended directly under the §4 table per §Texts, verbatim.
- `.sdlc/debt.md`: rows C5 and C6, last cell, clause `the shared prefix that made this a reading hazard is gone` replaced per §Texts with the corrected clause naming the XC1-XC6 rename and the still-shared 2026-09-16 survey collision. Row C7 untouched (as directed).

Nothing else touched. No file outside `.sdlc/architecture.md` and `.sdlc/debt.md` was edited.

## Sweep for X-token collisions (both directions)

- Swept `.sdlc/adapter.md` for its own `X1`-`X13` conflict-id series: untouched, confirmed still present and distinct from the renamed architecture rows (adapter uses `X<n>` for its own conflict ids, a different series per the plan's own decision; not in scope for U2).
- Confirmed no other file cites architecture's old `X1`-`X6` as architecture rows (the plan says "nothing outside architecture.md cites its X rows except its own verdict, which is history" - `.sdlc/verdicts/architecture.md` intentionally left ungraded/unrewritten per the appended note).
- `git grep -P '(?<![A-Za-z0-9-])XC[0-9]+(?![0-9A-Za-z])' d34b4fb1 -- .sdlc .claude README.md` -> `0` lines: confirmed `XC` prefix was free before this unit.

## Criteria, commands run, and actual output

`BASE=d34b4fb1` (the plan's pre-plan base, confirmed by reproducing the plan's own d34b4fb1 measurements: `X[0-9]+` sweep gave 104, and `debt.md` "reading hazard is gone" count gave 2, matching the plan's stated negative controls exactly). `UB=$(git merge-base plan/records-followup HEAD)` = `5361bc79c11fc6697fa72e2fb0fa15b909e1c9b3` (U1's merge commit, same as this worktree's start).

1. Seven-file sweep for ids defined twice:
   `for f in adapter architecture baseline debt survey roadmap board; do perl -ne 'print "$1 $ARGV\n" if /^[|] ([A-Z]{1,3}-?\d+[a-z]?) [|]/' .sdlc/$f.md; done | sort -u | awk '{n[$1]++} END{for(i in n) if(n[i]>1) print i}' | sort -V | paste -sd, -`
   Printed: `C1,C2,C3,C4,C5,C6,C7,K9,K11,K14,K17,K18,P1,P2,P3,P4`
   Matches expected exactly. No X id present (P ids remain, expected until U7 merges).

2. New prefix owned by nobody before this unit:
   `git grep -P '(?<![A-Za-z0-9-])XC[0-9]+(?![0-9A-Za-z])' $BASE -- .sdlc .claude README.md | wc -l | tr -d ' '`
   Printed: `0`. Matches expected `0`.

3. Rename is the only change to the map:
   `diff <(git show $UB:.sdlc/architecture.md) <(perl -pe 's/(?<![A-Za-z0-9-])XC([1-6])(?![0-9a-z])/X$1/g; s/XC-, L- ids/X-, L- ids/' .sdlc/architecture.md) | grep '^[<>]' | grep -vc '^> Renamed 20\|^> $'`
   Printed: `0`.
   `awk '/^## 4\. /{s=1} /^## 5\. /{s=0} !s' .sdlc/architecture.md | grep -cE 'XC[0-9]'`
   Printed: `0`.
   Matches expected `0`, `0`.

4. Six rows and note present, no X-headed row left in §4:
   `awk '/^## 4\. /,/^## 5\. /' .sdlc/architecture.md | grep -oE '^[|] XC[0-9]+ [|]' | tr -d '\| ' | paste -sd, -`
   Printed: `XC1,XC2,XC3,XC4,XC5,XC6`
   `awk '/^## 4\. /,/^## 5\. /' .sdlc/architecture.md | grep -cE '^[|] X[0-9]+ [|]'`
   Printed: `0`
   `grep -c '^Renamed 20[0-9-]* (plan records-followup U2, #709)' .sdlc/architecture.md`
   Printed: `1`
   Matches expected exactly.

5. Debt notes stopped claiming the hazard is gone:
   `grep -c 'reading hazard is gone' .sdlc/debt.md` -> `0`
   `grep -c 'renamed those rows XC1 to XC6' .sdlc/debt.md` -> `2`
   `git diff -U0 $BASE -- .sdlc/debt.md | grep -v '^--- ' | grep '^-' | grep -vcE '^-\| (C5|C6|K17) \|'` -> `0`
   Matches expected `0`, `2`, `0` exactly.

6. Plugin id check still accepts the tree:
   `PLUGIN=/Users/kimba/.claude/plugins/cache/nonoun/sdlc/0.1.0` (the target of the `core.hooksPath` symlink, `/Users/kimba/.claude/plugins/cache/nonoun/sdlc/0.1.0/githooks`, two levels up).
   `git -C "$PLUGIN" show plan/drill-findings:plugins/sdlc/scripts/board.py > "$F/board.py"; python3 "$F/board.py" ids .sdlc; echo "exit $?"`
   Printed: nothing, `exit 0`.
   Matches expected exactly.

All 6 criteria are met, each measured directly, none copied from the plan.

## Additional gates run (plan-level, docs-only unit still under P1/P4/P6)

- `EM=$(printf '\xe2\x80\x94'); git diff -U0 -- .sdlc | grep '^+' | LC_ALL=C grep -c "$EM"` -> `0` (no em dash added).
- `node test/repo/branding.mjs | tail -3` -> `branding: clean (466 files scanned)`.
- Host load at time of these runs: `load averages: 13.95 28.74 37.49` (uptime), 38 chrome-related processes running (unrelated agents). Ran `npm test` once as required by the plan-level P1 gate (see below).

## npm test (P1 gate, run once)

Command: `npm test 2>&1 | tail -5`
Host load immediately before: `load averages: 10.15 25.91 36.04` (uptime, shared host running many concurrent agents).
Printed: `✓ all 48 test files passed`.
Tree after: `git status --short` shows only this unit's own changes (`.sdlc/architecture.md`, `.sdlc/debt.md`, the new handoff), nothing regenerated dirty.

## Files changed

- `.sdlc/architecture.md`
- `.sdlc/debt.md`

## Not in scope (per plan)

The sweep's other 16 shared ids (debt/survey `C1`-`C7`, debt/architecture `P1`-`P4` left for U7, the five K rows) are Not in scope for U2 and were not touched, confirmed by criterion 1's output still listing them unchanged from the plan's stated expectation.

## Questions

None. All criteria measured green with the literal §Texts wording; the diff matches the U2-3 checkability verdict's already-confirmed reading.
