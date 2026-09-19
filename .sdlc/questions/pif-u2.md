---
kind: question
plan: preset-intent-fidelity
unit: U2
written: 2026-09-18
status: open
---

# U2 open questions (owner via the conductor)

## Q-U2-5: re-diagnosis Finding 1's literal chroma basis (anchor value via `chromaEnvelope`, no
`palette.chroma`) breaks REQ-002, a ratified spec predating this ticket — stop, per "second workaround"

**Status: blocking, not decided unilaterally. Implemented literally as briefed, measured, evidence below.**

Per `preset-intent-fidelity-u2-rediagnosis.md` Finding 1 and the repair-pass brief (`u2-p2-brief.md`
step 1): "Route both anchored branches through the shared chroma envelope... with the anchor's own
OKHSL s / CAM16 chroma as the pivot basis, not palette.chroma... Call it; do not fork it." Implemented
exactly this in `src/engine/tonal.js`: `paletteStopsAnchored` now computes
`chroma = evenChroma(maxc, anchor.cam.chroma, chromaEnvelope(stop, 500, lift, controls), chromaFloor)`;
`okhslStopsAnchored` computes `s = anchor.okhsl.s * chromaEnvelope(stop, 500, lift, controls)`. Neither
reads `palette.chroma` anywhere. `chromaEnvelope` is copied verbatim from U3 (`fa8f072`), one definition,
called once per path (3 total `chromaEnvelope(` matches, `grep -c "1 + ((controls.dampAmp"` reduced
from 2 anchored-branch occurrences to 0 — the remaining 2 matches are the UNTOUCHED non-anchored path,
expected per C4).

