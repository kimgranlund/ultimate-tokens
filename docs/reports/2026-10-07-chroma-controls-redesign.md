# Chroma controls redesign: before and after (2026-10-07)

Evidence for T-0014 (#804) and ADR-030 in `docs/references/decision-records.md`. The chroma controls
became per-palette Base chroma times two global k factors (Base chroma and Prime chroma, both default
100), the canvas group chroma layer was removed with a v8 hydrate fold, the anchored prime middle
follows Prime chroma, and the global vibrancy default moved from 0 to 50. This report is the ruling
record for user decision 4: the user rules on it before the change lands.

## Command

```
node scripts/report-preset-fidelity.mjs --identity-control --migrate --authored --base "$(git merge-base HEAD main)"
```

- Base: `git merge-base HEAD main` = `1da44336db5b2d7465ac30a617ec7422b8251afc`, the #807 squash
  (#778 chroma envelope closed form and #806 Semantic Mapping tidy). No other lane was merged into
  this one after that fork point; T-0013 (#778) is already in the base through #807.
- Head: `plan/prime-anchor-follows-chroma` at `e75525002e9d90125af1284dce546ef6006614e7` (steps 1
  to 3) plus this step's records and the `mode-isolation` re-capture below. This step changed no
  engine or UI file, so the reading is the step 3 tree's.
- Subjects: the base tree's 8 category files (343 documents, 3,780 palettes) and the default kit
  (16 palettes), 3,796 palettes, 25 export stops each, 94,900 cells per tone mode.
- `--migrate`: each corpus document is the base tree's raw preset, hydrated by the base `hydrate` on
  the base side and by this tree's `hydrate` (the v8 fold) on the head side. The default kit is the
  base `defaultDocument()` on the base side and this tree's `hydrate` of that same document stamped
  `schemaVersion: 7` (a saved v7 kit) on the head side. `--authored` keeps every `anchor`.
- The script exits 1: its exit code is the ramp-cell contract (any differing cell), and the
  perceptual cells differ by design (vibrancy 0 to 50). The criteria read the printed lines.
- Run time: 2 min 20 s (one run, 139.9 s user).
- Gates, each through `gate_lock.py run` with `SDLC_GATE_WORKERS=10`: `npm test` (4 min 32 s, 54
  files), `npm run build` (2 min 30 s, lock wait included) and `npm run gate:sweeps`. The sweeps ran
  as their 8 legs, one `gate_lock.py run --name sweeps-<leg> -- npm run gate:<leg>` each, because
  the whole chain is longer than one 10-minute foreground call: corpus-tonal 360 s, corpus-anchor
  226 s, sweep-prime 99 s, corpus-reset 95 s, corpus-contrast 71 s, mode-isolation 34 s, even-dips
  60 s, chroma-envelope 81 s, 1,026 s in total (17 min 6 s), all green after the `mode-isolation`
  re-capture. The first `mode-isolation` run (33 s) was red, see `## Re-pinned gates`.

## Movement

The printed lines:

```
ramp perceptual: 82466 of 94900 cells differ
ramp peak: 0 of 94900 cells differ
ramp even: 0 of 94900 cells differ
prime: 344 of 3796 strips moved
key: 0 of 3796 tiles moved
82466 differing cells
```

- Ramp, peak and even: 0 cells. The v8 fold writes each palette's resolved group base chroma onto
  its own `baseChroma` (written only when it is not 100), and both globals are 100, so
  `rampChromaOf` hands `dampStops` the same number as before for every palette, Adia's
  material 25 / brand 41 / system 32 / data 27 included.
- Ramp, perceptual: 82,466 of 94,900 cells (86.9%). Vibrancy moves lightness toward each hue's cusp
  in perceptual mode only, and a pre-v8 document's vibrancy 0 (the old default) becomes 50. The
  only palettes that cannot move are the 24 that carry their own `cuspPull` (Adia 16, BZZR 7,
  Maison 1), because `palette.cuspPull ?? controls.vibrancy` never reads the global for them;
  the other 3,772 palettes read the new default. The unmoved cells among those are the stops whose
  8-bit hex lands on the same code at both vibrancies (the white end among them).
- Key tiles: 0 of 3,796. At the default Prime chroma k 100 the gallery key tile (`deriveKeyColor`
  through `paletteKeyColors`) is unchanged for every palette, anchored or not.
- Prime strips: 344 of 3,796. Every mover is a saved prime value below 100 that the v8 fold drops
  (user decision 1: the one-time move is accepted, no hidden legacy field). Measured by rendering
  each palette's strip through both trees' `primeSwatches` with each tree's `primeChromaOf` (the
  report's own call shape, base `1da44336` against this tree), then listing the movers and the
  rungs that moved:
  - 342 of the corpus's 343 Neutrals, from the retired Material group prime default 60, none of
    them anchored (the 343rd, Adia's `Neutral`, stored its own `primeChroma` 100 and does not move):
    340 lowercase `neutral` palettes (48 in each of the 7 non-brand categories, 4 in brands) plus
    the Maison and BZZR `Neutral` (brands). 340 move all seven
    rungs; Double Indemnity's `neutral` moves rungs 0, 1, 2, 3 and 5 and the Lake Baikal
    (59° N, January) `neutral` moves rungs 0, 1, 2, 3, 4 and 6, the other rungs landing on the
    same 8-bit code at both chromas.
  - The default kit's Neutral (anchored, Material 60 before): its outer six rungs move to Prime
    chroma 100; rung 3 is the anchor at k 100 on both sides and does not move.
  - Adia Primary, `palette.primeChroma` 99 before: rung 3 moves (the other six land on the same
    codes at 99 and 100).
  - Neutral strips moved in total: 343 (342 curated plus the default kit's); with Adia Primary, 344.

## Migration

The v8 entry in `src/ui/persist.js` `RENAME_MAPS` (`version: 8`, `foldGroups: true`,
`vibrancyDefault: { from: 0, to: 50 }`, `:418-427`) runs once on a document stamped below v8
(`CURRENT_SCHEMA_VERSION = 8`, `:366`):

- `foldGroups` (`:436-465`): (a) every palette without a numeric `baseChroma` takes its group's
  stored base chroma (its valid `group`, else the by-name default, else data), clamped 0 to 100,
  written only when it is not 100; the global `baseIntensity` is never folded in, since before v8
  it never reached a palette. (b) `paletteGroups` and every per-palette `primeChroma` are deleted.
  (c) the globals `baseIntensity` and `primeChroma` are reset to 100.
- `vibrancyDefault` (`:529`): a pre-v8 vibrancy of exactly 0 becomes 50; any other value is kept,
  an absent one takes the domain default 50, and a palette's own `cuspPull` is never touched.

The `DROPPED_KEYS` entries the fold emits, as `{ facet, key, reason }`:

| Facet | Key | Reason | Emitted on this run by |
|---|---|---|---|
| `palette` | `<name>.primeChroma` | removed at schema v8, Prime chroma is one global k factor on every palette (#804) | Adia, all 16 palettes (15 at 100, Primary at 99) |
| `controls` | `paletteGroups` | removed at schema v8, each group's base chroma folded onto its palettes' own baseChroma (#804) | Adia and the v7-stamped default kit |
| `controls` | `baseIntensity` or `primeChroma` | reset to 100 at schema v8, it is now a k factor on every palette and its pre-v8 value never reached one (#804) | none on this run (every subject carried 100 or nothing) |

The vibrancy move emits no `DROPPED_KEYS` entry: the value is rewritten, not removed. The export
schema moved with the document shape: `EXPORT_SCHEMA_VERSION` 5 to 6 (`src/engine/exports.js:55`,
`ultimate-tokens-brand-kit/6`) and the brand-kit MCP server 0.5.0 to 0.6.0
(`mcp/brand-kit-core.mjs:15`).

## Re-pinned gates

Every fixture, bar and allow-list step 3 re-pinned because the vibrancy default moved from 0 to 50.
Each was red with the new engine and the old pin in a throwaway tree (step 3 verifier), so each re-pin
is forced, not chosen. No `tonal.js` constant moved.

| Gate | File:line | Old | New |
|---|---|---|---|
| `oklch-native` worst starter drift bar (user ruling) | `test/ui/shell.mjs:163-165` | 30 RGB | 45 RGB (measured 44.6, worst Neutral, at the shipped vibrancy 50) |
| role-contrast dark floor, Neutral | `test/engine/semantic.mjs:255`, PENDING_U4 `:370`, negative control `:423` | 4.8 | 4.73 (measured 4.7301) |
| role-contrast dark floor, Tertiary | `test/engine/semantic.mjs:258` | 5.6 | 5.5 (measured 5.5148) |
| role-contrast dark floor, Info | `test/engine/semantic.mjs:259` | 4.7 | 4.6 (measured 4.6403) |
| role-contrast dark floor, Success | `test/engine/semantic.mjs:260` | 5.0 | 4.9 (measured 4.9392) |
| role-contrast dark floor, Warning | `test/engine/semantic.mjs:261` | 5.6 | 5.4 (measured 5.4853) |
| role-contrast dark floor, Danger | `test/engine/semantic.mjs:262` | 5.9 | 5.8 (measured 5.8325) |
| role-contrast dark floor, Data 3 | `test/engine/semantic.mjs:265`, PENDING_U4 `:373` | 4.8 | 4.6 (measured 4.6229, the lowest; every floor stays above AA 4.5) |
| panda EX-2 `primary.DEFAULT` | `test/engine/exports.mjs:535` | base `oklch(0.4669 0.1671 258.98)`, dark `oklch(0.5476 0.1923 259.11)` | base `oklch(0.4621 0.1645 258.77)`, dark `oklch(0.5534 0.1923 258.93)` |
| panda EX-2 `primary.hover` | `test/engine/exports.mjs:537` | base `oklch(0.3962 0.1205 259.03)`, dark `oklch(0.6405 0.1518 258.99)` | base `oklch(0.3808 0.1161 259.05)`, dark `oklch(0.6588 0.148 258.89)` |
| panda EX-2 `data-1.DEFAULT.base` | `test/engine/exports.mjs:545` | `oklch(0.5163 0.2329 272.15)` | `oklch(0.5093 0.2338 272.35)` |
| `oncolors` fall-through probe | `test/engine/exports.mjs:195-197` | `probeCtl` at the default vibrancy | `probeCtl` carries `vibrancy: 0` (at 50 the probe reads `probe:950/950`, not the black fall-through) |
| `hue-solver-best` Data 7 / perceptual `l500` | `test/engine/tonal.mjs:533-536` | `0.5399970062712544` | `0.7192231368098202` (s unchanged; still discriminating, 1.0471 deg against 0.2311 deg) |
| `intensity-legacy` fixture | `test/engine/fixtures/tonal-legacy.json`, note `test/engine/tonal.mjs:712-715` | vibrancy 0 render | regenerated by `node scripts/gen-tonal-fixture.mjs "T-0014 vibrancy 50"`: 335 of 400 perceptual cells moved (15 of 16 ramps), 0 even cells |
| C6 (ii) perceptual duplicate allow-list | `test/engine/tonal.mjs:1410`, `:1446-1457` | 30 keys | 32 keys: added perceptual\|36 75&100 and 150&175, perceptual\|270 875&900, perceptual\|250 850&875, perceptual\|60 875&900; removed perceptual\|36 100&125, perceptual\|270 850&875, perceptual\|60 800&825 |
| `group-chroma-damper` perceptual at-100 hash | `test/engine/tonal.mjs:2189-2192` | `517576c558838c97` | `f311872069c3b5b1` (the pre-damper engine 306f9a9e hashes the same at vibrancy 50); peak and even unchanged |
| shadcn baseline | `test/engine/fixtures/shadcn-baseline.css` (T-0014 note `:83`) | vibrancy 0 capture | re-captured: 44 / 38 / 38 lines moved (ALL / BRAND_ONLY / ALL_DATA_OFF), shape and line counts unchanged |
| radix baseline | `test/engine/fixtures/radix-baseline.json` | vibrancy 0 capture | re-captured: 793 / 440 / 478 leaves moved (ALL / BRAND_ONLY / COLLIDING), shape and keys unchanged |
| default-doc ramps fixture | `test/ui/fixtures/default-doc-ramps.json` | vibrancy 0 | regenerated at vibrancy 50 (`gen-ramp-fixture.mjs "T-0014 vibrancy 50"`) |
| `mode-isolation` fingerprint (step 4; a `gate:sweeps` leg, not in `npm test`, so step 3 did not see it) | `test/engine/fixtures/mode-isolation.json` | perceptual `86f6e551dc20e6d7`, captured at `1e3fe1eb` | perceptual `22a43e80320a8c95`, captured at `e7552500` by `node test/engine/mode-isolation-gate.mjs --capture`; peak `5f0eabbbe9b3c154` unchanged |

The `mode-isolation` move is vibrancy alone, not an engine leak: this tree's corpus and default kit,
hydrated at `schemaVersion: 8` with `vibrancy: 0` (so the v8 entry does not lift it to 50), hash
perceptual `86f6e551dc20e6d7` and peak `5f0eabbbe9b3c154`, the old fixture exactly.

The chroma-envelope bars were re-measured at vibrancy 50 and did not move:
`npm run gate:chroma-envelope` prints `curve exact at 438000 stops; residue within TOL at 438000
stops; direction holds in 3 modes`. Adia's committed derived exports (`docs/reference/data/adia-*`)
did not move with the vibrancy default, because every Adia palette carries its own `cuspPull`.

## Follow-ups

- `src/engine/tonal.js:400` and `:1497` comments still say "group base chroma". They are left by user
  decision 5 (T-0014 edits `tonal.js` only at the vibrancy default and its three fallbacks; the
  file's envelope and damping text is T-0013's); a later change to that file rewords them.
- T-0015 (hue space) edits the anchored branches of `primeSwatches` and `deriveKeyColor` after this
  lands; it builds on the k rule ADR-030 records and takes ADR-031.
- `docs/references/decision-records.md` is a serial slice with T-0013: land the two in separate
  merges, ADR-029 (#778) before ADR-030.
- `docs/specs/spec-panda-park-ui-exports.md:491-497` still quotes the three pre-T-0014 EX-2 literals
  (`oklch(0.4669 0.1671 258.98)`, `oklch(0.3962 0.1205 259.03)`, `oklch(0.5163 0.2329 272.15)`);
  no gate reads it. The new values are in the table above.
