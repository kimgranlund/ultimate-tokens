# Question records-policy U1 · from orchestrator

| Field | Value |
|---|---|
| Blocks | records-policy pre-land, not U1 (U1 is 🟢 and merged) |
| Raised by | the U1 reviewer, confirmed by the Verifier in `.sdlc/verdicts/records-policy-U1.md` |
| Finding | U1-3 and P4 plant their negative control by moving an `ARTIFACTS` row from `1.1.0`. After #681 merges, no row reads `1.1.0`, so the plant changes nothing and the control prints `0`, the same as a pass. The checks themselves still bite after #681 (the Verifier's simulated merge printed `2` on a moved row); only the plant goes vacuous |
| Why it matters | the plan orders pre-land after #681 (U2 waits on G0), so at pre-land these two rows could not go red as written, and a row that cannot go red is not 🟢 |
| Question | How are the U1-3 and P4 controls run at pre-land? |
| Options | A the verifier plants on whatever version the row reads at the pre-land base, stated in the record, criterion text unchanged (recommended: the rule the control tests is unchanged, only its input) · B a plan revision rewrites both controls to name the post-#681 version now · C leave as written and accept a vacuous control at pre-land |
| Default if unanswered | A |
| Why not B by the Orchestrator alone | rewriting an acceptance after its verdict is the class revision 38 of records-followup left as debt and the Conductor folded into ADR-027 on this same plan |
