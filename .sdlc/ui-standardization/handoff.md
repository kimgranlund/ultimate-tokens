---
id: T-0044
title: "UI standardization: shell type roles, container and control anatomy, glyph motion, product-sm default"
type: feature        # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L4             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
The editor shell is one standardized UI: a single text-role system, one inset and radius composition rule for every container, one anatomy table for every control, one glyph motion set, all derived from the Maison ladder cell, with the shell defaulting to the product tier, sm scale, md size.

## Intent
- Do: scope from the user's query 2026-10-09 (rulings in Context). Four parts:
  1. Type roles for the shell, derived from the cell's `UI_TEXT` text by fixed steps (never independent px): pane header title; pane element header title; content kicker / group header title; field label and checkbox / radio label; control content; chips, segmented control and button text; plus helper/caption text. Each role defines size step, weight, line-height, tracking and case as `--ui-*` custom properties set once in the `--sh-*` alias block (`src/ui/styles.css`), and a gate extending `test/repo/control-text.mjs` forbids literal font sizes in shell rules.
  2. Container insets and composition: apply the compound law (ADR-033) uniformly to list-box, segmented control, menu, tab row, switch track, input group; define how a container wrapping a composed button or trigger splits the difference (container inset = half the part inset, part keeps full height); a radius composition table (container radius = part radius + padding; a wrap uses `radiusCard` outside and `radiusControl` inside).
  3. Control anatomy: one table per kind (button, input, select, trigger, chip, icon-only, switch) giving inset, inner gap, glyph container size, glyph size, caret container size, caret size as ratios of the cell's `icon`, `inset`, `partInset`; icon-only buttons stay square and ghost; the select chevron lane (`--select-lane`, T-0036) joins the table.
  4. Glyph motion: one duration/easing token set for menu caret rotate, chevron, disclosure, listbox check; honors the existing `motion` app pref and `prefers-reduced-motion`; a test asserts reduced motion disables it.
- User approval 2026-10-09 of the architect's tables (architect-L1.md) with one change: chips and segmented controls use the BUTTON/CONTROL text size (`--ui-control`, step 0), not the compact chip row. Only badges and tags (`.acct-badge`, `.radix-badge`, `.tok-sub`, `.geom-chip`, `.key-slot .key-place` and the like) stay in the smaller tier (`--ui-chip` is renamed `--ui-badge`, the engine compact row, weight 600). `.chip` the interactive chip (and any chip-like toggle) therefore moves to `--ui-control` sizing, its height and padding stay the cell's compact chip row only where a chip is a badge; the planner must list which current `.chip` uses are controls (follow the control height) and which are badges. Everything else in the architect's tables stands (roles, ratios, containers, motion, default cell product/sm/round, the widened gate).
- Default shell geometry: `shellGeometry` defaults to `{ tier: "product", scale: "sm", size md }` (user ruling), all smoke checks and pixel evidence move to it, content-lg stays the stress geometry.
- Non-goals: the engine ladder values (heights, insets, UI_TEXT), exported tokens, the kit's own geometry (`doc.geometry`), this is the editor chrome only (`shellGeometry`, not doc-bound).
- Done when: the role and anatomy tables exist in one place (engine or shell module) with a unit test, every literal font-size, control padding and radius in shell CSS is gone or allow-listed with a reason, the gate bites (negative control), smoke shows the matrix at product-sm and content-lg in light and dark, ADR and reference page written, component inventory and skills updated, all gates green.

## Context
User rulings 2026-10-09: default cell is product tier, sm scale, md size; roles derived from UI_TEXT by fixed steps; architect pass first then a planned ticket (show the user the role table before any build). Existing pieces to build on: `src/engine/geometry.mjs` (cell fields `height inset icon partHeight partInset chip*` and radius roles), `src/engine/type.mjs` `UI_TEXT`/`uiText(height, factor)`, shell aliases `--sh-*` in `src/ui/styles.css`, `shellGeometry` and `_applyShellGeometry` in `src/ui/app.js`, T-0027 (compound containers, control text gate `test/repo/control-text.mjs`), T-0031 (header tools menu, `tools-compact`/`tools-tight` steps), T-0036 (styled selects, sliders, gapless prime strips), ADR-032/033, `docs/references/geometry/README.md`, `.claude/skills/geometry-system/SKILL.md`, `building-editor-sections`. Known open follow-ups: faint light-theme headings (contrast about 1.3:1), micro-sm switch too small (`.sdlc/notes.md`). Not yet scoped by the user (architect to propose): the exact step offsets per role, which controls exist beyond those listed.

## Constraints
Control sizes and the ladder do not change; no new framework; hyperscript `h()`; Safari is the preview browser (reason from spec); doc cites shift on every `styles.css` and `app.js` edit (`node scripts/audit-citations.mjs` in the same change); no U+2014; heavy gates through `scripts/gate_lock.py run --` with `SDLC_GATE_WORKERS=10`; never push.
