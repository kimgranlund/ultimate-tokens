---
doc-type: spec
id: spec-muted-base-key-spikes
status: approved        # draft | approved | superseded
version: 0.1.0
date: 2026-09-11
owner: Kim Granlund
prd: none               # GitHub issue #503 is the intent record (ADR-017 git-native tickets)
scope: feature
audience: builder, reviewer, planner
---
# SPEC — Muted base ramps with chroma spikes at the identity stops, plus 8 brand-derived data palettes

Intent record: GitHub issue #503 (`kind:feature`, `size:big`, `lane:color-engine`).
Companion design: `docs/lld/lld-muted-base-key-spikes.md`.

Ruled before this SPEC (not reopened here): the 53-role table and `docs/reference/data/role-table.json`
role list stay frozen (no muted-suffixed roles, no reduced role set); data palettes are full ordinary
palettes; data hues derive from the brand primary hue by default and are user-editable; one global
base intensity with a per-palette override on the `cuspPull ?? vibrancy` precedent
(`src/engine/tonal.js:314`); one global key intensity applied at `{n}`, `{n}High`, `{n}Low`,
`{n}Dim`, `{n}Bright`.

## Vocabulary

- **Intensity** is a fraction of the palette's own `chroma` control. `chroma` keeps its meaning (the
  brand's full chroma, % of the hue's peak); intensity scales what the ramp actually emits.
- **Identity stops** are the solid ramp stops the five identity roles resolve to, in either mode.
  From the frozen role table: `{n}` 550/450, `{n}Dim` 650/700, `{n}Bright` 350/400, `{n}Low` 350/700,
  `{n}High` 650/400, so under `accentRef: "mode"` the set is `{350, 400, 450, 550, 650, 700}`. Under
  `accentRef: "single"` the prime role resolves to 500/500, so the set is `{350, 400, 500, 650, 700}`
  and 450/550 are ordinary stops (REPLACE, not union; ruled 2026-09-11). The set is computed from the
  already-resolved roles, never hard-coded and never merged with the mode set.
- **Brand families** are the eight existing palettes (neutral, primary, secondary, tertiary, info,
  success, warning, danger). **Data families** are `data-1` … `data-8`.

## Requirements

### R-A. Intensity controls (ramp shaping)

- **REQ-001** `DEFAULT_CONTROLS` gains `baseIntensity` (number, 0..100) and `keyIntensity` (number,
  0..100). A palette may carry an optional `intensity` (0..100) that overrides `baseIntensity` for that
  palette only, resolved exactly as `palette.intensity ?? controls.baseIntensity`.
- **REQ-002** The per-stop intensity factor is `I(stop) = b + (1 - b) * k` at an identity stop and
  `I(stop) = b` elsewhere, where `b` is the resolved base fraction and `k = keyIntensity / 100`. The
  factor multiplies the palette's chroma fraction before damping on BOTH ramp paths (OKHSL saturation
  on `perceptual`/`peak`; the intended chroma on `even`), so gamut safety stays with the existing
  clamps. This is the flat-multiplier answer to Open gap 1 (rationale in Decisions).
- **REQ-003** Legacy invariance: with `baseIntensity = 100` (any `keyIntensity`, any `intensity`
  override of 100 or absent) every emitted stop is byte-identical to the pre-feature engine for every
  palette, control set, and both ramp paths. `I(stop) = 1` everywhere is the proof obligation.
- **REQ-004** The spike is discrete. Stops that are not identity stops receive exactly `b`, including
  the active-state stops 750/250. Under `accentRef "mode"` that includes 500 (containers, outlines,
  scrims all resolve on the 500 ramp); under `accentRef "single"` 500 is the prime stop and is spiked
  while 450/550 receive `b`. Hover (650/350) inherits the spike because those ARE identity stops in
  both accent modes; no separate hover rule exists.
- **REQ-005** The OKLCH hue anchor (`solveOkhslHue` / `solveCam16Hue` at stop 500) uses the stop-500
  chroma AFTER intensity, so the `oklch-hue-anchor` guarantee (key stop lands on the set OKLCH hue)
  holds at every intensity.
- **REQ-006** Every existing tonal gate (`ingamut`, `monotonic`, `white-endpoint`, `curve-fidelity`,
  `hue-stability`, `damping-curve`, `edge-hue`, `okhsl-modes`, `vibrancy`, `cusp-pull`) stays green
  with its control pin extended by `baseIntensity: 100`. Intensity never perturbs tone.
