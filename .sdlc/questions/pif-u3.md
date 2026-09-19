# Questions: preset-intent-fidelity U3 (chroma envelope)

date: 2026-09-18 (pass 2, answering review `pif-u3-review-1.md`)
asked by: pif-u3-envelope builder (continuation, p2)
refers to: `.sdlc/handoffs/pif-u3.md`, `src/engine/tonal.js` (`chromaEnvelope`), `docs/spec/spec-panda-park-ui-exports.md`

Pass 1's Q1 and Q3 are RESOLVED below and superseded in full: both rested on a corpus gate that
measured ramps the product never renders (raw `palette.chroma` instead of `rampChromaOf`'s resolved
chroma — 3,777 of 3,780 palettes differ). Every figure in this file is re-derived from the rendered
path (`rampChromaOf` + `hueShift`/`hueSameDir`/`cuspPull`, matching `src/ui/model.mjs`'s `projectView`
exactly), independently verified by the reviewer and reproduced again here. Nothing from pass 1 is
carried forward uncredited.

## Q1 — RESOLVED: Design B shipped, decided on the rendered corpus

Pass 1 shipped Design A (`sd` measured against the raw numeric anchor) on the strength of a
10,080-cell synthetic grid negative control and a corpus check that was, unknown to the builder at the
time, vacuous. Re-measured on the rendered path:

| corpus, 3,780 palettes x 3 modes x both stop sets | perceptual upticks | peak upticks | peak dup-hex ramps (25-stop) |
|---|---|---|---|
| pre-U3 base (362cc48, rendered) | 11 (worst +0.5105 L*) | 46 (worst +0.8312 L*) | 0 |
| Design A, shipped pass 1 (rendered) | 0 | 0 | 2 |
| Design B, shipped this pass (rendered) | 0 | 0 | 0 |

Design B (`sd = (liftStop(stop, lift) - liftStop(anchorStop, lift)) / 450`, i.e. position measured
against the anchor's OWN lifted reading rather than the raw numeric anchor) matches Design A's zero
upticks and closes BOTH duplicate-hex ramps A still shipped (nature "Varanger / Finnmark tundra"
tertiary and nature "English oak woodland" primary, 25-stop peak, stops 150&175, `#FDFDFB` — the
second one named nowhere in pass 1's own gate, which scanned a different ramp than either preset
renders). B also gives `env(anchorStop) = 1` exactly for every lift, not only lift 0, closing the
original Q1 gap outright rather than trading it for a different one.

The cost, measured directly (not assumed): 21 of the same 10,080 synthetic grid cells rise under B,
worst +0.1314 L* (20 near-white, tone 90.9-99.5, plus one near-black at tone 7.55, hue 287 skew -100
lift -40), about a sixth of the +0.83 L* #668 defect this unit repairs, at a skew/lift/hue/vibrancy
combination within the user-settable ranges but unused by any shipped preset or role default (the grid
probe pins chroma at 95 and sweeps skew to +-100). `test/engine/tonal.mjs` "skew-lift-okhsl" (iii c)
now carries these 21 cells as a named, cited exception list, verified both directions exactly like
C6(ii)'s own duplicate-hex list (deleting an entry FAILs naming that cell; an unlisted 22nd cell FAILs
too).

**Decision:** shipped Design B. On the corpus the product actually renders — which is what C6 is
worded against — B clears BOTH ramp-shape gates (0 upticks, 0 duplicates) while A clears only one. The
21-cell synthetic-grid cost is real and disclosed, not hidden inside a magnitude bar or a silently
loosened gate, and it never surfaces in shipped content. I did not find a genuine tie needing an owner
ruling — the rendered-corpus evidence decides it.

## Q2 — MOOT (plan rev7 retired the magnitude bar): kept for the record, not re-derived for R2

Unchanged from pass 1: the numeric median/p90/above-100% targets this question was written against are
no longer pass criteria (rev7). The two diagnosed mechanisms described there (a pre-existing peak-mode
OKHSL/CAM16 cusp mismatch, and Design A's non-exact anchor under lift) are historical background for
U2; Design B closes the second one outright (exact anchor at every lift), so mechanism 2 no longer
applies to the shipped engine. Mechanism 1 (the cusp mismatch) is unchanged by A vs B — both read
position through `liftStop`, and the mismatch lives in `effStop`/`toneAt`, U2's lane. Not re-measured
against R2 since no decision hangs on it; flagging only so a future reader does not mistake the old
numbers for current ones.

## Q3 — RESOLVED: the duplicate-hex "widespread pre-existing defect" was a proxy artefact, not a real finding

Pass 1's second read (after its own first read's `chroma >= 10` filter was corrected) concluded the
duplicate-hex class was a pre-existing, structurally unclosable defect (21 baseline ramps cut to 7 by
this unit's liftStop-keyed fix). That conclusion was built entirely on the same vacuous raw-chroma gate
finding 1 identifies. Measured on the RENDERED path:

| engine | peak-mode ramps with >= 1 duplicate hex, full corpus, rendered (25-stop) |
|---|---|
| pre-U3 baseline (362cc48) | **0** |
| Design A (pass 1 shipped) | 2 |
| Design B (this pass, shipped) | **0** |

The duplicate-hex class does not exist on the rendered corpus before this unit's work at all. Design
A's R1 chromaEnvelope introduced exactly 2 duplicate ramps (Q1's table); Design B's R2 closes them to
zero. `test/engine/tonal.mjs`'s `KNOWN_BASELINE_DUP` exception set is now empty — the infrastructure
(and its own load-bearing negative control) stays in place for a future, real, bounded case, but there
is currently nothing to cite. No plan-level ruling is needed for C6(ii); it is met at true 0/0/0.

## Q4 — Panda/shadcn normative spec literal drift (docs/spec, explicitly out of this unit's lane)

Unchanged by the R1 -> R2 switch: `Neutral` and `Primary` both carry lift 0, and `chromaEnvelope`'s
`sd` is identical under every design tried at lift 0 (`liftStop(stop, 0) === stop` always), so REQ-052
is the sole cause of this literal's move and the value is the same one pass 1 measured.
`docs/spec/spec-panda-park-ui-exports.md` still pins two NORMATIVE literals for
`tokens.colors.neutral["500"]` (EX-1, line 424) and `neutral.scrim` (EX-2, line 434, same value with a
`/30%` suffix): `oklch(0.5443 0.059 267.96)`. The shipped (now Design B) engine's value, re-confirmed
this pass: `oklch(0.5458 0.0462 266.73)`.

The MIRRORED test assertion (`test/engine/exports.mjs`, in-lane) already carries this value and needed
no change this pass. I did NOT edit `docs/spec/spec-panda-park-ui-exports.md` itself, per the
dispatch's explicit instruction that this doc is out of my lane.

