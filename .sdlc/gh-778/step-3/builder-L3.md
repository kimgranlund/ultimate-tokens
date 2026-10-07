<!-- role=builder level=L3 model=opus effort=high -->
## Status
done

## Changes
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/docs/references/decision-records.md`: added `## ADR-029: The chroma envelope's closed form is the spec` just before `## Quick map`. It covers Context, Decision, How an anchored ramp deviates, Rationale, Consequences and Status (PROPOSED 2026-10-07, cites #778, #725 and ADR-026). Also added one `| ADR-029 |` row at the end of the Quick map table. Nothing existing was changed or removed.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/docs/references/knowledge-02-tonal-scale.md`: section 5 changes:
  - The `chromaEnvelope` pseudocode now uses the mode-mapped `damp` and `γ`, naming `EVEN_DAMP_FACTOR`, `OKHSL_DAMP_RESIDUE_EXP`, `OKHSL_DAMP_D` and `OKHSL_DAMP_CURVE_GAIN`.
  - The "edge damp **exactly**" claim is replaced by a correct statement: no shipped mode is the legacy damp.
  - Added a "curve is the spec" paragraph citing ADR-029 and the gate.
  - Added an `ENVELOPE_PRESETS` table with all 7 presets.
  - Added the anchored-deviation paragraph.
  - No `file:line` cites were added.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/.claude/skills/color-math/references/foundations.md`: the `chromaEnvelope` block now has the same mode-mapped `damp` and `γ` lines.
- `/Users/kimgranlund/Projects/nonoun/ultimate-tokens/.worktrees/gh-778/.claude/skills/color-math/SKILL.md`: rule 3 now names ADR-029, `ENVELOPE_PRESETS`, and the gate's SPEC with its curve and residue legs. It also says a curve change updates the SPEC and ADR-029 together. The `DEFAULT_CONTROLS.hueSpace` line (line 78) is unchanged.

## Checks
- (red) ADR-029 sits before Quick map (awk): exit 0.
- (red) The ADR-029 section contains all 12 required terms: exit 0.
- (red) A `| ADR-029 |` row exists in the Quick map: exit 0.
- (guard) No `-` lines in the decision-records diff against `4013aa81`: pass.
- (red) `OKHSL_DAMP_CURVE_GAIN` and `OKHSL_DAMP_RESIDUE_EXP` are in knowledge-02 and foundations; `ENVELOPE_PRESETS` and `ADR-029` are in knowledge-02 and SKILL.md: exit 0.
- (red) `edge damp **exactly**` no longer appears in knowledge-02: exit 0.
- (guard) `node test/repo/citations.mjs` reports STALE 0 across 10 discovered docs and 10 fact pins. `node test/repo/em-dash.mjs` reports clean (1325 files): pass.
- (guard) `npm test`: exit 0, all 54 test files passed, and the tree was unchanged afterwards. Ran twice: once after the main edits, and again after two final wording edits.
- (guard) `npm run build`: exit 0, tree unchanged afterwards. `node_modules` was already present, so `npm ci` was skipped.
- (guard) `SDLC_GATE_WORKERS=10 python3 .../0.21.0/scripts/gate_lock.py run --name sweeps -- npm run gate:sweeps`: exit 0 with no FAIL lines. It included `pass chroma-envelope: curve exact at 438000 stops; residue within TOL at 438000 stops; direction holds in 3 modes` and the mode-isolation pass.
- (guard) `node scripts/report-preset-fidelity.mjs --identity-control --base 4013aa81...`: exit 0, 0 differing cells in all 3 modes for the corpus and the default kit.
- (guard) Scope check against base `4013aa81`: no paths outside the allowed list.
- Evidence the ADR cites: `node scripts/report-preset-fidelity.mjs --envelope-residue` printed `residue: 0 stop(s) outside TOL over 770880 stops`, exit 0.
- Figures the ADR states, checked against the engine with `chromaEnvelope` at damp 70 / dampCurve 1.5: perceptual env(300) 0.7435 and env(100) 0.2304. Also `OKHSL_DAMP_RESIDUE_EXP` 2.1796 and `OKHSL_DAMP_CURVE_GAIN` 1.0566.

## Notes
- The sweeps run took more than 600 s at a load average of about 19. The Bash tool moved it to the background, and I waited for it to finish (exit 0) before reporting.
- knowledge-02 section 5 and foundations.md still say "`VIVID_MIDS.dampAmp` ships at 0 rather than 55". That is correct: `VIVID_MIDS` is a different constant in `scripts/gen-categories.mjs` (damp 70 / 1.5 / 0 / 0, the same values as Curated), not the "Vivid mids" entry in `ENVELOPE_PRESETS` (dampAmp 55, the editor chip). The presets table row says this so the two numbers do not look contradictory.
- The ADR's Gate A text includes the exclusions the gate applies:
  - perceptual and peak: both models under the s clamp, and the stop not capped;
  - even: the stop not refined, not damped by the group, and not the anchored stop 500.
  This matches step 2's recorded deviation, so the ADR does not claim more than the gate checks.
- The ADR Status line is PROPOSED, following the ADR-028 pattern. Ratification is the owner's.
- No throwaway worktree was created. Nothing was committed.
