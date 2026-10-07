## Task goal
Rebuild the Geometry system of ultimate-tokens on the Maison ui-kit geometry system (user decision 2026-10-07: "for the Geometry system, let's use the maison ui-kit system... we should name tokens according to our standards of course, but this is a standard system to follow for now"). Geometry's per-step text size still composes from the Type UI scale (project invariant).

## Step 7: Shell receives the geometry roles
level: L3
### Do
Depends on: steps 2 to 6 (`geomTokensSizesCSS`, `geomResolverCSS`, `_geomScaleFor`, the doc shape, a green headless boot). Handoff Decision 4: the shell rides with the engine; its selector groups are steps 8 to 11.
- `src/ui/app.js`:
  - On connect, and whenever the doc or the override changes, set the host attributes `data-tier`, `data-scale` and `data-radius` from the effective shell geometry, plus `data-size="md"`, next to `this.dataset.theme` (`:583`). The effective shell geometry is the app pref `this.shellGeometry` (null means follow the kit), else `doc.geometry` (defaults product, md, round).
  - Hold one style element on the instance, `this._geomRolesStyle`: created once with `document.createElement("style")`, `id = "ut-geometry-roles"`, appended to `document.head`, its `textContent` refreshed on every doc or override change, holding `geomTokensSizesCSS(sc) + "\n" + geomResolverCSS(sc)` for `sc = this._geomScaleFor("base")`, both with the default empty prefix. Never look it up with `document.getElementById`: the headless shim's returns null (`test/ui/headless-boot.mjs:106`), though it has `head` (`:102`). Prefix contract (step 2): roles and `--ctx-*` are never prefixed, so the aliases below read them unprefixed; the shell passes no prefix, so the primitives are the plain `--size-*` cells the resolver reads.
  - Persist `shellGeometry` with the other app prefs in `_loadAppPrefs`/`_saveAppPrefs` (`:2298`, `:2310`, the same store as `theme`).
- `src/ui/overlays/settings.js` `_settingsPanelAppearance` (`:151`): add a "Shell geometry" row offering Follow kit (the default) or an explicit tier, scale and radius. It writes `this.shellGeometry`, then calls `_saveAppPrefs()` and `render()`, like the App theme row at `:156-157`.
- `src/ui/styles.css`: add one alias block on the `ultimate-tokens` selector (beside `:74`), because the host carries the attributes and the `:root` block at `:18` does not. Fallbacks are the product-md-md round cell: `--sh-control-height: var(--control-height, 32px); --sh-control-inset: var(--control-inset, 8px); --sh-control-text: var(--control-text, 14px); --sh-control-icon: var(--control-icon, 16px); --sh-control-radius: var(--radius-control, 14px); --sh-radius-inset: var(--radius-inset, 10px); --sh-chip-height: var(--chip-height, 24px); --sh-chip-inset: var(--chip-inset, 5.5px); --sh-chip-text: var(--chip-text, 12px);`. No selector reads them yet. `--hh`, `--ch`, `--fh` (chrome heights, `:52-54`) and `--r-sm/--r/--r-lg` (`:45-47`) stay literal.
- `test/ui/headless-boot.mjs`: add groups `(shg1)` (a fresh doc's host carries product, md, md, round), `(shg2)` (a `doc.geometry` commit updates them), `(shg3)` (a Settings override wins over the doc) and `(shg4)` (`app._geomRolesStyle` has id `ut-geometry-roles` and is a child of `document.head`; its `textContent` matches `/(^|[;{\s])--control-height:/`, so a prefixed `--ut-control-height:` cannot satisfy it, and contains `--size-product-md-md-height:`).
- This host does not prove pixels: `npm run smoke` runs only in CI (`build-test`, `.github/workflows/ci.yml:41`).
### Acceptance criteria
- (red) `grep -qF 'data-tier' src/ui/app.js`
- (red) `grep -qF 'ut-geometry-roles' src/ui/app.js && grep -qF 'geomResolverCSS(' src/ui/app.js`
- (red) `grep -qF 'shellGeometry' src/ui/overlays/settings.js`
- (red) `for v in control-height control-inset control-text control-icon control-radius radius-inset chip-height chip-inset chip-text; do grep -qE "^ *--sh-$v: var\(--" src/ui/styles.css || exit 1; done`
- (red) `test "$(grep -cE '\(shg[1-4]\)' test/ui/headless-boot.mjs)" -ge 4`
- (guard) `node test/ui/headless-boot.mjs`
- (guard) `node test/ui/shell.mjs`
