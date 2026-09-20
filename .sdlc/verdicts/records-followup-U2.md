# Verdict U2 · 🟢

Plan `.sdlc/plans/records-followup.md` at `plan/records-followup` tip `ce20bea9dfd48cb015b2a953f3f9591da1c8d229` (the corrected counting commands of `cca4d0b8152ec239a004d29b9367fe1bfdb91b50` are an ancestor, so the tip text is what ran). Graded head `unit/rf-U2` @ `d5971271f3c3255ee38b68524cd35db82df5db5a`. `BASE` = `d34b4fb1beefff11c9be53ec039d4265c925da4a`, `UB` = `5361bc79c11fc6697fa72e2fb0fa15b909e1c9b3`. Handoff present on the unit branch: `.sdlc/handoffs/records-followup-U2.md`, 88 lines added against `UB`.

Every command ran in this seat's own detached worktree at the graded head, and every file-editing control in a throwaway `--shared` clone, both under this seat's own scratchpad directory. No `.worktrees/*` or `.git-worktrees/*` path was read or written, and nothing was edited, pushed or fixed on any branch.

Host load beside `npm test`: started `19:31 up 12 days, 1:28, 14 users, load averages: 6.42 10.81 22.55`, finished `19:34 up 12 days, 1:31, 14 users, load averages: 14.60 12.29 20.85`. The clone's `npm test` control ran concurrently with nothing else of this seat's.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U2-1 | no X id is defined in two live records, and the sweep reads `architecture.md` | 🟢 | `C1,C2,C3,C4,C5,C6,C7,K9,K11,K14,K17,K18,P1,P2,P3,P4`, the Expected list at U2's verdict, the four `P` ids still present because U7 has not merged | at `BASE` the same seven-file command prints `C1,C2,C3,C4,C5,C6,C7,K9,K11,K14,K17,K18,P1,P2,P3,P4,X1,X2,X3,X4,X5,X6`; dropping `architecture` from the file list at `BASE` prints `C1,C2,C3,C4,C5,C6,C7` and no X at all, the omission F4 names |
| U2-2 | the new prefix was owned by nobody before this unit | 🟢 | `0` | the same command with `X` for `XC` at `BASE` prints `104` |
| U2-3 | the rename is the only change to the map: mapping XC back to X reproduces the base file except the appended note | 🟢 | `0`, then `0` | the planted control ran: a base copy carrying `This paragraph cites X3 as a cross-cutting claim.` inside §1 against a candidate carrying `XC3` on that same line makes the inverse-map diff print `0` while the direct out-of-§4 count prints `1`, so the second number catches the rename the first cannot see. A bare inserted line (not a rename) prints `1` and `1` |
| U2-4 | the six rows and the note are there; no X-headed row is left in §4 | 🟢 | `XC1,XC2,XC3,XC4,XC5,XC6`, `0`, `1` | at `BASE` the same three commands print an empty line, `6`, `0` |
| U2-5 | the debt notes stopped claiming the hazard is gone | 🟢 | `0`, `2`, `0` | at `BASE`: `2`, `0` for the first two counts |
| U2-6 | the plugin's id check still accepts the tree | 🟢 | `python3 board.py ids .sdlc` from `plan/drill-findings` printed nothing, `exit 0` | an adapter row `\| C13 \| planted row \| planted \| planted \|` inserted after §4's `X1` row makes it print `adapter.md:104: C13 defined in a adapter file; owner kind ['plan']` and `exit 1` |
| P1 | `npm test` green with no `node_modules`, tree byte-stable | 🟢 | `✓ all 48 test files passed`, then `48` from the `TESTS` count, then `0` | in the clone, `"scrim` to `"scrimX` in `docs/reference/data/role-table.json`: `✗ 1/48 test file(s) failed`, `exit 1`, `grep -c FAIL` = `3` |
| P2 | `npm run build` green and prints the live baseline row's size | ⚪ | pre-land only, not graded at a unit | n/a |
| P3 | `npm run smoke` green | ⚪ | pre-land only, and only on U3's full re-measure path | n/a |
| P4 | branding gate clean | 🟢 | `branding: clean (467 files scanned)`, `exit 0` | in the clone, `cp docs/reference/references/decision-records.md .sdlc/verdicts/x.md`: `FAIL: 3 branding violation(s) across 468 files` |
| P5 | scope wall outside `.sdlc/` | 🟢 | `0`, `0`, then nothing, which is the Expected before U3 merges | in the clone: `echo "// probe" >> src/engine/motion.mjs` makes the first number `1`; one appended line in `.sdlc/roadmap.md` makes the second `1`; two existing `.claude/CLAUDE.md` lines edited in place make the third `2	2` |
| P6 | no em dash added in prose | 🟢 | `0` | fixture in the clone: a `+` line with the dash in prose raises it to `1`, the same dash inside a backtick span leaves it at `0`, and without the `perl` strip the pair counts `2` above the tree's own `1` |
| P7 | the baseline's test-file figure equals `TESTS.length`, by script | 🟢 | seven `ok` lines, `stale total: 0`, `exit 0` (seven, not nine, because U3 has not merged) | in the clone, `48 test files` to `47 test files` in `.sdlc/baseline.md`: `STALE tests: baseline 47, test/run.mjs TESTS 48`, `stale total: 1`, `exit 1` |

