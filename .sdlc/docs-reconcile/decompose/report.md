# Decomposition report: docs-reconcile

Manifest: .sdlc/docs-reconcile/decompose/manifest-v1.json (technical-architecture · plan) · coverage_check: clean
Quadrant: load-bearing
Outside-in: 15 leaves under one system node and one grouping node (reference rewrite). No unjustified structure. The rewrite is split by owner tree (code, agents, docs, live .sdlc) so each file has one writer.
Inside-out: 22 actions derived from the goal, the checker rules and the repo gates; all hosted. Two needs had no node on the first pass and added one each: entry files after the move (D-7 is silent today, fires after) and the ADR that records the decision.
Hand-off: /plan

## Move map

`move-map.tsv` in this folder: 113 rows, `old<TAB>new`, relative to `docs/`. 99 rows change, 14 stay (6 under `reference/data/`, 8 under `reference/colors/categories/`).

Folder rules the rows follow:

| Old | New | Note |
| --- | --- | --- |
| `reference/data/**`, `reference/colors/categories/**` | unchanged | `reference/` becomes a listed home of kind assets |
| `reference/{geometry,typography}/*.tokens.json` | `assets/{geometry,typography}-tokens.json` | D-12 forces a rename and nothing reads them, so they leave the runtime-read home |
| `reference/references/*.md` | `references/` | includes decision-records.md, kept as one file |
| `reference/rubrics/`, `reference/colors/*.md`, `reference/typography/*.md`, `reference/geometry/README.md`, `reference/{app-shell-patterns,color-neutral-derivation}.md` | `references/` same relative path | |
| `reference/CHANGELOG.md` | `references/changelog.md` | path is pinned in test/repo/branding.mjs RECORDS |
| `reference/SKILL.md` | `specs/spec-cell.md` | relative links to data/, rubrics/, references/ need rewriting |
| `reference/reviews/2026-07-17-*.md` | `reports/` | |
| `reference/reviews/2026-08-20-reactivity/INDEX.md` | `reports/2026-08-20-reactivity.md` | its folder becomes the evidence folder |
| `marketing/**` | `specs/marketing/**` | INDEX.md becomes index.md; the dated brand-council review goes to `reports/` |
| `site/*-spec.md` | `specs/site/` | go-live-runbook.md goes to `guides/` |
| `lld/`, `prd/`, `spec/` | `specs/` | |
| `plan/archive/` | `archive/plans/` | |
| `tickets/` | `archive/tickets/` | |
| `img/palette-preview.svg` | `assets/palette-preview.svg` | |

## Residue contract

Old-path pattern (extended regex):

```
docs/(lld|marketing|plan|prd|site|spec|tickets|img)/|docs/reference/[A-Za-z0-9_./-]*\.md|docs/reference/(references|reviews|rubrics)\b|docs/reference/(geometry|typography)/[a-z]+\.tokens\.json
```

Allowlist pathspecs (frozen, never rewritten): `.sdlc/handoffs`, `.sdlc/verdicts`, `.sdlc/records`, `.sdlc/reviews`, `.sdlc/questions`, `.sdlc/plans/archive`, `.sdlc/docs-reconcile`, `docs/archive`, `docs/reports`, `docs/references/changelog.md`, the ADR bodies that predate this change in `docs/references/decision-records.md`, and generated files (regenerated, not edited).

Basename sweep: for each changed row, `git grep -n -F <old basename>` and inspect the path fragment before it. This catches relative mentions that carry no `docs/` prefix (the spec cell alone has about 45).

Bare folder mentions (`docs/reference/`, `docs/reference/typography`, `docs/reference/colors`) are ambiguous after the split and are triaged by hand: data mentions stay, document mentions move to `docs/references/`.

## Dry run

The map plus the layout row were applied to a temp copy and checked with docs_check 0.20.11:

- after moves: D-1, D-9, D-12 all zero; 8 D-7 errors (missing entries).
- after `onboard.py setup --yes` on staged files: 0 errors, 18 warnings (D-10 8, D-11 10). Rerun after the token snapshots moved to `assets/`: same totals.
- onboard setup created nothing until the files were staged with `git add`.
- of the 8 D-10 warnings, 6 are repaired by the docs rewrite, 1 predates this work, 1 is an onboard link to the frozen `reports/` home.
