<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
fail

## Criteria
- Select triggers (criterion 1): fail. The live shell selects pass. The inspector example `<select>` has no chevron.
  - Verification: `npm run smoke` with Chrome Beta passed, including "control polish at product-md/content-lg: 2 selects styled with a chevron". That check skips `.example-scheme`, `.seg-example` and any `ex-` class.
  - My own CDP probe computed styles on every `<select>` in light and dark, at product-md and content-lg, across Color global, Color palette, Mapping, Typography, Geometry, the Export drawer, Settings and New Palette. Script: `/private/tmp/claude-501/-Users-kimgranlund-Projects-nonoun-ultimate-tokens/f65363d5-c8db-4b09-939e-fbae33813f48/scratchpad/v0036/probe.mjs`.
  - Every visible one computes `appearance: none` with a `linear-gradient` chevron and end padding larger than start. Examples: 8px start / 24px end at product-md, 16px / 48px at content-lg, and `.map-raw-select` 5.5px / 19.5px. The background is `rgb(231,232,234)` in light and `rgb(24,24,27)` in dark, with matching text colour. The parent build had `appearance: auto`, no gradient, and equal 8px padding.
  - The select source sites are all covered: drawer.js:183, color.js:1268/1734/2027/2052, geometry.js:583, typography.js:618, app.js:2219.
  - Defect: the example select in the pinned "surface · onSurface" cards (`app.js:2219`, class `ex-input ex-select`), visible once "Show 2 more examples" is expanded, computes `appearance: none`, `background-image: none`, padding 8px / 8px, width 54px. `fieldStyle` (`app.js:2208`) sets an inline `background:` shorthand, which resets `background-image`, so the new `--select-chevron` on that element never draws. The parent build showed the native chevron here (`appearance: auto`, width 74px). `/private/tmp/claude-501/-Users-kimgranlund-Projects-nonoun-ultimate-tokens/f65363d5-c8db-4b09-939e-fbae33813f48/scratchpad/v0036/head2/exselect.png` shows the "Select" box with no chevron. Neither smoke nor `ui-polish.mjs` covers it.
- Range inputs (criterion 2): pass.
  - Track height is 6.39px at product-md and 12.80px at content-lg, against 4px before.
  - The `--ctl-range-thumb` thumb is 1.25 times the icon role, 20px at product-md against the previous 12px.
  - The inspector crops `head3/inspector.png` and `base3/inspector.png` (same scratchpad dir) show the thumb and track visibly larger.
  - Smoke "14 sliders at the icon role" passed, and `ui-polish` pins both `::-webkit-slider-thumb` and `::-moz-range-thumb` to the role.
- No Back to Global button (criterion 3): pass.
  - Real DOM: `.pane-back` plus `Global` buttons is 0 now and 2 on the parent build.
  - A real Escape key event deselected to "Global".
  - A real mouse click on empty canvas at (305, 450) went from "Palette: Primary" to "Global" on both the build and the parent.
  - Headless group `irf` passed in `npm test`.
- Prime swatch strips and the New Palette row (criterion 4): pass.
  - Smoke reported 8 `.prime-strip`s at each geometry, gapless with seven equal swatches spanning the strip, at the same width as the ramp strip.
  - `head2/chain.png` shows the New Palette "Context priority" row as one gapless strip.
  - Probe measure of that row: column gap 0px, 12 swatches about 33.67px each, spanning 730 to 1134 px, the full row. The parent had 6px gaps, 22px fixed swatches, and spanned only to 1060.
- Gates (criterion 5): pass.
  - `SDLC_GATE_WORKERS=10 npm test` printed "all 59 test files passed", including `repo/ui-polish.mjs`, `repo/control-text.mjs` and `repo/em-dash.mjs`.
  - `npm run smoke` rebuilt `dist` and printed "SMOKE PASS". The negative control for a select forced back to `appearance: auto` passed.
  - `node scripts/audit-citations.mjs` printed all OK and exited 0.
- Real-browser check of the screenshots and theming: pass, except the example select above. The chevron follows the theme in light and dark (`dark-product-md-drawer.png`, `light-product-md-color-palette.png`).
- Negative controls: `ui-polish.mjs` runs each check against a known-bad sample first. The smoke select check has the `appearance: auto` control. Both can go red.

## Out of scope changes
None. The diff from the parent covers `src/ui/{app.js,styles.css}`, `test/{repo/ui-polish.mjs,repo/control-text.mjs,run.mjs,smoke/smoke.mjs,ui/headless-boot.mjs}`, docs citation and spec updates, and the regenerated `figma/plugin/ui.html`. The last commit also touches `test/smoke/smoke.mjs` and the handoff.

## For the next attempt
Fix the example select at `src/ui/app.js:2208` and `src/ui/app.js:2219`. The inline `background:` shorthand in `fieldStyle` clears `background-image`. Use `background-color:` in the inline style, or move the example select's chevron to a non-shorthand path, so the drawn chevron and the end-padding lane apply to `.ex-select`.

Then add a check that can fail for it. Either stop excluding `.example-scheme` and `.seg-example` for selects in the smoke "control polish" probe, or add a dedicated `.ex-select` assertion. It should require `appearance: none`, a `linear-gradient` `background-image`, and end padding greater than start padding. Run it red on the current tree first.
