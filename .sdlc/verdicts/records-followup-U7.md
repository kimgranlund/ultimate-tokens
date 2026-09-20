# Verdict U7 · 🟢

Graded 2026-09-19 by an independent verifier at `unit/rf-U7` @ `ec3f067c47ada6c57147925e14d7167fc182b21d`, in its own detached worktree cut from that sha, with a throwaway `git clone -q --shared` for every control that edits a file. Plan read at `plan/records-followup` @ `b0a4f71b9b25d7c2d9838e41bdd16a0776f83899`. `BASE` = `$(git merge-base origin/main HEAD)` = `d34b4fb1beefff11c9be53ec039d4265c925da4a`. `UB` = `$(git merge-base plan/records-followup HEAD)` = `e748f0ba7308b611343d707f26098d67b0aabc36`. `PLUGIN` = `/Users/kimba/Projects/nonoun/sdlc-orchestration`, the target of `core.hooksPath` two levels up. P2 and P3 are pre-land only and were not run. `grep -P` is absent on this host, so every PCRE ran through `perl` or `git grep -P`.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U7-1 | no P id defined in two live records, seven-file sweep reading both `debt.md` and `architecture.md` | 🟢 | the sweep prints `C1,C2,C3,C4,C5,C6,C7,K9,K11,K14,K17,K18`, the plan's Expected | same sweep over the `UB` trees (post-U2, pre-U7) prints `C1,C2,C3,C4,C5,C6,C7,K9,K11,K14,K17,K18,P1,P2,P3,P4`; over the `BASE` trees `C1,C2,C3,C4,C5,C6,C7,K9,K11,K14,K17,K18,P1,P2,P3,P4,X1,X2,X3,X4,X5,X6`; dropping `architecture` from the file list at `BASE` prints only `C1,C2,C3,C4,C5,C6,C7`, so a sweep short of the two files cannot see this collision |
| U7-2 | the `DP` prefix was owned by nobody before the unit | 🟢 | `git grep -P '(?<![A-Za-z0-9-])DP[0-9]+(?![0-9A-Za-z])' $BASE -- .sdlc .claude README.md \| wc -l` prints `0` | the same command with `PR` for `DP` prints `2`, at `d34b4fb1:.claude/skills/geometry-system/references/foundations.md:2`, so the sweep sees a taken prefix |
| U7-3 | mapping `DP` back to `P` reproduces the unit's base `debt.md` except the appended note | 🟢 | the `diff` of `$UB:.sdlc/debt.md` against the inverse-mapped worktree file prints `0` differing lines outside the note | in the clone, renaming the fourth row `DP5` prints `2`; appending a word to the `DP1` row's last cell prints `2` (`1 file changed, 1 insertion(+), 1 deletion(-)`) |
| U7-4 | every cite moved, counted directly and not through the inverse map | 🟢 | `.sdlc/adapter.md:2`, `.sdlc/debt.md:5`, then `0`, then `22,52,91,`; line 22 is `architecture P7`, lines 52 and 91 each carry `DP1, debt P1 until records-followup U7` | at `BASE` the `git grep -c` prints no line at all and exits 1, the second number is `5`, the third `22,52,91,`. In the clone with item 16 left as `P2 prune`: `.sdlc/debt.md:4` and second number `1` |
| U7-5 | the four rows and the note are present, no P-headed row left in §Process, U1's and U2's `debt.md` edits survived | 🟢 | `DP1,DP2,DP3,DP4`, `0`, `1`, `1`, `2` | at `BASE`: an empty first line, then `4`, `0`, `0`, `0`. In the clone with the first row renamed `B1`: `DP2,DP3,DP4` |
| U7-6 | scope is three files, the plugin's id check still accepts the tree, history untouched | 🟢 | `git diff --name-only $UB \| sort \| paste -sd, -` prints `.sdlc/adapter.md,.sdlc/debt.md,.sdlc/handoffs/records-followup-U7.md`; `python3 board.py ids .sdlc` from `08f3e1b` prints nothing, `exit 0`; the history `git diff --stat` line count is `0` | `08f3e1b` is an ancestor of the plugin's `main` (`merge-base --is-ancestor` exits 0) and its `board.py` is byte-identical to `main`'s (`sha256 289e2325f00fc207e04493bda28cd054e20b6f51364c282f5d5542e6fcb81337` for both). Bite is the adapter and the name list, not the debt rows: an adapter row headed `C13` prints `adapter.md:103: C13 defined in a adapter file; owner kind ['plan']` and `exit 1`, while a §Process row renamed `B1` still prints nothing and `exit 0`. A fourth path (`.sdlc/checks/probe-u7.txt`) appears in the name list as the wall |
| P1 | `npm test` green with no `node_modules`, tree byte-stable | 🟢 | `✓ all 48 test files passed`, `exit 0`; the `TESTS` one-liner prints `48`; `git status --short \| wc -l` prints `0`. Host load beside the run: `load averages: 9.54 34.00 57.22` before, `load averages: 50.75 35.50 53.81` after, on 10 cores, so no wall time here is a timing figure | in the clone, `sed -i '' 's/"scrim/"scrimX/' docs/reference/data/role-table.json && npm test`: `✗ 1/48 test file(s) failed`, `exit 1`, `grep -c FAIL` prints `3`, `grep -c 'engine/semantic.mjs *FAIL'` prints `1`, `grep -c 'FAIL  refs-canonical'` prints `1`, at load `16.60 27.64 47.62` |
| P4 | branding gate clean | 🟢 | `branding: clean (469 files scanned)`, `exit 0` | the gate's reach over `.sdlc/verdicts/` is what the plan measured at `d34b4fb1` (`FAIL: 3 branding violation(s) across 462 files` with a decision-records copy planted there); not replanted here because P4 passing at 469 files already includes the three paths this unit touches, and the plant is a property of the gate, not of this tree |
| P5 | scope wall outside `.sdlc/` | 🟢 | `0`, `0`, and nothing for the `CLAUDE.md` numstat, the pre-U3 Expected | the same wall measured at U7-6: a fourth `.sdlc` path shows up in the name list, and the numstat is empty because the unit does not touch `.claude/CLAUDE.md` at all |
| P6 | no em dash added in prose | 🟢 | the `git diff -U0 $BASE -- .sdlc` pipeline with the backtick strip prints `0` | the plan's fixture measured today by the planner; independently, the unit's added lines contain no U+2014 at all, inside backticks or out, so the strip cannot be hiding one |
| P7 | the baseline's test-file figure equals `TESTS.length`, by script at this head | 🟢 | seven `ok` lines, `stale total: 0`, `exit 0`; the first reads `ok    tests: baseline 48, test/run.mjs TESTS 48` | the script's own plants are what records-refresh measured (a baseline figure of 47 prints `STALE tests:` and exits 1); here the run is unchanged by the unit, which touches no figure the script reads |

