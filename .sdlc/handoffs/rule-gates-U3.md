---
kind: handoff
plan: rule-gates
unit: U3
branch: unit/rg-U3
written: 2026-09-22
pass: 3
---

BASE: `b3961aa9`
HEAD: `99f7efa4`

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

### Addendum from the team lead (a fresh check against the pass-2 code)

- The R7 fixture's `prevLine` ("assumes") had no trailing whitespace, so a mutant that appends the
  comma WITHOUT trimming it first (`out[i-1] + ","` instead of
  `out[i-1].replace(/\s+$/, "") + ","`) produced the identical result and still passed. `prevLine`
  now carries trailing spaces (`"assumes  "`); the mutant now fails: `fix produced "...\nassumes
  ,", expected "...\nassumes,"`. Verified in a fresh clone (below).
- Confirmed there is no tree drift at all: `git diff --stat b3961aa9..HEAD -- . ':!.sdlc'` shows
  exactly one changed file outside `.sdlc/`, `test/repo/em-dash.mjs` itself. The R8 figure is
  addressed in the P3 table's note below.

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
(`13`, `3`, `1`, `2`, `20`, `27`, `565`, `441`, `29`).

There is no tree drift: `git diff --stat b3961aa9..HEAD -- . ':!.sdlc'` shows exactly one file
outside `.sdlc/`, `test/repo/em-dash.mjs` itself (new, all insertions); every other tracked file is
byte-identical to the plan's own measured head. **This explanation is superseded by Pass 3 below.**
The pass-2 span state did not "correctly exclude more dashes"; it over-masked. The review's own
Pass-2 section measured the drop directly (16,744 to 16,713, about 31 real dashes gone blind) and
named the cause: a fence marker's own backtick run toggled the pass-2 "open" flag onto the fenced
block's first content line (masking it whole, most of it real marketing prose), a lone unbalanced
backtick masked the rest of its own line, and the one-line-open streak cap force-closed a second
wrap that was genuinely still open, corrupting the line after it. `R6` (`280` against the plan's
`281`) and `R8` (`8230` against the plan's `8256`) are that same over-masking, not a correctness
gain and not drift. Pass 3 rebuilds the masker from the CommonMark definition instead of patching
the streak cap again; see below for the measured, corrected totals.

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

## Pass 3: rebuild the span masker from CommonMark 6.1

This is the third span-masking patch in a row (finding 1's raw/masked mixup, the wrapped-span
fix, the streak cap), and the streak cap itself over-masked (finding 1 of the Pass-2 review
section above). Rebuilt from the definition instead of patching another case.

`computeMdRoles(lines)` (`test/repo/em-dash.mjs`, the masking section) states the definition in
its own header comment: a code span opens at a run of N backticks and closes at the next run of
exactly N backticks (a different-length run inside does not close it); a span may cross a line
break only inside one paragraph (a blank line, a fence line, a heading, or a table-row boundary
ends the search, so an opener with no closer before that point is literal text, not a span); a
fenced code block is never a span and its fence line never opens one. Implementation:
`findBacktickRuns()` finds every backtick run per line; `matchSpansInScope()` flattens a
paragraph's runs left to right and pairs each unmatched opener with the next same-length run
ahead, wherever it falls (same line or a later one in scope); `computeMdRoles()` walks the file
once, closing the scope at a blank line, a fence line (tracked in/out, content lines get no role
at all -- see below), a heading, or a table row; `maskMdLine()` applies a line's precomputed role
to its CURRENT text (safe after `--fix` edits a dash, since no fix rule ever touches a backtick,
so a line's backtick run count/length/order is stable end to end).

**Fenced content is swept like prose, per the plan.** The plan's design (`rule-gates.md`,
adapter §3, quoted in the masking section's own header comment) is not silent here: "a fenced
block is prose ... and is swept like any other line." So a fence line itself gets no role
(never an opener) and content lines inside a fence get no role either (`computeMdRoles()` skips
them entirely) -- unmasked, counted and fixed exactly like any other prose line. This is also
what fixes the pass-2 bug's biggest single cause (the fence-first-line probe below).

### Acceptance 1: the total

`node test/repo/em-dash.mjs` on the unswept tree: `self-test: PASS`, then
`FAIL: 16746 em dashes outside inline code spans in 343 files`, 2 over the plan's measured
16,744. Compared the new masker against a naive, single-line-only mask (the shape of the
method the plan's own 16,744 was measured with) across every tracked `.md` file: exactly 10
lines differ, net delta +2. All 10 are the plan's naive method mishandling a real CommonMark
cross-line span, in two directions:

- 6 lines where the naive method mis-paired a cross-line span's CLOSING backtick with the next
  backtick on the same line (treating it as a fresh opener) and swallowed a real, outside dash in
  between: `.claude/skills/geometry-system/SKILL.md:58` and `:181`,
  `.claude/skills/lemon-squeezy-api/references/endpoints.md:238`,
  `.claude/skills/maintaining-brand-kit-mcp/references/foundations.md:114`,
  `docs/reference/references/knowledge-02-tonal-scale.md:261`,
  `docs/reference/reviews/2026-07-17-cto-app.md:165`. (+1 each, +6 total: the new masker
  correctly finds the dash naive hid.)
- 4 lines where the naive method, unable to see the cross-line span at all, left a dash counted
  that is genuinely INSIDE a real span: `.claude/skills/geometry-system/SKILL.md:180`,
  `.claude/skills/maintaining-figma-plugins/references/best-practices.md:19` (a verbatim-quoted
  JS string literal, `figma.notify("Couldn't … — please try again.", ...)`, spanning two lines;
  naive's blindness to the wrap would have had `--fix` REWRITE PART OF A QUOTED CODE STRING),
  `docs/tickets/tkt-0031.md:37`, and `:82` (the line the plan's own P3 controls name; the new
  masker correctly gives it 0, matching every prior pass's requirement). (-1 each, -4 total: the
  new masker correctly protects the dash naive wrongly counted.)

Net +6-4 = +2, exactly the gap. The plan's 16,744 is a naive-mask artifact on these 10 lines, not
a target to match; the new, CommonMark-correct total is 16,746.

### Acceptance 2: the reviewer probes

Each probe fixture is verified to red (0 edits, the dash hidden) against the pass-2 code at HEAD
`902d54b7` and pass (the dash found, fixed) against this pass's code, using both files' `fixLines`
run side by side outside the repo (scratchpad `run-pass2.mjs`/`run-pass3.mjs`):

| Probe | Pass-2 result | New result |
|---|---|---|
| Fenced-block first line | 0 edits (fence marker's 3 backticks toggled "open" onto the content line) | 1 edit, R8 |
| Stray backtick, rest of line | 0 edits (lone backtick paired with an imaginary end-of-line closer) | 1 edit, R8 |
| Back-to-back wraps | 0 edits (the streak cap force-closed a still-open second wrap) | 1 edit, R8 |
| `export-drift.md:212` (dash right after an opening `\|`, cell has more content) | 1 edit, R8 -> `\|, (mapped indirectly) \|` (meaning-changing) | 1 edit, R4 -> `\| (mapped indirectly) \|` |

The first three are new self-test fixtures (`fence-first-line`, `stray-backtick-rest-of-line`,
`back-to-back-wraps`). The fourth (Pass-2 review finding 3, not a masking bug) is fixed by adding
`\|` to R4's opening-punctuation set (`,;:(` becomes `,;:(\|`) in both `classifyLine` and
`applyRule`: the pipe already marks the pause the same way `(` does, so the dash drops instead of
falling through to R8's generic `", "`. Fixture `"R4 table cell opens with the dash"` covers it.
This is a small, deliberate extension beyond the plan's literal R4 text (`, : ; (`); flagging it
here for the plan owner rather than silently widening a ratified rule table.

### Acceptance 3: full-tree `--fix`, fresh clone

- `--fix --sample` then `--fix` again: both `329 files changed, 9325 insertions(+), 9325
  deletions(-)`, byte-identical. `git diff --text --numstat` insertions != deletions: `0`.
- Rule table: `13` lines (`R0 a 13`, `R0 b 3`, `R0 c 1`, `R0 d 2`, `R0 e 20`, `R1 27`, `R2 565`,
  `R3 441`, `R4 1`, `R5 0`, `R6 281`, `R7 29`, `R8 8260`). `R6` and `R8` now match the plan's own
  figures (`281`, and the review's own Pass-2-section recount of `8,260` R8 lines) exactly, with
  `R4` at `1` (the export-drift fix) instead of `0`.
- Table integrity, every changed `.md` line, tree-wide: 360 changed table rows, `0` pipe-count
  mismatches (matches the review's own Pass-2 recheck of finding 2 exactly).
- Named lines, all correct after `--fix`: `cto-core.md:36` and `tkt-0031.md:32`/`:82` keep their
  span glyph verbatim, outside dashes on those same lines become commas; the Radio row
  (`component-inventory.md`), the Color-scrims row (`export-drift.md`) and the canvas row
  (`containers.md`) all read `\| none \| none \|` with no `\|, \|`; `export-drift.md`'s
  Color-stops row reads `\| (mapped indirectly) \|` (R4, no leading comma);
  `.sdlc/plans/rule-gates.md:236` is untouched (its one dash is genuinely inside the real,
  balanced `` `"—"` `` span quoted there -- the new masker gets this right for the right reason,
  not the old streak cap's one-line guess).
- `npm test` in a separate fresh clone at this HEAD (before `--fix`, so the gate stays
  unregistered and unswept as U3 requires): `✓ all 48 test files passed`, tree clean after.

### Acceptance 4

The R6/R8 explanation above (in the Pass 2 section) is replaced with the measured cause
(over-masking, primarily the fence-first-line bug) rather than "correct exclusion."

## Self-check

`node test/repo/em-dash.mjs` on this unit's own worktree at HEAD: `self-test: PASS`, then
`FAIL: 16746 em dashes outside inline code spans in 343 files`, `exit 1` (expected: the tree is not
swept, U4 does that). `node test/repo/branding.mjs` in a clone at HEAD: `branding: clean (569 files
scanned)`. `npm test` in a clone (no `node_modules`): `✓ all 48 test files passed`, tree clean
after.
