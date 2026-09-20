---
kind: handoff
unit: pif-u4-integration (plan preset-intent-fidelity, ticket #681, unit U4)
written: 2026-09-19
updated: 2026-09-20 (pass 5, records-only, verifier verdict pif-u4)
branch: unit/pif-u4-integration
base: 834a4d8d (plan/preset-intent-fidelity)
head: the tip of `unit/pif-u4-integration` - a commit cannot name its own sha, so a literal value here
  goes stale the moment it is written (the same trap U2's live sha table hit); resolve it with
  `git log -1 --format=%H unit/pif-u4-integration` instead of trusting a number in this file. This
  record's own commit is the LAST one in the round history below - nothing here is pending. Round
  history, by commit subject (not sha, for the same reason): pass 1 "chore(assets): regenerate
  committed artifacts for the integrated engine"; round 1 fix "fix(color-engine): U4 pass 2, fold
  review pass 1 fix-first findings"; round 2 "fix(color-engine): U4 pass 2 round 2, apply both
  team-lead addenda"; round 3 "fix(color-engine): U4 pass 2 round 3, review-2 fix-first items + Q7
  ratchet gate"; round 4 "fix(color-engine): U4 pass 2 round 4, ratchet perf follow-up + review-3
  comment fixes"; pass 5 "docs(sdlc): U4 pass 5, records-only, verifier verdict pif-u4" (this round,
  the tip as of this commit).
---

# U4: integration, blast-radius report, pending-U4 re-measurements

Merges U1 (anchor field), U2 (ramp pass-through), U3 (chroma envelope), U6 (prime ladder rebuild) in
that order onto one worktree, regenerates every committed asset, and reports the numbers Step 2/3 of
the brief assigned to this unit. This document is written for the owner to rule on; nothing in it is
silently re-pinned without saying so.

## Pass 2 (2026-09-20): fixes applied against review pass 1 (FIX-FIRST)

Review pass 1 (`pif-u4-review-1.md`) found two coverage holes (F1, F2) that had to be settled before
integration, corrected two of this handoff's own conclusions in the owner's favour (F3, F4), and named
five more record/derivation corrections (F5-F9). This pass:

1. **F2 fixed** - prime gates (e) and (h) in `test/engine/prime.mjs` gained a non-anchored companion
   probe each (anchor-stripped, same pattern as (g)/(j)), restoring the coverage the all-anchored
   `DEFAULTS` population had silently lost. Proof obligation met: with the fix in place, the review's
   own repro mutation (`src/engine/prime.mjs:156`, `keyChroma = ... * pk.c * 0.95`) reds gate (h) in a
   scratch copy - `FAIL  h  - Neutral/cam16 (anchor stripped): prime rgb [114,124,150] vs
   deriveKeyColor rgb [113,124,151] (diff [1,0,1])`. (h)'s stale residual-coverage claim corrected in
   its own comment: all 16 default anchors round-trip byte-exactly, so the real coverage for a
   re-derived anchor branch is `anchor.mjs`'s `anchor-identity` over the full 3,380-anchor corpus, not
   this gate.
2. **F1 fixed** - `test/engine/anchor.mjs`'s `referenceNonAnchored` now calls its own PRIVATE,
   OKHSL-domain `referencePrimeSteps` (a verbatim port of prime.mjs's own pre-#681 redistribute rule,
   `origin/main` commit `91957732`), never the shared post-#681 `primeSteps`. The reading is UNCHANGED
   (0 exact, 3,796 off) but is now honest: verified directly that the prime rung (index 3) matches
   exactly on every subject tested (as REQ-056 requires), and the six ladder rungs never match because
   U6 genuinely rebuilt the whole non-anchored construction, not because of a units bug. A second
   negative control (mutate `skew`, which only bends the six ladder rungs, never the prime rung) proves
   the six-rung comparison itself discriminates. Stale prose at the old `anchor.mjs:206-212` (OKHSL `l`,
   "prime.mjs's F1 widening search") corrected - the F1 widening search is real again (item 3), so the
   comment is accurate once more, restated for the CIE-L*/equal-compress construction.
3. **Finding A fixed at the construction** (not stopped/costed - a port, not new construction).
   `src/engine/prime.mjs`'s `primeSwatches` gained an F1-style widening search, ported from U1's own
   pre-U6 OKHSL widening loop (commit `7bda1d7e`) into the CIE-L*/equal-compress domain: when the
   clamped ladder pivot's `roomUp`/`roomDown` collapse the six non-prime rungs to duplicate hexes, the
   pivot widens symmetrically (both sides move together, preserving equal-compress's own "up === down"
   invariant - unlike the old per-side redistribute rule) until the rungs are distinct, capped at a
   full `STEP_L` of reserve per side. Verified: `sixMono` now holds unconditionally (0/3,380 exceptions,
   no allow-list, as originally documented) - Double Indemnity's ladder now reads six genuinely distinct
   values instead of six duplicates at the boundary. `ORDER_ALLOW`/`DUPE_ALLOW` re-measured and
   re-frozen by name: **26 (was 23 pre-#681) / 3 (was 4 pre-#681)**, both machine-checked against
   `anchor.mjs`'s own N1 sorted-array comparator, not just a count.
4. **Owner ruling applied verbatim** (lone-spike, the 64) - `test/engine/anchor.mjs`'s
   `anchor-ramp lone-spike` gate is now a named, counted allow-list (`LONE_SPIKE_ALLOW`, 64 entries,
   same `NOTCH_ALLOW` treatment: sorted-array comparison plus drop/swap negative controls), with the
   mechanism cited in the file's own comment. §7.6 below has the full root-cause writeup (F3).
5. **F5 fixed** - a real C7 negative control now exists (`test/engine/tonal.mjs`): deletes one call
   site's text from a scratch copy of the source and confirms the count-5 assertion actually reds.
6. **F4 re-measured** - #668's negative control re-run against `bf2aaf6`'s own category files (not
   the integration head's regenerated ones); reproduces the addendum's 11/46/11/43 baseline exactly.
   **#668 is CLOSED.** §10 below corrected; PR body line corrected.
7. **F7 re-derived** - the blast-radius headline table (§8) re-run with the iteration shape stated;
   reproduces the review's own independent figures to four significant figures.
8. **F8, F9 applied** - `test/engine/semantic.mjs`'s two misleading 2dp re-pin comments now print 4
   decimals; em dashes removed from this unit's own three `.sdlc` records (handoff 64, questions 19,
   the u3-movement record 7 - U1/U2/U3 commit-history em dashes are untouched, per instruction); the
   `test/engine/prime.mjs` gate count corrected to 20 (was misstated as 21) everywhere in this handoff;
   §4 below now names the anchor.mjs group failures in console print order.

`npm test` result, the prime-gate mutation FAIL line, and the re-derived ORDER_ALLOW/DUPE_ALLOW are
also reported at the end of this document, in a dedicated "Pass 2 final numbers" section.

### Pass 2, second round (2026-09-19/20): two addenda from team-lead, both now applied

Team-lead sent two addenda to the pass-2 brief after the round above landed. Addendum 1 ruled that Q1,
Q3, Q5 settle by standing rule (`.sdlc/questions/standing-rulings-2026-09-20.md`,
`plan/records-followup` at `376d6c57`) rather than going to the owner. Addendum 2 (marked highest
priority, "outranks everything else in this brief") found that several #681 allow-list gates
(`findDips`, `above100Violators`, `check`'s (i)/(ii), `cuspRunFor`, and `scripts/report-preset-
fidelity.mjs --envelope`) constructed their palette literal WITHOUT `anchor: pal.anchor`, so they never
rendered the real, shipped path for an anchored palette - the exact same defect class this ticket has
now caught three times (duplicate `chromaEnvelope` export, `referenceNonAnchored`'s domain mismatch,
now this). Both are now resolved:

9. **Addendum 2, the dip gate (F1 peak-cap trade population), corrected.** §7.3's pass-1/pass-2 claim
   that this population "appears to be genuinely, fully resolved" is **withdrawn - it was never
   supported**: the measurement never rendered the anchor. Fixed all 4 `test/engine/tonal.mjs`
   functions (`check`, `findDips`; `above100Violators`/`cuspRunFor` fixed then reverted, see item 11)
   and `scripts/report-preset-fidelity.mjs`'s envelope sweep to include `anchor: pal.anchor`, matching
   `projectView`'s own real call. Re-measured on the corrected path: **peak stays genuinely at 0** (all
   6 previously-named `DIP_BASELINE` witnesses carry a real anchor and do not dip on their own real
   render - `DIP_BASELINE` retired to empty, not left stale); **even now reads 90** (was invisible at 0
   under the bug), all at stops 450 (57) / 500 (32) / 550 (1), the anchor pivot and its immediate
   neighbours - mechanism and the full 90-name list are in `EVEN_DIP_BASELINE`'s own header comment in
   `test/engine/tonal.mjs`. **Scope qualifier (review pass 2, F2):** this 90 is the gate's OWN scope -
   3,764 generated palettes (`dampAmp === 0`), the Adia kit's 16 excluded by that filter (pre-existing
   U3 scope, not this pass's doing). The full rendered corpus (Adia included) reads 106 even-mode dip
   instances at the identical stop split (450/500/550) plus 16 - all 16 additional hits are Adia's own,
   at stop 500. 106 - 16 = the pinned 90 exactly; not stated as "90" without this qualifier again below.
   The peak-mode negative control (F1's old bisection-bug patch) was dead on
   the corrected path (0 buggy dips - `okhslStops` routes every anchored palette through
   `okhslStopsAnchored`, which has no bisection at all) and is replaced with a patch to the shared
   `anchorChromaBasis` smoothstep weight (3,987 buggy dips, clearly live). `test/engine/tonal.mjs`'s own
   `chroma-envelope` group is fully green after these fixes.
10. **Addendum 2, lone-spike, default kit added, Data 7 reported separately.** The lone-spike sweep in
    `test/engine/anchor.mjs` only ever walked the 8 curated categories - never excluded, just never in
    that loop's subject list. Added a small, separate default-kit-only lone-spike sweep (not folded into
    the shared C5/notch loop, to avoid opening 6 unrelated allow-lists addendum 2 did not name). Found
    exactly one hit, matching addendum 2's own prediction: `default kit "Default" Data 7 #088585 stop
    500`. Gated as its OWN named allow-list (`DEFAULT_KIT_SPIKE_FINDING`), explicitly NOT folded into
    `LONE_SPIKE_ALLOW`'s 64 - per addendum 2's instruction, and because folding it in would also fold in
    the plan's separate "0 notched cells in the default kit" invariant, which needs its own sign-off.
    `LONE_SPIKE_ALLOW` itself is unaffected (still 64, unchanged names) - it already swept via
    `projectView(hydrate(preset))`, the rendered path, so it never had this bug.
11. **New finding (addendum-2-adjacent, not one of its 5 named targets): `above100Violators` and
    `cuspRunFor` cannot be switched to the anchor-aware path without a scope ruling.** Applying the same
    `anchor: pal.anchor` fix here (as the general "every #681 allow-list gate reads the rendered path"
    ruling would suggest) does not surface a bounded, nameable population - it surfaces that the "0
    above the anchor's own chroma" and "one above-anchor cusp run" invariants do not hold AT ALL for an
    anchored palette, at massive scale: 1,205/3,380 anchored generated palettes violate "0 above 100%"
    on even (35.7%), 3,119/3,380 (92.3%) on peak, versus 0/384 non-anchored violators on either mode
    (measured directly, palette-level). Mechanism: for an anchored palette, stop 500's chroma is pinned
    to the anchor's own real, arbitrary measured chroma (`paletteStopsAnchored`'s stop-500 special
    case) - it has no designed relationship to being the ramp's peak, unlike the non-anchored
    construction these invariants were built and owner-ruled against (Q7 pass 4/5). `cuspRunFor`
    (perceptual only) shows the same shape: 958 multi-run + 712 bound-excess instances on the corrected
    path. Given the scale, naming each instance would not be "63 departures with individual causes" in
    the Q3 sense - it would be "this invariant does not apply to this palette class," a scope question,
    not a bounded defect list. Resolution taken: **left both functions on the non-anchored measurement**
    (matching what they have always tested and what Q7's own rulings were reviewed against), with the
    measured numbers and mechanism cited directly in each function's own comment in `test/engine/
    tonal.mjs`, flagged for a scope ruling (likely resolution: carve out anchored palettes from (iii)/
    (iii-b), symmetric with perceptual's existing carve-out from (iii) for an analogous reason) before
    either is safely switched to the rendered path. `scripts/report-preset-fidelity.mjs --envelope` DOES
    render the full anchor-aware path (per addendum 2's explicit instruction for that script) and now
    honestly reports this same population as FAIL under both readings - this is expected and correct;
    that script is a diagnostic report, not an `npm test` gate.
12. **Addendum 1, Q1 (C4 reconciliation), RESOLVED.** §7.4-7.5's "Finding B" is no longer an open owner
    question. `prime-identity-control`'s "0 exact, 3,796 off" reading is the CORRECT, expected result of
    U6's rebuild replacing the non-anchored ladder construction too (not just the anchored branch) - the
    gate's own assertion is inverted to match: it now asserts `ctrlOff === controlSubjects.length` (a
    total, uniform migration) and reds if ANY subject still matches the retired reference (a partial,
    inconsistent migration, which would be a real defect) or if the count drifts from the full total.
    `test/engine/anchor.mjs` fully passes with this change.
13. **Addendum 1, Q3 (NOTCH_ALLOW 78->15), RESOLVED.** Re-measured directly: the current integration
    head's real notch population is 15 (all even mode), a CLEAN SUBSET of the old 78-entry list (0 new/
    unexpected members, all 63 departures are removals - verified by direct set difference). Cited
    mechanism: commit `2573208c` "re-centre chromaEnvelope on the anchor's own lifted reading" (#681 U3
    review pass 2, R2), already merged into this integration head via `ed14832b` before this pass
    started - not a side effect of any U4 fix. All 63 departed names are recorded in
    `.sdlc/questions/pif-u4.md` (Q3) and in `test/engine/anchor.mjs`'s own `NOTCH_ALLOW` comment.
    `NOTCH_ALLOW` updated to the 15 current names; gate passes.
14. **Addendum 1, Q5 (two witness re-pins), RESOLVED, properly derived.** `hue-solver-best`'s "Neutral"/
    perceptual stop-500 cell: Neutral's own current internal (s, l) no longer discriminates the old
    buggy hue-solve rule from the fixed one (both now read back the same hue at this cell - not a
    regression, just a coincidence at this particular staircase tread). Scanned the full default kit
    (16 palettes x {perceptual, peak}) for a real, currently-discriminating, wide-margin replacement:
    `Data 2`/peak (oldErr 0.2603 deg vs solved 0.0269 deg). Verified: still a staircase case (old rule
    does not converge), solved hue reproduces the emitted stop-500 pixel byte-for-byte, old rule
    strictly worse than solved. `intensity-legacy`'s Data 1 stop-400 fixture cell: isolated to exactly
    one of 25 cells (`#9789FB` -> `#9789FA`, one 8-bit LSB), caused by `okhslStops` resolving one hue at
    stop 500 and reusing it for the whole non-anchored ramp - a later solveOkhslHue refinement already
    in this integration head's own review-pass chain moved that one shared hue by under one float ULP,
    just enough to tip stop 400's own rounding boundary. Patched the single fixture cell by hand
    (`test/engine/fixtures/tonal-legacy.json`, one line), not regenerated wholesale. Both derivations
    are reproducible: the exact probe method (instrument `okhslStops`'s own `hOk = solveOkhslHue(...)`
    call, or diff the ramp cell-by-cell against the fixture) is cited in each fix's own code comment.
    `test/engine/tonal.mjs` fully passes with both re-pins.

After items 9-14, `test/engine/tonal.mjs` and `test/engine/anchor.mjs` both run clean (no FAIL lines at
all - confirmed by direct runs, not just the group-deduped summary). §7.1, 7.2, 7.3, 7.4-7.5 below are
pass-1/pass-2-first-round text, kept for the record; each is superseded by the corresponding item above.

### Pass 2, round 3 (2026-09-20): review pass 2's three narrow FIX-FIRST items

Review pass 2 (`scratchpad/pif-u4-review-2.md`) reproduced every pin round 2 moved on its own
independent sweeps and reds nine gates by hand, including F2's proof obligation - verdict FIX-FIRST on
a narrow, three-item list, none requiring re-measurement. Q7 was ruled (a): the builder's non-anchored
measurement and escalation are correct behaviour. Applied:

15. **F1 - `ORDER_ALLOW`'s header corrected.** The header stated only ONE mechanism (out-of-window
    clamping) for all 26 members; 5 are actually in-window and land on the list via a SECOND mechanism
    the header never named - the widening search's pivot can lift above the source's own `lPrime` for
    an anchor within one reserve step of `PRIME_L_MIN`, so `prime` (rendered at the real `lPrime`) no
    longer sits between the lifted-pivot ladder's `bright`/`dim` rungs. `test/engine/anchor.mjs`'s
    `ORDER_ALLOW` header now states both mechanisms and names all 5 in-window members (3 new this
    pass: "Enter the Void" secondary, "The rave" secondary, "Hidaka coast" tertiary-muted), citing the
    reviewer's own confirmation (disabling the widening drops these 5 out of `ORDER_ALLOW` and into
    `DUPE_ALLOW`). No count moved; the fix is the comment, not the numbers.
