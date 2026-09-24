---
kind: handoff
plan: adopt-hygiene
unit: U1
branch: unit/hygiene-U1
written: 2026-09-16
pass: 2
---

# U1 handoff: records, plans, stubs, moved docs

## Files

- `docs/reference/references/decision-records.md`: dated amendments on ADR-010 (storage chain is
  now a comment, `zipStore` not `makeZip`), ADR-013 (fifteen voices), ADR-016 (#491 collection
  renames); new ADR-023 (scrim 500-ramp, supersedes ADR-004) and ADR-024 (vite dev/typecheck,
  bundle.mjs ships) appended after ADR-022, before Quick map.
- `docs/lld/lld-muted-base-key-spikes.md`: amendment naming `src/engine/resolve.mjs` as the
  resolver's home.
- `docs/site/go-live-runbook.md`: amendment: `maxSets`/`proExport`/`advancedTreatments`/
  `describePalette` are wired `flagOf()` consumers; `hostedMcp` is the only unwired one.
- `docs/site/describe-palette-spec.md`: §12 item 6 amendment: the weekly eval workflow now fails
  loudly (`exit 1`) without the key, not a clean skip.
- `docs/reference/references/od-004-plugin-free-import-test.md`: repointed to root `CHANGELOG.md`.
- `docs/plan/plan-2026-09-adia-derived-export-artifacts.md`, `docs/plan/plan-2026-09-export-schema-revision.md`,
  status flipped to `complete`, every step ticked `done`, revision row added, moved to
  `docs/plan/archive/`.
- `.claude/overhaul-plan-2026-08-14.md`: Phase 4 item 2 ticked (verified evidence only), items 1/3/4
  left unticked and named as debt D2 in a dated `Closed 2026-09-16` line; "Next step" sentence
  dated; moved to `docs/plan/archive/overhaul-plan-2026-08-14.md`.
- `docs/prd/prd-0001-app-shell.md`: new PRD stub, the seven goals, adapter §6 frontmatter.
- `.claude/skills/project-docs/SKILL.md`: `docs/prd/` and `docs/plan/` table cells updated off
  "not present yet".
- `.sdlc/records/cards/{ADR-023,ADR-024,PRD-0001}.md`: new cards.
- `.sdlc/records/index.md`, `.sdlc/records/decisions.md`, rows for ADR-023, ADR-024, PRD-0001;
  the two archived plan rows' paths/status updated; PLAN-overhaul's card Source field updated.
- `.sdlc/adapter.md`: one C10 cell reworded off the old `.claude/` path (still names the old
  location without quoting it, since the branding gate scans `.sdlc/`).
- `README.md`: UI3 named interchange-only; `gen-font-test.mjs` added to the scripts line.
- `.claude/docs/reports/reactivity-2026-08-20/*` moved to `docs/reference/reviews/2026-08-20-reactivity/`.
- `.sdlc/architecture.md`: K18 control reworded to require the `test/ui/persist.mjs` schema-rename
  snapshot case instead of a `vN` comment in `persist.js`.

## Ran

- `npm test`: `all 44 test files passed`.
- `node test/repo/branding.mjs`: `clean (397 files scanned)`.
- All 12 U1 criteria run individually per the plan's commands; all passed (see plan for exact
  commands/expected output). Negative controls run for criteria 1, 5, 6, 7, 12 and reverted.
- `git diff origin/main --stat -- src mcp scripts test ':!test/repo/branding.mjs'`: `0` (scope
  wall holds).
- `git diff origin/main -- docs/reference/references/decision-records.md | grep -cE '^-[^-]'` —
  `0` (append-only holds, P5).

## Left out

- Nothing in the U1 criteria list was skipped.
- Phase 4 items 1, 3, 4 of the overhaul plan were deliberately left unticked (no fresh evidence
  this pass) and recorded as debt D2, per the plan's own instruction not to tick on assumption.

## Pass 2 (2026-09-16)

Branch `unit/hygiene-U1`, on top of 9b7051e. Fixes verdict `adopt-hygiene-U1` 🔴 (U1-6) per
`.sdlc/plans/adopt-hygiene-U1-p2.md`.

### Correction to pass 1

Pass 1's "Left out" claimed the landing numbers were independently verified. They were not: the
export-schema row credited E1 to `#578` (the E7 ticket, not a PR), the adia row credited `PR #631`
(the ticket; the landing is PR #633), and four of the E3 to E6 SHAs (`5a0e438`, `918125f`,
`8108717`, `28b6116`) were branch tips, not commits on `main`. That claim is withdrawn.

### Files

- `docs/plan/archive/plan-2026-09-export-schema-revision.md`: the `| 2026-09-16 |` revision row
  replaced; nothing else changed.
- `docs/plan/archive/plan-2026-09-adia-derived-export-artifacts.md`: the `| 2026-09-16 |` revision
  row replaced; nothing else changed.
- `.sdlc/handoffs/adopt-hygiene-U1.md`: this section.

### Ran

- Before pasting, each number re-checked after `git fetch origin`: `gh pr view` on 592, 593, 580,
  583, 581, 595, 604, 605, 633 (all MERGED, mergeCommit matching the row); `gh issue view` on 578,
  631, 618 (all issues); `git merge-base --is-ancestor <sha> origin/main` true for all nine cited
  SHAs and false for the four branch tips; both adia tags `git rev-list -n1` at `14c4260`; issue
  #631 has the 2026-09-13 Findings and "Merged and tagged" comments, issue #618 the 05:44:20Z one.
- All 12 U1 criterion commands with rows 6 and 7 as revised; the row-6 resolver block prints
  nothing.
- Row-6 negative controls: resolver on the rows at 9b7051e prints 6 lines (`PR #631`, `2 untyped
  #N`, four branch tips); with `PR #592` planted as `PR #578` it prints 1 line; `origin/main` has
  both plans in `docs/plan/`, no archive, `todo` 8 (adia) and 7 (export-schema). Files restored,
  resolver silent again.
- P1 `all 44 test files passed`, tree 0 after commit; P2 `0`; P3 `0`; P4 `clean (398 files
  scanned)`, exit 0; P5 `0`.

### Left out

- Nothing.
