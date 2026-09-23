---
kind: verdict
plan: k17-rerun
sha: 092d2941
base: d34b4fb1
pass: 1
reviewed: 2026-09-19
seat: prepr-reviewer
verdict: 🟢
---

# Verdict k17-rerun pre-land review · 🟢 land, 0 🔴, 3 🟡

Reviewed in fresh context against `plan/k17-rerun` @ 092d2941 (worktree `.worktrees/plan-k17-rerun`, read only, left as found), full diff `main...plan/k17-rerun` (7 paths, all under `.sdlc/`), draft PR #711, ticket #710. Every number below is this seat's own run; the unit verdict and the handoff were read as claims.

Verdict: I would let this land. Nothing blocks. Three concerns for the pre-land verifier and the Conductor, none of which changes a graded result.

## Own runs at 092d2941

Control read-only in the worktree; plant in a throwaway shared clone under `$CLAUDE_JOB_DIR/tmp`, deleted after.

| What | Result |
|---|---|
| K17 framework half | 0 hits |
| K17 registration half, before the map's filter | 7: `gate-report.mjs`, `repo/fixtures/gate-report-clean.mjs`, `repo/fixtures/gate-report-mismatch.mjs`, `repo/fixtures/gate-report-singlequote.mjs`, `run.mjs`, `smoke/smoke.mjs`, `ui/counts.mjs` |
| after the filter, lifted from `.sdlc/architecture.md:115` by the plan's `CF=` line, not retyped | 0 |
| plant as the map's bite cell writes it | 2 hits, 1 per half: `test/engine/hct.mjs:173` (pass 6 says `:172`; my `printf` added a leading newline) and `engine/zzz.mjs`. Clone clean before: 0 and 0. Reset after: `git status --short` 0 lines |
| U1-1 | `1`, nothing, `1`, `1`, `0` |
| U1-2 | `1` (the pass 6 row carries the cell's filter byte for byte, `\|` escapes included) |
| U1-3 | `3600ad6e`, `0`, `1`, `1` |
| U1-4 | `1`, `6 18` |
| U1-5 | `18`, `18`, `19`, `31`, `1`, `7`, `19 19` |
| U1-6 | `1`, `0` |
| U1-7 | `0`, `1`, `1`, `1` |
| P4 | `branding: clean (467 files scanned)`, `exit 0` |
| P5 | `0` |

All equal the plan's expected column. P1 (`npm test`) was not rerun by this seat; the unit verifier ran it at 3600ad6e and no file outside `.sdlc/` moved since (P5).

## Findings

| # | State | Finding | Evidence |
|---|---|---|---|
| 1 | 🟡 | U1-4 has no independent grader anywhere in the plan's grading map. The pre-land pair row and the Landing section list U1-1, U1-2, U1-3, U1-5, P1, P4, P5; U1-4 is absent. The unit verifier graded it 🟡 because pass 6 did not exist at 3600ad6e, so the only 🟢 on record is the Orchestrator's own rerun. U1-4 is the criterion for the defect this plan exists to fix. The fact holds (my run above); the gap is that `.sdlc/verdicts/k17-rerun-prepr.md`, as the plan specifies it, will not record it | `.sdlc/plans/k17-rerun.md:114`, `:247`, `:255`; `.sdlc/verdicts/k17-rerun-U1.md:17`; board row |
| 2 | 🟡 | `.sdlc/architecture.md:18` (the rerun note) is now untrue for K17 and this change did not repair it: "Where a pass 5 result differs from a §6 cell, pass 5 is the current reading" and "the U3 verdict grades it". Pass 6 is K17's current reading. The plan knows (Risks, Q-A with default "no") and the owner's Q1 wall excludes the map, but Q-A has no recorded answer in the approval doc (only Q1, Q2), and `.sdlc/debt.md` carries no row for the map pointer or the `a2-verdict-agrees` check script the plan says the Conductor files after landing. Stale by ruling, with the follow-up on no durable record yet | `.sdlc/architecture.md:18`; `.sdlc/plans/k17-rerun.md:36`, `:228`, `:243`; `.sdlc/questions/k17-rerun-approval.md` |
| 3 | 🟡 | PR #711 body is empty. The adapter requires the plan summary plus the pre-land verdict table ending in the generated-with line. Expected while draft; must be filled before ready. The title equals the plan's Landing title with `#710` | `gh pr view 711 --json body`; `.sdlc/adapter.md:48`; `.sdlc/plans/k17-rerun.md:247` |
| 4 | 🟢 | Integration: plan, approval Q1/Q2, checkability (10 of 10 at bbeba21e), handoff (`measured at c2c7a1fe`, `test/` and map equal HEAD), U1 verdict, board row (unit merged at a07539c1, worktree absent from `git worktree list`) and the two A2 edits agree with each other and with the map's K17 cell (HEAD `0 (7 unlisted ...)`, bite `2`). The board header also repairs the stale "records-refresh in flight" sentence | diff of `.sdlc/board.md`; `.sdlc/architecture.md:115` |
| 5 | 🟢 | Revision 2 folded all three U1 findings: F1 two-paragraph intro, U1-3 reads one sha; F2 `no sha` guard in block U1-7; F3 P1's negative control reads "measured 1, non-zero" | `.sdlc/plans/k17-rerun.md:80`, `:145-149`, `:213-214`; `.sdlc/verdicts/architecture.md:70-72` |
| 6 | 🟢 | Pass 6 content: filter identical to the cell, counts and the seven names and the plant match mine, the word the plugin counts is never used in pass 6 (whole-file count stays 7), the Result line's 18 equals U1-4's computed count, the title's parenthetical agrees with pass 5's Result line | `.sdlc/verdicts/architecture.md:1`, `:65`, `:74-76` |
| 7 | 🟢 | Commit hygiene: 10 commits, every one carries `Co-Authored-By`; the two that stage `.sdlc/board.md` (c2c7a1fe, 092d2941) and the merge a07539c1 carry `Seat: orchestrator`; the verdict commits carry `Seat: verifier` | `git log main..HEAD --format='%H%n%s%n%b%n---'` |
| 8 | 🟢 | Scope: 7 paths, all under `.sdlc/`. No `src/`, `test/`, build, `package*.json` or CI file. No secrets, config, or dependency changes | `git diff --name-only main...HEAD` |
| 9 | 🟢 | Added lines: em dashes 0; retired brand and pre-rename identifier 0; branding gate clean | added lines of `git diff main...HEAD` grepped for the em dash character and for the two brand tokens: 0 and 0 |

## Notes, not findings

- Pass 6 and the plan's revision rows are dated 2026-09-20; the commits and the handoff say 2026-09-19 (19:xx -0700, UTC had rolled over). One convention would be better.
- The "Revision 2:" sentence sits inside the §Texts fenced template (`.sdlc/plans/k17-rerun.md:149`), so a copier of the template copies it.
- The committed Result line adds a comma the template lacks; no criterion greps it.
- Pre-existing, not this plan's: `.sdlc/debt.md:92` still says the K17 control "filters 3 files by name" (stale since 28c2e8cc widened it to 7), and `.sdlc/verdicts/architecture.md:3` still describes pass 1 directly under a title that now names pass 6.
