# Component Inventory: ultimate-tokens UI

> Inventory of every interactive primitive + data-viz mark in the UI, profiled as a **contract
> card** on the COMPOSE axis (layer → anatomy → API → composition). Produced with the
> `design-skills:component-decomposer` method. This is a **DECOMPOSE of the as-built UI**, it
> records reality (including the gaps against the skill's family policy), it does not redesign.
>
> ℹ️ **Line numbers are maintained.** Every `file:line` citation below is checked by
> `node scripts/audit-citations.mjs` (STALE 0 as of #640, against the current `src/ui/` split: `app.js`,
> `app-helpers.mjs`, `sections/*.js`, `overlays/*.js`). Re-run it after any rebase; a citation that drifts
> reads STALE, never silently wrong. Since #664 the audit discovers every `docs/**/*.md` that carries a
> citation (engine, test, and script paths included), not just this file and `app-shell.md`; only these two
> declare `app.js` as the file a bare `:NNN` means. The anatomy, layering, and API observations remain valid.

## How to read this

- **Method.** Each primitive gets a contract card. Control primitives use the family-controls JSON
  shape (`component · layer · role · replaces_native · parts · props · states · keyboard ·
  forced_colors · owns_outer_margin`) plus inventory fields (**surface · call-sites · CSS classes ·
  native-vs-custom · a11y · geometry · flags**).
- **Surfaces.** `S1` = editor (`src/ui/app.js` + `src/ui/styles.css`). `S2` = Figma plugin. `S3` =
  data-viz marks (native DOM/CSS in the analysis rail + canvas: `.an-chart` from `renderChart`, no SVG).
- **Citations** are `file:line`.

## The architecture finding (read first)

There is **no component library**. The entire UI is one autonomous web component,
`ultimate-tokens` (`customElements.define` at `app.js:2834`), whose class is assembled from
`src/ui/app.js` (~2,580 lines: state, render dispatch, the frame) plus the section and overlay
mixins in `src/ui/sections/` and `src/ui/overlays/` (~5,600 lines, `mixinInto` at `app.js:2828`).
It builds every control inline with a single hyperscript helper `h(tag, attrs, ...kids)`
(`app-helpers.mjs:319`), across ~39 `render*()` methods. Styling is ~705 class-led selector lines in
`src/ui/styles.css` (~1,600 lines; count: `grep -cE '^\s*\.' src/ui/styles.css`, 544 unique class names). Consequences that recur in every card below:

- **S2 is not a second surface.** `scripts/gen-figma-ui.mjs` bundles the *same* compiled app
  (`dist/ultimate-tokens.html`) and injects a postMessage bridge that flips `inFigma`
  (`markInFigma()`, `gen-figma-ui.mjs:23-33`). So **S2 reuses S1's primitives verbatim**; the only S2-specific
  *instances* are `inFigma`-gated buttons ("Read live" `sections/color.js:1394`, "Read approx →" (`readFromFigmaVariables()`, `app.js:1272`),
  `.figma-plugin-btn` `overlays/drawer.js:224`) and the `.figma-files` mode segment (`overlays/drawer.js:221`).
- **No native-replacement layer + no FACE.** Controls are a mix of *native* elements (`<input
  type=range/text/search/checkbox>`, `<select>`) and *custom `<div>`/`<button>` widgets*, none are
  form-associated custom elements. The native ones inherit native a11y for free; the custom ones
  (`.toggle`, `segmented()`) are built on real `<button>`s with ARIA roles (`switchControl`, `app-helpers.mjs:363`;
  `segmented`, `app.js:1784`), so they keep focus and keyboard.
- **Forced-colors support is one pass**, the `@media (forced-colors: active)` block at
  `styles.css:1675`; custom-painted controls outside it still flatten in Windows High Contrast.
- **Geometry is ad-hoc, off any ramp.** Buttons are `padding: 4px 9px` (`styles.css before ADR-032`), the range
  thumb is 15px, the toggle track 34×19, none derived from a documented size ramp or the
  `(height − glyph)/2` law. Not wrong per se, but undocumented and unenforced.

## Refactor status: primitive extraction (implemented)

A primitive-extraction pass has since landed (branch `refactor/primitive-extraction`), at the
**helper-factory scale** (not full custom-element/FACE, see the rationale in the project's before/after:
no `<form>`s, one internal surface, native elements already carry most a11y). Six factories now own each
control's contract in one place; all changes verified by `npm test` (10/10), including 8 new a11y
regression assertions (`px1`–`px8` in `test/ui/headless-boot.mjs`).

| Factory | Location | Replaces | a11y won |
|---|---|---|---|
| `switchControl()` | `app-helpers.mjs` (pure) | the `<div onclick>` `.toggle` ×3 | `<button role=switch>` + `aria-checked` + keyboard + focus |
| `segmented()` | `app.js` (method) | 4 hand-rolled segmented stylings ×6 sites | roving tabindex + arrows; `role=tablist`/`group`; tabpanel wiring |
| `swatch()` | `app-helpers.mjs` (pure) | inspector dot + role refs; checkerboard ×2→×1 | decorative `aria-hidden`; one `.swatch` + `.alpha` |
| `btn()` | `app-helpers.mjs` (pure) | variant-bearing + header buttons | `{ghost,primary,danger,bare}` vocabulary; layout off the variant axis |
| `chip()` | `app-helpers.mjs` (pure) | `damp-presets` + `map-drift-sum` | `interactive`(button)/`status`(span) modes |
| `field()` | `app-helpers.mjs` (pure) | the 5 unassociated label rows | `label[for]`↔`id` association → accessible names |

Plus: a `@media (forced-colors:active)` pass; set-tile → `role=button` with a real delete `<button>`;
drawer `role=dialog`; toast `aria-live`. `slider()` was already the model and is unchanged.

**Since landed:** the `.field`/`.segmented` self-margins were removed after all:
`.segmented` carries no self-margin (`styles.css:965`) and `.field { margin: 0; }` (`styles.css:1034`);
the parent owns spacing.
**Still deferred (intentional):** a true drawer focus-trap; migrating the remaining uniform-`ghost`
buttons + the composite swatch cells (ramp-strip/scrim/footer), all behavior-neutral, adoptable
incrementally.

## Summary table

| # | Primitive | Layer | Native / Custom | Variants | Call-sites | Owning CSS | a11y | Flags |
|---|---|---|---|---|---|---|---|---|
| 1 | **Button** | component | native `<button>` | ~10 (primary · ghost · icon-only · danger · undo/redo · add-pal · pane-toggle · figma-plugin · ex-btn · copy-float · map-reset) | ~21 sites, 85+ refs | `button`, `.primary`, `.ghost`, `.icon-only`, `.danger`, `.ex-btn`, `.copy-float`, `.map-reset`, `.pane-toggle` | good (focus-visible, aria-pressed×7, aria-label on icon-only) | no forced-colors; variant sprawl via ad-hoc classes |
| 2 | **Toggle / switch** | component | custom `<button role=switch>` (`switchControl()`) | 1 | 2 | `.toggle`, `.track` | ✓ role=switch, aria-checked, aria-label, native focus + Space/Enter | palette site has no `<label>` |
| 3 | **Segmented control** | component (composes buttons) | custom (`<button>`s via `segmented()`) | 1 compound styling (`.segmented` · `.figma-files` · `.radix-files`, one rule) + 3 modifiers (`.canvas-seg` · `.newpal-seg` · `.settings-seg`) | 14 | `.segmented`, `.canvas-seg`, `.figma-files`, `.radix-files`, `.newpal-seg`, `.settings-seg` | ✓ one keyboard model: roving tabindex + arrows on every site; `role=tablist` or `group` | drawer format is a native `<select>` now, not a segment |
| 4 | **Slider / range** | component | native `<input type=range>` | 1 (via `slider()` helper) | 1 helper, ~14 instances | `input[type=range]`, `.field` | partial, `aria-label` set (label sibling NOT associated, noted in code `app.js:2220-2223`); no forced-colors | custom thumb only (T-0036: track 0.4 and thumb 1.25 times the control icon role); consistent, the model primitive |
| 5 | **Select** | component | native `<select>` | 1 + `.map-raw-select` | 3 | `select`, `.map-raw-select` | ✓ `.map-raw-select` has `aria-label`; Distribution/Curve are `field()` rows (label[for] + fallback aria-label) | two naming paths; T-0036: `appearance: none` with a drawn chevron, control roles for height, inset, radius and text |
| 6 | **Text input** | component | native `<input type=text>` | 2 (`.field` name · `.map-raw-input`) | 2 | `input[type=text]`, `.map-raw-input` | ✓ map-raw-input has `aria-label`; Name is a `field()` row (label[for] + fallback aria-label) | two naming paths |
| 7 | **Search input** | component | native `<input type=search>` | 1 | 1 (singleton, reused) | `input[type=search]` | good, `aria-label` + placeholder | reused node (`ensureSearchInput`, `app.js:919-922`) to preserve focus |
| 8 | **Checkbox** | component | native `<input type=checkbox>` | 1 | 1 | `.mini-check` | good, label-wrapped (associated), `accent-color` | only one instance |
| 9 | **Chip / pill** | component | custom span/button | 3 (tile-tag · preset · drift-sum) | ~6 | `.tile-tag`, `.damp-presets .preset`, `.map-drift-sum` | n/a (status) / preset is a clickable `<button>` | 3 unrelated "pill" stylings |
| 10 | **Field wrapper** | primitive (layout) | custom `<div>` | 1 | ~7 | `.field`, `.field > label` | n/a, wraps label + control | the only true layout primitive |
| 11 | **Swatch / color-cell** | primitive | custom `<i>`/`<span>` | ~6 (ramp · scrim · map · dot · roles · footer) | many | `.ramp-strip i`, `.scrim-cell`, `.map-swatch`, `.swatch-dot`, `.sw` | n/a (decorative; hover outline) | 6 sizes/idioms of one concept |
| 12 | **Set-tile** | component (composition) | custom `<button>` | 2 (set · preset) | 2 builders | `.set-tile`, `.set-thumb`, `.tile-tag`, `.del` | tile is a `<button>`; nested `.del` is a nested click | nested interactive in a button |
| 13 | **Ramp-row** | component (composition) | custom `<div>` | 1 | 2 scenes | `.ramp-row`, `.enable`, `.drag-handle`, `.ramp-name`, `.ramp-strip` | partial, selectable/draggable row; `.enable`/`.drag-handle` are `<div>`s | rich interaction, weak semantics |
| 14 | **Contrast bar** | data-viz | CSS | 1 | 1 | `.an-bar`, `.an-track`, `.an-fill`, `.an-thresh` | n/a | none |
| 15 | **Hue wheel** | data-viz | native DOM | 1 | 1 | `.an-chart.hw`, `.ch-circle.hw-circle`, `.ch-dot.hw-dot`, `.ch-ring` | n/a | none |
| 16 | **Tone / lightness curve** | data-viz | native DOM | 1 | 1 | `.an-chart`, `.ch-rule.lc-axis`, `.ch-band.lc-ceiling`, `.ch-ribbon.lc-toneline`, `.ch-ribbon.lc-applied`, `.ch-dot` | n/a | none |
| 17 | **Damping graph** | data-viz | native DOM | 1 | 1 | `.damp-graph`, `.an-chart`, `.ch-rule.dg-unity`, `.ch-ribbon` | n/a | none |
| 18 | **Graph legend** | data-viz | CSS | 1 | 1 | `.an-legend`, `.an-leg`, `.an-leg-mark` | n/a | none |
| none | **Radio** | none | **ABSENT** | none | 0 | none | none | deliberate: covered by segmented + select |
| none | **Drawer / Toast** | overlay | custom | 1 each | 1 each | `.drawer`, `.drawer-scrim`, `.toast` | drawer has no focus-trap/Esc story | overlays, not primitives, noted below |

---

## Contract cards: Controls

### 1 · Button

- **Surface** S1 (+ S2 instances). **Sites** ~20 `h("button"…)`; 85+ refs.
- **Anatomy** `[ icon? · label? ]`, no caret variant. Icon-only used for zoom (`zoomBy()`, `canvasTools` at `app.js:1552/1554`),
  drawer close (`_drawerHead()`, `overlays/drawer.js:132-138`). `btn()` emits `icon-only` in place of `ghost`
  when its only child is one `.ic` icon (`isIconOnly`, `app-helpers.mjs:402`); the two pane toggles carry
  `icon-only pane-toggle` (`paneToggle`, `app.js:1521`).
- **API** classes-as-variant: `.primary` (`styles.css:191`), `.ghost` (`styles.css:197`), `.icon-only` (a square
  control-height box, icon centered, borderless and transparent until hover, `button.icon-only`, `styles.css:201`),
  `.danger` (modifier on `.ghost`, `app-helpers.mjs:400`), `.add-pal-btn` (dashed, `styles.css:560`),
  `.ex-btn` (preview, `cursor:default`, non-interactive, `styles.css:993-996`), `.copy-float` (`styles.css:1182`),
  `.map-reset` (borderless icon, `styles.css:828`), `.pane-toggle` (color only on an icon-only button, `styles.css:438`),
  `.figma-plugin-btn`, `.undo-btn`/`.redo-btn` (`app.js:1465/1466`).
- **States** default · `hover` (`button:hover` `styles.css:190`) · `focus-visible` (`styles.css:208`) ·
  `disabled` (`styles.css:217`) · toggle-pressed (`.on` + `aria-pressed`, 7 sites in `src/ui/`: the `btn()` and
  `chip()` primitives plus five inline buttons:
  `aria-pressed` at `app-helpers.mjs:414/541`, `app.js:1522/1801`, `sections/color.js:516/923/1213`).
- **a11y** ✓ `:focus-visible` ring; ✓ `aria-pressed` on toggle-buttons; ✓ `aria-label` on icon-only
  (`sections/color.js:822`). ✗ no `forced_colors`.
- **Geometry** the cell roles: `min-block-size: var(--sh-control-height)`, `padding-inline: var(--sh-control-inset)`,
  `font-size: var(--sh-control-text)`, `border-radius: var(--sh-control-radius)`, `line-height: 1` and
  `white-space: nowrap`, so a label never wraps (`button`, `styles.css:173`). `test/repo/control-text.mjs` gates
  every shell control rule against literal text sizes and paddings.

```json
{ "component":"button","layer":"component","role":"button","replaces_native":false,
  "parts":["icon","label"],"variant_channel":"css-class (not a prop enum)",
  "states":["hover","focus-visible","disabled","pressed"],"keyboard":["native"],
  "forced_colors":false,"owns_outer_margin":false,
  "flags":["~9 variants encoded as ad-hoc classes, no orthogonal variant×size","no forced-colors"] }
```

### 2 · Toggle / switch  (was the worst card; now `switchControl()`)

- **Surface** S1. **Sites** 2: palette Enabled/Disabled (`switchControl`, `sections/color.js:1784`) and
  Chroma basis peak/gamut (`switchControl`, `sections/color.js:2198`). Hue space OKLCH/CAM16 is **not** a toggle any more:
  it is a `segmented()` `role=group` (`sections/color.js:2146`, card 3), as is its On-colors sibling
  (`sections/color.js:2187`).
- **Anatomy** `[ track (with ::after thumb) · label-span ]`. CSS `styles.css:1032-1048`; the `.track`
  is 34×19 with a 15px ::after thumb that translates on `.on`.
- **API** `switchControl({ on, onToggle, label, ariaLabel })` (`app-helpers.mjs:363`), a
  `<button type=button class="toggle" role="switch">` with `aria-checked` mirroring `on`, `aria-label`
  from `ariaLabel`, an `aria-hidden` track span and a visible `.toggle-label`. State = `aria-checked` +
  the `.on` class.
- **a11y** ✓ real `<button>`: focusable, `:focus-visible` ring, Space/Enter toggle from the platform;
  ✓ `role="switch"` + `aria-checked`; ✓ `aria-label` carries the stable purpose ("Palette enabled" /
  "Chroma basis: gamut when on, peak when off"). The palette site sits in a bare `field` div with no `<label>` at all
  (`sections/color.js:1783`); the Chroma basis site goes through `field()`, which also associates a
  `label[for]` (`app-helpers.mjs:551`).
- **Geometry** ad-hoc (34×19 track / 15px thumb).

```json
{ "component":"toggle","layer":"component","role":"switch","replaces_native":true,
  "parts":["track(aria-hidden)","thumb(::after)","label"],"states":["on"],"keyboard":["native button: Space/Enter"],
  "forced_colors":true,"owns_outer_margin":false,
  "flags":["palette site has no <label>; name comes from aria-label only"] }
```

### 3 · Segmented control

- **Surface** S1. **Sites** 14 static `segmented()` calls: section switcher `app.js:1478`; inspector
  tabs `sections/typography.js:596`, `sections/geometry.js:584` (the Color inspector lost its
  `[Palette|Global]` switch in #809: the selection picks the context); new-palette mode
  `sections/color.js:523`; canvas view `sections/color.js:800`; canvas stops `sections/color.js:815`;
  hue space `sections/color.js:2146`; on-colors `sections/color.js:2185`; breakpoint mode
  `sections/typography.js:177`, `sections/geometry.js:163`; specimen mode `sections/typography.js:308`,
  `sections/geometry.js:292`; Figma files `overlays/drawer.js:214`; and one settings-row call
  `overlays/settings.js:30` inside the settingRow helper, one live instance per settings row, called
  from 10 call sites (11-12 live rows) across `overlays/settings.js`. **Variants** as found, four stylings of one idea; today one
  compound styling (`.segmented`, `.figma-files`, `.radix-files` share one rule) plus three modifiers remain:
  - **Inspector tabs** `.segmented` in the Typography and Geometry inspectors, `role=tablist`/`tab`, roving
    tabindex, ArrowLeft/ArrowRight (`app.js:1776-1809`). *Well-built.*
  - **Canvas view** `.canvas-seg` `[Palettes|Scrims|Mapping|Radix]`, `role=tablist` (`sections/color.js:800-810`).
  - **Canvas stops** `.canvas-seg` `role=group` (`sections/color.js:815-823`); the Typography and Geometry
    breakpoint-mode and specimen-mode segments reuse the same modifier: `sections/typography.js:177`,
    `sections/typography.js:308`, `sections/geometry.js:163`, `sections/geometry.js:292`.
  - **New-palette mode** `.newpal-seg` `role=group`, `sections/color.js:525`, `styles.css:1245`.
  - **Settings rows** `.settings-seg` `role=group`, one live instance per row, `overlays/settings.js:30`,
    `styles.css:1365`.
  - **Drawer format picker**: the as-found `.drawer-tabs` segmented row no longer exists in `src/`; the
    format is chosen with a native labelled `<select>` (`label[for=export-format]` + `aria-label`,
    `overlays/drawer.js:177-186`; `.drawer-format`, `styles.css:1163-1165`), so it is a select (card 5), not a
    segmented control.
  - **Figma files** `.figma-files` (and the Radix picker `.radix-files`), now a `segmented()` call with
    `baseClass: "figma-files"` and `role=group` (`overlays/drawer.js:221`), so it carries the same roving
    tabindex + Arrow keys as every other `segmented()` site. Its own rules are gone: it takes the compound
    rule below (`.segmented, .figma-files, .radix-files`, `styles.css:976`).
- **Anatomy** `[ track (group) · segment (button)[] ]`; active = `.on` (`styles.css:989`).
- **Geometry** the compound rule (ADR-033): the container is one control height with a part-inset pad and
  the control radius (`.segmented, .figma-files, .radix-files`, `styles.css:976`); each segment is a part,
  part height tall, part inset inline, inset radius, so its corner stays concentric with the container's
  (`.segmented button, .figma-files button, .radix-files button`, `styles.css:983`). The small variant is
  gone: every segment reads the control text size.
- **a11y** ✓ every one of the 14 sites shares one keyboard model, set on each segment inside `segmented()`
  (`app.js:1739-1769`) regardless of role: roving `tabindex` and an ArrowLeft/ArrowRight `onkeydown`;
  `role=tablist` sites add `role=tab` + `aria-selected` + `aria-controls`, `role=group` sites add
  `aria-pressed`. The former `.drawer-tabs`/`.figma-files` keyboard gap is closed.
- **Composition** A4: composes the button primitive into a capacity-fixed group. No overflow story
  (acceptable, fixed 3–4 segments).

```json
{ "component":"segmented","layer":"component","role":"tablist|group","replaces_native":false,
  "parts":["track","segment"],"states":["on"],"keyboard":["ArrowLeft","ArrowRight"],
  "forced_colors":true,"owns_outer_margin":false,
  "flags":["1 compound styling (.segmented, .figma-files, .radix-files) + 3 modifiers (.canvas-seg, .newpal-seg, .settings-seg)","one segmented() helper backs every site (14 static call sites); drawer format is a native select now","no self-margin, the parent owns spacing: `segmented` (`styles.css:960-961`)"] }
```

### 4 · Slider / range  ★ the model primitive

- **Surface** S1. **Sites** one helper `slider(label,value,min,max,step,fmtFn,onInput)`
  (`app.js:2222-2247`), ~14 instances: Hue/Chroma/Skew/Lift/Edge-hue `sections/color.js:1854-1879`;
  Tension/L*min/L*max/Damp/Chroma-floor/Falloff/Amplify/Bias `sections/color.js:2109-2132`.
- **Anatomy** `.field` `[ label · readout(<b>) · input[type=range] ]`; track + custom `thumb` (`styles.css:977-991`).
- **API** clean function signature; `fmtFn` for the live readout, `onInput` callback; `data-fk`
  carries a focus key so re-render preserves focus, `app.js:2246`.
- **a11y** ✓ `aria-label` on the input (the sibling `<label>` is deliberately *not* associated,
  documented at `app.js:2220-2223`). Native keyboard, arrows/Home/End, inherited. ✗ no forced-colors on
  the custom thumb.
- **Verdict** the one consistently-factored primitive, every slider goes through one helper.

```json
{ "component":"slider","layer":"component","role":"slider","replaces_native":false,
  "parts":["label","readout","input(range)"],"states":["focus","disabled(native)"],
  "keyboard":["native arrows/Home/End"],"forced_colors":false,"owns_outer_margin":false,
  "flags":["custom thumb has no forced-colors fallback","label not associated (compensated by aria-label)"] }
```

### 5 · Select (native)

- **Surface** S1. **Sites** 3: Distribution (`field()`, `sections/color.js:2087`), Curve (`sections/color.js:2111`),
  `.map-raw-select` raw token (`sections/color.js:1341`, with `.ov` override state).
- **Anatomy** native `<select>` + `<option>[]`; `.map-raw-select` is a compact mono variant on the
  chip row of the cell (`styles.css:819-824`).
- **a11y** ✓ native keyboard/picker; ✓ `aria-label` on `.map-raw-select` (`sections/color.js:1335-1337`);
  ✓ Distribution/Curve are built through `field()` (`sections/color.js:2088/2113`), which stamps an `id`
  on the `<select>`, associates the `<label for>` with it and adds a fallback `aria-label`
  (`app-helpers.mjs:551-559`) → the visible label is the accessible name.
- **Flag** none; the two naming paths (`field()` vs inline `aria-label`) both yield a name.

```json
{ "component":"select","layer":"component","role":"combobox(native)","replaces_native":false,
  "parts":["select","option"],"states":["disabled(native)","ov(map only)"],"keyboard":["native"],
  "forced_colors":"native","owns_outer_margin":false,
  "flags":["two naming paths: field() label[for] vs inline aria-label"] }
```

### 6 · Text input

- **Surface** S1. **Sites** 2, palette **Name** in `.field` (`sections/color.js:1745-1747`), `.map-raw-input`
  free-text token editor (`sections/color.js:1331`, `.ov` override state).
- **a11y** ✓ `.map-raw-input` has `aria-label` (`sections/color.js:1331-1335`); ✓ **Name** is a
  `field()` row (`sections/color.js:1745`): the `<label for>` is associated with the input's stamped
  `id` and a fallback `aria-label` is set by `field()` (`app-helpers.mjs:551-559`) → named to SR.
- **Behaviour** both debounce into one undo step (`editDrag`) and survive re-render without losing
  focus/caret (partial `liveRefresh`, documented `sections/color.js:1751-1755`).

```json
{ "component":"text-input","layer":"component","role":"textbox(native)","replaces_native":false,
  "parts":["input"],"states":["focus","ov(map only)"],"keyboard":["native"],
  "forced_colors":"native","owns_outer_margin":false,
  "flags":["`input` (`styles.css:221`) shares its base style with select, across text/search variants"] }
```

### 7 · Search input

- **Surface** S1 (gallery). **Sites** 1, `this._searchInput` (`ensureSearchInput()`, `app.js:920-922`), **created once and
  reused** across renders so typing never loses focus (the documented bug-fix at `app.js:919-920`).
- **a11y** ✓ `aria-label` "Search palette sets" + placeholder. Native clear/keyboard.
- **Style** shares the `input[type="text"], input[type="search"], select` base (`styles.css:221`); width pinned in the
  `.gallery-title` selector (`styles.css:294`).

```json
{ "component":"search-input","layer":"component","role":"searchbox(native)","replaces_native":false,
  "parts":["input"],"states":["focus"],"keyboard":["native"],"forced_colors":"native",
  "owns_outer_margin":false,"flags":["singleton node reused across renders to preserve focus"] }
```

### 8 · Checkbox

- **Surface** S1. **Sites** 1, "ends bend same way" (`sections/color.js:1870-1878`, native `type=checkbox`).
- **Anatomy** `.mini-check` `<label>` **wrapping** the native input + text (`styles.css:902-903`) →
  label *is* associated (the correct pattern, unlike the sliders/Name input).
- **a11y** ✓ associated label, ✓ `accent-color: var(--accent)`, native keyboard (Space).
- **Note** the only native checkbox; the boolean-toggle role elsewhere is taken by the custom
  `.toggle` (card 2). The contrast is instructive, this one is accessible because it stayed native.

```json
{ "component":"checkbox","layer":"component","role":"checkbox(native)","replaces_native":false,
  "parts":["input","label"],"states":["checked","focus"],"keyboard":["Space (native)"],
  "forced_colors":"native","owns_outer_margin":false,
  "flags":["label-wrapped = associated (the right pattern)","only 1 instance"] }
```

### 9 · Chip / pill

Three unrelated "pill" stylings, a naming/coherence drift, not one primitive:
- **`.tile-tag`** (`styles.css:323-334`), non-interactive status badge on gallery tiles: palette
  count + "preset"/"ago" (`app.js:764/765/848/849`); `pointer-events:none`, absolute over the thumb.
- **`.chip` interactive**, the damping presets: `chip(name, { mode: "interactive", on })` renders a
  `<button class="chip" aria-pressed>` inside the `.damp-presets` row (`chip()`, `sections/color.js:168`;
  `.chip`, `styles.css:866-873`). The old `.damp-presets .preset` styling is gone;
  `.damp-presets` is now only the flex row (`styles.css:886`).
- **`.chip` status**, the drift summary: `chip(text, { tone })` renders a `<span class="chip">`
  (`chip()`, `sections/color.js:1386`) with the
  `.chip.in-sync` / `.chip.has-drift` tone classes (`styles.css:900-901`). The old `.map-drift-sum` selector is gone.

```json
{ "component":"chip","layer":"component","role":"status|button","replaces_native":false,
  "parts":["pill"],"states":["on(preset)","in-sync/has-drift(drift)"],"keyboard":["native(preset)"],
  "forced_colors":false,"owns_outer_margin":false,
  "flags":["3 separate pill stylings (tile-tag / preset / drift-sum), no shared chip primitive"] }
```

### 10 · Field wrapper

- **Surface** S1. **Sites** ~7 (every slider + Name + the selects/toggles in the inspector).
- **Anatomy** `.field` `[ label[ text · readout(<b>) ] · control ]`, label is `display:flex;
  justify-content:space-between` so the readout right-aligns, `styles.css:1006-1009`.
- **Role** the one genuine layout primitive (token-only, no domain name). Owns no outer margin:
  `.field { margin: 0; }` (`styles.css:1037`), the parent provides spacing; the only scoped exception is
  `.newpal-custom .field { margin-bottom: 16px; }` (`styles.css:1273`).

```json
{ "component":"field","layer":"primitive","role":null,"replaces_native":false,
  "parts":["label","readout","control(slot)"],"states":[],"keyboard":[],"forced_colors":"n/a",
  "owns_outer_margin":false,"flags":["no self-owned margin, margin: 0 on `field` (`styles.css:1001`); only .newpal-custom .field sets `margin-bottom` (`styles.css:1252`)"] }
```

---

## Contract cards: Data-viz marks (S3)

These are non-interactive native DOM/CSS marks (hover-outline at most); the charts are `.an-chart` boxes from `renderChart` (`src/ui/charts/render.mjs`), each series coloured by `--series`. Cards are lighter, anatomy +
classes + flags.

### 11 · Swatch / color-cell  ★ most-duplicated primitive

One concept, *a rectangle filled with a color, optionally over a transparency checkerboard*, in
**six idioms**: `.ramp-strip i` (26×40 ramp cell + `.oog` out-of-gamut hatch + hover outline, `styles.css:700-707`),
`.scrim-cell` + `.scrim-fill` (checkerboard, `styles.css:721-725`),
`.map-swatch` + `.map-swatch-fill` (checkerboard token swatch, `styles.css:792-796`), `.swatch-dot`
(now `swatch()`, `sections/color.js:1732`), `.roles-table .sw` (16px, now `swatch()` `.swatch`, `styles.css:777-778`), `.canvas-footer .sw` (12px,
`styles.css:938-941`). The checkerboard background is defined **once**, one rule shared by
`.swatch.alpha, .scrim-cell, .map-swatch` (`styles.css:729-735`, sized by `--checker`). **Flag:** the
cell *shapes* still differ per idiom; `swatch()` covers the dot and the roles-table cell only.

### 12 · Set-tile (composition)

`.set-tile` → `.set-thumb` `[ .strip i[] · .tile-tag×2 · .del ]` + `.set-meta` (`styles.css:271-315`;
built by `buildTiles()` `app.js:729` / `buildPresetTiles()` `app.js:813`). **Flag (as-found):** the tile was
a `<button>` with a clickable `.del` **`<span>`** inside it, *not* a button-in-button (so valid HTML),
but the delete was mouse-only (a span with `onclick`, no keyboard). **→ Fixed:** the editable tile is now
a `<div role=button>` (Enter/Space) so `.del` is a real, focusable `<button>`. (Preset tiles stay plain
`<button>`s, no nested interactive.)

### 13 · Ramp-row (composition)

`.ramp-row` `[ .enable · .drag-handle (⋮⋮ via ::before) · .ramp-name · .ramp-strip ]`
(`renderRampsScene` in `app.js`). Selectable (`.sel`) and toggle-able (`.off`). **Reorder is
ghost-based:** dragging the `.drag-handle` lifts a viewport-fixed clone (`.drag-ghost`) that tracks
the cursor while the source row collapses and a dashed `.drop-ghost` placeholder opens at the landing
slot; the drop slot is decided relative to that placeholder with a **10px deadzone** so it doesn't
jitter from the reflow (`_beginReorder` / `_buildDragGhost` / `_onReorderMove` / `_syncDropFromPlaceholder`).
`.enable` is now a real `role=button` (Enter/Space-operable); the `.drag-handle` claims the pointer
(`touch-action:none`). The clone is re-parented to the host, so its `light-dark()` tokens are pinned to
the source row's column `color-scheme` (`_schemeOfColumn`), not the chrome's.

### 14 · Contrast bar

`.an-bar` `[ .an-bk label · .an-track[ .an-fill(.bad) · .an-thresh 4.5:1 line ] · b(pass/fail) ]`
(`styles.css:525-538`). WCAG contrast viz with a fixed threshold line at 64.3%.

### 15 · Hue wheel

`.ch-circle.hw-circle` (axis) · `.ch-dot.hw-dot` (one dot per palette) · `.ch-ring` (accent ring on the
selected palette), native DOM polar plot in an `.an-chart.hw` box (`styles.css:541-544`).

### 16 · Tone / lightness curve

`.ch-rule.lc-axis` · `.ch-band.lc-ceiling` (gamut fill) · `.ch-ribbon.lc-toneline` (dashed reference, a
`--dash` mask) · `.ch-ribbon.lc-applied` (accent curve) · `.ch-dot`, native DOM L* curve in an `.an-chart`
box; each series rule sets `--series`, from `.lc-axis` to `.lc-dot` (`styles.css:920-927`).

### 17 · Damping graph

`.damp-graph` container + `.ch-rule.dg-unity` (dashed identity line, `styles.css:917-918`), the differential-damping falloff
curve as a `.ch-ribbon` in an `.an-chart` box (`graphDamping()` `sections/color.js:198`).

### 18 · Graph legend

`.an-legend` → `.an-leg` → `.an-leg-mark` with `.solid` / `.faint` / `.fill` series styles
(`styles.css:315-324`). Keys the overlaid series in the analysis graphs.

---

## Overlays (interactive, not primitives)

Noted for completeness (the "everything interactive" scope) but they are *patterns*, not primitives:

- **Export drawer** `dialog.drawer` (`renderDrawer` in `app.js`), a native `<dialog>` promoted to the
  browser **top layer** via `showModal()`, so `role=dialog`, focus-trap, `::backdrop`, background-inert,
  and `Esc`-to-close come for free; open/close is reconciled after each render by `_syncDrawer` (the
  single source of truth is `exportOpen`). A backdrop click closes it.
- **New-Palette modal** `dialog.newpal` (`renderNewPalette` in `app.js`), a centered, **header-draggable**
  native `<dialog>` (top layer, like the drawer; `_syncNewPal`). Two columns: a hue × chroma circle
  (`.newpal-hc`) + the reused chroma curve on the left; the derivation selection/picker + a **live
  proposed-palette preview** (`.newpal-pp-*` swatches + `.newpal-ramp`) on the right. The "Derive from"
  strip is swatch-only chips. See `knowledge-06-palette-derivation.md`.
- **Toast** `.toast`, transient confirmation (`role=status`, `aria-live=polite`).

## Notable absence: Radio

**No native radio and no custom radiogroup exists** (`grep type="radio"` → 0). The
mutually-exclusive-choice need is met by **segmented controls** (Distribution could be one; it's a
select) and **native `<select>`**. This is a coherent choice, not an oversight, recorded so the
inventory is complete.

---

## Findings & recommendations

Scored on the COMPOSE/REALIZE quadrant per group. The whole UI is **built-right-ish, designed-wrong**
for a *library* (it works, but there's no reusable contract), except the data-viz marks, which are
fine as bespoke one-offs.

### Severity-ranked

1. **✅ 🔴 Custom `.toggle` is inaccessible (card 2).** *Fixed*, `switchControl()` now emits a
   `<button role=switch>` with `aria-checked`, `:focus-visible`, and native Space/Enter. (3 sites
   migrated.)
2. **✅ 🔴 No forced-colors support anywhere.** *Fixed*, one `@media (forced-colors:active)` block
   (`styles.css`) re-asserts switch/segment/slider-thumb/chip state with `Highlight`/`ButtonText`
   system colors.
3. **✅ 🟠 Label-association drift.** *Fixed*, `field()` stamps `label[for]` + control `id` (and a
   fallback `aria-label`); Distribution, Curve, Name, Hue space, Chroma basis now have accessible
   names by construction.
4. **✅ 🟠 Segmented control had 4 stylings, 2 without the keyboard model.** *Fixed*, one
   `segmented()` helper (roving tabindex + arrows, `role=tablist`/`group`); all 6 sites migrated,
   incl. drawer-tabs + figma-files. Export tabs now wire `aria-controls`→`role=tabpanel`.
5. **✅ 🟡 Button variant sprawl.** *Fixed*, `btn()` with a 4-term vocabulary `{ghost, primary,
   danger, bare}`; layout classes (`figma-plugin-btn`, `figma-apply`, …) ride `cls`, off the variant
   axis. Variant-bearing + header buttons migrated; remaining uniform-`ghost` buttons adopt `btn()`
   opportunistically (no behavior change).
6. **✅ 🟡 Swatch duplication.** *Fixed (partial, by design)*, `swatch()` + `.swatch` primitive;
   the checkerboard is now defined **once** (was copy-pasted ×2, not ×3 as first stated) and reused by
   `.scrim-cell`/`.map-swatch`/`.swatch.alpha`. The simple opaque chips (inspector dot, role refs)
   migrated; the composite cells (ramp-strip, scrim-cell, footer) keep their layout but share the
   checkerboard.
7. **✅ 🟡 Three "chip/pill" stylings.** *Fixed*, `chip()` + `.chip` primitive with
   `interactive`/`status` modes + tones; `damp-presets` and `map-drift-sum` migrated. (The
   absolutely-positioned `.tile-tag` overlay badge stays separate, it is an overlay, not an in-flow
   chip.)
8. **✅ Self-owned outer margins** on `.field` / `.segmented`: resolved. Both are `margin: 0`
   (`styles.css:965`, `styles.css:925-926`, the latter with a "no self-margin" comment); the parent owns
   spacing. The earlier "deferred, intentional" note described a state that no longer exists.
9. **✅ ⚪ Set-tile nested interactive.** *Fixed + corrected*, it was a `.del` **`<span>`** (mouse-only)
   inside the tile `<button>`, not a button-in-button (so not invalid HTML, but the delete had no
   keyboard). The tile is now a `<div role=button>` (Enter/Space) so `.del` is a real focusable
   `<button>`.
10. **✅ ⚪ Drawer/Toast semantics + correction.** *Fixed*, drawer gets `role=dialog` +
   `aria-modal` + `aria-label`; toasts get `role=status` + `aria-live=polite`. Correction: `Esc`
   **already** closed the drawer (`app.js` keydown handler). A true focus-trap remains a follow-up.

### Extraction candidates: all landed

All six are now implemented (see Refactor status). Ranked as originally prioritized:

1. **`slider()`**: was already the model; now the documented reference primitive (unchanged).
2. **`segmented()`** ✅: 6 call-sites, 4 stylings → one helper.
3. **`swatch()`** ✅: primitive + checkerboard-once (composite cells share it; full cell migration deferred).
4. **`btn()`** ✅: variant vocabulary established.
5. **`switchControl()`** ✅: rebuilt accessibly (fixed finding #1 + dedup 3 sites).
6. **`chip()`** ✅: 3 stylings → one (`.tile-tag` overlay intentionally separate).

### Quadrant snapshot: after the refactor

| Group | COMPOSE | REALIZE | Cell |
|---|---|---|---|
| Slider, Checkbox, Search | ✓ clean, reused | ✓ native a11y | **SHIPPABLE** |
| Switch, Segmented, Chip, Field | ✓ one factory each | ✓ role + keyboard + forced-colors | **SHIPPABLE** *(was REBUILD / designed-wrong)* |
| Button, Select, Text input | ✓ `btn()`/`field()` contract | ~ native or focusable | SHIPPABLE-ish *(remaining ghost buttons adopt `btn()` incrementally)* |
| Data-viz marks (14–18) | ✓ bespoke, fine | ✓ | SHIPPABLE (as one-offs) |
| Swatch | ✓ primitive; composite cells share the checkerboard | ✓ | SHIPPABLE *(cell migration deferred)* |

## GRADE: the new factories (component-decomposer)

A GRADE-mode pass over the six factories, **scored in-context**. Important framing: the
component-decomposer rubric assumes a *shadow-DOM, FACE-based custom-element library*. This app is
deliberately **one light-DOM web component with factory helpers** (the documented helper-factory
scale). So the REALIZE gates the rubric reserves for standalone elements, **B2** autonomous element,
**B3** FACE/form-association, **B1** a sizing ramp, are **N/A-by-design** here (one host element, no
`<form>`s, no declared ramp), not failures. They become real only if a factory is ever extracted into
a standalone library. Graded on that basis:

| Factory | A·COMPOSE (layer→anatomy→API→compose→cohere) | B·REALIZE (geometry→element→semantics→interaction→fidelity) | Cell |
|---|---|---|---|
| **`switchControl()`** | 5, right layer; named parts; tight `{on,onToggle,label,ariaLabel}` API; no self-margin | 5, native `<button>`; `role=switch`+`aria-checked`; Space/Enter; `:focus-visible`; forced-colors | **SHIPPABLE** |
| **`segmented()`** | 5, composes buttons into a group; `role` opt (tablist/group); `controls`→tabpanel; orthogonal | 5, roving tabindex + arrows (APG); re-focus after render; forced-colors `.on` | **SHIPPABLE** |
| **`field()`** | 5, layout primitive; label↔control contract; no self-name leakage | 5, `label[for]`/`id` association; fallback `aria-label`; preserves control's own name | **SHIPPABLE** |
| **`btn()`** | 4, clean `{ghost,primary,danger,bare}` vocab + `cls` for layout; *−1:* `size` not yet an axis | 5, native button semantics; `ariaPressed`/`disabled`/icon-only `ariaLabel`; forced-colors | **SHIPPABLE** |
| **`chip()`** | 4, `interactive`/`status` modes + tones; *−1:* the `.tile-tag` overlay stays a separate primitive (correct, but the family isn't single) | 5, button(pressed)/span(status); forced-colors border + Highlight | **SHIPPABLE** |
| **`swatch()`** | 4, one chip primitive + shared checkerboard; *−1:* composite cells (ramp/scrim/footer) not folded in (by design) | 4, decorative `aria-hidden`; `--sw` size; *−1:* size is free, not on a ramp | **SHIPPABLE** |

**One systemic finding (unchanged by the refactor):** geometry is **ad-hoc, off any ramp**, button
padding `4px 9px`, switch track `34×19`, swatch sizes passed per-call. The component-decomposer's
`(height − glyph)/2` law + XS–2XL ramp is the one thing none of these adopt. Not a regression (it was
always so), but it's the highest-leverage *next* systematic move if this ever grows toward a real
library: a size ramp + derived paddings, machine-checked. Until then the factories are the right
shape for a single internal app.

**Verdict:** all six land in **SHIPPABLE** in-context; none are *designed-right-built-wrong* or
*built-right-designed-wrong*. The two 4/5 COMPOSE scores (`btn` size-axis, `chip`/`swatch` family
completeness) are deferred-by-design scope lines, not defects.
