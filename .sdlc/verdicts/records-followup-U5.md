---
kind: verdict
plan: records-followup
unit: U5
branch: plan/records-followup-roadmap
sha: 3ee3c72b
verdict: 🟡
written: 2026-09-20
seat: verifier
---

# Verdict records-followup U5 · 🟡 11 🟢, 1 🟡, 0 🔴, 1 ⚪

| Field | Value |
|---|---|
| Unit | U5, F5, the roadmap regenerated from live facts |
| Graded at | `plan/records-followup-roadmap` @ 3ee3c72b (pass 2). Pass 1 graded the unit head ee28fff6 |
| BASE | 1f991877 |
| Evidence | three independent runs at the unit head and this seat's own at the refreshed head, all in fresh context. They agree on every figure |
| Blocks landing | no |
| Not done | I did not commit. This record is untracked, inside the wall, and moves neither U5-6 nor P5 |

## Pass 1, at the unit head ee28fff6

Graded 11 🟢, 1 🟡, 0 🔴. The 🟡 was U5-4: issue #718 opened 2026-09-20T21:45:38Z, nine minutes and
twenty-two seconds after the roadmap commit 7dde8cb1 at 21:36:16Z, so the roadmap carried no row for it.
The plan's live-facts rule makes an item created after the unit's commit time a 🟡 the Orchestrator
refreshes at landing, not a 🔴. Everything else read its expected value with a control that bit.

I refused to carry any row forward from the earlier head 5c09855a, which the owner's retirement of
roadmap Q2 superseded: U5-6, P4, P5 and P6 are whole-branch measures, `npm test` reads `.sdlc/` through
`repo/branding.mjs` which is in the `TESTS` list, and U5-2 to U5-4 read live facts that move on their own.

## Pass 2, at the refreshed head 3ee3c72b

The refresh added ranked rows for three issues, not one, and U5-6 was reworded under owner ruling R5
(plan revision 14) so that it counts roadmap-only commits rather than exactly one commit.

I read the rewording before regrading. It resolves a genuine conflict: U5-4 wanted a row for #718 while
U5-6 as written demanded exactly one roadmap commit, so at the branch head one of the two had to fail.
The ruling records the options offered, including grading U5-6 at the unit head and taking no refresh.
The substance is preserved, every commit touching the roadmap must touch only the roadmap, and the
control still bites. I accept it.

| # | Criterion | State | Evidence at 3ee3c72b | Negative control |
|---|---|---|---|---|
| U5-1 | one head sha, and it is on main | 🟢 | `1`, `anc 0` | the BASE roadmap names two shas: `2`, then the ancestor test errors, `anc 128` |
| U5-2 | the worktree table is the live set | 🟢 | `diff 0`, seven names | live set against the BASE roadmap: four `>` and three `<`, `diff 1` |
| U5-3 | the stated count is the row count | 🟢 | `7`, `7` | the BASE roadmap: an empty first line, then `8` |
| U5-4 | one ranked row per open issue, none for a closed one | 🟢 | `diff 0`. The refresh cleared pass 1's 🟡 | live issues against the BASE roadmap: nine `>` and six `<`, `diff 1` |
| U5-5 | no unanswered prompt is left in the file | 🟢 | `0`, `0` | the BASE roadmap: `1`, `2` |
| U5-6 | alone: every roadmap-touching commit touches only the roadmap | 🟡 | met: under bash the middle leg prints `.sdlc/roadmap.md` and nothing else across both roadmap commits, 7dde8cb1 and 3ee3c72b; the branch's three paths are the roadmap, the handoff and the questions file; `branding: clean (507 files scanned)`, `exit 0`; `0` raw dashes. See the concern below | a clone commit staging `.sdlc/debt.md` with the roadmap prints `.sdlc/debt.md,.sdlc/roadmap.md`, so the reworded form still bites. With no roadmap commit, `nonempty 1` reds the row |
| U5-7 | debt ids cited as `debt.md` defines them after U7 | 🟢 | `0`, `1` | the BASE roadmap: `1`, `0` |
| P4 | branding gate clean | 🟢 | `branding: clean (507 files scanned)`, `exit 0` | records doc copied into `.sdlc/verdicts/` in a clone: `FAIL: 3 branding violation(s)` |
| P5 | scope wall | 🟢 | `0`; `1`; the third leg prints nothing | a probe appended under `src/` in a clone: first leg `1` |
| P6 | no em dash added in prose | 🟢 | `0` | the plan's own fixture: `1`, `0`, `2`, and `4` without the strip |
| P7 | the baseline's test-file figure equals `TESTS.length` | 🟢 | every counted line `ok`, `stale total: 0`, `exit 0` | baseline figure moved 48 to 47 in a clone: `STALE tests: baseline 47, test/run.mjs TESTS 48`, script exit `1` |
| P1 | `npm test` green, tree byte-stable | ⚪ | not required here. The plan's PR 2 landing rule lists the gates as U5-1 to U5-7, P4, P5, P6 and P7 and says `npm test` is not rerun for a one-file `.sdlc/` change unless the branding gate reds. Branding is clean, measured above, and the only coupling from a records edit to `npm test` is `repo/branding.mjs`. Measured green at the unit head ee28fff6: `all 48 test files passed`, `TESTS` `48`, tree `0`, 336 s at load 54 to 238 | the role table key renamed in a clone: `exit 1`, three `FAIL` lines, `1/48 test file(s) failed` |

