---
kind: re-diagnosis
plan: preset-intent-fidelity
ticket: "#681"
unit: U2
written: 2026-09-19
inputs: unit worktree `.git-worktrees/pif-u2-ramp` (branch `unit/pif-u2-ramp`, handoff and questions
  docs read at their head as fetched this pass), plan branch `plan/preset-intent-fidelity` at `e8dd4c79`
  (U2's paragraph, revisions 14-24), the planner's own first re-diagnosis
  `.sdlc/plans/preset-intent-fidelity-u2-rediagnosis.md` (`a6bfdf1`), reviews 1-5
  (`pif-u2-review-1.md` through `pif-u2-review-5.md`), revision 21/23 (the Q-D hueSpace ruling)
status: feeds a future plan revision, pending the owner's pass cap ruling on the bounded pass and
  the descoping proposal below
addendum: 2026-09-19, on Lane A's inputs doc and the a75733d4 checkpoint (see "Addendum" section below);
  supersedes this doc's original "one bounded construction" section
---

# U2 second re-diagnosis: one construction explains both the perf regression and the hue-solve fallback

## Why this doc exists

The owner capped U2 at one more bounded builder pass after this diagnosis, then a descoping proposal
if that pass fails, per the pass-cap ruling (AskUserQuestion, 2026-09-19). Two symptoms are named as
possibly one problem: `npm test` at 200.3s against a 76.7s baseline (confirmed by team-lead directly,
`/usr/bin/time -p npm test` on a clean scratch worktree at `3c9630bf`; my original draft below flagged
this figure as unverified before that measurement arrived), and the even-mode hue-solve fallback that
copied cam16's tint on 152 stops before review 5's fix. This doc traces both to the same root: an
expensive, exact, per-stop numerical hue solve is run over the FULL curated corpus, redundantly, inside
`npm test`'s default budget.

## Mechanism: one root cause, two symptoms

**Verdict: bug in test-harness placement, not in the hue-solve algorithm itself.**

`src/engine/tonal.js`'s `paletteStopsAnchored` (the even-mode anchored path) needs a per-stop hue solve
to keep the ramp's OKLCH hue close to the anchor's real hue throughout the ramp (the correction
`hueSpace: "oklch"` exists for, R3). Review 4 shipped a cheap fixed-point step for this solve. Review 5
found it silently falls back to `seedHue` (cam16's own hue) whenever it fails to converge, and it fails
far more often than reported: 152 stops in 79 ramps regressed by more than 5 degrees from the pre-fix
render, 119 of them had a real root the iteration simply missed, and the worst was a lone lemon-yellow
spike (`#FFFF94`, OKLCH C 0.130) at stop 125 of a warm-grey ramp. Review 5's own diagnosis: "the
mechanism is right... the root-finder and the fallback are what is wrong," and it recommended a
bracketed solve (scan a window around the target hue, bisect the sign change) plus a lone-spike gate.

That fix was built (`13cee2f2`, "review pass 5 fix in progress: bracketed root-find, achromatic fix,
lone-spike gate") and it works: at head, 0 stops render worse than the pre-fix baseline by more than 5
degrees, both named regressions (Nike, the 48 N secondary-muted ramp) render correctly, and the new
lone-spike gate reads 0 on the shipped engine while a negative control against the pre-fix engine reds
at 10. This part of review 5's fix is not a symptom to redo. But it is exactly what made `npm test`
balloon: the handoff's own words, "root cause: `chromaAt` is a full gamut-boundary binary search
(about 46.2us/call), run on every grid point of every stop, for every stop in the corpus," measured at
about 1196s for the initial always-scan design. Two further, additive fixes (a fast-path that only
falls to the bracketed scan for the roughly 865 of 72,000 stops that actually need it, then memoizing
`paletteStopsAnchored` against `projectView`'s own roughly 10x redundant per-export-format
re-derivation) brought it to 398.83s then 200.3s, still 1.14 to 2.2 times over the stated 90-175s
budget. The handoff's own diagnostic profile found the hue solve is only about 90ms of a roughly 238ms
per-document render once memoized, and could not attribute the remaining cost to this pass's own code.

**This is one model, not two.** The correctness bug (a cheap iteration missing real roots) and the
performance bug (the correct fix needs an expensive scan) are the same design tension: a numerically
exact per-stop solve, run over every stop of every anchored ramp, for every export format, for the
full 3,780-palette corpus, inside `npm test`'s default budget. Making the solve itself faster (the two
perf patches already applied) mitigates but does not remove that tension, because the corpus size and
the export-format multiplier are still there; the diagnostic profile's unattributed residual is most
likely exactly that multiplication, not a leftover bug in the solve.

This repo already has a named pattern for precisely this shape of problem. `package.json`'s
`gate:corpus-contrast` script and `.sdlc/adapter.md`'s own line on it: "`npm test` already runs the
same gate SAMPLED (brands.json in full plus one deterministic volume per gallery category), so this
is the full-corpus leg only," at about 20s standalone, kept out of `npm test`'s default run entirely.
`test/engine/anchor.mjs`'s corpus-wide checks (the monotone sweep, `RAMP_GAP_ALLOW`, `RAMP_DISTINCT_ALLOW`,
`NOTCH_ALLOW`, the lone-spike gate, and the hue-solve regression check review 5 added) run the full
3,780-palette corpus inside `npm test` today, unlike `curated-contrast.mjs`, which already follows the
sample/full-sweep split. U2's perf problem is not a novel one for this repo; it is the one existing
gate in this unit that never adopted a fix the repo already made for the same class of cost.

## The notch list, 76 to 78

Review 4 measured `NOTCH_ALLOW` at 76 (15/9/52). Review 5 measured it at 78 (15/9/54), a plus 9, minus
7 change in even mode only, entirely caused by the bracketed solve's own correctness fix moving stops
onto the anchor hue by one 8-bit code, which nudges a handful of already-marginal (2.7 to 2.98 CAM16 C)
dips just over the 3.0 absolute-dip bar. Review 5 spot-checked 5 of the new entries and confirmed each
is a 1-code move with no visible effect, and named this "invisible... threshold churn, not a new
visible defect," while flagging that it is still a change to a ruled figure. I agree with review 5's
own reading: this is a downstream, correct consequence of the correctness fix landing, not a separate
defect needing its own diagnosis. It does not need a construction change; it needs the owner (or
team-lead, per the plan's existing "pending U4" pattern for other moving allow-lists) to confirm 78
(15/9/54) as the current, accepted count, the same way every other named allow-list in this plan is
confirmed by name and count once a construction change lands.

## The one bounded construction for the next pass (superseded, see Addendum)

Split `test/engine/anchor.mjs`'s full-corpus checks into a sampled population for `npm test` and a
full-corpus leg in a new `gate:corpus-anchor` npm script, mirroring `gate:corpus-contrast`'s already-
ratified shape exactly. This was my first draft's recommendation, written before Lane A's fix-at-the-
source checkpoint (`a75733d4`) reached me; the Addendum below replaces it as the primary recommendation.
It stays here, kept rather than deleted, as a secondary hardening worth doing later regardless: even
once the redundant derivation is fixed at its source, a full 3,780-palette corpus sweep inside `npm
test`'s default budget is still more than every other full-corpus gate in this repo does by convention.

## Addendum: diagnosis at checkpoint a75733d4, the real fix is already underway

Lane A's inputs doc and a following message gave two things my original draft did not have: a
confirmed 76.7s baseline (above), and a checkpoint (`a75733d4`, tree clean, `npm test` 48/48 green at
166.08s) that fixes the redundant derivation AT ITS SOURCE rather than around it. This changes the
recommended construction.

**A second real defect, found and already fixed at this checkpoint.** The `fba53077` memoization
(`_pmemo`, module-level) that took `npm test` from 398.83s to 200.3s was itself unsafe: keyed on
`stops.length` instead of the actual stop values, returning a shared mutable array, module-level scope
outliving any one render, exactly the `#686` class of cache defect this ticket's own U6 unit fixed
elsewhere in the engine. `a75733d4` removes `_pmemo` entirely.

**The redundancy is fixed at its source instead.** `src/engine/exports.js`'s `derivedAll(state)` (the
function every one of the 9 export formats calls to re-derive each enabled palette's ramp) now takes
an optional trailing `derived` argument on all 9 exporters plus `exportAll`, defaulting to `derived ||
derivedAll(state)` so every existing caller (tests, the MCP server, `figmaBundle`) is unaffected.
`src/ui/model.mjs`'s `projectView` computes `derivedAll(state)` ONCE, as a local value (no
module-level cache, so no `#686`-class risk), and threads it through all 9 export calls. This is a
correct diagnosis of the actual duplication Lane A's hypothesis named (`chromaAt`'s cost multiplied by
`projectView` re-deriving each ramp about 10 times, once per export format) and it removes the
multiplication rather than hiding it from `npm test`'s measurement. Wall time: 200.3s to 166.08s,
which is UNDER the owner's 175s hard ceiling for the first time, though still over the 100s soft
target (about 1.3x the 76.7s baseline) named in the perf brief.

