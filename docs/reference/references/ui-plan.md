# Ultimate Tokens: UI Plan

> The front-end plan for the tool whose engine/semantic/export logic the spec defines. Reasoned
> top-down from intent (per the generative-UI discipline), not from components. Confirmed
> decisions: **structured-pannable canvas · export = right drawer**.
> Date: 2026-06-15.

## Revision A: usage-driven re-arrangement (2026-06-15, post-build)

After building + *using* the app, the surface was re-arranged (the reasoning in §1 is unchanged, only
the arrangement moved). Supersedes the "3 lenses on one canvas" decision:

- **left-pane → ANALYSIS rail** (was the palette navigator), stacked graphs for the selected palette:
  L\*×C, tone curve, chroma curve, contrast bars (flag `<4.5:1`), hue wheel (whole set).
- **canvas → the ramps as the 2D pannable NAVIGATOR** (was 3 lenses), each palette is a clickable row
  (name + `●/○` enable); the ramps *are* the palette list (the old left list moved here). Analysis went
  to the left rail; Semantic moved into the Roles panel.
- **canvas-header → `◐ canvas color-scheme`** (preview the palette light↔dark, *independent* of the
  app-chrome `◐`) · Fit · zoom% · + Palette (replaced the lens toggle). **Two `◐` toggles** now: app
  chrome theme (header, dogfooded) vs canvas preview (canvas-header).
- **right-pane → segmented `[ Palette │ Global │ Roles ]`** (was a single inspector), Palette = selected
  palette's controls; Global = global controls; Roles = the 53-role table + a small semantic preview.
- **Bugs fixed:** gallery search no longer steals focus on type (the `<input>` is stable; only the tile
  grid re-renders); canvas pan now works (pointer-capture `translate()`, origin-centered, a 4px drag
  threshold keeps a pan from firing row-select, wheel zoom about the cursor).

Built into `capability.system.ui-app` + the single-file bundle. The wireframes/region-map below are the
*original* plan; treat this Revision as the current truth where they differ.

## Revision B: the three-section editor (2026-09-28, after the docs-repair U3 claims)

Revision A described a color-only editor. The app has since grown into one brand-kit document with
three composing systems, surfaced as sections of one editor. Where the wireframes and Revision A
differ from this revision, this revision is the current truth. It is a summary; the frame, regions,
render pipeline and state are specified in `docs/lld/app-shell.md`, and the per-section build
procedure (canvas header, scene, inspector, the headless-shim limits) lives in the
`building-editor-sections` skill, so this file does not repeat them.

**Sections.** `this.section` (`color` | `typography` | `geometry`) is ui-session state and routes the
whole editor: `renderCenter` picks the canvas header and canvas, and the left and right panes branch
on the same field. `setSection` switches it, stashing the Color pan and zoom on leave and restoring
them on return; the Typography and Geometry scenes are reset to `fit` on entry and pan and zoom like
Color's (the same `wirePanZoom` shell); only the Tokens tables, like Color's Mapping table, scroll
instead. Each section is a canvas header, a scene holding the full dataset, left analysis cards and a
right inspector.

| Section | Canvas | Inspector tabs | Notes |
|---|---|---|---|
| Color | `canvasView` of Palettes, Scrims, Mapping (the semantic-mapping table, the only table view) or Radix; `colorMode` of `system`, `light`, `dark` or `both`, where `both` renders the scene twice side by side through `renderCompareArea`, except in the Mapping view, whose table already shows both modes and renders once | palette, global and roles, plus a story tab when the document carries a curated story | the original surface of Revision A |
| Typography | a `typeSpecMode` segment of `specimen` or `tokens`, and `typeMode` breakpoint modes (base plus each mode, `compare` labeled All; Tablet and Mobile are live from `typeEffectiveModes` until a mode is materialized) | `typeSegment` of scale, fonts and specimen, in `renderTypeInspector` | the Specimen view renders each step in the real face |
| Geometry | a `geomSpecMode` segment of `controls` or `tokens`, and `geomMode` breakpoint modes (base plus each mode, `compare` labeled All; Tablet and Mobile are live from `geomEffectiveModes` until a mode is materialized) | `renderGeomInspector` with ramp, `radius` and space tabs | per-step text size composes from the Type scale, except in the ladder prototype ramp, which derives its own text size from each step height |

