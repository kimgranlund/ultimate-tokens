---
kind: architecture
repo: ultimate-tokens
mapped_at: 2026-09-16
head: f9e20c52f5b73a2358be4bf17a63d79dbbc63c16
branch: sdlc/adopt
inputs: .sdlc/survey.md, .sdlc/verdicts/survey.md
unit: A2
status: pass 2 (reworked per .sdlc/verdicts/architecture.md)
---

# Architecture: ultimate-tokens

Recovered from code at f9e20c5. Every claim (A-, T-, P-, X-, L- ids) cites two evidence files. Every convention (K- ids) carries a negative control that was actually run, with its command, result, and exceptions. Mutation controls ran in a `git archive HEAD` copy under the job tmp dir, never in the root checkout.

## 1. Layering and dependency direction

```
            mcp/*  (Node, stdio)          figma/plugin/code.js, binder code.js (Figma sandbox, no imports)
               |                                  ^ spliced/bundled at build time
               v                                  |
  src/main.ts -> src/ui/app.js (HctApp) -> src/ui/{sections,overlays}/* -> src/ui/{model.mjs,persist.js,app-helpers.mjs}
                                      \-> figma/binder/*.mjs (pure planners)
                                                   |
                                                   v
                                  src/engine/*  (pure ESM, imports only siblings)
```

| id | claim | evidence 1 | evidence 2 |
|---|---|---|---|
| A1 | `src/engine/` is the bottom layer: its modules import only sibling engine modules (`./x`), never `../ui`, `../../figma`, `node:`, or DOM globals. | `src/engine/exports.js:31-37` (imports tonal, semantic, collections, prime, okhsl, resolve, type) | `src/engine/tonal.js:13-14` (imports hct, okhsl only); controls K1, K2, K3 |
| A2 | `src/ui/model.mjs` is the pure view-model seam between the engines and every consumer: it imports ~all engines and re-exports projections (`projectView`, `figmaBundle`, `brandKit`, `geometryScale`). | `src/ui/model.mjs:14-42, 234-265` (engine imports) | `src/ui/app.js:9-33` (imports from model.mjs); `mcp/brand-kit-merged-core.mjs:16` (imports `projectView`) |
| A3 | `src/ui/persist.js` sits beside model.mjs: DOM-free schema/clamp/hydrate logic that imports engines only. | `src/ui/persist.js:1-3` (imports icon-systems, type, collections) | `scripts/bundle.mjs` MODS entry `["persist", "src/ui/persist.js"]` placed after engines, before exports |
| A4 | The UI shell is one custom element `HctApp` whose feature code lives in section and overlay mixins merged onto its prototype; sections and overlays depend on model/persist/helpers, never back on app.js. | `src/ui/app.js:59 class HctApp`, `:2563 mixinInto`, `:2587 mixinInto(HctApp, ColorSection, TypeSection, GeomSection, DrawerMixin, ApplyGateMixin, SettingsMixin)` | `src/ui/sections/color.js:1-4`, `src/ui/overlays/drawer.js:1-10` imports; control K4 |
| A5 | `figma/binder/*.mjs` are pure planners (no `figma.` global) that depend on the engine and are imported upward by the UI to compute Figma apply plans in the iframe. | `figma/binder/style-plan.mjs:59-61`, `figma/binder/bind-plan.mjs:32` (engine imports) | `src/ui/overlays/apply-gate.js:5-8` (imports mode-apply-plan, migrations, style-plan, live-diff); control K5 |
| A6 | `mcp/` depends downward on `src/ui/model.mjs` and `src/ui/persist.js` (the pure layer), never on app.js or the DOM. | `mcp/describe-kit-core.mjs:20-21` | `mcp/brand-kit-merged-core.mjs:16`, `mcp/describe-mcp-core.mjs:16`; control K6 |
| A7 | Geometry composes Type by injection, not import: `geometry.mjs` does not import `type.mjs`; `model.mjs#geometryScale` builds the type scale and passes it as `opts.typeScale`. | `src/engine/geometry.mjs:258 geomScale`, `:270 opts.typeScale.categories["UI-control"]`; `grep 'import .*type\.mjs' src/engine/geometry.mjs` exit 1 | `src/ui/model.mjs:53-58` |

