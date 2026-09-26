# Verdict adopt-hygiene U1 · 🟢
verdict: 🟢

Graded by sdlc-verifier on 2026-09-16, pass 2. Branch `unit/hygiene-U1` @ 89c9538, worktree `.worktrees/hygiene-U1`. I used the criteria from `.sdlc/plans/adopt-hygiene.md` §U1 (rows 6 and 7 revised) plus P1 to P5. The Orchestrator asked for grade L3, but this seat has no Agent tool to dispatch a `verifier-l3` worker, so this seat (L1) ran every command itself. Pre-land still requires a fresh `verifier-l3`. Negative controls were edits in the worktree that I reverted, or ran against `origin/main`, the base `b885e67`, or the pass 1 commit `9b7051e`. The tree was back to 0 dirty paths afterwards. I did not use the handoff or the review as evidence.
Tally: 17 criteria. 🟢 17 · 🟡 0 · 🔴 0. Pass 2 changed three files since 9b7051e: the two archived plans' revision rows and the handoff. I re-ran every row anyway.

Correction to my pass 1 record: I wrote that the four first-of-pair SHAs (`5a0e438`, `918125f`, `8108717`, `28b6116`) were on `main`. My own `is-ancestor` run printed nothing for them, which means they are not on `main`. I misread that output. The re-diagnosis caught it, and the resolver run below confirms it.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U1-1 | ADR-010/013/016 amendments | 🟢 | 1 1 1 | pass 1: `origin/main` 0 0 0 |
| U1-2 | ADR-023/024 placement | 🟢 | ADR-022, ADR-023, ADR-024, Quick map | pass 1: `origin/main` ADR-022, Quick map |
| U1-3 | Status lines | 🟢 | 1, 1 | pass 1: `origin/main` 0, 0 |
| U1-4 | LLD, runbook, describe spec amendments | 🟢 | 1 per file; `resolve.mjs` 1 | pass 1: `origin/main` 0s |
| U1-5 | OD-004 repoint | 🟢 | 0, 1 | pass 1: `origin/main` old path 1; `docs/spec/CHANGELOG.md` absent |
| U1-6 | plans closed, archived, every `#N` and SHA a real landing | 🟢 | Row greps: 0, 3, 2, `todo` 0 and 0. The resolver printed nothing. The resolver does not check that each SHA belongs to its PR, so I checked each pair with `gh pr view <n> --json mergeCommit`, and all 9 match: #592 `9a9b9b2`, #593 `bdc3b59`, #580 `620ac4b`, #583 `f291597`, #581 `1937f95`, #595 `44c84f3`, #604 `848b80d`, #605 `e026007`, #633 `14c4260`. Each PR title names the step's ticket (#572 to #577, #578's fix, #631). Issue #578's closing comment says "Closed by #604 (merged, 848b80d)" and names #605. Both adia tags `rev-list` to `14c4260` | The resolver on the rows at `9b7051e` printed 6 lines: `PR #631 not a merged PR`, `2 untyped #N`, and four `not on origin/main`. `PR #592` changed to `PR #578`: 1 line. `PR #633` untyped to `#633`: 1 line. `620ac4b` swapped for `5a0e438`: 1 line. All restored. `origin/main`: two files in `docs/plan/`, `todo` 8 and 7 (pass 1) |
| U1-7 | PLAN-overhaul archived, D2 closing line, no stale pointer | 🟢 | `moved`, 1, 0 (`.sdlc/handoffs` now excluded) | base `b885e67`: file under `.claude/`, grep 3 |
| U1-8 | PRD stub, project-docs | 🟢 | 4, 2, 0 | pass 1: `origin/main` no `docs/prd`, grep 2 |
| U1-9 | cards + ledger rows | 🟢 | 3, 3, 3 | pass 1: base 0, 0, 0 |
| U1-10 | README; drawer/scripts untouched | 🟢 | 1, 1, 0 | pass 1: `origin/main` 0, 0 |
| U1-11 | reactivity report moved | 🟢 | `moved`, 1, 0 | pass 1: `origin/main` 6 files under `.claude/docs/reports`, 0 in reviews |
| U1-12 | K18 control | 🟢 | 1; block prints nothing | pass 1: `CURRENT_SCHEMA_VERSION` 5 printed the missing-case line |
| P1 | `npm test` green, tree stable | 🟢 | `✓ all 44 test files passed`; status 0 | pass 1: role-table `"scrimX`, FAIL 3. Restoring only `role-table.json`, as the plan's control says, left `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` dirty. The tree was clean only after a second `npm test`, the gap the review also names |
| P2 | untracked private + node_modules | 🟢 | 0 | pass 1: `origin/main` `.claude/ops/` grep 7 |
| P3 | scope wall | 🟢 | 0 | pass 1: probe in `motion.mjs`, 2 |
| P4 | branding gate | 🟢 | `branding: clean (398 files scanned)` | pass 1: `docs/x.md` copy, FAIL |
| P5 | append-only records | 🟢 | 0 | pass 1: deleted line, 1 |

## Notes for the next owner

- P1 control recipe: restoring `role-table.json` alone does not restore the tree; a second `npm test` is needed. This is a gap in the plan's recipe, not in the unit.
- U1-6 resolver: it does not check that a SHA belongs to its PR. The pairs were checked by hand above; pre-land should do the same or extend the block.
