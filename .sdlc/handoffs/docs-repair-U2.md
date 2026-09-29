# Handoff U2 pass 2 · builder to verifier

| Field | Value |
|---|---|
| Branch | unit/dr-U2 @ 441a8638 |
| Base | plan/docs-repair @ 1e263b2f (merged into the unit at c1d09fb9) |
| Files at 441a8638 | docs/reference/references/glossary.md (the Section, Inspector and Analysis card rows) |
| Files in this handoff commit | .sdlc/handoffs/docs-repair-U2.md |
| Ran | every U2 row and P3 at 441a8638 in `.worktrees/dr-U2`, as the `~~~sh ran` block below, output pasted unedited into `~~~out ran`; `npm test` at 441a8638, `✓ all 50 test files passed`, exit 0, `git status --short` empty after |
| Left out | `npm run build` and smoke (owed at pre-land, no `node_modules`); F2 (`all ten` in two contract checks) and F4 (`ui-plan.md`, on unit/dr-U1) per the re-diagnosis; per-row negative controls are the plan's stated ones and were not re-run here |
| Decisions | Section row: `this.section` is never persisted (`persist.js` carries no `section` key), the frame around it is invariant. Inspector row: `.seg-example` pins a live example, `exampleArtifacts` (`app.js`), `typeExampleCard`, `geomExampleCard`. Analysis card row: built by `analysisCards`, `typeAnalysisCards` or `geomAnalysisCards`, picked by `renderLeftPane` on `this.section` |

## Ran

~~~sh ran
git rev-parse --short=8 HEAD
# U2-1
grep -c 'Ultimate Tokens' docs/reference/SKILL.md; grep -c -i 'typography' docs/reference/SKILL.md; grep -c -i 'geometry' docs/reference/SKILL.md; grep -c -E 'five export formats|all five exports|eight color formats|all five exporters' docs/reference/SKILL.md; grep -c '^name: ' docs/reference/SKILL.md
# U2-2
for p in 'references/ui-plan.md' 'references/component-inventory.md' '../lld/app-shell.md'; do grep -c "\x60$p\x60" docs/reference/SKILL.md; done; test -f docs/lld/app-shell.md && echo ok
# U2-3
grep -ci 'eight color formats' docs/reference/references/spec-draft.md docs/reference/rubrics/acceptance-criteria.md docs/reference/rubrics/quality-rubric.md; grep -c '5 formats' docs/reference/references/spec-draft.md
# U2-4
for t in 'Section' 'Canvas scene' 'Canvas view' 'Breakpoint mode' 'Compare' 'Inspector' 'Analysis card' 'Gallery' 'Drawer'; do grep -c "^| \*\*$t" docs/reference/references/glossary.md; done; grep '^| \*\*Mode\*\*' docs/reference/references/glossary.md | grep -c -i 'breakpoint'; grep -c '^| ' docs/reference/references/glossary.md
# U2-5
for n in 'this.section' 'canvas-scene' 'seg-example' 'an-card' 'this.view' 'colorMode'; do grep -c "$n" docs/reference/references/glossary.md; done
# U2-6
G=docs/reference/references/glossary.md; grep -c 'frame is invariant and never persisted' $G; awk '$2=="**Section**" && /never persisted/ {n++} END{print n+0}' $G; grep -c -w section src/ui/persist.js; grep -c 'live control' $G; grep -c 'ExampleCard' $G; grep -c 'exampleArtifacts(view)' src/ui/app.js; grep -c 'typeExampleCard(view)' src/ui/sections/typography.js; grep -c 'geomExampleCard(view)' src/ui/sections/geometry.js; grep -c "section's \x60renderLeftPane\x60 body" $G; grep -c 'AnalysisCards' $G; grep -c 'this.typeAnalysisCards(view)' src/ui/app.js; grep -c 'this.geomAnalysisCards(view)' src/ui/app.js
# P3
tail -1 <(node test/repo/branding.mjs)
~~~

~~~out ran
441a8638
5
2
3
0
1
1
1
1
ok
docs/reference/references/spec-draft.md:0
docs/reference/rubrics/acceptance-criteria.md:0
docs/reference/rubrics/quality-rubric.md:0
0
1
1
1
1
1
1
1
1
1
1
42
2
1
1
1
2
1
0
1
0
0
1
3
2
2
0
1
1
1
branding: clean (741 files scanned)
~~~

## Negative controls

Run in a throwaway clone under the job tmp dir, each row's command from the `~~~sh ran` block, at the sha the plan names.

| Id | Control run | Printed | Plan says |
|---|---|---|---|
| U2-1 | at 282fca8d | `0 0 0 5 1` | `0`, `0`, `0`, `5`, `1` |
| U2-2 | at 282fca8d | `0 0 0 ok` | `0`, `0`, `0`, `ok` |
| U2-3 | at 282fca8d | `spec-draft.md:2`, `acceptance-criteria.md:1`, `quality-rubric.md:1`, `1` | `2`, `1`, `1`, `1` |
| U2-4 | at 282fca8d | nine `0`s, `0`, `33` | nine `0`s, `0`, `33` |
| U2-5 | at 282fca8d | six `0`s | six `0`s |
| U2-6 | at be13a210 | `1 1 0 1 0 3 2 2 1 0 1 1` | `1`, `1`, `0`, `1`, `0`, `3`, `2`, `2`, `1`, `0`, `1`, `1` |
| P8 (a) | the handoff at be13a210, P8 run at e7058994 | `H=e7058994`, `NO-RAN`, `0 0 0 0 0`, `diff 0` | same |
| P8 (b) | fixture handoff (U2-1 to U2-5 and P3 as the committed Ran table's cells: U2-1 `2 2 3 0 1`, U2-5 `1 1 1 1 1 2`, `736 files scanned`) at e7058994 | `1a2 > 5`, `3d3 < 2`, `30d29 < 1`, `32c31,32` (`< branding: clean (736 files scanned)` against `> 1` and `> branding: clean (738 files scanned)`), `diff 1` | four hunks, `diff 1` |
