<!-- role=architect level=L1 model=fable effort=high -->
## Approach

The exclusion is inherent to the construction and hides no defect, but it is cheap to remove, and removing it restores the "asserted exactly" principle ADR-029 claims. The mechanics: since #785 `paletteStops` renders every ramp at chroma 100 (`src/engine/tonal.js:992`, the group damper scales after), so the unanchored OKHSL basis `keyS` (`tonal.js:1522`) is the OKHSL `s` of the hue's cusp colour (`hctToRgb(baseHue, pk.c, pk.tone)`), which sits on the sRGB boundary by definition. OKHSL's `s = 1` is an approximate gamut boundary, so a boundary pixel reads 1 plus or minus round-off: over the corpus the gate-path basis spans [0.9998, 1.0007], and 2,600 of 5,840 gate-path ramps land at or above 1 by that coin flip, not by any slider. On the anchored path the basis is `anchor.okhsl.s` (`tonal.js:1449`), at or above 1 for 756 of 5,840 ramps (max 1.0004: boundary anchors). `holdTone` (`tonal.js:1169`) clamps `sBasis * env` to [0, 1], so the model is `min(1, max(0, basis * env))`, a gamut ceiling in the path's own unit, the OKHSL analogue of even's `min(maxc, ...)`. At the shipped presets the clamp reaches no export stop but 500 (a basis of 1.0293 would be needed to clamp stop 450 at damp 70; the max is 1.0007); at Flat (damp 0, env 1 everywhere) it clamps every stop, so the clamp is part of the model, not a stop-500 phenomenon.

Why the gate drops whole ramps: rule 2 compares `model / model500` to `env`, and with stop 500 clamped at exactly 1 and the other stops at `basis * env`, the ratio is `basis * env`, off by up to 7e-4, so the gate excludes every stop of a ramp whose stop 500 is clamped (17,841 anchored, 64,849 gate-path stops), plus 196 stops per path where `env > 1` (dampAmp 70, Adia) clamps the stop itself, plus capped stops (5,230 and 727). My probe reproduces the handoff's 122,733 and 80,228 exactly. The ratio form exists only because OKHSL records carry no `basis` while even records do (`tonal.js:955, 1085`); the asymmetry is the root cause.

The change: OKHSL records gain `basis` (three object literals, no arithmetic touched), and rule 2 becomes rule 2': at every uncapped stop, `model / (damper ?? 1)` equals `min(1, max(0, basis * env))` to 1e-9; `basis` is constant across the ramp (the R69 no-climb property the ratio rule checked implicitly and a recorded basis would otherwise lose); at the anchored stop 500, `model` equals `basis` (the verbatim anchor, `tonal.js:1477`, stores the raw `anchor.okhsl.s`) or `min(1, basis)` (a clamped pivot renders through `preCap`). Rule 2' replaces rule 2 (gh-778 rejected two gates on one property). The probe ran rule 2' with an independently derived basis (cusp `s` via `effHue`, `peakC`, `hctToRgb`, `rgbToOkhsl`; anchor hex via `rgbToOkhsl`) over both paths: 0 failures at 280,337 stops, 0 mismatches at the 5,706 verbatim anchored stop-500 records. Rule 1 (env exact to 1e-12), Gate B and the direction leg stay as they are.

Byte-neutrality: a field added to an object literal moves no pixel; `dampStops` spreads it through (`tonal.js:1616`), `src/ui/model.mjs:924-932` copies record fields by name, so nothing reaches `projectView` or an export. The same shape (#807's `env`/`model`/`basis`/`floor` additions) passed at 0 differing cells. The proof is the identity control with `--authored` (the anchored construction is touched). The bundles that embed `tonal.js` source (`figma/plugin/ui.html`, `src/ui/describe-mcp-assets.js`) regenerate under `npm test`. Recommendation: do it, solo L1/L2 (three literals, one gate rule plus header, one ADR-029 amendment bullet, one negative control), landed before T-0021 step A so the frozen `ramp@1` carries the field.

## Interfaces

- `src/engine/tonal.js`: `basis: anchor.okhsl.s` added to the verbatim stop-500 record at :1477 and the built record at :1485 (`anchor` is in scope; do not thread it out of `preCap`); `basis: keyS` added to the unanchored record at :1586. No other engine line.
- `test/engine/chroma-envelope-gate.mjs:103-113`: rule 2 replaced by rule 2' (clamped basis form over the damper, constant basis, anchored stop 500's two-branch check, capped stops excluded); header comment :11-13 restated; the pass line prints the rule-2' covered count (280,337 at HEAD).
- Negative control (acceptance, `--engine-dir` scratch copy): `basis: keyS * 1.01` at :1586 reds `curve perceptual` and `curve peak` with rule 1 at 0 off and residue at 0 outside TOL; `const intendedS = anchor.okhsl.s * (1 + 0.05 * Math.abs(sp))` with `basis: intendedS` reds the constant-basis clause.
- `docs/references/decision-records.md`: an `- **Amendment (2026-10-08, T-0024).**` bullet before ADR-029's Status line (:962) restating Decision (3)'s perceptual/peak rule (:940-942) as the clamped basis form; ADR stays PROPOSED.
- Manifest: `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.sdlc/gate-a-narrowing/decompose/manifest-v1.json` (coverage_check clean, plan mode); report at `decompose/report.md`.

## Constraints and assumptions

