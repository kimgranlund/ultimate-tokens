## Task goal
The editor shell is one standardized UI: a single text-role system, one inset and radius composition rule for every container, one anatomy table for every control, one glyph motion set, all derived from the Maison ladder cell, with the shell defaulting to the product tier, sm scale, md size.

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
