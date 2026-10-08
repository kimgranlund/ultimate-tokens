<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/src/ui/styles.css: items 1 to 3 are kept from the first build. Item 7 changes these rules, each edited on its existing line:
  - `.pane-head .pane-back` is now `{ flex: none; }`.
  - `.toggle` drops `font: inherit;`. Its comment now says the cell's text size comes from the base button rule. The comment is still three lines, so no line moved.
  - `.tyi-voice-name` takes `font-size: var(--sh-control-text)`.
  - `.tyi-voice-font` gains `min-width: 0; overflow: hidden; text-overflow: ellipsis;`.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/test/repo/control-text.mjs: item 8 changes:
  - `CLASSES` gains `pane-back`, `toggle` and `tyi-voice-name`.
  - New violation: a `font` shorthand with no `var(`, unless a later `font-size` in the same rule uses a `var(`. The header comment names this rule.
  - A second negative control: `.toggle { font: inherit; }` must give exactly one violation.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/test/smoke/smoke.mjs: item 9. The skip list gains `.key-slot`, and the block comment gives the reason (they are swatch-footprint add tiles).
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/test/run.mjs, test/ui/headless-boot.mjs, docs/references/component-inventory.md, docs/specs/app-shell.md: the first build's work (items 4 and 6), kept unchanged.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/geometry-compound-insets/figma/plugin/ui.html: generated bundle, rewritten by `npm test` and the build.

## Checks
All runs used `SDLC_BASE_SHA=40bcf50b364e6834d80e049638111a1b7a367bd7`.
- C1, gate on the tree: exit 0, pass line printed.
- C2, gate on the base `styles.css`: the gate exits non-zero with 13 FAIL lines. All eight required selectors are present, including `.pane-head .pane-back`, `.toggle | font: inherit` and `.tyi-voice-name`. The criterion exits 0. The count matches the planner's 13-violation prototype.
- C3, four-rule stdin sample: exactly 3 FAIL lines (toggle, pane-back, voice name). The `button { font: inherit; font-size: var(...) }` rule passes. Exit 0.
- C4, rule-body check (nowrap, chip, insp-actions, map-raw): exit 0.
- C5, exact-selector check (pane-back, toggle, voice name, voice font): exit 0.
- C6, `--hh`, `--ch` and `:not(.icon-only)` greps: exit 0.
- C7, smoke greps including `.tyi-weight-del, .key-slot")`: exit 0.
- C8, `node test/repo/citations.mjs`: STALE 0 across 12 docs. `icon-only` is in the inventory and `seg-sm` is not. Exit 0.
- C9, `node test/ui/headless-boot.mjs`: HEADLESS BOOT PASS.
- `node scripts/audit-citations.mjs --md` after the edits: no stale cites.
- `npm test`: all 55 test files passed, including `repo/control-text.mjs`.
- `npm run smoke` (build, then headless Chrome): SMOKE PASS.
  - `control text at product-md: 135 controls` and `control text at content-lg: 135 controls` both pass, so items 7 and 9 clear all 21 offenders from the first build.
  - Both `compound at` lines and the resolver line pass.

## Notes
- Nothing is committed (this is not a merge step), and no throwaway worktree was created.
- The control-text smoke result is from Chrome only. Safari is unproven.
- `.settings-nav-item`, `.linklike`, `.tok-input` and `.account-license-input` are left outside the gate's class list on purpose, per item 8.
