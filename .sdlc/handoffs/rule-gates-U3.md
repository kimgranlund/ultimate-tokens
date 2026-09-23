---
kind: handoff
plan: rule-gates
unit: U3
branch: unit/rg-U3
written: 2026-09-22
pass: 2
---

BASE: `b3961aa9`
HEAD: `24521155`

# U3 handoff: `em-dash.mjs`, the gate, its self-test and `--fix`, unregistered

## Files

- `test/repo/em-dash.mjs` (new): the em-dash gate, its self-test (a temp-file UTF-8/latin1 read
  check, one fixture per rule-table row, the two exemptions, idempotence) and `--fix --sample`.
  Not registered in `test/run.mjs`; U4 does that.

## Build notes, pass 1 (three defects found and fixed after the first draft)

1. A line ending in a Markdown code span's closing backtick was misclassified as R0 (d) instead
   of R7 (the word-end check did not treat a backtick as a word/bracket/quote character).
2. `--fix` only rewrote the first dash on a line; a line carrying two (a heading's second dash, a
   sentence with two parentheticals) left the second one untouched. Now it loops per line until
   no unmasked dash remains, with R1/R2/R3 (whole-line shape rules) firing at most once per line.
3. The bullet-label rule (R3) only recognized `-`/`*` markers; a numbered-list bullet
   (`1. \`label\` [dash] text`) fell through to R8. Fixed by widening the marker to `(?:[-*]|\d+\.)`.

## Pass 2: review `rg-U3-review.md` (verdict FIX-FIRST), each finding to its fixture and fix

| # | Finding | Self-test fixture (fails before, passes after) | Fix |
|---|---|---|---|
| 1 | `--fix` could rewrite a dash inside a Markdown inline span when the span's dash sat before an outside dash on the same line: `applyRule` searched `line.indexOf(DASH)` etc. on the RAW line, hitting the span first | `"a span dash before the outside dash is never touched"`, a line with `` `gallery [dash] editor` `` then a second, outside dash | `applyRule(raw, masked, ...)` now finds every index on the MASKED line and slices the RAW line at that same offset (the mask keeps positions byte-aligned) |
| 2 | R1 fixed only the first empty table cell on a row; R8 then wrote a table-breaking `\|, \|` into the next one | `"R1 two empty md cells share one row"`, `\| a \| [dash] \| [dash] \| b \|` expecting `\| a \| none \| none \| b \|` | `CELL_FIX_RE` is global with a `(?=\|)` lookahead so it never consumes the closing pipe; every empty cell on the row matches in one pass |
| 3 | The handoff's R8-gap explanation (tree drift) was wrong; the real cause was counting per dash-edit instead of per line, which is how the plan counts a rule | covered structurally: `linesByRule` is now a `Set` of `rel:lineIndex`, so a double-edit on one line cannot double-count | `runFix` counts with `linesByRule[rule].add(rel:lineIndex)`/`.size` instead of an incrementing counter |
| 4 | `--sample` capped every rule at four hits, so R1 (27) and R7 (29), both under P3's 50-hit floor, never showed their real corruption | none needed (a print-only change); verified by rerunning P3's own `grep -cE '^R[0-8] '` and the sampled log | a rule under 50 hits now prints every hit; 50 and over still gets four |
| 5 | The self-test's idempotence and R7 checks were hand-rolled shortcuts that could not fail no matter what the real fix path did; the PINNED exemption was never exercised | `"idempotence"` (a 5-line multi-rule fixture run through `fixLines()` twice, zero edits on pass 2), `"pinned-exemption"` (`shouldSkipFix()` before/after adding a fake path to `PINNED_PATHS`), the R7 case now carries a real `expectFix` | extracted `fixLines()`, the ONE per-line loop `runFix()` and the self-test both call; extracted `shouldSkipFix()` as the seam both `runFix()`'s walk and the self-test use |

Also fixed in the same pass (cheap, same code touched by finding 1): review finding 6, a
trailing `": "` left when R2/R3 fires on a dash that ends the line (`"R2 heading label, dash ends
the line"` fixture, `## title [dash]` now fixes to `## title:` not `## title: `).

## Pass 2, a defect found during re-verification (not in the review, same defect class)

Diffing the two files the review named (`docs/reference/reviews/2026-07-17-cto-core.md`,
`docs/tickets/tkt-0031.md`) after applying the finding-1 fix surfaced a second, related way a span
could still be corrupted: a Markdown inline span can wrap across a line break (CommonMark: the
closing backtick run need not sit on the opening line), which leaves a lone backtick at the start
of the continuation line. `docs/tickets/tkt-0031.md:82` is a real instance
(`` `TKT-XXXX [dash] ...` ``, wrapped from a span opened on line 81); the single-line-only mask
paired that stray backtick with the wrong neighbour and still let the dash inside get rewritten.

