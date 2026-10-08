<!-- role=builder level=L4 model=opus effort=xhigh -->
## Status
done

## Changes
- `src/engine/layer-pins.mjs` (new): `LATEST` for six ids (no `group-chroma`) and `pinsOf`.
- `src/engine/layers.mjs`: adds `layer(id, version, ...)`, `REGISTRY`, `latestOf`, `layerAt`, `docPins`, `runOf` and `pinLatest`. `compute(doc, registry = REGISTRY)` runs each layer at its pin. Palette layers are ramp, prime and roles; type and geometry are mode layers; controls is the document layer. It returns `{ ...documentOutputs, palettes }`. Prime chroma still comes from `primeChromaOf`. Nothing is imported from `src/ui`.
- `src/engine/layers/test-layer@1.mjs`, `test-layer@2.mjs` (new, test-only): the header cites ADR-033 instead of ADR-028.
- `src/engine/layers/FROZEN.json` (new): holds the hashes of those two files.
- `src/engine/exports.js`: `EXPORT_SCHEMA_VERSION` goes 6 to 7. Adds `layerPinsLine` and stamps line 2 in CSS, OKLCH, Tailwind, ShadCN, Panda and Radix. Adds JSON `meta.layers`, DTCG `com.ultimate-tokens.layers` and UI3 `$layers`. The Panda and Radix modules read `opts.layers`.
- `src/engine/ds-export.js`: `tokens.json` gets `$layers: docPins(state)`.
- `src/ui/persist.js`:
  - `CURRENT_SCHEMA_VERSION = 10` with a v10 header paragraph.
  - New RENAME_MAPS entry `{ version: 10, stampLayers: true }`. Its handling in `applyRenameMaps(snapshot, drop, latest)` writes every id at 1 when the doc has no `layers` map.
  - `hydrate(snapshot, { latest = LATEST })` clamps through `pinsOf` and drops unknown ids, reporting them.
  - New `export function presetDoc(preset, { latest })`.
