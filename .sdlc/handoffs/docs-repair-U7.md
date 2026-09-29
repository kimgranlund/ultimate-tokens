# Handoff U7 pass 2 · builder to verifier

| Field | Value |
|---|---|
| Branch | unit/dr-U7 @ ac3f6974 |
| Base | plan/docs-repair @ baaf06ab |
| Merge | `plan/docs-repair` at baaf06ab (revision 15 plus the U6 findings) merged into the unit at 32f667ec, the parent of ac3f6974; pass 2's first build at ba74999e, merged on 806ea3ab, was reset away unpushed so Base could name the moved tip |
| Files at ac3f6974 | README.md (Typography: `Breakpoint modes sit beside it, Tablet and Mobile by default, and an **All** button shows every breakpoint side by side`; Geometry: `each step's text size composes from the Type scale (the ladder prototype ramp is the one exception)`; section now 28 lines), docs/reference/references/ui-plan.md:50-51 (`compare labeled All; Tablet and Mobile are live from typeEffectiveModes (geomEffectiveModes) until a mode is materialized`), docs/reference/references/glossary.md:45 (`always offered, since the standard Tablet and Mobile modes are live until the document materializes its own`), .sdlc/architecture.md (DD9 verdict cell `rounds to 80 to 89 s, inside "80 to 90 s"`; DD41 `README.md:173` to `README.md:174`) |
| Files in this handoff commit | .sdlc/handoffs/docs-repair-U7.md; `git mv` of .sdlc/verdicts/docs-repair-U6-review.md and docs-repair-U7-review.md to .sdlc/reviews/ (they open with a bare PASS, no `verdict:` line, which main's test/repo/verdict-frontmatter.mjs reds) |
| Ran | the `~~~sh ran` block below at ac3f6974 in `.worktrees/dr-U7` by `F=<tmp> HF=<tmp copy of this ledger> bash ran.sh`, output pasted unedited; `npm test` at ac3f6974: `✓ all 50 test files passed`, exit 0, 83 s, `git status --short` empty after; P3, P4 at ac3f6974; P7, P8 and U7-6 at this commit (Figures) |
| Left out | `npm run build` and smoke (no `node_modules`, owed at pre-land); P1, P2, P5, P6 (plan-wide, the verifier's) |
| Deciders opened | `typeEffectiveModes` and `geomEffectiveModes` (`src/ui/model.mjs:89-101`), `addTypeMode` and `deleteTypeMode` (`typography.js:199-215`), `geomScale` (`src/engine/geometry.mjs:281-287`) and `buildSizeLadder` (`:180-190`), `_setGeomRamp` (`geometry.js:305-309`), `renderCanvasArea` (`color.js:866-870`), `SCHEME_NEXT` (`app-helpers.mjs:431`) |

## Decisions

1. The README says `Tablet and Mobile by default`, not the brief's `(the standard set, live until you add your own)`. The brief's condition is incomplete at the decider: a first edit to a standard rung materializes it without the user adding a mode (`typography.js:417-418`), and `addTypeMode` appends to a materialized set (`:199-207`), so Tablet and Mobile stay after you add your own. `by default` claims only what `typeEffectiveModes` returns for a document with no modes; the two `Mode 1` condition rows prove the other branch (a document's own modes replace the live set). ui-plan.md and the glossary keep the brief's `until a mode is materialized` wording, which is the decider's own test (`(t.modes || []).length`).
2. The Geometry paragraph grew one line, so the license line moved to 174 and DD41 follows it (U7-3 leg 1 prints `1`, the drift check `bad 0`).
3. The `except in Mapping` sentence has a `condition` row, not only the two `present` rows the re-diagnosis §2.2 allowed: the probe calls `ColorSectionImpl.prototype.renderCanvasArea` with a stub `this` (Compare on) and prints which branch it took for Mapping and for Palettes.
4. The ladder probe is sharper than §2.2's. Its ladder leg `every((k) => !uc[k])` holds because ladder steps are named `0` to `9` and UI-control steps `XS` to `2XL`, whether or not the ladder composes. This probe checks each ladder font equals the ladder formula `round(height / 4 + 6)` (`geometry.mjs:185`), and runs the default ramp at body 22, where the composed fonts differ from the uncomposed ramp, so the composition leg cannot pass on the fallback constants.
5. `only` in `CSS sizes only` (README Export drawer) is the format's label (`drawer.js:41`), not a condition; it has a `present` row.
6. The `# setup` line is the plan's `at the top of every row` line; nothing else is added to the plan's commands. No `git show` fallback.
7. U7-6 inside the `ran` block prints the title leg `0`: at ac3f6974 the tree carries the pass 1 handoff (`# Handoff U7 pass 1`), since this handoff cannot exist at the sha it names. At this handoff's commit it prints `0`, `1`, `1`, `base-ok` (Figures). Plan defect, same class as F2: U7-6 reads `.sdlc/handoffs/docs-repair-U7.md` from the tree, not `"${HF:-...}"`.

## Ran

~~~sh ran
git rev-parse --short=8 HEAD
# setup
git fetch -q origin; B=$(git merge-base origin/main HEAD)
# U7-1
grep -n '^## ' README.md | tail -2; for n in gallery categor Typography Geometry Compare drawer 'ui-plan.md' 'app-shell.md'; do printf '%s ' "$n"; grep -c -i "$n" README.md; done
# U7-2
awk '/^## Views and sections/,/^## License/' README.md | wc -l; grep -c -E '[a-z-]+\.(js|mjs):[0-9]+' README.md
# U7-3
L=$(grep -n 'see \[LICENSE\](LICENSE)' README.md | cut -d: -f1); grep -c "DD41 | \x60README.md:$L\x60" .sdlc/architecture.md; sh .sdlc/checks/doc-drift-rows-check.sh | tail -1; sh .sdlc/checks/doc-drift-rows-check.sh | grep -c QUOTE; git diff "$B" -- .sdlc/architecture.md | grep -E '^[+-]. DD[0-9]+ ' | grep -v -c '^[+-]. DD41 '
# U7-4
awk '/^## Claims/,0' "${HF:-.sdlc/handoffs/docs-repair-U7.md}" | grep -E '^[|] ' | grep -v -E '^[|] (Claim|---)' > "$F/claims"; [ -s "$F/claims" ] || echo NO-LEDGER; wc -l < "$F/claims" | tr -d ' '; while IFS='|' read -r _ claim needle anchor kind _; do n=$(printf '%s' "$needle" | sed 's/^ *\x60//; s/\x60 *$//'); a=$(printf '%s' "$anchor" | sed 's/\x60//g; s/ //g'); k=$(printf '%s' "$kind" | tr -d ' '); f=${a%%:*}; l=${a##*:}; case "$k" in present) c=$(sed -n "${l}p" "$f" | sed 's://.*$::' | grep -c -F -- "$n");; absent) c=$(grep -v -E '^[[:space:]]*//' "$f" | sed 's://.*$::' | grep -c -F -- "$n"); c=$([ "$c" = 0 ] && echo 1 || echo 0);; condition) p=$(printf '%s' "$anchor" | sed 's/^ *\x60//; s/\x60 *$//'); c=$(bash -c "$p" 2>/dev/null | grep -c -F -x -- "$n"); a=$(printf '%s' "$p" | cut -c1-40);; *) c=0;; esac; echo "$c $k $a $n"; done < "$F/claims" | tee "$F/claims.out" | grep -c '^0 '; grep -c ' condition ' "$F/claims.out"
# U7-5
for f in README.md docs/reference/references/ui-plan.md docs/reference/references/glossary.md; do grep -c -i -E 'once (one|a mode) exists|modes? exists?|at least one mode' "$f"; done; grep -c 'Tablet and Mobile' README.md; node --input-type=module -e 'import {typeEffectiveModes as t, geomEffectiveModes as g} from "./src/ui/model.mjs"; console.log([t({}).length, g({}).length, t({type:{modes:[]}}).length, g({geometry:{modes:[]}}).length].join(" "))'
# U7-6
grep -c 'brackets the 79.93' .sdlc/architecture.md; grep -c '^[|] DD9 .*rounds to 80 to 89' .sdlc/architecture.md; head -1 .sdlc/handoffs/docs-repair-U7.md | grep -c 'pass 2'; S=$(awk '$2=="Base"{print $(NF-1); exit}' .sdlc/handoffs/docs-repair-U7.md); H=$(awk '$2=="Branch"{print $(NF-1); exit}' .sdlc/handoffs/docs-repair-U7.md); git merge-base --is-ancestor "$S" "$H" && echo base-ok
# P3
tail -1 <(node test/repo/branding.mjs)
~~~

~~~out ran
ac3f6974
145:## Views and sections
172:## License
gallery 4
categor 13
Typography 5
Geometry 7
Compare 1
drawer 1
ui-plan.md 1
app-shell.md 1
      28
0
1
rows 56 drifted 11 holds 45 undetermined 0 bad 0
0
2
66
0
7
0
0
0
1
2 2 2 2
0
1
0
base-ok
branding: clean (751 files scanned)
~~~

## Negative controls

Run in a `git clone -q --shared` of the worktree under the job tmp dir, never on the branch. The U7-4 command is the block's line, with `F` and `HF` exported.

| Row | Control | Printed |
|---|---|---|
| U7-1 | README at `$B` (pass 1, unchanged) | `133:## Figma plugin`, `145:## License`; `Compare` 0, `drawer` 0, `ui-plan.md` 0, `app-shell.md` 0; before and after for the other four: `gallery` 2 to 4, `categor` 11 to 13, `Typography` 3 to 5, `Geometry` 4 to 7 |
| U7-2, U7-3 | pass 1's controls stand; the section is 28 lines (limit 42) | pass 1: `83`, `3`; DD41 left behind prints `0` and `bad 1` |
| U7-4 (a) | a handoff with no `## Claims` at ac3f6974 | `NO-LEDGER`, `0`, `0`, `0` |
| U7-4 (b) | the U1-8 four-row fixture at ac3f6974 | `4`, `2`, `0`; `0 absent src/ui/sections/typography.js wirePanZoom`, `0 present src/ui/app.js:1439 pan/zoom` |
| U7-4 (c) | the pass 1 sentence as a `condition` row (Needle `reachable`) beside the pass 1 `present` row on `typography.js:172`, a `Tablet,Mobile` condition row and a `present` row on `geometry.js:308`, at ac3f6974 | `4`, `1`, `2`; `claims.out` line 2: `0 condition node --input-type=module -e 'import {typ reachable`. The `present` row on the guard line passes in the same run, which is F1 |
| U7-4 (d) | this ledger, `model.mjs` deciders changed to `return t.modes \|\| [];` and `return g.modes \|\| [];` | `66`, `3`, `7`; `0 condition ... {typ Tablet,Mobile`, `0 condition ... {typ all-shown`, `0 condition ... {geo Tablet,Mobile`. Both `present` rows on the All guard lines still pass |
| U7-4 (e) | this ledger, `geometry.mjs:287` `composed != null ? composed` changed to `false ? composed` | `66`, `2`, `7`; `0 present src/engine/geometry.mjs:287 ...`, `0 condition ... {geo composed-unless-ladder` |
| U7-4 (f) | this ledger, `color.js:870` `&& !isTable` removed | `66`, `2`, `7`; `0 present src/ui/sections/color.js:870 ...`, `0 condition ... {Col single-compare` |
| U7-5 | README, ui-plan.md, glossary.md at 96455bdd | `1`, `2`, `1`, `0`, `2 2 2 2` |
| U7-6 | the tree at 96455bdd | `1`, `0`, `0`, `base-ok` (the Base leg is a floor there, as the plan says; the title leg reds) |

## Figures

Section: 28 lines with its two heading lines. DD41: `README.md:174`. Ledger: 66 rows, 0 failing, 7 of kind `condition`. `npm test` at ac3f6974: `✓ all 50 test files passed`, 83 s, tree clean after. P3 at ac3f6974: `branding: clean (751 files scanned)`, `0`, `2`; the two raw lines are U3's records (`.sdlc/reviews/docs-repair-U3-progress.md` and `.sdlc/verdicts/docs-repair-U3-review.md`, both quoting the old `persist.js` header), U7 adds `0`. P4 at ac3f6974: `0`, `0`, `0`, `0`.

At this handoff's commit, in a clean `--shared` clone with no `unit/dr-U7` fetch dependence: U7-6 prints `0`, `1`, `1`, `base-ok`. P7 prints no `NO-HEAD`, `ancestor`, `0`; control, the Branch sha removed: `NO-HEAD`. P8 prints `H=ac3f6974`, `HAS-RAN`, `1 1 1 1 1 1`, no diff lines, `diff 0`; control, the `~~~out ran` ledger count `66` changed to `65` and committed in the clone: `18c18`, `< 65`, `> 66`, `diff 1`. The plan's P8 cell carries one unescaped `||` (`[ -s "$F/ran.exp" ] || echo NO-RAN`), so a cell-split extraction cuts the command there; the run above took the cell's whole backticked text with `\|` unescaped.

## claims.out

The file U7-4 wrote at ac3f6974, verbatim.

~~~text
1 present src/ui/app.js:74 this.view = "gallery"
1 present src/ui/app.js:217 this.view = "editor"
1 present src/ui/app.js:1420 label: "Geometry"
1 present src/ui/app.js:928 Search your palette sets
1 present src/ui/app.js:946 category-grid
1 present src/ui/app.js:774 preset-vol-head
1 present src/ui/app.js:979 Search ${card.category} palettes
1 present src/ui/app.js:806 this.openConfigAsSet(preset
1 present src/ui/app.js:901 this.loadFromProject()
1 present src/ui/app.js:902 this.importSet()
1 present src/ui/app.js:903 "+ New"
1 present src/ui/sections/color.js:816 id: "palettes"
1 present src/ui/sections/color.js:816 the tonal ramps
1 present src/ui/sections/color.js:817 id: "scrims"
1 present src/ui/sections/color.js:818 id: "mapping"
1 present src/ui/sections/color.js:818 each role's Light/Dark raw token, as a table
1 present src/ui/sections/color.js:819 id: "radix"
1 present src/ui/sections/color.js:819 the 12-step Park UI ladder per palette
1 present src/ui/app-helpers.mjs:431 SCHEME_NEXT = { system: "light", light: "dark", dark: "system" }
1 present src/ui/sections/color.js:853 this.colorCompareBtn(),
1 present src/ui/sections/color.js:914 Compare Light & Dark side by side
1 present src/ui/sections/color.js:870 this.colorMode === "both" && !isTable
1 present src/ui/sections/color.js:867 this.canvasView === "mapping"
1 condition node --input-type=module -e 'import {Col single-compare
1 present src/ui/sections/color.js:818 Light/Dark raw token
1 present src/ui/app.js:320 this.analysisCards(view)
1 present src/ui/app.js:1465 right inspector pane
1 present src/ui/sections/typography.js:310 id: "specimen"
1 present src/ui/sections/typography.js:311 id: "tokens"
1 present src/ui/sections/typography.js:310 render each step in the real font
1 present src/ui/sections/typography.js:311 every step × Base + each breakpoint
1 present src/ui/sections/typography.js:317 this.typeModeControl(),
1 condition node --input-type=module -e 'import {typ Tablet,Mobile
1 condition node --input-type=module -e 'import {typ Mode 1
1 present src/ui/sections/typography.js:172 { id: "compare", label: "All"
1 condition node --input-type=module -e 'import {typ all-shown
1 present src/ui/sections/typography.js:308 this.typeMode === "compare" ? false
1 present src/ui/sections/typography.js:607 label: "Scale"
1 present src/ui/sections/typography.js:607 label: "Fonts"
1 present src/ui/sections/typography.js:607 label: "Specimen" }
1 present src/ui/app.js:1540 this.typeAnalysisCards(view)
1 present src/ui/sections/geometry.js:383 id: "controls"
1 present src/ui/sections/geometry.js:383 render each ramp step as a real box
1 present src/ui/sections/geometry.js:384 id: "tokens"
1 present src/ui/sections/geometry.js:390 this.geomModeControl(),
1 condition node --input-type=module -e 'import {geo Tablet,Mobile
1 condition node --input-type=module -e 'import {geo Mode 1
1 present src/ui/sections/geometry.js:225 { id: "compare", label: "All"
1 present src/ui/sections/geometry.js:381 this.geomMode === "compare" ? false
1 present src/ui/sections/geometry.js:710 label: "Ramp"
1 present src/ui/sections/geometry.js:710 label: "Radius"
1 present src/ui/sections/geometry.js:710 label: "Space"
1 present src/engine/geometry.mjs:287 composed != null ? composed
1 present src/engine/geometry.mjs:281 if (ladder) {
1 present src/ui/sections/geometry.js:308 if (on) d.geometry.ramp = RAMP_LADDER
1 condition node --input-type=module -e 'import {geo composed-unless-ladder
1 present src/ui/app.js:1541 this.geomAnalysisCards(view)
1 present src/ui/overlays/drawer.js:39 ["Colors", [
1 present src/ui/overlays/drawer.js:40 ["Typography", [
1 present src/ui/overlays/drawer.js:41 ["Geometry", [
1 present src/ui/overlays/drawer.js:42 ["Design System", [
1 present src/ui/overlays/drawer.js:43 ["Project", [
1 present src/ui/overlays/drawer.js:40 ["type-dtcg", "Type · DTCG"]
1 present src/ui/overlays/drawer.js:41 ["geom-css-sizes", "Geometry · CSS (sizes only)"]
1 present src/ui/overlays/drawer.js:42 ["ds-spine", "DESIGN.md"]
1 present src/ui/overlays/drawer.js:43 ["config", "Config"]
~~~

## Claims

| Claim | Needle | Anchor | Kind |
|---|---|---|---|
| The app starts in a gallery | `this.view = "gallery"` | `src/ui/app.js:74` | present |
| opening a set enters the editor | `this.view = "editor"` | `src/ui/app.js:217` | present |
| the editor has three sections Color, Typography, Geometry | `label: "Geometry"` | `src/ui/app.js:1420` | present |
| hub shows saved sets under a search box | `Search your palette sets` | `src/ui/app.js:928` | present |
| categories as a grid | `category-grid` | `src/ui/app.js:946` | present |
| a category lists volumes of presets | `preset-vol-head` | `src/ui/app.js:774` | present |
| searchable within a category | `Search ${card.category} palettes` | `src/ui/app.js:979` | present |
| a preset opens an editable copy in your own sets | `this.openConfigAsSet(preset` | `src/ui/app.js:806` | present |
| Project header button | `this.loadFromProject()` | `src/ui/app.js:901` | present |
| Import header button | `this.importSet()` | `src/ui/app.js:902` | present |
| + New header button | `"+ New"` | `src/ui/app.js:903` | present |
| Color canvas Palettes | `id: "palettes"` | `src/ui/sections/color.js:816` | present |
| Palettes (the ramps) | `the tonal ramps` | `src/ui/sections/color.js:816` | present |
| Color canvas Scrims | `id: "scrims"` | `src/ui/sections/color.js:817` | present |
| Color canvas Mapping | `id: "mapping"` | `src/ui/sections/color.js:818` | present |
| Mapping (the semantic-role table) | `each role's Light/Dark raw token, as a table` | `src/ui/sections/color.js:818` | present |
| Color canvas Radix | `id: "radix"` | `src/ui/sections/color.js:819` | present |
| Radix (the 12-step ladder) | `the 12-step Park UI ladder per palette` | `src/ui/sections/color.js:819` | present |
| in a system, light or dark scheme (the scheme button's three-state cycle) | `SCHEME_NEXT = { system: "light", light: "dark", dark: "system" }` | `src/ui/app-helpers.mjs:431` | present |
| a Compare control in the Color canvas header | `this.colorCompareBtn(),` | `src/ui/sections/color.js:853` | present |
| Compare renders the scene in Light and Dark side by side | `Compare Light & Dark side by side` | `src/ui/sections/color.js:914` | present |
| Compare renders the compare area in both mode, except in Mapping | `this.colorMode === "both" && !isTable` | `src/ui/sections/color.js:870` | present |
| the exception's other branch is the Mapping view | `this.canvasView === "mapping"` | `src/ui/sections/color.js:867` | present |
| except in Mapping: with Compare on, renderCanvasArea draws one scene for Mapping and the compare area for Palettes | `single-compare` | `node --input-type=module -e 'import {ColorSectionImpl as C} from "./src/ui/sections/color.js"; const run = (v) => { try { return C.prototype.renderCanvasArea.call({section:"color", colorMode:"both", canvasView:v, renderCompareArea: () => "compare", _canvasScene: () => { throw 0; }}, {}); } catch (e) { return "single"; } }; console.log(run("mapping") + "-" + run("palettes"))'` | condition |
| whose table already shows both | `Light/Dark raw token` | `src/ui/sections/color.js:818` | present |
| Color left pane analysis cards | `this.analysisCards(view)` | `src/ui/app.js:320` | present |
| the right pane is the inspector | `right inspector pane` | `src/ui/app.js:1465` | present |
| Typography Specimen view | `id: "specimen"` | `src/ui/sections/typography.js:310` | present |
| Typography Tokens matrix | `id: "tokens"` | `src/ui/sections/typography.js:311` | present |
| Specimen renders each step in its real face | `render each step in the real font` | `src/ui/sections/typography.js:310` | present |
| Typography Tokens matrix is Base plus each breakpoint | `every step × Base + each breakpoint` | `src/ui/sections/typography.js:311` | present |
| Typography breakpoint modes sit beside it (the mode control in the canvas header) | `this.typeModeControl(),` | `src/ui/sections/typography.js:317` | present |
| Tablet and Mobile by default: a document with no modes gets the standard set | `Tablet,Mobile` | `node --input-type=module -e 'import {typeEffectiveModes as f} from "./src/ui/model.mjs"; console.log(f({type:{modes:[]}}).map((m) => m.name).join(","))'` | condition |
| by default, other branch: a document with its own mode shows it in place of the standard set (also ui-plan.md:50 and glossary.md:45, live until a mode is materialized) | `Mode 1` | `node --input-type=module -e 'import {typeEffectiveModes as f} from "./src/ui/model.mjs"; console.log(f({type:{modes:[{id:"tm-x",name:"Mode 1",bodyBase:16}]}}).map((m) => m.name).join(","))'` | condition |
| an All button (Typography) | `{ id: "compare", label: "All"` | `src/ui/sections/typography.js:172` | present |
| All shows on every set: the modes the All guard tests are never empty, for Typography or Geometry, with or without a modes array (also glossary.md:45, always offered) | `all-shown` | `node --input-type=module -e 'import {typeEffectiveModes as t, geomEffectiveModes as g} from "./src/ui/model.mjs"; console.log([t({}), g({}), t({type:{modes:[]}}), g({geometry:{modes:[]}})].every((m) => m.length > 0) ? "all-shown" : "hidden")'` | condition |
| All hides the Specimen/Tokens switch | `this.typeMode === "compare" ? false` | `src/ui/sections/typography.js:308` | present |
| Typography inspector Scale tab | `label: "Scale"` | `src/ui/sections/typography.js:607` | present |
| Typography inspector Fonts tab | `label: "Fonts"` | `src/ui/sections/typography.js:607` | present |
| Typography inspector Specimen tab | `label: "Specimen" }` | `src/ui/sections/typography.js:607` | present |
| Typography left pane type analysis cards | `this.typeAnalysisCards(view)` | `src/ui/app.js:1540` | present |
| Geometry Controls view | `id: "controls"` | `src/ui/sections/geometry.js:383` | present |
| Controls is a mock control at each size step | `render each ramp step as a real box` | `src/ui/sections/geometry.js:383` | present |
| Geometry Tokens matrix | `id: "tokens"` | `src/ui/sections/geometry.js:384` | present |
| Geometry has the same breakpoint modes beside the canvas | `this.geomModeControl(),` | `src/ui/sections/geometry.js:390` | present |
| the same breakpoint modes: Geometry's default is Tablet and Mobile | `Tablet,Mobile` | `node --input-type=module -e 'import {geomEffectiveModes as f} from "./src/ui/model.mjs"; console.log(f({geometry:{modes:[]}}).map((m) => m.name).join(","))'` | condition |
| the same default, other branch: a document with its own geometry mode shows it (also ui-plan.md:51) | `Mode 1` | `node --input-type=module -e 'import {geomEffectiveModes as f} from "./src/ui/model.mjs"; console.log(f({geometry:{modes:[{id:"gm-x",name:"Mode 1",baseHeight:28}]}}).map((m) => m.name).join(","))'` | condition |
| Geometry All button | `{ id: "compare", label: "All"` | `src/ui/sections/geometry.js:225` | present |
| Geometry All hides the Controls/Tokens switch | `this.geomMode === "compare" ? false` | `src/ui/sections/geometry.js:381` | present |
| Geometry inspector Ramp tab | `label: "Ramp"` | `src/ui/sections/geometry.js:710` | present |
| Geometry inspector Radius tab | `label: "Radius"` | `src/ui/sections/geometry.js:710` | present |
| Geometry inspector Space tab | `label: "Space"` | `src/ui/sections/geometry.js:710` | present |
| each step's text size composes from the Type scale | `composed != null ? composed` | `src/engine/geometry.mjs:287` | present |
| the ladder prototype ramp skips composition in the engine | `if (ladder) {` | `src/engine/geometry.mjs:281` | present |
| the ladder is reachable from the UI (the Ramp toggle) | `if (on) d.geometry.ramp = RAMP_LADDER` | `src/ui/sections/geometry.js:308` | present |
| text size composes from the Type scale, the ladder ramp the one exception: at body 22 every default step's font is the UI-control size and differs from the uncomposed ramp somewhere, and every ladder step's font is the ladder formula | `composed-unless-ladder` | `node --input-type=module -e 'import {geomScale, RAMP_LADDER} from "./src/engine/geometry.mjs"; import {typeScale} from "./src/engine/type.mjs"; const ts = typeScale({bodyBase: 22}); const uc = ts.categories["UI-control"]; const a = geomScale({baseHeight:28}, {typeScale: ts}).sizes; const b = geomScale({baseHeight:28, ramp: RAMP_LADDER}, {typeScale: ts}).sizes; const z = geomScale({baseHeight:28}).sizes; console.log(Object.keys(a).every((k) => a[k].font === uc[k].size) && Object.keys(a).some((k) => a[k].font !== z[k].font) && Object.keys(b).every((k) => b[k].font === Math.round(b[k].height / 4 + 6)) ? "composed-unless-ladder" : "other")'` | condition |
| Geometry left pane analysis cards | `this.geomAnalysisCards(view)` | `src/ui/app.js:1541` | present |
| drawer group Colors | `["Colors", [` | `src/ui/overlays/drawer.js:39` | present |
| drawer group Typography | `["Typography", [` | `src/ui/overlays/drawer.js:40` | present |
| drawer group Geometry | `["Geometry", [` | `src/ui/overlays/drawer.js:41` | present |
| drawer group Design System | `["Design System", [` | `src/ui/overlays/drawer.js:42` | present |
| drawer group Project | `["Project", [` | `src/ui/overlays/drawer.js:43` | present |
| Type group holds CSS and DTCG | `["type-dtcg", "Type · DTCG"]` | `src/ui/overlays/drawer.js:40` | present |
| Geometry group holds CSS, CSS sizes only, DTCG | `["geom-css-sizes", "Geometry · CSS (sizes only)"]` | `src/ui/overlays/drawer.js:41` | present |
| Design System group holds tokens.json and DESIGN.md | `["ds-spine", "DESIGN.md"]` | `src/ui/overlays/drawer.js:42` | present |
| Project group holds Config | `["config", "Config"]` | `src/ui/overlays/drawer.js:43` | present |
