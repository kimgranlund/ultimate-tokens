<!-- role=builder level=L2 model=opus effort=low -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/src/ui/styles.css
  - `:root`: removed `--ctl-thumb: 15px` and the comment above it, which no longer applied.
  - `ultimate-tokens` alias block: added `--ctl-thumb: calc(var(--sh-control-icon) - 4px)`.
  - `.chip`: now uses `min-block-size: var(--sh-chip-height)`, `padding-block: 0`, `padding-inline: var(--sh-chip-inset)`, `font-size: var(--sh-chip-text)` and `gap: calc(var(--sh-chip-inset) / 2)`. The 999px radius stays.
  - `.toggle .track`: now `inline-size: calc(1.75 * var(--sh-control-icon))` and `block-size: var(--sh-control-icon)`.
  - `.toggle.on .track::after`: now `translateX(calc(0.75 * var(--sh-control-icon)))`.

## Checks
- (red) awk check on the `.chip` block: passed (exit 0).
- (red) `! grep -qE -- '--ctl-thumb: *[0-9]' src/ui/styles.css`: passed.
- (red) awk check on the `.toggle .track` block, looking for `var(--sh-control-icon)`: passed.
- (red) `! grep -qF 'translateX(15px)' src/ui/styles.css`: passed.
- (guard) `node test/ui/headless-boot.mjs`: passed, printed "HEADLESS BOOT PASS", exit 0.

## Notes
- No pixels were checked here because smoke runs in CI only.
- With the fallback `--sh-control-icon` of 16px, the switch thumb is now 12px instead of 15px, and the track is 28x16 instead of 34x19.
- I removed the `:root` comment about `--ctl-thumb` being "intentionally not derived". It described the old literal and would have been out of date after this change.
- Nothing is committed.
