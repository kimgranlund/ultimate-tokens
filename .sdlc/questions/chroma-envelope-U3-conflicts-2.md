# Question chroma-envelope U3 (second set) · from orchestrator

| Field | Value |
|---|---|
| Blocks | chroma-envelope U3 criteria C3.3 and C3.4 (#725); the builder continues with C3.5 to C3.8 meanwhile |
| Evidence | builder's measured table, rows Q4 and Q5: `.worktrees/ce-U3/.sdlc/questions/chroma-envelope-U3.md` (commits with the unit); plan revision 7 on main |
| Finding | Q4 (C3.4): the tone hold fixes all 21 listed (iii c) keys, but 12 new keys appear, all hue 165, lift 40, stops 250 to 350, L* 94 to 97.5. Each rise is 0.011 to 0.037 L*, under the row's own 8-bit rounding floor: the continuous held L* descends, and the pixel near the G = 255 wall rounds it back up. C3.4 lets the list only shrink. Q5 (C3.3 x2): 42,112 of 251,064 anchored oklch rows miss the 0.01 L* bar (max 1.007). Cause, verified: the per-stop hue solve reads the 8-bit staircase at the damped `s`. Solving the hue once per stop at the basis `s` reads 0 on all rows (scratch copy). The plan's construction text says "one solve per stop, reused" without naming which `s`. |
| Question 1 | How are the 12 sub-rounding (iii c) rises ruled? |
| Options | A (recommended): add them to `GRID_R2_EXCEPTIONS` as named quantization keys, each rise under its row's 8-bit floor; the list still loses 21 net 9. · B: plan a pixel-monotone pass on the non-anchored path in U3 (engine scope growth, may move other fixtures). |
| Question 2 | How is C3.3 x2 met? |
| Options | A (recommended): solve the hue once per stop at the basis `s`; measured 0 over 251,064 rows; the fixtures move, and U3 declares the movement. · B: keep the damped-`s` solve and widen x2's bar on anchored oklch rows to 1.01 L*. |
| Question 3 | May the plan take revision 8 to write these answers into C3.3, C3.4 and the construction text? |
| Options | Yes (recommended) · No, the answers stand as rulings the verdict cites |
| Default if unanswered | none: both change a bar or a list rule the plan set |
