---
kind: handoff
plan: rule-gates
unit: U3
branch: unit/rg-U3
written: 2026-09-22
pass: 5
---

BASE: `b3961aa9`
HEAD: `2ebde63a`

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
| U3-1 | the gate reds on the unswept tree with the measured totals, and the self-test runs first | `node test/repo/em-dash.mjs > g.log 2>&1; echo "exit $?"; grep -c '^self-test: ' g.log; tail -1 g.log` on the unit worktree at HEAD gives `exit 1`, `1`, then `FAIL: 16746 em dashes outside inline code spans in 343 files`. Negative control (change R1's self-test expectation from `"| a | none | b |"` to `"| a | - | b |"`): `self-test: FAIL 1 case(s)`, `  ✗ R1 empty md cell: fix produced "| a | none | b |", expected "| a | - | b |"`, `exit 1`, and no `FAIL: N em dashes` line prints (the run stops before the tree scan) |
| U3-2 | P2's controls (a) to (d) and P3, in a throwaway clone (`$F` under this seat's scratchpad) | see below |
| U3-3 | not registered, and the plan branch stays green | `grep -c '"repo/em-dash.mjs"' test/run.mjs` gives `0`. `npm test` in the clone (no `node_modules`): `✓ all 48 test files passed`, tree clean after (`git status --short` empty), `node test/repo/branding.mjs` gives `branding: clean (569 files scanned)` |
| U3-4 | `--fix` leaves a Markdown span with the glyph byte for byte | `grep -c "` SMOKE PASS [the glyph] gallery" .sdlc/verdicts/records-refresh-U3.md` (glyph built with `printf '\xe2\x80\x94'`, matched against the backtick-quoted span) gives `1` before `--fix` and `1` after: line 78's span keeps its glyph. Pass 2 also checked the two lines the review named directly: `docs/reference/reviews/2026-07-17-cto-core.md:36`'s span `` `defer hpg-parity-roletable [glyph] 3-impl identity ...` `` and `docs/tickets/tkt-0031.md:32`'s span `` `# TKT-XXXX [glyph] ...` `` both keep their glyph after `--fix`, while the outside dashes on those same lines become commas |

### P2, in the clone

- Command run: `node test/repo/em-dash.mjs > g.log 2>&1; echo "exit $?"; grep -c '^self-test: ' g.log; tail -1 g.log; grep -c 'u2014' test/repo/em-dash.mjs; grep -c "[glyph]" test/repo/em-dash.mjs`
- On the unit's own (unswept) tree: `exit 1`, `1`, `FAIL: 16746 em dashes outside inline code spans in 343 files`, `4`, `0`. The plan's own P2 "expected" column (`exit 0`, `em-dash: clean`) describes the tree AFTER U4's sweep; U3 does not sweep, so the honest report here is the unswept-tree figures.
- Control (a), raw dash planted in `README.md`: total goes from `16746` to `16747` in the same `343` files (the new line is new content, not a new file). `exit 1` throughout, as expected.
- Control (b), the same dash inside a backtick span (`` x `[glyph]` y ``): total stays `16746`, the Markdown inline span is exempt, delta zero.
- Control (c), three non-exempt forms in `test/run.mjs`: a template literal (`` const s = `[glyph]`; ``), a lone token (`const e = "[glyph]";`), and the backslash-escaped form (`const j = "{\"v\": \"[glyph]\"}";`) each raise the total from `16746` to `16747` in turn (none is exempt). `--fix` on the tree carrying the escaped form leaves `test/run.mjs`'s added line byte for byte unchanged (`const j = "{\"v\": \"[glyph]\"}";`) and lists it under the R0 (e) residual.
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

## Pass 3 fold-in: the review's Pass 3 section, findings 1 and 2

Two small FIX-FIRST items from the re-review of `99f7efa4`/`71ba7ca5`, code at `b9f159f2`:

