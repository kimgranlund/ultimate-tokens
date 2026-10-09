## Task goal
A kit can opt in to a "match peer lightness" mode in which every enabled palette's ramp (and so the Radix export and 53 roles) lands at the same CIELAB lightness per stop across peer palettes, even when palettes are anchored or carry skew or lift. Default behaviour and every stored document and preset stay byte-identical.

## Step 3: The full-corpus sweeps read ramp@2
level: L3
### Do
Depends on: steps 1 and 2. Design: manifest node n4e (sweep legs); `.sdlc/adapter.md` gate rows `mode-isolation`, `even-dips`, `corpus-contrast`, `corpus-anchor`, `corpus-tonal`, `corpus-reset`. Run every sweep through the lock with `SDLC_GATE_WORKERS=10` (the criteria's command shape).

1. `test/engine/fixtures/mode-isolation.json`: re-capture with `node test/engine/mode-isolation-gate.mjs --full --capture` (its `owner` rule: the plan that moves perceptual or peak re-captures), and add to `owner` that T-0040 (ADR-036) moved perceptual and peak through `ramp@2` for the default kit and every preset opened through `presetDoc`. Record the old and new fingerprints in the builder result.
2. `npm run gate:corpus-anchor`: C2 and C3 unchanged; recount the C5 monotone, gap and distinct allow-lists (exact in FULL) in `test/engine/anchor.mjs`. A grown list is a declared cost: each new entry carries T-0040 and its reason (architect Risks: a band that starts at 100 steepens the interior on very dark or very light anchors), never a widened bound. The `anchor-ladder` order and dupe lists belong to the prime layer and must not change.
3. `npm run gate:corpus-tonal`: re-pin any FULL-only named list as step 2 item 3 does.
4. `npm run gate:even-dips`, `npm run gate:corpus-contrast`, `npm run gate:corpus-reset`: no re-baseline is allowed (0 dips, every accent at least 4.5:1, the reset sweep). A red here is a defect of step 2's band rule: return Status blocked with the witnesses, because the engine fix is outside this step.
5. `gate:sweep-prime` is not run here (prime is untouched, a step 2 guard); the whole `gate:sweeps` is step 5's.
### Acceptance criteria
- (red) `grep -qF "T-0040" test/engine/fixtures/mode-isolation.json && ! git diff --quiet "$SDLC_BASE_SHA" -- test/engine/fixtures/mode-isolation.json`
- `SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name mode-isolation-recapture -- npm run gate:mode-isolation`
- `SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name corpus-anchor -- npm run gate:corpus-anchor`
- `SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name corpus-tonal -- npm run gate:corpus-tonal`
- `SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name even-dips -- npm run gate:even-dips`
- `SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name corpus-contrast -- npm run gate:corpus-contrast`
- `SDLC_GATE_WORKERS=10 python3 "$(ls -d /Users/kimgranlund/.claude/plugins/cache/sdlc-lite/sdlc-lite/[0-9]*/scripts/gate_lock.py | sort -V | tail -1)" run --name corpus-reset -- npm run gate:corpus-reset`
- (guard) `test -z "$( { git diff --name-only "$SDLC_BASE_SHA" -- . ":(exclude).sdlc"; git ls-files --others --exclude-standard -- . ":(exclude).sdlc"; } | grep -vxE "src/engine/(tonal\.js|layers\.mjs|layer-pins\.mjs|layers/ramp@1\.mjs|layers/FROZEN\.json)|scripts/(bundle|gen-describe-mcp-assets|lib/envelope-measure)\.mjs|test/run\.mjs|test/engine/(layers|layer-pins|anchor|mode-isolation-gate|curated-contrast|tonal|peer-lightness|chroma-envelope-gate)\.mjs|test/engine/fixtures/(tonal-legacy|mode-isolation)\.json|test/ui/(model|shell|headless-boot)\.mjs|test/ui/fixtures/default-doc-ramps\.json|src/ui/describe-mcp-assets\.js|figma/plugin/ui\.html|docs/.+\.md")"`
