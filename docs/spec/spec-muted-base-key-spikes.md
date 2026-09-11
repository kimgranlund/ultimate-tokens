---
doc-type: spec
id: spec-muted-base-key-spikes
status: draft           # draft | approved | superseded  (0.2.0 draft pending the R1..R5 ratifications below; 0.1.0 was approved)
version: 0.2.0
date: 2026-09-11
owner: Kim Granlund
prd: none               # GitHub issues #503 and #533 are the intent records (ADR-017 git-native tickets)
scope: feature
audience: builder, reviewer, planner
---
# SPEC — Muted base ramps, a per-palette prime system, and 8 brand-derived data palettes

Intent records: GitHub issue #503 (`kind:feature`, `size:big`, `lane:color-engine`) and #533 (the
prime-system re-ruling, Findings 2026-09-11). Companion design: `docs/lld/lld-muted-base-key-spikes.md`.

Version history: 0.1.0 (approved 2026-09-11) put chroma spikes on identity stops of the base ramp.
0.2.0 (this revision, ratified in principle 2026-09-11 under #533) RETIRES the ramp spike entirely and
defines the prime swatches as their own token system per palette. The id and file name are kept so
existing links resolve; the title no longer mentions spikes.

Ruled before this SPEC (not reopened here): the 53-role table and `docs/reference/data/role-table.json`
role list stay frozen; data palettes are full ordinary palettes; data hues derive from the brand
primary hue by default and are user-editable; one global base intensity with a per-palette override
on the `cuspPull ?? vibrancy` precedent (`src/engine/tonal.js`). New under #533: the base ramp is
shaped by Base chroma alone; the prime swatches are a separate system with their own lightness
ladder, their own chroma control, and their own token group; the editor strip renders that system.

## Vocabulary

- **Base intensity** (`baseIntensity`, UI "Base chroma") is a fraction of the palette's own `chroma`
  control applied to every ramp stop. `chroma` keeps its meaning (the brand's full chroma, % of the
  hue's peak); base intensity scales what the ramp emits. The ramp is continuous: no stop is treated
  differently from its neighbours.
- **Prime system** is a per-palette set of seven swatches, `brightest`, `brighter`, `bright`, `prime`,
  `dim`, `dimmer`, `dimmest`, lightest first, computed from the palette's hue and chroma on their own
  lightness ladder, NOT from ramp stops. They are primitives-tier tokens (mode-independent).
- **Prime chroma** (`primeChroma`, UI "Prime chroma") is a fraction of the palette's `chroma`
  applied to the prime system only; global with a per-palette override.
- **Brand families** are the eight existing palettes (neutral, primary, secondary, tertiary, info,
  success, warning, danger). **Data families** are `data-1` … `data-8`.

## Requirements

### R-A. Base intensity (ramp shaping)

- **REQ-001** `DEFAULT_CONTROLS` carries `baseIntensity` (number, 0..100). A palette may carry an
  optional `intensity` (0..100) that overrides `baseIntensity` for that palette only, resolved exactly
  as `palette.intensity ?? controls.baseIntensity`.
- **REQ-002** The per-stop factor is `I(stop) = b` for EVERY stop, where `b` is the resolved base
  fraction. It multiplies the palette's chroma fraction before damping on BOTH ramp paths (OKHSL
  saturation on `perceptual`/`peak`; the intended chroma on `even`), so gamut safety stays with the
  existing clamps. (0.2.0: the `k` term and the identity-stop set of 0.1.0 are retired; ratified
  2026-09-11 under #533, supersedes REQ-002/REQ-004 of 0.1.0.)
- **REQ-003** Legacy invariance: with `baseIntensity = 100` (any `intensity` override of 100 or
  absent) every emitted stop is byte-identical to the pre-feature engine for every palette, control
  set, and both ramp paths. The AC-003 fixture is retained.
- **REQ-004** Retirement of the ramp spike (ratified 2026-09-11 under #533): `identityStops`,
  `DEFAULT_IDENTITY_STOPS`, the fourth `identityStops` argument of `paletteStops` and
  `hueAnchorFrac`, the `k` term in `intensityAt`, and `keyIntensity` as a ramp input are removed
  from the engine. `intensityAt(stop, palette, controls)` returns `b`. The tonal verifier's
  `intensity-spike` group and the semantic verifier's `identity-stops` gate are retired; the
  `intensity-legacy` fixture gate stays. No residual "patchy" chroma remains on any ramp at any
  intensity.
- **REQ-005** The OKLCH hue anchor (`solveOkhslHue` / `solveCam16Hue` at stop 500) uses the stop-500
  chroma AFTER base intensity, so the `oklch-hue-anchor` guarantee holds at every intensity.
- **REQ-006** Every existing tonal gate stays green with its control pin extended by
  `baseIntensity: 100`. Intensity never perturbs tone.
- **REQ-007** Product default: `DEFAULT_CONTROLS.baseIntensity = 100` (ratified 2026-09-11, H1). A
  muted default is a follow-up, not part of this contract.

### R-B. Persistence and migration

- **REQ-010** `persist.js` `DOMAINS` carries `baseIntensity` (0..100, default 100) and `primeChroma`
  (0..100, default 100); the palette domain carries optional `intensity` and optional `primeChroma`
  (0..100 each, absent means inherit, clamped only when finite, the `cuspPull` rule). Roundtrip
  identity and per-field clamp hold.
- **REQ-011** `CURRENT_SCHEMA_VERSION` becomes 3. Snapshots below 2 stamp `baseIntensity = 100`
  (unchanged from 0.1.0). Snapshots below 3 rename `keyIntensity` to `primeChroma` (value carried;
  the old key dropped; a snapshot already carrying `primeChroma` keeps it, the `RENAME_MAPS`
  never-clobber rule). Answer to Open gap 5; the rename is ratification item R4.
- **REQ-012** Hydrating a pre-v2 snapshot never injects data palettes. Data palettes reach an
  existing document only through the explicit action in REQ-032.

### R-C. Data palettes

- **REQ-020** `deriveDataHues(primaryHue, brandHues, count = 8)` (pure, module `src/engine/data-hues.mjs`)
  returns `count` OKLCH hues `primaryHue + phi + i * (360 / count)`, `i = 0 .. count-1`, where `phi` is
  the integer degree in `[0, 360 / count)` that maximises the minimum circular distance between the
  data hues and every brand hue; ties resolve to the smallest `phi`. Answer to Open gap 3.
- **REQ-021** `brandHues` is the hue of every non-data palette whose `chroma >= 20`.
- **REQ-022** A minted data palette is an ordinary palette object: `name: "Data N"`, `hue` from
  REQ-020, `chroma` equal to the primary's `chroma` (H4), `skew 0`, `lift 0`, `hueShift 0`,
  `hueSameDir false`, `on true`, no overrides. It carries all 53 roles and a prime system like any
  palette.
- **REQ-023** Data hues are derived once, at mint time, and stored as plain numbers. A "Re-derive
  data hues" action (REQ-032) recomputes them.
- **REQ-024** `defaultDocument()` returns 16 palettes: the eight brand families followed by
  `Data 1` … `Data 8`, enabled. `role-table.json` `defaults` lists the same 16 (H2).

### R-D. Exports, Figma, and the editor (data palettes and controls)

- **REQ-030** Every emitter that maps over enabled palettes emits data palettes with no change to the
  per-palette loop. Token count per enabled palette is 25 + 11 + 53 + 7 = 96 (the 7 are REQ-052).
- **REQ-031** `exportShadcn`: `chart-1..5` bind to the prime ROLE of `data-1..5` when enabled, else
  the current fallback chain; data palettes are excluded from the neutral, primary, and "first
  palette" fallbacks. `ds-export`: data palettes form a `data` tier and DESIGN.md gains a "Data
  series" section.
- **REQ-032** UI: "Add data palettes (8)" and "Re-derive data hues" actions; the Global tab keeps two
  adjacent sliders next to Vibrancy, "Base chroma" (`baseIntensity`) and "Prime chroma"
  (`primeChroma`); the palette inspector carries "Intensity" (`palette.intensity`) and "Prime chroma"
  (`palette.primeChroma`) override sliders next to Cusp pull. Defaults stay 100.
- **REQ-033** Figma: binding plan 53 x 16 = 848 role targets; Color Primitives 16 x 36 = 576
  variables; the new prime collection (REQ-054) 16 x 7 = 112 variables; all under the 5,000 per
  collection ceiling; the role collection's mode count (2) is unchanged.
- **REQ-034** Key swatch strip: each enabled palette row in the Color canvas renders the palette's
  seven prime swatches FIRST, left of the stop ramp, lightest first, labelled `brightest`,
  `brighter`, `bright`, `prime`, `dim`, `dimmer`, `dimmest` (ratified 2026-09-11 under #533,
  supersedes the role-mapped and ladder-stop strips of 0.1.0). The strip reads `view.palettes[i].prime`,
  never ramp stops or roles; it does not change with the scheme toggle, `accentRef`, or `stopsMode`.
  The labels are display text AND the token step names (REQ-053).

### R-E. Records and parity

- **REQ-040** `knowledge-02-tonal-scale.md` documents base intensity and the prime system;
  `knowledge-03-semantic-system.md` documents the 16 default families and that prime tokens are a
  primitives-tier group roles do not alias; `knowledge-04-export-formats.md` documents the prime
  group in every format; `CLAUDE.md`, `README.md`, `mcp/README.md`, the consumer plugin, and the
  marketing fact sheet update their counts. The 53 role count is unchanged everywhere.
- **REQ-041** Count literals under `test/` that encode the default palette count or the per-palette
  token count move together (`test/ui/counts.mjs`, `test/ui/shell.mjs`, `test/mcp/brand-kit*.mjs`,
  `tokenCount` expectations). Literals derived from `role-table.json` or the bundle need no edit.

### R-F. The prime system (new in 0.2.0)

- **REQ-050** `primeSwatches(palette, controls)` (pure, new module `src/engine/prime.mjs`, imports
  only `hct.js`, `okhsl.js`, and `tonal.js` helpers) returns seven entries
  `{ step, l, hex, rgb, oklch, inGamut }` in the fixed order brightest, brighter, bright, prime, dim,
  dimmer, dimmest, lightest first. Deterministic; no DOM.
- **REQ-051** Ladder (default proposal, ratification item R1): lightness is OKHSL `l` (the same
  perceptually uniform axis the `perceptual` ramp path steps in). `l_prime` is the OKHSL lightness of
  the palette's key colour, `okhslLAt(peakC(effHue).tone)`, so `prime` sits where the hue is most
  chromatic (the same anchor `deriveKeyColor` uses for the gallery tile). Steps are EVEN in `l` with
  `PRIME_STEP = 0.09`, compressed at the edges so all seven stay inside `[PRIME_L_MIN, PRIME_L_MAX] =
  [0.14, 0.94]`: `up = min(PRIME_STEP, (PRIME_L_MAX - l_prime) / 3)`, `down = min(PRIME_STEP,
  (l_prime - PRIME_L_MIN) / 3)`, `l_i = l_prime + up * (3 - i)` for `i = 0..2`, `l_prime - down *
  (i - 3)` for `i = 4..6`. Yellow (cusp near white) therefore compresses upward and spreads downward;
  blue does the reverse. Monotone strictly decreasing in `l` whenever `up, down > 0`.
- **REQ-052** Chroma: OKHSL saturation `s = clamp01(palette.chroma / 100 * pc)` where
  `pc = (palette.primeChroma ?? controls.primeChroma) / 100`, applied to all seven, no damping. In
  gamut by OKHSL construction; `inGamut` is always true and asserted.
- **REQ-053** Hue: the palette's OKLCH hue, anchored with `solveOkhslHue` at the `prime` swatch's own
  `(s, l_prime)` so `prime` lands on the set OKLCH hue; `hueShift` applies with the ramp's rule
  (`dir = hueSameDir ? -|t| : t`, `t = (i - 3) / 3`, so `brightest` is `t = -1`, `dimmest` `t = +1`).
  `skew`, `lift`, `damp*`, `vibrancy`, `cuspPull`, `toneMode` do NOT apply: they shape the ramp, and
  the prime system is not the ramp (ratification item R5).
- **REQ-054** Tokens: a `prime` group per palette, primitives tier, mode-independent, one value per
  step. Naming (ratification item R3): CSS `--{n}-prime-{step}` next to `--{n}-550`; DTCG, UI3, and
  JSON nest `{n}/prime/{step}` beside `{n}/scrim/*` and `{n}/key/*` (ADR-016 two-segment shape);
  Tailwind `--color-{n}-prime-{step}` in `@theme`; Figma: a new collection `COLLECTIONS.colorPrime =
  "Color Prime"` with the single mode `Base` and variables `{n}/{step}`; DS bundle: a `prime` block per
  family in `tokens.json` plus a "Prime swatches" section in DESIGN.md; MCP brand-kit:
  `palettes[i].prime = { brightest: { hex, oklch }, … }` and `get_prime(slug)` returns it. ShadCN
  has no slot (fixed contract, non-goal).
- **REQ-055** Same seven swatches in both schemes (ratification item R2): the group lives in the
  primitives tier, which is mode-independent by knowledge-03 §1; a per-scheme prime ladder would need
  a Light/Dark mode on the collection and is deliberately not built this round.
- **REQ-056** Legacy identity: at `primeChroma 100` the `prime` swatch equals the palette's
  `deriveKeyColor` hex within one 8-bit step per channel (same hue anchor, same cusp tone, same
  chroma fraction), so the gallery tile and the strip's `prime` agree.
- **REQ-057** `projectView` exposes `palettes[i].prime` (the seven entries) and `brandKit` includes
  it; `tokenCount` adds 7 per enabled palette.

## Non-goals

- No new semantic roles, no muted-suffixed roles, no reduced role set for data palettes. The
  `refs-canonical` gate and the binder mirror stay at 53. Roles do NOT alias prime tokens this round
  (a later round may re-point `{n}`/Dim/Bright to the prime group; it needs its own SPEC).
- No chroma spike on the base ramp of any kind; no identity-stop set; the ramp is continuous.
- No per-scheme prime ladder (R2); no Light/Dark mode on the prime collection.
- No prime tokens in ShadCN (fixed contract) and no new export FORMAT (the group rides the eight).
- No change to Typography or Geometry.
- No live link from the primary hue to data hues after minting; no migration that adds palettes to a
  saved document; presets stay as authored (H3).
- No change to the "From Figma" import.

## Examples

- **EX-1 (NORMATIVE, legacy invariance).** Default Primary (`hue 267 OKLCH, chroma 95`), default
  controls with `baseIntensity 100`: every stop of the 25-stop export ramp equals the pre-feature
  engine output byte for byte, and `primeChroma` has no effect on any ramp stop.
- **EX-2 (NORMATIVE, muted ramp).** Same palette, `baseIntensity 40`: every stop emits at the chroma
  fraction `0.95 * 0.40 * m(stop)` before the gamut clamp; no stop is exempt. Tones are identical to
  EX-1. (Supersedes 0.1.0's EX-2/EX-3.)
- **EX-3 (NORMATIVE, override).** As EX-2 but Warning carries `intensity 100`: Warning's ramp equals
  its EX-1 ramp; Primary is unchanged from EX-2.
- **EX-4 (NORMATIVE, prime ladder).** Default Primary, `primeChroma 100`: `l_prime` is the OKHSL
  lightness of the hue's cusp tone; `up = down = 0.09` (the cusp is far from both bounds), so the
  seven `l` values are `l_prime + 0.27, +0.18, +0.09, 0, -0.09, -0.18, -0.27`; `s = 0.95`;
  `prime.hex` equals `deriveKeyColor(primary).keyHex` within one 8-bit step per channel.
- **EX-5 (NORMATIVE, edge compression).** Default Warning (`hue 70, chroma 100`), cusp near white,
  say `l_prime = 0.90`: `up = min(0.09, 0.04 / 3) = 0.0133`, `down = 0.09`; `brightest = 0.94`,
  `dimmest = 0.63`. All seven in `[0.14, 0.94]`, strictly decreasing.
- **EX-6 (NORMATIVE, prime chroma).** As EX-4 with `primeChroma 50`: `s = 0.475` on all seven, `l`
  unchanged; the ramp is unchanged. With `palette.primeChroma 100` on Primary inside a document at
  `primeChroma 50`, Primary's prime system equals EX-4.
- **EX-7 (NORMATIVE, naming).** For Primary the CSS export contains `--primary-prime-brightest` …
  `--primary-prime-dimmest` in the raw block; DTCG raw tree has `primary.prime.brightest`; UI3 has a
  `Color Prime` collection with `primary/brightest`; Tailwind has `--color-primary-prime-prime`.
- **EX-8 (NORMATIVE, key strip).** Default Primary, either scheme, either `accentRef`, either
  `stopsMode`: the strip reads the seven `prime` entries in order; each swatch's hex equals
  `view.palettes[i].prime[k].hex`. Nothing in the strip changes with the scheme toggle.
- **EX-9 (NORMATIVE, migration).** Snapshot `{schemaVersion: 2, keyIntensity: 70}` hydrates to
  `primeChroma 70` with no `keyIntensity` key. Snapshot `{schemaVersion: 1}` hydrates to
  `baseIntensity 100, primeChroma 100`.
- **EX-10 (NORMATIVE, data hues).** Unchanged from 0.1.0 EX-5.
- **EX-11 (NORMATIVE, shadcn).** Unchanged from 0.1.0 EX-7 (chart-1..5 from data-1..5).

## Acceptance

- **AC-001** `DEFAULT_CONTROLS` has `baseIntensity` and `primeChroma`, no `keyIntensity`;
  `paletteStops` honours `palette.intensity` over `controls.baseIntensity`.
- **AC-002** For a probe palette below the gamut ceiling, measured stop chroma at EVERY stop divided
  by chroma at `baseIntensity 100` equals `b` within 2% of peak; both ramp paths; the ratio has zero
  dependence on `primeChroma` and on `accentRef`.
- **AC-003** Byte-diff fixture gate at `baseIntensity 100` (retained from 0.1.0).
- **AC-004** `paletteStops.length === 3` (no fourth parameter); `tonal.js` and `semantic.js` export
  no `identityStops` or `DEFAULT_IDENTITY_STOPS`; `git grep -n "identityStops\|keyIntensity" src
  test` returns nothing outside `RENAME_MAPS` and its test.
- **AC-005** `oklch-hue-anchor` gate passes at `baseIntensity` in `{20, 45, 100}`.
- **AC-006** The full tonal verifier passes with its pin extended by `baseIntensity: 100`; tones
  equal within 1e-9 across intensities.
- **AC-007** `DEFAULT_CONTROLS.baseIntensity === 100 && primeChroma === 100`.
- **AC-010** `test/ui/persist.mjs` roundtrip and clamp groups cover `baseIntensity`, `primeChroma`,
  `palette.intensity`, `palette.primeChroma`.
- **AC-011** EX-9 both halves as hydrate assertions; `CURRENT_SCHEMA_VERSION === 3`.
- **AC-012** Hydrating a v1 snapshot with 8 palettes yields exactly 8 palettes.
- **AC-020..024** Unchanged from 0.1.0 (data hues, minting, defaults 16).
- **AC-030** `hpg-export-leaf-valid` passes with `enabledCount` 16; `tokenCount(defaultDocument())
  === 16 * 96`.
- **AC-031** EX-11; shadcn neutral and primary picks unchanged; DS semantic layer `53 * 16`; DESIGN.md
  has the data section and the prime section.
- **AC-032** Headless-boot: "Base chroma" and "Prime chroma" sliders exist on the Global tab, are
  adjacent, and write `doc.baseIntensity` / `doc.primeChroma`; the per-palette "Intensity" and "Prime
  chroma" sliders write `palettes[i].intensity` / `palettes[i].primeChroma`; the two data actions
  behave as in 0.1.0.
- **AC-033** Binder plan `53 * 16`; plugin cascade green; the `collparity` gate covers
  `COLLECTIONS.colorPrime` against both sandbox literals.
- **AC-034** Headless-boot: every enabled ramp row has a `.key-strip` before `.ramp-strip` with
  exactly seven `<i>` whose labels are, in order, brightest, brighter, bright, prime, dim, dimmer,
  dimmest, and whose background equals `view.palettes[i].prime[k].hex`; toggling scheme, `accentRef`,
  and `stopsMode` leaves the strip byte-identical.
- **AC-040** Count grep as in 0.1.0 plus `git grep -n "\b89\b" -- src test docs/reference mcp` returns
  only historical hits.
- **AC-041** `npm test` green at every build-unit boundary listed in the LLD.
- **AC-050** `test/engine/prime.mjs`: (a) exactly seven entries in the fixed step order for every
  default palette; (b) `l` strictly decreasing and every `l` within `[0.14, 0.94]` (within 1e-9);
  (c) `inGamut` true for every entry at `primeChroma` in `{0, 50, 100}` and `chroma` in `{0, 50,
  100}`; (d) `up`/`down` re-derived independently in the test from `l_prime` equal the observed step
  sizes within 1e-9 (EX-5 on Warning binds the `up` compression, EX-4 on Primary binds the uncompressed
  case); (e) measured OKLCH hue of `prime` equals the palette hue within 0.5° for every default
  chromatic palette (chroma >= 20), and each other swatch within 2° when `hueShift 0`; (f) with
  `hueShift 20` the `brightest`/`dimmest` hues move by `-20`/`+20` within 2° and `prime` is invariant;
  (g) `s` scales linearly with `primeChroma` (ratio of measured OKHSL `s` at 50 vs 100 equals 0.5
  within 0.02 on an unclamped probe); (h) REQ-056: `prime.hex` vs `deriveKeyColor` within one 8-bit
  step per channel for every default palette; (i) determinism: two calls are deep-equal; (j)
  `palette.primeChroma` overrides the global.
- **AC-051** `test/engine/exports.mjs`: every format except shadcn emits `7 * enabledCount` prime
  leaves, named per REQ-054; disabled palettes emit none; DTCG raw tree nests `prime` beside `scrim`;
  UI3 has the `Color Prime` collection with one `Base` mode and `7 * enabledCount` variables; the
  brand-kit carries `prime` per palette with seven `{hex, oklch}` entries.
- **AC-052** `test/figma/plugin.mjs`: applying the bundle creates the `Color Prime` collection with
  `7 * palettes` variables; re-applying updates in place (provenance registry, no duplicates).
- **AC-053** `test/mcp/brand-kit.mjs`: `get_prime("primary")` returns seven entries in step order.

## Agent verification

- AC-001..007: `node test/engine/tonal.mjs` (`intensity-legacy` fixture group retained; `intensity-spike`
  removed; a new `intensity-uniform` group for AC-002/AC-004). AC-004's grep runs in the same script.
- AC-010..012: `node test/ui/persist.mjs`.
- AC-020..024: `node test/engine/data-hues.mjs`, `node test/ui/shell.mjs`.
- AC-030..034: `node test/engine/exports.mjs`, `node test/figma/binder.mjs`, `node test/figma/plugin.mjs`,
  the headless shim lettered groups. Strip assertions read the shim DOM (background style string and
  the label text), never computed style.
- AC-050: `node test/engine/prime.mjs` (new verifier, registered in `test/run.mjs`; `pass`/`FAIL` per
  lettered group like `tonal.mjs`). The independent re-derivation in (d) and the measurement from
  emitted pixels in (e)/(g) are the anti-tautology controls.
- AC-051..053: `node test/engine/exports.mjs`, `node test/figma/plugin.mjs`, `node test/mcp/brand-kit.mjs`.
- Human exception: whether `PRIME_STEP = 0.09` reads as a pleasing seven-step ladder on the Safari
  preview is R1; the numbers are the contract, the value is the choice.

## Decisions on the issue's six Open gaps (as they stand after #533)

| Gap | Decision | Rationale | Ratify? |
|---|---|---|---|
| 1. Spike curve | Superseded 2026-09-11 by #533: no spike on the ramp. The prime system carries brand chroma instead, with a flat `s` from Prime chroma | A discrete spike made the ramp patchy (the defect #533 closes); a separate seven-swatch system gives vivid identity colours without touching the continuous ramp | Ratified (#533) |
| 2. Hover/active | Superseded 2026-09-11 by #533: no identity stops exist. Roles keep aliasing ramp stops; hover/active render at base intensity like every stop | Roles do not alias prime tokens this round (non-goal); a later SPEC may re-point them | Ratified (#533) |
| 3. Data hue rule | Even 45° spacing from primary plus an integer offset maximising min distance to chromatic brand hues (chroma >= 20) | Deterministic, pure, brute-force testable | No |
| 4. Token ceiling | 848 role variables, 576 primitives, 112 prime variables per Figma file at 16 palettes, each collection under 5,000; modes unchanged | Counted from 53, 36, and 7 per palette | No |
| 5. Migration | Pre-v2 stamps `baseIntensity 100`; pre-v3 renames `keyIntensity` to `primeChroma` | Same principle as the `hueSpace` legacy stamp and the TKT-0016 voice rename | R4 |
| 6. Data palettes default | ON in a fresh document; opt-in for upgraded documents | The pivot names data palettes part of the system | Ratified (H2) |

## Ratification record

Ratified 2026-09-11 (H1..H4, team-lead relaying the owner):
- **H1** `baseIntensity` default stays 100 this cycle.
- **H2** Data palettes ON in a fresh `defaultDocument` (16 palettes); upgraded documents opt in.
- **H3** Presets stay as authored.
- **H4** Data palette chroma follows the primary's chroma.
- **#533 Findings** Ramp spike retired; prime swatches are their own system with their own ladder,
  chroma control, and token group; roles frozen; strip renders the prime system.

Open, proposed defaults marked in the text (0.2.0 stays `draft` until these are ruled):
- **R1** Ladder shape: OKHSL `l`, prime at the hue's cusp lightness, even `PRIME_STEP 0.09`,
  edge-compressed into `[0.14, 0.94]` (REQ-051). Alternatives: OKLCH `L` instead of OKHSL `l`; a
  fixed prime lightness instead of the cusp.
- **R2** Same seven swatches in both schemes, primitives tier (REQ-055). Alternative: a Light/Dark
  mode on the prime collection with a per-scheme ladder.
- **R3** Naming: `prime` group, `--{n}-prime-{step}`, `{n}/prime/{step}`, Figma collection
  `Color Prime` with `{n}/{step}` (REQ-054). Alternative: nest inside `Color Primitives` as
  `{n}/prime/{step}` with no new collection.
- **R4** Rename `keyIntensity` to `primeChroma` with a schema-v3 rename (REQ-011). Alternative: keep
  the `keyIntensity` key and only relabel the UI.
- **R5** `hueShift` applies to the prime ladder; `skew`, `lift`, damping, vibrancy, cusp pull do not
  (REQ-053). Alternative: apply `skew` as a gamma on the ladder position.
