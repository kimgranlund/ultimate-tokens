---
kind: handoff
plan: gate-split
unit: U2
branch: unit/gs-U2
written: 2026-09-20
pass: 1
---

# Handoff U2 (gate-split, #713) . builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/gs-U2 @ ebb342de |
| Files | test/engine/tonal.mjs, test/engine/corpus-sample.mjs |
| Ran | npm test 50/50 pass, exit 0, tree clean after (run twice across this pass) |
| Left out | none |
| Clones | `/private/tmp/claude-501/-Users-kimba-Projects-nonoun-ultimate-tokens/b2e196e7-c1fa-4f1c-8d62-80e1dfd367c7/scratchpad/gsU2neg/neg2` and `.../neg3` (superseded, cut before the em-dash fixes below; used for the first pass of P3/P5/U2-*) and `.../neg4` (cut at the final head, used to re-verify P3c). None removed (`rm -rf` is refused this session, so each is left in place and named here instead).

## G0, as waived

Per the common brief, G0's `origin/main`/`gh issue view 681` lines are not run as blockers; only:

```
git cat-file -e plan/gate-split:test/engine/anchor.mjs; echo $?
0
```

Merge commit this unit builds on: `ebddc55d`, "sdlc(gate-split): merge plan/preset-intent-fidelity @ a2bb3c84, the #681 tree U2 to U5 build on (#713)".

## Re-observed counts (at G0, before editing)

