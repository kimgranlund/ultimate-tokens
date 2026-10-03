# floorref-hue U2 re-diagnosis (pass 2, #766)

Unit/fh-U2 at `0a5482a8` (code head `d77e5b74`, "pass 1"), merge-base `8428280e` ("base"). Review pass 1 FAIL: `.sdlc/reviews/floorref-hue-U2-review.md` (on the unit branch), findings F1 to F7. Every figure below was measured by this seat on scratch trees (`git archive` of base and pass 1, plus pass 1 copies with one candidate rule patched into `src/engine/tonal.js` by unique string replacement), under `$CLAUDE_JOB_DIR/tmp/fh/`. Nothing in `.worktrees/fh-U2` or the root checkout was run or edited.

Bottom line: the reviewer's cause is right, and it is wider than F1 says. A floor reference that follows edge rotation (`hueShift`) cannot keep the dip guarantee in either direction: one that rises with the rotated hue opens valleys (pass 1), and one capped so it can only fall (the reviewer's running minimum, and a plain cap) opens new notches and moves stops up to 23.52 C. The rule that keeps the guarantee reads the reference at each stop's own hue BEFORE edge rotation. That keeps the per-stop part of #766 that moves the curated corpus (the anchored OKLCH per-stop hue solve, every one of the 3,870 rendered movers) and drops the part that follows the rotation (the 6 Adia gate cells). The issue's literal "each stop's rendered hue" is therefore not fully kept, so the owner question `.sdlc/questions/floorref-hue-U2-rule.md` is written, with this rule as the recommendation.

## 1. Measured cause

Repro (oklch, hue 115, chroma 60, `hueShift` -60, default-kit controls: curve logistic, tension 0, lmin 5, lmax 100, damp 80, dampCurve 1.5, chromaFloor 40, relChroma false, `toneMode` even, no anchor, `STOPS`): pass 1 renders stop 400 at 26.79 C between 350 at 29.89 and 450 at 35.19, a dip. Base holds a flat 22.73 from 200 to 400 (stop 400 `#97A77D` base, `#95A876` pass 1).

Mechanism, from an instrumented copy of pass 1 that logs every stop's inputs to `evenChroma`:

| Stop | Rendered hue | maxc | Damped | Pass 1 R | Pass 1 floor 0.4 x min(maxc, R) | Base floor (R0 56.81) | Pass 1 render | Base render |
|---|---|---|---|---|---|---|---|---|
| 200 | 156.47 | 77.12 | 8.55 | 59.68 | 23.87 | 22.73 | 23.87 | 22.73 |
| 250 | 149.80 | 85.46 | 11.06 | 67.93 | 27.17 | 22.73 | 27.17 | 22.73 |
| 300 | 143.14 | 97.45 | 13.90 | 81.04 | 32.42 | 22.73 | 32.42 | 22.73 |
| 350 | 136.47 | 85.35 | 17.24 | 74.72 | 29.89 | 22.73 | 29.89 | 22.73 |
| 400 | 129.80 | 71.91 | 21.36 | 66.99 | 26.79 | 22.73 | 26.79 (dip) | 22.73 |
| 450 | 123.14 | 61.18 | 35.19 | 61.18 | 24.47 | 22.73 | 35.19 | 35.19 |
| 500 | 116.47 | 52.44 | 46.49 | 56.81 | 20.98 | 20.98 | 46.49 | 46.49 |
| 600 | 103.14 | 39.28 | 21.36 | 51.33 | 15.71 | 15.71 | 21.36 | 21.36 |

Base reads one R0 = 56.81 at hue 116.47 (pivot tones 52.50 / 59.40 / 45.60). Pass 1 reads R at each stop's rotated hue; on the light side the rotation walks the hue toward green, where the mid-tone ceilings are larger, so R climbs from 66.99 at 400 to 81.04 at 300 and then falls. The floor follows it up outward (26.79, 29.89, 32.42) while the damped value falls from 35.19 at 450 to 21.36 at 400, and the two meet in a valley at 400: the #701 dip shape, re-created by the reference instead of by maxc. On the dark side maxc falls under R (39.28 against 51.33 at 600), so min(maxc, R) is maxc and the two rules give the same floor there.

