# Handoff U1 pass 2 · builder → reviewer, verifier

| Field | Value |
|---|---|
| Branch | unit/dr-U1 @ 4201a242 |
| Base | 5d8b1c30 (unit base), B 282fca8d |
| Files | docs/reference/references/ui-plan.md (commit A, 8f5153eb: lines 42 to 45, the Color and Geometry rows of the section table); merge 4201a242 (plan/docs-repair @ 1e263b2f, revision 12, for P8; `.sdlc/plans` only); this handoff (commit B, then the P8 commit) |
| Brief | `.sdlc/plans/docs-repair-U1-rediagnosis.md` §2 on plan/docs-repair at 7cba788a; criteria the U1 rows of `.sdlc/plans/docs-repair.md` at 7cba788a |
| Ran | the `~~~sh ran` block below at 4201a242 (the Branch sha), its output pasted unedited as `~~~out ran`; the Ran table figures were measured at 8f5153eb and reproduce at 4201a242 (the merge touches `.sdlc/plans` only), except P3's file count, `741` at 4201a242. Before that, every row below at 8f5153eb: U1 and P rows in `.worktrees/dr-U1` and in a `--shared` clone checked out at 8f5153eb (`git rev-parse --short HEAD` printed `8f5153eb`); `npm test` once in `.worktrees/dr-U1` at 8f5153eb |
| Left out | no build, no smoke (no `node_modules`; P2 owed at pre-land, U1 touches no bundled file). The negative controls of U1-5, U1-7 and U1-8 were run in the clone, never in the worktree; their output is in the Ran table. The `src/ui/app.js:1433` to `:1439` comments are untouched (outside the wall, the re-diagnosis §4 routes them to a `/file-task` chore) |

Read first: U1-7 and U1-8.

## Fixes (verdict pass 1 at 597b4fba)

| Finding | Fix | Code read (never a comment) |
|---|---|---|
| F1 `ui-plan.md:42` said the Typography and Geometry scenes `do not pan or zoom` | now: reset to `fit` on entry, pan and zoom like Color's through the same `wirePanZoom` shell; only the Tokens tables, like Color's Mapping table, scroll | `app.js:1439` code part `if (id !== "color") this.fit();`; `this.wirePanZoom(area)` at `typography.js:351`, `:370`, `geometry.js:423`, `:442`; the Tokens views return `this._tokensTableArea(` at `typography.js:341`, `geometry.js:413`, whose shell is `" is-table"` at `app.js:1759` with no pan wiring; Color's call sits under `if (!isTable) {` at `color.js:882` |
| F2 handoff Branch named one head, figures measured at another | this handoff: Branch names commit A (8f5153eb), every Ran figure measured there, the Claims ledger added | P7 below |
| F3 U1-5's control never bit | planner's, applied at 7cba788a; the fixed control's run is in the Ran table | |
| F4 Color row `(and skips the Mapping table)`; Geometry row missing the mode guard | Color: `except in the Mapping view, whose table already shows both modes and renders once`; Geometry: `compare labeled All when at least one mode exists` | `color.js:870` `&& !isTable) return this.renderCompareArea(view)`; `geometry.js:225` `...(modes.length ? [{ id: "compare", label: "All"` |

## Ran

