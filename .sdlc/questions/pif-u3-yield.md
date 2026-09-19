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
  Reconciled against `.sdlc/questions/pif-u3.md`'s own record of this same retry (U3 review 3, minor
  item 6): its Q7 addendum reports the gate's own live FAIL message for this exact cell as 0.90142, not
  0.90099. The independent target (0.89778) is identical in both, so the two records agree on what the
  ramp SHOULD emit; they disagree on what it DID emit, by 0.00043. The gate's own live message is the
  authoritative figure for that single run (it reads `r.rgb` straight off the actual construction under
  test); this doc's number comes from a separate full-corpus scan script run afterward, whose own job is
  the FAILURE COUNT (103 of however many stops), not a byte-exact re-derivation of the gate's one
  first-witness value, so a few ten-thousandths of drift between the two scripts is expected and does
  not change the count or the revert recommendation. Left as two honestly-differing numbers rather than
  silently picked to agree.
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

## F1's peak-cap fallback rate and margin (U3 review 3 N3, corrected U3 review 4 R5)

Context for why F1's own single-stop accuracy fix did not, by itself, close `peak|700`: the peak cap's
HCT fallback (`src/engine/tonal.js:667-679`, moved from `:661` when this comment block grew) fires on
93.5% of capped stops, not "rarely" as an earlier comment claimed (now corrected there). The bisection's
own 24 steps do converge on CHROMA reliably; it is the 0.01 L* TONE tolerance that almost always trips,
since that is tighter than an 8-bit RGB round-trip usually holds at a fixed hue/chroma, so nearly every
capped stop goes through `hctToRgb` rather than keeping the bisection's own continuous render.

The margin below the anchor is a DESIGNED BOUND, not the measured median: the code applies `CAP_MARGIN`
(0.5 C) below `target`, and `refineNearestRgb`'s own polish may then drop the chroma up to 1 C further
(`Math.max(0, chroma - 1)`, `tonal.js:688`), so the designed bound is about 1.5 C below the anchor, not
0.5 C alone. The measured maximum, 1.82 C, is above even that 1.5 C bound, because the fallback can land
under target before the polish step runs, stacking rather than double-counting. The measured median gap,
0.70 C, is supporting data, not the bound itself (corrected from stating the median as "the one number,"
review 4 R5).

Tone drift: 34.5% of capped stops exceed 0.01 L* from target, maximum 0.1009 L*. Hue residual: maximum
24.62 degrees. 0 stops have a chroma gap over 3 C. These figures hold under two independent measurement
methods (the full generated corpus, 58,050 cap solves / 54,270 fallbacks; and the same corpus deduped to
2,440 unique capped stops), both giving 93.5%. "Better in every other respect" no longer appears in the
record; the fallback comment no longer calls this "rare".

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

---

# Second owner item: 53 even-mode chroma dips from pass-7 step 1, pending owner

Per U3 review 3 (N1): pass 7 step 1's even-only damping mapping (`EVEN_DAMP_FACTOR`) introduced 53 new
even-mode chroma dips (an interior stop at least 3 CAM16 C below both neighbours), all at stop 350 (51
instances) or stop 650 (2 instances), depth 3.0 to 4.1 C. Base (pre-step-1) even dip count: 0. These are
now named and gated permanently (`test/engine/tonal.mjs`, `EVEN_DIP_BASELINE`), with a negative control.

## Mechanism

`evenChroma(maxc, intended, env, chromaFloor)` computes `damped = intended * env` and
`floorC = chromaFloor% * maxc(stop)`, returning `max(damped, floorC)` (clamped to `maxc`). `damped` rises
monotonically toward the anchor as `env` rises. `floorC` inherits `maxc(stop)`'s OWN gamut-ceiling shape,
which is NOT monotonic across a ramp: it peaks near a hue's own cusp tone, then falls either side. Step
1's steeper even envelope means `damped` takes longer to overtake `floorC`, and in the band where
`floorC` has passed its own local peak but `damped` has not yet caught up, the max of the two produces a
real interior dip: the floor still "wins" there, but the floor's OWN value has already started falling
faster than `damped` is rising.

Measured witness: architecture "Katsura Imperial Villa" primary (hue 40, lift -40, chromaFloor 40).
Stop 300's floor is 33.48 C (wins over damped 17.57). Stop 350's floor has fallen to 29.63 C (still wins
over damped 25.97), the dip. Stop 400: damped (35.99) finally overtakes floor (25.26).

## Fix attempt: tried once, reverted

Moved the floor into ENVELOPE space rather than chroma space: `floorEnv = chromaFloor / 100`,
`flooredEnv = max(env, floorEnv)`, `chroma = min(maxc, intended * flooredEnv)`. This removes `maxc`'s own
non-monotonic shape from the floor entirely (a constant clamp on a smooth curve cannot introduce a new
local extremum), and does eliminate all 53 dips cleanly (measured: 0).

It fails a required target: the even `--envelope` median/p90 table, which step 1 was built to close,
regresses.

| cell | shipped (with dips) | fix attempt (0 dips) | target |
|---|---|---|---|
| even\|100 p90 | 19.8% | 39.0% | <=35% (fails) |
| even\|900 median | 16.3% | 40.5% | <=25% (fails) |
| even\|900 p90 | 27.1% | 48.4% | <=35% (fails) |

The OLD gamut-relative floor shape (`chromaFloor% * maxc(stop)`, shrinking near white/black alongside the
gamut ceiling) was load-bearing for keeping near-white/near-black chroma proportionally LOW, which is
exactly what these three cells require. The new envelope-space floor no longer shrinks with `maxc` near
the extremes, so it lifts those stops' chroma well past what the median/p90 targets allow.

