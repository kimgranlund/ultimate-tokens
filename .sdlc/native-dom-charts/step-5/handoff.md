## Task goal
User ruling 2026-10-08: "for charts and graphs, you can learn how to do them properly here /Users/kimgranlund/Projects/nonoun/native-dom-charts", and, asked what to do with its rules, they chose "Rebuild charts as native DOM". Replace the app's analysis charts, today hand-built SVG strings set through `h("div", { class: "an-svg", html: svg })` (the ratified `html:` exception, 12 live uses: `src/ui/sections/color.js` :62 `graphLC`, :90 `graphTone`, :118 `graphChroma`, :208 `graphContrast`/`graphDamping`, :242 `graphHueWheel`, :633 hue/chroma disc; `geometry.js` :482 centering-law cell diagram, :517 icon and text vs height, :548 tier ladders; `typography.js` :54 type scale, :85 letter-spacing, :111 line-height ratio; classes in `src/ui/styles.css` ~:464-501, 836-839, 1389, 1526-1531), with native DOM charts: marks are HTML elements styled with CSS, no SVG and no Canvas, built with `h()` hyperscript.

## Step 5: Retire the html: path, update the records, gates green
level: L3
guard timeout: 3000
### Read first
- `docs/references/AGENTS.md`
- `docs/specs/AGENTS.md`
- `docs/AGENTS.md`
### Do
Depends on: steps 1 to 4.

1. `src/ui/app-helpers.mjs`: delete the `html` branch of `h()` (`else if (k === "html") el.innerHTML = v;`).
   - No caller is left: after step 4, `grep -rn 'html:' src/ui` finds only the generated `src/ui/describe-mcp-assets.js` data.
   - `src/ui/icons.js` keeps its own `innerHTML` for icon paths. Icons are not charts and stay out of scope; the ADR says so.
   - `scripts/bundle.mjs` stays untouched: this step adds no import. `app-helpers.mjs` only loses a branch, and `test/repo/dom-charts.mjs` and `test/smoke/smoke.mjs` are tests, not `MODS` entries. `npm test` runs the bundle preflight anyway.
2. `test/repo/dom-charts.mjs`, final form:
   - Drop the ALLOW map and check (b).
   - Assert zero `html:` attributes and zero `<svg` strings in every `src/ui/sections/*.js`, no `innerHTML` in `src/ui/app-helpers.mjs`, and no `innerHTML` or `<svg` in `src/ui/charts/*.mjs`.
   - Every FAIL line names its file. Keep reading through `readFileSync` from `node:fs`.
   - Pass line: `dom-charts: 0 html: attributes, 0 <svg strings in src/ui/sections, h() sets no innerHTML`.
   - Update the header comment.
3. Records. Stale context is a defect, so update all of these:
   - `.claude/CLAUDE.md`: delete the "SVG line charts set `fill: none`" bullet. Replace step 1's interim bullet ("The section functions still on SVG strings (`html:`) are the `ALLOW` list ...") with the convention:
     - Analysis charts are native DOM marks: HTML elements styled by CSS, with no SVG, no canvas and no `html:` attribute.
     - They are built with `renderChart(spec)` (`src/ui/charts/render.mjs`) over the pure `src/ui/charts/core.mjs`.
     - Series colour comes from `--series` (and `--dash`).
     - `test/repo/dom-charts.mjs` gates the convention.

     The new wording must not contain the literals `SVG-chart`, `an-svg` or `fill: none`, because the records criterion rejects them.
   - `.claude/skills/building-editor-sections/SKILL.md`:
     - The Left-analysis table cell (`.an-card`/`.an-svg`/`legend()`).
     - Step 3: `.an-chart`, `renderChart` and `legend()` replace `.an-svg` and the `fill: none` rule.
     - The `references/best-practices.md` row of its reference table ("the fill:none selector").
   - `references/best-practices.md`:
     - The `fill: none` selector bullet becomes the chart primitive: a spec in nominal px, `scaleLinear`, `--series` on the series class, and a hidden source table.
     - The `.an-svg` mention in the reuse bullet and the `fill:none` note in the Geometry walkthrough are removed.
   - `references/foundations.md`, the `h()` paragraph: `h()` no longer takes `html` ("innerHTML for SVG strings" goes).
   - `references/rubric.md` S4: "SVG lines set `fill:none` (qualified)" becomes "charts are native DOM marks".
   - `.claude/agents/change-reviewer-agent.md`: the description's "SVG fill:none traps" and the browser-traps bullet on SVG `fill: none` become the native-chart rule. The rule is: no `html:` attribute or SVG string in a section file, and `-webkit-mask-image` beside every `mask-image`.
   - `docs/references/component-inventory.md`:
     - Rows 15 to 17 and the prose for the hue wheel, the tone curve and the damping graph describe the native marks (`.an-chart`, `.ch-ribbon`, `.ch-band`, `.ch-dot`, `.ch-rule`, `.ch-circle`, `--series`), not SVG.
     - The general prose at the "data-viz marks (SVG/CSS ...)" line and the "non-interactive SVG/CSS marks" line says native DOM/CSS.
   - `docs/references/decision-records.md`: append an ADR before `## Quick map`.
     - Heading: `## ADR-<next>: Analysis charts are native DOM marks; the html: SVG exception is retired`.
     - `<next>` is one above the highest `## ADR-` number on this lane and on `origin/main` (`git show origin/main:docs/references/decision-records.md`). At plan time the lane's highest is ADR-033 (T-0027) and main's is ADR-034 (T-0021, compute layers), so it is ADR-035 unless a lane lands first. Do not reuse 034: the lane's resync would collide.
     - Context: the user's 2026-10-08 ruling, with the source project as a reference only.
     - Decision: core and renderer layering; nominal px boxes with percent polygons; snapshot-tier cards with no tooltip or keyboard path; a hidden source table; curved dashes by mask; the four geometric drawings ported; icons keep `innerHTML`.
     - Consequences, and a Status line in ADR-033's PROPOSED form.
     - Add its Quick-map row (`| ADR-<next> | ... |`) after the last `| ADR-0NN |` row of the Quick-map table.