| Id | Output at 8f5153eb | Negative control (clone) |
|---|---|---|
| U1-1 | `1`, `1`, Color `4`, Typography `8`, Geometry `8` | not rerun (unchanged row; verdict pass 1 ran it) |
| U1-2 | doc: specimen `3`, typeSpecMode `1`, geomMode `1`, compare `3`, renderCompareArea `1`, renderTypeInspector `1`, renderGeomInspector `1`, radius `2`; source `2`, `3`, `36`, `1`, `3`, `2`, `1`, `1` | not rerun |
| U1-3 | gallery `11`, `CATEGORY_INDEX\|categor` `3`, `CATEGORY_INDEX` in app.js `4` | not rerun |
| U1-4 | `0`, `2`, `1` | not rerun |
| U1-5 | audit leg `0` and cite grep `0`: the file carries no `file:line` cite, so the audit does not discover it (the second branch of the row) | the anchored `src/ui/app.js:1` cite appended: `    STALE 1 \| NEAR 0 \| UNDECIDABLE 0 \| OK 0 \| NOFILE 0  (line counts, deduped)`, `✗ 1 citation gate failure(s)`, `exit 1`; after `git checkout -- docs/reference/references/ui-plan.md` the status count is `0` |
| U1-6 | `0`, `0`, `271` lines | not rerun |
| U1-7 | `0`, `2`, `2`, `1` | the file at 597b4fba: `1`, `2`, `2`, `0` |
| U1-8 | no `NO-LEDGER`; `100` rows; `0` failing (`claims.out`: every line starts `1 `) | (a) the handoff at 597b4fba: `NO-LEDGER`, `0`, `0`. (b) the four-row fixture: `4`, `2`, `claims.out` failing lines `0 absent src/ui/sections/typography.js wirePanZoom` and `0 present src/ui/app.js:1439 pan/zoom` |
| P1 | `npm test` in `.worktrees/dr-U1`: `✓ all 50 test files passed`, exit 0, 3m58s wall at load about 17; tree after: `0` (`git status --short \| wc -l`) | not rerun |
| P3 | `branding: clean (739 files scanned)`; U1's own added lines carrying U+2014 (diff from 5d8b1c30, every U1 file): `0`. The plan-wide raw count from `$B` excluding handoffs reads `2`, both in U3 records (`.sdlc/reviews/docs-repair-U3-progress.md`, `.sdlc/verdicts/docs-repair-U3-review.md`), none in U1's diff | not rerun |
| em dash | `test/repo/em-dash.mjs` is not on this branch (it landed on main in 37b04676 and 347e7103, after B). `ui-plan.md` keeps 27 U+2014 lines from Revision A that U1 did not touch; main swept them to `0`. A trial merge of origin/main in the clone: `ui-plan.md` conflicts on one hunk only, the title line (U1 `# Ultimate Tokens: UI Plan`, main `# HCT Palette Generator: UI Plan`), and reads `0` U+2014 with that hunk resolved either way. U1 adds none | |
| P4 | `0`, `0`, `0`, `0` | not rerun |
| P5 | `1`, `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 8f5153eb)`, `exit 0` | not rerun |
| P6 | `10` (U2's files), `10` | not rerun |
| P7 | `H=4201a242`, `ancestor`, `0` (at the P8 commit) | |

## Ran block (P8)

Generated from the plan's U1-1 to U1-8 cells at 1e263b2f and run with `bash` at 4201a242 in `.worktrees/dr-U1`. Two choices the verifier should see. The `\|` in U1-3, U1-4 and U1-8 stays: there it is a regex escape (BRE alternation in U1-3 and U1-4, a literal pipe in U1-8's `^\| `), and removing it changes what the rows count. Line 2 sets `F`, the scratch dir U1-8 writes to, since `bash "$F/ran.sh"` does not inherit an unexported `F`.

