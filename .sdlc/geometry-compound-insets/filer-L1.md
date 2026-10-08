<!-- role=filer level=L1 model=sonnet effort=medium -->
## Warnings
None

## PR title
T-0027: Compound insets for container components, square ghost icon buttons, and common control text rules

## PR body
### Summary
Adds a compound-inset law to the geometry engine. Each cell now carries `partHeight` and `partInset`, emitted as `--control-part-height` and `--control-part-inset`. A container takes half the part's inset as padding, and its radius is the part radius plus that padding, so corners stay concentric. The shell's segmented controls and file pickers use this. Icon-only buttons are now borderless, transparent, control-height squares. Button, segment, select and chip text sizes now come from the same cell roles, and a static gate plus a smoke check enforce it. Also folds in the PR #813 shell review follow-ups.

### Changes
- Step 1, engine: the cell grows from 14 to 16 fields (27 × 16 = 432 size/ FLOATs, 144 control/ ALIASes). `CELL_FIELDS` is exported and reused by `ds-export.js` and the Geometry section. `menuPad` now reads the cell's `partInset`. The role-count pin in `dimension-parity.mjs` moves from 13 to 15. This edit was outside the handoff's Do and was needed for the parity criterion. Doc citations into `sections/geometry.js` move by -7.
- Step 2, records: updated the geometry README, the geometry-system, maintaining-figma-plugins and consumer geometry-tokens skills, the MCP descriptions, and added ADR-033.
- Step 3, shell: one compound container rule now covers `.segmented`, `.figma-files` and `.radix-files`. `btn()` and `paneToggle` emit `icon-only`. Removed `seg-sm` and the old per-picker rules. New headless group `(cpd)` and a smoke compound block with pixel captures at product-md and content-lg.
- Step 4, control text: added `test/repo/control-text.mjs`, a static gate with negative controls. Fixed or excluded the offenders: `.pane-back`, `.toggle`, `.tyi-voice-name`, and `.key-slot` (excluded as swatch tiles). The `--hh` and `--ch` chrome bands now grow with the control height. Smoke adds a `control text at` check.
- Step 5, PR #813 follow-ups:
  - `icon()` honors an explicit `size`.
  - `_applyShellGeometry` scopes its injected CSS to its own host, using a keyed `ut-geometry-roles-<key>` style id.
  - `geomTokensBreakpointCSS` writes `:where(:root)`.
  - New `(geometry-discriminate)` leg in `test/engine/categories.mjs`, using a synthetic fixture. The corpus count of spec palettes carrying `geometry` is 0 and is reported, not asserted.
  - Updated the `building-editor-sections` skill, `responsive.md` and the 93 `src/ui/app.js` doc cites.
- Step 6: run report at `docs/reports/2026-10-08-geometry-compound-insets.md`. No source change.

### Verification
All six steps got a verifier pass.
- `npm test`: 55 test files passed, exit 0 in 336 s. The asset shasum was equal before and after.
- `npm run build`: exit 0.
- `npm run smoke` (real Chrome): `SMOKE PASS`, 108 resolver cases including the part roles, `compound at` and `control text at` (135 controls each) at product-md and content-lg.
- `gate:corpus-reset`: exit 0. Seven color legs: exit 0. The verifier re-ran four of them (mode-isolation, corpus-contrast, even-dips, chroma-envelope) and accepted corpus-tonal, corpus-anchor and sweep-prime on the builder's report.
- Pixel check: the verifier opened `smoke-out/compound-product-md.png` and `smoke-out/compound-content-lg.png`. Segmented controls show an even padding ring and concentric corners. Icon buttons are borderless control-height squares. Nothing clips at product-md.
- Measured engine `md` cells match within 0.5 px:
  - product-md: outer 32, part 24, padding 4, radius 14 = 10 + 4.
  - content-lg: outer 64, part 48, padding 8, radius 22 = 14 + 8.

Not covered: Safari (smoke is Chrome only) and `panda-smoke` (CI only).

## Changelog entry
- Geometry: the cell now has 16 fields, adding `--control-part-height` and `--control-part-inset` for compound containers. A container takes the part's inset as padding and its radius is the part radius plus that padding. The segmented and file-picker controls use it, and the new roles flow through CSS, DTCG, Figma, MCP and the consumer skills (ADR-033).
- Shell: icon-only buttons are borderless, transparent, control-height squares. Button, segment, select and chip text sizes follow the cell's text size, and control labels no longer wrap.
- Geometry roles are scoped to their own host, and an explicit icon `size` is honored.

## Follow-ups
- decide: the canvas header clips its trailing tools (recenter, zoom, "+ Palette") at content-lg, seen in `smoke-out/compound-content-lg.png`. It needs a choice between wrapping, scrolling and collapsing, and no gate checks horizontal fit.
- decide: the palette Name field (`input[data-fk="pname"]`) is item 1 of the ticket. No artifact shows a dedicated style change for it, and the only evidence is that the `control text at` smoke covers it in Chrome. Confirm it looks right in Safari, or say what is still missing.
- fix-now: at viewport widths up to 1240px, `.app-header button, .canvas-header button { padding: 4px 7px; }` in `src/ui/styles.css` (~:1579) ties `button.icon-only` on specificity and comes later. Header icon buttons get padding back, and `.canvas-seg button` can grow past the part height. Smoke runs at 1440x900, so it misses this.
- fix-now: `typeTokensBreakpointCSS` in `src/engine/type.mjs` still writes `:root {` while `geomTokensBreakpointCSS` now writes `:where(:root) {`.
- fix-now: the stale `ramp` comment at `figma/binder/mode-apply-plan.mjs:250` was left for T-0026.
- note: Safari is unproven for the compound insets, the control text sizes and the square icon buttons. Smoke runs in Chrome only, and the user previews in Safari.
- note: the three micro cells (micro-sm-sm, micro-sm-md, micro-md-sm) have a chip taller than the part. The step 1 test names them literally as exceptions to the compound law.
- note: `.account-license-input`, `.tok-input`, `.settings-nav-item` and `.linklike` sit outside the selector list in `test/repo/control-text.mjs`, by design.
- note: step 5 moved 93 `src/ui/app.js` doc cites by number, so a concurrent lane that edits `src/ui/app.js` will conflict on them at merge.
- note: two PR #813 pixel-review items stay open in `.sdlc/notes.md`, the faint light-theme headings and the micro-sm switch, because no record says what was seen.
- note: `panda-smoke` runs only in CI, so it has not been seen green for this branch.
