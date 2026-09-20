---
kind: handoff
plan: records-followup
unit: U3
branch: unit/rf-U3
written: 2026-09-19
---

# Handoff U3 records-followup - builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/rf-U3 @ 9465cda5, plus this handoff commit and the measurement commit that fills the Criteria table |
| Worktree | .worktrees/rf-U3 |
| Files | .sdlc/baseline.md, .sdlc/adapter.md, .sdlc/checks/baseline-agrees-check.sh, .claude/CLAUDE.md, this handoff |
| Commits | ab5cd472 (steps 5, 6, 7 half, 8, 9), 7fba70b7 (steps 10, 11), 9465cda5 (steps 1 to 4, 7 rest) |
| Ran | npm test green, 48 files, tree byte-stable - branding clean, 477 files - six timed gate runs, all exit 0 |
| Path taken | short path (step 2): both `head:` lines printed `ok` when the first builder ran the script at the unit's start, so the three measured rows stand and only two gates were timed |
| Left out | nothing in the eleven steps; see Disagreement below for one criterion that the plan and step 9 cannot both satisfy |
| Second builder | the first builder hit an account rate limit after ab5cd472. No timing figure was carried forward: every second below is this builder's own, measured after 7fba70b7 |

## Runs

Six runs, the short path's two gates three times each. `sysctl -n hw.ncpu` prints `10`; the load columns are the 1-minute figure from `uptime` immediately before and after each run. The pgrep column is `pgrep -fl 'test/run.mjs|curated-contrast|[v]ite|headless'` filtered to this repo, run before each: the single match every time is pid 47201, a repo `vite` dev server idle since 2026-09-17 (`ps -o etime=,%cpu= -p 47201` printed `02-01:11:11` and `0.0`), which by the ruling on this plan measures as contention and holds none. The status column is `git status --short | wc -l` after the run.

| # | command | load before | load after | pgrep before | exit | seconds | last line | status |
|---|---|---|---|---|---|---|---|---|
| 1 | `npm run gate:corpus-contrast` | 3.97 | 4.84 | 47201 only, idle dev server at 0.0% cpu | 0 | 20.12 | `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 0 |
| 2 | `npm run gen:type-fonts` | 4.84 | 4.84 | 47201 only, idle dev server at 0.0% cpu | 0 | 0.77 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` | 0 |
| 3 | `npm run gate:corpus-contrast` | 4.84 | 5.36 | 47201 only, idle dev server at 0.0% cpu | 0 | 22.89 | `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 0 |
| 4 | `npm run gen:type-fonts` | 5.36 | 5.36 | 47201 only, idle dev server at 0.0% cpu | 0 | 0.78 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` | 0 |
| 5 | `npm run gate:corpus-contrast` | 5.36 | 6.16 | 47201 only, idle dev server at 0.0% cpu | 0 | 22.29 | `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 0 |
| 6 | `npm run gen:type-fonts` | 6.16 | 6.16 | 47201 only, idle dev server at 0.0% cpu | 0 | 0.70 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` | 0 |

Six earlier runs of the same two gates, made before 7fba70b7 was committed, are not this set and are not recorded above: the tree then still carried the uncommitted steps 10 and 11 edit, so their status column read `1` rather than `0`. They were green and quiet on the same host (corpus-contrast 16.51, 16.28, 17.50 s; fonts 0.73, 0.64, 0.69 s; load 4.17 to 4.93). The set above is the measured one, taken on a clean tree.

## Corpus counts, as the gate printed them

From run 5. One list item per line of output, each in its own backtick span, leading whitespace kept byte for byte.

- `  (343 curated documents, 3780 palettes (3420 carrying a non-zero lift or skew), 22680 accent/on-color cells; 504 named per cell, 0 carried below 4.5)`
- `  (perceptual   7560 cells, 0 under 4.5, worst 4.502:1 at nature "47° N · April · 10:00 · Hoh Rain Forest, Olympic Peninsula, Washington" neutral/light)`
- `  (peak         7560 cells, 0 under 4.5, worst 4.504:1 at architecture "Bauhaus Dessau · 1926 · Walter Gropius" neutral/light)`
- `  (even         7560 cells, 0 under 4.5, worst 4.505:1 at brands "BZZR · The product's own design system" tertiary/dark)`

## Steps

| # | Step | Done |
|---|---|---|
| 1 | quiet host recorded before and after every run | the Runs table |
| 2 | short path taken, two gates timed three times each | the Runs table |
| 3 | every run of the measured set recorded, no red run | the Runs table, six rows, all exit 0 |
| 4 | the corpus row's summary is the gate's PASS line, the four counts lines are under the baseline table | `.sdlc/baseline.md` Pass table and the list under it |
| 5 | the CI sentence names all four jobs of run 35455937943 | `.sdlc/baseline.md` Not run here (committed at ab5cd472) |
| 6 | the check script's gate list gains the corpus-contrast and fonts pairs | `.sdlc/checks/baseline-agrees-check.sh`, one line changed |
| 7 | adapter Time cells become `20 to 23 s` and `1 to 1 s`, the corpus count arithmetic leaves the Green-means cell | `.sdlc/adapter.md` section 1 |
| 8 | section 2 amendment: a PR runs three jobs since #674 | `.sdlc/adapter.md` section 2 |
| 9 | the approved `.claude/CLAUDE.md` line names the three PR jobs | one line, one changed |
| 10 | section 2.1 item 1 names `reviewer-l4` with `verifier-l3`, records-tidy's amendment appended after item 4 | `.sdlc/adapter.md` section 2.1 |
| 11 | the cited-quote clause appended to section 3 as its own amendment | `.sdlc/adapter.md` section 3 |

## Criteria

CRITERIA

## Disagreement

DISAGREEMENT
