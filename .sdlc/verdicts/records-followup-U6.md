# Verdict U6 · 🟢

plan records-followup (#709), unit U6. Head `unit/rf-U6` @ `3ff969512f71ab7f044a89524b12d6f801df8d90`, unit base `UB` = `e0e5b551a8aec3f1b0e0d53182ecc2d441af83f6`, plan base `BASE` = `git merge-base origin/main HEAD` = `d34b4fb1beefff11c9be53ec039d4265c925da4a`. Graded 2026-09-19 by verifier-l2 in its own detached scratch worktree plus two throwaway clones under this seat's scratchpad, all under one directory removed by exact name. Criteria read from `.sdlc/plans/records-followup.md` at `e0e5b551` (revision 4): U6 rows 1 to 9 and plan rows P1, P4, P5, P6, P7. P2 and P3 are pre-land only and are not graded here.

Host load beside `npm test`: `load averages: 7.06 5.85 6.49` before the run, `load averages: 6.70 6.06 6.50` after. The P1 corruption control ran at `load averages: 4.97 5.91 6.34`. `grep -P` is absent on this host, so every PCRE ran through `perl` or `python3`.

Conductor ruling applied to the dash rows: dashes are counted as occurrences, not lines. Both numbers are reported and the grade is against occurrences.

This record's own prose carries no em dash. The one dash in the file sits inside the fenced `od -c` output of the missing-artifact line, which the rule allows on the condition the count command strips the fence and says so: `awk '/^```/{f=!f;next} !f' | perl -pe 's/\x60[^\x60]*\x60//g' | LC_ALL=C grep -c "$EM"` prints `0`, and without the fence strip it prints `1`.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green with no `node_modules`, tree byte-stable | 🟢 | `✓ all 48 test files passed`, then `exit 0`; the `TESTS` perl one-liner prints `48`; `git status --short \| wc -l` prints `0`. No `node_modules` and no `dist/` in the worktree at start | in the throwaway clone: `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test` prints `exit 1`, `grep -c FAIL` prints `3`, last line `✗ 1/48 test file(s) failed` |
| P4 | branding gate clean | 🟢 | `branding: clean (476 files scanned)`, `exit 0` | in the clone with `decision-records.md` copied to `.sdlc/verdicts/x.md`: `FAIL: 3 branding violation(s) across 477 files` |
| P5 | scope wall, nothing outside `.sdlc/` differs, roadmap untouched | 🟢 | `0`, `0`, and no third line (`.claude/CLAUDE.md` unchanged, as expected before U3) | in the clone: `echo "// probe" >> src/engine/motion.mjs` makes the first line `1`; `echo >> .sdlc/roadmap.md` makes the second `1` |
| P6 | no em dash added in prose, backtick spans stripped, against `BASE` | 🟢 | lines `0`, occurrences `0` | fixture of two `+` lines: stripped `1` for the prose dash, unstripped `2` for both |
| P7 | the baseline's test-file figure equals `TESTS.length`, by script | 🟢 | seven `ok` lines, `stale total: 0`, `exit 0` (seven is the count before U3) | in the clone with the baseline row planted at 47: `STALE tests: baseline 47, test/run.mjs TESTS 48`, `stale total: 1`, `exit 1` |
| U6-1 | the corrected commands do what the corrections file says | 🟢 | one line `ui.html 3780.5 KB`; `1`; `1`; `1` | at `e0e5b551` the archived forms print two lines, `ui.html 3780.5 KB` and `ui.html 3777.8 KB`, the pass 5 presence count prints `3`, and the corrections file does not exist |
| U6-2 | the review copy is the review | 🟢 | `6a3a285e91555f7b545a828969402d227e35c58626ec47e473bf273f041c1481`, the hash the plan front matter states | one byte appended in the clone gives `830ceac73dd6dc737a287aa74e4417c02fd258e1b1eff38aec5e181e34056654`; the file does not exist at `e0e5b551` |
| U6-3 | the archive gained one revisions row and lost nothing | 🟢 | `1	0	.sdlc/plans/archive/records-refresh.md`, then `1` | an in-place fix to line 342 in the clone prints `2	1	.sdlc/plans/archive/records-refresh.md` |
| U6-4 | the corrections file has its rows and names its source | 🟢 | `1`, `3`, `1`, `7`, `1` | file absent at `e0e5b551`, so the grep warns and prints no count; deleting the `N7` row in the clone prints `6` |
| U6-5 | pass 5 note appended, nothing deleted, board parser unaffected | 🟢 | `2	0	.sdlc/verdicts/architecture.md` (the allowed blank-separator form), `found 0`, `exit 0` | deleting a line in the clone prints `2	1	.sdlc/verdicts/architecture.md`, so a deletion shows in the second column |
| U6-6 | N1 and N2: the four restored spans are the program's lines, the old forms gone, markers in the rule's form | 🟡 | six of seven values as expected: `1`; `1`; `1,1,1`; `0`; then `1` where the row expects `0`; then `1`; `1,1,1`. The one disagreement is a criterion defect, not a build defect, and is spelled out below the table | at `e0e5b551` the same commands print `0`; `0,0,0`; `1`; `4`; `1`; and no line for the marker grep, so every sub-check discriminates |
| U6-7 | N3 to N7: the rule says the five new things in the one amendment, and the three Correction lines read as prescribed | 🟢 | `1`, `1`, `0`, `1`, `1`, `1` | at `e0e5b551`: `1`, `0`, `1`, `0`, `0`, `0` |
| U6-8 | the dash count is the one the enumerated lines carry, counted from the program; prose adds none; branding clean; U4's rows still hold | 🟢 | expected `5` occurrences at this head, per the conductor clarification that revision 5 restates in the plan text. Measured lines `4`, occurrences `5`; P6 `0`; `branding: clean (476 files scanned)` with `exit 0`; U4-3's widened grep `0`; U4-4's grep `1` on each of the five files. Per file the dash lines are `records-refresh-U1.md` 1, `records-refresh-checkability.md` 1, `records-refresh-prepr.md` 1, `survey.md` 2. The fifth occurrence is legitimate: the `survey.md` line re-added by the diff carries both the restored smoke summary line and the restored missing-artifact line, so the enumerated lines carry four dashes as lines and five as occurrences | in the clone, a dash smuggled into the already-counted `survey.md` line leaves lines at `4` and moves occurrences from `5` to `6`, so the occurrence measure bites where the line measure does not |
| U6-9 | scope: thirteen files, history files changed only on the enumerated lines | 🟢 | `git diff --name-only $UB \| LC_ALL=C sort \| paste -sd, -` prints the plan's thirteen-path string exactly, and the per-file removed-line counts print `1,1,1,1,1,1,1,0`. Without `LC_ALL=C` the same thirteen paths interleave differently, which is collation and not a miss | in the clone, `echo >> .sdlc/debt.md` makes the path count `14` and puts a fourteenth path in the string; at `e0e5b551` the diff lists `0` paths |

## The two restorations, byte for byte

Both restored lines were derived from the program in this seat's own tree and compared with `od -c`, never read from the plan.

The runner line, from `perl -CS -e 'printf "\x{25B6} %-24s FAIL\n", "engine/semantic.mjs"'`, which is the source-line reading of `test/run.mjs:23` and `:29` that the rule allows:

```text
0000000    ▶  **  **       e   n   g   i   n   e   /   s   e   m   a   n
0000020    t   i   c   .   m   j   s                           F   A   I
0000040    L  \n
0000042
```

The same 34 bytes occur in `.sdlc/verdicts/records-refresh-U1.md:37`, delimited by single backticks on both sides, byte-exact `True` on a direct slice comparison.

The missing-artifact line, from `node test/smoke/smoke.mjs` in the throwaway clone with no `dist/`, with the clone's absolute path rewritten by `sed`:

```text
0000000    s   m   o   k   e   :       m   i   s   s   i   n   g       <
0000020    R   O   O   T   >   /   d   i   s   t   /   u   l   t   i   m
0000040    a   t   e   -   t   o   k   e   n   s   .   h   t   m   l
0000060    —  **  **       r   u   n       `   n   p   m       r   u   n
0000100        b   u   i   l   d   `       f   i   r   s   t  \n
0000116
```

The same 77 bytes occur in `.sdlc/verdicts/survey.md`, `.sdlc/verdicts/records-refresh-checkability.md` and `.sdlc/verdicts/records-refresh-prepr.md`, byte-exact `True` in all three, each inside a padded double-backtick span followed by the marker span `altered: absolute path written as <ROOT>`. The delimiters measured around the quote are `` `` ` `` before and `` ` `` `` after in all three files, the form the plan prescribes.

The U4 restoration the two rows lean on was checked the same way: the smoke summary line from `grep -o 'SMOKE PASS[^"]*' test/smoke/smoke.mjs` is byte-exact in `.sdlc/baseline.md` and in the `.sdlc/verdicts/survey.md` line that carries the fifth dash occurrence. Smoke itself was not rerun, per the dispatch.

## The one disagreement, U6-6

The sub-check `git grep -c -e 'smoke: missing dist/' -e 'smoke: missing \.\.\./' -- .sdlc ':!.sdlc/plans' | wc -l` expects `0` and prints `1`. The carrier is `.sdlc/verdicts/records-followup-U4.md:30`, the U4 review verdict, which quotes the dash-truncated string as the subject of its own finding while naming it a defect. At `e0e5b551` the same command prints `4`, so the unit corrected three of the four carriers, which are exactly the three its own text enumerates.

This is a defect in the plan, not in the build, and the two criteria are mutually inconsistent as written. U6-6's sweep covers a file U6's text does not list, and U6-9 fixes the changed-path count at thirteen, so correcting the fourth carrier would turn U6-9 red. The unit cannot satisfy both rows at once, and it satisfied every text the plan prescribes. The reviewer reached the same reading and recorded it as note 1.

Two things follow for the plan, not for this unit. The rule in `.sdlc/adapter.md` §3 needs one sentence exempting a quote cited as the subject of a finding, since a reviewer naming a defective quotation must reproduce it. Criterion 6's expected value then becomes `1` with the carrier named, or its sweep gains the exclusion it already grants `plans/`.

## The five dash occurrences, attributed

U6-8 is graded against the occurrence measure with an expected value of `5` at this head. Every occurrence is a restored program span, so the row is green.

| Occurrence | Where | Which restored span |
|---|---|---|
| 1 | `.sdlc/verdicts/records-refresh-U1.md:37` | the gate line U4 restored, re-added by the diff because N1 rewrites the same line |
| 2 | `.sdlc/verdicts/records-refresh-checkability.md:12` | the missing-artifact line, N2 |
| 3 | `.sdlc/verdicts/records-refresh-prepr.md:25` | the missing-artifact line, N2 |
| 4 | `.sdlc/verdicts/survey.md:11` | the missing-artifact line, N2 |
| 5 | `.sdlc/verdicts/survey.md:11` | the smoke summary line U4 restored, on the same line that N2 rewrites |

The line measure prints `4` because occurrences 4 and 5 share one line. The smuggle control shows why the occurrence measure is the one that bites: a dash added to that shared line left lines at `4` and moved occurrences from `5` to `6`.

## Plan-text drift worth recording

Criterion U6-8's expected value is written as `4` in revision 4 and reads as a line count. Revision 5 restates it as `5` occurrences, which is what this verdict grades against. The row is green either way at this head, since the same four enumerated lines carry both numbers.

## Verdict

🟢 U6 passes. Thirteen of the fourteen graded rows are green on this seat's own evidence, every green row with a control that discriminated at `e0e5b551` or under a planted mutation in a throwaway clone. U6-6 is 🟡 on one sub-value whose cause is a contradiction between criteria 6 and 9 of the plan, outside what the unit was told to change. No build defect was found. The two rule amendments and the two criterion corrections belong to a follow-up unit on this plan.
