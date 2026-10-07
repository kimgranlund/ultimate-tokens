## Task goal
Rebuild the Geometry system of ultimate-tokens on the Maison ui-kit geometry system (user decision 2026-10-07: "for the Geometry system, let's use the maison ui-kit system... we should name tokens according to our standards of course, but this is a standard system to follow for now"). Geometry's per-step text size still composes from the Type UI scale (project invariant).

## Step 14: Gates green
level: L3
guard timeout: 900
### Do
Depends on: steps 1 to 13.
- In the lane worktree, run `npm ci` first if `node_modules` is missing (it is untracked).
- Run each gate through `gate_lock.py run --name <gate> -- <cmd>` (SDLC_GATE_WORKERS=10, per the handoff): `npm test` (regenerates the committed assets, then runs `test/run.mjs`) and `npm run build`.
- Fix every red that steps 1 to 13 introduced, including regenerated assets: `figma/plugin/ui.html`, `src/ui/*-assets.js`, `src/ui/categories/*.js`, `docs/reference/data/adia-*`.
- `npm run gate:sweeps` is not run: every sweep in it gates the color engine (`package.json` `gate:sweeps`: corpus-tonal, corpus-anchor, sweep-prime, corpus-reset, corpus-contrast, mode-isolation, even-dips, chroma-envelope), which this plan does not touch.
- `npm run smoke` and `panda-smoke` run only in CI; say so in the summary. No push, PR or issue.
### Acceptance criteria
- (guard) `npm test`
- (guard) `npm run build`
- (red) `! git grep -qE 'RAMP_LADDER|rampContrast|GEOMETRY_TREATMENTS|LADDER_SIZE_KEYS|CONTROL_FONT|GAP_UNIT' -- src scripts mcp figma plugin ':!src/ui/persist.js' ':!src/ui/describe-mcp-assets.js' ':!figma/plugin/ui.html'`
- (guard) `node test/repo/em-dash.mjs`
