<!-- role=verifier level=L2 model=sonnet effort=high -->
## Verdict
pass

## Criteria
- `node test/ui/tip-position.mjs` exits 0: pass. Evidence: run on the built tree prints "tip-position PASS, below by default · above near the bottom · shifted left near the right · corner · clamps · window sweep", exit 0. Seen red: in a throwaway worktree with `fitsBelow = true` it prints "swatch at the bottom edge: above (got ... placement below)" and "78 swatch positions on the sweep put the tip outside the window".
- `node test/ui/headless-boot.mjs` with (rx10i) to (rx10l) and (rx11a) to (rx11s): pass. Evidence: green inside `npm test` (61 files). Seen red: the same flip break makes it print "HEADLESS BOOT FAIL: (rx11h) a swatch at the bottom edge flips the tooltip above (top 916px)", 1 failed assertion.
- `npm test` exits 0, 61 files, citations gate clean: pass. Evidence: "all 61 test files passed"; `node scripts/audit-citations.mjs` exits 0 and prints `STALE 0 ... NOFILE 0` on every section (the non-zero grep count was the word STALE in those summary lines, not findings); tracked tree clean afterwards.
- `CHROME_BIN=<Chrome Beta> npm run smoke` prints SMOKE PASS with the real-Chrome tooltip checks: pass. Evidence: ran twice with Chrome Beta; "SMOKE PASS, gallery · category · editor · export dialog all render in a real browser". It lists all 22 `radix tooltip` checks green (100% and 25% zoom, bottom and right edge: open popover, clip-free, inside the window, upright, flipped above; 25% size 12px/58px equals unzoomed; keyboard focus shows it; Escape hides it and stays on Radix). Seen red: a throwaway worktree with the flip broken (built, `node test/smoke/smoke.mjs`) gives 4 failures ("the box is inside the window (490,755,710,813 in 1440x813)", "flipped above the swatch (placement below)") and "SMOKE FAIL (4)".

Independent real-Chrome CDP probe (my own script, real mouse, wheel and key events; Chrome Beta; 1440x813), light and dark, bottom edge, right edge and middle row, at 100% and 25% zoom, 24 cases, all pass:
- Exactly one `.radix-tip` element, `position: fixed`, `transform: none`, `font-style: normal`, outside `.canvas-area` and `.canvas-scene`, open as a popover, fully inside the window.
- Bottom edge flips above, middle row opens below, and the tooltip never covers the swatch.
- Font size 12px and box size identical across zoom, e.g. 220x58.39 at both 100% and 25%, in every theme and position.
- `aria-describedby="radix-tip"` is on the active swatch only while shown, and is removed on mouse-out.
- Hides on real mouse-out, Esc (the view stays on Radix), a real wheel pan, a real ctrl-wheel zoom, blur, and `render()`; still one element after re-render.
- Keyboard: focus shows it; a real Tab key moves it from step 1 to step 2 with `aria-describedby` moving too; focus on the last swatch at the bottom and right edges shows it inside the window.
- `popover="manual"` fallback: with `HTMLElement.prototype.showPopover` and `hidePopover` deleted before page load, the same 24-case matrix and the Esc, pan, zoom, Tab and blur checks all pass (the `.open` class drives display; `ALL OK`).
- The window-right "shift left" case is not reachable in the real layout (the inspector keeps the canvas about 300px or more from the window edge: tip box 1110..1330 in 1440, 570..790 in 900), so it is covered only by `placeTip` and rx11j. A swatch at the canvas right edge does run past the canvas into the inspector area and stays in the window.
- One probe failure, "focus on step 1 shows", was my own harness: `fit()` settles on the next frame and calls `applyTransform`, which hides the tooltip. Re-focusing after the settle passes. This is the same effect the smoke test comments on; user Tab and hover do not call `fit()`.

## Out of scope changes
None. The diff from f709f736 is `src/ui/app.js`, `src/ui/sections/color.js`, `src/ui/styles.css`, `src/ui/tip-position.mjs`, `scripts/bundle.mjs` (registers the new module), `test/run.mjs`, `test/smoke/smoke.mjs`, `test/ui/headless-boot.mjs`, `test/ui/tip-position.mjs`, regenerated `figma/plugin/ui.html`, and the citation line shifts in `docs/specs/app-shell.md`, `docs/references/component-inventory.md` and `docs/reports/2026-08-20-reactivity/*` that the criteria require. No U+2014 in the new files.

## For the next attempt
None
