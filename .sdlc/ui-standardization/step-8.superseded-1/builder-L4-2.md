<!-- role=builder level=L4 model=opus effort=xhigh -->
## Status
blocked

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization/test/smoke/smoke.mjs: line 365, the control-text predicate is now `chip:e.matches(".map-raw-select, .map-raw-input")`. `.chip` is gone, so interactive `button.chip` is checked against `cell.text`. The raw mapping cells stay on `cell.chipText`.
- Unchanged from attempt 1 and still uncommitted in the tree: `src/ui/styles.css`, `test/repo/shell-text.mjs`, `test/repo/ui-polish.mjs`, `docs/references/component-inventory.md`.

## Checks
- Throwaway worktree `.worktrees/tmp/0044-s8-builder-L4-2/smoke`, made with `git worktree add --detach` at 3157ccc4. The step diff over `src test docs` was applied with `git apply`, and the root `node_modules` was symlinked in.
- `SDLC_GATE_WORKERS=10 python3 .../gate_lock.py run --slots 10 --name 0044-s8-smoke --timeout 900 -- npm run smoke` in the throwaway: exit 0.
  - `✓ control text at product-md: 134 controls, ... on one line`
  - `✓ control text at content-lg: 124 controls, ... on one line`
  - Final line `SMOKE PASS, gallery · category · editor · export dialog all render in a real browser`
- `SDLC_GATE_WORKERS=10 python3 .../gate_lock.py run --slots 10 --name 0044-s8-test --timeout 900 -- npm test` in the same throwaway: exit 0, `✓ all 62 test files passed`.
- The throwaway was removed with `git worktree remove --force`, and the tmp dir under `.worktrees/tmp/0044-s8-builder-L4-2` is gone.
- Step criteria, run once in the step tree with `SDLC_BASE_SHA=3157ccc4f5aadf7bc7ddbb3ae466d40a22c4346c`:
  - (red) `node test/repo/shell-text.mjs --strict && ! grep -qE '"step-[0-9]+"' test/repo/shell-text.mjs`: exit 0, `shell-text: pass, ...`
  - (red) the stylesheet `node -e` one-liner (13 pairs): exit 0, nothing missing.
  - (red) `test "$(grep -c '\["anatomy: ' test/repo/ui-polish.mjs)" -ge 5 && node test/repo/ui-polish.mjs`: exit 0, `ui-polish: pass, 11 stylesheet checks (each rejects its known-bad sample)`
  - (guard) `node test/repo/citations.mjs`: exit 0, `✓ citations: parser self-test + STALE 0 across 13 discovered docs + 10 fact pins + 36 count phrases`
  - (guard) the scope deny-list `test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- ... test/smoke ...)..."`: exit 1. It lists exactly one file, `test/smoke/smoke.mjs`.
- Proposed swap span, the same guard with `':!test/smoke/smoke.mjs'` added after `test/smoke` in the `git diff` pathspec: exit 0 in the step tree.
- Bite of that exclude: `git diff --name-only "$SDLC_BASE_SHA" -- test/smoke ':!test/smoke/smoke.mjs' test/repo` still lists `test/repo/shell-text.mjs` and `test/repo/ui-polish.mjs`. The exclude removes only the one widened path.

## Notes
plan defect: (guard) the scope criterion deny-lists `test/smoke`. `steps.py widen` recorded `test/smoke/smoke.mjs` under `## Scope widened` but could not rewrite the guard, because it is a `git diff --name-only -- <deny paths>` form and widen only rewrites a `grep -v` allow-list. The guard now exits 1 on exactly the file the conductor widened, so the handoff contradicts itself.

- swap old: `(guard) test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/app.js src/ui/app-helpers.mjs src/ui/sections src/ui/overlays src/ui/icons.js test/ui test/smoke scripts .claude/skills)$(git ls-files --others --exclude-standard -- src/ui/sections src/ui/overlays test/ui test/smoke scripts)"`
- swap new: `(guard) test -z "$(git diff --name-only "$SDLC_BASE_SHA" -- src/ui/app.js src/ui/app-helpers.mjs src/ui/sections src/ui/overlays src/ui/icons.js test/ui test/smoke ':!test/smoke/smoke.mjs' scripts .claude/skills)$(git ls-files --others --exclude-standard -- src/ui/sections src/ui/overlays test/ui test/smoke scripts)"`
- The `ls-files --others` list is left alone, so a new untracked file under `test/smoke` is still denied.
- The build itself is complete. No other change is needed for this step: smoke passes, `npm test` passes, and criteria 1 to 4 pass.
- `smoke.mjs` has no `.chip` badge size check to keep. Lines 160 and 177 only assert the `on` class state of the `.drawer-systems .chip` toggles. The control-text query covers `button, select, input`, so the badge `span.chip` was never in it. The one-line predicate change is the whole edit.
- No second `redck.py record` was run. This is a resume of attempt 1, whose pre-edit record in `red-checkpoint.jsonl` still applies. The tree already held that attempt's work, so the `(red)` commands are green here by design. The handoff changed only by the appended `## Scope widened` section.
- Carried forward from the verifier: `figma/plugin/ui.html` is stale in the step tree. `npm test` regenerated it in the throwaway from the new `styles.css`. The committing seat picks it up from its own `npm test`, as the earlier step commits did.
