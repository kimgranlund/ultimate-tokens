<!-- role=planner level=L3 model=opus effort=xhigh -->
## Goal
Standardize the editor shell on one text-role system, one control and container anatomy, one glyph motion set, all derived from the Maison ladder cell, and default the chrome to product-sm-md round, gated by `test/repo/shell-text.mjs` and proven in smoke at product-sm and content-lg in light and dark.

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

## Step 2: Role aliases in the shell block and per-host step variables
level: L4
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
- `docs/reports/AGENTS.md`
### Do
Depends on: step 1. T-0043 (`2d3199e5`) may land on main first and also edits `src/ui/styles.css`, `src/ui/app.js`, `scripts/bundle.mjs` and `test/ui/headless-boot.mjs`: find every rule and symbol by name, not by the `~:line` given here.
1. In the `ultimate-tokens { ... }` alias block of `src/ui/styles.css` (~:75-90), add these declarations. Keep the existing `--sh-*` lines and their product-md-md fallbacks; step 10 moves those fallbacks.
   - `--sh-radius-card: var(--radius-card, 16.5px); --sh-radius-mark: var(--radius-mark, 6.5px);` (the resolver emits both roles: `geomResolverCSS` holds `--radius-card:` and `--radius-mark:`).
   - `--ui-weight-regular: 400; --ui-weight-medium: 500; --ui-weight-strong: 600; --ui-weight-heavy: 700;`
   - `--ui-motion-fast: 120ms; --ui-motion-base: 180ms; --ui-motion-ease: cubic-bezier(.2, 0, 0, 1);`
   - For each of the nine roles, four declarations, `--ui-<role>-font`, `-tracking`, `-case`, `-ink`. The font is the role's weight, its size, `/` its line-height, then its family, with product-sm-md fallbacks:
     - `--ui-pane-title-font: 600 var(--ui-text-step-0, 13px)/1 var(--sans);`
     - `--ui-element-title-font: 600 var(--ui-text-step-1, 12px)/1.2 var(--sans);`
     - `--ui-kicker-font: 700 var(--ui-text-step-2, 11px)/1 var(--sans);`
     - `--ui-label-font: 500 var(--ui-text-step-1, 12px)/1.3 var(--sans);`
     - `--ui-control-font: 500 var(--ui-text-step-0, 13px)/1 var(--sans);`
     - `--ui-badge-font: 600 var(--sh-chip-text)/1 var(--sans);`
     - `--ui-helper-font: 400 var(--ui-text-step-2, 11px)/1.4 var(--sans);`
     - `--ui-body-font: 400 var(--ui-text-step-0, 13px)/1.5 var(--sans);`
     - `--ui-code-font: 400 var(--ui-text-step-1, 12px)/1.4 var(--mono);`
     - Tracking is `0` except kicker `.06em` and badge `.02em`. Case is `none` except kicker `uppercase`. Ink is `var(--ink)` for pane-title, element-title, control, body and code, and `var(--ink-dim)` for kicker, label, badge and helper.
   - Update the block's comment: the `--ui-*` roles, the step variables injected per host, and that no other rule declares a `--ui-*` property.
2. `src/ui/app.js`: add `import { shellRolesCSS } from "./shell-roles.mjs";` beside the other `./` imports. In `_applyShellGeometry` (~:2522), append to the generated `css`, before the `textContent` compare: `"\n" + shellRolesCSS(sc.cells[`${g.tier}-${g.scale}-md`], this.doc ? this._typeScaleFor("base").uiText : null, this._geomKey)`. `_typeScaleFor` is the helper `overlays/drawer.js:405` already calls. The role block then sits in the same keyed head `<style>`, so two hosts never share it.
3. `scripts/bundle.mjs`: add the MODS entry `["shellRoles", "src/ui/shell-roles.mjs"],` after `["model", ...]` and before `["appHelpers", ...]`, and the KEY entry `"shell-roles.mjs": "shellRoles"`. Its imports (`geometry.mjs`, `type.mjs`) sit earlier in MODS. Run `node scripts/bundle.mjs`; its integrity scan fails on a missing or misordered entry.
4. `test/ui/shell-roles.mjs` gains the alias parity leg. It parses the `ultimate-tokens { ... }` blocks of `src/ui/styles.css` and checks:
   - For each `UI_ROLES` entry: the weight, `var(--ui-text-step-<-step>` (or `var(--sh-chip-text` for badge), `/<lineHeight> `, and `var(--sans)` or `var(--mono)` in its font; and its tracking, case and ink values.
   - Every `--ui-text-step-N`, `--ui-badge-icon` and `--ui-edge` the stylesheet reads is a name `shellRolesCSS` emits.
   - No rule other than the alias block declares a `--ui-*` property.
   - A negative control: the parity check rejects an alias text with the kicker on step 1.
   - The pass line gains `, alias block parity`.
5. `test/ui/headless-boot.mjs`, group `(shg)` (~:157-200):
   - shg5's `blocks.length === 16` becomes 17, with its message: the role block is the 17th and names the host.
   - New `(shg7)`: the host style text holds `--ui-text-step-0:` and `--ui-text-step-2:` inside the `ultimate-tokens[data-ut-geom="<key>"] {` block. Then set `app.shellGeometry = { tier: "content", scale: "lg", radius: "round" }`, render, and flush. The text now holds `--ui-text-step-0: <n>px;` where n is `app._geomScaleFor("base").cells["content-lg-md"].text`. Restore `app.shellGeometry = null` and render.
6. Citations: `styles.css` and `app.js` lines shift. Run `node scripts/audit-citations.mjs --md` and repair each STALE `styles.css:N` and `app.js:N` cite by number in `docs/references/component-inventory.md`, `docs/specs/app-shell.md` and `docs/reports/2026-08-20-reactivity/0*.md`. Then `node test/repo/citations.mjs` must be green.
7. Regenerate `figma/plugin/ui.html` with `npm run bundle && npm run gen:figma-ui` (no `node_modules` needed). Never hand-edit it.
8. Run `node test/ui/shell-roles.mjs`, `node test/ui/headless-boot.mjs`, `node test/repo/control-text.mjs`, `node test/repo/ui-polish.mjs`, `node test/repo/citations.mjs`.
### Acceptance criteria
- (red) `node -e 'const c=require("fs").readFileSync("src/ui/styles.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const blocks=[...c.matchAll(/(?<=^|\})\s*ultimate-tokens\s*\{([^}]*)\}/g)].map((m)=>m[1]).join(";");const v=(n)=>{const m=blocks.match(new RegExp("(^|[;\\s])"+n+"\\s*:\\s*([^;]+)"));return m?m[2].trim():""};const roles=["pane-title","element-title","kicker","label","control","badge","helper","body","code"];const miss=[];for(const r of roles)for(const p of ["font","tracking","case","ink"])if(!v("--ui-"+r+"-"+p))miss.push("--ui-"+r+"-"+p);for(const n of ["--ui-weight-regular","--ui-weight-medium","--ui-weight-strong","--ui-weight-heavy","--ui-motion-fast","--ui-motion-base","--ui-motion-ease","--sh-radius-card","--sh-radius-mark"])if(!v(n))miss.push(n);[[v("--ui-kicker-font"),"var(--ui-text-step-2"],[v("--ui-element-title-font"),"var(--ui-text-step-1"],[v("--ui-pane-title-font"),"var(--ui-text-step-0"],[v("--ui-badge-font"),"var(--sh-chip-text"],[v("--ui-code-font"),"var(--mono)"],[v("--ui-kicker-case"),"uppercase"],[v("--ui-kicker-ink"),"var(--ink-dim)"],[v("--sh-radius-card"),"var(--radius-card"],[v("--ui-motion-fast"),"120ms"]].forEach(([a,b])=>{if(!a.includes(b))miss.push(b)});miss.forEach((m)=>console.log("missing",m));process.exit(miss.length?1:0)'`
- (red) `grep -qE '^import \{[^}]*shellRolesCSS[^}]*\} from "\./shell-roles\.mjs";' src/ui/app.js && grep -qF '["shellRoles", "src/ui/shell-roles.mjs"]' scripts/bundle.mjs && grep -qF '"shell-roles.mjs": "shellRoles"' scripts/bundle.mjs`
- (red) `node test/ui/shell-roles.mjs | grep -qF 'alias block parity'`
- (red) `grep -qF '(shg7)' test/ui/headless-boot.mjs && node test/ui/headless-boot.mjs`
- `node scripts/bundle.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `node test/repo/control-text.mjs`
- (guard) `node test/repo/ui-polish.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/sections src/ui/overlays src/ui/icons.js test/repo test/smoke .claude/skills docs/references/decision-records.md)$(git ls-files --others --exclude-standard -- src/ui/sections src/ui/overlays test/repo test/smoke .claude/skills)"`

