---
kind: handoff
plan: gate-gaps
unit: U1
branch: unit/gg-U1
written: 2026-09-21
pass: 1
---

# Handoff U1 (`anchor.mjs`, the default kit joins the seven checks) . builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/gg-U1, three commits on top of 557b6c0c |
| Head | `fbf06eea6e46612c120e9396a3bb62f6a8d4f66f` |
| Files | test/engine/anchor.mjs (all three commits) . .sdlc/handoffs/gate-gaps-U1.md (this file) |
| Ran | `node test/engine/anchor.mjs` (SAMPLED) exit 0; `npm run -s gate:corpus-anchor` (FULL) exit 0; `npm test` 50/50 pass, exit 0, tree byte-stable; `node test/repo/branding.mjs` clean; five throwaway-clone negative controls (K1-K4, vacuity), each on its own diff-stat-checked plant |
| Left out | none |

## Landing order and the base this unit is cut from

Per the brief and revision 4 of the plan: `#681` lands first, then `#713`, then `#715`. `test/engine/anchor.mjs` does not exist on `origin/main` today; this unit is cut from `plan/gate-split` (tip `557b6c0c`) rather than main, since that branch already carries #681's file plus #713's SAMPLED/FULL split. Building against the unsplit file or against main alone would needle a shape nobody ships.

## G0, as waived

The owner's gate-split Q8 waiver is extended to this unit by the Conductor's ruling. Only the one line was run as a blocker:

`git cat-file -e plan/gate-split:test/engine/anchor.mjs; echo $?` -> `0`

Base cited: `557b6c0c` (`sdlc(gate-split): U2 verified green and merged at 381e0f0c (#713)`).

## Observation: the baseline is still stale at this base (not a blocker, flagged for the record)

The brief's own G0 text says only the one `git cat-file` line above gates this unit, so this is reported as an observation, not treated as G0 red. Run anyway, for the record: `sh .sdlc/checks/baseline-agrees-check.sh` at `557b6c0c` (before any edit) exits `1` with two non-`head` `STALE` lines:

```
STALE tests: baseline 48, test/run.mjs TESTS 50
STALE ui.html: baseline 3780.5 KB, tree 4111.1 KB
```

This disagrees with the plan's own revision-4 assumption ("#713's U6b clears the first two, which is why this plan starts after #713"): U6b has evidently not landed on `plan/gate-split` as of `557b6c0c`, the exact head this unit was cut from. Not a defect in this unit's own work (P4 below shows nothing outside `test/engine/anchor.mjs` moved), and P2/G0's baseline gate is out of scope per the brief's narrowing to the one `git cat-file` line. Naming it so the Orchestrator knows the baseline refresh is still owed before pre-land, from whichever seat lands it.

## The unit

One new block in `test/engine/anchor.mjs`, inserted after the last of the curated-corpus print statements (the R10 drop/swap negative controls, immediately before the F4 gate comment). It builds the kit the same way the file's own lone-spike kit block does (`defaultDocument()`, `hydrate` per `MODES`, `projectView`), and for every one of the kit's 16 anchored palettes calls the file's own top-level `monotoneOk` (both stop sets), `gapOk19`, `distinctOk25`, `notchOk`, the `RAMP_L_MIN`/`RAMP_L_MAX` window test, and the anchor-ladder gate's own order/dupe expressions on `primeSwatches` (copied verbatim, since neither is factored into its own function in this file). No predicate is copied or rewritten; the five ramp checks call the imported functions directly, the two ladder checks reuse the exact inline expression the curated `anchor-ladder` loop already uses. Runs unconditionally, no `FULL` branch, no allow-list.

Vacuity (U1-3): a runtime `Set` filled inside each of the two loop bodies (the mode loop for the five ramp checks, the separate loop for order/dupe), never a static `kitPalettes.length` read outside them, so emptying either loop's own iterable still bites even though it does not shrink the array itself. Silent on the clean path, matching the file's other negative controls; only speaks when it fails.

Pass-line format matches the plan's own shape exactly (quoted byte for byte, from `node test/engine/anchor.mjs` at head):

