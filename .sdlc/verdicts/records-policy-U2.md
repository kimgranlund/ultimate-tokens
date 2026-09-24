---
kind: verdict
plan: records-policy
unit: U2
ticket: "#721"
branch: unit/rp-U2
base: plan/records-policy @ 2ab7ec42
grade: verifier-l3, the evidence run dispatched by the Verifier seat, which re-derived the rows marked mine
contract: U2-1 to U2-8 and the plan rows P1 to P4 of .sdlc/plans/records-policy.md at 966a62b1
pass: 1
written: 2026-09-24
---

# Verdict records-policy U2 · 🔴 · 8 of 8 U2 rows 🟢, P1 and P2 red on the review record the head adds

verdict: 🔴
sha: 966a62b14c216564cc865b8c7fb6091491aba67b

`unit/rp-U2` at `966a62b1`. The evidence run's report is at `/tmp/v13/rp-U2-verify.md`. The worktree
was only read and is clean (`0`). The unit's own work, ADR-027 and the three cards and rows, is right
on every U2 row. The red is in the last commit, which adds only the review record: that record trips
the branding gate, so `npm test` fails at this head.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P2 | branding clean | 🔴 | run and mine: `FAIL: 1 branding violation(s) across 651 files`, the one file `.sdlc/verdicts/records-policy-U2-review.md`. Its lines 30 and 59 quote, in backticks, the gate's pattern for the retired maker's name in upper case, and the gate has no quote exemption (adapter, verbatim-quote rule). Mine at `0755742b`, the commit the review graded: `branding: clean (650 files scanned)`; `git diff --stat 0755742b 966a62b1` is that one file | the two lines neutralised in a clone: `branding: clean (651 files scanned)`; a name built at run time in a card: `FAIL: 1` |
| P1 | `npm test` green | 🔴 | `✗ 1/49 test file(s) failed`, exit `1`, the one failure `repo/branding.mjs` on the same file; tree `0` after | the `minor` line's `//` changed to `/*`: exit `1`, `SyntaxError` |

What unblocks: the review record paraphrases the name on those two lines (the adapter's rule is to
cut the quote and mark it `altered: retired name removed`), then P1 and P2 rerun. No U2 file needs to move.

## Green

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U2-1 | ADR-027 after ADR-026 and before the Quick map, nothing removed | 🟢 | `## ADR-026 - ## ADR-027 - ## Quick map `; numstat removals `0` (`49 0`) | a `---` line deleted: removals `1`; the section moved past the Quick map: the order line changes |
| U2-2 | the heading's shape | 🟢 | `1`, `0` | the heading rewritten with a dash: `0`, `1` |
| U2-3 | the grepped clauses, one line each | 🟢 | `1`, `1`, `1`, `1` | one clause reworded: `1`, `0`, `1`, `1` |
| U2-3b | rule (4) present | 🟢 | `1`, `1` | rule (4) deleted: `0`, `0` |
| U2-4 | Status PROPOSED, not DECIDED | 🟢 | `1`, `0` | Status written `DECIDED 2026-09-22`: `1`, `1` |
| U2-5 | three cards, index and ledger rows | 🟢 | `1`, `3`, `3`, `3` | the three restored from `2ab7ec42`: `0`, `No such file` ×3, `0`, `0` |
| U2-6 | card ranges match the ADRs | 🟢 | ranges `696-728`, `730-768`, `770-816`, checked by hand at each boundary; `card-source-range-check.sh`: `range mismatches: 0` | the 025 range set to `682-694`: `range mismatches: 2`, exit `0`, so the printed figure is the reading |
| U2-7 | ADR-027's index row and card are its own | 🟢 | `3`, `1`, `0`, `2` | the index row alone copied from 024: `3`, `0`, `1`; card and row both copied: `0`, `0`, `1`, `2` |
| U2-8 | the G0 line names a real sha and 027 was free | 🟢 | `2`; `2a1cd5c8` is on `origin/main`'s first-parent history, where `^## ADR-026 ` is `1` and `^## ADR-027 ` is `0` | a G0 line without a sha through the filter: `0` |
| P3 | scope wall | 🟢 | `0`, `0`; nothing under `.claude/docs/other/` | a fixture engine path: `1` |
| P4 | the generated artifacts do not move | 🟢 | both written at `1.2.0`; `0`, `0`; tree `0` | the live string `1.2.0` to `1.2.1` and regenerated: `1`; committed: `2` |

## Notes

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| N1 | the plan's review notes: P4's control names `1.1.0` | 🟡 | `grep -c 'version: "1.1.0"'` gives `0`, so the written plant is a no-op and cannot red the row; the live string bites (P4 above) | the live-string plant: `1`, `2` |
| N2 | U2-7's written control copies the row only | 🟡 | the row alone reds only the second figure, `3`, `0`, `1`; the row and card copied together red three figures. The row discriminates; its wording undersells what it needs | the two runs above |
| N3 | `npm test` took 599 s | 🟡 | host load, not the diff: this run took `7:41.97` on the same host, the baseline says `56 to 60 s`, and the unit touches no test input | the unit's diff has `0` paths on the test path |
| N4 | a pre-land blocker for the plan, not this unit | 🟡 | `verdict-frontmatter-check.sh` prints `MISSING records-policy-U1-review.md: no verdict: line`, `bad 1`, at this head and at the base `2ab7ec42`; the file came from U1 at `2be1fc71` and is not on main. The plan cannot land until it carries its own grade | the U2 review's line stripped: `bad 2`, both names listed |

The other checks read clean at head and base: `stale total: 0` twice, `range mismatches: 0`,
`rows 56 drifted 11 holds 45 undetermined 0 bad 0`, `ceiling-counts: clean`.

verdict: 🔴
sha: 966a62b14c216564cc865b8c7fb6091491aba67b
