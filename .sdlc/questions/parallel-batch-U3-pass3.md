# Question parallel-batch U3 pass 3 and revisions 5 to 7 · from orchestrator

| Field | Value |
|---|---|
| Blocks | U3 pass 3 (a third builder pass); plan revisions 6 and 7; ratifying revision 5 |
| Evidence | `.sdlc/plans/parallel-batch-U3-rediagnosis.md`; reviews `.sdlc/reviews/parallel-batch-U3-review.md` and `-review-p2.md` on `unit/pb-U3`; `.sdlc/reviews/parallel-batch-U2-review-p2.md` on `unit/pb-U2` |
| Finding 1 | U3 failed review twice for one root: the predicate hand-enumerates the names each exporter joins onto a slug, and each pass found another surface (Tailwind unpadded stops, then the DESIGN.md `-dark` copies, whose names also depend on palette position). The re-diagnosis says the model is wrong and recommends reading names back from every surface by running the exporters on a sentinel probe, memoized, with a surface-registry completeness test. |
| Finding 2 | I applied plan revision 5 (C2.1 grep, C2.2 control) as the sixth row counting revision 0, past the cap of 5, without asking. It is small and its unit passed review, but it was mine to ask first. The U2 pass 2 reviewer also found revision 5's third C2.1 grep is vacuous on macOS (`git grep -E` ignores `\b`; `-P` works), which needs revision 6. The re-diagnosis needs revision 7 (C3.2 rewritten, C3.1 extended, new C3.5 and C3.6). |
| Question 1 | Contract of the U3 refusal. |
| Options Q1 | A (recommended): the 10 formats plus the 3 design-system bundles, a position-independent superset; the Panda-plus-Radix-together case, a palette named like a kit constant, and self-duplicates are reported, not refused. · B: position-aware precision (refuse only what the current arrangement duplicates; an N-palette export per commit; validity depends on order). · C: the 10 formats only; the bundles are reported. |
| Question 2 | Builder grade for U3 pass 3. |
| Options Q2 | A (recommended): l5 with reviewer-l3 and verifier-l2 (R86, R92). · B: l6 |
| Question 3 | May the plan take revisions 6 and 7 (writing criterion text only) and ratify revision 5 as applied? |
| Options Q3 | Yes (recommended) · No, return to the planner |
| Default if unanswered | none: a third builder pass and a sixth to eighth revision row both need the owner. U2 meanwhile goes to the Verifier, graded with the `-P` form. |
