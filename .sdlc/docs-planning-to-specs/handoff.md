---
id: T-0041
title: "Move ui-plan.md and decomposition.md from docs/planning to docs/specs (T-0034 verifier ruling)"
type: chore           # feature | bug | chore | spike | idea
status: done     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L1             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
`ui-plan.md` and `decomposition.md` live in `docs/specs/` where their contract fits, and `docs/planning/` is removed if it ends up empty.

## Intent
- Do: `git mv docs/planning/ui-plan.md docs/planning/decomposition.md docs/specs/`; repoint every citer (grep the old paths in README, src, test, scripts, .claude, docs, `docs/assets/docs-reconcile-path-map.tsv` column 2, `test/repo/citations.mjs` fact pins); update `docs/AGENTS.md` and the specs/planning entry files; remove `docs/planning/` when empty, or keep it only if it holds other documents.
- Done when: `npm test` green, `node scripts/audit-citations.mjs` clean, `python3 <plugin>/scripts/docs_check.py --root .` shows no new warnings, `git log --follow` reaches history for both files.

## Context
The T-0034 L3 verifier ruled `planning/` wrong for both (its report: `.sdlc/docs-structure-sweep/verifier-L3.md`): docs/AGENTS.md says planning holds plans under review, both docs open `status: accepted` and are maintained as current truth, are fact-pinned by `test/repo/citations.mjs`, and `docs/specs/app-shell.md:5` calls ui-plan.md the Governing spec; decomposition.md calls itself the full form of the decomposition block in spec-cell.md. Keep their front matter.

## Constraints
Run `node scripts/audit-citations.mjs` and `npm test` before done; fix cites in the same change. No U+2014. Do not edit inside managed AGENTS.md blocks by hand (rerun the generator `python3 <plugin>/scripts/onboard.py` is NOT allowed: edit only the starter text above the managed block or leave and report). Never push.

## Closed

2026-10-08: delivered by the solo agent (level L1); the ticket's own checks and the fanout gates passed
