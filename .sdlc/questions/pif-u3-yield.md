---
kind: question
plan: preset-intent-fidelity
unit: U3
written: 2026-09-19
---

# pif-u3-yield: pass-7 step 2's final re-measure, ship vs revert, for the owner

Per the conductor's ruling (relayed by team-lead): after F1 and F2 landed, re-run the SAME step-2
construction (tone-held OKHSL damping) once on the fixed solver, no new construction or retune. This
completes pass 7. If both cells close with 0 upticks and every guarantee holds, ship it; if not, revert
and write this record: both targets with achieved vs bar, the uptick counts and cells for each yield
option, and one recommendation.

**Result: 0 upticks was not achieved.** Reverted per the ruling's own instruction; `src/engine/tonal.js`
is back to its F1-fixed, step-2-free shipped state (no diff from the previous commit). This is the same
outcome already recorded in `.sdlc/questions/pif-u3.md`'s "step 2, second attempt" addendum; this record
exists specifically to give the owner the two options side by side, in the requested shape.

## Construction re-run (unchanged from the second attempt)

Per stop, perceptual/peak, `dampAmp === 0`: hold `targetTone` at today's (pre-extra-damping) value,
compress `s` further via `sExtra = keyS * envelopeAt.get(stop) ** OKHSL_EXTRA_DAMP_POWER` (envelope-based
power transform, `OKHSL_EXTRA_DAMP_POWER = 1.8`, the only value tried across both attempts), re-solve `l`,
fall back to `hctToRgb` and polish through the F1-fixed `refineNearestRgb` (target-direct fallback,
Abney-corrected polish hue via `solveCam16Hue`, `chromaFloor` guard).

## Both targets, achieved vs bar

| cell | option | median | p90 | bar (p90) | clears? |
|---|---|---|---|---|---|
| perceptual\|300 | ship (step 2) | 60.6% | 76.6% | <=90% | yes |
| perceptual\|300 | revert (shipped today) | 68.9% | 93.7% | <=90% | no, misses by 3.7pp |
| peak\|700 | ship (step 2) | 59.0% | 80.1% | <=90% | yes |
| peak\|700 | revert (shipped today) | 65.5% | 96.8% | <=90% | no, misses by 6.8pp |

(The revert-option figures are a fresh `--envelope` re-run at the current shipped head, not the pass-6
addendum's numbers: F1's peak-cap fix moved peak|700's p90 slightly, 96.1% -> 96.8%, since it changed
capped-stop rendering. perceptual|300 is unchanged from pass-6, 93.7%, since F1 only touches peak mode.)

## Uptick counts and cells, per yield option

**Ship (step 2 applied):** real regressions across 3 named gates, full independent scan (not just the
gate's own first-witness report):

- `chroma-envelope` (C6 i): **4** peak-mode upticks (both stop sets combined, full corpus), all
  near-white, hue 105-112 (yellow-green), stop 75->100, magnitude 0.0003 L*. All 4 witnesses:
  - `25-stop hue 106 chroma 30.00 skew 0 lift 0: stop 75->100 (99.6298 -> 99.6301)`
  - `25-stop hue 108 chroma 30.00 skew 0 lift 0: stop 75->100 (99.6298 -> 99.6301)`
  - `25-stop hue 112 chroma 100.00 skew 0 lift 1: stop 75->100 (99.6298 -> 99.6301)`
  - `25-stop hue 105 chroma 30.00 skew 0 lift 0: stop 75->100 (99.6298 -> 99.6301)`
- `skew-lift-okhsl` (i), the unwarped-distribution check: **103** failing stops (perceptual/oklch and
  even hueSpace combos, skew-0/lift-0 defaults), a full independent scan against the gate's own math,
  not just the single reported witness. Sample witnesses: `perceptual/oklch Secondary stop 150`
  (emitted 0.90099 vs independent 0.89778), `stop 200/250/300/850`, `perceptual/oklch Data 1 stop
  600/650/700`, and more across the 9 skew-0/lift-0 default palettes. This means the construction shifts
  `l1` measurably even at the ramp's OWN neutral (unwarped) baseline, not only where skew/lift warp it.
- `intensity-legacy`: 1 named fixture mismatch (perceptual Neutral stop 125, `#DADBDD` vs the committed
  `#D9DBE0`), expected and would need a fixture regen if shipped, not itself a defect.

**Revert (current shipped state, step 1 only):** 0 upticks, 0 skew-lift-okhsl(i) failures, 0 fixture
mismatches. `node test/engine/tonal.mjs` exits 0. The two cells above stay open at their measured
figures (93.7% and 96.8% p90, both against a <=90% bar).

## Why the fixed solver didn't help

F1's fixes (24-iteration bisection, target-direct fallback, `chromaFloor`, Abney-corrected polish hue)
all operate on a SINGLE stop's own chroma/hue accuracy. The uptick here is an ORDERING property between
ADJACENT stops' independently tone-held solves, worst near white where the underlying tone curve
flattens and two stops' pre-extra-damping tones are already nearly tied: the construction's own
per-stop residual (quantization + polish) can be large enough, relative to that gap, to flip which one
reads lighter. This is a property of the construction (independent per-stop tone-holding with no
inter-stop ordering constraint), not of the solver it calls. A future construction that enforces
ordering explicitly, or solves the whole ramp jointly rather than stop-by-stop, would need to replace
this one rather than reuse it.

## Recommendation

**Revert; keep step 1 only.** `chroma-envelope` (C6 i)'s "0 upticks, full corpus, both stop sets,
RENDERED path" is the plan's own named hard-stop condition (#668/R1/R2 exist specifically to prevent this
class of regression), not a soft target the way the median/p90 numeric cells are. Shipping a 4-instance,
0.0003 L* uptick to close two p90 cells trades a small, disclosed numeric miss (already accepted as
"open" since pass 6) for a real violation of the unit's own core invariant, plus a NEW 103-stop
regression in a previously-clean gate (`skew-lift-okhsl` i) that has no precedent of being waived. Both
misses are small in absolute terms (3.7pp and 6.8pp over a `<=90%` p90 bar) and were already disclosed
and accepted as open at pass 6; shipping this construction does not close them cleanly enough to justify
reopening a gate the brief treats as non-negotiable. If the owner wants these two cells closed, the path
is a different construction (joint or ordering-aware), not a third parameter value of this one, per "if a
second workaround is needed, stop."
