<!-- role=planner level=L3 model=opus effort=xhigh -->
## Goal
Add the compound-inset fields and roles (`partHeight`, `partInset`, `--control-part-height`, `--control-part-inset`) to the geometry engine and every emitter and record, then rebuild the shell's segmented controls, icon-only buttons and control text on the cell roles, fold in the PR #813 shell review findings, and land it with every gate green and pixel evidence at product-md and content-lg.

## Step 1: Engine part fields, emitters, and every dependent that pins the 14-field cell
level: L3
### Do
Depends on: none. Touches no T-0025 or T-0026 file. The design is in `.sdlc/geometry-compound-insets/architect-L1.md` (Interfaces and Carry forward); this step corrects three of its facts, listed below.

1. `src/engine/geometry.mjs`:
   - `buildCell` (~:114-137) adds `partHeight: height - row.inset` and `partInset: row.inset / 2`, placed after `minWidth`.
   - `CELL_FIELDS` (~:203-208) becomes `export const` with 16 entries: `["part-height", "partHeight"], ["part-inset", "partInset"]` go right after `["min-width", "minWidth"]` (indices 10 and 11). `RESOLVER_FIELDS` stays at 9, so the 81 ctx-cell hooks per block do not move.
   - In the `:where(*, :host)` block of `geomResolverCSS` (~:272-278), add these two lines verbatim, beside the radius roles: `--control-part-height: calc(var(--control-height) - var(--control-inset));` and `--control-part-inset: calc(var(--control-inset) / 2);`.
   - Header comment (lines 1-30): state the compound law. A control-sized container pads by `partInset` and keeps `radiusControl`. Its repeated part is `partHeight` tall, keeps `partInset` inline, and takes `radiusInset`. A wrap around full-height controls (listbox, menu, card) takes `radiusCard` outside and `radiusControl` inside. The chip snaps to a ladder row and the part is exact. On the three micro cells where no ladder row fits under `height - inset` (micro-sm-sm, micro-sm-md, micro-md-sm), the chip falls back to the 12px row and is taller than the part.
   - Comments at ~:201, :283, :342 and :380-381 move from 14 to 16 (`27 × 16`, `9 × 16`).
2. `src/engine/ds-export.js` (the architect missed both items here):
   - Delete the hand copy `DS_CELL_FIELDS` (~:1544-1549). Add `CELL_FIELDS` to the existing `./geometry.mjs` import (~:24) and use it in `dsFullLayersCss` (~:1593). The Figma Make bundle then emits 16 fields per cell.
   - In `exportDesignSystemComponents`, `mdCell` (~:449) is in scope at the menu card (~:614). Write `const menuPad = mdCell ? mdCell.partInset : 4;`. `menuItemRadius = Math.max(0, rLg - menuPad)` stays, because the popover radius is `rLg` by #480.
   - Update the comment at ~:605-611 to say the menu padding is the kit default cell's `partInset`.
   - This is value-neutral at the default kit: product-md-md has inset 8, so `partInset` is 4. Run `node test/engine/exports.mjs`. Its menu check (~:1879) reads integer px, which the default kit keeps.
