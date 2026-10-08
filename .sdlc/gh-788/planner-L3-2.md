<!-- role=planner level=L3 model=opus effort=xhigh -->
## Goal
Land GitHub #788's compute layers on today's main, on a fresh branch `plan/compute-layers-r2`. First re-apply the old U1 to U3 byte-neutral: one controls resolver, a six-layer registry without the retired `group-chroma`, and one evaluator. Then re-apply U4 at persist schema 10 and export schema 7: document pins, frozen layer versions, presets pinned to latest, and pins stamped into exports. U5 is closed: the owner ruled R102 superseded by ADR-031, so CAM16 stays a live hue model and `ramp@1` is the only ramp layer.

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

## Step 2: Re-apply U4 at persist schema 10: document pins, frozen versions, presets at latest, export pins at schema 7
level: L4
guard timeout: 1000
### Read first
- `docs/references/AGENTS.md`
- `docs/AGENTS.md`
### Do
Re-apply U4 from `unit/cl-U4` onto step 1 with `git cherry-pick -n`: `d4136c8a` is the code and `3b2749b5` the gate repairs. The old builder's records list every dependent: `git show unit/cl-U4:.sdlc/handoffs/compute-layers-U4.md` and `git show unit/cl-U4:.sdlc/questions/compute-layers-U4.md`.

Re-baselined against main:

1. `src/engine/layer-pins.mjs`, new:
   - `LATEST = { controls: 1, ramp: 1, prime: 1, roles: 1, type: 1, geometry: 1 }`. There is no `group-chroma`.
   - `pinsOf(stored, latest)` as built: a missing or non-numeric pin is 1; a number is rounded and clamped to [1, latest[id]]; an unknown id is not carried.
2. `src/engine/layers.mjs`:
   - Add `layer(id, version, ...)`, `REGISTRY`, `latestOf`, `layerAt`, `docPins`, `runOf` and `pinLatest`.
   - `compute` runs each layer at the document's pin, `layerAt(registry, id, pins[id]).run`. Palette layers are `ramp`, `prime`, `roles`; mode layers are `type`, `geometry`, which `compute` skips; `controls` is the document layer.
   - No `groupChroma` and no `group-chroma.primeChroma` input: the prime chroma still comes from `primeChromaOf`, as in step 1.
3. `presetDoc(preset, { latest = LATEST } = {})` moves to `src/ui/persist.js`. The old U4 put it in `layers.mjs`.
   - It returns `hydrate(preset, { latest })` with `layers` overwritten by `latest`, which is old C4.2's "pin latest after hydrate".
   - Why it moves: on main no `src/engine` file imports from `src/ui` (`git grep 'from "../ui/' -- src/engine` prints nothing), and the describe-mcp closure test extracts engine files to a bare directory.
   - The preset tile in `src/ui/app.js` calls `this.openConfigAsSet(presetDoc(preset), ...)`.
4. Persist schema 9 to 10, as the handoff asks:
   - `CURRENT_SCHEMA_VERSION = 10`, with a `v10 (#788)` header paragraph.
   - A RENAME_MAPS entry `{ version: 10, stampLayers: true }`, shaped like v2's `stampIntensity`, stamps every registered id at version 1 on any doc stamped below 10, before the clamp. The stamp is the explicit boundary: every hydrated doc then serializes with `layers`, and the schema digit marks when pins arrived. `pinsOf`'s 1-default stays only as the clamp for a malformed pin, never a silent upgrade.
   - `hydrate(snapshot, { latest = LATEST } = {})` clamps `layers` through `pinsOf` and reports an unknown id through DROPPED_KEYS.
   - `defaultDocument()` in `model.mjs` carries `layers` at LATEST.
