# Handoff chroma-floor U4 · builder to orchestrator (pass 1, #701)

| Field | Value |
|---|---|
| Branch | `unit/cf-U4` off `plan/chroma-floor`, code commit bbb72843 |
| Files | `test/engine/tonal.mjs` (R1 comment), `docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,04-context-and-messaging}.md` (R2 985), `docs/reference/SKILL.md`, `docs/reference/rubrics/acceptance-criteria.md` (R3 735-884), `src/engine/tonal.js` (F1, F4), `test/engine/mode-isolation-gate.mjs` + `fixtures/mode-isolation.json` (F3 header and owner, kept identical), `scripts/report-preset-fidelity.mjs`, `test/engine/anchor.mjs` (F4), regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` (comment bytes only) |
| Ran | `node test/repo/citations.mjs` 🟢 STALE 0, no NEAR; `npm test` 🟢 exit 0, `all 54 test files passed`; em-dash bytes 0 in the diff; comment and doc edits only |
| Left out | build and smoke (no build-chain change); the F4 clause on `floorRef` taken at the base or seed hue (`tonal.js:936`, `:946`) is not a history comment and was not in the brief, so no comment was added; `.sdlc/board.md` untouched |

Line pins: R2 `okhslLAt` is at 985 and both reviews cite 985. R3 `lift-monotonic` heading is 735, block-closing `}` is 884, both docs pin 735-884. Every edit sits after line 735 in `tonal.mjs` or is line-count neutral before 985 in `tonal.js`, so no pin moved.

~~~sh ran
sh cmds.sh   # run at bbb72843; same at d1db4b04 in a detached checkout for the negative control
grep -n 'function okhslLAt' src/engine/tonal.js
/usr/bin/grep -n 'tonal.js:98[0-9]' docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md | cut -c1-140
/usr/bin/grep -o 'tonal.mjs:7[0-9][0-9]-[0-9]* `lift-monotonic`\|tonal.mjs:7[0-9][0-9]-[0-9]*` lift-monotonic' docs/reference/SKILL.md docs/reference/rubrics/acceptance-criteria.md
/usr/bin/grep -n 'lift-monotonic (#648)' test/engine/tonal.mjs | cut -c1-60
/usr/bin/grep -n 'lift-skew\|skew-lift-okhsl (#647)' test/engine/tonal.mjs | head -1 | cut -c1-60
/usr/bin/grep -n "evenChroma\`'s floorRef" test/engine/tonal.mjs | cut -c1-120
/usr/bin/grep -n 'at lift 0' src/engine/tonal.js | cut -c1-100
/usr/bin/grep -n 'EVEN_DIP_BASELINE.s 90 named' src/engine/tonal.js | cut -c1-100
/usr/bin/grep -n 'since-retired' scripts/report-preset-fidelity.mjs | cut -c1-110
/usr/bin/grep -n 'both since retired' test/engine/anchor.mjs | cut -c1-110
/usr/bin/grep -n 'curated corpus' test/engine/mode-isolation-gate.mjs test/engine/fixtures/mode-isolation.json | cut -c1-130
~~~

~~~out ran
# at bbb72843
985:export function okhslLAt(lstar) {
999:function okhslLAtChromatic(targetLstar, hue, s) {
docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md:89:- `okhslLAt` (`src/engine/tonal.js:985`) lost its module-level `_okL` memo M
docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md:71:- `_okL` (a module-level `Map`, `L*.toFixed(2) → OKHSL lightness
docs/reference/SKILL.md:tonal.mjs:735-884 `lift-monotonic`
docs/reference/rubrics/acceptance-criteria.md:tonal.mjs:735-884` lift-monotonic
735:// ── hpg-tonal-lift-monotonic (#648): `lift` must not f
886:// ── hpg-tonal-skew-lift-okhsl (#647): the per-palette 
1523:  // two stops from the anchor; `evenChroma`'s floorRef (src/engine/tonal.js) takes the floor's gamut
358:// dampBias/lift combination, unconditionally, not only at lift 0 (R2, revised from the first dr
364:// R1 (reverted) measured sd against the RAW numeric anchorStop instead: exact only at lift 0, a
423:// 90 stop units at lift 0, just under two of the ramp's own 50-unit steps either side of the an
425:// stays clear of stops 400/600 at lift 0; under lift `liftStop` sets the reach, and above
409:// retired EVEN_DIP_BASELINE's 90 named dips (a different predicate, tonal.mjs's own `findDips`,
20:// the since-retired `EVEN_DIP_BASELINE`'s `findDips` and this same file's pre-fa0264fa reading both used  
652:// KNOWN_BASELINE_DUP/EVEN_DIP_BASELINE comments (both since retired) cited as U3's shipped chromaEnvelope
test/engine/mode-isolation-gate.mjs:10:// The fingerprint covers the curated corpus's own content as well as the engine (fingerpri
test/engine/mode-isolation-gate.mjs:71:    owner: "the plan that moves perceptual or peak, or edits any curated corpus document or
test/engine/fixtures/mode-isolation.json:2: "owner": "the plan that moves perceptual or peak, or edits any curated corpus document
~~~

~~~out ran
# negative control at d1db4b04 (old lines)
985:export function okhslLAt(lstar) {
999:function okhslLAtChromatic(targetLstar, hue, s) {
docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md:89:- `okhslLAt` (`src/engine/tonal.js:983`) lost its module-level `_okL` memo M
docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md:71:- `_okL` (a module-level `Map`, `L*.toFixed(2) → OKHSL lightness
docs/reference/SKILL.md:tonal.mjs:722-743 `lift-monotonic`
docs/reference/rubrics/acceptance-criteria.md:tonal.mjs:722-743` lift-monotonic
735:// ── hpg-tonal-lift-monotonic (#648): `lift` must not f
886:// ── hpg-tonal-skew-lift-okhsl (#647): the per-palette 
1523:  // two stops from the anchor; `evenChroma`'s floorRef (src/engine/tonal.js) caps the floor's gamut
358:// dampBias/lift combination, unconditionally, not only at lift 0 (R2, revised from the first dr
364:// R1 (reverted) measured sd against the RAW numeric anchorStop instead: exact only at lift 0, a
423:// 90 stop units at lift 0, just under two of the ramp's own 50-unit steps either side of the an
425:// stays clear of stops 400/600 at lift 0 only; under lift `liftStop` sets the reach, and above
409:// EVEN_DIP_BASELINE's 90 named dips (a different predicate, tonal.mjs's own `findDips`, U2's to
~~~
