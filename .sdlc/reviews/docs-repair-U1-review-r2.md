PASS: U1 round 2 fixes all eight round-1 findings. I rebuilt the section table from source and it matches, and every U1 and plan row measures as expected.

---
kind: verdict
plan: docs-repair
unit: U1
ticket: "#751"
branch: unit/dr-U1
base: 5d8b1c30
sha: 6e947a9a
grade: reviewer, fresh context
pass: 2
written: 2026-09-28
---

verdict: 🟢 PASS, two low wording notes (N1, N2) and one merge note for pre-land (N3)

Head `6e947a9a`, fix at `3d9faa56`, base `5d8b1c30`. I ran every command in `.worktrees/dr-U1` and made no source edits. For the negative control, I ran the same commands against `git show 5d8b1c30:docs/reference/references/ui-plan.md`. I did not run `npm test`; the handoff records it green 50/50.

## Rows

| Id | State | Evidence at 6e947a9a | Negative control (file at base 5d8b1c30) |
|---|---|---|---|
| U1-1 | 🟢 | `1`, `1`, Color `3`, Typography `7`, Geometry `7` | `0 0 0 0 0` |
| U1-2 | 🟢 | doc needles `3 1 1 3 1 1 1 2`, all 1 or more; source greps as in round 1 (`2 3 36 1 3 2 1 1`) | `0 0 0 0 0 0 0 0` |
| U1-3 | 🟢 | `11`, `4`; `CATEGORY_INDEX` in `app.js` `4` | `9`, `0` |
| U1-4 | 🟢 | `0`, `2`, `1` | `2`, `0`, `0` |
| U1-5 | 🟢 | the audit does not discover the file (no `=== ui-plan.md` block); `file:line` cites `0` | `0` (not discovered at base either) |
| U1-6 | 🟢 | `0`, `0`, `269` lines (under 330) | `0`, `0`, `227` |
| U6 pin (c) needle | 🟢 | `grep -c 'T8 export: *10 formats'` prints `1`; the drawer's Colors pairs, sliced before `"Typography"`, number `10` | `0` |
| P3 | 🟢 | `branding: clean (738 files scanned)`; U+2014 on added lines `0`; the file drops from `28` lines with U+2014 to `27` (the title) | the file at base has `28` |
| P4 | 🟢 | the diff names `ui-plan.md`, the handoff and the round-1 review only | a `src/` path would show in the name list |
| P6 | 🟢 | `10` (the rest belongs to U2), drawer Colors `10` | `15` at base per the plan |
| P7 | 🟢 | handoff head `3d9faa56`, `ancestor`, `0` tree files after it; `git status --short` `0` | the plan's `unit/dr-U3` at da8d48d1 control prints `9` |

## Round-1 findings

| # | State | Source re-derivation |
|---|---|---|
| F1 Typography | 🟢 fixed | canvas segment `typeSpecMode` `specimen \| tokens` (`typography.js:308-315`); breakpoint `typeMode` base, each mode, and `compare` labeled All only when a mode exists (`typography.js:166-172`); inspector `typeSegment` scale, fonts, specimen (`typography.js:605-613`, `app.js:147`) |
| F2 Color | 🟢 fixed | `canvasView` Palettes, Scrims, Mapping, Radix (`color.js:816-819`); Mapping is the only table (`color.js:867`); `both` goes through `renderCompareArea` and skips the table (`color.js:870`); a Story tab appears when there is a story (`app.js:1932-1940`) |
| F3 T8 needle | 🟢 fixed | `T8 export:           10 formats (color), plus ...` |
| F4 tasks | 🟢 fixed | T10 to T13 added (tune-type, tune-geometry, manage-modes, compare); T1 to T9 keep their numbers |
| F5 gallery | 🟢 fixed | `this.category` slug or `null` (`app.js:75`); volumes load lazily in `openCategory` (`app.js:830-840`) |
| F6 pointers | 🟢 fixed | `type-scale`, `geometry-system`, `geomSpecMode` `controls \| tokens` (`app.js:142`, `geometry.js:381-386`), `renderLeftPane` (`app.js:1531`) |
| F7 title | 🟢 fixed | `# Ultimate Tokens: UI Plan`; this follows Q2's "retitle only" |
| F8 handoff figures | 🟢 fixed | the handoff now says `2`, and says 28 lines with U+2014 dropping to 27; both match my counts |

## Notes, by severity

| # | Sev | Where | Note |
|---|---|---|---|
| N1 | low | `ui-plan.md:47` Color inspector cell | "a story tab when the open category has one" is loose. The tab reads `view.story`, which is `doc.story` (`model.mjs:1111`), so the story belongs to the document (one opened from a category preset). `this.category` is gallery state and is `null` in the editor. Better: "when the document carries a curated story" |
| N2 | low | `ui-plan.md:51-52` | "hides the specimen segment" is exact for Typography only. In Compare, each section hides its whole canvas segment: `specimen \| tokens` in Typography (`typography.js:308`) and `controls \| tokens` in Geometry (`geometry.js:381`) |
| N3 | info, pre-land | `ui-plan.md:1` | `git merge-tree` of `main` with `6e947a9a` now conflicts on one hunk here, the title: main's em-dash sweep wrote `HCT Palette Generator: UI Plan`. Take the branch's side. The rest of the file merges with `0` U+2014 lines. The other conflicting paths (CLAUDE.md, the section skill, baseline, app-shell, app.js, persist.js and the others) come from U3 and the base, not U1 |
