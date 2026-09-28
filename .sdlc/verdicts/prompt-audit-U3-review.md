FAIL

# prompt-audit U3 review, pass 1 (#758)

- reviewed: unit/pa-U3 at 8943bc82 (work commit 58439a3f), diff `plan/prompt-audit...unit/pa-U3`
- B: `git merge-base origin/main HEAD` = 8f5c6dc0
- controls: throwaway clone `git clone -q --shared` of the worktree at 8943bc82, under the reviewer's own job scratchpad, removed after
- criteria: `.sdlc/plans/prompt-audit.md` section U3, findings from `.sdlc/plans/prompt-audit-evidence.md` slice D

## Gates

| Gate | Result | Negative control |
|---|---|---|
| `npm test` (foreground run, no `node_modules`) | `✓ all 53 test files passed`, EXIT 0; `git status --short` 0 after; TESTS 53 | not re-run (P1 is plan-level); the three unit pins below each red on their own |
| branding / em-dash | `branding: clean (785 files scanned)`, `em-dash: clean (793 files scanned)`; added U+2014 lines outside backticks 0 | not run (no added glyph to remove) |
| scope wall (U3 paths) | 11 changed files, all inside U3's wall plus its own handoff | not run (plan-level P4 owns the fixture) |
| P5 fates | 13 ids each `1`; fate-grep `13` | an `amended` row must state the proving command: M9's note says the count is not in the diff but names no command (Low, see findings) |

## Criteria

