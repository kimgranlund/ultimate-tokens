---
id: T-0023
title: "Retire docs/assets/geometry-tokens.json, the frozen six-size snapshot (T-0017 follow-up)"
type: chore           # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L2             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
`docs/assets/geometry-tokens.json` is a hand-kept snapshot of the retired six-size ramp (XS to 2XL keys, `caret`, `font`, `gap`); nothing reads it and no generator rewrites it (T-0017 filer note, ADR-032). Retire it.

## Intent
- First prove nothing reads it: `git grep -n "geometry-tokens.json"` outside `.sdlc/`, `docs/archive/` and dated reports. If any live reader exists (a test, script, README link, `docs/references/geometry/README.md` which calls it a frozen snapshot), repoint or remove that reference in the same change; if a reader needs real data, regenerate from `geomTokensDTCG(geomScale({}))` instead and say so.
- Delete the file, update `docs/references/geometry/README.md` and any index that lists it, keep `node test/repo/citations.mjs` and the docs layout tests green.
- Do not touch the dead `capped` row flag in `src/engine/tonal.js` (T-0021 owns that file for now).

## Constraints
- No U+2014. `npm test` green via `scripts/gate_lock.py run --name npm-test -- npm test`. Docs and assets only.
