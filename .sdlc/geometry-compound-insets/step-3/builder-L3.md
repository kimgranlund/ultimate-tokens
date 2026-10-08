<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/src/ui/styles.css: added the `--sh-part-height` and `--sh-part-inset` aliases. One compound container rule now covers `.segmented, .figma-files, .radix-files`, and one part rule covers their buttons, with the `.on` state on all three. Deleted the old `.figma-files`/`.radix-files` rules, `.segmented.seg-sm button`, and the 1240px `.segmented button { padding: 5px 8px; }` line. In that media block `.canvas-seg button` now sets `padding-inline: var(--sh-control-inset)`. Added `button.icon-only` with its `:hover` and `[aria-pressed="true"]` rules. Trimmed `.pane-toggle`, `.pane-toggle.on` and `.mode-control .mode-add`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/src/ui/app-helpers.mjs: `btn()` emits `icon-only` instead of `ghost` when the variant is the default `ghost` and `children` is one `.ic` element, bare or a one-item array.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/src/ui/app.js: `paneToggle` class is now `"icon-only pane-toggle pane-toggle-" + side + ...`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/src/ui/sections/color.js: removed `cls: "seg-sm"` from the Hue space and On-colors `segmented()` calls.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/test/ui/headless-boot.mjs: new `(cpd)` group (cpd1 to cpd5). cpd5 checks the real `styles.css` text and includes two negative controls on mutated copies.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/test/smoke/smoke.mjs: new compound block for product-md and content-lg, measured against the engine cells. It writes `compound-product-md.png` and `compound-content-lg.png`, then resets `shellGeometry`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/figma/plugin/ui.html: generated bundle, rewritten by `npm test`/`npm run build` from the source edits above (a committed asset, not hand-edited).

## Checks
- C1 `--sh-part-height`/`--sh-part-inset` grep: exit 0.
- C2 segmented/figma/radix rule-body node check: exit 0.
- C3 no literal padding on segmented-family selectors, and no `seg-sm` left: exit 0.
- C4 `button.icon-only` body, plus pane-toggle/mode-add free of padding, font-size and border-color: exit 0.
- C5 `icon-only pane-toggle` class in app.js and `icon-only` in app-helpers.mjs: exit 0.
- C6 `node test/ui/headless-boot.mjs && test "$(grep -c '(cpd' ...)" -ge 5`: exit 0. HEADLESS BOOT PASS, 8 `(cpd` occurrences.
- C7 smoke greps for `compound at `, `compound-product-md.png` and `compound-content-lg.png`: exit 0.
- `npm test`: exit 1. 1/54 files failed, `repo/citations.mjs`: 14 stale cite lines in `docs/references/component-inventory.md` (46,112,117,118,120,185,255,263,264,291,334,335,370,375) and 1 in `docs/specs/app-shell.md` (87). Every other file passed.
- Base check: `node test/repo/citations.mjs` at `fe7c9cf6` in a throwaway worktree: pass ("STALE 0 across 12 discovered docs"). The worktree was removed afterwards (`git worktree list` shows none).
- `npm run smoke`: exit 0, SMOKE PASS. Both checks passed: "compound at product-md" and "compound at content-lg".

## Notes
- The `npm test` red is planned work for step 4, and the base run shows this step caused it, so it is not inherited. This step adds 49 lines to `styles.css`, which pushes 15 cites past the gate's NEAR tolerance. `planner-L3.md` (line 183) names step 4 as "the only step that repairs cites" in `component-inventory.md` and `app-shell.md`, so this step left `docs/` untouched.
- Planner item, not fixed (out of the handoff's enumerated media-query edits): at viewports up to 1240px, `.app-header button, .canvas-header button { padding: 4px 7px; }` (styles.css ~:1579) beats `button.icon-only`. Both have specificity (0,1,1) and the media rule comes later in the file.
  - Header and canvas-header icon-only buttons get padding back. Their size stays a control-height square because `inline-size`/`block-size` are explicit, but the padding is not 0.
  - `.canvas-seg button` picks up `padding-block: 4px`, because the new media line only overrides the inline axis. The old `padding: 5px 10px` overrode all four sides.
  - The smoke runs at 1440x900, so it does not exercise this. The narrow case is the Figma plugin window.
- `button.icon-only:hover { background: var(--line-2); }` was added on purpose. `button.icon-only { background: transparent }` comes after `button:hover` at equal specificity, so without that rule an icon-only button would never show the base hover fill the handoff asks for.
- `compound-content-lg.png` shows the app-header and canvas-header bands clipping the taller content-lg controls, because the band heights `--hh`/`--ch` are literal. Step 4 ("chrome bands that grow with the tier") owns that.
- `drawer.js` was not touched. The Figma and Radix pickers pick up the compound rule through their `baseClass`.
