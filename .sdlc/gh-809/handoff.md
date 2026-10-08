---
id: T-0020
title: "Color inspector: drop the Palette|Global switch, show context by selection (#809)"
type: feature
status: ready
size: L2
priority: P2
depends: []
created: 2026-10-08
router: .sdlc/AGENTS.md
---

## Goal
GitHub #809. Remove the Palette | Global segmented switch from the Color right inspector (`renderRightPane`, `src/ui/app.js` near line 1938, where `tabs` holds `palette` and `global`). The inspector becomes context-driven.

## Intent
User ruling 2026-10-07: when the user selects a palette item on the canvas, the palette context is shown. Otherwise the Global context is shown by default. No toggle.
- Default and fallback context is Global: on load, after the selected palette is deselected, and when nothing is selected.
- Selecting a palette (canvas click, rail row, `selectPalette(id, { tab })` from #786) shows the palette inspector; give the user a way back to Global: clicking empty canvas and Esc clear the selection. Keep it small; reuse the existing selection state rather than adding a new store.
- The existing `selectPalette(id, { tab = false } = {})` option and the `inspTab`/tab state it writes may become unnecessary; remove what is dead, keep what other tabs (Typography, Geometry inspectors) still use.
- Tests: `test/ui/headless-boot.mjs` gets a lettered group asserting (a) fresh doc with no selection renders the Global inspector and no Palette|Global switch, (b) selecting a palette renders the palette inspector, (c) deselect returns to Global; update any existing group that clicked the switch. Include a negative control (the switch markup is gone).
- Update `docs/specs/app-shell.md` or `docs/references/component-inventory.md` only if a cite or description of the switch exists there; `node test/repo/citations.mjs` must stay green (use `node scripts/audit-citations.mjs` for corrected homes).

## Constraints
- Vanilla web component, `h()` hyperscript, no framework. No U+2014. `npm test` green via `scripts/gate_lock.py run --name npm-test -- npm test`.
- Files likely: `src/ui/app.js`, `src/ui/sections/color.js`, `test/ui/headless-boot.mjs`, docs cites. Do not touch engine files or `figma/`.
