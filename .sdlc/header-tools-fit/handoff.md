---
id: T-0031
title: "Canvas header trailing tools collapse into a menu when they do not fit (content-lg clipping)"
type: feature        # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L2             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
At every geometry tier and scale the canvas header shows all its tools: when its trailing tools (recenter, zoom out, zoom level, zoom in, + Palette) do not fit the center column, they collapse into one overflow menu instead of clipping.

## Intent
- Do: collapse the trailing canvas-header tools into an overflow menu when they do not fit. Use a native `<dialog>`/popover consistent with existing overlays, control roles for sizing, keyboard focus and `data-fk` keys like neighbours.
- Non-goals: wrapping or scrolling the header; changing control heights; the Maison ladder.
- Done when: at product-md and content-lg (smoke geometries) no header tool is clipped or hidden past the column edge, a smoke or headless check asserts horizontal fit at content-lg, and `npm test`, `npm run build`, `npm run smoke` are green.

## Context
User ruling 2026-10-08 (/sdlc-lite:ask): collapse into a menu. Evidence: T-0027 follow-up 1, `smoke-out/compound-content-lg.png` after T-0027 (#818): the recenter button is cut at the center column's right edge, zoom out/level/in and + Palette are hidden. `.canvas-header` rule in `src/ui/styles.css` is unchanged since f60e5d14; nowrap applies via the base button rule. No gate checks horizontal fit today. Read `docs/references/component-inventory.md` for the header anatomy, `.claude/skills/building-editor-sections/SKILL.md` and `docs/specs/app-shell.md` before editing. Safari is the user's preview browser; smoke is Chrome only.

## Constraints
Every shell control text/padding reads the cell roles (`test/repo/control-text.mjs` gate). No U+2014. Doc cites into `src/ui/styles.css` and `app.js` shift: repair with `node scripts/audit-citations.mjs` in the same change. Do not add a framework; hyperscript `h()` only. `npm test` runs before done.
