<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- Gate exists, is registered in `test/run.mjs`, and passes: pass. Evidence: `test -f test/repo/control-text.mjs && grep -qF '"repo/control-text.mjs"' test/run.mjs && node test/repo/control-text.mjs` exited 0 and printed `control-text: pass, every shell control rule reads its text size and padding from the cell roles...`.
- (red) Gate fails on the base `styles.css` with all eight named selectors: pass. Evidence: with `SDLC_BASE_SHA` set from `base-sha` (40bcf50b), the gate printed 13 FAIL lines, rc=1. They include `.tyi-font-input`, `.docname`, `.map-raw-select`, `.chip`, `.map-head .ghost`, `.pane-back`, `.tyi-voice-name` and `.toggle | font: inherit`. The criterion loop exited 0.
- (red) Four-rule stdin sample gives exactly 3 FAIL lines: pass. Evidence: the output was `.toggle | font: inherit`, `.pane-head .pane-back | padding: 3px 8px` and `.tyi-voice-name | font-size: 13px`, with `button { font: inherit; font-size: var(...) }` passing. The count was 3. I also read `test/repo/control-text.mjs:117-129` and found both in-file negative controls (the `.figma-files button` one and the `.toggle { font: inherit; }` one), each exiting 1 if not flagged.
- Item 1 rule-body check (nowrap, chip, `insp-actions`, `map-raw-*`, no `nowrap` on `.drawer-head button`): pass. Evidence: the node check exited 0. The diff shows the toolbar-only `nowrap` rule deleted and `white-space: nowrap` added on `.chip` and the base button.
- (red) Item 7 exact-selector check (pane-back, toggle, voice name, voice font): pass. Evidence: the node check exited 0. `styles.css` now has `.pane-head .pane-back { flex: none; }` and `.toggle` without the `font:` shorthand. `.tyi-voice-name` has `font-size: var(--sh-control-text)` (line 1450) and `.tyi-voice-font` has `text-overflow: ellipsis`.
- `--hh`, `--ch` and `:not(.icon-only)` greps: pass. Evidence: the grep chain exited 0.
- (red) Smoke greps (`control text at `, `data-fk="pname"`, `.tyi-weight-del, .key-slot")`): pass. Evidence: the grep chain exited 0. The smoke diff shows the `.key-slot` skip and its reason in the block comment.
- Citations, `icon-only` present, `seg-sm` absent: pass. Evidence: `node test/repo/citations.mjs` printed `✓ citations: ... STALE 0 across 12 discovered docs`. The two greps passed. `node scripts/audit-citations.mjs --md` reported no stale cites.
- `(cpd6)` present and headless boot passes: pass. Evidence: `(cpd6)` is at `test/ui/headless-boot.mjs:4629` and `:4631`, the second being the negative control that restores the old `padding: 4px 7px` rule. `node test/ui/headless-boot.mjs` exited 0 and printed `HEADLESS BOOT PASS`. The stack trace in its output is the test's own simulated license-validate throw (`headless-boot.mjs:3207`).
- Extra gates: `node test/repo/em-dash.mjs` printed clean (1574 files) and `node test/repo/branding.mjs` printed clean (1602 files).

## Out of scope changes
None. The diff against 40bcf50b touches only these files:
- `src/ui/styles.css`
- `test/run.mjs`
- `test/smoke/smoke.mjs`
- `test/ui/headless-boot.mjs`
- `docs/references/component-inventory.md`
- `docs/specs/app-shell.md`
- `.sdlc/geometry-compound-insets/*` records
- `figma/plugin/ui.html` (a generated bundle that `npm test` rewrites)
- `test/repo/control-text.mjs` (new, untracked)

I did not rerun `npm run smoke`. The step's criteria are all static, and the `control text at` runtime proof belongs to step 6.

## For the next attempt
None
