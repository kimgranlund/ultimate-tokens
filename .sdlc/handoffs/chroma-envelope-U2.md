# Handoff chroma-envelope U2 · builder → orchestrator (stopped for re-diagnosis)

| Field | Value |
|---|---|
| Branch | unit/ce-U2 @ ec496bd0 (off `plan/chroma-envelope` at 81043f2e; this handoff commit sits on top) |
| Status | 🔴 stopped: the construction as planned reds C6 (ii) and four `anchor.mjs` gates the plan predicted green. Not landable. Needs a plan revision, not more code in this unit |
| Files | `src/engine/tonal.js`, `test/engine/tonal.mjs`, this handoff |
| Not committed | C2.5 to C2.8 were measured read-only (fixtures captured to scratch, `tonal-legacy.json` regenerated and found unchanged). No fixture, FLOORS or export is committed: committing baselines over a red construction would freeze the regressions. Waiting on the orchestrator's answer to the stop report |

## What is built

- `anchorChromaBasis(stop, anchorStop, lift, anchorValue, groupValue, climb = false)`: target `min(group, anchor)`. The even path passes `climb = true` and is unchanged.
- `capChromaAtHeldTone(hue, s, l, rgb, chroma, ceiling, hueCam16, strictSeed = false)`: the peak joint cap, moved out of `okhslStops` with `solveLForTone` and `refineNearestRgb`. `okhslStopsAnchored` calls it for peak at dampAmp 0, with ceiling = stop 500's emitted chroma.
- `refineNearestRgb` `strictSeed`: an over-ceiling input is never the incumbent. Anchored path only. Witness: Vaporwave secondary, stop 650, the `hctToRgb` fallback asked 28.63 and rendered 29.17 against a 29.13 ceiling, and the polish kept it. With it the stop reads 29.0157 and the report's peak above-100 is 0. Applied to both paths it moved non-anchored peak pixels (peak/cam16 hue 70 skew 100 lift 40 stop 350), so it is scoped.
- Non-anchored identity: 0 of 6912 grid ramps differ from base (3 modes x 2 hue spaces x 24 hues x 4 chroma x 3 skew x 2 lift x 2 vibrancy, 25 stops).

## C2 rows

