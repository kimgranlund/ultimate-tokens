# Handoff compute-layers U2 · builder to reviewer

Branch unit/cl-U2 @ 4505290d (code), stacked on plan/compute-layers @ c9f4ef0b (U1 merged). The plan asked for `git merge plan/compute-layers`; the merge was refused at commit time by the board-commit guard (it saw `.sdlc/board.md` staged from the plan's own commits and wants a `Seat: orchestrator` trailer, which a builder cannot honestly carry), so I rebased the one U2 commit onto the plan branch instead. Same content, linear history. After the rebase `npm test` is 56/56 green and the tree is clean (the generated assets already matched).

| Id | Command | Evidence | Negative control | State |
|---|---|---|---|---|
| C2.1 | `node test/engine/layers.mjs` | `pass  c2.1-registry: 7 layers at version 1, every run is its engine export`, `PASS: layers clears all checks`, exit 0; registered in `TESTS` in `test/run.mjs` | in `src/engine/layers.mjs` `["geometry.scale"], geomScale` changed to `typeScale`: `FAIL  c2.1-registry: geometry: run is not the geomScale export`, exit 1. The test also carries the same control on a corrupted copy of the registry plus an eighth-layer control | 🟢 |
| C2.2 | same test | `pass  c2.2-graph: acyclic, order controls > type > group-chroma > prime > geometry > ramp > roles` | `["geometry", "type.scale"]` changed to `"type.sca1e"`: `FAIL  c2.2-graph: geometry: input type.sca1e is neither a layer output nor a defaultDocument() key`, exit 1. In-test controls also cover a cycle (`controls` consuming `ramp.stops`) and geometry with no `type` edge | 🟢 |
| C2.3 | `grep -nE '\b(document\|window\|localStorage)\.' src/engine/layers.mjs src/engine/controls.mjs` | prints nothing (grep exit 1); the test repeats it as `c2.3-dom` for both files | `echo 'window.x = 1;' >> src/engine/layers.mjs`: the grep prints `src/engine/layers.mjs:52:window.x = 1;` (1 line), and the test exits 1 (`ReferenceError: window is not defined`) | 🟢 |
| C2.4a | `npm test; echo $?; git status --porcelain \| wc -l` | `✓ all 56 test files passed`, exit 0, `0` | see C2.4d | 🟢 |
| C2.4b | `npm ci && npm run build; echo $?; git status --porcelain \| wc -l` | exit 0, `0` | `bundle.mjs` rejects an engine import missing from MODS/KEY, so dropping the `["layers", ...]` entry is the failure path for a module the bundle imports; layers.mjs is imported by nothing yet, so its registration there is by plan (C2 text) and not load-bearing for the build | 🟢 |
| C2.4c | `B=$(git merge-base origin/main HEAD)` (`cd76cc5f`); `node scripts/report-preset-fidelity.mjs --identity-control --base $B --authored`, again with `--only default-kit` | `0 differing cells` both runs; 0/94500 cells per tone mode on the corpus, 0/400 on the default kit | nothing in U2 touches a render path (no existing module changed), so a nonzero control would need an edit outside the unit; the U1 control (C1.4b) already proves the gate bites | 🟢 |
| C2.4d | in a `git clone --shared` at the pre-rebase commit: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test; echo $?` | exit 1: `engine/semantic.mjs      FAIL`, `FAIL  refs-canonical, ordered key set != canonical`, `✗ 1/56 test file(s) failed` | this row is the control for C2.4a | 🟢 |
| C2.5 | `node test/repo/em-dash.mjs \| tail -1` | `em-dash: clean` (also inside `npm test`) | the repo's own gate | 🟢 |

Notes for the reviewer.

- Shape. `LAYERS` is a frozen object keyed by layer id (a doc pin map is keyed the same way in U4). Outputs are named `<layer-id>.<name>`: `controls.resolved`, `group-chroma.rampChroma`, `ramp.stops`, `prime.swatches`, `roles.table`, `type.scale`, `geometry.scale`. Inputs are document keys or those names.
- One input is deliberately not declared. `resolveControls` reads `baseChroma`, which the document names differently until the U5 rename, and `src/engine` may not spell the document's own name (AC-004). C2.2 requires every input to be a layer output or a `defaultDocument()` key, so `controls.inputs` lists the 15 engine controls plus `primeChroma` and `paletteGroups` (17, checked against `DEFAULT_CONTROLS` in the test) and the file header says why. U5 adds `baseChroma` when the document key and the resolver agree.
- `prime` lists `controls.resolved` for its primeChroma and does not list `group-chroma`: the group-resolved prime chroma (`primeChromaOf`) is applied by the callers today and joins the graph when U3's evaluator takes over those callers. `roles`' `run` is `semanticRoles` only (plan C2.1); U3 widens it to the role chain.
- `layers.mjs` is imported by nothing yet, so the bundler and describe-assets registrations are the plan's and carry no runtime effect; `src/ui/describe-mcp-assets.js` and `figma/plugin/ui.html` regenerated with it. `test/engine/anchor.mjs` needed no rewrite entry because `model.mjs` does not import `layers.mjs`.
- Files disjoint from `controls.mjs`: it is read by the new test (grep only) and not edited.
- Load rule: the heavy `ps` count was 0 to 3 at each `npm test` start in this resume; the first-pass gate ran at 1.
- CHANGELOG: one Unreleased bullet under 2026-10-03 Changed.
- Trailer: code commit carries `Co-Authored-By: Claude Opus 5.5` as dispatched; this handoff commit carries the harness-supplied Sonnet 5.5 line. No `Seat:` trailer.

| Field | Value |
|---|---|
| Files | `src/engine/layers.mjs` (new), `test/engine/layers.mjs` (new), `test/run.mjs`, `scripts/bundle.mjs`, `scripts/gen-describe-mcp-assets.mjs`, `CHANGELOG.md`, regenerated `src/ui/describe-mcp-assets.js` and `figma/plugin/ui.html` |
| Ran | `npm test` (56/56 green, twice) · `npm ci && npm run build` (exit 0, tree clean) · both IDENT runs (`0 differing cells`) · every row's control above |
| Not run | `npm run smoke` |
