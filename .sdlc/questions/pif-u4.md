---
kind: question
unit: pif-u4-integration (plan preset-intent-fidelity, ticket #681, unit U4)
written: 2026-09-19
updated: 2026-09-20 (pass 2, against review pass 1 pif-u4-review-1.md)
status: open
---

# U4 integration: items needing an owner decision

Full measurement detail for every item below is in `.sdlc/handoffs/pif-u4.md` (this unit's report).
Pass 2 fixed the review's two FIX-FIRST findings (F1, F2) and Finding A at the construction (old Q2,
below, is now resolved and closed as a record, not an open question). Q4 (old) is also resolved: #668
is closed, its finding moved to the handoff. Q1, Q3, Q5 remain open, restated below with this pass's
final numbers. This file states each open question plainly with its options; the owner's answer comes
back through team-lead, per the brief.

## Q1 - C4's non-anchored identity control: reconcile the criterion with U6's actual scope

**Restated with pass 2's final numbers.** `test/engine/anchor.mjs`'s `referenceNonAnchored` was repaired
pass 2 to a genuine pre-#681 implementation - its own PRIVATE, OKHSL-domain `referencePrimeSteps`
(ported verbatim from `origin/main` commit `91957732`, prime.mjs's pre-#681 redistribute rule), never
the shared post-#681 `primeSteps`. **The reading is unchanged: 0 exact, 3,796 off** - but it is now
known to be honest, not an artifact of feeding an OKHSL `l` (0..1) into a function rebuilt to expect
CIE L* (0..100). Verified directly: the prime rung (index 3) matches the repaired reference exactly on
every subject tested, as REQ-056 requires (the two constructions reduce to the identical `hctToRgb`
call for that one rung); only the six ladder rungs diverge, because U6's ticket-#681 work rebuilds
`primeSwatches`'s ENTIRE base ladder construction (CIE L* metric, held CAM16 chroma, equal-compress)
UNCONDITIONALLY, for anchored and non-anchored palettes alike, not just the anchor branch. A second
negative control (mutate `skew`, which bends only the six ladder rungs and provably never the prime
rung) confirms the six-rung comparison itself discriminates, not just the one-rung comparison the
original control exercised.

So the finding stands exactly as before, now on a verified-honest measurement: this is a real, large,
intended divergence that C4's original text - written against U1's own scope, before U6's sibling-unit
work was fully accounted for - never anticipated.

**Options (unchanged):**
1. Rule that C4's non-anchored byte-identity guarantee applies to the ANCHOR BRANCH's ISOLATION from the
   non-anchored path, not to the non-anchored construction's own absolute stability across #681 - i.e.
   accept that U6 legitimately changed the base ladder for everyone, and retire or rewrite
   `prime-identity-control` to check something else (e.g. that the anchor branch and non-anchored branch
   don't cross-contaminate each other, rather than that non-anchored output never moved).
2. Rule that C4's letter stands as written, and `primeSwatches`'s non-anchored path must be reverted to
   the OKHSL-domain construction (only the anchor branch gets the new CIE-L* ladder) - a real engine
   change, out of scope for U4 to invent unilaterally.
3. Some other reconciliation the owner specifies.

`npm test` remains red on this gate until it is ruled - correctly, since the divergence is real.

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

## Q3 - `NOTCH_ALLOW`: 78 -> 15, propose acceptance (unchanged by pass 2, restated)

**Finding, re-verified at pass 2's final head - the number has not moved.** Ruled at 78 on U2 alone (15
perceptual / 9 peak / 54 even). On the integrated tree, before AND after pass 2's fixes: **15, all even
mode, a pure subset of the original 78** (0 new members; 63 removed). Perceptual and peak drop to 0
entirely. The default kit carries 0 notched cells in every mode, confirmed. None of pass 2's fixes
(prime.mjs's widening search, the lone-spike allow-list, the referenceNonAnchored repair) touch the
ramp's chroma-envelope construction, so this number is expected to be, and is, stable across the pass.
This is the U2-ruled Q-C gate re-measured after U3's construction landed on top of it, per the brief's
own framing ("re-verified on the integrated tree, not a final owner acceptance of the count").

**Proposal (unchanged):** accept 15 as the final, owner-ruled `NOTCH_ALLOW` population and re-freeze the
array (drop the now-absent 63) with the by-name list already captured in the handoff. Not applied
myself, since the brief's Step 2 item 2 explicitly frames this as "present ... for the owner to rule
on," not a mechanical re-freeze to apply unilaterally.

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

## Q5 - two witness re-pins needing owner/domain-expert derivation, not attempted here (unchanged)

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

## Q6 (RESOLVED pass 2) - `anchor-ramp lone-spike`: 64 instances, root-caused; see the owner ruling above

**Closed as a record, not an open question.** Root-caused pass 2 review (bisection: 0 at all four merge
points, 64 only after the asset regeneration `7d659ae5`, traced to U3's ruled `dampAmp` 55 -> 0). The
owner's ruling on the finding is recorded verbatim above and applied to `test/engine/anchor.mjs`. Full
detail: handoff §7.6.
