# Question: U5's landing refresh and U5-6 cannot both hold at the branch head

date: 2026-09-20
asked by: orchestrator (sdlc-ultimate-tokens-orchestrator)
asked of: conductor (sdlc-ultimate-tokens-conductor), then the owner
refers to: `.sdlc/plans/records-followup.md` §U5, criteria U5-4 and U5-6; `.sdlc/verdicts/records-followup-U5.md` (🟡 row U5-4); ticket #709; branch `plan/records-followup-roadmap`

## The collision

| Rule | Where | What it requires |
|---|---|---|
| the live-facts preamble | §U5 #### Criteria, first paragraph | an issue created after the unit's commit is a 🟡 note and "the Orchestrator refreshes the row at landing" |
| U5-4 | §U5 | one ranked roadmap row per open issue, none for a closed one |
| U5-6 | §U5 | exactly ONE commit in `BASE..HEAD` touches `.sdlc/roadmap.md` |

Issue #718 opened `2026-09-20T21:45:38Z`, after the roadmap commit. It is open, so U5-4 wants a row for
it. Adding that row at landing is a second commit touching the roadmap, which makes U5-6 read `2` at the
branch head. Refusing to add it leaves U5-4 red at pre-land instead. Both criteria are graded at the
branch head by the pre-land pair, so at that head exactly one of them must fail.

At the unit head `ee28fff6` there is no collision: U5-4 and U5-6 were both graded 🟢 there, and U5-4's
🟡 is only the live-facts note.

## Why the Orchestrator is not deciding this alone

U5-6's stated intent, read from its own negative control, is that a roadmap change must not be smuggled
in beside other files; PR #708 is the case it names. A second roadmap-only commit does not offend that
intent, only the letter of the count. But reading a criterion down to its intent in order to pass it is
exactly the move this plan exists to stop, so it is not the Orchestrator's to make.

## Options

| # | Option | Cost |
|---|---|---|
| 1 | U5-6 is graded at the unit head `ee28fff6` (where it reads `1`) and the landing refresh is exempt, recorded in a plan revision row naming #718 | one criterion no longer graded at the branch head; must be written down, not assumed |
| 2 | U5-6 counts roadmap-only commits rather than commits, so the refresh is admitted by the rule itself | changes a criterion after a unit was graded against it; the verifier re-runs it |
| 3 | no refresh: #718 is left out and U5-4's red at pre-land is accepted with a recorded reason | the roadmap lands knowingly stale on the one fact this unit exists to make live |

## Answer

Asked of the owner by the Conductor on 2026-09-20, ruling R5. Options offered: "U5-6 counts roadmap-only commits (Recommended)", "Grade U5-6 at the unit head", "No refresh". Chosen: **U5-6 counts roadmap-only commits**, which is option 2 above.

Effect, in the owner's terms: the criterion is reworded in a plan revision row (revision 14), the verifier re-runs it, and the refresh then adds the #718 row. The rule admits the refresh instead of exempting it, so U5-6 is still graded at the branch head and its negative control still bites: a second file staged beside the roadmap still fails it.

Sequencing note from the Orchestrator: the ruling names the re-run before the refresh, but U5-4 cannot be green until the #718 row exists. The reword and the refresh therefore land first, and the verifier re-runs U5-6 and U5-4 together at the resulting head, which is the only order in which both can be true.
