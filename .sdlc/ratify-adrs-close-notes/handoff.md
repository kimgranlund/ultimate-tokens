---
id: T-0046
title: "Ratify ADR-035 and ADR-036 (user ruling 2026-10-09) and close the two resolved PR #813 notes"
type: chore           # feature | bug | chore | spike | idea
status: done        # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L2             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-09
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
The user ruled on 2026-10-09 to ratify ADR-035 and ADR-036 and to close two resolved PR #813 notes. The records say so, and every gate stays green.

## Context
- `docs/references/decision-records.md`: the ADR-035 Status line (about :1383) and the ADR-036 Status line (about :1448) read `PROPOSED ... Ratification is the owner's: the owner edits this line to DECIDED`. Edit each to `DECIDED 2026-10-09` followed by one clause "ratified by the owner (user ruling 2026-10-09)", keeping the amendment-shape sentence. Do NOT touch ADR-037 (still in PR #827) or any other ADR.
- `.sdlc/notes.md` line ~41: the `note:` item "two PR #813 pixel-review items stay open ... the faint light-theme headings and the micro-sm switch" is resolved by T-0044 (kickers use the dim ink, the switch is on the cell anatomy row; the user approved closing it). Replace that one note with a one-line `resolved:` entry naming T-0044 and the date; do not rewrite other notes.

## Acceptance criteria
- `grep -c "DECIDED 2026-10-09" docs/references/decision-records.md` prints at least 2 and the ADR-035 and ADR-036 Status lines no longer say PROPOSED: `! awk 'NR>=1357 && NR<=1480 && /\*\*Status/' docs/references/decision-records.md | grep -q PROPOSED`
- `grep -q "resolved" .sdlc/notes.md` and the PR #813 pixel-review note is gone: `! grep -q "two PR #813 pixel-review items stay open" .sdlc/notes.md`
- `node test/repo/em-dash.mjs` and `node test/repo/citations.mjs` pass, and `npm test` passes.

## Closed

2026-10-09: ADR-035, ADR-036 and ADR-037 ratified by the user (2026-10-09 ruling) and the resolved PR #813 notes closed; verified by npm test and the em-dash and citation gates.
