## Task goal
Rebuild the Geometry system of ultimate-tokens on the Maison ui-kit geometry system (user decision 2026-10-07: "for the Geometry system, let's use the maison ui-kit system... we should name tokens according to our standards of course, but this is a standard system to follow for now"). Geometry's per-step text size still composes from the Type UI scale (project invariant).

## Step 13: Records: ADR, skills and docs, and the citation repairs
level: L2
### Read first
- `docs/AGENTS.md`
- `docs/references/AGENTS.md`
- `docs/references/typography/AGENTS.md`
- `docs/specs/AGENTS.md`
### Do
Depends on: steps 1 to 12 (committed, HEAD `9c7a2ee8`). This is the second replan of step 13. Two builds of it are superseded, and their work is in the tree, uncommitted, and stays: ADR-032 and its Quick map row, the five skills, the geometry and typography references, `mcp/README.md` and the regenerated `src/ui/mcp-assets.js`, and line-number repairs on 81 of the 83 STALE lines in the seven approved docs. `## Changes` and `## Notes` of `.sdlc/geometry-maison-ladder/step-13.superseded-2/builder-L3.md` list what is done; do not redo it. Criteria 1 to 5 and the `mcp-assets.js` criterion check that work: green in the tree today.

What is left is the handoff's `plan defect: step 13 (second block ...)` line: two citations whose subject no longer exists at any line of the cited file. `node test/repo/citations.mjs` fails on exactly these two lines today.
1. `docs/references/component-inventory.md` line 47: change the cite `styles.css:164` to `styles.css before ADR-032`. Step 8 moved the base `button` rule onto `--sh-control-inset`. The literal `padding: 4px 9px` survives only at `src/ui/styles.css:418` (the `.app-header .docname` pill) and `:1106` (`.copy-float`), neither a button rule, so a digit change would point the line at the wrong code.
2. `docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md` line 45: change the cite `model.mjs:58` to `model.mjs before ADR-032`. `geometryScale` now delegates to `geomScaleFor` (`src/ui/model.mjs:52`). The two `geomScale(` calls left in `src/ui/model.mjs`, `:158` and `:204`, are already cited on that line.

Change nothing else on either line. Lines 43 and 65 of the same 02 doc already use this form (`geometry.js before ADR-032`, `persist.js before ADR-032`): with no `:N` it is no longer a citation. A planner prototype made both edits in a copy of this tree and `node test/repo/citations.mjs` went green (`STALE 0 across 12 discovered docs`), with every criterion below green.

