---
id: T-0024
title: "Gate A narrowing from #807: can the chroma-envelope gate cover stops where OKHSL keyS reads above 1?"
type: spike           # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L1             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
Design only. PR #807 (gh-778, ADR-029) narrowed Gate A in `test/engine/chroma-envelope-gate.mjs`: its rule 2 (each stop's model against stop 500's) excludes stops where the unanchored OKHSL `keyS` reads above 1, so it checks 122,733 of 146,000 anchored and 80,228 of 146,000 gate-path OKHSL stops (filer follow-up in `.sdlc/gh-778/filer-L1.md`).

## Intent
Answer: (1) why keyS above 1 happens and what the engine does there; (2) whether the exclusion hides a real defect or is an inherent clamp; (3) the smallest engine or gate change that covers those stops without weakening the gate, with exact files and functions; (4) the risk to byte-neutrality (`scripts/report-preset-fidelity.mjs --identity-control`); (5) a recommendation: do it, or document the exclusion as inherent and close. `src/engine/tonal.js` is also an edit target of ticket T-0021 (compute layers U5): name the colliding lines. Read `.sdlc/gh-778/architect-L1.md`, ADR-029, `tonal.js` (`holdTone`, `evenChroma`, the OKHSL `s` clamp) and the gate. No repo edits.

## Constraints
Read-only. Output the architect manifest only.
