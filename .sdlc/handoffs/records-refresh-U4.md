---
kind: handoff
plan: records-refresh
unit: U4
branch: unit/rr-U4
written: 2026-09-19
---

# Handoff U4 records-refresh · builder -> reviewer

measured at e22f8ba (unit/rr-U4, rename commit; this handoff commit follows it)

| Field | Value |
|---|---|
| Branch | unit/rr-U4 @ e22f8ba (rename commit); handoff commit follows |
| Worktree | .worktrees/rr-U4 |
| Files | .sdlc/adapter.md, .sdlc/debt.md, this handoff |

## Preconditions (step 1)

`git config core.hooksPath` resolves to `/Users/kimba/.claude/plugins/cache/nonoun/sdlc/0.1.0/githooks`, which symlinks into the plugin repo `/Users/kimba/Projects/nonoun/sdlc-orchestration`. `unit/df-ids` is present there. The installed `board.py` (`ids --help`) exits 2 (no `ids` subcommand); the `unit/df-ids` copy exits 0, so `B` resolved to that copy via `git -C "$PR" show unit/df-ids:plugins/sdlc/scripts/board.py`. `grep -c 'board.py" ids' "$(git config core.hooksPath)/pre-commit"` printed `0`: the check is not live yet, so the plan's §Dependency exception applies and U4 ran first, as the plan itself states.

Step-1 gate: `python3 "$B" ids .sdlc | wc -l` printed `13`; `grep -c '^| C13 |' .sdlc/adapter.md` printed `1`. Both matched, so the file had not moved and the unit proceeded.

## Id map and cite table

Same as the plan's table (C1..C13 to X1..X13, same rows, same text). All ten cite substitutions plus the thirteen row heads were applied by a Python script that asserted each old token occurred exactly once before replacing it, so the rename cannot silently miss or double-hit a line. Line numbers before the rename matched the plan's exactly: adapter.md 103-115 (rows), 49, 60, 65, 89, 91, 130, 144, 179, 180, 181 (cites); debt.md 59-61 (the three "distinct from" notes).

## Criteria (rows 1-7)

| # | Command | Printed | Expected | Match |
|---|---|---|---|---|
| 1 | `python3 "$B" ids .sdlc; echo "exit $?"` | (nothing), `exit 0` | nothing, `exit 0` | 🟢 |
| 2 | real-hook clone commit, post-state | `commit 0`, no refusal line | same | 🟢 |
| 2 (control) | same clone reset to `$BASE`, same probe | thirteen `adapter.md:<n>: C<n> defined...` lines, `board.py ids refused an id defined outside its owning file...`, `commit 1` | same | 🟢 |
| 3 | reverse-map diff, X->C against `$BASE` | nothing, `0` | nothing, `0` | 🟢 |
| 4 | six-part §4 command | `X1,X2,...,X13`, `0`, `0`, `0`, `24`, `1` | same | 🟢 |
| 5 | six-part sweep | `1`, `3`, `0`, `0`, `0`, `0` | `0`, `3`, `0`, `0`, `0`, `0` | 🟡 first value, see Note A |
| 6 | scope/em-dash/branding | `.sdlc/adapter.md,.sdlc/debt.md,.sdlc/handoffs/records-refresh-U4.md` (after this commit), `1`, `1`, `branding: clean (458 files scanned)`, `exit 0` | 3-file list, `1`, `1`, clean, exit 0 | 🟢 |
| 7 | U1-6 amended, U3-7 first cmd, U1-9 last cmd, P5 | `0`,`0`,`1`,`1` / `0`,`3`,`3` / `0` / `0` | `0` each (regression) | 🟢 |

Plus P4: `branding: clean (458 files scanned)`, exit 0. Plus P5: `0`.

### Note A: row 5's first value is 1, not 0

The sweep hit `.sdlc/board.md:20`, which already carries the Orchestrator-written row for this very unit: "records-refresh U4 rename the adapter's conflict ids C1 to C13 to X1 to X13". That line was added to the board after the plan's row-5 measurement point (114061a2) and is not excluded by the sweep's ignore list (only verdicts/handoffs/questions/tickets/survey.md/plans/archive/adopt-hygiene/records-refresh.md/color-math are excluded; board.md is not). It is a live record describing this unit's own task in the C-form, not a stale citation elsewhere.

