# Handoff docs-stale-batch U3 pass 1 · builder to verifier

| Field | Value |
|---|---|
| Branch | unit/dsb-U3 @ 1bff0594 |
| Base | plan/docs-stale-batch @ 30f7ba10 |
| Files at 1bff0594 | scripts/gen-figma-binder-code.mjs (header names gen:figma-assets as the wiring point, gen:figma-binder-code as the hand-run script), figma/binder/figma-semantic-binder/code.js (same fix, M4), regenerated src/ui/figma-plugin-assets.js and figma/plugin/ui.html |
| Files in this handoff commit | .sdlc/handoffs/docs-stale-batch-U3.md |
| Ran | the `~~~sh ran` block below at 1bff0594 in `.worktrees/dsb-U3`, output pasted unedited; `npm test` at 1bff0594: `✓ all 54 test files passed`, exit 0, 89 s, `git status --porcelain` showed the four edited/regenerated files before the commit and is empty after; P3, P4 at this commit |
| Left out | `npm run build` and smoke (no `node_modules`, owed at pre-land); P5 (U3 does not claim the trivial lane); P6 (U4 only); the negative controls (verifier's) |
| Deciders opened | `package.json` scripts `test`, `build`, `gen:figma-assets`, `gen:figma-binder-code` |

## Decisions

1. Plan defects, same fixes as U2: P2's two lines are cut to their first two words (the branding count includes this handoff); the ledger's `condition` probe uses an in-awk count, not a `grep -E 'a|b'` pipe inside a cell.
2. U3-1's `\|` in the plan cell is the table escape, run here as a plain `|` inside `grep -E`.
3. The ran block carries U3-1 to U3-4 and P2; the ran block's U3-3 and U3-4 assume a clean tree, so it is re-run from a committed head.

## Ran

~~~sh ran
git rev-parse --short=8 HEAD
# U3-1
for f in scripts/gen-figma-binder-code.mjs figma/binder/figma-semantic-binder/code.js; do grep -c -E 'via the .?gen:figma-binder-code|run it as gen:figma-binder-code' "$f"; done
# U3-2
node -e 'const s=require("./package.json").scripts;console.log(["test","build"].map(k=>s[k].includes("gen:figma-assets")&&!s[k].includes("gen:figma-binder-code")).join(" "), s["gen:figma-assets"].split("&&")[0].trim())'
# U3-3
grep -c 'run it as gen:figma-binder-code' src/ui/figma-plugin-assets.js figma/plugin/ui.html; git status --porcelain | wc -l | tr -d " "
# U3-4
node scripts/gen-figma-binder-code.mjs >/dev/null && git status --porcelain -uno | wc -l | tr -d " "
# P2
node test/repo/em-dash.mjs | tail -1 | cut -d' ' -f1-2; node test/repo/branding.mjs | tail -1 | cut -d' ' -f1-2
~~~

~~~out ran
1bff0594
0
0
true true node scripts/gen-figma-binder-code.mjs
src/ui/figma-plugin-assets.js:0
figma/plugin/ui.html:0
0
0
em-dash: clean
branding: clean
~~~

## Claims

| Claim | Needle | Anchor | Kind |
|---|---|---|---|
| `npm test` and `npm run build` reach the generator through gen:figma-assets | `gen:figma-assets` | `scripts/gen-figma-binder-code.mjs` | present |
| the binder header names gen:figma-assets too | `gen:figma-assets` | `figma/binder/figma-semantic-binder/code.js` | present |
| the generator header no longer claims the standalone script is the wiring | `via the gen:figma-binder-code` | `scripts/gen-figma-binder-code.mjs` | absent |
| the binder header no longer says npm runs it as gen:figma-binder-code | `run it as gen:figma-binder-code` | `figma/binder/figma-semantic-binder/code.js` | absent |
| the embedded asset carries the corrected header | `run it as gen:figma-binder-code` | `src/ui/figma-plugin-assets.js` | absent |
| the embedded plugin UI carries the corrected header | `run it as gen:figma-binder-code` | `figma/plugin/ui.html` | absent |
| gen:figma-assets starts with the generator | `node scripts/gen-figma-binder-code.mjs` | `package.json` | present |
