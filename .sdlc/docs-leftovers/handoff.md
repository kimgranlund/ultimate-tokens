---
id: T-0042
title: "Docs and copy leftovers from T-0033 and T-0034 (ADR cites, size-ramp copy, store-copy link, notes)"
type: chore           # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L1             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
The residuals the T-0033 solo and the T-0034 verifier reported are fixed or explicitly dropped.

## Intent
- Do: (1) `src/ui/persist.js` comments that label the v10 layer-pin stamp ADR-033: it is ADR-034 (grep `ADR-033` across src and test for any compute-layer context left, the compound-inset ADR-033 stays); (2) customer copy still saying 'size ramp' or the retired treatments: `docs/specs/marketing/web/landing.md` (~:41-42) and the title string near `src/ui/app.js` (grep `size ramp`), reword for the Maison ladder (27 cells, tier x scale x size) via the facts in `docs/specs/marketing/fact-sheet.md`; keep the marketing parity tests green; (3) `.sdlc/plans/archive/compute-layers-adr-draft.md:63` still says approved as ADR-028: make it agree with line 2 (ADR-034); (4) `docs/specs/marketing/store-copy.md` is the one D-10 warning in `docs_check.py` (check what it flags and fix if it is a dead link or front matter); (5) `.sdlc/notes.md` line 1 still has a spent '#788 held until T-0014' clause and the PR #813 pixel notes whose majors landed in #818: delete spent clauses only.
- Done when: `npm test` green, citations clean, `docs_check.py` D-10 count drops, each item fixed or refused with evidence in your report.

## Context
Sources: `.sdlc/docs-facts-sweep/` solo report (open items) and `.sdlc/docs-structure-sweep/verifier-L3.md` residuals. Customer-facing words: use `docs/specs/marketing/` facts only, never invent counts.

## Constraints
Run `node scripts/audit-citations.mjs` and `npm test` before done; fix cites in the same change. No U+2014. Do not edit inside managed AGENTS.md blocks by hand (rerun the generator `python3 <plugin>/scripts/onboard.py` is NOT allowed: edit only the starter text above the managed block or leave and report). Never push.
