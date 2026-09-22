---
kind: handoff
plan: gate-split
unit: U4
branch: unit/gs-U4
written: 2026-09-20
pass: 1
---

# Handoff U4 (`prime.mjs`) . builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/gs-U4 @ 9d8de712 |
| Files | test/engine/prime.mjs (only) |
| Ran | npm test 50/50 pass, exit 0, tree 0 after (twice: at a67304a4 and again at this head) |
| Left out | none |

## G0, waived

`git cat-file -e plan/gate-split:test/engine/anchor.mjs; echo $?` -> `0`. Merge commit this unit builds off: `ebddc55d` ("sdlc(gate-split): merge plan/preset-intent-fidelity @ a2bb3c84, the #681 tree U2 to U5 build on (#713)").

## Re-observed counts (before editing, at ebddc55d)

- U4-1's pass-line count: the plan cites `20` at 36ce7777. Re-observed on this branch (clone of ebddc55d, unsplit file): `node test/engine/prime.mjs | grep -c '^  pass  '` -> `21`, exit `0`, needle `0/2000 palettes shifted hex by call order` count `1`, `FAIL` count `0`. **This branch's N for U4-1 is 21, not the plan's 20** (Correction below).
- `N` (`TESTS.length`): `50`, confirmed by P1's own perl one-liner, matching the common brief's stated 50 (not the plan's 49).

## Design as implemented

`FULL = process.argv.includes("--full")`. `HUE_MULT` is `1` (FULL) or `5` (SAMPLED); `HUE_OFFSET = SAMPLE_SEED % 5`. `hueRange(baseStep)` returns the hues a grid walks: FULL is identical to the pre-split loop (`start 0, step baseStep`), SAMPLED walks one hue in `HUE_MULT`, starting at `HUE_OFFSET * baseStep`. Both `GAMUT_SWEEP` (base step 3) and `gamut-ceiling`'s `CEILING_PARAMS.hueStep` (base step 2) route through it. `DET_CASE_COUNT` is `2000` (FULL) or `400` (SAMPLED); the loop that builds `DET_CASES` is bounded by it, so a shorter run IS the same prefix (each case's fields are a pure function of `i`). `POISON_CASES` is untouched at `1500` in both modes. The `GAMUT_SWEEP.checked` floor is computed from `GAMUT_HUES.length * 5 * 5 * 3 * SPACES.length` instead of the old hardcoded `15000`, so it is mode-aware by construction. A separate, literal `2000` floor on `DET_CASES.length` (not read back off `DET_CASE_COUNT`) makes gate `c` FAIL if a FULL run ever produces a sampled-size case list. The mode line prints right after `gateReport(...)`, before the FAIL/PASS branch. `ladder-window` is untouched.

## U4 criteria, final head 9d8de712

