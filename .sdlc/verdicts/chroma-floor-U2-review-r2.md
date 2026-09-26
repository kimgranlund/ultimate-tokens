PASS

# Review: chroma-floor U2 (#701), pass 2

| Field | Value |
|---|---|
| Seat | reviewer-l3 (opus) standing in for reviewer-l4 while fable is capped (owner ruling `.sdlc/questions/seat-reliability-approval.md`). The builder is opus (builder-l6), so this check sits inside the builder's family |
| Branch | `unit/cf-U2` @ f102d1c7 (code ed1658dc), diff read `b5d8ffd7..f102d1c7` |
| Spec | `.sdlc/plans/chroma-floor.md` revision 14 (U2 entry, C3, C4, C13, the two new risk rows), `.sdlc/plans/chroma-floor-U2-rediagnosis.md` |
| Host | 1-minute load above the core count throughout; no timing here is a figure of record |
| Tree | clean after every run (`git status --short` 0) |

## Verdict

Pass 2 implements revision 14 as written. The clamped branch is gone, and both sites share one continuous rule: `floorRef = max(maxc500, maxc(tone 450), maxc(tone 550))`. Off-anchor dips stay at 0 on both paths, and pass 1's items 2 to 5 are closed.

The C13 (i) miss (2.77 against a bound of 2 on the pale 94.95/95.13 pair) is a criterion defect, not an engine miss. The Orchestrator must fix C13 (i) in the plan before the verifier grades it, or the verifier will red on the literal text.

## C13 (i): criterion defect, with evidence

C13 (i) measures each anchor's loss against the pre-#701 floor, then compares that loss across the edge. The pre-#701 reference itself swings with the 8-bit hue of a quantized pale anchor, by more than the 2 C bound. That happens on one side of the edge, with no edge involved.

My sweep: pale hue-250 anchors, C 6, L* 94.45 to 95.85 in 0.1 steps, stops 600 to 800, CAM16 C from the rendered hex (`$CLAUDE_JOB_DIR/tmp/c13-sweep.mjs`).

| Anchor | L* | CAM16 hue | new engine 700 / 750 / 800 | pre-#701 700 / 750 / 800 | loss |
|---|---|---|---|---|---|
| `#EEF0F5` | 94.78 (in) | 245.4 | 14.4 / 14.9 / 14.7 | 15.8 / 19.5 / 20.7 | 6.00 |
| `#EEF0F6` | 94.80 (in) | 250.0 | 14.2 / 13.8 / 14.1 | 16.2 / 20.5 / 22.3 | 8.24 |
| `#EFF0F6` (the "94.95" anchor) | 94.88 (in) | 254.9 | 13.4 / 13.9 / 13.7 | 16.6 / 20.9 / 25.2 | 11.49 |
| `#EFF1F7` (the "95.13" anchor) | 95.15 (clamped) | 250.0 | 13.9 / 13.8 / 13.6 | 16.2 / 20.5 / 22.3 | 8.72 |
| `#F0F2F7` | 95.47 (clamped) | 245.3 | 14.2 / 14.7 / 14.5 | 15.6 / 19.5 / 20.7 | 6.24 |
| `#F1F2F8` | 95.57 (clamped) | 254.7 | 13.4 / 13.9 / 13.7 | 16.6 / 20.5 / 25.2 | 11.49 |

- On the in-window side alone the loss ranges from 6.00 to 11.49, a 5.49 C swing. On the clamped side it is 6.24 to 11.49. The swing follows the CAM16 hue of the quantized anchor (about 245, 250 or 255), not the window edge.
- The "94.95" pale anchor happens to quantize to hue 254.9, where the pre-#701 reference peaks at 25.2 at stop 800. That peak is the 2.77.
- The new engine's own far side is flat across the whole sweep, at 13.4 to 14.9 C for stops 700 to 800. The builder's (i-b) reading of 0.55 C across the pair is correct.
- The sat row passes (1.94) only by luck of quantization. Its loss also swings on each side alone: 4.84 to 6.43 in window, 4.47 to 8.16 clamped.
- The discriminating measure is the new engine's own far-side |dC| across the pair. The pass-1 engine (`/private/tmp/claude-501/cf-U2/tonal-pass1.js`) reads 4.6 to 5.2 in window against 16.2 to 22.3 clamped at stops 700 to 800 on the same sweep: a 17 C cliff. So that measure keeps its negative control.

