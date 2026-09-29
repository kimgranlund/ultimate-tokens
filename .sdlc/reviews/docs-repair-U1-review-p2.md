PASS: U1 pass 2 fixes the false pan and zoom sentence, every U1 and assigned P row measures as stated at 0237e25e with its negative control biting, P8's ran block reproduces with `diff 0`, and all 100 Claims rows are true against code. Three low findings, none blocking.

---
kind: verdict
plan: docs-repair
unit: U1
ticket: "#751"
branch: unit/dr-U1
base: 5d8b1c30
sha: 0237e25e
grade: reviewer-l3 (opus, high) standing in for reviewer-l4 while fable is capped; this opus (builder-l5) build is therefore checked inside its own model family (b9044bb)
pass: 2
written: 2026-09-29
---

verdict: 🟢 PASS, three 🟡 findings (R1 to R3), one ruling on the kept `\|` (J1)

Head `0237e25e`; handoff Branch sha `4201a242` (merge of plan/docs-repair @ `1e263b2f`); doc commit `8f5153eb`. Measured in my own `git clone --shared` of `.worktrees/dr-U1` at `0237e25e` under the job tmp dir (`rv-dr-U1-p2/c`), `bash` with `/usr/bin/grep`. The unit worktree was not touched. `npm test` was not run: `pgrep -f '^node test/run.mjs' | wc -l` printed `2`; the handoff records it green at `8f5153eb`, and `git diff --stat 8f5153eb 0237e25e` touches `.sdlc` records only.

## Rows

