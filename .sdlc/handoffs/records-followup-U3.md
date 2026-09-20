---
kind: handoff
plan: records-followup
unit: U3
branch: unit/rf-U3
written: 2026-09-20
pass: 3
---

# Handoff U3 records-followup - builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/rf-U3, the plan tip `bc34b5fb` merged at 79983fd8 and `31b53ea9` at a129843c, then this handoff commit and the measurement commit that fills the Criteria table |
| Worktree | .worktrees/rf-U3 |
| Files | .sdlc/baseline.md, .sdlc/adapter.md, .sdlc/checks/baseline-agrees-check.sh, .claude/CLAUDE.md, this handoff |
| Commits | ab5cd472 (steps 5, 6, 7 half, 8, 9), 7fba70b7 (steps 10, 11), 9465cda5 (steps 1 to 4, 7 rest), 1c1cfc69 (pass 1 criteria), 486d124a and fbeaf56f (rework 1), then the rework 2 pair |
| Ran | npm test green, 48 files, no `node_modules`, tree clean after - branding clean - six timed gate runs in pass 1, all exit 0 |
| Path taken | short path (step 2): both `head:` lines printed `ok` when the first builder ran the script at the unit's start, so the three measured rows stand and only two gates were timed |
| Left out | nothing in the eleven steps. Three notes for the Orchestrator are below, none of them acted on |
| Pass 1 | first builder lost to a rate limit after ab5cd472; second builder measured every figure from scratch. Reviewed FIX-FIRST at 1c1cfc69: nine rows green, U3-1 and P7 red on one cause |
| Pass 2 | plan tip merged, Fix A applied to the check script, the discarded-runs disclosure completed, and one defect of my own found and fixed (see Correction). Delta review PASS, all three notes judged correct |
| Pass 3 | this pass. Note 3 ruled in scope: the script's header comment is repaired to describe what the two head rows now mean. U3-1's numstat leg is `3	3` |

## Runs

Six runs from pass 1, the short path's two gates three times each. No run was made in pass 2: the rework brief rules the host loaded and this set standing. `sysctl -n hw.ncpu` prints `10`; the load columns are the 1-minute figure from `uptime` immediately before and after each run. The pgrep column is `pgrep -fl 'test/run.mjs|curated-contrast|[v]ite|headless'` filtered to this repo, run before each: the single match every time is pid 47201, a repo `vite` dev server idle since 2026-09-17 (`ps -o etime=,%cpu= -p 47201` printed `02-01:11:11` and `0.0`), which by the ruling on this plan measures as contention and holds none. The status column is `git status --short | wc -l` after the run.

| # | command | load before | load after | pgrep before | exit | seconds | last line | status |
|---|---|---|---|---|---|---|---|---|
| 1 | `npm run gate:corpus-contrast` | 3.97 | 4.84 | 47201 only, idle dev server at 0.0% cpu | 0 | 20.12 | `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 0 |
| 2 | `npm run gen:type-fonts` | 4.84 | 4.84 | 47201 only, idle dev server at 0.0% cpu | 0 | 0.77 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` | 0 |
| 3 | `npm run gate:corpus-contrast` | 4.84 | 5.36 | 47201 only, idle dev server at 0.0% cpu | 0 | 22.89 | `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 0 |
| 4 | `npm run gen:type-fonts` | 5.36 | 5.36 | 47201 only, idle dev server at 0.0% cpu | 0 | 0.78 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` | 0 |
| 5 | `npm run gate:corpus-contrast` | 5.36 | 6.16 | 47201 only, idle dev server at 0.0% cpu | 0 | 22.29 | `PASS: every measured curated preset's accent clears 4.5:1 against its own on-color` | 0 |
| 6 | `npm run gen:type-fonts` | 6.16 | 6.16 | 47201 only, idle dev server at 0.0% cpu | 0 | 0.70 | `wrote src/ui/type-fonts.js  (229 KB · fonts 171 KB woff2)` | 0 |

Six earlier runs of the same two gates, made before 7fba70b7 was committed, are not this set and are not recorded above: the tree then still carried the uncommitted steps 10 and 11 edit, so their status column read `1` rather than `0`. They were green and quiet on the same host the same day (corpus-contrast 16.51, 16.28, 17.50 s; fonts 0.73, 0.64, 0.69 s; load 4.17 to 4.93). That discarded set was faster than the recorded one on every run, so the window the baseline and the adapter now carry, `20 to 23 s`, is the conservative end of what this host did, not a lucky one. The set above is the measured one, taken on a clean tree.

## Corpus counts, as the gate printed them

From run 5. One list item per line of output, each in its own backtick span, leading whitespace kept byte for byte.

