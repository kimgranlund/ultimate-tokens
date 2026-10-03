---
status: draft
ticket: none yet (the Orchestrator mints one kind:feature issue per adapter X3 once the owner approves the ADR draft)
priority: P2
lane: color-engine then editor-ui (`src/engine/` new `layers.mjs` and `controls.mjs`, `src/engine/exports.js`, `src/ui/model.mjs`, `src/ui/persist.js`, `test/engine/`, `docs/reference/references/decision-records.md` on approval, `CHANGELOG.md`; regenerated bundles `dist/`, `figma/plugin/ui.html` on every unit that touches `src/`)
size: S+S+M+M+M (U1 S = 1, U2 S = 1, U3 M = 2, U4 M = 2, U5 M = 2; 8 points)
labels: kind:feature · status:backlog · size:L · P2 · lane:color-engine
written: 2026-10-03
head: add40292 (`main`)
depends: owner approval of `.sdlc/plans/compute-layers-adr-draft.md` (R99, R98); Phase 1 needs no answer to its Q1 to Q3. U4 needs Q1 and Q2; U5 needs Q3. U3 waits for #785 U2 and #766 U2 to land (both edit `src/engine/tonal.js`)
inputs: R99, R98 (2026-10-03), the survey table in the ADR draft, `src/ui/model.mjs` (`controlsOf`, `projectView`, `stateOf`, `geometryScale`, `typeScaleFor`), `src/engine/exports.js` (`controlsOf`, `derivePalette`, `derivedAll`, `EXPORT_SCHEMA_VERSION`), `src/engine/resolve.mjs`, `src/engine/tonal.js` (`DEFAULT_CONTROLS`, `paletteStops`), `src/ui/persist.js` (`DOMAINS`, `GROUP_DEFAULTS`, `CURRENT_SCHEMA_VERSION`), `.sdlc/plans/pane-context.md` (format)
measurements: none run; read-only survey by greps at add40292. U1's first step is the measurement its criteria name
---

# Compute layers: one controls resolver, a layer registry, one evaluator, then pins

## 1. What this plan decides

R99 asks for versioned algorithms chained in various ways; R98 forbids legacy support layers. The survey (ADR draft, Context) found the engines already pure; the gap is identity and duplication. Phase 1 is the smallest change that makes value: one controls resolver (two copies today with different `hueSpace` defaults, `controlsOf` in `src/ui/model.mjs` and in `src/engine/exports.js`) and a static layer registry that names each existing stage with an id and version, gated by a test. No render byte moves in Phase 1.

| Phase | Units | Value |
|---|---|---|
| 1 | U1, U2 | the canvas and exports resolve controls through one function; every stage has a name and version a test checks |
| 2 | U3 | one evaluator `compute(doc)`; `projectView` and `derivedAll` read it, so the role chain is written once |
| 3 | U4 | documents pin layer versions, exports stamp them (needs Q1, Q2) |
| 4 | U5 | R98 debt: the cam16 `hueSpace` branch and the `baseIntensity` name (needs Q3) |

## 2. Constraints

- Engines stay pure and DOM-free, zero runtime deps, static imports only (single-file bundle).
- Phase 1 and 2 are byte-neutral: `npm test` fixtures, `ramp-identity`, and `scripts/report-preset-fidelity.mjs --identity-control` unchanged.
- Gates per `.sdlc/adapter.md` §1 in the unit worktree: `npm test` (tree clean after), `npm run build` after `npm ci`.
- Prose: no em dash, retired maker brand paraphrased, criterion needles are symbols and counts, never line numbers.

## 3. Criteria

### U1: one controls resolver

| # | Command | Expected | Negative control |
|---|---|---|---|
| C1.1 | `grep -n "function controlsOf" src/ui/model.mjs src/engine/exports.js` | prints nothing; one `resolveControls` exported from `src/engine/controls.mjs`, imported by both | on `main` prints 2 lines |
| C1.2 | a committed test `test/engine/controls.mjs` resolves a state with no `hueSpace` through the model path and the export path and deep-equals the two | exit 0 | on `main` with the test copied in, exit non-zero (model gives the engine default, exports gives `"cam16"`); the builder records the measured diff in the handoff before any edit |
| C1.3 | `npm test` and `npm run build` in the worktree | exit 0, `git status --porcelain` empty after | revert the import in `src/engine/exports.js`: C1.2 goes red |
| C1.4 | `node scripts/report-preset-fidelity.mjs --identity-control` | 0 hexes moved against `main` | hard-code `hueSpace: "cam16"` in `resolveControls`: the report shows movers |

### U2: the layer registry

