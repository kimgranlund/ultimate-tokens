## Task goal
Rebuild the Geometry system of ultimate-tokens on the Maison ui-kit geometry system (user decision 2026-10-07: "for the Geometry system, let's use the maison ui-kit system... we should name tokens according to our standards of course, but this is a standard system to follow for now"). Geometry's per-step text size still composes from the Type UI scale (project invariant).

## Step 12: Consumer parity and real-browser resolver cases
level: L3
### Do
Depends on: steps 2 and 7.
- `plugin/ultimate-tokens/skills/geometry-tokens/` (SKILL.md and references, `references/detail.md` included) teaches, per the architect Glyphs section:
  - The axes `data-tier`, `data-scale`, `data-size` and `data-radius`, nearest ancestor wins; the cell primitives `--size-{tier}-{scale}-{size}-{field}`; the roles `--control-height/-inset/-text/-icon/-caption-text/-icon-ratio`, `--chip-height/-inset/-text` and `--radius-control/-mark/-inset/-card`, which an export prefix never renames (step 2 prefix contract).
  - The glyph rules: an indicator is text-sized inside the icon box; the icon-to-label gap is inset / 2; badge height is height - inset, with `--radius-inset`; an icon-only control is a height square.
  - That the `--size-{step}-caret/-gap/-padding-*` tokens, the `.control-{step}` classes, `rampContrast`, `linear4` and `baseHeight` are gone, with a migration note. Today they appear in `SKILL.md`, `references/responsive.md` and `scripts/dimension-parity.mjs` (`git grep -lE 'rampContrast|RAMP_LADDER|baseHeight' -- plugin` lists all three).
- `scripts/dimension-parity.mjs` (in that skill) re-targets the 27 cells and the roles against the engine. `test/plugin/geometry-tokens.mjs` stays its runner.
- `test/smoke/smoke.mjs`: add a resolver block that loads `geomTokensCSS(geomScale({}))` into a page and renders the 108 nested cases, 27 cells x 4 radius modes, in Maison's spec shape (`tests/first-wave-foundation.spec.js:60`), asserting that `getComputedStyle` of `--control-height` and `--radius-control` equals the engine's cell values. The `.geom-ctl` box check at `:253` keeps its 18 to 80 px window (the first light-column cell is content-sm-sm, 28px). This runs only in CI (`build-test`); locally only syntax is checked, so this step does not prove the runtime behavior.
- The untagged test run below is not a guard: it is red at this step's start by design and must be green after it.
### Acceptance criteria
- (red) `grep -qF 'data-radius' test/smoke/smoke.mjs && grep -qF -- '--radius-control' test/smoke/smoke.mjs`
- (guard) `node --check test/smoke/smoke.mjs`
- (red) `grep -qF -- '--control-height' plugin/ultimate-tokens/skills/geometry-tokens/SKILL.md`
- (red) `! grep -rqE -- '--size-[a-z0-9-]+-(caret|gap|padding-wide)' plugin/ultimate-tokens/skills/geometry-tokens && ! grep -rqE 'rampContrast|linear4|baseHeight|RAMP_LADDER' plugin/ultimate-tokens/skills/geometry-tokens`
- `node test/plugin/geometry-tokens.mjs`
