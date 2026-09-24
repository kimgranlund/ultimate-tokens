# rg-U4 review (reviewer-l2, pass 1)

Target `unit/rg-U4` @ 05a315f5, cut from `plan/rule-gates` @ b8abddf0, origin/main ae4206ac merged at c5f7bb2c. Unit work read as `c5f7bb2c..05a315f5`. Plan revision 12. All runs in throwaway clones under `rgU4rev-l2p1/` in the scratchpad (`c` at 05a315f5, `n` for controls, `pre` at 0faca70d); load checked before each heavy run.

## Verdict: FIX-FIRST

The machine half is clean: the automatic sweep is byte-identical to the tool's output, idempotent, `npm test` 51 of 51 green with the tree clean, the gate prints `clean`, every control bites. The hand half misses U4-10 as written and breaks the plan's no-substitute rule on 12 lines.

## Criteria

| # | Result | Evidence (my run) | Control (my run) |
|---|---|---|---|
| Merge c5f7bb2c | 🟢 | Main side touched 6 `.sdlc` files; 5 equal ae4206ac byte for byte, `board.md` equals main plus the plan's 6 rule-gates rows; no plan-side file differs from b8abddf0; no file changed outside either side; `uniq -d` on the board's first column prints nothing | n/a |
| U4-1 G0 | 🟢 | `CLOSED`, `0`, `0` (ae4206ac is an ancestor of HEAD). Note: origin/main has moved 16 commits since then (b801b71f, not an ancestor, `1`), one added line carries the glyph; pre-land's re-merge must rerun `--fix` | gate |
| P1 | 🟢 | `✓ all 51 test files passed`, `51`, `0` (clone at 05a315f5, 4:56 wall at load about 10, not a timing figure) | not rerun: the P1 control is the planner's dry-run one |
| P2 | 🟢 | `exit 0`, `1`, `em-dash: clean (686 files scanned)`, `4`, `0` | (a) `FAIL: 1 ... in 1 files`, exit 1; (b) `clean`, exit 0; (c) `FAIL: 3 ...`, and `--fix` left all three lines and listed them `(e)`; (d) `latin1` reader: `self-test: FAIL 1 case(s)`, `✗ reader: readText() found 0 dashes, expected 1`, exit 1, no tree FAIL line |
| P3 | 🟢 figures, 🟡 record | At 0faca70d: `--fix --sample` then diff equals e55a2ce9 plus exactly `docs/img/palette-preview.svg` and `src/ui/type-fonts.js`, which equal c90402b2's versions; stat `339 files changed, 9743 insertions(+), 9743 deletions(-)` twice, patches `cmp` identical; numstat `0`; 9 rule lines `R0 92 R1 27 R2 573 R3 462 R4 0 R5 0 R6 300 R7 31 R8 8623`; refused list 92 lines, each with a habitat; `to` 7 and 7; double punctuation 121 and 121 at base; lone tokens 0 and 0; last line `FAIL: 6774 ... in 64 files` (refused lines plus unregenerated mirrors). The handoff carries none of the per-rule counts, samples or diff stat step 5 asks for | the fixture self-test (P2 d shows it stops the run) |
| P9 U4 pair | 🟡 | `20` at c5f7bb2c, `27` at the recorded base b8abddf0 (expected `0`); numstat `0` at both. All 20 read: hand pairs whose dash line opens with a comment marker (`// —`), which the check's `^-[[:space:]]*` pattern does not admit (code.js:81, :718, mode-apply-plan.mjs:360, :465, tonal.js:126, exports.js:184, model.mjs:724, exports.mjs:2219, prime-pre-681.mjs:36, prime.mjs:514, binder.mjs:105), their `ui.html` mirror copies, 2 `architecture.md` re-pins, and cross-file stream artifacts. No unrelated edit. Not reported in the handoff | n/a |
| U4-3 | 🟢 | `1`, `1` | entry removed: `0`, `0`, `✓ all 50 test files passed` |
| U4-4 | 🟢 | `1`, `1`; 0faca70d is the one-line escape edit | blind `/, (?:not` regex: `0`, `0` |
| U4-5 | 🟢 with a misquote | `2`, `1`, `29	27	.claude/CLAUDE.md` (the bullet wraps to two lines; plan said `28 27`, re-measure allowed). Handoff quotes `30	27` with a wrong explanation | line dropped: `0`, `0`, `27	27` |
| U4-6 | 🟢 | three `exit 0`; `rows 56 drifted 11 holds 45 undetermined 0 bad 0` | n/a |
| U4-7 | 🔴 on content | `em-dash: clean (686 files scanned)`. All 106 listed pairs match the c23f5c83 diff byte for byte (backticks shown as `'`), and every changed line is listed. Read in full: 12 lines swap the em dash for an en dash, 3 for a hyphen, the legends do not name `n/a` (findings 2, 3) | app.js:690 restored to its pre-hand text: `FAIL: 1 ... in 1 files` naming it |
| U4-8 | 🟢 | The five read as sentences; rubric.md:3 `the surface, + 'brand-kit-server.mjs', the stdio` is stiff but keeps the pause | same as U4-7 control |
| U4-9 | 🟢 | the `/`, `>`, `%` lines are all rewritten with a comma, colon or semicolon | refused list at 0faca70d names each |
| U4-10 | 🔴 | Not done as written (finding 1) | read-all row |
| Generated files | 🟢 | c90402b2 and 80a0f0ae touch only generated files; `npm test` leaves the tree clean; `gen:type-fonts` reproduces `type-fonts.js` byte for byte. `gen:preview` changes 3 swatch rects, which it also does at 0faca70d: pre-existing since #681, not U4's | n/a |
| 68fad59a | 🟢 with a scope note | DD50, DD51 -> `.claude/CLAUDE.md:116`, DD52 -> `:117`, each quote found on that line. These line citations predate U4; none is new | n/a |
| Scope | 🟡 | 355 files changed; every one carried the glyph at c5f7bb2c except `.sdlc/architecture.md` (68fad59a) and the handoff. `architecture.md` is outside the U4 Touches row and is missing from the handoff's "Disagreed with the plan" | n/a |
| Branding | 🟢 | `branding: clean (678 files scanned)` | n/a |

