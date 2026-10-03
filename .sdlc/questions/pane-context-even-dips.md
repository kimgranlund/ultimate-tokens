# Question pane-context U4 even-dips · from orchestrator

| Field | Value |
|---|---|
| Blocks | pane-context U4 pass 2, plan revision 12 (past the cap of 5), then pre-land |
| Evidence | `.sdlc/verdicts/pane-context-U4.md` pass 1 🔴 and `.sdlc/plans/pane-context-U4-rediagnosis.md` |
| Finding | `gate:even-dips` is red on U4's head after the main integration. The damper is right and the gate's controls are blind: since #785 `palette.chroma` below 100 renders at 100 and is then scaled, so the grid's chroma axis (30/45/60) never reaches the regime #766 guards. Control (a) reads 0 dips (main 32); control (b2) reads 3 against its pin of 7. No `src/` change. |
| Fix | U4 pass 2 (builder-l3, S): the gate's chroma axis becomes 30/45/60/100, (b2) renders at chroma 100 with the draw kept, and (b2)'s pin moves 7 to 8 by R87's own rule (the block's count on the merge-base). The real engine still reads 0 and 6 dips; both negative controls fail the gate as they must. The pin line, the ADR-026 amendment and the foundations note move with it. The verdict's three 🟡 record rows ride along. |
| Question 1 | May the plan take revision 12 for U4 pass 2 as above, including the (b2) pin 7 to 8? |
| Options Q1 | A (recommended): yes. · B: yes, but keep the pin at 7 and treat any (b2) real line above 7 as red (it reads 6, so this is the same outcome today). · C: no, change the damper instead (rejected by R94 and R98: it needs a floor exception) |
| Default if unanswered | none: a revision past the cap needs the owner |

## Answer

| Field | Value |
|---|---|
| Asked | 2026-10-03, via AskUserQuestion |
| Chosen | A: "Yes, pin 7 to 8 (Recommended)" |
| Ruling | revision 12: U4 pass 2 as in Fix, including the (b2) pin 7 to 8 |
