---
kind: verdict
plan: verdict-backfill
unit: U4
ticket: "#734"
branch: unit/bf-U4
base: plan/verdict-backfill @ 363e7ddb
grade: verifier-l1, the evidence run dispatched by the Verifier seat, which re-derived the rows marked mine
contract: U4-1 to U4-4 (revision 5) and the plan rows P1, P2, P3, P7 of .sdlc/plans/verdict-backfill.md at a42d2066
pass: 1
written: 2026-09-24
---

# Verdict verdict-backfill U4 · 🟢 · 9 of 9 graded rows 🟢, 5 notes for the plan and a value ruling

verdict: 🟢
sha: a42d20660d75eb7f71e3fb02de034014e274bbee

`unit/bf-U4` at `a42d2066`. The evidence run's report is at `/tmp/v13/bf-U4-verify.md`, and its blind
closing-block table at `/tmp/v13/bf-U4-blind.md`, built from the base bytes before it opened the
handoff, the review or the diff. The worktree was only read. Mine: `verdict.py check` exits `0` on the
handoff, the review and the eleven records against their base copies; the check at the head prints
`verdicts 109 graded 109 bad 0`.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U4-1 | one `verdict:` line per record, in or right after its closing graded block | 🟢 | `1` per file; lines `12`, `48`, `4`, `83`, `366`, `28`, `19`, `218`, `100`, `36`, `72`; `11` of `11` sit in or right after the block the blind table judged closing | at `363e7ddb`: ten files at line `2`, `pif-u5.md` at `10` |
| U4-2 | every value unchanged | 🟢 | mine, under `LC_ALL=C`: `2 +verdict: 🟡`, `9 +verdict: 🟢`, `2 -verdict: 🟡`, `9 -verdict: 🟢`; the run paired each file's own lines, `11` of `11` | pif-u4's line flipped 🟡 to 🟢: `1 +verdict: 🟡`, `10 +verdict: 🟢` against `2`/`9`, unpaired. The command as written cannot bite here: mine without `LC_ALL=C` prints `11 -verdict: 🟢`, `11 +verdict: 🟢` on the clean head (N1) |
| U4-3 | no other byte moved | 🟢 | numstat `1 1` on five files, `2 1` on six, each second line a blank separator, every hunk read | one word reworded in `pif-u3.md`: `2 2` |
| U4-4 | the check green, nothing else moved | 🟢 | `verdicts 109 graded 109 bad 0`; `13` names: the eleven, the handoff, the review | a stray file: `14`; `pif-u3.md`'s line deleted: `MISSING pif-u3.md`, `bad 1`, exit `1` |
| P1 | `npm test`, no `node_modules` | 🟢 | `✓ all 49 test files passed`, count `49`, tree `0` | `scrim` to `scrimX`: `✗ 1/49 test file(s) failed` |
| P2 | branding | 🟢 | `branding: clean (652 files scanned)` | a copy of `decision-records.md`: `FAIL: 3` |
| P2 | no added prose dash | 🟢 | stripped em and en dash `0` at the head (`1` at `cd3070eb`); commit messages `0` | one prose dash line in the handoff: `1` |
| P7 | the other checks exit as at base | 🟢 | all five `exit 0` at the head and at `363e7ddb`; `ceiling-counts-check.mjs` exit `0` at both | a baseline figure changed in the adapter: `baseline-agrees-check.sh` exit `1` |
| R | the review's FIX-FIRST is fixed | 🟢 | `git show --stat a42d2066`: one file, `1 insertion(+), 1 deletion(-)`, the dash replaced by `;` | the stripped count at `cd3070eb`: `1` |

## Notes, none a U4 red

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| N1 | U4-2's command has no `LC_ALL=C`, so its control cannot bite on this host | 🟡 | `11 -verdict: 🟢`, `11 +verdict: 🟢` on the clean head and on a planted swap. The review's U4-2 figure is this artifact, and its claim that a swap would break the symmetry is false here. The plan's own rule already says every `sort` feeding a comparison runs under `LC_ALL=C` | under `LC_ALL=C` the swap prints the unpaired line |
| N2 | P3 predates revision 5 | 🟡 | as written it prints `11`, `0`, `11` against the expected `0`, `0`, `0`; the 11 are exactly the U4 set. The Risks row "this plan's rows never name a `pif-*` file" is stale too. At pre-land P3 reads red unless revised | the P3 fixture still prints `2` |
| N3 | P2's raw count reads `1` | 🟡 | the one line is the review record quoting the defective handoff line in a backtick span, so it is not prose. P2's literal figure will read `1` at pre-land unless the record paraphrases the glyph or the row exempts it | a planted prose line moves the raw count too |
| N4 | the handoff's U4-1 cell misstates four files | 🟡 | it says each line is the file's last except `pif-u1.md` and `pif-u5.md`; also untrue for `pif-u3.md` (`4` of `23`), `pif-u4.md` (`83` of `87`), `pif-u6.md` (`28` of `218`), `pif-u7.md` (`19` of `103`); its `verdicts 108` is `109` at the head | the loop output in U4-1 |
| N5 | `pif-u7-review-1.md`'s value, a ruling for the Orchestrator | 🟡 | its closing block `## Verdict` (`:210`) reads `**FIX-FIRST.** F1 blocks`, and its line is `218:verdict: 🟡`. Under #734's token rule (Q3, 2026-09-22) FIX-FIRST is 🔴; #681's U9-8 read it 🟡 because `pif-u8-review.md` titles its FIX-FIRST pass `🟡 FIX-FIRST`. U4 may not change values, so this is not a U4 red. The same split is in this unit's own review, which closes FIX-FIRST under `verdict: 🟡` while the plan it grades rules FIX-FIRST 🔴 | the other ten closing blocks give the same token under both rules |

Also recorded, cosmetic: five of the moved lines join the block above them with no blank line.
`pif-u1.md` and `pif-u6.md` sit directly under a table's last row, where GitHub renders the line as
an extra table row. `pif-u3.md`, `pif-u4.md` and `pif-u7.md` sit under a paragraph and render inline.
The check reads by line, so no gate moves. For `pif-u3.md` the run's blind table put the closing
block at the criteria table, while the builder chose the re-verify paragraph; the record has one
graded block, so line 4 is inside it either way.

Housekeeping: the run's clones `/tmp/bf4v-1790208329`, `/tmp/bf4v-neg-1790208478` and
`/tmp/bf4v-base-1790208504` are clean and still on disk; their delete was refused.

verdict: 🟢
sha: a42d20660d75eb7f71e3fb02de034014e274bbee
