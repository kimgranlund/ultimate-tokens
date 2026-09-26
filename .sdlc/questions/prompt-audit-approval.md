# Approval: prompt-audit

Asked by the Conductor (ultimate-tokens-83) through AskUserQuestion on 2026-09-25 against revision 3. Checkability: first review 35 🟢 / 17 🟡 / 1 🔴; revision 2 re-review 49 🟢 / 4 🟡 / 0 🔴; the four 🟡 fixes the re-review wrote were applied in revision 3 (`.sdlc/verdicts/prompt-audit-checkability.md`).

Earlier scoping answers, 2026-09-25:

| # | Question | Options | Chosen |
|---|---|---|---|
| S1 | How should the 85 proposed edits be worked? | One plan, carve-out (Recommended) · Plugin + MCP only now · Fold into docs-repair · File issues, no plan yet | "One plan, carve-out (Recommended)" |
| S2 | Should the plan also add gates that fail when a skill's stated facts drift from the engine? | Yes, pin the counts (Recommended) · No, text fixes only | "Yes, pin the counts (Recommended)" |

Approval round, 2026-09-25:

| # | Question | Options | Chosen |
|---|---|---|---|
| 1 | Approve the prompt-audit plan (9 units, 53 criteria)? Taking the defaults also sets: ticket minted at activation (Q0), branch cut after rule-gates lands (Q1), project-docs route fix folded into U7 (Q4), U5 as a full verified unit (Q5). | Approve (Recommended) · Revise first | "Approve (Recommended)" |
| 2 | Q3: nearest_token reads 3-digit hex wrong. What should U3 do? | Fix and pin it (Recommended) · Document the limit | "Fix and pin it (Recommended)" |
| 3 | Q2: the eval runner forces a tool call to get JSON back. What should U4 do? | Leave as is (Recommended) · Add strict: true · Structured outputs | "Leave as is (Recommended)" |
| 4 | Q6: if docs-repair is still open when U1 to U7 verify, what then? | Land U1-U7, split U8-U9 (Recommended) · Hold the PR | "Land U1-U7, split U8-U9 (Recommended)" |

Resulting answers: Q0 yes · Q1 after G0 · Q2 A · Q3 A · Q4 fold · Q5 full unit · Q6 land U1 to U7, U8 and U9 as a second plan.
