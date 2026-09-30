# Handoff chroma-envelope U2 · builder → orchestrator (stopped for re-diagnosis)

| Field | Value |
|---|---|
| Branch | unit/ce-U2 @ ec496bd0 (off `plan/chroma-envelope` at 81043f2e; this handoff commit sits on top) |
| Status | 🔴 stopped: the construction as planned reds C6 (ii) and four `anchor.mjs` gates the plan predicted green. Not landable. Needs a plan revision, not more code in this unit |
| Files | `src/engine/tonal.js`, `test/engine/tonal.mjs`, this handoff |
| Not run | C2.5, C2.6, C2.7, C2.8 (no fixture re-capture, no `tonal-legacy.json`, no exports): capturing fixtures over a red construction would freeze the regressions |

## What is built

- `anchorChromaBasis(stop, anchorStop, lift, anchorValue, groupValue, climb = false)`: target `min(group, anchor)`. The even path passes `climb = true` and is unchanged.
- `capChromaAtHeldTone(hue, s, l, rgb, chroma, ceiling, hueCam16, strictSeed = false)`: the peak joint cap, moved out of `okhslStops` with `solveLForTone` and `refineNearestRgb`. `okhslStopsAnchored` calls it for peak at dampAmp 0, with ceiling = stop 500's emitted chroma.
- `refineNearestRgb` `strictSeed`: an over-ceiling input is never the incumbent. Anchored path only. Witness: Vaporwave secondary, stop 650, the `hctToRgb` fallback asked 28.63 and rendered 29.17 against a 29.13 ceiling, and the polish kept it. With it the stop reads 29.0157 and the report's peak above-100 is 0. Applied to both paths it moved non-anchored peak pixels (peak/cam16 hue 70 skew 100 lift 40 stop 350), so it is scoped.
- Non-anchored identity: 0 of 6912 grid ramps differ from base (3 modes x 2 hue spaces x 24 hues x 4 chroma x 3 skew x 2 lift x 2 vibrancy, 25 stops).

## C2 rows

| Id | Evidence | Control | State |
|---|---|---|---|
| C2.1 | `node -e` probe, g 0.98: every stop `0.300`; g 0.20: 0.200 rising to 0.300 at 500 and back | base, stop 100, g 0.98: 0.957 (plan says ~0.98) | 🟢 |
| C2.2 | `node scripts/report-preset-fidelity.mjs --envelope` exit 1. perceptual median 9.8 / 74.2 / 65.8 / 24.0, p90 23.1 / 106.7 / 70.8 / 29.0, cusp-run violations 2. peak median 8.5 / 64.4 / 61.1 / 21.9, p90 17.3 / 97.4 / 66.4 / 27.1, above100 0. Even unchanged (502) | not run yet | 🟡 see Deviations 2 |
| C2.3 | C6 (v) 15 / 3764, max 2.023757x (base 3119 / 15.132599). Pins set to the measured values; ratio-arm control retargeted | not run in isolation | 🔴 see Findings 1 |
| C2.4 | `tonal.mjs --full` exit 1 (C6 ii). `anchor.mjs --full` exit 1: gap 89 (72), distinct 31 (16), notch 15 (17), f4 hueSpace-peak-bound 0.0184, achromatic-anchor. `monotoneOk` 0 holds, (iii c) and okhsl-modes pass | not run | 🔴 see Findings 2 to 4 |
| C2.5 to C2.8 | not run | | ⏸ |

## Findings (for the plan revision)

1. **C6 (v) cannot reach 0.** All 15 are near-grey anchors (stop 500 CAM16 chroma 1.4 to 2.145) whose stop 50 renders #FFFFFF. CAM16 chroma of #FFFFFF is 2.869: the neutral floor at L\* 100 (greys read 2.48 at L\* 80, 1.83 at 50). No pixel at that tone sits under the ceiling, so it is not an `hctToRgb` residue. All 15 were in the base 3119. Witness: travel San Telmo secondary #343331, x2.0238.
2. **C6 (ii) duplicate hex: 37 new keys, 8 cited keys gone** (base 24 physical hits, head 66). Nearly all are 25-stop near-black pairs on dark anchors (#252215, #1E211E, #101820, #1A1B1E), plus near-white ones. One is on the 19-stop display set: peak Nike tertiary-muted #FFFFFF, stops 50 and 100 both #FFFFFF. Mechanism: the chroma the anchored ramp used to overshoot with is what kept adjacent low-tone stops distinct. With it capped, adjacent stops round to the same 8-bit hex. Full list: `$CLAUDE_JOB_DIR/tmp/u2/dup-head.txt` against `dup-base.txt`.
3. **anchor gap, distinct and notch allow-lists move** (89 / 31 / 15 against 72 / 16 / 17), the same collapse at the extremes. These lists are exact on FULL; re-freezing them is a ruling, not a builder call.
4. **achromatic-anchor: 21 of 30 cells now fall under CAM16 C 5** (want at most 3). That is R69 working as designed: a grey anchor's own `s` now caps the ramp, so the ramp stays grey. The gate assumes chromatic neighbours, so it and R69 disagree.
5. **f4 hueSpace-peak-bound: 30 ramps clear 0.01 OKLab dE, max 0.0184** (Jekyll and Hyde tertiary #54392E, stop 400: cam16 #886C58, oklch #8B6A62). The shared cap renders through `hctToRgb` and the hue-blind 8-bit polish, which #681 accepted for the non-anchored path. On the anchored path it turns a rounding-level pre-cap hueSpace difference into a visible hue move. Bounding it needs a hue term in the polish, which #681 already declined as a second workaround.

## Deviations

1. C2.1's base control reads 0.957, not ~0.98.
2. C2.2: perceptual cusp runs 2, not 0 (Studio 54 secondary #2B2734, Kea primary-muted #E1F5DA 226%, both base violators). Capping OKHSL `s` does not bound CAM16 chroma near the lightness extremes, and perceptual has no chroma cap by ruling. Peak 300 p90 97.4 still FAILs (the plan predicted all peak cells OK). Perceptual 100 p90 23.1 now passes (the plan expected it to stay open for U3).

## Left out

C2.5 to C2.8, all of U3 and U4. The C6 (v) pins in `test/engine/tonal.mjs` hold the measured 15 / 2.023757 only so the ratchet reads the current state. The retargeted ratio-arm control (1.6x plus `capPeak = false`) has not been proven to bite yet.
