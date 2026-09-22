# Question preset-intent-fidelity U8 · from Lane A orchestrator (ultimate-tokens-e8)

Asked 2026-09-22 through `AskUserQuestion`, when Lane A took #681 over from the idle driver.

| # | Question | Options offered | Chosen (verbatim) |
|---|---|---|---|
| Q5 | The plan worktree (plan/preset-intent-fidelity @ 505416d7) has another session's uncommitted pre-land pass-2 fixes from 09-21 08:46. There are six edited files, including test/engine/anchor.mjs and prime.mjs (the #718 fix: the summary word now reads the full list check), plus plan revision 33 and a blast-script record. Its gate log shows 49 of 49 test files passing. The branch is also 5 commits behind origin/main. What happens to those edits? | Adopt as a unit U8 (Recommended) · Pre-land 505416d7 as is · Discard the edits | "Adopt as a unit U8 (Recommended)" |

Earlier the same day the owner confirmed in this session that it holds Lane A for #681 ("Yes, take Lane A"), as relayed by the Conductor (ultimate-tokens-a4).

Consequence. The diff moved byte for byte (`cmp` against `git diff --binary` of the plan tree) into `.worktrees/pif-u8` on `unit/pif-u8`, off 505416d7, and the plan tree was left clean. A builder adopts it as U8: gates rerun, commit, then review and verify. After U8 merges, origin/main is merged into the plan branch and the pre-land pair runs at that head, at opus high per R17.

## Q6, asked 2026-09-22 by the previous Lane A driver (session 896c0b67), relayed by handover

Source: `.git-worktrees/lane-a-notes/HANDOVER-681-to-e8.md`. The ruling was taken before #681 changed hands and was not yet in the tree. It is recorded here verbatim from that handover.

| # | Question | Options offered | Chosen (verbatim) |
|---|---|---|---|
| Q6 | #681 turns red on sync: the fixed timing check now reads the interim ceiling (280 to 550 s) as a second baseline range. How should the ceiling be handled so #681 can land? | Labelled figure, in #681 (Recommended) · Move it out of the time cell · Hand to Lane B, hold #681 | "Labelled figure, in #681 (Recommended)" |

Consequence. After U8 merges and origin/main (`855d7122` or later, #718) is merged into the plan branch, a unit U9 gives the interim ceiling its own labelled figure. `baseline-agrees-check.sh` reads that figure and compares it to baseline.md's ceiling sentence, and a failing control reds the check. The pre-land pair then runs at that head.
