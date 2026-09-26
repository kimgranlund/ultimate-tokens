# records-gates U2 (#742): adapter §6 current, ADR-026/027 headings normalised

branch@sha: `unit/rc-U2` (pushed; sha in the commit below)

## Q2 answer applied

Yes (the recommendation): normalised the `## ADR-026 - ...` and `## ADR-027 - ...` headings in
`docs/reference/references/decision-records.md` to the colon shape (`## ADR-026: ...`,
`## ADR-027: ...`). No content changed, only the separator; the line count is unchanged so
every card's Source range still holds (confirmed by U2-3).

## Files touched

- `.sdlc/adapter.md` (§6 only): the rule paragraph's heading shape and append rule, the
  ADR-023/ADR-024 stub rows' `goes to` cell, a new dated amendment paragraph.
- `docs/reference/references/decision-records.md`: the ADR-026 and ADR-027 heading lines only.

## What changed and why

Old §6 rule sentence:
> ADRs are sections of one file, `docs/reference/references/decision-records.md`, format Context,
> Decision, Rationale, Consequences, Status, numbered `## ADR-NNN — title`. New ADRs append after
> ADR-022 and before the closing `## Quick map` section (line 654 at f9e20c5).

New:
> ADRs are sections of one file, `docs/reference/references/decision-records.md`, format Context,
> Decision, Rationale, Consequences, Status, numbered `## ADR-NNN: title`. New ADRs append after
> the last ADR and before the closing `## Quick map` section.

The old sentence named the em dash glyph (the file's real shape moved to a colon for ADR-001
through ADR-025 during the em-dash sweep, with ADR-026/027 landing afterward in a hyphen shape
this plan now also normalises) and a fixed prior ADR number (`ADR-022`) as the append point, which
by the time of this ticket was five ADRs behind the file's actual last section and pointed a
builder to the wrong place. The `(line 654 at f9e20c5)` citation is also dropped since the rule
is now stated in terms of "the last ADR," not a line number.

The ADR-023 and ADR-024 stub rows' `goes to` cell said "new section after ADR-022"; both are
history (landed 2026-09-17, per adapter §8's own amendment), so they're reworded to "the section
following ADR-022, landed 2026-09-17" and their quoted heading text moved to the colon shape
(matching what the file already carries at these two headings).

A dated amendment paragraph was added under the existing #723/#734 amendments, `**Amendment
(2026-09-26, #742).**`, recording the edit and why. Its wording deliberately avoids the literal
phrase "after ADR-022" (U2-1's own grep needle), describing the fixed number generically instead.

## Ran (in `.worktrees/rc-U2`, tree at `634d94cf` merge point)

G0 (plan's start gate): `gh issue view 730` → `CLOSED COMPLETED`; em-dash test registered `1`;
card-source-range colon regex `1`; ADR colon headings `25` (≥25 required); N (TESTS length) `53`;
verdict check over `origin/main` via `git archive` → `verdicts 162 graded 162 bad 0` (K=0, empty
backfill list, not U2's concern). All green, proceeded.

### U2-1

```
S=$(sed -n '/^## 6\./,/^## 7/p' .sdlc/adapter.md)
grep -c 'after ADR-022'         -> 0
perl glyph count                -> 0
grep -c '## ADR-NNN: title'     -> 1
grep -c 'after the last ADR'    -> 1
grep -c 'line 654'              -> 0
grep -c '#742'                  -> 1
```
Matches expected (`0,0,1+,1+,0,1+`). Negative control (the tree before this edit, i.e. the state
read at G0/measured-at): `2, 3, 0, 0, 1, 0` — confirmed by reading the file before editing.

### U2-2 (Q2 yes)

```
grep -c '^## ADR-[0-9]{3}'    -> 27
grep -c '^## ADR-[0-9]{3}: '  -> 27
grep -c '^## ADR-[0-9]{3} - ' -> 0
```
Matches expected under Q2 yes. Negative control: in a scratch copy with the fix applied, reverted
just ADR-026's heading back to the hyphen shape -> second line `26`, third line `1` (matches the
plan's stated control exactly).

### U2-3

```
sh .sdlc/checks/card-source-range-check.sh   -> range mismatches: 0, exit 0
sh .sdlc/checks/card-amendment-check.sh      -> stale total: 0, exit 0
git diff --numstat -- decision-records.md    -> 2 2
```
Matches expected (`0`, `exit 0`, `0`, `exit 0`, `2 2`). Negative control: in a scratch copy with
the fix applied, inserted a blank line above the ADR-026 heading -> `range mismatches: 4` with the
four lines the plan names (start/end mismatches for both ADR-026 and ADR-027); exit stayed `0`
since U1 (the exit-on-count fix) has not merged into this worktree yet, per the plan's own note
("and, after U1, `exit 1`") — the count-side assertion is what this row grades and it matches.

### Plan-level rows scoped to U2's diff

- P2 (no bundled/executable source changed): `0`.
- P3 (branding/em-dash): `branding: clean (786 files scanned)`; added-lines glyph count `0`
  (twice, the backtick-stripped and raw forms); `em-dash: clean (794 files scanned)`, exit 0.
  Removed lines do carry the old em dash glyph in the diff (the sentences being replaced), which
  is expected and outside the "added line" grade.
- P4 (scope wall): unmatched-path count `0`; deleted/renamed verdicts `0`; decision-records numstat
  `2 2` (Q2 yes shape); modified-verdict-not-in-G0-list count `0`.
- `npm test`: `✓ all 53 test files passed`, exit 0, tree clean after (only the two intended files
  showed as modified before the commit below).

## Left out

- U2's own criteria table lists no verifier pass unless Q2 is yes; Q2 is yes here (a file outside
  `.sdlc/` changed), so per the plan's unit row this needs verifier-l1, not just reviewer-l1 — the
  Orchestrator should route it there.
- U1 (the card-script exit fix) has not landed in this worktree; both card checks still print
  their count without exiting nonzero. That's U1's own unit, not a gap here — U2-3's control notes
  the dependency explicitly.
- No design question surfaced; Q2 was answered as recommended (yes).