Sample sizes for focus 2: the whole refused list (92), all 106 hand pairs, every swept UI-facing string I could filter out of `src mcp figma` (about 130 lines: `h(`, `title`, `label`, `toast`, `notify`, `card(`, `aria`, `hint`, `note`), a seeded random 120 lines from the whole sweep across Markdown, JSON, code comments and strings, and a targeted grep over all 5,371 removed code lines for regexes, character classes and comparisons carrying the glyph. No regex, split or comparison was changed except the one in finding 4. The JSON keys swept in `categories/*.json` are `note`, `refuses`, `text`, `description`, `sourcing`, `source`, `title` and swatch `name`, all swept the same way on both sides.

## Findings, ranked

1. 🔴 U4-10 not met (`src/ui/app.js`, `src/ui/sections/*.js`, `figma/plugin/code.js`, `figma/binder/figma-semantic-binder/code.js`, `src/engine/derive.mjs`). The row's own examples are unchanged: `app.js:1418` `"Color, palettes, scrims & semantic roles"`, `figma/plugin/code.js:283` and the binder's copy `"Please try again, if it keeps happening, open an issue..."`, `color.js:24` `"Tone curve, L* per stop"`. The same label-dash-as-list pattern stands in `app.js:1405` (`Settings, token mapping & preferences`), `:1419`, `:1420`, `color.js:25`, `:27`, `:606`, `:816`, `:817`, `:843`, `:913`, `:939`, `geometry.js:346`, `typography.js:271`, the three `Fit, reset the canvas view` titles, `derive.mjs:69`, `:71`, `:74` (`Complement, oppose the primary at 180°`), `app.js:1318` and `:2326` (`Save failed, no storage available`), and `figma/plugin/code.js:755`. The handoff also does not list every auto-fixed string under `src/`, `mcp/` and `figma/` with its read, which is the row's command: it lists only the ones it rewrote, about 10 of roughly 530 candidate lines.
2. 🔴 12 hand rewrites put an en dash (U+2013) where the em dash was: `figma-styles-hard-constraints.md` lines 32, 42, 51, 58, 62, 75, 85, 100, 114 and `docs/marketing/store-copy.md` 399, 405, 486. The plan's Not-in-scope table bans an en dash or hyphen in the dash's place (unslop rule 13), and step 3 says the citation or sign-off "follows it in its own words". The gate cannot see U+2013, so it passes.
3. 🟡 Hyphen substitutes. `src/ui/app.js:2385` and `src/ui/sections/color.js:1330` legends now read `- absent` and `- not in the file`, but the cell renders `n/a` (`color.js:1337`). U4-7 expects the legends to name `n/a`. `figma-styles-hard-constraints.md:19` turned the line-start dash into `- `, which makes that citation a Markdown list item: the rendering changes, and the line was not joined to its sentence as step 3 says.
4. 🟡 The sweep changed needles that a program compares with external data. `.claude/skills/ultimate-tokens-brand-voice/scripts/store-drift-check.mjs:27` `PRODUCT_NAME` is now `"Ultimate Tokens, Pro"` and `"Ultimate Tokens, Studio"`, and `:30` `DESC_PROBES` is now `"derived, not guessed"`. Both are compared against the live Lemon Squeezy store. `store-copy.md:117` and `:171`, the source that gets pasted into the store, carry the same names. So the product names change, and the new form reads as a list. The live check will warn until the store is re-pasted. A colon (`Ultimate Tokens: Pro`) or an owner ruling is needed; this is the owner's product name.
5. 🟡 P9's pair check prints `20`, not `0`, and the handoff leaves out P9 and P3's per-rule counts, samples and diff stat (step 5). Every offender is explained in the P9 row and none is an unrelated edit. The check's pattern predates hand pairs that open with a comment marker.
6. 🟡 Handoff accuracy. U4-5 is quoted as `30 27`; the measured value is `29 27`. It says "94 lines", but it lists 106 pairs (94 refused plus 12 line-before commas). `palette-preview.svg` and `type-fonts.js` are `--fix` output, but they sit in the "regeneration" commit c90402b2. The `gen:preview` and `gen:type-fonts` runs the plan asks for are not recorded.
7. 🟡 Scope: 68fad59a edits `.sdlc/architecture.md`, which is outside U4's Touches row. The edit is needed (U4-6 reds without it) and the pins are correct, but the handoff should declare it as a departure.
8. Nits. `component-inventory.md:147` quotes the aria-label as `"Chroma basis …"`, while the source (`color.js:2210`) now reads `Chroma basis, gamut when on, peak when off`. `README.md:119` has a colon after the alignment spaces. `rubric.md:3` reads `the surface, +`. The `--fix` loop stops at a line's first refusal (cto-core.md:44, which the builder reported); that is U3's tool, not U4's.

