# Standing rulings from the owner, 2026-09-20

Asked by the Conductor through AskUserQuestion in one batch. Each applies until the owner revokes it.

## R1 Landing authority
Question: May I land without asking whenever all three hold: the pre-land record is green, CI is green on the exact head sha, and the critic's ACCEPT names that sha? Applies to #709 (both PRs), #681 and #701.
Options: Yes, land on the three gates (Recommended); No, ask me each time.
Chosen: Yes, land on the three gates (Recommended).
Effect: the Conductor lands on the three gates and reports afterwards; anything short of all three still goes to the owner.

## R2 #681 U4 rulings by rule
Question: May I settle the three pending U4 questions by rule: accept whatever the integration head measures when each moved name has a cited mechanism and a count gate, criteria reconciled to the unit's real scope, re-pins accepted only when the verifier reproduces them?
Options: Yes, settle by that rule (Recommended); No, bring me the numbers.
Chosen: Yes, settle by that rule (Recommended).
Effect: the final numbers land in the blast-radius report and the PR body; the owner is asked only if a count moves without a mechanism.

## R3 #701 planned in parallel
Question: May the planner write #701's plan now, in parallel with #681, so it is checkable and ready for one approval the moment #681 lands?
Options: Yes, plan it now (Recommended); Wait until #681 lands.
Chosen: Yes, plan it now (Recommended).

## R4 Conductor session mode
Question: This session runs without bypass, so each message to a peer is held until approved on their side.
Options: I will restart this session in bypass mode (Recommended); Leave it as is.
Chosen: I will restart this session in bypass mode (Recommended).

## Earlier today, same channel
- Lone spike (#681 U4): Name the 64 and gate the count; fix joins #701 (Recommended).
- #377: Keep open, labelled blocked. #496: Park it, the owner does the Figma steps later.
- The other conductor session no longer touches this repo's plans (owner, in chat).

## R5 to R7 Speed levers (asked after the owner's "why is this so slow?", same day)
Question: Which of these do you want? Each trades some rigor or convenience for speed.
Options (multi-select): Pause the other project's Playwright runs until #681 lands; Light process for records-only changes; No new records tickets: findings ride the next code PR; Criteria stop pinning line numbers and exact prose.
Chosen: Criteria stop pinning line numbers and exact prose; No new records tickets: findings ride the next code PR; Light process for records-only changes. Not chosen: pausing the other project.

- R5 Light process for records-only changes. A change touching only `.sdlc/` gets one unit, one reviewer, no separate verifier pass and no pre-land pair; the critic's ACCEPT at the head sha and green CI stay. Risk the owner accepted: a wrong record lands and is fixed in the next PR.
- R6 No new records tickets. A review finding about a file under `.sdlc/` is fixed inside whatever PR is open, never minted as its own ticket or plan.
- R7 Criteria needles are function names, ids and counts; never a line number, never exact prose. Planners are briefed so from now on; existing plans are not rewritten for it.

These amend `.sdlc/adapter.md` §2.1. Per R6 the amendment is not its own plan: it rides gate-split U6b, which already owns that file. Until it lands, this document is the ruling of record.