3. `src/ui/sections/geometry.js`: delete `TABLE_FIELDS` (:11-17) and import `CELL_FIELDS` from `../../engine/geometry.mjs`. The Tokens tab title (~:301) says `every cell × its ${CELL_FIELDS.length} fields`. Update the comments at :11 and :67.
4. Tests:
   - `test/engine/geometry.mjs`:
     - The emitter count at :119 becomes `27 * 16`.
     - The role list at :123 gains `--control-part-height:` and `--control-part-inset:`.
     - The DTCG check at :166 becomes 16.
     - The Figma modes check at :176 becomes `.length === 432` for `size/` and `.length === 144` for `control/` (the architect missed the 126).
     - :132 stays 81.
     - New assertions: for every cell, `partHeight` equals the vendored fixture row's height minus its inset, and `partInset` equals inset / 2. Read both from `FIX.rows`, not from `buildCell`.
     - New assertion: `chipHeight <= partHeight` on the 24 cells where a ladder row fits under `height - inset`. Name the three micro exceptions literally in the test (the architect's "every cell" invariant is false on them).
     - New assertion: the two resolver lines appear verbatim.
   - `test/figma/migrations.mjs:63` becomes `cellNames.length === 432` with the message text `want 432 = 27 cells x 16 fields`.
   - `test/ui/headless-boot.mjs:2822` `(geo-tok)` becomes the literal `.tok-col").length === 16` with the message `(16)`. Keep it a literal, an independent count.
   - `test/smoke/smoke.mjs` resolver cases (~:262-281):
     - Each case also carries the cell's `partHeight` and `partInset`.
     - The probe `<i>` style gains `min-height:var(--control-part-height);padding-left:var(--control-part-inset)`.
     - The read returns `parseFloat(cs.minHeight)` and `parseFloat(cs.paddingLeft)`, both compared within 0.01.
     - The ok label becomes exactly `geometry.css resolver: all 108 nested cases (27 cells x 4 radius modes) resolve --control-height, --radius-control, --control-part-height and --control-part-inset to the engine's cell values`.
     - Smoke runs only in step 6, so this step proves the runtime behavior only structurally.
5. Regenerate the committed assets: `npm run gen:mcp-assets && npm run bundle && npm run gen:figma-ui`. These need no `node_modules`. `src/ui/describe-mcp-assets.js` inlines `geometry.mjs`, and `figma/plugin/ui.html` bundles the app. Never hand-edit them.
6. No persist schema change: both fields derive from `{tier, scale, radius, spaceBase}` (architect, `persist.js:368-369`). Do not touch `figma/`: nothing there enumerates the field names (architect Carry forward). `plugin/.../dimension-parity.mjs` reads fields and roles off the engine, so it moves to 16 and 15 with no edit.
### Acceptance criteria
- (red) `node --input-type=module -e 'import * as G from "./src/engine/geometry.mjs"; const F = G.CELL_FIELDS; if (!(Array.isArray(F) && F.length === 16 && F[10].join() === "part-height,partHeight" && F[11].join() === "part-inset,partInset")) process.exit(1); for (const radius of ["round", "pill"]) for (const [n, c] of Object.entries(G.geomScale({ radius }).cells)) if (!(c.partHeight === c.height - c.inset && c.partInset === c.inset / 2)) { console.log(n); process.exit(1); } const over = Object.entries(G.geomScale({}).cells).filter(([, c]) => c.chipHeight > c.partHeight).map(([n]) => n).sort().join(); if (over !== "micro-md-sm,micro-sm-md,micro-sm-sm") { console.log(over); process.exit(1); }'`
- (red) `node --input-type=module -e 'import * as G from "./src/engine/geometry.mjs"; const s = G.geomScale({}); const css = G.geomTokensCSS(s); const prim = [...css.matchAll(/--size-(content|product|micro)-(sm|md|lg)-(sm|md|lg)-[a-z-]+: /g)].length; const i = css.indexOf(":where(:root) {"); const root = css.slice(i, css.indexOf("}", i)); const v = Object.keys(G.geomTokensFigmaModes(s, []).collections.Geometry.variables); const pre = G.geomTokensCSS(s, { prefix: "md" }); const ok = prim === 27 * 16 && Object.values(G.geomTokensDTCG(s).size).every((c) => Object.keys(c).length === 16) && v.filter((k) => k.startsWith("size/")).length === 432 && v.filter((k) => k.startsWith("control/")).length === 144 && css.includes("--control-part-height: calc(var(--control-height) - var(--control-inset));") && css.includes("--control-part-inset: calc(var(--control-inset) / 2);") && root.split("--ctx-cell-").length - 1 === 81 && pre.includes("--control-part-height:") && !pre.includes("--md-control-part"); process.exit(ok ? 0 : 1)'`
- (red) `node test/engine/geometry.mjs && grep -qF '27 * 16' test/engine/geometry.mjs && grep -qF '=== 432' test/engine/geometry.mjs && grep -qF 'partInset' test/engine/geometry.mjs`
- (red) `node test/figma/migrations.mjs && grep -qF 'want 432 = 27 cells x 16 fields' test/figma/migrations.mjs`
- (red) `node test/engine/ds-gates.mjs && ! grep -qF 'DS_CELL_FIELDS' src/engine/ds-export.js && ! grep -qF 'const menuPad = 4;' src/engine/ds-export.js && grep -qE 'const menuPad = .*partInset' src/engine/ds-export.js && grep -qE '^import \{[^}]*CELL_FIELDS[^}]*\} from "\./geometry\.mjs"' src/engine/ds-export.js`
- (red) `! grep -qF 'TABLE_FIELDS' src/ui/sections/geometry.js && grep -qE '^import \{[^}]*CELL_FIELDS[^}]*\} from "\.\./\.\./engine/geometry\.mjs"' src/ui/sections/geometry.js && grep -qF '.tok-col").length === 16' test/ui/headless-boot.mjs && node test/ui/headless-boot.mjs`
- (red) `node plugin/ultimate-tokens/skills/geometry-tokens/scripts/dimension-parity.mjs | grep -qF '27 cells x 16 fields, 15 roles'`
- (red) `grep -qF 'min-height:var(--control-part-height)' test/smoke/smoke.mjs && grep -qF 'padding-left:var(--control-part-inset)' test/smoke/smoke.mjs && grep -qF 'resolve --control-height, --radius-control, --control-part-height and --control-part-inset' test/smoke/smoke.mjs`
- (red) `grep -qF 'part-inset' src/ui/describe-mcp-assets.js && grep -qF 'part-inset' figma/plugin/ui.html`
- (red) `! grep -nE '14 (per-cell|fields|kebab)|27 × 14|9 × 14' src/engine/geometry.mjs src/ui/sections/geometry.js src/engine/ds-export.js && sed -n '1,40p' src/engine/geometry.mjs | grep -qF 'partInset'`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/styles.css src/ui/app.js src/ui/sections/color.js src/ui/model.mjs src/ui/persist.js src/ui/overlays figma/binder figma/plugin/code.js)$(git ls-files --others --exclude-standard -- src/ui/overlays figma/binder)"`

## Step 2: Maintainer and consumer records, MCP descriptions, and the ADR
level: L2
### Read first
- `docs/references/AGENTS.md`
### Do
Depends on: step 1. `test/plugin/geometry-tokens.mjs` checks every role a skill names against the engine, so this step cannot land before it.
1. Move every count from 14 to 16 fields (27 × 16, 9 × 16, 432 FLOAT, 144 ALIAS) and from 13 to 15 roles, and name the two new fields and roles, in:
   - `docs/references/geometry/README.md` (:59, :69, :94-95; add `part-height` and `part-inset` to the field table).
   - `.claude/skills/geometry-system/SKILL.md` (:51, :103, :108, :128), plus `references/foundations.md` (:14, :114), `references/rubric.md` (:15, including its `378`) and `references/best-practices.md` (:53).
   - `.claude/skills/maintaining-figma-plugins/SKILL.md:115`.
   - `plugin/ultimate-tokens/skills/geometry-tokens/SKILL.md` (:32 "13 resolved roles", and the grammar lists at :45-48), plus `references/controls.md`, `references/detail.md`, and the comments in `scripts/dimension-parity.mjs` (:5, :23).
