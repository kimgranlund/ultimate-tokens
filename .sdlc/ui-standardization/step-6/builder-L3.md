<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization-s6/src/ui/styles.css: moved 48 step-6 family rules (export drawer, New Palette, apply gate, Settings, account, cleanup) onto the `--ui-*` text roles. Every edit is in place, so the file stays at 1740 lines.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization-s6/test/repo/shell-text.mjs: removed the `"step-6"` key from `PENDING`.

## Checks
- (red) control, run by hand before the first edit from a scratch script holding the handoff's criterion: exit 1, `92 off`, at 03:33:24 UTC.
- (red) after the change: exit 0, `0 off`.
- `node test/repo/shell-text.mjs && ! grep -qF '"step-6"' test/repo/shell-text.mjs`: exit 0. It passes, with 126 declarations still pending in step-5, step-7 and step-8.
- `node test/repo/shell-text.mjs --strict`, filtered to the step-6 selectors, before the edit: no geometry findings (padding, gap or radius) outside the text list, so the step owes no geometry work.
- (guard) `node test/repo/ui-polish.mjs`: exit 0, 6 stylesheet checks pass.
- (guard) `node test/repo/citations.mjs`: exit 0. STALE 0 across 13 docs, and 45 symbol homes have 0 stale.
- (guard) the scope check `test -z "$(git diff --name-only $SDLC_BASE_SHA -- src/ui/app.js ... .claude/skills)$(git ls-files --others ...)"` with `SDLC_BASE_SHA=5a6bd08e`: exit 0.
- `node test/repo/em-dash.mjs`: clean.
- `npm test`, run in a throwaway worktree under `.worktrees/tmp/0044-s6-builder-L3/` with this diff applied: exit 0, `✓ all 62 test files passed`. The worktree is removed.

## Notes
- The red recorder stored nothing. `redck.py record` printed `redck: no (red) criteria` (exit 0). Its `guard_skipped` placeholder regex reads `<t&&d>` inside the `node -e` span as a `<placeholder>` and skips the span. This is the same miss step 4 hit. I ran the criterion by hand before any edit as the base control (exit 1, `92 off`). If the completion audit files a process deviation, it comes from this parser miss, not from a skipped control.
- Citations: Do item 5 needed no repair. The line count of styles.css did not change, and citations.mjs reports STALE 0. I edited no doc.
- Roles assigned by the fallback cascade:
  - `.copy-float`: control, by rule 6. It is a button (`overlays/drawer.js:299`).
  - `.newpal-readout`: body, by rule 7 (12.5px).
  - `.cleanup-item-label small`: label, by rule 5, because the selector names `-label`. It changes from a 10.5px faint count to a 12px label with weight 500. The rule order makes this choice, so the planner may want to review it.
  - helper: `.newpal-ctx-head small`, `.newpal-pp-chain small`, `.newpal-preview-pane.empty`, `.newpal-pp-sw-item small`, `.newpal-preview small` and `.cleanup-list-head small`. Rule 4 needs weight 600 or more, and these set no weight.
- Color: I took the handoff literally. `--ink-dim` and `--ink-faint` are not on the state-color list, so they became the role ink. Rules with no color before now set the role ink as well.
  - `.apply-gate-drift.has-changes` keeps its warn color and now uses `var(--ui-weight-strong)`.
  - `.settings-nav-item.on` uses `var(--ui-weight-medium)`.
  - `.acct-badge` takes the badge ink, but its `.is-free` and `.is-pro` rules still override it.
  - `font-variant-numeric: tabular-nums` stays declared after the shorthand in `.drawer-foot .meta`, `.settings-meta` and `.account-license-input`.
  - `.drawer-pre` drops its `font-family: var(--mono)` because the code role carries the mono family.
- Intended visual shifts for the pixel or smoke check:
  - `.settings-pagehead h3` goes from 21px to the step-0 pane-title size. This was ratified.
  - `.drawer-systems-note` is named body, so it grows from 10.5px faint to 13px in `--ink`.
  - `.settings-nav-item` changes its resting ink from `--ink-dim` to `--ink` (the control ink). Its `:hover` and `.on` colors now match the resting color, so a selected item shows only by its background.
  - `.copy-float` changes its resting ink from `--ink-dim` to `--ink` and its size from 11.5px to the control size, so its hover color shift is gone.
  - The kicker rules (`.settings-nav-grouplabel`, `.settings-group-title`) and `.settings-note` change from `--ink-faint` to `--ink-dim`.
  - `.apply-gate-warn` text now sets the helper ink (`--ink-dim`). Before, it inherited `--ink`.