## 2. Runtime topology

One source tree, four shipped runtimes, all fed from the same engines.

| id | runtime | claim | evidence 1 | evidence 2 |
|---|---|---|---|---|
| T1 | Web app (Vite SPA) | `index.html` loads `src/main.ts`, which imports styles and `app.js`; the app is deployed to GitHub Pages by CI on push to main. | `index.html` `<script type="module" src="/src/main.ts">`; `src/main.ts:6-7` | `.github/workflows/ci.yml:63-66` (`upload-pages-artifact`, `path: _site`) |
| T2 | Web component | `<ultimate-tokens>` is registered by `app.js` itself, so any host page that loads the bundle gets the element. | `src/ui/app.js:2593 customElements.define("ultimate-tokens", HctApp)` | `src/main.ts:3, 72` (comments: element upgrades after app.js ran define) |
| T3 | Offline single-file | `scripts/bundle.mjs` is a hand-rolled inliner (ordered `MODS` registry + `preflight()`) that writes `dist/ultimate-tokens.html`; lazy category `import()` calls are rewritten to a sync registry. | `scripts/bundle.mjs:17-40 MODS`, `:79 preflight`, `:199 writeFileSync` | `docs/reference/references/decision-records.md:511 ADR-020` (keep bundle.mjs, vite not adopted) |
| T4 | Figma plugin (flagship) | `scripts/gen-figma-ui.mjs` wraps the single-file bundle with a postMessage bridge into `figma/plugin/ui.html`; `code.js` is the sandbox half, offline (`allowedDomains: ["none"]`). | `scripts/gen-figma-ui.mjs:12 BUNDLE = dist/ultimate-tokens.html`, `:17 BRIDGE` | `figma/plugin/manifest.json` (`main code.js`, `ui ui.html`, `networkAccess none`); `figma/plugin/code.js:39 showUI` |
| T5 | Figma binder (standalone) | A second, UI-less plugin whose role table and executors are spliced verbatim from `semantic.js` and the flagship `code.js` between `GENERATED:<NAME>` markers, because the sandbox cannot import. | `scripts/gen-figma-binder-code.mjs:1-25` | `figma/binder/figma-semantic-binder/code.js` markers `GENERATED:FLOAT_EXECUTOR`, `COLOR_EXECUTOR`, `ROLE_TABLE`; `decision-records.md:419 ADR-018` |
| T6 | Brand-Kit MCP (local) | Zero-dep Node servers frame newline-delimited JSON-RPC 2.0 on stdio around pure `handle()`/`buildSurface()` cores; the app ships the server + the user's `brand-kit.json` as a download zip. | `mcp/brand-kit-server.mjs:1-40`, `mcp/brand-kit-core.mjs:34 buildSurface`, `:154 handle` | `src/ui/app.js:2464-2473` (brandKit + zip entry `brand-kit.json`); `src/ui/overlays/drawer.js:239` |
| T7 | Describe-palette MCP | A second MCP family (`describe-mcp-*`, merged server) generates kits deterministically; a hosted Cloudflare Worker variant is specced but no Worker code is tracked. | `mcp/describe-mcp-server.mjs:8`, `mcp/brand-kit-merged-core.mjs:14-16` | `docs/site/mcp-hosting-spec.md:59`; `decision-records.md:561 ADR-021`; `git ls-files \| grep -iE 'wrangler\|worker'` empty |
| T8 | Consumer Claude plugin | `plugin/ultimate-tokens/` (3 skills + 1 agent) is published to npm as `@ultimate-tokens/claude` when its plugin.json version changes on main, gated by `npm test`. | `plugin/ultimate-tokens/.claude-plugin/plugin.json:2`; `plugin/ultimate-tokens/skills/color-tokens/scripts/role-parity.mjs:15` (reads role-table.json) | `.github/workflows/publish-plugin.yml:18-50` |
| T9 | Licensing edge | The only network call in the app is Lemon Squeezy license activation from `main.ts`; entitlement parsing is pure in `flags.js`, and tiers are not enforced. | `src/main.ts:36 LEMON_LICENSE_API`, `:39 fetch` | `src/engine/flags.js:24 TIERS_ENFORCED = false`, `:189 lemonEntitlement` |

