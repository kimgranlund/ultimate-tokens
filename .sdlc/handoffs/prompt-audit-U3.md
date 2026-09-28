# prompt-audit U3 handoff: MCP tool, instruction and rubric text

branch: unit/pa-U3
worktree: .worktrees/pa-U3
ticket: #758
G0: `git show origin/main:test/run.mjs | grep -c '"repo/em-dash.mjs"'` prints `1`.

## Files touched

- `mcp/brand-kit-core.mjs`, `mcp/brand-kit-merged-core.mjs`, `mcp/describe-mcp-core.mjs`, `mcp/describe-rubric.mjs`
- `test/mcp/brand-kit.mjs`, `test/mcp/brand-kit-merged-core.mjs`
- regenerated: `src/ui/mcp-assets.js`, `src/ui/describe-mcp-assets.js`, `figma/plugin/ui.html`
- `.sdlc/baseline.md` (ui.html KB cell 4118.0 to 4124.7, one correction paragraph naming this unit)

## Findings

| Id | fate |
|---|---|
| M1 | applied |
| M2 | applied |
| M3 | applied |
| M4 | applied |
| M5 | applied |
| M6 | applied |
| M7 | applied |
| M8 | applied |
| M9 | amended |
| M10 | applied |
| R1 | applied |
| R2 | applied |
| R3 | applied |

