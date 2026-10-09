## Task goal
The editor shell is one standardized UI: a single text-role system, one inset and radius composition rule for every container, one anatomy table for every control, one glyph motion set, all derived from the Maison ladder cell, with the shell defaulting to the product tier, sm scale, md size.

## Step 1: Role, anatomy and motion tables in a pure module with a unit test
level: L3
### Do
Depends on: none. The design is `.sdlc/ui-standardization/architect-L1.md` (Approach, Interfaces, Carry forward), with the user's 2026-10-09 change recorded in the handoff Intent: chips and segmented controls use the control text size; only badges and tags use the compact row, and `--ui-chip` is renamed `--ui-badge`.
1. New `src/ui/shell-roles.mjs`, pure ESM with no DOM. It imports `LADDER_ROWS` from `../engine/geometry.mjs` and `uiText` from `../engine/type.mjs`, nothing else. Exports:
   - `UI_ROLES`, frozen, exactly these nine keys. Each value is `{ step, weight, lineHeight, tracking, textCase, ink, family }`; `family` is `"sans"` except code:
     - `"pane-title"`: 0, 600, 1, `"0"`, `"none"`, `"ink"`
     - `"element-title"`: -1, 600, 1.2, `"0"`, `"none"`, `"ink"`
     - `kicker`: -2, 700, 1, `".06em"`, `"uppercase"`, `"ink-dim"` (the faint-heading fix: `--ink-dim`, not `--ink-faint`)
     - `label`: -1, 500, 1.3, `"0"`, `"none"`, `"ink-dim"`
     - `control`: 0, 500, 1, `"0"`, `"none"`, `"ink"`
     - `badge`: `"badge"` (the engine compact row, the cell's `chipText`), 600, 1, `".02em"`, `"none"`, `"ink-dim"`
     - `helper`: -2, 400, 1.4, `"0"`, `"none"`, `"ink-dim"`
     - `body`: 0, 400, 1.5, `"0"`, `"none"`, `"ink"`
     - `code`: -1, 400, 1.4, `"0"`, `"none"`, `"ink"`, family `"mono"`
   - `WEIGHTS = { regular: 400, medium: 500, strong: 600, heavy: 700 }` (the four role weights; a rule that sets only a weight uses one).
   - `MOTION = { fast: 120, base: 180, ease: "cubic-bezier(.2, 0, 0, 1)" }` (ms).
   - `edge(cell)` = `Math.max(1, Math.round(cell.icon / 8))`.
   - `roleText(cell, step, uiTextAt)`: `step` `"badge"` returns `cell.chipText`. Otherwise find the row of `cell.height` in `LADDER_ROWS` (descending), move `-step` rows down (step is 0, -1, -2 or -3), clamp at the last row (height 12), and return `uiTextAt ? uiTextAt[h] : uiText(h)` for that row's height. `uiTextAt` is a typeScale `uiText` map (height to px) or null.
   - `CONTROL_ANATOMY`: kinds `button`, `icon-only`, `input`, `select`, `trigger`, `chip`, `badge`, `switch`, `range`, each a function `(cell) => object of px`. H, P, I = cell height, inset, icon; cH, cP = chipHeight, chipInset; e = `edge(cell)`:
     - button: `{ height: H, inset: P, gap: P / 2, glyph: I, radius: cell.radiusControl }`
     - icon-only: `{ height: H, width: H, inset: 0, glyph: I, radius: cell.radiusControl }`
     - input: same as button
     - select: `{ height: H, inset: P, lane: I + P, caret: 0.6 * I, radius: cell.radiusControl }`
     - trigger: button plus `caret: I`
     - chip (the interactive chip, user ruling): `{ height: H, inset: P, gap: P / 2, glyph: I, radius: H / 2 }`
     - badge: `{ height: cH, inset: cP, gap: cP / 2, glyph: cH - 2 * cP, radius: cH / 2 }`
     - switch: `{ trackWidth: 1.75 * I, trackHeight: I, thumb: I - 2 * e, edge: e, radius: I / 2 }`
     - range: `{ track: 0.4 * I, thumb: 1.25 * I }`
   - `CONTAINER_COMPOSITION`: kinds `segmented`, `tab-row`, `menu`, `input-group`, `switch-track`, each `(cell) => ({ padding, radius, partHeight, partInset, partRadius })`: segmented and tab-row `partInset, radiusControl, partHeight, partInset, radiusInset`; menu `partInset, radiusCard, height, inset, radiusControl`; input-group `0, radiusControl, height, inset, radiusControl`; switch-track `e, I / 2, I - 2e, e, (I - 2e) / 2`.
   - `shellRolesCSS(cell, uiTextAt, hostKey)` returns one block, the selector line ending in `{` on its own line: `ultimate-tokens[data-ut-geom="<hostKey>"] {`, then one declaration per line, `--ui-text-step-0` to `--ui-text-step-3` (`roleText` at steps 0, -1, -2, -3), `--ui-badge-icon` (`cH - 2 * cP`), `--ui-edge`, each as `<name>: <n>px;`, then `}`.
2. New `test/ui/shell-roles.mjs`, self-reporting like the other `test/ui/*.mjs` files (prints, then `process.exit`):
   - The row-step check is derived independently: walk `Object.keys(UI_TEXT)` sorted by height descending (from `src/engine/type.mjs`), not `LADDER_ROWS`. On all 27 cells of `geomScale({})`, steps 0 to -3 match; step 0 equals `cell.text`; the micro cells clamp at row 12; `badge` equals `chipText`; with a factor-1.25 `uiText` map the steps follow it.
   - Anatomy on all 27 cells: every value finite and positive where the table says so; `select.lane === icon + inset`; `chip.height === height`; `badge.glyph === chipHeight - 2 * chipInset`; `switch.thumb + 2 * edge === icon`.
   - Composition law on all 27 cells: segmented and menu `radius === partRadius + padding`.
   - `shellRolesCSS` names the host key and every emitted variable.
   - At least one negative control: the row-step check rejects a stand-in `roleText` that ignores the step.
   - Pass line: `shell-roles: pass, <n> checks over 27 cells`.
3. Register `"ui/shell-roles.mjs"` in `test/run.mjs` `TESTS`, right after `"ui/shell.mjs"`.
4. Nothing imports the module yet, so `scripts/bundle.mjs` is step 2's. Run `node test/ui/shell-roles.mjs`.
### Acceptance criteria
- (red) `node test/ui/shell-roles.mjs`
- (red) `grep -qF '"ui/shell-roles.mjs"' test/run.mjs`
- (red) `node --input-type=module -e 'import * as S from "./src/ui/shell-roles.mjs"; import { geomScale } from "./src/engine/geometry.mjs"; import { uiText } from "./src/engine/type.mjs"; const want = ["pane-title","element-title","kicker","label","control","badge","helper","body","code"]; const cells = geomScale({}).cells; const px = (k) => [0,-1,-2,-3].map((s) => S.roleText(cells[k], s, null)).join(); const f = Object.fromEntries([96,92,88,84,80,76,72,68,64,60,56,52,48,44,40,36,32,28,24,22,20,18,16,14,12].map((h) => [h, uiText(h, 1.25)])); const css = S.shellRolesCSS(cells["product-sm-md"], null, "7"); const ok = Object.keys(S.UI_ROLES).sort().join() === [...want].sort().join() && S.UI_ROLES.kicker.step === -2 && S.UI_ROLES.kicker.ink === "ink-dim" && S.UI_ROLES.badge.step === "badge" && S.UI_ROLES.code.family === "mono" && px("product-sm-md") === "13,12,11,10" && px("content-lg-md") === "22,21,20,19" && px("micro-sm-md") === "7.5,7,7,7" && S.roleText(cells["product-sm-md"], -1, f) === 15 && Object.values(cells).every((c) => S.roleText(c, 0, null) === c.text) && css.includes("ultimate-tokens[data-ut-geom=\"7\"] {") && ["--ui-text-step-0: 13px;","--ui-text-step-1: 12px;","--ui-text-step-2: 11px;","--ui-text-step-3: 10px;","--ui-badge-icon: 11px;","--ui-edge: 2px;"].every((d) => css.includes(d)) && S.MOTION.fast === 120 && S.MOTION.base === 180 && S.CONTROL_ANATOMY.chip(cells["product-sm-md"]).height === 28 && S.CONTROL_ANATOMY.badge(cells["product-sm-md"]).height === 20 && ["button","icon-only","input","select","trigger","chip","badge","switch","range"].every((k) => typeof S.CONTROL_ANATOMY[k] === "function") && ["segmented","tab-row","menu","input-group","switch-track"].every((k) => typeof S.CONTAINER_COMPOSITION[k] === "function"); process.exit(ok ? 0 : 1)'`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/styles.css src/ui/app.js src/ui/icons.js src/ui/overlays src/ui/sections scripts test/repo test/smoke docs)$(git ls-files --others --exclude-standard -- src/ui/overlays src/ui/sections scripts test/repo test/smoke docs)"`
