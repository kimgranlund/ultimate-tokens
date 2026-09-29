# Handoff prompt-audit U7 · #758 slice C skills

Builder, round 2 (review pass 1 failed on two points, both fixed below). Branch `unit/pa-U7` @ cc924fac (cut from `plan/prompt-audit` at f6cd69cb); this handoff is committed on top.

Round 2 changes: the `libraryMode` paragraph in `maintaining-figma-plugins/SKILL.md` now says every prune is guarded by the flag, and that `applyBundle` and `applyStylePlans` read the raw `opts.libraryMode === true` (`undefined` means the classic prune there) while `applyFloatPlans` and `applyFontPrimitivesModes` resolve it (checked against `figma/plugin/code.js`: `const libraryMode = opts.libraryMode === true` at the first two, `let useLibrary = opts.libraryMode` plus the ask and `priorLibraryUpliftVM` fallback at the other two). Low fixes: the doubled generated-markers sentence and the shipping frontmatter wrap. The SC table is relabelled in the evidence table's row order.

## Files

Eleven prompt files, all inside U7's wall: `maintaining-brand-kit-mcp/{SKILL.md,references/foundations.md,references/best-practices.md}`, `project-docs/SKILL.md`, `type-scale/{SKILL.md,references/foundations.md,references/best-practices.md}`, `shipping-changes/{SKILL.md,references/rubric.md}`, `ultimate-tokens-brand-voice/SKILL.md`, `maintaining-figma-plugins/SKILL.md`. No source, test, script or generated file changed.

## Ran

| Gate | Result |
|---|---|
| `npm test` at cc924fac | 🟢 `all 53 test files passed`, exit 0, `git status --short` shows only the eleven edited files before commit (no generated drift) |
| `node test/repo/branding.mjs` | 🟢 clean (807 files) |
| `node test/repo/em-dash.mjs` | 🟢 clean (815 files) |

## Criteria

