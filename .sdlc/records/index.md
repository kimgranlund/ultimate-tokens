---
kind: records-index
repo: ultimate-tokens
built: 2026-09-16
head: f9e20c5
---

# Records index

Decision order: ADRs by number, then everything else by first commit date. All documents are dated by git; none went to the archaeologist. ADRs are sections of one file, `docs/reference/references/decision-records.md` (first commit 2026-07-12; ADR-001..015 carry in-body dates from 2026-06-15 onward, imported wholesale).

## ADRs (carded)

| id | title | date | status | supersedes / amended by | card |
|---|---|---|---|---|---|
| ADR-001 | HCT (CAM16 H/C + CIELAB L*) over OKLCH-only | 2026-06-15 | decided | | cards/ADR-001.md |
| ADR-002 | Semantic export ships RESOLVED colors, not aliasData | 2026-06-15 | decided | | cards/ADR-002.md |
| ADR-003 | On-colors fixed to `050` in both modes | 2026-06-25 | decided (override) | | cards/ADR-003.md |
| ADR-004 | Semantic scrim roles use base 750 only | 2026-07-12 | superseded | superseded by ADR-023 (the heading names no id; ADR-023 records the supersession) | cards/ADR-004.md |
| ADR-005 | Two-layer model: flat raw + semantic light-dark() | 2026-07-12 | decided | | cards/ADR-005.md |
| ADR-006 | 3-digit zero padding everywhere | 2026-07-12 | decided | | cards/ADR-006.md |
| ADR-007 | UI3 Collections schema is interchange-only | 2026-07-12 | decided (OD-003) | | cards/ADR-007.md |
| ADR-008 | OKLCH→CAM16 hue is a sampled mapping | 2026-07-12 | superseded | by ADR-011 | cards/ADR-008.md |
| ADR-009 | Fixed viewing conditions | 2026-07-12 | decided | | cards/ADR-009.md |
| ADR-010 | Single-file, dependency-free, offline | 2026-07-12 | decided | amended by ADR-021 | cards/ADR-010.md |
| ADR-011 | OKLCH-native hue model + chroma-aware inverse | 2026-07-12 | decided | supersedes ADR-008 | cards/ADR-011.md |
| ADR-012 | Ramp hue anchored in each path's render space | 2026-07-12 | decided | complements ADR-011 | cards/ADR-012.md |
| ADR-013 | Editorial type voices (7 → 11) + box/flow decoupling | 2026-07-12 | decided | | cards/ADR-013.md |
| ADR-014 | Rename orphans all Figma pluginData | 2026-07-12 | decided, consequences amended 2026-07-09 (#250) | | cards/ADR-014.md |
| ADR-015 | Product is unattributed | 2026-07-12 | decided | | cards/ADR-015.md |
| ADR-016 | One kebab-case naming grammar across emitted surfaces | 2026-07-17 | decided (TKT-0011..0014) | | cards/ADR-016.md |
| ADR-017 | Ticket backend moves to GitHub Issues | 2026-07-17 | decided (TKT-0031) | | cards/ADR-017.md |
| ADR-018 | role-table.json stays hand-kept; only Figma copy generates | 2026-07-17 | decided (TKT-0030/#342) | | cards/ADR-018.md |
| ADR-019 | Theme axis is a data-driven {name, side}[] list | 2026-07-17 | decided (TKT-0021) | | cards/ADR-019.md |
| ADR-020 | bundle.mjs stays the inliner; vite not adopted | 2026-07-17 | decided (TKT-0028) | | cards/ADR-020.md |
| ADR-021 | Hosted describe-palette MCP breaches "generator stays client-side" | 2026-07-18 | decided (#376) | amends ADR-010 | cards/ADR-021.md |
| ADR-022 | Preset typography declares REGISTERS, not slots | 2026-07-30 | decided (#405) | | cards/ADR-022.md |
| ADR-023 | Scrims are one 500-based alpha ramp, mode-flat | 2026-09-16 | decided | supersedes ADR-004 | cards/ADR-023.md |
| ADR-024 | vite is the dev server and type check; bundle.mjs is the shipped artifact | 2026-09-16 | decided | amends ADR-010, complements ADR-020 | cards/ADR-024.md |

## Specs, LLDs, plans, open decisions (carded)

| id | path | type | date | status | card |
|---|---|---|---|---|---|
| SITE-licensing | docs/site/licensing-identity-spec.md | spec | 2026-07-12 | none | cards/SITE-licensing.md |
| SITE-mcp-hosting | docs/site/mcp-hosting-spec.md | spec | 2026-07-12 (last 2026-09-11) | none | cards/SITE-mcp-hosting.md |
| SITE-storage-sync | docs/site/storage-and-sync-spec.md | spec | 2026-07-12 | none | cards/SITE-storage-sync.md |
| SITE-runbook | docs/site/go-live-runbook.md | runbook | 2026-07-12 | none | cards/SITE-runbook.md |
| LLD-app-shell | docs/lld/app-shell.md | lld | 2026-07-12 (last 2026-09-13) | none | cards/LLD-app-shell.md |
| OD-004 | docs/reference/references/od-004-plugin-free-import-test.md | open decision | 2026-07-12 | OPEN | cards/OD-004.md |
| SITE-describe-palette | docs/site/describe-palette-spec.md | spec | 2026-07-18 (last 2026-09-11) | none | cards/SITE-describe-palette.md |
| PLAN-overhaul | docs/plan/archive/overhaul-plan-2026-08-14.md | plan | 2026-08-14 | none | cards/PLAN-overhaul.md |
| SPEC-muted-base | docs/spec/spec-muted-base-key-spikes.md | spec | 2026-09-10 | approved | cards/SPEC-muted-base.md |
| LLD-muted-base | docs/lld/lld-muted-base-key-spikes.md | lld | 2026-09-10 | approved | cards/LLD-muted-base.md |
| SPEC-panda-park | docs/spec/spec-panda-park-ui-exports.md | spec | 2026-09-11 | approved | cards/SPEC-panda-park.md |
| PLAN-export-schema | docs/plan/archive/plan-2026-09-export-schema-revision.md | plan | 2026-09-11 (closed 2026-09-16) | complete | cards/PLAN-export-schema.md |
| PLAN-adia-exports | docs/plan/archive/plan-2026-09-adia-derived-export-artifacts.md | plan | 2026-09-12 (closed 2026-09-16) | complete | cards/PLAN-adia-exports.md |
| PRD-0001 | docs/prd/prd-0001-app-shell.md | prd | 2026-09-16 | stub | cards/PRD-0001.md |

## Listed, not carded (reference material, no decision of its own)

| path | type | first | last |
|---|---|---|---|
| CHANGELOG.md | changelog | 2026-06-22 | 2026-09-12 |
| docs/reference/SKILL.md | reference | 2026-07-12 | 2026-09-11 |
| docs/reference/app-shell-patterns.md | reference (cites PRD-G1..G7) | 2026-07-12 | 2026-07-12 |
| docs/reference/color-neutral-derivation.md | reference | 2026-07-12 | 2026-07-12 |
| docs/reference/references/component-inventory.md | reference | 2026-07-12 | 2026-07-12 |
| docs/reference/references/decomposition.md | reference | 2026-07-12 | 2026-07-12 |
| docs/reference/references/glossary.md | reference | 2026-07-12 | 2026-07-12 |
| docs/reference/references/knowledge-01..06-*.md | reference (6) | 2026-07-12 | 2026-09-12 |
| docs/reference/references/radix-park-adaptation.md | reference | 2026-09-11 | 2026-09-11 |
| docs/reference/references/spec-draft.md | reference | 2026-07-12 | 2026-09-11 |
| docs/reference/references/ui-plan.md | reference | 2026-07-12 | 2026-07-30 |
| docs/reference/reviews/2026-07-17-*.md | review (6) | 2026-07-17 | 2026-07-17 |
| docs/reference/reviews/2026-08-20-reactivity/*.md | review (6), moved from `.claude/docs/reports/` by U1 | 2026-08-20 | 2026-08-20 |
| docs/reference/rubrics/*.md | rubric (4) | 2026-07-12 | 2026-08-14 |
| .claude/ops/plan.md, .claude/ops/reports/*.md | ops (4), untracked by U3 on 2026-09-17 (on disk, ignored, no longer a record) | 2026-07-25 | 2026-07-29 |
| docs/tickets/*.md | ticket archive (31) | 2026-07-12 | 2026-07-17 |

No RFC, RDD, or IDR files exist. The PRD gap (G1: `app-shell-patterns.md` and `storage-and-sync-spec.md` cited PRD goals with no source document) closed on 2026-09-16 with the PRD-0001 stub above.