16. **F2 - the default kit added to the (iv) dip sweep; Adia scope qualifier added to the "90" figure.**
    Addendum 2 said the default kit is IN the sweep; round 2 applied that to the lone-spike sweep
    (`test/engine/anchor.mjs`) but the dip gate (`test/engine/tonal.mjs`) kept iterating the 8 curated
    categories only - not excluded on purpose, just never extended. Fixed with a SEPARATE array
    (`dipDocs = [...docs, defaultKitDoc]`), not by widening `docs` itself: `docs` is also read directly
    by `above100Violators`/`cuspRunFor` (Q7's open scope question), and widening it would have silently
    changed their measured population too, which is explicitly not this round's job. Measured impact:
    **zero** - the default kit reads 0 dips in all three modes (verified directly), so `EVEN_DIP_BASELINE`
    (90) and `DIP_BASELINE` (0) are unchanged. Item 9's "90" is also now qualified: it is the gate's own
    scope, 3,764 generated (`dampAmp === 0`) palettes with Adia's 16 excluded by that pre-existing
    filter - the full corpus including Adia reads 106 even-mode dips at the identical stop split plus
    16 Adia-only hits at stop 500 (106 - 16 = 90, reconciled exactly).
17. **Q8 ruled (owner, via the conductor) - applied.** The default kit's "0 notched cells" invariant is
    RESTATED, not broken: `notchOk`'s own predicate reads 0 for the kit in all three modes (verified
    directly, and independently by review pass 2). Data 7's lone spike is a DIFFERENT predicate. Cited
    in `DEFAULT_KIT_SPIKE_FINDING`'s own comment in `test/engine/anchor.mjs`: mechanism is `dampAmp` 0
    at the anchor (the same mechanism as the curated corpus's 64), fix joins #701, not this unit.
18. **F5, F6 - records.** Em dashes in this pass's own new comments in `test/engine/prime.mjs` (the F2
    gate-(e)/(h) companion annotations the earlier cleanup commit missed) removed. **Correction, review
    pass 3 (R3-2): this item originally claimed "3 remaining... removed"; the true figure was 3 of 5 -
    two more (lines 671 and 764) were still there. Both fixed this round (item 21 below); the count in
    `test/engine/prime.mjs` at this pass's own new comment lines is now 0.** §4 and the first "Pass 2
    final numbers" block marked SUPERSEDED, pointing at the current, accurate sections.
19. **Q7 ratchet gate added (owner's addendum, 2026-09-20).** Q7 keeps its ruling (a): C6 (iii)'s 0-of-384
    bar stays on the non-anchored construction only, unchanged. The anchored-peak population is not left
    unmonitored either - `test/engine/tonal.mjs`'s new C6 (v) is a RATCHET, not a pass/fail bar: it pins
    today's own re-measured (not the reviewer's cited) anchored-peak violator count and max overshoot
    ratio and reds only if either number rises on a future run. Re-measured this pass, directly against
    this file's own `paletteStops` call (19-stop display set, generated palettes, Adia excluded by name,
    3,764 palettes): **peak 3,119 violators, max 15.132599x stop 500's own chroma** (gated); **even 1,205
    violators, max 17.183605x** (companion figure, printed, explicitly NOT gated per the ruling - "for
    the report only"). Both figures reproduce review pass 2's own cited numbers (3,119/15.133,
    1,205/17.184) to the precision cited, confirming an independent re-measurement rather than a copy.
    Negative control: a scratch copy of `okhslStopsAnchored`'s `intendedS * env` saturation line
    (`src/engine/tonal.js:1040`) amplified 1.6x reads 3,378 violators / 25.863456x max, clearly past both
    pins, proving the ratchet reds on a real regression. Both numbers are also their own row in the
    blast-radius report below (§9).
