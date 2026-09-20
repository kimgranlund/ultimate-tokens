---
kind: checkability review
target: .sdlc/plans/records-followup.md
branch: plan/records-followup @ 407d33b9
ticket: "#709"
graded at: d34b4fb1 (origin/main), detached scratch worktree, read-only
written: 2026-09-19
method: every criterion command run as written against main's tree; grep -P absent, so PCRE ran through perl and git grep -P; npm test, npm run build and npm run smoke were NOT run (host load)
---

# Checkability of the 43 criteria of plan records-followup

Grade key. 🟢 a verifier runs the stated command and compares to the stated Expected without judgment. 🟡 runnable, with a gap named. 🔴 not checkable.

## Cross-cutting notes, before the tables

1. `F="$CLAUDE_JOB_DIR/tmp"`. `CLAUDE_JOB_DIR` is empty in an agent Bash shell on this host (measured), so `$F` resolves to `/tmp` and every throwaway clone and log lands there, against the scratchpad rule. This does not change any Expected value, so no grade moves on it. Each seat should set `F` to its own scratchpad explicitly.
2. `BASE=$(git merge-base origin/main HEAD)` is `d34b4fb1` for every unit branch cut from `plan/records-followup`, because the plan branch is one commit ahead of main and that commit adds `.sdlc/plans/records-followup.md`. So `git diff --name-only $BASE` always lists the plan file. Two criteria state a file list that omits it (U1-6, U4-6) and would red on a correct build. U2-3 and U3-6 redefine their base and are unaffected; U5's branch is cut from main after PR 1 lands, so U5-6's list is right.
3. No timing is compared against a figure taken under load. U3-3 is the only timing row, and it carries the quiet-host rule of U3 step 1 plus a `load before` threshold in its own awk. See its row for the one hole.
4. `XC` collides with nothing live. `git grep -P '(?<![A-Za-z0-9-])XC[0-9]+(?![0-9A-Za-z])' d34b4fb1` over the whole repo returns 0 hits, including `architecture.md`; the only `XC` substrings anywhere are inside EXCEPT and EXCLUSIVE in `.claude/skills/`, which the lookbehind excludes. The plugin's `ID_ROW` on `plan/drill-findings` is `^\|\s*([A-Z]-?)(\d+[a-z]?)\s*\|`, one uppercase letter, so it never reads a two-letter id, and its `plan-rules` line 44 does reserve `X<n>` for adapter conflicts, which is the premise U2's decision rests on.
5. Unit order is mechanically decidable. The chain is U1, then U2 after U1 merges, then U4, then U6, then U3, then U5 after the first PR lands. Each row names its one predecessor, each predecessor is a merge into `plan/records-followup` that `git log` answers, and U3's extra condition is the numeric quiet-host test of its step 1. The non-sequential numbering does not make the order ambiguous.

## Plan-level criteria

| # | Criterion | Grade | Why |
|---|---|---|---|
| P1 | `npm test` green, tree byte-stable | 🟡 | The command prints the runner's last line and a status count, but the Expected asks the verifier to compare N against the length of `TESTS` in `test/run.mjs`, which no command in the cell prints. P7's script makes that comparison (it printed `ok    tests: baseline 48, test/run.mjs TESTS 48`), so the gap is a cite, not a hole. Not re-run here. |
| P2 | build green and the size matches the live baseline row | 🟢 | Ran the record half: the row-scoped grep prints exactly one line, `ui.html 3780.5 KB`, and the uncorrected whole-file form prints `3780.5` and `3777.8`, so the control bites as stated. The `exit 127` claim was not re-run. |
| P3 | smoke green | 🟢 | Parses; `SMOKE PASS` is the live string at `test/smoke/smoke.mjs:293`, and the FAIL branch prints `SMOKE FAIL`, so the count discriminates. The condition "only if U3 took the full path" is answered by U3's handoff. |
| P4 | branding gate clean | 🟢 | Ran: `branding: clean (461 files scanned)`, `exit 0`. Matches the facts table. |
| P5 | scope wall | 🟢 | Ran: `0`, `0`. The plan file is under `.sdlc/`, so the first count stays `0` on the plan branch. |
| P6 | no em dash added in prose | 🟢 | Ran the fixture: prose dash `1`, dash inside a backtick span `0`, both lines without the perl stage `2`, exactly as stated. Run against the plan branch itself it prints `0`. |
| P7 | the baseline's test-file figure equals `TESTS.length` | 🟢 | Ran: seven `ok` lines, `stale total: 0`, `exit 0`. Nine lines after U3's one-line edit, which I simulated. |

