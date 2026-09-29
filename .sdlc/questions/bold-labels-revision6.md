# Question bold-labels revision 6 · from orchestrator

| Field | Value |
|---|---|
| Blocks | bold-labels U3 verification (U3-1, P1) and the plan's revision 6 (the revision cap needs the owner's answer) |
| Finding | At unit/bl-U3 aa60de32 the predicate finds 17 lines, not 18. The 17 are the Kept list minus K17: PR #761 moved `**sub-title**` in `plugin/ultimate-tokens/skills/typography-tokens/references/prose.md` off the start of its line, so it no longer matches. U3 row 5 (`**easy to miss**`) is also gone, rewritten by #761, which the plan already allows |
| Question | May revision 6 drop K17 from the Kept table and `.sdlc/plans/bold-labels-kept.tsv`, so P1 and U3-1 read `17`, `kept-exact` and the arithmetic reads 85 = 28 + 32 + 6 + 17 + 2 (the two lines #761 changed)? |
| Options | A revision 6 drops K17 and restates the counts (recommended: the record matches the tree) · B no revision, the Verifier grades U3-1 against 17 as a named 🟡 |
| Default if unanswered | A |
| Chosen | |
