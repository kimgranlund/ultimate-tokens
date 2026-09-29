FAIL: prompt-audit U7 (#758), review pass 1. U7-1 to U7-6 are green with controls that bite, and the wall, P6 and the em-dash gate hold. Two things block: the rewritten `libraryMode` paragraph makes a new claim that is false for two of the four prune sites, and the handoff's findings table gives 17 of the 27 SC ids to the wrong finding and 2 more are only half right.

Reviewer: reviewer-l2, fresh context. Worktree `.worktrees/pa-U7`, branch `unit/pa-U7`, head `acce34c2` (code `7e33c4c4`). Unit base `f6cd69cb` (`plan/prompt-audit`). `npm test` was not rerun; the builder recorded 53/53. No source was edited.

## Must fix

| # | Severity | Where | What | Fix |
|---|---|---|---|---|
| 1 | 🔴 Medium | `.claude/skills/maintaining-figma-plugins/SKILL.md` line 72 | New text says "Every prune on the apply path reads the resolved flag", then lists `applyBundle` and `applyStylePlans`. `figma/plugin/code.js` shows that only `applyFloatPlans` and `applyFontPrimitivesModes` resolve the flag: they use `let useLibrary = opts.libraryMode`, then the ask, then the `priorLibraryUpliftVM` fallback. `applyBundle` and `applyStylePlans` both read `const libraryMode = opts.libraryMode === true;` directly, so an `undefined` value falls through to the classic prune. The base text said "is now guarded", which was true. The paragraph's own later sentence limits the fallback to the two float/font functions, so the new sentence also contradicts it. | Say what the code does, for example "Every prune on the apply path is guarded by the flag", and keep the later sentence about which two functions fall back. |
| 2 | 🔴 Medium | `.sdlc/handoffs/prompt-audit-U7.md` Findings table | The SC ids do not follow the evidence file's numbering (see the SC mapping ruling below). SC1 to SC5, SC14, SC15 and SC27 are right. SC13 and SC16 are half right. The other 17 rows name the wrong finding, and SC25 and SC26 are filler that point at other rows. P5's two greps pass (27 ids, 27 `applied` rows), so the error is invisible to the gate, but the record is still wrong. | Relabel the rows as the table below says. Every fate is still `applied`: all 27 findings are applied in the diff. |

## Should fix (Low)

| # | Where | What |
|---|---|---|
| 3 | `maintaining-figma-plugins/SKILL.md` lines 41 and 43 | The SC14 rewrite ends with "never hand-edit inside the markers", and the next sentence says "Never hand-edit inside the GENERATED markers; regenerate instead". The rule is now stated twice in a row. Drop the added clause. |
| 4 | handoff | Three Low rows were applied without their own rows. SC29 is the shipping frontmatter's legs; the handoff's Left-out table lists it as "fixed under SC9", which contradicts listing it as left out. SC32 is the `vmsyntax` incident date. SC33 is project-docs' "migrated ... on 2026-07-12" aside. All three edits are correct and inside the wall. Record them the way SC28 is recorded, as Low rows applied beyond scope. |
| 5 | `shipping-changes/SKILL.md` frontmatter | The description line now runs to 115 characters where its neighbours wrap at about 75. This is cosmetic: YAML folds it the same way. |

## SC mapping ruling

The authority is the evidence file's own header, at `.sdlc/plans/prompt-audit-evidence.md` line 7: "slice C's rows SC1 to SC34" are numbered in table order. The slice C Findings table (lines 536 to 569) has 34 rows. Rows 1 to 9 are High and rows 10 to 27 are Medium, which matches the summary's "9 High, 18 Medium". Rows 28 to 34 are Low. The plan's P5 list "SC1 to SC27" is therefore exactly the High and Medium set, and its Not-in-scope list "SC28 to SC34" (routing frontmatter, the shipping frontmatter, caps, `vmsyntax`, figma references, the migration aside, two dates) matches rows 28 to 34 one for one.

The off-by-one is in the plan's Re-verification table, not in P5:
- It labels make11 as "SC7", ensureTypeFonts as "SC8", H5 as "SC9" and Context is memory as "SC10". In table order these are SC6, SC7, SC8 and SC9.
- Its history range "SC11 to SC26" should read SC10 to SC26.
- The stray "SC6" in the T1/T2 row is make11 itself.
- SC1 to SC5 and the SC4/SC5/SC27 grouping are right.

The Orchestrator should correct those Re-verification labels in the plan. The builder should relabel the handoff:

| Id (table order) | Evidence row (finding) | Handoff row that carries it now | Handoff row with this id describes it |
|---|---|---|---|
| SC1 | brand-kit SKILL.md anchors `model.mjs:237`, `app.js:6565` | SC1 | 🟢 |
| SC2 | `list_palettes (8)` to 16 | SC2 | 🟢 |
| SC3 | six `:NNN` anchors in foundations.md and best-practices.md | SC3 | 🟢 |
| SC4 | project-docs "not present yet" homes | SC4 | 🟢 |
| SC5 | project-docs routes `/feature`, `/bug-report`, `/build`, `/doc-forge` | SC5 | 🟢 |
| SC6 | type-scale `make11` | SC7 | 🔴 SC6 row describes a non-finding (the MCP second anchor, part of SC1) |
| SC7 | `ensureTypeFonts()` home | SC8 | 🔴 |
| SC8 | rubric H5 three legs | SC9 | 🔴 |
| SC9 | brand-voice "Context is memory" | SC10 | 🔴 |
| SC10 | figma `libraryMode` paragraph | SC11 | 🔴 |
| SC11 | figma STYLES dates and PRs | SC12 | 🔴 |
| SC12 | figma Geometry collection rename trail | SC13 (first half) | 🔴 (its SC12 row is STYLES) |
| SC13 | figma "was Color Semantic" | SC13 (second half) | 🟡 |
| SC14 | figma TKT-0019 GENERATED clause | SC14 | 🟢 |
| SC15 | figma TKT-0027 parity parenthetical | SC15 | 🟢 |
| SC16 | shipping run-id timing | SC16 (first clause) | 🟡 |
| SC17 | shipping `#564` | SC16 (second clause) | 🔴 |
| SC18 | shipping `-u` reddening anecdote | SC16 (third clause) | 🔴 |
| SC19 | shipping `node_modules` exit-194 | SC17 | 🔴 |
| SC20 | shipping `TKT-0012` | SC18 | 🔴 |
| SC21 | type-scale "since 2026-07-13" | SC19 | 🔴 |
| SC22 | type-scale `ranksFor` / `STEPS_*` / PROSE date | SC20 | 🔴 |
| SC23 | type-scale `#446, 2026-08-14` | SC21 | 🔴 |
| SC24 | type-scale smoke-is-Chrome-only memory (both files) | SC22 | 🔴 |
| SC25 | type-scale rename rule (TKT-0016, EVERY) | SC23 | 🔴 SC25 row is a duplicate of SC9 |
| SC26 | brand-voice 53 to 59 anecdote | SC24 | 🔴 SC26 row says "see SC23" |
| SC27 | project-docs `/docs-alignment` | SC27 | 🟢 |

Content check: each of the 27 findings above was applied in `7e33c4c4`. I read every hunk against the evidence row. The only defect is the new claim in finding 1.

## Criteria

Positive commands ran in the worktree at `acce34c2`. The negative controls ran the same commands on a `git archive f6cd69cb` snapshot under the reviewer's scratch directory. Backticks in the needles were typed literally.

| Id | Result | Head output | Negative control (at f6cd69cb) | Notes |
|---|---|---|---|---|
| U7-1 | 🟢 | `0, 1, 1, 1, 0, 1, 1, 1` | `3, 0, 0, 0, 1, 1, 1, 1`, plan expects `3, 0, 0, 0, 1` | `brandKit` defined at `src/ui/model.mjs` 689, `geometryScale` at 53, `downloadBrandKitMcp() {` at `app.js` 2457; `test/mcp/brand-kit.mjs` asserts `pal.length === 16` |
| U7-2 | 🟢 | `1, 1, 1, 1, 0, 2, absent` | `3, 0, 0, 0, 5, 0` | `docs/adr` and `docs/task` absent; `.sdlc/plans/archive`, `docs/plan/archive`, `.sdlc/roadmap.md`, `.sdlc/board.md` exist; `decision-records.md` opens at `## ADR-001` (27 ADR headings) |
| U7-3 | 🟢 | `0, 6, [1 1], [0 0], 1, 1` | `1, 5, [0 0], [1 1], 1, 1` | `export function makeVoices` in `src/engine/type.mjs`; `export function ensureTypeFonts` in `src/ui/app-helpers.mjs`; bold removed around the foundations.md symbol; `make11`, `STEPS_3`, `STEPS_UI` have 0 hits under `src/` and `test/` |
| U7-4 | 🟢 | `0, 1 1 1 1, 4, 0` | `1, 0 0 0 0, 4, 6` | `ci.yml` has a fifth top-level job, `deploy`, but it runs only on push to main (`if: github.event_name == 'push'`), so "four PR jobs" holds. `.gitignore` line 1 is the bare `node_modules`. The "CI cannot see" line matches shipping foundations.md section 4 |
| U7-5 | 🟢 on needles, 🔴 on claim | `0, 0, 1, 1, 6` | `2, 19, 1, 1, 6` | Needles pass, but the rewrite adds the false "reads the resolved flag" sentence (finding 1). `ultimate-tokens-library-mode-v1` and `priorLibraryUpliftVM` are kept |
| U7-6 | 🟢 | `0, 1, 15` | `4, 1, 15` | `RENAME_MAPS` and `CURRENT_SCHEMA_VERSION` present in `src/ui/persist.js` |
| P4 (U7 wall) | 🟢 | `git diff --name-only f6cd69cb..acce34c2` through the U7 file list plus `.sdlc/*/prompt-audit*`: `0` outside | fixture `src/engine/type.mjs` + `.claude/skills/color-math/SKILL.md` through the same filter prints `2` | 11 skill files + the handoff |
| P5 | 🟢 on greps, 🔴 on content | each of SC1 to SC27 prints `1`; the ERE count prints `27` | a handoff missing one id prints `0` on that id (the plan's own control, not rerun) | ids misassigned, see finding 2 |
| P6 (U7 share) | 🟢 | added `0`, removed `14` | fixture `+the rule (TKT-0010)` prints `1` | Added lines that match `#NNN`, `TKT-`, a date or `ADR-0`: one, `ADR-001 onward` in the project-docs home row. That is a document home, not a history id, and P6's regex does not match it |
| P3 (U7 share) | 🟢 | added lines with U+2014: `0`; `em-dash: clean (816 files scanned)`; `branding: clean (808 files scanned)` | fixture `+a line <U+2014> here` through the same perl filter prints `1` | |
| board ids | 🟢 | `python3 .../sdlc/0.4.0/scripts/board.py ids .sdlc` exit `0` with the `Id`-headed SC table in place | not run | `SC` is not a gated prefix |

## Claims checked against source

| Claim in the rewrite | Source | Holds |
|---|---|---|
| `brandKit(doc, systems)` in `src/ui/model.mjs`; `$schema` interpolated by `brandKit` there | model.mjs 689 and 691 | 🟢 |
| `geometryScale` in `src/ui/model.mjs` wraps `geomScale` with `{ typeScale }` | model.mjs 53 | 🟢 |
| `downloadBrandKitMcp()` in `src/ui/app.js` | app.js 2457 | 🟢 |
| `list_palettes (16)` | `test/mcp/brand-kit.mjs` 190 | 🟢 |
| `test/mcp/brand-kit.mjs` pins `MCP_BRAND_KIT_VERSION` against `SERVER.version` | brand-kit.mjs 29 | 🟢 |
| project-docs routes `/file-feature`, `/file-bug`, the sdlc Orchestrator, the make-doc skill | `.claude/CLAUDE.md` SDLC section; installed `docs:make-doc` | 🟢 |
| `makeVoices` is the second layer; `ranksFor` picks by `SIZES` length | type.mjs 94, 51 | 🟢 |
| `ensureTypeFonts()` in `src/ui/app-helpers.mjs` | app-helpers.mjs 245 | 🟢 |
| H5's four jobs | ci.yml `build-test`, `panda-smoke`, `corpus-contrast`, `sweeps` | 🟢 |
| figma: mode prune in `applyFontPrimitivesModes` reads the same resolved decision, not a raw `opts.libraryMode === true` | code.js 974 to 976, 1099 to 1107 | 🟢 |
| figma: "Every prune on the apply path reads the resolved flag" | code.js 1249 (`applyStylePlans`), 1464 (`applyBundle`): `opts.libraryMode === true` | 🔴 finding 1 |

verdict: 🔴
