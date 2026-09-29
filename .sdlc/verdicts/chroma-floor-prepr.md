---
kind: verdict
plan: chroma-floor
seat: verifier
pass: 2
ticket: "#701"
written: 2026-09-29
---

# Pre-PR · chroma-floor · pass 1 · 🔴 at `d1db4b04`: every gate green, but one design comment and three line pins the plan wrote are false

Closes #701

verdict: 🔴
sha: d1db4b04b1e12aadb1756b8b9c92d57be40da32b

`plan/chroma-floor` at `d1db4b04`. Every unit is merged on its own verdict: U1 🟢 at `ec618987`, U2 🟡 at `abab9003`, U3 🟡 at `bbf9c04b`, each an ancestor of the head. Prep merge `ddd22782`; revision 20 rules C12. origin/main has moved since, `.sdlc/` records only, and `git merge-tree --write-tree origin/main d1db4b04` exits `0`.

Checkers: fable is capped on this host, so reviewer-l3 and verifier-l2 stand in for reviewer-l4 and verifier-l3 under the owner's ruling at `.sdlc/questions/seat-reliability-approval.md` (`b9044bb`). An opus build's checkers are then inside its own family: U2 (l6) and U3 (l5) were opus builds.

- **Verification leg:** `chroma-floor-prepr-verifier`, verifier-l2, in shared clones under the seat's job tmp. No 🔴 row; five 🟡.
- **Review leg:** `chroma-floor-prepr-reviewer`, reviewer-l3, read-only. It ends `verdict: 🟡 PASS` (0 High, 3 Medium, 4 Low). The seat reread its Medium 1 and 2 and its Low 1 and grades them 🔴 here under the rule that false text the plan wrote is 🔴.

## The red

| id | criterion | state | evidence | negative control |
|---|---|---|---|---|
| R1 | comments true of the code | 🔴 | `test/engine/tonal.mjs:1523-1525`: `evenChroma's floorRef (src/engine/tonal.js) caps the floor's gamut reference at the anchor stop's own ceiling, so the floor never rises moving outward`. The code takes the largest ceiling among 450, 500 and 550 (`tonal.js:808`, `:936` `const floorRef = Math.max(maxc500, maxChromaInGamut(..., toneAt(450, ...)), maxChromaInGamut(..., toneAt(550, ...)))`), and `tonal.js:329-331` says the anchor-stop cap was U2 pass 1's design, retired because it `drained the far half of those ramps toward grey`. Written at `fe65e640`, not updated at revision 14 | the retired design matches the sentence; the head's code at `:808`, `:936` does not |
| R2 | line pins true at the head | 🔴 | `docs/reference/reviews/2026-08-20-reactivity/00-synthesis.md:89` and `04-context-and-messaging.md:71` cite `src/engine/tonal.js:983` for `okhslLAt`; at the head `985:export function okhslLAt(lstar) {`. The prep's C15 comment edit moved it; the prep's citation repair (`f93bda71`) re-carried `983`. `citations.mjs` rates it `NEAR` and stays green, so no gate sees it | `grep -n 'function okhslLAt' src/engine/tonal.js` prints `985` |
| R3 | line pins true at the head, and the handoff that says it checked them | 🔴 | `docs/reference/SKILL.md:95` (and `rubrics/acceptance-criteria.md:25`) pin `test/engine/tonal.mjs:722-743` for `lift-monotonic`. At the head `722-734` is the end of `ac004-greps`, the heading comment starts at `735`, and the block runs `744` to `884`. The prep handoff says the pins were `verified against the lines (heading at 301, block end at 743)` | `sed -n 744p test/engine/tonal.mjs` reads `{`, the block's opening line, one past the pinned range |
| CI | CI green on the exact head | 🔴 | `gh run list --branch plan/chroma-floor` and `gh pr list --head plan/chroma-floor` both return `[]`: no run exists to read `build-test`, `panda-smoke`, `corpus-contrast` or any `sweeps (gate:...)` leg | not applicable until a run exists |

What unblocks: correct the `tonal.mjs:1523-1525` comment to the first-step cap; re-pin `okhslLAt` to its line and `lift-monotonic` to its block; open the PR so CI runs on the new head. The fixes move files, so the next pass reruns the pair at the new head.

## Green at `d1db4b04`, to be reread at the next head

