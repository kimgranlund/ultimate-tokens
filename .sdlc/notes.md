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

## PR #810 review follow-ups (2026-10-08, held until T-0021 lands: they edit tonal.js, prime.mjs and model.mjs)
- decide: add a constancy gate to `test/engine/anchor.mjs`: oklch ladder rung hue within tol of the anchor OKLCH hue (shift 0) and cam16 perceptual stops with C >= 5 within tol of `anchor.cam.hue`, counting solver fallbacks (reviewer's Major: today no gate proves the solves hit their targets; fixtures were re-captured from the same engine).
- note: `rungHue` in `src/engine/prime.mjs` is not memoized (up to 90 x 6 solves in the widening loop) and the cam16 solve in `tonal.js` runs up to about 81 probes per stop: memoize per distinct lightness inside one `primeSwatches` call and time a near-bound anchor while dragging a slider.
- note: `solveOkhslHueForCam16` uses an achromatic cutoff of C < 5 where `solveCam16Hue` uses 0.4, and drops a valid bracket when one bisection midpoint is achromatic; pale stops can jump from the CAM16 hue line to the OKLCH one. A grey anchor targets the residue hue with no #739 guard (`prime.mjs`, `model.mjs`), where ramps use `palette.hue`.
- note: the Hue space label title in `src/ui/sections/color.js` promises "at most 0.02 OKLab dE", measured only on the corpus; a large `hueShift` can exceed it. Reword to "barely visible" or gate a hueShift subject. ADR-031 decision (3) overstates the legacy cam16 change (only perceptual and peak ramps move, within 0.02).

## PR #813 review follow-ups (2026-10-08)
- Major 1 and minor 8 (Figma legacy size renames, alias changed-count): ticket T-0026, planner running.
- Held until T-0025 lands (they edit `src/ui/app.js`, `styles.css`, `icons.js`): major 2 (`icons.js:48` inline `width:var(--sh-control-icon, Npx)` overrides every explicit `icon(name,{size})` and the geometry specimen glyph sizes; the `geo-row` headless check reads the span not the svg), major 3 (`app.js` ~:2334-2342 injects unscoped `:where(:root)` and `:where(*, :host)` role rules into `document.head`; scope them to `:where(ultimate-tokens)`; two instances share style ids), minor 6 (`geometry.mjs:314` breakpoint CSS uses `:root`, use `:where(:root)`), minor 7 (`test/engine/categories.mjs:266-272` pass-through leg vacuous and still checks `doc.geometry.ramp`; stale comments in `categories.mjs:6`, `gen-categories.mjs:224,445`, `mode-apply-plan.mjs:250`). Fold into the T-0027 UI steps together with the pixel-review defects (chrome overflow at larger tiers, Settings segmented label wrap, faint light-theme headings, geometry canvas icon sizes, micro-sm switch, geometry inspector chip wraps).
- Held until T-0021 lands (`persist.js`): minor 4 (pre-v9 geometry with neither treatment nor baseHeight lands on 32px default, not 28) and minor 5 (mode migration collapses a materialized 28/26/24 set to sm/sm/sm with no warning).
