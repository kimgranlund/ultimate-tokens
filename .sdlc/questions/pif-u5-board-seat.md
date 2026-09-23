---
kind: question
plan: preset-intent-fidelity
unit: U5
from: builder
written: 2026-09-20
---

# Question U5 · from builder

| Field | Value |
|---|---|
| Blocks | the `origin/main` merge commit in `.git-worktrees/pif-u5-records`; every hunk is resolved and staged, nothing else is left to do |
| Question | Who commits a merge whose staged set includes `.sdlc/board.md`, when the merging seat is a builder? |
| Options | B (the precedent) the Orchestrator runs the commit herself in `.git-worktrees/pif-u5-records`, where the index is already resolved and staged |
| Default if unanswered | B |

## Why the merge is not optional

My base `a2bb3c84` merged main at `3ce50daa`. Main is now `e9850935` and #709 landed two things this unit depends on.

| # | What #709 changed | Why U5 cannot work without it |
|---|---|---|
| 1 | `.sdlc/checks/baseline-agrees-check.sh` gained the `note head:` line | On my base's older copy the same condition is a counting `STALE`, so the brief's "exit 0" is unreachable |
| 2 | `.sdlc/baseline.md` rewritten: five gate rows (`gate:corpus-contrast`, `gen:type-fonts` added), an `extended:` field, a 2026-09-20 correction block | Editing my base's three-row copy would put the tests-49 and ui.html-4111.1 repairs on a version main has already replaced |

## What refuses it

`git commit` on the resolved merge printed:

- `only the orchestrator commits the board (got Seat: builder)`

Same hook and same case as `.sdlc/questions/records-followup-U9-board-seat.md`, answered option B on 2026-09-20: a builder never signs `Seat: orchestrator`. I am following that ruling rather than passing `--no-verify`.

## What is staged right now

One conflict, `.sdlc/board.md`, purely additive on both sides. Resolved as the union, no row's text edited: main's `records-followup` rows first, then this plan's five `preset-intent-fidelity` rows, which matches the landed-first order the rows above it already read in. Nothing else conflicted, and `git diff --stat a2bb3c84 HEAD -- src test docs scripts figma mcp` is empty, so the merge moves no source or docs file.

Proposed subject: `merge(main): e9850935 into U5 records, board union, no source or docs moved`.

Every record edit of my own is being left UNSTAGED until this lands, so the merge commit carries the merge and nothing else.

## Answer