## U1, five one-cell repairs

| # | Criterion | Grade | Why |
|---|---|---|---|
| 1 | debt K17's number equals the tree | 🟢 | Ran: `7`, `filters 3 files by name`. The pre-state is the finding, and the listing is derived from the tree, not copied. |
| 2 | the pass 5 sha in the map equals the sha in pass 5's header | 🟢 | Ran: `` `d814500` `` then `` `d46ae48` ``. The two lines differ today, exactly as stated. |
| 3 | the adapter states what the control reproduces | 🟡 | Pre-state runs: first line `1`, second line empty. But the Expected hard-codes `printed 3 for this corruption` while §Texts explicitly lets the builder write a different number if it measures one. Those two cannot both hold, so the verifier has to read the handoff to know which number to expect. Pin the Expected to the handoff's measured count, not to `3`. |
| 4 | the baseline credits the test file to the right commit | 🟢 | Ran: `(#699) (#702)`, `1`, `0`. Exactly the stated pre-state. |
| 5 | every sha the baseline cites is on main | 🟢 | Ran: `1`, and the line is `NOT b50a4b9b`. The perl PCRE works without `grep -P`. |
| 6 | five lines changed, four files, nothing else | 🟡 | The counts and the `stale total: 0` tail parse. The file list is wrong: `git diff --name-only $BASE` on a U1 branch also lists `.sdlc/plans/records-followup.md` (see cross-cutting note 2), so a correct build reds this cell as written. |

## U2, the id collision

| # | Criterion | Grade | Why |
|---|---|---|---|
| 1 | no X id defined in two live records, and the sweep reads all seven files | 🟢 | Ran: the list ends `,X1,X2,X3,X4,X5,X6` today, and dropping `architecture` from the file list prints only `C1` to `C7`, so the omission control bites. Both match the plan to the character. |
| 2 | the new prefix was owned by nobody | 🟢 | Ran: `0` for `XC`, `104` for `X`, both exactly as stated, through `git grep -P`. |
| 3 | mapping XC back to X reproduces the base file | 🟡 | Ran the simulated rename and the roundtrip: `0`. The gap is that the inverse map undoes an over-applied rename anywhere in the file, so an `X1` to `X6` occurrence renamed outside §4 is invisible to this row, and U2-1 reads first cells only while U2-4 reads §4 only. A naive whole-file rename changed 14 lines and still roundtripped to `0`. Add a count of `XC` occurrences outside §4, expected `0` apart from the note. |
| 4 | six XC rows, no X row left in §4, the note present | 🟢 | Ran: an empty line, `6`, `0`. Matches the stated pre-state. |
| 5 | the debt notes stopped claiming the hazard is gone | 🟢 | Ran: `2`, `0`, `0`. Matches. |
| 6 | the plugin's id check still accepts the tree | 🟢 | Ran the real `board.py ids` from `plan/drill-findings`: `exit 0` at d34b4fb1 and `exit 0` with the simulated rename applied, tree clean after. Sound as a regression guard. Worth knowing it is silent about `XC` itself: `ID_ROW` reads one uppercase letter and `X` is absent from `ID_OWNERS`, so its bite comes from the `C13` measurement records-refresh took, not from this rename. |

## U4, quote program output verbatim

| # | Criterion | Grade | Why |
|---|---|---|---|
| 1 | the rule is written once, in the adapter, and says three things | 🟢 | Ran: nothing, `0`, `0`. The third pattern is an ordered conjunction over one line, so it discriminates a partial rule. |
| 2 | the U1 verdict quotes the gate line as the control prints it | 🟢 | Pre-state ran: `refs-canonical, ordered` `cited:` appears once, on line 37. The template at `test/gate-report.mjs:82` is two spaces, FAIL, two spaces, the gate name, two spaces, a U+2014 dash, so `grep -o 'FAIL  refs-canonical.*'` captures the whole line, and the `wc -l` guard closes the empty-fixture vacuity. |
| 3 | every smoke quote outside plans/ is what the source prints | 🟢 | Ran all three sub-checks: `1`; no verbatim hit in any of the three files; and `3` files carrying an altered form, at counts baseline 1, handoff 4, verdict 1. Character-for-character the plan's pre-state. |
| 4 | each corrected history file says it was corrected | 🟢 | Ran: `0` on each of the three lines. |
| 5 | the dash measure exempts the restored quotes and nothing else | 🟡 | The first and third parts are exact (P6 verified, P4 verified). The second is a floor, "6 or more", with no ceiling, so an extra reworded dash inside a backtick span is invisible to it. Give the number the restoration implies (seven lines by my count of the five targets) or make it an equality. |
| 6 | scope: six files, history files changed only on the quote lines | 🟡 | The `1,2,4` deletion counts are reachable and well chosen: the U3 verdict's quote does span lines 78 and 79 today, so `2` is right. The file list omits `.sdlc/plans/records-followup.md` for the same reason as U1-6. |

