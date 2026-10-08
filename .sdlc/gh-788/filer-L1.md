<!-- role=filer level=L1 model=sonnet effort=medium -->
## Warnings
None

## PR title
T-0021: Compute layers: one controls resolver, six-layer registry, document layer pins (#788)

## PR body
## Summary
Lands the #788 compute-layers plan on current main as `plan/compute-layers-r2`. U1 to U3 are re-applied byte-neutral: one controls resolver, a six-layer registry and one evaluator. U4 is re-applied on persist schema 10 and export schema 7: document pins, frozen layer versions, presets pinned to latest, and pins stamped into exports. The retired `group-chroma` layer is dropped (T-0014 removed group chroma). U5 is closed as superseded by ADR-031 per the owner's ruling, so CAM16 stays a live hue model and `ramp@1` is the only ramp layer.

## Changes
Step 1, U1 to U3 on main (byte-neutral):
- Adds `src/engine/controls.mjs` with `resolveControls`, replacing both `controlsOf` copies in `model.mjs` and `exports.js`.
- Adds `src/engine/layers.mjs`: `resolveRoles`, `LAYERS` (controls, ramp, prime, roles, type, geometry, all at version 1) and `compute(doc, registry)`.
- `projectView` and `derivedAll` now read one `compute` result.
- Adds `scripts/report-compute-neutral.mjs`, which renders 344 subjects across six surfaces on the base tree and the head tree and diffs every leaf.
- Adds `test/engine/controls.mjs` and `test/engine/layers.mjs`.
- Updates the bundle and MCP-asset file lists.
- Appends ADR-033 before the Quick map. It says R102 is superseded by ADR-031.
- Deliberate move: a raw state with no `hueSpace` sent straight to an exporter now renders `oklch` instead of `cam16`. Hydrated documents and presets always carry `hueSpace`, and 0 of 344 subjects moved.

Step 2, U4 at persist schema 10 and export schema 7:
- Adds `src/engine/layer-pins.mjs` (`LATEST`, `pinsOf`) and `REGISTRY`, `layerAt`, `docPins`, `runOf` and `pinLatest` in `layers.mjs`.
- Adds the frozen test layers `src/engine/layers/test-layer@1.mjs` and `@2.mjs`, with `FROZEN.json` holding their SHA-256 hashes.
- Persist schema is now 10: a v10 stamp writes every layer id at 1 when a stored doc has no `layers` map. `hydrate` clamps pins and drops unknown ids. `presetDoc` lives in `persist.js`, and the preset tile in `app.js` opens through it.
- Export schema is now 7. Line 2 of the CSS, OKLCH, Tailwind, shadcn, Panda and Radix exports carries the pins. JSON has `meta.layers`, DTCG has `com.ultimate-tokens.layers`, UI3 has `$layers`, and the design-system `tokens.json` has `$layers`.
- MCP server version is 0.7.0 and the format is `brand-kit/7`.
- Type and geometry scale functions in `model.mjs` go through `runOf`.
- Adds `test/engine/layer-pins.mjs`. `--migrate` is added to the neutrality tool.
- Updates the schema-7 fixtures and regexes.
- Amends ADR-033 and adds changelog entries.

Step 3, gates: no changes were needed.

## How each part was verified
- Step 1 (verifier L3, pass):
  - Each criterion was observed red at the base and green on the built tree.
  - The neutrality run ended `0 differing cells` over 344 subjects and six surfaces. The `--perturb` control exits 1.
  - Identity-control `--authored`, plain and `--only default-kit`, ended `0 differing cells`.
  - Anchor, exports, model and MCP-package tests, `citations.mjs` and the scope allowlist were green.
  - `npm test` passed all 56 files.
- Step 2 (verifier L3, pass):
  - Red observed at the base for schema 10 and 7, `layer-pins.mjs`, the FROZEN gate, `presetDoc` wiring, the export line-2 stamp, MCP 0.7.0 and the ADR amendment.
  - Neutrality, plain and `--migrate`: 344 subjects hydrated, `0 differing cells`. `--perturb` bites.
  - Identity-control with `--migrate`: `0 differing cells`.
  - Citations were clean and the scope allowlist was clean. `npm test` passed all 57 files.
  - A drafted fail on the conditional v10 stamp was steelmanned and dropped: it fires only on a doc with no `layers` map, like v2's `stampIntensity`.
- Step 3 (builder L3, verifier L2, pass; no code changes):
  - Builder ran, through `gate_lock.py` with `SDLC_GATE_WORKERS=10`: `npm test` (57 files), `npm run build`, and `gate:corpus-tonal`, `corpus-anchor`, `sweep-prime`, `corpus-reset`, `corpus-contrast`, `mode-isolation`, `even-dips` and `chroma-envelope`. All passed.
  - Both byte-neutrality reports ended `0 differing cells`.
  - `npm run smoke` passed.
  - The verifier re-ran `npm test`, `npm run build`, `gate:mode-isolation`, the identity check and the neutrality report. It accepted the other gate results from the builder logs without re-running them.
- Not run: the `gate:sweeps` aggregate. The eight legs ran one at a time.

## Changelog entry
- Compute layers (#788, ADR-033): one controls resolver and a six-layer registry (`controls`, `ramp`, `prime`, `roles`, `type`, `geometry`) evaluated by one `compute`. Documents now carry `layers` pins (persist schema 10), and presets open pinned to the latest layer versions. Exports stamp the pins (export schema 7). The MCP server is 0.7.0 (`brand-kit/7`). Existing documents render identically. One edge case changed: a raw state with no `hueSpace` sent straight to an exporter now renders `oklch`, not `cam16`. CAM16 stays a supported hue model (ADR-031), so `ramp@2` and R102 are closed.

## Follow-ups
- fix-now: `docs/specs/lld-muted-base-key-spikes.md:50` still names `controlsOf` in `model.mjs`; re-point it to `resolveControls`.
- fix-now: `.sdlc/plans/compute-layers.md` is stale after this lands (status approved, U4 unchecked, U5 open, ADR-028 numbering); update it at close.
- fix-now: Restore the gated citation shape for the `layers.mjs` and `controls.mjs` paths in `.claude/skills/adding-export-formats/references/foundations.md` now that the files are tracked.
- fix-now: Remove the leftover probe worktrees under `.worktrees/tmp/planner-L3-gh-788/` and `.worktrees/tmp/planner-L3-gh-788-2/`.
- note: ADR-033 was numbered from the base. `plan/geometry-compound-insets` also writes `## ADR-033`, so whichever branch lands second must renumber its heading and Quick map row.
- note: `docs/specs/` and the `.sdlc/plans/compute-layers-adr-draft.md` R102 text also asked for a `baseIntensity` rename. This plan treated the U5 ruling as closing that half, so `model.mjs` still reads `doc.baseIntensity` (`docControls` maps it to `baseChroma`).
