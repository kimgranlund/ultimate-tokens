---
status: draft
ticket: none yet (minted on approval)
priority: P2
lane: naming-scheme (`src/ui/overlays/settings.js`, `src/engine/ds-export.js` prose, comments in `src/engine/{exports.js,type.mjs,geometry.mjs}` and `src/ui/overlays/drawer.js`, `test/engine/{exports,type,geometry}.mjs`, `test/ui/{persist,headless-boot}.mjs`, `src/ui/persist.js` only if Q1 rules A, `plugin/ultimate-tokens/`, `.claude/skills/geometry-system/`, `CHANGELOG.md`, `docs/marketing/`; regenerated `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`)
size: S+S (2 points)
labels: kind:feature · status:backlog · size:small · P2
written: 2026-10-03
head: b7332999 (`origin/main`, revision 0)
depends: Q1 and Q2 (section 4); sequence after prime-name #789 (section 5)
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
- Schema: names change only under an opt-in preset; JSON/DTCG/UI3 keys do not carry the CSS prefix. See Q2.

## 3. Units

- [ ] U1 (S) Preset and emitted prose: settings.js triple, comments, ds-export prose, tests, regenerated assets (builder-l2)
- [ ] U2 (S) Records: consumer plugin, geometry-system skill, CHANGELOG, marketing corpus via `marketing-manager-agent` (builder-l1)

### U1 criteria

| # | Check (command) | Expected | Today | Negative control |
|---|---|---|---|---|
| C1.1 | `git grep -n "md-sys" -- src test mcp figma/binder figma/plugin/code.js scripts` | no output, exit 1 | 40+ hits (settings.js 8, exports/type/geometry/drawer/ds-export comments, tests) | leave settings.js `:119` unchanged: hits return |
| C1.2 | `grep -c "md-sys" figma/plugin/ui.html src/ui/describe-mcp-assets.js` after `npm test` | `0` each | `19`, `4` | skip regeneration: counts nonzero |
| C1.3 | `node -e` script: `exportCSS({...defaultDocument(), export:{colorPrefix:"md-color"}})` contains `--md-color-` and no `--md-sys-`; `typeTokensCSS(s,{prefix:"md-typescale"})` contains `--md-typescale-display-weight-medium:`; `geomTokensCSS(g,{prefix:"md"})` contains `--md-size-md-height:`, `--md-radius-default: var(--md-radius-md);`, `.md-control-md {` | all true | the `md-sys` forms are true, the new forms need the new prefix values the tests do not use yet | revert the test edits in `test/engine/{type,geometry}.mjs`: the new forms are untested and C1.1 reds |
| C1.4 | headless group rxr4 (`test/ui/headless-boot.mjs`) selects the Material preset and asserts the note and zip README name `--md-color-*`; settings `_schemeId()` returns `"material"` for `md-color`/`md-typescale`/`md` | `npm test` exit 0 | asserts `--md-sys-color-*` | set the preset triple back to `md-sys-*` in settings.js: rxr4 reds |
| C1.5 | `exportUI3(defaultDocument())` and the same with the Material preset applied: variable and collection names equal byte-for-byte; `git diff origin/main -- figma/binder/migrations.mjs` | names identical; empty diff | identical (prefix never reaches UI3) | inject the prefix into a UI3 name: names differ, and the migrations rule then requires an entry |
| C1.6 | `exportCSS(defaultDocument())` sha256 at HEAD versus merge-base | equal | n/a | change the default `colorPrefix`: hashes differ |
| C1.7 | `npm test` then `git status --porcelain` | exit 0, empty | exit 0 | leave a generated asset stale: tree dirty |
| C1.8 (only if Q1 = A) | `hydrate(serialize(kit with colorPrefix "md-sys-color", typePrefix "md-sys-typescale", geomPrefix "md-sys"))` returns `md-color`/`md-typescale`/`md`; a lone `colorPrefix:"md-sys-color"` with a non-Material type prefix stays as typed | both true | first returns `md-sys-*` | drop the rewrite: first assertion reds |

### U2 criteria

| # | Check | Expected | Today | Negative control |
|---|---|---|---|---|
| C2.1 | `git grep -n "md-sys" -- plugin .claude/skills docs/marketing` | no output | 10 hits (plugin 7, geometry-system skill 2, marketing 6) | leave `token-integrator.md:35` unchanged: hit returns |
| C2.2 | `npm test` (plugin skill parity in `test/plugin/`) | exit 0 | exit 0 | reintroduce `--md-sys-color-*` in `skills/color-tokens/SKILL.md:43`: C2.1 reds |
| C2.3 | `CHANGELOG.md` Unreleased has one entry naming `--md-sys-*` to `--md-*` and saying old names are not kept (R98); the historical entry at `:438` is left as history | one new entry; `:438` unchanged | no entry | delete the entry: grep for `--md-\*` in Unreleased returns nothing |
| C2.4 | `node test/repo/em-dash.mjs` and `test/repo/branding.mjs` | exit 0 | exit 0 | add a U+2014 to a touched file: reds |

Left as history, never rewritten: `CHANGELOG.md:438`, `docs/plan/archive/*`, `docs/reference/reviews/2026-07-17-export-drift.md`, `.sdlc/records/*`, `.sdlc/plans/archive/*`.

## 4. Owner questions

- Q1. Kits already saved on the Material preset. A (recommended): `hydrate` rewrites the exact old triple (all three of `md-sys-color`, `md-sys-typescale`, `md-sys`) to the new triple, once, on load. It is a data migration, not an alias: nothing emits the old names afterwards. B: leave saved strings as typed; those kits read as Custom and keep exporting `--md-sys-*` until the user re-picks Material.
- Q2. Schema version. A (recommended): no bump. The default kit is byte-identical (C1.6), no JSON/DTCG/UI3 key moves, and the change is an opt-in preset's string. B: bump to the merge-base value plus 1, adding C1.9 `EXPORT_SCHEMA_VERSION` at HEAD equals merge-base value plus 1 (control: leave it, check reds), and `mcp/brand-kit-core.mjs` `SERVER.version` moves with it.

## 5. Sequencing against prime-name #789

File overlap: `src/engine/exports.js` (comment at `:415` only), `src/engine/ds-export.js` (prose at `:766`, `:1557`), `test/engine/exports.mjs`, `CHANGELOG.md`, regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js`. The hunks are disjoint but the generated assets always conflict. Land after #789: cut `plan/md-prefix` off `origin/main` once #789 merges, then regenerate. If Q2 = B, the merge-base rule stays correct in any order with #789 and compute-layers #788.