## Addendum: the second added line in `.claude/CLAUDE.md` (team-lead's question)

The second line is in scope. bb0608f9 adds lines 113 and 114, which together are one bullet. Joined, they read word for word as the text U4 step 3 prescribes ("No U+2014 anywhere in the tree; `test/repo/em-dash.mjs` gates it in `npm test`, and `node test/repo/em-dash.mjs --fix` repairs a branch."). The bullet is wrapped at the file's usual width, like the bullet above it at 111 to 112. It adds no new rule, blank line or other content. The only other `.claude/CLAUDE.md` change outside the sweep is c23f5c83 line 115, one of the swept refused lines. So `29	27` is 27 swept lines plus one bullet over two lines. The plan's `28` assumed a single line, and U4-5 allows a re-measure. The handoff's `30	27` and its "blank line join" explanation are wrong (finding 6).

## For the fix pass

Rewrite the U4-10 strings by hand with a colon or a sentence break, and list every auto-fixed program string in `src/`, `mcp/` and `figma/` with its read. Replace the 12 en dashes with a full stop plus words, or with parentheses. Make the two legends name `n/a`. Rejoin `figma-styles-hard-constraints.md:19` to its sentence. Settle the product names with the Conductor. Add P3, P9 and the corrected U4-5 figure to the handoff, and declare `architecture.md`. Then run `npm test` again (mirrors) and the gate.

## Round 2: pass 2 at 2d6d6da0

Target `unit/rg-U4` @ 2d6d6da0 (1ed4f5f6 hand edits, 3efa6a8d regenerated mirrors, 2d6d6da0 handoff). Checked in a fresh clone `rgU4rev2-l2p1/c`, whose HEAD is 2d6d6da0. My `npm test` started while five other heavy node runs were going on the host (load 5.3). It came back green, and I quote no timing from it.

