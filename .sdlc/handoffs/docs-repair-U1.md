# Handoff U1 pass 2 · builder → verifier

| Field | Value |
|---|---|
| Branch | unit/dr-U1 @ 3d9faa56 |
| Base | 5d8b1c30 |
| Files | docs/reference/references/ui-plan.md (title, Revision B section table and gallery paragraph, the section 1 task list) |
| Ran | every row below at 3d9faa56 in `.worktrees/dr-U1`; `npm test` once after the edit: `✓ all 50 test files passed`, tree showed only the intended `ui-plan.md` change |
| Left out | no build, no smoke (no `node_modules`, owed at pre-land); negative controls not rerun |

## Review findings (961e0120)

| Finding | Fix | Source read |
|---|---|---|
| F1 Typography modes | row now says the canvas has a `typeSpecMode` segment of `specimen` or `tokens` plus `typeMode` breakpoint modes and `compare` (All); inspector tabs scale, fonts, specimen are `typeSegment` | `typography.js` `typeModeControl` and canvas header, `app.js` field comments |
| F2 Color views | row lists `canvasView` Palettes, Scrims, Mapping (semantic mapping table), Radix, the four `colorMode` values, `both` via `renderCompareArea` skipping Mapping, and the story inspector tab; the false "ramps table view" is gone | `color.js` canvas header segment ids, `isTable` |
| F3 T8 | line reads `10 formats (color), plus ...` (U6 pin c needle) | plan U6 paragraph |
| F4 tasks | T10 tune-type, T11 tune-geometry, T12 manage-modes, T13 compare added, T1 to T9 unrenumbered | |
| F5 gallery | names `this.category` (slug or `null`) as the categories view state and lazy per-category volumes | `app.js` `renderGallery`, `renderCategoryBody` |
| F6 pointers, Geometry segment | `type-scale` and `geometry-system` named for the engines; Geometry `geomSpecMode` controls or tokens and `renderLeftPane` named | `geometry.js` canvas header |
| F7 title | retitled `Ultimate Tokens: UI Plan` (the ruling Q2 is about the spec cell id; retitling is the safe reading, and it removes one dashed line) | |
| F8 figures | `docs/lld/app-shell.md` count is 2 (was misreported 1); the 28 existing dashed lines were all U+2014 and are now 27 after the title change | |

## Ran

| Id | Output at 3d9faa56 |
|---|---|
| U1-1 | `1`, `1`, Color `3`, Typography `7`, Geometry `7` |
| U1-2 | doc counts specimen `3`, typeSpecMode `1`, geomMode `1`, compare `3`, renderCompareArea `1`, renderTypeInspector `1`, renderGeomInspector `1`, radius `2` |
| U1-3 | gallery `11`, `categor` or `CATEGORY_INDEX` `4` |
| U1-4 | `0`, `2`, `1` |
| U1-5 | no `file:line` cite: `0` |
| U1-6 | `0`, `0`, `269` lines |
| P3 | `branding: clean (738 files scanned)`; added lines carrying U+2014: `0` |
| P4 | diff names only `ui-plan.md` and handoff files |
| P6 | stale-count grep `10` (U2's files), drawer colour formats 10 |
