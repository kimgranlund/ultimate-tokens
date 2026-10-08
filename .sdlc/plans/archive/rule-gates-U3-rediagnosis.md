---
kind: rediagnosis
plan: rule-gates
unit: U3
ticket: "#730"
written: 2026-09-22
author: rg-U3-rediagnosis-planner
measured-at: 397e69ea (unit/rg-U3), plan revision 10 at 1c68a508
method: a throwaway `git clone --shared` under the planner's scratchpad, `--fix --sample` once, then an instrumented copy of the same script that dumps every edit (10,164 edits, 9,324 lines, 329 files); load 0 at every run
---

# U3 re-diagnosis: is a mechanical `--fix` over 16,746 dashes the right model?

Short answer: the mechanical fix is right for about 99 percent of the tree and wrong as a model for the rest, and the model is what has cost four passes. Keep the machine, but flip its guard from a list of what it must not touch to a test of what it may touch.

## 1. The root cause, stated once

The rule table decides by the characters next to the dash and refuses by enumeration: R0 is a list of constructs where the dash is not a pause, grown one letter per pass, (a) to (g). That list is open. The dash lives in at least nine habitats in this tree (Markdown paragraph, list, table, heading, blockquote, fence; source comment, string, trailing comment), and each habitat has its own construct where the dash is a token rather than a pause: a span glyph, an empty cell, a cell that opens with it, a comment or quote marker, a legend that names the glyph, a drawn diagram line, an aligned comment column, a question heading. Each pass read a new corner of the tree and found the next construct. Sampling cannot finish the job: the bad lines are 1 to 14 per class in a rule of 8,260, so four random pairs, or thirty-four, never land on one; every find so far came from a structural grep or from reading a whole file. A negative list over an open set converges only by reading everything, and reading everything is the editorial pass by another name.

The measurement below proves the list is still open at 397e69ea. Applying one positive test (the dash sits between two words, a space on each side, a letter, digit or closing token before it and a letter, digit or opening token after it) to the run's own edit dump refuses 68 rule-line pairs. Among them are every construct the five passes found and at least eight more meaning-changing rewrites no pass has found:

| Line | `--fix` at 397e69ea writes | What it was |
|---|---|---|
| `src/ui/app.js:2374` | `(✓ match / ✗ drifted /, absent)` | a legend naming the placeholder glyph |
| `src/ui/sections/color.js:1330` | `✗ drifted /, not in the file / ·` | the same legend |
| `docs/reference/references/ui-plan.md:111` | `●●, tone line` | an ASCII chart's drawn line |
| `src/engine/ds-export.js:1495` | `"## Which variant?, decision tree"` | a heading in the exported design-system bundle (user-visible) |
| `.claude/skills/type-scale/SKILL.md:81` and `:82` | `**New treatment?, add ...**` | a question label |
| `src/engine/type.mjs:526` | `relTrackEm, tracking` | a glued field name, no space before the dash |
| `figma/binder/style-plan.mjs:42`, `README.md:119` | `<slug>, MUTUALLY`, `figma-semantic-binder/, the` | aligned comment columns |
| `docs/reference/references/component-inventory.md:461` to `:465` | `✅, 6 call-sites` | a status mark then the dash |

None of these is in R0 (a) to (g). All of them fail the positive test. That is the pattern: the failures cluster exactly where the dash is not flanked by words, and the rule table never asked.

## 2. Options, measured at 397e69ea

Counts are per line as the plan counts. The diff is 9,324 lines in 329 files under every option that keeps the machine. R0 today is 40 lines (13 (a), 3 (b), 1 (c), 2 (d), 20 (e), 1 (f)); after U6 merges it is 16, and revision 10's (g) adds 14, so 30 hand lines is A's baseline.