### Verdict: FIX-FIRST (small)

Findings 2 to 8 and R37 are closed. Finding 1 is almost closed: two labels it named are still unchanged, and the handoff groups the rest of U4-10's read by category instead of listing it line by line.

| Check | Result | Evidence |
|---|---|---|
| Gate, npm test, tree | 🟢 | `em-dash: clean (686 files scanned)`, `✓ all 51 test files passed`, `git status --short \| wc -l` `0`, `branding: clean (678 files scanned)` |
| Pass-2 pairs | 🟢 | 73 of 73 listed pairs match the 1ed4f5f6 diff byte for byte (backticks shown as `'`); every changed line is listed; 3efa6a8d touches only `ui.html` and `figma-plugin-assets.js`, and the clean tree after `npm test` proves them regenerated |
| F1 U4-10 | 🟡 | The named strings are fixed: `app.js:1418` to `:1420` `Color: palettes...`, both `notify` calls now two sentences (`Please try again. If it keeps happening...`, `figma/plugin/code.js` and the binder), `color.js:24` `Tone curve: L* per stop`, and the other card titles, tab titles, Fit, Compare, specimen aria-labels, derive.mjs hints, report-line labels and toasts. Still unchanged, though named in finding 1: `src/ui/sections/geometry.js:346` and `src/ui/sections/typography.js:271` `"Breakpoint width, @media min-width"`. The handoff's read of the other strings is grouped (about 80 lines from a keyword grep, by category), not the per-line list the U4-10 command asks for. The categories I checked against my round-1 list hold up |
| F2 en dash | 🟢 | All 12 are now parenthetical citations or `(Ultimate Tokens)`. Across the unit diff (generated files and the handoff excluded), U+2013 characters added 118, removed 118: no net substitution |
| F3 hyphens and legends | 🟢 | `app.js:2385` `n/a absent`, `color.js:1330` `n/a not in the file`, matching `color.js:1337`; `figma-styles-hard-constraints.md:18` to `:20` fold both citations into one parenthetical after `omits`; no list marker remains |
| F4 and R37 | 🟢 | `store-drift-check.mjs:27` `"Ultimate Tokens Pro"`, `"Ultimate Tokens Studio"`; `:30` `"derived, not guessed"`; `store-copy.md:117` and `:171` match; no `Ultimate Tokens, Pro` or `Ultimate Tokens, Studio` is left in the tree. The ruling file lives on `plan/rule-gates` (rg-plan), not on the unit branch, which is expected for an Orchestrator record |
| F5 P3, P9 | 🟢 | The handoff now carries the 9 rule counts (the same as my run), the idempotent stat, and P9 `20` with every hit explained |
| F6 accuracy | 🟢 | U4-5 is corrected to `29 27` with the wrap explanation; the 94-line count is explained; the gen:preview drift is recorded as pre-existing. The gen:type-fonts network failure is recorded; I reproduced that file byte for byte in round 1 |
| F7 scope | 🟢 | `architecture.md` is declared as a departure. Every pass-2 file carried the glyph at c5f7bb2c |
| F8 nits | 🟢 with two new nits | `component-inventory.md:147` now quotes the live aria-label; `rubric.md:3` uses a colon per file |

### Round 2 findings

1. 🟡 U4-10: `geometry.js:346` and `typography.js:271` still read `Breakpoint width, @media min-width`, a label and value that read as a list. These are the same two lines finding 1 named, and the handoff does not mention them. Change to `Breakpoint width: @media min-width` in both, then run `npm test` to regenerate the mirrors.
2. 🟡 U4-10's command asks for every auto-fixed program string to be listed with its read; the handoff gives a read by category. If the Conductor accepts that, record it as a departure. If not, list the lines.
3. 🟡 The handoff's `npm test` section still cites 68fad59a. Nothing quotes a run at the pass-2 head. My run at 2d6d6da0 is green.
4. Nit: `apply-gate.js` now reads `Text styles skipped: no usable font for: ...`, with two colons. Suggest `Text styles skipped, no usable font: ...` or `Text styles skipped (no usable font): ...`.
5. Nit: `README.md:119` now has a space-aligned comma, `figma-semantic-binder/          , the standalone`. Its sibling lines put the comma right after the token.
