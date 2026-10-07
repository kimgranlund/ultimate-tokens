## Task goal
Make the chroma envelope's closed-form curve the spec: a few named preset curves (each a damp, dampCurve, shoulder triple, knobs still exposed), and gates that assert the continuous curve within one stated tolerance instead of pinning rounded 8-bit pixel values. Full issue: `gh issue view 778`.

## Step 3: ADR-029, repaired curve copies, gates green
level: L3
guard timeout: 3000
### Read first
- `docs/references/AGENTS.md`
### Do
Depends on: steps 1 and 2.
- `docs/references/decision-records.md`: append `## ADR-029: The chroma envelope's closed form is the spec` immediately before `## Quick map` (ADRs go before the Quick map per `.claude/CLAUDE.md`). Date it 2026-10-07 and reference #778, #725 and ADR-026. State:
  - The closed form with its mode map: `OKHSL_DAMP_D` 0.9275, `OKHSL_DAMP_RESIDUE_EXP` = ln(1 - d)/ln(0.3), `OKHSL_DAMP_CURVE_GAIN` = log2(3)/1.5, `EVEN_DAMP_FACTOR` 0.25, `EVEN_NEIGHBOURHOOD_R` 0.2.
  - `ENVELOPE_PRESETS` and `envelopePresetOf`. Presets are slider data, and the knobs stay exposed. Curated is the corpus setting: perceptual env(300) 0.744 and env(100) 0.230 against the 0.75 and 0.25 bars. Default is the kit's `DEFAULT_CONTROLS`.
  - Gate A: exactness against the gate's SPEC to 1e-12, and the record fields.
  - Gate B: `TOL_CODES` 1, then 2 for damped and capped stops (capped one-sided), then 4 = 1 + `enforceMonotonePixelL`'s RADIUS for refined stops. Name the gamut-edge rule (`EDGE_S` 0.999) and the white-point rule (#FFFFFF reads CAM16 C 2.869). The evidence is `node scripts/report-preset-fidelity.mjs --envelope-residue`, with 0 stops outside TOL.
  - How an anchored ramp deviates. The basis is the anchor's OKHSL s, held constant, on perceptual and peak. On even it is the `anchorChromaBasis` smoothstep blend toward the hue's peak. An anchor outside [RAMP_L_MIN, RAMP_L_MAX] renders a clamped pivot. The curve itself is unchanged and passes through the anchor: env(500) = 1, and stop 500 emits the anchor verbatim when unclamped.
  - Consequences: `test/engine/fixtures/chroma-envelope.json` is retired and its owner clause moves here, so a change that moves the curve updates the gate's SPEC and this ADR in the same change. `NAMED_EXCEPTIONS` and `OVER_90_AT_300` stay report-only.
  - Add one Quick map row `| ADR-029 | ... | ... |`. Append only: no existing line changes.
