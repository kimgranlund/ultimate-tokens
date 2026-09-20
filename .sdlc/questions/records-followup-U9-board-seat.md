---
kind: question
plan: records-followup
unit: U9
from: builder
written: 2026-09-20
---

# Question U9 · from builder

| Field | Value |
|---|---|
| Blocks | the U9 merge commit; every hunk is resolved and staged, nothing else is left to do |
| Question | Who commits a merge whose staged set includes `.sdlc/board.md`, when the merging seat is a builder? |
| Options | A the Orchestrator authorizes `Seat: orchestrator` on this one merge commit, the body and the handoff say why · B the Orchestrator runs the commit herself in `.worktrees/rf-U9`, where the index is already resolved and staged · C the builder resolves board to ours and the Orchestrator appends main's two rows in her own commit straight after |
| Default if unanswered | A |

## What refuses it

`git commit` on the resolved merge printed:

- `only the orchestrator commits the board (got Seat: builder)`

The hook is `githooks/commit-msg` in the sdlc plugin cache, lines 13 to 27: any commit whose staged set contains `.sdlc/board.md` needs a `Seat: orchestrator` trailer. Its merge escape (line 16) relaxes only the `Board-only:` rule, never the seat rule. A merge commit cannot leave a path out of its staged set, so there is no builder-shaped way through.

Option C is not recommended: until the Orchestrator's follow-up commit lands, this head fails U9 criterion 2, that nothing main landed is lost.

## What is staged for the board right now

Eleven rows, the union, no row's text edited, one header. Main's two landed rows first (`k17-rerun U1` #710, `records-tidy U1` #712), then this plan's nine (U1, U2, U7, U4, U6, U3, U8, U9, U5). Line 3's preamble merged with no conflict and already names k17-rerun and records-tidy as landed, so landed-first matches the order that line reads in. Say the word and the two rows move under this plan's instead.

## A second, smaller gap

U9 criterion 3 asks for `P1 to P9`. `.sdlc/plans/records-followup.md` defines `P1` to `P7` only, and of those `P2` and `P3` are marked pre-land only: `P2` needs `npm ci`, which would put `node_modules` in the unit worktree and break `P1`, and `P3` needs Chrome. Unless told otherwise the builder runs `P1`, `P4`, `P5`, `P6`, `P7` and records `P2` and `P3` as not run, with that reason.

## Answer

B, 2026-09-20, from the Orchestrator. A builder never signs the orchestrator seat, so option A was out. The Orchestrator committed the builder's staged merge in `.worktrees/rf-U9` as `6ccfcf4e` under `Seat: orchestrator`, parents `c130dd13` and `3ce50daa`. The board union was judged right as staged: landed rows first, no row's text edited. The builder's unstaged `.sdlc/handoffs/records-followup-U3.md` correction and this untracked document were left alone and commit with the handoff.

On the second gap: the builder's reading is right, the plan defines `P1` to `P7`. Run `P1`, `P4`, `P5`, `P6`, `P7`; record `P2` and `P3` as pre-land only with the reason. The Orchestrator tells the Conductor that the U9 checklist row misnumbers the range.

Correction (2026-09-20, plan records-followup U10, #709): the fenced hook refusal line is now one inline span, the bytes unchanged. Rule: `.sdlc/adapter.md` §3, Verbatim-quote rule.
