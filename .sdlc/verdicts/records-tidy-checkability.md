# Criteria review records-tidy · 🔴 not mobilizable (6 of 8 checkable, U1-3 and U1-5 🔴)

| Field | Value |
|---|---|
| Plan | `.sdlc/plans/records-tidy.md` @ ece994c9 (draft), merge base 730ff941 |
| Asked by | conductor, 2026-09-20: grade each criterion, and check §Texts against the current lines at 730ff941 |
| Grade | L1 seat, ran the blocks itself |
| Where measured | throwaway shared clones of the plan branch. The §Texts blocks were extracted from the plan programmatically and applied to a fixture, never retyped, so what I graded is what the plan says |
| Note on standing | this plan acts on three concerns this seat raised in `.sdlc/verdicts/k17-rerun-prepr.md`. I graded the criteria, not the conclusions |

Checkable means a command exists now that prints one value before the unit and a different value after.
Every row was run in both directions.

## Criteria

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| P1 | `npm test` green, tree byte-stable | 🟢 | fixture: `✓ all 48 test files passed`. The second leg reads `0` only once the unit is committed; on my uncommitted fixture it reads `3`, the three edited files | role table key renamed: `✗ 1/48 test file(s) failed` |
| P4 | branding gate clean | 🟢 | fixture: `branding: clean (470 files scanned)`, `exit 0` | records doc copied outside its exempt path: `FAIL: 3 branding violation(s)`, `exit 1` |
| P5 | scope wall | 🟢 | `0` before and `0` on the fixture | all five stated legs fire: a byte on the A2 verdict `1`, a new `.sdlc/checks/new.sh` `1`, the slug not at the start of the name `1`, a second plan file `1`, the loop's own later records together `0` |
| U1-1 | the rerun note names the newest pass, computed from the verdict | 🟢 | before `1`, `0`, `0`, `0`, `0`; after `0`, `1`, `1`, `1`, `1` | `pass 6 of` retyped as `pass 5 of`: third leg `0`. A second map line edited: fourth leg `2` |
| U1-2 | the debt row quotes the map's filter byte for byte | 🟢 | before `0`, `1`, `0`, `0`; after `1`, `0`, `1`, `1` | `ui/counts.mjs` dropped from the map's cell with the debt row unchanged: first leg `0`, so either file moving alone fails |
| U1-3 | adapter §2.1 says reviewer-l4, no reviewer-l3 remains, one dated amendment | 🔴 | before `1`, `0`, `0`, `0`, `0`, `0`; after `1`, `2`, `1`, `1`, `2`, `1`. Five of six legs read their expected value; the first reads `1` where the plan expects `0` | the plan's own control reproduces exactly: amendment added with line 58 untouched gives `2`, `1`, `1`, `0`, `1`, `0`. An amendment omitting the skill name: third leg `0` |
| U1-4 | the A2 verdict is untouched and its seven counts hold | 🟢 | empty stat, then `18`, `18`, `19`, `31`, `1`, `7`, `19 19` | one pass 5 K row deleted: stat reads `1 file changed, 1 deletion(-)` and the second leg `17` |
| U1-5 | no other record under `.sdlc/` gained or lost a reviewer-l3 | 🔴 | `0` before and `0` after, correct | none that fires. The stated control prints `0`, byte-identical to the pass value. Committed, the same edit prints `1` |

## U1-3, the first 🔴

The criterion reads "no `reviewer-l3` remains in the adapter" and expects `grep -c 'reviewer-l3' $AD`
to print `0`. §Texts requires an amendment paragraph that explains the change, and that paragraph uses
the old word three times on one line: once naming what item 1 said, once explaining that the grade is
opus, once saying prior records keep it. So after a faithful paste of §Texts the block prints `1`.

Measured on the fixture: the only remaining hit is adapter line 63, the amendment itself.

The plan already knows. Its own negative control for this row reads "Fixture with the amendment added
and line 58 untouched: `2`, `1`, `1`, `0`, `1`, `0` (the amendment itself carries the old word once)",
and I reproduced that row exactly. So the criterion contradicts the text the same plan mandates.

Why this is 🔴 and not a note: a builder who pastes §Texts fails the criterion, and the cheapest way to
pass it is to strip the explanation out of the amendment, which is the one sentence that makes the
record self-describing. The criterion as written pushes against the change it is grading.

## U1-5, the second 🔴

The block compares `git grep` at two committed revisions, `$MB` and `HEAD`. The stated negative control
is `sed -i '' 's/reviewer-l3/reviewer-l4/' .sdlc/plans/archive/k17-rerun.md` in the clone, which edits
the working tree only. Measured: it prints `0`, byte-identical to the pass value. The control cannot
fail, so nothing shows the check works.

