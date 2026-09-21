---
kind: verdict
plan: records-followup
unit: U12
seat: verifier
grade: verifier-l3
pass: 1
written: 2026-09-21
---

# Verdict records-followup U12 · 🟢 9 🟢, 1 🟡, 0 🔴

verdict: 🟢
sha: 52341dccd3b20c3bd803bbd7bde86346542f6267

| Graded at | `unit/rf-U12` @ `52341dcc`, one roadmap-only commit `15cd3121`, base `712e63db`, merge base `1f991877` |
|---|---|
| Legs | this seat's own runs and a `verifier-l3` worker in fresh context, fable, a different model family from this seat and from the builder. Its rows are at `/Users/kimba/.claude/jobs/05defd58/tmp/rf-U12-verifier/verdict-U12.md` |
| Shape check | `scripts/verdict.py check` on the handoff and on the reviewer record: exit 0 on both |

The unit repairs the two citations my pre-land pass 2 graded 🔴. Both are genuinely repaired and both
resolve at the ref the roadmap declares it was read at, which is the check that matters and the one
the builder had to overrule its dispatch to pass.

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| A1 | `:90` cites the record that actually carries the re-check rule | 🟢 | it now reads `Approval Q2 of survey-2026-09-18 (.sdlc/questions/survey-2026-09-18-approval.md)`, and that file's Q2 recommended option carries `architecture and debt get re-checked per plan, where a plan touches them` verbatim. The quote was trimmed from `architecture.md` and `debt.md` to plain `architecture and debt` so it matches the source exactly, which is this plan's own verbatim-quote rule | the same needle against `records-followup-approval.md` prints `0`; its Q2 is `How does the roadmap repair (U5) land?`, answered `Two PRs`. I read all four of its questions and none carries the rule |
| A2 | `:116` cites the record that actually carries the ownership sentence | 🟢 | it now reads `the owner ruling of 2026-09-20 recorded under Earlier today, same channel`, and that section's third bullet is `The other conductor session no longer touches this repo's plans (owner, in chat).` The same section carries `#496: Park it`, which the cell's next clause cites | the old citation fails the same test: `R4` is `Conductor session mode` and its block contains the ownership sentence `0` times |
| A3 | the new citations resolve at the refs the roadmap is read at | 🟢 | the roadmap's front matter declares `head: 5f2c3787 (origin/main)`. At `5f2c3787` the rulings file exists, the `Earlier today, same channel` section is present and the ownership sentence is present; the survey approval file and its Q2 wording are present. All still present at `main` and `origin/main` | `R11 Who owns what`, which the dispatch asked the builder to cite, is absent at `5f2c3787`: the grep prints `0`. The worker pinned it further, to blob `db07b39b` at `5f2c3787`, `7dde8cb1` and `712e63db`, with R11 added only at `b8c3be8f`, an ancestor of none of them. Citing R11 would have pointed at something that does not exist at the declared ref, which is the defect class in a new form. The builder was right to refuse the dispatch |
| B1 | the commit changed only those two citations | 🟢 | `2 2` over two hunks, one file. The word diff is exactly six spans: the approval name and path, `architecture.md` and `debt.md` to plain words, and `standing R4 (path):` to `the owner ruling ... recorded under Earlier today, same channel in (path):` | `git diff --name-only 712e63db 52341dcc` is the roadmap and the U12 handoff; `git show --name-only 15cd3121` is the roadmap alone, so the roadmap-only rule holds for the commit under test |
| B2 | nothing new in the changed text is false | 🟢 | every factual claim in both hunks re-derived above: the survey Q2 wording, the `Earlier today, same channel` bullet, and `#496: Park it` for the cell's next clause. The worker re-derived both hunks independently, including the commit message, and reached the same result | the same re-derivation applied to the pre-repair text fails on both cells, which is what pre-land pass 2 recorded |
| P1 | `npm test`, no `node_modules`, tree byte-stable | 🟢 | I ran it myself in a clean clone at `52341dcc` with no `node_modules`: `✓ all 48 test files passed`, exit 0 captured directly, TESTS 48, clone status 0 before and after, 260 s wall at load 54 rising to 70 on ten cores. Slow and green, which under this contention is green | the plan's own corruption, `scrim` to `scrimX` in the role-table answer key, 7 lines: `node test/run.mjs` exits 1 with 3 FAIL lines and `✗ 1/48 test file(s) failed`. Restored, the clean rerun exits 0 with all 48 passing |
| P4 | branding, which scans `.sdlc/` | 🟢 | `branding: clean (509 files scanned)`, exit 0 under pipefail | a records doc planted inside `.sdlc/`: `FAIL: 3 branding violation(s) across 510 files`, exit 1 |
| P5 | scope wall | 🟢 | zero paths outside `.sdlc/`; five in total, the fifth being this unit's own handoff | a planted file under `src/ui/` takes the outside count to 1 |
| P6 | no em dash added in prose | 🟢 | `0` against the merge base and `0` against the unit base, with nothing excluded. The handoff itself contains zero em dashes, inside backtick spans or out, so its self-exclusion hid nothing | one em dash appended to the roadmap in a clone gives `1` |
| N1 | the handoff's own accuracy | 🟡 | three statements in `.sdlc/handoffs/records-followup-U12.md` are false, and two are offered as its evidence or control. It says `grep -rn 'Who owns what' .sdlc/` prints nothing: three files under `.sdlc/` contain that string, including the rulings file itself. It says the rulings file `has exactly one commit, e9850935`: there are six. It reports `a baseline run measured at load 3.13 and 56 to 60 s`, splicing two rows, since the 56.27 to 59.83 times are at load 3.97 while load 3.13 belongs to the earlier `d814500` run whose times were 63.54, 65.90 and 59.17 | the first claim is true at `5f2c3787` and false on the current tree, so the defect is an unqualified present tense rather than a wrong reading. None of the three reaches `.sdlc/roadmap.md`, which is why this is 🟡 and not 🔴, and why both repairs above were derived from the cited records rather than from this handoff |

## The 🟡, and why it is worth a row

The artifact is clean. The handoff is not, and in a unit whose whole subject is records asserting
things that are not so, that is worth stating rather than passing over. Two of the three false
statements sit in the Evidence and Control columns of its own verdict table, so a reader taking the
handoff at its word would believe the repair had been checked by a command that does not reproduce.
It was checked, twice, by this seat and by the worker, from the cited records themselves.

## On P1, and a harness note

The worker's single `npm test` was killed at 31 of 48 by the harness under memory pressure, not by
any failure: all 31 had passed and there were no FAIL lines, but there was no exit code, so it
correctly graded P1 🟡 unmeasured rather than inferring a pass. A background watch of my own was
stopped by the same reaper. I re-ran P1 myself in the foreground once it was safe and it is green,
with the plan's own control. Sixteen concurrent `npm test` processes across sessions had the host at
load 54; the 260 s wall is a contention figure and is not offered as a timing of record.
