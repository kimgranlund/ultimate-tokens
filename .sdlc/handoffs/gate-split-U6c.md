---
kind: handoff
plan: gate-split
unit: U6c
branch: unit/gs-U6c
written: 2026-09-23
pass: 3
---

# Handoff U6c gate-split - builder -> reviewer

| Field | Value |
|---|---|
| Branch | unit/gs-U6c, cut from unit/gs-U6b at d40cc5ce |
| Worktree | .worktrees/gs-U6c |
| Commits | 8fc8abf5 (pass 1, "narrow the SAMPLED draw in prime and the reset sweep"), 46dc9b77 (pass 2, "F1 comment mechanism, F2 print and cite"), 23648d56 (pass 3, "state why the hue step stayed at 5") |
| Files | test/engine/prime.mjs, test/ui/headless-boot.mjs, this handoff |
| BASE for P8/P9-style diffs | origin/main merge-base, 04f95ff0 |

## Pass 3: the verdict's row 9

The pass 2 handoff's "What changed" claimed the `DET_CASE_COUNT`/`POISON_COUNT` comment above states why the hue step (`HUE_MULT`, `HUE_OFFSET`) did not move; it did not. Added a third comment paragraph above `DET_CASE_COUNT`, after `POISON_COUNT`'s: `HUE_MULT stays at 5 ... at step 10 the gamut-ceiling gate's own truncated-key negative control finds 0 witnesses on this sweep and reds itself (measured at U6c), so 5 is the widest step this gate's own control still passes at`. Corrected the false claim below to point at the new paragraph instead of the two that never carried it. `node test/engine/prime.mjs` once in a fresh clone at 23648d56: `exit 0`, matching U6c-1's needles unchanged (the comment carries no behavior). No `npm test` run, per the team lead's instruction: a comment-only change.

## Pass 2: review FIX-FIRST

Review verdict was FIX-FIRST (`gs-U6c-review.md`): every mechanical criterion and control reproduced, three record fixes needed, no code-behavior change intended.

