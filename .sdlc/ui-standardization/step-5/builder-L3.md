<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization-s5/src/ui/styles.css: 36 rules in the step-5 families now read the shell type roles or the weight tokens. Every rule kept its line count, so no line in the file moved.
- /Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/ui-standardization-s5/test/repo/shell-text.mjs: removed the `"step-5"` key from `PENDING`. The step-6, step-7 and step-8 keys are unchanged.

## Checks
- Pre-edit (red) control, run by hand at 2026-10-09T03:33:18Z on an unedited tree: exit 1, `77 off`, starting with `.map-table | font-size: 13px`.
- (red) criterion after the edit: `0 off`, exit 0.
- `node test/repo/shell-text.mjs && ! grep -qF '"step-5"' test/repo/shell-text.mjs`: pass, exit 0. It reports 136 declarations pending in step-6, step-7 and step-8.
- (guard) `node test/repo/ui-polish.mjs`: pass, 6 stylesheet checks.
- (guard) `node test/repo/citations.mjs`: pass, STALE 0 across 13 docs, 0 stale symbol homes.
- (guard) diff-scope `test -z ...` with `SDLC_BASE_SHA=5a6bd08e3984cfafb9262ab93863d23ceca10236` exported: exit 0.
- `node test/repo/em-dash.mjs`: clean.
- I did not run `npm test`. It regenerates committed bundles such as `figma/plugin/ui.html`, and those files are outside this step.

## Notes
- Process deviation: `redck.py record` printed "no (red) criteria". The criterion's inline JS contains `while(i<t){`, and `steps.guard_skipped` reads that `<t...>` as a `<placeholder>`, so it skips the span. I ran the identical span by hand before editing (result above) and did not write `red-checkpoint.jsonl` by hand, so the audit will log a missing checkpoint. Planner note: redck cannot record a (red) span that contains a `<` followed later by `>`.
- Rules that set only a weight now take a weight token, keep their colour and get no role:
  - `.map-table th`, `.map-sem code`, `.tok-table th.tok-name code`, `.tok-input.ov` and `.field > label b` use strong.
  - `.map-drift` uses heavy.
  - `.map-drift-absent, .map-drift-none` and `.tok-group-count` use regular.
- Roles chosen by the fallback list:
  - `.map-table` and `.map-reset` are named in the handoff: body and control.
  - `.key-slot.empty` is control under rule 6, because it is a `<button>` (sections/color.js:1919).
  - `.story-kicker` and `.story-refuses b` are kicker. `.story-refuses b` keeps `var(--danger)`.
  - `.story-title` is pane-title under rule 3.
  - `.story-group-head b` is element-title under rule 4. I counted the `<b>` element's default bold as "weight 600 or more". Under helper it would render at weight 400.
  - `.story-pane` and `.story-narrative` are body.
  - `.tok-col-bp`, `.color-story-note`, `.story-color-note`, `.story-group-pct`, `.story-group p` and `.story-refuses p` are helper.
- Longhands written again after the `font` shorthand, which resets them:
  - `font-variant-numeric: tabular-nums` on `.tok-input`, `.key-slot .key-place` and `.story-group-pct`.
  - `font-style: italic` on `.story-refuses p`.
  - `.key-slot .key-role` and `.story-group-head b` use `text-transform: capitalize` in place of the role case. The gate treats capitalize as a data word's case, and the red check accepts it.
- Visible changes the verifier may want ruled on:
  - `.story-title` was Georgia serif 17px and is now pane-title, sans 13px. The template's shorthand replaces the font family.
  - `.story-narrative` text is now `--ink` (body role), where it was `--ink-dim`.
  - `.key-slot.empty` was 11px weight 550 in `--ink-dim` and now uses the control role: 13px, weight 500, `--ink`.
  - `.tok-sub` and `.key-slot .key-place` now use the badge role: weight 600 at the chip text size.
  - `.ex-artifact-title` is now element-title, so it is no longer uppercase. Its CSS colour has no effect, because app.js:2202 sets an inline `color`.
- Doc cites: no line in styles.css moved and citations.mjs is green, so this lane needs no cite repair. I edited no docs, as the conductor asked.
