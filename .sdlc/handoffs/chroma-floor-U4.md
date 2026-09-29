# Handoff chroma-floor U4 · builder to orchestrator (pass 2, #701)

| Field | Value |
|---|---|
| Branch | `unit/cf-U4`, `plan/chroma-floor` @ 30feb979 (revision 22) merged in at 2b33ad5c, code commit 3fdd0712 |
| Files | `test/engine/anchor.mjs` (652-653: `KNOWN_BASELINE_DUP` live, only `EVEN_DIP_BASELINE` since-retired), `src/engine/tonal.js` (F5: both `floorRef` comments name the hue and the approximation, `#766` once at the anchored site), `docs/reference/reviews/2026-08-20-reactivity/{00-synthesis,04-context-and-messaging}.md` (R2 pin 985 to 993), `.sdlc/verdicts/chroma-floor-U4-review.md` moved by `git mv` to `.sdlc/reviews/` (R100, no rewrite), regenerated `figma/plugin/ui.html` and `src/ui/describe-mcp-assets.js` (comment bytes only) |
| Ran | the block below at 3fdd0712 and the controls at a28b9b22 and d1db4b04; `node test/repo/citations.mjs` 🟢 STALE 0, the three pins `OK` in `scripts/audit-citations.mjs`, no new NEAR; `npm test` at the final HEAD, the commit after this handoff (result in the report to the Orchestrator, not here, since this file is in that commit) |
| Left out | build and smoke (no build-chain change); the `floorRef` behaviour question (read at each stop's rendered hue) stays deferred to #766, no engine line changed; `.sdlc/board.md` untouched |

🟡 One criterion value moved. L4 expects `tonal.js:985` on both review lines. F5 adds four comment lines before `okhslLAt` at the anchored site and four at the `paletteStops` site, so `okhslLAt` moved from 985 to 993 and both reviews now pin 993 (`citations.mjs` reds at 985 on this tree). The leg's intent, the pin names the line `okhslLAt` is on, holds; the literal is 993. The R3 pins (`test/engine/tonal.mjs:735-884`) are in a file this pass does not touch.

Reading each comment against its code: at `paletteStopsAnchored` the stop hue is `resolvedHue + shift * dir`, and `resolvedHue` is `seedHue` unless `hueSpace` is `oklch`, where `solveCam16Hue` runs per stop, so exact at hueShift 0 on cam16 only. At `paletteStops` the OKLCH solve runs once at stop 500 and sets `baseHue`, the same hue the ceilings are read at, so that site is exact at hueShift 0 in both hue spaces and its comment says edge rotation only.

L1 history: `git log --follow --oneline -- .sdlc/reviews/chroma-floor-U4-review.md` prints `3fdd0712` then `a28b9b22`. At 3fdd0712 `.sdlc/reviews` holds 1 U4 record; the reviewer's `-review-p2.md` makes it 2.

~~~sh ran
sh cmds.sh   # at 3fdd0712, then a28b9b22 and d1db4b04 in `git clone --shared` checkouts; no line truncated
/usr/bin/grep -n 'export function okhslLAt' src/engine/tonal.js
/usr/bin/grep -no 'src/engine/tonal.js:9[0-9][0-9]' docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md docs/reference/reviews/2026-08-20-reactivity/04-context-and-messaging.md
ls .sdlc/verdicts | /usr/bin/grep -c 'chroma-floor-U4-review'; ls .sdlc/reviews | /usr/bin/grep -c 'chroma-floor-U4-review'
for c in EVEN_DIP_BASELINE LONE_SPIKE_ALLOW DEFAULT_KIT_SPIKE_FINDING; do git grep -c "const $c\b" -- src test scripts; done; echo "retired-const-end"
for c in KNOWN_BASELINE_DUP DIP_BASELINE PERCEPTUAL_DIP_BASELINE; do git grep -c "const $c\b" -- src test scripts; done
/usr/bin/grep -n 'since retired\|since-retired' test/engine/anchor.mjs test/engine/tonal.mjs src/engine/tonal.js scripts/report-preset-fidelity.mjs
/usr/bin/grep -n 'KNOWN_BASELINE_DUP' test/engine/anchor.mjs
/usr/bin/grep -n 'floorRef' src/engine/tonal.js | /usr/bin/grep -c 'hue'; /usr/bin/grep -c '#766' src/engine/tonal.js
/usr/bin/grep -n 'floorRef reads all three ceilings' src/engine/tonal.js
node test/repo/verdict-frontmatter.mjs 2>&1 | tail -1
~~~

~~~out ran
# at 3fdd0712
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
940:  // floorRef reads all three ceilings at one hue, baseHue (under hueSpace oklch, the hue solved once at
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
