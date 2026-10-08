---
id: T-0025
title: "Color inspector follow-ups from the PR #814 review (Mapping/Radix reachability, drag-reorder context flip, keyboard path back to Global)"
type: bug             # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L2
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
Fix the defects an independent review found in the merged context-driven Color inspector (PR #814, ticket T-0020; `git show 0a167948`). Findings, in priority order, with the reviewer's evidence:

1. MAJOR `src/ui/sections/color.js` `renderRadixScene` (~:1036) and the Mapping `map-row` (~:1281): no row calls `selectPalette`, so in the Mapping and Radix views a mouse user cannot reach the palette inspector (before #809 the Palette tab was one click away). Make radix and map rows select their palette.
2. MAJOR `color.js` ~:1553: a drag-reorder sets `this.sel = { kind: "palette", id: <previous selection> }`, so dropping a row from the Global context flips the inspector to a palette the user never clicked. Keep `this.sel.kind` as `_restore` does (`src/ui/app.js` ~:421).
3. MAJOR `app.js` ~:1944 and `color.js` ~:914: the context switch is keyboard-invisible (ramp rows are click-only divs; leaving a palette needs Esc and entering needs ArrowUp/Down, both swallowed while focus is in a text, number or select field). Add a visible, focusable way back to Global in the palette inspector header (a button in `.pane-head`); ideally Esc blurs a focused inspector field first and the second Esc deselects.
4. MINOR a11y: the context has no accessible cue. Make the pane title say `Palette: <name>` or `Global`, and give the aside `aria-label="Inspector"`.
5. MINOR focus: after Esc or an empty-canvas click the focused palette control disappears and focus falls to body; move focus to the pane title or the first Global control.
6. MINOR `app.js` ~:1879-1883: the empty-canvas click handler exempts only `.ramp-row`; also exempt `.map-wrap` and `.radix-scene` so clicking a Mapping select or input under a selected palette does not deselect.
7. MINOR stale docs: `docs/references/ui-plan.md:50` (Color row still says "palette and global, plus a story tab"); `docs/references/component-inventory.md:84` summary row still counts 15 segmented sites (the detail at :161 says 14).

## Intent
- Fix all seven. Tests in `test/ui/headless-boot.mjs`: a lettered group asserting (a) a Radix row and a Mapping row select their palette and the palette inspector shows, (b) a drag-reorder from Global leaves the inspector on Global, (c) the palette inspector has a focusable control that returns to Global and Esc still works, (d) the pane title names the context, (e) a click inside the Mapping wrap does not deselect. Include a negative control per behavior change.
- Keep `node test/repo/citations.mjs` green (`node scripts/audit-citations.mjs` for corrected homes).

## Constraints
- Vanilla web component, `h()` hyperscript. No U+2014. `npm test` via `scripts/gate_lock.py run --name npm-test -- npm test`. Files: `src/ui/app.js`, `src/ui/sections/color.js`, `src/ui/styles.css`, `test/ui/headless-boot.mjs`, the two docs, cites. Do not touch engines, persist or `figma/` (T-0021 owns model/persist/tonal).
