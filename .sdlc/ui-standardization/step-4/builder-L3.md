<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization/src/ui/styles.css: moved the step-4 family rules onto the `--ui-*` text roles. The host rule `ultimate-tokens` gains the body font and ink. Weight-only rules (`.ramp-group-count`, `.scrim-ctx-head small`, `.ramp-name`, `.ramp-name small`) now use the weight tokens. The `.radix-tip` comment is reworded to match.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization/test/repo/shell-text.mjs: removed the `"step-4"` key from `PENDING`.

## Checks
- (red) control run by hand before any edit (line 38 of the handoff extracted to a scratch script): exit 1, `52 off`.
- (red) after the change: exit 0, `0 off`.
- `node test/repo/shell-text.mjs && ! grep -qF '"step-4"' test/repo/shell-text.mjs`: exit 0. Pass, with 200 declarations still pending in step-5 to step-8.
- (guard) `node test/repo/ui-polish.mjs`: exit 0. Pass, 6 stylesheet checks.
- (guard) `node test/repo/citations.mjs`: exit 0. STALE 0 across 13 docs. One run printed an empty exit code because zsh has no `PIPESTATUS`; the re-run returned exit 0.
- (guard) scope `test -z "$(git diff --name-only 9fdcbacf -- src/ui/app.js ... .claude/skills)$(git ls-files --others ...)"`: exit 0.
- `node scripts/audit-citations.mjs --md`: STALE 0 in every doc, including `docs/references/component-inventory.md` and `docs/specs/app-shell.md`. The line count of styles.css did not change, so no cite needed repair.
- `node test/repo/em-dash.mjs`: clean.
- `npm test`, run in a throwaway worktree under the tmp prefix with this diff applied: first run exit 1, headless-boot `(rx10l)` failed. After the `.radix-tip` fix and the `.an-sel` role fix, `✓ all 62 test files passed`, exit 0. The worktree is removed.

## Notes
- The red recorder stored nothing. `redck.py record` printed `redck: no (red) criteria in .sdlc/ui-standardization/step-4/handoff.md` (exit 0): its span parser did not pick up the one-line `node -e` (red) criterion. I ran that criterion by hand before the first edit as the base control (exit 1, `52 off`). If the completion audit files a process deviation, it comes from this parser miss, not from a skipped control.
- `.radix-tip` takes the helper role but stays at the chip-text size. After the shorthand it re-declares `font-style: normal; font-size: var(--sh-chip-text)`, because `test/ui/headless-boot.mjs:4082` (rx10l) requires both in the rule and `test/ui` is behind the scope guard. Its weight, leading and family come from the helper role. This is the same pattern as the handoff's `font-variant-numeric` re-declaration rule. It keeps `color: var(--bg)` as the handoff Note asks.
- `.toast` keeps `color: var(--bg)` and gets no role ink. Its surface is inverted (an `--ink` background), the same reason the handoff gives for `.radix-tip`, though `--bg` is not one of the listed state colors.
- `.pane-label .an-sel` takes **label** under fallback rule 5 (the selector names `-label`) and keeps `color: var(--accent)`.
- Other roles assigned by the fallback cascade:
  - `.an-label`: label.
  - helper: `.an-legend`, `.an-bar`, `.mode-editor-unit` and `.key-cell small`.
- `font-variant-numeric` stays declared after the shorthand in `.canvas-footer, .app-footer` and `.key-cell small`.
- Intended visual shifts for the pixel or smoke check:
  - Ink changes from `--ink-faint` to the role ink (`--ink-dim`) on `.pane-label`, `.compare-col-label`, `.ramp-group-header`, `.an-empty`, `.mode-editor-unit` and `.key-cell small`.
  - `.an-bar` and `.an-legend` now set the helper ink.
  - `.pane-label` changes from an uppercase, tracked eyebrow to the pane-title role, as ratified.
- The host rule now carries `font: var(--ui-body-font)`, so `line-height: 1.5` reaches every shell element that does not set its own. At base those inherited `normal` from `body`. This is the planned body role, but it reaches more of the shell than any other change in this step. `body { font-size: 13px; }` is unchanged, and the gate's `=body` allow-list covers it.
