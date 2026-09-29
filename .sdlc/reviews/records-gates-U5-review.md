PASS

# Review: records-gates U5 (#755), pass 1

Reviewed at `343fe843` (fix `163da18f`, handoff on top) in a throwaway clone at `/private/tmp/claude-501/rcu5`. B = `8f5c6dc0`. No Verifier for U5 (R8), so this PASS closes the unit. `npm test` not rerun; the handoff's 54 of 54 is not doubted (the diff is one prose sentence plus a handoff).

| Id | Ran | Got | Negative control | Control result |
|---|---|---|---|---|
| U5-1 | `ceiling-counts-check.mjs`, tail 4, exit, shape grep | `note 20, rows 20`, `note 1670.43, series 1670.43`, partition 20 = 3 + 14 + 3, `ceiling-counts: clean`, exit 0, grep 1 | adapter.md reverted to B | `FAIL  adapter pointer found`, `1 failure(s)`, exit 1, grep 0 |
| U5-1 | same | same | sentence's `20` changed to `19` | `FAIL  adapter note count == rows  (note 19, rows 20)`, exit 1 |
| U5-2 | baseline row count and max, sentence position | `20`, `1670.43`, then `1`, `1`, `1`, `1` (in the retired paragraph, cites #755, retirement sentence kept, sentence once) | `Retired, #713 U6b` renamed | its count prints `0` |
| U5-4 | glyph count on added adapter lines, branding, scope filter | `0`, `branding: clean (797 files scanned)`, exit 0, filter `1` (carry below) | one glyph line appended to adapter.md | glyph count `1`, `node test/repo/em-dash.mjs` exit 1 |
| U5-4 | the check script's path through the filter | n/a | `.sdlc/checks/ceiling-counts-check.mjs` piped through the filter | `1` |
| scope | `git diff --name-only 8002b414 343fe843` | `.sdlc/adapter.md`, `.sdlc/handoffs/records-gates-U5.md` only | n/a | n/a |
| script unchanged | `git diff --name-only $B HEAD -- .sdlc/checks/ceiling-counts-check.mjs` | 0 lines | n/a | n/a |

## Findings

| Severity | Finding |
|---|---|
| none blocking | The one sentence in §3 sits inside the "Retired, #713 U6b" paragraph, cites #755, keeps the retirement sentence, and its 20 and 1670.43 match the baseline's own row count and maximum. Diff vs the base is 3 lines out, 4 in, all in that paragraph. |
| info | The U5-4 scope filter prints 1 against origin/main, naming only `.sdlc/plans/prompt-audit.md`. The plan branch carries it; U5 did not touch it. Graded on U5's own diff, which is clean. |
| info | Clone tree stayed clean after every control (0 status lines). The handoff has no em dash. |

verdict: 🟢