2. Teach the compound recipe in `plugin/ultimate-tokens/skills/geometry-tokens/references/controls.md`, as a CSS block that uses the literal spans `var(--control-part-height)`, `var(--control-part-inset)`, `var(--radius-control)` and `var(--radius-inset)`:
   - A segmented or tab container pads `var(--control-part-inset)` (minus its border width) and takes `var(--radius-control)`.
   - Each segment is `var(--control-part-height)` tall with `var(--control-part-inset)` inline padding and `var(--radius-inset)`.
   - A listbox or menu wrap takes `var(--radius-card)` around `var(--radius-control)` options.
   - An icon-only button is square at `var(--control-height)` with `padding: 0`.
   - Also state, in prose, that `--chip-*` is a different thing: it snaps to a ladder row, while the part is exact.
3. Add `part-height` and `part-inset` to both MCP descriptions in `mcp/brand-kit-core.mjs` (:87 roles sentence, :129 `get_geometry` field list). The cells pass through unchanged (architect Carry forward). Regenerate with `npm run gen:mcp-assets`.
4. Append `## ADR-033: Compound containers take half the part's inset and compose radius concentrically` to `docs/references/decision-records.md`, before `## Quick map`. If ADR-033 was taken by another lane, use the next free number; the criterion matches the heading text, not the number. Content:
   - The half law, with the user's words from the handoff.
   - Maison's listbox matches it and its segmented quarter does not.
   - No new radius field.
   - Rejected: resolver fields, a `radius-part` field, `data-size` on `.seg-sm`.
   - Consequences: 16 fields, 15 roles, 432/144 Figma variables, the three micro cells where the chip is taller than the part.
5. Leave ADR-032's own text (`decision-records.md` ~:1101-1137) and `docs/references/changelog.md` as written: they are history, and ADR-033 supersedes the count.
6. `.sdlc/notes.md:12` fix-now: reword the `test/plugin/geometry-tokens.mjs` comment that still says ".control-* class it names must match" to name the `--control-*` and `--chip-*` roles.
7. No U+2014 anywhere.
### Acceptance criteria
- (red) `! grep -rnE '27 ?[x×] ?14|9 ?[x×] ?14|14 (per-cell|fields|kebab)|13 (resolved )?roles|(^|[^0-9])378([^0-9]|$)' docs/references/geometry/README.md .claude/skills/geometry-system .claude/skills/maintaining-figma-plugins/SKILL.md plugin/ultimate-tokens/skills/geometry-tokens mcp/brand-kit-core.mjs`
- (red) `grep -qF -- '--control-part-height' plugin/ultimate-tokens/skills/geometry-tokens/SKILL.md && grep -qF -- '--control-part-inset' plugin/ultimate-tokens/skills/geometry-tokens/SKILL.md && grep -qF -- 'var(--control-part-height)' plugin/ultimate-tokens/skills/geometry-tokens/references/controls.md && grep -qF -- 'var(--radius-inset)' plugin/ultimate-tokens/skills/geometry-tokens/references/controls.md && node test/plugin/geometry-tokens.mjs`
- (red) `grep -qF 'partInset' .claude/skills/geometry-system/SKILL.md && grep -qF 'part-height' docs/references/geometry/README.md`
- (red) `test "$(grep -c 'part-height' mcp/brand-kit-core.mjs)" -ge 2 && node test/mcp/core.mjs`
- (red) `n=$(grep -nE "^## ADR-[0-9]+: .*[Cc]ompound" docs/references/decision-records.md | head -1 | cut -d: -f1) && q=$(grep -n "^## Quick map" docs/references/decision-records.md | cut -d: -f1) && test -n "$n" && test "$n" -lt "$q"`
- (guard) `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/styles.css src/ui/app.js src/ui/sections/color.js src/ui/model.mjs src/ui/persist.js src/ui/overlays figma/binder figma/plugin/code.js)$(git ls-files --others --exclude-standard -- src/ui/overlays figma/binder)"`

## Step 3: Compound segmented controls and square ghost icon-only buttons in the shell
level: L3
### Do
Depends on: step 1, and T-0025 merged into this tree first (handoff Intent: T-0025 edits `app.js`, `color.js` and `styles.css`). Line numbers below are at `197bc55b`; find each rule by its selector after T-0025 lands.
1. Aliases: in the `ultimate-tokens { ... }` block in `src/ui/styles.css` (~:74-85), add `--sh-part-height: var(--control-part-height, 24px);` and `--sh-part-inset: var(--control-part-inset, 4px);`. The fallbacks are the product-md-md round cell. The roles arrive live from `_applyShellGeometry` (`app.js` ~:2328).
2. Compound containers (`styles.css` ~:880-903). One container rule covers `.segmented, .figma-files, .radix-files`:
   - `box-sizing: border-box; block-size: var(--sh-control-height); padding: calc(var(--sh-part-inset) - 1px); border-radius: var(--sh-control-radius); gap: 0;`
   - Keep the 1px border, background and `display: flex`.
   - The 1px border sits inside the half, so the outer box equals `--control-height`, and the part's corner (`radiusControl - partInset = radiusInset`) is concentric.
3. Parts: one rule covers `.segmented button, .figma-files button, .radix-files button`:
   - `min-block-size: var(--sh-part-height); padding-block: 0; padding-inline: var(--sh-part-inset); border-radius: var(--sh-radius-inset); font-size: var(--sh-control-text);`
   - Keep the existing color and weight.
   - The `.on` state applies to all three.
4. Delete these rules:
   - The old `.figma-files`, `.figma-files button`, `.radix-files` and `.radix-files button` rules (~:1088-1090, ~:1095-1097). The two pickers are segmented controls built by `segmented()` with `baseClass` (`overlays/drawer.js:221,265`), so `drawer.js` is not touched.
   - `.segmented.seg-sm button` (~:902).
   - In the `@media (max-width: 1240px)` block (~:1568-1569), the `.segmented button { padding: 5px 8px; }` line. `.canvas-seg button` there becomes `padding-inline: var(--sh-control-inset);`.
