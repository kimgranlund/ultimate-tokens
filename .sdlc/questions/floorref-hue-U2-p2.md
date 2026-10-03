# Question floorref-hue U2 pass 2 · from orchestrator

| Field | Value |
|---|---|
| Blocks | floorref-hue U2 (#766), a third pass (past the pass cap of 2), and U3 |
| Evidence | `.sdlc/reviews/floorref-hue-U2-review-p2.md` F1 and F2 (unit/fh-U2 @ 4bea1367, code head 777367eb); builder record `.sdlc/handoffs/floorref-hue-U2-p2.md` |
| Finding | Rule A (R85) is built exactly and C2.1 to C2.14 all hold and replay: gate path 0 cells moved, rendered 3,870 / 4,441 and 9.11 C, non-anchored path byte-identical to the merge-base at every hueShift, the new hueShift grid at 0 with both controls biting (32 and 8). The reviewer then ran 5,000 random anchored palettes over the full persisted domain (hueShift -60 to 60, any anchor, chromaFloor 0 to 100): base 33 dip cells, head 21, so 16 are gone and 4 are new (2 palettes, hue spaces oklch, hueShift 39 and 49, non-default chromaFloor 57 and 68). With default-kit controls, or at hueShift 0, head adds none. The new dips come from the half of rule A the owner kept, the per-stop solved hue on the anchored OKLCH path, so no builder pass fixes them inside the ruled rule. The plan's Risk row 1 line "measured and closed" is false as written, and C2.13 (b) covers only the kit's 16 anchors. Also: the evenChroma header comment overclaims on that path (F2), the even-dips timing reads 1.59 against a 1.6 bound (re-time quiet), and the builder's one Revisions line sits on the unit branch only |
| Question | How is the 4-cell residue ruled? |
| Options | A (recommended): accept the measured trade, net 12 fewer dip cells on the same draw than the merge-base. The planner writes revision 4: Risk row 1 re-worded from the measurement, C2.13 (b) widened to a pinned-seed random anchored set whose head dip count must not exceed the merge-base's, the evenChroma comment fixed (F2), the Revisions line mirrored; then one more builder pass (a third, records and gate only, no engine change) · B: the planner re-plans the anchored OKLCH reference (a different rule for that path, then a fresh pass; costs another cycle and may move the 3,870 / 9.11 C figures) · C: ship the unit as built, no third pass, the residue recorded as a known follow-up issue (the pre-land would then see an unclosed Risk row and an overclaiming comment) · D: close #766 with no engine change |
| Default if unanswered | none: a third pass and a re-rule of a Risk row need the owner |

## Answer

| Field | Value |
|---|---|
| Date | 2026-10-01 |
| Options | A accept the trade (recommended) · B re-plan the anchored path · C ship as built · D close #766, no change |
| Chosen | A: accept the measured trade (R87); revision 4, one records-and-gate pass, no engine change |
