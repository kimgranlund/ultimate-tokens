<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- ADR-032 text, `--g-chip-height`, Quick map row `Geometry has no height knob`: pass. Evidence: grep chain exit 0.
- ADR placed before `## Quick map`: pass. Evidence: awk check exit 0.
- No retired names (`baseHeight|rampContrast|linear4|CONTROL_FONT|GAP_UNIT`) in the skills, geometry/typography refs, `mcp/README.md`: pass. Evidence: negated grep exit 0.
- `uiText` in type-scale, no `51 steps` in type-scale or typography refs: pass. Evidence: exit 0.
- `data-tier` and `--sh-control-height` in building-editor-sections: pass. Evidence: exit 0.
- (red) `node test/repo/citations.mjs`: pass. Evidence: exit 0, `✓ citations: parser self-test + STALE 0 across 12 discovered docs + 10 fact pins + 36 count phrases (HEAD 9c7a2ee8)`. It can go red: the cite `styles.css:164` pointed at a vanished subject, which is the failure the handoff reports at base.
- (red) lines `component-inventory.md:47` and `02-sections-and-resolvers.md:45` carry `before ADR-032`: pass. Evidence: exit 0 in the tree. In a throwaway worktree at `9c7a2ee8` (since removed) the same grep on line 47 exits 1, so the check bites. Line 47 reads `padding: 4px 9px` (`styles.css before ADR-032`), line 45 reads `model.mjs before ADR-032, model.mjs:158, model.mjs:204`.
- `mcp-assets.js` readme, core and server equal the files on disk: pass. Evidence: node check exit 0.
- (guard) seven docs differ from base only in cite digits, skipping lines 47 and 43/45/65: pass. Evidence: run with `SDLC_BASE_SHA=9c7a2ee8cfb907631268807e449998cbe73aeaed`, exit 0.
- (guard) the four skipped lines differ only in cite digits or `file:N` becoming `file before ADR-032`: pass. Evidence: exit 0. A reworded line (`Buttons` changed to `Buttonz`) compares unequal, so the guard can go red.
- (guard) scope list: pass. Evidence: the diff against base excluding `.sdlc`, plus untracked files, is all on the allowed list (exit 0). Every changed path is on that list.
- (guard) `node test/repo/em-dash.mjs`: pass. Evidence: exit 0.

## Out of scope changes
None. `figma/plugin/ui.html` is changed but is on the scope list, and step 14 owns it.

## For the next attempt
None
