- 2026-10-07: dropped plan/parallel-batch (6537465d), unit/pb-U4 (4e3b9115), unit/pb-U6 (ba101172), unit/pb-U8 (5c3a1be2): about 8 of 9 points landed in #802; recover with git branch <name> <sha> while objects remain. #786 to be re-checked after T-0016 (Roles tab removed). compute-layers (#788) held until T-0014 lands, then rebase and replan U4/U5 on the new schema.

## T-0015: Hue space toggle (OKLCH/CAM16) also applies to anchored palettes (2026-10-07)

- fix-now: `docs/specs/spec-panda-park-ui-exports.md:481` still quotes the old Panda EX-1 `prime.brightest` and `prime.dimmest` literals (`oklch(0.733 0.1374 264.49)` and `oklch(0.2669 0.1023 258.76)`); update them to the re-pinned values.
- note: the `capped` row flag is still produced by `src/engine/tonal.js` but nothing reads it since `HUE_SPACE_DELTA_E_BOUND_PEAK_CAPPED` and the capped scope were removed from `test/engine/anchor.mjs`.
- note: step 4 edited `docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md`, a finished dated record, for a one-line citation move that `test/repo/citations.mjs` required; the builder flagged it for the planner to rule on.
- note: legacy documents stamped cam16 by the old hydrate now render CAM16-constant anchored ramps and ladders with no migration (user decision 3); `dampStops` still holds OKLCH hue after damping (decision 4, default taken).

## T-0017: Geometry system adopts the Maison ui-kit ladder (tier x scale x size, --g-* and --r-* roles) (2026-10-07)

- fix-now: `test/plugin/geometry-tokens.mjs` has a comment that still says ".control-* class it names must match"; reword it for the `--control-*` and `--chip-*` roles.
- note: `docs/assets/geometry-tokens.json` is the frozen six-size (XS to 2XL) snapshot, still carrying retired fields such as `caret`. Nothing reads it, so regenerate it from the 27 cells or retire it.
- note: `panda-smoke` runs only in CI. Check that CI leg on the PR, since no local run covers it.
- note: main carries `b7b0360f` (#812, describe-eval only), which is not in the lane. Sync the branch with main before opening the PR.
