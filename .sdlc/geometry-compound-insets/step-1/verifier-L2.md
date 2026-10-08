<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- C1 (CELL_FIELDS 16 entries at indices 10/11, partHeight/partInset on all cells in round and pill, chip-over-part set is exactly micro-md-sm,micro-sm-md,micro-sm-sm): pass. Evidence: the node -e command exits rc=0. At base 696c6c1d in a throwaway worktree, `Array.isArray(G.CELL_FIELDS)` is false, so the check goes red there.
- C2 (emitters: 27*16 primitives, DTCG 16 per cell, 432 size/ and 144 control/ Figma variables, both resolver lines verbatim, 81 ctx-cell hooks, prefix contract): pass. Evidence: node -e exits rc=0.
- C3 (`node test/engine/geometry.mjs` plus greps for `27 * 16`, `=== 432`, `partInset`): pass. Evidence: prints "geometry PASS, ... the compound law ..."; greps exit 0. The test/engine/geometry.mjs diff reads partHeight and partInset from `FIX.rows`, and names the three micro exceptions literally.
- C4 (`node test/figma/migrations.mjs` and the grep for `want 432 = 27 cells x 16 fields`): pass. Evidence: migrations PASS, grep exit 0.
- C5 (ds-gates, no `DS_CELL_FIELDS`, no `const menuPad = 4;`, `menuPad` uses `partInset`, `CELL_FIELDS` imported from `./geometry.mjs`): pass. Evidence: ds-gates PASS; all four greps exit 0. src/engine/ds-export.js diff shows `const menuPad = mdCell ? mdCell.partInset : 4;`. `node test/engine/exports.mjs` prints "PASS: export-formats clears all [gate] predicates".
- C6 (no `TABLE_FIELDS` in sections/geometry.js, `CELL_FIELDS` import, headless-boot `.tok-col").length === 16` literal, headless boot passes): pass. Evidence: three greps exit 0; "HEADLESS BOOT PASS, all Phase-3 interaction assertions hold".
- C7 (dimension-parity prints `27 cells x 16 fields, 15 roles`): pass. Evidence: "dimension-parity PASS, ... (27 cells x 16 fields, 15 roles)". At base the same script prints "27 cells x 14 fields, 13 roles", so it goes red there.
- C8 (smoke greps for `min-height:var(--control-part-height)`, `padding-left:var(--control-part-inset)`, and the exact ok label): pass. Evidence: grep exit 0; smoke.mjs diff shows the probe style, the four-value read compared within 0.01, and the label. Smoke is not run in this step; runtime behavior there is proved structurally only, as the handoff allows.
- C9 (`part-inset` in src/ui/describe-mcp-assets.js and figma/plugin/ui.html): pass. Evidence: grep exit 0. `npm test` regenerates both and the `git diff --stat` hash was identical before and after, so they are current.
- C10 (no stale "14 per-cell/fields/kebab", "27 × 14" or "9 × 14" in the three source files; `partInset` in the geometry.mjs header lines 1-40): pass. Evidence: the command exits rc=0; the header diff states the compound law and names the three micro cells.
- Guard (no diff in styles.css, app.js, color.js, model.mjs, persist.js, overlays, figma/binder, figma/plugin/code.js, and no untracked files in overlays or binder, against 696c6c1d): pass. Evidence: the command exits rc=0. `$SDLC_BASE_SHA` was unset in my shell, so I used the commit named in the brief and in base-sha, 696c6c1d.
- Whole gate (`npm test`): pass. Evidence: "all 54 test files passed". `repo/citations.mjs` reports STALE 0 and `repo/em-dash.mjs` is clean. The tree diff hash is unchanged by the run.

## Out of scope changes
- plugin/ultimate-tokens/skills/geometry-tokens/scripts/dimension-parity.mjs line 70: the role-count pin moves 13 to 15. This contradicts Do 6 ("no edit"), but C7 cannot pass without it, so I accept it as necessary. The script's stale comments at :5 and :23 and `SKILL.md:32` are covered by the step-2 handoff (line 18).
- docs/references/component-inventory.md, docs/reports/2026-08-20-reactivity/00-synthesis.md and docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md: `geometry.js:N` citations moved by -7, because deleting `TABLE_FIELDS` made 11 of them STALE and the `npm test` citations gate red. Required by the Do 3 deletion and verified green.
- The remaining "27 × 14" and "13 roles" prose in the geometry skills and docs is assigned to step 2 (step-2/handoff.md lines 15-18 and criterion at line 36). It is not a defect of this step.

## For the next attempt
None
