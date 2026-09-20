---
status: proposed
ticket: #709
priority: P1
lane: docs
size: S + S + M + S + S + S (U1 S = 1 point, U2 S = 1, U3 M = 2, U4 S = 1, U5 S = 1, U6 S = 1; 7 points)
labels: kind:chore · size:big · lane:docs · P1 (as minted on #709)
written: 2026-09-19
head: d34b4fb1 (`origin/main`; `plan/records-followup` is cut from it, local only, not pushed)
branch: plan/records-followup
inputs: ticket #709; the pre-land review of records-refresh (reviewer-l3, graded at 0dabfd1a; sha256 6a3a285e91555f7b545a828969402d227e35c58626ec47e473bf273f041c1481, 5297 bytes, still in the Lane B scratchpad); .sdlc/plans/archive/records-refresh.md; .sdlc/adapter.md; .sdlc/baseline.md; owner rulings of 2026-09-19 (Conductor channel)
---

# Repair the records that landed untrue with PR #708: nine surviving pre-land findings, one falsified quotation, and the stale roadmap

PR #708 (#691) landed at 28c2e8cc before its pre-land review was answered. The review was FIX-FIRST with ten findings. Nine survive on main at d34b4fb1 (F9 is fixed), and a parallel pre-land pass added an eleventh: a verdict rewrote a line of real program output so it would pass the no-em-dash rule.

Owner rulings, 2026-09-19. Fix everything, F5 and F7 included. `.sdlc/roadmap.md` is its own unit and its own commit, apart from the record repairs. This conductor session and Lane B drive.

Root cause, not only the symptoms. Three of the findings (F3, F7, F11) have one shape: a record holds a second copy of something a program prints, and nothing compares the copy with the program. records-refresh fixed that shape for the test count and the three timed gates. This plan finishes it for the other two gates, for the negative control's count, and for quoted output, and it makes the comparison a command each time.

Scope wall. Only paths under `.sdlc/` change. `.sdlc/roadmap.md` changes in U5 only and lands as its own PR (see Landing). `.claude/CLAUDE.md`, `src/`, `test/`, `scripts/`, `mcp/`, `figma/` are untouched.

Prose rules for every line this plan adds. No em dash outside an inline backtick span that quotes program output (U4 writes that exemption down; until U4 merges, U1 to U3 add no quoted output that carries one). The retired maker brand and the pre-rename element identifier are paraphrased, never quoted. No bold inline labels, except the adapter's own amendment opener, which is that file's shape.

Host note. `grep -P` is absent on this host. Every PCRE below runs through `perl` or `git grep -P` (git carries its own PCRE; measured working at d34b4fb1).

Criteria ids follow the archived plan: P rows for the plan, numbered rows per unit, cited as U3-2.

## Measured by the planner on 2026-09-19 at d34b4fb1

Every "measured" value in the tables below comes from this list. Host load was 118 to 311 on 10 cores throughout, so no timing here is a baseline figure; counts and strings are load-independent.

| Fact | Value |
|---|---|
| P1 negative control, throwaway clone, `"scrim` to `"scrimX` in `role-table.json`, then `npm test` | exit 1; `grep -c FAIL` prints `3` (the runner's file line, the gate line, the `FAIL: 1 gate failure(s)` line); last line reports 1 of 48 test files failed; 175.88 s at load 293 to 118, not a timing |
| The gate line that control prints, from `test/gate-report.mjs:82` | two spaces, `FAIL`, two spaces, `refs-canonical`, two spaces, a U+2014 dash, one space, `ordered key set != canonical` |
| `.sdlc/verdicts/records-refresh-U1.md:37` quotes it as | `refs-canonical, ordered key set != canonical` (a comma where the program prints the dash): the falsified quotation |
| `test/smoke/smoke.mjs:293` prints | `SMOKE PASS`, a U+2014 dash, then the four surfaces; `.sdlc/baseline.md:20` and four lines of `.sdlc/handoffs/records-refresh-U3.md` write a colon there, and `.sdlc/verdicts/records-refresh-U3.md:78` spells the glyph out in words |
| `npm run gate:corpus-contrast` | exit 0, tree clean after; prints `(343 curated documents, 3780 palettes (3420 carrying a non-zero lift or skew), 22680 accent/on-color cells; 504 named per cell, 0 carried below 4.5)` and three lines of `7560 cells`, one per tone mode; 48.55 s at load 190, not a timing |
| `npm run gen:type-fonts` | exit 0, tree clean after, 1.00 s at load 50, not a timing |
| CI run 35455937943 on 20298cc, `gh run view --json jobs` | four jobs, all success: `build-test`, `panda-smoke`, `corpus-contrast`, `deploy` |
| `sh .sdlc/checks/baseline-agrees-check.sh` | seven `ok`, `stale total: 0`, exit 0 (d34b4fb1 equals 20298cc outside `.sdlc/`) |
| Shas in `.sdlc/baseline.md` that are not in `origin/main`'s history | one: `b50a4b9b` |
| `git log --oneline d814500..20298cc -- test/run.mjs` | one commit, 9a44f685, subject ends `(#699) (#702)` |
| Ids defined (first table cell) in more than one live record, over adapter, architecture, baseline, debt, survey, roadmap, board | 22: `C1` to `C7` (debt, survey), `K9 K11 K14 K17 K18` (architecture, debt), `P1` to `P4` (architecture, debt), `X1` to `X6` (adapter, architecture) |
| Prefix `XC` followed by digits anywhere under `.sdlc`, `.claude`, `README.md` | 0 hits. Also 0: `CP`, `XP`, `Y`, `Z`, `J`. Not free: `N` 1, `W` 2, `V` 3, `E` 28, `M` 34 |
| The plugin's `board.py ids` (from the plugin repo's `plan/drill-findings` @ 08f3e1b) over `.sdlc` | exit 0 at d34b4fb1 and exit 0 after the simulated U2 rename; its id shape is one uppercase letter, so a two-letter prefix is outside what it reads |
| Roadmap against live facts | worktree table lists 4 that are gone (`638-dual-radix`, `672-citation-predicate`, `673-color-prune-librarymode`, `674-adia-warning`) and omits 2 that exist (`pif-u2-ramp`, `pif-u4-integration`); "Nine worktrees" over 8 rows; ranked rows for 6 closed tickets (#638 #672 #673 #674 #676 #691) and none for 3 open ones (#686 #701 #709); one `Your move` line |
| Branding gate | `branding: clean (461 files scanned)`, exit 0. With `decision-records.md` copied to `.sdlc/verdicts/x.md` in the clone: `FAIL: 3 branding violation(s) across 462 files`, so the gate scans `.sdlc/verdicts/` and exempts nothing there |
| Em-dash enforcement | no test, script, hook or workflow enforces it. It is the owner's prose rule, applied by plan criteria that count added lines |

## Criteria (plan-level, run by each builder, again by each verifier, again at pre-land)

Every negative control that edits a file runs in a throwaway clone (`git clone -q --shared . "$F/neg"`, `F="$CLAUDE_JOB_DIR/tmp"`), never in a unit worktree. In every table cell `\|` is the table's escape for a plain `|`: type it unescaped. A literal pipe inside a regex is written `[|]`. `BASE` is `$(git merge-base origin/main HEAD)`. `EM` is `$'\xe2\x80\x94'` (bash or zsh).

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, tree byte-stable | `npm test 2>&1 \| tail -1; git status --short \| wc -l` | the runner's pass line with N equal to the length of `TESTS` in `test/run.mjs` (48 at d34b4fb1), then `0` | in the clone: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test > "$F/neg.log" 2>&1; echo "exit $?"; grep -c FAIL "$F/neg.log"` prints `exit 1` then `3` (measured today). U1-3 reuses `$F/neg.log`; U4-2 reuses its gate line |
| P2 | `npm run build` green and prints the size the live baseline row records (pre-land only; this is F8's corrected form, scoped to the live row) | `npm ci >/dev/null 2>&1; npm run build > "$F/build.log" 2>&1; echo "exit $?"; grep -o 'ui.html [0-9.]* KB' "$F/build.log" \| head -1; grep '^[|] `npm run build` [|]' .sdlc/baseline.md \| grep -o 'ui.html [0-9.]* KB'; git status --short \| wc -l` | `exit 0`, the same `ui.html NNNN.N KB` string twice, `0` | the uncorrected grep over the whole file prints two different strings at d34b4fb1 (`3780.5` live, `3777.8` prior set), which is why the archived form could not pass. No `node_modules`: exit 127 |
| P3 | `npm run smoke` green (pre-land only, and only if U3 took the full re-measure path) | `npm run smoke 2>&1 \| grep -c 'SMOKE PASS'` | `1` | in the clone with no `dist/`: `node test/smoke/smoke.mjs` exits 1 with `smoke: missing dist/ultimate-tokens.html` |
| P4 | branding gate clean | `bash -c 'set -o pipefail; node test/repo/branding.mjs \| tail -1; echo "exit $?"'` | `branding: clean (N files scanned)`, `exit 0` | in the clone: `cp docs/reference/references/decision-records.md .sdlc/verdicts/x.md && node test/repo/branding.mjs \| tail -1` prints `FAIL: 3 branding violation(s) across 462 files` (measured today) |
| P5 | scope wall: nothing outside `.sdlc/` differs from the merge base, and on `plan/records-followup` the roadmap does not differ either | `git diff --name-only $BASE \| grep -vcE '^\.sdlc/'; git diff --name-only $BASE \| grep -c '^\.sdlc/roadmap\.md$'` | `0`, `0` (on the U5 branch the second line is `1` and the first stays `0`) | `echo "// probe" >> src/engine/motion.mjs` in the clone: first line `1`. `echo >> .sdlc/roadmap.md`: second line `1` |
| P6 | no em dash added in prose, by the measure U4 writes down | `git diff -U0 $BASE -- .sdlc \| grep '^+' \| perl -pe 's/\x60[^\x60]*\x60//g' \| LC_ALL=C grep -c "$EM"` | `0` | fixture measured today: a `+` line with the dash in prose counts `1`; the same dash inside a backtick span counts `0`; without the `perl` strip the two lines count `2` |
| P7 | the landing rule ruled for every plan that lands after #691: the baseline's test-file figure equals `TESTS.length`, checked by script at the pre-land head | `sh .sdlc/checks/baseline-agrees-check.sh; echo "exit $?"` | every line `ok`, `stale total: 0`, `exit 0` (seven lines before U3, nine after) | records-refresh measured the plants: a baseline figure of 47 against 48 in `TESTS` prints `STALE tests:` and exits 1. If another plan lands first and raises `TESTS`, U3 takes its full path and this row is how pre-land sees it |

## Units

- [ ] U1 (S) the five one-cell repairs: F1 `debt.md` K17 note, F2 `architecture.md` rerun note, F3 `adapter.md` negative-control line, F6 and F10 `baseline.md` · grade l1 · reviewer-l1 · verifier-l1
- [ ] U2 (S) the id collision F4: `architecture.md` §4 rows X1 to X6 become XC1 to XC6, one dated note carries the map, the three `debt.md` notes say what is true · grade l1 · reviewer-l1 · verifier-l1 · after U1 merges
- [ ] U4 (S) the verbatim-quote rule F11, written once in `adapter.md` §3, and the five altered quotes restored from program output · grade l2 · reviewer-l1 · verifier-l1 · after U2 merges
- [ ] U6 (S) F8 as a dated corrections file beside the archive, the review copied into `verdicts/`, one dated note under pass 5 · grade l1 · reviewer-l1 · verifier-l1 · after U4 merges
- [ ] U3 (M) F7: `baseline.md` becomes the one home for all five gates, measured on a quiet host; the check script reads all five; the adapter loses its copied arithmetic and job count · grade l2 · reviewer-l1 · verifier-l1 · after U6 merges, and only in a quiet slot
- [ ] U5 (S) F5: `.sdlc/roadmap.md` regenerated from live facts, on its own branch, its own commit, its own PR · grade l2 · reviewer-l1 · verifier-l1 · after the first PR lands

Order. The units touch overlapping files (`adapter.md` in U1, U3, U4; `baseline.md` in U1, U3, U4; `architecture.md` in U1, U2), so they run in series, one merge at a time. U3 is late because it waits for a quiet host and nothing else should wait with it. U5 is last because a roadmap is a snapshot and the first PR's landing changes what it must say.

Grades. The Orchestrator's table puts docs at l1. U1, U2 and U6 stay there: each edit is given below as exact text or as a mechanical map, and each has a criterion that catches a transcription slip by construction (U1-6 counts changed lines, U2-3 maps the rename back to the base file, U6-2 compares a hash). U3 goes one up to l2 for the reason the archived plan gave for its measuring units: it transcribes six or fifteen timed runs and edits a script, and a plausible number nobody measured is the defect this ticket exists for. U4 goes to l2 because it authors a rule other plans will be graded against. U5 goes to l2 because it reads about forty live facts from `gh` and `git` and ranks nothing; the failure mode is a row copied from the old file. The checker pair stays reviewer-l1 and verifier-l1 (opus, outside the sonnet builder's family). Every reviewer dispatch names `.claude/agents/change-reviewer-agent.md` §What to check (adapter conflict row X2).

### U1 (S, grade l1): five one-cell repairs

Each edit is in place, one line changed per finding. No other line in the four files moves.

#### Texts

- F1, `.sdlc/debt.md`, the K17 row. `the control filters 3 files by name` becomes `the control filters 7 files by name (at 20298cc; the list is the exception cell of architecture K17, which is the copy to trust)`.
- F2, `.sdlc/architecture.md`, the rerun note. `pass 5 stays graded at `d814500`` becomes `pass 5 stays graded at `d46ae48` (its own header; a plan-branch sha the squash dropped, whose merge base with `origin/main` was `20298cc`)`. The earlier clause of the same note, that U2 ran the controls at `d814500`, is true and stays.
- F3, `.sdlc/adapter.md` §1, the second rule bullet. The parenthesis `(corrupt `docs/reference/data/role-table.json`, expect 17 FAIL)` becomes:

```text
(in a throwaway clone: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json`, then `npm test`. It exits 1, `engine/semantic.mjs` is the one failing file, and the `refs-canonical` gate is the one failing gate. `grep -c FAIL` printed 3 for this corruption at `d34b4fb1`; a different corruption or a different grep gives a different count, so grade on the exit, the file and the gate, and record the count you measured)
```

The builder runs the control first (P1's control cell) and writes the count it measured. If it is not 3, it writes its own number and sha and tells the Orchestrator.

- F6, `.sdlc/baseline.md`, the prior-set paragraph. `Kept because #706 (`d814500..20298cc`: TypeScript 6 to 7, vite 8.0 to 8.3, Node 24 in CI, one test file added to `TESTS`) changed the toolchain` becomes `Kept because the seven commits of `d814500..20298cc` changed what the live table describes: #706 moved the toolchain (TypeScript 6 to 7, vite 8.0 to 8.3, Node 24 in CI) and #699 (PR #702, 9a44f685) added one test file to `TESTS`. They changed the toolchain`. Read the sentence after the edit and keep it grammatical; the facts above are the fixed part.
- F10, `.sdlc/baseline.md`, the intro sentence. `in the unit worktree at `plan/records-refresh` @ `b50a4b9b`, whose tree equals` becomes `in the U3 unit worktree of plan records-refresh, whose tree equals`. No plan-branch sha replaces it: the sentence already says the tree equals `ref`, and `ref` is a main sha.

#### Criteria

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| 1 | F1: the number in debt K17 equals what the K17 listing finds in the tree | `git ls-files test \| grep "\.mjs$" \| sed "s#^test/##" \| while read f; do grep -q "\"$f\"" test/run.mjs \|\| echo "$f"; done \| wc -l \| tr -d ' '; grep -o 'filters [0-9]* files by name' .sdlc/debt.md` | `7`, `filters 7 files by name` | at d34b4fb1: `7`, `filters 3 files by name` (measured) |
| 2 | F2: the sha the map names for pass 5 is the sha pass 5's own header names | `grep -o 'pass 5 stays graded at `[0-9a-f]*`' .sdlc/architecture.md \| grep -o '`.*`'; sed -n '/^## Pass 5/,$p' .sdlc/verdicts/architecture.md \| grep -m1 -o '^Graded [0-9-]* at `[0-9a-f]*`' \| grep -o '`.*`'` | the same backticked sha twice (`d46ae48`) | at d34b4fb1 the two lines differ: `d814500`, `d46ae48` (measured) |
| 3 | F3: the adapter states what the control reproduces, and the verifier's own run agrees with it | P1's control, then `grep -c 'expect 17 FAIL' .sdlc/adapter.md; grep -o 'printed [0-9]* for this corruption' .sdlc/adapter.md; grep -c FAIL "$F/neg.log"; grep -c 'engine/semantic.mjs *FAIL' "$F/neg.log"; grep -c 'FAIL  refs-canonical' "$F/neg.log"` | `0`, `printed 3 for this corruption`, `3`, `1`, `1` (the second and third lines carry the same number) | at d34b4fb1 the first line is `1` and the second is empty (measured). A clone with no corruption: `grep -c FAIL` prints `0`, so the count is the control's and not noise |
| 4 | F6: the baseline credits the test file to the commit that added it | `git log --format=%s d814500..20298cc -- test/run.mjs \| grep -o '(#[0-9]*) (#[0-9]*)$'; grep -c 'Node 24 in CI, one test file added' .sdlc/baseline.md; grep -c '#699 (PR #702, 9a44f685) added one test file' .sdlc/baseline.md` | `(#699) (#702)`, `0`, `1` | at d34b4fb1: `(#699) (#702)`, `1`, `0` (measured) |
| 5 | F10: every sha the baseline cites is in `origin/main`'s history | `for s in $(perl -ne 'print "$1\n" while /(?<![0-9a-f])([0-9a-f]{7,40})(?![0-9a-f])/g' .sdlc/baseline.md \| grep '[a-f]' \| grep '[0-9]' \| sort -u); do git merge-base --is-ancestor $s origin/main 2>/dev/null \|\| echo "NOT $s"; done \| wc -l \| tr -d ' '` | `0` | at d34b4fb1: `1`, the line is `NOT b50a4b9b` (measured) |
| 6 | the unit changed five lines and nothing else, and the check script still agrees | `git diff -U0 $BASE -- .sdlc/debt.md .sdlc/architecture.md .sdlc/adapter.md .sdlc/baseline.md \| grep -c '^-[^-]'; git diff -U0 $BASE -- .sdlc/debt.md .sdlc/architecture.md .sdlc/adapter.md .sdlc/baseline.md \| grep -c '^+[^+]'; git diff --name-only $BASE \| sort \| paste -sd, -; sh .sdlc/checks/baseline-agrees-check.sh \| tail -1` | `5`, `5`, the four files plus `.sdlc/handoffs/records-followup-U1.md`, `stale total: 0` | a sixth reworded line prints `6`, `6`; a fifth file in the list is the wall |

### U2 (S, grade l1): one id, one thing (F4)

Decision. `architecture.md` §4 gives way, not the adapter. Reasons: the plugin's plan-rules (its `plan/drill-findings` branch) reserves `X<n>` for ids the adapter mints, so moving the adapter again would break that reservation one day after U4 of records-refresh adopted it; the adapter side is 24 lines plus 3 debt notes and a map that would need a second hop, the architecture side is 6 rows and 1 header sentence; and nothing outside `architecture.md` cites its X rows except its own verdict, which is history. New prefix: `XC` (cross-cutting). Measured free across `.sdlc`, `.claude` and `README.md`, and outside the one-letter shape the plugin's id check reads.

#### Texts

- `.sdlc/architecture.md` §4: the first cell of the six rows `X1` to `X6` becomes `XC1` to `XC6`. The header sentence `(A-, T-, P-, X-, L- ids)` becomes `(A-, T-, P-, XC-, L- ids)`.
- One note appended directly under the §4 table: `Renamed <date> (plan records-followup U2, #709): these rows were X1 to X6 until this date, same numbers, same rows. The adapter's conflict rows took X1 to X13 on 2026-09-19, so X1 to X6 named two things in two live records. `.sdlc/verdicts/architecture.md` grades these rows under their old ids and was not rewritten: X<n> there means XC<n> here.`
- `.sdlc/debt.md`, the last cell of rows C5 and C6: the clause `the shared prefix that made this a reading hazard is gone` becomes `that pair no longer shares a prefix. The rename moved the collision to architecture §4 (X1 to X6) until records-followup U2 renamed those rows XC1 to XC6 on <date>. This debt id still shares its id with a 2026-09-16 survey claim`. Row C7's `same history as C5 and C6` stays: it points at the corrected cells.
- The sweep's other 16 shared ids (debt and survey `C1` to `C7`, debt and architecture `P1` to `P4`, the five K rows debt keys to their convention on purpose) are recorded under Not in scope. U2 does not touch them.

#### Criteria

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| 1 | no X id is defined in two live records, and the sweep reads `architecture.md` | `for f in adapter architecture baseline debt survey roadmap board; do perl -ne 'print "$1 $ARGV\n" if /^[|] ([A-Z]{1,3}-?\d+[a-z]?) [|]/' .sdlc/$f.md; done \| sort -u \| awk '{n[$1]++} END{for(i in n) if(n[i]>1) print i}' \| sort -V \| paste -sd, -` | `C1,C2,C3,C4,C5,C6,C7,K9,K11,K14,K17,K18,P1,P2,P3,P4` (measured on the simulated rename) | at d34b4fb1 the same list ends `,X1,X2,X3,X4,X5,X6` (measured). Dropping `architecture` from the file list at d34b4fb1 prints only `C1` to `C7`, no X at all, which is the omission F4 names: the list must name all seven files |
| 2 | the new prefix was owned by nobody before this unit | `git grep -P '(?<![A-Za-z0-9-])XC[0-9]+(?![0-9A-Za-z])' $BASE -- .sdlc .claude README.md \| wc -l \| tr -d ' '` | `0` | the same command with `X` for `XC` prints `104` at d34b4fb1 (measured), so the sweep can see a taken prefix |
| 3 | the rename is the only change to the map: mapping XC back to X reproduces the base file except the appended note | `UB=$(git merge-base plan/records-followup HEAD); diff <(git show $UB:.sdlc/architecture.md) <(perl -pe 's/(?<![A-Za-z0-9-])XC([1-6])(?![0-9a-z])/X$1/g; s/XC-, L- ids/X-, L- ids/' .sdlc/architecture.md) \| grep '^[<>]' \| grep -vc '^> Renamed 20\|^> $'` (bash). `UB` is where the unit branch left the plan branch, so U1's merged line is in the base | `0` | simulated today without the note: `0` changed lines of any kind. A reworded evidence cell prints `2`; a row renamed `XC7` prints `2`, because the map covers 1 to 6 |
| 4 | the six rows and the note are there; no X-headed row is left in §4 | `awk '/^## 4\. /,/^## 5\. /' .sdlc/architecture.md \| grep -oE '^[|] XC[0-9]+ [|]' \| tr -d '\| ' \| paste -sd, -; awk '/^## 4\. /,/^## 5\. /' .sdlc/architecture.md \| grep -cE '^[|] X[0-9]+ [|]'; grep -c '^Renamed 20[0-9-]* (plan records-followup U2, #709)' .sdlc/architecture.md` | `XC1,XC2,XC3,XC4,XC5,XC6`, `0`, `1` | at d34b4fb1: an empty line, `6`, `0` |
| 5 | the debt notes stopped claiming the hazard is gone | `grep -c 'reading hazard is gone' .sdlc/debt.md; grep -c 'renamed those rows XC1 to XC6' .sdlc/debt.md; git diff -U0 $BASE -- .sdlc/debt.md \| grep '^-[^-]' \| grep -vcE '^-[|] (C5\|C6\|K17) [|]'` | `0`, `2`, `0` | at d34b4fb1: `2`, `0`, `0` |
| 6 | the plugin's id check still accepts the tree (regression on records-refresh U4) | `git -C "$PLUGIN" show plan/drill-findings:plugins/sdlc/scripts/board.py > "$F/board.py"; python3 "$F/board.py" ids .sdlc; echo "exit $?"` with `PLUGIN` the sdlc plugin's repo (the target of the `core.hooksPath` symlink, two levels up) | nothing, `exit 0` | records-refresh U4-1 measured the bite: an adapter row headed `C13` prints one refusal line and exits 1 |

### U4 (S, grade l2): quote program output verbatim (F11)

What is enforced today, measured. `test/repo/branding.mjs` bans three strings and scans every `.sdlc/` file with no exemption for quotes (adapter conflict row X12 says so on purpose). Nothing enforces the no-em-dash rule: it is the owner's prose rule, applied by plan criteria that count added lines. So the branding gate needs no change and gets none, and the dash rule needs its measure written down so a verbatim quote stops tripping it.

#### Texts

The rule, written once, as an amendment appended at the end of `.sdlc/adapter.md` §3 in the file's own shape. The builder types the opener as the file does (`**Amendment (<date>).**`) and then:

```text
Verbatim-quote rule (ticket #709, pre-land ruling 2 on records-refresh). Text a program printed is quoted byte for byte, glyphs included, inside an inline backtick span, one span per line of output. The no-em-dash rule is a prose rule and measures prose: a plan's added-line count strips backtick spans first (`perl -pe 's/\x60[^\x60]*\x60//g'`), so a verbatim quote never trips it and is never reworded to pass it. If a quote has to change (cut short, or a banned string removed), the cell says `altered:` and what changed, next to the quote. The branding gate (`test/repo/branding.mjs`, row X12) has no quote exemption and gets none: a quote that would carry one of its three banned strings is cut before that string and marked `altered: retired name removed`. Copy a quote from the program's output or its source line, never from another record.
```

Restoring the five altered quotes. Each restored quote is copied from the program, not from this plan: the gate line from `grep -o 'FAIL  refs-canonical.*' "$F/neg.log"` (P1's control), the smoke line from `grep -o 'SMOKE PASS[^"]*' test/smoke/smoke.mjs`.

- `.sdlc/verdicts/records-refresh-U1.md:37`: the span `refs-canonical, ordered key set != canonical` becomes the gate line as printed.
- `.sdlc/baseline.md:20`: the smoke summary cell becomes the smoke line as printed, in a backtick span.
- `.sdlc/handoffs/records-refresh-U3.md`, the four lines that write `SMOKE PASS:`: the same.
- `.sdlc/verdicts/records-refresh-U3.md:78`: the span that spells the glyph out becomes the smoke line as printed.
- Each of the two verdicts and the handoff gains one appended last line: `Correction (<date>, plan records-followup U4, #709): a quotation of program output in this file had been reworded to avoid an em dash. It now reads as the program prints it. Rule: `.sdlc/adapter.md` §3, Verbatim-quote rule.` In `records-refresh-U3.md` the line adds: `Note 2 above describes the colon form; the baseline and the handoff were restored on the same date.`

#### Criteria

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| 1 | the rule is written once, in the adapter, and says the three things | `git grep -l 'Verbatim-quote rule (ticket #709' -- .sdlc ':!.sdlc/plans' \| paste -sd, -; grep -c 'Verbatim-quote rule (ticket #709' .sdlc/adapter.md; awk '/^## 3\. /,/^## 4\. /' .sdlc/adapter.md \| grep 'Verbatim-quote rule (ticket' \| grep -c 'byte for byte.*strips backtick spans.*has no quote exemption'` | `.sdlc/adapter.md`, `1`, `1` | at d34b4fb1: an empty line, `0`, `0`. The three corrections cite the rule by the words `§3, Verbatim-quote rule.`, which the first pattern does not match, so a cite is not a second home |
| 2 | the U1 verdict quotes the gate line as the verifier's own control prints it | P1's control, then `grep -o 'FAIL  refs-canonical.*' "$F/neg.log" > "$F/line.txt"; wc -l < "$F/line.txt" \| tr -d ' '; grep -cFf "$F/line.txt" .sdlc/verdicts/records-refresh-U1.md; grep -c 'refs-canonical, ordered' .sdlc/verdicts/records-refresh-U1.md` | `1`, `1`, `0` | at d34b4fb1: `1`, `0`, `1` (measured). The first line guards the vacuous case: an empty `line.txt` makes `grep -Ff` match nothing |
| 3 | every `.sdlc` quote of smoke's summary outside `plans/` is the line the source prints | `grep -o 'SMOKE PASS[^"]*' test/smoke/smoke.mjs > "$F/smoke.txt"; wc -l < "$F/smoke.txt" \| tr -d ' '; git grep -cFf "$F/smoke.txt" -- .sdlc/baseline.md .sdlc/handoffs/records-refresh-U3.md .sdlc/verdicts/records-refresh-U3.md; git grep -c 'SMOKE PASS: gallery\|SMOKE PASS (em dash)' -- .sdlc ':!.sdlc/plans' \| wc -l \| tr -d ' '` | `1`, then `.sdlc/baseline.md:1`, `.sdlc/handoffs/records-refresh-U3.md:4`, `.sdlc/verdicts/records-refresh-U3.md:1`, then `0` | at d34b4fb1: `1`, no verbatim hit in any file, and `3` files carrying an altered form (baseline 1, handoff 4, verdict 1; measured). `plans/` is excluded because this plan names the altered forms |
| 4 | each corrected history file says it was corrected | `grep -c '^Correction (20[0-9-]*, plan records-followup U4, #709)' .sdlc/verdicts/records-refresh-U1.md .sdlc/verdicts/records-refresh-U3.md .sdlc/handoffs/records-refresh-U3.md` | `1` on each of the three lines | at d34b4fb1: `0` three times |
| 5 | the dash measure exempts the restored quotes and nothing else; branding unchanged | P6's command; then the same without the `perl` stage; then P4 | `0`; then `6` or more (the restored quotes, which is the point of the exemption); then clean, `exit 0` | P6's fixture (measured). A dash typed into the amendment's prose makes the first number `1` |
| 6 | scope: six files, and history files changed only on the quote lines and the appended correction | `git diff --name-only $BASE \| sort \| paste -sd, -; for f in .sdlc/verdicts/records-refresh-U1.md .sdlc/verdicts/records-refresh-U3.md .sdlc/handoffs/records-refresh-U3.md; do git diff -U0 $BASE -- $f \| grep -c '^-[^-]'; done \| paste -sd, -; sh .sdlc/checks/baseline-agrees-check.sh \| tail -1` | `.sdlc/adapter.md`, `.sdlc/baseline.md`, the three history files and `.sdlc/handoffs/records-followup-U4.md`; `1,2,4` (the U3 verdict's quote wraps over lines 78 and 79 today and the restored span sits on one line, as the rule asks; any other number and the verifier reads the diff); `stale total: 0` | a reworded finding in a verdict raises its count |

### U6 (S, grade l1): the archive's two red criteria, corrected beside it (F8)

The archived plan is history and its criterion text stays as graded. The correction goes where the archive is read.

#### Texts

- New file `.sdlc/plans/archive/records-refresh-corrections.md`, front matter `kind: corrections`, `corrects: .sdlc/plans/archive/records-refresh.md`, `written: <date>`, `source: .sdlc/verdicts/records-refresh-prepr-review.md F2, F8 and deferred-note ruling 1`. Body: one table, columns `Where`, `As archived`, `What it prints at d34b4fb1`, `Corrected form`, four rows:
  - P2: the whole-file size grep prints two strings since the prior set was added; corrected form is P2 of this plan (scoped to the live row).
  - U2-7, last sub-check: a presence count that expects `1` and prints `3`, because pass 5 names `20298cc` on three lines; corrected form `sed -n '/^## Pass 5/,$p' .sdlc/verdicts/architecture.md | grep -c '^Graded .*20298cc'`, which prints `1` (measured).
  - Lines 306 and 342: both say pass 5 stays graded at `d814500`; pass 5's header says `d46ae48`, merge base `20298cc`. Corrected in the live map by U1 of this plan.
  - The closing sentence: a plan that copies a criterion from the archive copies the corrected form.
- One row appended to the archived plan's `## Revisions` table, nothing else in that file: `| <date> | corrections recorded beside this file in `records-refresh-corrections.md` (P2, U2-7, the pass 5 sha on lines 306 and 342); the text above is unchanged | pre-land review F2 and F8, ticket #709 |`
- `.sdlc/verdicts/records-refresh-prepr-review.md`: the pre-land review, copied byte for byte from the Lane B scratchpad (hash in this plan's front matter). It is a verbatim record, so it is not edited to fit any prose rule; it carries no em dash and passes the branding gate (measured).
- `.sdlc/verdicts/architecture.md`, one line appended at the end of the file: `Note (<date>, plan records-followup U6, #709): the closing observation of pass 5 above was resolved by U3 of plan records-refresh on 2026-09-19, which re-measured §8, the rerun note and the Counts bullet at `20298cc`. It is not an open finding.`

#### Criteria

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| 1 | the corrected commands do what the corrections file says | the two corrected forms, copied out of the corrections file | P2's row grep: one line, `ui.html 3780.5 KB` (or the live figure after U3's full path); U2-7: `1` | the archived forms at d34b4fb1: two lines; `3` (measured) |
| 2 | the review copy is the review | `shasum -a 256 .sdlc/verdicts/records-refresh-prepr-review.md \| cut -d' ' -f1` | `6a3a285e91555f7b545a828969402d227e35c58626ec47e473bf273f041c1481` | one byte changed gives another hash. If the scratchpad copy is gone, the unit stops and asks; it does not retype the review |
| 3 | the archive gained one revisions row and lost nothing | `git diff --numstat $BASE -- .sdlc/plans/archive/records-refresh.md; git diff -U0 $BASE -- .sdlc/plans/archive/records-refresh.md \| grep '^+[^+]' \| grep -c 'records-refresh-corrections.md'` | `1	0	.sdlc/plans/archive/records-refresh.md`, `1` | an in-place fix to line 342 prints `2	1` |
| 4 | the corrections file has its four rows and names its source | `F2=.sdlc/plans/archive/records-refresh-corrections.md; grep -c '^corrects: .sdlc/plans/archive/records-refresh.md' $F2; grep -cE '^[|] (P2\|U2-7\|Lines 306 and 342) ' $F2; grep -c 'd46ae48' $F2` | `1`, `3`, `1` or more | file absent: every `grep` errors and prints no count, which is not `1` |
| 5 | pass 5 note appended, nothing in the verdict deleted; board and plan parsers unaffected | `git diff --numstat $BASE -- .sdlc/verdicts/architecture.md; python3 "$CLAUDE_PLUGIN_ROOT/scripts/board.py" check; echo "exit $?"` | `1	0	.sdlc/verdicts/architecture.md` (or `2	0` with a blank separator line), then `exit 0` | a deleted line shows in the second numstat column |

### U3 (M, grade l2): one home for all five gates (F7)

Adapter §1 lists five gates: test, build, smoke, corpus-contrast, fonts. The baseline measures three. The adapter carries a time for corpus-contrast that no record measured, arithmetic that does not hold (343 x 3 is 1029; the chain is 343 documents, 3780 palettes, 7560 cells per tone mode, 22680 over three modes), and the baseline says one CI run reports two jobs when it reports four.

#### Steps

1. Quiet host or no run. `uptime` and `sysctl -n hw.ncpu`; the 1-minute load must be under the core count, and `pgrep -fl 'test/run.mjs|curated-contrast|vite|headless'` must show nothing from this repo. The planner could not get this today (load 118 to 311 on 10 cores), which is why no timing in this plan is a figure. Record load before and after every run and the `pgrep` result before it. A run started at load 10 or above is recorded and not used.
2. `git fetch origin && sh .sdlc/checks/baseline-agrees-check.sh`. Two paths:
   - Short path, both `head:` lines `ok`: the tree still equals `ref` outside `.sdlc/`, so the three measured rows stand. Run `npm run gate:corpus-contrast` three times and `npm run gen:type-fonts` three times (neither needs `node_modules`), recording exit, wall seconds (`/usr/bin/time -p`), the last line, `git status --short | wc -l`. Add two rows to the live `## Pass` table under the same `ref`, and one front matter line `extended: <date>, rows corpus-contrast and fonts, host load <figures>`.
   - Full path, a `STALE head` or `STALE tests` line (another plan landed first): re-measure all five gates as records-refresh U3 did (three runs each, `npm ci` once before build), rewrite the live table at the new `origin/main` sha, and move today's live rows under a second labelled prior set. The Orchestrator is told before the first run.
3. Every run made is recorded in the handoff's Runs table. A red run stops the unit: triage with `flaky-gates`, write it under Fail or Flaky, ask.
4. The corpus row's summary cell carries the gate's PASS line, and one sentence under the table carries the counts line and the three per-mode lines as printed, each in a backtick span (U4's rule; several carry glyphs).
5. `## Not run here`: `gh run list --branch main --workflow ci.yml --limit 5 --json databaseId,headSha,conclusion`, take the run on `ref`, then `gh run view <id> --json jobs`. The sentence names every job and its conclusion. At 20298cc that is run 35455937943 and four jobs.
6. `.sdlc/checks/baseline-agrees-check.sh`: one line changes. The gate list in the `for` loop gains `["npm run gate:corpus-contrast", "corpus-contrast"], ["npm run gen:type-fonts", "fonts"]` after the smoke pair. Nothing else in the script moves (measured today: with that one line and simulated rows the script prints nine `ok`).
7. `.sdlc/adapter.md` §1, in place, inside the gate table only: the corpus-contrast Time cell and the fonts Time cell become `A to B s`, the rounded minimum and maximum of the three baseline timings (the script compares them). In the corpus-contrast Green-means cell, `over all 343 curated documents x 3 tone modes = 22680 accent-on-color cells (#674)` becomes `over the full curated corpus in all three tone modes (#674; the measured document, palette and cell counts are in `.sdlc/baseline.md`)`. The adapter carries no corpus count afterwards.
8. `.sdlc/adapter.md` §2, one appended amendment in the file's shape: since #674 a PR runs three jobs, `build-test`, `panda-smoke` and `corpus-contrast`, all of which must report `success`; `deploy` runs on a main push only. The "Two jobs" row above it is history and stays.

#### Criteria

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| 1 | the script reads five gates and everything agrees | `sh .sdlc/checks/baseline-agrees-check.sh; echo "exit $?"; git diff --numstat $BASE -- .sdlc/checks/baseline-agrees-check.sh` | nine `ok` lines, among them `time corpus-contrast:` and `time fonts:`, `stale total: 0`, `exit 0`, then `1	1	.sdlc/checks/baseline-agrees-check.sh` | measured today in the clone: the script line alone at d34b4fb1 prints `STALE time corpus-contrast: baseline 0 to 0 s, adapter none` and the same for fonts, `stale total: 2`; with rows present and the adapter cell left at another range, one `STALE time corpus-contrast:` line |
| 2 | the adapter's gates and the baseline's live rows are the same five commands | `diff <(awk '/^## 1\. Gates/,/^Rules the gates/' .sdlc/adapter.md \| grep -oE '^[|] [a-z-]+ [|] `[^`]+`' \| grep -o '`[^`]*`' \| sort) <(awk '/^## Pass/,/^## Fail/' .sdlc/baseline.md \| grep -oE '^[|] `[^`]+`' \| grep -o '`[^`]*`' \| sort); echo "diff $?"` (bash) | no diff lines, `diff 0` | at d34b4fb1: two `<` lines, the corpus-contrast and fonts commands, `diff 1` (measured) |
| 3 | the timings were taken on a quiet host and are the builder's own | in `.sdlc/handoffs/records-followup-U3.md`, the Runs table: one row per run (6 on the short path, 15 on the full path), columns #, command, load before, load after, pgrep before, exit, seconds, last line, status lines. `awk -F'[|]' '/^[|] [0-9]+ [|]/{n++; if($4+0>=10) hot++; if($7+0!=0) red++} END{print n+0, hot+0, red+0}'` on it; then the verifier's own single run of each new gate | `6 0 0` or `15 0 0`; the verifier's seconds fall within half to double the recorded range (outside it is a 🟡 note, not a rerun, as in the archived plan) | a row with load before `11.46` prints `hot` 1. The planner's own runs today would fail this row (load 190 and 50), which is why they are not in the baseline |
| 4 | the corpus counts in the baseline are what the gate prints, and the adapter carries none | `npm run gate:corpus-contrast 2>&1 \| grep -o '([0-9]* curated documents[^;]*' > "$F/cc.txt"; wc -l < "$F/cc.txt" \| tr -d ' '; grep -cFf "$F/cc.txt" .sdlc/baseline.md; grep -c '7560 cells' .sdlc/baseline.md; grep -c 'x 3 tone modes\|22680' .sdlc/adapter.md` | `1`, `1`, `3` (three lines, or `1` if the three quotes share a line), `0` | at d34b4fb1: `1`, `0`, `0`, `1` (measured; the gate's line reads 343 documents, 3780 palettes, 22680 cells) |
| 5 | the CI sentence names the jobs the run reports | `ID=$(grep -o 'CI run [0-9]*' .sdlc/baseline.md \| head -1 \| grep -o '[0-9]*$'); gh run view $ID --json jobs --jq '.jobs[].name' \| sort > "$F/jobs.txt"; wc -l < "$F/jobs.txt" \| tr -d ' '; L=$(awk '/^## Not run here/,/^## Prior/' .sdlc/baseline.md); while read j; do echo "$L" \| grep -c "\`$j\`"; done < "$F/jobs.txt" \| paste -sd, -; grep -c 'both build-test and panda-smoke' .sdlc/baseline.md` | `4`, `1,1,1,1`, `0` | at d34b4fb1: `4`, `0,0,0,0`, `1` (job names measured; the live sentence names two jobs without backticks) |
| 6 | adapter edits stay inside the §1 gate rows plus one appended §2 amendment | `git diff -U0 $BASE -- .sdlc/adapter.md \| grep '^-[^-]' \| grep -vcE '^-[\|] (test\|build\|smoke\|corpus-contrast\|fonts) [\|]'; awk '/^## 2\. /,/^### 2\.1/' .sdlc/adapter.md \| grep -c 'corpus-contrast'` with `BASE` the plan branch head the unit was cut from | `0`, `1` or more | a reworded rule bullet prints `1` on the first line; at d34b4fb1 the second line is `0` |
| 7 | regression: U1's and U4's repairs survived the baseline edit | U1-4, U1-5, U4-3 | as in those rows | the full path rewrites `baseline.md` whole, which is how records-refresh lost a host line once; these three rows are the catch |

### U5 (S, grade l2): the roadmap, regenerated, alone (F5)

Built on `plan/records-followup-roadmap`, cut from `origin/main` after the first PR lands. One commit touches `.sdlc/roadmap.md` and that commit touches nothing else; the handoff is a second commit.

#### Texts

Regenerate, do not patch. Every row is read from `gh issue list --state open`, `gh pr list --state open`, `git worktree list`, `.sdlc/board.md` and the plans on main, at one `origin/main` sha, and the front matter's `head:` names that one sha and nothing else. Keep the file's sections and its cell-mark legend. Specifically:

- The ranked table has one row per open issue and none for a closed one. Landed work moves to a short `## Landed since the last revision` list (ticket, PR, squash sha).
- `## In flight outside sdlc` lists exactly the worktrees under `.git-worktrees/` that `git worktree list` prints, and its lead sentence gives the count as a digit.
- The `Your move` line goes. Open owner questions move to `.sdlc/questions/roadmap-<date>.md` only if the Conductor confirms they are still open; the roadmap then carries one pointer line per question. The Conductor owns this file (its own front matter says so), so the builder's handoff lists each question with its proposed state and the Conductor rules before the verifier runs.
- Priorities the owner has not ranked stay marked `(p)`. The builder ranks nothing new.
- A revision row records the regeneration, its sha, and ticket #709.

#### Criteria

Live facts move while the other session works. A difference the verifier finds is 🔴 unless the differing worktree or issue was created after the unit's commit time (`stat -f %SB .git/worktrees/<name>`, the issue's `createdAt`); that case is a 🟡 note and the Orchestrator refreshes the row at landing.

| # | Criterion | Command | Expected | Negative control |
|---|---|---|---|---|
| 1 | one head sha, and it is on main | `sed -n '/^head:/p' .sdlc/roadmap.md \| perl -ne 'print "$1\n" while /(?<![0-9a-f])([0-9a-f]{7,40})(?![0-9a-f])/g' \| sort -u > "$F/h.txt"; wc -l < "$F/h.txt" \| tr -d ' '; git merge-base --is-ancestor $(cat "$F/h.txt") origin/main; echo "anc $?"` | `1`, `anc 0` | at d34b4fb1 the head line names two shas: `2`, and the ancestor test errors on two arguments |
| 2 | the worktree table is the live set | `diff <(git worktree list \| grep -oE '\.git-worktrees/[^ ]+' \| sort) <(grep -oE '^[\|] `\.git-worktrees/[^`]+`' .sdlc/roadmap.md \| tr -d '\|` ' \| sort); echo "diff $?"` (bash, from the root checkout) | no lines, `diff 0` | at d34b4fb1: four `>` lines and two `<` lines, `diff 1` (measured, names in the facts table) |
| 3 | the stated count is the row count | `grep -oE '^[0-9]+ worktrees under' .sdlc/roadmap.md \| grep -o '^[0-9]*'; grep -cE '^[\|] `\.git-worktrees/' .sdlc/roadmap.md` | the same number twice | at d34b4fb1: an empty line (the count is the word Nine) and `8` |
| 4 | one ranked row per open issue, none for a closed one | `diff <(gh issue list --state open --limit 200 --json number --jq '.[].number' \| sort) <(grep -oE '^[\|] [0-9]+ [\|] #[0-9]+' .sdlc/roadmap.md \| grep -oE '#[0-9]+' \| tr -d '#' \| sort); echo "diff $?"` | no lines, `diff 0` | at d34b4fb1: six `>` lines (#638 #672 #673 #674 #676 #691) and three `<` lines (#686 #701 #709), `diff 1` (measured) |
| 5 | no unanswered prompt is left in the file | `grep -c '^Your move' .sdlc/roadmap.md; awk '/^## Questions for the owner/,/^## Revisions/' .sdlc/roadmap.md \| grep -E '^[0-9]+\. ' \| grep -vcE 'answered 20[0-9-]+\|open: \.sdlc/questions/'` | `0`, `0` | at d34b4fb1: `1`, `2` |
| 6 | alone: one commit touches the roadmap, that commit touches only it, and the branch touches nothing outside `.sdlc/` | `C=$(git log --format=%H $BASE..HEAD -- .sdlc/roadmap.md); echo "$C" \| wc -l \| tr -d ' '; git show --name-only --format= $C; git diff --name-only $BASE \| sort \| paste -sd, -; P4 and P6` | `1`; `.sdlc/roadmap.md`; the roadmap, `.sdlc/handoffs/records-followup-U5.md` and at most one `.sdlc/questions/roadmap-<date>.md`; clean; `0` | a second file staged with the roadmap shows in the second output; PR #708 is the case this row exists for |

## Risks and assumptions

| Risk | Handling |
|---|---|
| No quiet slot comes (load was 118 to 311 on 10 cores at plan time) | U3 is last of the first PR's units and the only one that waits. If no slot comes in the session, the Orchestrator asks the owner whether to land U1, U2, U4, U6 and carry U3 into its own PR; nothing is measured under load to get done |
| Another plan lands first and raises `TESTS` or moves the tree (adia-library-uplift goes 48 to 49) | that plan repairs the baseline figure itself by the ruled landing rule. U3 step 2 then reads `STALE head` and takes the full path; P7 at pre-land is the second catch |
| The review's scratchpad copy is cleaned up before U6 runs | the Orchestrator copies the file into the unit worktree when it mobilizes the plan, not when U6 starts; U6-2's hash is the proof either way. Without the file U6 stops and asks |
| The fonts gate rounds to `0 to 1 s` or `1 to 1 s` and reads oddly | accepted: the script compares rounded extremes, and an odd cell that is measured beats a tidy one that is not |
| A restored quote carries a glyph the owner's prose rule bans | that is U4's rule working; P6 strips backtick spans. A quote outside a backtick span still counts, which keeps the exemption narrow |
| A plan or skill outside `.sdlc/` still counts raw em dashes and reds a verbatim quote | none found today (no test, script, hook or workflow counts them). If one appears it cites the adapter rule or is fixed; not this plan's to pre-empt |
| The plugin later reserves a two-letter prefix, or reads two-letter ids | `XC` is unowned in the plugin's `ID_OWNERS` on both `main` and `plan/drill-findings` (measured); U2-6 reruns the plugin's own check |
| Corrections appended to verdicts and a handoff break a parser | `board.py check` reads the board and `plans/*.md` only (measured in its source); U6-5 runs it |
| The in-place adapter edits (U1's bullet, U3's cells) break the append-only habit | the archived plan ruled the habit was a criterion, not an adapter rule; U1-6 and U3-6 confine deletions to the named lines |
| Plan-branch shas cited by this plan's verdicts die at the squash | accepted as before; every record this plan writes into a live file cites a main sha (U1-5 enforces it for the baseline) |
| Two conductor sessions drive one branch again, which is how #708 landed unanswered | the ticket's process finding. This plan names one driver (this conductor session with Lane B). The adapter's gate already refuses a stale pre-land sha; the missing piece was that nobody ran it. Landing below makes the dry run a named step with its output pasted into the PR body |

## Not in scope, and why

| Item | Why |
|---|---|
| `.claude/CLAUDE.md` §SDLC still says green CI is `build-test` plus `panda-smoke` | true gap, same shape as F7, but adapter conflict row X9 says that file changes only inside a unit the owner approved. Open question 3 |
| The other 16 shared ids the U2 sweep prints: debt and survey `C1` to `C7`, debt and architecture `P1` to `P4`, five K rows | the K rows are keyed to their convention on purpose. The C rows were ruled the owner's call in the archived plan. The P rows are new information from today's sweep. Open question 2 |
| Rewriting the archived plan's criterion text or its lines 306 and 342 | history; U6 records the correction beside it and appends one revisions row |
| Rewriting X1 to X6 in `.sdlc/verdicts/architecture.md` | history; the note under §4 carries the map |
| Extending `scripts/audit-citations.mjs` to scan `.sdlc/` (the review noted the citation audit is vacuous there) | a `scripts/` change behind the scope wall and a gate-design decision; worth its own ticket |
| Re-deriving `architecture.md` and `debt.md` | owner ruling Q2 of 2026-09-18 stands |
| A hook or test that enforces the verbatim-quote rule | the rule is one day old; a gate for it is a `test/` change. P6's measure is a plan criterion until the owner asks for more |
| The five stale `/private/tmp` critic worktrees `git worktree list` shows | repo hygiene, the repo-cleaner seat's proposal to make |

## Landing

Two PRs, because the owner ruled the roadmap lands alone and this repo squash-merges: one PR is one commit on main.

PR 1, `plan/records-followup` to `main`, carrying this plan, U1, U2, U4, U6, U3 and their handoffs and verdicts. Title `chore(sdlc): repair the records-refresh pre-land findings (#709)`. Pre-land per adapter §2.1: reviewer-l3 and verifier-l3 write `.sdlc/verdicts/records-followup-prepr.md` with `verdict: 🟢` and the branch head sha. Pre-land runs P1 to P7 (P3 only on U3's full path), and reruns U2-1, U3-1 and U4-2 at the branch head. P7 is the landing rule the Conductor ruled on 2026-09-19 for every plan landing after #691: the baseline's test-file figure equals `TESTS.length` at the pre-land head, and `baseline-agrees-check.sh` is a pre-land gate; a plan that lands in between and changes the count repairs the figure itself. Then `adapter.py land --branch plan/records-followup --gate .sdlc/verdicts/records-followup-prepr.md --dry-run`, its output pasted into the PR body, so an unanswered pre-land gate cannot pass unseen again. CI watched to `success` for `build-test`, `panda-smoke` and `corpus-contrast`. Squash per `shipping-changes` step 7, sync per step 8. Nothing is pushed before the owner approves this plan.

PR 2, `plan/records-followup-roadmap` to `main`, carrying U5 only. Title `chore(sdlc): regenerate the roadmap (#709)`. Its pre-land record is `.sdlc/verdicts/records-followup-roadmap-prepr.md`; its gates are U5-1 to U5-6, P4, P5 (second line `1`), P6 and P7. `npm test` is not rerun for a one-file `.sdlc/` change unless the branding gate reds.

Close per adapter §5 after PR 2: status `done`, revision row, file moved to `.sdlc/plans/archive/`, ticket #709 closed, board rows 🟢 under `Seat: orchestrator`. If the owner prefers one PR (open question 1), U5 merges into the plan branch as its own commit and the squash carries it; P5's second line is then `1` at pre-land and the roadmap is not alone on main.

## Open questions for the owner

1. Two PRs, so the roadmap is its own commit on main (planned, recommended), or one PR where it is its own commit only on the plan branch and the squash folds it in?
2. U2 renames the six architecture rows to `XC` and keeps the adapter's `X` (planned, recommended: 7 lines against 27, and the plugin reserves `X` for the adapter). Today's sweep also found debt and architecture both define `P1` to `P4`. Fix that in this plan as a seventh unit, or ticket it with the debt `C` rows?
3. `.claude/CLAUDE.md` names two CI jobs where three gate a PR. Approve a one-line edit as part of U3 (row X9 needs your yes), or leave it for a later plan?

## Revisions

| Date | Change | Why |
|---|---|---|
| 2026-09-19 | plan written (proposed) from ticket #709, the pre-land review and its four rulings, and the owner rulings of 2026-09-19. Every value marked measured was run by the planner at d34b4fb1 in a scratch worktree or a throwaway clone; simulated values had the unit's edit applied by script in the clone. No timing was taken: host load was 118 to 311 on 10 cores. `npm run build` and `npm run smoke` were not run | records-followup dispatch, team lead |
