# Knowledge 04 — Export Formats

> Topic: the ten color export formats (CSS hex, CSS OKLCH, JSON, Figma DTCG, UI3, Tailwind, ShadCN, Panda CSS, Park UI, plus `exportAll`), their exact output shapes, naming/padding rules, and the
> Figma-import constraints that drove the resolved-vs-aliased decision.

## Table of Contents
1. Format overview
2. CSS (hex) and CSS (OKLCH)
3. JSON
4. Figma DTCG (3-file zip)
5. Collections (UI3)
6. Shared rules: padding, slug, scrims
7. Figma import constraints (why resolved, not aliased)
8. System constants (fixed, non-palette tokens)
9. Key colors (retained brand colors)
10. Prime tokens (the seven per-palette identity swatches)
11. Panda CSS
12. Park UI

Tailwind v4 (`exportTailwind`) and ShadCN (`exportShadcn`) are introduced in §1 but do not yet have
their own dedicated section here — their shapes are documented at the point of use in
`adding-export-formats`'s references instead. (A pre-existing gap noted, not fixed, in this pass —
scope was the §8 addition only.)

---

## 1. Format overview

| Tab | `expFmt` | File(s) | Shape |
|-----|----------|---------|-------|
| CSS | `css` | `hct-palette.css` | flat raw vars + `--c-*` semantic via `light-dark()` |
| CSS OKLCH | `oklch` | `hct-palette.oklch.css` | same, values as `oklch()` |
| JSON | `json` | `hct-palette.tokens.json` | meta + per-palette stops/scrims/semantic |
| Figma | `figma` | `figma-tokens.zip` (3 files) | DTCG; raw + Light + Dark, resolved |
| Collections | `ui3` | `figma-ui3-variables.json` | two-collection schema, in-file aliases |

All formats operate over **enabled** palettes (`palette.on`) and **export stops** (25).

Four more **framework** formats ship alongside these (see `src/engine/exports.js`, not all detailed
below): **Tailwind v4** (`tailwind` · `exportTailwind`), **ShadCN** (`shadcn` · `exportShadcn`),
**Panda CSS** (`panda` · `exportPanda`, §11), and **Park UI** (`parkui` · `exportParkUi`, §12).
ShadCN and Park UI are both **curated-contract** formats — ShadCN a fixed `SHADCN_ORDER` over a
hand-kept suffix `MAP`, Park UI a fixed `accent`/`gray`/`error`/`fg`/`canvas`/`border`/`bg` set built
from `pickDrivers` — NOT all roles, so a new semantic role does not surface in either unless
explicitly wired in. Panda CSS, like Tailwind, is auto-flow: it maps every palette's `roles` directly.

**Scope note (TKT-0015):** `src/engine/exports.js` holds ONLY these 10 formats (the 9 emitters above
plus the `exportAll` aggregator) plus their shared helpers (`derivePalette`/`derivedAll`, `pad3`/`slug`/`hexOf`/
`hex8`/`colorLeaf`/`roleOklch`, the `dialogBackdrop*` system constant). The Claude Design / Google Stitch /
Figma Make "DS bundle" DESIGN.md-authoring subsystem that used to share the file now lives in the sibling
`src/engine/ds-export.js` — a different kind of artifact (a consumption-bundle spec + prose, not a token
serializer) with no rubric of record in this directory yet. It is out of scope for this document and for
`adding-export-formats`; don't conflate a `ds-export.js` change with an export-format change covered here.

## 2. CSS (hex) and CSS (OKLCH)

```
:root{
  color-scheme: light dark;

  /* {Name} — cam16 hue {h}°; flat mode-independent RAW primitives. Raw names end in DIGITS,
     semantic names end in a WORD, so both share the --c- prefix with no collision. */
  --c-{n}-050: {hex};            ... --c-{n}-950: {hex};
  /* prime — the seven identity swatches, flat, mode-independent (§10) */
  --c-{n}-prime-brightest: {hex};  ...  --c-{n}-prime-dimmest: {hex};
  /* scrims (the 500 ramp; alpha% = step/10) */
  --c-{n}-scrim-050: {hex8};  ...  --c-{n}-scrim-950: {hex8};   (ADR-016 nesting — 500 base implicit)
  /* SEMANTIC roles -> light-dark of two raw primitives */
  --c-{n}{suffix}: light-dark(var(--c-{n}-{refSlug(light)}), var(--c-{n}-{refSlug(dark)}));
}
```

