---
kind: handoff
plan: gate-gaps
unit: U2
branch: unit/gg-U2
written: 2026-09-22
pass: 2
---

# Handoff U2 (`--identity-control`, its thin test, the adapter row) . builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/gg-U2, three commits on top of 6456f893 (9a5b6599 pass 1 code, e823cf18 pass 1 handoff, 252e525b pass 2 code) |
| Head | `252e525b20a57340e0553fe4cd4320c0c4faba1c` |
| Files (pass 2) | scripts/report-preset-fidelity.mjs, test/engine/ramp-identity.mjs, .sdlc/adapter.md, .sdlc/handoffs/gate-gaps-U2.md (this file) |
| Ran | `npm test` in a fresh clone at the pass-2 final head, `all 51 test files passed`, `git status --short` empty after; `node test/repo/branding.mjs` -> `branding: clean (527 files scanned)` in the same clone; every negative control below in its own throwaway clone, never in the unit worktree |
| Left out | step 7 (the baseline `npm test` row rewrite) and U2-7's P2 half, per the brief's hold; both are quoted, not graded, below. F3 (the plan-level base-tree-only blind spot) is untouched pending the Conductor's ruling, per the rework brief |

## Scope for this pass

Steps 1 to 6 of the plan's U2 section: the `--identity-control` mode (`--base`/`--base-dir`, `--authored`, `--only`, `--perturb`), the thin test registered in `TESTS`, and the adapter §1 `ramp-identity` row. Landing order stated per the brief: #681, then #713, then #715.

## G0, as waived

The brief waives G0 to the one line the Conductor already ruled for U1:

`git cat-file -e HEAD:test/engine/anchor.mjs; echo $?` -> `0`

Base cited: `6456f893` (`sdlc(gate-gaps): U1 verified and merged at 3f3c2679, U2 dispatched (#715)`).

## Criteria

### U2-1 . the head is identical to itself, over everything

Command, rerun at pass 2's final head (`252e525b`), in a fresh clone:

```
node scripts/report-preset-fidelity.mjs --identity-control --base HEAD
```

Output:

```
identity perceptual: 0/3780 palettes, 0/94500 cells differ, max dL* 0.0000
identity peak: 0/3780 palettes, 0/94500 cells differ, max dL* 0.0000
identity even: 0/3780 palettes, 0/94500 cells differ, max dL* 0.0000
identity perceptual default kit: 0/16 palettes, 0/400 cells differ, max dL* 0.0000
identity peak default kit: 0/16 palettes, 0/400 cells differ, max dL* 0.0000
identity even default kit: 0/16 palettes, 0/400 cells differ, max dL* 0.0000
0 differing cells
```

`exit 0`. `grep -cE '^identity (perceptual|peak|even): 0/3780 palettes'` -> `3`. `grep -cE '^identity (perceptual|peak|even) default kit: 0/16 palettes'` -> `3`. `grep -c '^0 differing cells$'` -> `1`. `git status --short | wc -l` -> `0`. Negative control is U2-3 below (reds the even line). Unchanged from pass 1's own reading at head `9a5b659`. 🟢

### U2-2 . the differ reproduces the record it was asked to gate

Command:

```
node scripts/report-preset-fidelity.mjs --identity-control --base bf2aaf65
```

`exit 1`. `grep -cE '^identity (perceptual|peak|even): 3780/3780 palettes'` -> `3`. Cell-diff counts: perceptual `52980/94500` (prototype `52980`, exact), peak `52950/94500` (prototype `52950`, exact), even `37145/94500` (prototype `37146`). The even leg is one cell off the planner's own hand figure; every other number in this row, including even's own max dL* (0.4290, matching to four decimals), agrees exactly. Not re-derived further in this pass; flagged plainly per the brief rather than adjusted to match.

The third command, byte for byte (head `9a5b659`, run at pass 1, not rerun at pass 2 since nothing in the pass-2 code change touches the render or compare path):

```
node scripts/report-preset-fidelity.mjs --identity-control --base bf2aaf65 | sed 's/.*max dL\* //'
```

