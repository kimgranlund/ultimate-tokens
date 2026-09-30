PASS

# Review: chroma-envelope U2 (#725), pass 2

Seat: reviewer-l3 (opus, high), a same-family stand-in while the fable grade is capped, per the owner's ruling at `.sdlc/questions/seat-reliability-approval.md` (b9044bb). The builder was opus L7, so this review is not cross-family.

Reviewed at `03105f66` (plan base `plan/chroma-envelope` at `b149f8dd`, revision 5; pass 1's engine hunk `ec496bd0`) in throwaway `git clone --no-hardlinks` copies under the job tmp dir (`rev` at head, `base` at b149f8dd, `ctl` for scratch controls, reset with `git checkout -- .` between controls). The unit worktree was never written until this record. One heavy suite at a time; host load 6 to 9 throughout.

`git diff ec496bd0 03105f66 -- src/engine/` is empty: pass 2 touched no engine file, only tests, fixtures, the shared measurement lib, and records.

## The seven checks

| # | Check | Result |
|---|---|---|
| 1 | Trace proof before the re-pins | 🟢 Independent script over the full corpus plus the default doc, 3 modes, anchors as-is and stripped. Even: 0 ramps moved in any variant. Non-anchored: 0 of 400 moved in every mode. Anchor-stripped: 0 moved in every mode. Anchored perceptual 3039 of 3396 moved, anchored peak 3394 of 3396. Default-doc exports (css, shadcn, radix, panda, tailwind, dtcg) move only in the anchored perceptual and peak variants; even and stripped are byte-identical to base. Every re-pinned baseline (panda EX-2 and spec, shadcn, radix, ac003b fixture) sits on the anchored path, so R69 is the sole cause. |
| 2 | 72 vs 15 under the white-pixel rule | 🟡 CAM16 C of #FFFFFF is 2.8690352. 72 palettes have c500 below it and are dropped; 15 of those are actual overshoot violators, and each of the 15 overshoots only at stop 50, which renders #FFFFFF (c500 in 1.418 to 2.145). The 57 non-violators have c500 in 2.16 to 2.81. 0 violators exist with c500 at or above 2.869. `tonal --full` prints 0 / 3692, max 0.000000. The exclusion hides only white-pixel overshoots today, so the gate is honest; see F2 for the coverage cost. |
| 3 | C2.8 red on exactly the 3 declared rows | 🟢 `npm test`: exit 1, `2/54 failed`; the reds are gap 13 (at most 72), distinct 6 (at most 16), and C6 (ii) perceptual 3 pairs, nothing else. semantic, exports, shell, headless-boot all pass. ac003b prints its SKIP line (0.2900 / 0.2903). Porcelain empty after. |
| 4 | Retired dip baseline | 🟢 Emptying `DIP_BASELINE` / `PERCEPTUAL_DIP_BASELINE` makes the gate strictly tighter (any dip reds), so it cannot mask a regression. The re-targeted control (groupValue target plus a negative weight) bites in the all-FAIL copy. |
| 5 | `anchor.mjs --full` vs C3.7's 120 s | 🟡 Head 130 s and 122 s (load about 6); head with the f4 cap read removed 113 s; base 100 s (load 7 to 9). The cap read costs about 10 s and the engine hunk about 13 s. The handoff's 114.5 s is optimistic; see F1. |
| 6 | Four allow-lists byte-untouched | 🟢 The `tonal.mjs` hunks are only the dip, C6 (v), and control sections; the `anchor.mjs` hunks are only f4 and achromatic. No diff line lands in the gap, distinct, notch, or `KNOWN_BASELINE_DUP` bodies. |
| 7 | Every negative control bites | 🟢 with one vacuous in-test control (F4). Climb engine: achromatic FAIL (11 of 20, #808080 perceptual stop 300 C 13.28) and gid3 FAIL. f4 bound tightened to 0.01 on SAMPLED: FAIL at 0.0137. ac003b with projectView reading `p.chroma` for Neutral: FAIL ("witness row ... differs from the direct rampChroma-10 call"). Dip control and C6 (v) 1.6x plus `capPeak=false` control: bite (no control FAIL in the all-FAIL copy). `--compare` against the base fixture: 0 cells rose, even byte-identical, exit 0. |

## Other rows rerun

- C2.1 / gid3, gid3b: gid3 now asserts equality with the chroma-100 ramp (R69 caps at the anchor); gid3b covers the below-anchor direction with direct engine calls. Acceptable, since gid2 and the ac003b witness cover the projectView path.
- C2.2: `report --envelope` gate path perceptual 300 FAIL, peak all OK, anchored cells match the plan's head row, violations 2, exit 1. Over 90 at stop 300: perceptual 1042, peak 575, even 407. `gate:chroma-envelope` passes and matches the plan's head row. `gate:mode-isolation` passes with a874ac86f2e113b4 / 815dcec4262382da.
- `anchor --full` at head: only anchor-ramp reds (gap 89 vs 72, distinct 31 vs 16, notch 15 vs 17); monotone 0; achromatic passes (even 9 of 9 with 1 skipped; 20 of 20 at C below 5); f4 uncapped max 0.0050, cap-moved stops 7841 with max 0.0184 (Jekyll and Hyde tertiary stop 400), under the 0.02 bound.
- `tonal --full` all-FAIL copy: only C6 (ii) fails (perceptual 10 pairs, peak 40 pairs, 8 of 22 cited keys not observed).
- `scripts/lib/envelope-measure.mjs`: the injected-instances path and the L* window are additive; excluded violations are returned and printed by name, not dropped.

## Findings, by severity

**F1 🟡 medium. C3.7's 120 s budget is at risk.** `anchor.mjs --full` measured 122 to 130 s at load about 6. The f4 check derives "cap-moved" by re-running an uncapped engine and diffing (about 10 s), where the plan asked for a flag read off the cap's return. The cheap fix is an engine row flag, which is an `src/engine` change and so belongs to U3's plan, not this pass.

**F2 🟡 medium/low. The white-pixel exclusion is per palette, not per stop.** It drops 72 palettes (about 1.9% of 3764) from the C6 (v) ratchet so as to hide 15 whose only overshoot is the #FFFFFF stop 50. A per-stop exclusion (skip a stop whose hex is #FFFFFF, or whose C is at or below `WHITE_PIXEL_C`) would keep the other 57 palettes, and the non-white stops of all 72, under measurement. Not blocking: nothing is hidden today.

**F3 low. Stale comment.** `test/engine/tonal.mjs:1851` says the 15 near-grey anchors are excluded, leaving 3,749 measured. The actual figures are 72 excluded and 3692 measured.

**F4 low. Vacuous in-test witness control.** `test/ui/shell.mjs:286` checks `readsChroma(directAt(wn, wn.chroma, ctl), wn, ctl)`, which compares the chroma-direct row with itself and can never fail. The real teeth are external: my scratch control (projectView reading `p.chroma`) does red ac003b. Either delete the line or make it plant the regression in a projectView row.

**F5 info. Handoff Deviation 5.** The climb copy prints 446 / 0, not "the same two counts" the plan predicted.

## For the Orchestrator

| Plan item | Plan text | Observed | Suggested revision |
|---|---|---|---|
| C2.3 | 15 excluded, 0 / 3749 | 72 excluded, 0 / 3692 | Restate as 72 / 3692; consider a per-stop exclusion (F2) |
| C2.2 climb control | same two counts | 446 / 0 | Record the printed figures |
| C2.7 | citation at line 282; `tonal-legacy.json` moves | line 300; `tonal-legacy.json` unchanged | Fix the citation; drop the legacy-fixture expectation |
| C2.4 | cap-moved flag read off the cap's return | derived by diffing against an uncapped engine | Carry an engine row flag into U3 (also fixes F1's 10 s) |
| C3.7 | corpus-anchor slowest of three at most 120 s | 122 to 130 s at head | Re-time at U3 after the flag, or re-budget |
| C6 (ii) movement | 37 new keys | perceptual 10 pairs, peak 40 pairs, 8 of 22 cited keys gone | Restate from a unique-key count before U3 re-pins |
