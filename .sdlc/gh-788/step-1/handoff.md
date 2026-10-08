## Task goal
GitHub #788. Land the compute-layers plan (`.sdlc/plans/compute-layers.md`, status approved, written 2026-10-03 under the old Orchestrator workflow) on today's main. The plan's U1, U2 and U3 are already built and merged on branch `plan/compute-layers` (head `1a99d5ad`); U4 is built on branch `unit/cl-U4` (`3b2749b5`, `a2f82a32`) but was reviewed against the old base; U5 is unbuilt. Main has since landed T-0013 (chroma envelope presets, ADR-029), T-0014 (per-palette Base chroma, global k factors, persist schema 8, ADR-030), T-0015 (hue space applies to anchored palettes, ADR-031), T-0017 (Maison geometry ladder, persist schema 9, ADR-032) and T-0018/#809 (UI changes), so `plan/compute-layers` has conflicts and several of its assumptions are stale.

## Step 1: Re-apply U1 to U3 on main: one controls resolver, a six-layer registry, one evaluator (byte-neutral)
level: L4
guard timeout: 800
### Read first
- `docs/references/AGENTS.md`
- `docs/AGENTS.md`
### Do
Work in the worktree `.worktrees/compute-layers`, on branch `plan/compute-layers-r2` off current main. Run `npm ci` there once if `node_modules` is missing, because step 3's build guard needs it. Leave `plan/compute-layers` and `unit/cl-U4` untouched.

The source of the change is `git diff main...plan/compute-layers -- src scripts test`: U1 `84c075a5`, U2 `4505290d`, U3 `470a0877`. Re-apply it with `git cherry-pick -n` or `git checkout plan/compute-layers -- <new file>` and then hand-merge. Builders never commit.

Never take these from that branch:
- its `docs/`, `CHANGELOG.md` or `.sdlc/` hunks
- its regenerated bundles
- its ADR number. The branch wrote to `docs/reference/references/` and `docs/lld/` and used ADR-028, but main's ADR-028 is the docs-schema decision.

Take every palette-argument field list from main's `projectView` and `derivePalette` at `$SDLC_BASE_SHA`, never from the old branch. T-0030 (`4721785e`, verified) lands on main before this step starts. It adds a `basis` field to the OKHSL stop records `src/engine/tonal.js` returns, which is an output field and not a palette argument, plus an amendment to an existing ADR with no new number.

Re-baselined against main:

