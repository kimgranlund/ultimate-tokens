# CLAUDE.md

`ultimate-tokens` is a perceptual **color + design-token generator**: one Vite web app that is also a
self-contained `<ultimate-tokens>` web component, a **Figma plugin** (a semantic-variable binder), and
an **MCP brand-kit** server. A brand kit is **one document** with three composing systems, surfaced as
**sections of one editor**: **Color** (palettes → 53 semantic roles) · **Typography** · **Geometry**
(its per-step text size composes *from* the Type UI scale).

Canonical specs + rubrics: `docs/reference/` (e.g. `docs/reference/data/role-table.json` is the role answer key).

## Commands

- `npm test` — the gate. **Zero-dependency**: regenerates committed assets (`gen:*` + `bundle` +
  `gen:figma-ui`) then runs `test/run.mjs` — engine verifiers + a custom headless-DOM shim. No browser.
- `npm run build` — `gen:*` → `tsc` → `vite build` → `bundle` → `gen:figma-ui`. **Needs `node_modules`**
  (vite/tsc); `npm test` does not.
- `npm run smoke` — boots the built single-file in **real headless Chrome** over CDP (the only
  real-browser leg). Screenshots land in `smoke-out/` (gitignored).
- `npm run dev` — Vite dev server (the app the user previews, in **Safari**).
- `gen:figma-assets` · `gen:mcp-assets` · `gen:categories` · `gen:type-fonts` — regenerate committed
  artifacts; `test`/`build` run the first three. Run `gen:type-fonts` by hand after changing bundled fonts.

## Layout

- `src/engine/` — the **pure** engines (ESM, **no DOM**): `semantic.js` (the 53-role table) · `type.mjs` ·
  `geometry.mjs` · `exports.js` (the 8 documented color formats: CSS/OKLCH/JSON/DTCG/UI3/Tailwind/shadcn)
  · `ds-export.js` (the Claude Design/Google Stitch/Figma Make design-system bundle export, split out
  of `exports.js` at TKT-0015 — undocumented elsewhere, not one of the 8) · `derive`/`tonal`/`hct`/`okhsl`.
- `src/ui/` — `app.js` (the `HctApp` custom element, ~all UI) · `styles.css` · `model.mjs`
  (`projectView` + `geometryScale` — where Geometry composes Type) · `persist.js` · generated
  `*-assets.js` / `type-fonts.js` (do not hand-edit) · `categories/`.
- `figma/` — the plugin: `figma/binder/figma-semantic-binder/code.js` mirrors `semanticRoles` for the
  sandbox (parity-gated). `figma/plugin/ui.html` is a generated bundle of the whole app.
- `test/` — `engine/*` verifiers · `ui/headless-boot.mjs` (the shim run, lettered groups) · `figma/` ·
  `mcp/` · `plugin/` (skill↔role-table parity) · `smoke/smoke.mjs`. `scripts/` — the generators.
  `mcp/` — the MCP server. `plugin/ultimate-tokens/` — the CONSUMER-side Claude plugin: skills that
  teach agents to use exported kits in THEIR projects (parity-gated against the engine).
- `docs/reference/` — canonical specs, rubrics, role-table answer key. `docs/marketing/` — the
  marketing corpus (voice platform · pinned fact sheet · store copy · launch kit); author via the
  `marketing-manager` agent + `ultimate-tokens-brand-voice` skill. `docs/tickets/` — the
  pre-2026-07-17 bug/feature archive (`kind: bug`/`kind: feature` TICKETs); routed by the
  `project-docs` skill. `docs/site/`, `docs/lld/`, `docs/img/` — hosting/licensing specs, one
  architecture doc, and the generated README preview SVG, respectively. `.claude/docs/other/` —
  **PRIVATE** (see below).
- **Git-native ticket backend (ADR-017).** Bugs/features/issues now route to **GitHub Issues**
  (`gh issue create`), not new `docs/tickets/*.md` files — labels `kind:bug`/`kind:feature` +
  `size:small`/`size:big` carry the machine-read fields the file frontmatter used to. Scribe's
  `/bug-report`/`/feature` read this ruling and mint issues. Migrating the tickets still open as
  files into Issues is `TKT-0031` (check `docs/tickets/` for the live count — don't trust a
  hardcoded one here).

## Conventions (non-obvious only)

- **Zero runtime deps; vanilla web component.** No framework. Build markup with the `h(tag, attrs, ...kids)`
  hyperscript (not JSX), light DOM, native `<dialog>` + `showModal()`. Engines stay DOM-free + pure.
- **Sections.** `this.section` (`color`|`typography`|`geometry`) routes `renderCenter`/`renderLeftPane`/
  `renderRightPane`. A section = a canvas header + a pannable `.canvas-scene` (the full dataset) + left
  analysis cards + a right inspector.
- **53 semantic roles / palette.** `docs/reference/data/role-table.json` deep-equals `semanticRoles`; the
  Figma `code.js` table mirrors it (parity-gated) — so a role-count change moves several files in lockstep.
- **Quote interpolated font-family names** with digits/spaces — `font-family:'Source Serif 4', serif`.
  Unquoted, WebKit/Safari drops the declaration (the digit is invalid); Chrome tolerates it.
- **SVG line charts set `fill: none`** on the path (an open `<path>` fills by closing → wedge artifacts);
  qualify the rule (`.an-svg .x-line`) so a shared series-color class can't override it.
- **`node_modules` is NOT tracked** (`npm install`/`npm ci` is the source of truth); never re-add it.

## Testing

The headless shim's DOM limits (it is not jsdom) are owned by the `building-editor-sections` skill;
why green smoke isn't Safari-proof is owned by `shipping-changes`'s `references/foundations.md` —
consult those before writing or debugging a test rather than re-deriving here.

## Shipping

Full release workflow (branch → gates → PR → CI → squash-merge → sync) is owned by the
`shipping-changes` skill — invoke it when a change is ready to land.

## Always

- `npm test` green before treating a change as done (and `npm run build` if you touched the build chain).
- `.claude/docs/other/` (local-only, ignored via `.git/info/exclude`) never reaches a commit —
  enforced by the `git-precommit-privatedocs-guard` PreToolUse hook (`.claude/hooks/`), not just prose.

<!-- Enforcement: the .claude/docs/other guard is a real PreToolUse hook (.claude/hooks/git-precommit-privatedocs-guard.mjs, registered in .claude/settings.json) — added 2026-07-31 via /check-entry-file. Role-table parity + font-quoting stay conventions + CI + the test gates (test/engine/type.mjs's luxury quoting assert, categories.mjs's parity check), not pre-commit — mechanically checkable but lower-stakes than a private-dir leak, and already caught before merge by the test gate. -->
<!-- This file is the always-loaded INDEX of cross-cutting, always-true facts only. Domain PROCEDURES (changing an engine, adding a role/format, the Figma binder, building a section, shipping, palette research) are owned by on-demand skills/agents in .claude/ — discovered via their frontmatter descriptions, NOT routed from here. Conceptual depth: docs/reference/ + the engine files' header comments. Keep this thin; let the frontmatter system do the routing. Audited via /check-entry-file 2026-07-31 (90→~70 lines: cut boilerplate + a stale ticket count, collapsed 2 skill-duplicated Testing bullets to a pointer, the docs/other guard became a real hook). -->
