<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- (red) `grep -qF 'data-tier' src/ui/app.js`: pass. Evidence: exit 0 on the tree (matches only the comment at src/ui/app.js:2338; the attribute itself is set via `this.dataset.tier`). In a base worktree the count is 0, so it is red before. The runtime behavior is covered by (shg1) to (shg3): removing `this.dataset.tier = g.tier;` in a throwaway copy turned shg1, shg2 (x2) and shg3 red (`got ,md,md,round`).
- (red) `grep -qF 'ut-geometry-roles' src/ui/app.js && grep -qF 'geomResolverCSS(' src/ui/app.js`: pass. Evidence: exit 0 on the tree; the base worktree's matches are 0.
- (red) `grep -qF 'shellGeometry' src/ui/overlays/settings.js`: pass. Evidence: exit 0 on the tree; the base worktree's count is 0.
- (red) the nine `--sh-*` loop in src/ui/styles.css: pass. Evidence: loop exit 0 (all nine `--sh-<name>: var(--` lines present, src/ui/styles.css block after line 74); the base count for `--sh-control-height` is 0.
- (red) `test "$(grep -cE '\(shg[1-4]\)' test/ui/headless-boot.mjs)" -ge 4`: pass. Evidence: exit 0; the base count is 0.
- (guard) `node test/ui/headless-boot.mjs`: pass. Evidence: "HEADLESS BOOT PASS, all Phase-3 interaction assertions hold". Negative control: with the `dataset.tier` assignment removed, the same run prints "HEADLESS BOOT FAIL" with (shg1), (shg2), (shg3) failures, so the new groups bite. The shg4 assertions (id `ut-geometry-roles`, `parentNode === document.head`, unprefixed `/(^|[;{\s])--control-height:/`, `--size-product-md-md-height:`) are in the diff and the run passes.
- (guard) `node test/ui/shell.mjs`: pass. Evidence: "PASS: ui-app pure core + shell clear the checkable predicates".
- Spec points beyond the criteria: pass. Evidence: git diff shows `_applyShellGeometry` (src/ui/app.js) called from `render()` next to `dataset.theme`; one instance-held `_geomRolesStyle` with id `ut-geometry-roles` appended to `document.head`, no `getElementById`; `geomTokensSizesCSS(sc) + "\n" + geomResolverCSS(sc)` with no prefix; `shellGeometry` loaded in `_loadAppPrefs`, saved in `_saveAppPrefs`, cleared in `_resetAppPrefs`; Shell geometry row in src/ui/overlays/settings.js writes `this.shellGeometry`, then `_saveAppPrefs()` and `render()`; `--hh/--ch/--fh` and `--r-sm/--r/--r-lg` untouched. `node test/repo/em-dash.mjs`: clean.

## Out of scope changes
None. `git status` shows only src/ui/app.js, src/ui/overlays/settings.js, src/ui/styles.css and test/ui/headless-boot.mjs modified, all named by the step. (`_resetAppPrefs` clearing the override and `disconnectedCallback` removing the style are in-file support for the step's override and style element.)

Note: `node test/repo/citations.mjs` is red at base with 8 failures and with 9 on the tree, because this step shifted line numbers cited by docs (e.g. docs/specs/app-shell.md goes from 5 to 17 stale lines). It is not a criterion of this step. Step 13 (.sdlc/geometry-maison-ladder/step-13/handoff.md:23) owns re-homing the citations and getting `citations.mjs` green, so I did not file it as a defect here. `test/plugin/geometry-tokens.mjs` is red at base too and is unrelated to this diff.

## For the next attempt
None
