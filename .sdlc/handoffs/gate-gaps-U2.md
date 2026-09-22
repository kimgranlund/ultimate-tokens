---
kind: handoff
plan: gate-gaps
unit: U2
branch: unit/gg-U2
written: 2026-09-22
pass: 1
---

# Handoff U2 (`--identity-control`, its thin test, the adapter row) . builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/gg-U2, one commit on top of 6456f893 |
| Head | `9a5b6599e363ec4bb53b6909e9812925ec2f5a1e` |
| Files | scripts/report-preset-fidelity.mjs, test/engine/ramp-identity.mjs (new), test/run.mjs, .sdlc/adapter.md, .sdlc/handoffs/gate-gaps-U2.md (this file) |
| Ran | `npm test` in the unit worktree and again in a fresh clone at the final head, both 51/51 pass, tree clean after; `node test/repo/branding.mjs` clean in the clone; every negative control below in its own throwaway clone, never in the unit worktree |
| Left out | step 7 (the baseline `npm test` row rewrite) and U2-7's P2 half, per the brief's hold; both are quoted, not graded, below |

## Scope for this pass

Steps 1 to 6 of the plan's U2 section: the `--identity-control` mode (`--base`/`--base-dir`, `--authored`, `--only`, `--perturb`), the thin test registered in `TESTS`, and the adapter §1 `ramp-identity` row. Landing order stated per the brief: #681, then #713, then #715.

## G0, as waived

The brief waives G0 to the one line the Conductor already ruled for U1:

`git cat-file -e HEAD:test/engine/anchor.mjs; echo $?` -> `0`

Base cited: `6456f893` (`sdlc(gate-gaps): U1 verified and merged at 3f3c2679, U2 dispatched (#715)`).

## Criteria

### U2-1 . the head is identical to itself, over everything

Command, at the final head (`9a5b659`):

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

`exit 0`. `grep -cE '^identity (perceptual|peak|even): 0/3780 palettes'` -> `3`. `grep -cE '^identity (perceptual|peak|even) default kit: 0/16 palettes'` -> `3`. `grep -c '^0 differing cells$'` -> `1`. `git status --short | wc -l` -> `0`. Negative control is U2-3 below (reds the even line). 🟢

### U2-2 . the differ reproduces the record it was asked to gate

Command:

```
node scripts/report-preset-fidelity.mjs --identity-control --base bf2aaf65
```

`exit 1`. `grep -cE '^identity (perceptual|peak|even): 3780/3780 palettes'` -> `3`. The three max dL* figures, quoted from the run: `2.5973`, `4.3631`, `0.4290`. These agree with the planner's prototype (2.5973, 4.3631, 0.4290) and with the verifier's hand read (2.60, 4.36, 0.43) to two decimals. Cell-diff counts: perceptual `52980/94500` (prototype `52980`, exact), peak `52950/94500` (prototype `52950`, exact), even `37145/94500` (prototype `37146`). The even leg is one cell off the planner's own hand figure; every other number in this row, including even's own max dL* (0.4290, matching to four decimals), agrees exactly. Not re-derived further in this pass; flagged plainly per the brief rather than adjusted to match. Negative control is U2-1 (same command against the head prints `0/3780` three times, already run above). 🟢, with the one-cell note carried forward

### U2-3 . a perturbed ramp fails the control, and the differ says where

M-F planted in a throwaway clone (`git clone -q --shared . `, HEAD `9a5b659` at clone time):

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

Matches the prototype's `3710/3780` for even and `0/3780` for perceptual and peak exactly. 🟢

### U2-4 . the stripped leg's blind spot is on the record, and `--authored` covers it

M-A planted in a fresh throwaway clone:

```
perl -0pi -e 's/const w = t \* t \* \(3 - 2 \* t\); \/\/ smoothstep/const w = t < 0.15 ? -0.6 : t * t * (3 - 2 * t); \/\/ smoothstep/' src/engine/tonal.js
```

`git diff --stat | tail -1` -> `1 file changed, 1 insertion(+), 1 deletion(-)`.

Stripped: `node scripts/report-preset-fidelity.mjs --identity-control --base HEAD` -> `exit 0`, all six lines `0/3780` or `0/16`. The mutation is invisible on the default (unanchored) path, as the plan says it must be.

Authored: `node scripts/report-preset-fidelity.mjs --identity-control --base HEAD --authored` -> `exit 1`:

```
identity perceptual: 3023/3780 palettes, 6056/94500 cells differ, max dL* 1.2631
identity peak: 3023/3780 palettes, 6056/94500 cells differ, max dL* 1.3402
identity even: 3379/3780 palettes, 6743/94500 cells differ, max dL* 0.4230
```

