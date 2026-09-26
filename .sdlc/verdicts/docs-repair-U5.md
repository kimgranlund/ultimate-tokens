---
kind: verdict
plan: docs-repair
unit: U5
ticket: "#751"
branch: unit/dr-U5
base: plan/docs-repair @ 6cf18c8c
grade: verifier-l1, the evidence run dispatched by the Verifier seat, which re-read the rows marked mine
contract: U5-1 to U5-3, the design paragraph they grade (.sdlc/plans/docs-repair.md:85), and the plan rows P1 to P6 of .sdlc/plans/docs-repair.md at 5f6b058a
pass: 1
written: 2026-09-25
---

# Verdict docs-repair U5 · 🔴 · U5-1 to U5-3 🟢 as written, the catalog path not the one the plan names, P1, P2 and P5 held by the R47 quiet window

verdict: 🔴
sha: 5f6b058af33d44117a2dbf6cbb2a119be6709222

`unit/dr-U5` at `5f6b058a`. The evidence run's report is at `/tmp/v13/dr-U5-verify.md`, and its clone
is at `/tmp/drv-1790395589`. The worktree was only read and is clean. The run held to the owner's
R47 quiet window, so it ran no `npm test`, build or corpus leg.

## The red

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| D1 | the sentence names the catalog at the path the plan's design gives (`.sdlc/plans/docs-repair.md:85`: "names `docs/lld/app-shell.md` as the shell LLD and `docs/reference/references/component-inventory.md` as its component catalog") | 🔴 | mine, `.claude/CLAUDE.md:47` at the head: `` architecture doc `docs/lld/app-shell.md` (whose component catalog is `component-inventory.md`), ``. The catalog is named by basename only, straight after a `docs/lld/` path, so it reads as a sibling there. The run: `ls component-inventory.md` and `ls docs/lld/component-inventory.md` both print `No such file or directory`; the file is at `docs/reference/references/component-inventory.md` (`git ls-files` count `1`). U5-1 greps the basename, so its needle cannot see this | the run's clone with the full path written into the same three lines: `115` lines, `bad 1`, numstat `3 3`, so the plan's path fits every written row |

What unblocks: the same three lines name `docs/reference/references/component-inventory.md`. Then,
after the window closes, P1, P2 and P5 run.

## Graded rows

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| U5-1 | both records are named | 🟢 | `1`, `1` | the file at `6cf18c8c`: `0`, `0` |
| U5-2 | the line count and every DD row's line hold | 🟢 | `115`, `rows 56 drifted 11 holds 45 undetermined 0 bad 1`, QUOTE `1` (DD9, identical at the base) | a blank line above `## Layout`: `116`, `bad 21` |
| U5-3 | the edit stays inside the Layout bullet | 🟢 | numstat `3 3`, removed `docs/lld/` lines `1` | line 47 split in two: `4 3` |
| DD55 | the quoted fragment stays on line 46 | 🟢 | line 46 starts with the quoted text, `` `project-docs` skill. `docs/site/`, `docs/lld/`, `docs/img/` ``; the check prints `0` DD55 lines | `` `docs/lld/`, `` dropped: `QUOTE DD55: not found at .claude/CLAUDE.md:46`, `bad 2` |
| P3 | branding, no added dash | 🟢 | `branding: clean (723 files scanned)`; em dash added `0`, raw `0` | a copy of `decision-records.md`: `FAIL: 3`; one prose dash line: `1` |
| P4 | scope wall | 🟢 | `0`, `0`, `0`, `0`; nothing under `.claude/docs/other/` (`0` files) | the fixture prints `2`; an engine-file line: `1` |
| P1 | `npm test` | 🔴 | pending the R47 window: `not run`; the handoff's `✓ all 50 test files passed` is unverified | not run |
| P2 | build | 🔴 | pending the window: `not run`. P4's third count is `0`, so this unit may not owe it | not run |
| P5 | the citations gate | 🔴 | pending the window: `not run`; U5 changes no file under `docs/` | not run |

## Notes

| id | item | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| N1 | the review record's value | 🟡 | its last line is `verdict: PASS`, a word, so `verdict-frontmatter-check.sh` reads `bad 12` at the head against `bad 11` at the base; the 11 were main's, fixed on main by `2981f6be`. The review also missed D1 | the base reads `bad 11`, so the twelfth is this record |
| N2 | P6's stale count strings | 🟡 | `15`, `10` at the head, `15` at the base and the plan tip; U5 moves no count string, so it is owed at pre-land by the units that own them | the base figure equals the head's |
| N3 | wording | 🟡 | line 46's "its architecture doc" has no antecedent in a sentence that lists directories (the plan says "the shell LLD"); line 48's "`.claude/docs/other/`, **PRIVATE** (see below)." lost its verb when the dash became a comma | read at `5f6b058a` |

verdict: 🔴
sha: 5f6b058af33d44117a2dbf6cbb2a119be6709222