5. `.canvas-seg button` and `.app-header .section-seg button` keep `padding-inline: calc(var(--sh-control-inset) * 2)`: a deliberate wide variant (architect).
6. Drop `seg-sm`, so the segments read `--sh-control-text` like every other control (the added requirement). Remove `cls: "seg-sm"` from the Hue space and On-colors `segmented()` calls in `src/ui/sections/color.js` (~:2095, ~:2107). They are its only users (grep).
7. Icon-only buttons:
   - Add a `button.icon-only` rule after `button.ghost`: `inline-size: var(--sh-control-height); min-inline-size: var(--sh-control-height); block-size: var(--sh-control-height); padding: 0; justify-content: center; border-color: transparent; background: transparent;`.
   - Hover keeps the base `button:hover` fill. `button.icon-only[aria-pressed="true"]` and `.pane-toggle.on` take `color: var(--accent)` only.
8. `btn()` in `src/ui/app-helpers.mjs:402` emits class `icon-only` instead of `ghost` when the variant is the default `ghost` and `children` is one `.ic` element, either bare or a one-item array. Test with `/(^|\s)ic(\s|$)/` on `className`.
   - Settled over per-site `cls`. There are 22 `btn(icon(...))` sites across 9 files, among them `overlays/apply-gate.js:369`, a T-0026 file. One helper change reaches them all, and future icon buttons too.
   - `variant: "bare"` sites keep their class: `.map-reset`, `.key-act`, `.tok-reset` and `.tyi-weight-del` are inline row actions, not control-sized.
   - No test asserts `ghost` on an icon button: `grep -rn ghost test/` hits only Figma variable names and gate-report.
9. `paneToggle` (`app.js` ~:1463): the class becomes `"icon-only pane-toggle pane-toggle-" + side + (shown ? " on" : "")`, with `ghost` dropped. In `styles.css` (~:423-427), `.pane-toggle` keeps `color: var(--ink-dim); flex: none;` only, dropping padding, font-size, line-height and letter-spacing. `.pane-toggle.on` keeps `color: var(--accent)` only. `.mode-control .mode-add` (~:532) keeps `flex: none` only.
10. Headless group `(cpd)` in `test/ui/headless-boot.mjs`, at least 5 labelled assertions:
    - (cpd1) both pane toggles carry `icon-only` and not `ghost`.
    - (cpd2) the Zoom in, Undo and Settings buttons carry `icon-only` and not `ghost`.
    - (cpd3) the "Add data palettes (8)" button carries `ghost` and not `icon-only`.
    - (cpd4) a `variant: "bare"` icon button carries no `icon-only`.
    - (cpd5) a stylesheet-text check of the `.segmented` and `button.icon-only` rules, read from `src/ui/styles.css`. It is a function run on the real text, plus negative controls on two mutated copies: `padding: 2px` restored on `.segmented`, and `border-color: var(--line)` on `button.icon-only`. Each copy must fail.
    - The shim has no computed styles, so no size assertions here.
11. Smoke code in `test/smoke/smoke.mjs` (runtime proven in step 6 only):
    - For shell geometry product-md and then content-lg, set `el.shellGeometry = { tier, scale, radius: "round" }` and render the Color section with no palette selected.
    - Measure against the engine cell `geomScale({ tier, scale, radius: "round" }).cells[tier + "-" + scale + "-md"]`, each within 0.5px:
      - Every visible `.segmented` outer height equals `height`, and its buttons equal `partHeight`.
      - Container `border-top-left-radius` equals `radiusControl`, and the button's equals `radiusInset`.
      - Every visible `button.icon-only` outside `.canvas-scene` is `height` by `height`, with a transparent computed `border-top-color` at rest.
    - The ok label is `compound at <tier>-<scale>: segmented outer = control height, segments = part height, concentric corners, icon-only buttons square and borderless`.
    - Write screenshots `smoke-out/compound-product-md.png` and `smoke-out/compound-content-lg.png`, then reset `el.shellGeometry = null`.
### Acceptance criteria
- (red) `grep -qE '^ *--sh-part-height: var\(--control-part-height, 24px\);' src/ui/styles.css && grep -qE '^ *--sh-part-inset: var\(--control-part-inset, 4px\);' src/ui/styles.css`
- (red) `node -e 'const c=require("fs").readFileSync("src/ui/styles.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const R=[...c.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m)=>[m[1].trim().split(/\s*,\s*/),m[2]]);const body=(s)=>R.filter(([sel])=>sel.includes(s)).map((r)=>r[1]).join(";");const a=body(".segmented"),b=body(".segmented button");const need=[[a,"block-size: var(--sh-control-height)"],[a,"padding: calc(var(--sh-part-inset) - 1px)"],[a,"border-radius: var(--sh-control-radius)"],[a,"gap: 0"],[b,"min-block-size: var(--sh-part-height)"],[b,"padding-inline: var(--sh-part-inset)"],[b,"border-radius: var(--sh-radius-inset)"],[body(".figma-files"),"padding: calc(var(--sh-part-inset) - 1px)"],[body(".radix-files"),"padding: calc(var(--sh-part-inset) - 1px)"],[body(".figma-files button"),"min-block-size: var(--sh-part-height)"],[body(".radix-files button"),"min-block-size: var(--sh-part-height)"]];const miss=need.filter(([t,s])=>!t.includes(s));miss.forEach((m)=>console.log("missing",m[1]));process.exit(miss.length?1:0)'`
- (red) `node -e 'const c=require("fs").readFileSync("src/ui/styles.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const R=[...c.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m)=>[m[1].trim().split(/\s*,\s*/),m[2]]);const bad=R.filter(([sel,b])=>sel.some((s)=>/\.(segmented|canvas-seg|section-seg|figma-files|radix-files)\b/.test(s)) && b.split(";").some((d)=>/^\s*padding[a-z-]*\s*:/.test(d) && !/var\(/.test(d) && /[1-9]/.test(d.split(":")[1])));bad.forEach((r)=>console.log(r[0].join(),"|",r[1].trim().slice(0,80)));process.exit(bad.length?1:0)' && ! grep -qF 'seg-sm' src/ui/styles.css src/ui/sections/color.js`
- (red) `node -e 'const c=require("fs").readFileSync("src/ui/styles.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const R=[...c.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m)=>[m[1].trim().split(/\s*,\s*/),m[2]]);const body=(s)=>R.filter(([sel])=>sel.includes(s)).map((r)=>r[1]).join(";");const a=body("button.icon-only");const need=["inline-size: var(--sh-control-height)","block-size: var(--sh-control-height)","padding: 0","justify-content: center","border-color: transparent","background: transparent"];const miss=need.filter((s)=>!a.includes(s));miss.forEach((m)=>console.log("missing",m));const p=body(".pane-toggle")+body(".pane-toggle.on")+body(".mode-control .mode-add");process.exit(miss.length === 0 && !/padding|font-size|border-color/.test(p) ? 0 : 1)'`
- (red) `grep -qF 'class: "icon-only pane-toggle pane-toggle-"' src/ui/app.js && grep -qF 'icon-only' src/ui/app-helpers.mjs`
- (red) `node test/ui/headless-boot.mjs && test "$(grep -c '(cpd' test/ui/headless-boot.mjs)" -ge 5`
- (red) `grep -qF 'compound at ' test/smoke/smoke.mjs && grep -qF 'compound-product-md.png' test/smoke/smoke.mjs && grep -qF 'compound-content-lg.png' test/smoke/smoke.mjs`