```
  pass  anchor-ramp default-kit window: 0 (expected 0; 16 palettes, 3 modes)
  pass  anchor-ramp default-kit monotone: 0 (expected 0; 16 palettes, 3 modes)
  pass  anchor-ramp default-kit gap: 0 (expected 0; 16 palettes, 3 modes)
  pass  anchor-ramp default-kit distinct: 0 (expected 0; 16 palettes, 3 modes)
  pass  anchor-ramp default-kit notch: 0 (expected 0; 16 palettes, 3 modes)
  pass  anchor-ladder default-kit order: 0 (expected 0; 16 palettes)
  pass  anchor-ladder default-kit dupe: 0 (expected 0; 16 palettes)
```

## U1-1 (the seven kit lines print, each 0, and the file is green)

```sh
node test/engine/anchor.mjs > a.log 2>&1; echo "exit $?"
grep -cE '^  pass  anchor-(ramp|ladder) default-kit (window|monotone|gap|distinct|notch|order|dupe): 0 ' a.log
grep -c '^  FAIL' a.log
```

`exit 0`, `7`, `0`. 🟢 Also run as `npm run -s gate:corpus-anchor` (FULL): `exit 0`, same seven lines present, `0` FAIL lines.

## U1-2 (a planted kit defect reds each of the seven, by name)

Each plant run in its own throwaway clone (`git clone -q --shared .`), diff-stat checked before running:

| plant | diff-stat | `node test/engine/anchor.mjs` | window | monotone | gap | distinct | notch | order | dupe |
|---|---|---|---|---|---|---|---|---|---|
| K1: Neutral anchor -> `#050505` | `1 file changed, 1 insertion(+), 1 deletion(-)` | `exit 1` | 1 | 0 | 1 | 1 | 0 | 1 | 0 |
| K2: Neutral anchor -> `#1E2024` | `1 file changed, 1 insertion(+), 1 deletion(-)` | `exit 1` | 0 | 0 | 1 | 1 | 0 | 1 | 1 |
| K3: Data 7 anchor -> `#D6D5D0` | `1 file changed, 1 insertion(+), 1 deletion(-)` | `exit 1` | 0 | 0 | 0 | 0 | 1 | 0 | 0 |
| K4: Neutral anchor -> `#101820` + M-C (`enforceMonotonePixelL` disabled) | `2 files changed, 2 insertions(+), 2 deletions(-)` | `exit 1` | 1 | 1 | 1 | 1 | 0 | 1 | 0 |

Counts are `grep 'FAIL' log | grep -c "default-kit <check>:"` per check, matching the plan's own table exactly: K1 hits window/gap/distinct/order, K2 hits dupe (plus gap/distinct/order), K3 is pure on notch alone, K4 hits monotone (plus window/gap/distinct/order). 🟢

