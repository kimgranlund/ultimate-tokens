---
kind: verdict
plan: records-gates
unit: U2
ticket: "#742"
branch: unit/rc-U2
base: 8f5c6dc0
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-28
---

# Verdict records-gates U2 · 🔴 · every U2 row and prose item is met; P3 fails as written, records-only

verdict: 🔴
sha: 8766a758a20d723a4326f190ae7174ad01653ffe

`unit/rc-U2` at `8766a758`, with `B` = `git merge-base origin/main HEAD` = `8f5c6dc0`. Q2 is yes. The evidence run
(`$CLAUDE_JOB_DIR/tmp/rcU2/report.md`) used two throwaway shared clones at `8766a758`. I reran P3 myself in the
unit worktree, and its figures below are mine. `verdict.py check` passes on the handoff and both review records;
it warns that r2's findings table has no control column, which is not a failure.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P3 | branding clean; the added-line glyph count outside spans is `0`; the raw non-handoff count equals a count the handoff states, with each line quoted; the em-dash gate is green | 🔴 | mine: the stripped count prints `1`, not `0`: `.sdlc/verdicts/records-gates-U2-review.md:39` quotes the old handoff line in a double-backtick span, and the row's `s/\x60[^\x60]*\x60//g` pairs the inner backticks, so the U+2014 survives the strip. The raw count prints `4` (review r1 lines 38 to 41, quoting the handoff's old lines 65, 89, 106 and 109), and the handoff states `0` and quotes none of them. `node test/repo/em-dash.mjs` prints `em-dash: clean (797 files scanned)`, so the tree is clean in substance; the row as written is not met | in the run's control clone, a planted prose glyph in `adapter.md` makes the stripped count `2` and the gate `FAIL: 1 em dashes outside inline code spans in 1 files`, `exit 1`; a copied ADR file under `.sdlc/verdicts/` makes branding `FAIL: 3 branding violation(s)`, exit 1 |
| H1 | the handoff's figures are true of the commit they describe | 🔴 | the handoff's P3 line reads `added-lines glyph count 0` and `em-dash: clean (794 files scanned)`, and its test line reads `all 53 test files passed`. At `e6ee37e0`, the commit it describes, the count was `4` and review r1 recorded `FAIL: 4 em dashes`, so `npm test` could not have been green there. `4bfd2ba8` removed the glyphs and left those figures unchanged. The header's `branch@sha` names no sha | at `8766a758` the same commands print `1`, `4`, and `797` files, not the handoff's `0` and `794` |

What unblocks it is records only, with no product change: the handoff states P3's `1` and `4` at the head it
describes and quotes the four lines, or review r1 line 39 is requoted in single-backtick spans; and the handoff's P3,
test and header lines are refreshed to the commit they name. The next pass rereads P3 and H1; the other rows carry.

## Met

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U2-1 | §6 drops `after ADR-022`, carries no glyph, names the colon shape and the append rule, drops `line 654`, cites #742 | 🟢 | the six §6-slice greps print `0`, `0`, `1`, `1`, `0`, `1` | the same greps on `git show 8f5c6dc0:.sdlc/adapter.md` print `2`, `3`, `0`, `0`, `1`, `0` |
| U2-2 | every heading uses the shape §6 names (Q2 yes) | 🟢 | `grep -c -E '^## ADR-[0-9]{3}'`, the `: ` form, and the ` - ` form print `27`, `27`, `0` | the ADR-026 heading reverted to the hyphen prints `27`, `26`, `1` |
| U2-3 | the heading edits move no card range; the amendment check stays green | 🟢 | `range mismatches: 0`, `exit 0`, `stale total: 0`, `exit 0`, numstat `2 2` | a blank line above ADR-026 prints the four `start/end ADR-026/027` lines and `range mismatches: 4` (exit 0, since U1's exit line is not on this branch, as the plan says) |
| P1 | `npm test` green, the TESTS count agrees with the baseline, the tree is clean | 🟢 | run at `8766a758`: `✓ all 53 test files passed`, exit 0, `53`, `ok    tests: baseline 53, test/run.mjs TESTS 53`, `git status --short` `0` | `scrimX` in `role-table.json` prints `▶ engine/semantic.mjs FAIL`, `✗ 1/53 test file(s) failed`, `exit 1`; the baseline set to 52 prints `STALE tests: baseline 52, test/run.mjs TESTS 53` |
| P2 | no product source changes | 🟢 | `git diff --name-only "$B" -- src scripts figma mcp plugin package.json \| wc -l` prints `0` | the fixture pair through the row's grep prints `1` |
| P4 | scope wall; no verdict deleted or renamed | 🟢 | `0`, `0`, `2 2`, `0` (the G0 list is empty: `verdicts 162 graded 162 bad 0` at `8f5c6dc0`) | four planted names through the filter print `2`; `git mv` of a verdict that exists at B prints `1`; a third changed line prints `3 3`; a modified unlisted verdict prints `1` |
| U2-p | stub rows reworded in the colon shape without `after ADR-022`; a dated #742 amendment; the `(line 654 at f9e20c5)` cite gone | 🟢 | the stub-row grep prints `2`, the amendment grep `1` (dated 2026-09-26), and `line 654 at f9e20c5` `0`; the stub headings match `decision-records.md` lines 669 and 682 word for word | at `8f5c6dc0` the same greps print `0`, `0` and `1` |

Note, not graded: the plan's design says the amendment records "#742, records-policy U2 review, the pre-land
record's L4". The paragraph cites #742 and gives the reason, but it does not name the review or L4.