- Raw tokens are **flat single values** (not `light-dark()`), because the mode flip lives in
  the semantic layer (Knowledge 03 §1).
- OKLCH variant emits `oklch(L C H)` for solids and `oklch(L C H / a%)` for scrims; values
  via `rgbToOklch`.

## 3. JSON

```
{
  "model": "HCT (CAM16 H/C + CIELAB L*)",
  "curve", "tension", "lstar":{min,max}, "damp", "hueSpace",
  "scrimAlphas": [...],
  "palettes": [
    { "name", "hue", "chromaPct", "skew",
      "stops":   { "050": {hex, lstar, chroma}, ... },
      "scrims":  { "050": {hex,alpha}, "100":{...}, ... "950":{...} },   (keyed by padded step; palette keys are SLUGS; semantic `key` is the kebab leaf — ADR-016)
      "semantic":{ "<roleKey>": {css, light, dark, lightHex, darkHex}, ... }
    }
  ]
}
```
Stop keys padded to 3 digits. The `semantic` block lists every role with its CSS var name
and both resolved hexes.

## 4. Figma DTCG (the raw file plus one semantic file per theme)

`download()` emits `figma-tokens.zip` containing:

- `palette.tokens.json` — **raw** collection, mode `Value`. Solid stops + 11 scrims + the seven
  prime swatches (§10) (+ any key colors, §9) per palette as resolved `colorLeaf`s.
- One `"{theme.name}_tokens.json"` per entry in the **theme axis** — **semantic**, mode
  `theme.name`. Every role resolved to a `colorLeaf` using that theme's `side` end (`"light"` or
  `"dark"`). By default (no `opts.themes`), the axis is `semantic.js`'s `DEFAULT_THEMES` —
  `[{name:"Light",side:"light"}, {name:"Dark",side:"dark"}]` — producing the historical
  `Light_tokens.json`/`Dark_tokens.json` pair, byte-identically (ADR-019, TKT-0021). A doc/caller
  can pass a longer `opts.themes` (e.g. `+ {name:"Dim", side:"dark"}`) to add a named companion
  mode with no engine change — this does NOT give a theme its own independent resolved color per
  role (that needs a third ref in the role table itself, a separate change); every theme's value is
  one of the role's two existing ends.

`colorLeaf(rgb, alpha)`:
```
{ "$type":"color",
  "$value":{ "colorSpace":"srgb", "components":[r/255,g/255,b/255], "alpha":a, "hex":"#RRGGBB[AA]" },
  "$extensions":{ "com.figma.hiddenFromPublishing":true, "com.figma.scopes":["ALL_SCOPES"] } }
```
`figmaMode(tree, mode)` adds top-level `$extensions.com.figma.modeName` — `figma/plugin/code.js`'s
`applyBundle` reads this tag (not the filename) to discover which theme files a bundle carries and
how many Color Roles modes to create. Export preview shows the first theme's semantic tree; the
download adds raw + every other theme.