## U6, the archive's two red criteria

| # | Criterion | Grade | Why |
|---|---|---|---|
| 1 | the corrected commands do what the corrections file says | 🟡 | Both corrected forms check out when I supply them: the U2-7 replacement prints `1`, the archived form prints `3` on a tree whose merge base is 20298cc, and P2's row grep prints one line `ui.html 3780.5 KB`. The gap is that the Command cell is "the two corrected forms, copied out of the corrections file", whose text exists only as prose in §Texts, so the verifier composes the command instead of running one. Quote both commands in the criterion. |
| 2 | the review copy is the review | 🟢 | A shasum against a literal hash, judgment-free. The scratchpad source is not reachable from here, and §Texts already rules that the unit stops rather than retypes. |
| 3 | the archive gained one revisions row and lost nothing | 🟢 | `git diff --numstat` parses and the tab-separated `1	0	path` expectation is exact. `## Revisions` is at line 473 of the archived plan. |
| 4 | the corrections file has its four rows and names its source | 🟢 | Pre-state confirmed: the file is absent, so the greps error and print no count. The three-row alternation and the `d46ae48` floor are comparable. |
| 5 | pass 5 note appended, nothing deleted, parsers unaffected | 🟡 | `git diff --numstat` parses. `$CLAUDE_PLUGIN_ROOT` is empty in an agent Bash shell here, so the command as written runs `python3 /scripts/board.py`; with the real cached path `board.py check` prints its header table and `exit 0`. Name the path or a fallback. The `1	0` or `2	0` alternative is a stated tolerance, not a hole. |

## U3, one home for all five gates

| # | Criterion | Grade | Why |
|---|---|---|---|
| 1 | the script reads five gates and everything agrees | 🟢 | I applied the one-line edit in the worktree and ran it. Output was nine lines, including `STALE time corpus-contrast: baseline 0 to 0 s, adapter none` and the same for fonts, `stale total: 2`, `exit 1`, and `git diff --numstat` printed `1	1	.sdlc/checks/baseline-agrees-check.sh`. Every value the plan predicted, verbatim. One latent vacuity: an absent baseline row reads as `0 to 0 s`, so an adapter cell of `0 to 0 s` would print `ok`. U3-2 closes it by requiring the command in the baseline's Pass table. |
| 2 | the adapter's gates and the baseline's live rows are the same five | 🟢 | Ran: two `<` lines, the corpus-contrast and fonts commands, `diff 1`. Exactly as stated. |
| 3 | the timings were taken on a quiet host and are the builder's own | 🟡 | The awk is correct: on a fixture in the stated column order it printed `3 1 1`, flagging the `11.46` load-before row and the exit-1 row. Two gaps. `load after` is a recorded column that nothing compares, and the verifier's own confirming run has no quiet-host precondition of its own, only the half-to-double tolerance and the 🟡 escape, so a loaded verifier run turns into a note rather than a retry. |
| 4 | the corpus counts in the baseline are the gate's, and the adapter carries none | 🟡 | The last two sub-checks ran and match: `0`, `1`. The third Expected is "`3` (three lines, or `1` if the three quotes share a line)", an either/or the verifier settles by reading the file rather than by comparing. Fix the layout in §Texts and give one number. The gate itself was not run here. |
| 5 | the CI sentence names the jobs the run reports | 🟢 | Ran against run 35455937943: `4`, then `0,0,0,0`, then `1`, exactly as stated. The four job names are build-test, corpus-contrast, deploy, panda-smoke. |
| 6 | adapter edits stay inside the §1 gate rows plus one §2 amendment | 🟢 | Parses, and the row redefines `BASE` as the plan-branch head it was cut from, so note 2 does not bite it. |
| 7 | regression: U1's and U4's repairs survived | 🟢 | Delegates to U1-4, U1-5 and U4-3, all three of which I ran and all three of which print exact values. |

