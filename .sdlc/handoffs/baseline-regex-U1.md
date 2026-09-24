# U1 handoff: baseline-regex (#718), measured at 2db27763

The fix: `.sdlc/checks/baseline-agrees-check.sh`'s time loop now reads every `N to M s`
occurrence in a gate's adapter cell with `matchAll(/(\d+) to (\d+) s/g)` and requires every one
of them to equal the baseline's rounded min and max, in place of the old non-global `match` that
only ever saw the first occurrence. Exactly the two lines named in the plan's §Texts changed;
nothing else in the file. Head sha `2db27763` (code commit only; this handoff is a separate
commit per the plan's division of labour).

Every control that plants a change ran in a throwaway `git clone -q --shared` clone under this
session's scratchpad, never in this unit worktree. Each clone was made after the code commit, so
`git clone`'s checkout of HEAD carries the fix (a clone of an unstaged edit would silently run the
pre-fix script and read as a false red).

| # | Criterion | Command output | Negative control output |
|---|---|---|---|
| U1-1 | matchAll present, old `.match` gone | `1`, `0` | (before the fix, at `c944fe18`: `0`, `1`, matching the plan's "before" row) |
| U1-2 | reproduction of #718: clean tree unaffected, planted second range on `test` goes STALE. Plant fidelity asserted (per the checkability hardening): `.sdlc/adapter.md`'s md5 before/after the `sed` differ and the marker text is present, so a silent no-op would read as a broken plant, not a passed fix | `clean tree exit: 0`; plant fidelity: `` `plant landed: hash changed 19ad535100a19a0cc4fb3537edb15da1 -> c7f429fc74905091a7de440e9c3498a6, marker text present` ``; `` `STALE time test: baseline 56 to 60 s, adapter 56 to 60 s, 280 to 550 s` ``; `planted tree exit: 1` | n/a, this block IS the fixed-vs-unfixed comparison; the "before" reading (unfixed script, same clone shape, same asserted plant) is `` `ok    time test: baseline 56 to 60 s, adapter 56 to 60 s` ``, `planted tree exit: 0`, the defect itself |
| U1-3 | not a `test`-row special case: planted second range on `build` also goes STALE. Plant fidelity asserted the same way | plant fidelity: `` `plant landed: hash changed 19ad535100a19a0cc4fb3537edb15da1 -> 76f85c117b5b5fa2875c78bb24e61dbc, marker text present` ``; `` `STALE time build: baseline 1 to 3 s, adapter 1 to 3 s, 9 to 9 s` ``; `exit: 1` | unfixed script, same clone shape, same asserted plant: `` `ok    time build: baseline 1 to 3 s, adapter 1 to 3 s` ``, `exit: 0` |
| P1 | `npm test` green, no `node_modules`, tree byte-stable | run fresh in this unit worktree: `` `✓ all 48 test files passed` ``, then `1` (`git status --short` counted only this handoff file, `.sdlc/handoffs/baseline-regex-U1.md`, itself untracked at run time; every asset `npm test` regenerates was byte-stable, `0` lines of drift) | not rerun as a negative control this session (standing repo control per adapter §1, last independently run at `d34b4fb1`); the `scrimX` plant is not this unit's to replant |
| P4 | branding gate clean (N not pinned, per the hardening) | `` `branding: clean (521 files scanned)` ``, `exit 0` | in a clone: `cp docs/reference/references/decision-records.md docs/x.md`, rerun: `` `FAIL: 3 branding violation(s) across 522 files` ``, `exit 1` |
| P5 | scope wall: only the wall's paths differ from the merge base, tracked or untracked, read from the unit worktree | `0` | four independent plants in a clone, each read `1`: one byte appended to `.sdlc/adapter.md`; a new `.sdlc/checks/new.sh`; an off-wall-named `.sdlc/verdicts/k17-rerun-baseline-regex.md`; a second plan file `.sdlc/plans/baseline-regex-extra.md` |
| P6 | no em dash added in prose | `0` | fixture: a `+` line under `.sdlc/` carrying U+2014 outside a backtick span reads `1`; the same byte inside a backtick span reads `0` |

## Files changed

- `.sdlc/checks/baseline-agrees-check.sh` (the four-line replacement inside the time loop, per §Texts, commit `2db27763`)
- `.sdlc/handoffs/baseline-regex-U1.md` (this file, separate commit)

## branding gate

`node test/repo/branding.mjs` last line: `branding: clean (521 files scanned)`.

## Notes for the reviewer and verifier

- P1 (`npm test`) ran fresh in this unit worktree, per the plan's own §Risks note that the
  planner's ≤1 concurrent-process threshold does not bind the builder the same way in an isolated
  worktree. The host's lane rule held at `pgrep -f 'node .*test/(run|engine|ui)' | wc -l` == 4
  through most of this session (other seats' units, plus a five-minute team-lead-declared quiesce
  for an unrelated lane's gate); the run above happened once the quiesce lifted and the count
  dropped to 1 immediately after, which the reader can take as this run's own exit clearing the
  count, not evidence a fresh run needs a literal 0 first.
- U1-2's and U1-3's clones were made from this worktree's HEAD *after* the code commit
  (`2db27763`); an earlier clone taken before committing silently ran the pre-fix script (`git
  clone` only checks out committed history, not an uncommitted working-tree edit) and gave a
  false "still ok" reading on the planted tree. Recorded here in case a future run of these blocks
  is tried again before committing and produces the same confusing false negative.
- `.sdlc/adapter.md` and `.sdlc/baseline.md` were never modified in this worktree or the shared
  root checkout; every plant against them happened in a throwaway clone under the scratchpad and
  was discarded, never committed, never `git checkout --`'d back into a tracked tree because it
  was never in one.
