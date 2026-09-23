# Question preset-intent-fidelity U7 approval · from conductor

Asked 2026-09-20 through `AskUserQuestion`, on the U7 criteria at `1417e480`
(19 rows: `U7-P1` to `U7-P5`, `U7-1` to `U7-14`). A checkability review was running when the
question was put; any red row goes back to the planner before the builder starts.

| # | Question | Options offered | Chosen (verbatim) |
|---|---|---|---|
| Q1 | U7 is planned: 19 criteria covering the symmetry corpus gate, the key-follows-anchor fix, `seedFromKey` detaching, and four record repairs. Approve the unit so the lane can build the moment it clears? | Approve, build at grade l5 (Recommended) · Approve, but build at a cheaper grade · Hold until I read the criteria myself | "Approve, build at grade l5 (Recommended)" |
| Q2 | The planner found the exception set is 26, not the reviewer's 22: the by-construction leg's 26 names are exactly `ORDER_ALLOW` in `test/engine/anchor.mjs`, with a documented mechanism. Which list does U7 freeze? | Both legs, each with its own list (Recommended) · Only the 26 by-construction list | "Both legs, each with its own list (Recommended)" |

Consequences. Q1 mobilizes U7 at builder grade l5, reviewer-l3, verifier-l3, as the checklist line
already records. Q2 confirms the plan as written: the measured-pixel leg freezes its own 22 names,
the by-construction leg reuses the 26 of `ORDER_ALLOW`, and neither leg is left ungated. Gating only
the 22 would leave the other leg red, which is the hole the pre-land review found.
