PASS

# docs-stale-batch U1 review, pass 1 (#779, issue #774)

Diff 2008659e..0df2f9f5: `figma/README.md` (3 sentences) and the handoff. Nothing else moved.

| Id | Result | Evidence |
|---|---|---|
| U1-1 | pass | SCRIM_STRENGTH_STEPS / SCRIM_SUFFIXES / SCRIM_KEYS print `1 1 1`; base prints `0 0 0` |
| U1-2 | pass (relative) | README `20`, `DECLARED` length `20`, `SAME`; `mode-apply-plan.mjs` count `2` (base `1`). Control: `20 gates` seded to `19 gates` prints `19`, not equal to 20, no SAME. Base README has no `N gates` number. |
| U1-3 | pass | `libraryparity` README `1` (base `0`), `executor path` `0` (base `1`), `libraryparity` in test/figma/plugin.mjs `59` |
| U1-4 | pass | no U+2014 in README or handoff; one claim per sentence; clean tree |

Claim checks: `app.js:48` and `apply-gate.js:6` both import `migrations.mjs`; `code.js:440` holds `LIBRARY_TYPE_VOICE_MAP` and has no `migrations` import; `binder.mjs` imports `bind-plan.mjs` (line 7) and `mode-apply-plan.mjs` (line 8).

## Findings

- Info: the plan's literal `19` in U1-2 is stale. gates-batch added `renameparity`, so `DECLARED` is now 20. The builder graded relative to the live length, as the criterion intends. The plan text should be corrected when the plan is archived.
- Info: `npm test` not run by this review. Process probe printed 2 (needs under 2), skipped at the cap. The README is not embedded in any generated file, so no generated asset can move; the builder also skipped it at the cap. The plan-level pre-land run must cover it.
- Low: README line 45 now runs about 130 columns, longer than its neighbors. Cosmetic only.