## U5, the roadmap

| # | Criterion | Grade | Why |
|---|---|---|---|
| 1 | one head sha, and it is on main | 🟢 | Ran: `2`, and the ancestor call fails with `fatal: --is-ancestor takes exactly two commits`, exit 128. Post-fix one sha gives it two arguments, so the shape is right. |
| 2 | the worktree table is the live set | 🟢 | Ran: four `>` lines and two `<` lines, `diff 1`, and the names are the four dead and two missing ones the facts table lists. |
| 3 | the stated count is the row count | 🟢 | Ran: an empty line, then `8`. Matches. |
| 4 | one ranked row per open issue, none for a closed one | 🟢 | Ran: six `>` lines (638, 672, 673, 674, 676, 691) and three `<` lines (686, 701, 709), `diff 1`. The live set is ten open issues, so the target is ten rows. Drift between the build and the verify is handled by the row's own 🟡 rule. |
| 5 | no unanswered prompt is left | 🟢 | Ran: `1`, `2`. Matches. |
| 6 | alone: one commit touches the roadmap and only it | 🟡 | The first sub-check is vacuous on its own: `C` is empty when no commit touched the roadmap and `echo "$C" \| wc -l` still prints `1`, the Expected value. The second and third sub-checks catch that case, so the row bites as a whole. Add `test -n "$C"`. Also "P4 and P6" appear inside the Command cell as names rather than commands. |

## Counts

🟢 32 · 🟡 11 · 🔴 0 · total 43.

By unit: plan-level 6🟢 1🟡 · U1 4🟢 2🟡 · U2 5🟢 1🟡 · U4 4🟢 2🟡 · U6 3🟢 2🟡 · U3 5🟢 2🟡 · U5 5🟢 1🟡.

Every stated pre-state value I could run reproduced exactly, including the five one-cell pre-states, the 104-hit `X` control, the 22-id collision list, the smoke quote counts 1, 4 and 1, the four CI job names, and all nine lines of the simulated five-gate script. No criterion is unrunnable. The 11 🟡 grades are four wrong or loose Expected values (U1-3, U4-5, U3-4, and the two file lists), three insufficiently discriminating commands (U2-3, U5-6, U3-3), two environment variables that are empty here (U6-5 and the shared `$F`), and one command the verifier must compose rather than run (U6-1).

## Coverage map, ticket #709 to criteria

| Finding | Criteria | Covered |
|---|---|---|
| F1 debt K17 says 3 files, the filter takes 7 | U1-1, U1-6 | yes |
| F2 architecture names d814500 for pass 5 | U1-2, U1-6, U6-1, U6-4 | yes |
| F3 adapter says expect 17 FAIL | U1-3, P1 | yes |
| F4 X1 to X13 collide with X1 to X6 | U2-1, U2-2, U2-3, U2-4, U2-5, U2-6 | yes |
| F5 roadmap stale and rode the squash | U5-1, U5-2, U5-3, U5-4, U5-5, U5-6, P5 | yes |
| F6 baseline credits the test file to #706 | U1-4, U3-7 | yes |
| F7 baseline is not the one home for five gates | U3-1, U3-2, U3-3, U3-4, U3-5, U3-6 | yes |
| F8 two archived criterion texts go red | U6-1, U6-3, U6-4, P2 | yes |
| F10 baseline cites a dropped branch sha | U1-5, U3-7 | yes |
| F11 a verdict reworded program output | U4-1, U4-2, U4-3, U4-4, U4-5, U4-6, P6 | yes |

Ten findings, ten covered, none orphaned. F9 is out of scope and fixed on main.

# Revision 2 at 5bf48fa5

Scope of this pass: the 11 criteria graded 🟡 at 407d33b9, the six new U7 rows, the new U3-8 and U5-7, and U2-3's replaced control. Everything else carries its revision 1 grade. Read-only, in a scratch worktree at d34b4fb1 removed by exact name; no `npm test`, build or smoke.

## The 11 gaps, re-graded

