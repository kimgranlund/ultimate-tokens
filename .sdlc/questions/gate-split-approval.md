# Approval: gate-split (#713)

Asked by the Conductor through AskUserQuestion on 2026-09-20, against plan revision 3 (`ebd607cd`). Checkability at the time of asking: 39 green, 3 yellow, 0 red of 42; revision 3 closes the three yellows (P9, P3, U6-6).

| # | Question | Options | Chosen |
|---|---|---|---|
| 1 | Approve the #713 plan (split the full corpus sweeps out of npm test into CI gate scripts)? Ceiling 120 s, CI 300 s wall per PR, sampled sweep is a canary and the full CI gates block landing. Starts after #681 lands. | Approve (Recommended) · Approve, but start now · Hold | "Approve (Recommended)" |
| 2 | Include headless-boot.mjs as unit U5? | Yes, include it (Recommended) · No, leave it | "Yes, include it (Recommended)" |
| 3 | Allow a one-line edit to .claude/CLAUDE.md naming the new CI jobs? Adapter row X9 requires the owner's yes. | Yes, one line (Recommended) · No | "Yes, one line (Recommended)" |
| 4 | Shared derived ramps across test files: own ticket or drop? | Drop it (Recommended) · File a ticket | "Drop it (Recommended)" |

Mobilization waits on #681 landing (the plan's start gate G0 decides by command).

## Follow-up, 2026-09-20 (after the restart)

| # | Question | Options | Chosen |
|---|---|---|---|
| 5 | Start #713's first unit now instead of waiting for #681 to land? U1 only builds the shared sorted sampler and the gate scripts and moves curated-contrast.mjs onto it; it does not touch the heavy test files #681 is changing. | Yes, U1 only, now (Recommended) · No, keep the wait | "Yes, U1 only, now (Recommended)" |

Effect: the start gate G0 is waived for U1 only. U2 onward still wait on #681 landing.

## Follow-up, 2026-09-20 (sweep of open questions)

| # | Question | Options | Chosen |
|---|---|---|---|
| 6 | The baseline `ref`: after any code PR squashes, .sdlc/baseline.md's numbers are unproven at the new main until someone re-points `ref`. Who owns the re-point? | The plan-closing commit on main re-points it (Recommended) · Keep today's pattern: the next records plan does it · Decide after #681 lands | "The plan-closing commit on main re-points it (Recommended)" |

Effect: U6b gains criterion U6-9, the adapter §5 step. Until #713 lands, close-outs follow the ruling by hand.
| 7 | Waive #713's start gate for U6a too? U6a is the CI matrix job that runs the gate scripts U1 merged; it touches only .github/workflows/ci.yml. | Yes, U6a now (Recommended) · No, Lane B idles until #716 lands | "Yes, U6a now (Recommended)" |

Effect: G0 is waived for U1 and U6a. U2 to U5 and U6b still wait on #681 landing.

## Follow-up, 2026-09-20 (owner: speed up, we work 24/7)

| # | Question | Options | Chosen |
|---|---|---|---|
| 8 | Start now off #681's plan branch (a2bb3c84, U4 merged, engine final) instead of waiting for #681 to land on main, merging main once after the squash? | #713 U2 to U5 off #681's tree now, Lane B (Recommended) · None, keep the gates | "#713 U2 to U5 off #681's tree now, Lane B (Recommended)" |

Effect: G0 is waived for U2 to U5 as well, when built off `plan/preset-intent-fidelity` @ a2bb3c84 or later; U6b still waits for #681 on main. Each unit merges `origin/main` once after #681 squashes.