The prose guard now skips line 47 of `component-inventory.md` and lines 43, 45 and 65 of the 02 doc (the conductor's ruling). The guard after it checks exactly those four lines: each may differ from its base text only in cite digits and in a `file:N` cite becoming `file before ADR-032`.

Any other red is a stop: report Status blocked with the doc line and the `node scripts/audit-citations.mjs` row for it. Never reword prose to make a cite pass.

Carried from the earlier plan:
- `mcp/README.md` feeds `src/ui/mcp-assets.js` through `scripts/gen-mcp-assets.mjs`, and the asset is already regenerated. Run `npm run gen:mcp-assets` again only if the README changes.
- `figma/plugin/ui.html` is stale at `9c7a2ee8`, and `npm test` rewrites it. Step 14 owns it. It is in this step's scope list only so a builder's own `npm test` floor run does not trip the scope check.
- `docs/assets/geometry-tokens.json` stays as it is. Step 14's report carries it as a follow-up.

Before running the `$SDLC_BASE_SHA` guards, export it from the brief's Base sha line (`dispatch.py` passes it there, since a sub-agent cannot read it from its environment). Unset, each of them exits 1 on purpose rather than pass empty.

Focused checks: `node test/repo/citations.mjs`, then the `npm test` floor.
### Acceptance criteria
- `grep -qF 'Geometry adopts the Maison ui-kit ladder' docs/references/decision-records.md && grep -qF -- '--g-chip-height' docs/references/decision-records.md && grep -qE '^\| ADR-[0-9]+ \| Geometry has no height knob' docs/references/decision-records.md`
- `awk '/Geometry adopts the Maison ui-kit ladder/{if(!a)a=NR} /^## Quick map/{q=NR} END{exit !(a && q && a < q)}' docs/references/decision-records.md`
- `! grep -rqE 'baseHeight|rampContrast|linear4|CONTROL_FONT|GAP_UNIT' .claude/skills/geometry-system .claude/skills/type-scale .claude/skills/building-editor-sections .claude/skills/maintaining-brand-kit-mcp .claude/skills/maintaining-figma-plugins docs/references/geometry/README.md docs/references/typography mcp/README.md`
- `grep -rqF 'uiText' .claude/skills/type-scale && ! grep -rqF '51 steps' .claude/skills/type-scale docs/references/typography`
- `grep -rqF 'data-tier' .claude/skills/building-editor-sections && grep -rqF -- '--sh-control-height' .claude/skills/building-editor-sections`
- (red) `node test/repo/citations.mjs`
- (red) `sed -n 47p docs/references/component-inventory.md | grep -qF 'styles.css before ADR-032' && sed -n 45p docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md | grep -qF 'model.mjs before ADR-032'`
- `node --input-type=module -e 'import { MCP_BRAND_KIT as m } from "./src/ui/mcp-assets.js"; import { readFileSync as r } from "node:fs"; process.exit(m.readme === r("mcp/README.md", "utf8") && m.core === r("mcp/brand-kit-core.mjs", "utf8") && m.server === r("mcp/brand-kit-server.mjs", "utf8") ? 0 : 1)'`
- (guard) `test -n "$SDLC_BASE_SHA" && for f in docs/references/component-inventory.md docs/specs/app-shell.md docs/reports/2026-08-20-reactivity/00-synthesis.md docs/reports/2026-08-20-reactivity/01-core-reactivity.md docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md docs/reports/2026-08-20-reactivity/03-stores-and-persistence.md docs/reports/2026-08-20-reactivity/04-context-and-messaging.md; do d=p; case "$f" in *component-inventory.md) d='47d';; *02-sections-and-resolvers.md) d='43d;45d;65d';; esac; cmp -s <(git show "$SDLC_BASE_SHA:$f" | sed "$d" | tr -d '0-9/-') <(sed "$d" "$f" | tr -d '0-9/-') || exit 1; done`
- (guard) `test -n "$SDLC_BASE_SHA" && for p in docs/references/component-inventory.md:47 docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md:43 docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md:45 docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md:65; do f=${p%:*}; n=${p##*:}; test "$(git show "$SDLC_BASE_SHA:$f" | sed -n "${n}p" | tr -d '0-9/-')" = "$(sed -n "${n}p" "$f" | sed 's/ before ADR-032/:/g' | tr -d '0-9/-')" || exit 1; done`
- (guard) `test -n "$SDLC_BASE_SHA" && test -z "$( { git diff --name-only "$SDLC_BASE_SHA" -- . ":(exclude).sdlc"; git ls-files --others --exclude-standard -- . ":(exclude).sdlc"; } | grep -vxF -e .claude/skills/building-editor-sections/SKILL.md -e .claude/skills/building-editor-sections/references/best-practices.md -e .claude/skills/building-editor-sections/references/foundations.md -e .claude/skills/building-editor-sections/references/rubric.md -e .claude/skills/geometry-system/SKILL.md -e .claude/skills/geometry-system/references/best-practices.md -e .claude/skills/geometry-system/references/foundations.md -e .claude/skills/geometry-system/references/rubric.md -e .claude/skills/maintaining-brand-kit-mcp/SKILL.md -e .claude/skills/maintaining-brand-kit-mcp/references/best-practices.md -e .claude/skills/maintaining-brand-kit-mcp/references/foundations.md -e .claude/skills/maintaining-figma-plugins/SKILL.md -e .claude/skills/maintaining-figma-plugins/references/foundations.md -e .claude/skills/type-scale/SKILL.md -e .claude/skills/type-scale/references/best-practices.md -e .claude/skills/type-scale/references/foundations.md -e docs/references/decision-records.md -e docs/references/geometry/README.md -e docs/references/typography/README.md -e docs/references/typography/intended-use.md -e mcp/README.md -e src/ui/mcp-assets.js -e src/ui/describe-mcp-assets.js -e figma/plugin/ui.html -e docs/references/component-inventory.md -e docs/specs/app-shell.md -e docs/reports/2026-08-20-reactivity/00-synthesis.md -e docs/reports/2026-08-20-reactivity/01-core-reactivity.md -e docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md -e docs/reports/2026-08-20-reactivity/03-stores-and-persistence.md -e docs/reports/2026-08-20-reactivity/04-context-and-messaging.md)"`
- (guard) `node test/repo/em-dash.mjs`
