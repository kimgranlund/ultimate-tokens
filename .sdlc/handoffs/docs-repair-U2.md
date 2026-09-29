# Handoff U2 pass 1 · builder to verifier

| Field | Value |
|---|---|
| Branch | unit/dr-U2 @ 4095ddbf |
| Base | plan/docs-repair @ 5d8b1c30 |
| Files at 4095ddbf | docs/reference/SKILL.md, docs/reference/references/spec-draft.md, docs/reference/references/glossary.md, docs/reference/rubrics/acceptance-criteria.md, docs/reference/rubrics/quality-rubric.md |
| Files in this handoff commit | .sdlc/handoffs/docs-repair-U2.md |
| Ran | every row below at 4095ddbf in `.worktrees/dr-U2`; `npm test` once, `✓ all 50 test files passed`, exit 0, `git status --short` empty after |
| Left out | `npm run build` and smoke (owed at pre-land, no `node_modules`); no negative controls run at B (the plan's "Today" column states the B values); `ui-plan.md` left to U1, so P6's grep still prints its two lines (`ui-plan.md:48`, `:153`) until U1 merges |
| Decisions | Q2 default kept: `name: hct-palette-generator-spec` and the cell id unchanged; title and description say Ultimate Tokens. The lists of ten formats name Panda, Radix and `exportAll` where the old prose listed six or eight |
| P3 dashed added lines | 0 (three rewritten lines carried the glyph; each dropped it: the description line, the H1, `hpg-export-theme-invariant`) |

## Ran

| Id | Output at 4095ddbf | Expected |
|---|---|---|
| U2-1 | `2`, `2`, `3`, `0`, `1` (name line count) | 1+, 1+, 1+, 0, 1 |
| U2-2 | `1`, `1`, `1` (backticked needles), `ok` | 1+ each, ok |
| U2-3 | `0` for spec-draft, acceptance-criteria, quality-rubric, then `0` for `5 formats` in spec-draft | 0, 0, 0, 0 |
| U2-4 | nine `1`s, Mode row breakpoint count `1`, `grep -c '^| '` = `42` | nine 1s, 1, 42+ |
| U2-5 | `this.section` 1, `canvas-scene` 1, `seg-example` 1, `an-card` 1, `this.view` 1, `colorMode` 2 | each 1+ |
| P3 | `branding: clean (736 files scanned)`; added lines with U+2014: 0 | clean, 0 |
| P6 (partial) | remaining hits are only `ui-plan.md:48` and `:153` (U1's file) | 0 after U1 |
| npm test | `✓ all 50 test files passed`, exit 0 | green |
