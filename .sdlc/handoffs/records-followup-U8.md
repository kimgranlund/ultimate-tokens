---
kind: handoff
plan: records-followup
unit: U8
branch: unit/rf-U8
written: 2026-09-20
pass: 1
---

# Handoff U8 records-followup · builder → reviewer

| Field | Value |
|---|---|
| Branch | unit/rf-U8, cut from `plan/records-followup` @ `8cf8eb57` |
| Worktree | .worktrees/rf-U8 |
| Files | .sdlc/checks/baseline-agrees-check.sh (line 32 only), .sdlc/handoffs/records-followup-U3.md, this handoff |
| Ran | the three control legs of the brief, U3-1's full command, P7, P4, P6, `npm test` |
| Left out | note 2 of the U3 verdict, the 233-character header line 4, on the brief's instruction (see Left out below) |

## What changed

### Note 1, the must-fix

`.sdlc/checks/baseline-agrees-check.sh:32` built one sentence and switched only the prefix in front of it, so the `note` branch asserted the same tree in the case where the tree is not the same. Line 32 now picks the whole sentence per branch:

```
console.log(same ? `ok    head: baseline ref ${ref || "none"} has the same tree as HEAD outside .sdlc/ and .gitignore` : `note  head: baseline ref ${ref || "none"}, the tree moved outside .sdlc/ and .gitignore since the baseline ran, so the numbers are unproven at this head`);
```

The `ok    head:` and `note  head:` prefixes are byte for byte what they were, which is what U3-1 and P7 match on. The `ok` branch keeps its sentence unchanged. The `note` branch now says what the prefix means, in the words the script's own header line 5 already used: the numbers are unproven at that head, not wrong.

The hard constraint held: the change is line 32 and nothing else, the file is still 36 lines, and `git diff --numstat acfd7298 -- .sdlc/checks/baseline-agrees-check.sh` still prints `3	3`.

### Notes 3 and 4, the U3 handoff

`.sdlc/handoffs/records-followup-U3.md` frontmatter `pass: 2` became `pass: 3`, which is what the body's own Pass row says. The Criteria paragraph's `which is also UB` became the true reading: `UB` at the graded head `ceb471b0` is `31b53ea9`, the plan tip merged in at a129843c during the unit, as `.sdlc/verdicts/records-followup-U3.md:3` records. A dated Correction line is appended to that file in the shape the other corrected records on this plan use (`.sdlc/handoffs/records-followup-U4.md:53`, `.sdlc/handoffs/records-refresh-U1.md:87`).

## Left out

Note 2 of the U3 verdict, the 233-character header on line 4. Rewrapping it adds a line to the script and moves the `3	3` numstat U3-1 and the plan's revision 6 both name, so the brief rules it out of this unit and routes it separately. Line 4 is unchanged here.

## Criteria

Measured against the committed tree, every command run from a script file under this seat's scratchpad. The three control legs ran in throwaway `git clone -q --shared` copies; the gates ran in the worktree.

| # | Expected | Evidence measured | State | Negative control |
|---|---|---|---|---|
| U8-1 | moved tree: `note  head:` with the moved-tree wording, `stale total: 0`, exit 0 | _pending_ | ⚪ | _pending_ |
| U8-2 | unmoved tree: `ok    head:` with the same-tree wording | _pending_ | ⚪ | _pending_ |
| U8-3 | `ref:` off `origin/main`: `STALE head`, `stale total: 1`, exit 1 | _pending_ | ⚪ | _pending_ |
| U8-4 | U3-1 full command: eight `ok`, one `note head:`, `stale total: 0`, `exit 0`, `3	3` | _pending_ | ⚪ | _pending_ |
| U8-5 | P7, P4, P6, `npm test` | _pending_ | ⚪ | _pending_ |
