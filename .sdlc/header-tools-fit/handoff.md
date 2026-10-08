---
id: T-0031
title: "Canvas header trailing tools collapse into a menu when they do not fit (content-lg clipping)"
type: feature        # feature | bug | chore | spike | idea
status: done     # proposed | ready | blocked | done | dropped (build progress lives in /board)
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

## Acceptance criteria
- `npm test` exits 0 (58 files; includes the headless group `(cht1)` to `(cht21)` in `test/ui/headless-boot.mjs` and the citations and control-text gates).
- `npm run build` exits 0.
- `CHROME_BIN=<chrome> npm run smoke` exits 0, with these legs passing in `test/smoke/smoke.mjs`: "canvas header at product-md" (tools inline, nothing outside the header, header inside the center column), "canvas header at content-lg" (tools collapsed behind the trigger, same fit measures, in Color, Typography and Geometry), the negative control (forcing the tools inline at content-lg makes the same measures fail), and the four "overflow menu" legs (opens inside the window with Fit, zoom and + Palette; zoom keeps it open and moves the readout; Esc closes it and returns focus to the trigger; Fit resets zoom, closes it and refocuses the trigger).
- `node scripts/audit-citations.mjs` exits 0 and `node test/repo/em-dash.mjs` is clean.
- At the two smoke geometries (product-md, content-lg) in the 1440px window the Color, Typography and Geometry headers fit the center column (header `scrollWidth` not over `clientWidth`, every visible header control inside the header box, header right edge not past the right pane); all three headers build their trailing tools through the one `canvasTools` method in `src/ui/app.js`.

## Decisions
- The ticket named only the trailing tools, but at content-lg the segments alone fill the column (Typography leading controls need 922px of 850px), so a second step (`.tools-compact`, segments at one control inset of padding per side, the same tightening the narrow-window media rule applies) engages only when the collapsed header is still too wide. `.center` also gained `grid-template-columns: minmax(0, 1fr)`: its implicit auto track grew to the header's content and ran the header under the right pane, which is what clipped the tools. A throwaway probe (not committed) measured all nine tier x scale cells x three sections at 1440px: every header fit; only content-md and content-lg collapse the tools, only content-lg also compacts.

## Closed

2026-10-08: delivered by the solo agent (level L2); one independent batched verifier passed before the merge
