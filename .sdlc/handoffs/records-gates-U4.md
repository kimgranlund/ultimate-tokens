# Handoff U4 · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/rc-U4 @ 9045acbd |
| Files | `test/repo/em-dash.mjs` |
| Ran | `npm test` ✅ `all 53 test files passed`, tree clean after (host load average peaked at 325, the run took about 30 min, no test retried) · U4-1 ✅ · U4-2 ✅ · U4-3 ✅ |
| Left out | nothing in scope; the resumed session inherited an uncommitted, complete edit and committed it unchanged |

## What changed

`classifyLine()` gains E1 (`R2s`, colon) and E2 (`R3s`, colon) before R8 on a non-Markdown line, and E3 (`R0`, construct `E3`) and E4 (`R0`, construct `E4`, `.md` only) as refusals. `applyRule` treats `R2s` and `R3s` like R2 and R3, `fixLines` counts them as structural, and `runFix()` has counters and sample keys for both new ids. Four fixtures added to `selftest()`.

| Fixture | Before | After |
|---|---|---|
| E1 heading in a string | `const h = "## Hard rules <dash> IMPORTANT";` | `const h = "## Hard rules: IMPORTANT";` |
| E2 bold label in a string | `const b = "- **Pro** <dash> the paid tier";` | `const b = "- **Pro**: the paid tier";` |
| E3 short title string | `const t = { title: "Export kit <dash> all formats" };` | refused (`R0`), left in place |
| E4 blockquoted label bullet | `> - **Label** <dash> one, two` | refused (`R0`), left in place |

## Criteria

| Id | Got | Negative control | Control result |
|---|---|---|---|
| U4-1 | `expectRule:` `36`, `E[1-4]` fixtures `4`, gate tail `em-dash: clean (796 files scanned)`, exit 0 | clone at unit head, `R2s` return deleted | exit 1, `✗ E1 heading in a string: matched R8, expected R2s` |
| U4-2 | base `R0 0`, head `R0 0`, `git status --short` empty on both afterwards; perl E1 count over the plan's paths `0` | head clone, one E1 line planted and `git add`ed | `R0 0`, file reads `## Hard rules: IMPORTANT` |
| | | head clone, one E3 line planted and `git add`ed | `R0 1` |
| U4-3 | head: `1`, `1`, `2`, glyph count over both planted files `2` | same plant in a clone at the base (`8f5c6dc0`) | `0`, `0`, `0`; strings read `Hard rules, IMPORTANT` and `Pro**, the paid` (R8 comma, the ticket's defect); the base's `R0` is `0` because it rewrites the E3 and E4 lines too |

Scratch clones: `/private/tmp/claude-501/rcU4/{head,base,ctl}`; logs `fix-head.log`, `fix-base.log`. `--fix` ran only in clones.

No em dash added to any tracked file (the fixtures build the glyph from `DASH`).
