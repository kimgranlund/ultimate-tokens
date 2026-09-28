---
kind: verdict
plan: prompt-audit
unit: U5
ticket: "#758"
branch: unit/pa-U5
base: 8f5c6dc0
grade: verifier-l1, the evidence run dispatched by the Verifier seat
pass: 1
written: 2026-09-26
---

# Verdict prompt-audit U5 · 🟢 · two agent files rewritten, every claim true of the tree

verdict: 🟢
sha: ebbc588ffea6b1e7ca7b5089479067e18d74bf1a

`unit/pa-U5` at `ebbc588f`, code `0d175339`. The evidence run is `/tmp/v13/pa-U5-verify.md`: every plan command
run in a clone at the head, every control planted.

| id | criterion | state | evidence | negative control |
| --- | --- | --- | --- | --- |
| P0 | G0 read by command | 🟢 | `git show origin/main:test/run.mjs \| grep -c '"repo/em-dash.mjs"'` prints `1` | the em dash gate's own plant under P3 |
| P1 | `npm test`, N agrees, tree byte-stable | 🟢 | exit `0`, `✓ all 53 test files passed`, TESTS `53`, tree `0` | the `"scrimX` clone: exit `1` |
| P3 | branding, the em dash gate, no added em dash | 🟢 | `branding: clean (786 files scanned)`, `em-dash: clean (794 files scanned)`, added `0` | a maker-brand copy: `FAIL: 3`; a planted dash line in the agent file: the gate fails |
| P4 | scope wall | 🟢 | `0`, `0`, `0`; the changed files are the two agents and the unit's two records | the six-name fixture: `3` |
| P5 | every in-scope finding has a recorded fate | 🟢 | SA4, SA5, SA6: `1`, `1`, `1`; the fate ERE `3` | the SA5 row deleted: `1`, `0`, `1` and `2` |
| P6 | no history id enters | 🟢 | added `0`, removed `0` | a `(TKT-0010)` fixture: `1` |
| P7 | the evidence copy is what its header says | 🟢 | `0`, `0`, `2`; `board.py ids` exit `0` | the plan's appended lines: `1`, `1`, and `board.py ids` exit `1` |
| U5-1 | the register and the anecdote gone, the loop stays | 🟢 | `0`, `0`, `1`, `1` | the file at the base: `2`, `2`, `1`, `1`; the loop renamed away: `0`, `0` |
| U5-2 | the type-mode rule present tense, `type.slots` once, as forbidden | 🟢 | `0`, `1`, `1`, `1` | the base: `2`, `1`, `1`, `1`; `type.registers` and `ADR-022` renamed: `0`, `0` |
| U5-3 | frontmatter untouched, two files only | 🟢 | `0`, `2`; every hunk sits below line 15 | a `description:` edit prints `2`, not the plan's written `1` (one `-` and one `+` line); the control bites, its figure is off |
| CL | the rewritten sentences are true of the tree | 🟢 | `decision-records.md:645` reads `## ADR-022: Preset typography declares REGISTERS, not slots`; `type.registers` is the live field (`registersToTypeConfig` in `scripts/gen-categories.mjs`, no category JSON carries `"slots"`); each of the six removed lines maps to SA4 or SA5, or comes back verbatim | the renames above red U5-2 |

Notes, 🟡, not this unit's gate:
- U5-3's written control figure is `1` and the run prints `2`; the plan's control cell wants `2` or "nonzero" at the next revision.
- P2 (build) is not owed: U5 touches no build-chain file.
- Carried: DD9, #755, and R53's one `STALE time test` line, the same at the base.

verdict: 🟢
sha: ebbc588ffea6b1e7ca7b5089479067e18d74bf1a
