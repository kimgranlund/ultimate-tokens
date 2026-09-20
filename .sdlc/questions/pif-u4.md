---
kind: question
unit: pif-u4-integration (plan preset-intent-fidelity, ticket #681, unit U4)
written: 2026-09-19
status: open
---

# U4 integration: items needing an owner decision

Full measurement detail for every item below is in `.sdlc/handoffs/pif-u4.md` (this unit's report,
head `7d659ae5`). This file states each open question plainly with its options; the owner's answer
comes back through team-lead, per the brief.

## Q1 — C4's non-anchored identity control: reconcile the criterion with U6's actual scope

**Finding (handoff §7.5, Finding B).** C4 states `primeSwatches` must be byte-identical to its pre-#681
behaviour whenever `anchor` is absent. `test/engine/anchor.mjs`'s `prime-identity-control` gate measures
this against a fresh reimplementation of the PRE-#681 OKHSL-domain ladder. On the integrated tree it
reads **0 exact, 3,796 off** — every non-anchored control subject differs, because U6's ticket-#681 work
(the equal-compress, CIE-L*, held-CAM16-chroma ladder rebuild) changes `primeSwatches`'s construction
UNCONDITIONALLY, for anchored and non-anchored palettes alike, not just the anchor branch. The gate's
own negative control still bites (proving it is not vacuous), so this is a real, large, intended
divergence that C4's original text — written against U1's own scope, before U6's sibling-unit work was
fully accounted for — never anticipated.

**Options:**
1. Rule that C4's non-anchored byte-identity guarantee applies to the ANCHOR BRANCH's ISOLATION from the
   non-anchored path, not to the non-anchored construction's own absolute stability across #681 — i.e.
   accept that U6 legitimately changed the base ladder for everyone, and retire or rewrite
   `prime-identity-control` to check something else (e.g. that the anchor branch and non-anchored branch
   don't cross-contaminate each other, rather than that non-anchored output never moved).
2. Rule that C4's letter stands as written, and `primeSwatches`'s non-anchored path must be reverted to
   the OKHSL-domain construction (only the anchor branch gets the new CIE-L* ladder) — a real engine
   change, out of scope for U4 to invent unilaterally.
3. Some other reconciliation the owner specifies.

I have not touched `test/engine/anchor.mjs` or `src/engine/prime.mjs` for this. `npm test` remains red on
this gate until it is ruled.

## Q2 — the F1-widening-search gap for out-of-window anchors (21/3,380 corpus sources)

**Finding (handoff §7.4, Finding A).** U1's original anchored-ladder design used an "F1 widening search"
so a source whose anchor L* sits outside `[PRIME_L_MIN, PRIME_L_MAX]` still gets a real six-rung ladder,
by letting `prime` itself render outside the window while the six other rungs spread normally inside it.
U6's equal-compress rebuild has no equivalent mechanism: for the 21 corpus sources whose anchor L* falls
below `PRIME_L_MIN` (all 21 are dark-side; none are light-side), `roomDown` measures 0 at the clamped
pivot, and equal-compress collapses ALL SIX non-prime rungs to the single boundary value (`PRIME_L_MIN`,
12.250) — e.g. film "Double Indemnity" primary renders l-values
`12.250, 12.250, 12.250, 9.842(prime), 12.250, 12.250, 12.250`.

Measured: `ORDER_ALLOW` (prime not strictly between its neighbours) reads 21 vs the pinned 23 (2 names no
longer trigger); `DUPE_ALLOW` (a duplicate-hex rung) reads 26 vs the pinned 4 (22 new names, all tracing
to this same 21-source collapse); the `sixMono` invariant — documented as holding "unconditionally, 0
exceptions" — FAILs directly for the same 21 sources, since the collapse breaks even the six-rung-only
monotone check.

**Options:**
1. Port an F1-style widening step onto the equal-compress construction for out-of-window anchors (a real
   `src/engine/prime.mjs` change), restoring the "0 exceptions unconditionally" property — engine work,
   not integration work.
2. Rule the flat six-rung collapse acceptable for this population (0.62% of the anchored corpus, all
   very dark/near-black sources where a compressed ladder may be the honest picture — c.f. the plan's own
   precedent for light cusp anchors collapsing under equal-compress, `.sdlc/plans/preset-intent-fidelity.md`
   line 147) and re-freeze `ORDER_ALLOW` (21)/`DUPE_ALLOW` (26)/the `sixMono` invariant's own documented
   wording to match, by name, mechanically (I did not do this myself since it reads as a policy call on
   whether the collapse is acceptable, not a mechanical re-freeze).
3. Some other reconciliation.

Full by-name lists (the 21 collapsed sources, the ORDER_ALLOW/DUPE_ALLOW diffs) are in the handoff, §7.4.

## Q3 — `NOTCH_ALLOW`: 78 -> 15, propose acceptance

**Finding (handoff, C5/Q-C re-measurement).** Ruled at 78 on U2 alone (15 perceptual / 9 peak / 54 even).
On the integrated tree: **15, all even mode, a pure subset of the original 78** (0 new members; 63
removed). Perceptual and peak drop to 0 entirely. The default kit carries 0 notched cells in every mode,
confirmed. This is the U2-ruled Q-C gate re-measured after U3's construction landed on top of it, per
the brief's own framing ("re-verified on the integrated tree, not a final owner acceptance of the
count").

**Proposal:** accept 15 as the final, owner-ruled `NOTCH_ALLOW` population and re-freeze the array (drop
the now-absent 63) with the by-name list already captured in the handoff. I did not make this edit
myself, since the brief's Step 2 item 2 explicitly frames this as "present ... for the owner to rule on,"
not a mechanical re-freeze I should apply unilaterally.

## Q4 — #668, the L* rise at stop 800/mirror: negative control does not reproduce the stated baseline

**Finding (handoff §10).** Swept the full corpus + default kit, all three modes, both stop sets, for any
adjacent-stop pixel L* rise (a superset of "at stop 800 specifically"). Integration head: **0 rises in
every mode/stop-set combination.** Negative control against `bf2aaf6` (resolved via `git log --oneline
-1 bf2aaf6` -> `bf2aaf65`, "test(contrast): flat AA floor over the curated corpus..."), same probe, same
corpus: **also 0 rises in every combination** — not the addendum's stated baseline of 11 perceptual / 46
peak (25-stop) and 11/43 (19-stop). Directly tested two of the eleven named `WITNESSES` (film "Touch of
Evil" secondary, music "Black metal" secondary, both lift -40) against `bf2aaf6`'s own engine and own
category files in all three modes: no rise for either, in any mode. `bf2aaf6`'s `tonal.js` already
carries `liftStop` and the `#648` damping-position fix.

**Ask:** the exact reproduction command and/or commit that produced the 11/46/11/43 figures, so the
negative control can be re-pointed at a state actually known to exhibit them. Until then I cannot
certify #668 closed — the 0/0/0/0/0/0 integration-head reading is real and consistent with the
codebase's own prior analysis (`test/engine/categories.mjs`'s `ramp-monotone` comment already records
0 rise-cells on the U1+U2+U3 tree), but without a working negative control it is not proof of closure.
Per the addendum's own standard, this is reported as inconclusive rather than softened into either
"closed" or a caveat-free pass.

## Q5 — two witness re-pins needing owner/domain-expert derivation, not attempted here

**Finding (handoff §7.1-7.2).** `test/engine/tonal.mjs`'s `hue-solver-best` (i) cell and
`intensity-legacy`'s Data 1 perceptual stop-400 fixture are each off by 1 8-bit code from the integrated
tree's actual output, most likely from the same #686 order-dependence class U6 already fixed elsewhere
(the witnesses construct non-anchored palette objects that read `hct.js`'s now-exact-keyed caches
differently than before). I did not re-derive either witness's correct full-precision value: doing so
risks shipping a subtly-wrong literal that stops discriminating without the gate's own safety checks
necessarily catching it, and the correct derivation needs the same `okhslStops`/staircase-probe expertise
the ORIGINAL witnesses were built with.

**Ask:** whoever owns `hue-solver-best`'s STAIRCASE array / `intensity-legacy`'s fixture re-pin the two
cells against the integrated tree's actual output (mechanically the same operation already done once for
U3, per that cell's own "Repinned for #681 U3" comment).

## Q6 — `anchor-ramp lone-spike`: 64 instances, not root-caused

**Finding (handoff §7.6).** 64 near-achromatic spike artifacts in even mode, no allow-list, the gate's
own text calling a hit "a real hit is the bug this pass exists to prevent." Not triaged to a mechanism
this pass — recommend a dedicated follow-up investigation (likely related to the same anchor/near-grey
construction area as Q2/Q3, but not confirmed).