Both breakpoint-mode sets sit beside Compare, which shows every breakpoint side by side and hides the
section's whole canvas segment (`specimen` or `tokens` in Typography, `controls` or `tokens` in Geometry). Each section also has left analysis cards, routed by `renderLeftPane`. The engines
behind Typography and Geometry are owned by the `type-scale` and `geometry-system` skills.

**Export drawer.** The drawer offers ten color formats (CSS hex, OKLCH, Tailwind v4, shadcn/ui, Panda
CSS, Radix, Figma, Figma UI3, DTCG, JSON), grouped with the Typography and Geometry token outputs,
the design-system bundle (tokens and DESIGN.md) and the config round-trip. The group list is
`FORMAT_GROUPS` in the drawer overlay.

**Gallery.** The home view is a hub: your saved palette sets as tiles with a search box, and below
them the curated color categories (`CATEGORY_INDEX`). Opening one enters the categories view, its own
state: `this.category` is a category slug or `null` (the hub), and that category's volumes of curated
presets load lazily on entry. A preset opens as an editable copy in your own sets. Import, project load and New sit in the gallery header.

**Persistence.** The document persists per set; `colorMode` and the other app preferences persist per
app and never with the document (see the state table in `docs/lld/app-shell.md`).

## 1. Why it exists (the reasoning the shell traces to)

```yaml
intent: >
  Let a design-system author generate perceptually-even, in-gamut palettes + a 53-role
  semantic layer, judge their quality, and export to code/Figma.
posture: [creating, configuring, analyzing]      # a creative editor, NOT a dashboard
role: [design-system-author]                      # single role → no role-collapse  # <!-- fix-old-names: keep -->
core_loop: tune params → see ramps vs the gamut ceiling → judge → export

tasks:
  T1 manage-document:  new / open / save / duplicate a palette SET
  T2 manage-palettes:  add / remove / rename / enable a palette
  T3 tune-palette:     hue / chroma / skew / lift
  T4 tune-global:      curve / tension / lmin / lmax / damp / dampCurve / dampAmp / dampBias / hueSpace
  T5 inspect-quality:  the L*×C plot (applied chroma vs gamut ceiling, tone line)
  T6 check-contrast:   a stop / on-color vs white·black
  T7 preview-theme:    light ↔ dark
  T8 export:           10 formats (color), plus type, geometry, design-system and config outputs
  T9 browse-sets:      the home gallery (your sets, search, color categories)
  T10 tune-type:       the Typography section: scale, fonts, specimen
  T11 tune-geometry:   the Geometry section: ramp, radius, space
  T12 manage-modes:    add or edit breakpoint modes for Typography and Geometry
  T13 compare:         all breakpoints (Typography, Geometry) or Light and Dark (Color) side by side

decisions:                                        # what makes it operational, not a metric wall
  D1 is-this-palette-good?:    [adjust controls, accept]
  D2 chroma-maxed-or-clipping?: [raise/lower chroma%, reskew]   # ← L*×C plot (T5)
  D3 contrast-acceptable?:     [accept brand override ADR-003, note]  # ← readout (T6)
  D4 which-export-format?:     [export]
```

Posture is *creating/analyzing* → the canonical creative-editor shell (header + dual rail +
canvas + footers). It traces from posture, so it is justified, not premature.

