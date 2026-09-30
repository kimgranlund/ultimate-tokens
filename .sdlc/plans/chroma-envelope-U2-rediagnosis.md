---
plan: chroma-envelope
unit: U2 (re-diagnosis, pass 1 stopped 🔴 at 322c1953, re-dispatched as ce-U2-planner-r2)
ticket: "#725"
base: 81043f2e (plan/chroma-envelope)
head: 0052bef1 (unit/ce-U2)
date: 2026-09-29
seat: planner (read-only; no source edited; every probe ran in a throwaway clone of the unit worktree under the job's tmp dir, `scratch/` never committed)
---

# chroma-envelope U2 re-diagnosis: the stop-300 p90 is a lightness effect the cap cannot reach, the 15 overshoots are the white pixel, and the tone hold restores no distinctness

## Method

| Item | Value |
|---|---|
| Clone | `git clone -q --no-hardlinks .worktrees/ce-U2 $CLAUDE_JOB_DIR/tmp/ce-U2-rd`, then `git fetch && git reset --hard origin/unit/ce-U2` (0052bef1). `diff <(sed 's#../src/engine/#./#g' scratch/tonal-head.js) src/engine/tonal.js` prints nothing, so the scratch engine copies are the tree modulo import paths |
| Engine variants (`scratch/tonal-*.js`, imports rewritten to `../src/engine/`) | `base` (81043f2e), `head` (0052bef1), `capoff` (head with `capPeak = false`), `climb` (head with the `min` reverted), `hold` (head plus U3's tone hold in `preCap`: `targetL = lstarFromRgb(okhslToRgb(hue, intendedS, l)); l = solveLForTone(hue, s, targetL)` when `env < 1`), `nopolish` (head with the anchored cap's `refineNearestRgb` skipped), `absenv` (hold plus a CAM16 cap at `env(stop) * c500` in BOTH OKHSL modes, the "absolute envelope") |
| READING (a) probe | `node scratch/probe.mjs <engine> [--damp 92 --curve 1.585] [--overshoot] [--dups]`: the report's own `loadEnvelopeInstances()` loop (n 2920 per mode), the C6 (v) violator list, and duplicate-hex pairs per mode on 19 and 25 stops. `--damp/--curve` override the document constants, which is U3's retune |
| Excess locator | `node scratch/ratio300.mjs <engine> [--damp 92 --curve 1.585]`: every instance's stop-300 ratio, bucketed by anchor CAM16 chroma, anchor L* and lift, next to the same instance rendered with its anchor omitted (the gate path) |
| Ramp witness | `node scratch/witness.mjs <A> <B> "<preset>" <palette> <mode> 19`: two engines side by side, per stop hex, L*, CAM16 C and hue, ratio to stop 500, and the neutral grey's CAM16 C at that L* |
| Heavy suites | one at a time, the variant copied over `src/engine/tonal.js` in the clone and restored with `git checkout` after: `node test/engine/anchor.mjs --full` on `nopolish` (`scratch/anchor-nopolish.txt`) and on `capoff` (`scratch/anchor-capoff.txt`) |

## Question 1: root cause of each red row

| Row | Handoff figure | Root cause (measured) | Evidence |
|---|---|---|---|
| C2.2 perceptual 300 p90 106.7, peak 300 p90 97.4 (bar 90) | cap + `min` | A third mechanism the plan does not name. OKHSL `s` is gamut-relative: at a fixed `s`, CAM16 chroma scales with the gamut's width at that lightness. 1811 of 2853 anchored instances have an anchor L* in [35, 50) and 271 below 35, so stop 500 sits well below the hue's cusp lightness while stop 300 (L* 51 to 70) sits on it. The stop-300 chroma then exceeds stop 500's at an `s` 21 percent lower. The ratio measures the L* ladder, not the envelope. The plan's prediction ("the cap alone brings the rendered path to the gate-path row") assumed the anchored instance behaves like its own gate-path twin; the gate path pivots stop 500 at the hue's own key, so the twin has no such climb | `ratio300.mjs tonal-hold.js --damp 92 --curve 1.585`: perceptual anchored p90 100.2, the same instances on the gate path p90 well below the bar; by anchor L*: [0,20) p90 147.7 (15 of 15 over 90), [20,35) 113.8 (153 of 256), [35,50) 100.2 (406 of 1811), [50,65) 80.0 (23 of 415), [65,80) 61.4 (0 of 316), [80,101) 57.7 (0 of 40). Peak: [0,20) 97.6, [20,35) 99.1, [35,50) 99.6, [50,65) 73.8, [65,80) 53.8. Excluding anchored c500 < 10 moves the p90 by 0.0 (100.2 / 99.6), so it is not a small-denominator artifact. Lift: 2850 of 2853 anchored instances have lift 0, so lift is not a factor. Witness `witness.mjs tonal-head.js tonal-hold.js Nike secondary perceptual 19`: anchor #101820 (L* 10.3, C 11.0) renders stop 350 #506478 at L* 41.5, C 19.8, 180 percent of stop 500, at `s` = 0.72 x basis |
| C2.2 peak 300 p90 sits at 97.4 (99.6 under the retune) | the cap | Same mechanism seen from under the cap: peak stops that would climb are bisected to `ceiling - CAP_MARGIN` and land at 99.8 to 99.9 percent of stop 500. With 379 of the 1811 mid-dark anchors capped, the p90 IS the cap ceiling; no constant moves it | `ratio300.mjs` peak worst rows: #473428 (L* 23.5, C 12.1) stop 300 C 12.07, ratio 99.9, gate path 37.9; #005C90 (L* 37.2, C 42.8) 99.8, gate path 54.7 |
| C2.2 perceptual cusp runs 2, not 0 | cap + `min` | The same mechanism at the two anchors farthest from their hue's cusp lightness: Studio 54 secondary #2B2734 (L* 16.6, C 11.7) climbs to 137 percent at stop 350 (L* 44.9); Kea primary-muted #E1F5DA (L* 94.5, C 16.8) climbs to 226 percent at stop 600 (L* 76.0). Under the retune the pair is Southern trap tertiary-muted #26222F (141 percent) and Kea (227 percent) | `witness.mjs tonal-head.js tonal-absenv.js "Studio 54" secondary perceptual 19` and `... "passing Kea" primary-muted ...`; `probe.mjs tonal-hold.js --damp 92 --curve 1.585` clause line |
| C2.3 C6 (v) 15 / 2.023757 (pin asks 0 / 1.0) | cap | The HCT white-pixel artifact, not a cap residue: CAM16 under HCT's viewing conditions reads #FFFFFF at chroma 2.869 (hue 209.5) and the grey axis falls smoothly below it (#F0F0F0 2.766, #787878 1.83, #000000 0). Every one of the 15 violators has c500 below 2.869 (1.418 to 2.145) and its worst stop is stop 50 = #FFFFFF (`lmax` 100 renders pure white; `okhslLAt(100)`). The cap's target `ceiling - 0.5` is at or below 1.6 there, a chroma no pixel near white can reach: `#FFFBFA` (L* 98.89) is the least-chroma pixel in the 250 to 255 cube at C 0.288, so it is a floor on the white PIXEL, not on tone; a floor-aware pin or an `lmax` below 100 removes it, a re-bisection does not | `scratch/neutral.mjs`; `probe.mjs tonal-head.js --overshoot` prints 15 rows, all `worst stop 50 #FFFFFF C 2.869`; under the tone hold the list is 10 rows, same shape; under `absenv` 72 rows, all 72 with c500 < 2.869 and `worst stop 50 #FFFFFF` |
| C2.4 C6 (ii) 37 new duplicate-hex keys, 8 cited keys gone; anchor gap 89 (72), distinct 31 (16) | `min` (perceptual and peak) and cap (peak) | Both changes lower `s` at the near-black and near-white ends of window-clamped ramps (stops 800 to 950 at L* 5 to 7, stops 50 to 150 at L* 91 to 100), where chroma was the only thing keeping adjacent 8-bit hexes apart; a 25-stop half step at L* 6 is under one code. The tone hold does not restore it (it targets the pre-envelope L* at the SAME capped basis, so the near-black `s` is unchanged) and the retune lowers `s` further | `probe.mjs <engine> --dups` pairs (perceptual / peak): base 3 / 8, head 10 / 43, retune only 6 / 41, hold 19 / 48, hold + retune 9 / 52, absenv 22 / 61, absenv + retune 31 / 76. `anchor.mjs --full` on `capoff`: gap 78, distinct 27, notch 15 (the `min`'s share); head 89 / 31 / 15 (the cap's share on top) |
| C2.4 achromatic-anchor 21 of 30 cells skipped (want at most 3) | `min` | By design under R69: a grey anchor's own `s` is now the basis, so the ramp stays grey and 21 cells fall under CAM16 C 5. The gate (#739) asserts hue fidelity on stops that R69 makes achromatic; it is a gate premise conflict, unchanged by any variant | `anchor.mjs --full` on `nopolish` and `capoff`: 21 of 30 in both |
| C2.4 f4 hueSpace-peak-bound max 0.0184 OKLab dE (bound 0.01) | cap | The shared cap renders through `hctToRgb` at a re-solved CAM16 hue and then polishes hue-blind over plus or minus 2 codes; a rounding-level hueSpace difference at the input becomes a code difference at the output. Skipping the polish on the anchored path halves it (0.0105) but does not clear it, and costs 82 more C6 (v) violators (the polish is what lands under the ceiling after 8-bit rounding), so the residual is the cap itself, not the polish alone | `anchor.mjs --full` on `nopolish`: `anchor-f4 hueSpace-peak-bound ... max OKLab dE 0.0105 ... worst The Night of the Hunter primary stop 200`; `probe.mjs tonal-nopolish.js --overshoot`: 97 / 3764 |
| C2.7 FLOORS peak Tertiary LIGHT 8.18 < 8.2 | `min` | The pin is the measured value rounded (8.2782 measured, pinned 8.2); the frozen floor `FLOORS_BF2AAF6` 7.1 holds with 0 drops. A ratchet pin two decimals wide reds on the first perceptual move by construction | `test/engine/semantic.mjs:282` (`["Tertiary", 8.2, 5.2], // measured 8.2782`); handoff C2.7 |

## The variant matrix

READING (a) cells are perceptual then peak, `median / p90` at stops 100 / 300 / 700 / 900; bars 25 / 35, 75 / 90, 75 / 90, 25 / 35. Clauses are perceptual cusp runs / peak above-100. Dups are duplicate-hex pairs perceptual / peak over both stop sets. `probe.mjs` unless noted.

| Engine | perceptual median | perceptual p90 | peak median | peak p90 | Clauses | Cells red | Dups | C6 (v) |
|---|---|---|---|---|---|---|---|---|
| base 81043f2e | 17.4 / 94.0 / 74.5 / 31.7 | 35.1 / 146.2 / 119.3 / 66.5 | 11.7 / 84.0 / 68.8 / 29.4 | 23.6 / 137.7 / 111.1 / 62.1 | 446 / 2592 | 11 | 3 / 8 | 3119 / 15.13 |
| climb (only the `min` reverted) | as base | as base | as base | 23.6 / 99.0 / 95.8 / 62.1 | 446 / 0 | 9 | | |
| capoff (`min` kept, cap off) | 9.8 / 74.2 / 65.8 / 24.0 | 23.1 / 106.7 / 70.8 / 29.0 | 8.5 / 64.4 / 61.1 / 21.9 | 17.3 / 108.0 / 66.4 / 27.1 | 2 / 2349 | 2 | | |
| head 0052bef1 (U2 as built) | 9.8 / 74.2 / 65.8 / 24.0 | 23.1 / 106.7 / 70.8 / 29.0 | 8.5 / 64.4 / 61.1 / 21.9 | 17.3 / 97.4 / 66.4 / 27.1 | 2 / 0 | 2 | 10 / 43 | 15 / 2.02 |
| head + retune 92 / 1.585 | 8.5 / 71.0 / 62.9 / 14.8 | 16.8 / 101.5 / 67.3 / 19.7 | 9.0 / 61.8 / 58.1 / 13.5 | 15.4 / 99.6 / 63.4 / 17.8 | 1 / 0 | 2 | 6 / 41 | |
| hold (U3's tone hold, shipped constants) | 9.9 / 74.6 / 65.8 / 23.9 | 21.7 / 106.7 / 71.1 / 29.0 | 8.8 / 64.9 / 61.1 / 22.0 | 17.1 / 97.3 / 66.9 / 27.1 | 2 / 0 | 2 | 19 / 48 | 10 / 2.02 |
| hold + retune (U3 as planned) | 8.9 / 71.0 / 63.0 / 14.6 | 16.7 / 100.2 / 67.7 / 19.6 | 9.1 / 61.9 / 58.1 / 13.5 | 15.6 / 99.6 / 63.7 / 18.9 | 2 / 0 | 2 | 9 / 52 | |
| absenv (hold + CAM16 cap at `env * c500`, both modes) | 9.9 / 74.6 / 65.8 / 23.9 | 21.7 / 77.4 / 70.3 / 29.0 | 8.8 / 64.9 / 61.1 / 22.0 | 17.1 / 78.5 / 66.9 / 27.1 | 0 / 0 | 0 | 22 / 61 | 72 / 2.02 |
| absenv + retune | 8.9 / 71.0 / 63.0 / 14.5 | 16.3 / 73.0 / 67.2 / 19.6 | 9.1 / 61.9 / 58.1 / 13.5 | 15.2 / 74.0 / 63.5 / 18.9 | 0 / 0 | 0 | 31 / 76 | |

Anchor verifier rows (`node test/engine/anchor.mjs --full` in the clone; head figures from the handoff):

| Engine | monotone | gap (72) | distinct (16) | notch (17) | f4 hueSpace peak dE (0.01) | achromatic skipped (3) |
|---|---|---|---|---|---|---|
| head | 0 | 89 | 31 | 15 | 0.0184 | 21 of 30 |
| nopolish | 0 | 79 | 27 | 15 | 0.0105 | 21 of 30 |
| capoff (`min` only) | 0 | 78 | 27 | 15 | 0.0050 (pass) | 21 of 30 |

So the `min` alone moves gap 72 to 78, distinct 16 to 27 and notch 17 to 15, and the cap adds gap 78 to 89, distinct 27 to 31 and the whole f4 red (0.0050 to 0.0184); the achromatic red is the `min` alone.

Reading the matrix:

1. The cap does exactly what U2 claimed for the peak above-100 clause (2349 to 0) and nothing for the p90 cells (capoff and head print the same perceptual line; the peak p90 moves 108.0 to 97.4, the cap ceiling).
2. The retune moves every median inside its bar and leaves the two 300 p90 cells red at 101.5 / 99.6 (100.2 / 99.6 with the hold). U3 as planned cannot clear C3.2.
3. The tone hold moves READING (a) by at most 0.4 in any cell, adds duplicate-hex pairs (10 / 43 to 19 / 48), and leaves the C6 (v) list's shape unchanged. It does not restore the distinctness the cap removes; it was never a chroma construction.
4. Only the absolute envelope clears every cell, and it does so by turning dark-anchored ramps grey above the pivot: Nike secondary #101820 stop 300 goes from #687D91 (C 19.7, hue 245) to #747C7F (C 7.5, hue 219, 4 C above the neutral grey at that L*); Sapa secondary #042546 stop 300 from #4382C5 (C 46.8) to #6B819B (C 22.6). At least 1037 perceptual and 574 peak instances (the stop-300 above-90 counts under the hold) would be capped that way. Dups rise to 31 / 76 under the retune.

## Question 2: does U2's premise hold, and should U2 and U3 be reordered or merged

| Premise (plan revision 4) | Verdict | Measured |
|---|---|---|
| "The cap alone brings the rendered path to the gate-path row (one miss, perceptual 300)" | 🔴 false | head prints 106.7 / 97.4 at 300 p90 against the gate-path row's 97.9 / 41.1; the anchored instances rendered on the gate path give a p90 far below the bar in both modes (`ratio300.mjs`), so the gap is the anchored L* ladder, mechanism 3, not the basis climb the cap removes |
| "Cap plus retune is the last row: every cell inside its bar" | 🔴 false | hold + retune 100.2 / 99.6 at 300 p90 |
| "The tone hold composes with the cap and the retune" (U3 after U2) | 🟡 holds as a tone construction, irrelevant to the reds | the hold moves cells by at most 0.4 and adds dup pairs; its purpose (the (iii c) uptick) is a U3 concern this re-diagnosis did not re-measure |
| "Every ratchet cell falls or holds at each unit" (the U2-before-U3 ordering argument) | 🟢 holds | head against base: every cell fell; `--compare` printed `0 cells rose` (handoff C2.6) |
| C2.3's "0 by construction" | 🔴 false as written | the white pixel at `lmax` 100 is above every c500 below 2.869; 15 today, 10 under the hold, 72 under the absolute envelope |

Reordering U2 and U3 changes nothing: the retune is a constant and the excess is structural (the same 597 perceptual instances are over 90 at any `damp` the bars admit, because their stop 300 sits on the cusp and their stop 500 does not). Merging them changes nothing for the same reason. The choice is between a construction that makes the anchored ratio equal the envelope by force (the absolute envelope, measured above) and a re-rule of what READING (a) measures on the anchored path. The C2.4 allow-lists move under every variant, so they are frozen once, after whichever construction lands, not per unit.

## Question 3: options, with the measured consequence of each

| Option | What changes | READING (a) | Clauses | Dups (perc / peak) | Look of dark-anchored ramps | Owner ruling needed |
|---|---|---|---|---|---|---|
| A. Re-rule the anchored READING (a): the p90 bars apply to instances whose anchor L* is within the ramp window of the hue's cusp, or (simpler) READING (a) cells are measured with the anchor omitted (the gate path, which is what the plan's predictions already were) and the anchored path is gated by its clause counts, C6 (v) with a floor-aware pin, and the ratchet fixture | criterion text only; U2's engine stands; U3 keeps the retune and the hold | gate path: 5.8 / 75.0 / 59.6 / 14.4 and 11.0 / 90.0 / 64.7 / 18.1 at 91 (plan's row), lower at 92; anchored cells reported, not barred | perceptual 2 to be ruled (both are mechanism 3 at the L* extremes; the report could exempt anchors outside [RAMP_L_MIN, RAMP_L_MAX] from the run count as it exempts ADIA) / peak 0 | 10 / 43 today; 9 / 52 after U3 | unchanged from head (Nike stop 300 #687D91) | yes: the issue's acceptance second branch, "targets re-ruled by the owner with the measured figures" |
| B. Absolute envelope on the anchored path: both OKHSL modes cap each stop's CAM16 chroma at `env(stop) * c500` at held tone (the peak cap generalized; `absenv` above) | engine, M to L: the cap fires on 1000-plus perceptual instances; mode-isolation and the envelope fixture re-captured; the allow-lists re-frozen; a distinctness pass or a re-freeze for the dups | every cell green at the shipped constants and at the retune | 0 / 0 | 22 / 61; 31 / 76 with the retune (base 3 / 8) | grey above the pivot for every anchor below its cusp: Nike stop 300 C 19.7 to 7.5, Sapa 46.8 to 22.6; the light half of a dark navy becomes a warm grey | yes: this reverses the rendered look of most of the corpus, a bigger change than R69's text describes |
| C. Re-freeze only (keep head, re-pin C6 (v) to 15 / 2.03, re-freeze the three allow-lists, `KNOWN_BASELINE_DUP` and FLOORS, re-rule the achromatic gate) and leave C2.2 to U3 | pins and lists only | unchanged: U3 then reds at 100.2 / 99.6 | 2 / 0 | 10 / 43 | unchanged | yes, and it defers the C2.2 decision one unit with no new information, so it is A with a delay |

Recommended: A, with the engine hunk of U2 kept as is (the `min` and the peak cap both do what they were asked and no cell rose), because B is the only construction that makes the literal true and it is measured to grey the light half of every dark-anchored ramp, which no one asked for and which the corpus fixtures would have to be re-captured to accept. Under A, the remaining U2 work is criterion repair plus the one-time freeze of the lists; U3 keeps the retune and the hold with its own C3.2 rewritten the same way.

## Question 4: the criterion text each option implies

Common to A and B (the rows that are wrong independent of the construction):

- C2.3, replace: "`PEAK_VIOLATOR_PIN` re-pinned to 0 and `PEAK_MAX_RATIO_PIN` to `<= 1.000000`" with "`measureAnchoredOvershoot` excludes an anchored palette whose stop-500 chroma is below `WHITE_PIXEL_C` = 2.869 (the CAM16 chroma of #FFFFFF under HCT's viewing conditions, a floor on the white pixel at `lmax` 100, not on tone; the constant is named and derived in a comment beside the pins) and prints the excluded count; with that exclusion the C6 (v) lines print `0/3749` and `max <= 1.000000` (the 15 excluded anchors listed in the handoff: every one c500 in [1.418, 2.145] and its worst stop 50 = #FFFFFF); a violator with c500 >= 2.869 is a finding, not a re-pin. Control: the exclusion set to 0 prints 15 / 2.023757."
- C2.4 achromatic-anchor, add: "the #739 gate's 30-cell bound is re-scoped: under R69 an achromatic anchor's ramp is achromatic by construction in perceptual and peak, so the gate asserts hue fidelity on even mode's 10 cells (all rendered, at most 1 skipped) and asserts `CAM16 C < 5` on every perceptual and peak cell of the 5 anchors (the R69 property itself, 20 cells); the negative control (`#808082`) stands."
- C2.4 f4, replace the 0.01 bound for peak with: "`HUE_SPACE_DELTA_E_BOUND_PEAK_CAPPED` = 0.02 on stops the anchored cap moved (`capChromaAtHeldTone` fired; the row carries `capped: true`), 0.01 elsewhere; the handoff names the worst capped stop and its two hexes (today Jekyll and Hyde tertiary #54392E stop 400, cam16 #886C58 against oklch #8B6A62, 0.0184)."
- C2.4 lists, replace "exit 0" with: "`RAMP_GAP_ALLOW`, `RAMP_DISTINCT_ALLOW`, `NOTCH_ALLOW` and `KNOWN_BASELINE_DUP` re-frozen ONCE in the unit that lands the last chroma-moving hunk of this plan (U3 under A), each with the movement declared in the handoff (gap 72 to N, distinct 16 to N, notch 17 to N, C6 (ii) plus N minus M keys) and every added member at a window-clamped source (L* < 9.95 or > 95.05) or at stops 50 to 150 / 800 to 950; a member elsewhere is 🔴; `monotoneOk` a true 0 stays."
- C2.7, replace: "0 cells below the frozen floor" stays; add "the 96-cell `FLOORS` pins are re-read from the measured values rounded DOWN to one decimal (Tertiary light 8.2 to 8.1, measured 8.18), the movement declared; the frozen floor `FLOORS_BF2AAF6` is not touched."

Option A, C2.2 and C3.2:

- C2.2 becomes: "`node scripts/report-preset-fidelity.mjs --envelope` prints, per OKHSL mode, READING (a) twice: `gate path` (anchor omitted, today's `--gate-path` set) and `anchored` (today's rendered set). The bars apply to the gate-path cells; the anchored cells are reported with their p90 and the count of instances over 90 at stop 300, and are ratcheted by the U1 fixture (no cell rises). Clause lines: `above 100% of stop 500: 0` (peak, anchored); `cusp-run rule violations` counts only anchors with L* inside [RAMP_L_MIN, RAMP_L_MAX] and prints the excluded anchors by name (today 2: Studio 54 secondary #2B2734 at L* 16.6 is inside the window, so it stays a violation until U3's retune or is ruled; Kea primary-muted #E1F5DA at L* 94.5 is inside too). Exit 1 while any barred cell is red." (Measured at head: gate path 9.5 / 79.9 / 62.6 / 22.6 and 17.4 / 97.9 / 66.5 / 26.3 perceptual, all peak OK; two cells red for U3.)
- C3.2 becomes: "every gate-path perceptual and peak cell within its bar with perceptual 300 p90 < 90.0 strictly (prediction 11.0 / 90.0 at 91, lower at 92); anchored p90 at 300 reported and `<=` U2's (100.2 / 99.6 measured with the hold and the retune); clause lines 0 / 0 or the two named anchors ruled; READING (b) as today."
- Add to the plan's diagnosis section, as mechanism 3, the paragraph and the L* bucket table under Question 1 above, and strike "the cap alone brings the rendered path to the gate-path row" from "What the counterfactuals show".

Option B, C2.2 and C3.2:

- C2.2 becomes: "in both OKHSL modes `okhslStopsAnchored` caps each stop's CAM16 chroma at `chromaEnvelope(stop) * c500` at held tone (`capChromaAtHeldTone`, ceiling per stop); `--envelope` prints every perceptual and peak median and p90 cell within its bar at the shipped constants (measured on the scratch construction: 9.9 / 74.6 / 65.8 / 23.9, 21.7 / 77.4 / 70.3 / 29.0; 8.8 / 64.9 / 61.1 / 22.0, 17.1 / 78.5 / 66.9 / 27.1), clause lines 0 / 0, exit 0 on READING (a) with READING (b) still red for U3; the identity control declares the perceptual and peak movement (expected above 1000 palettes per mode); `dup-hex` pairs (a new `--dups` read in the report) 22 / 61 declared, with the distinctness rule for the lists above."
- C3.2 keeps its text with the retune figures replaced by the measured 8.9 / 71.0 / 63.0 / 14.5 and 16.3 / 73.0 / 67.2 / 19.6 (perceptual), 9.1 / 61.9 / 58.1 / 13.5 and 15.2 / 74.0 / 63.5 / 18.9 (peak), dups 31 / 76.
- Add a ramp witness criterion the owner rules on before B is built: "Nike secondary #101820 stop 300 renders within OKLab dE 0.05 of #747C7F and Sapa secondary #042546 stop 300 within 0.05 of #6B819B", so the look is ruled, not discovered at the verdict.

## Files the next pass touches

| Path | Why |
|---|---|
| `.sdlc/plans/chroma-envelope.md` | revision 5: mechanism 3, the corrected counterfactual table (this file's variant matrix), C2.2 / C2.3 / C2.4 / C2.7 / C3.2 rewritten per the option ruled |
| `.sdlc/questions/chroma-envelope-scope.md` | the A-or-B ruling (the acceptance's second branch), with the Nike and Sapa witnesses |
| `scripts/report-preset-fidelity.mjs`, `scripts/lib/envelope-measure.mjs`, `test/engine/chroma-envelope-gate.mjs` | A: the gate-path and anchored READING (a) blocks, the window-scoped cusp-run count, `--dups` |
| `test/engine/tonal.mjs` (`measureAnchoredOvershoot` :1807, pins :1837, `KNOWN_BASELINE_DUP` :1280) | the white-pixel exclusion, the pins, the one-time dup freeze |
| `test/engine/anchor.mjs` (:462 to :530 lists, :640 to :760, :1310 f4 bound, :1469 to :1506 achromatic) | the re-scoped achromatic gate, the capped-stop f4 bound, the one-time list freeze |
| `test/engine/semantic.mjs:282` | the rounded-down pin |
| `src/engine/tonal.js` | B only: the per-stop ceiling in `okhslStopsAnchored` (:1294 to :1304 today) |

## Commands run (in order)

```
node scratch/probe.mjs ./tonal-head.js --damp 92 --curve 1.585
node scratch/probe.mjs ./tonal-base.js ; ./tonal-capoff.js ; ./tonal-climb.js
node scratch/probe.mjs ./tonal-hold.js --overshoot
node scratch/probe.mjs ./tonal-hold.js --damp 92 --curve 1.585
node scratch/probe.mjs ./tonal-nopolish.js --overshoot
node scratch/probe.mjs <hold | hold+retune | head+retune | head | base> --dups
node scratch/ratio300.mjs ./tonal-hold.js --damp 92 --curve 1.585
node scratch/probe.mjs ./tonal-absenv.js --dups --overshoot ; the same --damp 92 --curve 1.585
node scratch/witness.mjs ./tonal-head.js ./tonal-hold.js Nike secondary perceptual 19
node scratch/witness.mjs ./tonal-hold.js ./tonal-absenv.js Nike secondary perceptual 19 ; Sapa secondary
node scratch/witness.mjs ./tonal-head.js ./tonal-absenv.js "Studio 54" secondary perceptual 19 ; "passing Kea" primary-muted
sed 's#../src/engine/#./#g' scratch/tonal-nopolish.js > src/engine/tonal.js && node test/engine/anchor.mjs --full ; git checkout -- src/engine/tonal.js
sed 's#../src/engine/#./#g' scratch/tonal-capoff.js > src/engine/tonal.js && node test/engine/anchor.mjs --full ; git checkout -- src/engine/tonal.js
```