1. `computeMdRoles()`'s paragraph scope never ended at a list-item marker line. Under CommonMark
   each list item is its own block, so a span cannot cross from one item into the next -- a stray
   backtick in one bullet could pair with a stray backtick several bullets later and
   `fullyMasked` every bullet in between, dash included. Nothing in the tracked tree hits this
   today (the fresh-clone total is unchanged, `16746`); it is a guard against a later branch. Fix:
   `isListItemLine()` (`` /^\s*([-*+]|\d+[.)])\s/ ``) now ends the scope the same way a blank
   line, a fence line, a heading or a table row does, except on the scope's own first line.
   Fixture `"list-item-scope-break"` (three bullets: a stray backtick in item 1, the dash in item
   2, the phantom pair's closer in item 3) reds on `b9f159f2`'s parent (0 edits, the dash hidden)
   and passes now (1 edit, R8).
2. No fixture pinned CommonMark's run-length rule itself: a mutant changing the closer test from
   "same length" to "any run closes" (`.length === openLen` to `.length >= 1`) still passed the
   whole self-test, while the real tree total moved from `16746` to `16751` under that mutant.
   Fixture `"run-length-mismatch"` (a 2-backtick opener, a 1-backtick run after it that must NOT
   close it, so the whole thing is literal and the dash between them stays outside, countable)
   reds under the mutant (0 edits, the dash wrongly masked) and passes against the real code (1
   edit, R8). Verified directly: the mutant fails `self-test` with this fixture in place.

Finding 4 (R4's extension to `\|` changed the plan's rule-table meaning) was left for the
Orchestrator/planner at `b9f159f2`. **Now ruled and applied** (plan revision 9, `7f916033` on
`plan/rule-gates`): `\|` comes back out of R4 (reverted to `, : ; (`); a Markdown table cell that
opens with the dash and carries more text is R0 (f), refused and named, never rewritten --
`export-drift.md:212`'s `\| — (mapped indirectly) \|` stays as is, and U4 rewrites it by hand as
`\| none (mapped indirectly) \|`. `CELL_OPEN_DASH_RE` (a `\|` then the dash, NOT immediately
followed by the closing `\|`, which is R1's whole-cell case) drives it. Self-test control
`"r0f-refused"` checks the line survives `fixLines()` byte for byte and is recorded as one R0 (f)
edit.

Rechecked in a fresh clone at `899f2be0`: `self-test: PASS`, `FAIL: 16746 em dashes ... in 343
files` (unchanged; the R0-vs-R4 reclassification does not change the gate's total -- masking, not
rule assignment, decides what counts). Full-tree `--fix --sample` then `--fix` again: both `329
files changed, 9324 insertions(+), 9324 deletions(-)`, byte-identical; numstat mismatches `0`;
`13` rule lines with `R0 f 1` and `R4 0` (`export-drift.md:212` is the sole R0 (f) hit, listed
under the residual, never rewritten); the other counts unchanged from Pass 3's table. 359 changed
table rows (one fewer than before, since `export-drift.md:212` is no longer rewritten), `0`
pipe-count mismatches. `npm test` in a separate, unswept fresh clone: `✓ all 48 test files
passed`, exit `0`, tree clean after.

## Pass 4: the verifier's reds and yellows (`verdict-rg-U3.md`, rows 6, 16, 19, 24, 27)

Verdict on `397e69ea` was 🔴 (2 reds, 3 yellows, 22 green of 27). Fixed at `96afaf70`.

1. Row 6 🔴, P2 (d). The self-test's byte-mode fixture called its own `readFileSync(tmp, "utf8")`,
   never the gate's own `readText()`. A `readText()` mutated to `"latin1"` (control d2) or a
   `Buffer` read via `.toString("binary")` (control d3) both went `self-test: PASS` then
   `em-dash: clean` -- vacuously green over all 16,746 real dashes. Fixed: the fixture now reads
   the temp file through `readText(tmp)` itself. Verified in a fresh clone: both mutants now fail
   `self-test` before the scan (`✗ reader: readText() found 0 dashes, expected 1`). A separate,
   hand-rolled `latin1` read stays alongside only to prove the two disagree.
2. Row 19 🔴, R0 (g) (plan revision 10). A dash whose only text before it on the line is a leading
   `//`, `#` or `>` fell through to R8's generic `", "` right after the marker: the email sign-off
   `docs/marketing/store-copy.md:486` (`> [dash] Ultimate Tokens`) became `>, Ultimate Tokens`, and
   13 more lines opened with a stray comma. Fixed: `MARKER_PREFIX_RE` (the dash's line-prefix,
   trimmed, is exactly `//`, one or more `#`, or `>`) is checked ahead of the existing line-start
   check and refuses (R0 (g)), since there is no sentence above to join (R7) and no line-before to
   check (R0 (d)). Self-test fixtures for a JS comment, a YAML/shell comment and the blockquote
   sign-off, plus a `"r0g-refused"` byte-for-byte control. All 14 tree lines, one dash each:
   `.github/workflows/pages.yml:12`, `docs/marketing/store-copy.md:486`,
   `figma/binder/figma-semantic-binder/code.js:82`, `:719`,
   `figma/binder/mode-apply-plan.mjs:361`, `:466`, `src/engine/exports.js:185`,
   `src/engine/prime.mjs:12`, `src/engine/tonal.js:122`, `src/ui/model.mjs:709`,
   `src/ui/sections/geometry.js:866`, `test/engine/exports.mjs:2107`,
   `test/figma/binder.mjs:106`, `test/mcp/brand-kit-merged.mjs:4`. P3, run in a fresh clone at
   `96afaf70`: `R0 g 14`, `15` rule lines total (matching plan revision 10's expectation exactly).
3. Row 16 🟡, R7. `raw.slice(idx + 1).replace(/^\s+/, "")` dropped a continuation's leading
   indentation along with the dash (`decision-records.md:235`, five spaces; `type-rubric.md:45`,
   six). Fixed: the dash's own line-prefix (whitespace-only, per the line-start check that routed
   here) is captured as `indent` and re-prepended, so only the dash and its one separating space
   go. Fixture `"R7 keeps the continuation's indentation"`. Verified on the real line:
   `decision-records.md:235` now reads `     editorial voices use ...` (indent kept).
4. Row 24 🟡, mutant M5. Added `"R2 does not fire outside Markdown"` (a non-Markdown `# heading
   [dash] x` expecting R8); the mutant that drops R2's `md` guard now fails self-test. M10
   (backticks masked in non-Markdown files) does not need a dedicated fixture: it is already
   caught at the tree level by P2 (c)'s real-tree run (a template literal's backticks are never
   masked, so a mask regression there would drop the tree total, and P2 (c) checks that
   directly) -- a hand-rolled M10 fixture would only duplicate that coverage.
5. Row 27 🟡, this handoff's own header was stale (`HEAD: `b9f159f2`` while the branch had moved
   to `397e69ea`, and the P2 section still cited the pre-pass-3 total `16713`). Fixed: the header
   above now names `96afaf70`, and every `16713`/`16714` in the P2 section is corrected to the
   current, verified `16746`/`16747`.