| id | criterion | state | evidence | negative control |
|---|---|---|---|---|
| P1 / C1 | `npm test`, no node_modules | 🟢 | fresh clone: `✓ all 54 test files passed`, `exit 0`, TESTS `54`, tree `0` | scrim sed: `✗ 1/54 test file(s) failed`, `exit 1` |
| BUILD | `npm ci`, `npm run build` | 🟢 | `exit 0`; `wrote figma/plugin/ui.html 4128.3 KB`; tree `0` | a syntax error planted in `tonal.js`: `SyntaxError: Unexpected token '='`, `exit 1` |
| SWEEPS | `npm run gate:sweeps` | 🟢 | seven legs, each passing, among them `pass  mode-isolation: perceptual 34e544942d500b9e peak f560f784d8a4883a match fixture` and the even-dips `PASS`; `exit 0` | per leg, the C rows below |
| C2 | lone spikes 0, no allow-list | 🟢 | `anchor-ramp lone-spike ...: 0 (expected 0, corpus 3380 anchored + default kit 16, no allow-list)` | in-gate control: `plateau-neutralised engine produced 65 spike(s)` |
| C3 | even dip gate | 🟢 | `grep -c EVEN_DIP_BASELINE` `0`; `dip-gate even rendered (anchor passed): 0 dips at stops other than 500 ... 500: 32 (notch class, Q-C, not gated here)` | pre-#701 floor: `24 off-anchor dip(s)`; at 1.6x: `381` |
| C4 | gate-path dips | 🟢 | `dip-gate even gate-path (no anchor): 0 dips`, `PASS`; greps `1`, `1`, `1`, `0`, `3` | `--floor-scale 1.6`: `120 dips`, `FAIL`, `exit 1` |
| C5 | envelope cells | 🟢 | gate path `stop 100: median 10.9% / p90 16.2%`, `900: 16.3 / 16.5`, all OK, `above 100% of stop 500: 0 OK`; perceptual and peak md5 `6e558839ee9e43217e1e2f7afc898b7b` at the head and at `282fca8d`. Reported, not barred (rendered even): `above 100% of stop 500: 502 FAIL` (base 670), C6 (v) even `1037/3764` (base 1,205) | `--gate-path --damp-amp 55`: `above 100% of stop 500: 1916 FAIL` |
| C6 | mode isolation | 🟢 | `match fixture`; the evidence run recaptured `34e544942d500b9e` / `f560f784d8a4883a` at `282fca8d` itself | OKHSL env x1.01: `FAIL  mode-isolation ... do not match`, `exit 1` |
| C7 | shape gates, one envelope | 🟢 | `anchor-ramp monotone: 0`; `distinct (25-stop) allow-list: 16 (expected 16)`; `skew-lift-okhsl`, `chroma-envelope` pass; lists `21`, `23`; greps `1`, `5` | a second `export function chromaEnvelope`: `2` |
| C8 | chroma-floor, contrast, FLOORS | 🟢 | `pass  chroma-floor`; `pass  role-contrast`; corpus contrast `PASS`; comparator: `FLOORS changed 4, down 4`, exactly the R44 set | even Warning floor raised to 9.9: `FAIL  role-contrast ... below its pinned floor 9.9:1`, `exit 1` |
| C9 | Q-D | 🟢 | hueSpace perceptual and peak bound `max OKLab dE 0.0048`; shim `HEADLESS BOOT PASS`, `(hs)` source `4` | OKHSL solve +8 degrees: `max OKLab dE 0.0616`, `FAIL`, `exit 1` |
| C10 | regenerated assets, docs list | 🟢 | gen chain `exit 0`, status `0`; 8 docs paths, all in the plan's ten | a line appended to `knowledge-01-color-engine.md` is listed |
| C11 | retired lists | 🟢 | `0`, `0`, `0`, `1`, `1`, `0`, `2` | a planted `const LONE_SPIKE_ALLOW` greps `1` |
| C12 | baseline agrees (revision 20) | 🟢 | `STALE ui.html: baseline 4130.1 KB, tree 4128.3 KB`, `STALE time test: baseline 167 to 268 s, adapter 80 to 89 s`, `stale total: 2`, `exit 1`, the same on two scratch merges of main; origin/main alone prints `stale total: 1` (time test, R53) | `all 54` to `all 55` in the baseline: `stale total: 3` |
| C13 | floor edge, drain | 🟢 | far-side dC `0.49`, `0.61`, `0.50`, `0.55`; `17 big cells of 84900` | on `fe65e640`'s engine: `13.19`, `211 big cells`, `FAIL` |
| C14 | records true of sources | 🟢 | `(a)` to `(l)` match the plan at the head, `(e)` and `(l)` re-read against main's merged files | at `7cea7c41`: the plan's control figures |
| C15 | the shoulder comment | 🟢 | `0`, `0`, `8`; the 400/600 reach first enters at `\|lift\|` `14.25`, so `about 14` holds | at `bbf9c04b`: `1`, `1`, `6` |
| RECORDS | branding, em dash, verdict frontmatter on the merge of main | 🟢 | `branding: clean (854 files scanned)`, `em-dash: clean (862 files scanned)`, `verdict-frontmatter: verdicts 197 graded 197 bad 0` | one plant each: `exit 1` |

