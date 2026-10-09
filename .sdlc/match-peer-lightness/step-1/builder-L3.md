<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/match-peer-lightness/src/engine/layers/ramp@1.mjs: new frozen file. It has a 5-line `//` header with no blank line, then base `tonal.js` byte for byte except its two import specifiers, now `../hct.js` and `../okhsl.js`.
- src/engine/layers/FROZEN.json: added `"ramp@1.mjs": "f4af3e93...6ddb"` in sorted position.
- src/engine/layers.mjs: imports `paletteStops as paletteStopsV1` from `./layers/ramp@1.mjs`. `LAYERS.ramp` is now version 2, and its `run` is still tonal.js `paletteStops`. `REGISTRY` appends `layer("ramp", 1, ...)` with `paletteStopsV1`. The header comment now names `ramp@1` where it said "none shipped yet".
- src/engine/layer-pins.mjs: `LATEST.ramp` is 2.
- scripts/bundle.mjs: new MODS entry `["rampV1", "src/engine/layers/ramp@1.mjs"]` right after the tonal/derive line, and new KEY entry `"ramp@1.mjs": "rampV1"`.
- scripts/gen-describe-mcp-assets.mjs: `src/engine/layers/ramp@1.mjs` is listed before `src/engine/layers.mjs`.
- test/engine/layers.mjs: c2.1 now asserts `l.version === latestOf(REGISTRY)[id]` (imports `REGISTRY` and `latestOf`). Its ok message says "at their registry latest" instead of "at version 1".
- test/engine/layer-pins.mjs: c4.1-control plants `ramp: LATEST.ramp + 1`. c4.3-clamp wants `ramp: latestOf(TEST_REGISTRY).ramp`, and its message reads "ramp 9 -> 2".
- test/engine/anchor.mjs: imports `presetDoc`. The three `hydrate({ ...preset` sites (mode sweep, spikeDocs, hueSpaceBound base) now use `presetDoc`. The lone-spike control also rewrites `./layers/ramp@1.mjs` to its absolute file URL.
- test/engine/mode-isolation-gate.mjs: imports `presetDoc`, and the preset fingerprint leg uses it. The default-kit leg stays on `hydrate`.
- test/engine/curated-contrast.mjs: imports `presetDoc` instead of `hydrate`. `presetDoc(preset)` replaces `hydrate(preset)`, and the header comment is updated to match.
- test/ui/model.mjs: the self-consistency check passes `{ layers: d.layers }` to `exportRadixModule`.
- src/ui/describe-mcp-assets.js, figma/plugin/ui.html: regenerated with the `npm test` generator prefix.

## Checks
- `redck.py record` before the first edit: exit 0, 4 pre-edit controls recorded red.
- AC1 (red) registry/LATEST/defaultDocument node one-liner: exit 0.
- AC2 (red) ramp@1 body hash equals rewritten base tonal.js, header all `//`: exit 0.
- AC3 (red) `node test/engine/layers.mjs` c4.4-frozen names ramp@1.mjs: exit 0. Line read: "3 frozen file(s) match FROZEN.json: ramp@1.mjs, test-layer@1.mjs, test-layer@2.mjs".
- AC4 (red) `presetDoc(` grep in the three gate files: exit 0.
- AC5 (guard) `report-preset-fidelity --identity-control --authored --base 5b299d6d`: last line "0 differing cells", exit 0.
- AC6 (guard) `report-compute-neutral --base 5b299d6d`: last line "0 differing cells", exit 0.
- AC7 (guard) gate_lock `npm run gate:mode-isolation`: pass, exit 0. Fingerprints perceptual 22a43e80320a8c95 and peak 5f0eabbbe9b3c154 match the fixture.
- AC8 (guard) loop over layers, layer-pins, anchor, curated-contrast, exports, ui/model, mcp/describe-mcp-package and repo/citations: all exit 0. In anchor.mjs the lone-spike negative control still bites: 4 spikes.
- AC9 `node scripts/bundle.mjs` then grep `__M.rampV1` in dist/ultimate-tokens.html: exit 0.
- AC10 (guard) diff scope against base: exit 0.
- Not a named criterion: `npm test` exit 1, 1 of 60 files red. The red file is `repo/em-dash.mjs`, on `.sdlc/ui-standardization/handoff.md:24`. The same command fails the same way at base 5b299d6d in a throwaway worktree (since removed). That file was committed in a268cd2a and this step does not touch it. The tree is clean after `npm test`, with only this step's 14 paths changed.

## Notes
- `ramp@1.mjs`'s header cites ADR-036, as the handoff specifies. `docs/references/decision-records.md` currently ends at ADR-035, so a later step must write ADR-036. `test/repo/citations.mjs` passes now.
- The `npm test` em-dash red is inherited from base, outside this step's scope, and in another ticket's handoff (T-0044). Repairing it is for that ticket or the conductor.
- Left on `hydrate`, as the handoff says: anchor.mjs `:1031`/`:1192`/`:1274-1288`/`:1366`/`:1452` (documents built from `defaultDocument()`), and `:1307`'s second `hydrate({ ...base, ... })`, whose `base` already carries the latest pins from `presetDoc`.
