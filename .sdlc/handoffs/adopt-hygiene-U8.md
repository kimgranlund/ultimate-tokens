---
kind: handoff
unit: U8
plan: adopt-hygiene
sha: 7ca8ef8321a11aa2e00e9f0499cd88d6feb59ade
built: 2026-09-17
---

# U8 handoff: staleness and wording sweep

Branch `unit/hygiene-U8` from `sdlc/adopt` @ 0aec4a8. One commit, `7ca8ef8`.

## What changed

Every edit in `.sdlc/plans/adopt-hygiene-prepr3.md` §1 to §3 applied verbatim in the files the U8 preamble lists:

- `.sdlc/records/index.md`: ADR-004 row names ADR-023, the reactivity review row added, the ops row marked untracked, the PRD gap closed.
- `.sdlc/adapter.md`: three appended amendments (§2 Merge, §3 second ignore-rule note, end of §8), nothing deleted.
- `.sdlc/records/decisions.md`: ADR-013/ADR-016/ADR-020/SITE-runbook/PLAN-overhaul rows updated, gaps G1 to G6 closed or annotated.
- Cards: `ADR-004.md`, `PLAN-adia-exports.md`, `PLAN-export-schema.md`, `PLAN-overhaul.md`, `PRD-0001.md` (the last for the comma-not-dash fix).
- `.sdlc/debt.md`: 17 rows get a "Closed by U*" note, three partials (C4, P1, R3) get their own note, R12 gets its trigger text. Append-only: every existing cell text stays, only trailing text was added.
- `.sdlc/architecture.md`: K18 row reworded to the §6.1 snapshot-case script.
- `.claude/skills/shipping-changes/SKILL.md` lines 18 to 19 (the two named em dashes), `references/foundations.md` §4, `references/rubric.md` H4.
- `.claude/skills/project-docs/SKILL.md`: SPEC row names the two files.
- Nine plan-authored em-dash and one comma fix: `README.md:56`, `docs/lld/lld-muted-base-key-spikes.md:221`, `docs/plan/archive/overhaul-plan-2026-08-14.md:75`, `docs/prd/prd-0001-app-shell.md:8`, `docs/reference/references/decision-records.md:397`, `docs/site/go-live-runbook.md:34`, `.sdlc/records/cards/PRD-0001.md:7`.

Not touched, as instructed: `.sdlc/board.md`, `.sdlc/plans/adopt-hygiene.md`, `.sdlc/survey.md`, `.sdlc/baseline.md`, `.claude/CLAUDE.md`, `scripts/`, `test/`, `src/`, `mcp/`.

## Checks run

`u8check.sh` and `wording-check.sh` copied to `$CLAUDE_JOB_DIR/tmp` and run from the worktree root.

- Rows 1 to 9 (`u8check.sh`): all nine lines printed exactly the Expected column.
- Row 10 (`wording-check.sh origin/main HEAD`, run after the commit so the diff sees it): `plan-authored em dashes: 0, bold labels: 0`, exit 0.
- Negative control at 61a3f90: a detached scratch worktree (`git worktree add --detach ... 61a3f90`) reproduced every Negative control cell in the plan table exactly, including `wording-check.sh` printing the same nine dash lines and three bold-label lines, `9, 3`, exit 1. Worktree removed after.
- One-dash-restored control: a second detached scratch worktree off `unit/hygiene-U8` with the README.md:56 dash put back and committed printed that one line and `1, 0`, exit 1, matching the plan. Worktree removed after.
- Row 11 carried criteria (U1-7, U1-8, U1-11, U1-12, U2-4, U6-1, U6-4, U7-2, plus U7-2's clash-and-wording block from `adopt-hygiene-U7-p2.md`, read-only): all as written.
- Row 12: `npm test` → all 44 test files passed; `git status --porcelain | wc -l` → 0; branding → clean (426 files scanned).
- Row 13 (already applied by the Orchestrator, rerun): `follow-up` count 0, `U8` count 1.

## Deviations from the re-diagnosis

None. Every replacement text in §1 to §3 matched the true state of the tree (ADR-023/ADR-024 already present from U1, the two `docs/spec/` files present, K18's `schema-rename v4` snapshot case present at `test/ui/persist.mjs:183`), so no Expected value needed correcting.
