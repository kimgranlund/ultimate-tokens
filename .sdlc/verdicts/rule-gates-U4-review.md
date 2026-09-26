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

## Round 3: pass 4 at 4ea0ed4d, under owner ruling R39 (A+), plan revision 13

Target `unit/rg-U4` @ 4ea0ed4d. Pass 3 is 21f4184e, 2812e09a, cc0c1039, 5091460f. Pass 4 is a9cec2ef (the E1 to E4 rewrites), b447cad2 (the check scripts), 13e4e201 (two test needles), 64ce29dc (mirrors), ff520063 and 4ea0ed4d (handoff). Criteria are revision 13's U4-6 and U4-10 on `plan/rule-gates` @ f75b4193, E1 to E4 of `.sdlc/plans/rule-gates-U4-rediagnosis.md`, and the verdict `.sdlc/verdicts/rule-gates-U4.md` (🔴 at 5091460f). Everything ran in the clone `rgU4rev3-l2p1/c`, whose HEAD is 4ea0ed4d.

### Verdict: FIX-FIRST

U4-6 is fixed and bites. The needles are sound. E1, E2 and E4 print the handoff's lists. E3 does not: 5 lines at the head still read as list commas and are neither rewritten nor on the kept list. The verifier's named 🔴 lines outside E1 to E4 are also untouched.

### E1 to E4, my own enumeration

I wrote my own implementation (`rgU4rev3-l2p1/enum.mjs`, Node, U+2014 escaped). It reads the removed lines of `git diff --text -U0 c5f7bb2c HEAD` and drops comment lines. For E1 to E3 it takes the paths `src/ui`, `src/engine`, `mcp`, `figma/plugin/code.js` and the binder `code.js`, minus the generated `*-assets.js`, `type-fonts.js` and `categories/`. It reads each line back at the head at the same number. An apostrophe inside a word does not open a string for E3.

| Predicate | Hits (mine / handoff) | Still a comma at head, by reading | Handoff kept | Match |
|---|---|---|---|---|
| E1 | 17 / 17 | 0 comma; `:1495` is the kept sentence break (`## Which variant? Decision tree`) | 1 (`ds-export.js:1495`) | 🟢 |
| E2 | 37 / 35 | the 7 kept (`describe-rubric.mjs:78`, `:80`, `:83`, `:140`, `:202`, `ds-export.js:1292`, `:1397`), plus 2 hits that are `.md` files under `mcp/`, which the handoff treats as outside a code-string predicate: `mcp/README-describe.md:4` (an apposition, fine) and `mcp/README.md:8` `up to **three token systems**, **Color**, **Typography**, and **Geometry**`, which reads as a four-item list | 7 | 🟢 on code strings; 🟡 on the `mcp/README.md:8` gap |
| E3 | 78 / 78 | 25: the 20 kept plus `src/ui/sections/typography.js:24` `"Modular scale, size (px) per step"`, `:25` `"Optical tracking, letter-spacing vs size"`, `:26` `"Leading, line-height ÷ size per step"`, `:27` `"Font roles, family per voice"` and `src/ui/sections/color.js:1739` `"Tune hue · chroma · skew · lift, live"` (and its two ternary siblings) | 20 | 🔴: count 25 against 20. The four typography card titles are the same construct as the colour card titles the handoff rewrote (`color.js:23` to `:27`), and the re-diagnosis names `typography.js:24` to `:27` by line |
| E4 | 26 / 26 | 1: `launch-kit.md:16` (the ruled tagline). `landing.md:79` keeps a second comma inside `**Pro, $39/year, per user**:`, and its label colon is in place | 1 | 🟢 |

Kept-line reads: the 20 E3, 7 E2 and 1 E1 and E4 reads in the handoff hold as written. The geometry and type notes are trait lists, the swatch notes are appositions, `Compare is on, click to return` and `No legacy styles found, this file is clean.` are clause splices, and the two MCP tool descriptions are running lists. The 5 unlisted E3 lines have no read and are labels, so the right fix is a colon.

Control: in the clone, putting `color.js:24` back to `Tone curve, L* per stop` (committed) raises my E3 kept count from `25` to `26`; `reset --hard` restores `25`.

### The verifier's 🔴 lines outside E1 to E4, unchanged at 4ea0ed4d

