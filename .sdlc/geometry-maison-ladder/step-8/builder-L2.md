<!-- role=builder level=L2 model=opus effort=low -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/src/ui/styles.css: the `button {` rule now uses `font-size: var(--sh-control-text)` (placed after `font: inherit`), `border-radius: var(--sh-control-radius)`, `min-block-size: var(--sh-control-height)`, `padding-block: 0`, `padding-inline: var(--sh-control-inset)` and `gap: calc(var(--sh-control-inset) / 2)`. The `input[type="text"], input[type="search"], select {` rule gets the same changes without `gap`.

## Checks
- (red) criterion 1, the button block holds all four `--sh-control-*` vars: exit 0
- (red) criterion 2, the button block has no `padding: Npx`: exit 0
- (red) criterion 3, the input block has `--sh-control-height` and no `padding: Npx`: exit 0
- (guard) `node test/ui/headless-boot.mjs`: "HEADLESS BOOT PASS", exit 0

## Notes
Only the two base rules changed. Pixels were not checked because smoke runs only in CI. The full `npm test` was not run, since the criteria name only the headless guard.
