# prompt-audit U11 handoff, pass 2

| Field | Value |
|---|---|
| Branch | unit/pa-U11 @ af5e7400 (the pass 2 base: plan/prompt-audit at ba4c25db merged into 6c7598f7; the parent of the pass 2 handoff commit; code commit 1818bf59, unchanged since) |
| Records | the pass 2 handoff commit is the child of af5e7400 and changes this file only |
| Measured at | af5e7400, every row and gate below run in this worktree on 2026-09-29 with BSD grep (`/usr/bin/grep`) and no node_modules |
| Status | 🟢 record repaired, awaiting review and verify |

## Files

| File | Change |
|---|---|
| .claude/skills/type-scale/references/foundations.md | `THIRTEEN voices` to `FIFTEEN voices` (line 20) |
| .claude/skills/type-scale/SKILL.md | `cat` row `steps` cell states the `ranksFor` rule |
| .claude/skills/adding-export-formats/references/foundations.md | `make7` bullet names the fifteen `makeVoices` voices |
| docs/reference/SKILL.md | `are now **validated**` to `are **validated**` |
| .sdlc/baseline.md | build row cause text; U3 correction dated 2026-09-28 and moved between chroma-floor U1 and U5 |
| .sdlc/handoffs/prompt-audit-U11.md | pass 2: U11-4 and U11-7 cells repaired, head named, counts refreshed |

Pass 2 changes no source, test, script, generated or plan file. `git diff --name-only 1b9ec1ed af5e7400`, less the merged plan records and board, lists the five files above plus this handoff and the pass 1 review.

## Ran

| Command | Result |
|---|---|
| U11-1 to U11-6 commands | printed as below |
| negative controls U11-1 to U11-6 | pass 1 builder's runs, as below |
| P1 legs 2 to 5 (TESTS count, `test/run.mjs` diff, `git status --short`, baseline-agrees `tests:`) | `54`, `0`, `0`, `ok    tests: baseline 54, test/run.mjs TESTS 54` |
| P1 leg 1, `npm test` | not run in pass 2: a record-only change, host load high; the lead's brief set `node test/repo/em-dash.mjs` and `node test/repo/branding.mjs` in its place. The pass 1 verdict ran it at 6c7598f7: `✓ all 54 test files passed`, exit 0 |
| P3 | `branding: clean (950 files scanned)`, `em-dash: clean (958 files scanned)`, `exit 0`, added dashed prose lines `0` |
| P4 | `0`, `0`, `0` |
| P6 | added ids `0`, removed ids `41`; the same added-id filter over `git diff cc5be9be -- .sdlc/baseline.md` prints `1` (the build row U11-5 requires, outside P6's paths) |

## Criteria

| Id | Printed | Control |
|---|---|---|
| U11-1 | 0, 1, 2, then 15 13 2 | line 51 typed Fifteen: second grep 0 |
| U11-2 | 0, 1, 1, 1 | old cell text restored: first grep 1 |
| U11-3 | 0, 0, 1, 1, 0, 15 | make7 appended: first grep 1 |
| U11-4 | 0, 1, 1, 2 (both the U8 handoff and the evidence file are tracked in this tree) | old wording restored: 1 |
| U11-5 | 0, 1, 1, 1 | KB cell typed 4130.3: stale total 1 (control ran, file restored) |
| U11-6 | 4, 0, 1, sorted (2026-09-26, 2026-09-28, 2026-09-29, 2026-09-29) | file at 1818bf59~1: undated count 1 |
| U11-7 | P1: TESTS 54, `test/run.mjs` diff 0, status 0, baseline 54 = 54; P3: branding and em-dash clean, exit 0, dashed lines 0; P6: added ids 0 in P6's paths, `1` over `.sdlc/baseline.md` as the plan expects | the pass 1 builder did not run P1's, P3's or P6's controls. Pass 2 ran P3's (the ADR copied to `.sdlc/verdicts/prompt-audit-x.md`: `FAIL: 3 branding violation(s) across 951 files`, copy removed, status 0) and P6's (`+the rule (TKT-0010)`: `1`). P1's control (`"scrimX` in role-table.json, `npm test` exit 1) was not run by the builder; the pass 1 verdict ran it and it bit |

## Left out

Plan text, board, H2 (#776), the full `npm test`, and pushing.
