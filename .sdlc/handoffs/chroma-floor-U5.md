# Handoff chroma-floor U5 · builder to orchestrator (pass 1, #701)

| Field | Value |
|---|---|
| Branch | `unit/cf-U5` off `plan/chroma-floor` @ b25da145 (revision 25); fix commit e7c86afe |
| Files | `test/engine/anchor.mjs:651-652` (H1), `src/engine/tonal.js:318,327-329` (cap condition; `:318` joins the old `:318-319` so the file keeps 1359 lines and `okhslLAt` stays at 994), `test/engine/tonal.mjs:1526` (one line for one line), `docs/reference/SKILL.md:95` and `docs/reference/rubrics/acceptance-criteria.md:25` (pin `301-327`), `test/engine/mode-isolation-gate.mjs:21-25`, regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` (comment bytes only) |
| Ran | the block below at e7c86afe with the same block at 38bd0dea as control; `node scripts/audit-citations.mjs` exit 0, STALE 0, NEAR 11 at both b25da145 and e7c86afe with an identical NEAR set (`diff` empty); `node test/repo/citations.mjs` `STALE 0`; `npm test` on the e7c86afe tree `✓ all 54 test files passed`, exit 0; the final-head run goes in the report to the Orchestrator |
| Left out | build and smoke (no build-chain change); `.sdlc/board.md` and the plan untouched |

🟡 `sh .sdlc/checks/baseline-agrees-check.sh` now prints `STALE ui.html: baseline 4130.1 KB, tree 4130.3 KB` (stale total 2, was 1 with `time test` only). The tonal.js comment bytes ride into the bundle. C12 already allows the `ui.html` line alone to be STALE on an engine change; the baseline is not edited here.

## Claims per changed sentence

| Line | Claim | Check (block below) | e7c86afe | 38bd0dea |
|---|---|---|---|---|
| anchor.mjs:651 | the file has no `anchorChromaBasis` import, so the credit is gone | H1 a, a' | import lines `0`, credit text `0` | import lines `0`, credit text `1` (the false claim) |
| anchor.mjs:651 | tonal.js's comment above `chromaEnvelope` cites R2 | H1 b | `:358`, `:376`, `:379` | same |
| anchor.mjs:652 | tonal.mjs's C6 gate cites R2 | H1 c | `:1210-1211` | same |
| anchor.mjs:652 | `KNOWN_BASELINE_DUP` belongs to the C6 gate | H1 d | 4 `(C6 ii)` lines | same |
| tonal.js:327 | the cap is `min(maxc, floorRef)` and floorRef is the max of three ceilings, so at 450/550 it is that stop's ceiling when both are read at one hue and tone | f, g | `:338`, `:813`, `:945`; anchored tone `:812` and `:823` are the same `anchorLerp` call, paletteStops tone `:948` and `:945` the same `toneAt` call | same code |
| tonal.js:327 | exact at hueShift 0 on the cam16 path | g | hue is `resolvedHue + shift*dir` (`:847`) with `resolvedHue = seedHue` unless `oklchSpace` (`:838-839`); `baseHue + shift*dir` (`:955`) | same code |
| tonal.js:327-328 | both floorRef call sites name the approximate cases | h | `:809`, `:943` | same |
| tonal.js:328 and tonal.mjs:1526 | from 450/550 outward the floor never rises | sweep, unimodal | `rises 0` of 51840 steps; every hue unimodal | same; `--no-ref` control (the old `chromaFloor%*maxc` floor) `rises 9005` |
| tonal.mjs:1526 | no dip guarantee; the gate is what holds it | l | `:1527` the even branch reds on any dip | same line; old text `so the valley cannot form` `1` there, `0` here |
| docs pins | `okhsl-modes` spans `:301` to `:327` | m | header `:301`, last `FAIL("okhsl-modes"` `:326`, `}` `:327`, next section `:329`; pins read `301-327` | pins read `301-319` |
| gate:21-22 | capture writes the HEAD sha (`unknown` outside git) to `capturedAt` and prints it | n | `:70`, `:74`, `:79`, `:80` | `:68`, `:72`, `:77`, `:78` |
| gate:22 | used only by hand | o | `0` callers in package.json, .github, scripts, test, src | `0` |
| gate:23-24 | scope matches the `owner` field and the fingerprint note | p | `owner` `:73`, note `:11` | `:71`, `:11` |
| gate:24-25 | #725 per #701 revision 8 | q | `1` | `1` |
| all | comments only, no behaviour change | nc | `0` non-comment source lines changed 38bd0dea..e7c86afe; planted control `1` | n/a |

Cut: the old `--capture` text said the sha is named "in this header and in the fixture's own `owner` field". The header names no sha and `owner` carries none (`capturedAt` does), so that clause is gone.

~~~sh ran
# from the cf-U5 worktree; claims.sh run once per ref
sh claims.sh e7c86afe; sh claims.sh 38bd0dea
# claims.sh:
#   # usage: sh claims.sh <ref>   (run from the cf-U5 worktree)
#   R=$1
#   A() { git show "$R:test/engine/anchor.mjs"; }
#   TJ() { git show "$R:src/engine/tonal.js"; }
#   TM() { git show "$R:test/engine/tonal.mjs"; }
#   MI() { git show "$R:test/engine/mode-isolation-gate.mjs"; }
#   echo "== ref $R = $(git rev-parse --short "$R")"
#   echo "-- H1 a: import lines naming anchorChromaBasis in anchor.mjs"; A | grep -n '^import' | grep -c anchorChromaBasis
#   echo "-- H1 a': the import credit text"; A | grep -c "this file's \`anchorChromaBasis\` import"
#   echo "-- H1 new text"; A | grep -n "cited as R2 in tonal.js's comment above \`chromaEnvelope\`"
#   echo "-- H1 b: R2 in the comment block between evenChroma and chromaEnvelope"; TJ | awk '/^function evenChroma/{f=1} /^export function chromaEnvelope/{f=0} f && /R2/{print NR": "$0}' | cut -c1-110
#   echo "-- H1 c: tonal.mjs C6 comment names R2"; TM | grep -n -A1 '// C6  -  env(anchor)=1' | cut -c1-110
#   echo "-- H1 d: KNOWN_BASELINE_DUP asserted under (C6 ii)"; TM | grep -n '(C6 ii)' | grep -c 'KNOWN_BASELINE_DUP\|cited list'
#   echo "-- H1 e: 2573208c subject"; git show -s --format='%h %s' 2573208c
#   echo "-- tonal.js f: floor cap and both floorRef call sites"; TJ | grep -n 'Math.min(maxc, floorRef)\|const floorRef = Math.max' | cut -c1-150
#   echo "-- tonal.js g: floorRef tone and the stop's tone (anchored path), same expression"; TJ | grep -n 'const firstStepTone = \|    const tone = anchorLerp(' | cut -c1-200
#   echo "-- tonal.js g: stop hue, anchored path (resolvedHue = seedHue unless hueSpace oklch)"; TJ | grep -n 'let resolvedHue = seedHue;\|if (oklchSpace) {\|const hue = (((resolvedHue + shift \* dir)'
#   echo "-- tonal.js g: paletteStops path tone and hue"; TJ | grep -n '    const tone = toneAt(stop, palette.skew, palette.lift, ctl);\|const hue = (((baseHue + shift \* dir)'
#   echo "-- tonal.js h: call sites name the approximate cases"; TJ | grep -n 'approximation' | cut -c1-120
#   echo "-- tonal.js k: new text"; TJ | grep -n 'exact at hueShift 0 on the cam16 path; both floorRef call sites name'
#   echo "-- tonal.js j: line count, okhslLAt line"; TJ | wc -l | tr -d ' '; TJ | grep -n '^export function okhslLAt'
#   echo "-- tonal.mjs l: new text, old text"; TM | grep -n 'at hueShift 0 on cam16 the floor does not rise from 450/550 outward' | cut -c1-60; TM | grep -c 'so the valley cannot form'
#   echo "-- tonal.mjs l: the gate the note defers to"; TM | grep -n 'The even branch below reds on ANY dip'
#   echo "-- tonal.mjs line count"; TM | wc -l | tr -d ' '
#   echo "-- pin m: okhsl-modes section bounds"; TM | awk 'NR==301||NR==326||NR==327||NR==329' | cut -c1-80
#   echo "-- pin m: docs pins"; git grep -n -o 'tonal.mjs:301-3[0-9][0-9]' "$R" -- docs/reference/SKILL.md docs/reference/rubrics/acceptance-criteria.md
#   echo "-- mode-isolation n: what --capture writes and prints"; MI | grep -n 'let sha = "unknown"\|capturedAt: sha\|writeFileSync(FIXTURE_URL\|console.log(`captured' | cut -c1-110
#   echo "-- mode-isolation o: callers passing --capture outside the gate and records"; git grep -n -- '--capture' "$R" -- package.json .github scripts test src | grep -v 'test/engine/mode-isolation-gate.mjs' | wc -l | tr -d ' '
#   echo "-- mode-isolation p: owner scope, fingerprint note"; MI | grep -n 'owner: "the plan that moves perceptual or peak, or edits any curated corpus document or the default kit' | cut -c1-60; MI | grep -n 'so a red here also follows a palette-content change to any curated document or the' | cut -c1-40
#   echo "-- mode-isolation q: #725 in the plan's revision 8 text"; git show "$R:.sdlc/plans/chroma-floor.md" | grep -c 'revision 8: a frozen fixture would otherwise collide with #725'
#   echo "-- mode-isolation new text, old text"; MI | grep -n 'by the plan$\|that moves perceptual or peak or edits a curated corpus document' | cut -c1-60; MI | grep -c 'by whichever$\|plan next moves perceptual or peak (#725'
# sweep (norise.mjs), run on e7c86afe's tree and on `git archive 38bd0dea src`:
#   // For every integer hue at hueShift 0 (the paletteStops path's floorRef construction, tonal.js floorRef
#   // in paletteStops), check min(maxc, floorRef) never rises from 450 outward to 50 and from 550 outward to 950.
#   const root = process.argv[2];
#   const { maxChromaInGamut } = await import(root + "/src/engine/hct.js");
#   const { toneAt, DEFAULT_CONTROLS, STOPS } = await import(root + "/src/engine/tonal.js");
#   const ctl = { curve: DEFAULT_CONTROLS.curve, lmin: DEFAULT_CONTROLS.lmin, lmax: DEFAULT_CONTROLS.lmax, tension: DEFAULT_CONTROLS.tension };
#   let cells = 0, rises = 0, worst = 0;
#   for (const skew of [-50, 0, 50]) for (const lift of [-20, 0, 20]) for (let h = 0; h < 360; h++) {
#     const c = (s) => maxChromaInGamut(h, toneAt(s, skew, lift, ctl));
#     const ref = process.argv[3] === "--no-ref" ? Infinity : Math.max(c(500), c(450), c(550));
#     const cap = (s) => Math.min(c(s), ref);
#     const light = STOPS.filter((s) => s <= 450).sort((a, b) => b - a);
#     const dark = STOPS.filter((s) => s >= 550).sort((a, b) => a - b);
#     for (const side of [light, dark]) for (let i = 1; i < side.length; i++) {
#       cells++;
#       const d = cap(side[i]) - cap(side[i - 1]);
#       if (d > 1e-9) { rises++; worst = Math.max(worst, d); }
#     }
#   }
#   console.log(`steps ${cells} rises ${rises} worst ${worst.toFixed(4)}`);
# unimodal.mjs:
#   // For every integer hue, is maxChromaInGamut(h, t) unimodal in tone over t = 1..99 (step 0.25)?
#   const { maxChromaInGamut } = await import(process.argv[2] + "/src/engine/hct.js");
#   let bad = 0;
#   for (let h = 0; h < 360; h++) {
#     let falling = false, prev = -1;
#     for (let t = 1; t <= 99; t += 0.25) {
#       const c = maxChromaInGamut(h, t);
#       if (c < prev - 1e-9) falling = true; else if (falling && c > prev + 1e-9) { bad++; break; }
#       prev = c;
#     }
#   }
#   console.log(`hues 360 non-unimodal ${bad}`);
for root in "$W" "$T/base"; do node norise.mjs $root; node norise.mjs $root --no-ref; node unimodal.mjs $root; done
git diff 38bd0dea e7c86afe -- '*.js' '*.mjs' ':!figma/plugin/ui.html' ':!src/ui/describe-mcp-assets.js' | grep -E '^[-+]' | grep -vE '^(\+\+\+|---)' | grep -vE '^[-+]\s*//' | wc -l
printf '+  const x = 1;\n+// comment\n' | grep -E '^[-+]' | grep -vE '^[-+]\s*//' | wc -l   # nc control
~~~