Committed, the same edit prints `1`. So the criterion is sound and its control is one step short.

This is the shape that bit the k17-rerun loop twice: a leg whose failure value equals its pass value.
A verifier running the control as written sees `0`, records "control fired", and is wrong.

## §Texts against the current lines at 730ff941, as asked

| Target | Present as the plan says | Applied cleanly |
|---|---|---|
| `.sdlc/architecture.md` line 18 | yes, one line, the whole rerun note, ending `the U3 verdict grades it.` | yes, and it is the only deleted line of the map |
| `.sdlc/debt.md` line 92 | yes, the `K17` row, containing `the control filters 3 files by name` | yes, only deleted line of that file. Its filter matches the map's K17 cell byte for byte, verified by lifting the cell, not by reading |
| `.sdlc/adapter.md` line 58 | yes, §2.1 item 1, containing `(reviewer-l3) and` | yes, one deleted line and two added non-blank lines, item 1 and the amendment |
| the amendment's insertion point | after item 4 and its blank line, before `### 2.2` | yes, lands at line 63 with `### 2.2` at 65 |

Two observations on the replacement text, neither a defect.

| # | Observation |
|---|---|
| N1 | the map's new line drops two sentences of the old one: the header sentence, which gains the k17-rerun regrade, and `Where a pass 5 result differs from a §6 cell, pass 5 is the current reading...`, which the newest-pass rule supersedes. That is the change, not a loss. No other sentence of the old line is dropped |
| N2 | the new debt row splits into 15 fields on a raw pipe split where today's splits into 9, because the lifted filter carries markdown-escaped pipes. Precedented: the map's own K17 row already splits into 28 the same way, and nothing under `.sdlc/checks/`, `test/` or `scripts/` parses `debt.md` at all. Only `doc-drift-rows-check.sh` reads a record this way, and it reads the map's section 8 |

## Verdict

6 of 8 checkable. U1-3 expects a value its own §Texts makes unreachable; U1-5's negative control cannot
fail. Both are one-line repairs and neither touches the change itself. By the mobilization rule this
plan is not mobilized until those two rows are repaired. Everything else reproduced exactly as the
planner measured it, including every other negative control.

## Pass 2 · the revised plan at 20869d1b · 🟢 8 of 8 checkable, mobilizable

| Field | Value |
|---|---|
| Asked by | conductor, re-review U1-3 and U1-5 only |
| Plan | `.sdlc/plans/records-tidy.md` @ 20869d1b, revision row 2 |
| Read first | the plan diff 8916482f to 20869d1b. Revision 2 touches two command lines and two criterion sentences. §Texts, the wall and the other six rows are unchanged, so pass 1's grades for them stand |
| Where measured | a fresh throwaway clone of the revised branch, §Texts extracted from the plan and applied, never retyped |

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| U1-3 | adapter §2.1 item 1 says reviewer-l4, no reviewer-l3 outside the amendment that records the rename | 🟢 | leg 1 now counts outside amendment paragraphs and reads `0` after §Texts, where pass 1 measured `1`. All six legs: `0`, `2`, `1`, `1`, `2`, `1`, exactly as the plan states | a stray `reviewer-l3` sentence added outside any amendment: leg 1 `1`, so the leg bites. Amendment added with line 58 untouched: `1`, `1`, `1`, `0`, `1`, `0`, the revised figures. Amendment omitting the skill name: leg 3 `0` |
| U1-5 | no other tracked record gained or lost a reviewer-l3 | 🟢 | the second side now reads the working tree, and the block reads `0` after the edits | the history file rewritten and left uncommitted: `1`, where pass 1 measured `0` and could not fail. The same edit committed: `1`. A staged `.sdlc/verdicts/records-tidy-x.md` carrying the word: `0`, excluded by name and inside the wall |

Both repairs do what they claim, and both were measured failing before and passing after.

### One note, not a gap

`grep -v '^\*\*Amendment ('` excludes every amendment paragraph in the adapter, not only the one that
records this rename. The adapter carries nine. The criterion's own sentence says "outside the amendment
paragraph that records the rename", singular, so the command is broader than the words.

Measured: none of the other eight mentions the word today, so the exclusion costs nothing at this
landing. Measured also: a `reviewer-l3` claim planted inside a different amendment paragraph reads `0`
on U1-3 leg 1 and `0` on U1-5, which excludes the adapter by design, while a plain count reads `2`. So
a future amendment could reintroduce the word as a live claim and no criterion here would see it.

That is a future-facing blind spot in a row that is otherwise sound at this landing, so it does not
change the grade. It is worth a sentence in the amendment or a narrower exclusion if a later plan
touches this row.

### Verdict

8 of 8 checkable. The plan is mobilizable. Nothing here grades the unit; that is a separate verdict
after it is built.
