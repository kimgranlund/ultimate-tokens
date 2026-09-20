---
kind: verdict
plan: records-followup
unit: U5
branch: unit/rf-U5
sha: ee28fff6
verdict: 🟡
written: 2026-09-20
seat: verifier
---

# Verdict records-followup U5 · 🟡 11 🟢, 1 🟡, 0 🔴

| Field | Value |
|---|---|
| Unit | U5, F5, the roadmap regenerated from live facts |
| Branch | `unit/rf-U5` @ ee28fff6, BASE 1f991877 |
| Graded | 2026-09-20, verifier seat, grade l1 |
| Scope | U5-1 to U5-7 and P1, P4, P5, P6, P7. P2 and P3 are pre-land only |
| Evidence | three independent runs at this head: this seat's own and two dispatched `verifier-l1` workers in fresh context. They agree on every figure |
| Blocks landing | no. The one 🟡 is the plan's own live-facts case and the Orchestrator refreshes that row at landing |
| Not done | I did not commit. This record is untracked in the worktree, inside the wall, and does not move U5-6 or P5 |

An earlier head, 5c09855a, was graded and then superseded when the owner retired roadmap Q2 as moot. I
refused to carry any row forward from it: U5-6, P4, P5 and P6 are whole-branch measures whose inputs a
new commit moves, `npm test` reads `.sdlc/` through `repo/branding.mjs` which is in the `TESTS` list, and
U5-2 to U5-4 read live facts that move on their own. Every row below was rerun here.

## Criteria

| # | Criterion | State | Evidence, measured at ee28fff6 | Negative control |
|---|---|---|---|---|
| U5-1 | one head sha, and it is on main | 🟢 | `1`, `anc 0`. The head line reads one sha, `5f2c3787` | the BASE roadmap's head line names two: `2`, then `fatal: --is-ancestor takes exactly two commits`, `anc 128` |
| U5-2 | the worktree table is the live set | 🟢 | `diff 0`, seven names matching `git worktree list` exactly. Run four times across three seats over eight minutes, `diff 0` every time | live set against the BASE roadmap: four `>` and three `<`, `diff 1` |
| U5-3 | the stated count is the row count | 🟢 | `7`, `7` | the BASE roadmap: an empty first line, because its count is a word, then `8` |
| U5-4 | one ranked row per open issue, none for a closed one | 🟡 | `diff 0` at 14:39, and again on my own run. At 14:47 one `<` line, `718`, `diff 1`. See below | live issues against the BASE roadmap: nine `>` and six `<`, `diff 1` |
| U5-5 | no unanswered prompt is left in the file | 🟢 | `0`, `0`. Exactly one numbered line remains, Q1 go-live, carrying its pointer; Q2 carries none | the BASE roadmap: `1`, `2` |
| U5-6 | alone: one commit touches the roadmap and touches only it | 🟢 | `nonempty 0`; `1`; the commit's only file is `.sdlc/roadmap.md`; the branch's three paths are the roadmap, the handoff and the questions file; `branding: clean (508 files scanned)`, `exit 0`; `0` raw dashes | leg A, a range with no roadmap commit: `nonempty 1` while `wc -l` still prints `1`, which is what reds the row. Leg B, a clone commit staging the roadmap together with `.sdlc/debt.md`: the file list prints two paths |
| U5-7 | debt ids cited as `debt.md` defines them after U7 | 🟢 | `0`, `1`. The counted line is the Process row citing `DP3` | the BASE roadmap: `1`, `0` |
| P1 | `npm test` green, `TESTS` equal to the reported count, tree byte-stable | 🟢 | `✓ all 48 test files passed`; `48`; `0`. Wall 336 s with load going 54 to 238 on 10 cores, and 188 s at load 13 on the superseded head. Slow, not red; no triage needed | role table key renamed in a clone: `exit 1`, three `FAIL` lines, `✗ 1/48 test file(s) failed` |
| P4 | branding gate clean | 🟢 | `branding: clean (508 files scanned)`, `exit 0` | records doc copied to `.sdlc/verdicts/x.md` in a clone: `FAIL: 3 branding violation(s)` |
| P5 | scope wall | 🟢 | `0`; `1`; the third leg prints nothing, which is this branch's stated shape | a probe appended to `src/engine/motion.mjs` in a clone: first leg `1`. Two edited lines in `.claude/CLAUDE.md`: third leg `2	2` |
| P6 | no em dash added in prose | 🟢 | `0` | the plan's own fixture: a prose dash `1`, the same dash inside a backtick span `0`, two prose dashes on one line `2`, all three lines `3`, and `4` without the strip |
| P7 | the baseline's test-file figure equals `TESTS.length` | 🟢 | every counted line `ok`, one `note head:` line printed and not counted, `stale total: 0`, `exit 0` | the baseline figure moved 48 to 47 in a clone: `STALE tests: baseline 47, test/run.mjs TESTS 48`, `stale total: 1`, script exit `1`. I first misread this as exit `0` by capturing a pipeline's status instead of the script's, and remeasured |

## The one 🟡

Issue #718 was opened while the unit sat in verification, and the roadmap has no row for it.

| Fact | Value |
|---|---|
| roadmap commit `7dde8cb1` | 2026-09-20T21:36:16Z |
| issue #718 created | 2026-09-20T21:45:38Z |
| gap | 9 minutes 22 seconds after the commit |

The plan's live-facts rule says a difference is 🔴 unless the differing item was created after the unit's
commit time, and then it is a 🟡 note the Orchestrator refreshes at landing. This is that case exactly,
measured, not assumed. Nothing the builder did is wrong: the roadmap was true when it was written.

## Notes, none of them a criterion

| # | Note |
|---|---|
| N1 | §Texts asks that a revision row record the regeneration, its sha, and ticket #709. The row records the regeneration and `#709` but not `5f2c3787`. The sha is in the front matter's `head:` and in the body's revision sentence, and no numbered criterion covers the row, so this is a wording gap rather than a failed row |
| N2 | two lines in the handoff's own "Notable facts" section do not reproduce now: it says PR #158 is `CONFLICTING`, which reads `UNKNOWN` on three `gh` polls and `null` from the REST API; and that `.git-worktrees/pif-u5-records` carries four uncommitted paths, which reads six. The handoff marks the section as not a criterion, but it lands in the PR |
| N3 | `test/repo/branding.mjs` scans the gitignored `.sdlc/runtime/`: the count is 508 with the local review file present and 507 with it moved aside, and its `SKIP_DIRS` lists `.git`, `node_modules`, `dist`, `other`, `worktrees`, `.git-worktrees` and `.worktrees` but not that path. The gate therefore reads local ignored files CI never sees, and it is in the `TESTS` list. Pre-existing and not this unit's; it explains the 506, 507 and 508 figures in three records |
| N4 | issue #718 says the P7 script's time check cannot fail. Measured, it can: a wrong first range prints `STALE time test` and exits `1`. The real gap is narrower. The script matches without the global flag, so it compares only the FIRST range in a gate cell and a second range in the same cell goes unchecked. Worth knowing before pre-land leans on P7's time rows |

Nothing here is a fix. The next pass is the Orchestrator's to own.
