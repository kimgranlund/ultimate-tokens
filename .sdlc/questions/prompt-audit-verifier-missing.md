# Question prompt-audit U8 · from orchestrator
| Field | Value |
|---|---|
| Blocks | prompt-audit U8 verdict, U9, pre-land for #761; anchor-gaps U2 verdict |
| Question | The Verifier seat is not reachable (ListAgents, 2026-09-29). Also, plan/prompt-audit at 45221b04 fails `repo/verdict-frontmatter.mjs` with `bad 9`: nine `.sdlc/verdicts/prompt-audit-*-review*.md` records predate #759 and lack a `verdict:` line. Editing them needs `Seat: verifier`. How do we proceed? |
| Options | A wake the Verifier with `session.sh up`, and it backfills the nine records on plan/prompt-audit (PASS maps to 🟢, FAIL to 🔴) (recommended: the trailer rule stays intact) · B the Conductor backfills under `Seat: verifier` in single-agent mode · C hold both plans |
| Default if unanswered | C: the unit reviews continue, and nothing merges without a verdict |

## Answer
Chosen: "Hand off, then return" (owner via AskUserQuestion, 2026-09-29, R68). The Orchestrator hands its hold on plan/prompt-audit to the Verifier, the Verifier commits the nine backfilled records itself under Seat: verifier, then the hold returns to the Orchestrator.
