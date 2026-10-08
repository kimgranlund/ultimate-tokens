<!-- role=builder level=L4 model=opus effort=xhigh -->
## Status
done

## Changes
- src/engine/type.mjs:
  - Adds `export const UI_TEXT` (the 25 CSV rows, copied as-is) and `export function uiText(height, factor = 1)`, which rounds to the half pixel and throws a RangeError for a height not in the table.
  - Retires the two UI rows in SIZES, plus `RANKS6` and `ranksFor`. Rewrites the TKT-0008 comment.
  - UI-control and UI-widget each carry one `MD` step, sized `uiText(32, factor)` and `uiText(24, factor)` through a `uiHeight` field. That size takes no breakpoint compression and no nice-ladder snap.
  - `typeScale` returns `uiText`, all 25 heights at the factor. Header comments updated.
- src/ui/model.mjs: `modeTierNudge` drops the `fam6` helper, its UI paragraph and the four `fam6(["UI-control"|"UI-widget"])` terms. The Label and Tiny nudges stay.
- src/engine/exports.js: `exportPanda` iterates `["SM", "MD", "LG"].filter((r) => steps[r])`.
- test/engine/exports.mjs: the panda assertion expects each voice's own lowercased steps plus `DEFAULT`, read from `typeScl.categories[voice]`.
- figma/binder/migrations.mjs: new comment after the GEOMETRY_FIELD_RENAME_MAP header. The retired `type/ui-control|ui-widget/{xs,sm,lg,xl,2xl}/*` variables and text styles deprecate id-preserving, the same scope decision as `size/{step}/font`.
- figma/binder/style-plan.mjs: comment only; the step-loop comment now says the UI voices carry MD alone. No code change.
- src/ui/sections/typography.js: `all 41 steps` at :525 and :995, and the `× 6 (XS to 2XL)` clause at :526.
- test/ui/counts.mjs: `TYPE_STEPS = 41;` with the comment `(13 voices × 3 + 2 interactive voices × 1)`.
- test/ui/headless-boot.mjs:
  - `(41)` in the comments at :2387 and :2624.
  - The `(ty)` message says `× 1`.
  - The `(tyc)` regex is now `/\b(eleven|11|5[13] steps)\b[^\n]{0,24}voices|\b5[13] steps\b/i`, with the message `(live: 15 voices, 41 steps)`.
- test/smoke/smoke.mjs: the :196 comment says `41-step`, and the :198 message says `(13×3 + 2×1)`.
- test/engine/type.mjs:
  - The :16 section comment notes the one-step UI voices.
  - :22 expects `MD` for the two UI voices, and :84 reads `UI-widget.MD`.
  - New `ui-text-table` group.
  - The nice-ladder sweep checks that the UI voices equal `uiText`, not that they sit on the ladder.
- plugin/ultimate-tokens/skills/typography-tokens/SKILL.md: the prose now says one step, md, from the height-indexed UI text table (`uiText`). Both Steps cells say `md`.
- plugin/ultimate-tokens/skills/typography-tokens/references/interface.md:
  - Wording changed to one md step.
  - The `-sm` and `-lg` class examples are now `-md`, and the `{step}` line-single vars are now `md`.
  - The override example is `UI-control|MD`.
  - The "Composing with control geometry" paragraph and the Don't list are updated.
- plugin/ultimate-tokens/skills/typography-tokens/references/responsive.md: says the two interactive voices never step across breakpoints.
- plugin/ultimate-tokens/skills/typography-tokens/references/prose.md: "have six steps" is now "have one step, `md`".
- test/plugin/typography-tokens.mjs: the Steps-cell mutation needle is `| **UI-control** | ui | md |`. The step-outside-voice leg now uses `--type-ui-control-sm-size`.
- test/figma/plugin.mjs: `librarygrammar` expects `"UI/3XS/size": "type/ui-control/md/size"`. The `addStep("UI", "3XS", ...)` comment says md is ui-control's only step; it is at :2051 here, :2047 at the planner's base.

