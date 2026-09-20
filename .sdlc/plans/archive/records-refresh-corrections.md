---
kind: corrections
corrects: .sdlc/plans/archive/records-refresh.md
written: 2026-09-19
source: .sdlc/verdicts/records-refresh-prepr-review.md F2, F8 and deferred-note ruling 1
---

# Corrections to the archived `records-refresh` plan

The archived plan is history and its criterion text stays as graded. This file records where two
of its criteria print a different value at today's head than the archived text expects, and how
a plan that relies on the same claim reads it correctly.

| Where | As archived | What it prints at d34b4fb1 | Corrected form |
|---|---|---|---|
| P2 | `grep -o 'ui.html [0-9.]* KB' .sdlc/baseline.md`, unscoped, over the whole file | the whole-file size grep prints two strings, since the prior set was added below the live row: `ui.html 3780.5 KB` (live) and `ui.html 3777.8 KB` (prior) | P2 of this plan (`records-followup`), scoped to the live row: `grep '^[|] `npm run build` [|]' .sdlc/baseline.md \| grep -o 'ui.html [0-9.]* KB'` |
| U2-7 | last sub-check, `grep -c "at .$(git merge-base origin/main HEAD \| cut -c1-7)" $F/p5.md`, a presence count that expects `1` | `3`, because pass 5 names `20298cc` on three lines (the Graded header, the K17 row, the closing note) | `sed -n '/^## Pass 5/,$p' .sdlc/verdicts/architecture.md \| grep -c '^Graded .*20298cc'`, which prints `1` (measured) |
| Lines 306 and 342 | both say pass 5 stays graded at `d814500` | pass 5's own header says it was graded at `d46ae48`, merge base `20298cc`; `d814500` is where U2's handoff measured | corrected in the live map by U1 of this plan |
| The closing sentence | (applies to every row above) | (applies to every row above) | a plan that copies a criterion from the archive copies the corrected form, not the archived text |

## U4 review 2 notes (unit/rf-U4 @ b9e70950)

Since revision 4, this file also carries the seven 🟡 notes of U4's review pass 2 (reviewer-l2 at
`b9e70950`). Notes 1 and 2 are restorations under the verbatim-quote rule (`.sdlc/adapter.md` §3);
the other five are wording and record fixes.

| Note | Where | As written | What the program prints or the rule needs | Corrected form |
|---|---|---|---|---|
| N1 | `.sdlc/verdicts/records-refresh-U1.md:37` | the span `engine/semantic.mjs FAIL`, unmarked, with the marker `(altered: two leading spaces dropped)` in parentheses | `test/run.mjs`'s runner line for that file: `` `▶ engine/semantic.mjs      FAIL` `` (derived: `perl -CS -e 'printf "\x{25B6} %-24s FAIL\n", "engine/semantic.mjs"'`) | the runner line restored in its own span; the marker rewritten as a backtick span, `` `altered: two leading spaces dropped` ``, in place of the parentheses |
| N2 | `.sdlc/verdicts/survey.md:11`, `.sdlc/verdicts/records-refresh-checkability.md:12`, `.sdlc/verdicts/records-refresh-prepr.md:25` | the span `smoke: missing dist/ultimate-tokens.html` (prepr writes `smoke: missing .../dist/ultimate-tokens.html`), dash-truncated | `test/smoke/smoke.mjs`'s real line, run in a clone with no `dist/`: the program's own missing-artifact line, path rewritten as `<ROOT>` (U+2014 included, see the restored files for the exact bytes) | the full line restored in a padded double-backtick span, followed by the marker span `` `altered: absolute path written as <ROOT>` `` |
| N3 | `.sdlc/adapter.md:97` | `and states the expected number as one per restored line, re-derived for every unit;` | the rule must state the number is the dashes the enumerated quoted lines carry, counted from the program's output, never the diff | `and states the expected number as the dashes the enumerated quoted lines carry, counted from the program's output and never from the diff, re-derived for every unit;` |
| N4 | `.sdlc/adapter.md:97`, same paragraph | (as N3) | (as N3, same amendment) | edited in place, same opener, so U4-1 still counts one amendment |
| N5 | `.sdlc/adapter.md:97`, after `never from another record.` | the rule is silent on fenced blocks and on when it binds | two sentences appended: the strip reads inline spans only, one per line of output, never a fenced block; the rule binds lines added from 2026-09-19 on, an earlier quote restored when a plan touches its record | `The strip reads inline spans only, so a quote goes in a span, one per line of output, never in a fenced block; a plan that must fence output strips the fence in its count command and says so. The rule binds lines added from 2026-09-19 on; an earlier quote is restored when a plan touches its record, and records-followup U6 lists the ones known.` |
| N6 | `.sdlc/handoffs/records-refresh-U3.md:170` and `.sdlc/verdicts/records-refresh-U3.md:83` | handoff: `a quotation of program output in this file had been reworded`; verdict: `had been reworded to avoid an em dash` | the handoff undercounted (four quotations were reworded in that file, not one) and the verdict misdescribed the fix (a glyph was spelled out in words, not reworded away); each `Correction (2026-09-19, plan records-followup U4, #709):` prefix stays, so U4-4 still counts one correction per file | handoff: `four quotations of program output in this file had been reworded`; verdict: `had spelled a glyph out in words to avoid an em dash` |
| N7 | `.sdlc/handoffs/records-followup-U4.md` | the P1 row claims `node_modules` absent and a clean tree | review pass 2 measured `node_modules` present and five modified files during that run; P1 was independently measured clean by the reviewer at `b9e70950` in a detached worktree | one appended last line: `Correction (2026-09-19, plan records-followup U6, #709): the P1 row above is not P1 evidence, since `node_modules` was present and the tree carried five modified files during that run. P1 was measured by review pass 2 at b9e70950 in a clean detached worktree with no `node_modules`: `✓ all 48 test files passed`, 48 in `TESTS`, tree clean.` |