- **REQ-007** Product default: `DEFAULT_CONTROLS.baseIntensity = 100`, `keyIntensity = 100`, so a
  fresh document renders exactly as today (ratified 2026-09-11, H1). A muted default of 45 is a
  proposed follow-up, not part of this contract.

### R-B. Persistence and migration

- **REQ-010** `persist.js` `DOMAINS` gains `baseIntensity` (0..100, default 100) and `keyIntensity`
  (0..100, default 100); the palette domain gains optional `intensity` (0..100, absent means inherit,
  clamped only when finite, the `cuspPull` rule). Roundtrip identity and per-field clamp hold.
- **REQ-011** `CURRENT_SCHEMA_VERSION` becomes 2. A snapshot with `schemaVersion < 2` and no
  `baseIntensity` field hydrates with `baseIntensity = 100` (look preserved); a snapshot at version 2
  or later with the field absent hydrates to the domain default, also 100 today. The stamp exists so
  a later default flip cannot change a saved kit's look. Answer to Open gap 5.
- **REQ-012** Hydrating a pre-v2 snapshot never injects data palettes. Data palettes reach an
  existing document only through the explicit action in REQ-032.

### R-C. Data palettes

- **REQ-020** `deriveDataHues(primaryHue, brandHues, count = 8)` (pure, new module `src/engine/data-hues.mjs`; `derive.mjs` stays scoped to the New Palette modal)
  returns `count` OKLCH hues `primaryHue + phi + i * (360 / count)`, `i = 0 .. count-1`, where `phi` is
  the integer degree in `[0, 360 / count)` that maximises the minimum circular distance between the
  data hues and every brand hue; ties resolve to the smallest `phi`. Answer to Open gap 3.
- **REQ-021** `brandHues` is the hue of every non-data palette whose `chroma >= 20`. Neutral is
  excluded by that threshold when it is near-achromatic and included when it is a tinted neutral, so
  the rule needs no name matching.
- **REQ-022** A minted data palette is an ordinary palette object: `name: "Data N"`, `hue` from
  REQ-020, `chroma` equal to the primary's `chroma` (ratified 2026-09-11, H4), `skew 0`, `lift 0`, `hueShift 0`,
  `hueSameDir false`, `on true`, no `intensity` override. It carries all 53 roles like any palette.
- **REQ-023** Data hues are derived once, at mint time, and stored as plain numbers. Editing the
  primary afterwards does not move them; a "Re-derive data hues" action (REQ-032) recomputes them.
- **REQ-024** `defaultDocument()` returns 16 palettes: the eight brand families in their current order
  followed by `Data 1` … `Data 8`, enabled. `role-table.json`'s `defaults` array lists the same 16
  (the `shell.mjs` defaults gate and the binder `NAMES` read it). Answer to Open gap 6; ratified
  2026-09-11 (H2).

### R-D. Exports and Figma

- **REQ-030** Every emitter that maps over enabled palettes (CSS, OKLCH, JSON, DTCG, UI3, Tailwind,
  brand-kit, Figma bundle, design-system semantic layer) emits data palettes with no code change to
  the per-palette loop. Token count per enabled palette stays 25 + 11 + 53 = 89.
- **REQ-031** `exportShadcn`: `chart-1..5` bind to the prime role of `data-1..5` when those palettes
  are enabled, else the current fallback chain; data palettes are excluded from the neutral, primary,
  and "first palette" fallbacks. `ds-export`: data palettes form a `data` tier (excluded from the
  brand `others` list) and DESIGN.md gains a short "Data series" section listing them.
- **REQ-032** UI: a Color-section action "Add data palettes (8)" appends the derived set to a
  document that has none; "Re-derive data hues" recomputes hues for existing `Data N` palettes; the
  Global tab (right pane) surfaces the two U1 controls as two separate chroma sliders placed
  together next to Vibrancy, labelled "Base chroma" (`baseIntensity`, shapes the ramp) and "Prime
  chroma" (`keyIntensity`, shapes the identity swatches); the palette inspector gains one "Intensity"
  per-palette slider next to Cusp pull (ratified 2026-09-11). Defaults stay 100 (H1).
