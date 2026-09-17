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

## Pass 2 (2026-09-17), after verdict 🔴

`.sdlc/verdicts/adopt-hygiene-U8.md` graded the unit 🔴 on two debt rows (I1 G2, I2 D2) that pass 1 marked closed while a half of each was still open, and 🟡 on criterion 3's check (it read the note string, so it could not see a false closure), on `.sdlc/records/index.md:52`, and on U7-2's `/Users/` loop. The re-diagnosis `.sdlc/plans/adopt-hygiene-U8-p2.md` audited all 21 rows that prepr3 §3 closed against each row's own evidence and found four false closures, not two: R6 and R8 as well as G2 and D2. Every other closure and partial holds.

### What pass 2 changed

1. `.sdlc/debt.md`, four rows. The trailing note on R6, R8, G2 and D2 was replaced, not appended to. This is the one exception to the unit's append-only rule, and the verdict requires it: pass 1 wrote `Closed by U1` / `Closed by U2` / `Closed by U2 and U6` on rows whose open half is still open, so the wrong text has to go rather than be qualified by a second sentence after it. Appending would leave a false closure standing in the same cell as its own correction, which is what the verdict called out. The four new notes are the §2 texts of the re-diagnosis verbatim. No other cell in the file changed; every other row is still an append; the `Row count` line is untouched.

   - R6: ". Results file repointed by U1 in plan adopt-hygiene (#643); the Figma run and the OD-004 decision stay open (human)"
   - R8: ". Workflow half closed by U2 and U6 in plan adopt-hygiene (#643), the run fails loudly without the key; the secret stays open with G6 (human)"
   - G2: ". `.gitattributes` half closed by U2 in plan adopt-hygiene (#643); the header line stays open behind the P3 wall"
   - D2: ". Archived and item 2 ticked by U1 in plan adopt-hygiene (#643); Phase 4 items 1, 3, 4 stay open"

   Tally after the correction: 13 full closures and 8 partials (R6, R8, G2, D2, P2, C4, P1, R3).

2. `.sdlc/records/index.md:52`. The PLAN-overhaul row's date cell gains `(closed 2026-09-16)` and its status cell becomes `complete (the file has no status field; the dated Closed note under Phase 4 rules, items 1, 3, 4 carried as debt D2)`, matching the two sibling plan rows at `:56` and `:57`, the card, and `decisions.md:58`.

Nothing else in either file, and no other file, changed in this pass.

### Checks run in pass 2

All three scripts were extracted from `.sdlc/plans/adopt-hygiene-prepr3.md` §Checks into `$CLAUDE_JOB_DIR/tmp` and run from the worktree root (`sh $CLAUDE_JOB_DIR/tmp/u8check.sh`, which calls `debt-closure-check.sh` beside itself; `sh $CLAUDE_JOB_DIR/tmp/wording-check.sh origin/main HEAD`).

| Row | Result |
|---|---|
| 1 | `1 index stale: 0 reactivity: 1 ops-untracked: 1`, then the new PLAN-overhaul grep printed `1` |
| 2 | `s2: 1 s3-ignores: 1 s8: 1 deletions-vs-80ae4d8: 0` |
| 3 | no row line, then `3 debt disagreeing: 0 R12-trigger: 1 emdash: 0 bold: 0 counts: 7/7 45/45` |
| 4 | `gaps-closed: 5 rows: 1 1 1 1 1 G6: 1` |
| 5 | `active: 0 overhaul-closed: 1 adr004-names-023: 2` |
| 6 | `vN: 0 snapshot: 1 script: 0` |
| 7 | `three-units: 0 bold-lead: 0 U8-listed: 1` |
| 8 | `stale: 0` |
| 9 | `spec-absent: 0 spec-files: 2` |
| 10 | `plan-authored em dashes: 0, bold labels: 0`, exit 0 |
| 11 | P2 `0`; P3 `0`; P5 `0`; U1-7 `moved 1 0`; U1-8 `4 2 0`; U1-11 `moved 1 0`; U1-12 `1` then no output; U2-4 `0 1 1`; U6-1 `0 4`; U6-4 `1 1 1 1 0`; U7-2 `2`, no `missing` line, no `clash` line, `0`, `0`, `7 / 7`, `45 / 45` |
| 12 | `✓ all 44 test files passed`; `git status --porcelain` 0 after the commit; `branding: clean (427 files scanned)` |
| 13 | Orchestrator's row, unchanged by this pass |

U7-2's loop was run with the corrected pattern `git grep -lE '/Users/[a-z]' --` from the re-diagnosis §4. It lists exactly `.sdlc/architecture.md`, `.sdlc/plans/adopt-hygiene.md`, `.sdlc/tickets/T-0001.md`, all three named in debt C6, so the loop prints nothing. The old `'/Users/'` pattern also matched `.sdlc/plans/adopt-hygiene-U7-p2.md`, which carries the string only inside a quoted grep command, and printed a false `missing` line.

### Criterion 3 controls, measured

The check is `debt-closure-check.sh`: for each of the 21 audited rows it reads a `done_probe` and an `open_probe` from the tree, and uses the note only to decide which of the two must hold.

| Control | Output | Exit |
|---|---|---|
| detached scratch worktree at d7cf7f4 (pass 1 head) | `false-close R6`, `false-close R8`, `false-close D2`, `false-close G2`, `disagreeing: 4`; `u8check.sh` line 3 read `3 debt disagreeing: 4 ...`; the criterion 1 PLAN-overhaul grep printed `0` | 1 |
| detached scratch worktree at 61a3f90 | twenty `no-note` lines (every audited row but R3), `disagreeing: 20` | 1 |
| same scratch, pass 2's two corrected files copied in | `disagreeing: 0` | 0 |
| flip: generated header planted in the first 600 bytes of `figma/plugin/ui.html` | `half-gone G2`, `disagreeing: 1` | 1 |
| flip: `.gitattributes` removed from the index and from disk | `not-done G2`, `not-done G3`, `disagreeing: 2` | 1 |
| flip: overhaul Phase 4 items 1, 3, 4 ticked | `half-gone D2`, `disagreeing: 1` | 1 |
| flip: D4's closing note dropped | `no-note D4`, `disagreeing: 1` | 1 |
| scratch restored after each flip | `disagreeing: 0` | 0 |

Both scratch worktrees were removed afterwards (`git worktree list` shows only the root checkout and `.worktrees/hygiene-U8`). The root checkout was never touched.

### Deviations in pass 2

None. Every Expected value in the revised criteria table was met, including criterion 3's `debt disagreeing: 0` and criterion 1's trailing `1`.
