---
status: draft
ticket: none yet (the Orchestrator mints one kind:feature issue per adapter X3 once the owner approves the ADR draft)
priority: P2
lane: color-engine then editor-ui (`src/engine/` new `layers.mjs`, `controls.mjs`, `layers/<id>@<n>.mjs`, `src/engine/exports.js`, `src/engine/tonal.js` (U5), `src/ui/model.mjs`, `src/ui/persist.js`, `src/ui/sections/color.js` (U5), `test/engine/`, `docs/reference/references/decision-records.md` on approval, `CHANGELOG.md`; regenerated bundles `dist/`, `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js` on every unit that touches `src/`)
size: S+S+M+L+M (U1 S = 1, U2 S = 1, U3 M = 2, U4 L = 4, U5 M = 2; 10 points)
labels: kind:feature · status:backlog · size:L · P2 · lane:color-engine
written: 2026-10-03
head: 567de3a8 (`main`, revision 0); revision 1 folds R100 to R102 and the Verifier's criteria pass 1 (`.sdlc/verdicts/compute-layers-criteria.md`, 🔴 at 567de3a8)
depends: owner approval of `.sdlc/plans/compute-layers-adr-draft.md`. Q1 to Q3 are ruled (R100, R101, R102). U3 waits for #785 U2 and #766 U2 to land (both edit `src/engine/tonal.js`); U5 follows U4 (it needs the freeze mechanism)
inputs: R98 to R102 (2026-10-03), the survey table in the ADR draft, `src/ui/model.mjs` (`controlsOf`, `projectView`, `stateOf`, `geometryScale`, `geomScaleFor`, `typeScaleFor`), `src/engine/exports.js` (`controlsOf`, `derivePalette`, `derivedAll`, `EXPORT_SCHEMA_VERSION`), `src/engine/resolve.mjs`, `src/engine/tonal.js` (`DEFAULT_CONTROLS`, `paletteStops`, `effHue`), `src/engine/geometry.mjs` (`geomScale`), `src/engine/type.mjs` (`typeScale`), `src/engine/prime.mjs` (`primeSwatches`), `src/ui/persist.js` (`DOMAINS`, `GROUP_DEFAULTS`, `RENAME_MAPS`, `CURRENT_SCHEMA_VERSION`), `src/ui/categories/*.js` (`PRESETS`), `scripts/report-preset-fidelity.mjs` (`--identity-control`, `--only`), `.sdlc/adapter.md` §1 `ramp-identity`
measurements: none run; read-only survey by greps at add40292, counts re-read at 567de3a8 by the Verifier (C5.1 `6`, C3.1 `1` plus `1`)
---

# Compute layers: one controls resolver, a layer registry, one evaluator, pins with frozen versions, then the shims out

## 1. What this plan decides

R99 asks for versioned algorithms chained in various ways; R98 forbids legacy support layers; R100 keeps old versions runnable for docs pinned to them while every preset pins the latest; R101 stamps pins into exports at schema 4; R102 removes the cam16 branch and `baseIntensity`. The ADR draft section 3a reconciles them: a frozen whole-module version is not a shim, a branch inside the latest algorithm is.

| Phase | Units | Value |
|---|---|---|
| 1 | U1, U2 | canvas and exports resolve controls through one function; every stage has a name, a version and an engine `run` a test checks |
| 2 | U3 | one evaluator `compute(doc)`; `projectView` and `derivedAll` read it, so the role chain is written once |
| 3 | U4 | docs pin layer versions, frozen versions run by pin, every preset pins latest, exports stamp pins at schema 4 |
| 4 | U5 | R102: `ramp@2` without the cam16 branch (cam16 lives on only in frozen `ramp@1`), `baseIntensity` renamed at load |

Decisions:

- U1's unified `hueSpace` default is the engine default `"oklch"` (`tonal.js` `DEFAULT_CONTROLS`), what the canvas uses. The one path it moves is a raw state with no `hueSpace` sent straight to an exporter (the MCP server, a hand-built state); `persist` always stamps the field, so no stored doc moves. R102 already retires cam16 as a default, so the Orchestrator reports this move to the owner with the U1 handoff and does not wait on it.
- `geometry`'s `run` is `geomScale` in `src/engine/geometry.mjs`, which already takes the type scale as `opts.typeScale`; `geometryScale` and `geomScaleFor` in `src/ui/model.mjs` stay as callers until U3.
- Pre-pin docs hydrate pinned to version 1 of every layer, which is today's render, so nothing saved moves. Presets pin latest at apply time.

## 2. Constraints

- Engines stay pure and DOM-free, zero runtime deps, static imports only (single-file bundle).
- U1 to U4 are byte-neutral for every stored doc and preset (the adapter §1 `ramp-identity` row). U5 moves only docs that choose `ramp@2`, which presets do by R100.
- A frozen module `src/engine/layers/<id>@<n>.mjs` is never edited after it lands; `test/engine/layers.mjs` checks its SHA-256 against `src/engine/layers/FROZEN.json`.
- Nothing in the latest version of any layer reads `hueSpace` after U5 or a version argument ever.
- Gates per `.sdlc/adapter.md` §1 in the unit worktree: `npm test` (tree clean after), `npm run build` after `npm ci`, `ramp-identity`.
- Prose: no em dash, retired maker brand paraphrased, needles are symbols and counts, never line numbers.

