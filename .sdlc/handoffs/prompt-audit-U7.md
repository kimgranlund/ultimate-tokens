# Handoff prompt-audit U7 · #758 slice C skills

Builder, pass 2 round 2, head 794f7342 (pass 2 round 1 was 8a230803, reviewed FAIL in `.sdlc/verdicts/prompt-audit-U7-review-p2.md` at c547d584; pass 1 was 8e8aa3ad, verified 🔴 in `.sdlc/verdicts/prompt-audit-U7.md`; brief `.sdlc/plans/prompt-audit-U7-rediagnosis.md`).

Written 2026-09-29. The head named above is the pass 2 skill head, measured with `git rev-parse --short=8 HEAD` after the skill commit; this handoff is committed on top of it.

## Branch

`unit/pa-U7`, worktree `.worktrees/pa-U7`. Pass 1 commits `7e33c4c4`, `cc924fac` on B = `13346c1a`. Pass 2: `origin/plan/prompt-audit` (revision 8, `e0ec78ad`) merged at `405f5d89` (no `.sdlc/board.md` in the merge), then the skill commit `8a230803`; round 2 merged the review record at `cbbd0b8a` (already up to date) and committed the MCP foundations fix `794f7342`. `npm test` green at `794f7342`, tree clean after (Gates).

## What pass 2 changed

| Item | File | Change | Fact it rests on |
|---|---|---|---|
| F1 | this handoff | the Low rows SC28 to SC34 are Findings rows with their fate, labelled by evidence line `535+n`; every SC row quotes a span from its own evidence line; the Left-out rows that mislabelled SC31 and called it out of scope are gone | `awk 'NR>=536 && NR<=569' .sdlc/plans/prompt-audit-evidence.md`: line 566 is the `vmsyntax` row (SC31), line 567 the figma references row (SC32); U7-7 and U7-8 below |
| F2 | `maintaining-brand-kit-mcp/references/foundations.md` shape block and §5 | round 1 (`8a230803`): `typed` gone from both geometry shapes; `categories: {15 voices}`; type adds `weights`; geometry adds `radiusDefault`, `rampContrast`, `ramp`, `insets`, `gaps`, `borders`, `focus`; the kit top level adds `icons`, `motion`, `constants`, `controls`; §5's `seven voices from make7` list is now the fifteen `makeVoices` voices with their steps; `buildSize` rows carry `paddingNarrow`/`paddingWide`/`…Compact`, not `padding`/`edgePadding`; radii are `none, xs, sm, md, lg, xl, full`; the centering law names `paddingNarrow`. Round 1 claimed every key list matched `brandKit` without checking palettes or step keys; the review found three misses. Round 2 (`794f7342`): palettes gain `group` and `prime` (seven tones, each `{ hex, oklch }`); the step shape gains `singleLineHeight` on the box voices `Kicker`, `UI-control`, `UI-widget`; the resolvers are named as `brandKit` calls them, `typeScaleFor(doc, "base")` and `geomScaleFor(doc, "base")`, in the shape block, the Note, and §5 | `src/ui/model.mjs` lines 742 and 743 call `typeScaleFor(doc, "base")` and `geomScaleFor(doc, "base")`; `src/engine/type.mjs` line 268 adds `singleLineHeight` for `p.box` voices. Every documented key list diffed against a live dump: `node /Users/kimba/.claude/jobs/8c58a81c/tmp/u7p2/keys.mjs <worktree>` (job scratch, not committed) compares fifteen lists (top level, palette, ramp cell, prime, prime cell, type, voice count, plain step, box step, box voices, geometry, sizes, size row, radii, roles per palette) as the file states them with `brandKit(defaultDocument())` and prints `ok` fifteen times, then `diffs 0`; `test/mcp/brand-kit.mjs` asserts `geo.sizes.MD.paddingNarrow === (geo.sizes.MD.height - geo.sizes.MD.icon) / 2` and `!("typed" in geo)` |
| F3 | `maintaining-figma-plugins/SKILL.md` libraryMode paragraph | a non-empty reconcile report asks under `askIfUndecided` and otherwise reads `false`; `priorLibraryUpliftVM` runs only when the report is empty | `figma/plugin/code.js`: `if (report.aliases.length \|\| report.deprecates.length) useLibrary = opts.askIfUndecided ? await confirmLibraryMode(...) : false;` then `else useLibrary = priorLibraryUpliftVM(...)`, at both sites (`grep -c 'else useLibrary = priorLibraryUpliftVM'` prints `2`) |
| F4 | same file, sibling weights | `bodyClassSiblingDefaults` for the voices in `BODY_CLASS_VOICES` (`src/engine/type.mjs`), in the paren shape U9's scanner reads | `export const BODY_CLASS_VOICES = new Set(["Lead", "Body", "Body-mono", "Label", "Label-mono", "Tiny", "Tiny-mono", "UI-control", "UI-widget"])` |
| F5 | `project-docs/SKILL.md` Now / Next / Later row | no horizons document exists, report horizons as absent; `.sdlc/roadmap.md` is a generated open-issue snapshot, cited for what is open; no second `not present yet` | `.sdlc/roadmap.md` frontmatter `status: generated`, `inputs: gh issue list --state open ...` |
| F6 | this handoff, Questions | the stale relabelling question is replaced by its resolution | revision 7 (`bee7574d`) relabelled the Re-verification table; U7-12 |

