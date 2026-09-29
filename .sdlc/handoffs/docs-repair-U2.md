# Handoff U2 pass 1, round 2 · builder to verifier

| Field | Value |
|---|---|
| Branch | unit/dr-U2 @ e7058994 |
| Base | plan/docs-repair @ 5d8b1c30 |
| Files at e7058994 | docs/reference/SKILL.md, docs/reference/references/spec-draft.md, docs/reference/references/glossary.md, docs/reference/rubrics/acceptance-criteria.md, docs/reference/rubrics/quality-rubric.md |
| Files in this handoff commit | .sdlc/handoffs/docs-repair-U2.md |
| Ran | every row below at e7058994 in `.worktrees/dr-U2`; `npm test` once, `✓ all 50 test files passed`, exit 0, `git status --short` empty after |
| Left out | `npm run build` and smoke (owed at pre-land, no `node_modules`); no negative controls run at B (the plan's "Today" column states the B values); `ui-plan.md` left to U1, so P6's grep still prints its two lines (`ui-plan.md:48`, `:153`) until U1 merges |
| Round 2 (review be4e4144) | fixed `spec-draft.md:219` (`ten color export formats`); swept the four spec files for other count phrasings (numeral and word forms near format, export, exporter, tab): none left, the remaining numbers are anchors, stops and dates; Drawer glossary row now says its ten tabs differ from the ten export formats (`figma` tab in place of `exportAll`); `npm test` rerun after the ps check, `✓ all 50 test files passed`, exit 0, tree clean |
| Q2 lines | Q2 ruling: keep the id and `name:`, change only human-facing title and description. Changed: SKILL.md :32 body prose and :86 contract `"title"` and :255 non-goal prose, all to Ultimate Tokens. Kept: `name: hct-palette-generator-spec`, the `spec.system.hct-palette-generator-spec` cell id, and spec-draft.md :41 (the spec draft's own subject sentence, not in U2's step list and no count in it) |
| Decisions | Q2 default kept: `name: hct-palette-generator-spec` and the cell id unchanged; title and description say Ultimate Tokens. The lists of ten formats name Panda, Radix and `exportAll` where the old prose listed six or eight |
| P3 dashed added lines | 0 (three rewritten lines carried the glyph; each dropped it: the description line, the H1, `hpg-export-theme-invariant`) |

## Ran

| Id | Output at e7058994 | Expected |
|---|---|---|
| U2-1 | `2`, `2`, `3`, `0`, `1` (name line count) | 1+, 1+, 1+, 0, 1 |
| U2-2 | `1`, `1`, `1` (backticked needles), `ok` | 1+ each, ok |
| U2-3 | `0` for spec-draft, acceptance-criteria, quality-rubric, then `0` for `5 formats` in spec-draft | 0, 0, 0, 0 |
| U2-4 | nine `1`s, Mode row breakpoint count `1`, `grep -c '^| '` = `42` | nine 1s, 1, 42+ |
| U2-5 | `this.section` 1, `canvas-scene` 1, `seg-example` 1, `an-card` 1, `this.view` 1, `colorMode` 2 | each 1+ |
| P3 | `branding: clean (736 files scanned)`; added lines with U+2014: 0 | clean, 0 |
| P6 (partial) | remaining hits are only `ui-plan.md:48` and `:153` (U1's file) | 0 after U1 |
| npm test | `✓ all 50 test files passed`, exit 0 | green |
