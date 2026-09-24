---
kind: question
plan: records-followup
unit: U9
from: builder
written: 2026-09-20
---

# Question U9 · from builder

| Field | Value |
|---|---|
| Blocks | U9 criterion 5 (`npm test` green) and plan row P4, both red at `6ccfcf4e` on one cause |
| Question | Who repairs `.sdlc/verdicts/records-followup-U8.md`, whose negative-control cell writes the retired maker token literally and reds the branding gate? |
| Options | A the U9 builder applies U4's ruled repair now, in this unit, with a dated correction note · B a new unit of its own, dispatched to whoever owns verdict records · C the U8 verifier is re-dispatched to repair its own record |
| Default if unanswered | A |

## What is red

The gate's two lines, one inline span each, as `.sdlc/adapter.md` §3 requires:

- `  ✗ .sdlc/verdicts/records-followup-U8.md: contains "` (altered: retired name removed; the quote is cut exactly where the gate repeats the banned string back, and the rest of the line says the product is unattributed and names it)
- `FAIL: 1 branding violation(s) across 498 files`

Writing that first line whole is what put this document on the gate's own list for one run, which is the defect it reports, committed twice. Cutting it is the repair the rule already prescribes, and the builder owns this file.

`npm test` carries it: `▶ repo/branding.mjs        FAIL`, then `✗ 1/48 test file(s) failed`, exit 1, 124 s, no `node_modules`, tree clean after apart from this unit's own two uncommitted files.

## It is not the merge

Measured in a throwaway shared clone under this builder's own scratch directory, removed after.

| Head | What the gate printed |
|---|---|
| `3ce50daa` (`origin/main`) | `branding: clean (476 files scanned)`, exit 0 |
| `eac3d9fb` (the commit that added the U8 verdict) | `FAIL: 1 branding violation(s) across 481 files` |
| `fd3d110a` (the U8 merge after it) | `FAIL: 1 branding violation(s) across 482 files` |
| `c130dd13` (the plan tip this unit branched from) | `FAIL: 1 branding violation(s) across 482 files`, same one file, exit 1 |
| `6ccfcf4e` (this merge) | `FAIL: 1 branding violation(s) across 498 files`, same one file |

The gate has been red on `plan/records-followup` since `eac3d9fb`. The merge changed only the scanned-file count, from 482 to 498, because main brought seventeen more records.

## Why it happened, and the repair already ruled for it

Line 27 of that verdict is the U8-6 row, whose subject is the branding gate itself. It writes the token twice: once naming what the control appended to a file in the clone, and once quoting the gate's own `✗` line back verbatim. `test/repo/branding.mjs:41` skips only `.git`, `node_modules`, `dist`, `other` and the worktree directories, so `.sdlc/verdicts/` is in scope and no quote is exempt there. That is the case `.sdlc/adapter.md` §3 already rules, in the verbatim-quote rule U4 wrote:

> The branding gate (`test/repo/branding.mjs`, row X12) has no quote exemption and gets none: a quote that would carry one of its three banned strings is cut before that string and marked `altered: retired name removed`.

Adapter row X12 says the gate scans `.sdlc/` on purpose and gets no exemption, so widening the gate is not on the table.

Under option A the builder cuts both spans exactly as that sentence prescribes, marks each `altered: retired name removed`, changes no figure, no state and no other row, and appends one dated correction note to the verdict saying what was cut and why. The row's two 🟢 figures, `481 files scanned` and `FAIL: 1 branding violation(s) across 481 files`, stay as the U8 verifier measured them.

## Answer

Held, 2026-09-20, from the Orchestrator, escalated to the Conductor. Option A is on hold: a verdict is the Verifier seat's record, and a builder rewriting the grader's words, even mechanically, is the wrong owner. The Orchestrator reproduced the red on `plan/records-followup` independently, same single file, same first-red commit.

The U9 builder had begun applying A when the hold arrived and reverted it: `.sdlc/verdicts/records-followup-U8.md` is byte-identical to `6ccfcf4e` and this unit changed nothing in it. U9 records `npm test` and `P4` red with the evidence above and the cause named. If the ruling comes back A the repair is one line under `.sdlc/adapter.md` §3; if it comes back as the U8 verifier's own repair on the plan branch, U9 merges that tip in and re-measures.