No source, test, script or generated file changed in pass 2 or its round 2.

## Gates

| Gate | Result |
|---|---|
| `npm test` at `794f7342` | 🟢 `✓ all 53 test files passed`, `exit 0`; `git status --short` after shows only this uncommitted handoff (no generated drift) |
| `node test/repo/branding.mjs` | 🟢 `branding: clean (812 files scanned)` |
| `node test/repo/em-dash.mjs` | 🟢 `em-dash: clean (820 files scanned)` |

## Criteria

Commands ran in the worktree at 8a230803 (U7-9 and the gates re-run at 794f7342) with `S=.claude/skills`, `E=.sdlc/plans/prompt-audit-evidence.md`, `H=.sdlc/handoffs/prompt-audit-U7.md`, `B=13346c1a`. Controls on edited files ran on copies under the job scratch directory, never in the worktree; controls "at 8e8aa3ad" read `git show 8e8aa3ad:<path>`.

| Id | Result | Head output | Negative control |
|---|---|---|---|
| U7-1 | 🟢 | `0`, `1`, `1`, `1`, `0`, `1`, `1`, `1` | pass 1 record: at B `3`, `0`, `0`, `0`, `1` (files unchanged in pass 2) |
| U7-2 | 🟢 | `1`, `1`, `1`, `1`, `0`, `2`, `absent` | pass 1 record: at B `3`, `0`, `0`, `0`, `5`, `0`; the U7-11 control below reds its first leg to `2` |
| U7-3 | 🟢 | `0`, `6`, `SKILL.md:1` `foundations.md:1`, `SKILL.md:0` `best-practices.md:0`, `1`, `1` | pass 1 record: at B `1`, `5`, `0` and `0`, `1` and `1` |
| U7-4 | 🟢 | `0`, `1 1 1 1`, `4`, `0` | pass 1 record: at B `1`, `0 0 0 0`, `4`, `6` |
| U7-5 | 🟢 | `0`, `0`, `1`, `1`, `6` | pass 1 record: at B `2`, `19` |
| U7-6 | 🟢 | `0`, `1`, `15` | pass 1 record: at B `4` |
| U7-7 | 🟢 | `1`, `1`, then nothing | the handoff with the SC31 and SC32 ids swapped prints `NOMATCH SC31` and `NOMATCH SC32`; the handoff at 8e8aa3ad prints the ten `NOMATCH` and seven `MISSING` lines the plan lists. A first draft of the SC31 note carried bare `0` and `1` spans, which let the swapped SC32 row match line 567 and the control printed only `NOMATCH SC31`; the note now spells the numbers, and the control prints both |
| U7-8 | 🟢 | `0 0 1 0 6 0 1`, then `1` seven times, then `0`, measured at `794f7342` against the plan at `e50b99b3`, whose SC29 needle is `build · test` | SC31 moved to `left out, Low` in a copy: its applied grep prints `0` while the tree still prints `0` for `real incident 2026-06-17`; the SC29 needle prints `1` at `f6cd69cb` and `0` at 8e8aa3ad |
| U7-9 | 🟢 | `0`, `0`, `1`, `15 false` at `794f7342`, against the plan at `e50b99b3`; the criterion text (shape blocks match `brandKit`) holds by the F2 key diff, `diffs 0` | the plan's control, `sed '18s/$/ typed:true/'` on the file at c547d584, prints `1` on the first grep; the same append on line 19 (the geometry line) at `794f7342` prints `1`; at 8e8aa3ad: `2`, `1` |
| U7-10 | 🟢 | `1`, `2`, `0`, `1`, `1` | the plan's `sed` on a copy: third grep `1`, fourth `0`; at 8e8aa3ad: first `0`, third `1` |
| U7-11 | 🟢 | `1`, `1`, `1`, `1` | the row rewritten as `not present yet` in a copy: second grep `2`, first `0`; at 8e8aa3ad: first `0` |
| U7-12 | 🟢 | `0`, `1`, measured against the plan at `c0e7c07b` (`origin/plan/prompt-audit`), whose second leg is anchored to the Re-verification row. The cell's `\|` is the table escape for a literal pipe, so the command run is `grep -c '^| T1, T2, SC6 (make11) |'`. Typed with the backslashes left in, it prints `347` (the plan's line count) on this host, where `grep` is ugrep 7.8.4 and a BRE `\|` is alternation | at 8e8aa3ad the first leg prints `1`; the plan before `bee7574d` (`bee7574d~1`) prints `0` on the second leg |
| P1 | 🟢 | `✓ all 53 test files passed`, TESTS `53`, `test/run.mjs` changed `0`, tree `0` besides this handoff, `ok    tests: baseline 53, test/run.mjs TESTS 53` | pass 1 record: the scrim control reds with `exit 1` |
| P3 | 🟢 | `branding: clean (812 files scanned)`, `em-dash: clean (820 files scanned)`, `exit 0`, added-line U+2014 `0` | pass 1 record: a decision-records copy and a glyph line each red with `exit 1` |
| P4 | 🟢 | `0`, `0`, `0`; U7's own files since the unit base `f6cd69cb` are the eleven skill files and this handoff | pass 1 record: the six-name fixture prints `3` |
| P5 | 🟢 | SC1 to SC27 each `1`; ERE fate count `27` (the seven `applied, Low` and `left out, Low` rows are not counted) | pass 1 record: the `SC14` row cut prints `0` and `26` |
| P6 | 🟢 | U7 share over its six skill directories: added `0`, removed `14` | pass 1 record: `+the rule (TKT-0010)` prints `1` |

