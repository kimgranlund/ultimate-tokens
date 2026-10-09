## Task goal
The editor shell is one standardized UI: a single text-role system, one inset and radius composition rule for every container, one anatomy table for every control, one glyph motion set, all derived from the Maison ladder cell, with the shell defaulting to the product tier, sm scale, md size.

## Step 10: Product-sm default cell, Follow kit and Custom, and the smoke matrix in light and dark
level: L4
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
- `docs/reports/AGENTS.md`
### Do
Depends on: step 9. This step owns the default-cell change and all its pixel checks (conductor note 5).
1. `src/ui/app.js`:
   - Add `const SHELL_DEFAULT_GEOMETRY = Object.freeze({ tier: "product", scale: "sm", radius: "round" });` beside `geomHostSeq`. The user ruled product tier, sm scale, md size; the architect proposed round radius, and the user approved the tables.
   - `shellGeometry` becomes three states: `null` (fresh install or Reset) resolves to `SHELL_DEFAULT_GEOMETRY`; the string `"kit"` follows `doc.geometry`, else `DEFAULT_GEOMETRY` (the gallery has no doc); an object pins a custom cell.
   - `_effectiveShellGeometry` (~:2508) implements those three states.
   - `_loadAppPrefs` (~:2484) accepts `"kit"` as well as a valid object.
   - `_saveAppPrefs` (~:2501) writes `shellGeometry` whenever it is not null.
   - `_resetAppPrefs` keeps `null`.
   - Update the constructor comment (~:127). A pre-T-0044 record with no `shellGeometry` key lands on the default, which is the ruling.
2. `src/ui/overlays/settings.js` `_shellGeometryRows` (~:176):
   - Options `[{ id: "default", label: "Default" }, { id: "kit", label: "Follow kit" }, { id: "custom", label: "Custom" }]` with fk `setshellgeom`.
   - Current value: `null` is `"default"`, `"kit"` is `"kit"`, an object is `"custom"`.
   - Setter: Default sets null, Follow kit sets `"kit"`, Custom sets `{ ...this._effectiveShellGeometry() }`.
   - The tier, scale and radius rows show only for an object.
   - Copy: "The editor chrome's control sizes and corners. Default is product, sm; Follow kit uses this document's Geometry; Custom pins a tier, scale, and radius on this device."
3. `src/ui/styles.css`: the `--sh-*` alias fallbacks move to the product-sm-md round cell, and the comment says so. Values: height 28px, inset 7px, text 13px, icon 14px, radius-control 13px, radius-inset 9.5px, part-height 21px, part-inset 3.5px, chip-height 20px, chip-inset 4.5px, chip-text 10px.
4. `test/ui/headless-boot.mjs` group `(shg)`:
   - shg1: a fresh app has `shellGeometry === null` and host `product,sm,md,round`.
   - shg2: first pick Follow kit (`setshellgeom:kit`, so `app.shellGeometry === "kit"`); then a `doc.geometry` commit moves the host, and undo restores it.
   - shg3: Custom wins over the doc and persists. Follow kit stores `"kit"` in the app-prefs record. Default (`setshellgeom:default`) returns to `null` and `product,sm,md,round`.
   - New `(shg8)`: `localStorage` records loaded through `app._loadAppPrefs()`. One with no `shellGeometry` key leaves `null`. One with `"kit"` loads `"kit"`. One with a bad object leaves `null`.
   - Restore `null` before the groups below.
5. `test/smoke/smoke.mjs`:
   - Every `[["product", "md", ...], ["content", "lg", ...]]` matrix becomes product-sm and content-lg: compound (~:316), control text (~:350), polish (~:390) and header fit (~:451), including the comment at ~:440.
   - Compound and polish also loop the theme, `light` then `dark`, set as the charts matrix sets it (`el.theme = "<theme>"; el.render()`, ~:290-296), and restore `system` after.
   - PNGs are `compound-<tier>-<scale>-<theme>.png` and `polish-<tier>-<scale>-<theme>.png`.
   - The compound ok label is `compound at <tier>-<scale> <theme>: ...`. The control text label keeps `control text at <tier>-<scale>: ...`.
   - The `shellGeometry = null` resets now mean the product-sm default.
