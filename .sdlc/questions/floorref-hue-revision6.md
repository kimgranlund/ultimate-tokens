# Question floorref-hue pre-land · from orchestrator

| Field | Value |
|---|---|
| Blocks | floorref-hue pre-land record (it needs `baseline-agrees-check.sh` at `stale total: 0`); ticket #766 |
| Evidence | `.sdlc/verdicts/floorref-hue-U3.md` finding 2; `.sdlc/checks/baseline-agrees-check.sh` line 42 requires `t.length === 3` readings per timing row |
| Finding | The `gate:even-dips` and `gate:chroma-envelope` baseline rows hold five quiet-host paired readings (U2 C2.8), and the check reads exactly three, so both rows read STALE whatever the numbers are. The other STALE lines (ui.html figure, the chroma-envelope adapter range, the stray "19 to 23 s" phrase) are plain record fixes I make at pre-land. |
| Question | The plan has five revision rows already, so a sixth needs the owner. May it add U4 (S, trivial lane, builder-l1, reviewer-l1): change the check to accept three or more readings (`t.length >= 3`), nothing else? |
| Options | A (recommended): yes, revision 6 with U4 as above. · B: no plan change; cut each of the two rows to three readings (loses the five-pair record the verifier timed). · C: no; a separate issue and PR for the check, landed before this plan. |
| Default if unanswered | none: a sixth revision row needs the owner |

## Answer

| Field | Value |
|---|---|
| Asked | 2026-10-03, via AskUserQuestion |
| Chosen | A: "Yes, add U4 (Recommended)" |
| Ruling | revision 6 adds U4 (S, trivial lane, builder-l1, reviewer-l1): the check accepts three or more readings, nothing else |
