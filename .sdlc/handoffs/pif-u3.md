---
kind: handoff
plan: preset-intent-fidelity
unit: U3
branch: unit/pif-u3-envelope
base: 690b0a1a395cee0bad122443c3441d5f35412030
head: c5a5be39eb4186b3895ffe67e00c0bdde73c56fd
written: 2026-09-18
pass: 2
---

# U3 handoff — anchor-centred chroma envelope, all modes, grade l4 (pass 2, review response)

Ticket #681, priority P1. Pass 1 shipped a `chromaEnvelope` unifying the even path's and the OKHSL
path's per-stop chroma damping, keyed on `liftStop` (#668's R1c fix), with the OKHSL path's saturation
basis switched to the key colour's own OKHSL `s` (REQ-052) and `VIVID_MIDS.dampAmp` dropped to 0 (Q7).
It received a FIX-FIRST review (`scratchpad/pif-u3-review-1.md` in the review dispatch's scratchpad):
the engine change itself was correct and closed #668's uptick class to 0/0/0 on the rendered corpus,
but the C6 gate measured a proxy (raw `palette.chroma` instead of the resolved chroma the product
renders with), which made most of pass 1's reported figures — the corpus upticks count, the "21 to 7"
duplicate-hex rescope, and by extension the Design A vs B trade-off it was based on — unreliable. C8's
contrast floors also moved down in four places without disclosure.

This pass fixes the gate to measure the rendered path, re-derives every figure from scratch, and
re-decides Design A vs B on the corrected evidence: **Design B ships** (see
`.sdlc/questions/pif-u3.md` Q1). One question is newly open (Q6, a genuine 0.03-headroom contrast-floor
drop); Q1 and Q3 are resolved; Q4 and Q5 are unchanged from pass 1.

## Criteria table

| # | Criterion | Command | Observed | Negative control |
|---|---|---|---|---|
| C7-1 | One `chromaEnvelope` definition | `grep -c "export function chromaEnvelope(" src/engine/tonal.js` | `1` | n/a (mechanical) |
| C7-2 | Exactly 3 total appearances | `grep -c "chromaEnvelope(" src/engine/tonal.js` | `3` | n/a (mechanical) |
| C7-3 | Zero stale two-copy dampAmp expressions | `grep -c "1 + ((controls\.dampAmp" src/engine/tonal.js` | `0` | n/a (mechanical) |
| C6-anchor | `env(anchorStop)=1` exactly at EVERY lift (not only lift 0 — R2 closes the Q1 gap), every damp/dampCurve/dampAmp/dampBias combo | `test/engine/tonal.mjs` "chroma-envelope" (C6 env-anchor sub-check), now swept over lift in `[-40,-20,0,20,40]` too | pass | perturbing the return value by +0.01 fails as `1.01 != 1` |
| C6-i | perceptual/peak/even: 0 tone upticks, full corpus, both stop sets, RENDERED path | `test/engine/tonal.mjs` "chroma-envelope" (C6 i) | `upticks.{perceptual,peak,even} = 0`, rendered via `rampChromaOf` + hueShift/hueSameDir/cuspPull, matching `src/ui/model.mjs`'s `projectView` | pointed at the pre-U3 base with the OLD (raw-chroma) method: reports 0/0/0 (vacuous — the gate this negative control exists to catch); pointed at the pre-U3 base with the FIXED (rendered) method: reports 11 perceptual / 46 peak, matching the plan's own #668 figures exactly, confirming the fixed gate is non-vacuous |
| C6-ii | 0 duplicate hex, full corpus, both stop sets, RENDERED path | same file, (C6 ii) | **0** duplicate-hex ramps in every mode, both stop sets — `KNOWN_BASELINE_DUP` is an empty Set; no exception needed | the pre-U3 base also measures 0 on the rendered path (Q3); pass 1's Design A measured 2 (both named in Q1's table) — Design B's own negative control: patching back to Design A's `sd` formula in a scratch copy reproduces both |
| iii-c | measured CIELAB L* never rises beyond a NAMED exception list, 10,080-cell synthetic grid | `test/engine/tonal.mjs` "skew-lift-okhsl" | 21 of 10,080 rise under Design B (worst +0.1314 L*; 20 near-white, one near-black at tone 7.55); all 21 named and cited in `GRID_R2_EXCEPTIONS`, verified both directions | deleting one cited cell reproduces a FAIL naming it; an unlisted 22nd cell also fails |
| C6-iii | no docs/ literal moves without a named exception | `git diff --stat 690b0a1 -- docs/` | 4 paths: 2 expected `adia-*` regen files, 2 citation-line fixes (this pass moved the SAME two lines again, `:404`->`:410`, not repeated from pass 1's `:395`->`:404`) — Q5 | n/a |
| C8 | `hpg-role-contrast` floors re-pinned vs the TRUE pre-U3 baseline (bf2aaf6, not pass 1's own numbers) | `test/engine/semantic.mjs` | peak improves at 5 families; even unchanged; perceptual holds at 15 of 16, ONE real drop (Neutral dark 4.9->4.5, Q6) | restoring Neutral dark to 4.9 in a scratch copy reds at measured 4.53 |
| gate:corpus-contrast | 0 of 7,560 cells under 4.5 | `npm run gate:corpus-contrast` | `168 named per cell, 0 carried below 4.5`, worst cell 4.503:1 | n/a |
| contrastLint | 0/0/0 across modes | `contrastLint(brandKit(defaultDocument()))` per mode | `0 0 0` | n/a |
| Q4 | Panda literal | `test/engine/exports.mjs` | unchanged from pass 1 — `oklch(0.5458 0.0462 266.73)`, confirmed design-invariant (Neutral/Primary both lift 0) | n/a |
| Q7 | `VIVID_MIDS.dampAmp` 55 -> 0 | `scripts/gen-categories.mjs` | unchanged from pass 1 | n/a |
| citations | 0 STALE | `node scripts/audit-citations.mjs` | 0 STALE-WRONG-LINE / STALE-MISS, exit 0 (this pass's own comment growth moved `tonal.js:404`->`:410`, fixed) | n/a |
| branding | clean | `node test/repo/branding.mjs` | `branding: clean (446 files scanned)` | n/a |
| full suite | 47/47 green | `npm test` | `✓ all 47 test files passed` | n/a |
| tree | clean after | `git status --short` | empty after commit | n/a |

## C6, the Design A -> Design B re-decision (Q1, full detail)

Rendered-path measurement (`rampChromaOf` + `hueShift`/`hueSameDir`/`cuspPull`, matching
`projectView`), 3,780 palettes x 3 modes x both stop sets, independently reproduced (not trusted from
the review):

| | perceptual upticks | peak upticks | peak dup-hex ramps (25-stop) |
|---|---|---|---|
| pre-U3 base (362cc48) | 11 (worst +0.5105) | 46 (worst +0.8312) | 0 |
| Design A (pass 1 shipped) | 0 | 0 | 2 |
| **Design B (this pass, shipped)** | **0** | **0** | **0** |

Design B's cost, also independently reproduced: 21 of 10,080 synthetic grid cells rise (worst +0.1314
L*; 20 near-white, tone 90.9-99.5, one near-black at tone 7.55, hue 287 skew -100 lift -40), at
skew/lift/hue/vibrancy combinations within the user-settable ranges but unused by any shipped preset or
role default. Full rationale and the rejected third draft are in `src/engine/tonal.js`'s
`chromaEnvelope` comment and `.sdlc/questions/pif-u3.md` Q1.

## Files changed this pass (commit `c5a5be3`, on top of pass 1's `0a8d1c6`/`ed1e6a3`/`ce23ec0`)

- `src/engine/tonal.js` — `chromaEnvelope`'s `sd` re-centred on `liftStop(anchorStop, lift)` (Design B/
  R2); rewrote the function's own rationale comment; deleted the stale comment at the old `:492` that
  described a formula ("chroma% of the gamut... damping multiplier m") no longer present three lines
  below it.
- `test/engine/tonal.mjs` — `damping-curve`'s independent legacy-reproduction formula updated to read
  `liftStop` on both sides of the subtraction (matching R2) and floored at 0 (matching
  `chromaEnvelope`'s own `Math.max(0, ...)`); `skew-lift-okhsl` (iii c) gained the named
  `GRID_R2_EXCEPTIONS` list (21 cells); `chroma-envelope`'s C6-anchor sub-check swept over lift, not
  only lift 0; the C6 (i)/(ii) corpus scan rebuilt on the rendered path (`rampChromaOf` +
  `hueShift`/`hueSameDir`/`cuspPull`, `defaultDocument()`'s own palettes for the 16 role defaults
  instead of the reduced role-table.json shape); `KNOWN_BASELINE_DUP`'s key gained `chroma` and the
  stop-set label (review finding 5) and is now an empty Set (Q3).
- `test/engine/semantic.mjs` — `hpg-role-contrast` `FLOORS` fully re-measured against bf2aaf6 (not pass
  1's own numbers), with the one genuine drop (Neutral perceptual dark) disclosed in-line and in Q6.
- `docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,04-context-and-messaging}.md` — the same
  2 citation lines pass 1 fixed, moved again by this pass's own comment growth (`:404` -> `:410`).

## Regenerated artifacts (committed)

- `test/engine/fixtures/tonal-legacy.json` (CARVE-OUT header updated for R2), `test/engine/fixtures/
  shadcn-baseline.css` (CARVE-OUT header updated for R2 — the header's closing `*/` was dropped by an
  earlier draft of the regen script and restored before committing), `test/ui/fixtures/
  default-doc-ramps.json`.
- `figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js` — `npm test`'s own `bundle`/`gen:figma-ui`/
  `gen:mcp-assets` steps. `src/ui/categories/*.js` and `docs/reference/data/adia-*` regenerate
  byte-identical to pass 1 (an engine-only change does not move the stored palette definitions
  `gen-categories.mjs` reads), so they are not part of this pass's diff.

## Out of lane, not touched

Unchanged from pass 1: `src/engine/prime.mjs` / `test/engine/prime.mjs` (U6); `src/ui/model.mjs`
anchors / `src/ui/persist.js` (U1); the ramp's anchor pass-through in `okhslStops`/`toneAt`, and
`effStop`/`toneAt`'s lightness-curve density under lift (U2); `docs/spec/spec-panda-park-ui-exports.md`
(Q4, reported not edited).

## Landing sequencing

Unchanged from pass 1: per the plan text, U3 merges into the plan branch only after U4's
`scripts/report-preset-fidelity.mjs --movement` report exists and the plan owner records 🟢 acceptance
in `.sdlc/questions/preset-intent-fidelity-u3-movement.md` (C6 iv).

## Risks for U2 / U4 (unchanged from pass 1, plus one addition)

- **U2:** the near-white duplicate-hex class this pass closed to 0 and the peak-mode OKHSL/CAM16 cusp
  mismatch (Q2) both live in `effStop`/`toneAt`. If U2 touches that density under lift for the anchored
  branch, re-measure both against the new lightness curve rather than assuming unrelated.
- **U2:** review finding 8 (latent hazard): `chromaEnvelope(stop, anchorStop, lift, controls)` genuinely
  takes `anchorStop` as a parameter and both call sites pass the module constant, so U3 composes behind
  the parameter as specified — but the surrounding code still hardcodes 500 in `tone500`/`maxc500`/
  `intended500` (`paletteStops`) and `lightnessAt(500, t500)` (`okhslStops`). If U2 threads a
  per-palette anchor stop, the seed's saturation will follow it while the seed's lightness stays at 500.
- **U4:** the movement-table report (C6 iv) should measure against the SAME full-corpus, rendered,
  both-stop-set scope this unit's gate now uses.
- **U1 / U6 (new, Q6):** either can move Neutral's accent lightness, and perceptual Neutral dark's
  contrast floor now sits at 4.53 against the ruled AA 4.5 floor — 0.03 of headroom. Re-measure this
  one cell after either lands.

## Open questions

See `.sdlc/questions/pif-u3.md`: Q1 (RESOLVED — Design B shipped, both tables shown), Q2 (moot, kept
for the record), Q3 (RESOLVED — the "21 baseline duplicates" story was a proxy artefact; true count is
0/0 before/after), Q4 (Panda/shadcn spec literal drift, needs a docs-owning seat, unchanged), Q5 (2
docs/ exception paths, unchanged in shape), Q6 (NEW — Neutral perceptual dark's contrast floor drops
for real, 0.03 headroom over AA, owner ruling needed).
