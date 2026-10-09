<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization-s7/src/ui/styles.css`: 37 rules changed, one line each, in the `.typo-`, `.type-spec-`, `.ty-role`, `.tyi-` (step-7 families only) and `.geom-` families. Their literal size, weight, line-height, tracking and case now read the shell roles. The line count is unchanged.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization-s7/test/repo/shell-text.mjs`: removed the `"step-7"` key from `PENDING`.

## Checks
- The (red) criterion, run by hand on the clean tree at base 5a6bd08e before the first edit: exit 1, `62 off`.
- The (red) criterion after the edit: exit 0, `0 off`.
- `node test/repo/shell-text.mjs && ! grep -qF '"step-7"' test/repo/shell-text.mjs`: exit 0. It passes with 151 declarations still pending in step-5, step-6 and step-8.
- (guard) `node test/repo/ui-polish.mjs`: exit 0, all 6 stylesheet checks pass.
- (guard) `node test/repo/citations.mjs`: exit 0, 0 STALE across 13 docs.
- (guard) The scope check `test -z "$(git diff --name-only $SDLC_BASE_SHA -- src/ui/app.js ... .claude/skills)$(git ls-files --others ...)"`: exit 0.
- `node test/repo/em-dash.mjs`: exit 0.

## Notes
- Process: `redck.py record` printed `redck: no (red) criteria` and recorded nothing. The (red) span contains the comparisons `i<t` and `o<0||o>=t`. `steps.PLACEHOLDER_RE` reads them as a placeholder, so `steps.guard_skipped` drops the span. I ran the same span by hand before the first edit (exit 1, `62 off`, 2026-10-09T03:33:26Z). `redck audit` will likely log a missing-checkpoint deviation, but the cause is the tool, not the build order.
- Rules not on the binding list got their role from the fallback rules:
  - helper: `.typo-cat-head small`, `.typo-step`, `.type-spec-head small`, `.type-spec-grouphead small`, `.type-spec-count`, `.type-spec-meta`, `.tyi-voices-head small`, `.tyi-voice-font`, `.tyi-voice-stats dd`, `.tyi-font-legend`, `.geom-spec-head small`, `.geom-shared-note`, `.geom-spec-grouphead small`, `.geom-spec-count`, `.geom-spec-meta`, `.geom-an-cap`, `.geom-comp-note`, `.geom-comp-row`.
  - label: `.ty-role` and `.ty-role .ty-role-fam` (rule 5, they name `-role`), and `.tyi-voice-stats dt` (it names `dt`).
  - weight only: `.tyi-weights-core` now reads `--ui-weight-regular` and `.geom-comp-k` reads `--ui-weight-strong`. Both keep their colors.
- Every rule with `font-variant-numeric` sets it again after the `font` shorthand.
- The rewrite rule changes some visible ink colors:
  - The helper rules that used `--ink-faint` now use the helper ink (ink-dim).
  - `.type-spec-token`, `.geom-spec-token` and `.geom-lad-v` change from ink-dim to the code ink (ink).
  - `.ty-role-fam` changes from ink to the label ink (ink-dim).
  - `.geom-select` gains `color: var(--ui-control-ink)`. No file under `src/ui` other than styles.css uses `.geom-select`.
- `.ty-role-fam` keeps its inline `font-family` (`src/ui/sections/typography.js:124`), which overrides the family the shorthand sets.
- These rules were left unchanged, as the handoff says: `.tyi-voice-name*` and `.tyi-font-input` (step 8), and `.geom-ex-`, `.geom-ctl`, `.geom-glyph` and `.geom-caret`.
- No doc cites needed repair. The styles.css line count is unchanged, and the 4 lines removed from `shell-text.mjs` are not cited in any doc. The conductor's citation run after merging steps 5, 6 and 7 still applies.
- `npm test` was not run. It regenerates committed bundles (`figma/plugin/ui.html` embeds styles.css), which would write files outside this step's scope in a parallel lane. Only the criteria checks above ran.