**`exportUI3`'s `Color Roles` collection still hardcodes the Light/Dark pair** (`values:{Light,
Dark}`) — deliberately out of TKT-0021/ADR-019's scope (a documented follow-up, not an oversight;
see ADR-019's Consequences). Don't assume UI3 already generalizes the same way DTCG now does.

The zip is built by a dependency-free **store/deflate writer** (`makeZip`, with `crc32`); it
works fully offline.

**Optional aliasData**: a `rawColl` input (blank by default). When filled, semantic leaves
gain `$extensions["com.figma.aliasData"] = {targetVariableName:"{n}/{refPath}", targetVariableSetName:coll}` (scrims nest: "{n}/scrim/{step}").
Blank → plain resolved colors that always import (default). See §7.

## 5. Collections (UI3)

Single file `figma-ui3-variables.json`:
```
{ "$schema":"figma-ui3-variables.color.schema.v1",
  "collections":{
    "Color Primitives":{ "modes":["Base"],
      "variables":{ "raw/{n}/{050}":{type:"COLOR",values:{Base:"#HEX"}}, ... } },
    "Color Roles":{ "modes":["Light","Dark"],
      "variables":{ "{n}/{roleKey}":{type:"COLOR",
        values:{Light:"{raw/{n}/{refPath light}}", Dark:"{raw/{n}/{refPath dark}}"}}, ... } },   (semantic keys = "{n}/{kebab leaf}", ADR-016)
    "Color Prime":{ "modes":["Base"],
      "variables":{ "{n}/{step}":{type:"COLOR",values:{Base:"#HEX"}}, ... } }   (the seven identity swatches, its OWN collection — §10)
  } }
```
Semantic values are **in-file key-path aliases** the importer resolves; prime values are resolved
(no aliasData), same as raw.

> ⚠️ **OD-003 — UI3 schema authenticity.** `figma-ui3-variables.color.schema.v1` returns
> zero hits in Figma's documentation and is **not** a verified native import format. Do not
> import it via the Variables modal expecting native resolution. It is retained as a
> convenience/interchange shape only. See ADR-007.

## 6. Shared rules: padding, slug, scrims

- `pad3(stop)` → 3 digits (`"50"→"050"`); applied to all stop keys and var refs.
- `slug(name)` → lowercase, non-alphanumeric → `-`, trimmed. Palette name → token namespace.
- `hex8(rgb, frac)` → `#RRGGBBAA` for scrims.
- `SCRIM_BASES=[500]`, `SCRIM_STEPS=[50,100,200,300,400,500,600,700,800,900,950]`; a scrim ref `500-{step}` is the 500 color at alpha% = step/10, EMITTED as the nested `scrim/{step}` path (`refPath`) / `scrim-{step}` slug (`refSlug`) — ADR-016.

## 7. Figma import constraints (why resolved, not aliased)

Researched and verified against Figma's "Modes for variables" documentation:

- Figma's native importer accepts **DTCG** (`$type`/`$value`).
- Same-file alias = `$value:"{token}"`. Cross-collection alias = `com.figma.aliasData`,
  which Figma resolves by matching provided data; names normalize to forward slashes; one
  mode per file.
- Name-only `aliasData` (without the library key UUIDs Figma only mints on export) **errors**
  rather than falling back — this produced the observed "errors importing N tokens".

**Resolution**: semantic Light/Dark ship **resolved** colors (no aliasData) → they always
import. The live cascade (edit raw → semantic follows) cannot be done by JSON import; it is
provided by the companion plugin (`knowledge-05-figma-plugin.md`). The `rawColl` field is the
opt-in escape hatch for users who want aliasData emitted anyway. See ADR-002.

## 8. System constants (fixed, non-palette tokens)

A **system constant** is a color token that is NOT derived from any palette — a fixed value,
emitted once per document, never mode-flipped. Three today: `dialog-backdrop` (opaque black at
80% alpha — the canonical modal/dialog scrim, distinct from the per-palette, brand-tinted
`*/scrim*` roles), `white`, and `black` (solid, opaque chrome — never a palette color). All three
still ride the same configurable `{pfx}`/`{aliasPrefix}` as every other token, so a renamed
namespace covers them too.

**Where they appear, and where they deliberately do NOT:**

