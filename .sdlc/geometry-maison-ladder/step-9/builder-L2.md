<!-- role=builder level=L2 model=opus effort=low -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/src/ui/styles.css: `.segmented button`, `.segmented.seg-sm button`, `.canvas-seg button` and `.app-header .section-seg button` now size from the `--sh-*` role tokens, as the Do section specifies.

## Checks
- Criterion 1 (red), the `.segmented button` block: pass.
- Criterion 2 (red), the `.segmented.seg-sm button` block: pass.
- Criterion 3 (red), the canvas-seg and section-seg loop, run in a subshell: pass.
- (guard) `node test/ui/headless-boot.mjs`: HEADLESS BOOT PASS.
- `grep -cE 'sh-(control-height|control-inset|control-text|radius-inset|chip-height|chip-inset|chip-text):' src/ui/styles.css` returned 7, so all seven `--sh-*` tokens these rules use are defined in styles.css (step 7).

## Notes
- No pixels were checked. Smoke runs only in CI.
- I did not run `npm test`. The handoff lists only the headless guard.