## 3. Persistence and contracts

| id | claim | evidence 1 | evidence 2 |
|---|---|---|---|
| P1 | The document is persisted as a versioned snapshot: `serialize`/`hydrate` with `CURRENT_SCHEMA_VERSION = 4` and a `RENAME_MAPS` migration list (v1-v3 renames; v4 is a drop-only bump). | `src/ui/persist.js:317, 338-358, 427, 436` | `test/ui/persist.mjs:154-166` (v1 and v2 snapshots hydrate forward) |
| P2 | Storage is host-dependent: browser uses `localStorage` keys (`ultimate-tokens`, `-project`, `-sets`, `-profile`); in Figma the iframe posts to `code.js`, which stores the project config in `figma.root` pluginData (per file) and sets in `figma.clientStorage` (per user). | `src/ui/app-helpers.mjs:20 PROJECT_KEY`, `src/ui/app.js:1176-1181, 2329-2337` | `figma/plugin/code.js:86-88 setPluginData/getPluginData`, `:186-192 clientStorage` |
| P3 | UI and sandbox talk only over Figma's `pluginMessage` protocol. The sandbox handles exactly 10 UI message types: `apply`, `list-fonts`, `load-config`, `load-sets`, `read-float-variables`, `read-variables`, `save-config`, `save-sets`, `sweep-delete`, `sweep-scan` (full list from `grep -oE 'msg(\s*&&\s*msg)?\.type === "[a-z-]+"' figma/plugin/code.js \| sort -u`). | `figma/plugin/code.js:125-200` | `src/ui/app.js:1030-1032, 2334, 2347`; `scripts/gen-figma-ui.mjs` BRIDGE |
| P4 | The 53-role semantic table is the core contract, held in two hand-kept copies (answer key JSON and `semanticRoles()`) plus one generated copy (binder), all parity-gated. | `docs/reference/data/role-table.json` (`roleTable` length 53); `src/engine/semantic.js semanticRoles` (length 53, run) | `test/engine/semantic.mjs:12-13 refs-canonical`; `test/figma/binder.mjs:139 parity`; control K8 |
| P5 | Export output carries its own schema version, and ships resolved colors (not alias data). | `src/engine/exports.js:55 EXPORT_SCHEMA_VERSION = 2` | `decision-records.md:24 ADR-002` |
| P6 | The MCP contract is JSON-RPC 2.0 `tools/list`, `resources/list` over a pure dispatcher shared by stdio and (planned) hosted transports. | `mcp/brand-kit-core.mjs:159-175` | `mcp/brand-kit-server.mjs:1-6` (header: hosted Worker imports the same core) |
| P7 | Committed generated artifacts are the contract between build and runtime (`figma/plugin/ui.html`, `src/ui/*-assets.js`, `type-fonts.js`, `categories/*.js`); `npm test` regenerates all but `type-fonts.js` before running. | `package.json` scripts `test` (runs gen:figma-assets, gen:mcp-assets, gen:categories, gen:adia-exports, bundle, gen:figma-ui; no gen:type-fonts) | `.claude/CLAUDE.md` Commands ("Run `gen:type-fonts` by hand after changing bundled fonts"; "`test`/`build` run the first three"); control K9 |