- **REQ-034** Key swatch strip: each enabled palette row in the Color canvas renders five identity
  swatches FIRST, left of the stop ramp, in this order with these display labels: `brighter`,
  `bright`, `prime`, `dim`, `dimmer`. They map to the existing roles `{n}High`, `{n}Bright`, `{n}`,
  `{n}Dim`, `{n}Low`; the labels are display text only, token and role names and the 53-role table
  stay frozen (ratified 2026-09-11). Each swatch shows the RESOLVED role color for the active scheme
  (so the prime-chroma spike is visible there), while the ramp beside it shows the base stops. Under
  `accentRef "single"` the prime swatch is stop 500. The strip follows the row's scheme toggle and
  the `stopsMode` (19 or 25) does not change it.
- **REQ-033** Figma: the binder's binding plan grows to 53 x 16 = 848 semantic targets and the
  primitives collection to 16 x 36 = 576 variables at the default document, both under Figma's
  5,000-variables-per-collection ceiling; the mode count (2) is unchanged. Answer to Open gap 4.

### R-E. Records and parity

- **REQ-040** `knowledge-02-tonal-scale.md` documents intensity and the identity-stop set;
  `knowledge-03-semantic-system.md` documents the 16 default families and that data families carry
  the same 53 roles; `CLAUDE.md`, `README.md`, `mcp/README.md`, the consumer plugin's color-tokens
  skill, and the marketing fact sheet update their palette counts. The 53 role count is unchanged
  everywhere.
- **REQ-041** All count literals under `test/` that encode the default palette count move together
  (`test/ui/counts.mjs` `DEFAULT_PALETTES`, `test/ui/shell.mjs`, `test/mcp/brand-kit.mjs`,
  `test/mcp/brand-kit-merged-core.mjs`). Literals that derive from `role-table.json` or the role table
  (`test/figma/binder.mjs`, `test/figma/plugin.mjs`) need no edit.

## Non-goals

- No new semantic roles, no muted-suffixed roles, no reduced role set for data palettes. The
  `refs-canonical` gate and the binder mirror stay at 53.
- No change to Typography or Geometry.
- No neighbour falloff around the identity stops (a smooth envelope would re-spike 500).
- No live link from the primary hue to data hues after minting.
- No migration that adds palettes to a saved document; no change to curated category preset files
  under `docs/reference/colors/categories/`, and no change to preset OPEN behaviour: presets stay as
  authored (ratified 2026-09-11, H3).
- No change to the "From Figma" import (`configFromVariables`); it reads chroma as stored today.
- No new export format.
- No new roles or tokens for the key strip labels: brighter, bright, prime, dim, dimmer are UI display
  text over the five existing identity roles, never emitted names.

## Examples

- **EX-1 (NORMATIVE, legacy invariance).** Default Primary (`hue 267 OKLCH, chroma 95`), default
  controls with `baseIntensity 100`, `keyIntensity 0` or `100`: every stop of the 25-stop export ramp
  equals the pre-feature engine output byte for byte.
- **EX-2 (NORMATIVE, spike geometry).** Same palette, `baseIntensity 40`, `keyIntensity 100`,
  `accentRef "mode"`: stops 350, 400, 450, 550, 650, 700 emit at the chroma fraction `0.95 * m(stop)`;
  every other stop, 500 included, emits at `0.95 * 0.40 * m(stop)` (before the gamut clamp). Stop
  tones are identical to EX-1.
- **EX-3 (NORMATIVE, single accent).** As EX-2 with `accentRef "single"`: the spiked set is
  `{350, 400, 500, 650, 700}`; 450 and 550 emit at `0.95 * 0.40 * m(stop)` like 750/250.
- **EX-4 (NORMATIVE, override).** As EX-2 but Warning carries `intensity 100`: Warning's ramp equals
  its EX-1 ramp; Primary is unchanged from EX-2.
- **EX-5 (NORMATIVE, data hues).** Brand hues `{267, 165, 315, 235, 145, 70, 27}` (all chroma >= 20;
  default Neutral chroma 29 also contributes 267), primary 267, count 8: `phi` is the integer in
  `[0, 45)` maximising the minimum circular distance to those hues; data hues are
  `267 + phi + 45i` mod 360. The built engine records the resulting `phi` and hues in
  `role-table.json` `defaults` (ILLUSTRATIVE until built; the maximisation rule is the contract).
- **EX-6 (NORMATIVE, migration).** Snapshot `{schemaVersion: 1, palettes: [...8], vibrancy: 0}`
  hydrates to `baseIntensity 100, keyIntensity 100`, 8 palettes. Snapshot
  `{schemaVersion: 2, palettes: [...]}` with no `baseIntensity` hydrates to the domain default (100).