**This is a real conflict, not my own design choice.** `docs/spec/spec-muted-base-key-spikes.md`
REQ-002 (ratified 2026-09-11, #556/#559, predates ticket #681 by a week): "There is no per-palette
ramp override in any group" — a group's `baseChroma` is an ABSOLUTE ramp-chroma target for EVERY
palette in the group, applied "on BOTH ramp paths exactly as `palette.chroma` did in 0.2.0." Three
tests assert this directly, ALL pre-existing and unrelated to this ticket:
`test/ui/headless-boot.mjs`'s `(gid3)` ("a fresh doc's Neutral ramp differs from the legacy chroma-100
ramp — visibly muted, not a no-op"), `(gid8)`/`(gid8b)` ("moving Brand's base chroma changes the
first/second Brand palette's ramp — every ramp in the group is a chroma peer"). With the literal
chroma-envelope-only basis, all three now FAIL: Neutral and Brand are both anchored (all 16 default
palettes carry `anchor`), and an anchored ramp's chroma no longer reads `palette.chroma`/`rampChroma`
at all — Base chroma becomes a no-op for every anchored ramp, group-wide, which REQ-002 forbids.

I did NOT build a third workaround to silence this myself (the brief's own "do not fork it" instruction
reads as a direct response to my own prior pass, which DID fork chromaEnvelope's design into a custom
anchor-to-group lerp specifically to satisfy REQ-002 — that fork is exactly what step 1 retracts). Per
"Done means: if a second workaround appears for the same symptom, stop and write the measurement as a
question" — this is that: the SAME symptom (REQ-002 break) recurring against a SECOND literal-anchor-
basis design, after my own blend already proved one way to avoid it. Options as I see them, decision is
the owner's:
(a) Amend REQ-002 with a named carve-out for anchored palettes (mirroring Data's own `locked` carve-out
    in the same REQ-001 table) — anchored ramps intentionally stop tracking group Base chroma, since the
    anchor already fixes the group's "true" source chroma; `(gid3)`/`(gid8)`/`(gid8b)` gain a named
    exception or get rewritten for the anchored case.
(b) Keep REQ-002 as ruled and amend Finding 1 the same way my own reverted pass did: `chromaEnvelope`'s
    OWN pivot-basis argument is not `anchor.cam.chroma`/`anchor.okhsl.s` unconditionally, but a value
    that still equals the anchor's own measured chroma exactly at stop 500 (satisfying the notch fix)
    while remaining responsive to `rampChroma`/`palette.chroma` away from the pivot (satisfying REQ-002)
    — this is architecturally a bigger change than "call it, do not fork it" describes, so needs the
    owner to say whether it is back in scope.
(c) Something else the owner rules that I have not construed.

Left the current LITERAL implementation in place (matches the brief's explicit instruction) rather than
reverting to my own prior blend, since re-deciding unilaterally a second time is exactly what this rule
exists to prevent — `(gid3)`/`(gid8)`/`(gid8b)` are RED on this head, named here as the reproducible
evidence, `npm test` is NOT green until this is resolved. Continuing with the rest of the repair-pass
sequence (step 1b onward) where it does not depend on this specific basis being final; NOT proceeding
to Finding 5's floor re-measurement (which needs a stable final chroma basis to be worth measuring once,
not twice) until this is ruled.

**Addendum, step 1b (F4):** the curve/tension composition (see the F4 addendum below) surfaced one
further, related symptom on top of the SAME chroma basis: `brands "Nike · The Swoosh · Since 1971"
secondary` (one of C5's own 10 named window-clamp sources, anchor `#101820`), peak mode, DEFAULT
controls (skew 0, lift 0), rises 5.9827 -> 6.0070 measured CIELAB L* at stops 825 -> 850 (chroma
10.74 -> 9.70, a Helmholtz-Kohlrausch coupling, the same class #668 fixed). Root cause: this preset's
GENERATED `dampAmp` is 55, not 0 — `scripts/gen-categories.mjs`'s pre-U3 `VIVID_MIDS.dampAmp` default,
which the plan text names as U3's OWN fix ("`VIVID_MIDS.dampAmp` 55 → 0, Q7 ruled"), not landed on this
branch. `chromaEnvelope`'s shoulder term humps chroma non-monotonically at `dampAmp > 0`, and my new
curve/tension-shaped `l` (peak mode pins full shaping, t=1) changes shape fast enough in this exact
near-black clamped corner for the two to interact into one measured-L* uptick — confirmed the straight-
lerp construction (pre-F4, same chromaEnvelope/dampAmp=55) did NOT trigger this for the same preset,
so F4's own composition is the proximate cause, not chroma alone. 1 of 10,140 rendered ramps. Left the
composition in place (never a silent lerp, per instruction); will name this ramp as a bounded exception
in the Finding 0+6+7 gate rebuild rather than block on it, the same discipline U3's own chromaEnvelope
comment uses for its 21-cell synthetic exception — flag here in case the owner wants it treated as
blocking instead, since unlike U3's synthetic cells this one is a real shipped preset.

Three points where the plan text disagrees with itself or with what the built-and-measured tree
shows. Re-measured on this unit's own branch, not assumed from the plan's older figures. I picked a
reading for each and kept building rather than block, per instruction; flagging so a wrong guess is
caught before it compounds into U3/U4/U6.

## Q-U2-1: does the RAMP's stop 500 stay exact for the 10 out-of-window sources, or clamp?

C3 says "for every anchored palette, `paletteStops(...)` stop 500 hex equals `anchor` ... (3 × 3,380
checks, 0 misses)" — no carve-out. C5, two sentences later, says the opposite for the SAME 10 named
sources: "the ramp's stop 500 lands at the window edge nearest the source." My own dispatch text
also says it both ways in one line: "the token stays exact, the ramp clamps."

**Read as:** "the token" = `prime.DEFAULT` (prime.mjs, U1's scope, unconditionally exact, all 3,380).
"the ramp" = `paletteStops` (my scope): exact at stop 500 for the 3,370 sources inside
`[RAMP_L_MIN, RAMP_L_MAX]`; for the 10 named out-of-window sources, stop 500 renders through the
SAME continuous construction as its neighbours, evaluated at the clamped pivot (not the anchor
byte-for-byte). I built it this way — the alternative (force the verbatim anchor at stop 500
regardless of the window) reproduces a real bug: the clamped pivot the OTHER 24 stops shape around
is a different value than the verbatim anchor, so stop 500 sits on the wrong side of stop 550,
inverting the ramp there (measured, before this fix: `film "The Night of the Hunter..." primary`,
stop 500 = 7.32 L*, stop 550 = 9.30 L* — lighter than 500, non-monotone). C3's own gate (mine to
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
instruction to suppress U2's branch for a named subset of palettes — there is no mechanism in my
scope to do that suppression, and C3's checked count (3,380) already includes all 16 defaults. Built
accordingly: the default kit's ramp DOES move under U2 alone (measured — Success/Warning/Danger's
existing non-zero lift now warps around their own anchor's L* instead of a cusp construction).

## Q-U2-3: 119 corpus sources need a named allow-list for the ramp's OWN monotone/distinct gate, not just the 10-name window list

C5's stated allow-list (10 names) covers only the stop-500-clamp population. Measuring the FULL
25-stop export ramp's own monotone/≥0.55-L*-gap/no-duplicate-hex requirement over all 3,380 × 3
modes (10,140 ramps), after the lift:0 regeneration and the #668-class damping fix (both landed in
this unit — see handoff), **119 sources** (all low-to-moderate chroma, max 29%, concentrated at the
window's own dark/light edges) fail the ≥0.55 L* neighbour-gap and/or produce a duplicate hex
somewhere in the 25-stop ramp, in at least one of the three modes — none of them non-monotone (that
count is 0, matching the 10-name clamp population exactly). Root cause: OKHSL's own `l` is not
uniform in measured CIE L* near the gamut's dark/light corners (the window's `[9.95, 95.05]`
derivation assumes a linear L* relationship, true for the `even` path's direct L* interpolation but
only approximate for `perceptual`/`peak`'s OKHSL-`l` interpolation); I tried retargeting the OKHSL
ladder to interpolate in true L* and convert via `okhslLAt`, which made it WORSE (358 violations, not
better) because that conversion assumes zero saturation and these are colored ramps — reverted.

This is the same class of "hex inequality is the bar, not channel distance" finding U1's own review
recorded for the prime ladder (53 near-duplicate-but-not-identical rungs, accepted). I built
`test/engine/anchor.mjs`'s `anchor-ramp` gate to name these sources by source (frozen, sorted, compared
by name not count, same discipline as U1's `ORDER_ALLOW`/`DUPE_ALLOW`), rather than either silently
passing them or blocking the unit on a construction change with no clear win. Full frozen list is in
the gate file itself.

**2026-09-18 update, independent review `pif-u2-review-1.md` (F1/F2/F5):** the review found this
gate (C5) was measuring a raw `paletteStops(...)` proxy under `DEFAULT_CONTROLS`, not the rendered
product path — on the real path (`projectView(hydrate(preset))`), 16 anchored ramps were
non-monotone where the proxy read 0, caused by the anchored branches' chroma/`s` basis being
`palette.chroma` (the group's resolved ramp target, usually 100) instead of the anchor's own
measured value, which put a chroma notch/spike at stop 500 in 4,962 of 10,140 rendered cells (F2).
Fixed both: the gate now sweeps `hydrate(preset)` × `projectView(...).palettes[i].fullRamp` per mode
(F1), and the anchored branches' chroma/`s` now LERPS from the anchor's own measured value at the
pivot (no notch) toward the group-driven target at each side's endpoint (F2) — a pure "anchor value
everywhere" basis, which is what the review's fix text describes literally, would have broken a
RATIFIED requirement (REQ-002, spec-muted-base-key-spikes 0.3.0, test/ui/headless-boot.mjs's
(gid6)/(gid8)/(gid8b): the group's Base chroma is an absolute per-group ramp target for every
palette including anchored ones) — the blend was needed to satisfy both. Re-measuring the gap/
distinct allow-list on the corrected rendered path moved the count from 118 to **119** (the figure
in this question's heading is now current); 0 non-monotone remains 0. The review's F5 finding (the
OKHSL-l-non-uniformity root-cause narrative above is "mostly wrong," explains at most 56 of the
population) was not re-investigated in this pass — still open, tracked here.

Review findings F3 (U2/U3 merge semantics), F4 (peak/perceptual collapse and Curve/Tension/Vibrancy/
hueSpace becoming no-ops for anchored palettes — Base chroma joins this list under the blended F2
design: it moves an anchored ramp LESS than a non-anchored one, by construction, never zero, but the
degree needs an owner ruling the same way F4's other four controls do), F6-F9 (default-kit movement
after Reset, floor drops, hue failures near-black/white) and F10 (records) were reviewed but are
NOT in this fix-first pass's scope (dispatch: "Fix the basis, rebuild the gate... tell me what the
merge needs") — still open, per-finding, for the owner.

Sequence risk if any of these three readings is wrong: U3 (chroma envelope) and U6 (prime ladder,
independent) both build on this branch's tone/lightness construction; U4's blast-radius report and
C6's owner-acceptance gate are the next checkpoint where a wrong reading here would surface as an
unexpected number.

## Q-U2-4: `docs/spec/spec-panda-park-ui-exports.md` is now stale (out of my lane; not fixed)

Not a plan disagreement — a NEW real gap this unit's own fix causes, flagged per the same instruction
rather than silently touching `docs/` (explicitly out of lane for me — my dispatch names "everything
under `docs/` except my own handoff").

While chasing `npm test` green I found `src/ui/model.mjs`'s `projectView` and `src/engine/exports.js`'s
`derivePalette` were both building narrowed object literals for their `paletteStops(...)` calls that
silently dropped the new `anchor` field (the same "subset-object gap" defect class U1's own review
found for `primeSwatches` calls). Fixed both (see handoff's Files Changed) — this is squarely necessary
for the feature to work end-to-end, not optional. Consequence: the RAMP itself had been silently
ignoring every default palette's `anchor` all along; fixing the gap moved every ramp-derived color in
the whole default corpus (test/engine/exports.mjs's `panda`/`shadcn-baseline` gates and
test/engine/semantic.mjs's `role-contrast` pinned floors all needed re-measuring — done, all green
now, re-pinned with dated CARVE-OUT-style comments matching each file's own existing convention).

`docs/spec/spec-panda-park-ui-exports.md`'s EX-1/EX-2 (lines 427-442) mirror the SAME literals I just
re-pinned in `test/engine/exports.mjs` — confirmed stale (e.g. its `colors.primary.500` still reads
`oklch(0.546 0.2114 258.97)`, now `oklch(0.504 0.1867 258.99)`). EX-4's park ladder (lines 449-465,
Neutral's raw ramp stops 1-8) is very likely ALSO stale for the same reason but I did not fully
re-derive it — no test gate mirrors EX-4's literals (radix/shadcn-chart-6-8 stayed green untouched),
so this is genuinely undetected by any automated check, not just my own unit's gate.

This is the SAME shape of drift ticket #681 U1's `690b0a1` already ruled on for a narrower case (U6's
prime-ladder literal, routed to U5's revision-9 SPEC batch) — except mine touches the WHOLE corpus
(every ramp-derived EX-1/EX-2/EX-4 literal), not three fields. Recommend routing this the same way:
to U5's SPEC-doc pass, or a dedicated follow-up ticket if U5's scope doesn't already cover EX-4.
