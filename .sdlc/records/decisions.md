---
kind: decisions
repo: ultimate-tokens
reconciled: 2026-09-16
head: f9e20c5
status: verified-and-answered
verdict: .sdlc/verdicts/records.md
---

# Live decisions

Reconciled from `.sdlc/records/cards/` oldest to newest. A decision is live only after the Verifier grades it against `.sdlc/architecture.md` and the code. Originals: `docs/reference/references/decision-records.md` (ADRs), `docs/site/`, `docs/spec/`, `docs/lld/`, `docs/plan/`.

## Lineage of the ADRs

| id | state | lineage |
|---|---|---|
| ADR-001 HCT engine | live | bridge to OKLCH input re-ruled by ADR-011 |
| ADR-002 resolved semantic export | live | amended 2026-06-15 (aliasData fallback softens framing), 2026-06-17 (`rawColl` shape gate); feeds OD-004 (open) |
| ADR-003 on-colors fixed 050 | live (OVERRIDE) | amended 2026-06-25: opt-in `onColorMode:"contrast"`, default unchanged |
| ADR-004 scrims on base 750 | superseded | by the 500-ramp scrim revision, 2026-06-17, recorded only as a note inside ADR-004 (gap G2) |
| ADR-005 flat raw + semantic light-dark() | live | none |
| ADR-006 3-digit padding, `--c-` prefix | live | amended 2026-06-17/24 (prefix grammar); ADR-016 restates padding as grammar rule; SPEC-panda-park N-1 ratifies UNPADDED keys for Panda/Radix only (fenced divergence) |
| ADR-007 UI3 schema interchange-only | live (CAUTION, OD-003) | none |
| ADR-008 sampled OKLCH→CAM16 hue | superseded | by ADR-011 |
| ADR-009 fixed viewing conditions | live | none |
| ADR-010 single-file, dependency-free, offline | live | re-framed 2026-06-15 (single-file is distribution, modular source ok); hosted describe-palette exception carved by ADR-021 |
| ADR-011 OKLCH-native hue + Newton inverse | live | supersedes ADR-008; complemented by ADR-012; precedent for ADR-018 |
| ADR-012 hue anchored in render space | live | complements ADR-011 |
| ADR-013 editorial type voices | live | amended 2026-07-13 three times (rename, 13 voices, uniform 3-step ramps, sibling weights); later canon names 15 voices (ADR-022, `type-scale` skill) with no amendment note in ADR-013 (gap G4); amended 2026-09-16 to fifteen voices (U1), closing G4 |
| ADR-014 rename orphans Figma pluginData | live | consequences amended 2026-07-09 (#250): pre-rename element-tag alias retired under ADR-015; storage-key migration chain kept |
| ADR-015 product unattributed | live | drives the ADR-014 amendment; enforced by `test/repo/branding.mjs` |
| ADR-016 kebab-case grammar, "Breakpoints" collection | live | executed TKT-0011..0014; SPEC-muted-base cites it for two-segment token shape; amended 2026-09-16 (U1): the collection set is Color Roles, Type Primitives, Geometry (#491, G8) |
| ADR-017 tickets on GitHub Issues | live | executed TKT-0031; cited by PLAN-overhaul, SPEC-muted-base, SPEC-panda-park |
| ADR-018 role-table.json hand-kept | live | none; `refs-canonical` gate |
| ADR-019 data-driven theme axis | live | documented gaps: `exportUI3` Color Roles and the standalone binder still hardcode Light+Dark |
| ADR-020 bundle.mjs stays the inliner | live | vite still runs `vite build` inside `npm run build` for the SPA; ADR rules only the single-file artifact; the split is ruled by ADR-024 (2026-09-16) |
| ADR-021 hosted describe-palette exception | live | amends ADR-010 and `mcp-hosting-spec.md` §1; #377 hosted build not started |
| ADR-022 type registers, not slots | live | migration `scripts/migrate-type-registers.mjs` kept as record |
| ADR-023 scrims one 500-based alpha ramp | live | supersedes ADR-004; closes gap G2 |
| ADR-024 vite dev/typecheck, bundle.mjs ships | live | amends ADR-010 wording, complements ADR-020; closes gap G3 |

## Specs, LLDs, plans

| id | state | what is ruled | lineage / open |
|---|---|---|---|
| SITE-licensing (decided 2026-07-02) | live, Phase 1 unbuilt? | license bound to email, not device; Phase 1 email match in Account panel; Phase 2 rides mcp-hosting Phase B | referenced by SITE-runbook; verifier: is the `email` opt in `src/engine/flags.js`? |
| SITE-mcp-hosting (draft) | live for Phase A only | one OAuth endpoint, Cloudflare, `mcp/brand-kit-core.mjs` shared core, parity gate; §6a client-minted kit ids (TKT-0029) | §1 amended by ADR-021; §6 superseded by SITE-storage-sync R15/R16; Phases B–F unbuilt (no domain) |
| SITE-storage-sync (draft, for later) | recorded, unbuilt | local-first outbox sync, LWW + conflict copy, 90-day anonymous retention | cites PRD-G1..G6 (gap G1); expected unbuilt |
| SITE-runbook | live procedure | hard launch = flip `TIERS_ENFORCED` after wiring Pro gates, LS dashboard, CORS check | amended 2026-09-16 (U1): four `flagOf()` consumers are wired, `hostedMcp` is the only unwired flag |
| SITE-describe-palette (draft, kickoff #379) | live, mostly built | LLM decides seeds never colors; two-step `generate_kit`; Pro-gated; separate describe-mcp zip | #369–#375 built/resolved per doc, #376 = ADR-021, #377 blocked; open §12 items |
| OD-004 | open | manual Figma import test of aliased DTCG cascade | depends on ADR-002; no result recorded |
| LLD-app-shell (as-built) | live | one custom element, 3×3 grid, `this.section` routing, `render`/`liveRefresh` split, extension order | last edited 2026-09-13; verifier: still matches `src/ui/app.js`? |
| SPEC-muted-base 0.3.0 + LLD-muted-base (approved 2026-09-11) | live | prime system (7 swatches, `Color Prime`/`Base`), palette groups with absolute `baseChroma`, schema v4, 16-palette default with `Data 1..8`, 96 tokens/palette | supersedes own 0.1.0/0.2.0; verifier: P1..P8 + G1/G2 landed? |
| SPEC-panda-park 0.2.0 (approved) | live | `exportPanda` + `exportRadix` (renamed from parkui, #614), 12-step projection per `radix-projection.json`, unpadded keys, Pro-gated, `smoke-panda` CI leg, "10 formats" | K1..K6; verifier: rename complete across surfaces, `flattenOver` fate |
| PLAN-export-schema (complete, closed 2026-09-16) | live, fully executed | group as metadata never name; `EXPORT_SCHEMA_VERSION = 2` stamped on every surface; shadcn `chart-1..8` | E1-E7 all landed (verified against `main`); checklist flipped and file archived, closing gap G5 for this plan |
| PLAN-adia-exports (complete, closed 2026-09-16) | live, fully executed | sha256-pinned `adia-oklch-export.css` / `adia-radix-export.mjs`, `gen:adia-exports` in test+build | landed 14c4260 (#631); checklist flipped and file archived, closing gap G5 for this plan |
| PLAN-overhaul (2026-08-14) | Wave 1 executed, closed 2026-09-16 | rename 3 agents + 1 skill; 6 gerund skills grandfathered | PRs #439–#442 done; closed and archived by U1 (`docs/plan/archive/`): item 2 ticked, items 1, 3, 4 carried as debt D2 |
| PRD-0001 app shell (stub, 2026-09-16) | live | recovers PRD-G1..G7 cited by SITE-storage-sync and app-shell-patterns.md | closes gap G1; users/non-goals/success measures still owed (debt A6) |

## Gaps: load-bearing with no record of their own

| id | gap | evidence |
|---|---|---|
| G1 | No PRD exists; `app-shell-patterns.md` and `storage-and-sync-spec.md` cite PRD-G1..G7 | records-scout-adrs, records-scout-docs; closed 2026-09-16 by the PRD-0001 stub (U1) |
| G2 | The 500-ramp scrim model (live, every scrim role resolves onto `500-{step}`) is recorded only as a superseding note inside ADR-004 | cards/ADR-004.md; closed 2026-09-16 by ADR-023 (U1) |
| G3 | vite is in the toolchain (`dev`, `preview`, `vite build` inside `build`) while ADR-010 says "no build step" and ADR-020 rejects vite; the SPA/dev vs single-file split is implied, not ruled | package.json scripts, cards/ADR-010, ADR-020; closed 2026-09-16 by ADR-024 (U1) |
| G4 | Voice count: ADR-013 ends at thirteen; ADR-022 and the `type-scale` skill assume fifteen; no amendment records the 13→15 step | cards/ADR-013, ADR-022; closed 2026-09-16 by the ADR-013 amendment (U1) |
| G5 | Plan status fields are never flipped after landing (all three plans read "todo"/unticked though work shipped); no rule says who closes a plan | cards/PLAN-*; closed 2026-09-16: all three plans archived by U1, adapter.md §5 names the closer |
| G6 | `describe-eval.yml` needs `secrets.ANTHROPIC_API_KEY`; custody undecided (SITE-describe-palette §12) | cards/SITE-describe-palette; since U2 and U6 the workflow fails loudly without it |

## Human answers (2026-09-16, verbatim in `.sdlc/questions/adopt-a3-drift.md`)

| item | ruling | lands in |
|---|---|---|
| ADR-010, ADR-013 (G4), ADR-016 (G8), LLD-muted-base, SITE-runbook, SITE-describe-palette stale wording | amend all six in one docs unit | A7 |
| `hostedMcp` wired in `TIER_FLAGS` (SITE-mcp-hosting drift) | code is wrong: unwire until Phase E, per spec | A7, debt S |
| ADR-007 caution absent from drawer/README | code is wrong: surface the caution | A7, debt S |
| Plans never closed (G5) | close all three, adapter names the Orchestrator as plan closer | A5 rule + A7 |
| SITE-licensing Phase 1 never built | deferred on purpose, keep as debt | A6, debt M |
| OD-004 open | keep open; human runs the test when in Figma, conductor records the result | A6, debt S |
| G1 PRD stub, G2 scrim-500 ADR, G3 vite/bundle split ADR | write all three stubs | A5/A6 planner |
| G6 `ANTHROPIC_API_KEY` missing, eval passes anyway | debt: check whether the eval silently skips | A6, debt S |
| SITE-storage-sync unbuilt | by design ("for later"); no action | none |
| `flattenOver` dead export (SPEC-panda-park) | debt S, no question asked | A6 |
| G7 `.sdlc/` files tripped branding gate | conductor scrubbed cards + decisions.md; verifier scrubs its verdict | done |
