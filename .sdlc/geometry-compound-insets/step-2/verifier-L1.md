<!-- role=verifier level=L1 model=sonnet effort=medium -->
## Verdict
pass

## Criteria
- (red) C1, no stale 14-field / 13-role / 378 counts: pass. Evidence: the negated grep over the six paths exits rc=0, so there are no matches. The base text had the old counts; the diff shows 14 changed lines across README, geometry-system, maintaining-figma-plugins and the consumer skill.
- (red) C2, `--control-part-*` and `var(...)` spans plus parity test: pass. Evidence: all four `grep -qF` checks succeed. `node test/plugin/geometry-tokens.mjs` printed "dimension-parity PASS, every dimension token in 5 files matches the engine (27 cells x 16 fields, 15 roles)" and "plugin PASS, geometry-tokens skill in parity with the geometry engine".
- (red) C3, `partInset` in geometry-system SKILL and `part-height` in the geometry README: pass. Evidence: rc=0.
- (red) C4, at least 2 `part-height` hits in `mcp/brand-kit-core.mjs`, plus `test/mcp/core.mjs`: pass. Evidence: the hits are at mcp/brand-kit-core.mjs:87 and :129, and "brand-kit core PASS" printed.
- (red) C5, ADR heading with "Compound" before Quick map: pass. Evidence: `## ADR-033: Compound containers take half the part's inset and compose radius concentrically` is at line 1170 of docs/references/decision-records.md; `## Quick map` is at line 1197. The ADR body has the half law with the user's words, the Maison listbox/segmented note, no new radius field, the rejected list, and the 16 fields / 15 roles / 432/144 consequences including the three micro cells.
- (guard) C6, no changes to `styles.css`, `app.js`, `color.js`, `model.mjs`, `persist.js`, overlays, `figma/binder` or `code.js`: pass. Evidence: rc=0.
- Do item 2, compound recipe in controls.md: pass. Evidence: the diff adds the segmented, listbox and icon-button CSS blocks using `var(--control-part-height)`, `var(--control-part-inset)`, `var(--radius-control)` and `var(--radius-inset)`. It also adds a prose paragraph on `--chip-*` snapping to a ladder row while the part is exact.
- Do item 5, ADR-032 and changelog untouched: pass. Evidence: `git diff --stat` does not list `docs/references/changelog.md`, and the decision-records diff only adds lines.
- Do item 6, comment reword in `test/plugin/geometry-tokens.mjs`: pass. Evidence: line 3 already reads "--control-* or --chip-* role it names must match" at the base commit (no diff under `test/`), so the end state is correct. `.sdlc/notes.md:12` still lists the fix-now item.
- Do item 7, no U+2014: pass. Evidence: 0 em dashes in the diff; `node test/repo/em-dash.mjs` prints "em-dash: clean (1558 files scanned)".

## Out of scope changes
Three regenerated files: `src/ui/describe-mcp-assets.js`, `src/ui/mcp-assets.js` and `figma/plugin/ui.html`. They are `gen:mcp-assets` outputs that the step's Do item 3 calls for.

## For the next attempt
None
