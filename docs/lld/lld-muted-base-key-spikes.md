---
doc-type: lld
id: lld-muted-base-key-spikes
status: approved        # draft | approved | superseded  (0.4.0 approved 2026-09-20, tracks SPEC 0.4.0's CIE-L* equal-compress prime ladder, #681 U6/U4; amends 0.3.0)
version: 0.4.0
date: 2026-09-20
owner: Kim Granlund
spec: spec-muted-base-key-spikes
scope: feature
audience: builder, reviewer
---
# LLD — Palette groups with an absolute base chroma, a per-palette prime system, data hue derivation

Spec: `docs/spec/spec-muted-base-key-spikes.md` 0.4.0 (REQ/AC ids below refer to it). Intent: issues
#503 and #533. Substrate this design leans on and does not restate: `color-math` skill (two ramp
paths, damping multiplier `m`, hue anchors, OKHSL bijection), `adding-export-formats` skill (the
per-format emitter map), `maintaining-figma-plugins` (collections, provenance registry),
`maintaining-brand-kit-mcp`, `persist.js` header (roundtrip and clamp invariants, `RENAME_MAPS`).

Version history: 0.1.0 designed a chroma spike on identity stops (shipped as U1 in #509 and U2).
0.2.0 (ratified 2026-09-11 under #533) removes that spike and adds the prime system as its own
engine module, token group, Figma collection, and editor strip. Units P1..P8 below are the re-cut;
the data-palette units U5..U9 of 0.1.0 stand unchanged. 0.3.0 (ratified 2026-09-11, #556 + the #559
re-ruling) adds palette groups and makes the group's base chroma the ramp's absolute chroma target,
resolved in the model; it documents the two units already in flight (G1 #556, G2 #559) and adds none.
0.4.0 (approved 2026-09-20, tracks SPEC 0.4.0: ticket #681 unit U6's owner rulings Q8/Q9, with unit
U4's integration pass 2 folded in) rewrites the `prime.mjs` interface block for the CIE-L*
equal-compress ladder that shipped and re-measures Risk 4 against it; it adds no build unit.

## Components

| Component | File | Responsibility |
|---|---|---|
| Ramp chroma target | `src/ui/model.mjs` (`rampChromaOf`), consumed by `projectView` and `exports.js` `derivePalette` | `rampChromaOf(p, doc) = paletteGroups[paletteGroup(p)].baseChroma ?? controls.baseIntensity`; the engine receives `{ ...p, chroma: rampChromaOf(p) }` (REQ-002). `intensityAt` and the engine's `baseIntensity` read are removed (REQ-004); `tonal.js` is the 0.2.0 contract with `palette.chroma` as its only chroma input |
| Palette groups | `src/ui/model.mjs` (`PALETTE_GROUPS`, `paletteGroup`, `GROUP_DEFAULTS`, `resolvePaletteGroups`), `src/ui/persist.js` | The four groups, the by-name default, the per-group `{ baseChroma, primeChroma, locked }` defaults and the document's `paletteGroups` default-fill (REQ-001, REQ-010) |
| Prime chroma resolution | `src/ui/model.mjs` (`primeChromaOf`) | `(locked ? undefined : p.primeChroma) ?? paletteGroups[g].primeChroma ?? controls.primeChroma`, handed to `primeSwatches` as `controls.primeChroma` with the palette's own field cleared (REQ-008); `prime.mjs` unchanged |
| Spike retirement | `src/engine/semantic.js`, `src/ui/model.mjs`, `src/engine/exports.js`, `test/engine/{tonal,semantic}.mjs` | `identityStops` and its callers removed; `paletteStops(palette, controls, stops)` is three-ary again; `intensity-spike` group and `identity-stops` gate deleted; `intensity-legacy` fixture kept and re-asserted (REQ-004) |
| Prime system | `src/engine/prime.mjs` (new, pure) | `primeSwatches(palette, controls)` (REQ-050..053, REQ-056); constants `PRIME_STEPS`, `STEP_L`, `PRIME_L_MIN`, `PRIME_L_MAX` (`PRIME_STEP` retired 2026-09-18 with the OKHSL-domain ladder, #681 U6) |
| Controls plumbing | `src/ui/model.mjs` | `controlsOf`/`stateOf` thread `baseIntensity`, `primeChroma`, and `paletteGroups`; `derivePalette` in `exports.js` calls the same `rampChromaOf`/`primeChromaOf` so every export matches the canvas; `projectView` adds `palettes[i].prime`; `brandKit` adds `prime`; `tokenCount` adds 7 per enabled palette (REQ-057) |
| Persistence | `src/ui/persist.js` | `DOMAINS.primeChroma`, `DOMAINS.paletteGroups` (+ `clampPaletteGroups` default-fill), `clampPalette` optional `group` (enum) and `primeChroma`, no `intensity`; `CURRENT_SCHEMA_VERSION = 4`; `RENAME_MAPS` entries v3 (`keyIntensity` to `primeChroma`) and v4 (drop `palette.intensity`, reported via `DROPPED_KEYS`; default-fill `paletteGroups`) (REQ-010, REQ-011) |
| Collections | `src/engine/collections.js` | `COLLECTIONS.colorPrime = "Color Prime"` (REQ-054, R3), single mode `Base` (R2 ratified: mode-independent); both sandbox literals mirror it, diffed by the `collparity` gate |
| Emitters | `src/engine/exports.js` | `derivePalette` gains `prime` (seven entries); `cssFrom`, `exportJSON`, `exportDTCG`, `exportUI3`, `exportTailwind` emit the group (REQ-054); `exportShadcn` untouched |
| DS bundle | `src/engine/ds-export.js` | `prime` block per family in `tokens.json`; "Prime swatches" section in DESIGN.md (Claude Design, Stitch, Make profiles) (REQ-054, REQ-031) |
| MCP | `mcp/brand-kit-core.mjs` | `get_prime(slug)` tool + `brand://palette/{slug}/prime` resource over `kit.palettes[i].prime` (REQ-054, REQ-057) |
| Figma plugin apply | `figma/plugin/` (generated `ui.html` from the app), `src/ui/figma-apply*.js` (whichever module builds the apply message) | Creates or finds `Color Prime` by provenance registry key, one `Base` mode, `{n}/{step}` variables; the binder reads nothing from it this round (REQ-033, REQ-054) |
| UI | `src/ui/sections/color.js`, `src/ui/styles.css` | Global tab "Base chroma" + "Prime chroma" fallback sliders next to Vibrancy plus a per-group row (Material, Brand, System, Data; two sliders each); canvas rows under four group headers with counts; palette inspector Group dropdown, "Chroma" (key colour + prime only), "Prime chroma" override hidden for Data, no "Intensity" slider (REQ-009, REQ-032); `.prime-strip` (seven `.prime-swatch`; `.key-strip` is the unrelated retained-key-colours row, #552) in `renderRampsScene` before `.ramp-strip` from `vp.prime` (REQ-032, REQ-034) |
| Data palettes | `src/engine/data-hues.mjs`, `src/ui/model.mjs`, `role-table.json` | Unchanged from 0.1.0 (U5..U9) |

## Interfaces

```js
// tonal.js (0.3.0): the 0.2.0 engine contract, with the multiplier removed (REQ-004)
DEFAULT_CONTROLS.baseIntensity = 100;                              // a MODEL fallback; tonal.js never reads it
export function paletteStops(palette, controls, stops);            // palette.chroma is the only chroma input
export function hueAnchorFrac(palette, controls);
// intensityAt: removed.

// model.mjs (0.3.0, #556/#559)
export const PALETTE_GROUPS = ["material", "brand", "system", "data"];
export const GROUP_DEFAULTS = { material: { baseChroma: 30, primeChroma: 60 }, brand: { baseChroma: 100, primeChroma: 100 },
                                system: { baseChroma: 100, primeChroma: 100 }, data: { baseChroma: 100, primeChroma: 100, locked: true } };
export function paletteGroup(p) -> "material"|"brand"|"system"|"data"   // p.group ?? default by slug(p.name)
export function resolvePaletteGroups(doc) -> { [g]: { baseChroma, primeChroma, locked } }  // doc.paletteGroups default-filled
export function rampChromaOf(p, doc) -> number       // groups[g].baseChroma ?? controls.baseIntensity   (REQ-002)
export function primeChromaOf(p, doc) -> number      // (locked ? undefined : p.primeChroma) ?? groups[g].primeChroma ?? controls.primeChroma (REQ-008)
// projectView / derivePalette:
//   ramp  = paletteStops({ ...p, chroma: rampChromaOf(p, doc) }, controls, EXPORT_STOPS)
//   prime = primeSwatches({ ...p, primeChroma: undefined }, { ...controls, primeChroma: primeChromaOf(p, doc) })
//   key colour / gallery tile: deriveKeyColor(p) at p.chroma, unchanged

// prime.mjs (P2; ladder rewritten 2026-09-18 by #681 U6, anchor branch + widening search folded in
// by #681 U4). Pure; imports hctToRgb/lstarFromRgb/maxChromaInGamut/peakC/cam16FromRgb from hct.js,
// okhslToRgb from okhsl.js, effHue from tonal.js. Nothing on the ladder path is OKHSL any more.
export const PRIME_STEPS = ["brightest", "brighter", "bright", "prime", "dim", "dimmer", "dimmest"];
export const STEP_L = 9;                                  // CIE L* per rung (Q8: 6 x STEP_L = the 54 L* total span)
export const PRIME_L_MIN = lstarFromRgb(okhslToRgb(0, 0, 0.14));  // 12.250030  (DERIVED from the grey, never retyped)
export const PRIME_L_MAX = lstarFromRgb(okhslToRgb(0, 0, 0.97));  // 96.884928  (same two OKHSL bounds as 0.3.2)
// PRIME_STEP: retired with the OKHSL-domain ladder (#681 U6). Nothing outside this file imported it.
export function primeSteps(lPrimeStar) -> { up, down }    // REQ-051, Q9 equal-compress: up === down, always
//   roomUp = max(0, (PRIME_L_MAX - lPrimeStar) / 3); roomDown = max(0, (lPrimeStar - PRIME_L_MIN) / 3)
//   step = min(STEP_L, roomUp, roomDown); return { up: step, down: step }
//   (both rooms floored at 0, so an anchor outside the window credits no negative travel; under
//    equal-compress a zero on one side binds the other, which is what the widening search below fixes)
export function primeSwatches(palette, controls)
  -> [{ step, l, s, hue, rgb: [r,g,b], hex, oklch: [L,C,H], inGamut }]  // length 7, lightest first
     // `l` is the rung's CIE L* (its hctToRgb tone argument, exact); `s` is its rendered CAM16 chroma
// Algorithm:
//   ANCHOR BRANCH (#681 U1/U4): palette.anchor matching /^#[0-9A-Fa-f]{6}$/ is a STORED source hex.
//     anchorRgb = hexToRgb(anchor); cam = cam16FromRgb(anchorRgb)
//     lPrime = lstarFromRgb(anchorRgb); keyChroma = cam.chroma; hOk = cam.hue
//   ELSE (cusp identity, unchanged from P2):
//     baseHue = effHue(palette.hue, controls.hueSpace, (palette.chroma ?? 0) / 100)
//     pk = peakC(baseHue)                                // SHARED, exact-keyed (#686), the SAME call deriveKeyColor makes
//     lPrime = pk.tone                                   // pk.tone IS the key colour's own CIE L*; no OKHSL round trip
//     keyChroma = (palette.chroma / 100) * pk.c; hOk = baseHue
//   g  = 3 ** ((palette.skew ?? 0) / 100)                // the ramp's toneAt gamma (REQ-053a, R5)
//   pc = (palette.primeChroma ?? controls.primeChroma ?? 100) / 100
//   cPrime = max(0, keyChroma * pc)                      // REQ-052: the target chroma, HELD on every rung
//   lLadder = anchored ? clamp(lPrime, PRIME_L_MIN, PRIME_L_MAX) : lPrime   // Q3(b): prime itself never clamps
//   { up, down } = primeSteps(lLadder)                   // up === down by construction
//   WIDENING SEARCH (anchored only, #681 U4 pass 2): if the six non-prime rungs plus the anchor are
//     not seven distinct hexes (which is what a pivot exactly on a bound produces, since equal-compress
//     reads 0 on BOTH sides there), walk reserve r = 0.1, 0.2, ... up to STEP_L:
//       lo = PRIME_L_MIN + 3*r; hi = PRIME_L_MAX - 3*r; break if lo > hi
//       lLadder = clamp(lPrime, lo, hi); { up, down } = primeSteps(lLadder)
//       stop at the first r that makes them distinct; otherwise keep the most-widened attempt
//     Both sides move by the same r, so up === down survives; lPrime (the prime rung) is untouched.
//   per rung i:
//     t = (i - 3) / 3; w = i < 3 ? |t| ** (1 / g) : |t| ** g   // light 1/g, dark g; w(prime) = 0, w(ends) = 1
//     l[i]   = i < 3 ? lLadder + 3 * up * w : lLadder - 3 * down * w   // skew 0 => even, and equal across sides
//     hue[i] = hOk + hueShift * (hueSameDir ? -|t| : t), wrapped into [0, 360)   // REQ-053, CAM16 hue
//     chroma[i] = min(cPrime, maxChromaInGamut(hue[i], l[i]))   // REQ-052: held; only the GAMUT desaturates
//     { rgb, inGamut } = hctToRgb(hue[i], chroma[i], l[i]); hex from the 8-bit rgb; oklch via rgbToOklch (float)
//   anchored i === 3 short-circuits all of the above: rgb = anchorRgb VERBATIM, never re-rendered,
//   and never scaled by primeChroma (#681 U1's "never moves it").
// okhslLAt and solveOkhslHue are exported from tonal.js (P2) but the prime system does not call them (#537).

// persist.js (P3)
export const CURRENT_SCHEMA_VERSION = 3;
RENAME_MAPS.push({ version: 3, renameControls: { keyIntensity: "primeChroma" } });   // never clobbers an existing primeChroma

// model.mjs (P3)
projectView(doc).palettes[i].prime  -> the primeSwatches() array
brandKit(doc).palettes[i].prime     -> { [step]: { hex, oklch: "oklch(L C H)" } }
tokenCount(doc)                     -> enabled * (25 + 11 + 53 + 7)

// exports.js (P4) — emitted names per REQ-054
// CSS/OKLCH raw block:   --{n}-prime-{step}: #hex | oklch(L C H)
// JSON:                  palettes[n].prime[step] = { hex, oklch }
// DTCG raw tree:         {n}.prime.{step} = colorLeaf(rgb, 1)
// UI3:                   collections["Color Prime"] = { modes: ["Base"], variables: { "{n}/{step}": ... } }
// Tailwind @theme:       --color-{n}-prime-{step}: oklch(...)

// mcp (P6)
get_prime({ palette }) -> { palette, steps: [{ step, hex, oklch }] }   // seven, in PRIME_STEPS order
```

`prime.mjs` imports from `tonal.js` (helpers) and `hct.js`/`okhsl.js` only; it never imports
`semantic.js`, so the engines stay DOM-free and acyclic. `tonal.js` does not import `prime.mjs`.

## Data

Document shape (all optional on read, always written by `serialize`):

```js
{ schemaVersion: 4, baseIntensity: 100, primeChroma: 100,
  paletteGroups: { material: { baseChroma: 30, primeChroma: 60 }, brand: { baseChroma: 100, primeChroma: 100 },
                   system: { baseChroma: 100, primeChroma: 100 }, data: { baseChroma: 100, primeChroma: 100, locked: true } },
  palettes: [ { ..., group?: "material"|"brand"|"system"|"data", primeChroma?: 0..100 }, ..., { name: "Data 1", ... } ] }
```

The key is `paletteGroups`, never `groups`: `story.groups` already carries the curated story's
concept groups (`clampStory`), and a top-level `groups` would collide in prose and in grep.

Migration (REQ-011): `applyRenameMaps` handles the v2 stamp (`baseIntensity: 100` when absent, kept)
and the v3 control rename (`keyIntensity` moved onto `primeChroma` unless `primeChroma` already
exists; the old key deleted) and the v4 drop of `palette.intensity` plus the `paletteGroups`
default-fill (REQ-011). `DOMAINS` lists neither `keyIntensity` nor `palette.intensity`, so a snapshot
that still carries either is dropped by the allowlist and reported through `DROPPED_KEYS` (loud, per
TKT-0455). `palette.group` is never written by migration: derive-on-read keeps an old document
byte-stable on reload apart from the dropped key.

Fixtures (REQ-003, AC-003): `test/engine/fixtures/tonal-legacy.json` (engine, retained, hand-regenerated
only) and `test/ui/fixtures/default-doc-ramps.json` (document: 16 palettes x 25 stops hex from
`projectView(defaultDocument())` at the ratified `paletteGroups` defaults; regenerated only by
`node scripts/gen-ramp-fixture.mjs`, which the #559 builder adds and runs once; `npm test` compares,
never writes). Which default palettes stay byte-identical to 0.2.0 is derived live in the same
gate from the `chroma == rampChroma` rule, not hard-coded.

Token counts, default document: 16 palettes x 96 = 1,536 tokens. Figma: Color Primitives 576, Color
Roles 848 x 2 modes, Color Prime 112 x 1 mode.

`role-table.json` is untouched by the prime system: prime tokens are not roles and have no answer
key there. Their answer key is the `prime.mjs` verifier's independent re-derivation (AC-050 d).

## Build units (each one PR, `npm test` green at its boundary, parity gates never red between PRs)

| # | Unit | Files | Size | Parity note |
|---|---|---|---|---|
| P1 | Retire the ramp spike (REQ-004, REQ-042): delete `identityStops`, `DEFAULT_IDENTITY_STOPS`, the fourth parameter, the `k` term; `intensityAt` returns `b`; callers in `model.mjs`/`exports.js` drop the set; `intensity-spike` group and `identity-stops` gate removed; new `intensity-uniform` group (AC-002/AC-004); `keyIntensity` stays in `DEFAULT_CONTROLS`/`DOMAINS` as an inert control until P3 so nothing else moves | `tonal.js`, `semantic.js`, `model.mjs`, `exports.js`, `test/engine/tonal.mjs`, `test/engine/semantic.mjs` | small | Output byte-identical at 100 (the retained fixture proves it); closes the visible patchy-ramp defect at any other intensity. `code.js` regenerates with no role-table diff |
| P2 | Prime engine: `src/engine/prime.mjs` + `test/engine/prime.mjs` (AC-050 a..j incl. the (d2) skew-gamma monotonicity/edge/invariance gate, registered in `test/run.mjs`); `okhslLAt`/`solveOkhslHue` exported from `tonal.js`; reads `controls.primeChroma ?? controls.keyIntensity` during the P2..P3 window so the module works before the rename lands | `prime.mjs`, `tonal.js` (exports only), `test/engine/prime.mjs`, `test/run.mjs` | big | Pure addition, nothing consumes it yet |
| P3 | Persist + model: schema v3 rename `keyIntensity` to `primeChroma`, `palette.primeChroma`, `DOMAINS`; `controlsOf`/`stateOf`; `projectView.palettes[i].prime`; `brandKit.prime`; `tokenCount` +7; the P2 fallback read removed | `persist.js`, `model.mjs`, `test/ui/persist.mjs`, `test/ui/shell.mjs` | small | `tokenCount` literal in `shell.mjs` and the footer readout move here (89 to 96); MCP tests that count kit keys are checked |
| P4 | Emitters: CSS/OKLCH/JSON/DTCG/UI3/Tailwind prime group + `COLLECTIONS.colorPrime`; export gates (AC-051); the two sandbox literals + `collparity` | `exports.js`, `collections.js`, `figma/plugin/code.js` literal, `figma/binder/figma-semantic-binder/code.js` literal, `test/engine/exports.mjs`, `test/figma/binder.mjs` | big | `collparity` must see all three sites in the same PR; the binder does not bind prime tokens so `bindingPlan` is unchanged |
| P5 | Figma apply: the plugin creates/updates `Color Prime` (provenance key, `Base` mode); plugin cascade gate extended (AC-052); `FIGMA_MIGRATIONS` entry not needed (new collection, no rename) | the app's Figma apply module, `figma/plugin/code.js`, `test/figma/plugin.mjs`, `scripts/gen-figma-ui.mjs` if it lists collections | small | `gen:figma-ui` and `bundle` rerun under `npm test` |
| P6 | DS bundle + MCP: `prime` block and DESIGN.md section across the three profiles; `get_prime` tool + resource; gates (AC-031 prime part, AC-053) | `ds-export.js`, `mcp/brand-kit-core.mjs`, `mcp/README.md`, `test/engine/exports.mjs`, `test/mcp/brand-kit.mjs` | small | The design-system-checker rubric may need a row for the prime section |
| P7 | UI: "Prime chroma" relabel wired to `primeChroma`, per-palette "Prime chroma" override slider, `.prime-strip` from `vp.prime` (seven `.prime-swatch` with `data-step`, label, `style="background:{hex}"`, reusing the ramp-strip hover/footer handlers); shim group for AC-032 + AC-034 | `sections/color.js`, `styles.css`, `test/ui/headless-boot.mjs` | small | No engine or count change |
| G1 | Palette groups (#556, in flight, PR #561): `palette.group`, `paletteGroup`, canvas headers, inspector dropdown, default assignment in the modal and the data action; persist enum; shim group (REQ-001, REQ-009, REQ-010 part) | `model.mjs`, `persist.js`, `sections/color.js`, `test/ui/headless-boot.mjs`, `test/ui/persist.mjs` | small | Exports byte-identical; no engine change |
| G2 | Absolute per-group base chroma + prime chroma resolution (#559, in flight, stacked on #561): `GROUP_DEFAULTS`, `resolvePaletteGroups`, `rampChromaOf`, `primeChromaOf`, `paletteGroups` persistence + schema v4 (drop `palette.intensity`), `intensityAt` removed from `tonal.js`, Global-tab group rows, inspector changes, `scripts/gen-ramp-fixture.mjs` + the document fixture, shim + persist + shell gates (REQ-002..008, REQ-010, REQ-011, REQ-032, AC-003) | `model.mjs`, `exports.js`, `tonal.js`, `persist.js`, `sections/color.js`, `scripts/`, `test/ui/*`, `test/engine/tonal.mjs` | small per ticket (the two together are one context) | Token VALUES change for Neutral, Primary, Tertiary, Info, Success, Danger, and the data palettes by design; names unchanged; the engine fixture stays green because `tonal.js` reads only `palette.chroma` |
| P8 | Docs sweep: knowledge-02 (base intensity + prime system), knowledge-03 (prime group is primitives tier, roles do not alias it), knowledge-04 (prime in every format), CHANGELOG, README, `CLAUDE.md`, consumer plugin `color-tokens`, marketing fact sheet via `marketing-manager-agent`; AC-040 greps | docs only | small | No test literals |

Data-palette units U5..U9 from 0.1.0 stand as written there (U5 shipped in #508). Ordering: P1 first
(it fixes the shipped defect and is independent of everything else); P2 after P1; P3 after P2; P4 after
P3; P5 and P6 after P4, independent of each other; P7 after P3 (it needs `vp.prime` and `primeChroma`);
P8 last. U6..U9 interleave freely after U5; U6's `tokenCount` literal must be written against whichever
per-palette count (89 or 96) is current at its merge. P2 and U6 can run in parallel worktrees.

Sizes: P1 small · P2 big · P3 small · P4 big · P5 small · P6 small · P7 small · P8 small · G1 small ·
G2 small. G1 before G2 (stacked); G2 after P3 (it edits the same resolvers); P4's `derivePalette`
must call `rampChromaOf`/`primeChromaOf` if it merges after G2, or G2 patches it if P4 is first;
P8 documents groups last.

## Risks

0. **Double application of base chroma (REQ-002, REQ-004).** If `tonal.js` keeps its `b` multiplier
   while the model also passes the absolute target, a group at 30 renders at 9. Detection: AC-004's
   grep and AC-007 (Neutral equals its `chroma 30` ramp). Fallback: none; the multiplier goes.
0b. **Exports and canvas disagree (REQ-002).** `derivePalette` resolving groups differently from
   `projectView` (or not at all) makes the CSS differ from the canvas. Detection: an exports gate
   asserting Neutral's `--neutral-500` equals the canvas 500 hex. Fallback: one shared resolver
   imported by both, never two copies.
0c. **`story.groups` name clash (REQ-010).** A builder naming the document key `groups` collides with
   the curated story field. Detection: review; `clampStory` already reads `s.groups`. Fallback: the
   key is `paletteGroups`, stated in the SPEC.
1. **Retirement leaves a stale caller (REQ-004, AC-004).** `model.mjs` and `exports.js` called
   `identityStops` (both callers removed in #545; the definition stays at `src/engine/semantic.js:356`); a missed one throws at import. Detection: `npm test` at P1 and the AC-004 grep.
   Fallback: none needed.
2. **Rename window (P2..P3) (REQ-011, AC-011).** `prime.mjs` reads `primeChroma ?? keyIntensity` until P3 lands, then
   the fallback is deleted. Detection: a P3 test asserts `keyIntensity` is absent from `DOMAINS` and
   from `DEFAULT_CONTROLS`. Fallback: keep the fallback one more PR.
3. **Cusp-anchored prime on near-achromatic palettes (REQ-051, REQ-052).** For Neutral (chroma 29) `lPrime` is still the
   hue's cusp lightness, which is fine; at `chroma 0` `peakC` still returns a tone, `s = 0`, greys.
   Detection: AC-050 (c) includes `chroma 0`. Fallback: none.
4. **Yellow compression (REQ-051, EX-5). FIRED 2026-09-13, remedied 2026-09-17 (#641), remedy
   REPLACED 2026-09-20 (#681 U6, see the superseding note at the end of this entry).** With
   `lPrime` near 0.9 the three light swatches sit 0.013 apart and may read as duplicates, and a
   positive skew (Warning's `40`) pushes them closer still. Detection: user report (R1 is ratified as
   is) — and the detection signal DID fire, as a user report on 2026-09-13 filed as #641. Measured at
   the time: ten of the sixteen default palettes spanned less than `6 * PRIME_STEP`, the worst being
   Data 5 at 0.2762 through `defaultDocument()` (hueSpace `oklch`, its shipped `chroma`) and 0.2955
   with the raw `role-table.json` pair read as `cam16` at the same chroma — the two hue spaces reach
   different cusp tones, so the same palette has two different anchors. The cause in both: the clipped
   side's lost travel was never handed to the other side. Remedy taken
   (owner ruling option A, 2026-09-17): shortfall REDISTRIBUTION in `primeSteps(lPrime)` — each side
   keeps its own even spacing, and a clipped side's lost travel moves to the unclipped side, capped by
   that side's room. The listed `PRIME_L_MAX` bias fallback was NOT taken: biasing the bound moves
   `lPrime` itself, and `l = key.l` is the mechanism by which REQ-056 makes `prime` reproduce
   `deriveKeyColor`'s hex exactly, so the bias would trade this defect for a worse one. Redistribution
   leaves the anchor untouched and leaves every unclipped palette byte-identical. Gated by the rewritten
   AC-050 (d1)/(d2a)/(d3)/(d4)/(d5)/(d6), which run over both hue spaces.
   Second defect, found while fixing the first and FIXED in the same change (#655, folded into #641 by
   owner ruling 2026-09-17): for yellow-green hues the cusp construction puts `lPrime` ITSELF above the
   old `PRIME_L_MAX` of 0.94 — it peaks at 0.961183 (cam16 hue 109.75, chroma 0.75; the oklch peak is
   the same value near hue 98) — so `prime` was out of bounds before any ladder was built, `roomUp`
   went NEGATIVE, and the three light swatches inverted — reading DARKER than `prime`, not lighter.
   Affected hues under 0.94, per chroma and as the union across chromas `{0, 50, 100}` — cam16: 15 hues
   108..122 at chroma 0, six at 110..115 at chroma 50 and the same six at chroma 100, union 15 hues
   108..122. oklch: 13 hues 96..108 at chroma 0, six at 107..112 at chroma 50, six at 109..114 at
   chroma 100, union 19 hues spanning 96..114. So cam16's 15 is both its chroma-0 count AND its union,
   whereas oklch's 19 is the UNION only — its own chroma-0 count is 13. `oklch` is the product default
   and carries the wider union. Remedy: `PRIME_L_MAX` raised to 0.97 (REQ-051a) and each room floored
   at 0 so travel can never go negative. AC-050 (d4) now asserts ZERO out-of-window anchors across the
   full sweep in both hue spaces.
   Correction to this record as first written (2026-09-17): the inversion was described here as
   "byte-identical before and after #641". That was true only of the LIGHT side. The dark side moved
   substantially under the round-1 redistribution, because the negative `roomUp` credited EXTRA travel
   downward: at hue 112 / chroma 100 `dimmest` went 0.67983 -> 0.40000 (cam16), and the shipped Adia
   `Data 5` went 0.68555 -> 0.40000, then to 0.43000 under the raised ceiling. Only the round-2 ceiling
   and guard make that ladder monotone at all.
   **SUPERSEDED 2026-09-20 (#681 U6, owner ruling Q9; U4 integration).** The redistribute remedy
   recorded above is GONE. It bought a constant `6 * PRIME_STEP` span by making one side of the ladder
   longer than the other, which is the asymmetry the owner's own screenshot finding then flagged:
   `brightest` and `dimmest` did not read 1:1 around `prime`. Q9 replaces it with EQUAL-COMPRESS, in
   CIE L*: both sides take `min(STEP_L, roomUp, roomDown)`, so a clipped ladder is SHORTER and
   symmetric rather than full-length and lopsided. What that does to the compression case, re-measured
   on the shipped engine by `scratchpad/gen-yellow.mjs` (which imports this worktree's own
   `src/engine/prime.mjs` and walks `role-table.json`'s 16 defaults in both hue spaces), is:
   - On the SHIPPED defaults, the compression case is mostly gone at the source, because #681 U1 gave
     every default a stored `anchor` and the ladder now pivots on the anchor's own measured L* rather
     than on a hue's cusp tone, which for yellow-greens sat near white. `Data 5`, the worst case of
     the 2026-09-13 report at 0.2762 / 0.2955 of a possible 0.54, now pivots on `#7E7806` (L* 49.35)
     and spans the FULL 54 L*, identically in both hue spaces, with seven distinct hexes. Only three
     defaults clip at all: Tertiary 52.7805, Danger 49.9212, Warning 46.2664 L*, all on the DARK side,
     all pinned by `test/engine/prime.mjs`'s own `clipped defaults` gate at 0.05 tolerance.
   - Where an anchor IS near a bound, equal-compress is deliberately more aggressive than
     redistribution was. Stripping the anchors and re-running the same 16 on the cusp-identity path,
     `Data 5` spans 9.7699 L* (cam16) and 5.7699 (oklch) instead of borrowing room from the long side.
     That is the ruled trade: a short symmetric ladder, not a long asymmetric one.
   - The one case equal-compress cannot survive on its own is an anchor exactly ON a bound, where a
     zero on the short side binds the long side to zero too and all six non-prime rungs collapse onto
     one hex. That is what U4 pass 2's symmetric widening search fixes, and only for stored anchors:
     measured, a `#FFFFFF` anchor (L* 100, above the ceiling) lands on a pivot of 95.9849 with a
     0.3 L* step and seven distinct hexes, and `#101820` (L* 7.84, below the floor) lands on 12.85
     with a 0.2 L* step. Detection: `test/engine/prime.mjs`'s `symmetry` gate, whose negative control
     runs the SAME sweep against a frozen copy of the pre-#681 redistribute module and requires it to
     exceed a 3 L* measured pixel asymmetry, plus (d1)/(d3)/(d6) and the `clipped defaults` pins.
     Fallback: none; the PRIME_L_MAX bias fallback stays rejected for the reason recorded above.
5. **Hue drift on the outer swatches (REQ-053).** All seven share the anchor's CAM16 hue. Re-stated
   2026-09-20 (#681 U6): that hue is now passed straight to `hctToRgb`, so CAM16 hue is held per rung
   by construction and the residual is 8-bit rounding only (measured: Neutral's rungs hold CAM16 hue
   within ~2.6° of a 267.000 target). The Abney spread has not vanished, it has moved to a quantity
   the ladder never promised to hold: the same rungs span 265.8..271.3° of OKLCH hue at identical
   CAM16 hue and varying tone, which is why AC-050 (e)/(f) measure CAM16 hue, not OKLCH hue.
   Detection: AC-050 (e) chroma-aware budget against the prime pixel. Fallback: none this round; a
   per-swatch re-solve was ruled out on #537 (oscillates at low saturation, shares `tonal.js`).
6. **`collparity` half-applied (P4) (REQ-054, AC-033).** Three literals (`collections.js`, two sandboxes). Detection:
   `test/figma/binder.mjs` `collparity`. Fallback: the P4 checklist.
7. **Figma duplicate collections (P5) (REQ-054, AC-052).** A re-apply that does not find the provenance key creates a
   second `Color Prime`. Detection: AC-052 re-apply assertion. Fallback: adopt-by-name with UI
   confirm, the #494 precedent.
8. **Export size and MCP payload (REQ-030, REQ-057).** +7 tokens per palette is small; no action.
9. **Data-palette risks from 0.1.0 (REQ-020..024, REQ-041)** (hue collisions, count literals, answer-key hand edit,
   marketing drift) stand unchanged.

## Agent verification

New instruments: `test/engine/prime.mjs` (AC-050, with the independent `up`/`down` re-derivation and
pixel-measured hue/saturation as anti-tautology controls); the `intensity-uniform` tonal group; export
gate extensions for the prime group and the `Color Prime` UI3 collection; the plugin cascade extension
for the new collection; a `get_prime` MCP test; a headless-boot lettered group for the strip and the
four sliders. Retained: the `intensity-legacy` byte fixture. Retired: `intensity-spike`,
`identity-stops`. Everything else runs on existing instruments named in the SPEC's Agent verification
section.

- **Amendment (2026-09-16).** The "one shared resolver" this LLD's risk table and Agent verification
  section refer to lives at `src/engine/resolve.mjs`, the group-chroma resolvers imported by both the
  canvas and every export format (`exports.js`'s `derivePalette`), so a palette can never resolve two
  different ways.
- **Amendment (2026-09-20, version 0.4.0; ticket #681 units U6 and U4, tracks SPEC 0.4.0).** The
  `prime.mjs` interface block above described the retired OKHSL-`l` ladder with `PRIME_STEP 0.09` and
  0.3.1's shortfall redistribution. It is rewritten to the construction that shipped: CIE L* as the
  metric, `STEP_L = 9`, Q9 equal-compress (`up === down === min(STEP_L, roomUp, roomDown)`), chroma
  HELD at the anchor's own CAM16 chroma with only `maxChromaInGamut` desaturating a rung, the window
  DERIVED as `[12.25, 96.88]` L* from the two OKHSL greys, U1's verbatim stored-`anchor` branch, and
  U4 pass 2's symmetric widening search. The Components row for the prime system now names `STEP_L`
  in place of the retired `PRIME_STEP`. Risk 4's redistribution narrative is superseded in place and
  its numbers re-measured against the shipped engine rather than reasoned about; Risk 5's Abney
  claim is re-stated in the CAM16 terms the gates now measure in. No build unit is added or changed.
