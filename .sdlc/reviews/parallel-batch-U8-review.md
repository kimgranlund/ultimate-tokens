FAIL
# Review · parallel-batch U8 (#784 the anchored notch at stop 200) pass 1 · reviewer to orchestrator

| Field | Value |
|---|---|
| Unit | U8, branch `unit/pb-U8`, head 9be89f15, base 7af47a84 (`git merge-base HEAD plan/parallel-batch`) |
| Verdict | FAIL on judge item 1 (R98): the mechanism is right and the anchored fix is that mechanism's fix, but the same quantity still notches the non-anchored path, and the reason the unit gives for leaving it is a measurement artifact |
| Everything else | 🟢 C8.1 to C8.7, C1, C3, C4 rerun green with biting controls; C2 and C8.8 not rerun (see Skipped) |

## Findings, by severity

### F1 (major, R98): the rotated-ceiling cap is still live on the non-anchored path, and the comment that says otherwise is false

The unit's mechanism is the floor's cap read at the rotated hue. `paletteStops`'s non-anchored line (`src/engine/tonal.js:1041`) still passes `floorRefAt(baseHue, maxc, ...)` with `maxc` the ceiling at the rotated hue, so on that path the floor still follows the rotated ceiling. The comment added at `src/engine/tonal.js:1012-1014` and the handoff's Findings justify leaving it with "grid (a) reads 0 and #784 measured no defect here". Grid (a) fixes `skew 0, lift 0` (`test/engine/even-dips-gate.mjs:170`), and at nonzero skew the defect is there.

Probe (`/Users/kimba/.claude/jobs/8c58a81c/tmp/pb-U8-rev/probe.mjs`): no anchor, chroma 100, kit controls, dampAmp 0, even, hue 0 to 355 step 5, skew -60/-20/0/20/40/60, lift -36/-15/0/15, hueShift +/-30/45/60, both hueSameDir, both hue spaces, both stop sets, the gate's predicate.

| Engine | Dips | Notes |
|---|---|---|
| head (= base on this path, hex-identical) | 14 | |
| head with line 1041 capped at the pre-rotation ceiling (`floorRefAt(baseHue, maxChromaInGamut(baseHue, tone), ...)`, "v2") | 2 | removes 12; adds 0 anywhere on the grid (the 2 left are also in head) |

One cell, stop by stop (`probe2.mjs`), oklch hue 65, skew 40, lift 0, hueShift -60, 19 stops, chromaFloor 40:

| stop | H rot | ceil@rot | C head | C/ceil@rot | C v2 |
|---|---|---|---|---|---|
| 150 | 111.93 | 36.48 | 14.59 | 0.400 | 8.36 |
| 200 | 105.26 | 24.09 | 11.35 | 0.471 | 11.35 |
| 250 | 98.59 | 25.75 | 14.68 | 0.570 | 14.68 |

Stop 150 reads exactly 0.40 of its rotated ceiling, which spikes on the high-tone yellow ridge, the same signature as #774902's stop 200 at the base. Same quantity, same ridge, other caller: the fix as landed is per-caller, and a user can reach the notch by putting skew and hueShift on any non-anchored palette.

Remedy, the Orchestrator's routing call:

| Option | What | Cost measured |
|---|---|---|
| A (recommended) | Apply the pre-rotation cap at line 1041 too (one predicate on both paths), widen grid (a) with nonzero skew/lift so it sees the 14, add the v2-reverted engine as grid (a)'s second control, widen the C8.6 declaration in the Findings with these numbers | my v2 plant's identity run: `identity even: 5/3780 palettes, 9/94500 cells differ, max dL* 0.1548` (Adia Neutral 925/950, Adia Warning 950, ...), perceptual, peak and kit 0. The plan's C8.6 allows "the exact wider set the Findings justify" |
| B | Owner rules the non-anchored path out of #784: file a follow-up issue with this probe, and correct the comment at `tonal.js:1012-1014` and the handoff's "no measured defect" (stale context is a defect in its own right) | none to the engine |

### Note (no finding): the plan's stale figures

Recorded so pre-land does not re-derive it. The plan's 17.73 at "stop 100" and the "-45 triple" do not reproduce, and the builder's explanation holds: the report's `--base 7af47a84` leg and my independent import of the base engine (`git show 7af47a84:src/engine/*` into scratch) both read 16.58 / 11.80 / 15.51 at stops 150 / 200 / 250 at -30, and -45 at the base reads 12.36 / 16.79 / 17.25 / 17.61 at 150 to 300, no dip. The 11.80 and 15.51 match the plan.

## Judge items

