<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- Select triggers, including the pinned `.ex-select` (criterion 1): pass. Evidence: CDP probe on the built `dist/ultimate-tokens.html` (Chrome Beta), `examplesExpanded=true`, light and dark, product-md and content-lg, across Color global, Color palette, Mapping, Typography, Geometry, Export drawer, Settings and New Palette. Every visible `<select>` computed `appearance: none`, a `linear-gradient(45deg, ...)` background-image and end padding above start padding (allok=true in all 40 rows). `.ex-select` shows ap none, gradient chevron, padding 8px / 24px at product-md and 8px / 48px at content-lg, in the Color global, Color palette and Mapping views; its background colors are rgb(231,232,234) and rgb(24,24,27) with matching text color. Probe script: `/private/tmp/claude-501/-Users-kimgranlund-Projects-nonoun-ultimate-tokens/f65363d5-c8db-4b09-939e-fbae33813f48/scratchpad/v0036/probe-ex.mjs`. The prior failure (padding 8/8, no gradient) is gone.
- Range inputs (criterion 2): pass (quick re-check). `npm run smoke` printed "control polish at product-md" and "content-lg" with 18 sliders at the icon role; `test/repo/ui-polish.mjs` passes in `npm test`.
- No Back to Global (criterion 3): pass (quick re-check). Smoke "no Back to Global" holds at both geometries; headless group `irf` passed within `npm test`.
- Prime strips and the New Palette row (criterion 4): pass (quick re-check). Smoke reports 8 prime strips gapless and full width at both geometries; `ui-polish.mjs` passes.
- Gates (criterion 5): pass. `SDLC_GATE_WORKERS=10 npm test` printed "all 59 test files passed". `npm run smoke` (CHROME_BIN set to Chrome Beta) printed "SMOKE PASS", including both control-polish checks ("2 selects and 4 pinned example select(s) styled with a chevron") and the select negative control. `node scripts/audit-citations.mjs` exited 0, all OK. The tree was clean after the runs, apart from the verifier's own `.sdlc` files.
- New checks go red without the fix: pass. In a throwaway worktree at HEAD (fix reverted: `fieldStyle` back to `"background:"`, `.ex-select` rule removed), `node test/repo/ui-polish.mjs` exited 1 with `FAIL ui-polish: the pinned example select keeps the chevron lane...`. `npm run smoke` there printed `example select draws no chevron (none)` and `example select end padding 8 does not reserve the chevron lane (start 8)`, then `SMOKE FAIL (2)` for control polish at both product-md and content-lg. The worktree is removed (`git worktree list` shows none).
- Fix diff (795c4ace): `src/ui/app.js:2208` uses `background-color:`; `src/ui/styles.css` adds `.ex-select { padding-inline-end: var(--select-lane); }`; the smoke probe and `ui-polish.mjs` gain `.ex-select` assertions with a bad-sample control.

## Out of scope changes
None. Commit 795c4ace touches `src/ui/{app.js,styles.css}`, `test/repo/ui-polish.mjs`, `test/smoke/smoke.mjs`, the regenerated `figma/plugin/ui.html`, and `.sdlc/ui-polish-controls` records.

## For the next attempt
None
