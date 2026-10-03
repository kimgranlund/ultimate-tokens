---
status: approved
ticket: 791
priority: P2
lane: naming-scheme (`src/ui/overlays/settings.js`, `src/engine/ds-export.js` prose, comments in `src/engine/{exports.js,type.mjs,geometry.mjs}` and `src/ui/overlays/drawer.js`, `test/engine/{exports,type,geometry}.mjs`, `test/ui/{persist,headless-boot}.mjs`, `src/ui/persist.js` (Q1 A), `src/engine/exports.js` `EXPORT_SCHEMA_VERSION` and `mcp/brand-kit-core.mjs` `SERVER.version` (Q2 B), `plugin/ultimate-tokens/`, `.claude/skills/geometry-system/`, `CHANGELOG.md`, `docs/marketing/`; regenerated `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`)
size: S+S (2 points)
labels: kind:feature · status:backlog · size:small · P2
written: 2026-10-03
head: b7332999 (`origin/main`, revision 0); revision 1 folds the owner's Q1 A and Q2 B rulings and repairs criteria pass 1 (`.sdlc/verdicts/md-prefix-criteria.md`, 🔴 at 65ad60d0: C1.3, C1.4, C2.1, C2.2, C2.3)
depends: nothing open; Q1 and Q2 are ruled (section 4); sequence after prime-name #789 (section 5)
inputs: owner ask "token naming convention change `--md-sys-typescale-display-weight-medium` -> `--md-typescale-display-weight-medium`" (2026-10-03); owner ruling 2026-10-03: every `md-sys-*` family becomes `--md-*`; R98 (no overrides or legacy alias layers)
measurements: read-only `git grep md-sys- origin/main` at b7332999
---

# Material naming scheme: `--md-sys-*` becomes `--md-*`

## 1. Where `md-sys` comes from

No engine hard-codes `md-sys`. Every emitter takes a prefix (`colorPrefix`, `typePrefix`, `geomPrefix`; defaults `c`, `type`, empty). The string exists only in the Settings "Material" naming preset, `src/ui/overlays/settings.js`:

- `:111` detection: `cp === "md-sys-color" && type === "md-sys-typescale" && geom === "md-sys"` returns `"material"`.
- `:119` apply: `color = "md-sys-color"; type = "md-sys-typescale"; geom = "md-sys"`.

So the rename is one preset triple plus the prose and tests that quote it:

| Family | Preset value today | After | Example today | Example after |
|---|---|---|---|---|
| Color | `md-sys-color` | `md-color` | `--md-sys-color-primary-on-surface` | `--md-color-primary-on-surface` |
| Type | `md-sys-typescale` | `md-typescale` | `--md-sys-typescale-display-weight-medium` | `--md-typescale-display-weight-medium` |
| Geometry root | `md-sys` | `md` | `--md-sys-size-3-height`, `--md-sys-radius-md`, `.md-sys-control-md` | `--md-size-3-height`, `--md-radius-md`, `.md-control-md` |

Geometry families under the root (all follow): `size`, `radius`, `space`, `inset`, `focus`, `border`, `density`, `gap`, `control`.

## 2. Findings