| # | Item | Result | Evidence |
|---|---|---|---|
| 1 | mechanism named with numbers, fix is its fix, no per-caller special case | 🔴 | Mechanism 🟢: base reads `C/ceil@rot` 0.400 exactly at stops 200 and 250, ceil@rot 56.47 / 29.50 / 38.78, 0.40 * 29.50 = 11.80. `evenChroma` dropping the inner `min` is byte-neutral for every other caller (default `floorRef = maxc`; `floorRefAt` returns at most the cap it is handed), confirmed by the identity lines. Per-caller 🔴: F1 |
| 2 | 17.73 and -45 discrepancies | 🟢 | F2 |
| 3 | (b1) widened, both controls bite; (b2) pin 7/8 to 3 | 🟢 | (b1) `0 dips ... 384 palettes`, controls 12 and 4. Base replay of (b2) (`b2replay.mjs`, the gate's own `gridRandom` on both engines): base 6 cells in 4 palettes (#317 #346 #781 #934), head 3 in 2 (#317 #934). The pin equals the head count, so it is tighter, not looser, and the plan's not-in-scope row allows it ("unless the fix lowers it") |
| 4 | identity, mode-isolation, chroma-envelope | 🟢 | six identity lines 0 cells; `pass mode-isolation: perceptual 86f6e551dc20e6d7 peak 5f0eabbbe9b3c154 match fixture`; head fixture captured to scratch, `0 cells rose`, byte-identical to the committed fixture apart from `capturedAt` |
| 5 | lane additions are line-number repairs only | 🟢 | both doc hunks change `tonal.js:1050` to `:1065` and nothing else; `okhslLAt` is at 1065 on head and 1050 at base |

## Criteria rerun (scratch clones of 9be89f15 under `/Users/kimba/.claude/jobs/8c58a81c/tmp/pb-U8-rev/`)

| # | Result | Run | Negative control planted (clone `plant/`) |
|---|---|---|---|
| C8.1 | 🟢 | `--notch --hue-shift -30,-45,0 --base 7af47a84`: base dips at stop 200 on both sets at -30, none at -45 or 0 | the `--base` leg is the control; also my independent base import, same figures |
| C8.2 | 🟢 | checked against the dump (judge 1) | n/a |
| C8.3 | 🟢 | head: 0.40 / 3.04 / 4.99 / 9.30 / 16.95 at -30, -45 and 0; 4.99 >= min(0.40, 16.95) | `const mcRef = mc;` planted: the report's "this tree" leg returns 16.58 / 11.80 / 15.51, `4 dip(s) in total` |
| C8.4 | 🟢 | `(b1) ... hueShift +/-30/45/60: 0 dips (... 384 palettes ...)`, controls 12 and 4 | same plant: `(b1) ... 4 dips`, `(b2) 6 dips in 4 palettes`, `FAIL`, exit 1. Separately, both CAP_TARGETS made no-ops: `FAIL: negative control DID NOT bite ... merge-base cap ... produced 0`, exit 1 |
| C8.5 | 🟢 | `(b2) 3 dips in 2 palettes (... bound 3 ...)`, `PASS` | `--floor-scale 1.6`: `124 dips ... pre-#701 floor scaled 1.6x`, `FAIL`, exit 1 |
| C8.6 | 🟢 | six lines 0 cells, mode-isolation pass, `0 cells rose` | v2 planted (a non-anchored movement): `identity even: 5/3780 palettes, 9/94500 cells differ` |
| C8.7 | 🟢 | `PASS: tonal-generation clears all [gate] predicates`; `PASS (FULL): C2, C3, C4 ...`; `PASS: prime-system clears all AC-050 gates`; clone tree 0 after | C1's control below |
| C1 | 🟢 | `✓ all 54 test files passed`, exit 0, tree 0 | `"scrim` to `"scrimX` in the role table: `engine/semantic.mjs FAIL`, `refs-canonical`, `✗ 1/54`, exit 1 |
| C3 | 🟢 | `em-dash: clean (1205 files scanned)`, `branding: clean (1197 files scanned)`, `verdicts 286 graded 286 bad 0` | not planted |
| C4 | 🟢 | the ten files in the handoff, nothing else | not planted |

## Skipped

| Item | Why |
|---|---|
| C2 `npm ci && npm run build` | heavy on a loaded host (1-min load 7 to 20 through this pass); the builder reports it green and the verifier reruns it |
| C8.8 paired timing | no quiet window; my one head `even-dips` run took 102 s wall at load 7 to 20. The builder's 🟡 stands for the owner |

## Follow-ups (not FAIL)

- The plan's C8.1 and C8.5 text (17.73, "stops 100 / 200 / 300", "pinned 7") is stale; the Orchestrator's plan revision should carry the measured figures.
- The report's `--hue-space` defaults to the kit's space (oklch). The handoff's C8.1 command does not show the cam16 leg; `--hue-space both` would put it on the record.
