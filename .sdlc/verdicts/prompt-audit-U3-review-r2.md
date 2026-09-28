FAIL

# prompt-audit U3 review, pass 2 (#758)

- reviewed: unit/pa-U3 at 5375ac57 (rework commit, parent 273d3ef0), diff against B
- B: `git merge-base origin/main 5375ac57` = 8f5c6dc0 (computed in the unit worktree after `git fetch -q origin`)
- reads and gates: `git clone -q --shared` of the worktree at 5375ac57, `/private/tmp/claude-501/pa-U3-r2`, head 5375ac57
- negative controls: a second clone, `/private/tmp/claude-501/pa-U3-r2-neg`, head 5375ac57, each edit restored with `git checkout` after it ran (`git status --short` 0 at the end)
- the unit worktree was not used for any run: at review time it carried uncommitted edits by another seat (`mcp/brand-kit-merged-core.mjs`, `mcp/describe-mcp-core.mjs`, `src/ui/describe-mcp-assets.js`, the `generate_kit` wording). This record judges the committed 5375ac57 only and leaves those edits untouched.

## Gates

| Gate | Result | Negative control |
|---|---|---|
| `npm test`, foreground, no `node_modules` | `✓ all 53 test files passed`, exit 0, 243 s under host load; `wrote figma/plugin/ui.html 4124.6 KB`; `git status --short` 0 after | not re-run (P1 is plan-level); each unit pin below reds on its own |
| `node test/repo/em-dash.mjs` | `em-dash: clean (794 files scanned)`; added U+2014 lines outside backticks since B: 0 | not run (no added glyph to remove) |
| `node test/repo/branding.mjs` | `branding: clean (786 files scanned)` | not run |
| scope wall (P4, U3 part) | 12 changed files since B, all inside U3's wall or its own records | the `.sdlc/baseline.md` wall is line-level ("no line other than U3's"): see finding 1, one line outside it |
| P5 fates | 13 ids each `1`; fate grep `13` | M9's `amended` row now names its proving command (the U3-6 grep) |

## Criteria