4. `test/smoke/smoke.mjs`:
   - Cover the color editor rail, the Typography section and the Geometry section, each in light and in dark: set `${el}.theme = "light"` or `"dark"`, then `render()`.
   - Save `smoke-out/charts-<section>-<theme>.png` for each.
   - Assert:
     - at least 4 `.an-chart` in the color rail (L*xC, tone, chroma, hue wheel), at least 3 in typography and at least 3 in geometry;
     - every `.ch-ribbon` has a non-zero bounding box and no `NaN` in its `style`;
     - a `.ty-mono` ribbon computes a `maskImage` (or `webkitMaskImage`) other than `none`;
     - the centering card holds exactly 2 `.ch-rect`.
   - Restore `theme = "system"` afterwards.
5. Gates. Run each through `gate_lock.py`, exactly as the criteria write it (`SDLC_GATE_WORKERS=10`). Run `npm ci` first only if `node_modules` is missing; `npm run build` needs it.
   - `npm test`. Its generator prefix rewrites `figma/plugin/ui.html`. While the bundle is stale, the first run fails the shasum check; a second run passes. Keep the regenerated bytes for CI's drift gate (`.sdlc/adapter.md` section 1).
   - `npm run build`, then `npm run smoke`. Smoke runs the build first, and Chrome is on this host.
   - The sweep legs one at a time, never the chained `gate:sweeps`. Run `gate:corpus-reset` first (`test/ui/headless-boot.mjs --full`, the only leg this plan's files feed), then the seven colour legs.
   - Fix every red that steps 1 to 4 introduced, and repair any cite a fix moves (`node test/repo/citations.mjs`). Cites into `app-helpers.mjs`, which item 1 shifts: 10 in the inventory, 1 in `00-synthesis.md`, 6 in `03-stores-and-persistence.md`.
6. No push, PR or issue.
### Acceptance criteria
- (red) `! grep -qF 'innerHTML' src/ui/app-helpers.mjs`
- (red) `test -f test/repo/dom-charts.mjs && out=$(node test/repo/dom-charts.mjs) && printf '%s\n' "$out" | grep -qF 'h() sets no innerHTML'`
- `test -f test/repo/dom-charts.mjs && ! out=$(node --input-type=module -e 'import fs from "node:fs"; import { syncBuiltinESMExports } from "node:module"; const r = fs.readFileSync; fs.readFileSync = (p, ...a) => { const s = r(p, ...a); return String(p).endsWith("src/ui/sections/geometry.js") ? s + "\nconst zz = \"<svg></svg>\";\n" : s; }; syncBuiltinESMExports(); await import("./test/repo/dom-charts.mjs");' 2>&1) && printf '%s\n' "$out" | grep -qF 'src/ui/sections/geometry.js'`
- (red) `! grep -qE 'SVG-chart|an-svg|fill: none' .claude/CLAUDE.md && grep -qF 'src/ui/charts/' .claude/CLAUDE.md && ! git grep -qE 'an-svg|fill: ?none|innerHTML for SVG' -- .claude/skills/building-editor-sections .claude/agents/change-reviewer-agent.md && grep -qF 'renderChart' .claude/skills/building-editor-sections/SKILL.md`
- (red) `! grep -qE 'SVG polar plot|SVG L[*] curve' docs/references/component-inventory.md && ! grep -qE '^[|] 1[5-7] [|] [*][*][^|]*[*][*] [|] data-viz [|] SVG [|]' docs/references/component-inventory.md && grep -qF 'ch-ribbon' docs/references/component-inventory.md`
- (red) `f=docs/references/decision-records.md && n=$(grep -oE '^## ADR-[0-9]+: Analysis charts are native DOM' "$f" | grep -oE 'ADR-[0-9]+') && test -n "$n" && grep -qE "^[|] $n [|]" "$f" && awk -v h="## $n:" 'index($0, h) == 1 {a = NR} /^## Quick map/ {q = NR} END {exit !(a && q && a < q)}' "$f"`
- (red) `for s in color typography geometry; do for m in light dark; do grep -qF "charts-$s-$m.png" test/smoke/smoke.mjs || exit 1; done; done`
- `a=$(cat figma/plugin/ui.html src/ui/*-assets.js src/ui/categories/*.js docs/reference/data/adia-* | shasum) && SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name npm-test -- npm test && test "$a" = "$(cat figma/plugin/ui.html src/ui/*-assets.js src/ui/categories/*.js docs/reference/data/adia-* | shasum)"`
- `SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name build -- npm run build`
- `out=$(SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name smoke -- npm run smoke 2>&1) && printf '%s\n' "$out" | grep -qF 'SMOKE PASS' && for s in color typography geometry; do for m in light dark; do test -s "smoke-out/charts-$s-$m.png" || exit 1; done; done`
- (guard) `SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name corpus-reset -- npm run gate:corpus-reset`
- (guard) `rc=0; for g in corpus-tonal corpus-anchor sweep-prime corpus-contrast mode-isolation even-dips chroma-envelope; do if ! SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name "$g" -- npm run "gate:$g"; then echo "red leg: $g"; rc=1; fi; done; exit $rc`
