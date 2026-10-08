---
id: T-0032
title: "Add the hue constancy gate to test/engine/anchor.mjs (PR #810 review Major)"
type: chore           # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L1             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
`test/engine/anchor.mjs` gates hue constancy: an anchored OKLCH ladder holds the anchor's OKLCH hue, and CAM16 perceptual stops with C >= 5 hold `anchor.cam.hue`, counting solver fallbacks.

## Intent
- Do: add the gate with a negative control that fails when a rung's hue is perturbed; tolerance justified from measured data.
- Non-goals: any change to `src/engine/prime.mjs` or `tonal.js` (memoization, achromatic cutoff and label wording stay in notes.md).
- Done when: `node test/engine/anchor.mjs` passes and the negative control bites; `npm test` green.

## Context
PR #810 review (the reviewer's Major, held in `.sdlc/notes.md` 'PR #810 review follow-ups') until T-0021 landed; it is on main now (#819). ADR-031 (hue space anchored): the ladder holds the anchor's hue in the chosen space via `solveCam16Hue`, `solveOkhslHueForCam16`, `rungHue`. Read `docs/reports/2026-10-07-hue-space-anchored.md`. `test/engine/anchor.mjs` loads `layers.mjs` since T-0021.

## Constraints
Test-only. No engine or UI edits. No U+2014. `npm test` runs before done.
