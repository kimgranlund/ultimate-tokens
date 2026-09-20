---
kind: question
unit: pif-u4-integration (plan preset-intent-fidelity, ticket #681, unit U4)
written: 2026-09-19
updated: 2026-09-20 (pass 2 second round, addenda 1+2 applied)
status: open (Q7, Q8 only - Q1-Q6 all resolved)
---

# U4 integration: items needing an owner decision

Full measurement detail for every item below is in `.sdlc/handoffs/pif-u4.md` (this unit's report).
Pass 2 (first round) fixed the review's two FIX-FIRST findings (F1, F2) and Finding A at the
construction (old Q2, below, resolved and closed as a record). Q4 is also resolved: #668 is closed, its
finding moved to the handoff. Pass 2's second round applied team-lead's two addenda: addendum 1 ruled
that Q1, Q3, Q5 settle by standing rule (`.sdlc/questions/standing-rulings-2026-09-20.md`,
`plan/records-followup` at `376d6c57`) rather than going to the owner, and all three are now RESOLVED
below, each with its derivation and citation. Addendum 2 (the missing-anchor bug in several #681
allow-list gates) is applied throughout and is fully closed for its 5 named targets (findDips,
DIP_BASELINE, EVEN_DIP_BASELINE, the lone-spike allow-list + default kit + Data 7,
report-preset-fidelity.mjs) - see the handoff's "Pass 2, second round" section for the numbers. It also
surfaced two NEW findings that genuinely need an owner decision, not a mechanical fix: **Q7 and Q8**,
added below. This file states each open question plainly with its options; the owner's answer comes
back through team-lead, per the brief.

## Q1 (RESOLVED, standing rule) - C4's non-anchored identity control: reconciled to U6's real scope

**Settled by standing rule** (`.sdlc/questions/standing-rulings-2026-09-20.md`, `plan/records-followup`
at `376d6c57`), addendum 1: reconcile C4 to U6's real scope, permitted now that `referenceNonAnchored`
is repaired (it was, pass 2 round 1 - see F1/item 2 in the handoff).

**Reconciliation applied.** `referenceNonAnchored` is a correct, independent reimplementation of the
RETIRED pre-#681 OKHSL-domain ladder. U6's rebuild replaced the non-anchored construction outright (CIE
L* metric, held CAM16 chroma, equal-compress) - not just the anchor branch - so "primeSwatches with the
anchor stripped stays byte-identical to the pre-#681 reference" is no longer the right invariant; it was
written against U1's narrower scope, before U6's sibling-unit work fully replaced the base ladder.

`test/engine/anchor.mjs`'s `prime-identity-control` gate is rewritten to assert the CORRECT invariant
instead of just reporting the old one as an open finding: every one of the 3,796 control subjects
(3,780 corpus + 16 default kit) must differ from the retired reference (a TOTAL, uniform migration), and
the gate reds if any subject still matches it (a partial, inconsistent migration - a real defect, since
it would mean some code path never got the U6 rebuild) or if the differing count is anything other than
the full 3,796. Measured: **0 exact, 3,796 off - the gate now asserts this directly and passes.** The
independent, CURRENT-construction correctness check (does the new equal-compress ladder itself behave
correctly) is `test/engine/prime.mjs`'s own 20 gates, unaffected by this reconciliation.

`npm test` is green on this gate.

## Q2 (RESOLVED pass 2) - the F1-widening-search gap for out-of-window anchors: fixed at the construction

**Closed as a record, not an open question.** Per the brief's owner-facing stop rule ("port a widening
step... or STOP and report costs"), pass 2 determined the port was possible without inventing
construction the plan doesn't describe: `src/engine/prime.mjs`'s `primeSwatches` gained an F1-style
widening search, ported from U1's own pre-U6 OKHSL widening loop (commit `7bda1d7e`) into the CIE-L*/
equal-compress domain. The pivot widens symmetrically (both sides move together, preserving
equal-compress's own "up === down" invariant, unlike the old per-side redistribute rule this replaces)
until the six ladder rungs are distinct, capped at a full `STEP_L` of reserve per side - option 1 from
the original Q2, applied. `sixMono` now holds unconditionally again (0/3,380 exceptions, no allow-list,
matching its original documented invariant). `ORDER_ALLOW`/`DUPE_ALLOW` re-measured and re-frozen by
name: **26 (was 23 pre-#681, 21 mid-pass-1-before-the-fix) / 3 (was 4 pre-#681, 26
mid-pass-1-before-the-fix)**. Full detail: handoff §7.4/"Pass 2" section.

## Q3 (RESOLVED, standing rule) - `NOTCH_ALLOW`: 78 -> 15, the 63 departures named with cause

**Settled by standing rule** (`.sdlc/questions/standing-rulings-2026-09-20.md`, `plan/records-followup`
at `376d6c57`), addendum 1: accept the integration-head measurement (15) only where every moved name has
a cited mechanism and a count gate. Both conditions are now met.

**Re-measured directly** (bypassing the test file's own `FAIL()` group-dedup, which only ever shows the
first message per group): the current integration head's real notch population is **15** (all even
mode; perceptual and peak both read 0), a CLEAN SUBSET of the original 78-entry `NOTCH_ALLOW` (0 new/
unexpected members; all 63 departures are pure removals - verified by direct set difference between the
old 78-name list and the newly measured 15).

**Cited mechanism (one, for all 63):** commit `2573208c` "re-centre chromaEnvelope on the anchor's own
lifted reading" (#681 U3 review pass 2, R2) - already the basis this same file's `KNOWN_BASELINE_DUP`
and `test/engine/tonal.mjs`'s `EVEN_DIP_BASELINE` comments cite for U3's shipped chromaEnvelope shape.
R2 keyed the envelope's position on `liftStop(stop,lift) - liftStop(anchorStop,lift)` (the anchor's own
LIFTED reading) instead of the raw numeric anchor stop, so `env(anchorStop) = 1` exactly under any lift;
the pre-U3 construction the original 78-count was measured against could sit off-pivot under a nonzero
lift and read a visible ratio+absolute notch there. This fix reached the integration head via the U3
merge (`ed14832b`, "integrate U3 anchor-centred chroma envelope, all modes") BEFORE this U4 pass
started - the 63 departures are inherited from that merge, not a side effect of any U4 fix (Finding A/
prime.mjs's widening search touches a different, non-anchored code path and does not affect
`anchorChromaBasis`/`chromaEnvelope` at all).