Why this is structural, not a tuning slip: `evenChroma`'s header states the guarantee as "at 450/550 the cap equals that stop's own ceiling, so from there outward the floor never rises". That needs the floor's level to be constant (or non-increasing) along the ramp. Under rotation the reference is R(h(stop)) with h moving monotonically outward, and R(h) is not monotone in hue (the gamut ridge), so a rotation-following R rises wherever the walk heads toward a wider hue.

The reviewer's suggested fix (a running minimum of R from the pivot outward) was measured too, and it fails the other way. Base already carries sub-3 C notches where one floor-bound stop sits between two stops that are not floor-bound; any rule that lowers the floor there deepens the notch. Measured case (non-anchored, oklch, hue 9.64, chroma 99.84, skew 52.08, relChroma true, chromaFloor 67, `hueShift` -38, hueSameDir true, stops 550/600/650): base 37.41 / 34.90 / 37.41 (a 2.51 C notch, under the 3 C predicate), cap and running minimum 37.41 / 33.75 / 37.41 (3.66 C, a dip). So following the rotation either way changes the floor against neighbours that do not change with it.

Pass 1's other drift, the anchored OKLCH per-stop hue solve, is not the cause: at `hueShift` 0 the solved hue sits a few degrees from `seedHue`, every curated anchored palette renders with 0 dips under it (C2.4 on pass 1), and the rule below keeps it unchanged.

## 2. Candidates

| Id | Rule (the hue R is read at) | Code shape |
|---|---|---|
| Base | R0, one per ramp, at `seedHue` (anchored) or `baseHue` | two `const floorRef` |
| Pass 1 | each stop's rendered hue, rotation included | `floorRefAt(h, ...)` in `chromaAt`, `floorRefAt(hue, ...)` in `paletteStops` |
| G (recommended) | each stop's own hue BEFORE edge rotation: the per-stop solved CAM16 hue (anchored, oklch), `seedHue` (anchored, cam16), `baseHue` (non-anchored) | `chromaAt = (h, hRef = h)`, final `chromaAt(hue, resolvedHue)`; `floorRefAt(baseHue, ...)` |
| CAP | min(R0, R(rendered hue)) | R0 hoisted, min inside both call sites |
| RMD | running min of R(rendered hue) over the requested stops, pivot outward | anchored path restructured into an outward walk; non-anchored a per-stop Map |
| RMG | running min of R over a fixed 25-stop rotation walk to the stop (stop-set independent) | per-stop inner walk |
| BND | follow the rotation only up to a bound in degrees | not built: the bound is a tuning constant (R78), and the grid has no safe value to fit (pass 1 is clean at 10 and 20 and dips from 30, on this corpus only) |