## 4. Cross-cutting patterns

| id | pattern | evidence 1 | evidence 2 |
|---|---|---|---|
| X1 | Parity gates over duplication: wherever a copy must exist (sandbox, consumer plugin), a test proves identity to the canonical source instead of trusting a copy. | `test/figma/binder.mjs:107, 139, 571` (parity, floatparity, colorparity) | `plugin/ultimate-tokens/skills/*/scripts/{role,voice,dimension}-parity.mjs`; `test/run.mjs` TESTS `plugin/*` |
| X2 | Anchor-splice generation: generators rewrite only text between marker comments, idempotently. Run twice in the scratch copy (`node scripts/gen-figma-binder-code.mjs` then `git status --short`, twice): empty both times, so output equals the committed bytes and a rerun changes nothing. | `scripts/gen-figma-binder-code.mjs:22-25` (marker contract, "Idempotent"), `:56-59 spliceBlock` | `figma/binder/figma-semantic-binder/code.js` `GENERATED:ROLE_TABLE START/END`; `package.json` script `gen:figma-assets` (runs the splice before every `npm test`) |
| X3 | Graceful storage degradation: every `localStorage` access sits in try/catch because the Figma iframe throws on it. | `src/ui/app-helpers.mjs:84-95, 110-136` | `src/ui/app.js:2294-2318`; control K10 |
| X4 | Mode-aware resolution layer: per-mode overrides (`geomScaleFor`, `typeScaleFor`) funnel through model.mjs so exports and canvas agree. | `src/ui/model.mjs:53-60` ("the single place the two systems are joined") | `src/ui/sections/geometry.js:1`, `src/ui/sections/typography.js:1` (import `*ScaleFor` from model) |
| X5 | Test harness is a custom child-process runner with self-reporting gate files, no framework, plus a headless DOM shim instead of jsdom. | `test/run.mjs:12-40` | `test/ui/headless-boot.mjs` (in TESTS); control K12 |
| X6 | Records of decisions live in one ADR ledger; tickets moved to GitHub Issues. | `docs/reference/references/decision-records.md` (22 `## ADR-NNN`) | `decision-records.md:386 ADR-017`; `.claude/CLAUDE.md` Layout section |

## 5. Load-bearing choices

| id | choice | why it bears load | evidence 1 | evidence 2 |
|---|---|---|---|---|
| L1 | Zero runtime dependencies, single-file offline distribution. | The Figma plugin and `file://` bundle cannot fetch; the hand-rolled inliner and zip writer exist because of it. | `decision-records.md:144 ADR-010` | `package.json` (no `dependencies`; dev only typescript, vite); `src/ui/zip.mjs` |
| L2 | Keep `bundle.mjs` over vite for the single-file artifact. | Adding a module means editing `MODS`/`KEY`; `preflight()` fails the build otherwise. | `decision-records.md:511 ADR-020` | `scripts/bundle.mjs:79-90`; control K7 |
| L3 | HCT (CAM16 hue/chroma + L*) with OKLCH-native hue model. | Every ramp, role, and gate is defined in this space. | `decision-records.md:13 ADR-001`, `:159 ADR-011` | `src/engine/tonal.js:13` (imports hct), `src/engine/hct.js` |
| L4 | `role-table.json` stays hand-kept; only the sandbox copy is generated. | Role-count changes move JSON, engine, binder, consumer skills in lockstep. | `decision-records.md:419 ADR-018` | `test/engine/semantic.mjs:12`; `role-parity.mjs:15` |
| L5 | Figma variables written from resolved values, pluginData keyed by plugin id. | The id rename orphaned all prior pluginData; no migration possible. | `decision-records.md:289 ADR-014` | `figma/plugin/code.js:44-51` |
| L6 | One kebab-case naming grammar on every emitted surface. | Token names are the public API of every export. | `decision-records.md:354 ADR-016` | `figma/binder/migrations.mjs` (`kebabWaveVarRenames`), imported at `src/ui/app.js:46` |