**One redundancy remains, named by the checkpoint itself.** `projectView`'s own canvas-scene loop
(building `palettes[i].fullRamp`/`ramp` for the UI) calls `paletteStops(...)` directly, independent of
`derivedAll`; it does not consume the `derived` value threaded into the exporters. So each anchored
ramp is still derived about twice (once for the canvas, once for every export format combined), down
from about ten times, not down to one. This is a real, named next step, not a new defect.

**Open question the checkpoint itself flags, not yet answered:** hex-parity between `a75733d4` and its
parent `4c2831ab` has not been re-verified. Threading a shared `derived` value into 9 previously-
independent call sites is exactly the kind of change that can silently alter output for one exporter
if any of the 9 read something from `state` that `derivedAll` resolves differently than that exporter
used to resolve it alone (an opts-dependent field, an ordering assumption, a stale default). This must
be gated, not assumed.

**Revised bounded construction:** complete the source-level fix by threading the SAME already-derived
ramp data into the canvas-scene loop too, eliminating the remaining ~2x duplication, instead of (or in
addition to, as a later hardening) the test-harness sampling split above. Mandatory correctness gate,
answering the checkpoint's own open question: full-corpus hex-parity, every one of the 9 export
formats plus the canvas's own `ramp`/`fullRamp`, byte-for-byte identical before (`4c2831ab`, pre-dedup)
and after (this pass's head), over the full 3,780-palette corpus plus the 16-palette default kit, in
all three tone modes, not a spot check. `NOTCH_ALLOW` confirmed at 78 (15/9/54) in the same pass, per
the reading above; the dedup work does not change the hue-solve algorithm, so it should not move this
count again, and the parity gate would catch it if it somehow did.

**Stop rule (revised).** If threading `derived` into the canvas loop is straightforward and parity
holds everywhere, ship it; wall time should improve further toward the 100s target, re-measured, not
projected. If the canvas genuinely needs data `derivedAll` does not compute (richer per-stop fields:
`rgb`, `maxc`, `inGamut`, `tone`, used by the plot and role-resolution steps but not by any export
format) such that unifying the two call sites is real new engine work rather than a threading change,
U2 stops there: report which fields differ and why, and treat the current a75733d4 state (166.08s,
under the 175s hard ceiling, over the 100s soft target) as the descoping case below rather than forcing
a deeper unification under pass-cap pressure.

## Descoping proposal, if the bounded pass fails

What ships regardless: the bracketed root-find, the achromatic-candidate fix, the lone-spike gate
(review 5's correctness work), and the already-checkpointed `_pmemo` removal plus export-side
`derivedAll` threading (`a75733d4`, 166.08s, under the 175s hard ceiling) once its own hex-parity
question is answered. What defers: eliminating the canvas's remaining ~2x duplication, and closing the
gap from 166.08s to the 100s soft target, becomes a follow-up unit or ticket if it turns out to need
real engine unification rather than a threading change; the test-harness sampling split (the original
section above) is an available, independent, lower-risk fallback for that follow-up if the owner wants
`npm test` closer to budget sooner without further engine changes. Which criteria yield: none of C1 to
C12; this problem sits entirely in build and test infrastructure, not in product fidelity, so no plan
criterion needs to move. What the owner rules on if the bounded pass stops short: whether 166.08s
(already under the hard ceiling) is an acceptable landing point for this ticket, with the residual gap
to the soft target reported and deferred, the same shape as every other "pending U4" deferral already
in this plan.

**Parity baseline amendment (conductor, 2026-09-19, on Lane A's pass-6 finding).** The parity gate names `4c2831ab`, but that tree still carries the `_pmemo` cache, so its full-corpus sweep is order-dependent (the #686 class): 7 cells differ by one 8-bit code, all even mode at stop 100, traced to the cache's own key collision, with `a75733d4` the more correct side. The gate therefore reads: full-corpus hex parity against `954675c6`, the last pre-`_pmemo` commit, expected 0 differing cells; the 7 cells against `4c2831ab` are recorded as a cache artifact, not a regression.
