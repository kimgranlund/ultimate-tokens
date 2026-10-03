PASS

# Review floorref-hue U2 · reviewer-l3 · pass 3

| Field | Value |
|---|---|
| Unit | `unit/fh-U2` at `f8771238` (code `84030d41`, plan revision 4 merged at `ea1d1dc2`, merge-base with main `8428280e`), ticket #766 |
| Criteria | `.sdlc/plans/floorref-hue.md` revision 4: U2 line, Risk row 1, C2.1 to C2.15 |
| Inputs | `.sdlc/handoffs/floorref-hue-U2-p3.md`, `.sdlc/reviews/floorref-hue-U2-review-p2.md` (F1 to F6), owner ruling R87 in `.sdlc/questions/floorref-hue-U2-p2.md` (option A: accept the measured trade, records and gate only, no engine change) |
| Checker | reviewer-l3 (opus), inside the builder's own family (builder-l7, opus), because fable is capped (R86) |
| Scratch | `/Users/kimba/.claude/jobs/8c58a81c/tmp/fhU2p3r`, fresh `git archive` extracts of `84030d41`, `777367eb`, `8428280e` and five mutants; nothing run in the worktree |

## Verdict: PASS

Pass 3 does what R87 asked and nothing else. No executable line under `src/engine/` moved; the (b2) random line is built to the plan's draw order, its pin of 7 reproduces on a fresh merge-base extract by two independent derivations, head reads 5, and every control bites. The `evenChroma` header no longer overclaims. The C2.8 timing met the quiet-host rule as written and the baseline row matches the log. Findings below are Low or Info; none blocks.

## Findings, ranked