A second defect in C13 (i): the dark-edge pair "9.99 vs 10.05" does not straddle the edge. `RAMP_L_MIN` is 9.95, so both anchors are in window, and the sat generator yields the same hex (`#051D31`) for both. That makes its 0.00 vacuous. The 9.55 pair is the one that straddles.

Route (Orchestrator, plan revision, before the verifier):
- Replace (i) with the new engine's far-side max |dC| across each straddling pair, bound 2 C.
- Make the pass-1 engine the negative control; it must read far above the bound.
- Replace 9.99 with an L* below 9.95, and state that 9.55 vs 10.05 is the dark-edge pair.
- Optionally pin the anchor's CAM16 hue rather than regenerating it per L*, so quantization stops moving the pair.

## Findings

| # | Sev | Where | Finding | Route |
|---|---|---|---|---|
| 1 | 🟡 Minor (plan) | `.sdlc/plans/chroma-floor.md`, C13 (i) | The criterion defect above. The literal text reads FAIL at this head for a reason unrelated to the engine | Orchestrator, a plan revision before verify |
| 2 | 🟡 Minor (plan) | C13 (iii); #739 | Two bounds sit exactly at their limit, with zero margin. Anchors below L* 15: 5 of at most 5. The builder's generator counts two L* 9.70 anchors the re-diagnosis did not (5 vs 4, 17 cells vs 16). #739's skip bound is also at its limit: 3 of 3. The rule is correct, but any later floor change reds one of these. The verifier should read both figures fresh, not from the handoff | informational; the verifier notes it |
| 3 | ⚪ Nit | `test/engine/tonal.mjs:1202` | `(tonal.js:749)` is still stale; it predates U2 and pass 1 routed it to U3 | U3 sweep |

## Checked this pass (my own runs, not the handoff's)

| Item | Evidence |
|---|---|
| Rule | `tonal.js` `paletteStopsAnchored` computes `floorRef` from `anchorLerp(pivotTone, ...)` at 450 and 550, with no branch on `clamped`; `paletteStops` uses `toneAt(450/550)` at `baseHue`. `evenChroma` and its patch-target line are unchanged, so the C3 and C4 controls still find their target |
| Dips | Sweep over corpus + kit, 19 + 25 stops (`$CLAUDE_JOB_DIR/tmp/cf-exp.mjs`): real engine 0 off-anchor rendered, 0 gate path. Pre-#701 floor: 24 rendered, 0 gate path, matching the C3 control |
| C13 probe | `node /private/tmp/claude-501/cf-U2/c13-probe.mjs` reproduces the handoff exactly: (i) 0.00, 0.00, 1.94, 0.45, 0.18, 2.77 FAIL; (ii) pass on both reviewer pairs; (iii) 17 cells in 8 anchors, 0 in L* 88 to 95.05, 5 below L* 15; exit 1 on the (i) line only |
| Pass-1 items | Item 2: the controls and the plan text agree (revision 14 (b)). Item 3: `adapter.md:36` reads seven rows, `355 to 475 s`, `86+79+67+57+20+20+26 to 116+100+86+83+23+34+33`. Item 4: the per-family ratio table is present; U2 moves no accent ratio and all 32 cells are above 4.5. Item 5: the `tonal.js` comment and foundations §5 are now conditional ("a measurement, not a guarantee") |
| Docs | foundations §5 and knowledge-02 state `floorRef` as the 450/500/550 max. The two review-doc citations were re-pointed to `tonal.js:983`, which resolves to `export function okhslLAt`. `citations.mjs`: STALE 0 at f102d1c7. U+2014 in added lines: 0 |
| Scope | Pass 2 touches only paths in U2's list, the plan records merged at 82925a5f, and the regenerated bundles |
| Blast radius | Down from pass 1: U1 + U2 11.92% of even 25-stop cells (was 14.07%), under the 15% line; max dC 23.38 (was 27.43) |

## Not run

I did not re-run `npm test` or the full `gate:corpus-tonal`, `gate:corpus-anchor` and `gate:even-dips` legs because of host load. The builder's C1, C3 and C4 readings are consistent with my targeted sweeps; the verifier owns the full legs.
