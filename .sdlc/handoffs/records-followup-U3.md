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
| S1 | `npm run gate:corpus-contrast` | 3.97 | 4.84 | 47201 only, idle dev server at 0.0% cpu | 0 | 20.12 | `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 0 |
| S2 | `npm run gen:type-fonts` | 4.84 | 4.84 | 47201 only, idle dev server at 0.0% cpu | 0 | 0.77 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` | 0 |
| S3 | `npm run gate:corpus-contrast` | 4.84 | 5.36 | 47201 only, idle dev server at 0.0% cpu | 0 | 22.89 | `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 0 |
| S4 | `npm run gen:type-fonts` | 5.36 | 5.36 | 47201 only, idle dev server at 0.0% cpu | 0 | 0.78 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` | 0 |
| S5 | `npm run gate:corpus-contrast` | 5.36 | 6.16 | 47201 only, idle dev server at 0.0% cpu | 0 | 22.29 | `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 0 |
| S6 | `npm run gen:type-fonts` | 6.16 | 6.16 | 47201 only, idle dev server at 0.0% cpu | 0 | 0.70 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` | 0 |

Six earlier runs of the same two gates, made before 7fba70b7 was committed, are not this set and are not recorded above: the tree then still carried the uncommitted steps 10 and 11 edit, so their status column read `1` rather than `0`. They were green and quiet on the same host (corpus-contrast 16.51, 16.28, 17.50 s; fonts 0.73, 0.64, 0.69 s; load 4.17 to 4.93). The set above is the measured one, taken on a clean tree.

## Corpus counts, as the gate printed them

From run 5. One list item per line of output, each in its own backtick span, leading whitespace kept byte for byte.

- `  (343 curated documents, 3780 palettes (3420 carrying a non-zero lift or skew), 22680 accent/on-color cells; 504 named per cell, 0 carried below 4.5)`
- `  (perceptual   7560 cells, 0 under 4.5, worst 4.502:1 at nature "47° N · April · 10:00 · Hoh Rain Forest, Olympic Peninsula, Washington" neutral/light)`
- `  (peak         7560 cells, 0 under 4.5, worst 4.504:1 at architecture "Bauhaus Dessau · 1926 · Walter Gropius" neutral/light)`
- `  (even         7560 cells, 0 under 4.5, worst 4.505:1 at brands "BZZR · The product's own design system" tertiary/dark)`

## Steps

| Step | What | Where |
|---|---|---|
| 1 | quiet host recorded before and after every run | the Runs table |
| 2 | short path taken, two gates timed three times each | the Runs table |
| 3 | every run of the measured set recorded, no red run | the Runs table, six rows, all exit 0 |
| 4 | the corpus row's summary is the gate's PASS line, the four counts lines are under the baseline table | `.sdlc/baseline.md` Pass table and the list under it |
| 5 | the CI sentence names all four jobs of run 35455937943 | `.sdlc/baseline.md` Not run here (committed at ab5cd472) |
| 6 | the check script's gate list gains the corpus-contrast and fonts pairs | `.sdlc/checks/baseline-agrees-check.sh`, one line changed |
| S7 | adapter Time cells become `20 to 23 s` and `1 to 1 s`, the corpus count arithmetic leaves the Green-means cell | `.sdlc/adapter.md` section 1 |
| S8 | section 2 amendment: a PR runs three jobs since #674 | `.sdlc/adapter.md` section 2 |
| S9 | the approved `.claude/CLAUDE.md` line names the three PR jobs | one line, one changed |
| S10 | section 2.1 item 1 names `reviewer-l4` with `verifier-l3`, records-tidy's amendment appended after item 4 | `.sdlc/adapter.md` section 2.1 |
| S11 | the cited-quote clause appended to section 3 as its own amendment | `.sdlc/adapter.md` section 3 |

## Criteria

Measured by this builder against the committed tree at 18cf0561, every command run from a script file under the seat's own scratchpad. `BASE` is `acfd7298`, the plan-branch head this unit was cut from, which is also `UB`.

