<!-- role=verifier level=L3 model=fable effort=xhigh -->
## Verdict
pass

## Criteria
- (red) `GEOMETRY_FIELD_RENAME_MAP` node one-liner: pass. Evidence: built tree exit=0; base worktree (2a30ac73) exit=1. Literal at `figma/binder/migrations.mjs:122`.
- (red) `kebabWaveOldName` node one-liner (cells null, legacy steps reverse): pass. Evidence: built tree exit=0; base exit=1. The null return sits before the `OLD_FIELD` lookup at `figma/binder/migrations.mjs:34-35`; `OLD_FIELD`, `OLD_VOICE`, `OLD_PROP` carry no diff hunk (`git diff 2a30ac73 -- figma/binder/migrations.mjs` touches only `:31-36` and `:98-120`).
- (guard) `grep -qF 'const OLD_FIELD = ...' figma/binder/migrations.mjs`: pass. Evidence: exit=0 on the built tree and exit=0 at base.
- (red) `geometrySizeAliasMap` tiebreak one-liner (XS/MD/LG to product-sm-sm/product-sm-md/product-lg-md): pass. Evidence: built tree exit=0; base exit=1 with `{"size/XS/height":"size/micro-lg-lg/height","size/MD/height":"size/content-sm-sm/height","size/LG/height":"size/content-sm-md/height"}`, the misroute the tiebreak exists to fix.
- (red) `geometryCellOrder` key-order one-liner: pass. Evidence: built tree exit=0; base exit=1 (`P.geometryCellOrder is not a function`). Function at `figma/binder/mode-apply-plan.mjs:237-245`.
- (guard) `nearestStepByHeight(28, { b: 28, a: 28 }) === "b"`: pass. Evidence: exit=0 on built tree and at base; negative control `{ a: 28, b: 28 }` expecting `"b"` exits 1, so the predicate bites. The function body has no diff hunk (the mode-apply-plan.mjs hunk starts after `:224`).
- (red) grep loop over both `code.js` files for `geometryCellOrderVM` and `"padding-narrow": "inset"`, plus `"geometryCellOrderVM"` in `scripts/gen-figma-binder-code.mjs`: pass. Evidence: built tree exit=0; base exit=1. `figma/plugin/code.js:490`, `figma/binder/figma-semantic-binder/code.js:329`, `scripts/gen-figma-binder-code.mjs:50`.
- (red) `legacy-cell-map` and `geom-alias-apply` present in `test/figma/plugin.mjs`: pass. Evidence: built tree exit=0; base exit=1. Groups start at `test/figma/plugin.mjs:1936` and `:1961`, both in `DECLARED` at `:2314`.
- (red) `size/product-sm-sm/inset` present and `size/xs/padding-wide` absent in `test/figma/plugin.mjs`: pass. Evidence: built tree exit=0; base exit=1.
- (red) `size/product-md-sm/height` and `size/content-lg-lg/icon` in `test/figma/binder.mjs`: pass. Evidence: built tree exit=0; base exit=1. `test/figma/binder.mjs:541`, `:551`.
- `node test/figma/plugin.mjs`: pass. Evidence: built tree exit=0, `PASS: figma-plugin-app ...`, with `libraryparity`, `legacy-cell-map`, `geom-alias-apply`, `librarygrammar`, `report-static` all `pass`. Base exit=1 (`FAIL: 2 gate failure(s)`). Mutation in a patched throwaway: reverting `geometryCellOrder(currentStepHeights)` to `currentStepHeights` in `mode-apply-plan.mjs` turns `legacy-cell-map` red (`sent size/XS/height to size/micro-lg-lg/height, want size/product-sm-sm/height`).
- `for t in test/figma/binder.mjs test/figma/migrations.mjs test/figma/live-diff.mjs; do node "$t" || exit 1; done`: pass. Evidence: built tree, all three exit=0 (`PASS: figma-plugin clears its checkable [gate] predicates`; `migrations PASS ... ladder cells excluded by design`; `live-diff PASS`). Base: binder.mjs exit=1 (`librarygeom`, `libraryidem` red), migrations.mjs exit=1, live-diff.mjs exit=0. Mutation in the patched throwaway: a one-char drift in the standalone binder's `GEOMETRY_FIELD_RENAME_MAP` (`font: "texts"`) turns `renameparity` red with the key-order-counting message, so the three-copy parity the handoff leans on is a live gate.

Further evidence, not criteria:
- Generated outputs are current: in a throwaway worktree with the step's patch applied and staged, `npm run gen:figma-assets` exit=0 and `git status --short` shows no unstaged change to `figma/binder/figma-semantic-binder/code.js` or `src/ui/figma-plugin-assets.js`.
- Contract dependents outside the diff: `git grep` finds only `src/ui/app.js:48` and `src/ui/overlays/apply-gate.js:6,289` (import `kebabWaveVarRenames`; cells resolve to null, proven by the 378-cell null check and the no-collision check in `test/figma/migrations.mjs:59-63`) and the prose mention at `figma/README.md:26`, which stays true.
- `applyFloatPlans` ALIAS second pass at `figma/plugin/code.js:1788-1800` skips a missing target (`if (mid != null && target)`), never throws, and joins `current` and the count; the observed `geom-alias-apply` run shows `control/product/md/height` as a `VARIABLE_ALIAS` to `size/product-md-md/height`.
- `node test/repo/em-dash.mjs` exit=0 on the built tree; zero U+2014 in the diff.
- `node test/repo/citations.mjs` is red in both trees, exit=1 with `5 citation gate failure(s)` and the same failing files in the visible tail (three `docs/reports/2026-08-20-reactivity/*` citation lines and `.claude/skills/geometry-system/SKILL.md:107 buildSizeLadder`); nothing this step added appears in either run. Not a criterion of this step.

## Out of scope changes
None outside the files the step names. Two builder-flagged deviations inside them, accepted:
- `test/figma/binder.mjs:536` (`librarygeom` `stillThere`) and `:609` (`libraryidem` `oldPresent`) now tolerate the `_deprecated/` rename. The handoff's Do says these checks "hold unchanged", but the same Do line says caret, icon-gap, padding-wide and the two compact pads deprecate under `_deprecated/`, which an exact-name check cannot survive (base shows `libraryidem` finding 9/30 names before any loosening). No acceptance criterion asserts the checks are unchanged, and the handoff's own `librarygrammar` pattern (`plugin.mjs:2141`) tolerates the rename the same way, so this is a Do-prose contradiction, not a plan defect. Minor: `stillThere` uses a prefix match (`indexOf(...) === 0`) while `oldPresent` uses an exact match; both still fail on a removal.
- `figma/plugin/ui.html` is not regenerated (the builder restored it after `npm test`). It was already behind `src/ui/figma-plugin-assets.js` at base and is rebuilt by `npm run build` at landing; the step does not own it.
- Pre-existing `npm test` reds the builder reports (`test/ui/headless-boot.mjs`, `test/plugin/geometry-tokens.mjs`, `test/repo/citations.mjs`) are outside this step; citations verified identical in both trees above, the other two fail on an engine import that predates this step and have no dependency on the files changed here.

## For the next attempt
None