## 6. Conventions and negative controls

Each control is a command that prints one line per violation, so "0 hits" is a pass. Every control was also run against a planted violation in a scratch copy (`git archive HEAD` under `/Users/kimba/.claude/jobs/6d765d7c/tmp/arch2`, reset with `git reset --hard && git clean -fdx` between plants). The Bite column shows what was planted and the hit count it produced. Comment-line filter used below: `grep -vE "^[^:]+:[0-9]+:\s*(//|\*)"` (drops hits whose code starts with `//` or `*`).

| id | convention | evidence | control command | HEAD result | bite (plant: hits) | exceptions |
|---|---|---|---|---|---|---|
| K1 | Engines touch no DOM or browser globals. | `.claude/CLAUDE.md` Conventions; `src/engine/tonal.js:13-14` | `grep -nE "\b(document\|window\|customElements\|HTMLElement\|localStorage\|navigator)\s*\.\|attachShadow\|querySelector" src/engine/* \| grep -vE "^\S+:[0-9]+:\s*(//\|\*)"` | 0 | `const x = document.body;` appended to tonal.js: 1 | none |
| K2 | Engines import nothing outside `src/engine/`. | `src/engine/exports.js:31-37` | `grep -nE 'from "\.\./\|import\("\.\./' src/engine/*` | 0 | `import { h } from "../ui/app-helpers.mjs"` in hct.js: 1 | none |
| K3 | Engines use no `node:` builtins; MCP uses no npm packages. | `package.json` (no `dependencies`); `mcp/brand-kit-server.mjs:1-6` | `grep -nE 'from "node:\|require\(' src/engine/*; grep -nE '^import .* from "' mcp/*.mjs \| grep -vE 'from "(node:\|\./\|\.\./)'` | 0 | `import fs from "node:fs"` in hct.js + `import x from "lodash"` in mcp/describe-eval.mjs: 2 | none |
| K4 | Sections, overlays, model, persist never import `app.js`. | `src/ui/app.js:52-57`; `src/ui/sections/color.js:1-4` | `grep -nE 'from "\.\.?/app\.js"' src/ui/sections/* src/ui/overlays/* src/ui/*.mjs src/ui/persist.js` | 0 | `import { HctApp } from "../app.js"` in sections/color.js: 1 | none |
| K5 | Binder planners are pure (no `figma.` global) so the UI can import them. | `figma/binder/style-plan.mjs:59-61`; `src/ui/overlays/apply-gate.js:5-8` | `grep -nE "\bfigma\.[a-zA-Z]" figma/binder/*.mjs \| grep -vE ":\s*//"` | 0 | `const v = figma.variables;` in live-diff.mjs: 1 | none |
| K6 | Sandbox `code.js` files have no ES imports and no network I/O. | `figma/plugin/code.js:4`; `figma/binder/figma-semantic-binder/code.js:8` | `grep -nE "\bfetch\(\|XMLHttpRequest\|WebSocket\|^import " figma/plugin/code.js figma/binder/figma-semantic-binder/code.js \| grep -vE "^[^:]+:[0-9]+:\s*//"` | 0 (2 raw hits before the comment filter, both header comments stating the rule) | `fetch("https://x");` in plugin code.js: 1 | none |
| K7 | Every module reachable from the app is registered in `bundle.mjs` MODS/KEY. | `scripts/bundle.mjs:79 preflight`; `docs/reference/references/decision-records.md:511 ADR-020` | `node scripts/bundle.mjs` | exit 0, wrote 3692.6 KB | new `src/engine/planted.mjs` imported by exports.js: exit 1, `preflight found 1 registry problem ... "./planted.mjs" is not registered in KEY` | none |
| K8 | The three role tables stay identical (53 roles). | `test/engine/semantic.mjs:12`; `test/figma/binder.mjs:139` | `node test/engine/semantic.mjs`; `node test/figma/binder.mjs`; `semanticRoles("brand").length` vs `roleTable.length` | both exit 0; 53 = 53 | binder `-dim` dark 700 changed to 999: exit 1 `FAIL parity`; one role-table.json row removed: exit 1 `FAIL refs-canonical` | none |
| K9 | Generated artifacts are not hand-edited: regeneration reproduces them byte for byte. | `package.json` script `test`; `.claude/CLAUDE.md` Layout ("do not hand-edit") | script K9 in §6.1 (shasum, run all 8 generator scripts behind the 6 generator steps of `package.json` `test`, shasum again, print each changed file; 16 watched files). Coverage check: in the scratch copy, `touch marker`, run the 6 `npm run gen:*`/`bundle` steps of `test`, then `find . -path ./.git -prune -o -type f -newer marker -print` lists 17 written files: the 16 watched files plus `dist/ultimate-tokens.html` | 0 (and `git status --short` empty after the run) | `/* hand edited */` appended to docs/reference/data/adia-oklch-export.css: 1 (`CHANGED BY REGEN: docs/reference/data/adia-oklch-export.css`); `// hand edited` appended to docs/reference/data/adia-radix-export.mjs: 1 (`CHANGED BY REGEN: docs/reference/data/adia-radix-export.mjs`); `<!-- hand edited -->` appended to figma/plugin/ui.html: 1 (`CHANGED BY REGEN: figma/plugin/ui.html`); `// hand edited` prepended to src/ui/mcp-assets.js: 1 (`CHANGED BY REGEN: src/ui/mcp-assets.js`) | `dist/ultimate-tokens.html` is written by `bundle.mjs` but not watched: it is gitignored and only an intermediate step toward `figma/plugin/ui.html`, which is watched. `src/ui/type-fonts.js` is outside the control because `npm test` never runs `gen:type-fonts`; a manual `node scripts/gen-type-fonts.mjs` at HEAD was byte-identical (sha 725417d6 before and after), so only the gate is missing, not the file. `figma/plugin/ui.html` has no generated header in its first 600 bytes (starts `<!doctype html>`); the K9 script covers it by regeneration (plant above). |
| K10 | `localStorage` access is always inside try/catch. | `src/ui/app-helpers.mjs:130-137`; `src/ui/app.js:2294-2318` | `git grep -nE "localStorage\.(get\|set\|remove)Item" -- src/ui src/main.ts \| grep -v try` | 6 raw hits (`app-helpers.mjs:89,91,92,114,134`, `app.js:2296`); a manual trace puts all 6 inside multi-line `try {}` blocks | unguarded `function f(){ localStorage.setItem("a","b"); }` in app-helpers.mjs: 7 | Mechanical limit: this grep cannot tell a guarded multi-line block from an unguarded call. It detects a new call as a count increase above 6; whether that call is guarded is a manual trace. |
| K11 | No UI framework, no JSX, no shadow DOM; markup is built with `h()`. | `src/ui/app-helpers.mjs:308 h`; `.claude/CLAUDE.md` Conventions | `git ls-files \| grep -E "\.(jsx\|tsx\|vue\|svelte)$"; git grep -nE 'from "(react\|preact\|lit\|vue\|svelte)' -- src mcp figma; git grep -n attachShadow -- src figma` | 0 | tracked `src/ui/planted.jsx` + `import { html } from "lit"` in zip.mjs: 2 | 12 `html:` attributes (`git grep -cE "html:" -- src/ui/app.js src/ui/sections src/ui/overlays`: color.js 6, geometry.js 3, typography.js 3) inject SVG chart strings via `el.innerHTML` (`app-helpers.mjs:313`). |
| K12 | Modals are native `<dialog>` opened with `showModal()`; no ARIA-faked modals. | `src/ui/overlays/drawer.js:107-111`; `src/ui/styles.css:1047` | violation check: `git grep -nE 'role: "dialog"\|role="dialog"\|aria-modal' -- src/ui`. Inventory: `git grep -nE "showModal\(" -- 'src/*.js' \| grep -vE "^[^:]+:[0-9]+:\s*(//\|\*)"`; `git grep -nE '"dialog"' -- src/ui` | violation check 0. `showModal(` raw over `src`: 10 hits (6 are comment lines in app.js, drawer.js, styles.css); after the comment filter on `.js`: 4 calls (`app.js:610`, `overlays/apply-gate.js:317`, `overlays/settings.js:19`, `sections/color.js:415`), matching 4 `"dialog"` tags | `h("div", { role: "dialog", "aria-modal": "true" })` in settings.js: 1 | none |
| K13 | Interpolated `font-family` values are quoted. | `src/engine/type.mjs:560-566 cssFontStack`; `src/engine/ds-export.js:310 dsFontStack` | script K13 in §6.1: every `font-family:${name` whose name is not one of the pre-quoted stack helpers (`uiStack`, `bodyStack`, `headStack`, `monoStack`, `stackFor`, `fam`) | 0. Raw `git grep -nE 'font-family: ?\$\{' -- src figma/binder scripts mcp` is 10 hits; 1 is in generated `src/ui/describe-mcp-assets.js` (excluded, it embeds ds-export.js source); the other 9 all use an allowlisted helper | `` `font-family:${family}` `` appended to sections/typography.js: 1 | Mechanical limit: the check trusts the helper names. That the helpers themselves quote was verified by manual reading only (`ds-export.js:310` wraps the name in `'...'`; `typography.js:1043 fam()` returns `'${fm}', generic`). A helper that stopped quoting would not fail K13. Literal sites written `font-family:'${x}'` never match the pattern. |
| K14 | SVG line paths set `fill: none` in a rule qualified under `.an-svg`. | `src/ui/styles.css:1372-1373`; `src/ui/sections/typography.js:44` | script K14 in §6.1: for every class on a `<path class="...">` in `src/ui/sections` (excluding `ty-sN` color classes), require a rule matching `\.an-svg \.<class> \{[^}]*fill: ?none` in styles.css | 3 hits: `lc-applied`, `lc-ceiling`, `lc-toneline` | `<path class="ty-line` renamed to `zz-line` in typography.js: 1 new hit (`MISSING .an-svg .zz-line fill:none`) | The 3 HEAD hits are the known exceptions: `.lc-toneline` and `.lc-applied` (`styles.css:826-827`) have `fill:none` but no `.an-svg` qualifier; `.lc-ceiling` (`:825`) is filled on purpose (area shape). Mechanical limit: a pass means an unqualified or missing rule is absent. Whether a qualified rule loses to a more specific selector is not checked. |
| K15 | `node_modules` and `.claude/docs/other/` are never tracked. | `.gitignore:1`; `.git/info/exclude:3`; `.claude/hooks/git-precommit-privatedocs-guard.mjs` | `git ls-files \| grep node_modules/; git ls-files .claude/docs/other`; `git log --all --oneline -- .claude/docs/other`; `node .claude/hooks/git-precommit-privatedocs-guard.mjs --selftest` | 0; 0; no commits; selftest PASS | force-added `node_modules/p/i.js` + `.claude/docs/other/n.md`: 2 | none |
| K16 | MCP stdio servers keep stdout for protocol only. | `mcp/brand-kit-server.mjs:6`; `mcp/describe-mcp-server.mjs` | `grep -nE "console\.log" mcp/*-server.mjs` | 0 | `console.log("hi")` in brand-kit-server.mjs: 1 | none |
| K17 | Tests use no framework and every test file is in `run.mjs` TESTS. | `test/run.mjs:12-21`; `test/ui/headless-boot.mjs` | `git grep -nE 'from "(vitest\|jest\|mocha\|node:test\|uvu\|ava)"' -- test; git ls-files test \| grep "\.mjs$" \| sed "s#^test/##" \| while read f; do grep -q "\"$f\"" test/run.mjs \|\| echo "$f"; done \| grep -vxE "run.mjs\|smoke/smoke.mjs\|ui/counts.mjs"` | 0 (3 unlisted files before the exception filter) | `import test from "node:test"` in engine/hct.mjs + new unlisted `test/engine/zzz.mjs`: 2 | `test/run.mjs` (the runner), `test/smoke/smoke.mjs` (separate `npm run smoke` entry), `test/ui/counts.mjs` (helper); filtered by name in the control. |
| K18 | Every schema version has a documented rule, and no migration outruns `CURRENT_SCHEMA_VERSION`. | `src/ui/persist.js:317`; `test/ui/persist.mjs:154-166` | script K18 in §6.1 (require a `vN` mention for the current N; flag any `RENAME_MAPS` `version:` above it) | 0 (CURRENT 4; RENAME_MAPS 1, 2, 3; `v4` rule at `persist.js:312-315, 485`) | `CURRENT_SCHEMA_VERSION` bumped to 5: 1 (`no v5 rule for CURRENT_SCHEMA_VERSION 5`) | v4 has no RENAME_MAPS entry by design (drop-only bump). Mechanical limit: a `v5` comment with no migration code would pass. |

