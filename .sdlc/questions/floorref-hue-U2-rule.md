# Question floorref-hue U2 · from planner (re-diagnosis)

| Field | Value |
|---|---|
| Blocks | floorref-hue U2 pass 2 (#766); U3 records name whichever rule is chosen |
| Evidence | `.sdlc/plans/floorref-hue-U2-rediagnosis.md` (sections 1 and 2); review `.sdlc/reviews/floorref-hue-U2-review.md` F1 on unit/fh-U2 |
| Finding | #766 asks the even floor to read its gamut reference at "each stop's rendered hue". A stop's hue differs from the ramp's for two reasons: the anchored OKLCH per-stop hue solve (moves 3,870 curated cells, max 9.11 C, 0 dips) and edge rotation (`hueShift`, user-set up to ±60; the curated corpus never goes past 10). Following the rotation cannot keep the dip guarantee in either direction, measured: a reference that follows it rises along the ramp and opens valleys (88 dips on a default-kit grid, 0 at the merge-base); one capped so it only falls (the reviewer's running minimum, or a plain cap) opens new notches (2 dips in 4,000 random palettes) and moves stops up to 23.52 C. No rule keeps the issue's literal wording and the guarantee together |
| Question | Which rule does #766 ship? |
| Options | A Follow the per-stop solve, not the rotation (recommended): the reference is read at each stop's own hue before edge rotation. Keeps every curated-corpus movement of pass 1 exactly (3,870 / 4,441 cells, 9.11 C), the non-anchored path byte-identical at every `hueShift`, 0 new dips in every suite, cost equal to pass 1. The 6 Adia `hueShift` +1 gate cells no longer move · B Follow the rotation downward only (running minimum): keeps more of the literal wording; the grid stays at 0 but random palettes gain 2 dips and move up to 23.52 C, and a discrete minimum makes a stop's colour depend on the stop set (a 25-step walk fixes that at 36x the anchored cost) · C Keep pass 1 as built (follow the rotation fully): fails the dip gate's intent at `hueShift` 30 and over, so it would need the dip guarantee scoped to small rotations · D Close #766 with no engine change: the per-ramp reference stays, the clamped-anchor tone fix and the solve-following are dropped |
| Default if unanswered | A: the Orchestrator dispatches U2 pass 2 on rule A from the re-diagnosis's revision 3 draft, and this record states that the rotation half of the issue is declined with its measured reason |

## Answer

| Field | Value |
|---|---|
| Date | 2026-10-01 |
| Asked | #766 floor reference: no rule follows the hue rotation and keeps the no-dip guarantee. Which rule ships? |
| Options | A per-stop solve (recommended) · B rotation, downward only · C keep pass 1 as built · D close #766, no engine change |
| Chosen | A: per-stop solve (R85). The rotation half of #766 is declined with its measured reason |
