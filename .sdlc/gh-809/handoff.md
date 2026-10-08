---
id: T-0020
title: "Color inspector: drop the Palette|Global switch, show context by selection (#809)"
type: feature
status: done
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

## Acceptance criteria
- The Color right pane (`renderRightPane`, `src/ui/app.js`) renders no Palette | Global | Story switch: no `role=tablist`, no `tab:*` focus key and no "Inspector" labelled segmented control inside `.right-pane`. `this.segment` and `setSegment()` are gone from `src/` (`grep -rn "setSegment\|this\.segment\b" src/ui/app.js src/ui/sections/color.js` prints nothing), and so is the `selectPalette(id, { tab })` option.
- Context follows the selection (`this.sel.kind`): a freshly opened doc has `kind: "none"` and shows the Global inspector; `selectPalette(i)` (canvas row, rail row, arrow keys, add / duplicate / delete) shows the palette inspector; Esc and a click on empty canvas return to Global. Undo and redo (`_restore`) keep the current context instead of forcing a palette selection.
- A set that carries a story renders it as a section at the foot of the Global inspector (the former Story tab); a set without one renders none. The `1` and `2` keys no longer switch panels. Typography and Geometry inspectors keep their own tabs.
- `node test/ui/headless-boot.mjs` exits 0 and its new group `(ic)` asserts (a) fresh doc, no selection, Global inspector and zero switch markup, (b) selected palette, palette inspector, (c) Esc and empty-canvas click return to Global, (d) no segment state, `1` / `2` inert, undo keeps Global. Control (ic0) builds the retired switch with `app.segmented` and shows the detector finds it, and the group was red against the pre-change `src/` (11 failures) before the edit. Group `(g786)` is rewritten to assert every step path lands on the palette inspector; `(o4)` asserts the Color panel is no `tabpanel`.
- `docs/specs/app-shell.md` (SPEC-R11, LLD-C7, the `this.sel` row, the no-story failure row, the SPEC-R3/R4 rows), `docs/references/component-inventory.md` (segmented site count 15 to 14, inspector-tab bullet), `docs/references/glossary.md` (Inspector) and `docs/references/ui-plan.md` (amendment) describe the context inspector; `CHANGELOG.md` has an entry. Every line-number citation shifted by the `src/ui/app.js`, `src/ui/sections/color.js`, `src/ui/styles.css` and `test/ui/headless-boot.mjs` edits was remapped from the exact git hunks, and `node test/repo/citations.mjs` is green.
- `scripts/gate_lock.py run --name npm-test -- npm test` is green (all 54 files, including `repo/citations.mjs` and `repo/em-dash.mjs`); the regenerated `figma/plugin/ui.html` is committed. No file under `src/engine/` or `figma/` other than that generated bundle changed. `npm run build` (needs `npm ci`) and `npm run smoke` (needs Chrome) were not run in this lane; smoke asserts nothing about the Color inspector tabs.

## Closed

2026-10-07: delivered by the solo agent (level L2); one independent batched verifier passed before the merge