**Count gate:** `NOTCH_ALLOW` re-frozen to the current 15 names, `test/engine/anchor.mjs`'s own
sorted-array comparator (`allowListMatches`) plus its existing drop/swap negative controls.

**The 63 departed names** (all present in the old 78-entry list, none in the current 15):

- architecture "Bankside / Tate Modern · 1947, conv. 2000 · London" tertiary #888781 [even]
- architecture "Boston City Hall · 1968 · Kallmann McKinnell & Knowles" secondary #888781 [even]
- architecture "Charleston single house · antebellum vernacular · South Carolina" primary #DDDBD7 [even]
- architecture "Falu-red farmstead · Swedish vernacular · Dalarna" tertiary-muted #DDDBD7 [even]
- architecture "Lancashire cotton mill · 19th c · northern England" primary-muted #8C9094 [perceptual]
- architecture "Narkomfin Building · 1930 · Ginzburg · Moscow" secondary #8E8D87 [even]
- architecture "New England saltbox · colonial vernacular · coastal Massachusetts" secondary-muted #83878B [peak]
- architecture "New England saltbox · colonial vernacular · coastal Massachusetts" tertiary-muted #DDDBD7 [even]
- architecture "Sydney Opera House · 1973 · Jørn Utzon" tertiary-muted #9A8C88 [even]
- architecture "The Taj Mahal · 1648 · Agra · at dawn" secondary #DDCECA [even]
- architecture "Zollverein Coal Mine · 1932 · Schupp & Kremmer · Essen, Germany" primary-muted #8C9094 [perceptual]
- cuisine "Caramel & toffee · the confection pan" primary #DDDBD6 [even]
- cuisine "Día de Muertos table · the ofrenda" tertiary-muted #DDDBD6 [even]
- cuisine "Espresso · the café counter" tertiary-muted #DDDBD6 [even]
- cuisine "Sushi & sashimi · the cypress counter" secondary #DAD8D2 [even]
- film "Hero · 2002 · dir. Zhang Yimou · the red courtyard duel" primary #DAD8D2 [even]
- film "Raise the Red Lantern · 1991 · dir. Zhang Yimou · the courtyard at night" secondary #83878B [peak]
- film "The Night of the Hunter · 1955 · dir. Charles Laughton · the river drift" secondary-muted #9FA2A6 [perceptual]
- film "The Red Shoes · 1948 · dir. Powell & Pressburger · the ballet" primary #DAD8D2 [even]
- film "The Third Man · 1949 · dir. Carol Reed · the wet Vienna cobbles at night" tertiary-muted #8C9093 [peak]
- film "The Third Man · 1949 · dir. Carol Reed · the wet Vienna cobbles at night" tertiary-muted #8C9093 [perceptual]
- film "The Witch · 2015 · dir. Eggers · the farm at the wood's edge" secondary #8B9194 [perceptual]
- film "Touch of Evil · 1958 · dir. Orson Welles · the border-town night" tertiary #707276 [perceptual]
- film "Touch of Evil · 1958 · dir. Orson Welles · the border-town night" tertiary-muted #DDDBD7 [even]
- literature "Alice's Adventures in Wonderland · Carroll, ill. Tenniel · 1865" tertiary #DDDBD7 [even]
- literature "Death of a Salesman · Arthur Miller · 1949 · the Loman house" tertiary-muted #777B81 [peak]
- literature "Death of a Salesman · Arthur Miller · 1949 · the Loman house" tertiary-muted #777B81 [perceptual]
- literature "Mistborn · Brandon Sanderson · 2006 · the ash-fall Final Empire" secondary #82817D [even]
- literature "Mrs Dalloway · Virginia Woolf · 1925 · a June morning in Westminster" secondary-muted #8C9095 [peak]
- literature "The Catcher in the Rye · Salinger · 1951 · winter New York" secondary #777B80 [peak]
- literature "The Catcher in the Rye · Salinger · 1951 · winter New York" secondary #777B80 [perceptual]
- literature "The Handmaid's Tale · Atwood · 1985 · Gilead" primary #DAD8D2 [even]
- literature "The Handmaid's Tale · Atwood · 1985 · Gilead" secondary-muted #74797E [perceptual]
- literature "The Makioka Sisters · Tanizaki · 1948 · the Kyoto cherry-viewing" primary-muted #A6A5A0 [even]
- literature "The Road · Cormac McCarthy · 2006 · the ash-grey wasteland" secondary #7C7B77 [even]
- literature "War and Peace · Tolstoy · 1869 · the winter ballroom & the retreat" secondary-muted #8C9094 [perceptual]
- music "Doom & stoner · the amp-fuzz haze" secondary-muted #28262C [even]
- music "Doom & stoner · the amp-fuzz haze" tertiary-muted #7C7982 [even]
- music "Golden-age NYC · the boom-bap sleeve" secondary #777B80 [peak]
- music "Golden-age NYC · the boom-bap sleeve" secondary #777B80 [perceptual]
- music "Gospel · the church choir" primary-muted #DDDBD7 [even]
- music "Mod & British Invasion · the op-art club" tertiary-muted #DDDBD7 [even]
- music "New Orleans brass · the street parade" secondary-muted #DAD8D2 [even]
- music "Riot grrrl · the zine collage" tertiary #D0CEC9 [even]
- music "The orchestra · the concert platform" tertiary-muted #DDDBD7 [even]
- music "UK '77 · the ransom-note sleeve" secondary-muted #707276 [perceptual]
- music "UK '77 · the ransom-note sleeve" tertiary-muted #C3C1BC [even]
- nature "0° · June · 11:00 · Congo Basin lowland forest, Odzala, Republic of the Congo" tertiary-muted #5C5E63 [perceptual]
- nature "43° S · February · 18:00 · Aoraki / Mount Cook, Southern Alps, New Zealand" tertiary-muted #7F848A [perceptual]
- nature "49° N · October · 15:00 · Boreal shield, northern Ontario, Canada" secondary-muted #988984 [even]
- nature "51° S · November · 07:00 · Torres del Paine, Patagonian Andes, Chile" secondary-muted #978985 [even]
- nature "78° N · July · 14:00 · Spitsbergen interior, Svalbard" secondary #83878B [peak]
- travel "17° N · November · 22:00 · An Oaxacan village cemetery on the first night of Día de los Muertos" tertiary-muted #636665 [peak]
- travel "17° N · November · 22:00 · An Oaxacan village cemetery on the first night of Día de los Muertos" tertiary-muted #636665 [perceptual]
- travel "23° S · December · 16:20 · Salar de Atacama, 2,305 m" secondary #EBEAE6 [even]
- travel "26° N · June · 18:30 · The shrine of Lal Shahbaz Qalandar, Sehwan, at the evening dhamaal" tertiary-muted #BCBBB8 [even]
- travel "30° N · March · 16:00 · Wadi Rum, the Jebel Khazali wall in late afternoon" tertiary-muted #AC9D99 [even]
- travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" primary-muted #D0CEC9 [even]
- travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" secondary-muted #82817E [even]
- travel "30° N · May · 06:00 · Atchafalaya basin cypress slough, sunrise from a flat-bottom boat" tertiary #C4ABA7 [even]
- travel "38° N · July · 11:00 · Point Reyes peninsula, California, the marine layer locked in for the third week" secondary #D0CEC9 [even]
- travel "41° N · July · 20:30 · The Great Salt Lake at sunset, near Antelope Island causeway" tertiary-muted #413538 [even]
- travel "47° N · June · 10:00 · St. John's harbour, dense Atlantic fog" secondary #D0CEC9 [even]

