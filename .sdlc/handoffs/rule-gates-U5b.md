---
kind: handoff
plan: rule-gates
unit: U5b
branch: unit/rg-U5
written: 2026-09-26
pass: 1
---

# rule-gates U5b: pre-land sync onto main 920710e7, then U5's runs at the new N

Head sha: `99c452a2`. Base: `5795ac4e` (plan revision 16, pre-land pass 1's five cells fixed,
U5b opened). Owner rulings: R45 (`.sdlc/questions/rule-gates-revision6.md`, pre-land only, no
new scope), the under-load ruling `.sdlc/questions/rule-gates-U5-load.md`, R53 (`.sdlc/adapter.md`
§1 keeps the quiet 80 to 89 s figure; one `STALE time test` line is carried).

## Step 1: merge origin/main

`git fetch origin && git merge --no-ff origin/main` at `276bc3ba` (920710e7 plus the pre-land
pass-1 verdict record, no code). Two conflicts, both expected:

- `test/engine/anchor.mjs`: took main's side (the #715 U1 default-kit block, all seven named
  checks plus the vacuity floor, confirmed present after: `kitVacuityFloor`, `kitCheckLine`
  ×7), which carried its own copy of the F4 gate comment with two em dashes. Ran
  `node test/repo/em-dash.mjs --fix` over the merged tree; R8 caught both, 0 refused. Before:
  `the owner's F4 principle — "no control goes dead" for an` / `anchored palette — on the
  rendered path.`; after: `the owner's F4 principle, "no control goes dead" for an` /
  `anchored palette, on the rendered path.` `node test/repo/em-dash.mjs | tail -1` →
  `em-dash: clean (791 files scanned)`. `decision-records.md:7` still reads
  `**OVERRIDE**: that is exactly` (U4's fix intact).
- `.sdlc/baseline.md`: kept `ref: main @ 74859f30` and main's two close-out notes (2026-09-26
  #715, 2026-09-24 #713). The `npm test` row was a placeholder through this commit, rewritten
  in step 3.
- `test/run.mjs`: no conflict, TESTS auto-merged both this plan's `repo/svg-rules.mjs` /
  `repo/em-dash.mjs` and main's `engine/ramp-identity.mjs`. `TESTS.length` = 53.
- `.sdlc/board.md`: no conflict, main's gate-gaps rows and this plan's rule-gates rows each
  once.

Merge commit `718b685b`, sweep commit `b2287241` (one file, two lines).

## Step 2: three runs at the new N

Under `rule-gates-U5-load.md`: the heavy-run count (`pgrep -fl 'test/(run|engine|ui|repo)|smoke'
| grep -cE '^[0-9]+ (/[^ ]*/)?node '`) was 1 or below immediately before each run; the 1-minute
load average was not gated. All three ran in `.worktrees/rg-U5`, no `node_modules`, clock spans
non-overlapping:

| run | start (UTC) | end (UTC) | load before | load after | hot before | hot after | exit | wall (s) | last line | git status lines |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-09-26 17:24:05 | 2026-09-26 17:26:52 | 48.70 64.61 62.18 | 15.24 45.56 54.95 | 1 | 1 | 0 | 167.45 | `✓ all 53 test files passed` | 0 |
| 2 | 2026-09-26 17:27:01 | 2026-09-26 17:30:07 | 13.35 44.16 54.34 | 56.89 40.53 50.16 | 1 | 1 | 0 | 185.81 | `✓ all 53 test files passed` | 0 |
| 3 | 2026-09-26 17:30:18 | 2026-09-26 17:34:46 | 71.73 44.27 51.38 | 23.86 40.36 48.48 | 1 | 0 | 0 | 268.26 | `✓ all 53 test files passed` | 0 |

All three marked under-load (load before 5 or over on every run). No rejected runs: all three
succeeded on the first attempt, so the Rejected runs table is empty. `figma/plugin/ui.html`
printed the same `4118.0 KB` on all three runs (`git status --short` empty after each).

## Step 3: records

`.sdlc/baseline.md`'s `npm test` row: `3/3`, `167.45 · 185.81 · 268.26`, `✓ all 53 test files
passed` (byte for byte, all three runs identical), a note naming U5b and the under-load ruling;
rule-gates U5's 52-file row moved to its own superseded note (`### Superseded: npm test's
rule-gates U5 under-load set (2026-09-26, 52 files)`). `.sdlc/adapter.md` §1 left unmoved (R53).
Commit `99c452a2`.

`sh .sdlc/checks/baseline-agrees-check.sh; echo "exit $?"`:

```
ok    tests: baseline 53, test/run.mjs TESTS 53
ok    ui.html: baseline 4118.0 KB, tree 4118.0 KB
STALE time test: baseline 167 to 268 s, adapter 80 to 89 s
ok    time build: baseline 1 to 3 s, adapter 1 to 3 s
ok    time smoke: baseline 18 to 18 s, adapter 18 to 18 s
ok    time corpus-contrast: baseline 20 to 23 s, adapter 20 to 23 s
ok    time gate:corpus-tonal: baseline 86 to 116 s, adapter 86 to 116 s
ok    time gate:corpus-anchor: baseline 79 to 100 s, adapter 79 to 100 s
ok    time gate:sweep-prime: baseline 67 to 86 s, adapter 67 to 86 s
ok    time gate:corpus-reset: baseline 57 to 83 s, adapter 57 to 83 s
ok    time fonts: baseline 1 to 1 s, adapter 1 to 1 s
note  head: baseline ref 74859f30, the tree moved outside .sdlc/ and .gitignore since the baseline ran, so the numbers are unproven at this head
ok    head: baseline ref 74859f30 is in origin/main's history
stale total: 1
exit 1
```

Every line `ok` or `note` except the one `STALE time test` line, matching P7 and U5-1's revision
16 cells exactly.

## Criteria

| # | Result |
|---|---|
| U5-1 (P7) | as above: `stale total: 1`, `exit 1`, `ok    tests: baseline 53, test/run.mjs TESTS 53`; the one stale line is `STALE time test` (R53) |
| U5-2 | `grep '^[\|] .npm test. [\|]' .sdlc/baseline.md \| awk -F'[\|]' '{print $3, $5, $6}'` → `` 3/3   167.45 · 185.81 · 268.26   `✓ all 53 test files passed` `re-measured rule-gates U5b at the merged N...` ``; the Runs table above gives every run's load-before, clock span and elapsed, marked under-load (all three); clock spans disjoint |

`node test/repo/em-dash.mjs | tail -1` → `em-dash: clean (791 files scanned)`.
`node test/repo/branding.mjs | tail -1` → `branding: clean (783 files scanned)`.
`sh .sdlc/checks/verdict-frontmatter-check.sh | tail -1` → `verdicts 162 graded 162 bad 0`.
`git ls-files | grep -c node_modules` → `0`.
`git status --short | wc -l` → `0` after every commit in this pass.

## What disagreed with the plan

Nothing. The merge's two conflicts were exactly the two files the brief named
(`.sdlc/baseline.md`, `test/engine/anchor.mjs`); `test/run.mjs` and `.sdlc/board.md` auto-merged
clean, as the brief expected. The heavy-run count read 1 (not 0) before each of the three runs;
the load ruling gates the 1-minute average, not the heavy-run count, and the brief's own step 2
text does not require 0 for U5b (unlike U5's own R47 window), so all three counted.
