---
kind: baseline
repo: ultimate-tokens
ran: 2026-09-19
ref: origin/main @ 20298cc
host: local macOS, Node 24.18, local Chrome for smoke; load 3.97 3.87 4.58 on 10 cores at run start (the test timings' own set, the uncontaminated rerun)
extended: 2026-09-19, rows corpus-contrast and fonts, host load 3.97 4.39 4.80 to 6.16 4.94 4.97 on 10 cores across the six runs
supersedes: the 2026-09-19 baseline at d814500 (kept below as the prior set) and the 2026-09-16 baseline (git show 180eca0:.sdlc/baseline.md)
---

# Baseline

The `npm test`, `npm run build` and `npm run smoke` rows were each run three times in sequence in the U3 unit worktree of plan records-refresh, whose tree equals `ref` outside `.sdlc/` and `.gitignore` (U1-1 proves it). `npm test` ran with no `node_modules` present; build and smoke after one `npm ci` (exit 0, 17.74 s; resolves typescript 7.0.2 and vite 8.3.0, `npm ls --depth=0`). The two `extended:` rows ran elsewhere: `npm run gate:corpus-contrast` and `npm run gen:type-fonts` are the six runs of `.worktrees/rf-U3`, the U3 unit worktree of plan records-followup on branch `unit/rf-U3`, taken on that unit's short path, where the two gates alternate rather than each running three times in sequence (`.sdlc/handoffs/records-followup-U3.md` §Runs, runs 1, 3, 5 and 2, 4, 6).

## Pass

| command | runs | exit | seconds | summary |
|---|---|---|---|---|
| `npm test` | 3/3 | 0 | 56.27 · 56.43 · 59.83 | `✓ all 49 test files passed` `re-measured 2026-09-20, see the #681 correction below` |
| `npm run build` | 3/3 | 0 | 3.06 · 1.34 · 1.36 | `wrote figma/plugin/ui.html 4125.1 KB` `re-measured 2026-09-23, see the #681 U7, #681 U10 and #739 U1 corrections below` |
| `npm run smoke` | 3/3 | 0 | 18.20 · 18.28 · 18.25 | `SMOKE PASS — gallery · category · editor · export dialog all render in a real browser` |
| `npm run gate:corpus-contrast` | 3/3 | 0 | 20.12 · 22.89 · 22.29 | `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` |
| `npm run gen:type-fonts` | 3/3 | 0 | 0.77 · 0.78 · 0.70 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` |

The corpus-contrast gate's own counts, as it printed them on run 5 of the set above, one list item per line of output:

- `  (343 curated documents, 3780 palettes (3420 carrying a non-zero lift or skew), 22680 accent/on-color cells; 504 named per cell, 0 carried below 4.5)`
- `  (perceptual   7560 cells, 0 under 4.5, worst 4.502:1 at nature "47° N · April · 10:00 · Hoh Rain Forest, Olympic Peninsula, Washington" neutral/light)`
- `  (peak         7560 cells, 0 under 4.5, worst 4.504:1 at architecture "Bauhaus Dessau · 1926 · Walter Gropius" neutral/light)`
- `  (even         7560 cells, 0 under 4.5, worst 4.505:1 at brands "BZZR · The product's own design system" tertiary/dark)`

`git status --short` empty after every run: every committed asset that `npm test` and `npm run build` regenerate is byte-stable at this head. `src/ui/type-fonts.js` is not in that set. Neither chain runs `gen:type-fonts`, so a clean status after those two says nothing about that file (survey verdict C11 of 2026-09-18, debt G1). The `npm run gen:type-fonts` row is what covers it: that generator ran three times in the extended set, each run followed by an empty `git status --short`, so the committed file is byte-stable against its own generator at this head too.

## Fail

None.

## Flaky

None observed in three runs each.

## Lint

No `lint` script in `package.json`. `tsc` runs inside `npm run build` (strict unused-locals/params) and is the only static check. Undetermined: no ESLint/Prettier config found by the survey.

## Not run here

`scripts/smoke-panda.mjs` and `mcp/describe-eval-runner.mjs` (CI-only jobs); CI run 35455937943 on 20298cc reports four jobs, all `success`: `build-test`, `corpus-contrast`, `deploy`, `panda-smoke`.

## Prior set (d814500, superseded 2026-09-19)

The figures of the 2026-09-19 run at `origin/main @ d814500` (U1 of plan records-refresh; load 3.13 6.16 6.24 on 10 cores at run start; CI run 35446265780 green on d814500). Kept because two of the seven commits of `d814500..20298cc` changed what the live table describes, in two different ways: #706 (PR #707, 20298cca) moved the toolchain (TypeScript 6 to 7, vite 8.0 to 8.3, Node 24 in CI), touching ten files and none of them under `test/`: `package.json`, `package-lock.json`, the four `.github/workflows/` files, `.sdlc/adapter.md`, `.sdlc/baseline.md`, `docs/reference/rubrics/acceptance-criteria.md` and one `shipping-changes` reference file (`git show --name-only --format= 20298cca` lists them); #699 (PR #702, 9a44f685) touched only files under `test/`, adding `repo/gate-report.mjs` to `TESTS` and with it the 47 to 48 step, and no toolchain file. So these figures are history to compare against, not a range to grade against. The rows are headed differently from the live table on purpose: `baseline-agrees-check.sh` reads the first row that starts with the live head.

| command | runs | exit | seconds | summary |
|---|---|---|---|---|
| `npm test` (prior, d814500) | 3/3 | 0 | 63.54 · 65.90 · 59.17 | `all 47 test files passed` `altered: leading check mark dropped` |
| `npm run build` (prior, d814500) | 3/3 | 0 | 2.96 · 1.87 · 2.48 | `wrote figma/plugin/ui.html 3777.8 KB` |
| `npm run smoke` (prior, d814500) | 3/3 | 0 | 19.96 · 20.23 · 20.45 | `SMOKE PASS` `altered: cut before the dash and the clause after it` |

## Interim gate-time ceiling (INTERIM, #713)

Owner ruling, 2026-09-20, verbatim: "Interim ceiling now, split sweeps into gate scripts as a new
ticket (Recommended)". The ceiling below is therefore INTERIM: it holds until #713 splits the corpus
sweeps out of `npm test` into gate scripts, at which point it is re-measured, not renewed.

Why a ceiling was needed at all. The `npm test` seconds in the live table above (56 to 60 s) were
measured before #681, whose corpus sweeps are the cost. Per-file, measured sequentially in the
foreground at `bf62ee30` with the host at load 5.16, 48 files: `engine/tonal.mjs` 100.2 s,
`engine/anchor.mjs` 80.0 s, `ui/headless-boot.mjs` 61.0 s, `engine/prime.mjs` 54.9 s, and every one
of the other 44 files under 10 s. Four files carry essentially the whole suite.

Whole-suite readings, stated as the range they are rather than the flattering end of it:

| reading | host load at start | note |
|---|---|---|
| 284 s | 3.9 to 9.4 band, this round's own runs | the low end of the round's own spread |
| 293.09 s | 9.42 / 6.59 / 5.30 | U4 round 4's own head |
| 318.52 s | not recorded with the figure | the verifier's reading |
| 344 s | 3.9 to 9.4 band | the high end of the round's own spread |
| 430.46 s | 5.18 / 4.98 / 3.98 | U4's own timed run at the main-merge commit, 49 files |
| 518.66 s | 6.56 / 14.82 / 20.43 | U5's own first run, 49 files, this worktree, 2026-09-20 |
| 649 s | 9.42 / 10.69 / 13.38 at start, 33.98 / 19.23 / 15.70 at end | U5's own second run, same worktree, same day, same 49 files: the host's 1-minute load more than tripled during the run |
| 780.23 s | 9.37 / 15.12 / 14.88, peaking near 63 mid-run | the verifier's pass-7 run, reported as contention-dominated |
| 889.89 s | 79.53 / 120.51 / 112.94 at start, 24.79 / 37.01 / 60.62 at end | U5's own round-2 run, same worktree, same day, same 49 files. Taken FAR outside the ruling's conditions and recorded as such: it does not test the ceiling in either direction. The host was carrying five other heavy runs, including another worktree's `test/engine/anchor.mjs --full` and a second project's headless Chrome, and the process held 90% of one CPU over a 14:49.89 wall. Kept rather than dropped because a series that silently excludes its own bad conditions stops being a series |
| 705.01 s | 5.42 / 19.69 / 47.04 at start, 14.67 / 20.63 / 32.21 at end | U5's own round-2 re-run, same worktree and same 49 files, taken in the first window all day with the 1-minute load under 10 at the start and no other suite running. It held **98% of one CPU**, against the **90%** `time` printed for the 889.89 s run above it. The other run above, the verifier's 780.23 s, printed no percentage at all; its own record gives `real 780.23` with `user 665.63 sys 15.74`, which COMPUTES to **87.3%**, marked as computed rather than printed. An earlier draft of this cell said 76% for that run: it was unsourced and no record anywhere carries it. The same draft called this the least contended reading, which is also false against this unit's own records, where §8 logs run 1 at `102% cpu`. It is still above the band. It does not refute the ceiling. Under **R13** (owner, main @ `4e315376`) it is not even eligible to: R13 grades only a run set STARTED at load under 5, and this one started at 5.42. It is recorded, not graded, like every other reading here |
| 647.42 s | 7.70 / 14.75 / 27.35 at start, 11.82 / 12.27 / 18.96 at end | U5's own final run, same worktree and same 49 files. The CLEANEST reading in this series: 1-minute load 7.70 at the start and 11.82 at the end, **99% of one CPU**, and no other suite on the host, confirmed with `pgrep` before starting and by waiting for the reviewer's run to finish first. Still 97 s above the band. This is the reading to re-measure against, ahead of the 705.01 s one |
| 592.17 s | 7.94 / 10.73 / 15.56 at start, 13.79 / 12.06 / 13.48 at end | U5's round-3 run, same worktree and same 49 files, started only after waiting out another seat's suite. **101% of CPU**. Not the only reading to exceed one core: the U7 quiet run at `309.34 s` reads 104%, the highest share in the series. The fastest of the three clean readings and still 42 s above the band |
| 747.27 s | 16.81 / 13.92 / 13.75 at start, 26.00 / 20.09 / 17.79 at end | U5's round-3 fold-in run, same worktree and same 49 files. No competing suite, but the host's own load was already 16.81, so not a clean-conditions reading. **95% of CPU**, and it lands where the CPU-share trend predicts, which is the point of recording it |
| 795.49 s | 17.27 / 20.56 / 18.53 at start, 23.58 / 34.77 / 34.36 at end | U5's final fold-in run. Started at load 17.27, so recorded and not graded under R13, and recorded only because a run this unit made should not be missing from its own series. **93% of CPU** |
| 716.04 s | 16.36 / 13.43 / 21.96 at start, 8.72 / 11.01 / 15.74 at end | A reviewer's run at U5's head. Restored after being dropped for want of a source: its evidence lived only in `/tmp` and no record carried it, which is why the verifier could not trace it. Source committed with this unit at `.sdlc/records/pif-u5-gate-logs/gate-716s-review-27b26330.txt`, since a row citing a scratch path is the same defect one step removed. **Tree**: `27b26330`, the head review 3 names as reviewed, consistent with its `LOAD-START: 15:34` against that commit at 15:26. Its own two lines quoted rather than retyped: `npm test > /tmp/r3test.log 2>&1  671.56s user 14.35s system 95% cpu 11:56.04 total` (`11:56.04` is 716.04 s) and `LOAD-START: 15:34  up 12 days, 21:31, 14 users, load averages: 16.36 13.43 21.96`. The load first reported for it, 8.66, was the run's END figure; it STARTED at 16.36, so R13 records and does not grade it |
| 1119.57 s | 194.52 / 112.51 / 106.18 at start, 287.46 / 307.63 / 265.97 at end | U5's R8 gate over the final tree, started only after the pre-land run and two other seats' suites had finished. Recorded and not graded, obviously: load 194.52. Its own two lines, per the evidence rule: `npm test  821.74s user 25.47s system 75% cpu 18:39.57 total` and `UPTIME BEFORE: 17:36  up 12 days, 23:32, 15 users, load averages: 194.52 112.51 106.18`. The **lowest CPU share and the slowest wall in the series**, at the highest start load. What that supports is narrow and is stated narrowly: contention accounts for the SLOW TAIL. It says nothing about the divergence among the quiet runs, which is the part that matters and is unexplained. One row at load 194.52 does not restore the monotone-in-load argument that a row at load 5.42 broke |
| 1670.43 s | 44.47 / 46.02 / 87.46 at start, 44.89 / 52.33 / 59.27 at end | U5's final gate over the committed tree, taken when `ps` showed no other suite running at all. Recorded and not graded: start load 44.47. Its own two lines: `npm test  734.54s user 92.87s system 49% cpu 27:50.43 total` and `UPTIME BEFORE: 18:40  up 13 days, 37 mins, 11 users, load averages: 44.47 46.02 87.46`. **49% of CPU**, now the lowest share and slowest wall in the series, taking over both from the 1119.57 s row |
| **326 s** | **4.88** / 6.14 / 14.62 at start, 4.90 / 4.96 / 11.29 at end | **GRADED under R13.** Taken on the sync tree `8f037dd2`, which is U5 at `21a0e35d` merged with main, not on this unit branch; the delta from that tree to U5's head is records-only, under `.sdlc/`, and touches no runtime file. Source committed with this unit at `.sdlc/records/pif-u5-gate-logs/r13-326s-sync-tree-8f037dd2.txt`, because a graded reading whose log lives only on a scratch branch is the phantom problem again. Quoted from it rather than retyped: `pre-run uptime: 16:46  up 12 days, 22:43, 16 users, load averages: 4.88 6.14 14.62`, `npm test exit code: 0`, `wall time seconds: 326`. Comfortably INSIDE the band |
| **553.45 s** | **4.63** / 4.88 / 10.76 at start, 17.66 / 14.32 / 12.86 at end | U5's R8 pass. The FIRST reading in this series that started at a load under 5, so the first that R13 grades rather than merely records. 101% of CPU. Evidence, per the evidence rule, both lines from the run's own output: `npm test  553.58s user 9.44s system 101% cpu 9:13.45 total` and `UPTIME BEFORE: 16:53  up 12 days, 22:50, 16 users, load averages: 4.63 4.88 10.76`, both from its committed log at `.sdlc/records/pif-u5-gate-logs/r13-553s-unit-branch.log`. **Tree**, stated exactly rather than rounded to a convenient sha: it ran at 16:53 over this unit's WORKING tree, whose committed base was `21a0e35d` (HEAD from 16:31) and which was committed at 17:04, with this reading's own row added, as `8918342c`. So no single commit has the exact bytes tested; the two it lies between are named, and the delta across them is this row and its prose. Taken unintentionally: the check before starting read 5.17 and the load fell in the seconds before the run began, which is why the rule to read `uptime` INSIDE the run is the one that counts. It cost no one the window, which was the first worry and turned out to be unfounded: the graded `326 s` run above had already finished, `post-run date: Sun Sep 20 16:52:04 PDT 2026`, before this one sampled `16:53` |
| **309.34 s** | **2.64** / 3.79 / 4.29 at start, 4.42 / 4.02 / 4.21 at end | **GRADED under R13.** The U7 verifier's `npm test`, taken over U7's verified head `43033841` in a shared clone of the unit worktree, tree clean before and after (`TREE AFTER: 0`). Source committed at `.sdlc/records/pif-u7-gate-logs/r13-309s-unit-43033841.log`, quoted rather than retyped: `npm test > $S/out/npmtest.txt 2>&1  319.59s user 3.83s system 104% cpu 5:09.34 total` (`5:09.34` is **309.34 s**) and `UPTIME INSIDE t+5s:  7:41  up 13 days, 13:38, 11 users, load averages: 2.64 3.79 4.29`. `EXIT 0`, `✓ all 49 test files passed`. **Tree**: `git diff --name-only 43033841 1212a722` lists nothing outside `.sdlc/` and `docs/`, so this reading describes the tree being landed. Comfortably INSIDE the band, with **240.66 s** to spare. **104% of CPU**, the highest share of any reading in the series |

Interim ceiling: **`npm test` is expected between 280 and 550 s on a host at load under about 10.**
A reading above that is a contention question first, per the flaky-gates order (reap CPU-holding
processes, then compare red-under-load against green-in-isolation), and only then a regression
question. The series holds **20 readings**: **12** above the band's 550 s top
(553.45, 592.17, 647.42, 649, 705.01, 716.04, 747.27, 780.23, 795.49, 889.89, 1119.57, 1670.43) and **8** inside it (284, 293.09, 309.34, 318.52, 326, 344, 430.46, 518.66).
Counted off the rows themselves, not off the CPU table below, which is a subset.

**Three** of the readings are graded under R13. `326 s` started at **4.88** on the sync tree
`8f037dd2`, `553.45 s` started at **4.63** on this unit branch, and `309.34 s` started at **2.64** on
U7's verified head `43033841`, quoted from `.sdlc/records/pif-u7-gate-logs/r13-309s-unit-43033841.log`.
Of the other 17: **fourteen** record an explicit
start load and every one is **5.18 or above**, so R13 records and does not grade them; the remaining
**three** cannot support a claim in either direction, because `284 s` and `344 s` give a band,
`3.9 to 9.4`, which OPENS BELOW 5 without saying which reading sat where, and `318.52 s` reads
`not recorded with the figure`. An earlier sentence in this place said flatly that every reading
started at 5.18 or above, and then that none was gradeable; the two 3.9 rows contradicted the first
claim, the unrecorded row could not support it, and both graded readings falsify the second.

**What the graded pair says, and the spread is the finding.** `326 s` sits comfortably inside the
band. `553.45 s` sits **3.45 s over** its 550 s top, **0.63%**. Two runs, both started under R13's threshold,
**227 s apart**, and each now has a log committed under `.sdlc/records/pif-u5-gate-logs/` so neither rests on a path outside this branch. They are not averaged and neither is preferred: they are different trees and
different moments, and the honest reading of them together is that the interim band is about right
with the suite running near its top, and that load at start is a WEAK control for reproducibility,
since two runs that both satisfied it diverged by more than 40% of the band's whole width. That
weakness is a fact about the control, not about the ceiling. What the pair does settle is the
direction: the widening case earlier drafts of this section built, first at about 100 s and then at
40 to 100 s, is not supported by either graded reading. The band stands untouched.

**A third graded reading, and what it narrows.** `309.34 s`, U7's quiet verifier run at load **2.64**,
sits **17 s under** `326 s`. The two low-load readings, `326 s` and `309.34 s`, agree with each other;
`553.45 s` stands alone, 227 s from both. This does not explain the spread between the quiet runs and
the outlier; it narrows where that spread lives, from "the two graded readings diverge" to "one
outlier, two readings that agree." That is a smaller claim than an explanation, and it is the only one
this row supports.

What this section does NOT claim, because the evidence for it was withdrawn: that contention
explains the gap. That was the monotone-in-load argument, and it is gone. The two claims have to be kept apart, because one is
supported and the other is not. **Contention accounts for the slow tail**: the `1670.43 s` and `1119.57 s` rows sit
at the lowest CPU shares in the series, and the readings at high load
behave as contention would predict. **The divergence among the quiet runs is unexplained**: `553.45 s`
sits 227 s from the other two graded readings, `326 s` and `309.34 s`, all three started at loads
under 5, and **nothing in this record explains that spread**. The second is the finding. A single row
at load 194.52 supports the first and does
nothing for the second, and it does not restore the monotone-in-load argument, which a row at load
5.42 broke. Until something does, the
cause of the variation is open, and the only conclusion carried here is the narrow one: the band
stands and none of the three graded readings supports widening it.

A subset of the readings also records the CPU share `time` printed. It is
tabulated below as an observation and NOT as the metric anything is judged by: R13 rules on load at
start, and that is the control this section answers to. The `649 s` and `326 s` readings are absent
below because no CPU share was recorded for either: the 649 s run began at 9.42 and ended at 33.98, and the 780 s
run peaked near 63.

**A monotone-in-load claim stood here and is WITHDRAWN.** It read the series as rising in wall time
with rising start load, citing `293 s at load 3.1`. That 3.1 is not this reading's load: the
293.09 s row of the series above gives `9.42 / 6.59 / 5.30`, and `3.14 4.02 4.95` belongs to the
verifier's 345.89 s run, a different wall this sentence never used. Against the loads the rows
actually carry, walls of 518.66, 592.17, 647.42, 705.01, 747.27, 780.23, 795.49 and 889.89 sit at
start loads of 6.56, 7.94, 7.70, 5.42, 16.81, 9.37, 17.27 and 79.53. That is not monotone, and the
705.01 s reading at load 5.42 breaks it outright. The claim was this section's central argument that
the overshoot is contention rather than regression, so removing it removes that argument in its
load-based form; what is left of it is the CPU-share reading below, with its own caveat. The honest reading of the two U5 runs together is that this
host rarely stays under 10 for the nine minutes the suite needs, which is itself an argument for
#713 rather than for a wider ceiling. Sorted by CPU share rather than by date, the whole series lines up
almost monotonically, and that ordering is the honest summary of what these numbers say:

| CPU share | wall | inside the 280 to 550 band |
|---|---|---|
| 104% (printed) | 309.34 s | **yes** |
| 102% (printed) | 518.66 s | **yes** |
| 101% (printed) | 553.45 s | no, by 3.45 s |
| 101% (printed) | 592.17 s | no, by 42 s |
| 99% (printed) | 647.42 s | no, by 97 s |
| 98% (printed) | 705.01 s | no, by 155 s |
| 95% (printed) | 716.04 s | no, by 166 s |
| 95% (printed) | 747.27 s | no, by 197 s |
| 93% (printed) | 795.49 s | no |
| 90% (printed) | 889.89 s | no |
| 75% (printed) | 1119.57 s | no |
| 49% (printed) | 1670.43 s | no |
| 87.3% (computed) | 780.23 s | no |

13 rows, one per reading whose CPU share is recorded, of which two are
inside the band and 11 are above it. The ordering is close to monotone in share but is not
monotone, breaking in three places now: 101% carries both 553.45 s and 592.17 s, 95% carries both
716.04 s and 747.27 s, and at the bottom 87.3% reads 780.23 s against 90%'s 889.89 s.

This table must not be turned into an argument that share is the right control instead of load.
Two reasons, both fatal to that move. Average share is work divided by elapsed time, so it falls by
construction when a run waits longer, which makes any slope read off these rows partly definitional
rather than measured. And R13 rules on load at start, so share has no standing here whatever it
shows. Run 1 at **102%, inside the band at 518.66 s**, is consistent with the band
being right, which is also what the graded readings say on the control that does count. It was this
unit's
fastest and most CPU-efficient reading until the U7 quiet run at `309.34 s` joined the table: **104%
of CPU**, now the highest share and the fastest wall of any reading with a recorded CPU share. Two
earlier drafts of this paragraph, both this unit's, overlooked what Run 1 showed before this reading
existed. The first read the high-share readings as proving a fixed overshoot near 100 s; the
second softened that to a 40 to 100 s range. Both were wrong in the same direction, and the same
records contained the counter-example throughout.

The ordering itself must NOT be read as a measured rate, and the caveat belongs here rather than
waiting to be found. CPU share and wall time are not independent quantities: average share is work
divided by elapsed time, so a run that waits longer for the same work has a lower share by
construction. "About 20 s per point of share" is therefore partly definitional and is recorded as a
description of the shape of the table, never as a coefficient anyone should extrapolate from. What
is not circular is run 1 and the `309.34 s` reading on their own: the two highest CPU shares in the
series, both inside the band.

How these readings are to be treated, per **R13** (owner ruling, main @ `4e315376`): the 280 to 550
band stands, and nothing widens it before a run set STARTED at load under 5. Which readings that
admits is settled above, against the rows, and is not restated here. Nothing in this section is
proposed as the permanent figure; #713 owns that, and #681 U9 gives this script its own
labelled figure to check against, per PR #729's out-of-scope note (#718 made the check read
every range in a time cell, and left the label itself for this plan).

Correction (2026-09-20, plan preset-intent-fidelity U5, #681): two cells of the live `Pass` table
were re-measured because this plan changed what they describe, and both re-measurements are marked
in the cell itself rather than silently overwriting a run that was never redone. `npm test`'s summary
moved from 48 to 49 test files: `#681` registers `test/engine/anchor.mjs` in `test/run.mjs`'s
`TESTS`, and the span is taken byte for byte from this unit's own run in
`.git-worktrees/pif-u5-records` (exit 0, 518.66 s wall, load 6.56 / 14.82 / 20.43 at start,
9.85 / 10.04 / 15.18 at end, `git status --short` carrying only this unit's own record edits
afterwards). `npm run build`'s ui.html figure moved from 3780.5 KB to 4111.1 KB: the bundle grew when
`origin/main` was merged into this plan. The span is this unit's own program output, not a copy from
another record: `npm test`'s final step is `gen:figma-ui`, the same generator `npm run build` ends
with, and that step printed `wrote figma/plugin/ui.html 4111.1 KB` in the run above, with no leading
whitespace. Measuring the committed `figma/plugin/ui.html` in this tree the way
`baseline-agrees-check.sh` measures it gives the same 4111.1, and the verifier's own `npm run build`
at the U4 head reported the same figure, so the number has three independent confirmations while the
quote itself has exactly one source. The three
`seconds` columns are NOT re-measured and still belong to the `20298cc` runs; the script's own
`note head:` line is the standing statement that every timing here is unproven at a later head.

Correction (2026-09-20, plan preset-intent-fidelity U7, #681): `npm run build`'s ui.html figure
moves again, from 4111.1 KB to 4117.5 KB. The cause is named rather than left as a drift: U7's S1 adds explanatory comments to `src/ui/model.mjs` and
`src/ui/sections/color.js`, both of which `scripts/gen-figma-ui.mjs` inlines into
`figma/plugin/ui.html`, so the bundle grew by 6.4 KB and `baseline-agrees-check.sh` began reading
`STALE ui.html: baseline 4111.1 KB, tree 4117.5 KB`. Team-lead ruled that the unit whose change made
the figure stale repairs it in its own commit rather than leaving a red gate for a later one, on
revision 25's standing precedent. The new figure is this unit's own program output, not a number
copied out of the error line: `gen:figma-ui` printed `wrote figma/plugin/ui.html 4117.5 KB` in
`.git-worktrees/pif-u7`, and measuring the committed file the way `baseline-agrees-check.sh`
measures it gives the same 4117.5. The three `seconds` columns are NOT re-measured and still belong
to the `20298cc` runs; only the KB cell moves.

Correction (2026-09-20, plan records-followup U10, #709): the `npm test` and `npm run build` summary cells of the live table now sit in inline spans, taken byte for byte from a run in `.worktrees/rf-U10`; the `npm test` cell had dropped the check mark the runner prints. Rule: `.sdlc/adapter.md` §3, Verbatim-quote rule. Three sentences that the two `extended:` rows had made false were re-measured and rewritten: where those two rows ran, what the fonts row proves about `src/ui/type-fonts.js`, and which of the seven commits of `d814500..20298cc` changed what (`git show --stat`: 20298cca touched the toolchain and no file under `test/`, 9a44f685 touched only files under `test/`). The three prior-set summary cells now sit in spans as they stand, with the two that the program did not print whole marked `altered:` next to the span: the 47-file cell lost the runner's check mark and the smoke cell is cut before the dash, both at a `d814500` run that cannot be redone. No measured figure moves.

Correction (2026-09-23, plan preset-intent-fidelity U10, #681): `npm run build`'s ui.html figure moves from 4117.5 KB to 4118.2 KB. The cause is named: U10 adds a pure-black guard and its comment to `src/engine/okhsl.js`, which `scripts/gen-figma-ui.mjs` inlines into `figma/plugin/ui.html`, and `baseline-agrees-check.sh` began reading `STALE ui.html: baseline 4117.5 KB, tree 4118.2 KB`. The unit whose change made the figure stale repairs it in its own commit, on the U7 precedent above. The new figure is program output: `gen:figma-ui` printed `wrote figma/plugin/ui.html 4118.2 KB` in `.worktrees/pif-u10` and again in a fresh shared clone of `unit/pif-u10`, and measuring the committed file the way `baseline-agrees-check.sh` measures it gives the same 4118.2. The `seconds` columns are not re-measured; only the KB cell moves.

Correction (2026-09-23, plan preset-intent-fidelity U10 scope growth, revision 37, #681): the ui.html figure moves again, from 4118.2 KB to 4119.1 KB. The cause is named: U10-5 caps the chroma envelope and U10-7 swaps comment em dashes for hyphens in `src/engine/tonal.js`, U10-6 rewords a comment in `src/engine/hct.js`, and both files are inlined into `figma/plugin/ui.html`. The figure is program output: `gen:figma-ui` printed `wrote figma/plugin/ui.html 4119.1 KB` in `.worktrees/pif-u10`, and measuring the committed file the way `baseline-agrees-check.sh` measures it gives the same 4119.1. Only the KB cell moves.

Correction (2026-09-23, plan achromatic-anchor U1, #739): the ui.html figure moves again, from 4119.1 KB to 4125.1 KB. The cause is named: U1 adds the white guard and `rgbToOklabChroma` to `src/engine/okhsl.js`, `ACHROMATIC_ANCHOR_C` and the achromatic hue-seed branches to `src/engine/tonal.js`, and both files are inlined into `figma/plugin/ui.html`. The figure is program output: `npm test` printed `wrote figma/plugin/ui.html 4125.1 KB` in `.worktrees/aa-U1`, and measuring the committed file the way `baseline-agrees-check.sh` measures it gives the same 4125.1. Only the KB cell moves.
