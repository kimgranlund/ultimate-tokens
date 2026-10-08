---
id: T-0019
title: "Describe eval scores 0/15: score by perceptual distance (#811)"
type: bug
status: done
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

## Acceptance criteria
- `mcp/describe-eval.mjs` no longer exports or reads `HUE_TOLERANCE` / `CHROMA_TOLERANCE`; it exports `SEED_LIGHTNESS` (0.65), `CHROMA_TO_OKLCH` (0.0027), `DISTANCE_THRESHOLD` (0.07), `seedLab` and `seedDistance`, each constant carrying a derivation comment. A family is drawn through the engine's `oklchToRgb` at the fixed lightness and passes when its OKLab distance to the golden seed is `<= DISTANCE_THRESHOLD`; a case passes when every family passes.
- `scoreBrief` keeps `{ misses, passed }`, keeps the `missing`, `hue-missing` and `chroma-missing` reasons, and reports a perceptual miss as `{ family, reason: "distance", got, want, distance }`. `scoreRun` keeps `{ scored, passCount, total }`. `node mcp/describe-eval-runner.mjs` with no key still prints the skip line and exits 0, and its printout shows the OKLab distance for a miss.
- `node test/mcp/describe-eval.mjs` prints PASS and covers the controls: the exact seed passes for every golden case; a brief 180 degrees off in hue fails with reason `distance` on every one of the 50 chromatic golden families (nearest flip 0.081 > threshold 0.07); a 10 degree / 5 chroma near miss passes every case; a bisected hue offset just inside the threshold passes and just outside fails; the same 30 degree hue miss passes on a pastel and fails on a vivid family. Setting the threshold to 0.5 or to 0.01 turns this test red.
- `docs/specs/site/describe-palette-spec.md` section 10 (eval bullet and the new perceptual-scoring bullet), the section 11 quality-gate row, and the section 12 item 6 amendment describe the perceptual scorer and no longer cite the +-30 degree / +-20 chroma bands.
- `npm test` green through `gate_lock.py run --name npm-test` (54 of 54 files, tree clean after), including `repo/em-dash.mjs`, `repo/citations.mjs` and `repo/doc-mutation-lane.mjs`.
- No provider call was made and no file outside `mcp/describe-eval.mjs`, `mcp/describe-eval-runner.mjs`, `test/mcp/describe-eval.mjs` and `docs/specs/site/describe-palette-spec.md` (plus this handoff) changed. The 2026-10-07 Haiku 4.5 and 5.5 runs are NOT re-scored: their raw per-case briefs were not kept. The comment on `DISTANCE_THRESHOLD` replays the issue's reported miss sizes (hue 30 to 177 degrees, chroma 20 to 76) against the 59 golden seeds instead; rerunning the runner under the new scorer is the user's paid action.

## Closed

2026-10-07: delivered by the solo agent (level L2); one independent batched verifier passed before the merge