## 3. Criteria

`IDENT` below is the adapter §1 `ramp-identity` row: `node scripts/report-preset-fidelity.mjs --identity-control --base $(git merge-base origin/main HEAD) --authored`, once plain and once with `--only default-kit`; the tool prints `N differing cells`.

### U1: one controls resolver

| # | Command | Expected | Negative control |
|---|---|---|---|
| C1.1 | `grep -n "function controlsOf" src/ui/model.mjs src/engine/exports.js`; `grep -n "export function resolveControls" src/engine/controls.mjs`; the import line in both drivers | first prints nothing, second 1 line, both drivers import it | on `main` the first prints 2 lines |
| C1.2 | `test/engine/controls.mjs`: (a) a state with no `hueSpace` resolves to `hueSpace: "oklch"` through both `projectView`'s and `derivedAll`'s path; (b) `exportJSON` of that raw state at HEAD is byte-equal to `exportJSON` of the same state with `hueSpace: "oklch"` added, run on the merge-base | exit 0 | on `main` with the test copied in, (a) fails on the export path (`"cam16"`); (b) the builder records the HEAD vs merge-base raw-state diff in the handoff |
| C1.3 | `npm test`; `npm ci && npm run build`; `git status --porcelain` | exit 0, empty | rename the `"scrim` key per adapter §1's control: `npm test` reds |
| C1.4 | `IDENT` | `0 differing cells` both runs | hard-code `hueSpace: "cam16"` in `resolveControls` and re-run on a scratch copy that strips `hueSpace` before hydrate: nonzero cells |

### U2: the layer registry

| # | Command | Expected | Negative control |
|---|---|---|---|
| C2.1 | `test/engine/layers.mjs`: `LAYERS` from `src/engine/layers.mjs` has exactly `controls`, `group-chroma`, `ramp`, `prime`, `roles`, `type`, `geometry`, each `{ id, version: 1, inputs, outputs, run }`, and `run` strict-equals: `resolveControls` (`controls.mjs`), `rampChromaOf` (`resolve.mjs`), `paletteStops` (`tonal.js`), `primeSwatches` (`prime.mjs`), `semanticRoles` (`semantic.js`), `typeScale` (`type.mjs`), `geomScale` (`geometry.mjs`) | exit 0 | point `geometry`'s `run` at another export: exit non-zero |
| C2.2 | same test: every declared input is another layer's output or a key of `defaultDocument()`; the graph is acyclic with `geometry` after `type` and `roles` after `ramp` | exit 0 | rename `geometry`'s input to a name nothing outputs: exit non-zero |
| C2.3 | `grep -nE '\b(document|window|localStorage)\.' src/engine/layers.mjs src/engine/controls.mjs` | prints nothing | add `window.x = 1` to `layers.mjs`: 1 line |
| C2.4 | `npm test`, `npm run build`, `IDENT` | exit 0, tree clean, `0 differing cells` | as C1.3 |

### U3: one evaluator

| # | Command | Expected | Negative control |
|---|---|---|---|
| C3.1 | `grep -c "applyRoleOverrides(" src/ui/model.mjs src/engine/exports.js` | `0` and `0`; `compute(doc)` in `src/engine/layers.mjs` is the one caller | on `main` `1` and `1` |
| C3.2 | `test/engine/layers.mjs` renders `defaultDocument()` and every `PRESETS` entry of every `src/ui/categories/*.js` (the loader `report-preset-fidelity.mjs` uses) through `projectView` and `derivedAll`; per palette and stop the hexes and role refs match; it prints the preset count | exit 0, count equal to the report's subject count | perturb one role ref in `derivedAll`'s view: exit non-zero |
| C3.3 | `IDENT`, `npm test`, `npm run build` | `0 differing cells`, exit 0 | as C1.4 |

### U4: pins, frozen versions, preset pins, stamps (R100, R101)

| # | Command | Expected | Negative control |
|---|---|---|---|
| C4.1 | `serialize(defaultDocument()).layers` deep-equals `{ [id]: latest version }` over `LAYERS` | test exit 0 | drop the field in `serialize`: exit non-zero |
| C4.2 | preset pins latest: for every `PRESETS` entry in every `src/ui/categories/*.js` and the default kit, the doc the preset-apply path produces has `layers` equal to latest for every layer; the test prints the count checked | exit 0, count as C3.2 | pin one preset's `ramp` to `latest - 1`: exit non-zero naming that preset |
| C4.3 | a stored doc with no `layers` field hydrates to every layer at version 1 and renders byte-equal to the merge-base (`IDENT`) | `0 differing cells`; test exit 0 | hydrate it to latest instead, after U5 lands: the cam16 fixture in C5.3 moves |
| C4.4 | frozen versions run by pin: the test registers a synthetic `test-layer@1` and `@2` fixture, pins a doc to 1, and `compute` returns `@1`'s output; every file under `src/engine/layers/` matches its SHA-256 in `FROZEN.json` | exit 0 | append a comment to a frozen file: exit non-zero |
| C4.5 | `EXPORT_SCHEMA_VERSION` is `4`; the CSS, OKLCH, JSON, DTCG, UI3, Tailwind, shadcn, Panda, Radix and design-system outputs of `defaultDocument()` carry every layer id with its pinned version next to the schema stamp | test exit 0, 10 formats plus the bundle | remove the stamp from one format: exit non-zero naming it |
| C4.6 | `npm test`, `npm run build` | exit 0, tree clean | as C1.3 |

