# Rework U2 pass 2 · orchestrator to builder

| Field | Value |
|---|---|
| Branch | unit/pb-U2 @ aee7bdf7 (code 1d2f65c1, handoff 72d57335, review on top) |
| Worktree | /Users/kimba/Projects/nonoun/ultimate-tokens/.worktrees/pb-U2 |
| Review | `.sdlc/reviews/parallel-batch-U2-review.md` on the unit branch, FAIL; the code half is 🟢 and untouched |
| Grade | builder-l3 (pass 2 never below pass 1) |
| Lane | unchanged; this pass edits `.sdlc/adapter.md` (the new §1 bullet) and the handoff only |

## Fix

Rewrite the new adapter §1 bullet per the review, using its suggested text where it gives one:

1. F1 (🔴) pitfall 4 is inverted: the comment strip leaves whitespace-only lines, so a rewrap reads nonzero (a false red); the cure is dropping whitespace-only lines on both sides. Re-measure the 2 versus 0 yourself before writing it.
2. F2 (🔴) pitfall 3: name the merge-base form's real hazard (the plan's fork point also lists files of earlier merged units); the unit base is `git merge-base plan/<slug> HEAD`.
3. F3 (🟡) pitfall 2: drop "and in the plan"; add the prefix-tolerant anchor form.
4. F4 (🟡) pitfall 1: `.gitattributes` `-diff` (line 11; `git check-attr` reads `diff: unset`), keeping the C2.4 needle.
5. F5 (🟡) the handoff: widen the C2.1 replacement grep to the plan's revision 5 form (`git grep ... "\b(MAP|A)\.GEOMETRY_FIELD_RENAME_MAP"`), with its result.
6. Fix the Claims rows for pitfalls 3 and 4 so each states the corrected claim; a needle is not evidence of truth, so give each a measured line in the `ran` block.

Plan revision 5 (on `plan/parallel-batch`) already corrects C2.1's second grep and C2.2's control. Re-run `ran`/`out`, `npm test` (unset NODE_OPTIONS; load count 5 or fewer, poll inside your turn), keep the tree clean, append a pass 2 section to the handoff, commit on `unit/pb-U2` with `Seat: builder`, return the sha.