| Finding | What was done |
|---|---|
| F1 (medium): the `RESET_STRIDE` comment named the wrong mechanism (claimed the `...dkDoc` spread overwrites OTHER presets' names) | Reworded the comment: the spread replaces the kit preset's own name with `defaultDocument().name`, measured `"Default"`, so a name-keyed skip on `=== "default kit"` never matches the kit. It touches no other preset |
| F2(a) (low): the plan asks the builder to print how many documents contribute none after the stride | Added a second SAMPLED-only print line naming, of the sampled documents, how many contribute no anchored palette in either mode versus how many lost every anchored palette to the stride. Re-run: `5 of 35 sampled documents contribute no anchored palette in either mode, 0 of the rest lost every anchored palette to the stride`, matching the reviewer's own probe (30 of 35 have anchored palettes, all 30 still contribute, 0 lost to the stride) |
| F2(b) (low): U6c-6 was missing U5-3's line-range clause | Added below; `0` outside hunks against `unit/gs-U6b` (U6c adds none), `3` against the `plan/gate-split` fork point (inherited from U6b's own main merge, per the plan's M5) |
| F3 (nit) | Not changed: the reviewer marked it optional and it is not a plan requirement; the `91`/`316` needles already guard the line's truth |
| F4 (nit, reindent) | Not changed: the reviewer marked it optional, behavior unaffected |
| Q1 (26 vs 21) | Not a defect per the review; re-cited as such in Disagreement below, unchanged from pass 1 |

## What changed

`test/engine/prime.mjs`: `DET_CASE_COUNT` SAMPLED 400 to 200. A new `POISON_COUNT` const (`FULL ? 1500 : 500`) replaces the literal `1500` bound on the poison loop; the mode line already read `POISON_CASES.length`, so it follows without an edit there. Comments above both consts state the new sizes; a third paragraph, added pass 3, states why the hue step (`HUE_MULT`, `HUE_OFFSET`) did not move with them.

`test/ui/headless-boot.mjs`, inside the `(rst-corpus)` block only: the loop no longer walks `[...corpusDocs, defaultKitPreset]` directly. It first flattens `corpusDocs`'s anchored palettes into `corpusAnchoredEntries` (order preserved), takes every fourth under SAMPLED (`RESET_STRIDE = 4`, first kept, all kept under FULL), then appends the default kit's own anchored palettes (`defaultKitEntries`) unstrided, keyed on identity with `defaultKitPreset` rather than on `preset.name` (the `...dkDoc` spread after `name: "default kit"` replaces the kit preset's own name with `defaultDocument().name`, measured `"Default"`, so a name-keyed skip on `=== "default kit"` never matches the kit; it touches no other preset's name). `corpusFloor` moves 300 to 60 under SAMPLED (FULL untouched at 3000), since the strided count no longer clears the old floor. Two lines print under SAMPLED only, before the existing mode line: `(rst-corpus SAMPLED: stride 4, 91 anchored palettes checked of 316, default kit whole)` and, added pass 2, `(rst-corpus SAMPLED: 5 of 35 sampled documents contribute no anchored palette in either mode, 0 of the rest lost every anchored palette to the stride)`.

## Criteria

| # | Command run | Output | Verdict |
|---|---|---|---|
| U6c-1 | `node test/engine/prime.mjs` (worktree head 8fc8abf5) | `exit 0`; `(SAMPLED: 200 determinism cases, 500 poison renders, hue step 5)` count `1`; `0/200 palettes shifted hex by call order` count `1`; `same sweep): 3/30240` count `1` | matches the plan exactly |
| U6c-2 | `npm run -s gate:sweep-prime` (worktree head) | `exit 0`; FULL pass-line count `26`; `(FULL: 2000 determinism cases, 1500 poison renders, hue step 1)` count `1`; `0/2000 palettes shifted` count `1`; `same sweep): 114/151200` count `1`. Re-observed the pass count in a throwaway clone at d40cc5ce (pre-edit): also `26`, confirming the plan's cited `21` is stale against this head, not a regression from this unit's edit | matches, with the pass count amended from the plan's `21` to `26` (re-observed, not a defect) |
| U6c-3 | M-B mutation, throwaway clone at 8fc8abf5 (`hct.js` cache-key edit, `git diff --stat`: `1 file changed, 2 insertions(+), 2 deletions(-)`), `node test/engine/prime.mjs` | `exit 1`; determinism line `2/200 palettes shifted hex by call order`; `out-of-gamut rungs exceeds the pinned ceiling` count `1` | matches the plan exactly (`2/200`) |
| U6c-4 | `node test/ui/headless-boot.mjs`, throwaway clone at 46dc9b77 | `exit 0`; `(SAMPLED seed 0: 35 curated documents, 392 palettes)` count `1`; `stride 4, 91 anchored palettes checked of 316, default kit whole` count `1`; `5 of 35 sampled documents contribute no anchored palette in either mode, 0 of the rest lost every anchored palette to the stride` count `1`; `HEADLESS BOOT PASS` count `1` | matches the plan exactly, no amendment needed (the plan's own 91-of-316 figure held, unlike its 79-of-79 probe artifact); F2(a)'s new line matches the reviewer's own probe |
| U6c-5 | M-D mutation, same clone at 46dc9b77 (`color.js` reset-lift edit, `git diff --stat`: `1 file changed, 1 insertion(+), 1 deletion(-)`), `node test/ui/headless-boot.mjs` | `exit 1`; `(rst-corpus)` line count `4`; `(rst-corpus) 91 of 91 anchored palettes failed` count `1` | matches the plan exactly (`91 of 91`) |
| U6c-6 | `npm run -s gate:corpus-reset`, throwaway clone at 46dc9b77 | `exit 0`; `(FULL: 343 curated documents, 3780 palettes)` count `1`; `stride` count `0`; `HEADLESS BOOT PASS` count `1`. U5-3's line-range clause (`A=4051, Z=4157`): outside-hunk count `0` against `unit/gs-U6b` (this unit's own hunks, `4075 4086 4144 4146 4150`, all fall inside `[A, Z]`, so U6c adds none); `3` against the `plan/gate-split` fork point `e035f841`, inherited from U6b's own main merge (M5), unchanged since pass 1 | matches the plan exactly, F2(b) added |
| U6c-7 | `/usr/bin/time -p node test/engine/prime.mjs`, then the same for `test/ui/headless-boot.mjs`, quiet-host window 2 (2026-09-23 22:14 PDT to 2026-09-24 00:19 PDT, near the window's tail end) | `real 17.11` (prime), `real 17.57` (headless-boot), both under U4-4/U5-4's ceilings (25 s, 30 s); one rejected prime.mjs attempt (load 4.04, hot 1, never ran) | comfortably under both ceilings; narrowing the SAMPLED draw cut prime from the design section's loud 43-69 s range to a 17 s quiet reading |
| U6c-8 | the re-time: three `npm test` runs, quiet-host window 2 (2026-09-23 22:58 PDT to 2026-09-24 00:19 PDT), alongside U6b's six owed gate-script rows | `89.10 / 79.93 / 80.07 s`, replacing U6b's window-1 figures (`106.45 / 141.39 / 171.23 s`); P2 now prints `ok 89.1` | inside the 120 s ceiling on all three, resolving `.sdlc/questions/gate-split-U6b.md` per owner ruling R35 |

Every clone used for a mutation or a re-observation was `git clone -q --shared` from the unit worktree, into this seat's scratchpad, removed after use; each is proven at the unit's own head before the mutation was applied (`git rev-parse HEAD` printed `8fc8abf5c0bb5217b1b9a3250fd9e038ed0b4ff7` for pass 1's clones, `46dc9b774f37adf379d3750da361ef709a5e7f0d` for pass 2's).

`npm test`, once, in a fresh `git clone -q --shared` at the final head 46dc9b77: `all 50 test files passed`, `exit 0`, tree clean after (`git status --short` empty). No timing recorded from this run; it is a correctness check only, per the brief.

`node test/repo/branding.mjs`: `branding: clean (665 files scanned)` in the worktree, `clean (664 files scanned)` in a fresh clone (the handoff file itself is the 665th, present only in the worktree at the time of that count). No added line carries an em dash outside a backtick span (checked against `origin/main` merge-base 04f95ff0, count `0`).

## Disagreement with the plan

U6c-2's FULL pass count is `26`, not the plan's cited `21` (which the plan itself flagged as measured at an older head, c8823976, "re-observed on unit/gs-U6b before editing and cited"). Re-observed in a throwaway clone at this unit's own pre-edit head (d40cc5ce): also `26`. The FULL leg's other three counts (mode line, `0/2000`, `114/151200`) are unchanged, so this is drift in the pass-line count between plan-measurement time and this unit's cut point, not a regression this unit introduced.

U6c-4's stride count (`91 of 316`) held exactly as the plan's own arithmetic predicted, unlike the planner's own probe run (which read `79` because its skip keyed on `preset.name` and struck the default kit too). No amendment was needed to the plan's stated needle.

## Window 2: U6c-7 and U6c-8 (2026-09-23 22:14 PDT to 2026-09-24 00:19 PDT, added by the U6b builder per the coordinated quiet window)

Taken in a fresh `git clone -q --shared` of `.worktrees/gs-U6b` at `c87d98fc` (HEAD proven: `git rev-parse HEAD` printed `c87d98fc87c200951e45c649c1c7b94ad462882f`), under the same quiet-host rule as U6b's own set: load under 5 at the start, heavy-run count 0, `pgrep` clean, read again after each run.

U6c-7, one attempt each unless noted:

| command | load before | hot before | load after | hot after | exit | real (s) | note | clock (PDT) |
|---|---|---|---|---|---|---|---|---|
| `node test/engine/prime.mjs` | 4.04 | 1 | not recorded | not recorded | not recorded | not recorded | rejected, hot before nonzero, retaken | not recorded |
| `node test/engine/prime.mjs` | 3.37 | 0 | 3.61 | 0 | 0 | 17.11 | counted | 2026-09-24, 00:19:32 to 00:19:49 |
| `node test/ui/headless-boot.mjs` | 3.49 | 0 | 3.92 | 0 | 0 | 17.57 | counted | 2026-09-24, 00:20:16 to 00:20:34 |

Both counted readings sit well inside U4-4/U5-4's ceilings (25 s, 30 s), a large drop from the design section's loud pre-narrowing readings (43-69 s), consistent with U6c's SAMPLED draw shrinking prime's determinism/poison counts and the reset sweep's stride.

U6c-8: the three `npm test` re-time runs are U6b's own Runs table rows 1-3 (`.sdlc/handoffs/gate-split-U6b.md`), not duplicated here. Figures: `89.10 / 79.93 / 80.07 s`, all inside the 120 s ceiling. `P2`'s command against the updated `.sdlc/baseline.md` prints `ok 89.1`. This resolves `.sdlc/questions/gate-split-U6b.md` per owner ruling R35: the window-1 overage (`106.45 / 141.39 / 171.23 s`) is superseded, kept as a labelled historical note in `.sdlc/baseline.md` rather than deleted.
