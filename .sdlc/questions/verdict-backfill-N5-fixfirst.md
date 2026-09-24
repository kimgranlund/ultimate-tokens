# Question verdict-backfill N5 · from orchestrator

| Field | Value |
|---|---|
| Blocks | verdict-backfill pre-land (#734): whether two `verdict:` values change before the plan lands |
| Question | This plan's token rule (Q3, 2026-09-22, revision 2) reads a FIX-FIRST record as 🔴. Two records close FIX-FIRST under `verdict: 🟡`: `pif-u7-review-1.md` (line 218; #681 U9-8 read it 🟡 because `pif-u8-review.md` titles its own FIX-FIRST pass `🟡 FIX-FIRST`) and this plan's own `verdict-backfill-U4-review.md`. U4 may not change values, so neither is a U4 red. Should they be 🔴? |
| Options | A leave both 🟡: the Q3 rule governed the tokens this plan derived (U2), and a record written with its own graded token keeps it (recommended: no record rewritten after its verdict, and 🟡 FIX-FIRST is the convention both records follow) · B flip both to 🔴 in a small U5, one line each, the verifier re-deriving · C flip `pif-u7-review-1.md` only |
| Default if unanswered | A; the pre-land record names both as carried |
| Source | `.sdlc/verdicts/verdict-backfill-U4.md` row N5 |
