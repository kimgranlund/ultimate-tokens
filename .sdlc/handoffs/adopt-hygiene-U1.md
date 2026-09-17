---
kind: handoff
plan: adopt-hygiene
unit: U1
branch: unit/hygiene-U1
written: 2026-09-16
---

# U1 handoff — records, plans, stubs, moved docs

## Files

- `docs/reference/references/decision-records.md` — dated amendments on ADR-010 (storage chain is
  now a comment, `zipStore` not `makeZip`), ADR-013 (fifteen voices), ADR-016 (#491 collection
  renames); new ADR-023 (scrim 500-ramp, supersedes ADR-004) and ADR-024 (vite dev/typecheck,
  bundle.mjs ships) appended after ADR-022, before Quick map.
- `docs/lld/lld-muted-base-key-spikes.md` — amendment naming `src/engine/resolve.mjs` as the
  resolver's home.
- `docs/site/go-live-runbook.md` — amendment: `maxSets`/`proExport`/`advancedTreatments`/
  `describePalette` are wired `flagOf()` consumers; `hostedMcp` is the only unwired one.
- `docs/site/describe-palette-spec.md` — §12 item 6 amendment: the weekly eval workflow now fails
  loudly (`exit 1`) without the key, not a clean skip.
- `docs/reference/references/od-004-plugin-free-import-test.md` — repointed to root `CHANGELOG.md`.
- `docs/plan/plan-2026-09-adia-derived-export-artifacts.md`, `docs/plan/plan-2026-09-export-schema-revision.md`
  — status flipped to `complete`, every step ticked `done`, revision row added, moved to
  `docs/plan/archive/`.
- `.claude/overhaul-plan-2026-08-14.md` — Phase 4 item 2 ticked (verified evidence only), items 1/3/4
  left unticked and named as debt D2 in a dated `Closed 2026-09-16` line; "Next step" sentence
  dated; moved to `docs/plan/archive/overhaul-plan-2026-08-14.md`.
- `docs/prd/prd-0001-app-shell.md` — new PRD stub, the seven goals, adapter §6 frontmatter.
- `.claude/skills/project-docs/SKILL.md` — `docs/prd/` and `docs/plan/` table cells updated off
  "not present yet".
- `.sdlc/records/cards/{ADR-023,ADR-024,PRD-0001}.md` — new cards.
- `.sdlc/records/index.md`, `.sdlc/records/decisions.md` — rows for ADR-023, ADR-024, PRD-0001;
  the two archived plan rows' paths/status updated; PLAN-overhaul's card Source field updated.
- `.sdlc/adapter.md` — one C10 cell reworded off the old `.claude/` path (still names the old
  location without quoting it, since the branding gate scans `.sdlc/`).
- `README.md` — UI3 named interchange-only; `gen-font-test.mjs` added to the scripts line.
- `.claude/docs/reports/reactivity-2026-08-20/*` moved to `docs/reference/reviews/2026-08-20-reactivity/`.
- `.sdlc/architecture.md` — K18 control reworded to require the `test/ui/persist.mjs` schema-rename
  snapshot case instead of a `vN` comment in `persist.js`.

## Ran

- `npm test` — `all 44 test files passed`.
- `node test/repo/branding.mjs` — `clean (397 files scanned)`.
- All 12 U1 criteria run individually per the plan's commands; all passed (see plan for exact
  commands/expected output). Negative controls run for criteria 1, 5, 6, 7, 12 and reverted.
- `git diff origin/main --stat -- src mcp scripts test ':!test/repo/branding.mjs'` — `0` (scope
  wall holds).
- `git diff origin/main -- docs/reference/references/decision-records.md | grep -cE '^-[^-]'` —
  `0` (append-only holds, P5).

## Left out

- Nothing in the U1 criteria list was skipped. Real landing-PR numbers for the export-schema plan
  were independently verified via `git log` (E1 `#578`/PR merge `9a9b9b2`..`#592` lineage, E2
  `#593`, E3 `#580`, E4 `#583`, E5 `#581`, E6 `#595`) and reconciled against the existing
  `decisions.md`/`debt.md` citations (`#578, #593, #631`); the revision row cites both the ticket
  numbers already on record and the actual merge commits for full traceability.
- Phase 4 items 1, 3, 4 of the overhaul plan were deliberately left unticked (no fresh evidence
  this pass) and recorded as debt D2, per the plan's own instruction not to tick on assumption.