Options (unchanged from pass 1):
- A docs-owning seat updates both spec literals (lines 424 and 434) to `oklch(0.5458 0.0462 266.73)`
  in lockstep with this landing, per the doc's own CARVE-OUT history convention (Recommended)
- Hold U3 from landing until the spec doc is updated in the same PR
- Revert REQ-052's basis change to avoid moving the normative literal at all (not recommended —
  REQ-052 is an explicit plan requirement, not incidental)

## Q5 — C6(iii)'s docs/ exception list needs 2 named paths for this unit's own, unavoidable citation fix

Unchanged in shape from pass 1, re-verified against this pass's own base: `git diff --stat 690b0a1 --
docs/` (690b0a1 is this unit's actual plan-tip base; 362cc48 is engine/generator/corpus-identical to it,
verified empty diff over `src/engine scripts/gen-categories.mjs src/ui/categories`) touches exactly 4
docs/ paths: the 2 expected `adia-*` regen files, plus
`docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,04-context-and-messaging}.md` — each a
single-line citation fix. The line number moved AGAIN this pass (`tonal.js:404` -> `:410`, not pass
1's `:395` -> `:404`) because this pass's `chromaEnvelope` comment grew further; `_okL`'s home is
unchanged in kind, only in line number. `node scripts/audit-citations.mjs` reports STALE 0.

Options (unchanged from pass 1):
- Add these 2 paths to C6(iii)'s named-exception list with the one-line reason above (Recommended —
  this is exactly the "named exception" shape C6(iii) already describes, just not yet enumerated)
- Revert the citation fixes and let `audit-citations` fail, escalating the STALE lines to whichever
  unit owns that doc instead (not recommended — the STALE lines exist only because of this unit's own
  comment growth, across two passes now)

## Q6 — RESOLVED (owner ruling, 2026-09-18): the C8 re-pin (4.9 -> 4.5) is accepted

**Owner ruling:** accept the re-pinned floor as shipped (4.5, matching the measured 4.53) — it still
clears the ruled AA floor, and the cell is re-measured once U1 and U6 land, per the first option below.
The re-measure obligation is carried in `.sdlc/handoffs/pif-u3.md`'s Risks section so U4 or whoever
integrates the plan cannot miss it. No further action from U3.

### (original text, kept for the record)

perceptual Neutral dark's contrast floor drops for real, 4.9 -> 4.5 (0.03 headroom over AA)

The review's finding 3 flagged four `hpg-role-contrast` floors lowered under Design A without
disclosure. Re-measured against the TRUE pre-U3 landed floors (bf2aaf6, not Design A's own numbers)
and re-derived floor-for-floor (1-decimal truncated) under Design B: three of the four were never real
— they were the same raw-chroma-proxy-shaped measurement error as Q1/Q3, or simply Design A's own
regression that Design B does not share (peak Neutral dark 4.5->4.7, peak Success light/dark 7.2/11.9,
peak Warning dark 7.5, peak Data 2 light 4.8, peak Secondary/Data 6 dark all move UP from bf2aaf6, not
down). Exactly one floor drops for real under Design B: **perceptual Neutral dark, 4.9 -> 4.5**
(measured 4.98 -> 4.53, 0.03:1 of headroom over the ruled AA 4.5:1 floor).

This is NOT an R1-vs-R2 (Design A vs B) artefact: Neutral carries lift 0, so `chromaEnvelope` reads
identically regardless of which centring design ships (`liftStop(stop, 0) === stop` for every design
tried). The move is REQ-052 itself — the OKHSL path's saturation-basis change, chroma% of gamut to the
key colour's own OKHSL `s` — which the plan's own mechanism (2) text names as a foreseeable risk ("the
accent's own L* shift... which the 16-family ratchet... both catch"). It still clears the ruled AA
floor via #662's on-color contrast policy, which guarantees AA rather than a rising ratchet, so it is
not a gate failure — but the plan's C8 text says "re-pin only upward, or hand any downward move to
#662's policy," and 0.03 of headroom is thin: U1's anchor move and U6's ladder change, both in flight
on this same plan, can each move Neutral's accent lightness further, and either could tip this cell
under AA without touching this unit's own files.

Options:
- Accept the re-pinned floor (4.5, matching the measured 4.53) as within #662's policy scope — it
  guarantees AA, not a specific ratio — and flag U1/U6 to re-measure this one cell after they land,
  since either can move Neutral's accent lightness (Recommended: cheapest, and the mechanism is
  correctly diagnosed and disclosed rather than hidden)
- Hold this unit's Neutral dark floor at 4.9 by having U3 additionally adjust Neutral's on-color
  resolution or REQ-052's basis specifically for low-chroma families (scope creep beyond this unit's
  dispatched file list, and REQ-052 is an explicit plan requirement — not recommended)
- Block landing until U1 and U6 both report their own effect on this one cell, so the true post-plan
  floor is known before any unit re-pins it

## Q7 — NEW: C6's primary envelope-shape table was never built; now built, and it misses under both readings

The verifier's re-review found a real gap this unit's own record misread: `.sdlc/questions/pif-u3.md`
Q2 (above) says "the numeric median/p90/above-100% targets this question was written against are no
longer pass criteria (rev7)". That is wrong. Revision 7 retired only the #668 **magnitude bar** (a
sub-pixel tolerance on the uptick repair); it never touched C6's Q4-ruled envelope table (median <=75%/
p90<=90% at 300/700, median <=25%/p90<=35% at 100/900, 0 palettes above 100%, all three modes), which
the active plan text still carries as C6's primary pass condition, with the four ramp-shape gates
explicitly "part of this criterion" rather than a replacement for it. Nothing in this unit's gate suite
asserted it, and the plan's own named command, `node scripts/report-preset-fidelity.mjs --envelope`,
did not exist.

**Built this pass:** `scripts/report-preset-fidelity.mjs --envelope [--damp-amp N]`, matching the
plan's exact command. It measures the corpus C6 names (curated palettes at source chroma >= 10, plus
the 8 default-kit semantic families — Neutral through Danger, not Data 1-8; 2,920 instances measured,
vs. the plan's stated ~2,836, the same ~3% discrepancy Q2 already disclosed and did not resolve), on
the RENDERED path, all three tone modes, and reports BOTH plausible readings of C6's prose since they
disagree sharply:

**Reading (a), the literal text — emitted CAM16 chroma at each stop as % of the emitted chroma at
stop 500:**

| mode | stop 100 median/p90 | stop 300 median/p90 | stop 700 median/p90 | stop 900 median/p90 | above 100% |
|---|---|---|---|---|---|
| perceptual | 11.1% / 19.7% ✅ | 68.9% / **93.7%** ❌ | 59.6% / 68.5% ✅ | 19.2% / 30.3% ✅ | **1793** ❌ |
| peak | 6.6% / 13.5% ✅ | 46.4% / 58.0% ✅ | 65.5% / **105.5%** ❌ | 19.0% / 28.8% ✅ | **1521** ❌ |
| even | 8.8% / **39.0%** ❌ | 61.1% / **110.8%** ❌ | 66.9% / 72.7% ✅ | **40.2% / 48.0%** ❌ | **2301** ❌ |

**Reading (b), Q4's other name ("envelope numbers") — the `chromaEnvelope` multiplier itself, as %
(env(500) is exactly 1 by construction, so this reading's "above 100%" can only come from the shoulder
term, `(dampAmp/100)*4*uG*(1-uG)`, which needs a non-zero `dampAmp`):**

| mode | stop 100 median/p90 | stop 300 median/p90 | stop 700 median/p90 | stop 900 median/p90 | above 100% |
|---|---|---|---|---|---|
| perceptual/peak/even (identical — the multiplier doesn't depend on tone mode) | **42.6% / 72.2%** ❌ | **79.6%** / 89.1% ❌/✅ | **78.9%** / 84.4% ❌/✅ | **40.1% / 57.7%** ❌ | **16** ❌ |

Both readings FAIL against the plan's numeric targets, not only on "above 100%" — reading (a) misses
two p90 targets outright (perceptual/peak stop 300/700) plus all of even mode; reading (b) misses the
median target at every single stop, in every mode, because the shoulder-and-damp shape is inherently
far from a flat 100% line by construction, independent of any one preset's controls.

**The "0 above 100%" clause is separately, structurally unsatisfiable for any non-zero `dampAmp`, and
Adia carries one.** All 16 of reading (b)'s above-100% instances are the Adia brand kit's 16 families
(the single real-world document in the corpus), whose documented `CURVE_OVERRIDE_KEYS` entry sets
`dampAmp: 70` (with `damp: 89`). `Q7`'s ruling deliberately kept the `dampAmp` slot alive and
`chromaEnvelope`'s own comment says the shoulder term "reshapes the shoulders" — pushing a stop's
multiplier above the anchor's is not a bug, it is what a positive `dampAmp` is FOR. Verified with the
plan's own named negative control: `--damp-amp 55` (forcing every corpus instance to `dampAmp: 55`)
drives reading (b)'s above-100% count from 16 to **2920** (all of them) and reading (a)'s from 1793/
1521/2301 to 2418/2407/2307 — the mechanism discriminates correctly in both readings; this is a real,
measured, reproducible property of the shipped engine, not a script bug.

**Root cause of the omission** (named, not excused): Q2's "no longer pass criteria" claim conflated two
different clauses the plan itself keeps separate — the magnitude bar (retired, rev7) and the envelope
table (never retired). The builder built and gated the four ramp-shape criteria and never re-read C6's
own opening sentence closely enough to notice the table was still live.

Options:
- Re-scope C6's envelope table now, in this question, to READING (a) only (the literal "CAM16 chroma at
  stops X over stop 500" text) with an explicit, named Adia `dampAmp` carve-out on the "0 above 100%"
  clause, and loosen the two genuinely-missed p90 targets (perceptual/peak stop 300/700) to the measured
  figures with a citation — the smallest change that makes the criterion honestly satisfiable and keeps
  it checkable
- Treat this as a real defect: dispatch a follow-up unit to bring the emitted-chroma shape (reading a)
  under the numeric targets for the non-Adia corpus, with Adia's `dampAmp:70` as the only named exception
  (Recommended if the owner wants the numeric table enforced as originally worded, not just measured)
- Retire the numeric envelope table entirely in favor of the four ramp-shape gates (the option Q2 wrongly
  assumed rev7 already took), formalizing what the builder actually built as sufficient — but this
  requires an explicit plan revision, not a re-reading of rev7
- Block U3 pending this ruling (not recommended — the four ramp-shape gates are independently correct
  and verified; only the table's pass/fail status and `report-preset-fidelity.mjs`'s exit code depend on
  this ruling, and the script currently exits 1 honestly rather than being silently wired into `npm test`)

`scripts/report-preset-fidelity.mjs --envelope` is NOT wired into `npm test` or any `npm run gate:*`
script pending this ruling — it is a standalone report, exactly matching the plan's own command line,
and its current exit code (1, both readings fail) is accurate to what it measures, not a defect to hide.

### Q7 addendum — reading (a)'s above-100% population broken down (measurement only, no code change)

Team-lead asked whether reading (a)'s much larger above-100% counts (1793/1521/2301, vs reading (b)'s
16-all-Adia) are a concentrated defect or a broad shortfall. Measured directly per instance (which
stops exceed stop 500's own chroma, by how much, and against what palette geometry), scratchpad-only,
not wired into any gate:

**Source split — broad, not Adia-concentrated. Adia's count is fixed at 16 in every mode (matching
reading (b) exactly); the rest is curated corpus, roughly proportional to its share of the whole
corpus (2,896 non-Adia curated instances at source chroma >= 10):**

| mode | flagged | Adia | curated (non-Adia) | default kit | % of the 2,896 non-Adia curated instances |
|---|---|---|---|---|---|
| perceptual | 1793 | 16 | 1772 | 5 | 61.2% |
| peak | 1521 | 16 | 1500 | 5 | 51.8% |
| even | 2301 | 16 | 2278 | 7 | 78.7% |

**Category spread is uniform, not clustered — every one of the 8 categories (+ brands' non-Adia
presets) falls inside a tight band in every mode (per-category flagged/total-at-source-chroma>=10):**
perceptual 55.5%-67.8%, peak 49.5%-55.9%, even 75.9%-83.1%. No single category departs from that band
by more than ~8pp; this is a corpus-wide characteristic, not a hot spot.

**Driven by lift sign and hue cusp tone, NOT by dampAmp or skew:**
- Lift: dominant among flagged instances (lift>0 is 61-75% of the flagged population in every mode;
  lift=0 is only 32-34 instances, ~1-2%); the exceeding stops cluster on the SIDE lift pushes the
  cusp toward — 350/400/450 (light-of-center) in perceptual/even, 550/600/650 (dark-of-center) in
  peak, where 450 alone accounts for 1671-2084 of the flagged instances' exceedances.
- Skew: 98.3-98.6% of flagged instances have `skew: 0` — essentially uncorrelated, rules skew out.
- Cusp tone (the hue's own OKHSL peak-chroma tone, via `peakC`): 70-88% of flagged instances have a
  cusp tone above 60 — hues whose vivid expression sits at a bright tone (yellows, warm greens)
  dominate, consistent with the existing `#668`/cusp-offset family of findings already in this unit's
  record, though this metric (chroma-vs-stop-500 ratio) is distinct from the uptick counter's tone
  monotonicity check and was not cross-verified against it this pass.
