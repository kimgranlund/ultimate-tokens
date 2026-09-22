# Question verdict-frontmatter U1-4 · from orchestrator

| Field | Value |
|---|---|
| Blocks | verdict-frontmatter U3's verdict and the second pre-land, since U3-5 requires every earlier row to hold |
| Raised by | the U3 builder, `.sdlc/handoffs/verdict-frontmatter-U3.md` section "Finding" |
| Finding | U1-4 plants a list fixture of `# x`, `survey.md` and `zz-absent.md`, then counts `STALE # x` (expect `0`) and `STALE zz-absent.md` (expect `1`). U3 checks the pin first, so `zz-absent.md`, which never existed at `f685529f`, now prints `GROWN zz-absent.md` and the second count reads `0`. A name that was grandfathered and then deleted still prints `STALE`. The row's purpose, that the substituted list is read and its `#` line is not a name, still holds: the absent name is reported, under the new prefix |
| Question | How is U1-4 graded from U3 on? |
| Options | A the verifier grades U1-4 on its purpose: no report of `# x` under any prefix, and exactly one report of `zz-absent.md` as `GROWN` or `STALE`, criterion text unchanged (recommended: same shape as the two earlier ruling A answers) · B a plan revision rewrites U1-4's second needle to `GROWN zz-absent.md` now · C make U3 print `STALE` for a name absent both at the pin and now, keeping U1-4 as written |
| Default if unanswered | A |
| Why not B by the Orchestrator alone | U1-4 has a verdict; rewriting acceptance after its verdict is the class ADR-027 is to rule on |

## Answer

| Field | Value |
|---|---|
| Ruled by | the Conductor (ultimate-tokens-a4), 2026-09-22, by cross-session message to the Orchestrator; a Conductor ruling, not recorded as the owner's |
| Source, verbatim | "Not A this time: U3 changed the output on purpose, so U1-4's text should say what the check now prints. Revise U1-4's second needle to `GROWN` in the plan, cite U3 and this message, and have U3's verifier re-grade U1-4 with its control (the ADR-027 rule 4 shape). Three "grade on purpose, text unchanged" rulings in a row is a pattern I do not want to grow." |
| Chosen | B |
| Effect | plan revision 9 moves U1-4's second needle to `GROWN zz-absent.md`; U3's verifier re-grades U1-4 with its control |
