<!-- role=builder level=L3 model=opus effort=high -->
## Status
blocked

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/src/ui/styles.css:
  - Base `button` gains `white-space: nowrap`, and the toolbar-only nowrap rule (with its comment) is deleted.
  - `.chip` now has `line-height: 1` and `white-space: nowrap`. `.insp-actions` gains `flex-wrap: wrap`.
  - `.tyi-font-input` now reads the control roles. `.app-header .docname` drops its padding and radius. `.map-head .ghost` is deleted.
  - `.map-raw-select, .map-raw-input` take the chip row. Their `font: 12px/1.4 mono` shorthand became `font-family: mono` plus `font-size: var(--sh-chip-text)`.
  - The 1240px header rule is now `.app-header button:not(.icon-only), .canvas-header button:not(.icon-only) { padding-inline: calc(var(--sh-control-inset) / 2); }`.
  - `--hh`/`--ch` were added as `max(...)` in the alias block, and the alias comment no longer says the bands stay literal.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/test/repo/control-text.mjs: new gate. It takes an optional path argument, walks the rules inside `@media`, allowlists `.ex-` and `.geom-ex-`, and carries the `.figma-files button { font-size: 11.5px; }` negative control.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/test/run.mjs: `"repo/control-text.mjs"` is registered after `"repo/svg-rules.mjs"`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/test/ui/headless-boot.mjs: new `(cpd6)`, which checks the real `styles.css` text: at 1240px, every header button rule skips `.icon-only` and sets only `padding-inline`. Its negative control restores the old `padding: 4px 7px` rule and must fail.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/test/smoke/smoke.mjs: new control-text block for product-md and content-lg, over four views (Global, palette, Typography, Geometry), with the exclusions and the `pname` radius and min-height checks. The reset afterwards returns to color with nothing selected.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/docs/references/component-inventory.md: the Button and Segmented summary rows and cards are updated: icon-only via `btn()`, `.pane-toggle`, the compound rule, figma/radix folded in, `seg-sm` gone, the Geometry lines. The `.map-raw-select` anatomy line is updated too. Every stale cite was repaired by number.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/docs/specs/app-shell.md: the cite at :87 was repaired (`styles.css:531`).
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/figma/plugin/ui.html: generated bundle, rewritten by `npm test` and the build.

## Checks
- C1 `test -f ... && grep ... && node test/repo/control-text.mjs`: exit 0, pass line printed.
- C2, run with `SDLC_BASE_SHA=40bcf50b` (the brief's base; `$SDLC_BASE_SHA` was empty in the shell, so I set it by hand): exit 1, `missing .figma-files button`.
  - The gate's run on 40bcf50b styles.css exits 1 with 8 FAIL lines: `.app-header .docname`, `.map-raw-select, .map-raw-input`, `.map-head .ghost`, `.chip`, three `.tyi-font-input` lines, and `.app-header button, .canvas-header button`. None of them is `.figma-files button`.
- C2 with the same command at `fe7c9cf6` (before step 3): exit 0. That run has 19 FAIL lines, including `.figma-files button | font-size: 11.5px`.
- C3 node rule-body check: exit 0.
- C4 `--hh`/`--ch`/`:not(.icon-only)` greps: exit 0.
- C5 smoke greps `control text at ` and `data-fk="pname"`: exit 0.
- C6 `node test/repo/citations.mjs` (STALE 0 across 12 docs) plus `icon-only` present and `seg-sm` absent in the inventory: exit 0.
- `node test/ui/headless-boot.mjs`: HEADLESS BOOT PASS, with cpd1 to cpd6 and both cpd6 controls.
- `npm test`: all 55 test files passed, including `repo/control-text.mjs` and `repo/citations.mjs`.
- `npm run smoke`: SMOKE FAIL (2).
  - Passing: both `compound at` lines and the resolver line.
  - Failing: `control text at product-md` and `control text at content-lg`, 21 off each (offenders in Notes).
  - The handoff assigns the runtime proof to step 6, but step 6's criteria require `✓ control text at` at both geometries.

## Notes
plan defect: criterion 2 requires the gate's run on the `$SDLC_BASE_SHA` styles.css to print `.figma-files button`, but at the step base 40bcf50b step 3 already folded that rule into `.segmented button, .figma-files button, .radix-files button` with role values, so the gate correctly does not flag it. The selector is flagged only at fe7c9cf6 (the plan's pre-step-3 base). Fix: drop `.figma-files button` from the list, or swap it for a selector the 40bcf50b run does flag (`.app-header button` or `.map-head .ghost`). The other four selectors pass at 40bcf50b. I did not make the gate print the negative control's selector to satisfy the criterion, because that would make the check vacuous.

- All the step's Do items (1 to 6) are done and left uncommitted in the tree, so after the criterion fix a verifier can run directly. Every other criterion and `npm test` is green.
- Smoke offenders the plan does not cover. Step 6 cannot pass `control text at` until a replan assigns them a fix or an exclusion:
  - `button.pane-back` (palette inspector): 12px. The source is `.pane-head .pane-back { padding: 3px 8px; font-size: 12px }`. The static gate misses it because its selector names no listed control class.
  - `button.toggle` (switch, palette inspector): 13px, from `font: inherit` of the body's 13px.
  - `button.key-slot.empty` x2 (prime key slots): 11px and 84px tall. These are swatch slots, not text controls, so they are likely an exclusion.
  - `button.tyi-voice-name` x15 (Typography inspector): 13px.
- Media-query change (the step 3 verifier finding): the new rule is (0,2,1). It no longer touches `button.icon-only` or `padding-block`, so square icon buttons and part heights hold at 1240px and below.
  - It now beats `.canvas-seg button` (0,1,1) and `.app-header .section-seg button` (0,2,1, earlier in the file). At 1240px and below, canvas-header and section segments get `calc(inset / 2)` inline, which equals `--sh-part-inset` (`geometry.mjs:143`). Before, canvas-seg segments had `inset` and section-seg had `inset * 2`.
  - The media line `.canvas-seg button { padding-inline: var(--sh-control-inset); }` now reaches only canvas-segs outside the canvas header. I left it untouched, as the handoff prescribes the rule text.
- The `.map-raw-*` `font:` shorthand was split so no literal 12px or 1.4 line-height hides in it. The static gate checks only `font-size`, `padding*` and `line-height`, per the handoff.
- I ran smoke with a temporary `slice(0, 60)` to list every offender, then restored the file. The tree holds only the intended smoke edit.