- M1: `initialize` instructions are built from `TOOLS.map(name)` at request time, so a kitless, type-only or geometry-only boot names only tools it lists (the merged server appends `generate_kit`/`export_tokens` before this runs).
- M2: usage guide adds Sub-title, Label and Label-mono are the static voices, UI-control/UI-widget the operable ones.
- M3: Q3 ruled fix. `hexToRgb` expands `#RGB` to `#RRGGBB`; `nearest_token` description states Euclidean RGB distance, raw ramp stops only, and the return shape.
- M4/M7/M8: `resolve_token`, `get_ramp`, `get_prime`, `list_palettes` descriptions and every input property now carry contract text (camelCase accent-prefixed keys, exact-case role, light default, `{ error }` as a normal result, `key` is the identity hex).
- M5: `export_tokens` states `{ files: [{ name, mimeType, text }] }`, no disk write, `{ error }` until a generate_kit call with { brief } (r1 rework rewrote the precondition sentence); the "natural next move" clause is gone.
- M6: both `generate_kit` copies state `{ kit, doc, lint, meta }`, `brief.families` required, the PNG block and lint array, why a hand edit will not round-trip; `description` and `brief` properties carry descriptions (brief wins, non-object is a tool error, numbers clamp; proved against `generateKitTool` in `describe-mcp-core.mjs`, `throw` on non-object and the `description-ignored` lint).
- M9 amended: `get_semantic` says every palette times every role, points to `resolve_token` for one lookup, states the light default; no hand-typed count (the audit's 53/424/848 is not in the diff; proved by the U3-6 command `git diff "$B" -- mcp | grep '^+' | grep -v '^+++' | grep -c -E '\b(53|424|848) (roles|keys|entries)'` printing 0).
- M10: "prime role" became "an accent role ... not the `get_prime` swatches" (r1 rework; the first pass wording "prime identity colour" still misrouted).
- R1: the retired additive mechanism sentence replaced by a direct statement that an L* bump lacks the monotone guarantee (`the scheme this replaced` count 0; no "additive" added).
- R2: both `§3.x` cites removed from the RUBRIC string (count 0).
- R3: the rubric names `story.refuses` as where the refusal sentence goes.

## Criteria

| Id | result | evidence |
|---|---|---|
| U3-1 | pass | static string grep 0; instructions greps in both tests 1 or more; kitless boot prints `true false`; `node test/mcp/brand-kit.mjs` and `brand-kit-merged-core.mjs` end in PASS |
| U3-2 | pass | undescribed properties: none (`missing 0` measured after the final edit; needles `camelCase`, `{ error }`, `ramp stop`, `RRGGBB`, `Defaults to light` each present in `brand-kit-core.mjs`) |
| U3-3 | pass (r1: was recorded pass with the `GENERATED` needle at 1, wrong; now 0, see Review r1 rework) | `true true`; `Only available once a kit has been GENERATED` 0, `natural next move` 0, `{ kit, doc, lint, meta }` 1 and 1, `families is required` 1 and 1; kitless export returns an `error` result |
| U3-4 | pass | guide names every `makeVoices()` key; `prime role` 0; `makeVoices` pinned in `test/mcp/brand-kit.mjs` |
| U3-5 | pass | `the scheme this replaced` 0; `§3.[12]` in exported RUBRIC 0; `story.refuses` 1; `test/mcp/describe-rubric.mjs` passes inside `npm test` |
| U3-6 | pass | added-line grep for `(53\|424\|848) (roles\|keys\|entries)` in `git diff -- mcp` prints 0 |
| U3-7 | pass | `nearest_token("#fff")` equals `nearest_token("#ffffff")`; `#fff` asserted in `test/mcp/brand-kit.mjs` |
| U3-8 | pass | three generated files committed; tree clean after `npm test` beyond the intended files; `ok ui.html: baseline 4124.7 KB, tree 4124.7 KB` |

## Negative controls (run in the worktree, file restored after each)

| Pin | control | red result |
|---|---|---|
| kitless instructions | static `Use resolve_token / get_ramp / nearest_token` restored in `handle()` | `test/mcp/brand-kit-merged-core.mjs` fails on both new lines, naming `instructions` and the static tool list |
| `#fff` | `git show HEAD:mcp/brand-kit-core.mjs` (old `hexToRgb`) with the test kept | `brand-kit MCP FAIL`: `nearest_token("#fff")` returned `Data 3 #D6153B distance 72` against `Neutral #FFFFFF distance 0` |
| voice list | `Sub-title` deleted from the guide line | `test/mcp/brand-kit.mjs` fails: `brand://guide names every makeVoices() voice (missing: Sub-title)` |

## Measured values (step 2)

- `nearestToken("#fff")` before the fix: `{"palette":"Data 3","stop":500,"hex":"#D6153B","distance":72}`; after, identical to `#ffffff`: `{"palette":"Neutral","stop":50,"hex":"#FFFFFF","distance":0}`.
- `generate_kit({ brief })` result JSON with one Primary family: 48517 bytes.
- `list_palettes` `key` is the identity hex (`{"name":"Neutral","key":"#576485","group":"material","stops":19}`).
- `initialize` instructions: full kit `Use list_palettes, get_ramp, get_prime, resolve_token, get_semantic, nearest_token, get_type, get_geometry`; type-only kit `Use get_type`; kitless `createSession()` `Use generate_kit, export_tokens`.

## Gates

- `npm test`: `all 53 test files passed` (host load 70 to 160, so wall time is not a timing reading).
- `npm run build` and the `smoke` leg: not run. The worktree has no `node_modules` and the host is saturated; `gen:figma-ui` ran inside `npm test` and produced the 4124.7 KB bundle the check now agrees with. Run `npm ci && npm run build` in the worktree before the pre-land record if P2 must be read there.
- `sh .sdlc/checks/baseline-agrees-check.sh`: `ui.html` ok. One remaining line, `STALE time test: baseline 167 to 268 s, adapter 80 to 89 s`, is in `baseline.md` versus `adapter.md` timing prose this unit does not touch and was already stale before this change.
- Added lines carry no U+2014 and no ticket id in `mcp/` or `test/`.

## Review r1 rework

Measured at the rework commit (parent 273d3ef0); `npm test` foreground, `all 53 test files passed`, exit 0.

| Finding | Fix | Proof |
|---|---|---|
| U3-3 (High) | `export_tokens` precondition rewritten as the contract: works only after a successful `generate_kit` call with `{ brief }` in this session, otherwise `{ error }` as a normal result; the first clause no longer says the tool writes files (review Low) | `grep -c 'Only available once a kit has been GENERATED' mcp/brand-kit-merged-core.mjs` prints `0`; `natural next move` 0; `tools/list` check prints `true true` |
| M10 (Medium) | Accents line reads "a palette's accent role (e.g. `primary/primary`; not the `get_prime` swatches)" | `grep -c 'prime identity colour' mcp/brand-kit-core.mjs` prints `0`; `prime role` 0; the new phrase count 1 |
| M6 nits | fixed the double-counted lint ("plus a lint array" gone; `lint` now says what it holds) and gave the merged `export_tokens` `format` property a description (review Low). The standalone lint clause was reworded in the second rework commit (below); earlier left (outside the review's three but same nit family, predates U3, `describe-mcp-core.mjs`, cheap but not asked) | `plus a lint array` 0 in `brand-kit-merged-core.mjs`; `describe-mcp-core.mjs` still prints 1 (its "plus a lint array" is the standalone copy's wording, left as a non-blocking Low); U3-2 needle command unchanged |
| baseline note | cell note now reads "4118.0 KB before prompt-audit U3 moved it to 4124.7 KB"; the figure itself moved 4124.4 to 4124.7 because the rework text regenerated the bundle | `sh .sdlc/checks/baseline-agrees-check.sh \| grep ui.html` prints `ok    ui.html: baseline 4124.7 KB, tree 4124.7 KB`; correction paragraph re-figured to 4124.7 and 6.7 KB (the #681 paragraph stays 6.4 KB) |

Regenerated and committed: `src/ui/mcp-assets.js`, `src/ui/describe-mcp-assets.js`, `figma/plugin/ui.html`. `node test/repo/em-dash.mjs`: clean. Tree clean after `npm test` except those intended files.

Second rework commit (same round): the standalone and merged `generate_kit` descriptions now say `brief.families is required by the schema, at least Primary, though a call without it is not rejected`, and the standalone lint clause lists clamped values, contrast and chroma budget (the last two M6 nits, both closed). `npm test` green again; the figure moved to 4124.7 KB (`ok    ui.html: baseline 4124.7 KB, tree 4124.7 KB`), baseline and this file re-figured. Controls ran in a throwaway clone under `/private/tmp/claude-501/paU3-clone` (removed): with the merge-base `mcp/brand-kit-merged-core.mjs` and `brand-kit-core.mjs` checked out, the `GENERATED` needle prints `1` and `prime role` prints `1`, so both criteria bite.
