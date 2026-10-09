## Task goal
The editor shell is one standardized UI: a single text-role system, one inset and radius composition rule for every container, one anatomy table for every control, one glyph motion set, all derived from the Maison ladder cell, with the shell defaulting to the product tier, sm scale, md size.

## Step 11: The ADR, the shell roles reference page, the inventory cards and the skills
level: L2
### Read first
- `docs/references/AGENTS.md`
- `docs/references/geometry/AGENTS.md`
### Do
Depends on: step 10. Docs only; no source change.
1. Append the ADR to `docs/references/decision-records.md`, before `## Quick map`.
   - Number: the next free one after the highest `## ADR-NNN` heading at build time. It is ADR-036 today (ADR-035 is the last heading; ADR-034 is written in another worktree), unless T-0040 or another lane lands one first.
   - Heading: `## ADR-NNN: The editor shell's text roles, control anatomy, glyph motion and product-sm default cell`.
   - Content:
     - The role table: nine roles, the UI_TEXT row step, why JS and not calc.
     - The user's 2026-10-09 rulings: product-sm-md default; chips and segmented on `--ui-control`; `--ui-chip` renamed `--ui-badge`; badges and tags compact.
     - The anatomy and composition tables.
     - Motion tokens 120/180ms and one ease; reduced motion by the existing descendant rules.
     - The tri-state `shellGeometry`.
     - The gate and its allow-list.
     - Rejected: calc offsets, engine `CELL_FIELDS`, a `shellDefault` flag, per-role size vars, rotating the select chevron, gating layout gap and padding.
2. New `docs/references/geometry/shell-roles.md`, copying the tables from `src/ui/shell-roles.mjs`, with px at product-sm-md, product-md-md and content-lg-md:
   - `UI_ROLES` (role, var, step, weight, line-height, tracking, case, ink, covered selectors)
   - `CONTROL_ANATOMY`, including the interactive chip and badge rows and which uses are which (step 8's lists)
   - `CONTAINER_COMPOSITION`, with the law that container radius = part radius + padding
   - `MOTION`
   - the gate's allow-list with reasons
   Link it from `docs/references/geometry/README.md` and add `- [shell-roles.md](shell-roles.md)` to the index in `docs/references/geometry/AGENTS.md`.
3. `docs/references/component-inventory.md`: cards 1, 2, 3 and 5 (architect Interfaces) name `src/ui/shell-roles.mjs`, the `--ui-<role>-font` roles (`--ui-control-font` on buttons, inputs, selects and interactive chips), the badge row, the switch edge, the carets, and the product-sm default. Keep every existing cite valid.
4. `.claude/skills/geometry-system/SKILL.md`: a short section on the shell roles, naming `src/ui/shell-roles.mjs` and the row-step law. `.claude/skills/building-editor-sections/SKILL.md`: new shell text uses a `--ui-<role>-font` role, never a literal (the `test/repo/shell-text.mjs` gate), and names `src/ui/shell-roles.mjs`.
5. No U+2014 anywhere. `node test/repo/em-dash.mjs` is red at HEAD on one character: the committed ticket handoff `.sdlc/ui-standardization/handoff.md:24` holds a U+2014, so `npm test` is red until it is fixed. Repair it with `node test/repo/em-dash.mjs --fix` (a one-character record repair, `.claude/CLAUDE.md` Always), then run `node test/repo/citations.mjs` and `node test/repo/em-dash.mjs`.
### Acceptance criteria
- (red) `n=$(grep -nE "^## ADR-[0-9]+: The editor shell's text roles" docs/references/decision-records.md | head -1 | cut -d: -f1) && q=$(grep -n "^## Quick map" docs/references/decision-records.md | cut -d: -f1) && test -n "$n" && test "$n" -lt "$q"`
- (red) `f=docs/references/geometry/shell-roles.md && test -f "$f" && for s in "UI_ROLES" "CONTROL_ANATOMY" "CONTAINER_COMPOSITION" "--ui-badge-font" "--ui-motion-fast" "product-sm-md" "src/ui/shell-roles.mjs"; do grep -qF -- "$s" "$f" || exit 1; done && grep -qF 'shell-roles.md' docs/references/geometry/README.md && grep -qF '[shell-roles.md](shell-roles.md)' docs/references/geometry/AGENTS.md`
- (red) `grep -qF 'shell-roles.mjs' docs/references/component-inventory.md && grep -qF -- '--ui-control-font' docs/references/component-inventory.md && grep -qF 'shell-roles.mjs' .claude/skills/geometry-system/SKILL.md && grep -qF 'shell-roles.mjs' .claude/skills/building-editor-sections/SKILL.md`
- `node test/repo/em-dash.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/engine src/ui/app.js src/ui/styles.css src/ui/sections src/ui/overlays src/ui/icons.js src/ui/shell-roles.mjs scripts test mcp plugin)$(git ls-files --others --exclude-standard -- src/engine src/ui/app.js src/ui/styles.css src/ui/sections src/ui/overlays src/ui/icons.js src/ui/shell-roles.mjs scripts test mcp plugin)"`

### Notes
- item 5 is stale, `node test/repo/em-dash.mjs` is green at HEAD and the committed handoff holds no U+2014, so the `--fix` is a no-op and the criterion stays valid as written. Evidence: `cd /Users/kimgranlund/Projects/nonoun/ultimate-tokens && node test/repo/em-dash.mjs` printed `em-dash: clean (1852 files scanned)` exit 0; `git show HEAD:.sdlc/ui-standardization/handoff.md | grep -c $'\xe2\x80\x94'` printed `0` at HEAD 9535c5c7.

## Notes
- plan review: item 5 (em-dash --fix) is a no-op, the tree is already clean; the criterion stays valid.
