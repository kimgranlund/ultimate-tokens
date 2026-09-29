# Question chroma-envelope-scope · from chroma-envelope-planner

| Field | Value |
|---|---|
| Blocks | `.sdlc/plans/chroma-envelope.md` U2 (U1, the gate, proceeds under every option); the plan's `status: draft` to `approved` |
| Question | #725: the `--envelope` perceptual and peak bars still miss on `main` after #701. Fix the engine until the ruled bars (medians 75 at stops 300/700, 25 at 100/900; p90 90/35; 0 above stop 500) pass, re-rule the bars to the measured figures and gate them as a ratchet, or close the issue as resolved by #701? |
| Options | A re-rule the bars to the measured figures, freeze them per mode as a ratchet in a CI sweep with an absolute muted-direction leg, amend ADR-026 (recommended) · B fix to the ruled bars: per-mode tone-held retune plus a cap on the anchored basis blend, every curated ramp moves · C close as resolved by #701 |
| Default if unanswered | A |
| Context | issue #725; `.sdlc/questions/issue-triage-2026-09-22.md` row 3 ("decide after #701 lands"); `.sdlc/questions/preset-intent-fidelity-preland.md` Q2; ADR-026 Consequences and the 2026-09-28 amendment; `.sdlc/plans/archive/preset-intent-fidelity-u3-rediagnosis.md`; the plan's 'Diagnosis' and 'What the counterfactuals show' sections |

## Recommendation: A, re-rule and gate

The two misses are two ratified constructions measured, not a tuning slip, and each earlier attempt to close them by tuning was reverted for a real defect. Re-ruling records what the product renders today as the floor it may not fall below, adds the gate the issue asks for, and leaves every curated ramp where the owner already approved it. Both other options are shown false or expensive by command below.

## Evidence

| # | Fact | Command and reading, `main` 89135e46 (engine-identical to ea3099e4) |
|---|---|---|
| E1 | The miss reproduces exactly after #701 | `node scripts/report-preset-fidelity.mjs --envelope` exits 1; perceptual 100/300/700/900 median 17.4 / 94.0 / 74.5 / 31.7, p90 35.1 / 146.2 / 119.3 / 66.5, cusp-run violations 446; peak median 11.7 / 84.0 / 68.8 / 29.4, p90 23.6 / 137.7 / 111.1 / 62.1, above 100% 2592; 11 of 16 median/p90 cells and both clauses FAIL |
| E2 | #701 moved no perceptual or peak cell | md5 of the perceptual plus peak READING (a) block is `6e558839ee9e43217e1e2f7afc898b7b`, equal to #701's C5 pin taken at 282fca8d before its units ran; `gate:mode-isolation` prints the same two hashes (`34e544942d500b9e`, `f560f784d8a4883a`). Option C would state on the record something a command refutes |
| E3 | READING (b) misses by closed form, not by corpus | `chromaEnvelope` at shipped `damp` 70, `dampCurve` 1.5 returns 0.793 at stops 300/700 and 0.413 at 100/900 for every palette; the report prints 79.3 and 41.3 with median = p90. Clearing 75/25 needs `damp` near 90 |
| E4 | The retune that clears (b) does not clear (a) | scratch copy of the report with `damp` forced to 90 on all four control literals: READING (b) PASS (73.3, 24.6); READING (a) perceptual 300 median 85.4 FAIL, peak 300 median 75.2 FAIL, every p90 at 300/700/900 FAIL, clauses 365 and 2542 FAIL. And #681 U3 measured that `damp` 92/0.5 and 98/0.65 each reintroduced a CIELAB L\* uptick in the OKHSL modes (Helmholtz-Kohlrausch, `#668`); both were reverted, and the re-diagnosis rules out a third trial-and-error retune |
| E5 | READING (a)'s misses come from ADR-026's anchor pivot and the Q-U2-5 basis blend | stop 500 is the sampled hex verbatim; `anchorChromaBasis` blends each side from the anchor's own `s` toward `palette.chroma / 100`, so a muted sample inside a vivid group renders stops 300 and 700 above 500. Re-measuring against the ramp's own peak stop instead (scratch `DEN=max`) zeroes both clauses by construction but perceptual 300 still reads 87.0 and peak 300 reads 75.2, and stop 900 reads 29.7 / 27.5: the light side holds the group's chroma. Only a cap on the blend (reversing Q-U2-5) moves those, and it moves 3,780 curated ramps and the 16 default families at every stop but 500 |
| E6 | The gate is owed under every option | the issue's acceptance: "A gate in `npm test` or CI measures the muted direction and can fail." Nothing in `npm test` or CI runs `--envelope` today (`grep -rn 'envelope' package.json .github/workflows/ci.yml` prints nothing); the direction holds in every mode today (stop-100 median below stop-300, stop-900 below stop-700) and is un-gated |
| E7 | Cost of B | three units (L l7, M l6, plus records), a second export-wide movement after ADR-026's, `ramp-identity` movement declared on six lines, `hpg-role-contrast` FLOORS and `tonal-legacy.json` re-read, `gate:corpus-contrast` re-run, every colour export regenerated; the muted-in-vivid-group intent the owner ruled at Q-U2-5 is lost |
| E8 | Cost of A | two units (M l5, S l3), zero engine hunks, one ADR amendment, one new sweep leg (about 30 to 60 s under load, the report's own `--envelope` run time), the `sweeps` row re-summed. What the owner gives up: the 75/25 bars as a statement of design intent; they become "the rendered path at 89135e46, a floor, per mode" |

## What A rules, in one paragraph for the ADR amendment

The C6 median and p90 chroma bars for perceptual and peak (and, for one fixture, even) are the figures measured on the rendered path at 89135e46, frozen per mode as a ratchet a change may lower and not raise, gated by `gate:chroma-envelope` in the `sweeps` matrix with an absolute muted-direction leg. The 75/25 bars are retired as targets on the rendered path because they need both a per-mode tone-held retune (twice reverted on the L\* coupling, #681 U3) and a cap on the anchored basis blend (reversing Q-U2-5 and moving every curated ramp); R27's end-stop normalization stays an open design note, cited by ticket. `--envelope` keeps printing both readings and exits on the fixture, not the literal bars.

## Answer

| Field | Value |
|---|---|
| Ruled | B, "Fix the engine" (owner chose against the planner's A recommendation; Q-U2-5 muted-in-vivid-group intent is reversed by this ruling) |
| By | owner via AskUserQuestion (R69) |
| Date | 2026-09-29 |
| Written back by | Conductor |
