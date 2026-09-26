# Criteria review prompt-audit · 🔴 not mobilizable (35 🟢, 17 🟡, 1 🔴 of 53)

| Field | Value |
|---|---|
| Plan | `.sdlc/plans/prompt-audit.md` (draft, untracked) with `.sdlc/plans/prompt-audit-evidence.md`, read at `61225d0c` (`HEAD` = `origin/main`) |
| Asked by | verifier seat, 2026-09-25: grade every criterion for checkability, flag contradictions with the repo, spot-check N, the named test files and the two dependency gates |
| Grade | worker, ran every "Today" command itself at `61225d0c`; branch reads by `git show origin/plan/<b>:<path>`; no gate run, no repo file edited |
| Where measured | the root checkout, read-only; one U1-6 control run in a scratch copy under the session scratchpad |
| Shell note | the plan says `grep -P` is absent. `/usr/bin/grep` is BSD 2.6.0 (no `-P`, and BRE `\|` is alternation); the Claude shell's `grep` is a function wrapping ugrep 7.8.4, which has `-P`. `\x60` works in both greps and in BSD `sed` (tested) |

Checkable means a named command, a stated pass value, and, for a new gate or pin, a control that turns it red.
🟢 checkable · 🟡 checkable but vague or contradicted by the repo (rewrite given) · 🔴 not checkable or not satisfiable as written.

## Spot checks the request named

