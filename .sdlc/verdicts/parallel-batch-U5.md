---
kind: verdict
plan: parallel-batch
unit: U5
seat: verifier
pass: 1
ticket: "#786"
written: 2026-10-04
---

# parallel-batch U5 · pass 1 · 🟢 at `5baa5457`

verdict: 🟢
sha: 5baa5457

Unit `unit/pb-U5` at `5baa5457` (code `3da39e28`, `54574fda`, `559eae1f`, reviewer record on top), base `61bcd123`, issues #796 code lines and #783's date, criteria C5.1 to C5.3 at plan revision 4 (C5.2 reworded in revision 3, lane widened in 3 and 4). Builder `pb-U5-builder-l2-p1` (sonnet); checker the Verifier seat itself at grade L2 (opus), so the checker sits outside the builder's family. Reviewer-l3 record PASS. Preflight: `verdict.py check` exits 0 on the request. Every run is the seat's own, in a fresh clone at `5baa5457` under the job dir; the root and `.worktrees/pb-U5` were only read. Load was 15 to 28 at the gate start, so no row is a timing row.

## Rows

| Criterion | State | Evidence | Negative control |
|---|---|---|---|
| C5.1 no `eleven` voice wording, source and bundles | 🟢 | `grep -n "eleven" src/ui/overlays/drawer.js src/ui/sections/typography.js` prints nothing (rc 1); no `11 voices` or `all 11` either; after `npm test` and `npm run build`: `eleven-voice` `0` in `figma/plugin/ui.html` and `0` in `dist/ultimate-tokens.html`, `fifteen-voice` `3` in dist | at base `61bcd123`: `typography.js:1003`, `:1013` and one `drawer.js` line (3 source lines), and the committed `ui.html` counts `eleven-voice` `1` |
| C5.2 the date agrees with its source (revision 3) | 🟢 | `grep -n "07-13" typography.js` prints only `:671` (`a fixed table since 2026-07-13`, correct per `type.mjs:8`); `:535` now reads `UI-control and UI-widget × 6 (XS to 2XL), since 2026-07-16`, which is `type.mjs:41` (`TKT-0008 (2026-07-16)`); `grep -c "2026-07-16" src/engine/type.mjs` `4` | at base `:535` reads `since the 2026-07-13 fixed-size-table rewrite`, so the same grep prints `:535` as a second hit |
| C5.3 scope | 🟢 | `git diff --name-only 61bcd123 5baa5457`: `src/ui/overlays/drawer.js`, `src/ui/sections/typography.js`, `figma/plugin/ui.html`, plus the handoff and review. Source diff is 4 comment edits (`:535`, `:673`, `:737`, `:1003-1004`) and the two planned strings (`drawer.js:529` `fifteen-voice`, `typography.js:1013` `fifteen voices`); `51 steps` = 13 × 3 + 2 × 6 | an edit to `type.mjs` would print a third source path; none does |
| Hunks clear of pane-context | 🟢 | `origin/plan/pane-context` hunks in `typography.js` sit at `137` to `387` and `616`, none in `drawer.js`; U5 at `529`, `535`, `673`, `737`, `1003`, `1013`; `git merge-tree --write-tree 5baa5457 origin/plan/pane-context` prints `Auto-merging src/ui/sections/typography.js`, its only conflict `.sdlc/board.md` (the Orchestrator's record) | the same merge-tree does flag the real `.sdlc/board.md` conflict |
| `npm test` | 🟢 | rc 0, `✓ all 54 test files passed`, porcelain `0` | C5.1's base state is what the suite's own repo gates last saw; the citations gate bit on a planted pin in U7's verdict today |
| `npm ci && npm run build` | 🟢 | ci rc 0, build rc 0, `wrote figma/plugin/ui.html 4167.6 KB`, porcelain `0` (the committed bundle matches the rebuild) | `const __neg: number = "x";` in `src/main.ts`: rc 1, `TS2322`; restored |
| `npm run smoke` | 🟢 | rc 0, `SMOKE PASS, gallery · category · editor · export dialog all render in a real browser`, porcelain `0` | `throw new Error("neg");` as line 1 of `typography.js`: `SMOKE FAIL (3):`, rc 1; restored, final porcelain `0` |

## Findings

- 🟡 The `npm test` row's control is indirect: I did not plant a fault under the suite at this head. The suite's pass is still evidence, and the build and smoke controls ran here.
- 🟡 The reviewer's non-blocking items stand: `styles.css:1359` `21-step` goes to U6's brief; the stale export-format counts at `app.js:681`, `:795`, `model.mjs:1046` are out of lane, for a follow-up issue; the handoff's `:675` cite is `:673`.