```
2.5973 (e.g. architecture/The Barbican Estate · 1976 · Chamberlin, Powell & Bon · London/neutral at stop 75, architecture/The Barbican Estate · 1976 · Chamberlin, Powell & Bon · London/neutral at stop 100, architecture/The Barbican Estate · 1976 · Chamberlin, Powell & Bon · London/neutral at stop 125)
4.3631 (e.g. architecture/The Barbican Estate · 1976 · Chamberlin, Powell & Bon · London/neutral at stop 100, architecture/The Barbican Estate · 1976 · Chamberlin, Powell & Bon · London/neutral at stop 125, architecture/The Barbican Estate · 1976 · Chamberlin, Powell & Bon · London/neutral at stop 150)
0.4290 (e.g. architecture/The Barbican Estate · 1976 · Chamberlin, Powell & Bon · London/neutral at stop 100, architecture/The Barbican Estate · 1976 · Chamberlin, Powell & Bon · London/neutral at stop 125, architecture/The Barbican Estate · 1976 · Chamberlin, Powell & Bon · London/neutral at stop 150)
0.3508 (e.g. default-kit/Neutral at stop 75, default-kit/Neutral at stop 100, default-kit/Neutral at stop 125)
0.4111 (e.g. default-kit/Neutral at stop 100, default-kit/Neutral at stop 125, default-kit/Neutral at stop 150)
0.3471 (e.g. default-kit/Neutral at stop 75, default-kit/Neutral at stop 100, default-kit/Neutral at stop 125)
143592 differing cells
```

The first three lines' leading figures (`2.5973`, `4.3631`, `0.4290`) agree with the planner's prototype and with the verifier's hand read (2.60, 4.36, 0.43) to two decimals. Negative control is U2-1 (same command against the head prints `0/3780` three times, already run above). 🟢, with the one-cell note carried forward

### U2-3 . a perturbed ramp fails the control, and the differ says where

M-F planted in a throwaway clone (`git clone -q --shared . `), rerun at pass 2's final head (`252e525b` at clone time):

```
perl -pi -e 's/^export const EVEN_DAMP_FACTOR = 0\.25;/export const EVEN_DAMP_FACTOR = 0.3;/' src/engine/tonal.js
```

`git diff --stat | tail -1` -> `1 file changed, 1 insertion(+), 1 deletion(-)`.

```
node scripts/report-preset-fidelity.mjs --identity-control --base HEAD
```

`exit 1`. Output (the three corpus lines):

```
identity perceptual: 0/3780 palettes, 0/94500 cells differ, max dL* 0.0000
identity peak: 0/3780 palettes, 0/94500 cells differ, max dL* 0.0000
identity even: 3710/3780 palettes, 53822/94500 cells differ, max dL* 0.3866
```

Matches the prototype's `3710/3780` for even and `0/3780` for perceptual and peak exactly. Unchanged from pass 1's own reading at head `9a5b659`. 🟢

### U2-4 . the stripped leg's blind spot is on the record, and `--authored` covers it

M-A planted in a fresh throwaway clone:

```
perl -0pi -e 's/const w = t \* t \* \(3 - 2 \* t\); \/\/ smoothstep/const w = t < 0.15 ? -0.6 : t * t * (3 - 2 * t); \/\/ smoothstep/' src/engine/tonal.js
```

`git diff --stat | tail -1` -> `1 file changed, 1 insertion(+), 1 deletion(-)`.

Stripped: `node scripts/report-preset-fidelity.mjs --identity-control --base HEAD` -> `exit 0`. Head `9a5b659`, not rerun at pass 2 (nothing in the pass-2 code change touches the render or compare path). Six lines, byte for byte:

```
identity perceptual: 0/3780 palettes, 0/94500 cells differ, max dL* 0.0000
identity peak: 0/3780 palettes, 0/94500 cells differ, max dL* 0.0000
identity even: 0/3780 palettes, 0/94500 cells differ, max dL* 0.0000
identity perceptual default kit: 0/16 palettes, 0/400 cells differ, max dL* 0.0000
identity peak default kit: 0/16 palettes, 0/400 cells differ, max dL* 0.0000
identity even default kit: 0/16 palettes, 0/400 cells differ, max dL* 0.0000
0 differing cells
```

The mutation is invisible on the default (unanchored) path, as the plan says it must be.

Authored: `node scripts/report-preset-fidelity.mjs --identity-control --base HEAD --authored` -> `exit 1`:

```
identity perceptual: 3023/3780 palettes, 6056/94500 cells differ, max dL* 1.2631
identity peak: 3023/3780 palettes, 6056/94500 cells differ, max dL* 1.3402
identity even: 3379/3780 palettes, 6743/94500 cells differ, max dL* 0.4230
```

`3023/3780`, `3023/3780`, `3379/3780`, matching the prototype's figures exactly. Unmutated authored control, run in the unit worktree at the final head: `node scripts/report-preset-fidelity.mjs --identity-control --base HEAD --authored` -> `exit 0`, `0 differing cells`. Wall time, measured fresh at pass 2 head `252e525b` with `/usr/bin/time -p` (the render path this command exercises is unchanged from pass 1): `real 50.38`, `user 50.74`, `sys 0.20`. Load 3.18 before, 3.36 after (loud host, not graded on time). The pass-1 figure this replaces ("wall time 103.78s user") mixed the `real` and `user` labels; this reading is the `real` one, correctly labelled. 🟢

