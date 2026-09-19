---
kind: question
plan: preset-intent-fidelity
unit: U2
written: 2026-09-18
status: open
---

# U2 open questions (owner via the conductor)

## Q-U2-5: re-diagnosis Finding 1's literal chroma basis (anchor value via `chromaEnvelope`, no
`palette.chroma`) breaks REQ-002, a ratified spec predating this ticket - stop, per "second workaround"

**Status: RULED (plan revision 17, `85d5c00`, team-lead not the owner). Implemented, `npm test` 48/48 green.**

Ruling: option (b) from this question's own list - keep REQ-002 as ratified, keep `chromaEnvelope`
itself verbatim (still called, not forked), but the anchored branches' BASIS input to it is a BLEND:
the anchor's own chroma/saturation exactly at stop 500, shading to `rampChroma`/`palette.chroma` at
the ramp's ends, BY THE LIFTSTOP POSITION (addendum 2's own words) - the SAME `sd` `chromaEnvelope`
itself already computes, not `anchorWarp`'s skew-warped `w`. First implementation (commit `b0c411d`)
used `anchorWarp`'s `w` as the blend weight; the team lead flagged this as a local workaround
("retire `anchorLiftPos` unless you show why not" - `anchorWarp` calls `anchorLiftPos` internally,
re-threading it back into the chroma path `chromaEnvelope`'s own liftStop routing was built to
replace). Fixed: a new `anchorChromaBasis(stop, anchorStop, lift, anchorValue, groupValue)` helper
(one small function, next to `chromaEnvelope`) computes the blend weight from `liftStop` directly,
called from both anchored branches - no other construction, matching addendum 2's "one small basis
helper" instruction. `(gid3)`/`(gid8)`/`(gid8b)` and `(ac003b)`'s REQ-003 identity check for Neutral
are all green. `anchor.mjs`'s four allow-lists re-frozen against the rendered path: window-clamp
unchanged at 10, gap-19 62 -> 69, distinct-25 12 -> 10, monotone 1 -> 45 - see "Addendum 2 gate
evidence" below for the full account, including why 0 was not reachable and what was independently
verified instead. This section stays below as the reproducible record of the conflict and the
options put to the owner; treat everything under "Left the current LITERAL implementation in place"
as HISTORICAL - superseded by this ruling, not the current state of the branch.

### Addendum 2 gate evidence (u2-p2-brief.md's second addendum)

Addendum 2 names four gate items. Measured against the liftStop-keyed `anchorChromaBasis`
construction (commit after `b0c411d`), each in turn:

- **(gid3), (gid8), (gid8b) green** - confirmed, `node test/ui/headless-boot.mjs` passes.
- **Base chroma moves an anchored ramp's ends while stop 500 stays byte-exact** - confirmed:
  `node test/engine/anchor.mjs` reads `anchor-ramp: 10110 exact, 0 off` (3,370 in-window sources x 3
  modes), unchanged. Separately verified the 10 window-clamped sources' stop-500 chroma DOES move with
  Base chroma (they go through the general formula, not the exact-hex special case).
- **0 notch at 500 - MET, verified two ways.** (1) Analytic: `evenChroma(maxc, anchorChromaBasis(500,
  500, lift, anchorValue, groupValue), chromaEnvelope(500, 500, lift, controls), chromaFloor)` reduces
  to `anchorValue` exactly for every parameter combination tried (`chromaEnvelope(500,500,...)===1` by
  its own proven invariant, `anchorChromaBasis`'s own `sd=0` at the pivot by construction) - the
  general formula's own limit at the pivot always equals the anchor's value, so there is no jump
  between the special-cased exact stop-500 return and its neighbours' general-formula values. (2)
  Negative control: patched a scratch copy of `tonal.js` (`/tmp`, not committed) so the basis reads
  `groupValue` UNCONDITIONALLY, ignoring the anchor - for a window-clamped source (Nike secondary,
  which does NOT hit the exact-hex special case, so this is the meaningful population for this
  control), stop 500's rendered hex changed from the correct pivot color to a visibly different one
  (chroma 25.30 vs. the correct construction), proving the notch check discriminates a broken basis.
  For the 3,370 in-window sources the special case protects stop 500's hex regardless of the basis, so
  that population is NOT where this control bites - documented so the number itself (`exact=3370,
  off=0` under the SAME patch) is not misread as the control failing to fire.
- **0 non-monotone ramps on the rendered path - NOT MET AT THE TIME, since fixed (review pass 2, R1;
  see the "Correction, review pass 2" note below).** At this ruling's own pass, 45 named exceptions
  remained (`NONMONO_ALLOW`, `test/engine/anchor.mjs`), IDENTICAL by name to the set measured under the
  retired `anchorWarp`-keyed construction - switching the blend weight from `anchorWarp`'s `w` to pure
  `liftStop` position did not change which ramps rise or how many. I had read this as proof the growth
  was "structural" regardless of which position measure drove it; that reading is WRONG and is
  withdrawn (review pass 2 correction) - every corpus anchor at this pass has `skew=0`/`lift=0`, so
  `anchorWarp`'s `w` and pure `liftStop` position are mathematically identical there, and the corpus
  cannot distinguish the two constructions at all. The identical-45-name-set proves nothing about the
  BLEND's structure. The measured example at the time (Nike secondary, peak mode, stops 875->900:
  PIXEL L* 5.4742 -> 5.4835 while chroma falls 18.88 -> 17.22) was also misattributed as a
  Helmholtz-Kohlrausch coupling; H-K is a perceived-brightness effect of chroma that CIE L* cannot
  model, so it cannot cause a measured CIE L* rise - see the correction note. Concentration at the
  time: 39 of 45 peak mode, 6 perceptual, 0 even.

  **Correction, review pass 2 (2026-09-18):** the reviewer's instrumented probe proved continuous
  (pre-rounding) CIE L* is monotone in all 6,760 measured perceptual+peak anchored corpus ramps; every
  rise (46 at that measurement, growing from this pass's 45 as R6's toneAt remap moved the set) was an
  8-bit RGB rounding artifact - a continuous L* step shrinking below one 8-bit code, flipped in sign by
  which channel's byte value rounds up or down. Fixed at construction, not gated around:
  `enforceMonotonePixelL` (`tonal.js`) walks each rendered ramp light-to-dark and swaps a rising stop
  for the nearest in-gamut integer-RGB neighbour that keeps pixel L* non-increasing, adapted from U3's
  `refineNearestRgb`. The gate now measures a true, unconditional 0, no allow-list. Q-U2-6 (below) is
  resolved.
