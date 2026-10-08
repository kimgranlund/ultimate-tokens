<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/src/ui/app.js: imports `geomTokensSizesCSS`, `geomResolverCSS`, `TIERS`, `SCALES`, `RADIUS_MODES`. Adds the `this.shellGeometry` (null) and `this._geomRolesStyle` fields, both set before `_loadAppPrefs()`. New `_effectiveShellGeometry()` and `_applyShellGeometry()`, called from `render()` next to `dataset.theme`. `_applyShellGeometry` sets `dataset.tier/scale/radius` and `size="md"`. It also creates `<style id="ut-geometry-roles">` once in `document.head` and refreshes its text to `geomTokensSizesCSS(sc) + "\n" + geomResolverCSS(sc)`. `sc` is `_geomScaleFor("base")`, or `geomScale(DEFAULT_GEOMETRY)` in the gallery, where there is no doc. `_loadAppPrefs` validates and loads `shellGeometry`, `_saveAppPrefs` persists it, and `_resetAppPrefs` clears it. `disconnectedCallback` removes the style element.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/src/ui/overlays/settings.js: new `_shellGeometryRows()` in Appearance. The "Shell geometry" row offers Follow kit or Custom. Custom is seeded from the effective geometry and shows Shell tier, Shell scale and Shell radius rows. Each pick writes `this.shellGeometry`, then calls `_saveAppPrefs()` and `render()`. The Reset row text now also names shell geometry.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/src/ui/styles.css: one `ultimate-tokens { }` alias block after `:74` holding the nine `--sh-*` aliases, with the fallbacks exactly as the handoff gives them. `--hh/--ch/--fh` and `--r-sm/--r/--r-lg` are unchanged.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/test/ui/headless-boot.mjs: one `(shg)` block right after the boot (fresh doc) with groups `(shg1)` to `(shg4)`. It drives the Settings row by clicking `data-fk` buttons, and restores the doc and the override afterwards so the later groups see no change.

## Checks
- `grep -qF 'data-tier' src/ui/app.js`: pass.
- `grep -qF 'ut-geometry-roles' src/ui/app.js && grep -qF 'geomResolverCSS(' src/ui/app.js`: pass.
- `grep -qF 'shellGeometry' src/ui/overlays/settings.js`: pass.
- The `--sh-*` loop over the nine names in `src/ui/styles.css`: pass.
- `test "$(grep -cE '\(shg[1-4]\)' test/ui/headless-boot.mjs)" -ge 4`: pass.
- (guard) `node test/ui/headless-boot.mjs`: exit 0, "HEADLESS BOOT PASS".
- (guard) `node test/ui/shell.mjs`: exit 0, "PASS".
- `node test/repo/em-dash.mjs`: clean.
- `npm test` (floor from CLAUDE.md, not a step criterion): red, 2 of 54 files failed. Both were then run at base `ddfe4652` in a throwaway worktree under `.worktrees/tmp/builder-L3-geometry-maison-ladder-s7/base`, which has since been removed:
  - `test/plugin/geometry-tokens.mjs`: same failure in the tree and at base, a TypeError at `dimension-parity.mjs:20` (`Object.keys(sLadder.sizes)` on undefined), "geometry-tokens skill drifted from the geometry engine". This is inherited.
  - `test/repo/citations.mjs`: base has 8 failures, the tree has 9. Both include the same two stale symbol homes (`setGeomTokenOverride`, `buildSizeLadder`). The tree adds more stale line citations in `component-inventory.md`, `app-shell.md` and the `2026-08-20-reactivity` reports, and `04-context-and-messaging.md` is newly stale.

## Notes
- The extra stale citations in `citations.mjs` come from this step's line insertions in `app.js` and `styles.css`. The docs that hold those citations are outside this step's file list, so none of them were touched. Re-homing them (e.g. with `node scripts/audit-citations.mjs`) is for the planner or a later step to decide.
- `_saveAppPrefs` writes the `shellGeometry` key only when the override is set. A null override means "follow the kit", and leaving the key out is how that state is saved. This is deliberate: the existing `(pref)` assertion at `headless-boot.mjs:2342` requires the record's keys to be exactly theme, motion and fontMode. `(shg3)` checks that the key appears once an override is set.
- The host attributes are set through `this.dataset.tier/scale/radius/size`, the same path as `this.dataset.theme`. In a browser they become real `data-tier`/`data-scale`/`data-radius`/`data-size` attributes. The `data-tier` grep also matches the method's comment.
- `npm test` regenerated `figma/plugin/ui.html` from the changed app.js and styles.css. I restored it with `git checkout` under rule 6, so the tree diff is only the four files above. A verifier's own `npm test` run will regenerate it again.
- Pixels are not checked on this host. `npm run smoke` runs in CI only.
