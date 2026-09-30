# Handoff chroma-envelope U3 pass 1 (revision 8) · builder → orchestrator

| Field | Value |
|---|---|
| Branch | unit/ce-U3 @ 0bbae01b (engine and records; this sha line lands in the follow-up commit): revision 8 applied on the merge ba7a299e (plan/chroma-envelope b8142c16 into unit/ce-U3; `.sdlc/board.md` as main has it). Pass 1's engine commit is 67cc0cde on base ee6fadbe |
| Scope | the perceptual/peak damp retune (`OKHSL_DAMP_D` 0.9275, `OKHSL_DAMP_CURVE_GAIN` log2(3)/1.5, a power residue), the per-stop tone hold (`holdTone`, `okhslToRgbFloat`, `toneTarget`/`toneHeld` rows), the peak cap's own `capped` flag read by `anchor.mjs` f4, and, at revision 8, the anchored `oklch` hue as the anchor's own OKLCH hue (`hOkStop = oklchSpace ? targetOklchHue : hOkSeed`, no per-stop `solveOkhslHue`), the Kea named exception in the report and gate, the one-time allow-list freeze re-taken, the fixtures re-captured and re-pinned |
| Status | 🟢 on every criterion; Q1 to Q7 ruled or closed (R76, R77, revision 8, R78). Findings F3 and F4 are declared below, neither changes a bar. Paired timing ratios are 0.990 / 0.934 / 1.115, all at most 1.2. |
| Files, engine | `src/engine/tonal.js` (revision 8: the hue line, the `solveOkhslHue` and `okhslStopsAnchored` header comments, the dead `const s` line removed), `src/engine/okhsl.js`, `src/ui/model.mjs` (pass 1, one line: `capped` onto the projected row) |
| Files, report | `scripts/report-preset-fidelity.mjs`, `scripts/lib/envelope-measure.mjs` (`--damp`, `--damp-curve`; revision 8: `NAMED_EXCEPTIONS`), `test/engine/chroma-envelope-gate.mjs` (revision 8: prints the named exception) |
| Files, tests | `test/engine/tonal.mjs`, `test/engine/anchor.mjs`, `test/engine/exports.mjs`, `test/engine/semantic.mjs` |
| Files, fixtures | `chroma-envelope.json`, `mode-isolation.json`, `test/ui/fixtures/default-doc-ramps.json` (revision 8); `tonal-legacy.json`, `shadcn-baseline.css`, `radix-baseline.json` (pass 1, unchanged at revision 8: they render `cam16`) |
| Files, generated | `docs/reference/data/adia-*`, `src/ui/describe-mcp-assets.js`, `figma/plugin/ui.html` |
| Files, docs | `docs/spec/spec-panda-park-ui-exports.md`, the two reactivity review citations, `.sdlc/baseline.md`, `.sdlc/questions/chroma-envelope-U3.md` (Q5 and Q6 closed), this handoff |
| Untouched | `FLOORS_BF2AAF6`, the FLOORS `// measured` comments (U4's), the plan file, `.sdlc/board.md` |

## Criteria

| Id | Evidence at head | Control run | State |
|---|---|---|---|
| C3.1 | With damp 70 and dampCurve 1.5, perceptual and peak both read `0.7435` at 300/700 and `0.2304` at 100/900, each within 0.02 of its bar (0.75, 0.25). All three modes read 1.0 at stop 500. At damp 0, perceptual and peak read 1.0 at every stop (max \|env - 1\| 0 over lift -40 to 40, curve 0.5 to 4). Even reads 0.3175 / 0.1150, byte-identical to base. d = 0.9275, c = log2(3) = 1.585, damp residue exponent 2.1796 (`OKHSL_DAMP_RESIDUE_EXP`, D2). Unchanged by revision 8 | The same probe at base ee6fadbe prints perceptual and peak 0.7926 / 0.4134 | 🟢 per R76 Q3; D2, D4 |
| C3.2 | `--envelope` exits 0 (33.7 s). READING (b): perceptual and peak 74.3 at 300/700, 23.0 at 100/900. READING (a) gate path: perceptual median 6.1 / 74.6 / 59.1 / 13.9, p90 10.1 / 89.3 / 63.8 / 17.4 (300 p90 89.3, strictly under 90); peak median 3.2 / 38.1 / 57.7 / 11.7, p90 8.9 / 55.9 / 67.5 / 16.6; `rule violations: 0 OK`. Anchored: perceptual median 8.4 / 71.0 / 62.7 / 14.3, p90 16.4 / 100.2 / 67.5 / 19.6, over 90 at 300: 610 (U2 1042); peak median 8.9 / 61.8 / 58.1 / 13.1, p90 14.9 / 99.5 / 63.3 / 17.7, over 90: 508 (U2 575). Peak `above 100% of stop 500: 0` on both blocks. Perceptual anchored prints `rule violations ...: 1 (named exception: travel/37° N · November · 05:40 · MV passing Kea, en route Piraeus/primary-muted 227.26% (R76 Q2)) OK`: counted and printed by name, left out of the exit verdict only. Southern trap does not fire; no second name. Nike secondary (L* 7.8) is outside the window. Even is byte-identical; its anchored above-100 is 502, reported | In a scratch copy: the exception's name blanked exits 1 on `rule violations: 1 FAIL (e.g. ...Kea.../primary-muted (227.26%))`; a second violator (CUSP_RUN_BOUND 1.6) exits 1 on `4 (named exception: Kea...) FAIL (e.g. Corsa primary-muted 162.04%...)`. `--damp-amp 55` exits 1 (gate path 300 at 109.8 / 123.6 FAIL, peak above-100 1375 FAIL). Base gate path perceptual 300 p90 97.9 FAIL | 🟢 per R76 Q1 and Q2 and revision 8 (F1 resolved) |
| C3.3 | Probe `$T/c33.mjs` (59 s, exit 0): 15936 cases (report 5840, kit variants 16, grid 10080), both stop sets, 0 rows missing the fields. env < 1: max \|held - target\| 6.045e-8. env = 1: `held === target` on 731840 of 731840 rows; `holdTone` returns `l' === l` on 8316 of 8316. x1: 0 mismatches over 8316 points. x2 over 699968 rows: cam16 0, oklch non-anchored 0, oklch anchored 0.00000 (pass 1: 42112 rows over, max 1.00725). x3: 0 perceptual rows outside the rounding floor | Unheld stub (`holdTone` returning `l' = l`): env < 1 max 4.592, x3 puts 36862 rows outside the floor. x1 control (+0.6 per channel): 7527 mismatches. The pass 1 engine is x2's control (max 1.00725 at default Warning perceptual 150) | 🟢 (Q5 closed by revision 8) |
| C3.4 | `tonal.mjs --full` exits 0, `PASS: tonal-generation clears all [gate] predicates`. (iii c) reads 0 beyond `GRID_R2_EXCEPTIONS`: the 12 R77 Q4 quantization keys, all observed. okhsl-modes tone rose 0; cusp-pull passes; C6 (v) pinned at 0/3692, max 0.000000. `chromaEnvelope(` appears 5 times. C6 (ii) needed the re-freeze in C3.8 (F3). The C6 (v) negative control's needle moved with revision 8 (D13) | Pass 1: the unheld stub gives 28 rises beyond the list and 4 of the 12 keys unobserved; one key removed reports exactly that key. C6 (v) negative control at revision 8: the patched copy (saturation 1.6x, cap lifted) reads sample maxRatio 5.478, over the pin, so the control holds; with the saturation arm at 1.0 it reads 3.324, so the 1.6x arm moves the ratio | 🟢 per R77 Q4 |
| C3.5 | `anchor.mjs --full` exits 0. `anchor-ramp monotone: 0`, `default-kit monotone: 0` (a true 0, no list). f4: `hueSpace-perceptual-bound ... max OKLab dE 0.0000 ...; codes bound held everywhere (max 0)` and `hueSpace-peak-bound ... cap-moved stops 7364, max OKLab dE 0.0000 ...; codes bound held everywhere (max 0)`. `anchor-f4 hueSpace` (even) still moves 16 ramps, dE 0.0256. Gap 79, distinct 19, notch 15, all matched by name | Synthetic anchored rise (pass 1): `anchor-ramp monotone: 13520`, exit 1. f4's control is the pass 1 engine: codes 3 / 3 (perceptual Warning 150, peak Info 350), exit 1 | 🟢 (Q6 closed by revision 8); D8 |
| C3.6 | Mode-isolation re-captured at ba7a299e: perceptual `8ae715d202be14b2`, peak `0ac42e3c6dc6c0ef` (pass 1 5590d6df / d39b856c, U2 a874ac86 / 815dcec4). `mode-isolation-gate.mjs` at head: `perceptual 8ae715d202be14b2 peak 0ac42e3c6dc6c0ef match fixture (captured at ba7a299e..., 3780 corpus + 16 default kit, 25-stop, projectView)`. The envelope fixture is re-captured; even is byte-identical. `--compare <U2 fixture>` prints `2 cells rose`: peak 100 median 8.5306 to 8.9076, peak 300 p90 97.4215 to 99.4957, the two R76 Q1 cells; cuspRuns U2 2, head 1 | Before the re-capture the gate reds `mode-isolation: perceptual ... do not match fixture`. `--compare` against the pass 1 fixture (never landed) prints 2 other cells rising beyond 0.05 (F4) | 🟢 per R76 Q1; F4 |
| C3.7 | FLOORS re-read: 41 of 96 cells move against base; exactly the two R77 crossings (peak Success light 7.5994, perceptual Data 3 dark 4.8869), no third; `semantic.mjs` PASS. Flag probe (pass 1): row 350 #6EBC8D `capped: true`, row 50 #FFFFFF `capped: false`. Flag agreement at revision 8: peak anchored 84900 stops, flag 7364, diff 7364, 0 each way. Paired timing below: slowest-of-three ratios 0.990 tonal, 0.934 anchor, 1.115 envelope, each at most 1.2. `npm test`: exit 0, all 54 files | Flag forced true reds f4 on stops the diff never moved (pass 1: 74050, exit 1). Pins left at 7.6 / `PENDING_U4` 4.9 red as recorded at pass 1 | 🟢 |
| C3.8 | Freeze re-taken at head, each list's comment naming its movement. `RAMP_GAP_ALLOW` 72 to 79: 13 added, 6 removed; every addition is peak 50&100, 100&150 or 900&950, all 13 already gap misses at U2's head; pass 1's Bleak House, Motown, Pop-punk and Sapa are gone (peak 900&950 0.789 / 0.730 / 0.730 / 0.605). `RAMP_DISTINCT_ALLOW` 16 to 19: 6 added, 3 removed; additions at stops 50 to 125 or 825 to 900 (late-night club and UK '77, anchor L* 11.91, #121213 at peak 875&900, were 925&950 at U2); pass 1's Trulli and Black metal are unique again. `NOTCH_ALLOW` 17 to 15, unchanged from pass 1. `KNOWN_BASELINE_DUP` 22 to 30: 18 added, 10 removed; revision 8 adds perceptual\|60 800&825 (Khumbu, Rub' al Khali, L* 9.70, window-clamped) and peak\|280 875&900 (late-night club, UK '77), and drops pass 1's peak\|60 850&875, peak\|88 100&125, peak\|250 825&850, peak\|270 850&875. Every addition sits at a window-clamped source or an end stop. The anchor PASS line now reads the list lengths (was the U2 literal 72 / 16 / 17) | Before the re-freeze the same sweeps red: `gap (19-stop) allow-list: 79 (expected 83)`, `distinct ... 19 (expected 19)` by name, C6 (ii) `perceptual: 2 duplicate-hex pair(s)` and `peak: 2`, then `4 of the 34 cited baseline duplicates were not observed` | 🟢; F3 |

## Sweep timing pairs (C3.7)

Host: this Mac, the same session, `npm run -s <gate>`, 06:52 to 07:32 on 2026-09-30, with no other suite running. The order ran per sweep, rounds 1 to 3, head then base, back to back. Head is `.worktrees/ce-U3`: revision 8 on the merge ba7a299e, uncommitted, the same bytes as the commit. Base is a clone at b149f8dd, which runs the U2 engine. The load is the three `uptime` averages at the start of each run.

Every head run exits 0. Base tonal and anchor runs exit 1 on base's own lists, because R74 moved the allow-list freeze to U3 (for example `gap (19-stop) allow-list: 89 (expected 72)` and C6 (ii) `perceptual: 10 duplicate-hex pair(s)`). Base envelope runs exit 0.

| Sweep | Round | Head s | Head load | Base s | Base load |
|---|---|---|---|---|---|
| corpus-tonal | 1 | 153.37 | 4.46 4.70 4.88 | 154.10 | 4.69 4.89 4.94 |
| corpus-tonal | 2 | 216.53 | 5.00 4.95 4.95 | 163.76 | 7.29 6.37 5.57 |
| corpus-tonal | 3 | 217.36 | 6.05 6.43 5.74 | 219.49 | 5.74 6.20 5.80 |
| corpus-anchor | 1 | 191.48 | 9.01 8.79 7.04 | 183.71 | 7.23 7.70 6.89 |
| corpus-anchor | 2 | 177.32 | 5.78 6.86 6.69 | 169.90 | 6.05 6.65 6.64 |
| corpus-anchor | 3 | 164.86 | 6.03 6.42 6.55 | 205.04 | 4.91 5.69 6.21 |
| chroma-envelope | 1 | 22.26 | 5.86 5.87 6.19 | 19.96 | 5.44 5.78 6.14 |
| chroma-envelope | 2 | 19.43 | 5.39 5.73 6.12 | 19.25 | 4.60 5.52 6.03 |
| chroma-envelope | 3 | 21.63 | 4.02 5.35 5.96 | 19.18 | 4.17 5.30 5.92 |

Slowest of three, head over base, bar 1.2 on each:

- corpus-tonal: 217.36 / 219.49 = 0.990.
- corpus-anchor: 191.48 / 205.04 = 0.934.
- chroma-envelope: 22.26 / 19.96 = 1.115.

The pass 1 ratios were 1.058, 0.961 and 1.051. Round to round spread inside one side is up to 63 s (tonal head 153 to 217), larger than any head-to-base gap, and it tracks the load (tonal round 1 ran at load 4.5, rounds 2 and 3 at 5.0 to 7.3). The absolute rows stay advisory: base misses them at this load too (tonal 219 s, anchor 205 s).

## FLOORS moves (C3.7, C2.7 repeated)

Moves are head vs base ee6fadbe on `brandKit(defaultDocument())` accent on its on-colour, to 4 dp. 41 of 96 cells move (16 of them against pass 1) and even moves 0. Two cells cross their pin, both R77 Q7's declared costs, both re-pinned rounded down in FLOORS at pass 1:

- **Peak Success light:** 7.6022 to 7.5994 (7.5925 at pass 1). Pinned 7.5; its bf2aaf6 floor is 7.2.
- **Perceptual Data 3 dark:** 4.9376 to 4.8869, unchanged from pass 1. Pinned 4.8 in FLOORS and in `PENDING_U4`, per R77 Q7.

No other cell crosses its FLOORS or PENDING_U4 pin; `semantic.mjs` PASS.

| Mode | Family | Side | Base | Head | Delta |
|---|---|---|---|---|---|
| perceptual | primary | dark | 4.9787 | 5.0444 | +0.0658 |
| perceptual | secondary | dark | 5.2155 | 5.2092 | -0.0063 |
| perceptual | tertiary | light | 7.8298 | 7.8533 | +0.0234 |
| perceptual | tertiary | dark | 5.6234 | 5.6543 | +0.0309 |
| perceptual | info | light | 6.7952 | 6.7823 | -0.0129 |
| perceptual | info | dark | 4.7627 | 4.7711 | +0.0084 |
| perceptual | warning | dark | 5.6697 | 5.6419 | -0.0278 |
| perceptual | danger | light | 8.2388 | 8.2712 | +0.0323 |
| perceptual | danger | dark | 5.9428 | 5.9199 | -0.0229 |
| perceptual | data-1 | light | 6.0201 | 6.0807 | +0.0606 |
| perceptual | data-1 | dark | 4.6849 | 4.7670 | +0.0822 |
| perceptual | data-2 | light | 6.3203 | 6.3308 | +0.0105 |
| perceptual | data-2 | dark | 4.7586 | 4.7470 | -0.0116 |
| perceptual | data-3 | light | 6.1005 | 6.1470 | +0.0465 |
| perceptual | data-3 | dark | 4.9376 | 4.8869 | -0.0507 |
| perceptual | data-4 | dark | 4.7971 | 4.8226 | +0.0255 |
| perceptual | data-5 | light | 5.4524 | 5.4335 | -0.0188 |
| perceptual | data-5 | dark | 5.0616 | 5.0423 | -0.0193 |
| perceptual | data-6 | dark | 5.2838 | 5.2720 | -0.0117 |
| perceptual | data-7 | dark | 5.1565 | 5.1459 | -0.0106 |
| perceptual | data-8 | dark | 4.9924 | 5.0071 | +0.0146 |
| peak | neutral | dark | 4.6641 | 4.6518 | -0.0123 |
| peak | primary | dark | 4.7798 | 4.7826 | +0.0028 |
| peak | secondary | dark | 5.6082 | 5.6014 | -0.0068 |
| peak | tertiary | light | 8.1825 | 8.2563 | +0.0738 |
| peak | tertiary | dark | 5.3795 | 5.4085 | +0.0290 |
| peak | success | light | 7.6022 | 7.5994 | -0.0028 |
| peak | success | dark | 4.8796 | 4.8740 | -0.0056 |
| peak | warning | light | 9.6909 | 9.7846 | +0.0937 |
| peak | warning | dark | 5.2841 | 5.3122 | +0.0280 |
| peak | danger | dark | 5.6824 | 5.7191 | +0.0367 |
| peak | data-1 | light | 6.3659 | 6.4511 | +0.0852 |
| peak | data-1 | dark | 4.9949 | 5.0826 | +0.0876 |
| peak | data-2 | light | 6.6314 | 6.6471 | +0.0157 |
| peak | data-2 | dark | 4.5605 | 4.5981 | +0.0376 |
| peak | data-3 | dark | 4.7212 | 4.7512 | +0.0300 |
| peak | data-4 | dark | 5.0917 | 5.0864 | -0.0053 |
| peak | data-5 | dark | 5.3320 | 5.3796 | +0.0476 |
| peak | data-6 | dark | 5.6007 | 5.6499 | +0.0493 |
| peak | data-7 | dark | 5.4753 | 5.4640 | -0.0113 |
| peak | data-8 | dark | 5.3246 | 5.3293 | +0.0047 |

## Deviations

- **D1 d = 0.9275, not 0.919.** Ruled by R76 Q3.
  - At 0.919 to 0.9263, gate-path perceptual 300 p90 is 90.0013: 14 identical hue-86 yellows held on one 8-bit code.
  - The window is 0.9267 to 0.928.
- **D2 damp mapping.** The residue is `r^e`, not the linear `0.27 r`, with `e = ln(1 - d) / ln(0.3)` (`OKHSL_DAMP_RESIDUE_EXP`, `tonal.js:446`). At the ruled d 0.9275 (R76 Q3) the code's exponent is 2.1796; the 2.0875 in pass 1's records and the plan's C3.1 text is the same formula at the unruled d 0.919. The ruled value is d; the exponent follows from it, so 2.1796 is what ships.
  - The linear form damps at damp 0, which would break "1.0 everywhere at damp 0".
  - Both forms meet at damp 70.
- **D3 report flags.** `--damp N` and `--damp-curve N` are added to the report.
  - The damp 70 / 1.5 control is a no-op, because the corpus already runs at 70 / 1.5.
  - The U2 figures come from the base run instead.
- **D4 even at damp 0.** Even reads 0.2824 / 0.4467 at damp 0 on base too, so "1.0 at damp 0" holds for perceptual and peak only.
- **D5 env > 1 not held.** The dampAmp shoulder (1216 rows, Adia only) is outside both clauses and is not held; max \|held - target\| is 1.4270.
- **D6 test edits.** Three changes, each stated in its comment:
  - The `lift-monotonic` OKHSL bound widens to the palette's own damp 0 ramp. U2's damp 0 stop 950 already reads L\* 4.03 to 4.19, below lmin 5.
  - `skew-lift-okhsl` (i) reads at damp 0, with CAP_L_EXCEPTIONS re-measured: Data 1 and Data 2 stop 450 added, both `capped`; cam16 Secondary 550 removed.
  - A new (i b) check: 0 of 1600 rows fail at head, and the unheld stub fails 326.
- **D7 GRID_R2_EXCEPTIONS.** The 21 old keys are removed because none reproduces at head. The 12 R77 Q4 quantization keys replace them, so the list goes from 21 to 12.
- **D8 unheld stub.** The unheld stub does not bite C3.5 (monotone 0); the synthetic rise is the control that bites.
- **D9 flag agreement at U3's head, not at U2's engine.**
  - U2 has no flag, so the diff and the flag were compared on the same engine.
  - Full corpus plus the default kit, peak, both hueSpace sides: 84900 anchored stops, flag 7364, diff 7364, 0 disagreements each way.
  - With the flag forced true: flag 81514, of which 74050 the diff never moved (e.g. Barbican primary 50), exit 1.
  - U2's 7841 is a different engine's count.
- **D10 model.mjs.** One line outside the engine lane.
  - `projectView` carries `capped` so f4 can read it from the projected rows it already renders.
- **D11 re-pins.** The Panda EX-1/EX-2 literals in `exports.mjs` and the spec, and the shadcn and radix fixtures, are re-captured by script. Each carries a U3 note.
  - The spec's EX-4 table was already stale at base; it is left as found.
  - Revision 8 moves the EX-2 `primary.hover` base to `oklch(0.3962 0.1205 259.03)` (was `oklch(0.3951 0.1194 258.53)`), re-pinned in `exports.mjs:536` and the spec; shadcn and radix render `cam16` and do not move.
- **D12 citations.** Two reactivity-review `tonal.js:1003` citations are repointed to `:1024` (`okhslLAt` moved); `citations.mjs` is STALE 0.

- **D13 C6 (v) negative-control needle (revision 8).** The control patched `const s = Math.min(1, Math.max(0, intendedS * env));`, the line revision 8 removed. At pass 1 that `s` fed only the per-stop hue solve, so the 1.6x arm no longer reached the emitted saturation once the hold emitted `hold.s`. The needle now patches `holdTone(hue, intendedS, l, env)` to `env * 1.6`, the emitted saturation. Measured: sample maxRatio 5.478 at 1.6x, 3.324 at 1.0x (cap lifted in both).
- **D14 anchor PASS line.** `anchor.mjs`'s FULL summary printed the U2 literals `gap-19 (72), distinct-25 (16) and notch (17 ...)`; it now reads the four lists' lengths.

## Findings

- **F1 resolved (revision 8).** The report exits 0 with Kea carried by name (C3.2).
- **F2 resolved (revision 8).** All three sweeps are ruled by the paired ratio, absolute rows advisory (C3.7).
- **F3 C6 (ii) moved outside the re-diagnosis's predicted shape.** The plan predicted "plus 2 perceptual pairs at stops 800 to 825". Measured: that key (2 pairs) plus peak\|280 875&900 (2 pairs, late-night club and UK '77), and 4 pass 1 peak keys no longer observed. All are end-stop 8-bit collisions; the list is frozen to what the head measures (C3.8). Gap also moved 83 to 79 with 4 members gone, not 1.
- **F4 two anchored 900 medians against the pass 1 fixture.** `--compare` against the pass 1 fixture (never landed) prints perceptual 900 median 14.2138 to 14.3252 and peak 900 median 13.0056 to 13.0579; the re-diagnosis predicted "under 0.02 points". Against U2, the ratchet C3.6 names, both sit far below (23.95 and 21.92) and only the two R76 Q1 cells rise.

