# Approval: gate-split (#713)

Asked by the Conductor through AskUserQuestion on 2026-09-20, against plan revision 3 (`ebd607cd`). Checkability at the time of asking: 39 green, 3 yellow, 0 red of 42; revision 3 closes the three yellows (P9, P3, U6-6).

| # | Question | Options | Chosen |
|---|---|---|---|
| 1 | Approve the #713 plan (split the full corpus sweeps out of npm test into CI gate scripts)? Ceiling 120 s, CI 300 s wall per PR, sampled sweep is a canary and the full CI gates block landing. Starts after #681 lands. | Approve (Recommended) · Approve, but start now · Hold | "Approve (Recommended)" |
| 2 | Include headless-boot.mjs as unit U5? | Yes, include it (Recommended) · No, leave it | "Yes, include it (Recommended)" |
| 3 | Allow a one-line edit to .claude/CLAUDE.md naming the new CI jobs? Adapter row X9 requires the owner's yes. | Yes, one line (Recommended) · No | "Yes, one line (Recommended)" |
| 4 | Shared derived ramps across test files: own ticket or drop? | Drop it (Recommended) · File a ticket | "Drop it (Recommended)" |

Mobilization waits on #681 landing (the plan's start gate G0 decides by command).