## Step 4: Common control text rules, the static control-text gate, and chrome bands that grow with the tier
level: L3
### Read first
- `docs/references/AGENTS.md`
### Do
Depends on: step 3. Covers the handoff's added requirement and three of the pixel-review items in `.sdlc/notes.md:25`: chrome overflow at larger tiers, Settings segmented label wrap, geometry inspector chip wraps.
1. Single-line labels in `src/ui/styles.css`:
   - The base `button` rule (~:168-183) gains `white-space: nowrap;`.
   - Delete the toolbar-only rule `.app-header button, .canvas-header button, .drawer-foot button, .drawer-head button { white-space: nowrap; }` (~:1564), now folded into the base rule.
   - `.chip` (~:804-809) gains `white-space: nowrap;`, and its `line-height: 1.4` becomes `line-height: 1;` like `button`.
   - `.insp-actions` (~:987) gains `flex-wrap: wrap;`, so two one-line buttons wrap as whole controls, never inside a label.
   - No multi-line opt-in class is added, because no control needs one.
2. Offenders read the cell roles:
   - `.tyi-font-input` (~:1462) keeps its border, background and color, and becomes `font-size: var(--sh-control-text); line-height: 1; min-block-size: var(--sh-control-height); padding-block: 0; padding-inline: var(--sh-control-inset); border-radius: var(--sh-control-radius);`.
   - `.app-header .docname` (~:416) drops its literal `padding` and `border-radius`, so the base `input[type="text"]` rule applies, and keeps `max-width: 180px`.
   - Delete `.map-head .ghost { padding: 4px 10px; }` (~:743).
   - `.map-raw-select, .map-raw-input` (~:732), the dense in-table controls, take the chip row of the same cell: `min-block-size: var(--sh-chip-height); padding-block: 0; padding-inline: var(--sh-chip-inset); font-size: var(--sh-chip-text);`.
   - In the `@media (max-width: 1240px)` block, the header rule becomes `.app-header button:not(.icon-only), .canvas-header button:not(.icon-only) { padding-inline: calc(var(--sh-control-inset) / 2); }`, so it never defeats the icon-only `padding: 0`.
3. Chrome bands: in the `ultimate-tokens { ... }` alias block, add `--hh: max(48px, calc(var(--sh-control-height) + 16px));` and `--ch: max(42px, calc(var(--sh-control-height) + 10px));`.
   - The `:root` literals at :48-49 stay as the outside-host fallback.
   - This is value-neutral at product-md and below (32 + 16 = 48, 32 + 10 = 42) and grows at content-lg (64px controls in a 74px pane-head).
4. New gate `test/repo/control-text.mjs`, registered in `test/run.mjs`'s `TESTS` next to `"repo/svg-rules.mjs"`:
   - It reads `src/ui/styles.css`, or the path given as `argv[2]`, strips comments, and walks every rule, including rules inside `@media`.
   - A rule is a control rule when one of its selectors contains: element `button`, element `select`, `input[type="text"]`, `input[type="search"]`, `.segmented`, `.canvas-seg`, `.section-seg`, `.chip`, `.ghost`, `.icon-only`, `.pane-toggle`, `.figma-files`, `.radix-files`, `.tyi-font-input`, `.docname`, `.map-raw-select` or `.map-raw-input`.
   - Selectors containing `.ex-` or `.geom-ex-` are allowlisted, because they are specimen mocks painted at a kit cell, not the shell.
   - Violations:
     - A `font-size` or `padding*` value with no `var(` that holds a non-zero length.
     - A `line-height` other than `1`, `normal`, `inherit` or a `var(`.
   - It prints each violation as `<selector list> | <property>: <value>` and exits 1, else prints a pass line and exits 0.
   - It carries an in-file negative control: a literal `.figma-files button { font-size: 11.5px; }` string must be flagged.
