<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/src/engine/geometry.mjs: `buildCell` adds `partHeight` and `partInset` after `minWidth`. `CELL_FIELDS` is now `export const` with 16 entries, and the part fields sit at indices 10 and 11. Two `--control-part-*` lines are added verbatim to the `:where(*, :host)` resolver block. The header now states the compound law and names the three micro exceptions. Comments say 27 × 16 and 9 × 16.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/src/engine/ds-export.js: `DS_CELL_FIELDS` is deleted, `CELL_FIELDS` is imported from `./geometry.mjs` and used in `dsFullLayersCss`. The code is now `const menuPad = mdCell ? mdCell.partInset : 4;`, and the menu comment says the padding is the kit default cell's `partInset`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/src/ui/sections/geometry.js: `TABLE_FIELDS` is deleted and `CELL_FIELDS` is imported from the engine. The Tokens tab title reads `${CELL_FIELDS.length} fields`. Two comments are updated.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/test/engine/geometry.mjs: the counts are now 27 * 16, 16 DTCG fields, 432 size/ and 144 control/, and the role list gains the two part roles. A verbatim check covers the two resolver lines. A new `compound-law` group reads `partHeight` and `partInset` from `FIX.rows`, checks `chipHeight <= partHeight` on 24 cells, and names micro-sm-sm, micro-sm-md and micro-md-sm literally.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/test/figma/migrations.mjs: the count is 432 with the message `want 432 = 27 cells x 16 fields`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/test/ui/headless-boot.mjs: `(geo-tok)` uses the literal `.tok-col").length === 16` with the message `(16)`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/test/smoke/smoke.mjs: each resolver case carries `partHeight` and `partInset`. The probe style gains `min-height` and `padding-left`, both values are read back and compared within 0.01, and the ok label is the exact text from the handoff.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/plugin/ultimate-tokens/skills/geometry-tokens/scripts/dimension-parity.mjs: line 70 only. The role-count pin goes from 13 to 15 (`control x8, chip x3, radius x4`). This is outside the handoff's Do; see Notes.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/docs/references/component-inventory.md, /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/docs/reports/2026-08-20-reactivity/00-synthesis.md, /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md: 11 STALE `geometry.js:N` citations moved by -7 lines, because `TABLE_FIELDS` was deleted. This is outside the handoff's Do; see Notes.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/src/ui/describe-mcp-assets.js and /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/figma/plugin/ui.html: regenerated with `npm run gen:mcp-assets && npm run bundle && npm run gen:figma-ui`.

## Checks
- Criterion 1, the engine node -e for CELL_FIELDS, part fields and chip-over-part set: PASS.
- Criterion 2, the emitter node -e for 27×16, DTCG 16, 432/144, the resolver lines, 81 ctx cells and the prefix: PASS.
- Criterion 3, `node test/engine/geometry.mjs` plus the greps: PASS.
- Criterion 4, `node test/figma/migrations.mjs` plus the grep: PASS.
- Criterion 5, `node test/engine/ds-gates.mjs` plus the ds-export greps: PASS.
- Criterion 6, the geometry.js greps plus `node test/ui/headless-boot.mjs`: PASS.
- Criterion 7, `dimension-parity.mjs | grep '27 cells x 16 fields, 15 roles'`: FAIL at first (`✗ engine: 15 roles, expected the 13 resolver roles`), then PASS after the line-70 edit.
- Criterion 8, the smoke greps: PASS. `node --check test/smoke/smoke.mjs`: OK. Smoke itself was not run (it runs in step 6).
- Criterion 9, part-inset present in describe-mcp-assets.js and ui.html: PASS.
- Criterion 10, no 14-field comments and `partInset` in the header: PASS.
- Guard, no diff in styles.css, app.js, color.js, model.mjs, persist.js, overlays, figma/binder or code.js: PASS.
- `node test/engine/exports.mjs`: exit 0.
- First `npm test`: 1 of 54 failed. `repo/citations.mjs` reported 11 STALE `src/ui/sections/geometry.js` citations.
- `node test/repo/citations.mjs` at base 696c6c1d, in a throwaway worktree that has since been removed: green (STALE 0). The failure therefore came from this step, not from base.
- After moving the citations, `node test/repo/citations.mjs`: STALE 0.
- Second `npm test`: `✓ all 54 test files passed`, exit 0. The tree had the same set of changes before and after the run.

## Notes
- Do 6 was wrong about `dimension-parity.mjs`. It said the script "moves to 16 and 15 with no edit", but `dimension-parity.mjs:70` pins `ROLES.size !== 13` as a literal, so criterion 7 cannot pass without an edit. I changed that one line to 15 (`control x8`, which counts the 6 existing control roles plus part-height and part-inset). For the planner, the architect's "derives ROLES, comments only" missed this pin. Its stale comments at :5 ("27 cells x 14 fields, the 13 roles") and :23 ("the 14 per-cell fields") are unchanged, and so is the plugin `SKILL.md:32` "13 resolved roles". Those record pins belong to a later step.
- Deleting `TABLE_FIELDS` (Do 3) moved later lines of `src/ui/sections/geometry.js` up by 7. That made 11 doc citations STALE and turned the `npm test` citations gate red. I moved only the STALE ones by -7, which matches how earlier feature PRs have re-homed citations in these docs. The NEAR citations are unchanged, including `sections/geometry.js:297` and `src/engine/geometry.mjs:160-161`.
- `menuPad` gives the same value at the default kit, because product-md-md has inset 8, so partInset is 4.
