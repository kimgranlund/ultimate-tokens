---
id: T-0016
title: "Semantic Mapping tab: swatch border, drop Roles pane tab, rename Raw token column"
type: chore           # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: M              # S | M | L | XL
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-07
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
Tidy the Semantic Mapping tab (user request 2026-10-07, with a screenshot of the Mode / Semantic table where each Light/Dark row shows a color swatch with a light border).

## Intent
- Do: (1) remove the border around the color swatch in the Semantic Mapping table rows (CSS in `src/ui/styles.css`; find the swatch class used by the mapping table in `src/ui/sections/color.js` and fix only that swatch, not other swatches elsewhere); (2) remove the Roles tab from the pane: the Mapping tab makes it redundant (find the pane tab list in `src/ui/sections/color.js` / `src/ui/app.js`; remove the tab, its render path and its now-dead helpers, and make sure persisted state naming the Roles tab falls back to a valid tab, for example Mapping, without error; old saved docs must still load); (3) rename the column header `Raw token` to `Raw token mapping` (find every occurrence in the mapping table, tests and docs).
- Non-goals: any change to the 53 semantic roles, `semanticRoles`, role-table.json or the Figma binder; other tabs; the Roles-tab removal must not delete engine data, only the UI tab.
- Done when: the three UI changes are in; `git grep -n "Raw token"` shows only the new wording except intentional history; tests and headless-boot lettered groups that exercised the Roles tab are updated or removed with the tab (not left red, and not weakened without saying why); `npm test` and `npm run build` green; update `docs/references/component-inventory.md` and any doc or skill that lists the Roles tab, in the same change (stale records are defects); `npm run smoke` is not run locally (CI only), so state in the report which smoke steps touched the Roles tab.

## Context
Screenshot shows the table header `Mode | (swatch) | Semantic ...` with light outlined swatches. A sibling ticket T-0014 (chroma controls redesign) will also edit `src/ui/sections/color.js`; keep this diff small and in its own branch.

## Constraints
- No push, PR or issue from the agent. One worktree, one branch; the conductor publishes after user approval. Gates local only, through `gate_lock.py run --name <what> -- <cmd>` with SDLC_GATE_WORKERS=10; no `npm run smoke` locally.
- No U+2014 em dash. Never commit `*.log`, `.run.lock`, `*.attempt.json`. `.claude/docs/other/` never enters a commit. Generated artifacts regenerate through `npm test`.

## Acceptance criteria
- The Semantic Mapping swatch has no border: the `.map-swatch` rule in `src/ui/styles.css` sets no `border*` property, and `.swatch` (other chips) is unchanged. Check: `grep -n -A3 "^.map-swatch {" src/ui/styles.css`.
- The right pane has no Roles tab: `renderRolesInspector`, `_rolesTable`, the `roles` tab entry, key `3`, the `.roles-*`/`.rrow` CSS, the `roles` icon and the dead `swatch()` `onClick` branch with `.swatch-btn` are gone; engine data, `semanticRoles` and `docs/reference/data/role-table.json` are untouched. Check: `git diff --stat` shows nothing under `src/engine/`, `figma/binder/`, `docs/reference/data/`.
- A stale `segment` value (for example `"roles"`) renders the Palette tab, no error: headless group `(rt)` in `test/ui/headless-boot.mjs`.
- The column header reads `Raw token mapping`: headless group `(aa)`; `git grep -n -a "Raw token"` leaves only that header, its test, the generated `figma/plugin/ui.html`, and ADR/spec prose about raw tokens in general.
- The new tests discriminate: reverting the header, restoring the border, or removing the segment fallback each turns `node test/ui/headless-boot.mjs` red.
- Records agree: `docs/references/component-inventory.md`, `docs/specs/app-shell.md`, `docs/references/ui-plan.md` and `.claude/skills/adding-semantic-roles/SKILL.md` no longer list a Roles tab; `node scripts/audit-citations.mjs` reports STALE 0.
- `npm test` and `npm run build` exit 0 through `gate_lock.py`.
- Smoke: `test/smoke/smoke.mjs` has no step that names the Roles tab, a segment, or a `.rrow`/`.roles-table` selector (its inspector assertions are the Typography and Geometry sections), so no smoke step needs a change; smoke is not run locally.