5. Smoke control-text check in `test/smoke/smoke.mjs` (runtime proven in step 6 only):
   - Run it for product-md and content-lg (as in step 3), over the Color section with no palette selected (the Global inspector), the Color section with the first palette selected (the palette inspector, which holds `input[data-fk="pname"]`), Typography, and Geometry.
   - Check every visible `button`, `select`, `input[type="text"]`, `input[type="search"]` and `input.tyi-font-input` under the host, except:
     - descendants of `.canvas-scene`, `.seg-example` and `.example-scheme`;
     - classes containing `ex-`;
     - `.map-reset`, `.key-act`, `.tok-reset`, `.tyi-weight-del`.
   - Expected values come from the engine cell `geomScale({ tier, scale, radius: "round" }).cells[tier + "-" + scale + "-md"]`, an independent derivation like the resolver cases:
     - Computed `font-size` equals `text`. `.map-raw-*` and `.chip` equal `chipText`.
     - Rect height is at most `height + 0.5`: no wrapped label.
     - The palette Name field also computes `border-top-left-radius` equal to `radiusControl` and `min-height` equal to `height`.
   - Print offenders by tag and class. The ok label is `control text at <tier>-<scale>: N controls, every shell button, select and text input computes the cell text size on one line`.
   - Covering both the palette inspector Name field and the header doc-name input settles handoff item 1 by computed style, not by a blind CSS fix. Chrome only; Safari stays unproven.
6. Records: in `docs/references/component-inventory.md`, update the Button entry (icon-only via `btn()`, `.pane-toggle`) and the Segmented entry (compound rule, `.figma-files`/`.radix-files` folded in, `seg-sm` gone, which also removes the `seg-sm` mention at ~:199). Then run `node scripts/audit-citations.mjs --md`. Repair by number every cite steps 3 and 4 moved in `component-inventory.md` and `docs/specs/app-shell.md` (the only step that repairs cites).
### Acceptance criteria
- (red) `test -f test/repo/control-text.mjs && grep -qF '"repo/control-text.mjs"' test/run.mjs && node test/repo/control-text.mjs`
- (red) `test -f test/repo/control-text.mjs && f=$(mktemp) && git show "$SDLC_BASE_SHA":src/ui/styles.css > "$f" && out=$(node test/repo/control-text.mjs "$f" 2>&1); rc=$?; test "$rc" -ne 0 && for s in ".figma-files button" ".tyi-font-input" ".docname" ".map-raw-select" ".chip"; do printf "%s\n" "$out" | grep -qF "$s" || exit 1; done`
- (red) `node -e 'const c=require("fs").readFileSync("src/ui/styles.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const R=[...c.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m)=>[m[1].trim().split(/\s*,\s*/),m[2]]);const body=(s)=>R.filter(([sel])=>sel.includes(s)).map((r)=>r[1]).join(";");const need=[[body("button"),"white-space: nowrap"],[body(".chip"),"white-space: nowrap"],[body(".chip"),"line-height: 1;"],[body(".insp-actions"),"flex-wrap: wrap"],[body(".map-raw-select"),"font-size: var(--sh-chip-text)"],[body(".map-raw-input"),"min-block-size: var(--sh-chip-height)"]];const miss=need.filter(([t,s])=>!(t+";").includes(s));miss.forEach((m)=>console.log("missing",m[1]));process.exit(miss.length === 0 && !body(".drawer-head button").includes("nowrap") ? 0 : 1)'`
- (red) `grep -qF -- '--hh: max(48px, calc(var(--sh-control-height) + 16px));' src/ui/styles.css && grep -qF -- '--ch: max(42px, calc(var(--sh-control-height) + 10px));' src/ui/styles.css && grep -qF '.app-header button:not(.icon-only), .canvas-header button:not(.icon-only)' src/ui/styles.css`
- (red) `grep -qF 'control text at ' test/smoke/smoke.mjs && grep -qF 'data-fk="pname"' test/smoke/smoke.mjs`
- (red) `node test/repo/citations.mjs && grep -qF 'icon-only' docs/references/component-inventory.md && ! grep -qF 'seg-sm' docs/references/component-inventory.md`

## Step 5: PR #813 shell review follow-ups: icon sizes, host-scoped geometry roles, breakpoint root, categories leg
level: L3
### Do
Depends on: step 4, and T-0025 merged (`.sdlc/notes.md:25` holds these items until it lands).
1. Major 2, `src/ui/icons.js` `icon()` (~:44-56):
   - When `opts` has its own `size` key, the svg carries only `width="${size}" height="${size}"` and no inline style. A caller's explicit size then holds, and a stylesheet rule (the geometry specimen's `.geom-ex-caret svg { width: 100% }`) can still size it.
   - Without `size`, the svg keeps `style="width:var(--sh-control-icon, 16px);height:var(--sh-control-icon, 16px)"`.
   - Headless group `(ics)`, at least 2 assertions:
     - (ics1) `icon("x")`'s svg style holds `var(--sh-control-icon, 16px)`.
     - (ics2) `icon("x", { size: 13 })`'s svg has `width="13"` and no `--sh-control-icon` in any style.
   - Fix the `(geo-row)` assertion to read the svg, not the span.
2. Major 3, `_applyShellGeometry` (`app.js` ~:2328-2342): scope the injected CSS to its own host.
   - Each instance gets a key from a module counter, assigned once in the constructor and stamped as `this.dataset.utGeom`.
   - The style element id is `ut-geometry-roles-<key>`.
   - A helper rewrites the generated text before it is set:
     - Both `:root {` and `:where(:root) {` become `:where(ultimate-tokens[data-ut-geom="<key>"]) {`.
     - `:where([data-A="V"]) {` becomes `:where(ultimate-tokens[data-ut-geom="<key>"][data-A="V"], ultimate-tokens[data-ut-geom="<key>"] [data-A="V"]) {`.
     - `:where(*, :host) {` becomes `:where(ultimate-tokens[data-ut-geom="<key>"], ultimate-tokens[data-ut-geom="<key>"] *) {`.
   - The engine's exported CSS does not change.
   - Before the edit, `git grep -nE "documentElement.*--(control|size|chip|radius)-"` over `src/ui`. Move any reader of the roles off `documentElement` to the host.
   - Contract dependents in `test/ui/headless-boot.mjs` `(shg4)` (~:183-186) pin the id `ut-geometry-roles`. Update them to the keyed id and add:
     - (shg5) the style text has no `:root {`, no `:where(:root)` and no `:where(*, :host)`, and every block selector names `data-ut-geom`.
     - (shg6) a second instance gets a different key and its own style element.