- `  (343 curated documents, 3780 palettes (3420 carrying a non-zero lift or skew), 22680 accent/on-color cells; 504 named per cell, 0 carried below 4.5)`
- `  (perceptual   7560 cells, 0 under 4.5, worst 4.502:1 at nature "47° N · April · 10:00 · Hoh Rain Forest, Olympic Peninsula, Washington" neutral/light)`
- `  (peak         7560 cells, 0 under 4.5, worst 4.504:1 at architecture "Bauhaus Dessau · 1926 · Walter Gropius" neutral/light)`
- `  (even         7560 cells, 0 under 4.5, worst 4.505:1 at brands "BZZR · The product's own design system" tertiary/dark)`

## Steps

| Step | What | Where |
|---|---|---|
| S1 | quiet host recorded before and after every run | the Runs table |
| S2 | short path taken, two gates timed three times each | the Runs table |
| S3 | every run of the measured set recorded, no red run | the Runs table, six rows, all exit 0 |
| S4 | the corpus row's summary is the gate's PASS line, the four counts lines are under the baseline table | `.sdlc/baseline.md` Pass table and the list under it |
| S5 | the CI sentence names all four jobs of run 35455937943 | `.sdlc/baseline.md` Not run here (committed at ab5cd472) |
| S6 | the check script's gate list gains the corpus-contrast and fonts pairs, the head same-tree row prints as a note, and the header comment says what the two head rows mean | `.sdlc/checks/baseline-agrees-check.sh`, three lines changed (Fix A at rework 1, the header at rework 2) |
| S7 | adapter Time cells become `20 to 23 s` and `1 to 1 s`, the corpus count arithmetic leaves the Green-means cell | `.sdlc/adapter.md` section 1 |
| S8 | section 2 amendment: a PR runs three jobs since #674 | `.sdlc/adapter.md` section 2 |
| S9 | the approved `.claude/CLAUDE.md` line names the three PR jobs | one line, one changed |
| S10 | section 2.1 item 1 names `reviewer-l4` with `verifier-l3`, records-tidy's amendment appended after item 4 | `.sdlc/adapter.md` section 2.1 |
| S11 | the cited-quote clause appended to section 3 as its own amendment | `.sdlc/adapter.md` section 3 |

## Correction (pass 2, found by this builder)

U3-3's awk counts any row of this file that starts with a pipe and a number. In pass 1 I renumbered the wrong table: a sloppy replace renamed the six **Runs** rows to `S1` to `S6` and left the first six **Steps** rows numeric, so the awk counted the Steps table and printed `6 0 0` without ever reading a load or an exit column. The row passed vacuously, at 1c1cfc69, and the reviewer's own run reproduced the same vacuous `6 0 0`. Fixed here: the Runs rows carry `1` to `6` and every other table in this file is lettered or prefixed, so the awk reads the Runs table and nothing else. The load and exit columns it now reads are real, which is what the row was written to check.

## Notes for the Orchestrator, none acted on

1. 🟡 `adapter.md:29`, the corpus-contrast variance, raised as review finding 5 and routed back to me as an argument to write down rather than an edit to make. The old cell said `~20 s (host-sensitive; 17-27 s observed, mirror parsing dominates)`; step 7 mandates `A to B s` and leaves no room for the second clause. On this host on one day the gate ran 16.28 to 22.89 s across twelve runs, a spread of 40 percent of the low figure, and the cause is named in the old cell: mirror parsing, which competes with whatever else the host is doing. `A to B s` from three runs cannot carry that, and the script only ever compares the two extremes, so a variance clause after the range would not break it. My argument is for one sentence in the Green-means cell rather than the Time cell, where the script never reads: the Time cell stays the measured range the script compares, the Green-means cell says the gate is host-sensitive and mirror parsing dominates. That is a plan change, not mine to make.
2. 🟡 `adapter.md:54`, review finding 6: step 8's last sentence, a directive about keeping the old Two jobs row, sits inside the amendment text where `The "Two jobs" row above it` now points at the amendment's own neighbours. The plan at the merged head still gives step 8 that text verbatim, so the rework brief's condition for fixing it is not met and I left it.
3. 🟢 Closed at rework 2, on the Orchestrator's ruling. `baseline-agrees-check.sh` line 4 described a `STALE head` line the script can no longer print for a moved tree. It now reads `# A STALE head line now means only that the ref is not in origin/main's history; a note head line on a later commit is expected, counts toward neither the stale total nor the exit code, and says the tree moved since the baseline ran,`, with line 5 unchanged so the sentence still closes on `# so the numbers are unproven at that head, not that they are wrong.`. One header line changed, which is why the plan re-derived U3-1's numstat leg to `3	3` rather than `4	4`; nothing else in the header or the script moved.

## Criteria

Measured by this builder against the committed tree at 27ae857d, every command run from a script file under the seat's own scratchpad. `BASE` is `acfd7298`, the plan-branch head this unit was cut from; `UB` at the graded head is `31b53ea9`, the plan tip merged in during this unit; the `d34b4fb1` figures are given where the two differ.

