# Handoff prompt-audit U7 · #758 slice C skills

Builder, pass 1. Branch `unit/pa-U7` @ 7e33c4c4 (cut from `plan/prompt-audit` at f6cd69cb); this handoff is committed on top.

## Files

Eleven prompt files, all inside U7's wall: `maintaining-brand-kit-mcp/{SKILL.md,references/foundations.md,references/best-practices.md}`, `project-docs/SKILL.md`, `type-scale/{SKILL.md,references/foundations.md,references/best-practices.md}`, `shipping-changes/{SKILL.md,references/rubric.md}`, `ultimate-tokens-brand-voice/SKILL.md`, `maintaining-figma-plugins/SKILL.md`. No source, test, script or generated file changed.

## Ran

| Gate | Result |
|---|---|
| `npm test` at 7e33c4c4 | 🟢 `all 53 test files passed`, exit 0, `git status --short` shows only the eleven edited files before commit (no generated drift) |
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

| Id | Fate | Note |
|---|---|---|
| SC1 | applied | `brandKit` and `downloadBrandKitMcp()` homes, no line number |
| SC2 | applied | `list_palettes (16)`, read from `test/mcp/brand-kit.mjs` |
| SC3 | applied | six `:NNN` anchors across `foundations.md` and `best-practices.md` now name the symbol and file |
| SC4 | applied | ADR row points at `decision-records.md`; plans row at `.sdlc/plans/`; roadmap row at `.sdlc/roadmap.md`; `docs/task/` stays "not present yet" (true) |
| SC5 | applied | routes now `/file-feature`, `/file-bug`, the sdlc Orchestrator, the `make-doc` skill |
| SC6 | applied | the audit table has no row the plan's SC6 maps to unambiguously; taken as the second anchor of the MCP row (`downloadBrandKitMcp()`), fixed with SC1 |
| SC7 | applied | `make11` to `makeVoices` in the foundations row of type-scale |
| SC8 | applied | `ensureTypeFonts()` home is `src/ui/app-helpers.mjs` in SKILL.md and `foundations.md`, bold removed |
| SC9 | applied | rubric H5 grades `build-test`, `panda-smoke`, `corpus-contrast`, `sweeps`; the SKILL.md description says the same |
| SC10 | applied | citation removed, the sentence keeps the rule |
| SC11 | applied | `libraryMode` paragraph states the rule without PR ids; `priorLibraryUpliftVM` and the persisted key kept |
| SC12 | applied | STYLES dates and PR ids dropped, the fontWeight/fontStyle reason kept |
| SC13 | applied | collection rename trail removed; the "Color Semantic" alias in the plugin table removed with it |
| SC14 | applied | role table is "GENERATED ... never hand-edit inside the markers" |
| SC15 | applied | `parity` gate parenthetical removed; the FULL-role-object rule stays |
| SC16 | applied | run id and timings replaced by "about four to five minutes"; `#564` dropped; the concurrent-edit anecdote dropped |
| SC17 | applied | `node_modules` rule stated as `.gitignore`'s bare `node_modules` line; the foundations.md pointer row lost "exit-194 anecdote" |
| SC18 | applied | `TKT-0012` dropped from the rename-map rule |
| SC19 | applied | "since 2026-07-13" dropped from the size-table rule |
| SC20 | applied | `ranksFor` clause without date or retired `STEPS_*` names; "since 2026-07-16" dropped from the PROSE clause |
| SC21 | applied | `#446, 2026-08-14` dropped, the `FONT_FALLBACKS` condition kept |
| SC22 | applied | dangling memory pointer replaced by `shipping-changes`'s `references/foundations.md` in SKILL.md and `best-practices.md` |
| SC23 | applied | rename rule stated once, no incident, no caps |
| SC24 | applied | brand-voice anecdote states the drift class without numbers |
| SC25 | applied | fact-sheet citation `Context is memory` folded into SC10 |
| SC26 | applied | see SC23 |
| SC27 | applied | `/docs-alignment` clause replaced by "offer to move it into `docs/spec/`" |

SC28 (Low, Q4 default fold): the project-docs frontmatter names now match the body (`make-doc` skill, `/file-feature`, `/file-bug`, the sdlc Orchestrator).

## Left out

| Item | Why |
|---|---|
| dated asides still in `type-scale/references/best-practices.md` and `weight-ladders-and-labels.md`, and `foundations.md` line 50 onward | outside SC1 to SC27; only the pointer and home lines those files carry were edited |
| `maintaining-figma-plugins/references/*` PR archaeology | audit Low flag, not in scope |
| SC28's neighbours (`shipping-changes` frontmatter is fixed under SC9; the other Low flags) | Low, not in scope |

## Questions for the orchestrator

The plan's SC numbering does not line up with the evidence table's row order (34 rows; the plan's SC6 and SC11 to SC27 boundaries shift by one). I assigned fates by finding, not by row position. SC6, SC25 and SC26 rows above are my best mapping; correct them if P5's id list means otherwise.
