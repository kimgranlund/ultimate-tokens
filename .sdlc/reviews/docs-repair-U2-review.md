FAIL: docs-repair U2 pass 1 at 0c6454b9 (code 4095ddbf). All five U2 rows are met, but one stale count survives in a file the unit edited.

Reviewer ran its own greps, plus negative controls in a throwaway copy of the B files (`5d8b1c30`) under the job tmp. No `npm test` (recorded green 50/50), no source edits.

| Rank | Finding | Where | Negative control |
|---|---|---|---|
| 1 medium | A stale count remains: `- **Complete:** ... 5 export formats; companion plugin ...`. The unit rewrote three other lines of this file, so this is the same class. P6's needle (`5 formats`) does not match `5 export formats`, so the plan's own grep misses it. Fix: `ten color export formats`. | `docs/reference/references/spec-draft.md:219` | `grep -rn -i '5 export formats' docs/reference` prints this line at head; after the fix it should print none |
| 2 low | The README-level identity is only half repaired: the body still says `The HCT Palette Generator removes all three` and the contract block `"title": "HCT Palette Generator"`, while the H1 and description now say Ultimate Tokens. The plan's step 1 names title, description, intent and contract strings, so this may be intended (Q2 kept `name:`); state it in the handoff or fix. | `docs/reference/SKILL.md:32`, `:86`, `:255` | `grep -c 'Ultimate Tokens' SKILL.md` is 2 at head, 0 at B, so U2-1 bites, but does not cover these lines |
| 3 info | The glossary Drawer row says `Colors (ten)`, which is true of the `FORMAT_GROUPS` tabs (css, oklch, tailwind, shadcn, panda, radix, figma, ui3, dtcg, json), but that set swaps `exportAll` for `figma`, unlike the ten named in SKILL.md and spec-draft. Not wrong; a reader may compare the two lists. | `docs/reference/references/glossary.md` Drawer row; `src/ui/overlays/drawer.js:39` | n/a |

## Criteria

| Id | Result | Evidence | Negative control |
|---|---|---|---|
| U2-1 | met | at head `2 2 3 0`, name line count `1` | B file: `0 0 0 5`, matches the plan |
| U2-2 | met | `1 1 1`, `docs/lld/app-shell.md` exists | B file: `0 0 0` |
| U2-3 | met | `0 0 0`, `0` for `5 formats` | B files: `2 1 1` for `eight color formats` (spec-draft, acceptance-criteria, quality-rubric) |
| U2-4 | met | nine rows present, Mode row names breakpoint, 42 table rows | B file: nine `0`, Mode `0`, 33 rows |
| U2-5 | met | `this.section` 1, `canvas-scene` 1, `seg-example` 1, `an-card` 1, `this.view` 2, `colorMode` 1 | B file: all `0` |
| P3 | met | 0 added lines with U+2014 in `0c6454b9` minus `5d8b1c30` | not run (count is 0 both ways) |

## Claims checked against source

| Claim | Source | Result |
|---|---|---|
| Ten formats: CSS, OKLCH, JSON, DTCG, UI3, Tailwind, shadcn, Panda, Radix, exportAll | `src/engine/exports.js:1381-1393` (`exportAll` returns css, oklch, json, dtcg, ui3, tailwind, shadcn, panda, radix, plus the aggregate), `:953` `exportPanda`, `:1289` `exportRadix` | true |
| `canvasView` values palettes, scrims, mapping, radix | `src/ui/app.js:99`, `sections/color.js:289-291` | true |
| Typography canvas segment specimen and tokens; Geometry controls and tokens | `typography.js:311`, `geometry.js:383-384` | true |
| Breakpoint mode via `typeMode` and `geomMode`, `compare` labelled `All`, only when modes exist | `typography.js:172`, `geometry.js:225`, `app.js:102,143` | true |
| Compare in Color is `colorMode === "both"`, drawn by `renderCompareArea`; mounts `.canvas-scene.compare` | `color.js:870,936,940` | true |
| Inspector is `renderRightPane`, tabs plus pinned `.seg-example`; Type and Geometry return their own | `app.js:1927-1952` | true |
| `.an-card` in left pane; `this.view === "gallery"`, `this.category`, `this.search`, Project, Import | `app.js:74,75,153,579`, gallery body | true |
| Drawer groups Colors 10, Typography 2, Geometry 3, Design System 2, Project 1 | `drawer.js:38-44` | true |
| Canvas modes, inspector tabs and breakpoint modes are kept distinct | see rows above | no conflation found |
| File map paths | `ui-plan.md`, `component-inventory.md`, `docs/lld/app-shell.md` exist | true |