6. Add a reduced-motion read to smoke, after the polish setup at product-sm, on the first `.ex-collapse-toggle .caret`:
   - With `el.motion = "reduced"` and a render, `getComputedStyle(caret).transitionDuration`, parsed to seconds, is below 0.001. `app.js:632` stamps `data-motion`.
   - With `el.motion = "system"` and a render, it is at least 0.1 (headless Chrome emulates no OS preference).
   - Label: `reduced motion: the disclosure caret's transition-duration is under 1ms with Motion Reduced and at least 100ms with Motion System`.
7. `.claude/skills/building-editor-sections/SKILL.md` (~:99-100), the `_effectiveShellGeometry` bullet: rewrite it to name `SHELL_DEFAULT_GEOMETRY` (product, sm, round), `"kit"` following the doc, and Custom.
8. Citations: repair STALE `app.js:N`, `styles.css:N` and `settings.js:N` cites by number in `docs/references/component-inventory.md`, `docs/specs/app-shell.md` and `docs/reports/2026-08-20-reactivity/0*.md`.
9. Run `npm run smoke` with `CHROME_BIN` set to Chrome Canary. It runs `npm run build` first, which needs `node_modules` (`npm ci` in the lane if absent). Then open the eight PNGs and record in the builder file what you saw:
   - interactive chips at control height, badges compact, kickers in `--ink-dim`
   - the pane titles
   - no chrome overflow at content-lg
### Acceptance criteria
- (red) `grep -qE 'const SHELL_DEFAULT_GEOMETRY = Object\.freeze\(\{ tier: "product", scale: "sm", radius: "round" \}\);' src/ui/app.js`
- (red) `grep -qF '[{ id: "default", label: "Default" }, { id: "kit", label: "Follow kit" }, { id: "custom", label: "Custom" }]' src/ui/overlays/settings.js`
- (red) `grep -qF 'product,sm,md,round' test/ui/headless-boot.mjs && grep -qF 'setshellgeom:default' test/ui/headless-boot.mjs && grep -qF '(shg8)' test/ui/headless-boot.mjs && node test/ui/headless-boot.mjs`
- (red) `for s in compound-product-sm-light.png compound-product-sm-dark.png compound-content-lg-light.png compound-content-lg-dark.png polish-product-sm-light.png polish-content-lg-dark.png "reduced motion: "; do grep -qF -- "$s" test/smoke/smoke.mjs || exit 1; done && ! grep -qE '\["product", "md"' test/smoke/smoke.mjs`
- (red) `grep -qE '^ *--sh-control-height: var\(--control-height, 28px\);' src/ui/styles.css && grep -qE '^ *--sh-control-text: var\(--control-text, 13px\);' src/ui/styles.css && grep -qE '^ *--sh-chip-text: var\(--chip-text, 10px\);' src/ui/styles.css`
- (red) `grep -qF 'SHELL_DEFAULT_GEOMETRY' .claude/skills/building-editor-sections/SKILL.md && ! grep -qF 'null follows the kit' .claude/skills/building-editor-sections/SKILL.md`
- `out=$(CHROME_BIN="/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name smoke -- npm run smoke 2>&1) && for s in "SMOKE PASS" "✓ compound at product-sm light" "✓ compound at product-sm dark" "✓ compound at content-lg light" "✓ compound at content-lg dark" "✓ control text at product-sm" "✓ control text at content-lg" "✓ reduced motion:"; do printf "%s\n" "$out" | grep -qF -- "$s" || exit 1; done && for p in compound-product-sm-light compound-product-sm-dark compound-content-lg-light compound-content-lg-dark polish-product-sm-light polish-product-sm-dark polish-content-lg-light polish-content-lg-dark; do test -s "smoke-out/$p.png" || exit 1; done`
- (guard) `node test/repo/citations.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/sections src/ui/icons.js src/ui/shell-roles.mjs test/repo scripts docs/references/decision-records.md)$(git ls-files --others --exclude-standard -- src/ui/sections test/repo scripts)"`