- Default output: unchanged. The Ultimate scheme (`--c-*`, `--type-*`, `--size-*`) never touches `md-sys`; a default kit exports byte-identical.
- Figma: variable, collection and style names are slash paths (`{n}/{role}`, `type/...`), never the CSS prefix. `git grep md-sys origin/main -- figma/binder figma/plugin/code.js` returns nothing. No Figma name changes, so `FIGMA_MIGRATIONS` gets no entry. C1.5 proves it; if it reds, the entry becomes mandatory in the same change.
- MCP: `mcp/*.mjs` has no `md-sys`. Only the generated `src/ui/describe-mcp-assets.js` (engine comments it embeds) moves on regeneration.
- Collision: none. `git grep -nE -- "--md-[a-rt-z]" origin/main -- src mcp figma/binder plugin` returns only `settings.js:232` (a template literal `--${this._typePrefix()}-...`, not a token); `src/ui/styles.css` declares no `--md-*`. Within the new scheme the three roots stay disjoint: color sits under `--md-color-*`, type under `--md-typescale-*`, geometry under `--md-{size,radius,space,inset,focus,border,density,gap}-*`; no geometry family is named `color` or `typescale`. The size step `md` reads `--md-size-md-height`, legal and unambiguous.
- Residual class (not new): a custom brand root `md` with a geometry family is now indistinguishable from the Material preset, which is the point of the preset.
- Persisted kits: `persist.js:635-637` stores the prefixes as plain strings. A kit saved on the Material preset keeps `md-sys-*` after this change, Settings reads it as "Custom", and it keeps exporting the old names. See Q1.
- Schema: names change only under an opt-in preset; JSON/DTCG/UI3 keys do not carry the CSS prefix. The owner still rules a bump (Q2 B), so U1 moves `EXPORT_SCHEMA_VERSION` to the merge-base value plus 1 and `SERVER.version` with it.

## 3. Units

- [ ] U1 (S) Preset, hydrate rewrite, schema bump, emitted prose: settings.js triple, persist.js, `EXPORT_SCHEMA_VERSION`, `SERVER.version`, comments, ds-export prose, tests, regenerated assets (builder-l2)
- [ ] U2 (S) Records: consumer plugin, geometry-system skill, CHANGELOG, marketing corpus via `marketing-manager-agent` (builder-l1)

### U1 criteria