| # | Command | Printed | Verdict |
|---|---|---|---|
| U4-1 | `npm run -s gate:sweep-prime > log; echo exit $?; grep -c '^  pass  '; grep -c '0/2000 palettes shifted hex by call order'; grep -c '(FULL: 2000 determinism cases, 1500 poison renders, hue step 1)'` | `exit 0`, `21`, `1`, `1` | 🟢 (N re-observed as 21, see Corrections) |
| U4-2 | `node test/engine/prime.mjs > log; echo exit $?; grep -c '0/400 palettes shifted'; grep -c '(SAMPLED: 400 determinism cases, 1500 poison renders, hue step 5)'` | `exit 0`, `1`, `1` | 🟢 |
| U4-2 control | clone, revert only the computed floor to the literal `15000`, keep SAMPLED (hue step 5): `node test/engine/prime.mjs` | `exit 1`; `FAIL  c  — only 3600 hueShift-sweep cases checked (expected 15000) — the thinned sweep did not run` | 🟢 proves the floor is live |
| U4-3 | M-B clone (hct.js cache keys reverted to `.toFixed(2)`), SAMPLED: `node test/engine/prime.mjs`, then grep `[0-9]+/400 palettes` and `out-of-gamut rungs exceeds` count | recorded, not graded: **sampled M-B: exit 1, 3/400, ceiling line count 1** (full detail: `3/400 palettes shifted hex by call order`; `gamut-ceiling: 73/30240 real out-of-gamut rungs`) | recorded |
| U4-4 | `/usr/bin/time -p node test/engine/prime.mjs 2>&1 >/dev/null \| grep real` with quiet-host lines before/after | `real 50.04`. Before: load `21.13 57.84 61.01`, 5 procs >=50% CPU, `pgrep` matched `node test/ui/headless-boot.mjs --full`. After: load `33.17 50.91 57.90`, 5 procs >=50% CPU, `pgrep` also matched `tonal.mjs --full` and `anchor.mjs --full` (sibling builders). Host was loud and contended both readings | 🟡 (loud, not counted as quiet, per the plan's own rule) |

## P3 (gate `sweep-prime` only)

| Leg | Command | Printed | Verdict |
|---|---|---|---|
| main | `npm run -s gate:sweep-prime`, mode-line grep | `exit 0`, count `1` (from U4-1 above) | 🟢 |
| (a) | clone, `package.json`'s `gate:sweep-prime` script loses ` --full`; run it, grep the FULL needle | `exit 0`, count `0` | 🟢 |
| (b) | clone, `perl -pi -e 's/process\.argv\.includes\("--full"\)/false/'` on prime.mjs; run `gate:sweep-prime`, grep `(FULL:` | `exit 0`, count `0` | 🟢 |
| (c) | clone, `perl -pi -e 's/const DET_CASE_COUNT = FULL \? 2000 : 400;/const DET_CASE_COUNT = 400;/'` (the substitution point (c) forces); `git diff --stat` -> `1 file changed, 1 insertion(+), 1 deletion(-)`; run `gate:sweep-prime`, grep `FAIL` and `400` | `exit 1`; `FAIL  c  — only 400 determinism cases built in FULL mode, expected 2000 — the FULL case list did not run`; `FAIL` count `2` (the gate line plus the summary line), `400` count `3` | 🟢, names 400 where 2000 is required |

## P5 row 4 (M-B, FULL leg)

Clone, `perl -pi -e 's/^  const key = hue \+ "\|" \+ tone;/  const key = hue.toFixed(2) + "|" + tone.toFixed(2);/; s/^  const key = String\(hue\);/  const key = hue.toFixed(2);/' src/engine/hct.js` -> `git diff --stat` -> `1 file changed, 2 insertions(+), 2 deletions(-)` (matches the plan exactly). `npm run -s gate:sweep-prime`:

```
exit 1
1
1
```
(`out-of-gamut rungs exceeds the pinned ceiling` count `1`, `grep -cE ' [1-9][0-9]*/2000 palettes shifted'` count `1`). 🟢

## P8, P9 (against ebddc55d, this unit's own base; see Corrections)

P8: `node test/repo/branding.mjs | tail -1` -> `branding: clean (514 files scanned)`. Em-dash sweep on added lines outside backtick spans: `0` (two instances caught and fixed in commit `9d8de712`, both plain comment prose, no code change). 🟢

P9: `git diff --name-only ebddc55d | grep -v -E -e '^test/engine/(tonal|anchor|prime|curated-contrast|corpus-sample)\.mjs$' -e '^test/engine/lib/corpus-sample\.mjs$' -e '^test/ui/headless-boot\.mjs$' -e '^test/run\.mjs$' -e '^package\.json$' -e '^\.github/workflows/ci\.yml$' -e '^\.sdlc/' -e '^\.claude/skills/shipping-changes/SKILL\.md$' | { grep -v -e '^\.claude/CLAUDE\.md$'; } | wc -l` -> `0`. `git diff --name-only ebddc55d -- src | wc -l` -> `0`. 🟢

## P1

```
✓ all 50 test files passed
```
`perl -0ne '...TESTS...'` -> `50`. `git status --short | wc -l` -> `0`. Run twice (at `a67304a4` before the em-dash fix, and again at the final head `9d8de712`); both green, both tree-clean. 🟢

## Clone paths (throwaway, left in place per instructions)

- `/private/tmp/claude-501/-Users-kimba-Projects-nonoun-ultimate-tokens/b2e196e7-c1fa-4f1c-8d62-80e1dfd367c7/scratchpad/gs-U4-g0base-1/base`: pre-edit baseline (unsplit file, at ebddc55d)
- `/private/tmp/claude-501/-Users-kimba-Projects-nonoun-ultimate-tokens/b2e196e7-c1fa-4f1c-8d62-80e1dfd367c7/scratchpad/gs-U4-neg-2/neg`: U4-2 control (floor reverted to 15000)
- `/private/tmp/claude-501/-Users-kimba-Projects-nonoun-ultimate-tokens/b2e196e7-c1fa-4f1c-8d62-80e1dfd367c7/scratchpad/gs-U4-neg-3/neg`: U4-3 and P5 row 4 (M-B mutation)
- `/private/tmp/claude-501/-Users-kimba-Projects-nonoun-ultimate-tokens/b2e196e7-c1fa-4f1c-8d62-80e1dfd367c7/scratchpad/gs-U4-neg-4/neg`: P3(c)
- `/private/tmp/claude-501/-Users-kimba-Projects-nonoun-ultimate-tokens/b2e196e7-c1fa-4f1c-8d62-80e1dfd367c7/scratchpad/gs-U4-neg-5/neg`: P3(a)
- `/private/tmp/claude-501/-Users-kimba-Projects-nonoun-ultimate-tokens/b2e196e7-c1fa-4f1c-8d62-80e1dfd367c7/scratchpad/gs-U4-neg-6/neg`: P3(b)

## Corrections (disagreed with the plan)

1. **U4-1's N is 21, not the plan's 20.** Measured at ebddc55d, both on the unedited clone and on the split file's FULL leg. Same needles otherwise (`0/2000`, `FAIL` count `0`). The plan's U4-1 row and any downstream figure citing "20 pass lines" for prime.mjs needs the amendment.
2. **P8/P9's stated command (`$(git merge-base origin/main HEAD)`) does not give a usable diff on this unit branch.** G0 is waived for U2-U5 (per the common brief) specifically because `origin/main` does not carry #681 yet, so `git merge-base origin/main HEAD` resolves to `3ce50daa`, the point before `plan/preset-intent-fidelity` (#681) merged in, not this unit's own base. Running P8's em-dash sweep against that merge-base counted `606` lines, all from #681's own history, none from this unit's one file. I re-ran both P8 and P9 against `ebddc55d` (the merge commit this unit branch was actually cut from) instead, which is the scope this unit is actually accountable for, and both came back clean (`0`, `0`, `0`). The plan-level P8/P9 commands are correct for pre-land, once the branch has been rebased onto a post-#681 `origin/main`; they are not correct for a unit branch measured before that rebase.
3. **Added one gate beyond the plan's literal U4 steps: a FULL-side vacuity check on `DET_CASES.length`.** The U4 section's steps (1)-(4) do not spell this out, but P3(c) explicitly requires "the FAIL names 400 where 2000 are required" for `gate:sweep-prime`, and nothing in the pre-existing gate `c` logic would have caught a FULL run silently producing 400 cases (the determinism check only compares clean vs poisoned counts, not the count against a mode-aware floor). Added a literal `if (FULL && DET_CASES.length < 2000) FAIL(...)`, deliberately not derived from `DET_CASE_COUNT` itself so the one substitution point P3(c) mutates cannot also move what this check expects. Commit `a67304a4`.
4. **Two em dashes slipped into the new comments** (`e3202264`'s FULL/SAMPLED explanation and the `DET_CASE_COUNT` comment), caught by re-running P8 against `ebddc55d` rather than assuming clean. Fixed in `9d8de712` (en dash / period split, no logic change, re-verified with a fresh FULL + SAMPLED run before committing).

## Host

`sysctl -n hw.ncpu`: `10`. Load ranged from about 20 to 170 over the course of this unit (sibling builders `gs-U2`, `gs-U3`, `gs-U5`, and `close-709-repoint` sharing the host); U4-4 is the only timing row and it is recorded loud, graded 🟡 per the plan's own rule rather than waited out.
