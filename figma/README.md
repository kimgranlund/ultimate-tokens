# figma/

Two plugins live here, per the `maintaining-figma-plugins` skill (load it before touching either):

- **`figma/plugin/`**: the generator itself, running inside Figma as a plugin. `manifest.json`
  points `main` at `code.js` and `ui` at `ui.html`; import it in Figma via *Plugins > Development >
  Import plugin from manifest...* and pick `figma/plugin/manifest.json`. `ui.html` is generated, not
  hand-edited: `npm run gen:figma-ui` (`scripts/gen-figma-ui.mjs`) builds it from the offline
  single-file bundle (`dist/ultimate-tokens.html`) plus a small Figma-bridge `<script>` that flips
  the app's `inFigma` flag over the UI/code `postMessage` contract. `code.js` runs inside Figma's
  plugin sandbox: it reads/writes variables (raw colors under a **Color Primitives** collection, the
  semantic Light/Dark tokens under **Color Roles**, aliased to the primitives) and embeds the
  parametric config in the file's root `pluginData` for a lossless round-trip. `npm test` and
  `npm run build` both regenerate `ui.html` (`gen:figma-ui` runs before `test/run.mjs`), so it is
  never committed out of sync with the source bundle.
- **`figma/binder/`**: the standalone **Semantic Binder**
  (`figma/binder/figma-semantic-binder/`), which aliases each semantic role to its raw variable so
  editing a raw color cascades live. `figma-semantic-binder/manifest.json` and `code.js` are the
  shipped plugin. `code.js` is hand-authored around three marker-spliced sections
  (`// === GENERATED:<NAME> START/END ===`): `FLOAT_EXECUTOR` and `COLOR_EXECUTOR`, spliced verbatim
  from the flagship `figma/plugin/code.js`, and `ROLE_TABLE`, the body of `src/engine/semantic.js`'s
  `semanticRoles()` re-wrapped as `roleTable()`. `scripts/gen-figma-binder-code.mjs` rewrites only
  the text between each marker pair; `npm test` and `npm run build` run it as the first half of
  `gen:figma-assets`. Every other line is hand-kept: the binding loop mirrors `bind-plan.mjs`, and
  `SEMANTIC_RENAME_FROM`, `LIBRARY_TYPE_VOICE_MAP` and `GEOMETRY_FIELD_RENAME_MAP` mirror
  `migrations.mjs`, because the Figma sandbox cannot import a `.mjs` module at run time; the `renameparity` gate in `test/figma/binder.mjs` deep-compares all three (and the flagship's two maps) against `migrations.mjs`, so a hand edit that drifts reds `npm test`. Beside it live
  six pure top-level `.mjs` modules: three planners (`bind-plan`, `mode-apply-plan`, `style-plan`), a
  live diff, the migration maps and one splice helper:
  - `binder/bind-plan.mjs`: plans the COLOR alias cascade (semantic to raw, Light/Dark); the tested
    model of the binder's binding loop.
  - `binder/mode-apply-plan.mjs`: plans the Type/Geometry token write across breakpoint modes.
  - `binder/style-plan.mjs`: plans the Figma STYLES swatches (paint styles on Color Roles, text
    styles on Type/Geometry primitives).
  - `binder/live-diff.mjs`: compares a live Figma read-back against an apply plan so the apply gate
    can show "N values will be overwritten" before the user commits.
  - `binder/migrations.mjs`: the active rename/retire migration maps, imported by the app so every
    executor path receives the same maps.
  - `binder/splice-utils.mjs`: the shared brace-matched source-extraction helpers the generator and
    its gate both use.

`npm test` runs six verifiers under `test/figma/`: `binder.mjs` (`bind-plan.mjs`, plus the
`parity`, `floatparity` and `colorparity` gates, which prove each generated section of the binder's
`code.js` matches its canonical source), `mode-apply.mjs`, `style-plan.mjs`, `live-diff.mjs` and
`migrations.mjs` (each over the module it names), and `plugin.mjs` for the app-as-plugin path.
