---
kind: verdict
plan: chroma-floor
unit: U2
ticket: "#701"
branch: unit/cf-U2
base: 282fca8d
grade: verifier-l2 standing in for verifier-l3 while fable is capped (owner ruling b9044bb, "Accept opus substitutes, name them in the header"); U2 is an L6 (opus) build, so this checker is inside the builder's own model family
pass: 2
written: 2026-09-28
---

# Verdict chroma-floor U2 · 🟡 · pass 2: the handoff's C13 now reads revision 15; the even-dips timing row is still owed

verdict: 🟡
sha: abab9003bbb8da97224b8e9f8471510ae7a5bee8

Pass 2, records-only. `unit/cf-U2` at `abab9003`. `git log a4c78e3d..abab9003` is one commit, and it changes
`.sdlc/handoffs/chroma-floor-U2.md` alone (24 insertions, 10 deletions); `git diff --name-only a4c78e3d abab9003 --
src scripts figma mcp plugin` prints `0`. So every code row carries from pass 1 at `a4c78e3d` (code head `ed1658dc`),
unchanged below, and this pass rereads H1. `verdict.py check` on the handoff `--against` its `a4c78e3d` copy exits 0.

## Pass 2

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| H1 | the handoff records C13 as revision 15 states it: each straddling pair's own far-side \|dC\|, and each generated anchor's hex, rendered L* and CAM16 hue | 🟢 | mine: the C13 (i) table now has the four pairs at `0.49`, `0.61`, `0.50`, `0.55` with controls `13.19`, `13.14`, `10.72`, `17.71`. The new anchor table's eight hexes, rendered L* and hues agree digit for digit with pass 1's evidence run (`$CLAUDE_JOB_DIR/tmp/cfU2/report.md` line 21), e.g. pale `#EFF0F6` 94.876 h 254.9 in, `#EFF1F7` 95.151 h 250.0 out. The (iii) control reads `211 cells in 93 anchors`. A grep for `9\.99` or `2\.77` matches only line 75, which says why 9.99 was dropped, and lines 39 and 46, which name the probe's retired `(i)` line and say it is not graded; the "Left out" 2.77 amber is gone. The builder's log `F/c13-rev15.txt` does print a `(i)` block and then a `(i-b)` block and ends `FAIL`, as the handoff says | at `a4c78e3d` the same four-hex grep prints `0` and the handoff carried the `9.99` rows and the 2.77 amber; at `abab9003` it prints `4` |

Plan text: revision 16 (`ba4538d5`) covers all three items from pass 1's plan-text section (pale far side down to
9.0 C, the control at 211 in 93, C10 naming ten paths). `ba4538d5` is not an ancestor of `abab9003`; that is the plan
branch's copy, and no unit row reads it.

The 🟡 is C4 and C11/C12 only: the `gate:even-dips` timing row has 0 of 3 quiet-host runs, owed at U3 or pre-land,
as the handoff's "Left out" says.

