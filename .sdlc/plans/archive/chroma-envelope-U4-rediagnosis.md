---
status: for the U4 pass 2 builder
ticket: "#725"
unit: U4 (records)
written: 2026-09-30
seat: planner (re-diagnosis of `.sdlc/verdicts/chroma-envelope-U4.md`, pass 1 🔴)
inputs: the verdict's findings 1 to 3 and 5; `unit/ce-U4` at 5aa90430 read with `git -C .worktrees/ce-U4 show` and `git diff febaa601 HEAD`; the plan at revision 9 (C4.1 to C4.5); `.sdlc/verdicts/chroma-envelope-U3.md` (the source of the copied figures); ADR-027
measurements: a throwaway clone of `unit/ce-U4` at 5aa90430 in `$CLAUDE_JOB_DIR/tmp/probe`; every figure below was printed there by the command named beside it (the two probe columns by a scratch edit of `report-preset-fidelity.mjs` in that clone, reverted after). Nothing in a live worktree was edited
---

# U4 re-diagnosis: the shipped record states figures the unit never measured

## Root cause

| | |
|---|---|
| Symptom | The CHANGELOG block and the ADR-026 amendment carry four quantitative claims and six identity counts that the code at 5aa90430 contradicts (verdict findings 1 and 2) |
| Where the figures came from | `git log -S76998` shows the counts (3779/3780, 76998, 75804) first appear in the U3 verdict (`0d0151ef`), whose `base:` is `b8142c16`, the plan branch at U3's start. The builder copied U3's delta over U2 and wrote it as #725's delta over `main`. "81%" is 76998/94500 rounded. The three absolutes ("stop 500 do not move", "no peak stop carries more chroma than stop 500", "does not shift lightness") are the plan's criteria prose (env(500) = 1, C6 (v) on the gate path, the hold's residual) restated as export-level facts |
| Why nothing caught it | C4.3 is `grep -c 725 >= 1`; C4.1 says "the six identity lines' counts" and names no base. No U4 criterion obliges a measurement, so the unit had no command to run and the reviewer checked presence, not truth. ADR-027 ("a seat cites only what it measured, at the ref it is writing about") is the rule that was broken: the amendment is about #725 as a whole, whose ref is `main` at `afd415c0` (the merge-base of `plan/chroma-envelope`, `git merge-base origin/main unit/ce-U4`), not `b8142c16` |
| The fix in one line | Every number and every absolute in the two records is printed by a named command run at U4's head against `afd415c0`, and the handoff pastes the output line next to the sentence it backs |

## Finding 1: the CHANGELOG block (`CHANGELOG.md:14` to `:25`)

Base for every figure: `node scripts/report-preset-fidelity.mjs --identity-control --authored --base afd415c0` in the unit worktree (about 90 s; the six `identity` lines plus the `default kit` three). The two probe columns are not printed by any shipped command; the figures are given so the builder writes them, and the command that would print them is stated.

| Claim as written | True figure at 5aa90430 | Source | Replacement sentence |
|---|---|---|---|
| "at most stops (about 81% of cells move)" | perceptual `86008/94500` (91.0%), peak `85463/94500` (90.4%), both `3780/3780` palettes; default kit `347/400` and `352/400`, `16/16` palettes | the `identity perceptual` and `identity peak` lines of the command above | "at most stops (about 91% of cells move: 86008 of 94500 perceptual and 85463 of 94500 peak cells across the 3780-palette corpus, against `main` before this change)" |
| "even mode and stop 500 do not move" | even `0/3780` palettes, `0/94500` cells. Stop 500: `1` cell moves per mode, film "The Night of the Hunter" primary `#1C1B1E` to `#1B1C1E` (one 8-bit code), perceptual and peak; default kit stop 500 `0` | the `identity even` line; the stop-500 count is the same compare loop filtered on `baseRamp[i].stop === 500` (scratch edit at `report-preset-fidelity.mjs:478`) | "even mode does not move, and stop 500 moves in one palette of 3780 per mode (film "The Night of the Hunter" primary, `#1C1B1E` to `#1B1C1E`, one 8-bit code)" |
| "no peak stop carries more chroma than stop 500" | true on the gate path only. Anchored, in the C6 (v) ratchet scope (19-stop, `dampAmp` 0, Adia excluded): `15/3764` violators, max `2.023757x`, all near-grey palettes whose white stop 50 reads above their stop 500 (e.g. Boston City Hall tertiary-muted `50 2.869` vs `500 2.145`). On the 25-stop authored export of every palette: `31/3780` (the 15 plus `dampAmp` > 0 docs and the Adia carve-out) | `node scripts/report-preset-fidelity.mjs --envelope`, the line `peak (gated in test/engine/tonal.mjs C6 (v)): 15/3764 violator(s)`; the 31 is the head ramp's `max(row.chroma) > chroma(500)` in the identity compare loop | "and the peak cap holds every stop at or under stop 500's chroma on the cap's own path; on an anchored export a near-grey palette's white stop 50 can still read above its stop 500 (15 of 3764 in the `test/engine/tonal.mjs` C6 (v) ratchet, unchanged in kind from before)" |
| "so the retune does not shift lightness" | The hold holds inside the new engine: max abs(exported L\* minus `toneTarget`) `0.7943` perceptual, `0.7` peak (8-bit rounding). Against the pre-#725 export a cell's L\* moves up to `2.4410` perceptual and `2.3142` peak (792 and 401 cells over 1 L\*), and that movement IS the old drift: the base engine's cells sit up to `2.4290` / `2.2158` L\* off the same `toneTarget` | `max dL*` on the two identity lines; the base-vs-`toneTarget` figure from the same loop comparing `lstarFromRgb(baseRamp[i].rgb)` with `headRamp[i].toneTarget` | "so a damped stop keeps the CIE L\* it had before the envelope was applied (within 8-bit rounding, under 0.8 L\*). Against a kit exported before this change a cell's L\* moves by up to 2.4, which is the lightness drift the old chroma coupling carried and the hold removes" |
| "0.74 at stops 300/700 and 0.23 at 100/900", "`c` = log2 3, `d` 0.9275", "Four changes move it", FLOORS 7.5 / 4.8, eighth `gate:sweeps` member | true as written (verdict row "CHANGELOG claims true against the code") | `--envelope` prints `0.7435` / `0.2304`; `OKHSL_DAMP_RESIDUE_EXP` 2.179591 | keep |

