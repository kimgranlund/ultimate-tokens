- 2026-10-07: dropped plan/parallel-batch (6537465d), unit/pb-U4 (4e3b9115), unit/pb-U6 (ba101172), unit/pb-U8 (5c3a1be2): about 8 of 9 points landed in #802; recover with git branch <name> <sha> while objects remain.

## T-0015: Hue space toggle (OKLCH/CAM16) also applies to anchored palettes (2026-10-07)

- note: the `capped` row flag is still produced by `src/engine/tonal.js` but nothing reads it since `HUE_SPACE_DELTA_E_BOUND_PEAK_CAPPED` and the capped scope were removed from `test/engine/anchor.mjs`.
- note: step 4 edited `docs/reports/2026-08-20-reactivity/02-sections-and-resolvers.md`, a finished dated record, for a one-line citation move that `test/repo/citations.mjs` required; the builder flagged it for the planner to rule on.
- note: legacy documents stamped cam16 by the old hydrate now render CAM16-constant anchored ramps and ladders with no migration (user decision 3); `dampStops` still holds OKLCH hue after damping (decision 4, default taken).

## T-0017: Geometry system adopts the Maison ui-kit ladder (tier x scale x size, --g-* and --r-* roles) (2026-10-07)

- note: `panda-smoke` runs only in CI. Check that CI leg on the PR, since no local run covers it.

