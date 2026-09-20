---
kind: handoff
unit: pif-u4-integration (plan preset-intent-fidelity, ticket #681, unit U4)
written: 2026-09-19
---

# Reply to "Addendum 2 untouched" / "Q3 not resolved" - both items are done, evidence was stale

Both flags cite `test/engine/tonal.mjs:1420` and "notch allow-list ... 15 expected 78" at commit
`e2df6a42`. That is the commit immediately BEFORE this round's fix, not current HEAD. The fix landed in
`fa0264fa` (source) and `8afe30e5` (docs), already reported in my prior status message before these two
flags arrived.

## Verified at HEAD `8afe30e5`

- `test/engine/tonal.mjs`'s `findDips` (now line ~1545) passes `anchor: pal.anchor` to `paletteStops`.
  Both its own negative controls do too: the peak-mode one (F1's old bisection patch) was dead on the
  anchored path (`okhslStopsAnchored` has no bisection at all) and is replaced with a patch to the
  shared `anchorChromaBasis` weight (3,987 buggy dips vs 0 real - clearly live); the even-mode one is
  re-verified live against the new 90-entry baseline.
- `EVEN_DIP_BASELINE`: 90 named entries (`awk` count over the array literal = 90, matches the #701
  planner's own 90 figure exactly).
- `DIP_BASELINE`: retired to empty - peak is genuinely 0 dips on the corrected path, re-verified
  directly against all 6 old witnesses (none dip any more; their real anchored ramps differ from the
  old non-anchored measurement that first named them).
- `scripts/report-preset-fidelity.mjs --envelope`'s sweep also carries `anchor: pal.anchor`.
- The default kit is in the lone-spike sweep (a small, separate sweep in `test/engine/anchor.mjs`, not
  folded into the shared window/gap/distinct/notch loop, so it doesn't silently reopen six unrelated
  allow-lists addendum 2 never named). Found exactly one hit, matching the #701 planner's own 64-spike
  figure's companion prediction: `default kit "Default" Data 7 #088585 stop 500`.
- Data 7 is gated as its OWN named finding (`DEFAULT_KIT_SPIKE_FINDING`), explicitly NOT folded into
  `LONE_SPIKE_ALLOW`'s 64. Filed as Q8 in `.sdlc/questions/pif-u4.md`, flagging the plan's "0 notched
  cells in the default kit" invariant as the thing an owner needs to rule on, not something I can
  allow-list unilaterally.
- `LONE_SPIKE_ALLOW` itself: still 64, unchanged names - it already swept via
  `projectView(hydrate(preset))`, the real rendered path, so it never had the missing-anchor bug.
- `.sdlc/handoffs/pif-u4.md` §7.3 and §7.4-7.5 are marked **SUPERSEDED** in the same commit as the code
  fix, withdrawing the unsupported "genuinely, fully resolved" claim and stating the corrected 90/0
  numbers plainly.

## Q3 - also already resolved, same commits

`NOTCH_ALLOW` in `test/engine/anchor.mjs` is 15 entries (verified count at HEAD), not the stale 78 the
flag quotes. This gate's own sweep has always used `projectView(hydrate(preset))` (the C5/notch loop
never had the missing-anchor bug tonal.mjs's hand-built palette literals had), so 15 is, and was
already, a correctly-rendered-path measurement, not something that needed re-deriving under addendum 2.

What Q3 needed under the standing rule (cited mechanism + count gate, not a bare accepted number) is
done: `.sdlc/questions/pif-u4.md`'s Q3 section carries the full 63-name by-name diff (all 63 are
removals from the old 78, 0 new/unexpected members - verified by direct set difference) and the cited
mechanism for all of them at once, commit `2573208c` "re-centre chromaEnvelope on the anchor's own
lifted reading" (#681 U3 review pass 2, R2) - already merged into this tree via the U3 merge
(`ed14832b`) before this U4 pass started, not a side effect of any fix in this pass. `NOTCH_ALLOW` is
re-frozen to the current 15 names; the gate passes.

## Ask

Please re-check against `fa0264fa` (source fix) or `8afe30e5` (docs), not `e2df6a42`. `npm test` at
`8afe30e5`: exit 0, all 48 files pass, tree clean. Happy to point at any specific line again if
something still looks wrong once you're on the current head.