`npm test` is green on this gate.

## Q4 (RESOLVED pass 2) - #668: negative control was run against the wrong corpus; #668 is CLOSED

**Closed as a record, not an open question.** The pass-1 negative control paired the pre-#681 engine
(`bf2aaf6`) with the post-#681, regenerated (`dampAmp: 0`) category files - an engine/corpus version
skew, the same fault class as the lone-spike bisection (owner ruling, below). Re-run against `bf2aaf6`'s
OWN committed category files (`git worktree add --detach`, no `git stash`): the control reproduces the
addendum's stated baseline exactly - `{"display19":{"perceptual":11,"even":0,"peak":43},
"export25":{"perceptual":11,"even":0,"peak":46}}`, first witness on both stop sets `film "Touch of Evil"
secondary, stop 750->800`, the exact witness pass 1 tested against the wrong corpus. Integration head:
0/0/0/0/0/0, unchanged. **#668 is CLOSED.** PR body line corrected to "Closes #681, closes #686, closes
#668." Full detail: handoff §10.

## Owner ruling recorded verbatim (applied pass 2, dated 2026-09-20)

"Name the 64 and gate the count; fix joins #701 (Recommended)"

Applied to `test/engine/anchor.mjs`'s `anchor-ramp lone-spike` gate: now a named, counted allow-list
(`LONE_SPIKE_ALLOW`, 64 entries, all stop 500, same treatment as `NOTCH_ALLOW` - sorted-array
comparison plus drop/swap negative controls), with the mechanism cited in the file's own comment
(`dampAmp` 55 -> 0 at U3's asset regeneration `7d659ae5` leaves stops 450/550 achromatic beside U2's
anchor pass-through at stop 500; witness architecture "Komsomolskaya Station" tertiary `#346190`). The
even-mode neighbourhood-chroma fix joins ticket #701, not this unit. Gate now passes:
`anchor-ramp lone-spike allow-list: 64 (expected 64)`. Full root-cause bisection: handoff §7.6.