20. **Perf fix, same round (team-lead's direction, after per-file profiling).** Item 19's gate added
    ~11.8s to `test/engine/tonal.mjs` (measured: 84.17s before, 95.98s average after, 3 runs). Per-sweep
    profiling isolated the cost: peak 2.2s (gated), even 9.4s (report-only, the dominant share), negative
    control 2.2s (corpus-wide at the time). Two changes, no other logic touched:
    - The anchored-EVEN companion figure moved OUT of the test suite entirely, into
      `scripts/report-preset-fidelity.mjs --envelope` (a new section, same corpus scope, same metric,
      reproduces 1,205/3,764 violators, max 17.183605x exactly) - the diagnostic script Q7's own ruling
      already routes report-only, anchor-aware measurements through. A figure that is never asserted does
      not belong in the test suite.
    - The negative control now runs on a 50-doc sample **(SUPERSEDED by item 21 below, review pass 3,
      R3-2's companion gap: the sample was "witness doc plus the next 49 in corpus order" here, a
      positional slice that drifts silently if the corpus is reordered - item 21 reseeds it
      deterministically by sorted preset name instead; do not cite "next 49 in corpus order" as the
      current mechanism)** instead of the full 3,764-palette corpus, checking only the max-ratio metric
      (the violator COUNT is scale-dependent and cannot be compared against the corpus-wide pin at
      reduced scale; max ratio is a single-witness property and stays valid at any sample size) - a
      control proves discrimination, not coverage.
    **Justification is not a suite-level wall-clock delta** - team-lead's own framing, and the correct
    one: the gate no longer computes a figure it never asserts. The even sweep's own cost was measured
    directly, within a single run, against its own `Date.now()` markers: **9.4s** (9,449ms). The
    negative control's own cost, same method: **2.2s** (2,242ms) at full-corpus scope, now sampled.
    Both numbers are real, isolated, cross-run-noise-immune measurements, and both are now gone from
    `npm test` (the even sweep entirely; the control cut to a 50-doc sample). Code inspection confirms
    the even-mode call is structurally gone; `scripts/report-preset-fidelity.mjs --envelope` reproduces
    the identical figures where it now lives (peak 3,119/15.132599x, even 1,205/17.183605x, 24.3s of
    its own wall time, not part of `npm test`). The suite-level effect of this fix sits inside this
    host's own run-to-run variance: 4 post-fix standalone `tonal.mjs` readings ran 84.74s / 88.89s /
    99.91s / 103.16s, and 4 pre-fix readings ran 84.17s / 95.49s / 95.57s / 96.89s - roughly 89-103s
    either way, a noise band wide enough to swallow an 11.6s change. The ceiling question itself (a
    distributed, largely pre-existing cost across `anchor.mjs`/`headless-boot.mjs`/`prime.mjs`, see
    "Follow-up: per-file wall time" in `.sdlc/handoffs/pif-u4-q7-ratchet-profile.md`) is with the owner,
    not this unit's to chase further.
21. **Round 4 (review pass 3: PASS on the substance, two comment items, one gate-arm gap).** Review 3
    confirmed the C6 (v) ratchet meets every clause the owner set and that its ratio-arm control bit
    under four mutations the reviewer ran independently; nothing review 2 established regressed.
    - **R3-1**: `ORDER_ALLOW` clause (ii)'s header quoted `3 * STEP_L` as both the threshold and the
      pivot constant - a 27 L* band holding 532 anchored palettes, which does not discriminate the 5
      members it is meant to explain. The real bound is `PRIME_L_MIN + 3 * reserve`, using whatever
      reserve the widening search stops at (only the ONE member that never separates reaches the full
      `STEP_L` cap). Corrected in `test/engine/anchor.mjs`'s `ORDER_ALLOW` header. Re-verified, not
      copied: each of the 5 members' own CIE L* (from its anchor hex directly, independent of the
      search's internals) sits within 1.11 L* of `PRIME_L_MIN` (12.2500): 12.3351 to 13.3550, matching
      the review's own figures.
    - **R3-2**: item 18's "3 remaining... removed" claim was wrong; the true count was 3 of 5. The
      other 2 (`test/engine/prime.mjs:671` and `:764`) fixed this round; corrected in item 18 above.
    - **Gate-arm gap**: the sampled ratio-arm control (item 20) only ever exercised the ratio half of
      "reds if EITHER the violator count or the max ratio rises." A count-only regression is a real,
      distinct failure mode (the worst witness's own OKHSL saturation is already clamped to 1 at its
      peak stop, so a broad amplification that also tips OTHER, previously-unclamped near-1.0 palettes
      over could raise the count while leaving that clamped witness's ratio flat) - not something that
      can honestly be ruled out. Closed with a SEPARATE, synthetic control: a stub engine and a
      purely synthetic doc list (not the corpus, not the real engine) where every entry overshoots by
      the same fixed 1.005x, so a count past the pin cannot also carry the ratio past it - the two FAIL
      conditions are now exercised independently. Also seeded the ratio-arm control's sample
      deterministically (sorted by `__presetName`, not "next 49 in corpus order," which would have
      drifted silently if `CATS` or a category's `PRESETS` array were reordered).
    `npm test`, `gate:corpus-contrast`, citations, branding all re-run green after these changes
    (numbers below, this section's own final run).

F4 (the widening's visible blast radius on 26 shipped palettes) is a review finding for the owner, per
the round-3 brief's own instruction not to act on it - already recorded plainly in §8/the blast-radius
table and not softened here. F3 (Q7) is no longer open: item 19 above is this round's mechanical
follow-through on the owner's ruling.

### Pass 5 (2026-09-20): records only, verifier verdict pif-u4 (22 green, 3 yellow, 3 red - every red a record)

The engine is green: every allow-list, Finding A, #668, #686 and `npm test` passed independently on the
verifier's own re-derivation. No source change is in scope except the em dashes fixed above (row 28: 2
in `.sdlc/handoffs/pif-u2.md`, 2 in `test/engine/semantic.mjs`, both now 0). Rows 21 and 22 (the wrong-
quantity yielded cells and the missing C6 median/p90 table) are fixed above in §7.3/§7.6. This section
covers the three yellow rows and the gate-time ruling.

**Row 13 (yellow): the C4 ramp half has no gate and no `--identity-control` mode, and the migration
size was never written down.** `prime-identity-control` (item 12 above) covers the PRIME half only. The
ramp construction also fully migrated off the retired pre-#681 reference at U6 (not just the anchor
branch), the same finding Q1 already settled for prime - but nothing measures or records it for the
ramp. Re-measured independently this pass (own dump/diff tooling, not the verifier's script, though it
reproduces the verifier's own cited figures to the precision cited): head's engine rendering `bf2aaf65`'s
own anchor-free corpus (`anchor`/`sourceAnchor` stripped before hydration - the pre-#681 shape) against
`bf2aaf65`'s own engine on its own corpus, export25 stop set, n=94,500 cells/mode:

| mode | palettes moved | cells moved | median \|dL*\| | max \|dL*\| |
|---|---|---|---|---|
| perceptual | 3,780/3,780 | 52,980/94,500 | 0.0261 | 2.5961 |
| peak | 3,780/3,780 | 52,950/94,500 | 0.0338 | 4.3634 |
| even | 3,780/3,780 | 37,144/94,500 | 0.0000 | 0.4289 |

Every palette moves in every mode. This is EXPECTED, not a regression: U3's own retune and #668's fix
(both landing on the ramp construction after `bf2aaf65`) are exactly the kind of change that moves
every rendered cell by design. It was measured before (informally, in earlier passes' own witness
checks) but never written down as a corpus-wide number with a gate or a report mode behind it. No gate
is added here (out of this pass's records-only scope; a `--identity-control` mode for the ramp half, or
a dedicated gate, is a real follow-up, not a records fix) - the number itself is now on the record.

**Row 20 (yellow): the F1 peak-cap trade's tone-drift and hue-residual figures, carried to U4 by
revision 24, were never re-measured in the U4 records.** The plan states (revision 24, ruling 3): "F1's
peak-cap trade (dips 221 to 6; tone drift 35% > 0.01 L*, max 0.10; hue residual <= 24.6 deg) accepted
for U3, ruled at U4 with final numbers." Dips reproduce at row 9 (0 of 6 named baseline dips observed).
The tone-drift/hue-residual figures themselves do not appear anywhere in this unit's own records.

Traced the exact methodology (`.sdlc/questions/pif-u3.md:849-857`): "tone error" is the gap between
`okhslStops`'s internal `targetTone` (the pre-cap intended L*) and the achieved pixel's rendered L*,
measured ONLY at "capped" stops (n=5,814 at U3's own head) - the ones that actually routed through the
HCT fallback (`src/engine/tonal.js:1255`, `hctToRgb(polishHue, target, targetTone)`). "Hue residual" is
the same idea for `preCapOklchHue` versus the achieved pixel's OKLCH hue. Both `targetTone` and
`preCapOklchHue` are LOCAL to `okhslStops` (confirmed by reading the function, `tonal.js:1130-1263`) -
neither is returned by `paletteStops`, the public API this unit's own tooling (and every gate in this
file) reads. Reproducing these two figures from outside the engine would mean either instrumenting
`okhslStops` to expose its own internal target values (a real engine change - this pass's own brief:
"if you believe an engine change is needed, stop and tell me instead"), or approximating against a
DIFFERENT reference (e.g. the pre-peak-cap construction's own tone/hue), which is not the quantity U3
measured and would not reconcile against revision 24's own cited figures. Recorded here as a genuine
gap, not silently closed or manufactured: the owner needs either a real instrumentation change (a small,
named follow-up, not a records fix) or an explicit decision to accept U3's own last-measured figures
(34.5%/0.1009/24.62deg, `pif-u3.md:849-857`) as final before revision 24's ruling 3 can be called fully
reconciled at U4.

**Row 25 (yellow): the default kit is swept for lone-spike and dips only; "0 notched kit cells" is
asserted in a comment, not gated.** `window`/`gap`/`distinct`/`notch`/`monotone`/`order`/`dupe` all
iterate the 8 curated categories only. Measured directly this pass (same sweep shape as the existing
lone-spike/dip kit sweeps in `test/engine/anchor.mjs`, applied to the remaining checks): the default kit
reads `window: 0, gap: 0, distinct: 0, notch: 0, order: 0, dupe: 0` on every one of these checks, in
every tone mode - nothing is hidden today, the kit genuinely clears all of them. Recorded as a real gap
regardless, per the verifier's own framing: the plan's invariant is asserted by comment, not enforced by
a gate, so a FUTURE kit regression on any of these axes would pass silently. Extending the sweeps to
cover the kit is real gate-authoring work, out of a records-only pass's scope; the gap and today's clean
measurement are both now on the record for whoever picks this up.

`npm test`, `gate:corpus-contrast`, citations, branding all re-run green after this pass's changes
(numbers in the final section below).

## 1. Per-merge integration result

| Merge | Commit | Result |
|---|---|---|
| U1 anchor field | `b3cabb5e` | Clean, no conflicts. |
| U2 ramp pass-through | `508917d8` | Textual conflicts in `persist.js`, `anchor.mjs`, `exports.mjs`, three docs/reviews files, generated files - all resolved. |
| U3 chroma envelope | `ed14832b` | Textual conflicts in docs/reviews (2 files), `categories.mjs` (dropped stale `lift-anchor`, kept `ramp-monotone`), `exports.mjs` (EX-1 literals), fixture placeholders, generated files - all resolved. |
| (fix) | `135e3cfa` | Git's 3-way merge silently combined U2's and U3's independently-written `chromaEnvelope` exports into two co-existing definitions with no conflict marker - a real, undetected semantic break (see §2). Deleted U2's redundant copy, kept U3's superset (carries `EVEN_DAMP_FACTOR`). |
| U6 prime ladder | `31939051` | `src/engine/prime.mjs`'s 3-way merge left a non-functional hybrid: U1's old OKHSL widening-loop (referencing variables that no longer existed) mixed with U6's real construction. Rewrote `primeSwatches` from scratch combining U1's anchor detection with U6's equal-compress ladder. 9 of `test/engine/prime.mjs`'s own 20 gates assumed the non-anchored cusp construction the standalone U6 branch was built against; re-derived each against the real, landed anchors. All 20 gates pass on the integrated tree (detail in the commit body). |

Every merge except the last was gate-clean on completion. The U6 merge required real engine and test
reconstruction, documented in its own commit body and in §2 below.

## 2. C7: the chromaEnvelope call-count widening (its own named section, per instruction)

**Old count: 3. New count: 5.**

`test/engine/tonal.mjs`'s C7 gate greps `src/engine/tonal.js` for calls to `chromaEnvelope` and asserted
exactly 3 (the function's own definition plus its then-known call sites). On the integrated tree the
grep counts 5: the definition, plus 4 call sites - `paletteStopsAnchored`, `paletteStops`'s own
non-anchored damping path, `okhslStopsAnchored`, and `okhslStops`'s non-anchored path. This is not a
new duplication: U2's anchored branches now correctly route through the SAME shared envelope function
non-anchored code already used (the fix at commit `674bdef7`/`da59a8e7` upstream in U2's own history),
so what used to be one function shared by 2 non-anchored call sites is now shared by 2 non-anchored +
2 anchored call sites - one function, four call sites, one definition, five total appearances. The
gate's hardcoded `3` was a reading of a plan criterion that predates U2 landing; updated to `5` with the
call sites named in the updated comment.

**Negative control that reds (corrected, U4 review pass 1 F5, pass 2):** this sentence originally
claimed a scratch-source deletion control already existed for C7 and reds correctly. It did not - the
`ac004-greps`/C7 group at the time had only the count-5 assertion itself, no control. That control is
now actually written (pass 2): a scratch copy of `src/engine/tonal.js`'s source has one call site's
text (`paletteStops`'s non-anchored `chromaEnvelope(stop, 500, lift, controls)` line) deleted, the same
two regexes re-run, and the count is asserted to drop below 5. Verified reds correctly (part of
`node test/engine/tonal.mjs`'s own run, `ac004-greps` group). This control proves the count-5 assertion
reds when a real call site goes missing; it does NOT prove the grep would catch a differently-shaped
regression such as a second copy of the envelope formula inlined under another name, since a text count
of the literal identifier `chromaEnvelope(` cannot see that class at all - a real limitation, not
covered by this control or claimed to be.

## 3. `npm test` timing

**CORRECTED, pass 5 (verifier's Records section): this section previously led with the stale 692.42 s
/ load 220 reading from pass 1. Leading with the current reading below; the 692.42 s figure is kept
further down as historical context, not the number a reader should cite.**

**Current: 293.09 s wall (round 4's own head, 36ce7777), load at start 9.42 / 6.59 / 5.30.** Per-file
timing (sequential foreground, 48 files, load 5.16/5.05/4.80 at that reading): `engine/tonal.mjs`
100.2 s, `engine/anchor.mjs` 80.0 s, `ui/headless-boot.mjs` 61.0 s, `engine/prime.mjs` 54.9 s, all other
44 files under 10 s each (most under 2 s). Full suite readings observed across this round's own runs
ranged 284-344 s at loads in the 3.9-9.4 band, all well above the 175 s ceiling this plan originally
carried.

**Gate-time ruled by the owner, 2026-09-20 (verbatim, dated, per ticket #713):** "Interim ceiling now,
split sweeps into gate scripts as a new ticket (Recommended)." See `.sdlc/questions/pif-u4.md` for the
full citation. U5 (records) writes the interim ceiling into the plan's C1 and into `.sdlc/baseline.md`
at landing, marked interim, citing #713 - not this unit's job.

Full distributed per-file profiling, the perf follow-up on the Q7 ratchet gate's own added cost (9.4 s
even sweep, 2.2 s control, both since removed from the suite - round 4's own commit), and the
reasoning behind the interim-ceiling recommendation are all in
`.sdlc/handoffs/pif-u4-q7-ratchet-profile.md`.

**Historical, pass 1 reading (superseded by the above, kept for the record only): wall time 692.42 s.**
Load average at the time (`uptime`): **220.00 / 83.00 / 68.17** (1/5/15-minute). Per the addendum's
standing rule, any wall time over the 175 s ceiling at that reading was contention, not a regression.
`git status --short` was empty after the run once the regenerated assets from that run were committed
(§8). The known, documented, non-contention cost floor is real and separate from contention:
`.sdlc/adapter.md`'s own U6-review note records a measured **+21% CPU** from `hct.js`'s
cache-key-exactness fix (#686) closing a real order-dependence defect, corroborated independently at
+26%/+32% corpus-scale by a fresh-context reviewer - so even a quiet host reads somewhat above the
pre-#681 58-62 s baseline, a cost this unit did not attempt to recover at pass 1 (brief: do not
optimise on your own initiative) - the distributed, multi-file nature of the CURRENT cost (above) shows
that floor alone does not explain the present total either; the gate-time ruling covers the gap.

## 4. `npm test` exit status and the reds that remain

**SUPERSEDED (review pass 2, F6) - this section describes the round-1 state. At the current head
(`fa0264fa`/round 2, then round 3's fix-first commit), `npm test` exits 0, all 48 files pass, 0 gate
failures in either `tonal.mjs` or `anchor.mjs`. See "Pass 2 final numbers, second round" near the end of
this document for the current, accurate numbers. Kept below for the record.**

`npm test` exits 1. Of 48 registered test files, 2 fail after the fixes in §5-6 below:

- `test/engine/tonal.mjs` - 3 gate failures (§7.1-7.3)
- `test/engine/anchor.mjs` - as of pass 1, 3 gate groups failing (§7.4-7.6). Pass 2 fixed two of the
  three (Finding A, the anchor-ladder order/dupe-allow-list collapse, and the lone-spike gate, now a
  named, counted, owner-ruled allow-list) - see "Pass 2" section below. **2 groups remain red**:
  `prime-identity-control` (C4, an owner question per F1/Q1) and `anchor-ramp notch allow-list` (Q-C,
  the pending-U4 re-measurement this unit was explicitly asked to produce, not fix). Named here in
  console PRINT order (F9, U4 review pass 1: the pass-1 handoff enumerated these out of print order,
  and the group's first-printed failure line was easy to miss against this section's own ordering) -
  `prime-identity-control` prints first, `anchor-ramp notch allow-list` second.

`test/engine/semantic.mjs` (the Q-B/C8 re-measurement, §6) and `test/engine/prime.mjs` (the U6 gate
rebuild, §1/commit `31939051`) are both green on the integrated tree.

Per the brief ("stop and report - never carry forward or repair another unit's construction without
saying so first"), the reds in §7 are reported with full measured detail, not silently patched. Two of
the three tonal.mjs reds (§7.1, §7.2) and one anchor.mjs group (§7.4, §7.5) look mechanically
re-pinnable but I did not attempt the repin myself without being confident of the correct derivation
(§7.1) or without an owner ruling on the deeper construction question it exposes (§7.4-7.5). §7.6
(lone-spike) is an unresolved, un-triaged defect count. §7.3 is the already-known F1 dip-gate finding,
re-measured with a final number for this pass.

## 5. C1 control (record-only, per Step 4 item 3 - not editing the plan)

Ran the plan's own C1 negative control directly: corrupted `docs/reference/data/role-table.json`'s
`roleTable[0].light` to `999`, ran `node test/engine/semantic.mjs`. Result: **exactly 1 FAIL line**
(`refs-canonical - primary = 550/450 != canonical 999/450`), then `FAIL: 1 gate failure(s)`, exit 1.
This matches the plan's own corrected text (`.sdlc/plans/preset-intent-fidelity.md` line 207: "It is one
FAIL line, not 17"), not `.sdlc/adapter.md` §1's stale 17-line figure. My own control run reproduces the
plan's number, not adapter.md's; I have not edited either file for this (adapter.md is the planner's
repair per the brief). Source file restored byte-identical after the probe (`git status --short` empty).

## 6. Step 2 item 1 - C8/Q-B: the 96-cell `hpg-role-contrast` re-measurement

Fixed and green (commit `91a87d8`). Full measurement, before proposing/applying the re-pin:

**AA (4.5:1) holds everywhere: 0 violations, all 96 cells, all three modes, both schemes.**

**The Q-B population against the bf2aaf6 (pre-#681) baseline is UNCHANGED: the same 41 named cells**,
verified by exact name match (not just count) between a fresh 96-cell sweep on the integrated tree and
the existing `PENDING_U4` list. U3's damp/dampCurve retune and U6's prime-ladder rebuild, both landing
after this population was first ruled (Q-B, 2026-09-18), do not move which cells sit below their
pre-#681 value - a fully corroborating re-measurement, not a new finding.

Full 41-cell before/after (bf2aaf6 -> integrated-tree, all still >= AA):

| mode | family | side | bf2aaf6 | integrated | mode | family | side | bf2aaf6 | integrated |
|---|---|---|---|---|---|---|---|---|---|
| perceptual | Neutral | dark | 4.9 | 4.8 | even | Data 2 | dark | 5.8 | 4.6 |
| perceptual | Secondary | dark | 6.1 | 5.2 | even | Data 3 | dark | 5.8 | 4.8 |
| perceptual | Data 1 | dark | 5.5 | 4.6 | even | Data 4 | dark | 5.8 | 5.1 |
| perceptual | Data 2 | dark | 4.9 | 4.7 | even | Data 5 | dark | 5.8 | 5.3 |
| perceptual | Data 3 | dark | 5.1 | 4.9 | even | Data 6 | dark | 5.8 | 5.5 |
| perceptual | Data 4 | dark | 5.5 | 4.7 | even | Data 7 | dark | 5.8 | 5.4 |
| perceptual | Data 5 | dark | 5.8 | 5.0 | even | Data 8 | dark | 5.8 | 5.3 |
| perceptual | Data 6 | dark | 6.2 | 5.2 | peak | Secondary | light | 11.5 | 5.5 |
| perceptual | Data 7 | dark | 6.0 | 5.1 | peak | Secondary | dark | 15.1 | 5.6 |
| perceptual | Data 8 | dark | 5.8 | 4.9 | peak | Tertiary | dark | 5.5 | 5.3 |
| even | Secondary | dark | 5.8 | 5.5 | peak | Info | dark | 7.7 | 4.5 |
| even | Success | light | 8.0 | 7.6 | peak | Success | dark | 11.8 | 4.8 |
| even | Success | dark | 5.1 | 4.9 | peak | Warning | dark | 7.4 | 5.2 |
| even | Data 1 | dark | 5.8 | 4.9 | peak | Data 1 | light | 10.0 | 6.3 |
| | | | | | peak | Data 1 | dark | 6.7 | 4.9 |
| | | | | | peak | Data 2 | dark | 5.5 | 4.5 |
| | | | | | peak | Data 3 | dark | 5.1 | 4.7 |
| | | | | | peak | Data 4 | light | 6.3 | 5.9 |
| | | | | | peak | Data 4 | dark | 8.7 | 5.0 |
| | | | | | peak | Data 5 | light | 12.8 | 5.6 |
| | | | | | peak | Data 5 | dark | 16.7 | 5.3 |
| | | | | | peak | Data 6 | light | 11.6 | 5.4 |
| | | | | | peak | Data 6 | dark | 15.0 | 5.5 |
| | | | | | peak | Data 7 | light | 11.8 | 5.5 |
| | | | | | peak | Data 7 | dark | 15.5 | 5.4 |
| | | | | | peak | Data 8 | light | 6.3 | 5.7 |
| | | | | | peak | Data 8 | dark | 8.8 | 5.3 |

(Full per-cell values also live inline as comments in `test/engine/semantic.mjs`'s `FLOORS` table.) The
55 cells not listed above are at or above their bf2aaf6 value on the integrated tree.

**Proposed re-pin (applied, commit `91a87d8`):** four cells (even Primary light/dark, even Info dark,
even Danger light) sat fractionally below the SEVENTH-pass ratchet floor captured on U2's own branch,
before U3's retune landed - even Primary light moved from 7.54 to 7.4983 (floors to 7.4, was pinned at
7.5). All four stay above both AA and their bf2aaf6 baseline. Re-pinned per the table's own documented
rule ("an intentional default change has to move a number here deliberately") since U3's retune is
exactly that, already ratified in the plan; the owner-ruled 41-cell Q-B allow-list itself is untouched.
**This one re-pin was applied without a separate owner sign-off because it is the ratchet mechanism's
own routine operation** (matches the pattern already used for `RAMP_GAP_ALLOW`/`RAMP_DISTINCT_ALLOW`
below) - flag if that reading is wrong; it is reversible in one commit.

## 7. Remaining reds - full measured detail, not fixed

### 7.1 tonal.mjs `hue-solver-best` - 1 witness cell needs repin, not attempted

**SUPERSEDED - see item 14 in "Pass 2, second round" above. Repinned to Data 2/peak, gate passes.**

Cell `[268, 0.2362053680324055, 0.47259849593539127, ["Neutral","perceptual"]]` (already "Repinned for
#681 U3" once, per its own comment) claims Neutral's perceptual stop-500 pixel is `100,112,140`; the
ramp on the integrated tree emits `101,112,139` - a 1-8-bit-step drift, plausibly the same #686
order-dependence class U6 fixed (the non-anchored `pal` object this witness constructs deliberately
omits `anchor`, so it exercises `paletteStops`'s cusp/hct.js path directly). I did not re-derive the
correct full-precision `(s, l)` pair myself: getting it subtly wrong risks shipping a witness that no
longer discriminates (the gate's own later checks - "CONVERGES", "case proves nothing" - would catch an
outright-wrong choice, but a near-miss might not), and doing it right needs the same kind of `okhslStops`
internals expertise the ORIGINAL repin (for U3) clearly used. Reporting for repin by whoever owns that
derivation, not attempting it here.

### 7.2 tonal.mjs `intensity-legacy` - 1 fixture cell 1 code off

**SUPERSEDED - see item 14 above. Single fixture cell patched, cause identified, gate passes.**

`perceptual Data 1 stop 400: #9789FA != fixture #9789FB` - a 1-hex-digit (1 code) drift in a
byte-identity fixture, most likely the same #686 cache-exactness ripple as §7.1. Not repinned for the
same reason: I would be hand-verifying a single frozen literal against a construction I did not build,
with no independent way to confirm the NEW value is correct rather than itself a symptom.

### 7.3 tonal.mjs `chroma-envelope` (iv, F1 peak-cap trade) - 0 of 6 cited dips observed

**SUPERSEDED - see item 9 above. The "genuinely, fully resolved" conclusion below was measured
without the anchor and is WITHDRAWN. Peak is genuinely 0 (re-verified on the corrected path); even
is 90, not 0 - the anchor was never in this measurement before. Do not cite the paragraph below.**

Step 2 item 3's assignment, final number: **0 of 6 named baseline peak-mode dips are observed on the
integrated tree** (Katsura Imperial Villa tertiary|600, Frankenstein secondary-muted|550, Okavango Delta
secondary|600, Taos-Chama secondary-muted|550, Sapa secondary-muted|600, Great Salt Lake tertiary|550).
This confirms the finding already recorded before this unit's own compaction: two independent manual
witness checks (Katsura Imperial Villa, Detroit techno) show clean, monotone chroma on the integrated
tree. Also re-measured the **53 even-mode dips (<= 53 gate)**: 0 observed, same result. Per the gate's
own documented resolution path ("either fixed - remove from the list, tighten toward 0 - or the corpus
changed under it"), tightening `DIP_BASELINE`/`EVEN_DIP_BASELINE` to empty was attempted twice in this
unit's own earlier work and reverted both times: it broke the gate's own negative control ("the pre-fix-
bug patched engine produced only 0 dip(s), not clearly more than the 0-witness baseline - this control
no longer exercises the F1 regression, pick a different probe"). Constructing a new probe needs F1-
mechanism expertise beyond what I should improvise mid-integration, so both baselines are left as
originally shipped (red, matching their documented state) rather than silently tightened. **This is a
finding for the owner, not a failure to hide**: the F1 peak-cap trade's dip population appears to be
genuinely, fully resolved on the integrated tree; what is missing is a REPLACEMENT negative control that
would let the gate keep discriminating a future regression, which is design work, not integration work.

**Correction (pass 5, verifier row 21): the table below was the WRONG QUANTITY and did not reproduce.**
Revision 24 yielded on the C6 p90 CHROMA RATIO (a stop's emitted chroma as a percentage of stop 500's
own emitted chroma - `scripts/report-preset-fidelity.mjs --envelope`'s READING (a), the literal text of
C6), not `|dL*|` against a reference tree. The dL* table below was measured on a stale (pass-1, later
retracted) position and is the wrong metric besides; it stays here struck through for the record, not
as a citable figure:

~~| cell | median \|dL*\| | p90 \|dL*\| | max \|dL*\| |~~
~~|---|---|---|---|~~
~~| perceptual \| stop 300 | 3.9930 | 5.2989 | 9.1015 |~~
~~| peak \| stop 700 | 16.5499 | 32.1079 | 45.1899 |~~

**Re-measured, correct quantity, pass 5** (`node scripts/report-preset-fidelity.mjs --envelope`, C6's
own corpus - curated palettes at source chroma >= 10 plus the 8 default-kit semantic families, n=2,920
per stop per mode, rendered path with `anchor: pal.anchor`):

| cell | yielded p90 (revision 24) | measured p90 (pass 5) |
|---|---|---|
| perceptual \| stop 300 | 93.7% | **146.2%** |
| peak \| stop 700 | 96.8% | **111.1%** |

Both cells now read well past the 90% bar revision 24 yielded them against, and past what was yielded:
+52.5pp at perceptual|300, +14.3pp at peak|700. This reconciles exactly with the verifier's own row 21
figures (146.2 and 111.1 percent). The cause is the same Q7 mechanism §7.2/item 19/row 22 all name: on
the anchored construction, stop 500 is the user's own pinned sample, not the ramp's designed peak, so
the denominator these percentages divide by is not what it was when revision 24 measured against the
non-anchored construction. See row 22's full table below for the complete picture across all stops and
modes, not just these two cells.

### 7.6 The C6 median/p90 table (pass 5, verifier row 22: absent from the record; STATED PLAINLY here)

The unit text requires the full per-mode median/p90 table, all stops, all three modes, before and
after. It was never written down. Both tables below are `node scripts/report-preset-fidelity.mjs
--envelope`'s own READING (a) output (C6's own corpus: curated palettes at source chroma >= 10 plus the
8 default-kit semantic families, n=2,920 per stop per mode) - "before" strips `anchor: pal.anchor` from
the `paletteStops` call in a scratch copy of the script (the non-anchored construction C6's 90% bar was
originally written against); "after" is the real, rendered, anchor-aware path that ships. Target: median
<= 25%/75%/75%/25%, p90 <= 35%/90%/90%/35% at stops 100/300/700/900 respectively.

**Before (non-anchored construction, `anchor: undefined`):**

| mode | stop 100 med/p90 | stop 300 med/p90 | stop 700 med/p90 | stop 900 med/p90 | cells failing |
|---|---|---|---|---|---|
| perceptual | 9.5% / 17.4% OK | **79.9% / 97.9% FAIL** | 62.6% / 66.5% OK | 22.6% / 26.0% OK | 1 of 8 |
| peak | 4.2% / 11.8% OK | 41.1% / 58.1% OK | 61.3% / 69.3% OK | 19.4% / 25.2% OK | 0 of 8 |
| even | 10.9% / 16.2% OK | 39.1% / 52.2% OK | 39.0% / 44.6% OK | 16.3% / 16.5% OK | 0 of 8 |

**After (anchored construction, `anchor: pal.anchor`, the rendered path that ships):**

| mode | stop 100 med/p90 | stop 300 med/p90 | stop 700 med/p90 | stop 900 med/p90 | cells failing |
|---|---|---|---|---|---|
| perceptual | 17.4% / **35.1% FAIL** | **94.0% / 146.2% FAIL** | 74.5% / **119.3% FAIL** | **31.7% / 66.5% FAIL** | 7 of 8 |
| peak | 11.7% / 23.6% OK | **84.0% / 137.7% FAIL** | 68.8% / **111.1% FAIL** | **29.3% / 62.1% FAIL** | 3 of 8 |
| even | 15.6% / **37.0% FAIL** | 48.4% / **113.7% FAIL** | 42.5% / 80.2% OK | 22.9% / **52.0% FAIL** | 3 of 8 |

24 individual readings total (3 modes x 4 stops x 2 statistics: median, p90 - the table above marks a
FAIL row when either its median or its p90 misses, so a stop-row can carry 1 or 2 of the 24). Before:
2 of 24 individual readings fail (both at perceptual|stop 300, the same cell C6 was already imperfect
against non-anchored). After: **14 of 24 individual readings fail**, matching the verifier's own count
exactly.

**Stated plainly, per the round-4/pass-5 brief's own instruction not to soften or bury this: on the
rendered path that ships, the C6 median and p90 bars the owner held at revision 14 are missed in most
of the 24 checks. The mechanism is Q7's: on the anchored construction, stop 500 is the user's own
pinned sample (`paletteStopsAnchored`'s/`okhslStopsAnchored`'s `stop===500 && !clamped` special case),
not the ramp's designed peak, so the percentage-of-stop-500 denominator these bars divide by is not the
quantity it was when the bars were set against the non-anchored construction. Q7 and #701 cover ONLY
the above-100%-of-stop-500 clause (C6 (iii)/(v)) - they do not cover these median/p90 bars, and nothing
in this unit's own work brings them back into target. This is an owner item, not a fix made here: the
brief for this unit is records, not an engine or threshold change.**

### 7.4-7.5 anchor.mjs `anchor-ladder` (order/dupe-allow-list) and `prime-identity-control` - Finding A fixed pass 2, Finding B still an owner question

**Finding B SUPERSEDED - see item 12 above. Q1 resolved by standing rule; the 0/3,796 reading is the
CORRECT expected result, the gate now asserts it directly rather than reporting it as open.**

**Finding A - the F1-widening-search gap for out-of-window anchors (21 corpus sources). FIXED pass 2,
see "Pass 2" section below.** U1's original anchored-ladder design used an "F1 widening search"
specifically so a source whose anchor sits at or past `[PRIME_L_MIN, PRIME_L_MAX]` (~[12.25, 96.88] L*)
still gets a real six-rung ladder - by letting `prime` itself render OUTSIDE the window while the six
other rungs spread normally inside it (this is what `ORDER_ALLOW`/`DUPE_ALLOW` are for: named
exceptions where `prime` does NOT sit strictly between its neighbours). U6's equal-compress rebuild
replaces that mechanism entirely (both sides of the ladder take the SAME step, `min(STEP_L, roomUp,
roomDown)`), and my merge-conflict resolution (§1, `prime.mjs` was a non-functional broken hybrid
before the rewrite) did not re-add an F1-style widening step, since doing so would be inventing new
construction, not integrating existing verified work.

Measured directly (bypassing `FAIL()`'s own group-dedup, which hides all but the first message per
group): **21 of 3,380 anchored corpus sources** have an anchor L* below `PRIME_L_MIN` (all 21 are
dark, none light - every named default-kit clip is dark-side too, see U6's own §7 spans). For these 21,
`roomDown` measures exactly 0 at the clamped pivot, so equal-compress collapses ALL SIX non-prime rungs
to the single boundary value (`PRIME_L_MIN`, 12.250) - e.g. film "Double Indemnity" primary `#1B1B1D`
renders l-values `12.250, 12.250, 12.250, 9.842(prime), 12.250, 12.250, 12.250`. This is why `sixMono`
also FAILed directly at the time (invariant (a), documented as "0 exceptions... unconditionally" - no
allow-list): the collapse broke even the SIX-rung-only monotone check, not just the prime-placement one.

Measured (pass 1), by-name:
- `ORDER_ALLOW`: 21 measured vs 23 pinned - 2 members no longer trigger (`film "The Night of the
  Hunter" tertiary`, `travel "A Patmos Greek Orthodox church" tertiary-muted`), 0 new members.
- `DUPE_ALLOW`: 26 measured vs 4 pinned - 22 new members, all traceable to the same 21-source collapse
  (a 3-rung collapse on one or both sides produces one or two duplicate-hex clusters per source).

**Pass 1 conclusion (superseded): this needs an owner/engine-level ruling, not a test re-pin.** Pass 2's
review confirmed a widening step CAN be ported onto equal-compress without abandoning its own "both
sides equal" invariant (widen the LADDER's pivot, not the per-side step - see "Pass 2" below for the
mechanism and the re-derived ORDER_ALLOW 26 / DUPE_ALLOW 3, and for `sixMono` now holding
unconditionally, 0 exceptions, with no allow-list, as originally documented).

**Finding B - `prime-identity-control` (C4's non-anchored byte-identity control): 0 exact, 3,796 off.
Reference repaired pass 2 (F1, `referencePrimeSteps`); the 0/3,796 reading is UNCHANGED and is now
known to be honest, not a units bug - see "Pass 2" below.**
C4 states primeSwatches must be byte-identical to its pre-#681 behaviour whenever `anchor` is absent.
The gate's own `referenceNonAnchored` is a fresh reimplementation of the PRE-#681 (and also pre-U6)
OKHSL-domain ladder (`rgbToOkhsl`/`okhslToRgb`, `primeSteps`'s old redistribute rule) - but U6's ticket-
#681 work rebuilds prime's ENTIRE base ladder construction (CIE L* metric, held CAM16 chroma,
equal-compress), UNCONDITIONALLY, for anchored and non-anchored palettes alike, not just the anchor
branch. So on the integrated tree, a non-anchored `primeSwatches` call now genuinely, deliberately,
renders in a different colour domain than pre-#681 - every one of the 3,796 control subjects (3,780
corpus + 16 default kit) reads "off" because the REFERENCE construction is the wrong shape for what
`primeSwatches` does today, not because of a regression. The negative control (mutate one subject's
chroma, confirm the loop would have caught it) still bites correctly, so the gate is not vacuous - it is
measuring a real, large, and (as far as I can tell) intended divergence that predates this unit and was
never reconciled between U1's own criterion text and U6's sibling-unit scope. Not touched; this is
squarely the kind of cross-unit construction question the brief asks me to report rather than resolve.

### 7.6 anchor.mjs `anchor-ramp lone-spike` - 64, root-caused and gated pass 2 (F3, corrects this section)

**Corrected (U4 review pass 1, F3): the pass-1 claim below that this was "not root-caused" was wrong.**
The review root-caused it in full and pass 2 applied the owner's ruling. Full mechanism, and the
bisection that traces the 64 to a single commit:

**Result: not introduced by any of the four merges. Introduced by U3's ruled `dampAmp` 55 -> 0, which
only reached the tree at the asset regeneration `7d659ae5`.** Measured with a standalone transcription
of `anchor.mjs`'s own `loneSpikeStop` predicate over `projectView(hydrate(preset))` in even mode,
25-stop export ramp, all 3,380 anchored corpus palettes, at each of the four merge points plus head:
`834a4d8d` (plan tip, no anchors) 0, `b3cabb5e` (U1 merged) 0, `508917d8` (U2 merged) 0, `31939051` (U6
merged) 0, `326592d2`/head 64. The only functional change between `31939051` and head is `7d659ae5`,
the asset regeneration - confirmed by two single-variable experiments: the U6-merge engine + head's
regenerated category files reads 64; the identical engine and files with only `"dampAmp":0` rewritten
back to `"dampAmp":55` reads 0.

**Mechanism.** All 64 hits sit at stop 500, and in each case the spiking hex is the palette's own
stored `anchor`. With `dampAmp` 0 the even-mode chroma envelope loses its shoulder term, so stops 450
and 550 fall to OKLCH C 0.036-0.049 (under the gate's own 0.05 achromatic bound) while U2's pass-through
pins stop 500 to the anchor's own full chroma, C 0.072-0.093 - a genuine one-stop chroma spike exactly
at the pass-through point. Witness, architecture "Komsomolskaya Station" tertiary `#346190`: `#5F768F`
(C 0.0475) -> `#346190` (C 0.0911) -> `#3E546C` (C 0.0482). This is a plan-level gap, not a builder
error: `unit/pif-u2-ramp` carries the lone-spike gate but `dampAmp: 55` (0 hits); `unit/pif-u3-envelope`
carries `dampAmp: 0` but not the gate. The gate and the corpus change first meet on this integration
branch.

**Owner ruling applied pass 2** (`.sdlc/questions/pif-u4.md`, dated 2026-09-20): name the 64 by value
and gate the count, exactly the `NOTCH_ALLOW` treatment - `test/engine/anchor.mjs`'s new
`LONE_SPIKE_ALLOW` (64 named entries, all stop 500, mechanism cited in the file's own comment). The
real fix (an even-mode neighbourhood chroma term at the anchor stop) joins ticket #701, not this unit.
Gate now passes: `anchor-ramp lone-spike allow-list: 64 (expected 64)`.

## 8. Step 3: generators run, assets committed

Ran every generator in sequence (`gen-figma-binder-code`, `gen-figma-assets`, `gen-mcp-assets`,
`gen-describe-mcp-assets`, `gen-categories`, `gen-adia-derived-exports`, `bundle`, `gen-figma-ui`) and
committed the result (`7d659ae5`). Moved: the 8 curated category files (`src/ui/categories/*.js`), the
Adia OKLCH export (`docs/reference/data/adia-oklch-export.css`), the generated Figma plugin bundle
(`figma/plugin/ui.html`), and the MCP describe-kit assets (`src/ui/describe-mcp-assets.js`) - all
downstream of the fully-fixed engine construction and stale relative to a mid-integration regeneration.
Byte-unchanged: `src/ui/figma-plugin-assets.js`, `src/ui/mcp-assets.js`,
`figma/binder/figma-semantic-binder/code.js`, `docs/reference/data/adia-radix-export.mjs`.

**Presets moved: 343 of 343** (every curated document's own hex values move under the anchor + envelope
construction - verified via the §9 blast-radius sweep, which reads every one). **Palettes moved: 3,780
of 3,780** (same basis).

**Re-derived pass 2 (U4 review pass 1, F7: the pass-1 numbers below did not reconcile against an
independent sweep - argmax subjects differed on 2 of 3 modes, peak median read 4.89 against an
independent 4.39).** Re-run with the iteration shape stated, since three of the four numbers per mode
are load-bearing: 343 presets matched BY NAME between the integration head and `bf2aaf6`'s own
category files (not the head corpus rendered on the bf2aaf6 engine, or vice versa), 3,780 palette/mode
pairs, `projectView(hydrate(preset))`'s rendered `fullRamp` (export25 stop set) on EACH tree with that
tree's own engine, `|dL*|` and `|dChroma|` (OKLCH) computed from an independent from-scratch sRGB ->
CIE-L*/OKLCH conversion (never `hct.js`'s or `okhsl.js`'s own, matching this file's other independent
checks), n=94,500 stop-cells per mode. Script: `scratchpad/probe-blastradius.mjs` under this session's
scratchpad. This reproduces the review's own independent figures to four significant figures (e.g.
perceptual median 2.1569 here vs the review's 2.1565), confirming the review's numbers were the correct
reconciliation and the original pass-1 table below undercounted population overlap slightly (it paired
by array position across two independently-generated corpus dumps rather than by preset name).

**Max |dL\*| / max dChroma (OKLCH) per stop/mode, re-derived** (corpus, export25 stop set, vs bf2aaf6,
n=94,500 stop-cells per mode):

| mode | max \|dL*\| | at | max \|dChroma\| (OKLCH) | at |
|---|---|---|---|---|
| perceptual | 19.3325 | film "TRON: Legacy" secondary, stop 500 | 0.2909 | literature "A Game of Thrones" secondary-muted, stop 500 |
| even | 12.3579 | travel "27° N Khumbu teahouse" tertiary-muted, stop 500 | 0.2955 | travel "63° N Reynisfjara" primary-muted, stop 450 |
| peak | 50.7611 | nature "43° N Camargue salt marsh" tertiary-muted, stop 500 | 0.2765 | nature "0° Congo Basin" tertiary-muted, stop 450 |

Stop 500 dominates the L* list because it is the anchor pass-through point (U2): the anchor's own hex
now renders exactly, replacing whatever the old cusp-derived construction put there - expected and by
design, not a defect. Peak mode's larger, non-stop-500 movements trace to U3's F1 peak-cap trade
(§7.3). Note: the pass-1 table's dChroma column (32.25/-43.75/43.85) was in CAM16 units, not OKLCH; the
OKLCH figures above are a different, smaller-magnitude basis and are not directly comparable to it -
this pass reports OKLCH throughout for consistency with `|dL*|`'s own basis.

**Full per-mode median/p90 table, export25, re-derived** (corpus, |dL*| vs bf2aaf6, n=94,500 per mode;
display19 figures below are UNCHANGED from pass 1, not independently re-verified this pass):

| mode | stop set | n | median \|dL*\| | p90 \|dL*\| |
|---|---|---|---|---|
| perceptual | display19 (19 stops, pass 1, not re-verified) | 71,820 | 2.9610 | 6.7377 |
| perceptual | export25 (25 stops, re-derived) | 94,500 | 2.1569 | 6.2239 |
| even | display19 (pass 1, not re-verified) | 71,820 | 2.0441 | 6.1827 |
| even | export25 (re-derived) | 94,500 | 1.3098 | 5.8063 |
| peak | display19 (pass 1, not re-verified) | 71,820 | 6.0431 | 26.1404 |
| peak | export25 (re-derived) | 94,500 | 4.3907 | 23.2925 |

**`damp`/`dampCurve` before-and-after row.** `DEFAULT_CONTROLS`' own raw values are UNCHANGED between
bf2aaf6 and the integrated tree (`damp: 80, dampCurve: 1.5, dampAmp: 0, dampBias: 0`, both). U3's retune
is a NEW multiplier applied only in even mode, absent from bf2aaf6 entirely: `EVEN_DAMP_FACTOR = 0.25`
(`src/engine/tonal.js:387`), transforming the effective even-mode damp to `100 - (100-80)*0.25 = 95` and
effective dampCurve to `0.25 * 1.5 = 0.375` at the point of use - a substantial softening scoped to even
mode alone. This is visible in the median/p90 table above as even mode's consistently smaller movement
relative to perceptual/peak (median 1.35-2.04 vs 2.23-6.04) - separated here from the anchor/envelope
movement, which affects all three modes via the shared pass-through and `chromaEnvelope` construction.

**Default-kit ratios before/after (peak vs perceptual, stop 500, all 16 families):** at bf2aaf6, peak
and perceptual stop-500 L*/C values differ substantially per family (e.g. Data 5: perceptual L* 54.62,
peak L* 94.71 - a 40-point spread). On the integrated tree, **every family's peak and perceptual stop
500 is byte-identical** (e.g. Data 5: both read C 45.80 / L 49.35) - the anchor's own construction is
mode-independent by design (U1/U2), matching `anchor-f4 peak-vs-perceptual: 3380 of 3380 differ (0
identical required)`'s own corpus-wide confirmation that this identity holds for every anchored ramp,
default kit included.

**Exports that moved:** all 10 documented colour formats (`exportPanda` verified directly in §10; the
Adia OKLCH/Radix bundles regenerated in this commit; `figma/plugin/ui.html`, `src/ui/categories/*.js`,
`src/ui/describe-mcp-assets.js` regenerated and committed per above).

**C4's identity-control line:** red - see §7.5, Finding B. Not a regression; the reference is now a
genuine pre-#681 implementation (pass 2, F1) and the 0/3,796 reading is honest: U6's rebuild changed
the non-anchored construction wholesale, so no reference to the old construction can ever match it.
Owner question (Q1), not a bug.

**C5's allow-list count:** `ladder-window` (C5's 21-name curated-corpus allow-list, independent of
anchors) - **pass, 21 (expected 21)**, unaffected by this integration.

**#668's count:** see the dedicated §10 section - **CLOSED** (corrected pass 2, F4).

## 9. Blast radius vs. the plan's expected-direction table

Checked every row I could locate a clear expected direction for against the measured figures above.

| Row | Plan's expected direction | Measured | Match? |
|---|---|---|---|
| Anchored palettes: prime == deriveKeyColor -> prime == anchor | prime pixel becomes the anchor's own hex, byte-exact | `anchor-identity: 3380 exact, 0 off`; `anchor-f4 peak-vs-perceptual` identity holds default-kit-wide | Yes |
| Non-anchored: unchanged (e, h) | primeSwatches unchanged for non-anchored palettes | **Miss, confirmed pass 2** - U6's ladder rebuild changes the non-anchored construction too (§7.5, Finding B); repairing the C4 reference to a genuine pre-#681 implementation (pass 2) still reads 0/3,796, proving this is a real, intended divergence, not a broken reference | **Miss, flagged, owner question Q1** |
| Ramp stop 500 exact under every toggle (Q-D) | curve/tension/vibrancy/hueSpace move an anchored ramp everywhere except stop 500 | `anchor-f4 curve/tension/vibrancy/hueSpace: stop 500 moved 0 (want >= 1, 0)` across all four, all 16 default-kit ramps | Yes |
| hueSpace stays inert for anchored perceptual/peak, live in even | max dE_OK <= 0.01 in perceptual/peak, above JND in even | `hueSpace-perceptual-bound`/`hueSpace-peak-bound`: max OKLab dE 0.0048, both bounded by codes (max 2/1); `hueSpace`: max OKLab dE 0.0486 in even, asserted live | Yes |
| Three default-kit families clip at STEP_L 9 under U1's Q2(b) anchors: Tertiary/Danger/Warning, spans 52.8/49.9/46.3 | | Measured 52.7805/49.9212/46.2664 exactly (§ test/engine/prime.mjs `CLIPPED_DEFAULTS`) | Yes |
| Q-B: 41/96 cells below bf2aaf6, AA holds | | Confirmed unchanged at 41, AA holds everywhere (§6) | Yes |
| Q-C: NOTCH_ALLOW population shrinks toward the 70%-ratio+absolute-dip definition's true residual | | 78 -> 15, a pure subset (§10 detail below), default kit stays 0 | Yes, and larger than a plan reader might expect |
| #668: 0 upticks at stop 800/mirror, all three modes, both stop sets | | Measured 0/0/0/0/0/0 at integration head; negative control re-run against `bf2aaf6`'s OWN corpus (pass 2, F4) reproduces the stated 11/46/11/43 baseline exactly (§10) | **Yes, CLOSED** |
| U3's F1 peak-cap trade: dips resolve | | 0 of 6 named dips observed (§7.3) | Yes, with the caveat that the gate's own negative control needs replacing |
| C7: exactly 3 chromaEnvelope call sites | 3 (pre-U2-landing reading) | 5 (§2) | **Miss, flagged and explained** - a reading change, not a regression |
| Q7 ratchet, anchored PEAK overshoot beyond stop 500 (owner's addendum, round 3; not a plan row - a new monitor added this round) | N/A - no plan-stated direction; C6 (iii)'s bar stays non-anchored only, per the ruling | 3,119/3,764 violators, max 15.132599x stop 500's own chroma (both re-measured this pass, `test/engine/tonal.mjs` C6 (v)) | Gated ratchet, pinned this pass - reds only on a rise |
| Q7 ratchet, anchored EVEN overshoot beyond stop 500 (companion figure, owner's addendum: "for the report only") | N/A - explicitly not gated | 1,205/3,764 violators, max 17.183605x stop 500's own chroma (re-measured this pass; moved to `scripts/report-preset-fidelity.mjs --envelope` this same round, perf fix item 20 - the test suite no longer computes it) | Report only, not gated, not in `npm test` |

Two misses/flags remain as of pass 2 (down from three): C4's non-anchored identity control (a real,
unreconciled cross-unit scope gap, §7.5, now an owner question Q1 rather than an open bug - the
repaired reference confirms the divergence is real) and C7's count (already explained as a legitimate
reading change, §2, not a fresh miss). #668's negative control is fixed pass 2 and is no longer a flag.
All remaining flags are findings, not failures hidden from this report.

## 10. Addendum measurements (#686, #668)

### #686 - exportPanda byte order-dependence: CLOSED

Poisoned `hct.js`'s shared gamut caches (`peakC`, `maxChromaInGamut`) by warming each corpus hue with a
neighbour 0.001° away (the same 2-decimal truncation bucket the pre-#686 `.toFixed(2)` key would
collide on) before processing all 343 curated presets' `exportPanda` output in a shuffled order (fixed
seed), and compared every emitted colour token byte-for-byte against a cold, unshuffled, unpoisoned run.

**Integration head: 0/343 presets differ.** Cold and poisoned+shuffled runs are byte-identical.

**Negative control (bf2aaf6, same probe, same corpus):** the control reproduces -
**1/343 presets differ**: `cuisine "Sichuan hot pot"`'s `secondary.prime.DEFAULT` reads
`oklch(0.6207 0.1526 31.99)` cold vs `oklch(0.6206 0.1528 32.4)` poisoned+shuffled, a real, small,
order-dependent divergence in the exact class #686 describes. The reproduction is real (non-zero),
proving the probe discriminates rather than being vacuous, even though it is a smaller population
(1/343) than a maximally-adversarial poison might find - plausible given `_pk`/`_mc`'s bounded-LRU
eviction limits how much cross-call contamination survives to the export step.

### #668 - the measured CIELAB L* rise at stop 800 and its light-side mirror: CLOSED (corrected pass 2, F4)

**Corrected (U4 review pass 1, F4): the INCONCLUSIVE verdict below was wrong. #668 is closed.** The
pass-1 negative control paired the PRE-#681 engine (`bf2aaf6`) with the POST-#681, regenerated
(`dampAmp: 0`) category files - an engine/corpus version skew, the same fault class as F3's lone-spike
bisection. Re-run pass 2 with `bf2aaf6`'s OWN committed category files (a real `git worktree add
--detach` checkout of `bf2aaf65`, not the integration head's regenerated ones):

Swept the full corpus (3,780 palettes), all three modes, both stop sets (19 display / 25 export),
measuring adjacent-stop pixel L* (`lstarFromRgb`) for any rise anywhere in the ramp (a superset of "at
stop 800 specifically," so it would catch the named defect wherever it lands). Script:
`scratchpad/probe/rise19.mjs` (reused verbatim from the U4 review, which the reviewer's own scratchpad
under this session left in place).

**Integration head: 0 rises, every mode, every stop set** (`perceptual|display19` through
`peak|export25`, all six combinations read 0) - unchanged from pass 1.

**Negative control, re-run against `bf2aaf6`'s own corpus: reproduces the addendum's stated baseline
EXACTLY.** `{"display19":{"perceptual":11,"even":0,"peak":43},"export25":{"perceptual":11,"even":0,"peak":46}}`
- 11 perceptual / 46 peak on the 25-stop export ramp, 11/43 on the 19-stop display ramp, even mode 0 in
both, matching the addendum's 11/46/11/43 to the digit. The first perceptual witness on both stop sets
is `film "Touch of Evil" secondary, stop 750->800` - the exact named witness pass 1 tested against the
wrong corpus and reported as showing no rise.

**Per the addendum's own standard**, this is now a control that reds against the right baseline, and a
head measurement of 0/0/0/0/0/0 against it is real evidence of closure, not a vacuous probe. **#668 is
CLOSED.** The PR body line below is corrected to match.

## Step 4 record-only repairs

1. **Done** (commit `6dd5244`): U2's `.sdlc/handoffs/pif-u2.md:151-152` prose contradicted its own
   table (claimed the over-10-degree column was already 0 at review 5 and stayed 0 "in either reading"
   at head; the table two lines above reads 151/5,384 at review 5 and 0/5,272 at head). Corrected to
   match the table.
2. `.sdlc/board.md` - left alone, team-lead's own.
3. The plan's C1 17-FAIL-line figure - not edited (planner's repair); my own control run is in §5.

## PR body line, per the addendum

**Corrected pass 2 (F4): both addendum measurements are green.** The PR body reads **"Closes #681,
closes #686, closes #668."**

## Pass 2 final numbers

**SUPERSEDED (review pass 2, F6) - this block describes round 1's state (head `4125d965`/`f38d09a2`,
`npm test` exit 1). At the current head, `npm test` exits 0. See "Pass 2 final numbers, second round"
near the end of this document for the current, accurate numbers. Kept below for the record.**

**Head:** `4125d965` for the fix itself (`git -C .git-worktrees/pif-u4-integration log -1
--format='%H %s'`); all numbers below were measured at that commit. Three trailing, non-functional
commits follow it: a documentation-only commit adding this section (`f5e27e9`), a comment/string-only
em-dash cleanup in this pass's own new source comments (`9537c5b`), and the asset regeneration that
comment cleanup mechanically triggers (`f38d09a`, the true final head - the generated Figma bundle
embeds source comment text, so removing em dashes from a comment shifted a few output bytes; no logic
changed). `npm test` re-run in full at `f38d09a`: still exit 1, still exactly the same 2/48 files red
(`engine/tonal.mjs`, `engine/anchor.mjs`), tree clean after. Wall time **441.73 s**, `uptime`
immediately before: **7.89 / 11.92 / 13.69**.

**`npm test`:** exit 1, **2/48** test files red - `engine/tonal.mjs`, `engine/anchor.mjs`, both
matching the owner questions this pass leaves open (Q1/prime-identity-control, Q3/notch allow-list,
Q5/the two witness re-pins) and no others; every other file, including `engine/prime.mjs` and
`engine/semantic.mjs`, is green. Wall time **391.70 s** (`time npm test`, user+sys ~400s/6:31.70
total). `uptime` immediately before the run: **6.24 / 10.26 / 10.02** (1/5/15-minute). Per the
addendum's standing rule this reads as ordinary contention on a shared host, not a regression - the
run is well under the 692 s pass-1 figure taken at load 220/83/68. `git status --porcelain` empty
after the run (once this pass's own regenerated `figma/plugin/ui.html`/`src/ui/describe-mcp-assets.js`
were committed alongside the source fix, §Pass 2 commit).

**The prime-gate mutation FAIL line** (proof obligation for F2 - scratch copy, `prime.mjs:156`
`keyChroma = ... * pk.c * 0.95`, `node test/engine/prime.mjs`):

```
FAIL  h  - Neutral/cam16 (anchor stripped): prime rgb [114,124,150] vs deriveKeyColor rgb [113,124,151] (diff [1,0,1])
```

Exit 1, `FAIL: 1 gate failure(s)`. Gate (e)'s companion did not red on this particular mutation (a 5%
chroma reduction stays within its hue tolerance); gate (h)'s byte-identity companion does, which is the
proof obligation the brief specified.

**Finding A's outcome:** fixed at the construction (§Pass 2, item 3 above), not stopped/costed. Ported
U1's own pre-U6 F1 widening search into the CIE-L*/equal-compress domain, preserving equal-compress's
own "up === down" invariant. Verified: `sixMono` 0/3,380 exceptions (unconditional again, no allow-
list, as originally documented); `ORDER_ALLOW` 26 (was 23 pre-#681, 21 before this pass's fix, since
the pre-fix construction couldn't widen the ladder for the 21 fully-collapsed sources at all);
`DUPE_ALLOW` 3 (was 4 pre-#681, 26 before this pass's fix, for the same reason). Both re-frozen by name
in `test/engine/anchor.mjs`, machine-checked against the file's own N1 sorted-array comparator, not
just a count.

**The re-derived blast-radius headline table** (export25, 343 presets matched by name between head and
`bf2aaf6`'s own category files, 3,780 palette/mode pairs, n=94,500 stop-cells/mode, independent
sRGB->CIE-L*/OKLCH conversion; reproduces the review's own independent figures to 4 significant
figures):

| mode | median \|dL*\| | p90 \|dL*\| | max \|dL*\| | at |
|---|---|---|---|---|
| perceptual | 2.1569 | 6.2239 | 19.3325 | film "TRON: Legacy" secondary, stop 500 |
| even | 1.3098 | 5.8063 | 12.3579 | travel "27° N Khumbu teahouse" tertiary-muted, stop 500 |
| peak | 4.3907 | 23.2925 | 50.7611 | nature "43° N Camargue salt marsh" tertiary-muted, stop 500 |

| mode | max \|dChroma\| (OKLCH) | at |
|---|---|---|
| perceptual | 0.2909 | literature "A Game of Thrones" secondary-muted, stop 500 |
| even | 0.2955 | travel "63° N Reynisfjara" primary-muted, stop 450 |
| peak | 0.2765 | nature "0° Congo Basin" tertiary-muted, stop 450 |

**Supporting gates, all re-run directly on this pass's head:** `node test/repo/citations.mjs` -
`citations: parser self-test + STALE 0 across 10 discovered docs`, exit 0. `npm run gate:corpus-contrast`
- PASS, worst cell 4.503:1, exit 0. `node test/repo/branding.mjs` - `branding: clean (469 files
scanned)`, exit 0. `node test/engine/tonal.mjs` - exit 1, 3 gate failures (§7.1-7.3, unchanged, owner
questions Q5 and the already-known F1 dip-gate finding). `node test/engine/anchor.mjs` - exit 1, 2 gate
groups failing (`prime-identity-control`, `anchor-ramp notch allow-list`; down from 4 groups pass 1).
`node test/engine/prime.mjs` - exit 0, all 20 gates pass.

## Pass 2 final numbers, second round (addenda 1+2)

**`npm test`: exit 0, all 48 test files pass** (`engine/tonal.mjs` and `engine/anchor.mjs` both green -
0 FAIL lines, confirmed by direct per-file runs, not just the group-deduped summary). Tree clean after
(`git status --porcelain` empty besides this pass's own 6 source/doc files - the regenerated Figma/MCP/
category assets are byte-identical to what is already committed, so nothing new to commit there).

**Supporting gates, re-run directly:**
- `node test/repo/citations.mjs` - `citations: parser self-test + STALE 0 across 10 discovered docs`,
  exit 0.
- `npm run gate:corpus-contrast` - PASS, worst cell 4.503:1, exit 0.
- `node test/repo/branding.mjs` - pass (part of the full `npm test` run above).
- `node test/engine/tonal.mjs` - exit 0, 0 gate failures (was 3: hue-solver-best, intensity-legacy,
  chroma-envelope - all three now fixed, see items 9 and 14 above).
- `node test/engine/anchor.mjs` - exit 0, 0 gate groups failing (was 2: prime-identity-control, notch
  allow-list - both now resolved, see items 12 and 13 above).
- `node test/engine/prime.mjs` - exit 0, all 20 gates pass (unaffected by this round).

**New/changed allow-list counts this round:**
- `EVEN_DIP_BASELINE`: 53 (stale, pre-anchor-fix, all stop 350) -> 90 (corrected, anchor-aware, stops
  450/500/550) - a full replacement, not a superset (0 overlap between the two lists).
- `DIP_BASELINE` (peak): 6 -> 0 (retired empty; genuinely 0 dips on the corrected path, confirmed for
  all 6 old witnesses directly).
- `KNOWN_BASELINE_DUP`: 0 -> 21 unique keys (23 physical instances, corrected anchor-aware measurement;
  was measured as 0 under the pre-addendum-2 bug).
- `NOTCH_ALLOW`: 78 -> 15 (pure subset, 63 removed, 0 added - Q3 resolved).
- `LONE_SPIKE_ALLOW`: 64, unchanged (already used the rendered path before addendum 2).
- `DEFAULT_KIT_SPIKE_FINDING` (new): 1 (`Data 7`), gated separately per addendum 2's instruction.
- `STAIRCASE` (hue-solver-best): `Neutral`/perceptual -> `Data 2`/peak (Q5, one witness swapped).
- `test/engine/fixtures/tonal-legacy.json`: one cell patched (`perceptual`/`Data 1`/stop 400, Q5).

**New finding, not applied (Q7 in the questions doc):** `above100Violators`/`cuspRunFor` cannot safely
be switched to the anchor-aware path without an owner scope ruling - doing so surfaces that their
invariants do not hold for anchored palettes at all (1,205-3,119 of 3,380 anchored palettes violate
"0 above 100%" depending on mode; 958+712 cusp-run instances), not a bounded, nameable departure list.
Left both on the non-anchored measurement, numbers and mechanism cited in each function's own comment.

**Commit:** `fa0264fa` (fix(color-engine): U4 pass 2 round 2, apply both team-lead addenda). All numbers
above were measured at this commit. This doc-update commit follows it; no trailing asset-regen commit is
expected (this round's source comments already avoid em dashes, verified directly against the diff, not
just the file as a whole - see the branding/em-dash check below).

## Main merge (2026-09-20): origin/main (3ce50daa) merged onto `unit/pif-u4-integration` at 3921f140

A prior builder session was killed by a host restart mid-merge. Picked up with `MERGE_HEAD` present,
conflicts already resolved and staged, nothing committed. Verified the conflict resolution already in
the tree (`.sdlc/adapter.md`'s X1-X13 ids, zero `C1[123]` rows, U6's `npm test` budget bullet) was
correct and left it untouched, per instruction.

**Repairs beyond the mechanical merge** (all inherited from the prior builder's unstaged work, verified
rather than trusted, then staged):

1. Four `docs/reference/` citation line-number re-pins, forced by the merge shifting line numbers in
   `src/ui/app.js` and `test/engine/tonal.mjs`: `docs/reference/references/component-inventory.md`
   (`app.js:1587`->`1594`, `app.js:1603`->`1610`), `docs/reference/reviews/2026-08-20-reactivity/
   03-stores-and-persistence.md` (`app.js:2290-2313`->`2319-2341`, `app.js:2320-2345`->`2349-2378`),
   `docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md` (`app.js:2096-2142`->
   `2108-2154`, `app.js:2132-2136`->`2144-2147`), `docs/reference/rubrics/acceptance-criteria.md`
   (`tonal.mjs:246-264`->`283-301`, `tonal.mjs:577-601`->`687-708`). Checked every one against the
   merged tree directly (`sed -n` on the cited ranges) before staging - all eight citations land exactly
   on the content they describe. `node test/repo/citations.mjs` (part of the full `npm test` run below)
   confirms STALE 0 / NOFILE 0 across the corpus, so these were load-bearing, not cosmetic.
2. `figma/plugin/ui.html` - the generated app bundle, regenerated fresh by `npm test`'s own
   `gen:figma-ui` step rather than trusted from the prior builder's tree.
3. `test/engine/exports.mjs` - a comment above the `radix-refs-values-unchanged` gate, recording why the
   fixture's values legitimately moved once (item 4 below) and that the re-capture was by script.
4. `test/engine/fixtures/radix-baseline.json` (the `radix-refs-values-unchanged` gate's fixture,
   `test/engine/exports.mjs:889`) - re-captured by script, never by hand. `origin/main` landed this
   fixture (#638) before `#681`'s engine changes (anchor field, chroma envelope, prime-ladder rebuild),
   so every ramp-derived value in it legitimately moves once on the merged tree; the gate itself asserts
   the VALUES-form output is byte-identical to this committed fixture, so a stale fixture reds regardless
   of correctness. Capture command (repo root as arg 1):
   `node <scratchpad>/capture-radix-baseline.mjs /Users/kimba/Projects/nonoun/ultimate-tokens/.git-worktrees/pif-u4-integration`
   - a small script that imports `src/engine/exports.js`+`ds-export.js` directly and reconstructs
   `C`/`ALL`/`BRAND_ONLY`/`RADIX_COLLIDING` verbatim from `test/engine/exports.mjs`'s own top-of-file
   definitions (never a second, drifting copy), then calls `X.exportRadix` for the `ALL`/`BRAND_ONLY`/
   `COLLIDING` sections the gate reads and writes the JSON fixture. Verified before staging: a
   structural walk (keys + array lengths at every node, 3,526 nodes) is byte-identical between the old
   (prior builder's) and freshly re-captured fixture - 0 key/shape/ordering diffs - and the fresh
   capture is byte-for-byte identical to what the prior builder had already produced, so their
   unverified work turns out to have been correct; this re-capture is what makes it reproducible.
   Leaf-level diff against the pre-recapture (main's original, pre-#681-values) committed fixture: 1,724
   of 2,763 leaves moved, 1,039 unchanged - consistent with "ramp-derived values moved, structure did
   not."

**`npm test`: exit 0, 49 of 49 test files pass** (main added `test/repo/gate-report.mjs` since this unit
branched, so the runner count moved from 48 to 49, as expected). Wall time **430.46 s** (`/usr/bin/time
-p`, `user 441.25s sys 5.33s`), load average at start **5.18 / 4.98 / 3.98** (1/5/15-minute, `uptime`).
Two zombie `node` processes (`prime-determinism-worker.mjs`, `prime.mjs`) from an earlier run of this
same command that had auto-backgrounded past its tool timeout were reaped (`kill -9`) before this timed
run, so the reading is not inflated by a leftover contender in this worktree. `test/repo/citations.mjs`
(STALE 0), `test/engine/curated-contrast.mjs` (the corpus-contrast gate), and `test/repo/branding.mjs`
all pass as part of this same run. Tree clean after: everything the merge plus the repairs above touched
is staged, nothing left unstaged.

**Head after this commit:** see `git log -1 --format=%H unit/pif-u4-integration` (this doc's own
frontmatter note applies: a literal sha here goes stale the moment it's written).