- **EX-8 (NORMATIVE, key strip).** Default Primary, light scheme, `accentRef "mode"`: the strip reads
  brighter = stop 650 (`primaryHigh`), bright = 350 (`primaryBright`), prime = 550 (`primary`),
  dim = 650 (`primaryDim`), dimmer = 350 (`primaryLow`). Dark scheme: 400, 400, 450, 700, 700. With
  `accentRef "single"` the prime swatch is 500 in both schemes. Pairs share a stop per scheme by the
  frozen role table: light, brighter = dim (650) and bright = dimmer (350); dark, brighter = bright
  (400) and dim = dimmer (700). The strip shows all five anyway, since it is a role view, not a stop view.
- **EX-7 (NORMATIVE, shadcn).** Default document: `--chart-1 .. --chart-5` resolve to the prime role of
  `data-1 .. data-5`. Data palettes all disabled: the pre-feature chart mapping is emitted.

## Acceptance

- **AC-001** `DEFAULT_CONTROLS` has both keys; `paletteStops` honours `palette.intensity` over
  `controls.baseIntensity` (a palette at 100 inside a document at 40 reproduces its legacy ramp).
- **AC-002** For a probe palette below the gamut ceiling, measured stop chroma at each identity stop
  divided by chroma at the same stop with `baseIntensity 100` equals `b + (1 - b) k` within 2% of
  peak; at a non-identity stop it equals `b`. Checked on both ramp paths.
- **AC-003** A byte-diff gate: every default palette x 25 stops x both ramp paths at
  `baseIntensity 100` equals a committed fixture of the pre-feature output (generated in the same PR
  from the pre-change engine, `git stash` or a pinned commit).
- **AC-004** With `baseIntensity 40, keyIntensity 100`, stop 500's chroma ratio to its legacy value is
  `0.40` within tolerance, while 450 and 550 are at 1.0; stop 750 and 250 are at 0.40.
- **AC-005** The existing `oklch-hue-anchor` gate passes at `baseIntensity` in `{20, 45, 100}`.
- **AC-006** The full tonal verifier passes with its pin extended by `baseIntensity: 100`; a second run
  of the gamut and monotonic groups at `baseIntensity 45` also passes; tones are equal within 1e-9
  across intensities.
- **AC-007** `DEFAULT_CONTROLS.baseIntensity === 100 && keyIntensity === 100`, and `defaultDocument()`
  at those values reproduces the pre-feature ramps (the AC-003 fixture).
- **AC-010** `test/ui/persist.mjs` roundtrip and per-field clamp groups cover the two new controls and
  the optional palette `intensity` (absent stays absent; out-of-range clamps alone).
- **AC-011** EX-6 both halves, as hydrate assertions.
- **AC-012** Hydrating a v1 snapshot with 8 palettes yields exactly 8 palettes.
- **AC-020** `deriveDataHues` unit gate: (a) output length is `count`; (b) consecutive hues differ by
  `360 / count` mod 360; (c) the returned `phi` is the argmax of the min circular distance over all
  integer candidates (brute-force re-derived in the test); (d) an empty brand set returns `phi 0`;
  (e) no NaN for hues at the 359/0 wrap.
- **AC-021** A tinted neutral (chroma 29) is in `brandHues`; a neutral at chroma 10 is not.
- **AC-022** Each minted data palette hydrates unchanged and resolves 53 roles.
- **AC-023** Editing `primary.hue` on a document leaves `Data N` hues unchanged; the re-derive action
  changes them to the fresh `deriveDataHues` result.
- **AC-024** `defaultDocument().palettes.length === 16`; names 9..16 are `Data 1..Data 8`;
  `role-table.json` `defaults.length === 16` and the `shell.mjs` defaults gate passes.
- **AC-030** `hpg-export-leaf-valid` passes with `enabledCount` 16 (its bound is derived, so this is a
  run, not an edit); `tokenCount(defaultDocument()) === 16 * 89`.
- **AC-031** EX-7 both halves; `exportShadcn` neutral and primary picks are unchanged from today on
  the default document; the design-system semantic layer has `53 * 16` entries and DESIGN.md contains
  the data section.
- **AC-032** Headless-boot: the "Base chroma" and "Prime chroma" sliders exist on the Global tab,
  are adjacent, and write `doc.baseIntensity` / `doc.keyIntensity`; the per-palette "Intensity" slider
  writes `palettes[i].intensity`;
  "Add data palettes (8)" appends 8 on a document with none and is a no-op when 8 already exist;
  "Re-derive" rewrites hues only.
