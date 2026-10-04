# Question pane-context pre-land pass 2 · from orchestrator

| Field | Value |
|---|---|
| Blocks | #785 landing (draft PR #797); compute-layers U3 waits on it |
| Evidence | `.sdlc/verdicts/pane-context-prepr.md` pass 2 🔴 at `1cfefe26` |
| Finding | Every pass 1 red is closed and every gate, check, sweep and smoke leg is green. Two stale records remain that this diff made false and no gate reads: the ADR-026 card says stop 500 is the anchor "in all three tone modes" and names none of its five amendments (R94 makes it true only at group 100), and SPEC EX-1 still claims byte identity for a chroma 95 subject that now moves on 20/25 perceptual cells, with the #785 banner naming only REQ-002 and EX-2. Two wording lines ride along (the `tonal-legacy` case header, the plan's `climb=true`). |
| Question | May the plan take revision 15 (a sixteenth revision row, past the cap of 5): one new unit U6 (S, builder-l3, reviewer-l3, verifier-l2), records only, fixing those four lines, no engine or test logic change, then pre-land pass 3? |
| Options | A (recommended): yes, revision 15 with U6 as above. · B: the two red records only, the wording to a follow-up issue. · C: no, land with the two reds recorded |
| Default if unanswered | A (stale records are repaired in the change that invalidates them; no code moves) |

## Question 2 (added 2026-10-04, after U6 verdict pass 1 🔴)

| Field | Value |
|---|---|
| Blocks | U6 and pre-land pass 3 |
| Evidence | `.sdlc/verdicts/pane-context-U6.md` 🔴 at `edeeb8d9`; `.sdlc/plans/pane-context-U6-rediagnosis.md` |
| Finding | U6's criteria, builder, reviewer and Verifier all agree every named line is fixed and every gate is green. The 🔴 is five more live lines of the same stale stop-500 claim, found by the Verifier's tree sweep (one skill reference, three code comments, one LLD line), all outside U6's lane. U6 has had 2 builder passes, so a fix is pass 3. |
| Question | May U6 take a pass 3 (one builder-l4 pass, wording and comments only, lane widened to the five lines, a class-level sweep attached), then review, verdict and pre-land pass 3? |
| Options | A (recommended): yes, pass 3 as above. · B: yes, but the skill reference and the LLD line only; the three code comments go to a follow-up issue (they move the bundles). · C: no, land with the five lines recorded as known stale |
| Default if unanswered | none: pass 3 is never dispatched without the owner |
