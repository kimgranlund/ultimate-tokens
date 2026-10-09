<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- `RADIX_STEP_GUIDE` has exactly 12 entries with non-empty, distinct `role` and `intent` (rx10a to rx10d): pass. Evidence: `src/engine/exports.js` (diff 88752594..HEAD) defines the table. In a throwaway worktree at HEAD I changed the CSS to break the tooltip, and `node test/ui/headless-boot.mjs` went red on (rx10i) and (rx10k), so the assertions bite. The unmodified suite is green.
- The 12-step table matches Radix's published usage and the repo's own docs: pass. Evidence: the table agrees with the ticket's published usage, and `docs/reference/data/radix-projection.json` has the same 12 step slots (1 app-background through 12 primary-text). One difference: the projection names step 8 `strong-border-focus`, while the table says "Hovered UI element border" per Radix. This is display text only.
- Every `.radix-step` carries `data-tip` (`Step N: <role>\n<intent>`), `tabindex="0"` and an `aria-label` (rx10e to rx10h): pass. Evidence: `src/ui/sections/color.js` (the push at about line 1049). In the real browser, step 5 had `data-tip` "Step 5: Active or selected UI element background\n…" and `:focus-visible` matched.
- The CSS draws the tooltip with `::after` from `data-tip`, shows it on `:hover` and `:focus-visible`, and the ladder has no `overflow:hidden` (rx10i to rx10k): pass. Evidence: `src/ui/styles.css` diff. Chrome Beta CDP probe:
  - Hover on swatches in the first rows showed `::after` as `display:block`; the screenshot `first-row-step1-hover.png` shows "Step 1: App background / The page or app canvas behind everything else." fully visible.
  - A real Tab keypress gave `:focus-visible` true and `::after` display `block`.
- `npm test` passes (58 files) and `node scripts/audit-citations.mjs` reports no STALE or NOFILE: pass. Evidence:
  - `gate_lock.py run -- npm test` printed "all 58 test files passed", exit 0, tree clean.
  - `node test/repo/citations.mjs` prints "STALE 0 across 12 discovered docs".
  - The audit reports "STALE 0 | NEAR 0 | UNDECIDABLE 0 | OK 1 | NOFILE 0".
  - My first `npm test` run failed on a peer-luminosity doc that does not exist in this tree. Its cwd was contaminated by another agent's tree, so I discarded it and reran after confirming the pwd and HEAD in the same command.
- `CHROME_BIN="…Chrome Beta…" npm run smoke` prints SMOKE PASS: pass. Evidence: the log ends with "SMOKE PASS, gallery · category · editor · export dialog all render in a real browser", exit 0.
- No change to Radix step values, exports or the role table: pass. Evidence: the diff touches `exports.js` only to add `RADIX_STEP_GUIDE` (+19 lines, none changed); `radix-projection.json` and the role table are untouched.

## Real-browser findings (non-blocking, not covered by any criterion)
The probe is at `/private/tmp/claude-501/-Users-kimgranlund-Projects-nonoun-ultimate-tokens/f65363d5-c8db-4b09-939e-fbae33813f48/scratchpad/probe/probe*.mjs`, with screenshots beside it.
- The tooltip is not clipped by the window, but it is clipped by `.canvas-area`, which has `overflow:hidden`. The ancestor-overflow scan found it at 290..1140 x 90..753.
  - A swatch whose bottom is within about 56px of the canvas bottom loses its tooltip. The tooltip is 220px wide and about 51px tall, placed 6px below the swatch. `bottom-edge-step1-hover.png` shows only a sliver.
  - This includes the last row of the scene when the user pans it to the bottom edge (`last-row-step12-panned-hover.png`).
  - A swatch within about 220px of the canvas right edge would clip on the right, because the tooltip opens rightward. The rightmost Dark swatch sits exactly at the canvas right edge (1140), so its tooltip lands over the inspector area, outside the clip.
  - Panning a row to mid-canvas works.
- The tooltip text renders italic, because the swatch is an `<i>` element (see the `first-row-step1-hover.png` screenshot).
- The tooltip lives inside the zoomed `.canvas-scene` (the pannable scene), so it scales with canvas zoom. At 25% it would be about 3px text.
- All 384 swatches are `tabindex=0`, so keyboard users get 384 tab stops through the Radix view.
- WebKit/Safari was not tested. `attr()` in `content`, `::after` on `<i>`, and `:focus-visible` are all supported in Safari, but I did not run it.

## Out of scope changes
None.
- Regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js`, which `npm test`/`gen:*` produce.
- `docs/references/component-inventory.md` and `.sdlc/architecture.md` line-cite shifts, as the Constraints require.
- A one-line step-guide bullet in `docs/references/knowledge-04-export-formats.md`.
- The `RADIX_STEP_GUIDE` re-export in `src/ui/model.mjs`.

## For the next attempt
None. If you want to close the clipping gap, open the tooltip upward or inward for swatches near the canvas bottom and right edges, set `font-style: normal` on it, and consider rendering it outside the scaled scene or counter-scaling it.
