---
id: T-0040
title: "Opt-in match-peer-lightness mode: anchored palettes share lightness per stop across peers"
type: feature        # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L4             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
A kit can opt in to a "match peer lightness" mode in which every enabled palette's ramp (and so the Radix export and 53 roles) lands at the same CIELAB lightness per stop across peer palettes, even when palettes are anchored or carry skew or lift. Default behaviour and every stored document and preset stay byte-identical.

## Intent
- Do: design then build the opt-in mode. The user ruled 2026-10-08 (after the T-0039 report): "Opt-in match-peer-lightness mode". The architect first answers: where the mode lives (a document control next to hueSpace and tone mode, persisted with a schema bump and stamped as a layer pin per ADR-034), how stop 500 stops being pinned to the anchor color's own lightness in this mode while the anchor hue and chroma still hold (ADR-031 anchored ladder), how skew and lift compose (ignored or re-based per palette), what happens to Radix steps 9/10 and to vibrancy/cusp pull, and the UI (one control in the Color inspector, label, helper text).
- Non-goals: changing the default mode, Options D and E of the report (Radix-only leveling; making `even` the default), the Maison ladder.
- Done when: a cross-palette L* spread gate over the default kit is red with the mode on at base and green with it on after the change (and the same gate documents today's wider spread with the mode off), neutrality tool `scripts/report-compute-neutral.mjs` shows 0 differing cells with the mode off, gates `npm test`, `npm run build`, `npm run smoke` and the eight sweeps are green, ADR appended.

## Context
Read `docs/reports/2026-10-08-peer-luminosity.md` (T-0039, on its lane branch until landed: if not on main yet, read it from `.claude/worktrees/agent-adc629a9791e0c876`). Findings: in the default kit all 16 palettes are anchored and 7 carry skew or lift; OKLab L spread across palettes at light Radix steps 1 to 9 is 0.063 to 0.121; Data palettes match within 0.025 (shared anchor lightness), the 8 brand and system palettes (worst Warning: skew 40, lift -36, dark anchor) differ. Causes: stop 500 pinned to the palette's own anchor (`src/engine/tonal.js:746`, `:919`, `:1431`), per-palette skew and lift, vibrancy cusp pull only on unanchored palettes. Alignment holds only in `even` tone mode, no anchor, skew 0, lift 0 (L* spread 0.2 to 0.4 over 3,780 corpus palettes). Compute layers: `src/engine/layers.mjs` (`ramp` layer version 1 is frozen once landed; a new behavior is a new layer version `ramp@2` gated by a pin, or a new control read by `ramp@1` only if byte-neutral at default, per ADR-034 and `src/engine/layer-pins.mjs`). Skills: `.claude/skills/color-math/SKILL.md`, `adding-export-formats`.

## Constraints
No U+2014. `docs/reference/data` answer keys untouched unless the mode changes role count (it must not). Heavy gates through `scripts/gate_lock.py run --` with `SDLC_GATE_WORKERS=10`. Never push; the conductor lands.
