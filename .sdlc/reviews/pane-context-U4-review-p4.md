PASS
review: pane-context U4 pass 2 PASS (#785)

Reviewer grade l3. Reviews `c161f252..92c18928` (code `204704fb`, handoff `92c18928`) on `unit/pc-U4` against C4.14 to C4.19 (plan revision 12) and the re-diagnosis `.sdlc/plans/pane-context-U4-rediagnosis.md`. C4.1 to C4.13 were passed in pass 1 and are untouched: the range changes no `src/`, `figma/`, or UI source file.

Scratch under `$CLAUDE_JOB_DIR/tmp/pc-U4-rev2/` (`git archive` copies). Heavy-load check printed `0` before `npm test`. `NODE_OPTIONS` unset.

## Findings

| # | Severity | Where | Finding | Fix |
|---|---|---|---|---|
| 1 | 🟡 | `docs/reference/references/decision-records.md` Quick map ADR-026 row | The row is rewritten (one `-`/`+` pair) to list the new amendment. The unit lane says "appended amendment only". This is the index entry of the same amendment, every earlier ADR-026 amendment extended the same row the same way, and the handoff discloses it. In scope by precedent; flagged because it edits an existing line | none |
| 2 | 🟡 | `test/engine/even-dips-gate.mjs` `randomPalette` | `chroma: (rnd(), 100)` consumes and discards a draw. It is needed (dropping it moves the set, measured below) and the header and the function comment say why. Terse, not wrong | none |
| 3 | 🟡 | handoff, C4.17 | Names `origin/main` as `5344711c`; in this checkout `origin/main` resolves to `1930171b`. The result is the same (control (a) `40`, `PASS`), so no correction needed, only the sha label differs by fetch time | none |

No 🔴. Nothing in the range blocks.

## Criteria

| Id | Evidence (my own runs) | Negative control (my own runs) | State |
|---|---|---|---|
| no `src/` change | `git diff --stat c161f252..92c18928 -- src figma` prints nothing; the 7 changed files are the gate, foundations, ADR doc, spec-draft, integrate question, shim, handoff | the same command over `c161f252..204704fb -- test` prints the gate file, so the filter does report a changed path when there is one | 🟢 |
| C4.14 | head archive, `FORCE_COLOR=0 node test/engine/even-dips-gate.mjs --full`: `rc=0`. Control (a) `8 dips (want > 0)`; (a) `0 dips (19 + 25 stops, 2304 palettes ..., bound 0)`; (b1) control `8`, real `0`; (b2) control `16 dips (want > 8 ...)`, real `6 dips in 4 palettes (... bound 8 ...)`; pre-#701 `124`; corpus `0`; `PASS`. Same lines as the plan | NC-a (head `tonal.js`, `floorRefAt(hue, ...)` with the original in a trailing comment so the patch target stays unique): `rc=1`, (a) real `8 dips`, `FAIL`. NC-b (`chromaAt(hue)` the same way): `rc=1`, (b1) real `8`, (b2) real `16 dips in 9 palettes`, `FAIL`. c161f252's gate on the head engine: `rc=1`, `negative control DID NOT bite ... 0 grid dips on (a)`. A first NC-a/NC-b try that replaced the target outright died on the gate's own "patch target not found exactly once" guard, which is the guard working, not a result | 🟢 |
| C4.15 | `grep -c` axis `[30, 45, 60, 100]` `1`; `chroma: rnd() \* 100` `0`; `const RANDOM_PIN = 8;` `1` | dropping the consumed draw (`chroma: 100`, scratch `gate-nodraw.mjs`): (b2) real `3 dips in 2 palettes`, palettes `#102,#324`, not the `#317,#346,#781,#934` of the real run, so the draw order is load-bearing | 🟢 |
| C4.16 | independent recipe, not the builder's script: head gate's `gridRandom(REAL)` run in an `8428280e` archive with `REAL` = that tree's `tonal.js`: `8 dips in 5 palettes` | c161f252's gate (drawn chroma) in the same archive: `7 dips in 4 palettes`, the old pin, so the recipe reproduces history. `(a)` real `0` in both | 🟢 |
| C4.17 | head gate on `git archive` of `origin/main` (no damper): `rc=0`, control (a) `40`, (a) `0`, (b1) `8` / `0`, (b2) control `16` / real `6 dips in 4 palettes`, pre-#701 `120`, corpus `0`, `PASS` | both directions covered with C4.14 | 🟢 |
| C4.18 | Header states the axis, why 100 (a dip at g needs a chroma-100 depth of at least 300/g), (b2) at 100 with the draw kept, pin 8 with `8428280e`. `grep -c '(7 dip cells)'` on foundations `0`. `grep -c 'Amendment (2026-10-03, #785, #766)'` on decision-records `1`. Integrate question has the even-dips row and the `19ce51c4` label (`19ce51c4` is the merge commit, parent `2f45a4bb`) | `grep -rn 'RANDOM_PIN = 7\|count of 7\|(7 dip cells)' test docs/reference .claude/skills` hits only `decision-records.md:824` (the #766 amendment, history) and `:836` (the new amendment quoting it); `.sdlc/handoffs/floorref-hue-U2-p3.md` hits are a closed unit's history | 🟢 |
| C4.19 | `npm test`: `all 54 test files passed`, `rc=0`; `node test/repo/em-dash.mjs`: `clean (1132 files scanned)`; `git status --porcelain` empty after the run | C4.13 control not re-run (no UI, role-table, or `src/` change in the range; pass 1 verified it) | 🟢 |
| verdict row: tokens tables (`(tok-scheme)`) | head shim: `HEADLESS BOOT PASS`; the rows assert `.compare-col` count `0`, `.is-table` present, and no `canvas-scheme-` class on the area or any descendant | planting `canvas-scheme-light` in `_tokensTableArea`'s class in a scratch copy: `rc=1`, both `(tok-scheme)` rows red (`✗` Typography, `✗` Geometry). The `.is-table` presence check makes the row non-vacuous | 🟢 |
| verdict row: `spec-draft.md:176` | `grep -c 'canvas-preview color-scheme'` `0`; the line now says app-chrome follows system / light / dark and the canvas always draws Light and Dark, matching U4's behavior | old text read `app-chrome and canvas-preview color-scheme each follow` | 🟢 |
| verdict row: integrate question | Numbers row reads `19ce51c4`; the new table row records the gate, the cause, and the fix pointing at the re-diagnosis and the owner ruling | old label named `2f45a4bb`, the pre-merge base | 🟢 |
| ADR-026 append-only | `git diff` of `decision-records.md`: the body change is pure addition (the amendment after the #766 amendment); the only removed line is the Quick map row (finding 1). The #766 amendment text, including "pinned count of 7", is intact | `git diff ... | grep '^-' | grep -v '^---'` lists exactly one removed line, so a body deletion would show as a second | 🟢 |
| `U+2014` | `em-dash.mjs` clean; no U+2014 in any file the range touches or in this review | `grep -c` for the character over the range's files printed nothing, and the repo gate's own `--self-test` reports `PASS`, so the scanner does see the character | 🟢 |
| commits | `204704fb` carries `Seat: builder` and the Co-Authored-By trailer | `git log c161f252..92c18928` lists two commits and the grep counted two `Seat:` lines, one per commit, so the count would drop if a trailer were missing | 🟢 |

## Judgment

The re-derivation is sound against the stated mechanism. The grid now includes the only undamped render, chroma 100, which bounds every `g`; the (b2) population draws the same random set as before and renders at 100; and `RANDOM_PIN` moves 7 to 8 by R87's own rule (this block's count on the merge-base engine), reproduced independently here, not taken from the handoff. The gate bites where it should, in the three places a controller could cheat: the real engine with the rotation-following reference restored (NC-a), the final-chroma line restored (NC-b), and the old unedited gate (now "did not bite", which is the proof the old controls were blind). The re-derived gate also passes on a tree with no damper, so it does not lean on the damper being present.

Optional, not blocking, already noted in the re-diagnosis: `docs/reference/references/glossary.md` `chromaFloor` and the `evenChroma` header comment in `src/engine/tonal.js` ("it only rescues the LOW-chroma ramps") predate #785. Out of this unit's lane (no `src/` change).

R98: none found
