---
id: T-0028
title: "Settings overlay: the Mapping nav item takes focus whenever any page is clicked"
type: bug             # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L1
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
User report 2026-10-08 (screenshot: Settings overlay, left nav): "odd focus setting. When I click Account (or any other page) the Mapping tab gets focus." Mapping is the first nav button, and it shows a blue focus ring while Account is the selected page. The independent pixel review saw the same ring on Mapping while Appearance was selected.

## Intent
- Probable cause (a guess, verify it): every click re-renders, which rebuilds the `<dialog>` and `src/ui/overlays/settings.js` (line ~19-20) calls `d.showModal()` on the new element, and `showModal()` focuses the first focusable descendant, the Mapping button. Fix so focus follows the user: after a page change keep focus on the clicked or selected nav item (or on the dialog itself with `tabindex="-1"` when opened by mouse), and on first open focus the selected page's nav item or the close button, not the first item. Prefer not to re-create the dialog if a smaller change keeps the same element.
- Keyboard users must still be able to Tab through the nav and Esc must still close. Do not suppress the focus ring on keyboard focus.
- Test in `test/ui/headless-boot.mjs`: a lettered group that opens Settings, clicks the Account nav item, and asserts the focused element (`document.activeElement` as the shim supports it, or the focus-calling spy the file already uses) is not the Mapping item; negative control: the assertion fails on the old behavior. Check the shim's limits in the `building-editor-sections` skill before writing it.

## Constraints
- Vanilla web component, `h()` hyperscript. No U+2014. `npm test` via `scripts/gate_lock.py run --name npm-test -- npm test`. Files: `src/ui/overlays/settings.js` and `test/ui/headless-boot.mjs` only (plus the generated `figma/plugin/ui.html`). T-0025 owns `app.js`, `color.js`, `styles.css`.