Rechecked in a fresh clone at `96afaf70`: `self-test: PASS`, `FAIL: 16746 em dashes ... in 343
files` (unchanged; none of the four fixes touches the gate's total, only its classification/fix
behavior). Full-tree `--fix --sample` then `--fix` again: both `329 files changed, 9312
insertions(+), 9312 deletions(-)`, byte-identical; numstat mismatches `0`; `15` rule lines
(`R0 a 13, b 3, c 1, d 2, e 20, f 1, g 14`, `R1 27, R2 565, R3 441, R4 0, R5 0, R6 281, R7 29,
R8 8246`). 359 changed table rows, `0` pipe-count mismatches.
`docs/marketing/store-copy.md:486` is untouched (still `> [dash] Ultimate Tokens`). `npm test` in
a separate, unswept fresh clone: `✓ all 48 test files passed`, exit `0`, tree clean after.

## Pass 5: the positive guard (owner ruling B, plan revision 11)

Four re-review passes each found a new meaning-changing construct `--fix` rewrote (a legend, a
chart line, an exported heading, a question label, a glued name, an aligned column, a status
mark), because R0 was a NEGATIVE list -- open by construction, closed only by reading everything.
The Conductor re-diagnosed and the owner ruled B (`.sdlc/questions/rule-gates-U3-rediagnosis.md`):
flip the guard. A fixing rule now runs only where the dash is a genuine pause between two words --
an actual space on each side, the guard's before/after character sets on the near sides
(`guardHolds`/`guardBeforeHolds`/`guardAfterHolds`, `test/repo/em-dash.mjs`). Everything that fails
is a plain R0 refusal. (b), (c), (e) keep their sub-labels (U6's own reintroduction cases); (a),
(d), (f), (g) are retired as constructs since all four already fail the guard on their own.

R2/R3 add the guard's after-side check (a label whose dash ends the line is now refused, matching
the plan's own measured "2 refused" for R3); R6 adds the before-side check (measured "1 refused");
R7 checks both, across the wrap, and still keeps the continuation's indentation from pass 4; R4,
R5, R8 check both sides directly. Two pass-1-through-4 fixtures move to R0 under the new guard,
their now-correct outcome: a heading label's dash ending the line (`## title —`, no text follows,
guard-after fails), and a dash before a glued period (`(#477) — .btn`, no space after the period,
so neither R5 nor the guard's after-side accepts it).

The refused list drops its per-letter breakdown (`R0 <letter> <n>` x 5..7 lines across revisions
5, 9, 10) for a single aggregate `R0 <n>` line, per revision 11's P3 (rule-line counting is no
longer an expectation). Every refused line prints in full, no cap, tagged with its sub-label
(b/c/e), a near-miss rule name (R3/R6, when a shape rule's structure matched but its guard side
didn't), or a computed habitat (comment/string/table/quote/fence/paragraph/list/trailing comment)
for everything else -- `habitatOf()`, using a per-file fence-flag pass (`computeFenceFlags()`) for
the Markdown case.

### Acceptance, in a fresh clone at `743ca560`

1. Total: `16746`, unchanged (the guard decides what `--fix` rewrites, not what the gate counts).
   Full-tree `--fix --sample`: `329 files changed, 9251 insertions(+), 9251 deletions(-)`, close to
   the re-diagnosis's "about 9,255" (measured on the run's edit dump at a slightly different
   commit, `397e69ea`; a handful of lines' exact byte diff size differs with the pass-4 fixes
   folded in, not a guard defect).
