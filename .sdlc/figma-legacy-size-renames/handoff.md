---
id: T-0026
title: "Figma apply must not prune legacy size/* variables on an existing file (PR #813 review, major 1)"
type: bug             # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L3
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
Independent review of PR #813 (T-0017, Maison geometry ladder, `git show e084b9f0`) found a data-loss path. Old variables only alias or deprecate in library mode (`figma/plugin/code.js` ~:1157, `src/ui/overlays/apply-gate.js` ~:79 and :106, `figma/binder/migrations.mjs` ~:35). The flagship sends `libraryMode=false` by default (localStorage), and the new cells get no `renames` entry because `kebabWaveOldName` returns null for `size/{cell}/*`. So the first Apply on an existing Figma file prunes every `size/{xs..2xl}/*` and `type/ui-control|ui-widget/{non-md}/*` variable, and every bound layer and text style detaches. ADR-032's "Figma:" bullet says "alias to cells ... deprecate id-preserving" without saying that only holds in library mode.

## Intent
- Fix the default (classic) mode so an existing file keeps its bindings: emit id-preserving classic-mode `renames` from old `size/{step}/{field}` to `size/{cell}/{field}` using the engine's `LEGACY_SIZE_CELLS` (legacy step to kit cell, `src/engine/geometry.mjs`) and `GEOMETRY_FIELD_RENAME_MAP` (`figma/binder/migrations.mjs`, three byte-identical copies: migrations, `figma/plugin/code.js`, `figma/binder/figma-semantic-binder/code.js`, parity-gated). Keep `kebabWaveOldName` returning null for cell names (the coverage test relies on it) and keep the frozen `OLD_FIELD`; add the legacy-step rename path beside it, not through it. Fields with no target keep deprecating with their id kept.
- Retired `type/ui-control|ui-widget/{xs,sm,lg,xl,2xl}/*`: deprecate id-preserving or map to `md`, whichever the existing `size/{step}/font` precedent in `migrations.mjs` does; state the choice.
- Also fix review minor 8: the 126 `control/` ALIAS variables always report "changed" in `figma/binder/mode-apply-plan.mjs` (~:490), so the gate's Geometry changed-count can never reach 0. Compare alias targets, not just literal values.
- If a full rename is not safely possible for some step, the apply gate must disclose the number of variables it will remove before Apply, and ADR-032 must be amended (append an amendment under ADR-032 in `docs/references/decision-records.md`) to say the aliasing is library-mode only.
- Tests: `test/figma/migrations.mjs`, `test/figma/plugin.mjs` and `test/figma/binder.mjs`: a classic-mode apply plan over a file that holds the old `size/MD/height` and friends renames each to its cell variable and prunes none; a negative control (the plan without the new renames prunes them); the alias changed-count reaches 0 on an unchanged file. Update `docs/references/decision-records.md` ADR-032 wording; regenerate with the repo generators (`npm run gen:figma-assets`), never hand-edit generated files.

## Constraints
- Skill `maintaining-figma-plugins` and `figma-file-migration` describe the mechanics; read them. Binder `code.js` mirrors are parity-gated. No U+2014. `npm test` via `scripts/gate_lock.py run --name npm-test -- npm test`, `npm run build`.
- Files: `figma/`, `src/ui/overlays/apply-gate.js`, `src/ui/figma-plugin-assets.js` (generated), tests under `test/figma/`, `docs/references/decision-records.md`. Do not touch `src/ui/app.js`, `styles.css`, `color.js`, `icons.js` (T-0025 and the UI follow-up own them) or `persist.js`, `model.mjs`, `tonal.js` (T-0021).
