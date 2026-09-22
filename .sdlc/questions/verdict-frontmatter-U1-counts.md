# Question verdict-frontmatter U1 · from orchestrator

| Field | Value |
|---|---|
| Blocks | verdict-frontmatter pre-land, not U1 (U1 is 🟡 overall with 0 🔴 and merged) |
| Raised by | the Verifier, row U1-1 🟡 in `.sdlc/verdicts/verdict-frontmatter-U1.md` |
| Finding | U1-1 expects the clean run to print `verdicts 68 graded 21 grandfathered 47 bad 0`. The unit head prints `70` and `23`: two verdicts that carry the field arrived after the pin (`records-policy-U1.md` and this unit's own review). P4's re-pin never moves these figures, since it only re-derives the failing set, and every verdict written under the mandate adds one more. So the row drifts further with each landing, the Verifier's own verdict included |
| Same class as | revision 5, which fixed the identical stale pin in U1-9 before its verdict; and ruling A on `records-policy-U1-controls.md` |
| Question | How is U1-1 graded at pre-land? |
| Options | A the verifier grades U1-1 on `grandfathered` equal to the list's name count, `bad 0` and `exit 0`, and records the `verdicts` and `graded` figures the head prints, criterion text unchanged (recommended: those are what the row protects; the totals move with every landing) · B a plan revision rewrites U1-1's Expected that way now · C leave it and accept a 🟡 on U1-1 at pre-land |
| Default if unanswered | A |
| Why not B by the Orchestrator alone | U1-1 now has a verdict, and rewriting acceptance after its verdict is the class ADR-027 on records-policy is to rule on |
