# Approval: chroma-floor (#701)

Asked by the Conductor through AskUserQuestion on 2026-09-19 (PDT). Plan at plan/chroma-floor @ ceb1b65c, checkability 11 green, 1 yellow (two count literals, folded in revision 4), 0 red of 12.

## Q1
Question: #701 plan (chroma-floor, even-ramp redesign): 3 units, 12 criteria, checkability 11 green / 1 yellow (two count literals, being folded) / 0 red. U1 (M, l4) even-envelope shoulder at the anchor stop, lone-spike list retired, default kit swept; U2 (M, l6) chroma floor redesign, EVEN_DIP_BASELINE deleted, dip gate on both readings; U3 (S) records. No unit starts before #681 lands. Approve?
Options:
- Approve (Recommended)
- Send back
Chosen: Approve (Recommended)

## Q2
Question: The four even envelope cells were ruled and measured on the gate path (palette without its anchor). On the path the product actually renders, the same cells read 48/113 at stop 300 and 23/51 at 900 (median/p90 against bars 75/90 and 25/35), and 14,979 stop cells sit above the anchor's chroma. Does #701 bar the rendered path too, or only report it?
Options:
- Report only in #701 (Recommended)
- Bar them in #701
Chosen: Report only in #701 (Recommended)

## Q3
Question: The 32 even dips exactly at stop 500 (the anchor under its group basis) are the notch class #681 already rules on (Q-C). Confirm they stay outside #701?
Options:
- Yes, they stay with #681's notch ruling (Recommended)
- No, #701 takes them too
Chosen: Yes, they stay with #681's notch ruling (Recommended)

## Follow-up, 2026-09-20 (owner: speed up, we work 24/7)

| # | Question | Options | Chosen |
|---|---|---|---|
| 3 | Start now off #681's plan branch (a2bb3c84, U4 merged, engine final) instead of waiting for #681 to land on main, merging main once after the squash? | #701 off #681's tree now, a third lane · None, keep the gates | "#701 off #681's tree now, a third lane" |

Effect: the dependency on #681 landing is satisfied by building off `plan/preset-intent-fidelity` @ a2bb3c84 or later; each unit merges `origin/main` once after #681 squashes.

## Re-approval, 2026-09-22 (revision 9, `1b4cee69`)

Asked by the Conductor (ultimate-tokens-a4) through AskUserQuestion. Checkability at the time: revision 8 had 13 green, 4 yellow, 0 red; revision 9 folds the four yellows.

| # | Question | Options | Chosen |
|---|---|---|---|
| R1 | Re-approve the #701 chroma-floor plan (revision 9, 3 units, 12 criteria)? | Re-approve (Recommended) · Hold | "Re-approve (Recommended)" |
| R2 | Start after #713 lands instead of off #681's tree (the 2026-09-20 ruling)? | Start after #713 lands (Recommended) · Keep my ruling: start off #681's tree | "Start after #713 lands (Recommended)" |
| R3 | The even-mode rendered-path bar: file a ticket or accept it unowned? | Accept unowned for now (Recommended) · File a ticket | "Accept unowned for now (Recommended)" |

R2 supersedes the 2026-09-20 start-off-#681 answer.