- Every ramp renders at chroma 100 and the group damper scales after, so `keyS` is hue-only: verified by `tonal.js:992` and the probe's gate-path basis range [0.9998, 1.0007].
- The exclusion numbers 122,733 / 80,228 are reproduced by the current rule's predicate: verified by the probe (`measureResidues`, both paths, perceptual plus peak).
- Rule 2' holds everywhere with an independently derived basis: verified, 0 failures at 280,337 stops, 0 verbatim-500 mismatches.
- `basis` reaches no export: verified by `src/ui/model.mjs:924-932` (copy by name) and `scripts/gen-tonal-fixture.mjs` mapping `.hex`.
- `dampStops` passes `basis` through unscaled while scaling `model` by `r`: verified at `tonal.js:1616-1623`.
- No test deep-equals an OKHSL record's key set: verified by grep for `toneHeld`/`Object.keys` in `test/engine/*.mjs` (only the gate reads these fields).
- Adding the field is byte-neutral: unverified by a run (design only); the identity control with `--authored` is the acceptance.
- OKHSL's `s` boundary is approximate, which is why a valid boundary pixel reads above 1: unverified against `okhsl.js`'s comments; the measured bound (7e-4 over the corpus) is the evidence.

## Rejected alternatives

- Gate-only re-derivation of the basis (what the probe did): covers everything with no engine edit but imports five engine functions, breaking the gate's `liftStop`-only discipline, and copies REQ-052's key-colour definition and `resolveAnchor` into the gate.
- Clamp `keyS` to 1 at `tonal.js:1522`: covers only the gate path, misses the 196 `env > 1` stops and the anchored path, and hides the clamp in a number instead of naming it in the model.
- Clamp the basis in the engine so the ratio rule holds (`basis := min(1, keyS)` before the multiply): moves pixels on half the corpus (`s` differs by up to 7e-4 times env at every stop), a product change to serve a gate.
- Document the exclusion as inherent and close: defensible, but the fix is three literals and the exclusion also silently drops the no-climb check on 45% of gate-path ramps.
- Keep rule 2 beside rule 2': two gates on one property, rejected already in gh-778.

## Risks

- A clamped-pivot anchored stop 500 with `basis > 1` renders `min(1, basis)` while the verbatim case stores `basis`; the two-branch rule covers both, but the corpus has no such pivot today (0 mismatches on `model == basis`), so that branch is untested until a fixture exercises it.
- T-0021 U5 edits the same functions: `hueSpace` reads at `tonal.js:1398`, `1534-1540` and `1579` (seven lines above :1586, the tightest adjacency; no same-line overlap, git merges clean). The real collision is the freeze: if U5 lands first, `ramp@1.mjs` lacks `basis` and T-0024 has to rebase onto the new `tonal.js`.
- The bundle regeneration touches `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js`; a stale tree after `npm test` fails the clean-tree gate.
- If the owner reads "basis constant over the ramp" as a product rule rather than a gate rule, ADR-029's amendment must say it is R69 restated, not a new decision.

## Carry forward

- Basis sources: unanchored `keyS` at `src/engine/tonal.js:1522` (the cusp colour's OKHSL s, chroma 100 by :992); anchored `anchor.okhsl.s` at :1449 (`resolveAnchor` :699 sets `okhsl: rgbToOkhsl(rgb)`).
- Clamp: `holdTone` at `tonal.js:1169`, `s = min(1, max(0, sBasis * env))`; model recorded as `hold.s` at :1586 and `s` at :1485; verbatim anchored stop 500 records `model: anchor.okhsl.s` unclamped at :1477.
- Edit targets: `tonal.js:1477`, `:1485`, `:1586` (add `basis`); `test/engine/chroma-envelope-gate.mjs:103-113` (rule 2) and `:11-13` (header); `docs/references/decision-records.md:940-942` (ADR-029 Decision 3) with the amendment bullet before :962.
- `dampStops` (`tonal.js:1612-1631`) spreads records and scales `model` by `r`; the gate divides by `rec.damper ?? 1`.
- Corpus basis ranges (probe over `measureResidues`, both paths, perceptual plus peak): gate path [0.9998, 1.0007], 2,600/5,840 ramps at or above 1; anchored [0.1006, 1.0004], 756/5,840.
- Exclusion tally at HEAD: anchored 17,841 (stop 500 clamped) + 196 (env > 1) + 5,230 (capped) = 23,267; gate path 64,849 + 196 + 727 = 65,772.
- Rule 2' coverage at HEAD: 135,064 anchored + 145,273 gate path = 280,337 stops, 0 failures, 0 verbatim-500 mismatches.
- Clamp reach at damp 70: env(450) = 0.9715, so a basis of 1.0293 is needed to clamp stop 450; none exists.
- `src/ui/model.mjs:924-932` copies record fields by name; `scripts/gen-tonal-fixture.mjs` maps `.hex`: a new record field reaches no export.
- Identity control: `node scripts/report-preset-fidelity.mjs --identity-control --authored --base $(git merge-base origin/main HEAD)`, last line `0 differing cells` (`.sdlc/adapter.md:39`).
- T-0021 (`.sdlc/gh-788/handoff.md`) U5 removes every `hueSpace` read from `tonal.js` (`grep -n hueSpace src/engine/tonal.js`: 46, 105, 992, 1016, 1398, 1494, 1534, 1579, 1612, 1626) and freezes the file as `src/engine/layers/ramp@1.mjs` (`.sdlc/plans/compute-layers.md:88-90`).
- ADR amendment shape: `- **Amendment (<date>, #<ref>).**` bullet above the Status line (`decision-records.md:769, 777`).
- Even records already carry `basis`/`floor` (`tonal.js:955, 1085`); Gate A's even rule excludes refined, damped and the anchored stop 500 (`chroma-envelope-gate.mjs:110-113`).
- Manifest and report: `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.sdlc/gate-a-narrowing/decompose/manifest-v1.json`, `report.md` (coverage_check exit 0).