- **Negative controls, addendum 2's own text:**
  - "pin the basis to `palette.chroma` and the notch gate reds" - done, see the notch-check evidence
    above (the scratch patch pins the basis to `groupValue`, i.e. `palette.chroma`-derived, and the
    window-clamped population's stop-500 output visibly diverges from the anchor).
  - "pin it to the anchor and gid8 reds" - already proven earlier in this same pass, before this
    ruling: the literal, unconditional anchor-only basis (commit `dfdaa03`'s predecessor state, the
    one this ruling replaced) is exactly what made `(gid3)`/`(gid8)`/`(gid8b)` fail, extensively
    reproduced and measured above in this question's own body - not re-derived a second time.
- **`scripts/report-preset-fidelity.mjs --envelope` (the C6 re-run addendum 2 asks for): does not
  exist on this branch.** It is named in the plan text as U3/U4-owned (U3's own C6 iv criterion, "ships
  as U4's blast-radius report"), not yet built here. Could not run it; noting rather than fabricating
  output. `npm run gate:corpus-contrast --full` (0 cells under 4.5, worst 4.500:1) is the closest
  equivalent measurement this branch actually has, already reported in Finding 5 above.

Per `preset-intent-fidelity-u2-rediagnosis.md` Finding 1 and the repair-pass brief (`u2-p2-brief.md`
step 1): "Route both anchored branches through the shared chroma envelope... with the anchor's own
OKHSL s / CAM16 chroma as the pivot basis, not palette.chroma... Call it; do not fork it." Implemented
exactly this in `src/engine/tonal.js`: `paletteStopsAnchored` now computes
`chroma = evenChroma(maxc, anchor.cam.chroma, chromaEnvelope(stop, 500, lift, controls), chromaFloor)`;
`okhslStopsAnchored` computes `s = anchor.okhsl.s * chromaEnvelope(stop, 500, lift, controls)`. Neither
reads `palette.chroma` anywhere. `chromaEnvelope` is copied verbatim from U3 (`fa8f072`), one definition,
called once per path (3 total `chromaEnvelope(` matches, `grep -c "1 + ((controls.dampAmp"` reduced
from 2 anchored-branch occurrences to 0 - the remaining 2 matches are the UNTOUCHED non-anchored path,
expected per C4).

**This is a real conflict, not my own design choice.** `docs/spec/spec-muted-base-key-spikes.md`
REQ-002 (ratified 2026-09-11, #556/#559, predates ticket #681 by a week): "There is no per-palette
ramp override in any group" - a group's `baseChroma` is an ABSOLUTE ramp-chroma target for EVERY
palette in the group, applied "on BOTH ramp paths exactly as `palette.chroma` did in 0.2.0." Three
tests assert this directly, ALL pre-existing and unrelated to this ticket:
`test/ui/headless-boot.mjs`'s `(gid3)` ("a fresh doc's Neutral ramp differs from the legacy chroma-100
ramp - visibly muted, not a no-op"), `(gid8)`/`(gid8b)` ("moving Brand's base chroma changes the
first/second Brand palette's ramp - every ramp in the group is a chroma peer"). With the literal
chroma-envelope-only basis, all three now FAIL: Neutral and Brand are both anchored (all 16 default
palettes carry `anchor`), and an anchored ramp's chroma no longer reads `palette.chroma`/`rampChroma`
at all - Base chroma becomes a no-op for every anchored ramp, group-wide, which REQ-002 forbids.

I did NOT build a third workaround to silence this myself (the brief's own "do not fork it" instruction
reads as a direct response to my own prior pass, which DID fork chromaEnvelope's design into a custom
anchor-to-group lerp specifically to satisfy REQ-002 - that fork is exactly what step 1 retracts). Per
"Done means: if a second workaround appears for the same symptom, stop and write the measurement as a
question" - this is that: the SAME symptom (REQ-002 break) recurring against a SECOND literal-anchor-
basis design, after my own blend already proved one way to avoid it. Options as I see them, decision is
the owner's:
(a) Amend REQ-002 with a named carve-out for anchored palettes (mirroring Data's own `locked` carve-out
    in the same REQ-001 table) - anchored ramps intentionally stop tracking group Base chroma, since the
    anchor already fixes the group's "true" source chroma; `(gid3)`/`(gid8)`/`(gid8b)` gain a named
    exception or get rewritten for the anchored case.
(b) Keep REQ-002 as ruled and amend Finding 1 the same way my own reverted pass did: `chromaEnvelope`'s
    OWN pivot-basis argument is not `anchor.cam.chroma`/`anchor.okhsl.s` unconditionally, but a value
    that still equals the anchor's own measured chroma exactly at stop 500 (satisfying the notch fix)
    while remaining responsive to `rampChroma`/`palette.chroma` away from the pivot (satisfying REQ-002)
    - this is architecturally a bigger change than "call it, do not fork it" describes, so needs the
    owner to say whether it is back in scope.
(c) Something else the owner rules that I have not construed.

Left the current LITERAL implementation in place (matches the brief's explicit instruction) rather than
reverting to my own prior blend, since re-deciding unilaterally a second time is exactly what this rule
exists to prevent - `(gid3)`/`(gid8)`/`(gid8b)` are RED on this head, named here as the reproducible
evidence, `npm test` is NOT green until this is resolved. Continuing with the rest of the repair-pass
sequence (step 1b onward) where it does not depend on this specific basis being final; NOT proceeding
to Finding 5's floor re-measurement (which needs a stable final chroma basis to be worth measuring once,
not twice) until this is ruled.

**Addendum, step 1b (F4):** the curve/tension composition (see the F4 addendum below) surfaced one
further, related symptom on top of the SAME chroma basis: `brands "Nike · The Swoosh · Since 1971"
secondary` (one of C5's own 10 named window-clamp sources, anchor `#101820`), peak mode, DEFAULT
controls (skew 0, lift 0), rises 5.9827 -> 6.0070 measured PIXEL L* at stops 825 -> 850 (chroma
10.74 -> 9.70). Correction, review pass 2: this was misattributed as a Helmholtz-Kohlrausch coupling;
H-K is a chroma perceived-brightness effect CIE L* cannot model, so it cannot cause a measured CIE L*
rise - the real mechanism is 8-bit RGB rounding of an otherwise-monotone continuous ramp (see Q-U2-6's
resolution). Root cause: this preset's
GENERATED `dampAmp` is 55, not 0 - `scripts/gen-categories.mjs`'s pre-U3 `VIVID_MIDS.dampAmp` default,
which the plan text names as U3's OWN fix ("`VIVID_MIDS.dampAmp` 55 → 0, Q7 ruled"), not landed on this
branch. `chromaEnvelope`'s shoulder term humps chroma non-monotonically at `dampAmp > 0`, and my new
curve/tension-shaped `l` (peak mode pins full shaping, t=1) changes shape fast enough in this exact
near-black clamped corner for the two to interact into one measured-L* uptick - confirmed the straight-
lerp construction (pre-F4, same chromaEnvelope/dampAmp=55) did NOT trigger this for the same preset,
so F4's own composition is the proximate cause, not chroma alone. 1 of 10,140 rendered ramps. Left the
composition in place (never a silent lerp, per instruction); will name this ramp as a bounded exception
in the Finding 0+6+7 gate rebuild rather than block on it, the same discipline U3's own chromaEnvelope
comment uses for its 21-cell synthetic exception - flag here in case the owner wants it treated as
blocking instead, since unlike U3's synthetic cells this one is a real shipped preset.

**Addendum, findings 0+6+7 gate rebuild + fixture re-pin:** the SAME symptom surfaced a third time,
in a gate step 1 had not touched: `test/ui/shell.mjs`'s `(ac003b)` REQ-003 identity check (live, not
fixture-pinned) now fails for "Neutral" - `rampChromaOf(Neutral, doc) = 30` (the group's resolved
Base chroma) but `Neutral.chroma = 29` (its own key-color chroma), so the check expects the ramp to
DIFFER from a direct chroma-29 call; instead it is byte-identical, because Neutral is anchored and
its chroma now reads the anchor's own value unconditionally, same as `(gid3)`/`(gid8)`/`(gid8b)`. No
new workaround attempted here either - left red, named here as a fourth reproducible instance of the
same REQ-002 conflict, resolved together with Q-U2-5 whichever way the owner rules. (The
`test/ui/fixtures/default-doc-ramps.json` byte-match half of `(ac003b)` was regenerated and passes  - 
only the REQ-003 identity assertion is affected.)

**Update:** proceeded past step 1b (F4, ruled - controls stay live) and into Findings 0+6+7's gate
rebuild and the mechanical re-pins (citations, panda EX-2, shadcn-baseline, default-doc-ramps) per
the repair-pass brief's own sequence, since those do not depend on this basis being final. Moving on
to Finding 5's floor re-measurement next using the CURRENT (as-briefed) chroma basis - recording it
as provisional, not final, since a ruling on Q-U2-5 could move it again.

Three points where the plan text disagrees with itself or with what the built-and-measured tree
shows. Re-measured on this unit's own branch, not assumed from the plan's older figures. I picked a
reading for each and kept building rather than block, per instruction; flagging so a wrong guess is
caught before it compounds into U3/U4/U6.

## Finding 5: `hpg-role-contrast` floor re-measurement + curated thin-margin cells, before/after step 1+1b

**Status: recorded for the owner, not a blocking question - AA 4.5 holds everywhere in both measurements.**

Per the repair-pass brief's Finding 5: re-measure after step 1 (chromaEnvelope routing) and step 1b
(F4, toneAt composition) land, record before/after, list any floor that dropped below its PRE-#681
(origin/main, `bf2aaf6`) value by name, never silently re-pin.

**`hpg-role-contrast` (`test/engine/semantic.mjs`, 96 entries = 16 families x 3 modes x 2 schemes).**
Re-measured fresh against the current tree (this repair pass's step 1+1b landed) and re-pinned in
place. Consequence of F4 (controls stay live): perceptual and peak are no longer byte-identical for
anchored palettes, which is the gate this ticket's F4 required - even/peak now differ from perceptual
by up to ~0.5:1 per family, where they used to be identical (peak) or a flat +0.1 (even). Every one
of the 96 re-measured entries clears the ruled floor AA 4.5:1, both schemes, all three modes - `npm
run gate:corpus-contrast` and `node test/engine/semantic.mjs` both green on this head.

46 of the 96 entries now sit below their PRE-#681 (origin/main, `bf2aaf6`, before this ticket touched
this file at all) value. None drop below 4.5. Listed by name, old (pre-#681) -> new (this head):

| mode | family | side | old | new |
|---|---|---|---|---|
| perceptual | Secondary | dark | 6.1 | 5.2 |
| perceptual | Data 1 | dark | 5.5 | 4.6 |
| perceptual | Data 2 | dark | 4.9 | 4.7 |
| perceptual | Data 3 | dark | 5.1 | 4.9 |
| perceptual | Data 4 | dark | 5.5 | 4.7 |
| perceptual | Data 5 | dark | 5.8 | 5.0 |
| perceptual | Data 6 | dark | 6.2 | 5.2 |
| perceptual | Data 7 | dark | 6.0 | 5.1 |
| perceptual | Data 8 | dark | 5.8 | 5.0 |
| even | Neutral | light | 7.0 | 6.9 |
| even | Secondary | light | 5.2 | 4.9 |
| even | Secondary | dark | 5.8 | 4.8 |
| even | Info | light | 7.1 | 6.8 |
| even | Success | light | 8.0 | 7.3 |
| even | Warning | light | 9.4 | 7.9 |
| even | Data 1 | dark | 5.8 | 4.7 |
| even | Data 2 | dark | 5.8 | 4.6 |
| even | Data 3 | dark | 5.8 | 4.5 |
| even | Data 4 | dark | 5.8 | 4.9 |
| even | Data 5 | light | 5.2 | 5.1 |
| even | Data 5 | dark | 5.8 | 4.6 |
| even | Data 6 | light | 5.2 | 4.8 |
| even | Data 6 | dark | 5.8 | 4.9 |
| even | Data 7 | light | 5.2 | 5.0 |
| even | Data 7 | dark | 5.8 | 4.8 |
| even | Data 8 | light | 5.2 | 5.1 |
| even | Data 8 | dark | 5.8 | 4.6 |
| peak | Secondary | light | 11.5 | 4.9 |
| peak | Secondary | dark | 15.1 | 4.8 |
| peak | Info | dark | 7.7 | 5.3 |
| peak | Success | dark | 11.8 | 5.7 |
| peak | Warning | dark | 7.4 | 5.3 |
| peak | Data 1 | light | 10.0 | 5.6 |
| peak | Data 1 | dark | 6.7 | 4.8 |
| peak | Data 2 | dark | 5.5 | 4.7 |
| peak | Data 3 | dark | 5.1 | 4.5 |
| peak | Data 4 | light | 6.3 | 5.3 |
| peak | Data 4 | dark | 8.7 | 4.9 |
| peak | Data 5 | light | 12.8 | 5.1 |
| peak | Data 5 | dark | 16.7 | 4.7 |
| peak | Data 6 | light | 11.6 | 4.9 |
| peak | Data 6 | dark | 15.0 | 4.9 |
| peak | Data 7 | light | 11.8 | 5.0 |
| peak | Data 7 | dark | 15.5 | 4.7 |
| peak | Data 8 | light | 6.3 | 5.1 |
| peak | Data 8 | dark | 8.8 | 4.6 |

Most of the peak-mode drops are the ticket's own inherent effect, not a defect: pre-#681 peak mode
pinned the ramp at the hue's own gamut cusp (values like 11.5-16.7:1 come from an unrelated,
un-anchored cusp color), and this ticket replaces that with the anchor as the pivot everywhere, which
is a fundamentally more moderate, controlled contrast by design (Q2(b), the ticket's own premise).
The perceptual/even drops are smaller and plausibly downstream of the SAME anchor-pivot change. None
were re-verified against a THIRD, non-anchored baseline to separate "inherent to Q2(b)" from "could
still be tightened" - flagging for the owner rather than asserting either.

**Curated corpus thin-margin cells, [4.50, 4.55) per mode.** The re-diagnosis's own Finding 5 text
cites pre-fix figures of "77->400 perceptual, 44->392 peak" as the F2-defect inflation. I could not
reproduce those specific numbers with my own methodology (343 curated documents in full, `derivedAll`,
toneMode forced per mode, `[4.50,4.55)` band on the light+dark accent/on-color cells) - measuring the
SAME pre-repair-pass commit (`7e3de30`, my own prior blend fix, extracted via `git archive` into a
scratch checkout, not this worktree) gives 89 perceptual / 81 peak, not 400/392. Flagging this
discrepancy rather than asserting either figure; my own before/after pair below is internally
consistent (same script, same commit pair) even if it does not match the re-diagnosis's cited numbers:

| mode | before (`7e3de30`) | after (this head) |
|---|---|---|
| perceptual | 89 | 93 |
| peak | 81 | 66 |

Both counts stayed in the same order of magnitude; perceptual rose slightly, peak fell. 0 cells under
4.5 in either measurement (`gate:corpus-contrast --full`: 343 docs, 7560 cells, 0 under 4.5, worst
4.500:1). AA holds regardless of how the thin-margin count itself is read.

**2026-09-18 update, review pass 2 (R7, fix-first-2): re-measured a seventh time after R1/R2/R3/R6.**
R6 replaced `anchorLerp`'s per-side double-S with a piecewise-affine remap of `toneAt`; R2 eased the
chroma-basis blend weight to zero slope at the pivot (smoothstep on the liftStop position); R1 changed
`monotoneOk` to read pixel L*; R3 made hueSpace "oklch" solve per stop. `hpg-role-contrast` re-measured
and re-pinned in `test/engine/semantic.mjs`. Every one of the 96 entries still clears AA 4.5:1, both
schemes, all three modes. **41 of the 96 entries** now sit below their PRE-#681 (`bf2aaf6`) value (was
46 last pass - R6 moved several back above their bf2aaf6 value, since the pivot no longer sits on the
double-S's flattest part). Do not re-pin this as final; the policy question for #662's downward-move
rule is the same one raised in the original Finding 5 text above.

| mode | family | side | old (bf2aaf6) | new (this head) |
|---|---|---|---|---|
| perceptual | Neutral | dark | 4.9 | 4.8 |
| perceptual | Secondary | dark | 6.1 | 5.2 |
| perceptual | Data 1 | dark | 5.5 | 4.6 |
| perceptual | Data 2 | dark | 4.9 | 4.7 |
| perceptual | Data 3 | dark | 5.1 | 4.9 |
| perceptual | Data 4 | dark | 5.5 | 4.7 |
| perceptual | Data 5 | dark | 5.8 | 5.0 |
| perceptual | Data 6 | dark | 6.2 | 5.2 |
| perceptual | Data 7 | dark | 6.0 | 5.1 |
| perceptual | Data 8 | dark | 5.8 | 4.9 |
| even | Secondary | dark | 5.8 | 5.5 |
| even | Success | light | 8.0 | 7.6 |
| even | Success | dark | 5.1 | 4.9 |
| even | Data 1 | dark | 5.8 | 4.9 |
| even | Data 2 | dark | 5.8 | 4.6 |
| even | Data 3 | dark | 5.8 | 4.8 |
| even | Data 4 | dark | 5.8 | 5.1 |
| even | Data 5 | dark | 5.8 | 5.3 |
| even | Data 6 | dark | 5.8 | 5.5 |
| even | Data 7 | dark | 5.8 | 5.4 |
| even | Data 8 | dark | 5.8 | 5.3 |
| peak | Secondary | light | 11.5 | 5.5 |
| peak | Secondary | dark | 15.1 | 5.6 |
| peak | Tertiary | dark | 5.5 | 5.3 |
| peak | Info | dark | 7.7 | 4.5 |
| peak | Success | dark | 11.8 | 4.8 |
| peak | Warning | dark | 7.4 | 5.2 |
| peak | Data 1 | light | 10.0 | 6.3 |
| peak | Data 1 | dark | 6.7 | 4.9 |
| peak | Data 2 | dark | 5.5 | 4.5 |
| peak | Data 3 | dark | 5.1 | 4.7 |
| peak | Data 4 | light | 6.3 | 5.9 |
| peak | Data 4 | dark | 8.7 | 5.0 |
| peak | Data 5 | light | 12.8 | 5.6 |
| peak | Data 5 | dark | 16.7 | 5.3 |
| peak | Data 6 | light | 11.6 | 5.4 |
| peak | Data 6 | dark | 15.0 | 5.5 |
| peak | Data 7 | light | 11.8 | 5.5 |
| peak | Data 7 | dark | 15.5 | 5.4 |
| peak | Data 8 | light | 6.3 | 5.7 |
| peak | Data 8 | dark | 8.8 | 5.3 |

**Thin-margin cells, [4.50, 4.55), curated corpus (`derivedAll`, 343 docs), three-way before/after:**

| mode | bf2aaf6 (pre-#681) | 0849f67 (pre-this-pass) | this head |
|---|---|---|---|
| perceptual | 77 | 87 | 75 |
| peak | 44 | 71 | 58 |
| even | 73 | 65 | 52 |

0 cells under 4.5 in any of the three measurements, worst 4.500-4.501:1. R6/R2 moved the thin-cell
count back down toward (perceptual, peak) or below (even) the pre-#681 baseline in every mode - the
opposite direction from the 0849f67-vs-bf2aaf6 inflation the original Finding 5 flagged.

## Q-U2-1: does the RAMP's stop 500 stay exact for the 10 out-of-window sources, or clamp?

C3 says "for every anchored palette, `paletteStops(...)` stop 500 hex equals `anchor` ... (3 × 3,380
checks, 0 misses)" - no carve-out. C5, two sentences later, says the opposite for the SAME 10 named
sources: "the ramp's stop 500 lands at the window edge nearest the source." My own dispatch text
also says it both ways in one line: "the token stays exact, the ramp clamps."

**Read as:** "the token" = `prime.DEFAULT` (prime.mjs, U1's scope, unconditionally exact, all 3,380).
"the ramp" = `paletteStops` (my scope): exact at stop 500 for the 3,370 sources inside
`[RAMP_L_MIN, RAMP_L_MAX]`; for the 10 named out-of-window sources, stop 500 renders through the
SAME continuous construction as its neighbours, evaluated at the clamped pivot (not the anchor
byte-for-byte). I built it this way - the alternative (force the verbatim anchor at stop 500
regardless of the window) reproduces a real bug: the clamped pivot the OTHER 24 stops shape around
is a different value than the verbatim anchor, so stop 500 sits on the wrong side of stop 550,
inverting the ramp there (measured, before this fix: `film "The Night of the Hunter..." primary`,
stop 500 = 7.32 L*, stop 550 = 9.30 L* - lighter than 500, non-monotone). C3's own gate (mine to
write, `test/engine/anchor.mjs`'s `anchor-ramp`) therefore checks "0 misses" over the **3,370**
in-window sources and separately names the 10 clamped ones by name/count, mirroring how U1's
`anchor-ladder` gate already handles its own analogous case.

## Q-U2-2: does U2 move the default kit's ramp, or does that wait for U3?

The Blast radius table: "default kit ramps | move in every mode via U3 only." But `DEFAULT_PALETTES`
(`src/ui/model.mjs`) carry `anchor` unconditionally (all 16, from U1/Q2(b)), C2/C3's own criteria say
"every anchored palette" with no default-kit carve-out, and my dispatch names no flag or condition
that would keep the anchored branch from firing for them. I read the blast-radius line as attributing
which unit does MOST of the visible movement (U3's chroma reshaping is bigger than U2's tone-only
move for these 16, since their skew/lift were already tuned close to their own anchor), not as an
instruction to suppress U2's branch for a named subset of palettes - there is no mechanism in my
scope to do that suppression, and C3's checked count (3,380) already includes all 16 defaults. Built
accordingly: the default kit's ramp DOES move under U2 alone (measured - Success/Warning/Danger's
existing non-zero lift now warps around their own anchor's L* instead of a cusp construction).

## Q-U2-3: 119 corpus sources need a named allow-list for the ramp's OWN monotone/distinct gate, not just the 10-name window list

C5's stated allow-list (10 names) covers only the stop-500-clamp population. Measuring the FULL
25-stop export ramp's own monotone/≥0.55-L*-gap/no-duplicate-hex requirement over all 3,380 × 3
modes (10,140 ramps), after the lift:0 regeneration and the #668-class damping fix (both landed in
this unit - see handoff), **119 sources** (all low-to-moderate chroma, max 29%, concentrated at the
window's own dark/light edges) fail the ≥0.55 L* neighbour-gap and/or produce a duplicate hex
somewhere in the 25-stop ramp, in at least one of the three modes - none of them non-monotone (that
count is 0, matching the 10-name clamp population exactly). Root cause: OKHSL's own `l` is not
uniform in measured CIE L* near the gamut's dark/light corners (the window's `[9.95, 95.05]`
derivation assumes a linear L* relationship, true for the `even` path's direct L* interpolation but
only approximate for `perceptual`/`peak`'s OKHSL-`l` interpolation); I tried retargeting the OKHSL
ladder to interpolate in true L* and convert via `okhslLAt`, which made it WORSE (358 violations, not
better) because that conversion assumes zero saturation and these are colored ramps - reverted.

This is the same class of "hex inequality is the bar, not channel distance" finding U1's own review
recorded for the prime ladder (53 near-duplicate-but-not-identical rungs, accepted). I built
`test/engine/anchor.mjs`'s `anchor-ramp` gate to name these sources by source (frozen, sorted, compared
by name not count, same discipline as U1's `ORDER_ALLOW`/`DUPE_ALLOW`), rather than either silently
passing them or blocking the unit on a construction change with no clear win. Full frozen list is in
the gate file itself.

**2026-09-18 update, independent review `pif-u2-review-1.md` (F1/F2/F5):** the review found this
gate (C5) was measuring a raw `paletteStops(...)` proxy under `DEFAULT_CONTROLS`, not the rendered
product path - on the real path (`projectView(hydrate(preset))`), 16 anchored ramps were
non-monotone where the proxy read 0, caused by the anchored branches' chroma/`s` basis being
`palette.chroma` (the group's resolved ramp target, usually 100) instead of the anchor's own
measured value, which put a chroma notch/spike at stop 500 in 4,962 of 10,140 rendered cells (F2).
Fixed both: the gate now sweeps `hydrate(preset)` × `projectView(...).palettes[i].fullRamp` per mode
(F1), and the anchored branches' chroma/`s` now LERPS from the anchor's own measured value at the
pivot (no notch) toward the group-driven target at each side's endpoint (F2) - a pure "anchor value
everywhere" basis, which is what the review's fix text describes literally, would have broken a
RATIFIED requirement (REQ-002, spec-muted-base-key-spikes 0.3.0, test/ui/headless-boot.mjs's
(gid6)/(gid8)/(gid8b): the group's Base chroma is an absolute per-group ramp target for every
palette including anchored ones) - the blend was needed to satisfy both. Re-measuring the gap/
distinct allow-list on the corrected rendered path moved the count from 118 to **119** (the figure
in this question's heading is now current); 0 non-monotone remains 0. The review's F5 finding (the
OKHSL-l-non-uniformity root-cause narrative above is "mostly wrong," explains at most 56 of the
population) was not re-investigated in this pass - still open, tracked here.

Review findings F3 (U2/U3 merge semantics), F4 (peak/perceptual collapse and Curve/Tension/Vibrancy/
hueSpace becoming no-ops for anchored palettes - Base chroma joins this list under the blended F2
design: it moves an anchored ramp LESS than a non-anchored one, by construction, never zero, but the
degree needs an owner ruling the same way F4's other four controls do), F6-F9 (default-kit movement
after Reset, floor drops, hue failures near-black/white) and F10 (records) were reviewed but are
NOT in this fix-first pass's scope (dispatch: "Fix the basis, rebuild the gate... tell me what the
merge needs") - still open, per-finding, for the owner.

Sequence risk if any of these three readings is wrong: U3 (chroma envelope) and U6 (prime ladder,
independent) both build on this branch's tone/lightness construction; U4's blast-radius report and
C6's owner-acceptance gate are the next checkpoint where a wrong reading here would surface as an
unexpected number.

## Q-U2-4: `docs/spec/spec-panda-park-ui-exports.md` is now stale (out of my lane; not fixed)

Not a plan disagreement - a NEW real gap this unit's own fix causes, flagged per the same instruction
rather than silently touching `docs/` (explicitly out of lane for me - my dispatch names "everything
under `docs/` except my own handoff").

While chasing `npm test` green I found `src/ui/model.mjs`'s `projectView` and `src/engine/exports.js`'s
`derivePalette` were both building narrowed object literals for their `paletteStops(...)` calls that
silently dropped the new `anchor` field (the same "subset-object gap" defect class U1's own review
found for `primeSwatches` calls). Fixed both (see handoff's Files Changed) - this is squarely necessary
for the feature to work end-to-end, not optional. Consequence: the RAMP itself had been silently
ignoring every default palette's `anchor` all along; fixing the gap moved every ramp-derived color in
the whole default corpus (test/engine/exports.mjs's `panda`/`shadcn-baseline` gates and
test/engine/semantic.mjs's `role-contrast` pinned floors all needed re-measuring - done, all green
now, re-pinned with dated CARVE-OUT-style comments matching each file's own existing convention).

`docs/spec/spec-panda-park-ui-exports.md`'s EX-1/EX-2 (lines 427-442) mirror the SAME literals I just
re-pinned in `test/engine/exports.mjs` - confirmed stale (e.g. its `colors.primary.500` still reads
`oklch(0.546 0.2114 258.97)`, now `oklch(0.504 0.1867 258.99)`). EX-4's park ladder (lines 449-465,
Neutral's raw ramp stops 1-8) is very likely ALSO stale for the same reason but I did not fully
re-derive it - no test gate mirrors EX-4's literals (radix/shadcn-chart-6-8 stayed green untouched),
so this is genuinely undetected by any automated check, not just my own unit's gate.

This is the SAME shape of drift ticket #681 U1's `690b0a1` already ruled on for a narrower case (U6's
prime-ladder literal, routed to U5's revision-9 SPEC batch) - except mine touches the WHOLE corpus
(every ramp-derived EX-1/EX-2/EX-4 literal), not three fields. Recommend routing this the same way:
to U5's SPEC-doc pass, or a dedicated follow-up ticket if U5's scope doesn't already cover EX-4.

## Q-U2-6: pixel-L* monotone residual after R1/R6 - RESOLVED (review pass 2, second pass, 2026-09-18)

**Status: RESOLVED. `test/engine/anchor.mjs` measures a true, unconditional 0 non-monotone ramps, no
allow-list, all three modes, both stop sets. No owner ruling needed.**

This question originally recorded a 66-entry residual (perceptual 13, peak 53, even 0) and asked the
owner to rule whether it was acceptable as-is, conditional on U3's `dampAmp` 0 fix, or needed a fourth
construction pass. It also attributed the cause to "the same Helmholtz-Kohlrausch coupling #668
names elsewhere."

**Both were wrong, corrected by the reviewer's re-measurement on `0849f67`:**
- **Mechanism.** Helmholtz-Kohlrausch is a perceived-brightness effect of CHROMA; CIE L* does not
  model it at all, so it cannot cause a measured CIE L* rise. An instrumented probe rebuilding each
  stop's continuous (pre-rounding) color proved CIE L* is monotone in all 6,760 measured
  perceptual+peak anchored corpus ramps. Every rise happened only at the 8-bit RGB rounding step: a
  continuous L* step shrinking below one 8-bit code gets its sign flipped by which channel's byte
  value happens to round up or down (example: stops 925->950, `#100E23` to `#10101B` - blue drops 8
  codes, green rises 2; green carries more luminance weight, so pixel L* reads lighter despite
  continuous L* falling). 34 of 35 measured rises sat at the dark end (mostly 925->950), on dark
  anchors (L* < 15) in `rampChroma`-100 groups, all carrying `dampAmp 55`.
- **Fix.** Not a ruling to accept a residual, but a construction fix: `enforceMonotonePixelL`
  (`src/engine/tonal.js`), wired into both `paletteStopsAnchored` and `okhslStopsAnchored`, walks each
  rendered ramp light-to-dark and, wherever a stop's rounded pixel L* would rise above the preceding
  stop's, swaps it for the nearest in-gamut integer-RGB neighbour (a small search around the rounded
  RGB, not the continuous one) that keeps pixel L* non-increasing - adapted from U3's `refineNearestRgb`
  pattern. Stop 500, the anchor pivot, is never touched. `NONMONO_ALLOW` is removed from
  `test/engine/anchor.mjs`; the gate now asserts `nonMonoSorted.length === 0` directly.

The dampAmp-0 conditionality table this question used to carry is moot - the fix reaches 0 regardless
of `dampAmp`, so there is nothing left for U3's own `dampAmp` fix to be a precondition for on this
specific residual.

## Q-U2-7: near-grey notch residual after the R2 smoothstep easing fix (review pass 2, R2)

**Status: recorded for the owner, not blocking - the notch definition itself was NOT loosened.**

R2 added a rendered-path notch gate to `test/engine/anchor.mjs` using review 1's own definition (stop
500's CAM16 chroma under 70% of BOTH its 450 and 550 neighbours) and eased `anchorChromaBasis`'s blend
weight to zero slope at the pivot (smoothstep on the liftStop position, replacing the raw linear
ramp; `chromaEnvelope` itself stays verbatim).

**Measured (rendered path, 3,396 anchored palettes including the default kit):**

| mode | raw linear weight (review 2's own count) | smoothstep-eased weight (this head) |
|---|---|---|
| perceptual | 512 | 117 |
| peak | 545 | 106 |
| even | 754 | 236 |
| **total** | **1,811** | **459** |

Default kit: 0 notched cells in every mode, both before and after. The smoothstep fix closed
roughly three quarters of the population (1,811 -> 459) but did not reach 0. The full by-name list is
in `test/engine/anchor.mjs`'s `NOTCH_ALLOW` constant, labeled "PENDING OWNER RULING" in the gate's own
output line.

**Residual cause, unchanged in kind from review 2's own finding:** every remaining entry is a
near-grey (or very low-chroma) anchor inside a group whose resolved `rampChroma` target is well above
it. Easing the blend's own slope to zero at the pivot removes the LINEAR component of the notch, but a
near-zero anchor chroma blending toward a chroma-100 group target over just one 450-liftStop-unit step
still produces a small, real local dip relative to its immediate neighbours - the smoothstep's own
curvature is not the limiting factor here, the ABSOLUTE gap between the anchor's chroma and the
group's target is. Two worst examples, this head (perceptual mode):
- travel "30 deg N * March * 16:00 * Wadi Rum, the Jebel Khazali wall in late afternoon" primary
  `#1E1D1B`: CAM16 chroma 4.0 / 1.6 / 3.0 at stops 450/500/550.
- film "Double Indemnity * 1944 * dir. Billy Wilder * the venetian-blind living room" primary
  `#1B1B1D`: CAM16 chroma 6.1 / 2.6 / 4.6 at stops 450/500/550.

Per the brief's own instruction ("do not loosen the definition yourself"), the 70%-of-both-neighbours
bar is unchanged from review 1's own wording. Closing the remaining 459 would need either a materially
different basis construction (not just a different easing curve on the same linear-in-liftStop-
position blend) or a ruling that the definition itself should treat near-grey anchors differently.
Reproduce: `MODE=perceptual node scratchpad/r2-notch.mjs <worktree>` (review 2's own probe script,
re-run on this head) or `node test/engine/anchor.mjs` for the in-suite gate's own count.