| # | Criterion | Grade | Why |
|---|---|---|---|
| P1 | `npm test` green, tree byte-stable | 🟢 | Closed. The command now prints the comparison value itself: the new perl one-liner over `test/run.mjs` printed `48`, and the Expected is that this number equals the N in the runner's pass line. No outside derivation left. |
| P5 | scope wall | 🟢 | Closed and widened correctly for approval Q4. Ran all three sub-checks at base: `0`, `0`, nothing. With the approved `CLAUDE.md` line applied in the worktree the first stays `0` and the third prints `1	1`, exactly the stated post-state. |
| U1-3 | the adapter states what the control reproduces | 🟢 | Closed. The Expected is now `printed N for this corruption` with N tied to line three, the verifier's own count, and a mismatch is ruled 🔴. The builder's freedom to record another number no longer contradicts the row. |
| U1-6 | five lines, four files, nothing else | 🟢 | Closed. The name list now runs against `UB`, and `UB` in a unit worktree is where the branch left the plan branch, so the plan file is out of the list. The six expected paths are spelled out comma-joined. |
| U2-3 | mapping XC back to X reproduces the base file | 🟢 | Closed by a direct second count, `XC` tokens outside §4, which does not pass through the inverse map. Ran it: a correct §4-scoped rename gives `0` and `0`; a planted `XC3` line in §1 gives `1` on the second number. Two corrections to the record. My revision 1 finding of a 14-line leak was a miscount: the 14 diff lines are the six rows plus the header sentence counted twice by diff, and `debt`-free `architecture.md` carries no bare `X1` to `X6` token outside §4 at all, so there was nothing to leak. The plan says this. Second, the control's claim that the first number "stays `0`" is not reproducible: any plant that introduces an `XC` token outside §4 also moves the first number, because the base has no `X<n>` there to map back onto. Both numbers going red is stricter than stated, so the row is sound; the control's narrative is one clause optimistic. |
| U4-5 | the dash measure exempts the restored quotes and nothing else | 🟢 | Closed. The floor became an equality, `7`, against `UB`, and 7 is the right number: baseline 1, handoff 4, U3 verdict 1, U1 verdict 1, each restored line carrying one dash, with the amendment text and the three Correction lines carrying none. |
| U4-6 | scope, six files, history files changed only on the quote lines | 🟢 | Closed. Six explicit paths against `UB`. The per-file deletion loop still reads `$BASE`, which is harmless because those three history files are untouched between `BASE` and `UB`. |
| U6-1 | the corrected commands do what the corrections file says | 🟢 | Closed. Both commands are now written out, and two `grep -cF` sub-checks prove the corrections file carries them verbatim rather than a paraphrase. Ran the first two: one line `ui.html 3780.5 KB`, then `1`. The last two error with no count while the file is absent, as the control says. |
| U6-5 | pass 5 note appended, parsers unaffected | 🟢 | Closed. The empty `CLAUDE_PLUGIN_ROOT` is gone, replaced by a derivation from `core.hooksPath`. Ran it: the path resolves to the plugin repo's `scripts/board.py`, `found 0`, `exit 0`. |
| U3-3 | the timings were taken on a quiet host | 🟢 | Closed on both counts. The awk now tests `load after` as well: on fixtures it printed `2 1 0` for a hot load-before row and `2 1 0` for a hot load-after row. And the verifier's own confirming run now carries U3 step 1's precondition, with a run at load 10 or above ruled not evidence and repeated. |
| U3-4 | the corpus counts are what the gate prints | 🟢 | Closed. Step 4 now mandates a four-item list, one output line per item, so the third Expected is a flat `3` with no either/or. The last two sub-checks still print `0` and `1` at base as recorded. The gate run itself was not made here. |
| U5-6 | alone: one commit touches the roadmap | 🟢 | Closed. `test -n "$C"` added; on an empty `C` it prints `nonempty 1`, so the vacuity is gone. P4 and P6 are now written out as commands instead of named. |

## U7, the six new criteria

