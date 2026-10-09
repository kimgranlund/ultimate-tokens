---
id: T-0045
title: "Dragging a palette's Hue deletes its anchor, so the ramp jumps to the unanchored curve (stop 500 L* 73 vs 51) and looks washed out"
type: bug             # feature | bug | chore | spike | idea
status: ready        # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L2             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Goal
Dragging a palette's Hue (or Chroma) keeps its ramp perceptually even: the ramp stays anchored at the same tone, so a hue slide gives the same lightness spread as the other palettes, and a test that failed before the fix passes after it.

## Repro
1. Open the app, select the default Primary (blue, hue ~259, anchored `#0C5DCC`), drag its Hue to green (~150).
2. Compare its ramp to Secondary (green, hue 163): Primary shows light mint to mid green with no dark half.
3. In node: `projectView` of `defaultDocument()` with Primary `hue` set and `anchor` deleted prints L* per stop 50/200/400/500/600/800/950 = 100/89/75/64/51/26/5 (hue 150), against 100/79/54/42/32/16/5 for the anchored default and 100/88/64/51/40/19/5 for Secondary.

## Expected
A hue edit keeps the ramp's pivot: stop 500 near the anchor's own L* (about 42 for Primary), the same spread as an anchored palette at any hue.

## Actual
`src/ui/sections/color.js:1815` runs `delete d.palettes[i].anchor` on a hue edit (and `:1948-1962` does the same). The ramp then takes the unanchored curve (`toneAt`, `src/engine/tonal.js:658`), which fixes stop 500 near L* 73 (64 with Primary's skew -20) instead of the anchored 42 to 51, so every hue-edited palette looks washed out.

## Context
Found in a session 2026-10-08 (user screenshots of Primary slid to green). Diagnosis by a read-only run; root cause is confirmed by the numbers above, the fix is a proposal. Proposed fix: on a hue or chroma edit, re-seed the anchor at the new hue with the old anchor's tone (old L*, gamut-clamped, via `resolveAnchor` or `seedFromKeyColor`) instead of deleting it. Not the alternative of changing the unanchored `toneAt` pivot, which would move the byte-identical unanchored path (C4). Unrelated to T-0040 (it changes extremes only, not stop 500).

## Constraints
The failing test lands before or with the fix, never after. Do not change `tonal.js` or the unanchored path. Touch `src/ui/sections/color.js` and its tests only. The default kit and presets must render identically (no hue edit, no change).
