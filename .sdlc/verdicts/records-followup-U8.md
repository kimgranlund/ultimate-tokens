---
kind: verdict
plan: records-followup
unit: U8
branch: unit/rf-U8 @ 0c690c73
base: 8cf8eb57
seat: independent verifier
written: 2026-09-20
verdict: green-with-one-note
---

# Verdict U8 records-followup, the `note head:` line that said the tree had not moved

Read-only against the repo. Every run happened in my own throwaway clones under `/tmp/rf-u8-verify`
(`head` at `0c690c73`, `pre` at `8cf8eb57`, `unmoved`, `notmain`, `neg`), never in `.worktrees/rf-U8`.
All five were removed by exact name after the runs. `BASE` is the plan's own definition,
`$(git merge-base origin/main HEAD)`, which resolves to `d34b4fb1` on this branch.

| # | Criterion | State | Evidence | Negative control |
|---|---|---|---|---|
| 1 | moved tree: exactly one `note  head:` line whose text says the tree moved, `stale total: 0`, exit 0 | 🟢 | clone at `0c690c73`, `ref: origin/main @ 20298cc`, and `git diff --name-only 20298cc HEAD -- . ':(exclude).sdlc' ':(exclude).gitignore'` names `.claude/CLAUDE.md`, so the tree really has moved. `sh .sdlc/checks/baseline-agrees-check.sh` prints `note  head: baseline ref 20298cc, the tree moved outside .sdlc/ and .gitignore since the baseline ran, so the numbers are unproven at this head`, `stale total: 0`, `exit 0`. Counts: `grep -c '^note  head:'` is `1`, `grep -c '^ok    '` is `8`, `grep -c '^note  head:.*has the same tree'` is `0` | the pre-fix script at `8cf8eb57`, run in its own clone on the same moved tree, prints `note  head: baseline ref 20298cc has the same tree as HEAD outside .sdlc/ and .gitignore`; there `grep -c '^note  head:.*has the same tree'` is `1`. The untrue sentence is present before the fix and absent after, on identical input |
| 2 | unmoved tree: the head line prints `ok` | 🟢 | clone `unmoved`, branch cut at `0c690c73` with `git checkout 20298cc -- .claude/` committed, after which nothing outside `.sdlc/` and `.gitignore` differs from the baseline ref. The run prints `ok    head: baseline ref 20298cc has the same tree as HEAD outside .sdlc/ and .gitignore`, and the whole script exits `0` | the criterion 1 clone is the control: the only difference between the two trees is the one `.claude/CLAUDE.md` line, and the head row flips from `ok` to `note` with it, so the row is reading the tree and not a constant |
| 3 | a baseline ref outside `origin/main`'s history still prints `STALE` and exits 1 | 🟢 | clone `notmain`, `ref:` line rewritten to `ref: origin/main @ 0c690c73` (a unit-branch commit). The run prints `STALE head: baseline ref 0c690c73 is in origin/main's history`, `stale total: 1`, `exit 1`. The same-tree row above it reads `ok`, as it must when the ref is HEAD | criteria 1 and 2 are the control: with the real ref `20298cc` the same row prints `ok    head: baseline ref 20298cc is in origin/main's history`, `stale total: 0`, `exit 0`. The ancestry row is what reds, and the U8 edit left it counting toward the exit code |
| 4a | `git diff --numstat $BASE -- .sdlc/checks/baseline-agrees-check.sh` still reads `3 3` | 🟢 | with `BASE=$(git merge-base origin/main HEAD)` resolving to `d34b4fb1beefff11c9be53ec039d4265c925da4a`, the command prints `3	3	.sdlc/checks/baseline-agrees-check.sh`. Noted for the record: `git diff --numstat 5b6d3e82 -- ...` prints the same `3	3`, so that sha would not have discriminated either way; the figure above is the plan's `BASE` | clone `neg` at `0c690c73` with one extra line of the script rewritten and committed: the same command prints `4	4	.sdlc/checks/baseline-agrees-check.sh`. A second changed line is visible to this row |
| 4b | `git diff --stat 8cf8eb57 0c690c73` touches only line 32 of the script plus the unit's own handoff | 🟡 | the script leg holds exactly: the only hunk header is `@@ -32 +32 @@`, `2 +-` in the stat, and the `ok    ` / `note  ` prefixes are byte for byte unchanged. The stat lists three paths, not two: the script, `.sdlc/handoffs/records-followup-U8.md` (new, 52 lines), and `.sdlc/handoffs/records-followup-U3.md` (`6 ++--`). The third file is authorized, not drift: the board row for this unit reads `carries U3 verdict notes 3 and 4`, and the diff there is exactly those two, `pass: 2` to `pass: 3` plus the `which is also UB` sentence, with a dated Correction line appended. The dispatch brief I was given named only two paths, which is why this row is 🟡 rather than 🟢 | `git diff -U0 8cf8eb57 0c690c73 -- .sdlc/checks/baseline-agrees-check.sh \| grep '^@@'` returns the single line `@@ -32 +32 @@`; a second hunk anywhere in the script would show here, and the planted mutation of row 4a proves the grep is live |
| 5 | no em dash added in prose | 🟢 | with `EM=$'\xe2\x80\x94'`, the plan's P6 pipeline `git diff -U0 d34b4fb1 -- .sdlc \| grep '^+' \| perl -pe 's/\x60[^\x60]*\x60//g' \| LC_ALL=C grep -o "$EM" \| wc -l` prints `0`, and the same pipeline restricted to this unit alone (`8cf8eb57 0c690c73`) also prints `0`. No `grep -P` used | clone `neg` with a planted line carrying one prose dash and one inside a backtick span, committed: the same pipeline prints `1`, so the prose dash is counted and the backtick span is stripped. A bare fixture file with one dash counts `1` under `LC_ALL=C grep -o` |
| 6 | the branding gate passes at the head and does scan `.sdlc/` | 🟢 | `node test/repo/branding.mjs` in the head clone prints `branding: clean (481 files scanned)`, exit `0`. `test/repo/branding.mjs:41` skips only `.git`, `node_modules`, `dist`, `other` and the worktree directories, so `.sdlc/` is in scope | clone `neg` with the retired maker name appended to `.sdlc/handoffs/records-followup-U8.md`: the gate prints `✗ .sdlc/handoffs/records-followup-U8.md: contains "` (altered: retired name removed; the gate printed the planted token here) and `FAIL: 1 branding violation(s) across 481 files`. The gate reads this unit's own new file |

## Verdict

🟢 on the fix itself. The old line built one sentence and switched only the prefix, so the `note`
branch asserted the same tree in exactly the case where the tree had moved; line 32 now selects the
whole sentence per branch, and I reproduced the untrue output on the pre-fix commit and its absence
on the head, on identical trees. The three behavioural criteria hold with live negative controls, the
numstat constraint holds against the plan's own `BASE`, prose is em-dash clean, and the branding gate
is green and demonstrably scanning `.sdlc/`.

🟡 one note, no rework asked for: the change set is three files, not the two the dispatch brief named.
The third, `.sdlc/handoffs/records-followup-U3.md`, is the U3 verdict's notes 3 and 4, which the board
row assigns to this unit. Whoever lands this should confirm the brief and the board agree before the
PR, since a verifier reading only the brief would call it scope drift.

🔴 none.

Correction, 2026-09-20 (conductor): row 27's control cell wrote the retired maker name literally, which reds `test/repo/branding.mjs` on this branch. The name is removed and the quote is marked altered, per the verbatim-quote rule in `.sdlc/adapter.md` §3. The plant and its result are unchanged.
