---
kind: rediagnosis
plan: pane-context
unit: U4
ticket: "#785"
red: gate:even-dips at unit/pc-U4 c161f252 (verdict pass 1)
written: 2026-10-03
---

# pane-context U4: `gate:even-dips` red, re-diagnosis

## Verdict in one line

The control is wrong, not the damper. Since #785, `palette.chroma` reaches `evenChroma` only at 100. The grid's chroma axis (30/45/60) therefore never renders the regime where #766's floor reference acts. Two controls went blind, not one: (a), and also (b2), which the verifier could not see because the script exits at (a). Fix: re-derive the gate (add chroma 100 to (a), render (b2) at chroma 100, re-pin (b2) by its own R87 rule), done as a U4 pass 2. No owner question is needed.

## Root cause

| Step | Fact | Evidence |
|---|---|---|
| 1 | `paletteStops` sends every `palette.chroma !== 100` through the damper. It renders the ramp at chroma 100, then scales each stop's CAM16 C by `r = g/100` at the same tone and hue. | `src/engine/tonal.js` at c161f252, line 948: `if (palette.chroma !== 100) return dampStops(paletteStops({ ...palette, chroma: 100 }, ...), groupDamper(palette.chroma), ...)` |
| 2 | So `evenChroma` (the floor, the code #766's `floorRefAt(baseHue, ...)` sits in) only runs at chroma 100. A grid cell at chroma g is the chroma-100 ramp times g/100. | Same line. The owner accepted this explicitly: plan `pane-context.md` lines 69 and 70 ("on the even path it differs from today below 100 wherever the floor bound, which R98 accepts as the price of one law") |
| 3 | Uniform scaling shrinks every dip's depth by r. The predicate is absolute (3 C below both neighbours), so a dip survives at g only if its chroma-100 depth is at least 300/g. | Head, control engine (a): max dip depth at c60 is `2.172`, and at c100 it is `3.62`. 3.62 x 0.6 = 2.172 exactly |
| 4 | With the rotation-following reference put back, the chroma-100 render has 8 dips, max depth 3.62. Scaled to g ≤ 60 the deepest is ≤ 2.17 C, so the grid sees 0. | `probe-mech.mjs` (below): head `c100 control 8 dips (max depth 3.62)`, `c30/45/60 control 0 dips (max depth 2.172)` |
| 5 | On main, chroma 30/45/60 reached `evenChroma` directly. There `intended` is low, the floor binds over the ramp ends, and the rotated reference opens dips. That is the regime (a) was built on. | main `c30/45/60 control 32 dips (max depth 4.57)` |
| 6 | The chroma-100 render is byte-identical on main and head, as R95 requires. | main and head both `c100 control 8 / real 0`. (b2) at chroma 100 gives `control 16 / real 6` on both |

Why it got through: U2's own C2.6 ran `even-dips` on a base without #766's grid, and the grid only appeared with the `19ce51c4` integration merge. The integrate question lists no `gate:sweeps` rerun.

## The four questions

| Question | Answer |
|---|---|
| What does control (a) assume? | Two things. First, that `palette.chroma` 30/45/60 scales `intended` inside `evenChroma`, so the floor binds widely at the ramp ends. Second, that the reference hue it swaps (`baseHue` for the rotated `hue`) is read at the chroma the grid names. Both stopped holding at #785: every g < 100 renders at 100, where the floor binds only at the extreme ends, and is then scaled. |
| Why does the damper remove the dips? | It does not remove a mechanism. It shrinks every chroma-100 dip by g/100 (step 3), and the deepest rotated-reference dip at 100 is 3.62 C, under the 3 C threshold at any g ≤ 82. The chroma-100 cell, the only undamped value, is missing from the grid. |
| Control or damper? | The control. The damper's placement after the floor is ruled (R94, R98, plan lines 63, 69, 70; "no per-mode, per-palette or floor exception"). A control derived on the pre-damper engine carries a stale assumption about where `palette.chroma` enters. |
| Is the main-path measurement still correct? | Partly. The (a) real line and the (b2) real line are blind at head: put the mechanism back in the REAL engine and (a) still reads 0, because that is what control (a) computes. (b1) is fine: the kit's 16 palettes resolve to g = 100 at head, so they are undamped (control 8). The corpus line is fine: all 3,764 corpus palettes resolve to g = 100 at head (`probe-corpus.mjs`: `damped (g<100) 0`), and the pre-#701 control still bites (124). |

### Every line at head, run without the early exit (`probe-all.mjs`)

| Line | main control / real | head control / real | State at head |
|---|---|---|---|
| (a) gate path grid | 32 / 0 | 0 / 0 | 🔴 control blind |
| (b1) kit anchors ±60 | 8 / 0 | 8 / 0 | 🟢 |
| (b2) random anchored, pin 7 | 13 / 5 | 3 / 1 | 🔴 control blind (3 ≤ 7), hidden behind (a)'s exit |
| pre-#701 floor 1.6x | 120 | 124 | 🟢 |
| corpus gate path | 0 | 0 | 🟢 |

## Fix options

| Option | What | R98 | Cost | Verdict |
|---|---|---|---|---|
| A. Damper change | Apply r before `evenChroma` (on `intended`), so a low g reaches the floor again | 🔴 Violates R98 and plan line 69: it needs a floor exception (`min(F, intended)` returns F at r = 1 and r = 0.5), so it reopens U2, its owner-accepted cells and the chroma-envelope fixture | Re-plan U2 plus an owner question | Rejected |
| B. Control-only change | Pick some other patch that happens to make (a) > 0 at chroma 30/45/60 | 🔴 The real line stays blind to the guarded mechanism (step 4). The control would bite on a proxy, not on #766's rule | Small, but it leaves a vacuous gate | Rejected |
| C. Gate re-derivation (recommended) | (a): chroma axis `[30, 45, 60, 100]`. 100 is the only undamped render, and it bounds every g, since a dip at g needs depth ≥ 300/g at 100. 30/45/60 stay as damper-composition cells. (b2): render at chroma 100 and keep consuming the chroma draw so later draws do not move. `RANDOM_PIN` re-read by its own R87 rule (this block's count on merge-base `8428280e`) = 8 | 🟢 No engine change, no special case. The gate measures the law that ships | One gate script plus three record lines. Runtime at head 44 s vs 57 s for main's current gate (load ~7, not timing rows). (b2) no longer samples damped anchored ramps; in the seed the drawn-chroma dip set (1) is a subset of the chroma-100 set (6, #934@200 in both) | Recommended |
| C'. As C, but (b2) at both drawn and 100 | Keep the drawn-chroma population too | 🟢 | About +10 to 15 s of CI. It measures the damper's own trades, which the gate does not own | Not needed |

### Option C measured (scratch copies, `gate-rederived.mjs` = c161f252's gate plus the two edits, pin still 7 in these runs)

| Run | Output | rc |
|---|---|---|
| head c161f252 | (a) control `8 dips (want > 0)`, real `0 dips (... 2304 palettes ...)`. (b1) `8` / `0`. (b2) control `16 dips (want > 7 ...)`, real `6 dips in 4 palettes`. pre-#701 `124`. corpus `0`. `PASS` | 0 |
| main 21f50901 | (a) `40` / `0`. (b1) `8` / `0`. (b2) `16` / `6 dips in 4 palettes`. pre-#701 `120`. corpus `0`. `PASS` | 0 |
| NC-a: head REAL engine with the rotation-following reference put back (`floorRefAt(hue, ...) /* <GRID_TARGET> */`) | (a) real `8 dips` → `FAIL` | 1 |
| NC-b: head REAL engine with `chromaAt(hue) /* chromaAt(hue, resolvedHue) */` | (b1) real `8 dips`, (b2) real `16 dips in 9 palettes` → `FAIL` | 1 |
| NC-axis: c161f252's unedited gate on head (axis 30/45/60, drawn chroma) | control (a) `0 dips`, and (b2) control `3` | 1 |
| Pin read: `8428280e` engine as REAL, the (b2) block at chroma 100 | `real 8 dips in 5 palettes`. The same recipe with the drawn chroma prints `7 dips in 4 palettes`, the committed pin, so the recipe reproduces history | n/a |

With `RANDOM_PIN = 8`: control 16 > 8 bites, head real 6 ≤ 8 passes, and NC-b's real 16 > 8 fails.

## Recommendation: U4 pass 2, size S, builder-l3

Why pass 2 and not U5: the red is carried by U4's own integration merge `19ce51c4`, which U4 made under the integrate question. A U5 off `plan/pane-context` would not have #766's grid at all, so it would have to stack on `unit/pc-U4`, which cannot merge while it is 🔴. Pass 2 puts the fix in the commit range that introduced the red. The lead may fold the verdict's 🟡 rows (C4.3 tokens-table row, integrate-question record, spec-draft:176) into the same pass. They are independent of this fix.

Lane adds: `test/engine/even-dips-gate.mjs`, `docs/reference/references/decision-records.md` (appended amendment only), `.claude/skills/color-math/references/foundations.md`, `.sdlc/questions/pane-context-integrate.md` (an even-dips row). No `src/` change.

Builder grade: l3 (sonnet, high). The edit is fully specified above. The only judgment is the pin read on `8428280e`. Checker: reviewer-l3, verifier-l2 (R86).

### Criteria

| # | Check (commands) | Expect | Negative control |
|---|---|---|---|
| C4.14 | `unset NODE_OPTIONS; FORCE_COLOR=0 node test/engine/even-dips-gate.mjs --full` on a `git archive` of the head | rc 0. Lines in order: control (a) `8 dips (want > 0)`, (a) `0 dips (... 2304 palettes ...)`, (b1) `8` / `0`, (b2) control `16 dips (want > 8 ...)`, (b2) `6 dips in 4 palettes (... bound 8 ...)`, pre-#701 `124`, corpus `0`, `PASS` | NC-a and NC-b (above) on a scratch copy of the head's `src/engine/tonal.js`: each rc 1 with the named real line non-zero. c161f252's gate on the head engine: rc 1, `DID NOT bite` on (a) |
| C4.15 | `grep -c 'for (const chroma of \[30, 45, 60, 100\])' test/engine/even-dips-gate.mjs`; `grep -c 'chroma: rnd() \* 100' test/engine/even-dips-gate.mjs`; `grep -c 'const RANDOM_PIN = 8;' test/engine/even-dips-gate.mjs` | `1`, `0`, `1`. The (b2) draw sequence is unchanged: the chroma draw is still consumed in its slot | The draw-order check: dropping the consumed chroma draw in a scratch copy (`head/test/engine/gate-nodraw.mjs`, measured) moves the set. The (b2) real line names `#102` and `#324` (3 dips in 2 palettes) instead of `#317`, `#346`, `#781`, `#934`, and its control reads 13 |
| C4.16 | Pin provenance: the handoff carries the `8428280e` recipe (import that tree's `src/engine/tonal.js` as REAL, run the (b2) block) and its output | `8 dips in 5 palettes` at chroma 100. The same recipe with the drawn chroma gives `7 dips in 4 palettes` (the old pin) | The drawn-chroma row is the control: if the recipe does not reproduce 7, it is not the R87 recipe |
| C4.17 | The re-derived gate on a `git archive` of `origin/main` | rc 0, control (a) `40`, (b2) control `16` / real `6`: the re-derivation does not depend on the damper being present | n/a (both directions are covered by C4.14 and this row) |
| C4.18 | The gate header (lines 33 to 56) states: the axis 30/45/60/100 and why 100 (since #785 `palette.chroma` reaches `evenChroma` only at 100; a dip at g needs a chroma-100 depth ≥ 300/g), (b2) at chroma 100 with the draw kept, and the pin 8 with its sha. `grep -c '(7 dip cells)' .claude/skills/color-math/references/foundations.md` → `0`. An appended `Amendment (2026-10-03, #785, #766)` line under ADR-026 states the grid's chroma-100 cell and the (b2) pin 8 (the #766 amendment's "pinned count of 7" stays, append-only). The integrate question gains an even-dips row | `0` stale pin mentions outside history files; amendment grep `1` | Grep `RANDOM_PIN = 7\|count of 7\|(7 dip cells)` across `test/ docs/reference .claude/skills`: only the appended-amendment history line keeps 7 |
| C4.19 | `npm test` and `node test/repo/em-dash.mjs`, then `git status --porcelain` | `✓ all 54 test files passed`, rc 0, porcelain empty | The verdict's C4.13 control (`"scrim` → `"scrimX`) still reds |

## Owner question

None needed. The damper placement and its effect on the even floor below 100 are ruled (R94, R98, plan lines 69 and 70). The (b2) bound follows R87's ruled rule (the merge-base count of the block), so 7 → 8 applies that rule to a changed population. It is not a new tolerance; at the new population the head reads 6. If the lead wants a human sign-off on the pin number, it is a one-line confirm, not an options question.

Optional record note (🟡, not blocking): `docs/reference/references/glossary.md` `chromaFloor` and the `evenChroma` header in `src/engine/tonal.js` ("it only rescues the LOW-chroma ramps") predate #785. A low group value no longer reaches the floor. The plan records this, but those two do not.

## Probes (all under `/Users/kimba/.claude/jobs/8c58a81c/tmp/pc-U4-plan/`)

| File | What |
|---|---|
| `main/`, `head/`, `mb/` | `git archive` of 21f50901, c161f252, 8428280e |
| `main-gate.out`, `head-gate.out` | The gate as committed: main rc 0, head rc 1 |
| `head-all.out`, `probe-all.mjs` (in `head/test/engine/`) | Every line at head with the early exit removed |
| `probe-mech.mjs`, `mech-main.out`, `mech-head.out` | Control vs real dips and max depth per chroma and floor regime |
| `probe-b2.mjs`, `probe-b2-real.mjs`, `b2-*.out` | (b2) at drawn vs chroma 100, on main, head and the merge-base |
| `gate-rederived.mjs` (in `main/` and `head/test/engine/`), `rederived-*.out`, `nc-a.out`, `nc-b2.out` | Option C and its negative controls |
| `head/test/engine/probe-corpus.mjs` | Corpus group values at head (all 100) |