3. Minor 6, `src/engine/geometry.mjs` `geomTokensBreakpointCSS` (~:310-340): both branches emit `:where(:root) {` instead of `:root {`. Update the regexes at `test/engine/geometry.mjs` (~:156, ~:163). Grep `docs/references/geometry/README.md` and the plugin skill's `references/responsive.md` for the old breakpoint example and match them.
4. Minor 7, `test/engine/categories.mjs` (~:266-272):
   - The geometry pass-through leg still checks the retired `doc.geometry.ramp`.
   - Rewrite it to assert what the hydrate path does today with a spec palette's `geometry` object (read the hydrate in `src/ui/model.mjs` and `src/ui/persist.js`; T-0017 moved geometry to `{tier, scale, radius, spaceBase}`).
   - Make it non-vacuous: assert that the corpus count of spec palettes carrying `geometry` is above 0.
   - Reword the stale `ramp` comments at `categories.mjs:6` and `scripts/gen-categories.mjs:224,445`.
   - Leave `figma/binder/mode-apply-plan.mjs:250`, because it is a T-0026 file; record it under the report's Follow-ups in step 6.
### Acceptance criteria
- (red) `node test/ui/headless-boot.mjs && test "$(grep -c '(ics' test/ui/headless-boot.mjs)" -ge 2 && ! grep -qF 'style="width:var(--sh-control-icon, ${size}px)' src/ui/icons.js`
- (red) `grep -qF 'data-ut-geom' src/ui/app.js && test "$(grep -c 'data-ut-geom' test/ui/headless-boot.mjs)" -ge 2 && ! grep -qF 'el.id = "ut-geometry-roles";' src/ui/app.js`
- (red) `node --input-type=module -e 'import * as G from "./src/engine/geometry.mjs"; const f = G.geomTokensBreakpointCSS([{ name: "Mobile", minWidth: 476, scale: G.geomScale({ scale: "sm" }) }, { name: "Desktop Xl", minWidth: 1440, scale: G.geomScale({ scale: "lg" }) }]); process.exit(f.length === 2 && f.every((m) => m.css.includes(":where(:root) {") && !/(^|[^(]):root \{/m.test(m.css)) ? 0 : 1)' && node test/engine/geometry.mjs`
- (red) `! grep -qF 'doc.geometry.ramp' test/engine/categories.mjs && node test/engine/categories.mjs`

## Step 6: Gates green, pixel evidence, and the run report
level: L3
guard timeout: 3000
### Read first
- `docs/AGENTS.md`
### Do
Depends on: steps 1 to 5.
1. `node_modules` is untracked. Run `npm ci` first only if it is missing.
2. Run every gate through the lock, as the criteria spell them (`SDLC_GATE_WORKERS=10`, the version-free `gate_lock.py` path):
   - `npm test`. Its generator prefix regenerates the committed assets, so the first criterion is red on a first run that rewrites a stale asset and green on the second. Keep the regenerated bytes, so CI's drift check stays green.
   - `npm run build`.
   - `npm run smoke`, which builds first. It holds the 108-case resolver line with the part roles, `compound at` and `control text at`, both at product-md and content-lg, and writes the two compound screenshots.
   - The sweeps as eight separate legs, never the chained `gate:sweeps`: `gate:corpus-reset` first (the leg that runs `headless-boot.mjs --full`), then the seven color legs, one at a time.
3. Fix every red that steps 1 to 5 introduced. If a fix moves lines in a cited file, repair the cites by number (`node scripts/audit-citations.mjs --md`).
4. Pixel check: open `smoke-out/compound-product-md.png` and `smoke-out/compound-content-lg.png`. Confirm the segmented controls, the icon-only header toggle, the Global inspector buttons on one line, and no chrome overflow at content-lg. Record what you saw.
5. Write `docs/reports/<run date YYYY-MM-DD>-geometry-compound-insets.md` with these sections:
   - `## Command`: base sha (`git merge-base HEAD main`), HEAD sha, and each command as run.
   - `## Gates`: one row per leg, with exit code and seconds.
   - `## Compound and control text`:
     - The smoke resolver line.
     - The `compound at` and `control text at` lines at both geometries, with the measured heights.
     - The paths `smoke-out/compound-product-md.png` and `smoke-out/compound-content-lg.png`.
     - What the pixel check showed.
   - `## Follow-ups`:
     - Safari is not proven: smoke is Chrome only, and the user previews in Safari, including the palette Name field.
     - Two pixel-review items from `.sdlc/notes.md:25` were not folded in because no record says what was seen: faint light-theme headings and the micro-sm switch.
     - `figma/binder/mode-apply-plan.mjs:250`'s stale comment (T-0026).
     - The three micro cells where the chip is taller than the part.
     - `.account-license-input` and `.tok-input` sit outside the control-text gate's selector list.
     - `panda-smoke` runs only in CI.
     - No push, PR or issue was made.
   - Cite paths and symbols, never `file:line`. No U+2014.
