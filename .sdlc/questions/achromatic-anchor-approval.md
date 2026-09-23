# Question achromatic-anchor approval · from conductor

| Field | Value |
|---|---|
| Plan | .sdlc/plans/achromatic-anchor.md (#739) |
| Date | 2026-09-23 |
| Asked by | Conductor, through AskUserQuestion |

## Question 1
Approve both plans? #738 (okl-memo) and #739 (achromatic-anchor), each one small unit, starting only after #681 lands; #738 fallbacks follow the planner's recommendations (ship the gate even if #681 dropped the memo, raise the budget only after three quiet-host runs, builder grade l2).

Options: Approve both (Recommended) · Approve #738 only · Approve #739 only · Neither yet

Chosen: "Approve both (Recommended)"

## Question 2 (Q1)
What hue should a grey, white or black anchor give the ramp?

Options: The palette's own hue (Recommended) · Stay neutral

Chosen: "The palette's own hue (Recommended)"

## Question 3 (Q2)
How close to grey counts as achromatic?

Options: OKLab C under 0.002 (Recommended) · OKLab C under 0.005

Chosen: "OKLab C under 0.002 (Recommended)"

## Question 4 (Q3)
#739 and #701 touch the same code. Which goes first after #681 lands?

Options: #739 first (Recommended) · #701 first

Chosen: "#739 first (Recommended)"

## Note for the builder
The checkability review (scratchpad achromatic-anchor-checkability.md, rev 2) found that white's OKLab L is 0.99999999, so a literal `L >= 1` guard in the design text never fires; use a tolerance. U1-2 catches it either way.
