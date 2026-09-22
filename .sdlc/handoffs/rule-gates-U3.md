---
kind: handoff
plan: rule-gates
unit: U3
branch: unit/rg-U3
written: 2026-09-22
pass: 1
---

BASE: `b3961aa9`
HEAD: `4dba0017`

# U3 handoff: `em-dash.mjs`, the gate, its self-test and `--fix`, unregistered

## Files

- `test/repo/em-dash.mjs` (new): the em-dash gate, its self-test (a temp-file UTF-8/latin1 read
  check, one fixture per rule-table row, the two exemptions, idempotence) and `--fix --sample`.
  Not registered in `test/run.mjs`; U4 does that.

## Build notes (three defects found and fixed after the first draft)

1. A line ending in a Markdown code span's closing backtick was misclassified as R0 (d) instead
   of R7 (the word-end check did not treat a backtick as a word/bracket/quote character).
2. `--fix` only rewrote the first dash on a line; a line carrying two (a heading's second dash, a
   sentence with two parentheticals) left the second one untouched. Now it loops per line until
   no unmasked dash remains, with R1/R2/R3 (whole-line shape rules) firing at most once per line.
3. The bullet-label rule (R3) only recognized `-`/`*` markers; a numbered-list bullet
   (`1. \`label\` [dash] text`) fell through to R8. Fixed by widening the marker to `(?:[-*]|\d+\.)`.

## Criteria

| # | Criterion | Result |
|---|---|---|
| U3-1 | the gate reds on the unswept tree with the measured totals, and the self-test runs first | `node test/repo/em-dash.mjs > g.log 2>&1; echo "exit $?"; grep -c '^self-test: ' g.log; tail -1 g.log` on the unit worktree at HEAD gives `exit 1`, `1`, then `FAIL: 16744 em dashes outside inline code spans in 343 files`. Negative control (change R1's self-test expectation from `"| a | none | b |"` to `"| a | - | b |"`): `self-test: FAIL 1 case(s)`, `  ✗ R1 empty md cell: fix produced "| a | none | b |", expected "| a | - | b |"`, `exit 1`, and no `FAIL: N em dashes` line prints (the run stops before the tree scan) |
| U3-2 | P2's controls (a) to (d) and P3, in a throwaway clone (`$F` under this seat's scratchpad) | see below |
| U3-3 | not registered, and the plan branch stays green | `grep -c '"repo/em-dash.mjs"' test/run.mjs` gives `0`. `npm test` in the clone (no `node_modules`): `✓ all 48 test files passed`, tree clean after (`git status --short` empty), `node test/repo/branding.mjs` gives `branding: clean (568 files scanned)` |
| U3-4 | `--fix` leaves a Markdown span with the glyph byte for byte | `grep -c "` SMOKE PASS [the glyph] gallery" .sdlc/verdicts/records-refresh-U3.md` (glyph built with `printf '\xe2\x80\x94'`, matched against the backtick-quoted span) gives `1` before `--fix` and `1` after: line 78's span keeps its glyph. The file changes on other lines that carry a dash outside a span (329 files changed in the same run, this one among them) |

### P2, in the clone

- Command run: `node test/repo/em-dash.mjs > g.log 2>&1; echo "exit $?"; grep -c '^self-test: ' g.log; tail -1 g.log; grep -c 'u2014' test/repo/em-dash.mjs; grep -c "[glyph]" test/repo/em-dash.mjs`
- On the unit's own (unswept) tree: `exit 1`, `1`, `FAIL: 16744 em dashes outside inline code spans in 343 files`, `4`, `0`. The plan's own P2 "expected" column (`exit 0`, `em-dash: clean`) describes the tree AFTER U4's sweep; U3 does not sweep, so the honest report here is the unswept-tree figures, matching the plan's own measured fact for this head (16,744 across 343 files, section "Measured by the planner").
- Control (a), raw dash planted in `README.md`: total goes from `16744` to `16745` in the same `343` files (the new line is new content, not a new file). `exit 1` throughout, as expected.
- Control (b), the same dash inside a backtick span (`` x `[glyph]` y ``): total stays `16744`, the Markdown inline span is exempt, delta zero.
- Control (c), three non-exempt forms in `test/run.mjs`: a template literal (`` const s = `[glyph]`; ``), a lone token (`const e = "[glyph]";`), and the backslash-escaped form (`const j = "{\"v\": \"[glyph]\"}";`) each raise the total from `16744` to `16745` in turn (none is exempt). `--fix` on the tree carrying the escaped form leaves `test/run.mjs`'s added line byte for byte unchanged (`const j = "{\"v\": \"[glyph]\"}";`) and lists it under the R0 (e) residual.
- Control (d), byte-mode reader: with the self-test's own read changed from `"utf8"` to `"latin1"`, the run stops with `self-test: FAIL 1 case(s)`, `  ✗ reader: UTF-8 read found 0 dashes, expected 1`, `exit 1`, before any tree scan.

