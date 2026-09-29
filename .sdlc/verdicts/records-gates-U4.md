---
kind: verdict
plan: records-gates
unit: U4
ticket: "#741"
branch: unit/rc-U4
base: 8f5c6dc0
grade: verifier-l2, the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-28
---

# Verdict records-gates U4 · 🟡 · the E1 to E4 rules land and bite; two held review findings and the plan-branch wall carry

verdict: 🟡
sha: d017c6f4a0ef5f221b0bc022aeed23dc17df7dcc

`unit/rc-U4` at `d017c6f4`, with `B` = `git merge-base origin/main HEAD` = `8f5c6dc0`. The code commit is `9045acbd`;
U4's own diff from `ed2c8c6e` is `test/repo/em-dash.mjs`, its handoff and its review record. The evidence run
(`$CLAUDE_JOB_DIR/tmp/rcU4/report.md`) ran every `--fix` and plant in throwaway clones. I reran U4-1, P2, P3 and P4 in the
worktree and reproduced finding 1 in my own clone. The handoff's figures agree with the run's.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U4-1 | the E1 to E4 fixtures are in the tool's self-test and the gate is green | 🟢 | mine: `expectRule:` count `36` (base `32`), `name: "E[1-4] ` count `4`, `em-dash: clean (798 files scanned)` | the run deleted the E1 `R2s` return in a clone: `exit 1`, `✗ E1 heading in a string: matched R8, expected R2s` |
| U4-2 | `--fix` on the tree rewrites nothing, at base and head alike | 🟢 | the run: `R0 0` at `8f5c6dc0` and at `d017c6f4`, every rule line `0`, `git status --short` `0` after; the E1 perl loop `0` | an E1 line planted and staged reads `R2s 1`; an E3 `title:` line reads `R0 1` and keeps its glyph; the perl loop with a planted file reads `1` |
| U4-3 | the four-line plant is fixed by the new rules | 🟢 | the run: `1`, `1`, `2`, glyphs `2`; `## Hard rules: IMPORTANT` and `- **Pro**: the paid tier, a, b` | the same plant under the base tool reads `0`, `0`, `0` with `Hard rules, IMPORTANT` (the ticket's defect); unstaged, `0`, `0`, `0` |
| P1 | `npm test` green, N agrees, the tree clean | 🟢 | the run, clone at `d017c6f4`: `✓ all 53 test files passed`, `exit 0`, `53`, `ok    tests: baseline 53, test/run.mjs TESTS 53`, `0` | `scrimX` in `role-table.json`: `✗ 1/53 test file(s) failed`, `exit 1`; the baseline row at 52 prints `STALE tests: baseline 52` |
| P2 | no product source changes | 🟢 | mine: `0` | the two-name fixture through the grep prints `1` |
| P3 | branding and em dash | 🟢 | mine: `branding: clean (790 files scanned)`, `em-dash: clean (798 files scanned)`; the run's added-glyph counts `0`, `0` | a copied ADR under `.sdlc/verdicts/` prints `FAIL: 3 branding violation(s)`; two planted glyph lines give `2`, `1` and `FAIL: 2 em dashes`, exit 1 |
| P4 | scope wall; no verdict deleted or renamed | 🟡 | mine: the wall filter lists `2`: `.sdlc/plans/prompt-audit.md` and `.sdlc/reviews/records-gates-U1-review.md`, both carried in from `plan/records-gates` before U4; U4's own three files pass it. The rest reads `0`, nothing, `0`. Plan revision 5 (`f5b514ec`) admits the reviews path and resets `prompt-audit.md` on the plan branch; the pre-land record must read `0` | four planted names print `2`; `git mv` of a base-era verdict prints `1` |
| F1 | review finding 1: E1 and E2 put the colon on the line's first dash | 🟡 | mine, in a clone at `d017c6f4`: `const c = "a <U+2014> b"; const d = "## Head <U+2014> tail";` staged and `--fix`ed reads `const c = "a: b"; const d = "## Head, tail";`, so the heading's dash takes R8's comma. `git grep` on `origin/main` (`91f93cee`) finds `0` non-`.md` files with the glyph (all 236 lines are `.md`, where E1 and E2 never run), so nothing on `main` is hit today. The run's replay over pre-sweep `7d325b32` rewrites `mcp/describe-rubric.mjs:80` worse than the base tool. It departs from the design sentence (the string enclosing the dash); a follow-up (bind E1 and E2 to the enclosing string, add a two-dash fixture) is owed before any late branch reruns `--fix` | the same line with one dash (`"## Head <U+2014> tail"` alone) takes the colon, per U4-3's plant |
| F2 | review finding 2: E1 to E3 fire on every non-`.md` line | 🟡 | the run: `.sh`, `.yml`, `.css` and `.txt` bold-label lines take `R3s`'s colon, and `//` lines keep R8's comma. The design scopes the rules to "a non-Markdown line", and `main` has 0 candidates. Record text is false: review r1 names ` * **Pro** <U+2014> x` in a block comment as E2, but it is R3, and the base tool gives the same colon (`R3 1` at `8f5c6dc0`) | the `//` exclusion bites: `// **Pro** <U+2014> y` keeps R8's comma |

The 🟡s are not U4's to fix here. F1 wants a follow-up ticket before a late branch reruns `--fix`. F2's record text
(E2 for R3) belongs to the review. P4 is the pre-land record's to read at `0`.
