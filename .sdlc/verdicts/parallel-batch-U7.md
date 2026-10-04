---
kind: verdict
plan: parallel-batch
unit: U7
seat: verifier
pass: 1
ticket: "#786"
written: 2026-10-04
---

# parallel-batch U7 · pass 1 · 🟢 at `cecdaabe`

verdict: 🟢
sha: cecdaabe

Unit `unit/pb-U7` at `cecdaabe` (code `f423ae11`, reviewer record on top), base `61bcd123`, issue #783 citations half, criteria C7.1 to C7.3 at plan revision 2. Builder `pb-U7-builder-l2-p1` (sonnet); checker the Verifier seat itself at grade L2 (opus), so the checker sits outside the builder's family. Reviewer-l3 record PASS. Preflight: `verdict.py check` exits 0 on the request. Every run is the seat's own, in fresh clones under the job dir (`h` at `cecdaabe`, `b` at `61bcd123`); the root and `.worktrees/pb-U7` were only read. Load was 30 to 43 during `npm test` (the handoff asked for 5 or fewer and the host never got there), so no row is a timing row; pass and fail are unaffected.

## Rows

| Criterion | State | Evidence | Negative control |
|---|---|---|---|
| C7.1 boolean and arrow-body shapes are bare literals | 🟢 | head: `node test/repo/citations.mjs` exits 0, `✓ citations: parser self-test + STALE 0 across 10 discovered docs + 11 fact pins + 35 count phrases (HEAD cecdaabe)`; the self-test positives now carry `source: () => true,`, `source: async () => { return 7; },`, `source: () => (7),` and the negatives `truthy(x)`, `true && ok()`, `(await f()).length` | a real pin `{ id: "planted bool", ..., source: () => true }` planted after `const FACT_PINS = [`: head prints `✗ test/repo/citations.mjs: fact pin "planted bool": bare literal source`, exit 1; the same plant at base `61bcd123` gives `grep -c 'bare literal'` `0` (the gap). `|true\|false` removed from the regex at head: `missed a bare literal` 3 times, exit 1 |
| C7.2 a narrowed noun reds | 🟢 | head plus `sed 's/noun: "roles?"/noun: "role"/'`: `exit 1`, `grep -c 'roles per palette'` `1`, line `✗ test/repo/citations.mjs: count phrases: fact pin "roles per palette": noun \`role\` is narrowed, its needle's \`role\` is singular so the noun must read \`role\` and \`roles\`` | the same `sed` at base `61bcd123`: `exit 0`, count `0` (matches the plan's measurement at `580df2dd`) |
| C7.3 scope and self-test | 🟢 | `git diff --name-only 61bcd123 cecdaabe`: `test/repo/citations.mjs` plus `.sdlc/handoffs/parallel-batch-U7.md` and `.sdlc/reviews/parallel-batch-U7-review.md`; head run `grep -c FAIL` `0` | the planted pin of C7.1 gives `✗ 2 citation gate failure(s)` |
| Hunks clear of pane-context | 🟢 | `git diff -U0 origin/main...origin/plan/pane-context` (`3db22066`) hits citations at `@@ -61` and `@@ -85,2`; U7 at `@@ -127`, `-130`, `-137`, `-216,0 +217,5`; `git merge-tree --write-tree cecdaabe origin/plan/pane-context` lists `Auto-merging test/repo/citations.mjs`, its one conflict being `.sdlc/board.md` (the Orchestrator's record, not this unit's lane) | the same merge-tree reports a real conflict on `.sdlc/board.md`, so it does flag overlaps |
| `npm test` | 🟢 | clean clone at `cecdaabe`, NODE_OPTIONS unset: rc 0, `✓ all 54 test files passed`, `▶ repo/citations.mjs pass`, porcelain `0` | `repo/citations.mjs` is in `TESTS`, and C7.2's mutation makes that file exit 1, so the suite reds on it |

## Findings

- 🟡 The narrowed-noun check skips any pin whose needle ends in a word already ending in `s` (`!/s$/i.test(word)`), as the reviewer's nit says. Every current such pin (`15 voices`, `10 formats`) also loses its per-pin floor when narrowed (the needle stops matching), so no pin escapes today. Measured: `type voices` narrowed to `noun: "voice"` reds as `read 0 phrases for noun `voice` (the pin's scan went vacuous)`, exit 1. A follow-up could still test the plural-needle case directly.