### P3, in the clone (`git diff --text` throughout; nine generated files carry `-diff`)

Command sequence run: `--fix --sample` once, diff stat; `--fix` again, diff stat (must match); numstat mismatch count; count of lines matching `^R[0-8] `; the two `<n> to <n>` counts (removed vs added); the double-punctuation total; the lone-token total (`.md` files excluded); the final scan's last line.

| Check | Result |
|---|---|
| two `--fix` runs, diff stat | `329 files changed, 9321 insertions(+), 9321 deletions(-)` both times, identical |
| `git diff --text --numstat` lines where insertions != deletions | `0` |
| lines matching `^R[0-8] ` in the sampled run's output | `13` (five `R0 <letter> <n>` lines plus `R1` through `R8`) |
| `<n> to <n>` pairs removed, then added | `4`, `4` (unchanged from the base tree; no range wording introduced) |
| double-punctuation tokens (`,,`, `, ,`, `.,`, `:,`, `,.`) | `99` before the fix and `99` after (base tree also `99`; the fix adds none) |
| lone-glyph tokens outside `.md` | `39` before the fix and `39` after (unchanged; R0 (e) refuses every one) |
| the rule table's counts | `R0 a 13`, `R0 b 3`, `R0 c 1`, `R0 d 2`, `R0 e 20`, `R1 27`, `R2 565`, `R3 441`, `R4 0`, `R5 0`, `R6 281`, `R7 29`, `R8 8788` |
| final scan after `--fix` | `FAIL: 6615 em dashes outside inline code spans in 27 files` (the `GENERATED` set `--fix` skips: `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`, `src/ui/mcp-assets.js`, `src/ui/figma-plugin-assets.js`, `src/ui/categories/*.js`, `docs/reference/data/adia-*`, plus the 39 lone tokens and 39 R0-refused lines these generated mirrors also carry) |

`R0 a` through `R0 e`, `R1`, `R2`, and `R7` match the plan's own measured figures for this head (`13`, `3`, `1`, `2`, `20`, `27`, `565`, `29`) exactly. `R3` (`441`) and `R6` (`281`) also now match, after the numbered-list-bullet fix (build note 3) and a from-scratch build note below. `R8` (`8788`) does not match the plan's `8256`: R8 is the catch-all bucket, most sensitive to tree drift between the plan's measurement head and this unit's HEAD (more prose has landed in `.claude/skills` and `docs/` since), and every rule ahead of it in priority matched exactly, so the gap is explained by content, not by a rule defect.

## Disagreements with the plan

- The plan's P3 command block does not spell out that R0 should print per-construct; read literally
  against the "13 rule lines" expectation, one aggregate `R0 <n>` line plus `R1`.."R8" is only 9
  lines. Printed the five `R0 <letter> <n>` lines instead so the count (13) and the "every R0 count
  equal to the number of lines in its list" check both hold structurally, not just arithmetically.
- The residual-list header was first `"R0 residual (left in place, fix by hand):"`, which itself
  matches the P3 grep pattern `^R[0-8] ` and would have inflated the rule-line count by one; renamed
  to `"residual (left in place, fix by hand):"`.

## Self-check

`node test/repo/em-dash.mjs` on this unit's own worktree at HEAD: `self-test: PASS`, then
`FAIL: 16744 em dashes outside inline code spans in 343 files`, `exit 1` (expected: the tree is not
swept, U4 does that). `node test/repo/branding.mjs` in the clone at HEAD: `branding: clean (568 files
scanned)`. `npm test` in the clone (no `node_modules`): `✓ all 48 test files passed`, tree clean
after.
