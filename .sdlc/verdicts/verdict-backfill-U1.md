---
kind: verdict
plan: verdict-backfill
unit: U1
ticket: "#734"
branch: unit/bf-U1
base: plan/verdict-backfill @ a7321fa0
grade: verifier-l1, the evidence run dispatched by the Verifier seat, which re-derived the rows marked mine
contract: U1-1 to U1-6, P1 to P7, Q1 to Q4 of .sdlc/plans/verdict-backfill.md at 0ad21e5d
pass: 1
written: 2026-09-23
---

# Verdict verdict-backfill U1 · 🟢 · 17 of 17 rows 🟢, the review record carried 🟡

verdict: 🟢
sha: 0ad21e5d8ee7a5d2b15f9aa9c9abdc11854e6652

`unit/bf-U1` at `0ad21e5d`. The evidence run's full report is at `/tmp/v13/bf-U1-verify.md`. Every
control ran in its own clone; the worktree was only read and is clean (`0`). The head adds only the
review record to `f69ce16a` (`1 file changed, 27 insertions(+)`). Mine: `verdict.py check` exits `0`
on the handoff and the review, and on each of the 31 changed records against its base copy
(`checked 31 bad 0`).

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U1-1 | each added line's token equals its record's title token | 🟢 | run: `31` ok, `0` MISMATCH, split `27` 🟢 and `4` 🟡. Mine, reading each H1 in Python: `first-token match 31 of 31` | one title token changed in a clone: `30` and `MISMATCH adopt-hygiene-U1.md title=🟢 line=🟡`; at `b0bc8343`: `0` ok, `31` MISMATCH |
| U1-2 | the line sits where the plan places it | 🟢 | `28 1`, and the 3 front-matter records carry it last before the closing `---` | the line moved to line 3, and one moved below `---`: `27 1` plus `1 0` |
| U1-3 | the list loses exactly the 31, keeps the 16 and its header | 🟢 | the plan's two hashes `cf9e4407...`, `ee97008b...`, `#`; removed and kept sets equal to the plan's typed sets; list numstat `0 31`; header byte-equal | two more names deleted: both hashes move |
| U1-4 | no later block re-grades a title | 🟢 | all `31` read to their closing block, every title stands (report table); e.g. `records.md`'s `Tally: 34 rows` counts audited rows, not its own grade | `k17-rerun-checkability.md`, a U2 record, is overturned by its `## Pass 2`; no U1 record has such a block |
| U1-5 | the check at the head | 🟢 | run and mine: `verdicts 80 graded 64 grandfathered 16 bad 0`, exit `0` | `survey.md` restored without the line: `MISSING`, `bad 1`; its name put back on the list: `CLEARED`, `bad 1` |
| U1-6 | one commit carries the records and the list | 🟢 | `e2bd2329` for all 31 and the list, `32 files changed, 31 insertions(+), 31 deletions(-)` | the same tree split into two commits: the row reds, and the records-only commit prints `bad 31` |
| P1 | `npm test` | 🟢 | `✓ all 48 test files passed`, exit `0`, tree `0` | `scrim` to `scrimX`: `✗ 1/48 test file(s) failed` |
| P2 | branding, no added dash | 🟢 | `branding: clean (570 files scanned)`, `0`, `0`; en dash `0` | a copy of `decision-records.md`: `FAIL: 3`; one prose dash line: `1` |
| P3 | scope wall | 🟢 | `0`, `0`, `0`; 34 paths, all records, the list, the handoff, the review | a roadmap edit plus a new `pif-u2.md`: `2` and `1` |
| P4 | as U1-5 | 🟢 | `bad 0` | as U1-5 |
| P5 | one added line per file | 🟢 | run and mine: numstat `31 1 0` | a second line on one record: `30 1 0` plus `1 2 0` |
| P6 | the added line is the last `verdict:` line | 🟢 | `31 1`, one `verdict:` per record | `verdict: 🔴` appended to `survey.md`: U1-1 drops to `30` |
| P7 | the other checks exit as at base | 🟢 | all five exit `0` at the head and at `b0bc8343` | a baseline figure changed in the adapter: `baseline-agrees-check.sh exit 1` |
| Q1 | the list's retirement is U3's | 🟢 | the check script and the adapter: `0` diff lines | a planted script edit: `9` |
| Q2 | #681 lands first, no `pif-*` here | 🟢 | `0` `pif-*` paths, `0` files | a planted `pif-u9.md`: `1` |
| Q3 | the four non-verdict records are U2's | 🟢 | U2 records touched `0` | a planted edit to `records-followup-U8.md`: `1` |
| Q4 | wiring into `npm test` is later | 🟢 | `test/` and `package.json` paths `0`, TESTS `48` | a planted `test/run.mjs` edit: `1` |

## Carried

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| R1 | the review record ran 5 of its 13 controls by argument | 🟡 | rows 3, 5, 7, 8 and 12 read "not replanted" or reason instead of running; its figures reproduce at `f69ce16a` (`verdicts 79 graded 63 grandfathered 16 bad 0`) | all five controls ran in this pass and each reddened (U1-3, U1-5, P1, P2, P7 above), so no graded fact is left uncontrolled |
| R2 | a host hazard for token counts | 🟡 | `sort \| uniq -c` under this host's UTF-8 locale puts 🟢 and 🟡 in one bucket (`31 🟢`); my own first byte-regex try also misread them. Any row counting tokens must run under `LC_ALL=C` or in a real parser | under `LC_ALL=C` the same count gives `27` and `4` |

Housekeeping: the run's clones `/tmp/bfv-1790122629` and its job-dir `bfctl` are still on disk; the
delete was refused by the permission system.

verdict: 🟢
sha: 0ad21e5d8ee7a5d2b15f9aa9c9abdc11854e6652
