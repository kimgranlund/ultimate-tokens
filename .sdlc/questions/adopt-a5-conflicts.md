# Approval: adopt-repo A5 conflict list

date: 2026-09-16
asked by: sdlc-conductor
answered by: human (Kim Granlund)
refers to: .sdlc/adapter.md §4 (13 rows; C1, C2, C5, C7, C8, C10-C13 approved as proposed; C3, C4, C6, C9 below)

## C3 Size labels
Question: the repo labels issues size:small|big (ADR-017) while the sdlc adapter mints size:S|M|L. Two families on one repo, or one?
Options: Two families, both listed (Recommended) · One family: amend ADR-017 to S|M|L
Chosen: Two families, both listed (Recommended)

## C4 Landing
Question: `adapter.py land` merges with a merge commit and never waits for CI; the repo squash-merges after a manual CI check. Which landing door?
Options: Interim: adapter dry-run + shipping-changes merges (Recommended) · Extend the plugin: squash + CI wait in land · Accept merge commits, adapter lands
Chosen: Interim: adapter dry-run + shipping-changes merges (Recommended)

## C6 .claude/ops
Question: seven files under .claude/ops/ are tracked although .gitignore ignores that directory. Untrack them?
Options: Untrack the seven in A7 (Recommended) · Keep tracked, remove the ignore line · Leave as is
Chosen: Untrack the seven in A7 (Recommended)

## C9 CLAUDE.md
Question: who may edit .claude/CLAUDE.md under sdlc?
Options: Only inside a human-approved unit (Recommended) · Any builder, when a change invalidates it
Chosen: Only inside a human-approved unit (Recommended)

## D1 friendlies.json (asked after A6, 2026-09-16)
Question: `.claude/ops/friendlies.json` is the issue-sorter's allow-list; you ruled the seven ops files untracked, but this one may be durable. Keep it tracked?
Options: Untrack it with the rest (Recommended) · Keep friendlies.json tracked, untrack the other six
Chosen: Untrack it with the rest (Recommended)

## P1 Merge style (asked after A6, 2026-09-16)
Question: GitHub allows squash, merge and rebase on this repo; practice is squash. Lock the setting?
Options: Squash only, on GitHub (Recommended) · Leave all three enabled
Chosen: Squash only, on GitHub (Recommended)