### U2-5 . the thin test is registered, green, fast, and cannot pass with a dead compare

Rerun at pass 2's final head (`252e525b`), since the code change touches `test/engine/ramp-identity.mjs` itself (F8: the no-base child's stdio is piped rather than inherited).

```
node test/engine/ramp-identity.mjs
```

`exit 0`, one line: `PASS: the identity-control mode runs and its compare is live (working-tree-vs-itself only, not an engine-identity gate)`. Stderr is now empty on this green run (`0` lines; pass 1 leaked two `usage:` lines onto stderr through execFileSync's inherited stdio, closed by F8). `grep -c '"engine/ramp-identity.mjs"' test/run.mjs` -> `1`. Wall time: `real 0.632`, `user 0.66` (`time`). Host was not quiet at the moment of this run (`pgrep` count 0, load 5.17 before / 4.91 after against 10 cores, at or above the 5 rule), so this figure is recorded without a grade rather than scored against the 6s bound; it is well under that bound regardless.

Negative control, in a throwaway clone: rename the flag the script checks for.

```
perl -pi -e 's/"--perturb"/"--perturbX"/' scripts/report-preset-fidelity.mjs
```

`git diff --stat | tail -1` -> `1 file changed, 1 insertion(+), 1 deletion(-)`.

```
node test/engine/ramp-identity.mjs
```

`exit 1`, `grep -c '^FAIL'` -> `1`: `FAIL: the identity-control mode missed on: --perturb (exit 0): identity perceptual default kit: 0/16 palettes, 0/400 cells differ, max dL* 0.0000` (plus the remaining two default-kit lines and `0 differing cells`, now surfaced in the miss message since F8 captures rather than discards the child's output). 🟢

### U2-6 . the mode leaves nothing behind, read in a temp directory only this seat uses

Rerun at pass 2's final head (`252e525b`).

Green run, private `TMPDIR`, checked mid-run:

```
TMPDIR="$F/tmp" node scripts/report-preset-fidelity.mjs --identity-control --base HEAD --only default-kit
```

`exit 0`. `ls "$F/tmp" | grep -c '^ramp-identity-'` mid-run -> `1` (TMPDIR is honoured and the count is not vacuous), after exit -> `0`.

Red run, the M-F clone from U2-3, same private `TMPDIR`:

```
TMPDIR="$F/tmp" node scripts/report-preset-fidelity.mjs --identity-control --base HEAD --only default-kit
```

`exit 1`. `ls "$F/tmp" | grep -c '^ramp-identity-'` -> `0`. `git status --short | wc -l` in the unit worktree after both runs -> `0`.

F2's missing control, added: removing only `exitIdentity`'s `rmSync` call leaves the count at `0`, because the `process.on("exit")` backstop still cleans up. The control only bites when both `rmSync` sites are removed:

```
process.on("exit", () => { try { rmSync(scratch, { recursive: true, force: true }); } catch { /* best effort */ } });
```

and

```
function exitIdentity(code) {
  if (scratch) { try { rmSync(scratch, { recursive: true, force: true }); } catch { /* best effort */ } }
  process.exit(code);
}
```

Both removed, in a throwaway clone. `git diff --stat | tail -1` -> `1 file changed, 1 insertion(+), 2 deletions(-)`.

```
TMPDIR="$F/tmp" node scripts/report-preset-fidelity.mjs --identity-control --base HEAD --only default-kit
```

`exit 0`. `ls "$F/tmp" | grep -c '^ramp-identity-'` after exit -> `1`, so the control bites only when both edits land, and it does. 🟢

### U2-7 . the records agree

Adapter row: `grep -c '^| ramp-identity | ' .sdlc/adapter.md` -> `1`.

P2 half, held per the brief: this plan's own baseline delta is not written until the Conductor rules on step 7 (#713 U6b also rewrites the `tests` and `ui.html` rows). Quoted at the final head, not graded:

```
sh .sdlc/checks/baseline-agrees-check.sh
```

`exit 1`.

```
STALE head: baseline ref 20298cc has the same tree as HEAD outside .sdlc/ and .gitignore
ok    head: baseline ref 20298cc is in origin/main's history
STALE tests: baseline 48, test/run.mjs TESTS 51
STALE ui.html: baseline 3780.5 KB, tree 4111.1 KB
stale total: 3
```

`grep -c -E '^STALE (tests|ui\.html|time )'` -> `2`. `grep '^STALE ' | grep -v -c '^STALE head'` -> `2`. Both above `0`, as expected on a unit branch ahead of #713's U6b refresh; a blocker at pre-land, not here. 🟡, held

### F6/F7 demonstration . a full run that loads no palettes is a vacuity FAIL, and the FAIL line prints last

A base tree whose 8 category files each have an empty `PRESETS` array and whose `defaultDocument()` returns `palettes: []`, in a throwaway clone at pass 2's final head:

```
node scripts/report-preset-fidelity.mjs --identity-control --base-dir <that clone>
```

```
identity perceptual: 0/0 palettes, 0/0 cells differ, max dL* 0.0000
identity peak: 0/0 palettes, 0/0 cells differ, max dL* 0.0000
identity even: 0/0 palettes, 0/0 cells differ, max dL* 0.0000
identity perceptual default kit: 0/0 palettes, 0/0 cells differ, max dL* 0.0000
identity peak default kit: 0/0 palettes, 0/0 cells differ, max dL* 0.0000
identity even default kit: 0/0 palettes, 0/0 cells differ, max dL* 0.0000
FAIL: vacuity, rendered 0 of 0 loaded palette(s)
```

`exit 1`. The `FAIL` line is the last line, and no `differing cells` total prints on this path, so `grep -c '^0 differing cells$'` on this output is `0`, never a false green.

### PRESETS exit-2 case

A base tree whose `src/ui/categories/architecture.js` renames its `PRESETS` export away, in a throwaway clone:

```
node scripts/report-preset-fidelity.mjs --identity-control --base-dir <that clone> --only architecture
```

```
usage: base tree at <that clone> category architecture is missing the export PRESETS
```

`exit 2`, naming the missing export, in place of the pass-1 uncaught `TypeError` this same setup produced before the fix.

## Plan-level checks run by this unit

P1: `npm test` at the final head, unit worktree, then again in a fresh clone: both `exit 0`, `all 51 test files passed`, `git status --short | wc -l` -> `0` after each. `perl -0ne '...' test/run.mjs` (the `TESTS` count) -> `51`. Negative control, in a third clone: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test` -> the run ends `✗ 1/51 test file(s) failed`. 🟢

Rerun at pass 2's final head (`252e525b`), fresh clone: `exit 0`, `✓ all 51 test files passed`, `git status --short | wc -l` -> `0` after. 🟢

P3: `bash -c 'set -o pipefail; node test/repo/branding.mjs | tail -1'` -> `branding: clean (526 files scanned)`. Em-dash scan, diffed against `6456f893` (this unit's own cut point, not `origin/main`, which does not yet carry #681/#713 and would pull in unrelated work): `git diff 6456f893 | grep -v '^+++ ' | grep '^+' | perl -CSD -ne 's/`[^`]*`//g; print if /\x{2014}/' | wc -l` -> `0`. 🟢

Rerun at pass 2's final head (`252e525b`), fresh clone: `node test/repo/branding.mjs` -> `branding: clean (527 files scanned)` (one file more than pass 1's reading, the growth of this handoff file itself). 🟢

P4: scope wall, same base. `git diff --name-only 6456f893 | grep -v -E -e '^test/engine/(anchor|ramp-identity)\.mjs$' -e '^scripts/report-preset-fidelity\.mjs$' -e '^test/run\.mjs$' -e '^\.sdlc/' | wc -l` -> `0`. `git diff --name-only 6456f893 -- src | wc -l` -> `0`. 🟢

P5: not run by this builder. The plan lists it as pre-land only and does not list it among "every unit runs P1, P3 and P4." It also cannot read clean from this worktree today: `origin/main` as fetched here is `4906746`, which still predates #681 and #713 landing (confirmed by `git merge-base origin/main HEAD` returning `3ce50daa`, the pre-#681 head), so a run against it reproduces the same pre-#681 divergence U2-2 measures against `bf2aaf65`, not a defect in this unit. Left for the pre-land verifier, who runs it after #681 and #713 are actually on `main`.

## Where this disagreed with the plan

The even leg's cell-diff count against `bf2aaf65` (U2-2) reads `37145/94500` where the planner's own prototype measured `37146/94500`, a difference of one cell out of 94,500. Every other figure in that row, including even's own max dL* (`0.4290`, matching to four decimals) and both other modes' cell counts (exact matches), agrees. Not chased further in this pass since the brief scopes the disagreement to reporting, not re-derivation; worth a second look if a future unit needs the even leg's cell count to the exact figure rather than to two decimals.

P5 was not run, for the reason stated above (pre-land-only per the plan's own criteria list, and unreadable-clean from a worktree whose `origin/main` predates #681/#713).

## Handoff artifacts

Log files from every run above are under this seat's scratchpad (`gg-U2-F/*.log`, `*.time`, pass 1) and `gg-U2-p2/` (pass 2); the throwaway clones used for the negative controls were removed immediately after each control ran, per the rule that a clone never outlives its control.

## Pass 2

Review verdict: FIX-FIRST at `9a5b6599` (this unit's pass-1 code head, quoted `e823cf18` for the pass-1 handoff). Code fix commit `252e525b`, on top of `e823cf18`.

| Finding | What was done | Head |
|---|---|---|
| F1 (adapter time cell not measured) | Timed a fresh stripped run (`real 14.63`, load 3.54/3.19) and a fresh authored run (`real 50.38`, load 3.18/3.36), both against the working tree itself, and restated the `.sdlc/adapter.md` `ramp-identity` row's time cell from these two measured `real` figures, each marked loud with its load reading. No CPU time, no prototype figures. | `252e525b` |
| F2 (U2-6 cleanup-removal control missing) | Added the control to the U2-6 section: removing only `exitIdentity`'s `rmSync` leaves the count at `0` (the `process.on("exit")` backstop still cleans), both `rmSync` sites removed (diff-stat `1 file changed, 1 insertion(+), 2 deletions(-)`) leaves `1`. Both edits cited in the handoff. | `252e525b` (control run in a throwaway clone) |
| F3 (plan-level: base-tree-only coverage) | Nothing added, per the brief; this is the Conductor's ruling to make, not a builder fix. Noted in the "Left out" row above. | n/a |
| F4 (U2-2/U2-4 quotes paraphrased) | U2-2's third command (the `sed` line) now quoted whole, all six lines, reconstructed from the pass-1 run's own archived log by piping that unchanged output through the same `sed` expression (no rerun of the render). U2-4's stripped run now quotes all six lines byte for byte from the same pass-1 log, rather than "all six lines `0/3780` or `0/16`". | `9a5b659` (the bytes), reconstructed at `252e525b` |
| F5 (wall time labelled `user`) | U2-4's unmutated authored control now cites the fresh F1 authored timing (`real 50.38`, `user 50.74`, `sys 0.20`), correctly labelled, replacing the mislabelled pass-1 figure ("wall time 103.78s user"). | `252e525b` |
| F6 (vacuity FAIL wording/exit code; PRESETS not in NEED) | `runIdentityControl`: a full run that loads no palettes now folds into the same vacuity path as a short render count (exit 1, a `FAIL`-opening line), not a usage exit 2. A base category missing its `PRESETS` export now exits 2 naming the category and the missing export, instead of an uncaught `TypeError`. Both demonstrated fresh in the "F6/F7 demonstration" and "PRESETS exit-2 case" sections above. | `252e525b` |
| F7 (vacuity FAIL not last / `0 differing cells` still readable) | The vacuity path now prints its `FAIL` line last and returns before the `${totalDiff} differing cells` total, so `grep '^0 differing cells$'` cannot read a vacuity failure as green. Demonstrated above. | `252e525b` |
| F8 (no-base child's stderr leaks; dash stand-ins) | `test/engine/ramp-identity.mjs`'s `run()` now passes explicit `stdio: ["ignore", "pipe", "pipe"]`, so a green `npm test` prints no `usage:` lines; a miss now surfaces the captured stdout/stderr in the failure message instead of discarding it. Confirmed with a direct `node test/engine/ramp-identity.mjs 2>file 1>file` split: stderr is empty on green. Prose ` -- ` dash stand-ins this unit added, in both files, replaced with a colon or a comma; pre-existing dashes in the file's original header comment (not added by this unit) left untouched. | `252e525b` |

Reruns at `252e525b`: U2-1, U2-3, U2-5 (and its control), U2-6 (and its new control), the new vacuity FAIL case, and the new PRESETS exit-2 case, all above. U2-2 and U2-4 were not rerun: this pass's code change touches `runIdentityControl`'s vacuity/NEED-check branches and the test harness's `stdio`, never `identityRender` or `sweep` (the render/compare path U2-2 and U2-4 exercise), so their cell-diff and max-dL* figures are unchanged from pass 1; only their quoted bytes and one mislabelled timing were corrected, from the pass-1 log files and a fresh F1 timing run respectively. `npm test` once in a clone at `252e525b`: `all 51 test files passed`, tree clean after. `node test/repo/branding.mjs`: `branding: clean (527 files scanned)`.
