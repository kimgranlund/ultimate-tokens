<!-- role=verifier level=L3 model=fable effort=xhigh -->
## Verdict
pass

## Criteria
- (red) AC1, the 240-entry `legacySizeRenames` map with the ten spot pairs, no wanted key, every target wanted or `_deprecated/`, md UI step untouched, `kebabWaveOldName` null for a cell: pass. Evidence: built tree, `keys 240`, `AC1 exit=0`. Red at the pre-build HEAD in the throwaway worktree: `TypeError: M.legacySizeRenames is not a function`, `AC1 exit=1`.
- (red) AC2, the MD-first clash, null `mdCell`, no-`size/` plan, determinism: pass. Evidence: built tree, `{"clashMd":"size/product-sm-sm/height","clashXs":"_deprecated/size/xs/height","noMdMd":"_deprecated/size/md/height","noMdXs":"size/product-sm-sm/height","noGeoXs":"_deprecated/size/xs/height"}`, `AC2 exit=0`. Red at base: `TypeError`, `AC2 exit=1`.
- (red) AC3, the flagship classic end-to-end on 120 legacy vars with the negative control: pass. Evidence: built tree, `{"off":{"lost":120},"on":{"lost":0,"md":"size/product-md-md/height","caret":"_deprecated/size/xs/caret","ui":"_deprecated/type/ui-widget/lg/weight"}}`, `AC3 exit=0`. Red at base: `AC3 exit=1`.
- (red) AC4, the binder classic end-to-end on 36 legacy vars with the negative control: pass. Evidence: built tree, `{"off":36,"on":0}`, `AC4 exit=0`. Red at base: `AC4 exit=1`.
- (red) AC5, the posted apply message carries the legacy map in classic mode only, `libraryMode` sent, bare `_figmaFloatPlans()` unchanged: pass. Evidence: built tree, `{"classicMd":"size/product-md-md/height","libFlag":true}`, `AC5 exit=0`. Red at base: `{"libFlag":true}`, `AC5 exit=1`.
- AC6, `grep -q legacySizeRenames` over the three figma test files: pass. Evidence: built tree `AC6 exit=0`; at base the loop exits on `test/figma/migrations.mjs` (no match).
- (red) AC7, ADR-032's `Amendment (2026-10-08)` bullet names `legacySizeRenames` before `## Quick map`: pass. Evidence: built tree `AC7 exit=0`; at base `AC7 at base exit=1`. The amendment is the last ADR-032 bullet (`docs/references/decision-records.md:1170`), cites symbols only, and the alias sentence now reads "In published-library mode" (`:1140`).
- (guard) `node test/ui/headless-boot.mjs`: pass. Evidence: built tree, exit 0, `HEADLESS BOOT PASS, all Phase-3 interaction assertions hold`. The new `(xl)` check bites: in the bite throwaway with `legacyRenames: !libraryMode` flipped to `legacyRenames: libraryMode` in `src/ui/overlays/apply-gate.js`, the suite exits 1 with `✗ (xl) a classic apply posts floatPlans[0].renames["size/md/height"] = size/product-md-md/height (got undefined)` and `✗ (xl) a library apply posts no legacy rename for size/md/height (got size/product-md-md/height)`.
- (guard) `node test/figma/migrations.mjs && node test/figma/plugin.mjs && node test/figma/binder.mjs`: pass. Evidence: built tree, exit 0, `migrations PASS`, `pass  legacy-renames`, `pass  legacyrenames`, both suite PASS lines. The new tests bite: in the bite throwaway, walking MD last in `legacySizeRenames` turns `test/figma/migrations.mjs` red (`legacySizeRenames MD-first clash: md -> _deprecated/size/md/height, xs -> size/product-sm-sm/height`, exit 1); making `put` always deprecate turns all three red (`migrations.mjs` exit 1; `plugin.mjs` `FAIL  legacy-renames, size/md/height's id is now _deprecated/size/md/height`; `binder.mjs` `FAIL  legacyrenames, size/md/height's id is now _deprecated/size/md/height`).
- (guard) frozen `OLD_FIELD` and `kebabWaveOldName` equal the base: pass. Evidence: `lines base=21 built=21`, `G3 exit=0` (the sed extract is non-empty on both sides).
- (guard) no diff or untracked files under `src/engine`, `src/ui/app.js`, `styles.css`, `sections/color.js`, `icons.js`, `persist.js`, `model.mjs`: pass. Evidence: `G4 exit=0`.
- (guard) only the eight allowed paths changed outside `.sdlc`/`.claude`: pass. Evidence: `leftover=[]`, `G5 exit=0`; `git diff --stat 26c682fa` lists exactly those eight files.

Additional evidence:
- `figma/plugin/ui.html` is the exact regeneration: `npm run bundle && npm run gen:figma-ui` in a throwaway carrying the same eight files produced a file `cmp`-identical to the built one (`ui.html IDENTICAL to regen`), and the regen changed no other tracked file.
- `_figmaFloatPlans` dependents: `git grep` shows only `applyToFigma` (`src/ui/overlays/apply-gate.js:110`) passes an argument; `_figmaChangedCount` (`:331`), `src/ui/app.js:2489`, and every `test/ui/headless-boot.mjs` call site call it bare, and the bare path is unchanged (AC5's `gate` check and the green headless run).
- `node test/repo/em-dash.mjs`: `em-dash: clean (1554 files scanned)`, exit 0.
- Handoff Do items without a criterion, confirmed in the diff: `LEGACY_SIZE_CELLS` imported from the engine (`figma/binder/migrations.mjs:14`); the header comment states the `size/{step}/font` precedent for deprecating the retired UI steps (`:143-144`); `mdCell` comes from `sizeAnchor(this._geomScaleFor("base"), "MD").name` (`src/ui/overlays/apply-gate.js:294`); `_libraryMode()` read once and sent as `libraryMode` (`:109-110`); the library-mode comment is present (`:106-108`); merge order is `{ ...waveVars, ...legacy, ...(p.renames || {}) }` (`:299`).
- The builder's note on both spellings coexisting in one file (the second one prunes because the rename loop skips an existing target) matches the handoff's rule (d) and the existing `kebabWaveVarRenames` behaviour; it is outside this step's criteria and not a defect of the build.

## Out of scope changes
None. The diff against `26c682fa` touches exactly the eight files the handoff allows; the only untracked path is `.sdlc/figma-legacy-size-renames/step-1/`.

## For the next attempt
None
