<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/scripts/lib/envelope-measure.mjs`: `measureEnvelope` takes an `engineDir` option, which loads `paletteStops` and `STOPS` from `<engineDir>/src/engine/tonal.js` through a dynamic import. Nothing else in the READING (a) loop changed. New exports: `TOL_CODES` (1), `TOL_CODES_TWICE` (2), `TOL_CODES_REFINED` (4), `EDGE_S` (0.999), `RESIDUE_CLASSES`, `stopClass`, `unitOf` (white-point rule included), `residueOf` and `measureResidues`.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/scripts/report-preset-fidelity.mjs`: new `--envelope-residue` mode with a header paragraph, a USAGE line and a dispatch entry, plus `runEnvelopeResidue`. The header comments at lines 22 and 30 and the anchored READING (a) label now point at the new gate instead of the fixture.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/test/engine/chroma-envelope-gate.mjs`: rewritten. It has SPEC and the written-out spec curve (`liftStop` is its only engine import, static from this tree), Gate A (curve), Gate B (residue), the fixture-free direction leg, vacuity checks, and the `--full`, `--spec` and `--engine-dir` flags.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/test/engine/fixtures/chroma-envelope.json`: deleted with `git rm`, so the deletion is staged. The other three edits are unstaged. Nothing was committed.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/.sdlc/gh-778/envelope-residue.txt`: the saved `--envelope-residue` output.

## Checks
- `node scripts/report-preset-fidelity.mjs --envelope-residue > .sdlc/gh-778/envelope-residue.txt`: exit 0 in 86 s. It prints 29 class rows and ends with `residue: 0 stop(s) outside TOL over 770880 stops`.
- Criterion 1 (residue report, every plain row has n > 0, total outside is 0): pass.
- Criterion 2 (the saved residue file holds the 0-outside line): pass.
- Criterion 3, guard (READING `stop N: median` lines at base 132368c0 vs head): pass, the files are identical.
- Criterion 4 (`npm run gate:chroma-envelope`): exit 0, `pass  chroma-envelope: curve exact at 438000 stops; residue within TOL at 438000 stops; direction holds in 3 modes`.
- Criterion 5 (`--spec okhslCurveGain=1`): exit 1. Curve is off at 128410 of 146000 stops in perceptual and peak, and 0 in even. Pass.
- Criterion 6 (`--spec evenFactor=1`): exit 1. Curve is off at 140160 of 146000 stops in even, and 0 in perceptual. Pass.
- Criterion 7 (planted `OKHSL_DAMP_CURVE_GAIN = 1`, run with `--engine-dir`): exit 1, curve perceptual 128410 of 146000 off. Pass.
- Criterion 8 (planted `s * 0.9` in the pixel call): exit 1. Residue perceptual is 48229 of 146000 outside TOL, and curve perceptual is 0 of 146000 off. Pass.
- Usage errors: `--spec bogus=1` and `--spec evenR=abc` both exit 2.
- Criterion 9 (fixture gone; no SLACK, `--capture`, `--compare`, NAMED_EXCEPTIONS or OVER_90_AT_300 in the gate): pass.
- Criterion 10 (`git grep chroma-envelope.json` over the named paths finds nothing): pass.
- Criterion 11, guard (citations.mjs and em-dash.mjs): pass.
- Criterion 12, guard (scope against 132368c0): pass.
- `npm test`: exit 0, all 54 test files pass, `repo/branding.mjs` passes. The tree has no new changes afterwards.
- The guard and plant criteria ran with `SDLC_BASE_SHA=132368c001f1289efee11d59ddbb0fc841b937d7` and with `SDLC_TMP_WORKTREES` set to the brief's prefix, because neither variable was set in the environment.

## Notes
- **Gate A rule 2 does not follow the handoff text exactly.** The Do text excludes only stops where `model < 1 - 1e-12` fails. Written that way, rule 2 fails 60,757 gate-path stops plus 616 damped stops on the current engine. On the unanchored OKHSL path, `keyS` can read just above 1 (for example 1.0000001). Stop 500's model then clamps to 1 while the other stops keep `keyS*env`, so `model/model500` is `keyS*env`, not `env`. The OKHSL records carry no `basis`, so for those ramps there is no exact ratio to check. The gate therefore applies the s-clamp exclusion to both models, and reads the clamp before the group damper (`model/damper`), because `dampStops` scales a model that was already clamped. The Adia Neutral witness: env 1.0112 against a ratio of 1.000000008.
  - Coverage after the change: rule 2 checks 122,733 of 146,000 anchored OKHSL stops and 80,228 of 146,000 gate-path OKHSL stops.
  - The excluded stops (17,841 anchored and 64,849 gate-path with stop 500 at the clamp, 196 clamped stops, and 5,230 and 727 capped stops) are still covered by rule 1 (env exact to 1e-12) and by Gate B.
  - Whether this exclusion stands is the planner's call. Adding a `basis` to OKHSL records would restore full coverage, but that is an engine change and outside this step.
- `measureResidues` rows carry two fields beyond the shape the handoff lists: `ramp` (the stop records of that render) and `controls`. Gate A needs them for stop 500's model and for the slider values in the spec curve. If `stops` is omitted, `measureResidues` uses the engine's `EXPORT_STOPS`; the gate relies on that, so it imports nothing from the engine except `liftStop`.
- The edge rule reads the emitted pixel: a channel at 0 or 255 and readback s of at least `EDGE_S`. The residue probe reproduces the plan's result: 0 stops outside TOL in all 29 class rows.
- Runtime on this host (load about 14 to 17): the gate takes about 80 s, `--envelope-residue` about 86 s, and the READING guard ran inside the same call as criterion 1.
- The throwaway prefix `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/.worktrees/tmp/builder-L3-gh-778-s2` still holds `gh778-plant-gain`, `gh778-plant-pipe` and a `gh778-reading.*` directory. The permission system denied `rm -rf` on it. Git ignores the directory, but it should be removed by hand.
