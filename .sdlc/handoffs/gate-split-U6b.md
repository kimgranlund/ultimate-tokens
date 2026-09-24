---
kind: handoff
plan: gate-split
unit: U6b
branch: unit/gs-U6b
written: 2026-09-24
pass: 2
---

# Handoff U6b gate-split - builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/gs-U6b, cut from plan/gate-split, main (04f95ff0) merged in at 8ff163bd |
| Worktree | .worktrees/gs-U6b |
| Files | .sdlc/adapter.md, .sdlc/baseline.md, .sdlc/board.md, .sdlc/debt.md, .sdlc/plans/gate-split.md, .sdlc/checks/baseline-agrees-check.sh, .sdlc/questions/gate-split-U6b.md, .claude/skills/shipping-changes/SKILL.md, .claude/CLAUDE.md, test/engine/anchor.mjs, src/ui/sections/color.js, docs/reference/references/component-inventory.md, docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers.md, figma/plugin/ui.html |
| Commits (pass 1) | 8ff163bd (merge origin/main), ee53815a (two doc-citation fixes), 1d653510 (regenerate ui.html), e89052a9 (non-timing records batch), 443fa365 (adapter §5 step, U6-9), 71cdb960 (key-anchor byCategory fix), 74ccbaf5 (figures of record, ceiling question), 288ce31c (handoff), 474824ff (control for 71cdb960) |
| Commits (pass 2, FIX-FIRST rework) | f0ba0f0b (H1, remove the duplicated color.js block), f77f0d04 (revert ee53815a's citation shifts), 32b34a50 (regenerate ui.html), 219dda39 (correct baseline.md's KB figure), 1924dbae (M1, remove three restored rediagnosis plans), 75d66ada (M2, revert the unconsented CLAUDE.md line), 436f3b36 (M3, quiet-host prose fix), f08db284 (L1/L2), f786d183 (L4), 012fe5b5 (L3) |
| Ran | 3 quiet-host `npm test` and 3 quiet-host `gate:corpus-tonal`, all counted, all exit 0, tree clean after; corpus-anchor/sweep-prime/corpus-reset each have 1 of 3 counted (8 rejected attempts, see below). `npm test` once more after the pass 2 fixes: green, 50/50, tree clean |
| Left out | corpus-anchor, sweep-prime, corpus-reset each need 2 more counted quiet-host runs. Per the ceiling question's Answer (R35), these ride U6c's own re-time window together, not a standalone second window |

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

The quiet-host rule (`.sdlc/adapter.md` §1): `sysctl -n hw.ncpu; uptime | sed 's/.*averages: //'` for load, `ps -Ao pcpu=,comm= | awk '$1 >= 50 {n++} END {print n+0}'` for hot processes, `pgrep -fl '[t]est/run.mjs|[v]ite build|[s]moke.mjs|[-]-full'` for related processes, read before and after each run; a set of record starts every run at load under 5. Taken in the Orchestrator's coordinated quiet window (owner ruling R34). `git status --short | wc -l` is the last column.

| # | command | load before | hot before | pgrep before | load after | hot after | exit | wall (s) | last line | git status lines |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `npm test` | 4.39 | 0 | none | 3.67 | 0 | 0 | 106.45 | `✓ all 50 test files passed` | 0 |
| 2 | `npm test` | 3.57 | 0 | none | 9.34 | 0 | 0 | 141.39 | `✓ all 50 test files passed` | 0 |
| 3 | `npm test` | 4.98 | 0 | none | 7.82 | 0 | 0 | 171.23 | `✓ all 50 test files passed` | 0 |
| 4 | `npm run gate:corpus-tonal` | 3.40 | 0 | none | 4.99 | 0 | 0 | 86.09 | `PASS: tonal-generation clears all [gate] predicates` | 0 |
| 5 | `npm run gate:corpus-tonal` | 4.69 | 0 | none | 6.98 | 0 | 0 | 116.31 | `PASS: tonal-generation clears all [gate] predicates` | 0 |
| 6 | `npm run gate:corpus-tonal` | 4.74 | 0 | none | 4.14 | 0 | 0 | 92.56 | `PASS: tonal-generation clears all [gate] predicates` | 0 |
| 7 | `npm run gate:corpus-anchor` | 4.15 | 0 | none | 3.78 | 0 | 0 | 78.98 | `PASS (FULL): C2, C3, C4 (non-anchored construction totally migrated, Q1), C6/F4 clear; C5 (monotone) is a true 0, no list; window-clamp (10), gap-19 (72), distinct-25 (16) and notch (15, Q3-resolved) are named allow-lists, compared by name, each with a biting negative control` | 0 |
| 8 | `npm run gate:sweep-prime` | 4.05 | 0 | none | 5.52 | 0 | 0 | 86.25 | `PASS: prime-system clears all AC-050 gates` | 0 |
| 9 | `npm run gate:corpus-reset` | 4.78 | 0 | none | 5.21 | 0 | 0 | 83.40 | `HEADLESS BOOT PASS — all Phase-3 interaction assertions hold` | 0 |

