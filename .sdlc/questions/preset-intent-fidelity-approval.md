# Approval: plan preset-intent-fidelity (#681)

date: 2026-09-18
asked by: conductor (ultimate-tokens-4b)
answered by: human (Kim Granlund)
refers to: .sdlc/plans/preset-intent-fidelity.md, checkability record in the conductor scratchpad (plan-preset-intent-checkability.md, READY at revision 4)

## Q1
Question: Plan `preset-intent-fidelity` (Lane A, 6 units) passed the checkability review. Criteria: C1 npm test green + clean tree; C2 prime.DEFAULT == stored anchor hex, 3,380/3,380; C3 ramp passes through the anchor at stop 500 in all 3 modes, 0 misses; C4 non-anchored output byte-identical to the branch point; C5 every anchored ramp monotone and distinct, 10 named edge sources allow-listed with a control; C6 envelope 300/700 <= 75 %, 100/900 <= 25 % (p90), #668's nine palettes 0 upticks; C7 one chromaEnvelope shared by both paths; C8 hpg-role-contrast green, no family below its floor; C9 all generated assets regenerate clean, role-table gains 16 anchors; C10 ADR-025 + CHANGELOG + skill/rubric records, each grep-checked; C11 ladder symmetric in CIE L*, 9 L*/rung, Tertiary/Danger/Warning clip named; C12 hue/chroma edits detach, Reset re-attaches from sourceAnchor (shim test). Units: U1 anchor field + prime identity, U2 ramp pass-through + Reset, U3 envelope, U4 regen + blast radius, U5 records, U6 ladder. Sequence: after #662, #674, #668 land. Approve for mobilization?
Options:
- Approve (Recommended)
- Approve, but show me the blast radius first
- Hold
Chosen: Approve (Recommended)

## Prior rulings folded into this plan (same day, same channel)
- prime = the authored source colour exactly; global ramp muting with the prime untouched, all three modes; ladder rungs step in perceived lightness, equal both sides
- Q1 anchor stop 500; Q2 default-kit anchors from stop-550 hexes; Q3 exact token, ramp at nearest workable L*, gate names the edge sources; Q4 75 % / 25 %; Q5 opt-in anchor for authored brands (recommendation taken); Q6 "we should have a Reset action to re-attach"; Q7 dampAmp slot kept, default 0 (recommendation taken); Q8 keep 54 L*; Q9 CIE L*, 9 L*/rung, equal-compress, hold chroma (recommendation taken)
