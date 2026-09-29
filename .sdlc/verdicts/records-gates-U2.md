---
kind: verdict
plan: records-gates
unit: U2
ticket: "#742"
branch: unit/rc-U2
base: 8f5c6dc0
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 2
written: 2026-09-28
---

# Verdict records-gates U2 · 🟡 · pass 2: P3 and the handoff's figures hold; the handoff overstates its quotes as word for word

verdict: 🟡
sha: bc7031b12b2763d8f41f64e5812b71b4255fd397

Pass 2, records-only. `unit/rc-U2` at `bc7031b1`, with `B` = `8f5c6dc0`. `git log 8766a758..bc7031b1` is one commit,
and it changes `.sdlc/handoffs/records-gates-U2.md` (20 lines) and `.sdlc/verdicts/records-gates-U2-review.md` (line 39)
alone. U2-1 to U2-3, P2, P4 and the prose items carry from pass 1 at `8766a758`. This pass rereads P3, H1 and P1.
`verdict.py check` on both records `--against` their `8766a758` copies exits 0.

## Pass 2

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P3 | branding clean; the added-line glyph count outside spans is `0`; the raw non-handoff count equals a count the handoff states, with each line quoted; the em-dash gate is green | 🟢 | mine, in the unit worktree at `bc7031b1`: `branding: clean (789 files scanned)`; the stripped count prints `0`; the raw non-handoff count prints `4`, and the handoff states `4` and names review r1 lines 38 to 41, which quote the old lines; `em-dash: clean (797 files scanned)`, `exit 0` | the same stripped count on `git diff 8f5c6dc0 8766a758` (line 39 in its double-backtick span) prints `1`; pass 1's planted controls carry (`FAIL: 1 em dashes`, exit 1; `FAIL: 3 branding violation(s)`, exit 1) |
| H1 | the handoff's figures are true of the commit they name | 🟡 | mine: the header now names `8766a758` plus the fix commit and `e6ee37e0` as the build. Every P3 figure matches my rerun. The history holds: in a clone at `e6ee37e0`, `node test/repo/em-dash.mjs` prints `FAIL: 4 em dashes outside inline code spans in 1 files`, exit 1, so `npm test` could not be green there, as the handoff now says. The concern is that the handoff says review r1 lines 38 to 41 quote its old lines 65, 89, 106 and 109 "word for word", and they do not. Line 38 turns the backticked `2, 3, 0, 0, 1, 0` into double quotes. Line 39 now drops the backticks around `exit 1`. Lines 40 and 41 are elided with `...`. The glyph and the sense are kept, and no count moves | `git show e6ee37e0:.sdlc/handoffs/records-gates-U2.md` lines 65 and 89 carry the backticked `2, 3, 0, 0, 1, 0` and `exit 1`, against review lines 38 and 39 |
| P1 | `npm test` green, the TESTS count agrees with the baseline, the tree is clean | 🟢 | mine, in a throwaway clone at `bc7031b1` (`$CLAUDE_JOB_DIR/tmp/rcU2/p2-npmtest.log`): `✓ all 53 test files passed`, `exit 0` from my own `echo`, `git status --short` `0` after. The builder's blank exit echo is not relied on | pass 1's control at `8766a758` carries, since only records moved: `scrimX` in `role-table.json` printed `✗ 1/53 test file(s) failed`, `exit 1` |

The 🟡 is H1 alone: a records wording fix ("quote", not "word for word"), which can ride any later records commit
before pre-land.

## Met (carried from pass 1 at `8766a758`)

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U2-1 | §6 drops `after ADR-022`, carries no glyph, names the colon shape and the append rule, drops `line 654`, cites #742 | 🟢 | the six §6-slice greps print `0`, `0`, `1`, `1`, `0`, `1` | the same greps on `git show 8f5c6dc0:.sdlc/adapter.md` print `2`, `3`, `0`, `0`, `1`, `0` |
| U2-2 | every heading uses the shape §6 names (Q2 yes) | 🟢 | `grep -c -E '^## ADR-[0-9]{3}'`, the `: ` form, and the ` - ` form print `27`, `27`, `0` | the ADR-026 heading reverted to the hyphen prints `27`, `26`, `1` |
| U2-3 | the heading edits move no card range; the amendment check stays green | 🟢 | `range mismatches: 0`, `exit 0`, `stale total: 0`, `exit 0`, numstat `2 2` | a blank line above ADR-026 prints the four `start/end ADR-026/027` lines and `range mismatches: 4` (exit 0, since U1's exit line is not on this branch, as the plan says) |
| P2 | no product source changes | 🟢 | `git diff --name-only "$B" -- src scripts figma mcp plugin package.json \| wc -l` prints `0` | the fixture pair through the row's grep prints `1` |
| P4 | scope wall; no verdict deleted or renamed | 🟢 | `0`, `0`, `2 2`, `0` (the G0 list is empty: `verdicts 162 graded 162 bad 0` at `8f5c6dc0`) | four planted names through the filter print `2`; `git mv` of a verdict that exists at B prints `1`; a third changed line prints `3 3`; a modified unlisted verdict prints `1` |
| U2-p | stub rows reworded in the colon shape without `after ADR-022`; a dated #742 amendment; the `(line 654 at f9e20c5)` cite gone | 🟢 | the stub-row grep prints `2`, the amendment grep `1` (dated 2026-09-26), and `line 654 at f9e20c5` `0`; the stub headings match `decision-records.md` lines 669 and 682 word for word | at `8f5c6dc0` the same greps print `0`, `0` and `1` |

Note, not graded: the plan's design says the amendment records "#742, records-policy U2 review, the pre-land
record's L4". The paragraph cites #742 and gives the reason, but it does not name the review or L4.