| Format | Placement |
|---|---|
| CSS (hex/oklch) | `--{pfx}-dialog-backdrop` / `-white` / `-black` lines in `:root`, before any palette (`cssFrom`) |
| JSON | A top-level `constants` object, sibling to the palette-name keys |
| DTCG | A `constants` group in `palette.tokens.json` (RAW) **only** |
| UI3 (Figma) | `raw/constants/{dialog-backdrop,white,black}` in `Color Primitives` **only** |
| Tailwind `@theme` | `--color-dialog-backdrop` / `-white` / `-black` lines, outside any palette's scale/role blocks |
| ShadCN | `--overlay` in both `:root`/`.dark` (literal, or `var(--{aliasPrefix}-dialog-backdrop)` when aliased), mapped in `@theme inline` — **`dialog-backdrop` only**; `white`/`black` have no slot in shadcn's fixed token contract, so they don't appear there |
| Panda CSS | `tokens.colors.constant.{white,black,backdrop}` (§11) — namespaced under `constant`, never `colors.white`/`colors.black` directly (would collide with `preset-panda`'s own tokens of those names) |
| Park UI | not emitted (curated contract, out of scope, same as scrims for Tailwind) |

**Why it is absent from the DTCG/UI3 *semantic* tree (Light/Dark · Color Roles) — load-bearing,
don't "fix" this:** every top-level key of that tree is treated elsewhere as a REAL PALETTE with a
full 53-role set, positionally zipped against `doc.palettes` (the app's style-plan family
derivation; `figma/binder/style-plan.mjs`'s paint/text-style generation). A synthetic non-palette
key there is silently miscounted as a palette with no real roles, breaking both. This was caught
live when first wiring `dialog-backdrop` (2026-07-11) — the raw tree has no such assumption (its
consumers, e.g. `figma/plugin/code.js`'s variable-creation loop, walk it generically by name), so
constants live there and there only; a Figma user binds directly to the raw primitive (nothing to
alias FROM — the value has no palette).

## 9. Key colors (retained brand colors)

A palette may carry `keyColors: [{ role, oklch:[L,C,H], name? }]` — exact brand colors the
generator retains verbatim rather than deriving from the ramp (they may sit off it entirely; the
UI places them perceptually, exports keep them lossless). `role` is a free-form string
(`"dominant"`/`"supportive"` are the two the UI currently offers); `oklch` is the source of truth
(`oklchToRgb` derives `rgb`/`hex` for formats that need a raster leaf). Emitted **only** when a
palette actually sets `keyColors` — absent otherwise (opt-in, not a per-palette default).

**Where it appears:**

| Format | Placement |
|---|---|
| CSS (hex/oklch) | `--{pfx}-{n}-key-{role}` lines, per palette, after that palette's semantic roles |
| JSON | `palettes[n].keyColors: [{role, oklch, name?}]` — verbatim passthrough |
| DTCG | `palette.tokens.json` (RAW): a `key` group nested under the palette, keyed by `role` — mirrors `scrim`'s two-segment shape (`{n}.key.{role}`), a resolved `colorLeaf` (frac 1, no alpha) |
| UI3 (Figma) | `raw/{n}/key/{role}` in `Color Primitives` — mirrors the `raw/{n}/scrim/{step}` shape |
| Tailwind / ShadCN | not emitted (frameworks; out of scope, same as scrims for Tailwind) |

**Why DTCG/UI3 carry them in the RAW tree only, not the semantic tree:** key colors are extra raw
values scoped to one palette, not new top-level tree keys — nesting them under the palette's own
raw group (`{n}.key.{role}` / `raw/{n}/key/{role}`) never touches the positional-palette-zip
invariant §8 describes for system constants (that invariant is about a tree's TOP-LEVEL keys, and
`key` here is a second-level group inside an existing, real palette). No ADR previously fenced
their DTCG/UI3 absence — checked `decision-records.md` and found none; TKT-0022 confirmed it was
an oversight (they exported fine via CSS/JSON, the two formats an emitter happened to route
through `p.keyColors` directly) and closed the gap rather than fencing it.

## 10. Prime tokens (the seven per-palette identity swatches)

Each palette also carries a `prime` group: seven raw swatches, `brightest · brighter · bright ·
prime · dim · dimmer · dimmest` (REQ-054, knowledge-02 §8.3), computed on the key colour's own
OKHSL lightness ladder rather than the ramp. Flat and mode-independent (R2): one set of values,
no `light-dark()` wrapper, identical in Light and Dark. Emitted for every palette, always (not
opt-in like key colors).

**Where it appears:**

| Format | Placement |
|---|---|
| CSS (hex/oklch) | `--{pfx}-{n}-prime-{step}` lines, per palette, between that palette's solid stops and its scrims |
| JSON | `palettes[n].prime: {"{step}": {hex, oklch}}`, keyed by step NAME (a word, not padded, mirroring `keyColors`' role keys) |
| DTCG | `palette.tokens.json` (RAW): a `prime` group nested under the palette, keyed by step (`{n}.prime.{step}`), mirrors `scrim`'s two-segment shape, resolved `colorLeaf`s |
| UI3 (Figma) | its OWN top-level collection, `Color Prime` (`COLLECTIONS.colorPrime`), one `Base` mode, `{n}/{step}` variable paths (no `raw/` prefix, same convention `Color Roles` already uses) |
| Tailwind `@theme` | `--color-{n}-prime-{step}` lines, per palette, next to that palette's scale |
| ShadCN | not emitted (curated subset, out of scope, same as scrims for Tailwind) |
| Panda CSS | `raw.prime.{step}` per palette (unpadded stop namespace, §11), plus `raw.prime.DEFAULT` aliasing `raw.prime.prime` |
| Park UI | one leaf only, `colors.{n}.prime` (`base` only, no `_dark` — mode-independent per REQ-024, §12); Park's own ladder has no slot for the other six prime steps |

**Why UI3 gives prime its own collection instead of nesting it under `Color Primitives` (unlike
scrims and key colors):** the prime ladder is not derived from the ramp and no role ever aliases
it (knowledge-03 §3), so nesting it in the raw tree would suggest a raw-to-role relationship that
does not exist for prime. A fifth, standalone collection keeps that boundary explicit in the Figma
file itself (LLD Interfaces block, REQ-054).

## 11. Panda CSS

`exportPanda(state, opts)` (`panda` · `src/engine/exports.js`) emits a Panda CSS preset object —
`{ name, theme: { extend: { tokens, semanticTokens, textStyles? } } }` — auto-flow like Tailwind:
every palette's `roles` map straight to a semantic leaf, so a new role needs no edit here.

- **System constants** (`tokens.colors.constant.{white,black,backdrop}`, REQ-004, unconditional):
  `whiteOklch()`/`blackOklch()`/`dialogBackdropOklch()` — deliberately namespaced under `constant`,
  never `colors.white`/`colors.black` directly, which would collide with and override
  `@pandacss/preset-panda`'s own token names of the same name.
- **Raw tokens** (`tokens.colors.{n}`): unpadded stop keys (`"50"…"950"`, REQ-002, unlike every
  other format's `pad3`), plus `{n}.scrim.{step}` and `{n}.prime.{step}`/`.DEFAULT` (REQ-003) —
  digit-or-`scrim`/`prime` keys never collide with a semantic role suffix (REQ-005).
- **Semantic tokens** (`semanticTokens.colors.{n}.{roleKey}`): `roleKey` is the role's suffix minus
  its leading dash (`"-on-surface"` → `"on-surface"`); the bare accent role (empty suffix) is
  `DEFAULT`. Every leaf carries both `base` (light) and `_dark` (dark), resolved (REQ-005/006).
- **Type** (opt-in via `opts.type`, a resolved `typeScale`, REQ-007): `tokens.fonts.{display,heading,
  body,ui,mono}` (the quoted stack `typeTokensCSS` already emits) plus `theme.extend.textStyles.
  {voice}.{sm,md,lg}` for the 15 voices (`voice` = the CSS voice slug), `DEFAULT` aliasing `md`.
  `paragraphSpacing`/`paragraphIndent` are dropped (not Panda text-style fields).
- **Geometry** (opt-in via `opts.geometry`, a resolved `geomScale`, REQ-008): `tokens.radii.
  {none…full}` (`full` = `9999px`), `tokens.spacing.{0..9}`, `tokens.borderWidths.{thin,thick}` —
  all px strings (PF-2). The size ramp, insets, gaps, and focus are not emitted in v1 (non-goal).
- **`exportPandaModule(preset)`** wraps the preset as the ESM module string the drawer shows and
  the zip ships: a fixed two-line header comment, then `export default <preset JSON>;`. No import
  of `@pandacss/dev` — a consumer wires it in via `presets: ['@pandacss/preset-panda', preset]`.

## 12. Park UI

`exportParkUi(state, opts)` (`parkui` · `src/engine/exports.js`) emits a Park UI preset object —
`{ name, theme: { extend: { semanticTokens: { colors, radii }, tokens? } } }` — a **curated-contract**
format like ShadCN: it calls the shared `pickDrivers(palettes)` (REQ-040, byte-identical to ShadCN's
driver pick) and writes Park's own fixed semantic keys, never a per-role loop. A palette with no
enabled non-data neutral or primary palette returns a `/* … needs at least one enabled non-data
palette. */` string sentinel (mirroring `exportShadcn`'s own no-driver sentinel).

- **Per-palette colors** (`colors.{n}`, `parkColorGroup`): a Radix-style **12-step ladder**, steps
  1–8 the raw ramp stops and 9–12 role-derived (REQ-021), each step carrying `base`/`_dark`. Alongside
  it, **`a1`..`a12`** are the same 12 steps re-expressed as alpha values projected over white/black
  (Radix-style, REQ-022) — a different mechanism from this doc's own §6 `scrim` (which projects only
  the 500 stop over itself); Park UI has no `scrim` group. Five **appearance groups** alias those
  steps by reference (REQ-023): `solid` (`bg`/`bg-hover`/`fg` from steps 9/10/on-accent), `subtle`
  (from `a3`/`a4`/`a5`/step 11), `surface` (`a2`/`a3`/step 11 + `a6`/`a7` border), `outline` (`a2`/`a3`
  bg + `a7` border + step-11 fg), `plain` (`a3`/`a4` bg + step-11 fg). Two additive leaves round it
  out (REQ-024): `on-accent` (the solid-foreground on-color, `base`/`_dark`) and `prime` (the
  mode-independent prime identity swatch, `base` only — no `_dark`, unlike every other leaf here).
- **Driver aliases** (REQ-025): `colors.accent` ← a deep clone of the primary driver's group with
  every internal reference re-pointed from `{primary.n}` to `accent`; `colors.gray` ← the same for
  the neutral driver, re-pointed to `gray` (Park's own `gray: colorPalettes.neutral` pattern, KF-4).
  `colors.error` is a single alias, `{colors.{danger ?? primary}.9}`.
  A `danger` driver, when enabled, backs `error`; otherwise `error` falls back to the primary driver.
- **Global semantic tokens** (REQ-026, Park's own verbatim keys, all referencing the just-built
  `gray` copy): `colors.fg.{default,muted,subtle}` → `gray.{12,11,10}`; `colors.canvas` → `gray.1`;
  `colors.border` → `gray.7`; `colors.bg.subtle` → `gray.2`.
- **Radii** (REQ-027): `radii.{l1,l2,l3}` always alias `{radii.xs,sm,md}`; `tokens.radii.{none…full}`
  (px strings) is only emitted when `opts.geometry` resolves the brand's own corners.
- **`exportParkUiModule(preset)`** wraps the preset as the ESM module string the drawer shows and
  the zip ships (REQ-020): a header naming the driver bindings and the install order (Park's own
  CLI-copied preset first, `utParkPreset` last). The no-driver sentinel string passes through
  unwrapped (mirroring `exportShadcn`'s own no-driver sentinel pattern).
- **Not emitted in v1** (non-goals): Park UI text styles, size ramp, insets, gaps, focus, recipes,
  patterns, `globalCss`, or conditions of our own (`.dark` is Park's).
