# Question · the 120 s `npm test` ceiling does not hold on a quiet host

date: 2026-09-23
from: gs-U6b-builder-l3-p1, unit `unit/gs-U6b` of plan `gate-split` (#713)
about: the Risk row "The 120 s ceiling does not hold on a quiet host" in `.sdlc/plans/gate-split.md`
status: answered

## What was measured

Three counted `npm test` runs, all quiet under the rule (load under 5 at start, 0 hot processes, `pgrep` clean, before and after; exit 0, tree clean after), taken in the coordinated quiet window (owner ruling R34):

| run | load before | seconds |
|---|---|---|
| 1 | 4.39 | 106.45 |
| 2 | 3.57 | 141.39 |
| 3 | 4.98 | 171.23 |

The largest, 171.23 s, exceeds the 120 s ceiling written into `.sdlc/adapter.md` by 51.23 s (43%). Per the plan's Risk row, this stops U6b from restating the ceiling or shrinking the sample on its own; this document is that stop.

## Per-file breakdown

A diagnostic run of every `test/run.mjs` file individually, taken later on a loud host (load 8.79 at start; not a figure of record, not graded under the quiet-host rule, offered only to show where the time goes):

| file | seconds |
|---|---|
| `engine/prime.mjs` | 69.31 |
| `ui/headless-boot.mjs` | 64.78 |
| `engine/tonal.mjs` | 34.14 |
| `engine/anchor.mjs` | 32.05 |
| `engine/curated-contrast.mjs` | 11.54 |
| every other file | under 9 s each |
| sum of all 50 files | 263.53 |

Four files carry the cost, same as before the split: `prime.mjs` and `headless-boot.mjs` (the SAMPLED canary now includes headless-boot's own `(rst-corpus)` reset sweep, Q1) now outweigh `tonal.mjs` and `anchor.mjs`, which is the opposite order from the pre-split per-file reading in `.sdlc/baseline.md` (`tonal.mjs` 100.2 s, `anchor.mjs` 80.0 s, `headless-boot.mjs` 61.0 s, `prime.mjs` 54.9 s, all FULL). The SAMPLED thinning helped tonal and anchor more than it helped prime and headless-boot.

## Why the 120 s arithmetic undershot

The ceiling's own derivation (`.sdlc/adapter.md`, "Arithmetic") assumed the four sampled legs would cost "about a tenth of the moved cost", landing near 100 s with 20 s of room. The three quiet runs instead spread from 106 to 171 s, a 65 s range on host contention this unit could not fully clear even inside the coordinated window (runs 2 and 3 both started under load 5 but the host was not otherwise idle throughout the run, per the U6b handoff's Runs table). The sample was not shrunk to test whether a smaller draw would fit; the runs above are the sample the plan specifies (Q1 yes, one seeded canary per gallery category, no `--full`).

## What this does not decide

This document does not raise the ceiling, shrink the sample, or declare U6b done. `.sdlc/baseline.md` and `.sdlc/adapter.md` record the three readings honestly (106.45 / 141.39 / 171.23) rather than a number chosen to fit. `P2`'s check (`.sdlc/plans/gate-split.md`) is expected to print `OVER 171.23` against these figures, which is the point: the ceiling and the readings are two different things, and the readings say the arithmetic needs revisiting, not that the runs were wrong.

## Open

Owner or Verifier ruling needed on one of: (a) restate the ceiling from these three readings plus a margin, (b) narrow the sample further (a smaller prime/headless-boot draw), or (c) accept `OVER` at pre-land as a known, recorded gap pending a later unit. U6b takes no position and does none of these unilaterally.

## Answer

| Field | Value |
|---|---|
| Asked by | the Conductor (`sdlc:conductor (2)`), through AskUserQuestion, relaying this document with the Orchestrator's recommendation of (b) |
| Options | (a) restate the ceiling from the three readings plus a margin; (b) narrow the SAMPLED draw in `prime.mjs` and headless-boot's reset sweep; (c) accept `OVER` at pre-land as a recorded gap |
| Chosen, verbatim | "Shrink the sample, U6c" (owner ruling R35) |
| Date | 2026-09-24 |
| Consequence | a new unit U6c in plan revision 13: narrow the SAMPLED draw in `test/engine/prime.mjs` and in `test/ui/headless-boot.mjs`'s reset sweep, each new size stated with the coverage it gives up, and a control that a regression in a sampled preset still reds. Then the U6c re-time and U6b's six rejected rows are taken together in one coordinated quiet window |

Recorded by the Orchestrator from the Conductor's message of 2026-09-24.
