---
kind: verdict
plan: gate-gaps
unit: U2b
ticket: "#715"
branch: unit/gg-U2b
base: main @ 8bb8d875 (the step 0 merge parent)
grade: verifier-l2, run by the Verifier seat itself (same model and effort)
contract: U2 step 7 and U2-7's P2 half (revision 6), under owner rulings R50 (under-load runs count, marked) and R53 (the one STALE time test line carried), plus P1, P3 and P4 of .sdlc/plans/gate-gaps.md at 62ec4d41
pass: 1
written: 2026-09-26
---

# Verdict gate-gaps U2b · 🟢 · the three timed runs are disjoint, taken on one tree, and their figures are the logs' own; P2 reads exactly the R53 line

verdict: 🟢
sha: 62ec4d41ae316498519101949c017bc460cb716d

`unit/gg-U2b` at `62ec4d41`, already merged into `plan/gate-gaps` as `eb306b2a`. The review
(`.sdlc/verdicts/gate-gaps-U2b-review.md` on the plan branch) was FIX-FIRST at `e6011b01` on one red:
an em dash inside a fenced block of the handoff. `62ec4d41` is the handoff alone
(`3 insertions(+), 9 deletions(-)`). My runs used a clone under my job directory
(`gg2-1790407602`). The worktree was only read and is clean (`0`).

## The run record, checked against the machine

The Conductor asked whether run 1 sat inside run 2's span, which would mean concurrent runs. It did
not. The builder's three logs are `/private/tmp/gg-u2b-run1.log` to `run3.log`. Each file's birth
and last-write times match the handoff's start and end times to the second:

| run | handoff span (PDT) | file born, last written | seconds, log / handoff |
| --- | --- | --- | --- |
| 1 | `2026-09-24 06:47:35 to 06:50:07` | `2026-09-24 06:47:36`, `06:50:07` | `151` / `151.04` |
| 2 | `2026-09-25 21:41:48 to 21:59:27` | `2026-09-25 21:41:49`, `21:59:27` | `1058` / `1057.97` |
| 3 | `2026-09-25 21:59:53 to 22:07:26` | `2026-09-25 21:59:53`, `22:07:26` | `453` / `452.98` |

The spans are disjoint, and runs 1 and 2 are 39 hours apart. The "earlier draft" that put run 1
inside run 2's span was a mis-dated line. It was fixed in `cfd1edf8` ("run 1's date, 2026-09-24
not -25"), and the logs confirm the corrected date.

All three ran on one tree. `75d13c88` was committed at `2026-09-24 06:30:24`, and the unit's next
commit, `c9751d21`, came at `2026-09-25 22:10:24`, after run 3 ended. Each log ends
`✓ all 51 test files passed`.

## Rows

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| S7 | step 7: three green runs, disjoint, load and seconds each, under-load marked (R50) | 🟢 | the table above; `baseline.md`'s row reads `151.04 · 1057.97 · 452.98` and `✓ all 51 test files passed`; runs 2 and 3 are marked `(under load, R50)` | the logs' own times: a figure copied from anywhere else would not match them to the second |
| U2-7 / P2 | the records agree, read by line, with R53's one carried line | 🟢 | mine at `62ec4d41`: `STALE time test: baseline 151 to 1058 s, adapter 80 to 89 s`, `stale total: 1`; `tests` and `ui.html` read `ok`. The one line is exactly what R53 carries | the test-file figure planted as `50`: `STALE tests: baseline 50, test/run.mjs TESTS 51`, `stale total: 2` |
| P1 | `npm test` green, count agrees, tree stable | 🟢 | fresh clone, no `node_modules`: `✓ all 51 test files passed`, TESTS `51`, tree `0` | the review's `scrim` plant: `✗ 1/51 test file(s) failed`; mine at the same code, U2-7's plant above reds the checker |
| P3 | branding, no added em dash outside a backtick span | 🟢 | `branding: clean (708 files scanned)`; the P3 count against `8bb8d875`: `0`, where the review read `1` (the fenced line is gone) | one prose dash line committed in the clone: `1` |
| P4 | scope wall | 🟢 | `0`, `0` against the merge base `8bb8d875` | the three-name fixture prints `1` |

## Notes

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| N1 | this plan's own records fail the verdict check | 🟡 | on `plan/gate-gaps` at `eb306b2a`: `MISSING gate-gaps-U1.md`, `MISSING gate-gaps-U2.md`, `MISSING gate-gaps-U2b-review.md`, `bad 13`; the other 10 are main's, fixed on main by `2981f6be`. These three block the plan's pre-land until each carries its own final grade | the unit head, without the review record, reads `bad 12` |
| N2 | the handoff's front matter | 🟡 | it still reads `pass: 1`, though `62ec4d41` is its pass 2 | read at `62ec4d41` |
| N3 | P2's control figure | 🟡 | the plan expects `1`, `1`; it reads `2`, `2` because the clean run already carries R53's line. The handoff says so | mine: `stale total: 2` |

verdict: 🟢
sha: 62ec4d41ae316498519101949c017bc460cb716d
