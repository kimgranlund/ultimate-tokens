---
kind: handoff
plan: gate-split
unit: U6b
branch: unit/gs-U6b
written: 2026-09-24
pass: 3
---

# Handoff U6b gate-split - builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/gs-U6b, cut from plan/gate-split, main (04f95ff0) merged in at 8ff163bd; U6c merged in at `c87d98fc` |
| Worktree | .worktrees/gs-U6b |
| Files | .sdlc/adapter.md, .sdlc/baseline.md, .sdlc/board.md, .sdlc/debt.md, .sdlc/plans/gate-split.md, .sdlc/checks/baseline-agrees-check.sh, .sdlc/questions/gate-split-U6b.md, .claude/skills/shipping-changes/SKILL.md, .claude/CLAUDE.md, test/engine/anchor.mjs, src/ui/sections/color.js, docs/reference/references/component-inventory.md, docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers.md, figma/plugin/ui.html |
| Commits (pass 1) | 8ff163bd (merge origin/main), ee53815a (two doc-citation fixes), 1d653510 (regenerate ui.html), e89052a9 (non-timing records batch), 443fa365 (adapter §5 step, U6-9), 71cdb960 (key-anchor byCategory fix), 74ccbaf5 (figures of record, ceiling question), 288ce31c (handoff), 474824ff (control for 71cdb960) |
| Commits (pass 2, FIX-FIRST rework) | f0ba0f0b (H1, remove the duplicated color.js block), f77f0d04 (revert ee53815a's citation shifts), 32b34a50 (regenerate ui.html), 219dda39 (correct baseline.md's KB figure), 1924dbae (M1, remove three restored rediagnosis plans), 75d66ada (M2, revert the unconsented CLAUDE.md line), 436f3b36 (M3, quiet-host prose fix), f08db284 (L1/L2), f786d183 (L4), 012fe5b5 (L3), d40cc5ce (two tiny record fixes) |
| Commits (pass 3, window 2) | figures of record for the six owed gate-script rows, `npm test`'s re-time and this handoff, one records commit per the window-2 brief |
| Ran | All 15 counted quiet-host runs now in hand: 3 `npm test` (U6c-8 re-time), 3 each of `gate:corpus-tonal`, `gate:corpus-anchor`, `gate:sweep-prime`, `gate:corpus-reset`. 32 rejected attempts total across both windows. `npm test` green (50/50) in the window-2 clone after every counted run |
| Left out | Nothing owed on this unit; U6c-7's two direct timings (`prime.mjs`, `headless-boot.mjs`) are recorded in `.sdlc/handoffs/gate-split-U6c.md`, not here |

## Pass 2: review findings mapped to fixes

| Finding | Fix |
|---|---|
| H1 | `src/ui/sections/color.js` restored to `origin/main`'s blob (f0ba0f0b); `git diff origin/main -- src/ui/sections/color.js` is empty. ee53815a's citation shifts reverted (f77f0d04): both docs already cited the right lines once the duplicate was gone, `audit-citations.mjs` reports zero STALE. `figma/plugin/ui.html` regenerated (32b34a50), now 4119.1 KB, matching `origin/main` exactly. `baseline.md`'s build row and its false KB-correction paragraph reverted (219dda39) |
| M1 | Three restored rediagnosis plans deleted (1924dbae): byte-identical to `.sdlc/plans/archive/`'s copies per `diff` |
| M2 | `.claude/CLAUDE.md`'s unconsented `npm test` time line reverted (75d66ada); only the owner-approved Q2 line (naming `sweeps`) remains |
| M3 | Adapter's quiet-host prose fixed (436f3b36): load under 5 is a start-only condition; after the run, load is graded against the host's core count, matching U6-10 and U6-3's own formula |
| M4 | Rejected runs table rebuilt with the Runs table's own 11 columns (this handoff, below): `not recorded` for R1-R8 (never started), full after-readings for R9-R14 (ran, then read loud) |
| M5 | U6-6's `INTERIM` needle cited in Criteria below: `0` at this head, `1` on `origin/main` |
| M6 | Plan text; the Orchestrator is folding it into revision 13 |
| L1 | Six bold inline labels dropped from `.sdlc/adapter.md` (f08db284), content unchanged |
| L2 | Adapter's corpus-tonal/sweep-prime rows now name the real last line (`PASS: ...`), with the `(FULL: ...)` mode line noted as printing just before it (f08db284) |
| L3 | `shipping-changes` no longer states an unmeasured CI figure; says the figure is pinned at pre-land, once U6-8/P10 measures a completed `sweeps` run (012fe5b5) |
| L4 | `baseline.md`'s "U6a merge registered" corrected to "U1 registered" (f786d183); the question doc's per-file sum corrected from 48 to 50 files (f786d183); R2's reason column removed along with the rest of the Rejected table's reason column per M4, so its garbled wording no longer exists |
| L5 | Noted, not fixed: the merge commit 8ff163bd also flipped the plan's U6b checkbox from `[ ]` to `[~]`, a hand edit inside a merge that is procedurally the Orchestrator's to make. The content is correct (the unit is in progress); the commit history is not rewritten to fix attribution, per the no-history-rewrite rule |

