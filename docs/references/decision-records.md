# Decision Records (ADRs)

> These are the **fenced choices**: decisions that are intentional, sometimes
> counter-intuitive, and must survive regeneration. An agent enhancing this spec or
> regenerating the tool should treat each as a constraint with a rationale, not a bug to
> fix. Where a decision overrides an "obvious" correctness rule, it is flagged
> **OVERRIDE**: that is exactly the kind of thing a well-meaning agent will try to undo.

Format: Context → Decision → Rationale → Consequences → Status.

---

## ADR-001: HCT (CAM16 H/C + CIELAB L\*) over OKLCH-only
- **Context.** OKLCH is the obvious modern choice and the user is fluent in it.
- **Decision.** Use HCT: hue/chroma from CAM16, tone from CIELAB L\*.
- **Rationale.** HCT holds hue and tone stable across a ramp while maximizing chroma within
  gamut at each tone, which yields perceptually even tonal scales for design-system ramps.
  OKLCH is the **default** *input hue space* (mapped to CAM16) and an *output format*; cam16
  stays selectable (ADR-011).
- **Consequences.** Heavier engine (full CAM16 forward+inverse). OKLCH input requires a hue
  bridge, now the chroma-aware inverse (ADR-011, superseding the sampled ADR-008).
- **Status.** DECIDED.

## ADR-002: Semantic export ships RESOLVED colors, not aliasData
- **Context.** Ideal would be semantic tokens that alias raw cross-collection so edits
  cascade on import.
- **Decision.** Light/Dark semantic DTCG files contain resolved colors with no `aliasData`
  by default. A `rawColl` field opts into emitting `aliasData`.
- **Rationale.** Verified against Figma's "Modes for variables" docs: cross-collection
  `aliasData` needs library-key UUIDs Figma only mints on export; name-only aliasData
  **errors** on native import (observed "errors importing N tokens") rather than falling
  back. Resolved colors always import.
- **Consequences.** No cascade via JSON import; cascade is delegated to the plugin
  (ADR provides the binder). Resolved files are larger but reliable.
- **Status.** DECIDED (default kept).
- **Re-verified 2026-06-15** (Figma "Modes for variables" help doc). The `com.figma.aliasData`
  extension now documents a resolution **fallback hierarchy**: `targetVariableID` → `targetVariableName`
  within a set matching `targetVariableSetID` → `targetVariableName` within a set matching
  `targetVariableSetName`. So cross-collection aliasing by **name + collection-name** (not a
  library-key UUID) IS a documented path **when the target collection already exists in the file**.
  The original "needs library UUIDs / name-only errors" framing is therefore **softened**, but the
  decision stands: resolved colors remain the always-safe default (import with no preconditions),
  while the aliased path is conditional on the Color Primitives collection pre-existing. Pure name-only
  (no `targetVariableSetName`) behavior remains undocumented. Feeds OD-004.
- **Spike 2026-06-17.** The `rawColl` opt-in already emitted the full name+collection shape
  (`targetVariableName` + `targetVariableSetName`); the export verifier now **asserts both** on every
  aliased semantic leaf (`hpg-export-resolved` / AC-X6), so the shape can't silently regress. This is
  SHAPE conformance only, the native-import cascade is still unvalidated end-to-end (no Figma in CI)
  and unexposed in the UI. Default stays resolved; the plugin stays the reliable cascade. Advances
  OD-004 to a **gated spike, not a decision**.

## ADR-003: On-colors fixed to `050` in both modes  **(OVERRIDE)**
- **Context.** `on{N}` sits on the prime fill. A contrast-optimized system picks white or
  black per fill per mode for contrast. (Note: "perceptually even", this tool's headline,
  governs ramp *spacing*, not contrast; the two are deliberately distinct, see SKILL Intent.)
- **Decision.** `on{N}` → `050` (both modes), `on{N}Variant` → `200` (both modes), for all
  palettes. The previously implemented **contrast-aware auto-pick logic was removed**.
- **Rationale.** Explicit user/brand requirement: on-colors should be the light tint
  uniformly. The user was shown the contrast data and chose this deliberately.
- **Consequences.** White-on-`Warning` (yellow) ≈ 1.8:1, below WCAG 4.5:1; in dark mode
  several palettes lose contrast as fills lighten. This is **accepted by design**. Tracked
  as OD-001.
- **Status.** DECIDED, **do not reintroduce contrast-aware on-colors as the DEFAULT without explicit
  instruction.**
- **Opt-in added (2026-06-25, explicit instruction).** The default stays `fixed` (050/200 both modes,
  as above). A new `onColorMode` control adds an opt-in `"contrast"` mode that re-points `on{N}`
  (050↔950) and `on{N}Variant` (200↔800) to the end with the better WCAG contrast vs the accent fill
  (550 light / 450 dark), per mode. It's a resolution-layer adjustment (`applyOnColorContrast`,
  applied in `projectView` + `derivePalette`), `semanticRoles` and the canonical role table are
  UNCHANGED, so the default contract holds. This satisfies OD-001 without overriding ADR-003's default.

## ADR-004: Semantic scrim roles use base 750 only  **(SUPERSEDED, see the 500-ramp revision)**
> **SUPERSEDED (2026-06-17).** Scrims are now a single **500-based** ramp: a scrim is `500-{step}`
> = the 500 color at alpha% = step/10, and all 12 scrim-using roles (the 7 `scrim*` + outline +
> container/Low/High) resolve onto it, mode-flat (light === dark). Bases 250/750 are no longer
> used. The historical decision is kept below for provenance.
- **Context.** Raw scrims existed on three bases (250/500/750 × 7 alphas). A revision surfaced
  all three as semantic role families (`scrim250*/scrim500*/scrim750*`, 21 roles).
- **Decision.** Revert to 7 unqualified scrim roles (`scrimWeakest…scrimStrongest`) on base
  750. Bases 250 and 500 remain raw primitives only.
- **Rationale.** User clarified that 250/500/750 scrims belong as raw primitives; base 250 is
  a *light* tint overlay and 500 a saturated mid, different overlays, not weaker dark
  scrims, so they were judged not semantically needed.
- **Consequences.** 37 roles/palette (not 51). Tracked as OD-002 in case a use case for
  250/500 semantic scrims appears.
- **Status.** DECIDED.

## ADR-005: Two-layer model: flat raw + semantic `light-dark()`
- **Context.** The original design made all raw tokens mode-mirror pairs (light+dark=1000),
  so semantics were plain `var()` aliases.
- **Decision.** Raw tokens are flat, mode-independent single values. The light/dark flip is
  expressed once, in the semantic layer, via `light-dark(var(light), var(dark))`.
- **Rationale.** The mirror assumption broke as soon as non-mirror role mappings were
  introduced (e.g. `Dim 650/700`). The flat+semantic split works for any mapping and maps
  cleanly onto Figma's raw(single-mode)/semantic(Light,Dark) collection structure.
- **Consequences.** Every semantic CSS var references two primitives. Mode-switching is
  entirely in the `--c-*` layer.
- **Status.** DECIDED.

## ADR-006: 3-digit zero padding everywhere
- **Context.** Stops range 50–950; mixing `"50"` and `"050"` causes sort and lookup bugs.
- **Decision.** All stop references zero-pad to 3 digits (`pad3`/`refKey`) in CSS var names,
  CSS refs, JSON keys, DTCG names, and UI3 keys. Scrims keep `"{base}-{step}"` with padded base.
- **CSS var prefix convention (2026-06-17; revised 2026-06-24).** RAW primitives and SEMANTIC roles
  both use the `--c-` prefix: raw are `--c-{family}-{stop|500-step}` and semantic are
  `--c-{family}-{role}`. A raw name's suffix always ends in DIGITS and a semantic name's in a WORD, so
  they never collide despite the shared prefix. (Originally raw used `--c_` with an underscore to
  flag raw-vs-semantic; revised to drop the `_` for a cleaner, all-hyphen CSS namespace, the
  digit-vs-word suffix already disambiguates.) Semantic vars reference raw vars via `var(--c-…)`.
- **Rationale.** Stable lexical sort, exact name matching against the user's `Color Primitives`
  collection (which is padded), no ambiguity; the raw/semantic prefix split is self-documenting.
- **Status.** DECIDED.

## ADR-007: UI3 "Collections" schema is interchange-only, not native  **(CAUTION)**
- **Context.** A `figma-ui3-variables.color.schema.v1` export was added with in-file aliases.
- **Decision.** Keep it as a convenience/interchange format; **do not** present it as a
  native Figma Variables import format.
- **Rationale.** The schema string returns zero hits in Figma's documentation; it is not a
  verified native import path. Importing it via the Variables modal will not resolve as a
  user might expect.
- **Status.** DECIDED. Tracked as OD-003.

## ADR-008: OKLCH→CAM16 hue is a sampled mapping  **(SUPERSEDED, see ADR-011)**
- **Context.** Users may enter hues in OKLCH; the engine works in CAM16 hue.
- **Decision.** Map an OKLCH hue to CAM16 by sampling one fixed mid color
  (L=0.72, C=0.10) at that OKLCH hue and reading its CAM16 angle. Memoized.
- **Rationale.** CAM16 hue at a given OKLCH hue varies with L and C; an exact per-color
  mapping is not well-defined for a single "hue input". The fixed sample is a deliberate,
  reproducible compromise.
- **Consequences.** A few degrees of drift vs. an exact mapping. Acceptable for hue *input*;
  not used for output color math.
