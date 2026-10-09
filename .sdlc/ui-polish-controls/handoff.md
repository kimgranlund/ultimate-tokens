---
id: T-0036
title: "Select triggers unstyled, sliders too small, drop the Back to Global button, prime swatches fill the width"
type: bug             # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L2             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
The editor's select triggers, range sliders, palette-context header and prime swatch strips look finished and consistent with the control roles.

## Intent
- Do, four items (user screenshots 2026-10-08):
  1. Select triggers are unstyled: the native-looking select (e.g. the `Group` select in the Color inspector, showing `Brand` with a native chevron) must be styled like the other controls (control height/inset/radius/text roles, token colors, a drawn chevron, focus ring, `appearance: none`) everywhere a `<select>` appears in the shell and overlays.
  2. Range inputs (Hue 210 deg, Chroma 55% sliders in the inspector) are too small: make the track and thumb slightly bigger, sized from the control roles, in Safari and Chrome (`::-webkit-slider-*` and `::-moz-range-*`).
  3. Remove the `Back to Global` button (a pill `Global` with a left caret in the pane header when a palette is selected). Selection context already follows the canvas; deselecting stays by clicking empty canvas and Esc. Keep the keyboard path and any focus logic that button fed.
  4. Prime colors: in the palette list cards the prime swatch strip (seven rounded swatches with gaps, above the full ramp strip) must have no gaps and each swatch must stretch to fill the card width (like the ramp strip below it), no 2x/3x fixed width. Same for the 'Context priority' row of small swatches in the New Palette flow if it shares the component.
- Non-goals: the Maison ladder, control size values, radix tooltips (separate ticket), luminosity (separate ticket).
- Done when: each item is visible in smoke screenshots at product-md and content-lg (add smoke/headless assertions where a check can bite: computed `appearance` none on selects, thumb size >= a floor from roles, no back-to-global button in DOM, swatch gap 0 and widths equal), `npm test`, `npm run build`, `npm run smoke` green.

## Context
Surface: `src/ui/styles.css`, `src/ui/app.js` (pane header and selection), `src/ui/sections/color.js` (prime strips, inspector), `src/ui/overlays/`. Read `.claude/skills/building-editor-sections/SKILL.md`, `docs/specs/app-shell.md`, `docs/references/component-inventory.md` first (button/select/range cards). T-0027 made buttons compound and square-ghost; selects were not covered (control-text gate covers font-size/padding for listed classes: extend its class list if you add classes). The Palette|Global switch was removed in #809; the `Global` pill is its leftover.

## Constraints
Every shell control text/padding reads the cell roles (`test/repo/control-text.mjs`). Doc cites into `src/ui/styles.css`, `app.js`, sections shift: run `node scripts/audit-citations.mjs` and repair in the same change. No U+2014. Hyperscript `h()` only, no framework. Gates via `scripts/gate_lock.py run -- <cmd>` with `SDLC_GATE_WORKERS=10`; `npm run smoke` needs `CHROME_BIN` set to Chrome Beta/Canary. `npm test` before done. The user previews in Safari: reason about WebKit from spec, smoke is Chrome only.

## Acceptance criteria
- At product-md and content-lg every visible shell `<select>` computes `appearance: none`, draws a chevron (`background-image` gradient) and reserves end padding for it (`npm run smoke`, "control polish" check; `test/repo/ui-polish.mjs` pins the rule).
- Range inputs: track height is at least 0.4 times the control icon role and the `--ctl-range-thumb` role (1.25 times the icon role, at least the icon) is what both `::-webkit-slider-thumb` and `::-moz-range-thumb` read (smoke "control polish", `test/repo/ui-polish.mjs`).
- No `.pane-back` button and no `Global` button in the inspector header in a palette context; `_deselect` and Esc still return to Global (headless group `irf`).
- Every `.prime-strip` has gap 0, seven equal-width swatches spanning the strip, and the strip is as wide as the ramp strip below it; the New Palette `Context priority` row is gapless with flex-basis 0 swatches (smoke "control polish", `test/repo/ui-polish.mjs`).
- `npm test`, `npm run build`, `npm run smoke` green; `node scripts/audit-citations.mjs` clean.
