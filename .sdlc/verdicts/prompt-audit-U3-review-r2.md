FAIL

# prompt-audit U3 review, pass 2 (#758)

- reviewed: unit/pa-U3 at 77639f59 (the second rework commit, on top of 5375ac57), diff against B, with the 5375ac57..77639f59 delta read on its own
- supersedes the earlier text of this file (commit 2e16bf9b, written at 5375ac57 before the builder's 77639f59 landed)
- B: `git merge-base origin/main 5375ac57` = 8f5c6dc0 (computed in the unit worktree after `git fetch -q origin`; 77639f59 adds no merge)
- reads and gates: `git clone -q --shared` of the worktree, `/private/tmp/claude-501/pa-U3-r2`, head 77639f59
- negative controls: a second clone, `/private/tmp/claude-501/pa-U3-r2-neg`, head 77639f59, each edit restored with `git checkout` after it ran (`git status --short` 0 at the end)
- no run used the unit worktree (another seat was committing there during the review)

## Delta 5375ac57..77639f59

| Change | Holds? | Evidence | Negative control |
|---|---|---|---|
| both `generate_kit` copies: "brief.families is required by the schema, at least Primary, though a call without it is not rejected" | 🟢 | merged `createSession()`, `generate_kit({ brief: {} })` generates a kit and `export_tokens` then returns files; `PALETTE_BRIEF_SCHEMA` still requires `families` and `Primary`; the U3-3 needle `families is required` still counts 1 and 1 | B's `mcp/`: `0` and `0` |
| standalone lint clause: "advisories such as clamped values, contrast and chroma budget" | 🟢 | a `chroma: 9999` brief sent with a description emits `clamped,status-distinctness,description-ignored`; "such as" does not claim the list is complete, and `clamped` is now named. The r1 nit is closed | n/a (wording) |
| `ui.html` figure 4124.6 to 4124.7 KB in the build cell, the cell note and the U3 paragraph | 🟢 | the check's own measure (`read(...).length / 1024`) on the committed file: `4124.7`; at B `4118.0`, so the U3 paragraph's 6.7 KB is right; `npm test` printed `wrote figma/plugin/ui.html 4124.7 KB` | cell set to 4124.6: `STALE ui.html: baseline 4124.6 KB, tree 4124.7 KB`, `stale total: 2` |
| the #681 correction paragraph, "grew by 6.6 KB" to "grew by 6.7 KB" | 🔴 | finding 1 | `git show 8f5c6dc0:.sdlc/baseline.md` reads `6.4 KB` on that line |

## Gates

| Gate | Result | Negative control |
|---|---|---|
| `npm test`, foreground, no `node_modules` | `✓ all 53 test files passed`, exit 0, 192 s under host load; `git status --short` 0 after | not re-run (P1 is plan-level); each unit pin below reds on its own |
| `node test/repo/em-dash.mjs` | `em-dash: clean (794 files scanned)`; added U+2014 lines outside backticks since B: 0 | not run (no added glyph to remove) |
| `node test/repo/branding.mjs` | `branding: clean (786 files scanned)` | not run |
| baseline check | `ok    tests: baseline 53, test/run.mjs TESTS 53`; `ok    ui.html: baseline 4124.7 KB, tree 4124.7 KB`; `stale total: 1`, the known `time test` prose line, out of scope per the dispatch | see U3-8 |
| scope wall (P4, U3 part) | 12 changed files since B, all inside U3's wall or its own records | the `.sdlc/baseline.md` wall is line-level ("no line other than U3's"): finding 1 is one line outside it |
| P5 fates | 13 ids each `1`; fate grep `13` | M9's `amended` row names its proving command (the U3-6 grep) |

## Criteria

| Id | Result | Evidence (reviewer's own run, clone at 77639f59) | Negative control (neg clone at 77639f59) |
|---|---|---|---|
| U3-1 | 🟢 | `0`, `7`, `4`, `true false`; `brand-kit MCP PASS`, exit 0; `brand-kit-merged-core PASS`, exit 0 | static `Use resolve_token / get_ramp / nearest_token` written back into `handle()`: `brand-kit-merged-core FAIL (2)`, both lines naming the kitless `instructions`, exit 1 |
| U3-2 | 🟢 | `missing 0`; `camelCase` 2, `{ error }` 4, `ramp stop` 2, `RRGGBB` 2, `Defaults to light` 2; merged `tools/list` walk `merged missing 0` | B's `mcp/`: `missing 7`, all five needles `0`; the merged `format` description deleted: `merged missing 1` |
| U3-3 | 🟢 | `true true`, listed `generate_kit,export_tokens`; `GENERATED` needle `0`; `natural next move` 0; `{ kit, doc, lint, meta }` 1 and 1; `families is required` 1 and 1; `error-result`, a normal result (not `isError`) | r1's file (`git show 273d3ef0:mcp/brand-kit-merged-core.mjs`): `GENERATED` needle `1`; B's `mcp/`: `false false`, `1`, `0` and `0` |
| U3-4 | 🟢 | `all-named`; `prime role` 0; `makeVoices` in the test 3; `prime identity colour` 0 | `**Sub-title** (...)` deleted from the guide line: `brand://guide names every makeVoices() voice (missing: Sub-title)`, exit 1; B's `mcp/`: `prime role` 1 |
| U3-5 | 🟢 | `0`, `0`, `1`, `1`; `describe-rubric PASS`, exit 0 | B's `mcp/`: `1`, `2`, `0` |
| U3-6 | 🟢 | `0` | the audit's M9 shape `+  All 53 roles × every palette (424 keys per scheme)` through the same filter prints `1` |
| U3-7 | 🟢 (Q3 fix) | `true`; `#fff` in the test 4 | B's `mcp/brand-kit-core.mjs`, test kept: `nearest_token("#fff") matches nearest_token("#ffffff") (got {"palette":"Data 3",...`, exit 1 |
| U3-8 | 🟢 | `3`, `0`, `ok    ui.html: baseline 4124.7 KB, tree 4124.7 KB`, `1` | cell set to 4124.6: `STALE ui.html`, `stale total: 2` |

## Dispatch checks

| Check | Result | Evidence | Negative control |
|---|---|---|---|
| 1. `export_tokens` precondition true of the code | 🟢 | `exportTokensTool` gates on `state.doc`, set only in `generateKitWrapped` when `result.kit` exists. A session with a loaded kit lists `export_tokens` and its call returns `{ error }`; after a `{ description }` call still `{ error }`; after a `{ brief }` call `all` returns 7 files | the loaded-kit and description-only calls are the controls: `error-result` where the brief call yields files |
| 2. M10 | 🟢 | Accents line: "a palette's accent role (e.g. `primary/primary`; not the `get_prime` swatches)" | r1 phrase `prime identity colour`: 0 now; B: `prime role` 1 |
| 3. M6 against `generateKitTool` | 🟢 | `{ brief }` keys `kit,doc,lint,meta`; `{ description }` keys `rubric,schema,exemplars,research,instructions`; `brief: "x"` throws `brief must be an object (got string)`; the both-sent call carries `description-ignored`; out-of-range numbers give `clamped`; merged copy threads the PNG through `attachImageBlock` | an object brief does not throw; description alone yields no `kit` |
| 3a. the "contrast/chroma-budget advisories" nit | 🟢 closed by 77639f59 | now "advisories such as clamped values, contrast and chroma budget" | n/a |
| 4. baseline figure | 🟢 figure and U3 paragraph, 🔴 #681 line | U3 paragraph 4118.0 to 4124.7, 6.7 KB, true; cell note "4118.0 KB before prompt-audit U3 moved it to 4124.7 KB" true | see U3-8 |

## Findings

| Sev | Where | Finding | Fix |
|---|---|---|---|
| 🔴 High | `.sdlc/baseline.md`, the "Correction (2026-09-20, plan preset-intent-fidelity U7, #681)" paragraph | that paragraph records 4111.1 KB to 4117.5 KB, which is 6.4 KB. Both rework commits rewrote its "grew by 6.4 KB" (5375ac57 to 6.6, 77639f59 to 6.7), each time tracking U3's own growth figure. The history record is false and the line is outside U3's wall ("no line of `.sdlc/baseline.md` other than U3's") | restore `6.4 KB` on that line and edit only the build cell and the U3 paragraph when the figure moves. Proof: `git diff 8f5c6dc0 -- .sdlc/baseline.md \| grep -E '^[+-][^+-]'` lists only the build-row cell and the added U3 paragraph |
| 🟡 Low | handoff, Criteria table, U3-3 row | the evidence cell still reads "`Only available once a kit has been GENERATED` 1"; the count is 0 | change the evidence to `0` |
| 🟡 Low | handoff, Review r1 rework table | the M6 row claims "`plus a lint array` 0 in both files" (`mcp/describe-mcp-core.mjs` prints 1) and still says the standalone lint wording was "Left", which the later "Second rework commit" paragraph contradicts; the baseline-note row says the U3 paragraph was "re-figured to 4124.7 and 6.6 KB" where the paragraph reads 6.7 KB | make the three cells match the files |
| 🟡 Low, non-blocking | `mcp/describe-mcp-core.mjs` `generate_kit` description | "returns { kit, doc, lint, meta }; the result also carries a swatch-board PNG preview ... plus a lint array" still reads `lint` as a second thing, the same double count r1 flagged on the merged copy | optional: drop "plus a lint array" and say what `lint` holds inline, as the merged copy does |

## Next

Builder pass: restore the #681 line to `6.4 KB`, fix the three handoff cells. Both are records-only; no `mcp/` text or bundle change is needed, so the 4124.7 KB figure stands unless the optional wording fix is taken (then rerun `npm test`, commit the regenerated assets, and move only the build cell, its note and the U3 paragraph).

verdict: 🔴