- **Status.** SUPERSEDED by ADR-011. The fixed mid-sample mapping (and its "few degrees of
  drift") is gone: `oklchToCam16Hue` is now a chroma-aware Newton inverse that lands the
  rendered identity color on the stored OKLCH hue to ~0.00°.

## ADR-009: Fixed viewing conditions (no VC controls)
- **Context.** CAM16 is parameterized by adapting luminance, surround, background.
- **Decision.** Derive one fixed VC (`makeVC`: average surround, bg 50, mid-gray adapting
  luminance) at load. Do not expose VC controls.
- **Rationale.** Target is screen sRGB under average surround, one stable appearance
  context. Exposing VC would make exports non-portable and the chroma peaks unstable.
- **Status.** DECIDED.

## ADR-010: Single-file, dependency-free, offline
- **Context.** The tool is a design utility that should run anywhere with no setup.
- **Decision.** One self-contained HTML file, vanilla JS, no build step, no runtime
  dependencies; the zip writer is hand-rolled (`makeZip`/`crc32`); persistence falls back
  `window.storage → localStorage → in-memory`.
- **Rationale.** Portability and longevity; the artifact must open and work years later with
  no toolchain.
- **Consequences.** No npm libraries; any new capability must be implemented inline.
- **Status.** DECIDED.
- **Re-framed 2026-06-15 (from the build).** "Single-file" is the **distribution** format, not an
  authoring constraint. The reference build authors **modular ES modules** (engine · tonal · semantic ·
  export · persist) and **bundles** them to one offline HTML (`ultimate-tokens.html`, ~111 KB,
  opens via `file://`). Authoring modular *and* distributing single-file are both satisfied, the
  "no build step" line means *no toolchain is required to run it*, not *the source must be one file*.
- **Amendment (2026-09-16).** The live storage chain (`window.storage → localStorage → in-memory`)
  now lives as a comment in `src/ui/persist.js`, not as code in this record; `persist.js` stays the
  pure serialize/hydrate pair, and the running app owns the actual I/O. The hand-rolled zip writer
  is `zipStore` (`src/ui/zip.mjs`), not `makeZip`.

## ADR-011: OKLCH-native hue model + chroma-aware OKLCH→CAM16 inverse  (supersedes ADR-008)
- **Context.** The per-palette `hue` was a CAM16 hue by default, and the OKLCH→CAM16 bridge
  was a fixed mid-sample mapping (ADR-008) that drifted a few degrees (worst ~15° at the
  blue/violet pole). The user is fluent in OKLCH; the drift made OKLCH-entered hues land off.
- **Decision.**
  1. **OKLCH-native.** The doc-level `hueSpace` default flips **cam16 → oklch** (`tonal.js`
     `DEFAULT_CONTROLS.hueSpace`; `persist.js` `DOMAINS.hueSpace.default`). The per-palette
     `hue` is an OKLCH hue by default. `cam16` stays selectable; legacy docs saved under
     cam16 carry `hueSpace:"cam16"` explicitly and keep rendering in cam16 (preserved).
  2. **Chroma-aware inverse.** `oklchToCam16Hue(h, chromaFrac=1)` becomes a Newton inverse of
     the render path: it finds the CAM16 hue whose color, *at `chromaFrac` of that hue's peak
     chroma*, renders at the target OKLCH hue. It is chroma-aware because the OKLCH↔CAM16 hue
     map shifts with chroma (the **Abney effect**), a fixed or cusp-only anchor is wrong at
     the other end. `effHue(hue, hueSpace, chromaFrac=1)` passes `palette.chroma/100`.
  3. **High-res HCT→OKLCH.** New `hctToOklch(hue, chroma, tone) → [L, C, H°]` reuses the CAM16
     solve and converts the converged linear sRGB straight through OKLab, no 8-bit
     round-trip. `projectView` emits `keyOklch`; the key HEX is derived from it.
- **Rationale.** Anchoring the solve at the palette's own chroma makes the rendered identity
  color land on the stored OKLCH hue to ~0.00°. **Principle:** HEX is only ever derived for
  consumption; perceptual coords come from the model at full precision (never measured back
  off an 8-bit hex).
- **Consequences.** Producers emit OKLCH hues: `gen-categories` stores each preset's source
  OKLCH hue and bakes `hueSpace:"oklch"`; `seedFromKeyColor(oklch, hueSpace="oklch")` returns
  the input's OKLCH hue (or CAM16 for a legacy cam16 doc); `defaultDocument` converts the 8
  starter CAM16 hues to OKLCH on the fly via `camHueToOklch`. **`role-table.json` is
  UNCHANGED**, still the cam16 answer key; the parity gate is intact. `hctToRgb` is
  byte-identical (refactored to share `_hctToLinRGB`). Engine gate: `hct-oklch-inverse`
  (`test/engine/hct.mjs`).
- **Status.** DECIDED.

## ADR-012: Ramp hue anchored in each path's RENDER space (per-path direct solve)  (complements ADR-011)
- **Context.** ADR-011 makes the palette `hue` an OKLCH hue and lands the *identity* color on it to
  ~0.00°. But a RAMP is exported in OKLCH while **authored in another space**, the perceptual/peak ramp
  in **OKHSL** (`okhslStops`), the "even" ramp in **HCT/CAM16** (`paletteStops`). "Constant hue" disagrees
  between the author space and OKLCH by a chroma- **and lightness**-dependent amount (the **Abney
  effect**). Anchoring the hue through one proxy point, `effHue → oklchToCam16Hue`, sampled at the hue's
  **peak tone** and a chroma fraction (`hueAnchorFrac`), left the KEY stop (500) off the set OKLCH hue:
  ~6° on perceptual blues, up to ~9° on the even path under mid-tone amplification (`dampAmp`).
- **Decision.** Anchor the hue in the space each ramp **renders**, at the **KEY stop (500)'s ACTUAL
  chroma + lightness**, not a peak-tone proxy. Each path Newton-solves its own author-space hue so stop
  500 reads back at the set OKLCH hue:
  1. **Perceptual/peak** → `solveOkhslHue(targetOklchHue, s₅₀₀, l₅₀₀)` over `rgbToOklchHue∘okhslToRgb`
     (shipped #201/#202).
  2. **Even** → `solveCam16Hue(targetOklchHue, c₅₀₀, tone₅₀₀)` over `hctToOklch` (this change).
  `effHue`/`hueAnchorFrac` are RETAINED for the `hueSpace:"cam16"` passthrough, the even path's **gamut
  basis** (the `c₅₀₀` seed), and the OKHSL cusp seed.
- **Rationale.** The error is a space mismatch that varies with **both** chroma and lightness, so only a
  solve at the stop's real conditions cancels it; a single peak-tone anchor is right at one end and wrong
  at the other. Same discipline as ADR-011 (anchor the inverse at the palette's own chroma), **anchor in
  the space the ramp renders, not a proxy.** Result: **~0.5° across the wheel, any damping, both paths**
  (from 6°/9°).
- **Consequences.** A few extra Newton iterations per palette (cheap, palettes are few, the loop is ≤16
  steps and converges in ~3). **`role-table.json` is UNCHANGED**, this is a render-layer calibration, not
  a role remap, so the parity gate holds. Only OKLCH-hue palettes shift; `hueSpace:"cam16"` docs render
  byte-identical (the passthrough branch). Gate: `oklch-hue-anchor` (`test/engine/tonal.mjs`) asserts stop
  500 exports within **1°** of the set hue across the wheel incl. blues, for **both** ramp paths, at
  `dampAmp` 0 and 66.
- **Status.** DECIDED.

## ADR-013: Editorial type voices (7 → 11) + the box/flow decoupling
- **Context.** The type taxonomy shipped **seven** voices (Display · Heading · Sub-heading · Kicker ·
  Body · UI · Code), a `make7()` factory, each voice a size ramp riding one of five font roles
  (display/heading/body/ui/mono). It lacked the everyday **editorial** roles: a standfirst/lede, a
  block/pull quote, a figure/media caption, and fine-print. Two constraints shaped the fix: the engine
  emitters are all generic (a new voice auto-flows from one `cat()` line), and `role` conflated three
  things, the **font**, the **paragraph flow** (single-line height + paragraph factor), and the character.
- **Decision.** Add **four editorial voices → `make11()`** (via intent-grill, 2 rounds): <!-- fix-old-names: keep -->
  1. **Set + roles.** **Lead** (body role, a larger standfirst), **Quote** (**heading** role, so it
     inherits each treatment's display face, a serif pull-quote in the serif treatments, a grotesque in
     Brutalist), **Caption** and **Legal** (fine-print). All four ride **existing** font roles, so **no new
     font** is introduced.
  2. **Lean ramp.** Each new voice uses a 3-step **`STEPS_3`** (SM·MD·LG, MD = base), not the full XS–XL,
     editorial voices use one-or-two registers. Total steps 41 → **53**.
  3. **The `box`/flow decoupling (OVERRIDE of the old role⇒flow coupling).** A new per-voice **`box`**
     field separates presentation flow from font role. It DEFAULTS from the role (`ui`/`mono` ⇒ `box`), so
     the seven originals are **byte-identical**. **Caption + Legal ride the ui FONT but set `box:false`**,
     they are PROSE (reading leading ~1.5, paragraph factor 0.75×, **no single-line height**), not the
     control/box treatment the UI voice itself gets. `singleLineHeight` and the paragraph factor now key on
     `box`, not on `role === "ui"||"mono"`.
  4. **Treatment integration**: hybrid: fixed cross-treatment defaults + a few per-voice knobs
     (`leadWeight`, `quoteLead`, `legalWeight`, …), the Kicker/Code pattern; used sparingly (Luxury lightens
     Lead/Quote, Editorial tightens the Quote leading, Brutalist heavies the Quote).
- **Rationale.** A voice is a **function**, so the editorial roles are voices (semantic tokens
  `--type-quote-*` etc.), not Body levels. Riding existing roles keeps the blast bounded; the `box` flag is
  the minimal, correct model for "ui font, prose flow" and generalizes the old ui/mono⇒single-line rule.
- **Consequences.** Emitters (CSS/DTCG/Figma/MCP) auto-flowed. The lockstep edits: `persist.js` VOICES
  allowlist (else per-voice overrides drop on hydrate, the one silent landmine), the test count literals
  (`GROUPS` 11, headless 53 steps / 11 groups), `styles.css` `.ty-s0…10` series colours, and the
  `TYPE_SPECIMENS`/`SHORT` maps. **There is NO code-enforced type answer-key** (unlike colour's
  `role-table.json`): `typography.tokens.json` is a frozen reference snapshot, and the consumption plugin's
  `voice-parity.mjs` **auto-derives** the voice list from the live engine, so parity holds without a
  hand-kept table; the spec/README/marketing "seven"→"eleven" is doc drift, serviced in the same change.
- **Status.** DECIDED.
- **Update (2026-07-13).** The voice SET/NAMES here were renamed and the size mechanism changed
  (superseding this ADR's `STEPS_3`/`STEPS_5`/`STEPS_UI` shape, not its voice-count decision, still
  eleven): Heading→Headline, UI→Label; Quote folded into Lead, Caption folded into a new Tiny voice,
  Legal folded into Body; Title and Sub-title added. Every voice is now a uniform 3-step SM/MD/LG ramp
  (was 5/3/8 steps by voice) at a FIXED, hand-authored size per step, shared identically across all 5
  treatments, instead of a per-treatment `base × ratio^step` modular scale; `ratio` is retired as a
  per-voice/per-treatment knob entirely. See `src/engine/type.mjs`'s header comment and
  `docs/reference/typography/README.md` for the current shape.
- **Update (2026-07-13, later the same day).** Voice count moved eleven → **thirteen**: `Code` renamed
  to `Body-mono` (same behavior, mono role, sentence case, pegged to Body's own sizes, pure rename,
  matching the Sub-heading/Sub-title hyphenated-compound convention); `Label-mono` added (mirrors
  Label, mono role, sentence case, box:true control text, pegged to Label's own sizes, the same
  relationship Code/Body-mono has to Body, applied to Label; Kicker is untouched, still its own
  distinct uppercase/wide-tracked voice); `Tiny-mono` added (mirrors Tiny, mono role, box:false prose,
  pegged to Tiny's own sizes). Tiny's own fixed sizes also moved 10/11/12 → **9/10/11** in the same
  change (Kim: "Tiny should be size 9, 10, 11"), this does NOT touch the `bodyBase`/`factor` identity
  anchor (only Body's own MD literal feeds that), so no ripple to `DEFAULT_TYPE` was needed this time.
  `makeVoices()` (renamed from `make11()`, which now understates the count) still returns 5 primary
  voices consumed by the Color Categories 5-slot preset design (Display/Headline/Body/Label/Kicker),
  the 3 new mono siblings and Kicker are NOT part of that per-preset design surface, so no preset
  regeneration was required beyond the mechanical `gen:categories` re-run.
- **Update (2026-07-13, again the same day).** Sibling weights: `siblingWeightDefaults(core)` moves
  from 2 stops to **3**, one stepping AWAY from the ladder's center, two TOWARD it (nearer first),
  e.g. core Extra-bold 800 → Black 900 (away), Bold 700, Semi-bold 600 (toward). More consequentially,
  every voice's `weights` is now **AUTO-POPULATED by default** in `typeScale()`, no
  `config.voices[v].weights` opt-in required anymore (Kim: "they should all have it"); an explicit
  `weights: [...]` (including `[]`) still replaces the default entirely per voice, `[]` being the one
  remaining opt-OUT lever. Because siblings now exist for nearly every voice by default, the Figma
  CORE style also always carries a name segment now, **dot-prefixed, Title-Case** (`Voice/step/•
  Name`, e.g. `Body/md/• Regular`), not the old bare kebab-slug, so it can never collide with a
  sibling's own lowercase-kebab name (`Body/md/semi-bold`) and reads visually as "the default" in the
  Figma Styles panel. A voice explicitly opted OUT via `weights: []` is the only remaining case that
  keeps the bare `Voice/step` name. See `figma/binder/style-plan.mjs` and the "Sibling weights"
  section of `docs/reference/typography/README.md`.
- **Amendment (2026-09-16).** Voice count moved thirteen → **fifteen** (TKT-0008): `UI-control` and
  `UI-widget` were added, splitting the interactive `ui` role into controls (buttons/inputs/selects,
  the ratified control table) and widgets (tags/badges/switches). `src/engine/type.mjs`'s header
  comment names the current fifteen: Display · Headline · Sub-heading · Title · Sub-title · Lead ·
  Body · Body-mono · Label · Label-mono · Kicker · Tiny · Tiny-mono · UI-control · UI-widget.

---

## ADR-014: The `ultimate-tokens` rename orphans all Figma `pluginData` (no migration is possible)
- **Context.** The product renamed `nonoun-color-tokens` → `ultimate-tokens` across four namespaces: the
  custom element, the localStorage keys, the Figma plugin id, and the brand-kit MCP schema. Three of the
  four are migratable. The fourth is not.
- **Decision.** Rename the Figma plugin `id` anyway, accepting that every key it ever wrote is orphaned.
- **Why no migration exists.** `figma.root.setPluginData(key, value)` is namespaced **by the calling
  plugin's id**. A plugin can only read back the data *it* wrote under *its own* id. Once the id changes,
  the pre-rename keys are not merely differently-named, they are **unreachable**, from any code path, in
  any plugin. There is no cross-id read API. A "migration" would have to run under the OLD id, and the old
  plugin is what's being replaced. So `LEGACY_CONFIG_KEY` (the `"hct-config"` fallback that survived the
  *previous* rename, when the id happened not to change) is dead code and was removed.
- **What is gated instead.** `load-config` must degrade to a **clean empty config** when only pre-rename
  keys are present, never throw, never silently adopt a stale one (`test/figma/plugin.mjs`, `config` gate).
  The user's cost is re-running *apply* once on an old `.fig`; the config also travels in the exported
  bundle, so nothing is unrecoverable.
- **Contrast with localStorage.** The web app's keys ARE migratable, same origin, no namespacing, so
  `migrateStorageKeys()` chains `hct-palette-state-v1` ← `nonoun-color-tokens` ← `ultimate-tokens`,
  newest legacy wins, and never overwrites a present key. The asymmetry is the platform's, not a choice.
- **Consequences.** The `<nonoun-color-tokens>` element tag stays registered as a deprecated alias (and its
  CSS selectors keep matching), because there the compatibility *is* free. The separately-published **Color
  Tokens Semantic Binder** plugin keeps its own id (`color-tokens-semantic-binder`) for the same reason in
  reverse: renaming it would orphan *its* data and its Figma listing, and it gains nothing.
- **AMENDED 2026-07-09 (#250).** The alias was **retired**. "Free" priced only the code; it ignored that the
  alias keeps the retired brand alive in the DOM, in `styles.css`, and in every generated bundle, which the
  debrand (ADR-015) forbids. An embed on the old tag now renders nothing: a visible failure, which beats a
  silently-styled ghost element. The **storage** half of this ADR is untouched, `migrateStorageKeys()`
  still chains the old prefixes, because that carries a user's saved palettes and dropping it deletes work.
  The tag was cosmetic compatibility; the keys are data compatibility. Only the first was expendable.
- **Status.** DECIDED (consequences amended).

---

## ADR-015: The product is unattributed: no maker brand, no "by" line, no monogram
- **Context.** The product shipped as **"Ultimate Tokens by NONOUN"**: a maker brand with an "N" monogram
  (favicon, og:image, in-app wordmark mark), a `nonoun.io` support/docs/account surface, and a voice
  platform whose §1 derived the house grammar rule ("no nouns, just verbs") from the *etymology* of the
  maker's name.
- **Decision.** Retire the maker brand entirely. The product is **"Ultimate Tokens"**, every mention, no
  longer form, no attribution. Copy speaks as "we"; nothing signs the work.
- **What replaced the nonoun.io surface.** Nothing branded. Support is **GitHub Issues**, docs are the
  **repo README**, billing is **Lemon Squeezy's own customer portal**. Every replacement link RESOLVES
  today, the alternative was a domain nobody owns, shipping 404s behind a nicer name. The unbuilt
  hosted-MCP and magic-link URLs became explicit `<APP_DOMAIN>` / `<MCP_DOMAIN>` placeholders, so Phase B
  must acquire a domain as step zero rather than inherit one.
- **What survived the removal.** The *stance*, not the signature. "No nouns, just verbs" is load-bearing on
  its own and stayed; only its origin story went. The one-person-workshop posture likewise steers how copy
  is written, it just no longer names anyone. **A workshop that names itself is performing smallness; one
  that ships is demonstrating it.**
- **The mark.** The monogram could not be renamed away, it *was* the letterform. It was deleted, along
  with its eight `ico-nonoun-*` assets, and the favicon set was regenerated from a brand-neutral mark:
  four tonal swatches, which say what the product *is* rather than who made it.
- **Why this is gated, not swept.** A find-and-replace decays. The next person to write a toast, an og:
  tag, or a lifecycle email reintroduces the maker by muscle memory, and re-attribution is a *factual*
  claim about who makes this. So `test/repo/branding.mjs` runs in `npm test` and fails on `NONOUN`, on any
  `nonoun.io` URL, and on the pre-rename identifier outside a named back-compat allowlist. `voice-check.mjs`
  raises the same word to **ERROR** in copy.
- **What still, deliberately, names the old identifier.** Only the `migrateStorageKeys()` prefix chain,
  **data** compatibility, which carries a user's saved palettes across the rename (see ADR-014). The
  `<nonoun-color-tokens>` element tag was **cosmetic** compatibility and went with the brand: a tag is a
  name the DOM says out loud. The allowlist in the gate is the boundary, and a *new* file may not quietly
  join it.
- **Status.** DECIDED.

---

## ADR-016: One kebab-case naming grammar across every emitted surface; the moded collection is "Breakpoints"
- **Context.** The 2026-07-17 six-seat architecture review (reports:
  `docs/reference/reviews/2026-07-17-*.md`) found the emitted naming bimodal, semantic roles
  kebab in CSS/Tailwind but camelCase in JSON/DTCG/UI3; `paddingNarrow` beside `stack-tight`
  inside one collection; type's Figma emitter preserving `Sub-heading/MD` while geometry kebabs
  its groups, plus a three-way collection-name split (`Color / Primitives` vs `Color
  Primitives`), the merged moded collection still named "Geometry" while hosting all of
  typography (TKT-0009), and two homonym pairs (`size/*/gap` vs `gap/*`, `size/*/radius` vs
  `radius/*`).
- **Decision.** Adopt the librarian grammar in full (report §"Proposed naming grammar", 8
  rules), ratified 2026-07-17: **kebab-case for every emitted token/path segment on every
  surface**, CSS, DTCG keys, JSON, UI3, Figma variable paths *including voice/step segments*
  (`type/ui-control/md/line-single`), `/` as the only path delimiter (never inside a display
  name), base-variant-modifier word order (`padding-narrow-compact`), suffixes always trailing
  (`-single`, ` •`), 3-digit stop padding, the homonym-check gate, and collection names per
  rule 8. Homonyms resolve by leaf rename: `size/*/gap` → `size/*/icon-gap`, `size/*/radius` →
  `size/*/pill-radius`. Scrims nest (`{n}/scrim/{step}`), JSON keys by palette slug. The
  canonical collection set (one shared constant, both export + plugin): **"Color Primitives" ·
  "Color Semantic"** (renamed from "Color Modes", rule 8: name the content when the mode axis is
  self-evident) **· "Breakpoints"** (renamed from "Geometry", its modes ARE the axis; the
  domain name became a lie when type/ moved in) **· "Font Primitives"**.
- **Rationale.** One grammar ends the C1/C2/M1 drift class at the root instead of per-emitter;
  kebab matches the shipped CSS surface, W3C DTCG style practice, and the ratified TKT-0010
  token names. Engine-INTERNAL JS identifiers stay camelCase, the grammar governs emissions.
- **Consequences.** A one-shot migration wave (TKT-0013) across engine emitters, tests, consumer
  skills, the design-systems plugin, and BZZR, gated on the rename-capability prerequisite
  (TKT-0012), because all apply-loops reconcile by name and a bare rename orphans user bindings
  (collections-arch review, CRITICAL-1). Collection renames additionally migrate the provenance
  registry keys. Deliberate divergences stay fenced: Tailwind's literal `color` namespace,
  ShadCN's fixed vocabulary, Figma's all-pixel rule.
- **Status.** DECIDED (ratified 2026-07-17; execution TKT-0011..0014).
- **Amendment (2026-09-16).** The #491 ruling (2026-09-02) renamed the collection set again,
  content-named and tier-matched: "Color Semantic" → **"Color Roles"** (was "Color Modes"),
  "Font Primitives" → **"Type Primitives"** (the product's own "Type" vocabulary, not "Font"),
  and "Breakpoints" → **"Geometry"** (a revert: the mode axis stays the same collection, just
  renamed back). "Color Primitives" is unchanged. `src/engine/collections.js` is the one shared
  constant for both the export and the Figma plugin.

## ADR-017: Ticket backend moves from `docs/tickets/*.md` files to GitHub Issues
- **Context.** Since 2026-07-12 ([[tickets-workflow-adopted]]) `docs/tickets/` held every `kind:
  bug`/`kind: feature` TICKET, minted by scribe's `/bug-report`/`/feature`, frontmatter carrying
  `status`/`size`. By 2026-07-17 the store had grown to 30 files (TKT-0001..0030), 18 still open
  (TKT-0004, TKT-0013..TKT-0030), a plain-file backlog living only inside this repo, invisible to
  GitHub's own issue search/labels/assignment/notifications, and duplicating machinery (`status:`,
  `size:`) that Issues already provide natively (open/closed state, labels). The repo already ships
  through GitHub (PRs, CI, `gh pr merge`) and `gh` is authenticated with `repo` scope, the
  git-native backend scribe's `/bug-report`/`/feature` support out of the box was simply never
  switched on here.
- **Decision.** New bugs/features/issues route to **GitHub Issues** via `gh issue create`, not new
  `docs/tickets/*.md` files. The payload contract is unchanged (Summary/Acceptance/Links/Scope-
  Open/Findings as `##` sections); `kind:bug`/`kind:feature` + `size:small`/`size:big` labels
  replace the frontmatter fields as the machine-read surface. `docs/tickets/` freezes as the
  pre-2026-07-17 archive, its 12 already-`done` files stay put as historical record; its 18 open
  files migrate to Issues (`TKT-0031`) rather than continuing to accrue alongside a second store.
  CLAUDE.md's Layout section carries the routing-table row scribe's own intake Phase 0 reads to
  detect this ruling.
- **Rationale.** One live backlog beats two: a file-and-Issue split would silently fork "what's
  open" across two places with no cross-link, and every future `/bug-report`/`/feature` run would
  have to re-decide the backend from scratch without a durable ruling to read. GitHub's native
  open/closed + labels + search subsumes the frontmatter `status:`/`size:` fields at zero added
  maintenance, and surfaces the backlog to collaborators who don't have this repo's `docs/`
  conventions loaded.
- **Consequences.** Every consumer of the old file contract updates once: `project-docs`
  (routes doc-shaped "what's open" questions, now split pre/post-2026-07-17), any script reading
  `docs/tickets/*.md` frontmatter (none found outside the skill's own intake at ratification time,
  reverify at TKT-0031), and this repo's own muscle memory ("check `docs/tickets/` for open work"
  becomes "check `gh issue list`"). No file-format migration risk: Issues are created fresh from
  each file's existing Summary/Acceptance/Links/Scope-Open text, not parsed/transformed
  mechanically.
- **Status.** DECIDED (ratified 2026-07-17; migration execution `TKT-0031`).

## ADR-018: `role-table.json` stays a hand-kept answer key; only the Figma-sandbox copy generates
- **Context.** TKT-0019 (#331) proved a splice-at-build-time generator (`scripts/gen-figma-binder-code.mjs`)
  for the Figma-sandbox binder's (`figma/binder/figma-semantic-binder/code.js`) hand-duplicated
  executable bodies: the five float-executor functions AND its 53-row role table, both previously
  hand-copied because Figma's standalone-plugin sandbox cannot `import` a `.mjs` at runtime, the same
  constraint the `FLOAT_PLANS` download-time anchor already worked around. TKT-0030 (#342) asked whether
  the same generate-don't-duplicate technique should extend to the *other* two role-table copies:
  `docs/reference/data/role-table.json` (the hand-edited answer key) and `src/engine/semantic.js`'s
  `semanticRoles()` (the actual implementation), "three role-table copies… hand-kept in lockstep behind
  test gates," per the issue.
- **Decision.** Partial: TKT-0019's build already collapsed the count from three copies to two, the
  binder's `roleTable(paletteName)` is now `semanticRoles()`'s function body, spliced verbatim (plus its
  3 supporting `SCRIM_*` consts), not hand-copied. The remaining pair, `role-table.json` ↔
  `semantic.js`, is ruled **WONTFIX** for further generation. `role-table.json` continues to be
  hand-edited exactly as `adding-semantic-roles` already documents (no `gen:role-table` script), and
  `test/engine/semantic.mjs`'s `refs-canonical` gate keeps deep-equaling `semanticRoles("primary")`
  against it.
- **Rationale.** The binder's role table and `role-table.json` are NOT the same shape of problem, even
  though both are called "duplication" in the issue. The binder's copy existed for a purely TECHNICAL
  reason (the sandbox import constraint) and carried ZERO independent verification value, it was pure
  waste, the ideal generation target, and TKT-0019 eliminated it with no loss of any guarantee.
  `role-table.json` is the opposite: it is a deliberately hand-authored, INDEPENDENT answer key (the
  test's own comment calls it exactly that, "the canonical primary-palette table (answer key)"), whose
  entire job is to catch an ACCIDENTAL behavioral change landing directly inside `semanticRoles()` (a
  mistyped ref, a reordered role, a dropped state). If `role-table.json` were generated FROM
  `semanticRoles()`, the `refs-canonical` gate becomes tautological, "X deep-equals a copy of
  itself", and would pass unconditionally even if `semanticRoles()`'s logic silently regressed, because
  there would no longer be an INDEPENDENT reference to diff against. This is the same tension ADR-011
  already ruled on for this exact file (the cam16-hue encoding "looks wrong" but is the deliberate
  answer-key snapshot), a second, load-bearing precedent for treating `role-table.json` as a golden
  master, not a duplicate implementation. The reverse direction (generating `semanticRoles()` FROM
  `role-table.json`) is not even coherent to attempt: `role-table.json` carries rows for exactly ONE
  palette name (`"primary"`), while `semanticRoles(paletteName)` is a general, name-parametric function,
  there is no data in the JSON sufficient to derive the function for any other palette.
- **Consequences.** `role-table.json` and `semantic.js` continue to move together BY HAND on every
  role/count change, per `adding-semantic-roles`' existing lockstep procedure, an accepted, ongoing
  maintenance cost (not a defect), because the human-authored second copy is the feature, not the bug.
  No test, script, or skill changes; the `refs-canonical` gate is unchanged and remains the drift-catcher
  it was designed to be. Revisit only if a genuinely NEW, unrelated reason to keep two independently
  generated copies ever surfaces, no such reason exists today.
- **Status.** DECIDED (2026-07-17; TKT-0030/#342, informed by TKT-0019/#331's completed build-out).

## ADR-019: The theme axis is a data-driven `{name, side}[]` list, not a hardcoded Light/Dark pair; a role stays 2-ended
- **Context.** The 2026-07-17 collections-architecture review
  (`docs/reference/reviews/2026-07-17-collections-arch.md`, CRITICAL-3) found the breakpoint axis
  fully generic (N modes, any names, `typeTokensFigmaModes`/`geomTokensFigmaModes`'s `modes[]`
  parameter) while the THEME axis was hardcoded to exactly two: `exportDTCG` only ever built
  `"Light_tokens.json"`/`"Dark_tokens.json"`, `figma/binder/bind-plan.mjs`'s `bindingPlan` only ever
  emitted `{lightTarget, darkTarget}`, and `figma/plugin/code.js`'s `applyBundle` hardcoded exactly
  two Figma modes named `"Light"`/`"Dark"`. Adding a third theme (a dim mode, high-contrast, a
  second brand) required an engine change, not a config change (TKT-0021).
- **Decision.** Genericize the AXIS, not the per-role DATA MODEL: a role keeps its existing
  2-ended shape (a `light` ref and a `dark` ref, semantic.js's header note, unchanged). A
  **theme** is a named Figma mode bound to ONE of those two already-resolved ends via a `side`
  field (`"light"` or `"dark"`). `semantic.js` exports `DEFAULT_THEMES = [{name:"Light",
  side:"light"}, {name:"Dark", side:"dark"}]`, the single source every surface falls back to.
  `exportDTCG(state, opts)` takes an optional `opts.themes` and emits one `"{name}_tokens.json"`
  per theme (in order); `bindingTargets(paletteNames, themes)` / `bindingPlan(paletteNames,
  themes)` take the same optional list (`bindingPlan`'s per-role shape changed from the fixed
  `{lightTarget, darkTarget}` fields to a generic `targets: [{mode, target}, ...]` array, no
  consumer read the old field names directly); `applyBundle` walks every `"{name}_tokens.json"`
  file the bundle actually carries (identified by its `$extensions["com.figma.modeName"]` tag, not
  by parsing the filename) and creates exactly that many Color Roles modes, in that order,
  pruning any mode the current bundle no longer wants. An absent/default `opts.themes` reproduces
  the pre-ADR-019 two-file, two-mode output **byte-identically**, proven by an explicit
  before/after diff, not just "tests still pass" (TKT-0021's own gate).
- **Rationale.** A THIRD resolved end per role (so "Dim" could carry its OWN color, distinct from
  both Light and Dark) would require a new field in the role table itself
  (`data/role-table.json`'s `roleTable`, `semantic.js`'s `semanticRoles()`, every consumer of
  `r.light`/`r.dark`), a far larger, separate change with its own role-count-style lockstep
  concerns (`adding-semantic-roles`). The axis genericization this ticket needed, "N named modes,
  not exactly 2", does NOT require that: a theme can already reuse either existing end under a
  new name (e.g. a "Dim" companion mode bound to the same `"dark"` side as "Dark"), which is
  sufficient to prove and use the generic plumbing today. A genuine third COLOR (not just a third
  NAME) is future work, scoped separately if the product asks for it.
- **Consequences.** `figma/binder/figma-semantic-binder/code.js` (the standalone binder, which
  reads a LIVE file's raw variables directly rather than an `exportDTCG` bundle) still hardcodes
  its own Light+Dark mode creation, out of scope for TKT-0021 (the issue and the review cite only
  `exportDTCG`/`bind-plan.mjs`/`applyBundle`); its `bindingPlan`-mirrored role table still emits the
  same canonical raw-color target SET either way (a 3-theme axis reusing an existing `side`
  contributes no new raw names, proven in `test/figma/binder.mjs`'s `themes` gate), so the two
  binders stay compatible, but the standalone binder does not yet let a user create a 3rd Color
  Roles mode on its own. `exportUI3`'s `Color Roles` collection (`values:{Light, Dark}`) was
  NOT touched, also out of the ticket's named scope; it carries the identical hardcoded-pair
  pattern and should genericize the same way in a follow-up (a documented gap, not a fixed one).
  No UI control was added for authoring extra themes per doc, this ADR ratifies that the
  ENGINE/BIND/APPLY path no longer blocks it structurally; wiring a user-facing control is a
  separate, later decision.
- **Status.** DECIDED (ratified 2026-07-17; TKT-0021). Follow-up: genericize `exportUI3`'s theme
  axis and the standalone binder's live-mode creation the same way, if/when a real 3rd-theme ask
  lands (tracked informally here, not yet a filed ticket).

## ADR-020: `bundle.mjs` stays the single-file inliner; vite is not byte-comparable and not adopted
- **Context.** `scripts/bundle.mjs` is a hand-rolled regex import-transformer with manually-synced
  `MODS`/`KEY` module registries and a documented no-default-export limitation. `vite` is already a
  devDependency (it builds the real web app from `index.html`/`src/ui/index.html`). TKT-0028 was a
  time-boxed spike asking whether vite's own single-file build capability could replace
  `bundle.mjs` for the Figma-sandbox-embeddable bundle, with the acceptance bar stated explicitly
  as **"adopt only on byte-comparable output."**
- **Decision.** Keep `bundle.mjs`. Do not adopt vite for this artifact. Instead, harden
  `bundle.mjs` with a `preflight()` whole-graph scan (below) that runs before any transform.
- **Rationale.** A real vite build was attempted: a JS entry (`import "./styles.css"; import
  "./app.js";`) built in `lib` mode with `rollupOptions.output.inlineDynamicImports: true` and
  `cssCodeSplit: false` (vite 8.0.16, rolldown-powered) DOES fold every dynamic `import()`, the
  category-module lazy chunks, into one chunk with no runtime module resolution, which is the
  actual hard constraint (the Figma UI iframe has no module server to satisfy a real `import()`).
  So vite *can* produce a working single-file bundle mechanically. But the acceptance bar is byte
  parity, not "also works": vite/rolldown's output carries its own module-runtime prelude
  (`rolldown/runtime.js`'s `__esmMin`/`__exportAll` helpers) and a completely different code shape
  from `bundle.mjs`'s naive source concatenation, so byte-identical output is categorically
  unreachable, not a tuning problem, a different tool. Measured on the SAME source tree: the
  current `bundle.mjs` output (CSS + JS + HTML shell, unminified by construction) is **2832.8 KB**.
  The vite build's JS+CSS alone (unminified) is **~3397.9 KB** (3301.15 KB JS + 96.75 KB CSS),
  **~20% larger before even adding an HTML shell**, and minifying the JS barely helps (3039.62 KB,
  only ~8% smaller) because most of this artifact's bytes are inert DATA embedded as JS/JSON
  string literals (the ~343 curated palettes, the base64-embedded self-hosted fonts, the whole
  Figma binder `code.js` and MCP server source carried as string constants for download), a
  minifier cannot compress opaque string payloads the way it compresses logic. So switching
  bundlers would be a straight ~20% size regression on a downloadable offline single-file build
  and the Figma plugin's embedded UI, for a documented limitation (`export default`) that a repo
  grep confirms **zero current files trigger**, a latent risk, not an active one.
- **Consequences.** `bundle.mjs`'s `MODS`/`KEY` registries stay hand-maintained; every new module
  in the import graph still needs an entry in both (unchanged going forward, `adding-export-formats`/
  `building-editor-sections` and similar skills that touch these registries are unaffected). In
  exchange, `scripts/bundle.mjs` gained a `preflight()` function that runs before any transform and
  reports EVERY registry problem in one itemized error instead of dying on the first: (a) a `KEY`
  entry pointing at a `MODS` key that doesn't exist, previously this destructured `__M.<key>` as
  `undefined` and only threw in the **browser**, on whatever click path first reached it; (b) two
  `MODS` entries sharing a basename in different directories, `KEY` is keyed by basename only, so
  this silently resolved every importer to whichever one the object literal's last-key-wins landed
  on, with **no error at all**; (c) the existing per-import/`export default` check, now run
  up front across the WHOLE graph (every problem reported, not just the first file the assembly
  loop happens to reach) with source-file context on each line. Verified: `npm test` and
  `npm run build` green with byte-identical `dist/ultimate-tokens.html` (2832.8 KB) and
  `figma/plugin/ui.html` (2835.8 KB) output before/after the hardening; `npm run smoke` (real
  headless Chrome, TKT-0028's own verification bar for the Figma-embeddable bundle) green end to
  end, including the Apply-to-Figma consent gate.
- **Status.** DECIDED (ratified 2026-07-17; TKT-0028, a spike, no follow-up work implied). If a
  future change genuinely needs a default export, or vite gains a mode that reproduces
  `bundle.mjs`'s concatenation shape (no module-runtime prelude) at comparable size, this ADR is
  the record to revisit, not to silently override.

## ADR-021: The hosted describe-palette MCP breaches "the generator stays client-side"; the server-side interpreter is demoted to a non-agent-only path

- **Context.** `docs/site/mcp-hosting-spec.md` §1 lists a load-bearing constraint, unchanged since
  the hosted-MCP spec was first drafted: **"the generator stays client-side"**, the Vite SPA is
  static (Cloudflare Pages) and the Figma plugin stays offline (`networkAccess:"none"`), so no
  token-generation math runs server-side anywhere in the product. The describe-a-palette program
  (#379; local flavor #369–#374 shipped) introduces exactly that: a hosted `generate_kit` (#377,
  blocked on domains/accounts) running `describe-kit-core.mjs`'s deterministic engine inside a
  Cloudflare Worker, plus a NEW server-side LLM call (`describe_palette`) interpreting a
  plain-language description into a `PaletteBrief`, something no part of this product has ever
  done. Both are exactly the entitlement-gated, recurring-value capability the Pro tier anchor
  wants (`describePalette`, ruled Pro-gated 2026-07-18, issue #379), not an accidental drift past a
  constraint nobody re-examined. Two decisions needed ratifying together: whether the breach is
  acceptable, and, since a server-side LLM call is itself a new, distinct capability, not just "the
  same engine, hosted", who is allowed to reach it.
- **Decision.** The constraint is **amended, narrowly**: server-side generation is permitted **only**
  for the describe-palette surface (`generate_kit` + `describe_palette` on the Phase B Worker,
  #377), gated the same way every other Pro capability is (`flagOf("describePalette")`,
  server-side entitlement, never a client-side check). Every OTHER surface keeps the original
  constraint verbatim: the app SPA stays static, the Figma plugin stays offline, no generation math
  runs server-side for the downloadable/local flavor or for any read-only hosted-kit-sync path
  (`docs/site/mcp-hosting-spec.md`'s own kit-storage/OAuth scope). Within the describe-palette
  surface, the server-side LLM (`describe_palette`) is further demoted: it exists **only** for
  LLM-less clients, the web's own "describe a palette" input box, a plain HTTP/curl caller, anything
  with no LLM of its own to interpret the words. An **agent** caller (Claude Code, any MCP client
  with its own model) is steered away from it entirely, by the tool descriptions alone (spec §8,
  item 2), toward the self-teaching `generate_kit{description}` → `generate_kit{brief}` two-step
  (#371) instead, where THAT caller's own model does the interpreting. `describe_palette`, when it
  does run, calls its provider with **forced tool-use against the `PaletteBrief` schema** (§3),
  output is guaranteed schema-valid, never free text to re-parse, and echoes the brief back in
  `meta.brief` (§6.4), the same reproducibility handle the local flavor already carries. Local and
  hosted `generate_kit` tool surfaces stay **parity-gated identical** (G1–G3, spec §8); the ONLY
  permitted asymmetry between the two flavors is `describe_palette`'s hosted-only existence, plus
  the account-scoped `list_kits`/`kit` additions the hosting spec already carries, anything else
  differing is a parity failure, not a judgment call.
- **Rationale.** The alternative to amending the constraint is not "keep the app static", it's
  "never ship the described-value Pro feature," since #379's own natural-language entry point
  (a web box with no LLM behind it, or a bare `curl`) has no other way to interpret a description
  into a brief; only an LLM can do that step, and an LLM-less client has none. Demoting the
  interpreter rather than exposing it to every caller equally is the cheaper, better-quality choice
  on its own terms, independent of the constraint question: routing an agent caller, which already
  carries an Opus-class (or better) model as the one interpreting the words in the LOCAL flavor,
  per #371's own design, through a cheaper, Haiku-class (or whatever the hosted provider call
  uses) server-side interpretation would CAP quality at the weaker model for every agent user, add a
  real per-call provider cost the local flavor never incurs, and hand an unauthenticated-by-model
  caller a standing LLM-call surface, an abuse vector (cost-drain, prompt-injection-via-description)
  the self-teaching local design was explicitly built to avoid (spec §1: "No server-side LLM in
  the local flavor."). Keeping `generate_kit`'s two-step path IDENTICAL on both flavors, and
  making `describe_palette` a narrow, LLM-less-only side door rather than a second front door,
  gets the best of both: every agent caller, local or hosted, gets the higher-quality,
  zero-marginal-cost, self-teaching path; only a genuinely LLM-less caller pays the cost (and
  accepts the ceiling) of a server-side interpretation, and only inside a Pro-gated, rate-limited,
  entitlement-checked surface (#377's own stated scope), not an open one.
- **Consequences.** `docs/site/mcp-hosting-spec.md` §1 is updated to reference this ADR at the
  constraint line, rather than silently drifting out of date the moment #377 ships, the spec's own
  words stay "the generator stays client-side" as the DEFAULT/GENERAL rule; this ADR is the named
  exception. `describe-palette-spec.md` §1/§8 already anticipated this ruling (written ahead of the
  ADR, citing it by number) and needed no further change. `mcp/describe-mcp-core.mjs`'s local
  `generate_kit` is UNAFFECTED, it already has no server-side LLM path and never will; this ADR
  constrains #377's hosted build, which has not started (blocked on domains/Phase B accounts, per
  #377's own stated scope), there is no code to retrofit today. When #377 IS built, its
  `describe_palette` tool's OWN description (the text a client reads) must state the LLM-less-only
  intent in-band, mirroring how `generate_kit`'s description already teaches its own two-step
  protocol (§5), a caller should never need to read this ADR to know which tool to reach for.
- **Status.** DECIDED (ratified 2026-07-18; issue #376). Unblocks nothing by itself, #377 remains
  blocked on domains + Phase B accounts regardless, but removes the one open ratification question
  (§13's "the hosting-spec constraint amendment must land as #376's ADR before #377 builds")
  standing between here and #377's eventual build.

## ADR-022: Preset typography declares REGISTERS, not slots; the migration was byte-identical

- **Context.** The intended-use canon (`docs/reference/typography/intended-use.md`, 2026-07-30)
  made preset typography reasonable, Layer 3 defines registers (a story/brand's tone tiers mapped
  onto the 15 voices, the worked BZZR example). But the 5-slot spec shape (`type.slots`, one entry
  per font role) couldn't express what the canon calls for: no `styleName` path (named cuts were
  brands-pass-through-only), `faces` voices got a family but no character, and 10 of 15 voices were
  unreachable from a spec. The preset revision program (ratified 2026-07-30) needs each palette's
  type re-reasoned from its story via the register-mapping method, which the schema must be able
  to carry.
- **Decision.** `type.slots`/`type.faces` are RETIRED. A spec palette declares
  `type.registers.{anthemic,contextual,functional,actionable,data}`, slot↔register 1:1
  (display→anthemic, heading→contextual, body→functional, ui→actionable, mono→data), each register
  carrying the same 4 core fields plus optional `styleName` (expressive-tier target voices only),
  explicit `weights` (`[]` = opt-out), and a `voices` sub-map restricted to the register's OWN
  secondaries (UI-control/UI-widget: font only, the ladders-only law). `faces` folded into
  `registers.functional.voices["Sub-title"].font`. The migration
  (`scripts/migrate-type-registers.mjs`, 339 palettes) was proven **byte-identical** on the
  generated presets, all rendered change is deferred to the per-category revision PRs, reviewed.
  The mapper is `registersToTypeConfig`; the categories gate gained a `schema` group (retired
  shapes, ownership, styleName tier, units) and generation throws on a retired shape.
- **Status.** DECIDED (2026-07-30; issue #405). The pass-through shape (`type.fonts`/`type.voices`)
  is unchanged, it remains the escape hatch for a real exported doc config (BZZR, Modal jazz).

## ADR-023: Scrims are one 500-based alpha ramp, mode-flat (records the ADR-004 supersession)
- **Context.** ADR-004 put the seven scrim roles on base 750; a note inside it (2026-06-17) records
  that this was superseded, but the live model has no record of its own.
- **Decision.** A scrim is `500-{step}`: the palette's 500 color at alpha% = step/10, 3-digit padded
  (ADR-006), identical in light and dark. All twelve scrim-using roles (the seven `scrim*` strengths
  plus outline and the container Low/High family) resolve onto that ramp; bases 250 and 750 stay raw
  primitives.
- **Rationale.** One saturated mid base reads as the same overlay in both modes; a per-mode base made
  scrims flip tone with the theme.
- **Consequences.** `src/engine/semantic.js` emits every scrim ref as `500-NNN`; any change moves
  `role-table.json`, the binder table, and the count gates in lockstep (ADR-018).
- **Status.** DECIDED (as-built since 2026-06-17; recorded 2026-09-16). Supersedes ADR-004.

## ADR-024: vite is the dev server and type check; bundle.mjs is the shipped artifact (rules the split ADR-010 and ADR-020 imply)
- **Context.** ADR-010 says "no build step" and ADR-020 rejects vite for the single-file bundle, yet
  `vite` runs in `npm run dev`, `npm run preview`, and inside `npm run build` (`tsc` then `vite
  build`). The split was implied, never ruled (verdict G3).
- **Decision.** vite serves development (`dev`, `preview`) and, with `tsc`, is the static check
  inside `build`; its output under `dist/` is never deployed or shipped. `scripts/bundle.mjs` alone
  produces the shipped artifact `dist/ultimate-tokens.html`, which CI copies to Pages and
  `gen-figma-ui` wraps into the plugin.
- **Rationale.** ADR-010's "no build step" means no toolchain is needed to run the artifact, not to
  author it; ADR-020's byte-parity bar keeps the inliner.
- **Consequences.** A change to `vite.config.js` cannot alter what ships; a module reachable from the
  app must still be registered in `bundle.mjs` MODS/KEY (K7). `npm test` stays vite-free.
- **Status.** DECIDED (as-built; recorded 2026-09-16). Amends ADR-010 wording; complements ADR-020.

## ADR-025: WCAG-safe on-colors are the DEFAULT, with an achromatic fall-through (amends ADR-003 / closes OD-001)
- **Context.** ADR-003 pinned `on{N}` to `050` in both modes as an explicit brand override, and its
  2026-06-25 amendment added `onColorMode: "contrast"` as an OPT-IN. The default document therefore
  still shipped accents that miss WCAG AA against their own on-color: measured on the production path
  (`brandKit(doc).roles` + `contrastRatio`), perceptual dark Secondary 3.05, Info 4.07, Neutral 4.21,
  Primary 4.31, Success 4.31, and every data family between 3.03 and 3.79; "peak" was far worse
  (Secondary 1.24, Success 1.58, Info 2.44, Warning 2.52). Park UI's `solid.fg` on `solid.bg` reads the
  same pairing, so the shipped Adia brand document missed the floor too: 18 of its 32 cells, worst
  Warning dark at 2.19. Flipping the default alone was measured first and does NOT close it:
  `applyOnColorContrast` only chose the better of two ramp ends, and where neither end clears 4.5
  against a mid-lightness accent there is nothing on the ramp to choose. Under the flip alone the
  default document still missed six cells and Adia two (Primary dark 4.44, Data 5 dark 4.48).
- **Decision.** `onColorMode` defaults to `"contrast"` (`tonal.js` DEFAULT_CONTROLS and `persist.js`
  DOMAINS, which must agree or a stored kit hydrates onto the other policy), and the policy gains an
  ACHROMATIC FALL-THROUGH: a ramp end is kept while it clears AA 4.5:1, and otherwise the on-color
  takes the pure `white`/`black` constant with the better contrast. `on{N}Variant` follows the side
  the prime chose rather than running its own pick, so the pair can never straddle. `"fixed"` remains
  as the opt-out for a brand that wants the uniform light tint back.
- **Rationale.** The floor is an accessibility requirement, not a brand preference, and it is now met
  without touching a single ramp stop, the owner's explicit constraint. White and black are already
  emitted once per document in every format (`--{pfx}-white`, `constants.white`,
  `raw/constants/white`), so aliasing to them keeps ADR-005's "every semantic var points at a raw var
  that is itself emitted" invariant. The alternative, retuning each family's skew and lift, would move
  the ramps and change the product's colors.
- **Consequences.** All 16 default families clear AA 4.5:1 in both schemes in all three tone modes
  (96 of 96 cells, from 52 of 96); the Adia document's Park mapping clears all 32, from 14. On-color refs may now
  be `white`/`black`, which every ref consumer routes to the constants namespace rather than the
  palette's own. Accent on-colors moved in every export format; no ramp stop moved. ADR-003's
  historical decision stands as the record of why the fixed policy existed; its default no longer
  ships. OD-001 is CLOSED.
- **Status.** DECIDED 2026-09-18 (#662, closes #636). Amends ADR-003; the `hpg-role-contrast` gate in
  `test/engine/semantic.mjs` holds the floor for all 16 families, both schemes, all three tone modes,
  plus the Park `solid.fg`/`solid.bg` pairing on the default and Adia documents.

## ADR-026: A palette's anchor is STORED, not fitted: the sampled source colour is the record
- **Context.** A curated preset was sampled from a real colour (a film frame, a brand mark, a place),
  but the document only kept `{hue, chroma, skew, lift}` fitted to it. The engine then re-derived a
  key colour from those four numbers, so what shipped as the palette's own colour was a reconstruction
  of the sample, not the sample: measured before #681, `prime.DEFAULT` matched the source byte for
  byte for essentially none of the 3,380 sampled palettes, with the worst stop-500 lightness error
  around 23 L\*. Fitting harder was the obvious alternative and was rejected on mechanism: four
  parameters cannot in general reproduce an arbitrary sRGB colour through a cusp-derived key colour,
  so the residual is structural, not a tuning failure.
- **Decision.** The source hex itself is stored on the palette, as `anchor`, and the engine reads it
  rather than re-deriving it. A palette carrying a valid `anchor` emits it verbatim at
  `prime.DEFAULT` (`primeSwatches(...)[3]`, unconditionally; superseded by ADR-030 on 2026-10-07: verbatim only at Prime chroma k 100, below it the rung follows k) and, when the source sits inside the ramp
  window `[9.95, 95.05]` L\*, at ramp stop 500 in all three tone modes. A second field,
  `sourceAnchor`, carries the generator's own copy: it is written only by `scripts/gen-categories.mjs`
  and `defaultDocument()`, never by the UI. Editing `hue` or `chroma` DETACHES the palette (`anchor`
  is removed, the palette becomes ordinary) while `sourceAnchor` survives, so the inspector can offer
  a Reset that restores the sampled colour exactly. `skew` and `lift` never detach and never move the
  anchor: they warp the ramp around the pivot, not through it.
- **Rationale.** The sample is the intent; a fit is a lossy encoding of it. Storing the hex makes the
  guarantee checkable by equality rather than by tolerance, which is what turned a "close enough"
  claim into a gate (`anchor-identity`, 3,380 exact, 0 off). It also separates two questions that the
  fitted form conflated: what colour the preset IS, and how its ramp is shaped around that colour.
- **Consequences.** `prime.DEFAULT` moved for all 3,380 fitted palettes and for the 16 default
  families, so every colour export moved once. Ten sampled sources sit outside the ramp window: their
  token stays exact while their ramp's stop 500 lands at the nearest window edge, and both the ramp
  and the ladder allow-lists are frozen by NAME and count, not by a threshold. Pinning stop 500 to a
  sampled colour also changes what "percentage of stop 500" means, because the pivot is no longer the
  ramp's designed peak: C6's median and p90 chroma bars miss in 14 of 24 checks on the rendered path,
  and the "0 stops above 100% of stop 500" bar is scoped to the non-anchored construction with a
  ratchet, not a bar, on the anchored peak path. That cost is recorded, not resolved. The perceptual
  and peak half of it is owned by **#725** ("Chroma envelope misses its muted targets in perceptual
  and peak mode, and nothing gates the direction"), open at the time of writing, `kind:bug` /
  `size:big`; #701 owns the even-mode `chromaFloor` side, a different defect in a different mode, and
  an earlier draft of this Consequence pointed the whole miss at #701 alone. The owner accepted on
  2026-09-20 that #681 closes with #725 open rather than holding the release for it, recorded in
  `.sdlc/questions/preset-intent-fidelity-preland.md`.
- **Status.** DECIDED 2026-09-20 (#681). Gated by `test/engine/anchor.mjs` (`anchor-identity`,
  `anchor-ramp`, the window and ladder allow-lists) and by the schema fields in `src/ui/persist.js`
  (`DOMAINS.palette.anchor` / `.sourceAnchor`). Knowledge-02 §9 is the reference description.
- **Amendment (2026-09-28, #701).** The even-mode `chromaFloor` side named in the Consequences above:
  the even floor's gamut reference is capped at the largest ceiling among stops 450, 500 and 550
  (`chromaFloor% * min(maxc, floorRef)`, never above `intended`): gamut-relative near white and black,
  flat on the side where the gamut widens away from the anchor. The even envelope has a smoothstep
  shoulder at the anchor (`EVEN_NEIGHBOURHOOD_R`, R = 0.2 in `sd` units, 90 stop units at lift 0). All
  three allow-lists it retires (the lone-spike list, the default-kit spike finding and the 90-name dip
  baseline) are gone: the lone-spike and off-anchor dip gates count 0 with no list, and the 32 dips at
  stop 500 are notches, printed and not gated.
- **Amendment (2026-09-29, #725, R69).** The owner ruled B on `.sdlc/questions/chroma-envelope-scope.md`.
  R69 REVERSES the Q-U2-5 muted-in-vivid-group intent (`.sdlc/questions/pif-u2.md`, #681 revision 17):
  the anchored basis no longer climbs above the anchor's own `s`, and the group target reads
  `min(group, anchor)`. The perceptual and peak damping constants are the closed-form pair that meets
  the ruled 75/25 bars: `c` = log2 3 and `d` 0.9275 (R76), mapped from `damp` by `r^2.1796`. The tone is
  held per stop by the `l` solve, which is the OKHSL `l` to CIE L\* chroma coupling (not
  Helmholtz-Kohlrausch). The movement is export-wide (the six identity lines over `main` at
  `afd415c0`, `report-preset-fidelity.mjs --identity-control --authored --base afd415c0`: perceptual
  3780 of 3780 palettes and 86008 of 94500 cells, peak 3780 of 3780 and 85463 of 94500, even 0 in
  both; default kit perceptual 16 of 16 palettes and 347 of 400 cells, peak 16 of 16 and 352 of 400,
  even 0 of 16) and is the second after this ADR's own. On the OKHSL anchored path the `oklch` hue is the anchor's own OKLCH hue with no per-stop
  solve (revision 8: OKHSL hue is OKLab hue, so the solve was the identity reading the 8-bit
  staircase); `hueSpace` is exactly identical on anchored perceptual and peak, the Q-D ruling made
  structural (superseded by ADR-031 on 2026-10-07: under `cam16` an anchored perceptual or peak ramp
  holds the anchor's CAM16 hue). The two FLOORS cells the retune costs (peak Success light 7.5, perceptual Data 3 dark
  4.8, R77) are recorded with the 41 pending cells.
- **Amendment (2026-10-03, #785, R94 to R98).** The owner ruled the `<group> base chroma` slider a
  damper on the whole ramp (`.sdlc/questions/pane-context-group-chroma.md`, revision 2), superseding
  R69's basis cap for the group value: the anchored target no longer reads the group at all. Every
  path renders its stops exactly as at group 100 (every floor, cap, hold and gamut step included),
  then `dampStops` in `src/engine/tonal.js` multiplies each stop's emitted chroma coordinate by
  `r = g / 100` at the same lightness and hue: OKHSL `s` on perceptual and peak, CAM16 C on even,
  anchored and unanchored alike, stop 500 included (R94, R98: one law, no per-mode, per-palette or
  floor exception). At 100 the multiply is the identity, so this ADR's anchor guarantee holds exactly
  at group 100 and stop 500 scales below it; an achromatic anchor's ramp stays achromatic (`r * 0 = 0`).
  Range 0 to 100, damp only (R95). `GROUP_DEFAULTS.material.baseChroma` moves from 30 to 100 (R96), so
  the default kit renders byte-identical to `main` in perceptual and peak at defaults; in even the
  kit's Neutral moves (3 of 19 hexes, max dC 2.65), accepted (R97). No persist migration (R98): a saved
  doc's stored value now reads as a damper. The R69 amendment above keeps its text as the record of
  what it ruled.
- **Amendment (2026-10-03, #766, R85, R87).** The even-mode floor's gamut reference, which #701 took once per
  ramp, is now read per stop (`floorRefAt` in `tonal.js`): the largest ceiling at the ramp's three reference
  tones (the pivot, 450, 550) at that stop's own hue BEFORE edge rotation, which is the CAM16 hue the
  per-stop OKLCH solve finds for its tone on the anchored OKLCH path, `seedHue` on anchored cam16 and
  `baseHue` on the non-anchored path; the pivot ceiling is read at `pivotTone`, so a clamped anchor no
  longer reads it at the anchor's own L\*. Edge rotation is NOT followed (the owner's R85, option A, on
  `.sdlc/questions/floorref-hue-U2-rule.md`, declining the rotation half of #766): the gamut ceilings are
  not monotone in hue, so a reference that follows the rotation rises or falls along the ramp against
  stops that do not move with it, and both directions measured off-anchor dips (4 / 20 / 64 at `hueShift`
  30 / 45 / 60 on a default-kit grid, base 0). The tolerance is a corpus measurement, not an engine bound
  (`scripts/report-preset-fidelity.mjs --floor-ref`): 0 gate-path cells move (72,124 `STOPS` and 94,900
  `EXPORT_STOPS` cells, every non-anchored palette byte-identical at every `hueShift`); the rendered
  path moves 3,870 of 71,820 `STOPS` cells (5.4%, 1,522 palettes, 339 docs) and 4,441 `EXPORT_STOPS` cells,
  at most 9.11 CAM16 C (Tbilisi `secondary` 100), in pale low-chroma yellows and greens where the solved
  hue sits off `seedHue`. Every curated doc and the default kit persist `toneMode: "perceptual"`, so no
  shipped render moves; a user's even-mode session does. On the anchored OKLCH path each stop reads its own
  solved hue, so the floor can rise outward of 450/550 and no-dip there is the measurement of
  `npm run gate:even-dips` (the corpus lines and the `hueShift` grid lines (a) and (b1) at 0, grid line (b2)
  bounded at the merge-base's pinned count of 7), not a structural property. The measured trade is declared,
  not closed (R87, option A, `.sdlc/questions/floorref-hue-U2-p2.md`): on 5,000 random anchored palettes the
  kept per-stop solve removes 16 merge-base dip cells and opens 4 (2 palettes, oklch, `hueShift` 39 and 49). `evenChroma`'s body and signature are
  unchanged. Gated by `test/engine/even-dips-gate.mjs` (the grid block and its controls) and
  `test/engine/chroma-envelope-gate.mjs` (the even row falls, 502 to 499 cells above 100% of stop 500 under #766 alone; with the damper merged under it the committed fixture holds 500).
- **Amendment (2026-10-03, #785, #766).** With the group-value damper (R94, R98) merged under #766's floor
  reference, `palette.chroma` reaches `evenChroma` only at 100; every other value renders at 100 and is
  scaled by `g/100` after the floor, which shrinks each dip's depth by that ratio. The `even-dips` grid
  therefore gains the chroma-100 cell: line (a) runs chroma 30/45/60/100 (2,304 palettes; 100 is the only
  undamped render and bounds every `g`, since a dip at `g` needs a chroma-100 depth of at least `300/g`),
  and line (b2) renders its random anchored palettes at chroma 100, the chroma draw still consumed in its
  slot. Its pin is the same block's count on the merge-base `8428280e` read the same way, 8 dip cells in
  5 palettes (the #766 amendment's "pinned count of 7" above was that block with the drawn chroma, and
  stays as history). No engine change: the damper is as ruled, and the gate measures the law that ships.

## ADR-027: A seat cites only what it measured, at the ref it is writing about
- **Context.** Over one review round of #681 U5, four defects arose from three seats through one
  mechanism: a figure or a judgement carried forward from a summary of a measurement rather than from
  the measurement. A reviewer blessed an `adapter.md` edit for conforming to a convention it had not
  read; a lane lead built a scope addendum from a recon's summary and dropped the recon's own caveat
  that it had measured the plan tip and not the unit branch, producing an instruction that would have
  regressed an owner ruling and broken a gate; a ledger's "every re-pin below is listed individually"
  and a handoff's "the merge is uncommitted" were both true of an earlier state and carried forward
  unchecked. A fifth instance followed at a line that is a preserved historical record, read twice at
  the wrong ref. A sharper second form appeared in the same plan: a constraint discovered while doing
  something else was recorded and obeyed and nobody asked why it existed. A reviewer correctly warned
  a builder not to cut a `56 to 60 s` prefix because the gate would exit 1; that warning and #718 (a
  time check that passes only while the superseded figure stays first in its cell) are one sentence
  read from two ends. One control caught every instance:
  re-run the thing against the tree it describes. For the second form: ask why a constraint exists
  before obeying it.
- **Decision.** Four rules, binding on every seat that writes a record under `.sdlc/` or a review,
  verdict, brief or handoff anywhere in the repo. (1) A seat that cites a figure or a state is the
  seat that measured it, at the ref the record names, by a command the record shows; a record that
  cannot show the command cites the sha it read instead of asserting. (2) A summary of a measurement
  is a lead, never evidence: a handoff's `Ran` row, a recon's bullet, a review's blessing, a checklist
  tick or a board cell is where a seat starts, and the seat reruns before it relies. (3) A constraint
  inherited from another seat is interrogated before it is obeyed: the record that obeys it states
  why the constraint exists, or files the question and says the constraint is unexplained.
  (4) An acceptance criterion rewritten after its verdict must be re-graded by a verifier before the unit closes:
  a rewrite is a new claim, and the seat being graded cannot be the one whose edit closes the
  unit (source: #709 revision 38, the debt the records-followup verifier recorded and revision 39
  carried forward unclosed, `.sdlc/plans/archive/records-followup.md` at a4675242).
- **Rationale.** The six defects share no file and no seat; they share a shortcut, and every seat in
  the hierarchy took it, including the seat issuing the standards. `.sdlc/adapter.md` §1 already
  rules the special case ("a handoff's `Ran` row is evidence for the reviewer, never for the
  verdict"); this ADR generalises it to every record kind, because the pattern did not stay inside
  verdicts. Re-running is cheap next to a rolled-back owner ruling, and a constraint whose reason is
  unknown is as likely to be a defect (#718) as a rule. Rule (4) closes the gap the same plan found on
  itself: revision 37 of records-followup moved a unit's acceptance twelve minutes after the grade,
  written by the seat being graded, and only the verifier's objection stood between that and a false
  close; a gate cannot rest on an objection.
- **Consequences.** A verdict or review row carries the command and its printed output at the sha
  the record names, which the verbatim-quote rule (adapter §3, 2026-09-19) already shapes. A brief,
  scope addendum or recon that summarises another seat's finding keeps that seat's caveats with it or
  cites the finding by path and sha. A record that rests on an inherited constraint names its source,
  and a constraint without a reason becomes a question, not a rule. This ADR proposes no new gate:
  what a check can enforce is #723's work (`verdict:` front matter as the machine-readable state).
  #718 and #719 stand as the two recorded instances.
- **Status.** PROPOSED 2026-09-22 (#721; drafted by plan `records-policy` U2 after #681 landed
  ADR-026). Ratification is the owner's: the owner edits this line to DECIDED, or amends the text
  under the file's amendment shape; no plan seat does either.

## ADR-028: docs/ follows the nine schema homes; runtime-read data stays in docs/reference/
- **Context.** `docs/` grew one folder per topic (low-level designs, marketing, plans, PRDs, site specs,
  specs, tickets, images, a catch-all `reference/`), and the sdlc-lite docs-schema check reported 32
  errors against that tree. Two kinds of file in `docs/reference/` are not documents: the role-table
  answer key and the other files under `docs/reference/data`, and the curated palettes under
  `docs/reference/colors/categories`. Code, the generators and the shipped Describe MCP zip read them at
  that exact path. Finished records under `.sdlc/` and the root changelog name the old paths, and those
  records are not rewritten. The plan-closing rule in `.sdlc/adapter.md` section 5 kept two plan homes.
- **Decision.** (1) Every document under `docs/` lives in one of the nine schema homes `docs/layout.md`
  lists: specs, planning, decisions, references, guides, reports, assets, archive, other. (2)
  `docs/reference/data` and `docs/reference/colors/categories` stay where they are, as the `reference/`
  home that `docs/layout.md` lists with kind assets; nothing else lives in `docs/reference/`. (3)
  Finished records keep the old paths and resolve through `docs/assets/docs-reconcile-path-map.tsv`
  (one old-to-new row per moved file) and `docs/reports/2026-10-06-docs-reconcile.md`; a check that
  reads a frozen record translates an old path through the map. (4) `.sdlc/plans/archive/` is the only
  live plan archive; the closed plans that predate 2026-10-06 are read-only history in
  `docs/archive/plans/`.
- **Rationale.** One home per kind of document is what the schema check enforces and what a reader can
  find without a map. Moving the data files to `docs/assets/` was rejected: every reader (the app, the
  category and export generators, the Describe MCP core and its rubric, the consumer plugin's
  role-parity script) and every shipped zip would change in lockstep for no gain, since the files are
  data rather than documents. Rewriting finished records was rejected because they are evidence of what
  a seat read at the time; the path map keeps them resolvable instead. One plan archive removes the
  question of which home a closing plan goes to.
- **Consequences.** A new document picks its home from `docs/AGENTS.md`; a new data file a reader
  needs at a fixed path goes under `docs/reference/` only if code reads it there, else `docs/assets/`.
  The old folders are gone; a path under them in a live file is a defect, in a finished record it is
  history read through the map. The Orchestrator archives a closed plan to `.sdlc/plans/archive/`
  only. Splitting this file into `docs/decisions/NNNN-*.md` is a follow-up, not part of this decision.
- **Status.** PROPOSED 2026-10-06 (plan `docs-reconcile`, user decisions of 2026-10-06). Ratification
  is the owner's: the owner edits this line to DECIDED, or amends the text under the file's amendment
  shape.

## ADR-029: The chroma envelope's closed form is the spec
- **Context.** #778. The chroma envelope (`chromaEnvelope` in `src/engine/tonal.js`) is a closed-form
  curve of four sliders, yet its gate pinned rounded 8-bit readings in
  `test/engine/fixtures/chroma-envelope.json`, so any change to a pixel path reddened a ratchet that
  said nothing about whether the curve itself had moved. #725 (R69) retuned the perceptual and peak
  mode map and amended ADR-026; the editor's preset chips were a separate, unnamed list of slider
  settings.
- **Decision.** (1) The closed form is the spec. Per stop, `sd` is the lifted distance from the anchor
  over 450, capped at 1. The mode map: on perceptual and peak, damp's headroom `r = (100 - damp)/100`
  becomes `r^OKHSL_DAMP_RESIDUE_EXP` with `OKHSL_DAMP_RESIDUE_EXP = ln(1 - d)/ln(0.3)` and `d =
  OKHSL_DAMP_D` 0.9275 (so the corpus's r 0.3 maps to 1 - d), and dampCurve is scaled by
  `OKHSL_DAMP_CURVE_GAIN = log2(3)/1.5`; on even, damp's headroom and dampCurve are both scaled by
  `EVEN_DAMP_FACTOR` 0.25, and `uG` takes the smoothstep plateau of `|sd| / EVEN_NEIGHBOURHOOD_R`
  (0.2). The curve is `max(0, 1 + shoulder - (damp/100) * sideW * uG)` with `uG = |sd|^dampCurve`.
  (2) `ENVELOPE_PRESETS` names the curves (Default, Curated, Calm ends, Vivid mids, Shade-heavy,
  Tint-heavy, Flat), each a damp / dampCurve / dampAmp / dampBias setting; `envelopePresetOf` names
  the preset a control set matches, else null. Presets are slider data: the four knobs stay exposed.
  Curated is the corpus setting (damp 70, dampCurve 1.5): perceptual env(300) 0.744 and env(100) 0.230
  against the 0.75 and 0.25 bars. Default is the kit's `DEFAULT_CONTROLS` (damp 80). (3) Gate A, the
  curve leg of `test/engine/chroma-envelope-gate.mjs`: every stop record's `env` equals the gate's own
  written-out SPEC to 1e-12, and the record's `model` composes from `env` as the record fields state
  (on perceptual and peak `model / model(500)` is `env` where both models sit under the s clamp at 1
  and the stop is not capped; on even `model` is
  `min(maxc, max(min(basis * env, maxc), floor), anchorCap)` at stops not refined, not damped by the
  group and not the anchored stop 500). (4) Gate B, the residue leg: every
  emitted pixel reads back within TOL of its stop's `model`, over a cube of +/- K codes per channel.
  K is `TOL_CODES` 1 for a plain stop, 2 for a damped stop and for a capped one (capped is one-sided,
  since the refinement only lowers chroma), and 4 = 1 + `enforceMonotonePixelL`'s RADIUS 3 for a
  refined stop. Two rules are named: the gamut edge (a pixel with a channel at 0 or 255 whose OKHSL s
  reads at least `EDGE_S` 0.999 widens its range to 1) and the white point (an achromatic pixel reads
  CAM16 C 0 on even; under the engine's viewing conditions #FFFFFF reads C 2.869). The evidence is
  `node scripts/report-preset-fidelity.mjs --envelope-residue`: 0 stops outside TOL.
- **How an anchored ramp deviates.** The curve is unchanged; the basis it multiplies is not the
  kit's. On perceptual and peak the basis is the anchor's own OKHSL s, held constant at every stop. On
  even it is `anchorChromaBasis`'s smoothstep blend from the anchor's chroma toward the hue's peak. An
  anchor outside [RAMP_L_MIN, RAMP_L_MAX] renders a clamped pivot. The curve still passes through the
  anchor: env(500) = 1, and stop 500 emits the anchor verbatim when the pivot is unclamped.
- **Rationale.** A curve stated once and asserted exactly cannot drift silently, and a planted
  constant reds it (the gate never reads the engine's constants). A tolerance derived from the pixel
  path's own rounding steps tells a rendering defect from a rounding step, which a pinned pixel table
  cannot. Named presets keep the chips and the gate on one list without hiding the sliders.
- **Consequences.** `test/engine/fixtures/chroma-envelope.json` is retired, and its owner clause moves
  here: a change that moves the curve updates the gate's SPEC and this ADR in the same change.
  `NAMED_EXCEPTIONS` and `OVER_90_AT_300` stay report-only in `scripts/lib/envelope-measure.mjs`.
- **Status.** PROPOSED 2026-10-07 (#778; builds on #725 and ADR-026). Ratification is the owner's:
  the owner edits this line to DECIDED, or amends the text under the file's amendment shape.

## ADR-030: Chroma controls are per-palette Base chroma times two global k factors; the anchor follows Prime chroma
- **Context.** T-0014 (#804). The user's screenshot of the Brand > Primary card showed the anchored
  prime middle (rung 3 of the seven-swatch strip) staying saturated while the outer six muted:
  ADR-026 emitted it verbatim, unconditionally. Behind that sat three chroma layers (a per-palette
  override, a per-group default, a global fallback) and a dead-global finding: `model.mjs` filled
  every group's `primeChroma`, so `primeChromaOf` never fell through and the Global tab's Base chroma
  and Prime chroma sliders moved nothing (a `projectView(defaultDocument())` with global
  `primeChroma: 0` rendered the same strip as at 100, while a group or palette at 0 moved six rungs).
  Material's group prime default of 60 muted every Neutral strip.
- **Decision.** Five user decisions of 2026-10-07. (1) A saved prime value below 100 is not kept:
  the one-time move is accepted and recorded, with no hidden legacy field. (2) Two layers, formed
  once in `src/engine/resolve.mjs`: each palette carries its own optional Base chroma
  (`palette.baseChroma`, 0 to 100, absent 100), the ramp damper ADR-026's 2026-10-03 amendment
  ruled for the group; the Global tab's Base chroma (`doc.baseIntensity`) and Prime chroma
  (`doc.primeChroma`) are k factors on every palette, both default 100.
  `rampChromaOf = palette.baseChroma x k_base / 100` and `primeChromaOf = k_prime`. The per-group
  sliders and the per-palette Prime chroma slider are removed; a palette's canvas group is grouping
  metadata only. The prime k also scales the gallery key tile (`deriveKeyColor`), so the tile equals
  the prime middle at every k and the `key-anchor` gate keeps two independent producers. (3) The
  per-palette Chroma slider on an anchored palette keeps its detach semantics (ADR-026 unchanged
  there). (4) The global vibrancy default is 50 (was 0); a pre-v8 document's vibrancy 0 becomes 50,
  any other value is kept. (5) T-0014 lands before T-0015 (hue space); T-0013 owns the envelope and
  damping constants in `tonal.js`. The anchor rule: at Prime chroma k 100 the anchored prime step is
  the stored hex verbatim; at any other k it is rendered at the anchor's own CAM16 hue and exact
  CIE L\*, its measured CAM16 chroma times k, gamut-capped, so the whole strip moves together. Ramp
  stop 500 equals the anchor at the palette's Base chroma 100 times the global k 100.
- **Rationale.** Two layers that multiply are order-free (`dampStops` is linear with an `r >= 1`
  no-op), so the product is formed once and no fallback can go dead again. Identity holds at the
  defaults: both k are 100 and a fresh palette's Base chroma is 100, so the anchor is byte-exact on
  both the strip and stop 500 unless the user moves a slider. Folding the group value onto each
  palette instead of keeping the group layer makes a saved kit render the same ramps.
- **Consequences.** Schema v8 (`src/ui/persist.js`): the `foldGroups` entry writes each palette's
  resolved group base chroma onto its own `baseChroma`, drops `paletteGroups` and every per-palette
  `primeChroma`, resets both globals to 100 (before v8 they never reached a palette), reporting each
  through `DROPPED_KEYS`; `vibrancyDefault` moves a pre-v8 vibrancy 0 to 50. `EXPORT_SCHEMA_VERSION`
  is 6 (`ultimate-tokens-brand-kit/6`, brand-kit MCP server 0.6.0). The before and after report,
  `docs/reports/2026-10-07-chroma-controls-redesign.md` (`report-preset-fidelity.mjs
  --identity-control --migrate --authored --base 1da44336`), measures over 3,796 palettes and 94,900
  cells per mode: ramp peak 0 and even 0 cells; perceptual 82,466 cells (vibrancy, every palette
  without its own `cuspPull`); key tiles 0 of 3,796; prime strips 344 of 3,796 (the 342 curated
  Neutrals and the default kit's Neutral outer six from the retired Material 60, and Adia Primary
  from 99). The vibrancy move re-pinned, with old and new values in the report: 7 role-contrast
  dark floors in `test/engine/semantic.mjs` (lowest 4.6229, above AA 4.5), 3 panda EX-2 literals,
  the C6 (ii) duplicate list 30 to 32 keys, the `hue-solver-best` and `group-chroma-damper` pins,
  the `intensity-legacy` fixture (335 of 400 perceptual cells), and the shadcn (44 / 38 / 38 lines)
  and radix (793 / 440 / 478 leaves) baselines, and the `mode-isolation` perceptual fingerprint
  (`86f6e551dc20e6d7` to `22a43e80320a8c95`, peak unchanged; at vibrancy 0 this tree reproduces the
  old value). No `tonal.js` constant moved, and the chroma-envelope
  gate holds at vibrancy 50. The user ruled the `oklch-native` bar in `test/ui/shell.mjs` from 30 to
  45 RGB: vibrancy 50 moves lightness toward each hue's cusp and widens the OKLCH versus CAM16
  starter gap (measured 44.6, worst Neutral); it keeps measuring at the shipped default.
- **Status.** PROPOSED 2026-10-07 (T-0014, #804; supersedes ADR-026's unconditional verbatim
  clause and its 2026-10-03 group damper wording, which now reads as the per-palette Base chroma
  times the global k). Ratification is the owner's: the owner edits this line to DECIDED, or amends
  the text under the file's amendment shape.

## ADR-031: The hue space is hue constancy through the anchor
- **Context.** T-0015 (#805). The global Hue space toggle (`doc.hueSpace`, OKLCH or CAM16) moved
  only non-anchored palettes and anchored even ramps. Every other anchored surface carried one branch:
  the perceptual and peak ramps held the anchor's OKLCH hue in both spaces (the Q-D ruling, made
  structural by ADR-026's #725 amendment), while the prime ladder and the key tile below Prime chroma
  k 100 held the anchor's CAM16 hue in both spaces. On a kit where only one palette is unanchored the
  toggle seemed to change only that palette, and the editor disabled it when every palette was
  anchored.
- **Decision.** The hue space names the space in which the anchor's own measured hue is held constant
  across a surface: `oklch` holds the anchor's OKLCH hue, `cam16` holds its CAM16 hue. The anchor is
  still the record (ADR-026); the hue space picks the line of constant hue through it, so the anchor
  pixel itself (ramp stop 500, ladder rung 3 and the key tile at Prime chroma k 100) is verbatim in
  both spaces. Per surface: the prime ladder and the key tile at k != 100 solve under `oklch` (each
  rung's CAM16 hue is the one whose gamut-capped render at the rung's L\* reads back at the anchor's
  OKLCH hue, `solveCam16Hue`'s `chromaAt` form, now exported from `src/engine/tonal.js`), and
  `deriveKeyColor` repeats the arithmetic with its own call so `key-anchor` and `anchor-k` keep two
  producers; the anchored perceptual and peak ramps solve under `cam16` (each stop's OKHSL hue is the
  one whose float render, jointly with the tone hold, carries the anchor's CAM16 hue,
  `solveOkhslHueForCam16`, keeping the anchor's OKLCH hue where no bracketed root exists or the
  candidate is achromatic); the even ramp is unchanged (it already held both). The cap ruling: the
  peak cap keeps the stop's own pre-cap OKLCH hue in both spaces (`capChromaAtHeldTone(..., null,
  true)`), because passing the anchor's CAM16 hue measured 0.0202 OKLab dE between spaces at the
  cap-moved stops on the plan-time prototype, over the bound below, against 0.0166 with `null`.
  User decisions of 2026-10-07: (1) the toggle moves every surface where the two hue models differ:
  even ramps, every anchored prime ladder above JND, the key tile below k 100, and the anchored
  perceptual and peak ramps within rounding (at most 0.02 OKLab dE), as the control's label title
  says, with no hue kink at stop 500; (2) saved kits at the default space (oklch, k 100) move every
  anchored ladder's outer rungs, ramps and key tiles do not, and exported `prime.*` tokens move with
  the ladder, recorded in the before and after report; (3) legacy documents stamped `cam16` by the old
  hydrate now render CAM16-constant anchored ramps and ladders, no migration; (4) `dampStops` keeps
  holding the OKLCH hue after damping on perceptual and peak.
- **Rationale.** The anchor is a pixel, not a slider value, so there is no number to reinterpret
  across spaces; what a hue space can choose is the line of hue constancy through that pixel. The
  even ramp already worked that way, so it is the model and no new hue model is added. Re-seeding the
  perceptual ramp from the anchor's CAM16 hue at the cusp would move it visibly but put a hue kink at
  stop 500, the discontinuity Q3 (b) and C5 exist to prevent. The OKLCH and CAM16 lines through one
  anchor differ by little on the OKHSL ramps, so that half is within rounding by physics, not by
  choice.
- **Consequences.** The before and after report, `docs/reports/2026-10-07-hue-space-anchored.md`
  (`report-preset-fidelity.mjs --identity-control --migrate --authored --base 10352b1a`), measures
  over 3,796 palettes: ramp perceptual, peak and even 0 of 94,900 cells each, key tiles 0 of 3,796,
  prime strips 3,147 of 3,796 (3,131 of 3,380 corpus anchored ladders plus the 16 default-kit ones);
  the default kit's outer-rung OKLCH hue drift from the anchor falls from 0.41 to 7.97 degrees
  (Primary 5.50, Data 1 7.97) to 0.12 to 0.65; the `prime-huespace` gate reads a default-kit max of
  0.0307 OKLab dE between spaces. Under `cam16` the anchored ramps move at most 0.0164 (perceptual)
  and 0.0169 (peak) OKLab dE, and the even ramp 0.0281. The gates are reshaped in
  `test/engine/anchor.mjs`: a new `prime-huespace` gate with its control, the `anchor-f4` hue-space
  case split per mode with a per-mode bound of 0.02 on perceptual and peak (`HUE_SPACE_MODE_BOUND`)
  and its bound control, replacing the Q-D invisibility block and its constants, and `anchor-identity`,
  `key-anchor` and `anchor-k` asserted in both spaces. Re-pinned: the panda EX-1 `prime.brightest` and
  `prime.dimmest` literals, `ladder-span`'s `SPAN_PX_EXPECTED` 364 to 365, and the shadcn and radix
  baselines (they render at `cam16`); the report lists old and new. The editor's Hue space control is
  live on every document, and `HUE_SPACE_ANCHOR_REASON` and its two notes are gone. No schema bump:
  no field is added, renamed or translated and nothing derived is stored, so
  `CURRENT_SCHEMA_VERSION` stays 8 and T-0017 takes v9.
- **Status.** PROPOSED 2026-10-07 (T-0015, #805; supersedes the Q-D ruling, recorded in ADR-026's
  #725 amendment as "`hueSpace` is exactly identical on anchored perceptual and peak"). Ratification
  is the owner's: the owner edits this line to DECIDED, or amends the text under the file's amendment
  shape.

## Quick map: decisions an enhancing agent is most likely to "fix" (don't)
| ADR | Looks wrong because… | But it's intentional because… |
|-----|----------------------|-------------------------------|
| ADR-003 | on-colors fail WCAG on Warning | the historical brand override; AMENDED by ADR-025, contrast-aware on-colors are the default since #662 |
| ADR-025 | on-colors jump to pure white/black on some accents | the ramp ends miss AA there and #662 forbids moving a stop; the achromatic constants are the only way to the floor |
| ADR-026 | a curated palette stores a source hex that looks redundant beside its own `{hue, chroma, skew, lift}` | the four fitted numbers cannot reproduce an arbitrary sRGB colour through a cusp-derived key colour; the stored hex is the sample itself, and deleting it silently replaces every preset's own colour with a reconstruction of it; amended 2026-09-28 (#701, even-mode floor and shoulder), 2026-09-29 (#725, R69: the anchored basis capped at the anchor, the retuned damping pair and the per-stop tone hold), 2026-10-03 (#785, R94: the group value is one damper on the whole ramp, `r * at-100`, stop 500 included), 2026-10-03 (#766, R85: the even floor's gamut reference read per stop at its own hue before edge rotation, which edge rotation does not move) and 2026-10-03 (#785, #766: the `even-dips` grid renders the chroma-100 cell, the only chroma that reaches the floor, and its random line is pinned at 8); superseded in part 2026-10-07 by ADR-030 (#804: the group damper is now each palette's own Base chroma times the global k, and the prime middle is verbatim only at Prime chroma k 100); amended 2026-10-07 by ADR-031 (#805: the hue space picks the line of hue constancy through the anchor, so `cam16` moves anchored perceptual and peak ramps, the #725 "identical" clause is superseded) |
| ADR-004 | scrims unified onto one 500 ramp (SUPERSEDED) | scrims now a single 500 ramp; the former base-750-only decision is superseded |
| ADR-002 | semantic could alias raw to cascade | native import errors on name-only aliasData; plugin does cascade |
| ADR-011 | `role-table.json` still encodes cam16 hues though hueSpace is now OKLCH | role-table is the cam16 answer key for the parity gate; the OKLCH flip is at the doc/seed layer, not the role table |
| ADR-019 | `exportUI3` and the standalone binder still hardcode Light/Dark | deliberately out of TKT-0021's scope, a documented follow-up, not an oversight |
| ADR-007 | a real-looking Figma schema isn't imported | the schema is unverified/non-native |
| ADR-014 | a pre-rename `.fig` loses its embedded config, and no migration was written | `setPluginData` is namespaced per plugin id, the old keys are unreadable from the new id; a migration cannot exist |
| ADR-015 | the product has no maker, no logo, and support points at an issue tracker | deliberate: the maker brand was retired; `test/repo/branding.mjs` fails the build if it returns |
| ADR-018 | `role-table.json` isn't generated from `semantic.js` like the Figma binder's role table now is (TKT-0019) | it's a deliberate independent answer key; generating it would make the `refs-canonical` gate tautological |
| ADR-020 | `scripts/bundle.mjs` still hand-rolls import transforms though `vite` is already a devDependency | measured: vite's single-file output is ~20% LARGER (rolldown runtime prelude + a data-heavy artifact minification barely shrinks) and can't be byte-comparable, the spike's own acceptance bar ruled it out |
| ADR-021 | the hosted MCP runs generation server-side though "the generator stays client-side" is a load-bearing constraint | deliberate, narrow amendment for describe-palette only (#379's Pro anchor); every other surface (app SPA, Figma plugin, hosted kit-sync) keeps the original rule verbatim |
| ADR-022 | `scripts/migrate-type-registers.mjs` looks like dead one-off code to delete | kept deliberately as the executable record of the slots→registers rename, the squash-merge would erase an add-then-delete from history |
| ADR-027 | rerunning a measurement another seat already recorded looks like waste | the recorded figure is a lead, not evidence; six defects in one plan came from trusting one (#721) |
| ADR-028 | `docs/reference/data` and `docs/reference/colors/categories` sit outside `docs/assets/` and look misfiled | code, generators and the shipped Describe MCP zip read them at that exact path; do not move `docs/reference/data` or `docs/reference/colors/categories` |
| ADR-029 | the envelope gate asserts a curve to 1e-12 but lets pixels miss it by up to 4 codes, and no fixture pins the emitted values | the closed form is the spec and the pixel tolerance is the path's own rounding steps; re-pinning rounded pixels brings back the ratchet #778 retired, and a curve change updates the gate's SPEC and ADR-029 together |
| ADR-030 | the canvas groups carry no chroma, and an anchored palette's prime middle leaves its stored hex below Prime chroma 100 | chroma is per-palette Base chroma times two global k factors, formed once in `resolve.mjs`; a group layer made the globals dead, and the anchor is verbatim exactly at the default k 100 |
| ADR-031 | the Hue space toggle moves an anchored palette's prime ladder but its perceptual and peak ramps by at most 0.02 OKLab dE, and the anchored ladder solves a hue per rung | the hue space is hue constancy through the anchor: the anchor stays verbatim and the toggle picks which hue (OKLCH or CAM16) is held along the line through it; the two lines differ by little on the OKHSL ramps, and a ramp re-seeded to move more would kink at stop 500 |
