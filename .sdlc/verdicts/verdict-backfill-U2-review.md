# Review verdict-backfill U2 · 🔴 FIX-FIRST (one red row, P2)

| Field | Value |
|---|---|
| Seat | reviewer-l2, pass 1, fresh context |
| Head | `2ffac52e` on `unit/bf-U2`, base `357fcb39`, plan-level `B` `3e99fdca` |
| Where | `git clone -q --shared` of the worktree at `2ffac52e` (rows), a second clone for every mutation, a detached worktree of that clone at `B` for P7; none of them is the unit worktree or the root |
| Order | the 16 records were read and derived before the handoff was opened |
| Result | 16 of 16 tokens agree (mine, the builder's, the plan's); every U2 row and P1, P3 to P7 🟢; P2 🔴 on two em dashes the handoff adds |

## The 16 records, derived by me

The control column is the same file's last `verdict:` value at `357fcb39`, read by `git show 357fcb39:<file> | grep '^verdict:' | tail -1`: empty or prose on all 16, so each head value below was written by this unit.

| File | Final state stated at | My token | Plan | Head's last `verdict:` | Control at base |
|---|---|---|---|---|---|
| `adopt-hygiene-U5-review.md` | `:9` `\| Verdict \| 🟢 clear \|`, held by `:60` `All three criteria are green on this pass with no blocking findings.` | 🟢 | 🟢 | `2:verdict: 🟢` | `` (none) |
| `baseline-regex-U1-review.md` | `:4` `**Verdict: 🟢 PASS.**` | 🟢 | 🟢 | `2:verdict: 🟢` | `` (none) |
| `k17-rerun-checkability.md` | `:82` `## Pass 2 · the revised plan at 67b1ee60 · 🟢 10 of 10 checkable, mobilizable`, overturning the `:1` 🔴 title | 🟢 | 🟢 | `143:verdict: 🟢` | `` (none) |
| `records-followup-U11-review.md` | `:21` `🟡 pass with notes.` | 🟡 | 🟡 | `9:verdict: 🟡` | `` (none) |
| `records-followup-U12-review.md` | `:4` `Verdict: PASS.` | 🟢 | 🟢 | `2:verdict: 🟢` | `` (none) |
| `records-followup-U13-review.md` | pass 7, `:617` `🟢 PASS at 55672d46, with two 🟡 notes on the witness that change no figure.` | 🟢 | 🟢 | `668:verdict: 🟢` | `FIX-FIRST` |
| `records-followup-U14-review.md` | pass 3, `:363` `**PASS at 79dc31ed.**` | 🟢 | 🟢 | `366:verdict: 🟢` | `FIX-FIRST` |
| `records-followup-U14-window.md` | rows W-ISSUES to W-V2 at `:25` to `:30` all `🟢`; nothing named as failed (Q3) | 🟢 | 🟢 | `7:verdict: 🟢` | `` (none) |
| `records-followup-U8.md` | `:31` `🟢 on the fix itself.`, then `:38` `🟡 one note, no rework asked for`, `:43` `🔴 none.` (a notes-only 🟡 does not demote) | 🟢 | 🟢 | `9:verdict: 🟢 green-with-one-note` | `green-with-one-note` |
| `records-followup-checkability.md` | `# Revision 2`, `:170` `Whole plan at 5bf48fa5: 51 criteria, 🟢 51 · 🟡 0 · 🔴 0.` | 🟢 | 🟢 | `9:verdict: 🟢` | `` (none) |
| `records-followup-prepr-review.md` | body `:22` `Verdict FIX-FIRST: the mechanics hold, one blocking finding.` (FIX-FIRST is 🔴, Q3) | 🔴 | 🔴 | `8:verdict: 🔴` | `` (none) |
| `records-followup-roadmap-authz.md` | `:31` to `:33` `🟢 pass 4`, CI `pass`, `ACCEPT`; `:37` the squash authorized | 🟢 | 🟢 | `10:verdict: 🟢` | `` (none) |
| `records-followup-roadmap-census.md` | `:334` `318 hold, 48 fail, 16 unresolvable`, `:344` `**45 🔴 and 1 🟡** distinct defects`; corrections 6 to 13 move sites, not the conclusion | 🔴 | 🔴 | `9:verdict: 🔴` | `` (none) |
| `records-refresh-prepr-review.md` | `:4` `Verdict: FIX-FIRST.`, no later pass | 🔴 | 🔴 | `2:verdict: 🔴` | `` (none) |
| `records-tidy-U1-review.md` | `:40` `**Verdict: 🟢 pass**` | 🟢 | 🟢 | `2:verdict: 🟢` | `` (none) |
| `records-tidy-checkability.md` | `:79` `## Pass 2 · the revised plan at 20869d1b · 🟢 8 of 8 checkable, mobilizable`, overturning the `:1` 🔴 title | 🟢 | 🟢 | `115:verdict: 🟢` | `` (none) |

