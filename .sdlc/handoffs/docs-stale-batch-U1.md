# docs-stale-batch U1 handoff (pass 1)

Only `figma/README.md` changed (three sentences). Base 2008659e.

| Id | Result |
|---|---|
| U1-1 | SCRIM_STRENGTH_STEPS / SCRIM_SUFFIXES / SCRIM_KEYS grep counts: 1 1 1 |
| U1-2 | README states 20 gates; `DECLARED` length at this base is 20 (gates-batch added `renameparity`, so the plan's 19 is stale; graded relative). SAME. `mode-apply-plan.mjs` count: 2 |
| U1-3 | `libraryparity` README 1, `executor path` README 0, `libraryparity` in test/figma/plugin.mjs 59 |
| U1-4 | no U+2014 in README; one line per claim |

`npm test` skipped at the cap (process probe printed 2, not under 2). The README is not embedded anywhere, so no generated file moves.

Ledger:

| Claim | Status | Evidence |
|---|---|---|
| `SCRIM_KEYS` | present | `scripts/gen-figma-binder-code.mjs:95` |
| `DECLARED` length 20 | present | `test/figma/binder.mjs:858` (20 entries; plan said 19) |
| `LIBRARY_TYPE_VOICE_MAP` | present | `figma/plugin/code.js:440` |
| `import` of `migrations.mjs` | absent | no match in `figma/plugin/code.js` |
