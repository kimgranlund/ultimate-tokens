FAIL: prompt-audit U7 (#758), pass 2 review. F1 and F3 to F6 are fixed, and every SC label now matches its evidence line. U7-9's criterion is that the MCP foundations shape blocks match `brandKit`, and they still do not: the rewritten §5 step shape leaves out `singleLineHeight` on the three box voices, the palettes line leaves out `group` and `prime`, and the handoff says "every key list rewritten to what `brandKit` returns". U7-9's three greps pass anyway. One 🟡 Medium, three Low.

Reviewer: reviewer-l3 (Opus 5.5, high), fresh context. reviewer-l3 is standing in for reviewer-l4 while fable is capped, so this Opus build was checked by the same model family (ruling seat-reliability-approval, `b9044bb`). Worktree `.worktrees/pa-U7`, branch `unit/pa-U7`, head `c547d584` (skill commit `8a230803`; pass 1 head `8e8aa3ad`). B `13346c1a` (`git merge-base origin/main HEAD`), unit base `f6cd69cb`. Criteria: U7-1 to U7-12 and P1 to P6 in `.sdlc/plans/prompt-audit.md` at `c0e7c07b`. No source was edited. On this host `grep` is a shell function that runs ugrep 7.8.4 (`-G`), so the cells' `\|` escapes were typed as bare pipes, and `command grep` (BSD) was used where it mattered.

## Findings

| # | Sev | Where | Finding | Evidence |
|---|---|---|---|---|
| 1 | 🟡 Medium | `maintaining-brand-kit-mcp/references/foundations.md` §5 and the shape block; handoff F2 row | The F2 rewrite claims every key list matches `brandKit`, and it does not. (a) §5 (added in pass 2) says "Each step is `{ size, lineHeight, letterSpacing, leadingRatio, trackingRatio, weight, textTransform, paragraphSpacing, paragraphIndent }`". The box voices also carry `singleLineHeight`, on 15 of the 45 steps: Kicker SM/MD/LG and UI-control and UI-widget XS to 2XL. (b) Line 16, `palettes: [ { name, slug, key, ramp: [ {stop, hex} ] } ]`, leaves out `group` and `prime`, which every palette carries. (c) Lines 17 and 18 (touched in pass 2) and the Note at 22 to 25 still say `kit.type = typeScale(doc.type \|\| DEFAULT_TYPE)` and `geometryScale(doc)`. `brandKit` actually calls `typeScaleFor(doc, "base")` and `geomScaleFor(doc, "base")` (`src/ui/model.mjs` 742 and 743), the override-aware resolvers. (c) predates U7 and sits on lines this pass touched, the same class pass 1 graded 🟡 in F3 and F4. The handoff's F2 row says "every key list rewritten to what `brandKit` returns", which (a) and (b) make false | `node --input-type=module -e "import {brandKit,defaultDocument} from './src/ui/model.mjs'; ..."`: step key sets are `size,...,paragraphIndent` and `size,...,paragraphIndent,singleLineHeight`; the voices with the second set are `Kicker` and `UI-control`/`UI-widget` (`src/engine/type.mjs` 268: `...(p.box ? { singleLineHeight: size } : {})`); palette keys print `name,slug,key,group,ramp,prime` (model.mjs 722 to 732). Fix: add `singleLineHeight` (box voices only) to the §5 step shape, add `group, prime` to the palettes line, and name `typeScaleFor`/`geomScaleFor` in the two shape comments and the Note, or drop the resolver names. Then state the check in the handoff with the command that proves it |
| 2 | Low (plan) | U7-8, SC29 leg | `grep -c -F 'build · test · smoke'` on `shipping-changes/SKILL.md` prints `0` at B as well as at the head, because at B the phrase wraps across lines 7 and 8 (`CI watch (build · test ·` / `smoke)`). The leg cannot tell applied from left out. SC29's `applied, Low` fate is still true: at the head the frontmatter reads `CI watch (all four jobs: build-test, panda-smoke, corpus-contrast, sweeps)` | `git show 13346c1a:.claude/skills/shipping-changes/SKILL.md \| sed -n 1,10p`. For U9 or a revision: a needle on one line (`all four jobs`) would bite |
| 3 | Low (plan) | U7-9, negative control | "Restoring `typed:true` on line 19" now points at the wrong line, because pass 2 added a line above it. `typed` is now on line 18. The control still bites when aimed at the right line | the control on a copy with `typed:true` inserted at line 18 prints `1`; the same sed at line 19 changes nothing and prints `0` |
| 4 | Low | handoff Left out, second row | The flag holds: §5 says the test pins `font` equal to the UI-control size, but `test/mcp/brand-kit.mjs` 176 pins `geo.sizes.MD.font === 15`. The two values are equal at the defaults (`15`, `15`). This belongs with U9, not here | node: `sizes.MD.font 15`, `categories["UI-control"].MD.size 15` |

## SC labels, derived from the evidence file

I read `prompt-audit-evidence.md` lines 536 to 569 directly (SCn = line 535+n) and matched each handoff Note to its line by meaning, without using U7-7's span match, r1, r2 or the handoff's own labels. All 34 match. The Low rows: SC28 is the project-docs frontmatter (`:9-10`), SC29 the shipping frontmatter, SC30 the type-scale caps, SC31 `vmsyntax` (line 566), SC32 the figma references trail (line 567), SC33 `migrated from`, and SC34 `ratified 2026-07-10`/`#264`. The fates match the tree at B and at the head:

| Id | Fate | Needle, B / head |
|---|---|---|
| SC28 | applied, Low | `/doc-forge` `2` / `0`; the frontmatter now routes to the make-doc skill, `/file-feature`, `/file-bug` and the sdlc Orchestrator |
| SC29 | applied, Low | frontmatter read directly (finding 2) |
| SC30 | left out, Low | `Do NOT hand-edit it` `1` / `1` |
| SC31 | applied, Low | `real incident 2026-06-17` `1` / `0` |
| SC32 | left out, Low | `#492` in figma `references/foundations.md` `6` / `6`, and that file is outside U7's scope |
| SC33 | applied, Low | `migrated from` `1` / `0` |
| SC34 | left out, Low | `ratified 2026-07-10` `1` / `1` |

## Criteria

| Row | State | Evidence | Negative control |
|---|---|---|---|
| U7-1 | 🟢 | `0, 1, 1, 1, 0, 1, 1, 1` | pass 1 record at B (files unchanged in pass 2) |
| U7-2 | 🟢 | `1, 1, 1, 1, 0, 2, absent` | U7-11's control reds the first leg |
| U7-3 | 🟢 | `0, 6, 1 and 1, 0 and 0, 1, 1` | pass 1 record |
| U7-4 | 🟢 | `0, 1 1 1 1, 4, 0` | pass 1 record |
| U7-5 | 🟢 | `0, 0, 1, 1, 6` | pass 1 record |
| U7-6 | 🟢 | `0, 1, 15` | pass 1 record |
| U7-7 | 🟢 | `1, 1`, then nothing | SC31 and SC32 ids swapped in a copy: `NOMATCH SC31`, `NOMATCH SC32`. At 8e8aa3ad it prints the 10 `NOMATCH` and 7 `MISSING` lines, as the plan says |
| U7-8 | 🟢 (SC29 leg vacuous, finding 2) | tree `0 0 1 0 6 0 1`; seven row greps `1`; last `0` | SC31 moved to `left out, Low` in a copy: its applied grep prints `0` |
| U7-9 | 🔴 on the criterion text, 🟢 on the greps | `0, 0, 1, 15 false` | `typed:true` put back at line 18 of a copy: `1` (finding 3). The criterion "the shape blocks match `brandKit`" fails on finding 1 |
| U7-10 | 🟢 | `1, 2, 0, 1, 1` | the plan's sed on a copy: `1` and `0` |
| U7-11 | 🟢 | `1, 1, 1, 1` | the row rewritten as `not present yet`: second grep `2` |
| U7-12 | 🟢 | `0`; `1` at `c0e7c07b` and at the current `origin/plan/prompt-audit` (`7189bb10`) | `bee7574d~1` prints `0`; the handoff at 8e8aa3ad prints `1` on the first leg. The ugrep caveat holds: an escaped `\|` BRE prints `347`, which is `wc -l` of the plan |
| P1 | 🟢 | fresh shared clone at `c547d584`: `✓ all 53 test files passed`, TESTS `53`, `test/run.mjs` diff `0`, tree `0`, `ok    tests: baseline 53, test/run.mjs TESTS 53` | pass 1 record (scrim control, `exit 1`) |
| P3 | 🟢 | `branding: clean (811 files scanned)`, `em-dash: clean (819 files scanned)`, `exit 0`, added-line U+2014 `0` | pass 1 record |
| P4 | 🟢 | U7's diff from `f6cd69cb` is the eleven skill files plus U7 records. Each other path in the diff from B came in with the plan-branch merge and is inside the plan's scope. The protected-path count is `0`, and `architecture.md` changed lines are `0` | pass 1 record |
| P5 | 🟢 | SC1 to SC27 each `1`; ERE count `27` | pass 1 record |
| P6 | 🟢 | U7's six skill directories: added `0`, removed `14` | pass 1 record |

## Other pass 2 claims, checked against source

| Claim | Holds | Source |
|---|---|---|
| F3: a non-empty report asks under `askIfUndecided` or reads `false`; `priorLibraryUpliftVM` runs only when the report is empty, in `applyFloatPlans` and `applyFontPrimitivesModes` | 🟢 | `figma/plugin/code.js` 1101/1107 inside `applyFontPrimitivesModes` (961), 1779/1783 inside `applyFloatPlans` (1681) |
| F4: `bodyClassSiblingDefaults` serves `BODY_CLASS_VOICES` (`src/engine/type.mjs`), in the paren shape U9 reads | 🟢 | `type.mjs` 348, 420 (`export const`, so the definition regex matches), 426 |
| F5: `.sdlc/roadmap.md` is a generated snapshot written by `.sdlc/scripts/roadmap-gen.mjs`, and no horizons document exists | 🟢 | frontmatter `status: generated`, `generator: .sdlc/scripts/roadmap-gen.mjs`; no live tracked file carries Now/Next/Later horizons (the one hit outside records is `docs/plan/archive/`) |
| Shape lines: top-level `icons, motion, constants, controls`; type `weights`; geometry `radiusDefault, rampContrast, ramp, insets, gaps, borders, focus`; `buildSize` row keys; radii `none, xs, sm, md, lg, xl, full`; 15 voices, 13 with `SM, MD, LG` and UI-control/UI-widget `XS` to `2XL` | 🟢 | node on `brandKit(defaultDocument())`. The radii keys stay the same under `sharp`, `round`, `pill` and `soft` |
| Centering law on `paddingNarrow`; the test asserts `!("typed" in geo)` | 🟢 | `test/mcp/brand-kit.mjs` 173, 176; node `5 5` |
| `usageGuide()` names the voices by function | 🟢 | `mcp/brand-kit-core.mjs` 83 |
| F6: the Questions paragraph is current | 🟢 | U7-12 |