| # | Expected | Evidence measured | State | Negative control |
|---|---|---|---|---|
| U3-1 | nine `ok`, `stale total: 0`, `exit 0`, then `1	1	.sdlc/checks/baseline-agrees-check.sh` | eight `ok` including `ok    time corpus-contrast: baseline 20 to 23 s, adapter 20 to 23 s` and `ok    time fonts: baseline 1 to 1 s, adapter 1 to 1 s`, one `STALE head: baseline ref 20298cc has the same tree as HEAD outside .sdlc/ and .gitignore`, `stale total: 1`, `exit 1`; the numstat line is `1	1	.sdlc/checks/baseline-agrees-check.sh` against both `acfd7298` and `d34b4fb1` | 🔴 see Disagreement | the plan's control, the script line alone at d34b4fb1, prints `STALE time corpus-contrast: baseline 0 to 0 s, adapter none` and `stale total: 2`; this tree's HEAD before 9465cda5 printed the same two lines |
| U3-2 | no diff lines, `diff 0` | no lines, `diff 0` | 🟢 | at d34b4fb1 the same command printed two `<` lines and `diff 1` |
| U3-3 | `6 0 0` | `6 0 0` | 🟢 | the awk counts any row starting with a pipe and a number; the Steps table's rows were renumbered `S1` to `S11` after a first run printed `17 0 0`, which is the control that the counter bites |
| U3-4 | `1`, `1`, `3`, `0` | `1`, `1`, `3`, `0` | 🟢 | at d34b4fb1 the same four commands print `1`, `0`, `0`, `1` |
| U3-5 | `4`, `1,1,1,1`, `0` | `4`, `1,1,1,1`, `0` (run 35455937943) | 🟢 | at d34b4fb1 the job legs print `0,0,0,0` and the last leg `1` |
| U3-6 | `0`, `1` or more | `0`, `1` | 🟢 | the revision 5 form of the first leg prints `1` on this tree, since the grade line is a deletion; the widened form prints `0` |
| U3-7 | U1-4, U1-5 and U4-3 as in those rows | U1-4 `(#699) (#702)`, `0`, `1`; U1-5 `0`; U4-3 `1`, then `.sdlc/baseline.md:1`, `.sdlc/handoffs/records-refresh-U1.md:1`, `.sdlc/handoffs/records-refresh-U3.md:4`, `.sdlc/verdicts/records-refresh-U3.md:1`, `.sdlc/verdicts/survey.md:1`, then `0` | 🟢 | at d34b4fb1 U1-4 prints `1`, `0`, U1-5 prints `1` (`NOT b50a4b9b`) and U4-3's widened grep names five files |
| U3-8 | `build-test,corpus-contrast,panda-smoke`, `1`, `1	1`, `rows 56 drifted 11 holds 45 undetermined 0 bad 0` | `build-test,corpus-contrast,panda-smoke`, `1`, `1	1`, `rows 56 drifted 11 holds 45 undetermined 0 bad 0` | 🟢 | a second edited `CLAUDE.md` line would print `2	2` on the third leg |
| U3-9 | `0`, `1`, `1` | `0`, `1`, `1` | 🟢 | at main 730ff941 and at acfd7298 alike the three legs print `1`, `0`, `0` |
| U3-10 | `1`, `1`, `1` | `1`, `1`, `1` | 🟢 | at acfd7298 the three legs print `0`, `0`, `1` |

Plan-level rows this builder also ran: P1 `npm test` printed `✓ all 48 test files passed` with `TESTS` at 48 and a `git status --short` carrying only this unit's own edits; P4 `branding: clean (477 files scanned)`, `exit 0`; P5 `0`, `0`, `1	1`; P6 against `acfd7298` `0`. P6 against `d34b4fb1` prints `1`, from `.sdlc/verdicts/records-followup-U6.md:49`, a fenced `od` dump U6 added, outside this unit's files and untouched by it.

## Disagreement

🔴 U3-1 cannot pass while step 9 stands, and neither side was adjusted.

Step 9 edits one line of `.claude/CLAUDE.md`, approved by the owner under adapter conflict row X9 (approval Q4). `baseline-agrees-check.sh` compares the baseline's `ref` tree with `HEAD` excluding `.sdlc` and `.gitignore` only, so that one approved line outside `.sdlc/` makes the `head:` row read `STALE head: baseline ref 20298cc has the same tree as HEAD outside .sdlc/ and .gitignore`, `stale total: 1`, `exit 1`. `git diff --name-only 20298cc HEAD -- . ':(exclude).sdlc' ':(exclude).gitignore'` prints exactly one path, `.claude/CLAUDE.md`, from commit ab5cd472; no other file outside `.sdlc/` differs.

U3-1 expects nine `ok` and `exit 0`. The seven gate and figure rows and the ancestry row all print `ok`, the two new ones among them. The only red row is the head row, and it is red because of step 9, not because a figure disagrees.

The plan cannot be satisfied as written: step 6 gives the script one changed line and U3-1 counts `1	1` on it, so widening the exclude list to `.claude/CLAUDE.md` would be a second changed line and would red U3-1's own numstat leg. P7, the landing rule, runs the same script at pre-land and would read the same `exit 1`.

Options for the Orchestrator, none taken here:

| Option | Cost |
|---|---|
| A. widen the script's exclude list to `.claude/CLAUDE.md` and re-derive U3-1's numstat leg to `2	2` | one plan revision, one more changed line in the script; the exclusion is honest, since the approved line is a record, not a tree the baseline timed |
| B. re-run the baseline at a new `ref` after this plan lands, so the trees agree again | pays three full gate sets for a documentation line |
| C. rule the `head:` row expected on this branch, as the script's own header already allows (`A STALE head line on a later commit is expected`), and re-derive U3-1 and P7 to `stale total: 1`, `exit 1` until landing | no code change; weakens the pre-land gate for the rest of the plan |

Recommendation: A. The two rows this unit added both print `ok`, which is what F7 asked for; the head row is measuring a file the baseline never described.