## Met (carried from pass 1 at `a4c78e3d`)

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| C1 | `npm test` green, the tree clean after | 🟢 | `✓ all 50 test files passed`, exit 0; `git status --short` `0`; TESTS `50` | `scrimX` in `role-table.json`: `node test/engine/semantic.mjs` prints 2 FAIL, exit 1 |
| C3 | `EVEN_DIP_BASELINE` retired; 0 rendered off-anchor even dips | 🟢 | grep `0`; `0 dips at stops other than 500 (19 + 25 stops, 3764 palettes + default kit 16, no baseline); 500: 32`; in-gate controls `24` and `381`; `pass  dip-gate-even` | the floor reverted to the pre-#701 form prints `FAIL  dip-gate-even  off-anchor even dip: ... tertiary\|450`, exit 1 |
| C5 | the gate-path envelope cells hold; perceptual and peak untouched | 🟢 | even `10.9/16.2`, `39.1/44.6`, `39.0/44.6`, `16.3/16.5` all OK, `above 100% of stop 500: 0 OK`; perceptual+peak md5 `6e558839ee9e43217e1e2f7afc898b7b`, equal to the run's own at `282fca8d` | `--damp-amp 55` prints `above 100% of stop 500: 1916 FAIL` |
| C6 | mode isolation | 🟢 | `pass  mode-isolation: perceptual 34e544942d500b9e peak f560f784d8a4883a match fixture`; the same hashes recomputed at `282fca8d` | non-even `damp` scaled 1.01 prints `do not match`, `FAIL`, exit 1 |
| C7 | the captures hold | 🟢 | `anchor-ramp monotone: 0`; `distinct (25-stop) allow-list: 16 (expected 16)`; `pass skew-lift-okhsl`, `pass chroma-envelope`; `21`, `23`; `1`, `5` | a second `export function chromaEnvelope` prints `2`; a planted `KNOWN_BASELINE_DUP` entry prints `24` |
| C8 | chroma-floor, role-contrast and corpus-contrast hold; the FLOORS comparator reads U1's R44 set | 🟢 | `pass  chroma-floor` with `SAT_FLOOR_EXCEPT` at its `<base>` 11 stops; `pass  role-contrast`; contrast `PASS`, 0 under 4.5; comparator `changed 4, down 4` (Warning, Data 3, Data 5, Data 8), U1's set, `semantic.mjs` untouched by U2 | stop 300 dropped from `SAT_FLOOR_EXCEPT` prints `FAIL chroma-floor saturated stop 300 ... (#A6CD9E->#A5CD9C)`; Data 6 light floors at 1.0 print `changed 7, down 7` |
| C10 | regenerated assets clean; `docs/` moves only by the admitted list | 🟢 | `0`; `docs/`: `knowledge-02` plus the four paths revision 13 (b) admits; `code.js`, `role-table.json`, `adia-oklch-export.css` absent | a line appended to `knowledge-01-color-engine.md` lists a path outside the set |
| C13 (i) | each straddling pair's own far-side \|dC\| is at most 2 C | 🟢 | sat `0.49` (9.55/10.05) and `0.61` (94.95/95.13); pale `0.50` and `0.55`. Every pair straddles its edge (e.g. pale `#EFF0F6` L* 94.876 in, `#EFF1F7` 95.151 out) | pass 1's engine (`git show fe65e640:src/engine/tonal.js`) prints `13.19`, `10.72`, `13.14`, `17.71`, FAIL |
| C13 (ii) | the named anchor pairs agree | 🟢 | `#E8EEFA` 14.1/13.9/13.8 against `#ECF1FC` 13.8/13.4/13.2; `#1C2030` 22.9/21.3/18.2/16.1 against `#161A28` 20.8/20.2/16.5/14.5 | pass 1's engine fails both |
| C13 (iii) | the drain is bounded | 🟢 | 17 cells in 8 anchors (bound 20); 0 anchors in L* 88 to 95.05; 5 anchors below L* 15, exactly at the bound of 5 (L* 12.335, 14.246, 13.178, and two at 9.704, Khumbu teahouse and Rub' al Khali, both `#1F1A16`) | pass 1's engine prints 211 cells in 93 anchors, 1 in 88 to 95.05, 17 below 15, FAIL |
| #739 | the achromatic skip holds with no special case | 🟢 | `pass  achromatic-anchor: 27 of 27 ... 3 skipped under CAM16 C 5`; no line naming `clamped`, #739 or achromatic in the engine diff from `282fca8d`; the run's replica reads `skipped 3 of 30` | the replica with `floorRef = maxc500` reads `skipped 8 of 30`, `skippedOk false` |

## Met with a concern (carried)

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| C4 | `gate:even-dips` green and its control bites; its timing row is quiet-host | 🟡 | exit 0, `0 dips (19 + 25 stops, 3764 palettes + default kit 16, no baseline)`, `PASS`; greps `1`, `1`, `1`, `0`, `3`. The `.sdlc/baseline.md` timing row has 0 of 3 quiet-host runs and says so; it is owed before pre-land | `--full --floor-scale 1.6` prints `120 dips`, `FAIL`, exit 1 |
| C11/C12 (U2 parts) | the gate-list row, the adapter rows and the baseline row | 🟡 | `["npm run gate:even-dips", "even-dips", "gate:even-dips"]` at `baseline-agrees-check.sh:34`; 16 lines, `ok    time gate:even-dips`, only `STALE ui.html` (4130.1 against 4135.3 KB), `stale total: 1`, the allowed shape; the `adapter.md:36` sweeps row names seven, `355 to 475 s`, sums verified. The timing row carries the C4 gap | the script without its even-dips row prints 15 lines; the third run edited to 52.82 prints `STALE time gate:even-dips`, `stale total: 2` |

