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
| `npm run build` | 3/3 | 0 | 3.06 · 1.34 · 1.36 | `wrote figma/plugin/ui.html 4111.1 KB` `re-measured 2026-09-20, see the #681 correction below` |
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

Interim ceiling: **`npm test` is expected between 280 and 550 s on a host at load under about 10.**
A reading above that is a contention question first, per the flaky-gates order (reap CPU-holding
processes, then compare red-under-load against green-in-isolation), and only then a regression
question. Two readings sit above the band and neither is evidence against it, because neither was
taken at a load under 10 throughout: the 649 s run began at 9.42 and ended at 33.98, and the 780 s
run peaked near 63. The series 293 s at load 3.1, 430 s at load 5.2, 519 s at load 6.6, 649 s at
load 9.4-to-34 and 780 s at load 9.4-to-63 is monotone in load, which is what contention looks like
and what a fixed regression would not. The honest reading of the two U5 runs together is that this
host rarely stays under 10 for the nine minutes the suite needs, which is itself an argument for
#713 rather than for a wider ceiling. Nothing here is proposed as the permanent figure; #713 owns
that.

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

Correction (2026-09-20, plan records-followup U10, #709): the `npm test` and `npm run build` summary cells of the live table now sit in inline spans, taken byte for byte from a run in `.worktrees/rf-U10`; the `npm test` cell had dropped the check mark the runner prints. Rule: `.sdlc/adapter.md` §3, Verbatim-quote rule. Three sentences that the two `extended:` rows had made false were re-measured and rewritten: where those two rows ran, what the fonts row proves about `src/ui/type-fonts.js`, and which of the seven commits of `d814500..20298cc` changed what (`git show --stat`: 20298cca touched the toolchain and no file under `test/`, 9a44f685 touched only files under `test/`). The three prior-set summary cells now sit in spans as they stand, with the two that the program did not print whole marked `altered:` next to the span: the 47-file cell lost the runner's check mark and the smoke cell is cut before the dash, both at a `d814500` run that cannot be redone. No measured figure moves.
