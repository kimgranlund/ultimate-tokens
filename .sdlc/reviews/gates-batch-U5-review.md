FAIL

# gates-batch U5 review, pass 1 (reviewer-l1, trivial lane)

Head reviewed: 1de0e6ee on unit/gb-U5. Files changed: `.sdlc/baseline.md`, `.sdlc/handoffs/gates-batch-U5.md` only. `npm test` skipped (heavy-process count was 2, limit under 2).

## Findings

1. 🟡 (blocks PASS, one-word fix) The edited `npm run build` row in `.sdlc/baseline.md` says `re-measured at gates-batch U5 (#776) on plan/anchor-gaps`. The figure was measured in `.worktrees/gb-U5` on unit/gb-U5 (plan/gates-batch), not on plan/anchor-gaps; the builder changed the unit name and kept the old branch name. Change `plan/anchor-gaps` to `plan/gates-batch` (or `unit/gb-U5`). Everything else in the cell is accurate.
2. 🟢 The Correction paragraph matches the file's Correction shape (date, plan and unit, ticket, figure move, named cause, program output and the check's reading before and after, "Only the KB cell moves; the seconds are not re-measured."). The cause is true: the plan branch's `figma/plugin/ui.html` is 4267640 to 4268211 bytes vs main, and `src/engine/type.mjs`, `src/ui/sections/typography.js` and `figma/binder/**` comment edits are in the plan diff; pre-land record finding 1 names the same cause. It does not claim the verbatim STALE line.

## Criteria, re-run

| Check | Reading |
|---|---|
| C3 cmd 1 (`test/run.mjs` diff count) | `0` |
| C3 cmd 2 (other baseline lines moved) | `0` |
| C3 cmd 3 / U5-1 `sh .sdlc/checks/baseline-agrees-check.sh` | `ok    ui.html: baseline 4141.8 KB, tree 4141.8 KB`, `stale total: 0`, exit 0 |
| U5-2 `grep -c '^Correction (2026-09-30, plan gates-batch' .sdlc/baseline.md` | `1` |
| ui.html figure vs `node scripts/bundle.mjs && node scripts/gen-figma-ui.mjs` in the worktree | printed `wrote figma/plugin/ui.html 4141.8 KB`; `git status --short` empty afterward |
| Negative control (scratch shared clone, row set back to 4141.3) | `STALE ui.html: baseline 4141.3 KB, tree 4141.8 KB`, `stale total: 1`, exit 1 |
| Scope | diff is baseline.md and the handoff only |
| U+2014 | none on any added line (two pre-existing hits in baseline.md lines 29 and 31 are on the plan branch too; `test/repo/em-dash.mjs`: clean, 1034 files) |
| Branding | `branding: clean (1026 files scanned)` |

Verdict: FAIL on finding 1 alone; every criterion otherwise reads green. After the fix, re-run U5-1, U5-2 and C3 cmd 2, then PASS.

## Pass 2 (head 02fd12ec)

PASS

Finding 1 cleared: the build row now reads `re-measured at gates-batch U5 (#776) on unit/gb-U5 (plan/gates-batch)`; the rework commit touches `.sdlc/baseline.md` only and that one cell. Re-run: C3 cmd 1 `0`, C3 cmd 2 `0`, U5-1 `ok    ui.html: baseline 4141.8 KB, tree 4141.8 KB` and `stale total: 0`, U5-2 Correction count `1`, em-dash clean (1035 files), branding clean (1027 files), worktree tree clean. The remaining `anchor-gaps` mentions in the file are historical corrections and the see-list, not this row's provenance.