| # | Expected | Evidence measured | State | Negative control |
|---|---|---|---|---|
| U3-1 | eight `ok` lines plus one `note head:` line when the tree moved outside `.sdlc/` since the baseline ran (nine `ok` when it has not), among them `time corpus-contrast:` and `time fonts:`, `stale total: 0`, `exit 0`, then `3	3	.sdlc/checks/baseline-agrees-check.sh` | eight `ok` lines by count, among them `ok    time corpus-contrast: baseline 20 to 23 s, adapter 20 to 23 s` and `ok    time fonts: baseline 1 to 1 s, adapter 1 to 1 s`, and one `note  head: baseline ref 20298cc has the same tree as HEAD outside .sdlc/ and .gitignore`; `stale total: 0`; `exit 0`; `3	3	.sdlc/checks/baseline-agrees-check.sh` against `acfd7298` and against `d34b4fb1` alike | 🟢 | the pass 1 form of the script printed `STALE head:`, `stale total: 1`, `exit 1` on this same tree; a baseline `ref` off `origin/main` still reds the ancestry row, which Fix A left counting |
| U3-2 | no diff lines, `diff 0` | no lines, `diff 0` | 🟢 | at d34b4fb1 the same command printed two `<` lines and `diff 1` |
| U3-3 | `6 0 0` | `6 0 0`, the awk reading the Runs table's six rows (`row 1 lb 3.97 la 4.84 exit 0` through `row 6 lb 6.16 la 6.16 exit 0`) | 🟢 | one load-before cell edited to `11.46` in a copy prints `6 1 0`, so the hot leg bites. At 1c1cfc69 the same `6 0 0` came from the Steps table with the load columns never read, which is the Correction above |
| U3-4 | `1`, `1`, `3`, `0` | `1`, `1`, `3`, `0` | 🟢 | at d34b4fb1 the same four commands print `1`, `0`, `0`, `1` |
| U3-5 | `4`, `1,1,1,1`, `0` | `4`, `1,1,1,1`, `0` (run 35455937943) | 🟢 | at d34b4fb1 the job legs print `0,0,0,0` and the last leg `1` |
| U3-6 | `0`, `1` or more | `0`, `1` | 🟢 | the revision 5 form of the first leg prints `1` on this tree, since the grade line is a deletion; the widened form prints `0` |
| U3-7 | U1-4, U1-5 and U4-3 as in those rows | U1-4 `(#699) (#702)`, `0`, `1`; U1-5 `0`; U4-3 `1`, then `.sdlc/baseline.md:1`, `.sdlc/handoffs/records-refresh-U1.md:1`, `.sdlc/handoffs/records-refresh-U3.md:4`, `.sdlc/verdicts/records-refresh-U3.md:1`, `.sdlc/verdicts/survey.md:1`, then `0` | 🟢 | at d34b4fb1 U1-4 prints `1`, `0`, U1-5 prints `1` (`NOT b50a4b9b`) and U4-3's widened grep names five files |
| U3-8 | `build-test,corpus-contrast,panda-smoke`, `1`, `1	1`, `rows 56 drifted 11 holds 45 undetermined 0 bad 0` | `build-test,corpus-contrast,panda-smoke`, `1`, `1	1`, `rows 56 drifted 11 holds 45 undetermined 0 bad 0` | 🟢 | a second edited `CLAUDE.md` line would print `2	2` on the third leg |
| U3-9 | `0`, `1`, `1` | `0`, `1`, `1` | 🟢 | at main 730ff941 and at acfd7298 alike the three legs print `1`, `0`, `0` |
| U3-10 | `1`, `1`, `1` | `1`, `1`, `1` | 🟢 | at acfd7298 the three legs print `0`, `0`, `1` |

Plan-level rows this builder also ran at the same head: P1 `✓ all 48 test files passed` with `TESTS` at 48 and `git status --short` empty, no `node_modules` present; P4 `branding: clean (479 files scanned)`, `exit 0`; P5 `0`, `0`, `1	1`; P6 `0` against `acfd7298` and `0` against `d34b4fb1` (the `od` dump line of review finding 4 came in with the plan tip's own fix and no longer counts); P7 is U3-1's first two commands and reads `stale total: 0`, `exit 0`.

## Disagreement

None open. The one 🟡 of rework 1, U3-1's `nine `ok` lines` against a measured eight plus one `note`, was closed by the plan at `31b53ea9`: the row's expected value now names both cases and the numstat leg is `3	3`, which is what the header repair of note 3 costs. Every figure below was measured after that merge, and nothing on either side was adjusted to fit.

Correction (2026-09-20, plan records-followup U8, #709): two stale statements in this file, both raised as 🟡 notes 3 and 4 of `.sdlc/verdicts/records-followup-U3.md`. The frontmatter read `pass: 2` while the body's own row reads `| Pass 3 | this pass.`; it now reads `pass: 3`. The Criteria paragraph said `BASE` is `acfd7298` `which is also UB`; after the plan tip was merged in at a129843c, `UB` at the graded head `ceb471b0` is `31b53ea9`, and the sentence now says so. No measured figure moves: the verdict records U3-6 printing `0` under both readings.