The "moved with it" sentence at `:23` to `:25` stays; the two floors it names are the pins, not measurements.

## Finding 2: the ADR-026 amendment (`decision-records.md`, the `#725, R69` bullet, "The movement is export-wide" clause)

| Count as written | True count over `afd415c0` | Source | Replacement clause |
|---|---|---|---|
| perceptual 3779 of 3780 palettes, 76998 of 94500 cells | `3780/3780`, `86008/94500` | `identity perceptual` line | see below |
| peak 3779 of 3780, 75804 of 94500 | `3780/3780`, `85463/94500` | `identity peak` line | |
| even 0 in both | `0/3780`, `0/94500` | `identity even` line | keep |
| default kit perceptual 16 of 16, peak 16 of 16, even 0 of 16 | `16/16` (`347/400` cells), `16/16` (`352/400`), `0/16` | the three `default kit` lines | keep the palette counts, add the cells |

Replacement clause, whole: "The movement is export-wide (the six identity lines over `main` at `afd415c0`, `report-preset-fidelity.mjs --identity-control --authored --base afd415c0`: perceptual 3780 of 3780 palettes and 86008 of 94500 cells, peak 3780 of 3780 and 85463 of 94500, even 0 in both; default kit perceptual 16 of 16 palettes and 347 of 400 cells, peak 16 of 16 and 352 of 400, even 0 of 16) and is the second after this ADR's own."

If the builder prefers to keep U3's figures they must be scoped, not corrected: "(U3's own delta over U2, base `b8142c16`: ...)". Do not do both; the ADR names one base and it should be the one the amendment is about. The Quick map row needs no change.

## Finding 3: the two reactivity cites

| | |
|---|---|
| Move the pins | Yes, to `:1026` |
| Why | The prior pin (`67cc0cde`, `:1024`) named the def line: `git show 67cc0cde:src/engine/tonal.js \| sed -n '1024p'` prints `export function okhslLAt(lstar) {`. At 5aa90430 that line is `:1026` (`sed -n '1026p' src/engine/tonal.js`); `:1023` is the `// okhslLAt is pure, with no cache (#738)` comment. Both read audit-OK, but the like-for-like re-pin is the def line, and the two doc sentences say "`okhslLAt` (`src/engine/tonal.js:NNNN`)", a function, not a comment |
| Edit | `docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md:89` and `04-context-and-messaging.md:71`: `tonal.js:1023` to `tonal.js:1026` |
| Check | `node scripts/audit-citations.mjs \| grep okhslLAt` prints `OK ... matched okhslLAt at src/engine/tonal.js:1026` for both; `node test/repo/citations.mjs` still `STALE 0` |

## Finding 5: 7.60 vs 7.59

| | |
|---|---|
| Text change in U4 | None |
| Why | The measured cell is `7.59944` (`#23601E` on `#FFFFFF`, WCAG), which prints `7.60:1` at two decimals. The CHANGELOG and the amendment name only the pin (`7.5`), which is `floor` of the measurement at one decimal either way. The `7.59` is a comment in `test/engine/semantic.mjs:302` and the `7.5925` is the plan's C3.7 text; neither is a U4 record and U4's lane touches no test or engine line. Leave both; the builder's handoff may name it as a one-line follow-up for the Orchestrator's close step |

## What the builder runs before handing off

| Step | Command (in `.worktrees/ce-U4`, at the new head) | Must print |
|---|---|---|
| 1 | `node scripts/report-preset-fidelity.mjs --identity-control --authored --base afd415c0` | the nine `identity` lines; paste all nine into the handoff under C4.3 |
| 2 | `node scripts/report-preset-fidelity.mjs --envelope \| grep 'C6 (v)'` | `15/3764 violator(s)`; paste it |
| 3 | `grep -n '91%\|86008\|85463\|15 of 3764\|2\.4' CHANGELOG.md` | one hit each on the block's lines |
| 4 | `sed -n '/^## ADR-026/,/^## ADR-027/p' docs/reference/references/decision-records.md \| grep -c '76998\|75804\|3779'` | `0` (or the scoped `b8142c16` sentence if that route was taken, and then `grep -c afd415c0` is `0` there) |
| 5 | `grep -n 'tonal.js:10' docs/reference/reviews/2026-08-20-reactivity/*.md` and `sed -n '1026p' src/engine/tonal.js` | both cites `:1026`; the line is `export function okhslLAt(lstar) {` |
| 6 | `node test/repo/citations.mjs && node test/repo/em-dash.mjs && node test/repo/branding.mjs` | `STALE 0`, clean, clean |
| 7 | `git diff febaa601 HEAD -- src scripts \| wc -l` | `0` |
| 8 | `npm test` | green, tree clean after |

The handoff's rule, per ADR-027: every number or absolute in the CHANGELOG block and the amendment appears in a handoff table beside the command that printed it and the printed line. A sentence with no command is scoped ("on the gate path", "against `main` at `afd415c0`") or cut. That table is what pass 2 re-verifies (C4.3, the claims row, C4.4's citations), so a figure that is not in it is a 🔴 for pass 2.
