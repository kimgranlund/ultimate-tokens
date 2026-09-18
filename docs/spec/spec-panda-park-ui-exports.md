---
doc-type: spec
id: spec-panda-park-ui-exports
status: approved        # draft | approved | superseded  (0.1.0 approved 2026-09-11: H-1..H-4, P-1, N-1..N-3 ratified by the owner via team-lead)
version: 0.3.0          # 0.1.1 2026-09-11: REQ-021 steps 1-8 corrected to raw ramp stops (issue #588 ruling); EX-4 regenerated. Data correction to an approved SPEC, not a new draft round.
                        # 0.2.0 2026-09-12: ticket #614 renamed the "Park UI" format to "Radix" everywhere in
                        # the live surfaces (exportParkUi/exportParkUiModule -> exportRadix/exportRadixModule,
                        # format id parkui -> radix, drawer label/zip folder park-ui/ -> radix/) — a rename
                        # only, no shape change; validated against real Radix/Park UI docs per #588/#603. The
                        # REQ-020..028/041..043/050..052/061/063 sections below are left as originally
                        # ratified (they describe the #570 build under its then-current names) rather than
                        # rewritten to match the new names — this version note is the record of the rename.
                        # 0.3.0 2026-09-18: ticket #638 adds a reference form of the Radix preset (REQ-029
                        # under R-B, a new gate row REQ-065 under R-E), one format with two forms, not an
                        # eleventh format. Owner rulings on Q(a)..Q(f) (below, dated 2026-09-18) and the U0
                        # spike result are the record of the decision; existing REQ text is unchanged.
date: 2026-09-11
owner: Kim Granlund
prd: none               # GitHub issue #570 is the intent record (ADR-017 git-native tickets)
scope: feature
audience: builder, reviewer, planner
---
# SPEC: Panda CSS and Radix export formats

(Renamed from "Panda CSS and Park UI export formats" at 0.2.0/ticket #614 — see the version header.
Park UI is still named throughout this SPEC where it is the accurate historical/technical referent:
the format is a Panda preset built in Park UI's own token shape, and Park UI was the format's
original real-world consumer.)

Intent record: GitHub issue #570 (`kind:feature`, `size:big`, `lane:exports`). Structural precedent:
`exportShadcn` in `src/engine/exports.js` (a curated, fixed-contract framework format driven by
name-matched palettes). Procedure of record: the `adding-export-formats` skill (serializer, then the
three wiring sites, then the shape gate). Shapes of record: `docs/reference/references/
knowledge-04-export-formats.md`. Color system of record: `docs/spec/spec-muted-base-key-spikes.md`
0.3.0 (25 export stops per ramp, 53 roles, the seven-swatch prime system, the 16-palette default
document with `data-1..8`, palette groups as an editor concept).

Sibling in flight: #569 (`docs/plan/archive/plan-2026-09-export-schema-revision.md` on branch
`docs/569-export-plan`) revises the existing formats and stamps `EXPORT_SCHEMA_VERSION`. This SPEC
adds two NEW formats and does not restate #569's rulings; the overlap is named in "Overlap with #569".

Charter correction: the charter says "19-stop ramps". `derivePalette` emits the 25 `EXPORT_STOPS`
(`050, 075, 100, 125 … 950`); every mapping below is written against 25.

## Research record (2026-09-11)

Sourced by two research passes on 2026-09-11; every fact below carries its source. Confidence
marks: `[verified]` read from the primary page or source file that day, `[inferred]` from a
summarized page, `[open]` not found.

Panda CSS (panda-css.com, github.com/chakra-ui/panda):

- **PF-1** A preset is `{ name, theme, conditions?, globalCss?, patterns?, utilities?, staticCss? }`;
  `name` is required and must be unique. Consumed through `defineConfig({ presets: [...] })`; later
  entries win. Setting `presets` at all drops `@pandacss/preset-panda` unless it is re-listed;
  `@pandacss/preset-base` is always included unless `eject: true`. `theme.extend` deep-merges,
  bare `theme` replaces. `definePreset` / `defineTokens` / `defineSemanticTokens` are typing helpers
  only. Sources: panda-css.com/docs/customization/presets, /docs/concepts/extend,
  /docs/theming/tokens `[verified]`.
- **PF-2** Every token leaf is `{ value }`; groups nest arbitrarily; a `DEFAULT` key is the value
  used when the group is referenced unindexed. Categories include `colors, fonts, fontSizes,
  fontWeights, lineHeights, letterSpacings, radii, spacing, sizes, borderWidths, shadows, durations,
  easings, opacity, zIndex`. Dimension values are CSS strings (`"12px"`, `"0.75rem"`); numbers are
  documented only for `opacity`/`zIndex`. Source: /docs/theming/tokens `[verified]`, string-only
  `[inferred]`.
- **PF-3** Semantic tokens: `{ value: { base, _dark, _light, … } }`; references use `{colors.x.y}`
  and resolve by dot path across categories. `preset-base` defines `dark: '.dark &'`,
  `light: '.light &'`, `osDark: '@media (prefers-color-scheme: dark)'`, `osLight`. Custom conditions go
  through `conditions.extend`. Source: `packages/preset-base/src/conditions.ts` on `main`
  `[verified]`. Semantic-to-semantic aliasing is not documented on the Tokens page `[open]`, but
  Park UI's own preset does it (`fg.default: { value: '{colors.gray.12}' }` where `gray` is itself a
  semantic token), see KF-4, so it is treated as supported and the codegen smoke (REQ-071) proves it.
- **PF-4** Colors are opaque strings; no format validation was found; `oklch()` passes through.
  `light-dark()` emission is a requested, unimplemented feature (discussion #3522, last activity
  2026-06-03), do not emit it. The `/opacity` modifier mixes `in srgb`. Generated custom properties
  are `--{category}-{dot.path with '-'}`, e.g. `colors.primary.500` → `--colors-primary-500`;
  `cssVarRoot` defaults to `:where(:root, :host)`. Sources: /docs/concepts/color-opacity-modifier,
  /docs/theming/usage `[verified]`, github.com/chakra-ui/panda/discussions/3522 `[verified]`.
- **PF-5** `textStyles` leaves are `{ value: { fontFamily, fontWeight, fontSize, lineHeight,
  letterSpacing, textDecoration, textTransform } }`; sub-fields may be references. Source:
  /docs/theming/text-styles `[inferred]`.
- **PF-6** `panda codegen` and `panda cssgen [tokens]` need `@pandacss/dev` installed (or fetched by
  `npx`); no JSON Schema for a config or preset exists; `@pandacss/types` is TypeScript types only.
  There is no zero-install validator. Sources: /docs/references/cli, /docs/installation/cli,
  npmjs.com/package/@pandacss/types `[inferred]`, schema absence `[open]`.
- **PF-7** `@pandacss/preset-panda` colors are the Tailwind palette verbatim, steps `50 … 950`, plus
  `current/black/white/transparent`. Source: `packages/preset-panda/src/colors.ts` `[verified]`.

Park UI (park-ui.com, github.com/chakra-ui/park-ui, formerly cschroeter/park-ui):