## Questions (`.sdlc/questions/chroma-envelope-U3.md`)

- **Q1 to Q3:** ruled by R76 (`.sdlc/questions/chroma-envelope-U3-conflicts.md`): the two peak cells are a declared cost, Kea is a named exception, d is 0.9275.
- **Q4 and Q7:** ruled by R77 (`.sdlc/questions/chroma-envelope-U3-conflicts-2.md`): the 12 quantization keys are listed; both FLOORS crossings are declared costs, Data 3 dark at 4.8 in `PENDING_U4`.
- **Q5 and Q6:** closed by revision 8 (`.sdlc/plans/chroma-envelope-U3-rediagnosis.md`, ranked by R78): x2 anchored 0.00000, f4 codes 0 and dE 0.0000. The damped-s and basis-s solves are both gone.

## Review fixes (reviewer-l3 PASS at 31bba1e6, `.sdlc/reviews/chroma-envelope-U3-review.md`)

Comments and records only; no engine, bound, list or fixture change. Re-run on the touched files: `semantic.mjs`, `tonal.mjs`, `anchor.mjs` (sampled), `citations.mjs`, `em-dash.mjs`, `branding.mjs`, all exit 0.

- Finding 1: `anchor.mjs` f4 comment now names the flag measurement actually taken, U3 head, 84900 stops, flag 7364, diff 7364 (was "U2's engine, 7841").
- Finding 2: D9 typo 7464 corrected to 7364.
- Finding 3: `tonal.mjs` KNOWN_BASELINE_DUP comment says 30 keys (was 32).
- Finding 4: D2, C3.1 and the question doc state the code's exponent 2.1796 at the ruled d 0.9275; 2.0875 was d 0.919. The plan's C3.1 text is the planner's to repair.
- Finding 5: `semantic.mjs` Data 3 and Success `// measured` comments read the head values (6.14 / 4.88, 7.59 / 4.87) and name the R77 Q7 re-pin.
- Finding 6 (note, no criterion): Kea's name carries no magnitude ceiling; left as ruled by R76 Q2.

## Gates

| Gate | Evidence | Control | State |
|---|---|---|---|
| `npm test` | exit 0, `✓ all 54 test files passed`, real 97.60 s at load 4.4 to 5.0, run in W after the timing pairs finished. The tree after it holds only this pass's edits plus the regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js`, both committed | pass 1 at 67cc0cde read 1/54 on `anchor.mjs` f4 (Q6), the red revision 8 clears | 🟢 |
| `npm run build` | in the throwaway clone at unit/ce-U3 plus this pass's diff: exit 0, `wrote figma/plugin/ui.html 4158.8 KB` (pass 1 4158.0), clone diff byte-identical to W's after the build. Baseline row updated | in the row | 🟢 |
| em-dash, branding, citations | all clean in `npm test` | the planted U+2014 control that U2's verdict ran, not re-run | 🟢 |