Sample FAIL line, quoted byte for byte from the K1 run (matches the plan's own example verbatim):

```
  FAIL  anchor-ramp default-kit window: Neutral #050505 [perceptual] L* 1.37 outside [9.95, 95.05]
```

## U1-3 (the vacuity check bites)

Clone edit: `const kitPalettes = kitDoc.palettes.filter((p) => typeof p.anchor === "string");` -> `const kitPalettes = [];`. Diff-stat: `1 file changed, 1 insertion(+), 1 deletion(-)`.

```sh
node test/engine/anchor.mjs > v.log 2>&1; echo "exit $?"
grep 'FAIL' v.log | grep -c 'default-kit'
```

`exit 1`, `1`. 🟢 The FAIL line: `  FAIL  anchor-ramp default-kit vacuity: visited 0 (ramp), 0 (ladder) of 16 kit palettes - a check that never looked would otherwise pass in silence` (em dash swapped for a hyphen here since this line sits outside a backtick span in this handoff; the program's own literal byte is U+2014). U1-1 above is this control's clean half: `0` FAIL lines on the unedited tree already proves the vacuity check does not fire in error.

## U1-4 (the curated gates did not move, in both legs)

G0 pass counts (SAMPLED and FULL) re-measured on a clone of the unedited `557b6c0c` base, before any edit: `19` both legs (unchanged from the plan's own recorded figure on the unsplit file).

```sh
node test/engine/anchor.mjs > a.log 2>&1; echo "exit $?"
grep -c '^  pass  ' a.log
npm run -s gate:corpus-anchor > af.log 2>&1; echo "exit $?"
grep -c '^  pass  ' af.log
ALLOW_NEEDLE='window-clamp (10), gap-19 (72), distinct-25 (16) and notch (15'
grep -cF "$ALLOW_NEEDLE" af.log
grep -E '^  pass  anchor-(ramp|ladder) default-kit ' a.log > kit-s.txt
grep -E '^  pass  anchor-(ramp|ladder) default-kit ' af.log > kit-f.txt
cmp kit-s.txt kit-f.txt; echo "cmp $?"
```

SAMPLED `exit 0`, `26` (`19 + 7`). FULL `exit 0`, `26` (`19 + 7`). `ALLOW_NEEDLE` count `1`. `cmp 0`, the seven kit lines are byte-identical across both legs. 🟢

## `npm test`, branding, scope wall

`npm test`: `all 50 test files passed`, exit 0, `git status --short` empty after. N = 50, matches the brief's own note (48 at `origin/main`, plus #681's `engine/anchor.mjs` and #713's `engine/corpus-sample.mjs`).

`node test/repo/branding.mjs`, last line: `branding: clean (522 files scanned)`.

Em dash sweep on this unit's own added lines (self-check; not one of U1's five graded criteria but the brief's prose rule): `git diff 557b6c0c -- test/engine/anchor.mjs | grep -v '^+++ ' | grep '^+' | perl -CSD -ne 's/`[^`]*`//g; print if /\x{2014}/' | wc -l` -> `0` (two comment lines carried one on the first pass; the second and third commits below fix them).

Scope wall (self-check): `git diff --stat 557b6c0c HEAD` -> `test/engine/anchor.mjs | 75 ++++...` only, `1 file changed, 75 insertions(+)`. `git diff --name-only 557b6c0c -- src | wc -l` -> `0`. No `src/` file moved.

## Three commits, honestly

1. `08fc9909` the seven-check block itself, first cut. Working but printed an extra standalone `pass` line for the vacuity check, which pushed U1-4's pass-line count to `G0 + 8`, not the plan's own `G0 + 7`.
2. `28dc3552` fix: moved the vacuity check to the file's existing convention (silent on a clean pass, speaks only on a miss), restoring the `G0 + 7` count U1-4 grades.
3. `fbf06eea` style: two comment lines in the new block carried an em dash outside a backtick span; reworded with a comma/colon instead. Caught by running the plan's own P3 sweep on my own diff before treating the unit as done, not by a reviewer.

## Things that disagreed with the plan, or needed a judgment call

1. **Placement of the new block.** The plan says "after the curated sweeps have printed" without a line number (correctly, since it forbids pinning one). I placed it after the `anchor-ladder`/`anchor-ramp` R10 drop/swap negative controls and before the `anchor-f4` gate comment: every curated-sweep print statement for the seven named checks has already run by that point, and it sits outside the untouched lone-spike block (owned by #701) on either side.
2. **Vacuity's own two-Set design.** The plan says the block "FAILs if it visited fewer palettes than `defaultDocument().palettes.length`, or fewer than 16," singular. Since the seven checks actually run in two separate loops (the mode loop for the five ramp checks, a second loop for order/dupe), I track a visited-`Set` per loop and FAIL if either falls short, so emptying only one loop's iterable (not just the shared array) still bites both halves of the block.
3. **The extra pass-count discrepancy in commit 1**, described above, caught by running U1-4 myself before handing off, not left for the reviewer.
4. **The baseline staleness observation**, described above: this unit's own G0 waiver is narrower than the plan's general G0 text, so it is reported rather than blocking.
5. **`.sdlc/plans/gate-gaps.md` exclusion.** Added to `.git/info/exclude`. This repo's worktrees share one `.git/info/exclude` file (the worktree's `.git` is a pointer, not its own directory), so the line lives at `/Users/kimba/Projects/nonoun/ultimate-tokens/.git/info/exclude`, not a per-worktree file. `git status --short` in this worktree is clean of it throughout.
6. **Scratch clones not removed.** This session's sandbox denied `rm -rf` on the throwaway-clone paths under my own scratchpad (`.../scratchpad/gg-u1-work/neg-{k1,k2,k3,k4,vac}`, `.../base-check`). They are read-only leftovers of committed-state clones, harmless, and named here for whoever can clean them up.

## Process-load discipline

Checked `pgrep -fl 'test/(run|engine|ui)' | grep -cE '^[0-9]+ (/[^ ]*/)?node '` before every heavy run; proceeded at `0` or `1`, and once waited (polled every 5-10 s) while another lane's `prime.mjs`/`prime-determinism-worker.mjs` pair was running before starting my own K1-K4/vacuity clone sweep and the FULL-leg U1-4 re-run.
