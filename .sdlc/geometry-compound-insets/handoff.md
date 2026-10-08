---
id: T-0027
title: "Compound insets and radius composition for container components (segmented, listbox), square ghost icon buttons, unstyled palette name input"
type: feature        # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L2             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
User request 2026-10-08, with two screenshots (a segmented control, "Mode | Single", whose container has a visible inner padding around the active segment; and the Color left-pane header where the "toggle left pane" icon button is a bordered circle next to the "ANALYSIS Neutral" title):

1. The palette name input is not styled (find it: the palette inspector's name field in `src/ui/sections/color.js`; it should take the shell's input look: `--sh-control-height`, inset, text, radius, border like the other inputs in `src/ui/styles.css`).
2. A system for compound insets, for components that contain repeated parts such as a listbox (options) and a segmented control (segments). The user's rule, in their words: "I usually take half of the composed component and remove it (segment or button/option/trigger/etc) and give it to the container so the net effect and alignment is held. This also needs to be factored in to how radius composes." Interpretation to confirm in the design: the container gets padding equal to half of the child's inset, and the child's own inset shrinks by the same amount, so the child's content stays where it would be without the container and the outer size is unchanged; and the container's radius composes as the child's radius plus that container padding (concentric corners), so the child's rounded corner stays concentric with the container's. Express this in the geometry engine as per-cell fields or derived roles (names consistent with the existing `--control-*`, `--chip-*`, `--radius-*` roles and the prefix contract), emitted through CSS, DTCG, Figma, MCP and the consumer skills the same way as the other roles, and used by the app shell's `.segmented` rule (`src/ui/styles.css`) and any listbox or menu component in the shell.
3. Icon buttons should be square when all inset and icon/glyph container sizes add up (width = height = control height; icon box centered), borderless and ghost (no border, transparent until hover/active). Apply to the shell's icon-only buttons (the left-pane toggle in the header, and other icon-only buttons found with a repo search).

## Intent
- Start with an architect pass (read-only): how compound insets and concentric radius belong in `src/engine/geometry.mjs` (27 cells, 14 fields per cell, `radiusControl`/`radiusMark`/`radiusInset`/`radiusCard`, the Maison source in `/Users/kimgranlund/Projects/maison/ui-kit-maison`: check whether Maison already defines a container/compound rule and match it if so), how it flows through every emitter and the Figma variables (and the persist schema if any stored shape changes; main is at schema 9), and what the app shell needs. Decisions the user must rule on go into `## Missing decisions`.
- Then plan, build and verify as a chain. Gates: `npm test`, `npm run build`, `npm run smoke` (real Chrome), the resolver cases in `test/smoke/smoke.mjs` extended to the new roles, and a pixel check by screenshot of the segmented control, listbox and icon buttons at product-md and content-lg.
- Sequencing and collisions: tickets T-0025 (Color inspector fixes: `src/ui/app.js`, `color.js`, `styles.css`), T-0021 (compute layers: `model.mjs`, `persist.js`, `tonal.js`, `exports.js`) and T-0026 (Figma legacy renames: `figma/`, `apply-gate.js`) are in flight. Plan the engine and emitter steps first (they touch `geometry.mjs`, `ds-export.js`, `figma/binder/mode-apply-plan.mjs`, tests, skills, docs) and the shell UI steps last, after T-0025 lands. Also fold in the independent reviews' shell findings: `.sdlc/notes.md` and the review summaries in this ticket's `## Plan review` once the conductor adds them.

## Constraints
- Zero runtime deps, engines pure and DOM-free, vanilla web component, `h()` hyperscript. No U+2014. Quote font-family names. One push, one PR; gates local through `gate_lock.py` with `SDLC_GATE_WORKERS=10`; run `gate:sweeps` as its eight legs.