6. No push, PR or issue.
### Acceptance criteria
- `a=$(cat figma/plugin/ui.html src/ui/*-assets.js src/ui/categories/*.js docs/reference/data/adia-* | shasum) && SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name npm-test -- npm test && test "$a" = "$(cat figma/plugin/ui.html src/ui/*-assets.js src/ui/categories/*.js docs/reference/data/adia-* | shasum)"`
- `SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name build -- npm run build`
- (red) `out=$(SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name smoke -- npm run smoke 2>&1) && for s in "SMOKE PASS" "✓ geometry.css resolver: all 108 nested cases (27 cells x 4 radius modes) resolve --control-height, --radius-control, --control-part-height and --control-part-inset" "✓ compound at product-md" "✓ compound at content-lg" "✓ control text at product-md" "✓ control text at content-lg"; do printf "%s\n" "$out" | grep -qF -- "$s" || exit 1; done && test -s smoke-out/compound-product-md.png && test -s smoke-out/compound-content-lg.png`
- (guard) `SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name corpus-reset -- npm run gate:corpus-reset`
- (guard) `rc=0; for g in corpus-tonal corpus-anchor sweep-prime corpus-contrast mode-isolation even-dips chroma-envelope; do if ! SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name "$g" -- npm run "gate:$g"; then echo "red leg: $g"; rc=1; fi; done; exit $rc`
- (red) `f=$(ls docs/reports/*-geometry-compound-insets.md) && for s in "## Command" "## Gates" "## Compound and control text" "## Follow-ups"; do grep -qx "$s" "$f" || exit 1; done && grep -qF 'smoke-out/compound-content-lg.png' "$f" && grep -qF 'Safari' "$f"`

## Assumptions
- The compound rule is the half law: the container pads `inset / 2`, the part is `height - inset` tall with `inset / 2` inline, and corners compose concentrically through the existing `radiusInset` and `radiusCard`. Verified by the user's words (handoff Goal 2), Maison's listbox, and `geometry.mjs:134-135` (`.sdlc/geometry-compound-insets/architect-L1.md`).
- The role names `--control-part-height` and `--control-part-inset` (kebab `part-height` and `part-inset`) follow the `--control-*` prefix contract (roles never prefixed, `geometry.mjs:191`). `group` would collide with `--inset-control-group`. Verified by the architect's read of `geometry.mjs:177`.
- `chipHeight > partHeight` on exactly micro-sm-sm, micro-sm-md and micro-md-sm, so the manifest's "chip never exceeds part on every cell" gate is false. Verified by dumping `geomScale({}).cells` (chip 12 against part 9.5, 11 and 11).
- `src/engine/ds-export.js:1544-1549` hand-copies the 14 fields as `DS_CELL_FIELDS`, and `test/engine/geometry.mjs:176` pins `378 size/ + 126 control/`. The architect missed both. Verified by `grep -rnoE "CELL_FIELDS|378"` and reading the lines.
- `test/ui/headless-boot.mjs:2822` pins `.tok-col` at 14. Verified by grep.
- The menu card change is value-neutral at the default kit (product-md-md inset 8, so partInset 4), and `mdCell` is in scope at the menu card. Verified by reading `ds-export.js:425-458`.
- No persist schema change and no `figma/` edit is needed. Verified by the architect (`persist.js:368-369`; grep over `figma/binder` and `code.js` is empty).
- 22 `btn(icon(...))` icon-only sites across 9 files share `btn()` (`app-helpers.mjs:401-415`), and no test asserts `ghost` on an icon button. Verified by grep over `src/ui` and `test/`.
- The palette Name input (`color.js:1667`) gets `input[type="text"]` at `styles.css:206`: `h()` sets attributes (`app-helpers.mjs:319-334`), and no overriding rule was found. The header doc-name input is overridden with literal radius and padding at `styles.css:416`. Verified by reading both rules and grepping `input` selectors in `styles.css`.
- `seg-sm` has two users, `color.js:2095,2107`. Verified by grep over `src/ui`.
- Control-text offenders at HEAD: `.app-header .docname`, `.pane-toggle`, `.map-raw-select/.map-raw-input`, `.chip` line-height, `.segmented`, `.figma-files`, `.radix-files` and their buttons, `.tyi-font-input`, and the three media paddings. Verified by a prototype scan of `styles.css`.
- `test/repo/citations.mjs` tolerates small shifts (NEAR rows pass), so only step 4 repairs cites. Verified by `node scripts/audit-citations.mjs --md` at HEAD.
- `headless-boot.mjs` runs in about 75 s and `categories.mjs` in about 4 s. `npm test` takes 167 to 268 s, and the sweeps took about 19 minutes under load. Verified by timing the two node tests, `.sdlc/baseline.md`, and `geometry-maison-ladder/planner-L3-6.md`.
- T-0025 is still `ready`, not merged, at plan time. Steps 3 to 5 depend on it per the handoff's Intent. Verified by `.sdlc/AGENTS.md` Stages.

## Risks
- The sweep guards on step 6 were not dry-run at plan time, because they take about 20 minutes. `baseline.md` and the last geometry plan record them green, and `steps.py split --only 6` runs them. A leg that goes red under host load is a `flaky-gates` triage, not a plan defect.
- T-0025 lands in `app.js`, `color.js` and `styles.css` before steps 3 to 5, so every `~:line` there is approximate. The builder locates each rule by selector or symbol.
- T-0026 may edit `test/figma/migrations.mjs`, which step 1 also edits (one line). A merge resolves it.
- `test/engine/exports.mjs:1879` parses the menu padding as an integer. A non-default kit with a fractional `partInset` (for example 4.5 at content-sm) would misparse, but only the default kit is tested.
- `white-space: nowrap` on every button can overflow a narrow segmented control (Settings) instead of wrapping. The smoke height check catches wrapping, not overflow.
- Scoping the injected roles to the host breaks any code that reads them off `document.documentElement`. Step 5 greps for that first.
- The user may want a different rule on the three micro cells where the chip is taller than the part, or Maison's segmented quarter after all. Either way it is one line in `buildCell` plus counts. The architect lists this as a risk, and ADR-033 records the choice.
- The palette Name defect may be Safari-only. Smoke proves the computed style in Chrome only, and the report says so.