2. Refused list: `121` lines on this unit's own (pre-U6) base, all printed with a tag, no cap.
   Breakdown: `e 20`, `b 3`, `c 1` (the kept sub-labels, `24` total), `R3 2`, `R6 1` (near-miss
   tags, `3` total), and `94` generic habitats (`comment 31`, `string 24`, `paragraph 21`,
   `list 7`, `trailing comment 4`, `quote 3`, `fence 2`, `table 2`). This is over the re-diagnosis's
   "under 120", which is stated for the tree AFTER U6 merges (dropping R0 (e) from 20 lines to a
   handful and folding the 14 marker lines into the same bucket); measured here, honestly, on the
   unit's own pre-U6 base, per U3's scope (U3 does not sweep or wait on U6). U3's run is the
   authority per the plan's own wording; the count should fall under 120 once U4 runs after U6.
3. Fixtures added for the legend, the glued name, the question heading and the aligned comment
   column, each expecting R0. A mutant that drops the guard (`guardHolds` forced to always return
   `true`) reds 9 fixtures including the legend one: `self-test: FAIL`,
   `✗ guard: legend naming the glyph: matched R8, expected R0`. Every earlier fixture still passes
   (`self-test: PASS` on the unmutated code).
4. All eight constructs (14 lines) the re-diagnosis named in section 1 are refused, not rewritten,
   confirmed by reading each line after `--fix` in the clone: `app.js:2374`, `color.js:1330`,
   `ui-plan.md:111`, `ds-export.js:1495`, `type-scale/SKILL.md:81` and `:82`, `type.mjs:526`,
   `style-plan.mjs:42`, `README.md:119`, `component-inventory.md:461` to `:465` -- every one still
   carries its glyph, byte for byte.