- `docs/references/knowledge-02-tonal-scale.md` §5: replace the `chromaEnvelope` pseudocode block (around line 146) with the mode-mapped form naming `OKHSL_DAMP_RESIDUE_EXP` and `OKHSL_DAMP_CURVE_GAIN`. Replace the "reduce it to the legacy ... edge damp **exactly**" claim, which has been false on perceptual and peak since #725. Add a presets table that cites `ENVELOPE_PRESETS` and ADR-029, and the anchored-deviation statement. Cite paths without `:line`: a `file:line` cite makes the doc join the citations audit, and any later engine edit can stale it.
- `.claude/skills/color-math/references/foundations.md` (the block at line 96): the same mode-mapped form, naming `OKHSL_DAMP_RESIDUE_EXP` and `OKHSL_DAMP_CURVE_GAIN`. `.claude/skills/color-math/SKILL.md` rule 3 (lines 115-122): name `ENVELOPE_PRESETS`, the gate's SPEC with its curve and residue legs, and ADR-029. Keep the SKILL.md line that holds `` `DEFAULT_CONTROLS.hueSpace` `` and `"oklch"` intact: `test/repo/citations.mjs` fact pin `skill hueSpace default` reads it.
- Citations trap check: this step edits only docs and skill files, and none of them is a cite target of the 10 discovered docs (targets are under `src/`, `test/`, `scripts/` and `figma/`), so it cannot stale a cite unless it adds a `file:line` cite itself. The citations guard below runs the gate directly, so a red fact pin or cite surfaces by name rather than inside `npm test`.
- Gates, in this tree. Run `npm test` once (its generators are a no-op after step 1's regeneration; if they still change a generated file, that is step 1 or step 2 drift to fix here), then run every guard below. Run `npm ci` before `npm run build` only if the tree has no `node_modules`. Run the sweeps through `gate_lock.py` with `SDLC_GATE_WORKERS=10`, and rerun a browser-style red under load once alone before counting it.
- Fix any red that steps 1 and 2 introduced (em dash: `node test/repo/em-dash.mjs --fix`; branding; citations). A gate that is red at this step's base for a cause outside the plan comes back as Status `inherited red`.
- Never push, open a PR, comment on an issue, or commit `*.log`, `.run.lock` or `*.attempt.json`.
### Acceptance criteria
- (red) `awk '/^## ADR-029:/{a=NR} /^## Quick map/{q=NR} END{exit !(a && q && a<q)}' docs/references/decision-records.md`
- (red) `s=$(awk '/^## ADR-029:/,/^## Quick map/' docs/references/decision-records.md) && for t in ENVELOPE_PRESETS envelopePresetOf OKHSL_DAMP_D OKHSL_DAMP_CURVE_GAIN EVEN_DAMP_FACTOR EVEN_NEIGHBOURHOOD_R TOL_CODES enforceMonotonePixelL anchorChromaBasis chroma-envelope-gate.mjs envelope-residue 2.869; do printf '%s\n' "$s" | grep -qF -- "$t" || exit 1; done`
- (red) `awk '/^## Quick map/{q=1} q && /^\| ADR-029 \|/{f=1} END{exit !f}' docs/references/decision-records.md`
- (guard) `test -z "$(git diff "$SDLC_BASE_SHA" -- docs/references/decision-records.md | grep -E '^-' | grep -v -E '^--- ')"`
- (red) `for f in docs/references/knowledge-02-tonal-scale.md .claude/skills/color-math/references/foundations.md; do grep -q OKHSL_DAMP_CURVE_GAIN "$f" || exit 1; grep -q OKHSL_DAMP_RESIDUE_EXP "$f" || exit 1; done && for f in docs/references/knowledge-02-tonal-scale.md .claude/skills/color-math/SKILL.md; do grep -q ENVELOPE_PRESETS "$f" || exit 1; grep -q ADR-029 "$f" || exit 1; done`
- (red) `! grep -qF 'edge damp **exactly**' docs/references/knowledge-02-tonal-scale.md`
- (guard) `node test/repo/citations.mjs >/dev/null 2>&1 && node test/repo/em-dash.mjs >/dev/null 2>&1`
- (guard) `b=$(git status --porcelain) && npm test >/dev/null 2>&1 && test "$(git status --porcelain)" = "$b"`
- (guard) `npm run build >/dev/null 2>&1`
- (guard) `SDLC_GATE_WORKERS=10 python3 /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/0.21.0/scripts/gate_lock.py run --name sweeps -- npm run gate:sweeps >/dev/null 2>&1`
- (guard) `node scripts/report-preset-fidelity.mjs --identity-control --base "$SDLC_BASE_SHA"`
- (guard) `test -z "$( { git diff --name-only "$SDLC_BASE_SHA" -- . ':(exclude).sdlc' ':(exclude).claude/settings.json'; git ls-files --others --exclude-standard -- . ':(exclude).sdlc'; } | grep -vxE "src/engine/tonal\.js|test/engine/tonal\.mjs|src/ui/app-helpers\.mjs|src/ui/sections/color\.js|src/ui/describe-mcp-assets\.js|figma/plugin/ui\.html|docs/references/component-inventory\.md|docs/references/rubrics/acceptance-criteria\.md|docs/specs/app-shell\.md|docs/specs/spec-cell\.md|docs/reports/2026-08-20-reactivity/00-synthesis\.md|docs/reports/2026-08-20-reactivity/01-core-reactivity\.md|docs/reports/2026-08-20-reactivity/02-sections-and-resolvers\.md|docs/reports/2026-08-20-reactivity/03-stores-and-persistence\.md|docs/reports/2026-08-20-reactivity/04-context-and-messaging\.md|test/engine/chroma-envelope-gate\.mjs|test/engine/fixtures/chroma-envelope\.json|scripts/lib/envelope-measure\.mjs|scripts/report-preset-fidelity\.mjs|docs/references/decision-records\.md|docs/references/knowledge-02-tonal-scale\.md|\.claude/skills/color-math/references/foundations\.md|\.claude/skills/color-math/SKILL\.md")"`
