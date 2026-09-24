---
kind: handoff
plan: gate-split
unit: U6c
branch: unit/gs-U6c
written: 2026-09-23
pass: 1
---

# Handoff U6c gate-split - builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/gs-U6c, cut from unit/gs-U6b at d40cc5ce |
| Worktree | .worktrees/gs-U6c |
| Commit | 8fc8abf5, "gate-split(U6c): narrow the SAMPLED draw in prime and the reset sweep (#713)" |
| Files | test/engine/prime.mjs, test/ui/headless-boot.mjs, this handoff |
| BASE for P8/P9-style diffs | origin/main merge-base, 04f95ff0 |

## What changed

`test/engine/prime.mjs`: `DET_CASE_COUNT` SAMPLED 400 to 200. A new `POISON_COUNT` const (`FULL ? 1500 : 500`) replaces the literal `1500` bound on the poison loop; the mode line already read `POISON_CASES.length`, so it follows without an edit there. Comments above both consts state the new sizes and why the hue step (`HUE_MULT`, `HUE_OFFSET`) did not move.

`test/ui/headless-boot.mjs`, inside the `(rst-corpus)` block only: the loop no longer walks `[...corpusDocs, defaultKitPreset]` directly. It first flattens `corpusDocs`'s anchored palettes into `corpusAnchoredEntries` (order preserved), takes every fourth under SAMPLED (`RESET_STRIDE = 4`, first kept, all kept under FULL), then appends the default kit's own anchored palettes (`defaultKitEntries`) unstrided, keyed on identity with `defaultKitPreset` rather than on `preset.name` (the `...dkDoc` spread after `name: "default kit"` on the object literal overwrites the name field on whatever a category preset happens to carry, so a name-keyed skip would also stride the kit, which is what the planner's own probe did). `corpusFloor` moves 300 to 60 under SAMPLED (FULL untouched at 3000), since the strided count no longer clears the old floor. A new line prints under SAMPLED only, before the existing mode line: `(rst-corpus SAMPLED: stride 4, 91 anchored palettes checked of 316, default kit whole)`.

## Criteria

| # | Command run | Output | Verdict |
|---|---|---|---|
| U6c-1 | `node test/engine/prime.mjs` (worktree head 8fc8abf5) | `exit 0`; `(SAMPLED: 200 determinism cases, 500 poison renders, hue step 5)` count `1`; `0/200 palettes shifted hex by call order` count `1`; `same sweep): 3/30240` count `1` | matches the plan exactly |
| U6c-2 | `npm run -s gate:sweep-prime` (worktree head) | `exit 0`; FULL pass-line count `26`; `(FULL: 2000 determinism cases, 1500 poison renders, hue step 1)` count `1`; `0/2000 palettes shifted` count `1`; `same sweep): 114/151200` count `1`. Re-observed the pass count in a throwaway clone at d40cc5ce (pre-edit): also `26`, confirming the plan's cited `21` is stale against this head, not a regression from this unit's edit | matches, with the pass count amended from the plan's `21` to `26` (re-observed, not a defect) |
| U6c-3 | M-B mutation, throwaway clone at 8fc8abf5 (`hct.js` cache-key edit, `git diff --stat`: `1 file changed, 2 insertions(+), 2 deletions(-)`), `node test/engine/prime.mjs` | `exit 1`; determinism line `2/200 palettes shifted hex by call order`; `out-of-gamut rungs exceeds the pinned ceiling` count `1` | matches the plan exactly (`2/200`) |
| U6c-4 | `node test/ui/headless-boot.mjs` (worktree head) | `exit 0`; `(SAMPLED seed 0: 35 curated documents, 392 palettes)` count `1`; `stride 4, 91 anchored palettes checked of 316, default kit whole` count `1`; `HEADLESS BOOT PASS` count `1` | matches the plan exactly, no amendment needed (the plan's own 91-of-316 figure held, unlike its 79-of-79 probe artifact) |
| U6c-5 | M-D mutation, throwaway clone at 8fc8abf5 (`color.js` reset-lift edit, `git diff --stat`: `1 file changed, 1 insertion(+), 1 deletion(-)`), `node test/ui/headless-boot.mjs` | `exit 1`; `(rst-corpus)` line count `4`; `(rst-corpus) 91 of 91 anchored palettes failed` count `1` | matches the plan exactly (`91 of 91`) |
| U6c-6 | `npm run -s gate:corpus-reset` (worktree head) | `exit 0`; `(FULL: 343 curated documents, 3780 palettes)` count `1`; `stride` count `0`; `HEADLESS BOOT PASS` count `1` | matches the plan exactly |
| U6c-7 | not run, per brief: no timing runs for the record on this pass | deferred | deferred to the coordinated quiet window with U6c-8 |
| U6c-8 | not run, per brief and per the plan's own design: rides the same coordinated quiet window as U6b's six owed gate-script rows | deferred | deferred |

Every clone used for a mutation or a re-observation was `git clone -q --shared` from the unit worktree, into this seat's scratchpad, removed after use; each is proven at the unit's own head (`git rev-parse HEAD` printed `8fc8abf5c0bb5217b1b9a3250fd9e038ed0b4ff7` before the mutation was applied).

`npm test`, once, in a fresh `git clone -q --shared` at the final head 8fc8abf5: `all 50 test files passed`, `exit 0`, tree clean after (`git status --short` empty). No timing recorded from this run; it is a correctness check only, per the brief.

`node test/repo/branding.mjs`: `branding: clean (664 files scanned)`, both in the worktree and in the final clone. No added line carries an em dash outside a backtick span (checked against `origin/main` merge-base 04f95ff0, count `0`).

## Disagreement with the plan

U6c-2's FULL pass count is `26`, not the plan's cited `21` (which the plan itself flagged as measured at an older head, c8823976, "re-observed on unit/gs-U6b before editing and cited"). Re-observed in a throwaway clone at this unit's own pre-edit head (d40cc5ce): also `26`. The FULL leg's other three counts (mode line, `0/2000`, `114/151200`) are unchanged, so this is drift in the pass-line count between plan-measurement time and this unit's cut point, not a regression this unit introduced.

U6c-4's stride count (`91 of 316`) held exactly as the plan's own arithmetic predicted, unlike the planner's own probe run (which read `79` because its skip keyed on `preset.name` and struck the default kit too). No amendment was needed to the plan's stated needle.