Fix: masking now carries an open/closed flag one line ahead (`computeOpenAtStart()`), computed
once up front from backtick COUNT (never touched by any fix rule, so stable through every edit).
Self-test fixture `"wrapped-span-mask"` reproduces it and fixes it.

That in turn created a second-order risk: trusting the open flag indefinitely let one genuinely
unbalanced backtick on an unrelated, complex line propagate "open" for as long as it took to find
another odd count, silently hiding real dashes far away. Found on the SAME re-verification pass:
`.sdlc/plans/rule-gates.md:163` (a long table row mixing prose, code and shell snippets) has an
authoring-slip odd backtick count, and the naive stateful version carried "open" through 73
unrelated lines and hid a real, unrelated dash at line 236 from the gate entirely. Fix: the open
state is capped at one line (every real wrap closes on the very next line; anything still open
after a full extra line is dropped as a false signal). Self-test fixture `"stray-backtick-cap"`
reproduces it and fixes it.

## Criteria

| # | Criterion | Result |
|---|---|---|
| U3-1 | the gate reds on the unswept tree with the measured totals, and the self-test runs first | `node test/repo/em-dash.mjs > g.log 2>&1; echo "exit $?"; grep -c '^self-test: ' g.log; tail -1 g.log` on the unit worktree at HEAD gives `exit 1`, `1`, then `FAIL: 16713 em dashes outside inline code spans in 343 files`. Negative control (change R1's self-test expectation from `"| a | none | b |"` to `"| a | - | b |"`): `self-test: FAIL 1 case(s)`, `  ✗ R1 empty md cell: fix produced "| a | none | b |", expected "| a | - | b |"`, `exit 1`, and no `FAIL: N em dashes` line prints (the run stops before the tree scan) |
| U3-2 | P2's controls (a) to (d) and P3, in a throwaway clone (`$F` under this seat's scratchpad) | see below |
| U3-3 | not registered, and the plan branch stays green | `grep -c '"repo/em-dash.mjs"' test/run.mjs` gives `0`. `npm test` in the clone (no `node_modules`): `✓ all 48 test files passed`, tree clean after (`git status --short` empty), `node test/repo/branding.mjs` gives `branding: clean (569 files scanned)` |
| U3-4 | `--fix` leaves a Markdown span with the glyph byte for byte | `grep -c "` SMOKE PASS [the glyph] gallery" .sdlc/verdicts/records-refresh-U3.md` (glyph built with `printf '\xe2\x80\x94'`, matched against the backtick-quoted span) gives `1` before `--fix` and `1` after: line 78's span keeps its glyph. Pass 2 also checked the two lines the review named directly: `docs/reference/reviews/2026-07-17-cto-core.md:36`'s span `` `defer hpg-parity-roletable [glyph] 3-impl identity ...` `` and `docs/tickets/tkt-0031.md:32`'s span `` `# TKT-XXXX [glyph] ...` `` both keep their glyph after `--fix`, while the outside dashes on those same lines become commas |

### P2, in the clone

- Command run: `node test/repo/em-dash.mjs > g.log 2>&1; echo "exit $?"; grep -c '^self-test: ' g.log; tail -1 g.log; grep -c 'u2014' test/repo/em-dash.mjs; grep -c "[glyph]" test/repo/em-dash.mjs`
- On the unit's own (unswept) tree: `exit 1`, `1`, `FAIL: 16713 em dashes outside inline code spans in 343 files`, `4`, `0`. The plan's own P2 "expected" column (`exit 0`, `em-dash: clean`) describes the tree AFTER U4's sweep; U3 does not sweep, so the honest report here is the unswept-tree figures.
- Control (a), raw dash planted in `README.md`: total goes from `16713` to `16714` in the same `343` files (the new line is new content, not a new file). `exit 1` throughout, as expected.
- Control (b), the same dash inside a backtick span (`` x `[glyph]` y ``): total stays `16713`, the Markdown inline span is exempt, delta zero.
- Control (c), three non-exempt forms in `test/run.mjs`: a template literal (`` const s = `[glyph]`; ``), a lone token (`const e = "[glyph]";`), and the backslash-escaped form (`const j = "{\"v\": \"[glyph]\"}";`) each raise the total from `16713` to `16714` in turn (none is exempt). `--fix` on the tree carrying the escaped form leaves `test/run.mjs`'s added line byte for byte unchanged (`const j = "{\"v\": \"[glyph]\"}";`) and lists it under the R0 (e) residual.
- Control (d), byte-mode reader: with the self-test's own read changed from `"utf8"` to `"latin1"`, the run stops with `self-test: FAIL 1 case(s)`, `  ✗ reader: UTF-8 read found 0 dashes, expected 1`, `exit 1`, before any tree scan.