Per "ONE fix attempt... if it fails, revert that attempt": reverted `src/engine/tonal.js` to the shipped
(pre-attempt) state. `node test/engine/tonal.mjs` exits 0 at that head (53 dips present, named in
`EVEN_DIP_BASELINE`, gate green).

## All 53 dips, pending owner (preset|palette|stop)

```
Katsura Imperial Villa · 17th c · Kyoto|primary|350
Kyō-machiya townhouse · Edo–Meiji · Kyoto|secondary|350
Villa Savoye · 1931 · Le Corbusier · Poissy|primary-muted|350
Bauhaus Dessau · 1926 · Walter Gropius|primary-muted|350
Borgund Stave Church · c.1180 · Norway|primary|350
Borgund Stave Church · c.1180 · Norway|secondary|350
Lancashire cotton mill · 19th c · northern England|secondary-muted|350
Matcha & wagashi · the tea room|tertiary-muted|350
Kaiseki · the seasonal course|tertiary-muted|350
Pizza Napoletana · the wood-fired oven|primary|350
Tandoor · the clay oven|tertiary-muted|350
Chocolate · the chocolatier's bench|primary|350
Espresso · the café counter|tertiary|350
The Red Shoes · 1948 · dir. Powell & Pressburger · the ballet|primary-muted|350
Singin' in the Rain · 1952 · the 'Broadway Melody' set|primary-muted|350
The Godfather · 1972 · dir. Coppola · cin. Gordon Willis · the don's study|secondary|350
Taxi Driver · 1976 · dir. Scorsese · the neon city through a windshield|secondary|350
Apocalypse Now · 1979 · dir. Coppola · the river at dusk|primary|350
TRON: Legacy · 2010 · dir. Kosinski · the Grid|secondary|350
Hereditary · 2018 · dir. Aster · the dollhouse home|tertiary-muted|350
There Will Be Blood · 2007 · dir. P.T. Anderson · the oil derrick fire|tertiary-muted|350
Once Upon a Time in the West · 1968 · dir. Leone · the railhead town|tertiary-muted|350
Hero · 2002 · dir. Zhang Yimou · the red courtyard duel|tertiary-muted|350
Snowpiercer · 2013 · dir. Bong Joon-ho · the train cars|primary-muted|350
Dune · 2021 · dir. Villeneuve · Arrakis at high sun|tertiary-muted|350
Rebecca · Daphne du Maurier · 1938 · Manderley|tertiary-muted|350
Ulysses · James Joyce · 1922 · Dublin, 16 June 1904|tertiary-muted|350
The Tale of Genji · Murasaki Shikibu · c.1010 · the Heian court|secondary-muted|350
A Streetcar Named Desire · Tennessee Williams · 1947 · the French Quarter flat|secondary-muted|350
The Sound and the Fury · Faulkner · 1929 · the Compson place|tertiary|350
Fahrenheit 451 · Bradbury · 1953 · the fireman's city|tertiary-muted|350
The Road · Cormac McCarthy · 2006 · the ash-grey wasteland|tertiary-muted|350
Alice's Adventures in Wonderland · Carroll, ill. Tenniel · 1865|tertiary-muted|350
The late-night club · the smoky set|secondary|350
Rasta tricolour · the roots sleeve|tertiary-muted|350
Kingston street · the sound-system yard|secondary|350
Dub studio · the mixing desk|secondary|350
Detroit techno · the chrome sleeve|secondary|350
Romantic era · the candlelit recital|primary-muted|350
Pastel idol concept · the debut MV|secondary-muted|650
40° S · December · 14:00 · Valdivian rainforest, Los Ríos, southern Chile|tertiary-muted|350
24° S · June · 07:00 · Sossusvlei, Namib Desert, Namibia|tertiary-muted|350
0° · June · 11:00 · Congo Basin lowland forest, Odzala, Republic of the Congo|tertiary|350
64° N · July · 13:00 · Landmannalaugar, Icelandic highlands|tertiary-muted|350
23° S · December · 16:20 · Salar de Atacama, 2,305 m|primary|650
62° N · September · 09:30 · Tórshavn waterfront, thick sea-fog|tertiary|350
62° N · September · 09:30 · Tórshavn waterfront, thick sea-fog|tertiary-muted|350
48° N · February · 11:00 · Saint-Malo quay at the year's lowest tide|primary-muted|350
27° N · October · 17:30 · A teahouse in Khumbu, on the trekking route from Namche to Tengboche|tertiary-muted|350
41° N · November · 00:10 · Eminönü waterfront, Istanbul, last ferries in|tertiary-muted|350
20° N · January · 06:30 · Rub' al Khali at first light, near the Saudi-Omani border|primary-muted|350
30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat|primary|350
30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat|tertiary-muted|350
```

## Recommendation

**Revert; keep the shipped (pre-attempt) evenChroma formula, dips named as a disclosed, gated, pending-
owner list.** Neither option available this unit closes the dips without a new regression: the tried
fix trades 53 dips for 3 failing median/p90 cells step 1 exists to hold. The dips are a genuine ramp-
shape defect (a real, if small, 3-4 C notch), not a measurement artifact, but they are visually minor
(1 stop out of 25, 3-4 C) against the alternative of reopening 3 cells that were the review's own
original target. A future unit should design a floor mechanism that is monotonic in BOTH senses at once
(gamut-relative near the extremes, envelope-relative in the interior), rather than picking one over the
other, per "if a second workaround is needed, stop."
