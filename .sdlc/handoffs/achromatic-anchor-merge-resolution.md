# Merge resolution: origin/main into plan/achromatic-anchor (#739 vs #713)

Worktree `.worktrees/plan-achromatic-anchor`. `git fetch origin && git merge --no-ff --no-commit origin/main`, resolved, staged, **not committed** (`.sdlc/board.md` left for the team lead to resolve/commit).

## test/engine/anchor.mjs

Kept origin/main's FULL/SAMPLED split (#713 gate-split) intact. `NOTCH_ALLOW` itself (with the two `#ACADAE` entries #739 added) merged cleanly with no conflict. The conflict was only in the trailing PASS-line comment/text: updated the FULL branch's notch count and wording from `15` to `17` to carry #739's re-freeze forward. Verified with a real `node test/engine/anchor.mjs --full` run:

```
PASS (FULL): ... notch (17, Q3-resolved, +2 at #739) are named allow-lists, compared by name, each with a biting negative control
```

## .sdlc/baseline.md

Kept origin/main's whole gate-split table (new `gate:corpus-tonal`/`gate:corpus-anchor`/`gate:sweep-prime`/`gate:corpus-reset` rows, 50-file `npm test`, re-timed figures). Updated:
- `gate:corpus-anchor`'s summary text: notch `15` -> `17`; timing (`78.98 · 99.90 · 86.02`) carries forward unchanged, since the merge changes no code that gate times.
- `npm run build`'s row: confirmed still `4125.1 KB` with a real `npm run build` run (#713 touches no engine file); timing carries forward unchanged too.

Also found and fixed a real bug: git's line-merge silently kept the stale pre-squash `ref: plan/gate-split @ c87d98fc` frontmatter instead of origin/main's re-pointed `ref: main @ a62ec020` (no conflict registered, since only origin/main's side had touched that line). `baseline-agrees-check.sh` read `STALE head: baseline ref c87d98fc is in origin/main's history` until corrected; now `stale total: 0`. Added one more `Correction (2026-09-24, ...)` paragraph recording this whole resolution, on the file's own convention.

## Gates run

- `node test/engine/anchor.mjs --full`: exit 0, PASS (FULL) line above.
- `npm run build`: exit 0, `wrote figma/plugin/ui.html 4125.1 KB`.
- `bash .sdlc/checks/baseline-agrees-check.sh`: `stale total: 0`.
- `npm test`: exit 0, tail `✓ all 50 test files passed`.
- `git status --short`: nothing but the merge diff (45 files, all `M`/`A` from the merge itself; `figma/plugin/ui.html`/`src/ui/describe-mcp-assets.js` unchanged, confirming the regenerated assets already match what's committed).
