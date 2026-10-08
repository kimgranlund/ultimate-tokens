## Task goal
User request 2026-10-08, with two screenshots (a segmented control, "Mode | Single", whose container has a visible inner padding around the active segment; and the Color left-pane header where the "toggle left pane" icon button is a bordered circle next to the "ANALYSIS Neutral" title):

1. The palette name input is not styled (find it: the palette inspector's name field in `src/ui/sections/color.js`; it should take the shell's input look: `--sh-control-height`, inset, text, radius, border like the other inputs in `src/ui/styles.css`).
2. A system for compound insets, for components that contain repeated parts such as a listbox (options) and a segmented control (segments). The user's rule, in their words: "I usually take half of the composed component and remove it (segment or button/option/trigger/etc) and give it to the container so the net effect and alignment is held. This also needs to be factored in to how radius composes." Interpretation to confirm in the design: the container gets padding equal to half of the child's inset, and the child's own inset shrinks by the same amount, so the child's content stays where it would be without the container and the outer size is unchanged; and the container's radius composes as the child's radius plus that container padding (concentric corners), so the child's rounded corner stays concentric with the container's. Express this in the geometry engine as per-cell fields or derived roles (names consistent with the existing `--control-*`, `--chip-*`, `--radius-*` roles and the prefix contract), emitted through CSS, DTCG, Figma, MCP and the consumer skills the same way as the other roles, and used by the app shell's `.segmented` rule (`src/ui/styles.css`) and any listbox or menu component in the shell.
3. Icon buttons should be square when all inset and icon/glyph container sizes add up (width = height = control height; icon box centered), borderless and ghost (no border, transparent until hover/active). Apply to the shell's icon-only buttons (the left-pane toggle in the header, and other icon-only buttons found with a repo search).

## Step 5: PR #813 shell review follow-ups: icon sizes, host-scoped geometry roles, breakpoint root, categories leg
level: L3
### Read first
- `docs/AGENTS.md`
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
### Do
Depends on: step 4, and T-0025 merged (`.sdlc/notes.md:25` holds these items until it lands).

Replan. Items 1 to 3 are already built, green, and left uncommitted in the tree, together with the first build's citation repair and the regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` (`.sdlc/geometry-compound-insets/step-5/builder-L3.md`, Changes and Checks). Keep that work and change it only where items 4 and 5 say so. Item 4 is rewritten by the conductor's direction (handoff `## Plan review`, option b: a synthetic fixture, the corpus count reported, not asserted). Item 5 is new: it is a contract dependent of item 2's keyed style id, so it lands in this step.
1. (built) Major 2, `src/ui/icons.js` `icon()` (~:44-56):
   - When `opts` has its own `size` key, the svg carries only `width="${size}" height="${size}"` and no inline style. A caller's explicit size then holds, and a stylesheet rule (the geometry specimen's `.geom-ex-caret svg { width: 100% }`) can still size it.
   - Without `size`, the svg keeps `style="width:var(--sh-control-icon, 16px);height:var(--sh-control-icon, 16px)"`.
   - Headless group `(ics)`, at least 2 assertions:
     - (ics1) `icon("x")`'s svg style holds `var(--sh-control-icon, 16px)`.
     - (ics2) `icon("x", { size: 13 })`'s svg has `width="13"` and no `--sh-control-icon` in any style.
   - Fix the `(geo-row)` assertion to read the svg, not the span.