5. `src/ui/model.mjs`:
   - `stateOf` passes `layers` through.
   - `typeScaleFor`, `typeTierScale`, `geomScaleFor` and `geomModeScales` (main's Maison bodies, T-0017) call `runOf(doc, "type")` or `runOf(doc, "geometry")`.
6. Stamps:
   - `EXPORT_SCHEMA_VERSION` goes 6 to 7. It was 5 at the old merge-base `668d1fae`.
   - Comment-stamped formats keep line 1 as `/* ultimate-tokens export schema 7 */`. Line 2 becomes `/* ultimate-tokens layers controls@1 ramp@1 prime@1 roles@1 type@1 geometry@1 */`, ids in registry order.
   - Structured stamps: JSON `meta.layers`, DTCG `$extensions["com.ultimate-tokens"].layers`, UI3 `$layers`, DS `tokens.json` `$layers` (`ds-export.js`).
   - The Panda and Radix module exporters read `opts.layers`. Every caller, `model.mjs` and `scripts/smoke-panda.mjs`, passes `{ layers: state.layers }`.
   - `exportCSS` already carries line 1 on main, so the old C4.5 text about adding it is stale.
7. Frozen mechanism:
   - `src/engine/layers/test-layer@1.mjs` and `test-layer@2.mjs` are test-only: never in `LAYERS`, never bundled.
   - `src/engine/layers/FROZEN.json` holds the SHA-256 of every file in that folder except itself.
   - `test/engine/layers.mjs` gains the hash gate, printing a line that ends `match FROZEN.json`, with an appended-comment control.
   - New `test/engine/layer-pins.mjs`, added to TESTS, covers old C4.1 to C4.5 re-baselined:
     - `serialize(defaultDocument()).layers` equals LATEST.
     - Every preset plus the default kit, counted at run time, pins latest under a test registry that carries `test-layer@2`.
     - A v9 stored doc hydrates to version 1 everywhere and computes `test-layer@1`.
     - The clamp: an unknown id is dropped and reported.
     - Pin 1 runs `@1` and pin 2 runs `@2`.
     - All 10 exporters carry every shipped pin, printing `10/10`: `exportCSS`, `exportOKLCH`, `exportJSON`, `exportDTCG`, `exportUI3`, `exportTailwind`, `exportShadcn`, `exportPandaModule`, `exportRadixModule`, `exportDesignSystemBundle`.
8. Dependents of the schema bump and the line-2 stamp, all inside this step's scope:
   - `mcp/brand-kit-core.mjs`: `SERVER.version` 0.6.0 to 0.7.0 and its comment, so it tracks the schema digit as `maintaining-brand-kit-mcp/references/foundations.md` asks.
   - `test/mcp/{brand-kit,describe-kit-core,describe-mcp,describe-rubric}.mjs`: `brand-kit/6` becomes `/7`. `test/mcp/brand-kit.mjs:23` hardcodes `/6`, so it reds on the bump.
   - `test/engine/exports.mjs`: `const v = 6` becomes 7 (its comment says the bump turns it red); the Radix reference-module line indexes move; the shadcn `prime` scan sets the pins line aside.
   - `test/engine/fixtures/shadcn-baseline.css`, and `radix-baseline.json` if it moves.
   - `test/figma/plugin.mjs`.
   - The `(pe)` and `(rxr1)` regexes in `test/ui/headless-boot.mjs` and the 2 regexes in `test/smoke/smoke.mjs` accept the optional pins line.
   - `test/ui/persist.mjs`: the fuzz state gains `layers`, and serialize stamps 10.
   - The data: URL copies in `test/engine/anchor.mjs` gain `layer-pins.mjs`.
   - `scripts/bundle.mjs`: `layerPins` goes before `persist` and `layers`.
   - `scripts/gen-describe-mcp-assets.mjs` FILES gains `layer-pins.mjs`.
   - `scripts/gen-adia-derived-exports.mjs` version rows: a stamp-only move is `minor` under that file's own policy. Regenerated `docs/reference/data/adia-{oklch-export.css,radix-export.mjs}`.
   - `docs/references/knowledge-04-export-formats.md`, `.claude/skills/adding-export-formats/SKILL.md`, and `.claude/skills/maintaining-brand-kit-mcp/references/{best-practices,foundations}.md`.
9. `scripts/report-compute-neutral.mjs` gains two things.
   - Stamp normalization, applied to both trees and touching nothing else:
     - the export-schema digit in `export schema <N>`, `schemaVersion`, `$schemaVersion`, `tokensSchema`, `brand-kit/<N>` and `schema.v<N>`
     - lines starting `/* ultimate-tokens layers `
     - `layers` and `$layers` keys
     It prints `normalized <n>` per tree.
   - A `--migrate` leg, the pre-pin hydrate identity, with the meaning `report-preset-fidelity.mjs --identity-control --migrate` gives the flag (#804, that file's header).
     - Without the flag, both trees still render the one base-hydrated object, so the v10 `stampLayers` migration never runs on the head side.
     - With it, each preset subject is the base tree's raw preset object, hydrated by the base `hydrate` on the base side and by this tree's `hydrate` on the head side. On the head side that runs the v9-to-v10 stamp, so every head export carries the pins stamps that normalization sets aside.
     - The default-kit subject is the base `defaultDocument()` on the base side, and on the head side this tree's `hydrate` of that same document with `schemaVersion: 9` set, which is a saved v9 kit.
     - The leg prints one line `migrate: <n> subjects hydrated by head`, with n counted at run time, so a run that silently ignores the flag cannot pass.
10. Records:
    - Amend step 1's ADR (the `## ADR-<NNN>: Compute layers` section) with `doc.layers`, persist v10, the FROZEN.json hash gate, `presetDoc` in persist.js, export schema 7 and MCP 0.7.0.
    - Add the changelog entries and run `node scripts/audit-citations.mjs`.
    - End with `npm run gen:mcp-assets && npm run gen:adia-exports && npm run bundle && npm run gen:figma-ui`, so step 3's `npm test` guard finds nothing stale.

Depends on: step 1.
### Acceptance criteria
- (red) `grep -q "^export const CURRENT_SCHEMA_VERSION = 10;" src/ui/persist.js && b=$(git show "$SDLC_BASE_SHA":src/engine/exports.js | sed -n 's/^export const EXPORT_SCHEMA_VERSION = \([0-9]*\);$/\1/p') && h=$(sed -n 's/^export const EXPORT_SCHEMA_VERSION = \([0-9]*\);$/\1/p' src/engine/exports.js) && test -n "$b" && test "$h" -eq $((b + 1))`
- (red) `node test/engine/layer-pins.mjs`
- (red) `node --input-type=module -e 'import { createHash } from "node:crypto"; import { readFileSync, readdirSync } from "node:fs"; const d = "src/engine/layers/"; const want = JSON.parse(readFileSync(d + "FROZEN.json", "utf8")); const files = readdirSync(d).filter((n) => n !== "FROZEN.json").sort(); const bad = files.filter((n) => createHash("sha256").update(readFileSync(d + n)).digest("hex") !== want[n]); console.log(files.join(" "), "bad:", bad.join(" ")); process.exit(files.includes("test-layer@1.mjs") && files.includes("test-layer@2.mjs") && !bad.length && Object.keys(want).sort().join() === files.join() ? 0 : 1);' && out=$(node test/engine/layers.mjs) && printf '%s\n' "$out" | grep -q "match FROZEN.json"`
- (red) `grep -q "openConfigAsSet(presetDoc(preset)" src/ui/app.js && grep -q "^export function presetDoc" src/ui/persist.js && ! git grep -n 'from "\.\./ui/' -- src/engine`
- (red) `node --input-type=module -e 'const M = await import("./src/ui/model.mjs"); const X = await import("./src/engine/exports.js"); const l = X.exportCSS(M.stateOf(M.defaultDocument())).split("\n"); console.log(l[0]); console.log(l[1]); process.exit(l[0] === "/* ultimate-tokens export schema " + X.EXPORT_SCHEMA_VERSION + " */" && l[1] === "/* ultimate-tokens layers controls@1 ramp@1 prime@1 roles@1 type@1 geometry@1 */" ? 0 : 1);'`
- (red) `grep -q 'version: "0.7.0"' mcp/brand-kit-core.mjs && grep -q '"0.7.0"' src/ui/mcp-assets.js`
- (red) `awk '/^## ADR-[0-9]+: Compute layers/{on=1; next} /^## /{on=0} on' docs/references/decision-records.md | grep -q "FROZEN.json"`
- `out=$(node scripts/report-compute-neutral.mjs --base "$SDLC_BASE_SHA") && printf '%s\n' "$out" | tail -1 | grep -qx "0 differing cells" && out=$(node scripts/report-compute-neutral.mjs --base "$SDLC_BASE_SHA" --migrate) && printf '%s\n' "$out" | grep -qE "^migrate: [1-9][0-9]* subjects hydrated by head$" && printf '%s\n' "$out" | tail -1 | grep -qx "0 differing cells"`
- (guard) `node test/mcp/brand-kit.mjs && node test/mcp/describe-kit-core.mjs && node test/mcp/describe-mcp.mjs && node test/mcp/describe-rubric.mjs && node test/figma/plugin.mjs && node test/ui/persist.mjs && node test/engine/exports.mjs`
- (guard) `out=$(node scripts/report-preset-fidelity.mjs --identity-control --migrate --base "$SDLC_BASE_SHA" --authored) && printf '%s\n' "$out" | tail -1 | grep -qx "0 differing cells"`
- (guard) `node test/repo/citations.mjs`
- (guard) `bad=$( { git diff --name-only "$SDLC_BASE_SHA" -- . ":(exclude).sdlc"; git ls-files --others --exclude-standard -- . ":(exclude).sdlc"; } | sort -u | grep -vxE 'src/engine/(controls\.mjs|layers\.mjs|layer-pins\.mjs|exports\.js|ds-export\.js)|src/engine/layers/(FROZEN\.json|test-layer@[12]\.mjs)|src/ui/(model\.mjs|persist\.js|app\.js|describe-mcp-assets\.js|mcp-assets\.js)|figma/plugin/ui\.html|mcp/brand-kit-core\.mjs|scripts/(bundle|gen-describe-mcp-assets|gen-adia-derived-exports|report-compute-neutral|smoke-panda)\.mjs|test/run\.mjs|test/engine/(controls|layers|layer-pins|anchor|exports)\.mjs|test/engine/fixtures/(shadcn-baseline\.css|radix-baseline\.json)|test/ui/(persist|headless-boot)\.mjs|test/smoke/smoke\.mjs|test/figma/plugin\.mjs|test/mcp/(brand-kit|describe-kit-core|describe-mcp|describe-rubric)\.mjs|docs/reference/data/adia-(oklch-export\.css|radix-export\.mjs)|CHANGELOG\.md|docs/.+\.md|\.claude/skills/.+\.md' ); test -z "$bad"`

## Step 3: Gates green
level: L3
guard timeout: 1200
### Do
Run every gate in the branch worktree, each through `gate_lock.py run` with `SDLC_GATE_WORKERS=10` (the user's rule):
- `npm test`
- `npm run build`, which needs the `node_modules` that step 1's `npm ci` created
- the eight `gate:*` legs, one at a time, which is how the user wants `gate:sweeps` run
- the pre-land identity check against the branch point
- the neutrality report against the branch point

Fix any red that steps 1 and 2 introduced, in the file that owns it. A gate that was already red at the build-start HEAD is `inherited red`. If Chrome is present, also run `npm run smoke` under `gate_lock.py` and report the result; it is not a criterion because the plan cannot probe it.

Depends on: step 2.
### Acceptance criteria
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm test`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run build`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:corpus-tonal`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:corpus-anchor`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:sweep-prime`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:corpus-reset`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:corpus-contrast`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:mode-isolation`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:even-dips`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.3/scripts/gate_lock.py run -- npm run gate:chroma-envelope`
- (guard) `out=$(node scripts/report-preset-fidelity.mjs --identity-control --migrate --base "$(git merge-base origin/main HEAD)" --authored) && printf '%s\n' "$out" | tail -1 | grep -qx "0 differing cells"`
- `out=$(node scripts/report-compute-neutral.mjs --base "$(git merge-base origin/main HEAD)") && printf '%s\n' "$out" | tail -1 | grep -qx "0 differing cells"`

## Assumptions
- The conductor creates `.worktrees/compute-layers` on `plan/compute-layers-r2` off main and runs `npm ci` there before step 1. Verified: `git branch -a` lists `plan/compute-layers` (head `1a99d5ad`) and `unit/cl-U4` (head `a2f82a32`); CLAUDE.md says `npm run build` needs `node_modules`.
- `group-chroma` is retired and drops from the registry. Verified by the `src/engine/resolve.mjs` header ("There is no group layer") and the two-argument `rampChromaOf(palette, controls)`, ADR-030.
- `DEFAULT_CONTROLS.hueSpace` is `"oklch"`. Verified with `grep -A22 "^export const DEFAULT_CONTROLS" src/engine/tonal.js`.
- No stored doc, preset or committed artifact reaches an exporter without `hueSpace`, so U1's default move touches only raw states. Verified at `src/ui/persist.js` (DOMAINS.hueSpace default `"oklch"`, and `hydrate` stamps it) and the `hydrate` header comment in `scripts/gen-adia-derived-exports.mjs`.
- `paletteStops` reads only the 13 ramp controls, so passing it the full resolved controls equals `derivePalette`'s `ctl` slice. Verified with a grep of `controls.<key>` reads in `src/engine/tonal.js`.
- IDENT cannot see `compute`. Verified in `scripts/report-preset-fidelity.mjs` `identityRender`, which calls only `rampChromaOf` and `paletteStops`.
- Without `--migrate`, IDENT renders the base-hydrated document on both sides, so a persist migration never shows; with it, each side hydrates the raw object with its own tree. Verified in the `scripts/report-preset-fidelity.mjs` header and `pairUp` (lines 55 to 60 and 484 to 516). Step 2's `--migrate` leg of the neutrality tool copies that meaning.
- Export schema is 6 on main and 5 at `668d1fae`; persist schema is 9. Verified at `src/engine/exports.js:55`, by `git show 668d1fae:src/engine/exports.js`, and at `src/ui/persist.js:374`.
- On main, `src/engine` imports nothing from `src/ui`: `git grep 'from "../ui/' -- src/engine` printed nothing.
- `exportCSS` already stamps line 1 on main: the probe printed `/* ultimate-tokens export schema 6 */`.
- T-0030 is not on main yet. It is `4721785e`, on `worktree-agent-ad1c776d91a0b5185` (`git merge-base --is-ancestor 4721785e main` exits 1). Its diff touches `src/engine/tonal.js` (a `basis` field on three stop-record returns), `test/engine/chroma-envelope-gate.mjs`, an amendment in `docs/references/decision-records.md` with no new ADR heading, and two regenerated bundles. The lead says it lands before step 1, so `$SDLC_BASE_SHA` includes it.
- The next ADR number is not fixed. Main's highest is ADR-032 (`grep -n "^## ADR-03" docs/references/decision-records.md`), and `plan/geometry-compound-insets` already writes `## ADR-033: Compound containers take half the part's inset and compose radius concentrically` (`git show plan/geometry-compound-insets:docs/references/decision-records.md`). Step 1's ADR criterion therefore derives the number from `$SDLC_BASE_SHA`. On fixtures it went green for ADR-033 over main, red for ADR-033 over the compound-insets branch, and green for ADR-034 over it. Its R102 half went green on a fixture whose sentence wraps across two lines, red on a heading with no sentence, and red when the sentence sits in a later ADR. Step 2's criterion finds the section by its `Compute layers` title, and went red on a fixture without `FROZEN.json`. ADR bodies hold no `## ` lines, so the section ends at the next heading.
- The red-by-construction evidence for the test-suite guards is cited, not observed:
  - `test/mcp/brand-kit.mjs:23` hardcodes `brand-kit/6`.
  - `test/engine/exports.mjs:2375` has `const v = 6`, with a comment saying the bump turns it red.
  - `test/engine/anchor.mjs` FAILs with `import target not found` when an import moves.
  - The citations gate went red at `✗ 4` on the old U4.
- Scope and IDENT guards were observed red:
  - The scope regexes, fed a fixture, printed `src/ui/app.js`, `src/ui/sections/color.js` and `src/engine/layers/ramp@1.mjs`.
  - IDENT `--perturb` exited 1 with `1 differing cells`.
  - The FROZEN hash span exited 0 on a correct fixture and 1 after a comment was appended.
- Every guard was dry-run green at base `36272d61`, in a clean worktree. `git diff --stat 36272d61 b1c3fc56 -- src scripts test mcp figma` is empty, so that still holds for main today. The citations guard, step 1's test guard and step 2's test guard were also green at T-0030's `4721785e` (1 s, 61 s and 21 s at load 18). Timings at base `36272d61`, at load 6 to 47:

  | Guard | Time |
  |---|---|
  | `npm test` | 221 s |
  | `npm run build` (vite `built in 183ms`) | 3 s |
  | `gate:corpus-tonal` | 272 s |
  | `gate:corpus-anchor` | 356 s |
  | `gate:sweep-prime` | 213 s |
  | `gate:corpus-reset` | 221 s |
  | `gate:corpus-contrast` | 128 s |
  | `gate:mode-isolation` | 70 s |
  | `gate:even-dips` | 72 s |
  | `gate:chroma-envelope` | 81 s |
  | step 1 IDENT pair | 130 s |
  | step 1 test guard | 54 s |
  | step 2 test guard | 16 s |
  | IDENT `--migrate` | 152 s, then 324 s at merge-base |

  `dist` is git-ignored.
- U5 is closed. Verified: the user ruling of 2026-10-08 at the end of `.sdlc/gh-788/handoff.md` closes U5 (`ramp@2` without the cam16 branch, R102) as superseded by ADR-031, keeps CAM16 live, and makes `ramp@1` the only ramp layer. R102 also asked for the `baseIntensity` rename (`.sdlc/plans/compute-layers-adr-draft.md` line 62). This plan reads the ruling as closing that half too, because both halves were U5, so the field keeps its name.
- Each changed criterion is red now for the right reason. Step 1's ADR span exits 1 (want `## ADR-033: Compute layers`, absent). Step 2's ADR span exits 1. Step 2's neutrality span exits 1 on `Cannot find module .../scripts/report-compute-neutral.mjs`, and after step 1 it stays red until `--migrate` prints its subject line.
- Step 2's exportCSS criterion no longer nests backticks. `steps.py lint` refused the old span, because a backtick inside a code span ends it. It now builds line 1 by string concatenation. At main it exits 1 on the missing line 2, and its line-1 half alone exits 0.

## Risks
- If T-0027 lands on main after this branch's build starts, both branches carry an `## ADR-033:` and the second to land renumbers at rebase. Step 1's criterion catches it only when a resync moves `$SDLC_BASE_SHA` past T-0027.
- Step 2's `(red)` ADR criterion stays red after step 1 only because step 1's Do says not to name `FROZEN.json` in the ADR. That is a prose rule, not a check, and step 1 has no room for a 13th criterion. If step 1's builder names the file anyway, `steps.py split --only 2` finds that span green and refuses step 2. Step 1's verifier should confirm the ADR body does not yet contain `FROZEN.json`.
- `presetDoc` living in `src/ui/persist.js` is a deliberate departure from the approved C4.2 text, which put it in `src/engine/layers.mjs`. The reasons are in step 2's Do.
- Guard timeouts are about three times the worst measured run, at host load 6 to 47. Heavier load can still time a guard out.
- `scripts/report-compute-neutral.mjs` renders about 344 subjects across 6 surfaces on both trees, which may take several minutes under load. Step 2's neutrality criterion runs it twice. Its runtime was not measured because it does not exist yet.
- `test/engine/layers.mjs` renders every preset through `projectView` inside `npm test`, as the old U3 did, which lengthens the suite.
- `npm run smoke` is not a criterion: it needs Chrome and was not probed. CI `build-test` runs it.
- Once this lands, `.sdlc/plans/compute-layers.md` goes stale (status approved, U4 unchecked, U5 still open, ADR-028 numbering). It is outside every step's scope, so the conductor or filer updates it at close.
- Probe worktrees `.worktrees/tmp/planner-L3-gh-788/base` and `.worktrees/tmp/planner-L3-gh-788-2/t30`, plus fixtures under `.worktrees/tmp/planner-L3-gh-788-2/fx`, are still on disk. My rules forbid deletes in a headless run, so `run.sh` cleanup or the conductor removes them.
