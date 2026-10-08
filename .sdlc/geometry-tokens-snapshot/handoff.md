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

## Acceptance criteria
- `docs/assets/geometry-tokens.json` is gone from the tree (`test ! -e docs/assets/geometry-tokens.json` exits 0, and `git ls-files docs/assets` no longer lists it). `docs/assets/typography-tokens.json` and the other `docs/assets` files are untouched.
- No live reader or reference remains: `git grep -n "assets/geometry-tokens.json" -- . ':!.sdlc' ':!docs/archive' ':!docs/reports' ':!docs/assets/docs-reconcile-path-map.tsv'` prints nothing. The proof that nothing read the file at runtime is that this search, run before the delete, found only `docs/references/geometry/README.md`, the path map row and a dated report, and no test, script, generator or source file.
- `docs/references/geometry/README.md` no longer calls the file a frozen snapshot "kept for history"; it still names `geomTokensDTCG(geomScale({}))` as the live shape. The path-map row at `docs/assets/docs-reconcile-path-map.tsv` line 27 is deliberately left: it is ADR-028's record of the 2026-10-06 move, `.sdlc/checks/card-amendment-check.sh` skips a row whose target is gone, and the dated report `docs/reports/2026-10-07-geometry-maison-ladder.md` keeps its follow-up note as evidence.
- `python3 <plugin>/scripts/docs_check.py --root .` reports 0 errors and no more than the baseline 25 warnings (B-2a 13, D-10 2, D-11 10); `node test/repo/citations.mjs` exits 0; `sh .sdlc/checks/card-amendment-check.sh` prints `stale total: 0`.
- `npm test` is green through `scripts/gate_lock.py run --name npm-test -- npm test` (run from the sdlc-lite plugin's scripts folder), and `git status` is clean after it. No U+2014 is introduced.
- Only `docs/assets/geometry-tokens.json`, `docs/references/geometry/README.md` and this handoff changed. `src/engine/tonal.js` is untouched.