## Checks
- All nine `(red)` criteria, run verbatim from a bash script: all 9 PASS.
- `for t in test/engine/type.mjs test/plugin/typography-tokens.mjs test/figma/plugin.mjs test/ui/headless-boot.mjs; do node "$t" || exit 1; done`: exit 0, all four PASS.
- (guard) `node test/figma/style-plan.mjs`: exit 0 (PASS, 135 text styles).
- (guard) `node test/engine/categories.mjs`: exit 0.
- Extra regression runs, all exit 0: `node test/ui/model.mjs`, `test/ui/persist.mjs`, `test/figma/binder.mjs`, `test/figma/migrations.mjs`, `test/figma/mode-apply.mjs`, `test/engine/ds-gates.mjs`, `test/engine/adia-derived-exports.mjs`, `test/repo/em-dash.mjs`.
- `node test/run.mjs` (no asset regeneration): 4 of 54 files failed.
  - `engine/exports.mjs`, design-system-catalog: "the ladder's MD font must differ from the composed UI-control MD size".
  - `engine/geometry.mjs`: "composition is value-neutral at defaults".
  - `mcp/brand-kit.mjs`: "get_geometry font ... got 14, want 15".
  - `mcp/core.mjs:58`: "the served geometry font is the DECOUPLED control-text ramp (15 at bh28 ...)".
- `npm test` not run, because it regenerates committed assets outside this step.

## Notes
- Expected reds. The step's Do leaves three tests red on purpose:
  - `test/engine/geometry.mjs`, the composition leg (step 2).
  - `test/engine/exports.mjs`, the design-system-catalog leg (step 3).
  - `test/mcp/brand-kit.mjs`, get_geometry (step 4).
- `test/mcp/core.mjs:58` is a fourth red with the same cause. Geometry composes its MD font from UI-control MD, so the served font moved from 15 to 14. Step 1's left-red list does not name this test, but the last line of the task handoff's `## Plan review` assigns the `test/mcp/core.mjs` get_geometry block to step 4. It is not a gate of this step, so I did not re-run it at base. The planner's full `npm test` at `10352b1a` was green.
- Edits the Do did not name. Each is in a file this step already touches, or in the same consumer skill:
  - `test/engine/type.mjs` nice-ladder sweep: at bodyBase 13 and 20, `uiText` as specified gives UI-control 11.5 and 17.5, which are off the nice ladder. The sweep now checks that the UI voices equal `uiText(h, bodyBase/16)`. The prototype used whole-number rows, so it never hit this.
  - `test/plugin/typography-tokens.mjs` step-outside-voice leg: no voice has an `xl` step any more, so `--type-body-xl-size` reported "unknown step" and the leg's needle `not a step of voice "body"` could not match. The leg now uses `--type-ui-control-sm-size` and expects `not a step of voice "ui-control"`.
  - Stale-count repairs: one line in `prose.md`, the `style-plan.mjs` step-loop comment, `typography.js:526`, and the `smoke.mjs:198` message.
- What the verifier should expect:
  - At a bodyBase other than 16, the UI voice sizes can land on half pixels, as the `uiText` spec says (UI-widget is 13.5 at bodyBase 18).
  - Desktop Lg and Xl no longer enlarge the UI voices, because the four `fam6` terms are gone.
  - The geometry paragraph in interface.md now covers only the type voice. It says nothing about how geometry composes its text, since step 2 changes that.
- The committed generated bundles (`figma/plugin/ui.html`, `src/ui/*-assets.js`, `src/ui/describe-mcp-assets.js`) were not regenerated, per rule 6. `npm test` will rewrite them, so a dirty tree after it comes from that regeneration.
- `$SDLC_BASE_SHA` and `$SDLC_TMP_WORKTREES` were empty in this shell. No gate went red, so no throwaway worktree was needed.