## The five files that moved more than one added line

| File | numstat | Plan allows | Judgment |
|---|---|---|---|
| `k17-rerun-checkability.md`, `records-tidy-checkability.md` | `2 0` | Steps (2) "end of the file after one blank line"; P5 lists `2 0` for both | 🟢 a blank line and the token after the Pass 2 `### Verdict`; the 🔴 title stays as pass 1's history and the last line carries the overturn |
| `records-followup-U8.md` | `1 1` | Steps (2) and U2-4 name `verdict: 🟢 green-with-one-note` in place; P5 lists `1 1` | 🟢 the prose is kept after the token, so the record says the same thing. Note: `read_gate` would read the value as `🟢 green-with-one-note`, not `🟢`; harmless because this is a unit verdict, never a `--gate` record |
| `records-followup-U13-review.md` | `3 1` | Steps (2), U2-4, Q3 ruling: pass 1 line becomes `verdict: 🔴 FIX-FIRST`, `verdict: 🟢` appended; P5 lists `3 1` | 🟢 the prefix restates pass 1 in the record's own glyph (`:28` `🔴 **FIX-FIRST.**`), keeps the word, and no pass block body moved, so the record's account of its past is unchanged. The last `verdict:` line, the one `read_gate` keeps (its loop overwrites on every match), is `668:verdict: 🟢`, exactly `🟢` |
| `records-followup-U14-review.md` | `3 1` | same as U13 | 🟢 pass 1's findings F1 to F3 are 🔴 (`:49`, `:70`, `:86`), so `🔴 FIX-FIRST` is its own state; `verdict-pass-2: PASS` and `verdict-pass-3: PASS` do not match `^verdict:`; the last line is `366:verdict: 🟢` |

## Rows