1. `src/engine/controls.mjs` `resolveControls(src)`:
   - Same as the old branch, minus the `paletteGroups` line. T-0014 (#804, ADR-030) removed group chroma: the `src/engine/resolve.mjs` header says "There is no group layer", and `rampChromaOf(palette, controls)` now takes two arguments.
   - Defaults come from every `DEFAULT_CONTROLS` key in `tonal.js`, where `hueSpace` is `"oklch"`, plus `baseChroma` 100 and `primeChroma` 100.
2. `src/engine/exports.js`:
   - Delete `controlsOf`, including its `hueSpace ?? "cam16"`.
   - `derivePalette` reads one compute entry.
   - `derivedAll(state, computed = compute({ ...state, palettes: enabledPalettes(state) }))`.
   - `relLumExp` re-exports `relLum` from `layers.mjs`, and `slug` is imported from `layers.mjs`.
3. `src/ui/model.mjs`:
   - `controlsOf` becomes `docControls(doc) = resolveControls({ ...doc, baseChroma: doc.baseIntensity })` at every call site: the `rampChromaOf` and `primeChromaOf` wrappers, `dsDocOf`, `stateOf`, `paletteKeyColors`, and the `brandKit` controls block, which on main is `{ baseChroma, primeChroma }` with no `paletteGroups`.
   - `projectView` reads ramp, prime and roles from `compute(stateOf(doc))` and passes that `computed` to `derivedAll`.
   - `deriveKeyColor(p, hueSpace, primeChroma / 100)` (T-0014) gets the same values as before.
   - Keep the exports `rampChromaOf`, `primeChromaOf`, `paletteKeyColors`, `EXPORT_STOPS` and `defaultDocument`: the `NEED` table in `scripts/report-preset-fidelity.mjs` loads them by name.
4. `src/engine/layers.mjs`:
   - `LAYERS` is exactly `controls`, `ramp`, `prime`, `roles`, `type`, `geometry`. Each is `{ id, version: 1, inputs, outputs, run }`.
   - The runs are `resolveControls`, `paletteStops`, `primeSwatches`, `resolveRoles` (the whole role chain), `typeScale`, and main's 27-cell `geomScale(config, { typeScale })`.
   - `group-chroma` is not registered, because it was retired in #804. Say so in the header comment and in the ADR.
   - `compute(doc, registry = LAYERS)` forms each palette's ramp chroma and prime chroma with `rampChromaOf(p, controls)` and `primeChromaOf(p, controls)` from `resolve.mjs`, as input shaping. The `ramp` and `prime` layers declare only `palettes` and `controls.resolved`.
   - It returns `{ controls, palettes: [{ palette, n, rampChroma, primeChroma, stops, prime, roles }] }` over every palette, in document order.
   - `controls.inputs` is the `DEFAULT_CONTROLS` keys plus `primeChroma`. The base k stays out: its document field keeps the name `baseIntensity`, which AC-004 bars under `src/engine`, because U5 and its rename are closed.
   - `type` and `geometry` are registered but `compute` does not walk them: they are mode layers, and `model.mjs` stays their evaluator.
   - Header comments cite the new ADR from item 8.
5. Tests:
   - `test/engine/controls.mjs`, old C1.2: (a) a state with no `hueSpace` resolves to `"oklch"` on both the canvas path and the export path; (b) `exportJSON` of that raw state equals `exportJSON` of the same state with `hueSpace: "oklch"` added. Each check has its cam16 control.
   - `test/engine/layers.mjs`, old C2.1 to C3.2 re-baselined:
     - six ids, each `run` strict-equal to its engine export, and the controls inputs
     - an acyclic graph with `geometry` after `type` and `roles` after `ramp`
     - the DOM grep with its `window.x = 1` control
     - `applyRoleOverrides(` callers: model.mjs 0, exports.js 0, layers.mjs 1
     - every preset, loaded the way `report-preset-fidelity.mjs` loads them (`src/ui/categories/*.js` except `index.js`), plus `defaultDocument()`, rendered through `projectView` and `derivedAll` with matching hexes and refs. It prints `presets <n>`, with n summed from the files at run time, never a literal.
   - Add both files to `test/run.mjs` TESTS.
   - `test/engine/anchor.mjs`: its lone-spike control rewrites model.mjs's imports to data: URLs. Add `controls.mjs`, plus a patched `layers.mjs` whose `tonal.js` import points at the plateau module, as the old branch did.
6. Bundling:
   - `scripts/bundle.mjs` MODS and KEY gain `controls` after `resolve` and `layers` before `exports`.
   - `scripts/gen-describe-mcp-assets.mjs` FILES gains both. `test/mcp/describe-mcp-package.mjs` extracts that closure to a bare directory, so a missing file fails there.
7. New tool `scripts/report-compute-neutral.mjs --base <rev> [--only <category>|default-kit] [--perturb]`:
   - Why: IDENT's `identityRender` calls only `rampChromaOf` and `paletteStops`. It never reaches `compute`, `projectView` or `derivedAll`, so it cannot see this refactor. The old U4 handoff says so in its IDENT row (`git show unit/cl-U4:.sdlc/handoffs/compute-layers-U4.md`).
   - Load the base the way `runIdentityControl` does: `git archive <rev> src` into `mkdtempSync(tmpdir())`, removed on exit. Never a worktree.
   - Hydrate the base default kit and every base preset once, with the base `hydrate`, and hand the same object to both trees.
   - Render each subject on both trees through `projectView` (the canvas plus its exports), `figmaBundle`, `brandKit`, and the three DS bundles, called the way `src/ui/overlays/drawer.js` calls them.
   - Compare every leaf; a string export is compared line by line.
   - Print `subjects <n>` and per-surface counts, and end with `<n> differing cells`. Exit 0 only at 0, 1 on any difference, 2 on a usage error.
   - `--perturb` alters one head cell before the compare, as identity-control's `--perturb` does.
8. Records:
   - Append the new ADR to `docs/references/decision-records.md`, before `## Quick map`, headed `## ADR-<NNN>: Compute layers are versioned pure functions chained into a brand kit`. NNN is one above the highest ADR number at `$SDLC_BASE_SHA`, zero-padded to three digits. That is ADR-033 on main today, but `plan/geometry-compound-insets` (T-0027) also writes an `## ADR-033:`, so if T-0027 lands first this one is ADR-034. The criterion derives the number at run time.
   - Base the ADR on `.sdlc/plans/compute-layers-adr-draft.md` re-baselined: six layers, `group-chroma` retired by ADR-030, the draft's ADR-028 number never landed, rulings R98 to R101.
   - R102 follows the owner's ruling of 2026-10-08 at the end of `.sdlc/gh-788/handoff.md`. Leave out the draft's R102 consequences: section 3a's `ramp@2` with no `hueSpace` input, and the `baseIntensity` rename. Instead say that CAM16 stays a live, supported hue model (ADR-031, the Hue space control), that `ramp@1` is the only ramp layer and keeps the cam16 branch, and that `baseIntensity` keeps its name. Write the sentence `R102 is superseded by ADR-031.` in plain text inside the ADR; the criterion reads it with line wraps joined.
   - Keep the draft's wording for the content hash of frozen modules and do not name a hash file: step 2 names `FROZEN.json` when it amends the ADR, and its criterion must be red until then.
   - Add one entry each to `CHANGELOG.md` and `docs/references/changelog.md`, in the form of each file's top entry.
   - Re-point living mentions of the retired `controlsOf` to `resolveControls`: `.claude/skills/{adding-export-formats,adding-semantic-roles,color-math}` and `docs/references/knowledge-0{2,4}-*.md`. Dated records stay as written.
   - Repair moved line cites with `node scripts/audit-citations.mjs`.
9. Regenerate assets with `npm run gen:mcp-assets && npm run bundle && npm run gen:figma-ui`.

U1's one deliberate move, approved in the old plan: a raw state with no `hueSpace` sent straight to an exporter now renders `"oklch"` instead of `"cam16"`. Record that case in the result.

Depends on: none.
### Acceptance criteria
- (red) `grep -q "^export function resolveControls" src/engine/controls.mjs && grep -q 'from "../engine/controls.mjs"' src/ui/model.mjs && grep -q 'from "../engine/layers.mjs"' src/ui/model.mjs && grep -q 'from "./layers.mjs"' src/engine/exports.js`
- (red) `! git grep -q "function controlsOf" -- src/ui/model.mjs src/engine/exports.js && test "$(grep -c 'applyRoleOverrides(' src/ui/model.mjs)" -eq 0 && test "$(grep -c 'applyRoleOverrides(' src/engine/exports.js)" -eq 0`
- (red) `node test/engine/controls.mjs && node test/engine/layers.mjs`
- (red) `node --input-type=module -e 'const L = await import("./src/engine/layers.mjs"); const T = await import("./src/engine/tonal.js"); const P = await import("./src/engine/prime.mjs"); const C = await import("./src/engine/controls.mjs"); const Ty = await import("./src/engine/type.mjs"); const G = await import("./src/engine/geometry.mjs"); const ids = Object.keys(L.LAYERS).join(","); const runs = [L.LAYERS.controls.run === C.resolveControls, L.LAYERS.ramp.run === T.paletteStops, L.LAYERS.prime.run === P.primeSwatches, L.LAYERS.type.run === Ty.typeScale, L.LAYERS.geometry.run === G.geomScale]; const v1 = Object.values(L.LAYERS).every((l) => l.version === 1); console.log(ids, runs.join(","), v1); process.exit(ids === "controls,ramp,prime,roles,type,geometry" && runs.every(Boolean) && v1 ? 0 : 1);'`
- (red) `test -f src/engine/layers.mjs && ! grep -nE '\b(document|window|localStorage)\.' src/engine/layers.mjs src/engine/controls.mjs && ! git grep -n 'from "\.\./ui/' -- src/engine`
- (red) `out=$(node scripts/report-compute-neutral.mjs --base "$SDLC_BASE_SHA") && printf '%s\n' "$out" | tail -1 | grep -qx "0 differing cells"`
- (red) `out=$(node scripts/report-compute-neutral.mjs --base "$SDLC_BASE_SHA" --only default-kit --perturb); test $? -eq 1 && printf '%s\n' "$out" | tail -1 | grep -qE "^[1-9][0-9]* differing cells$"`
- (red) `n=$(git show "$SDLC_BASE_SHA":docs/references/decision-records.md | sed -n 's/^## ADR-0*\([0-9][0-9]*\): .*/\1/p' | sort -n | tail -1) && test -n "$n" && want=$(printf "## ADR-%03d: Compute layers" $((n + 1))) && awk -v w="$want" 'index($0, w) == 1 {a=NR} /^## Quick map/{q=NR} END{exit !(a && q && a < q)}' docs/references/decision-records.md && awk -v w="$want" 'index($0, w) == 1 {on=1; next} /^## /{on=0} on' docs/references/decision-records.md | tr -s ' \n' '  ' | grep -qF "R102 is superseded by ADR-031"`
- (guard) `out=$(node scripts/report-preset-fidelity.mjs --identity-control --base "$SDLC_BASE_SHA" --authored) && printf '%s\n' "$out" | tail -1 | grep -qx "0 differing cells" && out=$(node scripts/report-preset-fidelity.mjs --identity-control --base "$SDLC_BASE_SHA" --authored --only default-kit) && printf '%s\n' "$out" | tail -1 | grep -qx "0 differing cells"`
- (guard) `node test/engine/anchor.mjs && node test/engine/exports.mjs && node test/ui/model.mjs && node test/mcp/describe-mcp-package.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `bad=$( { git diff --name-only "$SDLC_BASE_SHA" -- . ":(exclude).sdlc"; git ls-files --others --exclude-standard -- . ":(exclude).sdlc"; } | sort -u | grep -vxE 'src/engine/(controls\.mjs|layers\.mjs|exports\.js)|src/ui/(model\.mjs|describe-mcp-assets\.js)|figma/plugin/ui\.html|scripts/(bundle|gen-describe-mcp-assets|report-compute-neutral)\.mjs|test/run\.mjs|test/engine/(controls|layers|anchor)\.mjs|CHANGELOG\.md|docs/.+\.md|\.claude/skills/.+\.md' ); test -z "$bad"`
