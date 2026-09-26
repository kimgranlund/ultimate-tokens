---
kind: verdict
plan: hex-oklch-dedupe
seat: verifier
pass: 2
pr: 754
ticket: "#731"
written: 2026-09-26
---

# Pre-PR · hex-oklch-dedupe · pass 2 · 🟢 at `600763ce`

Pass 1 read 🔴 on the PR text alone; pass 2 below re-reads it at the same sha. Every other row carries unchanged.

Closes #731

## Pass 1

verdict: 🔴
sha: 600763ce03fc7dda6d87e69a80c716efdd29b731

`plan/hex-oklch-dedupe` at `600763ce`, draft PR #754, one unit (U1 🟢 at `eb5fac84`).

The pair:

- **Review leg:** `.sdlc/reviews/hex-oklch-dedupe-prepr-review.md` (main `2f03c26b`), fresh and read-only,
  `PASS` at `600763ce`. It notes one 🟡: `scripts/claims.py` does not exist in this repo, and the diff adds no
  user-facing text.
- **Verification leg:** I dispatched it as `verifier-l3` at `600763ce`. Its report is `/tmp/v13/hx-prepr-verify.md`.
  `origin/main` has since moved from `0b2c3fc1` to `3186582b`, so I reran the merge rows myself against the new main.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| PR2 | the PR title matches the plan's Landing and adapter §2 | 🔴 | `gh pr view 754` reads title `plan/hex-oklch-dedupe`. Landing pins `fix(ui): model.mjs keeps one hex-to-OKLCH conversion (#731)`, and the title becomes the squash subject | the pinned title has `fix(ui):` and `(#731)`; the current one has neither |
| PR3 | the PR body matches the plan's Landing and adapter §2 | 🔴 | body length `0`. Landing pins `Closes #731`, which is the line that closes the ticket on merge. Adapter §2 asks for the plan summary, this record's table, and the generated-with line | an empty string matches none of them |

What unblocks: `gh pr edit 754` with the pinned title and a body that meets §2. That adds no commit, so
pass 2 re-reads only PR2 and PR3 at the same sha.

## Green

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P1 | `npm test`, no `node_modules` | 🟢 | `✓ all 50 test files passed`, TESTS `50`, tree `0` (the worker's run, under load, pass/fail only) | `"scrim` to `"scrimX` in `role-table.json`: `npm test` red |
| P2 | `npm run build`, tree clean after | 🟢 | `exit 0`, `wrote figma/plugin/ui.html 4122.4 KB`, tree `0` | `export` dropped from `hexToOklch`: `[MISSING_EXPORT]`, exit `1` |
| P3 | branding and dashes | 🟢 | `branding: clean (729 files scanned)`; em and en dashes outside backticks `0` | the maker-brand ADR copied into `.sdlc/verdicts/`: `FAIL: 3` |
| P4 | scope wall | 🟢 | `0`, `0` | the planner's three-name fixture: `2` |
| U1-1 to U1-5 | the unit's criteria at the head | 🟢 | one conversion (`0`, `1`, `1`, `1`); anchor gate `PASS (SAMPLED)`; probe `cmp 0` over `581488` bytes; pin in `npm test`, `16` subjects; numstat `1 20` | keyHex `#000000`: FAIL `2`; a one-digit matrix change: `cmp 1`; the `#000000` keyOklch plant: `model FAIL (16)` |
| C1 | custody from U1's verdict | 🟢 | `git diff --quiet eb5fac84 600763ce -- src/ui/model.mjs test/ui/model.mjs` exit `0` | the same diff against the merge base is non-empty |
| C2 | every other changed path is admitted | 🟢 | 10 paths: two regenerated bundles, one shifted line cite, the `.sdlc/baseline.md` KB cell and correction (admitted by revision), records | P4's filter prints `0`, the fixture `2` |
| M1 | clean merge into today's main | 🟢 | mine: `git merge-tree --write-tree origin/main origin/plan/hex-oklch-dedupe` exit `0` at main `3186582b`, tree `543a0e29`, 9 paths differ from main | the worker's conflict plant on `model.mjs` line 913: exit `1` |
| B1 | the squash leaves main's board alone | 🟢 | mine: `git diff origin/main 543a0e29 -- .sdlc/board.md` `0` lines | main against the plan head: `21` lines, so the diff can see a board change |
| M2 | the post-squash tree passes the checks | 🟢 | mine, a clone at `543a0e29`: `stale total: 0`, `verdicts 147 graded 147 bad 0`, `stale total: 0`, `range mismatches: 0` | the worker's plants: `STALE ui.html`, `bad 1`, `stale card ADR-010`, `range mismatches: 1` |
| CI | CI and smoke at the full sha | 🟢 | run `36224809883` at `600763ce`: `build-test` (its `Run npm run smoke` step included), `panda-smoke`, `corpus-contrast` and all five `sweeps` jobs `success` | run `35785765215` (`plan/small-fixes` `a1a4ffc6`) failed at `Run npm run smoke`, so that step can go red |

## Notes

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| K | carried reds | 🟡 | `doc-drift-rows` `bad 1` (DD9) and `ceiling-counts: 1 failure(s)` (#755) are main's; identical on the post-squash tree and on main. The plan does not touch the files they read | DD1 altered: `bad 2`; `**21 readings**`: `2 failure(s)` |
| T | one merge commit has no trailer | 🟡 | `52ad7ddc`, a merge into the unit branch; the squash erases it | the trailer awk printed exactly that one |
| G | GitHub mergeability | 🟡 | `mergeable: UNKNOWN` when I read it; M1 is the local evidence | re-query before the squash |

verdict: 🔴
sha: 600763ce03fc7dda6d87e69a80c716efdd29b731

## Pass 2 · 2026-09-26 · same sha `600763ce`

The PR text changed and the branch did not: `origin/plan/hex-oklch-dedupe` and #754's `headRefOid` both read
`600763ce`, so every pass 1 row other than PR2 and PR3 carries. I re-read the PR and the merge myself.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| PR2 | the PR title matches the plan's Landing and adapter §2 | 🟢 | `gh pr view 754`: title `fix(ui): model.mjs keeps one hex-to-OKLCH conversion (#731)`, equal to Landing's pin | pass 1's read of the same field: `plan/hex-oklch-dedupe`, 🔴 |
| PR3 | the PR body matches the plan's Landing and adapter §2 | 🟢 | body length `3327`: `## Summary`, `## Pre-land record table` with this record's P1 to CI rows, exactly one `Closes #731` line, and the last line `🤖 Generated with [Claude Code](https://claude.com/claude-code)`; em and en dashes `0`. This record carries its own `Closes #731` line too, because a gated land rewrites the body from the record | pass 1's read: body length `0`, 🔴 |
| M1 | clean merge into today's main | 🟢 | `git merge-tree --write-tree origin/main origin/plan/hex-oklch-dedupe` exit `0` at main `3186582b`, tree `543a0e29` (as pass 1); board diff `0` lines | the worker's conflict plant: exit `1` |
| G | GitHub mergeability | 🟢 | `mergeable: MERGEABLE`, `mergeStateStatus: CLEAN`, `isDraft: true` (it leaves draft at land) | pass 1's read: `UNKNOWN`, so the field is read, not assumed |

The carried notes K (`doc-drift-rows` `bad 1`, `ceiling-counts: 1 failure(s)` under #755) and T (the one merge
commit without a trailer, which the squash erases) stand as 🟡, and neither is this plan's.

verdict: 🟢
sha: 600763ce03fc7dda6d87e69a80c716efdd29b731
