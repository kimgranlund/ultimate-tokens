<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- Criterion 1 (npm test wrapped in the asset-hash check): pass. Evidence: ran the full command; output ended `all 54 test files passed`, the before/after `shasum` of `figma/plugin/ui.html`, `src/ui/*-assets.js`, `src/ui/categories/*.js`, `docs/reference/data/adia-*` compared equal, and `git status --short | grep -v '^??'` was empty afterwards.
- Criterion 2 (npm run build via the lock): pass. Evidence: rc 0, log ended `wrote figma/plugin/ui.html 4169.3 KB`; no tracked file changed.
- Criterion 3 (smoke): pass. Evidence: rc 0, output contains `SMOKE PASS, gallery · category · editor · export dialog all render in a real browser` and `✓ geometry.css resolver: all 108 nested cases (27 cells x 4 radius modes) resolve --control-height and --radius-control to the engine's cell values`.
- Criterion 4 (guard, corpus-reset): pass. Evidence: `gate_lock.py run --name corpus-reset -- npm run gate:corpus-reset` rc 0, 118 s.
- Criterion 5 (guard, seven color legs): pass. Evidence: ran each leg through the lock, one at a time, same order as the criterion. corpus-tonal rc 0 (273 s), corpus-anchor rc 0 (349 s), sweep-prime rc 0 (97 s), corpus-contrast rc 0 (77 s), mode-isolation rc 0 (46 s), even-dips rc 0 (58 s), chroma-envelope rc 0 (79 s). No red leg. Split across calls because the loop exceeds the 600 s Bash limit.
- Criterion 6 (guard, retired names): pass. Evidence: the `! git grep -qE '...' -- src scripts mcp figma plugin ...` command exited 0 (no matches).
- Criterion 7 (red, report sections): pass. Evidence: `docs/reports/2026-10-07-geometry-maison-ladder.md` has the four `## ` headings as whole lines, contains `docs/assets/geometry-tokens.json` and `all 108 nested cases`; command exit 0. The file has 0 U+2014. The check can go red: it fails before the report exists (`ls` of the glob finds nothing), and each `grep -qx` / `grep -qF` is a literal line or string test.
- Report claims: pass. Evidence: `node test/engine/geometry.mjs` prints `geometry PASS, the Maison ladder (27 cells vs the vendored fixture), ...`; `node test/ui/persist.mjs` prints `pass  geometry-migrate` and `PASS: ui-persistence clears all [gate] predicates`; `CURRENT_SCHEMA_VERSION = 9` at `src/ui/persist.js:374`; `figma/plugin/ui.html` is 4295908 bytes; `git merge-base HEAD main` = `c7bfde0c...`, HEAD = `d4645489...`, matching the report. The report cites paths and symbols, no `file:line`. `node test/repo/citations.mjs` and `em-dash.mjs` passed inside `npm test` with the report in the tree.

## Out of scope changes
None. `git status --short` outside `.sdlc/` shows only the new untracked `docs/reports/2026-10-07-geometry-maison-ladder.md`; no tracked file is modified.

## For the next attempt
None
