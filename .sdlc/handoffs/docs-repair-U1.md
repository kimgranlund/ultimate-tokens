# Handoff U1 pass 1 · builder → verifier

| Field | Value |
|---|---|
| Branch | unit/dr-U1 @ 15c562ed |
| Base | 5d8b1c30 |
| Files | docs/reference/references/ui-plan.md (Revision B inserted before section 1; T8 line, T9 line and the export drawer heading in section 4 updated) |
| Ran | every row below at 15c562ed in `.worktrees/dr-U1`; `npm test` once: `✓ all 50 test files passed`, tree clean after (`git status --short` empty before the commit) |
| Left out | no build, no smoke (no `node_modules`; owed at pre-land); negative controls not rerun (the plan states them against the file at base) |

## Ran

| Id | Output at 15c562ed | At base |
|---|---|---|
| U1-1 | `1`, `1`, then Color `2`, Typography `3`, Geometry `3` | `0`, `0`, `0`, `0`, `0` |
| U1-2 | doc counts specimen, typeSpecMode, geomMode, compare, renderCompareArea, renderTypeInspector, renderGeomInspector, radius all `1`; source greps as the plan lists them, each 1 or more (read below) | all `0` |
| U1-3 | gallery `11`, `categor` or `CATEGORY_INDEX` `2`, `CATEGORY_INDEX` in `app.js` 4 | `9`, `0` |
| U1-4 | `0`, `1`, `1` | `2`, `0`, `0` |
| U1-5 | audit block not printed for this file (it cites no `file:line`): first command `0`, second `0` | not discovered, `0` |
| U1-6 | `Flip to` `0`, `scrollport` `0`, lines `260` | `0`, `0`, `227` |
| P6 | stale-count grep `10` (was 15 at base; the remaining 10 are U2's files), drawer colour formats 10 | `15` |
| P3 | `branding: clean (736 files scanned)`; added lines carrying U+2014: `0` (the file's 28 existing dashed lines are untouched) | |
| P4 | `git diff --name-only` names only `docs/reference/references/ui-plan.md` | |

## Where each id was read

| Id | Read in |
|---|---|
| `this.section`, `setSection`, `renderCenter`, the stash and restore of the Color viewport | `src/ui/app.js` |
| `renderGallery`, `renderHubBody`, `renderCategoryBody`, `CATEGORY_INDEX`, hub content (your sets, search, categories) | `src/ui/app.js` |
| `colorMode` values `system`/`light`/`dark`/`both`, `renderCompareArea` | `src/ui/app.js` (field), `src/ui/sections/color.js` |
| `specimen`, `typeSpecMode`, `renderTypeInspector` | `src/ui/sections/typography.js` |
| `geomMode`, `compare` (label All), `renderGeomInspector`, `radius` tab | `src/ui/sections/geometry.js` |
| ten color formats, groups | `FORMAT_GROUPS` in `src/ui/overlays/drawer.js` |

The revision cites by name only (no `file:line`), points at `docs/lld/app-shell.md` and the `building-editor-sections` skill for procedure, and states the persistence exception by pointer.