Positive commands ran in the worktree; negative controls are the same needles run with `git grep -c` against `f6cd69cb` (line counts, so a needle can differ from the plan's "Today" file counts).

| Id | Result | Head output | Control output at f6cd69cb |
|---|---|---|---|
| U7-1 | 🟢 | anchors `0` files; `brandKit(doc, systems)` in `src/ui/model.mjs` `1`; `downloadBrandKitMcp()` in `src/ui/app.js` `1`; `list_palettes (16)` `1`; `(8)` `0`; test asserts `pal.length === 16` `1`; source homes `1`, `1` | anchor lines `8`, `list_palettes (8)` `1` |
| U7-2 | 🟢 | `not present yet` `1` (the `docs/task/` row); `decision-records.md` `1`; `.sdlc/roadmap.md` `1`; `.sdlc/plans/` `1`; retired routes `0`; `/file-bug` `2`; `docs/task` `absent` | `not present yet` `3`, retired-route lines `5` |
| U7-3 | 🟢 | `make11` `0`; `makeVoices` `6`; `ensureTypeFonts()` (in `src/ui/app-helpers.mjs` `1` and `1`; `smoke-is-Chrome-only` `0` and `0`; `export function makeVoices` `1`; `export function ensureTypeFonts` `1` | `make11` `1`, dated needles in SKILL.md `4` |
| U7-4 | 🟢 | `all three legs` `0`; the four job names in the rubric `1` each; `ci.yml` jobs `4`; SKILL.md history needles `0` | `all three legs` `1`; history needles `6` |
| U7-5 | 🟢 | `Context is memory` or `59` `0`; figma PR-trail needle `0`; `priorLibraryUpliftVM` in SKILL.md `1`; `ultimate-tokens-library-mode-v1` `1`; `priorLibraryUpliftVM` in `figma/plugin/code.js` `6` | brand-voice `1` line (two matches), figma `19` |
| U7-6 | 🟢 | dated needles in type-scale SKILL.md `0`; `RENAME_MAPS` in the skill `1`, in `src/ui/persist.js` present | `4` |

P6 for this unit: added lines carrying a ticket, PR or issue id `0`; removed lines `14`. The `:NNN` line pins, the `#638` pair and the `TKT-0008` aside in the MCP skill's references went with the anchors.

Pin names: the symbol homes are written in the shape U9's scanner reads (`` `sym` in `path` ``, or U7-3's `` `sym()` (in `path` ``); the palette count as `list_palettes (16)`; H5 names the four jobs.

## Findings

Ids follow the evidence table's row order (its header: SC1 to SC34). All 27 are High or Medium and applied.

| Id | Fate | Note |
|---|---|---|
| SC1 | applied | brand-kit `brandKit` and `downloadBrandKitMcp()` anchors, homes named without a line |
| SC2 | applied | `list_palettes (8)` to `(16)`, read from `test/mcp/brand-kit.mjs` |
| SC3 | applied | six `:NNN` anchors in `foundations.md` and `best-practices.md` now name symbol and file |
| SC4 | applied | project-docs homes: ADRs in `decision-records.md`, plans in `.sdlc/plans/`, roadmap in `.sdlc/roadmap.md`; `docs/task/` stays "not present yet" (true) |
| SC5 | applied | project-docs routes now `/file-feature`, `/file-bug`, the sdlc Orchestrator, the `make-doc` skill |
| SC6 | applied | type-scale `make11` to `makeVoices` |
| SC7 | applied | `ensureTypeFonts()` home is `src/ui/app-helpers.mjs` in SKILL.md and `foundations.md`, bold removed |
| SC8 | applied | rubric H5 grades `build-test`, `panda-smoke`, `corpus-contrast`, `sweeps` |
| SC9 | applied | brand-voice "Context is memory" citation removed |
| SC10 | applied | figma `libraryMode` paragraph states the rule without PR ids; guard sites stated as the source has them (round 2) |
| SC11 | applied | figma STYLES dates and PR ids dropped, the fontWeight/fontStyle reason kept |
| SC12 | applied | figma Geometry collection rename trail removed |
| SC13 | applied | figma "was Color Semantic" alias removed |
| SC14 | applied | figma role table is GENERATED, never hand-edit inside the markers; history clause dropped |
| SC15 | applied | figma `parity` gate parenthetical dropped, the FULL-role-object rule stays |
| SC16 | applied | shipping run id and timings replaced by "about four to five minutes" |
| SC17 | applied | shipping `#564` dropped, the stale-`dist/` reason kept |
| SC18 | applied | shipping `-u` anecdote clause dropped |
| SC19 | applied | shipping `node_modules` rule stated as `.gitignore`'s bare line; exit-194 wording gone from the text and the foundations pointer row |
| SC20 | applied | shipping `TKT-0012` dropped from the rename-map rule |
| SC21 | applied | type-scale "since 2026-07-13" dropped from the size-table rule |
| SC22 | applied | type-scale `ranksFor` clause without date or retired `STEPS_*` names; PROSE date dropped |
| SC23 | applied | type-scale `#446, 2026-08-14` dropped, the `FONT_FALLBACKS` condition kept |
| SC24 | applied | type-scale smoke-is-Chrome-only pointer replaced by `shipping-changes`'s `references/foundations.md` (SKILL.md and `best-practices.md`) |
| SC25 | applied | type-scale rename rule stated once, no incident, no caps |
| SC26 | applied | brand-voice 53 to 59 anecdote states the drift class without numbers |
| SC27 | applied | project-docs `/docs-alignment` clause replaced by offering to move the content into `docs/spec/` |

Low rows applied beyond scope, not counted in P5 (all inside the wall): SC28 (project-docs frontmatter names, Q4 fold), SC29 (shipping frontmatter names the four jobs), SC32 (the `vmsyntax` incident date), SC33 (project-docs "migrated ... on 2026-07-12" aside).

## Left out

| Item | Why |
|---|---|
| dated asides in `type-scale/references/best-practices.md`, `weight-ladders-and-labels.md` and `foundations.md` beyond the home and pointer lines | outside SC1 to SC27 |
| `maintaining-figma-plugins/references/*` PR archaeology | Low, SC31 |
| SC30, SC31, SC34 | Low, not in scope |

## Questions for the orchestrator

The plan's Re-verification table labels make11, ensureTypeFonts, H5 and Context-is-memory as SC7 to SC10 and the history range as SC11 to SC26; in the evidence table's order they are SC6 to SC9 and SC10 to SC26. The plan text needs the correction; this handoff follows the evidence table.
