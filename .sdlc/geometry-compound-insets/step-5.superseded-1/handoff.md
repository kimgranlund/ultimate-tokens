## Task goal
User request 2026-10-08, with two screenshots (a segmented control, "Mode | Single", whose container has a visible inner padding around the active segment; and the Color left-pane header where the "toggle left pane" icon button is a bordered circle next to the "ANALYSIS Neutral" title):

1. The palette name input is not styled (find it: the palette inspector's name field in `src/ui/sections/color.js`; it should take the shell's input look: `--sh-control-height`, inset, text, radius, border like the other inputs in `src/ui/styles.css`).
2. A system for compound insets, for components that contain repeated parts such as a listbox (options) and a segmented control (segments). The user's rule, in their words: "I usually take half of the composed component and remove it (segment or button/option/trigger/etc) and give it to the container so the net effect and alignment is held. This also needs to be factored in to how radius composes." Interpretation to confirm in the design: the container gets padding equal to half of the child's inset, and the child's own inset shrinks by the same amount, so the child's content stays where it would be without the container and the outer size is unchanged; and the container's radius composes as the child's radius plus that container padding (concentric corners), so the child's rounded corner stays concentric with the container's. Express this in the geometry engine as per-cell fields or derived roles (names consistent with the existing `--control-*`, `--chip-*`, `--radius-*` roles and the prefix contract), emitted through CSS, DTCG, Figma, MCP and the consumer skills the same way as the other roles, and used by the app shell's `.segmented` rule (`src/ui/styles.css`) and any listbox or menu component in the shell.
3. Icon buttons should be square when all inset and icon/glyph container sizes add up (width = height = control height; icon box centered), borderless and ghost (no border, transparent until hover/active). Apply to the shell's icon-only buttons (the left-pane toggle in the header, and other icon-only buttons found with a repo search).

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
