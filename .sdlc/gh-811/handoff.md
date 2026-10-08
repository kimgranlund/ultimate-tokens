---
id: T-0019
title: "Describe eval scores 0/15: score by perceptual distance (#811)"
type: bug
status: ready
size: L2
priority: P2
depends: []
created: 2026-10-07
router: .sdlc/AGENTS.md
---

## Goal
GitHub #811. The describe eval (`mcp/describe-eval.mjs` scorer, `mcp/describe-eval-runner.mjs` runner) passes 0 of 15 on every model, so it cannot separate a good model from a bad one. Change the scoring so a brief is judged by perceptual distance instead of two per-axis bands, and record what the new scorer says about the two reference runs.

## Intent
User ruling 2026-10-07: score by perceptual distance.
- Per family, convert the brief's `{hue, chroma}` and the golden seed's `{hue, chroma}` to a color at a fixed lightness (use the engine's OKLCH to sRGB path that the repo already has, DOM-free) and take the OKLab distance. A family passes when that distance is within one named constant; a case passes when every family passes. Keep the `missing`, `hue-missing` and `chroma-missing` reasons for absent data.
- Choose the threshold from data, not by guess: the two measured runs on 2026-10-07 are the evidence (Haiku 4.5 misses of 30 to 177 degrees hue and 20 to 76 chroma on 15 cases; Haiku 5.5 scored 0/15 before the string-families parse fix). State the chosen constant and why in a comment, and keep it such that a brief equal to the golden seed passes and a brief 180 degrees off in hue fails.
- No paid run in this lane. The 4.5 and 5.5 results are the user's to rerun; do not call the provider. Offline fixtures only.
- Replace `HUE_TOLERANCE` / `CHROMA_TOLERANCE` and update the spec text that cites them (`docs/specs/site/describe-palette-spec.md` around lines 515 to 520 and the eval-ops item). Keep `scoreRun`'s result shape so `describe-eval-runner.mjs` and its printout keep working; the printout may show the distance.
- Tests: `test/mcp/describe-eval.mjs` gains a perceptual-distance group with a negative control (a hue-flipped brief fails, the exact seed passes, a near miss inside the threshold passes).
- Out of scope: the briefing or exemplars, the runner's provider call, the weekly workflow.

## Constraints
- Zero runtime deps, engines stay DOM-free. No U+2014. `npm test` green; run it through `scripts/gate_lock.py run --name npm-test -- npm test`.
- Files likely: `mcp/describe-eval.mjs`, `test/mcp/describe-eval.mjs`, `docs/specs/site/describe-palette-spec.md`. T-0017 is building in parallel and owns `mcp/brand-kit-core.mjs`, `mcp/png-swatch-board.mjs`, `src/`, `figma/`: do not touch those.
