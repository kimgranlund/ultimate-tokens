---
id: T-0014
title: "Chroma controls redesign: Chroma + Base chroma per palette, global base/prime k factors, vibrancy 50"
type: feature        # feature | bug | chore | spike | idea
status: done
size: L              # S | M | L | XL
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-07
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
On an anchored palette, the middle prime swatch (rung 3 of the seven-swatch prime ladder) responds to the prime chroma controls instead of being held verbatim, so the whole prime strip moves with the slider. Source: the user's screenshot of the Brand > Primary card (middle swatch stays saturated blue while the outer six mute).

## Intent
- Do: change `src/engine/prime.mjs` so rung 3 on an anchored palette follows `primeChroma`; keep its hue and tone (the anchor's identity) and scale its chroma by the same factor as the other rungs, gamut-capped. The architect decides the exact rule and what happens at the default `primeChroma` (the architect must read the group and global defaults: if a shipped default is below 100 the anchor would change by default, so name how identity is preserved at defaults). Amend ADR-026 (append a new ADR in `docs/references/decision-records.md` before the Quick map and mark the ADR-026 clause superseded in place) and repair the other records that state the verbatim guarantee (`src/ui/model.mjs:895-904` comments, the color-math skill, docs).
- Non-goals: the 19-stop ramp (`paletteStops`/`rampChroma` path), the per-palette Chroma slider's detach behaviour, any change to palettes without an anchor.
- Done when: moving each of the three prime chroma sliders (per-palette, per-group, global) moves the middle swatch on an anchored palette; at the identity setting the anchor is still emitted byte-exactly (the `anchor-identity` gate, 3,380 exact, and `key-anchor` gate are kept or reshaped to assert identity at that setting, and a planted regression reds them); the full-corpus sweeps (`npm run gate:sweeps` via gate_lock) and `npm test`, `npm run build` are green locally; byte-identical exports at the default setting unless the architect shows why not.

## Context
- Diagnosis (read-only agent, 2026-10-07): the prime row is `primeSwatches(...)` built at `src/ui/model.mjs:1017-1020`, rendered at `src/ui/sections/color.js:1221-1233`. In `src/engine/prime.mjs`, `:144` sets `anchorHex`; `:171-172` computes `pc` and `cPrime = keyChroma * pc`; `:249-251` returns rung 3 as `anchorHex` verbatim, never scaled by `primeChroma`. Sliders: `color.js:1797` (per palette), `:2070` (per group), `:2051` (global). ADR-026 (decision-records.md about line 730) states the verbatim guarantee, checkable by the `anchor-identity` gate.
- The per-palette Chroma slider (`color.js:1762`) moves the middle by detaching the anchor (deletes `anchor`, stamps `preDetachChroma`, reset button at `color.js:1771`).
- Sibling ticket T-0013 (#778) also edits `tonal.js` and appends an ADR; the two will touch `decision-records.md`, so land them in separate merges.
- The user chose this product change on 2026-10-07 over a UI-hint-only or leave-as-designed option.

## Constraints
- No push, PR or issue from a role. Economical with GitHub Actions: all gates local through `gate_lock.py run --name <what> -- <cmd>` (SDLC_GATE_WORKERS=10), one push and one PR after the user approves.
- No U+2014 em dash. Never commit `*.log`, `.run.lock`, `*.attempt.json`. `.claude/docs/other/` never enters a commit. Generated artifacts regenerate through `npm test`.
- Follow the color-math skill; a change to the prime ladder moves count or parity literals together.

## Scope change (user, 2026-10-07): folds the anchor-follows-chroma goal into a chroma-control redesign
Decisions by the user:
1. Per palette (Palette tab) keep ONE chroma slider "Chroma" and replace the per-palette "Prime chroma" slider with a per-palette "Base chroma" slider (the ramp damper that today exists only at group and global level). No separate prime chroma on a palette.
2. The per-group base chroma and prime chroma sliders are REMOVED (Material's group prime default of 60 goes away). Migrate saved kits by folding old group values into the per-palette values so saved kits do not move.
3. The global Base chroma and Prime chroma sliders become k factors applied to ALL colors, both default 100 percent. (Today global "Base chroma" is `doc.baseIntensity`, a fallback; global "Prime chroma" is `doc.primeChroma`; resolution lives in `src/ui/resolve.mjs:17-29`, ramp damping at `tonal.js:956`, prime at `prime.mjs:171`, key colour at `model.mjs:909`.)
4. Default global vibrancy becomes 50 (today 0, `tonal.js:70`, `persist.js:117`, UI `color.js:2043`), and saved kits are migrated to 50 as well. Fixtures, exports and corpus gates move once; the plan must include a ruled before and after report.
5. The anchor swatch (middle prime rung) follows the chroma controls (the original T-0014 goal): decide the rule so identity holds at the defaults, or state precisely what the migration changes.
6. Hue space (OKLCH/CAM16): anchored palettes must respond to the toggle too (today they take hue from the anchor and ignore `doc.hueSpace`, `color.js:2123`, `app-helpers.mjs:558-561`). This is a SEPARATE ticket (T-0015), not part of this one, but the architect must say whether it constrains the chroma design.
Map of current controls from a read-only agent (2026-10-07): palette Chroma writes `palettes[i].chroma` (key colour and prime strip only, `color.js:1765`, defaults per palette `model.mjs:288-312`); Prime chroma writes `palettes[i].primeChroma` (`color.js:1797`); group defaults at `persist.js:44-48`; ramp chroma is `rampChromaOf` = `group.baseChroma ?? controls.baseChroma` (`resolve.mjs:17-20`). Vibrancy only moves lightness in perceptual mode (`tonal.js:1347,1441,1468`).
Non-goals now: the hue-space change (T-0015); the #778 envelope work (T-0013) which also edits `tonal.js` and appends an ADR: keep the merges separate.

## Decisions (user, 2026-10-07, after architect-L1; design in architect-L1.md and decompose/manifest-v2.json)
1. Saved prime values below 100 (Neutral outer six at Material 60, 343 corpus Neutrals, Adia Primary 99): accept the one-time move and record it in the before/after report; no hidden legacy field.
2. k factors: product formed once in `src/engine/resolve.mjs`; the prime k also scales the gallery key tile (`deriveKeyColor`) so the tile equals the prime middle at every k, keeping two independent producers for the `key-anchor` gate.
3. The per-palette Chroma slider on an anchored palette keeps detach semantics (ADR-026 unchanged there).
4. Vibrancy 50 confirmed: every pre-v8 document with vibrancy 0 becomes 50, other values kept; the plan re-measures the chroma-envelope bars at 50 and ships `scripts/report-preset-fidelity.mjs --identity-control --base <main sha>` as the ruling record. Anchored middles stay byte-exact at fresh defaults.
5. Landing order: T-0014 before T-0015 (hue space); T-0013 (#778) owns the envelope and damping constants in `tonal.js`, T-0014 only edits `tonal.js:70` and the three `?? 0` vibrancy fallbacks.
Issue: #804. Decomposition: .sdlc/prime-anchor-follows-chroma/decompose/manifest-v2.json

## Plan review
- user ruling (2026-10-07) on the plan unresolved item: re-pin the test/ui/shell.mjs:164 oklch-native bar from 30 to 45 with an inline T-0014 comment naming old and new values, and add one ADR line; keep measuring at the shipped default vibrancy 50.
- conductor edit 2026-10-07: planner-L3.md Assumptions item 'unresolved:' rewritten to 'resolved by the user' after the user's ruling above; no other plan text changed.
- plan review: replan: .sdlc/prime-anchor-follows-chroma/plan-reviewer-L1.md
- plan review: replan: step 1 criterion 8 (`! git grep ... -E "paletteGroups|GROUP_DEFAULTS|resolvePaletteGroups|clampPaletteGroups" -- src mcp test ...`) is impossible with the step's own Do: the v8 `RENAME_MAPS` fold in `src/ui/persist.js` must read `snapshot.paletteGroups[group].baseChroma`, delete it and emit a `DROPPED_KEYS` entry keyed `paletteGroups`, and `test/ui/persist.mjs` must build pre-v8 snapshots carrying `paletteGroups`. Narrow the negated grep to exclude those two migration sites (or assert on `GROUP_DEFAULTS`, `resolvePaletteGroups`, `clampPaletteGroups` only, plus `paletteGroups` outside persist.js and persist.mjs).
- plan review: replan: steps 3 and 4 gate_lock guards pin `/Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.0/scripts/gate_lock.py`; the running plugin is 0.21.1. Use the 0.21.1 path (or a version-free invocation) in every guard, and do not use a path that breaks on a cache prune.
- plan review: replan: step 1 item 9 leaves the builder a choice ("rewire it to another Global-only element") for the `(j6-seg)` signal, and step 3 item 4 leaves "pick a probe that still does" for the `exports.mjs` `oncolors` fall-through palette. Name the exact element and the exact probe.
- plan review: replan: step 2 edits `src/engine/prime.mjs` and `src/ui/model.mjs` without regenerating `src/ui/describe-mcp-assets.js` and `figma/plugin/ui.html`; say explicitly that step 4's `npm test` regenerates them (or regenerate in step 2). Line reference: `stateOf`'s `paletteGroups` is at `src/ui/model.mjs:653`.
- plan review: replan: also run `specgate.py check` on the new plan before returning it (the T-0017 plan was refused for duplicate spans); keep every user ruling in `## Decisions` and `## Plan review` unchanged (shell bar re-pinned to 45, one-time Neutral move, k composition, detach kept, vibrancy 50).