- **KF-1** `@park-ui/panda-preset` with `createPreset({ accentColor, grayColor, radius })` is
  retired: last publish v0.43.1 on 2024-11-22; the changelog says the preset package was
  "eliminated" in favour of `@park-ui/cli` (v1.0.1, 2025-11-20), which copies the preset source and
  each component's recipe INTO the consumer's repo. Park UI joined the Chakra UI org 2025-11-27.
  Sources: park-ui.com/changelog, registry.npmjs.org/@park-ui/panda-preset,
  registry.npmjs.org/@park-ui/cli, park-ui.com/blog/park-ui-joins-the-chakra-ui-organization
  `[verified]`.
- **KF-2** Current install: a Panda CSS project, then `npx @park-ui/cli init`, `add <component>`, and
  `add <colorname>`. The docs also ship a Panda plugin that removes `preset-panda`'s colors on
  `preset:resolved` (exported as `plugin` from `packages/preset/src/index.ts`). Source:
  park-ui.com/docs/installation, `packages/preset/src/index.ts` `[verified]`.
- **KF-3** A Park UI colour is `defineSemanticTokens.colors({ '1'..'12': { value: { _light, _dark } },
  a1..a12: { value: { _light, _dark } }, solid: { bg: { DEFAULT, hover }, fg: { DEFAULT } },
  subtle: { bg: { DEFAULT, hover, active }, fg: { DEFAULT } }, surface: { bg: { DEFAULT, active },
  border: { DEFAULT, hover }, fg: { DEFAULT } }, outline: { bg: { hover, active }, border: { DEFAULT },
  fg: { DEFAULT } }, plain: { bg: { hover, active }, fg: { DEFAULT } } })`, the numbered steps being
  Radix Colors values unmodified ("12 shades per mode"). Recipes read the appearance groups
  (`colorPalette.solid.bg`, `colorPalette.subtle.fg`, …), never the raw numbers. Source:
  `packages/preset/src/theme/colors/amber.ts`, `recipes/button.ts`, `recipes/avatar.ts`,
  park-ui.com/docs/theming `[verified]` for the files read; "every recipe" `[inferred]` (two of ~45
  recipes were read).
