---
id: T-0029
title: "Rebuild the app's analysis charts as native DOM (HTML/CSS marks) following /Users/kimgranlund/Projects/nonoun/native-dom-charts"
type: feature        # feature | bug | chore | spike | idea
status: done     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L4
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
User ruling 2026-10-08: "for charts and graphs, you can learn how to do them properly here /Users/kimgranlund/Projects/nonoun/native-dom-charts", and, asked what to do with its rules, they chose "Rebuild charts as native DOM". Replace the app's analysis charts, today hand-built SVG strings set through `h("div", { class: "an-svg", html: svg })` (the ratified `html:` exception, 12 live uses: `src/ui/sections/color.js` :62 `graphLC`, :90 `graphTone`, :118 `graphChroma`, :208 `graphContrast`/`graphDamping`, :242 `graphHueWheel`, :633 hue/chroma disc; `geometry.js` :482 centering-law cell diagram, :517 icon and text vs height, :548 tier ladders; `typography.js` :54 type scale, :85 letter-spacing, :111 line-height ratio; classes in `src/ui/styles.css` ~:464-501, 836-839, 1389, 1526-1531), with native DOM charts: marks are HTML elements styled with CSS, no SVG and no Canvas, built with `h()` hyperscript.

## Intent
- Read the source project first: `/Users/kimgranlund/Projects/nonoun/native-dom-charts` (README, AGENTS.md, `docs/context/*`, `src/`). A conductor survey found: it is a Svelte 5 + Vite specimen sheet of 14 chart families, "not a published package", private, no license file, so treat it as a reference to port principles and techniques from, not a dependency; our app has zero runtime deps, a single-file bundle, a vanilla web component, and Safari/WebKit as the dev browser. Its stated rules: marks are pure HTML/CSS (line strokes as CSS clipped-polygon ribbons); layers `core` (pure math: contracts, geometry, time) -> `renderers` (paint only) -> `layout` (Plot, Axis, Grid) -> composition, with `ui` (Value, Tooltip, Legend) apart; large and snapshot variants share data, geometry, palette and formatter; zero-based charts use the card bottom as zero; x labels sit at true coordinates and are culled on collision (12px gap) or edge crossing; never coerce invalid values to zero and never draw through a missing sample; tooltips measure themselves, stay inside the plot (8px margin), are pointer-transparent, and hover never changes mark geometry; radius, motion and color come from tokens (`--chart-*`, `--radius-*`); reduced motion respected; every large chart has an accessible source table; keyboard arrows, Home/End, Enter to pin, Escape; light and dark and a 390px viewport tested.
- Architect pass first (read-only). Decide per chart whether it ports to native DOM, ports with adaptation, or genuinely cannot (the hue wheel, the hue/chroma disc, the centering-law cell diagram and the tier-ladder dashed overlays are geometry drawings, not Cartesian charts; the source has no multi-series continuous plot and no angular hue picker). Anything that cannot port cleanly goes into `## Missing decisions` for the user (keep as SVG under a narrowed exception, or rebuild a native approach), never decided silently. Define the architecture inside this repo: a pure DOM-free chart core under `src/engine/` or `src/ui/` (math, scales, ticks, label culling) that headless tests can exercise, renderers that build elements with `h()`, and the data plumbing from the existing engines (53-role table, `type.mjs`, `geometryScale`). The `.claude/CLAUDE.md` "html: SVG-chart exception: 12 live attributes" convention and the SVG `fill: none` convention change with this work: the architect names the exact doc and skill edits (`building-editor-sections`, CLAUDE.md, an ADR appended to `docs/references/decision-records.md` before its Quick map, next number after ADR-032).
- Testing plan from the start: the headless shim cannot render CSS or measure layout, so the pure core carries the numeric tests (scales, ticks, culling, tooltip clamping, missing-value handling), `npm run smoke` real-Chrome screenshots carry the visual check, and a pixel review at light/dark and 390px covers rendering. Safari/WebKit risks (clip-path polygons, CSS features, font-family quoting) are named by the architect.
- Sequencing: a migration chart by chart behind verifiers; shared files collide with in-flight tickets T-0025 (Color inspector fixes: `app.js`, `color.js`, `styles.css`) and T-0027 (compound insets: `geometry.mjs`, shell CSS), so the plan starts with the new chart core and its tests (new files) and lands the per-section ports after those two. One push, one PR for the whole ticket; local gates through `gate_lock.py` with `SDLC_GATE_WORKERS=10`.

## Constraints
- Zero runtime deps, engines pure and DOM-free, vanilla web component, `h()` hyperscript, no framework, light DOM. No U+2014. Quote interpolated font-family names with digits or spaces (Safari). Never hand-edit generated files. `npm test`, `npm run build`, `npm run smoke`; `gate:sweeps` as its eight legs.

## Plan review
scope widened: step 2: scripts/bundle.mjs added to the scope criterion (MODS and KEY entries for src/ui/charts/core.mjs and render.mjs); the tree keeps the blocked attempt work uncommitted
plan defect: step 2 needed scripts/bundle.mjs (MODS and KEY entries for src/ui/charts/core.mjs and render.mjs); it was added by scope widening and is committed (6445ea08). Replan steps 3 to 5 only: every later step that adds an import of src/ui/charts/ to a module the bundler lists must name scripts/bundle.mjs in Do and scope, or state why it stays untouched (core.mjs and render.mjs are already registered). Steps 1 and 2 are done.

## Closed

2026-10-08: warnings acknowledged: Process deviations reviewed: the verifiers ran the missing pre-edit red controls by hand and each criterion was red at base; Safari and the 390px viewport are unchecked and stay noted in the PR; the bundle.mjs plan defect was widened and committed in step 2

> - process deviation: red-checkpoint (step 4): missing: attempt a8068a5bd4404f18808d17d786989ba0, handoff sha256 2f391e6bb9de, 3 of 3 (red) criteria without a pre-edit red control: `node --input-type=module -e 'const mk = (t) => ({ tagName: t.toUppe...`; `test -f test/repo/dom-charts.mjs && out=$(node test/repo/dom-charts...`; `! grep -qE 'an-svg|stroke' src/ui/styles.css && grep -qE '^[.]gp-re...`. The step 4 verifier ran the base-commit controls itself and got red on all three, then passed the step.
> - Step 5 has no `process-deviations.md`, but `red-checkpoint.jsonl` there holds 5 lines for 6 `(red)` criteria. The ADR criterion (73) has no pre-edit control. The builder and verifier both say so. The verifier ran the control by hand (`git show HEAD:docs/references/decision-records.md | grep -c 'Analysis charts are native DOM'` printed 0), so it is red at the pre-build HEAD.
> - All five steps passed. These checks were not run:
>   - Safari/WebKit was never run.
>   - The 390px viewport check the handoff asks for was not done.
>   - The step 5 verifier's visual check covered the rail only, in headless Chrome at 1440x2400, light and dark.
>   - Step 2's verifier did not re-run `npm run smoke`. Step 5 later ran it, and it passed.
> - Step 4 builder said rects and the 3px `gc-pad` rule were first-use marks with no real-browser look. The step 5 smoke and visual check cover them in Chrome.
> - Step 2 first blocked on a plan defect: `npm test` failed because `scripts/bundle.mjs` rejected the new `src/ui/charts/` imports. The conductor widened the step's scope, and `bundle.mjs` now registers `chartsCore` and `chartsRender` (commit 6445ea08). The first attempt is kept as `step-2.superseded-1`.
> - Nothing from steps 3 to 5 is committed; the work is in the tree.