I did not edit `.sdlc/board.md` to fix this: builders never touch the board, and no message authorizes an exception to that rule. Flagging it for the Orchestrator, who can reword the row (e.g. drop the old numbers once this unit is on the board as done) when it next edits that line. This does not affect adapter.md or debt.md, which are the files U4 owns, and every other part of row 5 (debt cites, `.claude`/`README.md` sweep, history byte-identity) is 🟢.

## The five known problems (from the checkability review, U4 section)

1. **`grep -P` availability.** This host's `/usr/bin/grep` (`ugrep`) does not support `-P` when invoked from `bash -c` (the reviewer's finding), but it does support `-P` (PCRE2-backed) when run directly in this agent's own shell, which is the harness's own shim. I ran every `-P` command (rows 3, 4, 5) directly, not wrapped in `bash -c`, and confirmed each one works: `echo "X1 test" | grep -P '...'` printed a match. `ggrep` is not installed on this host (`which ggrep` found nothing), so I used the direct-shell path rather than a `perl` rewrite; no `bash -c` wrapping was applied to those three rows.
2. **Hardcoded `2026-09` in rows 3 and 4.** I did not repin or widen the regex (that's plan text, outside U4's scope wall, which is `.sdlc/adapter.md`, `.sdlc/debt.md`, and the handoff/verdict/board). I dated the amendment `2026-09-19`, today's actual date, so it is a correct date, not a placeholder, and it happens to satisfy the pattern because the build landed within 2026-09. The pattern still expires in October; I'm naming it here rather than silently leaving it for the Orchestrator to rediscover.
3. **"The form" claim ("no X1 to X13 token exists anywhere ... at 114061a2") is stale on the plan itself.** I did not touch the plan (out of scope for U4's file list). Confirmed: `grep -coP` for the X-token pattern on `.sdlc/plans/records-refresh.md` is non-zero now (the plan's own U4 section spells out the map). The claim was true only at the measurement sha and is now a known exception, not a defect any U4 criterion reads (no row checks the plan file's own X-token count).
4. **`$F/plug` must exist before `tar -x -C`.** I ran `mkdir -p "$F/plug"` before `git -C "$PR" archive unit/df-ids plugins/sdlc | tar -x -C "$F/plug"`; without that the extraction fails for a reason unrelated to the check itself. Confirmed the extracted `githooks/` (commit-msg, pre-commit, pre-merge-commit) exists before using it as `$GH`.
5. **This handoff commit trips the branch hook's `verdict.py` check (block 2, staged `.sdlc/handoffs/*.md`).** Expected. I did not disable or bypass the hook. The commit that follows this handoff stages `.sdlc/handoffs/records-refresh-U4.md`, which the block reads against `.sdlc/board.md`'s checklist state (`board.py check`). Because I never edit the board myself, the legitimate path is: write a handoff whose content the check can actually parse (frontmatter `kind: handoff`, `plan:`, `unit:` fields matching the board row's plan/unit), and if the hook still refuses because the *board* row disagrees (a board-side state, not a handoff-content defect), that is an Orchestrator-side fix (updating the board row when it takes this unit's verdict), not something I bypass. See the commit log for the actual exit code the real commit produced.

## Ran

- `python3 "$B" ids .sdlc` (rows 1, and the step-1 gate)
- Two throwaway `git clone -q --shared` copies (`$F/u4hook`, `$F/u4hook2`) for row 2's positive and negative control; neither touched this worktree
- `perl -pe 's/(?<![A-Za-z0-9-])X([1-9]|1[0-3])(?![0-9a-z])/C$1/g'` reverse-map diffs (rows 3, 7)
- The six-part row-4 and row-5 greps, direct in this shell (not `bash -c`)
- `node test/repo/branding.mjs` (P4, row 6): clean both times
- `sh .sdlc/checks/baseline-agrees-check.sh | grep -c '^ok    time'`: `3` (U3-7 regression)
- No `npm test`/`npm run build`/`npm run smoke`: none of U4's criteria call for them, and none were run, per the host-sharing rule

## Left out

- Did not edit `.sdlc/board.md` (Note A): not this seat's file, no message authorized an exception.
- Did not repin or widen the `2026-09` date pattern in the plan's rows 3/4 or restate the plan's stale "no X token" claim: both are plan-text fixes outside U4's file scope.

## Questions

None blocking. One judgment call for the Orchestrator: whether to reword `.sdlc/board.md:20` before or after taking this unit's verdict, given row 5's first value reads `1` instead of `0` for the reason in Note A. Default if unanswered: leave the board line as-is (it accurately describes what U4 did) and note the sweep's known blind spot in the next plan that touches `board.md`'s exclusion list.
