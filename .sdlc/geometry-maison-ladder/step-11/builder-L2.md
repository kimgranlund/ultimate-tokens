<!-- role=builder level=L2 model=opus effort=low -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-maison-ladder/src/ui/icons.js: added `style="width:var(--sh-control-icon, ${size}px);height:var(--sh-control-icon, ${size}px)"` to the `<svg>` in `icon()`. The `width`/`height` attributes are unchanged.

## Checks
- `grep -qF 'var(--sh-control-icon, ${size}px)' src/ui/icons.js`: match found (red criterion now passes).
- `grep -qF 'width="${size}" height="${size}"' src/ui/icons.js`: match found (guard passes).
- `node test/ui/headless-boot.mjs`: printed "HEADLESS BOOT PASS, all Phase-3 interaction assertions hold". The `exit=0` I echoed came from `tail`, not from the test. The PASS line is the evidence.

## Notes
I did not check pixel rendering. Smoke runs in CI only.