### Findings

1. 🔴 R1, R2, R3 and CI, above.
2. 🟡 F1. `tonal.js:424-425` `stays clear of stops 400/600 at lift 0 only`: the next clause gives the true reach (`|lift|` about 14), so a careful reader lands right, but `only` reads as if lift 5 already enters.
3. 🟡 F2 (plan). C14 (e) pins `.sdlc/baseline.md:33`; after the merge of main the row is at `:35`. C3's `exactly one line` now matches 3 (the two control lines share the prefix). The parity table's `(16.3 and 10.9 today)` swaps the 100 and 900 medians (gate path: 100 is 10.9, 900 is 16.3).
4. 🟡 F3. The mode-isolation fixture fingerprints the curated corpus as well as the engine (`mode-isolation-gate.mjs:40-58`), but its header and `owner` name only an engine leak: the next palette-content PR will red `sweeps` with a false diagnosis.
5. 🟡 F4. History comments still name the retired constants in the present tense (`tonal.js:409-410`, `report-preset-fidelity.mjs:20`, `anchor.mjs:652`); `floorRef` is taken at the base or seed hue while stops render at a shifted or solved hue (`tonal.js:936`, `:946`), exact only at hueShift 0 on cam16.
6. Note. Five plan commits carry no `Co-Authored-By` trailer; the squash replaces them.

## Pass 2 · 🔴 at `38bd0dea`: every gate and CI job green, one false import credit on a line U4 rewrote

verdict: 🔴
sha: 38bd0dead3486402874af89b090e7b91b200ec6a

`plan/chroma-floor` at `38bd0dea`, the Orchestrator's merge of origin/main fc1de3fd into `7ea6e451`. The merge touches `.sdlc/` only: `git diff --stat 7ea6e451 38bd0dea -- . ':!.sdlc'` is empty, and `git merge-tree --write-tree 7ea6e451 fc1de3fd` equals `38bd0dea^{tree}`, so the code rows graded at `7ea6e451` hold at `38bd0dea`; C12 and RECORDS were rerun on a superset merge with main 79aadcda. U4 is merged on its own verdict, 🟡 at `dd356ad0`. PR #765 reads `MERGEABLE`, `CLEAN`, draft; `git merge-tree --write-tree 38bd0dea origin/main` exits `0`.

Checkers: the same `b9044bb` stand-ins as pass 1 (reviewer-l3 for reviewer-l4, verifier-l2 for verifier-l3), fable capped. U4 (l7) was an opus build, so its checkers sit inside its family too.

### Red

| id | criterion | state | evidence | negative control |
|---|---|---|---|---|
| H1 | comments U4 rewrote are true | 🔴 | `test/engine/anchor.mjs:651` at `38bd0dea` reads `the same fix this file's \`anchorChromaBasis\` import and tonal.mjs's C6 gate`. The file imports no `anchorChromaBasis`: `grep -n "^import"` lists `:36-44`, and `:39` takes `effHue, paletteStops, DEFAULT_CONTROLS, RAMP_L_MIN, RAMP_L_MAX, STOPS, ACHROMATIC_ANCHOR_C`; the import-line count of `anchorChromaBasis` is `0`, and its four hits (`:505`, `:651`, `:654`, `:709`) are all comments. The phrase dates from 8ba4bee4, but U4 rewrote this sentence to make its attributions true, so it is the unit's text. My U4 pass 2 verdict graded this span 🟢 in its F4 row and missed it; this record corrects that | the same stream with `anchorChromaBasis` planted into the `:39` import prints `1` |

### Green