~~~out ran
== ref e7c86afe = e7c86afe
-- H1 a: import lines naming anchorChromaBasis in anchor.mjs
0
-- H1 a': the import credit text
0
-- H1 new text
651:// U3 review pass 2, R2) - the same fix, cited as R2 in tonal.js's comment above `chromaEnvelope` and in
-- H1 b: R2 in the comment block between evenChroma and chromaEnvelope
358: // dampBias/lift combination, unconditionally, not only at lift 0 (R2, revised from the first draft below
376: // R2 (shipped) re-centres sd on the anchor's own lifted reading. On the corpus the product renders, this
379: // cost is real and disclosed, not free: 21 of the SAME 10,080 synthetic grid cells rise under R2, worst
-- H1 c: tonal.mjs C6 comment names R2
1210:  // C6  -  env(anchor)=1 for EVERY damp/dampCurve/dampAmp/dampBias/lift combination, not only lift 0
1211-  // (R2: sd measured against `liftStop(anchorStop, lift)`, the anchor's own lifted reading, closes the
-- H1 d: KNOWN_BASELINE_DUP asserted under (C6 ii)
4
-- H1 e: 2573208c subject
2573208c fix(tonal): re-centre chromaEnvelope on the anchor's own lifted reading (#681 U3)
-- tonal.js f: floor cap and both floorRef call sites
338:  const floorC = Math.min(((chromaFloor ?? 0) / 100) * Math.min(maxc, floorRef), intended);
813:  const floorRef = Math.max(maxc500, maxChromaInGamut(seedHue, firstStepTone(450)), maxChromaInGamut(seedHue, firstStepTone(550)));
945:  const floorRef = Math.max(maxc500, maxChromaInGamut(baseHue, toneAt(450, palette.skew, palette.lift, ctl)), maxChromaInGamut(baseHue, toneAt(550
-- tonal.js g: floorRef tone and the stop's tone (anchored path), same expression
812:  const firstStepTone = (s) => anchorLerp(pivotTone, controls.lmax ?? 100, controls.lmin ?? 5, s, palette.skew ?? 0, palette.lift ?? 0, controls.curve, controls.tension);
823:    const tone = anchorLerp(pivotTone, controls.lmax ?? 100, controls.lmin ?? 5, stop, palette.skew ?? 0, palette.lift ?? 0, controls.curve, controls.tension);
-- tonal.js g: stop hue, anchored path (resolvedHue = seedHue unless hueSpace oklch)
838:    let resolvedHue = seedHue;
839:    if (oklchSpace) {
847:    const hue = (((resolvedHue + shift * dir) % 360) + 360) % 360;
-- tonal.js g: paletteStops path tone and hue
948:    const tone = toneAt(stop, palette.skew, palette.lift, ctl);
955:    const hue = (((baseHue + shift * dir) % 360) + 360) % 360;
-- tonal.js h: call sites name the approximate cases
302:  // the least-bad chromatic candidate is only an approximation that never actually reached the target
809:  // path, an approximation under edge rotation or the OKLCH per-stop hue solve. Not exact in tone for a
943:  // rotation (below): exact for the rendered stops at hueShift 0, an approximation under edge rotation.
-- tonal.js k: new text
327:// equals that stop's own ceiling (exact at hueShift 0 on the cam16 path; both floorRef call sites name
-- tonal.js j: line count, okhslLAt line
1359
994:export function okhslLAt(lstar) {
-- tonal.mjs l: new text, old text
1526:  // toward grey), so at hueShift 0 on cam16 the floor 
0
-- tonal.mjs l: the gate the note defers to
1527:  // The even branch below reds on ANY dip at a stop other than 500 under its own gate name,
-- tonal.mjs line count
1997
-- pin m: okhsl-modes section bounds
// ── hpg-tonal-okhsl-modes: the perceptual & peak distributions (OKHSL path), i
  if (!(at(500) > at(100) + 2 && at(500) > at(900) + 2)) FAIL("okhsl-modes", `pe
}
// ── hpg-tonal-cusp-pull: a PER-PALETTE cuspPull nudges that palette's richest 
-- pin m: docs pins
e7c86afe:docs/reference/SKILL.md:95:tonal.mjs:301-327
e7c86afe:docs/reference/rubrics/acceptance-criteria.md:25:tonal.mjs:301-327
-- mode-isolation n: what --capture writes and prints
70:  let sha = "unknown";
74:    capturedAt: sha,
79:  writeFileSync(FIXTURE_URL, JSON.stringify(fx, null, 1) + "\n");
80:  console.log(`captured perceptual ${perceptual} peak ${peak} at ${sha} (${corpusLabel})`);
-- mode-isolation o: callers passing --capture outside the gate and records
0
-- mode-isolation p: owner scope, fingerprint note
73:    owner: "the plan that moves perceptual or peak, or ed
11:// corpus presets), so a red here als
-- mode-isolation q: #725 in the plan's revision 8 text
1
-- mode-isolation new text, old text
23:// that moves perceptual or peak or edits a curated corpu
0

== ref 38bd0dea = 38bd0dea
-- H1 a: import lines naming anchorChromaBasis in anchor.mjs
0
-- H1 a': the import credit text
1
-- H1 new text
-- H1 b: R2 in the comment block between evenChroma and chromaEnvelope
358: // dampBias/lift combination, unconditionally, not only at lift 0 (R2, revised from the first draft below
376: // R2 (shipped) re-centres sd on the anchor's own lifted reading. On the corpus the product renders, this
379: // cost is real and disclosed, not free: 21 of the SAME 10,080 synthetic grid cells rise under R2, worst
-- H1 c: tonal.mjs C6 comment names R2
1210:  // C6  -  env(anchor)=1 for EVERY damp/dampCurve/dampAmp/dampBias/lift combination, not only lift 0
1211-  // (R2: sd measured against `liftStop(anchorStop, lift)`, the anchor's own lifted reading, closes the
-- H1 d: KNOWN_BASELINE_DUP asserted under (C6 ii)
4
-- H1 e: 2573208c subject
2573208c fix(tonal): re-centre chromaEnvelope on the anchor's own lifted reading (#681 U3)
-- tonal.js f: floor cap and both floorRef call sites
338:  const floorC = Math.min(((chromaFloor ?? 0) / 100) * Math.min(maxc, floorRef), intended);
813:  const floorRef = Math.max(maxc500, maxChromaInGamut(seedHue, firstStepTone(450)), maxChromaInGamut(seedHue, firstStepTone(550)));
945:  const floorRef = Math.max(maxc500, maxChromaInGamut(baseHue, toneAt(450, palette.skew, palette.lift, ctl)), maxChromaInGamut(baseHue, toneAt(550
-- tonal.js g: floorRef tone and the stop's tone (anchored path), same expression
812:  const firstStepTone = (s) => anchorLerp(pivotTone, controls.lmax ?? 100, controls.lmin ?? 5, s, palette.skew ?? 0, palette.lift ?? 0, controls.curve, controls.tension);
823:    const tone = anchorLerp(pivotTone, controls.lmax ?? 100, controls.lmin ?? 5, stop, palette.skew ?? 0, palette.lift ?? 0, controls.curve, controls.tension);
-- tonal.js g: stop hue, anchored path (resolvedHue = seedHue unless hueSpace oklch)
838:    let resolvedHue = seedHue;
839:    if (oklchSpace) {
847:    const hue = (((resolvedHue + shift * dir) % 360) + 360) % 360;
-- tonal.js g: paletteStops path tone and hue
948:    const tone = toneAt(stop, palette.skew, palette.lift, ctl);
955:    const hue = (((baseHue + shift * dir) % 360) + 360) % 360;
-- tonal.js h: call sites name the approximate cases
302:  // the least-bad chromatic candidate is only an approximation that never actually reached the target
809:  // path, an approximation under edge rotation or the OKLCH per-stop hue solve. Not exact in tone for a
943:  // rotation (below): exact for the rendered stops at hueShift 0, an approximation under edge rotation.
-- tonal.js k: new text
-- tonal.js j: line count, okhslLAt line
1359
994:export function okhslLAt(lstar) {
-- tonal.mjs l: new text, old text
1
-- tonal.mjs l: the gate the note defers to
1527:  // The even branch below reds on ANY dip at a stop other than 500 under its own gate name,
-- tonal.mjs line count
1997
-- pin m: okhsl-modes section bounds
// ── hpg-tonal-okhsl-modes: the perceptual & peak distributions (OKHSL path), i
  if (!(at(500) > at(100) + 2 && at(500) > at(900) + 2)) FAIL("okhsl-modes", `pe
}
// ── hpg-tonal-cusp-pull: a PER-PALETTE cuspPull nudges that palette's richest 
-- pin m: docs pins
38bd0dea:docs/reference/SKILL.md:95:tonal.mjs:301-319
38bd0dea:docs/reference/rubrics/acceptance-criteria.md:25:tonal.mjs:301-319
-- mode-isolation n: what --capture writes and prints
68:  let sha = "unknown";
72:    capturedAt: sha,
77:  writeFileSync(FIXTURE_URL, JSON.stringify(fx, null, 1) + "\n");
78:  console.log(`captured perceptual ${perceptual} peak ${peak} at ${sha} (${corpusLabel})`);
-- mode-isolation o: callers passing --capture outside the gate and records
0
-- mode-isolation p: owner scope, fingerprint note
71:    owner: "the plan that moves perceptual or peak, or ed
11:// corpus presets), so a red here als
-- mode-isolation q: #725 in the plan's revision 8 text
1
-- mode-isolation new text, old text
1

== sweep and unimodal, e7c86afe tree
steps 51840 rises 0 worst 0.0000
steps 51840 rises 9005 worst 41.3216
hues 360 non-unimodal 0
== sweep and unimodal, 38bd0dea src
steps 51840 rises 0 worst 0.0000
steps 51840 rises 9005 worst 41.3216
hues 360 non-unimodal 0
== nc
0
1
~~~
