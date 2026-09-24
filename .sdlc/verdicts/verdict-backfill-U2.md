---
kind: verdict
plan: verdict-backfill
unit: U2
ticket: "#734"
branch: unit/bf-U2
base: plan/verdict-backfill @ 357fcb39
grade: verifier-l2, run as a fresh-context worker so that U2-1's derivation stays blind (see below); the Verifier seat re-derived the rows marked mine
contract: U2-1 to U2-6 and the plan rows P1 to P7 of .sdlc/plans/verdict-backfill.md at 9d4926b1
pass: 1
written: 2026-09-23
---

# Verdict verdict-backfill U2 · 🟢 · 15 of 15 rows 🟢, 16 of 16 tokens derived blind and agreeing

verdict: 🟢
sha: 9d4926b1e31f37f29ee44680a9f16e1221705dcd

`unit/bf-U2` at `9d4926b1`. The evidence run's report is at `/tmp/v13/bf-U2-verify.md`, and its blind
table at `/tmp/v13/bf-U2-blind.md`. The worktree was only read and is clean (`0`). Mine: `verdict.py
check` exits `0` on the handoff and the review, and on the 16 records against their base copies
(`checked 16 bad 0`).

Why a worker at L2 and not me. Grade L2 is my own model, so I could have run it. But while locating
the token rule, a grep of mine printed the plan's Token column for four of the 16 records and for Q3.
U2-1 requires a derivation made before seeing those tokens, so I handed the whole unit to a fresh
context. It read the token rule and the U2 criteria, derived all 16 from the base copies at
`357fcb39`, and saved its table before opening the head, the handoff or the plan's table. It
disclosed one unavoidable priming: the U2 criteria text itself names the expected token for seven files.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U2-1 | each value is the record's own final state, derived blind | 🟢 | `16` of `16` agree across the blind derivation, the builder's table, the plan's table and the head's last `verdict:` line; tally `12` 🟢, `1` 🟡, `3` 🔴. The judgment row is the census, which has no pass word: all three readers took 🔴 from its close, and I read the same close at the base: `318 hold, 48 fail`, `45 🔴 and 1 🟡` distinct defects | `adopt-hygiene-U5-review.md` set to `verdict: 🔴`: the check still prints `bad 0`, exit `0`, and only the derivation (`\| Verdict \| 🟢 clear \|`) reds it |
| U2-2 | placement and last line | 🟢 | `1 1 1 1 1`, `1 1 1 1 1 1 1`, `1 1 1 1` | a trailing blank line and a line moved below `---`: `0 1 1 1 1 1 1` and `0 1 1 1` |
| U2-3 | the byte-pinned body is untouched | 🟢 | `e30720eb197f324c739cb2536d2de91f8d6037c4aad2a5ac877a80de9040c3b2` twice, then `1` | the line moved below the marker: hash `d8bcc6d456b94608...`, count `0`; the plan's `8693a8aea31b02e0` reproduces with its own `🟡` plant |
| U2-4 | prose lines carry a token; the superseded ones are not last | 🟢 | `1`; `12:verdict: 🔴 FIX-FIRST 668:verdict: 🟢`; `10:verdict: 🔴 FIX-FIRST 366:verdict: 🟢` | U8's line reverted: `VALUE records-followup-U8.md: last verdict: green-with-one-note is not 🟢, 🟡 or 🔴`, exit `1` |
| U2-5 | the list is its header alone, and still read | 🟢 | run and mine: `0` names, `verdicts 83 graded 83 grandfathered 0 bad 0`, exit `0` | `survey.md` appended: `CLEARED survey.md`, `bad 1`, exit `1` |
| U2-6 | U1-1, U1-2 and U1-4 still hold | 🟢 | `31` ok, no MISMATCH; `28 1`; none of the 31 changed since `357fcb39` (`0` files) | a title token changed: `30` and `MISMATCH`; a line moved: `27 1` |
| P1 | `npm test` | 🟢 | `✓ all 48 test files passed`, exit `0`, tree `0`; nothing on the test path moved | `scrim` to `scrimX`: `✗ 1/48 test file(s) failed` |
| P2 | branding, no added dash | 🟢 | `branding: clean (574 files scanned)`; stripped em dash `0`, raw outside handoffs `0`; the `2` en dashes sit in backtick quotes | a copy of `decision-records.md`: `FAIL: 3`; one prose dash line: `1` |
| P3 | scope wall | 🟢 | `0`, `0`, `0`; U2's non-record paths are the list, its handoff and its review | a roadmap edit: `1` |
| P4 | the check at the head | 🟢 | `verdicts 83 graded 83 grandfathered 0 bad 0`, exit `0` | a `verdict:` line deleted: `MISSING records-tidy-U1-review.md`, `bad 1` |
| P5 | added and deleted lines per file | 🟢 | `added 53 deleted 3 files 47`, the plan's figure. Mine, U2's 16 alone against `357fcb39`: `added 22 deleted 3 files 16` | a stray committed line: numstat `2 0` where `1 0` is required |
| P6 | the last `verdict:` line carries the table's token | 🟢 | the head column of U2-1, equal to the plan's Token column on all `16` | U2-1's control |
| P7 | the other checks exit as at base | 🟢 | all five exit `0` at `9d4926b1` and at `3e99fdca` | a baseline figure changed in the adapter: `baseline-agrees-check.sh exit 1` |

## Notes, none blocking

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| N1 | the census token is a reading, not a word the record states | 🟡 | `records-followup-roadmap-census.md` closes on a tally, `45 🔴 and 1 🟡`, not a grade word. Q3's ruling, "the record's own conclusion about its subject", covers it, and four readers agree | a reader who takes the census's own work as the subject (the census completed, so 🟢) would disagree; the Q3 ruling excludes that reading |
| N2 | the handoff's `572` files | 🟡 | a dated figure, not a false one: `572` at `792463f9`, `573` at `2ffac52e`, `574` from `4f11c429`; the two files added after it are U2's handoff and review (`A`, `A`) | the head scans `574`, so the handoff's figure does not describe the head |
| N3 | the handoff's Branch row names `792463f9`, the build commit | 🟡 | the three commits after `792463f9` touch only the handoff and the review; mine: records diff `0` lines | `git diff --stat 792463f9 9d4926b1 -- .sdlc/verdicts` excluding the review is empty |

Housekeeping: the run's clones `/tmp/bf2v-1790124498` and `/tmp/bf2v-neg-1790124611` are still on
disk; their delete was refused.

verdict: 🟢
sha: 9d4926b1e31f37f29ee44680a9f16e1221705dcd
