---
kind: verdict
plan: anchor-gaps
unit: U3
ticket: "#740, #744"
branch: unit/ag-U3
base: d017bbc9
grade: verifier-l2 (opus), stand-in while fable is capped; an opus build's checkers are opus per b9044bb; evidence run ag-U3-verifier-l2-p2, spot-checked by the Verifier seat
pass: 1
written: 2026-09-29
---

# Verdict anchor-gaps U3 · 🟡 · the gallery path opens without the backfill, the wiring is pinned in npm test, the fixture pins U2's corpus (cleared to merge)

verdict: 🟡
sha: e45e4db7d6a39cbb03945a1d8db5be63bb1baf6f

`unit/ag-U3` at `e45e4db7` (code `327eb6aa`), unit base `d017bbc9` (a descendant of `9f5a4bac`), `B` = `5cdf9ed1`. Criteria: plan revision 8 at `17c80034` (P1, P3, P4, U3-1 to U3-6; P2 and smoke are pre-land pass 2's). The evidence run worked in its own `--shared` clone; every control was reverted and the tree read `0` dirty after each. `verdict.py check` exits 0 on the handoff, review, review p2, and on `.sdlc/baseline.md` against its `d017bbc9` copy. This is the unit's first verdict; the builder's pass 2 answers review pass 1.

| Row | State | Evidence | Negative control |
|---|---|---|---|
| P1 | 🟢 | `✓ all 54 test files passed`, exit 0, `54`, `0`; `wrote figma/plugin/ui.html 4141.3 KB`; `ok    ui.html: baseline 4141.3 KB, tree 4141.3 KB` | `"scrimX` in `role-table.json`: `✗ 1/54 test file(s) failed`, exit 1 |
| P3 | 🟢 | `branding: clean (973 files scanned)`, `0`, `0`, `em-dash: clean (981 files scanned)`, exit 0; the handoff's stated quote count `0` matches | `decision-records.md` copied to `.sdlc/verdicts/x.md`: `FAIL: 3 branding violation(s)`, exit 1; an added prose line with the glyph: second command `1`, em-dash gate exit 1 |
| P4 | 🟢 | `0`, `1 1`, `0`, `0`, `3`, `0` (the fifth is revision 8's `3`: hunks `@@ -53 +53 @@`, `@@ -2362,3 +2362,3 @@`, `@@ -2371 +2371 @@`) | seven-name fixture: `3`; a second `model.mjs` line: `2 2`; FLOORS fixture: `1`; a `readFromFigmaVariables` edit: fifth `4`; `owner` edited: sixth `2` |
| U3-1 | 🟢 | `1`, `1`, `0`, `2`, `1` (the seat re-read the first three in `.worktrees/ag-U3` at `e45e4db7`: `1 1 0`) | `openConfigAsSet` back on `hydrateStoredDoc(config)`: greps swap; `FAIL  gallery-reach, (k) app.js openConfigAsSet must call hydrateConfig( and not hydrateStoredDoc(`; full `npm test` `✗ 1/54`, exit 1 |
| U3-2 | 🟢 | `presets 343 stamped 0 differ 0 maison #21701A` | alias `export const hydrateConfig = hydrateStoredDoc;`: `presets 343 stamped 1 differ 1 maison #21701A`; backfill removed: `... maison undefined`, U1-3 `16 of 16 0` |
| U3-3 | 🟢 | `0 9` | alias: `9 9`; backfill removed: `0 0` |
| U3-4 | 🟢 | `exit 0`, `3`, `15`, `1`, `8`; `pass  stored-anchors`, `pass  gallery-reach` | alias: exit 1, joined `FAIL  gallery-reach, (h) of 343 ...; (i) ... got 9 and 9; (k) ... got "#21701A"`; backfill removed: `FAIL  stored-anchors, (a)` and `gallery-reach (i); (j) ... got undefined`; `>= 5` to `>= 7`: `stored-anchors, (c)` and `gallery-reach, (k) ... got "#21701A"` |
| U3-5 | 🟢 | `pass  mode-isolation: perceptual 990c17c5ae140e6e peak b59bd41501cd829a match fixture (captured at 81ac5521...`, exit 0, `3 3`, `1 1 1`; a re-capture at the head moves only `capturedAt` | `brands.js` at `$B`, fixture kept: `FAIL ... 34e544942d500b9e ... f560f784d8a4883a do not match`, exit 1; fixture at `$B`: `FAIL ... 990c... (captured at 282fca8d...`, exit 1 |
| U3-6 | 🟢 | `1`, `0`, `2`, `1`, `1`, `### 2026-09-26` (accepted on the unit head; re-dated at landing) | CHANGELOG at `81ac5521~1`: fourth and fifth `0 0`; bare `U1-4`: first `0` |
| Code | 🟢 | `hydrateConfig` is `hydrateStoredDoc` at `$B` byte for byte (`hueSpace == null` stamp then `return hydrate(d);`); `openSet` `:205` and the set tile `:682` keep `hydrateStoredDoc(rec.doc)`; the four callers `:806`, `:1192`, `:1227`, `:2358` as the comment says; `serialize` stamps `CURRENT_SCHEMA_VERSION` = `6` (`persist.js:377`, `:488`) | the (k) slice (signature to first `\n  }\n`) equals the awk range's ten lines, and the wiring revert reds it |
| Records | 🟡 | CHANGELOG #740 and #744 sentences true; Deviations 1 and 3 true; baseline cell `4141.3` equals `npm test`'s line. Stale: handoff `:75` (Left out, P2) reads `baseline 4141.0 KB, tree 4141.0 KB`, the pass 1 figure; the Files table's baseline row names `4139.8` to `4141.0` only | the Pass 2 section's bundle row carries `4141.3`, so the stale line is the pass 1 text left standing, not a false claim about the head |
| Hygiene | 🟡 | all eight commits `d017bbc9..e45e4db7` carry the Opus 5.5 co-author and no Seat trailer; none stages `.sdlc/board.md` | `%(trailers:key=Seat)` on an orchestrator commit prints `orchestrator` through the same read |

### Findings

1. 🟢 Pre-land pass 1's RE red is fixed in the product: the gallery, "Open saved palette", Figma-variables and project-restore paths open through `hydrateConfig` with no backfill (`stamped 0 differ 0` over 343 presets), the stored-set seam still stamps Maison, and `npm test` now reds on the wiring revert through `gallery-reach` (k).
2. 🟢 Pre-land pass 1's CI red is fixed: the fixture pins U2's corpus and the gate passes; pre-land pass 2 still reads `sweeps` on the PR.
3. 🟡 Handoff `:75` and the Files baseline row carry the pass 1 KB figure (`4141.0`); the head is `4141.3`. Record-only.
4. 🟡 Plan text, not carried into revision 8: U3-4's expected (`3` as "each of (h), (i), (j)" FAIL texts; it is the comment, the one joined FAIL and `DECLARED`) and its control's "(i) is read from U3-3" (the joined message prints (i) and (k) itself); U3-6's fourth grep reads from the reach sentence on (Deviation 3). No row names the (k) second half's `>= 7` control; it was run here and reds as the handoff says.
5. 🟡 No Seat trailer on the unit's commits (adapter asks it only of board commits; precedent rates it yellow).
