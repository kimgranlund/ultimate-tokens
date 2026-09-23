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

## R8 to R10 Speed levers (asked after the owner's "why is this so slow?", same day)
Question: Which of these do you want? Each trades some rigor or convenience for speed.
Options (multi-select): Pause the other project's Playwright runs until #681 lands; Light process for records-only changes; No new records tickets: findings ride the next code PR; Criteria stop pinning line numbers and exact prose.
Chosen: Criteria stop pinning line numbers and exact prose; No new records tickets: findings ride the next code PR; Light process for records-only changes. Not chosen: pausing the other project.

- R8 Light process for records-only changes. A change touching only `.sdlc/` gets one unit, one reviewer, no separate verifier pass and no pre-land pair; the critic's ACCEPT at the head sha and green CI stay. Risk the owner accepted: a wrong record lands and is fixed in the next PR.
- R9 No new records tickets. A review finding about a file under `.sdlc/` is fixed inside whatever PR is open, never minted as its own ticket or plan.
- R10 Criteria needles are function names, ids and counts; never a line number, never exact prose. Planners are briefed so from now on; existing plans are not rewritten for it.

These amend `.sdlc/adapter.md` §2.1. Per R9 the amendment is not its own plan: it rides gate-split U6b, which already owns that file. Until it lands, this document is the ruling of record.