## PR #810 review follow-ups (2026-10-08, held until T-0021 lands: they edit tonal.js, prime.mjs and model.mjs)
- decide: add a constancy gate to `test/engine/anchor.mjs`: oklch ladder rung hue within tol of the anchor OKLCH hue (shift 0) and cam16 perceptual stops with C >= 5 within tol of `anchor.cam.hue`, counting solver fallbacks (reviewer's Major: today no gate proves the solves hit their targets; fixtures were re-captured from the same engine).
- note: `rungHue` in `src/engine/prime.mjs` is not memoized (up to 90 x 6 solves in the widening loop) and the cam16 solve in `tonal.js` runs up to about 81 probes per stop: memoize per distinct lightness inside one `primeSwatches` call and time a near-bound anchor while dragging a slider.
- note: `solveOkhslHueForCam16` uses an achromatic cutoff of C < 5 where `solveCam16Hue` uses 0.4, and drops a valid bracket when one bisection midpoint is achromatic; pale stops can jump from the CAM16 hue line to the OKLCH one. A grey anchor targets the residue hue with no #739 guard (`prime.mjs`, `model.mjs`), where ramps use `palette.hue`.
- note: the Hue space label title in `src/ui/sections/color.js` promises "at most 0.02 OKLab dE", measured only on the corpus; a large `hueShift` can exceed it. Reword to "barely visible" or gate a hueShift subject. ADR-031 decision (3) overstates the legacy cam16 change (only perceptual and peak ramps move, within 0.02).

## PR #813 review follow-ups (2026-10-08)
- Major 1 and minor 8 (Figma legacy size renames, alias changed-count): ticket T-0026, planner running.
- Held until T-0025 lands (they edit `src/ui/app.js`, `styles.css`, `icons.js`): major 2 (`icons.js:54` inline `width:var(--sh-control-icon, Npx)`, which T-0027 step 5 no longer applies to an explicit `icon(name,{size})`, and the geometry specimen glyph sizes; the `geo-row` headless check reads the span not the svg), major 3 (`app.js` ~:2334-2342 injects unscoped `:where(:root)` and `:where(*, :host)` role rules into `document.head`; scope them to `:where(ultimate-tokens)`; two instances share style ids), minor 6 (`geometry.mjs:314` breakpoint CSS uses `:root`, use `:where(:root)`), minor 7 (`test/engine/categories.mjs:266-272` pass-through leg vacuous and still checks `doc.geometry.ramp`; stale comments in `categories.mjs:6`, `gen-categories.mjs:224,445`, `mode-apply-plan.mjs:250`). Pixel-review defects whose majors landed in #818 are spent; still open: faint light-theme headings, micro-sm switch.
- Held until T-0021 lands (`persist.js`): minor 4 (pre-v9 geometry with neither treatment nor baseHeight lands on 32px default, not 28) and minor 5 (mode migration collapses a materialized 28/26/24 set to sm/sm/sm with no warning).

## T-0026: Figma apply must not prune legacy size/* variables on an existing file (PR #813 review, major 1) (2026-10-08)

- decide: when both the kebab name and its pre-wave spelling (`size/MD/height`) exist in one file, both map to the same target. The rename loop renames the first and skips the second, because the target already exists, so the second is pruned. Decide whether that is acceptable or needs a guard or a disclosure.
- note: no run exercised a live Figma file; checks used mock and VM plans only. Run the `figma-file-migration` skill against a real previously applied file to confirm the bindings survive.
- note: the retired `type/ui-control|ui-widget/{xs,sm,lg,xl,2xl}/*` variables deprecate with ids kept rather than map to `md`. Layers bound to them keep a deprecated variable, not an md one.

## T-0027: Compound insets and radius composition for container components (segmented, listbox), square ghost icon buttons, unstyled palette name input (2026-10-08)

- decide: the canvas header clips its trailing tools (recenter, zoom, "+ Palette") at content-lg, seen in `smoke-out/compound-content-lg.png`. It needs a choice between wrapping, scrolling and collapsing, and no gate checks horizontal fit.
- decide: the palette Name field (`input[data-fk="pname"]`) is item 1 of the ticket. No artifact shows a dedicated style change for it, and the only evidence is that the `control text at` smoke covers it in Chrome. Confirm it looks right in Safari, or say what is still missing.
- fix-now: at viewport widths up to 1240px, `.app-header button, .canvas-header button { padding: 4px 7px; }` in `src/ui/styles.css` (~:1579) ties `button.icon-only` on specificity and comes later. Header icon buttons get padding back, and `.canvas-seg button` can grow past the part height. Smoke runs at 1440x900, so it misses this.
- fix-now: `typeTokensBreakpointCSS` in `src/engine/type.mjs` still writes `:root {` while `geomTokensBreakpointCSS` now writes `:where(:root) {`.
- fix-now: the stale `ramp` comment at `figma/binder/mode-apply-plan.mjs:250` was left for T-0026.
- note: Safari is unproven for the compound insets, the control text sizes and the square icon buttons. Smoke runs in Chrome only, and the user previews in Safari.
- note: the three micro cells (micro-sm-sm, micro-sm-md, micro-md-sm) have a chip taller than the part. The step 1 test names them literally as exceptions to the compound law.
- note: `.account-license-input`, `.tok-input`, `.settings-nav-item` and `.linklike` sit outside the selector list in `test/repo/control-text.mjs`, by design.
- note: step 5 moved 93 `src/ui/app.js` doc cites by number, so a concurrent lane that edits `src/ui/app.js` will conflict on them at merge.
- note: two PR #813 pixel-review items stay open in `.sdlc/notes.md`, the faint light-theme headings and the micro-sm switch, because no record says what was seen.
- note: `panda-smoke` runs only in CI, so it has not been seen green for this branch.

## T-0021: Compute layers: rebase U1-U3 onto main, then U4 pins and U5 ramp@2 on schema v9 (#788) (2026-10-08)

- fix-now: Restore the gated citation shape for the `layers.mjs` and `controls.mjs` paths in `.claude/skills/adding-export-formats/references/foundations.md` now that the files are tracked.
- note: `docs/specs/` and the `.sdlc/plans/archive/compute-layers-adr-draft.md` R102 text also asked for a `baseIntensity` rename. This plan treated the U5 ruling as closing that half, so `model.mjs` still reads `doc.baseIntensity` (`docControls` maps it to `baseChroma`).

## T-0029: Rebuild the app's analysis charts as native DOM (HTML/CSS marks) following /Users/kimgranlund/Projects/nonoun/native-dom-charts (2026-10-08)

- fix-now: Add the 390px viewport pixel check for the three rails, which the handoff requires and no step ran.
- decide: ADR-035 is written as PROPOSED, and Safari/WebKit rendering of the ribbons, masks and rects (dev browser) is unverified. The user needs to review the ADR and the Safari look before it is ratified.
- note: Main has moved past this lane's merge base. A resync will conflict on `scripts/bundle.mjs` `MODS`, `test/smoke/smoke.mjs` and the `decision-records.md` append (ADR-035 follows main's ADR-034). Citation repairs may need redoing.
- note: The mask-dash encoding may read poorly on steep runs, such as the geometry height diagonal and non-kit tier lines. The fallback is CSS only: drop `--dash` from the class.
- note: `.sdlc/baseline.md` still shows `npm test` at 54 test files (now 56), and `.sdlc/architecture.md`'s DD4 row cites the retired CLAUDE.md line. Neither is part of `npm test`, so re-measure at pre-land.