Suites (all even, dampAmp 0, both stop sets, dip = an interior stop at least 3 C below both neighbours, anchored suites skip stop 500 per the owner's Q3; seeded mulberry32, seed 766). Shifts are 0, ±10, ±20, ±30, ±45, ±60 unless stated:

- na-grid: non-anchored, default-kit controls, hue 0 to 355 step 5, chroma 10/20/30/45/60, both hueSameDir, both hue spaces (15,120 palettes, 665,280 cells).
- na-rand: 4,000 random non-anchored palettes (skew, lift, relChroma, chromaFloor 10 to 100, hueShift -60 to 60, both spaces).
- a-kit: the default kit's 16 anchored palettes x 11 shifts x hueSameDir x 2 spaces (672).
- a-rand: 120 random anchors (uniform, near-grey, near-white/black) x 11 shifts (1,320).
- a-corpus: 150 sampled curated anchored palettes x ±30, ±60 (600).
- near-grey: 300 clamped near-grey anchors, oklch and cam16, shifts 0/±10/±30/±60.

Dips (total; by |shift|; new against base / base dips gone):

| Suite | Base | Pass 1 | G | CAP | RMD | RMG |
|---|---|---|---|---|---|---|
| na-grid | 0 | 88 {30:4, 45:20, 60:64} | 0 | 0 | 0 | 0 |
| na-rand | 2 (shift 56, cam16, stop 550, at base) | 48 | 2, 0 new | 4, 2 new (the 600 notch above) | 4, 2 new | 4, 2 new |
| a-kit | 6 {30:4, 45:2} | 12 {30:4, 60:8}, 8 new | 4, 0 new / 2 gone | 4, 0 new / 2 gone | 4, 0 new / 2 gone | 4 |
| a-rand | 7 {0:1, 10:2, 30:3, 60:1} | 19, 12 new | 7, 0 new | 7, 0 new | 7, 0 new | not run (too slow) |
| a-corpus | 0 | 2 (shift 60), 2 new | 0 | 0 | 0 | not run |
| near-grey | 0 | 0 | 0 | not run | not run | not run |

Movement against base (cells moved; max dC; cells over 10 C):

| Suite | Pass 1 | G | CAP | RMD |
|---|---|---|---|---|
| na-grid | 33,714 / 665,280; 14.81 C; 168 | 0; 0.00 C; 0 | 17,728; 8.58 C | 18,622; 8.58 C |
| na-rand | 23.52 C; 332 | 0; 0.00 C; 0 | 6,348 / 176,000; 23.52 C; 223 | 6,647; 23.52 C; 223 |
| a-kit | 3,188 / 29,568; 11.84 C; 22 | 1,226; 5.40 C; 0 | 1,976; 9.93 C; 0 | 2,052; 9.95 C; 0 |
| a-rand | 6,490 / 58,080; 13.23 C; 24 | 3,010; 8.29 C; 0 | 3,840; 11.50 C; 8 | 4,029; 11.56 C; 8 |
| a-corpus | 3,385 / 26,400; 13.71 C; 14 | 2,056; 9.30 C; 0 | 1,931; 8.65 C; 0 | 2,219; 8.74 C; 0 |
| near-grey, max dC by |shift| 0/10/30/60 | 5.87 / 6.84 / 7.96 / 20.85 | 5.87 / 5.65 / 5.81 / 18.91 | not run | not run |

Suite wall time (same host, in sequence; the host was loaded, so read ratios): a-kit base 3.3 s, pass 1 4.4, G 3.3, CAP 6.0, RMD 6.8, RMG 118.8; a-rand base 7.9, pass 1 14.5, G 12.0, CAP 22.0, RMD 24.3; a-corpus base 3.7, pass 1 7.0, G 5.5, CAP 12.7, RMD 14.0; na-grid base 30 s, RMG 69.1 s.

Curated corpus with the U1 tool (`node scripts/report-preset-fidelity.mjs --floor-ref --base-dir <base>`, `hueShift` as authored):

| Row | Pass 1 | G |
|---|---|---|
| rendered `STOPS` | 3,870 / 71,820; 1,522 palettes; 339 docs; 9.11 C | identical, byte for byte (the report's rendered blocks diff empty) |
| rendered `EXPORT_STOPS` | 4,441 / 94,500; 1,523; 339; 9.11 C | identical |
| gate `STOPS` | the 6 pinned Adia cells, 0.60 C | 0 moved, 0.00 C |
| gate `EXPORT_STOPS` | 7 cells (175 added), 0.60 C | 0 moved, 0.00 C |
| `--only default-kit` | rendered 24 / 304 and 30 / 400, 4.08 C; gate 0 | identical |

Gates on the G tree: `even-dips-gate.mjs` PASS, 0 dips, control 120; `tonal.mjs` PASS, `dip-gate-even` controls 1 and 38, `intensity-legacy` pass; `mode-isolation-gate.mjs` pass at `8ae715d202be14b2` / `0ac42e3c6dc6c0ef`; `chroma-envelope-gate.mjs --capture` even row median 15.6 / 47.0 / 42.5 / 22.9, p90 37.0 / 100.0 / 80.2 / 52.0, `above100` 499, equal to pass 1's committed fixture value for value; perceptual and peak byte-identical to base; `--compare` against base: 0 cells rose. `npm test` on the G tree: 52 of 54 files pass; `engine/exports.mjs` and `repo/citations.mjs` fail identically on an untouched `git archive` of pass 1 (an archive has no `.git` and the citation and baseline scanners read the repo), so neither is the rule's.

Cost against C2.8 (three paired runs, same host, in sequence, load averages 9 to 18, so these are ratios, not baseline rows):

| Gate | Base | Pass 1 | G | G / base |
|---|---|---|---|---|
| `even-dips-gate.mjs` (median s) | 13.47 | 12.72 | 13.35 | 0.99 |
| `chroma-envelope-gate.mjs` (median s) | 25.16 | 39.04 | 37.36 | 1.48 (pass 1 1.55; pass 1's quiet reading 1.50) |

Verdict on the candidates: G is the only rule that is byte-identical to base on the whole non-anchored path at every `hueShift`, adds no dip in any suite, keeps the curated-corpus movement and fixture figures exactly as pass 1 had them, and costs what pass 1 costs. CAP and RMD keep the grid at 0 but add 2 dips on random input and move non-anchored stops up to 23.52 C (223 cells over 10 C), and RMD's discrete minimum depends on the requested stop set, which breaks "a stop has the same colour in both stop sets". RMG fixes that and costs 36x on the anchored path. BND needs a constant.

## 3. Recommended rule and exact placement

Rule (section 1 and 3 wording for revision 3): the floor's reference is the largest of the gamut ceilings at the ramp's three reference tones (the pivot tone, the 450 tone, the 550 tone), read at the stop's own hue before edge rotation: on the anchored path under `hueSpace: "oklch"`, the CAM16 hue `solveCam16Hue` finds for that stop's tone; on the anchored path under cam16, `seedHue`; on the non-anchored path, `baseHue`. Edge rotation is not followed. Why: the ceilings are not monotone in hue, so a reference that follows the rotation rises or falls along the ramp against stops that do not move with it, and both directions measured dips; a deliberate edge rotation moves the hue each stop renders at (and its `maxc`), not the level the floor holds.

Placement, on top of pass 1 (`d77e5b74`; the `floorRefAt` helper, the hoisted tones and the U1 tool stay):

`paletteStopsAnchored`, the `chromaAt` closure and the final chroma line:

```diff
-    const chromaAt = (h) => {
+    const chromaAt = (h, hRef = h) => {
       ...
-      return evenChroma(mc, intendedH, env, controls.chromaFloor, floorRefAt(h, mc, pivotTone, tone450, tone550));
+      return evenChroma(mc, intendedH, env, controls.chromaFloor, floorRefAt(hRef, mc, pivotTone, tone450, tone550));
     };
 ...
-    const chroma = chromaAt(hue);
+    const chroma = chromaAt(hue, resolvedHue);
```

`solveCam16Hue`'s calls keep `chromaAt(h)`, so each candidate reads the floor at the candidate hue (no rotation exists inside the solve); the final line reads `mc` at the rotated `hue` and the reference at the solved `resolvedHue`. At `hueShift` 0 the two hues are equal, so the solve and the render see the same floor (review pass 4 Finding 2's property) exactly as in pass 1.

`paletteStops`, the per-stop call:

```diff
-    let chroma = evenChroma(maxc, intended, envelopeAt.get(stop), controls.chromaFloor, floorRefAt(hue, maxc, tone500, tone450, tone550));
+    let chroma = evenChroma(maxc, intended, envelopeAt.get(stop), controls.chromaFloor, floorRefAt(baseHue, maxc, tone500, tone450, tone550));
```

Keep it per stop in this exact text, not hoisted into a `const floorRef`: C2.3's grep stays meaningful, and the new grid gate row's negative control patches this literal (`GRID_TARGET` below). The three `maxChromaInGamut` reads at `baseHue` hit the exact-keyed cache after the first stop; measured cost 0.99x.

Nothing else in the engine changes: `evenChroma`, `FLOOR_TARGET`, `okhslStops*` untouched; R78 holds (no hue literal, no branch).

## 4. Revision 3 draft

### Revisions table row

| 3 | 2026-09-30 | U2 review pass 1 FAIL (F1): the per-stop reading at the ROTATED hue reopened #701-style off-anchor dips on the non-anchored path for `hueShift` of magnitude 30 and over (4 / 20 / 64 at 30 / 45 / 60 on a default-kit hueShift grid, base 0; repro oklch hue 115, chroma 60, `hueShift` -60, stop 400 26.79 C between 29.89 and 35.19). Re-diagnosed by measurement (`.sdlc/plans/floorref-hue-U2-rediagnosis.md`): the gamut ceilings are not monotone in hue, so a reference that follows edge rotation rises along the ramp (pass 1) or, capped or running-minimum, falls below unfloored neighbours (2 new dips in 4,000 random palettes, up to 23.52 C moved); neither keeps the guarantee. Rule restated: the reference is read at each stop's own hue BEFORE edge rotation (the per-stop solved CAM16 hue on the anchored OKLCH path, `seedHue` on anchored cam16, `baseHue` non-anchored); owner question `.sdlc/questions/floorref-hue-U2-rule.md`, recommendation that rule. C2.1 now pins the gate path at 0 moved (the 6 Adia cells no longer move); C2.2's figures unchanged (3,870 / 4,441, 9.11 C, rendered blocks identical to pass 1); C2.3 restated for `hRef`; C2.4 adds the hueShift grid rows (C2.13) with their controls; C2.7's control rewritten so it bites (F5); C2.8's even-dips bound restated for the grid block; C2.14 added for the comment truth fixes (F2, F3, F4) and C3.5's grep widened; section 1's tolerance no longer reads as a bound on all input; Risk row 1 closed by C2.13; Blast radius gate line now 0 cells. Pass 2 builder grade l7 (two up from l5) |

### Section 1 and 3 text

- Section 1, "The rule" bullet: replace "read at the hue the stop actually renders at" with the rule paragraph of section 3 above.
- Section 1, "The tolerance" bullet: "Where the reference reads the same hue as before (the whole non-anchored path at every `hueShift`; the anchored path under cam16 with an unclamped anchor at every `hueShift`) every rendered hex stays byte-identical. Elsewhere, over the curated corpus, a stop moves by at most 10 CAM16 C (measured 9.11 C, section 2); this is a bound on the corpus the verifier reads, not a property of every input (user palettes measured up to 18.91 C, near-grey clamped anchors at `hueShift` 60, with 0 dips). The dip gates, the new hueShift grid rows included, stay at 0, and no summary statistic of the even ratchet fixture rises."
- Section 3, anchored paragraph: the reference is evaluated inside `chromaAt`, at its second parameter `hRef` (default `h`); the final chroma line passes `resolvedHue`. Non-anchored paragraph: the reference is read at `baseHue` at every stop, which equals the per-ramp reading, so this path is byte-identical at every `hueShift`.
- Section 2, the gate-path paragraph and the Blast radius gate line: "gate path 0 cells (pass 1's 6 Adia cells were the rotation-following reading, retired in revision 3)".
- Risks row 1, Response: "Measured and closed in revision 3: following the rotation reopens dips in both directions; the rule reads the pre-rotation hue and C2.13 gates a hueShift grid on both paths."
- Units, U2 line: "per section 3 as restated in revision 3 ... · grade l7 · reviewer-l3 · verifier-l2".

### Changed criteria rows

| # | Command | Expected | Negative control | Today |
|---|---|---|---|---|
| C2.1 | `node scripts/report-preset-fidelity.mjs --floor-ref --base <merge-base>` | Gate path, `STOPS` and `EXPORT_STOPS`: 0 cells moved, max dC 0.00 C, `moved in hueShift 0 palettes` 0, empty mover list (the whole non-anchored path is byte-identical to the merge-base at every `hueShift`, the 12 edge-rotated palettes included) | Run the same command with the U2 pass 1 tree (`d77e5b74`, the rotation-following reading) as the head: it moves exactly the 6 `STOPS` cells revision 2 pinned (Adia `Success` 150 `#C6EBBC`, 200 `#B6DAAD`, 250 `#A6C99D`, 300 `#94B78D`; `Info` 300 `#96ACBC`; `Data 5` 300 `#AAA880`) and 7 on `EXPORT_STOPS` (`Success` 175 `#BEE3B5`), so a regression to that reading is visible here as well as in C2.13 | pass 1: 6 / 7 cells, 0.60 C; G prototype: 0 / 0 |
| C2.2 | Same report, rendered path, `STOPS` and `EXPORT_STOPS` | Unchanged from revision 2: max dC <= 10 C in both sets, expected 3,870 / 4,441 moved, 1,522 / 1,523 palettes, 339 docs, 9.11 C (Tbilisi `secondary` 100). Added: the rendered blocks equal U2 pass 1's line for line (every curated anchored palette has `hueShift` 0, where the two rules are the same reading) | Unchanged: the 450-only `chromaAt` reading reads 18.05 C (Camargue `primary` 600) | G prototype: 3,870 / 4,441, 9.11 C, identical to pass 1 |
| C2.3 | Read `paletteStopsAnchored` and `paletteStops`; `grep -n "const floorRef" src/engine/tonal.js` | The three-ceiling reading is inside `chromaAt`, read at its second parameter `hRef` (default `h`), so `solveCam16Hue` evaluates candidates at the candidate hue; the final chroma line is `chromaAt(hue, resolvedHue)`; the pivot ceiling is read at `pivotTone`; `paletteStops` passes `floorRefAt(baseHue, maxc, tone500, tone450, tone550)` per stop; the grep prints nothing | C2.13's two data-URL controls patch exactly these two call shapes back to the rotated reading and red | pass 1: reading at `h` and at `hue` |
| C2.4 | `npm run gate:even-dips` and `node test/engine/tonal.mjs` (`dip-gate-even`) | 0 dips gate path (19 + 25 stops), 0 off-anchor dips rendered path, the pre-#701 controls bite (120; 1 and 38), and both C2.13 grid lines read 0 with their controls biting | As revision 2, plus C2.13's controls | G prototype: 0 / 0, controls 120, 1, 38 |
| C2.7 | `node test/engine/chroma-envelope-gate.mjs --capture` in the unit, then `--compare <merge-base fixture>` | Even row: no cell rose; perceptual and peak byte-identical to the base fixture. Expected values (G prototype, equal to pass 1's committed fixture, so pass 2's `--capture` is a no-op on that file): median 15.6 / 47.0 / 42.5 / 22.9 at 100 / 300 / 700 / 900 (300 reads 46.962), p90 37.0 / 100.0 / 80.2 / 52.0, `above100` 499 | Three hand-edited copies of the UNIT's re-captured fixture passed as the base (`--compare <copy> --fixture test/engine/fixtures/chroma-envelope.json`), each must exit 1 naming its cell: even `above100` set to head minus 1 (498; "even above100"); even median at 300 set to head minus 0.1 (46.862, over the 0.05 slack; "even 300 median"); even p90 at 700 set to head minus 0.1 ("even 700 p90"). All three measured exit 1 on the G prototype. Revision 2's control (the merge-base fixture lowered by 1, `above100` 501) exits 0 against 499 and is retired as blind (F5) | merge-base 47.1 / 100.3 / 502; pass 1 and G 47.0 / 100.0 / 499 |
| C2.8 | Paired timing, five runs each, base and head, quiet host, `node test/engine/even-dips-gate.mjs` and `node test/engine/chroma-envelope-gate.mjs`; `npm test` wall time three runs | `gate:even-dips` median ratio head/base <= 1.6 (the C2.13 grid block and its two controls add about 4.5 s measured on a loaded host; the corpus sweep alone measured 0.99x) and its `.sdlc/baseline.md` row re-timed and named in Revisions; `gate:chroma-envelope` median ratio <= 2.5 with its row re-timed; `npm test` median under the 120 s ceiling (load-under-5 rule); the pairs in the PR body | n/a (a timing row) | loaded host: even-dips 0.99x without the grid; chroma-envelope 1.48x (G), 1.55x (pass 1); pass 1 quiet 1.03x / 1.50x |
| C2.13 (new) | `npm run gate:even-dips` (new block in `test/engine/even-dips-gate.mjs`, printed before the corpus lines) | Two grid lines, both 0 dips. (a) gate path: default-kit controls (`defaultDocument()`'s curve, tension, lmin, lmax, damp, dampCurve, dampBias, relChroma, chromaFloor, vibrancy), `dampAmp` 0, `toneMode` even, no anchor, hue 0 to 345 step 15, chroma 30 / 45 / 60, `hueShift` ±30 / ±45 / ±60, hueSameDir false and true, hueSpace oklch and cam16, `STOPS` and `EXPORT_STOPS`: 1,728 palettes, 0 dips. (b) rendered path: the default kit's 16 palettes with their anchors, `hueShift` ±60, hueSameDir false and true, both hue spaces, both stop sets, stop 500 excluded (the Q3 notch class, as `dip-gate-even`): 128 palettes, 0 dips. The predicate is the script's `findDips` one | Each line has an in-script data-URL control (the `scaledEngine` recipe) that must print > 0 or the script fails `negative control DID NOT bite`: (a) replaces the literal `floorRefAt(baseHue, maxc, tone500, tone450, tone550)` with `floorRefAt(hue, maxc, tone500, tone450, tone550)`, measured 32 dips; (b) replaces `chromaAt(hue, resolvedHue)` with `chromaAt(hue)`, measured 8 dips (pass 1's reading: kit oklch and cam16 at `hueShift` 60). A missing patch target fails the script, as `FLOOR_TARGET` does | Does not exist; base 0 / 0; pass 1 32 / 8; G prototype 0 / 0 (grid a 2.6 to 2.8 s, its control 1.6 to 2.0 s, loaded host) |
| C2.14 (new) | `grep -n "at most 10\|\.sdlc/plans/floorref-hue\|floorRef, one per\|on cam16 the floor does not rise\|both floorRef call sites name" src/engine/tonal.js test/engine/tonal.mjs test/engine/even-dips-gate.mjs` | Prints nothing; the four comments carry the section 5 wording (the tolerance as a corpus measurement, the citation to #766 and the ADR-026 amendment, the per-stop pre-rotation reading, the grid gate) | Pass 1's tree prints 7 lines: `tonal.js` the `evenChroma` header (1), the `floorRefAt` header (2), the two call-site comments (2); `tonal.mjs` the dip-gate header (2) | 7 hits on pass 1, measured |

C3.1 and C3.3, Expected: "Every hit states the per-stop rule (three tones at the stop's own hue before edge rotation, the solved hue on the anchored OKLCH path); no line says the reference follows the rendered or rotated hue." C3.2 and C3.4: the amendment and the CHANGELOG name the pre-rotation rule, 0 gate-path cells, the rendered 3,870 / 9.11 C, and that edge rotation is not followed (with the measured reason in one sentence). C3.5's grep gains the C2.14 patterns.

Not in scope, add: "The base-intrinsic anchored notch at `hueShift` -30 / -45 on the kit's `#774902` palette (oklch, stop 200, 17.73 / 11.80 / 15.51 at base; 4 of base's 6 a-kit dips, which this rule keeps at 4) predates #766; the Orchestrator files it as a follow-up issue (`/file-bug`), it is why C2.13 (b) reads `hueShift` ±60 only."

## 5. Comment fixes (F2, F3, F4 and the handoff's open item)

`floorRefAt` header in `src/engine/tonal.js` (replaces the whole comment; F2 and F4):

```
// floorRefAt (#766): evenChroma's floorRef for one stop, the largest gamut ceiling among the ramp's three
// reference tones (the pivot's, 450's and 550's, at the tones the ramp renders them), read at the stop's
// own hue before edge rotation: the CAM16 hue the anchored path's per-stop OKLCH solve finds for that
// stop's tone, otherwise the ramp's own hue. Edge rotation (hueShift) is not followed: the ceilings are
// not monotone in hue, so a reference that follows the rotation rises or falls along the ramp against
// stops that do not move with it, and both directions measured off-anchor dips (#766, ADR-026 amendment).
// Where every stop reads one hue (the non-anchored path at any hueShift; cam16 with an unclamped anchor)
// the floor equals the old per-ramp floor and the render is byte-identical. Elsewhere the movement is a
// measurement, not a bound: at most 9.11 CAM16 C over the curated corpus (#766). evenChroma only ever
// reads min(maxc, floorRef), so the reading stops at the first ceiling that reaches the stop's own maxc
// and returns maxc: the same floor (not the same value) for fewer gamut bisections.
```

`paletteStopsAnchored` call-site comment, last two lines (F2): replace "Exact against the old per-ramp reading (seedHue) under cam16 with an unclamped anchor and hueShift 0; under the per-stop solve or edge rotation a stop moves by at most 10 C (floorRefAt's comment)." with "chromaAt's second parameter is the hue the reference is read at: the candidate hue inside the solve, the solved hue (before edge rotation) on the final line. Exact against the old per-ramp reading under cam16 with an unclamped anchor at any hueShift; the per-stop OKLCH solve moves stops by a measured amount (floorRefAt's comment)."

`paletteStops` call-site comment (F2): replace "read by floorRefAt at the hue each stop renders at (baseHue plus its edge rotation, below). At hueShift 0 every stop renders at baseHue, so the reading equals the old per-ramp one and the render is byte-identical; under edge rotation a stop moves by at most 10 C (floorRefAt's comment)." with "read by floorRefAt at baseHue, the hue every stop has before its edge rotation (floorRefAt's comment says why rotation is not followed), so this path renders byte-identically to the old per-ramp reading at every hueShift."

`evenChroma` header (handoff open item): replace "(exact at hueShift 0 on the cam16 path; both floorRef call sites name the approximate cases)" with "(read at each stop's hue before edge rotation, floorRefAt; under rotation maxc follows the rotated hue while the floor holds its level, and the guarantee there is the measured hueShift grid of npm run gate:even-dips)".

`test/engine/tonal.mjs`, the `dip-gate-even` header (F3), replace "(src/engine/tonal.js floorRef, one per ramp path), not the anchor stop's own ceiling (U2 pass 1's design, retired: it drained the far half toward grey), so at hueShift 0 on cam16 the floor does not rise from 450/550 outward (no dip guarantee)." with "(src/engine/tonal.js floorRefAt, read at each stop's hue before edge rotation, #766), not the anchor stop's own ceiling (U2 pass 1's design, retired: it drained the far half toward grey), so the floor does not rise from 450/550 outward; under the per-stop OKLCH solve and edge rotation that is a measurement, gated at 0 here and by the hueShift grid in npm run gate:even-dips."

`test/engine/even-dips-gate.mjs` header: add a paragraph for the grid block (what it renders, why the corpus alone cannot catch this: the curated corpus's largest `hueShift` is 10, and why (b) reads ±60 only), and the two grid controls beside the existing one.

## 6. Reviewer findings, disposition

| Finding | Disposition |
|---|---|
| F1 dips at |shift| 30 and over | Cause confirmed and widened (section 1); rule G (section 3); gated by C2.13 |
| F2 "at most 10 C" comments | Section 5 wording; C2.14; section 1's tolerance restated as a corpus bound |
| F3 stale `tonal.mjs` header | Section 5; C2.14 and C3.5 grep |
| F4 plan path citation | Section 5 cites #766 and the ADR-026 amendment; C2.14 |
| F5 C2.7 control blind | C2.7 control rewritten, three cells, measured exit 1 each |
| F6 lazy short-circuit | Accepted, unchanged |
| F7 build not run, baseline row | C2.8 re-timing on a quiet host, plus `npm run build` per the plan's constraints |

## 7. Builder grade advice

Pass 2 at builder-l7 (two grades up from pass 1's l5, per the rubric for a unit returning on a reviewer FAIL with a re-diagnosed rule). The engine diff is three lines, but the pass carries a new gate block with two data-URL controls whose patch targets must match the engine text exactly, four comment rewrites whose truth is the F2 to F4 findings, a fixture `--capture` that must come out a no-op, the C2.7 control files, and a quiet-host re-timing. Reviewer-l3 and verifier-l2 per R79. The builder starts from `unit/fh-U2` at `0a5482a8` and keeps the helper, the U1 tool and the re-captured fixture.
