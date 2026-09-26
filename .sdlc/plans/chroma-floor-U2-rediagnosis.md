# U2 re-diagnosis: the clamped-anchor floor boundary (#701)

| Field | Value |
|---|---|
| Plan | `.sdlc/plans/chroma-floor.md`, revision 14 (this record is its evidence) |
| Trigger | U2 review pass 1 FAIL (`.sdlc/verdicts/chroma-floor-U2-review.md`, finding 1, 🔴): `tonal.js:797-803` `floorRef = clamped ? Infinity : maxc500` is a cliff at the tone-window edge |
| Unit head read | `unit/cf-U2` @ b5d8ffd7 (code fe65e640, handoff 0427d587, review b5d8ffd7); base `plan/chroma-floor` @ a24547fe; `<base>` 282fca8d |
| Measured in | a `git clone --shared` of `unit/cf-U2` at `/private/tmp/claude-501/cf-U2-rediag` (patched copies of `tonal.js` loaded as data URLs; source untouched); scripts `rediag.mjs`, `patch.mjs`, `valleys.mjs`, `summ.mjs`, outputs `F/<candidate>.json`. Removed at the end of this pass |
| Host | 1-minute load 73 to 218 on 10 cores; no timing here is a figure of record |
| Date | 2026-09-26 |
| Seat | planner (re-diagnosis), read-only on source |

## Next action

| Who | What |
|---|---|
| Orchestrator | dispatch U2 pass 2 on `unit/cf-U2` against revision 14: replace the carve-out with the first-step reference below (one rule, both call sites, no `clamped ?` branch), retarget the two negative controls, repair the adapter `sweeps` row, add the kit ratios and the probe table to the handoff, reword the guarantee |
| Owner | nothing. The rule change stays inside U2's scope under R54 (no new scope), U2's stop rule is not triggered (both targets hold), and no criterion yields. One rendering the owner may want to see is named under "What still moves" |

## Root cause

The even path renders `chroma(s) = min(maxc(s), max(D(s), F(s)))`: `D = intended * env` (the damped value, 1 at the anchor and falling outward) and `F` the floor. The pre-#701 floor was `F = chromaFloor% * maxc(s)`, the local gamut ceiling. On the side of the anchor where the gamut widens (toward the hue's cusp tone) `F` rises outward while `D` falls, the two cross, and `max(D, F)` has a V at the crossing. That V is the 450/400 dip class (24 off-anchor rendered dips at U1's head, 0 on the gate path, where stop 500 sits near the cusp and `F` has nowhere to rise).

U2 capped the reference: `F = chromaFloor% * min(maxc(s), maxc500)`. With the cap `F` is flat on the widening side and follows `maxc` down on the narrowing side, so it is non-increasing outward and `max` of two non-increasing curves has no interior minimum. Correct as far as it goes, and it does retire the 24.

The drain comes from using the anchor stop's own ceiling as the *level* of the floor over the whole ramp. Near white and black `maxc500` is a few C (13.5 for `#E8EEFA` at L* 93.97 on hue 250, 0 for `#FFFFFF`), so the far half of the ramp, the dark half of a pale anchor, gets 40% of the *anchor's* gamut instead of 40% of *its own*, which is 4 to 10 times wider there. That far half is exactly the damping-starved end the floor exists for. So: the anchor stop's ceiling is the right quantity to bound the V (the V's bottom can never sit below the anchor's own floor, `chromaFloor% * maxc500`), but it is the wrong quantity to cap the floor's level everywhere. The dip mechanism needs the floor not to rise past the damped value *where the damped value is still high*, which is only the first step out; beyond that, the floor may sit higher without opening a V, because the V has already bottomed.

The carve-out (`clamped ? Infinity`) then masks the drain for the 10 corpus anchors outside the window and leaves it for every anchor inside. The reviewer's cliff is that mask: 1.1 L* apart, `#E8EEFA` (in window) reads 5.4 C at stops 750 to 950 and `#ECF1FC` (clamped) reads 22.3. Without the carve-out `#739`'s achromatic-anchor gate reads 8 of 30 cells skipped under C 5 (bound 3), because a white or black anchor's ramp then has no floor at all. That is the "second workaround": a threshold branch whose only job is to hold a gate the level cap broke.

## The rule

