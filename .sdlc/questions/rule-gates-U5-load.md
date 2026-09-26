# Owner ruling: rule-gates U5 quiet-run requirement

Asked by the Conductor (ultimate-tokens-83) through AskUserQuestion on 2026-09-25.

Context: rg-U5-builder-l3-p1 owes three `npm test` runs taken with the 1-minute load average under 5. Concurrent sessions held load between 18.46 and 152 through 85+ minutes of polling, stalling U5 and, behind it, the rule-gates landing (G0 for prompt-audit).

| # | Question | Options | Chosen |
|---|---|---|---|
| 1 | Rule-gates U5 needs three npm test runs with machine load under 5, and the machine has stayed at 18 to 152 because of other sessions. How do you want to unblock it? | I'll free up the machine (Recommended) · Accept runs under load · Just wait | "Accept runs under load" |

Ruling: U5 may count three green `npm test` runs taken under load. Each run records its load average and elapsed time beside the result. A red run under load is triaged with the `flaky-gates` procedure (isolation re-run) before it counts against the unit. The baseline timing figures taken under load are marked as under-load, not as the quiet-machine figure.