2. (built) Major 3, `_applyShellGeometry` (`app.js` ~:2400-2420): scope the injected CSS to its own host.
   - Each instance gets a key from the module counter `geomHostSeq`, assigned once in the constructor as `this._geomKey` and stamped as `this.dataset.utGeom` in `_applyShellGeometry`. The stamp is at render, not in the constructor, because a custom-element constructor must not add attributes (`document.createElement("ultimate-tokens")` throws `NotSupportedError`; builder Notes). Keep that built shape.
   - The style element id is `ut-geometry-roles-<key>`.
   - The helper `scopeGeomCSS(css, key)` rewrites the generated text before it is set:
     - Both `:root {` and `:where(:root) {` become `:where(ultimate-tokens[data-ut-geom="<key>"]) {`.
     - `:where([data-A="V"]) {` becomes `:where(ultimate-tokens[data-ut-geom="<key>"][data-A="V"], ultimate-tokens[data-ut-geom="<key>"] [data-A="V"]) {`.
     - `:where(*, :host) {` becomes `:where(ultimate-tokens[data-ut-geom="<key>"], ultimate-tokens[data-ut-geom="<key>"] *) {`.
   - The engine's exported CSS does not change.
   - The first build's `git grep -nE "documentElement.*--(control|size|chip|radius)-"` over `src/ui` found no reader to move.
   - `test/ui/headless-boot.mjs` `(shg4)` reads the keyed id, plus:
     - (shg5) the style text has no `:root {`, no `:where(:root)` and no `:where(*, :host)`, and every block selector names `data-ut-geom`.
     - (shg6) a second instance gets a different key and its own style element.
3. (built) Minor 6, `src/engine/geometry.mjs` `geomTokensBreakpointCSS`: both branches emit `:where(:root) {` instead of `:root {`. The regexes in `test/engine/geometry.mjs` match. `plugin/ultimate-tokens/skills/geometry-tokens/references/responsive.md` names `:where(:root)`. `docs/references/geometry/README.md` has no breakpoint example, so it is unchanged.
4. Minor 7, `test/engine/categories.mjs`, rewritten:
   - Keep the built main-loop leg (~:266-282). It checks that the four v9 keys a spec sets survive hydrate and that `"ramp" in doc.geometry` is false. It never runs on today's corpus: no volume palette in `docs/reference/colors/categories/*.json` carries `geometry` (a walk found 0; Adia's `{ramp:"linear4"}` left in e084b9f0, #813). No corpus content changes.
   - Count it: declare `let geomSpecCount = 0;` before the `for (const slug of CATS)` loop and add `geomSpecCount++;` as the first line inside `if (sg) {`.
   - New standalone block `(geometry-discriminate)`, placed after the `(curve-validate)` block and before `(g)`. It runs the real `buildCategory()` and `hydrate()` on a synthetic doc, as `(groups-discriminate)` and `(curve-discriminate)` do.
     - The fixture builder is a local `makeGeometryDoc = (geometry) => ({ ... })` copied from `makeCurveDoc`'s shape, with slug `synthetic-geometry-fixture`, and `...(geometry ? { geometry } : {})` on the volume palette entry (the object holding `kicker` and `title`). That is where the generator reads it (`scripts/gen-categories.mjs` `buildCategory`, `const geomCfg = p.geometry ...`), the same level as `lmin`. `makeDirectDoc` does not fit: it spreads into the inner palette.
     - Import `DEFAULT_GEOMETRY` and `geomScale` from `../../src/engine/geometry.mjs`.
     - Every assertion fails under the existing gate name `geometry`, so `DECLARED` does not change (`(groups-discriminate)` fails under `groups` the same way).
     - Pass-through: `buildCategory(makeGeometryDoc({ tier: "content", scale: "lg", radius: "pill", spaceBase: 6 })).presets[0].geometry` deep-equals that object, and the preset built with `makeGeometryDoc(null)` has no `geometry` key.
     - Hydrate: the first preset's `hydrate(...).geometry` deep-equals `{ tier: "content", scale: "lg", radius: "pill", spaceBase: 6 }`, and the second's deep-equals `DEFAULT_GEOMETRY`.
     - Discriminating leg: `geomScale(doc.geometry).cell.height` is 64 for the first doc and 32 for the second, and the two differ. A pass-through that dropped the object would read 32 for both.
     - Retired key: `hydrate(buildCategory(makeGeometryDoc({ tier: "content", ramp: "linear4" })).presets[0]).geometry` has no `ramp` key and keeps `tier` `"content"`. Hydrate prints one `[persist] dropped unknown geometry key "ramp"` warning for it; that is expected.
   - After the block, when no `geometry` failure was recorded (`!fails.some((f) => f.startsWith("geometry:"))`, the `(ramp-monotone: ...)` pattern; `FAIL` keeps one entry per gate), print exactly ``console.log(`  (geometry: ${geomSpecCount} corpus palettes carry a spec geometry; the (geometry-discriminate) fixture proves the pass-through)`)``. The count is reported, never asserted.
   - The header comment (lines 1-10) names `(geometry-discriminate)` beside `(groups-discriminate)`.
   - The stale `ramp` comments in `scripts/gen-categories.mjs` are already reworded (built).
   - Leave `figma/binder/mode-apply-plan.mjs:250`, because it is a T-0026 file. Step 6 records it under the report's Follow-ups.