5. Full-tree `--fix`: two runs give identical stats (`329 files changed, 9251 insertions(+), 9251
   deletions(-)` both times); numstat mismatches `0`. Table integrity: 358 changed table rows, `0`
   pipe-count mismatches. `npm test` in a separate, unswept fresh clone: `✓ all 48 test files
   passed`, exit `0`, tree clean after.

## Pass 5 fold-in: `plan/rule-gates` merged (U6 in), four review yellows

`plan/rule-gates` merged into this unit at `40e21900` (before this fold-in), bringing U6 in. Every
figure above this section (`16746`, `121` refused, and everything under "Pass 5") was measured on
the PRE-merge base and is superseded here, not corrected in place -- it is what those passes
actually ran against. At the merged head the same run gives `FAIL: 16688 em dashes outside inline
code spans in 343 files` and `97` refused lines (U6 removes the 20 R0 (e) lines and most of the 14
former (g) marker lines' surrounding noise). The review's own criteria table confirms both figures.

Four small yellows from the Pass 5 review, folded in at `2ebde63a`:

1. `GUARD_BEFORE_CHARS`/`GUARD_AFTER_CHARS` used `A-Za-z0-9`, so a non-ASCII letter on either side
   of the dash (`cliché —`, `— γ`) was wrongly refused (5 real lines: `travel.json:932`,
   `travel-palettes.md:234`, `describe-rubric.mjs:310`, `knowledge-02:44`, `tonal.mjs:202`). Now
   `\p{L}`/`\p{N}` (the `u` flag). Two fixtures added; a mutant reverting to `A-Za-z0-9` reds both.
2. Step 1b names a drawn chart line among the re-diagnosis's constructs, but only the tree
   (`ui-plan.md:111`) pinned it, no fixture. Added (`` ●● ``  before the dash fails the
   before-guard).
3. `guardBeforeHolds` (R5/R6's before side) had no fixture: forcing it to always return `true`
   still gave `self-test: PASS`, while on the tree `mode-apply-plan.mjs:289` (a placeholder's `>`
   before a line-end dash) moved from refused to R6. Fixture added; the mutant now reds it.
4. Three refused lines carried a rule name (`R3`, `R6`) instead of a habitat
   (`adopt-hygiene-U1.md:52`, `cto-app.md:86`, `mode-apply-plan.mjs:289`). R2/R3/R6's guard-side
   refusals no longer carry that tag; they fall through to `habitatOf()` like every other refused
   line (now `list`, `list`, `comment`). `habitatOf()` also mistagged a quoted string's own `#`/`//`
   as a real comment (`ds-export.js:1495`'s `"## Which variant? ..."` string, and the three
   `gen-*-assets.mjs` template-literal header comments) as "trailing comment"; a new
   `insideStringAt()` check at the marker itself fixes it to "string".

Rechecked in a fresh clone at `2ebde63a`: `self-test: PASS`, `FAIL: 16688 em dashes ... in 343
files` (unchanged by the four fixes). Full-tree `--fix --sample` then `--fix` again: both `329
files changed, 9256 insertions(+), 9256 deletions(-)`, byte-identical; numstat mismatches `0`.
`R0 92` (down from `97`: the 5 Unicode-letter lines are no longer refused). 359 changed table rows,
`0` pipe-count mismatches. `npm test` in a separate, unswept fresh clone: `✓ all 49 test files
passed`, exit `0`, tree clean after.

## Self-check

`node test/repo/em-dash.mjs` on this unit's own worktree at HEAD: `self-test: PASS`, then
`FAIL: 16688 em dashes outside inline code spans in 343 files`, `exit 1` (expected: the tree is not
swept, U4 does that). `node test/repo/branding.mjs` in a clone at HEAD: `branding: clean (587 files
scanned)`. `npm test` in a clone (no `node_modules`): `✓ all 49 test files passed`, tree clean
after.