## Q5 (RESOLVED, standing rule) - two witness re-pins, properly derived

**Settled by standing rule** (`.sdlc/questions/standing-rulings-2026-09-20.md`, `plan/records-followup`
at `376d6c57`), addendum 1: derive the two re-pins properly, not deferred - "a re-pin counts only if the
verifier can reproduce it." Both are now derived and applied, with a reproducible method cited in each
fix's own code comment.

**`hue-solver-best`'s STAIRCASE cell.** Neutral/perceptual's own current internal (s, l) at stop 500
moved again on this integration head (`keyS` moved; `l500` did not, matching the same shape U3's own
repin note describes) - and the NEW (s, l) no longer discriminates: instrumented `okhslStops`'s own
`hOk = solveOkhslHue(palette.hue, s500, l500)` call directly to read back the real internal values, ran
both the old buggy rule and `solveOkhslHue` against them, and both now read back the SAME hue (268 deg,
error 0.4287 deg) - not a solver regression, just this particular staircase tread landing on the same
value both ways now. Scanned the full default kit (16 palettes x {perceptual, peak}, same instrumentation
method) for a real, currently-discriminating, wide-margin replacement: **Data 2/peak** (old rule's last
iterate: 325.913 deg, error 0.2603 deg; `solveOkhslHue`'s best iterate: 326 deg exactly, error 0.0269
deg - a wide, robust margin, unlike two thinner candidates also found, Info/perceptual and Data 8/
perceptual, both under 0.011 deg). Verified: still a genuine staircase case (old rule does not converge
in 16 iterations), `solveOkhslHue`'s result reproduces the emitted stop-500 pixel byte-for-byte
(`[221,0,231]`), and `p.hue === 326` in `defaultDocument()` holds (the gate's own ownership proof).
`test/engine/tonal.mjs`'s `STAIRCASE` array updated; `Data 7`/perceptual and `Primary`/peak are
unchanged (re-verified, still discriminate, still their original pinned (s, l) - only Neutral moved).

**`intensity-legacy`'s Data 1 stop-400 fixture cell.** Re-ran the full 25-stop perceptual Data 1 ramp
directly (hue 287, chroma 95, skew 0, lift 0, role-table.json's raw CAM16 hue, matching the test's own
construction) and diffed cell-by-cell against the fixture: 24 of 25 cells match exactly; only stop 400
differs, by one 8-bit LSB (`#9789FB` -> `#9789FA`). Cause: `okhslStops` resolves ONE hue (`hOk`, solved
once at stop 500) and reuses it, unchanged, for the entire non-anchored ramp (Data 1's `hueShift` is 0,
so `hue === hOk` at every stop) - a later `solveOkhslHue` refinement already in this integration head's
own review-pass chain (the fixture's own giant carve-out comment already documents several such
refinements, e.g. #657) moved that one shared hue by under one float ULP at the solved precision, too
small to move stop 500's own rounded pixel but just large enough to tip stop 400's blue channel across
its own, different rounding boundary at that stop's different chroma/tone. Patched the single fixture
cell by hand (`test/engine/fixtures/tonal-legacy.json`, one line: `sed -n '232p'` before/after), not
regenerated wholesale, to keep the diff reviewable and avoid disturbing any other cell. Citation added
to the fixture's own carve-out comment block in `test/engine/tonal.mjs`.

`npm test` is green on this gate; both re-pins are independently reproducible by the method cited in
each fix's own comment (instrument `okhslStops`'s `hOk` computation, or diff the ramp against the
fixture cell-by-cell).

## Q6 (RESOLVED pass 2) - `anchor-ramp lone-spike`: 64 instances, root-caused; see the owner ruling above

**Closed as a record, not an open question.** Root-caused pass 2 review (bisection: 0 at all four merge
points, 64 only after the asset regeneration `7d659ae5`, traced to U3's ruled `dampAmp` 55 -> 0). The
owner's ruling on the finding is recorded verbatim above and applied to `test/engine/anchor.mjs`. Full
detail: handoff §7.6.

## Q7 (NEW, addendum 2) - `above100Violators`/`cuspRunFor`: do their invariants apply to anchored palettes at all

**Finding, not yet ruled.** Addendum 2's general ruling ("every #681 allow-list gate reads the rendered
path with the anchor") was applied to these two C6 checks and immediately surfaced that "0 above the
anchor's own chroma at any stop" (iii) and "one above-anchor cusp run" (iii-b) do not hold, at massive
scale, for an anchored palette:

- (iii) `above100Violators`, palette-level: **1,205 of 3,380 anchored generated palettes (35.7%) violate
  on even; 3,119 of 3,380 (92.3%) on peak**, versus **0 of 384 non-anchored** violators on either mode.
- (iii-b) `cuspRunFor` (perceptual only): **958 multi-run + 712 bound-excess instances** on the corrected
  path (doc-level sweep, generated palettes).

**Mechanism.** For an anchored palette, stop 500's chroma is pinned to the anchor's own real, arbitrary
measured CAM16 chroma (`paletteStopsAnchored`'s `stop === 500 && !clamped` special case) - a human-
picked color with no designed relationship to being the ramp's peak. The non-anchored construction these
invariants were built and owner-ruled against (Q7 pass 4/5, hence this check's own name) DOES define
stop 500 as the ramp's designed peak, so "nothing exceeds it" was a real, checkable property there. It
is not a property of the anchored construction at all - this is not a bounded set of 63-style
departures with individual causes, it is a scope mismatch between the invariant and a whole palette
class.

**Not applied myself:** left `above100Violators` and `cuspRunFor` on the non-anchored measurement they
have always used (matching what Q7 pass 4/5 was actually reviewed against), with the measured numbers
and mechanism cited in each function's own comment in `test/engine/tonal.mjs`, rather than either (a)
silently switching them to the anchor-aware path and turning `npm test` red on a ~2,000-instance
population with no allow-list, or (b) inventing a scope carve-out (excluding anchored palettes, the
likely resolution, symmetric with perceptual's existing carve-out from (iii)) unilaterally - that is a
real change to what a ratified #681 invariant means, not a mechanical re-measurement.

**Options:**
1. Carve anchored palettes out of (iii) and (iii-b) entirely (symmetric with perceptual's existing
   carve-out from (iii), for the analogous reason: the invariant is defined against a construction this
   palette class does not use) - then both checks can safely read the anchor-aware path for the
   non-anchored palettes that remain in scope.
2. Redefine (iii)/(iii-b) for anchored palettes against a different ceiling than "stop 500's own chroma"
   (e.g. the group's resolved `rampChromaOf` target) - a real, and larger, engine-semantics decision.
3. Leave both checks measuring the non-anchored path only (current state), documented as a known,
   accepted scope limit, and track the anchored-palette question as its own follow-up ticket.

`scripts/report-preset-fidelity.mjs --envelope` DOES render the full anchor-aware path (per addendum
2's explicit instruction for that script) and reports this same population as FAIL under both readings
- expected and correct, since it is a diagnostic report, not an `npm test` gate.

## Q8 (NEW, addendum 2) - default-kit lone-spike (Data 7): allow-list or fix, and the "0 notched cells" invariant

**Finding, not yet ruled.** Per addendum 2's instruction, the default kit is now in the lone-spike sweep
(a small, separate sweep in `test/engine/anchor.mjs`, not folded into the shared C5/notch loop). It
found exactly one hit, matching addendum 2's own prediction: `default kit "Default" Data 7 #088585 stop
500` (even mode, 25-stop export ramp) - the same near-achromatic-neighbours-either-side-of-a-spike
mechanism as the curated corpus's 64, gated separately (`DEFAULT_KIT_SPIKE_FINDING`, explicitly NOT
folded into `LONE_SPIKE_ALLOW`).

**Ask:** if this is allow-listed the same way as the curated corpus's 64 (recommended, for consistency),
note that the plan states the default kit should carry "0 notched cells" in every mode - this is a
SPIKE, not a notch, and a different gate, but it is the same "the default kit should be exemplary"
spirit the plan's phrase gestures at, so allow-listing this one instance is itself a small departure
from that stated invariant and may be worth a line in the plan's own record, not just a test-file
allow-list. The even-mode neighbourhood-chroma root fix already tracked for the 64 (joins #701) would
also fix Data 7, if and when it lands.