5. Contract dependent of item 2: `.claude/skills/building-editor-sections/SKILL.md`, the "One head style" bullet (~:101-103), still says `<style id="ut-geometry-roles">` holding the CSS unprefixed. Rewrite the bullet to say:
   - `this._geomRolesStyle` is a `<style id="ut-geometry-roles-<key>">` in `document.head`, where `<key>` is the host's `data-ut-geom` (the module counter `geomHostSeq`, kept as `this._geomKey` from the constructor, stamped at render).
   - It holds `geomTokensSizesCSS(sc) + geomResolverCSS(sc)` passed through `scopeGeomCSS`, which scopes `:root`, `:where(:root)`, `:where([data-A="V"])` and `:where(*, :host)` to `ultimate-tokens[data-ut-geom="<key>"]`, so two hosts on one page never share roles.
   - Keep the rest of the bullet: held on the instance, never looked up by id (the shim's `getElementById` returns null), removed on disconnect.
   - The same file carries a `test/repo/citations.mjs` fact pin (the needle `` `deleteTypeMode`/`deleteGeomMode` ``). Leave that text as it is.
6. Citations (built): the new constructor and helper shifted `src/ui/app.js`, and the first build moved 93 `app.js:N` cites in `docs/specs/app-shell.md`, `docs/references/component-inventory.md` and the five `docs/reports/2026-08-20-reactivity/0*.md` files by number. Items 4 and 5 touch no cited file. If any edit moves `app.js` again, re-run `node scripts/audit-citations.mjs --md` and repair by number.
7. Run `node test/engine/categories.mjs`, `node test/ui/headless-boot.mjs`, `node test/engine/geometry.mjs` and `node test/repo/citations.mjs`. The full `npm test` is step 6's gate; the first build already ran it green on items 1 to 3.
### Acceptance criteria
- `node test/ui/headless-boot.mjs && test "$(grep -c '(ics' test/ui/headless-boot.mjs)" -ge 2 && ! grep -qF 'style="width:var(--sh-control-icon, ${size}px)' src/ui/icons.js`
- `grep -qF 'data-ut-geom' src/ui/app.js && test "$(grep -c 'data-ut-geom' test/ui/headless-boot.mjs)" -ge 2 && ! grep -qF 'el.id = "ut-geometry-roles";' src/ui/app.js`
- `node --input-type=module -e 'import * as G from "./src/engine/geometry.mjs"; const f = G.geomTokensBreakpointCSS([{ name: "Mobile", minWidth: 476, scale: G.geomScale({ scale: "sm" }) }, { name: "Desktop Xl", minWidth: 1440, scale: G.geomScale({ scale: "lg" }) }]); process.exit(f.length === 2 && f.every((m) => m.css.includes(":where(:root) {") && !/(^|[^(]):root \{/m.test(m.css)) ? 0 : 1)' && node test/engine/geometry.mjs`
- (red) `out=$(node test/engine/categories.mjs) && printf '%s\n' "$out" | grep -qE '^  \(geometry: [0-9]+ corpus palettes carry a spec geometry; the \(geometry-discriminate\) fixture proves the pass-through\)$' && grep -qF 'synthetic-geometry-fixture' test/engine/categories.mjs && grep -qF '.cell.height' test/engine/categories.mjs && ! grep -qF 'doc.geometry.ramp' test/engine/categories.mjs`
- (red) `grep -qF 'ut-geometry-roles-' .claude/skills/building-editor-sections/SKILL.md && grep -qF 'data-ut-geom' .claude/skills/building-editor-sections/SKILL.md && grep -qF 'scopeGeomCSS' .claude/skills/building-editor-sections/SKILL.md && ! grep -qF 'id="ut-geometry-roles"' .claude/skills/building-editor-sections/SKILL.md`
- (guard) `node test/repo/citations.mjs`