`floorRef = max(maxc500, maxc(seedHue, tone(450)), maxc(seedHue, tone(550)))`: the floor's reference is the gamut ceiling at the anchor's own tone or at its first display step on either side, whichever is larger. Same `evenChroma` line as U2 (`floorC = min(chromaFloor% * min(maxc, floorRef), intended)`), both call sites, no `clamped ?` branch.

| Site | Reference |
|---|---|
| `paletteStopsAnchored` (`chromaAt`) | `Math.max(maxc500, maxChromaInGamut(seedHue, t(450)), maxChromaInGamut(seedHue, t(550)))` with `t(s) = anchorLerp(pivotTone, lmax, lmin, s, skew, lift, curve, tension)`, the same tone the ramp renders at those stops (computed once per ramp, before the stops map) |
| `paletteStops` (non-anchored, the gate path) | `Math.max(maxc500, maxChromaInGamut(baseHue, toneAt(450, skew, lift, ctl)), maxChromaInGamut(baseHue, toneAt(550, skew, lift, ctl)))`; the stop-500 seed for the hue solve is unchanged (at stop 500 `min(maxc500, ref) = maxc500` for any `ref >= maxc500`) |

Why it is dip-free (the same assumption U2 made: `D` non-increasing outward, exact when `intended` is constant along the ramp). The first stop out is 450 or 550 in both stop sets (`EXTRA_STOPS` are 75/125/175/825/875/925, all at the ends). At that stop `F(450) = chromaFloor% * maxc(450)` (the cap equals its own ceiling there). One stop further, `chroma(400) <= max(D(400), chromaFloor% * min(maxc(400), maxc(450))) <= max(D(450), F(450)) = chroma(450)`, so no dip can bottom at 450. From 450 outward the reference is fixed and `F` is `chromaFloor% * min(maxc, ref)`, non-increasing exactly as U2's proof, so no interior minimum forms past it. The floor is allowed to cross the damped value at the first step only, where a crossing cannot register as a dip.

Why it is continuous: `maxChromaInGamut` is continuous in tone, `anchorLerp`'s pivot clamp is continuous in the anchor's L*, and `max` of continuous functions is continuous. No branch on `clamped`.

Why #739 holds without a special case: `#FFFFFF`'s pivot is at L* 95.05, its first dark step renders near L* 86 where hue 250 carries about 35 C, so the floor on its dark side is about 14 C (the gate reads 14.03 at stop 700, was 14.52 under the carve-out, 4.37 without it). `#000000` is the mirror. The only even cell under C 5 is `#FFFFFF|300` (4.41), the white anchor's own nearest light stop, identical in every variant; total skipped stays 3 of 30, at the bound, as at U2.

## Measured

Every candidate is a one-line patch on U2's `tonal.js`. `rendered` = the corpus + default kit with each palette's anchor, `gate` = the same without it, both stop sets, `dampAmp` 0 documents (3,780 palettes, 3,396 anchored). Drain = even 25-stop rendered cells of anchored palettes (84,900) compared with the pre-#701 floor; "big" = a cell losing more than 8 C and more than half its chroma (the reviewer's measure).