## 2. App shell + region → task map

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ◆ HCT Palette Generator   Brand Spectrum ▾          New  Open  ⇪Export   ◐ │ app-header
├─────────┬──────────────────────────────────────────────────────┬───────────┤
│PALETTES │ ◀ Back   [ Ramps │ Analysis │ Semantic ]   ⊹Fit 100%▾  +Palette  │ canvas-header
│ ● Neutral├──────────────────────────────────────────────────────┤ INSPECTOR │
│ ● Primary│   ▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦  Primary               │ Primary   │
│ ○ Second.│   ▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦  Secondary             │ name […]  │
│ ● Success│                · (0,0)                                │ ☑ enabled │
│ ● Warning│   ▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦  Warning               │ hue   ●── │
│   …      │   ▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦▦  Danger                │ chroma ●─ │
│─────────│                                                       │ skew  ─●─ │
│ ⚙ Global │                                                       │ lift  ─●─ │
│ ◳ Roles  │                                                       │ contrast↘ │
│         ├──────────────────────────────────────────────────────┤ ⧉dup 🗑   │ canvas-footer
│         │ x:0 y:0 · 100% · #0062D5 · tone 550 · ✓in-gamut       │           │
├─────────┴──────────────────────────────────────────────────────┴───────────┤
│ 8 palettes · 296 tokens · light · ✓ saved · ⚠ on-Warning 1.8:1 (by design)  │ app-footer
└────────────────────────────────────────────────────────────────────────────┘
```

| Region | Owns | Tasks/Decisions |
|---|---|---|
| **app-header** | doc identity + `New · Open · Save/Duplicate · Import · **Export** · ◐ theme · undo/redo` | T1, T7, T8, D4 |
| **canvas-header** | the canvas **lens toggle** + nav: `◀ Back · [Ramps │ Analysis │ Semantic] · ⊹ Fit · zoom% · + Palette` | T5, T9, T2 |
| **L · left-pane** | the **navigator**: palette list (●/○ enable, `+ Add`), then `⚙ Global`, `◳ Roles` | T2 select |
| **canvas-area** | the structured-pannable surface (ramps / plot / preview, per lens) | T3, T5, D1, D2 |
| **R · right-pane** | the **inspector** for the selection (palette props / global controls / role table) + actions | T3, T4, T6, D1, D3 |
| **canvas-footer** | canvas-local status: `x·y · zoom · hovered swatch #hex · tone · in/out-gamut` | T5 feedback |
| **app-footer** | doc status: `palettes · tokens · theme · saved · ⚠ contrast notes` | T6/D3 summary |

**Key trick:** L selecting `⚙ Global` swaps **R** to the global controls (instead of palette
props), so *one* inspector serves both T3 and T4, no separate settings page.

## 3. The canvas: structured-pannable, 3 lenses

A palette set is structured data (8 × 25), so the canvas **auto-lays-out** ramp strips stacked
and centered on `(0,0)`; **pan** (shift-drag) navigates, **zoom** inspects. No free placement
(it would be an affordance with no task). The canvas-header toggles **3 lenses** over the same
surface:

**Ramps** (default), swatch grids; tune & see color (T3).

**Analysis**, the L*×C plot for the selected palette → **D2**:
```
[ Ramps │ ANALYSIS │ Semantic ]   Primary
 L*100┤●                          ░ gamut ceiling (maxChromaInGamut@tone)
   90 ┤ ●                         ● applied chroma per stop
   …  ┤   ●●                      ─ tone line
   50 ┤      ●●●  ← peak ~500      applied hugs ceiling ⇒ clipping;
   …  ┤    ●●                      gap ⇒ headroom (raise chroma%)
   10 ┤ ●
    0 ┤●
      └──────────────── C →
```

**Semantic**, a live UI preview painted by the 53 roles; ◐ flips every `--c-*` via `light-dark()`:
```
[ Ramps │ Analysis │ SEMANTIC ]   (light ◐)
 ┌ surface ────────────────────────┐
 │ onSurface heading               │
 │ onSurfaceVariant body…          │
 │ ┌ container ─┐  [ Primary ]  ⚠  │   ← --c-primary fill + on-primary text
 │ └────────────┘  [ outline ]     │
 └─────────────────────────────────┘
```

## 4. Views, navigation, export drawer

```yaml
views:
  gallery (home):  hub of palette-SET tiles → opens editor
  editor:          the app-shell above
nav:  gallery ──open/new──▶ editor ──◀ Back──▶ gallery
```

**Gallery (home):**
```
┌────────────────────────────────────────────────────────────┐
│ ◆ HCT Palette Generator             + New  Import      ◐  │
├────────────────────────────────────────────────────────────┤
│ Your palette sets                     ⌕ search     ▦ ▤    │
│  ┌ + ──┐ ┌────────┐ ┌────────┐ ┌────────┐                 │
│  │ New │ │▥▥▥▥▥▥▥│ │▥▥▥▥▥▥▥│ │▥▥▥▥▥▥▥│  thumb = each      │
│  │ set │ │ Brand  │ │Mktg    │ │ Docs   │  palette's prime  │
│  └─────┘ │ 8 · 2d │ │ 5 · 1w │ │ 6 · 3w │  swatch strip     │
│          └────────┘ └────────┘ └────────┘                 │
└────────────────────────────────────────────────────────────┘
```