### P3, in the clone (`git diff --text` throughout; nine generated files carry `-diff`)

Command sequence run: `--fix --sample` once, diff stat; `--fix` again, diff stat (must match); numstat mismatch count; count of lines matching `^R[0-8] `; the two `<n> to <n>` counts (removed vs added); the double-punctuation total; the lone-token total (`.md` files excluded); the final scan's last line. Also, pass 2 only: a tree-wide pipe-count check on every `.md` line that changed (not just the three tables the review named), and a row-count check per file.

| Check | Result |
|---|---|
| two `--fix` runs, diff stat | `329 files changed, 9293 insertions(+), 9293 deletions(-)` both times, identical |
| `git diff --text --numstat` lines where insertions != deletions | `0` |
| lines matching `^R[0-8] ` in the sampled run's output | `13` (five `R0 <letter> <n>` lines plus `R1` through `R8`) |
| `<n> to <n>` pairs removed, then added | `4`, `4` (unchanged from the base tree; no range wording introduced) |
| double-punctuation tokens (`,,`, `, ,`, `.,`, `:,`, `,.`) | `100` before the fix and `100` after (base tree also `100`; the fix adds none) |
| lone-glyph tokens outside `.md` | `39` before the fix and `39` after (unchanged; R0 (e) refuses every one) |
| the rule table's counts | `R0 a 13`, `R0 b 3`, `R0 c 1`, `R0 d 2`, `R0 e 20`, `R1 27`, `R2 565`, `R3 441`, `R4 0`, `R5 0`, `R6 280`, `R7 29`, `R8 8230` |
| final scan after `--fix` | `FAIL: 6615 em dashes outside inline code spans in 27 files` (the `GENERATED` set `--fix` skips: `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`, `src/ui/mcp-assets.js`, `src/ui/figma-plugin-assets.js`, `src/ui/categories/*.js`, `docs/reference/data/adia-*`, plus the 39 lone tokens and 39 R0-refused lines these generated mirrors also carry) |
| pipe-count check, every `.md` line that changed, tree-wide (not just the three named tables) | `0` mismatches across all 329 changed files (a Python check comparing `str.count("\|")` per line, before vs. after, for every line whose BEFORE count was `>= 2`) |
| row-count check, every changed `.md` file | `0` files where the count of lines starting `\|` differs before vs. after |

`R0 a` through `R0 e`, `R1`, `R2`, `R3`, and `R7` match the plan's own measured figures exactly
(`13`, `3`, `1`, `2`, `20`, `27`, `565`, `441`, `29`). `R6` (`280`) is one below the plan's `281`
and `R8` (`8230`) is well below the plan's `8256`: both are downstream of the pass-2 span-masking
fixes correctly EXCLUDING more dashes that sit inside a span (the wrapped-span fix and the
stray-backtick cap both remove real dashes from the countable set that a less correct mask would
have wrongly counted and, for R6/R8, wrongly rewritten). This is a change in which dashes are
outside a span at all, not a rule-classification defect: every rule ahead of R6/R8 in priority,
and R6/R8's own residual behaviour on the two review-named lines, checked out by hand above.

## Disagreements with the plan

- The plan's P3 command block does not spell out that R0 should print per-construct; read literally
  against the "13 rule lines" expectation, one aggregate `R0 <n>` line plus `R1`.."R8" is only 9
  lines. Printed the five `R0 <letter> <n>` lines instead so the count (13) and the "every R0 count
  equal to the number of lines in its list" check both hold structurally, not just arithmetically.
- The residual-list header was first `"R0 residual (left in place, fix by hand):"`, which itself
  matches the P3 grep pattern `^R[0-8] ` and would have inflated the rule-line count by one; renamed
  to `"residual (left in place, fix by hand):"`.
- Pass 1's handoff explained the R8 gap as tree drift; the review (finding 3) showed that was
  wrong, the real cause was a per-dash-edit count where the plan counts per line. Corrected in
  pass 2 (see the rule table above); the residual R6/R8 gaps are now explained by the span-masking
  fixes, not drift or a counting-unit mismatch.

## Self-check

`node test/repo/em-dash.mjs` on this unit's own worktree at HEAD: `self-test: PASS`, then
`FAIL: 16713 em dashes outside inline code spans in 343 files`, `exit 1` (expected: the tree is not
swept, U4 does that). `node test/repo/branding.mjs` in the clone at HEAD: `branding: clean (569 files
scanned)`. `npm test` in the clone (no `node_modules`): `✓ all 48 test files passed`, tree clean
after.
