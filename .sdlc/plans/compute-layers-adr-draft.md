---
status: proposed (draft, not in docs/reference/references/decision-records.md until the owner approves)
written: 2026-10-03
head: add40292 (`main`)
drivers: R99 (2026-10-03, owner, verbatim: "Ultimate Tokens ultimately should be a system of versioned algorithms and compute layers that are chained together in various ways"), R98 (computation first, no overrides or legacy support layers)
plan: .sdlc/plans/compute-layers.md
---

# ADR draft: compute layers, versioned pure functions chained into a brand kit

## Context

Today the pipeline is a set of pure engines plus two hand-built drivers that call them. Nothing names a stage, nothing carries a stage version, and the same resolution is written twice. Survey at add40292 (read-only):

| Stage | Inputs | Outputs | Implicit version knowledge | Hidden coupling | Overrides, special cases, shims |
|---|---|---|---|---|---|
| Controls resolve | a doc or export state | the tonal controls object | `DEFAULT_CONTROLS` in `src/engine/tonal.js` is the only defaults table | two copies: `controlsOf` in `src/ui/model.mjs` and `controlsOf` in `src/engine/exports.js`; the names differ (`baseIntensity` vs `baseChroma`, comment "AC-004 bars it") | `hueSpace` defaults differ: model.mjs uses `ENGINE_DEFAULT_CONTROLS.hueSpace`, exports.js hard-codes `"cam16"` ("a raw legacy state"); `src/ui/persist.js` `DOMAINS.hueSpace` defaults `"oklch"`; `src/ui/app.js` `hydrateStoredDoc` stamps pre-hueSpace stored sets to cam16 |
| Group chroma | palette, `paletteGroups`, controls | ramp chroma, prime chroma | `GROUP_DEFAULTS` in `src/ui/persist.js` (material 30, R96 moves it to 100) | `src/engine/resolve.mjs` `rampChromaOf` / `primeChromaOf` are shared, but `paletteGroup()` (the by-name default, Neutral to material) lives in `src/ui/model.mjs` and `paletteGroupOf` again in `src/engine/exports.js` | locked group (Data) ignores the per-palette `primeChroma` override (`primeChromaOf`) |
| Hue mapping | hue, `hueSpace` | CAM16 hue | `effHue` (`src/engine/tonal.js`), `oklchToCam16Hue` (`src/engine/hct.js`) | every tonal path branches on `controls.hueSpace === "oklch"` (5 sites in tonal.js) | the cam16 branch exists only for legacy docs |
| Tonal ramp | palette `{hue, chroma, skew, lift, hueShift, cuspPull, anchor}`, controls, stop list | 19 or 25 stops `{hex, rgb, chroma, maxc, tone}` | the R69, #701, #725 rulings live in comments; the ramp's "version" is the git sha | `paletteStops` dispatches on `toneMode` (11 references; an unset mode differs from `"even"` in `chromaEnvelope`, noted at `paletteStops`); `anchorChromaBasis` `climb` flag splits even from perceptual | `dampAmp > 0` "authored overrides (Adia, C6's named carve-out)" in `paletteStops` and the peak joint cap; anchored vs unanchored branches (`paletteStopsAnchored`, `okhslStops` anchored branch); `floorRef` deferrals to #766 |
| Prime ladder | palette, controls with resolved prime chroma | 7 swatches | `src/engine/prime.mjs` constants (`STEP_L`, `PRIME_L_MIN`) | independent of the ramp by design | none |
| Neutral and relative derive | key samples | hue, chroma seeds | `src/engine/derive.mjs` `RELATIONSHIPS` | called only from the UI | none |
| Roles | palette slug, 25-stop ramp, controls, `roleOverrides` | 53 roles, light and dark refs and hexes | `src/engine/semantic.js` `semanticRoles`, mirrored by the Figma `code.js` table and `docs/reference/data/role-table.json` (parity-gated) | the chain `semanticRoles` then `applyAccentRef` then `applyOnColorContrast` then `applyRoleOverrides` is written twice: `projectView` (`src/ui/model.mjs`) and `derivePalette` (`src/engine/exports.js`) | `roleOverrides` (per-doc per-role re-point) and `onColorMode` "fixed" opt-out |
| Type | `doc.type` (treatment, bodyBase, fonts, overrides, modes) | `typeScale` categories by step | `TYPE_TREATMENTS`, `DEFAULT_TYPE` in `src/engine/type.mjs` | per-mode scales assembled in `src/ui/model.mjs` (`typeScaleFor`, `typeModeScales`, `modeTierNudge`) | `tokenOverrides` per-cell size and height, `modeTierNudge` |
| Geometry | `doc.geometry`, plus a type scale | geometry steps | `GEOMETRY_TREATMENTS`, `RAMP_LADDER = "linear4"` in `src/engine/geometry.mjs` | composes from Type's `UI-control` voice (`geomScale` `opts.typeScale`); the caller (`geometryScale`, `geomScaleFor` in `src/ui/model.mjs`) must pass the matching mode's type scale | per-cell font override wins over the composed size (`geomScale`, `ovF`) |
| Exports | resolved state plus derived palettes | 10 formats plus the design-system bundle | `EXPORT_SCHEMA_VERSION = 3` (`src/engine/exports.js`), stamped in every format | `derivedAll` re-derives every palette instead of taking the view `projectView` already computed | none beyond the controls shim above |
| Persist | a stored snapshot | a hydrated doc | `CURRENT_SCHEMA_VERSION = 6`, `RENAME_MAPS`, `DROPPED_KEYS` (`src/ui/persist.js`) | `GROUP_DEFAULTS` and `DOMAINS` hold engine defaults in the UI layer | field name `baseIntensity` kept as "a deliberate legacy holdover"; v4 `intensity` drop reporting |