## The full X1 to X6 sweep

`git grep -o -P '(?<![A-Za-z0-9-])X[1-6](?![0-9A-Za-z])' HEAD -- .sdlc .claude README.md` finds 158 tokens on 89 lines in 20 files. Every one was read in context and assigned an owner. No token is misfiled and no live record cites an architecture §4 row under a bare `X` outside the exemption the unit's own note grants.

| Owner | Tokens | Where | Verdict |
|---|---|---|---|
| adapter conflict series `X1` to `X13`, must stay `X` | 82 | `adapter.md` 16, `plans/archive/records-refresh.md` 39, `verdicts/records-refresh-U4.md` 9, `verdicts/records-refresh-checkability.md` 7, `handoffs/records-refresh-U4.md` 6, `verdicts/records-refresh-prepr.md` 1, `questions/survey-2026-09-18-approval.md` 1, `board.md` line 20 1, `debt.md` the `X5` and `X6` cites 2 | 🟢 all correctly `X` |
| architecture claim series, renamed to `XC`, surviving `X` only as a dated historical reference | 56 | `plans/records-followup.md` 22, `verdicts/records-followup-checkability.md` 13, `architecture.md` own rename note 5, `handoffs/records-followup-U2.md` 5, `debt.md` the two `X1 to X6` ranges 4, `verdicts/architecture.md` 3, `board.md` line 22 2, `questions/records-followup-approval.md` 2 | 🟢 none is a live cite that should read `XC` |
| a third, unrelated series: the adopt-hygiene plan review's own blocker ids `X1` and `X2` | 20 | `verdicts/adopt-hygiene-plan.md` 9, `plans/archive/adopt-hygiene.md` 4, `tickets/T-0001.md` 4, `plans/adopt-hygiene-prepr3.md` 2, `verdicts/adopt-hygiene-U3-review.md` 1 | 🟢 neither architecture nor adapter, correctly untouched |

Misses: `0`.

The one case that needed a ruling rather than a reading is `.sdlc/verdicts/architecture.md`, which grades the renamed rows under `X2` on lines 8 and 20, three tokens. It is the only live grading record that cites an architecture claim by its old id. The unit's appended note covers it by name: `` `.sdlc/verdicts/architecture.md` grades these rows under their old ids and was not rewritten: X<n> there means XC<n> here. `` The plan's Not in scope section rules the same way, so this is exempted, not missed.

`XC` ownership is confirmed sole. `git grep -n -E '^\| XC[0-9]+ \|'` over the whole tree returns row heads in `.sdlc/architecture.md` and nowhere else. Seven other files carry the token, and every one of them describes the rename rather than defining a row: the plan, the board row, the two `debt.md` notes, the builder's handoff, the approval question and the checkability verdict.

## Text fidelity and scope of the unit's own commit

The appended note is byte-identical to the plan's §Texts string with `<date>` resolved to `2026-09-19`; `diff` against the extracted plan text shows no difference beyond the trailing-newline artifact of the extraction. The unit's own commit against `UB` touches three files and nothing else: `.sdlc/architecture.md` `9	7`, `.sdlc/debt.md` `2	2`, `.sdlc/handoffs/records-followup-U2.md` `88	0`. The seven changed `architecture.md` lines are the six row heads plus the header sentence `(A-, T-, P-, X-, L- ids)` to `(A-, T-, P-, XC-, L- ids)`; the two added lines beyond them are the note and its blank separator.

## Notes, outside U2's criteria

The one backticked em dash that P6's strip is designed to spare comes from U1's merged verdict row `U1-3`, not from U2; measured against `UB`, U2's own added lines carry `0` em dashes with or without the strip.

`.sdlc/board.md` line 22 still shows U2 as `⚪`, `0` progress, owner `builder`, `not dispatched`, `unit/rf-U2 (to be cut)`. That row is the Orchestrator's to flip and is not in U2's file list, so it does not bear on this verdict.
