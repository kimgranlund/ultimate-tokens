## Task goal
GitHub #788. Land the compute-layers plan (`.sdlc/plans/compute-layers.md`, status approved, written 2026-10-03 under the old Orchestrator workflow) on today's main. The plan's U1, U2 and U3 are already built and merged on branch `plan/compute-layers` (head `1a99d5ad`); U4 is built on branch `unit/cl-U4` (`3b2749b5`, `a2f82a32`) but was reviewed against the old base; U5 is unbuilt. Main has since landed T-0013 (chroma envelope presets, ADR-029), T-0014 (per-palette Base chroma, global k factors, persist schema 8, ADR-030), T-0015 (hue space applies to anchored palettes, ADR-031), T-0017 (Maison geometry ladder, persist schema 9, ADR-032) and T-0018/#809 (UI changes), so `plan/compute-layers` has conflicts and several of its assumptions are stale.

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
