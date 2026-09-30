# Handoff docs-stale-batch U4 pass 1 · builder to reviewer and verifier

| Field | Value |
|---|---|
| Branch | unit/dsb-U4 @ 6497a7bd |
| Base | plan/docs-stale-batch @ 30f7ba10 |
| Files at 6497a7bd | src/ui/model.mjs (both CONTROL_FONT comments), src/ui/sections/typography.js and src/ui/sections/geometry.js (the `only when ≥1 mode` comment above `compare`), plus regenerated figma/plugin/ui.html and src/ui/describe-mcp-assets.js |
| Files in this handoff commit | .sdlc/handoffs/docs-stale-batch-U4.md |
| Ran | the `~~~sh ran` block below at 6497a7bd in `.worktrees/dsb-U4`, output pasted unedited; `npm test` at 6497a7bd: `✓ all 54 test files passed`, exit 0, 114 s, tree clean after the commit; P3, P4 at this commit; P6 is in the block |
| Left out | `npm run build` and smoke (owed at pre-land); P5 (U4 does not claim the lane); negative controls (reviewer's) |
| Deciders opened | `geomScale` in `src/engine/geometry.mjs` (`uiSteps`, `CONTROL_FONT` fallback), `typeEffectiveModes` and `geomEffectiveModes` in `src/ui/model.mjs`, `typeModeControl` and `geomModeControl` |

## Decisions

1. Two `model.mjs` sites carried the trio claim, not one: the comment above `geometryScale` and the one above `geomScaleFor` (line 167 at base). Both rewritten; U4-1 prints `0`.
2. `npm test` regenerated `src/ui/describe-mcp-assets.js` as well as `figma/plugin/ui.html` (it embeds `model.mjs`). Both committed.
3. Plan defects, same fixes as U2 and U3: P2 lines cut to their first two words; no `grep -E 'a|b'` pipe in any ledger cell (the condition rows carry a probe file or count, not a piped command); P3's header-row filter over-counts by one, so the row count below is the raw P3 output.
4. The U4-2 and U4-4 probe lines carry ANSI color codes in the pasted output (this host sets FORCE_COLOR); the values read `6 true false` and `2 2 2`. P4 reproduces them on this host.
5. Left alone per Dropped: the four `typography.js` stale-voice sites (`11 named voices`, `every voice is now a 3-step`, `the eleven named voices` twice), owned by gates-batch U2.
6. The dead `modes.length ?` guard is untouched (Not in scope, M5).

## Ran

~~~sh ran
git rev-parse --short=8 HEAD
# U4-1
grep -c 'XS/XL/2XL fall back' src/ui/model.mjs
# U4-2
node --input-type=module -e 'import {geomScale} from "./src/engine/geometry.mjs"; import {typeScale} from "./src/engine/type.mjs"; const t=typeScale({bodyBase:18}); const uc=t.categories["UI-control"]; const g=geomScale({},{typeScale:t}); const g0=geomScale({}); const steps=Object.keys(g.sizes).filter(k=>uc[k]); console.log(steps.length, steps.every(k=>g.sizes[k].font===uc[k].size), steps.every(k=>g0.sizes[k].font===uc[k].size))'
# U4-3
for f in src/ui/sections/typography.js src/ui/sections/geometry.js; do grep -c 'only when ≥1 mode' "$f"; done; grep -c '_typeEffectiveModes' src/ui/sections/typography.js; grep -c '_geomEffectiveModes' src/ui/sections/geometry.js
# U4-4
node --input-type=module -e 'import {typeEffectiveModes as t, geomEffectiveModes as g} from "./src/ui/model.mjs"; console.log(t({}).length, g({}).length, t({type:{modes:[]}}).length)'
# U4-5
B=$(git merge-base origin/main HEAD); for f in src/ui/model.mjs src/ui/sections/typography.js src/ui/sections/geometry.js; do diff <(git show "${B}:$f" | sed 's#//.*$##' | grep -v '^[[:space:]]*$') <(sed 's#//.*$##' "$f" | grep -v '^[[:space:]]*$') | wc -l | tr -d " "; done
# P2
node test/repo/em-dash.mjs | tail -1 | cut -d' ' -f1-2; node test/repo/branding.mjs | tail -1 | cut -d' ' -f1-2
# P6
node scripts/report-preset-fidelity.mjs --identity-control --base $(git merge-base origin/main HEAD) | tail -1
~~~

~~~out ran
6497a7bd
0
[33m6[39m [33mtrue[39m [33mfalse[39m
0
0
8
8
[33m2[39m [33m2[39m [33m2[39m
0
0
0
em-dash: clean
branding: clean
0 differing cells
~~~

## Claims

| Claim | Needle | Anchor | Kind |
|---|---|---|---|
| the trio fallback claim is gone from model.mjs | `XS/XL/2XL fall back` | `src/ui/model.mjs` | absent |
| the composition holds at every UI-control step and the no-opts form falls back (probe U4-2, output `6 true false` at bodyBase 18) | `6 true false` | `src/engine/geometry.mjs` | condition |
| the typography comment is gone | `only when ≥1 mode` | `src/ui/sections/typography.js` | absent |
| the geometry comment is gone | `only when ≥1 mode` | `src/ui/sections/geometry.js` | absent |
| the typography comment names its decider | `_typeEffectiveModes` | `src/ui/sections/typography.js` | present |
| the geometry comment names its decider | `_geomEffectiveModes` | `src/ui/sections/geometry.js` | present |
| both deciders return 2 rungs on a document with no modes (probe U4-4, output `2 2 2`) | `2 2 2` | `src/ui/model.mjs` | condition |