## Step 3: The shell text gate, with the not-yet-migrated families pending
level: L3
### Read first
- `docs/references/AGENTS.md`
### Do
Depends on: step 2 (the gate's samples read `--ui-*` names the alias block declares).
1. Run `git mv test/repo/control-text.mjs test/repo/shell-text.mjs`. This is a rename, not a delete, so the T-0027 history follows the file. Then rewrite it as the widened gate. Its comments name the predecessor as "the T-0027 control gate", never by its old file name, so the dependents grep below stays clean.
2. What it checks. It walks every style rule, descending into `@media` and `@supports`, skipping `@keyframes` and custom-property declarations (`--*`), as `control-text.mjs:53-75` did.
   - Text, on every rule not allow-listed:
     - `font-size`, `letter-spacing`: a nonzero literal length is flagged.
     - `font-weight`: a numeric literal is flagged.
     - `text-transform`: anything but `none`, `inherit` or `capitalize` is flagged. `capitalize` is a data word's case, not a role's.
     - `line-height`: anything but `1`, `normal`, `inherit` or `0` is flagged.
     - `font` shorthand with no `var(`: flagged unless a later `font-size` in the same rule reads `var(`, the old gate's rule.
   - Geometry, on control and container kinds: `padding*`, `gap` and `border-radius` with a nonzero literal length outside `var(` are flagged, except `border-radius: 50%` (a circle is a shape, not a size). The kinds are the old gate's `ELEMENTS`, `LITERALS` and `CLASSES`, plus `tools-menu`, `tools-more`, `linklike` and `.toggle .track`.
3. `ALLOW`: `[needle, reason]` pairs. A selector is exempt when it contains the needle, unless it contains one of the NAMED chrome exceptions `.ex-collapse-toggle` or `.ex-artifact-title`. Entries and reasons:
   - Specimens painted at a kit cell: `.ex-`, `.geom-ex-`, `.geom-ctl`, `.geom-glyph`, `.geom-caret`. `.geom-ctl` is the ramp's live mock control, sized by inline style (`sections/geometry.js:375`).
   - The gallery is a content page, not the editor chrome: `.gallery-`, `.masthead`, `.category-`, `.categories-`, `.set-`, `.tile-`, `.new-tile`, `.figma-import-row`, `.preset-vol`.
   - `.brand`: the wordmark is a logotype.
   - Drawn glyphs: `.drag-handle::before`, `.radix-step::after`.
   - Chart marks own their scale (T-0029): `.ch-`, `.an-svg`.
   - The exact selector `body`: the page outside the host, kept as the pre-host fallback; the host rule declares the body role (step 4).
   On failure the gate prints each violation, then one `allowed: <needle>: <reason>` line per entry.
4. `PENDING`: `const PENDING = { "step-4": [...], "step-5": [...], "step-6": [...], "step-7": [...], "step-8": [...] };`. A selector is skipped while a pending needle matches it. A needle starting with `=` matches one selector exactly; any other needle matches by substring. The lists:
   - `"step-4"`: `.pane-label`, `.pane-head`, `.an-`, `.mode-editor`, `.compare-col`, `.ramp-`, `.radix-badge`, `.sub-head`, `.mini-check`, `.canvas-footer`, `.app-footer`, `.scrim-`, `.key-cell`, `.toast`
   - `"step-5"`: `.map-table`, `.map-sem`, `.map-reset`, `.map-drift`, `.tok-`, `.insp-`, `.field`, `.key-slot`, `.color-story`, `.color-role`, `.story-`, `.ex-collapse-toggle`, `.ex-artifact-title`
   - `"step-6"`: `.drawer-`, `.figma-note`, `.radix-note`, `.config-note`, `.copy-float`, `.pro-upsell`, `.newpal-`, `.apply-gate-`, `.settings-`, `.acct-`, `.account-`, `.cleanup-`
   - `"step-7"`: `.typo-`, `.type-spec-`, `.ty-role`, `.tyi-voices-head`, `.tyi-weights-core`, `.tyi-voice-font`, `.tyi-voice-stats`, `.tyi-font-role`, `.tyi-font-legend`, `.geom-`
   - `"step-8"`: `=button`, `=select`, `=input[type="text"]`, `=input[type="search"]`, `=.linklike`, `.chip`, `.segmented`, `.figma-files`, `.radix-files`, `.toggle`, `.tyi-voice-name`, `.tyi-font-input`, `.map-raw-`, `.tools-menu`
   This partition covers every flagged declaration on today's tree (a probe found none outside it). If T-0043 or another lane adds an offender, put it in the family its prefix names.
5. CLI: `--strict` ignores `PENDING`. The first non-flag argument is the stylesheet path, default `src/ui/styles.css`; `/dev/stdin` works. Without `--strict` and with pending entries, it also prints `shell-text: <n> declarations pending in <keys>`.
6. Negative controls run first, under strict, and exit 1 if any is not flagged:
   - `.pane-head .pane-title { font-size: 12px; }`
   - `.sub-head { font-weight: 600; }`
   - `.tools-menu:popover-open { border-radius: 16px; }`
   - The old gate's two: `.figma-files button { font-size: 11.5px; }` and `.toggle { font: inherit; }`
   - One allow-list positive, which must pass: `.ex-title { font-size: 15px; }`
7. `test/run.mjs`: replace `"repo/control-text.mjs"` with `"repo/shell-text.mjs"`.
8. Dependents that name the old file, rewritten to name `test/repo/shell-text.mjs` and say it gates text on every shell rule: `.claude/CLAUDE.md:44`, `.claude/skills/building-editor-sections/SKILL.md:119` and `docs/references/component-inventory.md:127-128`. History stays as written: `CHANGELOG.md`, `docs/references/changelog.md`, `docs/reports/2026-10-08-geometry-compound-insets.md`, `docs/archive/`.
9. Run `node test/repo/shell-text.mjs` (green with the pending list), `node test/repo/shell-text.mjs --strict` (red: the families are still literal), `node test/repo/citations.mjs`.
### Acceptance criteria
- (red) `node test/repo/shell-text.mjs`
- (red) `! test -e test/repo/control-text.mjs && grep -qF '"repo/shell-text.mjs"' test/run.mjs && ! grep -qF '"repo/control-text.mjs"' test/run.mjs`
- (red) `test -f test/repo/shell-text.mjs && for s in '.pane-head .pane-title { font-size: 12px; }' '.sub-head { font-weight: 600; }' '.tools-menu:popover-open { border-radius: 16px; }' '.ex-collapse-toggle { font-size: 10.5px; }' '.chip { border-radius: 999px; }' '.settings-note { line-height: 1.55; }'; do if printf '%s\n' "$s" | node test/repo/shell-text.mjs --strict /dev/stdin >/dev/null; then echo "not flagged: $s"; exit 1; fi; done`
- (red) `test -f test/repo/shell-text.mjs && printf '%s\n' '.ex-title { font-size: 15px; }' '.masthead-title { font-size: 22px; }' '.pane-head .pane-title { font: var(--ui-pane-title-font); letter-spacing: var(--ui-pane-title-tracking); text-transform: var(--ui-pane-title-case); }' '.toggle .track::after { border-radius: 50%; }' | node test/repo/shell-text.mjs --strict /dev/stdin`
- (red) `! git grep -nE 'control-text\.mjs|repo/control-text|control-text\)' -- .claude/CLAUDE.md .claude/skills docs/references/component-inventory.md docs/specs test`
- `! node test/repo/shell-text.mjs --strict`
- (guard) `node test/repo/citations.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/engine src/ui/app.js src/ui/styles.css src/ui/sections src/ui/overlays src/ui/icons.js src/ui/shell-roles.mjs scripts test/ui test/smoke)$(git ls-files --others --exclude-standard -- src/engine src/ui/app.js src/ui/styles.css src/ui/sections src/ui/overlays src/ui/icons.js src/ui/shell-roles.mjs scripts test/ui test/smoke)"`

## Step 4: Editor frame text onto the roles (panes, analysis, canvas, footers, toast)
level: L3
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
### Do
Depends on: step 3. Edits only `src/ui/styles.css` (rules whose selector contains a `"step-4"` needle of `test/repo/shell-text.mjs`), that gate's pending list, and doc cites.
1. The rewrite. A rule's literal size, weight, line-height, tracking, case or `font` becomes:
   `font: var(--ui-<role>-font); letter-spacing: var(--ui-<role>-tracking); text-transform: var(--ui-<role>-case);`
   plus `color: var(--ui-<role>-ink)`, unless the rule sets a state color (accent, warn, danger, ok, pass or fail), which it keeps. Further rules:
   - A rule that sets `font-variant-numeric` re-declares it after the shorthand, which resets it (architect Risks).
   - A rule that sets only a weight uses a token: 400 is `var(--ui-weight-regular)`, 500 and 550 `var(--ui-weight-medium)`, 600 and 650 `var(--ui-weight-strong)`, 700 `var(--ui-weight-heavy)`.
   - Layout `gap`, `padding` and `margin` stay as they are (out of scope, architect Rejected alternatives).
   - The criterion's role reader matches `font:` only after a `;`, whitespace or the start of a body, so the alias block's `--ui-*-font:` declarations never read as a use. Keep each `--ui-*` declaration on its own `--` name when editing that block.
2. Roles named by the architect's table and this step (binding):
   - pane-title: `.pane-head .pane-title`, and `.pane-label` (both pane bands take one title role; the left band's uppercase faint eyebrow goes, ratified with the table).
   - kicker: `.compare-col-label`, `.ramp-group-header`, `.sub-head`.
   - label: `.mode-editor-label`, `.mini-check`.
   - helper: `.canvas-footer`, `.app-footer`, `.an-empty`, `.scrim-ctx-note`, `.toast`.
   - badge: `.radix-badge` (a badge by the user's ruling).
   - body: the host rule `ultimate-tokens { display: block; height: 100vh; }` gains `font: var(--ui-body-font); color: var(--ui-body-ink);`. `body { font-size: 13px; }` stays as the pre-host fallback; the gate allow-lists the exact `body`.
3. Fallback for a selector the list does not name (first match wins):
   1. The rule uppercases: kicker.
   2. It sets a monospace family, or names `code`, `pre` or `-token`: code.
   3. It names `h3` or ends in `-title` or `-head b`, and today's size is 14px or more: pane-title.
   4. It names `b`, `strong`, `th`, `-name`, `-title` or `-head`, with weight 600 or more: element-title.
   5. It names `label`, `dt`, `-label` or `-role`: label.
   6. It is a `button`, `select` or `input`: control.
   7. Today's size is 12.5px or more: body.
   8. Anything else: helper.
4. Remove the `"step-4"` key from `PENDING` in `test/repo/shell-text.mjs`.
5. Citations: repair every STALE `styles.css:N` cite in `docs/references/component-inventory.md` and `docs/specs/app-shell.md` by number (`node scripts/audit-citations.mjs --md`).
6. Run the criteria below, plus `node test/repo/shell-text.mjs`.
### Acceptance criteria
- (red) `node -e 'const a=JSON.parse(process.argv[1]);const c=require("fs").readFileSync("src/ui/styles.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const R=[];const w=(f,t)=>{let i=f;while(i<t){const o=c.indexOf("{",i);if(o<0||o>=t)break;const p=c.slice(i,o).trim();let d=1,j=o+1;while(j<t&&d>0){if(c[j]=="{")d++;else if(c[j]=="}")d--;j++}if(p[0]=="@"){if(!p.startsWith("@keyframes"))w(o+1,j-1)}else R.push([p.split(",").map((s)=>s.trim().replace(/\s+/g," ")),c.slice(o+1,j-1)]);i=j}};w(0,c.length);const lit=(p,v)=>!/var\(/.test(v)&&(p=="font"||p=="font-size"&&/[1-9]/.test(v)||p=="font-weight"&&/^[1-9]/.test(v)||p=="letter-spacing"&&/[1-9]/.test(v)||p=="text-transform"&&!/^(none|inherit|capitalize)$/.test(v)||p=="line-height"&&!/^(1|normal|inherit|0)$/.test(v));const inF=(s)=>a.F.some((f)=>s.includes(f))&&!a.X.some((x)=>s.includes(x));const bad=[];for(const[L,b]of R){if(!L.some(inF))continue;for(const d of b.split(";")){const k=d.indexOf(":");if(k<0)continue;const p=d.slice(0,k).trim(),v=d.slice(k+1).trim().replace(/\s*!important$/,"");if(lit(p,v))bad.push(L.join(", ")+" | "+p+": "+v)}}const role=(s)=>{const m=R.filter(([L])=>L.includes(s)).map((r)=>r[1]).join(";").match(/(^|[;\s])font\s*:\s*var\(--ui-([a-z-]+)-font\)/);return m?m[2]:null};for(const[s,r]of Object.entries(a.M))if(role(s)!==r)bad.push(s+" reads "+role(s)+", want "+r);bad.slice(0,4).forEach((x)=>console.log(x));console.log(bad.length+" off");process.exit(bad.length?1:0)' '{"F":[".pane-label",".pane-head",".an-",".mode-editor",".compare-col",".ramp-",".radix-badge",".sub-head",".mini-check",".canvas-footer",".app-footer",".scrim-",".key-cell",".toast","ultimate-tokens"],"X":[".drag-handle::before",".an-svg"],"M":{".pane-head .pane-title":"pane-title",".pane-label":"pane-title",".compare-col-label":"kicker",".ramp-group-header":"kicker",".sub-head":"kicker",".mode-editor-label":"label",".mini-check":"label",".canvas-footer":"helper",".app-footer":"helper",".an-empty":"helper",".scrim-ctx-note":"helper",".toast":"helper",".radix-badge":"badge","ultimate-tokens":"body"}}'`
- `node test/repo/shell-text.mjs && ! grep -qF '"step-4"' test/repo/shell-text.mjs`
- (guard) `node test/repo/ui-polish.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/app.js src/ui/app-helpers.mjs src/ui/sections src/ui/overlays src/ui/icons.js test/ui test/smoke scripts .claude/skills)$(git ls-files --others --exclude-standard -- src/ui/sections src/ui/overlays test/ui test/smoke scripts)"`

## Step 5: Inspector, tables, key colors and story text onto the roles
level: L3
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
### Do
Depends on: step 4. Edits only `src/ui/styles.css` (rules whose selector contains a `"step-5"` needle of `test/repo/shell-text.mjs`), that gate's pending list, and doc cites.
1. The rewrite. A rule's literal size, weight, line-height, tracking, case or `font` becomes:
   `font: var(--ui-<role>-font); letter-spacing: var(--ui-<role>-tracking); text-transform: var(--ui-<role>-case);`
   plus `color: var(--ui-<role>-ink)`, unless the rule keeps a state color (accent, warn, danger, ok, pass or fail). Further rules:
   - `.field > label b` and every other rule with `font-variant-numeric` re-declare it after the shorthand.
   - A rule that sets only a weight uses a token: 400 is `var(--ui-weight-regular)`, 500 and 550 `var(--ui-weight-medium)`, 600 and 650 `var(--ui-weight-strong)`, 700 `var(--ui-weight-heavy)`. `.field > label b` takes `var(--ui-weight-strong)`.
   - Layout `gap`, `padding` and `margin` stay.
2. Roles named by the architect's table and this step (binding):
   - pane-title: `.insp-title`.
   - element-title: `.key-slot .key-role`, `.color-story-name`, `.story-color-name`, `.ex-artifact-title`.
   - kicker: `.color-role` (it keeps `color: var(--accent)`), `.ex-collapse-toggle`.
   - label: `.field > label`.
   - helper: `.insp-sub`.
   - code: `.map-table code`, `.tok-input`.
   - badge: `.tok-sub`, `.key-slot .key-place` (badges by the user's ruling).
   - `.ex-collapse-toggle` and `.ex-artifact-title` are preview chrome, the named exceptions to the `.ex-` specimen prefix.
3. Fallback for a selector the list does not name (first match wins):
   1. The rule uppercases: kicker.
   2. It sets a monospace family, or names `code`, `pre` or `-token`: code.
   3. It names `h3` or ends in `-title` or `-head b`, and today's size is 14px or more: pane-title.
   4. It names `b`, `strong`, `th`, `-name`, `-title` or `-head`, with weight 600 or more: element-title.
   5. It names `label`, `dt`, `-label` or `-role`: label.
   6. It is a `button`, `select` or `input`: control. `.map-reset` is a bare button: control.
   7. Today's size is 12.5px or more: body. `.map-table` at 13px: body.
   8. Anything else: helper.
4. Remove the `"step-5"` key from `PENDING` in `test/repo/shell-text.mjs`. `.map-raw-*` stays pending under `"step-8"` (control kind).
5. Citations: repair every STALE `styles.css:N` cite in `docs/references/component-inventory.md` and `docs/specs/app-shell.md` by number.
6. Run the criteria below, plus `node test/repo/shell-text.mjs`.
### Acceptance criteria
- (red) `node -e 'const a=JSON.parse(process.argv[1]);const c=require("fs").readFileSync("src/ui/styles.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const R=[];const w=(f,t)=>{let i=f;while(i<t){const o=c.indexOf("{",i);if(o<0||o>=t)break;const p=c.slice(i,o).trim();let d=1,j=o+1;while(j<t&&d>0){if(c[j]=="{")d++;else if(c[j]=="}")d--;j++}if(p[0]=="@"){if(!p.startsWith("@keyframes"))w(o+1,j-1)}else R.push([p.split(",").map((s)=>s.trim().replace(/\s+/g," ")),c.slice(o+1,j-1)]);i=j}};w(0,c.length);const lit=(p,v)=>!/var\(/.test(v)&&(p=="font"||p=="font-size"&&/[1-9]/.test(v)||p=="font-weight"&&/^[1-9]/.test(v)||p=="letter-spacing"&&/[1-9]/.test(v)||p=="text-transform"&&!/^(none|inherit|capitalize)$/.test(v)||p=="line-height"&&!/^(1|normal|inherit|0)$/.test(v));const inF=(s)=>a.F.some((f)=>s.includes(f))&&!a.X.some((x)=>s.includes(x));const bad=[];for(const[L,b]of R){if(!L.some(inF))continue;for(const d of b.split(";")){const k=d.indexOf(":");if(k<0)continue;const p=d.slice(0,k).trim(),v=d.slice(k+1).trim().replace(/\s*!important$/,"");if(lit(p,v))bad.push(L.join(", ")+" | "+p+": "+v)}}const role=(s)=>{const m=R.filter(([L])=>L.includes(s)).map((r)=>r[1]).join(";").match(/(^|[;\s])font\s*:\s*var\(--ui-([a-z-]+)-font\)/);return m?m[2]:null};for(const[s,r]of Object.entries(a.M))if(role(s)!==r)bad.push(s+" reads "+role(s)+", want "+r);bad.slice(0,4).forEach((x)=>console.log(x));console.log(bad.length+" off");process.exit(bad.length?1:0)' '{"F":[".map-table",".map-sem",".map-reset",".map-drift",".tok-",".insp-",".field",".key-slot",".color-story",".color-role",".story-",".ex-collapse-toggle",".ex-artifact-title"],"X":[],"M":{".insp-title":"pane-title",".insp-sub":"helper",".field > label":"label",".map-table code":"code",".tok-input":"code",".tok-sub":"badge",".key-slot .key-place":"badge",".key-slot .key-role":"element-title",".color-story-name":"element-title",".story-color-name":"element-title",".color-role":"kicker",".ex-collapse-toggle":"kicker",".ex-artifact-title":"element-title"}}'`
- `node test/repo/shell-text.mjs && ! grep -qF '"step-5"' test/repo/shell-text.mjs`
- (guard) `node test/repo/ui-polish.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/app.js src/ui/app-helpers.mjs src/ui/sections src/ui/overlays src/ui/icons.js test/ui test/smoke scripts .claude/skills)$(git ls-files --others --exclude-standard -- src/ui/sections src/ui/overlays test/ui test/smoke scripts)"`

## Step 6: Dialog text onto the roles (export drawer, New Palette, apply gate, Settings)
level: L3
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
### Do
Depends on: step 5. Edits only `src/ui/styles.css` (rules whose selector contains a `"step-6"` needle of `test/repo/shell-text.mjs`), that gate's pending list, and doc cites.
1. The rewrite. A rule's literal size, weight, line-height, tracking, case or `font` becomes:
   `font: var(--ui-<role>-font); letter-spacing: var(--ui-<role>-tracking); text-transform: var(--ui-<role>-case);`
   plus `color: var(--ui-<role>-ink)`, unless the rule keeps a state color (accent, warn, danger, ok, pass or fail). Further rules:
   - A rule with `font-variant-numeric` re-declares it after the shorthand.
   - A rule that sets only a weight uses a token: 400 is `var(--ui-weight-regular)`, 500 and 550 `var(--ui-weight-medium)`, 600 and 650 `var(--ui-weight-strong)`, 700 `var(--ui-weight-heavy)`. `.settings-nav-item.on` takes `var(--ui-weight-medium)`.
   - Layout `gap`, `padding` and `margin` stay.
2. Roles named by the architect's table and this step (binding):
   - pane-title: `.drawer-head h3`, `.settings-nav-head`, `.settings-pagehead h3` (21px today becomes the cell's step 0; ratified).
   - element-title: `.settings-row-text b`, `.newpal-diagram-title`, `.newpal-ctx-head b`, `.newpal-pp-label`.
   - kicker: `.settings-nav-grouplabel`, `.settings-group-title`.
   - label: `.drawer-systems-label`, `.drawer-format label`, `.newpal-rel-label`.
   - control: `.settings-nav-item`, `.account-license-input`.
   - helper: `.settings-note`, `.settings-row-text small`, `.newpal-rel-hint`, `.drawer-foot .meta`, `.figma-note`, `.radix-note`, `.config-note`, `.apply-gate-warn`, `.apply-gate-learn`, `.apply-gate-drift`, `.apply-gate-dontshow`, `.apply-gate-librarymode`.
   - body: `.settings-about > p`, `.settings-pagehead p`, `.pro-upsell-msg`, `.apply-gate-lede`, `.settings-meta`, `.newpal-note`, `.drawer-systems-note`.
   - code: `.drawer-pre`, `.cleanup-item-label code`.
   - badge: `.acct-badge` (a badge by the user's ruling).
3. Fallback for a selector the list does not name (first match wins):
   1. The rule uppercases: kicker.
   2. It sets a monospace family, or names `code`, `pre` or `-token`: code.
   3. It names `h3` or ends in `-title` or `-head b`, and today's size is 14px or more: pane-title.
   4. It names `b`, `strong`, `th`, `-name`, `-title` or `-head`, with weight 600 or more: element-title.
   5. It names `label`, `dt`, `-label` or `-role`: label.
   6. It is a `button`, `select` or `input`: control.
   7. Today's size is 12.5px or more: body.
   8. Anything else: helper.
4. Remove the `"step-6"` key from `PENDING` in `test/repo/shell-text.mjs`.
5. Citations: repair every STALE `styles.css:N` cite in `docs/references/component-inventory.md` and `docs/specs/app-shell.md` by number.
6. Run the criteria below, plus `node test/repo/shell-text.mjs`.
### Acceptance criteria
- (red) `node -e 'const a=JSON.parse(process.argv[1]);const c=require("fs").readFileSync("src/ui/styles.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const R=[];const w=(f,t)=>{let i=f;while(i<t){const o=c.indexOf("{",i);if(o<0||o>=t)break;const p=c.slice(i,o).trim();let d=1,j=o+1;while(j<t&&d>0){if(c[j]=="{")d++;else if(c[j]=="}")d--;j++}if(p[0]=="@"){if(!p.startsWith("@keyframes"))w(o+1,j-1)}else R.push([p.split(",").map((s)=>s.trim().replace(/\s+/g," ")),c.slice(o+1,j-1)]);i=j}};w(0,c.length);const lit=(p,v)=>!/var\(/.test(v)&&(p=="font"||p=="font-size"&&/[1-9]/.test(v)||p=="font-weight"&&/^[1-9]/.test(v)||p=="letter-spacing"&&/[1-9]/.test(v)||p=="text-transform"&&!/^(none|inherit|capitalize)$/.test(v)||p=="line-height"&&!/^(1|normal|inherit|0)$/.test(v));const inF=(s)=>a.F.some((f)=>s.includes(f))&&!a.X.some((x)=>s.includes(x));const bad=[];for(const[L,b]of R){if(!L.some(inF))continue;for(const d of b.split(";")){const k=d.indexOf(":");if(k<0)continue;const p=d.slice(0,k).trim(),v=d.slice(k+1).trim().replace(/\s*!important$/,"");if(lit(p,v))bad.push(L.join(", ")+" | "+p+": "+v)}}const role=(s)=>{const m=R.filter(([L])=>L.includes(s)).map((r)=>r[1]).join(";").match(/(^|[;\s])font\s*:\s*var\(--ui-([a-z-]+)-font\)/);return m?m[2]:null};for(const[s,r]of Object.entries(a.M))if(role(s)!==r)bad.push(s+" reads "+role(s)+", want "+r);bad.slice(0,4).forEach((x)=>console.log(x));console.log(bad.length+" off");process.exit(bad.length?1:0)' '{"F":[".drawer-",".figma-note",".radix-note",".config-note",".copy-float",".pro-upsell",".newpal-",".apply-gate-",".settings-",".acct-",".account-",".cleanup-"],"X":[],"M":{".drawer-head h3":"pane-title",".settings-nav-head":"pane-title",".settings-pagehead h3":"pane-title",".settings-nav-grouplabel":"kicker",".settings-group-title":"kicker",".settings-row-text b":"element-title",".newpal-diagram-title":"element-title",".settings-nav-item":"control",".drawer-systems-label":"label",".drawer-format label":"label",".newpal-rel-label":"label",".settings-note":"helper",".drawer-foot .meta":"helper",".figma-note":"helper",".pro-upsell-msg":"body",".apply-gate-lede":"body",".drawer-pre":"code",".acct-badge":"badge"}}'`
- `node test/repo/shell-text.mjs && ! grep -qF '"step-6"' test/repo/shell-text.mjs`
- (guard) `node test/repo/ui-polish.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/app.js src/ui/app-helpers.mjs src/ui/sections src/ui/overlays src/ui/icons.js test/ui test/smoke scripts .claude/skills)$(git ls-files --others --exclude-standard -- src/ui/sections src/ui/overlays test/ui test/smoke scripts)"`

## Step 7: Typography and Geometry section text onto the roles
level: L3
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
### Do
Depends on: step 6. Edits only `src/ui/styles.css` (rules whose selector contains a `"step-7"` needle of `test/repo/shell-text.mjs`, never `.geom-ex-`, `.geom-ctl`, `.geom-glyph`, `.geom-caret`, `.tyi-voice-name` or `.tyi-font-input`), that gate's pending list, and doc cites.
1. The rewrite. A rule's literal size, weight, line-height, tracking, case or `font` becomes:
   `font: var(--ui-<role>-font); letter-spacing: var(--ui-<role>-tracking); text-transform: var(--ui-<role>-case);`
   plus `color: var(--ui-<role>-ink)`, unless the rule keeps a state color. Further rules:
   - A rule with `font-variant-numeric` re-declares it after the shorthand.
   - A rule that sets only a weight uses a token: 400 is `var(--ui-weight-regular)`, 500 and 550 `var(--ui-weight-medium)`, 600 and 650 `var(--ui-weight-strong)`, 700 `var(--ui-weight-heavy)`.
   - Layout `gap`, `padding` and `margin` stay.
2. Roles named by the architect's table and this step (binding):
   - pane-title: `.type-spec-head b`, `.geom-spec-head b`.
   - kicker: `.typo-cat-head b`, `.type-spec-grouphead b`, `.geom-spec-grouphead b`.
   - label: `.tyi-font-role`.
   - control: `.geom-select` (a shell select).
   - helper: `.type-spec-note`, `.geom-spec-note`.
   - code: `.type-spec-token`, `.geom-spec-token`, `.geom-lad-k`, `.geom-lad-v`.
   - badge: `.geom-chip` (a badge by the user's ruling).
3. Fallback for a selector the list does not name (first match wins):
   1. The rule uppercases: kicker.
   2. It sets a monospace family, or names `code`, `pre` or `-token`: code.
   3. It names `h3` or ends in `-title` or `-head b`, and today's size is 14px or more: pane-title.
   4. It names `b`, `strong`, `th`, `-name`, `-title` or `-head`, with weight 600 or more: element-title.
   5. It names `label`, `dt`, `-label` or `-role`: label.
   6. It is a `button`, `select` or `input`: control.
   7. Today's size is 12.5px or more: body.
   8. Anything else: helper.
4. Remove the `"step-7"` key from `PENDING` in `test/repo/shell-text.mjs`.
5. The inline literals in `src/ui/sections/typography.js` (:539, :830, :1031) and `src/ui/sections/geometry.js` (:375, :413, :737) are specimens or measurement probes painted at a kit cell. Leave them; this step does not touch section JS.
6. Citations: repair every STALE `styles.css:N` cite in `docs/references/component-inventory.md` and `docs/specs/app-shell.md` by number.
7. Run the criteria below, plus `node test/repo/shell-text.mjs`.
### Acceptance criteria
- (red) `node -e 'const a=JSON.parse(process.argv[1]);const c=require("fs").readFileSync("src/ui/styles.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const R=[];const w=(f,t)=>{let i=f;while(i<t){const o=c.indexOf("{",i);if(o<0||o>=t)break;const p=c.slice(i,o).trim();let d=1,j=o+1;while(j<t&&d>0){if(c[j]=="{")d++;else if(c[j]=="}")d--;j++}if(p[0]=="@"){if(!p.startsWith("@keyframes"))w(o+1,j-1)}else R.push([p.split(",").map((s)=>s.trim().replace(/\s+/g," ")),c.slice(o+1,j-1)]);i=j}};w(0,c.length);const lit=(p,v)=>!/var\(/.test(v)&&(p=="font"||p=="font-size"&&/[1-9]/.test(v)||p=="font-weight"&&/^[1-9]/.test(v)||p=="letter-spacing"&&/[1-9]/.test(v)||p=="text-transform"&&!/^(none|inherit|capitalize)$/.test(v)||p=="line-height"&&!/^(1|normal|inherit|0)$/.test(v));const inF=(s)=>a.F.some((f)=>s.includes(f))&&!a.X.some((x)=>s.includes(x));const bad=[];for(const[L,b]of R){if(!L.some(inF))continue;for(const d of b.split(";")){const k=d.indexOf(":");if(k<0)continue;const p=d.slice(0,k).trim(),v=d.slice(k+1).trim().replace(/\s*!important$/,"");if(lit(p,v))bad.push(L.join(", ")+" | "+p+": "+v)}}const role=(s)=>{const m=R.filter(([L])=>L.includes(s)).map((r)=>r[1]).join(";").match(/(^|[;\s])font\s*:\s*var\(--ui-([a-z-]+)-font\)/);return m?m[2]:null};for(const[s,r]of Object.entries(a.M))if(role(s)!==r)bad.push(s+" reads "+role(s)+", want "+r);bad.slice(0,4).forEach((x)=>console.log(x));console.log(bad.length+" off");process.exit(bad.length?1:0)' '{"F":[".typo-",".type-spec-",".ty-role",".tyi-",".geom-"],"X":[".geom-ex-",".geom-ctl",".geom-glyph",".geom-caret",".tyi-voice-name",".tyi-font-input"],"M":{".type-spec-head b":"pane-title",".geom-spec-head b":"pane-title",".type-spec-grouphead b":"kicker",".geom-spec-grouphead b":"kicker",".typo-cat-head b":"kicker",".type-spec-token":"code",".geom-spec-token":"code",".geom-lad-k":"code",".type-spec-note":"helper",".geom-spec-note":"helper",".tyi-font-role":"label",".geom-chip":"badge",".geom-select":"control"}}'`
- `node test/repo/shell-text.mjs && ! grep -qF '"step-7"' test/repo/shell-text.mjs`
- (guard) `node test/repo/ui-polish.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/app.js src/ui/app-helpers.mjs src/ui/sections src/ui/overlays src/ui/icons.js test/ui test/smoke scripts .claude/skills)$(git ls-files --others --exclude-standard -- src/ui/sections src/ui/overlays test/ui test/smoke scripts)"`

## Step 8: Control and container anatomy, the chip and badge split, and the gate made strict
level: L4
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
### Do
Depends on: step 7. Edits `src/ui/styles.css` (the `"step-8"` family and the controls named below), `test/repo/shell-text.mjs`, `test/repo/ui-polish.mjs` and doc cites. The anatomy and composition tables are step 1's `CONTROL_ANATOMY` and `CONTAINER_COMPOSITION`.
1. Controls on the control role (handoff Intent part 3):
   - `button`: `font: var(--ui-control-font);` replaces `font: inherit; font-size: var(--sh-control-text);`.
   - The text-input and select rule (`input[type="text"], input[type="search"], select`, ~:1700) and `.linklike`: `font: var(--ui-control-font)` replaces `font: inherit`.
   - `.segmented button`: its `font-weight: 550` goes; the role's 500 applies.
   - `button.primary`, `.chip.on`, and the `.on` part rule of `.segmented`/`.figma-files`/`.radix-files`: `font-weight: var(--ui-weight-strong)` (architect: the `.on` and `.primary` state weight).
   - `.map-raw-select.ov, .map-raw-input.ov`: `var(--ui-weight-strong)`. `.map-raw-select, .map-raw-input`: `border-radius: var(--sh-control-radius)`, replacing 5px.
   - `.tyi-voice-name`: `font: var(--ui-control-font)` (replacing `font: inherit` and weight 650), `gap: var(--sh-control-inset)`; `:focus-visible` `border-radius: var(--sh-radius-mark)`.
   - `.tyi-font-input`: any literal moves to the control roles.
2. Chips, by the user's ruling: "chips and segmented controls use the BUTTON/CONTROL text size (`--ui-control`, step 0), not the compact chip row", and the chip's "height and padding stay the cell's compact chip row only where a chip is a badge".
   - `.chip` (the base, which is the status badge `<span>`): `font: var(--ui-badge-font); letter-spacing: var(--ui-badge-tracking); min-block-size: var(--sh-chip-height); padding-inline: var(--sh-chip-inset); gap: calc(var(--sh-chip-inset) / 2); border-radius: calc(var(--sh-chip-height) / 2);`
   - `button.chip` (the interactive chip): `font: var(--ui-control-font); letter-spacing: var(--ui-control-tracking); min-block-size: var(--sh-control-height); padding-inline: var(--sh-control-inset); gap: calc(var(--sh-control-inset) / 2); border-radius: calc(var(--sh-control-height) / 2);`. The pill shape stays: the ruling moves text, height and padding, not the shape.
   - Which `.chip` uses are controls, all `chip(..., { mode: "interactive" })` and so `button.chip`: the damp presets (`sections/color.js:176`, `.damp-presets`), the breakpoint width quick-picks (`app.js:1934`, `.mode-preset`), and the export systems (`overlays/drawer.js:163`, `.sys-chip`).
   - Which are badges: the mapping drift summary (`sections/color.js:1318`, a `span.chip` with `.in-sync`/`.has-drift`). The other badges are already on the badge role: `.acct-badge`, `.radix-badge`, `.tok-sub`, `.geom-chip`, `.key-slot .key-place`.
   - Not text chips: `.newpal-chip` (a 32px swatch toggle), `.geom-ex-chip` (specimen), `.tile-tag` (gallery). No JS changes: the helper `chip()` (`app-helpers.mjs:539`) already emits `button` or `span`.
3. Switch (anatomy row: track 1.75I by I, thumb I - 2e, edge e):
   - `--ctl-thumb: calc(var(--sh-control-icon) - 2 * var(--ui-edge));` in the alias block.
   - `.toggle .track`: `border-radius: calc(var(--sh-control-icon) / 2)`.
   - `.toggle .track::after`: `top: var(--ui-edge); left: var(--ui-edge)`. Its `border-radius: 50%` stays. The `.on` translate stays `calc(0.75 * var(--sh-control-icon))`.
   - `.toggle`: `gap: var(--sh-control-inset)`, the label gap P.
4. Menu wrap: `.tools-menu:popover-open` `border-radius: var(--sh-radius-card)`, the same number as today's `calc(radius + part-inset)`.
5. Containers already on the compound law (T-0027): `.segmented`/`.figma-files`/`.radix-files`, the tab row and icon-only. No input group exists in the shell (`git grep -n "input-group" src/ui` is empty); the table records the rule for the first one.
6. `test/repo/shell-text.mjs`: remove the `"step-8"` key, then the empty `PENDING` object. `--strict` stays accepted.
7. `test/repo/ui-polish.mjs`: add at least five checks whose names start `anatomy: `, each with its known-bad sample in `BAD`, aligned by index (keep the `i === 5` special case):
   - the interactive chip row
   - the badge chip row
   - the switch edge and thumb
   - the menu wrap on `--sh-radius-card`
   - `button` on `--ui-control-font`
8. Citations: repair STALE `styles.css:N` cites in `docs/references/component-inventory.md` and `docs/specs/app-shell.md` by number.
9. Run `node test/repo/shell-text.mjs --strict`, `node test/repo/ui-polish.mjs`, `node test/repo/citations.mjs`.
### Acceptance criteria
- (red) `node test/repo/shell-text.mjs --strict && ! grep -qE '"step-[0-9]+"' test/repo/shell-text.mjs`
- (red) `node -e 'const c=require("fs").readFileSync("src/ui/styles.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const R=[...c.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m)=>[m[1].trim().split(/\s*,\s*/).map((s)=>s.replace(/\s+/g," ")),m[2]]);const body=(s)=>R.filter(([l])=>l.includes(s)).map((r)=>r[1]).join(";");const need=[["button.chip","min-block-size: var(--sh-control-height)"],["button.chip","padding-inline: var(--sh-control-inset)"],["button.chip","font: var(--ui-control-font)"],["button.chip","border-radius: calc(var(--sh-control-height) / 2)"],[".chip","font: var(--ui-badge-font)"],[".chip","min-block-size: var(--sh-chip-height)"],[".chip","border-radius: calc(var(--sh-chip-height) / 2)"],["button","font: var(--ui-control-font)"],[".toggle .track","border-radius: calc(var(--sh-control-icon) / 2)"],[".toggle .track::after","top: var(--ui-edge)"],[".tools-menu:popover-open","border-radius: var(--sh-radius-card)"],["button.primary","font-weight: var(--ui-weight-strong)"],[".chip.on","font-weight: var(--ui-weight-strong)"]];const miss=need.filter(([s,d])=>!body(s).includes(d));miss.forEach((m)=>console.log("missing",m.join(" | ")));process.exit(miss.length?1:0)'`
- (red) `test "$(grep -c '\["anatomy: ' test/repo/ui-polish.mjs)" -ge 5 && node test/repo/ui-polish.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/app.js src/ui/app-helpers.mjs src/ui/sections src/ui/overlays src/ui/icons.js test/ui test/smoke scripts .claude/skills)$(git ls-files --others --exclude-standard -- src/ui/sections src/ui/overlays test/ui test/smoke scripts)"`

## Step 9: Glyph motion tokens, disclosure carets, and glyph sizes from the role box
level: L3
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
- `docs/reports/AGENTS.md`
### Do
Depends on: step 8.
1. `src/ui/icons.js` `icon(name, { size })`:
   - `size: "control"` behaves like omitting it: the svg follows `--sh-control-icon`.
   - `size: "badge"` emits `width="11" height="11" style="width:var(--ui-badge-icon, 11px);height:var(--ui-badge-icon, 11px)"`. The compact row's glyph box, per the user's rename of chip to badge.
   - Numeric sizes behave as today, as `(ics2)` pins.
   - Add `"caret-down"` to `ICONS`, the Phosphor fill path `M213.66,101.66l-80,80a8,8,0,0,1-11.32,0l-80-80A8,8,0,0,1,48,88H208a8,8,0,0,1,5.66,13.66Z`, the same family as the existing `caret-left`.
   - Update the header comment.
2. The 16 explicit `icon(..., { size: N })` calls in `src/ui`:
   - To `{ size: "badge" }`: `sections/color.js:155` (contrast mark, 12), `:935`, `:974`, `:1159` (palette enable marks, 13), `:1248`, `:1249` (mapping match and drift marks, 12), `:1298` (`.map-reset` glyph, 13); `app.js:2098` (hover in-gamut mark, 12), `app.js:2399` (save-state mark, 12); `sections/typography.js:476` (`.tok-reset` glyph, 12).
   - Drop the size, so it takes the control box: `overlays/apply-gate.js:431` (warning, 16).
   - Stay numeric, gallery (allow-listed): `app.js:778` (trash 13, `.set-thumb .del`), `app.js:795` (plus 22, `.new-tile`), `app.js:1028` (caret-left 13, `.category-back-eyebrow`).
   - Stay numeric, specimens painted at a kit cell: `sections/geometry.js:378`, `:751`.
   - At product-md these marks keep 13px (the md compact-row glyph). At product-sm they become 11px, a visible change on the ramp rows (architect Risks).
3. Carets (anatomy row "trigger": a caret at the end that rotates 180deg on `[aria-expanded="true"]`):
   - Append `icon("caret-down", { cls: "caret" })` as the last child of the `.ex-collapse-toggle` button (`app.js` ~:2248) and of the `.tyi-voice-name` button (`sections/typography.js` ~:642). Both already carry `aria-expanded`.
   - `.tools-more` keeps its dots glyph: an overflow trigger has no caret.
   - No listbox with a check mark exists in the shell (the selects are native), so no check motion is added; the token is recorded for it in step 11.
   - In `src/ui/styles.css`: `.caret { flex: none; transition: transform var(--ui-motion-fast) var(--ui-motion-ease); }` and `[aria-expanded="true"] > .caret { transform: rotate(180deg); }`.
4. Every `transition` in a shell rule reads the tokens:
   - The pane grid (`.editor`, `grid-template-columns .18s`, ~:410): `var(--ui-motion-base) var(--ui-motion-ease)`.
   - `.toggle .track`, `.toggle .track::after`, `.newpal-chip`, `.toast` and any other shell transition: `var(--ui-motion-fast) var(--ui-motion-ease)`.
   - Gallery transitions (`.set-tile` ~:310, the category card ~:381) stay: the gallery is allow-listed.
   - Reduced motion needs no new rule: `styles.css:99-116` already force `0.01ms !important` on every host descendant under `[data-motion="reduced"]` and under `prefers-reduced-motion` with `[data-motion="system"]`.
5. `test/repo/ui-polish.mjs`: add at least two checks whose names start `motion: `, each with a known-bad sample:
   - every non-gallery `transition` reads `var(--ui-motion-`. Bad sample: `.toggle .track { transition: background .12s; }`.
   - the caret rotate rule exists and both reduced-motion blocks set `transition-duration: 0.01ms !important`. Bad sample: a stylesheet without the reduced block.
6. `test/ui/headless-boot.mjs`, group `(ics)` (~:2245):
   - `(ics3)`: `icon("x", { size: "badge" })` has an svg style with `var(--ui-badge-icon, 11px)`.
   - `(ics4)`: `icon("caret-down", { cls: "caret" })` is a span with classes `ic caret` holding an svg path.
7. Citations: `app.js`, `styles.css` and the sections shift. Repair STALE cites by number in `docs/references/component-inventory.md`, `docs/specs/app-shell.md` and `docs/reports/2026-08-20-reactivity/0*.md`.
8. Regenerate `figma/plugin/ui.html` (`npm run bundle && npm run gen:figma-ui`).
9. Run `node test/ui/headless-boot.mjs`, `node test/repo/ui-polish.mjs`, `node test/repo/shell-text.mjs --strict`, `node test/repo/citations.mjs`.
### Acceptance criteria
- (red) `! git grep -nE 'icon\([^)]*size: *[0-9]' -- src/ui ':!src/ui/sections/geometry.js' ':!src/ui/*-assets.js' | grep -vE 'icon\("(trash|caret-left)", \{ size: 13 \}\)|icon\("plus", \{ size: 22 \}\)'`
- (red) `grep -qF '"caret-down":' src/ui/icons.js && grep -qF 'icon("caret-down", { cls: "caret" })' src/ui/app.js && grep -qF 'icon("caret-down", { cls: "caret" })' src/ui/sections/typography.js`
- (red) `node -e 'const c=require("fs").readFileSync("src/ui/styles.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const R=[...c.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m)=>[m[1].trim().replace(/\s+/g," "),m[2]]);const A=[".tile",".category-",".gallery-",".set-",".new-tile",".preset-",".masthead",".ex-",".geom-ex-"];const bad=R.filter(([s,b])=>!A.some((a)=>s.includes(a))&&b.split(";").some((d)=>/^\s*transition\s*:/.test(d)&&/\d(ms|s)\b/.test(d)&&!/var\(--ui-motion-/.test(d)));bad.forEach((r)=>console.log("literal",r[0]));const caret=R.filter(([s])=>/\[aria-expanded="true"\][^,]*\.caret/.test(s)).map((r)=>r[1]).join(";");const base=R.filter(([s])=>/(^|[\s,])\.caret\b/.test(s)&&!/aria-expanded/.test(s)).map((r)=>r[1]).join(";");process.exit(bad.length===0&&/rotate\(180deg\)/.test(caret)&&/transition:\s*transform var\(--ui-motion-fast\) var\(--ui-motion-ease\)/.test(base)?0:1)'`
- (red) `test "$(grep -c '\["motion: ' test/repo/ui-polish.mjs)" -ge 2 && node test/repo/ui-polish.mjs`
- (red) `grep -qF '(ics3)' test/ui/headless-boot.mjs && grep -qF '(ics4)' test/ui/headless-boot.mjs && node test/ui/headless-boot.mjs`
- `node test/repo/shell-text.mjs --strict`
- (guard) `node test/repo/citations.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/overlays/settings.js src/ui/overlays/drawer.js src/ui/shell-roles.mjs test/smoke scripts .claude/skills docs/references/decision-records.md)$(git ls-files --others --exclude-standard -- test/smoke scripts .claude/skills)"`

## Step 10: Product-sm default cell, Follow kit and Custom, and the smoke matrix in light and dark
level: L4
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
- `docs/reports/AGENTS.md`
### Do
Depends on: step 9. This step owns the default-cell change and all its pixel checks (conductor note 5).
1. `src/ui/app.js`:
   - Add `const SHELL_DEFAULT_GEOMETRY = Object.freeze({ tier: "product", scale: "sm", radius: "round" });` beside `geomHostSeq`. The user ruled product tier, sm scale, md size; the architect proposed round radius, and the user approved the tables.
   - `shellGeometry` becomes three states: `null` (fresh install or Reset) resolves to `SHELL_DEFAULT_GEOMETRY`; the string `"kit"` follows `doc.geometry`, else `DEFAULT_GEOMETRY` (the gallery has no doc); an object pins a custom cell.
   - `_effectiveShellGeometry` (~:2508) implements those three states.
   - `_loadAppPrefs` (~:2484) accepts `"kit"` as well as a valid object.
   - `_saveAppPrefs` (~:2501) writes `shellGeometry` whenever it is not null.
   - `_resetAppPrefs` keeps `null`.
   - Update the constructor comment (~:127). A pre-T-0044 record with no `shellGeometry` key lands on the default, which is the ruling.
2. `src/ui/overlays/settings.js` `_shellGeometryRows` (~:176):
   - Options `[{ id: "default", label: "Default" }, { id: "kit", label: "Follow kit" }, { id: "custom", label: "Custom" }]` with fk `setshellgeom`.
   - Current value: `null` is `"default"`, `"kit"` is `"kit"`, an object is `"custom"`.
   - Setter: Default sets null, Follow kit sets `"kit"`, Custom sets `{ ...this._effectiveShellGeometry() }`.
   - The tier, scale and radius rows show only for an object.
   - Copy: "The editor chrome's control sizes and corners. Default is product, sm; Follow kit uses this document's Geometry; Custom pins a tier, scale, and radius on this device."
3. `src/ui/styles.css`: the `--sh-*` alias fallbacks move to the product-sm-md round cell, and the comment says so. Values: height 28px, inset 7px, text 13px, icon 14px, radius-control 13px, radius-inset 9.5px, part-height 21px, part-inset 3.5px, chip-height 20px, chip-inset 4.5px, chip-text 10px.
4. `test/ui/headless-boot.mjs` group `(shg)`:
   - shg1: a fresh app has `shellGeometry === null` and host `product,sm,md,round`.
   - shg2: first pick Follow kit (`setshellgeom:kit`, so `app.shellGeometry === "kit"`); then a `doc.geometry` commit moves the host, and undo restores it.
   - shg3: Custom wins over the doc and persists. Follow kit stores `"kit"` in the app-prefs record. Default (`setshellgeom:default`) returns to `null` and `product,sm,md,round`.
   - New `(shg8)`: `localStorage` records loaded through `app._loadAppPrefs()`. One with no `shellGeometry` key leaves `null`. One with `"kit"` loads `"kit"`. One with a bad object leaves `null`.
   - Restore `null` before the groups below.
5. `test/smoke/smoke.mjs`:
   - Every `[["product", "md", ...], ["content", "lg", ...]]` matrix becomes product-sm and content-lg: compound (~:316), control text (~:350), polish (~:390) and header fit (~:451), including the comment at ~:440.
   - Compound and polish also loop the theme, `light` then `dark`, set as the charts matrix sets it (`el.theme = "<theme>"; el.render()`, ~:290-296), and restore `system` after.
   - PNGs are `compound-<tier>-<scale>-<theme>.png` and `polish-<tier>-<scale>-<theme>.png`.
   - The compound ok label is `compound at <tier>-<scale> <theme>: ...`. The control text label keeps `control text at <tier>-<scale>: ...`.
   - The `shellGeometry = null` resets now mean the product-sm default.
6. Add a reduced-motion read to smoke, after the polish setup at product-sm, on the first `.ex-collapse-toggle .caret`:
   - With `el.motion = "reduced"` and a render, `getComputedStyle(caret).transitionDuration`, parsed to seconds, is below 0.001. `app.js:632` stamps `data-motion`.
   - With `el.motion = "system"` and a render, it is at least 0.1 (headless Chrome emulates no OS preference).
   - Label: `reduced motion: the disclosure caret's transition-duration is under 1ms with Motion Reduced and at least 100ms with Motion System`.
7. `.claude/skills/building-editor-sections/SKILL.md` (~:99-100), the `_effectiveShellGeometry` bullet: rewrite it to name `SHELL_DEFAULT_GEOMETRY` (product, sm, round), `"kit"` following the doc, and Custom.
8. Citations: repair STALE `app.js:N`, `styles.css:N` and `settings.js:N` cites by number in `docs/references/component-inventory.md`, `docs/specs/app-shell.md` and `docs/reports/2026-08-20-reactivity/0*.md`.
9. Run `npm run smoke` with `CHROME_BIN` set to Chrome Canary. It runs `npm run build` first, which needs `node_modules` (`npm ci` in the lane if absent). Then open the eight PNGs and record in the builder file what you saw:
   - interactive chips at control height, badges compact, kickers in `--ink-dim`
   - the pane titles
   - no chrome overflow at content-lg
### Acceptance criteria
- (red) `grep -qE 'const SHELL_DEFAULT_GEOMETRY = Object\.freeze\(\{ tier: "product", scale: "sm", radius: "round" \}\);' src/ui/app.js`
- (red) `grep -qF '[{ id: "default", label: "Default" }, { id: "kit", label: "Follow kit" }, { id: "custom", label: "Custom" }]' src/ui/overlays/settings.js`
- (red) `grep -qF 'product,sm,md,round' test/ui/headless-boot.mjs && grep -qF 'setshellgeom:default' test/ui/headless-boot.mjs && grep -qF '(shg8)' test/ui/headless-boot.mjs && node test/ui/headless-boot.mjs`
- (red) `for s in compound-product-sm-light.png compound-product-sm-dark.png compound-content-lg-light.png compound-content-lg-dark.png polish-product-sm-light.png polish-content-lg-dark.png "reduced motion: "; do grep -qF -- "$s" test/smoke/smoke.mjs || exit 1; done && ! grep -qE '\["product", "md"' test/smoke/smoke.mjs`
- (red) `grep -qE '^ *--sh-control-height: var\(--control-height, 28px\);' src/ui/styles.css && grep -qE '^ *--sh-control-text: var\(--control-text, 13px\);' src/ui/styles.css && grep -qE '^ *--sh-chip-text: var\(--chip-text, 10px\);' src/ui/styles.css`
- (red) `grep -qF 'SHELL_DEFAULT_GEOMETRY' .claude/skills/building-editor-sections/SKILL.md && ! grep -qF 'null follows the kit' .claude/skills/building-editor-sections/SKILL.md`
- `out=$(CHROME_BIN="/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name smoke -- npm run smoke 2>&1) && for s in "SMOKE PASS" "✓ compound at product-sm light" "✓ compound at product-sm dark" "✓ compound at content-lg light" "✓ compound at content-lg dark" "✓ control text at product-sm" "✓ control text at content-lg" "✓ reduced motion:"; do printf "%s\n" "$out" | grep -qF -- "$s" || exit 1; done && for p in compound-product-sm-light compound-product-sm-dark compound-content-lg-light compound-content-lg-dark polish-product-sm-light polish-product-sm-dark polish-content-lg-light polish-content-lg-dark; do test -s "smoke-out/$p.png" || exit 1; done`
- (guard) `node test/repo/citations.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/sections src/ui/icons.js src/ui/shell-roles.mjs test/repo scripts docs/references/decision-records.md)$(git ls-files --others --exclude-standard -- src/ui/sections test/repo scripts)"`

## Step 11: The ADR, the shell roles reference page, the inventory cards and the skills
level: L2
### Read first
- `docs/references/AGENTS.md`
- `docs/references/geometry/AGENTS.md`
### Do
Depends on: step 10. Docs only; no source change.
1. Append the ADR to `docs/references/decision-records.md`, before `## Quick map`.
   - Number: the next free one after the highest `## ADR-NNN` heading at build time. It is ADR-036 today (ADR-035 is the last heading; ADR-034 is written in another worktree), unless T-0040 or another lane lands one first.
   - Heading: `## ADR-NNN: The editor shell's text roles, control anatomy, glyph motion and product-sm default cell`.
   - Content:
     - The role table: nine roles, the UI_TEXT row step, why JS and not calc.
     - The user's 2026-10-09 rulings: product-sm-md default; chips and segmented on `--ui-control`; `--ui-chip` renamed `--ui-badge`; badges and tags compact.
     - The anatomy and composition tables.
     - Motion tokens 120/180ms and one ease; reduced motion by the existing descendant rules.
     - The tri-state `shellGeometry`.
     - The gate and its allow-list.
     - Rejected: calc offsets, engine `CELL_FIELDS`, a `shellDefault` flag, per-role size vars, rotating the select chevron, gating layout gap and padding.
2. New `docs/references/geometry/shell-roles.md`, copying the tables from `src/ui/shell-roles.mjs`, with px at product-sm-md, product-md-md and content-lg-md:
   - `UI_ROLES` (role, var, step, weight, line-height, tracking, case, ink, covered selectors)
   - `CONTROL_ANATOMY`, including the interactive chip and badge rows and which uses are which (step 8's lists)
   - `CONTAINER_COMPOSITION`, with the law that container radius = part radius + padding
   - `MOTION`
   - the gate's allow-list with reasons
   Link it from `docs/references/geometry/README.md` and add `- [shell-roles.md](shell-roles.md)` to the index in `docs/references/geometry/AGENTS.md`.
3. `docs/references/component-inventory.md`: cards 1, 2, 3 and 5 (architect Interfaces) name `src/ui/shell-roles.mjs`, the `--ui-<role>-font` roles (`--ui-control-font` on buttons, inputs, selects and interactive chips), the badge row, the switch edge, the carets, and the product-sm default. Keep every existing cite valid.
4. `.claude/skills/geometry-system/SKILL.md`: a short section on the shell roles, naming `src/ui/shell-roles.mjs` and the row-step law. `.claude/skills/building-editor-sections/SKILL.md`: new shell text uses a `--ui-<role>-font` role, never a literal (the `test/repo/shell-text.mjs` gate), and names `src/ui/shell-roles.mjs`.
5. No U+2014 anywhere. `node test/repo/em-dash.mjs` is red at HEAD on one character: the committed ticket handoff `.sdlc/ui-standardization/handoff.md:24` holds a U+2014, so `npm test` is red until it is fixed. Repair it with `node test/repo/em-dash.mjs --fix` (a one-character record repair, `.claude/CLAUDE.md` Always), then run `node test/repo/citations.mjs` and `node test/repo/em-dash.mjs`.
### Acceptance criteria
- (red) `n=$(grep -nE "^## ADR-[0-9]+: The editor shell's text roles" docs/references/decision-records.md | head -1 | cut -d: -f1) && q=$(grep -n "^## Quick map" docs/references/decision-records.md | cut -d: -f1) && test -n "$n" && test "$n" -lt "$q"`
- (red) `f=docs/references/geometry/shell-roles.md && test -f "$f" && for s in "UI_ROLES" "CONTROL_ANATOMY" "CONTAINER_COMPOSITION" "--ui-badge-font" "--ui-motion-fast" "product-sm-md" "src/ui/shell-roles.mjs"; do grep -qF -- "$s" "$f" || exit 1; done && grep -qF 'shell-roles.md' docs/references/geometry/README.md && grep -qF '[shell-roles.md](shell-roles.md)' docs/references/geometry/AGENTS.md`
- (red) `grep -qF 'shell-roles.mjs' docs/references/component-inventory.md && grep -qF -- '--ui-control-font' docs/references/component-inventory.md && grep -qF 'shell-roles.mjs' .claude/skills/geometry-system/SKILL.md && grep -qF 'shell-roles.mjs' .claude/skills/building-editor-sections/SKILL.md`
- `node test/repo/em-dash.mjs`
- (guard) `node test/repo/citations.mjs`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/engine src/ui/app.js src/ui/styles.css src/ui/sections src/ui/overlays src/ui/icons.js src/ui/shell-roles.mjs scripts test mcp plugin)$(git ls-files --others --exclude-standard -- src/engine src/ui/app.js src/ui/styles.css src/ui/sections src/ui/overlays src/ui/icons.js src/ui/shell-roles.mjs scripts test mcp plugin)"`

## Step 12: Gates green
level: L3
guard timeout: 3600
### Do
Depends on: step 11.
1. Run every gate through the lock, as the criteria spell them (`SDLC_GATE_WORKERS=10`, the version-free `gate_lock.py` path):
   - `npm test`. Its generator prefix regenerates the committed assets; keep the regenerated bytes so CI's drift check stays green.
   - `npm run build`.
   - `npm run smoke` with `CHROME_BIN` set to Chrome Canary.
   - The eight sweep legs.
2. Fix any red the earlier steps introduced, in the file that owns it. A gate already red at the build-start HEAD comes back as Status `inherited red`.
3. `npm test`, `npm run build` and `npm run smoke` carry no tag, on purpose: each rewrites `figma/plugin/ui.html` (`gen:figma-ui` ends all three scripts), and `steps.py split --only` refuses a tagged span that changes the work tree. The sweep legs stay `(guard)`: they only read.
4. The smoke strings are step 10's labels: compound at product-sm and content-lg in light and dark, control text at product-sm and content-lg, and the reduced-motion read.
### Acceptance criteria
- `a=$(cat figma/plugin/ui.html src/ui/*-assets.js src/ui/categories/*.js docs/reference/data/adia-* | shasum) && SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name npm-test -- npm test && test "$a" = "$(cat figma/plugin/ui.html src/ui/*-assets.js src/ui/categories/*.js docs/reference/data/adia-* | shasum)"`
- `SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name build -- npm run build`
- `out=$(CHROME_BIN="/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary" SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name smoke -- npm run smoke 2>&1) && for s in "SMOKE PASS" "✓ compound at product-sm light" "✓ compound at product-sm dark" "✓ compound at content-lg light" "✓ compound at content-lg dark" "✓ control text at product-sm" "✓ control text at content-lg" "✓ reduced motion:"; do printf "%s\n" "$out" | grep -qF -- "$s" || exit 1; done`
- `node test/repo/shell-text.mjs --strict && node test/ui/shell-roles.mjs && node test/repo/ui-polish.mjs`
- (guard) `SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name corpus-reset -- npm run gate:corpus-reset`
- (guard) `rc=0; for g in corpus-tonal corpus-anchor sweep-prime corpus-contrast mode-isolation even-dips chroma-envelope; do if ! SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name "$g" -- npm run "gate:$g"; then echo "red leg: $g"; rc=1; fi; done; exit $rc`

## Assumptions
- Steps 0 to -3 at product-sm-md give 13, 12, 11 and 10px, which are today's four literal clusters. content-lg-md gives 22, 21, 20 and 19; micro-sm-md clamps to 7.5, 7, 7 and 7. Verified by `geomScale({})` in node: product-sm-md has height 28, inset 7, text 13, icon 14, partHeight 21, partInset 3.5, chipHeight 20, chipInset 4.5, chipText 10, radiusControl 13, radiusMark 6.5, radiusInset 9.5, radiusCard 16.5. Also by `UI_TEXT` at `src/engine/type.mjs:31`.
- The resolver emits `--radius-card`, `--radius-mark`, `--radius-inset`, `--chip-text` and `--control-text`, so the new `--sh-radius-*` aliases resolve. Verified by `geomResolverCSS(geomScale({}))` containing each name.
- Step 3's `PENDING` partition covers every flagged declaration on today's tree. Verified by running the family parser with the allow-list plus all five families as exclusions: it left only `body` (allow-listed exactly), `button`, the input and select rule, and `.linklike` (all four put in `"step-8"`).
- The four family checks of steps 4 to 7 are red now for the right reason: 52, 77, 92 and 62 offending declarations or unmapped selectors. Verified by running each criterion on the tree.
- The toast is rendered inside the host (`app.js:948`, `:1417`, part of the render tree), so `.toast` can take a `--ui-*` role. Only `body` lies outside the host. Verified by reading those lines.
- `node test/repo/citations.mjs` is green at HEAD and red (exit 1) when one line is inserted at the top of `src/ui/styles.css`. That is the citations guard's red shape. Verified in the probe worktree `.worktrees/tmp/0044-planner-L3/cite`.
- No test pins the `--sh-*` alias fallbacks. `(ics1)` pins `var(--sh-control-icon, 16px)` inside `icons.js`, which step 9 leaves unchanged. Verified by grepping `test/ui/shell.mjs` and `test/ui/headless-boot.mjs`.
- No `caret-down` glyph exists yet (`grep` of `src/ui/icons.js`), and no listbox with a check mark exists in the shell. Step 9 therefore adds the glyph and records the check token without a target.
- The explicit `icon()` size calls are 16. Of them, 11 lie outside the gallery and specimen allowances, which is step 9's red count. Verified by `git grep -nE 'icon\([^)]*size: *[0-9]'`.
- The interactive chips are the three `chip(..., { mode: "interactive" })` sites, and the only status chip is `sections/color.js:1318`. Verified by grepping `chip(` across `src/ui`.
- Every `(guard)` is green at HEAD with `SDLC_BASE_SHA=HEAD`, and each guard shape was seen red: the scope deny-lists with an untracked `test/smoke/probe.tmp` in the probe worktree, `ui-polish.mjs` and `control-text.mjs` on a bad stylesheet fed through `/dev/stdin`, and citations with a shifted `styles.css`. Every `(red)` criterion exits 1 on the tree for the reason its step adds, except the gate-dependent ones, which fail on the missing file now and on the pending families once step 3 has landed.
- Chrome Canary and Chrome Beta are installed (`test -x` on both binaries), and `gate_lock.py` resolves to `sdlc-lite/0.22.0/scripts/gate_lock.py`.
- The next ADR is ADR-036: the last heading is `## ADR-035` (`decision-records.md:1227`), and ADR-034 is in flight elsewhere. The criterion matches the heading text, not the number.
- The default cell's radius is `round`. The ruling names tier, scale and size; the architect proposed round, and the user approved the tables with one unrelated change.

## Risks
- T-0043 (`2d3199e5`, Radix tooltip) is about to land on main. It edits `src/ui/styles.css`, `src/ui/app.js`, `scripts/bundle.mjs` MODS, `test/run.mjs` TESTS, `test/ui/headless-boot.mjs`, `test/smoke/smoke.mjs` and the cited docs. So:
  - every `~:line` in this plan is approximate;
  - a resync will conflict on the array appends and on citation repairs;
  - new `.radix-*` text rules must join step 4's family.
- The role table changes visible text, all ratified with the architect's tables:
  - the left pane band loses its uppercase faint eyebrow;
  - `.settings-pagehead h3` drops from 21px to the cell's step 0;
  - kickers darken to `--ink-dim`;
  - captions under 11px grow to the helper size;
  - `.on` and `.primary` take weight 600, which can shift a segmented part's width when it toggles.
  Smoke proves fit at product-sm and content-lg in Chrome only, and Safari, the preview browser, is unproven.
- The fallback mapping in steps 4 to 7 is a rule, not a per-selector ruling. A builder can satisfy the gate with a role the user would not pick, and only the step 10 pixel review catches that.
- Step 10's smoke criterion and step 12's gates were not run at plan time: each rewrites `figma/plugin/ui.html` (rule 1). The sweep guards were not dry-run either, because they take about 20 minutes. The prior geometry plans recorded them green, and `guard timeout: 3600` is three times that record, not a timing taken here.
- The reduced-motion smoke read depends on `.ex-collapse-toggle` rendering after the polish setup. If it does not, the builder picks the first `.tyi-voice-name .caret` in Typography instead and keeps the label.
- `npm test` is red at HEAD (`a268cd2a`) on the em-dash leg, from the U+2014 in the committed handoff (`git show HEAD:.sdlc/ui-standardization/handoff.md` holds one). Step 11 repairs it. If the conductor would rather not let a builder touch the ticket file, it can run the `--fix` before step 11, and that criterion stays valid.
- The probe worktree `.worktrees/tmp/0044-planner-L3/cite` was left in place, because rule 15 forbids `git worktree remove` in a headless run. Remove it by hand.
