<!-- role=filer level=L1 model=sonnet effort=medium -->
## Warnings
- process deviation: red-checkpoint (step 4): missing: attempt a8068a5bd4404f18808d17d786989ba0, handoff sha256 2f391e6bb9de, 3 of 3 (red) criteria without a pre-edit red control: `node --input-type=module -e 'const mk = (t) => ({ tagName: t.toUppe...`; `test -f test/repo/dom-charts.mjs && out=$(node test/repo/dom-charts...`; `! grep -qE 'an-svg|stroke' src/ui/styles.css && grep -qE '^[.]gp-re...`. The step 4 verifier ran the base-commit controls itself and got red on all three, then passed the step.
- Step 5 has no `process-deviations.md`, but `red-checkpoint.jsonl` there holds 5 lines for 6 `(red)` criteria. The ADR criterion (73) has no pre-edit control. The builder and verifier both say so. The verifier ran the control by hand (`git show HEAD:docs/references/decision-records.md | grep -c 'Analysis charts are native DOM'` printed 0), so it is red at the pre-build HEAD.
- All five steps passed. These checks were not run:
  - Safari/WebKit was never run.
  - The 390px viewport check the handoff asks for was not done.
  - The step 5 verifier's visual check covered the rail only, in headless Chrome at 1440x2400, light and dark.
  - Step 2's verifier did not re-run `npm run smoke`. Step 5 later ran it, and it passed.
- Step 4 builder said rects and the 3px `gc-pad` rule were first-use marks with no real-browser look. The step 5 smoke and visual check cover them in Chrome.
- Step 2 first blocked on a plan defect: `npm test` failed because `scripts/bundle.mjs` rejected the new `src/ui/charts/` imports. The conductor widened the step's scope, and `bundle.mjs` now registers `chartsCore` and `chartsRender` (commit 6445ea08). The first attempt is kept as `step-2.superseded-1`.
- Nothing from steps 3 to 5 is committed; the work is in the tree.

## PR title
T-0029: Rebuild the app's analysis charts as native DOM (HTML/CSS marks)

## PR body
Summary

All 12 analysis charts that were hand-built SVG strings set through `h("div", { class: "an-svg", html })` are now native DOM. Marks are HTML elements styled with CSS: line strokes are clip-path polygon ribbons, and dashes use `mask-image` with a `-webkit-` twin. The `html:` path is retired from `h()`. Zero runtime deps, engines stay pure, `h()` hyperscript, no SVG or Canvas. The source project at `/Users/kimgranlund/Projects/nonoun/native-dom-charts` was used as a reference for principles and techniques, not as a dependency.

Changes

- Step 1: new pure core `src/ui/charts/core.mjs` and renderer `src/ui/charts/render.mjs`.
  - Core: `scaleLinear` (non-finite input gives NaN, never 0), `runs` (a missing sample breaks the line), `ribbon`, `band`, `polar`, `resolveChart`, `sourceRows`.
  - Renderer: `renderChart(spec)` builds `div.an-chart` and an aria-hidden marks layer. It also builds a `table.vh` accessible source table.
  - Tests: `test/ui/charts.mjs`, registered in `test/run.mjs`.
  - Gate: `test/repo/svg-rules.mjs` renamed to `test/repo/dom-charts.mjs`, with a per-file allowlist.
  - Record: interim `.claude/CLAUDE.md` bullet.
- Step 2 (Color): `graphLC`, `graphTone`, `graphChroma`, `graphContrast`/`graphDamping`, `graphHueWheel` and the hue/chroma disc now use `renderChart`.
  - New chart CSS block and series paint in `styles.css`; SVG-only rules deleted.
  - `headless-boot` q3 and the smoke `.newpal-hc .ch-dot` query updated.
  - `scripts/bundle.mjs` registers the two new modules.
  - Citation line numbers repaired in the inventory, app-shell and reactivity reports.
- Step 3 (Typography): `graphTypeScale`, `graphTypeTracking` and `graphTypeLeading` ported, with one series per voice (`ty-s0` to `ty-s14`, `ty-mono` for mono voices). Title and Kicker lose their dashes and Body-mono gains one (the planner's dash correction).
- Step 4 (Geometry): `graphGeomCentering` (2 rects, 2 `gc-pad` rules), `graphGeomPower` and `graphGeomBands` ported. `.an-svg`, `.gp-dot*` and the other SVG chart CSS are deleted from `styles.css`. The `dom-charts` allowlist is now empty. Citations shifted by script.
- Step 5:
  - Removed the `html` branch from `h()` in `app-helpers.mjs`.
  - `dom-charts.mjs` rewritten to assert 0 `html:` and 0 `<svg` in `src/ui/sections/*.js`, no `innerHTML` in `h()`, and none in `src/ui/charts/*.mjs`.
  - New smoke block saves `charts-<section>-<theme>.png` for color, typography and geometry in light and dark, and asserts the `.an-chart` minimums, non-zero ribbon boxes with no NaN, the mono mask and the 2 centering rects.
  - Records updated: `.claude/CLAUDE.md` (the "12 live attributes" and `fill: none` conventions replaced), `building-editor-sections` skill and three references, `change-reviewer-agent`, `component-inventory.md`, and ADR-035 (status PROPOSED) before the Quick map in `decision-records.md`.
  - `figma/plugin/ui.html` regenerated on purpose.

Verification

- Every step has a pass verdict from an independent verifier.
- `(red)` criteria were seen failing at the base commit.
- Floor `npm test` is green at 56 test files (`gate_lock.py`).
- `npm run build` is green.
- `npm run smoke` is green, with all 18 new chart assertions and the six chart PNGs present and non-empty.
- `gate:corpus-reset` and the seven colour sweep legs are green.
- `node test/repo/citations.mjs` reports STALE 0, and `node test/repo/em-dash.mjs` is clean.
- The step 5 verifier viewed the rails of all three sections in light and dark and found no broken, empty or NaN chart. Typography's many series are dense and close in colour.
- Not verified: Safari/WebKit (`clip-path: polygon()`, `aspect-ratio`, `mask-image`, `color-mix`) and the 390px viewport.
- Process deviations: see Warnings.

## Changelog entry
- Changed: the analysis charts in the Color, Typography and Geometry rails are native DOM (HTML/CSS marks built by a new `renderChart` helper) instead of injected SVG strings. `h()` no longer accepts `html:`, and `test/repo/dom-charts.mjs` gates against any `html:` or `<svg` in the section files. Each chart now ships an accessible source table.

## Follow-ups
- fix-now: Add the 390px viewport pixel check for the three rails, which the handoff requires and no step ran.
- decide: ADR-035 is written as PROPOSED, and Safari/WebKit rendering of the ribbons, masks and rects (dev browser) is unverified. The user needs to review the ADR and the Safari look before it is ratified.
- note: Main has moved past this lane's merge base. A resync will conflict on `scripts/bundle.mjs` `MODS`, `test/smoke/smoke.mjs` and the `decision-records.md` append (ADR-035 follows main's ADR-034). Citation repairs may need redoing.
- note: The mask-dash encoding may read poorly on steep runs, such as the geometry height diagonal and non-kit tier lines. The fallback is CSS only: drop `--dash` from the class.
- note: `.sdlc/baseline.md` still shows `npm test` at 54 test files (now 56), and `.sdlc/architecture.md`'s DD4 row cites the retired CLAUDE.md line. Neither is part of `npm test`, so re-measure at pre-land.