### 6.1 Control scripts

Run from the repo root. Each prints one line per violation.

K9:
```bash
F="src/ui/mcp-assets.js src/ui/describe-mcp-assets.js src/ui/figma-plugin-assets.js figma/binder/figma-semantic-binder/code.js figma/plugin/ui.html docs/reference/data/adia-oklch-export.css docs/reference/data/adia-radix-export.mjs $(ls src/ui/categories/*.js)"
before=$(shasum $F)
{ node scripts/gen-figma-binder-code.mjs && node scripts/gen-figma-assets.mjs && node scripts/gen-mcp-assets.mjs && node scripts/gen-describe-mcp-assets.mjs && node scripts/gen-categories.mjs && node scripts/gen-adia-derived-exports.mjs && node scripts/bundle.mjs && node scripts/gen-figma-ui.mjs; } >/dev/null 2>&1 || echo "GENERATOR FAILED"
diff <(echo "$before") <(shasum $F) | grep '^<' | sed 's/^< /CHANGED BY REGEN: /'
```
This writes to the checkout. Run it in a scratch copy, or on a clean tree.

K13:
```bash
git grep -noE 'font-family: ?\$\{[A-Za-z_]+' -- src figma/binder scripts mcp ':!src/ui/describe-mcp-assets.js' \
 | grep -vE '\$\{(uiStack|bodyStack|headStack|monoStack|stackFor|fam)$'
```

K14:
```bash
for c in $(git grep -hoE '<path class="[a-z0-9 -]+' -- src/ui/sections | sed 's/<path class="//' | tr ' ' '\n' | grep -vE '^ty-s' | sort -u); do
  grep -qE "\.an-svg \.$c \{[^}]*fill: ?none" src/ui/styles.css || echo "MISSING .an-svg .$c fill:none"
done
```

K18:
```bash
CUR=$(grep -oE "^export const CURRENT_SCHEMA_VERSION = [0-9]+" src/ui/persist.js | grep -oE "[0-9]+$")
grep -qE "schema-rename v${CUR}\b" test/ui/persist.mjs || echo "no test/ui/persist.mjs snapshot case for CURRENT_SCHEMA_VERSION ${CUR}"
```

## 7. Counts

- Claims: 35 (A 7, T 9, P 7, X 6, L 6). Each cites two repo files.
- Conventions: 18. Each has a control run at HEAD and a recorded plant that the control caught.
- Conventions with exceptions: K9, K11, K14, K17, K18.
- Controls with a stated mechanical limit (the rest is a manual trace): K10, K13, K14, K18.