| Id | Result | Evidence (reviewer's own run, clone at 5375ac57) | Negative control (neg clone at 5375ac57) |
|---|---|---|---|
| U3-1 | 🟢 | `0`, `7`, `4`, `true false`; `brand-kit MCP PASS`, exit 0; `brand-kit-merged-core PASS`, exit 0 | static `Use resolve_token / get_ramp / nearest_token` written back into `handle()`: `brand-kit-merged-core FAIL (2)`, both lines naming the kitless `instructions` and the read tool, exit 1 |
| U3-2 | 🟢 | `missing 0`; `camelCase` 2, `{ error }` 4, `ramp stop` 2, `RRGGBB` 2, `Defaults to light` 2; merged `tools/list` walk: `merged missing 0` | B's `mcp/`: `missing 7`, all five needles `0`; the new `format` description deleted: `export_tokens format`, `merged missing 1` |
| U3-3 | 🟢 | `true true`; `GENERATED` needle `0`; `natural next move` 0; `{ kit, doc, lint, meta }` 1 and 1; `families is required` 1 and 1; `error-result`, returned as a normal result (not `isError`) | r1's file (`git show 273d3ef0:mcp/brand-kit-merged-core.mjs`): `GENERATED` needle `1`; B's `mcp/`: `false false`, `1`, `1`, `0` and `0`, `0` and `0` |
| U3-4 | 🟢 | `all-named`; `prime role` 0; `makeVoices` in the test 3 | `**Sub-title** (...)` deleted from the guide line: `brand://guide names every makeVoices() voice (missing: Sub-title)`, exit 1; B's `mcp/`: `Sub-title`, `prime role` 1 |
| U3-5 | 🟢 | `0`, `0`, `1`, `1`; `describe-rubric PASS`, exit 0 | B's `mcp/`: `1`, `2`, `0` |
| U3-6 | 🟢 | `0` | the audit's M9 shape `+  All 53 roles × every palette (424 keys per scheme)` through the same filter prints `1` |
| U3-7 | 🟢 (Q3 fix) | `true`; `#fff` in the test 4 | B's `mcp/brand-kit-core.mjs` with the test kept: `nearest_token("#fff") matches nearest_token("#ffffff") (got {"palette":"Data 3",...,"distance":72} vs {"palette":"Neutral",...,"distance":0})`, exit 1; B's `mcp/` node line prints `false` |
| U3-8 | 🟢 | `3`, `0`, `ok    ui.html: baseline 4124.6 KB, tree 4124.6 KB`, `1` | baseline cell set back to r1's `4124.4 KB`: `STALE ui.html: baseline 4124.4 KB, tree 4124.6 KB`, `stale total: 2` |

The check's other stale line, `time test`, is the known pre-existing timing prose, out of scope per the dispatch (`stale total: 1` at 5375ac57).

## Dispatch checks

| Check | Result | Evidence | Negative control |
|---|---|---|---|
| 1. `export_tokens` precondition true of the code | 🟢 | `exportTokensTool` gates on `state.doc`, set only in `generateKitWrapped` when `result.kit` exists. Probed: `createSession(brandKit(defaultDocument()))` lists `export_tokens` (10 tools) and its call returns `{ error }`; after a `{ description }` call still `{ error }`; after `{ brief }` returns `files tokens.css`; `all` returns 7 files. Kitless `tools/list` lists `generate_kit,export_tokens` | the loaded-kit call and the description-only call are the controls: both `error-result` where the brief call yields files |
| 2. M10, Accents no longer routes to `get_prime` | 🟢 | line reads "a palette's accent role (e.g. `primary/primary`; not the `get_prime` swatches)"; `prime identity colour` 0 | r1's phrase written back: `prime identity colour` 1, `get_prime` swatches phrase 0 |
| 3. M6 against `generateKitTool` | 🟢 load-bearing, 🟡 two wording nits | `{ brief }` keys `kit,doc,lint,meta`; `{ description }` keys `rubric,schema,exemplars,research,instructions`; `brief: "x"` throws `brief must be an object (got string)`; `chroma: 9999` plus a description gives lint codes `clamped,status-distinctness,description-ignored`; merged copy threads the PNG through `attachImageBlock` | `brief: {}` still generates, so "families is required" holds of the schema, not of the runtime (schema-level, as r1 noted) |
| 3a. the `describe-mcp-core.mjs` nit "contrast/chroma-budget advisories" | 🟡 Low, does not block | the lint codes the describe modules can emit: `contrast`, `chroma-budget`, `clamped`, `status-distinctness`, `description-ignored`, `key-color-precedence`; the one measured call emitted none of the two named. A text-only caller told the array holds contrast and chroma advisories under-reads it but is not misrouted: the array is still returned and each entry names its own code. Cheap to fix alongside finding 1 (the merged copy's "such as clamped values, contrast and chroma budget" shape) | n/a (wording) |
| 4. baseline figure 4124.6 KB | 🟢 figure, 🔴 record | the check measures `read(...).length / 1024`; the same measure on the committed files gives `4118.0` at B and `4124.6` at 5375ac57, so 6.6 KB is right for U3; `npm test` printed `wrote figma/plugin/ui.html 4124.6 KB`; the cell note ("4118.0 KB before prompt-audit U3 moved it to 4124.6 KB") is true | cell set to 4124.4: `STALE ui.html`, total 2. The U3 correction paragraph is true; the #681 paragraph is not (finding 1) |

## Findings

| Sev | Where | Finding | Fix |
|---|---|---|---|
| 🔴 High | `.sdlc/baseline.md`, the "Correction (2026-09-20, plan preset-intent-fidelity U7, #681)" paragraph | the rework changed that paragraph's "grew by 6.4 KB" to "grew by 6.6 KB" (`git diff 273d3ef0 5375ac57 -- .sdlc/baseline.md` shows it). That paragraph records 4111.1 KB to 4117.5 KB, which is 6.4 KB, so the history record is now false; the line is also outside U3's wall ("no line of `.sdlc/baseline.md` other than U3's"). Likely a replace-all of `6.4 KB` meant only for U3's own paragraph | restore that line to `6.4 KB`; the U3 paragraph's `6.6 KB` stays. Proof: `git diff 8f5c6dc0 -- .sdlc/baseline.md \| grep -E '^[+-][^+-]'` shows only the build-row cell and the U3 paragraph |
| 🟡 Low | handoff, Criteria table, U3-3 row | the evidence cell still reads "`Only available once a kit has been GENERATED` 1" while the result cell says it is now 0 | change the evidence to `0` |
| 🟡 Low | handoff, Review r1 rework, M6 row | claims "`plus a lint array` 0 in both files"; `grep -c` prints `mcp/describe-mcp-core.mjs:1` (the standalone copy still reads "the result also carries a swatch-board PNG preview ... plus a lint array") | correct the claim, or fix the standalone copy and keep it |
| 🟡 Low | `mcp/describe-mcp-core.mjs` `generate_kit` description | "contrast/chroma-budget advisories" names two of six lint codes; judged non-blocking (3a) | match the merged copy's wording; the uncommitted edit seen in the worktree does this and must be committed, regenerated and re-measured (the `ui.html` figure will move again) |

## Next

Builder pass: restore the #681 line to `6.4 KB`, fix the two handoff cells, and (optional) the standalone `generate_kit` wording. If any `mcp/` text changes, rerun `npm test`, commit the regenerated assets and re-read the `ui.html` figure into the build cell, the cell note and the U3 paragraph only.

verdict: 🔴
