---
id: T-0037
title: "Radix colors: hover tooltip with each step's role and intent"
type: feature        # feature | bug | chore | spike | idea
status: done     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L2             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
Each step swatch of a Radix 12-step scale shows a tooltip on hover with the step's role and intent (for example step 1 app background, step 9 solid fill).

## Intent
- Do: wherever the app renders the Radix 12-step scales as swatches (the Radix color view/export preview in the right pane or export drawer, rows of 12 swatches per palette), add an accessible hover and focus tooltip per step: `Step N: <role>` and one line of intent. Use the existing tooltip mechanism if the app has one, otherwise a small native popover or `title` fallback consistent with the shell (keyboard focus shows it too; not hover-only).
- Non-goals: changing Radix step values, the exports, or the role table.
- Done when: every one of the 12 steps carries role and intent text from ONE data table (single source in `src/engine/` or the existing Radix module, with a test that it has 12 entries and no empty strings), tooltips appear on hover and focus in a headless test, `npm test` and smoke green.

## Context
The Radix mapping is documented in the export format docs (`docs/references/knowledge-04-export-formats.md`, `src/engine/exports.js` radix emitter, `docs/references/` Radix notes). Radix's published step usage: 1 app background, 2 subtle background, 3 UI element background, 4 hovered UI element background, 5 active/selected UI element background, 6 subtle borders and separators, 7 UI element border and focus rings, 8 hovered UI element border, 9 solid backgrounds, 10 hovered solid backgrounds, 11 low-contrast text, 12 high-contrast text. Verify against the repo's own docs before writing the table. Find where the 12-step swatch rows render (grep `radix` in `src/ui/`).

## Constraints
Every shell control text/padding reads the cell roles (`test/repo/control-text.mjs`). Doc cites into `src/ui/styles.css`, `app.js`, sections shift: run `node scripts/audit-citations.mjs` and repair in the same change. No U+2014. Hyperscript `h()` only, no framework. Gates via `scripts/gate_lock.py run -- <cmd>` with `SDLC_GATE_WORKERS=10`; `npm run smoke` needs `CHROME_BIN` set to Chrome Beta/Canary. `npm test` before done. The user previews in Safari: reason about WebKit from spec, smoke is Chrome only.

## Acceptance criteria
- `RADIX_STEP_GUIDE` in `src/engine/exports.js` has exactly 12 entries (steps 1 to 12 in order), each with a non-empty `role` and `intent`, and the 12 roles are distinct: `node test/ui/headless-boot.mjs` asserts this as (rx10a) to (rx10d).
- Every `.radix-step` swatch in the Radix canvas view carries `data-tip` = `Step N: <role>` + newline + intent from that table, `tabindex="0"`, and a spoken `aria-label`: (rx10e) to (rx10h).
- `src/ui/styles.css` draws the tooltip with `.radix-step::after { content: attr(data-tip) }` and shows it on `:hover` and `:focus-visible`; the ladder no longer clips with `overflow: hidden`: (rx10i) to (rx10k).
- `npm test` passes (58 files) and `node scripts/audit-citations.mjs` reports no STALE or NOFILE line.
- `CHROME_BIN="/Applications/Google Chrome Beta.app/Contents/MacOS/Google Chrome Beta" npm run smoke` prints SMOKE PASS.
- No change to Radix step values, exports, or the role table.

## Closed

2026-10-08: landed via integration; verified L2 pass
