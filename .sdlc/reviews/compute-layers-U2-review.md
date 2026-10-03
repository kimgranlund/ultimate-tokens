PASS
# Review compute-layers U2 pass 1 (#788)

Branch unit/cl-U2 @ 7ca38db2 (code 4505290d). Reviewer: fresh context, re-ran every command below in this worktree or on a scratch copy.

## Findings, ranked

| Sev | Finding |
|---|---|
| 🟡 low | `controls.inputs` omits `baseChroma`, which `resolveControls` reads, and `prime.inputs` omits `group-chroma.rampChroma` (the `primeChromaOf` path). Both are stated in the `layers.mjs` header and the handoff and are owned by U5 and U3. Until then the graph under-declares two real edges; U3's evaluator and U4's pin logic must not treat `inputs` as complete. No change needed for U2. |
| 🟡 low | The plan branch advanced after the rebase (`plan/compute-layers` is `cfc7d853`, the unit's base is `c9f4ef0b`). The 12 newer commits touch `.sdlc/` records only and no U2 lane file, so no re-sync is needed before the merge. |
| 🟢 info | The code commit carries `Co-Authored-By: Claude Opus 5.5` and the handoff commit the Sonnet 5.5 line, as the handoff says. Neither carries `Seat:`, which is right for a builder. |
| 🟢 info | Not re-run: C2.4d (the `role-table.json` corruption control for `npm test`). It is the control for the pre-existing gate, not a U2 deliverable; the gate itself ran green below. `npm run build` and `npm run smoke` not re-run: no `src/ui` code changed, only the regenerated assets. |

No blocking findings.

## Criteria

| Id | Command | Result |
|---|---|---|
| C2.1 | `node test/engine/layers.mjs` | exit 0: 7 layers at version 1, every `run` is its engine export (`resolveControls`, `rampChromaOf`, `paletteStops`, `primeSwatches`, `semanticRoles`, `typeScale`, `geomScale`); registered in `TESTS` in `test/run.mjs`. Control on a scratch copy: `geomScale` to `typeScale` in `layers.mjs` gives `FAIL c2.1-registry: geometry: run is not the geomScale export`, exit 1. 🟢 |
| C2.2 | same test | exit 0: acyclic, order `controls > type > group-chroma > prime > geometry > ramp > roles`; geometry reaches type, roles reaches ramp. Control: input renamed `type.sca1e` gives `FAIL c2.2-graph: ... neither a layer output nor a defaultDocument() key`, exit 1. In-test controls cover a cycle and a missing `type` edge. 🟢 |
| C2.3 | `grep -nE '\b(document|window|localStorage)\.' src/engine/layers.mjs src/engine/controls.mjs` | prints nothing (exit 1). Control: `window.x = 1` appended on the scratch copy, grep prints `src/engine/layers.mjs:52:window.x = 1;`, test exits 1 (`ReferenceError: window is not defined`). 🟢 |
| C2.4 | `npm test` | heavy-load count 4 at first check (skipped), 0 on recheck, then run: exit 0, `all 56 test files passed`, `git status --porcelain` 0 lines (generated assets already match). 🟢 |
| C2.4 | IDENT: `node scripts/report-preset-fidelity.mjs --identity-control --base c9f4ef0b --authored --only default-kit` | `0 differing cells` (0/400 peak, 0/400 even). The full-corpus run is not repeated: no engine file other than the new `layers.mjs` changed (`git diff c9f4ef0b HEAD --name-only -- src` lists `layers.mjs` and the regenerated `describe-mcp-assets.js` only) and nothing imports `layers.mjs` but the test and the bundler. 🟢 |
| C2.5 | `node test/repo/em-dash.mjs` | `em-dash: clean (1115 files scanned)`; direct U+2014 grep over every touched text file empty. 🟢 |

## Lane and history

- Lane: `git diff --stat plan/compute-layers...HEAD` is exactly `src/engine/layers.mjs`, `test/engine/layers.mjs`, `test/run.mjs`, `scripts/bundle.mjs`, `scripts/gen-describe-mcp-assets.mjs`, `CHANGELOG.md`, the handoff, and the two generated assets (`figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`). Nothing else. `controls.mjs` is read, not edited. No `src/ui` code, so the Safari font-quoting and SVG `fill: none` traps do not apply.
- History: `git rev-list --merges plan/compute-layers..HEAD` is empty; two commits (code, handoff) sit linearly on `c9f4ef0b`, an ancestor of both. The rebased code commit's `src/` diff against `c9f4ef0b` is the single new file, matching the handoff.
- Regenerated assets: `npm test` regenerates them and leaves the tree clean, so the committed bytes equal a fresh generation.

## R98

The registry names today's functions and adds no branch: no override, shim, fallback, legacy layer or version argument; `version: 1` on every layer with no second version present. The `baseChroma` omission is a declared gap awaiting U5, not a fallback.

R98: none found