- **KF-4** Global semantic tokens in `index.ts`: `gray` (a copy of the chosen gray scale),
  `fg.default / fg.muted / fg.subtle`, `canvas`, `border` (one flat token), `error` (→ `red.9`),
  `bg.subtle` (marked deprecated). Radii aliases `l1 → {radii.xs}`, `l2 → {radii.sm}`,
  `l3 → {radii.md}`. Text styles `xs … 7xl` plus `label`. There is NO `bg.default/muted/emphasized/
  disabled`, no `fg.disabled`, no `border.*` variants, no `colorPalette.default/emphasized/fg/text`
  (the charter's guessed shape). Source: `packages/preset/src/index.ts`, `theme/text-styles.ts`
  `[verified]`.
- **KF-5** Not resolved: whether a first-class Tailwind path still exists (`@park-ui/tailwind-plugin`
  last published 2024-03-06; users reference `var(--colors-accent-a2)` by hand in issue #346), and the
  exact `radius` option value set (an AI-summarised `none … 2xl` list, unconfirmed). Neither blocks
  this SPEC: v1 targets the Panda path only.

Consequences that shape the design:

- Both formats are Panda presets. Park UI has no format of its own any more; a "Park UI export" is a
  Panda preset whose `semanticTokens.colors` carries Park-shaped colour objects, layered after the
  CLI-copied Park preset so `accent` and `gray` resolve to the brand.
- A 12-step projection is REQUIRED for Park UI (KF-3); a 25-stop ramp cannot be handed to its
  recipes. The Panda format itself needs no projection and carries the full ramp.
- Dark mode is a `.dark` class condition (PF-3), the same convention `exportShadcn` and the DS bundle
  already document; `light-dark()` is off the table (PF-4).
- No zero-install validator exists (PF-6). `npm test` validates structure with our own walker; a
  real `panda cssgen` run is a separate, network-using leg like `npm run smoke`.

## Vocabulary

- **Preset module**: an ESM string, `export default { … }`, whose default export is a Panda preset
  object (PF-1). No import of `@pandacss/dev`; `definePreset` is a no-op typing helper the consumer
  may wrap it in. The object is what the engine returns; the string is what the drawer shows and the
  zip ships.
- **`panda`** (format id): the full brand kit as a Panda preset, ramps, scrims, prime, the 53 roles
  per palette, system constants, and (after H-1) fonts, text styles, radii, spacing, border widths.
- **`parkui`** (format id): a Panda preset that carries every enabled palette in Park UI's colour
  shape (KF-3) plus Park's global aliases (KF-4), with `accent` and `gray` bound to the driver
  palettes.
- **Driver palettes**: neutral, primary, danger, picked by the name regexes `exportShadcn` uses
  today (`/neutral|gray|grey|slate|stone|zinc|mono/`, `/primary|brand/`,
  `/danger|destruct|error|critical|red/`), data palettes excluded from every pick (0.3.0 REQ-031).
- **Role key**: a role's suffix without its leading dash (`-on-surface` → `on-surface`); the bare
  accent role (suffix `""`) is `DEFAULT`.
- **Ladder step**: one of Park UI's `1 … 12`; **alpha step**: `a1 … a12`.
- **Flattened**: a translucent role end composited over an opaque background in 8-bit sRGB,
  `out = round(a * c + (1 - a) * bg)` per channel.
- **Alpha projection**: the Radix Colors construction of an alpha step from a solid: over white
  (light) `a = max_c(1 - t_c / 255)`, `C_c = round((t_c - 255 (1 - a)) / a)`; over black (dark)
  `a = max_c(t_c / 255)`, `C_c = round(t_c / a)`; `a = 0` yields `transparent`. Exact in sRGB;
  compositing the result over its reference background reproduces the solid within one 8-bit step.

## Requirements

### R-A. The `panda` format (`exportPanda`)

- **REQ-001** `exportPanda(state, opts = {})` in `src/engine/exports.js` returns a preset OBJECT
  `{ name, theme: { extend: { tokens, semanticTokens, textStyles? } } }`. `name` is
  `"ultimate-tokens-" + slug(state.name || "brand-kit")`. `theme.extend`, never bare `theme` (PF-1),
  so `preset-panda` survives in the consumer's config. `exportPandaModule(preset)` renders the
  preset module string: a two-line header comment (`/* Panda CSS preset, generated by Ultimate
  Tokens. presets: ['@pandacss/preset-panda', preset]; dark mode = the .dark class (_dark). */`)
  then `export default ` + `JSON.stringify(preset, null, 2)` + `;\n`. Placement of the #569 schema
  stamp: see "Overlap with #569".
- **REQ-002** `tokens.colors.{n}.{stop}` for every enabled palette `p` (`n = p.n`) and every one of
  the 25 export stops, the key being the UNPADDED stop (`"50"`, `"75"`, `"100"`, … `"950"`), the
  Panda/Tailwind convention (PF-7), the same choice `exportTailwind` makes, NOT ADR-006 padding
  (ratified N-1). Value: `{ value: oklch(stop) }` through `oklchStr(rgbToOklch(rgb))`, identical to the
  Tailwind string for the same stop.
- **REQ-003** `tokens.colors.{n}.scrim.{step}` for the 11 `SCRIM_STEPS` over base 500, unpadded
  step keys, value `oklch(… / {alpha}%)` through `roleOklch({ rgb, frac })`.
  `tokens.colors.{n}.prime.{step}` for the seven `PRIME_STEPS` in ladder order, value the swatch's
  own `oklch` triple (as Tailwind), plus `tokens.colors.{n}.prime.DEFAULT` equal to the `prime` swatch
  so `{colors.primary.prime}` resolves.
- **REQ-004** `tokens.colors.constant.{white, black, backdrop}`: `whiteOklch()`, `blackOklch()`,
  `dialogBackdropOklch()`. Not `colors.white`/`colors.black` (they would override `preset-panda`'s).
- **REQ-005** `semanticTokens.colors.{n}.{roleKey}` for all 53 roles of every enabled palette,
  value `{ value: { base: roleOklch(r.light), _dark: roleOklch(r.dark) } }`, the bare accent role
  as `DEFAULT`. Raw and semantic keys never collide inside a palette group because raw keys are
  digits or the two group words `scrim`/`prime`, and no role key is `scrim`-prefixed-digit or
  `prime`. The role `scrim` (a leaf at `colors.{n}.scrim`) coexists with the raw group
  `colors.{n}.scrim.{step}` exactly as `--c-{n}-scrim` and `--c-{n}-scrim-050` coexist in CSS;
  Panda walks `tokens` and `semanticTokens` separately and flattens by dot path (PF-4), so the two
  never share a flat path. REQ-071 proves it; the fallback if codegen rejects it is renaming the
  raw group to `scrims` (ratified N-2, only if triggered).
- **REQ-006** Roles emit RESOLVED values, never `{colors.{n}.{stop}}` references. A role whose light
  and dark ends are byte-equal (every scrim-backed role, `on-{n}` at default settings) still emits
  both `base` and `_dark`, one shape for all 53 keys (the gate counts them).
- **REQ-007** Type block (ratified H-1; the emitter takes `opts.type` = a resolved `typeScale`, as
  `exportShadcn` takes `opts.fonts`): `tokens.fonts.{display, heading, body, ui, mono}` with the
  quoted stack `typeTokensCSS` already emits (`'Inter Tight', sans-serif`); `textStyles.{voice}.{sm,
  md, lg}` for the 15 voices (`voice` = the CSS voice slug `typeTokensCSS` uses, e.g. `sub-heading`,
  `ui-control`), value `{ fontFamily: "{fonts.{slot}}", fontSize: "{size}px", lineHeight:
  "{lineHeight}px", letterSpacing: "{letterSpacing}px", fontWeight: {weight}, textTransform }`, and
  `textStyles.{voice}.DEFAULT` equal to `md`. `paragraphSpacing`/`paragraphIndent` are not Panda
  text-style fields and are dropped. Without `opts.type` the block is absent (backward-compatible,
  the shadcn precedent).
- **REQ-008** Geometry block (ratified H-1; `opts.geometry` = a resolved `geomScale`): `tokens.radii.
  {none, xs, sm, md, lg, xl, full}` in `px` (`full` = `9999px`), `tokens.spacing.{0 … 9}` in `px`,
  `tokens.borderWidths.{thin, thick}` in `px`. Values are strings (PF-2). The size ramp, insets,
  gaps, and focus are NOT emitted in v1 (non-goal; a `sizes` mapping needs its own ruling).
- **REQ-009** Every emitted colour string is either an `oklch(...)` string produced by the shared
  helpers or a `{…}` reference; no hex, no `light-dark()`, no `var()`.

### R-B. The `parkui` format (`exportParkUi`)

- **REQ-020** `exportParkUi(state, opts = {})` returns a preset OBJECT `{ name: "ultimate-tokens-park-
  ui-" + slug(...), theme: { extend: { semanticTokens: { colors, radii? } } } }`; `exportParkUiModule`
  renders the module string with a header naming the driver bindings (`accent = primary, gray =
  neutral, error = danger`) and the install line (`presets: [parkPreset, utParkPreset]`, ours last).
  Returns the `/* Park UI export needs at least one enabled non-data palette. */` sentinel when no
  driver can be picked, mirroring `exportShadcn`.
- **REQ-021 (12-step projection, ratified P-1, corrected 2026-09-11 by issue #588's ruling)** For
  every enabled palette, ladder step `k` per mode (`base` = light end, `_dark` = dark end) is:

  | Step | Radix job | Light stop | Dark stop | Opaque? |
  |---|---|---|---|---|
  | 1 | app background | `100` | `900` | yes (raw stop) |
  | 2 | subtle background | `125` | `875` | yes (raw stop) |
  | 3 | UI element background | `150` | `850` | yes (raw stop) |
  | 4 | hovered element background | `175` | `825` | yes (raw stop) |
  | 5 | active / selected element | `200` | `800` | yes (raw stop) |
  | 6 | subtle border, separator | `250` | `750` | yes (raw stop) |
  | 7 | element border, focus ring | `300` | `700` | yes (raw stop) |
  | 8 | hovered border | `350` | `650` | yes (raw stop) |
  | 9 | solid background | (bare accent role, `550`/`450`) | | yes (role) |
  | 10 | hovered solid | (`-hover` role, `650`/`350`) | | yes (role) |
  | 11 | low-contrast text | (`-on-surface-variant` role, `750`/`250`) | | yes (role) |
  | 12 | high-contrast text | (`-on-surface` role, `950`/`050`) | | yes (role) |

  Steps 1..8 are RAW RAMP STOPS: opaque values read directly from `derivedAll`'s `p.stops[key].rgb`
  at exactly the light/dark stop numbers above, through the same `oklchStr(rgbToOklch(...))` path
  `exportTailwind`/REQ-002 already use for raw stops. They are never role-indirected (no
  `-surface-lowest`/`-outline`/etc. role lookup) and never flattened over step 1 or any other
  background — the original ratification's role-indirection and step 6..8 flattening are
  superseded for steps 1..8 by this table. Steps 9..12 are UNCHANGED: still the bare
  accent/`-hover`/`-on-surface-variant`/`-on-surface` roles, because those already matched the
  corrected source (issue #588's ruling comment, 2026-09-11, compared against
  `src/engine/semantic.js`'s actual role stops and found already correct).

  Canonical source: `docs/reference/data/radix-projection.json` (the committed projection table)
  and `docs/reference/references/radix-park-adaptation.md` (the architecture + rules this table
  comes from — source-of-truth direction, Prime/Scrim namespace separation, data-driven
  exceptions).

  Alternative rejected: picking 12 of the 25 stops evenly, and (the original P-1 default, now
  superseded for 1..8) role-indirecting steps 1..8 through `-surface-*`/`-outline-*` and
  flattening 6..8 over step 1. Steps 1..8 read the ramp's own stops directly because the Radix
  job at each of those steps IS a raw opaque tonal stop in the corrected source mapping, not a
  translucent role composited to look opaque. The stop sequence stays monotone by construction
  for every palette (light stops 100→200 darken step over step, dark stops 900→800 lighten step
  over step, mirroring each other), which keeps steps 1..5 ordered.
- **REQ-022** Alpha steps `a1 … a12` are the alpha projection of the same-numbered solid step, over
  white in `base` and over black in `_dark`, emitted as `oklch(L C H / a%)` strings (`a` to one
  decimal) through `roleOklch({ rgb: C, frac: a })`; a step whose projection is `a = 0` emits
  `"transparent"`. Verified unaffected by the #588 correction: this formula reads "the
  same-numbered solid step" generically, never assumed steps 6..8 were translucent, and needs no
  wording change now that steps 6..8 are raw ramp stops rather than flattened role values — `a6/a7/
  a8` simply project from the new (raw) `6/7/8` solids.
- **REQ-023** Appearance groups per palette, aliasing the palette's own steps by reference (the
  shape of KF-3, the step numbers to be confirmed against `amber.ts` by the K3 builder and recorded
  in the Findings of #570; the gate asserts keys, not numbers). Verified unaffected by the #588
  correction: these aliases reference step/alpha-step NUMBERS only (`a6`, `a7`, `9`, `10`, `11`, …),
  never assumed steps 6..8 were translucent, so the wiring is unchanged — only what steps 6..8 ARE
  (raw stops, not flattened roles) changed, and these aliases resolve to whatever REQ-021/REQ-022
  now emit for those numbers:
  `solid.bg.DEFAULT → {colors.{n}.9}`, `solid.bg.hover → 10`, `solid.fg.DEFAULT →
  {colors.{n}.on-accent}` (see REQ-024), `subtle.bg.DEFAULT → a3`, `.hover → a4`, `.active → a5`,
  `subtle.fg.DEFAULT → 11`, `surface.bg.DEFAULT → a2`, `.active → a3`, `surface.border.DEFAULT → a6`,
  `.hover → a7`, `surface.fg.DEFAULT → 11`, `outline.bg.hover → a2`, `.active → a3`,
  `outline.border.DEFAULT → a7`, `outline.fg.DEFAULT → 11`, `plain.bg.hover → a3`, `.active → a4`,
  `plain.fg.DEFAULT → 11`.
- **REQ-024** Two extra leaves per palette beyond Park's shape, because Park's scale has no solid
  on-colour: `{n}.on-accent` = the palette's `-on-{n}` role (mode-flipping) and `{n}.prime` = the
  prime swatch (mode-independent, `base` only). They are additive keys inside the same object and
  break nothing that reads Park's keys.
- **REQ-025** `accent` is a deep copy of the primary driver's object, `gray` of the neutral driver's,
  with every internal `{colors.primary.…}` reference rewritten to `{colors.accent.…}` /
  `{colors.gray.…}` so the copy is self-contained (Park's own `gray: colorPalettes.neutral` is a copy,
  KF-4). `error` = `{ value: "{colors.{danger}.9}" }`.
  *Amendment (#630):* a palette whose slug equals one of the seven reserved alias keys of REQ-025/026
  is emitted under `<slug>-palette`, suffix repeated until the key is neither reserved nor another
  palette's slug (`radixPaletteKey`); the driver clones and `error` reference that renamed key. A
  non-reserved slug is never renamed, even when two palettes share it. The seven alias keys
  themselves are unchanged.
- **REQ-026** Globals, verbatim Park keys (KF-4): `fg.default → {colors.gray.12}`, `fg.muted →
  {colors.gray.11}`, `fg.subtle → {colors.gray.10}`, `canvas → {colors.gray.1}`, `border →
  {colors.gray.7}`, `bg.subtle → {colors.gray.2}` (kept because Park still ships it, deprecated
  there). No invented keys (`bg.default`, `fg.disabled`, `border.muted`), those do not exist in
  Park UI.
- **REQ-027** `semanticTokens.radii.{l1, l2, l3}` = `{radii.xs}`, `{radii.sm}`, `{radii.md}` (Park's
  own aliases) and, when `opts.geometry` is given, `tokens.radii` as in REQ-008 so the aliases land
  on the brand corners. Text styles are NOT emitted in v1 (ratified H-2; Park's `xs … 7xl` scale is a
  size ladder, ours is a voice ladder, and the mapping is a design call).
- **REQ-028** Data palettes are emitted like every other palette (so `colorPalette="data-3"` works in
  a Park recipe) and are never picked as a driver.
- **REQ-029 (reference form, ticket #638, owner rulings dated 2026-09-18)** `exportRadix(state, {
  refs: true })` emits the SAME preset shape as REQ-020..028 (same keys, same group names, same
  internal `{colors.…}` aliases, same Pro gating), with every numbered step leaf's `base`/`_dark`
  replaced by a `var(--{pfx}-{n}-{frag})` LINK into this kit's own CSS custom-property layer instead
  of a baked `oklch(...)` value. One format with two forms, never an eleventh format; the format id
  stays `radix`. Owner rulings, each cited to its plan question in `.sdlc/638-plan.md` §1:

  | Q | Ruling |
  |---|---|
  | (a) reference target | a1: raw palette primitives for all 12 steps, 1..8 the ratified stop `RADIX_RAW_STEPS` already reads (REQ-021's own table), 9..12 the driving role's own `lightRef`/`darkRef` (so role overrides, `accentRef`, and on-color policy travel with the link); `prime` links the `prime-prime` identity primitive. Alpha steps `a1..a12` stay computed (REQ-022), since no primitive exists for an alpha projection. |
  | (b) output shape | b2: ONE format, an engine flag; a "Values · References" sub-bar on the existing Radix tab (the Figma-tab mode-file pattern); both files ship in the `radix/` zip folder; Pro gating unchanged. |
  | (c) ladder mapping | c1: identity mapping to the stops the engine already reads, no re-derivation, no snapping to a different stop set. |
  | (d) reserved alias keys (#630) | d1: the group key stays `radixPaletteKey` (`<slug>-palette`); its references use the palette's RAW slug `p.n`, never the renamed key, because the primitive surfaces (`exportCSS`/`exportOKLCH`) only ever emit under the raw slug. |
  | (e) reference syntax | e1: a CSS custom property `var(--{pfx}-{n}-{frag})`, prefix from `cssPrefixOf(state)`, the same names `exportCSS`/`exportOKLCH` emit, and the ratified shadcn `aliasPrefix` precedent (REQ-051's sibling format). Leaves keep `{ base, _dark }` so Park UI's `.dark` class condition still flips. |
  | (f) schema stamp | bump `EXPORT_SCHEMA_VERSION` 2 → 3 (`src/engine/exports.js`), the `hpg-export-schema-stamp` gate literal, and the MCP `SERVER.version` sibling, all in the same commit. |

  U0 spike result (recorded before U1 started): Panda 1.12.1 passes a raw `var()` string through a
  `{ base, _dark }` semantic-token leaf unchanged, confirming (e1) is viable without falling back to
  a Panda-token-path alternative.

  The values form (REQ-020..028) is unchanged by this REQ: `exportRadix(state)` with no `opts.refs`
  is byte-identical to the pre-#638 output, stamp line excepted.

### R-C. Shared engine

- **REQ-040** The driver pick is extracted from `exportShadcn` into `pickDrivers(palettes)` →
  `{ neutral, primary, danger, success, warning, secondary }` and reused by `exportShadcn`,
  `exportParkUi`, and (for `accent`/`gray` naming in the header only) `exportPanda`. `exportShadcn`'s
  output is byte-identical before and after the refactor (gate).
- **REQ-041** Two new pure helpers in `exports.js`: `flattenOver(end, bgRgb)` and
  `alphaProject(rgb, mode)` (the Vocabulary formulas), exported for the test's independent check.
  Note (2026-09-11, #588 correction): REQ-021's steps 1..8 no longer flatten anything (they are raw
  ramp stops), so `flattenOver` has no caller inside `exportParkUi` after this correction; it
  remains exported per this REQ, and whether it stays a live helper, a test-only utility, or is
  dropped is the K3 builder's call to record in #570's Findings, not restated here.
- **REQ-042** `exportAll` gains `panda: exportPanda(state)` and `parkui: exportParkUi(state)`
  (objects, like `json`/`dtcg`); the `nonempty` key list in `test/engine/exports.mjs` gains both.
- **REQ-043** Both emitters are theme-independent (never read `state.theme`) and disabled-palette
  clean (they loop `derivedAll`).

### R-D. UI wiring (the three sites, per `adding-export-formats`)

- **REQ-050** `src/ui/model.mjs` `projectView` `exports` gains `panda: exportPandaModule(exportPanda(
  state, { type: shadType, geometry: shadGeom }))` and `parkui: exportParkUiModule(exportParkUi(state,
  { geometry: shadGeom }))`, reusing the resolved scales the shadcn line already computes.
- **REQ-051** `src/ui/overlays/drawer.js` `FORMAT_GROUPS` Colors group gains `["panda", "Panda CSS"]`
  and `["parkui", "Park UI"]` immediately after `["shadcn", "shadcn/ui"]` (frameworks together);
  `PRO_LABEL` gains both labels; `src/ui/app-helpers.mjs` `PRO_EXPORT_FORMATS` gains both ids
  (ratified H-3: frameworks are Pro, as Tailwind and shadcn are).
- **REQ-052** Download-All (`drawer.js`, the `sys.color` block) pushes `panda/{s}.preset.mjs` and
  `park-ui/{s}.preset.mjs` next to `tailwind/{s}.css` and `shadcn/{s}.css`; both ride the Pro gate
  like their neighbours.
- **REQ-053** The consumer-side README text for the DS bundle is untouched (non-goal); the brand-kit
  MCP does not serve these formats (it serves the kit, not serializations).

### R-E. Gates

- **REQ-060** `test/engine/exports.mjs` gains a `panda` group: a recursive walker asserting every
  leaf is `{ value }` (PF-2); every `semanticTokens.colors` leaf value is `{ base, _dark }` with both
  strings; every string value is an `oklch(` string, `"transparent"`, or a `{…}` reference; every
  reference resolves to an emitted path in `tokens` or `semanticTokens` (dot-path resolution, PF-3);
  no flat path is emitted twice across the two maps; per enabled palette exactly 25 + 11 + 8 raw
  leaves (stops, scrims, prime incl. DEFAULT) and 53 semantic leaves; a disabled palette is absent;
  `theme.extend` present, bare `theme.tokens` absent; `name` present; with `opts.type` the 15 × 3
  text styles + 15 DEFAULTs and 5 fonts; with `opts.geometry` 7 radii, 10 spacing, 2 border widths;
  without opts neither block exists.
- **REQ-061** A `parkui` group: per enabled palette the 24 numbered keys with both conditions, the
  five appearance groups with exactly Park's sub-keys (KF-3), `on-accent` and `prime`; `accent`
  deep-equals the primary driver's object after reference rewrite, `gray` the neutral's; the six
  globals and `error` present and resolving; every `a{k}` alpha value, composited over white
  (`base`) / black (`_dark`) by the TEST's own arithmetic, is within 1/255 per channel of the
  emitted solid `{k}` (the anti-tautology control for REQ-022); for the default document's `gray`,
  relative luminance is monotone non-increasing over steps 1..12 in `base` and non-decreasing in
  `_dark`; `radii.l1..l3` present; no `textStyles`; data palettes present but never `accent`/`gray`.
- **REQ-062** The `pickDrivers` refactor gate: `exportShadcn` output over the default document and
  over the `BRAND_ONLY` and `allDataOff` fixtures is byte-equal to a string captured before the
  refactor (captured in the PR, compared in the test as a fixture file
  `test/engine/fixtures/shadcn-baseline.css`, regenerated only by hand).
- **REQ-063** `test/ui/headless-boot.mjs`: `wantPaths` gains `panda/` and `park-ui/`; the `(pe)`
  group asserts both folders are absent at Free and present when unlocked; the drawer renders both
  tabs and each tab's `<pre>` starts with the header comment.
- **REQ-064** `npm test` stays zero-dependency: no gate imports or spawns Panda.
- **REQ-065 (reference-form gates, REQ-029)** `test/engine/exports.mjs` gains a `radix-refs-*` gate
  group (`radix-refs-values-unchanged`, `-shape`, `-raw-pin`, `-role-pin`, `-parity`, `-alpha`,
  `-extras`, `-clones`, `-collision`, `-prefix`, `-module`, `-sentinel`): every numbered leaf 1..12
  is a `var()` link matching the raw-pin/role-pin table; ref parity resolves each link through
  `exportOKLCH`'s own emitted declarations and agrees with the values form within 1/255 per channel;
  alpha steps stay string-equal across both forms; the `#630` collision fixture links the RAW slug,
  never the renamed group key; a custom `colorPrefix` moves the link's prefix; the module header
  names the link contract; the no-driver sentinel is shared. `test/ui/headless-boot.mjs` gains an
  `(rxr)` group: a two-item "Values · References" segmented bar on the Radix tab, both `radix/*.preset.
  mjs` files in the Download-All zip under the existing Pro gate, and the zip README's `radix/` row
  naming both files. `nonempty` (`test/engine/exports.mjs`) gains `radixRef` beside `radix`.

### R-F. The real codegen leg (outside `npm test`)

- **REQ-070** `scripts/smoke-panda.mjs`: writes both preset modules for the default document into
  a scratch dir with a minimal `panda.config.mjs` (`presets: ['@pandacss/preset-panda', panda,
  parkui]`, `include: []`, `outdir: 'out'`), runs `npx --yes @pandacss/dev@<pinned> cssgen tokens`
  there, and asserts the emitted CSS contains `--colors-primary-500`, `--colors-primary-on-surface`,
  `--colors-accent-9`, `--colors-accent-a3`, `--colors-gray-12`, `--colors-fg-default` and a `.dark`
  rule for `--colors-primary-on-surface`. Pinned version recorded in the script; network-using;
  never run by `npm test`.
- **REQ-071** The script is the proof for the three `[open]` facts: semantic-to-semantic aliasing
  (PF-3), the `scrim` leaf/group coexistence (REQ-005), and nested `textStyles` groups with
  `DEFAULT` (REQ-007). Its first run's findings land in #570's Findings; any rejection triggers the
  named fallback (N-2 for `scrim`; flat `body-md` keys for text styles) before K4 ships.
- **REQ-072** CI: a `panda-smoke` job on the same trigger as the existing smoke leg, running
  REQ-070 (ratified H-4; the alternative is manual-only, run by the K5 builder and at release).

### R-G. Records and parity

- **REQ-080** The "8 formats" claim moves to 10 in: `src/engine/exports.js` header,
  `CLAUDE.md` Layout, `.claude/skills/adding-export-formats/SKILL.md` (the "8 of them, and ONLY those
  8" paragraph, the `nonempty` key list, the ShadCN-exception paragraph now naming Park UI as the
  second curated-contract format), `docs/reference/references/knowledge-04-export-formats.md`
  (header, §1 table, two new sections numbered after #569's E6 additions), `README.md` format list,
  `docs/marketing/fact-sheet.md` "Export formats" row and store copy via the marketing agent.
- **REQ-081** DS bundle: `DESIGN.md` and the Figma Make `setup.md` are unchanged in v1 (they
  document shadcn consumption). The Claude Design `README.md` format list, if it enumerates formats,
  gains both names (K6 builder checks; if the list is generated from a constant, the constant).
- **REQ-082** Consumer plugin `plugin/ultimate-tokens/skills/color-tokens/SKILL.md`: the existing
  grammar note ("the Tailwind (`--color-*`) and shadcn exports use different grammars") gains Panda
  (`colors.{palette}.{role}` → `--colors-{palette}-{role}`, the bare accent as the group's DEFAULT)
  and Park UI (`colorPalette.solid.bg` and friends; `accent`/`gray` are the brand's primary/neutral).
  `role-parity.mjs` is unchanged (it gates counts; the 53-per-palette count is unchanged).
- **REQ-083** `CHANGELOG.md` entry; `docs/reference/references/decision-records.md` gains no ADR
  unless a ratification below changes a fenced rule (none does by default).

## Non-goals

- No runtime or dev dependency on `@pandacss/dev`, `@park-ui/*`, or Radix Colors; `npm test` never
  fetches. The codegen leg is a script plus (after H-4) a CI job.
- No change to the eight existing formats' output beyond the `pickDrivers` refactor (byte-identical)
  and the #569 stamp, which #569 owns.
- No Park UI text styles, no size ramp / insets / gaps / focus in the Panda preset, no recipes, no
  patterns, no `globalCss`, no conditions of our own (`.dark` is Panda's).
- No Tailwind flavour of Park UI (KF-5 unresolved; Tailwind consumers already have `exportTailwind`).
- No new semantic roles, no prime aliasing by roles, no group names in tokens (0.3.0 non-goals hold).
- No MCP, Figma binder, or `ds-export.js` changes.

## Examples

All values engine-generated from `defaultDocument()` resolved through `resolvedPalettes`
(colour values below re-generated three times: 2026-09-17 at #647, which made the perceptual ramp
honour a palette's `skew` and `lift` — Primary and Neutral both carry skew -20, so every literal
derived from their ramp moved; 2026-09-18 at #657, which gave that ramp's OKHSL hue solver its best
iterate instead of an unread last one, moving Primary's accent by one 8-bit step; and 2026-09-18 at
#662, which made `onColorMode: "contrast"` the default and added the achromatic fall-through, moving
`primary["on-primary"]._dark` to the black constant. #662 moved no ramp stop, so every raw literal
and every semantic literal that is not an accent on-color is byte-for-byte the #657 capture. Type,
geometry and park values are untouched by all three.)
(the drawer's path; calling `derivedAll` on the raw document skips the group resolver and renders
Neutral at full chroma, the emitters must be fed the resolved state, as the drawer already does).

- **EX-1 (NORMATIVE, panda raw).** `tokens.colors.primary["500"].value === "oklch(0.546 0.2114
  258.97)"`, `["50"] === "oklch(1 0 0)"`, `["950"] === "oklch(0.1763 0.014 258.36)"`;
  `tokens.colors.neutral["500"].value === "oklch(0.5443 0.059 267.96)"` (material group ramp at
  30). `tokens.colors.primary.scrim["300"].value === "oklch(0.546 0.2114 258.97 / 30%)"`.
  `tokens.colors.primary.prime.prime.value === "oklch(0.5929 0.2052 259.00)"` (`#2177F5`),
  `.brightest === "oklch(0.8266 0.0853 258.93)"`, `.dimmest === "oklch(0.3543 0.1307 258.84)"`,
  `.DEFAULT` equals `.prime`. `tokens.colors.constant.backdrop.value === "oklch(0 0 0 / 80%)"`.
- **EX-2 (NORMATIVE, panda semantic).** `semanticTokens.colors.primary.DEFAULT.value` deep-equals
  `{ base: "oklch(0.504 0.1867 258.99)", _dark: "oklch(0.586 0.2114 258.97)" }`;
  `primary.hover` `{ base: "oklch(0.4253 0.1357 259.04)", _dark: "oklch(0.672 0.1504 258.98)" }`;
  `primary["on-primary"]` `{ base: "oklch(1 0 0)", _dark: "oklch(0 0 0)" }`;
  `neutral["on-surface"]` `{ base: "oklch(0.1774 0.0044 264.46)", _dark: "oklch(1 0 0)" }`;
  `neutral.scrim` (the role) `{ base: "oklch(0.5443 0.059 267.96 / 30%)", _dark: same }` next to
  the raw group `neutral.scrim["300"]`. 53 keys under `semanticTokens.colors.primary`, 16 palette
  groups, `data-1.DEFAULT.base === "oklch(0.5584 0.2312 272.17)"`.
- **EX-3 (NORMATIVE, panda type + geometry, after H-1).** `tokens.fonts.body.value === "'Inter',
  sans-serif"`, `tokens.fonts.display.value === "'Inter Tight', sans-serif"`;
  `textStyles.body.md.value` deep-equals `{ fontFamily: "{fonts.body}", fontSize: "16px", lineHeight:
  "24px", letterSpacing: "0px", fontWeight: 440, textTransform: "none" }`, `textStyles.body.DEFAULT`
  equals it; `tokens.radii.md.value === "12px"`, `tokens.radii.full.value === "9999px"`,
  `tokens.spacing["4"].value === "16px"`, `tokens.borderWidths.thin.value === "1px"`.
- **EX-4 (NORMATIVE, park ladder, gray = neutral, corrected 2026-09-11 per issue #588's ruling).**
  Emitted `base` / `_dark` values. Steps 1..8 are RAW RAMP STOPS (no flattening — superseding the
  pre-#588 EX-4, which flattened steps 6..8 over step 1); steps 9..12 are unchanged role-derived
  values. Regenerated 2026-09-11 by reading `src/engine/exports.js`'s actual resolved output
  (`derivedAll(stateOf(defaultDocument()))`'s `neutral` palette, the same raw-stop path
  `exportTailwind`/REQ-002 already use) against the corrected table in
  `docs/reference/data/radix-projection.json`:
  `1` (stop 100/900) `oklch(0.9552 0.0041 271.37) / oklch(0.2346 0.0083 264.4)`;
  `2` (stop 125/875) `oklch(0.9336 0.0058 264.53) / oklch(0.2598 0.0121 264.34)`;
  `3` (stop 150/850) `oklch(0.9122 0.0088 264.52) / oklch(0.2854 0.0153 269.14)`;
  `4` (stop 175/825) `oklch(0.8907 0.0118 264.51) / oklch(0.3095 0.0188 268.07)`;
  `5` (stop 200/800) `oklch(0.869 0.0148 264.49) / oklch(0.3331 0.0223 267.36)`;
  `6` (stop 250/750) `oklch(0.8237 0.0233 269.4) / oklch(0.3797 0.0306 267.41)`;
  `7` (stop 300/700) `oklch(0.7794 0.0329 267.89) / oklch(0.4249 0.0385 267.4)`;
  `8` (stop 350/650) `oklch(0.7351 0.041 267.83) / oklch(0.469 0.0461 267.38)`;
  `9` `oklch(0.5598 0.056 266.1) / oklch(0.6475 0.0554 266.72)`; `10` `oklch(0.469 0.0461 267.38) /
  oklch(0.7351 0.041 267.83)`; `11` `oklch(0.3797 0.0306 267.41) / oklch(0.8237 0.0233 269.4)`;
  `12` `oklch(0.1774 0.0044 264.46) / oklch(1 0 0)`. Luminance is still monotone in each mode (the
  REQ-061 control): `base` L strictly decreases 0.9552 → 0.1774 across steps 1..12; `_dark` L
  strictly increases 0.2346 → 1 across steps 1..12.
- **EX-5 (NORMATIVE, park alpha projection, accent = primary).** Step 9 `base` solid `#136CE9`
  projects to `a = 0.9255`, `C = [0, 96, 231]`, emitted `oklch(… / 92.5%)`; `_dark` solid `#428BFB`
  over black projects to `a = 0.9843`, `C = [67, 141, 255]`. Gray step 3 `base` `#E7E9ED` projects
  to `a = 0.0941`, `C = [0, 21, 64]`; `_dark` `#21242A` to `a = 0.1647`, `C = [200, 219, 255]`.
  Compositing each back over its reference background returns the solid within 1/255.
- **EX-6 (NORMATIVE, park globals and copies).** `semanticTokens.colors.accent["9"]` deep-equals
  `primary["9"]`; `accent.solid.bg.DEFAULT.value === "{colors.accent.9}"` where `primary.solid.bg.
  DEFAULT.value === "{colors.primary.9}"`; `fg.default.value === "{colors.gray.12}"`; `canvas.value
  === "{colors.gray.1}"`; `error.value === "{colors.danger.9}"`; `radii.l3.value === "{radii.md}"`;
  `accent["on-accent"].value` deep-equals `primary["on-primary"]`'s `{ base, _dark }`.
- **EX-7 (NORMATIVE, module string).** `exportPandaModule(exportPanda(state))` starts with `/* Panda
  CSS preset, generated by Ultimate Tokens.` and contains `export default {`; `JSON.parse` of the
  text between `export default ` and the final `;` deep-equals `exportPanda(state)`.
- **EX-8 (NORMATIVE, wiring).** The Download-All zip at Pro contains `panda/my-set.preset.mjs` and
  `park-ui/my-set.preset.mjs`; at Free neither. The drawer's Colors group reads `Hex · OKLCH ·
  Tailwind v4 · shadcn/ui · Panda CSS · Park UI · Figma · Figma UI3 · DTCG · JSON`.
- **EX-9 (NORMATIVE, shadcn identity).** `exportShadcn(C(ALL))` after REQ-040 equals the captured
  baseline byte for byte, with data palettes on, off, and the `BRAND_ONLY` fixture.

## Acceptance

- **AC-001** REQ-001..006, REQ-009: the `panda` gate of REQ-060 is green on the default document,
  `BRAND_ONLY`, and a one-palette-disabled fixture; EX-1, EX-2, EX-7 hold as literal assertions.
- **AC-002** REQ-007, REQ-008: with `opts.type`/`opts.geometry` EX-3 holds; without, the blocks are
  absent and the colour output is byte-identical to the with-opts colour output.
- **AC-003** REQ-020..028, REQ-041: the `parkui` gate of REQ-061 is green; EX-4, EX-5, EX-6 hold; the
  alpha check uses the test's own compositing arithmetic, not `alphaProject`; `flattenOver` and
  `alphaProject` are exported from `exports.js` and each agrees with the test's arithmetic on the
  EX-5 inputs.
- **AC-004** REQ-040, REQ-062: EX-9 holds; `git grep -n "find(/neutral|gray" src/engine` returns
  exactly one site (`pickDrivers`).
- **AC-005** REQ-042, REQ-043: the `nonempty` gate lists `panda` and `parkui` and both are objects
  with a `theme.extend` key; for each, the object over the default document is deep-equal under
  `theme` light, dark, and auto, and a disabled palette's group is absent. Satisfiable per half:
  the `panda` half once `exportPanda` exists (K1), the `parkui` half once `exportParkUi` exists
  (K3), both halves in K4.
- **AC-006** REQ-050..053, REQ-063: EX-8 holds in the headless shim; `npm run smoke` shows both tabs
  render in Chrome (a screenshot in the PR); REQ-053 by negative grep: `git grep -n "panda\|parkui"
  mcp/ src/engine/ds-export.js` returns nothing.
- **AC-007** REQ-064: `git grep -nE '"@?(pandacss|park-ui)(/[a-zA-Z0-9._-]+)?"[[:space:]]*:|(from|require)\([[:space:]]*['"'"'"]@?(pandacss|park-ui)' package.json test/ scripts/`
  returns **zero hits**, proving no real `pandacss`/`park-ui` dependency was added anywhere the
  command scans. Anchored to a `package.json` dependency key or an `import`/`require` of the real
  packages, per Ruling 2026-09-11 on #588: the original bare `"pandacss\|park-ui"` pattern also
  matched this repo's own `park-ui/` export-folder and fixture-name strings in
  `test/ui/headless-boot.mjs` and `test/engine/exports.mjs` — a feature-name collision, not a
  dependency, and not a real AC-007 failure. `scripts/smoke-panda.mjs` never has a real
  import/require or dependency-key line (only string literals and `execFileSync` calls), so the
  anchored pattern correctly excludes it too; the command's path list (`package.json test/
  scripts/`) does not cover `.github/`, so the CI job's own trigger config is verified separately
  by AC-008, not by this grep.
- **AC-008** REQ-070..072: `node scripts/smoke-panda.mjs` exits 0 on the K5 builder's machine and
  its console shows the seven asserted variable names; the three `[open]` facts are recorded as
  proven or as their fallback in #570's Findings; the `panda-smoke` job exists in the CI workflow
  on the same trigger as the smoke leg and ran green on the K5 PR.
- **AC-009** REQ-080..083: `git grep -n "8 documented\|eight formats\|8 formats\|the 8 color" CLAUDE.md
  src/engine/exports.js .claude/skills/adding-export-formats docs/reference/references/
  knowledge-04-export-formats.md README.md` returns nothing; `docs:doc-checker` re-scores
  knowledge-04 after the two sections land.

## Agent verification

- AC-001..005, AC-007: `node test/engine/exports.mjs` (new `panda`, `parkui`, `shadcn-baseline`
  groups; `pass`/`FAIL` per group as today). The alpha re-composite (AC-003) and the fixture
  baseline (AC-004) are the anti-tautology controls.
- AC-006: `node test/ui/headless-boot.mjs` (the `wantPaths` and `(pe)` groups) and `npm run smoke`.
- AC-008: `node scripts/smoke-panda.mjs` by hand (network) and, after H-4, the `panda-smoke` CI job.
- AC-009: the grep and `docs:doc-checker`.
- Human: none outstanding (see Ratification record).

## Overlap with #569

- **Schema stamp.** #569 RP-8 stamps every surface with `EXPORT_SCHEMA_VERSION` (E5). The two
  preset modules carry the same stamp as a first-line comment `/* ultimate-tokens export schema N */`
  above the header of REQ-001/REQ-020, and the preset OBJECT carries no stamp (a preset has no
  metadata slot Panda tolerates beyond `name`). Whichever lands second adds the line: if E5 merges
  first, K1/K3 emit it from the constant; if K1/K3 merge first, E5's sweep adds it, and #569's
  `hpg-export-schema-stamp` gate lists `panda`/`parkui` from the day it exists.
- **Group metadata (RP-1, after H-1 of #569).** If groups become exported metadata, the Panda module
  gains a comment line per palette block in the SAME shape #569 chooses for CSS/Tailwind
  (`/* neutral · material */`), and nothing in the object; Park UI gets nothing (its shape is Park's).
- **`pickDrivers`.** #569 does not touch the shadcn driver pick; REQ-040 is the only shared code
  path and is byte-identical by gate, so ordering between the two efforts is free.
- **knowledge-04 numbering.** #569 E6 adds §11 and §12; this SPEC's sections are §13 "Panda CSS" and
  §14 "Park UI". If K6 lands first it takes §11/§12 and E6 renumbers.
- **Consumer plugin.** #569 E4 adds a "Data series" paragraph to `color-tokens`; REQ-082 adds a
  grammar sentence to a different paragraph. No conflict.

## Ratification list

| Id | Question | Default (recommended) | Alternative | Needed before | Ruling (2026-09-11) |
|---|---|---|---|---|---|
| H-1 | v1 scope of the Panda preset | Color + fonts + text styles + radii/spacing/border widths (REQ-007/008) | Color only; type/geometry in a follow-up | K2 | Ratified: default |
| H-2 | Park UI text styles | Not emitted (Park's `xs … 7xl` stays as installed) | Map 15 voices onto `xs … 7xl` + `label` | K3 | Ratified: default (not in v1) |
| H-3 | Pro gating | Both formats Pro, like Tailwind and shadcn | Free | K1 | Ratified: Pro |
| H-4 | Real `panda cssgen` leg | Script + a `panda-smoke` CI job (network, never in `npm test`) | Script only, run by hand at release | K5 | Ratified: script + CI job |
| P-1 | 12-step projection | Roles per the REQ-021 table, 6..8 flattened | 12 of the 25 stops per mode | K3 | Ratified: by role (2026-09-11), CORRECTED 2026-09-11: steps 1..8 are raw ramp stops (see issue #588's ruling comment, dated 2026-09-11), never role-indirected or flattened; steps 9..12 unchanged |
| N-1 | Panda stop keys | Unpadded `50 … 950` (Panda/Tailwind convention) | ADR-006 padded `050 … 950` | K1 | Ratified: unpadded |
| N-2 | Raw scrim group name if codegen rejects the `scrim` leaf/group coexistence | Keep `scrim` (proven by REQ-071) | Rename raw group to `scrims` | K5, only if triggered | Ratified as proposed (fallback only if triggered) |
| N-3 | Colour value form | `oklch()` strings everywhere (as Tailwind/shadcn) | Hex for raw, `oklch()` for semantic | K1 | Ratified: oklch() |

## Build units

Each unit is one PR, `npm test` green at its boundary, sizes on the repo's small/big ladder.
Order: K1 → K2 ∥ K3 → K4 → K5 ∥ K6. K1 carries the Panda wiring so the format is visible from the
first PR; K3 carries the Park UI wiring for the same reason; K4 is the joint gate sweep.

1. **K1 `exportPanda` colour + wiring** (REQ-001..006, 009, 040..043, 050..052 for `panda`, 060,
   062, 063 for `panda`). Touches `exports.js`, `model.mjs`, `drawer.js`, `app-helpers.mjs`,
   `test/engine/exports.mjs`, `test/engine/fixtures/shadcn-baseline.css`, `test/ui/headless-boot.mjs`.
   Done when AC-001, AC-004, AC-005 (panda half), AC-006 (panda half), AC-007 hold. Size: big. After
   N-1, N-3, H-3.
2. **K2 Panda type + geometry blocks** (REQ-007, 008). `exports.js`, `model.mjs` (the opts), the
   `panda` gate. Done when AC-002 holds. Size: small. After H-1.
3. **K3 `exportParkUi` + wiring** (REQ-020..028, 041, 050..052 for `parkui`, 061, 063 for `parkui`).
   Includes the `amber.ts` step-number confirmation recorded in #570 Findings. Done when AC-003,
   AC-006 (parkui half) hold. Size: big. After P-1, H-2.
4. **K4 Joint sweep**: `exportAll` key list, `(pe)` gate for both, drawer order EX-8, smoke
   screenshot. Done when AC-005, AC-006 hold with both formats. Size: small.
5. **K5 Codegen leg** (REQ-070..072): `scripts/smoke-panda.mjs`, the CI job, the three `[open]`
   facts resolved and recorded, N-2 fallback applied if triggered. Done when AC-008 holds.
   Size: small. After H-4.
6. **K6 Docs of record** (REQ-080..083): the ten-format sweep, knowledge-04 §13/§14 with the
   normative examples above, consumer plugin grammar sentence, fact sheet + store copy through the
   marketing agent, CHANGELOG. Done when AC-009 holds. Size: small.

## Ratification record

Ratified 2026-09-11 (team-lead relaying the owner): H-1 Panda v1 = colour + fonts + textStyles + radii/spacing/borderWidths; H-2 no Park UI textStyles in v1; H-3 both formats Pro-gated; H-4 codegen leg = script + CI `panda-smoke` job via npx, never in `npm test`; P-1 12-step projection by role, alpha steps Radix-style over white/black; N-1 unpadded `50 … 950`; N-2 as proposed (`scrims` fallback only if codegen rejects); N-3 `oklch()` strings everywhere. No human exception remains; every unit is buildable.

**Correction, 2026-09-11 (issue #588's ruling comment, dated 2026-09-11).** Before K3 built, the
conductor compared REQ-021's P-1 table against a validated Adia→Radix adaptation document supplied
by the human and against `src/engine/semantic.js`'s actual role stops: steps 9..12 already matched
what's ratified exactly, but steps 1..8 sat one tier lighter than the corrected mapping and treated
6..8 as translucent-flattened-over-white rather than opaque raw stops. REQ-021 is amended for steps
1..8 only (this SPEC's version bumps 0.1.0 → 0.1.1; status stays `approved`, this is a data
correction to an already-approved SPEC, not a new draft round). The corrected table, EX-4's
regenerated values, and the durable source material now live at
`docs/reference/data/radix-projection.json` and `docs/reference/references/radix-park-adaptation.md`.
REQ-022 and REQ-023 were checked against the correction and need no wording change (both operate on
step/alpha-step numbers generically, never assumed steps 6..8 were translucent) — see the inline
notes on each REQ.
