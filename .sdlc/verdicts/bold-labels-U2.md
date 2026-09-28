---
kind: verdict
plan: bold-labels
unit: U2
ticket: "#752"
branch: unit/bl-U2
base: e3a114d6
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-28
---

# Verdict bold-labels U2 · 🟢 · the 32 store-copy field labels take the colon, the fenced copy is byte-identical

verdict: 🟢
sha: c698012451ec7c75cdb615048d51962a04f29848

`unit/bl-U2` at `c6980124`, with `B` = `git merge-base origin/main HEAD` = `e3a114d6`. Q1 was answered colon. The
criteria are the plan's U2 rows, and the P rows at revision 4 (`b50c4f10`), whose P4 also admits the two MCP
bundles; U2 touches neither bundle. The evidence run (`$CLAUDE_JOB_DIR/tmp/blU2/report.md`) used throwaway
clones at `c6980124`. I reran U2-1 to U2-4 in the unit worktree, and their figures are mine. `verdict.py check`
passes on the handoff and the review.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U2-1 | 32 hits removed from `docs/marketing/store-copy.md`, none added, none left | 🟢 | mine: the three greps print `32`, `0`, `0` | one label reverted to the comma prints `31`, `0`, `1` |
| U2-2 | voice-check silent and green | 🟢 | mine: no output line, then `exit=0` | `, leverage it` appended to line 52 prints `ERROR: banned lexicon: "leverage"` and `exit=1` |
| U2-3 | no fenced block changed | 🟢 | mine: `blocks-identical` | one character changed inside a fence prints a diff and no `blocks-identical` |
| U2-4 | the Placeholders line reads as ruled | 🟢 | mine: `1`, and the diff shows ``-**Placeholders**, replace before publishing:`` and ``+**Placeholders** to replace before publishing:`` | the base file prints `0` |
| P1 | the count control, for a U2 branch cut before U1 merges | 🟢 | the predicate reads `53` (`85` at `$B`, minus U2's 32); no hit is left in `store-copy.md` | `**Probe**, a planted line` in `README.md` prints `54` |
| P2 | no added U+2014; the em-dash gate is green | 🟢 | `em-dash: clean (807 files scanned)`, exit 0; the added-line glyph grep prints `0` | a U+2014 line appended to `mcp/README.md` reds the gate (`FAIL: 1 em dashes`, exit 1), and the grep prints `1` |
| P3 | branding clean; added and removed bold-line counts agree for a colon-only edit | 🟢 | `branding: clean (799 files scanned)`; `32` added, `32` removed. The plan-wide "removed minus one" comes from U1's row 29, not from U2 | `**Planted**: text` appended to `store-copy.md` prints `33`, `32` |
| P4 | scope wall (revision 4) | 🟢 | `0`, `0`; the only path outside `.sdlc` is `docs/marketing/store-copy.md`, and nothing was regenerated | a planted `docs/spec/planted.md` (`git add -N`) makes the first count `1` |
| P5 | line-for-line edit | 🟢 | `line-for-line` | line 52 split in two prints `UNEQUAL 33 32 docs/marketing/store-copy.md`, exit 1 |
| P6 | `npm test` green, the tree clean after | 🟢 | at `c6980124`: `✓ all 53 test files passed`, exit 0; `git status --short` `0` | `scrimX` in `role-table.json` prints `engine/semantic.mjs FAIL`, `✗ 1/53 test file(s) failed`, exit 1 |
| P8 | the live URL count in `README.md` is unchanged | 🟢 | `3` at the head and `3` at `$B` | the URL dropped from README line 6 prints `2` |

P0 (U3's G1 gate) and P7 (U1's lines) are not U2's rows.

Notes, not criteria:
- The handoff's P6 line gives `git status --short` as "only store-copy.md", taken before its own commit; the plan's figure is `0`, which the run reads after the commit.
- The handoff paraphrases P2's command instead of quoting it.
- The review diffs against `0b551835`, not the plan's `e3a114d6`; the store-copy diff is the same at both.
None of these changes a figure.