| Id | Severity | Finding | Evidence | Owner | Disposition |
|---|---|---|---|---|---|
| R1 | Low | (b2)'s bound leaves 2 cells of headroom, and the set holds none of F1's accepted new-dip class | Head 5 cells are a strict subset of the merge-base 7 (#317, #346, #934; #335 gone, 0 new). The bound is the merge-base count, so a later change could open up to 2 new dip cells (one palette on both stop sets) and stay green. F1's cases A (`#2A5315`, `hueShift` 39) and B (`#1E3D07`, 49) are not in seed 766's first 1,000 draws, so no line pins the accepted residue itself. Both are the plan's stated design (C2.13 "at or under the pinned merge-base count"), not a builder gap | 🟡 Orchestrator / planner, if a tighter ratchet (pin at head's 5) is wanted later | Accept as built |
| R2 | Low | `test/engine/tonal.mjs` `dip-gate-even` header now under-describes the grid | `test/engine/tonal.mjs:1609-1611`: "the floor does not rise from 450/550 outward; under the per-stop OKLCH solve and edge rotation that is a measurement, gated at 0 here and by the hueShift grid in npm run gate:even-dips". The grid's (b2) line is bounded at 7, not 0, after pass 3. The `evenChroma` header (C2.15) and the gate header in `even-dips-gate.mjs` both state it correctly. C2.15 says the wording "matches" this header, so the plan treated it as already right | 🟡 U3 (C3.5 follows C2.15) or a comment touch at pre-land | Stale context, one sentence |
| R3 | Low | Several C2 rows are not re-run in the handoff | The U2 line says "every C2 row is re-run on the pass 3 head"; the handoff has rows for C2.3, C2.4, C2.7, C2.8, C2.11, C2.13 to C2.15 only. C2.5, C2.6 and C2.10 are covered by the sweeps and `npm test` the handoff ran, and C2.1, C2.2, C2.9 follow from the 0-line code diff. I replayed C2.1 / C2.2 and C2.12 myself (Criteria) and they hold | 🟡 Builder (records) | Covered by this review's replay; no re-pass needed |
| R4 | Info | Handoff misnames the pure merge-base failure | The handoff says the gate copied into a pure `8428280e` tree exits `update CHROMA_AT_TARGET`. It exits earlier, `FAIL: the patch target string was not found exactly once  -  the engine line moved, update GRID_TARGET`, rc 1, since the merge-base has no `floorRefAt(baseHue, ...)` either. The conclusion (the PIN recipe is the path that runs to the end) holds | 🟢 | Note only |
| R5 | Info | `evenChroma` header says "no-dip is a measurement" without saying the measurement admits dips on random anchored input | `src/engine/tonal.js:330-335`. The wording follows C2.15's Expected text verbatim, and `even-dips-gate.mjs`'s header carries the residue ("Not 0: the per-stop OKLCH solve trades dips on random anchored input under rotation ... owner R87"). Risk row 1 says C2.15 "states the limit"; it points at the measurement rather than stating the numbers | 🟢 | Matches the plan |
| R6 | Info | `npm run build` not run | No `node_modules` in the worktree (unchanged from pass 2 F6). Bundle freshness checked instead: `npm test` in my extract regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` byte-equal to `84030d41` | 🟡 Verifier | `npm ci && npm run build` in the Verifier's tree; not a fail here |
| R7 | Info | `baseline-agrees` stale total 3 and the C2.8 Revisions line | Handoff notes: adapter range for `gate:even-dips` (19 to 23 s) now disagrees with the baseline's 29 to 42 s; C2.8 asks the re-time be named in Revisions, which is the Orchestrator's | 🟡 Orchestrator | At the pre-land record |

## Pass 2 findings

| Id | Pass 2 | Disposition at pass 3 | State |
|---|---|---|---|
| F1 | New dips on random anchored OKLCH under rotation | Owner ruled option A (R87); Risk row 1 re-worded; C2.13 (b2) pins a seeded random set at the merge-base count with a control that bites (replayed below) | 🟢 ruled and gated |
| F2 | `evenChroma` header overclaim | Rewritten comment-only; C2.15 phrases 0 / 0 / 1 (replayed) | 🟢 (residue R2) |
| F3 | Knife-edge whole-script ratio | Retired in revision 4 for a 45 s ceiling and a corpus ratio of at most 1.2; re-timed on a quiet host (C2.8 below) | 🟢 |
| F4 | Revisions line on the unit branch | Revision 4 mirrors it; `git diff main HEAD -- .sdlc/plans/floorref-hue.md` is empty | 🟢 |
| F5 | C2.6 control substituted, valid | Info; nothing owed | 🟢 |
| F6 | `npm run build` not run | Still no `node_modules`; carried as R6 | 🟡 Verifier |

## Criteria

| Check | Command (mine) | Read | State |
|---|---|---|---|
| (1) No executable engine line moved | `git diff -U0 4bea1367..HEAD -- src/engine/ \| grep -E '^[+-][^+-]' \| grep -vE '^[+-][[:space:]]*//' \| wc -l`; same against `777367eb` | `0`; `0`. `evenChroma` still at line 339 at head and `777367eb` | 🟢 |
| (1) Touched files match the handoff | `git diff --name-only ea1d1dc2 84030d41`; `84030d41 f8771238` | code commit: `ui.html`, `tonal.js`, `describe-mcp-assets.js`, `even-dips-gate.mjs`; records commit: `.sdlc/baseline.md`, the handoff. Plan diff `f9a856e0..HEAD` 0 lines | 🟢 |
| (2) Draw order | read `randomPalette` and `gridRandom` against C2.13 | mulberry32 is the standard form; order hueSpace, hue, chroma, skew, lift, hueShift, hueSameDir (object literal, evaluated in order), anchor R, G, B, chromaFloor, relChroma; kit curve, tension, lmin, lmax, damp, dampCurve, dampBias, vibrancy, `dampAmp` 0, `toneMode` even via `gridControls`; both stop sets; stop 500 skipped; predicate identical to `findDips` | 🟢 |
| (2) Head count | `node test/engine/even-dips-gate.mjs --full` in a head extract | rc 0, `PASS`; (a) control 32, line 0; (b1) control 8, line 0; (b2) control `13 dips (want > 7, ...)`, line `5 dips in 3 palettes (... bound 7 ...)`: #317 oklch `#CB8758` -30 stop 250 x2, #346 `#15387E` 53 stop 600 x2, #934 `#D8FC2F` -41 25-stop 200; corpus 0, pre-#701 control 120. 33.14 s at load 5.29 (indicative, not a timing) | 🟢 |
| (2) Pin 7 at merge-base | PIN recipe (REAL imported from a fresh `8428280e` extract) | rc 0, `7 dips in 4 palettes`: #317, #335 `#040E83` -23 stop 450 x2, #346, #934. Head's 5 is a subset, 0 new | 🟢 |
| (2) Pin, independent derivation | the planner's `rnd.mjs` (separate code, same draw) on the three extracts | `8428280e` 7 / 4 palettes; `777367eb` 5 / 3; `84030d41` 5 / 3; LIST equals the gate's list | 🟢 |
| (2) Control bites | B2REAL (`chromaAt(hue)` on the final line, target kept once in a comment) | rc 1, (b1) line 8, (b2) line `13 dips in 7 palettes ... bound 7`, `FAIL` | 🟢 |
| (2) Bound is live | B2LOW (pin 4) | rc 1, `5 dips in 3 palettes ... bound 4`, `FAIL` | 🟢 |
| (2) Control must exceed pin | B2NOB (pin 13) | rc 1, `FAIL: negative control DID NOT bite  -  ... produced 13 grid dips on (b2) ..., not more than 13` | 🟢 |
| (2) Missing target fails | B2MISS (`chromaAt(hue , resolvedHue)`) | rc 1, `FAIL: the patch target string was not found exactly once  -  the engine line moved, update CHROMA_AT_TARGET` | 🟢 |
| (3) C2.15 phrases | the plan's `tr`/`sed` join, then `grep -o` per phrase | head 0 / 0 / 1; `777367eb` 1 / 1 / 0; `8428280e` 1 / 0 / 0. The new sentence names the anchored OKLCH path, 36.18 / 35.83 / 35.43 C over a flat 34.45, and calls no-dip a measurement of `npm run gate:even-dips`, not a structural property | 🟢 |
| (4) C2.8 method | read `$T/timing.py`, `$T/time-even.jsonl` (builder scratch `fhU2p3`) | the script waits for 1-minute load under 5 and no `test/run.mjs`, `gate:` or `--full` process before every run and never discards; 10 runs logged, all start loads 4.41 to 4.91, rc 0, `PASS`; alternating order as stated | 🟢 |
| (4) C2.8 numbers | recomputed from the log | head sorted 29.17, 29.52, 30.61, 31.82, 42.39, median 30.61 (ceiling 45); base sorted 5.52, 5.52, 5.57, 5.68, 6.86, median 5.57; median run's blocks 1650 + 884 + 422 + 326 + 12215 + 8881 = 24.38 s, corpus 6.23 s, ratio 1.12 (bound 1.2); per-run corpus median 5.60, 1.01. The corpus figure includes node start-up and the in-script pre-#701 control, which the base side also runs, so the two sides are comparable | 🟢 |
| (4) Honesty of the quiet-host reading | handoff Runs | Pair 1 head (42.39 s) started at 4.55 and was counted with its outlier disclosed, as the rule (start load only) requires. `npm test`: run 2 at 5.01 discarded; runs 3 and 5 started under 5 but the load rose past 29 from other sessions' processes, disclosed; median of the five counted 112.85 s, of the three that stayed quiet 112.47 s, both under 120. Honestly met to the letter, with the contaminated runs named | 🟢 |
| (4) Baseline row | `git diff 84030d41 f8771238 -- .sdlc/baseline.md` | value cell `42.39 · 30.61 · 29.52 · 29.17 · 31.82`, loads 4.55 / 4.72 / 4.91 / 4.59 / 4.41, base 5.68 · 6.86 · 5.57 · 5.52 · 5.52 with loads, window 08:11:46 to 08:28:18 (pair 5 head start plus 31.82 s), 24.38 s blocks, 1.12: every figure equals the log; pass 2 and R65 readings kept as history | 🟢 |
| C2.1 / C2.2 | `node scripts/report-preset-fidelity.mjs --floor-ref --base-dir <8428280e extract>` from the head extract | gate path `STOPS` and `EXPORT_STOPS`: moved 0, max dC 0.00 C, hueShift-0 movers 0; rendered 3,870 / 4,441 moved, 1,522 / 1,523 palettes, 339 docs, max 9.11 C (Tbilisi `secondary` 100), rc 0 | 🟢 |
| C2.12 | `git diff 8428280e HEAD -- src/engine/tonal.js`, added code lines with digits | only stop names 450 / 500 / 550 and `let ref = 0`; no hue literal or hue comparison | 🟢 |
| Gates | `npm test` in the head extract | 52 / 54 green; `engine/exports.mjs` and `repo/citations.mjs` failed because the extract had no `.git` (`git grep`, `git ls-files`). After `git init` in the extract both re-ran green alone (`PASS: export-formats clears all [gate] predicates`; `citations: ... STALE 0`). Bundles byte-equal to `84030d41`. Builder's six worktree runs and `gate:sweeps` legs not re-run (host load) | 🟢 |
| `npm run build` | n/a | skipped, no `node_modules` (R6) | 🟡 noted, not a fail |

## Negative controls per handoff row

| Handoff row | Control | Replayable | Replayed here |
|---|---|---|---|
| C2.3 | B2REAL, B2MISS | yes, `mutate3.py` | yes, both bite |
| C2.4 | in-script pre-#701 controls (120; 1 and 38) | yes, in every run | 120 yes; tonal.mjs ran inside `npm test` |
| C2.7 | C27, three fixture copies | yes, recipe given | no (cheap but not in scope of the pass 3 change) |
| C2.8 | the quiet-host wait (`waitq.py`, run 2 discarded) | yes, scripts in scratch | read, not re-timed |
| C2.11 | grep on the merge-base reads 2 | yes | not re-run (no comment in scope moved) |
| C2.13 | B2REAL, B2LOW, B2NOB, B2MISS, PIN | yes | yes, all five |
| C2.14 | the pass 1 tree prints 7 | yes | not re-run |
| C2.15 | `777367eb` reads 1 / 1 / 0; MUT215 reads 2 | yes | phrase side yes |
| gates | in-script controls, C27 | yes | in-script yes |

Every row carries one; none is vacuous on the replays I ran.

## Runs

All in `/Users/kimba/.claude/jobs/8c58a81c/tmp/fhU2p3r`, one heavy command at a time, foreground, `test/run.mjs` / `gate:` / `--full` count 0 before each, 1-minute load 4.2 to 6.1 (not quiet; no timing in this record is a C2.8 reading).

| Run | Exit | Output |
|---|---|---|
| head gate | 0 | `eg-head.txt` |
| pin | 0 | `eg-pin.txt` |
| `rnd.mjs` x3 | 0 | 7 / 5 / 5 |
| b2miss, purebase, b2nob, b2low, b2real | 1 each | `eg-<k>.txt` |
| `npm test` (head extract, no `.git`) | 1, git-only | `npmtest-head.txt`, `solo-*.txt` |
| floor-ref report | 0 | `floorref.txt` |