| # | Command | Expected | Negative control |
|---|---|---|---|
| C2.1 | `src/engine/layers.mjs` exports `LAYERS`, entries `controls`, `group-chroma`, `ramp`, `prime`, `roles`, `type`, `geometry`, each `{ id, version, inputs, outputs, run }` with `version` an integer, `run` an existing engine function by reference | `test/engine/layers.mjs` exit 0 | delete one entry's `version`: exit non-zero |
| C2.2 | the test checks every layer's declared `inputs` resolve to another layer's `outputs` or a doc key, and that the graph is acyclic (`geometry` after `type`, `roles` after `ramp`) | exit 0 | swap `geometry`'s input to a name no layer outputs: exit non-zero |
| C2.3 | `grep -rn "document\|window\|localStorage" src/engine/layers.mjs src/engine/controls.mjs` | prints nothing | add `window.x` to `layers.mjs`: prints 1 line |
| C2.4 | `npm test`, `npm run build` | exit 0, tree clean | as C1.3 |

### U3: one evaluator (Phase 2)

| # | Command | Expected | Negative control |
|---|---|---|---|
| C3.1 | `compute(doc)` in `src/engine/layers.mjs` walks `LAYERS` once; `projectView` and `derivedAll` read its result | `grep -c "applyRoleOverrides(" src/ui/model.mjs src/engine/exports.js` sums to 0 | on `main` sums to 2 |
| C3.2 | `test/engine/layers.mjs` renders `defaultDocument()` and every curated category doc through `projectView` and `derivedAll`; per palette and stop the hexes and role refs match | exit 0 | perturb one role ref in `derivedAll`'s view: exit non-zero |
| C3.3 | `ramp-identity`, `--identity-control`, `npm test`, `npm run build` | 0 movers, exit 0 | as C1.4 |

### U4: pins and stamps (Phase 3, after Q1 and Q2)

| # | Command | Expected | Negative control |
|---|---|---|---|
| C4.1 | `serialize(defaultDocument())` carries `layers` equal to each `LAYERS` entry's version | test exit 0 | drop the field in `serialize`: exit non-zero |
| C4.2 | hydrate a doc pinned to `ramp: version - 1`: it hydrates to the latest and `DROPPED_KEYS` (or its successor) reports the upgrade (Q1 as recommended) | test exit 0 | silence the report: exit non-zero |
| C4.3 | the JSON, DTCG and design-system exports carry the pins next to the schema stamp | test greps each format's output for every layer id | remove the stamp from one format: exit non-zero |

### U5: R98 debt (Phase 4, after Q3)

| # | Command | Expected | Negative control |
|---|---|---|---|
| C5.1 | `grep -c 'hueSpace === "oklch"' src/engine/tonal.js` | 0 | on `main` 5 |
| C5.2 | `grep -rn "baseIntensity" src/` | prints nothing | on `main` prints hits in `src/ui/model.mjs` and `src/ui/persist.js` |

## Units

Grades per R92 (no Fable): every unit runs reviewer-l3 then verifier-l2; the pre-land pair is reviewer-l3 plus verifier-l2. Builder grades: U1 l3, U2 l3, U3 l5, U4 l5, U5 l5.

- [ ] U1 (S) one `resolveControls` in `src/engine/controls.mjs`, both drivers import it (C1.1 to C1.4)
- [ ] U2 (S) `LAYERS` registry and its graph test (C2.1 to C2.4)
- [ ] U3 (M) `compute(doc)`; `projectView` and `derivedAll` become views over it (C3.1 to C3.3); after #785 U2 and #766 U2 land
- [ ] U4 (M) doc pins and export stamps (C4.1 to C4.3); after Q1, Q2
- [ ] U5 (M) remove the cam16 branch and the `baseIntensity` name (C5.1, C5.2); after Q3

Order: U1, U2 serial (U2 registers U1's resolver); U3 after both and after the two in-flight `tonal.js` units; U4, U5 after their rulings.

## Not in scope

- Changing any algorithm's output. Every behaviour change stays its own ruled plan (#766, #785 U2) and becomes a version bump once U2 exists.
- The Figma `code.js` role mirror and `role-table.json`; parity stays as gated today.

## Risks

| Risk | Mitigation |
|---|---|
| U1's divergence is reachable by a real caller (MCP, a raw export state) and the unified default changes its output | C1.2 records the diff first; if any shipped path moves, the default choice goes to the owner before the edit |
| U3 collides with #785 U2 and #766 U2 in `tonal.js` and `model.mjs` | U3 waits for both to land |

## Revisions

| # | Date | Change |
|---|---|---|
| 0 | 2026-10-03 | draft from R99, R98 and the read-only survey at add40292 |