- `dampAmp`: every one of the worst-5 instances in perceptual and even mode, and 4 of 5 in peak mode
  (the 5th is Adia's own Warning family), carries `dampAmp: 0` — the extreme outliers are NOT
  damping-driven at all, they come from the underlying lift/cusp-warped chroma curve alone.

**Magnitude — modest at the median, a long tail at the worst:** median excess over stop 500's chroma
is 3.8pp (perceptual), 17.1pp (peak), 12.5pp (even); worst-case is 89.3pp/93.8pp/241.6pp. The extreme
outliers are low-source-chroma palettes (10-19% source chroma, e.g.
`cuisine/Sushi & sashimi · the cypress counter/primary-muted`) at `lift: +38..+40`, where a
near-zero stop-500 denominator amplifies a small absolute chroma difference into a large percentage.

**Distinct palettes vs. instances — roughly half the flagged population is literal duplicates:**
grouping by a full geometry+control shape key (hue/chroma/skew/lift/hueShift/cuspPull +
damp/dampCurve/dampAmp/dampBias/lmin/lmax/curve/tension/hueSpace), only 956/1793 (53.3%, perceptual),
994/1521 (65.3%, peak), and 1096/2301 (47.6%, even) of the flagged instances are unique shapes — the
rest are the same palette archetype reused verbatim across differently-named presets in the corpus.

**Reading:** this is a broad, roughly-uniform-across-the-corpus property of reading (a)'s literal
metric (51-79% of the whole non-Adia curated corpus, depending on mode), not a narrow defect and not
an Adia/dampAmp artifact — dampAmp is essentially irrelevant here (Adia's fixed 16 is a small fraction
of every mode's total, and the worst outliers all have `dampAmp: 0`). It tracks `lift` sign and hue
cusp-tone position, both pre-existing geometry the chroma-envelope unification does not touch. Whether
this predates Design B (this unit's own change) was not measured this pass — every worst-case witness
has `dampAmp: 0`, which is consistent with it being pre-existing, but that is an inference from this
data, not a direct baseline (bf2aaf6) re-measurement; flagging as a gap if the owner wants it closed
before ruling.

### Q7 pass-3 addendum — the root cause fixed for even mode; OKHSL path reverted; median/p90 gaps proven pre-existing

The owner held the C6 bar (no rescope of median/p90/"0 above 100%") and asked for the named root cause
— lift sign x hue-cusp tone — fixed, with a named Adia carve-out on "0 above 100%" specifically.

**The fix (even toneMode path, shipped):** `paletteStops` computes `anchorChroma` — the anchor stop's
own emitted chroma, by the exact same formula the per-stop map uses at stop 500 (relChroma-aware,
tone/hue-aware via `toneAt`/`baseHue`, so it reflects the anchor's OWN lift-displaced position, never
the hue's independent theoretical cusp) — and caps every stop's chroma at it for generated (`dampAmp`
0) palettes: `chroma = Math.min(chroma, anchorChroma)`. At stop 500 itself this is a proven no-op (same
formula, same inputs). `chromaEnvelope`'s own `liftStop`-keyed position math is untouched, as required.
Measured result: `report-preset-fidelity.mjs --envelope`'s even-mode "above 100%" count drops from 2,301
to exactly 16, and every one of the 16 is a named Adia palette — matching reading (b)'s count exactly,
confirming the two readings now agree once the anchor-cap closes the gap reading (a) alone exposed.

Root cause, precisely: even at skew=lift=0, `toneAt(500,...)` is a FIXED midpoint tone independent of
which hue is picked, while a hue's own peak-chroma tone (`peakC(hue).tone`) is hue-specific and need not
sit there — so a non-anchor stop, whose own tone happens to sit closer to that hue's cusp, can have MORE
local gamut headroom (`maxChromaInGamut`) than the anchor even with no lift or skew at all. Confirmed via
the `intensity-legacy` fixture: 7 lift=0/skew=0 default palettes (Secondary, Data 1/4/5/6/7/8) moved
under this fix — the hue-cusp half of "lift sign x hue-cusp tone" standing entirely alone. Lift then
compounds it (the majority of the corpus carries nonzero lift, per the earlier addendum's breakdown).

**The same technique on the OKHSL path (perceptual/peak) — implemented, measured, REVERTED:** an
iterative proportional saturation rescale (`s *= anchorChroma/chroma`, re-measure, repeat up to 8 times,
converges because chroma is locally near-linear in `s` at fixed hue/lightness) closed the SAME gap on
perceptual/peak too (measured before reverting: above-100% count also dropped to 16-all-Adia in those
modes). But it caused two regressions the brief named as explicit stop conditions:
- `hpg-role-contrast`: `perceptual Secondary DARK` dropped to 5.74:1, below its pinned 6.1:1 floor.
- `skew-lift-okhsl` (iii c): 18 NEW synthetic grid cells rose beyond the 21 cited `GRID_R2_EXCEPTIONS`
  (worst +1.5280 L*, well past the shipped R2's own worst of +0.1314 L*).

Both traced to the SAME cause: OKHSL saturation isn't chroma-uniform across lightness (a saturation
value that renders one CAM16 chroma at one lightness can render a different chroma at another), so
rescaling `s` to hit a target chroma is really an implicit tone perturbation too — `tone = lstarFromRgb(
rgb)` shifts slightly at every rescaled stop, which is exactly what both C7's uptick gate and the
contrast floor are sensitive to. Verified by isolating the two fixes (`if (false)` guarding only the
OKHSL rescale, even-path cap left active): the contrast-floor and grid-uptick failures disappear
entirely; only fixture/formula-comparison gates remain (all legitimately re-pinnable, see below). This
is a genuine "second workaround" in the sense the brief warned about — a DIFFERENT technique is needed.
Two candidates were considered and set aside rather than attempted: (1) switching capped stops to the
validated HCT engine directly at the anchor's own chroma+tone instead of staying in OKHSL space — this
would guarantee the bound exactly, but risks reintroducing the Abney hue residual `solveOkhslHue` exists
to close (a few degrees, at the capped stops specifically); (2) recalibrating the OKHSL path's `keyS`
basis at the anchor's own rendered tone instead of the hue's independent cusp tone (the direct OKHSL
analog of the even-path fix) — this reduces the gap's size and likely its frequency, but does not by
itself PROVE the "0 above 100%" bound the way an explicit cap does, since OKHSL saturation still isn't
chroma-uniform across lightness. Reverted byte-for-byte (diffed
against `fa8f072:src/engine/tonal.js`'s `okhslStops` to confirm identity) rather than shipped broken.
Consequence: perceptual/peak's "0 above 100%" clause stays open — 1793/1521 above-100% instances,
unchanged from the pre-pass-3 measurement.

**Collateral fixture/formula-comparison drift from the even-path fix (all re-pinned this pass, none a
floor or uptick regression):** `test/engine/tonal.mjs`'s `damping-curve` (a) independent legacy-formula
check now also caps at the anchor (re-derived independently); `rel-chroma` (b)'s cross-hue harmonization
check now skips stops where the anchor cap fires for either probe hue (a real, expected, disclosed
divergence — the cap is keyed on EACH hue's own `maxc500`, a different absolute number per hue even at
identical chroma%, so it can bind at different stops for two different hues); `intensity-legacy`'s named
carve-out list gained 7 even-mode entries (Secondary, Data 1/4/5/6/7/8) with `tonal-legacy.json`
regenerated to match; two citation lines moved with comment growth. Full diffs in the handoff's pass-3
file list.

**C8 contrast, precise before/after (fa8f072 vs this pass's head, all 96 cells, non-floor-truncated):**
only "even" mode moved (perceptual/peak untouched, as expected — this pass didn't touch those paths);
no cell crossed below 4.5; worst overall ratio after is 4.5130 (even/Tertiary/dark).

| cell | before | after | delta |
|---|---|---|---|
| even/Primary/dark | 4.5104 | 4.5215 | +0.0111 |
| even/Secondary/dark | 5.8367 | 5.8699 | +0.0332 |
| even/Tertiary/dark | 4.5145 | 4.5130 | -0.0014 |
| even/Info/dark | 4.5225 | 4.6780 | +0.1554 |
| even/Success/dark | 5.1852 | 5.1684 | -0.0169 |
| even/Warning/dark | 5.0231 | 5.0314 | +0.0083 |
| even/Danger/dark | 5.1543 | 5.1570 | +0.0027 |
| even/Data 1/light | 5.2342 | 5.2467 | +0.0126 |
| even/Data 2/dark | 5.8765 | 5.8458 | -0.0307 |
| even/Data 4/dark | 5.8562 | 5.8531 | -0.0032 |
| even/Data 5/dark | 5.8518 | 5.8484 | -0.0034 |
| even/Data 6/dark | 5.8526 | 5.8849 | +0.0323 |
| even/Data 7/dark | 5.8380 | 5.8564 | +0.0183 |
| even/Data 8/dark | 5.8757 | 5.8475 | -0.0281 |

The thin-cell ([4.50,4.55)) obligation set (Q6/handoff Risks) is now 4 cells, down from 5: `even|
Tertiary|dark` 4.5130, `even|Primary|dark` 4.5215, `even|Neutral|dark` 4.5280 (unchanged),
`perceptual|Neutral|dark` 4.5327 (unchanged). `even|Info|dark` graduated out (4.5225 -> 4.6780).

**The median/p90 gaps are separately proven PRE-EXISTING, not part of this mechanism:** even after the
anchor-cap fix, several cells still miss their numeric target — `perceptual|300` p90 93.7% (target 90),
`peak|700` p90 97.3% (target 90), `even|100` p90 39.0% (target 35), `even|300` p90 100.0% (target 90),
`even|900` median 40.2%/p90 48.0% (target 25/35). A fresh bf2aaf6 (true pre-U3 baseline) re-measurement,
using the same `--envelope` methodology, shows these are NOT new: `even|900` measured median 40.6%/p90
49.6% at bf2aaf6, essentially identical to today; `even|100` p90 was ALREADY 39.0% at bf2aaf6, an exact
match. Design A/B already substantially IMPROVED some of these (`perceptual|300` p90 122.4% -> 93.7%;
`peak|700` p90 149.9% -> 97.3%) without fully closing them. A lift=0 vs lift!=0 split on `even|900`
shows lift=0's median (43.6%, n=54) is HIGHER than lift!=0's (40.2%, n=2866) — ruling lift out as the
driver for this specific miss. These targets look like they were never actually achievable under the
shipped default `damp`/`dampCurve` controls, for reasons unrelated to lift x hue-cusp; fixing them would
mean retuning the damping curve's own defaults or shape, a different, broader change this pass's brief
did not scope and that risks its own collateral (as the OKHSL-path attempt just demonstrated). Left
open, not patched.

**Options for the owner:**
- Rule the OKHSL-path "0 above 100%" gap and the pre-existing median/p90 gaps as follow-up work (a new
  unit or ticket), and accept even mode's clean fix plus the Adia-carve-out gate as this unit's C6
  contribution — the four ramp-shape gates (C6 i-iii, C7) and the anchor-exactness property are
  unconditionally correct and shipped; only the numeric table's full pass/fail status is still open.
- Direct a further pass at the OKHSL path with a specifically different technique (HCT-engine fallback
  or anchor-tone keyS recalibration, both named above but not attempted) — real effort, not a quick
  patch, given the Abney-drift and unproven-bound concerns already surfaced.
- Direct a further pass at the median/p90 shape itself (damp/dampCurve retuning) — separate scope from
  lift x hue-cusp entirely, would need its own negative controls and its own C7/C8 regression sweep.
- Re-scope C6's numeric table to drop the median/p90 clauses that are proven pre-existing and keep only
  "0 above 100%" (with the Adia carve-out) as the enforced bar — the option this pass's brief explicitly
  ruled out ("no rescope"), listed here only for completeness.

### Q7 pass-4 addendum: the OKHSL anchor cap conflicts with perceptual mode's own design, reverted

Pass 4's brief asked for the OKHSL-path twin of pass 3's even-path anchor cap: for a generated palette
(dampAmp 0) whose emitted chroma at some stop exceeds `anchorChroma` (the anchor's own emitted chroma),
solve jointly for (s, l) holding CIE L* fixed so the capped chroma never exceeds the anchor, falling
back to the HCT engine when the joint solve can't converge. Built across three iterations (plain joint
solve; `CAP_MARGIN` for 8-bit quantization noise; `refineNearestRgb` for a tone-drift-caused contrast
regression), this closed reading (a)'s "0 above 100%" count to exactly 16 (Adia-only) in all three
modes, and cleared `role-contrast`, `skew-lift-okhsl` (with a new named `CAP_L_EXCEPTIONS`),
`shadcn-baseline`, `ac003b`, and `intensity-legacy`. Committed as WIP at `8cfee15`.

**Then a routine full `npm test` run surfaced `engine/tonal.mjs` failing with no visible reason** — all
19 gates this file's own REPORT loop prints showed `pass`, yet the file still exited 1. Tracing it: the
file defines a 20th gate, `hpg-tonal-cusp-pull` (from ticket #55, long predates this plan), whose FAIL
calls are real but whose name was never added to the REPORT loop's printed list — a pre-existing,
unrelated bug, not introduced this pass, that has apparently hidden this gate's status from every
`npm test` run's output since #55. (Separately reportable; not fixed here, since fixing only the print
would not fix the underlying failure, and this addendum is about the failure itself.)

**The underlying failure is real, and it is not a bug in the cap's arithmetic — it is a direct conflict
between C6's "0 above 100%" and perceptual mode's own defining behavior.** `hpg-tonal-cusp-pull` checks
that yellow (hue 75), with `cuspPull` absent/0 (global vibrancy 0, no pull), has its richest (max-chroma)
stop sit LIGHT — away from 500 — because that is where yellow's own gamut cusp is, and perceptual mode
(unlike "peak") is specifically designed to follow each hue's own cusp rather than pin richness to the
anchor. The cap forces every stop's chroma `<= anchorChroma`, so wherever a hue's true cusp differs from
stop 500's own achievable chroma, the cap flattens the ramp down to the anchor and that variation is
gone. This is not a narrow edge case: scanning perceptual mode, dampAmp 0, across the full 16-palette
default kit (role-table.json's 8 core roles plus 8 Data series) shows EVERY SINGLE ONE moves its richest
stop to exactly 500 under the cap, where at pass 3's head (986c032, before this pass's OKHSL change) they
were naturally spread across 350-550 by hue:

| palette | richest stop, 986c032 | richest stop, pass-4 WIP (8cfee15) |
|---|---|---|
| Neutral | 500 | 500 |
| Primary | 450 | 500 |
| Secondary | 400 | 500 |
| Tertiary | 500 | 500 |
| Info | 450 | 500 |
| Success | 400 | 500 |
| Warning | 400 | 500 |
| Danger | 500 | 500 |
| Data 1 | 550 | 500 |
| Data 2 | 500 | 500 |
| Data 3 | 500 | 500 |
| Data 4 | 450 | 500 |
| Data 5 | 400 | 500 |
| Data 6 | 450 | 500 |
| Data 7 | 350 | 500 |
| Data 8 | 450 | 500 |

12 of 16 move; the 4 that stay at 500 (Neutral, Tertiary, Danger, Data 2/3) simply already had their
natural cusp there. Confirmed at bf2aaf6/fa8f072/986c032 all three (pre-U3, and pass 3, agree with each
other; only the pass-4 OKHSL change moves it) via fresh git-archive extractions, not just the worktree.

This is the same lift-sign x hue-cusp-tone mechanism pass 3 diagnosed for the even path, but for
perceptual/peak it collides with a second, older, ratified requirement instead of resolving cleanly:
"peak" mode is SUPPOSED to always center richness at 500 (a pre-existing gate, `okhsl-modes`, confirms
this and still passes), but "perceptual" mode is SUPPOSED to let it float with the hue's own cusp when
cuspPull is low — that is its entire distinction from "peak." Capping every generated stop to the
anchor's own chroma makes perceptual mode behave like peak mode for every hue whose cusp isn't already
at 500, for the WHOLE default kit, not an isolated cell.

**Per the operating rule that a second workaround means the model is wrong: reverted `src/engine/tonal.js`
byte-for-byte to 986c032 (commit `103920c`), dropping the OKHSL anchor cap entirely.** `npm test` is
green again (all 47 files) at the reverted state. This does not touch the even-path cap (986c032, kept,
owner-approved) or anything else from pass 3.

**This needs an owner ruling before any further OKHSL-path "0 above 100%" work, not another patch
attempt**, because the two things in tension are both ratified: C6's anchor ceiling for generated
palettes "in all three tone modes," and perceptual mode's pre-existing, gated, hue-cusp-following
richness (#55). Options:
- Narrow C6's "0 above 100%" ruling to exclude perceptual/peak's cusp-following stops specifically (a
  rescope the brief said not to do, but the conflict is structural, not a numeric near-miss).
- Rule that `hpg-tonal-cusp-pull` is superseded by C6 for generated palettes and update/retire that gate
  (a product-visible loss: perceptual mode's richness-follows-hue-cusp behavior goes away for every
  dampAmp-0 palette, not just yellow).
- Scope "0 above 100%" to the even path only (already shipped, pass 3) and treat perceptual/peak's count
  (currently ~1793/1521, all pre-existing per the earlier breakdown) as a separate, explicitly descoped
  finding for this unit, closing U3's OKHSL obligation as "not achievable without breaking a second
  ratified gate," reported rather than patched.
- Direct a fundamentally different mechanism (not attempted): instead of an absolute chroma ceiling keyed
  to the anchor's OWN emitted value, a ceiling keyed to each stop's OWN gamut headroom RELATIVE to the
  hue's cusp — closer to how `relChroma` mode already normalizes per-stop, but this has not been designed
  or measured and is real new work, not a quick fix.

### Q7 pass-5 addendum: peak capped and gated (step 1, done); perceptual's one-stop exemption measured and NOT built (step 2, stop condition fired as the brief predicted)

**Ruling received (owner, via team-lead, 2026-09-19):** cap even (already shipped, pass 3) and peak at
the anchor's own chroma for generated palettes (dampAmp 0); perceptual keeps `hpg-tonal-cusp-pull`'s
(#55) richness untouched, with a named, bounded, ONE-STOP exemption for the cusp stop only, gated with
a frozen bound and a negative control; median/p90 still applies to all three modes.

**Step 1 (peak cap): done, gated, measured, committed at `8160d33`.** Restored pass 4's joint (s, l)
solve (tone held fixed, `CAP_MARGIN`, `refineNearestRgb`, `CAP_L_EXCEPTIONS`) exactly as built, scoped
to `mode === "peak"` only this time. Peak's "0 above 100%" count closes to exactly the 16 named Adia
palettes (confirmed via `report-preset-fidelity.mjs --envelope`). Perceptual is untouched: its
per-hue richest-stop distribution across the full 16-palette default kit is byte-identical to pass 3's
head (986c032) — `hpg-tonal-cusp-pull` and `hpg-tonal-okhsl-modes` both stay green. The `chroma-envelope`
gate's (C6 iii) above-100%/Adia-carve-out/negative-control check now runs for both even and peak.
C8, full 96 cells: 8 moved, all in peak mode, max `|delta|` 0.0091:

| cell | before (b49b47f) | after (8160d33) | delta |
|---|---|---|---|
| peak/Primary/dark | 4.6253 | 4.6275 | +0.0022 |
| peak/Secondary/light | 11.5512 | 11.5603 | +0.0091 |
| peak/Tertiary/dark | 5.5770 | 5.5765 | -0.0005 |
| peak/Info/dark | 7.7182 | 7.7164 | -0.0018 |
| peak/Warning/dark | 7.5156 | 7.5150 | -0.0006 |
| peak/Data 5/light | 12.8163 | 12.8165 | +0.0001 |
| peak/Data 6/light | 11.6401 | 11.6392 | -0.0009 |
| peak/Data 7/light | 11.8825 | 11.8823 | -0.0002 |

No cell crossed the 4.5 floor. Worst cell overall is unchanged: `even/Tertiary/dark` 4.5130 (a pass-3
figure, not touched by this pass). Thin `[4.50, 4.55)` cells: perceptual `Neutral/dark` 4.5327; even
`Neutral/dark` 4.5280, `Primary/dark` 4.5215, `Tertiary/dark` 4.5130; peak has none.

**Step 2 (perceptual's one-stop cusp exemption): measured first, as the brief required, and the
one-stop premise does not survive contact with the corpus.** Scanning all generated (dampAmp 0)
perceptual palettes across the full curated corpus (343 presets), counting stops whose emitted chroma
exceeds stop 500's own:

| stops over anchor | palette count |
|---|---|
| 0 | 1557 |
| 1 | 538 |
| 2 | 778 |
| 3 | 695 |
| 4 | 171 |
| 5 | 25 |

Of the 2,207 palettes with at least one above-anchor stop, only 538 (24.4%) have exactly one — the
scenario the ruling's "one exempted cusp stop" describes cleanly. The other 1,669 (75.6%) have 2-5
ADJACENT stops clustered around the cusp, because the cusp isn't a single point, it's a shoulder: the
hue's true peak-chroma tone sits between two stops, and both (often several) read above the anchor
together.

**Worst example (max measured excess in the corpus):** "Sushi & sashimi (the cypress counter)" /
primary-muted, hue 16, lift 40 (perceptual, dampAmp 0). The rendered ramp's chroma as % of stop 500's
35.86:

| stop | chroma | % of 500 |
|---|---|---|
| 500 (anchor) | 35.86 | 100.0% |
| 550 | 48.80 | 136.1% OVER |
| 600 | 64.45 | 179.7% OVER |
| **650 (true cusp)** | **67.88** | **189.3% OVER** |
| 700 | 50.19 | 140.0% OVER |
| 750 | 30.43 | 84.9% |

If every non-cusp stop were capped to the anchor (35.86) and only stop 650 exempted, the ramp would
read 35.86 (500) -> 35.86 (550, was 48.80) -> 35.86 (600, was 64.45) -> **67.88 (650, exempted, nearly
double its capped neighbours)** -> 35.86 (700, was 50.19) -> 30.43 (750, untouched, already under). That
is a lone chroma spike by construction, not a graceful one-stop exception — exactly the shape defect the
brief's own stop condition named in advance ("likely when the cusp sits at 350-450" — this example's
cusp sits even further out, at 650, making the spike worse, not better).

**A second, milder example for contrast** (The Barbican Estate / warning, hue 73, lift 5): stops 350/
400/450 read 101.2%/105.7%/104.2% of stop 500 (49.32). Even here, with only ~2-6% excess and 3 adjacent
over-anchor stops, there is no principled way to pick ONE "the cusp stop" among three nearly-equal
candidates without an arbitrary tie-break, and whichever is picked, its immediate neighbours still drop
by several units while it alone stays elevated.

**Per the brief's own instruction for this exact scenario ("stop... write the measurement... report...
do not invent a third mechanism"), step 2 is NOT built.** No gate, no cap, no third technique attempted.
The (C6 iii) even/peak gate is unchanged in shape; a comment in its place documents why perceptual has
no equivalent check this pass. `npm test` stays green at `8160d33` with perceptual completely untouched
from pass 3.

**Step 3 (median/p90 retune) not started.** It is nominally independent of step 2's outcome, but
retuning `damp`/`dampCurve` now, before the owner decides how (or whether) to close perceptual's "0
above 100%" clause, risks the retune's own C7/C8 sweep needing to be redone once that decision lands —
so it is held pending the owner's read of this addendum, rather than run and possibly discarded.

**Options for the owner, now that the one-stop premise has failed measurement:**
- Rule perceptual's C6 clause as "no NEW above-100% instances beyond what the corpus already has" (a
  no-regression bar) rather than "0 above 100% minus one cusp stop" — matches what's actually
  achievable without a spike, but is a real rescope of the numeric target, not the shape gates.
  Widening the exemption from "1 stop" to "the natural cusp cluster, however wide" (i.e. exempt every
  CONSECUTIVE run of above-anchor stops as one unit, not each stop individually) instead of a strict
  one-stop count — this preserves cusp-pull's natural shoulder shape without a spike, but needs its own
  gate design and negative controls (new work, not attempted).
- Accept perceptual's "0 above 100%" as permanently open for generated palettes and scope C6's held bar
  to even + peak only, with perceptual's count (1793, unchanged since Q7's first breakdown) reported as
  a known, explained, unfixable-without-a-spike gap.
- Direct the fundamentally different mechanism named in the pass-4 addendum (a per-stop ceiling keyed to
  gamut headroom relative to the cusp, not an absolute anchor-chroma ceiling) — real new design work.

### Q7 pass-5 note: the cusp-stop bound, measured explicitly and fresh (team-lead follow-up)

Team-lead flagged that the 89.3pp/93.8pp/241.6pp figures already in the plan's U3 paragraph predate
rev 19's cusp-stop-only scoping and must not be copied in as the frozen bound without a fresh,
cusp-stop-scoped measurement. Re-measured explicitly: CUSP STOP := the richest (max chroma) stop of
each generated (dampAmp 0) perceptual palette's rendered ramp (rendered path, `T.STOPS`, current head
`a28fa18`); cusp-stop excess := `cuspChroma/c500 - 1`, counted only where the cusp stop itself exceeds
the anchor. Since chroma is monotonic in excess ratio at a fixed `c500`, the richest stop always carries
the MAX excess among that palette's own above-anchor stops, so this is the same quantity as "this
palette's worst above-anchor exceedance," just scoped and named per the ruling's own language rather
than the general population.

2,207 palettes are cusp-exempt-eligible (their cusp stop exceeds the anchor); the corpus-wide max is
**89.3005pp**, at the same witness as before (`cuisine/Sushi & sashimi · the cypress counter/
primary-muted`, cusp stop 650, 67.88 vs anchor 35.86). This CONFIRMS the earlier 89.3pp figure fresh,
on the current rendered path, under the explicit cusp-stop-only definition — it was not stale after
all, just under-labeled. If a bound is frozen into a gate, 89.3005pp (perceptual) is the correct,
freshly-verified number.

**This does not by itself resolve step 2's blocker.** The bound answers "how far over may the cusp
stop go"; it does not answer "what happens to the 1,669 palettes (76% of the violating population)
whose natural cusp SHOULDER spans 2-5 adjacent stops, not one" — capping all-but-one of those down to
the anchor still produces the spike measured in the prior addendum regardless of which single number
bounds the one stop left exempt. Reported to team-lead; still awaiting a ruling on the multi-stop
shoulder before building anything.

### Q7 pass-6 addendum: step 2 (median/p90 retune) blocked, two configurations both produced a C7 uptick

Step 1 (peak's cusp-run gate, ruling (f)) shipped clean at `f45f9b2` (no engine change, `src/engine/
tonal.js` byte-identical to `d5c09c3`). Step 2 (retune `damp`/`dampCurve` until every median/p90 cell of
`--envelope` passes in all three modes) is NOT shipped: two different candidate retunes both produced a
genuine C6(i) CIELAB-L* uptick — a named stop condition — and per the brief ("if one fires, revert that
step byte-for-byte, keep step 1, record it in Q7 and report") this is reverted rather than patched a
third time.

**Diagnosis, why a retune is needed at all:** at the shipped `damp:70/dampCurve:1.5` (VIVID_MIDS,
`scripts/gen-categories.mjs`, matching `DEFAULT_CONTROLS`/`DOMAINS`), 5 cells fail: perceptual|300 p90
93.7% (target <=90), peak|700 p90 96.1% (<=90), even|100 p90 39.0% (<=35), even|300 p90 100.0% (<=90),
even|900 median 40.2%/p90 48.0% (<=25/<=35). even|300's p90 is STUCK at exactly 100.0% across every
`damp` value tried at `dampCurve` held at 1.5 (75 through 100): it is the even path's own anchor cap
(pass 3) itself, a hard population of stops landing AT the cap regardless of how much the *old* curve
shape damps elsewhere — only lowering `dampCurve` (concentrating damping closer to the anchor: `uG =
|sd|^dampCurve` rises far faster for small `|sd|` at a lower exponent) pulls enough of that population
under the cap to move p90 off 100%.

**Attempt 1: `damp:92, dampCurve:0.5` (the domain floor), `dampBias:0`.** Closed the full `--envelope`
table cleanly in a fast iteration harness (rendered-path only, matching the gate's own math) with real
margin on every cell (worst: even|900 p90 32.4% vs the 35% target) and a comfortable perceptual cusp
excess (0%, well under the 189.3005% frozen bound). Applied to the real generator + engine defaults,
regenerated, and ran `test/engine/tonal.mjs` directly (its own exit code, since the `hpg-tonal-cusp-pull`
gate's name is missing from this file's print list, #695): FAIL, `(C6 i) perceptual: 2 rise(s), e.g.
19-stop hue 267 chroma 100.00 skew -20 lift 0: stop 500->550 (26.4403 -> 26.6493)` — the default kit's
own "Neutral" palette (hue 267, skew -20, lift 0), a genuine CIELAB-L* RISE between stops 500 and 550 in
perceptual mode. This is the same class of defect #668/R1/R2 exists to prevent ("damping travelling to
where the lightness is not"): `dampCurve` at its domain floor is a substantial departure from 1.5, which
the removed comment on `DEFAULT_CONTROLS` noted was chosen to "reproduce the legacy edge damp exactly" —
a safety property this abandons.

**Attempt 2: `damp:98, dampCurve:0.65, dampBias:0`, a milder departure from 1.5.** Also cleared the fast
harness with margin (worst: even|900 p90 31.7%). Applied and regenerated: `test/engine/tonal.mjs` again
FAILs, this time `(C6 i) peak: 12 rise(s), e.g. 19-stop hue 110 chroma 100.00 skew 0 lift 22: stop
450->500 (97.6484 -> 97.7490)` — a DIFFERENT witness, different mode (peak, not perceptual), different
mechanism trigger (lift 22, not skew -20), but the same C7 class of defect. (Separately, at this
configuration `--envelope` reading (b)'s stop-100 p90 also missed by 0.5pp — a real but far smaller
problem than the uptick, not itself the reason this was reverted.)

**Two different, otherwise-passing configurations from the SAME sanctioned parameter family (damp +
lowered dampCurve) both reintroduced a real, different C7 uptick.** This reads as a structural property
of that family, not a one-off tuning miss: `dampCurve` needs to drop well below 1.5 to close even|300's
p90 ceiling, and that same drop is what makes the damping curve steep enough, close enough to the
anchor, to fight skew's/lift's own gamma warping somewhere in the corpus's lift/skew range — the
literal #668 mechanism. Per "if a second workaround is needed, stop," this was not attempted a third
time. Reverted `scripts/gen-categories.mjs`, `src/engine/tonal.js`, `src/ui/persist.js` and the 8
regenerated `src/ui/categories/*.js` files byte-for-byte to `f45f9b2` (step 1's head); kept a genuinely
independent fix (the reading (b) Adia carve-out in `scripts/report-preset-fidelity.mjs`, a reporting-only
change unrelated to the retune). `npm test` 47/47, tree clean, citations STALE 0, `gate:corpus-contrast`
green at the reverted head.

**Options for the owner:**
- Rule the median/p90 misses (proven pre-existing at `bf2aaf6`, not lift-driven — Q7's pass-3 addendum)
  as accepted, closing C6's numeric table with only step 1's ramp-shape/cusp-run clauses enforced, and
  route the retune to a follow-up unit with its own #668-style diagnosis budget (a NEW damping mechanism,
  not a parameter retune of the current one, may be needed to close even|300/900 without an upticks
  trade-off).
- Direct a narrower retune SCOPED to exclude whichever `dampCurve` range triggers the uptick — this
  needs the uptick's own root cause understood (which corpus lift/skew combinations are unsafe at low
  `dampCurve`, and why), not just avoided by trial; real diagnosis work, not attempted this pass.
- Accept a PARTIAL retune that only touches even mode's `dampCurve` (the mode whose p90 ceiling is the
  actual driver) while leaving perceptual/peak on the current shape, if that narrower change can be
  shown not to trigger the same uptick class — not measured this pass, since VIVID_MIDS/DEFAULT_CONTROLS
  apply one damp/dampCurve pair across all three modes together, not per-mode.

### Q7 pass-6 note: the cusp-run bound is frozen at the exact 189.3005%, not rounded (team-lead follow-up)

Plan revision 20 (`6c55f25`) froze ruling (f)'s bound at the fresh cusp-stop measurement itself,
189.3005% exactly, not a rounded-up 189.31%. `CUSP_RUN_BOUND` in `test/engine/tonal.mjs`'s (C6 iii-b)
gate and `scripts/report-preset-fidelity.mjs`'s reporting copy both updated to `1.893005`; the witness
(measured ratio `1.8930048002074109`) still clears the exact bound. All references to "189.31%" earlier
in this record and in the handoff are corrected to the exact figure.
