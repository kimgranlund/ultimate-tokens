FAIL

# Review: chroma-floor U2 (#701), pass 1

| Field | Value |
|---|---|
| Seat | reviewer-l3 (opus) standing in for reviewer-l4 while fable is capped (owner ruling `.sdlc/questions/seat-reliability-approval.md`). The builder is opus (builder-l6), so this check sits inside the builder's family |
| Branch | `unit/cf-U2` @ 0427d587 (code fe65e640), base 8b731da5 |
| Spec | `.sdlc/plans/chroma-floor.md` U2 entry, C1 to C12, Constraints, Blast radius, Risks, revision 13 |
| Host | 1-minute load 120 to 174 on 10 cores; no timing here is a figure of record |
| Tree | clean after every run (`git status --short` 0) |

## Verdict

The floor redesign does what it claims on the two targets the stop rule names: 0 off-anchor even dips on both paths, the four gate-path cells unmoved, revision 13's three stop-400 dips gone. The code is small and correct as written. It fails on the clamped-anchor boundary: the carve-out makes the engine discontinuous at the tone-window edge, and the builder's own reason for it applies just inside the window as well. The carve-out's actual job is keeping #739's `achromatic-anchor` skip bound green. That is a second workaround, and the model needs re-diagnosis or an owner ruling before a verifier grades it.

## Findings

| # | Sev | Where | Finding | Route |
|---|---|---|---|---|
| 1 | 🔴 Major | `src/engine/tonal.js:797-803` (`const floorRef = clamped ? Infinity : maxc500;`) | The clamped-anchor boundary is a threshold patch on a continuous mechanism. The handoff defends it by measurement: `#FFFFFF` stop 700 drops from 14.45 to 4.72, "the dead zone the floor exists to lift". The same drain happens to in-window anchors just inside the edge. My probe (hue 250, chroma 50, even, `DEFAULT_CONTROLS`, 19 stops, CAM16 C) shows it at stop 750: `#E8EEFA` (L* 93.97, in window) went from U1 21.5 to U2 5.4, and U2 holds 5.4 flat from 750 to 950. `#ECF1FC` (L* 95.06, clamped) reads 22.3 on both U1 and U2. So two anchors 1.1 L* apart differ by 4x in dark-side chroma. The dark edge shows it too: `#1C2030` (L* 12.57) caps its light side at 16.7 (U1 peaked at 24.6), while `#161A28` (L* 9.50, clamped) keeps 24.0. Two cases, both needing a ruling. If this drain is acceptable, the carve-out has no engine reason: with it removed (`floorRef = maxc500` always) I measured 0 off-anchor dips on both paths, so its only job is #739's skip bound (4 of 30 against a bound of 3, per the handoff). If the drain is not acceptable, the in-window near-edge anchors regress with no gate watching. Corpus scale: 10 anchors are clamped (3370 of 3380 in window). 17 of 55 anchors below L* 15 and 2 of 18 in L* 88 to 96 have a stop losing more than 8 C and more than half its chroma between U1 and U2. The plan names none of this, and the foundations §5 and knowledge-02 formulas omit the exception | planner re-diagnosis or owner ruling, then a plan revision that names the boundary (the builder's own 🟡 asks for this). Candidates: a floor reference that goes to its pivot value continuously, not across a cliff, or rule the drain acceptable, drop the carve-out and re-read #739's bound with that ruling |
| 2 | 🟡 Minor | `test/engine/tonal.mjs:1656-1693`, `test/engine/even-dips-gate.mjs:310-318` | The retargeted controls hold, but they are a deviation from C3 (1) as the plan wrote it. Plan literal: the shipped floor at 1.6x. I confirmed that is vacuous by construction: shipped x1.6 and x3 both read 0 off-anchor on the rendered and gate paths. What replaced it: (1') the pre-#701 floor at 1x reads 24 rendered, which is the revision-13 figure and the exact regression the redesign exists to prevent, so it is a real control. (2') the same floor at 1.6x reads 381 rendered and 120 on the gate path (I re-ran `--floor-scale 1.6`: `FAIL`, exit 1). The gate keeps its teeth on the rendered path. On the gate path the pre-#701 floor at 1x also reads 0 (as at `<base>`), so `gate:even-dips` proves only that its predicate is live, not that the redesign is protected; C4 as written accepts that. Dropping `floorRef` only at the `paletteStops` site reads 0 dips on both paths; that site is guarded only by the 37 re-pinned `tonal-legacy.json` cells | Orchestrator: record the control change in the same plan revision as finding 1 |
| 3 | 🟡 Minor | `.sdlc/adapter.md:36` (`sweeps` row) | Stale record in the same change: the row still says the timing is "derived by summing the six rows'", `329 to 442 s` (`86+79+67+57+20+20 to 116+100+86+83+23+34`), and "CI runs the six as a matrix". U2 made it seven. The sum should read 355 to 475 s with `+26` and `+33` | builder, same unit |
| 4 | 🟡 Minor | `.sdlc/handoffs/chroma-floor-U2.md` Blast radius | The plan's Blast radius section asks for "the default-kit even ratios per family before and after". The handoff lists the 37 moved cells and says role-contrast is green and FLOORS did not move, but gives no ratio figures. The other fields are present: presets 344/344, palettes per mode (perceptual 0, peak 0, even 2,566 alone and 3,137 cumulative), max dL* 0.3848, max dC per stop, cells 13,353 / 94,900 = 14.07% (under the 15% line, 0.93 points of headroom left for U3 and pre-land), spikes, dip histogram, four cells on both readings, exports | builder, same unit |
| 5 | 🟡 Minor | `src/engine/tonal.js:320-329`, `.claude/skills/color-math/references/foundations.md:131-137` | Overclaim: "the damped value is non-increasing outward ... so no off-anchor dip can form". That holds only when `intended` is constant along the ramp. With `relChroma` (`intended = c * maxc`) or the anchored `anchorChromaBasis` blend, `intended * env` can rise away from the anchor. The 0 is an empirical, gated result, not something the structure guarantees | reword as "does not form on the corpus; gated at 0", or state the assumption |
| 6 | ⚪ Nit | `test/engine/tonal.mjs:1202` | `(tonal.js:749)` points at a comment, not at the `chromaEnvelope(stop, 500, lift, controls)` call site (now about line 806). This was already stale at base (base line 749 is the same comment), so it predates U2; the +15 line shift moved it further off. `citations.mjs` does not scan test comments | U3 sweep |