| # | Criterion | State | Evidence | Negative control (run by me) |
|---|---|---|---|---|
| U2-1 | 16 values are each record's final state, derived before the handoff | 🟢 | table above; handoff and plan agree on all 16, no disputed row; the last-line loop prints `records-followup-U13-review.md 🟢`, `records-followup-prepr-review.md 🔴`, `records-followup-U11-review.md 🟡`, matching my derivation | `adopt-hygiene-U5-review.md` line set to `verdict: 🔴`: check still `verdicts 82 graded 82 grandfathered 0 bad 0`, exit 0; only my derivation from `\| Verdict \| 🟢 clear \|` reds it |
| U2-2 | five at line 2, seven last front-matter line, four ending `verdict: 🟢` | 🟢 | `1 1 1 1 1`, `1 1 1 1 1 1 1`, `1 1 1 1` | a trailing blank line appended to `k17-rerun-checkability.md`: third loop `0 1 1 1`; U11's line moved below `---`: awk prints `written: 2026-09-20`, count `0` |
| U2-3 | byte-pinned body untouched | 🟢 | `e30720eb197f324c739cb2536d2de91f8d6037c4aad2a5ac877a80de9040c3b2` twice, then `1` | the line moved directly below the marker: body hash `d8bcc6d456b94608`, count above marker `0` (differs from the plan's `8693a8ae` because my planted line is `verdict: 🔴`, the plan's predates the token) |
| U2-4 | three prose lines carry a token; superseded ones are not last | 🟢 | `1`; `12:verdict: 🔴 FIX-FIRST 668:verdict: 🟢` (file is 668 lines); `10:verdict: 🔴 FIX-FIRST 366:verdict: 🟢` (366 lines) | U8 line reverted to prose: `VALUE records-followup-U8.md: last verdict: green-with-one-note is not 🟢, 🟡 or 🔴`, `bad 1`, check exit 1; at `357fcb39`: `12:verdict: FIX-FIRST`, `10:verdict: FIX-FIRST` |
| U2-5 | list is its header alone, check still reads it | 🟢 | `0`, `1`, `verdicts 82 graded 82 grandfathered 0 bad 0`, `exit 0` | `echo survey.md >> $L`: `CLEARED survey.md: grandfathered but carries the field`, `bad 1`, exit 1 |
| U2-6 | U1 rows hold at the U2 head | 🟢 | U1-1 `31`, no `MISMATCH`; U1-2 `28 1` and three `verdict: 🟢`; U1-4 stands since `git diff --name-only 357fcb39..HEAD` over the 31 prints `0` | `sed '2s/🟢/🟡/'` on `adopt-hygiene-U1.md`: `title=🟢 line=🟡`; the same loop run with the 16 U2 names instead prints 16 `MISMATCH` lines (e.g. `MISMATCH k17-rerun-checkability.md title=🔴 line=🟢`) |
| P1 | `npm test` green, tree clean | 🟢 | `✓ all 48 test files passed`, `48`, `0`; regression guard only, nothing U2 touches is on the test path | `"scrim` to `"scrimX` in `role-table.json`: `neg exit 1`, `✗ 1/48 test file(s) failed` |
| P2 | branding clean, no added em dash | 🔴 | `branding: clean (573 files scanned)`, then `2`, `0`. Both dashes are U2's, in `.sdlc/handoffs/verdict-backfill-U2.md:19` (the U11 row, the dash between its `## Verdict` span and its `🟡 pass with notes` span) and `:26` (the prepr row, `... blocking finding." — FIX-FIRST reads 🔴`) | the same command over `3e99fdca..357fcb39` (U1's head) prints `0`; `decision-records.md` copied to `.sdlc/verdicts/x.md`: branding exit `1` |
| P3 | scope wall | 🟢 | `0`, `0`, `0`; `357fcb39..2ffac52e` names 18 paths: the 16, the list, the handoff, nothing else, no `pif-*` | fixture `survey.md`, `pif-u2.md`, `roadmap.md` through the first filter: `2` |
| P4 | check green, list holds no name | 🟢 | `verdicts 82 graded 82 grandfathered 0 bad 0`, `exit 0`, `0` | CLEARED as in U2-5; `records-tidy-U1-review.md` line 2 deleted: `MISSING records-tidy-U1-review.md: no verdict: line`, `bad 1`, exit 1 |
| P5 | each file changed by its line only | 🟢 | `42 1 0`, `1 1 1`, `2 2 0`, `2 3 1`; summed `added 53 deleted 3 files 47`, the plan's reference | one extra line inserted in `baseline-regex-U1-review.md`: numstat `2 0` for a line-2 file, outside its allowed `1 0` |
| P6 | the added line is last and names the table's token (U2 set) | 🟢 | 16 lines, each the plan's token, e.g. `records-followup-U11-review.md 🟡`, `records-followup-roadmap-census.md 🔴` | the 16 names hash `ee97008bb4def1516de7765c7e0145768217a4df8ca3c3bb001247e7a0aad8e8` both typed from the plan and as the lines this unit deleted from the list; at base the same loop prints empty, `FIX-FIRST` or `green-with-one-note` |
| P7 | other checks exit as at `B` | 🟢 | five `exit 0` at the head and five `exit 0` in the worktree at `3e99fdca` | `56 to 60 s` to `56 to 61 s` in the adapter: `baseline-agrees exit 1` |

## Findings

| # | Severity | Finding | Fix |
|---|---|---|---|
| F1 | 🔴 | P2's second command prints `2`, expected `0`: the handoff adds two em dashes outside backticks (`:19`, `:26`); its own `:56` claims `Em dash sweep on added lines: 0` | replace both dashes (a colon or comma) and rerun P2; the handoff claim then stands |
| F2 | 🟡 | the handoff's `:10` heading reads `The verifier's own derivation (U2-1)`; it is the builder's table, and U2-1 reserves the derivation for the verifier | retitle it the builder's derivation in the same fix commit |
| F3 | 🟡 | `:26` also carries an en dash, `corrections (6–13)`; not an em dash, so P2 passes it, but it is the same glyph class the house style avoids | `6 to 13` while the line is open |
| N1 | note | `records-followup-U8.md` reads `🟢 green-with-one-note` through `read_gate`, not `🟢`; the plan chose this shape and the file is never a gate record | none for this unit |

Verdict: FIX-FIRST. The 16 tokens, placements, pinned body, list and scope are right; the one red is two dashes in the handoff, a one-commit repair.

verdict: 🔴
