# Question chroma-envelope pre-land pass 1 · from orchestrator

| Field | Value |
|---|---|
| Blocks | #725 landing (draft PR #777); floorref-hue and docs-stale-batch U6 wait on it (R80, R81) |
| Evidence | `.sdlc/verdicts/chroma-envelope-prepr.md` pass 1 🔴 at `a8e4a5bc` |
| Finding | Every criterion, `npm test`, build, smoke and CI leg is green. The one 🔴 is three stale record lines the plan wrote: `test/engine/fixtures/shadcn-baseline.css:77` names exponent `r^2.0875` (head is `r^2.1796`), `docs/spec/spec-panda-park-ui-exports.md:504` says four EX-2 literals and names five, `test/engine/anchor.mjs:528` comment says 13 added and 6 removed (the diff is 14 and 7). All three are comments or prose; no code or gated literal moves. The pre-land also carries 🟡 wording: CHANGELOG `15 of 3764` scope, `within 0.8 L*` against 0.7943, `semantic.mjs:302` `7.59` against the printed `7.60:1`. |
| Question 1 | The plan is at revision 9, past the cap of 5. May it take revision 10: one new unit U5 (S, trivial lane, builder-l1, reviewer-l1), records only, fixing the three 🔴 lines plus the three 🟡 wording lines, with a scope check that no code or gated literal changes? |
| Options Q1 | A (recommended): yes, revision 10 with U5 as above; pre-land pass 2 follows. · B: yes, but the three 🔴 lines only; the 🟡 wording goes to a follow-up issue. · C: no, a fresh plan |
| Question 2 | The pre-land verifier read the C3.7 corpus-tonal timing against main at `1.414` and `1.221` (two single pairs under load 4.9 to 6.4; the base alone spread 134.5 to 115.2 s), over the plan's 1.2 bar. C3.7 is written U3-scoped and read `1.036` there. How is it ruled? |
| Options Q2 | A (recommended): C3.7 stays U3-scoped as written; the plan-wide reading is reported, not barred (CI sweeps green on the head). · B: revision 10 also adds a plan-wide re-time under the quiet-host rule before landing |
| Default if unanswered | none: Q1 is a revision past the cap and needs the owner |

## Answer

| Field | Value |
|---|---|
| Date | 2026-09-30 |
| Q1 options | Yes, fix all 6 lines (Recommended) · Yes, only the 3 red lines · No, fresh plan |
| Q1 chosen | Yes, fix all 6 lines (Recommended), option A (R84) |
| Q2 options | Keep U3-scoped (Recommended) · Re-time plan-wide first |
| Q2 chosen | Keep U3-scoped (Recommended), option A (R84) |
