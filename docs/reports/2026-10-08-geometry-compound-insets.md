# Compound insets and square ghost icon buttons: gate report (2026-10-08)

Evidence for T-0027 (`.sdlc/geometry-compound-insets/`). The lane styles the palette Name field as a
shell input, adds compound inset roles (a container takes half of its part's inset as padding, the part
keeps the rest, and the container radius is the part radius plus that padding, so corners stay
concentric), applies them to the shell's segmented controls, and makes the shell's icon-only buttons
borderless control-height squares. This report records the gates on the finished lane, steps 1 to 5.

## Command

- Base: `git merge-base HEAD main` = `f60e5d14cddcdc242a0c4232d3e993b402ecc537`.
- Head: `plan/geometry-compound-insets` at `f1ee41a172970cda366d07c09ba48ed577afc06a` (steps 1 to 5).
  This step changed no source file, so every reading is the step 5 tree's.
- `GL` below is the version-free lock path,
  `$(ls -d ~/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)`.
  Every command ran with `SDLC_GATE_WORKERS=10`.

```
python3 "$GL" run --name npm-test -- npm test
python3 "$GL" run --name build -- npm run build
python3 "$GL" run --name smoke -- npm run smoke
python3 "$GL" run --name corpus-reset -- npm run gate:corpus-reset
python3 "$GL" run --name <leg> -- npm run gate:<leg>   # corpus-tonal corpus-anchor sweep-prime corpus-contrast mode-isolation even-dips chroma-envelope
```

- `npm test` ran once, wrapped in the asset drift check: a `shasum` of `figma/plugin/ui.html`,
  `src/ui/*-assets.js`, `src/ui/categories/*.js` and `docs/reference/data/adia-*` before and after,
  equal. No tracked file changed after `npm test`, `npm run build` or `npm run smoke`, so the
  expected first-run rewrite of a stale asset did not occur.
- The sweeps ran as eight separate legs, never the chained `gate:sweeps`, so one red leg cannot hide
  the legs after it. `gate:corpus-reset` ran first.
- Load average about 15 to 24 during the run; seconds include lock waits.

## Gates

| Leg | Exit | Seconds |
|---|---|---|
| `npm test` (drift-wrapped) | 0 | 336 |
| `npm run build` | 0 | 4 |
| `npm run smoke` | 0 | 42 |
| `gate:corpus-reset` | 0 | 201 |
| `gate:corpus-tonal` | 0 | 302 |
| `gate:corpus-anchor` | 0 | 393 |
| `gate:sweep-prime` | 0 | 319 |
| `gate:corpus-contrast` | 0 | 98 |
| `gate:mode-isolation` | 0 | 48 |
| `gate:even-dips` | 0 | 66 |
| `gate:chroma-envelope` | 0 | 97 |

`npm test` passed all 55 test files, `repo/control-text.mjs` among them. `npm run smoke` printed
`SMOKE PASS, gallery · category · editor · export dialog all render in a real browser`, in headless
Chrome over CDP.

## Compound and control text

- The smoke run's resolver line:

```
✓ geometry.css resolver: all 108 nested cases (27 cells x 4 radius modes) resolve --control-height, --radius-control, --control-part-height and --control-part-inset to the engine's cell values
```

- The compound and control text lines, at both shell geometries:

```
✓ compound at product-md: segmented outer = control height, segments = part height, concentric corners, icon-only buttons square and borderless
✓ compound at content-lg: segmented outer = control height, segments = part height, concentric corners, icon-only buttons square and borderless
✓ control text at product-md: 135 controls, every shell button, select and text input computes the cell text size on one line
✓ control text at content-lg: 135 controls, every shell button, select and text input computes the cell text size on one line
```

- Measured heights. The compound check in `test/smoke/smoke.mjs` compares each visible `.segmented`,
  each of its segments and each icon-only button outside the canvas scene against the engine's `md`
  cell at that tier and scale (`geomScale` in `src/engine/geometry.mjs`, round radius), within 0.5px,
  and printed no offender. So the measured values are these, to 0.5px:

| Geometry | Segmented outer | Segment | Container padding | Segmented radius | Segment radius | Icon-only button | Control text |
|---|---|---|---|---|---|---|---|
| product-md | 32 | 24 | 4 | 14 | 10 | 32 x 32 | 14 |
| content-lg | 64 | 48 | 8 | 22 | 14 | 64 x 64 | 22 |

  In both rows the segmented radius is the segment radius plus the container padding (10 + 4 = 14,
  14 + 8 = 22), the concentric composition.

- Screenshots: `smoke-out/compound-product-md.png` and `smoke-out/compound-content-lg.png`
  (gitignored, written by this run).

- Pixel check, both screenshots read by eye:
  - Segmented controls: the app-header section switch (Color, Typography, Geometry) and the two
    canvas-header switches (Palettes, Scrims, Mapping, Radix; Core, All) show the container padding
    as an even ring around the active segment, with the active segment's corners concentric with the
    container's, at both geometries.
  - Icon-only buttons: the left-pane toggle next to the "ANALYSIS Neutral" title, the right-pane
    toggle next to "Global", and the app-header undo, redo, theme and settings buttons are
    borderless and transparent, each a square of the control height with its glyph centered.
  - Global inspector buttons: the wide buttons ("Add data palettes", "Re-derive data hues") sit below
    the fold in both screenshots (the inspector scrolls), so the screenshots do not show them. The
    `control text at` line covers them: it runs over the Global inspector and found every button at
    the cell text size on one line.
  - Chrome at content-lg: the app-header band and the canvas-header band grew with the 64px controls,
    and no control spills out of its band vertically. Horizontally, the canvas header's trailing tools
    do not fit the center column: the recenter button is cut at the column's right edge, and the zoom
    out, zoom level, zoom in and "+ Palette" controls are hidden past it. The `.canvas-header` rule in
    `src/ui/styles.css` has no wrap or scroll, and this lane did not change it. See Follow-ups.
  - At product-md every header control is visible and nothing is clipped.

## Follow-ups

- Safari is not proven. Smoke runs in Chrome only, and the user previews in Safari, including the
  palette Name field (`input[data-fk="pname"]`).
- Two pixel-review items from the PR #813 review follow-ups in `.sdlc/notes.md` were not folded in,
  because no record says what was seen: the faint light-theme headings and the micro-sm switch.
- The stale `ramp` comment in `figma/binder/mode-apply-plan.mjs` (T-0026).
- `typeTokensBreakpointCSS` in `src/engine/type.mjs` still writes `:root {` in its breakpoint files,
  while `geomTokensBreakpointCSS` in `src/engine/geometry.mjs` now writes `:where(:root) {` (step 5).
- The three micro cells where the chip is taller than the part.
- `.account-license-input`, `.tok-input`, `.settings-nav-item` and `.linklike` sit outside the selector
  list of the control-text gate (`test/repo/control-text.mjs`).
- Step 5 moved 93 `src/ui/app.js` cites in seven docs by number, so a concurrent lane that edits
  `src/ui/app.js` conflicts on them at merge.
- The canvas header clips its trailing tools at content-lg (recenter, zoom and "+ Palette"), seen in
  `smoke-out/compound-content-lg.png`. It needs a decision: wrap the header, scroll it, or collapse
  the trailing tools. No gate covers horizontal fit.
- `panda-smoke` runs only in CI.
- No push, PR or issue was made.
