<!-- role=verifier level=L3 model=fable effort=xhigh -->
## Verdict
pass

## Criteria
- (red) `resolveControls` export and the three imports: pass. Evidence: the grep chain exits 0 on the built tree; in the throwaway worktree at 1d2bf23f it exits 2 (`src/engine/controls.mjs` absent).
- (red) no `function controlsOf`, `applyRoleOverrides(` 0 in model.mjs and 0 in exports.js: pass. Evidence: exit 0; at 1d2bf23f exit 1 (`function controlsOf` hits exports.js 1, model.mjs 1; `applyRoleOverrides(` model 1, exports 1).
- (red) `node test/engine/controls.mjs && node test/engine/layers.mjs`: pass. Evidence: exit 0. controls prints `defaults: 15 engine controls + 2 global k factors`, `a-canvas`, `a-export`, `b-bytes: exportJSON byte-equal (9160 bytes), cam16 differs`, `one-resolver`. layers prints `presets 343`, `c2.2-graph: acyclic, order controls > type > ramp > prime > geometry > roles`, `c3.1-one-caller: model.mjs 0, exports.js 0, layers.mjs 1`, `c3.2-views: 344 documents: projectView and derivedAll agree`, and every negative control line. At 1d2bf23f both test files are absent (`Cannot find module`).
- (red) registry one-liner: pass. Evidence: printed `controls,ramp,prime,roles,type,geometry true,true,true,true,true true`, exit 0; at 1d2bf23f `ERR_MODULE_NOT_FOUND` for layers.mjs.
- (red) DOM grep on layers.mjs and controls.mjs, no `../ui/` import under src/engine: pass. Evidence: exit 0; at 1d2bf23f `test -f src/engine/layers.mjs` exits 1. Also `grep -rn baseIntensity src/engine`: no hits.
- (red) `report-compute-neutral.mjs --base $SDLC_BASE_SHA` ends `0 differing cells`: pass. Evidence: `subjects 344`; projectView 0 of 35387864, figmaBundle 0 of 5944068, brandKit 0 of 961220, dsBundle 0 of 1078355, dsStitch 0 of 203578, dsMake 0 of 692907; last line `0 differing cells`, exit 0. The compare bites per the next criterion.
- (red) `--only default-kit --perturb` exits 1 with `N differing cells`: pass. Evidence: tool exit 1, last line `2 differing cells` (witnesses `projectView.palettes[0].ramp[0].hex` and `fullRamp[0].hex`, one shared stop object), criterion exit 0. Usage errors: no arguments exit 2, `--only nope` exit 2. No `compute-neutral-*` scratch directory left under the tmpdir.
- (red) ADR heading derived from the base, before `## Quick map`, with `R102 is superseded by ADR-031`: pass. Evidence: base max ADR 32, `want` is `## ADR-033: Compute layers`, both awk legs green, exit 0; at 1d2bf23f exit 1. `grep -c FROZEN docs/references/decision-records.md` is 0, so step 2's hash-file criterion stays red. The Quick map row for ADR-033 is at `docs/references/decision-records.md:1304`. The Status line's `.sdlc/questions/compute-layers-approval.md` exists.
- (guard) identity-control `--authored`, full and `--only default-kit`: pass. Evidence: both runs end `0 differing cells`, exit 0 (perceptual, peak and even default kit each 0/400 cells, max dL* 0.0000).
- (guard) `node test/engine/anchor.mjs && node test/engine/exports.mjs && node test/ui/model.mjs && node test/mcp/describe-mcp-package.mjs`: pass. Evidence: chained command exit 0. anchor log: `lone-spike ... 0 (expected 0, corpus 300 anchored + default kit 16)` and `lone-spike negative control: plateau-neutralised engine produced 4 spike(s)`, so the patched layers.mjs control still bites. describe-mcp-package: `the exact DESCRIBE_MCP_FILES closure extracted to a bare temp dir (no repo fallback) boots`.
- (guard) `node test/repo/citations.mjs`: pass. Evidence: exit 0, `symbol homes: 45 checked, 0 stale`, `STALE 0 across 12 discovered docs + 10 fact pins + 36 count phrases`.
- (guard) scope allowlist: pass. Evidence: run before any throwaway worktree existed; `bad` empty, exit 0. Neither `docs/lld/` nor `docs/reference/references/` appears in `git status`.

Dependents and handoff items outside the criteria:
- `node test/run.mjs`: `all 56 test files passed`, exit 0 (the bundle, headless, figma and MCP consumers of the changed `exports.js` and `model.mjs` contracts and of the bundle module list).
- Bundle freshness (item 9): `gen:mcp-assets`, `bundle`, `gen:figma-ui` rerun in a throwaway worktree at HEAD with the working diff applied; `src/ui/describe-mcp-assets.js` and `figma/plugin/ui.html` are byte-identical to the working tree.
- The deliberate move: at 1d2bf23f `exportJSON` of a raw state with no `hueSpace` equals its cam16 render; on the built tree it equals the oklch render. Recorded in builder Notes, `CHANGELOG.md`, `docs/references/changelog.md` and the ADR Consequences.
- `git grep controlsOf -- .claude/skills docs/references/knowledge-02-tonal-scale.md docs/references/knowledge-04-export-formats.md`: no hits. At 1d2bf23f only `adding-export-formats/references/foundations.md:31` named it; `color-math` had no mention to re-point.
- `plan/compute-layers` is 1a99d5ad and `unit/cl-U4` is a2f82a32, untouched; HEAD is still the base sha, nothing committed.

## Out of scope changes
None. `docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md` and `docs/reports/2026-10-07-hue-space-anchored.md` carry line-number-only cite repairs, which item 8 asks for (`scripts/audit-citations.mjs`) and the scope allowlist admits.

## For the next attempt
None.
