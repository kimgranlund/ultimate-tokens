PASS
R98: none found. The unit adds no override, alias, legacy layer or special case. The diff from base to head has 0 non-comment lines under `test/` and `src/`, and `src/` is untouched. The (b2) bound of 7 is the count R87 ruled, not an exception.

# floorref-hue U3 re-review · unit/fh-U3 @ 12f6b353 · base plan/floorref-hue 04a36e9b

This pass checks the rework commit 12f6b353 against the four findings from the review at 084e6510, then sweeps the whole tree for the "non-increasing floor" claim class.

## Prior findings

| # | State | Evidence |
|---|---|---|
| 1 stale non-increasing claims in the two gate files | 🟢 fixed | `test/engine/tonal.mjs:1756-1759` and `test/engine/even-dips-gate.mjs:26-30` now limit the structural claim to stops that read one hue. They date the 1.6x zero to #701 and call the anchored OKLCH rendered zero a measurement (#766). Both match `src/engine/tonal.js:329-334` and the `dip-gate-even` header (`tonal.mjs:1609-1613`) |
| 2 glossary caveat | 🟢 fixed | The `glossary.md:22` `chromaFloor` row now says: "on the anchored OKLCH path each stop reads its own solved hue, so there the floor can rise outward of 450/550 and no-dip is a measurement of `npm run gate:even-dips`, #766" |
| 3 ADR cause order | 🟢 fixed | In the `decision-records.md` amendment, the anchored OKLCH per-stop sentence and its gate clause come first. The R87 trade (16 removed, 4 opened) follows as "The measured trade is declared". The figures did not change and still match the U2 verdict |
| 4 pre-land items | ⚪ Orchestrator's | The PR body still needs the pre-land verdict table (`.sdlc/adapter.md:100`). The CHANGELOG date and PR number are set at land |

## Re-run at 12f6b353

| Check | State | Evidence |
|---|---|---|
| Engine untouched, test diff comment-only | 🟢 | `git diff --name-only 04a36e9b HEAD -- src` is empty. The stripped non-comment count under `test/ src/` is 0. `node --check` passes on `tonal.mjs` and `even-dips-gate.mjs` |
| C2.14 grep (C3.5) | 🟢 | prints nothing, rc 1 |
| Hygiene | 🟢 | `em-dash: clean (1120)`, `branding: clean (1112)`, `citations` STALE 0 (HEAD 12f6b353), `doc-mutation-lane: clean`, `ceiling-counts: clean`, tree clean |
| C3.1 to C3.6 | 🟢 | Unchanged from the first pass; the rework touches only the three fixed spots |

## Tree sweep for the claim class

Command: `git grep -n -i -E "non-increasing|never rises|cannot rise|does not rise|holds flat|cannot open a dip|no off-anchor dip can|floor never|never rise past"`, run outside `.sdlc/{verdicts,reviews,handoffs,plans,questions}`.

Hits about tone or luminance monotonicity are out of class: `tonal.js:528/616/755/1084`, `anchor.mjs`, `categories.mjs`, `exports.mjs`, `spec-panda-park-ui-exports.md`, `rubric.md` C3, SKILL.md:96. So are hits about the saturated case where "the floor never binds" (`tonal.js:318/1024`, `tonal.mjs:360`, `best-practices.md:80`, `foundations.md:142`). The floor-reference hits:

| Hit | State |
|---|---|
| `src/engine/tonal.js:325, 330` | 🟢 The authority: "where every stop reads one hue and nothing rotates, the floor cannot rise past 450/550", with the anchored OKLCH and rotation exceptions |
| `test/engine/tonal.mjs:664` | 🟢 A #701 revision-14 re-pin note, explicitly historical |
| `test/engine/tonal.mjs:1609` | 🟢 Qualified for both one-hue and rotation |
| `foundations.md:148, 158-161` | 🟢 "holds flat" carries the anchored OKLCH caveat. Lines 158-161 call the no-dip claim a measurement and describe the gate lines |
| `glossary.md:22` | 🟢 Caveated (finding 2) |
| `SKILL.md:87`, `tonal.mjs:1756`, `even-dips-gate.mjs:26` | 🟡 see N1 |

## Non-blocking

N1. 🟡 Three spots qualify the structural claim by "every stop reads one hue" but leave out the engine header's "and nothing rotates" (`tonal.js:330`):
- `.claude/skills/color-math/SKILL.md:87`
- `test/engine/tonal.mjs:1756`, which labels the case "(the gate path, anchored cam16)"
- `test/engine/even-dips-gate.mjs:26`, which labels it "(the gate path)"

On a rotated gate-path palette, `floorRef` reads `baseHue` but `maxc` is read at the rotated hue. So `min(maxc, floorRef)` is not structurally non-increasing there. Grid line (a) and the corpus line measure it at 0.

This imprecision predates #766: the same premise held before the change, and the old text did not qualify it at all. The reworded text is strictly more accurate than before, and the guarantee is gated, so this does not block. If the Orchestrator wants the records exactly aligned with the engine header before pre-land, the fix is to insert "and nothing rotates" after "one hue" in those three places. It is a comment-only, one-phrase edit.

N2. 🟢 Housekeeping. The handoff's Files row does not list `test/engine/even-dips-gate.mjs`, which the rework touched; the rework table names it. One ADR amendment line (`decision-records.md`, the "...`hueShift` 39 and 49). `evenChroma`'s body and signature are" line) runs past the file's wrap width. That is cosmetic, and no gate checks it.

I did not re-run `npm test`. The rework is comment and prose only (stripped diff 0, syntax checks pass), and the builder reports `✓ all 54 test files passed` after the rework.