The verdict's "Reds to fix" item 2 names these lines. Revision 13 bounded pass 4 by E1 to E4, and every one of them falls outside the four predicates, so pass 4 left them as they were. The handoff doesn't mention them:
- `src/engine/ds-export.js:776`, U4-8's own row, graded 🔴 by the verifier: `(a surface that inverts the app's OWN neutral, toasts, tooltips,`.
- `src/ui/sections/geometry.js:733`: `"Choose a treatment + base height, icon, font, padding, gap & radius follow by the centering law."`
- `src/ui/sections/typography.js:630`: `"Choose a treatment + body size, fonts, tracking, weight & leading follow."`
- `src/ui/sections/color.js:1788`: `"Which canvas group this palette is organized under, Material, Brand, System, or Data."`
- `mcp/brand-kit-core.mjs:61`: `` `# ${kit.name || "Brand Kit"}, usage `` is a heading in the MCP guide. E1's `[^"\`]*` cannot cross the inner `"Brand Kit"` quote, so the predicate misses it. That is a hole in E1 itself, the fifth-predicate case the re-diagnosis foresaw.

(Fixed since the verdict: `color.js:600`, all the export headings, and the store-copy lines `:154`, `:155`, `:208`, `:210`, `:212` and `landing.md:77`.)

### U4-6

| Check | Result |
|---|---|
| Rerun at head | `doc-drift-rows-check exit 0`, `rows 56 drifted 11 holds 45 undetermined 0 bad 0`; `card-source-range-check exit 0`, `range mismatches: 0`, no finding line; `card-amendment-check exit 0`, `stale total: 0`. 🟢 |
| Range control | ADR-011's card `163-191` changed to `163-192`: `end ADR-011 says 192, section ends at 191`, `range mismatches: 1` (exit still `0`, the separate ticket's issue). 🟢 |
| Amendment control | `Amendment (2026-09-16): planted.` under `## ADR-011:`: `stale card ADR-011`, `stale index ADR-011`, `stale total: 2`. With the pre-b447cad2 script put back, the same plant gives `stale total: 0`, which proves the old match could not see the body. 🟢 |
| Scope | b447cad2 changes only the heading pattern (`[: ]`) in the two scripts, both on the start and end awk bounds. Revision 13 authorizes both files |

### The two `exports.mjs` needles (13e4e201)

`test/engine/exports.mjs:1918` and `:2042` change from `design-system-for-google-stitch, Stitch profile export` to `...: Stitch profile export`, and the same for Figma Make. They follow `ds-export.js:1059` and `:1089` character for character. The folder name, the separator and the text are all still pinned, so the test is not weakened (the original pinned the em dash; the comma version was the sweep's). Control: `ds-export.js:1059` put back to the comma form makes `node test/engine/exports.mjs` give `FAIL  design-system-stitch, README is not the Stitch profile receipt`, `FAIL: 1 gate failure(s)`, exit 1. 🟢

### Other checks

- `em-dash: clean (686 files scanned)`, `branding: clean (678 files scanned)`, clone tree clean after every control.
- Passes 3 and 4 add no en dash (`added 0 removed 0` outside mirrors and `.sdlc`).
- Changed files since 5091460f that carried no glyph are only the two check scripts (authorized) and the handoff.
- I did not rerun the full `npm test`. Two other seats' heavy runs were active every time I checked (`test/run.mjs` and a `headless-boot.mjs`), above the one-run rule. The handoff quotes a clone run at ff520063, and 4ea0ed4d adds only handoff text.

### Round 3 findings, ranked

1. 🔴 U4-10 / E3: `typography.js:24` to `:27` card titles and `color.js:1739` (all three ternary strings) still read as list commas and are not on the kept list; E3 prints 25 against the handoff's 20. Use a colon on the four card titles (matching `color.js:23` to `:27`). For `color.js:1739`, either use a colon or list it as kept with a read.
2. 🔴 The verdict's named reds outside E1 to E4 still stand: `ds-export.js:776` (U4-8), `geometry.js:733`, `typography.js:630`, `color.js:1788`, `brand-kit-core.mjs:61`. Pass 4 needs either to fix them or to have a Conductor ruling that R39's bound retires them. As it stands, the verifier's 🔴 on U4-8 has not been answered.
3. 🟡 E1's `[^"\`]*` misses a heading whose template carries an inner double quote (`brand-kit-core.mjs:61`). E2 as scoped misses `.md` files under `mcp/` (`mcp/README.md:8`, a real list-reader). Both are fifth-predicate candidates, graded 🟡 on the enumeration as the re-diagnosis says.
4. Nit: `color.js:2214` `gamut: % of every stop's gamut ceiling: palettes harmonize across hue.` has two colons in one clause; a full stop reads better. `ds-export.js:1141` `Naming standard: **Ultimate Tokens grammar**: ...` has two colons too.
verdict: 🟡 FIX-FIRST