**Export = right drawer** (from `⇪Export`), a format select over ten color formats and the other groups, + live preview + copy/download (the wireframe shows the original tab strip):
```
                                  ┌ Export ─────────────────┐
                                  │ ● CSS  OKLCH JSON DTCG UI3│
                                  │ ───────────────────────── │
                                  │ :root{                    │
                                  │  --primary-050:#FFFFFF;   │
                                  │  --c-primary:light-dark(… │
                                  │ }                         │
                                  │ 296 tokens · 34.7 KB      │
                                  │ [ Copy ] [ Download .css ]│
                                  └───────────────────────────┘
```

## 5. State model (no stored derived state)

```yaml
document:                # the palette SET, the source of truth (persist.js)
  shape: { name, palettes:[{name,hue,chroma,skew,lift,on}], curve,tension,lmin,lmax,damp,hueSpace }
  persistence: localStorage per set; the gallery lists them; `dirty` = document != last-saved
ui_session (not persisted with the doc):
  selection: { kind: palette|global|role, id }   # owner L → drives R
  lens:      ramps|analysis|semantic             # owner canvas-header
  viewport:  { panX, panY, zoom }                # owner canvas; reset = Fit
  theme:     light|dark|auto                     # owner header; UI-only, NEVER exported (AC-U3)
  exportOpen: bool                               # owner header
derived (NEVER stored, recomputed from document by the validated modules):
  ramps     ← paletteStops()      # engine + tonal
  semantic  ← semanticRoles()     # semantic
  plotData  ← {ceiling, applied}  # the Analysis lens
  contrast  ← on-color ratios     # D3 + app-footer warnings
  exports   ← exportAll()         # the drawer
```

The whole right side is a pure projection of `document` through the six validated capability
modules, the same "the board is the repo, projected" discipline, applied to color.

## 6. Components (Layer 5: each traced to a task)

```yaml
left-pane:    PaletteListItem(enable toggle)→T2 · AddPaletteBtn→T2 · GlobalEntry→T4 · RolesEntry→inspect
canvas-header: LensToggle→T5 · FitBtn/ZoomMenu→T5 · BackBtn→T9 · AddPaletteBtn→T2
canvas:       RampStrip(25 swatches, hover→footer)→T3/T5 · LCPlot→T5/D2 · SemanticPreview→inspect
inspector(R): TextField(name)→T2 · EnableToggle→T2 · Slider(hue/chroma/skew/lift)→T3 ·
              GlobalControls(curve select, tension/lmin/lmax/damp sliders, hueSpace toggle)→T4 ·
              ContrastReadout→T6/D3 · DupBtn/DeleteBtn→T2
header:       DocMenu→T1 · ExportBtn→T8 · ThemeToggle→T7 · Undo/Redo
export-drawer: FormatTabs→T8 · CodePreview→T8 · Copy/Download→T8
gallery:      SetTile(thumb+meta)→T9 · NewSetTile→T1 · ImportBtn→T1 · Search
```

**Feedback states** (client-side + fast, so minimal but required): gallery **empty** → "Create
your first palette set"; **import error** → toast with the parse reason; global-control change is
memoized (no spinner needed, but a subtle recompute shimmer is optional on heavy edits).

## 7. Anti-pattern check (passed)

- AP-01 premature rendering, reasoned from intent/posture, not components ✔
- AP-02/08 metric-without-decision, the L*×C plot and contrast readout drive D2/D3 with real actions ✔
- AP-05 actionless, every region carries actions ✔
- AP-07 role-collapse, single role ✔
- AP-09 surface-without-task, every region/surface mapped to ≥1 task ✔
- AP-04 unbound / no-stored-derived, components bind to `document`; the right side is recomputed ✔
- AP-06 feedback, gallery-empty + import-error specified ✔

## 8. Next steps (open)

1. **Build path**: standalone single-file app (per ADR-010, the tool is offline/dependency-free)
   consuming the six validated capability modules directly; or formalize this plan as a UI spec
   cell and run it through the factory.
2. **Interaction detail (Phase 3)**: pan/zoom mechanics, keyboard, drag-reorder palettes, undo
   granularity, the contrast-readout's exact pairs (on-color vs prime fill per mode).
3. **Visual layer**: tokens/typography/spacing (defer to `ui-compose-*` / the tool's own output
   could theme its own UI, dogfooding).
```
