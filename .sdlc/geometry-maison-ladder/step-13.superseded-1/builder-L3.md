<!-- role=builder level=L3 model=opus effort=high -->
## Status
blocked

## Changes
- `docs/references/decision-records.md`: added `## ADR-032: Geometry adopts the Maison ui-kit ladder` after ADR-031 and before `## Quick map`. It covers the decision, the five user rulings of 2026-10-07, the Maison-to-ours name map (including `--g-chip-height`), the prefix contract, `--g-micro-*` scoped out, the attribute names and radius ids kept verbatim, the Figma `control/` ALIAS variables, and `kebabWaveOldName` returning null for cells. Also added one ADR-032 row to the Quick map.
- `.claude/skills/geometry-system/SKILL.md`: rewritten for the Maison ladder (axes, law, cell fields, resolver, prefix contract, `uiText` composition, export map, procedure, gates).
- `.claude/skills/geometry-system/references/foundations.md`: rewritten (pipeline, axes and heights table, cell rules, UI text table, resolver, container tier, emitters, v9 migration).
- `.claude/skills/geometry-system/references/best-practices.md`: rewritten.
- `.claude/skills/geometry-system/references/rubric.md`: rewritten (G1 to G7 on the ladder, anatomy, radius modes, composition, resolver/prefix, emitters, discipline).
- `.claude/skills/type-scale/SKILL.md`: `stepsFor`/`UI_TEXT`/`uiText` replace `ranksFor` and the XS..2XL rows; one-step UI voices; count text now reads 41 steps.
- `.claude/skills/type-scale/references/foundations.md`: one-step UI voices, plus a new UI text table bullet (`UI_TEXT`, `uiText`).
- `.claude/skills/type-scale/references/best-practices.md`: 51 changed to 41 steps (`TYPE_STEPS`); history lines now note the T-0017 retirement.
- `.claude/skills/building-editor-sections/SKILL.md`: composition line, `doc.geometry` fields, Tokens matrix now Typography-only (Geometry table is read-only), `setGeomTokenOverride` cite removed. New section on the shell's host axes (`data-tier`/`data-scale`/`data-radius`/`data-size`), the `ut-geometry-roles` head style, the `--sh-*` aliases and the `(shg1)` to `(shg4)` groups.
- `.claude/skills/building-editor-sections/references/best-practices.md`: doc fields line, plus a T-0017 history note on the Geometry walkthrough.
- `.claude/skills/building-editor-sections/references/foundations.md`: the composition now goes through `geomScaleFor` and `uiText`.
- `.claude/skills/building-editor-sections/references/rubric.md`: S3 now reads cell `text` from Type `uiText`.
- `.claude/skills/maintaining-brand-kit-mcp/SKILL.md`: `get_geometry` shape is now `cells`/`cell`/14 fields; the test notes and composition check are updated.
- `.claude/skills/maintaining-brand-kit-mcp/references/foundations.md`: kit geometry shape, the one-MD-step UI voices plus `uiText`, and the composition facts.
- `.claude/skills/maintaining-brand-kit-mcp/references/best-practices.md`: the served shape, the composition, and the centering law as `inset`.
- `.claude/skills/maintaining-figma-plugins/SKILL.md`: new Geometry cells paragraph covering:
  - the `size/` cell variables and `control/` per-mode ALIAS variables
  - the validator and how `applyFloatPlans` writes the aliases
  - `geometrySizeAliasMap` with the `geometryCellOrder` tiebreak
  - the legacy height table
  - `GEOMETRY_FIELD_RENAME_MAP`, `geometryCellOrderVM`, and the frozen `OLD_FIELD`
- `.claude/skills/maintaining-figma-plugins/references/foundations.md`: `geomTokensFigma` shape and the `geomTokensFigmaModes` apply path.
- `docs/references/geometry/README.md`: rewritten (ladder, law, per-cell fields, DTCG structure, CSS resolver and roles, composition, Figma variables, mechanization).
- `docs/references/typography/README.md`: 51 steps changed to 41; UI-control and UI-widget now one MD step from `UI_TEXT`.
- `docs/references/typography/intended-use.md`: UI-control and UI-widget rows rewritten.
- `mcp/README.md`: `get_geometry` row and `apply_brand` prompt line now describe the ladder cells.