Nine rows above are the counted set that passes U6-3's own reading (`$5!="0"` etc.) in full, including `hot after == 0`. Three more attempts at each of `gate:corpus-anchor`, `gate:sweep-prime` and `gate:corpus-reset` were also taken in the same window with `load before` and `hot before` clean, but each read a nonzero `hot after` (a transient contending process that started during the run, not before it), which U6-3's own grading command rejects on the `$8!="0"` term. Those six runs are recorded in Rejected runs below rather than counted, so this handoff's Runs table currently totals 9, not 15: corpus-anchor, sweep-prime and corpus-reset each have 1 of their required 3. A second coordinated quiet window is owed to retake the other 2 per script; reported to the Orchestrator.

## Rejected runs

Same columns as the Runs table above. R1-R8 never started (the rule failed before the run), so their after-readings, exit, wall, last line and status are `not recorded`, not `0`. R9-R14 did run (clean before, loud after); their columns are the same program output the earlier draft filed as counted rows.

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

R9-R14 are the six clean-before/loud-after runs that produced the earlier draft's rows 7/8/11/12/14/15; they were mis-filed as counted in an earlier pass of this handoff and are corrected here to Rejected, since U6-3's own formula reads `hot after` too. Their program output is unchanged from what was captured (`PASS (FULL): ...` for R9/R10, `PASS: prime-system clears all AC-050 gates` for R11/R12, `HEADLESS BOOT PASS — all Phase-3 interaction assertions hold` for R13/R14, each exit 0, each 0 git status lines); only their standing as counted rows moves.

## The 120 s ceiling

`npm test`'s max quiet-host reading (171.23 s) exceeds the 120 s ceiling in `.sdlc/adapter.md`. Per the plan's risk row this does not raise the ceiling or shrink the sample; `.sdlc/questions/gate-split-U6b.md` records the three readings, a per-file diagnostic breakdown (taken later, not under the quiet-host rule, offered only to show where the time goes), and asks for a ruling.

## Criteria

U6-1 through U6-12 checked by hand against the plan's exact commands at this head: U6-6, U6-9, U6-10, U6-11, U6-12's needles all print the expected counts. U6-3's rejected-run count is "anything" per the plan, which 14 satisfies; the counted total is 9 of 15, so corpus-anchor, sweep-prime and corpus-reset are not yet complete rows in `.sdlc/baseline.md`/`.sdlc/adapter.md`, stated plainly there rather than papered over. U6-5's `baseline-agrees-check.sh` needle: `npm test`, `build`, `smoke`, `corpus-contrast`, `gate:corpus-tonal` and `fonts` read `ok`; `gate:corpus-anchor`, `gate:sweep-prime`, `gate:corpus-reset` read `STALE` (baseline has 1 reading, not 3) until the second window.

U6-6's `INTERIM` needle (M5): `grep -cF "Interim ceiling now, split sweeps into gate scripts" .sdlc/adapter.md` prints `0` at this head and `1` on `origin/main` (`git show 04f95ff0:.sdlc/adapter.md | grep -c ...` prints `1`), confirming the retired note's own wording is gone from the live paragraph rather than merely superseded in substance.

## What disagreed with the plan

Nothing in wording; the schedule did. The coordinated quiet window closed before all four gate scripts could each collect 3 valid runs, because 6 of the 15 raw attempts ran clean-before but picked up a transient hot process mid-run, which the plan's own grading formula (U6-3) correctly rejects on `hot after`. This was not caught until after an earlier draft of this handoff had already reported "15/15 counted" to the Orchestrator; that report is superseded by this one.
