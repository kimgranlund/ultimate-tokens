---
kind: note
plan: preset-intent-fidelity
unit: U3
date: 2026-09-18
status: RESOLVED (2026-09-18): 89, not 92, confirmed by the reviewer
---

## RESOLUTION

The reviewer withdrew the 92 figure: it came from multiplying the 25-stop peak count (46) by two stop
sets instead of summing the true per-stop-set counts (43 on 19-stop + 46 on 25-stop = 89). Re-measured
against this unit's shipped head with the actual gate code (GATECOUNTER): `perceptual=22 peak=89
even=0`, matching every figure below. The gate comments and handoff were left correctly stating 22/89
throughout (no change needed there); the follow-up fix was a QUALIFIER, not a number change, see
`test/engine/tonal.mjs`'s `chroma-envelope` header comment and `.sdlc/handoffs/pif-u3.md`'s C6-i row,
both now spelling out that "11 perceptual / 46 peak" is a 25-stop-ramp AFFECTED-PALETTE count while the
gate's own `upticks` counters sum both stop sets to 22/89.

# U3 re-review fix 3 (superseded by the resolution above): cannot reproduce "22 and 92"

The re-review of head `c5a5be3` asked for a gate comment fix: "the uptick counter prints 11 and 46;
it prints 22 and 92." Fixes 1 (wording) and 2 (tone range) are applied at head `441de00`. This one is
not applied because I could not reproduce it after four independent attempts.

## What was checked

Pointed at a FRESH `git archive 362cc48` extraction (re-extracted specifically to rule out
contamination from earlier scratch work), all against the corpus the product renders
(`rampChromaOf` + `hueShift`/`hueSameDir`/`cuspPull`, matching `src/ui/model.mjs`'s `projectView`):

1. My original scratch script (`render.mjs`), counting per (ramp, stop-set) instance.
2. A line-for-line reproduction of the actual `check()` function shipped in
   `test/engine/tonal.mjs`'s `chroma-envelope` gate, run standalone against the base engine.
3. Counting individual rising transitions instead of ramps-with-any-rise (no difference found: every
   affected ramp in this corpus has exactly one rising transition).
4. Isolating the 16 role-table defaults from the 343 curated presets (defaults contribute 0 upticks in
   every run; presets alone give the full count).

All four give the same result: **perceptual 11 on each stop set (22 combined), peak 43 on 19-stop / 46
on 25-stop (89 combined)**. This matches:

- The original pass-1 builder's own report.
- The pass-1 reviewer's independent citation (`19-stop hue... 43`, `25-stop hue... 46`).
- The plan document itself, `.sdlc/plans/preset-intent-fidelity.md` line 203 (written before this
  unit was dispatched): "the #668 class (11 palettes in perceptual and 46 in peak on the 25-stop
  ramp, 43 on the 19-stop, on bf2aaf6 before R1, 0 in even)".

Three independent sources predating my involvement, plus my own four-method re-derivation, all agree
on 11/46/43. I did not find a path to 92 for peak, and 22 for perceptual already matches exactly.

## What I need

The exact command or script used to get 92, so I can either find the real discrepancy (a corpus or
engine difference I'm missing) or confirm 89 is correct and this part of the re-review instruction was
itself in error. Left the gate comment at "11 perceptual / 46 peak" (the plan's own citation style)
rather than write an unverified number.
