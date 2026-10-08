## Task goal
User request 2026-10-08, with two screenshots (a segmented control, "Mode | Single", whose container has a visible inner padding around the active segment; and the Color left-pane header where the "toggle left pane" icon button is a bordered circle next to the "ANALYSIS Neutral" title):

1. The palette name input is not styled (find it: the palette inspector's name field in `src/ui/sections/color.js`; it should take the shell's input look: `--sh-control-height`, inset, text, radius, border like the other inputs in `src/ui/styles.css`).
2. A system for compound insets, for components that contain repeated parts such as a listbox (options) and a segmented control (segments). The user's rule, in their words: "I usually take half of the composed component and remove it (segment or button/option/trigger/etc) and give it to the container so the net effect and alignment is held. This also needs to be factored in to how radius composes." Interpretation to confirm in the design: the container gets padding equal to half of the child's inset, and the child's own inset shrinks by the same amount, so the child's content stays where it would be without the container and the outer size is unchanged; and the container's radius composes as the child's radius plus that container padding (concentric corners), so the child's rounded corner stays concentric with the container's. Express this in the geometry engine as per-cell fields or derived roles (names consistent with the existing `--control-*`, `--chip-*`, `--radius-*` roles and the prefix contract), emitted through CSS, DTCG, Figma, MCP and the consumer skills the same way as the other roles, and used by the app shell's `.segmented` rule (`src/ui/styles.css`) and any listbox or menu component in the shell.
3. Icon buttons should be square when all inset and icon/glyph container sizes add up (width = height = control height; icon box centered), borderless and ghost (no border, transparent until hover/active). Apply to the shell's icon-only buttons (the left-pane toggle in the header, and other icon-only buttons found with a repo search).

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
