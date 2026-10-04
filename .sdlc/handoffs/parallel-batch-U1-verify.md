# Handoff U1 · orchestrator to verifier

| Field | Value |
|---|---|
| Plan | parallel-batch, `### U1` and `### U1 criteria` (C1.1 to C1.5), plan file `.worktrees/plan-parallel-batch/.sdlc/plans/parallel-batch.md` |
| Ticket | #786 (anchor), issue #748 item 1, #796 marketing lines |
| Branch | unit/pb-U1 @ 6017e1ad (builder handoff cb5051f2, content 46e04538, reviewer record on top) |
| Worktree | .worktrees/pb-U1 |
| Base | 61bcd123 |
| Lane | `docs/marketing/**` plus the builder handoff and review record |
| Builder | pb-U1-builder-l2-p1 (sonnet, marketing-manager-agent), handoff `.sdlc/handoffs/parallel-batch-U1.md` in the worktree: per-line rubric verdicts, 85-row `## Claims` ledger, `~~~sh ran` and `~~~out ran` pair |
| Review | `.sdlc/reviews/parallel-batch-U1-review.md` in the worktree, PASS; five low findings, none blocking (store-copy `:188` "$19 / seat / year" spacing, lowercase "light and dark" at `store-copy.md:133` and `boilerplate.md:28`, `:37`, a skipped table label in the handoff, `store-copy` §9 and §10 name `src/ui/app.js` where the text is in `src/ui/overlays/settings.js`, the receipt note sign-off line break) |
| Checker grade | verifier-l2 (opus high); R86 and R92, no fable |
| Record | `.sdlc/verdicts/parallel-batch-U1.md` with the head sha |

The builder's four open items (settings.js:402 "hosted MCP" present tense, voice-check.mjs spelled-out numbers, the voice platform's "em-dash form", the live store walk) are follow-ups outside the lane; do not grade them as defects. The reviewer's low findings go to a follow-up unless you rule one a defect. Re-run C1.1 to C1.5 with controls, rerun the `ran` block and diff it against `out`, sample the Claims ledger with one planted control, and judge whether the two claim-changing edits (`landing.md:41`, `:52`) stay inside the fact sheet and voice platform. Common rules: `.sdlc/handoffs/parallel-batch-waveA-brief.md`.