| id | criterion | state | evidence | negative control |
|---|---|---|---|---|
| P1 | `npm test`, fresh clone, no node_modules | 🟢 | `✓ all 54 test files passed`, `exit 0`, TESTS `54`, tree `0` | scrim sed on role-table: `FAIL  refs-canonical`, `✗ 1/54 test file(s) failed`, `exit 1` |
| BUILD | `npm ci`, `npm run build` | 🟢 | both `exit 0`, `wrote figma/plugin/ui.html 4130.1 KB`, tree `0` | `const = ;` in `tonal.js`: `SyntaxError: Unexpected token '='`, `exit 1` |
| SWEEPS | `npm run gate:sweeps` | 🟢 | seven legs green, among them `pass  mode-isolation: perceptual 34e544942d500b9e peak f560f784d8a4883a match fixture` and even-dips `PASS`, `exit 0` | per C row, as pass 1 |
| C1, C3 to C11, C13, C15 | plan criteria | 🟢 | as pass 1, rerun at `7ea6e451`: C3 `0 dips at stops other than 500`; C4 `gate-path (no anchor): 0 dips`; C6 fixture match; C8 `FLOORS changed 4, down 4`, the R44 set; C13 `17 big cells of 84900`; C15 `tonal.js:424-426` with first entry at lift `14.25` | C4 `--floor-scale 1.6`: `120 dips`, `FAIL`; C6 `s` x1.01: `do not match fixture`, `exit 1`; C8 Warning at 9.9: `below its pinned floor 9.9:1`; C13 on `fe65e640`: `211 big cells`, `FAIL` |
| C12 | baseline agrees, revision 20 | 🟢 | head and scratch merge alike: `ok    tests: baseline 54, test/run.mjs TESTS 54`, the only STALE `time test`, `stale total: 1` | TESTS +1: `stale total: 2` |
| R1 | floorRef comment | 🟢 | `tonal.mjs:1523-1526` names the largest ceiling among stops 450, 500 and 550, matching `tonal.js:813` and `:945` | at `d1db4b04`: `caps the floor's gamut reference at the anchor stop's own ceiling` |
| R2 | okhslLAt cites | 🟢 | `994:export function okhslLAt(lstar) {`; both docs cite `tonal.js:994`, audit `OK` | at `d1db4b04`: function at `985`, cites `983` |
| R3 | lift-monotonic pins | 🟢 | `SKILL.md:95` and `acceptance-criteria.md:25` pin `tonal.mjs:735-884`, audit `OK`, no `NEAR` on a tonal cite | at `d1db4b04`: pins `722-743` |
| RECORDS | branding, em-dash, verdict frontmatter | 🟢 | `branding: clean (863 files scanned)`, `em-dash: clean (871 files scanned)`, `verdicts 201 graded 201 bad 0` | one plant each, all `exit 1` |
| UNITS | every unit merged on its verdict | 🟢 | U1 `🟢` `ec618987`, U2 `🟡` `abab9003`, U3 `🟡` `bbf9c04b`, U4 `🟡` `dd356ad0`, each an ancestor of `38bd0dea` | U4 pass 1 read `🔴 a28b9b22` |
| CI | required jobs on the exact head | 🟢 | run `36544987275` on `38bd0dea`: `build-test success`, `panda-smoke success`, `corpus-contrast success`, `sweeps (gate:corpus-anchor) success`, `sweeps (gate:corpus-tonal) success`, `sweeps (gate:mode-isolation) success`, `sweeps (gate:sweep-prime) success`, `sweeps (gate:even-dips) success`, `sweeps (gate:corpus-reset) success`, `sweeps (gate:corpus-contrast) success`, `deploy skipped` | runs `e10aa5d1` and `d1db4b04` read `cancelled`, and `7ea6e451` has no run: a head without a completed run is not graded green |

### Findings

1. 🔴 H1 above. The fix is comment-only; no generated asset carries anchor.mjs.
2. 🟡 C2 (plan text): Expected says `grep -cE 'lone-spike'` reads `1`; the leg prints `2`, the second line being U1's in-gate control (`plateau-neutralised engine produced 65 spike(s)`). The gate itself is right.
3. 🟡 C14 (plan text): (e) still says `33p` where the row sits at `:35`; (j) reads `3`, U4's reviews in the ruled `.sdlc/reviews/` home; (l) reads `167` because the diff from `27c513c1` spans main merges. None is product text.
4. 🟡 Review Lows: `tonal.js:327-328` states the 450/550 cap equals the stop's own ceiling with no hue condition, where both call sites qualify it; the `okhsl-modes` pin `tonal.mjs:301-319` stops short of `:322-327`; `mode-isolation-gate.mjs:21-23` scopes `--capture` narrower than its header and `owner`; `tonal.mjs:1526` "so the valley cannot form" reads as a guarantee.
5. 🟡 Pass 1 L4 carries: five pre-U4 commits lack `Co-Authored-By`, so the squash body must carry the trailer.
6. Pass 1's F1 to F4 and R1 to R3 are cleared at this head.