| Candidate | dips rendered off-anchor / at 500 / gate | C5 gate path 100 · 300 · 700 · 900 (median / p90) | #739 skipped (bound 3) | cells moved vs pre-#701 / vs U2 | big cells / anchors hit (10-15 · 15-30 · 70-88 · 88-95 · clamped) | local minima ≥ 0.5 / ≥ 2 / ≥ 3 C, deepest |
|---|---|---|---|---|---|---|
| pre-#701 floor (U1 head) | 24 / 32 / 0 | 10.9/16.2 · 39.1/52.2 · 39.0/44.6 · 16.3/16.5 | 3 | 0 / 8,342 | 0 | 1,318 / 115 / 24, 6.49 (Hanoi tertiary 450) |
| U2 as shipped (carve-out) | 0 / 32 / 0 | 10.9/16.2 · 39.1/44.6 · 39.0/44.6 · 16.3/16.5 | 3 | 8,342 / 0 | 215 / 96 (17 of 46 · 58 of 211 · 19 of 428 · 2 of 17 · 0 of 10) | 149 / 5 / 0, 2.38 (ONCF primary-muted 400) |
| U2 without the carve-out | 0 / 32 / 0 | same as U2 | **8** (even 6: `#FFFFFF`, `#000000`, `#010101` at 300 and 700 all under 5) | | | |
| release by the anchor's excess over its own floor, width 3 C | 0 (probes) | | **4** (`#FFFFFF` C 2.87 sits inside the release width; 300 and 700 read 4.4) | | drains `#E8EEFA` and `#ECF1FC` alike (excess 4.9 C, past the width) | |
| **first-step reference (proposed)** | **0 / 32 / 0** | **10.9/16.2 · 39.1/44.6 · 39.0/44.6 · 16.3/16.5** (identical to U2 at one decimal) | **3** (worst hue 4.1°, bound 12) | **6,595 / 8,017** | **16 / 6 (4 of 46 · 1 of 211 · 0 · 0 · 1 of 10)** | **175 / 5 / 0, 2.38 (the same ONCF cell: the damped curve's own)** |
| rate-limited floor, rise ≤ 2.5 C per step | 0 / 32 / 0 | 10.9/16.2 · 39.1/52.2 · 39.0/44.6 · 16.3/16.5 | 3 (worst hue 6.4°) | 973 / 8,329 | 4 / 1 (the one clamped-light anchor) | 1,348 / 120 / 0, 2.78 (kit Warning 400) |

The rendered-path cells (reported, not barred, Q2): first-step reference even 300 `47.1 / 100.3`, 900 `22.9 / 52.0`, `above 100% of stop 500` 502 + 16 Adia (U2 46.3 / 94.1 and 374 + 16; `<base>` 48.4 / 113.7 and 670 + 16).

The reviewer's four anchors (hue 250, chroma 50, `DEFAULT_CONTROLS`, even, 19 stops, CAM16 C from the rendered hex), far side of the anchor:

| Anchor | L* | C | maxc500 | pre-#701 at 700 / 750 / 800 (or 300 / 400 / 450) | U2 | first-step reference |
|---|---|---|---|---|---|---|
| `#E8EEFA` (in window) | 93.97 | 10.3 | 13.5 | 19.3 / 21.5 / 18.3 | 5.6 / 5.6 / 5.7 | 14.1 / 13.9 / 13.8 |
| `#ECF1FC` (clamped) | 95.06 | 9.5 | 11.4 | 19.1 / 22.4 / 19.1 | 19.1 / 22.4 / 19.1 | 13.8 / 13.4 / 13.2 |
| `#1C2030` (in window) | 12.57 | 15.0 | 41.7 | 18.2 / 24.6 / 19.6 | 17.0 / 17.0 / 16.7 | 18.2 / 22.9 / 19.6 |
| `#161A28` (clamped) | 9.50 | 13.7 | 36.2 | 16.5 / 24.3 / 19.8 | 16.5 / 24.3 / 19.8 | 16.5 / 20.8 / 19.8 |

The window edges, hue 250 anchors generated at 90% of the local ceiling ("sat") and at C 6 ("pale"), largest loss vs the pre-#701 floor at the five far-side stops:

| Anchor L* | 9.55 | 9.99 | 10.05 | 10.99 | | 94.95 | 95.13 | 95.2 | 96.08 |
|---|---|---|---|---|---|---|---|---|---|
| U2, sat / pale | 0 / 0 | 13.5 / 10.8 | 13.2 / 10.8 | 12.0 / 10.4 | | 14.4 / 16.7 | 0 / 0 | 0 / 0 | 0 / 0 |
| first-step reference, sat / pale | 8.8 / 6.8 | 9.5 / 7.1 | 8.8 / 7.1 | 8.4 / 6.8 | | 6.4 / 7.4 | 4.5 / 6.2 | 4.5 / 8.7 | 8.1 / 12.3 |

U2 jumps by 13.5 (dark edge) and 14.4 (light edge) across 0.5 L*; the proposal moves by at most 1.9 across either edge, and its residual loss is the same 40%-of-the-first-step level on both sides of each edge.

## Rejected alternatives, and why

| Alternative | Result | Why not |
|---|---|---|
| drop the carve-out (`floorRef = maxc500` always) | 0 dips both paths; #739 8 of 30 skipped | a white or black anchor's ramp has no floor (stop 700 of `#FFFFFF` 4.4 C, a grey ramp for a hue-250 chroma-50 palette). That is the product defect #739 exists to prevent, not only a gate figure |
| release the cap as the anchor's excess over its own floor falls under the dip depth (`λ = clamp(1 - (C_a - floor500) / 3)`) | continuous; 0 dips by the bound argument; #739 4 of 30 | `#FFFFFF` measures C 2.87 in CAM16 (not 0), so the white anchor is still capped; and any pale anchor whose chroma exceeds its own floor by 3 C (`#E8EEFA`, 4.9) stays fully drained. Removes the cliff by draining both sides of it |
| a floor level cap above the anchor's ceiling by a constant, a window, or a fraction of the peak (`max(maxc500, X)`) | not measured on the corpus | for a saturated anchor with `maxc500 < X` the floor rises from `chromaFloor% * maxc500` to `chromaFloor% * X` while `D` falls; that is the pre-#701 V again, only one or two stops further out. Any level above the anchor's ceiling that applies from the first step on reopens the mechanism; the first-step reference is the largest level that does not, which is why it is the proposal and not a tuning |
| rate-limit the floor's rise (`floorC = min(cf * min(maxc, maxc500) + 2.5 C per 50-stop step, cf * maxc, intended)`) | 0 dips both paths, #739 3, only 973 cells moved vs pre-#701 | the 24 dips are not retired, they are shaved to under the 3 C predicate: 1,348 local minima of at least 0.5 C and 120 of at least 2 C remain, against the pre-#701 floor's 1,318 and 115 (U2 and the proposal: 149 to 175 and 5, the damped curve's own). A rule tuned to the gate's threshold, not to the mechanism; it also gives back the rendered-path 300 p90 (113.7) and above-anchor count (662) the plan reported U2 as lowering |

## What still moves

The proposal keeps U2's design for in-window dark anchors on their light side: the reference is the first step's ceiling, so a dark saturated anchor's tints stay less saturated than under the pre-#701 floor (Tongass secondary 175: 42.1 to 18.7, U2 gave 15.0). The 16 big-loss cells are 6 anchors: Night of the Hunter tertiary (150 to 250, 35.0 to 14.4), Tongass secondary (150 to 250, 42.1 to 18.7), Hidaka coast tertiary-muted (150 to 200, 26.2 to 12.2), Acid house tertiary-muted 175, Wadi Rum primary 200, and the corpus's one clamped-light anchor, Nike tertiary-muted (`#FFFFFF`; 650 to 750, 36.5 to 13.9 at 700), which the carve-out had left on the pre-#701 floor. The reviewer's ratios read 4 of 55 anchors below L* 15 (was 17) and 0 of 18 above L* 88 (was 2).

## What U2 pass 2 carries (revision 14)

| Item | Change |
|---|---|
| `src/engine/tonal.js` | the two `floorRef` definitions above; the `clamped ? Infinity` line and its comment go; `evenChroma`'s signature and floor line stay as U2 wrote them, so C3's and C4's patch target string is unchanged |
| C3 negative controls | (1) the pre-#701 floor at 1x (drop `floorRef`), reads 24 rendered off-anchor at U1's head; (2) the same at 1.6x, 381 rendered. The plan's earlier "shipped floor at 1.6x" is vacuous by construction (`min(maxc, floorRef)` is non-increasing outward at any scale: 0 at 1.6x and 3x on both paths) and is retired |
| C4 in-script control | the pre-#701 floor at 1.6x on the gate path reads 120 (not the plan's 155: U1's shoulder is in) |
| C13 (new) | the boundary probe and the drain bound, verifier-checkable from a named scratch script |
| `.sdlc/adapter.md:36` `sweeps` row | seven rows, `355 to 475 s` (`86+79+67+57+20+20+26 to 116+100+86+83+23+34+33`), "CI runs the seven as a matrix" |
| Blast radius | the default-kit even ratios per family before and after, which U2 pass 1's handoff omitted |
| Wording | `tonal.js:320-329` and `foundations.md:131-137`: the guarantee holds when the damped value is non-increasing outward (constant `intended`); with `relChroma` or the anchored basis blend it is a gated measurement, 0 on both paths, not a structural claim |
| Fixture and FLOORS | `tonal-legacy.json`'s even cells re-pin to the new rule (U2 pass 1 re-pinned 37); C8's comparator may read a different set than "unmoved by U2": re-pin upward, name any downward move, AA is the floor |
| 15% line | the U1 + U2 cumulative count falls from 14.07%: the proposal moves fewer even cells than U2 (6,595 vs 8,342 anchored 25-stop cells against the pre-#701 floor) |
