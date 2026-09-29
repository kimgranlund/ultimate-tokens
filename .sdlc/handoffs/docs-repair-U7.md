# Handoff U7 pass 1 · builder to verifier

| Field | Value |
|---|---|
| Branch | unit/dr-U7 @ 89b01d95 |
| Base | plan/docs-repair @ 5c139146 |
| Files at 89b01d95 | README.md (new `## Views and sections`, 27 lines with its two heading lines, before `## License`), .sdlc/architecture.md (DD41 `README.md:147` to `README.md:173`; DD9 re-quoted to "80 to 90 s" with the `npm test` row's `89.10 · 79.93 · 80.07`, ref `a62ec020`) |
| Files in this handoff commit | .sdlc/handoffs/docs-repair-U7.md |
| Ran | every U7 row and P3 at 89b01d95 in `.worktrees/dr-U7`, as the `~~~sh ran` block below, output pasted unedited into `~~~out ran`; `npm test` at 89b01d95, `✓ all 50 test files passed`, `git status --short` empty after |
| Left out | `npm run build` and smoke (no `node_modules`, owed at pre-land); P1 to P8 beyond P3 (plan-wide, the verifier's); the U7-1 `Today` counts and negative controls are in the sections below |
| Decisions | Sentences were read from `src/ui/app.js` and `src/ui/sections/*` code, none from comments or other docs. U7-4's command reads the ledger from `"$F/hf"` (P8 copies the handoff there before it checks out the head, where this file does not yet exist; if `F` is not exported into `ran.sh`, the added line reads it from the `unit/dr-U7` tip), and U7-3 sets `B` and `F` if the shell has not; the U7-3 setup line and that U7-4 line are the only additions to the plan's commands. (Superseded by plan revision 13: U7-3's Expected now reads `bad 0`, QUOTE `0`, fourth `2`, and the cell `\|` is always removed, so U7-2 runs `(js|mjs)`.) The plan's U7-3 cell expected the QUOTE count `1` and `bad 1` (DD9 red as at `$B`); revision 2026-09-26 has U7 re-quote DD9, so the tree prints `0` and `bad 0`. The fourth U7-3 command prints `2` for the same reason (DD9's removed and added lines; the cell's `0` counted DD41 only). |

## Ran

~~~sh ran
git rev-parse --short=8 HEAD
# U7-1
grep -n '^## ' README.md | tail -2; for n in gallery categor Typography Geometry Compare drawer 'ui-plan.md' 'app-shell.md'; do printf '%s ' "$n"; grep -c -i "$n" README.md; done
# U7-2
awk '/^## Views and sections/,/^## License/' README.md | wc -l; grep -c -E '[a-z-]+\.(js|mjs):[0-9]+' README.md
# U7-3
B=${B:-$(git merge-base origin/main HEAD)}; F=${F:-$(mktemp -d)}
L=$(grep -n 'see \[LICENSE\](LICENSE)' README.md | cut -d: -f1); grep -c "DD41 | \x60README.md:$L\x60" .sdlc/architecture.md; sh .sdlc/checks/doc-drift-rows-check.sh | tail -1; sh .sdlc/checks/doc-drift-rows-check.sh | grep -c QUOTE; git diff "$B" -- .sdlc/architecture.md | grep -E '^[+-]. DD[0-9]+ ' | grep -v -c '^[+-]. DD41 '
# U7-4
[ -s "$F/hf" ] || git show unit/dr-U7:.sdlc/handoffs/docs-repair-U7.md > "$F/hf"
awk '/^## Claims/,0' "$F/hf" | grep -E '^[|] ' | grep -v -E '^[|] (Claim|---)' > "$F/claims"; [ -s "$F/claims" ] || echo NO-LEDGER; wc -l < "$F/claims" | tr -d ' '; while IFS='|' read -r _ claim needle anchor kind _; do n=$(printf '%s' "$needle" | sed 's/^ *\x60//; s/\x60 *$//'); a=$(printf '%s' "$anchor" | sed 's/\x60//g; s/ //g'); k=$(printf '%s' "$kind" | tr -d ' '); f=${a%%:*}; l=${a##*:}; case "$k" in present) c=$(sed -n "${l}p" "$f" | sed 's://.*$::' | grep -c -F -- "$n");; absent) c=$(grep -v -E '^[[:space:]]*//' "$f" | sed 's://.*$::' | grep -c -F -- "$n"); c=$([ "$c" = 0 ] && echo 1 || echo 0);; *) c=0;; esac; echo "$c $k $a $n"; done < "$F/claims" | tee "$F/claims.out" | grep -c '^0 '
# P3
tail -1 <(node test/repo/branding.mjs)
~~~

~~~out ran
89b01d95
145:## Views and sections
171:## License
gallery 4
categor 13
Typography 5
Geometry 7
Compare 1
drawer 1
ui-plan.md 1
app-shell.md 1
      27
0
1
rows 56 drifted 11 holds 45 undetermined 0 bad 0
0
2
47
0
branding: clean (746 files scanned)
~~~

## Negative controls

Run in a clone (`git clone -q --shared .`) or on a scratch copy, never on the branch.

| Row | Control | Printed |
|---|---|---|
| U7-1 | README at `$B` | `133:## Figma plugin`, `145:## License`; `gallery` 2, `categor` 11, `Typography` 3, `Geometry` 4, `Compare` 0, `drawer` 0, `ui-plan.md` 0, `app-shell.md` 0. After (above): `gallery` 4, `categor` 13, `Typography` 5, `Geometry` 7, `Compare` 1, `drawer` 1, `ui-plan.md` 1, `app-shell.md` 1 |
| U7-2 | `app-shell.md` section 1 pasted before `## License` | length `83`, cites `3` (both legs red, with the escape removed per revision 13). Section absent: `0`, `0` |
| U7-3 | DD41 left at `README.md:147` | first command `0`, `rows 56 drifted 11 holds 45 undetermined 0 bad 1`, `QUOTE DD41: not found at README.md:147` |
| U7-3 | DD40 also re-pointed (`:131` to `:157`) | fourth command `4` (DD9's two lines and DD40's two) |
| U7-4 | (a) handoff with no `## Claims` | `NO-LEDGER`, `0`, `0` |
| U7-4 | (b) four-row fixture | `4`, `2`; `claims.out` `0 absent src/ui/sections/typography.js wirePanZoom`, `0 present src/ui/app.js:1439 pan/zoom` |

## Figures

Section: 27 lines counting its two heading lines (U7-2 output). New DD41 number: `README.md:173`. Ledger: 47 rows, 0 failing. `npm test` at 89b01d95: `✓ all 50 test files passed`, tree clean after. The drawer's Colors group lists ten formats (css, oklch, tailwind, shadcn, panda, radix, figma, ui3, dtcg, json at `drawer.js:39`), counted by eye.

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
| Color canvas Scrims | `id: "scrims"` | `src/ui/sections/color.js:817` | present |
| Color canvas Mapping | `id: "mapping"` | `src/ui/sections/color.js:818` | present |
| Color canvas Radix | `id: "radix"` | `src/ui/sections/color.js:819` | present |
| system, light or dark scheme | `this.colorMode === "system"` | `src/ui/app.js:172` | present |
| Compare renders both schemes except in Mapping | `this.colorMode === "both" && !isTable` | `src/ui/sections/color.js:870` | present |
| Color left pane analysis cards | `this.analysisCards(view)` | `src/ui/app.js:320` | present |
| Typography Specimen view | `id: "specimen"` | `src/ui/sections/typography.js:310` | present |
| Typography Tokens matrix | `id: "tokens"` | `src/ui/sections/typography.js:311` | present |
| All button only once a mode exists | `modes.length ? [{ id: "compare", label: "All"` | `src/ui/sections/typography.js:172` | present |
| All hides the Specimen/Tokens switch | `this.typeMode === "compare" ? false` | `src/ui/sections/typography.js:308` | present |
| Typography inspector Scale tab | `label: "Scale"` | `src/ui/sections/typography.js:607` | present |
| Typography inspector Fonts tab | `label: "Fonts"` | `src/ui/sections/typography.js:607` | present |
| Typography left pane type analysis cards | `this.typeAnalysisCards(view)` | `src/ui/app.js:1540` | present |
| Geometry Controls view | `id: "controls"` | `src/ui/sections/geometry.js:383` | present |
| Geometry Tokens matrix | `id: "tokens"` | `src/ui/sections/geometry.js:384` | present |
| Geometry All button only once a mode exists | `modes.length ? [{ id: "compare", label: "All"` | `src/ui/sections/geometry.js:225` | present |
| Geometry All hides the Controls/Tokens switch | `this.geomMode === "compare" ? false` | `src/ui/sections/geometry.js:381` | present |
| Geometry inspector Ramp tab | `label: "Ramp"` | `src/ui/sections/geometry.js:710` | present |
| Geometry inspector Radius tab | `label: "Radius"` | `src/ui/sections/geometry.js:710` | present |
| Geometry inspector Space tab | `label: "Space"` | `src/ui/sections/geometry.js:710` | present |
| step text size comes from the Type scale | `typeScale: typeScale(tcfg)` | `src/ui/model.mjs:57` | present |
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
| Specimen renders each step in its real face | `render each step in the real font` | `src/ui/sections/typography.js:310` | present |
| Typography Tokens matrix is Base plus each breakpoint | `every step × Base + each breakpoint` | `src/ui/sections/typography.js:311` | present |
| Controls is a mock control at each size step | `render each ramp step as a real box` | `src/ui/sections/geometry.js:383` | present |
| Typography inspector Specimen tab | `label: "Specimen" }` | `src/ui/sections/typography.js:607` | present |