| # | Criterion | Grade | Why |
|---|---|---|---|
| 1 | no P id defined in two live records, by U2-1's seven-file sweep | 🟢 | Ran with U2 and U7 both simulated: `C1,C2,C3,C4,C5,C6,C7,K9,K11,K14,K17,K18`, the stated value to the character. The control holds too: dropping `debt` from the file list empties the output, so a sweep that omits either file cannot see this collision. |
| 2 | the new prefix was owned by nobody | 🟢 | Ran: `DP` followed by digits gives `0` hits under `.sdlc`, `.claude` and `README.md`, and `0` across the whole repo at d34b4fb1. The `PR` control prints `2`, so the sweep can see a taken prefix. `DP` is also outside the one-letter shape of the plugin's `ID_ROW`, so the plugin's reservation of `D` for `debt.md` is untouched. |
| 3 | mapping DP back to P reproduces the base `debt.md` | 🟢 | Simulated the rename of the four Process rows plus the numbered-list line and ran the map-back against `UB`: `0` differing lines. |
| 4 | every cite moved, counted directly and not through the inverse map | 🟢 | Ran all three sub-checks on the simulated tree and got the stated values exactly: `.sdlc/adapter.md:2`, `.sdlc/debt.md:5`, then `0`, then `22,52,91,`. Pre-state also matches: no `DP` line at all, `5`, `22,52,91,`. One authoring dependency: the second number is `0` only while the appended note stays on one physical line, because the exclusion anchors on `^Renamed 20` and the note's own prose names `P1 to P4` and `P3`. The file already carries 43 lines over 300 characters, so one line is its convention, and §Texts gives the note as one line. |
| 5 | four rows, the note, no P-headed row left, U1's and U2's debt edits survived | 🟢 | Ran on the simulated tree: `DP1,DP2,DP3,DP4`, `0`, `1`. Pre-state at base: empty, `4`, `0`. The last two sub-checks re-read U1's and U2's own strings, which is the right regression for a third unit editing the same file. |
| 6 | scope, the plugin's id check, history untouched | 🟢 | Ran: `exit 0` before and after the simulated rename, and `exit 0` even with a Process row replanted as `B1`, which is the plan's own stated limit. The reason is visible in the file: `debt.md` tables are headed lower-case `id`, and the plugin reads `#`, `Id`, `ID` only. The criterion says so and names rows 3, 4 and 5 as what actually catches a wrong debt id, so it is honest about its own reach rather than vacuous by accident. The history sub-check printed `0`. |

## The other two new rows

| # | Criterion | Grade | Why |
|---|---|---|---|
| U3-8 | the approved `CLAUDE.md` line names the jobs `ci.yml` runs on a PR, and it is the only line that moved | 🟢 | Every value ran and matched: the job list is `build-test,corpus-contrast,panda-smoke`, the target grep is `0` at base, numstat prints nothing at base, and the drift check prints `rows 56 drifted 11 holds 45 undetermined 0 bad 0`. Applying the one-line edit in the worktree gives `1	1`, the grep `1`, the same drift line, and branding still clean. The string it replaces is live at `.claude/CLAUDE.md:99`. The job list is derived from the workflow, not copied, which is the shape this whole plan is about. |
| U5-7 | the roadmap cites debt ids as `debt.md` defines them after U7 | 🟢 | Ran: `1`, `0` at base, the stated pre-state. The hand-disambiguated cell is `.sdlc/roadmap.md:91`, and both headings the awk range needs exist, at lines 80 and 96. |

## Counts

This pass: 🟢 19 · 🟡 0 · 🔴 0 of 19 graded (the 11 folded gaps, U7's six, U3-8, U5-7).

Whole plan at 5bf48fa5: 51 criteria, 🟢 51 · 🟡 0 · 🔴 0. Revision 1's other 32 🟢 grades stand; of those, only U2-1 was touched, and its new stateful Expected (the four `P` ids drop out once U7 merges) is decidable from whether U7 has merged.

Both cross-cutting notes of revision 1 are closed in the criteria preamble: `F` is now a seat-named directory under the seat's own scratchpad with the empty `CLAUDE_JOB_DIR` called out, and `UB` is defined for any row that lists a unit's own files.

Coverage is unchanged for the ten findings of #709, with two additions from the approval: approval Q3 is covered by U7-1 to U7-6 and U5-7, and approval Q4 by U3-8 and P5.

Two notes that change no grade. The `DP` prefix collides with nothing live anywhere in the repo, `architecture.md` included. And U3's criteria table lists its rows in the order 1, 2, 3, 4, 5, 6, 8, 7, so row 8 sits above row 7; worth reordering before a verifier reads down the table.

Correction (2026-09-20, plan records-followup U10, #709): the defective quotation this verdict's U4 row 2 names as its subject now carries the `cited:` marker beside it. Only the mechanical change the rule dictates was made; no grade and no finding's wording moves. Rule: `.sdlc/adapter.md` §3, the cited-quote clause under the Verbatim-quote rule.