## The diff itself

Three files, one commit. `.sdlc/debt.md` §Process: the first cell of the four rows becomes `DP1` to `DP4`, item 16 of the A7 list becomes `DP2 prune`, and one note is appended under the table, word for word the plan's text with the date filled in. `.sdlc/adapter.md`: lines 52 and 91 only, token edits, `ruling DP1, debt P1 until records-followup U7` and `squash-merge only (DP1, debt P1 until records-followup U7).`; line 22's `architecture P7` untouched. `.sdlc/architecture.md` is not in the diff, so `P1` to `P7` there are intact.

## The bare P1 to P4 sweep, all of `.sdlc`, `.claude` and `README.md`

`git grep -nP '(?<![A-Za-z0-9-])P[1-4](?![0-9A-Za-z])'` finds 332 lines. `README.md` and `.claude/CLAUDE.md` have none.

| Group | Lines |
|---|---|
| Live records (adapter, architecture, baseline, debt, survey, roadmap, board) | 28 |
| History under `.sdlc` (verdicts 123, plans 109, handoffs 47, tickets 12, questions 5, records 4) | 300 |
| `.claude/skills/adding-semantic-roles/*` | 4 |

The 28 live lines, classified one by one:

| Class | Lines | Where |
|---|---|---|
| architecture claim, stays `P` | 4 | `architecture.md:63` to `:66`, the §3 rows `P1` to `P4` |
| priority label `P0` to `P3`, stays | 16 | `roadmap.md:14`, `:29`, `:33` to `:45`, `:116` |
| debt process row, already moved, bare `P1` only inside the new "debt P1 until records-followup U7" clause | 2 | `adapter.md:52`, `:91` |
| debt process row, historical mention inside the rename note | 1 | `debt.md:104` |
| criterion `P3` of the archived adopt-hygiene plan, a third meaning the note names | 2 | `debt.md:49` (`P3 forbids`), `:68` (`the P3 wall`) |
| plan-level criterion `P1`, a fourth meaning | 1 | `board.md:21` (`P1 run in the review`) |
| prose naming the rename itself | 1 | `board.md:23` (`debt process P1 to P4 become DP1 to DP4`) |
| debt process row cited bare, still outstanding | 1 | `roadmap.md:91` (`P3 (debt id, serial npm test)`) |

No miss inside this unit's scope. The one live bare debt-id cite left, `roadmap.md:91`, is the plan's own assignment to U5 (`U5 writes DP3 in the roadmap's debt table (U5-7)`, and the plan's U7 fact row calls that cite already disambiguated by hand), and the roadmap is outside U7's three-file wall by P5.

The 4 `.claude` lines are the `docs/reference/rubrics/parity-checklist.md` `P1` to `P5` color parity checks, a fifth unrelated meaning. Of the 300 history lines, 52 mention debt on the same line, so at most 52 could be read as debt-id cites; every one of them sits in a record written before today, which the note's rule covers by construction, and history is byte-identical to `UB` under U7-6.

## Findings, none blocking

| # | Finding | State |
|---|---|---|
| 1 | The handoff's Branch field names `8611ea98ed70bcbb01b094c8c66b50416bf46c54`, which the amend superseded; the head is `ec3f067c`. The two commits differ only in the handoff's own two corrected lines, so no graded content moved | 🟡 |
| 2 | The corrected plugin paragraph is true in every claim I could test: no ref matching drill exists in the plugin repo (`for-each-ref` and `branch -a` both count 0), `0242462457336a79174f1fa973e28a7a88e0cf24` carries two parents and the subject `Merge plan/drill-findings`, `08f3e1b` is reachable and an ancestor of `main`, and its `board.py` hashes equal `main`'s. One sentence of it is still wrong about the plan rather than about the plugin: at `b0a4f71b` neither U7-6 nor U2-6 names `plan/drill-findings`, both pin `08f3e1b`, and only the plan's fact table mentions the branch label. I read `board.py` from the pinned sha and the row passes | 🟡 |
| 3 | The note's parenthetical list of pre-dated citers names the archived plans, `.sdlc/tickets/T-0001.md` and the adopt-hygiene verdicts, but debt `P<n>` is also cited in the adopt-hygiene handoffs, `.sdlc/plans/adopt-hygiene-prepr3.md` and the records-refresh verdicts. The general rule the parenthetical illustrates covers them, and the note is the plan's verbatim text, so this is the plan's wording and not a builder slip | 🟡 |
