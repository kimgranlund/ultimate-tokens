<!-- role=verifier level=L1 model=sonnet effort=medium -->
## Verdict
pass

## Criteria
- C1 (no `html:`, `<svg` or `an-svg` in typography.js, plus the `renderChart` import): pass. The grep count is 0 and the import line matches. At base the same file has 37 `an-svg` or `<svg` hits, so the check can go red.
- C2 (DOM-stub run of the first 3 cards): pass. Exit 0. It requires `an-chart`, no `an-svg`, no `innerHTML`, one `ch-ribbon` per multi-step voice, one `ch-dot` per step, `ty-mono` on exactly the `-mono` ribbons, polygon clip-paths with no NaN, and a `ch-rule dg-unity` in the tracking card.
- C3 (`node test/repo/dom-charts.mjs`): pass. It printed `color 0, geometry 3, typography 0`, and no typography function names remain in the file.
- C4 (styles.css greps): pass. `.ty-mono` carries `--dash`, no `.ty-sN` rule sets `stroke` or `fill`, and `ty-line` and `ty-dot` are gone.
- Headless boot: pass. `HEADLESS BOOT PASS`, and `app.graphTypeScale([])` is still in `test/ui/headless-boot.mjs`.
- (guard) `node scripts/bundle.mjs`: pass. It wrote dist/ultimate-tokens.html.
- (guard) `node test/ui/charts.mjs`: pass.
- (guard) `node test/repo/citations.mjs`: pass. STALE 0.
- (guard) `node test/repo/em-dash.mjs`: pass. Clean.
- (guard) scope: pass. The diff against base is only `figma/plugin/ui.html`, `src/ui/sections/typography.js`, `src/ui/styles.css` and `test/repo/dom-charts.mjs`, all on the allowlist.

I did not re-run `npm test` myself. The builder reports it green across 56 files, and the focused checks above pass.

## Out of scope changes
None. `figma/plugin/ui.html` is regenerated output and is on the allowlist.

## For the next attempt
None
