# Verdict adopt-hygiene U4 · 🟢
verdict: 🟢

Graded by sdlc-verifier on 2026-09-17 (evidence run: adopt-hygiene-U4-verifier-l1-p1, grade l1). Branch `unit/hygiene-U4` @ 8ebf172, worktree `.worktrees/hygiene-U4`. Commands run in that worktree; negative controls in a scratch worktree at 8ebf172 with the 29a2c06 file restored (removed after). The handoff and `.sdlc/verdicts/adopt-hygiene-U4-review.md` were not used as evidence.
Tally: 3 criteria. 🟢 2 · 🟡 1 · 🔴 0. The 🟡 is attribution only; it does not block.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U4-1 | U1 review record paraphrases the retired maker brand and domain (C12); only its P4 row changes | 🟢 | `node test/repo/branding.mjs`: `branding: clean (410 files scanned)`, exit 0; `git diff 29a2c06 --stat` on the review file: 1 insertion, 1 deletion, the P4 row | scratch with 29a2c06 review file: `FAIL: 2 branding violation(s)` (capitalised brand, retired domain) |
| U4-2 | U1 row 7 stale-path grep excludes `.sdlc/tickets`, prints 0 on head | 🟡 | row 7 command in worktree prints `moved`, `1`, `0`; exclusion at plan line 56. Concern: the exclusion was committed on the plan branch at 39b78dc, not by U4; U4 only confirms it | same grep without `':!.sdlc/tickets'`: 1, hit `.sdlc/tickets/T-0001.md` |
| U4-3 | `npm test` green on head, tree clean | 🟢 | exit 0, `✓ all 44 test files passed`; `git status --porcelain`: 0 | scratch with fix reverted: exit 1, `✗ 1/44`, failing `repo/branding.mjs` |

Scope: `git diff sdlc/adopt...unit/hygiene-U4`: 2 files (the U1 review P4 line, the new U4 handoff); `node_modules` and `.claude/docs/other`: 0.
Note: merge base 39b78dc is behind `sdlc/adopt` tip 806bc03; the merge also carries the plan-branch commits since. Not blocking.