### U5: the R102 removals

| # | Command | Expected | Negative control |
|---|---|---|---|
| C5.1 | `grep -c 'hueSpace' src/engine/tonal.js` (the latest ramp) and `grep -c 'hueSpace === "oklch"' src/engine/layers/ramp@1.mjs` | `0`; `6` (the frozen copy keeps today's branch) | on `main` `tonal.js` prints `6` for the narrower needle |
| C5.2 | `LAYERS` has `ramp` at version 2 and `ramp@1` frozen in `FROZEN.json`; `ramp@2` declares no `hueSpace` input | test exit 0 | declare `hueSpace` on `ramp@2`: exit non-zero |
| C5.3 | a fixture doc with `hueSpace: "cam16"` pinned `ramp: 1` renders byte-equal to the merge-base; the same doc re-pinned to 2 renders as OKLCH hues (differs) | test exit 0 | route `ramp: 1` to `ramp@2`: the first half reds |
| C5.4 | `grep -rn "baseIntensity" src/ --exclude=describe-mcp-assets.js` prints only the `RENAME_MAPS` entry in `src/ui/persist.js`; `CURRENT_SCHEMA_VERSION` is `7`; a v6 doc with `baseIntensity: 40` hydrates to `baseChroma: 40` | exit 0, 1 line | on `main` hits in `model.mjs`, `persist.js`, `sections/color.js`; drop the rename entry: the hydrate test reds |
| C5.5 | after `npm test` regenerates it, `grep -c baseIntensity src/ui/describe-mcp-assets.js` | `0` | on `main` nonzero |
| C5.6 | `npm test`, `npm run build`; `IDENT` | exit 0; `0 differing cells` (presets carried `hueSpace: "oklch"` already, so `ramp@2` matches) | as C1.4 |

## Units

Grades per R92 (no Fable): every unit runs reviewer-l3 then verifier-l2; the pre-land pair is reviewer-l3 plus verifier-l2. Builder grades: U1 l3, U2 l3, U3 l5, U4 l6, U5 l5.

- [ ] U1 (S) one `resolveControls` in `src/engine/controls.mjs`, default `"oklch"`, both drivers import it (C1.1 to C1.4)
- [ ] U2 (S) `LAYERS` registry at version 1 with named engine `run`s and its graph test (C2.1 to C2.4)
- [ ] U3 (M) `compute(doc)`; `projectView` and `derivedAll` become views over it (C3.1 to C3.3); after #785 U2 and #766 U2 land
- [ ] U4 (L) doc pins, pre-pin docs at version 1, presets at latest, frozen-module mechanism and hash gate, export stamps at schema 4 (C4.1 to C4.6)
- [ ] U5 (M) freeze `ramp@1`, `ramp@2` without the cam16 branch, `baseIntensity` renamed at schema 7 (C5.1 to C5.6)

Order: U1, U2, U3, U4, U5 serial.

## Not in scope

- Changing any algorithm's output apart from U5's cam16 removal. Every other behaviour change stays its own ruled plan and becomes a version bump once U4 exists.
- The Figma `code.js` role mirror and `role-table.json`; parity stays as gated today.

## Risks

| Risk | Mitigation |
|---|---|
| U1 moves a raw hueSpace-less state through an exporter | C1.2 (b) pins it to the `"oklch"` render; reported to the owner with the U1 handoff (R102 direction) |
| Frozen modules grow the single-file bundle (a frozen `tonal.js` is about 1,500 lines) | U4's handoff reports the `dist/` size delta; a frozen version imports shared pure helpers (`hct.js`, `okhsl.js`) only if those are themselves frozen by hash |
| U3 collides with #785 U2 and #766 U2 in `tonal.js` and `model.mjs` | U3 waits for both to land |

## Revisions

| # | Date | Change |
|---|---|---|
| 0 | 2026-10-03 | draft from R99, R98 and the read-only survey at add40292 |
| 1 | 2026-10-03 | R100 to R102 folded in: U4 runs frozen versions by pin and pins presets latest (C4.2), schema 4 (C4.5); U5 adds `ramp@2` and keeps cam16 only in frozen `ramp@1`, renames `baseIntensity` at schema 7. Verifier pass 1 findings: C1.2 names `"oklch"` and adds a byte check; C1.4 uses `IDENT` with `--base` and `0 differing cells`; C2.1 names every `run` (`geometry` is `geomScale`, already in the engine); C2.3 grep tightened; C3.2 names the preset loader; C5.1 count `6`; C5.2's files and load rule now in C5.4, C5.5 |
