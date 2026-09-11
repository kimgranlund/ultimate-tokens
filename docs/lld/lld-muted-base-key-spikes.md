---
doc-type: lld
id: lld-muted-base-key-spikes
status: draft           # draft | approved | superseded  (0.2.0 draft, tracks SPEC 0.2.0; 0.1.0 was approved)
version: 0.2.0
date: 2026-09-11
owner: Kim Granlund
spec: spec-muted-base-key-spikes
scope: feature
audience: builder, reviewer
---
# LLD — Base intensity on the ramp, a per-palette prime system, data hue derivation

Spec: `docs/spec/spec-muted-base-key-spikes.md` 0.2.0 (REQ/AC ids below refer to it). Intent: issues
#503 and #533. Substrate this design leans on and does not restate: `color-math` skill (two ramp
paths, damping multiplier `m`, hue anchors, OKHSL bijection), `adding-export-formats` skill (the
per-format emitter map), `maintaining-figma-plugins` (collections, provenance registry),
`maintaining-brand-kit-mcp`, `persist.js` header (roundtrip and clamp invariants, `RENAME_MAPS`).

Version history: 0.1.0 designed a chroma spike on identity stops (shipped as U1 in #509 and U2).
0.2.0 (ratified 2026-09-11 under #533) removes that spike and adds the prime system as its own
engine module, token group, Figma collection, and editor strip. Units P1..P8 below are the re-cut;
the data-palette units U5..U9 of 0.1.0 stand unchanged.

## Components

| Component | File | Responsibility |
|---|---|---|
| Base intensity | `src/engine/tonal.js` | `intensityAt(stop, palette, controls)` returns `b = clamp01((palette.intensity ?? controls.baseIntensity ?? 100) / 100)` for every stop (REQ-002). Applied in `okhslStops` to `s`, in the even loop to `intended`, and to the stop-500 anchors (REQ-005). The `k` term, the fourth parameter, and `DEFAULT_IDENTITY_STOPS` are deleted (REQ-004) |
| Spike retirement | `src/engine/semantic.js`, `src/ui/model.mjs`, `src/engine/exports.js`, `test/engine/{tonal,semantic}.mjs` | `identityStops` and its callers removed; `paletteStops(palette, controls, stops)` is three-ary again; `intensity-spike` group and `identity-stops` gate deleted; `intensity-legacy` fixture kept and re-asserted (REQ-004) |
| Prime system | `src/engine/prime.mjs` (new, pure) | `primeSwatches(palette, controls)` (REQ-050..053, REQ-056); constants `PRIME_STEPS`, `PRIME_STEP`, `PRIME_L_MIN`, `PRIME_L_MAX` |
| Controls plumbing | `src/ui/model.mjs` | `controlsOf`/`stateOf` thread `baseIntensity`, `primeChroma`; `projectView` adds `palettes[i].prime`; `brandKit` adds `prime`; `tokenCount` adds 7 per enabled palette (REQ-057) |
| Persistence | `src/ui/persist.js` | `DOMAINS.primeChroma`, `clampPalette` optional `primeChroma`, `CURRENT_SCHEMA_VERSION = 3`, `RENAME_MAPS` entry `{version: 3, renameControls: {keyIntensity: "primeChroma"}}` (REQ-010, REQ-011) |
| Collections | `src/engine/collections.js` | `COLLECTIONS.colorPrime = "Color Prime"` (R3); both sandbox literals mirror it, diffed by the `collparity` gate |
| Emitters | `src/engine/exports.js` | `derivePalette` gains `prime` (seven entries); `cssFrom`, `exportJSON`, `exportDTCG`, `exportUI3`, `exportTailwind` emit the group (REQ-054); `exportShadcn` untouched |
| DS bundle | `src/engine/ds-export.js` | `prime` block per family in `tokens.json`; "Prime swatches" section in DESIGN.md (Claude Design, Stitch, Make profiles) |
| MCP | `mcp/brand-kit-core.mjs` | `get_prime(slug)` tool + `brand://palette/{slug}/prime` resource over `kit.palettes[i].prime` |
| Figma plugin apply | `figma/plugin/` (generated `ui.html` from the app), `src/ui/figma-apply*.js` (whichever module builds the apply message) | Creates or finds `Color Prime` by provenance registry key, one `Base` mode, `{n}/{step}` variables; the binder reads nothing from it this round |
| UI | `src/ui/sections/color.js`, `src/ui/styles.css` | Global tab "Base chroma" + "Prime chroma" sliders next to Vibrancy; palette inspector "Intensity" + "Prime chroma" override sliders next to Cusp pull; `.key-strip` in `renderRampsScene` before `.ramp-strip` from `vp.prime` (REQ-032, REQ-034) |
| Data palettes | `src/engine/data-hues.mjs`, `src/ui/model.mjs`, `role-table.json` | Unchanged from 0.1.0 (U5..U9) |

## Interfaces

```js
// tonal.js (P1)
DEFAULT_CONTROLS.baseIntensity = 100;
export function intensityAt(stop, palette, controls) {            // stop kept for signature stability
  return Math.min(1, Math.max(0, ((palette.intensity ?? controls.baseIntensity ?? 100) / 100)));
}
export function paletteStops(palette, controls, stops);            // three-ary again
export function hueAnchorFrac(palette, controls);

// prime.mjs (P2) — pure; imports effHue/hueAnchorFrac-free helpers from hct.js, okhsl.js, tonal.js
export const PRIME_STEPS = ["brightest", "brighter", "bright", "prime", "dim", "dimmer", "dimmest"];
export const PRIME_STEP = 0.09, PRIME_L_MIN = 0.14, PRIME_L_MAX = 0.94;   // R1
export function primeSwatches(palette, controls)
  -> [{ step, l, s, hue, rgb: [r,g,b], hex, oklch: [L,C,H], inGamut: true }] // length 7, lightest first
// Algorithm:
//   baseHue = effHue(palette.hue, controls.hueSpace, (palette.chroma ?? 0) / 100)
//   lPrime  = okhslLAt(peakC(baseHue).tone)              // the key colour's lightness (REQ-051)
//   up = min(PRIME_STEP, (PRIME_L_MAX - lPrime) / 3); down = min(PRIME_STEP, (lPrime - PRIME_L_MIN) / 3)
//   l[i] = i < 3 ? lPrime + up * (3 - i) : lPrime - down * (i - 3)
//   pc = (palette.primeChroma ?? controls.primeChroma ?? 100) / 100
//   s  = clamp01((palette.chroma / 100) * pc)            // REQ-052, no damping
//   hOk = controls.hueSpace === "oklch" ? solveOkhslHue(palette.hue, s, lPrime) : rgbToOkhsl(hctToRgb(baseHue, pk.c, pk.tone).rgb).h
//   hue[i] = hOk + hueShift * (hueSameDir ? -|t| : t), t = (i - 3) / 3     // REQ-053
//   rgb[i] = okhslToRgb(hue[i], s, l[i]); oklch via rgbToOklch (float), hex via the 8-bit rgb
// okhslLAt and solveOkhslHue become named exports of tonal.js (they are module-private today).

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
{ schemaVersion: 3, baseIntensity: 100, primeChroma: 100,
  palettes: [ { ..., intensity?: 0..100, primeChroma?: 0..100 }, ..., { name: "Data 1", ... } ] }
```

Migration (REQ-011): `applyRenameMaps` handles the v2 stamp (`baseIntensity: 100` when absent, kept)
and the v3 control rename (`keyIntensity` moved onto `primeChroma` unless `primeChroma` already
exists; the old key deleted). `DOMAINS` no longer lists `keyIntensity`, so a v3 snapshot that still
carries it is dropped by the allowlist and reported through `DROPPED_KEYS` (loud, per TKT-0455).

Token counts, default document: 16 palettes x 96 = 1,536 tokens. Figma: Color Primitives 576, Color
Roles 848 x 2 modes, Color Prime 112 x 1 mode.

`role-table.json` is untouched by the prime system: prime tokens are not roles and have no answer
key there. Their answer key is the `prime.mjs` verifier's independent re-derivation (AC-050 d).

## Build units (each one PR, `npm test` green at its boundary, parity gates never red between PRs)

| # | Unit | Files | Size | Parity note |
|---|---|---|---|---|
| P1 | Retire the ramp spike: delete `identityStops`, `DEFAULT_IDENTITY_STOPS`, the fourth parameter, the `k` term; `intensityAt` returns `b`; callers in `model.mjs`/`exports.js` drop the set; `intensity-spike` group and `identity-stops` gate removed; new `intensity-uniform` group (AC-002/AC-004); `keyIntensity` stays in `DEFAULT_CONTROLS`/`DOMAINS` as an inert control until P3 so nothing else moves | `tonal.js`, `semantic.js`, `model.mjs`, `exports.js`, `test/engine/tonal.mjs`, `test/engine/semantic.mjs` | small | Output byte-identical at 100 (the retained fixture proves it); closes the visible patchy-ramp defect at any other intensity. `code.js` regenerates with no role-table diff |
| P2 | Prime engine: `src/engine/prime.mjs` + `test/engine/prime.mjs` (AC-050 a..j, registered in `test/run.mjs`); `okhslLAt`/`solveOkhslHue` exported from `tonal.js`; reads `controls.primeChroma ?? controls.keyIntensity` during the P2..P3 window so the module works before the rename lands | `prime.mjs`, `tonal.js` (exports only), `test/engine/prime.mjs`, `test/run.mjs` | big | Pure addition, nothing consumes it yet |
| P3 | Persist + model: schema v3 rename `keyIntensity` to `primeChroma`, `palette.primeChroma`, `DOMAINS`; `controlsOf`/`stateOf`; `projectView.palettes[i].prime`; `brandKit.prime`; `tokenCount` +7; the P2 fallback read removed | `persist.js`, `model.mjs`, `test/ui/persist.mjs`, `test/ui/shell.mjs` | small | `tokenCount` literal in `shell.mjs` and the footer readout move here (89 to 96); MCP tests that count kit keys are checked |
| P4 | Emitters: CSS/OKLCH/JSON/DTCG/UI3/Tailwind prime group + `COLLECTIONS.colorPrime`; export gates (AC-051); the two sandbox literals + `collparity` | `exports.js`, `collections.js`, `figma/plugin/code.js` literal, `figma/binder/figma-semantic-binder/code.js` literal, `test/engine/exports.mjs`, `test/figma/binder.mjs` | big | `collparity` must see all three sites in the same PR; the binder does not bind prime tokens so `bindingPlan` is unchanged |
| P5 | Figma apply: the plugin creates/updates `Color Prime` (provenance key, `Base` mode); plugin cascade gate extended (AC-052); `FIGMA_MIGRATIONS` entry not needed (new collection, no rename) | the app's Figma apply module, `figma/plugin/code.js`, `test/figma/plugin.mjs`, `scripts/gen-figma-ui.mjs` if it lists collections | small | `gen:figma-ui` and `bundle` rerun under `npm test` |
| P6 | DS bundle + MCP: `prime` block and DESIGN.md section across the three profiles; `get_prime` tool + resource; gates (AC-031 prime part, AC-053) | `ds-export.js`, `mcp/brand-kit-core.mjs`, `mcp/README.md`, `test/engine/exports.mjs`, `test/mcp/brand-kit.mjs` | small | The design-system-checker rubric may need a row for the prime section |
| P7 | UI: "Prime chroma" relabel wired to `primeChroma`, per-palette "Prime chroma" override slider, `.key-strip` from `vp.prime` (seven `<i>` with `data-step`, label, `style="background:{hex}"`, reusing the ramp-strip hover/footer handlers); shim group for AC-032 + AC-034 | `sections/color.js`, `styles.css`, `test/ui/headless-boot.mjs` | small | No engine or count change |
| P8 | Docs sweep: knowledge-02 (base intensity + prime system), knowledge-03 (prime group is primitives tier, roles do not alias it), knowledge-04 (prime in every format), CHANGELOG, README, `CLAUDE.md`, consumer plugin `color-tokens`, marketing fact sheet via `marketing-manager-agent`; AC-040 greps | docs only | small | No test literals |

Data-palette units U5..U9 from 0.1.0 stand as written there (U5 shipped in #508). Ordering: P1 first
(it fixes the shipped defect and is independent of everything else); P2 after P1; P3 after P2; P4 after
P3; P5 and P6 after P4, independent of each other; P7 after P3 (it needs `vp.prime` and `primeChroma`);
P8 last. U6..U9 interleave freely after U5; U6's `tokenCount` literal must be written against whichever
per-palette count (89 or 96) is current at its merge. P2 and U6 can run in parallel worktrees.

Sizes: P1 small · P2 big · P3 small · P4 big · P5 small · P6 small · P7 small · P8 small.

## Risks

1. **Retirement leaves a stale caller (REQ-004, AC-004).** `model.mjs:707` and `exports.js:222` call
   `identityStops`; a missed one throws at import. Detection: `npm test` at P1 and the AC-004 grep.
   Fallback: none needed.
2. **Rename window (P2..P3).** `prime.mjs` reads `primeChroma ?? keyIntensity` until P3 lands, then
   the fallback is deleted. Detection: a P3 test asserts `keyIntensity` is absent from `DOMAINS` and
   from `DEFAULT_CONTROLS`. Fallback: keep the fallback one more PR.
3. **Cusp-anchored prime on near-achromatic palettes.** For Neutral (chroma 29) `lPrime` is still the
   hue's cusp lightness, which is fine; at `chroma 0` `peakC` still returns a tone, `s = 0`, greys.
   Detection: AC-050 (c) includes `chroma 0`. Fallback: none.
4. **Yellow compression (REQ-051, EX-5).** With `lPrime` near 0.9 the three light swatches sit
   0.013 apart and may read as duplicates. Detection: human (R1). Fallback: lower `PRIME_L_MAX` bias
   or a minimum step; both are one-constant changes gated by AC-050 (d).
5. **Hue drift on the outer swatches (REQ-053).** `solveOkhslHue` anchors only `prime`; the ±0.27
   `l` excursions drift by the OKHSL/OKLCH Abney residual (~2° worst case, blues). Detection: AC-050
   (e) 2° budget. Fallback: solve per swatch (seven Newton loops, cheap).
6. **`collparity` half-applied (P4).** Three literals (`collections.js`, two sandboxes). Detection:
   `test/figma/binder.mjs` `collparity`. Fallback: the P4 checklist.
7. **Figma duplicate collections (P5).** A re-apply that does not find the provenance key creates a
   second `Color Prime`. Detection: AC-052 re-apply assertion. Fallback: adopt-by-name with UI
   confirm, the #494 precedent.
8. **Export size and MCP payload.** +7 tokens per palette is small; no action.
9. **Data-palette risks from 0.1.0** (hue collisions, count literals, answer-key hand edit,
   marketing drift) stand unchanged.

## Agent verification

New instruments: `test/engine/prime.mjs` (AC-050, with the independent `up`/`down` re-derivation and
pixel-measured hue/saturation as anti-tautology controls); the `intensity-uniform` tonal group; export
gate extensions for the prime group and the `Color Prime` UI3 collection; the plugin cascade extension
for the new collection; a `get_prime` MCP test; a headless-boot lettered group for the strip and the
four sliders. Retained: the `intensity-legacy` byte fixture. Retired: `intensity-spike`,
`identity-stops`. Everything else runs on existing instruments named in the SPEC's Agent verification
section.
