PASS

# prompt-audit U11 review, pass 1

| Field | Value |
|---|---|
| Unit | U11 (#758), branch unit/pa-U11 at aeb53f7d, base plan/prompt-audit at 1b9ec1ed (an ancestor of the branch) |
| Verdict | PASS, no blocking finding |
| Ran | every U11-1 to U11-7 command and negative control in the worktree; `npm test` not run (builder's run accepted, tree measured clean) |

## Criteria

| Id | Evidence | Expected | Control | State |
|---|---|---|---|---|
| U11-1 | `0, 1, 2, 15 13 2` | 0, 1, 1 or more, `15 13 2` | line 51 typed Fifteen: second grep 0; parent of code commit: first grep 1 | 🟢 |
| U11-2 | `0, 1, 1, 1` | 0, 1, 1, 1 | parent's cat row: leg 2 prints 0, `always the uniform` prints 1 | 🟢 |
| U11-3 | `0, 0, 1, 1, 0, 15` | as printed | parent: `seven named groups` 1; `make7` typed back reds leg 1 | 🟢 |
| U11-4 | `0, 1, 1, 2` | 0, 1, 1, 2 | parent's docs/reference/SKILL.md: leg 1 prints 1 | 🟢 |
| U11-5 | `0, 1, 1, 1` | 0, 1, 1, 1 | KB cell typed 4130.3: `stale total: 1`; file restored, tree clean | 🟢 |
| U11-6 | `4, 0, 1, sorted`, order 09-26 cf U1, 09-28 pa U3, 09-29 cf U5, 09-29 pa U9 | 4, 0, 1, sorted | parent: undated U3 paragraph disorders | 🟢 |
| U11-7 | `P6 0 added ids; branding clean 948; em-dash clean 957; N 54 = 54; tree 0; engine diff 0` | as P1, P3, P6 | P6 fixture unchanged | 🟢 |

Scope: six files changed, all inside P4's wall (five named by U11 plus its own handoff). The moved U3 correction paragraph is byte-identical to the plan branch's apart from the inserted `2026-09-28, `.

## The two builder flags

| Flag | Judgment | Why |
|---|---|---|
| U11-4 legs 3 and 4 print 0 | builder defect (misreport), criterion fine | `.sdlc/handoffs/prompt-audit-U8.md` and `.sdlc/plans/prompt-audit-evidence.md` are on plan/prompt-audit and on unit/pa-U11 (`git ls-tree`), and in the worktree. Legs 3 and 4 print 1 and 2 as the plan expects. They are absent only on main, where the plan's own `At $B` cell says legs 3 and 4 read 0. The handoff's parenthesis ("not in this tree") is false and should read 1 and 2. The unit's work is unaffected. |
| one added id `#758` in `.sdlc/baseline.md` | fine, plan wording nit | P6's path set does not include `.sdlc/`, so P6 reads 0. U11-5 itself mandates the text (`prompt-audit U3 and U9 (#758)`) in the build row. The row follows its existing `#NNN Un corrections` pattern. U11-7's phrase "no history id enters" is loose against U11-5; the Orchestrator may tighten it at the next revision, nothing to redo. |

## Nits, not blocking

| Item | Note |
|---|---|
| U11-2 leg 2 and 3 as typed in the plan table | the table's `\|` is a markdown escape; run verbatim under BSD grep BRE it prints 2 and 107, not 1 and 1. With the literal `[|]` the row grep prints 1 and 1. A plan transcription issue, the criterion holds. |
| handoff U11-1 cell | prints `0, 1, 2` where the plan says `1 or more` on leg 3; consistent, the second true `fifteen voices` line coexists. |
