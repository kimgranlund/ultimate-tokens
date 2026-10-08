<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/test/engine/categories.mjs`: item 4. The `geometry` import line for `DEFAULT_GEOMETRY` and `geomScale` is added. `let geomSpecCount = 0;` sits before the CATS loop, and `geomSpecCount++;` is the first line in `if (sg) {`. The new `(geometry-discriminate)` block sits between `(curve-validate)` and `(g)`. It uses `makeGeometryDoc` with slug `synthetic-geometry-fixture`, puts `geometry` on the volume palette entry, and checks four things under the `geometry` gate: pass-through and absence, hydrate equal to the spec and to `DEFAULT_GEOMETRY`, cell height 64 against 32 with the two differing, and the retired `ramp` dropped while `tier` stays `"content"`. A count line prints only when the `geometry` gate has no failure. The header comment now names `(geometry-discriminate)`. The main-loop leg built earlier is kept.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/.claude/skills/building-editor-sections/SKILL.md`: item 5. The "One head style" bullet is rewritten. It now names the keyed `ut-geometry-roles-<key>` style id, the `data-ut-geom` key (`geomHostSeq`, kept as `this._geomKey`, stamped at render) and the scopes `scopeGeomCSS` rewrites. The held-on-instance, no-lookup-by-id and removed-on-disconnect clauses are kept. The `deleteTypeMode`/`deleteGeomMode` fact pin is untouched.
- Items 1 to 3 and 6 (icons.js, app.js, geometry.mjs, the headless-boot and geometry tests, responsive.md, gen-categories comments, the docs cite repairs, regenerated ui.html and describe-mcp-assets.js) were already in the tree and were not changed.

## Checks
All runs used `SDLC_BASE_SHA=1ff9d76cc32e22cfaf1190174314421b8a0b42c2` and passed.
- Criterion 1 (`node test/ui/headless-boot.mjs`, the `(ics` count, the icons.js grep): exit 0, ending "HEADLESS BOOT PASS".
- Criterion 2 (the `data-ut-geom` and `ut-geometry-roles` greps): exit 0.
- Criterion 3 (the breakpoint `:where(:root)` probe, then `node test/engine/geometry.mjs`): exit 0, "geometry PASS".
- Criterion 4 (red, `node test/engine/categories.mjs` output plus the greps): exit 0. It printed `  (geometry: 0 corpus palettes carry a spec geometry; the (geometry-discriminate) fixture proves the pass-through)`, and every gate passed, including `geometry`.
- Criterion 5 (red, the SKILL.md greps): exit 0.
- Criterion 6 (guard, `node test/repo/citations.mjs`): exit 0, "STALE 0 across 12 discovered docs + 10 fact pins".
- Before writing the assertions, I probed hydrate and geomScale. The spec geometry gives height 64 and hydrates unchanged. With no geometry, the result is `DEFAULT_GEOMETRY` at height 32. `{tier:"content", ramp:"linear4"}` drops `ramp` with one `[persist]` warning and keeps `tier: "content"`.
- `node test/repo/em-dash.mjs`: clean.

## Notes
- The corpus count is 0, as the handoff expected. It is reported, not asserted.
- Neither edit moved `src/ui/app.js`, so no citations needed repair.
- The full `npm test` was not run, because it is step 6's gate.
- `figma/binder/mode-apply-plan.mjs:250` is left for step 6's Follow-ups, as the handoff directs.
