## Rubric: a geometry-engine change

Scores a change to `src/engine/geometry.mjs` (and the composition join in `src/ui/model.mjs`). `[gate]` =
mechanically checkable (a `test/engine/geometry.mjs` group / `npm test`); `[review]` = judgment with cited
evidence. The verifier prints one summary PASS line; the group names below label its comment-delineated
blocks. Score each 1–5.

| # | Dimension | Type | What it checks | 1 (fail) → 3 (adequate) → 5 (excellent) |
|---|---|---|---|---|
| G1 | The Maison ladder | [gate] | all 27 cells deep-equal the vendored fixture's rows and resolver cells; an off-table height or unknown axis id throws `RangeError`; unknown config falls back to `DEFAULT_GEOMETRY` (`maison-ladder`) | 1: a cell drifts from the fixture or an off-table height resolves · 3: 27 cells match · 5: + a Maison re-vendor carries its commit and sha256 |
| G2 | The centering law | [gate] | `inset === (height − icon) / 2` on all 27 cells and all 25 ladder rows (`anatomy`) | 1: any cell breaks it, or `padding-block` is used to center · 3: holds on the cells · 5: holds on every row |
| G3 | Radius modes | [gate] | 27 cells × 4 modes = 108 radius sets match Maison's k table (`radius-modes`) | 1: a mode drifts · 3: control radius right · 5: mark, inset and card right too |
| G4 | The composition | [gate] | cell text reads `typeScale.uiText[height]`; the frame is unchanged with or without a type scale; UI-control MD equals product-md-md text | 1: geometry owns a text row again, or type moves the frame · 3: text follows type · 5: + the join passes the base type scale at every mode |
| G5 | The resolver and the prefix contract | [gate] | the CSS carries `[data-tier]`, `[data-scale]`, `[data-size]`, `[data-radius]` and the roles; under a prefix the primitives are prefixed and no role or `--ctx-*` is (`emitters`); the smoke resolver cases (CI) read the engine values back | 1: a role is prefixed or an attribute is missing · 3: local gate green · 5: + CI smoke green on the 108 cases |
| G6 | Emitter parity | [gate] | CSS, DTCG, Figma and Figma modes carry all 16 fields from `CELL_FIELDS`; `icon-ratio` unitless; 432 `size/` FLOATs and 144 `control/` ALIASes at one mode; the interchange validates (`test/figma/mode-apply.mjs`) | 1: a field missing from an emitter, or an ALIAS pointing at an ALIAS · 3: all emitters agree · 5: + the consumer skill and Figma field map moved in the same change |
| G7 | Engine discipline | [review] | the change edits the owning file; the container tier stays byte-identical at spaceBase 4 (`container-identity`); a doc-shape change bumps the persist schema with a migration; pure (no DOM/RNG/clock) | 1: a hand-tuned cell, an unmigrated doc-shape change, or impurity · 3: right file, pure · 5: + surgical, records repaired in the same change |

**Gate to ship:** G1, G2, G4 and G5 must each score ≥ 3, `node test/engine/geometry.mjs` green AND
`npm test` green.

**Top failure to look for first:** a role or `--ctx-*` name that picked up the export prefix (G5). It
passes every test that reads the unprefixed default and silently breaks every prefixed consumer, because
Maison's control CSS reads the roles bare. Check the resolver under `{ prefix: "md" }` before calling it
done.
