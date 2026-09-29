PASS: prompt-audit U7 (#758), review round 2. Both round-1 blockers are fixed. The two Low items that needed a change are fixed too (the third, a frontmatter line length, was fixed without being required). All six U7 criteria pass again, with controls that bite.

Reviewer: reviewer-l2, fresh context. Worktree `.worktrees/pa-U7`, branch `unit/pa-U7`, head `0d965c57` (code `cc924fac`). Round-1 record: `prompt-audit-U7-review.md` at `7dbd66ff`. Unit base `f6cd69cb`. `npm test` was not rerun. No source was edited.

## Round-1 findings

| # | Round 1 | Round 2 | Evidence | Negative control |
|---|---|---|---|---|
| 1 | 🔴 figma-plugins: "Every prune on the apply path reads the resolved flag" | 🟢 fixed | Line 72 now reads "is guarded by the flag", and a new sentence says `applyBundle` and `applyStylePlans` read the raw `opts.libraryMode === true`. The paragraph was re-derived from `figma/plugin/code.js` (table below) | At `7dbd66ff` the same line said "reads the resolved flag", which `code.js` lines 1249 and 1464 contradict |
| 2 | 🔴 the handoff mislabels 17 SC ids, and 2 are half right | 🟢 fixed | All 27 rows now match the evidence table's order, row by row, against the round-1 mapping. The table header states the rule. The P5 greps print `1` for each of SC1 to SC27, and the ERE count is `27` | Round 1: SC6 described a non-finding, and SC25/SC26 were duplicates |
| 3 | Low: "never hand-edit inside the markers" twice | 🟢 fixed | `grep -c 'hand-edit inside'` on the SKILL.md prints `1` | `2` at `7dbd66ff` |
| 4 | Low: the out-of-scope Low rows were unrecorded | 🟢 fixed | The handoff lists SC28, SC29, SC32 and SC33 as applied beyond scope and outside P5. The Left-out table now names SC30, SC31 and SC34 and no longer contradicts SC29 | Round 1's Left-out table listed SC29 as both fixed and left out |
| 5 | Low: the shipping frontmatter line length | 🟢 fixed | The frontmatter is rewrapped at about 75 characters | 115 characters at `7dbd66ff` |
| plan | Re-verification labels off by one | 🟢 fixed on `plan/prompt-audit` at `bee7574d` | The Re-verification table now reads `T1, T2, SC6 (make11)`, `... SC7` for the symbol homes, `SC8` for H5, `SC9` for Context is memory, and `SC10 to SC26` for the history narratives | Before the fix: SC7, SC8, SC9, SC10, and SC11 to SC26 |

## The libraryMode paragraph, re-derived from code.js

| Claim | code.js | Holds |
|---|---|---|
| The `applyBundle` color variable reconcile and theme-mode prune are guarded, reading `opts.libraryMode === true` | 1464 (`const libraryMode = opts.libraryMode === true`), 1572, 1640 | 🟢 |
| The `applyFloatPlans` variable prune and breakpoint-mode prune are guarded by the resolved `useLibrary` | 1705 to 1707 comment, 1777 to 1783, 1793, 1813 | 🟢 |
| The `applyFontPrimitivesModes` variable and mode prunes share one resolved decision | 974 to 976, 1099 to 1107, 1116, 1141 | 🟢 |
| The `applyStylePlans` paint and text prunes read the raw `=== true` | 1249, 1299, 1411 | 🟢 |
| `undefined` falls back to `priorLibraryUpliftVM` only in the float and font functions; only `askIfUndecided` reaches `confirmLibraryMode` | 1101 and 1107, 1779 and 1783; 1463 ("never asks interactively") | 🟢 |
| Regroup and `plan.retire` are destructive outside the flag | 1539 (`old.remove()` on rebuild), 1827 (`stale.remove()` on retire) | 🟢 |

`sweep-delete` (line 266) is a separate message that deletes only user-confirmed ids, not the apply path, so it falls outside "every prune on the apply path".

## Criteria at 0d965c57

| Id | Result | Head output | Negative control (at f6cd69cb, round 1, unchanged files) |
|---|---|---|---|
| U7-1 | 🟢 | `0, 1, 1, 1, 0, 1, 1, 1` | `3, 0, 0, 0, 1, 1, 1, 1` |
| U7-2 | 🟢 | `1, 1, 1, 1, 0, 2, absent` | `3, 0, 0, 0, 5, 0` |
| U7-3 | 🟢 | `0, 6, [1 1], [0 0], 1, 1` | `1, 5, [0 0], [1 1], 1, 1` |
| U7-4 | 🟢 | `0, 1 1 1 1, 4, 0` | `1, 0 0 0 0, 4, 6` |
| U7-5 | 🟢 | `0, 0, 1, 1, 6` | `2, 19, 1, 1, 6` |
| U7-6 | 🟢 | `0, 1, 15` | `4, 1, 15` |
| Wall | 🟢 | `0` files outside the U7 list plus `.sdlc/*/prompt-audit*` | a fixture of `src/engine/type.mjs` and `.claude/skills/color-math/SKILL.md` prints `2` |
| P6 (U7 share) | 🟢 | added `0`, removed `14` | the fixture `+the rule (TKT-0010)` prints `1` |
| P3 (U7 share) | 🟢 | added U+2014 `0`; `em-dash: clean (817 files scanned)`; `branding: clean (809 files scanned)` | a fixture line with U+2014 prints `1` |
| board ids | 🟢 | `board.py ids .sdlc` exit `0` | not run |

## Findings

None open.
