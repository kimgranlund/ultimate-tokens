---
doc-type: lld
id: lld-muted-base-key-spikes
status: approved        # draft | approved | superseded
version: 0.1.0
date: 2026-09-11
owner: Kim Granlund
spec: spec-muted-base-key-spikes
scope: feature
audience: builder, reviewer
---
# LLD — Intensity controls in the ramp, identity-stop set from the role table, data hue derivation

Spec: `docs/spec/spec-muted-base-key-spikes.md` (REQ/AC ids below refer to it). Intent: issue #503.
Substrate this design leans on and does not restate: `color-math` skill (two ramp paths, damping
multiplier `m`, hue anchors), `adding-semantic-roles` skill (parity sites), `persist.js` header
(roundtrip and clamp invariants, `RENAME_MAPS`), `docs/reference/color-neutral-derivation.md`.

## Components

| Component | File | Responsibility |
|---|---|---|
| Intensity factor | `src/engine/tonal.js` | `intensityAt(stop, palette, controls, identityStops)` returns `I(stop)` (REQ-002). Applied in `okhslStops` to `s` and in the even loop to `intended`, and to the stop-500 anchors (`s500`, `c500`) (REQ-005) |
| Identity stop set | `src/engine/semantic.js` | `identityStops(roles)`: the sorted set of solid refs of the five identity roles (suffix in `''`, `-dim`, `-bright`, `-low`, `-high`) across `light` and `dark`. Computed from the already-resolved role list (after `applyAccentRef`), no union with any static set: under "single" the prime resolves to 500 only, so the set is `{350,400,500,650,700}` and 450/550 drop out (REQ-004, EX-3, ruled 2026-09-11). Not part of `semanticRoles`; the answer key is untouched |
| Controls plumbing | `src/ui/model.mjs` | `controlsOf` / `stateOf` thread `baseIntensity`, `keyIntensity`; `projectView` and `exports.js` `derivePalette` pass `identityStops(baseRoles)` and `p.intensity` into `paletteStops` |
| Persistence | `src/ui/persist.js` | `DOMAINS` entries, `clampPalette` optional `intensity`, `CURRENT_SCHEMA_VERSION = 2`, a `RENAME_MAPS` entry `{version: 2, stampIntensity: true}` that sets `baseIntensity = 100` when absent (REQ-011) |
| Data hue derivation | `src/engine/data-hues.mjs` (new pure module; `derive.mjs` stays scoped to the New Palette modal per its header) | `deriveDataHues(primaryHue, brandHues, count)` returning `{phi, hues}`; `mintDataPalettes(doc)` in `model.mjs` builds the palette objects (REQ-020..022) |
| Defaults | `src/ui/model.mjs` `DEFAULT_PALETTES`, `docs/reference/data/role-table.json` `defaults` | 16 entries; data entries are recorded numbers computed once by the build and committed (REQ-024) |
| Export hooks | `src/engine/exports.js`, `src/engine/ds-export.js` | `isDataPalette(p)` (`/^data-\d+$/` on the slug); shadcn chart binding; DS `data` tier (REQ-031) |
| UI | `src/ui/sections/color.js` | Two global sliders next to Vibrancy (`color.js:1797`), one per-palette slider next to Cusp pull (`color.js:1654`), the "Add data palettes" and "Re-derive data hues" actions (REQ-032) |
| Binder | `figma/binder/` (generated `code.js`) | No source edit; `NAMES` come from `role-table.json` `defaults`, regenerate runs in `npm test` (REQ-033) |

## Interfaces

```js
// tonal.js
DEFAULT_CONTROLS.baseIntensity = 100;  // ratified 2026-09-11 (H1): no visual change this cycle
DEFAULT_CONTROLS.keyIntensity = 100;
export function intensityAt(stop, palette, controls, identityStops /* Set<number> */) {
  const b = Math.min(1, Math.max(0, (palette.intensity ?? controls.baseIntensity ?? 100) / 100));
  const k = Math.min(1, Math.max(0, (controls.keyIntensity ?? 100) / 100));
  return identityStops && identityStops.has(stop) ? b + (1 - b) * k : b;
}
paletteStops(palette, controls, stops, identityStops = DEFAULT_IDENTITY_STOPS);
// DEFAULT_IDENTITY_STOPS = identityStops(semanticRoles("primary")) = {350,400,450,550,650,700} (accentRef "mode")
// Callers ALWAYS pass identityStops(baseRoles) computed after applyAccentRef; under "single" that is
// {350,400,500,650,700}. The default parameter exists only for callers with no role table (the tonal
// verifier); it is never unioned with the computed set.

// semantic.js
export function identityStops(roles) -> Set<number>   // solid refs only; scrim refs ignored

// data-hues.mjs (new, pure, no DOM, no imports)
export function deriveDataHues(primaryHue, brandHues, count = 8) -> { phi: number, hues: number[] }

// model.mjs
export function mintDataPalettes(doc) -> palette[]      // 8 objects per REQ-022, none if primary absent
export function rederiveDataHues(doc) -> doc            // rewrites hue on palettes whose slug matches /^data-\d+$/
```