## Findings

Ids are positional: SCn is line `535+n` of `.sdlc/plans/prompt-audit-evidence.md` (slice C runs from line 536 to 569). Every Note quotes at least one span verbatim from that line; U7-7 checks it. SC1 to SC27 are High or Medium; SC28 to SC34 are Low, with the fates `applied, Low` and `left out, Low`, which P5's ERE does not count.

| Id | Fate | Note |
|---|---|---|
| SC1 | applied | brand-kit `brandKit` and `downloadBrandKitMcp()` anchors, homes named without a line |
| SC2 | applied | `list_palettes (8)` to `(16)`, read from `test/mcp/brand-kit.mjs` |
| SC3 | applied | six `:NNN` anchors in `foundations.md` and `best-practices.md` now name symbol and file |
| SC4 | applied | project-docs homes: ADRs in `decision-records.md`, plans in `.sdlc/plans/`, roadmap in `.sdlc/roadmap.md` (pass 2: described as a generated open-issue snapshot, F5); `docs/task/` stays "not present yet" (true) |
| SC5 | applied | project-docs routes now `/file-feature`, `/file-bug`, the sdlc Orchestrator, the `make-doc` skill |
| SC6 | applied | type-scale `make11` to `makeVoices` |
| SC7 | applied | `ensureTypeFonts()` home is `src/ui/app-helpers.mjs` in SKILL.md and `foundations.md`, bold removed |
| SC8 | applied | rubric H5 grades `build-test`, `panda-smoke`, `corpus-contrast`, `sweeps` |
| SC9 | applied | brand-voice `Context is memory` citation removed |
| SC10 | applied | figma `libraryMode` paragraph states the rule without PR ids; guard sites stated as the source has them (pass 1 round 2); the empty-report condition of the fallback stated (pass 2, F3) |
| SC11 | applied | figma `maintaining-figma-plugins/SKILL.md:97,105-106` STYLES dates and PR ids dropped, the `fontWeight` reason kept |
| SC12 | applied | figma Geometry collection rename trail (`Breakpoints`) removed |
| SC13 | applied | figma `Color Semantic` alias removed |
| SC14 | applied | figma role table is `GENERATED`, never hand-edit inside the markers; history clause dropped |
| SC15 | applied | figma `parity` gate parenthetical dropped, the `FULL role objects` rule stays |
| SC16 | applied | `shipping-changes/SKILL.md:60-61` run id and timings replaced by "about four to five minutes" |
| SC17 | applied | shipping `#564` dropped, the stale-`dist/` reason kept |
| SC18 | applied | shipping `-u` anecdote clause dropped |
| SC19 | applied | shipping `node_modules` rule stated as `.gitignore`'s bare line; exit-194 wording gone from the text and the foundations pointer row |
| SC20 | applied | shipping `TKT-0012` dropped from the rename-map rule |
| SC21 | applied | type-scale "since 2026-07-13" dropped; the rule reads as a `hand-authored FIXED table` without a date |
| SC22 | applied | type-scale `ranksFor` clause without date or retired `STEPS_*` names; PROSE date dropped |
| SC23 | applied | type-scale `#446, 2026-08-14` dropped, the `FONT_FALLBACKS` condition kept |
| SC24 | applied | type-scale smoke-is-Chrome-only pointer replaced by `shipping-changes`'s `references/foundations.md` (SKILL.md and `best-practices.md`) |
| SC25 | applied | type-scale rename rule stated once beside its `FIGMA_MIGRATIONS` parallel, no incident, no caps |
| SC26 | applied | `ultimate-tokens-brand-voice/SKILL.md:25-26` anecdote states the drift class without numbers |
| SC27 | applied | project-docs `/docs-alignment` clause replaced by offering to move the content into `docs/spec/` |
| SC28 | applied, Low | `project-docs/SKILL.md:9-10 (frontmatter)` route names changed with the body (Q4 fold) |
| SC29 | applied, Low | shipping frontmatter `build · test · smoke` now names the four jobs |
| SC30 | left out, Low | type-scale caps `Do NOT hand-edit it.` kept; each has its reason beside it |
| SC31 | applied, Low | figma `vmsyntax` check keeps its reason, the incident date is gone (U7-8's needle for it prints zero at the head, one at B) |
| SC32 | left out, Low | `maintaining-figma-plugins/references/foundations.md:63-259` PR trail kept; on-demand reference, outside the eleven files |
| SC33 | applied, Low | project-docs `migrated from` aside dropped |
| SC34 | left out, Low | type-scale `ratified 2026-07-10` and `#264` asides kept |

## Left out

| Item | Why |
|---|---|
| dated asides in `type-scale/references/best-practices.md`, `weight-ladders-and-labels.md` and `foundations.md` beyond the home and pointer lines | outside SC1 to SC34 |
| `maintaining-brand-kit-mcp/references/foundations.md` §5 says the MCP test pins `font` equal to the UI-control size; `test/mcp/brand-kit.mjs` pins `geo.sizes.MD.font === 15` and that a Body override does not move it, not the equality | true at the defaults (`15` and `15`), not a finding, flagged for U9's pins |

## Questions for the orchestrator

None blocking. Review p2 (record head `cbbd0b8a`) raised two plan items, both fixed at `e50b99b3`: U7-8's SC29 needle is now `build · test`, which the base's line wrap could not hide, and U7-9's control no longer pins a line number. The §5 test-pin sentence flagged earlier is a U9 item. Pass 1 asked for the Re-verification table's SC labels to be corrected; revision 7 (`bee7574d`) relabelled it (make11 is SC6 there now), so that question is closed.
