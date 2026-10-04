# Rework note: pane-context U6, pass 2 continuation

Source: `.sdlc/reviews/pane-context-U6-review-p2.md` on `unit/pc-U6` @ c4c46d2c (PASS, sweep notes). Same pass 2, no new pass. The lane is widened on `plan/pane-context` (U6 checklist line).

1. `docs/reference/rubrics/acceptance-criteria.md:30-34` (AC-T6): add the group-100 qualifier, copied from `quality-rubric.md:50`.
2. `test/engine/anchor.mjs:463` C3 header comment: qualifier, comment lines only.
3. SPEC banner `:14`: the second sentence starts with a lowercase "the"; capitalise.
4. SPEC `:73`, `:95`, `:443`, `:659` still state the pre-#785 Material default of 30: name them in the banner as the pre-#785 record, or correct them. Your call; say which in the handoff.
5. Re-sweep multi-line forms of the stop-500 claim (read surrounding lines, not a single-line grep).

Then: `unset NODE_OPTIONS`; `npm test` after the last edit; `npm run build`; `baseline-agrees-check.sh`; em-dash; `card-amendment-check.sh`. Update the handoff, commit with `Seat: builder` plus the Co-Authored-By line in one trailer block, return the sha. Do not merge plan into the branch.