Circular tie-in for `tonal.js` importing `semantic.js`: `tonal.js` must not import `semantic.js`
(engines stay independent; the tonal verifier pins controls with no role table). `paletteStops` takes
the set as a parameter with a literal default; a gate in `test/engine/semantic.mjs` asserts
`identityStops(semanticRoles("primary"))` deep-equals `DEFAULT_IDENTITY_STOPS` so the literal cannot
drift from the role table (the same parity posture as the answer key).

Anchor math with intensity (REQ-005):

```js
// okhslStops, oklch branch
const I500 = intensityAt(500, palette, controls, identityStops);
const s500 = clamp01((palette.chroma / 100) * I500 * (1 + dampAmp / 100));
// even path, oklch branch
const intended500 = (palette.chroma / 100) * I500 * (relChroma ? maxc500 : peakC(seedHue).c);
```

`hueAnchorFrac` (the `effHue` seed) also multiplies by `I(500)`; it only seeds the gamut basis, so a
miss there degrades accuracy, not correctness, but keep it consistent.

## Data

Document shape delta (all optional on read, always written by `serialize`):

```js
{ schemaVersion: 2, baseIntensity: 100, keyIntensity: 100,
  palettes: [ { ..., intensity?: 0..100 }, ..., { name: "Data 1", hue, chroma, skew: 0, lift: 0, hueShift: 0, hueSameDir: false, on: true } ] }
```

Migration (REQ-011): `applyRenameMaps` gains a second entry kind. A snapshot with `schemaVersion < 2`
and `baseIntensity === undefined` gets `baseIntensity: 100` before the domain clamp; `keyIntensity`
falls to its default (100) either way, which is inert at base 100 (REQ-003). Nothing else is
translated. The `test/ui/persist.mjs` byte-identical reload gate keeps its existing shape and gains
the EX-6 pair.

`role-table.json` `defaults` grows to 16 rows. The data rows record the derived hues as plain
integers (cam16 space, like the other rows; `defaultDocument` converts through `camHueToOklch` as it
does today). Because the answer key is hand-edited, the build unit that adds them prints the derived
values from `deriveDataHues` and the reviewer checks the JSON against that output.

Counts after the change, default document: 16 palettes x 89 tokens = 1,424 tokens; Figma
primitives 576, roles 848 x 2 modes; `tokenCount` unchanged in formula.

## Build units (each one PR, `npm test` green at its boundary)

| # | Unit | Files | Size | Parity note |
|---|---|---|---|---|
| U1 | Engine: `intensityAt`, `identityStops`, `DEFAULT_IDENTITY_STOPS`, both ramp paths, anchors; `DEFAULT_CONTROLS` at `baseIntensity 100 / keyIntensity 100` (the shipped default, H1) | `tonal.js`, `semantic.js`, `test/engine/tonal.mjs` (pin + 3 new groups + fixture), `test/engine/semantic.mjs` (identity-stops gate) | big | Output byte-identical; no count moves. `code.js` regenerates with no diff in the role table |
| U2 | Persistence: DOMAINS, `clampPalette.intensity`, schema v2 + stamp; `controlsOf`/`stateOf`/`derivePalette` threading | `persist.js`, `model.mjs`, `exports.js`, `test/ui/persist.mjs` | small | Invisible by design (defaults 100) |
| U3 | UI sliders (global x2, per-palette x1) + shim group | `sections/color.js`, `test/ui/headless-boot.mjs` | small | Sliders show 100 |
| U4 | Docs only: knowledge-02 intensity section, CHANGELOG entry, README control list. No default flip (H1); the 45 proposal is filed as a follow-up issue in this unit | `docs/reference/references/knowledge-02-tonal-scale.md`, `docs/reference/CHANGELOG.md`, `README.md` | small | No test literals |
| U5 | `deriveDataHues` + verifier | new `src/engine/data-hues.mjs`, new `test/engine/data-hues.mjs` (registered in `test/run.mjs`) | small | Pure addition; `derive.mjs` untouched |
| U6 | Data palettes in `defaultDocument` + `role-table.json` defaults (16) + count literals (`counts.mjs` DEFAULT_PALETTES, `shell.mjs`, `test/mcp/brand-kit*.mjs`) + `mintDataPalettes` | `model.mjs`, `role-table.json`, `test/ui/counts.mjs`, `test/ui/shell.mjs`, `test/mcp/*.mjs`, `test/ui/headless-boot.mjs` | big | The binder and plugin gates derive from `defaults` and the bundle, so they move by themselves in this same PR; `gen:figma-ui` and `bundle` rerun under `npm test`. H2 ratified 2026-09-11 |
| U7 | Exports: `isDataPalette`, shadcn chart binding, DS `data` tier + DESIGN.md section, export gates | `exports.js`, `ds-export.js`, `test/engine/exports.mjs` | small | Data excluded from neutral/primary fallbacks so the shadcn picks on the default doc are unchanged |
| U8 | UI actions: "Add data palettes (8)", "Re-derive data hues"; shim group | `sections/color.js`, `model.mjs` (`rederiveDataHues`), `test/ui/headless-boot.mjs` | small | Opt-in path for upgraded documents (REQ-012) |
| U9 | Docs sweep: knowledge-03 §3 family list, `CLAUDE.md`, `mcp/README.md`, consumer plugin `color-tokens` prose, marketing fact sheet (via `marketing-manager-agent`), AC-040 grep | docs only | small | No test literals |

