# Verdict adopt-hygiene U7 · 🟢 (pass 2)

Graded by sdlc-verifier on 2026-09-17 (evidence run: adopt-hygiene-U7-verifier-l3-p2, grade l3, Fable 5.1). Replaces the pass 1 🔴 on ac52be8. Branch `unit/hygiene-U7` @ 3fbeb5c (base 65bbda3; `sdlc/adopt` now 4f735dd), worktree `.worktrees/hygiene-U7` left at status 0; controls in five scratch worktrees (removed). Graded against the revised §U7 committed on `sdlc/adopt` @ 4f735dd. The handoff, review, and re-diagnosis were not used as evidence.
Tally: 10 rows. 🟢 9 · 🟡 1 · 🔴 0. Both pass 1 🔴 gaps are closed.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U7-1 | `nonoun` declared with the `nonoun-plugins` shape; nothing else in settings changes | 🟢 | probe `github kimgranlund/sdlc-orchestration true true`; diff vs 39db0a9: one 6-line hunk, 0 removed; settings minus the entry deep-equals 39db0a9 | 39db0a9 and 65bbda3: `undefined undefined true true`; `sdlc@adia` flipped: deep-equal false |
| U7-2 | debt records unpushed repo, C5 resolved, C6 complete, plan-added C ids that match adapter ids carry notes, no em dash or bold label, row count true | 🟢 | `2`, no `missing`; clash block silent; em 0, bold 0; `7 / 7`, `45 / 45`; C5, C6, C7 notes name the matching adapter rows | 65bbda3: `clash C5/C6 without note`, `4 / 6`; ac52be8: `clash C13 without note`, em 2, bold 1; scratch plants: C7→C8 `clash C8`, one em dash `1`, bold `1`, deleted row `7 / 6` |
| U7-3 | JSON valid, `npm test` green, tree clean, branding clean | 🟢 | parse ok; `✓ all 44 test files passed`; status 0; `branding: clean (421 files scanned)` | role-table plant: `✗ 1/44`; missing colon: SyntaxError; decision-records copy under `docs/`: `FAIL: 3` |
| G-a | pass 1 gap: no plan-added debt id collides with an adapter id without a note | 🟢 | adapter C1..C13, debt C1..C7; C5, C6, C7 noted; C13 row gone | same join prints `clash C13` at ac52be8 |
| G-b | pass 1 gap: no em dash, en dash, or bold label added | 🟢 | added lines in all 3 touched files: U+2014 0, U+2013 0, `**` pairs 0 | ac52be8: em 2, bold 1 |
| G-c | pass 1 gap: criterion 1 "6 lines" wording committed | 🟡 | committed on `sdlc/adopt` @ 4f735dd; root plan diff empty. Concern: the unit branch still carries the "5 or fewer" plan copy and lacks `adopt-hygiene-U7-p2.md` (builder declined the merge); `git merge-tree sdlc/adopt 3fbeb5c` is conflict-free, so the unit merge closes it | pre-revision phrase present on the branch, absent on `sdlc/adopt` |
| G-d | marketplace repo push tracked as debt | 🟢 | debt C7, owner human, after landing; `gh repo view` still cannot resolve the repo, so the row is correctly open | 65bbda3: count 0 |
| S-3 | settings: no home path | 🟢 | `/Users/` count 0 | planted home path: 1 |
| S-4 | gates | 🟢 | see U7-3 | see U7-3 |
| S-5 | scope | 🟢 | `.claude/settings.json`, `.sdlc/debt.md`, U7 handoff; out-of-wall count 0; adapter identical to `sdlc/adopt` | planted `src/engine/motion.mjs` prints |

Notes (non-blocking, outside U7):
- Debt ids C1 to C4 predate the plan (b885e67) and also match adapter C1 to C4 without notes; the adapter series runs gapless to C13, so future debt C rows keep colliding. A debt row or a convention line would end it.
- Fresh clones still cannot resolve `sdlc@nonoun` until the human pushes the marketplace repo (debt C7).
