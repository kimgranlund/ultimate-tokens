# Handoff chroma-floor U4 · builder to orchestrator (pass 2, round 2, #701)

| Field | Value |
|---|---|
| Branch | `unit/cf-U4`, `plan/chroma-floor` @ 30feb979 (revision 22) merged in at 2b33ad5c; round 1 code 3fdd0712, review FAIL 88e34a9c, round 2 code commit 5327c23a |
| Files | `test/engine/anchor.mjs` (651-654: `KNOWN_BASELINE_DUP` live; the since-retired `EVEN_DIP_BASELINE` comment cited neither 2573208c nor R2 and named `paletteStopsAnchored`'s stop-500 pin and the `anchorChromaBasis` blend, per `fe65e640^` and `8ba4bee4` `tonal.mjs`), `src/engine/tonal.js` (F5: both `floorRef` comments name the hue; the anchored site says exact in hue at hueShift 0 on cam16 and names the clamped-anchor tone gap as part of `#766`), `docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,04-context-and-messaging}.md` (R2 pin now 994), `.sdlc/verdicts/chroma-floor-U4-review.md` moved by `git mv` to `.sdlc/reviews/` in 3fdd0712 (R100), regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` (comment bytes only) |
| Ran | the block below at 5327c23a, with controls at 8407e256 (round 1 head), a28b9b22 and d1db4b04; `node test/repo/citations.mjs` 🟢 STALE 0; `scripts/audit-citations.mjs` shows the four U4 pins `OK`; `npm test` runs at the final HEAD, the commit after this handoff, and its result goes in the report to the Orchestrator |
| Left out | build and smoke (no build-chain change); the `floorRef` behaviour (rendered hue and, for a clamped anchor, rendered tone) stays deferred to #766, and no engine line changed; review p2 🟡 3 (#766 labels) and 🟡 4 (`mode-isolation-gate.mjs:21-23`) are the Orchestrator's or out of this unit's lines; `.sdlc/board.md` untouched |

🟡 The L4 value moved. L4 expects `tonal.js:985`, but F5 adds comment lines above `okhslLAt`, which is now at 994. Both review pins read 994. The leg's intent, that the pin names the line `okhslLAt` is on, still holds.

Reading each comment against its code:
- `paletteStopsAnchored`: stops render at `resolvedHue + shift * dir`. `resolvedHue` is `seedHue` except under `oklch`, where it is solved per stop. `maxc500` is read at `anchor.lstar` (`:800`), but when clamped, stop 500 renders at `anchorLerp(pivotTone, ...)` and `pivotTone` clamps to `RAMP_L_MIN`/`RAMP_L_MAX` (`:789`). The comment is therefore scoped to hue, and the tone gap is named.
- `paletteStops`: the OKLCH solve runs once at stop 500 and sets `baseHue`, the hue all three ceilings are read at, so that site says edge rotation only.

L1: `git log --follow --oneline -- .sdlc/reviews/chroma-floor-U4-review.md` reaches `a28b9b22`. The count is `2` in `.sdlc/reviews` (pass 1 moved, plus review p2).

~~~sh ran
sh cmds.sh   # at 5327c23a, then 8407e256, a28b9b22, d1db4b04 in `git clone --shared` checkouts; no line truncated
/usr/bin/grep -n 'export function okhslLAt' src/engine/tonal.js
/usr/bin/grep -no 'src/engine/tonal.js:9[0-9][0-9]' docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md
ls .sdlc/verdicts | /usr/bin/grep -c 'chroma-floor-U4-review'; ls .sdlc/reviews | /usr/bin/grep -c 'chroma-floor-U4-review'
for c in EVEN_DIP_BASELINE LONE_SPIKE_ALLOW DEFAULT_KIT_SPIKE_FINDING; do git grep -c "const $c\b" -- src test scripts; done; echo "retired-const-end"
for c in KNOWN_BASELINE_DUP DIP_BASELINE PERCEPTUAL_DIP_BASELINE; do git grep -c "const $c\b" -- src test scripts; done
/usr/bin/grep -n 'since retired\|since-retired' test/engine/anchor.mjs test/engine/tonal.mjs src/engine/tonal.js scripts/report-preset-fidelity.mjs
/usr/bin/grep -n 'KNOWN_BASELINE_DUP\|cited neither\|anchorChromaBasis` blend' test/engine/anchor.mjs
/usr/bin/grep -n 'floorRef' src/engine/tonal.js | /usr/bin/grep -c 'hue'; /usr/bin/grep -c '#766' src/engine/tonal.js
/usr/bin/grep -n 'floorRef reads all three ceilings\|exact in hue\|exact for the rendered stops\|Not exact in tone' src/engine/tonal.js
node test/repo/verdict-frontmatter.mjs 2>&1 | tail -1
~~~

~~~out ran
# at 5327c23a
994:export function okhslLAt(lstar) {
docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md:89:src/engine/tonal.js:994
docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md:71:src/engine/tonal.js:994
0
2
retired-const-end
test/engine/tonal.mjs:1
test/engine/tonal.mjs:1
test/engine/tonal.mjs:1
test/engine/anchor.mjs:653:// (the since-retired EVEN_DIP_BASELINE's comment cited neither 2573208c nor R2; it named
scripts/report-preset-fidelity.mjs:20:// the since-retired `EVEN_DIP_BASELINE`'s `findDips` and this same file's pre-fa0264fa reading both used  -  what a
652:// (the gate the live KNOWN_BASELINE_DUP list belongs to) cite as U3's shipped chromaEnvelope shape
653:// (the since-retired EVEN_DIP_BASELINE's comment cited neither 2573208c nor R2; it named
654:// `paletteStopsAnchored`'s stop-500 pin and the `anchorChromaBasis` blend). R2
2
1
807:  // floorRef reads all three ceilings at one hue, seedHue, one reference for the whole ramp, while each
808:  // stop renders at resolvedHue plus its edge rotation (below): exact in hue at hueShift 0 on the cam16
809:  // path, an approximation under edge rotation or the OKLCH per-stop hue solve. Not exact in tone for a
941:  // floorRef reads all three ceilings at one hue, baseHue (under hueSpace oklch, the hue solved once at
943:  // rotation (below): exact for the rendered stops at hueShift 0, an approximation under edge rotation.
✓ verdict-frontmatter: verdicts 192 graded 192 bad 0, planted 2
~~~

~~~out ran
# negative control at 8407e256 (pass 2 round 1 head)
993:export function okhslLAt(lstar) {
docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md:89:src/engine/tonal.js:993
docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md:71:src/engine/tonal.js:993
0
1
retired-const-end
test/engine/tonal.mjs:1
test/engine/tonal.mjs:1
test/engine/tonal.mjs:1
test/engine/anchor.mjs:653:// as the comment of the since-retired EVEN_DIP_BASELINE also did. R2
scripts/report-preset-fidelity.mjs:20:// the since-retired `EVEN_DIP_BASELINE`'s `findDips` and this same file's pre-fa0264fa reading both used  -  what a
652:// (the gate the live KNOWN_BASELINE_DUP list belongs to) cite as U3's shipped chromaEnvelope shape,
2
1
807:  // floorRef reads all three ceilings at one hue, seedHue, one reference for the whole ramp, while each
808:  // stop renders at resolvedHue plus its edge rotation (below): exact for the rendered stops at hueShift
940:  // floorRef reads all three ceilings at one hue, baseHue (under hueSpace oklch, the hue solved once at
942:  // rotation (below): exact for the rendered stops at hueShift 0, an approximation under edge rotation.
✓ verdict-frontmatter: verdicts 192 graded 192 bad 0, planted 2
~~~

~~~out ran
# negative control at a28b9b22 (pass 1 head)
985:export function okhslLAt(lstar) {
docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md:89:src/engine/tonal.js:985
docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md:71:src/engine/tonal.js:985
1
0
retired-const-end
test/engine/tonal.mjs:1
test/engine/tonal.mjs:1
test/engine/tonal.mjs:1
test/engine/anchor.mjs:652:// KNOWN_BASELINE_DUP/EVEN_DIP_BASELINE comments (both since retired) cited as U3's shipped chromaEnvelope shape. R2
scripts/report-preset-fidelity.mjs:20:// the since-retired `EVEN_DIP_BASELINE`'s `findDips` and this same file's pre-fa0264fa reading both used  -  what a
652:// KNOWN_BASELINE_DUP/EVEN_DIP_BASELINE comments (both since retired) cited as U3's shipped chromaEnvelope shape. R2
0
0
✗ 1 verdict-frontmatter gate failure(s)
~~~

~~~out ran
# negative control at d1db4b04 (pre-U4)
985:export function okhslLAt(lstar) {
docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md:89:src/engine/tonal.js:983
docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md:71:src/engine/tonal.js:983
0
0
retired-const-end
test/engine/tonal.mjs:1
test/engine/tonal.mjs:1
test/engine/tonal.mjs:1
652:// KNOWN_BASELINE_DUP/EVEN_DIP_BASELINE comments already cite as U3's shipped chromaEnvelope shape. R2
0
0
✓ verdict-frontmatter: verdicts 192 graded 192 bad 0, planted 2
~~~
