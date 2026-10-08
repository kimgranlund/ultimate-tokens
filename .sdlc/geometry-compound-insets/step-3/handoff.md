## Task goal
User request 2026-10-08, with two screenshots (a segmented control, "Mode | Single", whose container has a visible inner padding around the active segment; and the Color left-pane header where the "toggle left pane" icon button is a bordered circle next to the "ANALYSIS Neutral" title):

1. The palette name input is not styled (find it: the palette inspector's name field in `src/ui/sections/color.js`; it should take the shell's input look: `--sh-control-height`, inset, text, radius, border like the other inputs in `src/ui/styles.css`).
2. A system for compound insets, for components that contain repeated parts such as a listbox (options) and a segmented control (segments). The user's rule, in their words: "I usually take half of the composed component and remove it (segment or button/option/trigger/etc) and give it to the container so the net effect and alignment is held. This also needs to be factored in to how radius composes." Interpretation to confirm in the design: the container gets padding equal to half of the child's inset, and the child's own inset shrinks by the same amount, so the child's content stays where it would be without the container and the outer size is unchanged; and the container's radius composes as the child's radius plus that container padding (concentric corners), so the child's rounded corner stays concentric with the container's. Express this in the geometry engine as per-cell fields or derived roles (names consistent with the existing `--control-*`, `--chip-*`, `--radius-*` roles and the prefix contract), emitted through CSS, DTCG, Figma, MCP and the consumer skills the same way as the other roles, and used by the app shell's `.segmented` rule (`src/ui/styles.css`) and any listbox or menu component in the shell.
3. Icon buttons should be square when all inset and icon/glyph container sizes add up (width = height = control height; icon box centered), borderless and ghost (no border, transparent until hover/active). Apply to the shell's icon-only buttons (the left-pane toggle in the header, and other icon-only buttons found with a repo search).

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