Renumbered the same day from R5 to R7: the background seats (sdlc-ultimate-tokens-conductor and its orchestrator and verifier) had already recorded an owner ruling as R5 for the roadmap PR (#720, plan revision 14), and one id cannot name two rulings.

## R11 Who owns what (asked when the two conductors met on #709)
Question: Who owns #709's roadmap PR #720 from here?
Options: The background seats finish #720; I stay off #709 (Recommended); I take #720 over; the background seats stop; Split by ticket, written down.
Chosen: The background seats finish #720; I stay off #709 (Recommended).
Effect: the interactive conductor and Lanes A and B do not touch #709 U5, PR #720 or `plan/records-followup-roadmap`. Whoever closes #681 refreshes the roadmap rows that landing changes.

## R12 Ticket #718
Question: Which holds for #718, its own small plan after #681 lands (a ruling made in the other channel) or R9 (no new records tickets)?
Options: #718 keeps its own small plan; R9 applies from here on (Recommended); R9 wins: fold #718 into #713 U6b; I never ruled on #718.
Chosen: #718 keeps its own small plan; R9 applies from here on (Recommended).

## R13 The interim npm test ceiling for #681 (first asked by the background conductor, confirmed here)
Question: Lane A measured runs above the 280 to 550 s interim ceiling at load near 8.7; did you rule a quiet-host re-measure, and is it what you want?
Options: Yes: re-measure on a quiet host, then set the ceiling (Recommended); Yes, but do not block #681 on a quiet run; No, I did not rule that.
Chosen: Yes: re-measure on a quiet host, then set the ceiling (Recommended).
Effect: the ceiling stays 280 to 550 s as written in plan preset-intent-fidelity C1. Nothing widens before a reading taken with every run started at load under 5. A run at load 5 or above is recorded with its load and not graded. #681's pre-land needs one such quiet run. The figures first relayed with this question (a band top 40 to 170 s low) were retracted by Lane A the same hour: run 1 of the series read 518.66 s, and sorted by CPU share the series is near monotone, which is contention.

## R14 The U11 split of records-followup (#709)
Question: U11 of records-followup hit three passes; re-diagnosis at `.sdlc/plans/records-followup-U11-rediagnosis.md` (main `6a25c6b0`) recommends a split. Adopt it?
Options: Split (Recommended); Hold #720 until the check exists; Let me read the re-diagnosis first.
Chosen: Split (Recommended).
Effect: U11 lands the four clean repairs with #720, U5-8 is not adopted, one chore ticket for the class; the Conductor still asks before #720 lands.

## R15 How U11's four remaining roadmap edits get made (#709)
Question: U11 second re-diagnosis (`.sdlc/plans/records-followup-U11-rediagnosis.md` §6.3, main `ba7f398c`): how do the four remaining roadmap edits get made?
Options: A, the Orchestrator's landing refresh (Recommended); B, a fourth builder pass; C, land as is.
Chosen: A, the Orchestrator's landing refresh (Recommended).
Effect: one roadmap-only commit with the four edits, no ticket minted until the squash, then a verifier-only pass 4 on R2 and R4 graded against live `gh` and `git` rather than against the file. Made as `f615f573` on `unit/rf-U11`. The Conductor still asks the owner before #720 lands.

## R16 How PR #720 lands (#709)
Question: PR #720 failed pre-land pass 3 on live counts that move mid-pass (`.sdlc/questions/records-followup-landing-window.md`). How does #720 land?
Options: Atomic landing window (Recommended); Another ordinary pass; Drop live counts from the roadmap first.
Chosen: Atomic landing window (Recommended).
Effect: squash approved in advance, conditional on the record being 🟢 at the refresh instant; no seat on this repo mints tickets until #720 is squashed; four repairs, counts re-read from gh, verifier re-checks the four rows and the counts, hand squash after green CI (adapter land never merges, F9). U13 carries eight repairs since the pass 3 addendum; the verifier re-checks all eight, since the condition is a 🟢 record.

## R18 Repair or rebuild the roadmap (#709)
Question: the citation census closed at 383 claims, 48 fail, 45 blocking, plus a legend contract broken across about 20 cells (`.sdlc/questions/records-followup-repair-or-rebuild.md`). Repair, rebuild, or land the handoffs and ticket the roadmap?
Options: Rebuild the roadmap (Recommended); Repair inside the window; Land the handoffs, ticket the roadmap.
Chosen: Rebuild the roadmap (Recommended).
Effect: regenerate so every cell is the output of a command recorded beside it, the legend holds by construction, the counts fall out of generation; handoff repairs already made are kept. The freeze holds until the squash and the squash still needs a 🟢 record.

## R19 The R16 mint freeze while the roadmap is rebuilt (#709)
Question: the R16 mint freeze is holding the other lane's finished plans (#718, #713) and three unfiled issues; the R18 rebuild makes counts an output of generation. Keep the freeze as is?
Options: Lift now, re-freeze for the window (Recommended); Keep it until the squash; Lift for merges only.
Chosen: Lift now, re-freeze for the window (Recommended).
Effect: other lanes land and file again at once; the Conductor calls a fresh, short freeze only for the minutes when the rebuild reads counts and squashes, and both lanes must agree to it. The rebuild's `gh` read stays the last act before the squash, as R16 set.

## R20 How long the R19 re-freeze holds (#709)
Question: the R19 re-freeze ran about five hours; the rebuilt roadmap records the command and instant beside each count. How long should the freeze hold?
Options: Lift after the snapshot check (Recommended); Hold until the squash; Lift now.
Chosen: Lift after the snapshot check (Recommended).
Effect: the verifier diffs the roadmap's `gh` snapshot against live `gh`; on a match the freeze lifts at once and pre-land grades the snapshot at its recorded instant, not live `gh` at the squash, which supersedes R16's wording that the `gh` read be the last act before the squash, for #720. The squash still waits on a 🟢 record. The snapshot matched 20 of 20 issues and 3 of 3 PRs at 12:36:51Z and 12:39:02Z (main `6eee94bf`), and the freeze is lifted. The five hours sat before `go`, while the freeze was being arranged, not in the build.

## R31 Who is Conductor after the 0.3.1 restart
Question: after the 0.3.1 restart, who is Conductor? Asked by AskUserQuestion on 2026-09-23 16:50 PDT (options: a4 stays Conductor (Recommended) · This seat is Conductor again).
Options: a4 stays Conductor (Recommended); This seat is Conductor again.
Chosen: "a4 stays Conductor". Minutes later the owner typed directly to the seat: "be the conductor", a superseding instruction.
Effect: sdlc-ultimate-tokens-conductor (bf44370f) is the L0 seat again; ultimate-tokens-a4 stands down. The seat's runtime notes call this R21, but R21 already names the 2026-09-22 ruling that extends R1 (`.sdlc/runtime/owner-rulings-2026-09-22.md`, with R22 to R30 after it), so it is filed here as R31.
