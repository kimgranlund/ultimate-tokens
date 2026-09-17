# Verdict adopt-hygiene U7 · 🔴

Graded by sdlc-verifier on 2026-09-17 (evidence run: adopt-hygiene-U7-verifier-l1-p1, grade l1; em dash and C13 id rows re-read by me). Branch `unit/hygiene-U7` @ ac52be8, base `sdlc/adopt` @ 65bbda3, worktree `.worktrees/hygiene-U7` left at status 0; controls in scratch worktrees (removed). The handoff and `.sdlc/verdicts/adopt-hygiene-U7-review.md` were not used as evidence.
Tally: 4 rows (3 criteria + scope). 🟢 2 · 🟡 1 · 🔴 1. Row 2 fails: the unit was asked to address debt/adapter id clashes and introduces a new one, and it adds em dashes plus a bold inline label to a committed record against the user's writing contract.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U7-1 | `nonoun` declared with the `nonoun-plugins` shape; nothing else in settings changes | 🟡 | probe `github kimgranlund/sdlc-orchestration true true`; diff vs 39db0a9: 6 added lines, 0 removed; settings minus `extraKnownMarketplaces.nonoun` deep-equals 39db0a9; JSON parses; no home path. Concern: `gh repo view kimgranlund/sdlc-orchestration` cannot resolve, so a fresh clone still cannot install `sdlc@nonoun` until the human pushes it (answer B, debt row added) | at 65bbda3 / 39db0a9: `undefined undefined true true`; scratch missing colon: `SyntaxError`; `sdlc@adia` flipped: count 8, deep-equal false |
| U7-2 | debt records the unpushed repo, C5 resolved, C6 complete, id clash addressed | 🔴 | commands pass: `sdlc-orchestration` count 2, no `missing` line; C5 and C6 carry clash notes. Not met: (a) the new row `C13` (`.sdlc/debt.md:59`) collides with adapter conflict `C13` (`.sdlc/adapter.md:106`) with no note, the hazard this criterion exists to remove; (b) the C5 and C6 notes (`.sdlc/debt.md:57-58`) add 2 em dashes (base 65bbda3: 0) and a bold inline label `**resolved by U7**`, both barred by the user's global writing rules | at 65bbda3: count 0, `missing .sdlc/debt.md`; em dash count at base 0 vs 2 at head |
| U7-3 | JSON valid, `npm test` green, tree clean, branding clean | 🟢 | `✓ all 44 test files passed`, exit 0; status 0; `branding: clean (421 files scanned)` | scratch: brand string planted in `.sdlc/debt.md`: exit 1, `✗ 1/44`; restored: 44 pass, status 0 |
| S | scope | 🟢 | `.claude/settings.json`, `.sdlc/debt.md`, `.sdlc/handoffs/adopt-hygiene-U7.md`; 0 paths in src, mcp, scripts, test, node_modules, `.claude/docs/other` | file list read against the U7 section; filter would print an out-of-wall path |

## Gaps for the next pass
1. 🔴 The new debt id collides with adapter C13: give it a distinct id or a clash note, and check the other new ids the same way.
2. 🔴 Remove the 2 em dashes and the bold inline label from the C5/C6 notes in `.sdlc/debt.md`.
3. 🟡 Criterion 1's revised "6 lines" wording lives only in the root checkout's uncommitted plan edit; the branch copy still reads "5 or fewer". Commit the revision so the record matches the grade.
4. 🟡 Landing before the marketplace repo is pushed leaves fresh clones unable to resolve the plugin (tracked as debt; human-owned).
