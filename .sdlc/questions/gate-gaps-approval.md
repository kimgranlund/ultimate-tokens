# Approval: gate-gaps (#715)

Asked by the Conductor through AskUserQuestion on 2026-09-20. Checkability at the time of asking: 0 red after three review rounds; revision 4 (`b8c20f7a`) closes the last yellow (U2 step 7 no longer rewrites the baseline `ref`).

| # | Question | Options | Chosen |
|---|---|---|---|
| 1 | Approve the #715 plan (gate coverage gaps left by #681)? Two units, 16 criteria plus a start gate. Starts only after #681 and then #713 have landed. | Approve (Recommended) · Hold | "Approve (Recommended)" |
| 2 | Run the ramp identity control in CI on every PR? | No (Recommended) · Yes | "No (Recommended)" |
| 3 | Register the thin identity-control test in npm test? It raises the test-file count by one and forces a baseline figure update. | Yes (Recommended) · No | "Yes (Recommended)" |

The planner's former Q2 (keep `--authored`) was not an owner question: criterion U2-4 depends on the flag, so it is part of the plan, opt-in and never the default.

## Follow-up, 2026-09-20 (owner: speed up, we work 24/7)

| # | Question | Options | Chosen |
|---|---|---|---|
| 4 | Start now off #681's plan branch (a2bb3c84, U4 merged, engine final) instead of waiting for #681 to land on main, merging main once after the squash? | #715 U1 off #681's tree now · None, keep the gates | "#715 U1 off #681's tree now" |

Effect: the dependency on #681 landing is satisfied by building off `plan/preset-intent-fidelity` @ a2bb3c84 or later; each unit merges `origin/main` once after #681 squashes.