- `src/ui/app.js`: imports `presetDoc` from `./persist.js`; the preset tile calls `openConfigAsSet(presetDoc(preset), ...)`.
- `src/ui/model.mjs`:
  - `defaultDocument().layers = { ...LATEST }`, and `stateOf` sets `layers: docPins(doc)`.
  - `typeScaleFor`, `typeTierScale`, `geomScaleFor` and `geomModeScales` (main's Maison bodies) go through `runOf`.
  - The Panda and Radix modules receive `{ layers: state.layers }`.
  - Unused `typeScale` and `geomScale` imports are removed.
- `mcp/brand-kit-core.mjs`: `SERVER.version` goes to 0.7.0 and its comment to brand-kit/7.
- `scripts/bundle.mjs`: `layerPins` goes before `persist`, plus a KEY entry.
- `scripts/gen-describe-mcp-assets.mjs`: `layer-pins.mjs` added to FILES.
- `scripts/gen-adia-derived-exports.mjs`: rows 2.2.0 / 1.5.0, with the comment citing export schema 7.
- `scripts/smoke-panda.mjs`: passes `{ layers: state.layers }`.
- `scripts/report-compute-neutral.mjs`:
  - Stamp normalization for both trees, printing `normalized <n> on base|head`.
  - New `--migrate` leg printing `migrate: <n> subjects hydrated by head`.
- `test/engine/layer-pins.mjs` (new): the old C4.1 to C4.5 checks re-baselined to v9 docs, `presetDoc` from persist, `BASE_SCHEMA = 6`, and a v10 doc for the clamp check.
- `test/engine/layers.mjs`: step 1's file plus the C4.4 hash gate and its appended-comment control.
- `test/engine/anchor.mjs`: `layer-pins.mjs` added to both data: URL rewrites.
- `test/engine/exports.mjs`: `v = 7`, the Radix line indexes moved, and the shadcn `prime` scan sets the pins line aside.
- `test/engine/fixtures/shadcn-baseline.css`: schema 7 plus the six-id pins line in all 3 fixtures.
- `test/ui/persist.mjs`: the fuzz state gains `layers: { ...LATEST }`, and the v9 round-trip test accepts `schemaVersion >= 9`.
- `test/ui/headless-boot.mjs` (3 `(pe)` regexes), `test/smoke/smoke.mjs` (2 regexes): the pins line is optional.
- `test/figma/plugin.mjs`: schemaVersion 7.
- `test/mcp/{brand-kit,describe-kit-core,describe-mcp,describe-rubric}.mjs`: `brand-kit/7`.
- `test/run.mjs`: TESTS gains `engine/layer-pins.mjs`.
- `docs/references/decision-records.md`: ADR-033 gains "Amendment, step 2 (2026-10-08, #788)", which names `doc.layers`, persist v10, FROZEN.json, `presetDoc` in persist.js, export schema 7 and MCP 0.7.0.
- `CHANGELOG.md`: a 2026-10-08 Changed entry. `docs/references/changelog.md`: a 1.68 entry.
- `docs/references/knowledge-04-export-formats.md`: schema 7 and the six-id pins table.
- `.claude/skills/adding-export-formats/SKILL.md`: now cites ADR-033.
- `.claude/skills/maintaining-brand-kit-mcp/references/{best-practices,foundations}.md`: brand-kit/7 and 0.7.0.
- `docs/reports/2026-08-20-reactivity/0{0,1,2,3}-*.md`: line-number-only citation moves (persist.js and model.mjs lines shifted).
- Regenerated: `src/ui/mcp-assets.js`, `src/ui/describe-mcp-assets.js`, `figma/plugin/ui.html`, `docs/reference/data/adia-{oklch-export.css,radix-export.mjs}`.

## Checks
All runs used `SDLC_BASE_SHA=8811720dcb87a5d8dfaae4752bbfba655e917d1a`, set inline.
- (red) Schema 10 and export +1: exit 0 (b=6, h=7).
- (red) `node test/engine/layer-pins.mjs`: exit 0. It prints `presets 344`, `10/10`, every pass line and every control, then `PASS: layer-pins clears all checks`.
- (red) FROZEN hash one-liner plus `layers.mjs` "match FROZEN.json": exit 0 (`test-layer@1.mjs test-layer@2.mjs bad:`).
- (red) `presetDoc` greps and no `../ui/` import in `src/engine`: exit 0.
- (red) exportCSS lines 1 and 2: `/* ultimate-tokens export schema 7 */` and `/* ultimate-tokens layers controls@1 ramp@1 prime@1 roles@1 type@1 geometry@1 */`, exit 0.
- (red) 0.7.0 in `mcp/brand-kit-core.mjs` and in `src/ui/mcp-assets.js`: exit 0 (after the regen).
- (red) ADR section contains FROZEN.json: exit 0.
- `report-compute-neutral.mjs --base <sha>`: last line `0 differing cells`, exit 0.
  - `subjects 344`, `normalized 8256 on base`, `normalized 15136 on head`.
  - Per surface: projectView 0 of 35387864, figmaBundle 0 of 5944068, brandKit 0 of 961220, dsBundle 0 of 1078355, dsStitch 0 of 203578, dsMake 0 of 692907.
  - With `--migrate`: `migrate: 344 subjects hydrated by head` and `0 differing cells`, exit 0.
  - Controls: `--only default-kit --perturb` exits 1 with `1 differing cells`, with and without `--migrate`. An unknown flag exits 2.
- (guard) The mcp/figma/persist/exports chain as written: exit 0. On an earlier run, before the regen, `brand-kit.mjs` was red because the package.json version was stale; it is green after `gen:mcp-assets`.
- (guard) `report-preset-fidelity.mjs --identity-control --migrate --base <sha> --authored`: `0 differing cells`, exit 0.
- (guard) `node test/repo/citations.mjs`: exit 0, STALE 0. `node scripts/audit-citations.mjs`: exit 0 after the 7 line moves; it exited 1 before them.
- (guard) Scope allowlist: `bad` is empty, exit 0.
- `npm test`: `all 57 test files passed`, exit 0. Afterwards `git status` shows only the files listed under Changes.
- `node test/engine/{controls,anchor}.mjs`, `node test/ui/model.mjs`: exit 0. `node test/repo/em-dash.mjs` and `branding.mjs`: clean.

## Notes
- **The v10 stamp is conditional.** It fires only on a pre-v10 doc with no `layers` object, the same shape as v2's `stampIntensity`. A pre-v10 doc that already carries a map is clamped by `pinsOf` instead. The clamp test therefore uses `schemaVersion: 10`, and the pre-pin test uses a stored doc with `schemaVersion: 9`.
- **`presetDoc` assigns `layers` onto the hydrate result** instead of spreading it, so the non-enumerable `DROPPED_KEYS` report survives.
- **Preset tile path checked over all 343 presets.**
  - Every preset carries `hueSpace`, so `hydrateConfig`'s cam16 legacy stamp cannot newly flip to oklch through `presetDoc`.
  - `hydrateConfig(p)` and `hydrateConfig(presetDoc(p))` differ outside `layers` on 0 of 343.
- **FROZEN.json hashes differ from U4's** because the two test-layer headers now cite ADR-033. The files count as frozen from this landing.
- **`test/ui/persist.mjs` v9 round-trip test** changed from `schemaVersion !== 9` to `!(>= 9)`, because `serialize` now stamps 10.
- **`--migrate` details.**
  - The base-side default kit is `basePersist.hydrate(defaultDocument())`, the same object the non-migrate leg uses. The head side is this tree's `hydrate({ ...defaultDocument(), schemaVersion: 9 })`.
  - The migrate count equals the subject count by construction, and a run with fewer exits 1. A run that ignores the flag never prints the line.
- **Perturb control shows 1 cell now, not 2.** Normalization copies each object, so the shared ramp stop is no longer counted twice. It still bites.
- **`anchor.mjs` dropped the `../ui/persist.js` patch pair** that the cherry-pick brought in, because `layers.mjs` no longer imports persist.
- **`radix-baseline.json` did not move:** the exports test passes against it unchanged.
- **Not run:** `npm run smoke` (it needs Chrome and a build), so the `test/smoke/smoke.mjs` regex edits are untested in a real browser. `npm run build` was not run either; the bundle and `gen:figma-ui` were.
- **Repo state.** The cherry-pick was `git cherry-pick -n d4136c8a`, then the index was unstaged (`git reset -q`). No cherry-pick or sequencer state remains, and nothing was committed. `3b2749b5` was not applied as a commit: its regenerated assets and citation moves were redone by hand against this tree, because its paths (`docs/reference/reviews/`) no longer exist. No throwaway worktree was created.
