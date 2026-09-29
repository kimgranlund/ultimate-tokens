---
kind: rediagnosis
plan: prompt-audit
unit: U11
ticket: "#758"
after: .sdlc/verdicts/prompt-audit-U11.md pass 1, 🔴 at 6c7598f7
written: 2026-09-29
seat: planner, dispatched by the Orchestrator
plan-edits: revision 23 (U11-4 At `$B` cell, U11-7 criterion, pass 2 grades)
---

# U11 re-diagnosis: the builder read the plan's At `$B` cell as a statement about its own tree

Every file U11 edited is right at 1818bf59 and every plan row prints its expected column. The false record is the handoff, on two cells. Pass 2 is one builder round over `.sdlc/handoffs/prompt-audit-U11.md` on `unit/pa-U11`; nothing else moves.

## 1. Root cause

U11-4's At `$B` cell (revision 22) said "the handoff and the evidence copy are not on main at `cc5be9be`, so legs 3 and 4 read `0` there". The builder carried that sentence over to its own tree: the unit branch is cut from `plan/prompt-audit`, where both files are tracked (`git show 1818bf59:.sdlc/handoffs/prompt-audit-U8.md` prints the SA7 row once and the evidence file prints the clause twice), but the builder wrote "legs 3 and 4 need the U8 handoff and evidence file, not in this tree" and recorded `0, 1` instead of running the legs. The cell was also half wrong on its own terms: only the U8 handoff is absent at `cc5be9be`; the evidence file is on main there and leg 4 prints `2`, and leg 3 with a path on disk prints a `No such file` error, not `0`. A cell that described the wrong tree, with the wrong figure, gave the builder a sentence to copy in place of a command to run. The U11-7 cell is the same reflex: `not separately run` stands where the three gate runs should be.

## 2. Pass 2 builder brief

Branch `unit/pa-U11` from 6c7598f7, same wall (the five U11 files plus the U11 records). No source, test, script, generated or plan file changes. The handoff head must name the commit it describes: the `Branch` field reads `unit/pa-U11 @ <sha of the pass 2 handoff commit's parent, the code commit 1818bf59>` and a `Pass` or `Records` field names the pass 2 commit once it exists, so a reader can check the sha the cells were measured at.

1. Finding 1, `.sdlc/handoffs/prompt-audit-U11.md:34`. Run U11-4's four legs in the unit tree and write the cell as `0, 1, 1, 2`; drop the "not in this tree" clause. The control cell stays.
2. Finding 2, `:37`. Run P1, P3 and P6 on U11's diff against `$B` = `cc5be9be` and quote each: P1 `✓ all 54 test files passed`, `0`, `0`, `tests: baseline 54, test/run.mjs TESTS 54`; P3 `branding: clean (N files scanned)`, `em-dash: clean (N files scanned)`, `exit 0`, `0`; P6 `0` added ids over its path set. Replace `not separately run` with each gate's negative control as P1, P3 and P6 state it, run or cited as the verdict ran them (`"scrimX` in role-table.json exits 1; an ADR copy under `.sdlc/verdicts/` fails branding; `+the rule (TKT-0010)` through P6 prints `1`).
3. Keep the `Ran` table's counts current: the verdict measured em-dash at `956` files, the review wrote `957`; the handoff quotes whatever the gate prints in the pass 2 tree.
4. Rerun U11-1 to U11-7 and P4. `npm test` green, tree clean.

## 3. Plan changes made at revision 23

| Finding | Where | Change |
|---|---|---|
| 3 | U11-4, At `$B` | the cell states what each form prints at `cc5be9be` (on disk: leg 3 `No such file or directory`, leg 4 `2`; via `git show`: leg 3 `0` after a fatal, leg 4 `2`) and that the row means the on-disk form |
| 4 | U11-7, criterion and expected | the claim is scoped to P6's path set; the build row U11-5 requires carries `#758 U3` and `#758 U9`, and the same filter over `.sdlc/baseline.md` prints `1`, recorded as expected rather than left for a reader to reconcile with `no history id enters` |
| grades | unit row, grade table | pass 2 runs builder-l7, reviewer-l3, verifier-l2 |

Findings 5 (BSD grep, the Diff-bases rule already covers it) and 6 change nothing.
