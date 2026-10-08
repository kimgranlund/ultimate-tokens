---
id: T-0033
title: "Docs, specs and skills: repair stale facts after T-0015/17/21/27"
type: chore           # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L2             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
Every skill, spec, reference, README, CHANGELOG and entry file states what the code does at main b8a849a1 (Maison ladder 27 cells x 16 fields, compound law ADR-033, compute layers ADR-034, persist schema 10, export schema 7, MCP brand-kit/7), with each claim verified against the code.

## Intent
- Do: fix every confirmed defect below, verifying each against the code before editing; re-run `node scripts/audit-citations.mjs` and `npm test`.
- Non-goals: moving or re-indexing documents (ticket docs-structure-sweep owns structure); product code.
- Done when: all items fixed or explicitly refuted with evidence in the report, `npm test` green.

## Context
Read-only audits ran 2026-10-08; confirmed defects (paths from repo root; skills live under `.claude/skills/` unless `plugin/`):

Skills
1. maintaining-brand-kit-mcp/references/best-practices.md:53-54 says seven voices; there are 15 (Display, Headline, Sub-heading, Title, Sub-title, Lead, Body, Body-mono, Label, Label-mono, Kicker, Tiny, Tiny-mono, UI-control, UI-widget).
2. maintaining-brand-kit-mcp/SKILL.md:65-67, references/foundations.md:141-142, references/best-practices.md:54-56: cell field list stops at radiusCard; add partHeight, partInset (16 fields).
3. geometry-system/SKILL.md:143-144 test group list lacks `compound-law`; :150-151 smoke also reads --control-part-height/--control-part-inset; :132-133 and references/best-practices.md:55-57 say a role-exposed field joins RESOLVER_FIELDS, but partHeight/partInset are in CELL_FIELDS only and their roles are hard-coded calc() lines in geomResolverCSS (15 roles; best-practices.md:22-23 lacks them).
4. geometry-system/references/foundations.md:40-50 derived-fields table lacks partHeight (height - inset) and partInset (inset / 2); :84-90 resolver step 5 lacks the two part roles (15 roles not 13); :93 breakpoint file is `@media {:where(:root){...}}`.
5. plugin/ultimate-tokens/skills/typography-tokens/references/responsive.md:5-7,22-23: breakpoint set is Desktop Lg 1728, Desktop Xl 2560, Tablet 992, Mobile 476 (narrow modes use max-width; unconditional `:root` is the designed Desktop scale; blocks are `:where(:root)`). Source: src/ui/model.mjs:178-183, src/engine/type.mjs:627-666.
6. type-scale/references/foundations.md:133-134: names `_typeModeScales`/`_bodyMobileNudge` in app.js; they are `typeModeScales`, `typeTierScale`, `modeTierNudge` in src/ui/model.mjs; :207-211 output order is wide modes ascending then narrow descending, wide modes load after the base, blocks are `:where(:root)`.
7. building-editor-sections/SKILL.md:109-115 --sh-* alias list lacks --sh-part-height/-inset; --hh and --ch are now max() of the control height, only --fh is literal; no mention of test/repo/control-text.mjs; :116 says (shg1)-(shg4), headless-boot has (shg) to (shg6).
8. adding-export-formats/references/best-practices.md:58 says exportAll has 7 keys; 10 (add panda, radix, radixRef). references/foundations.md:13-14 and SKILL.md:41-43: derivePalette also returns `group` and `prime`.
9. shipping-changes/SKILL.md:27-28 and references/foundations.md:9,14: npm test/build chains omit gen:adia-exports; foundations.md:27-28 smoke is `npm run build && node test/smoke/launcher.mjs && node test/smoke/smoke.mjs`.
10. maintaining-figma-plugins/SKILL.md:63 says scrim target `500-{step}`; it is nested `scrim/{step}` (ADR-016); references/best-practices.md:19 holds a literal U+2014.

