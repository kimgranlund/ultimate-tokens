## Task goal
User request 2026-10-08, with two screenshots (a segmented control, "Mode | Single", whose container has a visible inner padding around the active segment; and the Color left-pane header where the "toggle left pane" icon button is a bordered circle next to the "ANALYSIS Neutral" title):

1. The palette name input is not styled (find it: the palette inspector's name field in `src/ui/sections/color.js`; it should take the shell's input look: `--sh-control-height`, inset, text, radius, border like the other inputs in `src/ui/styles.css`).
2. A system for compound insets, for components that contain repeated parts such as a listbox (options) and a segmented control (segments). The user's rule, in their words: "I usually take half of the composed component and remove it (segment or button/option/trigger/etc) and give it to the container so the net effect and alignment is held. This also needs to be factored in to how radius composes." Interpretation to confirm in the design: the container gets padding equal to half of the child's inset, and the child's own inset shrinks by the same amount, so the child's content stays where it would be without the container and the outer size is unchanged; and the container's radius composes as the child's radius plus that container padding (concentric corners), so the child's rounded corner stays concentric with the container's. Express this in the geometry engine as per-cell fields or derived roles (names consistent with the existing `--control-*`, `--chip-*`, `--radius-*` roles and the prefix contract), emitted through CSS, DTCG, Figma, MCP and the consumer skills the same way as the other roles, and used by the app shell's `.segmented` rule (`src/ui/styles.css`) and any listbox or menu component in the shell.
3. Icon buttons should be square when all inset and icon/glyph container sizes add up (width = height = control height; icon box centered), borderless and ghost (no border, transparent until hover/active). Apply to the shell's icon-only buttons (the left-pane toggle in the header, and other icon-only buttons found with a repo search).

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

## Notes
Step 3 verifier finding, folded in by the conductor: at viewport width up to 1240px, `.app-header button, .canvas-header button { padding: 4px 7px; }` (`src/ui/styles.css` ~:1579 at step 3's HEAD) has the same specificity as `button.icon-only` and comes later, so header icon buttons get their padding back, and the same rule gives `.canvas-seg button` padding-block 4px, which can grow a segment past the part height. Fix it in this step with the smallest change that keeps `button.icon-only` and the compound part sizing winning inside that media query (for example raise `button.icon-only` specificity or move the part sizing rules after it), keep the existing `(cpd)` tests green, and add one `(cpd)` assertion on the real `styles.css` text for the media-query case with a negative control. Also repair every stale citation that step 3 shifted (`node scripts/audit-citations.mjs` for the corrected homes) so `node test/repo/citations.mjs` is green; step 3 left it red on purpose.
