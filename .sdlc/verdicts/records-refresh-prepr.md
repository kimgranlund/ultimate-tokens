# Pre-PR · records-refresh · e60a4286
verdict: 🟢
sha: e60a4286c6cc4aed4a2458029586dec30e1ef68d
plan: .sdlc/plans/records-refresh.md (ticket #691), base origin/main @ 20298cc
written: 2026-09-19 by the conductor seat (single-agent mode, owner ruling Q15) from the fresh-context runs of records-refresh-prepr-reviewer (reviewer-l4) and records-refresh-prepr-verifier (verifier-l3); neither built any unit
gate note: the gate was proven with `adapter.py land --dry-run --gate` while this file was uncommitted at branch head e60a4286; the commit that adds this record is the only commit after e60a4286 and its whole delta is this file, as adopt-hygiene's record did at 48a69ae
counts: verifier 42 rows at 28e7a85d (38 🟢, 4 🟡, 0 🔴) plus the delta set at e60a4286 (4 🟢, 1 🟡 unchanged, 0 🔴); reviewer 0 🔴, 5 🟡 fixed in e60a4286, 6 ⚪

🟡 rows and why they do not block: U1-5, U2-5, U2-6 are criterion texts not re-worded after U3 and U4 landed; the substance each measures holds at both heads. U3-2 is `npm test` wall time (159 s, 187 s) outside the baseline band under load 23 to 32 on 10 cores with another seat's runner visible in `pgrep`; exit, summary and byte-stability match, and build and smoke sit inside their bands (contention, not regression). Review hygiene row: trailers, moot after the squash.

## Verifier notes (verbatim from the run)

Every row is this verifier's own run in a shared clone at 28e7a85d with no `node_modules` (`/tmp/prepr-vfy`); every editing control ran in a second clone (`/tmp/prepr-vfy-ctl`) reset between plants. 38 🟢, 4 🟡, 0 🔴.

Host: 10 cores; load 8.33 at start, 22.9 to 48.9 during the gate runs (other seats' `node test/run.mjs` visible in `pgrep` at every gate start). Every timing below was taken above the core count; summaries are unaffected, wall seconds are.

Substitutions (mechanical, none changes a criterion): `gh run view` needs `-R kimgranlund/ultimate-tokens` in a shared clone (no GitHub remote); BSD grep has no `-P`, so U4-4's two `grep -P` lines ran as `rg -P`; U2-8's `grep -c '\140'` is a backreference error to BSD grep and ran with a literal backtick; the cached plugin has no `board.py ids` yet (`grep -c 'board.py" ids' pre-commit` = 0, `ids --help` exit 2), so `B` and `GH` came from `unit/df-ids` of the plugin repo as U4 §Dependency says. U4 `BASE` = fc118ef6 (the U4 merge 92f977f6's first parent).

## Verifier rows at 28e7a85d

| Check | State | Evidence | Negative control |
|---|---|---|---|
| P1 `npm test`, no node_modules | 🟢 | `✓ all 48 test files passed`, exit 0, `git status --short` 0 lines, twice (159.0 s and 186.7 s wall, load 22.9 / 32.0 at end, user CPU 135 s both) | `"scrim`→`"scrimX` in role-table.json: `FAIL` x3 (`refs-canonical`), `✗ 1/48 test file(s) failed`, exit 1 |
| P2 `npm ci` + `npm run build` | 🟢 | ci exit 0 (5.8 s, node v24.18.0, vite@8.3.0); build exit 0, `ui.html 3780.5 KB` built = `ui.html 3780.5 KB` in baseline, status 0; 15.3 s cold under load 23, warm rerun 2.52 s | no node_modules: exit 127, `tsc: command not found` |
| P3 `npm run smoke` | 🟢 | `SMOKE PASS` count 1, exit 0, 21.6 s, status 0 | no `dist/`: `smoke: missing .../dist/ultimate-tokens.html`, no SMOKE PASS line |
| P4 branding | 🟢 | `branding: clean (460 files scanned)`, exit 0 | decision-records.md copied to docs/x.md: `FAIL: 3 branding violation(s) across 461 files` |
| P5 scope wall | 🟢 | `0` | `// probe` in src/engine/motion.mjs: `1` |
| baseline.md three summaries | 🟢 | 48 test files, 3780.5 KB, SMOKE PASS, each matches the recorded row | the U1-1 plants below (47 files, 3798.0 KB) each print STALE |
| U1-1 | 🟢 | seven `ok`, `stale total: 0`, exit 0 | timing 99.9: `STALE time test: baseline 56 to 100 s, adapter 56 to 60 s`; probe commit under src: `STALE head`; 3798.0: `STALE ui.html`; 47: `STALE tests`; each `stale total: 1` |
| U1-2 | 🟢 | `same` | `stale = 1`: hunk `10c10`, no `same` |
| U1-3 | 🟢 | `3`, `0` | baseline at 20298cc: `3`, `4`; a `2/3` cell: `2` |
| U1-4 | 🟢 | `20298cc` x3, `panda-smoke=success build-test=success` (run 35455937943) | run 34660177977: `464507f build-test=failure panda-smoke=success` |
| U1-5 | 🟡 | file set is `.sdlc/baseline.md` alone, but the command prints it twice (live row and U3's prior-set row); Expected "one line" was not amended for U3 | at 20298cc: `.sdlc/adapter.md`, `.sdlc/baseline.md`, `.sdlc/debt.md` |
| U1-6 | 🟢 | `0`, `0`, `1`, `1` | X12 row scans→walks: `1`; at 20298cc: `2`, `0`, `0` |
| U1-7 | 🟢 | `1`, `1`, `false false true` | at 20298cc: `0`, `0` |
| U1-8 | 🟢 | `.gitignore` x2, `0` | `check-ignore README.md` exit 1; `ls-files .claude/settings.json` 1; rules deleted from .gitignore: user-global path / nothing |
| U1-9 | 🟢 | `1 1 1 1`, `1`, `1`, `1`, `ancestor 1`, `10`, `0`, `0` | note reworded: `18 of the 72` count 0; at 20298cc note count 0; `180eca0` ancestor 0; K3 row deleted: `1`; tonal.js diff prints (121/23), hct.js nothing |
| U2-1 | 🟢 | `1`, nothing, `6` | `## 9. Notes` appended: `NOT LAST`; at 20298cc: `0` |
| U2-2 | 🟢 | `20298cc` x5 | §8 sha → f9e20c5: third line `f9e20c5` |
| U2-3 | 🟢 | `rows 56 drifted 11 holds 45 undetermined 0 bad 0`, exit 0, `7` | line cite 9999: `QUOTE DD1: not found at .claude/CLAUDE.md:9999`; states blanked: `STATE DD…`, `bad 47`, exit 1; `53-role` seed removed: `6`; at 20298cc script absent |
| U2-4 | 🟢 | `same` | `bad = 1`: hunk `10c10` |
| U2-5 | 🟡 | `1`, `1`, `0`, `3`, `1`: the 3 debt deletions are rows C5, C6, C7 (U4's rewrite); U4 amended U1-9's exclusion but not U2-5's; with U1-9's `(P3\|C[5-7])` form it prints `0` | rerun sentence spliced into U1's note: `0`; K3 row removed: `1` |
| U2-6 | 🟡 | `18`, `0`, `0`: the U2 handoff reads `measured at d814500` (1), its head when written; the merge base moved to 20298cc after it (plan step 10: regression only) | K7 hits cell blanked: `18`, `1` |
| U2-7 (pre-land) | 🟢 | `1`, `18`, `0`, `0`, `3` (three lines name 20298cc: the Graded header "at d46ae48 … merge base … 20298cc", the K17 row, the closing note; Expected `1` is a presence count) | K9 emoji removed: `1`; K4 cell blanked: `1`; at 20298cc Pass 5 count 0 |
| U2-8 (pre-land, C31 block) | 🟢 | `6`, `18 18`, `18`, `1` (raw 7), `17 18`. Substitutions: Module map = §1 Layering and dependency direction; verdict row count scoped to Pass 5 (whole file 20 K rows, passes 1 to 4 kept); mutation moved to the K1 row (on A1 as written: `18 18`); `'\140'` run as a literal backtick | at 20298cc section grep `5`; A1 mutation `18` |
| U3-1 | 🟢 | seven `ok`, `stale total: 0`, exit 0, `20298cc` | a prior row headed `\| \`npm test\` \|` above the live table: `STALE tests: baseline 47`, `stale total: 2`; plus U1-1's four plants |
| U3-2 | 🟡 | file part `3 1 1 1 0 3 1` as expected; my runs: build 2.52 s warm (band 0.67 to 6.12) and smoke 21.6 s (band 9.1 to 36.5) inside, last lines equal; `npm test` 159 s and 187 s against 56.27 · 56.43 · 59.83 (band 28 to 120), outside double, both under load 23 to 32 with another seat's `node test/run.mjs` in pgrep; Risks row: 🟡 note, not a rerun | the P1 scrim plant fails the last line; a timing of 99.9 in the file trips U3-1 |
| U3-3 | 🟢 | `20298cc` x3 + both `success` | run 34660177977: `build-test=failure` |
| U3-4 | 🟢 | `0`; `20298cc` x5; `rows 56 … bad 0`; `same`; `56`; `56`; `0`; `15`; `15` (M = 15, not the planner's 14) | `sed s/d814500/20298cc/g`: first line `0` with no re-check; DD19 row deleted: `rows 55`, `55`; DD19 handoff cell `n`: `14` |
| U3-5 | 🟢 | `1` | bullet `12 drifted, 44 hold`: `0` |
| U3-6 | 🟢 | `1`, `1`, the five-name filter echoed, `0` | `ui/counts.mjs` dropped from the cell: prints `ui/counts.mjs`; tracked `test/engine/zzz.mjs`: `engine/zzz.mjs`; the 20298cc three-name filter on this tree: `4` |
| U3-7 | 🟢 | `0`, `3`, `3` | timing 99.9: `2`; X12 reworded: `1` |
| U3-8 | 🟢 | `9 0 0 0 3 1 1 1` | fixture load-after 12.3: `1`; pgrep cell `812 node test/run.mjs`: `1`; `47 test files` row: `2` |
| U3-9 | 🟢 | `0`, `0` | probe: `1`; tracked zzz.mjs plant: `1` |
| U3-10 | 🟢 | `18 0 0 1 1` | K7 blanked: `1`; K18 removed + K9 cut to four columns: `17`, `1`; `exception` altered: `0` |
| U4-1 (pre-land) | 🟢 | nothing, `exit 0` | X13→C13: `adapter.md:115: C13 defined in a adapter file; owner kind ['plan']`, exit 1; `$F/nope`: `board.py: no such directory`, exit 2; at 695f13fb: 13 lines |
| U4-2 (pre-land) | 🟢 | `commit 0`, no refused line | at BASE: 13 refusal lines + `board.py ids refused an id defined outside its owning file`, `commit 1`; roadmap commit at BASE: `commit 0`; non-ff merge staging unrenamed adapter at BASE: `merge 1` (13 lines), at head: `merge 0` |
| U4-3 | 🟢 | nothing, `0` | X12 reworded: `1`; X13→X14: `< \| C13 \|` / `> \| X14 \|` pair |
| U4-4 | 🟢 | `X1,…,X13`, `0`, `0`, `0`, `24`, `1` | `conflict X9`→`C9`: `1`, `23`; at 20298cc: `13`, `18`, `1` |
| U4-5 | 🟢 | `0`, `3`, `0`, `0`, `0`, then `2` at HEAD: `.sdlc/questions/survey-2026-09-18-approval.md` +14 (Q14/Q15, commits a856843a/28e7a85d after the U4 merge); over U4's own ranges 695f13fb..d04b6824 and fc118ef6..92f977f6: `0` | `adapter C9 says so` planted in CLAUDE.md: `1`; sweep at 20298cc: `13` |
| U4-6 | 🟢 | U4 merge diff = `.sdlc/adapter.md,.sdlc/debt.md,.sdlc/handoffs/records-refresh-U4.md` (HEAD vs BASE adds board/plan/questions from the post-merge orchestrator commits); em dash `1`, `1`; `branding: clean (460 files scanned)`, exit 0 | em dash typed into the amendment: `1`, `2` |
| U4-7 | 🟢 | `0 0 0 0` | pre-amendment U1-6 command: `23` |
| `sh .sdlc/checks/baseline-agrees-check.sh` | 🟢 | seven `ok`, `stale total: 0`, exit 0 | see U1-1 |
| `sh .sdlc/checks/doc-drift-rows-check.sh` | 🟢 | `rows 56 drifted 11 holds 45 undetermined 0 bad 0`, exit 0 | see U2-3 |

## Verifier delta rows at e60a4286 (the records-only fix commit)

| Check | State | Evidence | Negative control |
|---|---|---|---|
| P4 branding | 🟢 | `branding: clean (460 files scanned)`, exit 0 | the decision-records copy at 28e7a85d: `FAIL: 3 branding violation(s)` |
| P5 scope wall | 🟢 | `0` | probe in src/engine/motion.mjs at e60a4286: `1` |
| U2-5 | 🟡 | `1`, `1`, `0`, `3`, `1`; the 3 are debt rows C5, C6, C7 (U4's), `0` with U1-9's `(P3\|C[5-7])` exclusion; unchanged from 28e7a85d | K3 row removed at 28e7a85d: `1` |
| U4-5 | 🟢 | sweep `0`, `3`, `0`, deletions `0`, `.claude` sweep `0`; history diff vs BASE fc118ef6 now lists 3 files: the questions file (+14, Q14/Q15) and the two verdict files e60a4286 itself edits (the em dash fix, the close-out note), none by U4; over U4's own ranges 695f13fb..d04b6824 and fc118ef6..92f977f6: `0`, `0` | the planted `adapter C9 says so` line at 28e7a85d: `1` |
| `doc-drift-rows-check.sh` | 🟢 | `rows 56 drifted 11 holds 45 undetermined 0 bad 0`, exit 0 | the 9999 line cite at 28e7a85d: `QUOTE DD1`, exit 1 |
| `baseline-agrees-check.sh` (reads HEAD, rerun as a guard) | 🟢 | `stale total: 0`, exit 0 | the U1-1 plants |

## Reviewer rows (reviewer-l4, whole diff)

| Check | State | Evidence | Negative control |
|---|---|---|---|
| review: scope | 🟢 | reviewer-l4 at 28e7a85d: 23 files, all `.sdlc/` plus `.gitignore`; 60 commits, 2 merges | a probe path outside `.sdlc/` would list under `git diff --name-only origin/main...HEAD` |
| review: integration U1 to U4 | 🟢 | baseline-agrees 7 ok / stale 0; doc-drift rows 56 bad 0; U1 notes and U2 rerun note compose; U4 rename leaves no C-id in live records | `baseline-agrees-check.sh` prints STALE lines when a baseline number is edited (U1-1 control) |
| review: stale text the diff invalidates | 🟢 after e60a4286 | five 🟡 cells found at 28e7a85d (board U2 Next, board U4 grade, roadmap row 1, U4 verdict close-out, one em dash in the U1 verdict) fixed in e60a4286, a records-only commit | `git diff 28e7a85d e60a4286 --stat`: `.sdlc/board.md`, `.sdlc/roadmap.md`, two verdict files, nothing else |
| review: commit hygiene | 🟡 | 15 of 58 non-merge branch commits carry `Seat:` only, no `Co-Authored-By`; moot after the squash, the PR body carries attribution; every board commit has `Seat: orchestrator` | a board commit without the trailer is refused by the commit-msg hook (adapter C7) |
| review: secrets, config, dependencies | 🟢 | `.gitignore` gains `.claude/settings.local.json` and `.sdlc/launcher.env` only; no dependency change; no secret pattern in the diff | hygiene greps from survey C12 rerun on the diff: 0 |