## Checks
- (red) `grep -qF 'Geometry adopts the Maison ui-kit ladder' docs/references/decision-records.md && grep -qF -- '--g-chip-height' docs/references/decision-records.md`: exit 0.
- (red) `awk '/Geometry adopts the Maison ui-kit ladder/{if(!a)a=NR} /^## Quick map/{q=NR} END{exit !(a && q && a < q)}' docs/references/decision-records.md`: exit 0.
- (red) `! grep -rqE 'baseHeight|rampContrast|linear4|CONTROL_FONT|GAP_UNIT' .claude/skills/geometry-system docs/references/geometry/README.md mcp/README.md`: exit 0.
- (red) `grep -rqF 'uiText' .claude/skills/type-scale && ! grep -rqF '51 steps' .claude/skills/type-scale docs/references/typography`: exit 0.
- (red) `grep -rqF 'data-tier' .claude/skills/building-editor-sections`: exit 0.
- Do rule over the remaining listed files: `grep -rnE 'baseHeight|rampContrast|linear4|CONTROL_FONT|GAP_UNIT' .claude/skills/type-scale .claude/skills/building-editor-sections .claude/skills/maintaining-brand-kit-mcp .claude/skills/maintaining-figma-plugins docs/references/typography mcp/README.md` printed no hits.
- `node test/repo/citations.mjs` in this tree: FAIL, 7 failures. `symbol homes: 44 checked, 0 stale`; fact pins and count phrases pass. The failing docs are all out of scope:
  - `docs/references/component-inventory.md` (24 lines)
  - `docs/reports/2026-08-20-reactivity/00-synthesis.md` (5)
  - `docs/reports/2026-08-20-reactivity/01-core-reactivity.md` (5)
  - `docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md` (13)
  - `docs/reports/2026-08-20-reactivity/03-stores-and-persistence.md` (6)
  - `docs/reports/2026-08-20-reactivity/04-context-and-messaging.md` (13)
  - `docs/specs/app-shell.md` (17)
- `node test/repo/citations.mjs` at base `9c7a2ee8` in a throwaway detached worktree (`.worktrees/tmp/builder-L3-geometry-maison-ladder-s13/base`, removed afterwards): FAIL, 9 failures, `symbol homes: 37 checked, 2 stale`. The same 7 docs with the same line lists, plus the 2 in-scope symbol-home failures this step fixed: `building-editor-sections/SKILL.md:80` `setGeomTokenOverride` and `geometry-system/SKILL.md:107` `buildSizeLadder`.
- `node test/repo/em-dash.mjs`: clean (1486 files).
- `node test/repo/branding.mjs`, `doc-mutation-lane.mjs`, `gate-report.mjs`, `svg-rules.mjs`, `verdict-frontmatter.mjs`: all pass.

## Notes
plan defect: `node test/repo/citations.mjs` cannot be green from this step. Seven docs the step does not name are red at base `9c7a2ee8` with identical failures (about 83 STALE lines): `docs/references/component-inventory.md`, `docs/specs/app-shell.md` and the five `docs/reports/2026-08-20-reactivity/*.md`. Steps 6 to 12 shifted lines in `src/ui/app.js`, `src/ui/styles.css` and `src/ui/overlays/settings.js`. Repairing them means touching files outside step 13's list (rule 1). Step 14's Do already owns "fix every red that steps 1 to 13 introduced", so the repair can fold into step 14.
- All work for this step is in the tree and uncommitted. Every red criterion passes. This step removed the two in-scope symbol-home failures and added no new citation failure (HEAD 7 failures against 9 at base).
- `mcp/README.md` is inlined into the committed `src/ui/mcp-assets.js` by `npm run gen:mcp-assets`. I did not run the generator (rule 6: it writes a file the step did not name), so `src/ui/mcp-assets.js` is stale until step 14's `npm test` regenerates it. No test checks it for staleness.
- decide: `docs/assets/geometry-tokens.json` is a hand-kept snapshot of the retired six-size ramp (XS..2XL keys, `caret`/`font`/`gap`), and no generator rewrites it. The geometry README now calls it a frozen pre-ADR-032 snapshot and names `geomTokensDTCG(geomScale({}))` as the live shape. Regenerating or retiring the asset is outside this step.
- In the type-scale skill I avoided bare "two voices" phrasing because the citations count-phrase pin (fifteen voices) scans that skill directory. "two interactive voices" is outside the scan's grammar and is fine.
