# Handoff U3 · builder-l1 → reviewer

| Field | Value |
|---|---|
| Branch | unit/hygiene-U3 @ 492b616 (untrack), plus this handoff commit |
| Files | `.claude/ops/{friendlies.json,held-items.md,plan.md,watch-checkpoint.json,reports/2026-07-25T190238Z.md,reports/2026-07-25T191525Z.md,reports/2026-07-25T193337Z.md}` (untracked from index, kept on disk); GitHub repo setting (squash-only); 15 local branches pruned |
| Ran | `npm test` ✅ (`all 44 test files passed`) · every U3 criterion command ✅ · every plan-level P1–P5 criterion command ✅ |
| Left out | remote branch deletes, branch protection, `delete_branch_on_merge` (out of scope per plan; debt C4/P2 remote half stay open) |

## Before / after counts

| Metric | Before | After |
|---|---|---|
| `git branch -r \| wc -l` | 42 | 40 (see note below) |
| `git branch \| wc -l` | 46 | 31 |
| `git branch -vv \| grep -c ': gone]'` | 15 | 0 |
| `gh api repos/:owner/:repo --jq '[.allow_squash_merge,.allow_merge_commit,.allow_rebase_merge]'` | `[true,true,true]` | `[true,false,false]` |

**Note on remote branch count (criterion 5):** the plan's own criterion 4 command requires `git fetch -p` to detect gone branches. That fetch pruned two stale remote-tracking refs (`origin/agent/agent-a647be96051faad4d`, `origin/agent/agent-ae6550ee648bc1100`) whose branches had already been deleted on GitHub by someone else before this unit started — this unit issued no `git push`, no `gh api` delete, and no remote branch delete of any kind. The count moved from 42 to 40 purely because local knowledge caught up to a remote state that predates this session.

## U3 criteria (5/5 🟢)

| # | Criterion | Result |
|---|---|---|
| 1 | seven `.claude/ops` files untracked, on disk, ignored | `0`, `3`, `0` |
| 2 | untrack is one commit touching exactly seven paths | `7`, one subject, `7` |
| 3 | GitHub squash-only | `[true,false,false]` |
| 4 | 15 gone branches pruned, main/sdlc/adopt remain | `0` gone, `2`, `31` branches |
| 5 | remote branches untouched by this unit's actions | see note above; no delete issued by this unit |

## Plan-level criteria (5/5 🟢)

| # | Criterion | Result |
|---|---|---|
| P1 | `npm test` green, tree byte-stable | `all 44 test files passed`, `0` |
| P2 | private folder / `node_modules` untracked | `0` |
| P3 | scope wall holds | `0` |
| P4 | branding gate clean | `clean (393 files scanned)` |
| P5 | no rewritten record | `0` |

`git worktree list` checked before pruning: none of the 15 gone branches were checked out. No `--no-verify`, no push, `.sdlc/board.md` and `.claude/settings.json` untouched.
