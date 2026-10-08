# adopt-hygiene U1 · pass 2 re-diagnosis

Re-diagnosed by sdlc-planner on 2026-09-16 against `unit/hygiene-U1` @ 9b7051e and `.sdlc/verdicts/adopt-hygiene-U1.md`. Read-only; the fixes below are for the builder. The fix is prototyped: the two replacement rows pass the new resolver check (0 findings), the current rows fail it (6 findings), and three planted faults each print one line.

## Root causes

| # | Failure | Cause | Who was wrong |
|---|---|---|---|
| 6 | export-schema row credits E1 to `#578`; adia row credits the landing to `PR #631` | `#578` is the E7 ticket (closed 2026-09-11 by PR #604) and `#631` is the adia ticket (closed by PR #633). Both numbers came from plan row 6 itself, which names "landing PRs (#578, #593, #631)": one PR and two tickets. The row also names E3 to E6 as SHA "pairs", and the first SHA of each pair (`5a0e438`, `918125f`, `8108717`, `28b6116`) is a branch tip reachable only from `origin/chore/57x-*`, not an ancestor of `main`; the verifier's "all on main" read was wrong for those four | all three: the plan carried two ticket numbers as PR numbers; the builder copied them and added branch tips as landings; the row-6 command only counts `complete` and `todo`, so it could not see a number that does not resolve (a vacuous check for the fact the row exists to record) |
| 7 | row-7 stale-path grep prints `1` | the match is `.sdlc/handoffs/adopt-hygiene-U1.md:27`, the handoff's own description of the move. The exclusion list already treats `.sdlc/verdicts` and `.sdlc/plans` as historical records and omits `.sdlc/handoffs`, which is the same class | plan only: the handoff wording is correct and dated; the exclusion list was incomplete |

## Landing table (established with `gh pr view`, `gh issue view`, `git merge-base --is-ancestor <sha> origin/main`, 2026-09-16)

| Plan | Step | Ticket | Real landing | Squash SHA on main | Evidence |
|---|---|---|---|---|---|
| export-schema | E1 group metadata | #572 | PR #592 | `9a9b9b2` | `gh pr view 592`: MERGED, mergeCommit 9a9b9b2 |
| export-schema | E2 controls meta | #573 | PR #593 | `bdc3b59` | `gh pr view 593`: MERGED, mergeCommit bdc3b59 |
| export-schema | E3 DS prime parity | #574 | PR #580 | `620ac4b` | MERGED; `5a0e438` is the branch tip, not on main |
| export-schema | E4 binder + consumer prose | #575 | PR #583 | `f291597` | MERGED; `918125f` is the branch tip, not on main |
| export-schema | E5 shadcn chart-6..8 | #576 | PR #581 | `1937f95` | MERGED; `8108717` is the branch tip, not on main |
| export-schema | E6 schema stamp | #577 | PR #595 | `44c84f3` | MERGED; `28b6116` is the branch tip, not on main |
| export-schema | E7 docs of record | #578 | PR #604, follow-up PR #605 | `848b80d`, `e026007` | #578 closing comment 2026-09-11: "Closed by #604 (merged, 848b80d) ... two accuracy findings ... fixed in follow-up PR #605"; `gh pr view 578` cannot resolve (it is the ticket) |
| adia | 1 to 6 generator, artifacts, gate, repo gates, hashes, PR | #631 | PR #633 | `14c4260` | `gh pr view 633`: MERGED 2026-09-13, mergeCommit 14c4260; `gh api commits/14c4260/pulls` returns #633; `gh pr view 631` cannot resolve (it is the ticket). The brief's "no PR" was wrong |
| adia | 7 tags | #631 | tags `adia-oklch-export@1.0.0`, `adia-radix-export@1.0.0` | both point at `14c4260` | `git rev-list -n1 <tag>` |
| adia | 8 record | #631, #618 | issue #631 comment "Merged and tagged" 2026-09-13T05:44:18Z; issue #618 comment 2026-09-13T05:44:20Z naming both tags and 14c4260 | n/a | `gh issue view 631 --json comments`, `gh issue view 618 --json comments` |

## Fixes (smallest correct)

**Export-schema row, `docs/plan/archive/plan-2026-09-export-schema-revision.md:221`.** Replace the whole `| 2026-09-16 |` row with:

```
| 2026-09-16 | status flipped active to complete; all seven E-steps ticked done; file archived to `docs/plan/archive/` | closed on landing of PR #592 (E1, `9a9b9b2`), PR #593 (E2, `bdc3b59`), PR #580 (E3, `620ac4b`), PR #583 (E4, `f291597`), PR #581 (E5, `1937f95`), PR #595 (E6, `44c84f3`), PR #604 and PR #605 (E7, `848b80d`, `e026007`), each squash-merged to `main` 2026-09-11, per `.sdlc/adapter.md` §5 and `.sdlc/debt.md` R4 (adopt-hygiene plan, U1) |
```

**Adia row, `docs/plan/archive/plan-2026-09-adia-derived-export-artifacts.md:308`.** Replace the whole `| 2026-09-16 |` row with:

```
| 2026-09-16 | status flipped active to complete; all eight steps ticked done; file archived to `docs/plan/archive/` | closed on landing of PR #633 (`14c4260`, squash-merged to `main` 2026-09-13, steps 1 to 6); tags `adia-oklch-export@1.0.0` and `adia-radix-export@1.0.0` at `14c4260` (step 7); the issue #618 comment and issue #631 Findings of 2026-09-13 (step 8); per `.sdlc/adapter.md` §5 (adopt-hygiene plan, U1) |
```

Convention the rows now follow, and the check enforces: every `#N` is written `PR #N` or `issue #N`; every SHA is a squash commit on `main`, in backticks; branch tips are not landings. Nothing else in either file changes (the step ticks are right: every step has a landing above). The handoff is not edited; row 7's fix is in the plan.

## Commands that must go green (run in `.worktrees/hygiene-U1`)

| # | Command | Expected |
|---|---|---|
| 6 | plan row 6 as written (`ls`, `ls archive`, `status` count, `todo` count) | `0`, `3`, `2`, `0` and `0` |
| 6 | the resolver block below, over `docs/plan/archive/plan-2026-09-*.md` | no output |
| 7 | plan row 7 with `':!.sdlc/handoffs'` appended to the `git grep` exclusions | `moved`, `1`, `0` |
| P1 | `npm test`, `git status --porcelain \| wc -l` | green, `0` |

Resolver block (prototyped at `$CLAUDE_JOB_DIR/tmp/check.sh`; paste into the plan as the row-6 second command):

```sh
for f in docs/plan/archive/plan-2026-09-*.md; do
  row=$(sed -n '/^## Revisions/,$p' "$f" | grep '^| 2026-09-16')
  all=$(printf '%s' "$row" | grep -oE '#[0-9]+' | wc -l); typed=$(printf '%s' "$row" | grep -oE '(PR|issue) #[0-9]+' | wc -l)
  [ "$all" -eq "$typed" ] || echo "$f: $((all-typed)) untyped #N"
  for n in $(printf '%s' "$row" | grep -oE 'PR #[0-9]+' | tr -dc '0-9\n' | sort -u); do
    [ "$(gh pr view "$n" --json state -q .state 2>/dev/null)" = MERGED ] || echo "$f: PR #$n not a merged PR"
  done
  for n in $(printf '%s' "$row" | grep -oE 'issue #[0-9]+' | tr -dc '0-9\n' | sort -u); do
    gh issue view "$n" --json number >/dev/null 2>&1 || echo "$f: issue #$n does not resolve"
  done
  for s in $(printf '%s' "$row" | grep -oE '`[0-9a-f]{7}`' | tr -d '`' | sort -u); do
    git merge-base --is-ancestor "$s" origin/main 2>/dev/null || echo "$f: $s not on origin/main"
  done
done
```

Prototype results (2026-09-16): corrected rows print nothing; the rows at 9b7051e print 6 lines (`PR #631 not a merged PR`, `2 untyped #N`, four `not on origin/main`); planting `PR #578` for E1 prints 1 line, untyping `#633` prints 1 line, swapping `620ac4b` for `5a0e438` prints 1 line. Row-6's `complete`/`todo` greps still read `2` and `0` on the corrected files. The block needs `gh` auth and `origin/main` fetched, as the verifier already had.

## Plan revisions (append to `.sdlc/plans/adopt-hygiene.md` §U1 and its revision log)

| Row | Revised text |
|---|---|
| 6 | Criterion: replace "with a revision row naming the landing PRs (#578, #593, #631)" with "with a revision row in which every `PR #N` is a merged PR, every `issue #N` resolves, every `#N` is typed one of those two ways, and every backticked SHA is a squash commit on `main` (branch tips are not landings)". Command: append `; ` and the resolver block above. Expected: `0`, `3`, `2`, `0` and `0`, then no output. Negative control: replace with "`origin/main`: two files in `docs/plan/`, no archive dir, `todo` counts `8` (adia) and `7` (export-schema); and the block on the rows at 9b7051e prints 6 lines (`#631` is the ticket, `#578` is the E7 ticket, four branch-tip SHAs), or on a scratch copy with `PR #592` changed to `PR #578` prints exactly one line" |
| 7 | Command: append `':!.sdlc/handoffs'` to the `git grep` exclusion list. Expected and negative control unchanged (base `b885e67` still prints `3`). Rationale: `.sdlc/handoffs` is a historical record like `.sdlc/verdicts` and `.sdlc/plans`, both already excluded; `.sdlc/handoffs/adopt-hygiene-U1.md:27` describes the move and is not a live pointer |
| log | `2026-09-16 · U1 pass 2: row 6 drops the two ticket numbers it called PRs and adds a resolver (counting complete/todo cannot see a number that is not a PR; four E3 to E6 SHAs were branch tips); row 7 excludes .sdlc/handoffs · verdict adopt-hygiene-U1 🔴, re-diagnosis .sdlc/plans/adopt-hygiene-U1-p2.md` |