U10 (preset open appends data palettes) was dropped by ruling H3 (2026-09-11): presets stay as authored.

Ordering constraints: U1 before U2 (the controls must exist to persist); U2 before U3; U4 any time
after U1 (prose only); U5 before U6; U6 before U7 and U8; U9 after U6. U1 and U5 are independent and
can run in parallel worktrees. Final sequence: U1 (big) · U2 (small) · U3 (small) · U4 (small) ·
U5 (small) · U6 (big) · U7 (small) · U8 (small) · U9 (small).

## Risks

1. **Chroma-target gate on default palettes (REQ-006).** `test/engine/tonal.mjs` `chroma-target`
   compares c500 to `min(target, cm)` on the DEFAULT palettes with its `CTL` pin. Detection: red the
   day a future default flip lands if U1 forgot the `baseIntensity: 100` pin. Fallback: pin in U1, and
   add a parallel run at 45 that asserts the ratio, not the absolute.
2. **Hue anchor drift under intensity (REQ-005, AC-005).** If `s500`/`c500` ignore `I(500)` the key
   stop lands off the set OKLCH hue by up to the Abney residual (~6° blues). Detection: the existing
   `oklch-hue-anchor` gate run at 20/45/100. Fallback: none needed; it is a one-line factor.
3. **Ramp readability.** Discrete spikes make the L*xC analysis graph show a chroma step between 500
   and 550. Not a defect; the knowledge-02 section says so. Detection: user report. Fallback: a
   `keyWidth` neighbour falloff is a possible later control, out of scope (Non-goals).
4. **Data hue collisions on hue-clustered brands.** Seven brand hues inside a 90° arc leave the best
   `phi` with a small min distance. Detection: `deriveDataHues` returns the score; the UI can show it.
   Fallback: the user edits hues; nothing breaks.
5. **Half-applied palette count (REQ-041).** The classic miss is a literal in `test/mcp/`. Detection:
   `npm test`. Fallback: the U6 checklist above lists every literal.
6. **Answer-key hand edit (REQ-024).** The 8 data rows in `role-table.json` are typed by hand.
   Detection: the `shell.mjs` defaults gate compares ramps between `defaultDocument` and `defaults`
   row by row, so a wrong number goes red. Fallback: paste from the U6 script output.
7. **Export size.** CSS and JSON roughly double at 16 palettes. Detection: none required. Fallback:
   users disable data palettes (`on: false` drops them from every export, AC-U2).
8. **Marketing and fact-sheet drift (REQ-040).** Counts appear in `docs/marketing/`. Detection:
   AC-040 grep. Fallback: U9 routes through `marketing-manager-agent`.

## Agent verification

New instruments this design needs: the U1 byte-diff fixture (`test/engine/fixtures/`, generated by a
script from the pre-change engine at a pinned commit) and the three tonal groups; the `data-hues.mjs`
data-hue gate with its brute-force re-derivation; two headless-boot lettered groups (U3 sliders, U8
actions). Everything else runs on existing instruments named in the SPEC's Agent verification
section: the tonal pin, persist roundtrip, the `shell.mjs` defaults gate, the export leaf and shadcn
gates, and the binder and plugin cascades, which derive their expectations and need no literal edits.
