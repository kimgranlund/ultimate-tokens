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
| U8-1 | moved tree (this branch as it stands, because of the `.claude/CLAUDE.md` line): the `note  head:` line with the moved-tree wording, `stale total: 0`, exit 0 | clone at `be56f403`, `ref: origin/main @ 20298cc`: `note  head: baseline ref 20298cc, the tree moved outside .sdlc/ and .gitignore since the baseline ran, so the numbers are unproven at this head`, `stale total: 0`, `exit 0` | 🟢 | the pre-fix script at `8cf8eb57`, run on this same moved tree, prints `note  head: baseline ref 20298cc has the same tree as HEAD outside .sdlc/ and .gitignore`. `grep -c '^note  head:.*has the same tree'` prints `1` pre-fix and `0` post-fix, so the fix is what removed the untrue sentence |
| U8-2 | unmoved tree: `ok    head:` with the same-tree wording | clone with `.claude/CLAUDE.md` restored to the `20298cc` text and committed, after which `git diff --name-only 20298cc HEAD -- . ':(exclude).sdlc' ':(exclude).gitignore'` names `0` paths: `ok    head: baseline ref 20298cc has the same tree as HEAD outside .sdlc/ and .gitignore`, nine `ok` lines, `stale total: 0`, `exit 0` | 🟢 | leg 1 above is this leg's own control: the only difference between the two clones is the one `CLAUDE.md` line, and the head row flips with it |
| U8-3 | `ref:` at a sha not on `origin/main`: `STALE head`, `stale total: 1`, exit 1 | clone with `ref:` rewritten to `be56f403`, confirmed by `git merge-base --is-ancestor` not to be in `origin/main`'s history: `STALE head: baseline ref be56f403 is in origin/main's history`, `stale total: 1`, `exit 1`. The same-tree row above it reads `ok`, as it must when the ref is HEAD | 🟢 | legs 1 and 2 both print `ok    head: baseline ref 20298cc is in origin/main's history`, `stale total: 0`, `exit 0`, so the ancestry row is what reds here and the fix left it counting |
| U8-4 | U3-1's full command: eight `ok` lines, one `note head:`, `stale total: 0`, `exit 0`, then `3	3	.sdlc/checks/baseline-agrees-check.sh` | `grep -c '^ok    '` prints `8` and `grep -c '^note  head:'` prints `1`, among them `ok    time corpus-contrast: baseline 20 to 23 s, adapter 20 to 23 s` and `ok    time fonts: baseline 1 to 1 s, adapter 1 to 1 s`; `stale total: 0`; `exit 0`; `git diff --numstat acfd7298 -- .sdlc/checks/baseline-agrees-check.sh` prints `3	3	.sdlc/checks/baseline-agrees-check.sh` | 🟢 | the file is still 36 lines, and the only diff hunk against `8cf8eb57` is line 32. A second changed line would print `4	4` on the numstat leg, which is the constraint's own falsifier |
| U8-5 | P7, P4, P6 and `npm test` | P7: `stale total: 0`, `exit 0`, first line `ok    tests: baseline 48, test/run.mjs TESTS 48`. P4: `branding: clean (481 files scanned)`, `exit 0`. P6: `0` against `acfd7298` and `0` against `8cf8eb57`. `npm test`: `✓ all 48 test files passed`, `exit 0`, no `node_modules` in the worktree, `git status --short` empty after. Scope against `8cf8eb57`: `.sdlc/checks/baseline-agrees-check.sh,.sdlc/handoffs/records-followup-U3.md,.sdlc/handoffs/records-followup-U8.md` | 🟢 | P7's falsifier is leg 3, a `ref` off `origin/main`, which prints `stale total: 1` and `exit 1`. P4's is the U3 verdict's measured leg, a copy of `decision-records.md` into `.sdlc/verdicts/`, which fails the gate. The scanned count is 480 at the unit base `8cf8eb57`, measured in the clone, and 481 here, which is the one file this unit adds |