| Figure | Pinned at 36ce7777 | Re-measured at ebddc55d | Used |
|---|---|---|---|
| `TESTS.length` (P1's N) | 49 (plan text) / 48+U1 | 50 (U1 already merged; the common brief names 50) | 50, confirmed below |
| `node test/engine/tonal.mjs` pass-line count | 19 | 21 | 21 (U2-1's needle, amended) |
| Full corpus | 343 documents, 3780 palettes | 343 documents, 3780 palettes | unchanged |
| Sampled corpus (seed 0) | 35 documents, 392 palettes | 35 documents, 392 palettes | unchanged |

The tonal.mjs pass-line count moved from 19 to 21 between 36ce7777 and ebddc55d (#681's own later units added gates upstream of this one). Not a regression: the FULL run below reproduces exactly 21 pass lines and 0 FAIL lines, with no needle drift on any gate this unit touches.

## What was built

Steps 1 to 6 of the plan's U2 section, in `test/engine/tonal.mjs`:

1. `docs` becomes the one substitution point: `const presets = FULL ? all : sampleCorpus(byCategory);`, then hydrated. `all` is every category's `PRESETS` tagged with `category`; `sampleCorpus` is the shared U1 picker. A vacuity guard follows (FULL requires 343+ docs / 3780+ palettes; SAMPLED requires 30+ docs), and a mode line prints just before the PASS line.
2. `KNOWN_BASELINE_DUP` (C6 ii) and the dip-gate baselines (`DIP_BASELINE`, `EVEN_DIP_BASELINE`, C6 iv) now gate their "every cited name was observed" check behind `FULL &&`; the "no unlisted name" half stays unconditional in both modes.
3. The two dip-gate negative controls (peak, even) and the C6(v) ratchet's sampled ratio-arm control compare the patched engine's count against this run's OWN observed count (`seenBaselineCountByMode`, `peakResult.maxRatio`) under SAMPLED, and against the frozen FULL pin under FULL, never a full-corpus pin a sampled scope cannot reach (the plan's own design-section principle, applied).
4. The `skew-lift-okhsl` (iii b) synthetic grid thins to every fifth hue (`HUES_G.filter((_, i) => i % 5 === SAMPLE_SEED % 5)`) when sampled; `GRID_R2_EXCEPTIONS`' "every cited cell observed" check is FULL-only for the same reason as (2).
5. C6(v)'s monitor line denominator is now the actually-measured palette count (`peakResult.measured`), not the hardcoded FULL figure "3,764": the FAIL comparisons themselves needed no change, since a subset's violator count and max ratio can only undershoot the FULL-measured pins, never exceed them.
6. `test/engine/corpus-sample.mjs` (U1's own registered sampler test) gains the per-category presence assertion the U1 verdict note asked for (U2-6 below).

### Correction: CAP_L_EXCEPTIONS needs no change

The common brief's shared list of pinned lists needing subset semantics names `CAP_L_EXCEPTIONS`. It lives in `skew-lift-okhsl (i)`, which iterates `zeroDefaults`, a filter over `DEFAULTS`, the fixed 16 role-table defaults, never `docs`, the sampled corpus. That section runs identically in both modes and never sees a SAMPLED/FULL distinction. No change was made to it; both modes print `pass skew-lift-okhsl` with the section unmodified.

### Correction: P8/P9's stated base pulls in the un-landed #681 diff

Both commands are written as `$(git merge-base origin/main HEAD)`. Since G0 is waived and #681 has not landed on `origin/main` (`git merge-base origin/main HEAD` resolves to `3ce50daa`, origin/main's real tip, not this unit's fork point), diffing against it pulls in every file #681 already changed, not just this unit's own two. Used `$(git merge-base plan/gate-split HEAD)`, which is `ebddc55d`, this unit's actual fork point (confirmed: diffing against it lists exactly `test/engine/corpus-sample.mjs` and `test/engine/tonal.mjs`). Both P8 and P9 pass on the corrected base; the plan-level pre-land verifier, running once the whole plan is on `origin/main`, will find the commands as written work correctly there.

### Fix found while running U2-2's own negative control (commit e3f20f21)

Patching `sampleCorpus` to return `[]` (U2-2's own control) drives `docs` to length 0. The C6(iii) negative control read `docs[0]` unconditionally to build its scratch probe, so this crashed with an uncaught `TypeError: doc.palettes is not iterable` before the vacuity FAIL already recorded could reach `gateReport()`'s printed output: the failure was real but invisible, masked by a crash instead of a clean report. Guarded the read (`if (!docs.length) FAIL(...) else { ...existing... }`) so the vacuity guard's own message is what surfaces. Committed separately, before continuing verification.

### Fix found by P8, twice (commits 8321f6f4, ebb342de)

P8's added-line em-dash grep first caught six real em dashes (U+2014) in new comments. Fixed, then re-ran the same command on the full diff and found it printed `0`, but that grep strips ANY backtick-delimited span before matching, including a JS template literal in source, not only a markdown inline-code span: two of my own `FAIL(...)` message strings still carried a real em dash inside their own backticks, invisible to that command. Caught by hand while preparing this handoff (comparing the raw diff against the mechanical count). Both are the SOURCE of program output, not a document quoting it, so the plan's own exemption ("outside an inline backtick span that quotes program output") does not cover them either. Reworded both to a comma or a parenthetical; no control's grep needle changed.

## P1

```
npm test 2>&1 | tail -1
✓ all 50 test files passed
```
```
perl -0ne '...' test/run.mjs
50
```
```
git status --short | wc -l
0
```

## P3 (a), (b), (c), `gate:corpus-tonal` only, per the U2 brief's scope

Main run (worktree, not a clone):
```
npm run -s gate:corpus-tonal; echo "exit $?"
exit 0
```
```
grep -c '(FULL: 343 curated documents, 3780 palettes)'
1
```

Control (a), drop ` --full` from the script:
```
exit 0
```
```
grep -c '(FULL: 343 curated documents, 3780 palettes)'
0
```

Control (b), disable the `--full` flag read:
```
git diff --stat -- test/engine/tonal.mjs | tail -1
 1 file changed, 1 insertion(+), 1 deletion(-)
```
```
exit 0
```
```
grep -c '(FULL:'
0
```

Control (c), FULL branch also samples (re-verified at the final head, clone `neg4`):
```
git diff --stat -- test/engine/tonal.mjs | tail -1
 1 file changed, 1 insertion(+), 1 deletion(-)
```
```
exit 1
```
```
grep -c 'FAIL'
2
```
```
grep -c '35'
2
```
Named line: `FAIL  chroma-envelope  — (vacuity) FULL measured only 35 curated documents, expected at least 343 (the corpus shrank or an import failed silently)`

## P5 rows 1 and 3

| row | mutation | command | needle | expected | got |
|---|---|---|---|---|---|
| 1 | M-A | `npm run -s gate:corpus-tonal` | `(iv dip gate) peak:` | exit 1, needle 1+ | exit 1, needle 1 |
| 3 | M-C | `npm run -s gate:corpus-tonal` | `(C6 i)` | exit 1, needle 1+ | exit 1, needle 1 |

Both re-verified in clone `neg3` (post the crash-guard fix, pre the em-dash wording fix; neither mutation touches the lines that changed after). Both mutations' `git diff --stat` read `1 file changed, 1 insertion(+), 1 deletion(-)` before running.

## U2-1 to U2-6

### U2-1, FULL is the old file
```
npm run -s gate:corpus-tonal 2>&1 | tail -3
  (FULL: 343 curated documents, 3780 palettes)

PASS: tonal-generation clears all [gate] predicates
```
```
exit 0
```
```
grep -c '^  pass  '
21
```
```
grep -c '^  FAIL'
0
```
```
grep -c '(FULL: 343 curated documents, 3780 palettes)'
1
```
Needle amended from the plan's pinned 19 to 21 (see Re-observed counts). P5's M-A and M-C rows for tonal are this row's own negative control.

### U2-2, SAMPLED is green, says so, no sweep dropped
```
node test/engine/tonal.mjs; echo "exit $?"
exit 0
```
```
grep -c '(SAMPLED seed 0: 35 curated documents, 392 palettes)'
1
```
```
grep -c '^  pass  '
21
```
Negative control (empty sampled list, clone `neg3`, post crash-guard fix):
```
node test/engine/tonal.mjs; echo "exit $?"
exit 1
```
Named line: `FAIL  chroma-envelope  — (vacuity) SAMPLED measured only 0 curated documents, expected at least 30`, then `FAIL: 1 gate failure(s)`.

### U2-3, the sample catches a broad regression; the sparse one is recorded, not graded
M-A under SAMPLED (default, clone `neg3`):
```
node test/engine/tonal.mjs; echo "exit $?"
exit 1
```
```
grep -c '(iv dip gate) peak:'
1
```
M-C under SAMPLED (default, clone `neg3`), recorded, not graded:
```
node test/engine/tonal.mjs; echo "exit $?"
exit 1
```
```
grep -c '(C6 i)'
1
```
M-C's sparse regression (4 rises corpus-wide at FULL) happened to be caught by the 35-document sample this run too; not guaranteed by design (the plan calls this leg a canary, not a bar), so it is reported, not graded.

### U2-4, subset semantics, both halves

Observed `EVEN_DIP_BASELINE` names under SAMPLED (10 of 91, clone `neg3`, temporary instrumentation, reverted before continuing): `Trulli of Alberobello . vernacular . Puglia, Italy|primary|500`, `Burger King . The Flame Identity . 2021 rebrand|tertiary|450`, `Snow Country . Kawabata . 1948 . the hot-spring town in winter|primary|450`, `The Makioka Sisters . Tanizaki . 1948 . the Kyoto cherry-viewing|tertiary|450`, `Lovers rock . the blue-light basement|tertiary-muted|450`, `44 N . September . 12:00 . Grand Prismatic Spring, Yellowstone, Wyoming|secondary-muted|450`, `30 N . May . 06:00 . Atchafalaya basin cypress slough, sunrise from a flat-bottom boat|secondary-muted|500`, `30 N . May . 06:00 . Atchafalaya basin cypress slough, sunrise from a flat-bottom boat|tertiary|500`, `48 N . November . 11:30 . The Schwarzwald between St. Margen and Hinterzarten, low cloud through the spruce|primary|450`, `55 N . July . 13:00 . Lowland Kamchatkan taiga in heavy mosquito season, near the Avacha river|tertiary-muted|500` (degree signs and diacritics as printed by the file itself; transcribed plainly here).

(a) Deleted the first of those names from `EVEN_DIP_BASELINE`, ran SAMPLED:
```
exit 1
```
Named line: `FAIL  chroma-envelope  — (iv dip gate) even: 1 dip instance(s) beyond the cited baseline, e.g. Trulli of Alberobello ...|primary|500`.

(b) Added the fictitious `zz-not-in-corpus|primary|500` to `EVEN_DIP_BASELINE`:
```
node test/engine/tonal.mjs; echo "exit $?"   (sampled)
exit 0
```
```
npm run -s gate:corpus-tonal; echo "exit $?"   (full)
exit 1
```
Named line: `FAIL  chroma-envelope  — (iv dip gate) even: 1 of the 91 cited baseline dips were not observed this run (zz-not-in-corpus|primary|500)  -  either fixed (remove from the list, tighten toward 0) or the corpus changed under it (re-diagnose before loosening further)`.

### U2-5, the file's share of `npm test`

Host was loud throughout this pass; recorded honestly per the common brief, graded yellow, not re-run for quiet.

```
before: load 393.24 225.35 152.74, hw.ncpu 10
/usr/bin/time -p node test/engine/tonal.mjs 2>&1 >/dev/null | grep real
real 46.72
after: load 374.87 244.17 163.42
```
`pgrep -fl '[t]est/run.mjs|[v]ite build|[s]moke.mjs|[-]-full'` before the run listed live `test/run.mjs`/`--full` processes from sibling units (gs-U3, gs-U5, and others), confirming genuine multi-seat contention, not a local defect. 46.72s is over the plan's "at or under 20s on a quiet host" figure but in line with the loud comparison figures the plan itself cites (132 to 161s loud full-file, 100.2s Lane A quiet).

### U2-6, per-category presence, extra item from the U1 verdict note

Main (worktree):
```
node test/engine/corpus-sample.mjs
  (forward = reversed = shuffled: 35 documents, 392 palettes)
  (seed 0 != seed 1: 35 documents)
  (all 8 categories present in the sample)
  (35 document keys, all distinct)
  (duplicate-name leg: sampleCorpus threw as expected: ...)

PASS: corpus sample is a pure function of the document set and the seed
exit 0
```
Negative control (`pickVolume` returns `undefined` for `"architecture"`, clone `neg3`):
```
git diff --stat -- test/engine/lib/corpus-sample.mjs | tail -1
 1 file changed, 1 insertion(+), 1 deletion(-)
```
```
node test/engine/corpus-sample.mjs; echo "exit $?"
exit 1
```
```
1 failure(s):
  - category architecture contributed no document to the sample

FAIL: 1 failure(s)
```

## P8 (branding, em dash)

```
node test/repo/branding.mjs | tail -1
branding: clean (515 files scanned)
```
```
git diff $(git merge-base plan/gate-split HEAD) | grep -v '^+++ ' | grep '^+' | perl -CSD -ne 's/`[^`]*`//g; print if /\x{2014}/' | wc -l
0
```
Base corrected from `origin/main` to `plan/gate-split`; see Corrections. Six em dashes in comments (commit 8321f6f4) and two more hidden inside `FAIL(...)` message strings (commit ebb342de) were caught and fixed before this final `0`.

## P9 (scope wall)

```
git diff --name-only $(git merge-base plan/gate-split HEAD) | grep -v -E ... | wc -l
0
```
```
git diff --name-only $(git merge-base plan/gate-split HEAD) -- src | wc -l
0
```
Files touched, confirmed by the same diff: `test/engine/corpus-sample.mjs`, `test/engine/tonal.mjs`, both inside the plan's scope wall and this unit's own Touches column.

## Summary

| # | Result |
|---|---|
| G0 | green, waived, cited |
| P1 | green |
| P3 (a)(b)(c) for corpus-tonal | green |
| P5 rows 1, 3 | green |
| P8 | green (after two fixes, corrected base) |
| P9 | green (corrected base) |
| U2-1 | green (needle amended 19 to 21) |
| U2-2 | green |
| U2-3 | green (M-C recorded, not graded) |
| U2-4 (a)(b) | green |
| U2-5 | yellow, loud host, recorded honestly |
| U2-6 | green |

No red. Everything that disagreed with the plan is under Corrections above: the re-measured pass count (19 to 21), CAP_L_EXCEPTIONS needing no change, the P8/P9 base substitution, the empty-corpus crash U2-2's own control surfaced, and the two em dashes hidden inside FAIL message backticks that the mechanical P8 grep could not see.
