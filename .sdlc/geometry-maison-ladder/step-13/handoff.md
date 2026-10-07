## Task goal
Rebuild the Geometry system of ultimate-tokens on the Maison ui-kit geometry system (user decision 2026-10-07: "for the Geometry system, let's use the maison ui-kit system... we should name tokens according to our standards of course, but this is a standard system to follow for now"). Geometry's per-step text size still composes from the Type UI scale (project invariant).

## Step 13: Records: ADR, skills and docs
level: L3
### Read first
- `docs/references/AGENTS.md`
- `docs/references/typography/AGENTS.md`
### Do
Depends on: steps 1 to 12 (the records cite the final names).
- `docs/references/decision-records.md`: add `## ADR-032: Geometry adopts the Maison ui-kit ladder`. On main the last ADR is ADR-030 (`:967`, T-0014) and T-0015 adds ADR-031 on its branch, so this is ADR-032; if another lane has taken 032 by build time, use the next free number (the checks grep the title, not the number). Place it after the last ADR and before `## Quick map` (`:1023` on main). It records the decision, the user decisions of 2026-10-07 (option B on U1, shell rides with the engine, retirements, `--control-*` names, schema v9 after T-0014's v8) and the Maison-to-ours name map:
  - `--g-height/-inset/-text/-icon/-caption-text/-icon-height-ratio` to `--control-height/-inset/-text/-icon/-caption-text/-icon-ratio`; `--g-chip-height/-inset/-text` to `--chip-*`; `--r-control/-mark/-inset/-card` to `--radius-*`; `--m-cell-*`, `--m-scale-*`, `--m-size-*`, `--r-k-text/-height` to `--ctx-cell-*`, `--ctx-scale-*`, `--ctx-size-*`, `--ctx-radius-text/-height`.
  - The prefix contract (an export prefix renames primitives and container ladders, never roles or `--ctx-*`), `--g-micro-*` scoped out, attribute names and radius ids kept verbatim, the Figma `control/` per-mode ALIAS variables, and that ladder cells have no pre-ADR-016 kebab-wave name (`kebabWaveOldName` returns null for them; `OLD_FIELD` stays frozen).
- Repair to the new system in the same change: `.claude/skills/geometry-system/` (SKILL.md and references); `.claude/skills/type-scale/` (the UI text table, the one-step UI voices, and `references/best-practices.md:77`'s 51-step count, now 41); `.claude/skills/building-editor-sections/` (the shell axes and the `--sh-*` aliases); `.claude/skills/maintaining-brand-kit-mcp/` (the `get_geometry` shape); `.claude/skills/maintaining-figma-plugins/` (the cell variables, `control/` aliases, `geometryCellOrder` and the legacy height table); `docs/references/geometry/README.md`; `docs/references/typography/README.md` (`:52`'s 51 steps, now 41, and the UI voices) and `intended-use.md`; `mcp/README.md`.
- No mention of `baseHeight`, `rampContrast`, `linear4`, `CONTROL_FONT` or `GAP_UNIT` survives in those files, except as history inside the ADR.
- The untagged test run below is not a guard: it must be green after this step.
### Acceptance criteria
- (red) `grep -qF 'Geometry adopts the Maison ui-kit ladder' docs/references/decision-records.md && grep -qF -- '--g-chip-height' docs/references/decision-records.md`
- (red) `awk '/Geometry adopts the Maison ui-kit ladder/{if(!a)a=NR} /^## Quick map/{q=NR} END{exit !(a && q && a < q)}' docs/references/decision-records.md`
- (red) `! grep -rqE 'baseHeight|rampContrast|linear4|CONTROL_FONT|GAP_UNIT' .claude/skills/geometry-system docs/references/geometry/README.md mcp/README.md`
- (red) `grep -rqF 'uiText' .claude/skills/type-scale && ! grep -rqF '51 steps' .claude/skills/type-scale docs/references/typography`
- (red) `grep -rqF 'data-tier' .claude/skills/building-editor-sections`
- `node test/repo/citations.mjs`
