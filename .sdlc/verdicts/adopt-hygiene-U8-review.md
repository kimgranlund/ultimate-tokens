---
kind: verdict
unit: U8
plan: adopt-hygiene
sha: d7cf7f4
base: 0aec4a8
reviewed: 2026-09-17
---

# U8 staleness and wording sweep — review verdict

Verdict: 🟢 all criteria met, 0 blocking.

## What was checked

- Ran `u8check.sh` (all 9 lines) and `wording-check.sh` from `.sdlc/plans/adopt-hygiene-prepr3.md` §Checks against the worktree head (d7cf7f4): every line printed exactly the plan's Expected column.
- Ran both scripts again against a detached scratch worktree of 61a3f90 (removed after): every line printed exactly the plan's Negative control column, including the wording script's 9 dash lines / 3 bold-label lines, `9, 3`, exit 1.
- Read the full diff `0aec4a8..d7cf7f4` (21 files) line by line against the prepr3 §1 fact table, §2 kept-list, and §3/§5 replacement texts: every changed statement matches verbatim what was specified, nothing extra, nothing missing.
- Spot-checked facts beyond what the grep scripts see, against live state, not just presence:
  - `git ls-files .claude/ops/` → empty; directory absent on disk under the worktree — matches "untracked... on disk, ignored" (ops dir doesn't exist in this worktree checkout, consistent with untracked+ignored).
  - `docs/reference/reviews/2026-08-20-reactivity/` — 6 files tracked, matches the index row.
  - `docs/spec/*.md` — exactly 2 files (`spec-muted-base-key-spikes.md`, `spec-panda-park-ui-exports.md`), matches the project-docs SKILL.md row.
  - `decision-records.md` — ADR-023 and ADR-024 both present with headings, matches every card/index/decisions reference to them.
  - `docs/plan/archive/overhaul-plan-2026-08-14.md` — present, matches the PLAN-overhaul card/decisions closure.
  - `gh api repos/kimgranlund/ultimate-tokens`: `allow_squash_merge: true`, `allow_merge_commit: false`, `allow_rebase_merge: false`, `delete_branch_on_merge: false` — matches the adapter §2 amendment ("squash-merge only... `main` still has no branch protection") and debt P1/C4 partial-closure notes exactly.
  - `.gitignore` lines 14-18 carry `.claude/ops/`, `.sdlc/runtime/`, `.sdlc/.fake-tickets/`, `.sdlc/.fake-releases/`, `.worktrees/` — matches the adapter §3 second amendment.
  - K18's §6.1 script body reads the current `CURRENT_SCHEMA_VERSION` and greps for a `schema-rename vN` case in `test/ui/persist.mjs`, matching the reworded architecture.md row exactly (not the old `vN`-comment wording); the script itself printed no output (pass).
- Confirmed the plan-file wording fixes (three-units, bold lead-ins, U8 listed, Landing paragraph, revision-log row) are present at HEAD — they landed in 0aec4a8 (pre-dispatch, per the U8 section's own note "applied by the Orchestrator before dispatch"), not in the builder's commit, and nothing in the builder's diff touches that file, so no drift.
- Confirmed `.sdlc/adapter.md` and `.sdlc/debt.md` stayed append-only: `git diff 80ae4d8 -- .sdlc/adapter.md` shows 0 deleted (non-`---`) lines; every `.sdlc/debt.md` row changed only appends trailing text to the same row, no row deleted or renumbered, `7/7` and `45/45` counts unchanged.
- Confirmed no em dash or bold inline label was added anywhere in the diff outside the plan's own enumerated kept-list (wording-check.sh: 0/0 at HEAD, 9/3 at the pre-fix control).
- Confirmed no retired-brand string was introduced: `node test/repo/branding.mjs` → `clean (427 files scanned)`.
- Confirmed scope: `git diff --stat 0aec4a8..d7cf7f4` touches only the 21 files the U8 section's file list (plus its own handoff) names — nothing under `.sdlc/board.md`, `.sdlc/plans/adopt-hygiene.md`'s own U8 subsection edits beyond what was pre-applied, `src/`, `scripts/`, `test/`, or `mcp/`.
- Gates: `npm test` → all 44 test files passed; `git status --porcelain` → 0 files; branding → clean.
- Board: `follow-up` count 0, `U8` count 1 (row 13 of the plan's own criteria, already applied by the Orchestrator and reconfirmed here).
- Searched beyond the P3 wall and the script's own grep targets for any other live record still made false by U1-U7 that the sweep might have missed (the review brief's specific worry, this being the fourth pre-land round): read every hunk of the 21-file diff by hand against the fact table rather than trusting only script output, and found no additional stale statement — everything the fact table (§1, F1-F21) claimed is now true, and the diff introduces nothing not listed there.

## Result

No blocking findings. U8 closes the staleness loop it was written to close: every live record's statement now agrees with the head, the debt/decisions/index/cards ledgers name which unit closed what, the two check scripts bite exactly as specified on both the fix and the negative control, and the unit stayed inside its own scope wall with append-only edits to `adapter.md`/`debt.md` and no new em dash or bold label.