| Item | Plan says | Measured at 61225d0c | State |
|---|---|---|---|
| N on main | `50` | `50` (perl count of `TESTS`); `ok    tests: baseline 50, test/run.mjs TESTS 50` | 🟢 |
| N on `plan/rule-gates` | `51`, and "N stays what rule-gates left it" | `51` at `c7f09716`, but that tip lacks `engine/corpus-sample.mjs`, which main gained after the merge base `ae4206ac`. rule-gates adds `repo/svg-rules.mjs` and `repo/em-dash.mjs`, so N after G0 is `52`, and `53` if `plan/gate-gaps` lands first (it registers `engine/ramp-identity.mjs`). P1, U2-5, U9-5 read N by command, so no pass condition breaks; the stated figures are stale | 🟡 |
| Named test files | `test/plugin/{typography,color}-tokens.mjs`, `test/mcp/{brand-kit,brand-kit-merged-core,describe-rubric,describe-eval}.mjs`, `test/repo/{citations,branding}.mjs` | all tracked and in `TESTS`; `test/repo/em-dash.mjs` absent on main, present and registered on `origin/plan/rule-gates` with pass line `em-dash: clean (N files scanned)` | 🟢 |
| G0 (rule-gates #730) | not landed; U5 last unit | `git show origin/main:test/run.mjs \| grep -c '"repo/em-dash.mjs"'` prints `0`; `1` on the branch; #730 `OPEN`; rule-gates U5 `[~]` | 🟢 |
| G1 (docs-repair #751) | not landed; U6 adds `FACT_PINS` with 6 pins | `FACT_PINS` count `0` on main and `0` on `origin/plan/docs-repair` (`e00d8a7d`, only U4 merged; U3, U5 in progress; U6 not started); #751 `OPEN`; the docs-repair plan's U6-1 expects ` + 6 fact pins` | 🟢 |
| In-flight overlap | rule-gates 114, gate-gaps 5 | rule-gates `109` under a filter wider than the plan's wall (re-sweep may explain it); gate-gaps `4` (`test/run.mjs`, `docs/reference/SKILL.md`, `src/ui/describe-mcp-assets.js`, `figma/plugin/ui.html`; no `src/ui/mcp-assets.js`) | 🟡 figures only |
| ui.html arithmetic | "4260330 bytes (`4160.5` KB by the check's arithmetic)" vs baseline `4125.3` | the check divides the JS string length, not bytes: `ok    ui.html: baseline 4125.3 KB, tree 4125.3 KB`. No drift at 61225d0c; the plan's 4160.5 is a byte figure | 🟡 figure only |

## Criteria

| Id | State | Note |
|---|---|---|
| P0 | 🟢 | both reads run and print `0` / `0`, `OPEN` today, which is the stated red. Pass `1` and `1+`, `CLOSED` is concrete |
| P1 | 🟢 | commands run; control is adapter §1's own. Only the plan's N forecast is stale (see spot checks) |
| P2 | 🟢 | `gen-figma-ui.mjs` last line is `wrote figma/plugin/ui.html <kb> KB`; control bites once U3's bundle moves a tenth of a KB |
| P3 | 🟢 | `branding: clean (794 files scanned)` today. Name the em-dash pass line exactly: `em-dash: clean (N files scanned)` |
| P4 | 🟡 | filter is looser than the wall. Measured: `.claude/skills/color-math/references/foundations.md` and `plugin/.../geometry-tokens/scripts/dimension-parity.mjs` both pass it though out of the wall (the fixture of six printed only `src/engine/tonal.js`). Rewrite: list the wall's exact files instead of `references/[a-z-]+\.md` and `[a-z-]+-parity\.mjs` |
| P5 | 🟡 | (1) under the plan's own rule (a cell's `\|` is typed as a bare pipe), the second grep becomes the ERE `'^\| [A-Z0-9]+ \| (applied\|...) \|'` with bare pipes, which matches every line (measured: `2` on a two-line fixture). Rewrite as `grep -c -E '^[\|] [A-Z0-9]+ [\|] (applied\|amended\|dropped) [\|]'` or state which pipes are literal. (2) The id lists conflict: U1 lists S1 to S4, the Re-verification table puts "S1 to S4" under Low, not in scope; the evidence grades S1 to S4 Medium. (3) Say whether E1 needs a fate row (Q2 default A) |
| P6 | 🟢 | fixture control prints `1`. Watch: a reflowed geometry line keeping the kept Low handle `(#264)` (SB24) would count as an added id |
| P7 | 🟡 | first four reads match (`0`, `0`, `2`, board.py `exit 0` with the plugin at `$(dirname $(git config core.hooksPath))`). The control needs "the original report", which is not in the repo. Rewrite as a synthetic control: append one U+2014 line and one `\| # \|` table to a copy of the evidence and show `1` and a nonzero `board.py ids` exit |
| U1-1 | 🟢 | today `3`, `1`, `0`, `0`, `15`, as stated |
| U1-2 | 🟡 | today values match with the literal-pipe reading. Same pipe ambiguity as P5 for the row grep and the `xs/sm/md/lg/xl/2xl` grep: typed unescaped they match all `140` lines of the file. Rewrite with `[\|]` for literal pipes |
| U1-3 | 🟢 | today `1`/`1`, `0`, `0`, `contrast fixed,contrast` |
| U1-4 | 🟢 | today `1`/`1`, `0`, `1`, `1`; engine needle holds after the sweep (the dash is in the comment, not the needle) |
| U1-5 | 🟢 | today `5`, `1`, `3`, `4` |
| U1-6 | 🟡 | the stated control does not bite at U1: `--type-label-xl-size` is inside today's step union, and in a scratch copy voice-parity still printed PASS. `--type-label-3xl-size` printed `✗ SKILL.md: --type-label-3xl-size — unknown step "3xl"` and FAIL. Rewrite the control to a step outside the union, or to a `thirteen voices`-style word once U2 lands |
| U1-7 | 🟢 | eight paths match the wall. Runnable only on the unit branch (merge base with the local `plan/prompt-audit`); say so, since the pre-land pass cannot rerun it |
| U2-1 | 🟢 | today `0`, `0`, `0`, PASS. The error text `voice count drift` exists in the script today, so the retro control's stderr needle is real |
| U2-2 | 🟡 | "the builder's own wording is fine" conflicts with the fixed needle `control (ok\|passed)`. Rewrite: each of the five legs prints one line matching that needle. The unaddressed `sed` rewrites both the UI-control and UI-widget rows; still reds, record both names. Source string `"UI-widget": [9, 10, 11, 12, 13, 14]` exists |
| U2-3 | 🟡 | Today and Expected are wrong: `node test/plugin/color-tokens.mjs` prints no `control ok\|passed` line today (measured `0`, plan says `1`); the `hundred palettes` leg is folded into the final PASS line. So Expected `4` needs the existing leg to gain a line too; say so, or expect `3`. Also no control for the "every named value is in `DOMAINS`" sub-pin: add a fixture naming `` `onColorMode: auto` `` that must exit 1 |
| U2-4 | 🟢 | today `0`, `0`; fixture `if (n !== 15)` prints `1`. Narrow needle (catches `===`/`!==` only; a `const WANT = 15` passes) |
| U2-5 | 🟢 | as P1 |
| U3-1 | 🟢 | today `1`, `0`, `0`, `false true`, PASS, `exit 0`. Today cell says `1` for `instructions` in `test/mcp/brand-kit.mjs`; measured `0` |
| U3-2 | 🟢 | today prints exactly the seven stated properties and `missing 7`; five needles `0` |
| U3-3 | 🟡 | `grep -c '{ files' mcp/brand-kit-merged-core.mjs` already prints `2` (code lines 58 and 59 return `{ files: ... }`), so it cannot tell a described return shape from none; the control's `0` at `$B` is false. Rewrite: read the tool's `description` via `createSession().handle({ method: "tools/list" })` and test it for the return shape. Other legs match (`1`, `1`, `0`/`0`, `0`/`0`, `error-result`) |
| U3-4 | 🟢 | today `Sub-title`, `1`, `0`; clone control named |
| U3-5 | 🟡 | `§3\.[12]` prints `3` today, not `2`: line 34 is a code comment (`seedOf(hex) ... (§3.2)`), outside R2's rubric text. Expected `0` forces a comment edit R2 did not ask for. Rewrite: test the `RUBRIC` string (`import { RUBRIC }` then `/§3\.[12]\b/`), or accept the comment edit explicitly. Other legs `1`, `0`, `1` match |
| U3-6 | 🟢 | M9's hunk carries `53 roles per palette`, so the control prints `1` as stated |
| U3-7 | 🟡 | measured `false` and exactly `{"palette":"Data 3","stop":500,"hex":"#D6153B","distance":72}`. Under Q3 fix the new pin in `test/mcp/brand-kit.mjs` has no control: add "in the clone, revert `hexToRgb`: `node test/mcp/brand-kit.mjs` exits 1 naming `#fff`" |
| U3-8 | 🟢 | check line shape `ok    ui.html: baseline X KB, tree X KB` confirmed; P2's control applies |
| U4-1 | 🟢 | today `0`, `1`, `1`, `0`, `1`, `0` |
| U4-2 | 🟢 | `check 0`, skip line contains `skipped`, PASS, `exit 0` |
| U4-3 | 🟡 | the command reads `generateKitTool({}).rubric` only and prints `1` at `$B` and after, so it cannot fail on the runner. Rewrite: stub `globalThis.fetch`, call the exported `interpretOne`, count `RESEARCH_TIER_NOTE` in the captured `system`; `2` at `$B`, `1` after |
| U5-1 | 🟢 | the `\b59\b\|cautionary precedent` leg prints `2` today (the sentence spans lines 48 and 49), not `1`; fix the Today and control cells. Pass `0` stands |
| U5-2 | 🟢 | today `2`, `1`, `1`, `1` |
| U5-3 | 🟢 | frontmatter needle and file count concrete |
| U6-1 | 🟡 | (1) `fontOverride` with no word boundary also matches the live `opts.fontOverrides` API (SKILL.md lines 127, 138, 194, 166), so `0` forces deleting true text; use `\bfontOverride\b`. (2) `paddingWide` already prints `3` today, so that leg cannot fail; require `paddingWide = (height` or drop it. (3) Today is `4`, `0`, `3`, `6`, `0`, `1`, `14`, not `...3...` |
| U6-2 | 🟢 | today `0`, `0`, `2`, `0`, `2`, `1`, `2`, `1` |
| U6-3 | 🟡 | `(s4)` prints `2`: line 94 (`headless-boot (s4) + shell + persist`) names a check that still exists (headless-boot line 727). `0` forces removing true text. Scope the needle to the count-gate list line, e.g. `grep -c '(s4)\x60 \x60=== 53'` |
| U6-4 | 🟡 | geometry leg prints `6` today, not `11` (the `11`/`12` counts include `font ≈ √h\|fontOverride`). color-math's `#681` at line 50 (`palette.anchor (#681, ADR-026)`) is no finding's line; `0` requires removing it too. Fix the count and say the line-50 handle goes |
| U6-5 | 🟡 | `grep -c 'hueSpace: "oklch"' src/engine/tonal.js` prints `2` (line 44 plus the comment at line 182); Expected `1` is red on an untouched engine. Rewrite `grep -c '^  hueSpace: "oklch",'` |
| U7-1 | 🟢 | today `3`, `0`, `0`, `0`, `1`, `1`, `1`, `1`; `brandKit` is at line 689, not 237 |
| U7-2 | 🟢 | today `3`, `0`, `0`, `0`, `5`, `0`, `absent` |
| U7-3 | 🟢 | today matches. `references/foundations.md` bolds the symbol (`` **`ensureTypeFonts()`** (in ``), so the needle and U9's scanner both need the bold dropped; worth one line in the steps |
| U7-4 | 🟢 | today `1`, `0` x4, `4`, `6`; the four keys are CI job keys (`deploy` the fifth) |
| U7-5 | 🟢 | today `2`, `19`, `1`, `1`, `6` |
| U7-6 | 🟢 | first leg prints `4` today, not `5`; fix the Today and control cells |
| U8-1 | 🔴 | the pass condition "doc-drift check's last line identical at HEAD and at `$B`" cannot hold on a correct build. `.sdlc/architecture.md` §8 quotes the very text U8 removes: DD32 `"split out of \x60exports.js\x60 at TKT-0015"` (line 30, SA3), DD10 `"TKT-0031\x60, Issues #325–#342)"` (line 53, SA2) and DD56 (line 50, SA2's rewrite). Each goes `QUOTE ... not found`, raising `bad`, and the wall forbids touching `.sdlc/architecture.md`. Same rows on both dependency branches. Also the check exits 1 today (`bad 1`, DD9). Rewrite: let U8 re-point or retire DD10/DD32/DD56 (add the file to U8's wall) and compare `bad` excluding those three, or pin the quoting rows' ids |
| U8-2 | 🟡 | `three implementations` prints `2` today: line 71 (`"three implementations agree"`) is live prose outside SA8. Use `grep -c 'keep the three implementations'` |
| U8-3 | 🟢 | today `1`, `0`, `1`, `1` |
| U9-1 | 🟢 | relative pass (`+5` over main's count at G1) is concrete; docs-repair U6-1 expects ` + 6 fact pins`, so `11` |
| U9-2 | 🟢 | five doc flips named. The (b) needle `ten colour formats` has no U6 criterion behind it (the skill says `10 of them` today); U9-1 catches a missing needle, but a U6 row would catch it earlier |
| U9-3 | 🟢 | five source flips named, same shape as docs-repair U6-3 |
| U9-4 | 🟡 | the rule "the bare symbol name is in the file's text" does not catch `` `ensureTypeFonts()` (in `src/ui/app.js` `` (app.js imports and calls it: `2` hits), so the retro control's named stale list is wrong. `setGeomTokenOverride` (`src/ui/app.js`) is stale (`0` hits) and lives in U8's file, not U6's. Rewrite the resolve rule to a definition match (`function sym`, `sym(...) {`, `const sym`) or restate the expected stale list; name which parent (U6's or U7's) each stale citation is measured at. Citation counts today: `8` in-shape, `6` paren-shape by my regex (plan says `5`) |
| U9-5 | 🟢 | shape identical to docs-repair U6-4 |

## Contradictions with the repo, summarized

1. U8-1 vs the scope wall: the CLAUDE.md edits break three §8 drift quotes the unit may not repair (🔴).
2. Needles already satisfied or over-reaching at 61225d0c: U3-3 `{ files`, U6-1 `paddingWide` and `fontOverride`, U6-3 `(s4)`, U6-5 `hueSpace`, U8-2 `three implementations`, U3-5 `§3.2` comment.
3. Controls that do not bite: U1-6 (step inside the union), U4-3 (reads the rubric, not the runner), U2-3 (existing leg prints no control line).
4. Stale Today figures (pass conditions intact): U3-1, U5-1, U6-4, U7-6, the N forecast, overlap counts, the ui.html KB arithmetic.
5. Scope lists: S1 to S4 are Medium and in U1, but the Re-verification table files them as Low, not in scope.

### Verdict

35 of 53 checkable as written, 17 checkable after the rewrites above, 1 not satisfiable as written (U8-1). The plan is not mobilizable until U8-1 is rewritten; the 🟡 rows should be fixed in the same revision. Nothing here grades a build.

verdict: 🔴

## Revision 2 re-review

| Field | Value |
|---|---|
| Plan | `.sdlc/plans/prompt-audit.md` revision 2 (draft, untracked), read at `61225d0c` (`HEAD` = `origin/main`) |
| Asked by | verifier seat, 2026-09-25: re-grade every row, confirm each 🟡/🔴 fix with own evidence on a scratch copy, check no 🟢 row broke |
| Where measured | scratch clones under the session scratchpad only: `neg` (`--shared` clone at `61225d0c`, plan and evidence copied in), `u8` (`origin/plan/rule-gates` tip `c7f09716` as a stand-in `$B`, plus a simulated correct U8 commit). No repo file edited except this append; no gate run |
| Method | every row parsed from the plan (53 rows, six cells each by an unescaped-pipe count, confirmed); each `Command` cell run with `\|` typed as a bare `\|` (the plan's own typing rule), under both the seat shell's `grep` (ugrep `-G`) and `/usr/bin/grep` (BSD 2.6.0) where the needle holds a pipe or a bracket |

### Focus items

| Item | Measured | State |
|---|---|---|
| P4 wall filter | the first filter, inverted, over `git ls-files` passes exactly `55` files (54 unit files plus `.sdlc/board.md`), and they equal the wall prose's backticked paths after brace expansion, minus `test/run.mjs` (named as excluded). The six-name fixture prints `3` (`tonal.js`, the color-math reference, `dimension-parity.mjs`) under both greps. The third command prints `0` on a simulated correct U8, and `2` (a `-`/`+` pair) with DD8 also edited | 🟢 |
| `[\|]` ERE needles | P5 on a fixture handoff: BRE `"^\| $id \|"` prints `1` per present id, `0` for an absent one; the bracketed ERE prints `4` of `4` rows. U1-2 on a fixture table with a `Steps` column: header `1`, row grep `15`, `-F` grep `2`. U8-1's `"^[\|] DD$r "` selects the row. All identical under ugrep and BSD. Typed bare, ugrep prints the file's line count (`140`, `9`) and BSD errors `empty (sub)expression`, so the brackets are needed in both | 🟢 |
| U8-1 new scope | at the rule-gates tip, lines 30, 50, 53 of `.claude/CLAUDE.md` still carry the three quotes, and DD10, DD32, DD56 are all `holds`, so re-pointing them as `holds` keeps the state counts. Simulated SA2 (reflowed to 5 lines) and SA3, plus the three rows re-pointed: `0`, `2`, `117`/`117`, last line `rows 56 drifted 11 holds 45 undetermined 0 bad 0` at both HEAD and `$B`, `QUOTE` count `0`, row filter `0`. Controls: DD32 left at its old quote gives `QUOTE DD32: not found at .claude/CLAUDE.md:30` and `bad 1`; a blank line above `## Layout` gives `118` lines and `21` `QUOTE` lines. Two defects in the command, below | 🟡 |
| U2-3 controls | `onColorMode: "contrast"` occurs once in `tonal.js` (line 78), so the source-side `sed` hits the default. Today reads `0`, `0`, `0`, `exit 0`, `0`, as stated | 🟢 |
| U3-7 control | simulated Q3 fix (a 3-digit expansion in `hexToRgb`) plus an `ok()` pin comparing `#fff` with `#ffffff` in `test/mcp/brand-kit.mjs`: the node line prints `true`, the test passes. `git checkout "$B" -- mcp/brand-kit-core.mjs` then gives `exit 1`, `brand-kit MCP FAIL:` and `nearest_token #fff equals #ffffff`. The test collects failures (`fails[]`), so the line prints even when U3's other pins red too | 🟢 |
| U4-3 control | prints `2` at `$B`. With `system` rewritten to the rubric plus a no-web-search sentence it prints `1` | 🟢 |

### Rows

| Id | State | Note |
|---|---|---|
| P0 | 🟢 | `0`; `0`, `OPEN` today (#730 also `OPEN`) |
| P1 | 🟢 | the perl count prints `50`; `ok    tests: baseline 50, test/run.mjs TESTS 50`. The N forecast (`52`, or `53` after gate-gaps) is now stated and read by command |
| P2 | 🟢 | `ok    ui.html: baseline 4125.3 KB, tree 4125.3 KB`, `stale total: 0`; the KB note is corrected |
| P3 | 🟢 | pass line named exactly (`em-dash: clean (N files scanned)`, line 450 of the branch's gate); `branding: clean (721 files scanned)` in the clone |
| P4 | 🟢 | fixed (see Focus items). Figure only: the Measured overlap row and `depends:` say rule-gates misses `test/repo/citations.mjs` and `.sdlc/baseline.md`. Measured, it misses `.claude/agents/palette-researcher-agent.md` and `.sdlc/baseline.md`, and it does touch `test/repo/citations.mjs` (which U9 and docs-repair U6 also edit). The count, 53, is right. Other overlaps match: docs-repair 1, gate-gaps 5, chroma-floor 1, the other four 0 |
| P5 | 🟢 | fixed: both needles verified (Focus items). S1 to S4 are Medium in both tables. E1's `dropped` row assumes Q2's default; under B or C it is an `applied` row, which the fate grep also accepts |
| P6 | 🟢 | fixture prints `1`; `0` with no diff |
| P7 | 🟢 | fixed: `0`, `0`, `2`, `exit 0`. The synthetic control prints `1`, `1`, then `plans/x-evidence.md:1374: R1 defined in a plan file; owner kind ['readiness']` and `exit 1` |
| U1-1 | 🟢 | `3`, `1`, `0`, `0`, `15` |
| U1-2 | 🟢 | fixed (Focus items); today `0`, `0`, `0`, `1`/`1`/`1`, `true false`. The control's "bare pipes print `140`" holds under ugrep only; BSD errors instead. Either way the unbracketed form fails |
| U1-3 | 🟢 | `1`/`1`, `0`, `0`, `contrast fixed,contrast` |
| U1-4 | 🟢 | `1`/`1`, `0`, `1`, `1` |
| U1-5 | 🟢 | `5`, `1`, `3`, `4` |
| U1-6 | 🟢 | fixed: in the clone, `3xl` gives the ✗ line `unknown step "3xl"` and `exit 1`; `xl` gives `exit 0` |
| U1-7 | 🟢 | now marked as a unit-branch-only read |
| U2-1 | 🟢 | `0`, `0`, `0`, pass naming `15 voices`, `exit 0`; `voice count drift` exists (line 65); the retro control is coherent (the script from the unit tree, the skill dir and README from U1's parent) |
| U2-2 | 🟢 | fixed: needle fixed per leg, both voices recorded; `"UI-widget": [9, 10, 11, 12, 13, 14]` present once. Today `exit 0`, `0`, `0`. Nit: the control uses `$V`, which only U2-1 sets |
| U2-3 | 🟢 | fixed (Focus items); `auto` fixture leg added; expects `5` |
| U2-4 | 🟢 | fixture `if (n !== 15)` prints `1` under both greps; today `0`, `0` |
| U2-5 | 🟢 | as P1 |
| U3-1 | 🟢 | today `1`, `0`, `0`, `false true`, pass, `exit 0` (Today corrected) |
| U3-2 | 🟢 | the seven properties and `missing 7`; `0` ×5 |
| U3-3 | 🟢 | fixed: `tools/list` read prints `false false` at `$B`; other legs `1`, `1`, `0`/`0`, `0`/`0`, `error-result` |
| U3-4 | 🟢 | `Sub-title`, `1`, `0` |
| U3-5 | 🟢 | fixed: `RUBRIC` read prints `2`; legs `1`, `2`, `0`, `1`, pass, `exit 0` |
| U3-6 | 🟢 | `0` with no diff |
| U3-7 | 🟢 | fixed (Focus items). Watch: the control reverts the whole file, so if the builder's pin imports a new export of `brand-kit-core.mjs` it fails at import and never names `#fff`. Reverting only the `hexToRgb` line would isolate it |
| U3-8 | 🟢 | baseline row carries `wrote figma/plugin/ui.html 4125.3 KB`, so the `^+.*wrote figma/plugin/ui.html` needle has a line to move |
| U4-1 | 🟢 | `0`, `1`, `1`, `0`, `1`, `0` |
| U4-2 | 🟢 | `check 0`, a `skipped` line, `exit 0`, pass, `exit 0` |
| U4-3 | 🟢 | fixed (Focus items). Assumes `system` stays a string; an array-of-blocks `system` would throw at `split` |
| U5-1 | 🟢 | `2`, `2`, `1`, `1` (Today corrected) |
| U5-2 | 🟢 | `2`, `1`, `1`, `1` |
| U5-3 | 🟢 | `0`, `0` |
| U6-1 | 🟢 | fixed: `4`, `0`, `3`, `0`, `1`, `1`; `\bfontOverride\b` counts lines 57, 139 and 166 only, under both greps |
| U6-2 | 🟡 | broken by revision 2's typing rule. The fifth leg, `grep -rc 'FORMAT_GROUPS.*src/ui/app.js\|app.js. drawer' $E`, is a BRE. Typed with a bare pipe as the rule now says, it is a literal pipe and prints `0` at `$B` (plan Today and control say `2`), so the leg cannot fail. Rewrite as ERE: `grep -rc -E 'FORMAT_GROUPS.*src/ui/app\.js\|app\.js. drawer' $E \| grep -v ':0' \| wc -l`, which prints `2` at `$B` under both greps. Also the seventh leg prints `2`, not `1` (Expected says `1` or more, so that holds) |
| U6-3 | 🟢 | fixed: `(s4)\x60 \x60=== 53` prints `1` under both greps; `1`, `1`, `1` |
| U6-4 | 🟢 | fixed: `4`/`2`, `5`, `6`, `2`; the line-50 handle is named |
| U6-5 | 🟢 | fixed: the anchored `hueSpace` line prints `1` under both greps |
| U7-1 | 🟢 | `3`, `0`, `0`, `0`, `1`, `1`, `1`, `1` |
| U7-2 | 🟢 | `3`, `0`, `0`, `0`, `5`, `0`, `absent` |
| U7-3 | 🟢 | `1`, `5`, `0`/`0`, `1`/`1`, `1`, `1`; step 2 now drops the bold |
| U7-4 | 🟢 | `1`, `0` ×4, `4`, `6` |
| U7-5 | 🟢 | `2`, `19`, `1`, `1`, `6` |
| U7-6 | 🟢 | `4`, `1`, `15` (Today corrected) |
| U8-1 | 🟡 | was 🔴. Now satisfiable on a correct build (Focus items), but two defects. (1) `sh -c 'cd "$F/neg" && ...'` is single-quoted and `F` is a plain shell variable, so the inner shell sees an empty `$F`. Measured: `sh: line 0: cd: /u8neg: No such file or directory`, and no `$B` line to compare. Rewrite: `(cd "$F/neg" && sh .sdlc/checks/doc-drift-rows-check.sh \| tail -1)`. (2) The last needle reads the whole row. DD32's code cell properly quotes `src/engine/ds-export.js:3` "Split out of exports.js (TKT-0015 / ...)", so a correct re-point that keeps that evidence prints `1` (measured on the simulation). Scope it to the doc cell: `grep -c -E "^[\|] DD$r [\|] [^\|]*(TKT-0015\|TKT-0031\|not new \x60docs/tickets)" .sdlc/architecture.md`, which prints `0` on the simulation and `1` per row at the rule-gates base under both greps. Figures only: the rule-gates tip already reads `bad 0`, so after G0 the DD32 control prints `bad 1`, not `bad 2`; the DD8 control prints `2`, not `1` |
| U8-2 | 🟢 | fixed: `keep the three implementations`; today `1`, `0`, `1`, `1`, `1`, `6`, `0` (the sixth leg is `6`, Expected `1` or more) |
| U8-3 | 🟡 | new conflict with U9-4. The mandated text `(\x60src/ui/sections/{typography,geometry}.js\x60)` (SB10's hunk) makes `` `setGeomTokenOverride` (`src/ui/sections/{typography,geometry}.js`) ``, which is U9's paren shape with an untracked brace path. U9's stated rule ("resolve the path against `git ls-files`") marks it stale, so U9-4's `0 stale` cannot hold at the tip. Rewrite U8-3 to two scanner-shaped citations, each needle `1`: `setTypeTokenOverride\x60 (\x60src/ui/sections/typography.js\x60)` and `setGeomTokenOverride\x60 (\x60src/ui/sections/geometry.js\x60)`. The alternative is U9 step 3 defining brace expansion (fix one side, not both) |
| U9-1 | 🟢 | relative pass (`+5` over main at G1) |
| U9-2 | 🟢 | five doc flips named. U6 step 2 now says to write `ten colour formats`, but no U6 row greps it; U9-1 catches its absence |
| U9-3 | 🟢 | five source flips named |
| U9-4 | 🟡 | the definition rule is fixed. My scanner built from the stated regexes finds `8` in-shape and `6` paren-shape citations at `$B` and exactly the six stale homes named (`FORMAT_GROUPS`, `downloadAllZip`, `ensureTypeFonts`, `brandKit:237`, `downloadBrandKitMcp:6565`, `setGeomTokenOverride`). An `includes` scanner gives `5`, as stated. Open: (1) the U8-3 brace path above makes `0 stale` unreachable. (2) Step 3 names two shapes, but the `8` count and the `ensureTypeFonts()` stale case both need a third, `` `sym` (in `path` `` (the Measured regex's `\(?in`); name it in step 3. Note: the Measured table's grep prints `8` under ugrep but `6` under `/usr/bin/grep`, because `[^\x60]` inside a bracket is not an escape in BSD grep. The criterion's scanner is node, so only that figure depends on the shell |
| U9-5 | 🟢 | shape as docs-repair U6-4 |

### Revision 2 summary

49 🟢, 4 🟡, 0 🔴 of 53. Revision 2 fixes the 🔴 (U8-1's pass condition now holds on a simulated correct build at the rule-gates base) and 16 of the 17 🟡. U8-1 keeps two command defects, and U9-4, the one 🟡 not fully fixed, keeps a shape gap. Two rows that were 🟢 turn 🟡. U6-2 turns because the new typing rule makes its BRE alternation a literal pipe. U8-3 turns because the U8 then U9 order means U9's scanner now reads U8-3's brace-path citation and marks it stale. No row is unsatisfiable. The plan is mobilizable, and U6-2 should be fixed before U6 is dispatched. U8-1, U8-3 and U9-4 wait behind G1 anyway and should be fixed before U8 is dispatched. Nothing here grades a build.

verdict: 🟡