Docs
11. README.md:65-68 geometry is 'XS-2XL' with five treatments; now Maison ladder, 27 cells, 16 fields, radius modes default/round/sharp/pill. README.md:62 seven voices -> 15. README.md:164-167 and docs/references/ui-plan.md:52 describe a mock control per size step and a text-size exception; Controls shows 27 cells, every cell composes from UI_TEXT, inspector tab is 'Ladder'. README.md:122 calls docs/reference/ the product specification; it is runtime data only.
12. docs/specs/marketing/fact-sheet.md:24-25 pinned facts 'size ramp XS-2XL' and 'Geometry treatments 5' are retired (author via marketing-manager-agent + brand-voice skill; keep the pinned-fact parity tests green). docs/specs/marketing/store-copy.md:8 dead link; correct `../../../.claude/skills/lemon-squeezy-schemas/references/objects.md`.
13. docs/references/knowledge-02-tonal-scale.md:404-406 says schema v8; CURRENT_SCHEMA_VERSION is 10 (v9 geometry ladder, v10 layer pins).
14. docs/specs/site/describe-palette-spec.md:339,408 `ultimate-tokens-brand-kit/1` -> `/${EXPORT_SCHEMA_VERSION}` = /7.
15. CHANGELOG.md and docs/references/changelog.md: no entries for T-0027/#818, #813 (ADR-032, schema 9), #810 (ADR-031), #809, T-0026/#817.
16. .claude/CLAUDE.md:27-30,38-39 engine layout omits controls.mjs, layers.mjs, layer-pins.mjs, layers/, resolve.mjs and test/repo/; :21-23 'test/build run all but gen:type-fonts' also skips gen:plugin-pack and gen:preview; :119 comment says 90->~70 lines, file is 119. Keep CLAUDE.md thin.
17. mcp/README.md:62 get_geometry cell fields lack part-height, part-inset. docs/specs/spec-muted-base-key-spikes.md:145,483 and lld-muted-base-key-spikes.md:131 schema numbers are pre-#804 records (leave, they carry a supersession note).
18. .sdlc/notes.md items already fixed (delete): panda EX-1 literals (T-0015 fix-now), geometry-tokens test comment, geometry-tokens.json item (retired by T-0023), spent 'sync branch with main' item, #786 re-check; icons.js:48 cite is now icons.js:51. Only touch notes.md lines; never hand-edit .sdlc/roadmap.md.

## Constraints
Facts only: verify each against code before editing; if a defect is not real, say so in the report. Keep docs thin. `docs/archive/**`, finished run records and dated reports stay as written. `.claude/docs/other/` and `node_modules` never committed. Doc cites: `node scripts/audit-citations.mjs` and `node test/repo/citations.mjs` green. No U+2014. `npm test` before done.

## Acceptance criteria
- (red) `npm test` exits 0.
- (red) `node scripts/audit-citations.mjs 2>&1 | grep -q 'STALE 0'` and `node test/repo/citations.mjs && node test/repo/em-dash.mjs`.
- (red) `! grep -rn "seven voices" README.md .claude/skills plugin && ! grep -rn "_bodyMobileNudge" .claude plugin README.md`
- (red) `test "$(grep -c part-inset mcp/README.md)" -ge 1 && grep -q partInset .claude/skills/maintaining-brand-kit-mcp/SKILL.md .claude/skills/maintaining-brand-kit-mcp/references/foundations.md .claude/skills/maintaining-brand-kit-mcp/references/best-practices.md`
- (red) `grep -q compound-law .claude/skills/geometry-system/SKILL.md && grep -q partHeight .claude/skills/geometry-system/references/foundations.md`
- (red) `! grep -n "GEOMETRY_TREATMENTS" docs/specs/marketing/fact-sheet.md README.md`
- (red) `! grep -n "brand-kit/1" docs/specs/site/describe-palette-spec.md && ! grep -n "schema v8" docs/references/knowledge-02-tonal-scale.md`
- (red) `test "$(grep -c '#818\|#817\|#813\|#810' CHANGELOG.md)" -ge 4 && grep -q '#809' docs/references/changelog.md`
- (red) `! grep -n "b7b0360f\|geometry-tokens.json\|0.733 0.1374" .sdlc/notes.md`
