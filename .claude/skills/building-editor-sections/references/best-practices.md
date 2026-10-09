# Best practices: building & evolving a section

The non-obvious do/don'ts (each one cost a real bug or review cycle), then a condensed worked walkthrough.

## Rendering

- **The chart primitive** (the rule itself is in the body): a chart is a `renderChart(spec)` spec in
  nominal px (`width`/`height` set the aspect-ratio box; marks land in percent inside it). Map data with
  `scaleLinear` from `src/ui/charts/core.mjs`. Colour a series by setting `--series` (and `--dash` for a
  dashed ribbon) on its series class, not per mark. The data rides in a visually hidden source table,
  so give the spec a `title` and its `columns`.
- **Quote interpolated font-family names** with digits/spaces: `font-family:'${fam}', ${generic}`. Unquoted,
  WebKit drops the declaration (`Source Serif 4`, the digit is invalid); Chrome tolerates it, so smoke
  won't catch it. There is a `typeTokensCSS` guard test for this; keep it.
- **Reuse classes before adding CSS.** `.an-card`/`.an-chart`/`legend()` (analysis), `.insp-body`/`.insp-title`/
  `.insp-sub`/`.insp-actions`/`.tyi-voices`/`.tyi-voice-stats` (inspector), `.seg-body`/`.seg-example`/
  `.pane-head` (shell). Geometry's inspector reuses `.tyi-voices` for its per-size summary with zero new
  CSS. Add a `.<x>-spec*` block only for the center scene, mirroring `.type-spec*`.
- Give the center scene a fixed `width` (e.g. `.type-spec{width:720px}`) so `applyTransform`'s centering
  (`translate(-50%,-50%)…`) lands predictably in the pannable area.

## Control & data

- **Bind only persisted doc fields; show derived params read-only.** The inspector's writable controls map
  to exactly the fields `persist.js` carries (e.g. `doc.geometry = {tier, scale, radius, spaceBase, modes?}`). Anything the
  engine derives from those (per-cell inset/icon/text/radius, per-voice ratio/leading) is shown read-only
  with a one-line "from the ladder / from treatment" note. **Never fake an editable control** the engine + the persist fuzz
  generator can't round-trip, it lies to the user and breaks the persist test.
- **`setSection(id)`**: stash the color viewport on leave (`_colorViewport`), restore on return; call
  `this.fit()` for non-color (it resets the viewport to zoom 1 and insets the scene's top-left corner via
  `_fitTopLeftInset`, not centered and not at the color pan); lazy-init section assets
  (`ensureTypeFonts()` for typography). Keep Color byte-identical, the viewport round-trip is the one
  crossover.
- **Guard the live refresh.** `_liveRefreshNow()` early-returns for non-color. Color's `.canvas-scene` holds
  one `.compare-col` per scheme, so a partial `scene.replaceChildren(...)` would clobber them: patch each
  column in place under its own `_inScheme` (set its `--canvas-bg`, replace its scene), as `_liveRefreshNow` does.

## Retiring a modal cleanly

The delete/keep checklist is in the body (Procedure step 6). Mechanics it doesn't carry:

- The `this._sync<X>()` **call site** lives in the post-render block, delete the call, not just the method.
- Grep the removed symbols before declaring done, `grep -n 'open<X>\|render<X>\|_<x>Sample' src/ui/app.js`;
  a retired modal usually leaves one dead helper (a `_geomSample`, a stub class). Remove it.

## Tests (the shim is not jsdom)

- Add a **lettered headless group** mirroring `(ty)`/`(geo)`/`(cm)`. Assert: enter via `setSection(...)`;
  the full-dataset markers + exact count (the count literals are owned by the lettered gates in
  `test/ui/headless-boot.mjs`, match those); `.an-card` ≥ 4; the inspector renders (`.tyi-voices` or
  `.insp-title`); the header view/mode toggle flips a class; download emits a `.zip`; round-trip back to
  Color restores the ramp canvas. Keep engine/persist/`brandKit`/composition assertions, those are the
  real coverage.
- **Shim internals** (the selector rule is in the body): the `txtOf(node)` walker reads `node._text` +
  children; `document.fonts.check` lies for variable fonts, measure DOM width instead.

## Worked walkthrough: the Geometry section (condensed, from PR #97)

History: PR #97 built the section on the retired six-size ramp. T-0017 (ADR-032) rebuilt the scene on
the Maison ladder (27 `.geom-spec-line` cells, each `data-cell="{tier}-{scale}-{size}"`, the kit default
marked), the inspector on tier, scale, radius and space-base pickers, the mode editor on `modes[].scale`
(`_setActiveGeomScaleId`) and the Tokens table as read-only. The pattern below is unchanged.

1. State: `geomSpecMode` (Controls·Tokens), `geomSegment` (Ramp·Radius·Space); drop the modal's `geomOpen`.
2. Route: `renderCenter` geometry → `renderGeomCanvasHeader` + `renderGeomCanvas` + footer; `renderLeftPane`
   → `geomAnalysisCards`; `renderRightPane` → early-return `renderGeomInspector`.
3. Center: `renderGeometryScene` = a `.geom-spec` with a **Controls** group (6 sizes as live `.geom-ctl`
   mock buttons at their real height/icon/font/pad/radius) + the Radius ladder + the Space scale; a
   Controls·Tokens header toggle drops the live boxes for metrics.
4. Left: 4 `geomAnalysisCards`, centering-law square diagram, power-law curves, two-band
   ramp w/ MD|LG seam, the "font ← Type UI" composition.
5. Right: `renderGeomInspector` = Ramp/Radius/Space tabs over `doc.geometry`; Ramp writes treatment +
   base-height (`this.slider`), shows the per-size summary read-only; pinned `.seg-example` MD control in
   the palette's roles.
6. Retire: removed the modal methods + `_geomSample` (now dead) + `dialog.geom`/stub CSS; kept
   `downloadGeomTokens`. Composition preserved via `geometryScale(doc)`.
7. Tests: rewrote the `(geo)` headless leg to drive `setSection("geometry")` + the Controls·Tokens toggle;
   smoke geometry leg drives the section + screenshots. All engine/persist/brandKit/composition assertions
   retained.
