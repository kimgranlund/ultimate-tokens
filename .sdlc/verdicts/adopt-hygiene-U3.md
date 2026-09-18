# Verdict adopt-hygiene U3 · 🟢

Graded by sdlc-verifier on 2026-09-16. Branch `unit/hygiene-U3` @ d731a9e, worktree `.worktrees/hygiene-U3`. Every command run by me, in that worktree or live against GitHub; negative controls in throwaway worktrees (removed). The handoff's `Ran` row and the review were not used as evidence.
Tally: 10 criteria. 🟢 8 · 🟡 2 · 🔴 0. Both 🟡 rows miss a literal plan number for a cause outside the unit; neither blocks.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U3-1 | 7 `.claude/ops` files untracked, on disk, ignored | 🟢 | `git ls-files .claude/ops`: 0; the three named files exist in the root checkout (3); `git status` ops lines: 0 | scratch copy with the ops files on disk: 0; after `sed '/^\.claude\/ops\/$/d' .gitignore`: 78 untracked ops paths |
| U3-2 | one commit, removes index entries only | 🟢 | deleted names 7; one subject `sdlc(adopt-hygiene): untrack .claude/ops (D1, C6)`; `git show --stat` of 492b616: 7 paths, "7 files changed, 447 deletions(-)" | same stat count on b885e67: 52 paths, so a wider commit shows |
| U3-3 | GitHub squash-only | 🟢 | live `gh api`: `[true,false,false]` | pre-state `[true,true,true]` measured by me in the survey (C6) |
| U3-4 | 15 gone branches pruned; main + sdlc/adopt remain | 🟡 | gone: 0; `main` + `sdlc/adopt`: 2; `git branch \| wc -l`: 31, not "at most 28". Concern: the 3 extra are `unit/hygiene-U1..U3`, created after the plan's 43 baseline (43 + 3 - 15 = 31). No pre-existing non-gone branch was removed (remaining list checked by name) | pre-state gone = 15, local = 43, measured by me in the A7 plan review |
| U3-5 | remote branches untouched by this unit | 🟡 | `git branch -r`: 40, not the plan's 42. Cause is external: `agent/agent-a647be96051faad4d` and `agent/agent-ae6550ee648bc1100` are gone on origin (`ls-remote` exit 2), and GitHub DeleteEvents record them deleted by kimgranlund at 2026-09-13T23:02:33Z and 2026-09-14T04:01:36Z, before this unit. `git fetch -p` (criterion 4's own command) dropped the stale tracking refs. No push in the unit's commits | the events query also lists the older merge-branch deletes, so a delete by this unit today would appear |
| P1 | `npm test` green, tree stable | 🟢 | `✓ all 44 test files passed`; `git status --short`: 0 | role-table corruption fails semantic.mjs (verified in the A7 plan review) |
| P2 | private folder + node_modules untracked | 🟢 | 0 | `git ls-tree -r --name-only origin/main \| grep -c '^\.claude/ops/'`: 7, so the grep sees tracked `.claude/` paths |
| P3 | scope wall | 🟢 | 0 | `x` appended to `src/engine/flags.js` in scratch: 2 lines |
| P4 | branding gate clean | 🟢 | `branding: clean (394 files scanned)` | copy of decision-records.md under `docs/`: FAIL 3 (A7 plan review) |
| P5 | no rewritten record | 🟢 | 0 | removed the `## ADR-005` heading line in scratch: 1 |
