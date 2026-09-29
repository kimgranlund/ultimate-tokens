PASS: prompt-audit U11 pass 2 at 158fa7e0, findings 1 and 2 of the pass 1 verdict repaired, the handoff header names the head it describes, no regression.

# prompt-audit U11 review, pass 2

| Field | Value |
|---|---|
| Branch | unit/pa-U11 @ 158fa7e0 (pass 1 head 6c7598f7) |
| Base | `$B` = cc5be9be (merge-base origin/main HEAD) |
| Ticket | #758 |
| Grade | reviewer-l3 |
| Written | 2026-09-29 |

Every command below ran in `.worktrees/pa-U11` at 158fa7e0 with BSD grep (`/usr/bin/grep`) and no node_modules. `npm test` skipped per the lead's brief (record-only diff, host load high). Controls that edit a file ran in a `--shared` clone at `158fa7e0`, removed after.

## Diff since pass 1

| Commit | Files | Reading |
|---|---|---|
| ba4c25db, af5e7400 (merge of plan/prompt-audit) | `.sdlc/plans/prompt-audit.md`, `.sdlc/plans/prompt-audit-U11-rediagnosis.md` | planner revision 23 and the brief; not the builder's |
| 158fa7e0 (builder, `Seat: builder`, Co-Authored-By trailer) | `.sdlc/handoffs/prompt-audit-U11.md` only | the pass 2 repair |

No source, test, script, generated or skill file moved since 6c7598f7. `git diff --name-only 1b9ec1ed HEAD` lists the five U11 files, the handoff, the pass 1 review and the two merged plan records, matching handoff `:21`.

## Findings from the pass 1 verdict

| Finding | State | Evidence | Negative control |
|---|---|---|---|
| 1, U11-4 cell | 🟢 | handoff `:42` reads `0, 1, 1, 2`; measured here `0`, `1`, `1`, `2`. The "not in this tree" clause is gone | pass 1 cell `0, 1` at 6c7598f7 would disagree with the measured `1`, `2` |
| 2, U11-7 control | 🟢 | handoff `:45` names what the builder did not run: pass 1 ran none of P1's, P3's, P6's controls; pass 2 ran P3's and P6's; P1's control was not run by the builder and is cited from the pass 1 verdict. `:30` states `npm test` itself was not run in pass 2 | pass 1 cell `not separately run` at 6c7598f7 names no gate |
| Header names its head | 🟢 | `:5` names af5e7400, which is the parent of 158fa7e0 (`git log -1 --format=%P 158fa7e0`); `:6` states the handoff commit is its child and changes only this file (true: `git show --name-only 158fa7e0`); `:7` says rows were measured at af5e7400, and 158fa7e0 differs from it only in the handoff, so every figure holds at the head | `git diff --name-only af5e7400 158fa7e0` lists one file; a second path there would void `:6` |

## Criteria, run by this seat

| Row | Handoff | Evidence (measured at 158fa7e0) | State | Negative control |
|---|---|---|---|---|
| U11-1 | `0, 1, 2, 15 13 2` | `0`, `1`, `2`, `15 13 2` | 🟢 | not run by this seat (pass 1 controls cited) |
| U11-2 | `0, 1, 1, 1` | `0`, `1`, `1`, `1` | 🟢 | not run by this seat (pass 1 controls cited) |
| U11-3 | `0, 0, 1, 1, 0, 15` | `0`, `0`, `1`, `1`, `0`, `15` | 🟢 | not run by this seat (pass 1 controls cited) |
| U11-4 | `0, 1, 1, 2` | `0`, `1`, `1`, `2` | 🟢 | file at `1818bf59~1`: first grep `1` |
| U11-5 | `0, 1, 1, 1` | `0`, `1`, `1`, `1` | 🟢 | not run by this seat (pass 1 controls cited) |
| U11-6 | `4, 0, 1, sorted` | `4`, `0`, `1`, `sorted` (`2026-09-26`, `2026-09-28`, `2026-09-29`, `2026-09-29`) | 🟢 | file at `1818bf59~1`: undated count `1` |
| U11-7 P1 legs 2 to 5 | `54`, `0`, `0`, `ok tests 54 = 54` | `54`, `0`, `0`, `ok    tests: baseline 54, test/run.mjs TESTS 54` | 🟢 | `"scrimX` control needs `npm test`, not run (lead's brief); pass 1 verdict: `exit 1` |
| U11-7 P3 | `950`, `958`, `exit 0`, `0` | `branding: clean (950 files scanned)`, `em-dash: clean (958 files scanned)`, `exit 0`, `0` | 🟢 | ADR copied to `.sdlc/verdicts/prompt-audit-x.md` in the clone: `FAIL: 3 branding violation(s) across 951 files` |
| U11-7 P6 | added `0`, removed `41`, baseline `1` | `0`, `41`, `1` over `.sdlc/baseline.md` (the build row revision 23 expects) | 🟢 | fixture `+the rule (TKT-0010)`: `1` |
| P4 | `0, 0, 0` | `0`, `0`, `0` | 🟢 | six-name fixture not rerun; pass 1 verdict: `3` |
| Tree | clean | `git status --short` `0` before and after | 🟢 | the clone's edit never touched this tree: `0` after its removal |

## Notes, non-blocking

1. 🟡 U11-7 at revision 23 says P1's, P3's and P6's commands are "each run by the builder". P1 leg 1 (`npm test`) and P1's control were not run by the builder in either pass; the handoff says so at `:30` and `:45` and cites the pass 1 verdict's run at 6c7598f7, where it went green and the control bit. The source tree has not moved since, so the gap is procedural. The Verifier decides whether that citation stands for the row or whether it runs `npm test` itself.
2. The brief (step 4) asked for a rerun of U11-1 to U11-7 and P4; the handoff reruns the criteria but carries the U11-1 to U11-6 controls from pass 1 (`:28` says so). The controls read files that did not change, and this seat re-checked U11-4's and U11-6's at `1818bf59~1`.
