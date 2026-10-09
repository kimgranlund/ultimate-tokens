---
id: T-0043
title: "Radix step tooltip: render outside the canvas scene (no clipping, no zoom scaling, upright text)"
type: bug             # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L2             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
The Radix step tooltip (T-0037, `RADIX_STEP_GUIDE`, `.radix-step[data-tip]`) is fully visible wherever the swatch is on the canvas, keeps a constant readable size at any canvas zoom, and renders upright.

## Intent
- Do: stop drawing the tooltip as a `::after` inside the zoomed `.canvas-scene`. Render one shared tooltip element outside the scene (a native popover or a single absolutely positioned element on the app root), positioned from the swatch's bounding rect with flip logic (below by default, above near the bottom edge, shifted left near the right edge), shown on hover and on `:focus-visible`/focus, hidden on blur, scroll/pan and Esc. Keep one data source (`RADIX_STEP_GUIDE`), `tabindex`, `aria-label` and the accessible text; add `aria-describedby` or the popover's own semantics so screen readers hear it. Text upright (the swatch is an `<i>`; do not inherit italics) and sized from the control text roles.
- Non-goals: changing the table, the swatches, Radix values.
- Done when: headless tests cover show, hide, flip position for a swatch near the bottom and right edges (rect math in a pure helper unit-tested), smoke hovers a swatch at the canvas bottom edge and at 25% zoom and asserts the tooltip box is inside the window and its font size equals the unzoomed size, `npm test`, build and smoke green.

## Context
Verifier findings on T-0037 (report `.sdlc/radix-role-tooltips/verifier-L2.md`): clipped by `.canvas-area { overflow: hidden }` when a swatch is within about 56px of the canvas bottom or about 220px of the right edge; the tooltip scales with the zoomed `.canvas-scene` (about 3px text at 25%); text renders italic because the swatch is an `<i>`. Code: `src/ui/sections/color.js` (the Radix scene, `renderRadixScene`, swatch push), `src/ui/styles.css` (`.radix-step::after`), `src/engine/exports.js` (`RADIX_STEP_GUIDE`), tests `test/ui/headless-boot.mjs` group rx10. Read `.claude/skills/building-editor-sections/SKILL.md` and `docs/specs/app-shell.md`. The user previews in Safari: use standard popover/positioning APIs, reason about WebKit.

## Constraints
Hyperscript `h()`, no framework, no new deps. Control text and padding read the cell roles (`test/repo/control-text.mjs`). Doc cites shift: `node scripts/audit-citations.mjs` in the same change. No U+2014. Gates via `scripts/gate_lock.py run --` with `SDLC_GATE_WORKERS=10`; `npm run smoke` needs `CHROME_BIN` (Chrome Beta/Canary). Never push.
