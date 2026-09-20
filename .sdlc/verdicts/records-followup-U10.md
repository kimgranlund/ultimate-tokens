---
kind: verdict
plan: records-followup
unit: U10
branch: unit/rf-U10
sha: 23a206b429b25d8f98cf2e1c7b762f68a612cea8
verdict: 🟢
seat: independent verifier
written: 2026-09-20
---

# Verdict U10 · 🟢

Delta graded: `887e3eb2..23a206b4` (16 paths, all under `.sdlc/`). Criteria read from the U10 checklist row of `.sdlc/plans/records-followup.md` at the graded head (revision 12). The brief path the dispatch named, `/tmp/rf-u10-brief.md`, did not exist, so the plan row is the only criteria source. Every row is this seat's own run, 11:12 to 11:16, in throwaway `git clone --shared` clones under `/tmp/rf-prepr-verify`, no `node_modules`, plants hard reset between runs. `BASE` reads `3ce50daa`. Counts: 9 rows, 7 🟢, 2 🟡, 0 🔴.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U10-1a | the byte-pinned copy's hash recomputes | 🟢 | the header's own `awk` command piped to `shasum -a 256` prints `e30720eb197f324c739cb2536d2de91f8d6037c4aad2a5ac877a80de9040c3b2`, equal to `body-sha256:`; the marker matches as a whole line `1` time; the header names `source: reviewer-l4, graded at 887e3eb2` as the §3 sentence requires | one space appended to body line 3: hash starts `772046263b97` |
| U10-1b | the handoff enumerates every edited line with a reprint command per quoted program line | 🟢 | 26 rows. Reprints I ran: `npm test 2>&1 \| tail -1` gives `✓ all 48 test files passed` (baseline 19, U7 handoff 46); `wrote figma/plugin/ui.html 3780.5 KB` (baseline 20); the `perl ... \| od -c` dump equals the four spans of the U6 verdict 34 to 37 up to trailing pad spaces; the hook line is `githooks/commit-msg:26` of the plugin. Per-file numstat agrees with the enumeration; in the three verdicts the word diff is `cited:` insertions, one fence to spans move and one Correction line each, no state glyph moved | the pre-fix cells at `887e3eb2` read `all 48 test files passed` with no check mark and no span |
| U10-2 | no fenced program output in files this PR touches | 🟢 | my own sweep over `git diff --name-only $BASE`: three files lose their fences (`records-refresh-U3.md` `2` to `0` fence lines, the U9 question `2` to `0`, the U6 verdict `2` to `0`); the fences left (adapter, architecture, U8 handoff, the two plans) hold file contents, scripts or plan text, read one by one | at `887e3eb2` the three fences hold an `npm ls` tree, the hook refusal and the `od -c` dump: `3`, where the review named `2`. A fenced `✓ all 48 test files passed` planted in `debt.md` makes the sweep print `1` |
| U10-3 | U4-1, U4-3, U4-5, U3-10 green | 🟢 | U4-1 `.sdlc/adapter.md`, `1`, `1`. U3-10 `1`, `1`, `1`. U4-3 `1`, then `:1`, `:1`, `:4`, `:1`, `:1`, then `0`. U4-5 `0`, frozen leg `9`, `branding: clean (502 files scanned)`, `exit 0` | P6 fixture: a prose dash counts, a spanned one does not (run at pre-land: `3` and `20`). U3-10 on `origin/main`: `0`, `0`, `0` |
| U10-3 note | U4-5's second leg can still bite | 🟡 | since revision 12 the leg diffs two fixed shas, `07ecb44c b9e70950`, so it prints `9` forever and no later edit can move it. The live control is now only the raw count against `BASE`: `16`, the same as at `887e3eb2`, and the delta adds `0` dashes raw | the frozen leg itself has no control, which is the finding; the live control it defers to is P6's fixture, where a planted dash in prose makes the stripped count `1` (conductor edit: the record check refuses an empty control cell) |
| U10-4 | check script exit 0, branding clean, `npm test` green | 🟢 | seven counted `ok`, the `note  head:` line, `stale total: 0`, `exit 0`; `branding: clean (502 files scanned)`, `exit 0`; `npm test` `exit 0`, `✓ all 48 test files passed`, tree `0`, 76 s at load `4.05` before and `8.91` after on 10 cores (band 56 to 60 s; a second seat's run overlapped, not a timing) | baseline row retyped to 47: `STALE tests: baseline 47, test/run.mjs TESTS 48`, exit `1`. `decision-records.md` copied into `.sdlc/verdicts/`: `FAIL: 3 branding violation(s) across 503 files`, `exit 1`. `"scrimX` clone: `exit 1`, `grep -c FAIL` `3`, `FAIL  refs-canonical  — ordered key set != canonical` altered: two leading spaces dropped |
| U10-5 | no file outside `.sdlc/` moves | 🟢 | `git diff --name-only 887e3eb2 HEAD \| grep -vc '^\.sdlc/'` prints `0`; P5 against `BASE`: `0`, `0`, `1	1`; P6 stripped `0` | `// probe` appended to `src/engine/motion.mjs`: `1` |
| Findings 2 and 4 | the K17 sha annotation and the three baseline sentences are true | 🟢 | `git merge-base c130dd13 origin/main` starts `d34b4fb1`, `--is-ancestor` exits `1`; `git show --name-only --format= 20298cca` lists `10` files, `0` under `test/`; `9a44f685` touches `0` files outside `test/` and adds `"repo/gate-report.mjs"` to `TESTS`; the U3 handoff Runs table has six rows alternating the two gates, status `0` on rows 2, 4, 6 | `d814500..20298cc` is `7` commits, so "two of the seven" is a count, not a guess |
| Regression U1-4 | the plan's F6 row still reads green at this head | 🟡 | `(#699) (#702)`, `0`, `0`. The third leg expects `1`: U10 reworded the sentence to `#699 (PR #702, 9a44f685) touched only files under`, so the literal `added one test file` is gone. The fact the row measures holds and is stated more exactly, but U3-7 names U1-4 as a standing regression row and it now prints red by the letter | at `887e3eb2` the same leg printed `1` |

## Findings, ranked

1. 🟡 U1-4's third grep no longer matches after U10's baseline rewording. Fix is plan text (the Conductor's): one revision row moving the pattern to `#699 (PR #702, 9a44f685) touched only files under`, before the pre-land rerun reads U3-7.
2. 🟡 U4-5's second leg is a constant since revision 12. Say so in the row, and name the raw count against `BASE` (`16` today) as the live dash control.
3. 🟡 The legacy cut quotes the handoff lists under Judged and left are real and unmarked; they need a ticket or a later unit, not this one.
4. 🟡 `npm test` 76 s against the 56 to 60 s band at load 4 to 9 with another seat's run overlapping. Not a regression signal on a records-only delta.

Must fix before merge into the plan branch: none. The pre-land record at `887e3eb2` is void once this merges; the rerun needs P1, P4 to P7, the assigned unit rows and finding 1's plan row.

Note, 2026-09-20 (conductor): reviewer-l2 passed this unit at a0faa7bc. The delta a0faa7bc..23a206b4 (two one-line edits plus the handoff) was read by the Orchestrator itself, not by a reviewer pass, and by this verifier. The U1-4 yellow is answered by plan revision 13.