Reading: the algorithms are already pure and mostly DOM-free; what is missing is identity. A stage's behaviour is pinned only by the git sha, a behaviour change (R69, R94) silently changes every saved doc, and two drivers re-assemble the same chain with drifted defaults.

## Decision (proposed)

1. A layer is a record `{ id, version, inputs, outputs, run }` in one registry, `src/engine/layers.mjs`. `run` is a pure function of its declared inputs (no DOM, no storage, no reads outside its arguments). `id` is a stable kebab name (`controls`, `group-chroma`, `ramp`, `prime`, `roles`, `type`, `geometry`), `version` an integer that bumps whenever any output changes for any input (byte-level, measured by the existing fixture and report gates). Inputs and outputs are named keys with a shape note, checked at registration by a test, not at runtime.
2. Chaining is a declared graph, not driver code: a layer names the outputs it consumes (`geometry` consumes `type.scale`; `roles` consumes `ramp.stops`; `ramp` consumes `controls` and `group-chroma`). One evaluator, `compute(doc, registry)`, walks the graph once and returns every output. `projectView` and `derivedAll` both become thin views over that one result, so the canvas and every export cannot diverge.
3. A document pins layers: `doc.layers = { ramp: 3, roles: 1, ... }`. A fresh doc pins the latest of each. Per R98, the registry carries only the latest version of each layer: a doc pinned to an older version is upgraded on load to the latest and the upgrade is reported (the `DROPPED_KEYS` pattern), never rendered through an old code path. The pin is then a provenance record and a change detector, not a compatibility layer. Whether old versions should stay runnable is an owner decision (Q1 below).
4. Exports stamp the layer pins next to `EXPORT_SCHEMA_VERSION`, so a kit says which algorithms produced it.
5. Overrides are not layers. Per R98 a per-cell or per-role override is user data applied by one named layer (`roles` applies `roleOverrides`; `type` and `geometry` apply `tokenOverrides`), never a branch inside an algorithm. Existing carve-outs inside algorithms (the `dampAmp > 0` Adia carve-out, the cam16 `hueSpace` branch) are listed as debt for later phases, each removed under its own ruling.

## How in-flight work fits

- #766 floorref-hue (approved plan, U2 in re-diagnosis, owner question `.sdlc/questions/floorref-hue-U2-rule.md`): lands as written; when the registry exists, its change is one `ramp` version bump. No dependency either way.
- #785 pane-context U2 (the R94 damper, `GROUP_DEFAULTS.material` 30 to 100): lands as written, before Phase 2. Its "one multiply after the at-100 render" is the first change that is cleanly a layer on its own (`group-chroma` scales `ramp`'s output); Phase 3 may lift it out of `tonal.js` into its own layer without changing a byte.
- R98's "no migration" for U2 is consistent with this ADR: pins upgrade, they do not preserve.

## Alternatives rejected

| Alternative | Why rejected |
|---|---|
| Keep old layer versions runnable forever (true per-doc reproducibility) | contradicts R98 (no legacy support layers); every past ramp revision (R69, #701, #725, R94) would stay live code. Kept open as Q1 only because R99 says "versioned" |
| One global "engine version" instead of per-layer versions | Type and Geometry change on a different cadence from the ramp; one number cannot say which part of a kit moved |
| Semver strings per layer | nothing consumes minor or patch; an integer that bumps on any output change is checkable by the fixture gates |
| A plugin or dynamic-import layer system | zero-runtime-deps and the single-file bundle (`npm run build`, `figma/plugin/ui.html`) need a static registry |
| Runtime schema validation of layer inputs | cost on every render for a check a test can make once |
| Rewrite all engines into layers in one change | blast radius over the whole tree with #766 and #785 in flight; phased below |

## Owner decisions

- Q1: pins upgrade on load (R98 reading, recommended) or old versions stay runnable (R99 "versioned" reading)?
- Q2: does an export stamp layer pins (recommended), and is that an `EXPORT_SCHEMA_VERSION` bump to 4?
- Q3: the cam16 `hueSpace` branch and the `baseIntensity` field name are legacy shims under R98; remove them in Phase 3 (recommended) or keep?