| | A. Keep the full mechanical fix (pass 4 as planned) | B. Positive guard: fix only where the dash is a pause between two words, refuse and list the rest | C. Mechanical in Markdown only, refuse every non-`.md` file, fence and blockquote |
|---|---|---|---|
| Lines auto-fixed | 9,324 | about 9,255 (9,324 minus the refused set) | about 4,400 (R1 27, R2 565, R3 441, R6 147, R7 29, R8 3,207 minus fence and quote lines) |
| Lines left for hand editing | 30 (R0 after U6, with (g)) plus `voice-check.mjs:89` | about 95: 30 R0 minus the 14 (g) lines the guard subsumes, plus 68 refused (65 R8, 2 R3, 1 R6), `voice-check.mjs:89` and `export-drift.md:212` already among them | about 5,190 (R8 in source 5,053, R6 in source 134) plus R0 |
| Per-rule counts from the run | R1 27, R2 565, R3 441, R4 0, R5 0, R6 281, R7 29, R8 8,260 | R1 27, R2 565, R3 439, R6 280, R7 29, R8 8,195 auto; 68 refused, by habitat: source comment 29, string 17, list 7, paragraph 6, trailing comment 3, fence 2, quote 1, R3 2, R6 1 | R8 by habitat: paragraph 1,958, list 564, table 334, quote 160, fence 112, heading 79 auto; source comment 3,363, string 1,488, trailing 202 refused |
| Residual risk of a meaning change | Known: the 8 lines above ship wrong unless a fifth pass adds R0 (h), (i), (j). Unknown: one new class per pass so far, no reason to expect zero at pass 5 | Confined to word-flanked dashes, where the replacement is the comma splice the owner accepted (Q2); every failure class found in five passes fails the guard, so it would have refused all of them without a rule change | Lowest in source, but it leaves 5,190 lines to hand-edit, which is a rewrite project, not a unit |
| U4 | M, unchanged; step 3 edits 30 lines by hand | M, unchanged; step 3 edits about 95 listed lines by hand (under 120, so the reviewer reads every one instead of a sample) | U4 cannot stay M; needs an editorial unit of weeks |
| Q1 and Q3 (sweep all 329 files) | kept | kept: refused lines are still swept, by hand, in U4, and the gate reds until they are | reopened: 5,190 lines would stay or wait |
| Q2 (the comma set as revised) | kept | kept, narrowed to where it applies | kept |
| Q4 (changelogs, ADRs, ticket archive) | kept | kept | kept |

C is here to show that the split is not by file type: source comments hold 3,363 R8 lines and 3,335 of them are ordinary prose pauses. The habitat is not the risk; the flank is.

Note on the gate half: unaffected by every option. The gate counts, the guard only decides what `--fix` rewrites. The verifier's other red (the self-test's reader bypasses `readText()`) is a pass-4 fix under any option.

## 3. Recommendation

B. The one criterion: a mechanical rewrite may run only where its precondition is stated positively and checked on the line. A positive test is closed (a fixture proves it, a mutant breaks it, a refused list shows the reader everything it did not do); a negative list is open and can only be finished by exhaustion. Five passes have been paying for the open list one construct at a time. B pays once, and the price is about 65 more hand edits in U4, all printed by the tool.

## 4. What changes in the plan under B

1. U3, the rule table: R0's seven constructs collapse to one, "not a pause between two words", checked before R4 to R8 as a positive guard (letter, digit or closing token, whitespace, the dash, whitespace, letter, digit or opening token). R1, R2, R3, R6 and R7 keep their shape and add the guard on the side they do not already check (R6 the side before, R2 and R3 the side after, R7 both across the wrap). Keep (b), (c) and (e) as named sub-labels in the refused list, since the lone token is U6's reintroduction case; (a), (d), (f) and (g) become plain refusals, no letters.
2. U3, the refused list: print every refused line, no cap, with its habitat (comment, string, table, quote, fence, paragraph). Self-test: one fixture per class found in passes 1 to 4 (already present), plus one each for the legend, the glued name, the question heading and the aligned column; a mutant that drops the guard must red on the legend fixture. Fix the reader red (row 6) in the same pass. Fix R7's indentation strip (verdict row 16) while there.
3. P3: the expected column stops counting rule lines (13, 14, 15 across three revisions) and states instead: the refused list is complete, its count is under 120, and the reviewer reads all of it plus four pairs per fixing rule; the post-fix FAIL names exactly the refused lines plus the generated files.
4. U4: step 3 grows from the R0 list to the refused list (about 95 lines after U6), each shown before and after in the handoff; U4-2 gains "every refused line rewritten by hand keeps its meaning" as a read-all row. Size stays M. `voice-check.mjs:89` and `export-drift.md:212` stop being special cases; they are refused lines like the rest.
5. Revision log: revision 11 records this ruling, retires (g) as a construct, and states that the 16,746 total and the 9,324-line diff are unchanged by it.

Not changed: the gate, the masker (CommonMark, pass 3), Q1 to Q4, U1, U2, U5, U6, G0.
