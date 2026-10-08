---
id: T-0038
title: "Brightest steps do not share luminosity across peer palettes (diagnose first)"
type: spike           # feature | bug | chore | spike | idea
status: ready     # proposed | ready | blocked | done | dropped (build progress lives in /board)
size: L2             # L1 | L2 | L3 | L4 (L5 reserved)
priority: P2         # P1 | P2 | P3
depends: []          # T-NNNN, file:<path>, cap:<name>; e.g. [T-0002]
created: 2026-10-08
router: .sdlc/AGENTS.md  # how to claim and close this ticket
---

## Question
The exact question this spike answers.

## Goal
A written diagnosis (and, only if the fix is small and clearly correct, the fix) of why the brightest steps do not share perceptual lightness across peer palettes.

## Intent
- Do: reproduce and measure. User report 2026-10-08 with screenshots of 16 stacked 12-step scales (neutral/gray tints, then vivid hues): 'some of the brightest colors dont seem to have 1:1 luminosity across peer palettes'. In the screenshots the lightest steps (1 to about 5) of the neutral-tint rows look uniform in lightness except a few rows (the near-white warm-gray row and a pure-white first swatch); in the saturated rows the mid and bright steps (6 to 9) differ in lightness across hues (yellow-green and amber rows read much brighter than blue and purple at the same step index).
  1. Find which view/export the screenshots come from (12-step rows: the Radix-style scale; also the 19-stop ramps in palette cards) and measure OKLab L (and CAM16 J) per step index across all enabled palettes of the default kit and a few corpus kits.
  2. Decide what is expected: within a SET the engine tone-matches stops by design (peer palettes share lightness per stop for the 25-stop ramp, `docs/references/knowledge-02-tonal-scale.md`); Radix-style 12-step scales intentionally follow Radix's own per-hue steps 9 and 10 (solid fills are not luminosity-matched). Say plainly which steps are by design and which violate the repo's own rule (the tonal gates `test/engine/tonal.mjs`, `gate:corpus-tonal`).
  3. Write `docs/reports/2026-10-08-peer-luminosity.md` with the table of per-step L spread across palettes, the root cause with file:line, and options with cost (for example clamp bright steps to a shared L target, chroma-cap order, or document as by design).
  4. Fix only if one option is both clearly the user's intent and bounded (single engine function, existing gates stay green, `ramp-identity` guard in `.sdlc/adapter.md` section 1 unaffected). Otherwise stop at the report and say what decision is needed.
- Done when: the report exists with measurements, and either the fix lands with a new gate that bites or the open decision is named for the user.

## Context
Engine: `src/engine/tonal.js`, `derive.mjs`, `okhsl.js`, `hct.js`, `exports.js` (radix emitter), `src/engine/prime.mjs`. Skill: `.claude/skills/color-math/SKILL.md`. Gates: `npm run gate:corpus-tonal`, `gate:chroma-envelope`, `gate:even-dips` (heavy: through gate_lock, 5 min each). ADR-030/ADR-031 are relevant (chroma envelope, hue space). Do not change stored-document output for existing presets without the neutrality tool (`scripts/report-compute-neutral.mjs`).

## Constraints
No product change without evidence from the measurements. No U+2014. `npm test` before done.