`3023/3780`, `3023/3780`, `3379/3780`, matching the prototype's figures exactly. Unmutated authored control, run in the unit worktree at the final head: `node scripts/report-preset-fidelity.mjs --identity-control --base HEAD --authored` -> `exit 0`, `0 differing cells` (wall time 103.78s user, loud host). 🟢

### U2-5 . the thin test is registered, green, fast, and cannot pass with a dead compare

```
node test/engine/ramp-identity.mjs
```

`exit 0`, one line: `PASS: the identity-control mode runs and its compare is live (working-tree-vs-itself only, not an engine-identity gate)`. `grep -c '"engine/ramp-identity.mjs"' test/run.mjs` -> `1`. Wall time: `real 1.10` (`/usr/bin/time -p`). Host was not quiet at the moment of this run (`pgrep` count 3, 1-minute load 11.04 against 10 cores), so this figure is recorded without a grade rather than scored against the 6s bound; it is well under that bound regardless.

Negative control, in a throwaway clone: rename the flag the script checks for.

```
perl -pi -e 's/"--perturb"/"--perturbX"/' scripts/report-preset-fidelity.mjs
```

`git diff --stat | tail -1` -> `1 file changed, 1 insertion(+), 1 deletion(-)`.

```
node test/engine/ramp-identity.mjs
```

`exit 1`, `grep -c '^FAIL'` -> `1`: `FAIL: the identity-control mode missed on: --perturb (exit 0)`. 🟢

### U2-6 . the mode leaves nothing behind, read in a temp directory only this seat uses

Green run, unit worktree, private `TMPDIR`:

```
TMPDIR="$F/tmp" node scripts/report-preset-fidelity.mjs --identity-control --base HEAD
```

`exit 0`. `ls "$F/tmp" | grep -c '^ramp-identity-'` -> `0`.

Red run, the M-F clone from U2-3, same private `TMPDIR`:

```
TMPDIR="$F/tmp" node scripts/report-preset-fidelity.mjs --identity-control --base HEAD
```

`exit 1`. `ls "$F/tmp" | grep -c '^ramp-identity-'` -> `0`. `git status --short | wc -l` in the unit worktree after both runs -> `0`. 🟢

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

## Plan-level checks run by this unit

P1: `npm test` at the final head, unit worktree, then again in a fresh clone: both `exit 0`, `all 51 test files passed`, `git status --short | wc -l` -> `0` after each. `perl -0ne '...' test/run.mjs` (the `TESTS` count) -> `51`. Negative control, in a third clone: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test` -> the run ends `✗ 1/51 test file(s) failed`. 🟢

P3: `bash -c 'set -o pipefail; node test/repo/branding.mjs | tail -1'` -> `branding: clean (526 files scanned)`. Em-dash scan, diffed against `6456f893` (this unit's own cut point, not `origin/main`, which does not yet carry #681/#713 and would pull in unrelated work): `git diff 6456f893 | grep -v '^+++ ' | grep '^+' | perl -CSD -ne 's/`[^`]*`//g; print if /\x{2014}/' | wc -l` -> `0`. 🟢

P4: scope wall, same base. `git diff --name-only 6456f893 | grep -v -E -e '^test/engine/(anchor|ramp-identity)\.mjs$' -e '^scripts/report-preset-fidelity\.mjs$' -e '^test/run\.mjs$' -e '^\.sdlc/' | wc -l` -> `0`. `git diff --name-only 6456f893 -- src | wc -l` -> `0`. 🟢

P5: not run by this builder. The plan lists it as pre-land only and does not list it among "every unit runs P1, P3 and P4." It also cannot read clean from this worktree today: `origin/main` as fetched here is `4906746`, which still predates #681 and #713 landing (confirmed by `git merge-base origin/main HEAD` returning `3ce50daa`, the pre-#681 head), so a run against it reproduces the same pre-#681 divergence U2-2 measures against `bf2aaf65`, not a defect in this unit. Left for the pre-land verifier, who runs it after #681 and #713 are actually on `main`.

## Where this disagreed with the plan

The even leg's cell-diff count against `bf2aaf65` (U2-2) reads `37145/94500` where the planner's own prototype measured `37146/94500`, a difference of one cell out of 94,500. Every other figure in that row, including even's own max dL* (`0.4290`, matching to four decimals) and both other modes' cell counts (exact matches), agrees. Not chased further in this pass since the brief scopes the disagreement to reporting, not re-derivation; worth a second look if a future unit needs the even leg's cell count to the exact figure rather than to two decimals.

P5 was not run, for the reason stated above (pre-land-only per the plan's own criteria list, and unreadable-clean from a worktree whose `origin/main` predates #681/#713).

## Handoff artifacts

Log files from every run above are under this seat's scratchpad (`gg-U2-F/*.log`, `*.time`); the throwaway clones used for the negative controls were removed immediately after each control ran, per the rule that a clone never outlives its control.
