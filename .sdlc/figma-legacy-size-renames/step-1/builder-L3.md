<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/figma-legacy-size-renames/figma/binder/migrations.mjs`: imports `LEGACY_SIZE_CELLS` and adds `LEGACY_SIZE_FIELDS`, the frozen retired-UI-step tables and `legacySizeRenames(currentNames, mdCell)`. The header comment records that the retired steps are deprecated and keep their ids, following the `size/{step}/font` precedent. `OLD_FIELD`, `kebabWaveOldName` and `kebabWaveVarRenames` are untouched.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/figma-legacy-size-renames/src/ui/overlays/apply-gate.js`: imports `sizeAnchor` and `legacySizeRenames`. `_figmaFloatPlans(opts = {})` merges `{ ...waveVars, ...legacy, ...(p.renames || {}) }` only when `opts.legacyRenames === true`, so a call with no argument returns what it did before. `applyToFigma` reads `_libraryMode()` once, sends it as `libraryMode` and passes `{ legacyRenames: !libraryMode }`. A comment says why library mode does not get the map.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/figma-legacy-size-renames/test/figma/migrations.mjs`: new `legacySizeRenames` block covering:
  - 240 entries, with spot checks
  - no wanted keys and every target is valid
  - the MD-first clash, a null `mdCell`, and a plan with no `size/` names
  - every `LEGACY_SIZE_FIELDS` entry resolving through `kebabWaveOldName`
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/figma-legacy-size-renames/test/figma/plugin.mjs`: new `legacy-renames` gate, declared in `DECLARED`. It runs a classic flagship apply on the 120 legacy vars:
  - with the renames stamped, 0 ids are lost
  - `size/md/height` becomes `size/product-md-md/height`
  - `size/xs/caret` and the `type/ui-widget/*` and `type/ui-control/*` vars move under `_deprecated/`
  - negative control: without the stamp, all 120 ids are lost
  - pre-wave case: `size/MD/height` becomes `size/product-md-md/height`
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/figma-legacy-size-renames/test/figma/binder.mjs`: new `legacyrenames` gate, declared, running the same classic end-to-end test and negative control through `loadBinder`'s `applyFloatPlans`.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/figma-legacy-size-renames/test/ui/headless-boot.mjs`: new `(xl)` check. With `ultimate-tokens-library-mode-v1` set to "0", the posted `floatPlans[0].renames["size/md/height"]` is `size/product-md-md/height`; with "1", that key is absent.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/figma-legacy-size-renames/docs/references/decision-records.md`: in ADR-032's Figma bullet, the alias sentence is now qualified as published-library mode, with a pointer to the amendment. A `- **Amendment (2026-10-08).**` bullet naming `legacySizeRenames` is added before `## Quick map`.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/figma-legacy-size-renames/figma/plugin/ui.html`: regenerated with `npm run bundle && npm run gen:figma-ui`.

## Checks
- AC1, the `legacySizeRenames` 240-entry and spot-check one-liner: exit 0.
- AC2, the clash, null `mdCell`, no-geometry and determinism one-liner: exit 0.
- AC3, the flagship classic end-to-end one-liner: exit 0 (`{"off":{"lost":120},"on":{"lost":0,"md":"size/product-md-md/height","caret":"_deprecated/size/xs/caret","ui":"_deprecated/type/ui-widget/lg/weight"}}`). Run again after the test edits: exit 0.
- AC4, the binder classic end-to-end one-liner: exit 0 (`{"off":36,"on":0}`).
- AC5, the apply-gate posted-message one-liner: exit 0 (`{"classicMd":"size/product-md-md/height","libFlag":true}`).
- AC6, `grep -q legacySizeRenames` over the 3 test files: exit 0.
- AC7, the ADR-032 amendment awk/grep: exit 0.
- (guard) `node test/ui/headless-boot.mjs`: exit 0, HEADLESS BOOT PASS. The new `(xl)` check bites: with the classic leg flipped to "1" the suite failed on `(xl)`; the flip was reverted.
- (guard) `node test/figma/migrations.mjs && node test/figma/plugin.mjs && node test/figma/binder.mjs`: exit 0, with `legacy-renames` and `legacyrenames` both passing. The stderr lines are the suites' expected log noise.
- (guard) the frozen `OLD_FIELD` / `kebabWaveOldName` comparison against `$SDLC_BASE_SHA`: exit 0.
- (guard) the off-limits `git diff --quiet` over `src/engine`, `app.js` and the other listed files: exit 0.
- (guard) the allowed-file scope check: exit 0.
- Extra check: `node test/repo/em-dash.mjs` exit 0, and no U+2014 in the touched files.

## Notes
- The full `npm test` was not run; the criteria do not name it.
- I read the `maintaining-figma-plugins` skill. I did not read `figma-file-migration` because it covers driving a live file through MCP, and nothing in this step touches a live file.
- `docs/references/AGENTS.md` (the listed Read first) is only a generated index and has no rules for this edit.
- When both a kebab name and its pre-wave spelling exist in one file, both map to the same target. The `applyFloatPlans` rename loop renames the first one only, because it skips a target that already exists. The second then falls through to the normal prune. Neither the handoff nor any criterion covers this both-spellings case.
