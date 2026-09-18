# Verdict adopt-hygiene U5 · 🟢

Graded by sdlc-verifier on 2026-09-17 (evidence run: adopt-hygiene-U5-verifier-l1-p1, grade l1; scope control rerun by me). Branch `unit/hygiene-U5` @ ed565dd, worktree `.worktrees/hygiene-U5`. Criterion 3 and branding ran on a scratch detached worktree at 9fbb601 (U4 merged) with ed565dd merged in (removed after). The handoff and `.sdlc/verdicts/adopt-hygiene-U5-review.md` were not used as evidence.
Tally: 5 rows (3 criteria + scope + branding). 🟢 5 · 🟡 0 · 🔴 0. One merge-time concern below; it does not block the unit.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U5-1 | committed settings drop the `worktree` block; nothing else changes | 🟢 | at ed565dd `s.worktree===undefined`: true; `bgIsolation` count vs origin/main: 0; 39b78dc..HEAD diff is the 3 `worktree` lines only | at 39b78dc: false, 1 |
| U5-2 | valid JSON; f9e20c5 plugin flags kept | 🟢 | `sdlc@nonoun`, `sdlc@adia`: `true false` | tmp copy with a trailing comma: `SyntaxError` line 31 |
| U5-3 | `npm test` green on combined tree, tree clean | 🟢 | scratch 9fbb601 + ed565dd: exit 0, `✓ all 44 test files passed`; `git status --porcelain`: 0 | same scratch, `role-table.json` set to `{`: exit 1, `✗ 17/44` (restored) |
| S | scope: `.claude/settings.json` + U5 handoff only; no node_modules, `.claude/docs/other` | 🟢 | `git diff --name-only sdlc/adopt...unit/hygiene-U5` outside the two allowed paths: 0; private/node_modules names: 0 | same filter on `39b78dc...unit/hygiene-U4`: 2 |
| B | branding gate, combined tree | 🟢 | `branding: clean (413 files scanned)`, exit 0 | pre-fix handoff from d422287 placed in scratch: `FAIL: 2`, exit 1 (restored) |

🟡 Merge-time: the root checkout (on `sdlc/adopt`) holds uncommitted edits to `.claude/settings.json` that the live drill relies on. Merging U5 there collides with or removes them; the plan's merge-time question must precede the merge.