| # | Check (command) | Expected | Today | Negative control |
|---|---|---|---|---|
| C1.1 | `git grep -n "md-sys" -- src test mcp figma/binder figma/plugin/code.js scripts` | no output, exit 1 | 40+ hits (settings.js 8, exports/type/geometry/drawer/ds-export comments, tests) | leave settings.js `:119` unchanged: hits return |
| C1.2 | `grep -c "md-sys" figma/plugin/ui.html src/ui/describe-mcp-assets.js` after `npm test` | `0` each | `19`, `4` | skip regeneration: counts nonzero |
| C1.3 | headless group rxr4 (`test/ui/headless-boot.mjs`) applies the Material preset through the Settings path (`_setNamingScheme("material")`), then exports: CSS contains `--md-color-` and no `--md-sys-`; type CSS contains `--md-typescale-display-weight-medium:`; geometry CSS contains `--md-size-md-height:` and `.md-control-md {`. Run: `npm test` | exit 0 | the preset path emits `--md-sys-*`, so the new assertions red | put the old triple back at the settings.js apply line (`idOrBrand === "material"`): the new forms vanish, rxr4 reds |
| C1.4 | headless group rxr4 (`test/ui/headless-boot.mjs`) selects the Material preset and asserts the note and zip README name `--md-color-*`; settings `_namingScheme()` returns `"material"` for `md-color`/`md-typescale`/`md` | `npm test` exit 0 | asserts `--md-sys-color-*` | put the old triple back in the `_namingScheme()` detector only: it returns `"custom"`, rxr4 reds |
| C1.5 | `exportUI3(defaultDocument())` and the same with the Material preset applied: variable and collection names equal byte-for-byte; `git diff $(git merge-base origin/main HEAD) -- figma/binder/migrations.mjs` | names identical; empty diff | identical (prefix never reaches UI3) | inject the prefix into a UI3 name: names differ, and the migrations rule then requires an entry |
| C1.6 | `exportCSS(defaultDocument())` sha256 at HEAD versus merge-base, from line 2 on (`tail -n +2`; line 1 is the schema stamp that C1.9 moves) | equal | n/a | change the default `colorPrefix`: hashes differ |
| C1.7 | `npm test` then `git status --porcelain` | exit 0, empty | exit 0 | leave a generated asset stale: tree dirty |
| C1.8 | `hydrate(serialize(kit with colorPrefix "md-sys-color", typePrefix "md-sys-typescale", geomPrefix "md-sys"))` returns `md-color`/`md-typescale`/`md`; a lone `colorPrefix:"md-sys-color"` with a non-Material type prefix stays as typed | both true | first returns `md-sys-*` | drop the rewrite: first assertion reds |
| C1.9 | `git show $(git merge-base origin/main HEAD):src/engine/exports.js \| grep -o "EXPORT_SCHEMA_VERSION = [0-9]*"` versus the same on HEAD; `SERVER.version` in `mcp/brand-kit-core.mjs` versus merge-base | HEAD constant equals merge-base value plus 1; `SERVER.version` minor moves by one; `npm test` exit 0 (`test/mcp/brand-kit.mjs` pins the package version to `SERVER.version`) | `3` on both, `0.3.0` on both (4 and 0.4.0 after #789) | leave the constant at the merge-base value: values equal, check reds |

### U2 criteria

| # | Check | Expected | Today | Negative control |
|---|---|---|---|---|
| C2.1 | `git grep -c md-sys -- plugin .claude/skills docs/marketing` | no output, exit 1 | 17 lines over 13 files (plugin 8, geometry-system skill 2, marketing 7) | leave the `--md-sys-color-*` line in `token-integrator.md` unchanged: grep prints it |
| C2.2 | dropped in revision 1: no plugin parity test sees the prefix, C2.1 owns the needle | n/a | n/a | n/a |
| C2.3 | `awk '/^## \[Unreleased\]/{f=1;next} /^## \[/{f=0} f' CHANGELOG.md \| grep -cF -- '--md-*'` and the same slice `\| grep -c md-sys` | first at least 1; second 0 | first 0; second 2 (the Unreleased naming-scheme note) | drop the new entry: first reads 0; leave the old note: second reads 2 |
| C2.4 | `node test/repo/em-dash.mjs` and `test/repo/branding.mjs` | exit 0 | exit 0 | add a U+2014 to a touched file: reds |

The existing naming-scheme note sits inside `## [Unreleased]`, so it is rewritten to the new names (it would be false at release); C2.3 checks it. Left as history, never rewritten: `docs/plan/archive/*`, `docs/reference/reviews/2026-07-17-export-drift.md`, `.sdlc/records/*`, `.sdlc/plans/archive/*`.

## 4. Owner rulings (2026-10-03, relayed by the Conductor)

- Q1 A (the recommendation). `hydrate` rewrites the exact old triple (all three of `md-sys-color`, `md-sys-typescale`, `md-sys`) to `md-color`/`md-typescale`/`md`, once, on load. Nothing emits the old names afterwards. A lone `md-sys-color` with any other type or geometry prefix stays as typed. C1.8.
- Q2 B (not the recommendation). `EXPORT_SCHEMA_VERSION` moves to the merge-base value plus 1, never a fixed number, and `SERVER.version` moves with it. In scope for U1. C1.9.

## 5. Sequencing against prime-name #789

File overlap: `src/engine/exports.js` (comment at `:415` only), `src/engine/ds-export.js` (prose at `:766`, `:1557`), `test/engine/exports.mjs`, `CHANGELOG.md`, regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js`. The hunks are disjoint but the generated assets always conflict. Land after #789: cut `plan/md-prefix` off `origin/main` once #789 merges, then regenerate. The merge-base rule (C1.9) stays correct in any order with #789 and compute-layers #788.

## Revisions

| # | Date | Change |
|---|---|---|
| 2 | 2026-10-03 | Orchestrator, mobilization: ticket 791 minted; frontmatter status normalized to `approved`; no criterion changed |
| 3 | 2026-10-03 | Orchestrator, md-U1 builder finding: C1.6 as written (whole-file sha256) cannot hold with C1.9, since line 1 of the CSS export is the schema stamp; the hash now excludes line 1, the control is unchanged |
