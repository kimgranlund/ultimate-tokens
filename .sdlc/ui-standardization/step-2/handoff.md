## Task goal
The editor shell is one standardized UI: a single text-role system, one inset and radius composition rule for every container, one anatomy table for every control, one glyph motion set, all derived from the Maison ladder cell, with the shell defaulting to the product tier, sm scale, md size.

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
