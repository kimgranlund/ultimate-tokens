<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- File gone, other docs/assets untouched: pass. Evidence: `test ! -e docs/assets/geometry-tokens.json` true; `git ls-files docs/assets` lists only docs-reconcile-path-map.tsv, palette-preview.svg, typography-tokens.json; `git diff 010fcd79 HEAD --stat` touches no other docs/assets file.
- No live reader or reference: pass. Evidence: the stated `git grep -n "assets/geometry-tokens.json" -- . ':!.sdlc' ':!docs/archive' ':!docs/reports' ':!docs/assets/docs-reconcile-path-map.tsv'` prints nothing on HEAD. Same grep at pre-build tree 010fcd79 (throwaway worktree, removed) printed `docs/references/geometry/README.md:6`, so the check bites. The broader pre-delete grep for `geometry-tokens.json` found only the README line and the path-map row (no test, script, generator, source).
- README no longer says frozen snapshot / kept for history, still names live shape: pass. Evidence: diff of `docs/references/geometry/README.md` lines 5-7 now reads "The live shape is `geomTokensDTCG(geomScale({}))`; the retired six-size ramp (XS to 2XL) has no file in the tree." Path-map row 27 left in place, as specified.
- docs_check / citations / card-amendment: pass. Evidence: `docs_check: 0 errors, 25 warnings (B-2a 13, D-10 2, D-11 10)`; `node test/repo/citations.mjs` exit 0 ("STALE 0"); `sh .sdlc/checks/card-amendment-check.sh` prints `stale total: 0`.
- npm test green via gate_lock, tree clean after, no U+2014: pass. Evidence: `python3 <plugin>/scripts/gate_lock.py run --name npm-test -- npm test` exit 0, "all 54 test files passed" (incl. repo/em-dash.mjs, repo/citations.mjs); `git status --short` afterwards shows only the verifier's own untracked .sdlc/geometry-tokens-snapshot run files; `git diff 010fcd79 HEAD` has 0 U+2014 lines.
- Scope: pass. Evidence: `git diff --stat 010fcd79 HEAD` lists exactly docs/assets/geometry-tokens.json, docs/references/geometry/README.md, .sdlc/geometry-tokens-snapshot/handoff.md; src/engine/tonal.js has no diff.

## Out of scope changes
None. Note: the brief's base sha 871f9e21 is not an ancestor of HEAD (the branch is built on 010fcd79), so a diff against it shows unrelated .sdlc ticket/roadmap files; against the real parent 010fcd79 the diff is exactly the three in-scope files.

## For the next attempt
None
