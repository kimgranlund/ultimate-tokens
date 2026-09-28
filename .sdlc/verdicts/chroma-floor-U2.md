---
kind: verdict
plan: chroma-floor
unit: U2
ticket: "#701"
branch: unit/cf-U2
base: 282fca8d
grade: verifier-l2 standing in for verifier-l3 while fable is capped (owner ruling b9044bb, "Accept opus substitutes, name them in the header"); U2 is an L6 (opus) build, so this checker is inside the builder's own model family
pass: 1
written: 2026-09-28
---

# Verdict chroma-floor U2 · 🔴 · the engine meets every criterion; the handoff still grades C13 (i) at revision 14

verdict: 🔴
sha: a4c78e3dc78a423e47f773e6f5bca27c39e9666e

`unit/cf-U2` at `a4c78e3d`. The code head is `ed1658dc`, and `git diff --stat ed1658dc a4c78e3d` lists four
`.sdlc/` files only (the handoff, the plan, and two review records), so every code row is graded on the engine at
`ed1658dc`. The criteria are the plan at revision 15. The evidence run
(`$CLAUDE_JOB_DIR/tmp/cfU2/report.md`) used clones at `a4c78e3d` and at `<base>` `282fca8d`, under load 60 to 330, so
no timing here is quiet-host. `verdict.py check` passes on the handoff and both reviews. Review r1 ends
`verdict: 🔴` and r2 ends `verdict: 🟢`. I reread the handoff and the plan text myself.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| H1 | the handoff records C13 as revision 15 states it: each straddling pair's own far-side \|dC\|, and each generated anchor's hex, rendered L* and CAM16 hue | 🔴 | mine: the handoff's C13 table still grades revision 14's loss-vs-reference reading, keeps the dropped `9.99 vs 10.05` rows (lines 49 and 52), and its "Left out" carries `🟡 C13 (i) pale 94.95 vs 95.13 reads 2.77` (line 134), a reading revision 15 retired. A grep for the anchors' hexes (`#051C2F`, `#EAF1FD`, `#181B1F`, `#EFF0F6`) in the handoff prints `0`. The engine passes the revised check (C13 (i) below); the record does not describe it | the evidence run's table carries all eight anchors with hex, L* and hue, e.g. sat `#051C2F` L* 9.546 h 250.1 against `#051D31` 10.052 h 250.7 |

What unblocks it is records only: the handoff's C13 section is restated at revision 15 (the four \|dC\| figures,
the eight anchors, 9.99 dropped, and the 2.77 amber retired). No code changes, so the next pass rereads H1 and the
record rows, and the code rows carry.

## Met

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

## Met with a concern

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| C4 | `gate:even-dips` green and its control bites; its timing row is quiet-host | 🟡 | exit 0, `0 dips (19 + 25 stops, 3764 palettes + default kit 16, no baseline)`, `PASS`; greps `1`, `1`, `1`, `0`, `3`. The `.sdlc/baseline.md` timing row has 0 of 3 quiet-host runs and says so; it is owed before pre-land | `--full --floor-scale 1.6` prints `120 dips`, `FAIL`, exit 1 |
| C11/C12 (U2 parts) | the gate-list row, the adapter rows and the baseline row | 🟡 | `["npm run gate:even-dips", "even-dips", "gate:even-dips"]` at `baseline-agrees-check.sh:34`; 16 lines, `ok    time gate:even-dips`, only `STALE ui.html` (4130.1 against 4135.3 KB), `stale total: 1`, the allowed shape; the `adapter.md:36` sweeps row names seven, `355 to 475 s`, sums verified. The timing row carries the C4 gap | the script without its even-dips row prints 15 lines; the third run edited to 52.82 prints `STALE time gate:even-dips`, `stale total: 2` |

## For the Orchestrator (plan text, not U2's)

- Revision 15's C13 "Today" says the far side sits "at 13.0 to 14.4 C on both sides of each edge". That is true of
  the sat pairs; the pale pairs go down to 9.0 (dark stop 400 9.0/9.0, light stop 600 9.0/9.5). The four \|dC\|
  figures in the same sentence are right.
- C13's control text says (iii) reads "215 cells in 96 anchors" on pass 1's engine; the run reads 211 in 93, and the
  handoff's control column agrees with the run.
- C10's criterion text still lists six `docs/` paths and calls a seventh a FAIL. The four admitted in revision 13 (b)
  live only in the revision log.
These need to be true before the pre-land record reads the plan.
