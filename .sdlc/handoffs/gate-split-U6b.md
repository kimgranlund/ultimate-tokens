---
kind: handoff
plan: gate-split
unit: U6b
branch: unit/gs-U6b
written: 2026-09-23
pass: 1
---

# Handoff U6b gate-split - builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/gs-U6b, cut from plan/gate-split, main (04f95ff0) merged in at 8ff163bd |
| Worktree | .worktrees/gs-U6b |
| Files | .sdlc/adapter.md, .sdlc/baseline.md, .sdlc/board.md, .sdlc/debt.md, .sdlc/plans/gate-split.md, .sdlc/checks/baseline-agrees-check.sh, .sdlc/questions/gate-split-U6b.md, .claude/skills/shipping-changes/SKILL.md, .claude/CLAUDE.md, test/engine/anchor.mjs, docs/reference/references/component-inventory.md, docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers.md, figma/plugin/ui.html |
| Commits | 8ff163bd (merge origin/main), ee53815a (two doc-citation fixes), 1d653510 (regenerate ui.html), e89052a9 (non-timing records batch), 443fa365 (adapter §5 step, U6-9), 71cdb960 (key-anchor byCategory fix), 74ccbaf5 (figures of record, ceiling question) |
| Ran | 3 quiet-host `npm test` and 3 quiet-host `gate:corpus-tonal`, all counted, all exit 0, tree clean after; corpus-anchor/sweep-prime/corpus-reset each have 1 of 3 counted (8 rejected attempts, see below) |
| Left out | corpus-anchor, sweep-prime, corpus-reset each need 2 more counted quiet-host runs; a second coordinated quiet window is owed (reported to the Orchestrator) |

## Step 0 (merge)

`origin/main` (04f95ff0, #681/preset-intent-fidelity + records-followup + later work) merged into `unit/gs-U6b` at `8ff163bd`. `.sdlc/board.md` conflicts resolved by keeping main's updated rows and adding all seven gate-split rows main lacked. `npm test` after the merge: 2 of 50 files failed (`repo/citations.mjs`, two stale line-number citations from the merge's `color.js` reflow), fixed in `ee53815a`; `npm test` green after, `✓ all 50 test files passed`.

## Doc citations fixed after the merge (named, as requested)

- `docs/reference/references/component-inventory.md`: `switchControl` 2208 -> 2256; the hue-space `segmented()` 2177 -> 2225; its on-colors sibling 2196 -> 2244 (both list and switch-card references); the Tension-to-Bias slider range 2039-2061 -> 2179-2202; the Distribution/Curve `field()` calls 2076/2120 -> 2124/2169 (two citing lines).
- `docs/reference/reviews/2026-08-20-reactivity/02-sections-and-resolvers.md`: `renderGlobalInspector` 2068 -> 2116; `renderRolesInspector` 2242 -> 2290.

`node scripts/audit-citations.mjs` reports zero STALE lines after.

## Real defect found and fixed (test/engine/anchor.mjs)

The merge combined main's newer `key-anchor` test block with this unit's FULL/SAMPLED split. The block's named-preset lookup used `presetsByCat` (SAMPLED-limited to one canary preset per category), so a SAMPLED `npm test` run could read a false "the named subject moved" failure whenever the canary draw skipped one of the three named presets (surfaced on the "Hidaka coast" travel preset). Fixed to read `byCategory` (always full) for named/targeted lookups, since a corpus sweep and a single-document lookup are different operations and only the former should be sample-limited. Verified in both SAMPLED and FULL modes.

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

| id | command | load before | hot before | pgrep before | reason |
|---|---|---|---|---|---|
| R1 | `npm test` | `6.85` | `1` | `9643 sh -c npm run gen:figma-assets ...;10197 node test/run.mjs;` | pgrep matched another seat's `npm test` in flight |
| R2 | `npm run gate:corpus-anchor` | `6.33` | `2` | `none` | load at or over the ncpu-scale hot-process reading before start |
| R3 | `npm run gate:corpus-anchor` | `4.53` | `2` | `none` | hot before nonzero |
| R4 | `npm run gate:corpus-anchor` | `6.77` | `0` | `none` | load before at or above 5 |
| R5 | `npm run gate:corpus-anchor` | `5.11` | `0` | `none` | load before at or above 5 |
| R6 | `npm run gate:corpus-anchor` | `4.72` | `1` | `none` | hot before nonzero |
| R7 | `npm run gate:corpus-anchor` | `6.74` | `0` | `none` | load before at or above 5 |
| R8 | `npm run gate:corpus-reset` | `4.50` | `1` | `none` | hot before nonzero |
| R9 | `npm run gate:corpus-anchor` | `4.84` | `0` | `none` | ran clean before, `hot after` read `2` |
| R10 | `npm run gate:corpus-anchor` | `4.75` | `0` | `none` | ran clean before, `hot after` read `1` |
| R11 | `npm run gate:sweep-prime` | `4.64` | `0` | `none` | ran clean before, `hot after` read `2` |
| R12 | `npm run gate:sweep-prime` | `3.91` | `0` | `none` | ran clean before, `hot after` read `2` |
| R13 | `npm run gate:corpus-reset` | `4.80` | `0` | `none` | ran clean before, `hot after` read `1` |
| R14 | `npm run gate:corpus-reset` | `4.01` | `0` | `none` | ran clean before, `hot after` read `1` |

R9-R14 are the six clean-before/loud-after runs that produced the earlier draft's rows 7/8/11/12/14/15; they were mis-filed as counted in an earlier pass of this handoff and are corrected here to Rejected, since U6-3's own formula reads `hot after` too. Their program output is unchanged from what was captured (`PASS (FULL): ...` for R9/R10, `PASS: prime-system clears all AC-050 gates` for R11/R12, `HEADLESS BOOT PASS — all Phase-3 interaction assertions hold` for R13/R14, each exit 0, each 0 git status lines); only their standing as counted rows moves.

## The 120 s ceiling

`npm test`'s max quiet-host reading (171.23 s) exceeds the 120 s ceiling in `.sdlc/adapter.md`. Per the plan's risk row this does not raise the ceiling or shrink the sample; `.sdlc/questions/gate-split-U6b.md` records the three readings, a per-file diagnostic breakdown (taken later, not under the quiet-host rule, offered only to show where the time goes), and asks for a ruling.

## Criteria

U6-1 through U6-12 checked by hand against the plan's exact commands at this head: U6-6, U6-9, U6-10, U6-11, U6-12's needles all print the expected counts. U6-3 does not fully pass yet: the Runs table above is 9 rows, not 15, and 14 Rejected rows exist rather than "anything" being the accepted range only in spirit; the plan accepts a rejected count of "anything", but the 9/15 counted total means corpus-anchor, sweep-prime and corpus-reset are not yet complete rows in `.sdlc/baseline.md`/`.sdlc/adapter.md`, which is stated plainly there rather than papered over. U6-5's `baseline-agrees-check.sh` needle: `npm test`, `build`, `smoke`, `corpus-contrast`, `gate:corpus-tonal` and `fonts` read `ok`; `gate:corpus-anchor`, `gate:sweep-prime`, `gate:corpus-reset` read `STALE` (baseline has 1 reading, not 3) until the second window.

## What disagreed with the plan

Nothing in wording; the schedule did. The coordinated quiet window closed before all four gate scripts could each collect 3 valid runs, because 6 of the 15 raw attempts ran clean-before but picked up a transient hot process mid-run, which the plan's own grading formula (U6-3) correctly rejects on `hot after`. This was not caught until after an earlier draft of this handoff had already reported "15/15 counted" to the Orchestrator; that report is superseded by this one.
