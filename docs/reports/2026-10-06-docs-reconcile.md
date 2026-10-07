# Docs reconcile to the docs-schema homes (2026-10-06)

Evidence for the move of `docs/` onto the nine docs-schema homes (ADR-028 in
`docs/references/decision-records.md`). Gate at the end of the change: `docs_check.py` (sdlc-lite
0.20.11) reports 0 errors and 24 warnings (B-2a 12, D-10 2, D-11 10), down from 32 errors and 25
warnings.

## What moved

The full old-to-new map, one row per file, is
[the path map](../assets/docs-reconcile-path-map.tsv). Finished records under `.sdlc/` and
`docs/archive/` still name old paths; resolve them through that map.

| Old | New | Note |
| --- | --- | --- |
| `docs/reference/data/**`, `docs/reference/colors/categories/**` | unchanged | `docs/reference/` stays as a listed home of kind assets (runtime-read data) |
| `docs/reference/{geometry,typography}/*.tokens.json` | `docs/assets/{geometry,typography}-tokens.json` | nothing reads them at runtime |
| `docs/reference/references/*.md` | `docs/references/` | `decision-records.md` stays one file |
| `docs/reference/rubrics/`, `docs/reference/colors/*.md`, `docs/reference/typography/*.md`, `docs/reference/geometry/README.md`, `docs/reference/{app-shell-patterns,color-neutral-derivation}.md` | `docs/references/`, same relative path | |
| `docs/reference/CHANGELOG.md` | `docs/references/changelog.md` | frozen history |
| `docs/reference/SKILL.md` | `docs/specs/spec-cell.md` | folder-relative links rewritten repo-rooted |
| `docs/reference/reviews/2026-07-17-*.md` | `docs/reports/` | |
| `docs/reference/reviews/2026-08-20-reactivity/INDEX.md` | `docs/reports/2026-08-20-reactivity.md` | its folder stays beside it as the evidence folder; only the five link targets changed |
| `docs/marketing/**` | `docs/specs/marketing/**` | `INDEX.md` became `index.md`; the dated brand-council review went to `docs/reports/` |
| `docs/site/*-spec.md` | `docs/specs/site/` | the go-live runbook went to `docs/guides/` |
| `docs/lld/`, `docs/prd/`, `docs/spec/` | `docs/specs/` | |
| `docs/plan/archive/` | `docs/archive/plans/` | |
| `docs/tickets/` | `docs/archive/tickets/` | |
| `docs/img/palette-preview.svg` | `docs/assets/palette-preview.svg` | |

Live files (code, tests, scripts, skills, agents, entry files, live `.sdlc` contracts, live docs)
were rewritten to the new paths. A whole-tree residue sweep and a basename sweep over every live
file found no old path left outside the frozen allowlist below.

Frozen, never rewritten: `docs/archive/`, `docs/reports/`, `docs/references/changelog.md`, the
ADR bodies in `docs/references/decision-records.md`, root `CHANGELOG.md`, and the `.sdlc` record
folders in the audit below.

## .sdlc audit

Report only: no `.sdlc` record was moved or rewritten. Counts are files that still name an old
docs path, measured with the residue pattern of this change (`git grep -l -E`).

| Folder | Files naming an old docs path |
| --- | --- |
| .sdlc/handoffs/ | 84 |
| .sdlc/verdicts/ | 85 |
| .sdlc/records/ | 43 |
| .sdlc/reviews/ | 33 |
| .sdlc/questions/ | 9 |
| .sdlc/plans/ | 50 |
| .sdlc/tickets/ | 1 |

`.sdlc/board.md`: 1 line names an old docs path. The board is frozen history here and stays as is.

The 12 B-2a warnings of `docs_check.py` (loose `.sdlc` files and folders outside the sdlc-lite
record types):

- Loose files: `.sdlc/adapter.md`, `.sdlc/architecture.md`, `.sdlc/baseline.md`,
  `.sdlc/burndown.md`, `.sdlc/debt.md`, `.sdlc/survey.md`.
- Folders: `.sdlc/handoffs/`, `.sdlc/plans/`, `.sdlc/questions/`, `.sdlc/records/`,
  `.sdlc/reviews/`, `.sdlc/verdicts/`.

These come from the earlier `sdlc` plugin layout. They stay warnings until the records are
re-homed or the record types widen.

Stale or duplicated records found:

- `.sdlc/survey.md` says 24 ADRs, highest ADR-024 (its ADR line and claim C10). The decision record
  now holds 28, highest ADR-028.
- `.sdlc/architecture.md` cites ADR-014, ADR-016, ADR-017, ADR-018, ADR-020 and ADR-021 by
  line number in `decision-records.md`, and those line numbers already pointed off their ADR
  headings at this change's base. ADR-001, ADR-002 and ADR-010 still resolve.
- `.sdlc/survey.md` lists the old docs folders without trailing slashes as a dated inventory, so
  it reads as current but describes the pre-move layout.
- `.sdlc/plans/` holds 24 live plan files beside 47 in `.sdlc/plans/archive/`. Their names
  suggest several are per-unit replans of finished work; check each and archive the closed ones.

## Follow-ups

- Split `docs/references/decision-records.md` into one file per decision under
  `docs/decisions/NNNN-*.md`. It is one 938-line file (a D-11 warning) and the `decisions/` home
  expects one decision per file.
- Re-home the documents in `docs/references/` by form: the knowledge chapters, `spec-draft.md`,
  `ui-plan.md` and `decomposition.md` are specs or plans, not lookup tables. This change moved
  them by folder rule only.
- `docs/assets/palette-preview.svg` drifts at this change's base: running `gen:preview` rewrites
  the committed SVG. This change did not run it; the drift predates the move and needs its own fix.
