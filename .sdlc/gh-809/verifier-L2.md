<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- No switch in the Color right pane, no `setSegment`/`this.segment`, no `selectPalette(id, { tab })` option: pass. Evidence: `grep -rn "setSegment\|this\.segment\b" src/ui/app.js src/ui/sections/color.js` prints nothing. The diff shows `renderRightPane` (`src/ui/app.js` near 1926-1948) now emits a `.pane-title` span in place of `segmented(...)`, and `.seg-body` has no `role=tabpanel`. `selectPalette(id)` has no options argument (`src/ui/sections/color.js:247`), and the call sites with `{ tab: true }` are gone. Remaining `tablist` and `tab:` hits in `app.js` are the section switcher, the Typography and Geometry tabs, and the generic `segmented()` helper, all of which stay by design.
- Context follows `this.sel.kind` (fresh doc is `none`, Esc and empty-canvas click go to Global, undo keeps context): pass. Evidence:
  - `this.sel = { kind: "none", ... }` in the constructor and in `openSet`.
  - `_restore` keeps `kind: this.sel.kind`.
  - `renderRightPane` picks the palette inspector only when `sel.kind === "palette"`.
  - `_deselect()` is called from the Esc handler (`app.js:497`) and from the `.canvas-area` click listener (`app.js:1883`).
  - Behavior observed in the `(ic)` run below.
- Story at the foot of the Global inspector, no `1`/`2` switching, Typography and Geometry tabs kept: pass. Evidence:
  - `renderGlobalInspector(view)` appends `renderStoryInspector(view)` only when `view.story` is set.
  - The `1`/`2` cases are removed from `_handleKey`.
  - Test `(st6)` (`headless-boot.mjs:2251`) asserts `.story-pane` is rendered, and `(icd)` asserts the keys are inert.
  - `geomSegment` and `typeSegment` are untouched.
- `headless-boot.mjs` exits 0 with group `(ic)` (a to e), control `(ic0)`, `(g786)` rewritten and `(o4)` asserting no `tabpanel`: pass.
  - Observed: `node test/ui/headless-boot.mjs` printed `HEADLESS BOOT PASS` (an earlier `tail` hid the exit code, so I relied on the PASS line and the later `npm test`).
  - `(ic0)` builds `app.segmented(... ariaLabel "Inspector", idPrefix "tab")` and asserts the `isSwitch` detector finds it (`headless-boot.mjs:536-537`).
  - Red on the old source: in a throwaway worktree at `33a98c95`, I copied in the new `headless-boot.mjs` and it exited rc=1 with 9 failed assertions (ica x3, icb, icd, ice and others).
  - The handoff says 11 failures; I observed 9. The group is red either way, so I count it as pass.
  - Note: `headless-boot.mjs` now has two groups labelled `(ic)`, the new inspector group at line 523 and the existing icon-registry group at line 2037. The assertion ids `(ica)` to `(ice)` and `(ic0)` do not collide.
- Docs (`app-shell.md`, `component-inventory.md`, `glossary.md`, `ui-plan.md` amendment, `CHANGELOG.md`) updated and citations green: pass. Evidence:
  - The diff touches all five.
  - `component-inventory.md:161-171` now says 14 sites, with Typography and Geometry tabs only.
  - `ui-plan.md:23` carries the #809 amendment, and the `CHANGELOG.md` entry is present.
  - `node test/repo/citations.mjs`: `✓ citations ... STALE 0`.
  - `node test/repo/em-dash.mjs`: clean.
- Full gate green, `ui.html` regenerated and committed, no engine or figma changes: pass. Evidence:
  - `python3 <plugin>/scripts/gate_lock.py run --name npm-test -- npm test` ended `✓ all 54 test files passed`, rc=0.
  - `git status --short` afterwards shows only `.sdlc/gh-809` run files, so the tree is clean and the committed `ui.html` matches regeneration.
  - `git diff 33a98c95 --stat -- src/engine figma` shows only `figma/plugin/ui.html`.
  - `scripts/gate_lock.py` does not exist in this repo, so I ran the plugin copy instead.

## Out of scope changes
- `docs/reports/2026-08-20-reactivity/00-synthesis.md` and `01` through `04` were edited. The most likely reason is citation line-number remaps from the hunks, since the handoff says shifted cites were remapped. `citations.mjs` is green, so this is acceptable.
- `.sdlc/gh-809/handoff.md` was changed (+8 lines), which is the run record.

## For the next attempt
None. One non-blocking nit: `docs/references/ui-plan.md:50` (the Color row, "Inspector tabs" column) still says "palette and global, plus a story tab when the document carries a curated story". That is stale, because the story is now a section of the Global inspector. The #809 amendment at line 23 covers it, so I did not fail on it.
