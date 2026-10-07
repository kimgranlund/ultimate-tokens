<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- `docs/reports/2026-10-06-docs-reconcile.md` (new, untracked). It has the move table with every old prefix written as a repo path, a link to `../assets/docs-reconcile-path-map.tsv`, the `.sdlc` audit table (handoffs 84, verdicts 85, records 43, reviews 33, questions 9, plans 50, tickets 1), a line for `.sdlc/board.md` (1 line), the 12 B-2a warnings, the stale records found, and the three follow-ups.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.claude/docs/other/2026-10-06-docs-reconcile-audit.md` (new, main checkout only, ignored). It audits the 20 private entries against `docs/`.
- The whole-tree sweep found no straggler, so no live file was edited.

## Checks
- Criterion 1 (move table prefixes and path-map link): exit 0.
- Criterion 2 (`.sdlc` counts match the table rows): exit 0.
- Criterion 3 (private audit exists and is ignored in the main checkout): exit 0.
- Criterion 4 (whole-tree residue `git grep` with the allowlist): no hits, exit 0.
- Basename sweep over the whole tree for every changed path-map row: only 2 hits, both false positives (see Notes).
- Guard: no private basename appears in the report: exit 0. Rerun after the last report edit: exit 0.
- Guard: `docs_check.py` gives `docs_check: 0 errors, 24 warnings (B-2a 12, D-10 2, D-11 10)`.
- Guard: `npm test` ran once, exit 0, with `git status --porcelain` unchanged. An earlier invocation in the same command failed on a bad log redirect path before npm started; the fallback invocation is the run that counts.
- Guard: `npm ci --no-audit --no-fund` exit 0, then `npm run build` exit 0, porcelain unchanged.
- Guard: the frozen data, `.sdlc` record folders, board and `CHANGELOG.md` have no diff against the merge-base: exit 0.
- Guard: `docs/archive`, `docs/tickets` and `docs/plan` show only R100 renames: exit 0.
- Guard: `git ls-files -- .claude/docs/other` is empty: exit 0.
- `node test/repo/{em-dash,branding,citations}.mjs` all exit 0. They were also run with the report staged through `git add --intent-to-add`, because those gates read tracked files; all 0 again. em-dash and branding were rerun the same way after the last edit, both 0. The intent-to-add was reset afterwards, so the report is back to untracked.

## Notes
- Nothing was committed. Builder rule 4 overrides the brief's "optionally commit". W holds steps 2 to 5 uncommitted on top of `ded55e1f`.
- The 2 basename-sweep hits are in `src/ui/overlays/drawer.js` and `test/ui/headless-boot.mjs`, both on the token `geometry/geometry.tokens.json`. They are file names inside the export zip, not repo paths, so they were left alone on purpose.
- The `.sdlc/architecture.md` line citations for ADR-014, 016, 017, 018, 020 and 021 already pointed off their ADR headings at the merge-base. The report records this as an existing drift, not one this change introduced.
- `.sdlc/survey.md` says 24 ADRs; the decision record now holds 28, highest ADR-028. This is reported only; `.sdlc/survey.md` was not edited in this step.
- The private audit flags these:
  - Five private files call their home `docs/other/`, which is now a public schema home.
  - A few private files name old docs paths that no longer exist.
  - The monetization plan's pricing conflicts with the pinned fact sheet.
  - The type-revision drafts are mostly applied to the category JSONs.
