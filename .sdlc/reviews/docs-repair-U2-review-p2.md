PASS: docs-repair U2 pass 2 at 4a6fc9dc (commit A 441a8638). Every U2 row (U2-1 to U2-6) and every unit P row holds at 441a8638. P8 re-runs the handoff's `~~~sh ran` block at 441a8638 and diffs empty. Pass 1 F1 and F3 are fixed. One medium finding: a handoff cell contradicts the section added after it.

The reviewer ran everything itself in a `git clone --shared` copy under its job tmp dir, with `/usr/bin/grep` first on PATH. It made no source edits. `B = 282fca8d` (`git merge-base origin/main HEAD`), and the plan branch head is `1e263b2f`.

## Findings

| Rank | Finding | Where | Evidence |
|---|---|---|---|
| 1 medium | The handoff contradicts itself. Its `Left out` cell says "per-row negative controls are the plan's stated ones and were not re-run here". Commit `4a6fc9dc` then added a `## Negative controls` section that says they were run in a throwaway clone, and it did not update the cell. That is a stale record in the same change. The figures in the section are true (reproduced below), so the cell is the false part. Fix: delete that clause from `Left out`. The fix is handoff only, so P7 stays `0` and P8 stays `diff 0`. | `.sdlc/handoffs/docs-repair-U2.md`, summary table `Left out` | `git show 4a6fc9dc` touches only lines 79 onward. Line 10 still carries the clause. |
| 2 low | The handoff lists only pass 2's file under `Files at 441a8638`. The unit's diff against the plan branch has five docs (`SKILL.md`, `spec-draft.md`, `acceptance-criteria.md`, `quality-rubric.md`, `glossary.md`) plus the handoff and two review records. The pass 1 files are listed in no field, so a verifier who reads only this handoff misses four of the five. | same file, `Files at 441a8638` | `git diff --name-only plan/docs-repair HEAD` prints 8 paths |
| 3 info | Carried, out of pass 2 per the re-diagnosis: F2 (`all ten` in two contract checks) and F4 (P6 plan-wide prints `2`: `ui-plan.md:48` and `:153`, U1's file). | pre-land record | P6 below |

## P8 (run first)

| Run | Printed | Plan says |
|---|---|---|
| The handoff at `4a6fc9dc`, P8 verbatim | `H=441a8638`, `HAS-RAN`, `1 1 1 1 1 1`, no diff lines, `diff 0` | `H=<sha>`, `HAS-RAN`, one `1` per U2 row, `diff 0` |
| `ran.sh` against the plan rows | U2-1 to U2-6 each match the plan's command byte for byte once the cell escape is removed (checked in Python). `# P3` is `tail -1 <(node test/repo/branding.mjs)` | the plan's rows, escape removed |
| Control (a): the handoff at `be13a210`, P8 at `e7058994` | `H=e7058994`, `NO-RAN`, `0 0 0 0 0`, `diff 0` | same |
| Control (b): the fixture built from the committed pass 1 cells, at `e7058994` | `1a2 > 5`, `3d3 < 2`, `30d29 < 1`, `32c31,32` (`< branding: clean (736 files scanned)` against `> 1`, `> branding: clean (738 files scanned)`), `diff 1` | four hunks, `diff 1` |
| Control (c), added: the current handoff with the first U2-1 out cell changed from `5` to `2` | `1a2 > 5`, `3d3 < 2`, `diff 1` | not stated; shows that a single false cell reds |
| Control (d), added: the current handoff with the Branch sha set to `be13a210` | first hunk `1c1 < 441a8638 > be13a210`, `diff 1` | the sha line diffs first, as the row says |

## U2 rows at 441a8638 (from the P8 re-run output)

| Row | Evidence | Expect | Negative control | State |
|---|---|---|---|---|
| U2-1 | `5 2 3 0 1` | `1+ 1+ 1+ 0 1` | at B: `0 0 0 5 1` | 🟢 |
| U2-2 | `1 1 1 ok` | `1+` x3, `ok` | at B: `0 0 0 ok` | 🟢 |
| U2-3 | `:0 :0 :0`, `0` | `0` x4 | at B: `:2 :1 :1`, `1` | 🟢 |
| U2-4 | nine `1`s, `1`, `42` | nine `1`s, `1`, `42`+ | at B: nine `0`s, `0`, `33` | 🟢 |
| U2-5 | `2 1 1 1 2 1` | each `1`+ | at B: six `0`s | 🟢 |
| U2-6 | `0 1 0 0 1 3 2 2 0 1 1 1` | `0 1 0 0 1+ 1+ 1+ 1+ 0 1+ 1 1` | at be13a210: `1 1 0 1 0 3 2 2 1 0 1 1` | 🟢 |

## P rows

| Row | Evidence | Negative control | State |
|---|---|---|---|
| P1 | at 441a8638, `pgrep` `0`: `exit 0`, `✓ all 50 test files passed`, `50`, tree `0` | scrim sed: `exit 1`, `✗ 1/50 test file(s) failed` (run while `pgrep` printed `2`; a red under load is still a red) | 🟢 |
| P2 | not run, owed at pre-land (U2 touches no bundled file) | none | owed |
| P3 | `branding: clean (741 files scanned)`, `0`, raw `2`. Both raw lines are U3 records (`.sdlc/reviews/docs-repair-U3-progress.md`, `.sdlc/verdicts/docs-repair-U3-review.md`). U2's own added lines that carry the glyph: `0` | one glyph line appended to `glossary.md`: second command `1` | 🟢 |
| P4 | `0`, `0`, `0`, `0` | the four-name fixture: `2` | 🟢 |
| P5 | `1`, `✓ citations: parser self-test + STALE 0 across 10 discovered docs (HEAD 4a6fc9dc)`, `exit 0` | not re-run (pass 1 verdict ran it; U2 pass 2 touches no cited doc) | 🟢 |
| P6 | U2's files: none. Plan-wide: `2` (`ui-plan.md`, U1). Drawer Colors `10` | the tree at B: `15` | 🟢 U2 share, 🟡 plan-wide (F4) |
| P7 | `H=441a8638`, `ancestor`, `0` | Branch field with no sha: `NO-HEAD`. With H set to `be13a210`: `4` | 🟢 |
| P8 | `H=441a8638`, `HAS-RAN`, `1 1 1 1 1 1`, `diff 0` (table above) | controls (a) to (d) above: `NO-RAN` and `diff 0` on the pass 1 handoff, `diff 1` on each doctored one | 🟢 |

## Pass 1 findings

| Pass 1 | Result | Evidence from code |
|---|---|---|
| F1 (false Ran cells) | fixed | The Ran table is replaced by the `ran` pair, and P8 prints `diff 0` at 441a8638. U2-1's first figure is `5` and U2-5 reads `this.view` 2, `colorMode` 1. The branding count is `741`, reproduced. |
| F3a Section | fixed | `grep -c -w section src/ui/persist.js` prints `0`. The app prefs write at `app.js:2297` stores theme, canvasTheme, colorMode, motion and fontMode, and no section. `section` appears as a key in no `src/ui` source. The row now attaches "never persisted" to `this.section`, not to the frame. |
| F3b Inspector | fixed | `.seg-example` is built at `app.js:1952` (`...this.exampleArtifacts(view)`, defined `app.js:2041`), `typography.js:615` (`this.typeExampleCard(view)`, defined `:1031`) and `geometry.js:718` (`this.geomExampleCard(view)`, defined `:885`). `live control` is gone from the glossary. |
| F3c Analysis card | fixed | `renderLeftPane` (`app.js:1531`) picks `analysisCards` / `typeAnalysisCards` / `geomAnalysisCards` on `this.section` at `:1539` to `:1541`. Those three methods live in `sections/color.js:13`, `typography.js:16` and `geometry.js:573`, and each builds `.an-card`. No section file defines `renderLeftPane`. |

## Diff against the plan branch

`git diff --stat c1d09fb9 4a6fc9dc`: `glossary.md` (3 lines changed) and the handoff. Pass 2 changed no other file. Commit A adds no line with U+2014. Pass 1 files are unchanged since the pass 1 verdict.
