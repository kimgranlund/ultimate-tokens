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
---

# U2 second re-diagnosis: one construction explains both the perf regression and the hue-solve fallback

## Why this doc exists

The owner capped U2 at one more bounded builder pass after this diagnosis, then a descoping proposal
if that pass fails, per the pass-cap ruling (AskUserQuestion, 2026-09-19). Two symptoms are named as
possibly one problem: `npm test` at 200.3s against a stated 77s reference, and the even-mode hue-solve
fallback that copied cam16's tint on 152 stops before review 5's fix. This doc traces both to the same
root: an expensive, exact, per-stop numerical hue solve is run over the FULL curated corpus, redundantly,
inside `npm test`'s default budget, instead of following this repo's own established pattern of
sampling in `npm test` and running the full corpus in a separate `gate:corpus-*` script.

A note on the "77s" figure: I could not independently verify it against any doc in the U2 worktree or
the plan. The closest verified figures are `.sdlc/baseline.md`'s repo-wide `npm test` baseline
(58.4/62.4/60.8s, 44 test files, `origin/main` at `7faf3aa`, 2026-09-16) and the handoff's own reported
times at 48 test files (1196s, then 398.83s, then 200.3s). I am treating 77s as team-lead's own stated
reference and not asserting it as independently confirmed; the diagnosis below stands on the verified
1196/398.83/200.3s sequence and the 90-175s budget the handoff itself cites as the owner's stated gate.

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

## The one bounded construction for the next pass

Split `test/engine/anchor.mjs`'s full-corpus checks into a sampled population for `npm test` and a
full-corpus leg in a new `gate:corpus-anchor` npm script, mirroring `gate:corpus-contrast`'s already-
ratified shape exactly: the same sample set (the default kit / `brands.json` in full, plus one
deterministic volume per gallery category) runs inside `npm test`; the full 3,780-palette sweep
(monotone, `RAMP_GAP_ALLOW`, `RAMP_DISTINCT_ALLOW`, `NOTCH_ALLOW`, the lone-spike gate, and the
hue-solve regression check) moves to the new script, run in CI's corpus job alongside
`gate:corpus-contrast` and by U4's report before U3 lands. No engine change: the bracketed solve, the
achromatic fix, the fast-path, and the memoization all stay exactly as shipped. Confirm `NOTCH_ALLOW`
at 78 (15/9/54) as the current count in the same pass, per the reading above.

**Stop rule.** This is a test-harness placement change, not a numerical retune, so it either closes
`npm test` under the 90-175s budget by removing the full-corpus multiplication, or it does not. If the
sampled `npm test` run still exceeds budget once the full-corpus checks are moved out, the remaining
cost is not attributable to corpus size and U2 stops there: no further sampling-granularity trial passes,
report the sampled-run numbers and the profile to the owner, and treat it as the descoping case below.

## Descoping proposal, if the bounded pass fails

What ships regardless: the bracketed root-find, the achromatic-candidate fix, and the lone-spike gate
(review 5's correctness work is sound on its own evidence and is not in question here). What defers:
bringing `npm test`'s own wall time under the stated budget becomes a follow-up ticket scoped to the
test-harness's own architecture in general, not to U2's engine work, since other units' gates may carry
the same full-corpus-inside-npm-test shape and a proper fix likely wants one pass across all of them,
not a second one-off inside this ticket. Which criteria yield: none of C1 to C12; this problem sits
entirely in build and test infrastructure, not in product fidelity, so no plan criterion needs to move.
The only thing the owner rules on on failure is whether to accept `npm test`'s wall time above the
90-175s budget as a known, reported gap for this ticket to land against, the same shape as every other
"pending U4" deferral already in this plan.