| Row | State | Evidence (at 0237e25e) | Negative control (run by me) |
|---|---|---|---|
| U1-1 | 🟢 | `1 1 4 8 8` | file at `282fca8d`: `0 0 0 0 0` |
| U1-2 | 🟢 | doc `3 1 1 3 1 1 1 2`; source `2 3 36 1 3 2 1 1` | file at B: all eight doc counts `0` |
| U1-3 | 🟢 | `11 3 4` | file at B: `9 0` |
| U1-4 | 🟢 | `0 2 1` | file at B: `2 0 0` |
| U1-5 | 🟢 | `0 0` (file not discovered, no cite; second branch) | anchored `src/ui/app.js:1` cite appended: `    STALE 1 \| NEAR 0 \| UNDECIDABLE 0 \| OK 0 \| NOFILE 0  (line counts, deduped)`, `✗ 1 citation gate failure(s)`, `exit 1`; tree `0` after checkout |
| U1-6 | 🟢 | `0 0 271` | skill lines 57 to 90 appended: `1 2 305` |
| U1-7 | 🟢 | `0 2 2 1` | tree at `597b4fba`: `1 2 2 0` |
| U1-8 | 🟢 | no `NO-LEDGER`, `100`, `0`; `claims.out` is 100 lines starting `1 ` | (a) at `597b4fba`: `NO-LEDGER`, `0`, `0`. (b) the four-row fixture: `4`, `2`, failing lines `0 absent src/ui/sections/typography.js wirePanZoom` and `0 present src/ui/app.js:1439 pan/zoom`. (c) mine: every `present` anchor shifted by +1 line, then by -1: `100`, `99` both times, only the `absent` row survives, so every anchor is line-exact. (d) mine: `export const x = { colorMode: 1 };` appended to `persist.js` reds the `absent` row (`0 absent src/ui/persist.js colorMode`); the same word appended as a `//` comment does not (`0` failing), as designed |
| P3 | 🟢 | `branding: clean (741 files scanned)`; U+2014 in U1's added lines (diff from `5d8b1c30`): `0`; plan-wide raw count excluding handoffs `2`, both in U3 records as the handoff states | not rerun (pass 1 ran it) |
| P4 | 🟢 | `0 0 0 0`; U1's diff from `5d8b1c30` is `ui-plan.md` plus six `.sdlc` docs-repair records | not rerun |
| P5 | 🟢 | `1`, `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 0237e25e)`, `exit 0` | the U1-5 control above is the same gate going red |
| P6 | 🟢 for U1 | plan-wide `10` (U2's files, per the handoff), `ui-plan.md` `0` | not rerun |
| P7 | 🟢 | `H=4201a242`, `ancestor`, `0` | covered by P8 (c) below |
| P8 | 🟢 | `H=4201a242`, `HAS-RAN`, `1 1 1 1 1 1 1 1`, no diff lines, `diff 0` | (c) mine: the out block with line 1 set to `8f5153eb` and the branding line to `739`: `diff` prints `1c1` and `40c40`, `diff 1` |

P8 read of `ran.sh` against the plan: I split each U1 row's command cell on unescaped pipes and compared. U1-1, U1-2 and U1-6 equal the cell byte for byte; U1-5 and U1-7 equal the cell with every `\|` turned into `|`; U1-3, U1-4 and U1-8 keep `\|` where it is a regex escape and drop it elsewhere (`IFS='|'`, the pipes between commands, `(Claim|---)`). See J1.

## The pan and zoom sentence, read against code

`ui-plan.md:42` to `:45` now says the Typography and Geometry scenes are reset to `fit` on entry, pan and zoom like Color's through the same `wirePanZoom` shell, and only the Tokens tables, like Color's Mapping table, scroll. Each clause, from code lines:

- Reset on entry: `app.js:1439` code part `if (id !== "color") this.fit();`; `fit()` at `app.js:549` sets `this.viewport = { panX: 0, panY: 0, zoom: 1 }`, and `wirePanZoom` at `app.js:1788` reads and writes that same `this.viewport` (`st.ox = this.viewport.panX`). Color's stash and restore at `:1437` and `:1440` is the only exception. True.
- Same shell as Color: `this.wirePanZoom(area)` at `typography.js:351`, `:370`, `geometry.js:423`, `:442`, and Color's at `color.js:884` and `:944`. The whole of `src/ui` has no other call site. True.
- Tokens tables scroll, like Mapping: the Tokens views return `this._tokensTableArea(` (`typography.js:341`, `geometry.js:413`), whose body at `app.js:1755` to `:1766` builds the `" is-table"` area and calls nothing; Color's call sits under `if (!isTable) {` at `color.js:882`. The scrolling is CSS: `styles.css:668` `transform: none !important` and `:672` `overflow: auto` on `.canvas-area.is-table .canvas-scene`. True.

The doc no longer depends on the stale `app.js:1433` to `:1439` comments; U1-7 reds if the old denial comes back.

## Claims ledger, true against code

I read every anchor line in context, not only its code part. All 100 rows hold. The five pass 1 had on comments (C2, C10, C13, C27, C29) now sit on code: `app.js:1536`, `:1643`, `:1649`, `:1520` to `:1522`, `:1939`, `:1940`, `:833`, `:842`, `:806`. Spot reads beyond the needle: `renderHubBody` (`app.js:913` to `:949`) orders tiles, the masthead search, then `CATEGORY_INDEX`, as the Gallery paragraph says; `openCategory` (`:832` to `:840`) loads through `loadCategory(slug)` only on a cache miss; `_saveAppPrefs` (`:2297`) is the only place `colorMode` is persisted, and `src/ui/persist.js` carries no `colorMode` and no `section`; `model.mjs:176` is `geomScaleFor`'s return with `typeScale: typeScaleFor(doc, modeKey)`, so the per-mode composition claim holds.

## Findings

- 🟡 R1, one clause in C2's sentence is unledgered and its only in-tree statement is a comment. `ui-plan.md:39` says `this.section` `is ui-session state`. The ledger's C2 rows prove the field routes the editor, not that it is never persisted; the one place saying so is the `app.js:100` field comment (`ui-session ... (never persisted)`), which is exactly the source class this pass was built to stop. The clause is true (`grep -c section src/ui/persist.js` prints `0`; the `_saveAppPrefs` line at `app.js:2297` carries no `section`). Fix, if the Orchestrator wants it before pre-land: one `absent` row, `| C2 \`this.section\` is never persisted with the document | \`section\` | \`src/ui/persist.js\` | absent |`. The re-diagnosis §2.2 table did not list the clause either, so the builder followed its brief.
- 🟡 R2, two true clauses carry an anchor that proves less than the clause says (re-diagnosis §2.3: an anchor the reviewer would choose differently is a finding). (a) C12's `whose table already shows both modes` is anchored on `color.js:870` (`&& !isTable)`), which proves the Mapping view skips Compare, not that its table shows both modes; the code line is `color.js:1367` (`mode === "light" ? "Light" : "Dark"`, one row per role per mode), and the words themselves come from the comment at `color.js:868` to `:869`. (b) C6's `scroll instead` is anchored on `" is-table"` at `app.js:1759`, a class name; the scroll is `overflow: auto` at `styles.css:672`. Both clauses are true; each wants one more `present` row.
- 🟡 R3, P8's wording, planner's. P8 says the ran commands are `the plan's rows with the cell escape removed`. Read literally, that breaks three U1 rows, measured here: U1-3's `'CATEGORY_INDEX|categor'` counts `0` (expected `1` or more; `\|` gives `3`); U1-4's `'5 formats|5 format tabs'` prints `0` on the file at B, so its control stops biting (`\|` gives `2`); U1-8's `grep -E '^| '` is an ERE with an empty branch, so the `-v` leg drops every line and the row prints `NO-LEDGER`. P4's own note already names this trap. Suggested wording: a `\|` inside a quoted BRE (alternation) or an ERE (literal pipe) is regex and stays; every other `\|` is the cell escape and goes.

J1, the builder's kept `\|`: correct. The builder removed the cell escape everywhere it is table syntax (U1-5 and U1-7 fully; U1-8's `IFS`, command pipes and `(Claim|---)`) and kept it only where the shell needs the backslash. R3's three measurements are the evidence. Not a finding against the unit.

Not U1's: the 27 U+2014 lines Revision A still carries in `ui-plan.md` clear at the pre-land main merge (the handoff's trial merge reads `0` with the title hunk resolved either way). P2 stays owed at pre-land. The `app.js:1433` to `:1439` comments stay a `/file-task` chore per the re-diagnosis §4.
