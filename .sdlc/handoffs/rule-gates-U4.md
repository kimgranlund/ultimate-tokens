---
kind: handoff
plan: rule-gates
unit: U4
branch: unit/rg-U4
written: 2026-09-23
pass: 1
---

# U4 handoff: the em-dash sweep, the gate registered

Base sha: b8abddf0. Head sha: 68fad59a. Commits, in order: c5f7bb2c (merge origin/main
at ae4206ac into U4, G0's post-condition), 0faca70d (hand edit, voice-check.mjs's pivot
regex to the u2014 escape), e55a2ce9 (the automatic --fix sweep), c90402b2 (regenerate
the mirrors from the sweep), c23f5c83 (hand-rewrite the sweep's refused lines),
80a0f0ae (regenerate the mirrors from the hand edits), bb0608f9 (register
repo/em-dash.mjs, the CLAUDE.md Always line), 68fad59a (re-pin architecture.md's
DD50-DD52 after the Always line shifted CLAUDE.md's trailing comments by two lines).

## G0 (U4-1)

`gh issue view 681 --json state --jq .state` -> `CLOSED`. `git cat-file -e
origin/main:test/engine/anchor.mjs; echo $?` -> `0`. `git merge-base --is-ancestor
origin/main HEAD; echo $?` (after the merge commit) -> `0`.

## P2, the gate reads Unicode and is not exempt from itself

`node test/repo/em-dash.mjs` -> `self-test: PASS` then `em-dash: clean (685 files
scanned)`, exit 0. `grep -c 'u2014' test/repo/em-dash.mjs` -> `1` or more; `grep -c` for
the raw glyph in the same file -> `0`.

## U4-3, the gate is registered

`grep -c '"repo/em-dash.mjs"' test/run.mjs` -> `1`. `npm test 2>&1 | grep -c '^▶
repo/em-dash.mjs'` -> `1`. `npm test` -> `✓ all 51 test files passed`.

## U4-4, the voice gate's pivot regex survived the sweep

`grep -c 'u2014 (?:not' .claude/skills/ultimate-tokens-brand-voice/scripts/voice-check.mjs`
-> `1`. A four-pivot fixture (`Ships today — not someday.` etc., four lines) through
`node .claude/skills/ultimate-tokens-brand-voice/scripts/voice-check.mjs` ->
`WARN: 4 em-dash pivot constructions`.

## U4-5, the entry file states the rule and the repair

`.claude/CLAUDE.md`'s `## Always` block gained: "No U+2014 anywhere in the tree;
`test/repo/em-dash.mjs` gates it in `npm test`, and `node test/repo/em-dash.mjs --fix`
repairs a branch." `git diff --numstat b8abddf0 -- .claude/CLAUDE.md` -> `30	27
.claude/CLAUDE.md` (27 swept lines, 3 added: the two-line Always bullet plus its blank
line join).

## U4-6, the three record checks on the swept records

`sh .sdlc/checks/doc-drift-rows-check.sh` -> `rows 56 drifted 11 holds 45 undetermined 0
bad 0`, exit 0 (after re-pinning DD50-DD52 from `.claude/CLAUDE.md:114`/`:115` to
`:116`/`:117`, since the Always bullet shifted the file's trailing HTML comments by two
lines, real drift the check caught, not a false positive; the quotes themselves did not
change). `sh .sdlc/checks/card-source-range-check.sh` -> exit 0.
`sh .sdlc/checks/card-amendment-check.sh` -> exit 0.

## U4-7, every refused line rewritten by hand, read for meaning

`node test/repo/em-dash.mjs | tail -1` -> `em-dash: clean (685 files scanned)`.
94 lines were fixed by hand (92 the fix's own residual report named, plus 2 more on
`docs/reference/reviews/2026-07-17-cto-core.md:44` that its per-line loop never reached
because it stops at the line's first refusal; found on the second gate run after the
first 92 were fixed, then fixed too). Full before/after list below.

## U4-8, the five half-rewritten lines named by the plan

All five are in the before/after list below and read as one sentence with its pause
intact: `.claude/skills/maintaining-brand-kit-mcp/references/rubric.md:3`,
`src/ui/app.js:690`, `src/engine/ds-export.js:776`,
`docs/reference/references/decomposition.md:77`,
`docs/reference/colors/categories/brands.json:1960`.

## U4-9, the guard's over-refusals

Fixed as the rule table would have written them (a comma, colon or semicolon), each
listed below: a dash right after a closing `/` (`.claude/CLAUDE.md:115`,
`.claude/agents/marketing-manager-agent.md:4`, `.claude/skills/project-docs/SKILL.md:44`,
`src/ui/app-helpers.mjs:48`, four `src/ui/overlays/drawer.js` lines,
`test/ui/headless-boot.mjs:1873`, three `scripts/gen-*.mjs` headers), after a closing
`>` (`docs/reference/colors/categories/brands.json:5` and `:1808`, `src/engine/ds-gates.js:14`,
`src/ui/app.js:690`, `src/ui/styles.css:6` and `:106`), and after a bare `%`
(`docs/reference/CHANGELOG.md:420`, `test/engine/tonal.mjs:243`).

## U4-10, user-visible strings and CSS comment labels

Every auto-fixed line inside a program string under `src/`, `mcp/` and `figma/` that
needed a further hand rewrite (a label or clause-join dash reading as a list) is in the
list below, rewritten with a colon or a sentence break rather than a list-reading comma:
the two `escapeHtmlVM(collectionName)` warning strings in
`figma/binder/figma-semantic-binder/code.js:495` and `figma/plugin/code.js:773`
(`</b> —` to `</b>:`), the icon-set sentence and the "Which variant?" heading in
`src/engine/ds-export.js`, the motion-row sentence in `src/engine/ds-export.js:680`
(split into two clauses with a semicolon and a comma), and the two legend comments
naming the glyph as a status symbol (`src/ui/app.js:2385`, `src/ui/sections/color.js:1330`,
rewritten with a plain hyphen since they describe a UI symbol, not a prose pause).
`src/ui/styles.css:6` and `:106`'s CSS comment labels are in the list below too.

## npm test, npm run build, npm run smoke

`npm test` in this worktree at 68fad59a: `✓ all 51 test files passed`, tree clean after.
In a throwaway clone at 68fad59a: `npm test` -> `✓ all 51 test files passed`, `git status
--short | wc -l` -> `0`. `npm ci` then `npm run smoke` in that clone -> `SMOKE PASS,
gallery · category · editor · export dialog all render in a real browser`.

## Disagreed with the plan

None structurally. Process note: `--fix`'s per-line loop stops at a line's first R0
refusal, so a line with a refusal AND a later otherwise-fixable dash leaves that later
dash untouched too and unlisted in the residual report (found on
`docs/reference/reviews/2026-07-17-cto-core.md:44`, which had three dashes but only one
was reported refused). The handoff's 94-line count and the "5 half-rewritten" figure use
the plan's numbering; the true count of dashes fixed by hand is higher since several
lines carried two dashes.

To get the automatic sweep, the regeneration, the hand edits and the registration into
separate commits despite the sweep and my hand edits touching some of the same files, I
reverted my hand edits back to the mechanical `--fix` text, committed that mechanical
state and its regeneration, then re-applied the hand edits as their own commit and
regenerated again. `e55a2ce9`/`c90402b2` can be read alone as "the mechanical sweep,
unreviewed"; `c23f5c83`/`80a0f0ae` as "the hand edits alone", per the brief's intent.

## Before/after, every hand-rewritten line (94, no sample)

- `.claude/CLAUDE.md:115` before `<!-- This file is the always-loaded INDEX of cross-cutting, always-true facts only. Domain PROCEDURES (changing an engine, adding a role/format, the Figma binder, building a section, shipping, palette research) are owned by on-demand skills/agents in .claude/ — discovered via their frontmatter descriptions, NOT routed from here. Conceptual depth: docs/reference/ + the engine files' header comments. Keep this thin; let the frontmatter system do the routing. Audited via /check-entry-file 2026-07-31 (90→~70 lines: cut boilerplate + a stale ticket count, collapsed 2 skill-duplicated Testing bullets to a pointer, the docs/other guard became a real hook). -->` after `<!-- This file is the always-loaded INDEX of cross-cutting, always-true facts only. Domain PROCEDURES (changing an engine, adding a role/format, the Figma binder, building a section, shipping, palette research) are owned by on-demand skills/agents in .claude/, discovered via their frontmatter descriptions, NOT routed from here. Conceptual depth: docs/reference/ + the engine files' header comments. Keep this thin; let the frontmatter system do the routing. Audited via /check-entry-file 2026-07-31 (90→~70 lines: cut boilerplate + a stale ticket count, collapsed 2 skill-duplicated Testing bullets to a pointer, the docs/other guard became a real hook). -->`
- `.claude/agents/marketing-manager-agent.md:4` before `  Owns the marketing corpus of ultimate-tokens (docs/marketing/ — the voice platform,` after `  Owns the marketing corpus of ultimate-tokens (docs/marketing/, the voice platform,`
- `.claude/skills/maintaining-brand-kit-mcp/references/rubric.md:3` before `Scores a change to 'mcp/' ('brand-kit-core.mjs', the surface — + 'brand-kit-server.mjs' — the stdio` after `Scores a change to 'mcp/' ('brand-kit-core.mjs', the surface, + 'brand-kit-server.mjs', the stdio`
- `.claude/skills/maintaining-figma-plugins/references/figma-styles-hard-constraints.md:19` before `— 'figma/binder/style-plan.mjs' (the 'coreStyleName ? {fontStyle} : {fontWeight}' forks, PR #292)` after `- 'figma/binder/style-plan.mjs' (the 'coreStyleName ? {fontStyle} : {fontWeight}' forks, PR #292)`
- `.claude/skills/maintaining-figma-plugins/references/figma-styles-hard-constraints.md:32` before `keep the exact ratio/em relative units. — 'src/engine/type.mjs#typeTokensFigmaModes', PRs #294/#295.` after `keep the exact ratio/em relative units. – 'src/engine/type.mjs#typeTokensFigmaModes', PRs #294/#295.`
- `.claude/skills/maintaining-figma-plugins/references/figma-styles-hard-constraints.md:42` before `of a long label). — PRs #293/#297/#305.` after `of a long label). – PRs #293/#297/#305.`
- `.claude/skills/maintaining-figma-plugins/references/figma-styles-hard-constraints.md:51` before `zero-from-400 and the first array entry wins arbitrarily. — 'figma/plugin/code.js', PR #300.` after `zero-from-400 and the first array entry wins arbitrarily. – 'figma/plugin/code.js', PR #300.`
- `.claude/skills/maintaining-figma-plugins/references/figma-styles-hard-constraints.md:58` before `  "SemiBold". — PRs #291/#300.` after `  "SemiBold". – PRs #291/#300.`
- `.claude/skills/maintaining-figma-plugins/references/figma-styles-hard-constraints.md:62` before `  install-dependent. — PR #300. Preset-side: sibling weights must be researched against the real` after `  install-dependent. – PR #300. Preset-side: sibling weights must be researched against the real`
- `.claude/skills/maintaining-figma-plugins/references/figma-styles-hard-constraints.md:75` before `of the setter proves nothing. — TKT-0009's BZZR migration (60 specimen nodes), 2026-07-16.` after `of the setter proves nothing. – TKT-0009's BZZR migration (60 specimen nodes), 2026-07-16.`
- `.claude/skills/maintaining-figma-plugins/references/figma-styles-hard-constraints.md:85` before `"same as every other mode" is a value, not an omission. — TKT-0009 follow-up, 2026-07-16.` after `"same as every other mode" is a value, not an omission. – TKT-0009 follow-up, 2026-07-16.`
- `.claude/skills/maintaining-figma-plugins/references/figma-styles-hard-constraints.md:100` before `invisible until a FULL post-migration readback, not the per-step one. — BZZR weight-ramp` after `invisible until a FULL post-migration readback, not the per-step one. – BZZR weight-ramp`
- `.claude/skills/maintaining-figma-plugins/references/figma-styles-hard-constraints.md:114` before `'collection.variableIds', never against 'getVariableByIdAsync''s return value. — BZZR weight-ramp` after `'collection.variableIds', never against 'getVariableByIdAsync''s return value. – BZZR weight-ramp`
- `.claude/skills/project-docs/SKILL.md:44` before `"spec-shaped content lives at rfcs/ — not indexed; /docs-alignment (scribe) can migrate it." A false` after `"spec-shaped content lives at rfcs/, not indexed; /docs-alignment (scribe) can migrate it." A false`
- `.claude/skills/type-scale/SKILL.md:81` before `4. **New treatment? — add the FIFTEEN voices by passing the full 'fonts' palette** ('display/heading/body/ui/mono' — five roles) so 'roleOf' resolves every voice, and supply 'note' (the UI specimen copy reads it). The test asserts every treatment has all fifteen voices + 'fonts'.` after `4. **New treatment? Add the FIFTEEN voices by passing the full 'fonts' palette** ('display/heading/body/ui/mono', five roles) so 'roleOf' resolves every voice, and supply 'note' (the UI specimen copy reads it). The test asserts every treatment has all fifteen voices + 'fonts'.`
- `.claude/skills/type-scale/SKILL.md:82` before `5. **New font? — wire BOTH ends.** 'TYPE_TREATMENTS.fonts' (so a voice uses it) AND 'scripts/gen-type-fonts.mjs#FAMILIES' (so it's embedded), then 'npm run gen:type-fonts' and commit 'src/ui/type-fonts.js'.` after `5. **New font? Wire BOTH ends.** 'TYPE_TREATMENTS.fonts' (so a voice uses it) AND 'scripts/gen-type-fonts.mjs#FAMILIES' (so it's embedded), then 'npm run gen:type-fonts' and commit 'src/ui/type-fonts.js'.`
- `.github/workflows/pages.yml:12` before `# — an automatic deploy in flight.` after `# an automatic deploy in flight.`
- `.sdlc/handoffs/adopt-hygiene-U1.md:52` before `- 'git diff origin/main -- docs/reference/references/decision-records.md | grep -cE '^-[^-]'' —` after `- 'git diff origin/main -- docs/reference/references/decision-records.md | grep -cE '^-[^-]'':`
- `CHANGELOG.md:225` before `  (Display ~90 → 75 → 60 — ×5/6 at Tablet, ×2/3 at Mobile at the top of the ramp, interpolated in` after `  (Display ~90 → 75 → 60, ×5/6 at Tablet, ×2/3 at Mobile at the top of the ramp, interpolated in`
- `README.md:119` before `  binder/   bind-plan.mjs · figma-semantic-binder/          — the standalone Semantic Binder plugin` after `  binder/   bind-plan.mjs · figma-semantic-binder/          : the standalone Semantic Binder plugin`
- `docs/marketing/store-copy.md:399` before `> Account, paste the key, and click Validate. Anything at all: {{SUPPORT_CHANNEL}}. — Ultimate Tokens` after `> Account, paste the key, and click Validate. Anything at all: {{SUPPORT_CHANNEL}}. – Ultimate Tokens`
- `docs/marketing/store-copy.md:405` before `> seats. Manage seats and billing anytime at {{CUSTOMER_PORTAL}}. — Ultimate Tokens` after `> seats. Manage seats and billing anytime at {{CUSTOMER_PORTAL}}. – Ultimate Tokens`
- `docs/marketing/store-copy.md:486` before `> — Ultimate Tokens` after `> – Ultimate Tokens`
- `docs/reference/CHANGELOG.md:420` before `  '"tracking": "-2%"' — % of font size; 7 files, 3,360 fields); 'gen-categories' parses strings only` after `  '"tracking": "-2%"', % of font size; 7 files, 3,360 fields); 'gen-categories' parses strings only`
- `docs/reference/colors/categories/brands.json:5` before `  "tagline": "Seven real brands, <em>read for their actual color</em> — shipped products and researched public identities alike.",` after `  "tagline": "Seven real brands, <em>read for their actual color</em>, shipped products and researched public identities alike.",`
- `docs/reference/colors/categories/brands.json:1808` before `          "source": "Nike's codified identity has been <em>black and white since 1971</em> — the Swoosh in PMS Black 6 C, floating in negative space — with the shoebox and Nike+ <em>orange</em> (≈Pantone 1655 C) and the deep <em>University Red</em> of team kit as the only loud reads.",` after `          "source": "Nike's codified identity has been <em>black and white since 1971</em>, the Swoosh in PMS Black 6 C, floating in negative space, with the shoebox and Nike+ <em>orange</em> (≈Pantone 1655 C) and the deep <em>University Red</em> of team kit as the only loud reads.",`
- `docs/reference/colors/categories/brands.json:1960` before `          "source": "Sampled straight from Burger King's 2021 flame identity (in-house team with JKR). The six chips are the guideline swatches themselves, <em>Fiery Red, Flaming Orange, BBQ Brown, Mayo Egg White, Melty Yellow</em> and <em>Crunchy Green</em> — an analogous, appetite-warm system drawn from the Whopper's real ingredients and the trademark flame-grill.",` after `          "source": "Sampled straight from Burger King's 2021 flame identity (in-house team with JKR). The six chips are the guideline swatches themselves, <em>Fiery Red, Flaming Orange, BBQ Brown, Mayo Egg White, Melty Yellow</em> and <em>Crunchy Green</em>, an analogous, appetite-warm system drawn from the Whopper's real ingredients and the trademark flame-grill.",`
- `docs/reference/colors/categories/travel.json:4638` before `              "note": "Hand-woven <em>bayt al-sha'r</em> — the dark fabric of every encampment.",` after `              "note": "Hand-woven <em>bayt al-sha'r</em>, the dark fabric of every encampment.",`
- `docs/reference/references/component-inventory.md:147` before `  "Chroma basis — …"). The palette site sits in a bare 'field' div with no '<label>' at all` after `  "Chroma basis …"). The palette site sits in a bare 'field' div with no '<label>' at all`
- `docs/reference/references/component-inventory.md:461` before `2. **'segmented()'** ✅ — 6 call-sites, 4 stylings → one helper.` after `2. **'segmented()'** ✅: 6 call-sites, 4 stylings → one helper.`
- `docs/reference/references/component-inventory.md:462` before `3. **'swatch()'** ✅ — primitive + checkerboard-once (composite cells share it; full cell migration deferred).` after `3. **'swatch()'** ✅: primitive + checkerboard-once (composite cells share it; full cell migration deferred).`
- `docs/reference/references/component-inventory.md:463` before `4. **'btn()'** ✅ — variant vocabulary established.` after `4. **'btn()'** ✅: variant vocabulary established.`
- `docs/reference/references/component-inventory.md:464` before `5. **'switchControl()'** ✅ — rebuilt accessibly (fixed finding #1 + dedup 3 sites).` after `5. **'switchControl()'** ✅: rebuilt accessibly (fixed finding #1 + dedup 3 sites).`
- `docs/reference/references/component-inventory.md:465` before `6. **'chip()'** ✅ — 3 stylings → one ('.tile-tag' overlay intentionally separate).` after `6. **'chip()'** ✅: 3 stylings → one ('.tile-tag' overlay intentionally separate).`
- `docs/reference/references/decomposition.md:77` before `'roadmap-planner' ran). What remains is the **tool build**. (Status note: the engine source now lives in this repo at 'src/engine/', 'hct.js', 'tonal.js', 'semantic.js', 'exports.js', etc. — so the original blocker below is resolved; 'gen.js' was never created, the single-source 'src/engine/' module set supersedes it.)` after `'roadmap-planner' ran). What remains is the **tool build**. (Status note: the engine source now lives in this repo at 'src/engine/', 'hct.js', 'tonal.js', 'semantic.js', 'exports.js', etc. So the original blocker below is resolved; 'gen.js' was never created, the single-source 'src/engine/' module set supersedes it.)`
- `docs/reference/references/ui-plan.md:111` before `   …  ┤   ●●                      — tone line` after `   …  ┤   ●●                      ─ tone line`
- `docs/reference/reviews/2026-07-17-cto-app.md:86` before `1. **Split 'app.js' along the existing 'this.section' seam into three files** —` after `1. **Split 'app.js' along the existing 'this.section' seam into three files**,`
- `docs/reference/reviews/2026-07-17-cto-core.md:44` before `'test/ui/headless-boot.mjs' is 2243 lines, 572 'ok(...)' assertions, many of them literal-count change-detectors ('=== 53', '=== 8', '=== 7', '.length === 3', '.length === 4', etc. — e.g. lines 147, 589, 628, 632, 689, 856, 874) scattered across lettered groups, exactly as 'CLAUDE.md' already flags ("keep the count literals in sync when role/step counts change"). This *is* a legitimate zero-dependency-shim design choice and it does work — a real count change will fail loudly. But the literals are unnamed magic numbers repeated at their point of use rather than named constants imported once, so a legitimate feature change (e.g., an 8th default palette) requires hunting N scattered assertions with no single place to update, and there's a real risk a future edit "fixes" an assertion to match new code rather than confirming the new count is actually correct (test tautology risk). Not asking for jsdom or a rewrite — recommend pulling the repeated magic numbers (53 roles, 25 export stops, 19 display stops, 7 scrims, 8 default palettes) into named constants at the top of the file (or importing them from 'role-table.json''s own 'constants'/'rolesPerPalette' where that's literally the answer key already sitting unused by this file). ~2-3 hours, test-only, zero product risk.` after `'test/ui/headless-boot.mjs' is 2243 lines, 572 'ok(...)' assertions, many of them literal-count change-detectors ('=== 53', '=== 8', '=== 7', '.length === 3', '.length === 4', etc.; e.g. lines 147, 589, 628, 632, 689, 856, 874) scattered across lettered groups, exactly as 'CLAUDE.md' already flags ("keep the count literals in sync when role/step counts change"). This *is* a legitimate zero-dependency-shim design choice and it does work, a real count change will fail loudly. But the literals are unnamed magic numbers repeated at their point of use rather than named constants imported once, so a legitimate feature change (e.g., an 8th default palette) requires hunting N scattered assertions with no single place to update, and there's a real risk a future edit "fixes" an assertion to match new code rather than confirming the new count is actually correct (test tautology risk). Not asking for jsdom or a rewrite, recommend pulling the repeated magic numbers (53 roles, 25 export stops, 19 display stops, 7 scrims, 8 default palettes) into named constants at the top of the file (or importing them from 'role-table.json''s own 'constants'/'rolesPerPalette' where that's literally the answer key already sitting unused by this file). ~2-3 hours, test-only, zero product risk.`
- `docs/reference/reviews/2026-07-17-export-drift.md:212` before `| Color stops (raw) | ✅ | ✅ | ✅ | ✅ | ✅ | — (mapped indirectly) | ✅ (verbatim) |` after `| Color stops (raw) | ✅ | ✅ | ✅ | ✅ | ✅ | none (mapped indirectly) | ✅ (verbatim) |`
- `docs/site/mcp-hosting-spec.md:258` before `- **Sign-in UI:** a lightweight "Sign in" (email → "check your inbox") in the app shell / Settings « Account »` after `- **Sign-in UI:** a lightweight "Sign in" (email → "check your inbox") in the app shell / Settings « Account »,`
- `docs/site/mcp-hosting-spec.md:259` before `  — **web only** (hidden 'inFigma'). Signed-in + Pro unlocks **cloud sync** + the **hosted MCP** panel.` after `  **web only** (hidden 'inFigma'). Signed-in + Pro unlocks **cloud sync** + the **hosted MCP** panel.`
- `figma/binder/figma-semantic-binder/code.js:81` before `// the merged "Geometry" collection's type/ half (this binder never touches Font/Type Primitives at all` after `// the merged "Geometry" collection's type/ half (this binder never touches Font/Type Primitives at all,`
- `figma/binder/figma-semantic-binder/code.js:82` before `// — see applyFloatPlans below).` after `// see applyFloatPlans below).`
- `figma/binder/figma-semantic-binder/code.js:495` before `      "<p><b>" + escapeHtmlVM(collectionName) + "</b> — this apply would remove " + atRisk + " variable(s) not in the current plan. " +` after `      "<p><b>" + escapeHtmlVM(collectionName) + "</b>: this apply would remove " + atRisk + " variable(s) not in the current plan. " +`
- `figma/binder/figma-semantic-binder/code.js:718` before `// collection: no change to the provenance functions, no risk to their parity gates. Binder-only (#492)` after `// collection: no change to the provenance functions, no risk to their parity gates. Binder-only (#492),`
- `figma/binder/figma-semantic-binder/code.js:719` before `// — the flagship app-as-plugin keeps its TKT-0024 "never adopt a same-named collection" guarantee` after `// the flagship app-as-plugin keeps its TKT-0024 "never adopt a same-named collection" guarantee`
- `figma/binder/mode-apply-plan.mjs:289` before `// name this grammar could otherwise collide with (weight/<voice>/<slug>, weight-style/<voice>/<slug> —` after `// name this grammar could otherwise collide with (weight/<voice>/<slug>, weight-style/<voice>/<slug>,`
- `figma/binder/mode-apply-plan.mjs:360` before `// name whose live value at 'modeName' is CURRENTLY a resolvable VARIABLE_ALIAS, its one-hop target NAME` after `// name whose live value at 'modeName' is CURRENTLY a resolvable VARIABLE_ALIAS, its one-hop target NAME,`
- `figma/binder/mode-apply-plan.mjs:361` before `// — '{name: targetName}'. This is the "belt" half of the same idempotency fix: even when the alias-map` after `// '{name: targetName}'. This is the "belt" half of the same idempotency fix: even when the alias-map`
- `figma/binder/mode-apply-plan.mjs:465` before `// style-plan.mjs's primitivesModesApplyPlan '{name, type:"ALIAS", target}' shape (Font/Type Primitives)` after `// style-plan.mjs's primitivesModesApplyPlan '{name, type:"ALIAS", target}' shape (Font/Type Primitives),`
- `figma/binder/mode-apply-plan.mjs:466` before `// — an ALIAS entry has no '.values' at all and is reported "changed" unconditionally, matching the` after `// an ALIAS entry has no '.values' at all and is reported "changed" unconditionally, matching the`
- `figma/binder/style-plan.mjs:42` before `//                                                                //   weight/<voice>/<slug> — MUTUALLY` after `//                                                                //   weight/<voice>/<slug>: MUTUALLY`
- `figma/plugin/code.js:773` before `      "<p><b>" + escapeHtmlVM(collectionName) + "</b> — this apply would remove " + atRisk + " variable(s) not in the current plan. " +` after `      "<p><b>" + escapeHtmlVM(collectionName) + "</b>: this apply would remove " + atRisk + " variable(s) not in the current plan. " +`
- `mcp/describe-rubric.mjs:222` before `  effect in L* is not a fixed amount. It applies across all three tone modes — \'even\', \'perceptual\',` after `  effect in L* is not a fixed amount. It applies across all three tone modes: \'even\', \'perceptual\',`
- `mcp/describe-rubric.mjs:250` before `- **Secondary** (absent) = the **complement** of Primary — \'Primary.hue + ${SECONDARY_HARMONY_OFFSET}°\'` after `- **Secondary** (absent) = the **complement** of Primary: \'Primary.hue + ${SECONDARY_HARMONY_OFFSET}°\'`
- `mcp/describe-rubric.mjs:252` before `- **Tertiary** (absent) = the **analogous** neighbor of Secondary — \'Secondary.hue +` after `- **Tertiary** (absent) = the **analogous** neighbor of Secondary: \'Secondary.hue +`
- `scripts/gen-categories.mjs:3` before `// SUPERSEDES gen-travel-presets.mjs. Reads every *.json under docs/reference/colors/categories/ — the` after `// SUPERSEDES gen-travel-presets.mjs. Reads every *.json under docs/reference/colors/categories/, the`
- `scripts/gen-describe-mcp-assets.mjs:59` before `const out = '// GENERATED by gen-describe-mcp-assets.mjs from mcp/ + src/ + docs/reference/data/ — DO NOT EDIT.` after `const out = '// GENERATED by gen-describe-mcp-assets.mjs from mcp/ + src/ + docs/reference/data/: DO NOT EDIT.`
- `scripts/gen-figma-assets.mjs:37` before `const out = '// GENERATED by gen-figma-assets.mjs from figma/binder/figma-semantic-binder/ — DO NOT EDIT.` after `const out = '// GENERATED by gen-figma-assets.mjs from figma/binder/figma-semantic-binder/: DO NOT EDIT.`
- `scripts/gen-mcp-assets.mjs:21` before `const out = '// GENERATED by gen-mcp-assets.mjs from mcp/ — DO NOT EDIT.` after `const out = '// GENERATED by gen-mcp-assets.mjs from mcp/: DO NOT EDIT.`
- `scripts/gen-plugin-pack.mjs:18` before `// Emits dist/plugins/npm/ultimate-tokens-claude/ — the publishable package:` after `// Emits dist/plugins/npm/ultimate-tokens-claude/, the publishable package:`
- `src/engine/ds-export.js:7` before `// bundle, not token serialization) and is specced nowhere in docs/reference/ — it earned its own` after `// bundle, not token serialization) and is specced nowhere in docs/reference/, it earned its own`
- `src/engine/ds-export.js:680` before `    const body = '<div class="motion-row"><div class="motion-dot motion-demo"></div><p class="cap">Enter <code>${dur}ms</code> <code>standard-decelerate</code> · exit <code>${durFast}ms</code> <code>standard-accelerate</code> — only <code>transform</code>/<code>opacity</code> animate.</p></div><p class="cap"><code>prefers-reduced-motion: reduce</code> swaps the moving keyframe for a same-timing cross-fade (opacity only) — reduced, never removed.</p>';` after `    const body = '<div class="motion-row"><div class="motion-dot motion-demo"></div><p class="cap">Enter <code>${dur}ms</code> <code>standard-decelerate</code> · exit <code>${durFast}ms</code> <code>standard-accelerate</code>; only <code>transform</code>/<code>opacity</code> animate.</p></div><p class="cap"><code>prefers-reduced-motion: reduce</code> swaps the moving keyframe for a same-timing cross-fade (opacity only), reduced, never removed.</p>';`
- `src/engine/ds-export.js:776` before `    '  \'${ref(cn + "-inverse-on-surface")}\' (a surface that inverts the app's OWN neutral, toasts, tooltips —',` after `    '  \'${ref(cn + "-inverse-on-surface")}\' (a surface that inverts the app's OWN neutral, toasts, tooltips,',`
- `src/engine/ds-export.js:862` before `    '**${iconSystemLabel(ic)}**${ic.license ? ' (${ic.license})' : ""} is this system's icon set${ic.url ? ' — \'${ic.url}\'' : ""}.',` after `    '**${iconSystemLabel(ic)}**${ic.license ? ' (${ic.license})' : ""} is this system's icon set${ic.url ? ': \'${ic.url}\'' : ""}.',`
- `src/engine/ds-export.js:882` before `    '(\'${MOTION_DURATION.medium1}\'–\'${MOTION_DURATION.medium4}\'ms); full-screen transitions run long (\'${MOTION_DURATION.long1}\'ms+). **100ms is the "instant" floor** —',` after `    '(\'${MOTION_DURATION.medium1}\'–\'${MOTION_DURATION.medium4}\'ms); full-screen transitions run long (\'${MOTION_DURATION.long1}\'ms+). **100ms is the "instant" floor**,',`
- `src/engine/ds-export.js:911` before `    '  variants: **outline** (transparent, \'${ref(brand)}\' border+text), **ghost** (transparent, \'${ref(brand)}\' text —',` after `    '  variants: **outline** (transparent, \'${ref(brand)}\' border+text), **ghost** (transparent, \'${ref(brand)}\' text,',`
- `src/engine/ds-export.js:1141` before `    'Naming standard: **Ultimate Tokens grammar** — \'--{prefix}-{family}-{slot}\', prefix \'${pfx}\', families',` after `    'Naming standard: **Ultimate Tokens grammar**, \'--{prefix}-{family}-{slot}\', prefix \'${pfx}\', families',`
- `src/engine/ds-export.js:1152` before `    '- 🟢 Previews: \'@dsCard\' first line, single \':root\' block — \'color-scheme: light dark\' + ${nGrammar} \'light-dark(oklch, oklch)\' custom properties, no media-query fork',` after `    '- 🟢 Previews: \'@dsCard\' first line, single \':root\' block, \'color-scheme: light dark\' + ${nGrammar} \'light-dark(oklch, oklch)\' custom properties, no media-query fork',`
- `src/engine/ds-export.js:1251` before `    "**React + Tailwind + shadcn ui.** 'styles.css' is this brand's compiled token projection —",` after `    "**React + Tailwind + shadcn ui.** 'styles.css' is this brand's compiled token projection,",`
- `src/engine/ds-export.js:1267` before `    "- Do NOT put text on a fill in anything other than that fill's own '-foreground' class —",` after `    "- Do NOT put text on a fill in anything other than that fill's own '-foreground' class,",`
- `src/engine/ds-export.js:1495` before `    "", "## Which variant? — decision tree", "",` after `    "", "## Which variant? Decision tree", "",`
- `src/engine/ds-gates.js:14` before `//     previews  : Array<{ name: string, html: string }> — the components/*.html cards` after `//     previews  : Array<{ name: string, html: string }>, the components/*.html cards`
- `src/engine/exports.js:184` before `// (no [n] name segment) and does NOT flip between light/dark (an overlay reads the same in both schemes)` after `// (no [n] name segment) and does NOT flip between light/dark (an overlay reads the same in both schemes),`
- `src/engine/exports.js:185` before `// — the one deliberate exception to "every color comes from derivePalette/derivedAll". It still rides` after `// the one deliberate exception to "every color comes from derivePalette/derivedAll". It still rides`
- `src/engine/exports.js:786` before `    // PRIME — --color-{n}-prime-{step} (REQ-054), next to the scale above; the seven identity` after `    // PRIME: --color-{n}-prime-{step} (REQ-054), next to the scale above; the seven identity`
- `src/engine/tonal.js:126` before `// RENDER space, at its ACTUAL saturation/lightness, lands it on the set OKLCH hue exactly, for any damping` after `// RENDER space, at its ACTUAL saturation/lightness, lands it on the set OKLCH hue exactly, for any damping,`
- `src/engine/tonal.js:127` before `// — no CAM16 round-trip. f(h)≈h (slope ≈1), so h ← h − (got − target) is Newton; converges in a few steps.` after `// no CAM16 round-trip. f(h)≈h (slope ≈1), so h ← h − (got − target) is Newton; converges in a few steps.`
- `src/engine/type.mjs:526` before `//   relTrackEm— tracking as 'em' (CSS 'letter-spacing' / DTCG — relative to font size)` after `//   relTrackEm: tracking as 'em' (CSS 'letter-spacing' / DTCG, relative to font size)`
- `src/ui/app-helpers.mjs:48` before `export const ALIASED_README = 'figma-aliased/ — EXPERIMENTAL plugin-free cascade (OD-004)` after `export const ALIASED_README = 'figma-aliased/, EXPERIMENTAL plugin-free cascade (OD-004)`
- `src/ui/app.js:690` before `      // role=button div, NOT a <button> — so the delete can be a real, keyboard-focusable` after `      // role=button div, NOT a <button>, so the delete can be a real, keyboard-focusable`
- `src/ui/app.js:2385` before `  // now → per-token drift in the Mapping table (✓ match / ✗ drifted / — absent). Read-only: it never` after `  // now → per-token drift in the Mapping table (✓ match / ✗ drifted / - absent). Read-only: it never`
- `src/ui/model.mjs:724` before `      // group (SPEC 0.3.0 RP-1, ticket #572): metadata only, one of "material"/"brand"/"system"/"data"` after `      // group (SPEC 0.3.0 RP-1, ticket #572): metadata only, one of "material"/"brand"/"system"/"data",`
- `src/ui/model.mjs:725` before `      // — read straight off projectView's own resolved field (paletteGroup(p) is the single resolver).` after `      // read straight off projectView's own resolved field (paletteGroup(p) is the single resolver).`
- `src/ui/overlays/drawer.js:387` before `      // figma-aliased/ — the SAME tokens, but the Light/Dark leaves carry com.figma.aliasData targeting` after `      // figma-aliased/, the SAME tokens, but the Light/Dark leaves carry com.figma.aliasData targeting`
- `src/ui/overlays/drawer.js:398` before `      // design-system-for-claude-code/ — the LLM design-system bundle: DESIGN.md (the universal-dialect` after `      // design-system-for-claude-code/, the LLM design-system bundle: DESIGN.md (the universal-dialect`
- `src/ui/overlays/drawer.js:407` before `      // design-system-for-google-stitch/ — the SAME canonical DESIGN.md (Stitch consumes one file,` after `      // design-system-for-google-stitch/, the SAME canonical DESIGN.md (Stitch consumes one file,`
- `src/ui/overlays/drawer.js:411` before `      // design-system-for-figma-make/ — a routed guidelines/ tree Figma Make reads directly (no` after `      // design-system-for-figma-make/, a routed guidelines/ tree Figma Make reads directly (no`
- `src/ui/sections/color.js:1330` before `    // per-mode drift cell: check = matches the file / ✗ drifted / — not in the file / · not read yet.` after `    // per-mode drift cell: check = matches the file / ✗ drifted / - not in the file / · not read yet.`
- `src/ui/sections/geometry.js:865` before `  // Shared by geomExampleCard and the canvas ramp's ctlLine so every mock control, canvas or inspector` after `  // Shared by geomExampleCard and the canvas ramp's ctlLine so every mock control, canvas or inspector,`
- `src/ui/sections/geometry.js:866` before `  // — reflects the actual palette being designed, not a generic fallback accent.` after `  // reflects the actual palette being designed, not a generic fallback accent.`
- `src/ui/styles.css:6` before `   boot app.js injects <style id="ultimate-tokens-theme"> — exportCSS() over the 8 default` after `   boot app.js injects <style id="ultimate-tokens-theme">, exportCSS() over the 8 default`
- `src/ui/styles.css:106` before `   the open export '.drawer' <dialog> — never in the web-app preview build (Figma-plugin-embed only,` after `   the open export '.drawer' <dialog>, never in the web-app preview build (Figma-plugin-embed only,`
- `test/engine/exports.mjs:1652` before `  // uiFont font-size pin (#477) — .btn/.pbtn (Card)/.dlg-btn (Dialog) must carry a font-size read from` after `  // uiFont font-size pin (#477): .btn/.pbtn (Card)/.dlg-btn (Dialog) must carry a font-size read from`
- `test/engine/exports.mjs:2219` before `// ABSENT from UI3/ShadCN (no metadata slot short of 'description', #556's own no-Figma-folder ruling)` after `// ABSENT from UI3/ShadCN (no metadata slot short of 'description', #556's own no-Figma-folder ruling),`
- `test/engine/exports.mjs:2220` before `// — every emitted group is one of the four valid ids AND matches model.mjs's paletteGroup(p), the` after `// every emitted group is one of the four valid ids AND matches model.mjs's paletteGroup(p), the`
- `test/engine/fixtures/prime-pre-681.mjs:36` before `// ticket #537 Findings: a hue re-solve here can oscillate at very low saturation without ever converging` after `// ticket #537 Findings: a hue re-solve here can oscillate at very low saturation without ever converging,`
- `test/engine/fixtures/prime-pre-681.mjs:37` before `// — provably unreachable there, not a solver defect — and any fix belongs nowhere near tonal.js's shared` after `// provably unreachable there, not a solver defect, and any fix belongs nowhere near tonal.js's shared`
- `test/engine/prime.mjs:514` before `//      "clipped defaults" gate below) and moved out of this snapshot; Secondary and Info replace them` after `//      "clipped defaults" gate below) and moved out of this snapshot; Secondary and Info replace them,`
- `test/engine/prime.mjs:515` before `//      — both measured unclipped (min room 9 exactly) on the integrated tree. Frozen literals, so the` after `//      both measured unclipped (min room 9 exactly) on the integrated tree. Frozen literals, so the`
- `test/engine/tonal.mjs:243` before `// ── hpg-tonal-rel-chroma: the relChroma "gamut" basis — % of EACH stop's gamut ceiling, so every` after `// ── hpg-tonal-rel-chroma: the relChroma "gamut" basis: % of EACH stop's gamut ceiling, so every`
- `test/figma/binder.mjs:105` before `//    from src/engine/semantic.js's semanticRoles() function body by scripts/gen-figma-binder-code.mjs` after `//    from src/engine/semantic.js's semanticRoles() function body by scripts/gen-figma-binder-code.mjs,`
- `test/figma/binder.mjs:106` before `//    — so this gate is now a TRIPWIRE proving the splice actually landed correctly (a stale build, a` after `//    so this gate is now a TRIPWIRE proving the splice actually landed correctly (a stale build, a`
- `test/mcp/brand-kit-merged.mjs:3` before `// server (#374). Spawns the real (zero-dep) server TWICE, once kitless, once with a sibling brand-kit.json` after `// server (#374). Spawns the real (zero-dep) server TWICE, once kitless, once with a sibling brand-kit.json,`
- `test/mcp/brand-kit-merged.mjs:4` before `// — and drives the full MCP protocol over stdio, proving a generated kit never dead-ends end to end.` after `// and drives the full MCP protocol over stdio, proving a generated kit never dead-ends end to end.`
- `test/ui/headless-boot.mjs:1873` before `// colour CSS: Download-All emits BOTH css-hex/ and css-oklch/ — two co-equal formats, no setting to pick one.` after `// colour CSS: Download-All emits BOTH css-hex/ and css-oklch/, two co-equal formats, no setting to pick one.`