| Id | Result | Evidence (reviewer's own run) | Negative control |
|---|---|---|---|
| U3-1 | 🟢 | `0`, `7`, `4`, `true false`, `brand-kit MCP PASS`, `exit 0` | clone, static `Use resolve_token / get_ramp / nearest_token` restored in `handle()`: `brand-kit-merged-core FAIL (2)` naming `instructions` and `resolve_token`, exit 1; `brand-kit.mjs` also reds on the type-only pin (`dangling: resolve_token,get_ramp,nearest_token`). At B: `false true` |
| U3-2 | 🟢 | `missing 0`; `camelCase` 2, `{ error }` 4, `ramp stop` 2, `RRGGBB` 2, `Defaults to light` 2 | clone at B's `mcp/`: `missing 7`, all five needles `0` |
| U3-3 | 🔴 | `true true`; `Only available once a kit has been GENERATED` prints `1` (expected `0`); `natural next move` 0; `{ kit, doc, lint, meta }` 1 and 1; `families is required` 1 and 1; `error-result` | clone at B's `mcp/`: `false false` |
| U3-4 | 🟢 on the command; M10 substance 🔴 (finding 2) | `all-named`, `prime role` 0, `makeVoices` 3 | clone, `Sub-title` deleted from the guide line: `brand://guide names every makeVoices() voice (missing: Sub-title)`, exit 1 |
| U3-5 | 🟢 | `0`, `0`, `1`, `1`, `describe-rubric PASS`, `exit 0` | clone at B's `mcp/`: `1`, `2`, `0`; clone, `additive` written into the §7 heading: `node test/mcp/describe-rubric.mjs` exit 1 |
| U3-6 | 🟢 | `0` | the audit's M9 shape `+... All 53 roles × every palette (424 keys ...)` through the same filter prints `1` |
| U3-7 | 🟢 (Q3 ruled A, fix) | `true`; `#fff` in the test 4 | clone, `git checkout B -- mcp/brand-kit-core.mjs`, test kept: `nearest_token("#fff") matches ... (got {"palette":"Data 3","stop":500,"hex":"#D6153B","distance":72} vs {"palette":"Neutral","stop":50,"hex":"#FFFFFF","distance":0})`, exit 1; at B the node line prints `false` |
| U3-8 | 🟢 | `3`, `0`, `ok    ui.html: baseline 4124.4 KB, tree 4124.4 KB`, `1` | clone, baseline cell reverted to `4118.0 KB`: `STALE ui.html: baseline 4118.0 KB, tree 4124.4 KB`, stale total 2 |

The check's one other line, `STALE time test: baseline 167 to 268 s, adapter 80 to 89 s`, is known and out of scope per the dispatch.

## M6 judged against `generateKitTool`

| Claim in the description(s) | Holds? | Evidence | Negative control |
|---|---|---|---|
| `{ brief }` returns `{ kit, doc, lint, meta }` | 🟢 | `generateKitTool({ brief: {} })` keys `kit,doc,lint,meta` | `{ description: "ocean" }` returns `rubric,schema,exemplars,research,instructions`, no `kit` |
| `{ description }` never generates a kit | 🟢 | mode 1 object has no `kit` key | as above, the `brief` call does carry `kit` |
| brief wins when both are sent | 🟢 | both sent: lint carries `description-ignored` and a kit is generated | description alone: no kit |
| a non-object brief is a tool error | 🟢 | `brief: "x"` throws `brief must be an object (got string)`; `handle` turns a throw into `isError: true` | an object brief does not throw |
| out-of-range numbers are clamped | 🟢 | `Primary.chroma 9999` gives a `clamped` lint and a kit | in-range values give no `clamped` code |
| merged copy: PNG image block | 🟢 | merged `createSession(kit)` `generate_kit({ brief })` content types `text,image` (the wrapper routes through `attachImageBlock`) | a `{ description }` call carries no image (the function returns early when the digest has no `kit`) |
| `brief.families is required, at least Primary` | 🟡 | true of `PALETTE_BRIEF_SCHEMA` (`required: ["families"]`, `required: ["Primary"]`), and U3-3 mandates the needle; at runtime `generateKitTool({ brief: {} })` still generates (`generateKit` defaults an absent `families`) | none needed: a schema-level contract stated as such is accurate; noted so no one pins a runtime rejection on it |
| lint array is "contrast/chroma-budget advisories" | 🟡 | the lint also carries `clamped`, `status-distinctness`, `description-ignored` (measured on one call) | n/a; the standalone copy's wording predates U3 |
| merged copy "returns { kit, doc, lint, meta }, plus a lint array" | 🟡 | `lint` is a field of that same object, so "plus a lint array" reads as a second array | n/a (wording) |

M6 verdict: the load-bearing claims hold; three wording nits, none blocking.

## Baseline figure (4118.0 to 4124.4 KB)

| Question | Answer | Evidence | Negative control |
|---|---|---|---|
| in scope? | 🟢 yes | the scope wall names `.sdlc/baseline.md` "(the `npm run build` row's KB figure plus one correction paragraph)"; the diff touches that cell and appends one paragraph, nothing else | n/a |
| correct? | 🟢 yes | my `npm test` run printed `wrote figma/plugin/ui.html 4124.4 KB`; the check reads `tree 4124.4 KB` | reverted to 4118.0: the check prints `STALE ui.html` |
| internally consistent? | 🟡 | the same cell's note still says `confirmed via gen:figma-ui, exit 0, same 4118.0 KB` and its corrections list omits prompt-audit U3 | n/a (the check compares only the backticked figure) |

## Findings

| Sev | Where | Finding | Fix |
|---|---|---|---|
| 🔴 High | `mcp/brand-kit-merged-core.mjs`, `export_tokens` description | U3-3 expects `grep -c 'Only available once a kit has been GENERATED'` to print `0`; it prints `1`. The handoff reports U3-3 as pass while listing that `1`. M5's defect is exactly this sentence: the tool is always listed, so "Only available" contradicts what `tools/list` shows. The appended "returns { error } until then" is right; the sentence it hangs off still is not | rewrite the precondition as the contract, e.g. "Works only after a successful generate_kit call with { brief } in this session; before that, and with only a loaded brand-kit.json, it returns { error } as a normal result." and correct the handoff row |
| 🔴 Medium | `mcp/brand-kit-core.mjs` usage guide, Accents line | M10 marked applied, but "a palette's prime identity colour (e.g. `primary/primary`)" still uses the word the finding says misroutes: `get_prime`'s own description is "seven prime identity swatches", so the new phrase is closer to the wrong tool than the old one. The U3-4 needle (`prime role` 0) passes without the defect being fixed | name it an accent role and point away from `get_prime`, as the audit hunk does ("a palette's accent role (e.g. `primary/primary`; not the `get_prime` swatches)") |
| 🟡 Low | `export_tokens` description | "writing tokens.css or a framework config for the user's project" then "nothing is written to disk": the first clause still says the tool writes | say it returns file contents for the caller to write (fold into the first fix) |
| 🟡 Low | `export_tokens` `format` property | undescribed; U3-2's command only walks `brand-kit-core.mjs`'s surface, so the merged tool's one property escapes the "every declared input property" criterion text | add a `description` to `format` (the audit hunk carries one) |
| 🟡 Low | merged `generate_kit` description | "returns { kit, doc, lint, meta }, plus a lint array" double-counts `lint` | drop "plus a lint array" or say what `lint` holds |
| 🟡 Low | `.sdlc/baseline.md` build row | cell note still says "same 4118.0 KB" beside the new 4124.4 figure | re-word the note or add prompt-audit U3 to its corrections list |
| 🟡 Low | handoff | the negative controls ran in the unit worktree, not a throwaway clone (plan's Diff bases rule); M9's `amended` row names no proving command (P5) | run controls in a clone next pass; add the U3-6 command to the M9 note |

## Next

Builder pass 2: the two 🔴 rows (both are description text in `mcp/`), regenerate the three assets, re-read the `ui.html` figure, fix the handoff's U3-3 row. The Lows can ride the same pass.

verdict: 🔴
