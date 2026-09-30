# Question chroma-envelope U3 (second set) · from orchestrator

| Field | Value |
|---|---|
| Blocks | chroma-envelope U3 criteria C3.3, C3.4, C3.7's f4 and FLOORS (#725); the builder continues with C3.5 to C3.8 meanwhile |
| Evidence | builder's measured table, rows Q4 and Q5: `.worktrees/ce-U3/.sdlc/questions/chroma-envelope-U3.md` (commits with the unit); plan revision 7 on main |
| Finding | Q4 (C3.4): the tone hold fixes all 21 listed (iii c) keys, but 12 new keys appear, all hue 165, lift 40, stops 250 to 350, L* 94 to 97.5. Each rise is 0.011 to 0.037 L*, under the row's own 8-bit rounding floor: the continuous held L* descends, and the pixel near the G = 255 wall rounds it back up. C3.4 lets the list only shrink. Q5 (C3.3 x2): 42,112 of 251,064 anchored oklch rows miss the 0.01 L* bar (max 1.007). Cause, verified: the per-stop hue solve reads the 8-bit staircase at the damped `s`. Solving the hue once per stop at the basis `s` reads 0 on all rows (scratch copy). The plan's construction text says "one solve per stop, reused" without naming which `s`. |
| Question 1 | How are the 12 sub-rounding (iii c) rises ruled? |
| Options | A (recommended): add them to `GRID_R2_EXCEPTIONS` as named quantization keys, each rise under its row's 8-bit floor; the list still loses 21 net 9. · B: plan a pixel-monotone pass on the non-anchored path in U3 (engine scope growth, may move other fixtures). |
| Update (Q6, found after this doc was sent) | `anchor.mjs` f4 bounds the default kit's hueSpace flip at `<= 2` codes (ruled final, `anchor.mjs:1290`). At U3 head it reads 3 (perceptual Warning stop 150, peak Info stop 350); the U2 base and the unheld stub read at most 2; the OKLab dE bound still holds (0.0090 / 0.0059). The basis-`s` hue solve from Q2 option A brings perceptual to 1 but takes peak to 11 (Secondary stop 450). So Q2 and Q6 share one cause (the hold turns the per-hueSpace hue difference into an L* shift), and no single engine choice clears both today. |
| Question 2 | How are C3.3 x2 and the f4 codes bound (Q6) met? |
| Options | A (recommended): a planner re-diagnosis of the hold and hue-solve coupling first; it returns one construction with x2 and f4 both measured, and the bars stay as they are until then. The builder finishes C3.5 to C3.8 meanwhile. · B: the basis-`s` solve (x2 0) and widen the f4 codes bound to 11 on peak. · C: keep the damped-`s` solve, widen x2 to 1.01 L* on anchored oklch rows and the f4 bound to 3. |
| Update (Q7) | C3.7 repeats C2.7's rounded-down FLOORS pins. Of 96 cells, 34 move against the U2 base and 2 cross a pin. Peak Success light goes 7.6022 to 7.5925 and is re-pinned 7.6 to 7.5 (above its bf2aaf6 floor 7.2). Perceptual Data 3 dark goes 4.9376 to 4.8869 (accent `#E92A47` on black) and is re-pinned 4.9 to 4.8. That cell is already in `PENDING_U4` at 4.9, so `semantic.mjs` reds one line (an accepted drop eroded further). |
| Question 4 | How are the two FLOORS pin crossings ruled? |
| Options | A (recommended): accept both as the retune's declared cost; the 4.8 moves into `PENDING_U4`, and U4 records it with the other 41; still above the bf2aaf6 floor and the 4.5 AA line. · B: fold into Q2's re-diagnosis, which must also hold these two cells. |
| Question 3 | May the plan take revision 8 to write these answers into C3.3, C3.4, the f4 row and the construction text? |
| Options | Yes (recommended) · No, the answers stand as rulings the verdict cites |
| Default if unanswered | none: both change a bar or a list rule the plan set |