Tree clean at this head: `git status --short` prints `0`.

## The 🟡 on U5-6

The reworded command is shell-dependent, and in the seat's default shell the decisive leg silently
prints nothing.

| Shell | Middle leg output |
|---|---|
| bash | `.sdlc/roadmap.md` |
| zsh, the seat default, `/bin/zsh` | nothing on stdout, and `fatal: ambiguous argument` on stderr |

`for c in $C` word-splits in bash but not in zsh, so `$c` becomes both shas joined and git rejects them.
Criterion row 2 carries the annotation `(bash, from the root checkout)` for exactly this reason; the
rewording introduced the same dependence into row 6 without carrying the annotation across. A grader
running row 6 in the default shell sees a blank where it expects a path, and a blank is not obviously a
failure. The criterion is met, so this is a concern and not a red. Naming the gap only; the repair is
the Orchestrator's.

## The live-facts question the Orchestrator asked

It asked whether an issue opened after the refresh instant is the live-facts rule again rather than a
third refresh. I agree, and the rule's own words settle it. Verified independently:

| Fact | Value |
|---|---|
| regeneration commit 7dde8cb1 | 2026-09-20T21:36:16Z |
| #718 | created 21:45:38Z |
| #719 | created 21:53:29Z |
| #721 | created 21:57:04Z |
| open issues created after the recorded instant 22:00Z | none |

All three postdate the regeneration commit, so the refresh was admitted by the rule. The recorded
instant is still accurate as I write.

## Notes, none of them a criterion

| # | Note |
|---|---|
| N1 | pass 1's verdict record is lost. It was untracked in `.worktrees/rf-U5`, as the unit convention has it, and that worktree was reaped before the record was committed. This file restates it. A verdict is what "done" means here, so it should be committed before its worktree is removed |
| N2 | §Texts asks that a revision row record the regeneration, its sha, and ticket #709. The row records the regeneration and `#709` but not `5f2c3787`, which appears in the front matter and the body's revision sentence instead. No numbered criterion covers the row |
| N3 | two lines in the handoff's "Notable facts" section did not reproduce at pass 1: PR #158 read `UNKNOWN` on three polls and `null` from the REST API against the handoff's `CONFLICTING`, and `.git-worktrees/pif-u5-records` read six uncommitted paths against four. The handoff marks the section as not a criterion, but it lands in the PR |
| N4 | `test/repo/branding.mjs` scans the gitignored `.sdlc/runtime/`, so its count reads 507 here, 507 in a clean clone and 508 in a worktree holding a local review file. Its `SKIP_DIRS` omits that path. The gate therefore reads local files CI never sees, and it is in the `TESTS` list. Pre-existing, and it explains the 506, 507 and 508 figures across three records |
| N5 | issue #718 says the P7 script's time check cannot fail. Measured, it can: a wrong first range prints `STALE time test` and exits `1`. The real gap is narrower, that the match is not global so only the first range in a gate cell is compared. The roadmap's own row 11 states it in the narrower form, which is the accurate one |

Nothing here is a fix. The next pass is the Orchestrator's to own.

Correction (2026-09-20, plan records-followup U5, #709, written by the Orchestrator because the Verifier seat does not commit): note N1 above is false as written. Pass 1's verdict record was not lost. It was copied out of `.worktrees/rf-U5` before that worktree was removed and committed to `main` at `34173dd6`, where it remains in the history; this file supersedes it at `0a0f0034`. The Verifier inferred the loss from the reaped worktree without checking `main`, and confirmed the record intact when asked. The practice N1 argues for is kept even so: a verdict is committed before its worktree is removed, which is what happened here.
