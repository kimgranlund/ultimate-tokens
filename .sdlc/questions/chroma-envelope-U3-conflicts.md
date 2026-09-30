# Question chroma-envelope U3 · from orchestrator

| Field | Value |
|---|---|
| Blocks | chroma-envelope U3 criteria C3.1, C3.2, C3.6 (#725); the build continues meanwhile |
| Evidence | builder's measured table: `.worktrees/ce-U3/.sdlc/questions/chroma-envelope-U3.md` (commits with the unit); plan revision 6 on main |
| Finding | Three plan literals conflict with measurement. Q1: the retune raises two anchored peak ratchet cells (peak 100 median 8.53 to 8.93, peak 300 p90 97.42 to 99.50), exactly as the plan's own "hold + retune" matrix row predicts, while C3.2, C3.6 and the Constraints call any rise a defect. One corpus-wide success anchor (`#2E7D4F`) causes both: under the retune its stop 300 crosses stop 500 and the peak cap sets it. The unheld engine rises the same, so the retune causes it, not the hold. Q2: Kea's muted anchor reads 227 percent (226 at U2, carried, not caused by U3), and C3.2 needs a plan revision naming it. Q3: `d` 0.919 leaves perceptual 300 p90 at 90.0013 (8-bit rounding on 14 identical yellows); `d` 0.9275 clears it inside C3.1's own 0.02 bound. |
| Question 1 | How do the two predicted peak ratchet rises count? |
| Options | A (recommended): declared cost of the retune; U3 re-captures the fixture with both cells named and the cause stated; every other cell must still hold. · B: exempt peak-capped cells from the ratchet from now on. · C: a defect; U3 must find constants with no rise (open-ended search, may not exist). |
| Question 2 | How is Kea's 227 percent muted anchor ruled? |
| Options | A (recommended): named in the plan as an authored exception (the anchor itself sits above stop 500's chroma), carried from U2 and reported. · B: U3 must bring it under the rule (engine scope growth). |
| Question 3 | May U3 take `d` 0.9275 in place of 0.919? |
| Options | Yes (recommended): inside C3.1's bound, declared in the handoff · No: keep 0.919 and let C3.2's perceptual 300 p90 read 90.0013 red |
| Question 4 | May the plan take revision 7 (an eighth revision row) to write the answers into C3.1, C3.2 and C3.6? |
| Options | Yes (recommended) · No, the answers stand as rulings the verdict cites without plan text |
| Default if unanswered | none: Q1 and Q2 re-rule R69's ratchet and bars, so they wait for the owner |
