---
id: T-0035
title: "Header tools fit smoke fails on CI Chrome at content-lg (typography 896 > 850, geometry 880 > 850)"
type: bug             # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L2             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
`npm run smoke` passes on CI (GitHub Actions Chrome, Linux) as well as locally: at content-lg the Typography and Geometry canvas headers fit the center column with the tools collapsed.

## Intent
- Do: find why the CI header content is wider than locally, and fix the header measurement or layout so it fits in both. Add a regression check that can fail in the headless shim or smoke without needing CI.
- Non-goals: changing control sizes, the Maison ladder, or removing the overflow menu.
- Done when: smoke's `canvas header at content-lg` leg is green with the evidence below addressed, `npm test` and `npm run build` green, and you state which hypothesis was right and how you checked it.

## Context
PR #820 (T-0031 header tools menu) is green locally (Chrome Beta) but CI `build-test` fails `npm run smoke` with: `typography: header content 896 wider than its 850`, `geometry: header content 880 wider than its 850`, outside the header: tools-menu 1122-1186 (typography) and 1106-1170 (geometry), `canvas header at content-lg ... (4 off)`. Color passes. product-md passes. The negative control passes (1333 vs 850). Locally all nine tier/scale cells fit at 1440px.
Candidate causes to test, cheapest first: (1) `_fitCanvasHeader()` / `_measureCanvasHeader` in `src/ui/app.js` measures before bundled fonts finish loading, so a later font swap widens the section/segment labels with no refit: refit on `document.fonts.ready` and observe the header with a ResizeObserver; (2) a segment label (section-seg or canvas-seg) differs by fallback font width on Linux; (3) the `.tools-compact` step is not enough for the widest section labels: add a final step (hide labels, or icon-only trailing segments) when still too wide. The measurement code is in `src/ui/app.js` near `canvasTools`, `_fitCanvasHeader`; the smoke check is `headerFitExpr` in `test/smoke/smoke.mjs` (~:366). You can emulate a wider font locally by temporarily forcing a fallback family or `letter-spacing` in a throwaway probe to prove the failure path and the fix.
Read `.claude/skills/building-editor-sections/SKILL.md` and `docs/specs/app-shell.md` first.

## Constraints
Doc cites into app.js/styles.css shift: run `node scripts/audit-citations.mjs` and repair in the same change. No U+2014. Gates through `scripts/gate_lock.py run -- <cmd>` with `SDLC_GATE_WORKERS=10`. Smoke needs `CHROME_BIN` pointing at Chrome Beta/Canary on this host. `npm test` before done.
