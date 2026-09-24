---
kind: review
plan: gate-split
unit: U6b
target: unit/gs-U6b @ 474824ff
base: 8ff163bd (merge of origin/main 04f95ff0 into e035f841)
reviewer: gs-U6b-reviewer-l2-p1
date: 2026-09-23
verdict: FIX-FIRST
---

# Review U6b gate-split (non-timing work)

Verdict: FIX-FIRST. One high finding: the merge duplicated 48 lines of `src/ui/sections/color.js`, and three later commits recorded the damage as if it were main's own change. Everything else graded here passes or needs small record fixes.

Controls ran in `git clone --shared` copies under `scratchpad/gs6br/` (`head` at 474824ff, `neg` at 474824ff, `main` at 04f95ff0; each `git rev-parse` checked). Heavy runs (two `anchor.mjs` runs) started only when the node count was 1. I took no timing runs.

## Items

| # | Item | Grade | Evidence and control |
|---|---|---|---|
| 1 | Merge 8ff163bd equals main plus this plan's work | 🔴 | Files that differ between the merge and main (04f95ff0), outside `.sdlc/`: 10 are in the plan's scope, plus `src/ui/sections/color.js`. For each one I ran a 3-way `git merge-file` (base a2bb3c84, the #681 tree the plan built on; ours = main; theirs = e035f841) and compared the result with the merge. `ci.yml`, `run.mjs`, `tonal`, `prime`, `curated-contrast`, `corpus-sample` (both files) and `headless-boot` came out SAME. `package.json` keeps main's `launcher.mjs` smoke line. `anchor.mjs` had two conflict hunks, both resolved to the plan side. That side's `allowListOk` delegates to `allowListMatches` under FULL, which is the same count-and-membership test as main's `listOk`, so main's headline fix survives. `color.js` came out DIFF 48: the merge holds `detachSnapshot` and `resetAnchor` twice, at lines 1961-2008 and 2009-2056, and the two blocks are byte-identical (main has one copy, at 1975/1995). The merge also brought back three pif plans at `.sdlc/plans/` that main had archived. The `.sdlc/board.md` resolution is fine |
| 2a | U6-2 | 🟢 | `same 5`. Control: added `gate:extra` to `package.json` in `neg`, which printed `DIFFER 5` |
| 2b | U6-6 | 🟡 | Gate rows `1 1 1 1`, ceiling `1`, quiet-host command `1`, jobs `build-test 1`, `panda-smoke 1`, `corpus-contrast 1`, `sweeps 1`, deploy `1`. The handoff never cites the `INTERIM` needle. The plan's own example needle, `budget moved, #681 U6`, still prints `1` at the head, because the builder kept that paragraph as the "why" record. Three other needles from the retired note print `0` at the head and `1` on main: `Interim ceiling now, split sweeps into gate scripts`, `INTERIM ceiling** (#681 U5` and `Superseded as the figure to cite, #681 U5`. So the note is retired in substance, but the needle is not on record. Controls: removing the corpus-anchor row, rewording the ceiling sentence and removing `corpus-contrast` from the CI row each printed `0` |
| 2c | U6-7 | 🟢 | `1 5 0 0 0 1`. At 8ff163bd the file prints `0 1 1 1 1 1`. Both sentences the plan requires are present (a red `sweeps` leg is a red run, and `gate:sweeps` is the local command). The watch-time figure is covered under L3 |
| 2d | U6-9 | 🟢 | `1` at the head, `0` at 8ff163bd. On the `main` clone (ref 20298cc) the check prints `note  head:` and `ok    head: ... in origin/main's history`. At the head (ref 71cdb960, branch-only) it prints `STALE head:` and exits 1 |
| 2e | U6-10 | 🟡 | `1` at the head, `0` at the base. Every counted row's `load before` is under 5. See M3: the adapter prose also asks for load under 5 after each run, and five counted rows break that |
| 2f | U6-11 | 🟢 | `4` at the head, `0` at the base. The R8 to R10 lines paraphrase `standing-rulings-2026-09-20.md` without quote marks, so the rule that quotes must match byte for byte does not apply |
| 2g | U6-12 | 🟢 | `1` at the head, `0` at the base. Control: removing the provenance bullet in `neg` printed `0` |
| 2h | `debt.md` K17 quote | 🟢 | The `grep -vxE "..."` span is byte-equal to the `architecture.md` K17 cell (checked with `diff`, identical). Rerun of the control at the head: 13 unlisted files before the filter, 5 after, and the 5 names match the row |
| 3 | `anchor.mjs` key-anchor fix, 71cdb960 | 🟢 | The fix is correct and minimal: the lookup moves from `presetsByCat` to `byCategory`, and FULL behaves the same because both lists are complete there. Control in `neg` at 474824ff with the `71cdb960~1` blob restored (`1 file changed, 3 insertions(+), 6 deletions(-)`), at seed 0: `exit 1`, `26 of 26 ... 2 subjects (... plus 1 named corpus presets)`, `rendered leg: no travel preset matching "Hidaka coast" ... the named subject moved`, `FAIL: 1 gate failure(s)`. The same clone with the fixed file: `exit 0`, `46 of 46 ... 4 subjects (... plus 3 named corpus presets)`, `PASS (SAMPLED)`. A sampler probe shows why: the seed-0 sample holds The Matrix (film IX) but not Hidaka coast (travel IV; the sample drew XI) or Black metal (music VII). The old code missed two presets, and the FAIL message names the first. The other named lookups in the file (lines 1575, 1619 and 1642) read full module lists, so nothing else has this bug |
| 4a | Two doc-citation fixes, ee53815a | 🔴 | Not justified. They re-point the docs at line numbers pushed down 48 lines by the duplicated block. On a copy of the head with main's `color.js` restored, `citations.mjs` reds with 2 failures. Restoring main's two docs as well turns it green. `citations.mjs` is green on main at 04f95ff0 |
| 4b | `ui.html` KB correction, 1d653510 plus the `baseline.md` paragraph | 🔴 | The cause the paragraph names is false. Main's committed `ui.html` measures 4119.1 KB, and main's check prints `ok ui.html ... 4119.1` with `stale total: 0`. The head's file is 4257390 bytes against main's 4253980, a difference of 3410 bytes, which is exactly the size of the duplicated block. `detachSnapshot(d, i, p) {` appears twice in the head's `ui.html` and once in main's. The paragraph also names main as 523221f1, but the merge took 04f95ff0 |
| 5 | Prose rules | 🟡 | No clean-baseline claim. No em dash outside backticks in 8ff163bd..HEAD. `branding: clean (667 files scanned)`. The quiet-host commands are verbatim from the plan (`cmp` equal). The `baseline.md` walls equal the handoff Runs table. Six added lines carry bold inline labels (L1) |

## Figures (honesty only)

| Check | Result |
|---|---|
| U6-3 formula on the handoff | `9`, `0`, `14`. Every counted row passes the formula as written |
| Rejected runs kept out of the counted set | yes, R1 to R14 are in their own table |
| Averaging or choosing figures to fit | none found. `baseline.md` holds the raw counted walls. The `OVER 120` result is stated, not hidden |
| Rejected table columns | 🟡 not the Runs columns (M4) |

## Findings by severity

High

- H1. The merge 8ff163bd doubled `detachSnapshot` and `resetAnchor` in `src/ui/sections/color.js` (48 identical lines). Runtime behaviour does not change, because the second copy overrides an identical first one and `tsc` does not check `.js` files. But this plan's scope forbids any change under `src/`. The later commits then built on the duplicate: ee53815a shifted doc citations by +48, 1d653510 regenerated `ui.html` with the block twice, and the `baseline.md` KB correction names a false cause. Fix: set `color.js` back to main's blob (`git checkout 04f95ff0 -- src/ui/sections/color.js`). Revert ee53815a and 1d653510, set `baseline.md`'s build row back to 4119.1 KB and drop the U6b KB correction paragraph. Then rerun `npm test` and `baseline-agrees-check.sh`. Measured against origin/main, P9 then lists no out-of-scope files. Right now it lists exactly these four: the two docs, `ui.html` and `color.js`.

Medium

- M1. The merge restores `.sdlc/plans/preset-intent-fidelity-u2-rediagnosis.md`, `-u2-rediagnosis-2.md` and `-u3-rediagnosis.md`. Main archived all three, and the restored copies are identical to main's archive copies. Delete them.
- M2. `.claude/CLAUDE.md` has two lines changed. The owner's Q2 answer allowed one line naming the CI jobs, and adapter X9 requires owner consent for any edit there. The second line also says `npm test` runs "under 120 s on a quiet host", which the unit's own readings (106.45, 141.39 and 171.23) contradict. Revert that line or ask the owner.
- M3. The new adapter quiet-host prose says load must be under 5 "immediately before the run and again after it". U6-10 rules on the start of the run only. Counted rows 2, 3, 5, 8 and 9 end at load 9.34, 7.82, 6.98, 5.52 and 5.21, so the set breaks the adapter's own wording while passing U6-3's formula, which reads the after-load against core count. Fix the prose to say load under 5 at the start and under core count after, before U6c retimes against it.
- M4. The Rejected runs table leaves out `load after`, `hot after`, `exit`, `wall`, `last line` and `git status lines`, but U6-3 says "same columns". R9 to R14 were counted once, so their walls existed. Without those walls, nobody can check that the rejected runs were not the inconvenient ones.
- M5. U6-6's `INTERIM` needle is not cited in the handoff, and the plan's example needle still prints `1`. Cite a needle that prints `0` now and `1` on main, for example `Interim ceiling now, split sweeps into gate scripts`. Revision 13 should amend the example.
- M6 (plan). P8 and P9 diff against `merge-base(plan/gate-split, HEAD)`, which is e035f841. After the main merge, that diff pulls in main's own work: P9 prints `35` and `6`, and P8 prints `38`. Revision 13 should diff U6b and pre-land against `origin/main`.

Low

- L1. Six added lines carry bold inline labels: `**Retired, #713 U6b ...**`, `**Every control clone states its own provenance ...**`, `**Amendment (2026-09-20, R8 to R10).**`, `**R8, ...**`, `**R9, ...**` and `**R10, ...**`. The plan's prose rules forbid them, even though the file's older paragraphs use the same style.
- L2. The adapter rows for corpus-tonal and sweep-prime say "the last line reads `(FULL: ...)`". The mode line prints just before the PASS line, and the handoff's own Runs table shows the last line is `PASS: ...`.
- L3. `shipping-changes` says "Watch CI (~150-300s, the `sweeps` matrix is now the long pole)". `plan/gate-split` has no completed CI run (`gh run list` returns none), so this is not the U6-8 figure U6-7 asks for. "Long pole" also contradicts the plan's projection, which keeps `build-test` as the wall. Pin the figure at pre-land.
- L4. Small record errors. `baseline.md` says "the U6b handoff's U6a merge registered `engine/corpus-sample.mjs`", but U1 registered it. The question doc says "sum of all 48 files" where TESTS is 50. R2's reason reads "load at or over the ncpu-scale hot-process reading". The handoff's Criteria paragraph has a garbled sentence ("rather than "anything" being the accepted range only in spirit").
- L5. The merge commit also changed the plan's U6b checkbox from `[ ]` to `[~]`. That file belongs to the Orchestrator, and the change is a hand edit hidden inside a merge.

## Pass 2: re-review of 474824ff..75a3b876

Verdict: PASS. Every finding in U6b's scope is fixed. L5 goes to the Orchestrator; M6 and the plan's example needle go to revision 13.

Checks ran in a clone at `scratchpad/gs6br/p2` checked out at 75a3b876 (`git rev-parse` confirmed). I took no timing runs.

| Finding | Grade | Evidence |
|---|---|---|
| H1 `color.js` | 🟢 | `git diff --quiet 04f95ff0 75a3b876` shows no difference for `src/ui/sections/color.js`, either doc, or `figma/plugin/ui.html` (all four match main). `citations.mjs` passes with STALE 0. `baseline.md`'s build row reads 4119.1 KB, the false U6b correction paragraph is gone, and the check prints `ok ui.html` |
| M1 archived plans | 🟢 | all three are gone from `.sdlc/plans/` |
| M2 `CLAUDE.md` | 🟢 | against main, one line differs: the CI list gains `sweeps`, which the Q2 answer allows |
| M3 quiet-host prose | 🟢 | Load under 5 is now required only at the start (U6-10). After the run, load must stay under the core count and the hot-process reading must still be `0`, and `pgrep` is read before the run only. That is the same rule as U6-3's formula. All 9 counted rows meet it: after-loads are 3.67 to 9.34, all under 10, and hot after is 0 |
| M4 Rejected table | 🟢 | The table now has the same 11 columns as the Runs table (both parse to 13 fields). R1 to R8 are marked `not recorded` because they never started. R9 to R14 show their walls (86.78, 86.19, 80.86, 89.38, 88.18 and 61.85 s) and each shows a nonzero `hot after`. None of those walls is uniformly above the counted figures, so there is no sign that runs were rejected to fit a number |
| M5 INTERIM needle | 🟢 | The handoff cites `Interim ceiling now, split sweeps into gate scripts`. It prints `0` at the head and `1` on main, which I checked both ways |
| L1 bold labels | 🟢 | `0` in the unit's own diff |
| L2 last line | 🟢 | the corpus-tonal and sweep-prime rows now name the `PASS: ...` last line and say the mode line prints before it |
| L3 CI figure | 🟢 | the unmeasured figure is gone, and the U6-7 needles still print `1 5 0 0 0 1` |
| L4 small errors | 🟡 | `baseline.md` now says U1 registered the file, and R2's garbled reason is gone. One doubt remains: the question doc's per-file sum label changed from 48 to 50 files while the figure (263.53) stayed the same, and nothing new was run. If the diagnostic really timed 48 files, the old label was right. The builder should cite the diagnostic's own file count or restore 48 |

Criteria rerun at 75a3b876:

| Criterion | Result |
|---|---|
| P9, measured against origin/main | `0`, `0` |
| P8, the unit's own em dashes | `0` |
| branding | `branding: clean (664 files scanned)` |
| U6-6 | gate rows `1 1 1 1`; ceiling `1`; quiet-host command `1`; all four jobs `1`; deploy `1` |
| U6-9, U6-10, U6-11, U6-12 | `1`, `1`, `4`, `1` |
| U6-3 | `9`, `0`, `14` |
| tree after the checks | clean |

`baseline-agrees-check.sh` has 4 stale lines, all expected on this branch:

- the three timing rows still waiting on the U6c window;
- `STALE head:`, because the baseline `ref` is a branch-only commit, which is U6-9's case.

It also prints a new `note  head:` line: the baseline was measured at 71cdb960, and the tree has since changed outside `.sdlc/` (the duplicate block was removed). Runtime is the same, since the removed block was a byte-identical copy, and U6c retimes and resets the `ref` anyway.

Low findings, none blocking:

- `.sdlc/baseline.md` now ends without a trailing newline (main's copy has one).
- The 48-to-50 relabel described in the L4 row above.
