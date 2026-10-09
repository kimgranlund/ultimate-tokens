<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- (red) section files free of `html:`/`<svg`/`an-svg`/`fill: none`, geometry.js imports renderChart: pass. Evidence: loop over `src/ui/sections/*.js` printed no `bad`, import grep printed `c1ok`. Red control at base c1d10091 (throwaway worktree): `bad src/ui/sections/geometry.js`. Process deviation (red-checkpoint missing) noted; I ran the base control myself.
- (red) node shim structure check of `geomAnalysisCards`: pass. Evidence: exit 0 on the built tree with tiers [content, product, micro], 2 `ch-rect`, 2 `gc-pad` rules, 3 ribbons and 30 dots (2 x 15 heights) in the power card, 3 tier ribbons with 1 `gp-font` and 9 kit dots in the bands card, all three cards `clean: true`. At base the same span gave `rb2: 0, dots2: 0, clean: [false, false, false]`, so it bites.
- (red) dom-charts allowlist is empty: pass. Evidence: `dom-charts: 0 html: attributes in 0 allowlisted chart functions (color 0, geometry 0, typography 0), 0 line classes qualified with fill: none`; grep for the three function names in `test/repo/dom-charts.mjs` found nothing. At base it printed `3 html: attributes in 3 allowlisted chart functions`, so the span is red there.
- (red) styles.css has no `an-svg`/`stroke`, `.gp-ref` has `--dash`, `.gc-cell` has `border`: pass. Evidence: grep for `an-svg|stroke` empty; `src/ui/styles.css:1571` (`.gp-ref ... --dash`), `:1567` (`.gc-cell { border: ... }`). Base: `! grep -qE 'an-svg|stroke'` exits 1 (red). `.gp-dot*` rules gone; `--dash`, `--chart-ref` and `--rule-style` are consumed by `.ch-ribbon`/`.ch-rule` at `:487-490`.
- `node test/ui/headless-boot.mjs` plus `graphGeomPower({ cells: {} })` grep: pass. Evidence: `HEADLESS BOOT PASS`, grep printed `grepok`.
- (guard) `node scripts/bundle.mjs`: pass. Evidence: `wrote dist/ultimate-tokens.html 4187.8 KB`, exit 0.
- (guard) `node test/ui/charts.mjs`: pass. Evidence: `charts: core ... and renderChart pass`.
- (guard) `node test/repo/citations.mjs`: pass. Evidence: `STALE 0 across 12 discovered docs`.
- (guard) `node test/repo/em-dash.mjs`: pass. Evidence: `em-dash: clean (1642 files scanned)`.
- (guard) scope diff against base sha: pass. Evidence: the guard command printed `scopeok`; tracked changes are the 8 files listed under Out of scope changes.
- Floor `npm test`: pass. Evidence: `all 56 test files passed`; tracked tree unchanged afterwards beyond the same 8 files.

## Out of scope changes
None. Changed files: `src/ui/sections/geometry.js`, `src/ui/styles.css`, `test/repo/dom-charts.mjs`, `figma/plugin/ui.html` (regenerated), `docs/references/component-inventory.md`, `docs/specs/app-shell.md`, `docs/reports/2026-08-20-reactivity/00-synthesis.md` and `02-sections-and-resolvers.md`, all in the allow list. No pixel or real-browser check ran; rects and the 3px `gc-pad` rule are first-use marks, so a smoke or Safari look is still open (builder flagged the same).

## For the next attempt
None