| Id | Evidence | Control | State |
|---|---|---|---|
| C2.1 | `node -e` probe, g 0.98: every stop `0.300`; g 0.20: 0.200 rising to 0.300 at 500 and back | base, stop 100, g 0.98: 0.957 (plan says ~0.98) | 🟢 |
| C2.2 | `node scripts/report-preset-fidelity.mjs --envelope` exit 1. perceptual median 9.8 / 74.2 / 65.8 / 24.0, p90 23.1 / 106.7 / 70.8 / 29.0, cusp-run violations 2. peak median 8.5 / 64.4 / 61.1 / 21.9, p90 17.3 / 97.4 / 66.4 / 27.1, above100 0. Even unchanged (502) | scratch clone of the head with only the `min` reverted (`const target = groupValue;`): perceptual cusp runs `446` (base's value, every perceptual cell back to C1.2), peak above100 `0`, not 2592: the joint cap alone clears the peak count | 🔴 two literal misses, see Deviations 2 |
| C2.3 | `node test/engine/tonal.mjs --full` C6 (v) line: `15/3764`, max `2.023757x` (base 3119 / 15.132599). Pins set to the measured values | the in-file ratio arm's 1.6x patch alone, under the cap, reads 15 / 2.0238 over the corpus (does not bite), so the patch also sets `capPeak = false`: 3378 violators, max 5.5605x, above the pin | 🔴 see Findings 1 |
| C2.4 | `tonal.mjs --full` exit 1 (C6 ii). `anchor.mjs --full` exit 1: gap 89 (72), distinct 31 (16), notch 15 (17), f4 hueSpace-peak-bound 0.0184, achromatic-anchor. `monotoneOk` 0 holds, (iii c) and okhsl-modes pass | not run | 🔴 see Findings 2 to 4 |
| C2.5 | `node scripts/report-preset-fidelity.mjs --identity-control --base afd415c0`: the six lines all `0/3780` or `0/16`, `0 differing cells` (the default strips anchors, so it is blind to this unit). With `--authored`: `identity perceptual: 3023/3780 palettes, 67892/94500 cells differ, max dL* 1.1380`; `identity peak: 3378/3780 palettes, 67796/94500 cells differ, max dL* 1.0240`; `identity even: 0/3780 palettes, 0/94500 cells differ`; default kit perceptual `16/16, 202/400, max dL* 0.4053`, peak `16/16, 189/400, max dL* 0.4274`, even `0/16, 0/400` | mode-isolation fixture not re-captured (the gate would red on the old hashes) | ⏸ measured, not committed |
| C2.6 | `chroma-envelope-gate.mjs --capture --fixture <scratch>` then `--compare test/engine/fixtures/chroma-envelope.json --fixture <scratch>`: `0 cells rose`, perceptual and peak `moved against base`, even `byte-identical to base` | U1's `--compare` raised-cell control stands | ⏸ measured green, not committed |
| C2.7 | `node test/engine/semantic.mjs` exit 1: `checkFloors` against `FLOORS_BF2AAF6` passes (`0 unlisted drops, 0 further erosion`), but the pinned 96-cell `FLOORS` reds `peak Tertiary LIGHT: accent #7F0FAC on #FFFFFF = 8.18:1, below its pinned floor 8.2:1` (frozen floor 7.1). `gate:corpus-contrast` PASS, worst 4.500:1. `gen-tonal-fixture.mjs`: `tonal-legacy.json` byte-unchanged | not run | 🟡 FLOORS re-read would move peak Tertiary light 8.2 to 8.1; not done while stopped |
| C2.8 | not run: `npm test` would red on C6 (ii), the anchor gates and FLOORS | | ⏸ |

## Findings (for the plan revision)

1. **C6 (v) cannot reach 0.** All 15 are near-grey anchors whose stop 50 renders #FFFFFF at tone 100.00.
   - White-floor arithmetic: CAM16 chroma of a neutral grey is not 0 under the engine's viewing conditions. Measured: #FFFFFF 2.869 (L\* 100), #FEFEFE 2.862, #F0F0F0 2.766 (L\* 94.8), #C8C8C8 2.478 (L\* 80.6), #787878 1.825 (L\* 50.4), #3C3C3C 1.223, #1E1E1E 0.851. The least-chroma pixel at tone 100 is white itself, 2.869. Every one of the 15 has a stop 500 chroma under that (max 2.145), so the ratio 2.869 / c500 is above 1 whatever `s` is. The bisection drives `s` to 0 and the fallback cannot go lower; it is not an `hctToRgb` residue.
   - Provenance: all 15 are in the base 3119, at far higher ratios.

   | Palette | Anchor | c500 | Head stop 50 | Head ratio | Base worst |
   |---|---|---|---|---|---|
   | Boston City Hall tertiary-muted | #2F2E2B | 2.145 | 2.869 | x1.3377 | stop 250, 22.351, x10.4210 |
   | Andalusian patio secondary | #DFDEDC | 1.988 | 2.869 | x1.4431 | stop 750, 17.857, x8.9817 |
   | Trulli of Alberobello secondary | #E0DEDC | 1.452 | 2.869 | x1.9753 | stop 750, 18.767, x12.9206 |
   | Villa Savoye secondary | #DFDEDC | 1.988 | 2.869 | x1.4431 | stop 750, 17.857, x8.9817 |
   | Double Indemnity tertiary-muted | #3A3835 | 2.016 | 2.869 | x1.4228 | stop 250, 20.993, x10.4106 |
   | The Third Man secondary-muted | #252422 | 1.498 | 2.869 | x1.9153 | stop 250, 22.132, x14.7746 |
   | 34° S San Telmo secondary | #343331 | 1.418 | 2.869 | x2.0238 | stop 250, 21.453, x15.1326 (the old pin's witness) |
   | 37° N Patmos tertiary-muted | #232220 | 1.512 | 2.869 | x1.8973 | stop 250, 22.168, x14.6598 |
   | 34° N corridor tertiary-muted | #A2A19E | 2.010 | 2.869 | x1.4275 | stop 750, 15.731, x7.8271 |
   | 26° N shrine tertiary-muted | #BCBBB8 | 2.090 | 2.869 | x1.3731 | stop 750, 16.937, x8.1058 |
   | 30° N Wadi Rum primary | #1E1D1B | 1.552 | 2.869 | x1.8490 | stop 250, 22.240, x14.3324 |
   | 30° N Atchafalaya secondary-muted | #82817E | 1.950 | 2.869 | x1.4714 | stop 250, 16.581, x8.5037 |
   | 55° N Kamchatka tertiary-muted | #ABAAA7 | 2.035 | 2.869 | x1.4100 | stop 750, 16.112, x7.9182 |
   | 26° N Okinawa secondary-muted | #4C4B48 | 1.996 | 2.869 | x1.4373 | stop 250, 20.770, x10.4052 |
   | 38° N Point Reyes tertiary-muted | #64625F | 1.752 | 2.869 | x1.6371 | stop 250, 17.404, x9.9310 |
2. **C6 (ii) duplicate hex: 37 new keys, 8 cited keys gone** (base 24 physical hits, head 66). Nearly all are 25-stop near-black pairs on dark anchors (#252215, #1E211E, #101820, #1A1B1E), plus near-white ones. One is on the 19-stop display set: peak Nike tertiary-muted #FFFFFF, stops 50 and 100 both #FFFFFF. Mechanism: the chroma the anchored ramp used to overshoot with is what kept adjacent low-tone stops distinct. With it capped, adjacent stops round to the same 8-bit hex. Full list: `$CLAUDE_JOB_DIR/tmp/u2/dup-head.txt` against `dup-base.txt`.
3. **anchor gap, distinct and notch allow-lists move** (89 / 31 / 15 against 72 / 16 / 17), the same collapse at the extremes. These lists are exact on FULL; re-freezing them is a ruling, not a builder call.
4. **achromatic-anchor: 21 of 30 cells now fall under CAM16 C 5** (want at most 3). That is R69 working as designed: a grey anchor's own `s` now caps the ramp, so the ramp stays grey. The gate assumes chromatic neighbours, so it and R69 disagree.
5. **f4 hueSpace-peak-bound: 30 ramps clear 0.01 OKLab dE, max 0.0184** (Jekyll and Hyde tertiary #54392E, stop 400: cam16 #886C58, oklch #8B6A62). The shared cap renders through `hctToRgb` and the hue-blind 8-bit polish, which #681 accepted for the non-anchored path. On the anchored path it turns a rounding-level pre-cap hueSpace difference into a visible hue move. Bounding it needs a hue term in the polish, which #681 already declined as a second workaround.

## Deviations

1. C2.1's base control reads 0.957, not ~0.98.
2. C2.2: perceptual cusp runs 2, not 0: music Studio 54 secondary #2B2734 (2 runs) and travel 37° N MV passing Kea primary-muted #E1F5DA (226.02%), both in the base 446 (base 316% and 256%). The control prints 446 / 0, not 446 / 2592. Capping OKHSL `s` does not bound CAM16 chroma near the lightness extremes, and perceptual has no chroma cap by ruling. Peak 300 p90 97.4 still FAILs (the plan predicted all peak cells OK). Perceptual 100 p90 23.1 now passes (the plan expected it to stay open for U3).
3. `tonal-legacy.json` does not move (C2.7 expected perceptual rows to move): its 16 palettes render on a path this unit leaves byte-identical.
4. C2.5's `--identity-control` without `--authored` strips anchors, so its six lines read 0 for this unit; the declared movement is the `--authored` run.

## Left out

Committing the C2.5 to C2.7 baselines (mode-isolation, chroma-envelope, FLOORS) and the exports, and C2.8, pending the ruling. All of U3 and U4. The C6 (v) pins in `test/engine/tonal.mjs` hold the measured 15 / 2.023757.
