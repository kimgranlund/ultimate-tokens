# Question · records-followup (#709) · repair `.sdlc/roadmap.md` or rebuild it

date: 2026-09-21
from: orchestrator
about: PR #720, `plan/records-followup-roadmap`, after the citation census closed
status: open

## The measurement that prompts this

Owner ruling R16 approved an atomic landing window for four repairs and a count re-read. Before opening it I asked the Verifier to census every citation on the branch, because passes 1, 2 and 3 had found four, then two, then eight, and an increment per pass is not a bounded set.

The census is closed and the set is bounded:

| Figure | Value |
|---|---|
| claims followed | 383 |
| hold | 318 |
| fail | 48 |
| unresolvable | 16 |
| blocking after withdrawals | 45 🔴, 1 🟡 |

One claim in eight fails. The worst file is not the roadmap but `.sdlc/handoffs/records-followup-U11.md`: 123 claims, 22 failing, and six of the seven that were never true are the handoff describing its own evidence.

Two structural findings, not cell defects:

- the roadmap's legend contract is unkept across about twenty cells, which no per-cell repair fixes
- a record graded at the branch head instead of at the commit it was written at invents defects. Regrading the U11 handoff at its own commit moved fifteen rows from fail to hold and none the other way. Two of my own relays to the builder carried this error, and one of them replaced a correct field with a wrong one.

## What is already repaired

U13 holds at `861cab5c`, seven commits, each touching exactly one file: the stale tally, the unranked ticket, the `#686` ordering, the stale worktree row, three false citations, two wrong commit counts, a dead path, a copied control figure, and the `#718` verb. The counts are deliberately unwritten. One finding, A11, was withdrawn after the census found the citation resolves in a third `R<n>` namespace, and that edit is being restored.

## The decision

1. **Repair, inside the R16 window (recommended if the roadmap is wanted as it stands).** U13 takes the remaining reds, the legend contract is rewritten once rather than cell by cell, the counts are read last, the verifier re-checks, and the squash follows. Cost: 45 rows of repair, each needing its own derivation and control, on a file that has now been wrong at every pass.
2. **Rebuild the roadmap from live facts under the census's rules.** The file is regenerated so that every cell is an output of a command recorded beside it, the legend contract holds by construction, and the counts fall out of the generation rather than being edited into it. The handoff repairs already made are kept, since they are separate files. U13's four roadmap commits discard cleanly, each touching only that file.
3. **Land the handoffs and drop the roadmap from this PR.** #720 carries only the record repairs; the roadmap becomes its own ticket with the census as its specification.

The builder's observation is worth weighing: under option 2 the `Count:` and `inputs:` lines become an output of the generation rather than an edit, so the convergence problem R16 was written to work around stops existing for those cells.

Default if unanswered: none taken. #720 does not land, the freeze holds, and U13 stays parked at `861cab5c`.

## What this costs while undecided

The repo-wide mint freeze from R16 is holding for every lane. It has been in force since the window was approved.

## A finding that arrived after this question was written

The A11 red was withdrawn and the builder restored the cell, verifying the withdrawal itself rather than taking my relay: the standing-rulings file at `:43` records that it renumbered its own R5 to R7 precisely because the background seats had already used R5 for this PR, so three `R<n>` namespaces are in play and `owner ruling R5` resolved as written the whole time.

The builder then named something that no criterion on this plan would have caught. Its A11 edit was factually true in every clause and still made the record worse, because the true clauses implied a false conclusion: the revision row it wrote asserted that the standing-rulings file has no R5, R6 or R7 among its headings, which is exactly right and exactly beside the point. A per-clause check passes it.

This bears on the decision. Option 1 repairs 45 rows under per-clause checking, which is the checking that just passed a misleading record. Option 2 removes the class for every generated cell, because a cell that is an output of a recorded command cannot imply a conclusion its command does not support. It is also the second time on this unit that a repair introduced a defect while every clause of it was true.