## What holds (checked, not taken from the handoff)

| Item | Evidence |
|---|---|
| C3 rendered path | My own sweep, 19 + 25 stops, corpus + kit: real engine 0 off-anchor. Pre-#701 floor 24, which matches revision 13 |
| C4 | `node test/engine/even-dips-gate.mjs --full`: exit 0, `negative control (pre-#701 floor, 1.6x): 120 dips`, `dip-gate even gate-path (no anchor): 0 dips (19 + 25 stops, 3764 palettes + default kit 16, no baseline)`, `PASS`. With `--floor-scale 1.6`: `FAIL`, exit 1. `gate:even-dips` appears 3 times in adapter.md; the ci.yml sweeps awk reads 1 |
| C11 | `grep -c EVEN_DIP_BASELINE test/engine/tonal.mjs` 0; `stops other than 500` 2; the dip branch has no membership test (`tonal.mjs:1581-1592`) |
| Fixture | `tonal-legacy.json`: 37 cells changed, all under `paths.even`, 0 perceptual |
| Scope wall | Every touched path is in U2's list or admitted by revision 13(b). `foundations.md` is U3's file, touched early and consistently |
| C12 | `baseline-agrees-check.sh`: 15 lines, `ok time gate:even-dips: baseline 26 to 33 s`, only `STALE ui.html`, `stale total: 1` |
| Timing 0/3 | The load readings are recorded honestly. R57 allows this; it is owed at U3 or pre-land and is not a U2 red |
| Docs | `citations.mjs`: STALE 0. `branding.mjs`: clean (744 files). U+2014 in added lines: 0 |
| Stop rule | Its literal condition is not triggered: the four gate-path cells hold and off-anchor dips are 0 |

## Not run

`npm test` and the full `gate:corpus-tonal` and `gate:corpus-anchor` legs were not re-run (load 120 to 174). These findings rest on the targeted sweeps above. The verifier owns the full legs.
