<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/plugin/ultimate-tokens/skills/geometry-tokens/scripts/dimension-parity.mjs: now checks against the 27 cells. The 14 fields come from `geomScale({}).cell`. The 13 roles are parsed from `geomResolverCSS` output, so there is no hand-written list. It also checks the container tier. Placeholder forms `--size-{tier}-{scale}-{size}-{field}` and `--size-{cell}-{field}` are accepted. Any `.control-*` class is an error because the engine emits no classes. A `## Migrating …` section is exempt, since it names retired tokens on purpose. The ladder-prototype branch and the `"default"` radius alias are gone.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/plugin/ultimate-tokens/skills/geometry-tokens/SKILL.md: rewritten to cover:
  - the four axes, where the nearest ancestor wins
  - the cell grammar
  - the 13 roles, which are never prefixed (a prefix renames only the cells and the container tier)
  - the glyph rules
  - a "Migrating from the step ramp" section with the legacy step-to-cell map. Retired knobs are described in words, not by name, so criterion 4 passes.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/plugin/ultimate-tokens/skills/geometry-tokens/references/controls.md: rewritten with the 27-cell height table, an example of setting the axes, a role table, recipes, the radius modes, and when to use raw primitives.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/plugin/ultimate-tokens/skills/geometry-tokens/references/detail.md: rewritten to cover:
  - the icon box, with indicator = text size and gap = inset / 2
  - marks (checkbox, radio, switch) and captions
  - badges (height - inset, `--radius-inset`), tags and chips
  - hit targets, where an icon-only control is a height square
  - focus rings, borders, and the radius ladder vs the radius roles
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/plugin/ultimate-tokens/skills/geometry-tokens/references/responsive.md: rewritten. Breakpoints flip only `--ctx-scale-*`. The standard set's widths were checked against `geomTokensBreakpointCSS` output. Text now comes from the UI text table.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/plugin/ultimate-tokens/skills/geometry-tokens/references/containers.md: three lines changed. Removed "treatment-derived" and the `padding-narrow` reference.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/test/smoke/smoke.mjs: imports the engine and adds a resolver block after the Geometry modes check.
  - It loads `geomTokensCSS(geomScale({}))` into an iframe and renders 108 cases (27 cells x 4 radius modes) in Maison's nesting: tier + decoy `data-size="lg"` + radius, then scale, then size.
  - Each role is read through the property that uses it (`height`, `border-top-left-radius`) and compared to `geomScale({ radius }).cells[cell]` within 0.01px.
  - The `.geom-ctl` 18 to 80 px check is unchanged.

## Checks
- c1 `grep -qF 'data-radius' test/smoke/smoke.mjs && grep -qF -- '--radius-control' test/smoke/smoke.mjs`: exit 0
- c2 (guard) `node --check test/smoke/smoke.mjs`: exit 0
- c3 `grep -qF -- '--control-height' plugin/ultimate-tokens/skills/geometry-tokens/SKILL.md`: exit 0
- c4 `! grep -rqE -- '--size-[a-z0-9-]+-(caret|gap|padding-wide)' … && ! grep -rqE 'rampContrast|linear4|baseHeight|RAMP_LADDER' …`: exit 0
- c5 `node test/plugin/geometry-tokens.mjs`: PASS ("27 cells x 14 fields, 13 roles"). It was red at the start of this step (TypeError on `s.sizes`).
- Negative control for the parity gate: run against the old docs, the new script failed on `--size-md-icon`, `--size-{step}-*` and `.control-{step}`.
- `npm run smoke`, run locally with Chrome Canary (it rebuilds first): SMOKE PASS, including "geometry.css resolver: all 108 nested cases … resolve --control-height and --radius-control to the engine's cell values".
- Negative control for the resolver probe, a scratch script in the scratchpad (not in the tree) with the same probe in Canary:
  - as shipped: 0 of 108 off
  - inner `data-size` removed, so the decoy wins: 72 of 108 off
  - `data-radius` removed: 73 of 108 off
- `npm test`: 53 of 54 files pass; `plugin/geometry-tokens.mjs` passes. The one red is `repo/citations.mjs` (9 failures). Run at base `0da75c3c` in a throwaway worktree, it also exits 1, and its `✗` lines are identical. That red is inherited, and none of the failing citations point at files this step touched.

## Notes
- The handoff said this runtime check could only run in CI. It also ran locally, because Chrome Canary, `node_modules` and `dist/` are present.
- `npm run build` and `npm test` both rewrite `figma/plugin/ui.html`: 4318860 to 4295779 bytes, with no source change from this step. The committed bundle is already stale at base. I restored it both times with `git checkout`, so the tree only holds this step's 7 files.
- The header comment in `test/plugin/geometry-tokens.mjs` still says ".control-* class it names must match". That file is outside this step's scope and was left untouched.
- The `repo/citations.mjs` red at base includes `.claude/skills/geometry-system/SKILL.md:107` (`buildSizeLadder`) and `.claude/skills/building-editor-sections/SKILL.md:80` (`setGeomTokenOverride`). Both are stale geometry records for a later records step.