- **AC-034** Headless-boot: every enabled ramp row has a key strip before the ramp strip with exactly
  five swatches whose labels are, in order, brighter, bright, prime, dim, dimmer; each swatch's color
  equals the row palette's resolved role hex (`primaryHigh`, `primaryBright`, `primary`, `primaryDim`,
  `primaryLow`) for the active scheme; toggling the scheme swaps them; under `accentRef "single"` the
  prime swatch equals the 500 stop hex; toggling `stopsMode` leaves the strip at five. The 53-role
  table gate and `role-table.json` are unchanged by this unit.
- **AC-033** `test/figma/binder.mjs` `bindingPlan(NAMES).length === 53 * 16` via the existing derived
  assertion; `test/figma/plugin.mjs` cascade passes with `semExpect` derived from the bundle.
- **AC-040** `git grep -nE "\b8\b" -- docs/reference README.md CLAUDE.md mcp plugin docs/marketing |
  grep -i palette` returns only historical hits (CHANGELOG, tickets archive).
- **AC-041** `npm test` green at every build-unit boundary listed in the LLD.

## Agent verification

- AC-001..007: `node test/engine/tonal.mjs` (new groups `intensity-legacy`, `intensity-spike`,
  `intensity-override`, plus the existing groups under the extended pin). AC-003's fixture lands under
  `test/engine/fixtures/` and is regenerated only by an explicit script, never by `npm test`.
- AC-010..012: `node test/ui/persist.mjs`.
- AC-020..021: `node test/engine/data-hues.mjs` (new verifier, one PASS/FAIL line convention like `derive.mjs`).
- AC-022..024, AC-030, AC-032, AC-034: `node test/ui/shell.mjs` and the headless shim (`test/ui/headless-boot.mjs`,
  lettered group). Slider presence is asserted through the shim's DOM, not computed style (the shim
  has no layout).
- AC-031: `node test/engine/exports.mjs` `hpg-export-shadcn` and `hpg-export-design-system`.
- AC-033: `node test/figma/binder.mjs`, `node test/figma/plugin.mjs`.
- AC-040: the grep above, run in the docs build unit.
- No human exception remains: with the default at 100 every criterion is agent-runnable. The visual
  judgement of a muted default (45 proposed) belongs to the follow-up that flips it.

## Decisions on the issue's six Open gaps

| Gap | Decision | Rationale | Ratify? |
|---|---|---|---|
| 1. Spike curve | Flat multiplier on the chroma fraction, gamut handled by the existing paths | OKHSL saturation is already gamut-proportional and hue-aware; even mode already clamps to `maxc`. A second cusp-aware boost would duplicate `cuspPull` and add a gate surface with no new capability | No |
| 2. Hover/active | Only the identity stops; hover inherits by aliasing (650/350 are identity stops), active (750/250) does not | Roles alias primitives, so a spike lives on stops. Discrete stops keep 500 (containers, scrims, outlines) quiet under the default accent mode, which is the feature's point; under "single" the set is replaced, not extended | No |
| 3. Data hue rule | Even 45° spacing from primary plus an integer offset maximising min distance to chromatic brand hues (chroma >= 20) | Deterministic, pure, brute-force testable, no name matching; works for unevenly spread brands because the offset search only needs one free parameter | No |
| 4. Token ceiling | 848 role variables and 576 primitives per Figma file at 16 palettes, under the 5,000 per collection ceiling; modes unchanged | Counted from 53 and 25 + 11 per palette. CSS and JSON exports double in size, which is a file-size note, not a limit | No |
| 5. Migration | Pre-v2 snapshots stamp `baseIntensity 100` (look preserved); the shipped default is also 100 | Same principle as the `hueSpace` legacy stamp: a saved kit never changes appearance on upgrade | No |
| 6. Data palettes default | ON in a fresh document; absent from upgraded documents until the user adds them | The pivot names data palettes part of the system; a fresh kit should show it. Existing kits are the user's, so opt-in | Ratified 2026-09-11 |

## Ratification record (2026-09-11, team-lead relaying the owner)

- **H1** `baseIntensity` default stays 100 this cycle: no visual change. The 45 proposal is a
  follow-up issue, filed when the engine has shipped.
- **H2** Data palettes ON in a fresh `defaultDocument` (16 palettes); upgraded documents opt in
  through the add action.
- **H3** No: opening a curated preset does not append data palettes. Build unit U10 is dropped.
- **H4** Data palette chroma follows the primary's chroma.