~~~sh ran
git rev-parse --short=8 HEAD
F=$(mktemp -d)  # scratch dir for U1-8, which writes $F/claims and $F/claims.out
# U1-1
grep -c '^## Revision B' docs/reference/references/ui-plan.md; grep -c 'this.section' docs/reference/references/ui-plan.md; for s in Color Typography Geometry; do grep -c "$s" docs/reference/references/ui-plan.md; done
# U1-2
for n in specimen typeSpecMode geomMode compare renderCompareArea renderTypeInspector renderGeomInspector radius; do printf '%s ' "$n"; grep -c "$n" docs/reference/references/ui-plan.md; done; grep -c 'id: "specimen"' src/ui/sections/typography.js; grep -c 'typeSpecMode' src/ui/sections/typography.js; grep -c 'geomMode' src/ui/sections/geometry.js; grep -c 'id: "compare"' src/ui/sections/geometry.js; grep -c 'renderCompareArea' src/ui/sections/color.js; grep -c 'renderTypeInspector' src/ui/sections/typography.js; grep -c 'renderGeomInspector' src/ui/sections/geometry.js; grep -c 'id: "radius"' src/ui/sections/geometry.js
# U1-3
grep -c -i 'gallery' docs/reference/references/ui-plan.md; grep -c 'CATEGORY_INDEX\|categor' docs/reference/references/ui-plan.md; grep -c 'CATEGORY_INDEX' src/ui/app.js
# U1-4
grep -c '5 formats\|5 format tabs' docs/reference/references/ui-plan.md; grep -c 'docs/lld/app-shell.md' docs/reference/references/ui-plan.md; grep -c 'building-editor-sections' docs/reference/references/ui-plan.md
# U1-5
node scripts/audit-citations.mjs | grep -A3 '=== docs/reference/references/ui-plan.md' | grep -c 'STALE 0'; grep -c -E '[a-z-]+\.(js|mjs):[0-9]+' docs/reference/references/ui-plan.md
# U1-6
grep -c 'Flip to' docs/reference/references/ui-plan.md; grep -c 'scrollport' docs/reference/references/ui-plan.md; wc -l < docs/reference/references/ui-plan.md
# U1-7
grep -c -i -E 'do(es)? not pan|don.t pan|no pan|cannot pan' docs/reference/references/ui-plan.md; for f in typography geometry; do grep -c 'this\.wirePanZoom(area)' src/ui/sections/$f.js; done; grep -c 'wirePanZoom' docs/reference/references/ui-plan.md
# U1-8
awk '/^## Claims/,0' .sdlc/handoffs/docs-repair-U1.md | grep -E '^\| ' | grep -v -E '^\| (Claim|---)' > "$F/claims"; [ -s "$F/claims" ] || echo NO-LEDGER; wc -l < "$F/claims" | tr -d ' '; while IFS='|' read -r _ claim needle anchor kind _; do n=$(printf '%s' "$needle" | sed 's/^ *\x60//; s/\x60 *$//'); a=$(printf '%s' "$anchor" | sed 's/\x60//g; s/ //g'); k=$(printf '%s' "$kind" | tr -d ' '); f=${a%%:*}; l=${a##*:}; case "$k" in present) c=$(sed -n "${l}p" "$f" | sed 's://.*$::' | grep -c -F -- "$n");; absent) c=$(grep -v -E '^[[:space:]]*//' "$f" | sed 's://.*$::' | grep -c -F -- "$n"); c=$([ "$c" = 0 ] && echo 1 || echo 0);; *) c=0;; esac; echo "$c $k $a $n"; done < "$F/claims" | tee "$F/claims.out" | grep -c '^0 '
# P3
tail -1 <(node test/repo/branding.mjs)
~~~

~~~out ran
4201a242
1
1
4
8
8
specimen 3
typeSpecMode 1
geomMode 1
compare 3
renderCompareArea 1
renderTypeInspector 1
renderGeomInspector 1
radius 2
2
3
36
1
3
2
1
1
11
3
4
0
2
1
0
0
0
0
     271
0
2
2
1
100
0
branding: clean (741 files scanned)
~~~

## Claims

Every behaviour sentence of Revision B (`ui-plan.md` lines 32 to 69 at 8f5153eb) and tasks T8, T10 to T13, one row per anchor. `Kind` is `present` (the anchor line's code part, `//` comment stripped, carries the needle) or `absent` (the file, comments stripped, carries no needle; the anchor is the bare path). No anchor is a comment line; the five sentences pass 1 had on comments (C2, C10, C13, C27, C29) are re-anchored on code. `C` ids follow the re-diagnosis §2.2.

| Claim | Needle | Anchor | Kind |
|---|---|---|---|
| C1 one document, Geometry composes from Type | `export function geometryScale` | `src/ui/model.mjs:53` | present |
| C1 Geometry's scale is built from the Type scale | `typeScale: typeScale(tcfg)` | `src/ui/model.mjs:57` | present |
| C2 `this.section` routes `renderCenter` (typography) | `this.section === "typography"` | `src/ui/app.js:1643` | present |
| C2 `this.section` routes `renderCenter` (geometry) | `this.section === "geometry"` | `src/ui/app.js:1649` | present |
| C2 `this.section` takes `color` | `this.section === "color"` | `src/ui/app.js:1536` | present |
| C3 the left pane branches on the section | `renderLeftPane(view) {` | `src/ui/app.js:1531` | present |
| C3 the left pane reads `this.section` | `this.section === "typography" ? this.typeAnalysisCards(view)` | `src/ui/app.js:1540` | present |
| C3 the right pane branches on the section | `renderRightPane(view) {` | `src/ui/app.js:1927` | present |
| C3 the right pane reads `this.section` | `if (this.section === "typography") return this.renderTypeInspector(view);` | `src/ui/app.js:1930` | present |
| C4 `setSection` stashes the Color viewport on leave | `this._colorViewport = this.viewport` | `src/ui/app.js:1437` | present |
| C4 and restores it on return | `this.viewport = this._colorViewport` | `src/ui/app.js:1440` | present |
| C5 Typography and Geometry are reset to fit on entry | `if (id !== "color") this.fit();` | `src/ui/app.js:1439` | present |
| C5 `fit` is the viewport reset | `fit() {` | `src/ui/app.js:543` | present |
| C6 the Typography specimen pans and zooms | `this.wirePanZoom(area)` | `src/ui/sections/typography.js:351` | present |
| C6 the Typography Compare view pans and zooms | `this.wirePanZoom(area)` | `src/ui/sections/typography.js:370` | present |
| C6 the Geometry controls pan and zoom | `this.wirePanZoom(area)` | `src/ui/sections/geometry.js:423` | present |
| C6 the Geometry Compare view pans and zooms | `this.wirePanZoom(area)` | `src/ui/sections/geometry.js:442` | present |
| C6 the Typography header carries zoom controls | `this.zoomBy(1)` | `src/ui/sections/typography.js:327` | present |
| C6 the Geometry header carries zoom controls | `this.zoomBy(1)` | `src/ui/sections/geometry.js:400` | present |
| C6 the Typography Tokens table uses the table shell | `return this._tokensTableArea(` | `src/ui/sections/typography.js:341` | present |
| C6 the Geometry Tokens table uses the table shell | `return this._tokensTableArea(` | `src/ui/sections/geometry.js:413` | present |
| C6 the Tokens table shell is the scrolling `is-table` area | `" is-table"` | `src/ui/app.js:1759` | present |
| C6 Color's Mapping table is not wired for pan and zoom | `if (!isTable) {` | `src/ui/sections/color.js:882` | present |
| C7 Typography: canvas header then canvas | `this.renderTypeCanvasHeader()` | `src/ui/app.js:1645` | present |
| C7 Typography scene | `this.renderTypeCanvas(view)` | `src/ui/app.js:1646` | present |
| C7 Geometry: canvas header then canvas | `this.renderGeomCanvasHeader()` | `src/ui/app.js:1651` | present |
| C7 Geometry scene | `this.renderGeomCanvas(view)` | `src/ui/app.js:1652` | present |
| C8 `canvasView` Palettes | `id: "palettes"` | `src/ui/sections/color.js:816` | present |
| C8 `canvasView` Scrims | `id: "scrims"` | `src/ui/sections/color.js:817` | present |
| C8 `canvasView` Mapping | `id: "mapping"` | `src/ui/sections/color.js:818` | present |
| C8 `canvasView` Radix | `id: "radix"` | `src/ui/sections/color.js:819` | present |
| C9 Mapping is the table view | `const isTable = this.canvasView === "mapping"` | `src/ui/sections/color.js:867` | present |
| C10 `colorMode` `light` | `this.colorMode === "light"` | `src/ui/app.js:1520` | present |
| C10 `colorMode` `dark` | `this.colorMode === "dark"` | `src/ui/app.js:1520` | present |
| C10 `colorMode` `system` | `this.colorMode === "system"` | `src/ui/app.js:1521` | present |
| C10 `colorMode` `both` | `this.colorMode === "both"` | `src/ui/app.js:1522` | present |
| C11 `both` renders through `renderCompareArea` | `return this.renderCompareArea(view)` | `src/ui/sections/color.js:870` | present |
| C11 the compare area | `renderCompareArea(view) {` | `src/ui/sections/color.js:936` | present |
| C11 side by side: the light column | `this._compareColumn(view, "light")` | `src/ui/sections/color.js:941` | present |
| C11 side by side: the dark column | `this._compareColumn(view, "dark")` | `src/ui/sections/color.js:942` | present |
| C12 except in the Mapping view, which renders once | `&& !isTable) return this.renderCompareArea(view)` | `src/ui/sections/color.js:870` | present |
| C13 inspector tabs palette, global, roles | `{ id: "palette", label: "Palette" }, { id: "global", label: "Global" }, { id: "roles", label: "Roles" }` | `src/ui/app.js:1939` | present |
| C13 a story tab when the document carries a story | `if (hasStory) tabs.push({ id: "story"` | `src/ui/app.js:1940` | present |
| C13 the story is the document's curated story | `const hasStory = !!view.story` | `src/ui/app.js:1932` | present |
| C13 `view.story` comes from the document | `story: doc.story` | `src/ui/model.mjs:1111` | present |
| C14 `typeSpecMode` `specimen` | `id: "specimen"` | `src/ui/sections/typography.js:310` | present |
| C14 `typeSpecMode` `tokens` | `id: "tokens"` | `src/ui/sections/typography.js:311` | present |
| C15 Typography `compare` labeled All when a mode exists | `...(modes.length ? [{ id: "compare", label: "All"` | `src/ui/sections/typography.js:172` | present |
| C16 `typeSegment` scale, fonts, specimen | `{ id: "scale", label: "Scale" }, { id: "fonts", label: "Fonts" }, { id: "specimen", label: "Specimen" }` | `src/ui/sections/typography.js:607` | present |
| C16 in `renderTypeInspector` | `renderTypeInspector(view) {` | `src/ui/sections/typography.js:602` | present |
| C16 the tab sets `typeSegment` | `this.typeSegment = id` | `src/ui/sections/typography.js:613` | present |
| C17 the specimen loads the real faces | `ensureTypeFonts()` | `src/ui/sections/typography.js:603` | present |
| C17 each specimen step is styled in its face | `font-family:'${fam}', ${generic};font-size:${s.size}px` | `src/ui/sections/typography.js:555` | present |
| C18 `geomSpecMode` `controls` | `id: "controls"` | `src/ui/sections/geometry.js:383` | present |
| C18 `geomSpecMode` `tokens` | `id: "tokens"` | `src/ui/sections/geometry.js:384` | present |
| C19 Geometry `compare` labeled All when a mode exists | `...(modes.length ? [{ id: "compare", label: "All"` | `src/ui/sections/geometry.js:225` | present |
| C20 `renderGeomInspector` | `renderGeomInspector(view) {` | `src/ui/sections/geometry.js:707` | present |
| C20 ramp, `radius`, space tabs | `{ id: "ramp", label: "Ramp" }, { id: "radius", label: "Radius" }, { id: "space", label: "Space" }` | `src/ui/sections/geometry.js:710` | present |
| C21 per-step text size composes from the Type scale (per mode) | `typeScale: typeScaleFor(doc, modeKey)` | `src/ui/model.mjs:176` | present |
| C22 Typography Compare: Base column | `this._typeCompareColumn(view, "base", "Base")` | `src/ui/sections/typography.js:367` | present |
| C22 Typography Compare: one column per mode | `...modes.map((m) => this._typeCompareColumn(` | `src/ui/sections/typography.js:368` | present |
| C22 Geometry Compare: Base column | `this._geomCompareColumn(view, "base", "Base")` | `src/ui/sections/geometry.js:439` | present |
| C22 Geometry Compare: one column per mode | `...modes.map((m) => this._geomCompareColumn(` | `src/ui/sections/geometry.js:440` | present |
| C23 Compare hides the Typography canvas segment | `this.typeMode === "compare" ? false` | `src/ui/sections/typography.js:308` | present |
| C23 Compare hides the Geometry canvas segment | `this.geomMode === "compare" ? false` | `src/ui/sections/geometry.js:381` | present |
| C24 left analysis cards per section | `this.typeAnalysisCards(view)` | `src/ui/app.js:1540` | present |
| C24 Geometry analysis cards | `this.geomAnalysisCards(view)` | `src/ui/app.js:1541` | present |
| C25 the group list is `FORMAT_GROUPS` | `const FORMAT_GROUPS = [` | `src/ui/overlays/drawer.js:38` | present |
| C25 ten colour formats, first CSS hex | `["Colors", [["css", "Hex"]` | `src/ui/overlays/drawer.js:39` | present |
| C25 ... last JSON | `["dtcg", "DTCG"], ["json", "JSON"]]]` | `src/ui/overlays/drawer.js:39` | present |
| C25 Typography token outputs | `["Typography", [["type-css"` | `src/ui/overlays/drawer.js:40` | present |
| C25 Geometry token outputs | `["Geometry", [["geom-css"` | `src/ui/overlays/drawer.js:41` | present |
| C25 design-system bundle, tokens and DESIGN.md | `["ds-tokens", "tokens.json"], ["ds-spine", "DESIGN.md"]` | `src/ui/overlays/drawer.js:42` | present |
| C25 the config round-trip | `["config", "Config"]` | `src/ui/overlays/drawer.js:43` | present |
| C26 the home view is the hub | `this.category ? this.renderCategoryBody() : this.renderHubBody()` | `src/ui/app.js:906` | present |
| C26 saved sets as tiles | `...this.buildTiles()` | `src/ui/app.js:915` | present |
| C26 with a search box | `this.ensureSearchInput("Search your palette sets")` | `src/ui/app.js:928` | present |
| C26 then the curated categories | `...CATEGORY_INDEX.map((c) => this.categoryCard(c))` | `src/ui/app.js:946` | present |
| C26 a category card opens the category | `this.openCategory(c.slug)` | `src/ui/app.js:850` | present |
| C27 `this.category` is a slug | `this.category = slug` | `src/ui/app.js:833` | present |
| C27 or `null` (the hub) | `this.category = null` | `src/ui/app.js:842` | present |
| C28 volumes load lazily on entry | `return loadCategory(slug)` | `src/ui/app.js:837` | present |
| C28 and are cached per category | `this._categoryData[slug] = m` | `src/ui/app.js:838` | present |
| C29 a preset opens as an editable copy in your sets | `this.openConfigAsSet(preset` | `src/ui/app.js:806` | present |
| C30 Project load in the gallery header | `"Project"]` | `src/ui/app.js:901` | present |
| C30 Import in the gallery header | `"Import"]` | `src/ui/app.js:902` | present |
| C30 New in the gallery header | `btn("+ New"` | `src/ui/app.js:903` | present |
| C31 `colorMode` persists with the app preferences | `colorMode: this.colorMode` | `src/ui/app.js:2297` | present |
| C31 the app preferences have their own key | `localStorage.setItem(this._appPrefsKey()` | `src/ui/app.js:2297` | present |
| C31 and never with the document | `colorMode` | `src/ui/persist.js` | absent |
| C32 T8 10 colour formats | `["Colors", [` | `src/ui/overlays/drawer.js:39` | present |
| C33 T10 scale, fonts, specimen | `{ id: "fonts", label: "Fonts" }` | `src/ui/sections/typography.js:607` | present |
| C33 T11 ramp, radius, space | `{ id: "space", label: "Space" }` | `src/ui/sections/geometry.js:710` | present |
| C34 T12 add a Typography mode | `addTypeMode() {` | `src/ui/sections/typography.js:199` | present |
| C34 T12 edit a Typography mode | `renameTypeMode(id, name) {` | `src/ui/sections/typography.js:228` | present |
| C34 T12 add a Geometry mode | `addGeomMode() {` | `src/ui/sections/geometry.js:254` | present |
| C34 T12 edit a Geometry mode | `renameGeomMode(id, name) {` | `src/ui/sections/geometry.js:282` | present |
| C35 T13 Light and Dark side by side (Color) | `this._compareColumn(view, "dark")` | `src/ui/sections/color.js:942` | present |
| C35 T13 all breakpoints side by side (Typography) | `this._typeCompareColumn(view, "base", "Base")` | `src/ui/sections/typography.js:367` | present |
| C35 T13 all breakpoints side by side (Geometry) | `this._geomCompareColumn(view, "base", "Base")` | `src/ui/sections/geometry.js:439` | present |
