# docs-repair U3 review, progress note (pass 1, pre-heavy-gates)

Target: unit/dr-U3 @ 36b598f9. Quiet window respected, no npm test/build/smoke run yet.

## Done (read-only + small node checks, re-derived against the code, not the handoff's word)

All nine U3 criteria (U3-1 through U3-9) re-run against the actual code and confirmed to match
the plan's expected values exactly: mixinInto now cites `app.js:2581` and `audit-citations.mjs`
reads it `OK`; `colorMode` has four states with the app-pref exception paragraph, and
`_appPrefsKey()`/the persistence line match `app.js`; 15 voices matches `makeVoices()`;
`deleteTypeMode`/`deleteGeomMode` exist and are named correctly, with two new References rows;
the five `app-helpers.mjs` factory rows are correct, `segmented()`/`slider()` correctly stay
`app.js` methods; the dead `~/.claude` link is replaced with a name-only pointer; `app.js` line 1
header is fixed; `geometry.mjs` source note drops the private path; P4's scope-wall and
comment-only-diff commands all read `0 0 0 0`; P3's em-dash counts are `0`/`0` including the
handoff; `branding.mjs` is clean; `baseline-agrees-check.sh` reads `stale total: 0` and the
`ui.html` KB figure (4125.5) matches the tree.

## Findings

1. **src/ui/persist.js retains a stale duplicate header (real defect).** The builder added a new
   line 1 ("`// persist.js: the persistence layer...`"), which satisfies U3-7's `head -1` check.
   But the file's actual original header block, a full doc-comment starting at line 29
   ("`persist.js — UI state persistence for the HCT Palette Generator.`"), was never touched and
   still names the retired product name. The file now carries two different header comments, and
   the exact stale name this audit item was about is still present verbatim; it also propagated
   into the regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js`. No stated
   criterion catches this (U3-7 only checks `head -1`), but it is a genuine unrepaired instance of
   the thing U3 was built to fix.

2. **Cosmetic regression, same commit.** `docs/lld/app-shell.md:13`, the "Source of record" line,
   lost the backticks around `HctApp` when the `mixinInto` line-number cite was updated: now reads
   "onto the HctApp prototype" instead of "onto the `HctApp` prototype".

## Still to do

Once told the quiet window is closed: rerun `npm test` and `npm run build` in a scratch
`--shared` clone (foreground, 10 min timeout), re-verify P1/P2 there, then write and commit the
final verdict at `.sdlc/verdicts/docs-repair-U3-review.md`.

Leaning FIX-FIRST because of finding 1 (mechanically simple to fix, but a real unrepaired
instance of the audit item), pending confirmation this should gate rather than land as a noted
follow-up.