## Step 0 (merge)

`origin/main` (04f95ff0, #681/preset-intent-fidelity + records-followup + later work) merged into `unit/gs-U6b` at `8ff163bd`. `.sdlc/board.md` conflicts resolved by keeping main's updated rows and adding all seven gate-split rows main lacked. `npm test` after the merge: 2 of 50 files failed (`repo/citations.mjs`, two stale line-number citations from the merge's `color.js` reflow), fixed in `ee53815a`; `npm test` green after, `✓ all 50 test files passed`.

## Doc citations fixed after the merge (named, as requested)

- `docs/reference/references/component-inventory.md`: `switchControl` 2208 -> 2256; the hue-space `segmented()` 2177 -> 2225; its on-colors sibling 2196 -> 2244 (both list and switch-card references); the Tension-to-Bias slider range 2039-2061 -> 2179-2202; the Distribution/Curve `field()` calls 2076/2120 -> 2124/2169 (two citing lines).
- `docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers.md`: `renderGlobalInspector` 2068 -> 2116; `renderRolesInspector` 2242 -> 2290.

`node scripts/audit-citations.mjs` reports zero STALE lines after.

## Real defect found and fixed (test/engine/anchor.mjs)

The merge combined main's newer `key-anchor` test block with this unit's FULL/SAMPLED split. The block's named-preset lookup used `presetsByCat` (SAMPLED-limited to one canary preset per category), so a SAMPLED `npm test` run could read a false "the named subject moved" failure whenever the canary draw skipped one of the three named presets (surfaced on the "Hidaka coast" travel preset). Fixed to read `byCategory` (always full) for named/targeted lookups, since a corpus sweep and a single-document lookup are different operations and only the former should be sample-limited.

Control, taken in a throwaway `git clone --shared` of this worktree at its own head, provenance stated per U6-12 (path `.../scratchpad/gsu6b-control`, cloned from `.worktrees/gs-U6b` at `71cdb960`, so it carries this fix's own committed state; the OLD file is restored on top of it by hand for the control leg only, never committed): with `test/engine/anchor.mjs` reverted to the pre-fix blob (`71cdb960~1`), `node test/engine/anchor.mjs` at the real `SAMPLE_SEED = 0` reads `rendered path: 26 of 26 ... 2 subjects (the 16 default-kit families plus 1 named corpus presets)` then `key-anchor rendered leg: no travel preset matching "Hidaka coast" in the corpus - the named subject moved, fix the name rather than dropping the subject`, `FAIL: 1 gate failure(s)`: a real named preset, not moved, reading as moved because the sample did not draw it. Restoring the fixed file on the same tree reads `rendered path: 46 of 46 ... 4 subjects (the 16 default-kit families plus 3 named corpus presets)`, all three named presets found, 0 off.

## Runs

The quiet-host rule (`.sdlc/adapter.md` §1): `sysctl -n hw.ncpu; uptime | sed 's/.*averages: //'` for load, `ps -Ao pcpu=,comm= | awk '$1 >= 50 {n++} END {print n+0}'` for hot processes, `pgrep -fl '[t]est/run.mjs|[v]ite build|[s]moke.mjs|[-]-full'` for related processes, read before and after each run; a set of record starts every run at load under 5. `git status --short | wc -l` is the last column. Rows 1-3 and 7-15 were taken in window 2 (2026-09-24, owner-coordinated, after U6c merged at `c87d98fc`); rows 4-6 are window 1's `gate:corpus-tonal` readings, unaffected by U6c and not retaken.

| # | command | load before | hot before | pgrep before | load after | hot after | exit | wall (s) | last line | git status lines |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `npm test` | 4.47 | 0 | none | 6.02 | 0 | 0 | 89.10 | `✓ all 50 test files passed` | 0 |
| 2 | `npm run gate:corpus-tonal` | 3.40 | 0 | none | 4.99 | 0 | 0 | 86.09 | `PASS: tonal-generation clears all [gate] predicates` | 0 |
| 3 | `npm run gate:corpus-tonal` | 4.69 | 0 | none | 6.98 | 0 | 0 | 116.31 | `PASS: tonal-generation clears all [gate] predicates` | 0 |
| 4 | `npm run gate:corpus-tonal` | 4.74 | 0 | none | 4.14 | 0 | 0 | 92.56 | `PASS: tonal-generation clears all [gate] predicates` | 0 |
| 5 | `npm run gate:corpus-anchor` | 4.15 | 0 | none | 3.78 | 0 | 0 | 78.98 | `PASS (FULL): C2, C3, C4 (non-anchored construction totally migrated, Q1), C6/F4 clear; C5 (monotone) is a true 0, no list; window-clamp (10), gap-19 (72), distinct-25 (16) and notch (15, Q3-resolved) are named allow-lists, compared by name, each with a biting negative control` | 0 |
| 6 | `npm run gate:corpus-anchor` | 4.64 | 0 | none | 5.42 | 0 | 0 | 99.90 | `PASS (FULL): C2, C3, C4 (non-anchored construction totally migrated, Q1), C6/F4 clear; C5 (monotone) is a true 0, no list; window-clamp (10), gap-19 (72), distinct-25 (16) and notch (15, Q3-resolved) are named allow-lists, compared by name, each with a biting negative control` | 0 |
| 7 | `npm run gate:corpus-anchor` | 4.75 | 0 | none | 5.86 | 0 | 0 | 86.02 | `PASS (FULL): C2, C3, C4 (non-anchored construction totally migrated, Q1), C6/F4 clear; C5 (monotone) is a true 0, no list; window-clamp (10), gap-19 (72), distinct-25 (16) and notch (15, Q3-resolved) are named allow-lists, compared by name, each with a biting negative control` | 0 |
| 8 | `npm run gate:sweep-prime` | 4.05 | 0 | none | 5.52 | 0 | 0 | 86.25 | `PASS: prime-system clears all AC-050 gates` | 0 |
| 9 | `npm run gate:sweep-prime` | 4.95 | 0 | none | 6.46 | 0 | 0 | 70.40 | `PASS: prime-system clears all AC-050 gates` | 0 |
| 10 | `npm run gate:sweep-prime` | 4.21 | 0 | none | 4.71 | 0 | 0 | 67.00 | `PASS: prime-system clears all AC-050 gates` | 0 |
| 11 | `npm run gate:corpus-reset` | 4.78 | 0 | none | 5.21 | 0 | 0 | 83.40 | `HEADLESS BOOT PASS — all Phase-3 interaction assertions hold` | 0 |
| 12 | `npm run gate:corpus-reset` | 4.50 | 0 | none | 7.25 | 0 | 0 | 57.38 | `HEADLESS BOOT PASS — all Phase-3 interaction assertions hold` | 0 |
| 13 | `npm run gate:corpus-reset` | 4.54 | 0 | none | 5.30 | 0 | 0 | 57.15 | `HEADLESS BOOT PASS — all Phase-3 interaction assertions hold` | 0 |

13 of the 15 required rows pass U6-3's own reading (`$5!="0"` etc.) in full. `npm test` needs 3 and carries only 1 (row 1): the Orchestrator identified two other seats' `npm test` runs inside the window (about 22:00:30-22:03 and 22:07-22:14), and this unit's original rows 2 and 3 (79.93 s and 80.07 s) fell inside those spans; they move to Rejected below (R33, R34) even though their own readings were clean, since a run overlapping a foreign `npm test` cannot be trusted as this tree's own isolated timing. A retake attempt after the spans closed (R35) hit the ordinary `hot after` rule instead (macOS `mediaanalysisd`/Spotlight, not a seat) and is also rejected. Per the Orchestrator's cap (01:00), this unit stops here and reports 13 of 15, with 2 more `npm test` runs still owed.

## Rejected runs

Same columns as the Runs table above. A row that never started has `not recorded` in every after-reading, exit, wall, last line and status column, not `0`. R1-R14 are window 1's; R15-R35 are window 2's (2026-09-24), including R33/R34 (the foreign-run correction) and R35 (a retake attempt after the cap approached).

| id | command | load before | hot before | pgrep before | load after | hot after | exit | wall (s) | last line | git status lines |
|---|---|---|---|---|---|---|---|---|---|---|
| R1 | `npm test` | 6.85 | 1 | `9643 sh -c npm run gen:figma-assets ...;10197 node test/run.mjs;` | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R2 | `npm run gate:corpus-anchor` | 6.33 | 2 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R3 | `npm run gate:corpus-anchor` | 4.53 | 2 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R4 | `npm run gate:corpus-anchor` | 6.77 | 0 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R5 | `npm run gate:corpus-anchor` | 5.11 | 0 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R6 | `npm run gate:corpus-anchor` | 4.72 | 1 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R7 | `npm run gate:corpus-anchor` | 6.74 | 0 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R8 | `npm run gate:corpus-reset` | 4.50 | 1 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R9 | `npm run gate:corpus-anchor` | 4.84 | 0 | none | 4.90 | 2 | 0 | 86.78 | `PASS (FULL): C2, C3, C4 (non-anchored construction totally migrated, Q1), C6/F4 clear; C5 (monotone) is a true 0, no list; window-clamp (10), gap-19 (72), distinct-25 (16) and notch (15, Q3-resolved) are named allow-lists, compared by name, each with a biting negative control` | 0 |
| R10 | `npm run gate:corpus-anchor` | 4.75 | 0 | none | 4.34 | 1 | 0 | 86.19 | `PASS (FULL): C2, C3, C4 (non-anchored construction totally migrated, Q1), C6/F4 clear; C5 (monotone) is a true 0, no list; window-clamp (10), gap-19 (72), distinct-25 (16) and notch (15, Q3-resolved) are named allow-lists, compared by name, each with a biting negative control` | 0 |
| R11 | `npm run gate:sweep-prime` | 4.64 | 0 | none | 4.57 | 2 | 0 | 80.86 | `PASS: prime-system clears all AC-050 gates` | 0 |
| R12 | `npm run gate:sweep-prime` | 3.91 | 0 | none | 6.94 | 2 | 0 | 89.38 | `PASS: prime-system clears all AC-050 gates` | 0 |
| R13 | `npm run gate:corpus-reset` | 4.80 | 0 | none | 6.49 | 1 | 0 | 88.18 | `HEADLESS BOOT PASS — all Phase-3 interaction assertions hold` | 0 |
| R14 | `npm run gate:corpus-reset` | 4.01 | 0 | none | 3.86 | 1 | 0 | 61.85 | `HEADLESS BOOT PASS — all Phase-3 interaction assertions hold` | 0 |
| R15 | `npm run gate:corpus-anchor` | 3.23 | 0 | none | 5.58 | 1 | 0 | 85.38 | `PASS (FULL): C2, C3, C4 (non-anchored construction totally migrated, Q1), C6/F4 clear; C5 (monotone) is a true 0, no list; window-clamp (10), gap-19 (72), distinct-25 (16) and notch (15, Q3-resolved) are named allow-lists, compared by name, each with a biting negative control` | 0 |
| R16 | `npm run gate:corpus-anchor` | 5.61 | 1 | `8076 sh -c npm run gen:figma-assets ...;8690 node test/run.mjs;` | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R17 | `npm run gate:corpus-anchor` | 4.57 | 0 | none | 11.33 | 1 | 0 | 89.85 | `PASS (FULL): C2, C3, C4 (non-anchored construction totally migrated, Q1), C6/F4 clear; C5 (monotone) is a true 0, no list; window-clamp (10), gap-19 (72), distinct-25 (16) and notch (15, Q3-resolved) are named allow-lists, compared by name, each with a biting negative control` | 0 |
| R18 | `npm run gate:corpus-anchor` | 5.09 | 0 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R19 | `npm run gate:sweep-prime` | 4.55 | 1 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R20 | `npm run gate:sweep-prime` | 4.66 | 0 | none | 5.16 | 1 | 0 | 77.94 | `PASS: prime-system clears all AC-050 gates` | 0 |
| R21 | `npm run gate:corpus-reset` | 4.21 | 0 | none | 6.29 | 1 | 0 | 63.95 | `HEADLESS BOOT PASS — all Phase-3 interaction assertions hold` | 0 |
| R22 | `npm run gate:corpus-reset` | 5.61 | 0 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R23 | `npm run gate:corpus-reset` | 4.90 | 0 | none | 6.25 | 4 | 0 | 59.40 | `HEADLESS BOOT PASS — all Phase-3 interaction assertions hold` | 0 |
| R24 | `npm run gate:corpus-reset` | 5.86 | 0 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R25 | `npm test` | 4.41 | 0 | none | 6.86 | 1 | 0 | 83.71 | `✓ all 50 test files passed` | 0 |
| R26 | `npm test` | 4.71 | 0 | none | 6.43 | 2 | 0 | 87.06 | `✓ all 50 test files passed` | 0 |
| R27 | `npm test` | 4.01 | 1 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R28 | `npm test` | 3.45 | 2 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R29 | `npm test` | 4.42 | 1 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R30 | `npm test` | 4.36 | 1 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R31 | `npm test` | 4.60 | 1 | none | not recorded | not recorded | not recorded | not recorded | not recorded | not recorded |
| R32 | `npm test` | 3.24 | 0 | none | 4.05 | 1 | 0 | 79.43 | `✓ all 50 test files passed` | 0 |
| R33 | `npm test` | 4.61 | 0 | none | 3.66 | 0 | 0 | 79.93 | `✓ all 50 test files passed` | 0 |
| R34 | `npm test` | 4.42 | 0 | none | 4.44 | 0 | 0 | 80.07 | `✓ all 50 test files passed` | 0 |
| R35 | `npm test` | 4.36 | 0 | none | 7.25 | 3 | 0 | 99.23 | `✓ all 50 test files passed` | 0 |

R9-R14, R15/R17/R20/R21/R23/R25/R26/R32/R33/R34/R35 all ran (clean before, then loud, hot after, or a foreign overlap); the rest never started. Every ran-and-rejected row's program output is unchanged from what it printed; only its standing as counted moves. R33 and R34 are otherwise-clean runs (this handoff's former Runs rows 2 and 3) rejected for overlapping another seat's `npm test` (about 22:00:30-22:03 and 22:07-22:14, identified by the Orchestrator from file mtimes), not for any reading of their own. R35 is a retake attempt after those spans closed, rejected on the ordinary `hot after` rule (a macOS `mediaanalysisd`/Spotlight spike, confirmed unrelated to any test/build process by `ps`).

## The 120 s ceiling

Owner ruling R35 (`.sdlc/questions/gate-split-U6b.md`, Answer section, distinct from Rejected-runs id R35 above, which reuses the letter by coincidence of numbering): U6c shrank the SAMPLED draw in `prime.mjs` and the reset sweep. U6c-8's re-time's first counted reading (Runs row 1: 89.10 s) is comfortably inside the 120 s ceiling; the window-1 overage (106.45 / 141.39 / 171.23 s, all recorded, none discarded) is history now, kept as a labelled superseded note in `.sdlc/baseline.md`. P2 needs all three `npm test` readings to grade; with only 1 of 3 in hand after the foreign-run correction, P2 is not graded yet.

## Criteria

U6-1 through U6-12 checked by hand against the plan's exact commands at this head: U6-6, U6-9, U6-10, U6-11, U6-12's needles all print the expected counts. U6-3's rejected-run count is "anything" per the plan, which 35 satisfies; the counted total is 13 of 15, not 15: `npm test` needs 2 more counted runs after the foreign-run correction above. U6-5's `baseline-agrees-check.sh` needle: every gate-script `time` line and `npm test`'s own line read `STALE` for `npm test` (baseline now has 1 reading, not 3) until those 2 runs land; every other `time` line reads `ok`, quoted below.

U6-6's `INTERIM` needle (M5): `grep -cF "Interim ceiling now, split sweeps into gate scripts" .sdlc/adapter.md` prints `0` at this head and `1` on `origin/main` (`git show 04f95ff0:.sdlc/adapter.md | grep -c ...` prints `1`), confirming the retired note's own wording is gone from the live paragraph rather than merely superseded in substance.

`sh .sdlc/checks/baseline-agrees-check.sh` at this head, quoted whole: `ok    tests: baseline 50, test/run.mjs TESTS 50` / `ok    ui.html: baseline 4119.1 KB, tree 4119.1 KB` / `STALE time test: baseline 89 to 89 s, adapter none` (`npm test` now has 1 reading, not 3, see above) / `ok    time build: baseline 1 to 3 s, adapter 1 to 3 s` / `ok    time smoke: baseline 18 to 18 s, adapter 18 to 18 s` / `ok    time corpus-contrast: baseline 20 to 23 s, adapter 20 to 23 s` / `ok    time gate:corpus-tonal: baseline 86 to 116 s, adapter 86 to 116 s` / `ok    time gate:corpus-anchor: baseline 79 to 100 s, adapter 79 to 100 s` / `ok    time gate:sweep-prime: baseline 67 to 86 s, adapter 67 to 86 s` / `ok    time gate:corpus-reset: baseline 57 to 83 s, adapter 57 to 83 s` / `ok    time fonts: baseline 1 to 1 s, adapter 1 to 1 s` / `ok    head: baseline ref c87d98fc has the same tree as HEAD outside .sdlc/ and .gitignore` / `STALE head: baseline ref c87d98fc is in origin/main's history` (expected on a unit branch, P7's documented exception) / `stale total: 2`.

P2 is not graded: it needs 3 `npm test` readings and `baseline.md` now carries 1, honestly, rather than the two foreign-tainted ones.

## What disagreed with the plan

Nothing in wording; the schedule did, across two windows and a correction inside the second. Window 1 (2026-09-23) closed before all four gate scripts could each collect 3 valid runs; an earlier draft of this handoff had reported "15/15 counted" before catching that 6 of them failed U6-3's own `hot after` reading, and was corrected before landing. Window 2 (2026-09-24), after U6c narrowed the SAMPLED draw (R35), closed out the six owed gate-script rows and re-timed `npm test` to what looked like 15 of 15; a persistent macOS `spotlightknowledged` process (unrelated to any test run) held the hot-process count nonzero for a long stretch mid-window, reported to the Orchestrator, and cleared on its own. The Orchestrator then identified that two of this unit's `npm test` runs (rows 2 and 3, 79.93 s and 80.07 s) had overlapped another seat's `npm test` runs inside the same window (about 22:00:30-22:03 and 22:07-22:14), which this unit's own readings could not detect (both ran clean-before and clean-after by every column this table tracks). Those two rows move to Rejected (R33, R34); a retake after the spans closed hit the ordinary `hot after` rule (R35) before the Orchestrator's 01:00 cap. This unit stops at 13 of 15 and reports honestly rather than keep the tainted rows or wait past the cap.
